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
    TOKEN_SECRET:'6e44b1fb1a26aa1c7324b6f7b555de5446c0fa22ef02b3f176523a56c85094f7a5912ddad3b70e59f70da2ca7e75566a9c52d41adf8ae82cf9ed27106dffa103',
    TOKEN_EXPIRES:'1h',
    REFRESH_TOKEN_EXPIRES:'7d'
};

export const dbConnectionString = process.env.DB_CONNECTION_STRING ?? defaults.DB_CONNECTION_STRING;
export const environment = process.env.NODE_ENV as Environment ?? defaults.ENVIRONMENT;
export const port = process.env.PORT ?? defaults.PORT;
export const tokenSecret = process.env.TOKEN_SECRET ?? defaults.TOKEN_SECRET;
export const tokenExpires = process.env.TOKEN_EXPIRES ?? defaults.TOKEN_EXPIRES;
export const refreshTokenExpires = process.env.REFRESH_TOKEN_EXPIRES ?? defaults.REFRESH_TOKEN_EXPIRES;
