'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { riskFactorQuestions, symptomQuestions, calculateRiskScore } from '@/lib/scoring-engine';
import { Question } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { createAssessment } from '@/services/dataService';

type Phase = 'consent' | 'risk_factors' | 'symptoms' | 'calculating';

export default function AssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('consent');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [riskAnswers, setRiskAnswers] = useState<Record<string, number>>({});
  const [symptomAnswers, setSymptomAnswers] = useState<Record<string, number>>({});
  const [consent, setConsent] = useState(false);

  const questions = phase === 'risk_factors' ? riskFactorQuestions : symptomQuestions;
  const answers = phase === 'risk_factors' ? riskAnswers : symptomAnswers;
  const setAnswers = phase === 'risk_factors' ? setRiskAnswers : setSymptomAnswers;
  const currentQuestion = questions[currentIdx];

  const totalQuestions = riskFactorQuestions.length + symptomQuestions.length;
  const answered = phase === 'risk_factors'
    ? Object.keys(riskAnswers).length
    : riskFactorQuestions.length + Object.keys(symptomAnswers).length;

  function handleSelect(value: number) {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else if (phase === 'risk_factors') {
        setPhase('symptoms');
        setCurrentIdx(0);
      } else {
        submitAssessment();
      }
    }, 300);
  }

  function handleBack() {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    } else if (phase === 'symptoms') {
      setPhase('risk_factors');
      setCurrentIdx(riskFactorQuestions.length - 1);
    }
  }

  async function submitAssessment() {
    setPhase('calculating');

    const rfAnswers = Object.entries(riskAnswers).map(([questionId, value]) => ({
      questionId,
      value,
      label: '',
    }));
    const sxAnswers = Object.entries(symptomAnswers).map(([questionId, value]) => ({
      questionId,
      value,
      label: '',
    }));

    const result = calculateRiskScore(rfAnswers, sxAnswers);

    // Prepare full result
    const fullResult = {
      ...result,
      id: 'asr_' + Date.now(),
      userId: user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
    };

    // Try to save assessment via dataService
    if (user?.id) {
      try {
        await createAssessment({
          userId: user.id,
          riskScore: result.totalScore,
          riskLevel: result.riskLevel,
          riskBreakdown: {
            riskFactorScore: result.riskFactorScore,
            symptomScore: result.symptomScore,
            explanations: result.explanations,
            recommendations: result.recommendations,
          },
        });
        console.log('Assessment saved successfully');
      } catch (err) {
        console.error('Failed to save to Supabase, storing locally:', err);
      }
    }

    // Always store in localStorage for results page
    localStorage.setItem('bca_latest_result', JSON.stringify(fullResult));

    setTimeout(() => {
      router.push('/assessment/results');
    }, 1500);
  }

  // ---- Consent Screen ----
  if (phase === 'consent') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Breast Cancer Risk Self-Assessment</h1>
          <p className="text-gray-600 mb-6">
            This questionnaire helps you understand your risk level based on known risk factors
            and self-reported symptoms from breast self-examination (BSE).
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            <strong>⚠️ Medical Disclaimer</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>This is <strong>NOT</strong> a medical diagnosis tool.</li>
              <li>Results are for awareness and education only.</li>
              <li>This uses rule-based scoring, not clinical-grade AI.</li>
              <li>Always consult a qualified healthcare professional.</li>
              <li>Your responses are stored locally on your device only.</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
            <strong>📋 Assessment Structure</strong>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Part 1:</strong> Risk Factors ({riskFactorQuestions.length} questions) — contributes 40% to score</li>
              <li>• <strong>Part 2:</strong> Symptoms via BSE ({symptomQuestions.length} questions) — contributes 60% to score</li>
              <li>• Takes approximately 3–5 minutes</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-5 h-5 accent-pink-600"
            />
            <span className="text-sm text-gray-700">
              I understand that this is an awareness tool only and does not provide a medical diagnosis.
              I consent to proceeding with the self-assessment.
            </span>
          </label>

          <button
            onClick={() => setPhase('risk_factors')}
            disabled={!consent}
            className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Begin Assessment
          </button>
        </div>
      </div>
    );
  }

  // ---- Calculating Screen ----
  if (phase === 'calculating') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-6 animate-pulse">🔬</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Calculating Your Risk Score...</h2>
        <p className="text-gray-500">Analyzing your responses with our rule-based scoring engine.</p>
        <div className="mt-8 w-48 h-2 bg-pink-100 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-pink-500 rounded-full animate-[loading_1.5s_ease-in-out]" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  // ---- Question Screen ----
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-pink-600 capitalize">
            {phase === 'risk_factors' ? '📊 Part 1: Risk Factors' : '🔍 Part 2: Symptoms (BSE)'}
          </span>
          <span className="text-sm text-gray-500">
            {answered + 1} of {totalQuestions}
          </span>
        </div>
        <div className="w-full h-2 bg-pink-100 rounded-full">
          <div
            className="h-full bg-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${((answered) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {currentQuestion.text}
          </h2>
          {currentQuestion.description && (
            <p className="text-sm text-gray-500">{currentQuestion.description}</p>
          )}
          <div className="mt-2 flex gap-1">
            {[...Array(currentQuestion.weight)].map((_, i) => (
              <span key={i} className="text-xs">⭐</span>
            ))}
            <span className="text-xs text-gray-400 ml-1">importance: {currentQuestion.weight}/5</span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50 text-pink-700 font-medium'
                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={phase === 'risk_factors' && currentIdx === 0}
            className="text-sm text-gray-500 hover:text-pink-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          {answers[currentQuestion.id] !== undefined && (
            <button
              onClick={() => {
                if (currentIdx < questions.length - 1) {
                  setCurrentIdx(currentIdx + 1);
                } else if (phase === 'risk_factors') {
                  setPhase('symptoms');
                  setCurrentIdx(0);
                } else {
                  submitAssessment();
                }
              }}
              className="text-sm text-pink-600 font-medium hover:text-pink-700"
            >
              {phase === 'symptoms' && currentIdx === questions.length - 1
                ? 'Submit Assessment →'
                : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
