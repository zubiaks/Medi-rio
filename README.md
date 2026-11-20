# Mediário

**A tua vida multimédia, organizada.**

O Mediário é uma aplicação pessoal para organizar e acompanhar filmes, séries, anime, livros, videojogos, música, podcasts, televisão, VOD e outros conteúdos multimédia.

O projeto utiliza um frontend moderno em Vue 3 e TypeScript, ligado a uma base PocketBase existente.

> **Estado:** `v0.2.0-alpha.1` — versão em desenvolvimento. Não recomendada para exposição pública sem autenticação e revisão das API Rules.

## Funcionalidades atuais

- catálogo de títulos;
- criação, detalhe e edição de títulos;
- relações com géneros, tags, idiomas, países, plataformas e companhias;
- poster, backdrop e logo por ficheiro local ou URL externa;
- redimensionamento de imagens antes do upload;
- lixeira, restauro e eliminação definitiva;
- disponibilidades VOD por título, provider, país, modalidade, qualidade e preço;
- podcasts e canais existentes lidos da base PocketBase;
- interface responsiva com modo claro e escuro;
- documentação de versões, colaboração, segurança e suporte.

## Stack

- Vue 3;
- TypeScript 5.9.2 em modo estrito;
- Vite;
- Vue Router;
- PocketBase JavaScript SDK;
- CSS próprio.

Nesta fase, o projeto não utiliza Pinia, Axios, Bootstrap ou bibliotecas visuais externas.

## Requisitos

- Node.js 22.12.0 ou superior;
- npm;
- PocketBase a executar em `http://127.0.0.1:8090`;
- Git, para desenvolvimento e contribuições.

## Estrutura principal

```text
Mediário/
├── pb_data/                 # base e uploads locais, fora do Git
├── pb_migrations/           # migrations versionadas
├── pb_public/               # frontend Vue
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── docs/
├── scripts/
├── LICENSE.md
├── LICENSE-TRANSITION.md
├── VERSIONS.md
└── README.md
```

## Instalação local

### 1. PocketBase

Na raiz do projeto:

```powershell
cd "D:\Mediário"
.\pocketbase.exe serve --http="127.0.0.1:8090"
```

O Dashboard fica disponível em:

```text
http://127.0.0.1:8090/_/
```

### 2. Frontend

Noutra janela do PowerShell:

```powershell
cd "D:\Mediário\pb_public"
Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm ci
npm audit
npm run type-check
npm run build
npm run dev
```

Abre:

```text
http://127.0.0.1:5173
```

Também podes utilizar o iniciador `.bat` incluído no projeto, quando disponível.

## Comandos npm

| Comando | Finalidade |
|---|---|
| `npm run dev` | inicia o Vite em `127.0.0.1` |
| `npm run type-check` | valida Vue e TypeScript sem gerar ficheiros |
| `npm run build` | executa o type-check e cria o build de produção |
| `npm run preview` | apresenta localmente o build de produção |
| `npm run check` | executa auditoria, type-check e build |
| `npm run audit:prod` | audita apenas dependências de produção |

## Princípios de arquitetura

- componentes Vue não consultam diretamente o PocketBase quando existe um repositório de domínio;
- parsers, validações e regras de negócio ficam em TypeScript puro;
- o PocketBase é isolado por uma camada de infraestrutura e repositórios;
- funcionalidades são organizadas por domínio;
- estados de carregamento, conteúdo vazio e erro devem ser tratados explicitamente;
- dependências npm estáveis são preferidas;
- versões beta, RC, nightly ou canary só são usadas quando existe vantagem concreta e documentada;
- `pb_data`, credenciais, executáveis, builds e `node_modules` não entram no Git.

## Compatibilidade TypeScript

O projeto fixa TypeScript em `5.9.2` por compatibilidade com a versão atual do `vue-tsc`.

Não atualizes para uma versão major de TypeScript sem criar uma branch de teste e executar:

```powershell
npm audit
npm run type-check
npm run build
```

## Segurança

Durante a estabilização, o Mediário deve ser executado apenas localmente:

```text
127.0.0.1
```

Antes de publicar online, é obrigatório rever:

- autenticação;
- API Rules do PocketBase;
- armazenamento de chaves de providers;
- HTTPS;
- CORS e CSP;
- backups e recuperação;
- política de privacidade, se forem recolhidos dados pessoais.

Consulta [SECURITY.md](SECURITY.md) para reportar vulnerabilidades.

## Contribuir

Consulta:

- [CONTRIBUTING.md](CONTRIBUTING.md);
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md);
- [SUPPORT.md](SUPPORT.md);
- [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md);
- [VERSIONS.md](VERSIONS.md).

O fluxo recomendado é:

```text
Issue → Branch → Commits → Push → Pull Request → Revisão → Merge → Release
```

## Autor

Desenvolvido por **Zubiaks**.

## Licença

O Mediário é software **source-available** distribuído sob a [PolyForm Noncommercial License 1.0.0](LICENSE.md).

É permitida a utilização, estudo, modificação e distribuição para fins pessoais e não comerciais, nos termos da licença.

A venda, revenda, disponibilização como serviço pago, integração num produto comercial ou outra utilização comercial exige autorização escrita e uma licença comercial separada de **Zubiaks**.

As versões anteriormente publicadas sob MIT mantêm os direitos concedidos pela licença aplicável à respetiva versão. Consulta [LICENSE-TRANSITION.md](LICENSE-TRANSITION.md).
