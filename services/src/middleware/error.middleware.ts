import {Request, Response, NextFunction, ErrorRequestHandler} from "express";
import { ApiError } from "../utils/api-error.js";

export const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    res.status(statusCode).json({
        success: false,
        message: err.message ?? "An unexpected error occurred"
    });
};