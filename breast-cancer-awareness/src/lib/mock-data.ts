// ============================================================
// Mock Data — Seed patients, doctors, assessments, appointments
// ============================================================

import { User, AssessmentResult, Appointment, ForumPost, PatientSummary, TimeSlot } from '@/types';

// ---- Users ----

export const mockUsers: User[] = [
  { id: 'p1', name: 'Priya Sharma', email: 'priya@example.com', role: 'patient', createdAt: '2026-01-15' },
  { id: 'p2', name: 'Anita Desai', email: 'anita@example.com', role: 'patient', createdAt: '2026-01-20' },
  { id: 'p3', name: 'Meera Joshi', email: 'meera@example.com', role: 'patient', createdAt: '2026-02-01' },
  { id: 'p4', name: 'Kavita Rao', email: 'kavita@example.com', role: 'patient', createdAt: '2026-02-05' },
  { id: 'd1', name: 'Dr. Rekha Menon', email: 'rekha@clinic.com', role: 'doctor', createdAt: '2025-06-01' },
  { id: 'd2', name: 'Dr. Sunita Patel', email: 'sunita@clinic.com', role: 'doctor', createdAt: '2025-06-01' },
  { id: 'v1', name: 'Hope Foundation', email: 'ngo@hope.org', role: 'volunteer', createdAt: '2025-09-01' },
  { id: 'a1', name: 'Admin User', email: 'admin@platform.com', role: 'admin', createdAt: '2025-01-01' },
];

// ---- Assessments ----

export const mockAssessments: AssessmentResult[] = [
  {
    id: 'asr1',
    userId: 'p1',
    riskFactorScore: 22,
    symptomScore: 12,
    totalScore: 16,
    riskLevel: 'low',
    explanations: [
      'Risk Factor Score: 22/100 (contributes 40% to total)',
      'Symptom Score: 12/100 (contributes 60% to total)',
      'Overall Score: 16/100 → LOW risk',
    ],
    recommendations: [
      'Continue routine screening as recommended for your age group.',
      'Perform monthly breast self-examinations (BSE).',
    ],
    timestamp: '2026-02-08T10:00:00Z',
  },
  {
    id: 'asr2',
    userId: 'p2',
    riskFactorScore: 55,
    symptomScore: 45,
    totalScore: 49,
    riskLevel: 'moderate',
    explanations: [
      'Risk Factor Score: 55/100 (contributes 40% to total)',
      'Symptom Score: 45/100 (contributes 60% to total)',
      'Overall Score: 49/100 → MODERATE risk',
      'Family history of breast cancer — one first-degree relative (weight: 5/5).',
      'Noticed a slight change in breast size (weight: 4/5).',
    ],
    recommendations: [
      'Schedule a clinical breast examination with your healthcare provider.',
      'Discuss your risk factors with a doctor to determine screening intervals.',
    ],
    timestamp: '2026-02-07T14:30:00Z',
  },
  {
    id: 'asr3',
    userId: 'p3',
    riskFactorScore: 70,
    symptomScore: 75,
    totalScore: 73,
    riskLevel: 'high',
    explanations: [
      'Risk Factor Score: 70/100 (contributes 40% to total)',
      'Symptom Score: 75/100 (contributes 60% to total)',
      'Overall Score: 73/100 → HIGH risk',
      'Multiple first-degree relatives with breast cancer (weight: 5/5).',
      'Noticed a new lump persisting for weeks (weight: 5/5).',
      'Nipple discharge reported (weight: 5/5).',
    ],
    recommendations: [
      'Please consult a healthcare professional as soon as possible.',
      'Request a clinical breast exam and discuss diagnostic imaging.',
      'Ask your doctor about genetic counseling.',
    ],
    timestamp: '2026-02-06T09:15:00Z',
  },
  {
    id: 'asr4',
    userId: 'p4',
    riskFactorScore: 35,
    symptomScore: 20,
    totalScore: 26,
    riskLevel: 'low',
    explanations: [
      'Risk Factor Score: 35/100 (contributes 40% to total)',
      'Symptom Score: 20/100 (contributes 60% to total)',
      'Overall Score: 26/100 → LOW risk',
    ],
    recommendations: [
      'Continue routine screening as recommended for your age group.',
      'Maintain a healthy lifestyle.',
    ],
    timestamp: '2026-02-09T11:00:00Z',
  },
];

// ---- Appointments ----

export const mockAppointments: Appointment[] = [
  {
    id: 'apt1',
    patientId: 'p2',
    patientName: 'Anita Desai',
    doctorId: 'd1',
    doctorName: 'Dr. Rekha Menon',
    date: '2026-02-14',
    time: '10:00 AM',
    status: 'confirmed',
    reason: 'Follow-up on moderate risk assessment',
  },
  {
    id: 'apt2',
    patientId: 'p3',
    patientName: 'Meera Joshi',
    doctorId: 'd1',
    doctorName: 'Dr. Rekha Menon',
    date: '2026-02-12',
    time: '2:00 PM',
    status: 'confirmed',
    reason: 'Urgent consultation — high risk assessment',
  },
  {
    id: 'apt3',
    patientId: 'p1',
    patientName: 'Priya Sharma',
    doctorId: 'd2',
    doctorName: 'Dr. Sunita Patel',
    date: '2026-02-20',
    time: '11:30 AM',
    status: 'pending',
    reason: 'Annual screening discussion',
  },
];

// ---- Doctor Availability (Mock) ----

export function getDoctorAvailability(doctorId: string, date: string): TimeSlot[] {
  // Mock: always return the same slots, marking some as booked
  const booked = mockAppointments
    .filter(a => a.doctorId === doctorId && a.date === date)
    .map(a => a.time);

  return [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
  ].map(time => ({ time, available: !booked.includes(time) }));
}

// ---- AI Summaries (Mock LLM) ----

export function generateAISummary(patient: User, assessment: AssessmentResult | null): string {
  if (!assessment) return `${patient.name} has not completed a risk assessment yet.`;

  const lines = [
    `**Patient**: ${patient.name} (ID: ${patient.id})`,
    `**Assessment Date**: ${new Date(assessment.timestamp).toLocaleDateString()}`,
    `**Overall Risk**: ${assessment.riskLevel.toUpperCase()} (${assessment.totalScore}/100)`,
    '',
    `Risk factor analysis shows a score of ${assessment.riskFactorScore}/100 and symptom-based evaluation yields ${assessment.symptomScore}/100.`,
  ];

  if (assessment.riskLevel === 'high') {
    lines.push(
      '',
      '⚠️ This patient shows multiple concerning indicators. Immediate clinical evaluation is recommended. Consider ordering diagnostic imaging and referring to a specialist.'
    );
  } else if (assessment.riskLevel === 'moderate') {
    lines.push(
      '',
      'This patient has some elevated risk factors. A clinical breast exam is advisable, and screening frequency should be discussed.'
    );
  } else {
    lines.push(
      '',
      'Risk profile is within normal range. Standard screening schedule is appropriate. Encourage continued self-examination.'
    );
  }

  return lines.join('\n');
}

export function generateSuggestedActions(assessment: AssessmentResult | null): string[] {
  if (!assessment) return ['Request patient to complete self-assessment.'];

  switch (assessment.riskLevel) {
    case 'high':
      return [
        'Order bilateral mammogram + ultrasound',
        'Refer to breast specialist / surgical oncology',
        'Consider genetic counseling referral (BRCA testing)',
        'Schedule follow-up within 2 weeks',
        'Document detailed clinical breast exam findings',
      ];
    case 'moderate':
      return [
        'Perform clinical breast examination',
        'Schedule mammogram if patient is 40+',
        'Review family history in detail',
        'Schedule follow-up in 1 month',
        'Provide breast health education materials',
      ];
    default:
      return [
        'Encourage regular self-examination',
        'Schedule next routine screening per age guidelines',
        'Provide lifestyle modification counseling',
        'No urgent action required',
      ];
  }
}

// ---- Patient Summaries for Doctor Dashboard ----

export function getPatientSummaries(): PatientSummary[] {
  return mockUsers
    .filter(u => u.role === 'patient')
    .map(patient => {
      const assessment = mockAssessments.find(a => a.userId === patient.id) || null;
      return {
        patient,
        latestAssessment: assessment,
        aiSummary: generateAISummary(patient, assessment),
        suggestedActions: generateSuggestedActions(assessment),
        appointments: mockAppointments.filter(a => a.patientId === patient.id),
      };
    });
}

// ---- Forum Posts (Mock) ----

export const mockForumPosts: ForumPost[] = [
  {
    id: 'fp1',
    authorName: 'Anonymous',
    authorRole: 'patient',
    isAnonymous: true,
    topic: 'Support & Coping',
    title: 'Dealing with anxiety after a moderate risk result',
    content: 'I recently took the self-assessment and received a moderate risk result. I know it\'s not a diagnosis, but I feel anxious. Has anyone else been through this? How did you cope while waiting for your doctor\'s appointment?',
    replies: [
      {
        id: 'fr1',
        authorName: 'Hope Foundation',
        isAnonymous: false,
        content: 'First, it\'s completely normal to feel anxious. Remember that moderate risk means monitoring, not diagnosis. We have a helpline you can reach out to for emotional support: 1800-XXX-XXXX.',
        createdAt: '2026-02-09T10:00:00Z',
      },
      {
        id: 'fr2',
        authorName: 'Anonymous',
        isAnonymous: true,
        content: 'I went through the same thing last year. My doctor was very reassuring. Please don\'t panic — early awareness is power, not fear. You\'ve already taken the right first step.',
        createdAt: '2026-02-09T11:30:00Z',
      },
    ],
    createdAt: '2026-02-08T18:00:00Z',
    tags: ['anxiety', 'moderate-risk', 'support'],
  },
  {
    id: 'fp2',
    authorName: 'Anonymous',
    authorRole: 'patient',
    isAnonymous: true,
    topic: 'Breast Self-Exam',
    title: 'How to do a proper breast self-exam (BSE)?',
    content: 'I keep hearing about BSE but I\'m not sure about the correct technique. Can someone guide me?',
    replies: [
      {
        id: 'fr3',
        authorName: 'Dr. Rekha Menon',
        isAnonymous: false,
        content: 'Great question! The best time for BSE is a few days after your period. Stand in front of a mirror, raise your arms, and look for changes. Then lie down and use the pads of your fingers to check each breast in a circular motion. If you feel anything unusual, please schedule a clinical exam.',
        createdAt: '2026-02-07T09:00:00Z',
      },
    ],
    createdAt: '2026-02-06T15:00:00Z',
    tags: ['bse', 'self-exam', 'guide'],
  },
  {
    id: 'fp3',
    authorName: 'Hope Foundation',
    authorRole: 'volunteer',
    isAnonymous: false,
    topic: 'Community Events',
    title: 'Free screening camp — February 25, Mumbai',
    content: 'We are organizing a free breast cancer screening camp at our center in Andheri, Mumbai on February 25th, 2026. Walk-ins welcome. Clinical breast exams and awareness sessions conducted by certified doctors. Spread the word!',
    replies: [],
    createdAt: '2026-02-05T12:00:00Z',
    tags: ['event', 'screening', 'free'],
  },
];
