import { Statistics } from '../services/api';
import './StatisticsPanel.css';

interface StatisticsPanelProps {
  statistics: Statistics | undefined;
  loading: boolean;
}

const StatisticsPanel = ({ statistics, loading }: StatisticsPanelProps) => {
  if (loading) {
    return (
      <div className="statistics-panel">
        <div className="loading">Loading statistics...</div>
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

  return (
    <div className="statistics-panel">
      <h2>Overview Statistics</h2>
      <div className="statistics-grid">
        <div className="stat-card">
          <div className="stat-label">Total Entries</div>
          <div className="stat-value">{safeValue(statistics.totalEntries).toLocaleString()}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{safeValue(statistics.totalProducts)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Average Min Price</div>
          <div className="stat-value">Rs. {safeValue(statistics.averageMinPrice).toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Average Max Price</div>
          <div className="stat-value">Rs. {safeValue(statistics.averageMaxPrice).toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Overall Min Price</div>
          <div className="stat-value">Rs. {safeValue(statistics.overallMinPrice).toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Overall Max Price</div>
          <div className="stat-value">Rs. {safeValue(statistics.overallMaxPrice).toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Price Volatility</div>
          <div className="stat-value">{safeValue(statistics.volatility).toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Date Range</div>
          <div className="stat-value-small">
            {statistics.dateRange?.start 
              ? new Date(statistics.dateRange.start).toLocaleDateString() 
              : 'N/A'} -{' '}
            {statistics.dateRange?.end 
              ? new Date(statistics.dateRange.end).toLocaleDateString() 
              : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;

