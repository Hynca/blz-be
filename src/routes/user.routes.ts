import express from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

// Public routes
router.post("/", userController.create);

// Protected routes - require authentication
router.get("/", authenticate, userController.findAll);
router.get("/:id", authenticate, userController.findOne);
router.put("/:id", authenticate, userController.update);
router.delete("/:id", authenticate, userController.remove);

export default router;
