# Vegetables Analytics Platform

A web application for analyzing Sri Lankan vegetable and fruit prices from the Dambulla DEC API.

## Features

- **Automated Data Collection**: Daily sync at 2:00 PM Sri Lanka time
- **Historical Data**: Initial sync from 2025-05-05 to 2025-11-17
- **Comprehensive Analytics**: Weekly, monthly, quarterly, 6-month, and annual analysis
- **Interactive Charts**: Price trends and comparisons
- **Manual Sync**: Daily sync button with automatic status checking

## Tech Stack

- **Backend**: NestJS, PostgreSQL, TypeORM
- **Frontend**: React, Vite, Recharts, SweetAlert2
- **Scheduling**: Cron jobs for automated daily sync

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd vegetables-analycs
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your database credentials
   npm run migration:run
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Initial Data Sync**
   - Open http://localhost:5173
   - Click "Start Initial Data Sync" button
   - Wait for sync to complete (5-10 minutes)

## Project Structure

```
.
├── backend/          # NestJS API
├── frontend/        # React application
└── docs/            # Documentation files
```

## API Endpoints

- `GET /api/products` - List products
- `GET /api/prices` - List prices with filters
- `GET /api/analytics/weekly` - Weekly analysis
- `GET /api/analytics/monthly` - Monthly analysis
- `GET /api/analytics/quarterly` - Quarterly analysis
- `GET /api/analytics/six-month` - 6-month analysis
- `GET /api/analytics/annual` - Annual analysis
- `GET /api/analytics/stats` - General statistics
- `POST /api/sync/initial` - Trigger initial sync
- `POST /api/sync/daily` - Trigger daily sync

## Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=vegetables_analytics
EXTERNAL_API_URL=https://api.dambulladec.com/api/prices/by-date
PORT=3000
NODE_ENV=development
TZ=Asia/Colombo
```

## Development

```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

## License

Private
