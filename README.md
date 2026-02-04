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

This starts MongoDB on port **27018** with a persistent named volume (using 27018 to avoid conflicts with other MongoDB instances).

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
- **Host:** localhost:27018
- **Username:** admin
- **Password:** password
- **Database:** subscription-service
- **Volume:** subscription-service-mongodb-data (persistent)

**Note:** This project uses port 27018 instead of the default 27017 to allow running multiple MongoDB instances in parallel for different projects.

## Stopping Services

```bash
# Stop MongoDB (keeps data)
docker compose down

# Stop MongoDB and remove data
docker compose down -v
```

## Troubleshooting

### Port 27018 Already in Use

If you see `Bind for 0.0.0.0:27018 failed: port is already allocated`:

```bash
# Check what's using port 27018
lsof -i :27018

# If it's this project's MongoDB container, stop it
docker ps
docker stop subscription-service-mongo

# Or stop all Docker containers for this project
docker compose down

# Then try again
docker compose up -d
```

### MongoDB Already Running

If MongoDB is already running via Docker from a previous session, you can skip step 2 and go straight to `pnpm dev`.

### Running Multiple MongoDB Instances

This project uses port **27018** to allow you to run multiple MongoDB instances in parallel. If you have another project using port 27017, both can run simultaneously without conflicts.

## Azure Deployment

This project is configured for Azure deployment. Infrastructure-as-code will be added in the `infra/azure/` directory.

## Tech Stack

- **CMS:** Payload CMS v3
- **Framework:** Next.js 15
- **Database:** MongoDB (via Mongoose)
- **Language:** TypeScript
- **Editor:** Lexical Rich Text Editor
