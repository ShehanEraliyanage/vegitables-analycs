import { Statistics } from '../services/api';
import LoadingSkeleton from './LoadingSkeleton';
import './StatisticsPanel.css';

interface StatisticsPanelProps {
  statistics: Statistics | undefined;
  loading: boolean;
}

const StatisticsPanel = ({ statistics, loading }: StatisticsPanelProps) => {
  if (loading) {
    return (
      <div className="statistics-panel">
        <div className="statistics-header">
          <h2>📊 Overview Statistics</h2>
          <p className="statistics-subtitle">Comprehensive price analytics at a glance</p>
        </div>
        <LoadingSkeleton type="stat" count={10} />
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="statistics-panel">
        <div className="no-data">No statistics available</div>
      </div>
    );
  }

  // Safely handle undefined/null values
  const safeValue = (value: number | undefined | null, defaultValue = 0) => {
    return value !== undefined && value !== null ? value : defaultValue;
  };

  const priceRange = safeValue(statistics.overallMaxPrice) - safeValue(statistics.overallMinPrice);
  const avgPrice = (safeValue(statistics.averageMinPrice) + safeValue(statistics.averageMaxPrice)) / 2;

  const statCards = [
    {
      icon: '📊',
      label: 'Total Entries',
      value: safeValue(statistics.totalEntries).toLocaleString(),
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Total price records',
    },
    {
      icon: '📦',
      label: 'Total Products',
      value: safeValue(statistics.totalProducts),
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Unique products tracked',
    },
    {
      icon: '💰',
      label: 'Average Price',
      value: `Rs. ${avgPrice.toFixed(2)}`,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Overall average price',
    },
    {
      icon: '📉',
      label: 'Average Min Price',
      value: `Rs. ${safeValue(statistics.averageMinPrice).toFixed(2)}`,
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      description: 'Average minimum price',
    },
    {
      icon: '📈',
      label: 'Average Max Price',
      value: `Rs. ${safeValue(statistics.averageMaxPrice).toFixed(2)}`,
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Average maximum price',
    },
    {
      icon: '⬇️',
      label: 'Overall Min Price',
      value: `Rs. ${safeValue(statistics.overallMinPrice).toFixed(2)}`,
      color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      description: 'Lowest price recorded',
    },
    {
      icon: '⬆️',
      label: 'Overall Max Price',
      value: `Rs. ${safeValue(statistics.overallMaxPrice).toFixed(2)}`,
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: 'Highest price recorded',
    },
    {
      icon: '📊',
      label: 'Price Range',
      value: `Rs. ${priceRange.toFixed(2)}`,
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      description: 'Difference between max and min',
    },
    {
      icon: '📈',
      label: 'Price Volatility',
      value: safeValue(statistics.volatility).toFixed(2),
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      description: 'Price fluctuation measure',
    },
    {
      icon: '📅',
      label: 'Date Range',
      value: statistics.dateRange?.start 
        ? `${new Date(statistics.dateRange.start).toLocaleDateString()} - ${new Date(statistics.dateRange.end).toLocaleDateString()}`
        : 'N/A',
      color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      description: 'Analysis period',
    },
  ];

  return (
    <div className="statistics-panel">
      <div className="statistics-header">
        <h2>📊 Overview Statistics</h2>
        <p className="statistics-subtitle">Comprehensive price analytics at a glance</p>
      </div>
      <div className="statistics-grid">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className={`stat-card enhanced variant-${index % 5}`}
          >
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-description">{card.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsPanel;

