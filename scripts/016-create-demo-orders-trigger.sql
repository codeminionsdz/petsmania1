-- ===================================================
-- Create Demo Orders for New Users
-- ===================================================
-- This function creates a sample order for new users when they sign up
-- This ensures every new user has an order to see in their orders page for testing

CREATE OR REPLACE FUNCTION public.create_sample_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a sample order for the new user
  INSERT INTO orders (
    user_id,
    status,
    subtotal,
    shipping,
    discount,
    total,
    shipping_address,
    payment_method,
    created_at
  )
  VALUES (
    NEW.id,
    'processing',
    7200,
    500,
    0,
    7700,
    jsonb_build_object(
      'address', 'عنوان افتراضي',
      'city', 'الجزائر',
      'phone', '0555000000'
    ),
    'cod',
    NOW()
  );

  -- Add sample order items
  INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
  SELECT 
    id,
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'La Roche-Posay Effaclar Duo+',
    3200,
    2
  FROM orders
  WHERE user_id = NEW.id
  LIMIT 1;

  INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
  SELECT 
    id,
    'a3000000-0000-0000-0000-000000000003'::uuid,
    'Bioderma Sensibio H2O',
    1800,
    1
  FROM orders
  WHERE user_id = NEW.id
  LIMIT 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_new_user_create_sample_order ON auth.users;

-- Create trigger to call the function when a new user signs up
CREATE TRIGGER on_new_user_create_sample_order
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_sample_order();
