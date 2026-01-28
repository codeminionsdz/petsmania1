-- ===================================================
-- Add Promotions Settings to site_settings
-- ===================================================

-- Add new settings for promotions
INSERT INTO site_settings (key, value, description, data_type) VALUES
  ('max_discount_percentage', '"31"', 'Maximum discount percentage shown in promotions', 'number'),
  ('show_promotions_banner', '"true"', 'Show promotions banner on homepage', 'boolean'),
  ('promotion_banner_title', '"Jusqu a -31%"', 'Promotions banner title text', 'text')
ON CONFLICT (key) DO NOTHING;

-- Verify
SELECT key, value, description FROM site_settings WHERE key LIKE '%promot%' OR key LIKE '%discount%' ORDER BY key;
