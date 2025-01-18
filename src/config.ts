import dotenv from "dotenv";

export enum Environment {
    DEV = "development",
    PROD = "production",
};

dotenv.config();
const defaults = {
    DB_CONNECTION_STRING: "mongodb://localhost/fsd1?authSource=admin",
    ENVIRONMENT: Environment.DEV,
    PORT: 3000,
};

export const dbConnectionString = process.env.DB_CONNECTION_STRING ?? defaults.DB_CONNECTION_STRING;
export const environment = process.env.NODE_ENV as Environment ?? defaults.ENVIRONMENT;
export const port = process.env.PORT ?? defaults.PORT;
