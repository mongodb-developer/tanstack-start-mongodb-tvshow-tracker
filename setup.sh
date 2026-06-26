#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Setting up the Movie/TV Show Tracker project...${NC}"

# ------------------------------------------------------------------
# Clean up TanStack Start starter files
# ------------------------------------------------------------------

echo -e "${BLUE}Cleaning up TanStack Start starter files...${NC}"

rm -f src/routeTree.gen.ts 2>/dev/null

rm -f src/routes/posts.tsx 2>/dev/null
rm -f src/routes/posts.index.tsx 2>/dev/null
rm -f src/routes/posts.\$postId.tsx 2>/dev/null
rm -f src/routes/posts_.\$postId.deep.tsx 2>/dev/null

rm -f src/routes/users.tsx 2>/dev/null
rm -f src/routes/users.index.tsx 2>/dev/null
rm -f src/routes/users.\$userId.tsx 2>/dev/null

rm -f src/routes/deferred.tsx 2>/dev/null
rm -f src/routes/redirect.tsx 2>/dev/null
rm -f src/routes/customScript\[.\]js.ts 2>/dev/null

rm -f src/routes/_pathlessLayout.tsx 2>/dev/null
rm -rf src/routes/_pathlessLayout 2>/dev/null
rm -rf src/routes/api 2>/dev/null

echo -e "${GREEN}✓ Starter files removed.${NC}"

# ------------------------------------------------------------------
# Create folders and starter files
# ------------------------------------------------------------------

echo -e "${BLUE}Creating project folders and files...${NC}"

mkdir -p src/config
mkdir -p src/lib
mkdir -p src/server
mkdir -p src/styles
mkdir -p src/routes

touch src/config/mongodb.ts
touch src/lib/constants.ts
touch src/lib/mongodb.ts
touch src/lib/tmdb.ts
touch src/lib/types.ts
touch src/server/shows.ts
touch src/server/tmdb.ts
touch src/styles/app.css

cat > src/routes/index.tsx <<'EOF'
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="page">
      <header className="masthead">
        <h1>Movie/TV Show Tracker</h1>
        <p>Track TV shows with MongoDB and TanStack Start.</p>
      </header>
    </main>
  );
}
EOF

echo -e "${GREEN}✓ Project folders and files created.${NC}"

# ------------------------------------------------------------------
# Replace the starter root route
# ------------------------------------------------------------------

echo -e "${BLUE}Updating root route...${NC}"

cat > src/routes/__root.tsx <<'EOF'
/// <reference types="vite/client" />
import {
  HeadContent,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Movie/TV Show Tracker" },
      {
        name: "description",
        content: "Track TV shows with MongoDB and TanStack Start.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
EOF

echo -e "${GREEN}✓ Root route updated.${NC}"

# ------------------------------------------------------------------
# Create environment file
# ------------------------------------------------------------------

echo -e "${BLUE}Creating environment file...${NC}"

cat > .env <<'EOF'
# MongoDB Atlas connection string
MONGODB_URI=

# TMDB Read Access Token
TMDB_READ_ACCESS_TOKEN=
EOF

echo -e "${GREEN}✓ .env file created.${NC}"

echo
echo -e "${GREEN}✓ Project setup complete!${NC}"
echo
echo "Go back to the tutorial and continue from the Project Structure section."
echo
echo "When you're ready, start the development server:"
echo
echo "    npm run dev"
echo