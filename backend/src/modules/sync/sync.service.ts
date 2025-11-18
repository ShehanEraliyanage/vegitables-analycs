import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { PriceService } from '../price/price.service';
import { ProductService } from '../product/product.service';

interface ApiPriceResponse {
  id: number;
  date: string;
  min_price: number;
  max_price: number;
  product: {
    id: number;
    name: string;
    type: string;
  };
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private isInitialSyncRunning = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly priceService: PriceService,
    private readonly productService: ProductService,
  ) {}

  private async fetchPriceData(date: string): Promise<ApiPriceResponse[]> {
    const apiUrl = this.configService.get<string>(
      'EXTERNAL_API_URL',
      'https://api.dambulladec.com/api/prices/by-date',
    );

    if (!apiUrl) {
      throw new Error('EXTERNAL_API_URL is not configured');
    }

    // Ensure URL doesn't have trailing slash
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    const url = `${baseUrl}/${date}`;

    this.logger.debug(`Fetching from URL: ${url}`);

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data || [];
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      this.logger.error(
        `Failed to fetch data for date ${date} from ${url}: ${errorMessage}`,
      );
      throw error;
    }
  }

  private async processPriceData(data: ApiPriceResponse[]): Promise<void> {
    for (const item of data) {
      try {
        // Create or update product
        const product = await this.productService.createOrUpdate(
          item.product.id,
          item.product.name,
          item.product.type,
        );

        // Check if price entry already exists
        const existingPrice = await this.priceService.findByApiIdAndDate(
          item.id,
          new Date(item.date),
        );

        if (!existingPrice) {
          // Create new price entry
          await this.priceService.create(
            item.id,
            new Date(item.date),
            item.min_price,
            item.max_price,
            product.id,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to process price data for ID ${item.id}: ${error.message}`,
        );
      }
    }
  }

  async syncDate(date: Date, retries = 3): Promise<boolean> {
    const dateStr = date.toISOString().split('T')[0];

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.log(`Fetching data for ${dateStr} (attempt ${attempt})`);
        const data = await this.fetchPriceData(dateStr);
        
        if (data.length === 0) {
          this.logger.warn(`No data found for date ${dateStr}`);
          return true;
        }

        await this.processPriceData(data);
        this.logger.log(`Successfully synced ${data.length} entries for ${dateStr}`);
        return true;
      } catch (error) {
        if (attempt === retries) {
          this.logger.error(`Failed to sync ${dateStr} after ${retries} attempts`);
          return false;
        }
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    return false;
  }

  async initialSync(): Promise<{ success: boolean; message: string }> {
    if (this.isInitialSyncRunning) {
      return {
        success: false,
        message: 'Initial sync is already running',
      };
    }

    this.isInitialSyncRunning = true;
    const startDate = new Date('2025-05-05');
    const endDate = new Date('2025-11-17');
    let successCount = 0;
    let failCount = 0;
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    this.logger.log(`Starting initial sync from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    try {
      const currentDate = new Date(startDate);
      let processedDays = 0;

      while (currentDate <= endDate) {
        const success = await this.syncDate(new Date(currentDate));
        if (success) {
          successCount++;
        } else {
          failCount++;
        }

        processedDays++;
        if (processedDays % 10 === 0) {
          this.logger.log(
            `Progress: ${processedDays}/${totalDays} days processed`,
          );
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);

        // Small delay to avoid overwhelming the API
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const message = `Initial sync completed. Success: ${successCount}, Failed: ${failCount}`;
      this.logger.log(message);
      return { success: true, message };
    } catch (error) {
      this.logger.error(`Initial sync failed: ${error.message}`);
      return {
        success: false,
        message: `Initial sync failed: ${error.message}`,
      };
    } finally {
      this.isInitialSyncRunning = false;
    }
  }

  async dailySync(): Promise<{ success: boolean; message: string }> {
    const today = new Date();
    // Set to Sri Lanka timezone
    const slTime = new Date(
      today.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }),
    );
    const dateStr = slTime.toISOString().split('T')[0];

    this.logger.log(`Starting daily sync for ${dateStr}`);

    try {
      const success = await this.syncDate(slTime);
      if (success) {
        return { success: true, message: `Daily sync completed for ${dateStr}` };
      } else {
        return { success: false, message: `Daily sync failed for ${dateStr}` };
      }
    } catch (error) {
      this.logger.error(`Daily sync failed: ${error.message}`);
      return {
        success: false,
        message: `Daily sync failed: ${error.message}`,
      };
    }
  }

  @Cron('0 14 * * *', {
    timeZone: 'Asia/Colombo',
  })
  async handleCron() {
    this.logger.log('Cron job triggered for daily sync at 2:00 PM');
    await this.dailySync();
  }
}

