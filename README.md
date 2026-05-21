<div align="center" style="display: inline_block">

# Blincast Challenge


   <img align="center" alt="NestJS" height="30" width="40" src="https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/icons/nestjs/nestjs-original.svg">
   <img align="center" alt="Prisma ORM" height="30" width="40" src="https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/icons/prisma/prisma-original.svg">
   <img align="center" alt="PostgreSQL" height="30" width="40" src="https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/icons/postgresql/postgresql-original.svg">
   <img align="center" alt="Docker" height="30" width="40" src="https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/icons/docker/docker-original.svg">
</div>


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

## Rodando a aplicação com Docker

Certifique-se que o Postgres está rodando e acessível.

```bash
docker compose up -d db

docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@$(ip route | grep docker0 | awk '{print $9}'):5432/blincast?schema=public" \
  -e PORT=3000 \
  blincast:local
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

O workflow [`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml) faz build e push da imagem a cada push na branch `main`. Também é possível buildar via GitHub Actions

### Secrets no GitHub

Configure em **Settings → Secrets and variables → Actions**:

| Secret | Descrição |
|--------|-----------|
| `DOCKERHUB_USERNAME` | Usuário do Docker Hub |
| `DOCKERHUB_TOKEN` | Access Token do Docker Hub (recomendado em vez da senha) |

A imagem é publicada como `<DOCKERHUB_USERNAME>/blincast:latest` (e também com tag do commit SHA).

### Pull e execução com Postgres

```bash
docker pull samuelcsouza/blincast:latest
```

Com Postgres já rodando e acessível (ex.: `docker compose up -d db` neste repositório)

No Linux, use o comando abaixo:

```bash
# Obtém o IP da rede Docker
export IP=$(ip route | grep docker0 | awk '{print $9}')

docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@${IP}:5432/blincast?schema=public" \
  -e PORT=3000 \
  samuelcsouza/blincast:latest
```

### Compose usando a imagem do Hub

Para utilizar diretamente a imagem publicada no Docker Hub, use o arquivo `docker-compose.hub.yml`:

```bash
docker compose -f docker-compose.hub.yml up
```

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `PORT` | Porta HTTP (padrão: `3000`) |

Veja [.env.example](.env.example).
