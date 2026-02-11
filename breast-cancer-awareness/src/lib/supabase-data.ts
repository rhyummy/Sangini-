// ============================================================
// Supabase Data Service — Fetch with fallback to mock data
// ============================================================

import { supabase } from './supabase';
import { 
  User, 
  AssessmentResult, 
  Appointment, 
  ForumPost, 
  PatientSummary,
  UserRole 
} from '@/types';
import { 
  mockUsers, 
  mockAssessments, 
  mockAppointments, 
  mockForumPosts,
  generateAISummary,
  generateSuggestedActions 
} from './mock-data';

// ============================================================
// Type Mappers: Supabase snake_case → Frontend camelCase
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
  reason?: string;
  notes?: string;
  // Joined data
  patient?: SupabaseUser;
  doctor?: SupabaseUser;
}

interface SupabasePost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  topic?: string;
  is_anonymous?: boolean;
  tags?: string[];
  // Joined data
  user?: SupabaseUser;
}

// ============================================================
// Mapper Functions
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
    patientName: sb.patient?.full_name || patient?.name || 'Unknown Patient',
    doctorId: sb.doctor_id,
    doctorName: sb.doctor?.full_name || doctor?.name || 'Unknown Doctor',
    date: date.toISOString().split('T')[0],
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    status: sb.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
    reason: sb.reason || 'Consultation',
    notes: sb.notes,
  };
}

function mapPost(sb: SupabasePost, users: User[]): ForumPost {
  const author = users.find(u => u.id === sb.user_id);
  return {
    id: sb.id,
    authorName: sb.is_anonymous ? 'Anonymous' : (sb.user?.full_name || author?.name || 'Unknown'),
    authorRole: (author?.role || 'patient') as UserRole,
    isAnonymous: sb.is_anonymous ?? false,
    topic: sb.topic || 'General',
    title: sb.title,
    content: sb.content,
    replies: [], // Would need separate replies table
    createdAt: sb.created_at,
    tags: sb.tags || [],
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
 * Fetch all users from Supabase, fallback to mock data
 */
export async function fetchUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return mockUsers;

    return data.map(mapUser);
  } catch (err) {
    console.error('Error fetching users:', err);
    return mockUsers;
  }
}

/**
 * Fetch users by role
 */
export async function fetchUsersByRole(role: UserRole): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return mockUsers.filter(u => u.role === role);

    return data.map(mapUser);
  } catch (err) {
    console.error('Error fetching users by role:', err);
    return mockUsers.filter(u => u.role === role);
  }
}

/**
 * Fetch all assessments from Supabase, fallback to mock data
 */
export async function fetchAssessments(): Promise<AssessmentResult[]> {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return mockAssessments;

    return data.map(mapAssessment);
  } catch (err) {
    console.error('Error fetching assessments:', err);
    return mockAssessments;
  }
}

/**
 * Fetch assessments for a specific user
 */
export async function fetchUserAssessments(userId: string): Promise<AssessmentResult[]> {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return mockAssessments.filter(a => a.userId === userId);

    return data.map(mapAssessment);
  } catch (err) {
    console.error('Error fetching user assessments:', err);
    return mockAssessments.filter(a => a.userId === userId);
  }
}

/**
 * Submit a new assessment to Supabase
 */
export async function submitAssessment(assessment: {
  userId: string;
  riskScore: number;
  riskLevel: string;
  riskBreakdown: {
    riskFactorScore: number;
    symptomScore: number;
    explanations: string[];
    recommendations: string[];
  };
}): Promise<AssessmentResult | null> {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        user_id: assessment.userId,
        risk_score: assessment.riskScore,
        risk_level: assessment.riskLevel,
        risk_breakdown: assessment.riskBreakdown,
      })
      .select()
      .single();

    if (error) throw error;
    return data ? mapAssessment(data) : null;
  } catch (err) {
    console.error('Error submitting assessment:', err);
    return null;
  }
}

/**
 * Fetch all appointments from Supabase, fallback to mock data
 */
export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:users!appointments_patient_id_fkey(id, full_name, email, role),
        doctor:users!appointments_doctor_id_fkey(id, full_name, email, role)
      `)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return mockAppointments;

    const users = await fetchUsers();
    return data.map(apt => mapAppointment(apt, users));
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return mockAppointments;
  }
}

/**
 * Fetch appointments for a user (as patient or doctor)
 */
export async function fetchUserAppointments(userId: string, role: UserRole): Promise<Appointment[]> {
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

    const users = await fetchUsers();
    return data.map(apt => mapAppointment(apt, users));
  } catch (err) {
    console.error('Error fetching user appointments:', err);
    return mockAppointments.filter(a => 
      role === 'doctor' ? a.doctorId === userId : a.patientId === userId
    );
  }
}

/**
 * Book a new appointment
 */
export async function bookAppointment(appointment: {
  patientId: string;
  doctorId: string;
  appointmentDate: string; // ISO string
  reason?: string;
}): Promise<Appointment | null> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: appointment.patientId,
        doctor_id: appointment.doctorId,
        appointment_date: appointment.appointmentDate,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    
    const users = await fetchUsers();
    return data ? mapAppointment({ ...data, reason: appointment.reason }, users) : null;
  } catch (err) {
    console.error('Error booking appointment:', err);
    return null;
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
    console.error('Error updating appointment:', err);
    return false;
  }
}

/**
 * Fetch all posts from Supabase, fallback to mock data
 */
export async function fetchPosts(): Promise<ForumPost[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, full_name, email, role)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return mockForumPosts;

    const users = await fetchUsers();
    return data.map(post => mapPost(post, users));
  } catch (err) {
    console.error('Error fetching posts:', err);
    return mockForumPosts;
  }
}

/**
 * Create a new post
 */
export async function createPost(post: {
  userId: string;
  title: string;
  content: string;
  topic?: string;
  isAnonymous?: boolean;
  tags?: string[];
}): Promise<ForumPost | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: post.userId,
        title: post.title,
        content: post.content,
      })
      .select()
      .single();

    if (error) throw error;
    
    const users = await fetchUsers();
    return data ? mapPost({ ...data, topic: post.topic, is_anonymous: post.isAnonymous, tags: post.tags }, users) : null;
  } catch (err) {
    console.error('Error creating post:', err);
    return null;
  }
}

/**
 * Get patient summaries for doctor dashboard
 */
export async function fetchPatientSummaries(): Promise<PatientSummary[]> {
  try {
    const [users, assessments, appointments] = await Promise.all([
      fetchUsers(),
      fetchAssessments(),
      fetchAppointments(),
    ]);

    const patients = users.filter(u => u.role === 'patient');
    
    if (patients.length === 0) {
      // Fallback to mock data
      const { getPatientSummaries } = await import('./mock-data');
      return getPatientSummaries();
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
    console.error('Error fetching patient summaries:', err);
    const { getPatientSummaries } = await import('./mock-data');
    return getPatientSummaries();
  }
}

/**
 * Get doctor availability slots for a date
 */
export async function fetchDoctorAvailability(doctorId: string, date: string) {
  try {
    // Fetch existing appointments for this doctor on this date
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
    console.error('Error fetching availability:', err);
    // Fallback to mock
    const { getDoctorAvailability } = await import('./mock-data');
    return getDoctorAvailability(doctorId, date);
  }
}
