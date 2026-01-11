"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarWidget() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse bg-gray-100 rounded-lg h-8 w-32" />
        </div>
      </div>
    );
  }

  const today = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const isCurrentMonth = 
    currentDate.getMonth() === today.getMonth() && 
    currentDate.getFullYear() === today.getFullYear();

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={goToPrevMonth}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </button>
        <h3 className="font-semibold text-gray-900">{currentMonth}</h3>
        <button 
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
          <span key={idx} className="text-xs font-medium text-gray-400 py-2">{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
          <span key={`empty-${idx}`} className="text-sm py-2" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <span 
              key={day} 
              className={`text-sm py-2 rounded-lg cursor-pointer transition-colors ${
                isToday 
                  ? "bg-purple-600 text-white font-medium" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}
