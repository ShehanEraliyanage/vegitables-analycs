import { useEffect, useState } from 'react';
import './DataRefreshIndicator.css';

interface DataRefreshIndicatorProps {
  lastUpdated?: Date;
  isRefreshing?: boolean;
}

const DataRefreshIndicator = ({ lastUpdated, isRefreshing = false }: DataRefreshIndicatorProps) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdated.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 60) {
        setTimeAgo('Just now');
      } else if (minutes < 60) {
        setTimeAgo(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`);
      } else if (hours < 24) {
        setTimeAgo(`${hours} ${hours === 1 ? 'hour' : 'hours'} ago`);
      } else {
        setTimeAgo(lastUpdated.toLocaleDateString());
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (!lastUpdated && !isRefreshing) return null;

  return (
    <div className="data-refresh-indicator">
      {isRefreshing ? (
        <div className="refresh-status refreshing">
          <span className="refresh-spinner"></span>
          <span>Refreshing data...</span>
        </div>
      ) : (
        <div className="refresh-status">
          <span className="refresh-icon">🔄</span>
          <span>Last updated: {timeAgo}</span>
        </div>
      )}
    </div>
  );
};

export default DataRefreshIndicator;

