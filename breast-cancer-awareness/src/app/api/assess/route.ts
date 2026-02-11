import { NextRequest, NextResponse } from 'next/server';
import { calculateRiskScore } from '@/lib/scoring-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { riskFactorAnswers, symptomAnswers } = body;

    if (!riskFactorAnswers || !symptomAnswers) {
      return NextResponse.json(
        { error: 'Missing riskFactorAnswers or symptomAnswers' },
        { status: 400 }
      );
    }

    const result = calculateRiskScore(riskFactorAnswers, symptomAnswers);

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        id: 'asr_' + Date.now(),
        userId: body.userId || 'anonymous',
        timestamp: new Date().toISOString(),
      },
      disclaimer: 'This assessment is for awareness only and does NOT constitute a medical diagnosis.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    );
  }
}
