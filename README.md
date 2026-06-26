# Movie/TV Show Tracker with TanStack Start and MongoDB

A small full-stack app for tracking the TV shows you are watching. Search for
a show, add it to your list, and log episodes as you go. Show metadata comes
from [TMDB](https://www.themoviedb.org/), and your list lives in MongoDB.

Built with TanStack Start, the official MongoDB Node.js driver, Zod, and
TypeScript. There are no separate API routes. Every database read and write
goes through a TanStack Start server function.

## Prerequisites

- Node.js 18+ installed (npm is included by default)
- A MongoDB Atlas account or a local MongoDB server
- A free TMDB account, which gives you an API token

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from the example and fill in your values:

   ```bash
   cp .env.example .env
   ```

   ```
   MONGODB_URI=your-mongodb-connection-string
   TMDB_READ_ACCESS_TOKEN=your-tmdb-read-access-token
   ```

   - MongoDB connection string: Go to [Atlas](https://cloud.mongodb.com/) -> Connect -> Drivers -> Node.js.
   - TMDB token: Go to [](https://www.themoviedb.org/settings/api) -> API settings -> API Read Access Token.

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Scripts

- `npm run dev` starts the dev server
- `npm run build` builds for production and type-checks
- `npm run preview` previews the production build
- `npm run start` runs the production server
