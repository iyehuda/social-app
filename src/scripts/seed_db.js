import { dbConnectionString } from "../config.js";
import { connect, disconnect } from "../db.js";

await connect(dbConnectionString);

console.log("Connected to MongoDB");

// Seed data goes here

await disconnect();
console.log("Disconnected from MongoDB");
