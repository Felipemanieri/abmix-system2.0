
import { Request, Response, NextFunction } from 'express';

export function domainRedirectMiddleware(req: Request, res: Response, next: NextFunction) {
  const host = req.get('host');
  
  // Permitir apenas abmixsystem.replit.app, localhost e replit.dev para desenvolvimento
  if (host && !host.includes('abmixsystem.replit.app') && 
      !host.includes('localhost') && 
      !host.includes('replit.dev') && 
      !host.includes('127.0.0.1')) {
    return res.redirect(301, `https://abmixsystem.replit.app${req.originalUrl}`);
  }
  
  next();
}
