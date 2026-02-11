'use client';

import { useState } from 'react';
import { mockUsers, mockAppointments, getDoctorAvailability } from '@/lib/mock-data';
import { Appointment, TimeSlot } from '@/types';
import { useAuth } from '@/lib/auth-context';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [showBooking, setShowBooking] = useState(false);

  // Booking form state
  const [selectedDoctor, setSelectedDoctor] = useState('d1');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const doctors = mockUsers.filter(u => u.role === 'doctor');

  const myAppointments = user
    ? appointments.filter(a => a.patientId === user.id || a.doctorId === user.id)
    : appointments;

  function loadSlots(doctorId: string, date: string) {
    if (doctorId && date) {
      setSlots(getDoctorAvailability(doctorId, date));
      setSelectedTime('');
    }
  }

  function handleBook() {
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason) return;

    const doctor = doctors.find(d => d.id === selectedDoctor);
    const newApt: Appointment = {
      id: 'apt_' + Date.now(),
      patientId: user?.id || 'guest',
      patientName: user?.name || 'Guest User',
      doctorId: selectedDoctor,
      doctorName: doctor?.name || 'Unknown',
      date: selectedDate,
      time: selectedTime,
      status: 'pending',
      reason,
    };

    setAppointments(prev => [...prev, newApt]);
    setBookingSuccess(true);
    setTimeout(() => {
      setShowBooking(false);
      setBookingSuccess(false);
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
      setSlots([]);
    }, 2000);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📅 Appointments</h1>
          <p className="text-gray-500 mt-1">Book consultations and manage your appointments.</p>
        </div>
        <button
          onClick={() => setShowBooking(!showBooking)}
          className="bg-pink-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-pink-700 transition-colors"
        >
          {showBooking ? 'Cancel' : '+ Book Appointment'}
        </button>
      </div>

      {/* Booking Form */}
      {showBooking && (
        <div className="bg-white rounded-2xl border-2 border-pink-200 p-6 mb-8">
          {bookingSuccess ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-green-700">Appointment Booked!</h3>
              <p className="text-gray-500 mt-1">You will receive a confirmation shortly.</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Book New Appointment</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Doctor Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => {
                      setSelectedDoctor(e.target.value);
                      if (selectedDate) loadSlots(e.target.value, selectedDate);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      loadSlots(selectedDoctor, e.target.value);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                  />
                </div>

                {/* Reason */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Follow-up on risk assessment, Annual screening"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                  />
                </div>
              </div>

              {/* Time Slots */}
              {slots.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                  <div className="flex flex-wrap gap-2">
                    {slots.map(slot => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                            : selectedTime === slot.time
                            ? 'bg-pink-600 text-white'
                            : 'bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={!selectedDoctor || !selectedDate || !selectedTime || !reason}
                className="mt-6 w-full bg-pink-600 text-white py-3 rounded-xl font-medium hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Appointment
              </button>
            </>
          )}
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        <h2 className="font-bold text-gray-900">
          {user ? 'Your Appointments' : 'All Appointments'} ({myAppointments.length})
        </h2>
        {myAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            No appointments yet. Click &quot;Book Appointment&quot; to get started.
          </div>
        ) : (
          myAppointments.map(apt => (
            <div key={apt.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{apt.date}</h3>
                  <span className="text-sm text-gray-500">{apt.time}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {apt.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{apt.reason}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {user?.role === 'doctor' ? `Patient: ${apt.patientName}` : `Doctor: ${apt.doctorName}`}
                </p>
              </div>
              {apt.status === 'pending' && (
                <button
                  onClick={() => {
                    setAppointments(prev =>
                      prev.map(a => a.id === apt.id ? { ...a, status: 'cancelled' } : a)
                    );
                  }}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
