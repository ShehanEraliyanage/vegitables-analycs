import { useState, useEffect, type ReactNode } from 'react';
import { useQuery } from 'react-query';
import {
  FaBars,
  FaDownload,
  FaRedo,
  FaTrashAlt,
  FaDollarSign,
  FaShoppingCart,
  FaChartBar,
} from 'react-icons/fa';
import { apiService, Product, Statistics } from '../services/api';
import StatisticsPanel from '../components/StatisticsPanel';
import FilterPanel from '../components/FilterPanel';
import ChartPanel from '../components/ChartPanel';
import TrendsPanel from '../components/TrendsPanel';
import TopPerformersPanel from '../components/TopPerformersPanel';
import ComparisonPanel from '../components/ComparisonPanel';
import SeasonalPanel from '../components/SeasonalPanel';
import DistributionPanel from '../components/DistributionPanel';
import CurrentPricesPanel from '../components/CurrentPricesPanel';
import PeriodComparisonPanel from '../components/PeriodComparisonPanel';
import LastPriceCard from '../components/LastPriceCard';
import SyncButton from '../components/SyncButton';
import DailySyncButton from '../components/DailySyncButton';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import SmartTooltip from '../components/SmartTooltip';
import QuickActions from '../components/QuickActions';
import Breadcrumbs from '../components/Breadcrumbs';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import DashboardWidgets from '../components/DashboardWidgets';
import FavoritesPanel from '../components/FavoritesPanel';
import GroceryListPanel from '../components/GroceryListPanel';
import ExportButton from '../components/ExportButton';
import MetaTags from '../components/MetaTags';
import BrandLogo from '../components/BrandLogo';
import { showSuccessToast } from '../components/ToastNotification';
import './Dashboard.css';

type TimePeriod = 'weekly' | 'monthly' | 'quarterly' | 'six-month' | 'annual';
type AnalyticsTab = 'current' | 'grocery' | 'overview' | 'trends' | 'performers' | 'comparison' | 'seasonal' | 'distribution' | 'period-comparison' | 'favorites';

const ANALYTICS_TABS: AnalyticsTab[] = [
  'current',
  'grocery',
  'overview',
  'trends',
  'performers',
  'comparison',
  'seasonal',
  'distribution',
  'period-comparison',
  'favorites',
];

function parseTabFromSearch(search: string): AnalyticsTab | null {
  const q = search.startsWith('?') ? search.slice(1) : search;
  const tab = new URLSearchParams(q).get('tab');
  if (!tab) return null;
  return ANALYTICS_TABS.includes(tab as AnalyticsTab) ? (tab as AnalyticsTab) : null;
}

function getInitialTab(): AnalyticsTab {
  if (typeof window === 'undefined') return 'current';
  return parseTabFromSearch(window.location.search) ?? 'current';
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>(getInitialTab);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>(
    'products',
    () => apiService.getProducts(),
  );

  // Check if we have data (products exist)
  // Don't show sync button while loading or if products exist
  const hasData = !productsLoading && products.length > 0;

  const { data: statistics, isLoading: statsLoading } = useQuery<Statistics>(
    ['statistics', selectedProductId, startDate, endDate],
    () => apiService.getStatistics({
      productId: selectedProductId,
      startDate,
      endDate,
    }),
    {
      enabled: true,
    },
  );

  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    ['analytics', timePeriod, selectedProductId, startDate, endDate],
    () => {
      const params = {
        productId: selectedProductId,
        startDate,
        endDate,
      };

      switch (timePeriod) {
        case 'weekly':
          return apiService.getWeeklyAnalysis(params);
        case 'monthly':
          return apiService.getMonthlyAnalysis(params);
        case 'quarterly':
          return apiService.getQuarterlyAnalysis(params);
        case 'six-month':
          return apiService.getSixMonthAnalysis(params);
        case 'annual':
          return apiService.getAnnualAnalysis({
            year: startDate ? new Date(startDate).getFullYear() : undefined,
            productId: selectedProductId,
          });
        default:
          return apiService.getMonthlyAnalysis(params);
      }
    },
    {
      enabled: true,
    },
  );

  // Set default date range based on time period
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timePeriod) {
      case 'weekly':
        // Last 7 days
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        // Last 30 days
        start.setDate(start.getDate() - 30);
        break;
      case 'quarterly':
        // Last 3 months
        start.setMonth(start.getMonth() - 3);
        break;
      case 'six-month':
        // Last 6 months
        start.setMonth(start.getMonth() - 6);
        break;
      case 'annual':
        // Current year
        start.setMonth(0, 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, [timePeriod]);

  // Keep ?tab= in sync for PWA shortcuts and shareable URLs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    const qs = params.toString();
    const next = `${window.location.pathname}?${qs}${window.location.hash}`;
    if (window.location.search !== `?${qs}`) {
      window.history.replaceState(null, '', next);
    }
  }, [activeTab]);

  useEffect(() => {
    const onPopState = () => {
      const next = parseTabFromSearch(window.location.search);
      if (next) setActiveTab(next);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Handle keyboard shortcuts
  const handleShortcut = (key: string) => {
    if (key === '0') setActiveTab('grocery');
    else if (key === '1') setActiveTab('current');
    else if (key === '2') setActiveTab('overview');
    else if (key === '3') setActiveTab('trends');
    else if (key === '4') setActiveTab('performers');
    else if (key === '5') setActiveTab('comparison');
    else if (key === '6') setActiveTab('seasonal');
    else if (key === '7') setActiveTab('distribution');
    else if (key === '8') setActiveTab('period-comparison');
    else if (key === '9') setActiveTab('favorites');
  };

  // Handle tab change with smooth transition
  const handleTabChange = (tab: AnalyticsTab) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  };

  const exportToCSV = () => {
    if (!analytics || !analytics.data) return;
    
    const headers = ['Period', 'Product', 'Product ID', 'Avg Min Price', 'Avg Max Price', 'Min Price', 'Max Price', 'Volatility'];
    const rows = analytics.data.map((item: any) => [
      item.period,
      item.product,
      item.productId,
      item.avgMinPrice,
      item.avgMaxPrice,
      item.minPrice,
      item.maxPrice,
      item.volatility,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timePeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccessToast('Data exported successfully!');
  };

  const quickActions: {
    id: string;
    label: string;
    icon: ReactNode;
    onClick: () => void;
    shortcut?: string;
  }[] = [
    {
      id: 'export',
      label: 'Export Data',
      icon: <FaDownload aria-hidden />,
      onClick: exportToCSV,
      shortcut: 'E',
    },
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: <FaRedo aria-hidden />,
      onClick: () => {
        window.location.reload();
      },
      shortcut: 'R',
    },
    {
      id: 'clear-filters',
      label: 'Clear Filters',
      icon: <FaTrashAlt aria-hidden />,
      onClick: () => {
        setSelectedProductId(undefined);
        setStartDate('');
        setEndDate('');
      },
    },
  ];

  // Update page title based on active tab
  const getPageTitle = () => {
    const tabNames: { [key: string]: string } = {
      'current': 'Current Prices',
      'grocery': 'Grocery List',
      'overview': 'Overview & Statistics',
      'trends': 'Price Trends',
      'performers': 'Top Performers',
      'comparison': 'Product Comparison',
      'seasonal': 'Seasonal Analysis',
      'distribution': 'Price Distribution',
      'period-comparison': 'Period Comparison',
      'favorites': 'Favorites',
    };
    return tabNames[activeTab] || 'Dashboard';
  };

  const getPageDescription = () => {
    const descriptions: { [key: string]: string } = {
      'current': 'View current market prices for vegetables and fruits in Sri Lanka',
      'grocery': 'Build your shopping list with Organic and Non-organic options, and export to PDF',
      'overview': 'Comprehensive statistics and analytics overview',
      'trends': 'Analyze price trends and patterns over time',
      'performers': 'Top performing products with highest price changes',
      'comparison': 'Compare prices across multiple products',
      'seasonal': 'Seasonal price patterns and analysis',
      'distribution': 'Price distribution and statistical analysis',
      'period-comparison': 'Compare prices between different time periods',
      'favorites': 'Your favorite products and tracked items',
    };
    return descriptions[activeTab] || 'Vegetables & Fruits Price Analytics Platform';
  };

  return (
    <div className={`dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <MetaTags 
        title={getPageTitle()}
        description={getPageDescription()}
      />
      <KeyboardShortcuts 
        onShortcut={handleShortcut} 
        isOpen={showKeyboardShortcuts}
        onToggle={setShowKeyboardShortcuts}
      />
      
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onCollapseChange={setSidebarCollapsed}
      />
      
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <FaBars aria-hidden />
            </button>
          <div className="header-brand">
            <BrandLogo size={44} />
            <div>
            <h1>Vegetables & Fruits Price Analytics</h1>
            <p>Sri Lanka Market Prices - Comprehensive Analytics Platform</p>
            </div>
          </div>
          </div>
          <div className="header-actions">
            <ThemeToggle />
          <SmartTooltip content="Click to see keyboard shortcuts">
            <button 
              className="help-button" 
              onClick={() => setShowKeyboardShortcuts(true)}
              aria-label="Keyboard shortcuts"
            >
              <span>?</span>
            </button>
          </SmartTooltip>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {!productsLoading && <SyncButton hasData={hasData} />}

        {hasData && (
          <>
            <DailySyncButton />

            <DashboardWidgets 
              selectedProductId={selectedProductId}
              startDate={startDate}
              endDate={endDate}
            />

            <FilterPanel
              products={products}
              productsLoading={productsLoading}
              timePeriod={timePeriod}
              onTimePeriodChange={setTimePeriod}
              selectedProductId={selectedProductId}
              onProductChange={setSelectedProductId}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
            />

            <Breadcrumbs
              items={[
                { label: 'Dashboard', onClick: () => handleTabChange('current') },
                { label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ') },
              ]}
            />

            {/* Hide old tabs since we have sidebar now, but keep for mobile fallback */}
            <div className="analytics-tabs mobile-only">
              <SmartTooltip content="Press 1 to switch (Current Prices)">
                <button
                  className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
                  onClick={() => handleTabChange('current')}
                  aria-label="Current Prices"
                >
                  <FaDollarSign className="tab-button-icon" aria-hidden />
                  Current Prices
                </button>
              </SmartTooltip>
              <SmartTooltip content="Press 0 to switch (Grocery List)">
                <button
                  className={`tab-button ${activeTab === 'grocery' ? 'active' : ''}`}
                  onClick={() => handleTabChange('grocery')}
                  aria-label="Grocery List"
                >
                  <FaShoppingCart className="tab-button-icon" aria-hidden />
                  Grocery List
                </button>
              </SmartTooltip>
              <SmartTooltip content="Press 2 to switch (Overview)">
                <button
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => handleTabChange('overview')}
                  aria-label="Overview"
                >
                  Overview
                </button>
              </SmartTooltip>
              <SmartTooltip content="Press 3 to switch (Price Trends)">
                <button
                  className={`tab-button ${activeTab === 'trends' ? 'active' : ''}`}
                  onClick={() => handleTabChange('trends')}
                  aria-label="Price Trends"
                >
                  Price Trends
                </button>
              </SmartTooltip>
              <SmartTooltip content="Press 4 to switch (Top Performers)">
                <button
                  className={`tab-button ${activeTab === 'performers' ? 'active' : ''}`}
                  onClick={() => handleTabChange('performers')}
                  aria-label="Top Performers"
                >
                  Top Performers
                </button>
              </SmartTooltip>
              <SmartTooltip content="Press 5 to switch (Compare Products)">
                <button
                  className={`tab-button ${activeTab === 'comparison' ? 'active' : ''}`}
                  onClick={() => handleTabChange('comparison')}
                  aria-label="Compare Products"
                >
                  Compare Products
                </button>
              </SmartTooltip>
              <SmartTooltip content="Press 6 to switch (Seasonal Analysis)">
                <button
                  className={`tab-button ${activeTab === 'seasonal' ? 'active' : ''}`}
                  onClick={() => handleTabChange('seasonal')}
                  aria-label="Seasonal Analysis"
                >
                  Seasonal Analysis
                </button>
              </SmartTooltip>
              <SmartTooltip content="Press 7 to switch (Price Distribution)">
                <button
                  className={`tab-button ${activeTab === 'distribution' ? 'active' : ''}`}
                  onClick={() => handleTabChange('distribution')}
                  aria-label="Price Distribution"
                >
                  Price Distribution
                </button>
              </SmartTooltip>
              <SmartTooltip content="Press 8 to switch (Period Comparison)">
                <button
                  className={`tab-button ${activeTab === 'period-comparison' ? 'active' : ''}`}
                  onClick={() => handleTabChange('period-comparison')}
                  aria-label="Period Comparison"
                >
                  <FaChartBar className="tab-button-icon" aria-hidden />
                  Period Comparison
                </button>
              </SmartTooltip>
              {activeTab === 'overview' && (
                <ExportButton
                  data={analytics?.data}
                  filename="analytics"
                  startDate={startDate}
                  endDate={endDate}
                  productId={selectedProductId}
                />
              )}
            </div>

            <div className={`analytics-content ${isTransitioning ? 'transitioning' : ''}`}>
              {activeTab === 'current' && (
                <CurrentPricesPanel 
                  selectedProductId={selectedProductId}
                  startDate={startDate}
                  endDate={endDate}
                />
              )}

              {activeTab === 'grocery' && <GroceryListPanel />}

              {activeTab === 'overview' && (
                <>
                  {selectedProductId && (
                    <LastPriceCard 
                      productId={selectedProductId}
                      productName={products.find(p => p.id === selectedProductId)?.name}
                    />
                  )}
                  <StatisticsPanel
                    statistics={statistics}
                    loading={statsLoading}
                  />
                  <ChartPanel
                    analytics={analytics}
                    loading={analyticsLoading}
                    timePeriod={timePeriod}
                  />
                </>
              )}

              {activeTab === 'trends' && (
                <TrendsPanel
                  startDate={startDate}
                  endDate={endDate}
                  productId={selectedProductId}
                />
              )}

              {activeTab === 'performers' && (
                <TopPerformersPanel
                  startDate={startDate}
                  endDate={endDate}
                />
              )}

              {activeTab === 'comparison' && (
                <ComparisonPanel
                  products={products}
                  startDate={startDate}
                  endDate={endDate}
                />
              )}

              {activeTab === 'seasonal' && (
                <SeasonalPanel
                  productId={selectedProductId}
                />
              )}

              {activeTab === 'distribution' && (
                <DistributionPanel
                  startDate={startDate}
                  endDate={endDate}
                  productId={selectedProductId}
                />
              )}

              {activeTab === 'period-comparison' && (
                <PeriodComparisonPanel
                  selectedProductId={selectedProductId}
                />
              )}

              {activeTab === 'favorites' && (
                <FavoritesPanel />
              )}
            </div>
          </>
        )}
      </div>

      {hasData && <QuickActions actions={quickActions} />}
    </div>
  );
};

export default Dashboard;

