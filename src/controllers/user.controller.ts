import { Request, Response } from "express";
import db from "../models";

const User = db.users;

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body.username || !req.body.email || !req.body.password) {
      res.status(400).send({
        message: "Content cannot be empty!",
      });
      return;
    }

    const user = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };

    const data = await User.create(user);
    res.status(201).send(data);
  } catch (err: any) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the User.",
    });
  }
};

export const findAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await User.findAll();
    res.send(data);
  } catch (err: any) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving users.",
    });
  }
};

export const findOne = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  try {
    const data = await User.findByPk(id);

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find User with id=${id}.`,
      });
    }
  } catch (err: any) {
    res.status(500).send({
      message: `Error retrieving User with id=${id}`,
    });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  try {
    const num = await User.update(req.body, {
      where: { id: id },
    });

    if (num[0] === 1) {
      res.send({
        message: "User was updated successfully.",
      });
    } else {
      res.send({
        message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`,
      });
    }
  } catch (err: any) {
    res.status(500).send({
      message: `Error updating User with id=${id}`,
    });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  try {
    const num = await User.destroy({
      where: { id: id },
    });

    if (num === 1) {
      res.send({
        message: "User was deleted successfully!",
      });
    } else {
      res.send({
        message: `Cannot delete User with id=${id}. Maybe User was not found!`,
      });
    }
  } catch (err: any) {
    res.status(500).send({
      message: `Could not delete User with id=${id}`,
    });
  }
};
