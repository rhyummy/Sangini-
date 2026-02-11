// ============================================================
// Core Types for Breast Cancer Risk Awareness Platform
// ============================================================

export type UserRole = 'patient' | 'doctor' | 'volunteer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// ---- Risk Assessment ----

export interface RiskFactorAnswer {
  questionId: string;
  value: number; // 0-1 scale or discrete
  label: string;
}

export interface SymptomAnswer {
  questionId: string;
  value: number;
  label: string;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  riskFactorScore: number;   // 0-100, weighted 40%
  symptomScore: number;       // 0-100, weighted 60%
  totalScore: number;         // 0-100
  riskLevel: 'low' | 'moderate' | 'high';
  explanations: string[];
  recommendations: string[];
  timestamp: string;
}

export interface Question {
  id: string;
  category: 'risk_factor' | 'symptom';
  text: string;
  description?: string;
  options: { label: string; value: number }[];
  weight: number; // importance weight 1-5
}

// ---- Appointments ----

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

// ---- Chatbot ----

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ---- Smart Conclave ----

export interface ForumPost {
  id: string;
  authorName: string;
  authorRole: UserRole;
  isAnonymous: boolean;
  topic: string;
  title: string;
  content: string;
  replies: ForumReply[];
  createdAt: string;
  tags: string[];
}

export interface ForumReply {
  id: string;
  authorName: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
}

// ---- Doctor Dashboard ----

export interface PatientSummary {
  patient: User;
  latestAssessment: AssessmentResult | null;
  aiSummary: string;
  suggestedActions: string[];
  appointments: Appointment[];
}
