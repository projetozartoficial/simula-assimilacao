"use strict";
/* Rolagem de dados numéricos (2d6+3); os dados de símbolos ficam em regras/livro.js (rollPool). */
/* ===================== DADOS ===================== */
function d(n) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return 1 + (a[0] % n);
}
function rollN(n, f) {
  const r = [];
  for (let i = 0; i < n; i++) r.push(d(f));
  return r;
}
function parseExpr(s) {
  s = String(s || "")
    .replace(/\s+/g, "")
    .toLowerCase();
  if (!s) return null;
  const re = /([+-]?)(\d*d\d+|\d+)/g;
  let m,
    pos = 0;
  const terms = [];
  while ((m = re.exec(s))) {
    if (m.index !== pos) return null;
    pos = re.lastIndex;
    const sign = m[1] === "-" ? -1 : 1;
    const t = m[2];
    if (t.includes("d")) {
      let [n, f] = t.split("d");
      n = n === "" ? 1 : +n;
      f = +f;
      if (n < 1 || n > 60 || f < 2 || f > 1000) return null;
      terms.push({ sign, n, f });
    } else terms.push({ sign, c: +t });
  }
  if (pos !== s.length || !terms.length) return null;
  return terms;
}
function rollExpr(expr, { critMult = 1, explode6 = false, extraDice = 0 } = {}) {
  const terms = parseExpr(expr);
  if (!terms) return null;
  let total = 0;
  const parts = [];
  let first = true;
  for (const t of terms) {
    if (t.c !== undefined) {
      total += t.sign * t.c;
      parts.push((t.sign < 0 ? "−" : "+") + t.c);
      continue;
    }
    let n = t.n;
    if (t.sign > 0) {
      if (first) {
        n += extraDice;
        first = false;
      }
      n *= critMult;
    }
    let r = rollN(n, t.f);
    if (explode6) {
      let ex = r.filter(x => x === 6).length;
      while (ex > 0) {
        const nr = rollN(ex, t.f);
        r = r.concat(nr);
        ex = nr.filter(x => x === 6).length;
      }
    }
    const sum = r.reduce((a, b) => a + b, 0);
    total += t.sign * sum;
    parts.push((t.sign < 0 ? "−" : "+") + r.length + "d" + t.f + "[" + r.join(",") + "]");
  }
  return { total, detail: parts.join(" ").replace(/^\+/, "") };
}
