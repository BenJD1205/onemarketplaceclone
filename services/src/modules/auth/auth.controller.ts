import { RequestHandler } from "express";
import { ApiError } from "../../utils/api-error.js";
import type { ApiResponse } from "../../types/common.types.js";

interface AuthStatusData {
    role: "client" | "freelancer";
    accountExists: boolean;
    isOnboarded: boolean;
}

export const getAuthStatus: RequestHandler<unknown, ApiResponse<AuthStatusData>, unknown> = (request, response) => {
    const auth = request.auth;
    if (!auth) {
        throw new ApiError("Unauthorized", 401);
    }
    const data: ApiResponse<AuthStatusData> = {
        success: true,
        data: {
            role: auth.role,
            accountExists: auth.accountExists,
            isOnboarded: auth.isOnboarded,
        },
        message: "Auth status retrieved successfully"
    };
    response.status(200).json(data);
};

export const signup: RequestHandler<unknown, ApiResponse<null>, unknown> = (request, response) => {
    const data: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Signup successful"
    };
    response.status(200).json(data);
};