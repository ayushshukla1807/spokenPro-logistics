import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/seed - seed initial courier and order data
export async function POST() {
  try {
    // Upsert couriers
    const couriers = [
      { name: "Delhivery", code: "DELHIVERY" },
      { name: "BlueDart", code: "BLUEDART" },
      { name: "Xpressbees", code: "XPRESSBEES" },
    ];

    for (const c of couriers) {
      await prisma.courier.upsert({
        where: { code: c.code },
        update: {},
        create: c,
      });
    }

    const delhivery = await prisma.courier.findUnique({ where: { code: "DELHIVERY" } });
    const bluedart = await prisma.courier.findUnique({ where: { code: "BLUEDART" } });
    const xpressbees = await prisma.courier.findUnique({ where: { code: "XPRESSBEES" } });

    // Seed sample customers + orders
    const samples = [
      { name: "Ayush Shukla", phone: "9876543210", courier: delhivery!, cod: 1500, status: "IN_TRANSIT", risk: 45 },
      { name: "Alice Smith", phone: "9988776655", courier: bluedart!, cod: 2200, status: "CREATED", risk: 85 },
      { name: "Bob Jones", phone: "7766554433", courier: xpressbees!, cod: 850, status: "DELIVERED", risk: 12 },
      { name: "Priya Mehta", phone: "9123456789", courier: delhivery!, cod: 3500, status: "OUT_FOR_DELIVERY", risk: 60 },
      { name: "Rahul Verma", phone: "8877665544", courier: bluedart!, cod: 999, status: "PICKED_UP", risk: 30 },
    ];

    for (const s of samples) {
      let customer = await prisma.customer.findUnique({ where: { phone: s.phone } });
      if (!customer) {
        customer = await prisma.customer.create({ data: { name: s.name, phone: s.phone } });
      }
      const existing = await prisma.order.findFirst({ where: { customerId: customer.id } });
      if (!existing) {
        const order = await prisma.order.create({
          data: {
            customerId: customer.id,
            courierId: s.courier.id,
            codAmount: s.cod,
            status: s.status,
            rtoRiskScore: s.risk,
          },
        });
        await prisma.orderStatusHistory.create({
          data: { orderId: order.id, newStatus: s.status },
        });
      }
    }

    return NextResponse.json({ message: "Database seeded successfully!" });
  } catch (error) {
    console.error("[POST /api/seed]", error);
    return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
  }
}
