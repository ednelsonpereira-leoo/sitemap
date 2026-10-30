// Configuração do ambiente. É o único arquivo que você precisa editar pra apontar pro site.
export default {
  // URL do sitemap que o site carrega hoje. A extensão troca essa URL pelo bundle local.
  // Casa por prefixo, então querystrings de versão (?v=123) também são trocadas.
  targetUrl:
    'https://cdn.evgnet.com/beacon/v5568l555563km3q53x3n3n3i091567519/granprod/scripts/evergage.min.js',

  // Páginas que recarregam sozinhas quando o bundle muda. Aceita * como curinga.
  sitePatterns: ['https://www.grancursosonline.com.br/*'],

  // Porta do servidor local (bundle, versão e config pra extensão).
  port: 5577,

  // Saída do build final.
  outfile: 'dist/sitemap.js',

  // Alvo de sintaxe. es2017 é seguro pro editor de sitemap e navegadores atuais.
  target: 'es2017',
};
