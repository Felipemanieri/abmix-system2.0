
import { Request, Response, NextFunction } from 'express';

export function domainRedirectMiddleware(req: Request, res: Response, next: NextFunction) {
  const host = req.get('host');
  
  // Permitir .replit.app, localhost, replit.dev e abmix.digital
  if (host && !host.includes('abmix.digital') && 
      !host.includes('localhost') && 
      !host.includes('replit.dev') && 
      !host.includes('replit.app')) {
    return res.redirect(301, `https://abmix.digital${req.originalUrl}`);
  }
  
  next();
}
