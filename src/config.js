import dotenv from "dotenv";

dotenv.config();

export const dbConnectionString = process.env.DB_CONNECTION_STRING || "mongodb://127.0.0.1/fsd1?authSource=admin";
export const port = process.env.PORT || 3000;
