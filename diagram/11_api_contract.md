# API Contract

## GET Orders
`GET /api/orders`

**Parameters:**
- `page`
- `limit`
- `status`
- `courier`
- `risk`
- `search`

**Example:** `/api/orders?page=1&limit=20`

## POST Order
`POST /api/orders`
```json
{
  "customerName": "Ayush",
  "phone": "9876543210",
  "courierId": "1",
  "codAmount": 1200
}
```

## PATCH Order
`PATCH /api/orders/:id`
```json
{
  "status": "DELIVERED"
}
```
