export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  category: string;
  image_url: string;
  badge: string | null;
  rating: number;
  reviews_count: number;
  stock: number;
  featured: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderPayload {
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  total: number;
}
