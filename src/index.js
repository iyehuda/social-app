import { createApp } from "./app.js";
import { dbConnectionString, port } from "./config.js";
import { connect, disconnect } from "./db.js";

const app = createApp();
await connect(dbConnectionString);

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

function shutdown() {
    console.log("Shutting down gracefully");
    server.close(() => console.log("Server closed"));
    disconnect().then(() => console.log("DB connection closed"));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
