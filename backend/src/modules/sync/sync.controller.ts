import { Controller, Post } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('api/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('initial')
  async triggerInitialSync() {
    return this.syncService.initialSync();
  }

  @Post('daily')
  async triggerDailySync() {
    return this.syncService.dailySync();
  }
}

