-- Insert test guest order for debugging
-- Replace 'test@example.com' with the email you're testing with

INSERT INTO orders (
  user_id,
  guest_email,
  guest_phone,
  status,
  subtotal,
  shipping,
  discount,
  total,
  payment_method,
  tracking_number,
  notes,
  shipping_address
) VALUES (
  NULL,
  'test@example.com',
  '0555123456',
  'pending',
  5000,
  400,
  0,
  5400,
  'cod',
  'TRK123456789',
  'Test order',
  jsonb_build_object(
    'firstName', 'Ahmed',
    'lastName', 'Test',
    'phone', '0555123456',
    'email', 'test@example.com',
    'address', '123 Test Street',
    'city', 'Alger',
    'wilaya', 'Alger',
    'postalCode', '16000'
  )
);
