import { useState } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import * as XLSX from 'xlsx';
import { showSuccessToast, showErrorToast } from './ToastNotification';
import './PeriodComparisonPanel.css';

type PeriodType = 'day' | 'week' | 'month' | 'three-month' | 'six-month' | 'year';

interface PeriodComparisonPanelProps {
  selectedProductId?: number;
}

const PeriodComparisonPanel = ({ selectedProductId }: PeriodComparisonPanelProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('day');

  const { data, isLoading, error } = useQuery(
    ['period-comparison', selectedPeriod, selectedProductId],
    () => apiService.getPeriodComparison({
      period: selectedPeriod,
      productId: selectedProductId,
    }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
    },
  );

  const exportToExcel = () => {
    if (!data || !data.comparisons || data.comparisons.length === 0) {
      showErrorToast('No data available to export');
      return;
    }

    try {
      // Prepare data for Excel
      const excelData = data.comparisons.map((comp: any) => ({
        'Product Name': comp.productName,
        'Product Type': comp.productType,
        'Previous Period Avg Price (Rs.)': comp.hasPreviousData ? comp.previousAvgPrice : 'N/A',
        'Previous Period Avg Min (Rs.)': comp.hasPreviousData ? comp.previousAvgMinPrice : 'N/A',
        'Previous Period Avg Max (Rs.)': comp.hasPreviousData ? comp.previousAvgMaxPrice : 'N/A',
        'Current Period Avg Price (Rs.)': comp.currentAvgPrice,
        'Current Period Avg Min (Rs.)': comp.currentAvgMinPrice,
        'Current Period Avg Max (Rs.)': comp.currentAvgMaxPrice,
        'Price Change (Rs.)': comp.hasPreviousData ? comp.priceChange : 'N/A',
        'Price Change (%)': comp.hasPreviousData ? comp.priceChangePercent : 'N/A',
        'Previous Volatility': comp.hasPreviousData ? comp.previousVolatility : 'N/A',
        'Current Volatility': comp.currentVolatility,
        'Trend': comp.trend === 'increasing' ? '↑ Increasing' : comp.trend === 'decreasing' ? '↓ Decreasing' : comp.trend === 'new' ? 'New Product' : '→ Stable',
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 25 }, // Product Name
        { wch: 15 }, // Product Type
        { wch: 28 }, // Previous Period Avg Price
        { wch: 28 }, // Previous Period Avg Min
        { wch: 28 }, // Previous Period Avg Max
        { wch: 28 }, // Current Period Avg Price
        { wch: 28 }, // Current Period Avg Min
        { wch: 28 }, // Current Period Avg Max
        { wch: 20 }, // Price Change
        { wch: 18 }, // Price Change %
        { wch: 20 }, // Previous Volatility
        { wch: 20 }, // Current Volatility
        { wch: 15 }, // Trend
      ];
      ws['!cols'] = colWidths;

      // Add metadata sheet
      const metadata = [
        ['Period Comparison Report'],
        [''],
        ['Comparison Type:', data.comparisonType],
        ['Previous Period:', `${data.previousPeriod.label} (${data.previousPeriod.start} to ${data.previousPeriod.end})`],
        ['Current Period:', `${data.currentPeriod.label} (${data.currentPeriod.start} to ${data.currentPeriod.end})`],
        [''],
        ['Summary'],
        ['Total Products:', data.summary.totalProducts],
        ['Products Increased:', data.summary.productsIncreased],
        ['Products Decreased:', data.summary.productsDecreased],
        ['Products Stable:', data.summary.productsStable],
        [''],
        ['Export Date:', new Date().toLocaleString()],
      ];
      const metadataWs = XLSX.utils.aoa_to_sheet(metadata);
      metadataWs['!cols'] = [{ wch: 25 }, { wch: 50 }];

      // Add sheets to workbook
      XLSX.utils.book_append_sheet(wb, metadataWs, 'Metadata');
      XLSX.utils.book_append_sheet(wb, ws, 'Comparison Data');

      // Generate filename
      const filename = `period-comparison-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
      showSuccessToast('Excel file exported successfully!');
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      showErrorToast('Failed to export Excel file');
    }
  };

  const formatPrice = (price: number | string) => {
    if (price === 'N/A' || price === null || price === undefined) return 'N/A';
    return `Rs. ${Number(price).toFixed(2)}`;
  };

  const formatPercent = (percent: number | string) => {
    if (percent === 'N/A' || percent === null || percent === undefined) return 'N/A';
    const num = Number(percent);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <span className="trend-icon increasing">↑</span>;
      case 'decreasing':
        return <span className="trend-icon decreasing">↓</span>;
      case 'new':
        return <span className="trend-icon new">🆕</span>;
      default:
        return <span className="trend-icon stable">→</span>;
    }
  };

  const periodOptions: { value: PeriodType; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'three-month', label: '3 Months' },
    { value: 'six-month', label: '6 Months' },
    { value: 'year', label: 'Year' },
  ];

  if (isLoading) {
    return (
      <div className="period-comparison-panel">
        <div className="loading">Loading period comparison...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="period-comparison-panel">
        <div className="error">Error loading comparison data. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="period-comparison-panel">
      <div className="panel-header">
        <h2>Period Comparison</h2>
        <p className="panel-description">
          Compare average prices between equivalent time periods to identify trends
        </p>
      </div>

      <div className="period-selector">
        {periodOptions.map((option) => (
          <button
            key={option.value}
            className={`period-button ${selectedPeriod === option.value ? 'active' : ''}`}
            onClick={() => setSelectedPeriod(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {data && (
        <>
          <div className="period-info">
            <div className="period-box previous">
              <div className="period-label">{data.previousPeriod.label}</div>
              <div className="period-dates">
                {new Date(data.previousPeriod.start).toLocaleDateString()} -{' '}
                {new Date(data.previousPeriod.end).toLocaleDateString()}
              </div>
            </div>
            <div className="vs-divider">vs</div>
            <div className="period-box current">
              <div className="period-label">{data.currentPeriod.label}</div>
              <div className="period-dates">
                {new Date(data.currentPeriod.start).toLocaleDateString()} -{' '}
                {new Date(data.currentPeriod.end).toLocaleDateString()}
              </div>
            </div>
          </div>

          {data.summary && (
            <div className="comparison-summary">
              <div className="summary-item">
                <span className="summary-label">Total Products:</span>
                <span className="summary-value">{data.summary.totalProducts}</span>
              </div>
              <div className="summary-item increased">
                <span className="summary-label">Increased:</span>
                <span className="summary-value">{data.summary.productsIncreased}</span>
              </div>
              <div className="summary-item decreased">
                <span className="summary-label">Decreased:</span>
                <span className="summary-value">{data.summary.productsDecreased}</span>
              </div>
              <div className="summary-item stable">
                <span className="summary-label">Stable:</span>
                <span className="summary-value">{data.summary.productsStable}</span>
              </div>
            </div>
          )}

          <div className="export-section">
            <button className="export-excel-button" onClick={exportToExcel}>
              📊 Export to Excel
            </button>
          </div>

          {data.comparisons && data.comparisons.length > 0 ? (
            <div className="comparison-table-container">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Previous Avg</th>
                    <th>Current Avg</th>
                    <th>Change</th>
                    <th>Change %</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {data.comparisons.map((comp: any, index: number) => (
                    <tr key={`${comp.productId}-${index}`}>
                      <td className="product-name">{comp.productName}</td>
                      <td className="product-type">{comp.productType}</td>
                      <td className="previous-price">
                        {comp.hasPreviousData ? formatPrice(comp.previousAvgPrice) : 'N/A'}
                      </td>
                      <td className="current-price">{formatPrice(comp.currentAvgPrice)}</td>
                      <td className={`price-change ${comp.priceChangePercent >= 0 ? 'increased' : 'decreased'}`}>
                        {comp.hasPreviousData ? formatPrice(comp.priceChange) : 'N/A'}
                      </td>
                      <td className={`price-change-percent ${comp.priceChangePercent >= 0 ? 'increased' : 'decreased'}`}>
                        {comp.hasPreviousData ? formatPercent(comp.priceChangePercent) : 'N/A'}
                      </td>
                      <td className="trend-cell">
                        {getTrendIcon(comp.trend)}
                        <span className="trend-text">{comp.trend}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              No comparison data available for the selected period.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PeriodComparisonPanel;

