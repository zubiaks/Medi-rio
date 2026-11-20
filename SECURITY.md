# Política de Segurança

## Versões suportadas

O Mediário encontra-se em desenvolvimento alpha. Apenas a versão mais recente da branch `main` recebe correções de segurança.

| Versão | Suportada |
|---|---|
| `main` / alpha mais recente | Sim |
| versões alpha anteriores | Não |
| projeto legacy | Apenas correções críticas, quando possível |

## Reportar uma vulnerabilidade

Não cries uma Issue pública para:

- credenciais expostas;
- bypass de autenticação;
- acesso não autorizado ao PocketBase;
- fuga de dados pessoais;
- execução de código;
- path traversal;
- upload inseguro;
- dependências comprometidas.

Usa **GitHub Private Vulnerability Reporting** ou um **Security Advisory** privado do repositório. Inclui:

1. versão ou commit afetado;
2. passos mínimos para reproduzir;
3. impacto esperado;
4. prova de conceito sem dados reais;
5. proposta de mitigação, se existir.

## Segredos e dados

Nunca devem entrar no Git:

```text
pb_data/
.credentials.xml
.env
API keys
backups reais
pocketbase.exe
uploads pessoais
```

Se um segredo for publicado, remove o acesso ou roda a credencial imediatamente. Apagar apenas o ficheiro do último commit não remove o segredo do histórico.

## Âmbito atual

A aplicação está configurada para desenvolvimento local em `127.0.0.1`. A publicação online exige autenticação, revisão das API Rules, HTTPS, política CORS/CSP e proteção das chaves dos providers.
