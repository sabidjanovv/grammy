// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { CreateTaskDto } from './dto/create-task.dto';
// import { UpdateTaskDto } from './dto/update-task.dto';
// import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';
// import { v4 as uuidv4 } from 'uuid';
// @Injectable()
// export class TaskService {
//   constructor(
//     @InjectModel(Task.name)
//     private readonly taskModel: Model<TaskDocument>,
//   ) {}

//   async create(createTaskDto: CreateTaskDto): Promise<Task> {
//     const createdTask = new this.taskModel({
//       ...createTaskDto,
//       id: uuidv4(), // UUID yaratish
//       status: TaskStatus.ACTIVE,
//       notified: false,
//     });
//     return createdTask.save();
//   }

//   async findAll(): Promise<Task[]> {
//     return this.taskModel.find().exec();
//   }

//   async findAllByUserId(userId: number): Promise<Task[]> {
//     return this.taskModel.find({ userId }).exec();
//   }

//   async findOne(id: string): Promise<Task | null> {
//     return this.taskModel.findById(id).exec();
//   }

//   async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
//     return this.taskModel
//       .findByIdAndUpdate(id, updateTaskDto, {
//         new: true,
//       })
//       .exec();
//   }

//   async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
//     return this.taskModel
//       .findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true })
//       .exec();
//   }

//   async markAsNotified(id: string): Promise<Task | null> {
//     return this.taskModel
//       .findByIdAndUpdate(id, { notified: true }, { new: true })
//       .exec();
//   }

//   async remove(id: string): Promise<boolean> {
//     const result = await this.taskModel.findByIdAndDelete(id).exec();
//     return result !== null;
//   }

//   async getTasksDueForNotification(): Promise<Task[]> {
//     const now = new Date();
//     return this.taskModel
//       .find({
//         status: TaskStatus.ACTIVE,
//         notified: false,
//         dueDate: { $lte: now },
//       })
//       .exec();
//   }
// }


// src/task/task.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    const createdTask = new this.taskModel({
      ...createTaskDto,
      status: TaskStatus.ACTIVE,
      notified: false,
    });
    return createdTask.save();
  }

  async findAll(): Promise<TaskDocument[]> {
    return this.taskModel.find().exec();
  }

  async findAllByUserId(userId: number): Promise<TaskDocument[]> {
    return this.taskModel.find({ userId }).exec();
  }

  async findOne(id: string): Promise<TaskDocument | null> {
    return this.taskModel.findById(id).exec();
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskDocument | null> {
    return this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .exec();
  }

  async updateStatus(id: string, status: TaskStatus): Promise<TaskDocument | null> {
    return this.taskModel
      .findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async markAsNotified(id: string): Promise<TaskDocument | null> {
    return this.taskModel
      .findByIdAndUpdate(id, { notified: true }, { new: true })
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.taskModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async getTasksDueForNotification(): Promise<TaskDocument[]> {
    const now = new Date();
    return this.taskModel
      .find({
        status: TaskStatus.ACTIVE,
        notified: false,
        dueDate: { $lte: now },
      })
      .exec();
  }
}