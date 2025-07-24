import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskService } from './task.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly taskService: TaskService,
    private readonly telegramService: TelegramService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkTaskNotifications() {
    try {
      const tasksDue = await this.taskService.getTasksDueForNotification();

      for (const task of tasksDue) {
        const message = this.createNotificationMessage(task);
        await this.telegramService.sendNotification(task.userId, message);
        await this.taskService.markAsNotified(task.id);

        this.logger.log(
          `Notification sent for task: ${task.title} to user: ${task.userId}`,
        );
      }
    } catch (error) {
      this.logger.error('Error checking task notifications', error);
    }
  }

  private createNotificationMessage(task: any): string {
    const priorityEmoji = this.getPriorityEmoji(task.priority);
    const date = new Date(task.dueDate).toLocaleString('uz-UZ');

    return (
      `⏰ Vazifa vaqti keldi!\n\n` +
      `📝 Vazifa: ${task.title}\n` +
      `${priorityEmoji} Daraja: ${task.priority}\n` +
      `📅 Vaqt: ${date}\n\n` +
      `✅ Bajarilgan bo'lsa /complete buyrug'ini ishlating.`
    );
  }

  private getPriorityEmoji(priority: string): string {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  }
}
