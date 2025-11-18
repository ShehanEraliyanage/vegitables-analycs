import { useState, useRef, useEffect } from 'react';
import SmartTooltip from './SmartTooltip';
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
  const [productSearch, setProductSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.type.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredProducts.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredProducts[highlightedIndex]) {
          handleProductSelect(filteredProducts[highlightedIndex].id, filteredProducts[highlightedIndex].name);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleProductSelect = (productId: number, productName: string) => {
    onProductChange(productId);
    setProductSearch(productName);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductSearch(value);
    setShowSuggestions(value.length > 0);
    setHighlightedIndex(-1);
    
    // Clear selection if search is cleared
    if (!value) {
      onProductChange(undefined);
    }
  };

  const handleClearFilters = () => {
    onProductChange(undefined);
    setProductSearch('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>🔍 Filters & Search</h3>
        {(selectedProductId || productSearch) && (
          <button className="clear-filters-button" onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      <div className="filter-grid">
        <SmartTooltip content="Select time period for analysis">
          <div className="filter-group">
            <label htmlFor="timePeriod">
              <span>📅 Time Period</span>
            </label>
            <select
              id="timePeriod"
              value={timePeriod}
              onChange={(e) => onTimePeriodChange(e.target.value as any)}
              className="filter-select"
            >
              <option value="weekly">📆 Weekly</option>
              <option value="monthly">📅 Monthly</option>
              <option value="quarterly">📊 Quarterly</option>
              <option value="six-month">📈 6 Months</option>
              <option value="annual">📆 Annual</option>
            </select>
          </div>
        </SmartTooltip>

        <SmartTooltip content="Search and filter by product">
          <div className="filter-group filter-group-product">
            <label htmlFor="product">
              <span>📦 Product</span>
            </label>
            <div className="product-select-wrapper">
              <div className="product-search-container">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={handleSearchChange}
                  onFocus={() => productSearch && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  className="product-search-input"
                  disabled={productsLoading}
                />
                {showSuggestions && productSearch && filteredProducts.length > 0 && (
                  <div ref={suggestionsRef} className="product-suggestions">
                    {filteredProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className={`suggestion-item ${
                          index === highlightedIndex ? 'highlighted' : ''
                        }`}
                        onClick={() => handleProductSelect(product.id, product.name)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        <span className="suggestion-name">{product.name}</span>
                        <span className="suggestion-type">{product.type}</span>
                      </div>
                    ))}
                  </div>
                )}
                {productSearch && filteredProducts.length === 0 && (
                  <div className="no-products-found">
                    No products found matching "{productSearch}"
                  </div>
                )}
              </div>
              <select
                id="product"
                value={selectedProductId || ''}
                onChange={(e) => {
                  const productId = e.target.value ? +e.target.value : undefined;
                  onProductChange(productId);
                  if (productId) {
                    const selectedProduct = products.find(p => p.id === productId);
                    if (selectedProduct) {
                      setProductSearch(selectedProduct.name);
                    }
                  } else {
                    setProductSearch('');
                  }
                  setShowSuggestions(false);
                  setHighlightedIndex(-1);
                }}
                className="filter-select"
                disabled={productsLoading}
              >
                <option value="">All Products ({products.length})</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SmartTooltip>

        <SmartTooltip content="Start date for the analysis period">
          <div className="filter-group">
            <label htmlFor="startDate">
              <span>📅 Start Date</span>
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                const selectedDate = e.target.value;
                if (endDate && selectedDate > endDate) {
                  // Auto-adjust end date if start date is after end date
                  onEndDateChange(selectedDate);
                }
                onStartDateChange(selectedDate);
              }}
              className="filter-input"
              max={endDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </SmartTooltip>

        <SmartTooltip content="End date for the analysis period">
          <div className="filter-group">
            <label htmlFor="endDate">
              <span>📅 End Date</span>
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => {
                const selectedDate = e.target.value;
                if (startDate && selectedDate < startDate) {
                  // Auto-adjust start date if end date is before start date
                  onStartDateChange(selectedDate);
                }
                onEndDateChange(selectedDate);
              }}
              className="filter-input"
              min={startDate || undefined}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </SmartTooltip>
      </div>
    </div>
  );
};

export default FilterPanel;

