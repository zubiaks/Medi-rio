# Instalar as regras de colaboração

Copia todo o conteúdo deste pacote para a raiz do repositório `D:\Mediário`, preservando a pasta `.github`.

Depois confirma:

```powershell
git status --short
git add CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md SUPPORT.md docs .github
git commit -m "docs: adicionar regras de colaboração e fluxo Git"
```

No GitHub, ativa Issues e Private vulnerability reporting. Quando houver mais colaboradores, protege a branch `main` conforme `docs/GIT-WORKFLOW.md`.
