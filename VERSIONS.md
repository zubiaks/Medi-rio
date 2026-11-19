# Versões do Mediário

Este documento identifica as versões do projeto, o objetivo de cada marco e o estado das funcionalidades. Deve ser atualizado no mesmo commit que altera a versão da aplicação.

O Mediário segue [Semantic Versioning](https://semver.org/) no formato:

```text
MAJOR.MINOR.PATCH
```

- **MAJOR**: alterações incompatíveis, migrações profundas ou nova arquitetura.
- **MINOR**: novas funcionalidades compatíveis.
- **PATCH**: correções, segurança, desempenho e melhorias sem quebra de compatibilidade.

Durante a fase inicial são usados sufixos de pré-lançamento:

```text
alpha.N   fundação e funcionalidades incompletas
beta.N    funcionalidades principais prontas para testes alargados
rc.N      candidato a versão estável
```

## Estado atual

| Versão | Nome do marco | Estado | Significado |
|---|---|---|---|
| `v0.1.0-alpha.1` | Fundação Vue | Concluído | Novo frontend Vue 3 + TypeScript ligado ao PocketBase existente. |
| `v0.1.0-alpha.2` | Fundação do catálogo | Em desenvolvimento | Criação e detalhe de títulos, lookups centralizados e validação. |
| `v0.1.0-alpha.3` | Catálogo editável | Planeado | Edição, imagens, relações pesquisáveis e lixeira. |
| `v0.2.0-alpha.1` | VOD | Planeado | Disponibilidades por provider, país, modalidade, qualidade, preço e validade. |
| `v0.3.0-alpha.1` | Podcasts | Planeado | RSS, episódios, sincronização, deduplicação, player e progresso. |
| `v0.4.0-alpha.1` | TV e streams | Planeado | IPTV, rádios, webcams, múltiplos links, testes e fallback. |
| `v0.5.0-alpha.1` | Biblioteca física | Planeado | Exemplares, formatos, edições, empréstimos e devoluções. |
| `v0.6.0-beta.1` | Diário e reviews | Planeado | Visualizações, progresso universal, avaliações e reviews. |
| `v0.7.0-beta.1` | Providers e manutenção | Planeado | Saúde dos providers, jobs, auditoria, importações e backups. |
| `v0.9.0-rc.1` | Candidato estável | Planeado | Funcionalidades principais integradas, testes e documentação completos. |
| `v1.0.0` | Primeira versão estável | Planeado | Mediário pronto para uso regular, com autenticação, API Rules e recuperação testada. |

---

## `v0.1.0-alpha.1` — Fundação Vue

**Estado:** concluído

### Representa

A reconstrução organizada do frontend, reutilizando integralmente a base PocketBase existente.

### Inclui

- Vue 3;
- TypeScript em modo estrito;
- Vite;
- Vue Router;
- SDK oficial PocketBase;
- CSS próprio;
- componentes-base;
- sidebar, topbar, tema claro/escuro e navegação responsiva;
- repositórios para separar componentes da API;
- páginas iniciais de catálogo, VOD, podcasts, TV, biblioteca e diagnóstico;
- carregamento dinâmico das páginas por rota;
- scripts de arranque local para Windows;
- build de produção e validação TypeScript.

### Validação

- `npm audit`: 0 vulnerabilidades no momento da validação;
- `npm run type-check`: aprovado;
- `npm run build`: aprovado;
- podcasts e canais existentes carregados a partir da base real;
- navegação sem erros de aplicação na consola.

### Limitações conhecidas

- aplicação local sem autenticação;
- API Rules abertas durante a estabilização;
- várias páginas ainda são estruturas provisórias;
- o frontend-fonte ainda está junto da instalação PocketBase e será separado posteriormente.

---

## `v0.1.0-alpha.2` — Fundação do catálogo

**Estado:** em desenvolvimento

### Representa

O primeiro domínio completo da nova arquitetura. Estabelece o padrão que as restantes áreas devem seguir.

### Incluído

- carregamento e cache dos lookups do catálogo;
- tipos de título filtrados pela mídia selecionada;
- formulário de criação de títulos;
- validação de título, mídia, ano, rating, TMDB e IMDb;
- mapeamento entre nomes do domínio e campos PocketBase;
- relações com géneros, tags, idiomas, países, plataformas e companhias;
- criação real de records em `titulos`;
- redirecionamento após a criação;
- página real de detalhe;
- expansão de mídia, tipo, estado e relações;
- poster, métricas, sinopse, notas e IDs externos;
- estados de loading e erro.

### Validado

- título criado e visível no catálogo;
- record persistido no PocketBase;
- página de detalhe instalada;
- `vue-tsc --noEmit`: aprovado;
- build Vite com 72 módulos transformados;
- chunk independente da página de detalhe.

### Falta concluir para fechar esta versão

- edição do título reutilizando o formulário;
- upload de poster, backdrop e logo;
- combobox pesquisável para relações extensas;
- lixeira e restauro;
- testes unitários de validação e mapeamento;
- teste E2E de criar, abrir, editar e arquivar.

---

## `v0.1.0-alpha.3` — Catálogo editável

**Estado:** planeado

### Objetivo

Concluir o ciclo de vida de um título.

### Critérios

- abrir um título existente no formulário;
- editar e guardar;
- carregar poster, backdrop e logo;
- confirmar alterações no detalhe;
- arquivar sem apagar fisicamente;
- restaurar da lixeira;
- impedir perda de alterações não guardadas;
- testes de criação, edição, arquivo e restauro.

---

## `v0.2.0-alpha.1` — VOD

**Estado:** planeado

### Objetivo

Apresentar onde um título pode ser visto, alugado, comprado ou consultado.

### Modelo

Usa a coleção `disponibilidades`, relacionada com `titulos` e `paises`.

### Funcionalidades previstas

- streaming;
- aluguer;
- compra;
- gratuito;
- broadcast;
- biblioteca;
- físico;
- filtro por provider, país e modalidade;
- qualidade, preço, moeda e subscrição;
- data de início, fim e última verificação;
- links externos seguros;
- histórico e alertas numa fase posterior.

---

## `v0.3.0-alpha.1` — Podcasts

**Estado:** planeado

### Objetivo

Migrar para a nova arquitetura o fluxo RSS já validado no projeto original.

### Funcionalidades previstas

- parser RSS em TypeScript puro;
- namespaces iTunes e Media RSS;
- imagem do podcast e fallback por episódio;
- enclosure de áudio;
- duração, temporada, número e explícito;
- sincronização com `podcast_episodios`;
- deduplicação por podcast e GUID;
- player;
- progresso e estado ouvido;
- paginação ou carregamento progressivo para feeds grandes;
- fixtures para testes sem Internet.

---

## `v0.4.0-alpha.1` — TV e streams

**Estado:** planeado

### Objetivo

Migrar IPTV, rádio e webcams com suporte a múltiplos links e monitorização.

### Funcionalidades previstas

- importação M3U;
- canais em `canais_tv`;
- links técnicos em `stream_links`;
- HLS, DASH, HTTP, áudio, RTMP, RTSP e UDP;
- prioridade e fallback;
- referrer e user agent;
- teste de disponibilidade;
- estado, latência e histórico de falhas;
- player integrado.

### Base validada anteriormente

O teste HLS criou, releu, validou e eliminou um canal e o respetivo `stream_link` com sucesso.

---

## `v0.5.0-alpha.1` — Biblioteca física

**Estado:** planeado

### Objetivo

Gerir cópias físicas e digitais pertencentes à coleção.

### Funcionalidades previstas

- exemplares;
- formatos e tipos de edição;
- localização;
- estado físico;
- códigos internos e de barras;
- empréstimos;
- renovações e devoluções;
- histórico por pessoa e título;
- faixas de áudio, legendas e extras.

---

## `v0.6.0-beta.1` — Diário e reviews

**Estado:** planeado

### Objetivo

Unificar o acompanhamento de consumo multimédia.

### Funcionalidades previstas

- visualizações e sessões;
- progresso por título, temporada e episódio;
- revisualizações;
- diário cronológico;
- avaliações;
- reviews com spoilers;
- favoritos e recomendações;
- estatísticas pessoais.

---

## `v0.7.0-beta.1` — Providers e manutenção

**Estado:** planeado

### Objetivo

Tornar integrações, qualidade dos dados e manutenção observáveis.

### Funcionalidades previstas

- página de saúde dos providers;
- último sucesso, erro e latência;
- jobs de sincronização;
- fontes externas por título;
- importação TMDB, RSS, M3U, NFO e CSV;
- deteção de duplicados e órfãos;
- auditoria;
- backup e recuperação;
- validação de restauro.

---

## `v0.9.0-rc.1` — Candidato estável

**Estado:** planeado

### Critérios

- funcionalidades principais integradas;
- documentação coerente com o código;
- testes unitários, integração e Playwright;
- zero erros inesperados na consola;
- zero pedidos 400/404 não previstos;
- auditoria npm sem vulnerabilidades conhecidas;
- migrations reproduzíveis;
- base de desenvolvimento separada da base pessoal;
- processo de atualização e rollback documentado.

---

## `v1.0.0` — Primeira versão estável

**Estado:** planeado

### Representa

A primeira versão recomendada para utilização regular e futura publicação.

### Requisitos obrigatórios

- autenticação;
- API Rules por coleção;
- segredos fora do frontend;
- HTTPS para exposição externa;
- CORS e CSP revistos;
- backup automático;
- recuperação testada;
- migrações documentadas;
- acessibilidade e responsividade verificadas;
- instalação reproduzível;
- licença MIT e documentação completas.

---

## Processo de atualização deste documento

Cada alteração de versão deve atualizar:

1. `package.json`;
2. `VERSIONS.md`;
3. `CHANGELOG.md`;
4. tag Git, quando aplicável;
5. documentação da funcionalidade afetada.

### Exemplo de commit

```text
feat(catalog): concluir edição de títulos

O que mudou:
- preenchimento do formulário com records existentes;
- atualização através do repositório;
- proteção contra alterações não guardadas.

Versão:
- v0.1.0-alpha.3

Validação:
- npm audit;
- npm run type-check;
- npm run build;
- teste manual de criação e edição.
```

### Criar uma tag Git

```powershell
git tag -a v0.1.0-alpha.2 -m "Fundação do catálogo do Mediário"
git push origin v0.1.0-alpha.2
```

## Histórico resumido

| Data | Versão | Marco |
|---|---|---|
| 2026-11-19 | `v0.1.0-alpha.1` | Fundação Vue 3 + TypeScript e reutilização do PocketBase atual. |
| 2026-11-19 | `v0.1.0-alpha.2` | Criação e detalhe de títulos no novo catálogo. |
