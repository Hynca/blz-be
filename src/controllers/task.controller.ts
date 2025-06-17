import { Request, Response } from "express";
import db from "../models";

const Task = db.tasks;
const User = db.users;

// Create and Save a new Task
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    if (
      !req.body.title ||
      !req.body.startAt ||
      !req.body.endAt ||
      !req.body.userId
    ) {
      res.status(400).send({
        message: "Required fields cannot be empty!",
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
      userId: req.body.userId,
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
  const userId = req.params.userId;

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
  const id = req.params.id;
  const userId = req.params.userId;

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
