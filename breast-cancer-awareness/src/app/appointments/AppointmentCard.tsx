"use client";

import { motion } from "framer-motion";
import { Trash2, XCircle } from "lucide-react";

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  notes?: string;
  status: string;
}

const statusStyles: Record<string, string> = {
  SCHEDULED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONFIRMED: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED: "bg-gray-100 text-gray-400 border-gray-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  PENDING: "Pending",
};

export default function AppointmentCard({
  appointment,
  index,
  onCancel,
  onDelete,
}: {
  appointment: Appointment;
  index: number;
  onCancel?: () => void;
  onDelete?: () => void;
}) {
  const isCancelled = appointment.status === "CANCELLED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 50px -12px rgba(251, 207, 232, 0.6)",
      }}
      className={`group relative rounded-2xl bg-white/80 backdrop-blur-md border border-pink-100/60 shadow-md hover:shadow-pink-200/60 transition-all duration-300 p-6 hover:bg-white/90 ${
        isCancelled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.15 + 0.2, duration: 0.5 }}
          className="flex-1"
        >
          <p className="text-gray-700 mb-2 transition-colors group-hover:text-gray-800">
            <span className="font-medium">Date:</span> {appointment.date}
          </p>
          <p className="text-gray-700 mb-2 transition-colors group-hover:text-gray-800">
            <span className="font-medium">Time:</span> {appointment.time}
          </p>
          <p className="text-gray-700 transition-colors group-hover:text-gray-800">
            <span className="font-medium">Doctor:</span> {appointment.doctor}
          </p>
          {appointment.notes && (
            <p className="text-gray-500 text-sm mt-2 italic">
              {appointment.notes}
            </p>
          )}
        </motion.div>

        {/* Status + Actions */}
        <div className="flex flex-col items-end gap-2 ml-4">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full border ${
              statusStyles[appointment.status] || statusStyles.SCHEDULED
            }`}
          >
            {statusLabels[appointment.status] || appointment.status}
          </span>

          <div className="flex gap-1.5 mt-1">
            {onCancel && (
              <button
                onClick={onCancel}
                title="Cancel appointment"
                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
              >
                <XCircle size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                title="Delete appointment"
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtle hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-100/20 to-rose-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />
    </motion.div>
  );
}