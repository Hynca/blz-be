import dotenv from "dotenv";
dotenv.config();

import db from "../models";

async function syncDatabase() {
  try {
    // Force true will drop the table if it already exists
    await db.sequelize.sync({ force: true });
    console.log("Database tables created successfully!");

    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error("Error creating database tables:", error);
    process.exit(1);
  }
}

// Run the function
syncDatabase();
