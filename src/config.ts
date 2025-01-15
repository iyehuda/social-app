import dotenv from "dotenv";

dotenv.config();
const defaults = {
    DB_CONNECTION_STRING: "mongodb://localhost/fsd1?authSource=admin",
    PORT: 3000,
};
export const dbConnectionString = process.env.DB_CONNECTION_STRING ?? defaults.DB_CONNECTION_STRING;
export const port = process.env.PORT ?? defaults.PORT;
