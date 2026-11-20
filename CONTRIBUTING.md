# Contribuir para o Mediário

Obrigado pelo interesse em melhorar o **Mediário**. Este documento define o processo esperado para issues, branches, commits, Pull Requests, testes e alterações à base de dados.

## Antes de começar

1. Consulta `README.md`, `VERSIONS.md` e `docs/GIT-WORKFLOW.md`.
2. Procura uma Issue existente antes de criar outra.
3. Para alterações grandes, abre primeiro uma Issue de proposta.
4. Nunca publiques dados pessoais, credenciais, API keys, `pb_data`, backups ou `.credentials.xml`.

## Ambiente local

Requisitos:

- Node.js LTS ou a versão documentada no `package.json`;
- npm;
- PocketBase na versão usada pelo projeto;
- Git;
- browser atualizado.

Instalação do frontend:

```powershell
cd pb_public
npm ci
npm audit
npm run type-check
npm run build
```

Arranque local:

```text
PocketBase: http://127.0.0.1:8090
Vite:       http://127.0.0.1:5173
```

## Branches

Não desenvolver diretamente na `main`.

Padrões:

```text
feature/nome-curto
fix/nome-do-erro
refactor/nome-do-modulo
docs/nome-do-documento
test/nome-do-fluxo
chore/nome-da-tarefa
```

Exemplos:

```text
feature/vod-filters
fix/catalog-date-input
docs/github-workflow
```

## Commits

Usa Conventional Commits:

```text
feat(catalog): adicionar edição de títulos
fix(vod): normalizar qualidade para fhd
docs: atualizar histórico de versões
```

A descrição do commit deve indicar:

- o que mudou;
- motivo;
- impacto na base de dados;
- validações executadas.

## Pull Requests

Um PR deve:

- resolver uma responsabilidade clara;
- referir a Issue quando existir;
- explicar alterações visíveis;
- indicar migrations e impacto em dados;
- incluir capturas quando altera a interface;
- passar `npm audit`, `npm run type-check` e `npm run build`;
- não incluir segredos, dados pessoais, builds ou dependências instaladas.

## PocketBase

Alterações de schema devem:

1. ser aplicadas por migration;
2. ser testadas numa cópia de desenvolvimento;
3. incluir reversão quando segura;
4. atualizar `docs/database.md`;
5. indicar se existe risco de perda de dados.

Nunca editar diretamente `pb_data/data.db`.

## Dependências npm

- usar versões estáveis recentes por padrão;
- manter `package-lock.json`;
- usar `npm ci` em instalações reproduzíveis;
- exigir `0 vulnerabilities` sempre que possível;
- não usar `npm audit fix --force` sem revisão;
- beta, RC, nightly e canary exigem vantagem concreta e decisão documentada.

## Definição de concluído

Uma alteração só está pronta quando:

- [ ] comportamento principal testado;
- [ ] estados loading, vazio e erro tratados;
- [ ] acessibilidade básica revista;
- [ ] interface responsiva;
- [ ] `npm audit` aprovado;
- [ ] `npm run type-check` aprovado;
- [ ] `npm run build` aprovado;
- [ ] consola sem erros causados pela aplicação;
- [ ] documentação atualizada;
- [ ] `VERSIONS.md` atualizado quando muda um marco.
