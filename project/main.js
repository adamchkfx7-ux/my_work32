/* ===== لومي — منطق المتجر ===== */

var SUPABASE_URL = 'https://nbbkumrvbatvqjmboolp.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iYmt1bXJ2YmF0dnFqbWJvb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMjUxMTYsImV4cCI6MjEwNzgwMTExNn0.n5EAfGVnRq--v_nj3R1Y3teWDm1zPcvdP5TDnHeI8HY';

var $ = function (id) { return document.getElementById(id); };

var state = {
  products: [],
  cart: [],
  category: 'الكل',
  view: 'store'
};

/* ---------- Supabase REST helpers ---------- */

function sbGet(table) {
  return fetch(SUPABASE_URL + '/rest/v1/' + table + '?select=*&order=created_at.asc', {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    }
  }).then(function (res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  });
}

function sbInsert(table, payload) {
  return fetch(SUPABASE_URL + '/rest/v1/' + table, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  }).then(function (res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
  });
}

/* ---------- Cart ---------- */

function cartCount() {
  return state.cart.reduce(function (s, i) { return s + i.quantity; }, 0);
}

function cartTotal() {
  return state.cart.reduce(function (s, i) { return s + i.product.price * i.quantity; }, 0);
}

function addToCart(p) {
  var found = state.cart.find(function (i) { return i.product.id === p.id; });
  if (found) found.quantity += 1;
  else state.cart.push({ product: p, quantity: 1 });
  renderCart();
  openCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(function (i) { return i.product.id !== id; });
  renderCart();
}

function setQty(id, q) {
  if (q <= 0) { removeFromCart(id); return; }
  var item = state.cart.find(function (i) { return i.product.id === id; });
  if (item) { item.quantity = q; renderCart(); }
}

function clearCart() {
  state.cart = [];
  renderCart();
}

/* ---------- Cart UI ---------- */

function openCart() {
  $('cartOverlay').classList.add('open');
}

function closeCart() {
  $('cartOverlay').classList.remove('open');
}

function renderCart() {
  var count = cartCount();
  var badge = $('cartCount');
  badge.textContent = count;
  badge.classList.toggle('show', count > 0);

  var empty = $('cartEmpty');
  var items = $('cartItems');
  var foot = $('cartFoot');

  if (state.cart.length === 0) {
    empty.style.display = 'flex';
    items.style.display = 'none';
    foot.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  items.style.display = 'flex';
  foot.style.display = 'block';

  items.innerHTML = '';
  state.cart.forEach(function (entry) {
    var p = entry.product;
    var row = document.createElement('div');
    row.className = 'cart-item';

    var img = document.createElement('img');
    img.src = p.image_url;
    img.alt = p.name;
    row.appendChild(img);

    var info = document.createElement('div');
    info.className = 'cart-item-info';

    var top = document.createElement('div');
    top.className = 'cart-item-top';
    var h = document.createElement('h3');
    h.textContent = p.name;
    var del = document.createElement('button');
    del.className = 'cart-remove';
    del.setAttribute('aria-label', 'إزالة من السلة');
    del.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    del.addEventListener('click', function () { removeFromCart(p.id); });
    top.appendChild(h);
    top.appendChild(del);
    info.appendChild(top);

    var price = document.createElement('p');
    price.className = 'cart-item-price';
    price.textContent = p.price + ' ر.س';
    info.appendChild(price);

    var qty = document.createElement('div');
    qty.style.cssText = 'margin-top:auto; display:flex; align-items:center; gap:8px;';

    var minus = document.createElement('button');
    minus.className = 'qty-btn';
    minus.setAttribute('aria-label', 'إنقاص الكمية');
    minus.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>';
    minus.addEventListener('click', function () { setQty(p.id, entry.quantity - 1); });

    var val = document.createElement('span');
    val.className = 'qty-val';
    val.textContent = entry.quantity;

    var plus = document.createElement('button');
    plus.className = 'qty-btn';
    plus.setAttribute('aria-label', 'زيادة الكمية');
    plus.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
    plus.addEventListener('click', function () { setQty(p.id, entry.quantity + 1); });

    qty.appendChild(minus);
    qty.appendChild(val);
    qty.appendChild(plus);
    info.appendChild(qty);

    row.appendChild(info);
    items.appendChild(row);
  });

  $('cartTotal').textContent = cartTotal().toFixed(2) + ' ر.س';
}

/* ---------- Products UI ---------- */

function esc(s) {
  var d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

function productCard(p) {
  var card = document.createElement('div');
  card.className = 'product-card';

  var wrap = document.createElement('div');
  wrap.className = 'product-img-wrap';

  var img = document.createElement('img');
  img.src = p.image_url;
  img.alt = p.name;
  img.loading = 'lazy';
  wrap.appendChild(img);

  if (p.badge) {
    var badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = p.badge;
    wrap.appendChild(badge);
  }
  if (p.old_price) {
    var disc = document.createElement('span');
    disc.className = 'discount';
    disc.textContent = '-' + Math.round(((p.old_price - p.price) / p.old_price) * 100) + '%';
    wrap.appendChild(disc);
  }
  if (p.stock <= 5) {
    var warn = document.createElement('span');
    warn.className = 'stock-warn';
    warn.textContent = 'بقي ' + p.stock + ' فقط';
    wrap.appendChild(warn);
  }
  card.appendChild(wrap);

  var body = document.createElement('div');
  body.className = 'product-body';

  var top = document.createElement('div');
  top.className = 'product-top';
  var h3 = document.createElement('h3');
  h3.textContent = p.name;
  var cat = document.createElement('span');
  cat.className = 'product-cat';
  cat.textContent = p.category;
  top.appendChild(h3);
  top.appendChild(cat);
  body.appendChild(top);

  var desc = document.createElement('p');
  desc.className = 'product-desc';
  desc.textContent = p.description;
  body.appendChild(desc);

  var rating = document.createElement('div');
  rating.className = 'product-rating';
  rating.innerHTML = '<span class="star">★</span>';
  var rStrong = document.createElement('strong');
  rStrong.textContent = p.rating;
  rating.appendChild(rStrong);
  var rSmall = document.createElement('small');
  rSmall.textContent = '(' + p.reviews_count + ')';
  rating.appendChild(rSmall);
  body.appendChild(rating);

  var bottom = document.createElement('div');
  bottom.className = 'product-bottom';

  var priceBlock = document.createElement('div');
  priceBlock.className = 'price-block';
  var now = document.createElement('span');
  now.className = 'now';
  now.textContent = p.price + ' ر.س';
  priceBlock.appendChild(now);
  if (p.old_price) {
    var was = document.createElement('span');
    was.className = 'was';
    was.textContent = p.old_price + ' ر.س';
    priceBlock.appendChild(was);
  }
  bottom.appendChild(priceBlock);

  var addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.textContent = 'أضف للسلة';
  addBtn.addEventListener('click', function () {
    addToCart(p);
    addBtn.classList.add('added');
    addBtn.textContent = 'أُضيف ✓';
    setTimeout(function () {
      addBtn.classList.remove('added');
      addBtn.textContent = 'أضف للسلة';
    }, 1200);
  });
  bottom.appendChild(addBtn);

  body.appendChild(bottom);
  card.appendChild(body);
  return card;
}

function renderCategories() {
  var cats = ['الكل'];
  var seen = {};
  state.products.forEach(function (p) {
    if (!seen[p.category]) { seen[p.category] = true; cats.push(p.category); }
  });

  var box = $('categories');
  box.innerHTML = '';
  cats.forEach(function (c) {
    var b = document.createElement('button');
    b.className = 'cat-btn' + (state.category === c ? ' active' : '');
    b.textContent = c;
    b.addEventListener('click', function () {
      state.category = c;
      renderCategories();
      renderProducts();
    });
    box.appendChild(b);
  });
}

function renderProducts() {
  var grid = $('productsGrid');
  grid.innerHTML = '';

  var filtered = state.category === 'الكل'
    ? state.products
    : state.products.filter(function (p) { return p.category === state.category; });

  filtered.forEach(function (p) { grid.appendChild(productCard(p)); });
}

function renderFeatured() {
  var featured = null;
  for (var i = 0; i < state.products.length; i++) {
    if (state.products[i].featured) { featured = state.products[i]; break; }
  }
  if (!featured) return;

  $('featuredSection').style.display = 'block';
  $('featuredImg').src = featured.image_url;
  $('featuredImg').alt = featured.name;
  $('featuredName').textContent = featured.name;
  $('featuredDesc').textContent = featured.description;
  $('featuredPrice').textContent = featured.price + ' ر.س';
  $('featuredOld').textContent = featured.old_price ? featured.old_price + ' ر.س' : '';

  var btn = $('featuredAdd');
  var newBtn = btn.cloneNode(true);
  newBtn.addEventListener('click', function () {
    addToCart(featured);
    newBtn.textContent = 'أُضيف ✓';
    newBtn.style.background = 'var(--success)';
    setTimeout(function () {
      newBtn.textContent = 'أضيفيها لسلتك';
      newBtn.style.background = '';
    }, 1200);
  });
  btn.parentNode.replaceChild(newBtn, btn);
}

function loadProducts() {
  var sk = $('skeletons');
  sk.innerHTML = '';
  for (var i = 0; i < 8; i++) {
    var s = document.createElement('div');
    s.className = 'skeleton';
    s.innerHTML = '<div class="sk-img"></div><div class="sk-body"><div class="sk-line"></div><div class="sk-line short"></div></div>';
    sk.appendChild(s);
  }

  sbGet('products').then(function (data) {
    if (!Array.isArray(data)) throw new Error('bad data');
    state.products = data;
    sk.style.display = 'none';
    $('productsGrid').style.display = 'grid';
    renderCategories();
    renderProducts();
    renderFeatured();
  }).catch(function () {
    sk.style.display = 'none';
    $('loadError').style.display = 'block';
  });
}

/* ---------- Views ---------- */

function showView(name) {
  state.view = name;
  $('storeView').style.display = name === 'store' ? 'block' : 'none';
  $('checkoutPage').classList.toggle('show', name === 'checkout' && state.cart.length > 0);
  $('emptyCartPage').classList.toggle('show', name === 'checkout' && state.cart.length === 0);
  $('successPage').classList.remove('show');
  if (name === 'checkout') {
    window.scrollTo(0, 0);
    renderSummary();
  }
}

function renderSummary() {
  var box = $('summaryItems');
  box.innerHTML = '';
  state.cart.forEach(function (entry) {
    var row = document.createElement('div');
    row.className = 'summary-item';

    var img = document.createElement('img');
    img.src = entry.product.image_url;
    img.alt = entry.product.name;
    row.appendChild(img);

    var info = document.createElement('div');
    info.className = 'summary-item-info';
    var n = document.createElement('p');
    n.className = 'n';
    n.textContent = entry.product.name;
    var q = document.createElement('p');
    q.className = 'q';
    q.textContent = 'الكمية: ' + entry.quantity;
    info.appendChild(n);
    info.appendChild(q);
    row.appendChild(info);

    var amt = document.createElement('p');
    amt.className = 'amount';
    amt.textContent = (entry.product.price * entry.quantity).toFixed(2) + ' ر.س';
    row.appendChild(amt);

    box.appendChild(row);
  });

  var total = cartTotal();
  $('sumSubtotal').textContent = total.toFixed(2) + ' ر.س';
  $('sumTotal').textContent = total.toFixed(2) + ' ر.س';
  $('confirmBtn').textContent = 'تأكيد الطلب · ' + total.toFixed(2) + ' ر.س';
}

/* ---------- Checkout submit ---------- */

function submitOrder(e) {
  e.preventDefault();

  var name = $('fName').value.trim();
  var phone = $('fPhone').value.trim();
  var city = $('fCity').value.trim();
  var address = $('fAddress').value.trim();
  var errBox = $('formError');

  errBox.classList.remove('show');

  if (!name || !phone || !address || !city) {
    errBox.textContent = 'يرجى تعبئة جميع الحقول.';
    errBox.classList.add('show');
    return;
  }
  if (!/^[\d+\-\s]{8,15}$/.test(phone)) {
    errBox.textContent = 'يرجى إدخال رقم هاتف صحيح.';
    errBox.classList.add('show');
    return;
  }

  var btn = $('confirmBtn');
  btn.disabled = true;
  btn.textContent = 'جارٍ إرسال الطلب...';

  var payload = {
    customer_name: name,
    phone: phone,
    address: address,
    city: city,
    items: state.cart.map(function (i) {
      return { id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity };
    }),
    total: cartTotal()
  };

  sbInsert('orders', payload).then(function () {
    var orderId = phone + '-' + Date.now().toString(36);
    clearCart();
    $('storeView').style.display = 'none';
    $('checkoutPage').classList.remove('show');
    $('emptyCartPage').classList.remove('show');
    $('successPage').classList.add('show');
    $('orderId').textContent = 'رقم الطلب: ' + orderId;
    window.scrollTo(0, 0);
    btn.disabled = false;
  }).catch(function () {
    errBox.textContent = 'تعذّر إرسال الطلب، يرجى المحاولة مرة أخرى.';
    errBox.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'تأكيد الطلب';
  });
}

/* ---------- Init ---------- */

document.addEventListener('DOMContentLoaded', function () {
  $('cartBtn').addEventListener('click', openCart);
  $('cartClose').addEventListener('click', closeCart);
  $('cartScrim').addEventListener('click', closeCart);
  $('emptyShopBtn').addEventListener('click', closeCart);
  $('checkoutBtn').addEventListener('click', function () {
    closeCart();
    showView('checkout');
  });
  $('clearBtn').addEventListener('click', function () {
    clearCart();
    closeCart();
  });
  $('backLink').addEventListener('click', function (e) {
    e.preventDefault();
    showView('store');
  });
  $('emptyBackBtn').addEventListener('click', function () { showView('store'); });
  $('successBackBtn').addEventListener('click', function () { showView('store'); });
  $('checkoutForm').addEventListener('submit', submitOrder);

  window.addEventListener('scroll', function () {
    $('header').classList.toggle('scrolled', window.scrollY > 40);
  });

  loadProducts();
  renderCart();
});
