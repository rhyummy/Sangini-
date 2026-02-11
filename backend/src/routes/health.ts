import express from 'express';
import { prisma } from '../lib/prisma';
import { testGeminiConnection } from '../services/gemini';
import { asyncHandler } from '../middleware/error';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'sanghini-backend',
    checks: {
      database: 'unknown',
      gemini: 'unknown'
    }
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'connected';
  } catch (error) {
    health.checks.database = 'disconnected';
    health.status = 'degraded';
  }

  try {
    const geminiOk = await testGeminiConnection();
    health.checks.gemini = geminiOk ? 'connected' : 'disconnected';
    if (!geminiOk) {
      health.status = 'degraded';
    }
  } catch (error) {
    health.checks.gemini = 'error';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
}));

export default router;
