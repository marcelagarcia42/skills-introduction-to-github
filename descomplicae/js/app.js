'use strict';

/* ---------------------------------------------------------
   DADOS: matérias e tópicos
--------------------------------------------------------- */

const SUBJECTS = {
  matematica: { name: 'Matemática', emoji: '🧮', color: '#3d6cd6', tagline: 'Números, contas e lógica sem mistério.' },
  quimica:    { name: 'Química',    emoji: '⚗️', color: '#2f9e6e', tagline: 'Reações e substâncias explicadas na prática.' },
  fisica:     { name: 'Física',     emoji: '🪐', color: '#d67a3d', tagline: 'Como o mundo se move, explicado de verdade.' },
  biologia:   { name: 'Biologia',   emoji: '🌱', color: '#2f9e6e', tagline: 'A vida, célula por célula, sem decoreba.' },
};

const GRADE_ORDER = ['5º ano', '6º ano', '7º ano', '8º ano', '9º ano', '1ª série EM', '2ª série EM', '3ª série EM'];

const TOPICS = [
  // ---------------- MATEMÁTICA ----------------
  {
    id: 'fracoes-equivalentes',
    subject: 'matematica',
    grade: '6º ano',
    title: 'Frações equivalentes',
    purpose: 'Serve para comparar, somar e simplificar frações — e entender que a mesma quantidade pode ser escrita de jeitos diferentes.',
    zero: 'Uma fração é só um jeito de dizer "quantas partes eu peguei de um todo dividido em pedaços iguais". Frações equivalentes são frações diferentes na escrita, mas que representam exatamente a mesma quantidade. É tipo escrever a mesma ideia com palavras diferentes: "metade" e "50%" dizem a mesma coisa.',
    comparison: 'Imagine uma pizza redonda. Se você corta ela em 2 pedaços e come 1, você comeu 1/2 da pizza. Se em vez disso alguém corta a mesma pizza em 4 pedaços e te dá 2, você também comeu metade da pizza — só que agora é 2/4. 1/2 e 2/4 são frações equivalentes: quantidades iguais, corte diferente.',
    symbols: [
      { symbol: 'numerador (número de cima)', meaning: 'quantas partes você pegou' },
      { symbol: 'denominador (número de baixo)', meaning: 'em quantas partes o todo foi dividido' },
      { symbol: 'a/b = c/d', meaning: 'as duas frações valem a mesma quantidade' },
    ],
    goldenRule: 'Para achar uma fração equivalente, multiplique (ou divida) o numerador E o denominador pelo mesmo número. Se você mexe só em um dos dois, a fração muda de valor.',
    commonMistake: 'O erro mais comum é somar ou multiplicar só o número de cima e esquecer o de baixo (ou vice-versa). Lembre: o que você faz de um lado, tem que fazer do outro, senão a "receita" da fração muda.',
    exampleProblem: 'Encontre uma fração equivalente a 3/5, com denominador 20.',
    steps: [
      'Descubra por quanto o denominador foi multiplicado: de 5 para 20 é preciso multiplicar por 4 (porque 5 × 4 = 20).',
      'Multiplique o numerador pelo mesmo número: 3 × 4 = 12.',
      'Monte a nova fração com os dois resultados: 12/20.',
      'Confira: 3/5 e 12/20 representam a mesma parte do todo, então são equivalentes.',
    ],
    method: [
      'Olhe o que mudou no denominador (multiplicou ou dividiu por quanto).',
      'Aplique a mesma operação no numerador.',
      'Escreva a fração nova.',
      'Se quiser conferir, simplifique as duas frações até o "osso" — se derem no mesmo resultado, são equivalentes.',
    ],
    faq: [
      { q: 'Por que não posso só mexer no número de cima?', a: 'Porque o denominador diz em quantas partes o todo foi cortado. Se você não muda o corte junto, a fração deixa de representar a mesma quantidade — vira outra coisa.' },
      { q: 'Simplificar fração é o contrário de achar equivalente?', a: 'Não é o contrário, é o mesmo processo ao contrário: simplificar é dividir numerador e denominador pelo mesmo número para deixar a fração "no seu tamanho mínimo".' },
      { q: 'Toda fração tem infinitas equivalentes?', a: 'Sim! Basta multiplicar por 2, por 3, por 10... sempre dos dois lados. Por isso 1/2, 2/4, 3/6, 4/8... nunca acabam.' },
    ],
    extraExamples: [
      'Pensa numa barra de chocolate com 6 quadradinhos. Comer 2 quadradinhos é 2/6 da barra. Se a mesma barra tivesse só 3 pedaços maiores, comer 1 pedaço seria 1/3 — e 2/6 = 1/3, é a mesma quantidade de chocolate.',
      'Numa receita, "meia xícara" (1/2) é igual a "duas xícaras de 1/4" (2/4). Você pode medir dos dois jeitos que o bolo fica do mesmo tamanho.',
      'Numa fila de 10 pessoas, 5 serem meninas é 5/10 do total. Isso é igual a dizer que 1/2 da fila é de meninas — os números mudam, a proporção não.',
    ],
    exercise: {
      question: 'Qual fração é equivalente a 2/3?',
      options: ['3/2', '4/6', '2/6', '5/6'],
      correctIndex: 1,
      explanation: 'Multiplicando numerador e denominador de 2/3 por 2, temos 4/6. As outras opções mudam só um dos números ou invertem a fração, o que muda o valor.',
    },
  },
  {
    id: 'teorema-pitagoras',
    subject: 'matematica',
    grade: '9º ano',
    title: 'Teorema de Pitágoras',
    purpose: 'Serve para descobrir o tamanho de um lado de um triângulo retângulo quando você já sabe os outros dois — muito usado em construção, mapas e design.',
    zero: 'O Teorema de Pitágoras é uma regra que só funciona em triângulos retângulos (aqueles que têm um ângulo de 90°, um "cantinho quadrado"). Ele relaciona os três lados desse triângulo: os dois lados menores (catetos) e o lado mais comprido, que fica de frente para o ângulo reto (hipotenusa).',
    comparison: 'Pensa numa escada encostada na parede. A parede é um cateto (vertical), o chão até o pé da escada é o outro cateto (horizontal), e a escada em si é a hipotenusa. Se você sabe a altura da parede e a distância do pé da escada até a parede, o teorema te diz o comprimento exato da escada — sem precisar medir com fita métrica.',
    symbols: [
      { symbol: 'a', meaning: 'hipotenusa: o lado mais comprido, sempre oposto ao ângulo de 90°' },
      { symbol: 'b e c', meaning: 'catetos: os dois lados que formam o ângulo reto' },
      { symbol: 'a² = b² + c²', meaning: 'o quadrado da hipotenusa é igual à soma dos quadrados dos catetos' },
    ],
    goldenRule: 'A hipotenusa é SEMPRE o maior lado e fica sozinha de um lado da igualdade (a² = b² + c²). Nunca troque ela de lugar com um cateto.',
    commonMistake: 'O erro mais comum é somar os catetos direto (b + c) achando que dá a hipotenusa. Não dá! Primeiro eleva cada um ao quadrado, depois soma, e só no final tira a raiz quadrada.',
    exampleProblem: 'Um triângulo retângulo tem catetos de 3 cm e 4 cm. Qual é a medida da hipotenusa?',
    steps: [
      'Escreva a fórmula: a² = b² + c².',
      'Substitua pelos valores dados: a² = 3² + 4².',
      'Calcule os quadrados: a² = 9 + 16.',
      'Some: a² = 25.',
      'Tire a raiz quadrada dos dois lados para isolar "a": a = √25 = 5 cm.',
    ],
    method: [
      'Confirme que o triângulo tem um ângulo reto (90°) — o teorema só vale para esse caso.',
      'Identifique qual lado é a hipotenusa (o mais comprido, oposto ao ângulo reto).',
      'Escreva a² = b² + c² substituindo os valores que você já conhece.',
      'Resolva as potências, some, e por último tire a raiz quadrada do resultado.',
    ],
    faq: [
      { q: 'Funciona para qualquer triângulo?', a: 'Não, só para triângulos retângulos (com um ângulo de exatamente 90°). Em outros triângulos existem outras fórmulas.' },
      { q: 'Como sei qual lado é a hipotenusa?', a: 'É sempre o lado mais comprido do triângulo, e fica "de frente" para o ângulo reto — ou seja, não encosta nele.' },
      { q: 'E se eu souber a hipotenusa e só um cateto?', a: 'Você isola o cateto que falta: por exemplo, se sabe "a" e "b", calcula c² = a² − b² e depois tira a raiz.' },
    ],
    extraExamples: [
      'Numa TV, o tamanho "50 polegadas" é a diagonal da tela — a hipotenusa de um triângulo formado pela largura e pela altura do aparelho.',
      'Um pipoqueiro de rua quer saber se cabe uma barraca de 3 m de largura por 4 m de comprimento numa vaga com diagonal de 5 m. Como 3² + 4² = 5², a barraca cabe certinho na diagonal.',
      'Um drone sobe 6 m na vertical e depois voa 8 m na horizontal. A distância em linha reta até ele (a hipotenusa) é √(6² + 8²) = √100 = 10 m.',
    ],
    exercise: {
      question: 'Um triângulo retângulo tem catetos de 6 cm e 8 cm. Qual é a hipotenusa?',
      options: ['14 cm', '10 cm', '48 cm', '100 cm'],
      correctIndex: 1,
      explanation: 'a² = 6² + 8² = 36 + 64 = 100. Tirando a raiz quadrada, a = 10 cm. "14 cm" é o erro de somar os catetos direto, e "100 cm" esquece de tirar a raiz no final.',
    },
  },

  // ---------------- QUÍMICA ----------------
  {
    id: 'substancias-misturas',
    subject: 'quimica',
    grade: '9º ano',
    title: 'Substâncias puras e misturas',
    purpose: 'Serve para entender do que as coisas ao nosso redor são feitas — se é "uma coisa só" ou uma combinação de várias — e é a base para entender reações químicas depois.',
    zero: 'Tudo que existe é feito de matéria, e essa matéria pode estar organizada de dois jeitos: substância pura (só um tipo de material, com composição sempre igual, como água pura ou ouro puro) ou mistura (dois ou mais materiais juntos, como o ar ou a água do mar). As misturas ainda se dividem em homogêneas (você não consegue distinguir os componentes a olho nu, como água com açúcar dissolvido) e heterogêneas (dá para ver as partes separadas, como água com óleo).',
    comparison: 'Pensa num copo de água mineral: é basicamente uma substância só, sempre com a mesma "receita" (mistura homogênea de sais bem diluídos, mas tratada como praticamente pura no dia a dia). Agora pensa numa salada de frutas: dá pra ver o pedaço de manga, o de banana, cada um mantendo sua identidade — isso é uma mistura heterogênea. Já um suco de laranja bem batido, sem pedaços visíveis, é uma mistura homogênea: os ingredientes estão lá, só que misturados até ficarem indistinguíveis a olho nu.',
    symbols: [
      { symbol: 'substância pura', meaning: 'um único tipo de material, com propriedades fixas (ponto de fusão e fervura constantes)' },
      { symbol: 'mistura homogênea', meaning: 'aparência uniforme, uma fase só, componentes não visíveis a olho nu' },
      { symbol: 'mistura heterogênea', meaning: 'mais de uma fase, dá para ver ou perceber as partes diferentes' },
    ],
    goldenRule: 'Para classificar, pergunte: "eu enxergo (ou percebo) partes diferentes?" Se sim, é heterogênea. Se não, é homogênea ou substância pura — aí você confere se tem mais de um componente na "receita".',
    commonMistake: 'O erro mais comum é achar que "transparente" é sinônimo de "puro". Água do mar é transparente, mas é uma mistura (água + sais + outros minerais). Transparência não define pureza — o que define é se há um ou mais de um componente.',
    exampleProblem: 'Classifique: (1) água e areia num copo, (2) ar atmosférico, (3) água destilada.',
    steps: [
      'Água e areia: dá para ver a areia depositada no fundo, separada da água → mistura heterogênea.',
      'Ar atmosférico: é uma combinação de gases (nitrogênio, oxigênio, entre outros) que não conseguimos distinguir a olho nu → mistura homogênea.',
      'Água destilada: passou por um processo que remove tudo que não é H₂O, sobrando só um tipo de molécula → substância pura.',
    ],
    method: [
      'Observe (ou imagine) a amostra: dá para distinguir partes diferentes visualmente?',
      'Se sim → mistura heterogênea.',
      'Se não, pergunte: existe mais de um tipo de componente ali, mesmo que misturado uniformemente?',
      'Se sim → mistura homogênea. Se não (só um componente) → substância pura.',
    ],
    faq: [
      { q: 'Leite é homogêneo ou heterogêneo?', a: 'A olho nu parece homogêneo, mas no microscópio dá para ver gotículas de gordura separadas da água — por isso é tecnicamente classificado como uma dispersão/mistura heterogênea (coloide).' },
      { q: 'Ouro 18 quilates é substância pura?', a: 'Não, é uma liga metálica — uma mistura homogênea de ouro com outros metais (como cobre e prata) para ficar mais resistente.' },
      { q: 'Como eu separo uma mistura?', a: 'Depende do tipo: filtração para sólido em líquido (areia e água), decantação para líquidos que não se misturam (água e óleo), destilação para separar líquidos misturados (álcool e água).' },
    ],
    extraExamples: [
      'Um armário de tempero: sal de cozinha puro é como um pote só com sal (substância pura). Já uma mistura de temperos prontos, tipo "tempero para carne", é uma mistura — pode ser homogênea se moída bem fininha, misturando tudo por igual.',
      'Refrigerante: é água + gás carbônico + açúcar + corantes, tudo misturado uniformemente — mistura homogênea, mesmo tendo vários "ingredientes".',
      'Uma calçada de granito tem pontinhos de cores diferentes visíveis a olho nu — é uma mistura heterogênea sólida, bem diferente de uma barra de ferro puro.',
    ],
    exercise: {
      question: 'Qual das opções abaixo é um exemplo de mistura heterogênea?',
      options: ['Água com sal totalmente dissolvido', 'Água e óleo em um copo', 'Água destilada', 'Ar atmosférico'],
      correctIndex: 1,
      explanation: 'Água e óleo não se misturam: formam duas camadas visíveis, então é heterogênea. As outras três têm aparência uniforme (uma fase só), então são homogêneas ou substâncias puras.',
    },
  },
  {
    id: 'estequiometria',
    subject: 'quimica',
    grade: '2ª série EM',
    title: 'Estequiometria: proporções de uma reação',
    purpose: 'Serve para calcular exatamente quanto de cada substância é preciso (ou vai ser produzido) numa reação química — essencial em indústria, remédios e até para não desperdiçar reagente num experimento.',
    zero: 'Estequiometria é basicamente "matemática da receita química". Toda reação balanceada mostra a proporção fixa entre as substâncias que reagem e as que são formadas. Se você sabe a quantidade de uma substância, consegue calcular a quantidade de todas as outras usando essa proporção — do mesmo jeito que uma receita de bolo diz "para cada 2 ovos, use 1 xícara de farinha".',
    comparison: 'Pensa numa receita de sanduíche: 2 fatias de pão + 1 fatia de queijo = 1 sanduíche. Se você tem 10 fatias de pão, só consegue montar 5 sanduíches — mesmo que sobre queijo, o pão é o que limita. Na química é igual: a equação balanceada é a "receita", e o reagente que acaba primeiro (o reagente limitante) decide quanto produto você consegue formar.',
    symbols: [
      { symbol: 'coeficientes (números na frente das fórmulas)', meaning: 'a proporção em número de mols entre as substâncias' },
      { symbol: 'mol', meaning: 'a "dúzia" da química: uma quantidade fixa de partículas (6,02 × 10²³) usada para contar átomos e moléculas' },
      { symbol: 'reagente limitante', meaning: 'a substância que acaba primeiro e trava a quantidade máxima de produto' },
    ],
    goldenRule: 'Antes de calcular qualquer coisa, a equação TEM que estar balanceada (mesmo número de átomos de cada elemento nos dois lados). Sem balancear, a "receita" está errada e todo o cálculo sai errado.',
    commonMistake: 'O erro mais comum é usar direto a massa (em gramas) na proporção da equação. A proporção da equação é sempre em MOLS, não em gramas — por isso é preciso converter massa para mol antes (e mol para massa no final).',
    exampleProblem: 'Na reação balanceada N₂ + 3H₂ → 2NH₃, quantos mols de NH₃ são formados a partir de 6 mols de H₂ (supondo N₂ em excesso)?',
    steps: [
      'Olhe a proporção da equação balanceada: 3 mols de H₂ produzem 2 mols de NH₃.',
      'Monte a regra de três: 3 mols de H₂ está para 2 mols de NH₃, assim como 6 mols de H₂ está para "x" mols de NH₃.',
      'Resolva: x = (6 × 2) / 3.',
      'Calcule: x = 12 / 3 = 4 mols de NH₃.',
    ],
    method: [
      'Confirme que a equação está balanceada; se não estiver, balanceie primeiro.',
      'Converta os dados do problema para mol, se vierem em gramas (usando a massa molar).',
      'Monte uma regra de três usando os coeficientes da equação balanceada como proporção.',
      'Resolva a regra de três e, se o problema pedir massa, converta o resultado de mol de volta para gramas.',
    ],
    faq: [
      { q: 'Por que preciso balancear antes de calcular?', a: 'Porque os coeficientes balanceados são a "proporção oficial" da reação. Se a equação não estiver balanceada, os números não representam a reação de verdade, e a regra de três sai errada.' },
      { q: 'O que é reagente limitante, na prática?', a: 'É o ingrediente que acaba primeiro. Mesmo sobrando muito dos outros reagentes, a reação para de produzir quando o limitante se esgota — por isso ele "limita" a quantidade final de produto.' },
      { q: 'Preciso decidir o que é mol toda vez?', a: 'Sim, sempre que o problema der massa (gramas) em vez de mols. Use massa molar (g/mol) da tabela periódica para converter: mol = massa ÷ massa molar.' },
    ],
    extraExamples: [
      'Uma fábrica de bicicletas: 1 quadro + 2 rodas + 1 guidão = 1 bicicleta. Se chegam 50 quadros mas só 60 rodas (30 pares), as rodas limitam a produção a 30 bicicletas, mesmo sobrando 20 quadros parados.',
      'Uma pizzaria usa 200 g de queijo por pizza. Se sobram 3.000 g de queijo, dá para fazer 15 pizzas — é a mesma lógica de regra de três da estequiometria, só que com massa de queijo em vez de mols.',
      'Encher uma caixa de bombons: 1 caixa leva sempre 4 bombons de chocolate ao leite para 2 de chocolate branco. Se você tem 40 bombons de leite, só consegue montar caixas completas até acabar a proporção — sobrando ou faltando do outro tipo.',
    ],
    exercise: {
      question: 'Na equação balanceada 2H₂ + O₂ → 2H₂O, quantos mols de H₂O são formados a partir de 4 mols de H₂ (com O₂ suficiente)?',
      options: ['2 mols', '4 mols', '8 mols', '1 mol'],
      correctIndex: 1,
      explanation: 'A proporção é 2 mols de H₂ para 2 mols de H₂O, ou seja, 1 para 1. Com 4 mols de H₂, formam-se 4 mols de H₂O.',
    },
  },

  // ---------------- FÍSICA ----------------
  {
    id: 'velocidade-media',
    subject: 'fisica',
    grade: '8º ano',
    title: 'Velocidade média',
    purpose: 'Serve para calcular o quão rápido algo se move em um percurso — é o que o velocímetro médio de uma viagem mostra, e a base para entender movimento em Física.',
    zero: 'Velocidade média é a razão entre a distância total percorrida e o tempo total gasto para percorrer essa distância. Ela não te diz a velocidade em cada instante (às vezes você anda mais rápido, às vezes mais devagar) — ela te dá uma "média" de tudo isso junto.',
    comparison: 'Pensa numa viagem de carro de 240 km que durou 4 horas, mesmo parando no posto e enfrentando trânsito. A velocidade média foi 60 km/h — mas isso não significa que o carro andou a 60 km/h o tempo todo. Em alguns trechos foi a 100 km/h, em outros ficou parado. A média é como se você "espalhasse" toda a viagem numa velocidade constante que desse o mesmo resultado final.',
    symbols: [
      { symbol: 'v', meaning: 'velocidade média' },
      { symbol: 'ΔS (delta S)', meaning: 'distância total percorrida (deslocamento)' },
      { symbol: 'Δt (delta t)', meaning: 'tempo total gasto no percurso' },
      { symbol: 'v = ΔS / Δt', meaning: 'a velocidade média é a distância dividida pelo tempo' },
    ],
    goldenRule: 'Sempre use as mesmas unidades antes de dividir: se a distância está em km e o tempo em horas, a resposta sai em km/h. Misturar unidades (km com minutos, por exemplo) dá resultado errado.',
    commonMistake: 'O erro mais comum é esquecer de converter minutos para horas (ou vice-versa) antes de calcular. Por exemplo, "30 minutos" não é "0,30 horas" — é 0,5 horas (30 ÷ 60).',
    exampleProblem: 'Um ciclista percorre 15 km em 30 minutos. Qual é a velocidade média em km/h?',
    steps: [
      'Escreva a fórmula: v = ΔS / Δt.',
      'Converta o tempo para horas, já que a resposta será em km/h: 30 minutos = 30/60 = 0,5 hora.',
      'Substitua os valores: v = 15 km / 0,5 h.',
      'Calcule: v = 30 km/h.',
    ],
    method: [
      'Identifique a distância total (ΔS) e o tempo total (Δt) do problema.',
      'Confira se as unidades combinam com o que a pergunta pede (km e horas para km/h, por exemplo) e converta se precisar.',
      'Divida a distância pelo tempo: v = ΔS / Δt.',
      'Confira se a resposta faz sentido (velocidades normais de carro, pessoa ou bike ficam numa faixa razoável).',
    ],
    faq: [
      { q: 'Velocidade média é igual à velocidade do velocímetro?', a: 'Não necessariamente. O velocímetro mostra a velocidade instantânea (naquele exato momento), que pode variar o tempo todo. A velocidade média é o resultado de toda a viagem.' },
      { q: 'E se o objeto ficar parado em algum momento?', a: 'O tempo parado ainda conta no Δt (tempo total), então ele "puxa" a velocidade média para baixo, mesmo sem mudar a distância percorrida.' },
      { q: 'Como transformo km/h em m/s?', a: 'Divida por 3,6. Por exemplo, 36 km/h ÷ 3,6 = 10 m/s. Isso porque 1 km = 1000 m e 1 h = 3600 s.' },
    ],
    extraExamples: [
      'Numa maratona de 42 km terminada em 3 horas, a velocidade média do corredor foi 14 km/h — mesmo que ele tenha acelerado no fim e desacelerado nas subidas.',
      'Um ônibus escolar faz 20 km em 40 minutos, parando em vários pontos. A velocidade média (20 ÷ 40/60 = 30 km/h) é bem menor que a velocidade que ele atinge andando na avenida, justamente por causa das paradas.',
      'Se você nada 50 m numa piscina em 25 segundos, sua velocidade média é 2 m/s — um número só que resume toda a "história" da braçada, mais rápida no começo, mais cansada no fim.',
    ],
    exercise: {
      question: 'Um carro percorre 100 km em 2 horas. Qual é a velocidade média?',
      options: ['200 km/h', '50 km/h', '2 km/h', '100 km/h'],
      correctIndex: 1,
      explanation: 'v = ΔS / Δt = 100 km ÷ 2 h = 50 km/h. "200 km/h" é o erro de multiplicar em vez de dividir.',
    },
  },
  {
    id: 'leis-de-newton',
    subject: 'fisica',
    grade: '9º ano',
    title: 'Leis de Newton',
    purpose: 'Servem para explicar por que os objetos ficam parados, se movem ou mudam de movimento — a base de toda a mecânica, do carro que freia ao foguete que decola.',
    zero: 'Isaac Newton descreveu três leis que explicam a relação entre força e movimento. Resumindo cada uma: (1ª) um objeto só muda seu estado de movimento se uma força agir sobre ele; (2ª) quanto maior a força aplicada, maior a aceleração — e isso depende da massa do objeto; (3ª) toda força tem uma força de reação de mesma intensidade e direção oposta.',
    comparison: '1ª Lei (Inércia): quando o ônibus freia de repente, seu corpo continua "querendo" ir para frente — por isso você se desequilibra. Seu corpo estava em movimento e só uma força (o cinto, o banco) consegue mudar isso. 2ª Lei: é mais fácil empurrar um carrinho de supermercado vazio do que cheio — a mesma força produz mais aceleração quando a massa é menor. 3ª Lei: quando você pula de um barquinho pequeno em direção ao cais, o barco é empurrado para trás — sua força de "empurrar o barco" gera uma força igual empurrando você para frente.',
    symbols: [
      { symbol: 'F', meaning: 'força, medida em Newtons (N)' },
      { symbol: 'm', meaning: 'massa do objeto, em quilogramas (kg)' },
      { symbol: 'a', meaning: 'aceleração, em metros por segundo ao quadrado (m/s²)' },
      { symbol: 'F = m × a', meaning: 'fórmula da 2ª Lei de Newton: a força é igual à massa vezes a aceleração' },
    ],
    goldenRule: 'Força e aceleração são diretamente proporcionais (mais força, mais aceleração), mas massa e aceleração são inversamente proporcionais (mais massa, menos aceleração para a mesma força). Nunca troque essa relação.',
    commonMistake: 'O erro mais comum é confundir "não ter força nenhuma agindo" com "não ter movimento". Um objeto pode estar se movendo em linha reta e velocidade constante mesmo com força resultante igual a zero — isso também é inércia (1ª Lei), não precisa estar parado.',
    exampleProblem: 'Uma força de 20 N é aplicada em um carrinho de 4 kg. Qual é a aceleração produzida?',
    steps: [
      'Escreva a fórmula da 2ª Lei de Newton: F = m × a.',
      'Isole a aceleração: a = F / m.',
      'Substitua os valores: a = 20 N / 4 kg.',
      'Calcule: a = 5 m/s².',
    ],
    method: [
      'Identifique quais grandezas o problema já dá (força, massa ou aceleração) e qual ele pede.',
      'Escreva a fórmula F = m × a e isole a variável que falta.',
      'Substitua os valores conhecidos, com as unidades corretas (N, kg, m/s²).',
      'Calcule e confira se a resposta é coerente (objetos mais pesados aceleram menos com a mesma força).',
    ],
    faq: [
      { q: 'A 1ª Lei vale só para objetos parados?', a: 'Não. Ela vale tanto para objetos parados quanto para objetos em movimento retilíneo uniforme (velocidade constante em linha reta) — em ambos os casos, sem força resultante, o estado não muda.' },
      { q: 'A 3ª Lei significa que as forças se cancelam e nada se move?', a: 'Não, porque ação e reação atuam em corpos DIFERENTES. Quando você empurra a parede, a parede te empurra de volta — mas uma força age em você, a outra na parede, então elas não se cancelam.' },
      { q: 'Peso e massa são a mesma coisa?', a: 'Não! Massa é a quantidade de matéria (não muda de planeta para planeta). Peso é uma força (P = m × g), que muda conforme a gravidade do lugar.' },
    ],
    extraExamples: [
      '1ª Lei: uma toalha de mesa puxada rapidamente pode deixar os pratos praticamente parados no lugar — a inércia dos pratos "resiste" à mudança de movimento repentina.',
      '2ª Lei: chutar uma bola de futebol (leve) faz ela sair voando longe; chutar uma bola de boliche com a mesma força mal faz ela se mexer — mesma força, massas diferentes, acelerações bem diferentes.',
      '3ª Lei: um balão de festa cheio de ar, quando solto sem nó, sai voando para um lado enquanto o ar escapa para o outro — a força do ar saindo gera uma força de reação que empurra o balão.',
    ],
    exercise: {
      question: 'Uma força de 10 N é aplicada em um objeto de 2 kg. Qual é a aceleração?',
      options: ['20 m/s²', '5 m/s²', '12 m/s²', '0,2 m/s²'],
      correctIndex: 1,
      explanation: 'a = F / m = 10 N ÷ 2 kg = 5 m/s². "20 m/s²" é o erro de multiplicar F por m em vez de dividir.',
    },
  },

  // ---------------- BIOLOGIA ----------------
  {
    id: 'celula-unidade-da-vida',
    subject: 'biologia',
    grade: '6º ano',
    title: 'Célula: a unidade da vida',
    purpose: 'Serve para entender do que todo ser vivo é feito — do menor micróbio até você — e é a base para entender como o corpo funciona.',
    zero: 'A célula é a menor unidade capaz de realizar todas as funções da vida: nascer, se alimentar, crescer, se reproduzir e morrer. Todo ser vivo é formado por pelo menos uma célula. Seres unicelulares (como bactérias) têm apenas uma; seres multicelulares (como plantas, animais e nós) têm trilhões delas trabalhando juntas.',
    comparison: 'Pensa numa cidade grande: ela é feita de milhões de "unidades" (as casas e prédios), cada uma com suas próprias funções (morar, trabalhar, guardar coisas), mas todas conectadas por ruas e serviços comuns. O corpo é parecido: é feito de trilhões de células, cada uma com uma função própria (célula muscular, célula nervosa...), todas conectadas e trabalhando para o organismo inteiro funcionar.',
    symbols: [
      { symbol: 'membrana plasmática', meaning: 'a "parede da casa": controla o que entra e sai da célula' },
      { symbol: 'citoplasma', meaning: 'o espaço interno onde ficam as estruturas da célula, cheio de um líquido gelatinoso' },
      { symbol: 'núcleo', meaning: 'guarda o DNA, o "manual de instruções" da célula' },
    ],
    goldenRule: 'Toda célula tem, no mínimo, membrana + citoplasma + material genético. Sem essas três partes, não é considerado uma célula completa.',
    commonMistake: 'O erro mais comum é achar que célula é só o que se vê no microscópio de escola (redondinha e simples). Na verdade, existem tipos de célula bem diferentes entre si — uma célula nervosa é longa e fina, uma célula muscular é alongada, uma célula vegetal tem parede rígida extra. A forma muda de acordo com a função.',
    exampleProblem: 'Compare: uma célula animal e uma célula vegetal — o que a célula vegetal tem "a mais"?',
    steps: [
      'Liste o que as duas têm em comum: membrana plasmática, citoplasma e núcleo (com DNA).',
      'Observe a célula vegetal: ela vive presa no lugar (a planta não sai andando), então precisa de sustentação extra.',
      'Identifique as estruturas extras da célula vegetal: parede celular (rígida, dá suporte), cloroplastos (fazem fotossíntese) e um grande vacúolo (guarda água e nutrientes).',
      'Conclua: a célula vegetal tem tudo que a animal tem, mais essas três estruturas especializadas para a vida "presa ao solo" e produtora de energia própria via fotossíntese.',
    ],
    method: [
      'Pergunte: essa célula pertence a um ser vivo que se move sozinho ou fica fixo (como uma planta)?',
      'Se fica fixo e faz fotossíntese → provavelmente é célula vegetal (tem parede celular e cloroplasto).',
      'Se não tem parede celular rígida nem cloroplasto → é célula animal.',
      'Confirme olhando se há núcleo definido (organismo eucarionte, como plantas e animais) ou não (organismo procarionte, como bactérias).',
    ],
    faq: [
      { q: 'Bactéria tem núcleo?', a: 'Não. Bactérias são procariontes: o material genético fica solto no citoplasma, sem uma "casinha" (núcleo) separada por membrana. Plantas e animais são eucariontes, com núcleo bem definido.' },
      { q: 'Por que preciso saber sobre células se estudo o corpo inteiro?', a: 'Porque todo tecido, órgão e sistema do corpo é formado por células especializadas. Entender a célula é entender o "tijolinho" básico que explica como o corpo inteiro é construído.' },
      { q: 'Vírus é uma célula?', a: 'Não! Vírus não têm célula (não têm citoplasma nem estruturas próprias) — por isso muitos cientistas nem os consideram seres vivos "completos", já que dependem de uma célula hospedeira para se reproduzir.' },
    ],
    extraExamples: [
      'Uma célula nervosa (neurônio) é como um fio de eletricidade bem comprido, feito para levar informação rápido de um ponto a outro do corpo — sua forma alongada existe por causa dessa função.',
      'Uma célula muscular funciona como uma "molinha" que se contrai e relaxa, permitindo que você mexa o braço — o formato alongado ajuda nesse trabalho de encolher e esticar.',
      'Um tijolo de Lego sozinho não faz uma casa, mas milhões deles encaixados formam um castelo inteiro — assim como uma célula sozinha não faz um corpo, mas trilhões delas, organizadas, formam você.',
    ],
    exercise: {
      question: 'O que a célula vegetal tem que a célula animal NÃO tem?',
      options: ['Membrana plasmática', 'Citoplasma', 'Parede celular e cloroplasto', 'Núcleo'],
      correctIndex: 2,
      explanation: 'Membrana, citoplasma e núcleo (em eucariontes) existem nas duas. O que é exclusivo da célula vegetal é a parede celular (sustentação) e o cloroplasto (fotossíntese).',
    },
  },
  {
    id: 'fotossintese',
    subject: 'biologia',
    grade: '7º ano',
    title: 'Fotossíntese',
    purpose: 'Serve para entender como as plantas produzem seu próprio alimento e liberam o oxigênio que respiramos — a base de quase toda cadeia alimentar do planeta.',
    zero: 'Fotossíntese é o processo pelo qual plantas, algas e alguns microrganismos transformam luz do sol, água e gás carbônico em glicose (açúcar, que é o "alimento" da planta) e oxigênio. Ela acontece principalmente nas folhas, dentro de estruturas chamadas cloroplastos, que contêm um pigmento verde chamado clorofila.',
    comparison: 'Pensa numa fábrica de suco de laranja movida a energia solar: ela pega água e gás carbônico "de graça" do ambiente, usa a luz do sol como energia elétrica, e produz açúcar como produto final — jogando fora oxigênio como "sobra" do processo. A planta faz exatamente isso: usa a luz como "energia da fábrica" para transformar matéria-prima simples em alimento.',
    symbols: [
      { symbol: 'CO₂', meaning: 'gás carbônico, absorvido do ar pelas folhas' },
      { symbol: 'H₂O', meaning: 'água, absorvida principalmente pelas raízes' },
      { symbol: 'luz solar', meaning: 'a fonte de energia que "liga" o processo' },
      { symbol: 'C₆H₁₂O₆ (glicose) + O₂', meaning: 'os produtos finais: açúcar (alimento da planta) e oxigênio (liberado no ar)' },
    ],
    goldenRule: 'Fotossíntese CONSOME gás carbônico e PRODUZ oxigênio — é o oposto da respiração celular, que consome oxigênio e produz gás carbônico. Não troque essas duas direções.',
    commonMistake: 'O erro mais comum é achar que só as plantas respiram OU fazem fotossíntese, como se fossem processos alternativos. Na verdade, a planta faz as DUAS coisas o tempo todo: respira (como qualquer ser vivo, gastando energia) e faz fotossíntese (só durante o dia, com luz), produzindo mais oxigênio do que consome.',
    exampleProblem: 'Explique por que uma planta guardada num quarto totalmente escuro murcha e morre depois de um tempo, mesmo sendo regada normalmente.',
    steps: [
      'Sabemos que a fotossíntese precisa de luz para acontecer (é a fonte de energia do processo).',
      'Sem luz, a planta não consegue produzir glicose (seu alimento) mesmo tendo água e CO₂ disponíveis.',
      'A planta continua respirando (consumindo a pouca energia que tinha guardada), mas sem repor essa energia via fotossíntese.',
      'Com o tempo, a planta esgota suas reservas de energia e não consegue manter suas funções vitais, murchando e morrendo — mesmo regada, porque água sozinha não é alimento.',
    ],
    method: [
      'Identifique se o cenário tem luz disponível — sem luz, não há fotossíntese, só respiração.',
      'Verifique se há água e CO₂ suficientes — sem eles, a fotossíntese também trava mesmo com luz.',
      'Lembre que fotossíntese e respiração acontecem em direções opostas (uma produz O₂ e consome CO₂; a outra o contrário).',
      'Conclua o que acontece com a planta com base no que está faltando no cenário.',
    ],
    faq: [
      { q: 'Plantas respiram?', a: 'Sim! Todo ser vivo respira para obter energia das suas próprias células, o tempo todo, dia e noite. A fotossíntese só acontece com luz, mas a respiração nunca para.' },
      { q: 'De onde vem o oxigênio que a planta libera?', a: 'Vem da quebra da molécula de água (H₂O) durante a fotossíntese. O hidrogênio da água é usado para formar a glicose, e o oxigênio sobra e é liberado para o ar.' },
      { q: 'Por que as folhas são verdes?', a: 'Por causa da clorofila, o pigmento que absorve a luz do sol para a fotossíntese. Ela absorve bem as luzes azul e vermelha, mas reflete a luz verde — por isso enxergamos as folhas dessa cor.' },
    ],
    extraExamples: [
      'Um aquário bem iluminado com plantas aquáticas costuma ter bolhinhas de oxigênio subindo das folhas durante o dia — é a fotossíntese acontecendo em tempo real, liberando O₂ na água.',
      'Uma estufa fechada, cheia de plantas, tende a ficar com mais oxigênio e menos gás carbônico durante o dia — o oposto do que aconteceria dentro de um quarto fechado cheio de pessoas (que só respiram, sem fazer fotossíntese).',
      'Uma horta em vaso perto da janela cresce mais forte do que uma idêntica guardada num canto escuro do quarto — mesma água, mesma terra, mas luz diferente muda tudo.',
    ],
    exercise: {
      question: 'O que a fotossíntese consome e o que ela produz?',
      options: [
        'Consome O₂ e produz CO₂',
        'Consome CO₂ e água, produz glicose e O₂',
        'Consome glicose e produz água',
        'Consome luz e produz CO₂',
      ],
      correctIndex: 1,
      explanation: 'A fotossíntese usa luz como energia para transformar CO₂ e água em glicose (alimento da planta), liberando O₂ como subproduto. A opção 1 descreve a respiração celular, o processo inverso.',
    },
  },
];

/* ---------------------------------------------------------
   ESTADO
--------------------------------------------------------- */

const state = {
  currentSubject: null,
  currentTopicId: null,
  extraExampleIndex: {}, // topicId -> índice do próximo exemplo extra
  previousScreen: 'screen-home',
};

/* ---------------------------------------------------------
   NAVEGAÇÃO
--------------------------------------------------------- */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function openSubject(subjectKey) {
  state.currentSubject = subjectKey;
  renderSubjectScreen(subjectKey);
  showScreen('screen-subject');
}

function openTopic(topicId, cameFrom) {
  state.currentTopicId = topicId;
  state.previousScreen = cameFrom || 'screen-home';
  renderTopicScreen(topicId);
  showScreen('screen-topic');
}

/* ---------------------------------------------------------
   RENDER: HOME
--------------------------------------------------------- */

function renderSubjectGrid() {
  const grid = document.getElementById('subject-grid');
  grid.innerHTML = '';
  Object.entries(SUBJECTS).forEach(([key, subj]) => {
    const count = TOPICS.filter((t) => t.subject === key).length;
    const card = document.createElement('button');
    card.className = 'subject-card';
    card.style.setProperty('--subject-color', subj.color);
    card.innerHTML = `
      <span class="subject-card-emoji">${subj.emoji}</span>
      <span class="subject-card-name">${subj.name}</span>
      <span class="subject-card-count">${count} assunto${count === 1 ? '' : 's'}</span>
    `;
    card.addEventListener('click', () => openSubject(key));
    grid.appendChild(card);
  });
}

function renderSearchResults(query) {
  const box = document.getElementById('search-results');
  const q = query.trim().toLowerCase();
  if (!q) {
    box.hidden = true;
    box.innerHTML = '';
    return;
  }
  const matches = TOPICS.filter((t) =>
    t.title.toLowerCase().includes(q) ||
    t.purpose.toLowerCase().includes(q) ||
    SUBJECTS[t.subject].name.toLowerCase().includes(q)
  );
  box.hidden = false;
  if (matches.length === 0) {
    box.innerHTML = '<p class="search-empty">Nenhum assunto encontrado ainda. Estamos sempre adicionando novos! 🚀</p>';
    return;
  }
  box.innerHTML = '';
  matches.forEach((t) => {
    const subj = SUBJECTS[t.subject];
    const card = document.createElement('div');
    card.className = 'search-card';
    card.innerHTML = `
      <div class="search-card-top">
        <span class="pill" style="--pill-color:${subj.color}">${subj.emoji} ${subj.name}</span>
        <span class="pill pill-outline">${t.grade}</span>
      </div>
      <h3>${t.title}</h3>
      <p>${t.purpose}</p>
      <button class="btn btn-primary btn-start-zero">Começar do zero</button>
    `;
    card.querySelector('.btn-start-zero').addEventListener('click', () => openTopic(t.id, 'screen-home'));
    box.appendChild(card);
  });
}

/* ---------------------------------------------------------
   RENDER: SUBJECT (LISTA DE TÓPICOS)
--------------------------------------------------------- */

function renderSubjectScreen(subjectKey) {
  const subj = SUBJECTS[subjectKey];
  document.getElementById('subject-emoji').textContent = subj.emoji;
  document.getElementById('subject-name').textContent = subj.name;
  document.getElementById('subject-tagline').textContent = subj.tagline;
  document.getElementById('subject-topbar').style.setProperty('--subject-color', subj.color);

  const topics = TOPICS.filter((t) => t.subject === subjectKey);
  const byGrade = {};
  topics.forEach((t) => {
    if (!byGrade[t.grade]) byGrade[t.grade] = [];
    byGrade[t.grade].push(t);
  });

  const grades = Object.keys(byGrade).sort((a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b));

  const container = document.getElementById('topic-groups');
  container.innerHTML = '';
  grades.forEach((grade) => {
    const groupEl = document.createElement('div');
    groupEl.className = 'topic-group';
    groupEl.innerHTML = `<h2 class="topic-group-title">${grade}</h2>`;
    const list = document.createElement('div');
    list.className = 'topic-list';
    byGrade[grade].forEach((t) => {
      const item = document.createElement('button');
      item.className = 'topic-item';
      item.innerHTML = `
        <span class="topic-item-main">
          <span class="topic-item-title">${t.title}</span>
          <span class="topic-item-purpose">${t.purpose}</span>
        </span>
        <span class="topic-item-arrow">›</span>
      `;
      item.addEventListener('click', () => openTopic(t.id, 'screen-subject'));
      list.appendChild(item);
    });
    groupEl.appendChild(list);
    container.appendChild(groupEl);
  });
}

/* ---------------------------------------------------------
   RENDER: TOPIC DETAIL
--------------------------------------------------------- */

function renderTopicScreen(topicId) {
  const t = TOPICS.find((x) => x.id === topicId);
  const subj = SUBJECTS[t.subject];

  document.getElementById('topic-title').textContent = t.title;
  document.getElementById('topic-badges').innerHTML =
    `<span class="pill" style="--pill-color:${subj.color}">${subj.emoji} ${subj.name}</span> ` +
    `<span class="pill pill-outline">${t.grade}</span>`;

  const backBtn = document.getElementById('topic-back-btn');
  backBtn.onclick = () => showScreen(state.previousScreen);

  state.extraExampleIndex[t.id] = 0;

  const content = document.getElementById('topic-content');
  content.innerHTML = `
    <section class="block block-purpose">
      <h2>🎯 Para que serve</h2>
      <p>${t.purpose}</p>
    </section>

    <section class="block">
      <h2>🌱 Explicando do zero</h2>
      <p>${t.zero}</p>
    </section>

    <section class="block block-comparison">
      <h2>🔗 Comparando com a vida real</h2>
      <p>${t.comparison}</p>
    </section>

    <section class="block">
      <h2>🔤 O que significa cada símbolo</h2>
      <ul class="symbol-list">
        ${t.symbols.map((s) => `<li><strong>${s.symbol}</strong> — ${s.meaning}</li>`).join('')}
      </ul>
    </section>

    <section class="block block-golden">
      <h2>⭐ Regra de ouro</h2>
      <p>${t.goldenRule}</p>
    </section>

    <section class="block block-warning">
      <h2>⚠️ Cuidado! Erro mais comum</h2>
      <p>${t.commonMistake}</p>
    </section>

    <section class="block block-example">
      <h2>📝 Exemplo resolvido passo a passo</h2>
      <p class="example-problem">${t.exampleProblem}</p>
      <ol class="steps-list">
        ${t.steps.map((s) => `<li>${s}</li>`).join('')}
      </ol>
    </section>

    <section class="block block-method">
      <h2>✅ Método para repetir sozinho</h2>
      <ol class="method-list">
        ${t.method.map((s) => `<li>${s}</li>`).join('')}
      </ol>
    </section>

    <section class="block block-explain-more">
      <h2>💬 Explique de outro jeito</h2>
      <p id="extra-example-text" class="extra-example-text">${t.extraExamples[0]}</p>
      <button id="btn-explain-more" class="btn btn-secondary">Me dá outro exemplo 🔁</button>
    </section>

    <section class="block block-faq">
      <h2>❓ Dúvidas frequentes</h2>
      <div class="faq-list">
        ${t.faq.map((item, i) => `
          <details class="faq-item">
            <summary>${item.q}</summary>
            <p>${item.a}</p>
          </details>
        `).join('')}
      </div>
    </section>

    <section class="block block-exercise" id="exercise-block"></section>
  `;

  document.getElementById('btn-explain-more').addEventListener('click', () => {
    const idx = (state.extraExampleIndex[t.id] + 1) % t.extraExamples.length;
    state.extraExampleIndex[t.id] = idx;
    document.getElementById('extra-example-text').textContent = t.extraExamples[idx];
  });

  renderExercise(t);
}

function renderExercise(t) {
  const block = document.getElementById('exercise-block');
  const ex = t.exercise;

  function paint(selectedIndex) {
    block.innerHTML = `
      <h2>🏋️ Exercício com correção imediata</h2>
      <p class="exercise-question">${ex.question}</p>
      <div class="exercise-options">
        ${ex.options.map((opt, i) => {
          let cls = 'exercise-option';
          if (selectedIndex !== null) {
            if (i === ex.correctIndex) cls += ' is-correct';
            else if (i === selectedIndex) cls += ' is-wrong';
          }
          return `<button class="${cls}" data-i="${i}" ${selectedIndex !== null ? 'disabled' : ''}>${opt}</button>`;
        }).join('')}
      </div>
      ${selectedIndex !== null ? `
        <div class="exercise-feedback ${selectedIndex === ex.correctIndex ? 'feedback-correct' : 'feedback-wrong'}">
          <p class="exercise-feedback-title">${selectedIndex === ex.correctIndex ? '🎉 Certinho!' : '🤔 Quase!'}</p>
          <p>${ex.explanation}</p>
          <button class="btn btn-link" id="btn-try-again">Tentar de novo</button>
        </div>
      ` : ''}
    `;

    if (selectedIndex === null) {
      block.querySelectorAll('.exercise-option').forEach((btn) => {
        btn.addEventListener('click', () => paint(Number(btn.dataset.i)));
      });
    } else {
      document.getElementById('btn-try-again').addEventListener('click', () => paint(null));
    }
  }

  paint(null);
}

/* ---------------------------------------------------------
   INIT
--------------------------------------------------------- */

function initBackButtons() {
  document.querySelectorAll('[data-back-to]').forEach((btn) => {
    btn.addEventListener('click', () => showScreen(btn.dataset.backTo));
  });
}

function init() {
  renderSubjectGrid();
  initBackButtons();
  showScreen('screen-home');

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => renderSearchResults(e.target.value));
}

document.addEventListener('DOMContentLoaded', init);
