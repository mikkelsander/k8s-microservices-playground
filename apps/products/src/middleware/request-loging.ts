import { Request, Response, NextFunction } from 'express';

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.info(`${req.method} ${req.originalUrl}`);
  next();
};
