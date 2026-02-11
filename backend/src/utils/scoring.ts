export interface RiskFactors {
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

export interface BSESymptoms {
  lump?: boolean;
  skinChanges?: boolean;
  nippleDischarge?: boolean;
  nippleRetraction?: boolean;
  breastPain?: boolean;
  sizeChange?: boolean;
  swelling?: boolean;
}

export interface RiskScoreResult {
  score: number;
  level: 'Low' | 'Moderate' | 'High';
  breakdown: {
    riskFactorsScore: number;
    symptomsScore: number;
  };
  recommendations: string[];
}

export function calculateRiskScore(
  riskFactors: RiskFactors,
  symptoms: BSESymptoms
): RiskScoreResult {
  const riskFactorsScore = calculateRiskFactorsScore(riskFactors);
  const symptomsScore = calculateSymptomsScore(symptoms);

  const totalScore = riskFactorsScore * 0.4 + symptomsScore * 0.6;

  let level: 'Low' | 'Moderate' | 'High';
  let recommendations: string[];

  if (totalScore < 30) {
    level = 'Low';
    recommendations = [
      'Continue regular self-examinations',
      'Maintain a healthy lifestyle',
      'Schedule routine screenings as recommended for your age group'
    ];
  } else if (totalScore < 60) {
    level = 'Moderate';
    recommendations = [
      'Schedule a consultation with a healthcare provider',
      'Continue monitoring any symptoms',
      'Consider more frequent screening intervals',
      'Discuss your risk factors with a specialist'
    ];
  } else {
    level = 'High';
    recommendations = [
      'Seek immediate medical consultation',
      'Schedule a clinical breast examination',
      'Discuss diagnostic imaging options with your doctor',
      'Prepare a list of symptoms and their timeline'
    ];
  }

  return {
    score: Math.round(totalScore),
    level,
    breakdown: {
      riskFactorsScore: Math.round(riskFactorsScore),
      symptomsScore: Math.round(symptomsScore)
    },
    recommendations
  };
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
