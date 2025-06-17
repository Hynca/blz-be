import dotenv from "dotenv";
dotenv.config();

export default {
  // Use the connection string from .env
  CONNECTION_STRING:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_u78MIHeWjmwt@ep-wispy-dust-a93grl0b-pooler.gwc.azure.neon.tech/neondb?sslmode=require",

  // Keep traditional config for Sequelize compatibility
  HOST: "ep-wispy-dust-a93grl0b-pooler.gwc.azure.neon.tech",
  USER: "neondb_owner",
  PASSWORD: "npg_u78MIHeWjmwt",
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
