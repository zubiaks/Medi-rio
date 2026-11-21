# Atualizar StreamRecord

Acrescentar a `StreamRecord` os campos opcionais do schema:

```ts
external_id?: string;
url_pagina?: string;
pais?: string;
idiomas?: string[];
categoria?: string;
tags?: string[];
favorito?: boolean;
adulto?: boolean;
adulto_motivos?: unknown;
ordem?: number;
playlist_origem?: string;
notas?: string;
ultimo_teste_em?: string;
ultimo_estado?: string;
ultimo_erro?: string;
metadata_extra?: unknown;
ultima_sincronizacao?: string;
```
