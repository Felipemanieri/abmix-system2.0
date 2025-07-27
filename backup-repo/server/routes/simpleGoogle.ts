
import express, { Request, Response } from 'express';
const router = express.Router();

// Rota básica para manter compatibilidade
router.get('/test', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Simple Google routes working' });
});

// Exportar como módulo ES6
export default router;
