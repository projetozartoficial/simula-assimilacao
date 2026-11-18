"use strict";
/* Homebrew: Características, mutações, itens e Ameaças criados na mesa. */
/* ===================== HOMEBREW ===================== */
const HB_TIPOS = [
  ["caracteristica", "Característica"],
  ["mutacao", "Mutação"],
  ["item", "Item"],
  ["ameaca", "Ameaça"]
];
function homebrewHTML() {
  const t = S.hbTipo || "caracteristica";
  const list = S.homebrew;
  const fieldsFor = {
    caracteristica: `<div class="fields"><div class="field"><label class="label" for="h_c">Custo (Experiência)</label><input type="number" id="h_c" name="custo" min="0" max="10" value="2"></div><div class="field"><label class="label" for="h_r">Requisito (texto)</label><input type="text" id="h_r" name="req" maxlength="60" placeholder="Ex.: Percepção 2+"></div></div>`,
    mutacao: `<div class="fields"><div class="field"><label class="label" for="h_n2">Naipe</label><select id="h_n2" name="naipe">${Object.entries(
      NAIPES
    )
      .map(([k, n]) => `<option value="${k}">${n.s} ${n.n}</option>`)
      .join(
        ""
      )}</select></div><div class="field"><label class="label" for="h_c">Custo</label><input type="text" id="h_c" name="custo" maxlength="10" placeholder="Ex.: BBA" required style="text-transform:uppercase"></div><div class="field"><label class="label" for="h_e">E mínimo</label><input type="number" id="h_e" name="e" min="0" max="10" value="0"></div></div>`,
    item: `<div class="fields"><div class="field"><label class="label" for="h_esc">Escassez</label><select id="h_esc" name="esc"><option value="">—</option>${ESCASSEZ.map((n, i) => `<option value="${i}">${i} · ${n}</option>`).join("")}</select></div><div class="field"><label class="label" for="h_car">Características (separadas por vírgula)</label><input type="text" id="h_car" name="carac" placeholder="Ex.: Letal, Pesado"></div></div>`,
    ameaca: `<div class="fields"><div class="field"><label class="label" for="h_t">Tipo</label><select id="h_t" name="tipoA">${TIPOS_AMEACA.map(x => `<option>${x}</option>`).join("")}</select></div>
     <div class="field"><label class="label" for="h_6">d6</label><input type="number" id="h_6" name="d6" min="0" max="20" value="2"></div><div class="field"><label class="label" for="h_10">d10</label><input type="number" id="h_10" name="d10" min="0" max="20" value="1"></div><div class="field"><label class="label" for="h_12">d12</label><input type="number" id="h_12" name="d12" min="0" max="20" value="0"></div>
     <div class="field"><label class="label" for="h_nb">Neutralização (A)</label><input type="number" id="h_nb" name="nb" min="1" max="60" value="5"></div><div class="field"><label class="label" for="h_nm">+ por Infectado extra</label><input type="number" id="h_nm" name="nm" min="0" max="20" value="1"></div></div>
     <div class="field"><label class="label" for="h_at">Ativações (uma por linha: CUSTO Nome: efeito)</label><textarea id="h_at" name="ativ" placeholder="CC Mordida: 2 d10 de dano&#10;AAA Recuo: foge da cena"></textarea></div>`
  };
  const meta = h =>
    ({
      caracteristica: `${h.custo} pt${h.req ? " · " + h.req : ""}`,
      mutacao: `${(NAIPES[h.naipe] || {}).n || ""} · ${h.custo}${+h.e ? ` · E ${h.e}+` : ""}`,
      item: `${h.esc !== "" && h.esc != null ? "Escassez " + h.esc : ""}${h.carac ? " · " + h.carac : ""}`,
      ameaca: `${h.tipoA || "Ameaça"} · ${poolTxt(h)} · Neutralização ${h.nb}${+h.nm ? ` +${h.nm}` : ""}`
    })[h.tipo] || "";
  return `<p class="muted small" style="margin:0">Os nomes e números do livro já estão nas fichas. Aqui vocês cadastram conteúdo próprio da mesa: aparece nas fichas, nas Ameaças e para todo mundo.</p>
   <form class="box stack" id="fHB"><div class="tabs2">${HB_TIPOS.map(([k, n]) => `<button type="button" data-hbt="${k}" aria-pressed="${t === k}">${n}</button>`).join("")}</div>
    <div class="field"><label class="label" for="h_n">Nome</label><input type="text" id="h_n" name="nome" maxlength="50" required></div>
    ${fieldsFor[t] || ""}
    <div class="field"><label class="label" for="h_desc">${t === "mutacao" || t === "caracteristica" ? "Efeito" : "Descrição"}</label><textarea id="h_desc" name="desc" maxlength="600" style="min-height:70px"></textarea></div>
    <button class="btn primary">Criar ${HB_TIPOS.find(x => x[0] === t)[1].toLowerCase()}</button></form>
   ${HB_TIPOS.map(([k, n]) => {
     const l = list.filter(h => h.tipo === k);
     return l.length
       ? `<div class="sub">${n}s</div><div class="cards">${l.map(h => `<div class="hb"><div class="row between"><span class="hn">${esc(h.nome)}</span>${h.autor === S.uid || S.isM ? `<button class="btn sm ghost" data-delhb="${esc(h.id)}" aria-label="Apagar">✕</button>` : ""}</div><span class="muted small" style="font-family:var(--f-mono)">${esc(meta(h))}</span>${h.desc ? `<span class="small">${esc(h.desc)}</span>` : ""}</div>`).join("")}</div>`
       : "";
   }).join("")}
   ${!list.length ? `<div class="empty">Nada criado ainda.</div>` : ""}`;
}
function bindHomebrew() {
  $$("[data-hbt]").forEach(
    b =>
      (b.onclick = () => {
        S.hbTipo = b.dataset.hbt;
        renderPanel();
      })
  );
  $("#fHB").onsubmit = async e => {
    e.preventDefault();
    const o = { tipo: S.hbTipo || "caracteristica", autor: S.uid, criada: Date.now() };
    $$("#fHB [name]").forEach(el => (o[el.name] = el.type === "number" ? +el.value || 0 : el.value.trim()));
    if (o.tipo === "mutacao") {
      o.custo = String(o.custo || "")
        .toUpperCase()
        .replace(/[^ABC]/g, "");
      if (!o.custo) {
        toast("Escreva o custo com A, B e C.");
        return;
      }
    }
    try {
      await S.db.add(P() + "/homebrew", o);
      toast(`${o.nome} criado.`);
      $("#fHB").reset();
    } catch (err) {
      fail(err);
    }
  };
  $$("[data-delhb]").forEach(
    b =>
      (b.onclick = async () => {
        const h = S.homebrew.find(x => x.id === b.dataset.delhb);
        if (!(await confirmBox("Apagar " + h.nome + "?", "Some da mesa para todos."))) return;
        try {
          await S.db.del(P() + "/homebrew/" + h.id);
        } catch (e) {
          fail(e);
        }
      })
  );
}
