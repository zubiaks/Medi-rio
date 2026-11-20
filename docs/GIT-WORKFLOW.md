# Fluxo Git do Mediário

## Regra simples

```text
Issue → Branch → Commits → Push → Pull Request → Revisão → Merge → Release
```

## 1. Criar ou escolher uma Issue

A Issue deve explicar o problema, resultado esperado e critérios de aceitação.

## 2. Criar uma branch

A partir de `main` atualizada:

```powershell
git switch main
git pull
git switch -c feature/vod-filters
```

## 3. Trabalhar em commits pequenos

```text
feat(vod): adicionar filtros
fix(vod): normalizar qualidade
 docs(vod): atualizar documentação
```

Evita commits do tipo `alterações`, `update` ou `coisas novas`.

## 4. Validar antes do push

```powershell
npm audit
npm run type-check
npm run build
```

## 5. Publicar a branch

No GitHub Desktop usa **Publish branch** ou **Push origin**.

## 6. Criar Pull Request

- base: `main`;
- compare: branch da funcionalidade;
- título em Conventional Commits;
- preencher o template completo;
- associar labels, Issue e milestone.

## 7. Resolver conflitos

Atualiza a branch com `main`, resolve ficheiro a ficheiro e volta a executar todos os testes. Não uses “aceitar tudo” sem rever.

## 8. Merge

Para uma branch com vários commits pequenos, prefere **Squash and merge**. Usa **Create a merge commit** quando o histórico da branch precisa de ser preservado.

## 9. Depois do merge

- atualizar `main` local;
- apagar a branch integrada;
- atualizar `VERSIONS.md` e `CHANGELOG.md` quando aplicável;
- criar tag apenas para versões testadas.

## Proteção recomendada da main

Quando o projeto tiver mais colaboradores:

- exigir Pull Request;
- exigir pelo menos 1 aprovação;
- exigir resolução de conversas;
- bloquear force push;
- bloquear eliminação da branch;
- exigir checks de type-check, build e testes.
