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

// Routes that need ownership validation
// Retrieve all Tasks for a User
router.get(
  "/user/:userId",
  checkResourceOwnership("userId"),
  taskController.findAllByUser
);

// Retrieve a single Task for a User
router.get(
  "/user/:userId/task/:id",
  checkResourceOwnership("userId"),
  taskController.findOne
);

// Update a Task for a User
router.put(
  "/user/:userId/task/:id",
  checkResourceOwnership("userId"),
  taskController.update
);

// Delete a Task for a User
router.delete(
  "/user/:userId/task/:id",
  checkResourceOwnership("userId"),
  taskController.remove
);

export default router;
