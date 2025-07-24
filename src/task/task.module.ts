import { Module, forwardRef } from '@nestjs/common';
import { TaskService } from './task.service';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    forwardRef(() => TelegramModule),
  ],
  providers: [TaskService, NotificationService],
  exports: [TaskService],
})
export class TaskModule {}
