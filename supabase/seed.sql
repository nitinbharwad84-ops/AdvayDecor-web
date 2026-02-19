-- AdvayDecor Mock Seed Data
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- This inserts sample products, variants, images, and orders for testing.

-- ============================================
-- PRODUCTS
-- ============================================
INSERT INTO products (id, title, slug, description, base_price, category, has_variants, is_active) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Multicolor Flower Cushion', 'multicolor-flower-cushion', 'A vibrant, hand-stitched floral cushion that brings a burst of color to any room. Crafted with 100% premium cotton, this cushion features intricate embroidery inspired by traditional Indian flora. The rich blend of oranges, purples, and greens creates a warm, inviting atmosphere perfect for living rooms and bedrooms.', 999, 'Cushion', TRUE, TRUE),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Bohemian Tasseled Cushion', 'bohemian-tasseled-cushion', 'Embrace bohemian chic with this beautifully tasseled cushion cover. Handwoven with natural cotton fibers and adorned with playful tassels, it adds texture and bohemian flair to any seating arrangement.', 799, 'Cushion', TRUE, TRUE),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Geometric Art Deco Cushion', 'geometric-art-deco-cushion', 'A sophisticated cushion featuring bold geometric patterns inspired by Art Deco design. The striking gold and navy pattern commands attention while maintaining elegance. Made from high-quality, machine-washable cotton.', 1199, 'Cushion', FALSE, TRUE),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Velvet Royal Cushion', 'velvet-royal-cushion', 'Indulge in luxury with our velvet royal cushion. This opulent piece features sumptuous velvet fabric in rich, regal tones with delicate piped edges.', 1499, 'Cushion', TRUE, TRUE),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Minimalist Linen Cushion', 'minimalist-linen-cushion', 'Simplicity at its finest. This minimalist linen cushion brings quiet sophistication to any space with its clean lines and natural texture.', 699, 'Cushion', TRUE, TRUE),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Tropical Palm Cushion', 'tropical-palm-cushion', 'Bring the tropics home with our vibrant palm-print cushion. Featuring bold palm fronds in lush greens on a crisp white background.', 899, 'Cushion', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
INSERT INTO product_variants (id, parent_product_id, variant_name, sku, price, stock_quantity) VALUES
  -- Multicolor Flower Cushion variants
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Red', 'CUSH-FLR-RED', 999, 12),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'Blue', 'CUSH-FLR-BLU', 1099, 3),
  ('b1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001', 'Green', 'CUSH-FLR-GRN', 999, 8),
  -- Bohemian Tasseled Cushion variants
  ('b1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0002-4000-8000-000000000002', 'Natural', 'CUSH-BOH-NAT', 799, 15),
  ('b1b2c3d4-0005-4000-8000-000000000005', 'a1b2c3d4-0002-4000-8000-000000000002', 'Charcoal', 'CUSH-BOH-CHA', 849, 7),
  -- Velvet Royal Cushion variants
  ('b1b2c3d4-0006-4000-8000-000000000006', 'a1b2c3d4-0004-4000-8000-000000000004', 'Emerald', 'CUSH-VLV-EMR', 1499, 2),
  ('b1b2c3d4-0007-4000-8000-000000000007', 'a1b2c3d4-0004-4000-8000-000000000004', 'Ruby', 'CUSH-VLV-RBY', 1499, 6),
  ('b1b2c3d4-0008-4000-8000-000000000008', 'a1b2c3d4-0004-4000-8000-000000000004', 'Sapphire', 'CUSH-VLV-SAP', 1599, 0),
  -- Minimalist Linen Cushion variants
  ('b1b2c3d4-0009-4000-8000-000000000009', 'a1b2c3d4-0005-4000-8000-000000000005', 'Oat', 'CUSH-LIN-OAT', 699, 20),
  ('b1b2c3d4-0010-4000-8000-000000000010', 'a1b2c3d4-0005-4000-8000-000000000005', 'Sage', 'CUSH-LIN-SAG', 699, 18)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRODUCT IMAGES
-- ============================================
INSERT INTO product_images (id, product_id, variant_id, image_url, display_order) VALUES
  -- Multicolor Flower Cushion images
  ('c1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', NULL, 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80', 0),
  ('c1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', NULL, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80', 1),
  ('c1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001', NULL, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 2),
  ('c1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000001', NULL, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', 3),
  -- Bohemian Tasseled Cushion images
  ('c1b2c3d4-0005-4000-8000-000000000005', 'a1b2c3d4-0002-4000-8000-000000000002', NULL, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80', 0),
  ('c1b2c3d4-0006-4000-8000-000000000006', 'a1b2c3d4-0002-4000-8000-000000000002', NULL, 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80', 1),
  -- Geometric Art Deco images
  ('c1b2c3d4-0007-4000-8000-000000000007', 'a1b2c3d4-0003-4000-8000-000000000003', NULL, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 0),
  ('c1b2c3d4-0008-4000-8000-000000000008', 'a1b2c3d4-0003-4000-8000-000000000003', NULL, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', 1),
  -- Velvet Royal images
  ('c1b2c3d4-0009-4000-8000-000000000009', 'a1b2c3d4-0004-4000-8000-000000000004', NULL, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', 0),
  ('c1b2c3d4-0010-4000-8000-000000000010', 'a1b2c3d4-0004-4000-8000-000000000004', NULL, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80', 1),
  -- Minimalist Linen images
  ('c1b2c3d4-0011-4000-8000-000000000011', 'a1b2c3d4-0005-4000-8000-000000000005', NULL, 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80', 0),
  -- Tropical Palm images
  ('c1b2c3d4-0012-4000-8000-000000000012', 'a1b2c3d4-0006-4000-8000-000000000006', NULL, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 0),
  ('c1b2c3d4-0013-4000-8000-000000000013', 'a1b2c3d4-0006-4000-8000-000000000006', NULL, 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ORDERS (mock guest orders — no user_id required)
-- ============================================
INSERT INTO orders (id, user_id, guest_info, status, total_amount, shipping_fee, shipping_address, payment_method, created_at) VALUES
  ('d1b2c3d4-0001-4000-8000-000000000001', NULL, '{"name": "Priya Sharma", "email": "priya@example.com", "phone": "+91 98765 43210"}', 'Pending', 2098, 50, '{"full_name": "Priya Sharma", "phone": "+91 98765 43210", "address_line1": "123, MG Road", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}', 'COD', NOW() - INTERVAL '1 day'),
  ('d1b2c3d4-0002-4000-8000-000000000002', NULL, '{"name": "Rahul Verma", "email": "rahul@example.com", "phone": "+91 87654 32109"}', 'Processing', 1499, 0, '{"full_name": "Rahul Verma", "phone": "+91 87654 32109", "address_line1": "456, Park Avenue", "city": "Delhi", "state": "Delhi", "pincode": "110001"}', 'COD', NOW() - INTERVAL '2 days'),
  ('d1b2c3d4-0003-4000-8000-000000000003', NULL, '{"name": "Anita Patel", "email": "anita@example.com", "phone": "+91 76543 21098"}', 'Shipped', 3297, 50, '{"full_name": "Anita Patel", "phone": "+91 76543 21098", "address_line1": "789, Ring Road", "city": "Ahmedabad", "state": "Gujarat", "pincode": "380001"}', 'COD', NOW() - INTERVAL '3 days'),
  ('d1b2c3d4-0004-4000-8000-000000000004', NULL, '{"name": "Vikram Singh", "email": "vikram@example.com", "phone": "+91 65432 10987"}', 'Delivered', 999, 0, '{"full_name": "Vikram Singh", "phone": "+91 65432 10987", "address_line1": "321, Civil Lines", "city": "Jaipur", "state": "Rajasthan", "pincode": "302001"}', 'COD', NOW() - INTERVAL '4 days'),
  ('d1b2c3d4-0005-4000-8000-000000000005', NULL, '{"name": "Sneha Gupta", "email": "sneha@example.com", "phone": "+91 54321 09876"}', 'Delivered', 1798, 50, '{"full_name": "Sneha Gupta", "phone": "+91 54321 09876", "address_line1": "654, Lake Road", "city": "Kolkata", "state": "West Bengal", "pincode": "700001"}', 'COD', NOW() - INTERVAL '5 days'),
  ('d1b2c3d4-0006-4000-8000-000000000006', NULL, '{"name": "Arjun Mehta", "email": "arjun@example.com", "phone": "+91 43210 98765"}', 'Cancelled', 699, 0, '{"full_name": "Arjun Mehta", "phone": "+91 43210 98765", "address_line1": "987, Brigade Road", "city": "Bangalore", "state": "Karnataka", "pincode": "560001"}', 'COD', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ORDER ITEMS
-- ============================================
INSERT INTO order_items (id, order_id, product_id, variant_id, product_title, variant_name, quantity, unit_price, total_price) VALUES
  -- Priya's order: 2 items
  ('e1b2c3d4-0001-4000-8000-000000000001', 'd1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Multicolor Flower Cushion', 'Red', 1, 999, 999),
  ('e1b2c3d4-0002-4000-8000-000000000002', 'd1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0002-4000-8000-000000000002', 'Multicolor Flower Cushion', 'Blue', 1, 1099, 1099),
  -- Rahul's order: 1 item
  ('e1b2c3d4-0003-4000-8000-000000000003', 'd1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0004-4000-8000-000000000004', 'b1b2c3d4-0006-4000-8000-000000000006', 'Velvet Royal Cushion', 'Emerald', 1, 1499, 1499),
  -- Anita's order: 3 items
  ('e1b2c3d4-0004-4000-8000-000000000004', 'd1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0003-4000-8000-000000000003', NULL, 'Geometric Art Deco Cushion', NULL, 1, 1199, 1199),
  ('e1b2c3d4-0005-4000-8000-000000000005', 'd1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0005-4000-8000-000000000005', 'b1b2c3d4-0009-4000-8000-000000000009', 'Minimalist Linen Cushion', 'Oat', 1, 699, 699),
  ('e1b2c3d4-0006-4000-8000-000000000006', 'd1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0004-4000-8000-000000000004', 'b1b2c3d4-0007-4000-8000-000000000007', 'Velvet Royal Cushion', 'Ruby', 1, 1499, 1499),
  -- Vikram: 1 item
  ('e1b2c3d4-0007-4000-8000-000000000007', 'd1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0003-4000-8000-000000000003', 'Multicolor Flower Cushion', 'Green', 1, 999, 999),
  -- Sneha: 2 items
  ('e1b2c3d4-0008-4000-8000-000000000008', 'd1b2c3d4-0005-4000-8000-000000000005', 'a1b2c3d4-0006-4000-8000-000000000006', NULL, 'Tropical Palm Cushion', NULL, 1, 899, 899),
  ('e1b2c3d4-0009-4000-8000-000000000009', 'd1b2c3d4-0005-4000-8000-000000000005', 'a1b2c3d4-0006-4000-8000-000000000006', NULL, 'Tropical Palm Cushion', NULL, 1, 899, 899),
  -- Arjun: 1 item
  ('e1b2c3d4-0010-4000-8000-000000000010', 'd1b2c3d4-0006-4000-8000-000000000006', 'a1b2c3d4-0005-4000-8000-000000000005', 'b1b2c3d4-0010-4000-8000-000000000010', 'Minimalist Linen Cushion', 'Sage', 1, 699, 699)
ON CONFLICT (id) DO NOTHING;

-- Verify counts
SELECT 'Products: ' || COUNT(*) FROM products;
SELECT 'Variants: ' || COUNT(*) FROM product_variants;
SELECT 'Images: ' || COUNT(*) FROM product_images;
SELECT 'Orders: ' || COUNT(*) FROM orders;
SELECT 'Order Items: ' || COUNT(*) FROM order_items;
SELECT 'Site Config: ' || COUNT(*) FROM site_config;
