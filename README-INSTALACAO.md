# Aplicar a licença não comercial

1. Copia `LICENSE.md`, `LICENSE-TRANSITION.md` e `docs/LICENSING.md` para a raiz do repositório.
2. Substitui a secção Licença do `README.md` pelo conteúdo de `README-LICENSE-SECTION.md`.
3. Em `pb_public/package.json`, usa:

```json
"license": "SEE LICENSE IN ../LICENSE.md"
```

Se o pacote npm tiver como raiz `pb_public`, esta referência aponta para o `LICENSE.md` da raiz.
4. Confirma que o repositório já não apresenta MIT como licença atual.
5. Só depois executa `scripts/adicionar-copyright.ps1`.
6. Executa `npm run type-check` e `npm run build`.
7. Faz um único commit jurídico com licença, documentação e cabeçalhos.

Não alteres o corpo oficial da PolyForm Noncommercial 1.0.0. Os únicos acréscimos próprios são as linhas `Required Notice:`.
