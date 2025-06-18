// Repository pattern for Task data access
import { Op } from "sequelize";
import db from "../models";
import { TaskAttributes, TaskCreationAttributes } from "../models/task.model";
import { PaginatedResult } from "../types";

const Task = db.tasks;
const User = db.users;

export class TaskRepository {
  async findAllByUser(
    userId: number,
    page: number = 0,
    size: number = 10,
    sortBy: string = "startAt",
    sortOrder: "ASC" | "DESC" = "ASC"
  ): Promise<PaginatedResult<TaskAttributes>> {
    const offset = page * size;

    const result = await Task.findAndCountAll({
      include: [
        {
          model: User,
          where: { id: userId },
          attributes: [],
          through: { attributes: [] },
        },
      ],
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
        "createdAt",
        "updatedAt",
      ],
      distinct: true,
    });
    return {
      rows: result.rows.map((task: any) => task.get({ plain: true })),
      count: result.count,
    } as PaginatedResult<TaskAttributes>;
  }
  async findOne(id: number, userId: number): Promise<TaskAttributes | null> {
    const task = await Task.findOne({
      where: {
        id,
      },
      include: [
        {
          model: User,
          where: { id: userId },
          attributes: ["id", "username", "email"],
          through: { attributes: [] },
        },
      ],
      attributes: [
        "id",
        "title",
        "description",
        "startAt",
        "endAt",
        "location",
        "createdAt",
        "updatedAt",
      ],
    });

    return task ? task.get({ plain: true }) : null;
  }
  async create(
    taskData: TaskCreationAttributes,
    userIds: number[]
  ): Promise<TaskAttributes> {
    const transaction = await db.sequelize.transaction();

    try {
      const task = await Task.create(taskData, { transaction });

      if (userIds && userIds.length > 0) {
        // Associate task with users
        await task.setUsers(userIds, { transaction });
      }

      await transaction.commit();

      // Return the task with its associated users
      const createdTask = await Task.findByPk(task.id, {
        include: [
          {
            model: User,
            attributes: ["id", "username", "email"],
            through: { attributes: [] },
          },
        ],
      });

      return createdTask ? createdTask.get({ plain: true }) : task;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(
    id: number,
    userId: number,
    data: Partial<TaskAttributes>,
    userIds?: number[]
  ): Promise<number> {
    const transaction = await db.sequelize.transaction();

    try {
      // First check if the user has access to this task
      const task = await Task.findOne({
        where: { id },
        include: [
          {
            model: User,
            where: { id: userId },
            attributes: ["id"],
            through: { attributes: [] },
          },
        ],
      });

      if (!task) return 0;

      // Update task data
      const [affectedCount] = await Task.update(data, {
        where: { id },
        transaction,
      });

      // If userIds are provided, update the task-user associations
      if (userIds !== undefined) {
        await task.setUsers(userIds, { transaction });
      }

      await transaction.commit();
      return affectedCount;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async delete(id: number, userId: number): Promise<number> {
    const transaction = await db.sequelize.transaction();

    try {
      // First check if the user has access to this task
      const task = await Task.findOne({
        where: { id },
        include: [
          {
            model: User,
            where: { id: userId },
            attributes: ["id"],
            through: { attributes: [] },
          },
        ],
      });

      if (!task) return 0;

      // Remove all user associations
      await task.setUsers([], { transaction });

      // Delete the task
      const result = await Task.destroy({
        where: { id },
        transaction,
      });

      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async search(userId: number, query: string): Promise<TaskAttributes[]> {
    const tasks = await Task.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: User,
          where: { id: userId },
          attributes: ["id", "username", "email"],
          through: { attributes: [] },
        },
      ],
      attributes: [
        "id",
        "title",
        "description",
        "startAt",
        "endAt",
        "location",
        "createdAt",
        "updatedAt",
      ],
    });

    return tasks.map((task: any) => task.get({ plain: true }));
  }

  // Add methods to handle task-user relationships directly

  async getTaskUsers(taskId: number): Promise<any[]> {
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
          through: { attributes: [] },
        },
      ],
    });

    if (!task) return [];
    return task.getUsers();
  }

  async addUserToTask(taskId: number, userId: number): Promise<boolean> {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) return false;

      await task.addUser(userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async removeUserFromTask(taskId: number, userId: number): Promise<boolean> {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) return false;

      await task.removeUser(userId);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const taskRepository = new TaskRepository();
