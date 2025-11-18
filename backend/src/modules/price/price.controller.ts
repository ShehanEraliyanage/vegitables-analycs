import { Controller, Get, Param, Query } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('api/prices')
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const price = await this.priceService.findOne(+id);
    return { data: price };
  }
}

