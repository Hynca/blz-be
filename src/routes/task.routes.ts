import express from "express";
import * as taskController from "../controllers/task.controller";

const router = express.Router();

// Create a new Task
router.post("/", taskController.create);

// Retrieve all Tasks for a User
router.get("/user/:userId", taskController.findAllByUser);

// Retrieve a single Task for a User
router.get("/user/:userId/task/:id", taskController.findOne);

// Update a Task for a User
router.put("/user/:userId/task/:id", taskController.update);

// Delete a Task for a User
router.delete("/user/:userId/task/:id", taskController.remove);

export default router;
