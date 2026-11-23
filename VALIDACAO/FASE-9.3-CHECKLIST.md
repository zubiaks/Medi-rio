# Fase 9.3 — workspace de pesquisa

## Atalhos
- [ ] `Ctrl+K` abre a pesquisa em Providers.
- [ ] `Cmd+K` abre a pesquisa em macOS.
- [ ] `/` abre a pesquisa fora de campos editáveis.
- [ ] O atalho não dispara dentro de inputs, textareas, selects ou contenteditable.
- [ ] Os listeners são removidos ao sair da vista.

## Estado no URL
- [ ] Termo, modo, vista, entidades, provider e anos aparecem no URL.
- [ ] Atualizar a página com `?q=` volta a abrir a pesquisa.
- [ ] O modo Descobrir fica representado por `mode=discover`.
- [ ] Nenhuma credencial ou conteúdo de registos é colocado no URL.

## Ações
- [ ] Todos os resultados permitem copiar ID interno e nome.
- [ ] Fontes permitem copiar identificador externo.
- [ ] Fontes com URL permitem abrir a ligação num novo separador.
- [ ] A interface confirma as cópias com `role=status`.

## Vista dedicada
- [ ] `SearchView.vue` compila.
- [ ] A rota opcional `/pesquisa` pode ser acrescentada sem alterar o serviço.
- [ ] Providers mantém o funcionamento sem a rota dedicada.
