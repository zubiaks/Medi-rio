# Arquitetura IPTV

- `canais_tv`: entidade apresentada ao utilizador.
- `stream_links`: fontes alternativas relacionadas por `canal_tv`.
- `categorias_tv`: categorias IPTV.
- M3U: parser, planeamento, modos, histórico e reimportação segura.
- XMLTV: programação guardada localmente em `mediario-iptv-epg`; apenas `epg_id` é persistido no canal.
- Diagnóstico direto: HTTP/HTTPS sem cabeçalhos especiais. RTMP, RTSP, UDP, Referrer e User-Agent exigem backend local.
