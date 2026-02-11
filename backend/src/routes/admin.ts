import express from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/error';

const router = express.Router();

router.get('/metrics', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalAssessments,
    totalAppointments,
    totalChatSessions,
    recentAssessments,
    riskDistribution,
    appointmentsByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.riskAssessment.count(),
    prisma.appointment.count(),
    prisma.chatSession.count(),
    prisma.riskAssessment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } },
    }),
    prisma.riskAssessment.groupBy({
      by: ['level'],
      _count: true,
    }),
    prisma.appointment.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  res.json({
    overview: {
      totalUsers,
      totalAssessments,
      totalAppointments,
      totalChatSessions,
    },
    riskDistribution: riskDistribution.map(item => ({
      level: item.level,
      count: item._count,
    })),
    appointmentsByStatus: appointmentsByStatus.map(item => ({
      status: item.status,
      count: item._count,
    })),
    recentAssessments: recentAssessments.map(a => ({
      id: a.id,
      userName: a.user.name,
      level: a.level,
      score: a.score,
      createdAt: a.createdAt,
    })),
    timestamp: new Date().toISOString(),
  });
}));

export default router;
