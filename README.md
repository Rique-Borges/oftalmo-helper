# Oftalmo Helper

>A small internal Next.js helper app for ophthalmology-related utilities (conversor, search, exports, and small admin tools).

## Overview

Oftalmo Helper is a collection of UI utilities and small admin tools built with Next.js + TypeScript. The project includes components and pages for converting point formats, searching records, copying clipboard helpers, managing simple clinical data, and exporting CSVs for financial workflows. It uses Supabase for data access and a shadcn-like UI component set.

## Tech stack

- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS
- Supabase (client included in `src/lib/supabase.ts`)
- shadcn + lucide-react icons + sonner for toasts

## Prerequisites

- Node.js 18+ (recommended 18 or 20)
- npm (or your preferred package manager)

## Getting started

1. Install dependencies

```bash
npm install
```

2. Create a local environment file

Copy `.env.local.example` (if present) or create `.env.local` in the project root and add environment variables required by `src/lib/supabase.ts`. Example variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# other keys you may need
```

3. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Available scripts

The `package.json` includes the following scripts:

- `dev` — starts Next.js in development mode (`next dev`)
- `build` — builds the production app (`next build`)
- `start` — starts the built production server (`next start`)
- `lint` — runs ESLint (`eslint`)

Use them via `npm run <script>`.

## Environment & Secrets

This project expects runtime environment variables in `.env.local` (do NOT commit this file). Common variables include Supabase keys used by `src/lib/supabase.ts`.

## Project structure (important files/folders)

- public/ — static assets
- src/app/ — Next.js app routes and pages
	- conversor-ponto/ — point converter UI
	- busca/ — search utilities
	- admin/ — admin pages
	- exames/ — example exam pages
- src/components/ — shared UI components and shadcn-style primitives
	- layout/ — `Sidebar.tsx`, `Topbar.tsx`
	- ui/ — buttons, inputs, dialogs, tables, etc.
- src/lib/ — helpers and Supabase client (`supabase.ts`, `utils.ts`)

## Key notes

- The app is built with server and client components (Next.js app directory). Be careful when importing browser-only APIs into server components.
- UI primitives follow a shadcn-style approach. Review `src/components/ui` for styling patterns.

## Contributing

Feel free to open issues or PRs if this repo is shared. If you plan to work on the project locally:

1. Create a feature branch
2. Make small, focused commits
3. Run the app locally and verify pages/components

## Troubleshooting

- If you get runtime Supabase errors verify `.env.local` keys and network access.
- If styles look broken, ensure Tailwind is installed and the dev server restarted after dependency changes.

## License

This project does not include an explicit license file. Add a `LICENSE` if you want to make the project open source.

---

If you'd like, I can also:

- add a simple `README` badge list (build, license)
- include a `.env.local.example` file with the minimal keys
- generate a short CONTRIBUTING.md template

Let me know which additions you want.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
