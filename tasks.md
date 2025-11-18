# Tasks Breakdown
## Sri Lankan Vegetable & Fruit Price Analytics Platform

### Phase 1: Project Setup & Configuration

#### Task 1.1: Initialize Backend Project
- [ ] Create NestJS project structure
- [ ] Configure TypeScript and ESLint
- [ ] Set up environment variables (.env)
- [ ] Configure database connection (PostgreSQL)
- [ ] Set up TypeORM configuration

#### Task 1.2: Initialize Frontend Project
- [ ] Create Vite + React project
- [ ] Configure TypeScript
- [ ] Set up routing (if needed)
- [ ] Install charting library (Recharts)
- [ ] Set up HTTP client configuration

#### Task 1.3: Database Setup
- [ ] Create database schema
- [ ] Create migration files
- [ ] Set up entities (Product, Price)
- [ ] Create indexes
- [ ] Test database connection

### Phase 2: Backend Development

#### Task 2.1: Database Entities & Repositories
- [ ] Create Product entity
- [ ] Create Price entity
- [ ] Set up relationships
- [ ] Create repositories/services
- [ ] Add validation decorators

#### Task 2.2: External API Integration
- [ ] Create HTTP service for external API
- [ ] Implement date-based fetching
- [ ] Add error handling
- [ ] Implement retry logic
- [ ] Add request rate limiting (if needed)

#### Task 2.3: Data Sync Service
- [ ] Create sync service
- [ ] Implement initial sync logic (2025-05-05 to 2025-11-17)
- [ ] Implement batch processing for initial sync
- [ ] Implement daily sync logic
- [ ] Add progress tracking for initial sync
- [ ] Handle duplicate prevention

#### Task 2.4: Cron Job Setup
- [ ] Install @nestjs/schedule
- [ ] Configure cron job for 2:00 PM SL time
- [ ] Implement daily sync trigger
- [ ] Add error handling and logging
- [ ] Test cron job execution

#### Task 2.5: API Endpoints - Prices
- [ ] GET /api/prices (list with filters)
- [ ] GET /api/prices/:id (get specific)
- [ ] Add pagination
- [ ] Add query filters (date, product_id)
- [ ] Add response DTOs

#### Task 2.6: API Endpoints - Products
- [ ] GET /api/products (list all)
- [ ] GET /api/products/:id (get specific)
- [ ] Add filtering by type
- [ ] Add response DTOs

#### Task 2.7: Analytics Service
- [ ] Create analytics service
- [ ] Implement weekly analysis calculation
- [ ] Implement monthly analysis calculation
- [ ] Implement quarterly analysis calculation
- [ ] Implement 6-month analysis calculation
- [ ] Implement annual analysis calculation
- [ ] Calculate price volatility
- [ ] Calculate trend indicators

#### Task 2.8: Analytics Endpoints
- [ ] GET /api/analytics/weekly
- [ ] GET /api/analytics/monthly
- [ ] GET /api/analytics/quarterly
- [ ] GET /api/analytics/six-month
- [ ] GET /api/analytics/annual
- [ ] GET /api/analytics/stats
- [ ] Add query parameters (date range, product filter)
- [ ] Add response DTOs

#### Task 2.9: Sync Endpoints
- [ ] POST /api/sync/initial (trigger initial sync)
- [ ] POST /api/sync/daily (trigger daily sync)
- [ ] Add sync status tracking
- [ ] Return sync progress/results

### Phase 3: Frontend Development

#### Task 3.1: Project Structure & Setup
- [ ] Create component structure
- [ ] Set up API service layer
- [ ] Configure routing (if needed)
- [ ] Set up state management
- [ ] Create utility functions

#### Task 3.2: Dashboard Layout
- [ ] Create main Dashboard component
- [ ] Create Header component
- [ ] Create Footer component
- [ ] Implement responsive layout
- [ ] Add basic styling

#### Task 3.3: Statistics Components
- [ ] Create StatisticsPanel component
- [ ] Create StatCard component
- [ ] Fetch and display statistics
- [ ] Add loading states
- [ ] Add error handling

#### Task 3.4: Filter Components
- [ ] Create TimePeriodSelector component
- [ ] Create ProductFilter component
- [ ] Implement filter logic
- [ ] Add search functionality
- [ ] Style filters

#### Task 3.5: Chart Components
- [ ] Create PriceTrendChart component
- [ ] Create PriceComparisonChart component
- [ ] Integrate charting library
- [ ] Fetch data from API
- [ ] Handle different time periods
- [ ] Add chart interactions
- [ ] Style charts

#### Task 3.6: Analytics View
- [ ] Create AnalyticsView component
- [ ] Integrate all analytics components
- [ ] Implement time period switching
- [ ] Add data refresh functionality
- [ ] Style analytics view

### Phase 4: Integration & Testing

#### Task 4.1: Backend Testing
- [ ] Test API endpoints manually
- [ ] Test initial sync functionality
- [ ] Test daily sync cron job
- [ ] Test analytics calculations
- [ ] Test error handling

#### Task 4.2: Frontend Testing
- [ ] Test component rendering
- [ ] Test API integration
- [ ] Test filter functionality
- [ ] Test chart rendering
- [ ] Test responsive design

#### Task 4.3: End-to-End Testing
- [ ] Test complete user flow
- [ ] Test data synchronization
- [ ] Test analytics display
- [ ] Test error scenarios

### Phase 5: Documentation & Deployment

#### Task 5.1: Code Documentation
- [ ] Add JSDoc comments
- [ ] Document API endpoints
- [ ] Create README files
- [ ] Document environment setup

#### Task 5.2: Deployment Preparation
- [ ] Configure production environment
- [ ] Set up database migrations
- [ ] Configure CORS
- [ ] Set up logging
- [ ] Create deployment scripts

### Priority Order

1. **High Priority** (Core Functionality):
   - Task 1.1, 1.2, 1.3 (Project setup)
   - Task 2.1, 2.2, 2.3 (Data sync)
   - Task 2.4 (Cron job)
   - Task 2.5, 2.6 (Basic API endpoints)
   - Task 3.1, 3.2 (Frontend setup)

2. **Medium Priority** (Analytics):
   - Task 2.7, 2.8 (Analytics)
   - Task 3.3, 3.4, 3.5 (Frontend components)

3. **Low Priority** (Polish):
   - Task 3.6 (Analytics view)
   - Task 4.x (Testing)
   - Task 5.x (Documentation)

### Estimated Timeline

- **Phase 1**: 1-2 days
- **Phase 2**: 3-4 days
- **Phase 3**: 2-3 days
- **Phase 4**: 1-2 days
- **Phase 5**: 1 day

**Total**: ~8-12 days

