-- ===================================================
-- Add Demo Orders and Customers for Testing Dashboard
-- ===================================================

-- First, create demo customer profiles
INSERT INTO profiles (id, email, first_name, last_name, phone, role, created_at)
VALUES
  ('u1000000-0000-0000-0000-000000000001', 'ahmed.benali@email.dz', 'Ahmed', 'Benali', '0555123456', 'customer', NOW() - INTERVAL '30 days'),
  ('u2000000-0000-0000-0000-000000000002', 'sara.mohamed@email.dz', 'Sara', 'Mohamed', '0666234567', 'customer', NOW() - INTERVAL '25 days'),
  ('u3000000-0000-0000-0000-000000000003', 'karim.larbi@email.dz', 'Karim', 'Larbi', '0777345678', 'customer', NOW() - INTERVAL '20 days'),
  ('u4000000-0000-0000-0000-000000000004', 'fatima.ziani@email.dz', 'Fatima', 'Ziani', '0555456789', 'customer', NOW() - INTERVAL '15 days'),
  ('u5000000-0000-0000-0000-000000000005', 'mohamed.amari@email.dz', 'Mohamed', 'Amari', '0666567890', 'customer', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Create demo orders
INSERT INTO orders (id, user_id, status, subtotal, shipping, discount, total, shipping_address, payment_method, created_at)
VALUES
  -- Recent orders (last 2 days)
  ('o1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000001', 'processing', 7200, 500, 0, 7700, '{"address": "Cité des Roses, Alger", "city": "Alger", "phone": "0555123456"}', 'cod', NOW() - INTERVAL '2 hours'),
  ('o2000000-0000-0000-0000-000000000002', 'u2000000-0000-0000-0000-000000000002', 'shipped', 3500, 500, 0, 4000, '{"address": "Rue Didouche Mourad, Oran", "city": "Oran", "phone": "0666234567"}', 'cod', NOW() - INTERVAL '5 hours'),
  ('o3000000-0000-0000-0000-000000000003', 'u3000000-0000-0000-0000-000000000003', 'delivered', 12800, 500, 0, 13300, '{"address": "Centre Ville, Constantine", "city": "Constantine", "phone": "0777345678"}', 'cod', NOW() - INTERVAL '1 day'),
  ('o4000000-0000-0000-0000-000000000004', 'u4000000-0000-0000-0000-000000000004', 'pending', 4200, 500, 0, 4700, '{"address": "Nouvelle Ville, Annaba", "city": "Annaba", "phone": "0555456789"}', 'cod', NOW() - INTERVAL '1 day'),
  ('o5000000-0000-0000-0000-000000000005', 'u5000000-0000-0000-0000-000000000005', 'processing', 8900, 500, 0, 9400, '{"address": "Hai Essalam, Blida", "city": "Blida", "phone": "0666567890"}', 'cod', NOW() - INTERVAL '2 days'),
  
  -- Older orders (last 30 days)
  ('o6000000-0000-0000-0000-000000000006', 'u1000000-0000-0000-0000-000000000001', 'delivered', 5600, 500, 0, 6100, '{"address": "Cité des Roses, Alger", "city": "Alger", "phone": "0555123456"}', 'cod', NOW() - INTERVAL '5 days'),
  ('o7000000-0000-0000-0000-000000000007', 'u2000000-0000-0000-0000-000000000002', 'delivered', 9800, 500, 0, 10300, '{"address": "Rue Didouche Mourad, Oran", "city": "Oran", "phone": "0666234567"}', 'cod', NOW() - INTERVAL '7 days'),
  ('o8000000-0000-0000-0000-000000000008', 'u3000000-0000-0000-0000-000000000003', 'delivered', 3200, 500, 0, 3700, '{"address": "Centre Ville, Constantine", "city": "Constantine", "phone": "0777345678"}', 'cod', NOW() - INTERVAL '10 days'),
  ('o9000000-0000-0000-0000-000000000009', 'u4000000-0000-0000-0000-000000000004', 'delivered', 6700, 500, 0, 7200, '{"address": "Nouvelle Ville, Annaba", "city": "Annaba", "phone": "0555456789"}', 'cod', NOW() - INTERVAL '15 days'),
  ('oa000000-0000-0000-0000-00000000000a', 'u5000000-0000-0000-0000-000000000005', 'delivered', 11200, 500, 0, 11700, '{"address": "Hai Essalam, Blida", "city": "Blida", "phone": "0666567890"}', 'cod', NOW() - INTERVAL '20 days');

-- Create order items (linking orders to products)
INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
VALUES
  -- Order 1: 2 items
  ('o1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'La Roche-Posay Effaclar Duo+', 3200, 2),
  ('o1000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'Bioderma Sensibio H2O', 1800, 1),
  
  -- Order 2: 1 item
  ('o2000000-0000-0000-0000-000000000002', 'a7000000-0000-0000-0000-000000000007', 'CeraVe Lait Hydratant', 2500, 1),
  ('o2000000-0000-0000-0000-000000000002', 'a6000000-0000-0000-0000-000000000006', 'Klorane Shampooing à la Camomille', 1600, 1),
  
  -- Order 3: 3 items (high value)
  ('o3000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', 'Vichy Liftactiv Collagen Specialist', 4800, 2),
  ('o3000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'La Roche-Posay Effaclar Duo+', 3200, 1),
  
  -- Order 4: 2 items
  ('o4000000-0000-0000-0000-000000000004', 'a4000000-0000-0000-0000-000000000004', 'Avène Crème Hydratance Optimale', 2900, 1),
  ('o4000000-0000-0000-0000-000000000004', 'a6000000-0000-0000-0000-000000000006', 'Klorane Shampooing à la Camomille', 1600, 1),
  
  -- Order 5: 2 items
  ('o5000000-0000-0000-0000-000000000005', 'a8000000-0000-0000-0000-000000000008', 'Nuxe Huile Prodigieuse', 3800, 2),
  ('o5000000-0000-0000-0000-000000000005', 'a6000000-0000-0000-0000-000000000006', 'Klorane Shampooing à la Camomille', 1600, 1),
  
  -- Order 6
  ('o6000000-0000-0000-0000-000000000006', 'a3000000-0000-0000-0000-000000000003', 'Bioderma Sensibio H2O', 1800, 3),
  
  -- Order 7
  ('o7000000-0000-0000-0000-000000000007', 'a2000000-0000-0000-0000-000000000002', 'Vichy Liftactiv Collagen Specialist', 4800, 2),
  
  -- Order 8
  ('o8000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'La Roche-Posay Effaclar Duo+', 3200, 1),
  
  -- Order 9
  ('o9000000-0000-0000-0000-000000000009', 'a7000000-0000-0000-0000-000000000007', 'CeraVe Lait Hydratant', 2500, 2),
  ('o9000000-0000-0000-0000-000000000009', 'a3000000-0000-0000-0000-000000000003', 'Bioderma Sensibio H2O', 1800, 1),
  
  -- Order 10
  ('oa000000-0000-0000-0000-00000000000a', 'a2000000-0000-0000-0000-000000000002', 'Vichy Liftactiv Collagen Specialist', 4800, 2),
  ('oa000000-0000-0000-0000-00000000000a', 'a6000000-0000-0000-0000-000000000006', 'Klorane Shampooing à la Camomille', 1600, 1);

