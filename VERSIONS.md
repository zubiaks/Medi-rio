# Versões do Mediário

> **Versão do documento:** `3.0.0`  
> **Última revisão:** `2026-11-22`  
> **Autor:** Zubiaks  
> **Licença:** PolyForm Noncommercial License 1.0.0

Este documento regista as versões do **Mediário**, o objetivo de cada marco, as funcionalidades incluídas, o estado de validação e o trabalho ainda pendente.

As versões estão ordenadas da mais recente para a mais antiga. Cada bloco pode ser aberto ou fechado no GitHub.

> **Versão atual:** `v0.4.0-alpha.1` — IPTV, M3U, XMLTV, fontes, diagnóstico e produtividade.  
> **Marco atual:** `v0.5.0-alpha.1` — Biblioteca física.  
> **Próximo marco:** `v0.6.0-beta.1` — Diário e reviews.  
> **Versão técnica do frontend:** `0.4.0-alpha.1`.  
> **Versão do esquema PocketBase:** `1.0.0`.

## Resumo

| Versão | Marco | Estado |
|---|---|---|
| `v1.0.0` | Primeira versão estável | Planeado |
| `v0.9.0-rc.1` | Candidato a versão estável | Planeado |
| `v0.8.0-beta.1` | Segurança, instalação e recuperação | Planeado |
| `v0.7.0-beta.1` | Providers e manutenção | Planeado |
| `v0.6.0-beta.1` | Diário e reviews | Planeado |
| `v0.5.0-alpha.1` | Biblioteca física | **Em desenvolvimento** |
| `v0.4.0-alpha.1` | IPTV, M3U, XMLTV, fontes e reprodução | **Concluído** |
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
- revisão das API Rules das coleções PocketBase;
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

## Modelo de dados

Coleções PocketBase principais:

- `visualizacoes`;
- `reviews`;
- `titulos`;
- `temporadas`;
- `episodios`;
- `plataformas`.

## Trabalho previsto

- diário baseado em `visualizacoes`;
- progresso por duração, episódios, páginas, capítulos, faixas ou horas;
- revisualizações e calendário;
- reviews e avaliações;
- estatísticas e resumo anual.

</details>

<details open>
<summary><strong>v0.5.0-alpha.1 — Biblioteca física</strong> · Em desenvolvimento · [−] Ocultar detalhes</summary>

## Objetivo

Gerir exemplares e edições físicas, formatos, códigos, localização, conservação, empréstimos, devoluções e histórico.

## Modelo conceptual

```text
Biblioteca física
└── Exemplar
    ├── Título do catálogo
    ├── Formato físico
    ├── Tipo de edição
    ├── Número da cópia
    ├── Código interno e código de barras
    ├── Estado físico e região
    ├── Localização
    ├── Selado e Steelbook
    ├── Notas
    └── Empréstimos
        ├── Pessoa
        ├── Data de empréstimo
        ├── Data prevista
        ├── Renovações
        ├── Data de devolução
        └── Estado do histórico
```

## Modelo de dados

Coleções PocketBase principais:

- `exemplares`;
- `historico_emprestimos`;
- `formatos_fisicos`;
- `tipos_edicao`;
- `titulos`;
- `pessoas`.

O esquema mínimo documentado é `1.0.0`.

## Concluído

### Fase 1 — Fundação e exemplares

- página própria em `/biblioteca`;
- repositório tipado para `exemplares`;
- criação e edição de exemplares;
- pesquisa e associação a títulos do catálogo;
- relações com `formatos_fisicos` e `tipos_edicao`;
- número da cópia;
- código interno;
- código de barras;
- estado físico;
- região;
- localização;
- indicadores de exemplar selado e Steelbook;
- notas;
- estados de carregamento, vazio e erro;
- paginação;
- validação acessível.

### Fase 2 — Gestão avançada e empréstimos

- métricas de exemplares disponíveis, emprestados e atrasados;
- pesquisa por título, código interno e código de barras;
- filtros por estado, formato, edição e localização;
- tabela expandida com os dados físicos e códigos;
- deteção de códigos internos e códigos de barras repetidos;
- separação entre edição do exemplar e operações de empréstimo;
- início de empréstimo;
- renovação;
- devolução;
- registo de exemplar perdido;
- cancelamento de empréstimo;
- prevenção de empréstimos ativos duplicados;
- rollback compensatório entre `exemplares` e `historico_emprestimos`;
- histórico global de empréstimos;
- textos claros e acessíveis para cada estado;
- testes de validação, fluxo, métricas, duplicados e acessibilidade.

### Estados confirmados de empréstimo

O campo `historico_emprestimos.estado` é um `select` de escolha única com os valores exatos:

```text
Emprestado
Atrasado
Devolvido
Perdido
Danificado
Cancelado
```

Regras implementadas:

- `Emprestado`: empréstimo ativo;
- `Atrasado`: empréstimo ativo cuja data prevista já passou;
- `Devolvido`: devolução em bom estado;
- `Danificado`: devolução assinalada como não estando em bom estado;
- `Perdido`: encerramento por perda, com nota obrigatória;
- `Cancelado`: encerramento por cancelamento, com nota obrigatória.

Apenas `Emprestado` e `Atrasado` são tratados como estados ativos.

## Em execução

### Fase 3 — Detalhe e histórico individual

- detalhe completo do exemplar;
- capa e ligação ao título associado;
- formato e tipo de edição;
- conservação, região, localização e códigos;
- atributos Selado e Steelbook;
- datas de criação e atualização;
- notas do exemplar;
- total de empréstimos e renovações;
- empréstimo ativo;
- indicação de atraso;
- último empréstimo encerrado;
- histórico individual por exemplar;
- edição e ações de empréstimo a partir do detalhe;
- atualização do detalhe depois de alterar um empréstimo.

## Trabalho previsto

### Fase 4 — Pessoas e empréstimos por destinatário

- lista de pessoas com empréstimos ativos;
- pesquisa e resumo por pessoa;
- quantidade de empréstimos ativos e atrasados;
- próxima data prevista;
- histórico individual por destinatário;
- aviso antes de emprestar a alguém com atrasos;
- decisão documentada sobre contactos próprios ou reutilização de `pessoas`.

### Fase 5 — Importação, códigos e inventário

- importação CSV;
- pré-visualização e validação por linha;
- associação a títulos existentes;
- geração controlada de códigos internos;
- pesquisa rápida por código de barras;
- exportação CSV e JSON;
- relatório de criados, atualizados, ignorados e falhados.

### Fase 6 — Sessões de inventário

- sessões formais de inventário;
- encontrados, não localizados e localização incorreta;
- progresso e discrepâncias;
- relatório final;
- exportação CSV;
- registo no `audit_log`;
- migrations para coleções de inventário, se necessárias.

### Trabalho posterior

- compras, preço e valor da coleção dependem de campos ou coleções ainda não existentes no esquema `1.0.0`;
- normalizar destinatários de empréstimos sem misturar contactos com pessoas de créditos do catálogo;
- definir arquivo lógico de exemplares sem apagar o histórico;
- testes de integração do marco completo.

## Validação atual

- Fase 2 committed;
- `npm run type-check`: aprovado;
- 14 testes essenciais da Fase 2: aprovados;
- `npm run build`: aprovado após correção das expressões Vue;
- `git diff --check`: aprovado;
- estados do PocketBase confirmados;
- coleções e campos preservados sem migração destrutiva.

## Critérios de conclusão

A versão pode ser considerada concluída quando:

- criação, edição e detalhe dos exemplares estiverem funcionais;
- empréstimos, renovações e devoluções estiverem estáveis;
- históricos global, individual e por pessoa estiverem acessíveis;
- importação e exportação do inventário estiverem implementadas;
- sessões de inventário estiverem funcionais ou formalmente adiadas;
- não existirem históricos ativos duplicados;
- os testes críticos da Biblioteca estiverem aprovados;
- `npm audit`, `npm run type-check`, testes, build e `git diff --check` passarem;
- documentação e cabeçalhos técnicos estiverem atualizados.

## Estado

**Em desenvolvimento. Fases 1 e 2 concluídas; Fase 3 em execução.**

</details>

<details>
<summary><strong>v0.4.0-alpha.1 — IPTV, M3U, XMLTV, fontes e reprodução</strong> · Concluído · [+] Mostrar detalhes</summary>

## Objetivo

Consolidar o domínio IPTV, separar IPTV de VOD e disponibilizar uma arquitetura própria para canais, fontes, playlists M3U, EPG, reprodução e manutenção.

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

## Modelo de dados

Coleções PocketBase principais:

- `canais_tv`;
- `stream_links`;
- `categorias_tv`;
- `paises`;
- `idiomas`;
- `tags`.

## Concluído

### Estrutura e navegação

- rota principal `/iptv`;
- redirect de compatibilidade `/tv` para `/iptv`;
- `IptvView.vue` como vista principal;
- componentes e domínio consolidados em `components/iptv` e `domain/iptv`;
- aliases `IptvChannelRecord`, `IptvSourceRecord` e `IptvCategoryRecord`;
- repositórios IPTV tipados e aliases legados compatíveis.

### Biblioteca de canais

- pesquisa, filtros e paginação;
- filtro por playlist de origem;
- vistas Grelha, Logos, Lista, Compacta e Texto;
- largura dinâmica dos cartões;
- preferências persistentes;
- fallback de logótipos;
- seleção múltipla;
- ações em lote;
- ativação, desativação, favoritos, categoria, país e arquivo lógico.

### M3U

- parser M3U e M3U8;
- importação por ficheiro e URL remota;
- timeout, limite de tamanho e diagnóstico de CORS;
- categorias automáticas por `group-title`;
- duplicados internos;
- reimportação segura por TVG-ID e URL;
- preservação de dados manuais vazios no M3U;
- fontes alternativas sem duplicação;
- modos Sincronizar, Apenas fontes e Apenas novos;
- plano prévio da importação;
- canais desaparecidos: manter, desativar ou arquivar;
- histórico local;
- relatórios JSON e CSV;
- ocultação de parâmetros sensíveis nos relatórios.

### XMLTV e EPG

- parser XMLTV;
- suporte de XML e XML.GZ em navegadores compatíveis;
- normalização de datas e fusos horários;
- correspondência por EPG-ID, TVG-ID e nome;
- armazenamento EPG local sem alteração do esquema;
- gestor EPG;
- guia de programação no detalhe do canal.

### Fontes, diagnóstico e player

- fontes principais e alternativas;
- prioridade, qualidade, tipo e estado técnico;
- seleção inteligente da melhor fonte;
- player com seleção manual e fallback controlado;
- diagnóstico individual e em lote;
- cancelamento de testes;
- latência, HTTP status e Content-Type;
- classificação de autenticação, bloqueio, limitar pedidos e falhas de rede;
- indicação explícita de fontes que exigem backend local.

### Testes e documentação

- testes de domínio, componentes e acessibilidade;
- testes corrigidos para componentes com Teleport;
- comandos específicos `test:iptv` e `check:iptv`;
- documentação da arquitetura e protocolos;
- validação de rota e redirect;
- `npm audit --omit=dev`: 0 vulnerabilidades na validação final;
- `npm run type-check`: aprovado;
- `npm run build`: aprovado;
- `git diff --check`: aprovado.

## Limitações conhecidas

- HLS sem suporte nativo pode exigir `hls.js` ou backend local;
- CORS, User-Agent e Referrer personalizados podem exigir backend;
- RTMP, RTSP e UDP/RTP não são reproduzidos diretamente pelo browser;
- EPG permanece em armazenamento local nesta versão;
- segurança e API Rules serão revistas no marco `v0.8.0-beta.1`.

## Estado

**Concluído para o marco alpha.**

</details>

<details>
<summary><strong>v0.3.0-alpha.1 — Podcasts</strong> · Concluído · [+] Mostrar detalhes</summary>

## Objetivo

Migrar o domínio de podcasts para módulos Vue e TypeScript independentes, com sincronização RSS, biblioteca de episódios e reprodução.

## Modelo de dados

- `streams`, com `tipo = "podcast"`;
- `podcast_episodios`.

## Concluído

- parsing RSS e Atom;
- namespaces iTunes;
- identificação de feeds;
- sincronização individual e global;
- prevenção de duplicação por GUID;
- imagens por podcast e episódio;
- duração, temporada e episódio;
- conteúdo explícito;
- descrição e ligações;
- pesquisa e filtros;
- vistas em grelha, lista e compacta;
- paginação;
- player de áudio;
- progresso e conclusão;
- favoritos;
- edição de podcast e episódio;
- estados de carregamento, erro e vazio.

## Validação

- `npm run type-check`: aprovado;
- `npm run build`: aprovado;
- carregamento, reprodução, progresso e sincronização implementados.

## Limitações conhecidas

- feeds bloqueados por CORS podem exigir hook ou proxy local;
- transferências offline e fila global ainda não implementadas;
- fixtures e testes podem continuar a crescer.

## Estado

**Concluído para o marco alpha.**

</details>

<details>
<summary><strong>v0.2.0-alpha.1 — Gestão VOD</strong> · Concluído · [+] Mostrar detalhes</summary>

## Objetivo

Gerir onde cada título pode ser visto por streaming, alugado, comprado, consultado gratuitamente ou encontrado numa biblioteca.

IPTV e emissões lineares não pertencem ao domínio VOD.

## Modelo de dados

Coleção `disponibilidades`, relacionada com `titulos` e `paises`.

## Modalidades suportadas

- `streaming`;
- `aluguer`;
- `compra`;
- `gratuito`;
- `biblioteca`;
- `fisico`;
- `outro`.

## Concluído e testado

- listagem paginada;
- criação e edição;
- pesquisa assíncrona de títulos;
- provider, modalidade, URL, país, qualidade, preço e moeda;
- datas de início e fim;
- estados ativos, inativos e expirados;
- filtros preservados na URL;
- ativação e desativação;
- eliminação definitiva com confirmação;
- diálogo responsivo e acessível;
- deteção de duplicados;
- secção `Onde ver` no detalhe do título;
- proteção contra alterações não guardadas.

## Validação

- `npm audit`: 0 vulnerabilidades na validação do marco;
- `npm run type-check`: aprovado;
- `npm run build`: aprovado;
- fluxos principais aprovados.

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

Esta tabela regista a versão documental dos módulos principais. A versão do módulo não substitui a versão do projeto nem o histórico Git.

| Domínio | Ficheiro principal | Versão | Estado | Revisto no projeto | Esquema mínimo |
|---|---|---:|---|---|---|
| Aplicação | `src/App.vue` | `1.0.0` | Em desenvolvimento | `0.4.0-alpha.1` | `1.0.0` |
| Rotas | `src/router/index.ts` | `1.1.0` | Estável no marco alpha | `0.4.0-alpha.1` | `1.0.0` |
| Tipos PocketBase | `src/types/records.ts` | `1.2.0` | Em evolução | `0.5.0-alpha.1` | `1.0.0` |
| Catálogo | `src/views/CatalogView.vue` | `1.0.0` | Estável no marco alpha | `0.1.0-alpha.3` | `1.0.0` |
| VOD | `src/views/VodView.vue` | `1.1.0` | Estável no marco alpha | `0.3.0-alpha.1` | `1.0.0` |
| Podcasts | `src/views/PodcastsView.vue` | `1.0.0` | Estável no marco alpha | `0.3.0-alpha.1` | `1.0.0` |
| IPTV | `src/views/IptvView.vue` | `3.0.0` | Concluído no marco alpha | `0.4.0-alpha.1` | `1.0.0` |
| Biblioteca | `src/views/LibraryView.vue` | `1.0.0` | Em desenvolvimento | `0.5.0-alpha.1` | `1.0.0` |

## Regras

- `PATCH`: correção interna ou documental compatível;
- `MINOR`: nova funcionalidade compatível;
- `MAJOR`: mudança incompatível do contrato;
- atualizar a versão quando mudarem props, eventos, rota, fluxo, tipos ou relações;
- atualizar “Revisto no projeto” quando o módulo for tecnicamente revisto;
- atualizar “Esquema mínimo” quando uma funcionalidade depender de uma versão documentada do PocketBase.

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

- **PATCH**: documentação, correção, acessibilidade ou refatoração interna compatível;
- **MINOR**: nova funcionalidade compatível, nova prop opcional, novo evento ou nova relação;
- **MAJOR**: alteração incompatível de props, eventos, rotas, dados, coleções ou funções exportadas.

</details>

<details>
<summary><strong>Processo de release</strong> · [+] Mostrar detalhes</summary>

1. Confirmar o estado da árvore:

   ```powershell
   git status
   git diff
   ```

2. Atualizar:

   - `package.json`;
   - `package-lock.json`;
   - `VERSIONS.md`;
   - `CHANGELOG.md`;
   - cabeçalhos dos módulos alterados;
   - versão mínima do esquema.

3. Durante cada lote, executar apenas os testes essenciais relacionados.

4. No encerramento do marco, executar:

   ```powershell
   npm audit
   npm run type-check
   npm test
   npm run build
   git diff --check
   ```

5. Realizar os testes manuais definidos para o marco.

6. Confirmar:

   - consola sem erros;
   - ausência de encoding corrompido;
   - comportamento responsivo;
   - navegação por teclado;
   - compatibilidade com os dados PocketBase existentes.

7. Fazer commit e push na `main`.

8. Criar tag anotada e GitHub Release quando o marco estiver concluído.

</details>

---

## Histórico resumido

| Data | Versão | Marco |
|---|---|---|
| 2026-11-19 | `v0.1.0-alpha.1` | Fundação Vue 3 + TypeScript. |
| 2026-11-19 | `v0.1.0-alpha.2` | Fundação do catálogo. |
| 2026-11-20 | `v0.1.0-alpha.3` | Catálogo editável, imagens e lixeira. |
| 2026-11-20 | `v0.2.0-alpha.1` | Gestão VOD concluída. |
| 2026-11-21 | `v0.3.0-alpha.1` | Podcasts concluídos. |
| 2026-11-22 | `v0.4.0-alpha.1` | IPTV, M3U, XMLTV, fontes, diagnóstico e produtividade concluídos. |
| 2026-11-22 | `v0.5.0-alpha.1` | Início da Biblioteca física; Fases 1 e 2 concluídas e Fase 3 em execução. |

## Regras de manutenção deste documento

- atualizar a versão atual e o próximo marco após cada release;
- manter o resumo coerente com os blocos detalhados;
- registar apenas validações realmente executadas;
- não marcar funcionalidades como concluídas sem validação;
- atualizar relações, compatibilidade e limitações conhecidas;
- manter UTF-8 sem BOM;
- atualizar a versão do documento quando a estrutura ou política mudar.

## Autor e licença

Desenvolvido por **Zubiaks**.

Copyright (c) 2026 Zubiaks.

Software source-available sob a **PolyForm Noncommercial License 1.0.0**. A utilização comercial requer autorização prévia e escrita de Zubiaks.

Consulta `LICENSE.md` e `LICENSE-TRANSITION.md`.
