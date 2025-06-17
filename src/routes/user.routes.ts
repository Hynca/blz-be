import express from "express";
import * as userController from "../controllers/user.controller";

const router = express.Router();

// Create a new User
router.post("/", userController.create);

// Retrieve all Users
router.get("/", userController.findAll);

// Retrieve a single User with id
router.get("/:id", userController.findOne);

// Update a User with id
router.put("/:id", userController.update);

// Delete a User with id
router.delete("/:id", userController.remove);

export default router;
