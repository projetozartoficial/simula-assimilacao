import asyncio, sys
from playwright.async_api import async_playwright
URL='http://localhost:8765/index.html#teste'
OUT=(sys.argv[1] if len(sys.argv)>1 else '/tmp')+'/'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1400,'height':900})
        errs=[]
        pg.on('console',lambda m: errs.append(('console',m.type,m.text)) if m.type in ('error','warning') else None)
        pg.on('pageerror',lambda e: errs.append(('pageerror',str(e))))
        try:
         await pg.goto(URL); await pg.wait_for_timeout(800)
         await pg.screenshot(path=OUT+'01-lobby.png',full_page=True)
         await pg.fill('#nmMesa','Teste Vale'); await pg.click('#fNova button.btn.primary')
         await pg.wait_for_timeout(1500)
         print('hash',await pg.evaluate('location.hash'))
         # infectados
         if not await pg.locator('#novaFicha').is_visible(): await pg.click('#rail [data-tool="agentes"]'); await pg.wait_for_timeout(300)
         await pg.click('#novaFicha'); await pg.wait_for_timeout(500)
         await pg.screenshot(path=OUT+'02-ficha.png')
         for t in ['aptidoes','assimilacao','carac','equip','historia','principal']:
             await pg.click(f'[data-stab="{t}"]'); await pg.wait_for_timeout(250)
             await pg.screenshot(path=OUT+f'03-tab-{t}.png',full_page=False)
         # aptidões: subir Percepção e Sobrevivência
         await pg.click('[data-stab="aptidoes"]'); await pg.wait_for_timeout(200)
         await pg.click('[data-inst="Percepção"][data-d="1"]'); await pg.wait_for_timeout(100)
         await pg.click('[data-apt="Sobrevivência"][data-d="1"]'); await pg.wait_for_timeout(100)
         await pg.click('[data-apt="Sobrevivência"][data-d="1"]'); await pg.wait_for_timeout(100)
         # teste
         await pg.click('[data-rta="Sobrevivência"]'); await pg.wait_for_timeout(300)
         await pg.screenshot(path=OUT+'04-teste-monta.png')
         await pg.check('#rlEmp'); await pg.wait_for_timeout(100)
         await pg.click('#rlGo'); await pg.wait_for_timeout(300)
         await pg.screenshot(path=OUT+'05-teste-escolhe.png')
         await pg.click('#rlOk'); await pg.wait_for_timeout(500)
         # agir por instinto
         await pg.click('#btnTeste'); await pg.wait_for_timeout(200)
         await pg.check('#rlIns'); await pg.wait_for_timeout(150)
         await pg.click('#rlGo'); await pg.wait_for_timeout(300)
         await pg.screenshot(path=OUT+'06-instinto.png')
         await pg.click('#rlOk'); await pg.wait_for_timeout(400)
         # cabo de guerra: perder tudo
         await pg.click('[data-stab="principal"]'); await pg.wait_for_timeout(200)
         for i in range(10):
             n=await pg.locator('[data-dpt="perde"]').count()
             if not n: break
             await pg.click('[data-dpt="perde"]'); await pg.wait_for_timeout(250)
             if await pg.locator('#mYes').count():
                 await pg.screenshot(path=OUT+'07-assim-confirm.png')
                 await pg.click('#mYes'); await pg.wait_for_timeout(300)
                 await pg.screenshot(path=OUT+'08-assim-result.png')
                 await pg.click('#taOk'); await pg.wait_for_timeout(300)
                 break
         await pg.screenshot(path=OUT+'09-assim-tab.png')
         if await pg.locator('#pendPuxar').count():
             await pg.click('#pendPuxar'); await pg.wait_for_timeout(300)
             await pg.screenshot(path=OUT+'10-cartas.png',full_page=False)
             boxes=pg.locator('[data-psel]:not([disabled])')
             if await boxes.count(): await boxes.first.check(); await pg.wait_for_timeout(300)
             await pg.screenshot(path=OUT+'11-cartas-sel.png')
             await pg.click('#pendOk'); await pg.wait_for_timeout(300)
             if await pg.locator('#mYes').count(): await pg.click('#mYes'); await pg.wait_for_timeout(300)
             await pg.screenshot(path=OUT+'12-mutacoes.png')
         # saúde: dano
         await pg.click('[data-stab="principal"]'); await pg.wait_for_timeout(200)
         await pg.click('[data-dano="7"]'); await pg.wait_for_timeout(200)
         await pg.screenshot(path=OUT+'13-saude.png',full_page=False)
         # caracteristicas
         await pg.click('[data-stab="carac"]'); await pg.wait_for_timeout(200)
         await pg.click('#caracAdd'); await pg.wait_for_timeout(200)
         # equip
         await pg.click('[data-stab="equip"]'); await pg.wait_for_timeout(200)
         await pg.click('#itemPacote'); await pg.wait_for_timeout(200); await pg.click('#mForm button.btn.primary'); await pg.wait_for_timeout(300)
         await pg.click('#itemAdd'); await pg.wait_for_timeout(200)
         await pg.screenshot(path=OUT+'14-equip.png')
         # rolagens
         await pg.click('#rail [data-tool="rolagens"]'); await pg.wait_for_timeout(400)
         await pg.click('#btnDano'); await pg.wait_for_timeout(400)
         await pg.screenshot(path=OUT+'15-rolagens.png')
         # conflito
         await pg.click('#rail [data-tool="combate"]'); await pg.wait_for_timeout(300)
         await pg.select_option('#cfM','0'); await pg.wait_for_timeout(100)
         await pg.click('#fConf button.btn.primary'); await pg.wait_for_timeout(600)
         await pg.click('#cfRolar'); await pg.wait_for_timeout(400)
         await pg.screenshot(path=OUT+'16-conflito.png',full_page=False)
         inv=pg.locator('[data-cainv]:not([disabled])')
         if await inv.count(): await inv.first.click(); await pg.wait_for_timeout(300)
         go=pg.locator('[data-invgo]')
         if await go.count(): await go.first.click(); await pg.wait_for_timeout(300)
         amr=pg.locator('[data-amr]')
         if await amr.count(): await amr.first.click(); await pg.wait_for_timeout(300)
         await pg.screenshot(path=OUT+'17-conflito2.png',full_page=False)
         # refugio
         await pg.click('#rail [data-tool="refugio"]'); await pg.wait_for_timeout(300)
         await pg.click('#rfCrise'); await pg.wait_for_timeout(200)
         d=pg.locator('#rfRes [data-di]')
         if await d.count(): await d.first.click(); await pg.wait_for_timeout(200)
         await pg.screenshot(path=OUT+'18-refugio.png')
         # escudo
         await pg.click('#rail [data-tool="escudo"]'); await pg.wait_for_timeout(400)
         await pg.screenshot(path=OUT+'19-escudo.png')
         # homebrew
         await pg.click('#rail [data-tool="homebrew"]'); await pg.wait_for_timeout(300)
         for t in ['mutacao','item','ameaca','caracteristica']:
             await pg.click(f'[data-hbt="{t}"]'); await pg.wait_for_timeout(150)
         # regras
         await pg.click('#rail [data-tool="regras"]'); await pg.wait_for_timeout(300)
         for t in ['dados','cabo','saude','criacao','carac','assim','equip','conflito','refugio','testes']:
             await pg.click(f'[data-rt="{t}"]'); await pg.wait_for_timeout(150)
         await pg.click('[data-rt="dados"]'); await pg.wait_for_timeout(150)
         await pg.screenshot(path=OUT+'20-regras.png')
         # tokens / ameaças
         await pg.click('#rail [data-tool="tokens"]'); await pg.wait_for_timeout(300)
         await pg.click('[data-ttab="ameacas"]'); await pg.wait_for_timeout(300)
         await pg.screenshot(path=OUT+'21-tokens.png')
         # npc
         await pg.click('#rail [data-tool="agentes"]'); await pg.wait_for_timeout(300)
         await pg.click('#novoNpc'); await pg.wait_for_timeout(200)
         await pg.select_option('#npM','2'); await pg.click('#mForm button.btn.primary'); await pg.wait_for_timeout(500)
         await pg.screenshot(path=OUT+'22-npc.png')
         await pg.click('#qRolar'); await pg.wait_for_timeout(300)
         await pg.screenshot(path=OUT+'23-npc-rolou.png')
         await pg.click('#rail [data-tool="ajuda"]'); await pg.wait_for_timeout(300)
         await pg.click('#rail [data-tool="documentos"]'); await pg.wait_for_timeout(300)
         await pg.click('#rail [data-tool="cenas"]'); await pg.wait_for_timeout(300)
         await pg.click('#rail [data-tool="trilha"]'); await pg.wait_for_timeout(300)
        finally:
         print('ERRS',[e for e in errs if e[0]=='pageerror'])
        await b.close()
asyncio.run(main())
