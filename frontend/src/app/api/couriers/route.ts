import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/couriers - for seeding/listing couriers
export async function GET() {
  try {
    const couriers = await prisma.courier.findMany({ where: { isActive: true } });
    return NextResponse.json(couriers);
  } catch (error) {
    console.error("[GET /api/couriers]", error);
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
}
