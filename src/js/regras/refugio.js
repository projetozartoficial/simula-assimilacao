"use strict";
/* Painel Refúgio: níveis do Refúgio e da Região, reservas, construções, Crises e Tragédias (fica em mesas/<código>.refugio). */
/* ===================== REFÚGIO ===================== */
const REF_NIV = {
  mob: ["Nenhuma", "~10 pessoas", "~20", "~30", "~40", "~50", "~60"],
  def: [
    "Nenhuma",
    "Linhas e sinos",
    "Cerca de arame farpado",
    "Muro de madeira",
    "Muro de pedra ou tijolo",
    "Complexo prisional",
    "Base militar"
  ],
  moral: ["Amotinada", "Desiludida", "Hesitante", "Resoluta", "Animada", "Empenhada", "Exaltada"],
  bel: ["Pacifista", "Mínima", "Razoável", "Eficiente", "Ameaçadora", "Terrível", "Arrasadora"]
};
const REG_NIV = {
  tam: ["Quarteirão", "Largo", "Bairro", "Cidade Pequena", "Zona Urbana", "Cidade Média", "Cidade Grande"],
  perigo: [
    "Pode andar despreocupado",
    "Basta alguma atenção",
    "É preciso andar precavido",
    "Todo cuidado é necessário",
    "Perigo sempre próximo",
    "Quase impossível viver",
    "Poucos voltaram dali"
  ],
  hab: [
    "Inabitada",
    "Esvaziada (1)",
    "Isolada (2–3)",
    "Esparsa (4–5)",
    "Dispersa (6–9)",
    "Concentrada (10–15)",
    "Inchada (16+)"
  ],
  cont: ["Inexistente", "Introdutória", "Disseminada", "Propagada", "Epidêmica", "Pandêmica", "Endêmica"],
  desl: [
    "Labiríntico (−AAA)",
    "Traiçoeiro (−AA)",
    "Complexo (−A)",
    "Moderado",
    "Descomplicado (+A)",
    "Acessível (+AA)",
    "Facilitado (+AAA)"
  ]
};
const BIOMAS = [
  "Bosque",
  "Campina",
  "Cerrado",
  "Colinas",
  "Deserto",
  "Floresta",
  "Ilha",
  "Litoral",
  "Manguezal",
  "Mar",
  "Montanha",
  "Pântano",
  "Caatinga",
  "Subterrâneo",
  "Tundra",
  "Urbano"
];
const RECURSOS = [
  "Água",
  "Plantas",
  "Animais",
  "Madeira",
  "Minerais",
  "Biomassa",
  "Alimento",
  "Vestuário",
  "Munição",
  "Combustível",
  "Medicamento",
  "Material de Construção"
];
const CRISE_TAB = [
  ["0–1", "Por sorte, os habitantes passam pela Crise sem maiores percalços."],
  ["2", "Briga interna: metade da População migra levando metade das Reservas."],
  ["3", "Enfermidade sem remédio no Refúgio: −A em todos os testes de quem mora ali até acharem a cura."],
  ["4", "Criatura assimilada grande surge no Refúgio e ameaça Reservas e Construções."],
  ["5", "Rebelião: a População se divide em duas facções que disputam o Refúgio."],
  ["6+", "Invasores atacam; se vencerem, podem destruir o Refúgio e levar os Recursos."]
];
const TRAGEDIA_TAB = [
  [
    "0–1",
    "Explosão (se houver Combustível): mata População 1 por Combustível 1 estocado e destrói construções próximas."
  ],
  ["2", "Assassinato misterioso de alguém querido: −1 Moral (revertido se o culpado for descoberto)."],
  ["3", "Desabamento de uma das construções mais usadas."],
  ["4", "Tempestade terrível: estragos em todas as construções de Madeira."],
  ["5", "Desastre: o Refúgio perde todos os Recursos de um tipo."],
  ["6+", "Os Recursos Naturais da Região caem um nível."]
];
function refBase() {
  return {
    nome: "",
    pop: [2, 4],
    res: [10, 20],
    mob: 0,
    def: 1,
    moral: 3,
    bel: 1,
    reservas: [],
    constr: [],
    reg: { nome: "", bioma: "Floresta", tam: 2, perigo: 2, hab: 1, rn: [], cont: 1, desl: 3 },
    notas: ""
  };
}
function refugioHTML() {
  const R = { ...refBase(), ...((S.mesa && S.mesa.refugio) || {}) };
  R.reg = { ...refBase().reg, ...(R.reg || {}) };
  const ed = S.isM;
  const dis = ed ? "" : "disabled";
  const nivSel = (k, lista, v, lab) =>
    `<div class="field"><label class="label">${lab}</label><select data-rf="${k}" ${dis}>${lista.map((n, i) => `<option value="${i}" ${+v === i ? "selected" : ""}>${i} · ${esc(n)}</option>`).join("")}</select></div>`;
  const par = (k, lab) =>
    `<div class="field"><label class="label">${lab} (atual / teto)</label><div class="row" style="flex-wrap:nowrap"><input type="number" min="0" max="999" value="${R[k][0]}" data-rfp="${k}:0" ${dis}><input type="number" min="0" max="999" value="${R[k][1]}" data-rfp="${k}:1" ${dis}></div></div>`;
  const totRes = (R.reservas || []).reduce((s, x) => s + (+x.q || 0), 0);
  return `${ed ? "" : `<p class="muted small" style="margin:0">Só o mestre muda o Refúgio. Todos veem.</p>`}
   <div class="box stack"><div class="field"><label class="label" for="rfN">Nome do Refúgio</label><input type="text" id="rfN" data-rft="nome" value="${esc(R.nome)}" maxlength="60" placeholder="Ex.: Horta Verde" ${dis}></div>
    <div class="fields">${par("pop", "População")}${par("res", "Reservas")}</div>
    <div class="fields">${nivSel("mob", REF_NIV.mob, R.mob, "Mobilidade")}${nivSel("def", REF_NIV.def, R.def, "Defesa")}${nivSel("moral", REF_NIV.moral, R.moral, "Moral")}${nivSel("bel", REF_NIV.bel, R.bel, "Beligerância")}</div>
    ${R.pop[0] > R.pop[1] ? `<div class="banner">População acima do teto: Crise!</div>` : ""}${R.reg.perigo > R.def ? `<div class="banner">Perigo da Região (${R.reg.perigo}) maior que a Defesa (${R.def}): o mestre pode ativar uma Crise a qualquer momento.</div>` : ""}${+R.moral === 0 ? `<div class="banner">Moral Amotinada: Tragédia!</div>` : ""}
    <div class="muted small">Cada nível de População ≈ 10 pessoas (a cada 6, um não trabalha). Por semana consome Água, Alimento e Madeira iguais à População (${R.pop[0]}); por ano, Medicamentos; a cada dois anos, Vestuário.</div></div>
   <div class="box stack"><div class="row between"><h3>Reservas</h3><span class="muted small">${totRes}/${R.res[1]} estocados</span></div>
    ${(R.reservas || []).map((x, i) => `<div class="row" style="flex-wrap:nowrap"><input type="text" value="${esc(x.n)}" data-rrn="${i}" maxlength="40" ${dis}><input type="number" value="${+x.q || 0}" data-rrq="${i}" min="0" max="999" style="width:80px" ${dis}>${ed ? `<button class="x" data-rrdel="${i}" aria-label="Tirar">✕</button>` : ""}</div>`).join("") || `<div class="muted small">Nada estocado.</div>`}
    ${ed ? `<div class="row" style="flex-wrap:nowrap"><select id="rrSel">${RECURSOS.map(r => `<option>${r}</option>`).join("")}</select><button class="btn sm" id="rrAdd">Adicionar</button></div>` : ""}</div>
   <div class="box stack"><div class="row between"><h3>Construções</h3>${ed ? `<button class="btn sm" id="rcAdd">+</button>` : ""}</div>
    ${(R.constr || []).map((x, i) => `<div class="row" style="flex-wrap:nowrap"><input type="text" value="${esc(x.n)}" data-rcn="${i}" maxlength="60" ${dis} placeholder="Ex.: Celeiro (Plantas +15)"><input type="number" value="${+x.o || 0}" data-rco="${i}" min="0" max="999" style="width:80px" title="Pontos de obra" ${dis}>${ed ? `<button class="x" data-rcdel="${i}" aria-label="Tirar">✕</button>` : ""}</div>`).join("") || `<div class="muted small">Nenhuma construção.</div>`}
    <div class="muted small">Cada População 1 + Material de Construção 1 por semana gera 1 ponto de obra (com um Construtor; senão, teste semanal de Engenharia). Madeira: 10 pontos (manutenção 1 por ano); Minerais: 20 (1 a cada 10 anos).</div></div>
   <div class="box stack"><h3>Região</h3>
    <div class="fields"><div class="field"><label class="label">Nome</label><input type="text" data-rgt="nome" value="${esc(R.reg.nome)}" maxlength="60" ${dis}></div><div class="field"><label class="label">Bioma</label><select data-rgs="bioma" ${dis}>${BIOMAS.map(b => `<option ${b === R.reg.bioma ? "selected" : ""}>${b}</option>`).join("")}</select></div></div>
    <div class="fields">${[
      ["tam", "Tamanho"],
      ["perigo", "Perigo"],
      ["hab", "Habitação"],
      ["cont", "Contaminação"],
      ["desl", "Deslocamento"]
    ]
      .map(
        ([k, l]) =>
          `<div class="field"><label class="label">${l}</label><select data-rg="${k}" ${dis}>${REG_NIV[k].map((n, i) => `<option value="${i}" ${+R.reg[k] === i ? "selected" : ""}>${i} · ${esc(n)}</option>`).join("")}</select></div>`
      )
      .join("")}</div>
    <div class="field"><span class="label">Recursos naturais fartos</span><div class="chips">${["Água", "Plantas", "Animais", "Madeira", "Minerais", "Biomassa"].map(r => `<label class="chip ${(R.reg.rn || []).includes(r) ? "on" : ""}"><input type="checkbox" data-rgrn="${r}" ${(R.reg.rn || []).includes(r) ? "checked" : ""} ${dis}> ${r}</label>`).join("")}</div></div></div>
   ${
     ed
       ? `<div class="box stack"><h3>Crises e Tragédias</h3><p class="muted small" style="margin:0">Role 4 d10; os jogadores escolhem um dado para eliminar; conte os símbolos dos outros três. Crise tira um nível de Moral antes.</p>
    <div class="row"><button class="btn sm" id="rfCrise">Rolar Crise</button><button class="btn sm" id="rfTrag">Rolar Tragédia</button></div>${refRollHTML()}</div>`
       : ""
   }
   <div class="box stack"><h3>Anotações</h3><textarea data-rft="notas" ${dis} style="min-height:90px">${esc(R.notas || "")}</textarea></div>`;
}
let refT = null;
function refRollRes(R) {
  const resto = R.dados.filter((x, i) => i !== R.fora);
  const n = resto.reduce((s, x) => s + x.s.a + x.s.b + x.s.c, 0);
  const tab = R.tab === "crise" ? CRISE_TAB : TRAGEDIA_TAB;
  return { n, linha: n <= 1 ? tab[0] : n >= 6 ? tab[5] : tab[n - 1] };
}
function refRollHTML() {
  const R = S.refRoll;
  if (!R) return `<div id="rfRes"></div>`;
  const x = refRollRes(R);
  return `<div id="rfRes" class="stack" style="gap:6px"><div class="label">${esc(R.nome)}</div><div class="dice">${R.dados.map((d0, i) => dieHTML(d0.t, d0.f, i, i !== R.fora)).join("")}</div><p class="small" style="margin:0">${R.fora < 0 ? "Toque no dado que os jogadores eliminam." : `<b>${x.n} símbolo(s):</b> ${esc(x.linha[1])}`}</p>${R.fora >= 0 ? `<button class="btn sm primary" id="rfLog">Mostrar para a mesa</button>` : ""}</div>`;
}
function bindRefugio() {
  if (!S.isM) return;
  const get = () => {
    const R = { ...refBase(), ...JSON.parse(JSON.stringify((S.mesa && S.mesa.refugio) || {})) };
    R.reg = { ...refBase().reg, ...(R.reg || {}) };
    return R;
  };
  const put = (R, now) => {
    S.mesa.refugio = R;
    clearTimeout(refT);
    const go = () => S.db.merge(P(), { refugio: JSON.parse(JSON.stringify(R)) }).catch(fail);
    if (now) go();
    else refT = setTimeout(go, 600);
  };
  $$("[data-rft]").forEach(
    i =>
      (i.oninput = () => {
        const R = get();
        R[i.dataset.rft] = i.value;
        put(R);
      })
  );
  $$("[data-rf]").forEach(
    i =>
      (i.onchange = () => {
        const R = get();
        R[i.dataset.rf] = +i.value;
        put(R, true);
        renderPanel();
      })
  );
  $$("[data-rfp]").forEach(
    i =>
      (i.onchange = () => {
        const R = get();
        const [k, j] = i.dataset.rfp.split(":");
        R[k] = [...R[k]];
        R[k][+j] = Math.max(0, +i.value || 0);
        put(R, true);
        renderPanel();
      })
  );
  $$("[data-rrn]").forEach(
    i =>
      (i.oninput = () => {
        const R = get();
        R.reservas[+i.dataset.rrn].n = i.value;
        put(R);
      })
  );
  $$("[data-rrq]").forEach(
    i =>
      (i.onchange = () => {
        const R = get();
        R.reservas[+i.dataset.rrq].q = Math.max(0, +i.value || 0);
        put(R, true);
        renderPanel();
      })
  );
  $$("[data-rrdel]").forEach(
    b =>
      (b.onclick = () => {
        const R = get();
        R.reservas.splice(+b.dataset.rrdel, 1);
        put(R, true);
        renderPanel();
      })
  );
  {
    const a = $("#rrAdd");
    if (a)
      a.onclick = () => {
        const R = get();
        R.reservas = [...(R.reservas || []), { n: $("#rrSel").value, q: 1 }];
        put(R, true);
        renderPanel();
      };
  }
  $$("[data-rcn]").forEach(
    i =>
      (i.oninput = () => {
        const R = get();
        R.constr[+i.dataset.rcn].n = i.value;
        put(R);
      })
  );
  $$("[data-rco]").forEach(
    i =>
      (i.onchange = () => {
        const R = get();
        R.constr[+i.dataset.rco].o = +i.value || 0;
        put(R, true);
      })
  );
  $$("[data-rcdel]").forEach(
    b =>
      (b.onclick = () => {
        const R = get();
        R.constr.splice(+b.dataset.rcdel, 1);
        put(R, true);
        renderPanel();
      })
  );
  {
    const a = $("#rcAdd");
    if (a)
      a.onclick = () => {
        const R = get();
        R.constr = [...(R.constr || []), { n: "", o: 0 }];
        put(R, true);
        renderPanel();
      };
  }
  $$("[data-rgt]").forEach(
    i =>
      (i.oninput = () => {
        const R = get();
        R.reg[i.dataset.rgt] = i.value;
        put(R);
      })
  );
  $$("[data-rgs]").forEach(
    i =>
      (i.onchange = () => {
        const R = get();
        R.reg[i.dataset.rgs] = i.value;
        put(R, true);
      })
  );
  $$("[data-rg]").forEach(
    i =>
      (i.onchange = () => {
        const R = get();
        R.reg[i.dataset.rg] = +i.value;
        put(R, true);
        renderPanel();
      })
  );
  $$("[data-rgrn]").forEach(
    c =>
      (c.onchange = () => {
        const R = get();
        const s = new Set(R.reg.rn || []);
        c.checked ? s.add(c.dataset.rgrn) : s.delete(c.dataset.rgrn);
        R.reg.rn = [...s];
        put(R, true);
        renderPanel();
      })
  );
  $$("#rfRes [data-di]").forEach(
    b =>
      (b.onclick = () => {
        if (!S.refRoll) return;
        S.refRoll.fora = +b.dataset.di;
        renderPanel();
      })
  );
  {
    const lg = $("#rfLog");
    if (lg)
      lg.onclick = () => {
        const R = S.refRoll;
        if (!R) return;
        const x = refRollRes(R);
        logEntry({
          quem: "Mestre",
          titulo: `${R.nome} no Refúgio`,
          total: x.n,
          det: `${codDados(R.dados, new Set(R.dados.map((y, i) => i).filter(i => i !== R.fora)))} ${x.linha[1]}`
        });
        S.refRoll = null;
        renderPanel();
      };
  }
  const roll = (tab, nome) => {
    S.refRoll = { tab, nome, dados: rollPool({ d10: 4 }), fora: -1 };
    renderPanel();
  };
  {
    const c = $("#rfCrise");
    if (c)
      c.onclick = () => {
        const R = get();
        R.moral = Math.max(0, (+R.moral || 0) - 1);
        put(R, true);
        toast("Crise: −1 Moral.");
        roll("crise", "Crise");
      };
  }
  {
    const c = $("#rfTrag");
    if (c) c.onclick = () => roll("trag", "Tragédia");
  }
}
