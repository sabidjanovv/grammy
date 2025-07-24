import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramModule } from './telegram/telegram.module';
import { TaskModule } from './task/task.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    ScheduleModule.forRoot(),
    TelegramModule,
    TaskModule,
  ],
})
export class AppModule {}
