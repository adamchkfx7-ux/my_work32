import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2 } from 'lucide-react';
import type { CartItem, Product } from '@/types';
import { supabase } from '@/lib/supabase';

// ---------- Cart store ----------

const CartContext = createContext<{
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, q: number) => void;
  clear: () => void;
  total: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
} | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const add = useCallback((p: Product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === p.id);
      if (found) {
        return prev.map((i) =>
          i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product: p, quantity: 1 }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== id));
  }, []);

  const setQty = useCallback((id: string, q: number) => {
    setItems((prev) =>
      q <= 0
        ? prev.filter((i) => i.product.id !== id)
        : prev.map((i) => (i.product.id === id ? { ...i, quantity: q } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, add, remove, setQty, clear, total, count, open, setOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ---------- Header ----------

function Header() {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-cream-50/95 backdrop-blur shadow-sm py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center font-display text-xl">
            L
          </span>
          <span className="font-display text-2xl font-semibold tracking-wide">لومي</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#home" className="hover:text-gold-500 transition-colors">الرئيسية</a>
          <a href="#products" className="hover:text-gold-500 transition-colors">المنتجات</a>
          <a href="#features" className="hover:text-gold-500 transition-colors">لماذا نحن</a>
          <a href="#testimonials" className="hover:text-gold-500 transition-colors">آراء العميلات</a>
        </nav>

        <button
          onClick={() => setOpen(true)}
          className="relative p-2 rounded-full hover:bg-cream-200 transition-colors"
          aria-label="عرض سلة الشراء"
        >
          <ShoppingBag className="w-6 h-6" />
          {count > 0 && (
            <span className="absolute -top-0.5 -left-0.5 w-5 h-5 rounded-full bg-gold-500 text-white text-xs flex items-center justify-center font-bold">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

// ---------- Cart drawer ----------

function CartDrawer() {
  const { items, open, setOpen, remove, setQty, total, clear } = useCart();
  const [navigating, setNavigating] = useState(false);

  if (!open) return null;

  const goCheckout = () => {
    setNavigating(true);
    window.dispatchEvent(new CustomEvent('goto-checkout'));
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <aside className="absolute top-0 left-0 h-full w-full max-w-md bg-cream-50 shadow-2xl flex flex-col animate-slideIn">
        <div className="flex items-center justify-between p-5 border-b border-cream-200">
          <h2 className="text-xl font-bold">سلة الشراء</h2>
          <button onClick={() => setOpen(false)} aria-label="إغلاق">
            <X className="w-6 h-6 hover:text-gold-500 transition-colors" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-ink-500">
            <ShoppingBag className="w-14 h-14 opacity-30" />
            <p>سلتك فارغة حالياً</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 px-6 py-2 rounded-full bg-ink-900 text-cream-50 hover:bg-ink-700 transition-colors"
            >
              تسوّق الآن
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-20 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-bold text-sm">{product.name}</h3>
                      <button
                        onClick={() => remove(product.id)}
                        className="text-ink-400 hover:text-danger transition-colors"
                        aria-label="إزالة من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gold-600 font-bold text-sm mt-1">
                      {product.price} ر.س
                    </p>
                    <div className="mt-auto flex items-center gap-2">
                      <button
                        onClick={() => setQty(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-full border border-cream-200 flex items-center justify-center hover:bg-cream-100 transition-colors"
                        aria-label="إنقاص الكمية"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-bold">{quantity}</span>
                      <button
                        onClick={() => setQty(product.id, quantity + 1)}
                        className="w-7 h-7 rounded-full border border-cream-200 flex items-center justify-center hover:bg-cream-100 transition-colors"
                        aria-label="زيادة الكمية"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-200 p-5 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>الإجمالي</span>
                <span className="text-gold-600">{total.toFixed(2)} ر.س</span>
              </div>
              <button
                onClick={goCheckout}
                disabled={navigating}
                className="w-full py-3 rounded-full bg-gold-500 hover:bg-gold-600 text-white font-bold transition-colors disabled:opacity-60"
              >
                {navigating ? 'جارٍ التحويل...' : 'إتمام الطلب'}
              </button>
              <button
                onClick={clear}
                className="w-full py-2 text-sm text-ink-500 hover:text-danger transition-colors"
              >
                إفراغ السلة
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

// ---------- Checkout page ----------

function CheckoutPage({ onDone }: { onDone: () => void }) {
  const { items, total, clear } = useCart();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setError('يرجى تعبئة جميع الحقول.');
      return;
    }
    if (!/^[\d+\-\s]{8,15}$/.test(form.phone.trim())) {
      setError('يرجى إدخال رقم هاتف صحيح.');
      return;
    }

    setSubmitting(true);
    const payload = {
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      items: items.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
      })),
      total,
    };

    const { error: dbError } = await supabase.from('orders').insert(payload);
    if (dbError) {
      setError('تعذّر إرسال الطلب، يرجى المحاولة مرة أخرى.');
      setSubmitting(false);
      return;
    }
    setOrderId(payload.phone + '-' + Date.now().toString(36));
    clear();
    setSubmitting(false);
  };

  if (orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-3">تم استلام طلبك بنجاح!</h1>
        <p className="text-ink-500 max-w-md mb-2">
          شكراً لثقتك بنا. سيتواصل معك فريقنا خلال 24 ساعة لتأكيد الطلب وتحديد موعد التوصيل.
        </p>
        <p className="text-sm text-ink-400 mb-8">رقم الطلب: {orderId}</p>
        <button
          onClick={onDone}
          className="px-8 py-3 rounded-full bg-ink-900 text-cream-50 font-bold hover:bg-ink-700 transition-colors"
        >
          العودة للمتجر
        </button>
      </div
>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <ShoppingBag className="w-14 h-14 text-ink-400 opacity-40" />
        <h1 className="text-2xl font-bold">لا توجد منتجات في سلتك</h1>
        <p className="text-ink-500">أضف بعض المنتجات الرائعة ثم عد لإتمام الطلب.</p>
        <button
          onClick={onDone}
          className="mt-2 px-8 py-3 rounded-full bg-ink-900 text-cream-50 font-bold hover:bg-ink-700 transition-colors"
        >
          تسوّق الآن
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={onDone} className="text-ink-500 hover:text-gold-600 mb-6 flex items-center gap-1">
          <span>→</span> متابعة التسوق
        </button>
        <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={submit} className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-lg mb-2">بيانات التوصيل</h2>

            <div>
              <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-200 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300/40 transition"
                placeholder="مثال: سارة محمد"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رقم الجوال</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-200 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300/40 transition"
                placeholder="05xxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المدينة</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-200 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300/40 transition"
                placeholder="مثال: الرياض"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">العنوان التفصيلي</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-200 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300/40 transition"
                placeholder="الحي، الشارع، رقم المبنى"
              />
            </div>

            {error && (
              <p className="text-danger text-sm bg-danger/10 rounded-xl px-4 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-gold-500 hover:bg-gold-600 text-white font-bold transition-colors disabled:opacity-60"
            >
              {submitting ? 'جارٍ إرسال الطلب...' : `تأكيد الطلب · ${total.toFixed(2)} ر.س`}
            </button>
          </form>

          <div className="bg-white rounded-3xl p-6 shadow-sm h-fit">
            <h2 className="font-bold text-lg mb-4">ملخص الطلب</h2>
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 items-center">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-14 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm">{product.name}</p>
                    <p className="text-xs text-ink-400">الكمية: {quantity}</p>
                  </div>
                  <p className="font-bold text-sm text-gold-600">
                    {(product.price * quantity).toFixed(2)} ر.س
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-cream-200 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <span>{total.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>التوصيل</span>
                <span className="text-success font-bold">مجاني</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gold-600 pt-2">
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} ر.س</span>
              </div>
            </div>
            <div className="mt-6 bg-cream-100 rounded-2xl p-4 text-xs text-ink-500 leading-relaxed">
              الدفع عند الاستلام متاح في جميع المدن. سنتواصل معك هاتفياً لتأكيد الطلب قبل الشحن.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Product card ----------

function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-ink-900/85 text-cream-50 text-xs font-bold backdrop-blur">
            {product.badge}
          </span>
        )}
        {product.old_price && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-danger text-white text-xs font-bold">
            -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
          </span>
        )}
        {product.stock <= 5 && (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-warning/90 text-white text-xs font-bold">
            بقي {product.stock} فقط
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold">{product.name}</h3>
          <span className="text-xs text-ink-400 whitespace-nowrap">{product.category}</span>
        </div>
        <p className="text-sm text-ink-500 mt-1 line-clamp-2">{product.description}</p>

        <div className="flex items-center gap-1 mt-2">
          <span className="text-warning">★</span>
          <span className="text-sm font-bold">{product.rating}</span>
          <span className="text-xs text-ink-400">({product.reviews_count})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gold-600">{product.price} ر.س</span>
            {product.old_price && (
              <span className="text-sm text-ink-400 line-through mr-2">
                {product.old_price} ر.س
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              added
                ? 'bg-success text-white'
                : 'bg-ink-900 text-cream-50 hover:bg-gold-500'
            }`}
          >
            {added ? 'أُضيف ✓' : 'أضف للسلة'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- App shell ----------

type View = 'store' | 'checkout';

function StoreView() {
  const { add } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [category, setCategory] = useState('الكل');
  const [featured, setFeatured] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setLoadError(true);
        } else {
          setProducts(data as Product[]);
          const f = data.filter((p) => p.featured);
          if (f.length > 0) setFeatured(f[0] as Product);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = ['الكل', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered =
    category === 'الكل' ? products : products.filter((p) => p.category === category);

  return (
    <>
      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/5531709/pexels-photo-5531709.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="متجر لومي للأزياء"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-ink-900/80 via-ink-900/60 to-ink-900/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-32 text-cream-50">
          <div className="max-w-2xl animate-fadeUp">
            <p className="text-gold-300 font-bold tracking-widest mb-4 text-sm">
              مجموعة خريف 2026 وصلت
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              أناقة تُلهمك،
              <br />
              وثقة تُشبهك
            </h1>
            <p className="text-lg text-cream-100/90 mb-8 max-w-lg leading-relaxed">
              اكتشفي تشكيلة حصرية من الأزياء الراقية المختارة بعناية — جودة فاخرة،
              أسعار عادلة، وتوصيل مجاني لباب منزلك.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#products"
                className="px-8 py-3.5 rounded-full bg-gold-500 hover:bg-gold-400 text-white font-bold transition-all hover:scale-105"
              >
                تسوّقي الآن
              </a>
              <a
                href="#features"
                className="px-8 py-3.5 rounded-full border-2 border-cream-100/40 hover:bg-cream-100/10 font-bold transition-colors"
              >
                لماذا لومي؟
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-ink-900 text-cream-50 py-5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm">
          <div className="flex flex-col items-center gap-1">
            <span className="text-gold-300 font-bold text-lg">توصيل مجاني</span>
            <span className="text-cream-100/70">للطلبات فوق 300 ر.س</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-gold-300 font-bold text-lg">دفع عند الاستلام</span>
            <span className="text-cream-100/70">في جميع مدن المملكة</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-gold-300 font-bold text-lg">إرجاع مجاني</span>
            <span className="text-cream-100/70">خلال 14 يوماً</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-gold-300 font-bold text-lg">دعم واتساب</span>
            <span className="text-cream-100/70">من 9ص إلى 11م</span>
          </div>
      </div>
      </section>

      {/* Featured product spotlight */}
      {featured && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-sm overflow-hidden grid md:grid-cols-2">
            <img
              src={featured.image_url}
              alt={featured.name}
              className="w-full h-80 md:h-full object-cover"
            />
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <p className="text-gold-600 font-bold text-sm tracking-widest mb-3">منتج الأسبوع</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{featured.name}</h2>
              <p className="text-ink-500 leading-relaxed mb-6">{featured.description}</p>
              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-3xl font-bold text-gold-600">{featured.price} ر.س</span>
                {featured.old_price && (
                  <span className="text-lg text-ink-400 line-through">
                    {featured.old_price} ر.س
                  </span>
                )}
              </div>
              <button
                onClick={() => add(featured)}
                className="w-fit px-8 py-3.5 rounded-full bg-ink-900 hover:bg-gold-500 text-cream-50 font-bold transition-colors"
              >
                أضيفيها لسلتك
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section id="products" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gold-600 font-bold tracking-widest text-sm mb-2">تسوّقي</p>
            <h2 className="font-display text-4xl font-bold">منتجاتنا المختارة</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  category === c
                    ? 'bg-ink-900 text-cream-50'
                    : 'bg-white text-ink-700 hover:bg-cream-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-cream-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-cream-200 rounded w-2/3" />
                    <div className="h-4 bg-cream-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="text-center py-16 text-danger">
              تعذّر تحميل المنتجات. يرجى تحديث الصفحة والمحاولة مجدداً.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold-600 font-bold tracking-widest text-sm mb-2">لماذا نحن</p>
            <h2 className="font-display text-4xl font-bold">تجربة تسوّق تليق بك</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                title: 'أقمشة مختارة بعناية',
                desc: 'نتعامل مع أفضل الموردين لنضمن جودة تدوم وملمساً فاخراً في كل قطعة.',
              },
              {
                title: 'توصيل سريع ومجاني',
                desc: 'نوصل طلبك خلال 2-4 أيام عمل مجاناً للطلبات فوق 300 ريال.',
              },
              {
                title: 'إرجاع بدون أسئلة',
                desc: 'لم يعجبك المقاس؟ أرجعيها خلال 14 يوماً واستعيدي مبلغك كاملاً.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-cream-50 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-gold-500/10 text-gold-600 flex items-center justify-center text-2xl mb-4">
                  ✦
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold-600 font-bold tracking-widest text-sm mb-2">آراء العميلات</p>
            <h2 className="font-display text-4xl font-bold">ماذا قلن عنّا؟</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'نورة العتيبي',
                city: 'الرياض',
                text: 'جودة الأقمشة فوق التوقعات! الفستان وصلني خلال يومين وكان أفضل من الصور.',
              },
              {
                name: 'ريم الشمري',
                city: 'جدة',
                text: 'خدمة العملاء راقية جداً، ساعدوني في اختيار المقاس عبر الواتساب بكل صبر.',
              },
              {
                name: 'دانة القحطاني',
                city: 'الدمام',
                text: 'طلبت 3 قطع وكلها رائعة. الدفع عند الاستلام أراحني كثيراً وصرت عميلة دائمة.',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="text-warning mb-3 text-lg">★★★★★</div>
                <p className="text-ink-700 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gold-500/15 text-gold-600 flex items-center justify-center font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-ink-400">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-20 px-4 bg-ink-900 text-cream-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            جاهزة لإطلالتك الجديدة؟
          </h2>
          <p className="text-cream-100/80 mb-8">
            انضمي لآلاف العميلات الراضيات واستمتعي بتوصيل مجاني وإرجاع سهل.
          </p>
          <a
            href="#products"
            className="inline-block px-10 py-4 rounded-full bg-gold-500 hover:bg-gold-400 font-bold text-lg transition-all hover:scale-105"
          >
            ابدئي التسوق الآن
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-900 text-cream-100/70 border-t border-ink-700 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-cream-50 text-ink-900 flex items-center justify-center font-display">
                L
              </span>
              <span className="font-display text-xl text-cream-50">لومي</span>
            </div>
            <p>متجر أزياء راقية يقدّم قطعاً مختارة بعناية لكل امرأة تبحث عن التميّز.</p>
          </div>
          <div>
            <h4 className="text-cream-50 font-bold mb-3">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><a href="#products" className="hover:text-gold-300 transition-colors">المنتجات</a></li>
              <li><a href="#features" className="hover:text-gold-300 transition-colors">لماذا نحن</a></li>
              <li><a href="#testimonials" className="hover:text-gold-300 transition-colors">آراء العميلات</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-cream-50 font-bold mb-3">تواصلي معنا</h4>
            <ul className="space-y-2">
              <li>واتساب: 0500000000</li>
              <li>البريد: hello@lumi.sa</li>
              <li>الرياض، المملكة العربية السعودية</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-ink-700 text-center text-xs">
          © 2026 لومي. جميع الحقوق محفوظة.
        </div>
      </footer>
    </>
  );
}

export function App() {
  const [view, setView] = useState<View>('store');

  useEffect(() => {
    const go = () => {
      setView('checkout');
      window.scrollTo(0, 0);
    };
    window.addEventListener('goto-checkout', go);
    return () => window.removeEventListener('goto-checkout', go);
  }, []);

  return (
    <CartProvider>
      <Header />
      {view === 'store' ? <StoreView /> : <CheckoutPage onDone={() => setView('store')} />}
      <CartDrawer />
    </CartProvider>
  );
}

export default App;
