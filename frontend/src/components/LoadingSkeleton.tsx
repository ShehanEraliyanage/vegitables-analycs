import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  type?: 'card' | 'chart' | 'table' | 'stat';
  count?: number;
}

const LoadingSkeleton = ({ type = 'card', count = 1 }: LoadingSkeletonProps) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text-group">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line medium"></div>
              </div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-line long"></div>
              <div className="skeleton-line medium"></div>
            </div>
          </div>
        );
      case 'chart':
        return (
          <div className="skeleton-chart">
            <div className="skeleton-chart-header">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line medium"></div>
            </div>
            <div className="skeleton-chart-body">
              <div className="skeleton-bar" style={{ height: '60%' }}></div>
              <div className="skeleton-bar" style={{ height: '80%' }}></div>
              <div className="skeleton-bar" style={{ height: '45%' }}></div>
              <div className="skeleton-bar" style={{ height: '90%' }}></div>
              <div className="skeleton-bar" style={{ height: '70%' }}></div>
              <div className="skeleton-bar" style={{ height: '55%' }}></div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="skeleton-table">
            <div className="skeleton-table-row">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line medium"></div>
              <div className="skeleton-line short"></div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-table-row">
                <div className="skeleton-line medium"></div>
                <div className="skeleton-line short"></div>
                <div className="skeleton-line medium"></div>
              </div>
            ))}
          </div>
        );
      case 'stat':
        return (
          <div className="skeleton-stat">
            <div className="skeleton-icon"></div>
            <div className="skeleton-stat-content">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line long"></div>
            </div>
          </div>
        );
      default:
        return <div className="skeleton-card"></div>;
    }
  };

  return (
    <div className="skeleton-container">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;



