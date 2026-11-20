# Versões do Mediário

Este documento regista as versões do **Mediário**, o objetivo de cada marco, as funcionalidades incluídas, o estado de validação e o trabalho ainda pendente.

As versões estão ordenadas da **mais recente para a mais antiga**. Cada bloco pode ser aberto ou fechado no GitHub.

> **Versão atual:** `v0.2.0-alpha.1` — Gestão VOD concluída.

## Resumo

| Versão | Marco | Estado |
|---|---|---|
| `v1.0.0` | Primeira versão estável | Planeado |
| `v0.9.0-rc.1` | Candidato a versão estável | Planeado |
| `v0.7.0-beta.1` | Providers e manutenção | Planeado |
| `v0.6.0-beta.1` | Diário e reviews | Planeado |
| `v0.5.0-alpha.1` | Biblioteca física | Planeado |
| `v0.4.0-alpha.1` | TV, IPTV e streams | Planeado |
| `v0.3.0-alpha.1` | Podcasts | Próximo marco |
| `v0.2.0-alpha.1` | Gestão VOD | **Concluído** |
| `v0.1.0-alpha.3` | Catálogo editável, imagens e lixeira | **Concluído** |
| `v0.1.0-alpha.2` | Fundação do catálogo | **Concluído** |
| `v0.1.0-alpha.1` | Fundação Vue 3 + TypeScript | **Concluído** |

---

<details>
<summary><strong>v1.0.0 — Primeira versão estável</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Publicar a primeira versão estável do Mediário, adequada a utilização pessoal continuada e instalação reproduzível.

## Critérios previstos

- catálogo, VOD, podcasts, TV, biblioteca, diário e reviews funcionais;
- autenticação e regras PocketBase revistas para publicação;
- migrations versionadas;
- documentação de instalação e recuperação;
- testes automáticos dos fluxos críticos;
- backup e restauro validados;
- consola sem erros da aplicação;
- `npm audit` sem vulnerabilidades conhecidas;
- `npm run type-check` e `npm run build` aprovados;
- acessibilidade e comportamento responsivo revistos;
- release notes e pacote de instalação preparados.

</details>

<details>
<summary><strong>v0.9.0-rc.1 — Candidato a versão estável</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Congelar funcionalidades e concentrar o trabalho em regressões, segurança, desempenho, acessibilidade e documentação.

## Trabalho previsto

- revisão de API Rules do PocketBase;
- testes Playwright e Vitest;
- validação de migrations numa base limpa;
- teste de atualização e rollback;
- revisão de desempenho e acessibilidade;
- documentação final revista.

</details>

<details>
<summary><strong>v0.7.0-beta.1 — Providers e manutenção</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Centralizar providers externos, sincronizações, importações, diagnóstico e manutenção.

## Trabalho previsto

- painel de providers;
- estado, latência e último sucesso;
- `sync_jobs` e erros;
- `fontes_externas` por título;
- TMDB, OMDb, RAWG, Open Library, Google Books, AniList, Jikan e MusicBrainz;
- importação de CSV, JSON, NFO, M3U, RSS e XMLTV;
- deteção de duplicados e records incompletos;
- auditoria, backup e recuperação.

</details>

<details>
<summary><strong>v0.6.0-beta.1 — Diário e reviews</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Registar consumo, progresso, avaliações e opiniões.

## Trabalho previsto

- diário baseado em `visualizacoes`;
- progresso por duração, episódios, páginas, capítulos, faixas ou horas;
- revisualizações e calendário;
- reviews e avaliações;
- estatísticas e resumo anual.

</details>

<details>
<summary><strong>v0.5.0-alpha.1 — Biblioteca física</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Gerir exemplares, edições, formatos, compras, empréstimos e devoluções.

</details>

<details>
<summary><strong>v0.4.0-alpha.1 — TV, IPTV e streams</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Migrar e consolidar televisão, rádios, webcams, IPTV e links alternativos.

## Já validado

- canais em `canais_tv`;
- links em `stream_links`;
- manifesto HLS;
- criação, leitura e eliminação pela API.

</details>

<details>
<summary><strong>v0.3.0-alpha.1 — Podcasts</strong> · Próximo marco · [+] Mostrar detalhes</summary>

## Objetivo

Migrar o domínio de podcasts para módulos Vue e TypeScript independentes.

## Já validado

- parsing RSS;
- namespaces iTunes;
- imagens por podcast e episódio;
- duração, temporada, episódio e conteúdo explícito;
- sincronização de episódios;
- apresentação dos records existentes.

## Trabalho previsto

- parser TypeScript puro com fixtures;
- sincronização sem duplicar GUIDs;
- player de áudio;
- progresso por episódio;
- pesquisa e filtros;
- estados de erro, loading e vazio;
- testes de feeds inválidos e incompletos.

</details>

<details open>
<summary><strong>v0.2.0-alpha.1 — Gestão VOD</strong> · Concluído · [−] Ocultar detalhes</summary>

## Objetivo

Gerir onde cada título pode ser visto, alugado, comprado, consultado gratuitamente ou encontrado numa biblioteca.

## Modelo de dados

Usa a coleção PocketBase `disponibilidades`, relacionada com `titulos` e `paises`.

## Concluído e testado

- listagem paginada com 24 ofertas por página;
- criação e edição;
- pesquisa assíncrona de títulos após 2 caracteres;
- debounce de 300 ms e máximo de 20 resultados;
- pesquisa por título, título original e ano;
- provider, modalidade, URL, país, qualidade, preço, moeda e subscrição;
- datas de início e fim;
- ofertas ativas, inativas e expiradas;
- filtros no PocketBase por texto, país, modalidade, qualidade, estado e subscrição;
- filtros e página preservados na URL;
- ativação, desativação e reativação;
- eliminação definitiva com confirmação pelo provider;
- diálogo responsivo e acessível;
- deteção de duplicados com e sem país;
- comparação de provider sem diferenças de maiúsculas, espaços ou acentos;
- secção `Onde ver` no detalhe do título;
- proteção contra alterações não guardadas;
- estados de loading, erro e vazio.

## Qualidades

| Valor | Apresentação |
|---|---|
| `desconhecida` | Desconhecida |
| `sd` | SD |
| `hd` | HD |
| `fhd` | Full HD |
| `4k` | 4K |
| `8k` | 8K |
| `audio` | Áudio |

## Validação

- `npm audit`: 0 vulnerabilidades;
- `npm run type-check`: aprovado;
- `npm run build`: aprovado;
- criação, edição, filtros, duplicados, estados, `Onde ver` e eliminação: aprovados;
- interface responsiva e consola sem erros da aplicação.

## Limitações conhecidas

- testes automáticos ainda não implementados;
- verificação periódica das URLs ainda não implementada;
- histórico de preços fica para uma versão futura;
- providers ainda não estão normalizados numa coleção própria.

## Estado

**Concluído.**

</details>

<details>
<summary><strong>v0.1.0-alpha.3 — Catálogo editável, imagens e lixeira</strong> · Concluído · [+] Mostrar detalhes</summary>

## Concluído

- criação, detalhe e edição de títulos;
- relações múltiplas pesquisáveis;
- imagens PocketBase e URLs externas;
- redimensionamento, substituição e remoção;
- lixeira, restauro e eliminação definitiva;
- validação e proteção contra alterações não guardadas.

</details>

<details>
<summary><strong>v0.1.0-alpha.2 — Fundação do catálogo</strong> · Concluído · [+] Mostrar detalhes</summary>

- tipos, mapper e validação;
- lookups;
- criação real em `titulos`;
- detalhe e rotas do catálogo.

</details>

<details>
<summary><strong>v0.1.0-alpha.1 — Fundação Vue 3 + TypeScript</strong> · Concluído · [+] Mostrar detalhes</summary>

- Vue 3, TypeScript, Vite e Vue Router;
- cliente PocketBase e repositórios;
- layout, sidebar e temas;
- build e type-check;
- identidade Mediário e documentação inicial.

</details>

---

<details>
<summary><strong>Convenção de versões</strong> · [+] Mostrar detalhes</summary>

O Mediário segue [Semantic Versioning](https://semver.org/):

```text
MAJOR.MINOR.PATCH
```

- **MAJOR**: alterações incompatíveis ou nova arquitetura;
- **MINOR**: funcionalidades compatíveis;
- **PATCH**: correções e melhorias compatíveis;
- `alpha.N`: funcionalidades em construção;
- `beta.N`: funcionalidades principais em testes alargados;
- `rc.N`: candidato a versão estável.

</details>

<details>
<summary><strong>Processo de release</strong> · [+] Mostrar detalhes</summary>

1. Atualizar `package.json`, `VERSIONS.md` e `CHANGELOG.md`.
2. Executar `npm audit`, `npm run type-check` e `npm run build`.
3. Concluir testes manuais.
4. Fazer commit e push na `main`.
5. Gerar o pacote com `scripts/preparar-main.ps1`.
6. Criar tag e GitHub Release marcada como pre-release enquanto for alpha, beta ou RC.

</details>

---

## Histórico resumido

| Data | Versão | Marco |
|---|---|---|
| 2026-11-19 | `v0.1.0-alpha.1` | Fundação Vue 3 + TypeScript. |
| 2026-11-19 | `v0.1.0-alpha.2` | Fundação do catálogo. |
| 2026-11-20 | `v0.1.0-alpha.3` | Catálogo editável, imagens e lixeira. |
| 2026-11-20 | `v0.2.0-alpha.1` | Gestão VOD concluída. |

## Autor e licença

Desenvolvido por **Zubiaks**.

Software source-available sob a **PolyForm Noncommercial License 1.0.0**. Consulta `LICENSE.md` e `LICENSE-TRANSITION.md`.
