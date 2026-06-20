-- Without indexes:
-- SELECT * FROM orders WHERE status='DELIVERED'; (Slow)

-- Indexes Strategy:
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_courier ON orders(courier_id);
CREATE INDEX idx_order_created ON orders(created_at);
CREATE INDEX idx_order_risk ON orders(rto_risk_score);
