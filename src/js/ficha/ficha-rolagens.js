"use strict";
/* Testes com os dados de símbolos: teste de Instinto + Aptidão, Teste de Assimilação e rolagens livres (mestre, Conflito, Ameaças). */

/* ===================== TESTES COM OS DADOS DE SÍMBOLOS =====================
   Instinto → d6 por ponto; Conhecimento/Prática → d10 por ponto. Mantém 1 dado (mais com Empenho,
   Origem ou Agir por Instinto). Agir por Instinto: 2 Instintos, todos os dados viram d12, +1 mantido. */
function melhorSel(dados, min, max, modo, penA) {
  const n = dados.length;
  if (!n) return new Set();
  min = Math.min(min, n);
  max = Math.min(max, n);
  let best = null,
    bs = -1e9;
  const idx = [...Array(n).keys()];
  const score = s => {
    let a = 0,
      b = 0,
      c = 0;
    s.forEach(i => {
      a += dados[i].s.a;
      b += dados[i].s.b;
      c += dados[i].s.c;
    });
    if (modo === "simples") {
      const can = Math.min(b, c);
      c -= can;
      b -= can;
      return Math.max(0, a - penA) * 10 - c * 4 + b;
    }
    return Math.max(0, a - penA) * 10 + b * 3 - c * 4;
  };
  const rec = (start, cur) => {
    if (cur.length >= min) {
      const v = score(cur) - cur.length * 0.01;
      if (v > bs) {
        bs = v;
        best = [...cur];
      }
    }
    if (cur.length === max) return;
    for (let i = start; i < n; i++) {
      cur.push(i);
      rec(i + 1, cur);
      cur.pop();
    }
  };
  if (n > 14) {
    const ord = idx.sort(
      (x, y) =>
        dados[y].s.a * 10 +
        dados[y].s.b * 2 -
        dados[y].s.c * 4 -
        (dados[x].s.a * 10 + dados[x].s.b * 2 - dados[x].s.c * 4)
    );
    return new Set(ord.slice(0, max));
  }
  rec(0, []);
  return new Set(best || []);
}
function efeitosDoTeste(f, inst, inst2, apt) {
  const alvo = t => t === inst || t === inst2 || t === apt;
  const M = mutsDe(f);
  const out = [];
  M.forEach(m => {
    if (!m.fx || !alvo(m.fx.t)) return;
    const op = m.fx.op;
    if (op === "addA") out.push({ id: m.n, txt: `${m.n}: +A`, tipo: "addA", on: true });
    if (op === "anulaC") out.push({ id: m.n, txt: `${m.n}: anula 1 C`, tipo: "anulaC", on: true });
    if (op === "bToA") out.push({ id: m.n, txt: `${m.n}: trocar os B por A`, tipo: "bToA", on: false });
    if (op === "eA") out.push({ id: m.n, txt: `${m.n}: gaste e por +A`, tipo: "eA", n: 0 });
  });
  return out;
}
function lembretes(f, inst, inst2, apt) {
  const chave = [inst, inst2, apt].filter(Boolean);
  const M = mutsDe(f).filter(m => !m.fx && chave.some(k => m.ef.includes(k)));
  const C = (f.carac || [])
    .map(n => CARACTERISTICAS.find(x => x[0] === n))
    .filter(c => c && chave.some(k => c[3].includes(k)));
  return [...M.map(m => `${m.n}: ${m.ef}`), ...C.map(c => `${c[0]}: ${c[3]}`)];
}

async function abrirTeste(fid, pre = {}) {
  const f = S.fichas[fid];
  if (!f) return;
  migrar(f);
  const ed = canEditFicha(f);
  if (!ed) {
    toast("Só o dono da ficha (ou o mestre) rola por ela.");
    return;
  }
  const R = {
    inst: pre.inst || (pre.apt ? "Sagacidade" : "Percepção"),
    apt: pre.apt || "",
    inst2: "Potência",
    modo: S.combate && S.combate.ativo ? "conflito" : "simples",
    instinto: false,
    pagar: cur(f, "e") > 0 ? "e" : "d",
    empenho: false,
    oEv: false,
    oOc: false,
    persev: false,
    fase: "monta",
    dados: [],
    sel: new Set(),
    efs: [],
    penB: false,
    titulo: pre.titulo || ""
  };
  if (pre.apt && !pre.inst) {
    const sug = {
      Biologia: "Sagacidade",
      Erudição: "Sagacidade",
      Engenharia: "Sagacidade",
      Geografia: "Sagacidade",
      Medicina: "Sagacidade",
      Segurança: "Percepção",
      Armas: "Reação",
      Atletismo: "Potência",
      Expressão: "Influência",
      Furtividade: "Reação",
      Manufaturas: "Sagacidade",
      Sobrevivência: "Percepção"
    };
    R.inst = sug[pre.apt] || "Sagacidade";
  }
  const h = $("#modalHost");
  const calc = () => {
    const D = derivados(f);
    let n6 = instTot(f, R.inst),
      n10 = R.apt ? aptTot(f, R.apt) : 0,
      n12 = 0;
    const notas = [];
    if (R.instinto) {
      n12 = instTot(f, R.inst) + instTot(f, R.inst2);
      n6 = 0;
      n10 = 0;
    } else {
      if (fxDe(f, "conv").some(m => m.fx.t === R.inst)) {
        n10 += n6;
        notas.push(`${fxDe(f, "conv").find(m => m.fx.t === R.inst).n}: d6 viram d10`);
        n6 = 0;
      }
      if (R.apt === "Furtividade" && temMut(f, "Camuflagem")) {
        n12 += aptTot(f, "Furtividade");
        n10 -= aptTot(f, "Furtividade");
        notas.push("Camuflagem: Furtividade em d12");
      }
    }
    if (R.oEv && temCarac(f, "Antecedente Marcante")) {
      n10 += 1;
      notas.push("Antecedente Marcante: +1 d10");
    }
    let K = 1 + (R.empenho ? 1 : 0) + (R.instinto ? 1 : 0);
    fxDe(f, "keep").forEach(m => {
      if (m.fx.t === R.inst || m.fx.t === R.apt || (R.instinto && m.fx.t === R.inst2)) {
        K++;
        notas.push(`${m.n}: +1 mantido`);
      }
    });
    let enfMenos = 0;
    (f.enf || []).forEach(e => {
      if (e.inst === R.inst || (R.instinto && e.inst === R.inst2)) {
        enfMenos += e.int === "Severa" ? 2 : 1;
        notas.push(`${e.nome}: −${e.int === "Severa" ? 2 : 1} mantido`);
      }
    });
    K = Math.max(1, K - enfMenos);
    const Kmax = K + (R.oEv ? 1 : 0) + (R.oOc ? 1 : 0);
    const nivel = D.nivel;
    let penA = saudePen(nivel);
    let custoD = 0,
      custoE = 0;
    if (R.empenho) custoD++;
    if (R.instinto) {
      if (R.pagar === "e") custoE++;
      else custoD += 2;
    }
    if (nivel <= 2 && nivel > 0) {
      custoD++;
      notas.push(
        nivel === 1 ? "Incapacitação: 1 d para agir (e BB para ter sucesso)" : "Debilitação: 1 d para agir"
      );
    }
    if (R.persev && nivel >= 3 && nivel <= 4) {
      custoD++;
      penA = 0;
    }
    if (nivel >= 3 && nivel <= 4 && temMut(f, "Resistente") && nivel === 4) {
      penA = 0;
      notas.push("Regenerativa (Resistente): ignora a Laceração");
    }
    return { n6, n10, n12, K, Kmax, penA, custoD, custoE, notas, nivel };
  };
  const fim = () => {
    const c = calc();
    const sel = [...R.sel].map(i => R.dados[i]);
    let o = somaSim(sel);
    const det = [];
    R.efs.forEach(e => {
      if (e.tipo === "addA" && e.on) {
        o.a++;
        det.push(e.id);
      }
      if (e.tipo === "anulaC" && e.on && o.c > 0) {
        o.c--;
        det.push(e.id);
      }
    });
    R.efs.forEach(e => {
      if (e.tipo === "bToA" && e.on && o.b) {
        o.a += o.b;
        o.b = 0;
        det.push(e.id);
      }
      if (e.tipo === "eA" && e.n) {
        o.a += e.n;
        det.push(`${e.id} ×${e.n}`);
      }
    });
    let pen = c.penA;
    if (pen) {
      if (R.penB) {
        const need = c.nivel === 1 ? 2 : 1;
        if (o.b >= need) {
          o.b -= need;
          pen = 0;
          det.push(`${need} B ignoram a penalidade de Saúde`);
        }
      }
      if (pen) {
        const tira = Math.min(o.a, pen);
        o.a -= tira;
        det.push(`Saúde: −${pen} A`);
      }
    }
    let canc = 0;
    if (R.modo === "simples" && !R.instinto) {
      canc = Math.min(o.b, o.c);
      o.b -= canc;
      o.c -= canc;
      if (canc) det.push(`${canc} B evitaram ${canc} C`);
    }
    return { o, det, c };
  };
  const confirmar = () => {
    if (R.fase !== "escolhe" || R.feito) return;
    R.feito = true;
    const { o, det } = fim();
    const ePago = R.efs.filter(e => e.tipo === "eA").reduce((s, e) => s + e.n, 0);
    if (ePago) {
      f.eGasto = Math.min(derivados(f).E, (+f.eGasto || 0) + ePago);
      saveFicha(fid, true);
    }
    const tit =
      R.titulo ||
      (R.instinto ? `Age por Instinto: ${R.inst} + ${R.inst2}` : `${R.inst}${R.apt ? " + " + R.apt : ""}`);
    const extra = [
      R.modo === "conflito" ? "Conflito" : "Ação simples",
      ...R.notasRol,
      ...det,
      o.c ? conseqTxt(o.c) : ""
    ]
      .filter(Boolean)
      .join(" · ");
    logEntry({
      quem: f.nome,
      titulo: tit,
      total: o.a,
      det: `[[${o.a},${o.b},${o.c}]]${codDados(R.dados, R.sel)} ${extra}`,
      flag: o.a >= 3 ? "crit" : !o.a && o.c ? "fail" : "",
      para: S.paraRolagem || ""
    });
    h.innerHTML = "";
    renderPanel();
  };
  const render = () => {
    const c = calc();
    const ev = f.origUso || {};
    if (R.fase === "monta") {
      h.innerHTML = `<div class="modal-back"><div class="modal wide rolar" role="dialog" aria-label="Teste"><div class="row between"><h3 style="margin:0">Teste · ${esc(f.nome)}</h3><button type="button" class="x" id="rlX" aria-label="Fechar">✕</button></div>
        <div class="fields"><div class="field"><label class="label" for="rlI">Instinto (d6)</label><select id="rlI">${INSTINTOS.map(k => `<option ${k === R.inst ? "selected" : ""}>${k}</option>`).join("")}</select></div>
         <div class="field"><label class="label" for="rlA">Conhecimento ou Prática (d10)</label><select id="rlA" ${R.instinto ? "disabled" : ""}><option value="">Nenhum</option><optgroup label="Conhecimentos">${CONHECIMENTOS.map(k => `<option ${k === R.apt ? "selected" : ""}>${k}</option>`).join("")}</optgroup><optgroup label="Práticas">${PRATICAS.map(k => `<option ${k === R.apt ? "selected" : ""}>${k}</option>`).join("")}</optgroup></select></div></div>
        <div class="row"><label class="check"><input type="radio" name="rlM" value="simples" ${R.modo === "simples" ? "checked" : ""}> Ação Simples</label><label class="check"><input type="radio" name="rlM" value="conflito" ${R.modo === "conflito" ? "checked" : ""}> Ação em Conflito</label></div>
        <div class="opts">
         <label class="check"><input type="checkbox" id="rlIns" ${R.instinto ? "checked" : ""}> <span><b>Agir por Instinto</b> (Rolagem Assimilada): troca o Conhecimento/Prática por outro Instinto, todos os dados viram d12 e mantém +1. Custa 1 e (ou 2 d).</span></label>
         ${R.instinto ? `<div class="row" style="padding-left:24px;flex-wrap:nowrap"><select id="rlI2" style="max-width:180px">${INSTINTOS.map(k => `<option ${k === R.inst2 ? "selected" : ""}>${k}</option>`).join("")}</select><select id="rlPg" style="max-width:150px"><option value="e" ${R.pagar === "e" ? "selected" : ""}>pagar 1 e</option><option value="d" ${R.pagar === "d" ? "selected" : ""} ${f.susc ? "disabled" : ""}>pagar 2 d</option></select></div>` : ""}
         <label class="check"><input type="checkbox" id="rlEmp" ${R.empenho ? "checked" : ""} ${f.susc ? "disabled" : ""}> <span><b>Empenho</b>: gaste 1 d para manter +1 dado (uma vez por rodada)</span></label>
         <label class="check"><input type="checkbox" id="rlOE" ${R.oEv ? "checked" : ""} ${ev.evento ? "disabled" : ""}> <span><b>Evento Marcante</b>${f.evento ? `: ${esc(f.evento)}` : ""} ${ev.evento ? "(já usado nesta sessão)" : "(mantém +1 dado, pode descartar)"}</span></label>
         <label class="check"><input type="checkbox" id="rlOO" ${R.oOc ? "checked" : ""} ${ev.ocupacao ? "disabled" : ""}> <span><b>Ocupação</b>${f.ocupacao ? `: ${esc(f.ocupacao)}` : ""} ${ev.ocupacao ? "(já usada nesta sessão)" : "(mantém +1 dado, pode descartar)"}</span></label>
         ${c.nivel >= 3 && c.nivel <= 4 ? `<label class="check"><input type="checkbox" id="rlPer" ${R.persev ? "checked" : ""} ${f.susc ? "disabled" : ""}> <span><b>Perseverança</b>: 1 d para ignorar a penalidade de ${SAUDE_NIVEIS[c.nivel]} (−A)</span></label>` : ""}
        </div>
        ${c.notas.length ? `<div class="muted small">${c.notas.map(esc).join(" · ")}</div>` : ""}
        ${
          lembretes(f, R.inst, R.instinto ? R.inst2 : "", R.instinto ? "" : R.apt).length
            ? `<details class="more"><summary>Assimilações e Características que podem valer aqui</summary><ul class="small" style="margin:6px 0 0;padding-left:18px">${lembretes(
                f,
                R.inst,
                R.instinto ? R.inst2 : "",
                R.instinto ? "" : R.apt
              )
                .map(t => `<li>${esc(t)}</li>`)
                .join("")}</ul></details>`
            : ""
        }
        <div class="rsum"><span>Rola <b>${poolTxt({ d6: c.n6, d10: c.n10, d12: c.n12 })}</b> · mantém <b>${c.K}</b>${c.Kmax > c.K ? ` (até ${c.Kmax})` : ""}</span>${c.penA ? `<span class="tag red">Saúde: −${"A".repeat(c.penA)}</span>` : ""}${c.custoD || c.custoE ? `<span class="tag">custo: ${c.custoD ? c.custoD + " d" : ""}${c.custoD && c.custoE ? " + " : ""}${c.custoE ? c.custoE + " e" : ""}</span>` : ""}</div>
        <div class="row" style="justify-content:flex-end"><button type="button" class="btn" id="rlC">Cancelar</button><button type="button" class="btn primary" id="rlGo">Rolar</button></div></div></div>`;
      const up = () => render();
      $("#rlX").onclick = $("#rlC").onclick = () => {
        h.innerHTML = "";
      };
      $("#rlI").onchange = e => {
        R.inst = e.target.value;
        up();
      };
      const ra = $("#rlA");
      ra.onchange = e => {
        R.apt = e.target.value;
        up();
      };
      $$('[name="rlM"]').forEach(
        x =>
          (x.onchange = () => {
            R.modo = x.value;
            up();
          })
      );
      $("#rlIns").onchange = e => {
        R.instinto = e.target.checked;
        if (R.inst2 === R.inst) R.inst2 = INSTINTOS.find(k => k !== R.inst);
        up();
      };
      const i2 = $("#rlI2");
      if (i2)
        i2.onchange = e => {
          R.inst2 = e.target.value;
          up();
        };
      const pg = $("#rlPg");
      if (pg)
        pg.onchange = e => {
          R.pagar = e.target.value;
          up();
        };
      $("#rlEmp").onchange = e => {
        R.empenho = e.target.checked;
        up();
      };
      $("#rlOE").onchange = e => {
        R.oEv = e.target.checked;
        up();
      };
      $("#rlOO").onchange = e => {
        R.oOc = e.target.checked;
        up();
      };
      const pe = $("#rlPer");
      if (pe)
        pe.onchange = e => {
          R.persev = e.target.checked;
          up();
        };
      $("#rlGo").onclick = () => {
        const c = calc();
        if (c.nivel <= 0) {
          toast("Sem pontos de Saúde.");
          return;
        }
        if (c.custoD && f.susc) {
          toast("Estado Suscetível: não pode gastar Determinação.");
          return;
        }
        if (c.custoD > cur(f, "d")) {
          toast(`Precisa de ${c.custoD} d e só tem ${cur(f, "d")}.`);
          return;
        }
        if (c.custoE > cur(f, "e")) {
          toast("Sem pontos de Assimilação: pague com 2 d.");
          return;
        }
        if (c.n6 + c.n10 + c.n12 <= 0) {
          toast("Nenhum dado para rolar.");
          return;
        }
        f.dGasto = (+f.dGasto || 0) + c.custoD;
        f.eGasto = (+f.eGasto || 0) + c.custoE;
        if (c.custoD && cur(f, "d") <= 0) {
          f.susc = true;
          toast(`${f.nome} entrou em Estado Suscetível.`);
        }
        if (R.oEv || R.oOc) {
          f.origUso = f.origUso || {};
          if (R.oEv) f.origUso.evento = true;
          if (R.oOc) f.origUso.ocupacao = true;
        }
        saveFicha(fid, true);
        R.notasRol = [
          R.empenho ? "Empenho (1 d)" : "",
          R.instinto ? `Rolagem Assimilada (${R.pagar === "e" ? "1 e" : "2 d"})` : "",
          R.oEv ? "Evento Marcante" : "",
          R.oOc ? "Ocupação" : "",
          R.persev ? "Perseverança (1 d)" : "",
          ...c.notas
        ].filter(Boolean);
        R.dados = rollPool({ d6: c.n6, d10: c.n10, d12: c.n12 });
        R.K = c.K;
        R.Kmax = c.Kmax;
        R.penA = c.penA;
        R.sel = melhorSel(R.dados, c.K, c.Kmax, R.modo, c.penA);
        R.efs = efeitosDoTeste(f, R.inst, R.instinto ? R.inst2 : "", R.instinto ? "" : R.apt);
        R.fase = "escolhe";
        render();
      };
      return;
    }
    // escolher os dados mantidos
    const { o, det } = fim();
    h.innerHTML = `<div class="modal-back"><div class="modal wide rolar" role="dialog" aria-label="Escolher dados"><div class="row between"><h3 style="margin:0">${esc(R.instinto ? `Instinto: ${R.inst} + ${R.inst2}` : `${R.inst}${R.apt ? " + " + R.apt : ""}`)}</h3><span class="muted small">${R.modo === "conflito" ? "Conflito" : "Ação simples"}</span></div>
      <p class="muted small" style="margin:0">Toque nos dados para escolher quais manter: <b>${R.sel.size}</b> de ${R.K}${R.Kmax > R.K ? ` (até ${R.Kmax}; o dado da Origem pode ser descartado)` : ""}.</p>
      <div class="dice">${R.dados.map((x, i) => dieHTML(x.t, x.f, i, R.sel.has(i))).join("")}</div>
      ${
        R.efs.length || R.penA
          ? `<div class="opts">${R.efs.map((e, i) => (e.tipo === "eA" ? `<div class="row small" style="gap:6px">${esc(e.txt)} <span class="pmr"><button type="button" data-ea="${i}" data-d="-1">−</button><button type="button" data-ea="${i}" data-d="1">+</button></span><b class="mono">${e.n} e</b></div>` : `<label class="check small"><input type="checkbox" data-ef="${i}" ${e.on ? "checked" : ""}> ${esc(e.txt)}</label>`)).join("")}
        ${R.penA ? `<label class="check small"><input type="checkbox" id="rlPB" ${R.penB ? "checked" : ""}> Gastar ${derivados(f).nivel === 1 ? "BB" : "B"} para ignorar a penalidade de Saúde (−${"A".repeat(R.penA)})</label>` : ""}</div>`
          : ""
      }
      <div class="rres"><span class="label">Resultado</span>${symChips(o, "nenhum símbolo")}${o.c ? `<span class="tag red">${esc(conseqTxt(o.c))}</span>` : ""}</div>
      ${det.length ? `<div class="muted small">${det.map(esc).join(" · ")}</div>` : ""}
      <p class="muted small" style="margin:0">${R.modo === "conflito" ? "Em Conflito: A vão para Objetivos; B podem mudar a ação, ajudar (B vira A de um aliado), apoiar (evita C de um aliado), transferir A entre Objetivos ou ignorar penalidade; C o Assimilador usa contra vocês." : "Em Ação Simples: cada B já evitou uma C. Cada A a mais melhora o resultado."}</p>
      <div class="row" style="justify-content:flex-end"><button type="button" class="btn sm ghost" id="rlBest">Melhor escolha</button><button type="button" class="btn primary" id="rlOk">Mostrar para a mesa</button></div></div></div>`;
    $$("[data-di]").forEach(
      b =>
        (b.onclick = () => {
          const i = +b.dataset.di;
          if (R.sel.has(i)) R.sel.delete(i);
          else {
            if (R.sel.size >= R.Kmax) {
              toast(`Pode manter até ${R.Kmax}.`);
              return;
            }
            R.sel.add(i);
          }
          render();
        })
    );
    $$("[data-ef]").forEach(
      c =>
        (c.onchange = () => {
          R.efs[+c.dataset.ef].on = c.checked;
          render();
        })
    );
    $$("[data-ea]").forEach(
      b =>
        (b.onclick = () => {
          const e = R.efs[+b.dataset.ea];
          const livre = cur(f, "e") - R.efs.filter(x => x.tipo === "eA").reduce((s, x) => s + x.n, 0);
          e.n = Math.max(0, e.n + +b.dataset.d);
          if (+b.dataset.d > 0 && livre <= 0) {
            e.n--;
            toast("Sem pontos de Assimilação.");
          }
          render();
        })
    );
    const pb = $("#rlPB");
    if (pb)
      pb.onchange = () => {
        R.penB = pb.checked;
        render();
      };
    $("#rlBest").onclick = () => {
      R.sel = melhorSel(R.dados, R.K, R.Kmax, R.modo, R.penA);
      render();
    };
    $("#rlOk").onclick = () => {
      const min = Math.min(R.K, R.dados.length);
      if (R.sel.size < min) {
        toast(`Mantenha pelo menos ${min} dado(s).`);
        return;
      }
      confirmar();
    };
    $(".modal-back").onclick = e => {
      if (e.target.classList.contains("modal-back")) {
        const min = Math.min(R.K, R.dados.length);
        if (R.sel.size >= min) confirmar();
      }
    };
  };
  render();
}

/* ---------- Teste de Assimilação ---------- */
async function testeAssimilacao(fid, auto) {
  const f = S.fichas[fid];
  if (!f) return;
  migrar(f);
  if (!canEditFicha(f)) {
    toast("Só o dono da ficha (ou o mestre) faz este teste.");
    return;
  }
  const D = derivados(f);
  if (
    !(await confirmBox(
      `Teste de Assimilação · ${f.nome}`,
      `${auto ? "Perdeu um Nível de Determinação. " : ""}Rola 1 d10 + ${D.E} d12 (um por Nível de Assimilação) e mantém tudo. Pressões já acumuladas em Inoportunas: ${D.pressoes}/10.`,
      "Rolar"
    ))
  )
    return;
  const dados = rollPool({ d10: 1, d12: D.E });
  const o = somaSim(dados);
  const tot = D.pressoes + o.c;
  const all = new Set(dados.map((x, i) => i));
  const p = f.assimPend && !f.assimPend.cartas ? f.assimPend : { a: 0, b: 0, c: 0, cartas: null, sel: [] };
  p.a += o.a;
  p.b += o.b;
  p.c += o.c;
  f.assimPend = p;
  if (tot >= 10) f.tomado = true;
  saveFicha(fid, true);
  renderPanel();
  logEntry({
    quem: f.nome,
    titulo: "Teste de Assimilação",
    total: o.a,
    det: `[[${o.a},${o.b},${o.c}]]${codDados(dados, all)} ${tot >= 10 ? "10 Pressões: tomado pela Assimilação!" : `Pressões: ${D.pressoes} + ${o.c} = ${tot}/10. Cartas no próximo repouso.`}`,
    flag: tot >= 10 ? "fail" : "",
    para: S.paraRolagem || ""
  });
  const h = $("#modalHost");
  h.innerHTML = `<div class="modal-back"><div class="modal" role="dialog"><h3 style="margin:0">Teste de Assimilação</h3><div class="dice">${dados.map(x => dieHTML(x.t, x.f, null, true)).join("")}</div>
    <div class="rres">${symChips(o, "nada")}</div>
    <p class="muted small" style="margin:0">${tot >= 10 ? `<b style="color:var(--red-hi)">As Pressões chegaram a ${tot}: o Infectado perde a consciência para sempre e passa ao Assimilador.</b>` : `No próximo repouso: ${o.a} carta(s) Evolutiva(s), ${o.b} Adaptativa(s) e ${o.c} Inoportuna(s). Abra a aba <b>Assimilação</b> da ficha.`}</p>
    <div class="row" style="justify-content:flex-end"><button class="btn primary" id="taOk">Ok</button></div></div></div>`;
  $("#taOk").onclick = () => {
    h.innerHTML = "";
    S.sheetTab = "assimilacao";
    renderPanel();
  };
}

/* ---------- rolagem livre de dados (mestre, Conflito, Ameaças) ---------- */
function rolarPoolLog(quem, titulo, pool, extra = "", opt = {}) {
  const dados = rollPool(pool);
  const o = somaSim(dados);
  const all = new Set(dados.map((x, i) => i));
  logEntry({
    quem,
    titulo,
    total: o.a,
    det: `[[${o.a},${o.b},${o.c}]]${codDados(dados, all)} ${extra}`.trim(),
    secreto: !!opt.secreto,
    para: opt.para || ""
  });
  return { dados, o };
}
function rolarDanoLog(quem, n, t = 10, opt = {}) {
  const r = rolarDano(n, t);
  const all = new Set(r.dados.map((x, i) => i));
  logEntry({
    quem,
    titulo: `Dano ${n}d${t}`,
    total: r.total,
    det: `${codDados(r.dados, all)} cada símbolo é 1 ponto de dano`,
    flag: "",
    secreto: !!opt.secreto,
    para: opt.para || ""
  });
  return r;
}
