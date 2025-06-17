// Repository pattern for Task data access
import { Op } from "sequelize";
import db from "../models";
import { TaskAttributes, TaskCreationAttributes } from "../models/task.model";
import { PaginatedResult } from "../types";

const Task = db.tasks;

export class TaskRepository {
  async findAllByUser(
    userId: number,
    page: number = 0,
    size: number = 10,
    sortBy: string = "startAt",
    sortOrder: "ASC" | "DESC" = "ASC"
  ): Promise<PaginatedResult<TaskAttributes>> {
    const offset = page * size;

    return (await Task.findAndCountAll({
      where: { userId },
      order: [[sortBy, sortOrder]],
      limit: size,
      offset,
      attributes: [
        "id",
        "title",
        "description",
        "startAt",
        "endAt",
        "location",
        "userId",
        "createdAt",
        "updatedAt",
      ],
      raw: true,
    })) as PaginatedResult<TaskAttributes>;
  }

  async findOne(id: number, userId: number): Promise<TaskAttributes | null> {
    return (await Task.findOne({
      where: {
        id,
        userId,
      },
      attributes: [
        "id",
        "title",
        "description",
        "startAt",
        "endAt",
        "location",
        "userId",
        "createdAt",
        "updatedAt",
      ],
      raw: true,
    })) as TaskAttributes | null;
  }

  async create(task: TaskCreationAttributes): Promise<TaskAttributes> {
    return await Task.create(task);
  }

  async update(
    id: number,
    userId: number,
    data: Partial<TaskAttributes>
  ): Promise<number> {
    const [affectedCount] = await Task.update(data, {
      where: {
        id,
        userId,
      },
    });

    return affectedCount;
  }

  async delete(id: number, userId: number): Promise<number> {
    return await Task.destroy({
      where: {
        id,
        userId,
      },
    });
  }

  async search(userId: number, query: string): Promise<TaskAttributes[]> {
    return (await Task.findAll({
      where: {
        userId,
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
      raw: true,
    })) as TaskAttributes[];
  }
}

export const taskRepository = new TaskRepository();
