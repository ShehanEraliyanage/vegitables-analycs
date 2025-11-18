import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiService, Product, Statistics } from '../services/api';
import StatisticsPanel from '../components/StatisticsPanel';
import FilterPanel from '../components/FilterPanel';
import ChartPanel from '../components/ChartPanel';
import SyncButton from '../components/SyncButton';
import DailySyncButton from '../components/DailySyncButton';
import './Dashboard.css';

type TimePeriod = 'weekly' | 'monthly' | 'quarterly' | 'six-month' | 'annual';

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>(
    'products',
    () => apiService.getProducts(),
  );

  // Check if we have data (products exist)
  // Don't show sync button while loading or if products exist
  const hasData = !productsLoading && products.length > 0;

  const { data: statistics, isLoading: statsLoading } = useQuery<Statistics>(
    ['statistics', selectedProductId, startDate, endDate],
    () => apiService.getStatistics({
      productId: selectedProductId,
      startDate,
      endDate,
    }),
    {
      enabled: true,
    },
  );

  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    ['analytics', timePeriod, selectedProductId, startDate, endDate],
    () => {
      const params = {
        productId: selectedProductId,
        startDate,
        endDate,
      };

      switch (timePeriod) {
        case 'weekly':
          return apiService.getWeeklyAnalysis(params);
        case 'monthly':
          return apiService.getMonthlyAnalysis(params);
        case 'quarterly':
          return apiService.getQuarterlyAnalysis(params);
        case 'six-month':
          return apiService.getSixMonthAnalysis(params);
        case 'annual':
          return apiService.getAnnualAnalysis({
            year: startDate ? new Date(startDate).getFullYear() : undefined,
            productId: selectedProductId,
          });
        default:
          return apiService.getMonthlyAnalysis(params);
      }
    },
    {
      enabled: true,
    },
  );

  // Set default date range based on time period
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timePeriod) {
      case 'weekly':
        // Last 7 days
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        // Last 30 days
        start.setDate(start.getDate() - 30);
        break;
      case 'quarterly':
        // Last 3 months
        start.setMonth(start.getMonth() - 3);
        break;
      case 'six-month':
        // Last 6 months
        start.setMonth(start.getMonth() - 6);
        break;
      case 'annual':
        // Current year
        start.setMonth(0, 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, [timePeriod]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Vegetables & Fruits Price Analytics</h1>
        <p>Sri Lanka Market Prices</p>
      </header>

      <div className="dashboard-content">
        {!productsLoading && <SyncButton hasData={hasData} />}

        {hasData && (
          <>
            <DailySyncButton />

            <FilterPanel
              products={products}
              productsLoading={productsLoading}
              timePeriod={timePeriod}
              onTimePeriodChange={setTimePeriod}
              selectedProductId={selectedProductId}
              onProductChange={setSelectedProductId}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
            />

            <StatisticsPanel
              statistics={statistics}
              loading={statsLoading}
            />

            <ChartPanel
              analytics={analytics}
              loading={analyticsLoading}
              timePeriod={timePeriod}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

