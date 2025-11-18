import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { AnalyticsResponse } from '../services/api';
import LoadingSkeleton from './LoadingSkeleton';
import './ChartPanel.css';

interface ChartPanelProps {
  analytics: AnalyticsResponse | undefined;
  loading: boolean;
  timePeriod: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Period: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="tooltip-item" style={{ color: entry.color }}>
            {`${entry.name}: Rs. ${entry.value.toFixed(2)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartPanel = ({ analytics, loading, timePeriod }: ChartPanelProps) => {
  if (loading) {
    return (
      <div className="chart-panel">
        <div className="chart-header">
          <div>
            <h2>📈 Price Analysis Dashboard</h2>
            <p className="chart-subtitle">{timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Analysis</p>
          </div>
        </div>
        <LoadingSkeleton type="chart" count={3} />
      </div>
    );
  }

  if (!analytics || !analytics.data || analytics.data.length === 0) {
    return (
      <div className="chart-panel">
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <div>No data available for the selected period</div>
        </div>
      </div>
    );
  }

  // Group data by period for better visualization
  const chartData = analytics.data.reduce((acc: any[], item) => {
    const existing = acc.find((d) => d.period === item.period);
    if (existing) {
      existing.products.push(item);
    } else {
      acc.push({
        period: item.period,
        products: [item],
      });
    }
    return acc;
  }, []);

  // Prepare data for line chart (average prices over time)
  const lineChartData = chartData.map((group) => {
    const avgMin = group.products.reduce((sum: number, p: any) => sum + p.avgMinPrice, 0) / group.products.length;
    const avgMax = group.products.reduce((sum: number, p: any) => sum + p.avgMaxPrice, 0) / group.products.length;
    const minPrice = Math.min(...group.products.map((p: any) => p.minPrice));
    const maxPrice = Math.max(...group.products.map((p: any) => p.maxPrice));
    const avgVolatility = group.products.reduce((sum: number, p: any) => sum + p.volatility, 0) / group.products.length;
    return {
      period: group.period,
      avgMinPrice: Math.round(avgMin * 100) / 100,
      avgMaxPrice: Math.round(avgMax * 100) / 100,
      minPrice: Math.round(minPrice * 100) / 100,
      maxPrice: Math.round(maxPrice * 100) / 100,
      volatility: Math.round(avgVolatility * 100) / 100,
      priceRange: Math.round((maxPrice - minPrice) * 100) / 100,
    };
  });

  // Calculate overall statistics
  const allPrices = analytics.data.flatMap((item: any) => [item.avgMinPrice, item.avgMaxPrice]);
  const overallAvg = allPrices.reduce((a: number, b: number) => a + b, 0) / allPrices.length;
  const overallMin = Math.min(...allPrices);
  const overallMax = Math.max(...allPrices);

  // Prepare data for bar chart (top products by average price)
  const productAverages = analytics.data.reduce((acc: any, item) => {
    if (!acc[item.productId]) {
      acc[item.productId] = {
        product: item.product,
        prices: [],
        volatilities: [],
      };
    }
    acc[item.productId].prices.push(item.avgMaxPrice);
    acc[item.productId].volatilities.push(item.volatility);
    return acc;
  }, {});

  const barChartData = Object.values(productAverages)
    .map((item: any) => ({
      product: item.product.length > 20 ? item.product.substring(0, 20) + '...' : item.product,
      fullProduct: item.product,
      avgPrice: item.prices.reduce((sum: number, p: number) => sum + p, 0) / item.prices.length,
      avgVolatility: item.volatilities.reduce((sum: number, v: number) => sum + v, 0) / item.volatilities.length,
    }))
    .sort((a: any, b: any) => b.avgPrice - a.avgPrice)
    .slice(0, 15);

  // Color scheme
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#330867'];
  const getBarColor = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio > 0.8) return '#ef4444';
    if (ratio > 0.6) return '#f59e0b';
    if (ratio > 0.4) return '#10b981';
    return '#3b82f6';
  };

  const maxBarValue = Math.max(...barChartData.map((d: any) => d.avgPrice));

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <div>
          <h2>📈 Price Analysis Dashboard</h2>
          <p className="chart-subtitle">{timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Analysis</p>
        </div>
        <div className="chart-stats-badge">
          <span className="badge-item">
            <span className="badge-label">Products</span>
            <span className="badge-value">{analytics.summary.totalProducts}</span>
          </span>
          <span className="badge-item">
            <span className="badge-label">Periods</span>
            <span className="badge-value">{chartData.length}</span>
          </span>
        </div>
      </div>

      <div className="charts-container">
        {/* Price Trends Area Chart */}
        <div className="chart-wrapper enhanced">
          <div className="chart-title-section">
            <h3>💰 Price Trends Over Time</h3>
            <div className="chart-info">
              <span className="info-item">Avg: Rs. {overallAvg.toFixed(2)}</span>
              <span className="info-item">Range: Rs. {overallMin.toFixed(2)} - Rs. {overallMax.toFixed(2)}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={lineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="period" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
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
                iconType="circle"
              />
              <ReferenceLine y={overallAvg} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Average', position: 'right' }} />
              <Area
                type="monotone"
                dataKey="avgMaxPrice"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMax)"
                name="Average Max Price"
              />
              <Area
                type="monotone"
                dataKey="avgMinPrice"
                stroke="#667eea"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMin)"
                name="Average Min Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Composed Chart with Price Range */}
        <div className="chart-wrapper enhanced">
          <div className="chart-title-section">
            <h3>📊 Price Range & Volatility</h3>
            <div className="chart-info">
              <span className="info-item">Shows min/max range and volatility</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={450}>
            <ComposedChart data={lineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="period" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#6b7280' }}
                label={{ value: 'Price (Rs.)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                stroke="#f59e0b"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#f59e0b' }}
                label={{ value: 'Volatility', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#f59e0b' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar yAxisId="left" dataKey="priceRange" fill="#f59e0b" name="Price Range (Rs.)" opacity={0.6} />
              <Line yAxisId="right" type="monotone" dataKey="volatility" stroke="#ef4444" strokeWidth={3} name="Volatility" dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Bar Chart */}
        <div className="chart-wrapper enhanced">
          <div className="chart-title-section">
            <h3>🏆 Top Products by Average Price</h3>
            <div className="chart-info">
              <span className="info-item">Showing top {barChartData.length} products</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="product" 
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
                label={{ value: 'Average Price (Rs.)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="custom-tooltip">
                        <p className="tooltip-label">{data.fullProduct}</p>
                        <p className="tooltip-item" style={{ color: payload[0].color }}>
                          Average Price: Rs. {payload[0].value?.toFixed(2)}
                        </p>
                        <p className="tooltip-item" style={{ color: '#f59e0b' }}>
                          Volatility: {data.avgVolatility.toFixed(2)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="square"
              />
              <Bar dataKey="avgPrice" name="Average Price (Rs.)" radius={[8, 8, 0, 0]}>
                {barChartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.avgPrice, maxBarValue)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-summary enhanced">
        <div className="summary-header">
          <h3>📋 Analysis Summary</h3>
        </div>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">📦</div>
            <div className="summary-content">
              <div className="summary-label">Total Products</div>
              <div className="summary-value">{analytics.summary.totalProducts}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <div className="summary-label">Date Range</div>
              <div className="summary-value-small">
                {new Date(analytics.summary.dateRange.start).toLocaleDateString()} -{' '}
                {new Date(analytics.summary.dateRange.end).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <div className="summary-content">
              <div className="summary-label">Average Price</div>
              <div className="summary-value">Rs. {overallAvg.toFixed(2)}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <div className="summary-label">Price Range</div>
              <div className="summary-value-small">Rs. {overallMin.toFixed(2)} - Rs. {overallMax.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPanel;

