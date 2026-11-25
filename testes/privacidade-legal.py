import asyncio,sys,json
from playwright.async_api import async_playwright
# Privacidade e acessibilidade (LGPD, CDC, WCAG AA): aviso de cookies na primeira visita, YouTube só com
# cookies aceitos, páginas legais (#privacidade, #termos, #cookies, #reembolso, #meus-dados), rodapé com o
# responsável, consentimento obrigatório nos formulários, links legais dentro da mesa sem sair dela,
# janelas com Esc e foco de volta, "Pular para o conteúdo", alt nas imagens, contraste mínimo de 4,5:1 e
# Meus dados (baixar e apagar tudo).
SP=sys.argv[1] if len(sys.argv)>1 else ".";U="http://localhost:8765/index.html"
# contraste de todo texto visível contra o fundo real (pulando o que está desabilitado e as imagens)
AUD=r"""(()=>{
 const P=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const v=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r:v[0],g:v[1],b:v[2],a:v.length>3?v[3]:1}};
 const lum=c=>{const f=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const mix=(t,b)=>({r:t.r*t.a+b.r*(1-t.a),g:t.g*t.a+b.g*(1-t.a),b:t.b*t.a+b.b*(1-t.a),a:1});
 const fundo=el=>{const pilha=[];let e=el;while(e&&e.nodeType===1){const cs=getComputedStyle(e);if(cs.backgroundImage&&cs.backgroundImage!=='none'&&!/gradient/.test(cs.backgroundImage))return null;const c=P(cs.backgroundColor);if(c&&c.a>0)pilha.push(c);if(c&&c.a>=1)break;e=e.parentElement}
   let b={r:11,g:9,b:15,a:1};for(let i=pilha.length-1;i>=0;i--)b=mix(pilha[i],b);return b};
 const ruins=[];
 for(const el of document.querySelectorAll('body *')){
   if(!el.offsetParent&&getComputedStyle(el).position!=='fixed')continue;
   const txt=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
   if(!txt||el.closest('svg,.docview,.papel,.mdoc,.tok,.dpop,canvas,[disabled],[aria-disabled=true]'))continue;
   const cs=getComputedStyle(el);if(cs.visibility==='hidden')continue;
   let c=P(cs.color);const b=fundo(el);if(!c||!b)continue;let op=1;let e=el;while(e){op*=+getComputedStyle(e).opacity;e=e.parentElement}
   if(op<.6)continue; // apagado de propósito (desabilitado, fora de uso)
   c=mix({...c,a:c.a*op},b);const L1=lum(c),L2=lum(b);const r=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
   const big=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&+cs.fontWeight>=700);
   if(r<(big?3:4.5))ruins.push(r.toFixed(2)+' '+txt.slice(0,30));
 }
 return ruins})()"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    ctx=await b.new_context(viewport={"width":1280,"height":900},accept_downloads=True);errs=[];ok=[]
    await ctx.add_init_script("if(!localStorage.getItem('sa_nome'))localStorage.setItem('sa_nome',JSON.stringify('Mestre'));localStorage.setItem('sa_ajuda','true')")
    x=await ctx.new_page();x.on("pageerror",lambda e:errs.append(str(e)))
    await x.goto(U+"#teste");await x.wait_for_timeout(800)
    # ---------- primeira visita ----------
    ini=await x.evaluate("""({aviso:!!document.querySelector('#avisoCookies [data-ck=aceito]')&&!!document.querySelector('#avisoCookies [data-ck=recusado]'),
      rodape:document.querySelector('.legal-foot').textContent,links:[...document.querySelectorAll('.legal-foot [data-legal]')].map(a=>a.dataset.legal),
      h1:document.querySelectorAll('h1').length,alt:[...document.querySelectorAll('img')].every(i=>i.hasAttribute('alt'))})""")
    print("início:",{k:(v if k!="rodape" else v[:60]+"…") for k,v in ini.items()})
    ok.append(ini["aviso"] and "Um projeto do Grupo Zart" in ini["rodape"] and "Responsável: Grupo Zart" in ini["rodape"] and "projetozart@gmail.com" in ini["rodape"]
      and ini["links"]==["privacidade","termos","cookies","reembolso","meus-dados"] and ini["h1"]==1 and ini["alt"])
    # pular para o conteúdo: é o primeiro do Tab e leva o foco para o conteúdo
    await x.keyboard.press("Tab")
    pr=await x.evaluate("document.activeElement.id")
    await x.keyboard.press("Enter");await x.wait_for_timeout(100)
    foco=await x.evaluate("document.activeElement.id")
    print("pular:",pr,"→",foco);ok.append(pr=="pular" and foco=="conteudo")
    # YouTube: sem escolher, não carrega
    await x.evaluate("carregarYT(()=>{})")
    yt0=await x.evaluate("[...document.scripts].some(s=>/youtube/.test(s.src))")
    await x.click("#avisoCookies [data-ck=recusado]");await x.wait_for_timeout(200)
    rec=await x.evaluate("({sumiu:!document.querySelector('#avisoCookies'),v:JSON.parse(localStorage.getItem('sa_cookies')).v})")
    print("YouTube antes de escolher:",yt0,"| recusou:",rec);ok.append(not yt0 and rec=={"sumiu":True,"v":"recusado"})
    # ---------- páginas ----------
    pags={}
    for pg,deve in [("privacidade",["LGPD","Grupo Zart","art. 18","ANPD","Firebase","15 dias"]),("termos",["Código de Defesa do Consumidor","não é oficial","Kevin MacLeod"]),
                    ("cookies",["YouTube","Essenciais"]),("reembolso",["art. 49","7 dias","gratuito"]),("meus-dados",["Baixar meus dados","Apagar todos"])]:
      await x.evaluate(f"location.hash='{pg}'");await x.wait_for_timeout(300)
      t=await x.evaluate("document.querySelector('#conteudo').innerText")
      h=await x.evaluate("document.querySelector('#conteudo h1').textContent")
      pags[pg]=[h]+[d for d in deve if d not in t]
    print("páginas (título e o que faltou):",pags);ok.append(all(len(v)==1 for v in pags.values()))
    await x.evaluate("location.hash='cookies'");await x.wait_for_timeout(300)
    await x.click("#conteudo [data-ck=aceito]");await x.wait_for_timeout(200)
    ac=await x.evaluate("JSON.parse(localStorage.getItem('sa_cookies')).v+' | '+document.querySelector('#ckAgora').textContent")
    await x.evaluate("carregarYT(()=>{})")
    yt1=await x.evaluate("[...document.scripts].some(s=>/youtube.com\\/iframe_api/.test(s.src))")
    print("aceitou:",ac,"| YouTube carrega:",yt1);ok.append(ac.startswith("aceito") and "aceitou" in ac and yt1)
    ruins={}
    for pg in ["privacidade","meus-dados"]:
      await x.evaluate(f"location.hash='{pg}'");await x.wait_for_timeout(300);ruins[pg]=await x.evaluate(AUD)
    # ---------- consentimento no formulário ----------
    await x.evaluate("location.hash=''");await x.wait_for_timeout(500)
    ruins["início"]=await x.evaluate(AUD)
    await x.fill("#nmMesa","Sem aceite");await x.click("#fNova button.primary");await x.wait_for_timeout(600)
    sem=await x.evaluate("!S.mesaId&&!document.querySelector('#csMesa').checkValidity()")
    await x.check("#csMesa");await x.click("#fNova button.primary");await x.wait_for_timeout(900)
    com=await x.evaluate("!!S.mesaId")
    print("sem aceite não cria:",sem,"| com aceite cria:",com);ok+= [sem,com]
    # ---------- dentro da mesa ----------
    await x.evaluate("(()=>{const f=novaFicha();Object.assign(f,{nome:'Iara',dono:S.uid,classe:'Ocultista',nex:20});S.fichas.fA=f;saveFicha('fA',true)})()")
    await x.evaluate("openTool('ajuda')");await x.wait_for_timeout(300)
    await x.focus("#pbody [data-legal=privacidade]");await x.keyboard.press("Enter");await x.wait_for_timeout(300)
    jan=await x.evaluate("({mesa:!!S.mesaId,janela:!!document.querySelector('.legal-modal'),dialog:document.querySelector('.legal-modal').getAttribute('aria-modal')})")
    await x.keyboard.press("Escape");await x.wait_for_timeout(200)
    esc=await x.evaluate("({fechou:!document.querySelector('.legal-modal'),foco:document.activeElement.dataset.legal||document.activeElement.tagName})")
    print("na mesa:",jan,"| Esc:",esc);ok.append(jan=={"mesa":True,"janela":True,"dialog":"true"} and esc["fechou"] and esc["foco"]=="privacidade")
    for tool in ["agentes","rolagens","combate","tokens","documentos","escudo"]:
      await x.evaluate(f"openTool('{tool}')");await x.mouse.move(2,2);await x.wait_for_timeout(300);ruins[tool]=await x.evaluate(AUD)
    alt=await x.evaluate("[...document.querySelectorAll('img')].filter(i=>!i.hasAttribute('alt')).map(i=>i.className||i.src.slice(0,30))")
    ruins={k:v for k,v in ruins.items() if v}
    print("contraste abaixo de 4,5:1:",ruins,"| imagens sem alt:",alt);ok.append(not ruins and not alt)
    # ---------- Meus dados ----------
    await x.evaluate("location.hash='meus-dados'");await x.wait_for_timeout(500)
    async with x.expect_download() as dl: await x.click("#mdBaixar")
    d=await dl.value;dados=json.loads(open(await d.path()).read())
    print("baixou:",sorted(dados.keys()),"| mesas:",len(dados["mesas"]))
    ok.append(dados["responsavel"]=="Grupo Zart" and dados["conta"]["id"] and len(dados["mesas"])==1 and "sa_cookies" in dados["navegador"])
    mesa=await x.evaluate("S.db.getCol('usuarios/'+S.uid+'/mesas').then(l=>l[0].id)")
    await x.click("#mdApagar");await x.wait_for_timeout(200);await x.fill("#mdConf","APAGAR");await x.click("#mForm button.primary")
    await x.wait_for_timeout(2500)
    apag=await x.evaluate(f"""(async()=>({{porta:await S.db.get('portas/{mesa}'),mesa:await S.db.get('mesas/{mesa}'),idx:(await S.db.getCol('usuarios/'+S.uid+'/mesas')).length,
      ls:Object.keys(localStorage).filter(k=>k.startsWith('sa_')&&k!=='sa_teste')}}))()""")
    print("apagou:",apag);ok.append(apag["porta"] is None and apag["mesa"] is None and apag["idx"]==0)
    print("OK" if all(ok) else "FALHOU "+str(ok))
    print("ERRS",errs);await b.close()
asyncio.run(main())
