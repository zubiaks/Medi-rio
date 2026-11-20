# Versões do Mediário

Histórico e plano de versões, ordenado da versão mais recente para a mais antiga.

> Abrir cada secção para consultar objetivos, funcionalidades e validações.

## Estado atual

| Versão | Marco | Estado |
|---|---|---|
| `v1.0.0` | Primeira versão estável | Planeado |
| `v0.9.0-rc.1` | Candidato estável | Planeado |
| `v0.7.0-beta.1` | Providers e manutenção | Planeado |
| `v0.6.0-beta.1` | Diário e reviews | Planeado |
| `v0.5.0-alpha.1` | Biblioteca física | Planeado |
| `v0.4.0-alpha.1` | TV e streams | Planeado |
| `v0.3.0-alpha.1` | Podcasts | Planeado |
| `v0.2.0-alpha.1` | Fundação VOD | **Em desenvolvimento** |
| `v0.1.0-alpha.3` | Catálogo editável e imagens | Concluído |
| `v0.1.0-alpha.2` | Fundação do catálogo | Concluído |
| `v0.1.0-alpha.1` | Fundação Vue | Concluído |

<details open>
<summary><strong>v0.2.0-alpha.1 — Fundação VOD</strong> · Em desenvolvimento</summary>

### Representa

Primeira implementação do domínio VOD, usando a coleção `disponibilidades` para relacionar títulos com providers e condições de acesso.

### Implementado

- listagem de disponibilidades ativas;
- criação e edição;
- relação com títulos e países;
- provider;
- modalidade;
- URL;
- qualidade normalizada;
- preço e moeda;
- indicação de inclusão na subscrição;
- datas de início e fim;
- estado ativo;
- validação de URL, preço, moeda e datas;
- aviso ao abandonar alterações não guardadas;
- rotas e ligações no menu.

### Valores de qualidade aceites

```text
desconhecida
sd
hd
fhd
4k
8k
audio
```

### Validado

- criação de disponibilidade;
- edição de disponibilidade;
- qualidade `fhd` aceite pelo PocketBase;
- navegação entre listagem, criação e edição.

### Falta concluir

- desativar e eliminar disponibilidades pela interface;
- mostrar ofertas inativas;
- filtros por título, provider, país, modalidade e qualidade;
- impedir duplicados;
- disponibilidades dentro do detalhe do título;
- testes automáticos.

</details>

<details>
<summary><strong>v0.1.0-alpha.3 — Catálogo editável e imagens</strong> · Concluído</summary>

### Implementado

- edição completa de títulos;
- formulário partilhado entre criação e edição;
- limpeza de campos e relações antigas;
- relações múltiplas com pesquisa, checkboxes e chips;
- poster, backdrop e logo por ficheiro local;
- poster, backdrop e logo por URL externa;
- prioridade de ficheiro local sobre URL externa;
- redimensionamento antes do upload;
- poster no catálogo;
- poster, backdrop e logo no detalhe;
- lixeira lógica;
- motivo e data de eliminação;
- restauro;
- eliminação definitiva com confirmação pelo nome;
- aviso de alterações não guardadas.

### Regras de imagem

| Campo | Dimensão máxima | Limite |
|---|---:|---:|
| Poster | `1200 × 1800` | 5 MiB |
| Backdrop | `1920 × 1080` | 5 MiB |
| Logo | `1600 × 600` | 2 MiB |

### Validado

- edição e limpeza de campos;
- relações múltiplas;
- URLs externas;
- uploads locais;
- lixeira, restauro e eliminação definitiva;
- TMDB ID opcional sem valor `0` inválido.

</details>

<details>
<summary><strong>v0.1.0-alpha.2 — Fundação do catálogo</strong> · Concluído</summary>

### Implementado

- lookups centralizados;
- criação de títulos;
- validação;
- mapeamento entre domínio e PocketBase;
- detalhe do título;
- expansão de relações;
- mensagens de sucesso e erro.

</details>

<details>
<summary><strong>v0.1.0-alpha.1 — Fundação Vue</strong> · Concluído</summary>

### Implementado

- Vue 3;
- TypeScript;
- Vite;
- Vue Router;
- SDK PocketBase;
- CSS próprio;
- componentes-base;
- navegação responsiva;
- temas;
- repositórios;
- páginas iniciais;
- arranque local no Windows.

### Validação

- `npm audit` sem vulnerabilidades na validação inicial;
- `npm run type-check` aprovado;
- `npm run build` aprovado;
- podcasts e canais existentes carregados da base real.

</details>

<details>
<summary><strong>v0.3.0-alpha.1 — Podcasts</strong> · Planeado</summary>

- parser RSS em TypeScript puro;
- namespaces iTunes e Media RSS;
- sincronização e deduplicação;
- episódios;
- player e progresso;
- paginação para feeds grandes;
- fixtures e testes.

</details>

<details>
<summary><strong>v0.4.0-alpha.1 — TV e streams</strong> · Planeado</summary>

- importação M3U;
- canais e `stream_links`;
- vários protocolos;
- prioridade e fallback;
- referrer e user agent;
- monitorização;
- player integrado.

</details>

<details>
<summary><strong>v0.5.0-alpha.1 — Biblioteca física</strong> · Planeado</summary>

- exemplares;
- formatos e edições;
- códigos de barras;
- localização e estado físico;
- empréstimos, renovações e devoluções.

</details>

<details>
<summary><strong>v0.6.0-beta.1 — Diário e reviews</strong> · Planeado</summary>

- visualizações;
- progresso;
- revisualizações;
- diário;
- avaliações e reviews;
- estatísticas pessoais.

</details>

<details>
<summary><strong>v0.7.0-beta.1 — Providers e manutenção</strong> · Planeado</summary>

- saúde dos providers;
- jobs de sincronização;
- fontes externas;
- importações;
- duplicados e órfãos;
- auditoria;
- backup e restauro.

</details>

<details>
<summary><strong>v0.9.0-rc.1 — Candidato estável</strong> · Planeado</summary>

- funcionalidades principais integradas;
- testes unitários, integração e E2E;
- documentação completa;
- zero erros inesperados;
- migrations reproduzíveis;
- rollback documentado.

</details>

<details>
<summary><strong>v1.0.0 — Primeira versão estável</strong> · Planeado</summary>

- autenticação;
- API Rules;
- segredos fora do frontend;
- HTTPS;
- CORS e CSP;
- backups automáticos;
- recuperação testada;
- acessibilidade e instalação reproduzível.

</details>

## Regras de atualização

Cada alteração de versão deve atualizar:

1. `package.json`;
2. `VERSIONS.md`;
3. `CHANGELOG.md`;
4. documentação da funcionalidade;
5. tag e Release no GitHub, quando aplicável.

## Histórico resumido

| Versão | Marco |
|---|---|
| `v0.2.0-alpha.1` | Fundação VOD |
| `v0.1.0-alpha.3` | Catálogo editável, imagens e lixeira |
| `v0.1.0-alpha.2` | Criação e detalhe do catálogo |
| `v0.1.0-alpha.1` | Fundação Vue 3 + TypeScript |
