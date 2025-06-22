import express from "express";
import * as taskController from "../controllers/task.controller";
import {
  authenticate,
  checkResourceOwnership,
} from "../middleware/auth.middleware";

const router = express.Router();

// All task routes should be protected with authentication
router.use(authenticate);

// Create a new Task
router.post("/", taskController.create);

// Retrieve all Tasks for authenticated User
router.get("/", taskController.findAllByUser);

// Retrieve all Tasks as a table for authenticated User
router.get("/table", taskController.findAllByUserAsTable);

// Retrieve a single Task for authenticated User
router.get("/:id", taskController.findOne);

// Update a Task for authenticated User
router.put("/:id", taskController.update);

// Delete a Task for authenticated User
router.delete("/:id", taskController.remove);

export default router;
