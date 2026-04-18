import { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { cssVar } from '../utils/cssVariables';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SeasonalPanel.css';

interface SeasonalPanelProps {
  productId?: number;
}

const SeasonalPanel = ({ productId }: SeasonalPanelProps) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const { theme } = useTheme();

  const lineColors = useMemo(
    () =>
      ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'].map((v) => cssVar(v)),
    [theme],
  );

  const { data, isLoading } = useQuery(
    ['seasonal', selectedYear, productId],
    () => apiService.getSeasonalAnalysis({ year: selectedYear, productId }),
    { enabled: true }
  );

  if (isLoading) {
    return (
      <div className="seasonal-panel">
        <div className="loading">Loading seasonal analysis...</div>
      </div>
    );
  }

  if (!data || !data.seasonal || data.seasonal.length === 0) {
    return (
      <div className="seasonal-panel">
        <div className="no-data">No seasonal data available</div>
      </div>
    );
  }

  // Group by product for chart
  const productGroups = new Map<number, any[]>();
  data.seasonal.forEach((item: any) => {
    if (!productGroups.has(item.productId)) {
      productGroups.set(item.productId, []);
    }
    productGroups.get(item.productId)!.push(item);
  });

  // Prepare chart data
  const chartData: any[] = [];
  for (let month = 1; month <= 12; month++) {
    const monthData: any = { month: new Date(selectedYear, month - 1, 1).toLocaleString('default', { month: 'short' }) };
    productGroups.forEach((items, _) => {
      const monthItem = items.find((item: any) => item.month === month);
      if (monthItem) {
        monthData[`${monthItem.productName}`] = monthItem.avgPrice;
      }
    });
    chartData.push(monthData);
  }

  const products = Array.from(productGroups.keys()).slice(0, 5); // Limit to 5 products for readability

  return (
    <div className="seasonal-panel">
      <div className="seasonal-header">
        <h2>Seasonal Analysis</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="year-selector"
        >
          {Array.from({ length: 5 }, (_, i) => currentYear - i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="seasonal-summary">
        <p>Year: {data.year}</p>
      </div>

      <div className="seasonal-chart">
        <h3>Monthly Price Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {products.map((productId, index) => {
              const productName = data.seasonal.find((item: any) => item.productId === productId)?.productName;
              return (
                <Line
                  key={productId}
                  type="monotone"
                  dataKey={productName}
                  stroke={lineColors[index % lineColors.length]}
                  strokeWidth={2}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="seasonal-table">
        <h3>Monthly Breakdown</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Product</th>
                <th>Avg Price</th>
                <th>Min Price</th>
                <th>Max Price</th>
              </tr>
            </thead>
            <tbody>
              {data.seasonal.map((item: any, index: number) => (
                <tr key={`${item.month}-${item.productId}-${index}`}>
                  <td>{item.monthName}</td>
                  <td>{item.productName}</td>
                  <td>Rs. {item.avgPrice.toFixed(2)}</td>
                  <td>Rs. {item.minPrice.toFixed(2)}</td>
                  <td>Rs. {item.maxPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeasonalPanel;

