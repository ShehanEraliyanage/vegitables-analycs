# Backend Setup Guide

## Quick Setup

1. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file with your database credentials:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password_here
   DB_DATABASE=vegetables_analytics
   
   EXTERNAL_API_URL=https://api.dambulladec.com/api/prices/by-date
   
   PORT=3000
   NODE_ENV=development
   TZ=Asia/Colombo
   FRONTEND_URL=http://localhost:5173
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run migrations:**
   ```bash
   npm run migration:run
   ```

5. **Start the server:**
   ```bash
   npm run start:dev
   ```

## Troubleshooting

### "Invalid URL" Error

If you see "Invalid URL" errors when syncing:

1. **Check if `.env` file exists:**
   ```bash
   ls -la .env
   ```

2. **Verify `EXTERNAL_API_URL` is set:**
   ```bash
   cat .env | grep EXTERNAL_API_URL
   ```

3. **Create `.env` file if missing:**
   ```bash
   cp env.example .env
   # Then edit .env with your settings
   ```

4. **Restart the server** after creating/editing `.env`

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database `vegetables_analytics` exists
4. Test connection: `psql -U postgres -d vegetables_analytics`

