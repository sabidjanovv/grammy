import { TaskPriority } from '../schemas/task.schema';

export class CreateTaskDto {
  title: string;
  userId: number;
  dueDate: Date;
  priority: TaskPriority;
}
