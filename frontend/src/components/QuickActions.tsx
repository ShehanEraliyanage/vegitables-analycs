import { useState } from 'react';
import SmartTooltip from './SmartTooltip';
import './QuickActions.css';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  shortcut?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions = ({ actions }: QuickActionsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (actions.length === 0) return null;

  return (
    <div className={`quick-actions ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="quick-actions-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Quick actions"
      >
        <span className="toggle-icon">{isExpanded ? '✕' : '⚡'}</span>
      </button>
      {isExpanded && (
        <div className="quick-actions-menu">
          {actions.map((action) => (
            <SmartTooltip key={action.id} content={action.label + (action.shortcut ? ` (${action.shortcut})` : '')}>
              <button
                className="quick-action-item"
                onClick={() => {
                  action.onClick();
                  setIsExpanded(false);
                }}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
                {action.shortcut && <kbd className="action-shortcut">{action.shortcut}</kbd>}
              </button>
            </SmartTooltip>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickActions;

