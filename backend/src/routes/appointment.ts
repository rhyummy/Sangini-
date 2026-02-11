import express from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, AppError } from '../middleware/error';
import { validate, appointmentSchema } from '../middleware/validate';

const router = express.Router();

router.post('/', validate(appointmentSchema), asyncHandler(async (req, res) => {
  const { userId, doctorName, date, time, notes } = req.body;

  const appointment = await prisma.appointment.create({
    data: {
      userId,
      doctorName,
      date,
      time,
      notes,
      status: 'SCHEDULED',
    },
  });

  res.status(201).json({
    message: 'Appointment scheduled successfully',
    appointment,
  });
}));

router.get('/user/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.query;

  const where: any = { userId };
  if (status) {
    where.status = status;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { date: 'desc' },
  });

  res.json({
    appointments,
    total: appointments.length,
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    throw new AppError(404, 'Appointment not found');
  }

  res.json({ appointment });
}));

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(status)) {
    throw new AppError(400, 'Invalid status');
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
  });

  res.json({
    message: 'Appointment status updated',
    appointment,
  });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.appointment.delete({
    where: { id },
  });

  res.json({
    message: 'Appointment deleted successfully',
  });
}));

export default router;
