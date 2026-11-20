# Versões do Mediário

Este documento regista as versões do **Mediário**, o objetivo de cada marco, as funcionalidades incluídas, o estado de validação e o trabalho ainda pendente.

As versões estão ordenadas da **mais recente para a mais antiga**. Cada bloco pode ser aberto ou fechado no GitHub.

> **Versão atual:** `v0.2.0-alpha.1` — Fundação VOD, em desenvolvimento.

## Resumo

| Versão | Marco | Estado |
|---|---|---|
| `v1.0.0` | Primeira versão estável | Planeado |
| `v0.9.0-rc.1` | Candidato a versão estável | Planeado |
| `v0.7.0-beta.1` | Providers e manutenção | Planeado |
| `v0.6.0-beta.1` | Diário e reviews | Planeado |
| `v0.5.0-alpha.1` | Biblioteca física | Planeado |
| `v0.4.0-alpha.1` | TV, IPTV e streams | Planeado |
| `v0.3.0-alpha.1` | Podcasts | Planeado |
| `v0.2.0-alpha.1` | Fundação VOD | **Em desenvolvimento** |
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

## Estado

Ainda não iniciado.

</details>

<details>
<summary><strong>v0.9.0-rc.1 — Candidato a versão estável</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Congelar funcionalidades e concentrar o trabalho em regressões, segurança, desempenho, acessibilidade e documentação.

## Trabalho previsto

- congelamento do schema e das funcionalidades principais;
- revisão de API Rules do PocketBase;
- revisão de credenciais, chaves e configuração local;
- testes ponta a ponta com Playwright;
- testes unitários com Vitest;
- validação de migrations numa base limpa;
- teste de atualização a partir de versões anteriores;
- revisão do Service Worker e da estratégia de cache;
- revisão de desempenho para listas grandes;
- revisão da documentação por outra pessoa.

## Estado

Ainda não iniciado.

</details>

<details>
<summary><strong>v0.7.0-beta.1 — Providers e manutenção</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Centralizar providers externos, sincronizações, importações, diagnóstico e manutenção do sistema.

## Trabalho previsto

- painel de providers;
- estado, latência e último sucesso de cada provider;
- `sync_jobs` e respetivos erros;
- `fontes_externas` por título;
- TMDB, OMDb, RAWG, Open Library, Google Books, AniList, Jikan e MusicBrainz;
- centro de importação para CSV, JSON, NFO, M3U, RSS e XMLTV;
- deteção de duplicados e records incompletos;
- auditoria, backup e recuperação;
- documentação de chaves, limites e contratos de dados.

## Estado

Ainda não iniciado.

</details>

<details>
<summary><strong>v0.6.0-beta.1 — Diário e reviews</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Registar consumo real, progresso e opiniões sem misturar eventos de visualização com reviews.

## Trabalho previsto

- diário baseado em `visualizacoes`;
- progresso por duração, episódios, páginas, capítulos, faixas ou horas jogadas;
- revisualizações;
- calendário de consumo;
- reviews e avaliações pessoais;
- estatísticas e resumo anual;
- filtros por período, mídia, estado e plataforma;
- integração com títulos, temporadas e episódios.

## Estado

Ainda não iniciado.

</details>

<details>
<summary><strong>v0.5.0-alpha.1 — Biblioteca física</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Gerir exemplares físicos, edições, formatos, compras e empréstimos.

## Trabalho previsto

- listagem e detalhe de exemplares;
- formatos físicos e tipos de edição;
- condição, localização e notas do exemplar;
- códigos de barras;
- histórico de empréstimos e devoluções;
- filtros e estatísticas da coleção física;
- ligação entre exemplares e títulos.

## Estado

A página inicial lê dados existentes, mas o domínio ainda não foi reconstruído na arquitetura Vue.

</details>

<details>
<summary><strong>v0.4.0-alpha.1 — TV, IPTV e streams</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Migrar e consolidar televisão, rádios, webcams, IPTV e links alternativos.

## Já validado

- criação de canais em `canais_tv`;
- criação de links em `stream_links`;
- relação canal → links;
- manifesto HLS válido;
- tipo técnico `hls`;
- criação, leitura e eliminação pela API.

## Trabalho previsto

- listagem e detalhe de canais;
- importação M3U;
- vários links e prioridades;
- `referrer` e `user_agent`;
- teste de disponibilidade;
- estados online, instável, lento e offline;
- player HLS;
- filtros por país, idioma, categoria e qualidade;
- integração EPG/XMLTV futura.

## Estado

A listagem inicial reutiliza a base atual. A gestão completa está planeada.

</details>

<details>
<summary><strong>v0.3.0-alpha.1 — Podcasts</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Migrar o domínio de podcasts para módulos Vue e TypeScript independentes.

## Já validado

- parsing RSS;
- namespaces iTunes através de `getElementsByTagNameNS`;
- imagem geral e imagem por episódio;
- duração, temporada, episódio e conteúdo explícito;
- sincronização de episódios;
- feed Omny real;
- apresentação dos episódios existentes.

## Trabalho previsto

- parser TypeScript puro com fixtures;
- repositório de podcasts;
- sincronização sem duplicar GUIDs;
- player de áudio;
- progresso por episódio;
- pesquisa e filtros;
- estados de erro, loading e vazio;
- testes para feeds sem namespace, XML inválido e imagens em falta.

## Estado

A página inicial reutiliza records existentes. A migração completa está planeada.

</details>

<details open>
<summary><strong>v0.2.0-alpha.1 — Fundação VOD</strong> · Em desenvolvimento · [−] Ocultar detalhes</summary>

## Objetivo

Gerir onde cada título pode ser visto, alugado, comprado, ouvido, obtido gratuitamente ou encontrado numa biblioteca.

## Modelo de dados

A área VOD utiliza a coleção PocketBase `disponibilidades`. Não existe uma coleção separada chamada `vod`.

Campos utilizados:

- `titulo`;
- `provider_nome`;
- `tipo`;
- `url`;
- `pais`;
- `qualidade`;
- `preco`;
- `moeda`;
- `incluido_subscricao`;
- `data_inicio`;
- `data_fim`;
- `ativo`.

## Concluído e testado

- listagem de disponibilidades;
- criação e edição;
- relação com título e país;
- provider, modalidade e URL;
- preço e moeda;
- inclusão na subscrição;
- data de início e fim;
- estado ativo;
- proteção contra alterações não guardadas;
- rotas `/vod`, `/vod/novo` e `/vod/:id/editar`;
- links VOD na navegação;
- qualidade limitada a valores aceites pelo PocketBase;
- criação e edição aprovadas manualmente.

## Valores técnicos de qualidade

| Valor guardado | Texto apresentado |
|---|---|
| `desconhecida` | Desconhecida |
| `sd` | SD |
| `hd` | HD |
| `fhd` | Full HD |
| `4k` | 4K |
| `8k` | 8K |
| `audio` | Áudio |

## Gestão VOD preparada, aguardando validação final

- pesquisa por título e provider;
- filtros por país, modalidade, qualidade, estado e subscrição;
- ofertas ativas, inativas, todas ou expiradas;
- preço formatado em `pt-PT`;
- ativar e desativar ofertas;
- eliminação definitiva com confirmação pelo provider;
- acesso ao título e ao provider;
- integração “Onde ver” no detalhe do título;
- deteção de duplicados por título, provider, país e modalidade;
- normalização de valores antigos como `FHD` para `fhd`.

## Falta validar para concluir a versão

- filtros combinados;
- ofertas ativas, inativas e expiradas;
- ativação e desativação;
- eliminação definitiva;
- secção “Onde ver” no detalhe;
- aviso de duplicado na criação e edição;
- `npm run type-check`;
- `npm run build`;
- consola sem erros da aplicação.

## Estado

**Em desenvolvimento.** A fundação está funcional. A gestão avançada só deve ser marcada como concluída após os testes acima.

</details>

<details>
<summary><strong>v0.1.0-alpha.3 — Catálogo editável, imagens e lixeira</strong> · Concluído · [+] Mostrar detalhes</summary>

## Objetivo

Concluir o primeiro domínio funcional do Mediário: criação, leitura, edição, imagens, relações e ciclo de vida dos títulos.

## Concluído e testado

### Títulos

- criação, detalhe e edição;
- limpeza de campos existentes;
- validação e alterações não guardadas;
- mídia, tipo e estado;
- relações múltiplas para géneros, tags, idiomas, países, plataformas e companhias;
- pesquisa nas relações extensas.

### Imagens

- poster, backdrop e logo como ficheiros PocketBase;
- `poster_url`, `backdrop_url` e `logo_url` como URLs externas;
- prioridade ficheiro local → URL externa → placeholder;
- pré-visualização, substituição e remoção;
- redimensionamento no browser;
- thumbnails PocketBase no catálogo;
- poster, backdrop e logo no detalhe.

### Lixeira

- arquivamento lógico;
- motivo, data e origem da eliminação;
- títulos arquivados escondidos do catálogo;
- página `/lixeira`;
- restauro;
- eliminação definitiva com confirmação pelo nome exato.

### Correções relevantes

- `data_lancamento` convertido para `yyyy-MM-dd`;
- TMDB ID `0` tratado como vazio;
- TMDB ID opcional validado apenas quando preenchido;
- cópia segura de formulários reativos;
- erros de validação apresentados no topo;
- valores vazios limpam campos antigos.

## Validação executada

- criação, detalhe e edição;
- relações múltiplas;
- imagens locais e URLs;
- arquivamento, restauro e eliminação definitiva;
- `npm run type-check`;
- `npm run build`;
- navegação sem erros da aplicação.

## Limitações conhecidas

- testes automáticos ainda não implementados;
- listas extensas poderão precisar de virtualização;
- créditos, temporadas e episódios ainda não estão integrados no detalhe Vue.

## Estado

**Concluído.** Serve como padrão arquitetural para os restantes domínios.

</details>

<details>
<summary><strong>v0.1.0-alpha.2 — Fundação do catálogo</strong> · Concluído · [+] Mostrar detalhes</summary>

## Objetivo

Criar o primeiro fluxo real de negócio sobre o PocketBase existente.

## Concluído

- tipos TypeScript do catálogo;
- mapper frontend ↔ PocketBase;
- validação inicial;
- carregamento de lookups;
- formulário de criação;
- criação real em `titulos`;
- página de detalhe;
- rotas de catálogo;
- estados de loading, erro e vazio;
- documentação inicial do domínio.

## Estado

**Concluído.** Foi expandido pela `v0.1.0-alpha.3`.

</details>

<details>
<summary><strong>v0.1.0-alpha.1 — Fundação Vue 3 + TypeScript</strong> · Concluído · [+] Mostrar detalhes</summary>

## Objetivo

Criar uma reconstrução organizada do frontend, preservando a base PocketBase existente.

## Stack

- Vue 3;
- TypeScript;
- Vite;
- Vue Router;
- SDK oficial PocketBase;
- CSS próprio;
- versões npm estáveis por padrão.

## Concluído

- starter Vue 3 + TypeScript;
- router por hash;
- layout e sidebar;
- tema claro e escuro;
- cliente PocketBase e repositórios;
- páginas iniciais para catálogo, VOD, podcasts, TV, biblioteca e diagnóstico;
- carregamento por rota;
- script `.bat` para iniciar PocketBase e Vite;
- TypeScript compatível com `vue-tsc`;
- build de produção;
- `npm audit` sem vulnerabilidades no baseline inicial;
- identidade Mediário;
- licença MIT atribuída a Zubiaks;
- Git e documentação inicial.

## Decisões arquiteturais

- Vue apenas na camada visual;
- lógica de negócio em TypeScript puro;
- PocketBase isolado por repositórios;
- frontend e dados desacoplados;
- desenvolvimento local sem login durante a estabilização;
- versões experimentais apenas com vantagem concreta e documentada.

## Estado

**Concluído.** É a fundação técnica das versões seguintes.

</details>

---

<details>
<summary><strong>Convenção de versões</strong> · [+] Mostrar detalhes</summary>

O Mediário segue [Semantic Versioning](https://semver.org/) no formato:

```text
MAJOR.MINOR.PATCH
```

- **MAJOR**: alterações incompatíveis, migrações profundas ou nova arquitetura;
- **MINOR**: novas funcionalidades compatíveis;
- **PATCH**: correções, segurança, desempenho e melhorias sem quebra de compatibilidade.

Durante o desenvolvimento:

- `alpha.N`: fundação e funcionalidades incompletas;
- `beta.N`: funcionalidades principais prontas para testes alargados;
- `rc.N`: candidato a versão estável;
- sem sufixo: versão estável.

Exemplos:

```text
v0.2.0-alpha.1
v0.6.0-beta.1
v0.9.0-rc.1
v1.0.0
```

</details>

<details>
<summary><strong>Critérios para atualizar este documento</strong> · [+] Mostrar detalhes</summary>

Atualizar `VERSIONS.md` quando:

- uma funcionalidade relevante for concluída;
- um marco mudar de estado;
- uma versão for publicada;
- uma limitação importante for descoberta;
- uma decisão alterar o roadmap;
- um teste funcional confirmar ou rejeitar uma implementação.

Uma funcionalidade só deve ser marcada como concluída depois de:

- `npm run type-check` aprovado;
- `npm run build` aprovado;
- teste manual do fluxo principal;
- ausência de erros da aplicação na consola;
- documentação correspondente atualizada.

</details>

<details>
<summary><strong>Processo de release</strong> · [+] Mostrar detalhes</summary>

1. Atualizar `package.json`.
2. Atualizar `VERSIONS.md`.
3. Atualizar `CHANGELOG.md`.
4. Executar:

```powershell
npm audit
npm run type-check
npm run build
```

5. Executar os testes manuais do marco.
6. Criar commit com descrição.
7. Fazer push da branch.
8. Integrar na `main` através de Pull Request ou merge revisto.
9. Criar tag anotada:

```powershell
git tag -a v0.2.0-alpha.1 -m "Mediário v0.2.0-alpha.1 — Fundação VOD"
git push origin v0.2.0-alpha.1
```

10. Criar uma Release no GitHub e marcar como **pre-release** enquanto for alpha, beta ou RC.

</details>

---

## Histórico resumido

| Data | Versão | Marco |
|---|---|---|
| 2026-11-19 | `v0.1.0-alpha.1` | Fundação Vue 3 + TypeScript e reutilização do PocketBase atual. |
| 2026-11-19 | `v0.1.0-alpha.2` | Criação e detalhe de títulos no novo catálogo. |
| 2026-11-20 | `v0.1.0-alpha.3` | Edição, relações, imagens, lixeira e restauro. |
| 2026-11-20 | `v0.2.0-alpha.1` | Fundação VOD iniciada. |

## Autor e licença

Desenvolvido por **Zubiaks**.

Distribuído sob a licença MIT. Consulta `LICENSE.md`.
