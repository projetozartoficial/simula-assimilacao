"use strict";
/* Painel Rolagens: teste da ficha, dados de símbolos, dano, dado numérico, chat e visual do dado; registro com data (quandoRolou). */
/* ===================== ROLAGENS ===================== */
function rolagensHTML() {
  const opts = Object.entries(S.fichas).filter(([id, f]) => (S.isM || f.dono === S.uid) && !f.rapido);
  return `<div class="box stack">
    <div class="field"><label class="label" for="rollQuem">Quem testa</label><div class="row" style="flex-wrap:nowrap"><select id="rollQuem">${opts.map(([id, f]) => `<option value="${esc(id)}">${esc(f.nome)}</option>`).join("")}${!opts.length ? `<option value="">${S.isM ? "Mestre" : "Sem ficha"}</option>` : ""}</select><button type="button" class="btn primary" id="btnTesteF" ${opts.length ? "" : "disabled"}>Fazer teste</button></div></div>
    <form class="stack" id="fPool" style="gap:8px"><span class="label">Rolar dados de símbolos (mantém todos)</span>
     <div class="row poolin">${[6, 10, 12].map(t => `<label class="pool d${t}"><span>d${t}</span><input type="number" min="0" max="20" value="${t === 6 ? 1 : 0}" name="p${t}" aria-label="Quantos d${t}"></label>`).join("")}<button class="btn">Rolar</button></div>
     <div class="row" style="flex-wrap:nowrap"><span class="label" style="white-space:nowrap">Dano</span><input type="number" id="danoN" min="1" max="20" value="1" style="width:64px" aria-label="Quantos d10 de dano"><span class="muted small">d10 (cada símbolo = 1)</span><button type="button" class="btn sm" id="btnDano">Rolar dano</button></div>
     <div class="row" style="flex-wrap:nowrap"><input type="text" id="rollExpr" placeholder="Dado numérico: 2d6+3" autocomplete="off" aria-label="Expressão de dados"><button type="button" class="btn sm" id="btnExpr">Rolar</button></div></form>
   </div>
   <div class="row" style="flex-wrap:nowrap"><label class="label" for="paraSel" style="white-space:nowrap;margin:0">Para</label><select id="paraSel">${destinos()
     .map(
       ([v, n]) =>
         `<option value="${esc(v)}" ${(S.paraRolagem || "") === v ? "selected" : ""}>${esc(n)}</option>`
     )
     .join("")}</select></div>
   <form class="row" id="fChat" style="flex-wrap:nowrap"><input type="text" id="chatIn" maxlength="300" placeholder="${S.paraRolagem ? "Mensagem privada…" : "Falar na mesa…"}" aria-label="Mensagem"><button class="btn">Enviar</button></form>
   <p class="muted small" style="margin:0">O "Para" vale para o chat, para as rolagens daqui e para os testes da ficha.</p>
   <div class="row" style="flex-wrap:nowrap"><label class="label" for="skinSel" style="white-space:nowrap;margin:0">Seu dado</label><select id="skinSel">${SKINS_DADO.map(([k, n]) => `<option value="${k}" ${skinDado() === k ? "selected" : ""}>${n}</option>`).join("")}</select><button type="button" class="btn sm" id="btnMudo" style="white-space:nowrap" aria-pressed="${somMudo()}">${somMudo() ? "Som desligado" : "Som ligado"}</button></div>
   ${S.isM ? `<button class="btn" id="btnDoc">Enviar documento ou pista</button>` : ""}
   <div class="row between"><span class="sub">Registro da mesa</span>${S.isM ? `<button class="btn sm ghost" id="btnLimparLog">Limpar registro</button>` : ""}</div>
   <div class="log" id="log"></div>`;
}
function renderLog() {
  const el = $("#log");
  if (!el) return;
  if (!S.log.length && !(S.priv || []).length) {
    el.innerHTML = `<div class="empty">${S.loaded.log ? "Nada rolado ainda. Abra uma ficha e toque em <b>Fazer teste</b>, ou role aqui em cima." : "Carregando registro…"}</div>`;
    return;
  }
  const all = [...S.log.map(x => ({ ...x, _p: 0 })), ...(S.priv || []).map(x => ({ ...x, _p: 1 }))]
    .sort((a, b) => (b.ts || 0) - (a.ts || 0))
    .slice(0, 150);
  el.innerHTML = all.map(x => (x._p ? privRow(x) : logRow(x))).join("");
  el.querySelectorAll("[data-doc]").forEach(
    b =>
      (b.onclick = () => {
        const d = (S.priv || []).find(x => x.id === b.dataset.doc);
        if (d) abrirDoc(d);
      })
  );
}
/* Hora da rolagem: só a hora se foi hoje; senão dd/mm/aa hh:mm. */
function quandoRolou(ts) {
  const d = new Date(ts || 0);
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === new Date().toDateString()) return hora;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }) + " " + hora;
}
function logRow(e) {
  const t = quandoRolou(e.ts);
  if (e.tipo === "chat")
    return `<div class="entry chat"><span class="wh"><b>${esc(e.quem || "Jogador")}</b> · ${t}</span><span class="wt">${esc(e.titulo)}</span></div>`;
  return `<div class="entry ${esc(e.flag)}${e.secreto ? " secret" : ""}${skinClasse(e.skin)}"><span class="wh"><b>${esc(e.quem || "Mestre")}</b> · ${t}</span><span class="wt">${esc(e.titulo)}</span><span class="det">${detHTML(e.det)}</span><span class="tot">${totHTML(e)}</span></div>`;
}
function quemNome() {
  const id = $("#rollQuem") && $("#rollQuem").value;
  return id && S.fichas[id] ? S.fichas[id].nome : S.isM ? "Mestre" : "Jogador";
}
function bindRolagens() {
  const para = () => S.paraRolagem || "";
  $("#paraSel").onchange = () => {
    S.paraRolagem = $("#paraSel").value;
    const ci = $("#chatIn");
    if (ci) ci.placeholder = S.paraRolagem ? "Mensagem privada…" : "Falar na mesa…";
  };
  {
    const bd = $("#btnDoc");
    if (bd) bd.onclick = novoDocumento;
  }
  $("#skinSel").onchange = () => {
    lsSet("sa_skin", $("#skinSel").value);
    dicePop({
      quem: quemNome(),
      titulo: "Assim fica o seu dado",
      total: null,
      det: "[[2,1,0]] ",
      flag: "crit",
      skin: skinDado()
    });
  };
  $("#btnMudo").onclick = () => {
    lsSet("sa_mudo", !somMudo());
    renderPanel();
  };
  {
    const bt = $("#btnTesteF");
    if (bt)
      bt.onclick = () => {
        const id = $("#rollQuem").value;
        if (id) abrirTeste(id, {});
      };
  }
  $("#fPool").onsubmit = ev => {
    ev.preventDefault();
    const p = {
      d6: +$('[name="p6"]').value || 0,
      d10: +$('[name="p10"]').value || 0,
      d12: +$('[name="p12"]').value || 0
    };
    if (!poolValor(p)) {
      toast("Escolha quantos dados rolar.");
      return;
    }
    rolarPoolLog(quemNome(), `Rolagem ${poolTxt(p)}`, p, "", { para: para() });
  };
  $("#btnDano").onclick = () => {
    const n = Math.max(1, Math.min(20, +$("#danoN").value || 1));
    rolarDanoLog(quemNome(), n, 10, { para: para() });
  };
  $("#btnExpr").onclick = () => {
    const ex = $("#rollExpr").value.trim() || "1d6";
    const r = rollExpr(ex);
    if (!r) {
      toast("Expressão inválida. Use algo como 2d6+3.");
      return;
    }
    logEntry({ quem: quemNome(), titulo: `Rolagem ${ex}`, total: r.total, det: r.detail, para: para() });
  };
  $("#fChat").onsubmit = ev => {
    ev.preventDefault();
    const t = $("#chatIn").value.trim();
    if (!t) return;
    $("#chatIn").value = "";
    logEntry({ quem: quemNome(), titulo: t, tipo: "chat", para: para() });
  };
  const lim = $("#btnLimparLog");
  if (lim)
    lim.onclick = async () => {
      if (
        !(await confirmBox("Limpar o registro?", "Todas as rolagens e mensagens somem para todos.", "Limpar"))
      )
        return;
      for (const e of S.log) {
        try {
          await S.db.del(P() + "/log/" + e.id);
        } catch (err) {
          fail(err);
          break;
        }
      }
      toast("Registro limpo.");
    };
}
