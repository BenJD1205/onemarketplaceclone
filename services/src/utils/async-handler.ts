import { NextFunction, Request, Response, RequestHandler } from "express";

type AsyncRequestHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (request, response, next) => {
    void fn(request, response, next).catch(next);
  };
