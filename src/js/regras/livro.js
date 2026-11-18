"use strict";
/* Regras do Livro de Regras de Assimilação RPG: dados de símbolos, aptidões, Saúde, Características, Assimilações (cartas), equipamentos, Conflitos e Ameaças (só nomes e números; os efeitos estão resumidos com palavras próprias). */
/* ===================== SISTEMA — Assimilação RPG (Livro de Regras) =====================
   Nomes e números seguem o livro. Os textos do livro NÃO estão aqui: cada entrada traz
   o nome oficial, o custo e um resumo curto da regra, escrito por nós para a mesa. */

/* ---------- Dados de símbolos ----------
   A = Sucesso · B = Adaptação · C = Pressão. Faces 1 a 12 (tabela de conversão do livro). */
const FACES = [null, "", "", "C", "C", "BC", "A", "AA", "AB", "ABC", "AAC", "ABBC", "CC"];
function faceSim(f) {
  const s = FACES[f] || "";
  return {
    a: (s.match(/A/g) || []).length,
    b: (s.match(/B/g) || []).length,
    c: (s.match(/C/g) || []).length
  };
}
// pool: {d6,d10,d12} → [{t:6,f:4,s:{a,b,c}}]
function rollPool(p) {
  const out = [];
  [6, 10, 12].forEach(t => {
    const n = Math.max(0, +(p["d" + t] || 0));
    for (let i = 0; i < n; i++) {
      const f = d(t);
      out.push({ t, f, s: faceSim(f) });
    }
  });
  return out;
}
function somaSim(list) {
  return list.reduce((o, x) => ({ a: o.a + x.s.a, b: o.b + x.s.b, c: o.c + x.s.c }), { a: 0, b: 0, c: 0 });
}
function poolTxt(p) {
  return (
    [6, 10, 12]
      .filter(t => +p["d" + t])
      .map(t => `${+p["d" + t]}d${t}`)
      .join(" + ") || "nenhum dado"
  );
}
function poolValor(p) {
  return (+p.d6 || 0) * 1 + (+p.d10 || 0) * 2 + (+p.d12 || 0) * 3;
}
// texto de custo "AABC" → {a,b,c}
function custoSim(s) {
  s = String(s || "").toUpperCase();
  const m = s.match(/(\d+)\s*([ABC])/);
  if (m && !/^[ABC]+$/.test(s)) {
    const o = { a: 0, b: 0, c: 0 };
    o[m[2].toLowerCase()] = +m[1];
    return o;
  }
  return {
    a: (s.match(/A/g) || []).length,
    b: (s.match(/B/g) || []).length,
    c: (s.match(/C/g) || []).length
  };
}
function simTxt(o) {
  return "A".repeat(o.a || 0) + "B".repeat(o.b || 0) + "C".repeat(o.c || 0);
}
// dano: cada símbolo do d10 (ou do dado indicado) é 1 ponto
function rolarDano(n, t = 10) {
  const r = rollPool({ ["d" + t]: n });
  return { dados: r, total: r.reduce((s, x) => s + x.s.a + x.s.b + x.s.c, 0) };
}

/* ---------- Aptidões ---------- */
const INSTINTOS = ["Influência", "Percepção", "Potência", "Reação", "Resolução", "Sagacidade"];
const CONHECIMENTOS = ["Biologia", "Erudição", "Engenharia", "Geografia", "Medicina", "Segurança"];
const PRATICAS = ["Armas", "Atletismo", "Expressão", "Furtividade", "Manufaturas", "Sobrevivência"];
const APTIDOES = [...CONHECIMENTOS, ...PRATICAS];
const INST_ABREV = {
  Influência: "INF",
  Percepção: "PER",
  Potência: "POT",
  Reação: "REA",
  Resolução: "RES",
  Sagacidade: "SAG"
};
// adjetivos genéricos do livro para cada nível
const NIV_INST = ["—", "Enfraquecida", "Normal", "De destaque", "Extraordinária", "Ápice"];
const NIV_CONH = ["Leiga", "Informada", "Conhecedora", "Especialista", "Mestra", "Sábia"];
const NIV_PRAT = ["Inábil", "Iniciante", "Praticante", "Profissional", "Veterana", "Extraordinária"];
// adjetivos próprios de cada Instinto (1 a 5)
const ADJ_INST = {
  Influência: ["Tímida", "Equilibrada", "Persuasiva", "Magnética", "Líder"],
  Percepção: ["Distraída", "Atenta", "Perspicaz", "Aguçada", "Vigilante"],
  Potência: ["Fraca", "Funcional", "Forte", "Poderosa", "Titânica"],
  Reação: ["Lenta", "Esperta", "Ágil", "Veloz", "Relâmpago"],
  Resolução: ["Vacilante", "Estável", "Determinada", "Inquebrável", "Indomável"],
  Sagacidade: ["Ingênua", "Razoável", "Astuta", "Brilhante", "Genial"]
};
const GERACOES = ["Geração pré-Colapso", "Geração-Colapso", "Geração pós-Colapso"];
const GERACAO_TXT = [
  "Nascidos e criados antes do Colapso",
  "Passaram pelo Colapso entre 5 e 12 anos",
  "Nasceram depois do Colapso ou tinham menos de 5 anos"
];

/* ---------- Saúde ---------- */
const SAUDE_NIVEIS = [
  null,
  "Incapacitação",
  "Debilitação",
  "Ferimentos",
  "Laceração",
  "Escoriação",
  "Saudável"
]; // índice = nível
function saudePen(n) {
  return n >= 5 ? 0 : n >= 3 ? 1 : 2;
} // A perdidos em todos os testes
function saudeRecTxt(n) {
  return n >= 5 ? "a cada repouso completo" : n >= 3 ? "a cada semana" : "não se recupera sozinho";
}

/* ---------- Características de Infectados ----------
   [nome, custo, requisitos ([[aptidão(s) separadas por |, mínimo]]), resumo] — "E" = nível de Assimilação; "criacao" = só na criação */
const CARACTERISTICAS = [
  [
    "Agricultor",
    1,
    [["Geografia", 1]],
    "+A em testes sobre plantas cultivadas (grãos, frutos, mudas, pragas)."
  ],
  [
    "Punhos de Ferro",
    1,
    [
      ["Potência", 2],
      ["Resolução", 2]
    ],
    "Usando 1 d para manter dado extra em combate desarmado, pode trocar 1 B por A."
  ],
  ["Cavaleiro", 1, [], "Ao conduzir montarias, pode trocar 1 B por A."],
  [
    "Estágio Avançado",
    1,
    [["criacao", 1]],
    "Só na criação: começa com +1 nível de Assimilação (e −1 de Determinação). O Assimilador aprova e conduz o Teste de Assimilação."
  ],
  [
    "Investigador da Assimilação",
    1,
    [["Biologia", 1]],
    "Em testes para entender a Assimilação, pode trocar 1 B por A."
  ],
  ["Saque Rápido", 1, [["Reação", 2]], "Não gasta B para sacar ou guardar equipamento, nem em Conflito."],
  ["Sono Leve", 1, [], "Pode testar Percepção para não ser surpreendido dormindo."],
  [
    "Trato com Animais",
    1,
    [["Influência", 2]],
    "Ao influenciar animais de forma amistosa, pode trocar 1 B por A."
  ],
  ["Viajado", 1, [], "Em contato com outras culturas e povos, anula 1 C."],
  [
    "Pegada Forte",
    1,
    [["Potência", 2]],
    "Para se segurar ou não deixar algo escapar das mãos, pode trocar 1 B por A."
  ],
  ["Piloto", 1, [], "Ao conduzir veículos, pode trocar 1 B por A."],
  [
    "Antecedente Marcante",
    2,
    [],
    "Ao ativar o Evento Marcante, rola +1 d10 (sem mudar quantos dados mantém)."
  ],
  ["Disciplinado", 2, [], "Fora de Conflito, sem ser perturbado, com calma e o dobro do tempo: ignora 1 C."],
  [
    "Aparência Inofensiva",
    2,
    [["Influência", 2]],
    "Em Conflito, gasta B ou A para encarecer (em B ou C) as ativações de Ameaça contra você no próximo turno."
  ],
  [
    "Artes Marciais",
    2,
    [
      ["Atletismo", 2],
      ["Reação", 2]
    ],
    "Em testes de artes marciais (golpear ou defender), remove 1 C."
  ],
  [
    "Atenção Redobrada",
    2,
    [["Percepção", 2]],
    "Contra perigo súbito ou emboscada, troca B por A até o seu valor de Reação."
  ],
  [
    "Atirador Astuto",
    2,
    [["Furtividade", 2]],
    "Atacando com pontaria protegido por cobertura, pode trocar 1 B por A."
  ],
  [
    "Dissimulado",
    2,
    [
      ["Influência", 2],
      ["Expressão|Furtividade", 1]
    ],
    "Se passa por morador de outro Refúgio (com roupas locais) com teste de Influência + Expressão ou Furtividade."
  ],
  ["Escaldado", 2, [["Sagacidade", 2]], "Em Percepção para notar segundas intenções, pode trocar 1 B por A."],
  ["Frugal", 2, [], "Aguenta o dobro do tempo sem água e comida antes de sofrer penalidade."],
  [
    "Intimidador",
    2,
    [],
    "Ao intimidar, pode gastar 1 d para usar a quantidade de um Instinto (aprovado) no lugar dos dados de Expressão."
  ],
  [
    "Batedor",
    2,
    [["Geografia", 2]],
    "Explora a Região na metade do tempo e acha um marco geográfico com teste de Geografia ou Sobrevivência."
  ],
  [
    "Mãos-Leves",
    2,
    [
      ["Reação", 2],
      ["Furtividade", 2]
    ],
    "Ao roubar ou esconder objetos à vista, adiciona 1 B."
  ],
  ["Memória Afiada", 2, [["Sagacidade", 2]], "Em testes para lembrar informações, ganha +A."],
  [
    "Presença Encantadora",
    2,
    [["Influência", 3]],
    "Gastando 1 d antes de rolar, anula todas as C em interações sociais."
  ],
  [
    "Relíquia",
    2,
    [],
    "O artefato inicial ignora o teto de Escassez e pode ser consertado mesmo Quebrado; perdê-lo custa 1 d."
  ],
  ["Sacrifício Heroico", 2, [], "Uma vez por sessão, sofre todo o dano no lugar de um aliado próximo."],
  ["[Sentido] Aguçado", 2, [["Percepção", 2]], "Escolha um sentido: Percepção com ele ganha +A."],
  [
    "Companheiro Animal",
    3,
    [["Sobrevivência", 1]],
    "Um animal pequeno ou médio te acompanha; quando ajuda, adiciona 1 B."
  ],
  [
    "Determinação Inabalável",
    3,
    [["Resolução", 3]],
    "Testes ligados aos seus Propósitos podem trocar 1 B por A."
  ],
  [
    "Construtor",
    3,
    [["Engenharia", 3]],
    "Faz Construções sem os testes semanais de Engenharia para gerar pontos de obra."
  ],
  [
    "Contra-ataque",
    3,
    [["Reação", 2]],
    "Depois de sofrer um ataque em Conflito, o próximo teste para Neutralizar aquela Ameaça ganha +A."
  ],
  ["Corpo Grande", 3, [["Atletismo", 2]], "Testes de Resolução de resistência física podem usar Potência."],
  [
    "Esquiva Precisa",
    3,
    [["Reação", 2]],
    "Investe A do resultado para que ataques contra você sofram a mesma quantidade de P."
  ],
  ["Gambiarra", 3, [["Sagacidade", 2]], "Pode mudar as características de Artefatos."],
  [
    "Inabalável",
    3,
    [["Resolução", 3]],
    "Em resistência mental ou emocional, troca B por A até o seu valor de Resolução vezes por sessão."
  ],
  ["Olhar Minucioso", 3, [["Percepção", 2]], "Percepção ou Sagacidade para achar algo escondido ganham +A."],
  [
    "Orientação",
    3,
    [["Geografia|Sobrevivência", 2]],
    "Geografia ou Sobrevivência para seguir rastro ou se localizar ganham +B."
  ],
  ["Racional", 3, [["Erudição", 2]], "Testes de Resolução de resistência mental podem usar Sagacidade."],
  ["Parkour", 3, [["Reação", 2]], "Escalar, equilibrar, saltar, correr curto e acrobacias ganham +B."],
  ["Recuperação Rápida", 3, [["Resolução", 2]], "Cada Recuperação regenera 2 pontos de Saúde a mais."],
  ["Primeiros Socorros", 3, [["Medicina", 2]], "Ao cuidar de ferimentos e doenças, ganha +A."],
  [
    "Resiliente",
    3,
    [["E", 2]],
    "Uma vez por Conflito, gasta pontos de Assimilação para reduzir o dano na mesma quantidade."
  ],
  [
    "Vaso Ruim",
    3,
    [["Resolução", 2]],
    "Anula a primeira ativação que te mataria; volta a valer depois de uma Clareza de Propósito."
  ],
  [
    "Herói Local",
    4,
    [["Influência", 3]],
    "Uma vez por arco, usa o Evento Marcante para impedir que o Refúgio perca um nível de Moral."
  ],
  [
    "MacGyver",
    4,
    [
      ["Sagacidade", 2],
      ["Manufaturas", 2]
    ],
    "Uma vez por sessão, monta um Artefato Improvisado com uma característica de categoria 1 até o fim da cena."
  ],
  [
    "Motivar Aliado",
    4,
    [["Expressão", 3]],
    "Em Apoiar Aliado, cada B anula CC do aliado; usos por sessão iguais à sua Influência."
  ],
  [
    "Suporte",
    4,
    [
      ["Influência", 2],
      ["Reação", 2]
    ],
    "Em Ajudar Aliado, adiciona +A ao que transfere."
  ],
  [
    "Mira Fatal",
    5,
    [
      ["Armas", 3],
      ["Percepção|Reação", 3]
    ],
    "Em ataques de pontaria, gasta 2 d para dobrar os A investidos em Neutralizar Ameaça."
  ]
];

/* ---------- Assimilações (cartas) ----------
   naipe: ev = Evolutivas (Copas ♥), ad = Adaptativas (Ouros ♦), in = Inoportunas (Espadas ♠), si = Singulares (Paus ♣)
   mutação: [nome, custo, E mínimo, resumo, efeito automático opcional] */
const NAIPES = {
  ev: { n: "Evolutivas", s: "♥", cor: "#e0524a" },
  ad: { n: "Adaptativas", s: "♦", cor: "#e0a03c" },
  in: { n: "Inoportunas", s: "♠", cor: "#9aa3ad" },
  si: { n: "Singulares", s: "♣", cor: "#5fd08a" }
};
const CARTAS_ORD = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
// série padrão das Evolutivas de um Instinto
const evInst = (i, n) => [
  [n[0], "A", 0, `+1 em ${i} (pode passar do limite).`, { op: "inst", t: i }],
  [n[1], "AA", 0, `Em testes com ${i}, gaste 1 e para somar +A.`, { op: "eA", t: i }],
  [n[2], "AAA", 0, `Testes com ${i} anulam 1 C.`, { op: "anulaC", t: i }],
  [n[3], "AAAA", 3, `Testes com ${i} podem trocar qualquer número de B por A.`, { op: "bToA", t: i }],
  [n[4], "AAAAA", 5, `Testes com ${i} ganham +A (soma com ${n[1]}).`, { op: "addA", t: i }],
  [n[5], "AAAAAA", 7, `Testes com ${i}: os d6 viram d10.`, { op: "conv", t: i }]
];
const ASSIMILACOES = {
  ev: {
    A: [
      "Sensitiva",
      "Sexto sentido para criaturas assimiladas e para o que vem pela frente.",
      [
        [
          "Sensibilidade",
          "A",
          0,
          "Gaste 1 d para sentir criaturas assimiladas a até 30 m pelo resto da cena."
        ],
        ["Consciência", "AA", 0, "Mantém +1 dado em testes com Percepção.", { op: "keep", t: "Percepção" }],
        ["Discernimento", "AAA", 0, "Adiciona B a um dado mantido que já tenha B, nos seus testes."],
        [
          "Presciência",
          "AAAA",
          3,
          "No começo da sessão rola 2 dados e guarda: pode trocar por dados do mesmo tipo de qualquer pessoa (uma vez cada)."
        ],
        [
          "Complicar",
          "AAAAA",
          5,
          "Gaste 1 d para alguém na sua presença rolar de novo um dado à sua escolha."
        ],
        ["Vidência", "AAAAAA", 7, "Prevê Crises: o Assimilador adia o efeito em até 24 h para você reagir."]
      ]
    ],
    2: [
      "Reativa",
      "Reflexos cada vez mais precisos.",
      evInst("Reação", ["Ligeiro", "Rápido", "Preciso", "Alígero", "Hábil", "Celeridade"])
    ],
    3: [
      "Sensorial",
      "Sentidos extraordinários.",
      evInst("Percepção", ["Perceptivo", "Alerta", "Detalhista", "Meticuloso", "Arguto", "Intuitivo"])
    ],
    4: [
      "Vigorosa",
      "Corpo e mente resistem a pressões e traumas.",
      evInst("Resolução", ["Resoluto", "Resistente", "Firme", "Vigoroso", "Persistente", "Inabalável"])
    ],
    5: [
      "Persuasiva",
      "Carisma e autoridade ampliados.",
      evInst("Influência", [
        "Influente",
        "Persuasivo",
        "Convincente",
        "Magnético",
        "Carismático",
        "Majestoso"
      ])
    ],
    6: [
      "Brutal",
      "Força bruta e explosão sobre-humanas.",
      evInst("Potência", ["Forte", "Robusto", "Pujante", "Potente", "Agressivo", "Devastador"])
    ],
    7: [
      "Perspicaz",
      "Raciocínio e cognição despertos.",
      evInst("Sagacidade", [
        "Sagaz",
        "Mente Assimilada",
        "Perfeccionista",
        "Solerte",
        "Potência Mental",
        "Genialidade"
      ])
    ],
    8: [
      "Regenerativa",
      "Regeneração além dos limites humanos.",
      [
        ["Resistente", "A", 0, "Ignora a penalidade do Nível de Saúde 4 (Laceração)."],
        ["Resiliente", "AA", 0, "Regenera sem ajuda médica mesmo no Nível 2 (Debilitação), em uma semana."],
        ["Vigoroso", "AAA", 0, "+1 ponto de Saúde em cada Nível.", { op: "saude", v: 1 }],
        ["Restauração", "AAAA", 3, "Ao concluir uma Recuperação, dobra os pontos regenerados."],
        ["Recuperação", "AAAAA", 5, "Depois de cada cena, regenera pontos iguais a Resolução + Potência."],
        [
          "Reintegração",
          "AAAAAA",
          7,
          "Regenera tudo em um dia (até partes perdidas), se não perder o último ponto."
        ]
      ]
    ],
    9: [
      "Silvestre",
      "Conexão profunda com a natureza.",
      [
        ["Sintonia Natural", "A", 0, "+1 em Biologia (pode passar do limite).", { op: "apt", t: "Biologia" }],
        ["Cura Verde", "AA", 0, "Gaste 1 d para reviver a vegetação morta ou danificada a até 5 m."],
        [
          "Fotossíntese",
          "AAA",
          0,
          "Fica esverdeado e não precisa comer: basta água, contato com o solo e 2 h de sol por dia."
        ],
        ["Animalismo", "AAAA", 3, "Para influenciar o comportamento de animais, +AA."],
        [
          "Refúgio Natural",
          "AAAAA",
          5,
          "Cria um Refúgio Vivo em área natural, equivalente a um Refúgio de nível 4."
        ],
        [
          "Gênese",
          "AAAAAA",
          7,
          "Gaste todos os e: flora e fauna crescem e obedecem num raio de 1 km por ponto até o fim da cena."
        ]
      ]
    ],
    10: [
      "Opressora",
      "Rivais ficam acuados e hesitantes.",
      [
        ["Aproveitador", "A", 0, "Influência contra alvo em inferioridade ou dúvida ganha +B."],
        ["Sugestão", "AA", 0, "Gaste 1 e: um alvo hesitante segue uma sugestão simples (sem se arriscar)."],
        [
          "Condicionamento",
          "AAA",
          0,
          "Depois de um sucesso com Influência, repete a frase para outro alvo da cena com o mesmo resultado."
        ],
        ["Imposição", "AAAA", 3, "Mantém +1 dado em Influência em locais pacíficos."],
        [
          "Mesmerizar",
          "AAAAA",
          5,
          "Com AA+ em Influência, impõe uma condição narrativa ao alvo até o fim da cena."
        ],
        ["Dominância", "AAAAAA", 7, "Soma seus pontos de Expressão à Defesa do seu Refúgio."]
      ]
    ],
    J: [
      "Esguia",
      "Motricidade adaptada para se esconder.",
      [
        ["Infiltrador", "A", 0, "Furtividade em ambiente urbano ou construído ganha +A."],
        [
          "Pulso Sombrio",
          "AA",
          0,
          "Gaste 1 e para rolar de novo um teste com Furtividade (uma vez por teste)."
        ],
        [
          "Esguio",
          "AAA",
          0,
          "Depois de uma Ação de Fuga, se houver outro alvo viável, a Ameaça precisa escolher outro."
        ],
        ["Subterfúgio", "AAAA", 3, "Fora de Conflito, só precisa de A para ter êxito em Furtividade."],
        ["Auxílio das Sombras", "AAAAA", 5, "Cada dado de Furtividade mantido ganha +B."],
        ["Ofuscação", "AAAAAA", 7, "Em testes com Furtividade, todos os dados ganham +A."]
      ]
    ],
    Q: [
      "Indomável",
      "Continua lutando nas piores condições.",
      [
        ["Fôlego Raro", "A", 0, "Atletismo com esforço contínuo (nadar, escalar, correr longe) ganha +A."],
        [
          "Perseverança",
          "AA",
          0,
          "Gaste 1 e ao entrar no Estado Suscetível: continua usando d até o fim da cena."
        ],
        ["Disposição", "AAA", 0, "Mantém +1 dado em testes com Atletismo.", { op: "keep", t: "Atletismo" }],
        ["Obstinação", "AAAA", 3, "Com AA+ em Atletismo, recupera 1 d no fim da cena (máximo 1 por cena)."],
        ["Irredutível", "AAAAA", 5, "Gaste 2 d para ignorar as penalidades de Saúde na rodada."],
        ["Intrépido", "AAAAAA", 7, "Imune a efeitos externos que dariam penalidade ou o impediriam de agir."]
      ]
    ],
    K: [
      "Primordial",
      "A essência pura da Assimilação no DNA.",
      [
        ["Primal", "A", 0, "O primeiro e que usar em cada Conflito é grátis."],
        ["Supressor", "AA", 0, "Gaste 1 e para anular C em qualquer teste seu em Conflito."],
        ["Subjugar", "AAA", 0, "Ao Neutralizar Ameaça com E maior que o alvo, +AA."],
        [
          "Proeza",
          "AAAA",
          3,
          "Gaste 2 e: usa seu nível de Assimilação no lugar do Instinto para montar os dados."
        ],
        ["Sinergia", "AAAAA", 5, "Pode pagar custos de e de aliados."],
        ["Poder Inesgotável", "AAAAAA", 7, "Não gasta e nas próprias ativações."]
      ]
    ]
  },
  ad: {
    A: [
      "Anatômica",
      "Corpo moldado para combate e deslocamento.",
      [
        [
          "Presas Aumentadas",
          "B",
          0,
          "Gaste 1 d para ter Letal ao morder; depois de comer carne crua, sem custo por 4 h."
        ],
        ["Nadadeiras", "BB", 0, "Gaste 1 e para nadar na velocidade normal. −1 nível em Furtividade."],
        ["Guelras", "BBB", 0, "Respira debaixo d'água, mas bebe o dobro de água."],
        [
          "Braços Alongados",
          "BBBB",
          3,
          "Ao Neutralizar, o alvo perde C no turno seguinte. −1 nível em Manufaturas."
        ],
        [
          "Poder de Carga",
          "BBBBB",
          5,
          "Carrega o triplo e dobra os pontos em Neutralização. Perde todos os níveis de Manufaturas."
        ],
        ["Alado", "BBBBBB", 7, "Asas de voo pleno: Fuga +AA. Não usa colete, mochila ou roupa nos ombros."]
      ]
    ],
    2: [
      "Cutânea",
      "Pele com novas capacidades.",
      [
        ["Pele Aderente", "B", 0, "Anda por paredes e tetos sem teste. Fuga correndo perde A."],
        [
          "Pele Ajustável",
          "BB",
          0,
          "Mantém +1 dado em Furtividade com pouca luz. −A em Expressão sob luz direta."
        ],
        ["Sentir Vibrações", "BBB", 0, "+A em Percepção pelo tato. −A em Reação a estímulos inesperados."],
        [
          "Cheiro Nocivo",
          "BBBB",
          3,
          "Gaste 1 e: P a seres vivos na cena; −A social seu e do afetado por 2 cenas."
        ],
        [
          "Mudar Corpo",
          "BBBBB",
          5,
          "Gaste 1 e: +AA em Furtividade, disfarce ou atuação (1 por cena). Roupa no tronco anula."
        ],
        [
          "Sentir o Ar",
          "BBBBBB",
          7,
          "Detecta sinais, calor e vibração em 3 km. Sol direto sem proteção: −3 pontos de Saúde por hora."
        ]
      ]
    ],
    3: [
      "Camaleônica",
      "Camuflagem natural, impulsos visuais descontrolados.",
      [
        ["Camaleônico", "B", 0, "+A em Furtividade parado. Queimadura de sol custa 1 d."],
        ["Mudar o Rosto", "BB", 0, "Mantém +1 dado para se disfarçar. −A em Percepção pela audição."],
        ["Camuflagem", "BBA", 0, "Os dados de Furtividade viram d12."],
        [
          "Visão Periférica",
          "BBCC",
          3,
          "+1 em Percepção (pode passar do limite). −B em pontaria com Atletismo ou Armas.",
          { op: "inst", t: "Percepção" }
        ],
        ["Malemolência", "BBC", 5, "+AA em interações sociais; +C quando tenta esconder informação."],
        [
          "Invisibilidade",
          "BBBBAA",
          7,
          "Gaste 1 e para ficar invisível até o fim da cena (não dá para desfazer)."
        ]
      ]
    ],
    4: [
      "Escamosa",
      "Escamas resistentes que atrapalham a interação.",
      [
        ["Escamoso", "B", 0, "−1 de dano cortante. −A em Expressão com quem não conhece Assimilações."],
        [
          "Escalador",
          "BB",
          0,
          "Mantém +1 dado em Atletismo para escalar superfícies ásperas. −A em Furtividade urbana."
        ],
        [
          "Escorregadio",
          "BBC",
          0,
          "Mantém +1 dado para manter a estabilidade. Troca de pele todo mês: dano dobrado por 24 h."
        ],
        [
          "Escamas Reativas",
          "BBBC",
          3,
          "Quem te ataca sofre 1 d10 de dano (ou +A na Neutralização). +C em afeto pelo toque."
        ],
        ["Evasão Natural", "BBBBA", 5, "Quando alvejado, o atacante sofre 2 P."],
        [
          "Imunidade ao Calor",
          "BBBBAA",
          7,
          "Imune a dano térmico; brilha sob luz artificial (−AA em Furtividade)."
        ]
      ]
    ],
    5: [
      "Óssea",
      "Ossos além do humano, anatomia desafiadora.",
      [
        [
          "Ossos Reativos",
          "B",
          0,
          "Golpe corpo a corpo contra você: 1 de dano no agressor. −A em Expressão com as pontas expostas."
        ],
        [
          "Maleabilidade",
          "BB",
          0,
          "Mantém +1 dado em Furtividade. −A em Atletismo de postura ou equilíbrio."
        ],
        [
          "Lâminas Ósseas",
          "BBA",
          0,
          "+A em ataques corpo a corpo com Armas ou Atletismo. +C em Medicina ou Biologia no seu corpo."
        ],
        ["Presas de Mamute", "BBBC", 3, "Em Conflito, Neutralizar ganha +A e perde B."],
        [
          "Exoesqueleto",
          "BBBAA",
          5,
          "Gaste 3 e: ignora dano cortante e perfurante até o fim da cena, mas não fala."
        ],
        [
          "Gigante",
          "BBBBAA",
          7,
          "Gaste 4 e: dobra de tamanho, +2 dados mantidos em testes físicos; +C em Furtividade e Percepção."
        ]
      ]
    ],
    6: [
      "Gastrointestinal",
      "Come quase tudo, menos comida humana.",
      [
        ["Saliva Ácida", "B", 0, "Come qualquer matéria orgânica. −B em testes com Influência."],
        ["Ruminante", "BB", 0, "Guarda comida para até uma semana, mas precisa ruminar."],
        [
          "Estômago Restaurador",
          "BBB",
          0,
          "Regenera 1 ponto de Saúde por refeição completa; não come comida processada."
        ],
        ["Jato Ácido", "BBBB", 3, "Gaste 1 e e A: P no alvo por rodadas iguais ao seu E."],
        ["Imunidade à Intoxicação", "BBBBB", 5, "Imune a intoxicação e veneno; comer não recupera d."],
        ["Glutão", "BBBBBB", 7, "Come qualquer coisa; um dia sem comer: −1 d por hora."]
      ]
    ],
    7: [
      "Respiratória",
      "Sobrevive a ambientes hostis.",
      [
        ["Pulmão Grosso", "B", 0, "Respira fumaça e ar rarefeito sem penalidade. +C em Furtividade."],
        ["Fôlego Estendido", "BA", 0, "Prende a respiração por 5 min. Odores fortes custam 1 d."],
        [
          "Sopro Poderoso",
          "BBC",
          0,
          "Gaste 1 e: empurra 3 m ou cobre de poeira (+AA em Fuga). Voz estrondosa: −B ao falar baixo."
        ],
        [
          "Fôlego Inumano",
          "BBBB",
          3,
          "Age por Instinto sem gastar e; depois −1 dado mantido em Conhecimentos até o fim da cena."
        ],
        ["Fôlego Reparador", "BBBBB", 5, "Quando perder d, pode perder e no lugar."],
        ["Fôlego Infinito", "BBBBAA", 7, "Vive sem ar; venenos pelas vias aéreas têm efeito dobrado."]
      ]
    ],
    8: [
      "Termorreguladora",
      "Controla o calor do corpo e do ambiente.",
      [
        [
          "Resistência Térmica",
          "B",
          0,
          "Frio e calor moderados não afetam. Contato prolongado com alguém: +C até o fim da cena."
        ],
        ["Conduzir Calor", "BB", 0, "Aquece ou esfria ao toque. Sem fonte de calor, regenera metade."],
        [
          "Gerar Calor",
          "BBA",
          0,
          "Gaste 1 e: −A em Resolução e Potência de todos na cena, ou +C no custo de ativações de Ameaça."
        ],
        [
          "Sangue Quente",
          "BBBA",
          3,
          "Gaste 1 e: +2 dados mantidos em Reação; depois −1 d em ações físicas até o fim da cena."
        ],
        ["Exala Vapor", "BBBBA", 5, "Ataques à distância na sua área (ou dela) sofrem 2 P."],
        [
          "Esquentar/Esfriar Região",
          "BBBBBB",
          7,
          "Gaste todos os e: muda a temperatura da região em 3 °C por ponto."
        ]
      ]
    ],
    9: [
      "Neural",
      "Sinapses hiperativas que leem padrões.",
      [
        [
          "Pulso Mental",
          "B",
          0,
          "Gaste 1 e para repetir um teste com Conhecimento. Só recupera d dormindo isolado, no escuro e em silêncio."
        ],
        ["Prever Dano", "BB", 0, "No segundo efeito danoso, −1 de dano. Estímulos simultâneos custam 1 d."],
        [
          "Prever Ameaça",
          "BBA",
          0,
          "Gaste 1 e: role Reação ou Sagacidade; cada A anula C e cada B anula outra no resultado da Ameaça."
        ],
        [
          "Sintonia Mental",
          "BBBB",
          3,
          "Gaste 1 e para dar +B a um aliado fora de Conflito. +C em Influência e Expressão."
        ],
        [
          "Visão Mental",
          "BBBBA",
          5,
          "Com AA+ em Conhecimento, recebe uma informação vital e confiável. +C em rolagens criativas."
        ],
        ["Visão Verdadeira", "BBBBAA", 7, "Gaste e: uma informação oculta por cena, sem teste."]
      ]
    ],
    10: [
      "Cardiovascular",
      "Controle extremo do coração.",
      [
        ["Sangue Frio", "B", 0, "Sem penalidades por tensão, medo ou risco. −B em Manufaturas."],
        ["Transe", "BB", 0, "Recupera o dobro de d em toda Recuperação com a Saúde completa."],
        [
          "Sangue Furioso",
          "BBA",
          0,
          "Gaste 1 e: +2 dados mantidos em Potência ou Atletismo; perde 1 ponto de Saúde no fim da rodada."
        ],
        [
          "Fingir Morte",
          "BBBB",
          3,
          "Quase para o coração por 5 min. Dieta pobre em ferro: penalidades de Saúde como um Nível abaixo."
        ],
        [
          "Sangue Regenerativo",
          "BBBBC",
          5,
          "Gaste 1 d: +1 dado mantido e regenera 1 ponto; não pode anular C nesse teste."
        ],
        [
          "Sangue Potente",
          "BBBBAA",
          7,
          "Gaste todos os e: +1 dado mantido por ponto em ações físicas até o fim da cena."
        ]
      ]
    ],
    J: [
      "Fitomórfica",
      "Fusão com o mundo vegetal.",
      [
        ["Sintonia Verde", "B", 0, "Gaste 1 e: sente plantas a 30 m, com os pés no solo."],
        [
          "Casca Grossa",
          "BB",
          0,
          "+1 em Resolução (pode passar do limite). Dano dobrado de queimadura, frio extremo e ácido.",
          { op: "inst", t: "Resolução" }
        ],
        ["Fotorreceptores", "BBB", 0, "Faz fotossíntese e não precisa comer; sem sol no dia, perde 1 d."],
        [
          "Raízes",
          "BBBB",
          3,
          "Raízes ao dormir dão estabilidade; dormir sem tocar o solo impede recuperar d."
        ],
        [
          "Curar o Solo",
          "BBBBB",
          5,
          "Perde um Nível de Saúde inteiro para curar um bioma e criar vínculo com ele."
        ],
        ["Cura Comunal", "BBBBBB", 7, "Gaste 2 e: terreno de 20 m regenera 1 ponto por rodada nos aliados."]
      ]
    ],
    Q: [
      "Quimiorreceptora",
      "Lê rastros, mentiras e histórias pelo cheiro.",
      [
        ["Faro Apurado", "B", 0, "Percebe odores residuais. Mais de 5 min com cheiro forte: −1 d."],
        [
          "Farejar Toxinas",
          "BB",
          0,
          "Detecta toxinas antes de tocar. Comida temperada nas últimas 12 h impede recuperar d."
        ],
        [
          "Farejar Rastros",
          "BBA",
          0,
          "+AA ao analisar onde algo foi movido. −B em Percepção em ambientes novos."
        ],
        [
          "Farejar Sentimentos",
          "BBBC",
          3,
          "Gaste 1 e: soma os dados de Percepção em Expressão ou Influência com o alvo. +C com mais de 5 pessoas."
        ],
        ["Secreções", "BBBBB", 5, "Marca trilha, objeto ou pessoa para seguir por 24 h."],
        [
          "Farejar Psicometria",
          "BBBBCC",
          7,
          "Gaste 3 e: lê o passado químico de um lugar, objeto ou corpo. −BB em Resolução."
        ]
      ]
    ],
    K: [
      "Metabólica",
      "Metabolismo fora de controle.",
      [
        [
          "Metabolismo Acelerado",
          "B",
          0,
          "Regenera 1 ponto a mais; precisa do triplo de calorias ou perde 1 ponto por dia."
        ],
        [
          "Metabolismo Afiado",
          "BC",
          0,
          "Mantém +1 dado em Reação, Potência ou Resolução física. +C em Conhecimentos."
        ],
        [
          "Metabolismo Regenerativo",
          "BBA",
          0,
          "Gaste 2 d: regenera 4 pontos e −A em testes físicos até o fim da cena (fora de Conflito)."
        ],
        [
          "Imunidade Metabólica",
          "BBCC",
          3,
          "Imune a condições extremas; sem sais diários, −B cumulativo por dia."
        ],
        [
          "Metabolismo Eficiente",
          "BBBBB",
          5,
          "Gaste 2 e: +2 dados mantidos num teste físico; perde 1 ponto de Saúde por C mantida."
        ],
        [
          "Metabolizar Instintos",
          "BBBBBB",
          7,
          "Gaste todos os e e distribua em Potência, Reação e Resolução (até o seu E); 1 de dano por rodada."
        ]
      ]
    ]
  },
  in: {
    A: [
      "Atrofiante",
      "Músculos e tendões definham.",
      [
        ["Rigidez Muscular", "C", 0, "−B em testes com Potência."],
        [
          "Rigidez Articular",
          "CC",
          0,
          "−A em Potência ou Atletismo de movimento contínuo (correr, escalar, nadar)."
        ],
        ["Nervos Atrofiados", "CCC", 0, "−A em Reação a estímulos rápidos."],
        [
          "Digestão Ineficaz",
          "CCCC",
          0,
          "Precisa comer pouco, 3 vezes por hora, ou a próxima Recuperação não vale."
        ],
        [
          "Atrofia Muscular",
          "CCCCC",
          0,
          "Ao falhar em teste com Potência ou Resolução, sofre 1 de dano por C mantida."
        ],
        ["Falência", "CCCCCC", 0, "Dano físico e penalidades de Saúde contra você são dobrados."]
      ]
    ],
    2: [
      "Neuropática",
      "Nervos disparam sinais confusos.",
      [
        ["Debilidade", "C", 0, "−A em testes com Atletismo."],
        ["Inabilidade", "CC", 0, "−B em Manufaturas, Erudição ou Expressão."],
        ["Tremores", "CCC", 0, "Perde 1 d a mais por C mantida em qualquer teste."],
        ["Desorientação", "CCCC", 0, "−AA em Percepção ou Sobrevivência envolvendo distância ou direção."],
        ["Fragilidade", "CCCCC", 0, "Dano físico direto: −1 d; se cair de Nível de Saúde, −2 d."],
        ["Inaptidão", "CCCCCC", 0, "Em Conflito, todas as ações perdem A e B."]
      ]
    ],
    3: [
      "Devoradora",
      "Fome constante corrói corpo e foco.",
      [
        ["Coeficiente Calórico", "C", 0, "Mais de 4 h sem comer: −A em todos os testes até se alimentar."],
        ["Ignorância", "CC", 0, "Mais de 2 h sem comer: −A em Conhecimentos."],
        ["Desarticulação", "CCC", 0, "Mais de 2 h sem comer: +C em Influência."],
        ["Apetite Corrosivo", "CCCC", 0, "6 h sem comer: −1 ponto de Saúde, e mais 1 por hora."],
        ["Apetite Vacilante", "CCCCC", 0, "24 h sem comer: perde todos os d e fica Suscetível."],
        [
          "Ânsia Terrível",
          "CCCCCC",
          0,
          "Duas cenas sem comer: a fome assume; ações que não sejam comer usam Resolução."
        ]
      ]
    ],
    4: [
      "Secretora",
      "Glândulas hiperativas denunciam sua presença.",
      [
        ["Mal Odor", "C", 0, "−A em Expressão em lugares fechados."],
        ["Inchaço Debilitante", "CC", 0, "−A em Manufaturas ou ao manusear armas de fogo."],
        ["Escorregadio", "CCC", 0, "−A em Atletismo em superfícies instáveis ou escorregadias."],
        ["Fragilidade Térmica", "CCCC", 0, "Em calor ou frio extremos, dobra a penalidade."],
        ["Inflamável", "CCCCC", 0, "Contato com fogo: dano igual aos e restantes, que zeram."],
        [
          "Bufotoxina",
          "CCCCCC",
          0,
          "Seu toque causa 1 d10 de dano; quem dorme junto testa Resolução + Medicina (AA) ou perde um Nível."
        ]
      ]
    ],
    5: [
      "Calcificante",
      "Placas endurecidas roubam a mobilidade.",
      [
        ["Endurecido", "C", 0, "−B em Furtividade ou Atletismo que exijam leveza ou equilíbrio."],
        [
          "Descoordenado",
          "CC",
          0,
          "−A por movimento adicional numa mesma Ação (saltar e correr, atacar e mover…)."
        ],
        ["Hesitante", "CCC", 0, "Em testes de Fuga, cancela metade dos A mantidos."],
        ["Travado", "CCCC", 0, "Cada C em Potência ou Reação em Conflito aumenta o custo da sua Fuga em A."],
        ["Combalido", "CCCCC", 0, "Em testes físicos, os d10 viram d6.", { op: "combalido" }],
        ["Condrocalcinose", "CCCCCC", 0, "+CCC em todos os testes físicos."]
      ]
    ],
    6: [
      "Fotossensível",
      "Luz e claridade se tornam agressivas.",
      [
        ["Visão Sensível", "C", 0, "Sob luz intensa, −B em Percepção."],
        ["Pele de Vampiro", "CC", 0, "Mais de 30 min sob sol direto: −1 d e −1 ponto de Saúde."],
        ["Enxaqueca", "CCC", 0, "Uma cena inteira iluminada: não recupera d na próxima Recuperação."],
        [
          "Visão Sensível",
          "CCCC",
          0,
          "Ao passar do escuro ao claro (ou o contrário), −AA nas primeiras rodadas."
        ],
        ["Visão Curta", "CCCCC", 0, "−A permanente em ataques de longo alcance."],
        ["Visão Noturna", "CCCCCC", 0, "Só enxerga no escuro; com luz, testes usam Percepção e perdem AA."]
      ]
    ],
    7: [
      "Litodérmica",
      "A pele vira mistura metálica.",
      [
        ["Afasta Animais", "C", 0, "−A em qualquer teste com animais."],
        ["Ossos Frágeis", "CC", 0, "Dano de impacto contra você +1."],
        ["Eletrossensível", "CCC", 0, "Dano elétrico dobrado; queimadura também custa 1 d."],
        [
          "Carapaça Disforme",
          "CCCC",
          0,
          "Não usa armadura ou roupa rígida; dormir em superfície dura anula a Recuperação."
        ],
        [
          "Muco Oxidante",
          "CCCCC",
          0,
          "Enferruja metal: −1 Qualidade por cena de contato; gastando e com item metálico, cada C também reduz."
        ],
        [
          "Fígado Estragado",
          "CCCCCC",
          0,
          "Sangria semanal ou cirrose: −1 Nível de Saúde por semana até um transplante (Medicina AAAAA)."
        ]
      ]
    ],
    8: [
      "Entorpecida",
      "Sentidos amortecidos e distorcidos.",
      [
        ["Agorafobia", "C", 0, "−A em Percepção em áreas abertas ou amplas."],
        ["Sensibilidade Auditiva", "CC", 0, "Ruídos intensos (explosões, sirenes, gritos) custam 1 d."],
        [
          "Sentidos Sobrecarregados",
          "CCC",
          0,
          "Com vários estímulos intensos ao mesmo tempo, −A em todas as ações."
        ],
        ["Desorientação Aguda", "CCCC", 0, "+C em testes com Percepção ou Reação."],
        [
          "Devaneios",
          "CCCCC",
          0,
          "Uma vez por sessão, o Assimilador cria uma alucinação que tira AA de um teste."
        ],
        [
          "Dessensibilização Aguda",
          "CCCCCC",
          0,
          "Percepção vai a 0; só rola Percepção com outra Aptidão dando dados."
        ]
      ]
    ],
    9: [
      "Aberrante",
      "Órgãos redundantes sem harmonia.",
      [
        ["Anomorfia", "C", 0, "−1 num Instinto à sua escolha que tenha 2 ou mais."],
        ["Pernas Disformes", "CC", 0, "Em cada Conflito, perde o primeiro A investido em Fuga."],
        ["Hipersensibilidade", "CCC", 0, "Tocado com força ou ferido: −1 d."],
        ["Recuperação Debilitada", "CCCC", 0, "Cada Recuperação restaura só metade da Saúde e dos d."],
        ["Descoordenação", "CCCCC", 0, "Sempre que tirar AA num teste, um deles vira C."],
        ["Aberração", "CCCCCC", 0, "Aparência e voz irreconhecíveis, à escolha do Assimilador."]
      ]
    ],
    10: [
      "Hipersensível",
      "O mundo é áspero e invasivo.",
      [
        [
          "Vulnerabilidade à Dor",
          "C",
          0,
          "Ao sofrer dano, −A no próximo teste com Potência, Reação ou Resolução."
        ],
        [
          "Vulnerabilidade Emocional",
          "CC",
          0,
          "Crítica, provocação ou escárnio: −B em todos os testes até o fim da cena."
        ],
        ["Dor Degradante", "CCC", 0, "Dano por ataque corpo a corpo ou queda custa 1 d."],
        [
          "Sensibilidade Radical",
          "CCCC",
          0,
          "Barulho, temperatura ou luz incômodos: −AA em Conhecimentos e Expressão."
        ],
        [
          "Recuperação Sensível",
          "CCCCC",
          0,
          "Recuperações perdem metade do efeito fora de ambiente controlado."
        ],
        [
          "Sensibilidade Extrema",
          "CCCCCC",
          0,
          "Com 3+ estímulos: −1 ponto de Saúde, −1 d e só mantém 1 dado até o fim da cena."
        ]
      ]
    ],
    J: [
      "Mioclônica",
      "Espasmos e tiques rompem o controle.",
      [
        ["Espasmos Involuntários", "C", 0, "Com qualquer C rolada, o Assimilador pode narrar um espasmo."],
        ["Aflição Grave", "CC", 0, "Em Conflito, −A em ações que exijam controle corporal."],
        [
          "Movimentos Involuntários",
          "CCC",
          0,
          "A cada cena um membro sorteado: +C em ações que dependam dele."
        ],
        [
          "Barulhos Involuntários",
          "CCCC",
          0,
          "No silêncio faz ruídos que anulam surpresa, camuflagem ou emboscada."
        ],
        [
          "Agitação Constante",
          "CCCCC",
          0,
          "Não fica parado: −1 d por minuto quando precisa esperar ou repousar."
        ],
        ["Debilidade Extrema", "CCCCCC", 0, "Testes físicos: −A e +C, e descarta o dado com mais A."]
      ]
    ],
    Q: [
      "Disfásica",
      "A fala se rompe em falhas.",
      [
        ["Desvio de Fala", "C", 0, "Com C em comunicação verbal, o Assimilador narra um erro de fala."],
        [
          "Fala Debilitada",
          "CC",
          0,
          "−A em Expressão ou Influência com frases complexas ou argumentos longos."
        ],
        [
          "Memória Debilitada",
          "CCC",
          0,
          "Não repete instruções ou relatos de mais de uma frase: a mensagem chega alterada."
        ],
        ["Fala Simplificada", "CCCC", 0, "−AA em Conhecimentos quando a fala estiver envolvida."],
        [
          "Letra Ilegível",
          "CCCCC",
          0,
          "A escrita fica incompreensível, a não ser entregue em mãos com teste (AA)."
        ],
        ["Fala Incompreensível", "CCCCCC", 0, "Em tensão não fala: mímica, desenho ou +CC em ações verbais."]
      ]
    ],
    K: [
      "Terminal",
      "A vitalidade se esgota aos poucos.",
      [
        ["Pressão Estendida", "C", 0, "Penalidades por C duram uma cena a mais."],
        ["Recuperação Sofrida", "CC", 0, "Antes de cada Recuperação, sofre 1 ponto de dano."],
        ["Pressão por Fracasso", "CCC", 0, "Ao falhar (nenhum A), +C no próximo teste; acumula."],
        ["Aptidões Arruinadas", "CCCC", 0, "A cada cena uma Aptidão sorteada vale 0 até o fim da cena."],
        [
          "Determinação Hesitante",
          "CCCCC",
          0,
          "Ao usar d para manter dado extra, descarta um A ou B escolhido pelo Assimilador."
        ],
        [
          "Inaptidão Extrema",
          "CCCCCC",
          0,
          "+CC em todos os testes e −1 permanente numa Aptidão (escolha do Assimilador)."
        ]
      ]
    ]
  },
  si: {
    A: [
      "do Bosque",
      "Tecidos lenhosos que regeneram entre árvores.",
      [
        [
          "Embaúba",
          "BA",
          0,
          "Parado em contato com vegetação viva, regenera 1 ponto por hora (dano dobrado nesse período)."
        ],
        [
          "Eucalyptus",
          "AC",
          0,
          "No Nível 1 ou 2, 6 h imóvel em solo fértil permite se recuperar como no Nível 3."
        ],
        ["Araucária", "BC", 0, "24 h sem vegetação ou solo fértil: −A em Sobrevivência."]
      ]
    ],
    2: [
      "da Campina",
      "Postura baixa e percepção pelo vento.",
      [
        ["Alecrim", "BA", 0, "Com 1 h de sol, 1 d dispensa comida e água por 24 h."],
        [
          "Cágado",
          "AC",
          0,
          "Exposto ao sol, recupera 1 ponto por cena; ataques de calor ou luz causam +1 d10."
        ],
        ["Maria-da-campina", "BC", 0, "Cada dia sem sol: −A em Resolução até se expor por 1 h."]
      ]
    ],
    3: [
      "do Cerrado",
      "Casca grossa contra lesões e aridez.",
      [
        ["Tatu-canastra", "BA", 0, "Sob sol forte ou clima seco, −1 de dano de ataques físicos."],
        [
          "Mandacaru",
          "AC",
          0,
          "Ao sofrer 2+ de dano num ataque, estilhaços ferem o atacante (1); você fica com −A em Reação até o fim da cena."
        ],
        ["Lobo-guará", "BC", 0, "Molhado: −A em Potência e Furtividade até secar."]
      ]
    ],
    4: [
      "da Colina",
      "Fôlego para subidas íngremes.",
      [
        ["Porco-do-mato", "AC", 0, "+A em Atletismo para correr, saltar ou escalar; +C em Furtividade."],
        ["Jabuti-piranga", "BC", 0, "Em terreno plano demais: −A em Reação até se adaptar por uma cena."],
        ["Caxinguelê", "BA", 0, "Ignora terreno inclinado ou irregular; +A em Fuga; não cai sem sofrer dano."]
      ]
    ],
    5: [
      "Desértica",
      "Gasta pouca água e se protege do calor.",
      [
        ["Suculenta", "BA", 0, "Fica até 5 dias sem água sem penalidade."],
        [
          "Diabo-espinhoso",
          "AC",
          0,
          "Atacante corpo a corpo sofre 1 de dano (ou +A na Neutralização); cada C mantida fere um aliado próximo."
        ],
        ["Esquilo Terrestre", "BC", 0, "Precisa dormir em uma toca, ou perde 1 d."]
      ]
    ],
    6: [
      "Florestal",
      "Equilíbrio e sigilo em mata fechada.",
      [
        ["Morcego-narigudo", "BA", 0, "Ignora penalidades de penumbra natural."],
        ["Sucuri", "AC", 0, "+B em Furtividade na vegetação densa; +C em Expressão."],
        ["Rato-do-mato", "BC", 0, "Saindo da sombra para muita luz: −A em Percepção por uma cena."]
      ]
    ],
    7: [
      "do Manguezal",
      "Respira e anda no lodo.",
      [
        ["Mangue-vermelho", "BA", 0, "Bebe água salobra ou salgada sem prejuízo."],
        ["Caramujo-do-mangue", "AC", 0, "Fica até 10 min submerso; sofre +1 de dano de ataques físicos."],
        ["Sururu", "BC", 0, "Mais de 6 h em lugar seco: −A em Reação até se reidratar."]
      ]
    ],
    8: [
      "Marinha",
      "Nada com eficiência no oceano.",
      [
        ["Toninha", "BA", 0, "Nada duas vezes mais rápido; dobra os A em Fuga nadando."],
        ["Biguá", "AC", 0, "+A em Atletismo na água ou areia fofa; +C em Manufaturas."],
        ["Tartaruga-aruanã", "BC", 0, "Correndo em piso rígido: +C em Potência."]
      ]
    ],
    9: [
      "da Montanha",
      "Suporta ar rarefeito e frio.",
      [
        ["Urubu-Rei", "BA", 0, "Sem penalidade por altitude ou ar rarefeito."],
        [
          "Calango-bandeira",
          "AC",
          0,
          "Prende a respiração 10 min; em clima seco, −B em Influência e Expressão."
        ],
        ["Tucanuçu", "BC", 0, "Mais de 1 h em lugar abafado: −1 em Sagacidade."]
      ]
    ],
    10: [
      "do Pântano",
      "Tolera gases e usa o brejo como proteção.",
      [
        ["Guaiamu", "BA", 0, "Ignora terreno encharcado; atravessa até 2 m de água ou lama sem teste."],
        ["Garça-azul", "AC", 0, "+A em Furtividade sobre lama ou folhas; +C em Reação em lugares fechados."],
        [
          "Sapo-cururu",
          "BC",
          0,
          "Se cair, teste de Potência ou +1 de dano de todos os ataques até o fim da cena."
        ]
      ]
    ],
    J: [
      "da Caatinga",
      "Pele espessa e pontiaguda para a seca.",
      [
        ["Rola-bosta", "BA", 0, "−1 de dano cortante ou perfurante de fontes naturais."],
        ["Asa-branca", "AC", 0, "Protegido de sol extremo por 2 cenas; −1 em Influência."],
        ["Teiú", "BC", 0, "Em lugar úmido ou abafado, após 2 h, −A em Reação."]
      ]
    ],
    Q: [
      "Subterrânea",
      "Orienta-se no escuro pelas vibrações.",
      [
        ["Tatu-canastra", "BA", 0, "Tocando o chão, sente presenças a 10 m (intensidade e distância)."],
        ["Coruja-buraqueira", "AC", 0, "+A em Percepção de sons abafados; +C em Reação a estrondos."],
        ["Morcego-de-cauda-livre", "BC", 0, "Muitos sons sobrepostos: −1 em Sagacidade até se isolar."]
      ]
    ],
    K: [
      "da Tundra",
      "O sangue não congela.",
      [
        ["Líquen-de-mapa", "BA", 0, "Sem penalidade por frio intenso ou neve."],
        [
          "Marmota-alpina",
          "AC",
          0,
          "Torpor de até 12 h estabiliza ferimentos; ao sair, −1 em Potência até descansar."
        ],
        ["Husky siberiano", "BC", 0, "Em ambientes quentes, +C em Atletismo."]
      ]
    ]
  }
};
function mutacao(naipe, c, i) {
  const k = ASSIMILACOES[naipe] && ASSIMILACOES[naipe][c];
  return k && k[2][i]
    ? {
        naipe,
        c,
        i,
        n: k[2][i][0],
        custo: k[2][i][1],
        e: k[2][i][2],
        ef: k[2][i][3],
        fx: k[2][i][4] || null,
        carta: k[0]
      }
    : null;
}

/* ---------- Equipamentos ---------- */
const ESCASSEZ = ["Abundante", "Corriqueiro", "Comum", "Incomum", "Atípico", "Raro", "Quase Extinto"];
const QUALIDADE = ["Quebrado", "Defeituoso", "Comprometido", "Padrão", "Reforçado", "Superior", "Obra-Prima"];
// C para cair um nível (índice = nível atual)
const QUAL_C = [0, 1, 2, 3, 4, 5, 6];
// [nome, escassez]
const EQUIP_LIVRO = [
  ["Pedaço de pau", 0],
  ["Tijolo", 0],
  ["Pedra", 0],
  ["Osso", 0],
  ["Amuleto", 1],
  ["Faca", 1],
  ["Lança", 1],
  ["Cano metálico", 1],
  ["Corda (15 metros)", 1],
  ["Rede de dormir", 1],
  ["Rede de pesca", 1],
  ["Facão", 2],
  ["Aljava", 2],
  ["Caderno de notas", 2],
  ["Pé de cabra", 2],
  ["Machado", 2],
  ["Caixa de velas", 2],
  ["Bebida", 2],
  ["Curativos", 2],
  ["Balança", 2],
  ["Ferramentas", 2],
  ["Gazuas", 2],
  ["Kit de escrita", 2],
  ["Kit de costura", 2],
  ["Pederneira", 2],
  ["Saco de dormir", 2],
  ["Espelho", 3],
  ["Bússola", 3],
  ["Livros", 3],
  ["Ábaco", 3],
  ["Revólver rudimentar", 3],
  ["Espada", 3],
  ["Mapas úteis", 3],
  ["Sinalizador", 3],
  ["Tenda desmontável", 3],
  ["Canivete", 4],
  ["Laptop rudimentar", 4],
  ["Manto camuflado", 4],
  ["Equipamento militar", 5],
  ["Kit completo de cirurgia", 5],
  ["Avião", 6],
  ["Equipamento eletrônico avançado", 6]
];
// itens dos pacotes que o livro não põe na lista de Escassez
const EQUIP_PACOTE = [
  "Álcool",
  "Serrote",
  "Arco",
  "Flechas (10)",
  "Faca de osso",
  "Pintura ritualística",
  "Arma branca"
];
// características de Artefatos: [nome, categoria, resumo]
const CARAC_ART = [
  ["Frágil", -1, "Cai de Qualidade com uma C a menos; se Defeituoso, quebra no próximo uso."],
  ["Improvisado", -1, "Testes com o item têm −A (gaste B para cancelar)."],
  ["Pesado", -1, "−A em testes de pura movimentação ou furtividade (inclusive Fuga). Ocupa 2 espaços."],
  ["Uso Único", -1, "Some ou se esgota no primeiro uso."],
  ["Ágil", 1, "Arma branca: no ataque armado, usa Reação no lugar de Potência."],
  ["Discreto", 1, "Não ocupa espaço e não é notado enquanto guardado."],
  ["Espaçoso", 1, "+2 espaços de inventário (acumula)."],
  ["Iluminador", 1, "Ilumina 6 m por nível de Qualidade."],
  ["Letal", 1, "Uma vez por dia troca qualquer B por A; uso extra dá +A mas perde Qualidade."],
  ["Protetivo", 1, "Ao sofrer dano, 1 uso por cena evita perder 1 ponto de Saúde (extra: perde Qualidade)."],
  ["Restaurador", 1, "6 usos: cada um alimenta por um dia e dá +1 ponto na próxima Recuperação."],
  ["Eficiente", 2, "Uma vez por dia troca 1 d6 por 1 d10 no teste (extra: perde Qualidade)."],
  ["Durável", 2, "Precisa de uma C a mais para perder Qualidade."],
  [
    "Adrenalina",
    3,
    "6 usos: +6 pontos de Saúde até o próximo repouso; usos extras no dia pedem Resolução + Atletismo."
  ],
  ["Armadura", 3, "Ao sofrer dano, até 3 usos por cena evitam 1 ponto cada; usando os 3, perde Qualidade."],
  ["Explosivo", 4, "Uso único: destrói estruturas e causa 4 d10 de dano na área."],
  [
    "Inflamável",
    4,
    "Perde Qualidade para incendiar uma área: 3 d10 de queimadura (e 2 d10 por turno se não apagar)."
  ],
  ["Medicinal", 4, "6 usos: cada um anula 1 C no tratamento médico (até a sua Medicina por teste)."]
];
// Artefatos prontos do livro: [nome, escassez, características]
const ARTEFATOS = [
  ["Taco de Baseball com Pregos", 0, ["Improvisado", "Letal"]],
  ["Escudo de Tampa de Barril", 0, ["Frágil", "Protetivo"]],
  ["Escudo Anti-tumulto", 1, ["Protetivo"]],
  ["Faca de Combate", 1, ["Ágil"]],
  ["Barras de Nutrientes Especiais", 1, ["Restaurador"]],
  ["Machado de Guerra", 1, ["Letal"]],
  ["Cota de Malha Longa", 2, ["Armadura", "Pesado"]],
  ["Lanterna", 2, ["Iluminador", "Discreto"]],
  ["Mochila de Acampamento", 2, ["Espaçoso", "Espaçoso"]],
  ["Caneta de Adrenalina", 3, ["Adrenalina"]],
  ["Colete Tático", 3, ["Armadura"]],
  ["Escudo Tático", 3, ["Protetivo", "Durável"]],
  ["Katana", 3, ["Ágil", "Eficiente"]],
  ["Kit de Primeiros Socorros", 3, ["Uso Único", "Medicinal"]],
  ["Revólver", 3, ["Letal", "Eficiente"]],
  ["Granada", 4, ["Explosivo"]],
  ["Lança-chamas", 4, ["Inflamável"]],
  ["Mala de Médico de Combate", 4, ["Medicinal"]]
];
const PACOTES = {
  Combatente: ["Bebida", "Corda (15 metros)", "Faca", "Lança", "Machado"],
  Curandeiro: ["Álcool", "Curativos", "Faca", "Kit de costura", "Serrote"],
  Desbravador: ["Bússola", "Facão", "Mapas úteis", "Saco de dormir", "Tenda desmontável"],
  Estudioso: ["Caderno de notas", "Caixa de velas", "Canivete", "Kit de escrita", "Livros"],
  Mercador: ["Ábaco", "Balança", "Caderno de notas", "Kit de escrita", "Mapas úteis"],
  Nômade: ["Aljava", "Flechas (10)", "Arco", "Facão", "Manto camuflado", "Sinalizador"],
  Infiltrador: ["Corda (15 metros)", "Faca", "Gazuas", "Manto camuflado", "Pé de cabra"],
  Selvagem: ["Faca de osso", "Lança", "Pintura ritualística", "Rede de dormir", "Rede de pesca"],
  Sobrevivente: ["Corda (15 metros)", "Faca", "Machado", "Pederneira", "Saco de dormir"]
};
const ESP_CORPO = 3,
  ESP_MOCHILA = 6;

/* ---------- Conflitos ---------- */
const PROGRESSAO = [
  ["Iniciantes", "fichas iniciais", 3, 1, 2, 1, [4, 1], [6, 2]],
  ["Intermediários", "21 a 40 de experiência", 6, 2, 4, 2, [5, 2], [8, 3]],
  ["Avançados", "41 a 60 de experiência", 9, 3, 6, 3, [6, 3], [12, 4]],
  ["Épicos", "mais de 60 de experiência", 12, 4, 8, 4, [9, 5], [18, 8]]
];
// [nome, base Conflito, +por Infectado, base Ameaça, +por Infectado, objetivo simples [base,+], clímax [base,+]]
const DIFICULDADES = [
  ["Exploração", 0],
  ["Sofrimento", 1],
  ["Desastre", 2],
  ["Colapso", 3]
]; // d12 extras em toda rolagem de Conflito e Ameaça
function sugerirDados(v) {
  v = Math.max(1, Math.round(v));
  const d12 = Math.floor(v / 5);
  v -= d12 * 3;
  const d10 = Math.floor(v / 2);
  v -= d10 * 2;
  return { d6: v, d10, d12 };
}
const ATIV_CUSTOS = [
  ["+C", "+1 de dano"],
  ["+C", "−1 d"],
  ["+CC", "efeito em área"],
  ["B", "alvo adicional"],
  ["B", "remove penalidade"],
  ["B", "−A em Neutralização (cura)"],
  ["CC", "P"],
  ["CCCC", "anula a ação do alvo"],
  ["9C", "consequência grave (pode encerrar)"]
];
// Conflitos de exemplo do livro: nome, descrição, dados, condicionantes, ativações [custo,nome,efeito], objetivos [tipo,nome,base,+porInfectado extra,efeito]
const CONFLITOS_LIVRO = [
  {
    n: "Bloqueio na Estrada",
    desc: "Guardas fiscalizam viajantes num bloqueio improvisado.",
    dados: { d6: 2, d10: 1, d12: 1 },
    cond: [],
    ativ: [
      ["CCC", "Tiro de pistola", "3 d10 de dano a um alvo (controle de munição)."],
      ["CC", "Ataque corpo a corpo", "1 d10 de dano a um alvo."],
      ["AAAA", "Afeição", "Um guarda simpatiza: cancela o próximo tiro."],
      ["BBB", "Desarmar", "Tira o equipamento da mão do alvo."],
      ["BBBBBCCCC", "Render", "Rendidos: taxa abusiva ou prisão. Encerra o Conflito."]
    ],
    obj: [
      ["p", "Romper o bloqueio", 7, 3, ""],
      ["p", "Negociar passagem", 8, 4, "A vale dobrado se oferecer algo de interesse."],
      ["p", "Fuga", 2, 2, "Voltar sem gerar problemas."],
      ["s", "Obter informações", 3, 0, "Individual. Revela o porquê do bloqueio."],
      ["s", "Ocultar carga valiosa", 4, 1, "Os fiscais não notam as mercadorias."],
      ["s", "Detectar ameaça oculta", 4, 1, "Revela atiradores nas torres."]
    ],
    ameacas: ["Contrabandista"]
  },
  {
    n: "Invasão do Forte",
    desc: "Forte num promontório com defensores, muralhas e torres automáticas.",
    dados: { d6: 2, d10: 3, d12: 1 },
    cond: [
      ["Muralhas elevadas", "Travessia ou escalada exige B a mais para passar de 1 A por rodada."],
      ["Sistemas automáticos", "No fim de cada rodada, +1 d6 nos dados do Conflito até desligarem o painel."]
    ],
    ativ: [
      ["C", "Tiro de advertência", "1 d10 em um alvo."],
      ["CCCC", "Rajada das torres", "4 d10 num alvo (+1 se escalando ou correndo)."],
      ["CCCC", "Fogo cruzado", "2 d10 em dois alvos ou 4 d10 em um."],
      ["CCCC", "Contra-ataque coordenado", "Remove AA de um Objetivo Principal."],
      ["AA", "Oportunidade de avanço", "Ponto fraco revelado: +A para atravessar por 1 rodada."],
      ["AAAAA", "Pane no sistema", "Tira os d6 do Conflito e bloqueia a Rajada por 2 rodadas."],
      ["BBB", "Desabamento", "Parte da muralha cai: abre entrada e encarece a Fuga em A."]
    ],
    obj: [
      ["p", "Derrotar os defensores", 11, 3, ""],
      ["p", "Convencer os defensores", 11, 3, "Os defensores passam a lutar junto contra as Ameaças."],
      ["p", "Fuga", 2, 2, ""],
      ["s", "Abrir porta lateral", 4, 0, "Corredor livre por 1 rodada."],
      ["s", "Tomar o posto de vigia", 8, 0, "−AAA para Derrotar os defensores."],
      ["s", "Liberar os cativos", 5, 0, "Prisioneiros viram aliados ou desorganizam a defesa."]
    ],
    ameacas: []
  },
  {
    n: "Laboratório Contaminado",
    desc: "Vazamentos, fumaça tóxica e alarmes num antigo laboratório.",
    dados: { d6: 2, d10: 0, d12: 1 },
    cond: [
      ["Local fechado", "Correr precisa de B para passar de 1 A por turno."],
      ["Área contaminada", "Na área do vazamento, todos os testes usam Resolução."]
    ],
    ativ: [
      ["CCCCC", "Névoa tóxica", "2 d10 de dano nos Infectados."],
      ["AAAAA", "Vedação automática", "−AAA no custo de Conter vazamento."],
      ["BBB", "Porta de contenção fecha", "Bloqueia a passagem para um setor."]
    ],
    obj: [
      ["p", "Conter vazamento", 11, 3, "Os Objetivos Secundários continuam na próxima cena."],
      ["p", "Isolar área contaminada", 8, 2, ""],
      ["p", "Fuga", 3, 3, ""],
      ["s", "Obter dados de pesquisa", 5, 0, "Arquivo com os dados depois da cena."],
      ["s", "Encontrar equipamento de proteção", 6, 0, "Traje contra a névoa (−AAA se já tiver os dados)."],
      ["s", "Tratar aliado exposto", 2, 0, "+AA por rodada de exposição."]
    ],
    ameacas: []
  },
  {
    n: "Mercado Inundando",
    desc: "Enchente repentina; barracas e destroços boiando.",
    dados: { d6: 2, d10: 1, d12: 0 },
    cond: [
      ["Água turva", "−A em Percepção dentro ou através da água."],
      ["Correnteza forte", "Carregar algo exige +C para passar de 1 A."]
    ],
    ativ: [
      ["CC", "Detrito atinge", "1 d10 de dano a um alvo."],
      ["BCC", "Submersão súbita", "O alvo gasta a próxima ação se recompondo ou sofre 1 d10 e P."],
      ["BBB", "Novo vazamento", "+1 d6 nos dados do Conflito até o fim da cena."],
      ["AAA", "Saída desbloqueada", "−A no custo da Fuga."]
    ],
    obj: [
      ["p", "Fuga do mercado", 5, 2, "Mínimo de AA por Infectado."],
      ["s", "Coletar recursos", 2, 0, "Uma vez por Infectado: ganha um recurso do mercado."]
    ],
    ameacas: []
  },
  {
    n: "Colapso da Represa",
    desc: "Represa rachando sobre um povoado.",
    dados: { d6: 2, d10: 0, d12: 2 },
    cond: [
      ["Estrutura instável", "Ações com Potência ganham +C."],
      ["Pressão da água", "A cada rodada, +1 d6 nos dados do Conflito."]
    ],
    ativ: [
      ["CCC", "Rachadura aumenta", "+1 C nas rolagens do Conflito a partir da próxima rodada."],
      ["CCC", "Torrente localizada", "Alvo arrastado e afastado; 2 d10 de dano no próximo turno (B reduz)."],
      ["CCCC", "Rompimento parcial", "A água sobe: B para qualquer ação. Só uma vez."],
      ["AAA", "Mecanismo de segurança", "+AA em Conter a represa."],
      ["BB", "Ativação", "+C no custo de Rompimento total."],
      ["CCCCCCC", "Rompimento total", "Encerra: 6 d12 de dano em todos. Pago de uma vez."]
    ],
    obj: [
      ["p", "Conter a represa", 11, 2, "Os Objetivos Secundários obtidos continuam."],
      ["p", "Evacuar o povoado", 8, 2, "A população é salva mesmo se romper."],
      ["p", "Fuga", 2, 2, ""],
      ["s", "Recuperar arquivos técnicos", 4, 0, "Plantas da represa para cenas futuras."],
      ["s", "Salvar recursos do povoado", 5, 0, "+1 Recurso para o grupo."],
      ["s", "Acalmar os moradores", 3, 2, "Evita que o caos encareça Evacuar."]
    ],
    ameacas: ["Sabotadores do Vale"]
  },
  {
    n: "Predadores de Névoa",
    desc: "Criaturas que exalam névoa espessa e confundem as presas.",
    dados: { d6: 2, d10: 0, d12: 2 },
    cond: [],
    ativ: [
      ["CC", "Investida", "3 d10 num alvo; o próximo ataque contra o predador ganha +A."],
      ["CCCC", "Névoa", "−AA em Percepção no Conflito."],
      ["AAA", "Ventania", "O vento leva a névoa e as penalidades."],
      ["BB", "Farejar", "Remove AA de testes futuros de Furtividade contra um alvo."]
    ],
    obj: [
      ["p", "Neutralização", 6, 1, ""],
      ["p", "Fuga", 2, 2, ""]
    ],
    ameacas: []
  },
  {
    n: "O Guepardal Gigante",
    desc: "Criatura felina colossal com asas emplumadas (Ameaça final).",
    dados: { d6: 1, d10: 1, d12: 4 },
    cond: [],
    ativ: [
      ["CCC", "Mordida", "3 d10 de dano a um alvo."],
      ["CC", "Garras da esfinge", "2 d10 num alvo; cada B a mais atinge outro alvo."],
      ["AAA", "Fadiga", "Tira 1 d12 da criatura até o repouso; sem d12, ela foge (Afugentar)."]
    ],
    obj: [
      ["p", "Neutralizar a ameaça", 15, 3, ""],
      ["p", "Afugentar", 10, 2, ""],
      ["p", "Fuga", 10, 10, "Cada Fadiga reduz AAAAA."],
      ["s", "Obter informações", 1, 0, "Custo BA: entender que a fera se cansa rápido."],
      ["s", "Impedir o voo", 9, 2, "A criatura não gasta mais B."]
    ],
    ameacas: []
  }
];
// Ameaças do livro (para NPCs, tokens e Conflitos): nome, tipo, nível, dados, neutralização [base,+], ativações [custo,nome,efeito], notas
const AMEACAS_LIVRO = [
  {
    n: "Contrabandista",
    tipo: "Humano",
    niv: 0,
    dados: { d6: 3 },
    neut: [3, 0],
    ativ: [
      ["BB", "Mãos leves", "Planta contrabando nos pertences de um Infectado."],
      ["AAAA", "Fui pego!", "É capturado pelos fiscais: tire todas as C das ativações do Conflito."],
      ["CCCCC", "Furto", "Some com um equipamento da mochila de um Infectado."]
    ],
    notas: "Os A para neutralizá-lo só valem se o Infectado gastou B no mesmo turno."
  },
  {
    n: "Sabotadores do Vale",
    tipo: "Humano",
    niv: 0,
    dados: { d6: 2, d10: 1 },
    neut: [4, 1],
    ativ: [
      ["CC", "Sabotagem", "Remove AA de Conter a represa."],
      ["BB", "Proteger aliados", "Remove A de Neutralizar."],
      ["AAA", "Divisão interna", "Um sabotador desiste: −1 d6 da Ameaça."]
    ],
    notas: ""
  },
  {
    n: "Carniçais",
    tipo: "Carniçal",
    niv: 0,
    dados: { d6: 3, d12: 1 },
    neut: [5, 1],
    ativ: [
      ["CC", "Investida brutal", "2 d10 de dano num Infectado."],
      ["CCC", "Fragmentos cortantes", "Estilhaços: +1 d10 em todos por perto."],
      ["BB", "Armadura mineral", "−A na Neutralização até o próximo turno."],
      ["AAA", "Canibalismo instintivo", "Brigam entre si: −1 d6 da Ameaça."]
    ],
    notas: "Ex-humanos assimilados, atacam em bando guiados pelo instinto."
  },
  {
    n: "Predadores de Névoa",
    tipo: "Fauna",
    niv: 1,
    dados: { d6: 2, d12: 2 },
    neut: [6, 1],
    ativ: [
      ["CC", "Investida", "3 d10 num alvo; o próximo ataque contra ele ganha +A."],
      ["CCCC", "Névoa", "−AA em Percepção no Conflito."],
      ["AAA", "Ventania", "Some a névoa e as penalidades."],
      ["BB", "Farejar", "−AA em Furtividade contra um alvo."]
    ],
    notas: ""
  },
  {
    n: "Guepardal Gigante",
    tipo: "Fauna",
    niv: 2,
    dados: { d6: 1, d10: 1, d12: 4 },
    neut: [15, 3],
    ativ: [
      ["CCC", "Mordida", "3 d10 de dano a um alvo."],
      ["CC", "Garras da esfinge", "2 d10; cada B a mais atinge outro alvo."],
      ["AAA", "Fadiga", "−1 d12 até o repouso; sem d12, foge."]
    ],
    notas: "Felino colossal com asas emplumadas."
  },
  {
    n: "Saqueadores",
    tipo: "Humano",
    niv: 0,
    dados: { d6: 2, d10: 1 },
    neut: [4, 1],
    ativ: [
      ["CC", "Golpe", "1 d10 de dano a um alvo."],
      ["CCC", "Tiro", "2 d10 de dano a um alvo (controle de munição)."],
      ["BB", "Cercar", "+A no custo da Fuga."],
      ["AAA", "Debandada", "Um saqueador foge: −1 d6 da Ameaça."]
    ],
    notas: "Modelo nosso (não é do livro)."
  },
  {
    n: "Fera assimilada",
    tipo: "Fauna",
    niv: 1,
    dados: { d10: 2, d12: 1 },
    neut: [6, 2],
    ativ: [
      ["CC", "Mordida", "2 d10 de dano a um alvo."],
      ["CCCC", "Fúria", "2 d10 em dois alvos."],
      ["BB", "Rugido", "−A no próximo teste de um alvo."],
      ["AAA", "Ferida aberta", "−1 d10 da Ameaça."]
    ],
    notas: "Modelo nosso (não é do livro)."
  },
  {
    n: "Planta carnívora assimilada",
    tipo: "Flora",
    niv: 0,
    dados: { d6: 2, d12: 1 },
    neut: [4, 1],
    ativ: [
      ["CC", "Gavinhas", "Prende um alvo: B para agir."],
      ["CCCC", "Ácido", "2 d10 de dano no alvo preso."],
      ["AAA", "Raiz exposta", "+AA na Neutralização."]
    ],
    notas: "Modelo nosso (não é do livro)."
  },
  {
    n: "Milícia armada",
    tipo: "Humano",
    niv: 2,
    dados: { d6: 2, d10: 2, d12: 2 },
    neut: [12, 4],
    ativ: [
      ["CCC", "Rajada", "3 d10 de dano a um alvo."],
      ["CCCCC", "Fogo cruzado", "2 d10 em todos."],
      ["BBB", "Reforços", "+1 d10 na Ameaça."],
      ["AAAA", "Munição acabando", "Sem rajadas por 1 rodada."]
    ],
    notas: "Modelo nosso (não é do livro)."
  }
];
const TIPOS_AMEACA = ["Humano", "Fauna", "Flora", "Carniçal", "Fenômeno", "Outro"];
