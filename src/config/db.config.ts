import dotenv from "dotenv";
dotenv.config();

export default {
  // Use the connection string from .env
  CONNECTION_STRING: process.env.DATABASE_URL || "",

  // Keep traditional config for Sequelize compatibility
  DB: "neondb",
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
