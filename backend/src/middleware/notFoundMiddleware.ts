import { Request, Response } from "express";

export const notFoundMiddleware = (
  req: Request,
  res: Response
) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
};