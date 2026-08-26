/**
 * Gera automaticamente o Google Form "A HISTÓRIA DA MINHA PSIQUE".
 *
 * COMO USAR:
 * 1. Acesse https://script.google.com e clique em "Novo projeto".
 * 2. Apague o conteúdo padrão e cole todo este arquivo.
 * 3. No topo, selecione a função "criarFormulario" e clique em "Executar".
 * 4. Na primeira execução o Google pedirá autorização (é o seu próprio
 *    script acessando o seu próprio Google Drive/Forms) — aceite.
 * 5. Ao terminar, abra "Execuções" (ícone de relógio à esquerda) e veja o
 *    log: ele mostra o link de edição e o link para preencher o formulário.
 *    O formulário também aparecerá no seu Google Drive.
 */

function criarFormulario() {
  var form = FormApp.create('A HISTÓRIA DA MINHA PSIQUE')
    .setTitle('A HISTÓRIA DA MINHA PSIQUE')
    .setDescription(
      'Questionário para criação de uma narrativa personalizada\n\n' +
      'Este formulário foi criado para reunir informações que poderão inspirar uma história ' +
      'simbólica de autoconhecimento. Ele não é um teste psicológico, não produz diagnóstico e ' +
      'não substitui psicoterapia, avaliação psicológica, atendimento médico ou psiquiátrico.\n\n' +
      'Você não precisa responder a nenhuma pergunta que cause desconforto. Pode escrever ' +
      '"prefiro não responder", deixar o campo em branco ou interromper o preenchimento a ' +
      'qualquer momento. Não existem respostas certas, bonitas ou esperadas.\n\n' +
      'Antes de começar, considere se este é um momento suficientemente seguro para refletir ' +
      'sobre experiências pessoais. Se estiver em crise, sob ameaça, muito desregulada ou com ' +
      'risco de se machucar, priorize contato com uma pessoa de confiança e atendimento presencial.'
    )
    .setIsQuiz(false)
    .setCollectEmail(false)
    .setProgressBar(true)
    .setShuffleQuestions(false);

  // ---------- helpers ----------
  function section(title, description) {
    var pb = form.addPageBreakItem().setTitle(title);
    if (description) pb.setHelpText(description);
    return pb;
  }
  function info(title, description) {
    var h = form.addSectionHeaderItem().setTitle(title);
    if (description) h.setHelpText(description);
    return h;
  }
  function long(title, help) {
    var it = form.addParagraphTextItem().setTitle(title).setRequired(false);
    if (help) it.setHelpText(help);
    return it;
  }
  function short(title, help, required) {
    var it = form.addTextItem().setTitle(title).setRequired(!!required);
    if (help) it.setHelpText(help);
    return it;
  }
  function dateItem(title, help) {
    var it = form.addDateItem().setTitle(title).setRequired(false);
    if (help) it.setHelpText(help);
    return it;
  }
  // options: array of strings. If the array contains the literal 'Outro',
  // it is removed from the list and turned into a real "Other" free-text option.
  function checkbox(title, options, help, required) {
    var it = form.addCheckboxItem().setTitle(title).setRequired(!!required);
    if (help) it.setHelpText(help);
    var showOther = false;
    var opts = options.filter(function (o) {
      if (o === 'Outro') { showOther = true; return false; }
      return true;
    });
    it.setChoiceValues(opts);
    if (showOther) it.showOtherOption(true);
    return it;
  }
  function multipleChoice(title, options, help, required) {
    var it = form.addMultipleChoiceItem().setTitle(title).setRequired(!!required);
    if (help) it.setHelpText(help);
    var showOther = false;
    var opts = options.filter(function (o) {
      if (o === 'Outro') { showOther = true; return false; }
      return true;
    });
    it.setChoiceValues(opts);
    if (showOther) it.showOtherOption(true);
    return it;
  }
  // A single mandatory checkbox acting as one "I confirm this statement" item.
  function confirmCheckbox(statement) {
    return form.addCheckboxItem()
      .setTitle('Declaração de consentimento')
      .setHelpText(statement)
      .setChoiceValues(['Confirmo'])
      .setRequired(true);
  }

  // ======================================================================
  // 1. CONSENTIMENTO, PRIVACIDADE E LIMITES
  // ======================================================================
  section('1. Consentimento, privacidade e limites');

  long('1. Como você deseja ser identificada na história?',
    'Informe o nome ou pseudônimo que deseja usar. Evite incluir nome completo, endereço, ' +
    'documentos ou outros dados que não sejam necessários.');

  long('2. Qual é a sua idade ou faixa etária? Como você se identifica em relação a gênero?',
    'Responda apenas ao que se sentir confortável em informar.');

  long('3. Em que ambiente você gostaria que a história acontecesse?',
    'Pode indicar um tipo de lugar, região ampla, cenário real ou cenário imaginário. Para ' +
    'proteger sua privacidade, evite informar endereço ou localização exata.');

  info('4. Que estilo e forma de narração você prefere?');
  checkbox('Estilo', [
    'Realista', 'Fantástico', 'Poético', 'Dramático', 'Leve e acolhedor',
    'Com humor', 'Misturando realidade e fantasia', 'Outro'
  ]);
  multipleChoice('Narração', [
    'Pela própria protagonista', 'Pela Consciência', 'Pelo Cérebro',
    'Por um narrador externo', 'Por um personagem da psique', 'Outro'
  ]);

  long('5. Quais assuntos podem aparecer livremente, quais devem ser tratados com delicadeza e quais não devem aparecer?',
    'Indique também palavras, imagens, situações ou formas de abordagem que deseja evitar.');

  long('6. Quem poderá ler ou ouvir a história?',
    'Informe o público pretendido, como "somente eu", "terapeuta", "pessoas próximas" ou ' +
    '"público geral". Se ainda não souber, escreva "não definido".');

  multipleChoice('7. Como você autoriza o uso das suas respostas?', [
    'Autorizo o uso apenas para criar esta história, sem reutilização em outros projetos.',
    'Autorizo o uso para criar esta história e revisões diretamente relacionadas a ela.',
    'Autorizo adaptações criativas, desde que não permitam minha identificação.',
    'Autorizo adaptações criativas somente após revisar a versão proposta.',
    'Não autorizo o uso de determinadas respostas; indicarei quais abaixo.'
  ]);

  long('8. Quais informações não devem ser reproduzidas, mesmo de forma adaptada?',
    'Você pode indicar nomes, locais, datas, relações, acontecimentos ou qualquer outro ' +
    'elemento que deseja excluir.');

  multipleChoice('9. Você deseja revisar a história antes que ela seja compartilhada com qualquer outra pessoa?', [
    'Sim, a revisão é obrigatória.',
    'Sim, se houver conteúdo sensível.',
    'Não autorizo compartilhamento.',
    'Ainda não decidi.'
  ]);

  info('Aviso sobre privacidade',
    'Não inclua senhas, números de documentos, endereço completo, dados bancários, ' +
    'informações de terceiros que não sejam necessárias ou qualquer dado que possa colocar ' +
    'você ou outra pessoa em risco.\n\n' +
    'As respostas devem ser armazenadas, acessadas e compartilhadas somente por pessoas ' +
    'autorizadas e pelo tempo necessário à finalidade informada. Se este formulário for ' +
    'aplicado por uma organização, ela deverá informar previamente quem terá acesso, onde os ' +
    'dados serão armazenados, por quanto tempo e como solicitar correção ou exclusão, conforme ' +
    'a legislação aplicável.');

  // ======================================================================
  // 2. IDENTIDADE E IMAGEM EXTERNA
  // ======================================================================
  section('2. Identidade e imagem externa');

  long('10. Como você se descreveria para alguém que nunca a conheceu?',
    'Inclua apenas os aspectos que deseja transformar em material narrativo.');
  long('11. Como as outras pessoas costumam enxergá-la, e que imagem você tenta mostrar ao mundo?');
  long('12. O que poucas pessoas sabem sobre você?',
    'Não inclua informações que possam identificar ou expor terceiros sem necessidade.');
  long('13. O que você mais admira em si e o que tem dificuldade de aceitar?');
  long('14. Complete a frase: "As pessoas pensam que eu sou __________, mas por dentro eu me sinto __________."');

  // ======================================================================
  // 3. INFÂNCIA E FORMAÇÃO DA PSIQUE
  // ======================================================================
  section('3. Infância e formação da psique');

  long('15. Qual é sua primeira lembrança marcante e como era o ambiente da sua casa durante a infância?',
    'Conte somente o que desejar. Não é necessário fornecer detalhes gráficos ou identificáveis.');
  long('16. Você se sentia protegida e emocionalmente cuidada? Quem exercia esse papel?');
  long('17. O que acontecia quando você chorava, errava, sentia raiva ou discordava dos adultos?');
  checkbox('18. Que papel você precisava desempenhar para ser aceita?', [
    'Boazinha', 'Forte', 'Responsável', 'Perfeita', 'Obediente', 'Invisível', 'Rebelde',
    'Pacificadora', 'Engraçada', 'Cuidadora', 'Problemática',
    'Não sentia que precisava desempenhar um papel específico', 'Outro', 'Prefiro não responder'
  ]);
  long('19. Quais frases ou mensagens dos adultos mais influenciaram a forma como você se vê?');
  long('20. O que você mais precisava receber e não recebeu? Em que momento sentiu que precisou amadurecer antes da hora?');
  long('21. Existe alguma situação da infância que ainda parece acontecer dentro de você? Se pudesse encontrar a criança que foi, o que ela pediria?');

  // ======================================================================
  // 4. EXPERIÊNCIAS MARCANTES E SOFRIMENTO
  // ======================================================================
  section('4. Experiências marcantes e sofrimento');

  long('22. Quais acontecimentos dividiram sua vida em "antes" e "depois"?',
    'Conte apenas o que desejar. Você pode falar de forma geral, sem descrever detalhes. Não é ' +
    'necessário nomear pessoas ou fornecer datas e locais.');
  long('23. Existe algo que você diz ter superado, mas que ainda dói?');
  long('24. Qual foi um momento em que você se sentiu muito sozinha? O que ajudou você a atravessar aquela fase?');
  long('25. Existe algo pelo qual ainda se culpa, alguém de quem espera um pedido de perdão ou alguém que sente precisar perdoar?',
    'Você não precisa identificar ninguém nem decidir agora se deseja perdoar.');
  long('26. O que essas experiências fizeram você acreditar sobre si mesma, sobre o amor, sobre as pessoas e sobre o mundo?');

  // ======================================================================
  // 5. GATILHOS, EMOÇÕES E REAÇÕES
  // ======================================================================
  section('5. Gatilhos, emoções e reações');

  long('27. Quais situações despertam reações muito intensas em você?',
    'Descreva, se possível, o que costuma acontecer imediatamente antes. Evite detalhes que ' +
    'possam colocar alguém em risco.');
  long('28. O que acontece em seu corpo, quais pensamentos surgem e qual emoção aparece primeiro nesses momentos?');
  long('29. Qual emoção você demonstra e qual emoção pode estar escondida por trás dela?',
    'Use "não sei" se não conseguir identificar.');
  long('30. Quando você grita, se cala ou se afasta, o que gostaria que a outra pessoa entendesse e do que está tentando se proteger?');
  checkbox('31. O que sente depois dessas reações?', [
    'Alívio', 'Culpa', 'Vergonha', 'Vazio', 'Medo', 'Arrependimento', 'Cansaço', 'Confusão',
    'Outro', 'Prefiro não responder'
  ]);
  long('32. Essas reações lembram o comportamento de alguém da sua família? Em que idade você se sente emocionalmente quando isso acontece?');
  long('33. O que poderia ajudá-la a se sentir mais segura antes de reagir?');

  // ======================================================================
  // 6. RELACIONAMENTOS E PADRÕES PERCEBIDOS
  // ======================================================================
  section('6. Relacionamentos e padrões percebidos',
    'As perguntas desta seção exploram padrões percebidos, não determinam quem você é nem ' +
    'permitem concluir, sozinhas, a causa de um comportamento.');

  long('34. O que costuma se repetir em seus relacionamentos?',
    'Descreva os padrões que percebe, sem precisar identificar outras pessoas.');
  checkbox('35. Quais comportamentos você costuma apresentar nas relações?', [
    'Perseguir', 'Afastar-se', 'Controlar', 'Agradar', 'Testar o amor', 'Provocar conflitos',
    'Salvar o outro', 'Aceitar além do próprio limite', 'Encerrar antes de ser abandonada',
    'Pedir desculpas mesmo sem entender o motivo', 'Evitar conversas difíceis', 'Outro',
    'Prefiro não responder'
  ]);
  long('36. O que você mais teme em uma relação e o que faz quando sente que não é amada?');
  long('37. Como demonstra amor e como gostaria de recebê-lo?');
  long('38. Como reage quando alguém coloca limites em você? Você consegue pedir ajuda diretamente?');
  long('39. Quais comportamentos promete não repetir, mas acaba repetindo? O que acredita estar tentando resolver por meio deles?');

  // ======================================================================
  // 7. ESTRATÉGIAS DE PROTEÇÃO E VOZ INTERIOR
  // ======================================================================
  section('7. Estratégias de proteção e voz interior',
    'Os itens abaixo são descrições possíveis de estratégias de proteção, não rótulos ' +
    'clínicos. Marque somente o que fizer sentido para você.');

  checkbox('40. Quando uma verdade dói, quais estratégias você costuma usar para não entrar em contato com o que sente?', [
    'Negar o que aconteceu', 'Encontrar explicações lógicas para tudo',
    'Atribuir ao outro sentimentos ou intenções que podem ser meus',
    'Descontar a raiva em outra pessoa', 'Fazer piadas', 'Controlar pessoas ou situações',
    'Afastar alguém quando começo a gostar', 'Agir como se não precisasse de ninguém',
    'Esquecer, bloquear ou evitar determinados períodos',
    'Transformar o sofrimento em trabalho, arte, cuidado, estudo ou criação',
    'Procurar ajuda', 'Isolar-me', 'Outro', 'Nenhuma dessas opções', 'Prefiro não responder'
  ]);
  long('41. Qual dessas estratégias já protegeu você no passado, mas hoje está prejudicando sua vida?');
  long('42. O que sua voz crítica costuma dizer? De onde você acha que essas mensagens vieram?',
    'Não é necessário atribuí-las a uma pessoa específica.');
  long('43. O que você exige de si mesma e em quais situações se sente insuficiente?');
  long('44. O que acredita que aconteceria se deixasse de ser forte, perfeita ou responsável?');
  long('45. O que você acha que precisa fazer para merecer amor? Como reage aos próprios erros e ao descanso?');
  long('46. Que parte sua precisa ser acolhida, e não corrigida?');

  // ======================================================================
  // 8. CORPO, EMOÇÕES E REGULAÇÃO
  // ======================================================================
  section('8. Corpo, emoções e regulação');

  long('47. Como o medo, a raiva e a tristeza aparecem em seu corpo?');
  long('48. Como seu corpo avisa que você está chegando ao limite?',
    'Você pode mencionar ansiedade, insônia, dores, compulsões, esgotamento ou outras ' +
    'manifestações, sem precisar descrevê-las em detalhes.');
  long('49. O que ajuda seu corpo a voltar ao equilíbrio? Em quais lugares ou com quais pessoas você sente que pode respirar?');

  // ======================================================================
  // 9. MOMENTO ATUAL E DIREÇÃO
  // ======================================================================
  section('9. Momento atual e direção');

  long('50. O que está acontecendo em sua vida neste momento e qual é seu maior conflito atual?');
  long('51. Que decisão você está evitando? O que sente que perdeu, teme perder, está tentando preservar ou já não cabe mais em sua vida?');
  long('52. Como imagina que estará daqui a um ano se nada mudar? E como gostaria de estar se conseguir mudar?');

  // ======================================================================
  // 10. RECURSOS E POSSIBILIDADES DE TRANSFORMAÇÃO
  // ======================================================================
  section('10. Recursos e possibilidades de transformação');

  long('53. O que já ajudou você a atravessar momentos difíceis? Quem são as pessoas com quem pode contar?',
    'Não informe dados de contato de terceiros neste campo.');
  long('54. Quais atividades fazem você se sentir viva? Qual foi uma situação em que se surpreendeu com a própria força?');
  long('55. O que ainda desperta esperança? O que gostaria de recuperar em si mesma?');
  long('56. Qual talento, qualidade ou parte sua ficou adormecida?');
  long('57. Que personagem interno poderia se tornar seu aliado? Se sua Consciência pudesse falar com você hoje, o que gostaria que ela dissesse?');

  // ======================================================================
  // 11. OBJETIVO E FORMATO DA HISTÓRIA
  // ======================================================================
  section('11. Objetivo e formato da história');

  long('58. Qual pergunta, comportamento ou padrão você gostaria que a história ajudasse a compreender ou transformar?',
    'A história pode favorecer reflexão, mas não promete produzir mudança, cura ou resposta definitiva.');
  long('59. Qual personagem da psique mais desperta sua curiosidade?');
  multipleChoice('60. Como você gostaria que a história terminasse?', [
    'Com uma resposta provisória', 'Com uma descoberta', 'Com uma reconciliação',
    'Com uma decisão', 'Com um recomeço', 'Com uma pergunta para reflexão', 'Ainda não sei'
  ]);
  long('61. O que você não quer sentir ao ler a história e o que gostaria de sentir?');
  long('62. Que mensagem deseja levar consigo depois da leitura?');
  long('63. Complete a frase: "Minha história não precisa terminar como começou porque __________."');

  // ======================================================================
  // 12. PROTOCOLO DE SEGURANÇA
  // ======================================================================
  section('12. Protocolo de segurança',
    'Esta seção não será transformada em cena, personagem ou elemento literário. Ela existe ' +
    'somente para orientar uma decisão de segurança. Não é uma avaliação clínica nem permite ' +
    'determinar, sozinha, o nível de risco.\n\n' +
    'Você pode responder "prefiro não responder". Se houver risco imediato, não continue o ' +
    'formulário: procure ajuda agora.');

  multipleChoice('64. Nas últimas semanas, você desejou desaparecer, dormir e não acordar, deixar de existir ou morrer?',
    ['Não', 'Sim', 'Prefiro não responder']);
  multipleChoice('65. Você está pensando em morrer ou em se machucar neste momento?',
    ['Não', 'Sim', 'Prefiro não responder']);
  multipleChoice('66. Você tem intenção de agir, fez algum plano, separou meios ou acredita que pode se machucar em breve?',
    ['Não', 'Sim', 'Não tenho certeza', 'Prefiro não responder'],
    'Não descreva métodos, locais ou detalhes operacionais neste formulário.');
  multipleChoice('67. Você se machucou recentemente ou está com algum ferimento que precisa de atendimento?',
    ['Não', 'Sim', 'Não tenho certeza', 'Prefiro não responder']);
  long('68. Você está sozinha neste momento? Há uma pessoa segura que possa ficar com você ou ajudar a buscar atendimento?',
    'Não informe dados de contato neste campo.');
  multipleChoice('69. Você tem acompanhamento psicológico, psiquiátrico ou médico relacionado ao que está vivendo?',
    ['Sim', 'Não', 'Já tive anteriormente', 'Estou tentando conseguir', 'Prefiro não responder']);

  info('70. Existe uma pessoa de confiança ou serviço que possa ser acionado se você não conseguir se manter segura?',
    'Informe somente o mínimo necessário.');
  short('Nome ou serviço');
  short('Telefone ou canal');
  short('Relação ou função');

  info('Protocolo diante de risco',
    '- Se a pessoa indicar intenção atual, plano, acesso a meios, ferimento grave, ' +
    'incapacidade de se manter segura ou risco iminente, interrompa a criação da história.\n' +
    '- Não deixe a pessoa sozinha. Incentive-a a permanecer com alguém de confiança e a ' +
    'afastar-se, com ajuda de outra pessoa, de meios potencialmente perigosos.\n' +
    '- Não peça detalhes sobre método, local, quantidade ou preparação. Não prometa sigilo ' +
    'absoluto quando a segurança estiver em risco.\n' +
    '- Procure atendimento de emergência imediatamente. No Brasil, ligue para o SAMU pelo 192 ' +
    'ou vá a uma UPA, pronto-socorro ou hospital. Em perigo imediato, acione também a ' +
    'emergência local.\n' +
    '- O CVV atende gratuitamente pelo 188, 24 horas por dia, oferecendo apoio emocional. O ' +
    'CVV não substitui atendimento de emergência.\n' +
    '- Se a pessoa for menor de idade, envolva um adulto responsável e serviços de proteção ' +
    'adequados, sem deixá-la sozinha.\n' +
    '- Se houver ferimento, intoxicação ou risco médico, priorize o SAMU, pronto-socorro ou ' +
    'hospital.\n' +
    '- Registre apenas as informações necessárias para a segurança e compartilhe-as somente ' +
    'com quem precisa agir.\n' +
    '- Retome o formulário apenas quando houver segurança suficiente e, de preferência, ' +
    'orientação de um profissional qualificado.\n\n' +
    'Se você estiver fora do Brasil, procure o número local de emergência, um serviço de ' +
    'crise ou o pronto atendimento mais próximo.');

  // ======================================================================
  // 13. CONSENTIMENTO FINAL E PREFERÊNCIAS DE USO
  // ======================================================================
  section('13. Consentimento final e preferências de uso',
    'Declaração de consentimento — para continuar, confirme cada item aplicável.');

  var declaracoes = [
    'Compreendo que esta atividade tem finalidade literária, reflexiva e educativa.',
    'Compreendo que ela não é teste, diagnóstico, avaliação psicológica, tratamento ou substituto de atendimento profissional.',
    'Sei que posso deixar perguntas sem resposta, corrigir respostas, retirar informações ou interromper o processo a qualquer momento.',
    'Autorizo o uso das minhas respostas somente dentro dos limites que indiquei neste formulário.',
    'Compreendo que adaptações criativas podem alterar ordem, cenário, nomes e detalhes, mas não devem expor informações que pedi para proteger.',
    'Sei que devo revisar e aprovar a versão final antes de qualquer compartilhamento, se essa foi minha escolha.',
    'Compreendo que não devo incluir dados desnecessários sobre mim ou sobre terceiros.',
    'Fui informada sobre quem terá acesso às respostas, como elas serão armazenadas, por quanto tempo serão mantidas e como solicitar correção ou exclusão, quando aplicável.',
    'Compreendo que, diante de risco imediato à segurança, a prioridade será interromper a atividade e buscar ajuda, podendo ser necessário compartilhar informações mínimas com serviços ou pessoas capazes de proteger alguém.',
    'Compreendo que temas sensíveis não serão romantizados, usados para culpar a pessoa ou apresentados como explicação única de seu sofrimento.'
  ];
  declaracoes.forEach(function (texto) { confirmCheckbox(texto); });

  long('Limites adicionais ou pedidos de exclusão');
  short('Nome ou pseudônimo');
  dateItem('Data');
  short('Assinatura ou confirmação');

  multipleChoice('Você confirma que leu e concorda com os termos acima?', [
    'Sim, confirmo e autorizo dentro dos limites indicados.',
    'Não concordo e não desejo continuar.',
    'Preciso esclarecer dúvidas antes de decidir.'
  ], null, true);

  info('Contato para dúvidas sobre privacidade e uso das respostas');
  short('Responsável ou serviço');
  short('Canal de contato');
  long('Prazo ou procedimento para solicitar correção, exclusão ou retirada de consentimento');

  // ---------- done ----------
  Logger.log('Formulário criado com sucesso!');
  Logger.log('Editar: ' + form.getEditUrl());
  Logger.log('Responder: ' + form.getPublishedUrl());
}
