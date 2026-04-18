import { ReactNode } from 'react';
import { FaChartPie } from 'react-icons/fa';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({
  icon = <FaChartPie className="empty-state-icon-svg" aria-hidden />,
  title,
  message,
  action,
}: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <button type="button" className="empty-state-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
