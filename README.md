# Petrol Koi Lalmonirhat

Community-driven petrol, diesel, and octane station tracker for Lalmonirhat built with Next.js App Router, TypeScript, Tailwind CSS, MongoDB Atlas, and Mongoose.

## Features
- Community voting per station
- Public station submission with daily rate limit
- List, map, and trending views
- Station detail pages with recent reports
- SEO metadata, robots, and sitemap
- Optional daily reset endpoint and script

## Local setup
1. Install dependencies:
```bash
npm install
```
2. Copy `env.example` to `.env.local` if needed, or use the prepared `.env.local`.
3. Start the dev server:
```bash
npm run dev
```

## Environment variables
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `VOTER_HASH_SALT`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DEFAULT_DISTRICT`
- `DAILY_STATION_ADD_LIMIT`
- `ADMIN_TOKEN`

## Useful commands
- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run reset:daily`
