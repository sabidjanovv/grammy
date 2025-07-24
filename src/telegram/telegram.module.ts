import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TaskModule } from '../task/task.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TaskModule, ConfigModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
