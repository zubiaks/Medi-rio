# Relatório de testes VOD

**Versão:** `v0.2.0-alpha.1`  
**Ambiente:** Mediário local, PocketBase `127.0.0.1:8090`, Vite `127.0.0.1:5173`  
**Responsável:** Zubiaks  
**Data:** 2026-11-20

## Resultado geral

- [ ] Aprovado
- [ ] Aprovado com limitações
- [ ] Reprovado

## Pré-validação técnica

- [ ] `npm audit` devolve `0 vulnerabilities`.
- [ ] `npm run type-check` termina sem erros.
- [ ] `npm run build` termina sem erros.
- [ ] PocketBase responde em `/api/health`.
- [ ] Consola limpa numa janela privada, ignorando apenas mensagens comprovadamente causadas por extensões.

## Dados controlados de teste

Usar um título de teste existente, por exemplo `Projeto Aurora`.

### Oferta principal

| Campo | Valor |
|---|---|
| Provider | MUBI |
| Modalidade | streaming |
| URL | https://mubi.com/ |
| País | Portugal |
| Qualidade | Full HD (`fhd`) |
| Preço | 11,99 |
| Moeda | EUR |
| Incluído na subscrição | Sim |
| Oferta ativa | Sim |

### Oferta expirada

| Campo | Valor |
|---|---|
| Provider | Teste Expirado |
| Modalidade | aluguer |
| País | Portugal |
| Qualidade | HD (`hd`) |
| Preço | 3,99 |
| Moeda | EUR |
| Disponível até | 2025-01-01 |
| Incluído na subscrição | Não |
| Oferta ativa | Sim |

## T01 — Listagem inicial

- [ ] Abrir `#/vod`.
- [ ] A página carrega sem HTTP 400/404.
- [ ] A descrição indica número de ofertas filtradas e total.
- [ ] Provider, título, país, modalidade, qualidade e preço estão corretos.
- [ ] `fhd` é apresentado como `Full HD`.

**Resultado:**  
**Notas:**

## T02 — Criar oferta

- [ ] Abrir `#/vod/novo`.
- [ ] Criar a oferta principal.
- [ ] Verificar o record em `disponibilidades` no PocketBase.
- [ ] Confirmar `qualidade = fhd` em minúsculas.
- [ ] Confirmar relação correta com `titulo` e `pais`.

**Resultado:**  
**ID criado:**  
**Notas:**

## T03 — Duplicados

- [ ] Tentar criar novamente a mesma combinação: título + MUBI + Portugal + streaming.
- [ ] Confirmar que aparece aviso de oferta semelhante.
- [ ] Escolher Cancelar e confirmar que não é criado novo record.
- [ ] Repetir, escolher continuar e confirmar que a decisão explícita permite guardar.
- [ ] Eliminar depois o duplicado adicional.

**Resultado:**  
**Notas:**

## T04 — Pesquisa e filtros

- [ ] Pesquisar por `MUBI`.
- [ ] Pesquisar pelo título.
- [ ] Filtrar por Portugal.
- [ ] Filtrar por streaming.
- [ ] Filtrar por Full HD.
- [ ] Filtrar por incluído na subscrição.
- [ ] Combinar país + modalidade + qualidade.
- [ ] Limpar filtros e confirmar a lista completa.

**Resultado:**  
**Notas:**

## T05 — Edição

- [ ] Abrir a oferta MUBI em edição.
- [ ] Alterar preço para `12,99`.
- [ ] Alterar qualidade para `4k`.
- [ ] Guardar.
- [ ] Confirmar `4K` e `12,99 €` na lista.
- [ ] Confirmar os valores no PocketBase.

**Resultado:**  
**Notas:**

## T06 — Alterações não guardadas

- [ ] Abrir edição.
- [ ] Alterar provider sem guardar.
- [ ] Clicar em Cancelar ou navegar para outra rota.
- [ ] Confirmar o aviso de alterações por guardar.
- [ ] Escolher permanecer e confirmar que os dados continuam no formulário.
- [ ] Escolher sair e confirmar que a base não foi alterada.

**Resultado:**  
**Notas:**

## T07 — Desativar e reativar

- [ ] Na lista, clicar Desativar.
- [ ] Confirmar que desaparece da vista Ativas.
- [ ] Selecionar filtro Inativas.
- [ ] Confirmar badge `Inativa`.
- [ ] Clicar Ativar.
- [ ] Voltar a Ativas e confirmar que reaparece.

**Resultado:**  
**Notas:**

## T08 — Oferta expirada

- [ ] Criar a oferta `Teste Expirado` com data final `2025-01-01`.
- [ ] Selecionar filtro Expiradas.
- [ ] Confirmar badge `Expirada`.
- [ ] Confirmar que o estado expirado não altera automaticamente `ativo`.

**Resultado:**  
**Notas:**

## T09 — Integração “Onde ver”

- [ ] Abrir o detalhe do título associado.
- [ ] Confirmar a secção `Onde ver`.
- [ ] Confirmar provider, modalidade, qualidade e preço.
- [ ] Clicar Abrir e confirmar nova aba com `rel="noopener noreferrer"`.
- [ ] Clicar Editar e confirmar a disponibilidade correta.
- [ ] Uma oferta inativa não deve aparecer em `Onde ver`.

**Resultado:**  
**Notas:**

## T10 — Eliminação definitiva

- [ ] Criar uma oferta descartável `Provider Para Eliminar`.
- [ ] Clicar Eliminar.
- [ ] Escrever um nome diferente e confirmar que o botão permanece bloqueado.
- [ ] Escrever exatamente `Provider Para Eliminar`.
- [ ] Confirmar a eliminação.
- [ ] Confirmar que o record desapareceu do PocketBase.
- [ ] Confirmar que a oferta desapareceu da lista e de `Onde ver`.

**Resultado:**  
**Notas:**

## T11 — Erros e rede

- [ ] Parar o PocketBase e abrir `#/vod`.
- [ ] Confirmar mensagem de erro e botão Voltar a tentar.
- [ ] Reiniciar PocketBase.
- [ ] Clicar Voltar a tentar e confirmar recuperação.
- [ ] Confirmar que nenhum erro é transformado silenciosamente em lista vazia.

**Resultado:**  
**Notas:**

## T12 — Responsividade e acessibilidade

- [ ] Testar a 320 px, tablet e desktop.
- [ ] Navegar pelos filtros apenas com teclado.
- [ ] Confirmar labels associados aos inputs.
- [ ] Confirmar foco visível.
- [ ] Confirmar que o diálogo de eliminação é legível e operável por teclado.
- [ ] Confirmar contraste dos badges Inativa e Expirada.

**Resultado:**  
**Notas:**

## Defeitos encontrados

| ID | Teste | Gravidade | Descrição | Estado |
|---|---|---|---|---|
| | | | | |

## Aprovação do marco

A versão `v0.2.0-alpha.1` só deve ser marcada como concluída quando T01–T12 passarem, ou quando limitações aceites estiverem documentadas.

**Decisão final:**  
**Observações finais:**
