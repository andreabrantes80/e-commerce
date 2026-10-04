# GJ Tech Sistemas — E-commerce Starter

Base inicial para um e-commerce com:

- Next.js 16 + TypeScript + Tailwind CSS no frontend
- Node.js + Fastify 5 + TypeScript no backend
- Prisma ORM 7 + PostgreSQL
- PostgreSQL local via Docker Compose
- API REST inicial (`/health`, `/api/products`)
- Modelo de catálogo, estoque, carrinho, pedidos, usuários e endereços

## Requisitos

- Node.js 24 LTS recomendado
- npm 11+
- Docker Desktop
- Git

## Estrutura

```text
frontend/   Next.js
backend/    Fastify + Prisma
```

## 1. Banco local

Na raiz do projeto:

```bash
docker compose up -d db
```

O PostgreSQL ficará em `localhost:5432`.

## 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run prisma:generate
npm run dev
```

API: `http://localhost:3333`

Teste: `http://localhost:3333/health`

## 3. Frontend

Em outro terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Loja: `http://localhost:3000`

## Variáveis

Backend:

```env
DATABASE_URL="postgresql://gjtech:gjtdev@localhost:5432/gjtech_ecommerce?schema=public"
PORT=3333
HOST=0.0.0.0
FRONTEND_URL="http://localhost:3000"
```

Frontend:

```env
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

## Próximas etapas

1. Autenticação e painel administrativo
2. CRUD de produtos/categorias
3. Upload de imagens
4. Carrinho persistente
5. Checkout
6. Mercado Pago (PIX/cartão) via backend
7. Webhooks de pagamento
8. Frete/Correios ou Melhor Envio
9. SEO, sitemap e Search Console
10. Deploy Vercel + Render + PostgreSQL gerenciado

> Nunca coloque segredos de pagamento ou `DATABASE_URL` no frontend.
