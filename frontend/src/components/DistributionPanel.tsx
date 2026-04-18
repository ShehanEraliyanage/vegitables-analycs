import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { cssVar } from '../utils/cssVariables';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DistributionPanel.css';

interface DistributionPanelProps {
  startDate?: string;
  endDate?: string;
  productId?: number;
}

const DistributionPanel = ({ startDate, endDate, productId }: DistributionPanelProps) => {
  const { theme } = useTheme();
  const barFill = useMemo(() => cssVar('--chart-1', '#15803d'), [theme]);

  const { data, isLoading } = useQuery(
    ['distribution', startDate, endDate, productId],
    () => apiService.getPriceDistribution({ startDate, endDate, productId }),
    { enabled: true }
  );

  if (isLoading) {
    return (
      <div className="distribution-panel">
        <div className="loading">Loading distribution...</div>
      </div>
    );
  }

  if (!data || !data.distribution || data.distribution.length === 0) {
    return (
      <div className="distribution-panel">
        <div className="no-data">No distribution data available</div>
      </div>
    );
  }

  const chartData = data.distribution.map((item: any) => ({
    range: item.range,
    count: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className="distribution-panel">
      <h2>Price Distribution</h2>
      <div className="distribution-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="label">Total Prices:</span>
            <span className="value">{data.totalPrices}</span>
          </div>
          <div className="summary-stat">
            <span className="label">Min Price:</span>
            <span className="value">Rs. {data.minPrice.toFixed(2)}</span>
          </div>
          <div className="summary-stat">
            <span className="label">Max Price:</span>
            <span className="value">Rs. {data.maxPrice.toFixed(2)}</span>
          </div>
        </div>
        <p>
          Date Range: {new Date(data.dateRange.start).toLocaleDateString()} -{' '}
          {new Date(data.dateRange.end).toLocaleDateString()}
        </p>
      </div>

      <div className="distribution-chart">
        <h3>Price Range Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill={barFill} name="Number of Prices" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="distribution-table">
        <h3>Distribution Details</h3>
        <table>
          <thead>
            <tr>
              <th>Price Range</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.distribution.map((item: any, index: number) => (
              <tr key={index}>
                <td>Rs. {item.range}</td>
                <td>{item.count}</td>
                <td>{item.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DistributionPanel;

