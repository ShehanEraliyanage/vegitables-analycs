import { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import DataRefreshIndicator from './DataRefreshIndicator';
import './CurrentPricesPanel.css';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'date-asc' | 'date-desc';
type FilterOption = 'all' | 'vegetable' | 'fruit' | 'rice';

interface CurrentPricesPanelProps {
  selectedProductId?: number;
  startDate?: string;
  endDate?: string;
}

const CurrentPricesPanel = ({ selectedProductId, startDate, endDate }: CurrentPricesPanelProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const { data: todayData, isLoading: todayLoading } = useQuery(
    'today-prices',
    () => apiService.getTodayPrices(),
    { 
      enabled: true,
      refetchInterval: 300000,
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

  const currentData = hasTodayData ? todayData : latestData;
  const isToday = hasTodayData;
  const displayDate = currentData?.date || 'N/A';

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!currentData?.data) return [];

    let filtered = [...currentData.data];

    // Apply product filter from FilterPanel
    if (selectedProductId) {
      filtered = filtered.filter((price: any) => price.productId === selectedProductId);
    }

    // Apply date range filter from FilterPanel
    if (startDate || endDate) {
      filtered = filtered.filter((price: any) => {
        const priceDate = new Date(price.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && priceDate < start) return false;
        if (end && priceDate > end) return false;
        return true;
      });
    }

    // Apply type filter (internal filter)
    if (filterBy !== 'all') {
      filtered = filtered.filter((price: any) => {
        const productType = price.product?.type?.toLowerCase();
        return productType === filterBy;
      });
    }

    // Apply sort
    filtered.sort((a: any, b: any) => {
      const avgPriceA = (Number(a.minPrice) + Number(a.maxPrice)) / 2;
      const avgPriceB = (Number(b.minPrice) + Number(b.maxPrice)) / 2;

      switch (sortBy) {
        case 'name-asc':
          return a.product?.name?.localeCompare(b.product?.name || '') || 0;
        case 'name-desc':
          return b.product?.name?.localeCompare(a.product?.name || '') || 0;
        case 'price-asc':
          return avgPriceA - avgPriceB;
        case 'price-desc':
          return avgPriceB - avgPriceA;
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [currentData, sortBy, filterBy, selectedProductId, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="current-prices-panel">
        <div className="current-prices-header">
          <div>
            <h2>💰 Current Market Prices</h2>
            <p className="current-prices-subtitle">Latest available prices</p>
          </div>
        </div>
        <LoadingSkeleton type="card" count={4} />
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

  const handleCardClick = (priceId: number) => {
    setSelectedCard(selectedCard === priceId ? null : priceId);
  };

  const getPriceRangePercentage = (minPrice: number, maxPrice: number, avgPrice: number) => {
    if (maxPrice === minPrice) return { min: 0, avg: 50, max: 100 };
    const range = maxPrice - minPrice;
    const minPos = 0;
    const avgPos = ((avgPrice - minPrice) / range) * 100;
    const maxPos = 100;
    return { min: minPos, avg: avgPos, max: maxPos };
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

      {/* Controls */}
      <div className="current-prices-controls">
        <div className="control-group">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="control-select"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="filter-select">Filter by:</label>
          <select 
            id="filter-select"
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            className="control-select"
          >
            <option value="all">All Types</option>
            <option value="vegetable">Vegetables</option>
            <option value="fruit">Fruits</option>
            <option value="rice">Rice</option>
          </select>
        </div>

        <div className="results-count">
          Showing {filteredAndSortedData.length} of {currentData.data.length} products
          {(selectedProductId || startDate || endDate) && (
            <span className="filter-active-indicator">
              {' '}• Filters active
            </span>
          )}
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="current-prices-grid">
        {filteredAndSortedData.map((price: any) => {
          const minPrice = Number(price.minPrice);
          const maxPrice = Number(price.maxPrice);
          const avgPrice = (minPrice + maxPrice) / 2;
          const priceRange = maxPrice - minPrice;
          const rangePercentages = getPriceRangePercentage(minPrice, maxPrice, avgPrice);
          const isSelected = selectedCard === price.id;

          return (
            <div 
              key={price.id} 
              className={`price-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleCardClick(price.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(price.id);
                }
              }}
            >
              <div className="price-card-header">
                <div className="product-info">
                  <h3 className="product-name">{price.product?.name || 'Unknown'}</h3>
                  <span className="product-type">{price.product?.type || 'N/A'}</span>
                </div>
                <div className="price-date">
                  {new Date(price.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>

              <div className="price-card-content">
                <div className="price-display">
                  <div className="price-item price-min">
                    <div className="price-label">
                      <span className="price-icon">⬇️</span>
                      <span>Min</span>
                    </div>
                    <div className="price-value">Rs. {minPrice.toFixed(2)}</div>
                  </div>

                  <div className="price-item price-avg">
                    <div className="price-label">
                      <span className="price-icon">💰</span>
                      <span>Average</span>
                    </div>
                    <div className="price-value">Rs. {avgPrice.toFixed(2)}</div>
                  </div>

                  <div className="price-item price-max">
                    <div className="price-label">
                      <span className="price-icon">⬆️</span>
                      <span>Max</span>
                    </div>
                    <div className="price-value">Rs. {maxPrice.toFixed(2)}</div>
                  </div>
                </div>

                {/* Enhanced Price Range Visualization */}
                <div className="price-range-visualization">
                  <div className="range-header">
                    <span className="range-label">Price Range</span>
                    <span className="range-value">Rs. {priceRange.toFixed(2)}</span>
                  </div>
                  <div className="range-bar-container">
                    <div className="range-bar">
                      <div 
                        className="range-segment range-min" 
                        style={{ width: `${rangePercentages.avg}%` }}
                      />
                      <div 
                        className="range-segment range-max" 
                        style={{ 
                          width: `${100 - rangePercentages.avg}%`,
                          left: `${rangePercentages.avg}%`
                        }}
                      />
                    </div>
                    <div className="range-markers">
                      <div 
                        className="range-marker marker-min" 
                        style={{ left: '0%' }}
                        title={`Min: Rs. ${minPrice.toFixed(2)}`}
                      />
                      <div 
                        className="range-marker marker-avg" 
                        style={{ left: `${rangePercentages.avg}%` }}
                        title={`Avg: Rs. ${avgPrice.toFixed(2)}`}
                      />
                      <div 
                        className="range-marker marker-max" 
                        style={{ left: '100%' }}
                        title={`Max: Rs. ${maxPrice.toFixed(2)}`}
                      />
                    </div>
                  </div>
                  <div className="range-labels">
                    <span className="range-label-min">Rs. {minPrice.toFixed(2)}</span>
                    <span className="range-label-max">Rs. {maxPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="price-card-details">
                  <div className="detail-row">
                    <span className="detail-label">Price Spread:</span>
                    <span className="detail-value">{((priceRange / avgPrice) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Product ID:</span>
                    <span className="detail-value">{price.productId}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAndSortedData.length === 0 && (
        <div className="no-results">
          <p>No products found matching your filters.</p>
        </div>
      )}

      <DataRefreshIndicator 
        lastUpdated={new Date(displayDate)} 
        isRefreshing={isLoading}
      />
    </div>
  );
};

export default CurrentPricesPanel;
