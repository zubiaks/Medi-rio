# Instalação — Gestão VOD

1. Copiar `src` e `docs` para a raiz do frontend, aceitando substituições.
2. Em `src/main.ts`, adicionar:
   `import "@/styles/vod-management.css";`
3. Em `TitleDetailView.vue`, importar e inserir:
   `import TitleAvailabilityList from "@/components/vod/TitleAvailabilityList.vue";`
   e dentro do detalhe: `<TitleAvailabilityList :title-id="record.id" />`.
4. Para deteção de duplicados, chamar `findVodDuplicate(form, idOpcional)` antes de create/update e pedir confirmação se houver resultado.
5. Executar `npm run type-check` e `npm run build`.
