-- ===================================================
-- Create Site Settings Table
-- ===================================================

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  data_type TEXT NOT NULL DEFAULT 'number', -- 'number', 'text', 'boolean'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on key for fast lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Insert default settings
INSERT INTO site_settings (key, value, description, data_type) VALUES
  ('free_shipping_threshold', '8000', 'Amount in DZD above which shipping is free', 'number'),
  ('default_shipping_cost', '500', 'Default shipping cost in DZD', 'number'),
  ('processing_time_days', '1', 'Order processing time in days', 'number'),
  ('enable_free_shipping', 'true', 'Enable free shipping feature', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read settings
CREATE POLICY "Anyone can read site settings" ON site_settings
  FOR SELECT
  USING (true);

-- RLS Policy: Only admins can update settings
CREATE POLICY "Only admins can update site settings" ON site_settings
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- RLS Policy: Only admins can insert settings
CREATE POLICY "Only admins can insert site settings" ON site_settings
  FOR INSERT
  WITH CHECK (is_admin());

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_settings_update_timestamp
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_timestamp();

-- Test: Verify settings are created
SELECT key, value, description FROM site_settings ORDER BY key;
