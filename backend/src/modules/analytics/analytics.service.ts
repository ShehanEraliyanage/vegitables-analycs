import { Injectable } from '@nestjs/common';
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
}

