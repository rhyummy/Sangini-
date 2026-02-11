import { NextRequest, NextResponse } from 'next/server';
import { mockAppointments, getDoctorAvailability, mockUsers } from '@/lib/mock-data';

// GET /api/appointments?userId=xxx
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  let appointments = mockAppointments;
  if (userId) {
    appointments = appointments.filter(
      a => a.patientId === userId || a.doctorId === userId
    );
  }

  return NextResponse.json({ success: true, appointments });
}

// POST /api/appointments — book a new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId, date, time, reason, patientId, patientName } = body;

    if (!doctorId || !date || !time || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check availability
    const slots = getDoctorAvailability(doctorId, date);
    const slot = slots.find(s => s.time === time);
    if (!slot?.available) {
      return NextResponse.json({ error: 'Time slot not available' }, { status: 409 });
    }

    const doctor = mockUsers.find(u => u.id === doctorId);
    const appointment = {
      id: 'apt_' + Date.now(),
      patientId: patientId || 'guest',
      patientName: patientName || 'Guest',
      doctorId,
      doctorName: doctor?.name || 'Unknown',
      date,
      time,
      status: 'pending' as const,
      reason,
    };

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 });
  }
}
