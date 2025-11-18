# Quick Start Guide

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
3. **npm** or **yarn**

## Step 1: Database Setup

### Create Database in pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → Create → Database
4. Name: `vegetables_analytics`
5. Click Save

### Initialize Tables Using Migrations

After creating the database, run migrations to create tables:

```bash
cd backend
npm run migration:run
```

This will create all necessary tables (`products` and `prices`) with indexes and relationships.

## Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your database credentials
# Update these values to match your pgAdmin setup:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=your_password
# DB_DATABASE=vegetables_analytics
# NODE_ENV=development

# Run migrations to create tables
npm run migration:run

# Start backend server (development mode)
npm run start:dev
```

The backend will start on `http://localhost:3000`

**Note**: Make sure to run migrations before starting the server for the first time.

## Step 3: Frontend Setup

```bash
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Step 4: Initial Data Sync

After both servers are running, trigger the initial sync to fetch historical data:

```bash
# Using curl
curl -X POST http://localhost:3000/api/sync/initial

# Or using browser/postman
POST http://localhost:3000/api/sync/initial
```

**Note**: The initial sync will fetch data from 2025-05-05 to 2025-11-17. This may take several minutes depending on the API response time.

## Step 5: Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. You should see the dashboard with statistics and charts
3. Use the filters to explore different time periods and products

## Daily Sync

The backend automatically runs a daily sync at **2:00 PM Sri Lanka time** (Asia/Colombo timezone). You can also manually trigger it:

```bash
curl -X POST http://localhost:3000/api/sync/daily
```

## Troubleshooting

### Database Connection Issues

1. **Cannot connect to database**
   - Verify PostgreSQL is running
   - Check database credentials in `.env` match your pgAdmin setup
   - Ensure database `vegetables_analytics` exists
   - Test connection in pgAdmin first

2. **Tables not created**
   - Run migrations: `npm run migration:run`
   - Check migration status: `npm run migration:show`
   - Verify database connection in `.env`

3. **Permission errors**
   - Ensure your database user has CREATE TABLE permissions
   - Check PostgreSQL logs for detailed error messages

### Backend Issues

1. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Or stop the process using port 3000

2. **Module not found errors**
   - Run `npm install` again
   - Delete `node_modules` and `package-lock.json`, then reinstall

### Frontend Issues

1. **Cannot Connect to API**
   - Verify backend is running on port 3000
   - Check `VITE_API_URL` in `.env` (if using)
   - Check CORS settings in backend
   - Open browser console for detailed errors

2. **No Data Showing**
   - Ensure initial sync has completed
   - Check browser console for errors
   - Verify API endpoints are accessible: `http://localhost:3000/api/products`

## Verify Database Tables

To verify tables were created in pgAdmin:

1. Expand `vegetables_analytics` database
2. Expand "Schemas" → "public" → "Tables"
3. You should see:
   - `products` table
   - `prices` table

## Project Structure

```
.
├── backend/              # NestJS backend
│   ├── database/
│   │   └── init.sql      # SQL script for manual table creation
│   ├── src/
│   │   ├── modules/     # Feature modules
│   │   ├── common/      # Shared entities
│   │   └── main.ts      # Entry point
│   └── package.json
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
│   └── package.json
└── Documentation files
```

## Next Steps

1. Explore the dashboard and analytics
2. Try different time periods and filters
3. Review the API documentation in `backend/README.md`
4. Check the design documents for architecture details

## Support

For issues or questions, refer to:
- [PRD.md](PRD.md) - Product requirements
- [requirements.md](requirements.md) - Detailed requirements
- [design.md](design.md) - System design
- [tasks.md](tasks.md) - Task breakdown
