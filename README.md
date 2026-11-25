# Simula Assimilação

Mesa virtual gratuita para jogar **Assimilação RPG** com os amigos: fichas de Infectado, dados de símbolos
(Sucesso, Adaptação e Pressão), cartas de Assimilação, Conflitos, Ameaças, Refúgio, mapas, tokens, documentos
com tarjas e escudo do mestre. Um projeto do Grupo Zart (contato: projetozart@gmail.com).

Projeto de fã, sem fins lucrativos e sem ligação oficial com a New Order Editora. Os textos de regras do site
são resumos escritos para a mesa; para jogar, use o Livro de Regras oficial.

- **Site:** https://projetozartoficial.github.io/simula-assimilacao/
- **Hospedagem:** GitHub Pages, que serve só o arquivo `index.html`.
- **Banco e login:** Firebase (plano Spark gratuito), com Firestore e login anônimo ou Google.

## Como funciona o projeto

O site inteiro é **um único arquivo**, o `index.html`. Para ninguém precisar editar um arquivo de 30 mil
linhas, o código fica em pedaços na pasta `src/`, separados por assunto, e o `build.sh` junta tudo:

```sh
sh build.sh        # gera index.html a partir de src/ (na ordem de src/ordem.txt)
```

O `build.sh` também carimba a data e hora em `VERSAO_SITE` (`js/nucleo/versao.js`). É por ela que o site
avisa os jogadores "Saiu uma versão nova do site" quando você sobe uma atualização.

Para publicar: rode o `build.sh`, suba o `index.html` no GitHub e, se as regras mudaram, cole o
`firestore.rules` no Firebase (Firestore → Regras → Publicar).

### Testar sem Firebase

Abra o site com `#teste` no fim do endereço (`index.html#teste`). Ele usa um banco falso dentro do navegador,
sem regras de segurança, e o selo **MODO DE TESTE** aparece na tela. Servidor local para testar:

```sh
python3 -m http.server 8765    # e abra http://localhost:8765/index.html#teste
```

Os testes automáticos ficam em `testes/` (veja `testes/LEIA.md`): `sh testes/rodar.sh` roda todos e
`sh testes/lint.sh` confere o código com o ESLint.

### Quando algo der errado

- No site, **Como usar → Algo deu errado?** mostra os últimos erros daquela visita, com a versão, o aparelho
  e a mesa. O jogador copia e manda; você já sabe por onde começar.
- Para achar onde mexer: a tabela abaixo diz o que tem em cada arquivo, e todo arquivo começa com uma linha
  explicando o assunto dele.
- Uma função nunca é trocada por outra escondida em outro arquivo. Quando uma parte especial (NPC de ficha
  rápida, classe Sobrevivente, personagem fora de mesa, locais escondidos...) muda o comportamento de uma
  função, a própria função chama a parte especial pelo nome, com um comentário dizendo o arquivo. Exemplo,
  em `js/ficha/ficha-eventos.js`:

```js
function bindSheet() {
  const id = S.openFicha;
  const f = S.fichas[id];
  if (f && f.rapido) bindNpcRapido(id, f); // ficha rápida de NPC (ficha/npcs)
  else bindFichaCompleta();
  ...
  bindEstagio(f, id); // classe Sobrevivente (regras/sobrevivente)
}
```

### Organização do código

- Cada `.js` e cada `.css` é um arquivo normal (sem `<script>` nem `<style>`): o editor colore direito e o
  Prettier formata direto. O `build.sh` põe cada `.js` no seu `<script>` e todo o CSS num `<style>`.
- Tudo fica no escopo global: uma função de um arquivo pode chamar a de outro, desde que só rode depois que a
  página carregou (o `boot()` em `js/iniciar.js` é sempre o último).
- `"use strict"` em todo arquivo.
- Formatação: Prettier com `.prettierrc` (110 colunas). Para formatar tudo:
  `prettier --write "src/**/*.{js,css}"`.
- Ações que gravam no banco e não podem rodar duas vezes num toque duplo começam com
  `if (toqueDuplo("nome")) return;` (`js/nucleo/utilitarios.js`).
- Menus "Opções ▾" e "Mais ▾" usam `menuHTML(id, rótulo, botões)`, também em `utilitarios.js`.

### Regras de Assimilação no código

- **Dados de símbolos:** `FACES` (`js/regras/livro.js`) converte a face do d6, d10 ou d12 em símbolos
  (`A` = Sucesso, `B` = Adaptação, `C` = Pressão). `rollPool({d6, d10, d12})` rola; `somaSim` soma.
- **Registro:** o texto de uma rolagem começa com `[[a,b,c]]` (símbolos mantidos) e `{{6:3,5*;10:7*}}` (cada
  dado; `*` = mantido). `detHTML` e `totHTML` (`js/ficha/simbolos.js`) desenham isso no registro e no popup.
- **Teste:** `abrirTeste(fichaId, {inst, apt})` (`js/ficha/ficha-rolagens.js`) monta Instinto (d6) +
  Conhecimento ou Prática (d10), Empenho, Origem e Agir por Instinto (d12), desconta Determinação e
  Assimilação na hora e deixa o jogador escolher quais dados manter (`melhorSel` sugere a melhor escolha).
- **Ficha:** `derivados(f)` (`js/ficha/ficha.js`) calcula Cabo de Guerra (D e E), Saúde (6 níveis), Pressões e
  Experiência. `cur(f, "pv" | "d" | "e")` é o que sobra agora. A Ameaça (ficha rápida) usa `derAmeaca`
  (`js/ficha/npcs.js`): `pvMax` é o custo de Neutralização, `pv` o que falta.
- **Assimilação:** perder um Nível de Determinação chama `testeAssimilacao`; o resultado fica em `f.assimPend`
  até o repouso, quando o jogador puxa e escolhe as cartas (`ASSIMILACOES`, em `livro.js`). Mutações homebrew
  entram por `mutsHomebrew` (`js/ficha/catalogos.js`).
- **Conflito:** fica em `mesas/<código>/estado/combate` com `ativo`, objetivos, condicionantes, dados,
  ativações e as Ameaças (`ameacas`, ids de NPC). A lista de iniciativa do Simula Ordem (`lista`) fica vazia.
- **Refúgio:** fica no próprio documento da mesa, no campo `refugio` (só o mestre grava).

### Separado do Simula Ordem

O site pode usar o mesmo projeto do Firebase do Simula Ordem. Para não misturar:

- as mesas do Assimilação têm código com **AS** na frente (`ehMesaA`, em `js/nucleo/estado.js`) e o lobby só
  mostra essas;
- Meus personagens só mostra fichas de Assimilação (`ehFichaA`);
- as chaves do navegador começam com `sa_` e os backups têm tipo `simula-assimilacao-...`.

O Simula Ordem não tem esse filtro: no lobby dele as mesas e personagens do Assimilação aparecem. Para separar de
vez, crie outro projeto no Firebase, cole a configuração em `js/nucleo/firebase-config.js`, publique o
`firestore.rules` e autorize o domínio `projetozartoficial.github.io` em Authentication.

### O que o jogador não vê

O que o mestre esconde não aparece para o jogador em lugar nenhum:

- **Mapa:** token oculto ou dentro de local escondido/névoa não é desenhado (`tokVisivel`, em `mapa/tabuleiro.js`).
- **Painel Tokens:** em cena, só o que ele enxerga no mapa; na biblioteca, só os tokens dele.
- **Conflito:** `entradaVisivel` (`jogo/combate-no-mapa.js`). Ameaça com token oculto ou NPC escondido não
  aparece para o jogador no painel Conflito. O mestre vê tudo.
- **Infectados:** a ficha de NPC escondido nem chega ao jogador (regra `npcs` no `firestore.rules`).

### Como a ficha salva

A ficha guarda a última versão que veio do banco (`S.fichaBase`) e, ao salvar, grava só os campos que mudaram
(`queueMerge`). Assim, se o mestre e o jogador mexem na mesma ficha ao mesmo tempo, um não apaga o que o outro
fez. Se chega uma versão nova enquanto a ficha está salvando, ela espera e entra logo depois
(`fichaDoBanco` em `js/ficha/ficha.js`).

## Pastas

| Pasta / arquivo | O que tem |
| --- | --- |
| `src/` | O código, em pedaços (lista abaixo) |
| `src/ordem.txt` | A ordem em que os pedaços entram no `index.html` |
| `build.sh` | Junta `src/` em `index.html` e carimba a versão |
| `index.html` | O site pronto: é o arquivo que vai para o GitHub |
| `firestore.rules` | Quem pode ler e escrever o quê no Firebase |
| `testes/` | Testes automáticos (abrem o site num navegador e conferem cada recurso) e o lint (`testes/lint/`) |
| `audio/` | Músicas livres (MP3) da Trilha sonora, sem anúncio. Os nomes dos arquivos estão em `TRILHAS_LIVRES` (`js/jogo/trilha-sonora.js`). Músicas de Kevin MacLeod (incompetech.com), licença CC BY 4.0 |

## O que tem em `src/`

`pagina/cabecalho.html` é o `<head>` (título, ícone, fontes) e `pagina/corpo.html` é o esqueleto da página
(barra lateral, tabuleiro, painel e os scripts do Firebase).

### `estilo/` (o visual)

A ordem dos `.css` importa: quando duas regras empatam, vale a que vem depois.

| Arquivo | O que tem |
| --- | --- |
| `base.css` | Cores, fontes, botões, campos e caixas usados no site todo |
| `lobby.css` | Tela inicial |
| `mesa.css` | Mesa virtual: trilho, tabuleiro, painel lateral e barra de baixo no celular |
| `listas.css` | Listas e cards do painel |
| `ficha.css` | Ficha do Infectado |
| `rolagens.css` | Rolagens, registro e popup de dado |
| `combate-escudo.css` | Conflito, escudo do mestre e homebrew |
| `janelas.css` | Janelas (modal), avisos (toast) e chamadas |
| `ficha-detalhes.css` | Ficha: barras e cards |
| `mapa.css` | Mapa: camadas, ferramentas, tokens, NPCs e vez no combate |
| `criador-mapas.css` | Criador de mapas |
| `documentos.css` | Documentos: papéis de cada modelo, biblioteca, editor; ajuda, NPCs e galeria |
| `toque-celular.css` | Ajustes de toque e de celular, capa, aviso de versão nova e documentos no mapa |
| `tarjas.css` | Estilos de tarja dos documentos |
| `cartaz-email-audio.css` | Modelos de documento: cartaz, e-mail e áudio |
| `notas-mural.css` | Anotações do jogador e mural de pistas |
| `portas.css` | Portas e passagens entre cenas |
| `assimilacao.css` | Símbolos dos dados, dados d6/d10/d12, Cabo de Guerra, Saúde, Aptidões, cartas, itens, Conflito e Refúgio |

### `js/` (o código), por pasta

#### `js/nucleo/` — O motor do site: banco, dados, estado, utilitários, erros, versão

| Arquivo | O que faz |
| --- | --- |
| `firebase-config.js` | Configuração do projeto Firebase (banco de dados e login) |
| `dados.js` | Rolagem de dados numéricos (2d6+3); os dados de símbolos ficam em `regras/livro.js` |
| `banco.js` | Banco de dados: Firebase de verdade ou banco de teste no navegador (#teste) |
| `imagens.js` | Imagens: carregar e comprimir no navegador antes de salvar |
| `utilitarios.js` | Funções pequenas usadas no site todo: $, esc, toast, caixas de confirmação, menus |
| `erros.js` | Erros: o site guarda os últimos erros desta visita. Em Como usar → "Algo deu errado?" |
| `icones.js` | Ícones SVG da interface |
| `estado.js` | Estado do site (objeto S) e início: login, modo de teste, abrir a mesa do link; `ehMesaA` e `ehFichaA` |
| `recorte-imagem.js` | Recortar imagem (foto da ficha e tokens) |
| `versao.js` | Versão do site e aviso de versão nova |

#### `js/regras/` — Regras do Livro de Regras de Assimilação RPG, painel Regras e Refúgio

| Arquivo | O que faz |
| --- | --- |
| `livro.js` | Dados de símbolos (`FACES`, `rollPool`), Instintos, Conhecimentos e Práticas, Saúde, Características, as 52 cartas de Assimilação com as mutações, equipamentos e artefatos, pacotes iniciais, progressão e dificuldades de Conflito, Conflitos e Ameaças do livro (nomes e números; efeitos resumidos com palavras próprias) |
| `aba-regras.js` | Painel Regras: resumo das regras em abas |
| `refugio.js` | Painel Refúgio: níveis do Refúgio e da Região, reservas, construções, Crises e Tragédias |

#### `js/mesa/` — Tela inicial, entrar na mesa, barra de ferramentas, ajuda, backup, Meus personagens

| Arquivo | O que faz |
| --- | --- |
| `lobby.js` | Tela inicial: criar mesa, entrar com código, Meus personagens (com "Tirar da lista"), mesas públicas (só as mesas AS) |
| `mesa.js` | Entrar e sair de uma mesa: senha, aprovação, assinaturas do banco |
| `navegacao.js` | Barra de ferramentas (trilho e barra de baixo) e o painel lateral |
| `backup.js` | Backup: baixar e restaurar fichas e mesas inteiras (.json), com as artes do bestiário |
| `ajuda.js` | Como usar o site (painel e janela de ajuda) |
| `personagens.js` | Meus personagens: fichas fora de mesa, levar e trazer de mesas |
| `capa.js` | Capa da mesa (lobby e tela de entrada) |

#### `js/ficha/` — Ficha do Infectado, NPCs e Ameaças

| Arquivo | O que faz |
| --- | --- |
| `catalogos.js` | Ameaças do livro somadas às do Homebrew (`allBest`) e mutações homebrew (`mutsHomebrew`) |
| `simbolos.js` | Ícones de Sucesso, Adaptação e Pressão, dados na tela e no registro (`detHTML`, `totHTML`) |
| `ficha.js` | Ficha: números calculados (Cabo de Guerra, Saúde, Pressões, Experiência), fotos por estado (`fotoAtual`), salvar e lista de Infectados |
| `ficha-html.js` | Ficha: o que aparece em cada aba (Principal, Aptidões, Assimilação, Características, Equipamentos, História) |
| `ficha-rolagens.js` | Teste (`abrirTeste`), Teste de Assimilação (`testeAssimilacao`), rolagens livres (`rolarPoolLog`, `rolarDanoLog`) |
| `ficha-eventos.js` | Ficha: o que cada botão faz; regras de Determinação (`perderD`), dano (`aplicarDano`), repouso e Clareza de Propósito |
| `npcs-sincronia.js` | NPCs do mestre: receber do banco e onde cada ficha é salva |
| `npcs.js` | Ameaças (ficha rápida: dados, ativações, Neutralização), NPC com ficha completa, modelos do livro, duplicar e pastas |
| `arte-criaturas.js` | Arte original das Ameaças sem imagem, pelo tipo (Fauna, Flora, Carniçal...) e escolhida pelo nome (`arteCriatura`, `sementeDe`) |
| `criaturas.js` | Retrato de NPC sem arte, arte da ficha (`arteDaFicha`), pôr Ameaça ou pasta inteira na cena (`ameacaEmCena`, `porGrupoEmCena`) |
| `galeria-artes.js` | Galeria de artes das Ameaças (imagens que o mestre sobe na mesa e na conta) |

#### `js/mapa/` — Tabuleiro, cenas, tokens, portas, locais escondidos e o criador de mapas

| Arquivo | O que faz |
| --- | --- |
| `cenas.js` | Cenas: criar, exibir para os jogadores, trocar de cena |
| `tokens.js` | Tokens: criar, mover, imagem, cor; aba Ameaças com filtro pelo tipo de Ameaça |
| `tabuleiro.js` | Tabuleiro: zoom, névoa, desenhos, régua, ferramentas do mapa e desenho da cena |
| `arte.js` | Criador de mapas: pisos, paredes, portas e acabamento desenhados por código |
| `objetos.js` | Criador de mapas: todos os objetos (móveis, carros, árvores...) |
| `editor.js` | Criador de mapas: o editor (ferramentas, desfazer, virar cena) |
| `modelos.js` | Criador de mapas: mapas prontos |
| `locais.js` | Locais escondidos do mapa (salas pretas até o mestre revelar) |
| `tokens-extras.js` | Tokens: não redesenhar durante o arrasto e foto de NPC no token |
| `portas.js` | Portas que abrem, portas trancadas e passagens entre cenas |

#### `js/legal/` — Privacidade, regras e acessibilidade

| Arquivo | O que faz |
| --- | --- |
| `legal.js` | Páginas legais (LGPD e Código de Defesa do Consumidor): Política de Privacidade, Termos de Uso, Cookies, Reembolso e Meus dados, em `#privacidade`, `#termos`, `#cookies`, `#reembolso`, `#meus-dados` (no início do site) ou em janela dentro da mesa (`janelaLegal`, pela Ajuda). Aviso de cookies na primeira visita (`avisoCookies`, escolha em `sa_cookies`; o YouTube da trilha só carrega com o aceite), caixa de consentimento nos formulários (`consentimentoHTML`), rodapé com o responsável (`rodapeHTML`), "Pular para o conteúdo" e janelas que fecham com Esc e devolvem o foco |

Os textos legais ficam todos em `legal.js` (`legalHTML`). Mudou alguma coisa em como os dados são usados?
Atualize o texto e a data em `LEGAL_DATA`. O responsável e o e-mail ficam em `ZART`.

#### `js/jogo/` — Rolagens, Conflito, privado e trilha sonora

| Arquivo | O que faz |
| --- | --- |
| `popup-dados.js` | Resultado de dado que aparece na tela de todos e registro da mesa; visual do dado (`SKINS_DADO`) e som com mudo |
| `rolagens.js` | Painel Rolagens: teste da ficha, dados de símbolos, dano, dado numérico, chat, visual do dado; registro com data (`quandoRolou`) |
| `combate.js` | Painel Conflito: objetivos, condicionantes, dados e ativações do Conflito, Ameaças, investir os Sucessos dos Infectados |
| `privado.js` | Privado: sussurros, rolagens só para o mestre e entrega de documentos |
| `combate-no-mapa.js` | Conflito no mapa: centrar no token, pôr as Ameaças da cena no Conflito, o que o jogador não enxerga |
| `trilha-sonora.js` | Trilha sonora: YouTube, arquivos e músicas livres sincronizadas para todos |

#### `js/mestre/` — Ferramentas do mestre: escudo, acesso, homebrew, gestão, copiar cena

| Arquivo | O que faz |
| --- | --- |
| `escudo.js` | Escudo do mestre: capa, acesso, Infectados da mesa, Experiência e tempo para todos, anotações, referência, rolagens secretas |
| `homebrew.js` | Homebrew: Características, mutações, itens e Ameaças criados pelo mestre |
| `acesso.js` | Acesso à mesa: quem entra, senha, aprovação, bloqueio |
| `gestao.js` | Gestão: apagar mesa, retirar ficha, virar NPC, dar ficha a um jogador, repetidas |
| `copiar-cena.js` | Copiar cena ou mapa para outra mesa do mesmo mestre |

#### `js/documentos/` — Documentos com tarjas, passar, no mapa, anotações e mural

| Arquivo | O que faz |
| --- | --- |
| `documentos.js` | Documentos: modelos, tarjas, carimbo (`carimboHTML`), caneta `((…))` (`docFmt`), biblioteca do mestre, leitura e editor |
| `passar.js` | Documentos: passar de mão em mão, recolher, mover |
| `no-mapa.js` | Documentos jogados no mapa como papéis numa mesa: girados (`rot`), tamanho (`esc`), o último mexido por cima (`z`); `papelHTML` desenha, `medirPapel` acerta a altura |
| `mural-notas.js` | Anotações e grifos do jogador e o mural de pistas |

`js/iniciar.js` chama `boot()` e é sempre o último arquivo.

### Quem chama quem (os pontos principais)

- `documentosHTML()` (`documentos/documentos.js`) monta o painel: mural, biblioteca, entregues
  (`docsEntreguesHTML`, em `passar.js`) e no mapa (`docsNoMapaHTML`, em `no-mapa.js`).
- `escudoHTML()` (`mestre/escudo.js`) chama `escudoCapaHTML()` (`mesa/capa.js`) e `escudoApagarHTML()`
  (`mestre/gestao.js`).
- `renderBoard()` (`mapa/tabuleiro.js`) desenha portas e passagens (`mapa/portas.js`); `renderNomes()` mostra
  os documentos no mapa (`renderMapDocs`) e `renderFog()` pinta os locais escondidos (`fogLocais`).
- `derivados(f)` (`ficha/ficha.js`) calcula Cabo de Guerra, Saúde, Pressões e Experiência; para Ameaça, chama
  `derAmeaca` (`ficha/npcs.js`).
- `sheetHTML()` e `bindSheet()` desenham e ligam a ficha; a ficha rápida de NPC fica em `ficha/npcs.js`, o
  menu Opções em `mestre/gestao.js` (`fichaAcoes`).

## Firebase: onde cada coisa fica

Tudo de uma mesa fica em `mesas/<código>/...`. As regras completas estão em `firestore.rules`.

| Caminho | O que é | Quem lê / escreve |
| --- | --- | --- |
| `portas/<código>` | Nome, descrição, tipo de acesso e capa da mesa | Todos leem; o mestre escreve |
| `mesas/<código>` | A mesa (mestre, cena exibida, Refúgio) | Membros leem; o mestre escreve |
| `.../membros`, `.../bloqueados`, `.../entrada` | Quem está na mesa, quem foi bloqueado, pedidos de entrada | Ver regras |
| `.../fichas` | Fichas dos Infectados | Todos leem; cada um edita a sua; o mestre edita todas |
| `.../npcs` | NPCs e Ameaças | O mestre; jogadores só leem os visíveis |
| `.../cenas`, `.../cenaImg`, `.../nevoa` | Cenas (com portas e passagens), imagens e névoa | O mestre; jogadores só a cena exibida |
| `.../pos` | Posição dos tokens | O mestre move todos; cada jogador só o próprio |
| `.../tokens` | Biblioteca de tokens | Todos leem; cada um edita os seus |
| `.../docs` | Biblioteca de documentos com as tarjas originais | Só o mestre |
| `.../privado` | Sussurros, rolagens secretas e documentos entregues | Só quem mandou e quem recebeu |
| `.../estado` | Conflito, trilha sonora e documentos no mapa | Todos leem; o mestre escreve |
| `.../mapas` | Mapas do criador | Só o mestre |
| `.../mural` | Mural de pistas: documentos, bilhetes e barbantes (`tipo`: doc, nota, fio) | Todos leem e pregam; qualquer um arruma; o texto só muda quem pregou ou o mestre |
| `usuarios/<uid>/...` | Minhas mesas, Meus personagens, anotações nos documentos (`notasDoc`) | Só a própria pessoa |
