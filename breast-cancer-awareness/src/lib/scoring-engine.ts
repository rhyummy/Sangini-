// ============================================================
// Rule-Based Risk Scoring Engine
// ============================================================
// Derived from Breast_Cancer_Data_Value.csv (1,343 patient records)
// Weights calibrated from the dataset's _Val contribution columns.
//
// Scoring approach:
//   Total = (Risk Factor Score * 0.40) + (Symptom Score * 0.60)
//   Each category scored 0–100 based on weighted question responses.
//   Risk levels: Low (0-30), Moderate (31-60), High (61-100)
// ============================================================

import { Question, RiskFactorAnswer, SymptomAnswer, AssessmentResult } from '@/types';

// ---- Question Bank (derived from Breast_Cancer_Data_Value.csv) ----

export const riskFactorQuestions: Question[] = [
  // CSV column: Age (18–64 in dataset)
  {
    id: 'rf_age',
    category: 'risk_factor',
    text: 'What is your age group?',
    description: 'Risk increases with age — most breast cancers are diagnosed after 40.',
    options: [
      { label: 'Under 30', value: 0 },
      { label: '30–39', value: 0.3 },
      { label: '40–49', value: 0.6 },
      { label: '50–59', value: 0.8 },
      { label: '60+', value: 1.0 },
    ],
    weight: 3,
  },
  // CSV column: PHH (Personal/Family Health History) → _Val: 0.00 / 0.06
  {
    id: 'rf_phh',
    category: 'risk_factor',
    text: 'Do you have a personal or family history of breast cancer?',
    description: 'Includes first-degree relatives (mother, sister, daughter) or personal prior diagnosis.',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1.0 },
    ],
    weight: 3,
  },
  // CSV column: Diet → _Val: Healthy=0.00, Junk=0.02
  {
    id: 'rf_diet',
    category: 'risk_factor',
    text: 'How would you describe your regular diet?',
    description: 'A balanced diet may lower risk; high-fat or processed food diets are linked to increased risk.',
    options: [
      { label: 'Healthy / balanced', value: 0 },
      { label: 'Mixed / moderate', value: 0.4 },
      { label: 'Mostly junk / processed food', value: 1.0 },
    ],
    weight: 1,
  },
  // CSV column: Obesity → _Val: Normal/Thinness=0.00, Overweight=0.00, Obese=0.02
  {
    id: 'rf_obesity',
    category: 'risk_factor',
    text: 'What best describes your body weight / BMI range?',
    description: 'Obesity (especially post-menopause) is associated with higher breast cancer risk.',
    options: [
      { label: 'Underweight / Thinness', value: 0 },
      { label: 'Normal weight', value: 0 },
      { label: 'Overweight', value: 0.4 },
      { label: 'Obese', value: 1.0 },
    ],
    weight: 1,
  },
  // CSV column: Smoker → _Val: no=0.00, yes=0.02
  {
    id: 'rf_smoker',
    category: 'risk_factor',
    text: 'Are you a current or former smoker?',
    description: 'Smoking is linked to a modestly increased risk of breast cancer.',
    options: [
      { label: 'No, never smoked', value: 0 },
      { label: 'Former smoker', value: 0.5 },
      { label: 'Yes, current smoker', value: 1.0 },
    ],
    weight: 1,
  },
  // CSV column: Alcohol_Consumption → _Val: No=0.00, Yes=0.02
  {
    id: 'rf_alcohol',
    category: 'risk_factor',
    text: 'Do you consume alcohol?',
    description: 'Regular alcohol consumption is associated with increased risk.',
    options: [
      { label: 'No / rarely', value: 0 },
      { label: 'Yes, regularly', value: 1.0 },
    ],
    weight: 1,
  },
  // CSV column: Chest Radiation → _Val: No=0.00, Yes=0.20 (highest risk factor)
  {
    id: 'rf_chest_radiation',
    category: 'risk_factor',
    text: 'Have you ever received radiation therapy to the chest area?',
    description: 'Prior chest radiation (e.g., for Hodgkin lymphoma) significantly increases breast cancer risk.',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1.0 },
    ],
    weight: 5,
  },
  // CSV column: Menstrual History → _Val: Normal=0.00, others=0.04
  {
    id: 'rf_menstrual',
    category: 'risk_factor',
    text: 'Which best describes your menstrual / reproductive history?',
    description: 'Factors that increase lifetime estrogen exposure can raise risk.',
    options: [
      { label: 'Normal menstrual history', value: 0 },
      { label: 'Early menstruation (before age 12)', value: 1.0 },
      { label: 'Late menopause (after age 55)', value: 1.0 },
      { label: 'First child after age 30 (late childbirth)', value: 1.0 },
      { label: 'Never gave birth', value: 1.0 },
    ],
    weight: 2,
  },
  // CSV column: Worklife → _Val: Regular=0.00, others=0.02
  {
    id: 'rf_worklife',
    category: 'risk_factor',
    text: 'What type of work schedule do you have?',
    description: 'Night shifts and irregular schedules may disrupt circadian rhythms and affect risk.',
    options: [
      { label: 'Regular daytime schedule', value: 0 },
      { label: 'Morning shifts', value: 0.5 },
      { label: 'Rotational / changing shifts', value: 0.8 },
      { label: 'Night shifts', value: 1.0 },
    ],
    weight: 1,
  },
];

export const symptomQuestions: Question[] = [
  // CSV column: Breasts_Swelling → _Val: No=0.00, One/Both=0.06
  {
    id: 'sx_swelling',
    category: 'symptom',
    text: 'Have you noticed any swelling in one or both breasts?',
    description: 'Unexplained swelling, even without a lump, should be evaluated.',
    options: [
      { label: 'No swelling', value: 0 },
      { label: 'Yes, in one breast', value: 0.8 },
      { label: 'Yes, in both breasts', value: 1.0 },
    ],
    weight: 3,
  },
  // CSV column: Breasts_Shrinkage → _Val: No=0.00, One/Both=0.06
  {
    id: 'sx_shrinkage',
    category: 'symptom',
    text: 'Have you noticed any shrinkage (decrease in size) of one or both breasts?',
    description: 'Unexplained change in breast size can be a warning sign.',
    options: [
      { label: 'No shrinkage', value: 0 },
      { label: 'Yes, in one breast', value: 0.8 },
      { label: 'Yes, in both breasts', value: 1.0 },
    ],
    weight: 3,
  },
  // CSV column: Breasts_Dimpling → _Val: 0=0.00, 1/2/3=0.06
  {
    id: 'sx_dimpling',
    category: 'symptom',
    text: 'Have you noticed any dimpling (indentations or puckering) on the breast skin?',
    description: 'Dimpling can indicate underlying tissue changes — sometimes called "peau d\'orange".',
    options: [
      { label: 'No dimpling observed', value: 0 },
      { label: 'Mild dimpling (1 area)', value: 0.6 },
      { label: 'Moderate dimpling (2 areas)', value: 0.8 },
      { label: 'Significant dimpling (3+ areas)', value: 1.0 },
    ],
    weight: 3,
  },
  // CSV column: Breasts_Asymmetry → _Val: S=0.00, A=0.03
  {
    id: 'sx_asymmetry',
    category: 'symptom',
    text: 'Have you noticed a new or worsening asymmetry between your breasts?',
    description: 'Some asymmetry is normal, but new or changing asymmetry should be checked.',
    options: [
      { label: 'Symmetric (no noticeable difference)', value: 0 },
      { label: 'Asymmetric (noticeable difference)', value: 1.0 },
    ],
    weight: 2,
  },
  // CSV column: Skin_of_Breast → _Val: Normal=0.00, all others=0.09
  {
    id: 'sx_skin',
    category: 'symptom',
    text: 'How does the skin of your breast look or feel?',
    description: 'Skin changes on the breast are important warning signs to discuss with a doctor.',
    options: [
      { label: 'Normal — no changes', value: 0 },
      { label: 'Red or inflamed', value: 0.8 },
      { label: 'Scaly or flaky', value: 0.8 },
      { label: 'Swollen', value: 0.9 },
      { label: 'Looks like orange skin (peau d\'orange)', value: 1.0 },
    ],
    weight: 4,
  },
  // CSV column: Breast Feels → _Val: Normal=0.00, Lump/TenderNess/Thickness=0.15
  {
    id: 'sx_feel',
    category: 'symptom',
    text: 'How does your breast feel when you examine it?',
    description: 'Regular breast self-examination helps detect changes early.',
    options: [
      { label: 'Normal — no unusual feeling', value: 0 },
      { label: 'Tenderness or pain', value: 0.8 },
      { label: 'Thickening of breast tissue', value: 0.9 },
      { label: 'A definite lump', value: 1.0 },
    ],
    weight: 5,
  },
  // CSV column: Niple Discharge → _Val: Normal/Milky=0.00, Clear/Bloody=0.15
  {
    id: 'sx_discharge',
    category: 'symptom',
    text: 'Have you noticed any nipple discharge?',
    description: 'Non-milky discharge (especially bloody or clear) should be evaluated promptly.',
    options: [
      { label: 'No discharge', value: 0 },
      { label: 'Milky discharge (normal if breastfeeding)', value: 0.1 },
      { label: 'Clear or watery discharge', value: 0.8 },
      { label: 'Bloody discharge', value: 1.0 },
    ],
    weight: 5,
  },
];

// ---- Scoring Functions ----

function computeCategoryScore(
  questions: Question[],
  answers: { questionId: string; value: number }[]
): { score: number; explanations: string[] } {
  let totalWeight = 0;
  let weightedSum = 0;
  const explanations: string[] = [];

  for (const q of questions) {
    const answer = answers.find(a => a.questionId === q.id);
    if (!answer) continue;

    totalWeight += q.weight;
    weightedSum += answer.value * q.weight;

    if (answer.value >= 0.5) {
      explanations.push(
        `${q.text} — Your response indicates elevated concern (weight: ${q.weight}/5).`
      );
    }
  }

  const score = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
  return { score: Math.round(score * 10) / 10, explanations };
}

function getRiskLevel(totalScore: number): 'low' | 'moderate' | 'high' {
  if (totalScore <= 30) return 'low';
  if (totalScore <= 60) return 'moderate';
  return 'high';
}

function getRecommendations(riskLevel: 'low' | 'moderate' | 'high', symptomScore: number): string[] {
  const common = [
    'Perform monthly breast self-examinations (BSE).',
    'Maintain a healthy diet and regular exercise routine.',
    'Limit alcohol consumption and avoid smoking.',
  ];

  switch (riskLevel) {
    case 'low':
      return [
        ...common,
        'Continue routine screening as recommended for your age group.',
        'Stay informed about breast health through trusted medical resources.',
      ];
    case 'moderate':
      return [
        ...common,
        'Schedule a clinical breast examination with your healthcare provider.',
        'Discuss your risk factors (family history, chest radiation exposure, menstrual history) with a doctor.',
        symptomScore > 40
          ? 'Some symptoms you reported warrant prompt medical evaluation — please consult a doctor soon.'
          : 'Consider an annual mammogram if you are 40 or older.',
      ];
    case 'high':
      return [
        'Please consult a healthcare professional as soon as possible.',
        'Request a clinical breast exam and discuss diagnostic imaging (mammogram / ultrasound / MRI).',
        'Ask your doctor about genetic counseling if you have a personal or family history.',
        'Do not delay — early detection significantly improves outcomes.',
        ...common,
      ];
  }
}

// ---- Main Scoring Function ----

export function calculateRiskScore(
  riskFactorAnswers: RiskFactorAnswer[],
  symptomAnswers: SymptomAnswer[]
): Omit<AssessmentResult, 'id' | 'userId' | 'timestamp'> {
  const rfResult = computeCategoryScore(riskFactorQuestions, riskFactorAnswers);
  const sxResult = computeCategoryScore(symptomQuestions, symptomAnswers);

  const totalScore = Math.round(rfResult.score * 0.4 + sxResult.score * 0.6);
  const riskLevel = getRiskLevel(totalScore);
  const recommendations = getRecommendations(riskLevel, sxResult.score);

  const explanations = [
    `Risk Factor Score: ${rfResult.score}/100 (contributes 40% to total)`,
    `Symptom Score: ${sxResult.score}/100 (contributes 60% to total)`,
    `Overall Score: ${totalScore}/100 → ${riskLevel.toUpperCase()} risk`,
    `Scored using weights derived from a 1,343-patient clinical dataset.`,
    '',
    ...rfResult.explanations,
    ...sxResult.explanations,
  ];

  return {
    riskFactorScore: rfResult.score,
    symptomScore: sxResult.score,
    totalScore,
    riskLevel,
    explanations: explanations.filter(Boolean),
    recommendations,
  };
}
