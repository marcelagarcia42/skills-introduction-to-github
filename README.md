# 📖 Estúdio do Livro

Site simples para ajudar a **desenvolver e estruturar um livro** — de ficção ou de conteúdo (mindset, autoajuda, negócios) — com um assistente de IA integrado. Roda direto no navegador, sem servidor nem instalação.

## O que o site faz

Para cada livro que você cria, escolhe um **tema/gênero** e o site adapta as perguntas:

- **Temas narrativos** (Ficção, Fantasia, Romance, Suspense/Mistério, Infantil/Juvenil, Biografia): abre uma aba de **Personagens**, onde você cadastra nome, papel na história (protagonista, antagonista, mentor...), o que cada um **representa**, personalidade, objetivo, conflito interno e arco de transformação — além de perguntas guia sobre conflito central, cenário, tema e desfecho.
- **Temas de conteúdo** (Mindset/Desenvolvimento pessoal, Negócios/Carreira, Autoajuda, Outro): abre uma aba de **Estrutura**, com perguntas para definir a transformação prometida ao leitor, a dor dele, crenças a desconstruir, exercícios práticos e os **pilares/capítulos** centrais do livro.

Em todo livro você também define:

- **Tipo de escrita** (ponto de vista: primeira pessoa, terceira pessoa, epistolar, direto ao leitor...)
- **Tipo de narrativa** (estrutura: linear, não linear, três atos, jornada do herói, capítulos temáticos...)
- **Livro anterior / material de referência**: envie um arquivo `.txt`, `.pdf` ou `.docx`, ou cole o texto manualmente. O texto extraído é usado como contexto para a IA entender melhor o assunto e o estilo do autor.
- **Assistente de IA**: um chat (usando a API da Anthropic/Claude) que já recebe todo o contexto do livro — sinopse, personagens ou pilares, estilo, e o trecho do livro anterior — para sugerir personagens, esboços de capítulos, arcos de transformação, exercícios práticos etc. Há botões de atalho para as sugestões mais comuns.

## Como usar

**Opção 1 — mais simples:** baixe o repositório e abra `index.html` direto no navegador.

**Opção 2 — GitHub Pages:**

1. No GitHub, vá em **Settings → Pages**
2. Em "Branch", selecione a branch principal e a pasta `/ (root)`
3. Acesse o link gerado (`https://SEU-USUARIO.github.io/skills-introduction-to-github/`)

### Configurando o assistente de IA

O chat usa a API oficial da Anthropic diretamente do seu navegador (sem backend). Para habilitá-lo:

1. Crie uma chave de API em [console.anthropic.com](https://console.anthropic.com)
2. No site, vá em **Ajustes → Assistente de IA** e cole sua chave (o campo de modelo pode ficar com o padrão `claude-sonnet-5`)
3. A chave fica salva **apenas no seu navegador** (`localStorage`) e as chamadas vão direto do seu dispositivo para a Anthropic — nenhum outro servidor tem acesso a ela

Se a leitura automática de `.pdf`/`.docx` falhar (por exemplo, sem conexão com a internet, já que essas bibliotecas são carregadas de um CDN), use a opção de **colar o texto manualmente** na aba "Livro anterior".

## Importante sobre os dados

- Todos os livros, personagens, estrutura e histórico de conversa ficam salvos **apenas no navegador deste aparelho** (`localStorage`) — nada é enviado para nenhum servidor além das chamadas de IA feitas diretamente à Anthropic quando você usa o chat.
- Faça backup regularmente em **Ajustes → Exportar backup** (a chave de API não é incluída no backup, por segurança).

## Estrutura do projeto

```
index.html       # telas do site
css/style.css     # estilo visual
js/app.js         # toda a lógica (livros, personagens, estrutura, referência, chat com IA, backup)
```

Não há dependências de build — é HTML/CSS/JS puro. A leitura de `.pdf` usa [pdf.js](https://mozilla.github.io/pdf.js/) e a de `.docx` usa [mammoth.js](https://github.com/mwilliamson/mammoth.js), ambos carregados sob demanda via CDN.
