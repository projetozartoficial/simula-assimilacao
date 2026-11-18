"use strict";
/* Ficha do Infectado: o que aparece em cada aba (Principal, Aptidões, Assimilação...). */
/* ---------- ficha: HTML ---------- */
const SHEET_TABS = [
  ["principal", "Principal"],
  ["aptidoes", "Aptidões"],
  ["assimilacao", "Assimilação"],
  ["carac", "Características"],
  ["equip", "Equipamentos"],
  ["historia", "História"]
];
function sheetHTML() {
  const id = S.openFicha;
  const f = fA();
  if (!f)
    return `<div class="empty">Esta ficha não existe mais. <button class="btn sm" data-back>Voltar</button></div>`;
  if (f.rapido) return npcRapidoHTML(id, f); // Ameaça ou NPC de ficha rápida (ficha/npcs)
  const D = derivados(f);
  const ed = canEditFicha(f);
  const t = S.sheetTab || "principal";
  const pedi = (S.pedidos || []).find(x => x.id === S.uid && x.fichaId === id);
  const claim =
    !ed && f.dono !== S.uid && !f.npc
      ? `<div class="banner info">${pedi ? "Pedido enviado. Quando o mestre aprovar, a ficha volta a ser sua." : `Esta ficha é sua e você perdeu o acesso (trocou de aparelho ou limpou o navegador)? <button type="button" class="btn sm primary" id="btnClaim">Pedir minha ficha de volta</button>`}</div>`
      : "";
  const npcBar =
    f.npc && S.isM
      ? `<label class="check banner info"><input type="checkbox" id="npcVis" ${f.visivel ? "checked" : ""}> NPC visível para os jogadores (eles só leem)</label>`
      : "";
  const transf =
    S.isM && !f.npc
      ? `<details class="more"><summary>Dono da ficha (mestre)</summary><div class="stack" style="margin-top:8px;gap:6px">${
          (S.pedidos || [])
            .filter(x => x.fichaId === id)
            .map(
              x =>
                `<div class="row between"><span class="small">${esc(x.quem || "Jogador")} pediu esta ficha</span><span class="row"><button type="button" class="btn sm primary" data-aprova="${esc(x.id)}">Dar a ficha</button><button type="button" class="btn sm ghost" data-recusa="${esc(x.id)}">Recusar</button></span></div>`
            )
            .join("") ||
          `<span class="muted small">Nenhum pedido. Quando um jogador perder o acesso, ele pede a ficha de volta por aqui e você aprova.</span>`
        }</div></details>`
      : "";
  const head = `<div class="row between"><button class="btn sm ghost" data-back>← Infectados</button><span class="row" style="gap:6px">${fichaAcoesHTML(f)}<span class="muted small" id="saveState">${ed ? "Salvo" : "Só leitura"}</span></span></div>${claim}${npcBar}${transf}
  <div class="sheet-top"><button type="button" class="photo" id="foto" aria-label="Trocar foto" ${ed ? "" : "disabled"}>${fotoAtual(f) ? `<img src="${fotoAtual(f)}" alt="">` : `<span>Toque para pôr a arte do Infectado</span>`}</button>
   <div class="stack" style="gap:6px;min-width:0"><input class="nmin" type="text" id="s_nome" data-f="nome" value="${esc(f.nome)}" maxlength="50" aria-label="Nome do Infectado" ${ed ? "" : "disabled"}>
    <div class="muted small">${esc(f.ocupacao || "Sem ocupação")} · ${esc(GERACOES[f.geracao] || "")}</div>
    ${caboMini(f, D)}
    <div class="row" style="gap:6px"><button type="button" class="btn sm primary" id="btnTeste">Fazer teste</button><button type="button" class="btn sm" id="btnAssimTeste" title="1 d10 + 1 d12 por nível de Assimilação">Teste de Assimilação</button></div></div></div>
  ${D.pressoes >= 10 ? `<div class="banner">10 Pressões em Assimilações Inoportunas: este Infectado foi tomado pela Assimilação e passa ao Assimilador.</div>` : ""}
  ${f.assimPend ? `<div class="banner info">Assimilação em curso (${symChips(f.assimPend)}). No próximo repouso, abra a aba <b>Assimilação</b> para puxar as cartas.</div>` : ""}
  <div class="tabs2" role="tablist">${SHEET_TABS.map(([k, n]) => `<button type="button" data-stab="${k}" aria-pressed="${t === k}">${n}</button>`).join("")}</div>`;
  const body = {
    principal: () => tabPrincipal(f, D),
    aptidoes: () => tabAptidoes(f, D),
    assimilacao: () => tabAssimilacao(f, D),
    carac: () => tabCarac(f, D),
    equip: () => tabEquip(f, D),
    historia: () => tabHistoria(f)
  }[t]();
  return (
    head +
    `<fieldset ${ed ? "" : "disabled"} style="border:0;padding:0;margin:0;min-width:0" class="stack">${body}</fieldset>`
  );
}
function caboMini(f, D) {
  const d = cur(f, "d"),
    e = cur(f, "e");
  return `<div class="cabo mini" title="Cabo de Guerra: Determinação ${D.D} · Assimilação ${D.E}">${Array.from(
    { length: 10 },
    (_, i) => {
      const isD = i < D.D;
      const gasto = isD ? i >= d : i - D.D >= e;
      return `<span class="cb-c ${isD ? "det" : "ass"} ${gasto ? "off" : ""}"></span>`;
    }
  ).join("")}</div>
   <div class="row between small"><span><b class="tD">D ${d}/${D.D}</b> Determinação</span><span>Assimilação <b class="tE">E ${e}/${D.E}</b></span></div>`;
}
function pmBtn(attr, v, label) {
  return `<button type="button" ${attr} data-d="-1" aria-label="Diminuir ${label}">−</button><button type="button" ${attr} data-d="1" aria-label="Aumentar ${label}">+</button>`;
}

function tabPrincipal(f, D) {
  const auto = condAuto(f);
  return `<div class="fields">
   <div class="field"><label class="label" for="s_jogador">Jogador</label><input type="text" id="s_jogador" data-f="jogador" value="${esc(f.jogador)}" maxlength="40"></div>
   <div class="field"><label class="label" for="s_idade">Idade</label><input type="text" id="s_idade" data-f="idade" value="${esc(f.idade || "")}" maxlength="20"></div>
   <div class="field"><label class="label" for="s_geracao">Geração</label><select id="s_geracao" data-fn="geracao">${GERACOES.map((g, i) => `<option value="${i}" ${+f.geracao === i ? "selected" : ""}>${g}</option>`).join("")}</select></div>
  </div>
  <div class="box stack"><div class="row between"><h3>Origens</h3><span class="muted small">cada uma mantém +1 dado, uma vez por sessão</span></div>
   <div class="orig"><div class="field"><label class="label" for="s_evento">Evento Marcante (passado)</label><input type="text" id="s_evento" data-f="evento" value="${esc(f.evento)}" maxlength="80" placeholder="Ex.: Sobrevivente da queda de uma cidade"></div><label class="check small"><input type="checkbox" data-uso="evento" ${f.origUso && f.origUso.evento ? "checked" : ""}> usada</label></div>
   <div class="orig"><div class="field"><label class="label" for="s_ocupacao">Ocupação (atual)</label><input type="text" id="s_ocupacao" data-f="ocupacao" value="${esc(f.ocupacao)}" maxlength="60" placeholder="Duas palavras: Mercador honrado"></div><label class="check small"><input type="checkbox" data-uso="ocupacao" ${f.origUso && f.origUso.ocupacao ? "checked" : ""}> usada</label></div>
  </div>
  <div class="box stack"><div class="row between"><h3>Propósitos</h3><button type="button" class="btn sm" id="btnClareza">Clareza de Propósito</button></div>
   <div class="label">Pessoais</div>${(f.propP || []).map((p, i) => `<div class="orig"><input type="text" data-pp="${i}" value="${esc(p.t)}" maxlength="90" placeholder="Ex.: Encontrar os antigos companheiros" aria-label="Propósito pessoal ${i + 1}"><label class="check small"><input type="checkbox" data-ppok="${i}" ${p.ok ? "checked" : ""}> alcançado</label></div>`).join("")}
   <div class="label">Coletivos</div>${(f.propC || []).map((p, i) => `<div class="orig"><input type="text" data-pc="${i}" value="${esc(p.t)}" maxlength="90" placeholder="Ex.: Mapear toda a região" aria-label="Propósito coletivo ${i + 1}"><label class="check small" title="Inerte: ninguém mais aderiu, não dá Clareza"><input type="checkbox" data-pcin="${i}" ${p.inerte ? "checked" : ""}> inerte</label></div>`).join("")}
   <p class="muted small" style="margin:0">Propósito Coletivo só vale (dá Clareza) se pelo menos mais um jogador aderir; sem adesão, fica inerte.</p>
  </div>
  ${caboHTML(f, D)}
  ${saudeHTML(f, D)}
  <div class="box stack"><div class="row between"><h3>Condições</h3><button type="button" class="btn sm" id="condAdd">+ Condição</button></div>
   ${auto.length ? `<div class="conds">${auto.map(x => `<span class="tag red">${esc(x)}</span>`).join("")}</div>` : ""}
   ${(f.enf || []).map((e, i) => `<div class="condrow"><span>${sy("c")}</span><div style="min-width:0"><b>${esc(e.nome || "Enfermidade")}</b><div class="muted small">${esc(e.int)} · ${esc(e.inst)}: −${e.int === "Severa" ? 2 : 1} dado mantido</div></div><button type="button" class="x" data-unenf="${i}" aria-label="Curar">✕</button></div>`).join("")}
   ${(f.cond || []).map((x, i) => `<div class="condrow"><span>${sy("c")}</span><div style="min-width:0"><b>${esc(x)}</b></div><button type="button" class="x" data-uncond="${i}" aria-label="Tirar ${esc(x)}">✕</button></div>`).join("")}
   ${!auto.length && !(f.enf || []).length && !(f.cond || []).length ? `<div class="muted small">Nenhuma condição.</div>` : ""}
  </div>
  <div class="box stack"><h3>Tempo</h3>
   <div class="row"><button type="button" class="btn sm" id="tFimCena">Fim da cena</button><button type="button" class="btn sm" id="tRepouso">Repouso completo</button><button type="button" class="btn sm" id="tSemana">Semana de descanso</button><button type="button" class="btn sm ghost" id="tSessao">Nova sessão</button></div>
   <p class="muted small" style="margin:0">Fim da cena: recupera todos os pontos de Assimilação. Repouso completo (8 h em boas condições): recupera 1 + Resolução de Determinação e, nos Níveis de Saúde 6 e 5, regenera Saúde. Semana: regenera nos Níveis 4 e 3. Nova sessão: libera as Origens de novo.</p>
  </div>`;
}
function caboHTML(f, D) {
  const d = cur(f, "d"),
    e = cur(f, "e");
  return `<div class="box stack"><div class="row between"><h3>Cabo de Guerra</h3><span class="muted small">a soma é sempre 10</span></div>
   <div class="cabo">${Array.from({ length: 10 }, (_, i) => {
     const isD = i < D.D;
     const gasto = isD ? i >= d : i - D.D >= e;
     return `<span class="cb-c ${isD ? "det" : "ass"} ${gasto ? "off" : ""}">${isD ? i + 1 : 10 - i}</span>`;
   }).join("")}</div>
   <div class="cabo2">
    <div class="cbx det"><div class="label">Determinação</div><div class="big">${d}<small>/${D.D}</small></div>
     <div class="pm"><button type="button" class="btn sm" data-dpt="gasta" ${f.susc ? "disabled" : ""}>Gastar 1</button><button type="button" class="btn sm" data-dpt="perde">Perder 1</button><button type="button" class="btn sm ghost" data-dpt="rec">+1</button></div></div>
    <div class="cbx ass"><div class="label">Assimilação</div><div class="big">${e}<small>/${D.E}</small></div>
     <div class="pm"><button type="button" class="btn sm" data-ept="gasta">Gastar 1</button><button type="button" class="btn sm ghost" data-ept="rec">+1</button></div></div>
   </div>
   ${f.susc ? `<div class="banner">Estado Suscetível: sem pontos de Determinação. Não pode gastar d até concluir a Assimilação. Qualquer nova perda tira um Nível de Determinação.</div>` : ""}
   <div class="muted small">Pressões em Inoportunas: <b style="color:${D.pressoes >= 7 ? "var(--red-hi)" : "var(--fg)"}">${D.pressoes}/10</b>. Gastar d: manter +1 dado (Empenho, 1 por rodada) ou ignorar uma penalidade (Perseverança). Gastar e: Agir por Instinto e ativar Assimilações. Sem e, 2 d pagam 1 e.</div>
   <details class="more"><summary>Ajustar níveis (mestre ou criação)</summary><div class="row" style="margin-top:8px"><span class="small">Nível de Determinação</span><span class="pmr">${pmBtn("data-dnivel", D.D, "Determinação")}</span><b class="mono">${D.D}</b><span class="muted small">(Assimilação ${D.E})</span></div></details>
  </div>`;
}
function saudeHTML(f, D) {
  const P = D.P;
  const dano = +f.dano || 0;
  const rows = [6, 5, 4, 3, 2, 1]
    .map(n => {
      const ini = (6 - n) * P;
      return `<div class="sd-row ${D.nivel === n ? "now" : ""} ${D.nivel < n ? "lost" : ""}"><span class="sd-n">${n}</span><span class="sd-t">${SAUDE_NIVEIS[n]}</span><span class="sd-b">${Array.from(
        { length: P },
        (_, k) => {
          const idx = ini + k + 1;
          return `<button type="button" class="sd-p ${idx <= dano ? "x" : ""} ${k === P - 1 ? "first" : ""}" data-dano="${idx}" aria-label="Dano até ${idx}"></button>`;
        }
      ).join("")}</span></div>`;
    })
    .join("");
  return `<div class="box stack"><div class="row between"><h3>Saúde</h3><span class="muted small">${P} pontos por Nível (1 + Potência + Resolução)</span></div>
   <div class="sd">${rows}</div>
   <div class="row"><button type="button" class="btn sm" id="sDano">Sofrer dano</button><button type="button" class="btn sm" id="sCura">Recuperar pontos</button><button type="button" class="btn sm ghost" id="sTrat">Tratamento médico</button></div>
   <div class="muted small">${D.nivel <= 0 ? "<b>Sem pontos de Saúde: o Infectado morreu.</b>" : `Nível ${D.nivel} · ${SAUDE_NIVEIS[D.nivel]}. ${D.nivel >= 5 ? "Age normalmente." : D.nivel >= 3 ? "−A em todos os testes (gaste 1 d ou B para ignorar)." : D.nivel === 2 ? "Precisa gastar 1 d para agir; −AA nos testes." : "Entre a vida e a morte: 1 d por rodada para ficar consciente; agir exige BB."} Recuperação ${saudeRecTxt(D.nivelRec)}${+f.trat ? ` (tratamento: ${+f.trat > 0 ? "+" : ""}${+f.trat} categoria)` : ""}.`}</div></div>`;
}

function tabAptidoes(f, D) {
  const xp = D.xp;
  const somaI = INSTINTOS.reduce((s, k) => s + (+f.inst[k] || 0), 0);
  const somaA = APTIDOES.reduce((s, k) => s + (+f.apt[k] || 0), 0);
  const linha = (k, tipo) => {
    const base = tipo === "i" ? +f.inst[k] || 0 : +f.apt[k] || 0;
    const tot = tipo === "i" ? instTot(f, k) : aptTot(f, k);
    const adj =
      tipo === "i"
        ? ADJ_INST[k][tot - 1] || NIV_INST[Math.min(5, tot)] || ""
        : (CONHECIMENTOS.includes(k) ? NIV_CONH : NIV_PRAT)[Math.min(5, tot)];
    const dado = tipo === "i" ? "d6" : "d10";
    return `<div class="apt ${tot ? "tr" : ""}"><span class="an">${esc(k)}</span><span class="aj muted small">${esc(adj || "")}${tot !== base ? ` <span class="tag on" title="Bônus de Assimilação">${tot > base ? "+" : ""}${tot - base}</span>` : ""}</span>
     <span class="pmr">${pmBtn(`data-${tipo === "i" ? "inst" : "apt"}="${esc(k)}"`, base, k)}</span><b class="an2">${tot}</b>
     <button type="button" class="rollbtn" data-rt${tipo}="${esc(k)}" title="Testar">${tot}${dado}</button></div>`;
  };
  return `<div class="box stack"><div class="row between"><h3>Instintos <span class="muted small">(d6)</span></h3><span class="muted small">${somaI - 6 <= 3 ? `criação: ${Math.max(0, 3 - (somaI - 6))} de 3 pontos livres` : `${somaI - 6} pontos acima da base`}</span></div>
    <div>${INSTINTOS.map(k => linha(k, "i")).join("")}</div>
    <p class="muted small" style="margin:0">Começa com 1 em cada e 3 pontos livres (máximo 3 na criação). Depois, cada nível custa o triplo do nível novo em Experiência, só após uma sessão em que passou por mutação.</p></div>
   <div class="box stack"><div class="row between"><h3>Conhecimentos <span class="muted small">(d10)</span></h3><span class="muted small">${somaA <= 7 ? `criação: ${7 - somaA} de 7 pontos (com Práticas)` : `${somaA} pontos`}</span></div>
    <div>${CONHECIMENTOS.map(k => linha(k, "a")).join("")}</div></div>
   <div class="box stack"><h3>Práticas <span class="muted small">(d10)</span></h3>
    <div>${PRATICAS.map(k => linha(k, "a")).join("")}</div>
    <p class="muted small" style="margin:0">7 pontos entre Conhecimentos e Práticas na criação (máximo 2 em cada). Depois, cada nível custa o dobro do nível novo em Experiência.</p></div>
   <div class="box stack"><h3>Experiência</h3>
    <div class="stats">${[
      ["Ganha", xp.ganho],
      ["Gasta", xp.gasto],
      ["Saldo", xp.saldo]
    ]
      .map(
        ([k, v]) =>
          `<div style="${k === "Saldo" && v < 0 ? "border-color:var(--red)" : ""}"><b>${v}</b><span>${k}</span></div>`
      )
      .join("")}</div>
    <div class="muted small">Gasto: Instintos ${xp.custoI} · Conhecimentos e Práticas ${xp.custoA} · Características ${xp.custoC}. Os 7 pontos iniciais já estão na conta.</div>
    <div class="fields"><div class="field"><label class="label" for="s_xp">Experiência recebida nas sessões</label><input type="number" id="s_xp" data-fn="xp" value="${+f.xp || 0}" min="0"></div>
     <div class="field"><label class="label" for="s_xpa">Ajuste (mestre)</label><input type="number" id="s_xpa" data-fn="xpAjuste" value="${+f.xpAjuste || 0}"></div></div>
   </div>`;
}

function tabAssimilacao(f, D) {
  const M = mutsDe(f);
  const p = f.assimPend;
  const grp = Object.keys(NAIPES)
    .map(nk => {
      const l = M.filter(m => m.naipe === nk);
      if (!l.length) return "";
      return `<div class="sub" style="color:${NAIPES[nk].cor}">${NAIPES[nk].s} ${NAIPES[nk].n}</div><div class="cards">${l
        .map(m => {
          const c = custoSim(m.custo).c;
          return `<div class="mut ${nk}"><div class="row between" style="flex-wrap:nowrap"><b>${esc(m.n)}</b><span class="row" style="gap:6px;flex-wrap:nowrap">${custoHTML(m.custo)}${m.e ? `<span class="tag">E ${m.e}+</span>` : ""}</span></div>
      <div class="muted small">${esc(m.carta)} · ${esc(m.ef)}</div>
      ${nk === "in" ? `<div class="row small" style="gap:6px">Pressões anuladas: <b class="mono">${m.anul}/${c}</b>${m.anul >= c ? ` <span class="tag on">efeito anulado</span>` : ""}</div>` : ""}
      ${canEditFicha(f) ? `<div class="row" style="justify-content:flex-end"><button type="button" class="btn sm ghost" data-mutrm="${(f.muts || []).indexOf(m.ref)}">Tirar</button></div>` : ""}</div>`;
        })
        .join("")}</div>`;
    })
    .join("");
  return `${p ? pendHTML(f, D, p) : ""}
   <div class="box stack"><div class="row between"><h3>Assimilações</h3><span class="muted small">Pressões ${D.pressoes}/10</span></div>
    ${grp || `<div class="muted small">Nenhuma mutação ainda.</div>`}
    <details class="more"><summary>Adicionar mutação manualmente</summary><div class="stack" style="margin-top:8px">
     <div class="row" style="flex-wrap:nowrap"><select id="mutNaipe" style="max-width:150px">${Object.entries(
       NAIPES
     )
       .map(([k, n]) => `<option value="${k}">${n.s} ${n.n}</option>`)
       .join(
         ""
       )}</select><select id="mutCarta">${CARTAS_ORD.map(c => `<option value="${c}">${c} · ${esc(ASSIMILACOES.ev[c][0])}</option>`).join("")}</select></div>
     <div class="row" style="flex-wrap:nowrap"><select id="mutSel"></select><button type="button" class="btn sm" id="mutAdd">Adicionar</button></div>
     ${
       hbOf("mutacao").length
         ? `<div class="row" style="flex-wrap:nowrap"><select id="mutHb">${hbOf("mutacao")
             .map(
               h =>
                 `<option value="${esc(h.id)}">${esc((NAIPES[h.naipe] || {}).s || "")} ${esc(h.nome)} · ${esc(h.custo)}</option>`
             )
             .join(
               ""
             )}</select><button type="button" class="btn sm" id="mutHbAdd">Adicionar homebrew</button></div>`
         : ""
     }</div></details>
   </div>
   <div class="box stack"><h3>Como funciona</h3><p class="muted small" style="margin:0">Ao perder um ponto de Determinação sem nenhum sobrando, o Infectado perde um Nível de Determinação, ganha um de Assimilação e faz o <b>Teste de Assimilação</b>: 1 d10 + 1 d12 por Nível de Assimilação, mantendo todos. No próximo repouso puxa uma carta Evolutiva (♥) por A, Adaptativa (♦) por B e Inoportuna (♠) por C, e gasta todos os pontos nas mutações das cartas. Se as Pressões das Inoportunas chegarem a 10, o Infectado é tomado pela Assimilação.</p></div>
   <details class="box"><summary style="cursor:pointer"><b>Todas as cartas</b> <span class="muted small">(consulta)</span></summary><div class="stack" style="margin-top:10px">${catalogoCartas()}</div></details>`;
}
function catalogoCartas() {
  return Object.entries(NAIPES)
    .map(
      ([nk, n]) =>
        `<div class="sub" style="color:${n.cor}">${n.s} ${n.n}</div>${CARTAS_ORD.map(c => {
          const k = ASSIMILACOES[nk][c];
          return `<details class="mutcat"><summary><b>${c}${n.s}</b> Assimilação ${esc(k[0])} <span class="muted small">· ${esc(k[1])}</span></summary><div class="stack" style="gap:4px;margin-top:6px">${k[2].map(m => `<div class="mrow"><span>${custoHTML(m[1])}</span><b>${esc(m[0])}</b>${m[2] ? `<span class="tag">E ${m[2]}+</span>` : ""}<span class="muted small">${esc(m[3])}</span></div>`).join("")}</div></details>`;
        }).join("")}`
    )
    .join("");
}
function pendHTML(f, D, p) {
  if (!p.cartas)
    return `<div class="box stack pend"><h3>Assimilação em curso</h3><div class="row">${symChips(p)}<span class="muted small">do Teste de Assimilação</span></div>
    <p class="muted small" style="margin:0">As mutações acontecem no próximo momento calmo de repouso. Se houver Clareza de Propósito antes do fim da cena, as Pressões são anuladas.</p>
    ${S.isM ? `<div class="field"><label class="label" for="pendSing">Assimilações Singulares que o mestre oferece (opcional)</label><select id="pendSing" multiple size="4">${CARTAS_ORD.map(c => `<option value="${c}">${c}♣ Assimilação ${esc(ASSIMILACOES.si[c][0])}</option>`).join("")}</select></div>` : ""}
    <div class="row"><button type="button" class="btn primary" id="pendPuxar">Puxar as cartas</button>${p.c ? `<button type="button" class="btn sm ghost" id="pendClareza">Clareza antes do fim da cena (anular C)</button>` : ""}</div></div>`;
  const usado = pendUsado(f, p);
  const rest = { a: p.a - usado.a, b: p.b - usado.b, c: p.c - usado.c };
  const ok = rest.a === 0 && rest.b === 0 && rest.c === 0;
  const tem = new Set((f.muts || []).map(m => m.naipe + m.c + ":" + m.i));
  const sel = new Set(p.sel || []);
  const cartas = Object.entries(p.cartas).flatMap(([nk, l]) => l.map(c => [nk, c]));
  return `<div class="box stack pend"><div class="row between"><h3>Escolha as mutações</h3><span class="row" style="gap:6px">Restam ${symChips(rest, "nada")}</span></div>
   <p class="muted small" style="margin:0">Todos os pontos precisam ser gastos. Mutações de E mais alto exigem o seu Nível de Assimilação (agora ${D.E}). Não é preciso usar todas as cartas, e dá para pegar a terceira mutação sem ter as anteriores.</p>
   ${cartas
     .map(([nk, c]) => {
       const k = ASSIMILACOES[nk][c];
       return `<div class="mutcard ${nk}"><div class="mc-h"><b>${c}${NAIPES[nk].s}</b> Assimilação ${esc(k[0])}</div>
     ${k[2]
       .map((m, i) => {
         const key = nk + c + ":" + i;
         const ja = tem.has(key);
         const on = sel.has(key);
         const cs = custoSim(m[1]);
         const pode = on || (cs.a <= rest.a && cs.b <= rest.b && cs.c <= rest.c && (m[2] || 0) <= D.E && !ja);
         return `<label class="mrow pick ${on ? "on" : ""} ${!pode ? "dis" : ""}"><input type="checkbox" data-psel="${key}" ${on ? "checked" : ""} ${pode ? "" : "disabled"}><span>${custoHTML(m[1])}</span><b>${esc(m[0])}</b>${m[2] ? `<span class="tag">E ${m[2]}+</span>` : ""}${ja ? `<span class="tag on">já tem</span>` : ""}<span class="muted small">${esc(m[3])}</span></label>`;
       })
       .join("")}</div>`;
     })
     .join("")}
   <div class="row"><button type="button" class="btn primary" id="pendOk">${ok ? "Concluir a Assimilação" : "Concluir mesmo assim"}</button><button type="button" class="btn sm ghost" id="pendRe">Voltar às cartas</button></div></div>`;
}
function pendUsado(f, p) {
  return (p.sel || []).reduce(
    (o, key) => {
      const [a, i] = key.split(":");
      const nk = a.slice(0, 2),
        c = a.slice(2);
      const m = mutacao(nk, c, +i);
      if (!m) return o;
      const s = custoSim(m.custo);
      return { a: o.a + s.a, b: o.b + s.b, c: o.c + s.c };
    },
    { a: 0, b: 0, c: 0 }
  );
}
function puxarCartas(n, naipe, ja) {
  const pool = CARTAS_ORD.filter(c => !ja.includes(c));
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    out.push(pool.splice(d(pool.length) - 1, 1)[0]);
  }
  return out;
}

function reqOK(f, req) {
  const D = derivados(f);
  return (req || []).every(([k, v]) => {
    if (k === "criacao") return true;
    if (k === "E") return D.E >= v;
    return k.split("|").some(x => (INSTINTOS.includes(x) ? instTot(f, x) : aptTot(f, x)) >= v);
  });
}
function reqTxt(req) {
  return (
    (req || [])
      .map(([k, v]) =>
        k === "criacao"
          ? "só na criação"
          : k === "E"
            ? `Assimilação ${v}+`
            : `${k.split("|").join(" ou ")} ${v}+`
      )
      .join(", ") || "sem requisito"
  );
}
function tabCarac(f, D) {
  const xp = D.xp;
  const hb = hbOf("caracteristica");
  const todas = [...CARACTERISTICAS, ...hb.map(h => [h.nome, +h.custo || 1, [], h.desc || "", true])];
  return `<div class="box stack"><div class="row between"><h3>Características</h3><span class="muted small">Experiência: ${xp.saldo} de saldo</span></div>
    ${
      (f.carac || []).length
        ? `<div class="cards">${f.carac
            .map((n, i) => {
              const c = todas.find(x => x[0] === n) || [n, 0, [], ""];
              return `<div class="condrow" style="border-left-color:var(--purple)"><span class="tag">${c[1]}</span><div style="min-width:0"><b>${esc(n)}</b>${n === "[Sentido] Aguçado" || n === "Companheiro Animal" ? ` <input type="text" data-cnota="${esc(n)}" value="${esc((f.caracNota || {})[n] || "")}" placeholder="${n === "Companheiro Animal" ? "Qual animal?" : "Qual sentido?"}" style="width:140px;padding:2px 6px;font-size:12px">` : ""}<div class="muted small">${esc(c[3])}</div></div><button type="button" class="x" data-carm="${i}" aria-label="Tirar ${esc(n)}">✕</button></div>`;
            })
            .join("")}</div>`
        : `<div class="muted small">Nenhuma característica. Comece com 7 pontos de Experiência.</div>`
    }
    <div class="row" style="flex-wrap:nowrap"><select id="caracSel">${[1, 2, 3, 4, 5]
      .map(
        cu =>
          `<optgroup label="${cu} ponto${cu > 1 ? "s" : ""}">${todas
            .filter(c => c[1] === cu && !(f.carac || []).includes(c[0]))
            .map(
              c =>
                `<option value="${esc(c[0])}">${reqOK(f, c[2]) ? "" : "✕ "}${esc(c[0])}${c[4] ? " (homebrew)" : ""} — ${esc(reqTxt(c[2]))}</option>`
            )
            .join("")}</optgroup>`
      )
      .join("")}</select><button type="button" class="btn sm" id="caracAdd">Adicionar</button></div>
    <div class="muted small" id="caracInfo"></div>
    <p class="muted small" style="margin:0">Na criação: 7 pontos de Experiência para Características (o que sobrar pode subir Conhecimentos e Práticas pelo dobro do nível novo). Depois, Características novas precisam da aprovação do mestre e de sentido na história.</p></div>`;
}

function qualC(it) {
  let c = QUAL_C[+it.q || 0];
  if ((it.carac || []).includes("Frágil")) c -= 1;
  if ((it.carac || []).includes("Durável")) c += 1;
  return Math.max(1, c);
}
function escArt(carac) {
  return (carac || []).reduce((s, n) => {
    const c = CARAC_ART.find(x => x[0] === n);
    return s + (c ? c[1] : 0);
  }, 0);
}
function tabEquip(f, D) {
  const opts = [
    ...EQUIP_LIVRO.map(([n, e]) => ({ n, g: `Escassez ${e} · ${ESCASSEZ[e]}`, esc: e, carac: [] })),
    ...EQUIP_PACOTE.map(n => ({ n, g: "Dos pacotes iniciais", esc: null, carac: [] })),
    ...ARTEFATOS.map(([n, e, c]) => ({ n, g: "Artefatos", esc: e, carac: c, art: true })),
    ...hbOf("item").map(h => ({
      n: h.nome,
      g: "Homebrew",
      esc: h.esc === "" ? null : +h.esc,
      carac: (h.carac || "")
        .split(",")
        .map(x => x.trim())
        .filter(Boolean),
      art: !!h.carac
    }))
  ];
  const grupos = [...new Set(opts.map(o => o.g))];
  const loc = l => (f.itens || []).map((it, i) => [it, i]).filter(([it]) => (it.local || "mochila") === l);
  const row = ([it, i]) => {
    const q = +it.q;
    const qN = q === undefined || isNaN(q) ? 3 : q;
    return `<div class="item ${qN === 0 ? "broken" : ""}"><div class="row between" style="flex-wrap:nowrap;gap:6px"><b style="min-width:0">${esc(it.nome)}${+it.qtd > 1 ? ` ×${+it.qtd}` : ""}</b><span class="row" style="gap:4px;flex-wrap:nowrap">${it.esc != null && it.esc !== "" ? `<span class="tag" title="Escassez">E${it.esc}</span>` : ""}<span class="tag ${qN >= 4 ? "on" : qN <= 1 ? "red" : ""}" title="Qualidade">${QUALIDADE[qN]}</span></span></div>
    ${
      (it.carac || []).length
        ? `<div class="small">${it.carac
            .map(c => {
              const x = CARAC_ART.find(y => y[0] === c);
              return `<span class="tag" title="${esc(x ? x[2] : "")}">${esc(c)}</span>`;
            })
            .join(" ")}</div>`
        : ""
    }
    ${it.nota ? `<div class="muted small">${esc(it.nota)}</div>` : ""}
    <div class="row small" style="gap:6px"><span>Qualidade</span><span class="pmr"><button type="button" data-iq="${i}" data-d="-1" aria-label="Piorar">−</button><button type="button" data-iq="${i}" data-d="1" aria-label="Melhorar">+</button></span>
     <span>C investidas <b class="mono">${+it.cq || 0}/${qualC(it)}</b></span><button type="button" class="btn sm" data-icq="${i}" title="O Assimilador investe uma Pressão no item">+C</button>
     ${it.usos != null ? `<span>Usos <b class="mono">${+it.usos}</b></span><button type="button" class="btn sm" data-iuso="${i}">usar</button>` : ""}
     <span class="grow"></span><button type="button" class="btn sm ghost" data-iloc="${i}">${(it.local || "mochila") === "corpo" ? "→ mochila" : "→ corpo"}</button><button type="button" class="x" data-ied="${i}" aria-label="Editar">✎</button><button type="button" class="x" data-irm="${i}" aria-label="Remover">✕</button></div></div>`;
  };
  return `<div class="box stack"><div class="row between"><h3>Inventário</h3><span class="muted small">vestuário, cantil e mochila não precisam ser anotados</span></div>
   <div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div style="${D.usoCorpo > D.espCorpo ? "border-color:var(--red)" : ""}"><b>${D.usoCorpo}/${D.espCorpo}</b><span>No corpo (saque rápido)</span></div><div style="${D.usoMochila > D.espMochila ? "border-color:var(--red)" : ""}"><b>${D.usoMochila}/${D.espMochila}</b><span>Na mochila</span></div></div>
   <div class="sub">No corpo</div>${loc("corpo").length ? `<div class="cards">${loc("corpo").map(row).join("")}</div>` : `<div class="muted small">Nada no corpo.</div>`}
   <div class="sub">Na mochila</div>${loc("mochila").length ? `<div class="cards">${loc("mochila").map(row).join("")}</div>` : `<div class="muted small">Mochila vazia.</div>`}
   <div class="row" style="flex-wrap:nowrap"><select id="itemSel">${grupos.map(g => `<optgroup label="${esc(g)}">${opts.map((o, i) => (o.g === g ? `<option value="${i}">${esc(o.n)}${o.carac.length ? " · " + esc(o.carac.join(", ")) : ""}</option>` : "")).join("")}</optgroup>`).join("")}</select><button type="button" class="btn sm" id="itemAdd">Adicionar</button></div>
   <div class="row"><button type="button" class="btn sm ghost" id="itemCriar">Criar item ou artefato</button><button type="button" class="btn sm ghost" id="itemPacote">Pacote inicial</button></div>
   <p class="muted small" style="margin:0">3 espaços no corpo (fáceis de sacar) e 6 na mochila (tirar de lá leva tempo). Pesado ocupa 2; Discreto não ocupa; cada Espaçoso dá +2. Qualidade começa em Padrão: o Assimilador pode investir C para baixar um nível. Consertar um nível: AA em Manufaturas; melhorar: AABB.</p></div>
  <details class="box"><summary style="cursor:pointer"><b>Características de Artefatos</b></summary><table class="t" style="margin-top:8px"><tbody>${CARAC_ART.map(([n, c, t]) => `<tr><td><b>${esc(n)}</b></td><td class="mono">${c}</td><td class="small">${esc(t)}</td></tr>`).join("")}</tbody></table><p class="muted small">A Escassez de um artefato criado é a soma das categorias das características.</p></details>`;
}
function tabHistoria(f) {
  return `<div class="box stack"><h3>História</h3>
   <div class="field"><label class="label" for="s_aparencia">Aparência</label><textarea id="s_aparencia" data-f="aparencia" style="min-height:90px" placeholder="Como é, o que veste, marcas da Assimilação…">${esc(f.aparencia || "")}</textarea></div>
   <div class="field"><label class="label" for="s_personalidade">Personalidade</label><textarea id="s_personalidade" data-f="personalidade" style="min-height:90px" placeholder="Jeito de ser, medos, manias…">${esc(f.personalidade || "")}</textarea></div>
   <div class="field"><label class="label" for="s_historico">Histórico</label><textarea id="s_historico" data-f="historico" style="min-height:110px" placeholder="Antes e depois do Colapso, família, Refúgio de origem…">${esc(f.historico || "")}</textarea></div>
   <div class="field"><span class="label">Fotos por estado</span><p class="muted small" style="margin:0 0 6px">Opcional: a foto da ficha e do token troca sozinha quando o Infectado se fere ou a Assimilação avança.</p>
    <div class="fotos-estado">${FOTOS_ESTADO.map(([k, n, q]) => `<div class="fe"><button type="button" class="photo" data-fotoest="${k}" aria-label="Foto: ${n}">${(f.fotos || {})[k] ? `<img src="${f.fotos[k]}" alt="">` : `<span>+</span>`}</button><b class="small">${n}</b><span class="muted small">${q}</span>${(f.fotos || {})[k] ? `<button type="button" class="btn sm ghost" data-fotoestx="${k}">Tirar</button>` : ""}</div>`).join("")}</div></div>
   <div class="field"><label class="label" for="s_notas">Anotações (pistas, vínculos, lembretes)</label><textarea id="s_notas" data-f="notas" style="min-height:110px" placeholder="Pessoas que conhece, rumores, mapas…">${esc(f.notas || "")}</textarea></div>
   <div class="row between"><span class="row"><button type="button" class="btn sm" id="btnTokFicha">Criar token deste Infectado</button><button type="button" class="btn sm" id="btnBaixar">Baixar ficha (backup)</button>${!S.solo && !f.npc && f.dono === S.uid ? `<button type="button" class="btn sm" id="btnGuardarConta">Salvar em Meus personagens</button>` : ""}</span><button type="button" class="btn sm danger" id="btnDelFicha">Apagar ficha</button></div></div>`;
}
