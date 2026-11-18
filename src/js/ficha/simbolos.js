"use strict";
/* Símbolos dos dados (Sucesso, Adaptação, Pressão) e como os dados aparecem na tela e no registro. */
/* ===================== SÍMBOLOS E DADOS NA TELA ===================== */
const SYI = {
  a: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6Z" fill="currentColor"/></svg>`,
  b: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 9A8 8 0 0 0 5 7.5M4.5 15A8 8 0 0 0 19 16.5"/><path d="M5 3v4.5h4.5M19 21v-4.5h-4.5"/></svg>`,
  c: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 4h19L12 21.5Z" fill="currentColor"/><path d="M12 8.5v5.5" stroke="#000" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.3" fill="#000" fill-opacity=".55"/></svg>`
};
const SYN = { a: "Sucesso", b: "Adaptação", c: "Pressão" };
function sy(k) {
  return `<i class="sy ${k}" title="${SYN[k]}">${SYI[k]}</i>`;
}
function symChips(o, vazio = "—") {
  o = o || {};
  const p = [];
  ["a", "b", "c"].forEach(k => {
    const n = +o[k] || 0;
    if (!n) return;
    p.push(
      n <= 6 ? `<span class="syg">${sy(k).repeat(n)}</span>` : `<span class="syg">${sy(k)}<b>×${n}</b></span>`
    );
  });
  return p.length ? `<span class="syrow">${p.join("")}</span>` : `<span class="muted small">${vazio}</span>`;
}
function custoHTML(s) {
  return symChips(custoSim(s));
}
function faceHTML(f) {
  const o = faceSim(f);
  return ["a", "b", "c"].map(k => sy(k).repeat(o[k])).join("") || `<span class="vz">·</span>`;
}
function dieHTML(t, f, i, on, extra = "") {
  return `<button type="button" class="die d${t} ${on ? "on" : ""}" ${i != null ? `data-di="${i}"` : ""} ${extra} aria-label="d${t}: ${FACES[f] || "vazio"}${on ? " (mantido)" : ""}"><span class="dt">d${t}</span><span class="fs">${faceHTML(f)}</span></button>`;
}
// marcadores no texto do registro: [[a,b,c]] e {{6:3,5*;10:7*}}
function codDados(lista, sel) {
  const g = {};
  lista.forEach((x, i) => {
    (g[x.t] = g[x.t] || []).push(x.f + (sel && sel.has(i) ? "*" : ""));
  });
  return (
    "{{" +
    Object.entries(g)
      .map(([t, fs]) => t + ":" + fs.join(","))
      .join(";") +
    "}}"
  );
}
function parseDet(det) {
  det = String(det || "");
  let sim = null,
    dados = null;
  det = det.replace(/^\[\[(\d+),(\d+),(\d+)\]\]\s*/, (m, a, b, c) => {
    sim = { a: +a, b: +b, c: +c };
    return "";
  });
  det = det.replace(/\{\{([^}]*)\}\}\s*/, (m, s) => {
    dados = [];
    s.split(";").forEach(p => {
      const [t, fs] = p.split(":");
      (fs || "").split(",").forEach(x => {
        if (x) dados.push({ t: +t, f: parseInt(x), k: /\*/.test(x) });
      });
    });
    return "";
  });
  return { sim, dados, txt: det.trim() };
}
function detHTML(det) {
  const p = parseDet(det);
  if (!p.sim && !p.dados) return esc(p.txt);
  return `${p.dados && p.dados.length ? `<span class="mdice">${p.dados.map(x => `<span class="md d${x.t} ${x.k ? "on" : ""}" title="d${x.t}">${faceHTML(x.f)}</span>`).join("")}</span>` : ""}${p.txt ? `<span>${esc(p.txt)}</span>` : ""}`;
}
function totHTML(e) {
  const p = parseDet(e.det);
  if (p.sim) return symChips(p.sim, "nada");
  return esc(e.total ?? "✦");
}
const CONSEQ = [
  null,
  "consequência menor",
  "consequência relevante",
  "consequência séria",
  "consequência grave",
  "consequência gravíssima",
  "consequência devastadora"
];
function conseqTxt(c) {
  return c > 0 ? CONSEQ[Math.min(6, c)] : "";
}
