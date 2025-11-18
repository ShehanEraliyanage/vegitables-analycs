# Design Document
## Sri Lankan Vegetable & Fruit Price Analytics Platform

### 1. System Architecture

#### 1.1 High-Level Architecture
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│  PostgreSQL │
│  (React)    │         │   (NestJS)   │         │  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │ External API│
                        │(Dambulla DEC)│
                        └─────────────┘
```

#### 1.2 Component Architecture

**Backend (NestJS)**:
- **Modules**:
  - `AppModule`: Main application module
  - `PriceModule`: Price data management
  - `ProductModule`: Product management
  - `AnalyticsModule`: Analytics calculations
  - `SyncModule`: Data synchronization
  - `DatabaseModule`: Database configuration

**Frontend (React)**:
- **Components**:
  - `Dashboard`: Main dashboard
  - `PriceChart`: Price trend charts
  - `Statistics`: Statistical summaries
  - `ProductFilter`: Product selection
  - `TimePeriodSelector`: Time period selection
  - `AnalyticsView`: Analytics display

### 2. Database Design

#### 2.1 Entity Relationship Diagram
```
┌─────────────┐
│   Product   │
├─────────────┤
│ id (PK)     │
│ name        │
│ type        │
│ created_at  │
└─────────────┘
       │
       │ 1:N
       │
┌─────────────┐
│    Price    │
├─────────────┤
│ id (PK)     │
│ date        │
│ min_price   │
│ max_price   │
│ product_id  │──┐
│ created_at  │  │ FK
│ updated_at  │  │
└─────────────┘  │
                 │
                 │
         ┌───────┘
```

#### 2.2 Database Schema

**products**:
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  api_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_type ON products(type);
```

**prices**:
```sql
CREATE TABLE prices (
  id SERIAL PRIMARY KEY,
  api_id INTEGER NOT NULL,
  date DATE NOT NULL,
  min_price DECIMAL(10, 2) NOT NULL,
  max_price DECIMAL(10, 2) NOT NULL,
  product_id INTEGER REFERENCES products(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(api_id, date)
);

CREATE INDEX idx_prices_date ON prices(date);
CREATE INDEX idx_prices_product_id ON prices(product_id);
CREATE INDEX idx_prices_date_product ON prices(date, product_id);
```

### 3. API Design

#### 3.1 RESTful Endpoints

**Prices**:
- `GET /api/prices` - List prices with query params (date, product_id, limit, offset)
- `GET /api/prices/:id` - Get specific price entry

**Products**:
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details

**Analytics**:
- `GET /api/analytics/weekly?startDate=&endDate=&productId=` - Weekly analysis
- `GET /api/analytics/monthly?startDate=&endDate=&productId=` - Monthly analysis
- `GET /api/analytics/quarterly?startDate=&endDate=&productId=` - Quarterly analysis
- `GET /api/analytics/six-month?startDate=&endDate=&productId=` - 6-month analysis
- `GET /api/analytics/annual?year=&productId=` - Annual analysis
- `GET /api/analytics/stats?startDate=&endDate=&productId=` - General statistics

**Sync**:
- `POST /api/sync/initial` - Trigger initial sync
- `POST /api/sync/daily` - Trigger daily sync manually

#### 3.2 Response Formats

**Price List Response**:
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

**Analytics Response**:
```json
{
  "period": "weekly",
  "data": [
    {
      "week": "2025-05-05",
      "product": "Cabbage",
      "avgMinPrice": 65.5,
      "avgMaxPrice": 95.2,
      "volatility": 12.3
    }
  ],
  "summary": {
    "totalProducts": 10,
    "dateRange": {
      "start": "2025-05-05",
      "end": "2025-11-17"
    }
  }
}
```

### 4. Frontend Design

#### 4.1 Page Structure
```
Dashboard
├── Header
│   ├── Logo
│   └── Navigation
├── Main Content
│   ├── Statistics Cards
│   │   ├── Total Products
│   │   ├── Average Price
│   │   └── Price Change
│   ├── Filters
│   │   ├── Time Period Selector
│   │   └── Product Filter
│   └── Charts Section
│       ├── Price Trend Chart
│       └── Comparison Chart
└── Footer
```

#### 4.2 Component Hierarchy
```
App
└── Dashboard
    ├── StatisticsPanel
    │   ├── StatCard
    │   └── StatCard
    ├── FilterPanel
    │   ├── TimePeriodSelector
    │   └── ProductFilter
    └── ChartPanel
        ├── PriceTrendChart
        └── PriceComparisonChart
```

### 5. Data Flow

#### 5.1 Initial Sync Flow
```
1. User triggers initial sync
2. Backend calculates date range (2025-05-05 to 2025-11-17)
3. For each date:
   a. Fetch data from API
   b. Parse and validate data
   c. Check if product exists, create if not
   d. Check if price entry exists, create if not
   e. Handle errors and retry
4. Return sync status
```

#### 5.2 Daily Sync Flow
```
1. Cron job triggers at 2:00 PM SL time
2. Get today's date
3. Fetch data from API
4. Parse and validate data
5. Update database
6. Log results
```

#### 5.3 Analytics Flow
```
1. User selects time period and filters
2. Frontend sends request to backend
3. Backend queries database
4. Calculate analytics (averages, volatility, trends)
5. Return formatted data
6. Frontend renders charts
```

### 6. Technology Stack

#### 6.1 Backend
- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Scheduling**: @nestjs/schedule
- **HTTP Client**: Axios
- **Validation**: class-validator, class-transformer

#### 6.2 Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Charts**: Recharts or Chart.js
- **HTTP Client**: Axios or Fetch
- **Styling**: CSS Modules or Tailwind CSS
- **State Management**: React Query or Context API

### 7. Error Handling

#### 7.1 Backend Error Handling
- Try-catch blocks for API calls
- Retry logic for failed requests
- Database transaction rollback on errors
- Structured error responses

#### 7.2 Frontend Error Handling
- Error boundaries for component errors
- User-friendly error messages
- Loading states for async operations

### 8. Security Considerations
- Input validation on all endpoints
- SQL injection prevention (using ORM)
- CORS configuration
- Rate limiting (future consideration)

### 9. Performance Optimization
- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching for analytics queries (future)
- Batch processing for initial sync

### 10. Deployment Considerations
- Environment variables for configuration
- Database migrations
- Health check endpoints
- Logging and monitoring

