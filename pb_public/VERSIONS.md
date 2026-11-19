# Versões do Mediário

Histórico e plano de versões do projeto, ordenado **da versão mais recente para a mais antiga**.

> Clique em **[+] Mostrar detalhes** para expandir cada versão. Quando aberta, a linha muda para **[−] Ocultar detalhes** nos navegadores que suportam `<details>`.

## Convenção de versões

<details>
<summary><strong>[+] Mostrar detalhes sobre Semantic Versioning</strong></summary>

O Mediário segue o formato:

```text
MAJOR.MINOR.PATCH
```

- **MAJOR**: alterações incompatíveis ou mudança profunda de arquitetura.
- **MINOR**: novas funcionalidades compatíveis.
- **PATCH**: correções, segurança e desempenho sem quebra de compatibilidade.

Pré-lançamentos:

```text
alpha.N   fundação e funcionalidades incompletas
beta.N    funcionalidades principais em testes alargados
rc.N      candidato à versão estável
```

</details>

## Estado atual e roadmap

| Versão | Marco | Estado |
|---|---|---|
| `v1.0.0` | Primeira versão estável | Planeado |
| `v0.9.0-rc.1` | Candidato estável | Planeado |
| `v0.7.0-beta.1` | Providers e manutenção | Planeado |
| `v0.6.0-beta.1` | Diário e reviews | Planeado |
| `v0.5.0-alpha.1` | Biblioteca física | Planeado |
| `v0.4.0-alpha.1` | TV e streams | Planeado |
| `v0.3.0-alpha.1` | Podcasts | Planeado |
| `v0.2.0-alpha.1` | VOD | Planeado |
| `v0.1.0-alpha.3` | Catálogo editável | Planeado |
| `v0.1.0-alpha.2` | Fundação do catálogo | **Em desenvolvimento** |
| `v0.1.0-alpha.1` | Fundação Vue | Concluído |

---

<details>
<summary><strong>v1.0.0 — Primeira versão estável</strong> · Planeado · [+] Mostrar detalhes</summary>

### Representa

Primeira versão recomendada para utilização regular e futura publicação.

### Requisitos obrigatórios

- autenticação;
- API Rules por coleção;
- segredos fora do frontend;
- HTTPS para exposição externa;
- CORS e CSP revistos;
- backups automáticos;
- recuperação testada;
- migrations documentadas;
- acessibilidade e responsividade verificadas;
- instalação reproduzível;
- licença MIT e documentação completas.

</details>

<details>
<summary><strong>v0.9.0-rc.1 — Candidato estável</strong> · Planeado · [+] Mostrar detalhes</summary>

### Objetivo

Validar o Mediário como candidato à primeira versão estável.

### Critérios

- funcionalidades principais integradas;
- documentação coerente com o código;
- testes unitários, integração e Playwright;
- zero erros inesperados na consola;
- zero pedidos HTTP 400 ou 404 não previstos;
- auditoria npm sem vulnerabilidades conhecidas;
- migrations reproduzíveis;
- base de desenvolvimento separada da base pessoal;
- atualização e rollback documentados.

</details>

<details>
<summary><strong>v0.7.0-beta.1 — Providers e manutenção</strong> · Planeado · [+] Mostrar detalhes</summary>

### Objetivo

Tornar integrações, qualidade dos dados e manutenção observáveis.

### Funcionalidades previstas

- saúde dos providers;
- último sucesso, erro e latência;
- jobs de sincronização;
- fontes externas por título;
- importação TMDB, RSS, M3U, NFO e CSV;
- deteção de duplicados e órfãos;
- auditoria;
- backup e recuperação;
- validação de restauro.

</details>

<details>
<summary><strong>v0.6.0-beta.1 — Diário e reviews</strong> · Planeado · [+] Mostrar detalhes</summary>

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

</details>

<details>
<summary><strong>v0.5.0-alpha.1 — Biblioteca física</strong> · Planeado · [+] Mostrar detalhes</summary>

### Objetivo

Gerir cópias físicas e digitais pertencentes à coleção.

### Funcionalidades previstas

- exemplares;
- formatos e tipos de edição;
- localização e estado físico;
- códigos internos e de barras;
- empréstimos, renovações e devoluções;
- histórico por pessoa e título;
- faixas de áudio, legendas e extras.

</details>

<details>
<summary><strong>v0.4.0-alpha.1 — TV e streams</strong> · Planeado · [+] Mostrar detalhes</summary>

### Objetivo

Migrar IPTV, rádio e webcams com múltiplos links e monitorização.

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

### Validação anterior

O teste HLS criou, releu, validou e eliminou um canal e o respetivo `stream_link`.

</details>

<details>
<summary><strong>v0.3.0-alpha.1 — Podcasts</strong> · Planeado · [+] Mostrar detalhes</summary>

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
- player, progresso e estado ouvido;
- carregamento progressivo para feeds grandes;
- fixtures para testes sem Internet.

</details>

<details>
<summary><strong>v0.2.0-alpha.1 — VOD</strong> · Planeado · [+] Mostrar detalhes</summary>

### Objetivo

Apresentar onde um título pode ser visto, alugado, comprado ou consultado.

### Modelo

Usa `disponibilidades`, relacionada com `titulos` e `paises`.

### Funcionalidades previstas

- streaming, aluguer, compra e gratuito;
- broadcast, biblioteca, físico e outros;
- filtro por provider, país e modalidade;
- qualidade, preço, moeda e subscrição;
- datas de início, fim e última verificação;
- links externos seguros;
- histórico e alertas numa fase posterior.

</details>

<details>
<summary><strong>v0.1.0-alpha.3 — Catálogo editável</strong> · Planeado · [+] Mostrar detalhes</summary>

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

</details>

<details open>
<summary><strong>v0.1.0-alpha.2 — Fundação do catálogo</strong> · Em desenvolvimento · [−] Ocultar detalhes</summary>

### Representa

Primeiro domínio completo da nova arquitetura e padrão para as restantes áreas.

### Incluído

- cache dos lookups do catálogo;
- tipos filtrados pela mídia;
- formulário de criação;
- validação de título, mídia, ano, rating, TMDB e IMDb;
- mapeamento entre domínio e PocketBase;
- relações com géneros, tags, idiomas, países, plataformas e companhias;
- criação real em `titulos`;
- redirecionamento após criação;
- página real de detalhe;
- expansão de mídia, tipo, estado e relações;
- poster, métricas, sinopse, notas e IDs externos;
- estados de loading e erro.

### Validado

- título criado e visível no catálogo;
- record persistido no PocketBase;
- página de detalhe instalada;
- `vue-tsc --noEmit` aprovado;
- build Vite com 72 módulos transformados;
- página de detalhe gerada num chunk independente.

### Falta concluir

- edição reutilizando o formulário;
- upload de poster, backdrop e logo;
- combobox pesquisável para relações extensas;
- lixeira e restauro;
- testes unitários de validação e mapeamento;
- teste E2E de criar, abrir, editar e arquivar.

</details>

<details>
<summary><strong>v0.1.0-alpha.1 — Fundação Vue</strong> · Concluído · [+] Mostrar detalhes</summary>

### Representa

Reconstrução organizada do frontend, reutilizando a base PocketBase existente.

### Inclui

- Vue 3;
- TypeScript estrito;
- Vite e Vue Router;
- SDK oficial PocketBase;
- CSS próprio e componentes-base;
- sidebar, topbar, temas e navegação responsiva;
- repositórios para isolar a API;
- páginas iniciais de catálogo, VOD, podcasts, TV, biblioteca e diagnóstico;
- carregamento dinâmico por rota;
- arranque local no Windows;
- build e validação TypeScript.

### Validação

- `npm audit`: 0 vulnerabilidades na validação inicial;
- `npm run type-check`: aprovado;
- `npm run build`: aprovado;
- podcasts e canais existentes carregados da base real;
- navegação sem erros da aplicação na consola.

### Limitações conhecidas

- aplicação local sem autenticação;
- API Rules abertas durante a estabilização;
- páginas ainda provisórias;
- frontend-fonte ainda junto do PocketBase.

</details>

---

## Processo de atualização

<details>
<summary><strong>[+] Mostrar regras para publicar uma versão</strong></summary>

Cada mudança de versão deve atualizar:

1. `package.json`;
2. `VERSIONS.md`;
3. `CHANGELOG.md`;
4. documentação da funcionalidade;
5. tag Git, quando aplicável.

### Exemplo de tag

```powershell
git tag -a v0.1.0-alpha.2 -m "Fundação do catálogo do Mediário"
git push origin v0.1.0-alpha.2
```

### Exemplo de commit com descrição

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

</details>

## Histórico resumido

| Data | Versão | Marco |
|---|---|---|
| 2026-11-19 | `v0.1.0-alpha.2` | Criação e detalhe de títulos no novo catálogo. |
| 2026-11-19 | `v0.1.0-alpha.1` | Fundação Vue 3 + TypeScript e reutilização do PocketBase atual. |
