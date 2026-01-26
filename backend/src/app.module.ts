import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { ProductModule } from './modules/product/product.module';
import { PriceModule } from './modules/price/price.module';
import { SyncModule } from './modules/sync/sync.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { GroceryListModule } from './modules/grocery-list/grocery-list.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ProductModule,
    PriceModule,
    SyncModule,
    AnalyticsModule,
    GroceryListModule,
  ],
})
export class AppModule {}

