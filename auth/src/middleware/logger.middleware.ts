import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  const { ip, method, originalUrl: url } = req;
  const userAgent = req.get('user-agent') || '';
  const referer = req.get('referer') || '';

  res.on('close', () => {
    const { statusCode, statusMessage } = res;
    const contentLength = res.get('content-length');
    Logger.log(
      `"${method} ${url}" ${statusCode} ${statusMessage} ${contentLength} "${referer}" "${userAgent}" "${ip}"`,
    );
  });

  next();
}
