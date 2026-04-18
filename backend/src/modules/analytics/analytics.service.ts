import { BadRequestException, Injectable } from '@nestjs/common';
import { PriceService } from '../price/price.service';

export interface AnalyticsDataPoint {
  period: string;
  product: string;
  productId: number;
  avgMinPrice: number;
  avgMaxPrice: number;
  minPrice: number;
  maxPrice: number;
  volatility: number;
  priceChange?: number;
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

@Injectable()
export class AnalyticsService {
  constructor(private readonly priceService: PriceService) {}

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance =
      prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
      prices.length;
    return Math.sqrt(variance);
  }

  private groupByPeriod(
    prices: any[],
    periodType: 'week' | 'month' | 'quarter' | 'six-month' | 'year',
  ): Map<string, any[]> {
    const groups = new Map<string, any[]>();

    prices.forEach((price) => {
      const date = new Date(price.date);
      let periodKey: string;

      switch (periodType) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'six-month':
          const half = date.getMonth() < 6 ? 'H1' : 'H2';
          periodKey = `${date.getFullYear()}-${half}`;
          break;
        case 'year':
          periodKey = String(date.getFullYear());
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
      }

      if (!groups.has(periodKey)) {
        groups.set(periodKey, []);
      }
      groups.get(periodKey)!.push(price);
    });

    return groups;
  }

  private calculateAnalytics(
    prices: any[],
    periodType: string,
  ): AnalyticsDataPoint[] {
    const groups = this.groupByPeriod(
      prices,
      periodType as 'week' | 'month' | 'quarter' | 'six-month' | 'year',
    );
    const results: AnalyticsDataPoint[] = [];

    groups.forEach((groupPrices, period) => {
      // Group by product
      const productGroups = new Map<number, any[]>();
      groupPrices.forEach((price) => {
        const productId = price.productId;
        if (!productGroups.has(productId)) {
          productGroups.set(productId, []);
        }
        productGroups.get(productId)!.push(price);
      });

      productGroups.forEach((productPrices, productId) => {
        const minPrices = productPrices.map((p) => Number(p.minPrice));
        const maxPrices = productPrices.map((p) => Number(p.maxPrice));
        const allPrices = [...minPrices, ...maxPrices];

        const avgMinPrice =
          minPrices.reduce((a, b) => a + b, 0) / minPrices.length;
        const avgMaxPrice =
          maxPrices.reduce((a, b) => a + b, 0) / maxPrices.length;
        const minPrice = Math.min(...minPrices);
        const maxPrice = Math.max(...maxPrices);
        const volatility = this.calculateVolatility(allPrices);

        results.push({
          period,
          product: productPrices[0].product.name,
          productId,
          avgMinPrice: Math.round(avgMinPrice * 100) / 100,
          avgMaxPrice: Math.round(avgMaxPrice * 100) / 100,
          minPrice,
          maxPrice,
          volatility: Math.round(volatility * 100) / 100,
        });
      });
    });

    return results.sort((a, b) => a.period.localeCompare(b.period));
  }

  async getWeeklyAnalysis(
    startDate?: Date,
    endDate?: Date,
    productId?: number,
  ): Promise<AnalyticsResponse> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    const prices = await this.priceService.getPricesByDateRange(
      start,
      end,
      productId,
    );

    const data = this.calculateAnalytics(prices, 'week');
    const uniqueProducts = new Set(data.map((d) => d.productId));

    return {
      period: 'weekly',
      data,
      summary: {
        totalProducts: uniqueProducts.size,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
      },
    };
  }

  async getMonthlyAnalysis(
    startDate?: Date,
    endDate?: Date,
    productId?: number,
  ): Promise<AnalyticsResponse> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getFullYear(), end.getMonth() - 1, 1);

    const prices = await this.priceService.getPricesByDateRange(
      start,
      end,
      productId,
    );

    const data = this.calculateAnalytics(prices, 'month');
    const uniqueProducts = new Set(data.map((d) => d.productId));

    return {
      period: 'monthly',
      data,
      summary: {
        totalProducts: uniqueProducts.size,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
      },
    };
  }

  async getQuarterlyAnalysis(
    startDate?: Date,
    endDate?: Date,
    productId?: number,
  ): Promise<AnalyticsResponse> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getFullYear(), 0, 1);

    const prices = await this.priceService.getPricesByDateRange(
      start,
      end,
      productId,
    );

    const data = this.calculateAnalytics(prices, 'quarter');
    const uniqueProducts = new Set(data.map((d) => d.productId));

    return {
      period: 'quarterly',
      data,
      summary: {
        totalProducts: uniqueProducts.size,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
      },
    };
  }

  async getSixMonthAnalysis(
    startDate?: Date,
    endDate?: Date,
    productId?: number,
  ): Promise<AnalyticsResponse> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);

    const prices = await this.priceService.getPricesByDateRange(
      start,
      end,
      productId,
    );

    const data = this.calculateAnalytics(prices, 'six-month');
    const uniqueProducts = new Set(data.map((d) => d.productId));

    return {
      period: 'six-month',
      data,
      summary: {
        totalProducts: uniqueProducts.size,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
      },
    };
  }

  async getAnnualAnalysis(
    year?: number,
    productId?: number,
  ): Promise<AnalyticsResponse> {
    const targetYear = year || new Date().getFullYear();
    const start = new Date(targetYear, 0, 1);
    const end = new Date(targetYear, 11, 31);

    const prices = await this.priceService.getPricesByDateRange(
      start,
      end,
      productId,
    );

    const data = this.calculateAnalytics(prices, 'year');
    const uniqueProducts = new Set(data.map((d) => d.productId));

    return {
      period: 'annual',
      data,
      summary: {
        totalProducts: uniqueProducts.size,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
      },
    };
  }

  async getStatistics(
    startDate?: Date,
    endDate?: Date,
    productId?: number,
  ): Promise<any> {
    const end = endDate || new Date();
    const start = startDate || new Date('2025-05-05');

    const prices = await this.priceService.getPricesByDateRange(
      start,
      end,
      productId,
    );

    if (prices.length === 0) {
      return {
        totalEntries: 0,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
      };
    }

    const minPrices = prices.map((p) => Number(p.minPrice));
    const maxPrices = prices.map((p) => Number(p.maxPrice));
    const allPrices = [...minPrices, ...maxPrices];

    const avgMinPrice = minPrices.reduce((a, b) => a + b, 0) / minPrices.length;
    const avgMaxPrice = maxPrices.reduce((a, b) => a + b, 0) / maxPrices.length;
    const overallMin = Math.min(...allPrices);
    const overallMax = Math.max(...allPrices);
    const volatility = this.calculateVolatility(allPrices);

    const uniqueProducts = new Set(prices.map((p) => p.productId));

    return {
      totalEntries: prices.length,
      totalProducts: uniqueProducts.size,
      averageMinPrice: Math.round(avgMinPrice * 100) / 100,
      averageMaxPrice: Math.round(avgMaxPrice * 100) / 100,
      overallMinPrice: overallMin,
      overallMaxPrice: overallMax,
      volatility: Math.round(volatility * 100) / 100,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
    };
  }

  async getPriceTrends(
    startDate?: Date,
    endDate?: Date,
    productId?: number,
  ): Promise<any> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const prices = await this.priceService.getPricesByDateRange(
      start,
      end,
      productId,
    );

    if (prices.length === 0) {
      return { trends: [], dateRange: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] } };
    }

    // Group by product
    const productGroups = new Map<number, any[]>();
    prices.forEach((price) => {
      if (!productGroups.has(price.productId)) {
        productGroups.set(price.productId, []);
      }
      productGroups.get(price.productId)!.push(price);
    });

    const trends = Array.from(productGroups.entries()).map(([productId, productPrices]) => {
      const sortedPrices = productPrices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstPrice = (Number(sortedPrices[0].minPrice) + Number(sortedPrices[0].maxPrice)) / 2;
      const lastPrice = (Number(sortedPrices[sortedPrices.length - 1].minPrice) + Number(sortedPrices[sortedPrices.length - 1].maxPrice)) / 2;
      const priceChange = lastPrice - firstPrice;
      const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100) : 0;
      
      // Calculate trend direction
      const recentPrices = sortedPrices.slice(-7).map(p => (Number(p.minPrice) + Number(p.maxPrice)) / 2);
      const olderPrices = sortedPrices.slice(0, Math.max(1, sortedPrices.length - 7)).map(p => (Number(p.minPrice) + Number(p.maxPrice)) / 2);
      const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
      const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;
      const trend = recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'stable';

      return {
        productId,
        productName: sortedPrices[0].product.name,
        firstPrice: Math.round(firstPrice * 100) / 100,
        lastPrice: Math.round(lastPrice * 100) / 100,
        priceChange: Math.round(priceChange * 100) / 100,
        priceChangePercent: Math.round(priceChangePercent * 100) / 100,
        trend,
        volatility: this.calculateVolatility(sortedPrices.map(p => (Number(p.minPrice) + Number(p.maxPrice)) / 2)),
      };
    });

    return {
      trends: trends.sort((a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent)),
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
    };
  }

  async getTopPerformers(
    startDate?: Date,
    endDate?: Date,
    limit: number = 10,
  ): Promise<any> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const prices = await this.priceService.getPricesByDateRange(start, end);

    if (prices.length === 0) {
      return { best: [], worst: [], dateRange: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] } };
    }

    const productGroups = new Map<number, any[]>();
    prices.forEach((price) => {
      if (!productGroups.has(price.productId)) {
        productGroups.set(price.productId, []);
      }
      productGroups.get(price.productId)!.push(price);
    });

    const productStats = Array.from(productGroups.entries()).map(([productId, productPrices]) => {
      const sortedPrices = productPrices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstPrice = (Number(sortedPrices[0].minPrice) + Number(sortedPrices[0].maxPrice)) / 2;
      const lastPrice = (Number(sortedPrices[sortedPrices.length - 1].minPrice) + Number(sortedPrices[sortedPrices.length - 1].maxPrice)) / 2;
      const priceChangePercent = firstPrice > 0 ? (((lastPrice - firstPrice) / firstPrice) * 100) : 0;
      const avgPrice = productPrices.reduce((sum, p) => sum + (Number(p.minPrice) + Number(p.maxPrice)) / 2, 0) / productPrices.length;

      return {
        productId,
        productName: sortedPrices[0].product.name,
        productType: sortedPrices[0].product.type,
        avgPrice: Math.round(avgPrice * 100) / 100,
        priceChangePercent: Math.round(priceChangePercent * 100) / 100,
        volatility: this.calculateVolatility(productPrices.map(p => (Number(p.minPrice) + Number(p.maxPrice)) / 2)),
      };
    });

    const best = productStats
      .filter(p => p.priceChangePercent < 0) // Prices decreased (good for consumers)
      .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
      .slice(0, limit);

    const worst = productStats
      .filter(p => p.priceChangePercent > 0) // Prices increased
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, limit);

    return {
      best,
      worst,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
    };
  }

  async compareProducts(
    productIds: number[],
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const comparisons = await Promise.all(
      productIds.map(async (productId) => {
        const prices = await this.priceService.getPricesByDateRange(
          start,
          end,
          productId,
        );

        if (prices.length === 0) {
          return null;
        }

        const minPrices = prices.map((p) => Number(p.minPrice));
        const maxPrices = prices.map((p) => Number(p.maxPrice));
        const allPrices = [...minPrices, ...maxPrices];

        const avgMinPrice = minPrices.reduce((a, b) => a + b, 0) / minPrices.length;
        const avgMaxPrice = maxPrices.reduce((a, b) => a + b, 0) / maxPrices.length;
        const avgPrice = (avgMinPrice + avgMaxPrice) / 2;
        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);
        const volatility = this.calculateVolatility(allPrices);

        // Calculate price change
        const sortedPrices = prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const firstPrice = (Number(sortedPrices[0].minPrice) + Number(sortedPrices[0].maxPrice)) / 2;
        const lastPrice = (Number(sortedPrices[sortedPrices.length - 1].minPrice) + Number(sortedPrices[sortedPrices.length - 1].maxPrice)) / 2;
        const priceChangePercent = firstPrice > 0 ? (((lastPrice - firstPrice) / firstPrice) * 100) : 0;

        return {
          productId,
          productName: prices[0].product.name,
          productType: prices[0].product.type,
          avgPrice: Math.round(avgPrice * 100) / 100,
          avgMinPrice: Math.round(avgMinPrice * 100) / 100,
          avgMaxPrice: Math.round(avgMaxPrice * 100) / 100,
          minPrice,
          maxPrice,
          volatility: Math.round(volatility * 100) / 100,
          priceChangePercent: Math.round(priceChangePercent * 100) / 100,
          dataPoints: prices.length,
        };
      }),
    );

    return {
      comparisons: comparisons.filter((c) => c !== null),
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
    };
  }

  async getSeasonalAnalysis(
    year?: number,
    productId?: number,
  ): Promise<any> {
    const targetYear = year || new Date().getFullYear();
    const start = new Date(targetYear, 0, 1);
    const end = new Date(targetYear, 11, 31);

    const prices = await this.priceService.getPricesByDateRange(
      start,
      end,
      productId,
    );

    if (prices.length === 0) {
      return { seasonal: [], year: targetYear };
    }

    // Group by month
    const monthlyGroups = new Map<number, any[]>();
    prices.forEach((price) => {
      const month = new Date(price.date).getMonth();
      if (!monthlyGroups.has(month)) {
        monthlyGroups.set(month, []);
      }
      monthlyGroups.get(month)!.push(price);
    });

    const seasonal = Array.from(monthlyGroups.entries())
      .map(([month, monthPrices]) => {
        // Group by product
        const productGroups = new Map<number, any[]>();
        monthPrices.forEach((price) => {
          if (!productGroups.has(price.productId)) {
            productGroups.set(price.productId, []);
          }
          productGroups.get(price.productId)!.push(price);
        });

        return Array.from(productGroups.entries()).map(([productId, productPrices]) => {
          const minPrices = productPrices.map((p) => Number(p.minPrice));
          const maxPrices = productPrices.map((p) => Number(p.maxPrice));
          const avgPrice = (minPrices.reduce((a, b) => a + b, 0) / minPrices.length + maxPrices.reduce((a, b) => a + b, 0) / maxPrices.length) / 2;

          return {
            month: month + 1,
            monthName: new Date(targetYear, month, 1).toLocaleString('default', { month: 'long' }),
            productId,
            productName: productPrices[0].product.name,
            avgPrice: Math.round(avgPrice * 100) / 100,
            minPrice: Math.min(...minPrices),
            maxPrice: Math.max(...maxPrices),
          };
        });
      })
      .flat()
      .sort((a, b) => {
        if (a.month !== b.month) return a.month - b.month;
        return a.productName.localeCompare(b.productName);
      });

    return {
      seasonal,
      year: targetYear,
    };
  }

  async getPriceDistribution(
    startDate?: Date,
    endDate?: Date,
    productId?: number,
  ): Promise<any> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const prices = await this.priceService.getPricesByDateRange(
      start,
      end,
      productId,
    );

    if (prices.length === 0) {
      return { distribution: [], dateRange: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] } };
    }

    const allPrices = prices.map((p) => (Number(p.minPrice) + Number(p.maxPrice)) / 2);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const range = maxPrice - minPrice;
    const buckets = 10;
    const bucketSize = range / buckets;

    const distribution = Array.from({ length: buckets }, (_, i) => {
      const bucketMin = minPrice + i * bucketSize;
      const bucketMax = minPrice + (i + 1) * bucketSize;
      const count = allPrices.filter((p) => p >= bucketMin && (i === buckets - 1 ? p <= bucketMax : p < bucketMax)).length;

      return {
        range: `${Math.round(bucketMin)} - ${Math.round(bucketMax)}`,
        min: Math.round(bucketMin),
        max: Math.round(bucketMax),
        count,
        percentage: Math.round((count / allPrices.length) * 100 * 100) / 100,
      };
    });

    return {
      distribution,
      totalPrices: allPrices.length,
      minPrice: Math.round(minPrice * 100) / 100,
      maxPrice: Math.round(maxPrice * 100) / 100,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
    };
  }

  async getPeriodComparison(
    periodType: 'day' | 'week' | 'month' | 'three-month' | 'six-month' | 'year',
    productId?: number,
    productType?: string,
  ): Promise<any> {
    const now = new Date();
    let previousStart: Date;
    let previousEnd: Date;
    let currentStart: Date;
    let currentEnd: Date;
    let previousLabel: string;
    let currentLabel: string;

    // Calculate date ranges based on period type
    switch (periodType) {
      case 'day': {
        // Yesterday vs Today
        const today = new Date(now);
        today.setHours(23, 59, 59, 999);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        
        previousStart = yesterday;
        previousEnd = yesterdayEnd;
        currentStart = todayStart;
        currentEnd = today;
        previousLabel = 'Yesterday';
        currentLabel = 'Today';
        break;
      }
      case 'week': {
        // Last week: 7 days ago to today-7
        // This week: today-6 to today
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        // Get start of this week (Monday)
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - daysToMonday);
        
        const thisWeekEnd = new Date(today);
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekStart.getDate() - 6);
        
        previousStart = lastWeekStart;
        previousEnd = lastWeekEnd;
        currentStart = thisWeekStart;
        currentEnd = thisWeekEnd;
        previousLabel = 'Last Week';
        currentLabel = 'This Week';
        break;
      }
      case 'month': {
        // Last month: previous calendar month
        // This month: current calendar month
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now);
        thisMonthEnd.setHours(23, 59, 59, 999);
        
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        lastMonthEnd.setHours(23, 59, 59, 999);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        previousStart = lastMonthStart;
        previousEnd = lastMonthEnd;
        currentStart = thisMonthStart;
        currentEnd = thisMonthEnd;
        previousLabel = 'Last Month';
        currentLabel = 'This Month';
        break;
      }
      case 'three-month': {
        // Last 3 months: 3-6 months ago
        // This 3 months: last 3 months
        const thisThreeMonthEnd = new Date(now);
        thisThreeMonthEnd.setHours(23, 59, 59, 999);
        const thisThreeMonthStart = new Date(now);
        thisThreeMonthStart.setMonth(now.getMonth() - 3);
        thisThreeMonthStart.setDate(1);
        thisThreeMonthStart.setHours(0, 0, 0, 0);
        
        const lastThreeMonthEnd = new Date(thisThreeMonthStart);
        lastThreeMonthEnd.setDate(0); // Last day of previous month
        lastThreeMonthEnd.setHours(23, 59, 59, 999);
        const lastThreeMonthStart = new Date(lastThreeMonthEnd);
        lastThreeMonthStart.setMonth(lastThreeMonthStart.getMonth() - 2);
        lastThreeMonthStart.setDate(1);
        lastThreeMonthStart.setHours(0, 0, 0, 0);
        
        previousStart = lastThreeMonthStart;
        previousEnd = lastThreeMonthEnd;
        currentStart = thisThreeMonthStart;
        currentEnd = thisThreeMonthEnd;
        previousLabel = 'Last 3 Months';
        currentLabel = 'This 3 Months';
        break;
      }
      case 'six-month': {
        // Last 6 months: 6-12 months ago
        // This 6 months: last 6 months
        const thisSixMonthEnd = new Date(now);
        thisSixMonthEnd.setHours(23, 59, 59, 999);
        const thisSixMonthStart = new Date(now);
        thisSixMonthStart.setMonth(now.getMonth() - 6);
        thisSixMonthStart.setDate(1);
        thisSixMonthStart.setHours(0, 0, 0, 0);
        
        const lastSixMonthEnd = new Date(thisSixMonthStart);
        lastSixMonthEnd.setDate(0);
        lastSixMonthEnd.setHours(23, 59, 59, 999);
        const lastSixMonthStart = new Date(lastSixMonthEnd);
        lastSixMonthStart.setMonth(lastSixMonthStart.getMonth() - 5);
        lastSixMonthStart.setDate(1);
        lastSixMonthStart.setHours(0, 0, 0, 0);
        
        previousStart = lastSixMonthStart;
        previousEnd = lastSixMonthEnd;
        currentStart = thisSixMonthStart;
        currentEnd = thisSixMonthEnd;
        previousLabel = 'Last 6 Months';
        currentLabel = 'This 6 Months';
        break;
      }
      case 'year': {
        // Last year: previous calendar year
        // This year: current calendar year
        const thisYearStart = new Date(now.getFullYear(), 0, 1);
        thisYearStart.setHours(0, 0, 0, 0);
        const thisYearEnd = new Date(now);
        thisYearEnd.setHours(23, 59, 59, 999);
        
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        lastYearStart.setHours(0, 0, 0, 0);
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
        lastYearEnd.setHours(23, 59, 59, 999);
        
        previousStart = lastYearStart;
        previousEnd = lastYearEnd;
        currentStart = thisYearStart;
        currentEnd = thisYearEnd;
        previousLabel = 'Last Year';
        currentLabel = 'This Year';
        break;
      }
    }

    // Get prices for both periods
    const previousPrices = await this.priceService.getPricesByDateRange(
      previousStart,
      previousEnd,
      productId,
    );

    const currentPrices = await this.priceService.getPricesByDateRange(
      currentStart,
      currentEnd,
      productId,
    );

    // Filter by product type if specified
    let filteredPreviousPrices = previousPrices;
    let filteredCurrentPrices = currentPrices;
    
    if (productType) {
      filteredPreviousPrices = previousPrices.filter(
        (p) => p.product.type === productType,
      );
      filteredCurrentPrices = currentPrices.filter(
        (p) => p.product.type === productType,
      );
    }

    // Group by product for both periods
    const previousProductGroups = new Map<number, any[]>();
    filteredPreviousPrices.forEach((price) => {
      if (!previousProductGroups.has(price.productId)) {
        previousProductGroups.set(price.productId, []);
      }
      previousProductGroups.get(price.productId)!.push(price);
    });

    const currentProductGroups = new Map<number, any[]>();
    filteredCurrentPrices.forEach((price) => {
      if (!currentProductGroups.has(price.productId)) {
        currentProductGroups.set(price.productId, []);
      }
      currentProductGroups.get(price.productId)!.push(price);
    });

    // Get all unique products from both periods
    const allProductIds = new Set([
      ...previousProductGroups.keys(),
      ...currentProductGroups.keys(),
    ]);

    const comparisons: any[] = [];
    let productsIncreased = 0;
    let productsDecreased = 0;
    let productsStable = 0;

    allProductIds.forEach((productId) => {
      const previousProductPrices = previousProductGroups.get(productId) || [];
      const currentProductPrices = currentProductGroups.get(productId) || [];

      // Skip if no data in current period
      if (currentProductPrices.length === 0) {
        return;
      }

      // Calculate averages for previous period
      let previousAvgPrice = 0;
      let previousAvgMinPrice = 0;
      let previousAvgMaxPrice = 0;
      let previousVolatility = 0;

      if (previousProductPrices.length > 0) {
        const prevMinPrices = previousProductPrices.map((p) => Number(p.minPrice));
        const prevMaxPrices = previousProductPrices.map((p) => Number(p.maxPrice));
        const prevAllPrices = [...prevMinPrices, ...prevMaxPrices];

        previousAvgMinPrice =
          prevMinPrices.reduce((a, b) => a + b, 0) / prevMinPrices.length;
        previousAvgMaxPrice =
          prevMaxPrices.reduce((a, b) => a + b, 0) / prevMaxPrices.length;
        previousAvgPrice = (previousAvgMinPrice + previousAvgMaxPrice) / 2;
        previousVolatility = this.calculateVolatility(prevAllPrices);
      }

      // Calculate averages for current period
      const currMinPrices = currentProductPrices.map((p) => Number(p.minPrice));
      const currMaxPrices = currentProductPrices.map((p) => Number(p.maxPrice));
      const currAllPrices = [...currMinPrices, ...currMaxPrices];

      const currentAvgMinPrice =
        currMinPrices.reduce((a, b) => a + b, 0) / currMinPrices.length;
      const currentAvgMaxPrice =
        currMaxPrices.reduce((a, b) => a + b, 0) / currMaxPrices.length;
      const currentAvgPrice = (currentAvgMinPrice + currentAvgMaxPrice) / 2;
      const currentVolatility = this.calculateVolatility(currAllPrices);

      // Calculate price change
      let priceChange = 0;
      let priceChangePercent = 0;
      let trend: 'increasing' | 'decreasing' | 'stable' | 'new' = 'stable';

      if (previousProductPrices.length > 0 && previousAvgPrice > 0) {
        priceChange = currentAvgPrice - previousAvgPrice;
        priceChangePercent = (priceChange / previousAvgPrice) * 100;

        if (priceChangePercent > 0.1) {
          trend = 'increasing';
          productsIncreased++;
        } else if (priceChangePercent < -0.1) {
          trend = 'decreasing';
          productsDecreased++;
        } else {
          productsStable++;
        }
      } else {
        // New product, no previous data
        trend = 'new';
      }

      comparisons.push({
        productId,
        productName: currentProductPrices[0].product.name,
        productType: currentProductPrices[0].product.type,
        previousAvgPrice: Math.round(previousAvgPrice * 100) / 100,
        previousAvgMinPrice: Math.round(previousAvgMinPrice * 100) / 100,
        previousAvgMaxPrice: Math.round(previousAvgMaxPrice * 100) / 100,
        currentAvgPrice: Math.round(currentAvgPrice * 100) / 100,
        currentAvgMinPrice: Math.round(currentAvgMinPrice * 100) / 100,
        currentAvgMaxPrice: Math.round(currentAvgMaxPrice * 100) / 100,
        priceChange: Math.round(priceChange * 100) / 100,
        priceChangePercent: Math.round(priceChangePercent * 100) / 100,
        previousVolatility: Math.round(previousVolatility * 100) / 100,
        currentVolatility: Math.round(currentVolatility * 100) / 100,
        trend,
        hasPreviousData: previousProductPrices.length > 0,
      });
    });

    // Sort by absolute price change percentage (largest changes first)
    comparisons.sort(
      (a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent),
    );

    return {
      comparisonType: periodType,
      previousPeriod: {
        start: previousStart.toISOString().split('T')[0],
        end: previousEnd.toISOString().split('T')[0],
        label: previousLabel,
      },
      currentPeriod: {
        start: currentStart.toISOString().split('T')[0],
        end: currentEnd.toISOString().split('T')[0],
        label: currentLabel,
      },
      comparisons,
      summary: {
        totalProducts: comparisons.length,
        productsIncreased,
        productsDecreased,
        productsStable,
      },
    };
  }

  /**
   * Excel-style matrix: one row per product, one column per calendar month in range.
   * Cell = average of daily mid-prices ((min+max)/2) for that product in that month (within [start, end]).
   */
  async getMonthlyAverageMatrix(
    startDateStr: string,
    endDateStr: string,
    productId?: number,
    productType?: string,
  ): Promise<{
    startDate: string;
    endDate: string;
    months: { key: string; label: string }[];
    products: {
      productId: number;
      productName: string;
      productType: string;
      monthlyAverages: { monthKey: string; avgPrice: number | null }[];
    }[];
  }> {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (Number.isNaN(+start) || Number.isNaN(+end)) {
      throw new BadRequestException('Invalid startDate or endDate');
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    if (start > end) {
      throw new BadRequestException('startDate must be on or before endDate');
    }

    const spanMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    if (spanMonths > 36) {
      throw new BadRequestException('Date range cannot exceed 36 months');
    }

    const months: { key: string; label: string }[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= endMonth) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const label = cursor.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      months.push({ key, label });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const prices = await this.priceService.getPricesByDateRange(
      start,
      end,
      productId,
    );

    let rows = prices;
    if (productType) {
      rows = prices.filter((p) => p.product?.type === productType);
    }

    type Bucket = Map<string, number[]>;
    const byProduct = new Map<number, Bucket>();
    const meta = new Map<
      number,
      { name: string; type: string }
    >();

    const monthKeySet = new Set(months.map((m) => m.key));

    for (const p of rows) {
      const pd = new Date(p.date);
      if (pd < start || pd > end) continue;

      const mid = (Number(p.minPrice) + Number(p.maxPrice)) / 2;
      const y = pd.getFullYear();
      const mo = pd.getMonth() + 1;
      const monthKey = `${y}-${String(mo).padStart(2, '0')}`;
      if (!monthKeySet.has(monthKey)) continue;

      if (!byProduct.has(p.productId)) {
        byProduct.set(p.productId, new Map());
      }
      const bucket = byProduct.get(p.productId)!;
      if (!bucket.has(monthKey)) {
        bucket.set(monthKey, []);
      }
      bucket.get(monthKey)!.push(mid);
      meta.set(p.productId, {
        name: p.product?.name ?? `Product ${p.productId}`,
        type: p.product?.type ?? '',
      });
    }

    const products = Array.from(byProduct.keys())
      .map((pid) => {
        const bucket = byProduct.get(pid)!;
        const m = meta.get(pid)!;
        const monthlyAverages = months.map(({ key }) => {
          const arr = bucket.get(key);
          if (!arr || arr.length === 0) {
            return { monthKey: key, avgPrice: null as number | null };
          }
          const avg =
            Math.round(
              (arr.reduce((a, b) => a + b, 0) / arr.length) * 100,
            ) / 100;
          return { monthKey: key, avgPrice: avg };
        });
        return {
          productId: pid,
          productName: m.name,
          productType: m.type,
          monthlyAverages,
        };
      })
      .sort((a, b) => a.productName.localeCompare(b.productName));

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      months,
      products,
    };
  }
}

