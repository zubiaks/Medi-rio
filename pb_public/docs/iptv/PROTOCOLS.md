# Matriz de protocolos

| Tipo | Browser direto | Diagnóstico browser | Backend local |
|---|---:|---:|---:|
| HTTP vídeo | Sim | Sim, sujeito a CORS | Opcional |
| HLS | Nativo apenas em browsers compatíveis | Sim, sujeito a CORS | Recomendado para compatibilidade |
| MPEG-DASH | Não sem biblioteca | Parcial | Recomendado |
| Áudio HTTP | Sim | Sim | Opcional |
| RTMP | Não | Não | Obrigatório |
| RTSP | Não | Não | Obrigatório |
| UDP/RTP | Não | Não | Obrigatório |
| Referrer/User-Agent personalizado | Não de forma segura | Não | Obrigatório |
