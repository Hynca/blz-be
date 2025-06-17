import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import db from "./models";
import userRoutes from "./routes/user.routes";
import taskRoutes from "./routes/task.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser middleware

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes); // Add authentication routes

// Simple route for testing
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the application." });
});

// Set port and start server
const PORT = process.env.PORT || 3000;

// Sync database
db.sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((err: Error) => {
    console.error("Unable to connect to the database:", err);
  });
