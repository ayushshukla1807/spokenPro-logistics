# Cache Design

## Dashboard Stats
- **Key:** `dashboard:stats`
- **Content:**
  ```json
  {
    "totalOrders": 100000,
    "deliveredOrders": 85000,
    "rtoPercentage": 5,
    "codPending": 120000
  }
  ```
- **TTL:** 60 seconds

## Filter Cache
- `orders:status:DELIVERED`
- `orders:courier:DELHIVERY`
- `orders:risk:HIGH`

## Order Cache
- `order:12345`
