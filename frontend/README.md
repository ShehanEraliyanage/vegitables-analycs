# Vegetables Analytics Frontend

Frontend application for Sri Lankan Vegetable & Fruit Price Analytics Platform built with React and Vite.

## Features

- Interactive dashboard with statistics
- Time period analysis (weekly, monthly, quarterly, 6-month, annual)
- Product filtering and search
- Interactive charts and visualizations
- Responsive design

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file (optional, defaults to localhost):

```env
VITE_API_URL=http://localhost:3000/api
```

## Running the Application

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/        # React components
│   ├── ChartPanel.tsx
│   ├── FilterPanel.tsx
│   └── StatisticsPanel.tsx
├── pages/            # Page components
│   └── Dashboard.tsx
├── services/         # API services
│   └── api.ts
├── App.tsx           # Root component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Features

### Dashboard
- Overview statistics cards
- Time period selector
- Product filter
- Date range selector
- Interactive charts

### Charts
- Price trend line charts
- Product comparison bar charts
- Responsive design

## License

Private

