import { Request, Response } from "express";
import { TaskRepository } from "../repositories/task.repository";
import { TaskAttributes, TaskCreationAttributes } from "../models/task.model";
import { TableResponse } from "../types";

const taskRepository = new TaskRepository();

const parseNumericId = (id: string | undefined): number | null => {
  if (!id) return null;
  const parsedId = parseInt(id, 10);
  return isNaN(parsedId) ? null : parsedId;
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body.title || !req.body.startAt || !req.body.endAt) {
      res.status(400).send({
        message: "Required fields cannot be empty!",
      });
      return;
    }

    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).send({
        message: "Authentication required",
      });
      return;
    }

    const userIds: number[] =
      req.body.userIds &&
      Array.isArray(req.body.userIds) &&
      req.body.userIds.length > 0
        ? req.body.userIds
        : [userId];

    const task: TaskCreationAttributes = {
      title: req.body.title,
      description: req.body.description || "",
      startAt: new Date(req.body.startAt),
      endAt: new Date(req.body.endAt),
      location: req.body.location || "",
    };

    const data = await taskRepository.create(task, userIds);
    res.status(201).send(data);
  } catch (err: any) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Task.",
    });
  }
};

export const findAllByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).send({ message: "Authentication required" });
    return;
  }

  try {
    const tasks = await taskRepository.findAllByUser(userId);
    res.send(tasks.rows);
  } catch (err: any) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving tasks.",
    });
  }
};

export const findAllByUserAsTable = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).send({ message: "Authentication required" });
    return;
  }

  try {
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;
    const sortBy = (req.query.sortBy as string) || "startAt";
    const sortOrder =
      (req.query.sortOrder as string)?.toUpperCase() === "DESC"
        ? "DESC"
        : "ASC";

    const result = await taskRepository.findAllByUser(
      userId,
      page,
      size,
      sortBy,
      sortOrder
    );

    const tableData: TableResponse<TaskAttributes> = {
      items: result.rows,
      pagination: {
        page,
        size,
        totalItems: result.count,
        totalPages: Math.ceil(result.count / size),
      },
      sort: {
        sortBy,
        sortOrder,
      },
    };

    res.send(tableData);
  } catch (err: any) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving tasks.",
    });
  }
};

export const findOne = async (req: Request, res: Response): Promise<void> => {
  const id = parseNumericId(req.params.id);
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).send({ message: "Authentication required" });
    return;
  }

  if (!id) {
    res.status(400).send({ message: "Invalid task ID" });
    return;
  }

  try {
    const task = await taskRepository.findOne(id, userId);

    if (task) {
      res.send(task);
    } else {
      res.status(404).send({
        message: `Cannot find Task with id=${id} for this user.`,
      });
    }
  } catch (err: any) {
    res.status(500).send({
      message: `Error retrieving Task with id=${id}`,
    });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).send({ message: "Authentication required" });
    return;
  }

  if (isNaN(id)) {
    res.status(400).send({ message: "Invalid task ID" });
    return;
  }

  try {
    const { userIds, ...taskData } = req.body;

    const num = await taskRepository.update(id, userId, taskData, userIds);

    if (num === 1) {
      res.send({
        message: "Task was updated successfully.",
      });
    } else {
      res.send({
        message: `Cannot update Task with id=${id} for this user. Maybe Task was not found or req.body is empty!`,
      });
    }
  } catch (err: any) {
    res.status(500).send({
      message: `Error updating Task with id=${id}`,
    });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).send({ message: "Authentication required" });
    return;
  }

  if (isNaN(id)) {
    res.status(400).send({ message: "Invalid task ID" });
    return;
  }

  try {
    const num = await taskRepository.delete(id, userId);

    if (num === 1) {
      res.send({
        message: "Task was deleted successfully!",
      });
    } else {
      res.send({
        message: `Cannot delete Task with id=${id} for this user. Maybe Task was not found!`,
      });
    }
  } catch (err: any) {
    res.status(500).send({
      message: `Could not delete Task with id=${id}`,
    });
  }
};
