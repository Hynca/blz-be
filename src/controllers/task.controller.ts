import { Request, Response } from "express";
import db from "../models";
import { TaskAttributes, TaskCreationAttributes } from "../models/task.model";
import { PaginatedResult, TableResponse } from "../types";

const Task = db.tasks;

// Helper to safely parse numeric IDs
const parseNumericId = (id: string | undefined): number | null => {
  if (!id) return null;
  const parsedId = parseInt(id, 10);
  return isNaN(parsedId) ? null : parsedId;
};

// Create and Save a new Task
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
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
    } // Use TaskCreationAttributes to ensure type safety
    const task: TaskCreationAttributes = {
      title: req.body.title,
      description: req.body.description || "",
      startAt: new Date(req.body.startAt),
      endAt: new Date(req.body.endAt),
      location: req.body.location || "",
      userId: userId,
    };

    const data = await Task.create(task);
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
    const tasks = await Task.findAll({
      where: { userId: userId },
      // Explicitly select attributes to ensure we're only returning what we need
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
    });
    res.send(tasks);
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

    const offset = page * size;

    // Use Sequelize's findAndCountAll for efficient pagination
    const result = await Task.findAndCountAll({
      where: { userId: userId },
      order: [[sortBy, sortOrder]],
      limit: size,
      offset: offset,
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
      // Return plain objects instead of Sequelize instances
      raw: true,
    });

    const count = result.count;
    const tasks = result.rows as TaskAttributes[];

    // Format the data as a table structure
    const tableData: TableResponse<TaskAttributes> = {
      items: tasks,
      pagination: {
        page,
        size,
        totalItems: count,
        totalPages: Math.ceil(count / size),
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
    const task = await Task.findOne({
      where: {
        id: id,
        userId: userId,
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
    });

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

// Update a Task by the id in the request
export const update = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).send({ message: "Authentication required" });
    return;
  }

  try {
    const num = await Task.update(req.body, {
      where: {
        id: id,
        userId: userId,
      },
    });

    if (num[0] === 1) {
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

// Delete a Task with the specified id in the request
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).send({ message: "Authentication required" });
    return;
  }

  try {
    const num = await Task.destroy({
      where: {
        id: id,
        userId: userId,
      },
    });

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
