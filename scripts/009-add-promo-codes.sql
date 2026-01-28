-- ===================================================
-- Add Demo Promo Codes for Testing
-- ===================================================

INSERT INTO promo_codes (id, code, discount_type, discount_value, min_order_amount, max_uses, used_count, valid_from, valid_until, is_active, created_at)
VALUES
  ('ac100000-0000-0000-0000-000000000001', 'WELCOME20', 'percentage', 20, 5000, 1000, 234, NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', true, NOW() - INTERVAL '30 days'),
  ('ac200000-0000-0000-0000-000000000002', 'SUMMER500', 'fixed', 500, 3000, 500, 156, NOW() - INTERVAL '15 days', NOW() + INTERVAL '45 days', true, NOW() - INTERVAL '15 days'),
  ('ac300000-0000-0000-0000-000000000003', 'VIP15', 'percentage', 15, 10000, 100, 45, NOW() - INTERVAL '60 days', NOW() + INTERVAL '30 days', true, NOW() - INTERVAL '60 days'),
  ('ac400000-0000-0000-0000-000000000004', 'EXPIRED10', 'percentage', 10, 2000, 200, 200, NOW() - INTERVAL '90 days', NOW() - INTERVAL '30 days', false, NOW() - INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;
