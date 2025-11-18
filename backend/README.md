# Vegetables Analytics Backend

Backend API for Sri Lankan Vegetable & Fruit Price Analytics Platform built with NestJS.

## Features

- Daily price data synchronization from external API
- Automated cron job for daily sync at 2:00 PM SL time
- Initial sync for historical data (2025-05-05 to 2025-11-17)
- Comprehensive analytics (weekly, monthly, quarterly, 6-month, annual)
- RESTful API endpoints

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=vegetables_analytics

EXTERNAL_API_URL=https://api.dambulladec.com/api/prices/by-date

PORT=3000
NODE_ENV=development
TZ=Asia/Colombo
FRONTEND_URL=http://localhost:5173
```

## Database Setup

### Step 1: Create Database

Create the database in pgAdmin or using psql:

```bash
createdb vegetables_analytics
```

Or in pgAdmin:
1. Right-click on "Databases" → Create → Database
2. Name: `vegetables_analytics`
3. Click Save

### Step 2: Configure Environment

Make sure your `.env` file has correct database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=vegetables_analytics
NODE_ENV=development
```

### Step 3: Run Migrations

Run the initial migration to create tables:

```bash
# Run migrations
npm run migration:run
```

This will create the `products` and `prices` tables with all indexes and relationships.

### Migration Commands

```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Generate new migration (after entity changes)
npm run migration:generate -- -n MigrationName

# Create empty migration file
npm run migration:create -- -n MigrationName
```

### Verify Tables

After running migrations, verify in pgAdmin:
1. Expand `vegetables_analytics` → Schemas → public → Tables
2. You should see:
   - `products` table
   - `prices` table
3. Check indexes under each table

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Prices
- `GET /api/prices` - List prices with filters
- `GET /api/prices/:id` - Get specific price entry

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details

### Analytics
- `GET /api/analytics/weekly` - Weekly analysis
- `GET /api/analytics/monthly` - Monthly analysis
- `GET /api/analytics/quarterly` - Quarterly analysis
- `GET /api/analytics/six-month` - 6-month analysis
- `GET /api/analytics/annual` - Annual analysis
- `GET /api/analytics/stats` - General statistics

### Sync
- `POST /api/sync/initial` - Trigger initial sync
- `POST /api/sync/daily` - Trigger daily sync manually

## Initial Sync

After starting the application, trigger the initial sync:

```bash
curl -X POST http://localhost:3000/api/sync/initial
```

This will fetch and store historical data from 2025-05-05 to 2025-11-17.

## Cron Job

The application automatically runs a daily sync at 2:00 PM Sri Lanka time (Asia/Colombo timezone).

## Project Structure

```
src/
├── common/
│   └── entities/       # Database entities
├── modules/
│   ├── database/       # Database configuration
│   ├── product/        # Product module
│   ├── price/          # Price module
│   ├── sync/           # Data synchronization
│   └── analytics/       # Analytics calculations
├── app.module.ts       # Root module
└── main.ts             # Application entry point
```

## License

Private

