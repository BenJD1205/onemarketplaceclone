import {RequestHandler} from "express";
import {ApiError} from "../utils/api-error.js";

export const notFoundHandler: RequestHandler = (req, res, next) => {
    next(new ApiError("The requested resource was not found", 404));
};