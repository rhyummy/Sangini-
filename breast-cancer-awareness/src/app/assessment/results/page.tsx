'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AssessmentResult } from '@/types';

export default function ResultsPage() {
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('bca_latest_result');
    if (stored) {
      try { setResult(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  if (!result) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Assessment Found</h2>
        <p className="text-gray-500 mb-6">Please complete the self-assessment first.</p>
        <Link href="/assessment" className="bg-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors">
          Take Assessment
        </Link>
      </div>
    );
  }

  const riskColorMap = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800', bar: 'bg-green-500' },
    moderate: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800', bar: 'bg-red-500' },
  };
  const colors = riskColorMap[result.riskLevel];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <strong>⚠️ Reminder:</strong> This result is for <strong>awareness only</strong> and is NOT a medical diagnosis. Please consult a healthcare professional for any medical decisions.
      </div>

      {/* Score Card */}
      <div className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-8 mb-8`}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">
            {result.riskLevel === 'low' ? '🟢' : result.riskLevel === 'moderate' ? '🟡' : '🔴'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Risk Level: <span className={colors.text}>{result.riskLevel.toUpperCase()}</span>
          </h1>
          <div className={`inline-block ${colors.badge} px-4 py-1 rounded-full font-bold text-lg`}>
            Score: {result.totalScore} / 100
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white/60 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Risk Factors (40%)</span>
              <span className="font-bold text-gray-900">{result.riskFactorScore}/100</span>
            </div>
            <div className="w-full h-3 bg-white rounded-full">
              <div className={`h-full ${colors.bar} rounded-full transition-all`} style={{ width: `${result.riskFactorScore}%` }} />
            </div>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Symptoms / BSE (60%)</span>
              <span className="font-bold text-gray-900">{result.symptomScore}/100</span>
            </div>
            <div className="w-full h-3 bg-white rounded-full">
              <div className={`h-full ${colors.bar} rounded-full transition-all`} style={{ width: `${result.symptomScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Explanations */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Score Explanation</h2>
        <div className="space-y-2">
          {result.explanations.map((exp, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-pink-400 mt-0.5">•</span>
              <p className="text-sm text-gray-700">{exp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">✅ Recommended Next Steps</h2>
        <div className="space-y-3">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex gap-3 items-start bg-pink-50/50 rounded-xl p-3">
              <span className="flex-shrink-0 w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/appointments" className="block text-center bg-pink-600 text-white py-3 rounded-xl font-medium hover:bg-pink-700 transition-colors">
          📅 Book Appointment
        </Link>
        <Link href="/chat" className="block text-center bg-white text-pink-600 border-2 border-pink-200 py-3 rounded-xl font-medium hover:bg-pink-50 transition-colors">
          💬 Talk to Support
        </Link>
        <Link href="/assessment" className="block text-center bg-white text-gray-600 border-2 border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
          🔄 Retake Assessment
        </Link>
      </div>
    </div>
  );
}
