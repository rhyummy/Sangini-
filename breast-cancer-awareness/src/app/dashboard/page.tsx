'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchPatientSummaries } from '@/lib/supabase-data';
import { PatientSummary } from '@/types';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
  const [summaries, setSummaries] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient summaries from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchPatientSummaries();
        setSummaries(data);
      } catch (err) {
        console.error('Error loading patient summaries:', err);
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'doctor') {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || user.role !== 'doctor') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Doctor Access Only</h2>
        <p className="text-gray-500">Please log in as a doctor to access this dashboard. Use the Demo Login button in the navbar.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading patient data from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Smart Assist Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome, {user.name}. AI-generated summaries and decision support for your patients.</p>
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          <strong>Note:</strong> AI summaries are decision-support tools only. Clinical judgment always takes precedence.
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <h2 className="font-bold text-gray-900 mb-3">Patients ({summaries.length})</h2>
          <div className="space-y-3">
            {summaries.map((s) => {
              const isSelected = selectedPatient?.patient.id === s.patient.id;
              const riskColors = {
                low: 'bg-green-100 text-green-700',
                moderate: 'bg-amber-100 text-amber-700',
                high: 'bg-red-100 text-red-700',
              };
              const riskLevel = s.latestAssessment?.riskLevel;
              return (
                <button
                  key={s.patient.id}
                  onClick={() => setSelectedPatient(s)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{s.patient.name}</p>
                      <p className="text-xs text-gray-500">ID: {s.patient.id}</p>
                    </div>
                    {riskLevel && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${riskColors[riskLevel]}`}>
                        {riskLevel.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {s.latestAssessment && (
                    <div className="mt-2 text-xs text-gray-500">
                      Score: {s.latestAssessment.totalScore}/100 · {new Date(s.latestAssessment.timestamp).toLocaleDateString()}
                    </div>
                  )}
                  {s.appointments.length > 0 && (
                    <div className="mt-1 text-xs text-purple-600">
                      📅 {s.appointments.length} appointment{s.appointments.length > 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <PatientDetail summary={selectedPatient} />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">👈</div>
              <p>Select a patient to view their AI-generated summary, risk details, and suggested actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientDetail({ summary }: { summary: PatientSummary }) {
  const { patient, latestAssessment, aiSummary, suggestedActions, appointments } = summary;
  const [activeTab, setActiveTab] = useState<'summary' | 'actions' | 'appointments'>('summary');

  const riskColors = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-500' },
    moderate: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500' },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500' },
  };
  const colors = latestAssessment ? riskColors[latestAssessment.riskLevel] : null;

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
            <p className="text-sm text-gray-500">{patient.email} · Joined {new Date(patient.createdAt).toLocaleDateString()}</p>
          </div>
          {latestAssessment && colors && (
            <div className={`${colors.bg} ${colors.border} border px-4 py-2 rounded-xl text-center`}>
              <div className={`font-bold text-lg ${colors.text}`}>{latestAssessment.totalScore}/100</div>
              <div className={`text-xs font-medium ${colors.text} uppercase`}>{latestAssessment.riskLevel} Risk</div>
            </div>
          )}
        </div>

        {latestAssessment && colors && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Risk Factors (40%)</span>
                <span>{latestAssessment.riskFactorScore}/100</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${latestAssessment.riskFactorScore}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Symptoms (60%)</span>
                <span>{latestAssessment.symptomScore}/100</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${latestAssessment.symptomScore}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {(['summary', 'actions', 'appointments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white border border-b-white border-gray-200 -mb-px text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'summary' ? '🤖 AI Summary' : tab === 'actions' ? '📋 Suggested Actions' : '📅 Appointments'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {activeTab === 'summary' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">AI-Generated</span>
              <span className="text-xs text-gray-400">For decision support only</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
              {aiSummary}
            </div>
            {latestAssessment && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Score Explanations:</h4>
                <ul className="space-y-1">
                  {latestAssessment.explanations.map((exp, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-purple-400">•</span> {exp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div>
            <p className="text-xs text-gray-400 mb-4">AI-suggested next steps — clinical judgment always takes precedence.</p>
            <div className="space-y-3">
              {suggestedActions.map((action, i) => (
                <div key={i} className="flex gap-3 items-start bg-purple-50/50 rounded-xl p-3">
                  <input type="checkbox" className="mt-1 w-4 h-4 accent-purple-600" />
                  <span className="text-sm text-gray-700">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            {appointments.length === 0 ? (
              <p className="text-gray-400 text-center py-6">No appointments scheduled.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map(apt => (
                  <div key={apt.id} className="flex justify-between items-center bg-gray-50 rounded-xl p-4">
                    <div>
                      <p className="font-medium text-gray-900">{apt.date} at {apt.time}</p>
                      <p className="text-sm text-gray-500">{apt.reason}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
