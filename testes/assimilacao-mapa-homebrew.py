import sys
import asyncio
from playwright.async_api import async_playwright
URL='http://localhost:8765/index.html#teste'
OUT=(sys.argv[1] if len(sys.argv)>1 else '/tmp')+'/'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1366,'height':860});errs=[]
        await pg.add_init_script("if(!localStorage.getItem('sa_cookies'))localStorage.setItem('sa_cookies',JSON.stringify({v:'recusado'}))")
        pg.on('pageerror',lambda e: errs.append(str(e)))
        try:
            await pg.goto(URL);await pg.wait_for_timeout(700)
            # personagem sem mesa
            await pg.click('#btnNovoSolo');await pg.wait_for_timeout(600)
            await pg.screenshot(path=OUT+'01-solo.png')
            await pg.click('#btnTeste');await pg.wait_for_timeout(200);await pg.click('#rlGo');await pg.wait_for_timeout(200);await pg.click('#rlOk');await pg.wait_for_timeout(300)
            await pg.click('#soloX');await pg.wait_for_timeout(500)
            await pg.fill('#nmMesa','Mapas');await pg.check('#csMesa');await pg.click('#fNova button.btn.primary');await pg.wait_for_timeout(1200)
            await pg.click('#rail [data-tool="cenas"]');await pg.wait_for_timeout(300)
            await pg.click('#btnCriarMapa2');await pg.wait_for_timeout(1200)
            await pg.screenshot(path=OUT+'02-modelos.png')
            await pg.click('[data-mod="1"]');await pg.wait_for_timeout(1500)
            await pg.screenshot(path=OUT+'03-editor.png')
            btn=pg.locator('button:has-text("Usar como cena")').first
            await btn.click();await pg.wait_for_timeout(800)
            if await pg.locator('#mForm').count(): await pg.click('#mForm button.btn.primary');await pg.wait_for_timeout(1500)
            await pg.screenshot(path=OUT+'04-cena.png')
            await pg.click('#mapEd button:has-text("Fechar")');await pg.wait_for_timeout(800)
            if await pg.locator('#mForm').count(): await pg.click('#mForm button.btn.primary');await pg.wait_for_timeout(800)
            await pg.screenshot(path=OUT+'04b-fechado.png')
            await pg.click('button:has-text("Exibir para jogadores")');await pg.wait_for_timeout(1000)
            print('cena aberta',bool(await pg.evaluate('S.viewSid')))
            # tokens: ameaça em cena
            await pg.click('#rail [data-tool="tokens"]');await pg.wait_for_timeout(300)
            await pg.click('[data-ttab="ameacas"]');await pg.wait_for_timeout(300)
            await pg.locator('[data-ame]').nth(2).click();await pg.wait_for_timeout(800)
            await pg.screenshot(path=OUT+'05-ameaca-cena.png')
            # token da ficha
            await pg.click('#rail [data-tool="agentes"]');await pg.wait_for_timeout(300)
            await pg.click('#novaFicha');await pg.wait_for_timeout(400)
            await pg.click('[data-stab="historia"]');await pg.wait_for_timeout(200)
            await pg.click('#btnTokFicha');await pg.wait_for_timeout(300)
            # sem foto: vai pedir imagem — cancela
            await pg.click('#mForm button.btn.primary');await pg.wait_for_timeout(500)
            # documentos
            await pg.click('#rail [data-tool="documentos"]');await pg.wait_for_timeout(300)
            await pg.screenshot(path=OUT+'06-docs.png')
            # homebrew: criar ameaça e característica
            await pg.click('#rail [data-tool="homebrew"]');await pg.wait_for_timeout(300)
            await pg.click('[data-hbt="ameaca"]');await pg.wait_for_timeout(200)
            await pg.fill('#h_n','Bando do Pico Verde');await pg.fill('#h_at','CC Tiro: 2 d10 de dano\nAAA Fuga: recuam');await pg.click('#fHB button.btn.primary');await pg.wait_for_timeout(500)
            await pg.click('[data-hbt="mutacao"]');await pg.wait_for_timeout(200)
            await pg.fill('#h_n','Pele de Musgo');await pg.fill('#h_c','BBA');await pg.click('#fHB button.btn.primary');await pg.wait_for_timeout(500)
            await pg.screenshot(path=OUT+'07-hb.png')
            # adicionar mutação homebrew na ficha
            await pg.click('#rail [data-tool="agentes"]');await pg.wait_for_timeout(300)
            await pg.locator('[data-open]').first.click();await pg.wait_for_timeout(300)
            await pg.click('[data-stab="assimilacao"]');await pg.wait_for_timeout(200)
            await pg.screenshot(path=OUT+'07b.png')
            print('details',await pg.locator('details.more').count(), await pg.locator('#mutHbAdd').count())
            await pg.locator('details.more summary').last.click();await pg.wait_for_timeout(200)
            await pg.click('#mutHbAdd');await pg.wait_for_timeout(300)
            await pg.screenshot(path=OUT+'08-mut.png')
            # clareza
            await pg.click('[data-stab="principal"]');await pg.wait_for_timeout(200)
            await pg.click('#btnClareza');await pg.wait_for_timeout(200);await pg.click('#mForm button.btn.primary');await pg.wait_for_timeout(300)
            await pg.click('#tRepouso');await pg.wait_for_timeout(300)
            await pg.click('#sDano');await pg.wait_for_timeout(200);await pg.fill('#dnQ','12');await pg.click('#mForm button.btn.primary');await pg.wait_for_timeout(300)
            await pg.click('#btnTeste');await pg.wait_for_timeout(300)
            await pg.screenshot(path=OUT+'09-teste-ferido.png')
            await pg.click('#rlGo');await pg.wait_for_timeout(300)
            await pg.screenshot(path=OUT+'10-teste-ferido-dados.png')
            await pg.click('#rlOk');await pg.wait_for_timeout(300)
            # backup export (download)
            await pg.click('#rail [data-tool="escudo"]');await pg.wait_for_timeout(300)
            async with pg.expect_download() as dl:
                await pg.click('details.box summary >> text=Backup da mesa');await pg.wait_for_timeout(200)
                await pg.click('#btnBkp')
            d=await dl.value;print('backup',d.suggested_filename)
        finally:
            print('ERRS',errs)
            await b.close()
asyncio.run(main())
