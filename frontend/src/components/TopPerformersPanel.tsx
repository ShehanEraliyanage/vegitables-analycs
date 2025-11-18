import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './TopPerformersPanel.css';

interface TopPerformersPanelProps {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

const TopPerformersPanel = ({ startDate, endDate, limit = 10 }: TopPerformersPanelProps) => {
  const { data, isLoading } = useQuery(
    ['top-performers', startDate, endDate, limit],
    () => apiService.getTopPerformers({ startDate, endDate, limit }),
    { enabled: true }
  );

  if (isLoading) {
    return (
      <div className="top-performers-panel">
        <div className="loading">Loading top performers...</div>
      </div>
    );
  }

  if (!data || (!data.best || data.best.length === 0) && (!data.worst || data.worst.length === 0)) {
    return (
      <div className="top-performers-panel">
        <div className="no-data">No performers data available</div>
      </div>
    );
  }

  const bestChartData = data.best.map((item: any) => ({
    name: item.productName.length > 15 ? item.productName.substring(0, 15) + '...' : item.productName,
    change: Math.abs(item.priceChangePercent),
  }));

  const worstChartData = data.worst.map((item: any) => ({
    name: item.productName.length > 15 ? item.productName.substring(0, 15) + '...' : item.productName,
    change: item.priceChangePercent,
  }));

  return (
    <div className="top-performers-panel">
      <h2>Top Performers</h2>
      <div className="performers-summary">
        <p>
          Date Range: {new Date(data.dateRange.start).toLocaleDateString()} -{' '}
          {new Date(data.dateRange.end).toLocaleDateString()}
        </p>
      </div>

      <div className="performers-container">
        <div className="performers-section">
          <h3 className="best-title">Best Deals (Price Decreased)</h3>
          {data.best && data.best.length > 0 ? (
            <>
              <div className="performers-list">
                {data.best.map((item: any, index: number) => (
                  <div key={item.productId} className="performer-card best">
                    <div className="performer-rank">#{index + 1}</div>
                    <div className="performer-info">
                      <div className="performer-name">{item.productName}</div>
                      <div className="performer-type">{item.productType}</div>
                    </div>
                    <div className="performer-stats">
                      <div className="performer-stat">
                        <span className="label">Avg Price:</span>
                        <span className="value">Rs. {item.avgPrice.toFixed(2)}</span>
                      </div>
                      <div className="performer-stat">
                        <span className="label">Change:</span>
                        <span className="value negative">{item.priceChangePercent.toFixed(2)}%</span>
                      </div>
                      <div className="performer-stat">
                        <span className="label">Volatility:</span>
                        <span className="value">{item.volatility.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="performers-chart">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={bestChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="change" fill="#10b981" name="Price Decrease %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="no-data">No data available</div>
          )}
        </div>

        <div className="performers-section">
          <h3 className="worst-title">Price Increases</h3>
          {data.worst && data.worst.length > 0 ? (
            <>
              <div className="performers-list">
                {data.worst.map((item: any, index: number) => (
                  <div key={item.productId} className="performer-card worst">
                    <div className="performer-rank">#{index + 1}</div>
                    <div className="performer-info">
                      <div className="performer-name">{item.productName}</div>
                      <div className="performer-type">{item.productType}</div>
                    </div>
                    <div className="performer-stats">
                      <div className="performer-stat">
                        <span className="label">Avg Price:</span>
                        <span className="value">Rs. {item.avgPrice.toFixed(2)}</span>
                      </div>
                      <div className="performer-stat">
                        <span className="label">Change:</span>
                        <span className="value positive">+{item.priceChangePercent.toFixed(2)}%</span>
                      </div>
                      <div className="performer-stat">
                        <span className="label">Volatility:</span>
                        <span className="value">{item.volatility.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="performers-chart">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={worstChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="change" fill="#ef4444" name="Price Increase %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="no-data">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPerformersPanel;

