/*
# Create products table for the fashion store

1. New Tables
- `products`
  - `id` (uuid, primary key)
  - `name` (text, product name in Arabic)
  - `description` (text, short product description)
  - `price` (numeric, current selling price)
  - `old_price` (numeric, nullable — original price to show a discount)
  - `category` (text, e.g. dresses, abayas, bags, accessories)
  - `image_url` (text, product photo)
  - `badge` (text, nullable — marketing label like "جديد" or "الأكثر مبيعاً")
  - `rating` (numeric, average review rating 0-5)
  - `reviews_count` (integer, number of reviews)
  - `stock` (integer, available quantity)
  - `featured` (boolean, show on landing page highlights)
  - `created_at` (timestamp)

2. Security
- Enable RLS on `products`.
- Allow anon + authenticated to read products (public catalog data, no sign-in in this app).

3. Seed data
- Insert 12 Arabic-named fashion products across categories with Pexels photos.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL,
  old_price numeric(10,2),
  category text NOT NULL,
  image_url text NOT NULL,
  badge text,
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  reviews_count integer NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 10,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products
FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO products (name, description, price, old_price, category, image_url, badge, rating, reviews_count, stock, featured) VALUES
('فستان صيفي أنيق', 'فستان بقصّة عصرية وأقمشة خفيفة مثالي للإطلالات النهارية.', 349.00, 499.00, 'فساتين', 'https://images.pexels.com/photos/30590675/pexels-photo-30590675.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'خصم 30%', 4.8, 214, 15, true),
('فستان سهرة أحمر', 'فستان سهرة بلون أحمر جريء يمنحك إطلالة لا تُنسى.', 899.00, NULL, 'فساتين', 'https://images.pexels.com/photos/7516554/pexels-photo-7516554.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'الأكثر مبيعاً', 4.9, 342, 8, true),
('فستان أزرق كلاسيكي', 'تصميم كلاسيكي بلمسة عصرية يناسب جميع المناسبات.', 520.00, NULL, 'فساتين', 'https://images.pexels.com/photos/31800057/pexels-photo-31800057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', NULL, 4.6, 128, 12, false),
('فستان كوتور فخم', 'قطعة كوتور مصنوعة بعناية لتلفت الأنظار في المناسبات الخاصة.', 1450.00, 1790.00, 'فساتين', 'https://images.pexels.com/photos/32628115/pexels-photo-32628115.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'إصدار محدود', 5.0, 87, 4, true),
('طقم أسود عصري', 'طقم عصري باللونين الأسود والأبيض لإطلالة عملية وأنيقة.', 430.00, NULL, 'أطقم', 'https://images.pexels.com/photos/30590661/pexels-photo-30590661.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', NULL, 4.7, 156, 10, false),
('بليزر مقلمش', 'بليزر مقلمش يضيف لمسة احترافية لإطلالتك اليومية.', 385.00, 450.00, 'أطقم', 'https://images.pexels.com/photos/19778353/pexels-photo-19778353.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'جديد', 4.5, 94, 18, false),
('جاكيت شتوي بفرو', 'جاكيت دافئ ببطانة فرو فاخرة لأناقة لا تتأثر بالطقس.', 780.00, NULL, 'جاكيتات', 'https://images.pexels.com/photos/33772484/pexels-photo-33772484.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', NULL, 4.8, 203, 9, true),
('حقيبة جلدية بنية', 'حقيبة يد من الجلد الطبيعي بتصميم خالد وجودة تدوم.', 620.00, 750.00, 'حقائب', 'https://images.pexels.com/photos/8502484/pexels-photo-8502484.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'خصم 17%', 4.9, 267, 14, true),
('حقيبة يد فاخرة', 'حقيبة أنيقة تضيف لمسة فخامة لأي إطلالة.', 540.00, NULL, 'حقائب', 'https://images.pexels.com/photos/21897314/pexels-photo-21897314.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'جديد', 4.7, 112, 11, false),
('إطلالة عصرية كاملة', 'إطلالة كاملة تناسب الخرجات والمقابلات بذوق راقٍ.', 610.00, 690.00, 'أطقم', 'https://images.pexels.com/photos/833169/pexels-photo-833169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', NULL, 4.6, 143, 7, false),
('فستان أبيض منمق', 'فستان أبيض بقصّة ناعمة لسهرات الصيف والمناسبات النهارية.', 470.00, NULL, 'فساتين', 'https://images.pexels.com/photos/19892521/pexels-photo-19892521.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', NULL, 4.7, 168, 13, false),
('حقيبتا يد متطابقتان', 'طقم حقيبتين متناسقين لإطلالة واحدة متكاملة.', 690.00, 820.00, 'حقائب', 'https://images.pexels.com/photos/21897309/pexels-photo-21897309.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'عرض خاص', 4.8, 121, 6, false);
