# ZIP 11A — checklist

## Migração
- [ ] Fazer backup de `pb_data`.
- [ ] Reiniciar PocketBase e confirmar a migração.
- [ ] Confirmar campos `nome`, `estado`, `role`, `avatar` e `ultimo_acesso`.
- [ ] Confirmar registo público desativado.
- [ ] Criar a primeira conta `admin` e `ativo`.

## Sessão
- [ ] Sem sessão, uma rota privada redireciona para `/login`.
- [ ] Login válido regressa à rota original.
- [ ] Credenciais erradas mostram mensagem neutra.
- [ ] Logout elimina a sessão.
- [ ] Atualizar a página preserva uma sessão válida.
- [ ] Token inválido ou expirado limpa a sessão.

## Estados e funções
- [ ] Conta ativa entra.
- [ ] Conta bloqueada não entra.
- [ ] Conta pendente não entra.
- [ ] Admin tem todas as permissões.
- [ ] Editor não gere credenciais nem utilizadores.
- [ ] Utilizador usa diário e listas, sem editar catálogo.
- [ ] Leitor apenas consulta catálogo.

## Perfil
- [ ] Alterar nome.
- [ ] Enviar JPEG, PNG ou WebP até 5 MB.
- [ ] Alterar palavra-passe com mínimo de 10 caracteres.
- [ ] Confirmar que palavras-passe diferentes são recusadas.

## Recuperação
- [ ] SMTP configurado.
- [ ] Pedido usa mensagem neutra.
- [ ] Ligação válida altera a palavra-passe.
- [ ] Ligação reutilizada ou expirada é recusada.
