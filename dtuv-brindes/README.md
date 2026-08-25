# 🎁 DTUV Brindes — Página de Divulgação

Página de divulgação (landing page) para a **DTUV**, marca de impressão e
personalização de brindes (canecas, squeezes, camisetas, chaveiros, etc.).
A página apresenta o catálogo, direciona para a loja oficial na **Shopee** e
reúne os links das **redes sociais** (Instagram, TikTok, Facebook, WhatsApp)
em um só lugar — ideal para colocar no link da bio.

Não há dependências externas nem build necessário — é HTML/CSS/JS puro,
igual ao restante deste repositório.

## ⚙️ Antes de publicar: configure seus links

Abra o arquivo [`js/app.js`](js/app.js) e edite o objeto `CONFIG` no topo
do arquivo com os dados reais da DTUV:

```js
const CONFIG = {
  shopeeUrl: "https://shopee.com.br/SEU-LINK-DA-LOJA-AQUI", // link da loja oficial
  whatsappNumber: "5511999999999",                          // DDI+DDD+número, só dígitos
  whatsappMessage: "Olá! Vi a página da DTUV...",
  instagramUrl: "https://instagram.com/SEU-USUARIO-AQUI",
  tiktokUrl: "https://tiktok.com/@SEU-USUARIO-AQUI",
  facebookUrl: "https://facebook.com/SEU-USUARIO-AQUI",
};
```

Todos os botões "Visitar loja", o botão flutuante do WhatsApp e os cards de
redes sociais usam esses valores automaticamente.

## 🛍️ Editando o catálogo de produtos

Os produtos exibidos na seção "Produtos em destaque" também ficam em
`js/app.js`, no array `PRODUCTS`. Cada item segue este formato:

```js
{ name: "Caneca personalizada", category: "Canecas", emoji: "☕", desc: "...", price: "19,90" }
```

- Adicione, remova ou edite itens livremente.
- `category` é usada para gerar automaticamente os filtros no topo da seção.
- Cada card leva para a busca desse produto dentro da loja na Shopee
  (`shopeeUrl` + termo de busca), já que a Shopee não permite montar um link
  direto por anúncio sem o ID real do produto. Se preferir, você pode trocar
  isso por um link direto de cada anúncio — basta adicionar um campo `url`
  no produto e usá-lo em `renderProducts()`.

## 🚀 Como publicar

**Opção 1 — mais simples:** abra `index.html` direto no navegador para
conferir localmente.

**Opção 2 — GitHub Pages:**

1. No GitHub, vá em **Settings → Pages**
2. Em "Branch", selecione a branch principal e a pasta `/ (root)`
3. Acesse `https://SEU-USUARIO.github.io/skills-introduction-to-github/dtuv-brindes/`

Ou, se preferir a página na raiz de um domínio próprio, mova o conteúdo desta
pasta para a raiz de outro repositório.

## Estrutura

```
index.html       # estrutura da página (hero, produtos, redes sociais, contato)
css/style.css     # visual (paleta laranja Shopee + identidade DTUV)
js/app.js         # configuração de links, catálogo de produtos e renderização
```
