'use client';

import { useState } from 'react';
import { mockUsers, mockAppointments, getDoctorAvailability } from '@/lib/mock-data';
import { Appointment } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { MeetingScheduler } from '@/components/ui/meeting-scheduler';
import { LiquidButton, GlassButton } from '@/components/ui/liquid-glass-button';
import { Calendar, CheckCircle2 } from 'lucide-react';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const doctors = mockUsers.filter(u => u.role === 'doctor');

  const myAppointments = user
    ? appointments.filter(a => a.patientId === user.id || a.doctorId === user.id)
    : appointments;

  function handleBook(data: { doctorId: string; date: string; time: string; reason: string }) {
    const doctor = doctors.find(d => d.id === data.doctorId);
    const newApt: Appointment = {
      id: 'apt_' + Date.now(),
      patientId: user?.id || 'guest',
      patientName: user?.name || 'Guest User',
      doctorId: data.doctorId,
      doctorName: doctor?.name || 'Unknown',
      date: data.date,
      time: data.time,
      status: 'pending',
      reason: data.reason,
    };

    setAppointments(prev => [...prev, newApt]);
    setBookingSuccess(true);
    setTimeout(() => {
      setShowBooking(false);
      setBookingSuccess(false);
    }, 2500);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-pink-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-pink-600" />
            Appointments
          </h1>
          <p className="text-pink-600 mt-1">Book consultations and manage your appointments</p>
        </div>
        <LiquidButton onClick={() => setShowBooking(!showBooking)}>
          {showBooking ? 'Close Scheduler' : '+ Book Appointment'}
        </LiquidButton>
      </div>

      {/* Booking Form */}
      {showBooking && (
        <div className="mb-6">
          {bookingSuccess ? (
            <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-green-200/50 p-8 text-center shadow-xl">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-green-700">Booked Successfully!</h3>
              <p className="text-green-600 mt-2">Your appointment has been confirmed</p>
            </div>
          ) : (
            <MeetingScheduler
              doctors={doctors}
              onBook={handleBook}
              getAvailability={getDoctorAvailability}
            />
          )}
        </div>
      )}
      
      {/* Appointments List */}
      <div className="space-y-4">
        <h2 className="font-semibold text-pink-900 text-lg">
          {user ? 'Your Appointments' : 'All Appointments'} ({myAppointments.length})
        </h2>
        {myAppointments.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl border border-pink-200/50 p-12 text-center text-pink-400 shadow-lg">
            No appointments yet. Click "Book Appointment" to get started.
          </div>
        ) : (
          <div className="grid gap-3">
            {myAppointments.map(apt => (
              <div
                key={apt.id}
                className="bg-white/50 backdrop-blur-md rounded-2xl border border-pink-200/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-pink-900">{apt.date}</h3>
                    <span className="text-sm text-pink-600 font-medium">{apt.time}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                      apt.status === 'confirmed' ? 'bg-green-100/80 text-green-700' :
                      apt.status === 'pending' ? 'bg-amber-100/80 text-amber-700' :
                      apt.status === 'completed' ? 'bg-blue-100/80 text-blue-700' :
                      'bg-gray-100/80 text-gray-600'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-sm text-pink-700">{apt.reason}</p>
                  <p className="text-xs text-pink-500 mt-1">
                    {user?.role === 'doctor' ? `Patient: ${apt.patientName}` : `Doctor: ${apt.doctorName}`}
                  </p>
                </div>
                {apt.status === 'pending' && (
                  <GlassButton
                    size="sm"
                    onClick={() => {
                      setAppointments(prev =>
                        prev.map(a => a.id === apt.id ? { ...a, status: 'cancelled' } : a)
                      );
                    }}
                    className="text-rose-600"
                  >
                    Cancel
                  </GlassButton>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
