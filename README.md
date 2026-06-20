# SpokenPro Logistics Dashboard

**Live Demo:** [https://spokenpro-assignment.vercel.app](https://spokenpro-assignment.vercel.app)

Hey! This is my submission for the Full Stack Dashboard + API Integration assignment (Candidate A).

I built out a mini Logistics Intelligence Dashboard to track orders, couriers, and RTO risk scores. It's built as a full-stack Next.js application, so the frontend and backend APIs are all contained in one place.

## Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (using Prisma ORM)
- **Bonus:** Upstash Redis (for API caching) and Docker

## Features Implemented
- Full orders table with all the required fields (Order ID, Customer Name, Phone, COD Amount, Courier Partner, Status, RTO Risk Score).
- API integration with GET, POST, and PATCH routes to handle the data.
- Filters working for status, courier, and risk score. I also added a global search bar for customer name and phone number.
- Dashboard stats (Total Orders, Delivered, RTO%, COD Pending) calculate dynamically from the entire database via a custom `/api/stats` endpoint.
- Redis caching layer on the API routes to keep responses fast, with cache invalidation when new orders are created or updated.

## How to run locally

If you want to run the Next.js app manually:
1. Clone the repo
2. Run `npm install`
3. Add a `.env` file with your `DATABASE_URL` and Upstash Redis keys.
4. Run `npx prisma generate` to set up the client.
5. Run `npm run dev` and open `localhost:3000`.

### Running with Docker (Bonus)
I also added a docker-compose setup if that's easier to test:
```bash
docker-compose up --build
```
This will spin up the Next.js app, a local Postgres database, and a local Redis instance automatically.

Let me know if you run into any issues getting it to run!
