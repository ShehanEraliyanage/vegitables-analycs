import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { PriceModule } from '../price/price.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ScheduleModule.forRoot(),
    PriceModule,
    ProductModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}

