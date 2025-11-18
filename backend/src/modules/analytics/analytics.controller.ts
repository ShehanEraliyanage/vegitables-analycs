import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService, AnalyticsResponse } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('weekly')
  async getWeekly(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
  ): Promise<AnalyticsResponse> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const product = productId ? +productId : undefined;
    return this.analyticsService.getWeeklyAnalysis(start, end, product);
  }

  @Get('monthly')
  async getMonthly(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
  ): Promise<AnalyticsResponse> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const product = productId ? +productId : undefined;
    return this.analyticsService.getMonthlyAnalysis(start, end, product);
  }

  @Get('quarterly')
  async getQuarterly(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
  ): Promise<AnalyticsResponse> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const product = productId ? +productId : undefined;
    return this.analyticsService.getQuarterlyAnalysis(start, end, product);
  }

  @Get('six-month')
  async getSixMonth(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
  ): Promise<AnalyticsResponse> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const product = productId ? +productId : undefined;
    return this.analyticsService.getSixMonthAnalysis(start, end, product);
  }

  @Get('annual')
  async getAnnual(
    @Query('year') year?: string,
    @Query('productId') productId?: string,
  ): Promise<AnalyticsResponse> {
    const yearNum = year ? +year : undefined;
    const product = productId ? +productId : undefined;
    return this.analyticsService.getAnnualAnalysis(yearNum, product);
  }

  @Get('stats')
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const product = productId ? +productId : undefined;
    return this.analyticsService.getStatistics(start, end, product);
  }

  @Get('trends')
  async getTrends(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const product = productId ? +productId : undefined;
    return this.analyticsService.getPriceTrends(start, end, product);
  }

  @Get('top-performers')
  async getTopPerformers(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const limitNum = limit ? +limit : 10;
    return this.analyticsService.getTopPerformers(start, end, limitNum);
  }

  @Get('compare')
  async compareProducts(
    @Query('productIds') productIds: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const ids = productIds.split(',').map((id) => +id.trim());
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.compareProducts(ids, start, end);
  }

  @Get('seasonal')
  async getSeasonal(
    @Query('year') year?: string,
    @Query('productId') productId?: string,
  ) {
    const yearNum = year ? +year : undefined;
    const product = productId ? +productId : undefined;
    return this.analyticsService.getSeasonalAnalysis(yearNum, product);
  }

  @Get('distribution')
  async getDistribution(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const product = productId ? +productId : undefined;
    return this.analyticsService.getPriceDistribution(start, end, product);
  }
}

