# DeckHaven

A card collection and deck management web app for trading card games. Track your Magic: The Gathering cards, build and manage decks, organize cards in binders, and maintain a wishlist. DeckHaven uses the [Scryfall API](https://scryfall.com/docs/api) for MTG card data and is built for future support of Pokémon and Yu-Gi-Oh!.

## Features

- **Collection** – Add cards with quantity, condition, language, foil, tags, and notes. Filter and sort by set, tag, and game.
- **Decks** – Create and edit decks with format rules (Commander, Standard, etc.), deck box colors, and commander support.
- **Binders** – Organize cards in virtual binders with configurable page layouts (e.g. 3×3, 4×4) and colors.
- **Wishlist** – Save cards you want to acquire and see wishlist status across sets and search.
- **Sets** – Browse cards by set, see owned counts, add to collection or decks from set pages.
- **Search** – Global search (navbar) for Scryfall cards; add results to collection or wishlist.
- **Themes** – Multiple base themes and accent colors with persistence in the browser.
- **Auth** – Sign in/sign up and protected routes via [Stack Auth](https://stack-auth.com).

## Tech Stack

- **Frontend:** [Next.js](https://nextjs.org) (App Router), [React](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS](https://tailwindcss.com)
- **Backend:** Next.js API routes, [Prisma](https://www.prisma.io) ORM, [PostgreSQL](https://www.postgresql.org)
- **Auth:** [Stack Auth](https://stack-auth.com)
- **Card data:** [Scryfall API](https://scryfall.com/docs/api)

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or local)
- **Stack Auth** project ([stack-auth.com](https://stack-auth.com))

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd deckhaven
npm install
```

### 2. Environment variables

Create a `.env` file in the project root with:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. from Neon or Supabase). |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Yes | Stack Auth project ID (public). |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Yes | Stack Auth publishable client key (public). |
| `STACK_SECRET_SERVER_KEY` | Yes | Stack Auth secret server key (server-only). |
| `NEXT_PUBLIC_BASE_URL` | No | Base URL for auth callbacks (default: `http://localhost:3000`). Use your production URL when deploying. |

Optional fallbacks used in some API routes: `STACK_PROJECT_ID` (if not using `NEXT_PUBLIC_`), `STACK_PROJECT_ID` for server-side calls.

### 3. Database

Generate the Prisma client and push the schema (development):

```bash
npm run db:generate
npm run db:push
```

For production, use migrations instead:

```bash
npm run db:migrate
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up or sign in to access the dashboard, collection, decks, binders, wishlist, and sets.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Build for production. |
| `npm run start` | Start the production server (run after `build`). |
| `npm run lint` | Run ESLint. |
| `npm run audit:a11y` | Print instructions for running Lighthouse accessibility audit. |
| `npm run db:generate` | Generate Prisma Client. |
| `npm run db:push` | Push Prisma schema to the database (dev). |
| `npm run db:migrate` | Run Prisma migrations (recommended for production). |
| `npm run db:studio` | Open Prisma Studio to inspect the database. |

## Project structure (high level)

- **`app/`** – Next.js App Router: pages, API routes, components, layout, and shared lib (Prisma, Scryfall, Stack, themes).
- **`prisma/`** – Schema and migrations. Main models: `User`, `Collection`, `Wishlist`, `Deck`, `DeckCard`, `Binder`, `BinderCard`, `TrackedSet`, `UserSettings`.
- **`stack/`** – Stack Auth client and server setup.
- **`public/`** – Static assets.

For detailed backend setup (Neon, Stack Auth dashboard steps), see **[SETUP.md](./SETUP.md)**. For accessibility features and audit instructions, see **[ACCESSIBILITY.md](./ACCESSIBILITY.md)**.

## License

Private / portfolio project.
