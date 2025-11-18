# Requirements Document
## Sri Lankan Vegetable & Fruit Price Analytics Platform

### 1. Functional Requirements

#### 1.1 Data Collection (FR-001)
- **FR-001.1**: System shall fetch price data from `https://api.dambulladec.com/api/prices/by-date/{date}` endpoint
- **FR-001.2**: System shall perform initial sync from 2025-05-05 to 2025-11-17
- **FR-001.3**: System shall run daily sync at 2:00 PM Sri Lanka time (Asia/Colombo timezone)
- **FR-001.4**: System shall store only essential fields: id, date, min_price, max_price, product_id, product_name, product_type
- **FR-001.5**: System shall handle API failures gracefully with retry logic
- **FR-001.6**: System shall prevent duplicate entries based on id and date

#### 1.2 Data Storage (FR-002)
- **FR-002.1**: System shall use PostgreSQL database
- **FR-002.2**: System shall create tables for prices and products
- **FR-002.3**: System shall index date and product_id for fast queries
- **FR-002.4**: System shall maintain data integrity with foreign keys

#### 1.3 Analytics (FR-003)
- **FR-003.1**: System shall calculate weekly price averages (min/max)
- **FR-003.2**: System shall calculate monthly price averages (min/max)
- **FR-003.3**: System shall calculate quarterly price averages (min/max)
- **FR-003.4**: System shall calculate 6-month price averages (min/max)
- **FR-003.5**: System shall calculate annual price averages (min/max)
- **FR-003.6**: System shall calculate price volatility (standard deviation)
- **FR-003.7**: System shall provide price trend indicators (increasing/decreasing)
- **FR-003.8**: System shall support filtering by product type and date range

#### 1.4 API Endpoints (FR-004)
- **FR-004.1**: System shall provide GET endpoint to retrieve prices with pagination
- **FR-004.2**: System shall provide GET endpoint for weekly analysis
- **FR-004.3**: System shall provide GET endpoint for monthly analysis
- **FR-004.4**: System shall provide GET endpoint for quarterly analysis
- **FR-004.5**: System shall provide GET endpoint for 6-month analysis
- **FR-004.6**: System shall provide GET endpoint for annual analysis
- **FR-004.7**: System shall provide GET endpoint for general statistics
- **FR-004.8**: System shall provide GET endpoint to list all products

#### 1.5 Frontend (FR-005)
- **FR-005.1**: System shall display dashboard with overview statistics
- **FR-005.2**: System shall provide time period selector (weekly, monthly, quarterly, 6-month, annual)
- **FR-005.3**: System shall display line charts for price trends
- **FR-005.4**: System shall display bar charts for price comparisons
- **FR-005.5**: System shall provide product filter/search functionality
- **FR-005.6**: System shall display statistical summaries (average, min, max, volatility)
- **FR-005.7**: System shall be responsive and work on mobile devices

### 2. Non-Functional Requirements

#### 2.1 Performance (NFR-001)
- **NFR-001.1**: Initial sync shall complete within reasonable time (handle in batches)
- **NFR-001.2**: API endpoints shall respond within 2 seconds for standard queries
- **NFR-001.3**: Database queries shall be optimized with proper indexing

#### 2.2 Reliability (NFR-002)
- **NFR-002.1**: System shall handle API failures without crashing
- **NFR-002.2**: System shall log errors for debugging
- **NFR-002.3**: System shall retry failed API calls up to 3 times

#### 2.4 Usability (NFR-003)
- **NFR-003.1**: Interface shall be intuitive and easy to navigate
- **NFR-003.2**: Charts shall be interactive and clear
- **NFR-003.3**: Data shall be presented in a readable format

#### 2.5 Maintainability (NFR-004)
- **NFR-004.1**: Code shall follow best practices and be well-documented
- **NFR-004.2**: Project structure shall be organized and modular
- **NFR-004.3**: Configuration shall be externalized

### 3. Technical Constraints

#### 3.1 Backend
- Must use NestJS framework
- Must use PostgreSQL database (free tier compatible)
- Must use cron scheduling for daily tasks
- Must handle Sri Lanka timezone (Asia/Colombo)

#### 3.2 Frontend
- Must use React with Vite
- Must use charting library (Chart.js or Recharts)
- Must be responsive

#### 3.3 General
- No authentication required
- Manual testing approach
- Free tier database hosting

### 4. Data Requirements

#### 4.1 Input Data Format
```json
{
  "id": 14979,
  "date": "2025-11-17",
  "min_price": 60,
  "max_price": 100,
  "product": {
    "id": 1,
    "name": "Cabbage",
    "type": "vegetable",
    "image": "base64..."
  }
}
```

#### 4.2 Stored Data Format
- Price Entry: id, date, min_price, max_price, product_id, created_at, updated_at
- Product: id, name, type, created_at

### 5. Out of Scope
- User authentication
- Automated testing
- Real-time notifications
- Data export to external formats
- Multi-language support

