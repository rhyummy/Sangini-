import express from 'express';
import { prisma } from '../lib/prisma';
import { getChatResponse } from '../services/gemini';
import { asyncHandler, AppError } from '../middleware/error';
import { validate, chatSchema } from '../middleware/validate';
import { chatRateLimiter } from '../middleware/rateLimit';

const router = express.Router();

router.post('/', chatRateLimiter, validate(chatSchema), asyncHandler(async (req, res) => {
  const { userId, sessionId, message } = req.body;

  let session;
  if (sessionId) {
    session = await prisma.chatSession.findUnique({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!session) {
      throw new AppError(404, 'Chat session not found');
    }
  } else {
    session = await prisma.chatSession.create({
      data: { userId },
      include: { messages: true },
    });
  }

  const history = session.messages
    .reverse()
    .map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

  const aiResponse = await getChatResponse(message, history);

  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: session.id,
        role: 'user',
        content: message,
      },
      {
        sessionId: session.id,
        role: 'assistant',
        content: aiResponse,
      },
    ],
  });

  res.json({
    sessionId: session.id,
    response: aiResponse,
    timestamp: new Date().toISOString(),
  });
}));

router.get('/sessions/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const sessions = await prisma.chatSession.findMany({
    where: { userId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ sessions });
}));

export default router;
