
import { Request, Response, NextFunction } from 'express';

export function domainRedirectMiddleware(req: Request, res: Response, next: NextFunction) {
  const host = req.get('host');
  
  // Se não for abmix.digital, redirecionar
  if (host && !host.includes('abmix.digital') && !host.includes('localhost') && !host.includes('replit.dev')) {
    return res.redirect(301, `https://abmix.digital${req.originalUrl}`);
  }
  
  next();
}
