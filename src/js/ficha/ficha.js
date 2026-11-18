"use strict";
/* Ficha do Infectado: números calculados (Cabo de Guerra, Saúde, XP...), fotos por estado, salvar e lista de Infectados. */
function novaFicha() {
  const inst = {},
    apt = {};
  INSTINTOS.forEach(k => (inst[k] = 1));
  APTIDOES.forEach(k => (apt[k] = 0));
  return {
    v: 3,
    sis: "assimilacao",
    nome: "Novo Infectado",
    jogador: "",
    idade: "",
    geracao: 2,
    evento: "",
    ocupacao: "",
    origUso: { evento: false, ocupacao: false },
    propP: [
      { t: "", ok: false },
      { t: "", ok: false }
    ],
    propC: [
      { t: "", inerte: false },
      { t: "", inerte: false }
    ],
    inst,
    apt,
    D: 9,
    dGasto: 0,
    eGasto: 0,
    susc: false,
    dano: 0,
    trat: 0,
    carac: [],
    caracNota: {},
    muts: [],
    assimPend: null,
    xp: 0,
    xpAjuste: 0,
    itens: [],
    enf: [],
    cond: [],
    aparencia: "",
    personalidade: "",
    historico: "",
    notas: "",
    foto: "",
    dono: S.uid || "",
    criada: Date.now()
  };
}
// ficha antiga ou de outro sistema: completa o que faltar sem apagar nada
function migrar(f) {
  if (!f || f.rapido) return f;
  if (f.v === 3 && f.inst) return f;
  const b = novaFicha();
  for (const k of Object.keys(b)) if (f[k] === undefined || (f[k] === null && k !== "assimPend")) f[k] = b[k];
  INSTINTOS.forEach(k => {
    if (typeof f.inst[k] !== "number") f.inst[k] = 1;
  });
  APTIDOES.forEach(k => {
    if (typeof f.apt[k] !== "number") f.apt[k] = 0;
  });
  if (!Array.isArray(f.propP)) f.propP = b.propP;
  if (!Array.isArray(f.propC)) f.propC = b.propC;
  f.v = 3;
  f.sis = "assimilacao";
  return f;
}
function mutsDe(f) {
  return (f.muts || [])
    .map(m => {
      const x = mutacao(m.naipe, m.c, m.i);
      return x ? { ...x, anul: +m.anul || 0, ref: m } : null;
    })
    .filter(Boolean)
    .concat(mutsHomebrew(f)); // mutações criadas no Homebrew (ficha/catalogos)
}
function fxDe(f, op) {
  return mutsDe(f).filter(m => m.fx && m.fx.op === op);
}
function instTot(f, k) {
  return Math.max(
    0,
    (+f.inst[k] || 0) + fxDe(f, "inst").filter(m => m.fx.t === k).length + (+(f.instMod || {})[k] || 0)
  );
}
function aptTot(f, k) {
  return Math.max(
    0,
    (+f.apt[k] || 0) + fxDe(f, "apt").filter(m => m.fx.t === k).length + (+(f.aptMod || {})[k] || 0)
  );
}
function temCarac(f, n) {
  return (f.carac || []).includes(n);
}
function temMut(f, n) {
  return mutsDe(f).some(m => m.n === n);
}
function xpCalc(f) {
  // Instintos: 1 em cada + 3 pontos livres (até 3) na criação; depois, o triplo do novo nível.
  const incI = [];
  INSTINTOS.forEach(k => {
    for (let v = 2; v <= (+f.inst[k] || 1); v++) incI.push(v);
  });
  incI.sort((a, b) => b - a);
  let livresI = 3;
  let custoI = 0;
  const restI = [];
  incI.forEach(v => {
    if (livresI > 0 && v <= 3) {
      livresI--;
    } else restI.push(v);
  });
  restI.forEach(v => (custoI += 3 * v));
  // Conhecimentos e Práticas: 7 pontos livres (até 2) na criação; depois, o dobro do novo nível.
  const incA = [];
  APTIDOES.forEach(k => {
    for (let v = 1; v <= (+f.apt[k] || 0); v++) incA.push(v);
  });
  incA.sort((a, b) => b - a);
  let livresA = 7;
  let custoA = 0;
  incA.forEach(v => {
    if (livresA > 0 && v <= 2) {
      livresA--;
    } else custoA += 2 * v;
  });
  const custoC = (f.carac || []).reduce((s, n) => {
    const c = CARACTERISTICAS.find(x => x[0] === n);
    const h = !c && hbOf("caracteristica").find(x => x.nome === n);
    return s + (c ? c[1] : h ? +h.custo || 0 : 0);
  }, 0);
  const gasto = custoI + custoA + custoC;
  const ganho = 7 + (+f.xp || 0) + (+f.xpAjuste || 0);
  return { custoI, custoA, custoC, gasto, ganho, saldo: ganho - gasto, livresI, livresA };
}
function derivados(f) {
  if (f && f.rapido) return derAmeaca(f);
  migrar(f);
  const D = Math.max(0, Math.min(10, +f.D || 0)),
    E = 10 - D;
  const P = 1 + instTot(f, "Potência") + instTot(f, "Resolução") + fxDe(f, "saude").length;
  const pvMax = P * 6;
  const pv = Math.max(0, pvMax - (+f.dano || 0));
  const nivel = pv <= 0 ? 0 : Math.ceil(pv / P);
  const nivelRec = Math.max(0, Math.min(6, nivel + (+f.trat || 0)));
  const pressoes = mutsDe(f)
    .filter(m => m.naipe === "in")
    .reduce((s, m) => s + Math.max(0, custoSim(m.custo).c - m.anul), 0);
  const espCorpo = ESP_CORPO,
    espMochila =
      ESP_MOCHILA +
      2 * (f.itens || []).reduce((s, it) => s + (it.carac || []).filter(c => c === "Espaçoso").length, 0);
  const usoEsp = l =>
    (f.itens || [])
      .filter(it => (it.local || "mochila") === l)
      .reduce(
        (s, it) =>
          s +
          ((it.carac || []).includes("Discreto") ? 0 : (it.carac || []).includes("Pesado") ? 2 : 1) *
            Math.max(1, +it.qtd || 1),
        0
      );
  return {
    D,
    E,
    dMax: D,
    eMax: E,
    P,
    pvMax,
    pv,
    nivel,
    nivelRec,
    pressoes,
    espCorpo,
    espMochila,
    usoCorpo: usoEsp("corpo"),
    usoMochila: usoEsp("mochila"),
    xp: xpCalc(f),
    def: 0
  };
}
function cur(f, k) {
  const D = derivados(f);
  if (f.rapido) {
    if (k === "pv") return D.pv;
    return 0;
  }
  if (k === "pv") return D.pv;
  if (k === "d") return Math.max(0, D.D - (+f.dGasto || 0));
  if (k === "e") return Math.max(0, D.E - (+f.eGasto || 0));
  return 0;
}
function canEditFicha(f) {
  return !!f && (S.isM || f.dono === S.uid);
}
let saveTimer = null;
/* Junta o que veio do banco na ficha que já está na tela (mantém o mesmo objeto). */
function mesclarFicha(old, novo, manter = []) {
  for (const k of Object.keys(old)) if (!(k in novo) && !manter.includes(k)) delete old[k];
  return Object.assign(old, novo);
}
/* Chegou uma versão da ficha do banco. Se ela está salvando agora, não dá para trocar no meio:
   guarda a versão e aplica quando o salvamento terminar (assim nada que o mestre mudou se perde). */
function fichaDoBanco(id, novo, path, manter = []) {
  const old = S.fichas[id];
  if (old && S.dirty[id]) {
    S.fichaRemota[id] = { novo, path };
    return old;
  }
  delete S.fichaRemota[id];
  S.fichaBase[path] = JSON.parse(JSON.stringify(novo)); // o que o banco tem (para salvar só o que mudar)
  return old ? mesclarFicha(old, novo, manter) : novo;
}
/* Esquece a versão do banco das fichas que sumiram da coleção (apagadas ou movidas). */
function esquecerBases(prefixo, lista) {
  const tem = new Set(lista.map(x => prefixo + x.id));
  for (const k in S.fichaBase) if (k.startsWith(prefixo) && !tem.has(k)) delete S.fichaBase[k];
}
/* O que mudou na ficha desde a última versão do banco (campo de cima a campo de cima). */
function camposMudados(base, dados) {
  const mud = {};
  for (const k in dados) if (JSON.stringify(dados[k]) !== JSON.stringify(base[k])) mud[k] = dados[k];
  for (const k in base) if (!(k in dados)) mud[k] = DEL;
  return mud;
}
function saveFicha(id, now) {
  const stamp = Date.now() + Math.random();
  S.dirty[id] = stamp;
  const st = $("#saveState");
  if (st) st.textContent = "Salvando…";
  clearTimeout(saveTimer);
  const go = () => {
    const f = S.fichas[id];
    if (!f) return;
    const mine = S.dirty[id];
    const dados = JSON.parse(JSON.stringify(f));
    const path = fichaPath(id);
    const base = S.fichaBase[path];
    // Salva só os campos que mudaram: se o mestre e o jogador mexem ao mesmo tempo, um não apaga o outro.
    if (base) {
      const mud = camposMudados(base, dados);
      if (Object.keys(mud).length) queueMerge(path, mud);
    } else queueSet(path, dados); // ficha nova (ou num lugar novo): grava inteira
    S.fichaBase[path] = dados;
    setTimeout(() => {
      if (S.dirty[id] === mine) {
        S.dirty[id] = 0;
        const s = $("#saveState");
        if (s) s.textContent = "Salvo";
        const remota = S.fichaRemota[id]; // chegou mudança de outra pessoa enquanto salvava
        if (remota && S.fichas[id]) {
          delete S.fichaRemota[id];
          mesclarFicha(S.fichas[id], remota.novo, ["npc"]);
          S.fichaBase[remota.path] = JSON.parse(JSON.stringify(remota.novo));
          renderBoard();
          if (!isEditing()) renderPanel();
        }
      }
    }, 1500);
  };
  if (now) go();
  else saveTimer = setTimeout(go, 700);
}
const fA = () => {
  const f = S.fichas[S.openFicha];
  return f ? migrar(f) : f;
};
/* Fotos por estado (aba História): trocam a foto da ficha e do token sozinhas. */
const FOTOS_ESTADO = [
  ["machucado", "Ferido", "Saúde no Nível 3 (Ferimentos) ou pior"],
  ["morrendo", "Incapacitado", "Saúde zerada"],
  ["suscetivel", "Suscetível", "Em Estado Suscetível"],
  ["assimilado", "Assimilando", "Teste de Assimilação esperando as cartas"]
];
function fotoAtual(f) {
  if (!f) return "";
  const fs = f.fotos || {};
  if (f.npc || f.rapido || !Object.keys(fs).length) return f.foto || "";
  const D = derivados(f);
  const estado =
    (D.nivel <= 0 && fs.morrendo) ||
    (f.assimPend && fs.assimilado) ||
    (f.susc && fs.suscetivel) ||
    (D.nivel <= 3 && fs.machucado);
  return estado || f.foto || "";
}
/* Barra com metade ou menos fica mais escura (CSS .baixa). */
const metadeOuMenos = (v, max) => (max && v <= max / 2 ? " baixa" : "");
function avatar(f, size = 52) {
  return f && fotoAtual(f)
    ? `<img class="avatar" src="${fotoAtual(f)}" alt="" style="width:${size}px;height:${Math.round((size * 4) / 3)}px;object-fit:cover;object-position:50% 15%">`
    : `<div class="avatar ph" style="width:${size}px;height:${size}px">${esc(((f && f.nome) || "?").trim().charAt(0).toUpperCase())}</div>`;
}
function bars(f) {
  const D = derivados(f);
  if (f.rapido) return "";
  const b = (k, lab, v, max) => {
    const p = Math.max(0, Math.min(100, max ? (v / max) * 100 : 0));
    return `<div class="bar ${k}"><span class="label">${lab}</span><span class="t"><i style="width:${p}%"></i></span><span class="v">${v}/${max}</span></div>`;
  };
  return `<div class="bars">${b("pv", "Saúde", D.pv, D.pvMax)}${b("san", "Det.", cur(f, "d"), D.dMax)}${b("pe", "Assim.", cur(f, "e"), D.eMax)}</div>`;
}
function condAuto(f) {
  if (f.rapido) return [];
  const D = derivados(f);
  const out = [];
  if (D.nivel <= 0) out.push("Morto");
  else if (D.nivel < 6) out.push(SAUDE_NIVEIS[D.nivel]);
  if (f.susc) out.push("Suscetível");
  if (D.pressoes >= 10) out.push("Assimilado");
  if (f.assimPend) out.push("Assimilando");
  return out;
}
function tokInfo(f) {
  if (f.rapido) {
    const D = derivados(f);
    return `Neutralização ${D.prog}/${D.pvMax} A · ${esc(poolTxt(f.dados || {}))}`;
  }
  const D = derivados(f);
  return `Saúde ${D.pv}/${D.pvMax} (${SAUDE_NIVEIS[D.nivel] || "morto"}) · D ${cur(f, "d")}/${D.D} · E ${cur(f, "e")}/${D.E}`;
}

/* ---------- lista ---------- */
function agentesHTML() {
  const ids = Object.keys(S.fichas).sort((a, b) => (S.fichas[a].criada || 0) - (S.fichas[b].criada || 0));
  const npcs = ids.filter(id => S.fichas[id].npc);
  const mine = ids.filter(id => S.fichas[id].dono === S.uid && !S.fichas[id].npc),
    rest = ids.filter(id => S.fichas[id].dono !== S.uid && !S.fichas[id].npc);
  const card = id => {
    const f = migrar(S.fichas[id]);
    const D = derivados(f);
    const cs = [...condAuto(f), ...(f.cond || [])];
    return `<button class="fcard" data-open="${esc(id)}">${avatar(f)}<div style="min-width:0"><div class="label">${esc(f.ocupacao || "Infectado")} · D${D.D} E${D.E}</div><div class="nm">${esc(f.nome)}</div><div class="muted small">${esc(GERACOES[f.geracao] || "")}${f.jogador ? " · " + esc(f.jogador) : ""}</div></div>${bars(f)}${cs.length ? `<div class="conds" style="grid-column:1/-1">${cs.map(c => `<span class="tag red">${esc(c)}</span>`).join("")}</div>` : ""}</button>`;
  };
  return `<button class="btn primary block" id="novaFicha">Criar ficha de Infectado</button>${soloTrazerBotaoHTML()}${repetidosBotaoHTML()}
   ${mine.length ? `<div class="sub">${S.isM ? "Fichas que você criou" : "Seus Infectados"}</div><div class="cards">${mine.map(card).join("")}</div>` : ""}
   ${rest.length ? `<div class="sub">${S.isM ? "Infectados dos jogadores" : "Outros Infectados da mesa"}</div><div class="cards">${rest.map(card).join("")}</div>` : ""}
   ${npcSecaoHTML(npcs)}
   <button class="btn sm ghost" id="impFicha">Importar ficha de um backup</button>
   ${!ids.length ? `<div class="empty">${S.loaded.fichas ? "Nenhum Infectado ainda. Toque em <b>Criar ficha</b>: origens, propósitos, aptidões, Cabo de Guerra, Saúde, Características e Assimilações seguem o livro." : "Carregando fichas…"}</div>` : ""}`;
}
function bindAgentes() {
  $$("[data-open]").forEach(
    b =>
      (b.onclick = () => {
        S.openFicha = b.dataset.open;
        S.sheetTab = "principal";
        renderPanel();
        $("#pbody").scrollTop = 0;
      })
  );
  {
    const nn = $("#novoNpc");
    if (nn) nn.onclick = novoNpc;
  }
  bindNpcSecao();
  $("#impFicha").onclick = importarFicha;
  const trazer = $("#btnTrazerSolo");
  if (trazer) trazer.onclick = soloTrazer;
  const rep = $("#btnRepMesa");
  if (rep) rep.onclick = tirarRepetidosMesa;
  $("#novaFicha").onclick = () => {
    if (toqueDuplo("novaFicha")) return;
    const id = "f" + rid(8);
    S.fichas[id] = novaFicha();
    S.openFicha = id;
    S.sheetTab = "principal";
    renderPanel();
    saveFicha(id, true);
  };
}
