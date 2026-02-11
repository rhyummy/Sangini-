import express from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, AppError } from '../middleware/error';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = express.Router();

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).optional(),
});

router.post('/', validate(createUserSchema), asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: role || 'PATIENT',
    },
  });

  res.status(201).json({ user });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          riskAssessments: true,
          appointments: true,
          chatSessions: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({ user });
}));

router.delete('/:id/data', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  await prisma.$transaction([
    prisma.chatMessage.deleteMany({
      where: { session: { userId: id } },
    }),
    prisma.chatSession.deleteMany({
      where: { userId: id },
    }),
    prisma.riskAssessment.deleteMany({
      where: { userId: id },
    }),
    prisma.appointment.deleteMany({
      where: { userId: id },
    }),
  ]);

  res.json({
    message: 'User data deleted successfully',
    userId: id,
  });
}));

export default router;
