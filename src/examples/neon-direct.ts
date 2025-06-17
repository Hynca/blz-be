// This is an example of using Neon's serverless client directly

import dotenv from "dotenv";
dotenv.config();

import { neon } from "@neondatabase/serverless";

// Create a SQL client
const sql = neon(
  process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_u78MIHeWjmwt@ep-wispy-dust-a93grl0b-pooler.gwc.azure.neon.tech/neondb?sslmode=require"
);

// Example function to query the database directly
export async function queryNeonDirectly() {
  try {
    // Run a simple query
    const result = await sql`SELECT version()`;
    console.log("Database version:", result[0].version);

    // You can also run more complex queries
    // const users = await sql`SELECT * FROM users LIMIT 10`;
    // console.log("Users:", users);

    return result[0].version;
  } catch (error) {
    console.error("Error querying Neon database:", error);
    throw error;
  }
}

// You can uncomment and run this if you want to test directly
// queryNeonDirectly()
//   .then(version => console.log("Success! Database version:", version))
//   .catch(error => console.error("Failed:", error));
