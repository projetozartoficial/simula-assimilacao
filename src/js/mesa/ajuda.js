"use strict";
/* Como usar o site (painel e janela de ajuda). */
/* ============================ COMO USAR ============================ */
const AJ_I = n => `<span class="aj-i">${n}</span>`;
const AJUDA = {
  jogador: {
    nome: "Jogador",
    itens: [
      [
        "Entrar na mesa",
        `Abra o link que o mestre mandou e escreva seu nome. Se a mesa tiver senha, o mestre te passa. Se for "só quem eu aprovar", espere ele aceitar: você entra sozinho.`
      ],
      [
        "Não perder seus personagens",
        `Toque em <b>Entrar com Google</b> na página inicial. Assim suas fichas aparecem em qualquer aparelho em que você entrar com a mesma conta. Sem isso, elas ficam só neste navegador.`
      ],
      [
        "Criar seu Infectado",
        `Abra ${AJ_I("Infectados")} → <b>Criar ficha</b>. Na aba <b>Principal</b>: Origens (Evento Marcante e Ocupação), Geração e Propósitos. Na aba <b>Aptidões</b>: 3 pontos nos Instintos e 7 entre Conhecimentos e Práticas. Em <b>Características</b> gaste os 7 pontos de Experiência e em <b>Equipamentos</b> escolha um pacote inicial. Saúde e Cabo de Guerra são calculados sozinhos.`
      ],
      [
        "Fazer um teste",
        `Na ficha, toque em <b>Fazer teste</b> (ou no botão de dados ao lado de uma Aptidão). Escolha o Instinto e o Conhecimento ou Prática, marque Empenho, Origem ou Agir por Instinto se quiser, e role. Depois toque nos dados para escolher quais manter: o site já sugere a melhor escolha. Os pontos de Determinação e Assimilação são descontados sozinhos.`
      ],
      [
        "Cabo de Guerra",
        `Na aba Principal, <b>Gastar 1</b> e <b>Perder 1</b> mexem na Determinação. Sem pontos, o Infectado fica Suscetível; mais uma perda derruba um Nível e abre o <b>Teste de Assimilação</b>. No próximo repouso, a aba <b>Assimilação</b> puxa as cartas e você escolhe as mutações.`
      ],
      [
        "Saúde",
        `Toque nos quadradinhos da Saúde para marcar dano (ou use <b>Sofrer dano</b>). As penalidades de cada Nível entram sozinhas nos testes. <b>Repouso completo</b> e <b>Semana de descanso</b> fazem a Recuperação quando o Nível permite.`
      ],
      [
        "Fotos por estado",
        `Na ficha, aba <b>História</b>, suba fotos de <b>ferido</b>, <b>incapacitado</b>, <b>suscetível</b> e <b>assimilando</b>. A foto da ficha e do token troca sozinha quando a Saúde cai ou a Assimilação avança.`
      ],
      [
        "Falar só com o mestre",
        `Em ${AJ_I("Rolagens")}, mude <b>Para</b> de "Todos" para "Só o mestre". Vale para o chat, para as rolagens e para os testes da ficha.`
      ],
      [
        "Seu token no mapa",
        `Na ficha, aba História → <b>Criar token deste Infectado</b>. Ele usa a arte da ficha. Arraste para andar; só você e o mestre movem o seu token. Toque no token para mudar o formato (quadrado ou redondo) e a cor da moldura.`
      ],
      [
        "Ferramentas do mapa",
        `Na barrinha do mapa: <b>régua</b> (mede em metros), <b>ping</b> (chama a atenção de todos para um ponto), <b>desenho</b> e <b>borracha</b>. Atalhos no computador: V, R, P, D, E.`
      ],
      [
        "Portas, cadeados e escadas",
        `As portas do mapa abrem e fecham na hora, mas quem mexe nelas é o mestre: diga o que seu Infectado faz. Quando uma porta abre, a sala do outro lado aparece. Uma porta com <b>cadeado</b> está trancada; toque nela para ver e combine com o mestre um teste (Crime para a fechadura, Força para arrombar). Um botão roxo com uma escadinha é uma <b>passagem</b> para outro lugar (outro andar, a rua...): o mestre usa e leva o grupo junto, com os tokens.`
      ],
      [
        "Documentos e pistas",
        `O que o mestre te entrega abre sozinho na tela e fica guardado em ${AJ_I("Documentos")}. Partes pretas são trechos que você ainda não descobriu: o mestre pode revelar depois. Documentos também podem aparecer jogados em cima do mapa, como papéis numa mesa: toque para ler. Os seus você pode <b>passar</b> para outro jogador.`
      ],
      [
        "Grifar, anotar e montar o mural",
        `Com um documento aberto, selecione um trecho e toque em <b>Grifar trecho</b>; embaixo, escreva suas <b>anotações</b> (só você vê). Toque em <b>Pôr no mural</b> para pregar o documento no <b>Mural de pistas</b> (em ${AJ_I("Documentos")}), onde o grupo todo arruma as pistas, prega bilhetes e liga uma à outra com barbante.`
      ],
      [
        "Guardar e compartilhar personagens",
        `Na página inicial, em <b>Meus personagens</b>, toque em <b>Baixar</b> para guardar um arquivo do personagem. Mande esse arquivo para um amigo e ele usa <b>Importar personagem</b>. <b>Baixar todos</b> faz um arquivo só com todos os seus personagens; ao importar esse arquivo de volta, os que já estão na sua conta são substituídos (sem criar cópias).`
      ]
    ]
  },
  mestre: {
    nome: "Mestre",
    itens: [
      [
        "Criar a mesa e chamar os jogadores",
        `Na página inicial, crie a mesa e escolha quem pode entrar: qualquer um com o link, só com senha, ou só quem você aprovar. Mande o link. No ${AJ_I("Escudo")} → <b>Acesso à mesa</b> você aprova pedidos, expulsa, bloqueia e muda a senha.`
      ],
      [
        "Conflitos",
        `Em ${AJ_I("Conflito")} → <b>Novo Conflito</b>: comece de um exemplo do livro ou monte o seu (o site sugere dados e custos pela progressão do grupo). Durante o Conflito você controla a rodada e o turno, rola os dados do Conflito e investe os símbolos nas ativações, soma os Sucessos dos jogadores nos Objetivos (os testes recentes aparecem com o botão <b>Investir</b>) e põe Ameaças com dados e ativações próprios.`
      ],
      [
        "Ameaças e NPCs",
        `Em ${AJ_I("Infectados")} → <b>Criar</b>: uma <b>Ameaça</b> tem dados, ativações e custo de Neutralização (há modelos do livro e alguns nossos); um personagem importante pode ter <b>ficha de Infectado</b>. Organize por pasta e use <b>Pôr na cena</b>. Em ${AJ_I("Tokens")} → aba Ameaças, uma Ameaça entra direto no mapa com ficha. Em <b>Artes</b> você sobe uma imagem sua para cada Ameaça.`
      ],
      [
        "Refúgio",
        `Em ${AJ_I("Refúgio")} você registra a comunidade do grupo (População, Reservas, Defesa, Moral…), a Região e as construções, e rola Crises e Tragédias. Todos veem; só você muda.`
      ],
      [
        "Cenas",
        `Em ${AJ_I("Cenas")}: <b>Cena com imagem</b> (sobe um mapa ou cenário seu) ou <b>Criar mapa</b>. Só a cena marcada como <b>Exibir para jogadores</b> aparece para eles; as outras ficam escondidas, e você pode olhar e preparar sem ninguém ver.`
      ],
      [
        "Criador de mapas",
        `Comece de um mapa pronto (Refúgio fortificado, bunker, casa, rua, floresta, cemitério, escola, hospital, delegacia, mansão, motel…) ou em branco. Ferramentas: <b>Sala</b> (arraste um retângulo e já sai com piso e paredes), <b>Piso</b>, <b>Balde</b>, <b>Parede</b>, <b>Porta</b>, <b>Objetos</b> (tem busca), <b>Texto</b> e <b>Borracha</b>. Ctrl+Z desfaz; R gira; Delete apaga. No fim, <b>Usar como cena</b>. Em Cenas, <b>Copiar p/ outra mesa</b> leva a cena ou o mapa para outra mesa sua.`
      ],
      [
        "Portas que abrem e fecham",
        `As portas que você põe no criador viram portas de verdade na mesa (em cenas feitas ou atualizadas com <b>Usar como cena</b>). Toque numa porta para abrir ou fechar: ao abrir, o local escondido do outro lado aparece para os jogadores. <b>Segure o dedo</b> (ou clique com o botão direito) numa porta para trancar: os jogadores veem um cadeado, e você toca nela para destrancar quando alguém passar no teste. A <b>Porta trancada</b> do criador já começa assim. A <b>passagem secreta</b> parece parede para os jogadores até você abrir.`
      ],
      [
        "Andares e lugares ligados",
        `Em ${AJ_I("Cenas")}, no cartão da cena, toque em <b>Passagens</b>: dê um nome (Escada, Elevador, Saída) e escolha para qual cena leva. Marque para criar a volta na outra cena. A passagem aparece no mapa; arraste para cima da escada. Na hora, toque nela: todos vão para a outra cena, e os tokens dos Infectados vão junto.`
      ],
      [
        "Locais escondidos",
        `No criador de mapas, use a ferramenta <b>Esconder local</b> (olho riscado, tecla X): clique numa sala ou arraste um retângulo. Na mesa esses locais ficam pretos para os jogadores; revele um por um pelo botão <b>Locais</b> na barrinha do mapa.`
      ],
      [
        "Nomes dos lugares",
        `Os nomes escritos no mapa ligam e desligam pelo botão <b>T</b> na barrinha do mapa. Em Cenas → Editar você esconde só alguns.`
      ],
      [
        "Névoa de guerra",
        `Na barrinha do mapa, use <b>revelar</b> (olho) e <b>esconder</b> (olho riscado) arrastando sobre o mapa. Os jogadores só veem o que você revelou.`
      ],
      [
        "Tokens e Ameaças",
        `Em ${AJ_I("Tokens")} você cria tokens com imagem e, na aba <b>Ameaças</b>, põe as Ameaças do livro (ou as suas, do Homebrew) direto na cena: cada uma ganha uma ficha (Infectados → NPCs e Ameaças) e, se houver Conflito, entra nele. Em <b>Artes das Ameaças</b> você sobe uma imagem sua para cada uma.`
      ],
      [
        "Documentos",
        `Em ${AJ_I("Documentos")} → <b>Criar documento</b>. Escolha o modelo (relatório, carta, jornal, B.O., laudo, diário, celular…). Escreva entre [[ e ]] o que deve chegar tarjado. Guarde na biblioteca e toque em <b>Entregar</b> na hora certa (para um jogador ou para todos); depois, <b>Revelar trechos</b>. O modelo <b>Foto</b> vira uma foto com legenda; <b>Cartaz</b>, <b>E-mail</b> e <b>Áudio</b> (grave pelo microfone; o texto vira a transcrição) também existem. Ao lado de <b>Tarjar trecho</b>, escolha o estilo da tarja: tarja preta, rabisco, mancha de sangue, pedaço rasgado, queimado, mensagem apagada, chiado... cada modelo mostra só os que fazem sentido nele. Em <b>Aparência</b>, ponha um <b>carimbo</b> (texto e cor), e o botão <b>Caneta</b> escreve anotações à mão em vermelho (entre (( e ))). <b>Pôr no mapa</b> joga o papel na cena, meio torto, por cima dos outros; arraste para mover e, passando o mouse, use ↺ ↻ para girar e − + para mudar o tamanho; e <b>Mural</b> prega no Mural de pistas do grupo.`
      ],
      [
        "Trilha sonora",
        `Em ${AJ_I("Trilha")}, cole links do YouTube ou de MP3 e toque para tocar para todos ao mesmo tempo. Cada um ajusta o próprio volume.`
      ],
      [
        "Escudo do mestre",
        `O ${AJ_I("Escudo")} mostra Saúde, Determinação e Assimilação de todos, dá Experiência para o grupo, libera as Origens numa nova sessão, faz rolagens secretas e guarda suas anotações. Lá também fica o <b>Backup da mesa</b>.`
      ]
    ]
  },
  dicas: {
    nome: "Dicas",
    itens: [
      [
        "Não está sincronizando?",
        `Recarregue a página. Se continuar, confira a internet: tudo é salvo na nuvem na hora.`
      ],
      [
        "Celular",
        `Funciona tudo no celular, mas mapa e criador de mapas são mais confortáveis no computador. No celular, use dois dedos para dar zoom no mapa.`
      ],
      [
        "Dados numéricos",
        `Na aba Regras → Dados está a tabela de conversão do livro, para quem quiser rolar dados físicos comuns.`
      ],
      [
        "Backup",
        `Baixe a ficha em Infectados (aba História) e a mesa inteira no Escudo. Dá para restaurar pela página inicial.`
      ]
    ]
  }
};
function ajudaHTML() {
  const t = S.ajTab || (S.isM ? "mestre" : "jogador");
  return `<div class="tabs2">${Object.entries(AJUDA)
    .map(([k, a]) => `<button data-ajt="${k}" aria-pressed="${t === k}">${a.nome}</button>`)
    .join("")}</div>
   <div class="stack" style="gap:8px">${AJUDA[t].itens.map(([h, p], i) => `<details class="box aj" ${i < 2 ? "open" : ""}><summary><b>${h}</b></summary><p>${p}</p></details>`).join("")}${relatorioHTML()}
   <div class="box stack"><b>Privacidade e regras</b><nav class="legal-links" aria-label="Informações legais">${Object.keys(
     LEGAL_PAGINAS
   )
     .map(k => legalLink(k))
     .join(
       ""
     )}</nav><span class="muted small">Um projeto do ${ZART.nome} · Contato: ${contato()}</span></div></div>`;
}
function bindAjuda() {
  $$("[data-ajt]").forEach(
    b =>
      (b.onclick = () => {
        S.ajTab = b.dataset.ajt;
        renderPanel();
      })
  );
  bindRelatorio(); // "Algo deu errado?" (nucleo/erros.js)
  bindLegal($("#pbody")); // links de privacidade e regras (legal/legal.js)
}
function ajudaModal() {
  const h = $("#modalHost");
  const r = () => {
    h.innerHTML = `<div class="modal-back"><div class="modal" style="max-width:640px" role="dialog" aria-label="Como usar"><div class="row between"><h3 style="margin:0">Como usar o Simula Assimilação</h3><button class="btn sm" id="ajX" data-fechar>Fechar</button></div>${ajudaHTML()}</div></div>`;
    $("#ajX").onclick = () => (h.innerHTML = "");
    bindRelatorio();
    bindLegal(h);
    $$("[data-ajt]").forEach(
      b =>
        (b.onclick = () => {
          S.ajTab = b.dataset.ajt;
          r();
        })
    );
  };
  r();
}
function ajudaPrimeiraVez() {
  if (lsGet("sa_ajuda", false)) return;
  lsSet("sa_ajuda", true);
  setTimeout(() => toast("Primeira vez aqui? Toque em ? (Como usar) na barra lateral."), 1500);
}
