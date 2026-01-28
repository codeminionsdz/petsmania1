-- Create promotions table for admin management
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  badge TEXT,
  discount_percentage INTEGER,
  discount_fixed INTEGER,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read promotions
CREATE POLICY "Anyone can read promotions" ON promotions
  FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert promotions" ON promotions
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can update promotions" ON promotions
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can delete promotions" ON promotions
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Insert some sample promotions
INSERT INTO promotions (title, description, category, badge, discount_percentage, start_date, end_date, is_active)
VALUES
  ('عروض الصيف', 'خصومات حتى 50% على منتجات العناية', 'العناية بالوجه', 'بيع محدودة', 50, '2026-01-20'::DATE, '2026-02-28'::DATE, true),
  ('عرض الشتاء', 'خصومات خاصة على منتجات العناية الشتوية', 'العناية بالجسم', 'عرض حصري', 30, '2026-01-01'::DATE, '2026-03-31'::DATE, true),
  ('منتجات جديدة', 'خصم على المنتجات الجديدة وصول حديث', 'الجديد', 'جديد', 25, '2026-01-15'::DATE, '2026-02-15'::DATE, true);
