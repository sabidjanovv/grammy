import { TaskPriority, TaskStatus } from '../schemas/task.schema';

export class UpdateTaskDto {
  title?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
  notified?: boolean;
}
