import { FaStar, FaRegStar } from 'react-icons/fa';
import { useFavorites } from '../contexts/FavoritesContext';
import './FavoriteButton.css';

interface FavoriteButtonProps {
  productId: number;
  size?: 'sm' | 'md' | 'lg';
}

const FavoriteButton = ({ productId, size = 'md' }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(productId);

  return (
    <button
      className={`favorite-button ${size} ${favorite ? 'active' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {favorite ? <FaStar /> : <FaRegStar />}
    </button>
  );
};

export default FavoriteButton;

