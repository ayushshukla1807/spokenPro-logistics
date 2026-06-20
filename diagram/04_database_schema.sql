-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    phone VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Couriers
CREATE TABLE couriers (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    code VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    courier_id UUID REFERENCES couriers(id),
    cod_amount NUMERIC(10,2),
    status VARCHAR(50),
    rto_risk_score INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Status History
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_at TIMESTAMP DEFAULT NOW()
);
