import { useState, useEffect } from 'react';
import { 
  FaHome, 
  FaChartLine, 
  FaFire, 
  FaExchangeAlt, 
  FaCalendarAlt,
  FaChartBar,
  FaChartPie,
  FaStar,
  FaShoppingCart,
  FaTimes,
  FaBars
} from 'react-icons/fa';
import BrandLogo from './BrandLogo';
import './Sidebar.css';

type AnalyticsTab = 'current' | 'grocery' | 'overview' | 'trends' | 'performers' | 'comparison' | 'seasonal' | 'distribution' | 'period-comparison' | 'favorites';

interface SidebarProps {
  activeTab: AnalyticsTab;
  onTabChange: (tab: AnalyticsTab) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ activeTab, onTabChange, isOpen, onToggle, onCollapseChange }: SidebarProps) => {
  // On mobile, use controlled state. On desktop, use internal state
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    return window.innerWidth < 1024;
  });
  
  const isMobile = window.innerWidth < 1024;
  const isCollapsed = isMobile ? !isOpen : internalCollapsed;
  
  // Notify parent of collapse state changes
  useEffect(() => {
    if (onCollapseChange && !isMobile) {
      onCollapseChange(internalCollapsed);
    }
  }, [internalCollapsed, isMobile, onCollapseChange]);
  
  const handleToggle = () => {
    if (isMobile && onToggle) {
      onToggle();
    } else {
      const newState = !internalCollapsed;
      setInternalCollapsed(newState);
      if (onCollapseChange) {
        onCollapseChange(newState);
      }
    }
  };
  
  const handleClose = () => {
    if (isMobile && onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(true);
      if (onCollapseChange) {
        onCollapseChange(true);
      }
    }
  };

  const menuItems = [
    { id: 'current' as AnalyticsTab, label: 'Current Prices', icon: FaHome, shortcut: '1' },
    { id: 'grocery' as AnalyticsTab, label: 'Grocery List', icon: FaShoppingCart, shortcut: '0' },
    { id: 'overview' as AnalyticsTab, label: 'Overview', icon: FaChartBar, shortcut: '2' },
    { id: 'trends' as AnalyticsTab, label: 'Price Trends', icon: FaChartLine, shortcut: '3' },
    { id: 'performers' as AnalyticsTab, label: 'Top Performers', icon: FaFire, shortcut: '4' },
    { id: 'comparison' as AnalyticsTab, label: 'Compare Products', icon: FaExchangeAlt, shortcut: '5' },
    { id: 'seasonal' as AnalyticsTab, label: 'Seasonal Analysis', icon: FaCalendarAlt, shortcut: '6' },
    { id: 'distribution' as AnalyticsTab, label: 'Price Distribution', icon: FaChartPie, shortcut: '7' },
    { id: 'period-comparison' as AnalyticsTab, label: 'Period Comparison', icon: FaChartBar, shortcut: '8' },
    { id: 'favorites' as AnalyticsTab, label: 'Favorites', icon: FaStar, shortcut: '9' },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${!isCollapsed ? 'active' : ''}`} onClick={handleClose} />
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <BrandLogo size={isCollapsed ? 32 : 36} />
            {!isCollapsed && <h3 className="sidebar-title">Veg Analytics</h3>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={handleToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  onTabChange(item.id);
                  // Only close sidebar on mobile, keep it open on desktop
                  if (isMobile) {
                    handleClose();
                  }
                }}
                title={!isCollapsed ? undefined : item.label}
              >
                <Icon className="sidebar-icon" />
                {!isCollapsed && (
                  <>
                    <span className="sidebar-label">{item.label}</span>
                    <span className="sidebar-shortcut">{item.shortcut}</span>
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

