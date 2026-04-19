import { useState, useEffect } from "react";
import "../Styles/CookingPromo.css";

const CookingPromo = ({ 
  selectedDate = new Date(), 
  selectedSession = "Lunch", 
  cutoffDateTime = null,
  user = null,
  onSessionChange = null 
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [orderingDate, setOrderingDate] = useState("");
  const [orderingDay, setOrderingDay] = useState("");

  // Determine if user is employee
  const isEmployee = user?.status === "Employee";

  // Format day name from date
  const formatDayName = (date) => {
    const options = { weekday: 'short' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Format date (e.g., "11 Apr")
  const formatDateString = (date) => {
    const options = { day: 'numeric', month: 'short' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Determine ordering context
  useEffect(() => {
    if (!selectedDate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    const isToday = selected.getTime() === today.getTime();
    const isTomorrow = selected.getTime() === new Date(today.getTime() + 24 * 60 * 60 * 1000).getTime();

    let dayText = "";
    let dateText = formatDateString(selectedDate);

    // For employees: ordering for "today"
    // For normal users: ordering for "tomorrow" (or the date they selected)
    if (isEmployee && isToday) {
      dayText = "today";
    } else if (!isEmployee && isTomorrow) {
      dayText = "tomorrow";
    } else if (!isEmployee) {
      // Normal user selecting a date other than tomorrow - show as future date
      dayText = formatDayName(selectedDate);
    } else {
      // Employee selecting a date other than today
      dayText = formatDayName(selectedDate);
    }

    const formattedDay = formatDayName(selectedDate);
    setOrderingDay(dayText);
    setOrderingDate(`${formattedDay} ${dateText}`);
  }, [selectedDate, isEmployee]);

  // Calculate and update time left
  useEffect(() => {
    console.log("[v0] CookingPromo cutoffDateTime:", cutoffDateTime);
    
    if (!cutoffDateTime) {
      console.log("[v0] No cutoffDateTime, clearing timeLeft");
      setTimeLeft("");
      return;
    }

    const updateTimeLeft = () => {
      const cutoff = new Date(cutoffDateTime);
      const now = new Date();
      const diff = cutoff - now;
      
      console.log("[v0] Timer calc - cutoff:", cutoff, "now:", now, "diff:", diff);

      if (diff <= 0) {
        setTimeLeft("Closed");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const timeStr = hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
      console.log("[v0] Setting timeLeft:", timeStr);
      setTimeLeft(timeStr);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [cutoffDateTime]);

  if (!orderingDate) {
    return null;
  }

  return (
    <div className="cooking-promo">
      <div className="promo-container">
        <div className="promo-header">
          <div className="promo-title-section">
            <div className="promo-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="11" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span className="promo-title">
              You&apos;re ordering for {orderingDay} • {orderingDate}
            </span>
          </div>
          {timeLeft && (
            <div className="promo-time-left">
              <span className="time-left-label">⏱</span>
              <span className="time-left-value">{timeLeft}</span>
            </div>
          )}
        </div>
        {selectedSession && (
          <div className="promo-footer">
            <div className="order-info">
              {selectedSession}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookingPromo;
