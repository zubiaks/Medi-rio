# Changelog

Todas as alterações relevantes do **Mediário** são documentadas neste ficheiro.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-PT/1.1.0/) e o projeto utiliza [Semantic Versioning](https://semver.org/).

## [0.2.0-alpha.1] — 2026-11-20

### Adicionado

- gestão completa de disponibilidades VOD;
- criação e edição de ofertas;
- pesquisa assíncrona de títulos;
- paginação no PocketBase;
- filtros por texto, país, modalidade, qualidade, estado e subscrição;
- ativação, desativação e reativação;
- deteção de ofertas expiradas;
- deteção de duplicados com e sem país;
- secção `Onde ver` no detalhe dos títulos;
- eliminação definitiva com confirmação forte;
- relatório de testes VOD;
- documentação de contribuição, segurança e suporte;
- avisos de copyright no código.

### Alterado

- valores técnicos de modalidade e qualidade passam a ter nomes legíveis;
- filtros passam a ser executados no servidor;
- filtros e página passam a ser preservados na URL;
- formulário VOD deixa de carregar todo o catálogo ao abrir;
- diálogo de eliminação passa a ser responsivo e acessível;
- licença alterada de MIT para PolyForm Noncommercial License 1.0.0 para as versões futuras;
- `package.json` atualizado para `0.2.0-alpha.1`.

### Corrigido

- duplicados sem país;
- textos com codificação danificada;
- carregamento excessivo de disponibilidades;
- tratamento de erros ao ativar, desativar ou eliminar;
- sobreposição dos botões no diálogo;
- estilos duplicados dos filtros;
- datas HTML e TMDB ID no catálogo.

### Segurança

- `pb_data`, credenciais, backups e executável PocketBase removidos do controlo de versões;
- licença e transição documentadas;
- utilização comercial passa a exigir autorização escrita de Zubiaks.

### Validação

- `npm audit`: 0 vulnerabilidades;
- `npm run type-check`: aprovado;
- `npm run build`: aprovado;
- testes manuais do catálogo e VOD: aprovados;
- consola sem erros gerados pela aplicação.

## [0.1.0-alpha.3] — 2026-11-20

### Adicionado

- edição de títulos;
- relações múltiplas pesquisáveis;
- poster, backdrop e logo por ficheiro ou URL;
- redimensionamento de imagens;
- lixeira, restauro e eliminação definitiva.

## [0.1.0-alpha.2] — 2026-11-19

### Adicionado

- criação de títulos;
- lookups do catálogo;
- validação e mapeamento PocketBase;
- página de detalhe de títulos.

## [0.1.0-alpha.1] — 2026-11-19

### Adicionado

- fundação Vue 3 + TypeScript;
- Vite e Vue Router;
- cliente e repositórios PocketBase;
- layout, navegação e temas;
- páginas iniciais do Mediário.

[0.2.0-alpha.1]: https://github.com/zubiaks/Medi-rio/releases/tag/v0.2.0-alpha.1
[0.1.0-alpha.3]: https://github.com/zubiaks/Medi-rio/compare/v0.1.0-alpha.2...v0.1.0-alpha.3
[0.1.0-alpha.2]: https://github.com/zubiaks/Medi-rio/compare/v0.1.0-alpha.1...v0.1.0-alpha.2
[0.1.0-alpha.1]: https://github.com/zubiaks/Medi-rio/releases/tag/v0.1.0-alpha.1
