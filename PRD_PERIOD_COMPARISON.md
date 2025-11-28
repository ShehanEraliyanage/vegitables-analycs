# Product Requirements Document (PRD)
## Period Comparison Feature - Vegetables & Fruits Price Analytics

### 1. Overview
This feature enables users to compare price averages between equivalent time periods (e.g., last week vs this week, last month vs this month) to identify price trends and changes. Users can view side-by-side comparisons with increase/decrease indicators and export the data to Excel.

### 2. Objectives
- Enable users to compare prices across equivalent time periods
- Provide clear visual indicators for price increases/decreases
- Allow Excel export for further analysis
- Support multiple comparison periods (week, month, 3 months, 6 months, year)

### 3. User Stories

#### US-001: Week-over-Week Comparison
**As a** market analyst  
**I want to** compare last week's average prices with this week's average prices  
**So that** I can identify short-term price trends

#### US-002: Month-over-Month Comparison
**As a** trader  
**I want to** compare last month's average prices with this month's average prices  
**So that** I can make informed purchasing decisions

#### US-003: Multi-Period Comparison
**As a** researcher  
**I want to** compare prices across different time periods (3 months, 6 months, year)  
**So that** I can analyze long-term trends

#### US-004: Excel Export
**As a** data analyst  
**I want to** export comparison data to Excel  
**So that** I can perform additional analysis and create reports

### 4. Features

#### 4.1 Comparison Periods
The system shall support the following comparison periods:
- **Last Week vs This Week**: Compare the previous 7 days with the current 7 days
- **Last Month vs This Month**: Compare the previous calendar month with the current calendar month
- **Last 3 Months vs This 3 Months**: Compare the previous 3 months with the current 3 months
- **Last 6 Months vs This 6 Months**: Compare the previous 6 months with the current 6 months
- **Last Year vs This Year**: Compare the previous calendar year with the current calendar year

#### 4.2 Display Format
- **Left Side**: Average price of the previous period
- **Right Side**: Average price of the current period
- **Change Indicator**: 
  - Green arrow/icon for price decrease (good for consumers)
  - Red arrow/icon for price increase
  - Percentage change displayed
  - Absolute change in LKR displayed

#### 4.3 Data Display
For each product, display:
- Product name
- Product type
- Previous period average price (min/max)
- Current period average price (min/max)
- Price change (absolute and percentage)
- Volatility comparison
- Trend indicator (increasing/decreasing/stable)

#### 4.4 Excel Export
- Export all comparison data to Excel format (.xlsx)
- Include all columns: Product, Type, Previous Avg, Current Avg, Change %, Change Amount, Volatility
- Include metadata: Comparison period, export date, date ranges
- Format with headers and styling

### 5. Technical Requirements

#### 5.1 Backend API
**Endpoint**: `GET /api/analytics/period-comparison`

**Query Parameters**:
- `period`: `week` | `month` | `three-month` | `six-month` | `year`
- `productId` (optional): Filter by specific product
- `productType` (optional): Filter by product type

**Response Format**:
```json
{
  "comparisonType": "week",
  "previousPeriod": {
    "start": "2025-01-01",
    "end": "2025-01-07",
    "label": "Last Week"
  },
  "currentPeriod": {
    "start": "2025-01-08",
    "end": "2025-01-14",
    "label": "This Week"
  },
  "comparisons": [
    {
      "productId": 1,
      "productName": "Tomato",
      "productType": "vegetable",
      "previousAvgPrice": 150.50,
      "previousAvgMinPrice": 140.00,
      "previousAvgMaxPrice": 161.00,
      "currentAvgPrice": 165.75,
      "currentAvgMinPrice": 155.00,
      "currentAvgMaxPrice": 176.50,
      "priceChange": 15.25,
      "priceChangePercent": 10.13,
      "previousVolatility": 8.5,
      "currentVolatility": 9.2,
      "trend": "increasing"
    }
  ],
  "summary": {
    "totalProducts": 50,
    "productsIncreased": 30,
    "productsDecreased": 15,
    "productsStable": 5
  }
}
```

#### 5.2 Frontend Component
- **Component Name**: `PeriodComparisonPanel`
- **Location**: `frontend/src/components/PeriodComparisonPanel.tsx`
- **Features**:
  - Period selector (dropdown/buttons)
  - Product filter (optional)
  - Side-by-side comparison table
  - Visual indicators (arrows, colors)
  - Excel export button
  - Loading states
  - Empty states

#### 5.3 Excel Export Library
- Use `xlsx` library (SheetJS) for Excel export
- Format: .xlsx (Excel 2007+)
- Include formatting: headers, number formatting, colors for increases/decreases

### 6. User Interface

#### 6.1 Layout
```
┌─────────────────────────────────────────────────────────┐
│ Period Comparison                                       │
├─────────────────────────────────────────────────────────┤
│ [Week] [Month] [3 Months] [6 Months] [Year]            │
│                                                         │
│ ┌─────────────────┬─────────────────┐                  │
│ │ Last Week       │ This Week       │                  │
│ │ Jan 1 - Jan 7   │ Jan 8 - Jan 14  │                  │
│ └─────────────────┴─────────────────┘                  │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Product │ Type │ Last Avg │ This Avg │ Change │   │  │
│ ├─────────┼──────┼──────────┼──────────┼────────┤   │  │
│ │ Tomato  │ Veg  │ Rs 150.50│ Rs 165.75│ +10.13%│   │  │
│ │         │      │          │          │ ↑      │   │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ [📊 Export to Excel]                                   │
└─────────────────────────────────────────────────────────┘
```

#### 6.2 Visual Indicators
- **Increase**: Red color, ↑ arrow, positive percentage
- **Decrease**: Green color, ↓ arrow, negative percentage
- **Stable**: Gray color, → arrow, 0% change

### 7. Edge Cases

#### 7.1 Insufficient Data
- If previous period has no data: Show "N/A" for previous period
- If current period has no data: Show "N/A" for current period
- If both periods have no data: Hide the product from comparison

#### 7.2 Partial Data
- If a product exists in one period but not the other: Show available data, mark as "New" or "Discontinued"

#### 7.3 Date Boundaries
- Week: Monday to Sunday
- Month: Calendar month boundaries
- Year: Calendar year boundaries (Jan 1 - Dec 31)

### 8. Success Metrics
- Users can successfully compare prices across all supported periods
- Excel export generates correctly formatted files
- Comparison data loads within 2 seconds
- 100% of products with data in both periods are displayed

### 9. Future Enhancements
- Custom date range comparison
- Multiple period comparison (e.g., compare last 3 months with previous 3 months)
- Chart visualization of comparisons
- Email export option
- PDF report generation

### 10. Dependencies
- Backend: No new dependencies required
- Frontend: `xlsx` package for Excel export
- Browser: Modern browsers with ES6+ support

