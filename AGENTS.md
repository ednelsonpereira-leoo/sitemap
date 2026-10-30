# Instruções para agentes de IA

- Este repositório gera UM arquivo de sitemap do Salesforce Interactions SDK (`dist/sitemap.js`) a partir de módulos em `src/`.
- Nunca edite `dist/`. Edite `src/` e rode `npm run check`.
- Page type novo = arquivo novo em `src/page-types/` com prefixo numérico de ordem e `export default { name, isMatch, interaction }`. Não registre em `index.js`; a pasta é importada automaticamente.
- Listener global novo = arquivo em `src/listeners/` exportando um array de `SalesforceInteractions.listener(...)`.
- Leitura de dados do DOM fica em `src/utils/` (uma fonte só por dado), não espalhada pelos page types.
- `SalesforceInteractions` é global (vem do SDK carregado antes do sitemap); não importe.
- Sintaxe alvo: es2017. Sem dependências de runtime: tudo que entra no bundle precisa ser código próprio.
