# Formulário: A HISTÓRIA DA MINHA PSIQUE

Este diretório contém um script do Google Apps Script que cria automaticamente,
na sua própria conta Google, o Google Form completo "A HISTÓRIA DA MINHA PSIQUE"
(13 seções, 70 perguntas, avisos de privacidade e protocolo de segurança).

Não é possível criar o formulário diretamente por aqui porque esta sessão não
tem acesso à sua conta Google — o script abaixo faz isso por você, com sua
própria autorização.

## Como usar

1. Acesse https://script.google.com e crie um **Novo projeto**.
2. Apague o conteúdo padrão do editor e cole todo o conteúdo de
   `criar-formulario.gs`.
3. Selecione a função `criarFormulario` no menu de funções e clique em
   **Executar**.
4. Na primeira execução, o Google pedirá autorização (o próprio script
   acessando seu próprio Google Drive/Forms) — aceite.
5. Ao concluir, abra o ícone de relógio ("Execuções") e veja no log:
   - o link de **edição** do formulário;
   - o link de **preenchimento** do formulário.

O formulário também aparecerá na raiz do seu Google Drive, pronto para ser
movido para uma pasta, ter o acesso restrito ou ter as respostas conectadas a
uma planilha (Respostas → ícone do Sheets).

## Observações

- Nenhuma pergunta é obrigatória, exceto as declarações de consentimento e a
  confirmação final da Seção 13, conforme o texto original.
- As opções "Outro" foram implementadas como o campo "Outro" nativo do Google
  Forms (com campo de texto livre), não como uma alternativa de texto fixo.
- Por padrão o formulário não coleta o e-mail de quem responde, para proteger
  a privacidade dado o tema sensível.
