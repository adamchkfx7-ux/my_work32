/*
# Create orders table for the fashion store checkout

1. New Tables
- `orders`
  - `id` (uuid, primary key)
  - `customer_name` (text, buyer name)
  - `phone` (text, contact phone)
  - `address` (text, delivery address)
  - `city` (text, delivery city)
  - `items` (jsonb, array of {id, name, price, quantity})
  - `total` (numeric, order total)
  - `status` (text, order status, default 'جديد')
  - `created_at` (timestamp)

2. Security
- Enable RLS on `orders`.
- Allow anon + authenticated to INSERT orders (guest checkout, no sign-in in this app).
- No read policy: order details stay private (only service role can read).
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  items jsonb NOT NULL,
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'جديد',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
