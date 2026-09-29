import dotenv from "dotenv";

dotenv.config();

//Centralized and sanitizes all environmental variables with safe defaults
const env = {
  port: process.env.PORT || 3000,
  dbPath: process.env.DB_PATH || "./data/todos.db",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  nodeEnv: process.env.NODE_ENV || "development",
};

export default env;
