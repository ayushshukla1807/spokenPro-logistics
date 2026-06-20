import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const app = express();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /orders
app.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, courier, risk } = req.query;
    
    // Pagination
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;
    
    // Filtering
    const where: any = {};
    if (status) where.status = status;
    if (courier) where.courier = { code: courier };
    if (risk) {
      if (risk === 'HIGH') where.rtoRiskScore = { gte: 80 };
      else if (risk === 'MEDIUM') where.rtoRiskScore = { gte: 40, lt: 80 };
      else if (risk === 'LOW') where.rtoRiskScore = { lt: 40 };
    }

    const orders = await prisma.order.findMany({
      where,
      take,
      skip,
      include: {
        customer: true,
        courier: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.order.count({ where });

    res.json({
      data: orders,
      meta: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /orders
app.post('/orders', async (req, res) => {
  try {
    const { customerName, phone, courierId, codAmount } = req.body;
    
    // Create or find customer
    let customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: customerName, phone }
      });
    }

    // Default values
    const status = 'CREATED';
    const rtoRiskScore = Math.floor(Math.random() * 100); // Mock risk score

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        courierId,
        codAmount,
        status,
        rtoRiskScore
      }
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        newStatus: status
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /orders/:id
app.patch('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        oldStatus: existingOrder.status,
        newStatus: status
      }
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
