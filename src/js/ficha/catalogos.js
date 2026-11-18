"use strict";
/* Catálogos somando o homebrew da mesa: Ameaças (painel Tokens e NPCs) e mutações homebrew. */
const hbOf = t => (S.homebrew || []).filter(h => h.tipo === t);
// mutações homebrew entram como cartas extras: m = {hb:id}
function mutsHomebrew(f) {
  const hb = (f.muts || [])
    .filter(m => m.hb)
    .map(m => {
      const h = (S.homebrew || []).find(x => x.id === m.hb);
      return h
        ? {
            naipe: h.naipe,
            c: "hb",
            i: 0,
            n: h.nome,
            custo: h.custo,
            e: +h.e || 0,
            ef: h.desc || "",
            fx: null,
            carta: "Homebrew",
            anul: +m.anul || 0,
            ref: m
          }
        : null;
    })
    .filter(Boolean);
  return hb;
}

function allBest() {
  return AMEACAS_LIVRO.map(a => ({
    n: a.n,
    el: a.tipo,
    vd: PROGRESSAO[a.niv || 0][0],
    pv: a.neut[0],
    def: 0,
    at: [1, 1, 1, 1, 1],
    dados: { d6: 0, d10: 0, d12: 0, ...a.dados },
    neut: a.neut,
    ativ: a.ativ,
    notas: a.notas || ""
  })).concat(
    hbOf("ameaca").map(h => ({
      n: h.nome,
      el: h.tipoA || "Outro",
      vd: "homebrew",
      pv: +h.nb || 1,
      def: 0,
      at: [1, 1, 1, 1, 1],
      dados: { d6: +h.d6 || 0, d10: +h.d10 || 0, d12: +h.d12 || 0 },
      neut: [+h.nb || 1, +h.nm || 0],
      ativ: String(h.ativ || "")
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => {
          const m = l.match(/^([ABC0-9]+)\s+([^:]+):?\s*(.*)$/i);
          return m ? [m[1].toUpperCase(), m[2].trim(), m[3].trim()] : ["A", l, ""];
        }),
      notas: h.desc || "",
      hb: true
    }))
  );
}
