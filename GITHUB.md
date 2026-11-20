# Configuração do projeto Mediário no GitHub

Este documento regista como preencher e manter as opções do repositório no GitHub.

## Identidade do repositório

Na página do repositório, abrir **Settings → General** e usar:

| Opção | Valor recomendado |
|---|---|
| Repository name | `Mediario` |
| Description | `Catálogo multimédia pessoal para organizar, acompanhar e descobrir filmes, séries, livros, videojogos, música, podcasts, VOD, televisão e streams.` |
| Website | Deixar vazio enquanto não existir uma versão publicada |
| Visibility | `Public`, se o objetivo for permitir reutilização e contribuição |
| Default branch | `main` |

O nome apresentado pela aplicação permanece **Mediário**, com acento. O nome técnico do repositório usa `Mediario`, sem acento, para facilitar URLs e ferramentas.

## Secção About

Na página principal do repositório, clicar na engrenagem junto de **About**.

### Description

```text
Catálogo multimédia pessoal para organizar, acompanhar e descobrir filmes, séries, livros, videojogos, música, podcasts, VOD, televisão e streams.
```

### Website

Deixar vazio por agora. Quando existir GitHub Pages ou outro endereço público, preencher com a URL da aplicação ou da documentação.

### Topics

Adicionar os seguintes tópicos:

```text
vue
vue3
typescript
vite
pocketbase
media-library
personal-library
movie-tracker
tv-tracker
podcast-manager
iptv
vod
open-source
self-hosted
portuguese
```

### Opções About

Ativar:

- Releases
- Packages, apenas se no futuro forem publicados pacotes ou imagens de contentor
- Deployments, apenas quando existir publicação automática

Desativar por agora:

- Website, enquanto não existir URL pública

## Features do repositório

Em **Settings → General → Features**:

| Opção | Decisão |
|---|---|
| Issues | Ativar |
| Preserve this repository | Desativar por agora |
| Discussions | Ativar quando houver utilizadores ou colaboradores externos |
| Projects | Ativar se for usado um quadro de tarefas |
| Wiki | Desativar; a documentação fica versionada em `docs/` |

## Issues

Criar labels com estes nomes e finalidades:

| Label | Finalidade |
|---|---|
| `bug` | Erro reproduzível |
| `feature` | Nova funcionalidade |
| `enhancement` | Melhoria de uma funcionalidade existente |
| `documentation` | README, documentação e exemplos |
| `database` | PocketBase, schema, migrations e relações |
| `catalog` | Catálogo e títulos |
| `vod` | Disponibilidades e providers VOD |
| `podcasts` | RSS, episódios e player |
| `live` | IPTV, rádio, TV e streams |
| `security` | Autenticação, regras e vulnerabilidades |
| `testing` | Testes unitários, integração e E2E |
| `good first issue` | Tarefa adequada para primeira contribuição |
| `help wanted` | Precisa de colaboração |

## Branches

Usar:

```text
main
feature/nome-da-funcionalidade
fix/nome-do-erro
refactor/nome-do-modulo
docs/nome-da-documentacao
```

A branch `main` representa o estado integrado e validado.

### Proteção futura da main

Quando existirem colaboradores, configurar em **Settings → Branches**:

- exigir Pull Request antes de merge;
- exigir pelo menos uma aprovação;
- exigir resolução de conversas;
- exigir verificações de `type-check`, `build` e testes;
- impedir push forçado;
- impedir eliminação da branch.

Enquanto o projeto for mantido apenas por Zubiaks, estas regras podem ficar desativadas para reduzir atrito.

## Pull Requests

Cada Pull Request deve indicar:

```markdown
## O que mudou

## Motivo

## Base de dados
- [ ] Sem alterações
- [ ] Migration incluída

## Validação
- [ ] npm audit
- [ ] npm run type-check
- [ ] npm run build
- [ ] Teste manual

## Capturas de ecrã

## Riscos e reversão
```

## Releases

Criar uma Release apenas para marcos testáveis, não para cada commit.

### Tag atual sugerida

```text
v0.2.0-alpha.1
```

### Título da Release

```text
Mediário v0.2.0-alpha.1 — Fundação VOD
```

### Descrição da Release

```markdown
## Destaques

- Catálogo com criação, detalhe e edição de títulos.
- Relações múltiplas pesquisáveis.
- Poster, backdrop e logo através de ficheiros locais ou URLs externas.
- Redimensionamento de imagens antes do upload.
- Lixeira, restauro e eliminação definitiva.
- Fundação VOD com criação e edição de disponibilidades.

## Estado

Versão alpha destinada a desenvolvimento e testes locais.

## Requisitos

- Node.js compatível com o projeto.
- PocketBase em `http://127.0.0.1:8090`.
- Coleções e campos descritos na documentação da base.

## Validação

- `npm audit`
- `npm run type-check`
- `npm run build`
- criação e edição de títulos
- imagens locais e URLs externas
- lixeira e restauro
- criação e edição VOD
```

Marcar a Release como **pre-release**, porque ainda é uma versão alpha.

## Segurança

Nunca publicar:

```text
pb_data/
.credentials.xml
.env
pocketbase.exe
node_modules/
dist/
backups/
```

Publicar:

```text
src/
docs/
pb_migrations/
pb_hooks/
package.json
package-lock.json
README.md
VERSIONS.md
CHANGELOG.md
LICENSE.md
.gitignore
.gitattributes
```

## Autor

Os commits devem usar:

```text
Nome: Zubiaks
Email: zubiaks@hotmail.com
```

O email precisa de estar verificado na conta GitHub para os commits aparecerem associados ao perfil.

## Documentos visíveis na raiz

Manter na raiz:

```text
README.md
VERSIONS.md
CHANGELOG.md
CONTRIBUTING.md
LICENSE.md
SECURITY.md
GITHUB.md
```

O `README.md` é a entrada principal. O `VERSIONS.md` explica os marcos. O `CHANGELOG.md` regista alterações concretas publicadas.
