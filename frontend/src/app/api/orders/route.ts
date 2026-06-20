import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = (redisUrl && redisToken) ? new Redis({ url: redisUrl, token: redisToken }) : null;

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const status = searchParams.get("status");
    const courier = searchParams.get("courier");
    const risk = searchParams.get("risk");

    // Cache key based on query params
    const cacheKey = `orders:${page}:${limit}:${status || 'all'}:${courier || 'all'}:${risk || 'all'}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[CACHE HIT] Returning data for ${cacheKey}`);
        return NextResponse.json(cached);
      }
    }

    const take = limit;
    const skip = (page - 1) * take;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (courier) where.courier = { code: courier };
    if (risk === "HIGH") where.rtoRiskScore = { gte: 80 };
    else if (risk === "MEDIUM") where.rtoRiskScore = { gte: 40, lt: 80 };
    else if (risk === "LOW") where.rtoRiskScore = { lt: 40 };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take,
        skip,
        include: { customer: true, courier: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    const result = {
      data: orders,
      meta: { total, page, limit: take, totalPages: Math.ceil(total / take) },
    };

    if (redis) {
      console.log(`[CACHE MISS] Saving data for ${cacheKey}`);
      // Cache for 60 seconds
      await redis.setex(cacheKey, 60, result);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json(
      { error: "Database not reachable." },
      { status: 503 }
    );
  }
}

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phone, courierId: courierCode, codAmount } = body;

    if (!customerName || !phone || !courierCode || !codAmount) {
      return NextResponse.json(
        { error: "Missing required fields: customerName, phone, courierId, codAmount" },
        { status: 400 }
      );
    }

    const courier = await prisma.courier.findUnique({ where: { code: courierCode } });
    if (!courier) {
      return NextResponse.json(
        { error: `Courier with code "${courierCode}" not found. Please seed the database first.` },
        { status: 404 }
      );
    }

    let customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: customerName, phone },
      });
    }

    const rtoRiskScore = Math.floor(Math.random() * 100);
    const status = "CREATED";

    const order = await prisma.order.create({
      data: { customerId: customer.id, courierId: courier.id, codAmount, status, rtoRiskScore },
      include: { customer: true, courier: true },
    });

    await prisma.orderStatusHistory.create({
      data: { orderId: order.id, newStatus: status },
    });

    // Invalidate cache
    if (redis) {
      console.log("[CACHE INVALIDATE] Order created, clearing keys matching 'orders:*' and 'dashboard:stats'");
      const keys = await redis.keys('orders:*');
      if (keys && keys.length > 0) {
        await redis.del(...keys, 'dashboard:stats');
      } else {
        await redis.del('dashboard:stats');
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
