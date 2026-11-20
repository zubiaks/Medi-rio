# Duplicados em VodCreateView / VodEditView

Antes de `create` ou `update`:

```ts
import { findVodDuplicate } from "@/domain/vod/checkDuplicate";

const duplicate = await findVodDuplicate(form, idOpcional);
if (duplicate && !window.confirm(`Já existe uma oferta semelhante de ${duplicate.provider_nome}. Guardar mesmo assim?`)) return;
```

Na criação, omitir o segundo argumento. Na edição, passar o `id` atual.
