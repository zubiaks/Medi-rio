# Gestão VOD

## Estado

**Concluído em `v0.2.0-alpha.1`.**

A área VOD regista onde cada título está disponível e utiliza a coleção PocketBase `disponibilidades`.

## Rotas

| Rota | Função |
|---|---|
| `#/vod` | Listagem, pesquisa, filtros e gestão |
| `#/vod/novo` | Criação de disponibilidade |
| `#/vod/:id/editar` | Edição de disponibilidade |

## Dados

Cada disponibilidade pode conter:

- título relacionado;
- provider;
- modalidade;
- URL externa;
- país;
- qualidade;
- preço e moeda;
- inclusão na subscrição;
- data de início e fim;
- estado ativo.

## Modalidades

```text
streaming
aluguer
compra
gratuito
broadcast
biblioteca
fisico
outro
```

A interface apresenta nomes legíveis, por exemplo `broadcast` como **Emissão** e `fisico` como **Físico**.

## Qualidades

```text
desconhecida
sd
hd
fhd
4k
8k
audio
```

A interface apresenta `fhd` como **Full HD** e `audio` como **Áudio**.

## Pesquisa de títulos

O formulário não carrega todo o catálogo:

- pesquisa após 2 caracteres;
- debounce de 300 ms;
- máximo de 20 resultados;
- pesquisa por título, título original e ano;
- durante a edição, carrega apenas o título relacionado.

## Duplicados

Uma oferta é considerada semelhante quando possui:

```text
mesmo título
+ mesmo provider
+ mesma modalidade
+ mesmo país
```

A comparação do provider ignora maiúsculas, espaços exteriores e acentos. O país vazio é tratado como `Global / não definido`.

O sistema apresenta um aviso, mas permite continuar conscientemente.

## Listagem e filtros

A listagem usa paginação do PocketBase com 24 ofertas por página. Os filtros são executados no servidor:

- título ou provider;
- país;
- modalidade;
- qualidade;
- ativas, inativas, todas ou expiradas;
- incluídas ou não incluídas na subscrição.

Os parâmetros ficam na URL para permitir recarregar ou partilhar a vista filtrada.

## Ações

- abrir o título;
- abrir a página do provider;
- editar;
- ativar;
- desativar;
- eliminar definitivamente.

A eliminação exige o nome exato do provider. O diálogo suporta foco automático, `Escape`, confirmação com `Enter`, bloqueio durante a operação e devolução do foco.

## Integração no catálogo

O detalhe do título apresenta a secção **Onde ver** com as ofertas ativas, incluindo provider, modalidade, qualidade, preço e ações.

## Validação

- `npm audit`: 0 vulnerabilidades;
- `npm run type-check`: aprovado;
- `npm run build`: aprovado;
- criação e edição: aprovadas;
- filtros e paginação: aprovados;
- duplicados com e sem país: aprovados;
- ativação e reativação: aprovadas;
- eliminação definitiva: aprovada;
- responsividade e consola: aprovadas.

## Trabalho futuro

- testes Vitest e Playwright;
- verificação periódica das URLs;
- histórico de preços;
- normalização de providers numa coleção própria;
- alertas de entrada e saída de catálogo.
