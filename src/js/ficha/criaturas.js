"use strict";
/* Ameaças na cena: arte de quem não tem imagem, retrato de NPC, pôr Ameaça ou pasta inteira na cena. */
function maToURL(c) {
  let u = c.toDataURL("image/webp", 0.86);
  if (!u.startsWith("data:image/webp")) u = c.toDataURL("image/png");
  return u;
}
/* a arte das criaturas sem imagem fica em ficha/arte-criaturas.js (arteCriatura) */
/* retrato genérico para NPC sem arte (busto, sem rosto definido) */
function artePessoa(seed = 1) {
  const N = 256,
    c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext("2d");
  const R = maRng(seed || 1);
  const oldS = MA_S;
  MA_S = 80;
  const bg = g.createRadialGradient(N * 0.5, N * 0.35, 10, N * 0.5, N * 0.5, N * 0.75);
  bg.addColorStop(0, "#3a3442");
  bg.addColorStop(1, "#0d0b10");
  g.fillStyle = bg;
  g.fillRect(0, 0, N, N);
  const roupa = maPick(["#2b2b33", "#3a2a22", "#1f3550", "#4a1c24", "#2f4a3a", "#55504a", "#1d1e23"], R),
    pele = maPick(["#e2b48f", "#c8946a", "#a06a45", "#7a4a2e", "#5a3622", "#f0c8a8"], R),
    cab = maPick(["#1a1410", "#3a2416", "#6a4a2a", "#2a2a2a", "#8a8a8a", "#b48a4a"], R);
  g.beginPath();
  g.moveTo(10, N);
  g.bezierCurveTo(14, 178, 70, 160, 128, 160);
  g.bezierCurveTo(186, 160, 242, 178, 246, N);
  g.closePath();
  g.fillStyle = maGrad(g, 0, 150, N, 110, roupa, 0.18);
  g.fill();
  g.lineWidth = 4;
  g.strokeStyle = MA_INK;
  g.stroke();
  g.beginPath();
  g.moveTo(104, 162);
  g.lineTo(128, 206);
  g.lineTo(152, 162);
  g.fillStyle = maTone(roupa, 0.35);
  g.fill();
  g.stroke();
  g.fillStyle = maTone(pele, -0.15);
  g.fillRect(112, 128, 32, 38);
  g.strokeRect(112, 128, 32, 38);
  maEll(g, 128, 104, 40, 50, pele, { k: 0.18 });
  const h = Math.floor(R() * 4);
  g.fillStyle = cab;
  g.beginPath();
  if (h === 0) {
    g.ellipse(128, 76, 44, 30, 0, Math.PI, 0);
    g.fill();
  } else if (h === 1) {
    g.ellipse(128, 82, 46, 38, 0, Math.PI * 1.05, -0.05);
    g.lineTo(172, 140);
    g.lineTo(162, 96);
    g.lineTo(94, 96);
    g.lineTo(84, 140);
    g.fill();
  } else if (h === 2) {
    g.ellipse(128, 70, 38, 18, 0, Math.PI, 0);
    g.fill();
  } else {
    g.ellipse(128, 90, 54, 62, 0, Math.PI * 1.08, -0.08);
    g.lineTo(182, 170);
    g.lineTo(166, 110);
    g.lineTo(90, 110);
    g.lineTo(74, 170);
    g.closePath();
    g.fillStyle = maTone(roupa, -0.1);
    g.fill();
  }
  g.fillStyle = "rgba(10,8,12,.55)";
  g.fillRect(104, 102, 16, 6);
  g.fillRect(136, 102, 16, 6);
  MA_S = oldS;
  return maToURL(c);
}

/* Arte da ficha de NPC ou Ameaça: a foto; senão a arte que o mestre subiu; senão a desenhada pelo tipo. */
function arteDaFicha(f) {
  if (f.foto) return f.foto;
  const a = typeof arteDaBase === "function" && arteDaBase(f.base);
  if (a) return a;
  return f.criatura
    ? arteCriatura(f.rel || "", sementeDe(f.base || f.nome))
    : artePessoa(maH((f.nome || "").length, (f.rtipo || f.nome || "x").charCodeAt(0), 9));
}
function avatarAmeaca(f, s = 52) {
  return `<img class="avatar" src="${arteDaFicha(f)}" alt="" style="width:${s}px;height:${s}px;object-fit:${f.foto ? "cover" : "contain"};background:#0c100e">`;
}
/* Ameaça humana (saqueadores, bandos): na galeria de artes fica na aba "Humanos". */
const ehPessoaDoBestiario = b => !!b && b.el === "Humano";
/* ---------- pôr na cena ---------- */
async function porGrupoEmCena(pasta) {
  if (!S.viewSid) {
    toast("Abra uma cena primeiro.");
    return;
  }
  const ids = Object.keys(S.fichas).filter(id => {
    const f = S.fichas[id];
    return f.npc && (f.pasta || "") === pasta;
  });
  if (!ids.length) return;
  const r = await formBox(
    `Pôr ${ids.length} na cena`,
    `<p class="muted small" style="margin:0">${ids.map(id => esc(S.fichas[id].nome)).join(", ")}</p>
   <label class="check"><input type="checkbox" name="oculto" checked> Começam ocultos (só você vê até revelar)</label><label class="check"><input type="checkbox" name="comb" ${S.combate && S.combate.ativo ? "checked" : "disabled"}> As Ameaças entram no Conflito</label>`,
    "Pôr na cena"
  );
  if (!r) return;
  const base = tokenBase();
  const rr = board.getBoundingClientRect();
  const cx = (rr.width / 2 - V.x) / V.z,
    cy = (rr.height / 2 - V.y) / V.z;
  const c = r.comb ? combBase() : null;
  for (const id of ids) {
    const f = S.fichas[id];
    let t = S.tokens.find(x => x.fichaId === id);
    if (!t) {
      const url = f.foto ? "" : arteDaFicha(f);
      const doc = {
        nome: f.nome,
        url,
        fichaId: id,
        forma: f.criatura ? "livre" : "quadrado",
        cor: "#4a5a52",
        usaFoto: true,
        oculto: !!r.oculto
      };
      const tid = await criarToken(doc, false);
      if (!tid) continue;
      t = { id: tid, ...doc, dono: S.uid };
      S.tokens.push(t);
    } else if (!!t.oculto !== !!r.oculto) {
      t.oculto = !!r.oculto;
      S.db.merge(P() + "/tokens/" + t.id, { oculto: t.oculto }).catch(() => {});
    }
    if (!S.pos[t.id]) {
      let spot = null;
      for (let ring = 0; ring < 12 && !spot; ring++)
        for (let dy = -ring; dy <= ring && !spot; dy++)
          for (let dx = -ring; dx <= ring && !spot; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
            const x = cx + dx * base * 1.15,
              y = cy + dy * base * 1.15;
            if (x < 0 || y < 0 || x > V.w || y > V.h) continue;
            if (!Object.values(S.pos).some(p => Math.hypot(p.x - x, p.y - y) < base * 0.9)) spot = { x, y };
          }
      porEmCena(t.id, spot || { x: cx, y: cy });
    }
    if (c && f.rapido && !(c.ameacas || []).includes(id)) c.ameacas = [...(c.ameacas || []), id];
  }
  if (c) saveCombate(c);
  renderBoard();
  toast(`${ids.length} na cena${r.oculto ? " (ocultos)" : ""}${c ? " e as Ameaças no Conflito" : ""}.`);
}
async function ameacaEmCena(b) {
  if (!b || !S.viewSid) return;
  const n = Object.values(S.fichas).filter(f => f.rapido && f.base === b.n).length;
  const id = "n" + rid(8);
  const f = ameacaDe(b);
  f.nome = b.n + (n ? " " + (n + 1) : "");
  f.criada = Date.now();
  S.fichas[id] = f;
  saveFicha(id, true);
  await criarToken(
    {
      nome: f.nome,
      url: arteDaFicha(f),
      fichaId: id,
      ameaca: b.n,
      forma: f.criatura ? "livre" : "quadrado",
      cor: "#4a5a52",
      usaFoto: true,
      oculto: !!S.ameOculto
    },
    true
  );
  if (S.ameCombate !== false && S.combate && S.combate.ativo) {
    const c = combBase();
    c.ameacas = [...(c.ameacas || []), id];
    saveCombate(c);
  }
  toast(
    `${f.nome} entrou em cena${S.ameCombate !== false && S.combate && S.combate.ativo ? " e no Conflito" : ""}. A ficha está em Infectados → NPCs e Ameaças.`
  );
}
