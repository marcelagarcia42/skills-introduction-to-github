# Markaê Onboarding — Loja Virtual

Vitrine estática (HTML/CSS/JS puro, sem build) com kits de boas-vindas corporativos da Markaê para integração de novos colaboradores. Serve como material de apresentação e captação de pedidos de orçamento — não processa pagamentos.

Os mesmos kits e produtos avulsos também foram cadastrados como rascunho na loja Shopify conectada (`vze5u5-vj.myshopify.com`, coleção "Markaê Onboarding — Kits de Boas-Vindas"), para venda de fato.

## Como usar

Abra `index.html` no navegador (funciona offline, sem dependências).

## Estrutura

```
index.html      # vitrine (kits, produtos avulsos, carrinho, formulário de orçamento)
css/style.css   # visual (paleta vinho/dourado da marca Markaê)
js/app.js       # catálogo, carrinho (localStorage) e geração do resumo de pedido
```

## Fluxo de pedido

O carrinho é salvo no navegador (`localStorage`). Ao preencher o formulário, o botão "Enviar pedido de orçamento pelo WhatsApp" abre o WhatsApp com um resumo do pedido pronto para ser enviado ao contato desejado (sem número fixo cadastrado). Há também um botão para copiar o resumo do pedido como texto.

## Preços

Todos os valores são **estimativas de referência** (ver skill comercial da Markaê) e devem ser confirmados por orçamento conforme quantidade, cores, prazo e materiais.
