import { useQuery } from 'react-query';
import { apiService, Product } from '../services/api';
import { useFavorites } from '../contexts/FavoritesContext';
import FavoriteButton from './FavoriteButton';
import LoadingSkeleton from './LoadingSkeleton';
import './FavoritesPanel.css';

const FavoritesPanel = () => {
  const { favorites } = useFavorites();
  const { data: products = [], isLoading } = useQuery<Product[]>(
    'products',
    () => apiService.getProducts(),
  );

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  if (isLoading) {
    return (
      <div className="favorites-panel">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="favorites-panel">
        <div className="favorites-empty">
          <div className="empty-icon">⭐</div>
          <h3>No Favorites Yet</h3>
          <p>Start adding products to your favorites to track them easily!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-panel">
      <div className="favorites-header">
        <h2>⭐ Favorite Products</h2>
        <p className="favorites-subtitle">Your tracked products ({favoriteProducts.length})</p>
      </div>
      <div className="favorites-grid">
        {favoriteProducts.map((product) => (
          <div key={product.id} className="favorite-card">
            <div className="favorite-card-header">
              <h3>{product.name}</h3>
              <FavoriteButton productId={product.id} />
            </div>
            <div className="favorite-card-body">
              <span className="product-type-badge">{product.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPanel;

