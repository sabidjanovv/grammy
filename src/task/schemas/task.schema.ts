// task.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TaskStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true, versionKey: false })
export class Task {
  // @Prop({ required: true })
  // id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  userId: number;

  @Prop({ type: Date })
  dueDate: Date;

  @Prop({ enum: TaskPriority, default: TaskPriority.LOW })
  priority: TaskPriority;

  @Prop({ enum: TaskStatus, default: TaskStatus.ACTIVE })
  status: TaskStatus;

  @Prop({ default: false })
  notified: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
