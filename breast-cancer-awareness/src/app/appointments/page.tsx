"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, User, Plus, X, Loader2, Trash2 } from "lucide-react";
import AppointmentCard from "./AppointmentCard";
import { Calendar } from "@/components/ui/calendar";
import { Text_03 } from "@/components/ui/wave-text";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

// Demo appointments shown when no user is logged in or no data from Supabase
const demoAppointments: Appointment[] = [
  { id: "demo-1", date: "12 Feb 2026", time: "10:30 AM", doctor: "Dr. Sharma", notes: "Routine breast screening", status: "SCHEDULED" },
  { id: "demo-2", date: "15 Feb 2026", time: "2:00 PM", doctor: "Dr. Mehta", notes: "Follow-up consultation", status: "CONFIRMED" },
  { id: "demo-3", date: "20 Feb 2026", time: "11:00 AM", doctor: "Dr. Patel", notes: "Ultrasound review", status: "SCHEDULED" },
  { id: "demo-4", date: "28 Feb 2026", time: "3:30 PM", doctor: "Dr. Sharma", notes: "Risk assessment discussion", status: "COMPLETED" },
  { id: "demo-5", date: "05 Mar 2026", time: "9:00 AM", doctor: "Dr. Mehta", notes: "Annual check-up", status: "CANCELLED" },
];

const doctors = [
  { id: "dr-sharma", name: "Dr. Sharma" },
  { id: "dr-mehta", name: "Dr. Mehta" },
  { id: "dr-patel", name: "Dr. Patel" },
];

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM",
];

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  notes?: string;
  status: string;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>(demoAppointments);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments from Supabase (falls back to demo data)
  const fetchAppointments = useCallback(async () => {
    if (!user?.id) {
      setAppointments(demoAppointments);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from("appointments")
        .select("*")
        .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
        .order("appointment_date", { ascending: true });

      if (fetchErr) throw fetchErr;

      setAppointments(
        (data || []).map((a: any) => ({
          id: a.id,
          date: a.appointment_date
            ? new Date(a.appointment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : a.date || "",
          time: a.time || new Date(a.appointment_date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          doctor: a.doctor_name || a.doctorName || "Doctor",
          notes: a.notes || a.reason,
          status: a.status?.toUpperCase() || "SCHEDULED",
        }))
      );
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointments(demoAppointments);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Book appointment via Supabase
  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor || !user?.id) return;

    try {
      setBooking(true);
      setError(null);

      const appointmentDate = new Date(selectedDate);
      // Parse time like "10:30 AM" into hours/minutes
      const [timePart, meridiem] = selectedTime.split(" ");
      const [hours, minutes] = timePart.split(":").map(Number);
      let h = hours;
      if (meridiem === "PM" && h !== 12) h += 12;
      if (meridiem === "AM" && h === 12) h = 0;
      appointmentDate.setHours(h, minutes, 0, 0);

      const { error: insertErr } = await supabase
        .from("appointments")
        .insert({
          patient_id: user.id,
          doctor_id: selectedDoctor,
          appointment_date: appointmentDate.toISOString(),
          status: "pending",
          reason: notes || "Consultation",
        });

      if (insertErr) throw insertErr;

      // Reset form and refresh list
      setSelectedDate(undefined);
      setSelectedTime(null);
      setSelectedDoctor(null);
      setNotes("");
      setShowBooking(false);
      await fetchAppointments();
    } catch (err: any) {
      setError(err.message || "Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  // Cancel appointment
  const handleCancel = async (id: string) => {
    try {
      const { error: updateErr } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (updateErr) throw updateErr;
      await fetchAppointments();
    } catch (err) {
      console.error("Error cancelling appointment:", err);
    }
  };

  // Delete appointment
  const handleDelete = async (id: string) => {
    try {
      const { error: deleteErr } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);
      if (deleteErr) throw deleteErr;
      await fetchAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  const isFormComplete = selectedDate && selectedTime && selectedDoctor;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      {/* Animated background blobs */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl mix-blend-multiply"
        animate={{ x: [0, 50, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl mix-blend-multiply"
        animate={{ x: [0, -50, 0], y: [0, -40, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-100/50 rounded-full blur-3xl mix-blend-multiply"
        animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-100/40 rounded-full blur-3xl mix-blend-multiply"
        animate={{ x: [-20, 20, -20], y: [20, -20, 20], scale: [1, 1.08, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Page Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Text_03
              text="Your Appointments"
              className="text-3xl font-semibold text-gray-800 text-left"
            />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBooking(!showBooking)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 text-white font-medium shadow-lg shadow-pink-200/50 hover:bg-pink-700 transition-colors"
          >
            {showBooking ? <X size={18} /> : <Plus size={18} />}
            {showBooking ? "Cancel" : "Book Appointment"}
          </motion.button>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between"
            >
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-4 hover:text-red-900">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Form */}
        <AnimatePresence>
          {showBooking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden mb-10"
            >
              <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-pink-100/60 shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Fix an Appointment
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Calendar - Date Picker */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <CalendarDays size={16} className="text-pink-500" />
                      Select Date
                    </label>
                    <div className="rounded-xl border border-pink-100 bg-white p-3 shadow-sm">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={{ before: new Date() }}
                        className="mx-auto"
                      />
                    </div>
                    {selectedDate && (
                      <p className="mt-2 text-sm text-pink-600 font-medium">
                        {selectedDate.toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </motion.div>

                  {/* Time Slots */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Clock size={16} className="text-pink-500" />
                      Select Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            selectedTime === time
                              ? "bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-200/50"
                              : "bg-white text-gray-700 border-pink-100 hover:border-pink-300 hover:bg-pink-50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Doctor + Notes + Confirm */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <User size={16} className="text-pink-500" />
                      Select Doctor
                    </label>
                    <div className="space-y-2">
                      {doctors.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDoctor(doc.name)}
                          className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            selectedDoctor === doc.name
                              ? "bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-200/50"
                              : "bg-white text-gray-700 border-pink-100 hover:border-pink-300 hover:bg-pink-50"
                          }`}
                        >
                          {doc.name}
                        </button>
                      ))}
                    </div>

                    {/* Notes */}
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes (optional)"
                      rows={2}
                      className="w-full mt-4 px-4 py-2.5 rounded-xl text-sm border border-pink-100 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                    />

                    {/* Confirm Button */}
                    <motion.button
                      whileHover={isFormComplete ? { scale: 1.02 } : {}}
                      whileTap={isFormComplete ? { scale: 0.98 } : {}}
                      onClick={handleBook}
                      disabled={!isFormComplete || booking}
                      className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        isFormComplete && !booking
                          ? "bg-pink-600 text-white shadow-lg shadow-pink-200/50 hover:bg-pink-700"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {booking && <Loader2 size={16} className="animate-spin" />}
                      {booking
                        ? "Booking..."
                        : isFormComplete
                        ? `Confirm — ${selectedDate?.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} at ${selectedTime}`
                        : "Select date, time & doctor"}
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-pink-400 mb-3" />
            <p className="text-gray-500 text-sm">Loading your appointments...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && appointments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <CalendarDays size={48} className="mx-auto text-pink-300 mb-4" />
            <p className="text-gray-500">No appointments yet. Book your first one!</p>
          </motion.div>
        )}

        {/* Booked Appointments List */}
        {!loading && appointments.length > 0 && (
          <div className="grid gap-6">
            <AnimatePresence>
              {appointments.map((appt, index) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  index={index}
                  onCancel={appt.status === "SCHEDULED" ? () => handleCancel(appt.id) : undefined}
                  onDelete={() => handleDelete(appt.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}