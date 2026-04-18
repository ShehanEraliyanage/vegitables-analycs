import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import {
  FaChartLine,
  FaCalendarAlt,
  FaChartBar,
  FaChartArea,
  FaArrowUp,
  FaArrowDown,
  FaArrowsAltH,
} from 'react-icons/fa';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { cssVar } from '../utils/cssVariables';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import './TrendsPanel.css';

interface TrendsPanelProps {
  startDate?: string;
  endDate?: string;
  productId?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Product: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="tooltip-item" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value >= 0 ? '+' : ''}${entry.value.toFixed(2)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TrendsPanel = ({ startDate, endDate, productId }: TrendsPanelProps) => {
  const { theme } = useTheme();

  const colors = useMemo(() => {
    return {
      error: cssVar('--error', '#dc2626'),
      success: cssVar('--success', '#16a34a'),
      muted: cssVar('--text-secondary', '#64748b'),
    };
  }, [theme]);

  const { data, isLoading } = useQuery(
    ['trends', startDate, endDate, productId],
    () => apiService.getPriceTrends({ startDate, endDate, productId }),
    { enabled: true }
  );

  if (isLoading) {
    return (
      <div className="trends-panel">
        <div className="trends-header">
          <div className="trends-title-block">
            <FaChartLine className="panel-heading-icon" aria-hidden />
            <div>
              <h2>Price Trends Analysis</h2>
              <p className="trends-subtitle">Track price movements and volatility across products</p>
            </div>
          </div>
        </div>
        <LoadingSkeleton type="card" count={6} />
      </div>
    );
  }

  if (!data || !data.trends || data.trends.length === 0) {
    return (
      <div className="trends-panel">
        <EmptyState
          icon={<FaChartLine className="empty-state-icon-svg" aria-hidden />}
          title="No Trends Data Available"
          message="No price trend data found for the selected period. Try adjusting your filters or date range."
        />
      </div>
    );
  }

  const increasingTrends = data.trends.filter((t: any) => t.trend === 'increasing');
  const decreasingTrends = data.trends.filter((t: any) => t.trend === 'decreasing');
  const stableTrends = data.trends.filter((t: any) => t.trend === 'stable');

  const chartData = data.trends.slice(0, 15).map((trend: any) => ({
    name: trend.productName.length > 20 ? trend.productName.substring(0, 20) + '...' : trend.productName,
    fullName: trend.productName,
    change: trend.priceChangePercent,
    volatility: Math.round(trend.volatility * 100) / 100,
    trend: trend.trend,
  }));

  const getBarColor = (trend: string) => {
    if (trend === 'increasing') return colors.error;
    if (trend === 'decreasing') return colors.success;
    return colors.muted;
  };

  const trendIcon = (trend: string) => {
    if (trend === 'increasing') return <FaArrowUp aria-hidden />;
    if (trend === 'decreasing') return <FaArrowDown aria-hidden />;
    return <FaArrowsAltH aria-hidden />;
  };

  return (
    <div className="trends-panel">
      <div className="trends-header">
        <div className="trends-title-block">
          <FaChartLine className="panel-heading-icon" aria-hidden />
          <div>
            <h2>Price Trends Analysis</h2>
            <p className="trends-subtitle">Track price movements and volatility across products</p>
          </div>
        </div>
        <div className="trends-stats-badge">
          <span className="badge-item increasing">
            <span className="badge-label">Increasing</span>
            <span className="badge-value">{increasingTrends.length}</span>
          </span>
          <span className="badge-item decreasing">
            <span className="badge-label">Decreasing</span>
            <span className="badge-value">{decreasingTrends.length}</span>
          </span>
          <span className="badge-item stable">
            <span className="badge-label">Stable</span>
            <span className="badge-value">{stableTrends.length}</span>
          </span>
        </div>
      </div>

      <div className="trends-summary">
        <div className="summary-info">
          <span className="info-icon"><FaCalendarAlt aria-hidden /></span>
          <span>
            Date Range: {new Date(data.dateRange.start).toLocaleDateString()} -{' '}
            {new Date(data.dateRange.end).toLocaleDateString()}
          </span>
        </div>
        <div className="summary-info">
          <span className="info-icon"><FaChartBar aria-hidden /></span>
          <span>Total Products Analyzed: {data.trends.length}</span>
        </div>
      </div>

      <div className="trends-chart enhanced">
        <div className="chart-title-section">
          <h3>
            <FaChartArea className="chart-inline-icon" aria-hidden />
            Top Price Changes
          </h3>
          <div className="chart-info">
            <span className="info-item">Showing top {chartData.length} products</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={120}
              stroke="var(--text-secondary)"
              style={{ fontSize: '11px' }}
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <YAxis
              stroke="var(--text-secondary)"
              style={{ fontSize: '12px' }}
              tick={{ fill: 'var(--text-secondary)' }}
              label={{
                value: 'Price Change (%)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: 'var(--text-secondary)' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="square" />
            <Bar dataKey="change" name="Price Change %" radius={[8, 8, 0, 0]}>
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.trend)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="trends-grid">
        {data.trends.slice(0, 24).map((trend: any) => (
          <div key={trend.productId} className={`trend-card enhanced trend-${trend.trend}`}>
            <div className="trend-header">
              <div className="trend-icon-wrapper">
                <span className={`trend-icon ${trend.trend}`}>{trendIcon(trend.trend)}</span>
              </div>
              <div className="trend-title-section">
                <h3>{trend.productName}</h3>
                <span className={`trend-badge ${trend.trend}`}>
                  {trend.trend === 'increasing' ? 'Increasing' : trend.trend === 'decreasing' ? 'Decreasing' : 'Stable'}
                </span>
              </div>
            </div>
            <div className="trend-details">
              <div className="trend-stat-row">
                <div className="trend-stat">
                  <span className="label">First Price</span>
                  <span className="value">Rs. {trend.firstPrice.toFixed(2)}</span>
                </div>
                <div className="trend-stat">
                  <span className="label">Last Price</span>
                  <span className="value">Rs. {trend.lastPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="trend-stat-row">
                <div className="trend-stat highlight">
                  <span className="label">Change</span>
                  <span className={`value ${trend.priceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                    {trend.priceChangePercent >= 0 ? '+' : ''}
                    {trend.priceChangePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="trend-stat">
                  <span className="label">Volatility</span>
                  <span className="value">{trend.volatility.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendsPanel;
