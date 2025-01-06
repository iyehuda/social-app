import dotenv from "dotenv";

dotenv.config();

// istanbul ignore next
export const dbConnectionString =
    process.env.DB_CONNECTION_STRING || "mongodb://localhost/fsd1?authSource=admin";
// istanbul ignore next
export const port = process.env.PORT || 3000;
