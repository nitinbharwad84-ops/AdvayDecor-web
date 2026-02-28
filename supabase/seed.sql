-- AdvayDecor Mock Seed Data
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- This inserts sample products, variants, images, and orders for testing.

-- ============================================
-- 1. HELPERS: GET CATEGORY IDS
-- ============================================
-- (We'll use fixed UUIDs for simplicity in this seed file)
-- Cushion ID: c0000000-0000-0000-0000-000000000001
-- Frame ID:   f0000000-0000-0000-0000-000000000002

INSERT INTO categories (id, name, slug, description) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Cushion', 'cushion', 'Decorative cushions and pillows'),
  ('f0000000-0000-0000-0000-000000000002', 'Frame', 'frame', 'Photo frames and wall art')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================
-- 2. PRODUCTS
-- ============================================
INSERT INTO products (id, title, slug, description, base_price, category_id, has_variants, is_active) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Multicolor Flower Cushion', 'multicolor-flower-cushion', 'A vibrant, hand-stitched floral cushion that brings a burst of color to any room.', 999, 'c0000000-0000-0000-0000-000000000001', TRUE, TRUE),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Bohemian Tasseled Cushion', 'bohemian-tasseled-cushion', 'Embrace bohemian chic with this beautifully tasseled cushion cover.', 799, 'c0000000-0000-0000-0000-000000000001', TRUE, TRUE),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Rustic Wooden Frame', 'rustic-wooden-frame', 'Handcrafted solid oak frame with a vintage finish. Perfect for family portraits or travel photography.', 1299, 'f0000000-0000-0000-0000-000000000002', TRUE, TRUE),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Velvet Royal Cushion', 'velvet-royal-cushion', 'Indulge in luxury with our velvet royal cushion. Features sumptuous velvet fabric.', 1499, 'c0000000-0000-0000-0000-000000000001', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. VARIANTS
-- ============================================
INSERT INTO product_variants (id, parent_product_id, variant_name, sku, price, stock_quantity) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Red', 'CUSH-FLR-RED', 999, 12),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'Blue', 'CUSH-FLR-BLU', 1099, 3),
  ('b1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0003-4000-8000-000000000003', 'Classic Oak', 'FRM-WD-OAK', 1299, 10),
  ('b1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0003-4000-8000-000000000003', 'Dark Walnut', 'FRM-WD-WLN', 1399, 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. IMAGES
-- ============================================
INSERT INTO product_images (id, product_id, image_url, display_order) VALUES
  ('c1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80', 0),
  ('c1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80', 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. ORDERS
-- ============================================
INSERT INTO orders (id, user_id, guest_info, status, total_amount, shipping_fee, shipping_address, payment_method, created_at) VALUES
  ('d1b2c3d4-0001-4000-8000-000000000001', NULL, '{"name": "Priya Sharma", "email": "priya@example.com", "phone": "+91 98765 43210"}', 'Pending', 1049, 50, '{"full_name": "Priya Sharma", "phone": "+91 98765 43210", "address_line1": "123, MG Road", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}', 'COD', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Verify setup
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Products: ' || COUNT(*) FROM products;
SELECT 'Site Config: ' || COUNT(*) FROM site_config;
