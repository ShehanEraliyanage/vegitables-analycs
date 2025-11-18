import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './TrendsPanel.css';

interface TrendsPanelProps {
  startDate?: string;
  endDate?: string;
  productId?: number;
}

const TrendsPanel = ({ startDate, endDate, productId }: TrendsPanelProps) => {
  const { data, isLoading } = useQuery(
    ['trends', startDate, endDate, productId],
    () => apiService.getPriceTrends({ startDate, endDate, productId }),
    { enabled: true }
  );

  if (isLoading) {
    return (
      <div className="trends-panel">
        <div className="loading">Loading trends...</div>
      </div>
    );
  }

  if (!data || !data.trends || data.trends.length === 0) {
    return (
      <div className="trends-panel">
        <div className="no-data">No trends data available</div>
      </div>
    );
  }

  const chartData = data.trends.slice(0, 10).map((trend: any) => ({
    name: trend.productName,
    change: trend.priceChangePercent,
    volatility: Math.round(trend.volatility * 100) / 100,
  }));

  return (
    <div className="trends-panel">
      <h2>Price Trends Analysis</h2>
      <div className="trends-summary">
        <p>
          Date Range: {new Date(data.dateRange.start).toLocaleDateString()} -{' '}
          {new Date(data.dateRange.end).toLocaleDateString()}
        </p>
      </div>

      <div className="trends-grid">
        {data.trends.slice(0, 20).map((trend: any) => (
          <div key={trend.productId} className={`trend-card trend-${trend.trend}`}>
            <div className="trend-header">
              <h3>{trend.productName}</h3>
              <span className={`trend-badge ${trend.trend}`}>
                {trend.trend === 'increasing' ? '↑' : trend.trend === 'decreasing' ? '↓' : '→'}
              </span>
            </div>
            <div className="trend-details">
              <div className="trend-stat">
                <span className="label">First Price:</span>
                <span className="value">Rs. {trend.firstPrice.toFixed(2)}</span>
              </div>
              <div className="trend-stat">
                <span className="label">Last Price:</span>
                <span className="value">Rs. {trend.lastPrice.toFixed(2)}</span>
              </div>
              <div className="trend-stat">
                <span className="label">Change:</span>
                <span className={`value ${trend.priceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                  {trend.priceChangePercent >= 0 ? '+' : ''}{trend.priceChangePercent.toFixed(2)}%
                </span>
              </div>
              <div className="trend-stat">
                <span className="label">Volatility:</span>
                <span className="value">{trend.volatility.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="trends-chart">
        <h3>Top Price Changes</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="change" stroke="#8884d8" name="Price Change %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsPanel;

