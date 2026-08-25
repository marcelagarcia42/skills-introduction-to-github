// ============================================================
// CONFIGURAÇÃO — troque estes valores pelos links reais da DTUV
// ============================================================
const CONFIG = {
  // Link da loja oficial na Shopee (ex: https://shopee.com.br/dtuv.brindes)
  shopeeUrl: "https://shopee.com.br/SEU-LINK-DA-LOJA-AQUI",

  // Número de WhatsApp no formato internacional, só dígitos (ex: 5511999999999)
  whatsappNumber: "5511999999999",
  whatsappMessage: "Olá! Vi a página da DTUV e quero fazer um orçamento de brindes personalizados.",

  instagramUrl: "https://instagram.com/SEU-USUARIO-AQUI",
  tiktokUrl: "https://tiktok.com/@SEU-USUARIO-AQUI",
  facebookUrl: "https://facebook.com/SEU-USUARIO-AQUI",
};

// ============================================================
// PRODUTOS — edite, adicione ou remova itens do catálogo aqui
// ============================================================
const PRODUCTS = [
  { name: "Caneca personalizada", category: "Canecas", emoji: "☕", desc: "Caneca de cerâmica ou polímero com sua logo ou arte em alta definição.", price: "19,90" },
  { name: "Squeeze inox", category: "Squeezes", emoji: "🥤", desc: "Garrafa térmica inox personalizada, ideal para brinde corporativo.", price: "39,90" },
  { name: "Camiseta estampada", category: "Vestuário", emoji: "👕", desc: "Camiseta 100% algodão com estampa personalizada frente e verso.", price: "34,90" },
  { name: "Boné personalizado", category: "Vestuário", emoji: "🧢", desc: "Boné bordado ou estampado com a logo da sua marca ou evento.", price: "29,90" },
  { name: "Chaveiro acrílico", category: "Chaveiros", emoji: "🔑", desc: "Chaveiro em acrílico ou madeira, corte a laser com sua arte.", price: "9,90" },
  { name: "Sacola ecobag", category: "Sacolas", emoji: "🛍️", desc: "Ecobag de tecido personalizada, ótima para brinde sustentável.", price: "24,90" },
  { name: "Mochila personalizada", category: "Bolsas & Mochilas", emoji: "🎒", desc: "Mochila com bordado ou silk da sua marca, ideal para eventos.", price: "69,90" },
  { name: "Bloco de notas", category: "Papelaria", emoji: "📓", desc: "Bloco de notas com capa personalizada, ótimo brinde corporativo.", price: "14,90" },
  { name: "Power bank", category: "Tecnologia", emoji: "🔋", desc: "Carregador portátil personalizado com a logo da sua empresa.", price: "49,90" },
];

// ============================================================
// SOCIAL — cards exibidos na seção "Siga a DTUV nas redes"
// ============================================================
const SOCIAL_LINKS = [
  { name: "Instagram", handle: "@dtuv.brindes", icon: "📸", url: () => CONFIG.instagramUrl },
  { name: "TikTok", handle: "@dtuv.brindes", icon: "🎵", url: () => CONFIG.tiktokUrl },
  { name: "Facebook", handle: "DTUV Brindes", icon: "📘", url: () => CONFIG.facebookUrl },
  { name: "WhatsApp", handle: "Fale com a gente", icon: "💬", url: () => whatsappLink() },
];

function whatsappLink() {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
}

function shopeeSearchLink(productName) {
  // Link genérico da loja + termo de busca do produto, já que a Shopee
  // não permite montar um link direto por produto sem o ID real do anúncio.
  return `${CONFIG.shopeeUrl}?search=${encodeURIComponent(productName)}`;
}

function setLinks() {
  document.querySelectorAll("#btn-shopee-top, #btn-shopee-hero, #btn-shopee-cta, #footer-shopee")
    .forEach((el) => (el.href = CONFIG.shopeeUrl));

  const whatsapp = whatsappLink();
  document.getElementById("whatsapp-float").href = whatsapp;
  document.getElementById("footer-whatsapp").href = whatsapp;

  document.getElementById("footer-instagram").href = CONFIG.instagramUrl;
  document.getElementById("footer-tiktok").href = CONFIG.tiktokUrl;
  document.getElementById("footer-facebook").href = CONFIG.facebookUrl;
}

function renderCategoryFilters() {
  const categories = ["Todos", ...new Set(PRODUCTS.map((p) => p.category))];
  const wrap = document.getElementById("category-filters");
  wrap.innerHTML = categories
    .map(
      (cat, i) =>
        `<button class="chip${i === 0 ? " active" : ""}" data-category="${cat}">${cat}</button>`
    )
    .join("");

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    wrap.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.category);
  });
}

function renderProducts(category = "Todos") {
  const grid = document.getElementById("product-grid");
  const items = category === "Todos" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

  grid.innerHTML = items
    .map(
      (p) => `
      <a class="product-card" href="${shopeeSearchLink(p.name)}" target="_blank" rel="noopener">
        <div class="product-thumb">${p.emoji}</div>
        <div class="product-body">
          <p class="product-category">${p.category}</p>
          <p class="product-name">${p.name}</p>
          <p class="product-desc">${p.desc}</p>
          <div class="product-footer">
            <p class="product-price">R$ ${p.price} <small>a partir de</small></p>
            <span class="product-cta">Ver na Shopee →</span>
          </div>
        </div>
      </a>`
    )
    .join("");
}

function renderSocial() {
  const grid = document.getElementById("social-grid");
  grid.innerHTML = SOCIAL_LINKS.map(
    (s) => `
      <a class="social-card" href="${s.url()}" target="_blank" rel="noopener">
        <span class="social-icon">${s.icon}</span>
        <span>
          <p class="social-name">${s.name}</p>
          <p class="social-handle">${s.handle}</p>
        </span>
      </a>`
  ).join("");
}

function init() {
  setLinks();
  renderCategoryFilters();
  renderProducts();
  renderSocial();
  document.getElementById("footer-year").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", init);
