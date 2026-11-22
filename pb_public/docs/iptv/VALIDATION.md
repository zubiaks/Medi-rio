# Validação final IPTV

```powershell
npm ci
npm run audit:prod
npm run type-check
npm run test:a11y
npm run test:iptv
npm test -- --run
npm run build
git diff --check
```

Testes manuais: ficheiro M3U, URL remota, reimportação, rollback, XMLTV, player/fallback, diagnóstico individual/lote, cinco vistas, seleção múltipla e ações em lote.
