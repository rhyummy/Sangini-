"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LiquidButton, GlassButton } from "@/components/ui/liquid-glass-button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface MeetingSchedulerProps {
  doctors: Array<{ id: string; name: string }>;
  onBook: (data: {
    doctorId: string;
    date: string;
    time: string;
    reason: string;
  }) => void;
  getAvailability: (doctorId: string, date: string) => TimeSlot[];
  className?: string;
}

export function MeetingScheduler({
  doctors,
  onBook,
  getAvailability,
  className,
}: MeetingSchedulerProps) {
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const slots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    const dateStr = selectedDate.toISOString().split("T")[0];
    return getAvailability(selectedDoctor, dateStr);
  }, [selectedDoctor, selectedDate, getAvailability]);

  const calendar = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDateSelect = (date: Date) => {
    if (date < today) return;
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleSubmit = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason) return;
    onBook({
      doctorId: selectedDoctor,
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      reason,
    });
    setSelectedDate(null);
    setSelectedTime("");
    setReason("");
  };

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  return (
    <div
      className={cn(
        "bg-white/40 backdrop-blur-lg border border-pink-200/50 rounded-3xl p-6 shadow-xl",
        className
      )}
    >
      <div className="space-y-4">
        {/* Doctor Select */}
        <div>
          <label className="block text-sm font-medium text-pink-900 mb-2">
            Select Doctor
          </label>
          <select
            value={selectedDoctor}
            onChange={(e) => {
              setSelectedDoctor(e.target.value);
              setSelectedTime("");
            }}
            className="w-full bg-white/60 backdrop-blur-sm border border-pink-200/60 rounded-2xl px-4 py-2.5 text-sm text-pink-900 focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 outline-none transition-all"
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-pink-900">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <div className="flex gap-1">
              <GlassButton size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </GlassButton>
              <GlassButton size="icon" onClick={handleNextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </GlassButton>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-center text-pink-400 font-medium py-1"
              >
                {day}
              </div>
            ))}
            {calendar.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} />;
              }
              const isPast = date < today;
              const isSelected = isSameDay(date, selectedDate);
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !isPast && handleDateSelect(date)}
                  disabled={isPast}
                  className={cn(
                    "aspect-square rounded-xl text-sm font-medium transition-all",
                    isPast &&
                      "text-pink-200 cursor-not-allowed",
                    !isPast &&
                      !isSelected &&
                      "text-pink-700 hover:bg-pink-100/50 hover:scale-105",
                    isSelected &&
                      "bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-md scale-105"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        {slots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-pink-900 mb-2">
              Available Times
            </label>
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    !slot.available &&
                      "bg-gray-100/60 text-gray-400 cursor-not-allowed line-through",
                    slot.available &&
                      selectedTime === slot.time &&
                      "bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-md scale-105",
                    slot.available &&
                      selectedTime !== slot.time &&
                      "bg-pink-100/60 text-pink-700 border border-pink-200/60 hover:bg-pink-200/60 hover:scale-105"
                  )}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-pink-900 mb-2">
            Reason for Visit
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Follow-up consultation"
            className="w-full bg-white/60 backdrop-blur-sm border border-pink-200/60 rounded-2xl px-4 py-2.5 text-sm text-pink-900 placeholder:text-pink-400 focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 outline-none transition-all"
          />
        </div>

        {/* Submit */}
        <LiquidButton
          onClick={handleSubmit}
          disabled={!selectedDoctor || !selectedDate || !selectedTime || !reason}
          className="w-full"
        >
          Confirm Appointment
        </LiquidButton>
      </div>
    </div>
  );
}
