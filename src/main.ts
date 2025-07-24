import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for API routes (if needed)
  app.setGlobalPrefix('api');

  // Start the application
  await app.listen(3000);
  console.log('🚀 To-Do Telegram Bot is running!');
}

bootstrap();
