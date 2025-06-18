import { Sequelize, DataTypes } from "sequelize";
import dbConfig from "../config/db.config";
import userModel from "./user.model";
import taskModel from "./task.model";
import taskUserModel from "./taskUser.model";

// Create Sequelize instance using connection string
const sequelize = new Sequelize(dbConfig.CONNECTION_STRING, {
  dialect: dbConfig.dialect as any,
  dialectOptions: dbConfig.dialectOptions,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

// Initialize models
const db: any = {
  sequelize,
  Sequelize,
  users: userModel(sequelize),
  tasks: taskModel(sequelize),
  taskUsers: taskUserModel(sequelize),
};

// Set up many-to-many associations between tasks and users
db.tasks.belongsToMany(db.users, {
  through: db.taskUsers,
  foreignKey: "taskId",
  otherKey: "userId",
});

db.users.belongsToMany(db.tasks, {
  through: db.taskUsers,
  foreignKey: "userId",
  otherKey: "taskId",
});

export default db;
