import {
  FaChartBar,
  FaBox,
  FaDollarSign,
  FaArrowDown,
  FaArrowUp,
  FaArrowsAltV,
  FaPercentage,
  FaCalendarAlt,
} from 'react-icons/fa';
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
          <h2 className="statistics-heading">
            <FaChartBar className="statistics-heading-icon" aria-hidden />
            Overview Statistics
          </h2>
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

  const safeValue = (value: number | undefined | null, defaultValue = 0) => {
    return value !== undefined && value !== null ? value : defaultValue;
  };

  const priceRange = safeValue(statistics.overallMaxPrice) - safeValue(statistics.overallMinPrice);
  const avgPrice = (safeValue(statistics.averageMinPrice) + safeValue(statistics.averageMaxPrice)) / 2;

  const statCards = [
    {
      icon: <FaChartBar aria-hidden />,
      label: 'Total Entries',
      value: safeValue(statistics.totalEntries).toLocaleString(),
      description: 'Total price records',
    },
    {
      icon: <FaBox aria-hidden />,
      label: 'Total Products',
      value: safeValue(statistics.totalProducts),
      description: 'Unique products tracked',
    },
    {
      icon: <FaDollarSign aria-hidden />,
      label: 'Average Price',
      value: `Rs. ${avgPrice.toFixed(2)}`,
      description: 'Overall average price',
    },
    {
      icon: <FaArrowDown aria-hidden />,
      label: 'Average Min Price',
      value: `Rs. ${safeValue(statistics.averageMinPrice).toFixed(2)}`,
      description: 'Average minimum price',
    },
    {
      icon: <FaArrowUp aria-hidden />,
      label: 'Average Max Price',
      value: `Rs. ${safeValue(statistics.averageMaxPrice).toFixed(2)}`,
      description: 'Average maximum price',
    },
    {
      icon: <FaArrowDown aria-hidden />,
      label: 'Overall Min Price',
      value: `Rs. ${safeValue(statistics.overallMinPrice).toFixed(2)}`,
      description: 'Lowest price recorded',
    },
    {
      icon: <FaArrowUp aria-hidden />,
      label: 'Overall Max Price',
      value: `Rs. ${safeValue(statistics.overallMaxPrice).toFixed(2)}`,
      description: 'Highest price recorded',
    },
    {
      icon: <FaArrowsAltV aria-hidden />,
      label: 'Price Range',
      value: `Rs. ${priceRange.toFixed(2)}`,
      description: 'Difference between max and min',
    },
    {
      icon: <FaPercentage aria-hidden />,
      label: 'Price Volatility',
      value: safeValue(statistics.volatility).toFixed(2),
      description: 'Price fluctuation measure',
    },
    {
      icon: <FaCalendarAlt aria-hidden />,
      label: 'Date Range',
      value: statistics.dateRange?.start
        ? `${new Date(statistics.dateRange.start).toLocaleDateString()} - ${new Date(statistics.dateRange.end).toLocaleDateString()}`
        : 'N/A',
      description: 'Analysis period',
    },
  ];

  return (
    <div className="statistics-panel">
      <div className="statistics-header">
        <h2 className="statistics-heading">
          <FaChartBar className="statistics-heading-icon" aria-hidden />
          Overview Statistics
        </h2>
        <p className="statistics-subtitle">Comprehensive price analytics at a glance</p>
      </div>
      <div className="statistics-grid">
        {statCards.map((card, index) => (
          <div key={card.label} className={`stat-card enhanced variant-${index % 5}`}>
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
