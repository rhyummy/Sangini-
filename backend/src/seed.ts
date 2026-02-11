import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        role: 'PATIENT',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@hospital.com',
        role: 'DOCTOR',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Maya Rodriguez',
        email: 'maya.r@example.com',
        role: 'PATIENT',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  await prisma.riskAssessment.create({
    data: {
      userId: users[0].id,
      score: 35,
      level: 'MODERATE',
      riskFactorsScore: 40,
      symptomsScore: 32,
      riskFactors: {
        age: 45,
        familyHistory: true,
        denseTissue: false,
      },
      symptoms: {
        lump: false,
        breastPain: true,
        skinChanges: false,
      },
      recommendations: [
        'Schedule a consultation with a healthcare provider',
        'Continue monitoring any symptoms',
      ],
    },
  });

  await prisma.riskAssessment.create({
    data: {
      userId: users[2].id,
      score: 15,
      level: 'LOW',
      riskFactorsScore: 10,
      symptomsScore: 18,
      riskFactors: {
        age: 30,
        familyHistory: false,
      },
      symptoms: {
        lump: false,
        breastPain: false,
      },
      recommendations: [
        'Continue regular self-examinations',
        'Maintain a healthy lifestyle',
      ],
    },
  });

  console.log('Created risk assessments');

  await Promise.all([
    prisma.appointment.create({
      data: {
        userId: users[0].id,
        doctorName: 'Dr. Priya Sharma',
        date: '2026-02-20',
        time: '10:00 AM',
        notes: 'Annual screening',
        status: 'SCHEDULED',
      },
    }),
    prisma.appointment.create({
      data: {
        userId: users[2].id,
        doctorName: 'Dr. Sarah Chen',
        date: '2026-02-15',
        time: '02:30 PM',
        notes: 'Follow-up consultation',
        status: 'SCHEDULED',
      },
    }),
  ]);

  console.log('Created appointments');

  const chatSession = await prisma.chatSession.create({
    data: {
      userId: users[0].id,
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: chatSession.id,
        role: 'user',
        content: 'I am feeling anxious about my upcoming screening.',
      },
      {
        sessionId: chatSession.id,
        role: 'assistant',
        content: 'It is completely natural to feel anxious before a screening. Remember that screenings are a proactive step for your health. Take some deep breaths, and know that you are taking care of yourself. Would you like to talk about what specifically is worrying you?',
      },
    ],
  });

  console.log('Created chat session with messages');

  console.log('Seeding completed successfully');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
