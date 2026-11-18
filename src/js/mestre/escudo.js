"use strict";
/* Escudo do mestre: capa, acesso, Infectados da mesa, Experiência e tempo para todos, anotações, referência e rolagens secretas. */
/* ===================== ESCUDO DO MESTRE ===================== */
function escudoHTML() {
  if (!S.isM) return `<div class="empty">Só o mestre abre o escudo.</div>`;
  const ids = Object.keys(S.fichas)
    .filter(id => !S.fichas[id].rapido)
    .sort((a, b) => (S.fichas[a].criada || 0) - (S.fichas[b].criada || 0));
  const sb = (id, k, lab, v, max) =>
    `<div class="label" style="text-align:center;margin-top:2px">${lab}</div><div class="sbar ${k}${metadeOuMenos(v, max)}"><button data-sb="${esc(id)}" data-k="${k}" data-d="-1" aria-label="Diminuir ${lab}">‹</button><div class="t"><i style="width:${Math.max(0, Math.min(100, max ? (v / max) * 100 : 0))}%"></i><span>${v} / ${max}</span></div><button data-sb="${esc(id)}" data-k="${k}" data-d="1" aria-label="Aumentar ${lab}">›</button></div>`;
  const cards = ids
    .map(id => {
      const f = migrar(S.fichas[id]);
      const D = derivados(f);
      const cs = [...condAuto(f), ...(f.cond || []), ...(f.enf || []).map(e => e.nome)];
      return `<div class="scard"><div class="top">${avatar(f)}<div style="min-width:0"><div class="nm">${esc(f.nome)}</div><div class="muted small">${esc(f.ocupacao || "Infectado")}${f.npc ? " · NPC" : ""}</div></div></div>
    <div class="mini six">${INSTINTOS.map(k => `<div><b>${instTot(f, k)}</b><span>${INST_ABREV[k]}</span></div>`).join("")}</div>
    <div>${sb(id, "pv", "Saúde", D.pv, D.pvMax)}${sb(id, "san", "Determinação", cur(f, "d"), D.D)}${sb(id, "pe", "Assimilação", cur(f, "e"), D.E)}</div>
    <div class="muted small" style="font-family:var(--f-mono)">Nível ${D.nivel} ${esc(SAUDE_NIVEIS[D.nivel] || "")} · D${D.D}/E${D.E} · Pressões ${D.pressoes}/10 · XP ${D.xp.saldo}</div>
    ${cs.length ? `<div class="conds">${cs.map(c => `<span class="tag red">${esc(c)}</span>`).join("")}</div>` : ""}
    <div class="row"><button class="btn sm" data-sopen="${esc(id)}">Abrir ficha</button><button class="btn sm" data-sperc="${esc(id)}" title="Rolagem secreta de Percepção">Percepção secreta</button><button class="btn sm ghost" data-sdano="${esc(id)}">Dano</button></div></div>`;
    })
    .join("");
  const peds = (S.pedidos || []).filter(x => S.fichas[x.fichaId]);
  const pedHTML = peds.length
    ? `<div class="banner info"><b>Pedidos de ficha:</b> ${peds.map(x => `${esc(x.quem || "Jogador")} pede <b>${esc(S.fichas[x.fichaId].nome)}</b> <button class="btn sm" data-sopen="${esc(x.fichaId)}">Ver</button>`).join(" · ")}</div>`
    : "";
  const backup = `<details class="box"><summary style="cursor:pointer"><b>Backup da mesa</b></summary><div class="stack" style="margin-top:10px"><p class="muted small" style="margin:0">Baixa um arquivo com tudo: fichas, NPCs, cenas, tokens, névoa, desenhos, homebrew, artes das Ameaças, anotações, Conflito, Refúgio e trilhas. Para restaurar, use "Restaurar mesa de um backup" na página inicial.</p><button class="btn" id="btnBkp">Baixar backup da mesa</button></div></details>`;
  // capa da mesa (mesa/capa) em cima; apagar mesa (mestre/gestao) embaixo
  return (
    escudoCapaHTML() +
    acessoHTML() +
    pedHTML +
    `<div class="shield">${cards || `<div class="empty">Nenhum Infectado na mesa ainda.</div>`}</div>
   <div class="row"><button class="btn sm" id="sXp">Dar Experiência a todos</button><button class="btn sm" id="sSessao">Nova sessão para todos</button><button class="btn sm ghost" id="sCena">Fim de cena para todos</button></div>
   <div class="sgrid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
    <div class="box stack"><h3>Anotações do mestre</h3><p class="muted small" style="margin:0">Só você vê. Ganchos, segredos, próximos passos.</p><textarea id="notasM" style="min-height:180px" aria-label="Anotações do mestre">${esc(S.notas)}</textarea><span class="muted small" id="notasSt"></span></div>
    <div class="box stack"><h3>Referência rápida</h3>
     <table class="t dtref"><thead><tr><th>Pressões mantidas</th><th>Consequência</th></tr></thead><tbody>${CONSEQ.slice(
       1
     )
       .map((n, i) => `<tr><td>${"C".repeat(i + 1)}</td><td style="font-family:var(--f-body)">${n}</td></tr>`)
       .join("")}</tbody></table>
     <p class="muted small" style="margin:0">Cada C mantida pode também tirar 1 ponto de Determinação ou baixar a Qualidade de um item usado. Ação Simples: A para a maioria das tarefas, AAA para as realmente difíceis. Experiência por sessão: 1 no mínimo; Propósito 2 a 4; Conflito 1 a 6 (quase sempre 1 ou 2); arco 2 a 6; descoberta 1 a 3; boa interpretação 1. Evite passar de 3 por sessão no começo.</p></div>
    <div class="box stack"><h3>Rolagens secretas</h3>
     <div class="row poolin">${[6, 10, 12].map(t => `<label class="pool d${t}"><span>d${t}</span><input type="number" min="0" max="20" value="${t === 10 ? 2 : 0}" id="sec${t}" aria-label="Quantos d${t}"></label>`).join("")}<button class="btn primary" id="secRoll">Rolar escondido</button></div>
     <div class="log">${S.secret.length ? S.secret.map(logRow).join("") : `<div class="empty">Rolagens que os jogadores não veem aparecem aqui (somem ao fechar a página).</div>`}</div></div>
   </div>
   ${backup}` +
    escudoApagarHTML()
  );
}
let notasT = null;
function bindEscudo() {
  bindEscudoCapa(); // mesa/capa
  bindEscudoApagar(); // mestre/gestao
  if (!S.isM) return;
  $$("[data-sb]").forEach(
    b =>
      (b.onclick = () => {
        const id = b.dataset.sb,
          k = b.dataset.k;
        const f = migrar(S.fichas[id]);
        const d = +b.dataset.d;
        if (k === "pv") {
          f.dano = Math.max(0, (+f.dano || 0) - d);
          if (d < 0) f.trat = 0;
        } else if (k === "san") {
          if (d < 0) {
            perderD(id, 1, "perdeu");
            return;
          }
          f.dGasto = Math.max(0, (+f.dGasto || 0) - 1);
        } else {
          f.eGasto = Math.max(0, Math.min(derivados(f).E, (+f.eGasto || 0) - d));
        }
        saveFicha(id);
        renderPanel();
        renderBoard();
      })
  );
  $$("[data-sopen]").forEach(
    b =>
      (b.onclick = () => {
        S.openFicha = b.dataset.sopen;
        openTool("agentes");
      })
  );
  $$("[data-sperc]").forEach(
    b =>
      (b.onclick = () => {
        const f = migrar(S.fichas[b.dataset.sperc]);
        const n = instTot(f, "Percepção");
        const r = rollPool({ d6: n });
        const best = melhorSel(r, 1, 1, "conflito", 0);
        const o = somaSim([...best].map(i => r[i]));
        logEntry({
          quem: f.nome,
          titulo: "Percepção (pedido do mestre)",
          total: o.a,
          det: `[[${o.a},${o.b},${o.c}]]${codDados(r, best)} só o Instinto`,
          secreto: true
        });
      })
  );
  $$("[data-sdano]").forEach(
    b =>
      (b.onclick = async () => {
        const r = await formBox(
          "Dano em " + S.fichas[b.dataset.sdano].nome,
          `<div class="field"><label class="label" for="sdQ">Pontos</label><input type="number" id="sdQ" name="q" min="1" max="99" value="1"></div>`,
          "Aplicar"
        );
        if (r) aplicarDano(b.dataset.sdano, Math.max(0, +r.q || 0));
      })
  );
  bindAcesso();
  {
    const bk = $("#btnBkp");
    if (bk) bk.onclick = exportarMesa;
  }
  const pcs = () => Object.keys(S.fichas).filter(id => !S.fichas[id].rapido && !S.fichas[id].npc);
  $("#sXp").onclick = async () => {
    const r = await formBox(
      "Experiência da sessão",
      `<div class="field"><label class="label" for="xpQ">Pontos para cada Infectado</label><input type="number" id="xpQ" name="q" min="1" max="20" value="1"></div>`,
      "Dar"
    );
    if (!r) return;
    const q = Math.max(0, +r.q || 0);
    pcs().forEach(id => {
      const f = migrar(S.fichas[id]);
      f.xp = (+f.xp || 0) + q;
      saveFicha(id, true);
    });
    renderPanel();
    logEntry({ quem: "Mestre", titulo: `+${q} de Experiência para todos`, tipo: "chat" });
  };
  $("#sSessao").onclick = () => {
    pcs().forEach(id => {
      const f = migrar(S.fichas[id]);
      f.origUso = { evento: false, ocupacao: false };
      saveFicha(id, true);
    });
    renderPanel();
    toast("Origens liberadas para todos.");
  };
  $("#sCena").onclick = () => {
    pcs().forEach(id => {
      const f = migrar(S.fichas[id]);
      f.eGasto = 0;
      saveFicha(id, true);
    });
    renderPanel();
    toast("Pontos de Assimilação recuperados.");
  };
  const ta = $("#notasM");
  ta.oninput = () => {
    S.notas = ta.value;
    $("#notasSt").textContent = "Salvando…";
    clearTimeout(notasT);
    notasT = setTimeout(async () => {
      try {
        await S.db.set(P() + "/mestre/notas", { texto: S.notas });
        $("#notasSt") && ($("#notasSt").textContent = "Salvo");
      } catch (e) {
        fail(e);
      }
    }, 800);
  };
  $("#secRoll").onclick = () => {
    const p = { d6: +$("#sec6").value || 0, d10: +$("#sec10").value || 0, d12: +$("#sec12").value || 0 };
    if (!poolValor(p)) return;
    rolarPoolLog("Mestre", `Secreta ${poolTxt(p)}`, p, "", { secreto: true });
  };
}
