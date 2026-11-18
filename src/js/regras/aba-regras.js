"use strict";
/* Painel Regras: resumo das regras do livro em abas (texto próprio). */
/* ===================== REGRAS ===================== */
function regrasHTML() {
  const tabs = [
    ["testes", "Testes"],
    ["dados", "Dados"],
    ["cabo", "Cabo de Guerra"],
    ["saude", "Saúde"],
    ["criacao", "Criação"],
    ["carac", "Características"],
    ["assim", "Assimilação"],
    ["equip", "Equipamentos"],
    ["conflito", "Conflitos"],
    ["refugio", "Refúgios"]
  ];
  const t = S.ruleTab;
  const body = {
    testes: `<p>Para testar, junte um <b>Instinto</b> (1 d6 por ponto) e um <b>Conhecimento ou Prática</b> (1 d10 por ponto), role tudo e <b>mantenha um dado</b>: todos os símbolos da face escolhida contam. Só se testa o que pode falhar e importa para a história.</p>
    <p><b>Sucesso</b> ${sy("a")} é controle narrativo: em geral, A basta; AAA para o realmente difícil. <b>Adaptação</b> ${sy("b")} contorna problemas: em Ação Simples, cada B evita uma C; em Conflito, B muda a ação, ajuda um aliado (vira A dele), apoia (evita C dele), transfere A entre Objetivos ou ignora penalidade. <b>Pressão</b> ${sy("c")} é consequência que o Assimilador escolhe.</p>
    <p><b>Manter mais dados</b>: Empenho (1 d, uma vez por rodada), Origem (uma vez por sessão cada, pode descartar) e Agir por Instinto. Em geral, no máximo 4 mantidos.</p>
    <p><b>Agir por Instinto</b> (Rolagem Assimilada): gaste 1 e (ou 2 d), troque o Conhecimento/Prática por um segundo Instinto, todos os dados viram d12 e mantenha +1. Quem age por instinto não recebe apoio e não usa B para anular C em Ação Simples.</p>
    <table class="t"><thead><tr><th>Pressões</th><th>Consequência</th></tr></thead><tbody>${CONSEQ.slice(1)
      .map((n, i) => `<tr><td class="mono">${"C".repeat(i + 1)}</td><td>${n}</td></tr>`)
      .join("")}</tbody></table>`,
    dados: `<p>Dados com números servem: use a tabela de conversão. O d6 é o mais neutro, o d10 o mais seguro e o d12 o de maior risco e recompensa. Dano: role d10 e conte cada símbolo como 1 ponto.</p>
    <table class="t"><thead><tr><th>Face</th><th>d6</th><th>d10</th><th>d12</th></tr></thead><tbody>${FACES.slice(
      1
    )
      .map((s, i) => {
        const n = i + 1;
        const c = t => (n > t ? "—" : s ? symChips(faceSim(n)) : "vazio");
        return `<tr><td class="mono">${n}</td><td>${c(6)}</td><td>${c(10)}</td><td>${c(12)}</td></tr>`;
      })
      .join("")}</tbody></table>`,
    cabo: `<p>Determinação (vontade, humanidade) e Assimilação (força do parasita) somam sempre 10. Começa-se com Determinação 9 e Assimilação 1. O <b>Nível</b> é o máximo de <b>pontos</b> de cada lado.</p>
    <p><b>Gastar d</b>: Empenho (+1 dado mantido) ou Perseverança (ignorar uma penalidade). <b>Perder d</b>: decepções, perdas, frustração, estresse. Sem pontos de d, o Infectado fica <b>Suscetível</b>: não gasta d, e qualquer nova perda derruba um Nível de Determinação (sobe a Assimilação) e dispara o Teste de Assimilação.</p>
    <p><b>Recupera d</b>: repouso completo (1 + Resolução), boas experiências, Propósitos. <b>e</b> volta todo no fim de cada cena. Sem e, 2 d pagam 1 e.</p>
    <p><b>Clareza de Propósito</b> (arco concluído, Propósito realizado, algo maravilhoso): recupera um Nível de Determinação inteiro ou anula uma C de uma Assimilação Inoportuna.</p>`,
    saude: `<p>Seis Níveis de Saúde, cada um com 1 + Potência + Resolução pontos. Dano marca pontos da direita para a esquerda; esgotou um Nível, desce para o próximo; sem pontos, morte.</p>
    <table class="t"><thead><tr><th>Nível</th><th>Estado</th><th>Penalidade</th><th>Recuperação</th></tr></thead><tbody>${[6, 5, 4, 3, 2, 1].map(n => `<tr><td class="mono">${n}</td><td>${SAUDE_NIVEIS[n]}</td><td>${n >= 5 ? "—" : n >= 3 ? "−A (1 d ou B ignora)" : n === 2 ? "1 d para agir, −AA" : "1 d por rodada para ficar consciente; agir exige BB"}</td><td>${saudeRecTxt(n)}</td></tr>`).join("")}</tbody></table>
    <p>Cada Recuperação regenera Potência + 1. Tratamento médico (Instinto + Medicina): cada A sobe uma categoria do Tempo de Recuperação, cada C desce; nos Níveis 2 e 1 só o tratamento faz voltar a se recuperar.</p>`,
    criacao: `<ol class="small"><li><b>Nome</b>.</li><li><b>Origens</b>: Evento Marcante (passado) e Ocupação (atual).</li><li><b>Geração</b>: ${GERACOES.map((g, i) => `${g} (${GERACAO_TXT[i].toLowerCase()})`).join("; ")}.</li><li><b>Propósitos</b>: dois Pessoais e um Coletivo proposto ao grupo (cada um fica com dois Coletivos).</li><li><b>Aptidões</b>: 1 em cada Instinto + 3 pontos (máx. 3); 7 pontos entre Conhecimentos e Práticas (máx. 2).</li><li><b>Cabo de Guerra</b>: Determinação 9, Assimilação 1 (o mestre pode mudar).</li><li><b>Saúde</b>: 1 + Potência + Resolução por Nível.</li><li><b>Características</b>: 7 pontos de Experiência (sobra sobe Conhecimentos e Práticas pelo dobro do nível novo).</li><li><b>Equipamentos</b>: um pacote inicial, e talvez mais 3 itens comuns ou 1 artefato.</li></ol>
    <p class="small">Depois: Conhecimentos e Práticas custam o dobro do nível novo; Instintos, o triplo, e só depois de uma sessão com mutação.</p>`,
    carac: `<div class="scroll-x"><table class="t"><thead><tr><th>Característica</th><th>Pts</th><th>Requisito</th><th>Resumo</th></tr></thead><tbody>${CARACTERISTICAS.map(c => `<tr><td>${esc(c[0])}</td><td class="mono">${c[1]}</td><td class="small">${esc(reqTxt(c[2]))}</td><td class="small">${esc(c[3])}</td></tr>`).join("")}</tbody></table></div>`,
    assim: `<p>Teste de Assimilação: 1 d10 + 1 d12 por Nível de Assimilação, mantendo tudo. No próximo repouso, puxe uma carta Evolutiva ${NAIPES.ev.s} por A, Adaptativa ${NAIPES.ad.s} por B e Inoportuna ${NAIPES.in.s} por C; o mestre pode oferecer Singulares ${NAIPES.si.s}. Gaste todos os pontos nas mutações (E mínimo conta o nível novo). Com 10 Pressões acumuladas nas Inoportunas, o Infectado é tomado pela Assimilação.</p>${catalogoCartas()}`,
    equip: `<p><b>Escassez</b>: ${ESCASSEZ.map((n, i) => `${i} ${n}`).join(", ")}. <b>Qualidade</b>: ${QUALIDADE.map((n, i) => `${i} ${n}`).join(", ")} (Reforçado em diante dá +A por sessão). Inventário: 3 espaços no corpo e 6 na mochila.</p>
    <div class="scroll-x"><table class="t"><thead><tr><th>Artefato</th><th>Escassez</th><th>Características</th></tr></thead><tbody>${ARTEFATOS.map(a => `<tr><td>${esc(a[0])}</td><td class="mono">${a[1]}</td><td>${esc(a[2].join(", "))}</td></tr>`).join("")}</tbody></table></div>
    <table class="t"><thead><tr><th>Característica</th><th>Cat.</th><th>Resumo</th></tr></thead><tbody>${CARAC_ART.map(c => `<tr><td>${esc(c[0])}</td><td class="mono">${c[1]}</td><td class="small">${esc(c[2])}</td></tr>`).join("")}</tbody></table>
    <table class="t"><thead><tr><th>Pacote</th><th>Itens</th></tr></thead><tbody>${Object.entries(PACOTES)
      .map(([k, l]) => `<tr><td>${esc(k)}</td><td class="small">${esc(l.join(", "))}</td></tr>`)
      .join("")}</tbody></table>`,
    conflito: `<p>Conflito é a cena em turnos: os Infectados declaram, rolam e investem A nos <b>Objetivos</b> (Principais encerram a cena; Secundários dão vantagens). No turno do Assimilador, o Conflito rola seus dados, mantém todos e investe nas <b>ativações</b> (C contra os Infectados, A a favor). Depois, cada <b>Ameaça</b> rola e age. <b>Condicionantes</b> mudam regras só naquela cena.</p>
    <table class="t"><thead><tr><th>Progressão</th><th>Dados do Conflito</th><th>Dados da Ameaça</th><th>Objetivo simples</th><th>Clímax</th></tr></thead><tbody>${PROGRESSAO.map(p => `<tr><td>${p[0]}<div class="muted small">${p[1]}</div></td><td class="mono">${p[2]} + ${p[3]}/Inf.</td><td class="mono">${p[4]} + ${p[5]}/Inf.</td><td class="mono">${p[6][0]}A +${p[6][1]}</td><td class="mono">${p[7][0]}A +${p[7][1]}</td></tr>`).join("")}</tbody></table>
    <p class="small">Valor: d6 = 1, d10 = 2, d12 = 3. Dificuldade: ${DIFICULDADES.map(([n, x]) => `${n}${x ? ` (+${x} d12)` : ""}`).join(", ")}. Custos de ativação: ${ATIV_CUSTOS.map(([c, e]) => `${c} = ${e}`).join("; ")}.</p>`,
    refugio: `<p>Refúgio: População, Reservas, Mobilidade, Defesa, Moral e Beligerância. Região: Tamanho, Perigo, Habitação, Recursos Naturais, Contaminação e Deslocamento. Crise quando a População passa do teto, a Defesa fica abaixo do Perigo ou falta Recurso; Tragédia com Moral 0, fracasso retumbante ou uma vez por campanha. Use o painel <b>Refúgio</b>.</p>
    <table class="t"><thead><tr><th>Símbolos</th><th>Crise</th></tr></thead><tbody>${CRISE_TAB.map(([n, t]) => `<tr><td class="mono">${n}</td><td class="small">${esc(t)}</td></tr>`).join("")}</tbody></table>`
  };
  return `<div class="tabs2">${tabs.map(([k, n]) => `<button data-rt="${k}" aria-pressed="${t === k}">${n}</button>`).join("")}</div><div class="stack">${body[t] || body.testes}</div>
   <p class="muted small">Regras de Assimilação RPG (New Order Editora) resumidas com nossas palavras para a mesa. As regras completas estão no Livro de Regras. Simula Assimilação é um projeto de fã, não oficial.</p>`;
}
function bindRegras() {
  $$("[data-rt]").forEach(
    b =>
      (b.onclick = () => {
        S.ruleTab = b.dataset.rt;
        renderPanel();
      })
  );
}
