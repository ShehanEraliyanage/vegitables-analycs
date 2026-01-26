import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@Query('type') type?: string) {
    const products = await this.productService.findAll(type);
    return {
      data: products,
      count: products.length,
    };
  }

  @Get('search')
  async search(@Query('q') q?: string, @Query('limit') limit?: string) {
    const products = await this.productService.searchByName(
      q || '',
      limit ? +limit : 20,
    );
    return { data: products, count: products.length };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(+id);
    return { data: product };
  }
}

