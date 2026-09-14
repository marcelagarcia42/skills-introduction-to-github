const KITS = [
  {
    id: 'kit-essencial',
    icon: '☕',
    title: 'Kit Essencial — Bem-vindo(a) ao Time',
    items: 'Caneca personalizada + Crachá acrílico personalizado',
    badges: ['Prensa térmica', 'Acrílico UV'],
    price: 39.0,
    meta: 'Qtd. mínima sugerida: 20 un.',
  },
  {
    id: 'kit-completo',
    icon: '🎒',
    title: 'Kit Completo — Parte da Equipe',
    items: 'Camiseta + Caneca + Crachá acrílico + Cartão de boas-vindas',
    badges: ['DTF/DTUV', 'Prensa térmica', 'Acrílico UV'],
    price: 79.0,
    meta: 'Qtd. mínima sugerida: 20 un.',
    featured: true,
  },
  {
    id: 'kit-premium',
    icon: '🏆',
    title: 'Kit Premium — Orgulho de Vestir a Camisa',
    items: 'Mochila + Camiseta + Caneca + Squeeze + Crachá + Cartão',
    badges: ['DTUV', 'Prensa térmica', 'Acrílico UV'],
    price: 179.0,
    meta: 'Qtd. mínima sugerida: 15 un.',
  },
];

const PRODUCTS = [
  { id: 'caneca', icon: '☕', title: 'Caneca Personalizada', badges: ['Prensa térmica'], price: 24.9, meta: 'Qtd. mínima: 10 un.' },
  { id: 'camiseta', icon: '👕', title: 'Camiseta Personalizada', badges: ['DTF/DTUV'], price: 39.9, meta: 'Qtd. mínima: 10 un.' },
  { id: 'cracha', icon: '🪪', title: 'Crachá Acrílico Personalizado', badges: ['Acrílico UV'], price: 14.9, meta: 'Qtd. mínima: 10 un.' },
  { id: 'squeeze', icon: '🥤', title: 'Squeeze Personalizado', badges: ['Impressão UV'], price: 32.9, meta: 'Qtd. mínima: 10 un.' },
  { id: 'mochila', icon: '🎒', title: 'Mochila Personalizada', badges: ['DTUV'], price: 89.9, meta: 'Qtd. mínima: 10 un.' },
  { id: 'agenda', icon: '📓', title: 'Agenda/Caderno Personalizado', badges: ['Impressão UV'], price: 27.9, meta: 'Qtd. mínima: 10 un.' },
];

const CATALOG = [...KITS, ...PRODUCTS];
const CART_KEY = 'markae-onboarding-cart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function findItem(id) {
  return CATALOG.find((item) => item.id === id);
}

let cart = loadCart();

function renderKits() {
  const grid = document.getElementById('kits-grid');
  grid.innerHTML = KITS.map((kit) => `
    <div class="kit-card ${kit.featured ? 'featured' : ''}">
      <p class="kit-icon">${kit.icon}</p>
      <p class="kit-title">${kit.title}</p>
      <p class="kit-items">${kit.items}</p>
      <div class="badge-row">${kit.badges.map((b) => `<span class="badge">${b}</span>`).join('')}</div>
      <div class="price-row">
        <p class="price-value">${formatBRL(kit.price)} <span class="price-unit">/ colaborador</span></p>
        <p class="price-meta">${kit.meta} · valor estimado</p>
      </div>
      <button class="btn btn-primary" data-add="${kit.id}">Adicionar ao pedido</button>
    </div>
  `).join('');
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = PRODUCTS.map((p) => `
    <div class="product-card">
      <p class="product-icon">${p.icon}</p>
      <p class="product-title">${p.title}</p>
      <div class="badge-row">${p.badges.map((b) => `<span class="badge">${b}</span>`).join('')}</div>
      <div class="price-row">
        <p class="price-value">${formatBRL(p.price)}</p>
        <p class="price-meta">${p.meta} · valor estimado</p>
      </div>
      <button class="btn btn-primary" data-add="${p.id}">Adicionar</button>
    </div>
  `).join('');
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart(cart);
  renderCart();
  showToast('Adicionado ao pedido');
}

function changeQty(id, delta) {
  const next = (cart[id] || 0) + delta;
  if (next <= 0) {
    delete cart[id];
  } else {
    cart[id] = next;
  }
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart);
  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');
  const subtotalEl = document.getElementById('cart-subtotal');

  countEl.textContent = entries.reduce((sum, [, qty]) => sum + qty, 0);

  if (entries.length === 0) {
    itemsEl.innerHTML = '';
    emptyEl.hidden = false;
    subtotalEl.textContent = formatBRL(0);
    return;
  }

  emptyEl.hidden = true;
  let subtotal = 0;
  itemsEl.innerHTML = entries.map(([id, qty]) => {
    const item = findItem(id);
    subtotal += item.price * qty;
    return `
      <div class="cart-item">
        <div>
          <p class="cart-item-name">${item.title}</p>
          <p class="cart-item-meta">${formatBRL(item.price)} cada</p>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-qty-minus="${id}">−</button>
          <span>${qty}</span>
          <button class="qty-btn" data-qty-plus="${id}">+</button>
        </div>
      </div>
    `;
  }).join('');
  subtotalEl.textContent = formatBRL(subtotal);
}

function buildSummaryText() {
  const entries = Object.entries(cart);
  const company = document.getElementById('input-company').value.trim();
  const contact = document.getElementById('input-contact').value.trim();
  const headcount = document.getElementById('input-headcount').value.trim();
  const message = document.getElementById('input-message').value.trim();

  const lines = ['*Pedido de orçamento — Markaê Onboarding*', ''];
  if (company) lines.push(`Empresa: ${company}`);
  if (contact) lines.push(`Contato: ${contact}`);
  if (headcount) lines.push(`Nº de colaboradores: ${headcount}`);
  lines.push('', 'Itens:');

  let subtotal = 0;
  entries.forEach(([id, qty]) => {
    const item = findItem(id);
    subtotal += item.price * qty;
    lines.push(`- ${item.title} x${qty} (${formatBRL(item.price)} cada)`);
  });

  lines.push('', `Subtotal estimado: ${formatBRL(subtotal)}`);
  if (message) lines.push('', `Observações: ${message}`);
  lines.push('', '*Valores de referência — sujeitos a confirmação de orçamento.*');

  return lines.join('\n');
}

function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 2200);
}

function openCart() {
  document.getElementById('cart-panel').hidden = false;
  document.getElementById('cart-overlay').hidden = false;
}

function closeCart() {
  document.getElementById('cart-panel').hidden = true;
  document.getElementById('cart-overlay').hidden = true;
}

document.addEventListener('click', (e) => {
  const addId = e.target.dataset.add;
  if (addId) addToCart(addId);

  const plusId = e.target.dataset.qtyPlus;
  if (plusId) changeQty(plusId, 1);

  const minusId = e.target.dataset.qtyMinus;
  if (minusId) changeQty(minusId, -1);
});

document.getElementById('btn-open-cart').addEventListener('click', openCart);
document.getElementById('btn-close-cart').addEventListener('click', closeCart);
document.getElementById('cart-overlay').addEventListener('click', closeCart);

document.getElementById('quote-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (Object.keys(cart).length === 0) {
    showToast('Adicione ao menos um item ao pedido');
    return;
  }
  const text = buildSummaryText();
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
});

document.getElementById('btn-copy-summary').addEventListener('click', async () => {
  if (Object.keys(cart).length === 0) {
    showToast('Adicione ao menos um item ao pedido');
    return;
  }
  const text = buildSummaryText();
  try {
    await navigator.clipboard.writeText(text);
    showToast('Resumo copiado');
  } catch {
    showToast('Não foi possível copiar automaticamente');
  }
});

renderKits();
renderProducts();
renderCart();
