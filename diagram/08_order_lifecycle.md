# Order Lifecycle Diagram

```mermaid
stateDiagram-v2
    [*] --> CREATED
    CREATED --> PICKED_UP
    PICKED_UP --> IN_TRANSIT
    IN_TRANSIT --> OUT_FOR_DELIVERY
    OUT_FOR_DELIVERY --> DELIVERED
    OUT_FOR_DELIVERY --> FAILED_ATTEMPT
    FAILED_ATTEMPT --> RTO
    DELIVERED --> [*]
    RTO --> [*]
```
