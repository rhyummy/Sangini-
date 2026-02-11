// ============================================================
// Data Service Layer — Supabase Primary, Mock Fallback
// ============================================================

import { supabase } from '@/lib/supabase';
import {
  User,
  AssessmentResult,
  Appointment,
  ForumPost,
  PatientSummary,
  UserRole,
  TimeSlot,
} from '@/types';
import {
  mockUsers,
  mockAssessments,
  mockAppointments,
  mockForumPosts,
  generateAISummary,
  generateSuggestedActions,
  getDoctorAvailability as getMockAvailability,
} from '@/lib/mock-data';

// ============================================================
// Type Definitions for Supabase Response
// ============================================================

interface SupabaseUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface SupabaseAssessment {
  id: string;
  user_id: string;
  risk_score: number;
  risk_level: string;
  risk_breakdown: {
    riskFactorScore?: number;
    symptomScore?: number;
    explanations?: string[];
    recommendations?: string[];
  } | null;
  created_at: string;
}

interface SupabaseAppointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  status: string;
  created_at: string;
}

interface SupabasePost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

// ============================================================
// Mappers: Supabase (snake_case) → Frontend (camelCase)
// ============================================================

function mapUser(sb: SupabaseUser): User {
  return {
    id: sb.id,
    name: sb.full_name,
    email: sb.email,
    role: sb.role as UserRole,
    createdAt: sb.created_at,
  };
}

function mapAssessment(sb: SupabaseAssessment): AssessmentResult {
  const breakdown = sb.risk_breakdown || {};
  return {
    id: sb.id,
    userId: sb.user_id,
    riskFactorScore: breakdown.riskFactorScore ?? Math.round(sb.risk_score * 0.4),
    symptomScore: breakdown.symptomScore ?? Math.round(sb.risk_score * 0.6),
    totalScore: sb.risk_score,
    riskLevel: sb.risk_level as 'low' | 'moderate' | 'high',
    explanations: breakdown.explanations ?? [`Overall Score: ${sb.risk_score}/100 → ${sb.risk_level.toUpperCase()} risk`],
    recommendations: breakdown.recommendations ?? getDefaultRecommendations(sb.risk_level),
    timestamp: sb.created_at,
  };
}

function mapAppointment(sb: SupabaseAppointment, users: User[]): Appointment {
  const patient = users.find(u => u.id === sb.patient_id);
  const doctor = users.find(u => u.id === sb.doctor_id);
  const date = new Date(sb.appointment_date);

  return {
    id: sb.id,
    patientId: sb.patient_id,
    patientName: patient?.name || 'Unknown Patient',
    doctorId: sb.doctor_id,
    doctorName: doctor?.name || 'Unknown Doctor',
    date: date.toISOString().split('T')[0],
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    status: sb.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
    reason: 'Consultation',
  };
}

function mapPost(sb: SupabasePost, users: User[]): ForumPost {
  const author = users.find(u => u.id === sb.user_id);
  return {
    id: sb.id,
    authorName: author?.name || 'Anonymous',
    authorRole: (author?.role || 'patient') as UserRole,
    isAnonymous: !author,
    topic: 'General',
    title: sb.title,
    content: sb.content,
    replies: [],
    createdAt: sb.created_at,
    tags: [],
  };
}

function getDefaultRecommendations(riskLevel: string): string[] {
  switch (riskLevel) {
    case 'high':
      return [
        'Please consult a healthcare professional as soon as possible.',
        'Request a clinical breast exam and discuss diagnostic imaging.',
        'Ask your doctor about genetic counseling.',
      ];
    case 'moderate':
      return [
        'Schedule a clinical breast examination with your healthcare provider.',
        'Discuss your risk factors with a doctor to determine screening intervals.',
      ];
    default:
      return [
        'Continue routine screening as recommended for your age group.',
        'Perform monthly breast self-examinations (BSE).',
      ];
  }
}

// ============================================================
// Data Fetching Functions
// ============================================================

/**
 * Get all users from Supabase, fallback to mock data
 */
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      console.log('[dataService] No users in Supabase, using mock data');
      return mockUsers;
    }

    return data.map(mapUser);
  } catch (err) {
    console.error('[dataService] Error fetching users:', err);
    return mockUsers;
  }
}

/**
 * Get users filtered by role
 */
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      console.log(`[dataService] No ${role}s in Supabase, using mock data`);
      return mockUsers.filter(u => u.role === role);
    }

    return data.map(mapUser);
  } catch (err) {
    console.error(`[dataService] Error fetching ${role}s:`, err);
    return mockUsers.filter(u => u.role === role);
  }
}

/**
 * Get all assessments from Supabase, fallback to mock data
 */
export async function getAssessments(): Promise<AssessmentResult[]> {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      console.log('[dataService] No assessments in Supabase, using mock data');
      return mockAssessments;
    }

    return data.map(mapAssessment);
  } catch (err) {
    console.error('[dataService] Error fetching assessments:', err);
    return mockAssessments;
  }
}

/**
 * Get assessments for a specific user
 */
export async function getAssessmentsByUser(userId: string): Promise<AssessmentResult[]> {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      return mockAssessments.filter(a => a.userId === userId);
    }

    return data.map(mapAssessment);
  } catch (err) {
    console.error('[dataService] Error fetching user assessments:', err);
    return mockAssessments.filter(a => a.userId === userId);
  }
}

/**
 * Get all appointments from Supabase, fallback to mock data
 */
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      console.log('[dataService] No appointments in Supabase, using mock data');
      return mockAppointments;
    }

    // We need users to map patient/doctor names
    const users = await getUsers();
    return data.map(apt => mapAppointment(apt, users));
  } catch (err) {
    console.error('[dataService] Error fetching appointments:', err);
    return mockAppointments;
  }
}

/**
 * Get appointments for a specific user (as patient or doctor)
 */
export async function getAppointmentsByUser(userId: string, role: UserRole): Promise<Appointment[]> {
  try {
    const column = role === 'doctor' ? 'doctor_id' : 'patient_id';
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq(column, userId)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      return mockAppointments.filter(a =>
        role === 'doctor' ? a.doctorId === userId : a.patientId === userId
      );
    }

    const users = await getUsers();
    return data.map(apt => mapAppointment(apt, users));
  } catch (err) {
    console.error('[dataService] Error fetching user appointments:', err);
    return mockAppointments.filter(a =>
      role === 'doctor' ? a.doctorId === userId : a.patientId === userId
    );
  }
}

/**
 * Get all posts from Supabase, fallback to mock data
 */
export async function getPosts(): Promise<ForumPost[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      console.log('[dataService] No posts in Supabase, using mock data');
      return mockForumPosts;
    }

    const users = await getUsers();
    return data.map(post => mapPost(post, users));
  } catch (err) {
    console.error('[dataService] Error fetching posts:', err);
    return mockForumPosts;
  }
}

/**
 * Get doctor availability for a specific date
 */
export async function getDoctorAvailability(doctorId: string, date: string): Promise<TimeSlot[]> {
  try {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_date')
      .eq('doctor_id', doctorId)
      .gte('appointment_date', startOfDay)
      .lte('appointment_date', endOfDay)
      .neq('status', 'cancelled');

    if (error) throw error;

    const bookedTimes = (data || []).map(apt => {
      const d = new Date(apt.appointment_date);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    });

    const allSlots = [
      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
    ];

    return allSlots.map(time => ({
      time,
      available: !bookedTimes.includes(time),
    }));
  } catch (err) {
    console.error('[dataService] Error fetching availability:', err);
    return getMockAvailability(doctorId, date);
  }
}

/**
 * Get patient summaries for Doctor Dashboard
 */
export async function getPatientSummaries(): Promise<PatientSummary[]> {
  try {
    const [users, assessments, appointments] = await Promise.all([
      getUsers(),
      getAssessments(),
      getAppointments(),
    ]);

    const patients = users.filter(u => u.role === 'patient');

    if (patients.length === 0) {
      console.log('[dataService] No patients found, using mock summaries');
      return getMockPatientSummaries();
    }

    return patients.map(patient => {
      const patientAssessments = assessments.filter(a => a.userId === patient.id);
      const latestAssessment = patientAssessments[0] || null;
      const patientAppointments = appointments.filter(a => a.patientId === patient.id);

      return {
        patient,
        latestAssessment,
        aiSummary: generateAISummary(patient, latestAssessment),
        suggestedActions: generateSuggestedActions(latestAssessment),
        appointments: patientAppointments,
      };
    });
  } catch (err) {
    console.error('[dataService] Error fetching patient summaries:', err);
    return getMockPatientSummaries();
  }
}

/**
 * Helper: Get mock patient summaries
 */
function getMockPatientSummaries(): PatientSummary[] {
  return mockUsers
    .filter(u => u.role === 'patient')
    .map(patient => {
      const assessment = mockAssessments.find(a => a.userId === patient.id) || null;
      return {
        patient,
        latestAssessment: assessment,
        aiSummary: generateAISummary(patient, assessment),
        suggestedActions: generateSuggestedActions(assessment),
        appointments: mockAppointments.filter(a => a.patientId === patient.id),
      };
    });
}

// ============================================================
// Write Operations (Create/Update)
// ============================================================

/**
 * Create a new appointment
 */
export async function createAppointment(data: {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  status?: string;
}): Promise<Appointment | null> {
  try {
    const { data: result, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: data.patientId,
        doctor_id: data.doctorId,
        appointment_date: data.appointmentDate,
        status: data.status || 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[dataService] Supabase error creating appointment:', error.message, error.code);
      // Fallback: create a mock appointment for the UI
      const users = await getUsers();
      const patient = users.find(u => u.id === data.patientId);
      const doctor = users.find(u => u.id === data.doctorId);
      const dateObj = new Date(data.appointmentDate);
      return {
        id: `apt_${Date.now()}`,
        patientId: data.patientId,
        patientName: patient?.name || 'Patient',
        doctorId: data.doctorId,
        doctorName: doctor?.name || 'Doctor',
        date: dateObj.toISOString().split('T')[0],
        time: dateObj.toTimeString().slice(0, 5),
        status: (data.status || 'pending') as 'pending' | 'confirmed' | 'completed' | 'cancelled',
        reason: 'Consultation',
      };
    }

    const users = await getUsers();
    return result ? mapAppointment(result, users) : null;
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error('[dataService] Error creating appointment:', error.message || err);
    // Fallback: create a mock appointment for the UI
    const users = await getUsers();
    const patient = users.find(u => u.id === data.patientId);
    const doctor = users.find(u => u.id === data.doctorId);
    const dateObj = new Date(data.appointmentDate);
    return {
      id: `apt_${Date.now()}`,
      patientId: data.patientId,
      patientName: patient?.name || 'Patient',
      doctorId: data.doctorId,
      doctorName: doctor?.name || 'Doctor',
      date: dateObj.toISOString().split('T')[0],
      time: dateObj.toTimeString().slice(0, 5),
      status: (data.status || 'pending') as 'pending' | 'confirmed' | 'completed' | 'cancelled',
      reason: 'Consultation',
    };
  }
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[dataService] Error updating appointment:', err);
    return false;
  }
}

/**
 * Create a new assessment
 */
export async function createAssessment(data: {
  userId: string;
  riskScore: number;
  riskLevel: string;
  riskBreakdown?: {
    riskFactorScore: number;
    symptomScore: number;
    explanations: string[];
    recommendations: string[];
  };
}): Promise<AssessmentResult | null> {
  try {
    const { data: result, error } = await supabase
      .from('assessments')
      .insert({
        user_id: data.userId,
        risk_score: data.riskScore,
        risk_level: data.riskLevel,
        risk_breakdown: data.riskBreakdown || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[dataService] Supabase error creating assessment:', error.message, error.code);
      // Fallback: return mock assessment for the UI
      return {
        id: `asr_${Date.now()}`,
        userId: data.userId,
        totalScore: data.riskScore,
        riskLevel: data.riskLevel as 'low' | 'moderate' | 'high',
        riskFactorScore: data.riskBreakdown?.riskFactorScore || 0,
        symptomScore: data.riskBreakdown?.symptomScore || 0,
        explanations: data.riskBreakdown?.explanations || [],
        recommendations: data.riskBreakdown?.recommendations || [],
        timestamp: new Date().toISOString(),
      };
    }
    return result ? mapAssessment(result) : null;
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error('[dataService] Error creating assessment:', error.message || err);
    // Fallback: return mock assessment for the UI
    return {
      id: `asr_${Date.now()}`,
      userId: data.userId,
      totalScore: data.riskScore,
      riskLevel: data.riskLevel as 'low' | 'moderate' | 'high',
      riskFactorScore: data.riskBreakdown?.riskFactorScore || 0,
      symptomScore: data.riskBreakdown?.symptomScore || 0,
      explanations: data.riskBreakdown?.explanations || [],
      recommendations: data.riskBreakdown?.recommendations || [],
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Create a new post
 */
export async function createPost(data: {
  userId: string;
  title: string;
  content: string;
}): Promise<ForumPost | null> {
  try {
    const { data: result, error } = await supabase
      .from('posts')
      .insert({
        user_id: data.userId,
        title: data.title,
        content: data.content,
      })
      .select()
      .single();

    if (error) {
      console.error('[dataService] Supabase error creating post:', error.message, error.code, error.details);
      // Fallback: create a mock post for the UI
      const users = await getUsers();
      const author = users.find(u => u.id === data.userId);
      return {
        id: `post_${Date.now()}`,
        authorName: author?.name || 'Anonymous',
        authorRole: author?.role || 'patient',
        isAnonymous: false,
        topic: 'General',
        title: data.title,
        content: data.content,
        createdAt: new Date().toISOString(),
        replies: [],
        tags: [],
      };
    }

    const users = await getUsers();
    return result ? mapPost(result, users) : null;
  } catch (err: unknown) {
    const error = err as { message?: string; code?: string };
    console.error('[dataService] Error creating post:', error.message || err);
    // Fallback: create a mock post for the UI
    const users = await getUsers();
    const author = users.find(u => u.id === data.userId);
    return {
      id: `post_${Date.now()}`,
      authorName: author?.name || 'Anonymous',
      authorRole: author?.role || 'patient',
      isAnonymous: false,
      topic: 'General',
      title: data.title,
      content: data.content,
      createdAt: new Date().toISOString(),
      replies: [],
      tags: [],
    };
  }
}
