-- ================================================================
-- Shiprocket Integration Schema
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Add Shiprocket fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;

-- 2. Add weight/dimensions to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight NUMERIC DEFAULT 0.5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length NUMERIC DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS breadth NUMERIC DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height NUMERIC DEFAULT 10;

-- 3. Shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    shiprocket_order_id TEXT,
    shipment_id TEXT,
    courier_name TEXT,
    awb_code TEXT,
    status TEXT DEFAULT 'NEW',
    estimated_delivery TIMESTAMPTZ,
    pickup_date TIMESTAMPTZ,
    delivered_date TIMESTAMPTZ,
    shipping_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tracking updates table
CREATE TABLE IF NOT EXISTS tracking_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    activity TEXT,
    location TEXT,
    sr_status TEXT,
    sr_status_label TEXT,
    event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Pincode serviceability cache (6-hour TTL)
CREATE TABLE IF NOT EXISTS pincode_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_pincode TEXT NOT NULL,
    delivery_pincode TEXT NOT NULL,
    weight NUMERIC DEFAULT 0.5,
    cod BOOLEAN DEFAULT false,
    response_data JSONB NOT NULL,
    cached_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(pickup_pincode, delivery_pincode, weight, cod)
);

-- 6. Return requests table
CREATE TABLE IF NOT EXISTS return_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    refund_method TEXT NOT NULL DEFAULT 'original', -- 'original', 'upi', 'bank_transfer'
    refund_details JSONB, -- UPI ID, bank account details etc.
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected, Completed
    admin_notes TEXT,
    shiprocket_return_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Cancellation requests table
CREATE TABLE IF NOT EXISTS cancellation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    refund_method TEXT DEFAULT 'original',
    refund_details JSONB,
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected, Refunded
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_awb_code ON shipments(awb_code);
CREATE INDEX IF NOT EXISTS idx_tracking_updates_order_id ON tracking_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_tracking_updates_shipment_id ON tracking_updates(shipment_id);
CREATE INDEX IF NOT EXISTS idx_pincode_cache_lookup ON pincode_cache(pickup_pincode, delivery_pincode, weight, cod);
CREATE INDEX IF NOT EXISTS idx_pincode_cache_ttl ON pincode_cache(cached_at);
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_order_id ON cancellation_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_awb ON orders(awb_code);
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_order_id ON orders(shiprocket_order_id);

-- 9. RLS Policies

-- Shipments: users can read their own shipments
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shipments" ON shipments
    FOR SELECT USING (
        order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    );

CREATE POLICY "Service role full access shipments" ON shipments
    FOR ALL USING (auth.role() = 'service_role');

-- Tracking updates: users can read their own
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tracking" ON tracking_updates
    FOR SELECT USING (
        order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    );

CREATE POLICY "Service role full access tracking" ON tracking_updates
    FOR ALL USING (auth.role() = 'service_role');

-- Pincode cache: public read (it's just cached shipping data)
ALTER TABLE pincode_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pincode cache" ON pincode_cache
    FOR SELECT USING (true);

CREATE POLICY "Service role full access pincode_cache" ON pincode_cache
    FOR ALL USING (auth.role() = 'service_role');

-- Return requests: users can view + create their own
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own returns" ON return_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create returns" ON return_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role full access returns" ON return_requests
    FOR ALL USING (auth.role() = 'service_role');

-- Cancellation requests: users can view + create their own
ALTER TABLE cancellation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cancellations" ON cancellation_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create cancellations" ON cancellation_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role full access cancellations" ON cancellation_requests
    FOR ALL USING (auth.role() = 'service_role');

-- 10. Add Shiprocket settings to site_config
INSERT INTO site_config (key, value, description) VALUES
    ('shiprocket_enabled', 'true', 'Master toggle for Shiprocket integration'),
    ('shiprocket_pincode_check', 'true', 'Enable pincode serviceability check on product pages'),
    ('shiprocket_rate_calculation', 'true', 'Enable dynamic shipping rate calculation at checkout'),
    ('shiprocket_auto_order', 'true', 'Automatically create Shiprocket orders on confirmation'),
    ('shiprocket_tracking', 'true', 'Enable order tracking on customer order page'),
    ('shiprocket_pickup_pincode', '110001', 'Warehouse/pickup pincode for rate calculations'),
    ('shiprocket_default_weight', '0.5', 'Default product weight in kg when not specified'),
    ('shiprocket_fixed_shipping_fee', '50', 'Fixed shipping fee when dynamic rates are disabled'),
    ('shiprocket_free_shipping_threshold', '999', 'Free shipping for orders above this amount')
ON CONFLICT (key) DO NOTHING;
