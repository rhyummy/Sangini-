'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, AlertTriangle, CalendarDays, MessageCircle, RotateCcw } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto px-6 py-16 text-center"
        >
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Assessment Found</h2>
          <p className="text-gray-500 mb-6">Please complete the self-assessment first.</p>
          <Link href="/assessment" className="inline-block bg-pink-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-pink-700 transition-colors">
            Take Assessment
          </Link>
        </motion.div>
      </div>
    );
  }

  const riskConfig = {
    low: {
      gradient: 'from-emerald-50 to-green-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800',
      bar: 'bg-emerald-500',
      ring: 'ring-emerald-200',
      icon: <ShieldCheck size={32} className="text-emerald-500" />,
      label: 'LOW RISK',
    },
    moderate: {
      gradient: 'from-amber-50 to-yellow-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800',
      bar: 'bg-amber-500',
      ring: 'ring-amber-200',
      icon: <AlertTriangle size={32} className="text-amber-500" />,
      label: 'MODERATE RISK',
    },
    high: {
      gradient: 'from-red-50 to-rose-50',
      border: 'border-red-200',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800',
      bar: 'bg-red-500',
      ring: 'ring-red-200',
      icon: <ShieldAlert size={32} className="text-red-500" />,
      label: 'HIGH RISK',
    },
  };
  const c = riskConfig[result.riskLevel];

  // Separate risk factor vs BSE/symptom explanations
  const riskFactorIds = ['rf_age', 'rf_phh', 'rf_diet', 'rf_obesity', 'rf_smoker', 'rf_alcohol', 'rf_chest_radiation', 'rf_menstrual', 'rf_worklife'];
  const symptomKeywords = ['swelling', 'shrinkage', 'dimpling', 'asymmetry', 'skin', 'feel', 'breast', 'discharge', 'lump', 'nipple'];

  const allFindings = result.explanations.filter(e => e.includes('elevated concern'));

  const riskFindings = allFindings.filter(e =>
    !symptomKeywords.some(kw => e.toLowerCase().includes(kw))
  );
  const bseFindings = allFindings.filter(e =>
    symptomKeywords.some(kw => e.toLowerCase().includes(kw))
  );

  // Show max 3 recommendations
  const topRecommendations = result.recommendations.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Disclaimer — compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-xs text-amber-700 text-center"
        >
          ⚠️ For <strong>awareness only</strong> — not a medical diagnosis. Consult a professional for medical decisions.
        </motion.div>

        {/* Score Card — Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`bg-gradient-to-br ${c.gradient} ${c.border} border rounded-2xl p-8 mb-6 ring-1 ${c.ring}`}
        >
          {/* Header — aligned left */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/70 rounded-xl shadow-sm">
              {c.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{c.label}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Based on your responses</p>
            </div>
            <div className={`ml-auto ${c.badge} px-4 py-2 rounded-xl font-bold text-xl`}>
              {result.totalScore}
              <span className="text-sm font-medium opacity-70">/100</span>
            </div>
          </div>

          {/* Score Bars — cleaner */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Risk Factors</span>
                <span className="font-semibold text-gray-800">{result.riskFactorScore}%</span>
              </div>
              <div className="w-full h-2.5 bg-white/80 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.riskFactorScore}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  className={`h-full ${c.bar} rounded-full`}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Symptoms</span>
                <span className="font-semibold text-gray-800">{result.symptomScore}%</span>
              </div>
              <div className="w-full h-2.5 bg-white/80 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.symptomScore}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  className={`h-full ${c.bar} rounded-full`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Risk Factor Findings */}
        {riskFindings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 p-6 mb-4"
          >
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Risk Factors Flagged
            </h2>
            <div className="space-y-2">
              {riskFindings.map((exp, i) => (
                <p key={i} className="text-sm text-gray-600 pl-4 border-l-2 border-rose-200">
                  {exp}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* BSE / Symptom Findings */}
        {bseFindings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 p-6 mb-4"
          >
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              BSE / Symptom Findings
            </h2>
            <div className="space-y-2">
              {bseFindings.map((exp, i) => (
                <p key={i} className="text-sm text-gray-600 pl-4 border-l-2 border-amber-200">
                  {exp}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* No findings message */}
        {riskFindings.length === 0 && bseFindings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 p-6 mb-4 text-center"
          >
            <p className="text-sm text-emerald-700">No elevated concerns detected from your responses.</p>
          </motion.div>
        )}

        {/* Recommendations — max 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 p-6 mb-8"
        >
          <h2 className="text-base font-bold text-gray-900 mb-3">Next Steps</h2>
          <div className="space-y-2.5">
            {topRecommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid sm:grid-cols-3 gap-3"
        >
          <Link href="/appointments" className="flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl font-medium hover:bg-pink-700 transition-colors text-sm">
            <CalendarDays size={16} /> Book Appointment
          </Link>
          <Link href="/chat" className="flex items-center justify-center gap-2 bg-white text-pink-600 border border-pink-200 py-3 rounded-xl font-medium hover:bg-pink-50 transition-colors text-sm">
            <MessageCircle size={16} /> Talk to Support
          </Link>
          <Link href="/assessment" className="flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
            <RotateCcw size={16} /> Retake
          </Link>
        </motion.div>
      </div>
    </div>
  );
}