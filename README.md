# 🧹 Organizador de Faxinas

Aplicativo web simples para organizar as casas atendidas por um serviço de limpeza (cleaning) nos EUA. Feito para uso pela própria faxineira/cliente, direto do celular ou computador — **sem precisar de internet, servidor ou instalação**.

A interface do app é em **inglês** (para funcionárias e clientes nos EUA). Este README fica em português para facilitar o uso.

## O que o app faz

Para cada casa você pode cadastrar:

- **Fotos** da casa (ex: fachada, pontos de atenção, "antes/depois")
- **Endereço** completo, com link direto para abrir no Google Maps
- **Processo de faxina**: uma lista de tarefas (checklist) que pode ser marcada conforme vai limpando, e reiniciada a cada nova visita
- **Senhas / códigos das portas**, alarme, portão, caixa de chaves etc. (ficam ocultas por padrão — toque no 👁️ para revelar)
- **Observações gerais** (ex: tem cachorro, dia de lixo, preferências do cliente)

Outros recursos:

- 🔒 **Tela de PIN** ao abrir o app, para proteger as senhas se alguém pegar o celular
- 🔎 Busca rápida por nome ou endereço da casa
- 💾 **Exportar / importar backup** em JSON (Configurações ⚙️) — importante porque os dados ficam salvos apenas neste aparelho/navegador
- 📱 Layout pensado para celular, mas funciona em qualquer navegador

## Como compartilhar uma casa com a funcionária

O app continua sendo só para o celular da dona do negócio (não há login nem nuvem). Para passar as informações de uma casa para quem vai fazer a faxina:

1. Abra a casa desejada → aba **Info**
2. Toque em **"📄 Share as PDF"**
3. Escolha **"Save as PDF"** (ou similar) na tela de impressão do celular/computador
4. Envie esse PDF pela funcionária por WhatsApp, e-mail etc.

O PDF traz endereço, observações, senhas das portas e o checklist de faxina daquela casa. Como é um arquivo estático, se a senha da porta mudar depois, é preciso gerar e enviar um novo PDF.

## Como usar

**Opção 1 — mais simples:** baixe o repositório e abra o arquivo `index.html` direto no navegador do celular ou computador (funciona offline, sem precisar de internet).

**Opção 2 — GitHub Pages (recomendado para acessar de qualquer lugar):**

1. No GitHub, vá em **Settings → Pages**
2. Em "Branch", selecione a branch principal (`main`) e a pasta `/ (root)`
3. Salve. Em alguns minutos o app estará disponível em um link do tipo `https://SEU-USUARIO.github.io/skills-introduction-to-github/`
4. Acesse esse link pelo celular e, se quiser, adicione à tela inicial (funciona como um app)

## Importante sobre os dados e segurança

- Todos os dados (casas, fotos, senhas) ficam salvos **apenas no navegador deste aparelho** (`localStorage`), não são enviados para nenhum servidor.
- Isso significa que, se limpar os dados do navegador, trocar de celular ou desinstalar o app, as informações podem se perder — **por isso é essencial fazer backup regularmente** em Configurações ⚙️ → Exportar backup.
- O PIN de bloqueio é uma proteção simples (não é criptografia forte). Ele evita que alguém abra o app casualmente, mas não substitui manter o celular em si protegido (com senha de tela, por exemplo).

## Estrutura do projeto

```
index.html       # telas do app
css/style.css     # estilo visual
js/app.js         # toda a lógica (cadastro, senhas, checklist, fotos, backup)
```

Não há dependências externas nem build necessário — é HTML/CSS/JS puro.
