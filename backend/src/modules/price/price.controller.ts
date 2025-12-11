import { Controller, Get, Param, Query } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('check-date')
  async checkDate(@Query('date') date?: string) {
    const checkDate = date ? new Date(date) : new Date();
    // Set to Sri Lanka timezone and get today's date
    const slTime = new Date(
      checkDate.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }),
    );
    const dateStr = slTime.toISOString().split('T')[0];
    const dateObj = new Date(dateStr);
    
    const exists = await this.priceService.checkDateExists(dateObj);
    return {
      date: dateStr,
      exists,
    };
  }

  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const product = productId ? +productId : undefined;
    const limitNum = limit ? +limit : 20;
    const offsetNum = offset ? +offset : 0;

    return this.priceService.findAll(start, end, product, limitNum, offsetNum);
  }

  @Get('today')
  async getTodayPrices() {
    const prices = await this.priceService.getTodayPrices();
    return { data: prices, date: new Date().toISOString().split('T')[0] };
  }

  @Get('latest')
  async getLatestPrices() {
    const prices = await this.priceService.getLatestPrices();
    const latestDate = prices.length > 0 ? prices[0].date : null;
    return { 
      data: prices, 
      date: latestDate ? new Date(latestDate).toISOString().split('T')[0] : null 
    };
  }

  @Get('product/:productId/last')
  async getLastPriceForProduct(@Param('productId') productId: string) {
    const price = await this.priceService.getLastPriceForProduct(+productId);
    if (!price) {
      return { data: null, message: 'No price data found for this product' };
    }
    
    // Determine if it's today, yesterday, or older
    const today = new Date();
    const slTime = new Date(
      today.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }),
    );
    const todayStr = slTime.toISOString().split('T')[0];
    const priceDateStr = new Date(price.date).toISOString().split('T')[0];
    
    const yesterday = new Date(slTime);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let dateLabel = 'Older';
    if (priceDateStr === todayStr) {
      dateLabel = 'Today';
    } else if (priceDateStr === yesterdayStr) {
      dateLabel = 'Yesterday';
    } else {
      const daysDiff = Math.floor((slTime.getTime() - new Date(priceDateStr).getTime()) / (1000 * 60 * 60 * 24));
      dateLabel = `${daysDiff} days ago`;
    }
    
    return { 
      data: price, 
      dateLabel,
      date: priceDateStr,
    };
  }

  @Get('missing-dates')
  async getMissingDates() {
    const result = await this.priceService.getMissingDates();
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const price = await this.priceService.findOne(+id);
    return { data: price };
  }
}

