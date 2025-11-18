import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import './LastPriceCard.css';

interface LastPriceCardProps {
  productId: number | undefined;
  productName?: string;
}

const LastPriceCard = ({ productId, productName }: LastPriceCardProps) => {
  const { data, isLoading } = useQuery(
    ['last-price', productId],
    () => apiService.getLastPriceForProduct(productId!),
    { 
      enabled: !!productId,
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  if (!productId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="last-price-card">
        <div className="loading-container">
          <div className="loading-spinner-small"></div>
          <span>Loading last price...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.data) {
    return (
      <div className="last-price-card">
        <div className="no-price-data">
          <span className="no-data-icon">📊</span>
          <div>
            <div className="no-data-title">No Price Data Available</div>
            <div className="no-data-text">No price records found for this product</div>
          </div>
        </div>
      </div>
    );
  }

  const price = data.data;
  const minPrice = Number(price.minPrice);
  const maxPrice = Number(price.maxPrice);
  const avgPrice = (minPrice + maxPrice) / 2;
  const priceDate = new Date(price.date);
  const dateLabel = data.dateLabel || 'Unknown';

  // Determine badge color based on date
  const getDateBadgeClass = () => {
    if (dateLabel === 'Today') return 'badge-today';
    if (dateLabel === 'Yesterday') return 'badge-yesterday';
    return 'badge-older';
  };

  return (
    <div className="last-price-card">
      <div className="last-price-header">
        <div className="header-content">
          <h3>📊 Last Price Information</h3>
          {productName && <p className="product-name">{productName}</p>}
        </div>
        <div className={`date-badge ${getDateBadgeClass()}`}>
          <span className="badge-icon">
            {dateLabel === 'Today' ? '📅' : dateLabel === 'Yesterday' ? '🕐' : '📆'}
          </span>
          <span className="badge-text">{dateLabel}</span>
        </div>
      </div>

      <div className="last-price-body">
        <div className="price-display-grid">
          <div className="price-item min-price">
            <div className="price-icon">⬇️</div>
            <div className="price-content">
              <div className="price-label">Minimum Price</div>
              <div className="price-value">Rs. {minPrice.toFixed(2)}</div>
            </div>
          </div>

          <div className="price-item avg-price highlight">
            <div className="price-icon">💰</div>
            <div className="price-content">
              <div className="price-label">Average Price</div>
              <div className="price-value">Rs. {avgPrice.toFixed(2)}</div>
            </div>
          </div>

          <div className="price-item max-price">
            <div className="price-icon">⬆️</div>
            <div className="price-content">
              <div className="price-label">Maximum Price</div>
              <div className="price-value">Rs. {maxPrice.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="price-details">
          <div className="detail-item">
            <span className="detail-label">Price Date:</span>
            <span className="detail-value">{priceDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Price Range:</span>
            <span className="detail-value">Rs. {minPrice.toFixed(2)} - Rs. {maxPrice.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Product Type:</span>
            <span className="detail-value">{price.product.type}</span>
          </div>
        </div>

        <div className="price-range-visual">
          <div className="range-bar">
            <div 
              className="range-fill" 
              style={{ 
                width: `${((avgPrice - minPrice) / (maxPrice - minPrice)) * 100}%`,
                left: '0%'
              }}
            />
            <div className="range-markers">
              <span className="marker min-marker">Min</span>
              <span className="marker avg-marker">Avg</span>
              <span className="marker max-marker">Max</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastPriceCard;

