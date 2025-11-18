import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import DataRefreshIndicator from './DataRefreshIndicator';
import './CurrentPricesPanel.css';

const CurrentPricesPanel = () => {
  const { data: todayData, isLoading: todayLoading } = useQuery(
    'today-prices',
    () => apiService.getTodayPrices(),
    { 
      enabled: true,
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  const { data: latestData, isLoading: latestLoading } = useQuery(
    'latest-prices',
    () => apiService.getLatestPrices(),
    { 
      enabled: true,
      refetchInterval: 300000,
    }
  );

  const isLoading = todayLoading || latestLoading;
  const hasTodayData = todayData?.data && todayData.data.length > 0;
  const hasLatestData = latestData?.data && latestData.data.length > 0;

  // Use today's data if available, otherwise use latest
  const currentData = hasTodayData ? todayData : latestData;
  const isToday = hasTodayData;
  const displayDate = currentData?.date || 'N/A';

  if (isLoading) {
    return (
      <div className="current-prices-panel">
        <div className="current-prices-header">
          <div>
            <h2>💰 Current Market Prices</h2>
            <p className="current-prices-subtitle">Latest available prices</p>
          </div>
        </div>
        <LoadingSkeleton type="stat" count={4} />
        <LoadingSkeleton type="chart" count={1} />
        <LoadingSkeleton type="card" count={6} />
      </div>
    );
  }

  if (!currentData || !currentData.data || currentData.data.length === 0) {
    return (
      <div className="current-prices-panel">
        <EmptyState
          icon="💰"
          title="No Current Price Data"
          message="No price data is currently available. Prices will appear after the daily sync completes."
        />
      </div>
    );
  }

  const chartData = currentData.data.map((price: any) => ({
    name: price.product.name.length > 15 ? price.product.name.substring(0, 15) + '...' : price.product.name,
    fullName: price.product.name,
    minPrice: Number(price.minPrice),
    maxPrice: Number(price.maxPrice),
    avgPrice: (Number(price.minPrice) + Number(price.maxPrice)) / 2,
    productType: price.product.type,
  })).sort((a: any, b: any) => b.avgPrice - a.avgPrice);

  const getBarColor = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio > 0.8) return '#ef4444';
    if (ratio > 0.6) return '#f59e0b';
    if (ratio > 0.4) return '#10b981';
    return '#3b82f6';
  };

  const maxPrice = Math.max(...chartData.map((d: any) => d.maxPrice));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.fullName}</p>
          <p className="tooltip-item" style={{ color: '#ef4444' }}>
            Max Price: Rs. {data.maxPrice.toFixed(2)}
          </p>
          <p className="tooltip-item" style={{ color: '#10b981' }}>
            Min Price: Rs. {data.minPrice.toFixed(2)}
          </p>
          <p className="tooltip-item" style={{ color: '#3b82f6' }}>
            Avg Price: Rs. {data.avgPrice.toFixed(2)}
          </p>
          <p className="tooltip-item" style={{ color: '#6b7280' }}>
            Type: {data.productType}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="current-prices-panel">
      <div className="current-prices-header">
        <div>
          <h2>💰 Current Market Prices</h2>
          <p className="current-prices-subtitle">
            {isToday ? "Today's prices" : 'Latest available prices'} - {new Date(displayDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="price-badge">
          <span className="badge-icon">{isToday ? '📅' : '🕐'}</span>
          <span className="badge-text">{isToday ? 'Today' : 'Latest'}</span>
        </div>
      </div>

      <div className="current-prices-stats">
        <div className="price-stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{currentData.data.length}</div>
          </div>
        </div>
        <div className="price-stat-card">
          <div className="stat-icon">⬆️</div>
          <div className="stat-content">
            <div className="stat-label">Highest Price</div>
            <div className="stat-value">Rs. {maxPrice.toFixed(2)}</div>
          </div>
        </div>
        <div className="price-stat-card">
          <div className="stat-icon">⬇️</div>
          <div className="stat-content">
            <div className="stat-label">Lowest Price</div>
            <div className="stat-value">Rs. {Math.min(...chartData.map((d: any) => d.minPrice)).toFixed(2)}</div>
          </div>
        </div>
        <div className="price-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Average Price</div>
            <div className="stat-value">
              Rs. {(chartData.reduce((sum: number, d: any) => sum + d.avgPrice, 0) / chartData.length).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="current-prices-chart enhanced">
        <div className="chart-title-section">
          <h3>📊 Price Comparison</h3>
          <div className="chart-info">
            <span className="info-item">Min/Max prices by product</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={120}
              stroke="#6b7280"
              style={{ fontSize: '11px' }}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
              label={{ value: 'Price (Rs.)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            <Bar dataKey="maxPrice" name="Max Price (Rs.)" radius={[8, 8, 0, 0]}>
              {chartData.map((entry: any, index: number) => (
                <Cell key={`max-${index}`} fill={getBarColor(entry.maxPrice, maxPrice)} />
              ))}
            </Bar>
            <Bar dataKey="minPrice" name="Min Price (Rs.)" radius={[8, 8, 0, 0]}>
              {chartData.map((entry: any, index: number) => (
                <Cell key={`min-${index}`} fill="#10b981" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="current-prices-grid">
        {currentData.data.map((price: any) => {
          const avgPrice = (Number(price.minPrice) + Number(price.maxPrice)) / 2;
          return (
            <div key={price.id} className="price-card">
              <div className="price-card-header">
                <div className="product-info">
                  <h4>{price.product.name}</h4>
                  <span className="product-type">{price.product.type}</span>
                </div>
                <div className="price-date">
                  {new Date(price.date).toLocaleDateString()}
                </div>
              </div>
              <div className="price-card-body">
                <div className="price-item min">
                  <span className="price-label">Min Price</span>
                  <span className="price-value">Rs. {Number(price.minPrice).toFixed(2)}</span>
                </div>
                <div className="price-item avg">
                  <span className="price-label">Average</span>
                  <span className="price-value">Rs. {avgPrice.toFixed(2)}</span>
                </div>
                <div className="price-item max">
                  <span className="price-label">Max Price</span>
                  <span className="price-value">Rs. {Number(price.maxPrice).toFixed(2)}</span>
                </div>
              </div>
              <div className="price-range-bar">
                <div 
                  className="price-range-fill" 
                  style={{ 
                    width: `${((avgPrice - Number(price.minPrice)) / (Number(price.maxPrice) - Number(price.minPrice))) * 100}%`,
                    left: '0%'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <DataRefreshIndicator 
        lastUpdated={new Date(displayDate)} 
        isRefreshing={isLoading}
      />
    </div>
  );
};

export default CurrentPricesPanel;

