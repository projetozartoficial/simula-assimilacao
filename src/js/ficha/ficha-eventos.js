"use strict";
/* Ficha do Infectado: o que cada botão e campo faz, e as regras de Determinação, Saúde e tempo. */
/* Nome comprido não cabe no campo do celular: diminui a letra até caber (mínimo 15px). */
function ajustarFonteNome(el) {
  if (!el) return;
  el.style.fontSize = "";
  let fs = parseFloat(getComputedStyle(el).fontSize) || 26;
  while (el.scrollWidth > el.clientWidth + 1 && fs > 15) {
    fs -= 1;
    el.style.fontSize = fs + "px";
  }
}
/* Liga os botões da ficha aberta. As partes especiais ficam nos arquivos delas. */
function bindSheet() {
  const id = S.openFicha;
  const f = S.fichas[id];
  if (f && f.rapido)
    bindNpcRapido(id, f); // Ameaça ou NPC de ficha rápida (ficha/npcs)
  else bindFichaCompleta();
  if (S.solo)
    $$("[data-back]").forEach(b => (b.onclick = soloFechar)); // personagem fora de mesa (mesa/personagens)
  else bindFichaAcoes(f, id); // menu Opções: duplicar, dar, retirar, virar NPC (mestre/gestao)
}
/* ---------- ficha: eventos ---------- */
function bindFichaCompleta() {
  {
    const nm = $("#s_nome");
    if (nm) {
      requestAnimationFrame(() => ajustarFonteNome(nm));
      nm.addEventListener("input", () => ajustarFonteNome(nm));
    }
  }
  $$("[data-back]").forEach(
    b =>
      (b.onclick = () => {
        S.openFicha = null;
        renderPanel();
      })
  );
  $$("[data-stab]").forEach(
    b =>
      (b.onclick = () => {
        S.sheetTab = b.dataset.stab;
        renderPanel();
        $("#pbody").scrollTop = 0;
      })
  );
  const id = S.openFicha;
  const f = fA();
  if (!f) return;
  const on = (sel, fn, ev = "onclick") => {
    const e = $(sel);
    if (e) e[ev] = fn;
  };
  on("#btnTeste", () => abrirTeste(id, {}));
  on("#btnAssimTeste", () => testeAssimilacao(id));
  $$("[data-rti]").forEach(b => (b.onclick = () => abrirTeste(id, { inst: b.dataset.rti })));
  $$("[data-rta]").forEach(b => (b.onclick = () => abrirTeste(id, { apt: b.dataset.rta })));
  const bc = $("#btnClaim");
  if (bc)
    bc.onclick = async () => {
      const r = await formBox(
        "Pedir a ficha " + f.nome,
        `<div class="field"><label class="label" for="clQuem">Seu nome (para o mestre saber quem é)</label><input type="text" id="clQuem" name="quem" maxlength="40" value="${esc(f.jogador || "")}" required></div>`,
        "Enviar pedido"
      );
      if (!r) return;
      try {
        await S.db.set(P() + "/pedidos/" + S.uid, {
          fichaId: id,
          nome: f.nome,
          quem: r.quem.trim(),
          ts: Date.now()
        });
        toast("Pedido enviado ao mestre.");
      } catch (e) {
        fail(e);
      }
    };
  $$("[data-aprova]").forEach(
    b =>
      (b.onclick = async () => {
        const uid = b.dataset.aprova;
        const pd = (S.pedidos || []).find(x => x.id === uid);
        if (!pd) return;
        if (
          !(await confirmBox(
            "Dar a ficha para " + (pd.quem || "este jogador") + "?",
            "A ficha passa a ser dele. Quem era o dono antes perde a edição.",
            "Dar a ficha"
          ))
        )
          return;
        try {
          f.dono = uid;
          await S.db.merge(P() + "/fichas/" + id, { dono: uid });
          await S.db.del(P() + "/pedidos/" + uid);
          (S.tokens || [])
            .filter(t => t.fichaId === id)
            .forEach(t => S.db.merge(P() + "/tokens/" + t.id, { dono: uid }).catch(() => {}));
          toast("Ficha transferida.");
        } catch (e) {
          fail(e);
        }
      })
  );
  $$("[data-recusa]").forEach(
    b => (b.onclick = () => S.db.del(P() + "/pedidos/" + b.dataset.recusa).catch(fail))
  );
  if (!canEditFicha(f)) return;
  const sv = now => {
    saveFicha(id, now);
  };
  const rr = () => {
    renderPanel();
  };
  $$("#pbody [data-f]").forEach(el => {
    const k = el.dataset.f;
    el.oninput = () => {
      f[k] = el.value;
      sv();
    };
    if (k === "ocupacao" || k === "nome") el.onchange = () => renderBoard();
  });
  $$("#pbody [data-fn]").forEach(
    el =>
      (el.onchange = () => {
        f[el.dataset.fn] = +el.value || 0;
        sv();
        rr();
      })
  );
  on("#foto", async () => {
    const file = await pickImage();
    if (!file) return;
    const url = await cropImage(file, {
      size: 300,
      ratio: 4 / 3,
      radius: 0.06,
      type: "image/jpeg",
      title: "Ajustar a arte do Infectado"
    });
    if (!url) return;
    f.foto = url;
    sv(true);
    rr();
    renderBoard();
  });
  {
    const nv = $("#npcVis");
    if (nv)
      nv.onchange = () => {
        f.visivel = nv.checked;
        sv(true);
        toast(nv.checked ? "Os jogadores agora veem esta ficha." : "Ficha escondida dos jogadores.");
      };
  }
  on("#btnBaixar", () => exportarFicha(id));
  on("#btnGuardarConta", () => soloGuardarCopia(id)); // cópia em Meus personagens (mesa/personagens)
  $$("[data-fotoest]").forEach(
    b =>
      (b.onclick = async () => {
        const file = await pickImage();
        if (!file) return;
        const url = await cropImage(file, {
          size: 300,
          ratio: 4 / 3,
          radius: 0.06,
          type: "image/jpeg",
          title: "Ajustar a foto"
        });
        if (!url) return;
        f.fotos = { ...(f.fotos || {}), [b.dataset.fotoest]: url };
        sv(true);
        rr();
        renderBoard();
      })
  );
  $$("[data-fotoestx]").forEach(
    b =>
      (b.onclick = () => {
        const fs = { ...(f.fotos || {}) };
        delete fs[b.dataset.fotoestx];
        f.fotos = fs;
        sv(true);
        rr();
        renderBoard();
      })
  );
  // origens e propósitos
  $$("[data-uso]").forEach(
    c =>
      (c.onchange = () => {
        f.origUso = f.origUso || {};
        f.origUso[c.dataset.uso] = c.checked;
        sv();
      })
  );
  $$("[data-pp]").forEach(
    i =>
      (i.oninput = () => {
        f.propP[+i.dataset.pp].t = i.value;
        sv();
      })
  );
  $$("[data-ppok]").forEach(
    c =>
      (c.onchange = () => {
        f.propP[+c.dataset.ppok].ok = c.checked;
        sv();
        if (c.checked) toast("Propósito alcançado: momento de Clareza de Propósito.");
      })
  );
  $$("[data-pc]").forEach(
    i =>
      (i.oninput = () => {
        f.propC[+i.dataset.pc].t = i.value;
        sv();
      })
  );
  $$("[data-pcin]").forEach(
    c =>
      (c.onchange = () => {
        f.propC[+c.dataset.pcin].inerte = c.checked;
        sv();
      })
  );
  on("#btnClareza", () => clareza(id));
  // cabo de guerra
  $$("[data-dpt]").forEach(
    b =>
      (b.onclick = () => {
        const k = b.dataset.dpt;
        if (k === "rec") {
          f.dGasto = Math.max(0, (+f.dGasto || 0) - 1);
          sv();
          rr();
          return;
        }
        perderD(id, 1, k === "gasta" ? "gastou" : "perdeu");
      })
  );
  $$("[data-ept]").forEach(
    b =>
      (b.onclick = () => {
        if (b.dataset.ept === "rec") {
          f.eGasto = Math.max(0, (+f.eGasto || 0) - 1);
          sv();
          rr();
          return;
        }
        if (cur(f, "e") > 0) {
          f.eGasto = (+f.eGasto || 0) + 1;
          sv();
          rr();
        } else if (!f.susc && cur(f, "d") >= 2) {
          perderD(id, 2, "gastou (no lugar de 1 e)");
        } else toast("Sem pontos de Assimilação (e sem 2 d para pagar).");
      })
  );
  $$("[data-dnivel]").forEach(
    b =>
      (b.onclick = () => {
        f.D = Math.max(0, Math.min(10, (+f.D || 0) + +b.dataset.d));
        const D = derivados(f);
        f.dGasto = Math.min(+f.dGasto || 0, D.D);
        f.eGasto = Math.min(+f.eGasto || 0, D.E);
        sv();
        rr();
      })
  );
  // saúde
  $$("[data-dano]").forEach(
    b =>
      (b.onclick = () => {
        const v = +b.dataset.dano;
        const old = +f.dano || 0;
        f.dano = old === v ? v - 1 : v;
        if (f.dano > old) f.trat = 0;
        sv();
        rr();
        renderBoard();
      })
  );
  on("#sDano", async () => {
    const r = await formBox(
      "Sofrer dano",
      `<div class="field"><label class="label" for="dnQ">Pontos de dano</label><input type="number" id="dnQ" name="q" min="1" max="99" value="1" required></div><p class="muted small" style="margin:0">Rolagens de dano usam d10: cada símbolo é 1 ponto.</p>`,
      "Aplicar"
    );
    if (!r) return;
    aplicarDano(id, Math.max(0, +r.q || 0));
  });
  on("#sCura", async () => {
    const r = await formBox(
      "Recuperar pontos de Saúde",
      `<div class="field"><label class="label" for="cuQ">Pontos</label><input type="number" id="cuQ" name="q" min="1" max="99" value="${instTot(f, "Potência") + 1}" required></div><p class="muted small" style="margin:0">Uma Recuperação regenera Potência + 1 (${instTot(f, "Potência") + 1}).</p>`,
      "Recuperar"
    );
    if (!r) return;
    f.dano = Math.max(0, (+f.dano || 0) - Math.max(0, +r.q || 0));
    sv(true);
    rr();
    renderBoard();
  });
  on("#sTrat", async () => {
    const r = await formBox(
      "Tratamento médico",
      `<p class="muted small" style="margin:0">Quem trata rola o Instinto adequado + Medicina. Cada A sobe uma categoria do Tempo de Recuperação; cada C desce uma. Vale até a cura ou até sofrer novo dano.</p>
    <div class="row" style="flex-wrap:nowrap"><div class="field"><label class="label" for="trA">A mantidos</label><input type="number" id="trA" name="a" min="0" max="12" value="${Math.max(0, +f.trat || 0)}"></div><div class="field"><label class="label" for="trC">C mantidas</label><input type="number" id="trC" name="c" min="0" max="12" value="0"></div></div>`,
      "Aplicar"
    );
    if (!r) return;
    f.trat = (+r.a || 0) - (+r.c || 0);
    sv(true);
    rr();
    logEntry({
      quem: f.nome,
      titulo: "Tratamento médico",
      total: null,
      det: `${f.trat >= 0 ? "+" : ""}${f.trat} categoria(s): recuperação ${saudeRecTxt(derivados(f).nivelRec)}`
    });
  });
  // condições
  on("#condAdd", async () => {
    const r = await formBox(
      "Nova condição",
      `<div class="field"><span class="label">Tipo</span><label class="check"><input type="radio" name="t" value="enf" checked> Enfermidade (doença que afeta um Instinto)</label><label class="check"><input type="radio" name="t" value="livre"> Outra (anotação livre)</label></div>
    <div class="field"><label class="label" for="cnN">Nome</label><input type="text" id="cnN" name="nome" maxlength="40" placeholder="Ex.: Fraqueza Muscular"></div>
    <div class="row" style="flex-wrap:nowrap"><div class="field"><label class="label" for="cnI">Instinto</label><select id="cnI" name="inst">${INSTINTOS.map(k => `<option>${k}</option>`).join("")}</select></div><div class="field"><label class="label" for="cnT">Intensidade</label><select id="cnT" name="int"><option>Fraca</option><option>Mediana</option><option>Severa</option></select></div></div>
    <p class="muted small" style="margin:0">Enfermidade Fraca ou Mediana tira 1 dado mantido nos testes com o Instinto; Severa tira 2.</p>`,
      "Adicionar"
    );
    if (!r) return;
    if (r.t === "enf") {
      f.enf = [...(f.enf || []), { nome: r.nome.trim() || "Enfermidade", inst: r.inst, int: r.int }];
    } else {
      if (!r.nome.trim()) return;
      f.cond = [...new Set([...(f.cond || []), r.nome.trim()])];
    }
    sv(true);
    rr();
    renderBoard();
  });
  $$("[data-uncond]").forEach(
    b =>
      (b.onclick = () => {
        f.cond.splice(+b.dataset.uncond, 1);
        sv(true);
        rr();
      })
  );
  $$("[data-unenf]").forEach(
    b =>
      (b.onclick = () => {
        f.enf.splice(+b.dataset.unenf, 1);
        sv(true);
        rr();
      })
  );
  // tempo
  on("#tFimCena", () => {
    f.eGasto = 0;
    sv(true);
    rr();
    toast("Pontos de Assimilação recuperados.");
  });
  on("#tRepouso", () => repouso(id, "completo"));
  on("#tSemana", () => repouso(id, "semana"));
  on("#tSessao", () => {
    f.origUso = { evento: false, ocupacao: false };
    (f.itens || []).forEach(it => (it.usoA = 0));
    sv(true);
    rr();
    toast("Nova sessão: Origens liberadas.");
  });
  // aptidões
  $$("[data-inst]").forEach(
    b =>
      (b.onclick = () => {
        const k = b.dataset.inst;
        f.inst[k] = Math.max(1, Math.min(9, (+f.inst[k] || 1) + +b.dataset.d));
        sv();
        rr();
      })
  );
  $$("[data-apt]").forEach(
    b =>
      (b.onclick = () => {
        const k = b.dataset.apt;
        f.apt[k] = Math.max(0, Math.min(9, (+f.apt[k] || 0) + +b.dataset.d));
        sv();
        rr();
      })
  );
  // assimilação
  const ms = $("#mutSel");
  if (ms) {
    const fill = () => {
      const nk = $("#mutNaipe").value,
        c = $("#mutCarta").value;
      $("#mutCarta").innerHTML = CARTAS_ORD.map(
        x =>
          `<option value="${x}" ${x === c ? "selected" : ""}>${x} · ${esc(ASSIMILACOES[nk][x][0])}</option>`
      ).join("");
      ms.innerHTML = ASSIMILACOES[nk][$("#mutCarta").value][2]
        .map(
          (m, i) => `<option value="${i}">${esc(m[1])} · ${esc(m[0])}${m[2] ? ` (E ${m[2]}+)` : ""}</option>`
        )
        .join("");
    };
    $("#mutNaipe").onchange = fill;
    $("#mutCarta").onchange = fill;
    fill();
    on("#mutAdd", () => {
      const nk = $("#mutNaipe").value,
        c = $("#mutCarta").value,
        i = +ms.value;
      if ((f.muts || []).some(m => m.naipe === nk && m.c === c && m.i === i)) {
        toast("Já tem essa mutação.");
        return;
      }
      f.muts = [...(f.muts || []), { naipe: nk, c, i, anul: 0 }];
      sv(true);
      rr();
    });
  }
  on("#mutHbAdd", () => {
    const v = $("#mutHb").value;
    if ((f.muts || []).some(m => m.hb === v)) {
      toast("Já tem essa mutação.");
      return;
    }
    f.muts = [...(f.muts || []), { hb: v, anul: 0 }];
    sv(true);
    rr();
  });
  $$("[data-mutrm]").forEach(
    b =>
      (b.onclick = async () => {
        const i = +b.dataset.mutrm;
        const m = mutsDe(f).find(x => x.ref === f.muts[i]);
        if (!(await confirmBox(`Tirar ${m ? m.n : "a mutação"}?`, "Some da ficha.", "Tirar"))) return;
        f.muts.splice(i, 1);
        sv(true);
        rr();
      })
  );
  on("#pendPuxar", () => {
    const p = f.assimPend;
    const sing = $("#pendSing") ? [...$("#pendSing").selectedOptions].map(o => o.value) : [];
    p.cartas = {
      ev: puxarCartas(p.a, "ev", []),
      ad: puxarCartas(p.b, "ad", []),
      in: puxarCartas(p.c, "in", []),
      si: sing
    };
    p.sel = [];
    sv(true);
    rr();
    logEntry({
      quem: f.nome,
      titulo: "Cartas de Assimilação",
      total: null,
      det: Object.entries(p.cartas)
        .filter(([k, l]) => l.length)
        .map(
          ([k, l]) =>
            `${NAIPES[k].n}: ${l.map(c => c + NAIPES[k].s + " " + ASSIMILACOES[k][c][0]).join(", ")}`
        )
        .join(" · ")
    });
  });
  on("#pendClareza", () => {
    f.assimPend.c = 0;
    sv(true);
    rr();
    toast("Clareza de Propósito: as Pressões deste teste foram anuladas.");
  });
  $$("[data-psel]").forEach(
    c =>
      (c.onchange = () => {
        const p = f.assimPend;
        p.sel = p.sel || [];
        if (c.checked) p.sel.push(c.dataset.psel);
        else p.sel = p.sel.filter(x => x !== c.dataset.psel);
        sv();
        rr();
      })
  );
  on("#pendRe", () => {
    f.assimPend.cartas = null;
    f.assimPend.sel = [];
    sv(true);
    rr();
  });
  on("#pendOk", async () => {
    const p = f.assimPend;
    const u = pendUsado(f, p);
    const sobra = simTxt({ a: p.a - u.a, b: p.b - u.b, c: p.c - u.c });
    if (
      sobra &&
      !(await confirmBox(
        "Sobraram pontos",
        `Ainda restam ${sobra}. Pela regra todos os pontos são gastos; concluir assim mesmo?`,
        "Concluir"
      ))
    )
      return;
    const novas = (p.sel || []).map(key => {
      const [a, i] = key.split(":");
      return { naipe: a.slice(0, 2), c: a.slice(2), i: +i, anul: 0 };
    });
    f.muts = [...(f.muts || []), ...novas];
    f.assimPend = null;
    f.susc = false;
    sv(true);
    rr();
    logEntry({
      quem: f.nome,
      titulo: "Assimilação concluída",
      total: null,
      det:
        novas
          .map(m => {
            const x = mutacao(m.naipe, m.c, m.i);
            return x ? `${x.n} (${x.carta})` : "";
          })
          .join(", ") || "nenhuma mutação"
    });
  });
  // características
  const cs = $("#caracSel");
  if (cs) {
    const info = () => {
      const all = [
        ...CARACTERISTICAS,
        ...hbOf("caracteristica").map(h => [h.nome, +h.custo || 1, [], h.desc || ""])
      ];
      const c = all.find(x => x[0] === cs.value);
      $("#caracInfo").textContent = c ? `${c[1]} pt · ${reqTxt(c[2])} · ${c[3]}` : "";
    };
    cs.onchange = info;
    info();
  }
  on("#caracAdd", () => {
    const v = cs && cs.value;
    if (!v) return;
    const c = CARACTERISTICAS.find(x => x[0] === v);
    if (c && !reqOK(f, c[2])) toast(`Requisito: ${reqTxt(c[2])}. Adicionada mesmo assim.`);
    f.carac = [...new Set([...(f.carac || []), v])];
    sv(true);
    rr();
  });
  $$("[data-carm]").forEach(
    b =>
      (b.onclick = () => {
        f.carac.splice(+b.dataset.carm, 1);
        sv(true);
        rr();
      })
  );
  $$("[data-cnota]").forEach(
    i =>
      (i.oninput = () => {
        f.caracNota = f.caracNota || {};
        f.caracNota[i.dataset.cnota] = i.value;
        sv();
      })
  );
  // equipamentos
  const optsEq = () => [
    ...EQUIP_LIVRO.map(([n, e]) => ({ n, esc: e, carac: [] })),
    ...EQUIP_PACOTE.map(n => ({ n, esc: null, carac: [] })),
    ...ARTEFATOS.map(([n, e, c]) => ({ n, esc: e, carac: c })),
    ...hbOf("item").map(h => ({
      n: h.nome,
      esc: h.esc === "" ? null : +h.esc,
      carac: (h.carac || "")
        .split(",")
        .map(x => x.trim())
        .filter(Boolean)
    }))
  ];
  const novoItem = o => {
    const it = { nome: o.n, esc: o.esc, q: 3, cq: 0, local: "mochila", carac: [...(o.carac || [])], qtd: 1 };
    if (it.carac.some(c => ["Restaurador", "Medicinal", "Adrenalina"].includes(c))) it.usos = 6;
    if (it.carac.includes("Uso Único")) it.usos = 1;
    return it;
  };
  on("#itemAdd", () => {
    const o = optsEq()[+$("#itemSel").value];
    if (!o) return;
    f.itens = [...(f.itens || []), novoItem(o)];
    sv(true);
    rr();
  });
  on("#itemPacote", async () => {
    const r = await formBox(
      "Pacote inicial",
      `<div class="field"><label class="label" for="pkS">Pacote</label><select id="pkS" name="p">${Object.entries(
        PACOTES
      )
        .map(([k, l]) => `<option value="${esc(k)}">${esc(k)}: ${esc(l.join(", "))}</option>`)
        .join(
          ""
        )}</select></div><p class="muted small" style="margin:0">O mestre pode liberar ainda até 3 equipamentos comuns ou 1 artefato, dentro do teto de Escassez.</p>`,
      "Adicionar"
    );
    if (!r) return;
    const all = optsEq();
    PACOTES[r.p].forEach(n => {
      const o = all.find(x => x.n === n) || { n, esc: null, carac: [] };
      f.itens = [...(f.itens || []), novoItem(o)];
    });
    sv(true);
    rr();
    toast(`Pacote ${r.p} adicionado.`);
  });
  const itemForm = (it, titulo, ok) =>
    formBox(
      titulo,
      `<div class="field"><label class="label" for="icN">Nome</label><input type="text" id="icN" name="nome" maxlength="60" required value="${esc(it.nome || "")}"></div>
     <div class="row" style="gap:8px;flex-wrap:wrap"><div class="field" style="width:110px"><label class="label" for="icE">Escassez</label><select id="icE" name="esc"><option value="">—</option>${ESCASSEZ.map((n, i) => `<option value="${i}" ${String(it.esc ?? "") === String(i) ? "selected" : ""}>${i} · ${n}</option>`).join("")}</select></div>
      <div class="field" style="width:130px"><label class="label" for="icQl">Qualidade</label><select id="icQl" name="q">${QUALIDADE.map((n, i) => `<option value="${i}" ${+(it.q ?? 3) === i ? "selected" : ""}>${i} · ${n}</option>`).join("")}</select></div>
      <div class="field" style="width:90px"><label class="label" for="icQ">Quantidade</label><input type="number" id="icQ" name="qtd" min="1" max="999" value="${+it.qtd || 1}"></div>
      <div class="field" style="width:90px"><label class="label" for="icU">Usos</label><input type="number" id="icU" name="usos" min="0" max="99" value="${it.usos ?? ""}" placeholder="—"></div></div>
     <div class="field"><span class="label">Características de artefato</span><div class="chips">${CARAC_ART.map(([n, c]) => `<label class="chip ${(it.carac || []).includes(n) ? "on" : ""}"><input type="checkbox" name="ca_${esc(n)}" ${(it.carac || []).includes(n) ? "checked" : ""}> ${esc(n)} <small>${c}</small></label>`).join("")}</div></div>
     <div class="field"><label class="label" for="icT">Descrição (opcional)</label><textarea id="icT" name="nota" maxlength="400">${esc(it.nota || "")}</textarea></div>`,
      ok
    );
  const lerItem = (r, it) => {
    const carac = CARAC_ART.map(c => c[0]).filter(n => r["ca_" + n]);
    Object.assign(it, {
      nome: r.nome.trim(),
      esc: r.esc === "" ? null : +r.esc,
      q: +r.q,
      qtd: Math.max(1, +r.qtd || 1),
      usos: r.usos === "" ? null : +r.usos,
      nota: r.nota.trim(),
      carac
    });
    if (it.esc == null && carac.length) it.esc = Math.max(0, escArt(carac));
    return it;
  };
  on("#itemCriar", async () => {
    const r = await itemForm({ q: 3 }, "Criar item ou artefato", "Criar");
    if (!r || !r.nome.trim()) return;
    f.itens = [...(f.itens || []), lerItem(r, { cq: 0, local: "mochila" })];
    sv(true);
    rr();
  });
  $$("[data-ied]").forEach(
    b =>
      (b.onclick = async () => {
        const it = f.itens[+b.dataset.ied];
        const r = await itemForm(it, "Editar item", "Salvar");
        if (!r || !r.nome.trim()) return;
        lerItem(r, it);
        sv(true);
        rr();
      })
  );
  $$("[data-irm]").forEach(
    b =>
      (b.onclick = () => {
        f.itens.splice(+b.dataset.irm, 1);
        sv(true);
        rr();
      })
  );
  $$("[data-iloc]").forEach(
    b =>
      (b.onclick = () => {
        const it = f.itens[+b.dataset.iloc];
        it.local = (it.local || "mochila") === "corpo" ? "mochila" : "corpo";
        sv();
        rr();
      })
  );
  $$("[data-iq]").forEach(
    b =>
      (b.onclick = () => {
        const it = f.itens[+b.dataset.iq];
        it.q = Math.max(0, Math.min(6, +(it.q ?? 3) + +b.dataset.d));
        it.cq = 0;
        sv();
        rr();
      })
  );
  $$("[data-icq]").forEach(
    b =>
      (b.onclick = () => {
        const it = f.itens[+b.dataset.icq];
        it.cq = (+it.cq || 0) + 1;
        if (it.cq >= qualC(it)) {
          it.q = Math.max(0, +(it.q ?? 3) - 1);
          it.cq = 0;
          toast(`${it.nome} caiu para ${QUALIDADE[it.q]}.`);
        }
        sv();
        rr();
      })
  );
  $$("[data-iuso]").forEach(
    b =>
      (b.onclick = () => {
        const it = f.itens[+b.dataset.iuso];
        if (!(+it.usos > 0)) {
          toast("Sem usos.");
          return;
        }
        it.usos = +it.usos - 1;
        sv();
        rr();
        logEntry({
          quem: f.nome,
          titulo: `Usou ${it.nome}`,
          total: null,
          det: `${it.usos} uso(s) restante(s)`
        });
        if (it.usos === 0 && (it.carac || []).includes("Uso Único")) {
          f.itens = f.itens.filter(x => x !== it);
          sv();
          rr();
        }
      })
  );
  // história
  on("#btnTokFicha", () => tokenDaFicha(id));
  on("#btnDelFicha", async () => {
    if (!(await confirmBox("Apagar " + f.nome + "?", "A ficha some para todos na mesa."))) return;
    try {
      await S.db.del(fichaPath(id));
      if (f.dono === S.uid && !f.npc)
        S.db.del("usuarios/" + S.uid + "/fichas/" + S.mesaId + "_" + id).catch(() => {});
      delete S.fichas[id];
      S.openFicha = null;
      renderPanel();
    } catch (e) {
      fail(e);
    }
  });
}

/* ---------- regras de Determinação, Saúde e tempo ---------- */
function perderD(id, n, verbo = "perdeu") {
  const f = S.fichas[id];
  if (!f) return;
  migrar(f);
  for (let k = 0; k < n; k++) {
    const D = derivados(f);
    if (cur(f, "d") > 0) {
      if (verbo.startsWith("gastou") && f.susc) {
        toast("Suscetível: não pode gastar Determinação.");
        break;
      }
      f.dGasto = (+f.dGasto || 0) + 1;
      if (cur(f, "d") <= 0) {
        f.susc = true;
        toast(`${f.nome} entrou em Estado Suscetível.`);
      }
    } else {
      // sem pontos: cai um Nível de Determinação
      if (D.D <= 0) {
        toast("Determinação já está em 0.");
        break;
      }
      f.D = D.D - 1;
      f.dGasto = 0;
      f.susc = true;
      saveFicha(id, true);
      logEntry({
        quem: f.nome,
        titulo: "perdeu um Nível de Determinação",
        total: null,
        det: `Determinação ${f.D} · Assimilação ${10 - f.D}. Teste de Assimilação!`
      });
      setTimeout(() => testeAssimilacao(id, true), 200);
    }
  }
  saveFicha(id, true);
  renderPanel();
  renderBoard();
}
function aplicarDano(id, n) {
  const f = S.fichas[id];
  if (!f || !n) return;
  migrar(f);
  const antes = derivados(f).nivel;
  f.dano = (+f.dano || 0) + n;
  f.trat = 0;
  const D = derivados(f);
  saveFicha(id, true);
  logEntry({
    quem: f.nome,
    titulo: `sofreu ${n} de dano`,
    total: null,
    det: `Saúde ${D.pv}/${D.pvMax}${D.nivel !== antes ? ` · agora ${D.nivel ? `Nível ${D.nivel} (${SAUDE_NIVEIS[D.nivel]})` : "morto"}` : ""}`
  });
  renderPanel();
  renderBoard();
}
function regenQtd(f) {
  let q = instTot(f, "Potência") + 1;
  if (temCarac(f, "Recuperação Rápida")) q += 2;
  if (temMut(f, "Metabolismo Acelerado")) q += 1;
  if (temMut(f, "Restauração")) q *= 2;
  if (temMut(f, "Recuperação Debilitada")) q = Math.ceil(q / 2);
  return q;
}
function repouso(id, tipo) {
  const f = S.fichas[id];
  if (!f) return;
  migrar(f);
  const D = derivados(f);
  const out = [];
  if (tipo === "completo") {
    let g = 1 + instTot(f, "Resolução");
    if (temMut(f, "Transe") && D.pv >= D.pvMax) g *= 2;
    if (temMut(f, "Recuperação Debilitada")) g = Math.ceil(g / 2);
    const antes = cur(f, "d");
    if (!f.susc) {
      f.dGasto = Math.max(0, (+f.dGasto || 0) - g);
    }
    out.push(
      f.susc
        ? "Suscetível: Determinação só volta depois da Assimilação"
        : `+${cur(f, "d") - antes} Determinação`
    );
  }
  const nv = D.nivelRec;
  const pode = tipo === "completo" ? nv >= 5 : nv >= 3;
  if (D.pv < D.pvMax) {
    if (pode) {
      const q = regenQtd(f);
      f.dano = Math.max(0, (+f.dano || 0) - q);
      out.push(`+${q} Saúde`);
    } else
      out.push(
        nv <= 2
          ? "Saúde não se recupera sozinha (precisa de tratamento)"
          : "Saúde só se recupera com uma semana de descanso"
      );
  }
  f.eGasto = 0;
  saveFicha(id, true);
  renderPanel();
  renderBoard();
  logEntry({
    quem: f.nome,
    titulo: tipo === "completo" ? "Repouso completo" : "Semana de descanso",
    total: null,
    det: out.join(" · ")
  });
}
async function clareza(id) {
  const f = S.fichas[id];
  if (!f) return;
  migrar(f);
  const D = derivados(f);
  const inop = mutsDe(f).filter(m => m.naipe === "in" && m.anul < custoSim(m.custo).c);
  const r = await formBox(
    "Clareza de Propósito",
    `<p class="muted small" style="margin:0">Arco concluído, Propósito realizado ou algo maravilhoso aconteceu. Escolha uma opção:</p>
   <label class="check"><input type="radio" name="o" value="nivel" checked> Recuperar um Nível de Determinação completo (D ${D.D} → ${Math.min(10, D.D + 1)})</label>
   <label class="check"><input type="radio" name="o" value="anular" ${inop.length ? "" : "disabled"}> Anular uma Pressão de Assimilação Inoportuna</label>
   ${inop.length ? `<select name="m">${inop.map(m => `<option value="${(f.muts || []).indexOf(m.ref)}">${esc(m.n)} (${m.anul}/${custoSim(m.custo).c})</option>`).join("")}</select>` : ""}
   ${f.assimPend && f.assimPend.c && !f.assimPend.cartas ? `<label class="check"><input type="checkbox" name="pend" checked> Também anular as C do Teste de Assimilação desta cena</label>` : ""}`,
    "Aplicar"
  );
  if (!r) return;
  let det = "";
  if (r.o === "anular" && r.m != null) {
    const ref = f.muts[+r.m];
    ref.anul = (+ref.anul || 0) + 1;
    const m = mutacao(ref.naipe, ref.c, ref.i);
    det = `anulou uma Pressão de ${m ? m.n : "mutação"}`;
  } else {
    f.D = Math.min(10, D.D + 1);
    f.dGasto = 0;
    f.eGasto = Math.min(+f.eGasto || 0, 10 - f.D);
    f.susc = false;
    det = `recuperou um Nível de Determinação (D ${f.D} · E ${10 - f.D})`;
  }
  if (r.pend && f.assimPend) {
    f.assimPend.c = 0;
    det += " · Pressões do teste anuladas";
  }
  saveFicha(id, true);
  renderPanel();
  renderBoard();
  logEntry({ quem: f.nome, titulo: "Clareza de Propósito", total: null, det });
}
