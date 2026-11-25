"use strict";
/* Páginas legais e privacidade (LGPD e Código de Defesa do Consumidor): Política de Privacidade, Termos
   de Uso, Cookies, Reembolso e Meus dados (baixar e apagar os seus dados). Abrem como página no início
   do site (#privacidade, #termos, #cookies, #reembolso, #meus-dados) e como janela dentro da mesa (Ajuda),
   para ninguém sair da mesa no meio do jogo. Também: o aviso de cookies, a caixa de consentimento dos
   formulários, o rodapé com o responsável e o link "Pular para o conteúdo". */

const ZART = { nome: "Grupo Zart", email: "projetozart@gmail.com" };
const LEGAL_DATA = "25 de novembro de 2026";
const LEGAL_PAGINAS = {
  privacidade: "Política de Privacidade",
  termos: "Termos de Uso",
  cookies: "Cookies e armazenamento",
  reembolso: "Política de Reembolso",
  "meus-dados": "Meus dados"
};
const legalLink = (pg, txt) => `<a href="#${pg}" data-legal="${pg}">${esc(txt || LEGAL_PAGINAS[pg])}</a>`;
const contato = () => `<a href="mailto:${ZART.email}">${ZART.email}</a>`;

/* ---------- o texto de cada página ---------- */
function legalHTML(pg) {
  if (pg === "privacidade")
    return `<p class="legal-data">Atualizada em ${LEGAL_DATA}.</p>
<p>Esta política explica quais dados o Simula Assimilação guarda, para quê, com quem eles são compartilhados, por quanto tempo ficam guardados e como você exerce os seus direitos, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, a LGPD).</p>
<h2>Quem é o responsável</h2>
<p>O responsável (controlador) pelos dados é o <b>${ZART.nome}</b>. Para qualquer assunto de privacidade, escreva para ${contato()}. Esse é o nosso canal com quem usa o site.</p>
<h2>Quais dados guardamos e para quê</h2>
<table class="legal-tab"><thead><tr><th scope="col">Dado</th><th scope="col">Para quê</th><th scope="col">Base legal (LGPD)</th></tr></thead><tbody>
<tr><td>Identificador da conta, criado automaticamente pelo Firebase quando você abre o site (login anônimo)</td><td>Reconhecer você neste navegador, para que suas mesas e fichas continuem suas</td><td>Execução do serviço que você pediu (art. 7º, V)</td></tr>
<tr><td>Nome, e-mail e foto da sua conta Google, só se você escolher "Entrar com Google"</td><td>Mostrar quem está conectado e levar seus personagens e mesas para outros aparelhos</td><td>Consentimento (art. 7º, I)</td></tr>
<tr><td>O nome que você digita para entrar numa mesa</td><td>Mostrar ao mestre e aos jogadores daquela mesa quem é você</td><td>Execução do serviço (art. 7º, V)</td></tr>
<tr><td>O que você cria: mesas, fichas, fotos e imagens que você sobe, documentos, anotações, mapas, mensagens e rolagens</td><td>Fazer a mesa funcionar e mostrar esse conteúdo a quem participa dela</td><td>Execução do serviço (art. 7º, V)</td></tr>
<tr><td>Preferências guardadas no seu navegador (veja ${legalLink("cookies", "Cookies")})</td><td>Lembrar suas escolhas, como o visual do dado e o som</td><td>Legítimo interesse, só para o site funcionar (art. 7º, IX)</td></tr>
</tbody></table>
<p>Não pedimos CPF, endereço, telefone, dados de pagamento nem a sua localização. O site não tem anúncios, não usa Google Analytics, pixels nem outras ferramentas de rastreamento, e não vende nenhum dado.</p>
<h2>Com quem os dados são compartilhados</h2>
<ul>
<li><b>Google Firebase</b> (Google LLC): guarda as mesas e faz o login. Os servidores podem ficar fora do Brasil; o Google segue cláusulas de proteção de dados nessa transferência internacional (art. 33 da LGPD).</li>
<li><b>GitHub Pages</b> (GitHub, Inc.): hospeda o site. Como todo servidor, registra dados técnicos de acesso, como o endereço IP.</li>
<li><b>Google Fonts</b>: entrega as fontes do site. Para isso, o Google recebe o endereço IP de quem abre a página.</li>
<li><b>YouTube</b>: só quando o mestre toca uma música do YouTube na trilha sonora <i>e</i> você aceitou os cookies de terceiros. Usamos o modo de privacidade aprimorada do YouTube.</li>
<li><b>Quem participa da mesa</b>: o mestre e os jogadores veem o que é mostrado na mesa. O mestre vê também o que é dele ver (fichas, rolagens secretas mandadas para ele).</li>
</ul>
<p>Fora isso, só compartilhamos dados se uma lei ou uma ordem judicial exigir.</p>
<h2>Por quanto tempo os dados ficam guardados</h2>
<ul>
<li>Mesas e tudo o que há nelas: até o mestre apagar a mesa, ou até você pedir a exclusão.</li>
<li>Seus personagens e o índice das suas mesas: até você apagar, ou até você pedir a exclusão.</li>
<li>Preferências do navegador: até você limpar os dados do site no navegador ou apagar em ${legalLink("meus-dados", "Meus dados")}.</li>
<li>Registros técnicos de acesso da hospedagem: pelo tempo definido pelo GitHub e pelo Google.</li>
</ul>
<h2>Seus direitos</h2>
<p>Pela LGPD (art. 18), você pode: confirmar se tratamos seus dados; ter acesso a eles; corrigir dados incompletos ou errados; pedir anonimização, bloqueio ou eliminação; levar seus dados para outro serviço (portabilidade); saber com quem eles são compartilhados; e retirar o seu consentimento a qualquer momento.</p>
<ul>
<li><b>Acessar e levar seus dados:</b> em ${legalLink("meus-dados", "Meus dados")}, toque em "Baixar meus dados". Cada mesa sua também tem o backup no Escudo do mestre.</li>
<li><b>Corrigir:</b> edite sua ficha, seu personagem ou a sua mesa direto no site.</li>
<li><b>Apagar:</b> em ${legalLink("meus-dados", "Meus dados")}, toque em "Apagar todos os meus dados".</li>
<li><b>Retirar o consentimento:</b> saia da conta Google ou mude a sua escolha em ${legalLink("cookies", "Cookies")}.</li>
<li><b>Qualquer outro pedido</b> ou dúvida: escreva para ${contato()}. Respondemos em até 15 dias.</li>
</ul>
<p>Se achar que seus direitos não foram respeitados, você também pode reclamar na Autoridade Nacional de Proteção de Dados (ANPD), em gov.br/anpd.</p>
<h2>Segurança</h2>
<p>Os dados ficam no Firebase, com regras que deixam cada mesa visível só para quem participa dela, e cada ficha editável só pelo dono e pelo mestre. A conexão com o site é criptografada (HTTPS). Nenhum sistema é 100% seguro: se acontecer um incidente que possa trazer risco a você, avisaremos você e a ANPD, como manda a lei.</p>
<h2>Crianças e adolescentes</h2>
<p>O site não é feito para crianças. Quem tem menos de 18 anos deve usar com o conhecimento dos pais ou responsáveis, e menores de 12 anos só com o consentimento deles (art. 14 da LGPD). Se um responsável quiser apagar os dados de um menor, escreva para ${contato()}.</p>
<h2>Mudanças nesta política</h2>
<p>Se esta política mudar, a data no começo da página muda junto, e mudanças importantes serão avisadas no site.</p>`;

  if (pg === "termos")
    return `<p class="legal-data">Atualizados em ${LEGAL_DATA}.</p>
<p>Estes termos são as regras para usar o Simula Assimilação, uma mesa virtual gratuita para jogar Assimilação RPG com os amigos. Ao usar o site, você concorda com eles e com a ${legalLink("privacidade")}.</p>
<h2>1. O serviço</h2>
<p>O Simula Assimilação é um projeto de fã, gratuito e sem fins lucrativos, mantido pelo ${ZART.nome}. Ele oferece fichas, rolagens, cenas, mapas, documentos, Conflitos e Refúgio. O site é oferecido como está: fazemos o possível para ele funcionar bem, mas não dá para prometer que nunca vai sair do ar ou ter erros. Baixe o backup das suas mesas no Escudo do mestre de vez em quando.</p>
<h2>2. Não é um produto oficial</h2>
<p>O Simula Assimilação não é oficial e não tem ligação com a New Order Editora. Assimilação RPG, seus nomes, símbolos e logo pertencem aos seus donos. O site usa os nomes e os números das regras só para ajudar a jogar; para conhecer as regras completas, use o Livro de Regras oficial.</p>
<h2>3. Sua conta</h2>
<p>Ao abrir o site, você recebe uma conta de convidado guardada neste navegador. Se entrar com Google, suas mesas e personagens passam a valer em qualquer aparelho. Cuide do acesso à sua conta Google: o que for feito com ela no site é de sua responsabilidade.</p>
<h2>4. O que você pode e o que não pode fazer</h2>
<p>Use o site para jogar e preparar suas mesas. Não é permitido:</p>
<ul>
<li>publicar conteúdo ilegal, de ódio, discriminatório, de assédio, violência real contra pessoas, ou qualquer conteúdo sexual envolvendo menores;</li>
<li>subir imagens, textos ou músicas que você não tem direito de usar, ou expor dados pessoais de outras pessoas sem autorização;</li>
<li>usar nomes de mesa ofensivos na lista pública de mesas;</li>
<li>tentar invadir, sobrecarregar, copiar em massa ou atrapalhar o site, as mesas de outras pessoas ou o banco de dados;</li>
<li>cobrar de outras pessoas pelo acesso ao site ou se passar pelo ${ZART.nome}.</li>
</ul>
<h2>5. O que você cria</h2>
<p>As fichas, mesas, imagens e textos que você cria continuam seus. Você nos autoriza apenas a guardar e mostrar esse conteúdo para quem participa da mesa, que é o que faz o site funcionar. Você é responsável pelo que sobe: se subir arte de outra pessoa, tenha a permissão dela. O mestre de cada mesa pode apagar o que estiver na mesa dele.</p>
<h2>6. Conteúdo de terceiros</h2>
<p>As músicas livres da trilha sonora são de Kevin MacLeod (incompetech.com), com licença Creative Commons BY 4.0. As fontes vêm do Google Fonts, com licenças livres. Os vídeos do YouTube tocados pelo mestre seguem as regras do YouTube.</p>
<h2>7. Remoção de conteúdo</h2>
<p>Podemos tirar do ar conteúdo que desrespeite estes termos ou a lei, e retirar da lista pública mesas com nomes impróprios. Para denunciar algo, escreva para ${contato()}.</p>
<h2>8. Responsabilidade</h2>
<p>Como o serviço é gratuito e oferecido como está, não respondemos por perda de dados causada por falhas de terceiros (como o Firebase ou o seu navegador), nem pelo que os usuários publicam nas próprias mesas, sempre dentro do que a lei brasileira permite. Nada nestes termos tira os direitos que o Código de Defesa do Consumidor garante a você.</p>
<h2>9. Mudanças e fim do serviço</h2>
<p>Estes termos podem mudar; a data no começo da página mostra a versão. Se o site for encerrado, avisaremos com antecedência para você baixar os seus dados.</p>
<h2>10. Lei e foro</h2>
<p>Valem as leis do Brasil. Qualquer disputa pode ser levada ao foro do seu domicílio, como garante o Código de Defesa do Consumidor. Antes disso, fale com a gente em ${contato()}.</p>`;

  if (pg === "cookies")
    return `<p class="legal-data">Atualizada em ${LEGAL_DATA}.</p>
<p>O Simula Assimilação não usa cookies de anúncio nem de estatística. Ele guarda algumas informações no seu navegador (armazenamento local) para funcionar, e só carrega conteúdo de terceiros que usa cookies, o YouTube, se você aceitar.</p>
<h2>Essenciais (sempre ligados)</h2>
<ul>
<li><b>Login do Firebase</b>: mantém você conectado e reconhece a sua conta neste navegador.</li>
<li><b>Preferências do site</b>: seu nome nas mesas, mesas visitadas, visual e som do dado, se a ajuda já foi vista e sua escolha sobre cookies.</li>
</ul>
<p>Sem eles, o site não funciona. Eles ficam só no seu navegador e não servem para rastrear você.</p>
<h2>De terceiros (só com a sua permissão)</h2>
<ul>
<li><b>YouTube</b>: quando o mestre toca uma música do YouTube na trilha sonora, o player do YouTube pode guardar cookies dele. Usamos o modo de privacidade aprimorada (youtube-nocookie.com), mas ele só carrega se você aceitar.</li>
</ul>
<h2>Sua escolha agora</h2>
<p id="ckAgora" aria-live="polite">${cookiesTxt()}</p>
<div class="row"><button type="button" class="btn primary" data-ck="aceito">Aceitar cookies de terceiros</button><button type="button" class="btn" data-ck="recusado">Recusar</button></div>
<p class="muted small">Você também pode apagar tudo o que o site guardou limpando os dados do site nas configurações do navegador.</p>`;

  if (pg === "reembolso")
    return `<p class="legal-data">Atualizada em ${LEGAL_DATA}.</p>
<p><b>O Simula Assimilação é gratuito.</b> Não vendemos nada no site: não há assinatura, plano pago, compra dentro do site nem cobrança de nenhum tipo. Por isso, hoje não existe o que cancelar ou reembolsar.</p>
<h2>Se alguém cobrar</h2>
<p>Ninguém está autorizado a cobrar pelo Simula Assimilação em nome do ${ZART.nome}. Se alguém pedir dinheiro para você usar o site, não pague e avise em ${contato()}.</p>
<h2>Se um dia houver algo pago</h2>
<p>Se o site passar a vender alguma coisa, estas regras vão valer:</p>
<ul>
<li><b>Direito de arrependimento:</b> você poderá desistir da compra em até 7 dias, contados da compra ou do recebimento, sem precisar dar motivo, como garante o art. 49 do Código de Defesa do Consumidor.</li>
<li><b>Reembolso integral:</b> o valor pago volta inteiro, pelo mesmo meio de pagamento, sem custo para você.</li>
<li><b>Como pedir:</b> por e-mail, em ${contato()}, com o e-mail usado na compra.</li>
<li>Antes de qualquer cobrança, esta página será atualizada com o preço, o que está incluído e os dados de quem vende.</li>
</ul>`;

  if (pg === "meus-dados")
    return `<p>Aqui você exerce os seus direitos da LGPD sem precisar pedir a ninguém. Veja também a ${legalLink("privacidade")}.</p>
<h2>Baixar meus dados</h2>
<p>Um arquivo (JSON) com a sua conta, o índice das suas mesas, seus personagens, suas fichas nas mesas, suas artes do bestiário, suas anotações e as preferências guardadas neste navegador. Para o conteúdo completo de uma mesa sua, use o backup no Escudo do mestre.</p>
<button type="button" class="btn primary" id="mdBaixar">Baixar meus dados</button>
<h2>Apagar todos os meus dados</h2>
<p>Apaga: as mesas em que você é o mestre (para todos os jogadores delas), suas fichas nas mesas dos outros, sua entrada nessas mesas, seus personagens, suas artes, suas anotações, as preferências deste navegador e a sua conta. <b>Não dá para desfazer.</b> Se você usa outro site do ${ZART.nome} com a mesma conta, o que está lá também é apagado.</p>
<p class="muted small">As rolagens e mensagens que você mandou em mesas de outras pessoas fazem parte do histórico delas. O mestre de cada mesa pode apagá-las, ou você pode pedir a exclusão em ${contato()}.</p>
<button type="button" class="btn danger" id="mdApagar">Apagar todos os meus dados</button>
<h2>Corrigir</h2>
<p>Edite sua ficha, seu personagem ou a sua mesa direto no site. Para corrigir o nome ou a foto da conta Google, mude na própria conta Google.</p>`;
  return "";
}

/* ---------- página (início do site) e janela (dentro da mesa) ---------- */
function paginaLegal(pg) {
  const L = $("#lobby");
  $("#vtt").hidden = true;
  L.hidden = false;
  document.title = LEGAL_PAGINAS[pg] + " · Simula Assimilação";
  L.innerHTML = `<div class="lwrap legal"><div class="row between"><div class="brand">${I.logo()}<div>Simula Assimilação<small>Um projeto do ${ZART.nome}</small></div></div><a class="btn sm" href="#">Voltar ao início</a></div>
   <main id="conteudo" tabindex="-1" class="legal-txt"><h1>${LEGAL_PAGINAS[pg]}</h1>${legalHTML(pg)}</main>
   ${rodapeHTML()}</div>`;
  bindLegal(L);
  window.scrollTo(0, 0);
  $("#conteudo").focus();
}
function janelaLegal(pg) {
  const h = $("#modalHost");
  h.innerHTML = `<div class="modal-back"><div class="modal legal-modal" role="dialog" aria-modal="true" aria-labelledby="lgTit"><div class="row between"><h2 id="lgTit" style="margin:0">${LEGAL_PAGINAS[pg]}</h2><button type="button" class="btn sm" id="mNo">Fechar</button></div><div class="legal-txt">${legalHTML(pg)}</div></div></div>`;
  $("#mNo").onclick = () => (h.innerHTML = "");
  bindLegal(h);
}
/* Os links entre as páginas legais e os botões de cookies e de Meus dados */
function bindLegal(raiz) {
  $$("[data-legal]", raiz).forEach(
    a =>
      (a.onclick = ev => {
        if (S.mesaId) {
          ev.preventDefault(); // dentro da mesa, abre por cima (sem sair da mesa)
          janelaLegal(a.dataset.legal);
        } else if (a.closest("#modalHost")) $("#modalHost").innerHTML = ""; // no início: vai para a página
      })
  );
  $$("[data-ck]", raiz).forEach(
    b =>
      (b.onclick = () => {
        cookiesEscolher(b.dataset.ck);
        const t = $("#ckAgora");
        if (t) t.textContent = cookiesTxt();
      })
  );
  const bx = $("#mdBaixar", raiz);
  if (bx) bx.onclick = () => meusDadosBaixar().catch(fail);
  const ap = $("#mdApagar", raiz);
  if (ap) ap.onclick = () => meusDadosApagar().catch(fail);
}
/* O rodapé do início do site e das páginas legais */
function rodapeHTML() {
  return `<footer class="foot legal-foot">
   <p>Simula Assimilação é um projeto de fã, gratuito e sem fins lucrativos. Não é um produto oficial nem tem ligação com a New Order Editora. Assimilação RPG, seus símbolos e logo pertencem aos seus donos. Os textos de regras do site são resumos próprios; para jogar, use o Livro de Regras oficial.</p>
   <p>Um projeto do ${ZART.nome}. Responsável: ${ZART.nome} · Contato: ${contato()}</p>
   <nav class="legal-links" aria-label="Informações legais">${Object.keys(LEGAL_PAGINAS)
     .map(k => legalLink(k))
     .join("")}</nav></footer>`;
}

/* ---------- cookies ---------- */
const cookiesEscolha = () => (lsGet("sa_cookies", null) || {}).v || "";
const cookiesTerceiros = () => cookiesEscolha() === "aceito";
const cookiesTxt = () =>
  cookiesEscolha() === "aceito"
    ? "Você aceitou os cookies de terceiros (YouTube)."
    : cookiesEscolha() === "recusado"
      ? "Você recusou os cookies de terceiros: as músicas do YouTube não tocam para você."
      : "Você ainda não escolheu. Até escolher, nada de terceiros é carregado.";
function cookiesEscolher(v) {
  lsSet("sa_cookies", { v, ts: Date.now() });
  const b = $("#avisoCookies");
  if (b) b.remove();
  toast(v === "aceito" ? "Cookies de terceiros aceitos." : "Cookies de terceiros recusados.");
  // aceitou com uma música do YouTube tocando: começa a tocar agora
  if (v === "aceito" && MZ.semCookies) {
    MZ.semCookies = false;
    aplicarTrilha();
  }
  if (S.mesaId) renderBoardTop();
}
/* O aviso na primeira visita (até a pessoa escolher) */
function avisoCookies() {
  if (cookiesEscolha() || $("#avisoCookies")) return;
  const d = document.createElement("section");
  d.id = "avisoCookies";
  d.className = "aviso-cookies";
  d.setAttribute("aria-label", "Aviso de cookies");
  d.innerHTML = `<p>O Simula Assimilação guarda no seu navegador só o necessário para funcionar (login e preferências). Músicas do YouTube na trilha sonora usam cookies do YouTube e só tocam se você aceitar. Veja a ${legalLink("cookies", "página de cookies")} e a ${legalLink("privacidade")}.</p>
   <div class="row"><button type="button" class="btn primary" data-ck="aceito">Aceitar</button><button type="button" class="btn" data-ck="recusado">Recusar</button></div>`;
  document.body.appendChild(d);
  bindLegal(d);
}

/* ---------- consentimento nos formulários ---------- */
/* A caixa obrigatória dos formulários, com o uso dos dados e o link para a política */
function consentimentoHTML(id, uso) {
  return `<label class="check consent"><input type="checkbox" id="${id}" name="consent" required> <span>Li e aceito os ${legalLink("termos")} e a ${legalLink("privacidade")}. ${esc(uso)}</span></label>`;
}

/* ---------- Meus dados: baixar e apagar ---------- */
const USUARIO_SUBS = ["mesas", "fichas", "personagens", "artes", "notasDoc"];
async function meusDadosBaixar() {
  if (!S.uid) return;
  const u = S.authUser || {};
  const out = {
    geradoEm: new Date().toISOString(),
    responsavel: ZART.nome,
    conta: { id: S.uid, convidado: !!u.isAnonymous, nome: u.displayName || null, email: u.email || null },
    navegador: {}
  };
  for (const c of USUARIO_SUBS) out[c] = await S.db.getCol(`usuarios/${S.uid}/${c}`).catch(() => []);
  out.fichasNasMesas = [];
  for (const x of out.fichas) {
    const f = await S.db.get(`mesas/${x.mesaId}/fichas/${x.fichaId}`).catch(() => null);
    if (f) out.fichasNasMesas.push({ mesa: x.mesaId, ficha: x.fichaId, dados: f });
  }
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith("sa_"))
        out.navegador[k] = lsGet(k, null);
    }
  } catch (e) {}
  baixar("meus-dados-simula-assimilacao.json", out);
  toast("Arquivo com os seus dados baixado.");
}
async function meusDadosApagar() {
  if (!S.uid) return;
  const r = await formBox(
    "Apagar todos os meus dados?",
    `<p style="margin:0">Somem as mesas em que você é o mestre (para todos), suas fichas nas outras mesas, seus personagens, suas artes, suas anotações e a sua conta. <b>Não dá para desfazer.</b></p>
     <p class="muted small" style="margin:0">Se quiser guardar alguma coisa, baixe antes os seus dados e o backup das suas mesas.</p>
     <div class="field"><label class="label" for="mdConf">Para confirmar, escreva APAGAR</label><input type="text" id="mdConf" name="conf" autocomplete="off" required></div>`,
    "Apagar tudo"
  );
  if (!r) return;
  if (r.conf.trim().toUpperCase() !== "APAGAR") {
    toast("A confirmação não confere. Nada foi apagado.");
    return;
  }
  toast("Apagando os seus dados…");
  if (S.mesaId) location.hash = "";
  const uid = S.uid;
  const minhas = await S.db.getCol(`usuarios/${uid}/mesas`).catch(() => []);
  const mestre = new Set([
    ...minhas.filter(m => m.papel === "mestre").map(m => m.id),
    ...(S.mesas || []).filter(m => m.mestre === uid).map(m => m.id)
  ]);
  for (const id of mestre) await apagarMesaDados(id).catch(() => {});
  // nas mesas dos outros: as minhas fichas e a minha entrada
  const fichas = await S.db.getCol(`usuarios/${uid}/fichas`).catch(() => []);
  for (const x of fichas)
    if (!mestre.has(x.mesaId)) await S.db.del(`mesas/${x.mesaId}/fichas/${x.fichaId}`).catch(() => {});
  for (const m of minhas.filter(m => !mestre.has(m.id))) {
    await S.db.del(`mesas/${m.id}/membros/${uid}`).catch(() => {});
    await S.db.del(`mesas/${m.id}/entrada/${uid}`).catch(() => {});
  }
  for (const c of USUARIO_SUBS)
    for (const d of await S.db.getCol(`usuarios/${uid}/${c}`).catch(() => []))
      await S.db.del(`usuarios/${uid}/${c}/${d.id}`).catch(() => {});
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith("sa_") && k !== "sa_teste")
      .forEach(k => localStorage.removeItem(k));
  } catch (e) {}
  // por último, a conta (o Google pode pedir para entrar de novo antes)
  if (!S.testMode && window.firebase && firebase.auth().currentUser) {
    try {
      await firebase.auth().currentUser.delete();
    } catch (e) {
      await firebase
        .auth()
        .signOut()
        .catch(() => {});
      if (e.code === "auth/requires-recent-login") {
        alert(
          "Seus dados foram apagados. Para apagar também o login da conta Google, entre com Google de novo e repita, ou escreva para " +
            ZART.email +
            "."
        );
      }
    }
  }
  toast("Seus dados foram apagados.");
  setTimeout(() => {
    location.hash = "";
    if (S.testMode)
      showLobby(); // no modo de teste, recarregar perderia o banco de mentira
    else location.reload();
  }, 900);
}

/* ---------- acessibilidade geral ---------- */
/* "Pular para o conteúdo": vai para o conteúdo da tela (o início ou a mesa) sem mexer no endereço */
function pularParaConteudo(ev) {
  ev.preventDefault();
  const alvo = S.mesaId ? $("#board") : $("#conteudo") || $("#lobby");
  if (!alvo) return;
  if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
  alvo.focus();
}
/* Janelas (modais): Esc fecha, o Tab fica dentro dela e o foco volta para onde estava ao fechar */
function janelasAcessiveis() {
  const host = $("#modalHost");
  let antes = null;
  new MutationObserver(() => {
    const m = $(".modal", host);
    if (m) {
      if (!antes) antes = document.activeElement;
      m.setAttribute("role", m.getAttribute("role") || "dialog");
      m.setAttribute("aria-modal", "true");
      const t = $("h1,h2,h3", m);
      if (t && !m.hasAttribute("aria-label") && !m.hasAttribute("aria-labelledby")) {
        t.id = t.id || "mTit" + Date.now();
        m.setAttribute("aria-labelledby", t.id);
      }
      if (!m.contains(document.activeElement))
        setTimeout(() => {
          const f = $("input:not([type=hidden]),select,textarea,button", m);
          if (f && !m.contains(document.activeElement)) f.focus();
        }, 40);
    } else if (antes) {
      const a = antes;
      antes = null;
      if (a && document.contains(a)) a.focus();
    }
  }).observe(host, { childList: true, subtree: true });
  document.addEventListener("keydown", e => {
    const m = $(".modal", host);
    if (!m) return;
    if (e.key === "Escape") {
      const fechar = $("#mNo", m) || $("[data-fechar],.x", m);
      if (fechar) fechar.click();
      else host.innerHTML = "";
      e.preventDefault();
    } else if (e.key === "Tab") {
      const fs = $$(
        "a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select,textarea,[tabindex]:not([tabindex='-1'])",
        m
      ).filter(x => x.offsetParent);
      if (!fs.length) return;
      const [pri, ult] = [fs[0], fs[fs.length - 1]];
      if (e.shiftKey && document.activeElement === pri) {
        ult.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === ult) {
        pri.focus();
        e.preventDefault();
      }
    }
  });
}
