# Scalability Section

## Current Assignment Scale
- 10K Orders
- 100 Requests/sec

## Future Scale
- 10M Orders
- 5000 Requests/sec

## Enhancements:
- **Redis Cache:** To offload read-heavy requests (e.g., stats, filtering).
- **Read Replicas:** Scale database read performance.
- **Postgres Partitioning:** Partition large tables (like orders) by date/status.
- **Load Balancer:** Distribute traffic across multiple API instances.
- **Horizontal API Scaling:** Add more API server nodes as load increases.
- **Docker Containers:** Containerize the application for easier orchestration (e.g., Kubernetes).
