# Versões do Mediário

> **Versão do documento:** `2.0.0`
> **Última revisão:** `2026-11-21`
> **Autor:** Zubiaks
> **Licença:** PolyForm Noncommercial License 1.0.0

Este documento regista as versões do **Mediário**, o objetivo de cada marco, as funcionalidades incluídas, o estado de validação e o trabalho ainda pendente.

As versões estão ordenadas da **mais recente para a mais antiga**. Cada bloco pode ser aberto ou fechado no GitHub.

> **Versão atual:** `v0.3.0-alpha.1` — Podcasts, sincronização, reprodução e biblioteca de episódios.
> **Próximo marco:** `v0.4.0-alpha.1` — Separação e consolidação do domínio IPTV.
> **Versão técnica do frontend:** consultar `pb_public/package.json`.
> **Versão do esquema PocketBase:** legado atual, ainda não numerado.

## Resumo

| Versão | Marco | Estado |
|---|---|---|
| `v1.0.0` | Primeira versão estável | Planeado |
| `v0.9.0-rc.1` | Candidato a versão estável | Planeado |
| `v0.8.0-beta.1` | Segurança, instalação e recuperação | Planeado |
| `v0.7.0-beta.1` | Providers e manutenção | Planeado |
| `v0.6.0-beta.1` | Diário e reviews | Planeado |
| `v0.5.0-alpha.1` | Biblioteca física | Em desenvolvimento |
| `v0.4.0-alpha.1` | IPTV, M3U, fontes e reprodução | **Próximo marco** |
| `v0.3.0-alpha.1` | Podcasts | **Concluído** |
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

- catálogo, VOD, podcasts, IPTV, biblioteca, diário e reviews funcionais;
- autenticação e regras PocketBase revistas para publicação;
- migrations versionadas;
- documentação de instalação, atualização e recuperação;
- testes automáticos dos fluxos críticos;
- backup e restauro validados;
- consola sem erros da aplicação;
- `npm audit` sem vulnerabilidades conhecidas;
- `npm run type-check`, `npm test` e `npm run build` aprovados;
- `git diff --check` aprovado;
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
- documentação final revista;
- validação completa numa instalação limpa.

</details>

<details>
<summary><strong>v0.8.0-beta.1 — Segurança, instalação e recuperação</strong> · Planeado · [+] Mostrar detalhes</summary>

## Objetivo

Preparar o Mediário para instalação reproduzível, atualização segura e utilização pessoal continuada.

## Trabalho previsto

- autenticação;
- revisão das API Rules do PocketBase;
- gestão de utilizadores autorizados;
- versionamento formal do esquema PocketBase;
- migrations verificáveis;
- validação de instalação numa base vazia;
- atualização entre versões;
- rollback documentado;
- backup do PocketBase;
- restauro validado;
- verificação de integridade;
- pacote de instalação;
- documentação de recuperação;
- separação de configuração e dados;
- revisão de segredos e variáveis de ambiente;
- revisão de dependências com `npm audit`.

## Critérios de conclusão

- instalação limpa reproduzível;
- atualização sem perda de dados;
- rollback testado;
- backup e restauro testados;
- regras PocketBase revistas;
- documentação suficiente para recuperação sem depender do ambiente original.

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
<summary><strong>v0.5.0-alpha.1 — Biblioteca física</strong> · Em desenvolvimento · [+] Mostrar detalhes</summary>

## Objetivo

Gerir exemplares, edições, formatos, compras, empréstimos e devoluções.

## Já implementado

- página de biblioteca;
- contagem de exemplares;
- contagem de empréstimos;
- listagem inicial de records;
- estados vazios;
- estrutura para formatos e localização.

## Trabalho previsto

- criação e edição de exemplares;
- edições e formatos;
- localização física;
- compras e valor;
- empréstimos e devoluções;
- histórico de movimentações;
- filtros, paginação e pesquisa;
- testes automáticos.

</details>

<details open>
<summary><strong>v0.4.0-alpha.1 — IPTV, M3U, fontes e reprodução</strong> · Próximo marco · [−] Ocultar detalhes</summary>

## Objetivo

Consolidar o domínio IPTV, separar definitivamente IPTV de VOD e preparar uma arquitetura própria para canais, fontes, playlists M3U, dados EPG e reprodução.

## Modelo conceptual

```text
IPTV
└── Canal
    ├── Fonte principal
    ├── Fontes alternativas
    ├── Dados TVG
    ├── Dados EPG
    ├── Origem M3U
    ├── País
    ├── Categoria
    ├── Idiomas
    ├── Tags
    └── Estado técnico
```

Um canal IPTV é a entidade apresentada ao utilizador.

As fontes são detalhes técnicos do canal e não constituem uma área separada de navegação.

## Modelo de dados

Coleções PocketBase principais:

- `canais_tv`;
- `stream_links`;
- `categorias_tv`;
- `paises`;
- `idiomas`;
- `tags`.

## Compatibilidade temporária

- os nomes das coleções PocketBase não serão alterados nesta versão;
- a rota `/tv` será preservada até existir redirect para `/iptv`;
- os diretórios `components/live` e `domain/live` permanecem temporariamente;
- os tipos antigos permanecem disponíveis através de aliases compatíveis;
- as preferências locais existentes devem ser migradas ou preservadas.

## Concluído

### Interface

- terminologia visível alterada de “TV e streams” para “IPTV”;
- cartão IPTV atualizado no ecrã inicial;
- navegação lateral atualizada;
- título “Canais IPTV” aplicado à biblioteca;
- estados de carregamento e vazio atualizados;
- vistas de grelha, logótipos, lista e compacta;
- largura dos cartões configurável;
- filtros por pesquisa, país, categoria, qualidade, estado e favorito;
- paginação acessível.

### Canais e fontes

- listagem de canais em `canais_tv`;
- fonte principal no canal;
- fontes alternativas em `stream_links`;
- detalhe do canal;
- edição e arquivo lógico;
- prioridade das fontes;
- estado técnico das fontes;
- suporte de tipos HLS, MPEG-DASH, HTTP, áudio, RTMP, RTSP e UDP/RTP;
- identificação de fontes que exigem backend local;
- informação TVG-ID, TVG name e EPG-ID;
- origem da playlist.

### Importação e validação

- parser TypeScript de playlists M3U e M3U8;
- leitura de metadados IPTV;
- validação de protocolos;
- deteção de URLs inválidas;
- deteção de duplicados;
- testes unitários do parser;
- validação dos formulários de canais e fontes.

### Separação de domínios

- `broadcast` removido dos tipos VOD;
- `broadcast` removido dos filtros VOD;
- `broadcast` removido da apresentação das modalidades;
- `broadcast` removido de `AvailabilityRecord`;
- aliases TypeScript adicionados:
  - `IptvChannelRecord`;
  - `IptvSourceRecord`;
  - `IptvCategoryRecord`.

## Em execução

- adoção dos aliases `Iptv*` nos módulos IPTV;
- melhoria dos cabeçalhos técnicos e relações entre ficheiros;
- documentação das dependências do domínio;
- normalização da nomenclatura interna;
- preparação da rota `/iptv`;
- preservação de `/tv` através de redirect;
- preparação do versionamento do esquema PocketBase.

## Trabalho previsto

- renomear `LiveView.vue` para `IptvView.vue`;
- migrar `components/live` para `components/iptv`;
- migrar `domain/live` para `domain/iptv`;
- migrar estilos `live-*` para `iptv-*`;
- avaliar a renomeação de `channelRepository` para `iptvChannelRepository`;
- avaliar a renomeação de `streamLinkRepository` para `iptvSourceRepository`;
- ativar o diálogo de importação M3U;
- implementar importação selecionável;
- concluir deteção de duplicados durante importações;
- adicionar reprodução HLS onde não exista suporte nativo;
- integrar XMLTV/EPG;
- melhorar diagnóstico e histórico de testes;
- adicionar testes da página IPTV;
- testar a migração da preferência local da grelha;
- documentar rollback.

## Fora deste domínio

Devem permanecer separados de IPTV:

- rádio online;
- webcams;
- podcasts;
- VOD e disponibilidades;
- providers de filmes e séries.

Estes conteúdos podem reutilizar componentes técnicos, mas não devem ser inseridos no domínio IPTV.

## Validação atual

- `npm run type-check`: aprovado;
- `npm run build`: aprovado;
- pesquisa global por `broadcast`: sem resultados no frontend;
- interface IPTV carregada corretamente;
- canais existentes preservados;
- coleções PocketBase preservadas;
- sem alterações destrutivas ao esquema.

## Critérios de conclusão

A versão pode ser considerada concluída quando:

- `/iptv` for uma rota funcional;
- `/tv` redirecionar para `/iptv`;
- os imports principais usarem nomenclatura IPTV;
- a importação M3U estiver funcional;
- os testes críticos estiverem aprovados;
- `npm audit` não apresentar vulnerabilidades conhecidas;
- `npm run type-check` passar;
- `npm test` passar;
- `npm run build` passar;
- `git diff --check` passar;
- a documentação e os cabeçalhos técnicos estiverem atualizados.

## Estado

**Em desenvolvimento.**

</details>

<details>
<summary><strong>v0.3.0-alpha.1 — Podcasts</strong> · Concluído · [+] Mostrar detalhes</summary>

## Objetivo

Migrar o domínio de podcasts para módulos Vue e TypeScript independentes, com sincronização RSS, biblioteca de episódios e reprodução.

## Modelo de dados

Coleções PocketBase principais:

- `streams`, com `tipo = "podcast"`;
- `podcast_episodios`.

## Concluído

- parsing RSS;
- suporte de namespaces iTunes;
- identificação de feeds RSS;
- sincronização individual;
- sincronização global;
- prevenção de duplicação por GUID;
- imagens por podcast e por episódio;
- fallback de imagem do episódio para a imagem do podcast;
- duração;
- temporada e episódio;
- conteúdo explícito;
- descrição em texto;
- imagens remotas presentes na descrição;
- apresentação dos episódios recentes;
- seleção de podcast;
- pesquisa de podcasts;
- pesquisa de episódios;
- filtros por estado de escuta;
- filtros de conteúdo explícito;
- filtros de favoritos;
- vistas em grelha, lista e compacta;
- paginação de podcasts;
- paginação de episódios;
- player de áudio;
- pausa e continuação da reprodução;
- gravação periódica do progresso;
- marcação automática como concluído;
- favoritos;
- edição do podcast;
- edição do estado do episódio;
- ligação para RSS;
- ligação para a página oficial;
- estados de loading, erro e vazio.

## Validação

- `npm run type-check`: aprovado;
- `npm run build`: aprovado;
- carregamento dos podcasts existentes: aprovado;
- carregamento de episódios: aprovado;
- reprodução e progresso: implementados;
- sincronização individual e global: implementadas.

## Limitações conhecidas

- feeds bloqueados por CORS podem exigir um hook ou proxy local no PocketBase;
- os testes com fixtures devem continuar a crescer;
- transferências offline ainda não estão implementadas;
- fila global de reprodução ainda não está implementada;
- a normalização avançada de descrições HTML pode ser melhorada.

## Estado

**Concluído para o marco alpha.**

</details>

<details>
<summary><strong>v0.2.0-alpha.1 — Gestão VOD</strong> · Concluído · [+] Mostrar detalhes</summary>

## Objetivo

Gerir onde cada título pode ser visto por streaming, alugado, comprado, consultado gratuitamente ou encontrado numa biblioteca.

IPTV e emissões lineares não pertencem ao domínio VOD.

## Modelo de dados

Usa a coleção PocketBase `disponibilidades`, relacionada com `titulos` e `paises`.

## Modalidades suportadas

- `streaming`;
- `aluguer`;
- `compra`;
- `gratuito`;
- `biblioteca`;
- `fisico`;
- `outro`.

O tipo `broadcast` foi removido durante a separação técnica entre VOD e IPTV.

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

- `npm audit`: 0 vulnerabilidades na validação do marco;
- `npm run type-check`: aprovado;
- `npm run build`: aprovado;
- criação, edição, filtros, duplicados, estados, `Onde ver` e eliminação: aprovados;
- interface responsiva e consola sem erros da aplicação.

## Limitações conhecidas

- testes automáticos ainda não implementados para todos os fluxos;
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

## Concluído

- tipos, mapper e validação;
- lookups;
- criação real em `titulos`;
- detalhe e rotas do catálogo.

</details>

<details>
<summary><strong>v0.1.0-alpha.1 — Fundação Vue 3 + TypeScript</strong> · Concluído · [+] Mostrar detalhes</summary>

## Concluído

- Vue 3, TypeScript, Vite e Vue Router;
- cliente PocketBase e repositórios;
- layout, sidebar e temas;
- build e type-check;
- identidade Mediário e documentação inicial.

</details>

---

<details>
<summary><strong>Versões técnicas dos módulos</strong> · [+] Mostrar detalhes</summary>

Esta tabela regista a versão documental dos módulos principais.

A versão do módulo não substitui a versão do projeto nem o histórico Git. Indica a revisão do contrato técnico, das relações e das responsabilidades do ficheiro.

| Domínio | Ficheiro principal | Versão | Estado | Revisto no projeto | Esquema mínimo |
|---|---|---:|---|---|---|
| Aplicação | `src/App.vue` | `1.0.0` | Em desenvolvimento | `0.3.0-alpha.1` | Legado atual |
| Rotas | `src/router/index.ts` | `1.0.0` | Em migração | `0.3.0-alpha.1` | Legado atual |
| Tipos PocketBase | `src/types/records.ts` | `1.1.0` | Em migração | `0.3.0-alpha.1` | Legado atual |
| Catálogo | `src/views/CatalogView.vue` | `1.0.0` | Estável no marco alpha | `0.1.0-alpha.3` | Legado atual |
| VOD | `src/views/VodView.vue` | `1.1.0` | Estável no marco alpha | `0.3.0-alpha.1` | Legado atual |
| Podcasts | `src/views/PodcastsView.vue` | `1.0.0` | Estável no marco alpha | `0.3.0-alpha.1` | Legado atual |
| IPTV | `src/views/LiveView.vue` | `1.1.0` | Em migração | `0.3.0-alpha.1` | Legado atual |
| Biblioteca | `src/views/LibraryView.vue` | `0.1.0` | Em desenvolvimento | `0.3.0-alpha.1` | Legado atual |

## Regras

- `PATCH`: correção interna ou documental compatível;
- `MINOR`: nova funcionalidade compatível;
- `MAJOR`: mudança incompatível do contrato;
- atualizar a versão quando mudarem props, eventos, rota, fluxo, tipos ou relações;
- atualizar “Revisto no projeto” quando o módulo for tecnicamente revisto;
- substituir “Legado atual” por uma versão numérica quando o esquema PocketBase passar a ser formalmente versionado.

</details>

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

## Versões dos ficheiros

Os módulos principais também usam `MAJOR.MINOR.PATCH`:

- **PATCH**: documentação, correção, acessibilidade ou refatoração interna compatível;
- **MINOR**: nova funcionalidade compatível, nova prop opcional, novo evento ou nova relação;
- **MAJOR**: alteração incompatível de props, eventos, rotas, dados, coleções ou funções exportadas.

A versão do ficheiro indica a revisão do contrato técnico do módulo, não substitui o Git.

</details>

<details>
<summary><strong>Processo de release</strong> · [+] Mostrar detalhes</summary>

1. Confirmar o estado da árvore de trabalho:

   ```powershell
   git status
   git diff
   ```

2. Atualizar de forma coerente:

   - `package.json`;
   - `package-lock.json`;
   - `VERSIONS.md`;
   - `CHANGELOG.md`;
   - cabeçalhos dos módulos alterados;
   - versão mínima do esquema, quando aplicável.

3. Executar as validações:

   ```powershell
   npm audit
   npm run type-check
   npm test
   npm run build
   git diff --check
   ```

4. Realizar os testes manuais definidos para o marco.

5. Confirmar:

   - consola sem erros da aplicação;
   - ausência de texto com encoding corrompido;
   - funcionamento responsivo;
   - navegação por teclado;
   - compatibilidade com os dados PocketBase existentes.

6. Fazer commit e push na `main`.

7. Gerar o pacote:

   ```powershell
   .\scripts\preparar-main.ps1
   ```

8. Criar uma tag anotada:

   ```powershell
   git tag -a v0.3.0-alpha.1 -m "Mediário v0.3.0-alpha.1"
   git push origin v0.3.0-alpha.1
   ```

9. Criar a GitHub Release.

10. Marcar como pre-release enquanto a versão for alpha, beta ou release candidate.

</details>

---

## Histórico resumido

| Data | Versão | Marco |
|---|---|---|
| 2026-11-19 | `v0.1.0-alpha.1` | Fundação Vue 3 + TypeScript. |
| 2026-11-19 | `v0.1.0-alpha.2` | Fundação do catálogo. |
| 2026-11-20 | `v0.1.0-alpha.3` | Catálogo editável, imagens e lixeira. |
| 2026-11-20 | `v0.2.0-alpha.1` | Gestão VOD concluída. |
| 2026-11-21 | `v0.3.0-alpha.1` | Podcasts concluídos e início da separação técnica de IPTV. |

## Regras de manutenção deste documento

- atualizar a versão atual e o próximo marco após cada release;
- manter o resumo coerente com os blocos detalhados;
- registar validações realmente executadas;
- não marcar funcionalidades como concluídas sem validação;
- atualizar relações, compatibilidade e limitações conhecidas;
- manter o ficheiro em UTF-8 sem BOM;
- atualizar a versão deste documento quando a sua estrutura ou política mudar.

## Autor e licença

Desenvolvido por **Zubiaks**.

Copyright (c) 2026 Zubiaks.

Software source-available sob a **PolyForm Noncommercial License 1.0.0**. A utilização comercial requer autorização prévia e escrita de Zubiaks.

Consulta `LICENSE.md` e `LICENSE-TRANSITION.md`.
