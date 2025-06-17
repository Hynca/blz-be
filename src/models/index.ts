import { Sequelize, DataTypes } from "sequelize";
import dbConfig from "../config/db.config";
import userModel from "./user.model";
import taskModel from "./task.model";

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
};

// Set up associations
db.users.hasMany(db.tasks, { foreignKey: "userId" });
db.tasks.belongsTo(db.users, { foreignKey: "userId" });

export default db;
