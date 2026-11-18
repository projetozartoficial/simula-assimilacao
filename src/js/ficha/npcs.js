"use strict";
/* NPCs e Ameaças: ficha de Ameaça (dados, ativações, Neutralização), modelos do livro, duplicar e pastas.
   Personagens importantes podem ter ficha completa de Infectado (npc: true, sem rapido). */
function nInfAtual() {
  return (S.combate && S.combate.ativo && S.combate.nInf) || nInfPadrao();
}
function derAmeaca(f) {
  const nb = f.neut || [1, 0];
  const pvMax = Math.max(1, (+nb[0] || 1) + (+nb[1] || 0) * Math.max(0, nInfAtual() - 1));
  const prog = Math.max(0, +f.prog || 0);
  return { pvMax, pv: Math.max(0, pvMax - prog), prog, def: 0, D: 0, E: 0, P: 1, nivel: 1, pressoes: 0 };
}
function ameacaDe(b) {
  const f = novaFicha();
  Object.assign(f, {
    npc: true,
    rapido: true,
    ameaca: true,
    visivel: false,
    dono: S.uid,
    nome: b ? b.n : "Nova Ameaça",
    base: b ? b.n : "",
    rtipo: b ? b.el : "Humano",
    rel: b ? b.el : "Humano",
    criatura: !!b && b.el !== "Humano",
    dados: b ? { ...b.dados } : { d6: 2, d10: 0, d12: 0 },
    neut: b ? [...b.neut] : [4, 1],
    prog: 0,
    pool: null,
    ativ: b
      ? b.ativ.map(([c, n, ef]) => ({ n, c, ef, inv: { a: 0, b: 0, c: 0 } }))
      : [
          { n: "Ataque", c: "CC", ef: "1 d10 de dano a um alvo.", inv: { a: 0, b: 0, c: 0 } },
          { n: "Recuo", c: "AAA", ef: "A Ameaça recua.", inv: { a: 0, b: 0, c: 0 } }
        ],
    rnotas: b ? b.notas || "" : ""
  });
  return f;
}
function npcPastas() {
  return [
    ...new Set(
      Object.values(S.fichas)
        .filter(f => f.npc && f.pasta)
        .map(f => f.pasta)
    )
  ].sort();
}
async function novoNpc() {
  const B = allBest();
  const r = await formBox(
    "Criar NPC ou Ameaça",
    `<div class="field"><span class="label">Tipo de ficha</span>
     <label class="check"><input type="radio" name="tipo" value="rapido" checked> <span><b>Ameaça</b>: dados, ativações e Neutralização (como no livro)</span></label>
     <label class="check"><input type="radio" name="tipo" value="completo"> <span><b>Ficha de Infectado</b>: personagem importante, com Aptidões, Cabo de Guerra e Saúde</span></label></div>
   <div class="field"><label class="label" for="npM">Começar de (Ameaça)</label><select id="npM" name="modelo"><option value="">Ameaça em branco</option>${B.map((b, i) => `<option value="${i}">${esc(b.n)} · ${esc(b.el)} · ${esc(poolTxt(b.dados))}${b.hb ? " (homebrew)" : ""}</option>`).join("")}</select></div>
   <div class="row" style="flex-wrap:nowrap"><div class="field" style="flex:2"><label class="label" for="npN">Nome</label><input type="text" id="npN" name="nome" maxlength="40" placeholder="Deixe vazio para usar o do modelo"></div>
    <div class="field" style="flex:1"><label class="label" for="npQ">Quantos</label><input type="number" id="npQ" name="qtd" min="1" max="12" value="1"></div></div>
   <div class="field"><label class="label" for="npT">Tipo (Ameaça em branco)</label><select id="npT" name="tp">${TIPOS_AMEACA.map(x => `<option>${x}</option>`).join("")}</select></div>
   <div class="field"><label class="label" for="npP">Pasta (aventura, lugar, grupo…)</label><input type="text" id="npP" name="pasta" maxlength="40" list="npPastas" value="${esc(S.npcPasta && S.npcPasta !== "*" ? S.npcPasta : "")}" placeholder="Ex.: Vale dos Montes"><datalist id="npPastas">${npcPastas()
     .map(p => `<option value="${esc(p)}">`)
     .join("")}</datalist></div>
   <label class="check"><input type="checkbox" name="arte"> Escolher uma arte minha agora</label>`,
    "Criar"
  );
  if (!r) return;
  const q = Math.max(1, Math.min(12, +r.qtd || 1));
  let first = null;
  let foto = null;
  if (r.arte) {
    const file = await pickImage();
    if (file)
      foto = await cropImage(file, {
        size: 300,
        ratio: 4 / 3,
        radius: 0.06,
        type: "image/webp",
        title: "Ajustar a arte"
      });
  }
  for (let i = 0; i < q; i++) {
    const id = "n" + rid(8);
    let f;
    if (r.tipo === "completo") {
      f = novaFicha();
      Object.assign(f, { npc: true, visivel: false, dono: S.uid, nome: "Novo NPC" });
    } else {
      const b = r.modelo === "" ? null : B[+r.modelo];
      f = ameacaDe(b);
      if (!b) {
        f.rtipo = r.tp;
        f.rel = r.tp;
        f.criatura = r.tp !== "Humano";
      }
    }
    if (r.nome.trim()) f.nome = r.nome.trim();
    if (q > 1) f.nome += " " + (i + 1);
    if (r.pasta.trim()) f.pasta = r.pasta.trim();
    if (foto) f.foto = foto;
    f.criada = Date.now() + i;
    S.fichas[id] = f;
    saveFicha(id, true);
    first = first || id;
    await espera(20);
  }
  if (q === 1) {
    S.openFicha = first;
    S.sheetTab = "principal";
  }
  renderPanel();
  toast(q > 1 ? `${q} criados.` : "Criado.");
}
async function npcDuplicar(id) {
  const f0 = S.fichas[id];
  if (!f0) return;
  const r = await formBox(
    `Duplicar ${f0.nome}`,
    `<div class="field"><label class="label" for="ndQ">Quantas cópias</label><input type="number" id="ndQ" name="qtd" min="1" max="12" value="1"></div>
   <label class="check"><input type="checkbox" name="cheia" checked> Cópias inteiras (sem dano nem Neutralização)</label>`,
    "Duplicar"
  );
  if (!r) return;
  const q = Math.max(1, Math.min(12, +r.qtd || 1));
  const base = f0.nome.replace(/\s+\d+$/, "");
  const usados = Object.values(S.fichas)
    .filter(f => f.npc && f.nome.replace(/\s+\d+$/, "") === base)
    .map(f => +(f.nome.match(/(\d+)$/) || [0, 1])[1]);
  let n = Math.max(1, ...usados);
  if (!/\d+$/.test(f0.nome)) {
    f0.nome = base + " 1";
    saveFicha(id, true);
  }
  for (let i = 0; i < q; i++) {
    const nid = "n" + rid(8);
    const f = JSON.parse(JSON.stringify(f0));
    f.nome = base + " " + ++n;
    f.criada = Date.now() + i;
    if (r.cheia) {
      f.dano = 0;
      f.prog = 0;
      f.pool = null;
      f.dGasto = 0;
      f.eGasto = 0;
      (f.ativ || []).forEach(a => (a.inv = { a: 0, b: 0, c: 0 }));
    }
    S.fichas[nid] = f;
    saveFicha(nid, true);
    await espera(20);
  }
  renderPanel();
  toast(q > 1 ? `${q} cópias criadas.` : "Cópia criada.");
}

/* ---------- lista de NPCs (em Infectados) ---------- */
function npcCard(id) {
  const f = S.fichas[id];
  const D = derivados(migrar(f));
  if (f.rapido) {
    const pct = Math.max(0, Math.min(100, (D.prog / D.pvMax) * 100));
    return `<button class="fcard ${f.visivel || !S.isM ? "" : "npchid"}" data-open="${esc(id)}">${avatarAmeaca(f)}<div style="min-width:0"><div class="label">${esc(f.rtipo || "Ameaça")} · ${esc(poolTxt(f.dados || {}))}${S.isM && !f.visivel ? " · escondida" : ""}</div><div class="nm">${esc(f.nome)}</div>
   <div class="npcpv neut"><i style="width:${pct}%"></i><span>Neutralização ${D.prog}/${D.pvMax}</span></div></div></button>`;
  }
  const pct = Math.max(0, Math.min(100, (D.pv / D.pvMax) * 100));
  return `<button class="fcard ${f.visivel || !S.isM ? "" : "npchid"}" data-open="${esc(id)}">${f.foto ? avatar(f) : avatarAmeaca(f)}<div style="min-width:0"><div class="label">${esc(f.ocupacao || "NPC")} · D${D.D} E${D.E}${S.isM && !f.visivel ? " · escondido" : ""}</div><div class="nm">${esc(f.nome)}</div>
   <div class="npcpv"><i style="width:${pct}%"></i><span>Saúde ${D.pv}/${D.pvMax}</span></div></div></button>`;
}
function npcSecaoHTML(ids) {
  if (!ids.length && !S.isM) return "";
  const pastas = npcPastas();
  const filtro = S.npcPasta || "*";
  const vis = ids.filter(
    id => filtro === "*" || (filtro === "—" ? !S.fichas[id].pasta : S.fichas[id].pasta === filtro)
  );
  const grupos = {};
  vis.forEach(id => {
    const p = S.fichas[id].pasta || "";
    (grupos[p] = grupos[p] || []).push(id);
  });
  return `<div class="row between"><span class="sub" style="margin:0">NPCs e Ameaças${S.isM ? " do mestre" : ""}</span>${S.isM ? `<span class="row" style="gap:4px"><button class="btn sm ghost" id="galArtes">Artes</button><button class="btn sm" id="novoNpc">Criar</button></span>` : ""}</div>
   ${pastas.length ? `<div class="me-cats"><button class="chip ${filtro === "*" ? "on" : ""}" data-npast="*">Todos</button>${pastas.map(p => `<button class="chip ${filtro === p ? "on" : ""}" data-npast="${esc(p)}">${esc(p)}</button>`).join("")}<button class="chip ${filtro === "—" ? "on" : ""}" data-npast="—">Sem pasta</button></div>` : ""}
   ${
     vis.length
       ? Object.keys(grupos)
           .sort((a, b) => (a === "" ? 1 : 0) - (b === "" ? 1 : 0) || a.localeCompare(b))
           .map(
             p =>
               `<div class="row between"><span class="muted small">${p ? esc(p) : Object.keys(grupos).length > 1 ? "Sem pasta" : ""}</span>${S.isM && S.viewSid ? `<button class="btn sm ghost" data-pgc="${esc(p)}">Pôr ${p ? "a pasta" : "todos"} na cena</button>` : ""}</div><div class="cards">${grupos[p].map(npcCard).join("")}</div>`
           )
           .join("")
       : `<div class="muted small">${S.isM ? "Saqueadores, feras assimiladas, carniçais, aliados. Só você vê, a não ser que marque “visível”." : "Nenhum NPC visível."}</div>`
   }`;
}
function bindNpcSecao() {
  $$("[data-npast]").forEach(
    b =>
      (b.onclick = () => {
        S.npcPasta = b.dataset.npast;
        renderPanel();
      })
  );
  const nn = $("#novoNpc");
  if (nn) nn.onclick = novoNpc;
  const ga = $("#galArtes");
  if (ga) ga.onclick = galeriaArtes;
  $$("[data-pgc]").forEach(b => (b.onclick = () => porGrupoEmCena(b.dataset.pgc)));
}

/* ---------- ficha de Ameaça ---------- */
function npcRapidoHTML(id, f) {
  const D = derivados(f);
  const ed = canEditFicha(f);
  const dis = ed ? "" : "disabled";
  const nb = f.neut || [1, 0];
  return `<div class="row between"><button class="btn sm ghost" data-back>← Infectados</button><span class="row" style="gap:6px">${fichaAcoesHTML(f)}<span class="muted small" id="saveState">${ed ? "Salvo" : "Só leitura"}</span></span></div>
   ${S.isM ? `<label class="check banner info"><input type="checkbox" id="npcVis" ${f.visivel ? "checked" : ""}> Ficha visível para os jogadores (eles só leem)</label>` : ""}
   <div class="sheet-top"><button type="button" class="photo" id="foto" aria-label="Trocar arte" ${dis}>${f.foto ? `<img src="${f.foto}" alt="">` : `<img src="${arteDaFicha(f)}" alt="" style="object-fit:contain">`}</button>
    <div class="stack" style="gap:6px;min-width:0"><input type="text" id="q_nome" data-qt="nome" value="${esc(f.nome)}" maxlength="40" class="qname" ${dis} aria-label="Nome">
     <select data-qs="rtipo" ${dis} aria-label="Tipo">${TIPOS_AMEACA.map(t => `<option ${t === (f.rtipo || "Humano") ? "selected" : ""}>${t}</option>`).join("")}</select>
     ${
       S.isM
         ? `<input type="text" data-qt="pasta" value="${esc(f.pasta || "")}" maxlength="40" list="npPastas2" placeholder="Pasta (opcional)" aria-label="Pasta"><datalist id="npPastas2">${npcPastas()
             .map(p => `<option value="${esc(p)}">`)
             .join("")}</datalist>`
         : ""
     }</div></div>
   <div class="box stack"><div class="row between"><h3 style="margin:0">Neutralização</h3><b class="mono">${D.prog}/${D.pvMax} A</b></div><div class="pbar"><i style="width:${Math.min(100, (D.prog / D.pvMax) * 100)}%"></i></div>
    ${ed ? `<div class="row"><button class="btn sm" data-qn="-1">−A</button><button class="btn sm primary" data-qn="1">+A</button><span class="grow"></span><span class="small">Custo</span><input type="number" data-qnb="0" value="${+nb[0] || 1}" min="1" max="99" style="width:64px" aria-label="A para neutralizar"><span class="small">+</span><input type="number" data-qnb="1" value="${+nb[1] || 0}" min="0" max="20" style="width:56px" aria-label="A a mais por Infectado"><span class="small muted">por Infectado extra</span></div>` : ""}
    ${D.prog >= D.pvMax ? `<div class="banner info">Neutralizada: perde as rolagens e ativações (não precisa ter morrido: pode ter fugido ou sido contida).</div>` : ""}</div>
   <div class="box stack"><div class="row between"><h3 style="margin:0">Dados</h3><span class="muted small">valor ${poolValor(f.dados || {})}</span></div>
    <div class="row poolin">${[6, 10, 12].map(t => `<label class="pool d${t}"><span>d${t}</span><input type="number" min="0" max="20" value="${+(f.dados || {})["d" + t] || 0}" data-qd="${t}" ${dis} aria-label="Quantos d${t}"></label>`).join("")}<button class="btn primary" id="qRolar">Rolar</button></div>
    ${allocHTML(ed ? f.pool : null, f.ativ, "qf", ed)}
    ${ed ? `<div class="row"><button class="btn sm" id="qAtvAdd">+ Ativação</button>${f.pool && (f.pool.a || f.pool.b || f.pool.c) ? `<button class="btn sm ghost" id="qPoolZ">Zerar pontos</button>` : ""}</div>` : ""}</div>
   <div class="box stack"><h3 style="margin:0">Notas</h3><textarea data-qt="rnotas" rows="5" maxlength="3000" ${dis} placeholder="Intenções, o que acontece se for neutralizada, recompensas…">${esc(f.rnotas || "")}</textarea></div>
   ${S.isM ? `<div class="row between"><span class="row"><button class="btn sm" id="btnTokFicha">Criar token</button><button class="btn sm" id="qDup">Duplicar</button><button class="btn sm" id="qConf" ${S.combate && S.combate.ativo ? "" : "disabled"}>Pôr no Conflito</button><button class="btn sm ghost" id="qFull">Converter em ficha de Infectado</button></span><button class="btn sm danger" id="btnDelFicha">Apagar</button></div>` : ""}`;
}
function bindNpcRapido(id, f) {
  const sv = now => saveFicha(id, now),
    rr = () => renderPanel();
  const ed = canEditFicha(f);
  $$("[data-back]").forEach(
    b =>
      (b.onclick = () => {
        S.openFicha = null;
        renderPanel();
      })
  );
  const nv = $("#npcVis");
  if (nv)
    nv.onchange = () => {
      f.visivel = nv.checked;
      sv(true);
      toast(nv.checked ? "Os jogadores agora veem esta ficha." : "Ficha escondida dos jogadores.");
      rr();
    };
  if (!ed) return;
  on2("#qRolar", () => {
    const p = { ...(f.dados || {}) };
    const dif = S.combate && S.combate.ativo ? DIFICULDADES[+S.combate.dif || 0][1] : 0;
    p.d12 = (+p.d12 || 0) + dif;
    if (!poolValor(p)) {
      toast("Sem dados.");
      return;
    }
    const r = rolarPoolLog(f.nome, `Ameaça · ${f.nome}`, p, "mantém todos", { para: S.paraRolagem || "" });
    const s = f.pool || { a: 0, b: 0, c: 0 };
    f.pool = { a: r.o.a + (s.a || 0), b: r.o.b + (s.b || 0), c: r.o.c + (s.c || 0) };
    sv(true);
    rr();
  });
  bindAlloc(
    "qf",
    () => f,
    () => {
      sv(true);
      rr();
      renderBoard();
    },
    o => o.nome
  );
  on2("#qAtvAdd", async () => {
    const r = await novaAtivacao();
    if (!r) return;
    f.ativ = [
      ...(f.ativ || []),
      {
        n: r.n.trim(),
        c: r.c.toUpperCase().replace(/[^ABC0-9]/g, ""),
        ef: r.ef.trim(),
        inv: { a: 0, b: 0, c: 0 }
      }
    ];
    sv(true);
    rr();
  });
  on2("#qPoolZ", () => {
    f.pool = null;
    sv(true);
    rr();
  });
  $$("[data-qt]").forEach(
    i =>
      (i.oninput = () => {
        f[i.dataset.qt] = i.value;
        sv();
      })
  );
  $$("[data-qs]").forEach(
    i =>
      (i.onchange = () => {
        f[i.dataset.qs] = i.value;
        if (i.dataset.qs === "rtipo") {
          f.rel = i.value;
          f.criatura = i.value !== "Humano";
        }
        sv();
        rr();
        renderBoard();
      })
  );
  $$("[data-qd]").forEach(
    i =>
      (i.onchange = () => {
        f.dados = f.dados || {};
        f.dados["d" + i.dataset.qd] = Math.max(0, +i.value || 0);
        sv();
        rr();
      })
  );
  $$("[data-qnb]").forEach(
    i =>
      (i.onchange = () => {
        f.neut = f.neut || [1, 0];
        f.neut[+i.dataset.qnb] = Math.max(+i.dataset.qnb ? 0 : 1, +i.value || 0);
        sv();
        rr();
        renderBoard();
      })
  );
  $$("[data-qn]").forEach(
    b =>
      (b.onclick = () => {
        f.prog = Math.max(0, (+f.prog || 0) + +b.dataset.qn);
        sv();
        rr();
        renderBoard();
      })
  );
  on2("#foto", async () => {
    const file = await pickImage();
    if (!file) return;
    const url = await cropImage(file, {
      size: 300,
      ratio: 4 / 3,
      radius: 0.06,
      type: "image/jpeg",
      title: "Ajustar a arte"
    });
    if (!url) return;
    f.foto = url;
    sv(true);
    rr();
    renderBoard();
  });
  on2("#btnTokFicha", () => tokenDaFicha(id));
  on2("#qDup", () => npcDuplicar(id));
  on2("#qConf", () => {
    const c = combBase();
    if (!c.ativo) return;
    c.ameacas = [...new Set([...(c.ameacas || []), id])];
    saveCombate(c);
    toast(`${f.nome} entrou no Conflito.`);
  });
  on2("#qFull", async () => {
    if (
      !(await confirmBox(
        "Converter em ficha de Infectado?",
        "Para Ameaças que ganharam importância: a ficha passa a ter Aptidões, Cabo de Guerra e Saúde. Pelo livro, uma Ameaça iniciante vira ficha com 14 de Experiência; intermediária, 21 a 40.",
        "Converter"
      ))
    )
      return;
    f.rapido = false;
    f.ameaca = false;
    f.ocupacao = f.ocupacao || f.rtipo || "";
    f.notas = [f.notas, f.rnotas].filter(Boolean).join("\n");
    migrar(f);
    sv(true);
    rr();
  });
  on2("#btnDelFicha", async () => {
    if (!(await confirmBox(`Apagar ${f.nome}?`, "Não dá para desfazer.", "Apagar"))) return;
    try {
      await S.db.del(fichaPath(id));
      delete S.fichas[id];
      S.openFicha = null;
      renderPanel();
      renderBoard();
    } catch (e) {
      fail(e);
    }
  });
}
function on2(sel, fn) {
  const e = $(sel);
  if (e) e.onclick = fn;
}
