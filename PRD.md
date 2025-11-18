# Product Requirements Document (PRD)
## Sri Lankan Vegetable & Fruit Price Analytics Platform

### 1. Overview
A web application that fetches, stores, and analyzes daily vegetable, fruit, rice, potato, and leaf vegetable prices from the Dambulla DEC API. The platform provides comprehensive analytics including weekly, monthly, quarterly, 6-month, and annual trends with visualizations.

### 2. Objectives
- Automate daily price data collection from external API
- Store historical price data efficiently
- Provide comprehensive analytics and visualizations
- Enable users to analyze price trends over different time periods

### 3. Target Users
- Agricultural researchers
- Market analysts
- Farmers and traders
- General public interested in price trends

### 4. Features

#### 4.1 Data Collection
- **Initial Sync**: Fetch historical data from 2025-05-05 to 2025-11-17
- **Daily Sync**: Automated cron job at 2:00 PM Sri Lanka time
- **Data Storage**: Store only essential fields (id, date, min_price, max_price, product_id, product_name, product_type)

#### 4.2 Analytics & Reporting
- **Time Period Analysis**:
  - Weekly analysis
  - Monthly analysis
  - Quarterly analysis
  - 6-month analysis
  - Annual analysis
- **Statistics**:
  - Average prices (min/max)
  - Price volatility
  - Price trends
  - Product comparisons
- **Visualizations**:
  - Line charts for price trends
  - Bar charts for comparisons
  - Statistical summaries

#### 4.3 User Interface
- Dashboard with overview statistics
- Time period selector
- Product filter/search
- Interactive charts
- Data export capabilities

### 5. Technical Requirements

#### 5.1 Backend
- **Framework**: NestJS
- **Database**: PostgreSQL (free tier compatible)
- **Scheduling**: Cron jobs for daily data fetching
- **API**: RESTful API endpoints

#### 5.2 Frontend
- **Framework**: React with Vite
- **Charts**: Chart.js or Recharts
- **UI**: Modern, responsive design
- **State Management**: React Query or Context API

### 6. Data Model

#### 6.1 Price Entry
- id (from API)
- date
- min_price
- max_price
- product_id
- product_name
- product_type (vegetable, fruit, rice, etc.)
- created_at
- updated_at

#### 6.2 Product
- id
- name
- type
- created_at

### 7. API Endpoints

#### 7.1 Data Management
- `GET /api/prices` - Get prices with filters
- `GET /api/prices/:id` - Get specific price entry
- `POST /api/sync/initial` - Trigger initial sync (admin)
- `POST /api/sync/daily` - Trigger daily sync (admin)

#### 7.2 Analytics
- `GET /api/analytics/weekly` - Weekly analysis
- `GET /api/analytics/monthly` - Monthly analysis
- `GET /api/analytics/quarterly` - Quarterly analysis
- `GET /api/analytics/six-month` - 6-month analysis
- `GET /api/analytics/annual` - Annual analysis
- `GET /api/analytics/stats` - General statistics

#### 7.3 Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details

### 8. Non-Functional Requirements
- **Performance**: Handle initial sync efficiently (batch processing)
- **Reliability**: Error handling for API failures
- **Scalability**: Database indexing for fast queries
- **Maintainability**: Clean code structure and documentation

### 9. Constraints
- No authentication required (for now)
- Manual testing approach
- Free tier database hosting
- Sri Lanka timezone for cron scheduling

### 10. Success Metrics
- Successful daily data collection
- Accurate analytics calculations
- Fast query response times
- User-friendly interface

