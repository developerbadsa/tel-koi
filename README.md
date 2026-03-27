# PetrolKoiLal

Community petrol/diesel station tracker for Lalmonirhat built with Next.js App Router, TypeScript, Tailwind CSS, MongoDB Atlas, and Mongoose.

## Features
- Anonymous voting with hashed voter key (`sha256(IP + userAgent + salt)`), no raw IP storage
- Public station submission with anti-spam submission limit
- List/Map/Trending home sections
- Station details with recent reports and confidence score
- SEO metadata, OpenGraph, JSON-LD, robots, sitemap
- Optional daily reset endpoint + script

## 1) MongoDB Atlas setup
1. Create Atlas project and cluster.
2. Create database user with read/write permissions.
3. In Network Access, whitelist your IP (or `0.0.0.0/0` for testing only).
4. Copy connection string and set `MONGODB_URI`.

## 2) Local run
```bash
cp .env.example .env.local
npm install
npm run dev
```
Open `http://localhost:3000`.

## 3) Deploy to Vercel
1. Push repo to GitHub.
2. Import project in Vercel.
3. Set environment variables from `.env.example`.
4. Deploy.

## 4) Optional cron reset at 9PM Asia/Dhaka
- Endpoint: `POST /api/admin/run-daily-reset` with `Authorization: Bearer <ADMIN_TOKEN>`
- Script command:
```bash
npm run reset:daily
```
- In cron provider, schedule at 9PM Asia/Dhaka and run a secure POST request.

## API Summary
- `GET /api/stations?query=&area=&limit=&page=`
- `GET /api/stations/[id]`
- `POST /api/stations`
- `POST /api/stations/[id]/vote`
- `GET /api/trending?hours=6`
- `POST /api/admin/run-daily-reset`
