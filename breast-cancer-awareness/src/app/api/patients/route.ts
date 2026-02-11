import { NextRequest, NextResponse } from 'next/server';
import { getPatientSummaries, mockAppointments, getDoctorAvailability } from '@/lib/mock-data';

// GET /api/patients — returns patient summaries for doctor dashboard
export async function GET() {
  const summaries = getPatientSummaries();
  return NextResponse.json({ success: true, patients: summaries });
}
