# subscription-service

Subscription service built with Payload CMS v3 and MongoDB.

## Prerequisites

- Node.js >= 18.0.0
- Docker and Docker Compose
- pnpm (recommended) or npm

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 2. Start MongoDB

```bash
docker compose up -d
```

This starts MongoDB on port 27017 with a persistent named volume.

### 3. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

The Payload admin UI will be available at: **http://localhost:3000/admin**

### 4. Create Your First Admin User

On first run, navigate to http://localhost:3000/admin and you'll be prompted to create your first admin user.

## Available Scripts

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm generate:types` - Generate TypeScript types from Payload config
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking

## Environment Variables

Copy `.env.example` to `.env` (already done for local dev):

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI` - MongoDB connection string
- `PAYLOAD_SECRET` - Secret key for Payload (change in production!)
- `NEXT_PUBLIC_SERVER_URL` - Public URL of the server
- `NODE_ENV` - Environment (development/production)

## Project Structure

```
.
├── src/
│   ├── app/                    # Next.js App Router
│   │   └── (payload)/          # Payload admin routes
│   │       ├── admin/          # Admin UI
│   │       └── api/            # REST API endpoints
│   ├── collections/            # Payload collections
│   │   └── Users.ts            # Users collection with auth
│   └── payload.config.ts       # Payload configuration
├── docker-compose.yml          # Local MongoDB setup
├── next.config.mjs             # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## MongoDB Connection

The local MongoDB instance runs with:
- **Host:** localhost:27017
- **Username:** admin
- **Password:** password
- **Database:** subscription-service
- **Volume:** subscription-service-mongodb-data (persistent)

## Stopping Services

```bash
# Stop MongoDB (keeps data)
docker compose down

# Stop MongoDB and remove data
docker compose down -v
```

## Troubleshooting

### Port 27017 Already in Use

If you see `Bind for 0.0.0.0:27017 failed: port is already allocated`:

```bash
# Check what's using port 27017
lsof -i :27017

# If it's another Docker container, stop it
docker ps
docker stop <container-id>

# Or stop all Docker containers
docker compose down

# Then try again
docker compose up -d
```

### MongoDB Already Running

If MongoDB is already running via Docker from a previous session, you can skip step 2 and go straight to `pnpm dev`.

## Azure Deployment

This project is configured for Azure deployment. Infrastructure-as-code will be added in the `infra/azure/` directory.

## Tech Stack

- **CMS:** Payload CMS v3
- **Framework:** Next.js 15
- **Database:** MongoDB (via Mongoose)
- **Language:** TypeScript
- **Editor:** Lexical Rich Text Editor
