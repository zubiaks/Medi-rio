# ZIP 12B — checklist

## Sincronização
- [ ] Migrar pelo menos uma lista no browser A.
- [ ] Entrar com a mesma conta no browser B.
- [ ] Confirmar a lista em `Listas da conta`.
- [ ] Alterar nome no browser B e atualizar no A.
- [ ] Criar conflito: editar no A e B antes de guardar.
- [ ] Confirmar bloqueio por `updated`.
- [ ] Confirmar ordem e itens remotos.
- [ ] Confirmar isolamento entre contas.

## Backup
- [ ] Parar escritas ou PocketBase antes de um backup crítico.
- [ ] Criar backup.
- [ ] Confirmar `manifest.json`.
- [ ] Validar todos os hashes.
- [ ] Guardar o ZIP em local protegido.
- [ ] Confirmar aviso sobre credenciais em `data.db`.

## Restauro
- [ ] Testar primeiro numa cópia da instalação.
- [ ] Parar PocketBase.
- [ ] Executar restauro com `-Force`.
- [ ] Confirmar pasta `pre-restore-*`.
- [ ] Reiniciar PocketBase.
- [ ] Validar login, providers e listas.
