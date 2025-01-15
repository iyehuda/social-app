import { connect, disconnect } from "./db";
import { dbConnectionString, port } from "./config";
import { createApp } from "./app";

async function start() {
    const app = createApp();
    await connect(dbConnectionString);

    const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

    const shutdown = () => {
        console.log("Shutting down gracefully");
        server.close(() => console.log("Server closed"));
        disconnect().then(() => console.log("DB connection closed")).catch(console.error);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
}

start().catch(console.error);
