import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = (redisUrl && redisToken) ? new Redis({ url: redisUrl, token: redisToken }) : null;

export async function GET() {
  try {
    const cacheKey = "dashboard:stats";

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return NextResponse.json(cached);
    }

    // Run aggregations in parallel
    const [totalOrders, deliveredOrders, rtoOrders, codPendingAgg] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "RTO" } }),
      prisma.order.aggregate({
        _sum: { codAmount: true },
        where: {
          status: { notIn: ["DELIVERED", "RTO"] }
        }
      })
    ]);

    const rtoPercentage = totalOrders > 0 ? ((rtoOrders / totalOrders) * 100).toFixed(1) : "0.0";
    const codPending = codPendingAgg._sum.codAmount || 0;

    const result = {
      totalOrders,
      deliveredOrders,
      rtoPercentage: `${rtoPercentage}%`,
      codPending: Number(codPending)
    };

    if (redis) {
      await redis.setex(cacheKey, 60, result);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/stats]", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
