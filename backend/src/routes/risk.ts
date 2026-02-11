import express from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/error';
import { validate, riskAssessmentSchema } from '../middleware/validate';

const router = express.Router();

interface RiskFactors {
  age?: number;
  familyHistory?: boolean;
  geneticMutation?: boolean;
  previousBreastCondition?: boolean;
  denseTissue?: boolean;
  lifestyleFactors?: {
    alcohol?: boolean;
    obesity?: boolean;
    lackOfExercise?: boolean;
  };
}

interface BSESymptoms {
  lump?: boolean;
  skinChanges?: boolean;
  nippleDischarge?: boolean;
  nippleRetraction?: boolean;
  breastPain?: boolean;
  sizeChange?: boolean;
  swelling?: boolean;
}

function calculateRiskFactorsScore(factors: RiskFactors): number {
  let score = 0;

  if (factors.age) {
    if (factors.age >= 50) score += 20;
    else if (factors.age >= 40) score += 15;
    else if (factors.age >= 30) score += 10;
  }

  if (factors.familyHistory) score += 25;
  if (factors.geneticMutation) score += 30;
  if (factors.previousBreastCondition) score += 20;
  if (factors.denseTissue) score += 15;

  if (factors.lifestyleFactors) {
    if (factors.lifestyleFactors.alcohol) score += 5;
    if (factors.lifestyleFactors.obesity) score += 5;
    if (factors.lifestyleFactors.lackOfExercise) score += 5;
  }

  return Math.min(score, 100);
}

function calculateSymptomsScore(symptoms: BSESymptoms): number {
  let score = 0;

  if (symptoms.lump) score += 40;
  if (symptoms.skinChanges) score += 25;
  if (symptoms.nippleDischarge) score += 20;
  if (symptoms.nippleRetraction) score += 20;
  if (symptoms.breastPain) score += 10;
  if (symptoms.sizeChange) score += 15;
  if (symptoms.swelling) score += 15;

  return Math.min(score, 100);
}

router.post('/', validate(riskAssessmentSchema), asyncHandler(async (req, res) => {
  const { userId, riskFactors = {}, symptoms = {} } = req.body;

  const riskFactorsScore = calculateRiskFactorsScore(riskFactors);
  const symptomsScore = calculateSymptomsScore(symptoms);

  const totalScore = Math.round(riskFactorsScore * 0.4 + symptomsScore * 0.6);

  let level: 'LOW' | 'MODERATE' | 'HIGH';
  let recommendations: string[];

  if (totalScore < 30) {
    level = 'LOW';
    recommendations = [
      'Continue regular self-examinations',
      'Maintain a healthy lifestyle with balanced diet and exercise',
      'Schedule routine screenings as recommended for your age group',
      'Stay informed about breast health'
    ];
  } else if (totalScore < 60) {
    level = 'MODERATE';
    recommendations = [
      'Schedule a consultation with a healthcare provider soon',
      'Continue monitoring any symptoms closely',
      'Consider more frequent screening intervals',
      'Discuss your risk factors with a specialist',
      'Keep a record of any changes you notice'
    ];
  } else {
    level = 'HIGH';
    recommendations = [
      'Seek medical consultation as soon as possible',
      'Schedule a clinical breast examination',
      'Discuss diagnostic imaging options with your doctor',
      'Prepare a detailed list of symptoms and their timeline',
      'Bring any family medical history information'
    ];
  }

  const assessment = await prisma.riskAssessment.create({
    data: {
      userId,
      score: totalScore,
      level,
      riskFactorsScore,
      symptomsScore,
      riskFactors,
      symptoms,
      recommendations,
    },
  });

  res.json({
    id: assessment.id,
    score: totalScore,
    level,
    breakdown: {
      riskFactorsScore,
      symptomsScore,
    },
    recommendations,
    timestamp: assessment.createdAt.toISOString(),
  });
}));

router.get('/history/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const assessments = await prisma.riskAssessment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ assessments });
}));

export default router;
