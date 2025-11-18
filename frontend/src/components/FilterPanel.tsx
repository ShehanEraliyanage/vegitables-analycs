import './FilterPanel.css';

interface Product {
  id: number;
  name: string;
  type: string;
}

interface FilterPanelProps {
  products: Product[];
  productsLoading: boolean;
  timePeriod: string;
  onTimePeriodChange: (period: 'weekly' | 'monthly' | 'quarterly' | 'six-month' | 'annual') => void;
  selectedProductId: number | undefined;
  onProductChange: (productId: number | undefined) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
}

const FilterPanel = ({
  products,
  productsLoading,
  timePeriod,
  onTimePeriodChange,
  selectedProductId,
  onProductChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: FilterPanelProps) => {
  return (
    <div className="filter-panel">
      <div className="filter-group">
        <label htmlFor="timePeriod">Time Period</label>
        <select
          id="timePeriod"
          value={timePeriod}
          onChange={(e) => onTimePeriodChange(e.target.value as any)}
          className="filter-select"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="six-month">6 Months</option>
          <option value="annual">Annual</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="product">Product</label>
        <select
          id="product"
          value={selectedProductId || ''}
          onChange={(e) => onProductChange(e.target.value ? +e.target.value : undefined)}
          className="filter-select"
          disabled={productsLoading}
        >
          <option value="">All Products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.type})
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="startDate">Start Date</label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="endDate">End Date</label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="filter-input"
        />
      </div>
    </div>
  );
};

export default FilterPanel;

