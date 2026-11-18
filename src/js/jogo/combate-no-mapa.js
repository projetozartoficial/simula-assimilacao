"use strict";
/* Conflito no mapa: centrar no token, pôr as Ameaças da cena no Conflito, o que os jogadores não enxergam. */
/* ===================== COMBATE NO MAPA ===================== */
function vezAtual() {
  const c = S.combate;
  if (!c || !(c.lista || []).length) return null;
  return c.lista[c.turno || 0] || null;
}
function tokenDaVez(t) {
  const x = vezAtual();
  if (!x) return false;
  return (x.fichaId && t.fichaId === x.fichaId) || (x.id && t.combId === x.id);
}
function centrarNo(tid) {
  const p = S.pos[tid];
  if (!p) return;
  const r = board.getBoundingClientRect();
  V.x = r.width / 2 - p.x * V.z;
  V.y = r.height / 2 - p.y * V.z;
  S.userMoved = true;
  applyView();
  S.sel = tid;
  renderBoard();
}
function tokenDeEntrada(x) {
  for (const tid of Object.keys(S.pos)) {
    const t = S.tokens.find(y => y.id === tid);
    if (t && ((x.fichaId && t.fichaId === x.fichaId) || (t.combId && t.combId === x.id))) return tid;
  }
  return null;
}
/* Põe no Conflito as Ameaças que têm token na cena. */
function addTokensAoCombate() {
  const c = combBase();
  if (!c.ativo) {
    toast("Anuncie um Conflito primeiro.");
    return;
  }
  let n = 0;
  c.ameacas = c.ameacas || [];
  for (const tid of Object.keys(S.pos)) {
    const t = S.tokens.find(y => y.id === tid);
    if (!t || !t.fichaId) continue;
    const f = S.fichas[t.fichaId];
    if (!f || !f.rapido) continue;
    if (!c.ameacas.includes(t.fichaId)) {
      c.ameacas.push(t.fichaId);
      n++;
    }
  }
  if (!n) {
    toast("Nenhuma Ameaça nova nos tokens desta cena.");
    return;
  }
  saveCombate(c);
  toast(`${n} Ameaça(s) entraram no Conflito.`);
}

/* ---------- o que os jogadores não enxergam no combate ---------- */
/* Token ligado a uma entrada do combate: o da cena atual ou, se não estiver nela, qualquer um. */
function tokenLigado(x) {
  const tid = tokenDeEntrada(x);
  if (tid) return { t: S.tokens.find(y => y.id === tid), p: S.pos[tid] };
  const t = S.tokens.find(y => (x.fichaId && y.fichaId === x.fichaId) || (y.combId && y.combId === x.id));
  return t ? { t, p: null } : null;
}
/* Os jogadores enxergam esta entrada? Não, se o token dela está oculto ou num local escondido, nem se é
   um NPC escondido sem token à vista. Vale para o painel Combate e para o que vai no registro. */
function entradaVisivelParaJogadores(x) {
  const k = tokenLigado(x);
  if (k && k.t) return !k.t.oculto && !(k.p && hiddenAt(k.p.x, k.p.y));
  if (!x.fichaId) return true; // inimigo do bestiário sem token: o mestre pôs no combate de propósito
  const f = S.fichas[x.fichaId];
  return !!f && !(f.npc && !f.visivel); // jogador nem recebe a ficha de NPC escondido
}
/* Para quem está olhando agora: o mestre vê tudo; o jogador vê o próprio agente e o que não está escondido. */
function entradaVisivel(x) {
  if (S.isM) return true;
  const f = x.fichaId && S.fichas[x.fichaId];
  if (f && !f.npc && f.dono === S.uid) return true;
  return entradaVisivelParaJogadores(x);
}
