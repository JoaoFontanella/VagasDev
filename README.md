# 💼 VagasDev

Agregador de vagas com coleta automática da **Gupy** e organização por fonte, focado em Criciúma – SC.

## Fontes

- **Vagas**: visão geral com todas as oportunidades cadastradas.
- **Gupy**: vagas coletadas pelo endpoint público de busca da Gupy.
- **Acic**: vagas da [Rede de Talentos da ACIC](https://www.rededetalentos.com.br/vagas?order=&cidades%5B%5D=54860&keyword=), identificadas no banco pela origem `acic`.

Todas as abas usam os mesmos filtros de palavra-chave, modalidade, área e data.

🔗 **Demo:** [vagasdev.vercel.app](https://vagasdev.vercel.app/)

**Stack:** React 19 · Vite · Express 5 · Supabase

## 👨‍💻 Autor

**João Victor Macan Fontanella** · [GitHub](https://github.com/JoaoFontanella) · [LinkedIn](https://linkedin.com/in/joão-victor-macan-fontanella)

## Coleta ACIC

A coleta percorre a listagem de Criciúma e as páginas de detalhe para extrair cargo,
data original, localização, descrição, modalidade e tipo de contrato. Quando o
anunciante não é divulgado, a empresa aparece como “Empresa não informada (ACIC)”.
Os links levam à página oficial da vaga, onde a candidatura é feita.

- Executar: `npm run ingest:acic`.
- Verificar sem salvar no banco: `npm run ingest:acic -- --dry-run`.
- Acionar pelo servidor: `POST /api/admin/ingest/acic`, com `x-admin-token`.
- Agendamento: habilitado por padrão ao iniciar a API; `ACIC_INGEST_ENABLED=false` desliga.
- Configuração opcional: `ACIC_CITY_ID=54860`, `ACIC_INTERVAL_HOURS=6`,
  `ACIC_MAX_PAGES=100`, `ACIC_REQUEST_DELAY_MS=250`, `ACIC_EXPIRATION_RUNS=3`.
- Usa as mesmas credenciais Supabase e a retenção `JOB_RETENTION_MONTHS` da Gupy.
- Não altera vagas de outras fontes. Coletas incompletas não expiram vagas ausentes;
  erros de rede ou detalhes interrompem a coleta antes de salvar.
- Verificação: `npm test`, `npm run lint` e `npm run build`.

Para publicar a integração, envie o código atualizado ao backend hospedado e
reinicie o serviço. O build do frontend sozinho não executa a coleta.
