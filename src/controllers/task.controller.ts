import { Request, Response } from "express";
import db from "../models";

const Task = db.tasks;
const User = db.users;

// Helper function to check if the authenticated user has permission for the task
const hasPermission = (req: Request, userId: number): boolean => {
  // User is allowed to access only their own tasks
  return req.user?.userId === userId;
};

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

    // Use the authenticated user's ID from the token
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).send({
        message: "Authentication required",
      });
      return;
    }

    // Create a Task
    const task = {
      title: req.body.title,
      description: req.body.description,
      startAt: new Date(req.body.startAt),
      endAt: new Date(req.body.endAt),
      location: req.body.location,
      userId: userId,
    };

    // Save Task in the database
    const data = await Task.create(task);
    res.status(201).send(data);
  } catch (err: any) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Task.",
    });
  }
};

// Retrieve all Tasks of a User
export const findAllByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseNumericId(req.params.userId);
  const authUserId = req.user?.userId;

  if (!authUserId) {
    res.status(401).send({ message: "Authentication required" });
    return;
  }

  if (!userId) {
    res.status(400).send({ message: "Invalid user ID" });
    return;
  }

  // Only allow users to access their own tasks
  if (authUserId !== userId) {
    res
      .status(403)
      .send({ message: "Forbidden: You can only access your own tasks" });
    return;
  }

  try {
    const data = await Task.findAll({
      where: { userId: userId },
    });
    res.send(data);
  } catch (err: any) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving tasks.",
    });
  }
};

// Find a single Task with an id
export const findOne = async (req: Request, res: Response): Promise<void> => {
  const id = parseNumericId(req.params.id);
  const userId = parseNumericId(req.params.userId);
  const authUserId = req.user?.userId;

  if (!authUserId) {
    res.status(401).send({ message: "Authentication required" });
    return;
  }

  if (!id || !userId) {
    res.status(400).send({ message: "Invalid task or user ID" });
    return;
  }

  // Only allow users to access their own tasks
  if (authUserId !== userId) {
    res
      .status(403)
      .send({ message: "Forbidden: You can only access your own tasks" });
    return;
  }

  try {
    const data = await Task.findOne({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (data) {
      res.send(data);
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
  const userId = req.params.userId;

  try {
    // Check if the user has permission to update the task
    if (!hasPermission(req, Number(userId))) {
      res.status(403).send({
        message: "You do not have permission to update this task.",
      });
      return;
    }

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
  const userId = req.params.userId;

  try {
    // Check if the user has permission to delete the task
    if (!hasPermission(req, Number(userId))) {
      res.status(403).send({
        message: "You do not have permission to delete this task.",
      });
      return;
    }

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
