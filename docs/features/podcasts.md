# Podcasts — incremento v0.3.0-alpha.1

## Incluído

- biblioteca de podcasts em primeiro plano;
- capas maiores e nomes legíveis;
- pesquisa e paginação de podcasts;
- episódios recentes ou filtrados por podcast;
- pesquisa avançada por estado, explícito e favoritos;
- vistas Lista e Grelha;
- leitor interno da descrição do episódio;
- player e progresso;
- parser RSS/Atom;
- atualização sem duplicar `(podcast, guid)`.

## Atualização RSS

`PodcastSyncButton.vue` usa o endereço `rss_url`, analisa RSS/Atom e cria ou atualiza `podcast_episodios`. O índice único `(podcast, guid)` continua a ser a proteção principal contra duplicados.

### Limitação CORS

A sincronização no browser só funciona quando o servidor RSS permite CORS. Para feeds que bloqueiam pedidos do navegador, a sincronização deve ser executada num hook/endpoint do PocketBase. Não deve ser usado um proxy público de terceiros porque o feed pode conter URLs privadas ou parâmetros sensíveis.
