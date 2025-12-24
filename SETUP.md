# DeckHaven Setup Guide

This guide will help you set up the backend infrastructure for DeckHaven.

## Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database (sign up at https://neon.tech)
- A Stack-Auth account (sign up at https://stack-auth.com)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your database and Stack-Auth credentials

## Database Setup (Prisma + Neon)

1. Get your Neon connection string:
   - Sign up/login at https://neon.tech
   - Create a new project
   - Copy the connection string (it looks like: `postgresql://user:password@host:port/database?sslmode=require`)
   - Add it to your `.env` file as `DATABASE_URL`

2. Generate Prisma Client:
```bash
npm run db:generate
```

3. Push the schema to your database (for development):
```bash
npm run db:push
```

   Or create a migration (for production):
```bash
npm run db:migrate
```

4. (Optional) Open Prisma Studio to view your database:
```bash
npm run db:studio
```

## Stack-Auth Setup

1. Sign up/login at https://stack-auth.com
2. Create a new project
3. Get your credentials from the project dashboard:
   - Project ID
   - Publishable Client Key
   - Secret Key
4. Add them to your `.env` file:
   - `STACK_PROJECT_ID`
   - `STACK_PUBLISHABLE_CLIENT_KEY`
   - `STACK_SECRET_KEY`

## API Routes

The following API routes are available:

- `GET /api/scryfall/cards?setCode=xxx&page=1` - Get cards by set code
- `GET /api/scryfall/cards/random` - Get a random card
- `GET /api/scryfall/sets` - Get all sets

## Next Steps

1. Set up authentication pages (sign in/sign up) using Stack-Auth
2. Create API routes for collection management
3. Connect the frontend to these API routes

## Notes

- The database schema is defined in `prisma/schema.prisma`
- Prisma client is initialized in `lib/prisma.ts`
- Stack-Auth is configured in `lib/stack.ts`
- Scryfall API functions are in `app/lib/scryfall.ts`

