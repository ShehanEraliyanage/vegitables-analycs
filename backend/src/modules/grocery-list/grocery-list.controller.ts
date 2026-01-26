import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { GroceryListService, CreateGroceryListDto } from './grocery-list.service';

@Controller('grocery-list')
export class GroceryListController {
  constructor(private readonly groceryListService: GroceryListService) {}

  @Get('price')
  async getPrice(
    @Query('productId') productId: string,
    @Query('isOrganic') isOrganic: string,
  ) {
    const pid = productId ? +productId : undefined;
    const organic = isOrganic === 'true' || isOrganic === '1';
    if (pid == null || isNaN(pid)) {
      return { error: 'productId is required and must be a number' };
    }
    const result = await this.groceryListService.getPriceForProduct(pid, organic);
    return { data: result };
  }

  @Get()
  async findAll() {
    const lists = await this.groceryListService.findAll();
    return { data: lists };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const list = await this.groceryListService.findOne(+id);
    return { data: list };
  }

  @Post()
  async create(@Body() dto: CreateGroceryListDto) {
    const list = await this.groceryListService.create(dto);
    return { data: list };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateGroceryListDto>) {
    const list = await this.groceryListService.update(+id, dto);
    return { data: list };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.groceryListService.delete(+id);
    return { success: true };
  }
}
