# GuestOS

GuestOS is a Next.js resident guest management MVP.

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- ESLint
- Prettier

## Getting Started

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

Generate the Prisma client and run the initial migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

Build and run the app:

```bash
docker compose up --build
```
