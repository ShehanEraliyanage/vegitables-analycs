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

  async syncDate(date: Date, retries = 3): Promise<{ success: boolean; dataFound: boolean; count: number }> {
    const dateStr = date.toISOString().split('T')[0];

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.log(`Fetching data for ${dateStr} (attempt ${attempt})`);
        const data = await this.fetchPriceData(dateStr);
        
        if (data.length === 0) {
          this.logger.warn(`No data found for date ${dateStr}`);
          return { success: true, dataFound: false, count: 0 };
        }

        await this.processPriceData(data);
        this.logger.log(`Successfully synced ${data.length} entries for ${dateStr}`);
        return { success: true, dataFound: true, count: data.length };
      } catch (error) {
        if (attempt === retries) {
          this.logger.error(`Failed to sync ${dateStr} after ${retries} attempts`);
          return { success: false, dataFound: false, count: 0 };
        }
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    return { success: false, dataFound: false, count: 0 };
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
        const result = await this.syncDate(new Date(currentDate));
        if (result.success) {
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

  async dailySync(): Promise<{ success: boolean; message: string; dataFound?: boolean; count?: number }> {
    const today = new Date();
    // Set to Sri Lanka timezone
    const slTime = new Date(
      today.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }),
    );
    const todayDateStr = slTime.toISOString().split('T')[0];
    const todayDate = new Date(todayDateStr + 'T00:00:00');

    this.logger.log(`Starting daily sync (checking for missed dates up to ${todayDateStr})`);

    try {
      // Get the latest synced date from database
      const latestSyncedDate = await this.priceService.getLatestSyncedDate();
      
      let startDate: Date;
      if (latestSyncedDate) {
        // Start from the day after the latest synced date
        startDate = new Date(latestSyncedDate);
        startDate.setDate(startDate.getDate() + 1);
        // Reset time to start of day
        startDate.setHours(0, 0, 0, 0);
      } else {
        // If no data exists, sync only today
        startDate = new Date(todayDate);
        this.logger.log('No previous sync found, syncing only today');
      }

      // Ensure we don't sync future dates
      const endDate = todayDate;
      
      // If startDate is after today, nothing to sync
      if (startDate > endDate) {
        this.logger.log(`No missed dates to sync. Latest synced date: ${latestSyncedDate ? latestSyncedDate.toISOString().split('T')[0] : 'none'}`);
        return {
          success: true,
          message: `No missed dates to sync. Already up to date.`,
          dataFound: false,
          count: 0
        };
      }

      // Sync all dates from startDate to today (inclusive)
      let totalSynced = 0;
      let totalDataFound = 0;
      let failedDates: string[] = [];
      const datesToSync: Date[] = [];

      // Build list of dates to sync
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        datesToSync.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.logger.log(`Found ${datesToSync.length} date(s) to sync: ${datesToSync.map(d => d.toISOString().split('T')[0]).join(', ')}`);

      // Sync each date
      for (const dateToSync of datesToSync) {
        const dateStr = dateToSync.toISOString().split('T')[0];
        this.logger.log(`Syncing date: ${dateStr}`);
        
        const result = await this.syncDate(dateToSync);
        
        if (result.success) {
          if (result.dataFound) {
            totalSynced += result.count || 0;
            totalDataFound++;
            this.logger.log(`Successfully synced ${dateStr}: ${result.count} entries`);
          } else {
            this.logger.log(`No data available for ${dateStr}`);
          }
        } else {
          failedDates.push(dateStr);
          this.logger.warn(`Failed to sync ${dateStr}`);
        }

        // Small delay between dates to avoid overwhelming the API
        if (datesToSync.indexOf(dateToSync) < datesToSync.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Build response message
      let message = '';
      if (datesToSync.length === 1 && datesToSync[0].toISOString().split('T')[0] === todayDateStr) {
        // Only synced today
        if (totalDataFound > 0) {
          message = `Daily sync completed for ${todayDateStr}. Synced ${totalSynced} price entries.`;
        } else {
          message = `No data available for ${todayDateStr}`;
        }
      } else {
        // Synced multiple dates (catch-up)
        const syncedDates = datesToSync.length - failedDates.length;
        message = `Sync completed. Processed ${datesToSync.length} date(s), synced ${syncedDates} date(s) with ${totalSynced} total entries.`;
        if (failedDates.length > 0) {
          message += ` Failed dates: ${failedDates.join(', ')}`;
        }
      }

      return {
        success: failedDates.length === 0,
        message,
        dataFound: totalDataFound > 0,
        count: totalSynced
      };
    } catch (error) {
      this.logger.error(`Daily sync failed: ${error.message}`);
      return {
        success: false,
        message: `Daily sync failed: ${error.message}`,
        dataFound: false,
        count: 0
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

