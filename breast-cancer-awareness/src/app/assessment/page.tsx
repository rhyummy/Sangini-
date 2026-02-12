'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { riskFactorQuestions, symptomQuestions, calculateRiskScore } from '@/lib/scoring-engine';
import { Question } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { createAssessment } from '@/services/dataService';
import { ClipboardCheck, AlertTriangle, Info, Clock } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50/30 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Header Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-pink-100">
              <ClipboardCheck className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-medium text-gray-700">Self-Assessment</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-3">
            Breast Cancer Risk Assessment
          </h1>
          
          {/* Subtext */}
          <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
            This questionnaire helps you understand your risk level based on known risk factors
            and self-reported symptoms from breast self-examination (BSE).
          </p>

          {/* Medical Disclaimer Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-3">Medical Disclaimer</h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>This is <strong>NOT</strong> a medical diagnosis tool.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Results are for awareness and education only.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>This uses rule-based scoring, not clinical-grade AI.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Always consult a qualified healthcare professional.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Your responses are stored locally on your device only.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Assessment Structure Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-3">Assessment Structure</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span><strong>Part 1:</strong> Risk Factors ({riskFactorQuestions.length} questions) — contributes 40% to score</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span><strong>Part 2:</strong> Symptoms via BSE ({symptomQuestions.length} questions) — contributes 60% to score</span>
                  </li>
                </ul>
                <div className="flex items-center gap-2 mt-4 text-sm text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span>Takes approximately 3–5 minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consent Checkbox Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 accent-pink-600 flex-shrink-0"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I understand that this is an awareness tool only and does not provide a medical diagnosis.
                I consent to proceeding with the self-assessment.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setPhase('risk_factors')}
              disabled={!consent}
              className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-semibold text-base hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md disabled:shadow-none"
            >
              Begin Assessment
            </button>
            <button
              onClick={() => router.push('/')}
              className="sm:w-32 bg-white text-gray-700 py-4 rounded-xl font-medium text-base hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Calculating Screen ----
  if (phase === 'calculating') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pink-100 flex items-center justify-center">
          <ClipboardCheck className="w-8 h-8 text-pink-600 animate-pulse" />
        </div>
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
