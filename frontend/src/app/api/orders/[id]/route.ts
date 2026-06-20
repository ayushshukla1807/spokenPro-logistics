import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = (redisUrl && redisToken) ? new Redis({ url: redisUrl, token: redisToken }) : null;

// PATCH /api/orders/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Missing required field: status" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { customer: true, courier: true },
    });

    await prisma.orderStatusHistory.create({
      data: { orderId: id, oldStatus: existingOrder.status, newStatus: status },
    });

    // Invalidate cache
    if (redis) {
      console.log("[CACHE INVALIDATE] Order updated, clearing keys matching 'orders:*' and 'dashboard:stats'");
      const keys = await redis.keys('orders:*');
      if (keys && keys.length > 0) {
        await redis.del(...keys, 'dashboard:stats');
      } else {
        await redis.del('dashboard:stats');
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[PATCH /api/orders/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
