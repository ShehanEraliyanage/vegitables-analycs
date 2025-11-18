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
}

