import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Price {
  id: number;
  apiId: number;
  date: string;
  minPrice: number;
  maxPrice: number;
  productId: number;
  product?: {
    id: number;
    name: string;
    type: string;
  };
}

export interface Product {
  id: number;
  apiId: number;
  name: string;
  type: string;
}

export interface AnalyticsDataPoint {
  period: string;
  product: string;
  productId: number;
  avgMinPrice: number;
  avgMaxPrice: number;
  minPrice: number;
  maxPrice: number;
  volatility: number;
}

export interface AnalyticsResponse {
  period: string;
  data: AnalyticsDataPoint[];
  summary: {
    totalProducts: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export interface Statistics {
  totalEntries: number;
  totalProducts: number;
  averageMinPrice: number;
  averageMaxPrice: number;
  overallMinPrice: number;
  overallMaxPrice: number;
  volatility: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export const apiService = {
  // Products
  getProducts: async (type?: string): Promise<Product[]> => {
    const params = type ? { type } : {};
    const response = await api.get('/products', { params });
    return response.data.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  // Prices
  getPrices: async (params?: {
    startDate?: string;
    endDate?: string;
    productId?: number;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/prices', { params });
    return response.data;
  },

  // Analytics
  getWeeklyAnalysis: async (params?: {
    startDate?: string;
    endDate?: string;
    productId?: number;
  }): Promise<AnalyticsResponse> => {
    const response = await api.get('/analytics/weekly', { params });
    return response.data;
  },

  getMonthlyAnalysis: async (params?: {
    startDate?: string;
    endDate?: string;
    productId?: number;
  }): Promise<AnalyticsResponse> => {
    const response = await api.get('/analytics/monthly', { params });
    return response.data;
  },

  getQuarterlyAnalysis: async (params?: {
    startDate?: string;
    endDate?: string;
    productId?: number;
  }): Promise<AnalyticsResponse> => {
    const response = await api.get('/analytics/quarterly', { params });
    return response.data;
  },

  getSixMonthAnalysis: async (params?: {
    startDate?: string;
    endDate?: string;
    productId?: number;
  }): Promise<AnalyticsResponse> => {
    const response = await api.get('/analytics/six-month', { params });
    return response.data;
  },

  getAnnualAnalysis: async (params?: {
    year?: number;
    productId?: number;
  }): Promise<AnalyticsResponse> => {
    const response = await api.get('/analytics/annual', { params });
    return response.data;
  },

  getStatistics: async (params?: {
    startDate?: string;
    endDate?: string;
    productId?: number;
  }): Promise<Statistics> => {
    const response = await api.get('/analytics/stats', { params });
    return response.data;
  },

  // Sync
  triggerInitialSync: async () => {
    const response = await api.post('/sync/initial');
    return response.data;
  },

  triggerDailySync: async () => {
    const response = await api.post('/sync/daily');
    return response.data;
  },

  // Check if date has data
  checkDateExists: async (date?: string): Promise<{ date: string; exists: boolean }> => {
    const params = date ? { date } : {};
    const response = await api.get('/prices/check-date', { params });
    return response.data;
  },

  // Advanced Analytics
  getPriceTrends: async (params?: {
    startDate?: string;
    endDate?: string;
    productId?: number;
  }) => {
    const response = await api.get('/analytics/trends', { params });
    return response.data;
  },

  getTopPerformers: async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => {
    const response = await api.get('/analytics/top-performers', { params });
    return response.data;
  },

  compareProducts: async (params: {
    productIds: number[];
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/analytics/compare', {
      params: {
        ...params,
        productIds: params.productIds.join(','),
      },
    });
    return response.data;
  },

  getSeasonalAnalysis: async (params?: {
    year?: number;
    productId?: number;
  }) => {
    const response = await api.get('/analytics/seasonal', { params });
    return response.data;
  },

  getPriceDistribution: async (params?: {
    startDate?: string;
    endDate?: string;
    productId?: number;
  }) => {
    const response = await api.get('/analytics/distribution', { params });
    return response.data;
  },

  // Current Prices
  getTodayPrices: async () => {
    const response = await api.get('/prices/today');
    return response.data;
  },

  getLatestPrices: async () => {
    const response = await api.get('/prices/latest');
    return response.data;
  },

  getLastPriceForProduct: async (productId: number) => {
    const response = await api.get(`/prices/product/${productId}/last`);
    return response.data;
  },
};

export default api;

