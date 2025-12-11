import { useQuery } from 'react-query';
import { apiService, Statistics } from '../services/api';
import { FaArrowUp, FaArrowDown, FaChartLine, FaDollarSign, FaBoxes } from 'react-icons/fa';
import LoadingSkeleton from './LoadingSkeleton';
import './DashboardWidgets.css';

interface DashboardWidgetsProps {
  selectedProductId?: number;
  startDate?: string;
  endDate?: string;
}

const DashboardWidgets = ({ selectedProductId, startDate, endDate }: DashboardWidgetsProps) => {
  const { data: statistics, isLoading } = useQuery<Statistics>(
    ['widget-statistics', selectedProductId, startDate, endDate],
    () => apiService.getStatistics({
      productId: selectedProductId,
      startDate,
      endDate,
    }),
  );

  // Prefetch latest prices if needed, or remove if unused completely. 
  // keeping the query if it caches data used elsewhere, but variable is unused.
  useQuery(
    'latest-prices',
    () => apiService.getLatestPrices(),
    {
      enabled: !selectedProductId,
    }
  );

  if (isLoading) {
    return (
      <div className="dashboard-widgets">
        <LoadingSkeleton type="stat" count={4} />
      </div>
    );
  }

  const safeValue = (value: number | undefined | null, defaultValue = 0) => {
    return value !== undefined && value !== null ? value : defaultValue;
  };

  const avgPrice = statistics 
    ? (safeValue(statistics.averageMinPrice) + safeValue(statistics.averageMaxPrice)) / 2 
    : 0;

  // Calculate price change indicator (mock for now - would need historical comparison)
  const priceChange = 0; // This would be calculated from previous period

  const widgets = [
    {
      id: 'avg-price',
      title: 'Average Price',
      value: `Rs. ${avgPrice.toFixed(2)}`,
      icon: FaDollarSign,
      color: 'var(--primary-color)',
      change: priceChange,
      description: statistics ? 'Across all products' : 'No data',
    },
    {
      id: 'total-products',
      title: 'Total Products',
      value: safeValue(statistics?.totalProducts).toString(),
      icon: FaBoxes,
      color: 'var(--success-color)',
      change: null,
      description: 'Tracked products',
    },
    {
      id: 'volatility',
      title: 'Market Volatility',
      value: safeValue(statistics?.volatility).toFixed(2),
      icon: FaChartLine,
      color: 'var(--warning-color)',
      change: null,
      description: 'Price fluctuation index',
    },
    {
      id: 'price-range',
      title: 'Price Range',
      value: statistics 
        ? `Rs. ${safeValue(statistics.overallMinPrice).toFixed(2)} - Rs. ${safeValue(statistics.overallMaxPrice).toFixed(2)}`
        : 'N/A',
      icon: FaChartLine,
      color: 'var(--info-color)',
      change: null,
      description: 'Min - Max prices',
    },
  ];

  return (
    <div className="dashboard-widgets">
      {widgets.map((widget) => {
        const Icon = widget.icon;
        return (
          <div key={widget.id} className="widget-card">
            <div className="widget-header">
              <div className="widget-icon" style={{ color: widget.color }}>
                <Icon />
              </div>
              <div className="widget-title">{widget.title}</div>
            </div>
            <div className="widget-content">
              <div className="widget-value">{widget.value}</div>
              {widget.change !== null && (
                <div className={`widget-change ${widget.change >= 0 ? 'positive' : 'negative'}`}>
                  {widget.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  <span>{Math.abs(widget.change).toFixed(2)}%</span>
                </div>
              )}
            </div>
            <div className="widget-description">{widget.description}</div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardWidgets;

