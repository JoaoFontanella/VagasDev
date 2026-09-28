# SiteVagas

## Ingestao da Gupy

A ingestao roda no backend e grava as vagas no Supabase; o frontend nunca consulta a Gupy diretamente.

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
GUPY_PAGE_LIMIT=12
GUPY_MAX_PAGES=20
GUPY_EXPIRATION_RUNS=3
JOB_RETENTION_MONTHS=2
```

O servidor executa uma coleta imediatamente ao iniciar e repete no intervalo configurado. O endpoint administrativo `POST /api/admin/ingest/gupy` também permite disparar uma coleta usando o header `x-admin-token`.

A paginação usa `pagination.total` da Gupy, com `GUPY_MAX_PAGES` como limite de segurança. Respostas 403/429 interrompem a execução imediatamente; erros de rede e status 5xx usam até três tentativas com backoff exponencial.

Por padrão, o site mantém o mês atual e o mês anterior (`JOB_RETENTION_MONTHS=2`). Vagas mais antigas são marcadas como expiradas no Supabase, não são apagadas fisicamente, e deixam de aparecer em `GET /api/vacancies`.
