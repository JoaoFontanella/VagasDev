# SiteVagas

Aplicacao React com backend Express + SQLite para manter empresas e vagas salvas no servidor.

## Estrategia recomendada (publico + admin local)

- Publico (site no ar): somente leitura.
- Admin local (seu computador): cadastro/edicao/exclusao liberados com token.

Assim voce pode subir para o GitHub sem expor funcionalidade de escrita para visitantes.

## Configuracao de ambiente

1. Copie `.env.example` para `.env`.
2. Preencha um token forte em `ADMIN_TOKEN`.
3. Para seu uso local admin, deixe:

```env
VITE_ENABLE_ADMIN=true
VITE_ADMIN_TOKEN=mesmo_valor_do_ADMIN_TOKEN
```

4. No ambiente publico, mantenha:

```env
VITE_ENABLE_ADMIN=false
VITE_ADMIN_TOKEN=
```

Com isso, a interface publica nao mostra botoes de adicionar/editar/excluir.

## Como rodar em desenvolvimento

1. Instale dependencias:

```bash
npm install
```

2. Suba frontend e backend juntos:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:8787

## Como rodar em producao

1. Gere o build:

```bash
npm run build
```

2. Inicie o servidor:

```bash
npm run start
```

O backend servira o build e a API na mesma URL.

## Persistencia dos dados

- Dados de empresas e vagas sao salvos em `data/sitevagas.db`.
- Como os dados ficam no servidor, eles aparecem em qualquer navegador/dispositivo que acessar o site publicado no mesmo backend.
- Escrita no backend so funciona com header `x-admin-token` valido.
