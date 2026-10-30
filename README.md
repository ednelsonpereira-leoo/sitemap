# sitemap-modular

Sitemap do Salesforce Personalization / Data Cloud escrito em vários módulos JS e unido em **um arquivo único** no build. Você escreve em `src/` e sobe só o `dist/sitemap.js`.

## Comandos

```bash
npm install
npm run dev        # rebuild a cada alteração + servidor local pra extensão (troca o sitemap no site e recarrega a página)
npm run build      # gera dist/sitemap.js, legível, pra subir no Salesforce
npm run build:min  # mesma coisa, minificado
npm run check      # build + executa o bundle num ambiente simulado e valida a estrutura do sitemap
```

## Estrutura

```
sitemap.config.js        URL do sitemap a trocar, páginas a recarregar, porta, saída
src/
  index.js               junta tudo e chama SalesforceInteractions.init + initSitemap
  init.js                opções do init (cookieDomain etc.)
  global.js              config global: onActionEvent, contentZones globais
  page-type-default.js   page type padrão
  page-types/            um arquivo por page type, entram sozinhos no bundle
  listeners/             listeners globais, um arquivo por responsabilidade, entram sozinhos
  utils/                 helpers importados pelos módulos (dom, catálogo, validação)
extension/               extensão do Chrome pro modo dev
```

Regras dos arquivos que entram sozinhos (`page-types/` e `listeners/`):

- Entram em **ordem alfabética**. Em page types a ordem importa (o primeiro `isMatch()` verdadeiro vence), por isso o prefixo `10-`, `20-`…
- Um arquivo que começa com `_` (ex.: `_rascunho.js`) fica fora do bundle.
- Criar ou apagar um arquivo dispara o rebuild no `npm run dev`, sem reiniciar.
- Page type: `export default { name, isMatch, interaction, ... }`. Listeners: `export default [SalesforceInteractions.listener(...)]`.
- Nome de page type repetido quebra o build de propósito.

## Ver no site real enquanto edita

1. Em `sitemap.config.js`, coloque em `targetUrl` a URL do sitemap que o site carrega hoje e em `sitePatterns` as páginas do site (ex.: `https://www.site.com.br/*`).
2. No Chrome, abra `chrome://extensions`, ligue o **Modo do desenvolvedor**, clique em **Carregar sem compactação** e escolha a pasta `extension/`.
3. Rode `npm run dev` e abra o site.

O que acontece:

- A extensão redireciona a URL do sitemap pro `http://localhost:5577/sitemap.js` (bundle local, sem cache).
- Cada build novo recarrega sozinho as abas que casam com `sitePatterns`. No console da página aparece `[sitemap-dev] sitemap local ativo (build #N)`.
- Erro de sintaxe não recarrega: a página fica com a última versão boa e o erro aparece no terminal e no console.
- Desligou o `npm run dev`? A extensão remove a troca e recarrega a página com o sitemap original.
- O selo do ícone mostra **ON** (trocando), **ERR** (build com erro) ou **OFF** (servidor desligado). Clicar no ícone liga e desliga a extensão.

Mudou `sitemap.config.js`? Reinicie o `npm run dev`. Mudou a `port`? Ajuste também `SERVER` em `extension/background.js`.

### Limitações conhecidas

- **CSP do site:** se o `script-src` do site não permitir `http://localhost:5577`, o Chrome bloqueia o script redirecionado (aparece no console). Nesse caso, use as Local Overrides do DevTools apontando pro `dist/sitemap.js`.
- **Sitemap embutido no beacon:** se a URL configurada entrega o SDK e o sitemap juntos no mesmo arquivo, trocá-la pelo bundle tira o SDK da página. A troca funciona quando o sitemap é um arquivo próprio.

## Migrando o sitemap atual

1. Comece colando o sitemap inteiro, do jeito que está hoje, em `src/` (objeto `global` em `global.js`, cada item de `pageTypes` em um arquivo de `page-types/`, mantendo a ordem original pelos prefixos).
2. Rode `npm run build` e compare `dist/sitemap.js` com o original no site via `npm run dev` antes de refatorar.
3. Depois disso, extraia o que se repete pra `utils/` e os listeners pra `listeners/`, um bloco por vez.

Os módulos de exemplo que vêm no projeto (home, categoria, produto, carrinho, add-to-cart) são só um modelo e devem ser trocados pelos do site.
