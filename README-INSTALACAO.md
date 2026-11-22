# ZIP 1 — Fases 6O e 6P

## Instalação

Extrair sobre `D:\Mediário` e confirmar a integração dos ficheiros.

## Fase 6O

Adiciona `tmdb_operational_settings` em `app_settings`, sem migração de esquema. O registo é criado ao guardar pela primeira vez.

Valores recomendados:

- antiguidade: 90 dias;
- tarefa bloqueada: 30 minutos;
- lote predefinido: 10;
- lote máximo: 25;
- créditos: 50;
- imagens: 40;
- pedidos por minuto: 30;
- execução global: 25;
- repetições: 3;
- idioma principal: pt-PT;
- idioma alternativo: en.

## Fase 6P

Inclui teste de encerramento, checklist funcional e documentação de segurança. A suite completa deve ser executada localmente porque o ZIP contém apenas os ficheiros alterados do projeto, não `node_modules` nem toda a aplicação.
