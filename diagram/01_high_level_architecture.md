# High-Level Architecture

```mermaid
graph TD
    NextJS["Next.js UI (Logistics Dashboard)"] -->|REST API| NodeJS["Node.js API (Express / Next API)"]
    NodeJS -->|Cache| Redis[(Redis)]
    NodeJS --> PostgreSQL[(PostgreSQL DB)]
```


