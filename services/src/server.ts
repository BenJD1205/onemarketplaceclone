import {Server} from "node:http";
import { env } from "./config/env.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import { SERVICE_NAME } from "./config/constants.js";

let server: Server | undefined;
let isShuttingDown = false;

const closeHttpServer = async (): Promise<void> => {
    if(!server) return;
    isShuttingDown = true;
    return new Promise((resolve, reject) => {
        server?.close((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};

const start = async (): Promise<void> => {
    await connectRedis();
    server = new Server((req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Hello World\n');
    });
    server.listen(env.port, () => {
        console.log(`Server running at http://localhost:${env.port} in ${env.nodeEnv} mode`);
    });
};

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if(isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    console.log(`Received ${signal}. Shutting down gracefully...`);
    try {
        await closeHttpServer();
        await disconnectRedis();
        console.log("HTTP server closed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error occurred while closing HTTP server:", err);
        process.exit(1);
    }
};

process.on("SIGINT", (signal) => shutdown(signal));
process.on("SIGTERM", (signal) => shutdown(signal));

void start().catch(async (err) => {
    console.error(`Error occurred while starting the server ${SERVICE_NAME}`, err);
    await disconnectRedis().catch(() => undefined);
    process.exit(1);
});