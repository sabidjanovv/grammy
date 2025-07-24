// import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Bot, Context, session, SessionFlavor } from 'grammy';
// import { TaskService } from '../task/task.service';
// import { CreateTaskDto } from '../task/dto/create-task.dto';
// import { TaskPriority, TaskStatus } from '../task/schemas/task.schema';

// interface SessionData {
//   step?: string;
//   taskData?: Partial<CreateTaskDto>;
// }

// type MyContext = Context & SessionFlavor<SessionData>;

// @Injectable()
// export class TelegramService implements OnModuleInit {
//   private bot: Bot<MyContext>;
//   private readonly logger = new Logger(TelegramService.name);

//   constructor(private taskService: TaskService) {
//     const token =
//       process.env.BOT_TOKEN || '7361479743:AAGKhaGgKOuiFgTEHBBcuGmjINDs50hlQTM';
//     if (!token) {
//       throw new Error('TELEGRAM_BOT_TOKEN is not provided');
//     }

//     this.bot = new Bot<MyContext>(token);
//     this.setupMiddleware();
//     this.setupCommands();
//   }

//   async onModuleInit() {
//     try {
//       await this.bot.start();
//       this.logger.log('Telegram bot started successfully');
//     } catch (error) {
//       this.logger.error('Failed to start Telegram bot', error);
//     }
//   }

//   private setupMiddleware() {
//     this.bot.use(session({ initial: (): SessionData => ({}) }));
//   }

//   private setupCommands() {
//     // Start command
//     this.bot.command('start', (ctx) => {
//       ctx.reply(
//         '🤖 To-Do Bot ga xush kelibsiz!\n\n' +
//           'Mavjud buyruqlar:\n' +
//           "/add - Yangi vazifa qo'shish\n" +
//           "/tasks - Barcha vazifalar ro'yxati\n" +
//           '/complete - Vazifani bajarilgan deb belgilash\n' +
//           "/delete - Vazifani o'chirish\n" +
//           '/help - Yordam',
//       );
//     });

//     // Help command
//     this.bot.command('help', (ctx) => {
//       ctx.reply(
//         '📋 To-Do Bot yordami:\n\n' +
//           "🆕 /add - Yangi vazifa qo'shish\n" +
//           'Format: Vazifa nomi, vaqt (kk.oo.yy ss:dd), daraja (low/medium/high)\n\n' +
//           '📋 /tasks - Barcha vazifalar\n' +
//           '✅ /complete - Vazifani yakunlash\n' +
//           "🗑 /delete - Vazifani o'chirish\n\n" +
//           'Misol vaqt formati: 21.07.25 14:30',
//       );
//     });

//     // Add task command
//     this.bot.command('add', (ctx) => {
//       ctx.session.step = 'waiting_task_name';
//       ctx.session.taskData = {};
//       ctx.reply('📝 Vazifa nomini kiriting:');
//     });

//     // List tasks command
//     this.bot.command('tasks', async (ctx) => {
//       try {
//         const tasks = await this.taskService.findAllByUserId(ctx.from.id);

//         if (tasks.length === 0) {
//           ctx.reply("📋 Sizda hozircha vazifalar yo'q.");
//           return;
//         }

//         let message = '📋 Sizning vazifalaringiz:\n\n';

//         tasks.forEach((task, index) => {
//           const status = task.status === TaskStatus.COMPLETED ? '✅' : '⏳';
//           const priority = this.getPriorityEmoji(task.priority);
//           const date = new Date(task.dueDate).toLocaleString('uz-UZ');

//           message += `${index + 1}. ${status} ${task.title}\n`;
//           message += `   ${priority} Daraja: ${task.priority}\n`;
//           message += `   📅 Vaqt: ${date}\n`;
//           message += `   📊 Holat: ${task.status}\n\n`;
//         });

//         ctx.reply(message);
//       } catch (error) {
//         this.logger.error('Error fetching tasks', error);
//         ctx.reply('❌ Vazifalarni olishda xatolik yuz berdi.');
//       }
//     });

//     // Complete task command
//     this.bot.command('complete', async (ctx) => {
//       try {
//         const tasks = await this.taskService.findAllByUserId(ctx.from.id);
//         const activeTasks = tasks.filter(
//           (task) => task.status === TaskStatus.ACTIVE,
//         );

//         if (activeTasks.length === 0) {
//           ctx.reply("📋 Bajarilmagan vazifalar yo'q.");
//           return;
//         }

//         let message = '✅ Qaysi vazifani bajarilgan deb belgilamoqchisiz?\n\n';
//         activeTasks.forEach((task, index) => {
//           message += `${index + 1}. ${task.title}\n`;
//         });

//         message += '\nVazifa raqamini kiriting:';
//         ctx.session.step = 'waiting_complete_task';
//         ctx.reply(message);
//       } catch (error) {
//         this.logger.error('Error in complete command', error);
//         ctx.reply('❌ Xatolik yuz berdi.');
//       }
//     });

//     // Delete task command
//     this.bot.command('delete', async (ctx) => {
//       try {
//         const tasks = await this.taskService.findAllByUserId(ctx.from.id);

//         if (tasks.length === 0) {
//           ctx.reply("📋 O'chiriladigan vazifalar yo'q.");
//           return;
//         }

//         let message = "🗑 Qaysi vazifani o'chirmoqchisiz?\n\n";
//         tasks.forEach((task, index) => {
//           message += `${index + 1}. ${task.title}\n`;
//         });

//         message += '\nVazifa raqamini kiriting:';
//         ctx.session.step = 'waiting_delete_task';
//         ctx.reply(message);
//       } catch (error) {
//         this.logger.error('Error in delete command', error);
//         ctx.reply('❌ Xatolik yuz berdi.');
//       }
//     });

//     // Handle text messages based on session step
//     this.bot.on('message:text', async (ctx) => {
//       const step = ctx.session.step;
//       const text = ctx.message.text;

//       switch (step) {
//         case 'waiting_task_name':
//           ctx.session.taskData.title = text;
//           ctx.session.step = 'waiting_task_time';
//           ctx.reply(
//             '📅 Vazifa vaqtini kiriting (format: kk.oo.yy ss:dd):\nMisol: 21.07.25 14:30',
//           );
//           break;

//         case 'waiting_task_time':
//           if (this.isValidDateFormat(text)) {
//             ctx.session.taskData.dueDate = this.parseDate(text);
//             ctx.session.step = 'waiting_task_priority';
//             ctx.reply('📊 Vazifa darajasini kiriting (low, medium, high):');
//           } else {
//             ctx.reply(
//               "❌ Noto'g'ri vaqt formati. Iltimos, kk.oo.yy ss:dd formatida kiriting.\nMisol: 21.07.25 14:30",
//             );
//           }
//           break;

//         case 'waiting_task_priority':
//           const priority = text.toLowerCase();
//           if (['low', 'medium', 'high'].includes(priority)) {
//             ctx.session.taskData.priority = priority as TaskPriority;
//             ctx.session.taskData.userId = ctx.from.id;

//             try {
//               await this.taskService.create(
//                 ctx.session.taskData as CreateTaskDto,
//               );
//               ctx.reply("✅ Vazifa muvaffaqiyatli qo'shildi!");
//             } catch (error) {
//               this.logger.error('Error creating task', error);
//               ctx.reply("❌ Vazifani qo'shishda xatolik yuz berdi.");
//             }

//             ctx.session.step = undefined;
//             ctx.session.taskData = undefined;
//           } else {
//             ctx.reply(
//               "❌ Noto'g'ri daraja. Iltimos, low, medium yoki high dan birini tanlang.",
//             );
//           }
//           break;

//         case 'waiting_complete_task':
//           const completeIndex = parseInt(text) - 1;
//           try {
//             const tasks = await this.taskService.findAllByUserId(ctx.from.id);
//             const activeTasks = tasks.filter(
//               (task) => task.status === TaskStatus.ACTIVE,
//             );

//             if (completeIndex >= 0 && completeIndex < activeTasks.length) {
//               await this.taskService.updateStatus(
//                 activeTasks[completeIndex].id,
//                 TaskStatus.COMPLETED,
//               );
//               ctx.reply('✅ Vazifa bajarilgan deb belgilandi!');
//             } else {
//               ctx.reply(
//                 "❌ Noto'g'ri raqam. Iltimos, ro'yxatdagi raqamni kiriting.",
//               );
//             }
//           } catch (error) {
//             this.logger.error('Error completing task', error);
//             ctx.reply('❌ Xatolik yuz berdi.');
//           }
//           ctx.session.step = undefined;
//           break;

//         case 'waiting_delete_task':
//           const deleteIndex = parseInt(text) - 1;
//           try {
//             const tasks = await this.taskService.findAllByUserId(ctx.from.id);

//             if (deleteIndex >= 0 && deleteIndex < tasks.length) {
//               await this.taskService.remove(tasks[deleteIndex].id);
//               ctx.reply("🗑 Vazifa o'chirildi!");
//             } else {
//               ctx.reply(
//                 "❌ Noto'g'ri raqam. Iltimos, ro'yxatdagi raqamni kiriting.",
//               );
//             }
//           } catch (error) {
//             this.logger.error('Error deleting task', error);
//             ctx.reply('❌ Xatolik yuz berdi.');
//           }
//           ctx.session.step = undefined;
//           break;

//         default:
//           ctx.reply("❓ Tushunmadim. /help buyrug'i orqali yordam oling.");
//       }
//     });
//   }

//   private isValidDateFormat(dateStr: string): boolean {
//     const pattern = /^\d{2}\.\d{2}\.\d{2}\s\d{2}:\d{2}$/;
//     return pattern.test(dateStr);
//   }

//   private parseDate(dateStr: string): Date {
//     const [datePart, timePart] = dateStr.split(' ');
//     const [day, month, year] = datePart.split('.').map(Number);
//     const [hours, minutes] = timePart.split(':').map(Number);

//     return new Date(2000 + year, month - 1, day, hours, minutes);
//   }

//   private getPriorityEmoji(priority: TaskPriority): string {
//     switch (priority) {
//       case TaskPriority.HIGH:
//         return '🔴';
//       case TaskPriority.MEDIUM:
//         return '🟡';
//       case TaskPriority.LOW:
//         return '🟢';
//       default:
//         return '⚪';
//     }
//   }

//   async sendNotification(userId: number, message: string) {
//     try {
//       await this.bot.api.sendMessage(userId, message);
//     } catch (error) {
//       this.logger.error(`Failed to send notification to user ${userId}`, error);
//     }
//   }
// }



// src/telegram/telegram.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, Context, session, SessionFlavor } from 'grammy';
import { TaskService } from '../task/task.service';
import { CreateTaskDto } from '../task/dto/create-task.dto';
import { TaskDocument, TaskPriority, TaskStatus } from '../task/schemas/task.schema';

interface SessionData {
  step?: string;
  taskData?: Partial<CreateTaskDto>;
}

type MyContext = Context & SessionFlavor<SessionData>;

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Bot<MyContext>;
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private taskService: TaskService,
    private configService: ConfigService,
  ) {
    const token = this.configService.get<string>('BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not provided');
    }

    this.bot = new Bot<MyContext>(token);
    this.setupMiddleware();
    this.setupCommands();
  }

  async onModuleInit() {
    try {
      await this.bot.start();
      this.logger.log('Telegram bot started successfully');
    } catch (error) {
      this.logger.error('Failed to start Telegram bot', error);
    }
  }

  private setupMiddleware() {
    this.bot.use(session({ initial: (): SessionData => ({}) }));
  }

  private setupCommands() {
    // Start command
    this.bot.command('start', (ctx) => {
      ctx.reply(
        '🤖 To-Do Bot ga xush kelibsiz!\n\n' +
          'Mavjud buyruqlar:\n' +
          "/add - Yangi vazifa qo'shish\n" +
          "/tasks - Barcha vazifalar ro'yxati\n" +
          '/complete - Vazifani bajarilgan deb belgilash\n' +
          "/delete - Vazifani o'chirish\n" +
          '/help - Yordam',
      );
    });

    // Help command
    this.bot.command('help', (ctx) => {
      ctx.reply(
        '📋 To-Do Bot yordami:\n\n' +
          "🆕 /add - Yangi vazifa qo'shish\n" +
          'Format: Vazifa nomi, vaqt (kk.oo.yy ss:dd), daraja (low/medium/high)\n\n' +
          '📋 /tasks - Barcha vazifalar\n' +
          '✅ /complete - Vazifani yakunlash\n' +
          "🗑 /delete - Vazifani o'chirish\n\n" +
          'Misol vaqt formati: 21.07.25 14:30',
      );
    });

    // Add task command
    this.bot.command('add', (ctx) => {
      ctx.session.step = 'waiting_task_name';
      ctx.session.taskData = {};
      ctx.reply('📝 Vazifa nomini kiriting:');
    });

    // List tasks command
    this.bot.command('tasks', async (ctx) => {
      try {
        const tasks = await this.taskService.findAllByUserId(ctx.from.id);

        if (tasks.length === 0) {
          ctx.reply("📋 Sizda hozircha vazifalar ye'q.");
          return;
        }

        let message = '📋 Sizning vazifalaringiz:\n\n';

        tasks.forEach((task, index) => {
          const status = task.status === TaskStatus.COMPLETED ? '✅' : '⏳';
          const priority = this.getPriorityEmoji(task.priority);
          const date = new Date(task.dueDate).toLocaleString('uz-UZ');

          message += `${index + 1}. ${status} ${task.title}\n`;
          message += `   ${priority} Daraja: ${task.priority}\n`;
          message += `   📅 Vaqt: ${date}\n`;
          message += `   📊 Holat: ${task.status}\n\n`;
        });

        ctx.reply(message);
      } catch (error) {
        this.logger.error('Error fetching tasks', error);
        ctx.reply('❌ Vazifalarni olishda xatolik yuz berdi.');
      }
    });

    // Complete task command
    this.bot.command('complete', async (ctx) => {
      try {
        const tasks = await this.taskService.findAllByUserId(ctx.from.id);
        const activeTasks = tasks.filter(
          (task) => task.status === TaskStatus.ACTIVE,
        );

        if (activeTasks.length === 0) {
          ctx.reply("📋 Bajarilmagan vazifalar yo'q.");
          return;
        }

        let message = '✅ Qaysi vazifani bajarilgan deb belgilamoqchisiz?\n\n';
        activeTasks.forEach((task, index) => {
          message += `${index + 1}. ${task.title}\n`;
        });

        message += '\nVazifa raqamini kiriting:';
        ctx.session.step = 'waiting_complete_task';
        ctx.reply(message);
      } catch (error) {
        this.logger.error('Error in complete command', error);
        ctx.reply('❌ Xatolik yuz berdi.');
      }
    });

    // Delete task command
    this.bot.command('delete', async (ctx) => {
      try {
        const tasks = await this.taskService.findAllByUserId(ctx.from.id);

        if (tasks.length === 0) {
          ctx.reply("📋 O'chiriladigan vazifalar yo'q.");
          return;
        }

        let message = "🗑 Qaysi vazifani o'chirmoqchisiz?\n\n";
        tasks.forEach((task, index) => {
          message += `${index + 1}. ${task.title}\n`;
        });

        message += '\nVazifa raqamini kiriting:';
        ctx.session.step = 'waiting_delete_task';
        ctx.reply(message);
      } catch (error) {
        this.logger.error('Error in delete command', error);
        ctx.reply('❌ Xatolik yuz berdi.');
      }
    });

    // Handle text messages based on session step
    this.bot.on('message:text', async (ctx) => {
      const step = ctx.session.step;
      const text = ctx.message.text;

      switch (step) {
        case 'waiting_task_name':
          ctx.session.taskData.title = text;
          ctx.session.step = 'waiting_task_time';
          ctx.reply(
            '📅 Vazifa vaqtini kiriting (format: kk.oo.yy ss:dd):\nMisol: 21.07.25 14:30',
          );
          break;

        case 'waiting_task_time':
          if (this.isValidDateFormat(text)) {
            ctx.session.taskData.dueDate = this.parseDate(text);
            ctx.session.step = 'waiting_task_priority';
            ctx.reply('📊 Vazifa darajasini kiriting (low, medium, high):');
          } else {
            ctx.reply(
              "❌ Noto'g'ri vaqt formati. Iltimos, kk.oo.yy ss:dd formatida kiriting.\nMisol: 21.07.25 14:30",
            );
          }
          break;

        case 'waiting_task_priority':
          const priority = text.toLowerCase();
          if (['low', 'medium', 'high'].includes(priority)) {
            ctx.session.taskData.priority = priority as TaskPriority;
            ctx.session.taskData.userId = ctx.from.id;

            try {
              await this.taskService.create(
                ctx.session.taskData as CreateTaskDto,
              );
              ctx.reply("✅ Vazifa muvaffaqiyatli qo'shildi!");
            } catch (error) {
              this.logger.error('Error creating task', error);
              ctx.reply("❌ Vazifani qo'shishda xatolik yuz berdi.");
            }

            ctx.session.step = undefined;
            ctx.session.taskData = undefined;
          } else {
            ctx.reply(
              "❌ Noto'g'ri daraja. Iltimos, low, medium yoki high dan birini tanlang.",
            );
          }
          break;

        case 'waiting_complete_task':
          const completeIndex = parseInt(text) - 1;
          try {
            const tasks = await this.taskService.findAllByUserId(ctx.from.id);
            const activeTasks = tasks.filter(
              (task) => task.status === TaskStatus.ACTIVE,
            );

            if (completeIndex >= 0 && completeIndex < activeTasks.length) {
              await this.taskService.updateStatus(
                activeTasks[completeIndex]._id.toString(), // Use _id and convert to string
                TaskStatus.COMPLETED,
              );
              ctx.reply('✅ Vazifa bajarilgan deb belgilandi!');
            } else {
              ctx.reply(
                "❌ Noto'g'ri raqam. Iltimos, ro'yxatdagi raqamni kiriting.",
              );
            }
          } catch (error) {
            this.logger.error('Error completing task', error);
            ctx.reply('❌ Xatolik yuz berdi.');
          }
          ctx.session.step = undefined;
          break;

        case 'waiting_delete_task':
          const deleteIndex = parseInt(text) - 1;
          try {
            const tasks = await this.taskService.findAllByUserId(ctx.from.id);

            if (deleteIndex >= 0 && deleteIndex < tasks.length) {
              await this.taskService.remove(tasks[deleteIndex]._id.toString()); // Use _id and convert to string
              ctx.reply("🗑 Vazifa o'chirildi!");
            } else {
              ctx.reply(
                "❌ Noto'g'ri raqam. Iltimos, ro'yxatdagi raqamni kiriting.",
              );
            }
          } catch (error) {
            this.logger.error('Error deleting task', error);
            ctx.reply('❌ Xatolik yuz berdi.');
          }
          ctx.session.step = undefined;
          break;

        default:
          ctx.reply("❓ Tushunmadim. /help buyrug'i orqali yordam oling.");
      }
    });
  }

  private isValidDateFormat(dateStr: string): boolean {
    const pattern = /^\d{2}\.\d{2}\.\d{2}\s\d{2}:\d{2}$/;
    return pattern.test(dateStr);
  }

  private parseDate(dateStr: string): Date {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    return new Date(2000 + year, month - 1, day, hours, minutes);
  }

  private getPriorityEmoji(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH:
        return '🔴';
      case TaskPriority.MEDIUM:
        return '🟡';
      case TaskPriority.LOW:
        return '🟢';
      default:
        return '⚪';
    }
  }

  async sendNotification(userId: number, message: string) {
    try {
      await this.bot.api.sendMessage(userId, message);
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}`, error);
    }
  }
}