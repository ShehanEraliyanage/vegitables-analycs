import { useState } from 'react';
import { useQuery } from 'react-query';
import { apiService, Product } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ComparisonPanel.css';

interface ComparisonPanelProps {
  products: Product[];
  startDate?: string;
  endDate?: string;
}

const ComparisonPanel = ({ products, startDate, endDate }: ComparisonPanelProps) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const { data, isLoading, refetch } = useQuery(
    ['compare', selectedProducts.join(','), startDate, endDate],
    () => apiService.compareProducts({
      productIds: selectedProducts,
      startDate,
      endDate,
    }),
    { enabled: selectedProducts.length > 0 && selectedProducts.length <= 5 }
  );

  const handleProductToggle = (productId: number) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else if (prev.length < 5) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  const handleCompare = () => {
    if (selectedProducts.length > 0) {
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="comparison-panel">
        <div className="loading">Loading comparison...</div>
      </div>
    );
  }

  const chartData = data?.comparisons?.map((comp: any) => ({
    name: comp.productName.length > 15 ? comp.productName.substring(0, 15) + '...' : comp.productName,
    avgPrice: comp.avgPrice,
    minPrice: comp.minPrice,
    maxPrice: comp.maxPrice,
  })) || [];

  return (
    <div className="comparison-panel">
      <h2>Product Comparison</h2>
      <p className="comparison-description">Select up to 5 products to compare</p>

      <div className="product-selector">
        {products.map(product => (
          <label key={product.id} className="product-checkbox">
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => handleProductToggle(product.id)}
              disabled={!selectedProducts.includes(product.id) && selectedProducts.length >= 5}
            />
            <span>{product.name}</span>
          </label>
        ))}
      </div>

      {selectedProducts.length > 0 && (
        <button className="compare-button" onClick={handleCompare}>
          Compare Selected Products ({selectedProducts.length})
        </button>
      )}

      {data && data.comparisons && data.comparisons.length > 0 && (
        <>
          <div className="comparison-summary">
            <p>
              Date Range: {new Date(data.dateRange.start).toLocaleDateString()} -{' '}
              {new Date(data.dateRange.end).toLocaleDateString()}
            </p>
          </div>

          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Avg Price</th>
                  <th>Min Price</th>
                  <th>Max Price</th>
                  <th>Price Change</th>
                  <th>Volatility</th>
                </tr>
              </thead>
              <tbody>
                {data.comparisons.map((comp: any) => (
                  <tr key={comp.productId}>
                    <td>{comp.productName}</td>
                    <td className="type-cell">{comp.productType}</td>
                    <td>Rs. {comp.avgPrice.toFixed(2)}</td>
                    <td>Rs. {comp.minPrice.toFixed(2)}</td>
                    <td>Rs. {comp.maxPrice.toFixed(2)}</td>
                    <td className={comp.priceChangePercent >= 0 ? 'positive' : 'negative'}>
                      {comp.priceChangePercent >= 0 ? '+' : ''}{comp.priceChangePercent.toFixed(2)}%
                    </td>
                    <td>{comp.volatility.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="comparison-chart">
            <h3>Price Comparison Chart</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgPrice" fill="#8884d8" name="Average Price (Rs.)" />
                <Bar dataKey="minPrice" fill="#82ca9d" name="Min Price (Rs.)" />
                <Bar dataKey="maxPrice" fill="#ffc658" name="Max Price (Rs.)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {selectedProducts.length === 0 && (
        <div className="no-selection">Please select products to compare</div>
      )}
    </div>
  );
};

export default ComparisonPanel;

