import dotenv from "dotenv";
dotenv.config();

import db from "../models";

async function syncDatabase() {
  try {
    await db.sequelize.sync({ force: true });
    console.log("Database tables created successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Error creating database tables:", error);
    process.exit(1);
  }
}

syncDatabase();
