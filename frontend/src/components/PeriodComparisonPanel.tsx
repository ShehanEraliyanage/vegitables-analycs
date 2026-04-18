import { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { FaFileExcel, FaTable, FaColumns } from 'react-icons/fa';
import { apiService } from '../services/api';
import * as XLSX from 'xlsx';
import { showSuccessToast, showErrorToast } from './ToastNotification';
import './PeriodComparisonPanel.css';

type PeriodType = 'day' | 'week' | 'month' | 'three-month' | 'six-month' | 'year';
type ViewMode = 'preset' | 'monthly';

interface PeriodComparisonPanelProps {
  selectedProductId?: number;
}

type TrendFilter = 'all' | 'increasing' | 'decreasing' | 'stable' | 'new';
type TrendSort = 'default' | 'increasing-first' | 'decreasing-first';

interface MonthlyMatrixMonth {
  key: string;
  label: string;
}

interface MonthlyMatrixProduct {
  productId: number;
  productName: string;
  productType: string;
  monthlyAverages: { monthKey: string; avgPrice: number | null }[];
}

interface MonthlyMatrixData {
  startDate: string;
  endDate: string;
  months: MonthlyMatrixMonth[];
  products: MonthlyMatrixProduct[];
}

function defaultMonthRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

const PeriodComparisonPanel = ({ selectedProductId }: PeriodComparisonPanelProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('preset');
  const defRange = useMemo(() => defaultMonthRange(), []);
  const [rangeStart, setRangeStart] = useState(defRange.start);
  const [rangeEnd, setRangeEnd] = useState(defRange.end);

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('day');
  const [trendFilter, setTrendFilter] = useState<TrendFilter>('all');
  const [trendSort, setTrendSort] = useState<TrendSort>('default');

  const { data, isLoading, error } = useQuery(
    ['period-comparison', selectedPeriod, selectedProductId],
    () =>
      apiService.getPeriodComparison({
        period: selectedPeriod,
        productId: selectedProductId,
      }),
    {
      enabled: viewMode === 'preset',
      refetchOnWindowFocus: false,
    },
  );

  const rangeInvalid = rangeStart && rangeEnd && rangeStart > rangeEnd;

  const { data: matrixData, isLoading: matrixLoading, error: matrixError } = useQuery<MonthlyMatrixData>(
    ['monthly-average-matrix', rangeStart, rangeEnd, selectedProductId],
    () =>
      apiService.getMonthlyAverageMatrix({
        startDate: rangeStart,
        endDate: rangeEnd,
        productId: selectedProductId,
      }) as Promise<MonthlyMatrixData>,
    {
      enabled: viewMode === 'monthly' && !!rangeStart && !!rangeEnd && !rangeInvalid,
      refetchOnWindowFocus: false,
    },
  );

  const getFilteredAndSortedComparisons = () => {
    if (!data || !data.comparisons) return [];

    let filtered = [...data.comparisons];

    if (trendFilter !== 'all') {
      filtered = filtered.filter((comp: any) => comp.trend === trendFilter);
    }

    if (trendSort === 'increasing-first') {
      filtered.sort((a: any, b: any) => {
        const trendOrder: { [key: string]: number } = {
          increasing: 1,
          decreasing: 2,
          stable: 3,
          new: 4,
        };
        return (trendOrder[a.trend] || 99) - (trendOrder[b.trend] || 99);
      });
    } else if (trendSort === 'decreasing-first') {
      filtered.sort((a: any, b: any) => {
        const trendOrder: { [key: string]: number } = {
          decreasing: 1,
          increasing: 2,
          stable: 3,
          new: 4,
        };
        return (trendOrder[a.trend] || 99) - (trendOrder[b.trend] || 99);
      });
    }

    return filtered;
  };

  const exportToExcel = () => {
    const comparisonsToExport = getFilteredAndSortedComparisons();

    if (!data || !comparisonsToExport || comparisonsToExport.length === 0) {
      showErrorToast('No data available to export');
      return;
    }

    try {
      const excelData = comparisonsToExport.map((comp: any) => ({
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
        Trend:
          comp.trend === 'increasing'
            ? 'Increasing'
            : comp.trend === 'decreasing'
              ? 'Decreasing'
              : comp.trend === 'new'
                ? 'New Product'
                : 'Stable',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = [
        { wch: 25 },
        { wch: 15 },
        { wch: 28 },
        { wch: 28 },
        { wch: 28 },
        { wch: 28 },
        { wch: 28 },
        { wch: 28 },
        { wch: 20 },
        { wch: 18 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
      ];
      ws['!cols'] = colWidths;

      const metadata = [
        ['Period Comparison Report'],
        [''],
        ['Comparison Type:', data.comparisonType],
        [
          'Previous Period:',
          `${data.previousPeriod.label} (${data.previousPeriod.start} to ${data.previousPeriod.end})`,
        ],
        [
          'Current Period:',
          `${data.currentPeriod.label} (${data.currentPeriod.start} to ${data.currentPeriod.end})`,
        ],
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

      XLSX.utils.book_append_sheet(wb, metadataWs, 'Metadata');
      XLSX.utils.book_append_sheet(wb, ws, 'Comparison Data');

      const filename = `period-comparison-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.xlsx`;

      XLSX.writeFile(wb, filename);
      showSuccessToast('Excel file exported successfully!');
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      showErrorToast('Failed to export Excel file');
    }
  };

  const exportMatrixToExcel = () => {
    if (!matrixData || !matrixData.products?.length) {
      showErrorToast('No monthly data to export');
      return;
    }

    try {
      const header = [
        'Product',
        'Type',
        ...matrixData.months.map((m: MonthlyMatrixMonth) => m.label),
      ];
      const rows = matrixData.products.map((p: MonthlyMatrixProduct) => [
        p.productName,
        p.productType,
        ...p.monthlyAverages.map((c: { avgPrice: number | null }) =>
          c.avgPrice != null ? Number(c.avgPrice.toFixed(2)) : '',
        ),
      ]);
      const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
      ws['!cols'] = [
        { wch: 28 },
        { wch: 14 },
        ...matrixData.months.map(() => ({ wch: 12 })),
      ];

      const meta = [
        ['Monthly average price matrix (Rs.)'],
        [''],
        ['Range:', `${matrixData.startDate} to ${matrixData.endDate}`],
        ['Note:', 'Each cell is the average of daily mid-prices ((min+max)/2) for that product in that month.'],
        [''],
        ['Export:', new Date().toLocaleString()],
      ];
      const metaWs = XLSX.utils.aoa_to_sheet(meta);
      metaWs['!cols'] = [{ wch: 12 }, { wch: 70 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, metaWs, 'Info');
      XLSX.utils.book_append_sheet(wb, ws, 'Monthly Averages');

      const filename = `monthly-price-matrix-${matrixData.startDate}_${matrixData.endDate}.xlsx`;
      XLSX.writeFile(wb, filename);
      showSuccessToast('Monthly matrix exported');
    } catch (e) {
      console.error(e);
      showErrorToast('Export failed');
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
        return <span className="trend-icon new">New</span>;
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

  const filteredComparisons = getFilteredAndSortedComparisons();

  return (
    <div className="period-comparison-panel">
      <div className="panel-header">
        <h2>Period Comparison</h2>
        <p className="panel-description">
          Compare two equivalent periods, or pick a date range for an Excel-style monthly average price per
          product.
        </p>
      </div>

      <div className="view-mode-toggle" role="tablist" aria-label="Comparison mode">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'preset'}
          className={`view-mode-btn ${viewMode === 'preset' ? 'active' : ''}`}
          onClick={() => setViewMode('preset')}
        >
          <FaColumns aria-hidden />
          Two periods
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'monthly'}
          className={`view-mode-btn ${viewMode === 'monthly' ? 'active' : ''}`}
          onClick={() => setViewMode('monthly')}
        >
          <FaTable aria-hidden />
          Monthly table
        </button>
      </div>

      {viewMode === 'monthly' && (
        <div className="monthly-range-panel">
          <div className="monthly-range-fields">
            <label className="monthly-range-label">
              From
              <input
                type="date"
                value={rangeStart}
                max={rangeEnd}
                onChange={(e) => setRangeStart(e.target.value)}
                className="monthly-date-input"
              />
            </label>
            <label className="monthly-range-label">
              To
              <input
                type="date"
                value={rangeEnd}
                min={rangeStart}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="monthly-date-input"
              />
            </label>
            <button
              type="button"
              className="reset-range-btn"
              onClick={() => {
                const r = defaultMonthRange();
                setRangeStart(r.start);
                setRangeEnd(r.end);
              }}
            >
              Reset range
            </button>
          </div>
          <p className="monthly-range-hint">
            Each column is a calendar month. Values are average mid-price (min+max)/2 for that month. Range
            limited to 36 months.
          </p>
          {rangeInvalid && (
            <p className="monthly-range-error" role="alert">
              Start date must be on or before end date.
            </p>
          )}
          {matrixLoading && <div className="loading-inline">Loading monthly data…</div>}
          {matrixError != null ? (
            <div className="error">Could not load monthly matrix. Check the date range and try again.</div>
          ) : null}
          {matrixData && !matrixLoading && !rangeInvalid && (
            <>
              <div className="export-section">
                <button type="button" className="export-excel-button" onClick={exportMatrixToExcel}>
                  <FaFileExcel className="export-excel-icon" aria-hidden />
                  Export monthly table to Excel
                </button>
                <span className="matrix-meta">
                  {matrixData.startDate} → {matrixData.endDate} · {matrixData.products.length} products ×{' '}
                  {matrixData.months.length} months
                </span>
              </div>
              {matrixData.products.length === 0 ? (
                <div className="no-data">No price data in this range for the current filters.</div>
              ) : (
                <div className="monthly-matrix-scroll">
                  <table className="monthly-matrix-table">
                    <thead>
                      <tr>
                        <th className="sticky-matrix sticky-name">Product</th>
                        <th className="sticky-matrix sticky-type">Type</th>
                        {matrixData.months.map((m: MonthlyMatrixMonth) => (
                          <th key={m.key} title={m.key}>
                            {m.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrixData.products.map((row: MonthlyMatrixProduct) => (
                        <tr key={row.productId}>
                          <td className="sticky-matrix sticky-name product-name">{row.productName}</td>
                          <td className="sticky-matrix sticky-type product-type">{row.productType}</td>
                          {row.monthlyAverages.map((cell: { monthKey: string; avgPrice: number | null }) => (
                            <td key={cell.monthKey} className="matrix-cell">
                              {cell.avgPrice != null ? formatPrice(cell.avgPrice) : '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {viewMode === 'preset' && isLoading && (
        <div className="loading preset-loading">Loading period comparison...</div>
      )}

      {viewMode === 'preset' && error && (
        <div className="error">Error loading comparison data. Please try again.</div>
      )}

      {viewMode === 'preset' && !isLoading && !error && data && (
        <>
          <div className="period-selector">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`period-button ${selectedPeriod === option.value ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

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

          <div className="trend-controls">
            <div className="trend-filter-group">
              <label htmlFor="trend-filter" className="filter-label">
                Filter by Trend:
              </label>
              <select
                id="trend-filter"
                className="trend-filter-select"
                value={trendFilter}
                onChange={(e) => setTrendFilter(e.target.value as TrendFilter)}
              >
                <option value="all">All Trends</option>
                <option value="increasing">↑ Increasing</option>
                <option value="decreasing">↓ Decreasing</option>
                <option value="stable">→ Stable</option>
                <option value="new">New</option>
              </select>
            </div>

            <div className="trend-sort-group">
              <label htmlFor="trend-sort" className="filter-label">
                Sort by Trend:
              </label>
              <select
                id="trend-sort"
                className="trend-sort-select"
                value={trendSort}
                onChange={(e) => setTrendSort(e.target.value as TrendSort)}
              >
                <option value="default">Default (by change %)</option>
                <option value="increasing-first">Increasing First</option>
                <option value="decreasing-first">Decreasing First</option>
              </select>
            </div>
          </div>

          <div className="export-section">
            <button type="button" className="export-excel-button" onClick={exportToExcel}>
              <FaFileExcel className="export-excel-icon" aria-hidden />
              Export to Excel
            </button>
          </div>

          {filteredComparisons && filteredComparisons.length > 0 ? (
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
                  {filteredComparisons.map((comp: any, index: number) => (
                    <tr key={`${comp.productId}-${index}`}>
                      <td className="product-name">{comp.productName}</td>
                      <td className="product-type">{comp.productType}</td>
                      <td className="previous-price">
                        {comp.hasPreviousData ? formatPrice(comp.previousAvgPrice) : 'N/A'}
                      </td>
                      <td className="current-price">{formatPrice(comp.currentAvgPrice)}</td>
                      <td
                        className={`price-change ${comp.priceChangePercent >= 0 ? 'increased' : 'decreased'}`}
                      >
                        {comp.hasPreviousData ? formatPrice(comp.priceChange) : 'N/A'}
                      </td>
                      <td
                        className={`price-change-percent ${
                          comp.priceChangePercent >= 0 ? 'increased' : 'decreased'
                        }`}
                      >
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
              {data.comparisons && data.comparisons.length > 0
                ? 'No products match the selected trend filter.'
                : 'No comparison data available for the selected period.'}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PeriodComparisonPanel;
