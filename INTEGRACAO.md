# Mediário — Fase 5: enriquecimento TMDB controlado

O ZIP está preparado para ser extraído sobre `D:\Mediário`, preservando os restantes ficheiros.

Inclui:
- diálogo TMDB completo com comparação antes da aplicação;
- seleção automática apenas de campos vazios;
- seleção manual de diferenças;
- atualização de `titulos` apenas nos campos escolhidos;
- atualização ou criação de `fontes_externas`;
- escrita segura em `audit_log`;
- campos técnicos de sincronização;
- correção das URLs TMDB contaminadas por HTML;
- testes puros focados;
- CSS próprio da Fase 5 carregado em `main.ts`.

Não cria automaticamente relações para géneros, idiomas, países, companhias ou pessoas.
