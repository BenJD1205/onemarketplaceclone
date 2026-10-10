import express from "express";
import cors from "cors";
import type { ApiResponse } from "./types/common.types.js";
import { API_PREFIX } from "./config/constants.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

export const app = express();

app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true }));
app.use(express.json({limit: "2mb"}));
const allowedOrigins = new Set(
    (process.env.CORS_ORIGINS ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true);
            return;
        }

        callback(null, false);
    },
    credentials: false
}));

app.get("/", (_request, response) => {
    const body: ApiResponse<string> = {
        data: "Hello, world!",
        message: "Request successful"
    };
    response.json(body);
})

app.use(API_PREFIX, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
