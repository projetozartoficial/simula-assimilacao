import sys
import asyncio
from playwright.async_api import async_playwright
URL='http://localhost:8765/index.html#teste'
OUT=(sys.argv[1] if len(sys.argv)>1 else '/tmp')+'/'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        ctx=await b.new_context(viewport={'width':1300,'height':850})
        m=await ctx.new_page();errs=[]
        await m.add_init_script("if(!localStorage.getItem('sa_cookies'))localStorage.setItem('sa_cookies',JSON.stringify({v:'recusado'}))")
        for pg,nm in [(m,'M')]:
            pg.on('pageerror',lambda e,nm=nm: errs.append((nm,str(e))))
        try:
            await m.goto(URL);await m.wait_for_timeout(700)
            await m.fill('#nmMesa','Mesa P');await m.check('#csMesa');await m.click('#fNova button.btn.primary');await m.wait_for_timeout(1200)
            h=await m.evaluate('location.hash');print(h)
            # mestre: anuncia conflito simples
            await m.click('#rail [data-tool="combate"]');await m.wait_for_timeout(300)
            await m.fill('#cfN','Travessia do rio');await m.click('#fConf button.btn.primary');await m.wait_for_timeout(500)
            # jogador no celular
            j=await ctx.new_page();await j.set_viewport_size({'width':390,'height':844})
            j.on('pageerror',lambda e: errs.append(('J',str(e))))
            await j.goto('http://localhost:8765/index.html'+h);await j.wait_for_timeout(1500)
            await j.screenshot(path=OUT+'01-porta.png')
            if await j.locator('#pNome').count():
                await j.fill('#pNome','Davi');await j.check('#csPorta');await j.click('#fPorta button');await j.wait_for_timeout(1500)
            await j.screenshot(path=OUT+'02-mesa.png')
            await j.click('#bottomnav [data-tool="agentes"]');await j.wait_for_timeout(400)
            await j.click('#novaFicha');await j.wait_for_timeout(600)
            await j.screenshot(path=OUT+'03-ficha.png',full_page=False)
            await j.click('[data-stab="aptidoes"]');await j.wait_for_timeout(300)
            await j.screenshot(path=OUT+'04-apt.png')
            await j.click('#btnTeste');await j.wait_for_timeout(300)
            await j.screenshot(path=OUT+'05-teste.png')
            await j.click('#rlGo');await j.wait_for_timeout(300)
            await j.screenshot(path=OUT+'06-dados.png')
            await j.click('#rlOk');await j.wait_for_timeout(600)
            await j.click('#bottomnav [data-tool="combate"]');await j.wait_for_timeout(500)
            await j.screenshot(path=OUT+'07-conflito-jog.png')
            await m.wait_for_timeout(500)
            await m.click('#rail [data-tool="escudo"]');await m.wait_for_timeout(300)
            await m.click('#rail [data-tool="combate"]');await m.wait_for_timeout(500)
            await m.screenshot(path=OUT+'08-conflito-mestre.png')
            go=m.locator('[data-invgo]')
            print('investir disponíveis:',await go.count())
            if await go.count(): await go.first.click();await m.wait_for_timeout(500)
            await j.wait_for_timeout(600)
            await j.screenshot(path=OUT+'09-conflito-jog2.png')
            await j.click('#bottomnav [data-tool="refugio"]');await j.wait_for_timeout(400)
            await j.screenshot(path=OUT+'10-refugio-jog.png')
            # lobby do jogador
            await j.evaluate('location.hash=""');await j.wait_for_timeout(800)
            await j.screenshot(path=OUT+'11-lobby.png',full_page=True)
        finally:
            print('ERRS',errs)
            await b.close()
asyncio.run(main())
