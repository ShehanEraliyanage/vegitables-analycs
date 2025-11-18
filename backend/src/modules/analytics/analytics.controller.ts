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
}

