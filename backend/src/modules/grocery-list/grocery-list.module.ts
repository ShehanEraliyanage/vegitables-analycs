import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroceryList } from '../../common/entities/grocery-list.entity';
import { GroceryListItem } from '../../common/entities/grocery-list-item.entity';
import { GroceryListService } from './grocery-list.service';
import { GroceryListController } from './grocery-list.controller';
import { PriceModule } from '../price/price.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroceryList, GroceryListItem]),
    PriceModule,
    ProductModule,
  ],
  controllers: [GroceryListController],
  providers: [GroceryListService],
  exports: [GroceryListService],
})
export class GroceryListModule {}
