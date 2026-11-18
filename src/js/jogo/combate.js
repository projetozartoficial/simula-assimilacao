"use strict";
/* Painel Conflito: objetivos, condicionantes, dados e ativações do Conflito, Ameaças e investir Sucessos. */
/* ===================== CONFLITO ===================== */
function nInfPadrao() {
  return Math.max(1, Object.values(S.fichas).filter(f => !f.npc && !f.rapido).length);
}
function objTotal(o, n) {
  return Math.max(0, (+o.base || 0) + (+o.mais || 0) * Math.max(0, (n || 1) - 1));
}
function combBase() {
  return JSON.parse(JSON.stringify(S.combate || { lista: [] }));
}
function saveCombate(c) {
  c.lista = c.lista || []; // lista fica vazia: em Assimilação não há ordem de iniciativa
  S.combate = c;
  queueSet(P() + "/estado/combate", JSON.parse(JSON.stringify(c)));
  renderPanel();
  renderBoard();
}
function conflitoDe(m, nInf, niv = 0) {
  const c = {
    ativo: true,
    nome: m.n,
    desc: m.desc || "",
    rodada: 1,
    vez: "inf",
    nInf,
    dif: 0,
    dados: { d6: 0, d10: 0, d12: 0, ...m.dados },
    ativ: (m.ativ || []).map(([cu, n, ef]) => ({ n, c: cu, ef, inv: { a: 0, b: 0, c: 0 } })),
    obj: (m.obj || []).map(([t, n, base, mais, ef]) => ({ t, n, base, mais, ef, prog: 0, feito: false })),
    cond: (m.cond || []).map(([n, t]) => ({ n, t })),
    pool: null,
    ameacas: [],
    investidos: {},
    mostrarAtiv: false,
    lista: []
  };
  return c;
}
function allocHTML(pool, ativ, pre, ed) {
  return `${pool ? `<div class="row" style="gap:6px"><span class="label">Pontos para investir</span>${symChips(pool, "nenhum")}</div>` : ""}
   <div class="cards">${
     (ativ || [])
       .map((a, i) => {
         const cs = custoSim(a.c);
         const inv = a.inv || { a: 0, b: 0, c: 0 };
         const done = inv.a >= cs.a && inv.b >= cs.b && inv.c >= cs.c;
         return `<div class="ativ ${done ? "pronta" : ""}"><div class="row between" style="flex-wrap:nowrap;gap:6px"><b>${esc(a.n)}</b><span class="row" style="gap:4px;flex-wrap:nowrap">${custoHTML(a.c)}</span></div>
     ${a.ef ? `<div class="muted small">${esc(a.ef)}</div>` : ""}
     ${
       ed
         ? `<div class="row small" style="gap:6px">investido ${symChips(inv, "nada")}<span class="grow"></span>${[
             "a",
             "b",
             "c"
           ]
             .filter(k => cs[k])
             .map(
               k =>
                 `<button type="button" class="btn sm" data-${pre}inv="${i}:${k}" ${pool && pool[k] > 0 && inv[k] < cs[k] ? "" : "disabled"} title="Investir ${SYN[k]}">+${sy(k)}</button>`
             )
             .join(
               ""
             )}${done ? `<button type="button" class="btn sm primary" data-${pre}go="${i}">Ativar</button>` : ""}${inv.a || inv.b || inv.c ? `<button type="button" class="btn sm ghost" data-${pre}zr="${i}" title="Devolver ao total">↺</button>` : ""}<button type="button" class="x" data-${pre}del="${i}" aria-label="Apagar ativação">✕</button></div>`
         : ""
     }</div>`;
       })
       .join("") || `<div class="muted small">Nenhuma ativação.</div>`
   }</div>`;
}
function bindAlloc(pre, get, salvar, quem) {
  $$(`[data-${pre}inv]`).forEach(
    b =>
      (b.onclick = () => {
        const o = get();
        const [i, k] = b.dataset[pre + "inv"].split(":");
        const a = o.ativ[+i];
        if (!o.pool || !(o.pool[k] > 0)) return;
        a.inv = a.inv || { a: 0, b: 0, c: 0 };
        a.inv[k]++;
        o.pool[k]--;
        salvar(o);
      })
  );
  $$(`[data-${pre}go]`).forEach(
    b =>
      (b.onclick = () => {
        const o = get();
        const a = o.ativ[+b.dataset[pre + "go"]];
        const cs = custoSim(a.c);
        a.inv = { a: a.inv.a - cs.a, b: a.inv.b - cs.b, c: a.inv.c - cs.c };
        salvar(o);
        const m = String(a.ef || "").match(/(\d+)\s*d\s*(10|12|6)\b/i);
        logEntry({ quem: quem(o), titulo: `Ativação: ${a.n}`, total: null, det: `${a.c} · ${a.ef || ""}` });
        if (m && /dano/i.test(a.ef)) rolarDanoLog(quem(o), +m[1], +m[2]);
      })
  );
  $$(`[data-${pre}zr]`).forEach(
    b =>
      (b.onclick = () => {
        const o = get();
        const a = o.ativ[+b.dataset[pre + "zr"]];
        o.pool = o.pool || { a: 0, b: 0, c: 0 };
        ["a", "b", "c"].forEach(k => {
          o.pool[k] += a.inv[k] || 0;
        });
        a.inv = { a: 0, b: 0, c: 0 };
        salvar(o);
      })
  );
  $$(`[data-${pre}del]`).forEach(
    b =>
      (b.onclick = async () => {
        const o = get();
        const a = o.ativ[+b.dataset[pre + "del"]];
        if (!(await confirmBox(`Apagar a ativação ${a.n}?`, "Some da partitura.", "Apagar"))) return;
        o.ativ.splice(+b.dataset[pre + "del"], 1);
        salvar(o);
      })
  );
}
async function novaAtivacao() {
  return formBox(
    "Nova ativação",
    `<div class="field"><label class="label" for="naN">Nome</label><input type="text" id="naN" name="n" maxlength="50" required></div>
  <div class="field"><label class="label" for="naC">Custo (letras A, B e C)</label><input type="text" id="naC" name="c" maxlength="14" placeholder="Ex.: CCC ou BBA" required style="text-transform:uppercase"></div>
  <div class="field"><label class="label" for="naE">Efeito</label><input type="text" id="naE" name="ef" maxlength="160" placeholder="Ex.: 3 d10 de dano a um alvo"></div>
  <p class="muted small" style="margin:0">Referência: +C = +1 de dano ou −1 d · +CC = área · B = alvo extra ou remove penalidade · CC = P · CCCC = anula a ação do alvo · 9C = consequência grave. Todo Conflito e toda Ameaça têm ao menos uma ativação só de A e uma só de C.</p>`,
    "Criar"
  );
}

function combateHTML() {
  const c = S.combate;
  if (!c || !c.ativo) {
    if (!S.isM)
      return `<div class="empty">Nenhum Conflito agora. Em narrativa fluida não há turnos: os testes fazem parte da cena.</div>`;
    return `<p class="muted small" style="margin:0">Anuncie um Conflito quando houver disputa relevante, ameaça concreta ou corrida contra o tempo. Quem desencadeia age primeiro.</p>
     <form class="box stack" id="fConf"><h3>Novo Conflito</h3>
      <div class="field"><label class="label" for="cfM">Começar de</label><select id="cfM" name="m"><option value="">Conflito novo (montado por mim)</option>${CONFLITOS_LIVRO.map((x, i) => `<option value="${i}">Exemplo do livro: ${esc(x.n)}</option>`).join("")}</select></div>
      <div class="field"><label class="label" for="cfN">Nome</label><input type="text" id="cfN" name="n" maxlength="60" placeholder="Ex.: Travessia do rio"></div>
      <div class="row" style="flex-wrap:nowrap;gap:8px"><div class="field"><label class="label" for="cfP">Progressão</label><select id="cfP" name="p">${PROGRESSAO.map((p, i) => `<option value="${i}">${p[0]} (${p[1]})</option>`).join("")}</select></div>
       <div class="field" style="max-width:110px"><label class="label" for="cfI">Infectados</label><input type="number" id="cfI" name="i" min="1" max="12" value="${nInfPadrao()}"></div></div>
      <label class="check"><input type="checkbox" name="clx"> Cena de clímax (Objetivo Principal mais caro)</label>
      <label class="check"><input type="checkbox" name="ame" checked> Criar as Ameaças do exemplo como NPCs</label>
      <div class="muted small" id="cfSug"></div>
      <button class="btn primary">Anunciar Conflito</button></form>`;
  }
  const n = c.nInf || 1;
  const vis = S.isM;
  const objs = t =>
    (c.obj || [])
      .map((o, i) => [o, i])
      .filter(([o]) => o.t === t)
      .map(([o, i]) => {
        const tot = objTotal(o, n);
        const p = Math.max(0, Math.min(100, tot ? (o.prog / tot) * 100 : 0));
        return `<div class="obj ${o.prog >= tot ? "ok" : ""}"><div class="row between" style="flex-wrap:nowrap;gap:6px"><b>${esc(o.n)}</b><span class="mono small">${o.prog}/${tot} ${sy("a")}</span></div>
     <div class="pbar"><i style="width:${p}%"></i></div>${o.ef ? `<div class="muted small">${esc(o.ef)}</div>` : ""}
     ${vis ? `<div class="row small" style="gap:4px"><span class="muted">${o.base}${o.mais ? ` + ${o.mais} por Infectado além do primeiro` : ""}</span><span class="grow"></span><button type="button" class="btn sm" data-op="${i}" data-d="-1">−A</button><button type="button" class="btn sm primary" data-op="${i}" data-d="1">+A</button><button type="button" class="x" data-odel="${i}" aria-label="Apagar objetivo">✕</button></div>` : ""}</div>`;
      })
      .join("") || `<div class="muted small">—</div>`;
  const ames = (c.ameacas || [])
    .map(id => [id, S.fichas[id]])
    .filter(([id, f]) => f && entradaVisivel({ fichaId: id })); // escondida para o jogador (jogo/combate-no-mapa)
  const recentes = vis
    ? S.log
        .filter(e => {
          const p = parseDet(e.det);
          return (
            p.sim &&
            p.sim.a > 0 &&
            !(c.investidos || {})[e.id] &&
            Date.now() - (e.ts || 0) < 3 * 3600e3 &&
            !/Conflito ·|Ameaça ·/.test(e.titulo)
          );
        })
        .slice(0, 6)
    : [];
  return `<div class="box stack conf"><div class="row between"><div><span class="label">Conflito · rodada ${c.rodada || 1}</span><h3 style="margin:0">${esc(c.nome || "Conflito")}</h3></div>
     ${vis ? `<div class="row" style="gap:4px"><button class="btn sm" id="cfVez">${c.vez === "ass" ? "Turno do Assimilador" : "Turno dos Infectados"}</button><button class="btn sm primary" id="cfProx">Próxima rodada</button></div>` : `<span class="tag on">${c.vez === "ass" ? "Turno do Assimilador" : "Turno dos Infectados"}</span>`}</div>
    ${c.desc ? `<div class="muted small">${esc(c.desc)}</div>` : ""}
    ${vis ? `<div class="row small" style="gap:6px">Infectados na cena <span class="pmr"><button type="button" data-ninf="-1">−</button><button type="button" data-ninf="1">+</button></span><b class="mono">${n}</b></div>` : ""}
   </div>
   ${(c.cond || []).length || vis ? `<div class="box stack"><div class="row between"><h3>Condicionantes</h3>${vis ? `<button class="btn sm" id="cfCondAdd">+</button>` : ""}</div>${(c.cond || []).map((x, i) => `<div class="condrow"><span>${sy("c")}</span><div><b>${esc(x.n)}</b><div class="muted small">${esc(x.t)}</div></div>${vis ? `<button class="x" data-cdel="${i}" aria-label="Tirar">✕</button>` : "<span></span>"}</div>`).join("") || `<div class="muted small">Nenhuma regra especial nesta cena.</div>`}</div>` : ""}
   <div class="box stack"><div class="row between"><h3>Objetivos Principais</h3>${vis ? `<button class="btn sm" id="cfObjAdd">+ Objetivo</button>` : ""}</div><div class="cards">${objs("p")}</div>
    <div class="sub">Objetivos Secundários</div><div class="cards">${objs("s")}</div>
    ${
      recentes.length
        ? `<div class="sub">Sucessos dos Infectados para investir</div>${recentes
            .map(e => {
              const p = parseDet(e.det);
              return `<div class="row small inv" style="flex-wrap:nowrap;gap:6px"><span style="min-width:0"><b>${esc(e.quem)}</b> · ${esc(e.titulo)}</span>${symChips(p.sim)}<select data-invsel="${esc(e.id)}" style="max-width:150px">${(c.obj || []).map((o, i) => `<option value="${i}">${esc(o.n)}</option>`).join("")}</select><button class="btn sm primary" data-invgo="${esc(e.id)}">Investir ${p.sim.a}</button><button class="x" data-invno="${esc(e.id)}" aria-label="Ignorar">✕</button></div>`;
            })
            .join("")}`
        : ""
    }
   </div>
   ${
     vis || c.mostrarAtiv
       ? `<div class="box stack"><div class="row between"><h3>Dados e ativações do Conflito</h3>${vis ? `<label class="check small"><input type="checkbox" id="cfShow" ${c.mostrarAtiv ? "checked" : ""}> jogadores veem</label>` : ""}</div>
    ${
      vis
        ? `<div class="row poolin">${[6, 10, 12].map(t => `<label class="pool d${t}"><span>d${t}</span><input type="number" min="0" max="20" value="${+c.dados["d" + t] || 0}" data-cfd="${t}" aria-label="Quantos d${t}"></label>`).join("")}
      <select id="cfDif" style="width:auto">${DIFICULDADES.map(([nm, x], i) => `<option value="${i}" ${+c.dif === i ? "selected" : ""}>${nm}${x ? ` (+${x} d12)` : ""}</option>`).join("")}</select><button class="btn primary" id="cfRolar">Rolar</button></div>
     <div class="muted small">Valor dos dados: ${poolValor(c.dados)} (d6 = 1, d10 = 2, d12 = 3). O Assimilador mantém todos e precisa investir todos os pontos, mesmo sem completar ativações.</div>`
        : ""
    }
    ${allocHTML(vis ? c.pool : null, c.ativ, "ca", vis)}
    ${vis ? `<button class="btn sm" id="cfAtivAdd">+ Ativação</button>` : ""}</div>`
       : ""
   }
   <div class="box stack"><div class="row between"><h3>Ameaças</h3>${vis ? `<button class="btn sm" id="cfAmeAdd">+ Ameaça</button>` : ""}</div>
    ${ames.map(([id, f]) => ameacaConfHTML(id, f, vis)).join("") || `<div class="muted small">Nenhuma Ameaça com vontade própria nesta cena.</div>`}</div>
   ${vis ? `<div class="row between"><button class="btn sm ghost" id="cfTok" ${S.viewSid ? "" : "disabled"}>Pôr Ameaças da cena no Conflito</button><button class="btn sm danger" id="cfFim">Encerrar Conflito</button></div>` : ""}
   <p class="muted small" style="margin:0">Turno dos Infectados: todos declaram ações e Aptidões, rolam e investem os A nos Objetivos. Turno do Assimilador: rola os dados do Conflito e investe nas ativações; depois cada Ameaça rola e age. Ao perder um Nível de Determinação, faça o Teste de Assimilação.</p>`;
}
function ameacaConfHTML(id, f, vis) {
  const D = derivados(f);
  const pre = "am" + id.slice(-5);
  return `<div class="ameaca"><div class="row between" style="flex-wrap:nowrap;gap:6px"><span class="row" style="gap:8px;flex-wrap:nowrap;min-width:0">${avatarAmeaca(f, 36)}<span style="min-width:0"><b>${tokenDeEntrada({ fichaId: id }) ? `<button class="lnk" data-foco="${esc(tokenDeEntrada({ fichaId: id }))}" title="Mostrar no mapa">${esc(f.nome)} ⌖</button>` : esc(f.nome)}</b><div class="muted small">${esc(f.rtipo || "Ameaça")} · ${esc(poolTxt(f.dados || {}))}</div></span></span>
    ${vis ? `<span class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm primary" data-amr="${esc(id)}">Rolar</button><button class="btn sm ghost" data-amf="${esc(id)}">Ficha</button><button class="x" data-amx="${esc(id)}" aria-label="Tirar do Conflito">✕</button></span>` : ""}</div>
   <div class="row small" style="gap:6px;flex-wrap:nowrap"><span>Neutralização</span><div class="pbar" style="flex:1"><i style="width:${D.pvMax ? Math.min(100, (D.prog / D.pvMax) * 100) : 0}%"></i></div><b class="mono">${D.prog}/${D.pvMax}</b>${vis ? `<button class="btn sm" data-amn="${esc(id)}" data-d="-1">−A</button><button class="btn sm primary" data-amn="${esc(id)}" data-d="1">+A</button>` : ""}</div>
   ${vis ? allocHTML(f.pool, f.ativ, pre, true) : ""}</div>`;
}
function bindCombate() {
  const c = S.combate;
  $$("[data-foco]").forEach(b => (b.onclick = () => centrarNo(b.dataset.foco))); // jogo/combate-no-mapa
  if (!c || !c.ativo) {
    if (!S.isM) return;
    const fc = $("#fConf");
    if (!fc) return;
    const sug = () => {
      const p = PROGRESSAO[+$("#cfP").value];
      const n = +$("#cfI").value || 1;
      const v = p[2] + p[3] * n;
      const d0 = sugerirDados(v);
      const ob = $('[name="clx"]').checked ? p[7] : p[6];
      $("#cfSug").innerHTML =
        `Sugestão do livro: dados de valor ${v} (${poolTxt(d0)}); Objetivo Principal ${objTotal({ base: ob[0], mais: ob[1] }, n)} A (${ob[0]} + ${ob[1]} por Infectado além do primeiro); Ameaças de valor ${p[4] + p[5] * n}.`;
    };
    ["#cfP", "#cfI", "[name='clx']", "#cfM"].forEach(s => {
      const e = $(s);
      if (e) e.onchange = e.oninput = sug;
    });
    sug();
    fc.onsubmit = async ev => {
      ev.preventDefault();
      const r = {
        m: $("#cfM").value,
        n: $("#cfN").value.trim(),
        p: +$("#cfP").value,
        i: Math.max(1, +$("#cfI").value || 1),
        clx: $('[name="clx"]').checked,
        ame: $('[name="ame"]').checked
      };
      let novo;
      if (r.m !== "") {
        const m = CONFLITOS_LIVRO[+r.m];
        novo = conflitoDe(m, r.i, r.p);
        if (r.n) novo.nome = r.n;
        if (r.ame && m.ameacas.length) {
          for (const an of m.ameacas) {
            const b = allBest().find(x => x.n === an);
            if (!b) continue;
            const id = "n" + rid(8);
            const f = ameacaDe(b);
            f.criada = Date.now();
            S.fichas[id] = f;
            saveFicha(id, true);
            novo.ameacas.push(id);
          }
        }
      } else {
        const p = PROGRESSAO[r.p];
        const ob = r.clx ? p[7] : p[6];
        novo = conflitoDe(
          {
            n: r.n || "Conflito",
            dados: sugerirDados(p[2] + p[3] * r.i),
            ativ: [
              ["CC", "Golpe", "1 d10 de dano a um alvo."],
              ["CCCC", "Complicação", "Uma complicação muda a cena."],
              ["AAA", "Brecha", "+A no próximo teste de um Infectado."]
            ],
            obj: [
              ["p", "Superar o desafio", ob[0], ob[1], ""],
              ["p", "Fuga", 2, 2, "Voltar sem gerar problemas."]
            ]
          },
          r.i,
          r.p
        );
      }
      saveCombate(novo);
      logEntry({ quem: "Mestre", titulo: `Conflito: ${novo.nome}`, tipo: "chat" });
    };
    return;
  }
  const ed = S.isM;
  if (!ed) return;
  const salvar = x => saveCombate(x);
  const on = (s, fn) => {
    const e = $(s);
    if (e) e.onclick = fn;
  };
  on("#cfVez", () => {
    const x = combBase();
    x.vez = x.vez === "ass" ? "inf" : "ass";
    salvar(x);
    logEntry({
      quem: "Mestre",
      titulo: x.vez === "ass" ? "Turno do Assimilador" : "Turno dos Infectados",
      tipo: "chat"
    });
  });
  on("#cfProx", () => {
    const x = combBase();
    x.rodada = (x.rodada || 1) + 1;
    x.vez = "inf";
    salvar(x);
    logEntry({
      quem: "Mestre",
      titulo: `Rodada ${x.rodada} do Conflito: turno dos Infectados`,
      tipo: "chat"
    });
  });
  $$("[data-ninf]").forEach(
    b =>
      (b.onclick = () => {
        const x = combBase();
        x.nInf = Math.max(1, (x.nInf || 1) + +b.dataset.ninf);
        salvar(x);
      })
  );
  $$("[data-op]").forEach(
    b =>
      (b.onclick = () => {
        const x = combBase();
        const o = x.obj[+b.dataset.op];
        o.prog = Math.max(0, (+o.prog || 0) + +b.dataset.d);
        const tot = objTotal(o, x.nInf);
        if (o.prog >= tot && !o.feito) {
          o.feito = true;
          logEntry({
            quem: "Mestre",
            titulo: `Objetivo concluído: ${o.n}`,
            total: null,
            det: o.t === "p" ? "Objetivo Principal: o Conflito pode terminar." : o.ef || ""
          });
        }
        if (o.prog < tot) o.feito = false;
        salvar(x);
      })
  );
  $$("[data-odel]").forEach(
    b =>
      (b.onclick = () => {
        const x = combBase();
        x.obj.splice(+b.dataset.odel, 1);
        salvar(x);
      })
  );
  $$("[data-cdel]").forEach(
    b =>
      (b.onclick = () => {
        const x = combBase();
        x.cond.splice(+b.dataset.cdel, 1);
        salvar(x);
      })
  );
  on("#cfCondAdd", async () => {
    const r = await formBox(
      "Condicionante",
      `<div class="field"><label class="label" for="ccN">Nome</label><input type="text" id="ccN" name="n" maxlength="50" required placeholder="Ex.: Ventos fortes"></div><div class="field"><label class="label" for="ccT">Regra</label><input type="text" id="ccT" name="t" maxlength="200" placeholder="Ex.: todos os testes usam Resolução"></div>`,
      "Adicionar"
    );
    if (!r) return;
    const x = combBase();
    x.cond.push({ n: r.n.trim(), t: r.t.trim() });
    salvar(x);
  });
  on("#cfObjAdd", async () => {
    const r = await formBox(
      "Novo Objetivo",
      `<div class="field"><label class="label" for="ojN">Nome</label><input type="text" id="ojN" name="n" maxlength="60" required></div>
    <label class="check"><input type="radio" name="t" value="p" checked> Principal (pode encerrar o Conflito)</label><label class="check"><input type="radio" name="t" value="s"> Secundário (recompensa, facilita ou neutraliza)</label>
    <div class="row" style="flex-wrap:nowrap"><div class="field"><label class="label" for="ojB">A necessários</label><input type="number" id="ojB" name="b" min="1" max="60" value="5"></div><div class="field"><label class="label" for="ojM">+ por Infectado além do primeiro</label><input type="number" id="ojM" name="m" min="0" max="20" value="1"></div></div>
    <div class="field"><label class="label" for="ojE">Efeito</label><input type="text" id="ojE" name="ef" maxlength="160"></div>`,
      "Criar"
    );
    if (!r) return;
    const x = combBase();
    x.obj.push({
      t: r.t,
      n: r.n.trim(),
      base: +r.b || 1,
      mais: +r.m || 0,
      ef: r.ef.trim(),
      prog: 0,
      feito: false
    });
    salvar(x);
  });
  on("#cfAtivAdd", async () => {
    const r = await novaAtivacao();
    if (!r) return;
    const x = combBase();
    x.ativ.push({
      n: r.n.trim(),
      c: r.c.toUpperCase().replace(/[^ABC0-9]/g, ""),
      ef: r.ef.trim(),
      inv: { a: 0, b: 0, c: 0 }
    });
    salvar(x);
  });
  const sh = $("#cfShow");
  if (sh)
    sh.onchange = () => {
      const x = combBase();
      x.mostrarAtiv = sh.checked;
      salvar(x);
    };
  $$("[data-cfd]").forEach(
    i =>
      (i.onchange = () => {
        const x = combBase();
        x.dados["d" + i.dataset.cfd] = Math.max(0, +i.value || 0);
        salvar(x);
      })
  );
  {
    const df = $("#cfDif");
    if (df)
      df.onchange = () => {
        const x = combBase();
        x.dif = +df.value;
        salvar(x);
      };
  }
  on("#cfRolar", () => {
    const x = combBase();
    const p = { ...x.dados };
    p.d12 = (+p.d12 || 0) + DIFICULDADES[+x.dif || 0][1];
    if (!poolValor(p)) {
      toast("O Conflito não tem dados.");
      return;
    }
    const r = rolarPoolLog("Mestre", `Conflito · ${x.nome}`, p, "o Assimilador mantém todos");
    const sobra = x.pool || { a: 0, b: 0, c: 0 };
    x.pool = { a: r.o.a + (sobra.a || 0), b: r.o.b + (sobra.b || 0), c: r.o.c + (sobra.c || 0) };
    x.vez = "ass";
    salvar(x);
  });
  bindAlloc("ca", combBase, salvar, () => "Mestre");
  $$("[data-invgo]").forEach(
    b =>
      (b.onclick = () => {
        const x = combBase();
        const e = S.log.find(y => y.id === b.dataset.invgo);
        if (!e) return;
        const p = parseDet(e.det);
        const oi = +$(`[data-invsel="${b.dataset.invgo}"]`).value;
        const o = x.obj[oi];
        if (!o) return;
        o.prog = (+o.prog || 0) + p.sim.a;
        x.investidos = x.investidos || {};
        x.investidos[e.id] = 1;
        const tot = objTotal(o, x.nInf);
        if (o.prog >= tot && !o.feito) {
          o.feito = true;
          logEntry({
            quem: "Mestre",
            titulo: `Objetivo concluído: ${o.n}`,
            total: null,
            det: o.t === "p" ? "Objetivo Principal: o Conflito pode terminar." : o.ef || ""
          });
        }
        salvar(x);
      })
  );
  $$("[data-invno]").forEach(
    b =>
      (b.onclick = () => {
        const x = combBase();
        x.investidos = x.investidos || {};
        x.investidos[b.dataset.invno] = 1;
        salvar(x);
      })
  );
  on("#cfAmeAdd", async () => {
    const L = Object.entries(S.fichas).filter(([id, f]) => f.rapido && !(c.ameacas || []).includes(id));
    const B = allBest();
    const r = await formBox(
      "Ameaça no Conflito",
      `<div class="field"><label class="label" for="caS">Ameaça</label><select id="caS" name="s">${L.length ? `<optgroup label="NPCs da mesa">${L.map(([id, f]) => `<option value="f:${esc(id)}">${esc(f.nome)}</option>`).join("")}</optgroup>` : ""}<optgroup label="Criar a partir de">${B.map((b, i) => `<option value="b:${i}">${esc(b.n)} · ${esc(b.el)} · ${esc(poolTxt(b.dados))}</option>`).join("")}</optgroup></select></div>`,
      "Adicionar"
    );
    if (!r) return;
    const x = combBase();
    let id;
    if (r.s.startsWith("f:")) id = r.s.slice(2);
    else {
      const b = B[+r.s.slice(2)];
      id = "n" + rid(8);
      const f = ameacaDe(b);
      f.criada = Date.now();
      S.fichas[id] = f;
      saveFicha(id, true);
    }
    x.ameacas = [...new Set([...(x.ameacas || []), id])];
    salvar(x);
  });
  on("#cfTok", addTokensAoCombate);
  on("#cfFim", async () => {
    if (
      !(await confirmBox(
        "Encerrar o Conflito?",
        "Volta à narrativa fluida. As Ameaças continuam como NPCs.",
        "Encerrar"
      ))
    )
      return;
    saveCombate({ ativo: false, lista: [] });
    logEntry({ quem: "Mestre", titulo: "Fim do Conflito", tipo: "chat" });
  });
  // ameaças
  (c.ameacas || []).forEach(id => {
    const f = S.fichas[id];
    if (!f) return;
    const pre = "am" + id.slice(-5);
    bindAlloc(
      pre,
      () => f,
      o => {
        saveFicha(id, true);
        renderPanel();
        renderBoard();
      },
      o => o.nome
    );
  });
  $$("[data-amr]").forEach(
    b =>
      (b.onclick = () => {
        const id = b.dataset.amr;
        const f = S.fichas[id];
        if (!f) return;
        const p = { ...(f.dados || {}) };
        p.d12 = (+p.d12 || 0) + DIFICULDADES[+c.dif || 0][1];
        const r = rolarPoolLog(f.nome, `Ameaça · ${f.nome}`, p, "mantém todos");
        const s = f.pool || { a: 0, b: 0, c: 0 };
        f.pool = { a: r.o.a + (s.a || 0), b: r.o.b + (s.b || 0), c: r.o.c + (s.c || 0) };
        saveFicha(id, true);
        renderPanel();
      })
  );
  $$("[data-amf]").forEach(
    b =>
      (b.onclick = () => {
        S.openFicha = b.dataset.amf;
        S.sheetTab = "principal";
        openTool("agentes");
      })
  );
  $$("[data-amx]").forEach(
    b =>
      (b.onclick = () => {
        const x = combBase();
        x.ameacas = (x.ameacas || []).filter(i => i !== b.dataset.amx);
        salvar(x);
      })
  );
  $$("[data-amn]").forEach(
    b =>
      (b.onclick = () => {
        const id = b.dataset.amn;
        const f = S.fichas[id];
        if (!f) return;
        f.prog = Math.max(0, (+f.prog || 0) + +b.dataset.d);
        const D = derivados(f);
        saveFicha(id, true);
        if (D.prog >= D.pvMax && +b.dataset.d > 0)
          logEntry({
            quem: "Mestre",
            titulo: `${f.nome} foi neutralizada`,
            total: null,
            det: "Perde as rolagens e ativações."
          });
        renderPanel();
        renderBoard();
      })
  );
}
