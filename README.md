# SiteVagas

## Ingestao da Gupy

A ingestao roda no backend e grava as vagas no SQLite; o frontend nunca consulta a Gupy diretamente.

Para executar manualmente:

```bash
npm run ingest:gupy
```

Para habilitar o agendamento embutido no servidor, configure:

```env
GUPY_INGEST_ENABLED=true
GUPY_INTERVAL_HOURS=6
GUPY_CITY=Criciúma
GUPY_STATE=Santa Catarina
GUPY_MAX_PAGES=10
GUPY_EXPIRATION_RUNS=3
```

O endpoint administrativo `POST /api/admin/ingest/gupy` também permite disparar uma coleta usando o header `x-admin-token`. Respostas 403/429 interrompem a execução imediatamente; erros de rede e status 5xx usam até três tentativas com backoff exponencial.
