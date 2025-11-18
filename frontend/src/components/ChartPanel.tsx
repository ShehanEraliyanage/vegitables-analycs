import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AnalyticsResponse } from '../services/api';
import './ChartPanel.css';

interface ChartPanelProps {
  analytics: AnalyticsResponse | undefined;
  loading: boolean;
  timePeriod: string;
}

const ChartPanel = ({ analytics, loading, timePeriod }: ChartPanelProps) => {
  if (loading) {
    return (
      <div className="chart-panel">
        <div className="loading">Loading charts...</div>
      </div>
    );
  }

  if (!analytics || !analytics.data || analytics.data.length === 0) {
    return (
      <div className="chart-panel">
        <div className="no-data">No data available for the selected period</div>
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
    return {
      period: group.period,
      avgMinPrice: Math.round(avgMin * 100) / 100,
      avgMaxPrice: Math.round(avgMax * 100) / 100,
    };
  });

  // Prepare data for bar chart (top products by average price)
  const productAverages = analytics.data.reduce((acc: any, item) => {
    if (!acc[item.productId]) {
      acc[item.productId] = {
        product: item.product,
        prices: [],
      };
    }
    acc[item.productId].prices.push(item.avgMaxPrice);
    return acc;
  }, {});

  const barChartData = Object.values(productAverages)
    .map((item: any) => ({
      product: item.product,
      avgPrice: item.prices.reduce((sum: number, p: number) => sum + p, 0) / item.prices.length,
    }))
    .sort((a: any, b: any) => b.avgPrice - a.avgPrice)
    .slice(0, 10);

  return (
    <div className="chart-panel">
      <h2>Price Analysis - {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}</h2>

      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>Price Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgMinPrice"
                stroke="#8884d8"
                name="Average Min Price"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="avgMaxPrice"
                stroke="#82ca9d"
                name="Average Max Price"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h3>Top Products by Average Price</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgPrice" fill="#8884d8" name="Average Price (Rs.)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-summary">
        <h3>Summary</h3>
        <p>Total Products: {analytics.summary.totalProducts}</p>
        <p>
          Date Range: {new Date(analytics.summary.dateRange.start).toLocaleDateString()} -{' '}
          {new Date(analytics.summary.dateRange.end).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ChartPanel;

