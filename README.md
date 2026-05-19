# Blincast Challenge — Document API

API HTTP NestJS que expõe `/document` para criar, atualizar, deletar e consultar pares chave-valor no PostgreSQL.

Especificação completa: [docs/challenge-senior.md](docs/challenge-senior.md).

## Pré-requisitos

- Node.js 22+
- [pnpm](https://pnpm.io/)
- Docker e Docker Compose (para Postgres e/ou execução containerizada)

## Build local (sem Docker)

```bash
pnpm install
cp .env.example .env
docker compose up -d db
pnpm prisma:migrate
pnpm prisma:generate
pnpm start:dev
```

Build de produção e execução:

```bash
pnpm build
pnpm start:prod
```

A API fica em `http://localhost:3000`.

## Build da imagem Docker

```bash
docker build -t blincast:local .
```

## Subir aplicação + Postgres com Docker Compose

Sobe Postgres e a API; na primeira execução o container da aplicação aplica as migrações Prisma automaticamente.

```bash
docker compose up --build
```

Exemplo de uso:

```bash
curl -s -X POST http://localhost:3000/document \
  -H 'Content-Type: application/json' \
  -d '{"action":"create","key":"foo","value":"bar"}'

curl -s http://localhost:3000/document/foo
```

## Imagem publicada no Docker Hub

O workflow [`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml) faz build e push da imagem a cada push na branch `main`.

### Secrets no GitHub

Configure em **Settings → Secrets and variables → Actions**:

| Secret | Descrição |
|--------|-----------|
| `DOCKERHUB_USERNAME` | Usuário do Docker Hub |
| `DOCKERHUB_TOKEN` | Access Token do Docker Hub (recomendado em vez da senha) |

A imagem é publicada como `<DOCKERHUB_USERNAME>/blincast:latest` (e também com tag do commit SHA).

### Pull e execução com Postgres

```bash
export DOCKERHUB_USERNAME=seu-usuario
docker pull ${DOCKERHUB_USERNAME}/blincast:latest
```

Com Postgres já rodando e acessível (ex.: `docker compose up -d db` neste repositório):

```bash
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/blincast?schema=public" \
  -e PORT=3000 \
  ${DOCKERHUB_USERNAME}/blincast:latest
```

No Linux, troque `host.docker.internal` pelo IP do host ou use a rede do Compose abaixo.

### Compose usando a imagem do Hub

Crie um `docker-compose.hub.yml` (ou ajuste o serviço `app` no compose) para usar a imagem publicada em vez do build local:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: blincast
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d blincast"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    image: ${DOCKERHUB_USERNAME}/blincast:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/blincast?schema=public
      PORT: "3000"
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
```

```bash
export DOCKERHUB_USERNAME=seu-usuario
docker compose -f docker-compose.hub.yml up
```

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `PORT` | Porta HTTP (padrão: `3000`) |

Veja [.env.example](.env.example).
