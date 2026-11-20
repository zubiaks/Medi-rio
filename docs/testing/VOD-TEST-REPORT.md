# Relatório de testes VOD

**Versão:** `v0.2.0-alpha.1`  
**Responsável:** Zubiaks  
**Data:** 2026-11-20  
**Resultado geral:** **Aprovado**

## Ambiente

- PocketBase: `http://127.0.0.1:8090`;
- Vite: `http://127.0.0.1:5173`;
- Node.js: 22.12.0 ou superior;
- Vite: 8.3.8;
- TypeScript: 5.9.2;
- Vue: 3.5.42.

## Validação técnica

- [x] `npm audit` devolve 0 vulnerabilidades.
- [x] `npm run type-check` termina sem erros.
- [x] `npm run build` termina sem erros.
- [x] Build validado com mais de 100 módulos transformados.
- [x] Consola sem erros gerados pela aplicação.

## Testes funcionais

### T01 — Listagem e paginação

- [x] A rota `#/vod` abre sem HTTP 400/404.
- [x] Provider, título, país, modalidade, qualidade e preço são apresentados.
- [x] A qualidade `fhd` é mostrada como `Full HD`.
- [x] A listagem usa 24 itens por página.
- [x] Filtros e página são preservados na URL.

**Resultado:** Aprovado.

### T02 — Criação

- [x] É possível criar uma disponibilidade.
- [x] O record é persistido em `disponibilidades`.
- [x] Título e país ficam relacionados corretamente.
- [x] A qualidade é guardada em minúsculas.

**Resultado:** Aprovado.

### T03 — Pesquisa de títulos

- [x] O formulário não carrega centenas de títulos ao abrir.
- [x] A pesquisa começa após 2 caracteres.
- [x] Existe debounce de 300 ms.
- [x] São apresentados no máximo 20 resultados.
- [x] Pesquisa por título, título original e ano.
- [x] O título associado é carregado durante a edição.

**Resultado:** Aprovado.

### T04 — Duplicados

- [x] Duplicados com Portugal são detetados.
- [x] Duplicados sem país são detetados.
- [x] Países diferentes não são tratados como duplicado.
- [x] Modalidades diferentes não são tratadas como duplicado.
- [x] A comparação do provider ignora maiúsculas, espaços e acentos.

**Defeito corrigido:** `VOD-001` — relações de país vazias não eram comparadas consistentemente.

**Resultado:** Aprovado após correção.

### T05 — Filtros

- [x] Pesquisa por título.
- [x] Pesquisa por provider.
- [x] Filtro por país.
- [x] Filtro por modalidade.
- [x] Filtro por qualidade.
- [x] Filtro por estado.
- [x] Filtro por subscrição.
- [x] Combinação de filtros.
- [x] Limpeza da pesquisa e de todos os filtros.

**Resultado:** Aprovado.

### T06 — Edição e alterações não guardadas

- [x] A edição persiste os novos valores.
- [x] A qualidade mantém os valores aceites pelo PocketBase.
- [x] O formulário avisa antes de abandonar alterações por guardar.

**Resultado:** Aprovado.

### T07 — Ativar e desativar

- [x] Uma oferta pode ser desativada.
- [x] A vista Ativas deixa de a apresentar.
- [x] A vista Inativas apresenta o badge correto.
- [x] Uma oferta pode ser reativada.

**Resultado:** Aprovado.

### T08 — Expiração

- [x] Ofertas com `data_fim` passada são identificadas.
- [x] O filtro Expiradas funciona.
- [x] A expiração não altera automaticamente o campo `ativo`.

**Resultado:** Aprovado.

### T09 — Onde ver

- [x] O detalhe do título mostra a secção `Onde ver`.
- [x] Provider, modalidade, qualidade e preço são apresentados.
- [x] A URL abre numa nova aba com proteção `noopener noreferrer`.
- [x] É possível editar a disponibilidade relacionada.
- [x] Ofertas inativas não aparecem na secção.

**Resultado:** Aprovado.

### T10 — Eliminação definitiva

- [x] O botão só ativa com o nome exato do provider.
- [x] O diálogo recebe foco automaticamente.
- [x] `Escape` fecha quando não existe operação em curso.
- [x] `Enter` confirma quando o nome está correto.
- [x] O diálogo não fecha durante a eliminação.
- [x] A oferta desaparece da lista e do PocketBase.

**Resultado:** Aprovado.

### T11 — Responsividade e acessibilidade

- [x] Filtros avançados recolhíveis em viewport estreito.
- [x] Diálogo sem sobreposições em desktop ou telemóvel.
- [x] Inputs associados a labels.
- [x] Botões possuem tipos explícitos.
- [x] Navegação por teclado validada.
- [x] Textos técnicos apresentados com labels legíveis.

**Resultado:** Aprovado.

## Defeitos encontrados e corrigidos

| ID | Gravidade | Descrição | Estado |
|---|---|---|---|
| `VOD-001` | Média | Duplicados sem país não eram detetados. | Corrigido |
| `VOD-002` | Baixa | Texto e símbolos VOD apresentavam codificação danificada. | Corrigido |
| `VOD-003` | Média | A lista carregava até 500 disponibilidades no frontend. | Corrigido com paginação no servidor |
| `VOD-004` | Baixa | Diálogo de eliminação ficava comprimido em viewport estreito. | Corrigido |
| `VOD-005` | Baixa | Bloco CSS dos filtros ficou duplicado durante instalação. | Corrigido e consolidado |

## Aprovação do marco

A gestão VOD cumpre os critérios funcionais definidos para `v0.2.0-alpha.1`.

**Decisão final:** Aprovado para marcar a versão como concluída.
