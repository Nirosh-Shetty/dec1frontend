"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Clock } from "lucide-react";
import PreorderInfoModal from "../Components/PreorderInfoModal";

export default function CutoffStatusCard({
  cutoffValidation,
  userStatus,
  currentSelectedDate,
  cutoffLoading,
}) {
  const [timeLeft, setTimeLeft] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const intervalRef = useRef(null);

  const isEmployee = userStatus === "Employee";
  const orderMode = cutoffValidation?.orderMode || "preorder";

  const formatTimeLeft = useCallback((milliseconds) => {
    if (milliseconds <= 0) return "Cutoff passed";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m ${seconds}s left`;
    return `${seconds}s left`;
  }, []);

  // Stable cutoff timestamp — only changes when the actual cutoff time value changes
  const cutoffTimestamp = cutoffValidation?.cutoffDateTime
    ? new Date(cutoffValidation.cutoffDateTime).getTime()
    : null;

  // Derive allowed from the cutoffDateTime directly so stale API `allowed` flags
  // don't bleed across session switches (e.g. Breakfast closed ≠ Dinner closed).
  const isActuallyAllowed = useMemo(() => {
    if (!cutoffValidation?.cutoffDateTime)
      return cutoffValidation?.allowed ?? true;
    const now = new Date();
    const cutoff = new Date(cutoffValidation.cutoffDateTime);

    const calculated = now < cutoff;

    console.log("[CutoffTimer] Checking cutoff:", {
      now: now.toISOString(),
      cutoff: cutoff.toISOString(),
      nowTime: now.getTime(),
      cutoffTime: cutoff.getTime(),
      diff: cutoff.getTime() - now.getTime(),
      diffMinutes: (cutoff.getTime() - now.getTime()) / (1000 * 60),
      calculated,
      apiAllowed: cutoffValidation?.allowed,
    });

    // If API says allowed but our calculation says not allowed, trust the API
    // (this handles cases where the backend has special logic we don't know about)
    if (cutoffValidation.allowed === true && !calculated) {
      console.warn(
        "[CutoffTimer] API says allowed but cutoff passed — trusting API",
      );
      return true;
    }

    // If cutoff is in the future → allowed; if in the past → not allowed
    return calculated;
  }, [cutoffTimestamp, cutoffValidation?.allowed]);

  // Memoize display info so it only recalculates when cutoff time or selected date actually changes
  const displayInfo = useMemo(() => {
    if (!cutoffValidation?.cutoffDateTime) return null;

    const cutoffDate = new Date(cutoffValidation.cutoffDateTime);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const getDeliveryDateLabel = () => {
      if (!currentSelectedDate) {
        if (isEmployee || orderMode === "instant") return { isToday: true };
        return { isToday: false };
      }
      const todayLocal = new Date();
      const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;
      const selStr =
        typeof currentSelectedDate === "string"
          ? currentSelectedDate.slice(0, 10)
          : `${new Date(currentSelectedDate).getFullYear()}-${String(new Date(currentSelectedDate).getMonth() + 1).padStart(2, "0")}-${String(new Date(currentSelectedDate).getDate()).padStart(2, "0")}`;
      const [y, m, d] = selStr.split("-").map(Number);
      const selDate = new Date(y, m - 1, d);
      return { isToday: todayStr === selStr, date: selDate };
    };

    const { isToday, date: deliveryDateObj } = getDeliveryDateLabel();
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isSameDay = (a, b) =>
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();

    const getRelativeLabel = (date) => {
      const dateLabel = `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
      if (isSameDay(date, today)) return { prefix: "Today", date: dateLabel };
      if (isSameDay(date, tomorrow))
        return { prefix: "Tomorrow", date: dateLabel };
      return { prefix: null, date: dateLabel };
    };

    // Use locally-derived allowed so stale API flags don't cause wrong display
    const allowed = isActuallyAllowed;
    const effectiveDeliveryDateObj =
      !allowed && isToday ? tomorrow : deliveryDateObj;

    let displayDate;

    if (isEmployee) {
      displayDate = effectiveDeliveryDateObj || today;
    } else if (orderMode === "instant") {
      displayDate = effectiveDeliveryDateObj || today;
    } else {
      displayDate = effectiveDeliveryDateObj || tomorrow;
    }

    const relativeLabel = getRelativeLabel(displayDate);

    return { relativeLabel, cutoffDate, allowed };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cutoffTimestamp,
    isActuallyAllowed,
    isEmployee,
    orderMode,
    currentSelectedDate,
  ]);

  // Countdown interval — restarts when cutoff time changes
  // Only ticks when within 3 hours of cutoff
  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
  useEffect(() => {
    if (!displayInfo?.cutoffDate) return;
    const updateTimer = () => {
      const now = new Date();
      const msLeft = displayInfo.cutoffDate - now;
      // Only show time when within 3 hours of cutoff (or already past)
      if (msLeft <= THREE_HOURS_MS) {
        setTimeLeft(formatTimeLeft(msLeft));
      } else {
        setTimeLeft(""); // hide pill when more than 3 hours away
      }
    };
    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [displayInfo?.cutoffDate, formatTimeLeft]);

  // Show skeleton while loading or before first data arrives
  const showSkeleton =
    cutoffLoading ||
    (!displayInfo &&
      (cutoffValidation === null || cutoffValidation === undefined));

  if (showSkeleton) {
    return null; // Home.jsx gates rendering until data is ready — no skeleton needed
  }

  if (!displayInfo) return null;

  const { relativeLabel, allowed } = displayInfo;

  // Never show "Orders closed" here — Home.jsx handles that separately.
  // If cutoff has passed, render nothing and let Home show its own closed card.
  if (!allowed) return null;

  // If the countdown has already hit zero/negative (cutoff passed locally),
  // don't render — avoids a stale-data flash on refresh where the API still
  // says allowed=true but the cutoffDateTime is already in the past.
  if (timeLeft === "Cutoff passed") return null;

  // Only show the time pill when within 3 hours of cutoff (timeLeft is non-empty)
  const showTimePill = timeLeft !== "";

  return (
    <div className="cutoff-status-main-card">
      <div className="cutoff-status-card">
        <div className="cutoff-inner">
          <div className="cutoff-info-group">
            <div className="clock-icon">
              <Clock size={20} />
            </div>
            <div className="cutoff-text-group">
              <span className="cutoff-label">Ordering for</span>
              <span className="cutoff-date">
                {relativeLabel.prefix && `${relativeLabel.prefix}, `}
                {relativeLabel.date}
              </span>
            </div>
          </div>
          {/* Time pill — hidden in UI for now; logic preserved above */}
          {/* {showTimePill && <div className="time-left-pill">{timeLeft}</div>} */}
          <button
            className="cutoff-info-btn"
            onClick={() => setShowInfoModal(true)}
            aria-label="Why tomorrow?"
          >
            Why tomorrow? →
          </button>
        </div>

        <PreorderInfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
        />

        <style jsx>{`
  .cutoff-status-main-card {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Inter", sans-serif;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
  }
  .cutoff-status-card {
    max-width: 655px;
    width: 100%;
    background: #e6b800;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    box-sizing: border-box;
  }
  .cutoff-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    width: 100%;
    gap: 16px;
  }
  .cutoff-info-group {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }
  .clock-icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #8b4513;
  }
  .cutoff-text-group {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .cutoff-label {
    font-size: 13px;
    font-weight: 400;
    color: rgba(139, 69, 19, 0.8);
    line-height: 1.3;
    letter-spacing: -0.1px;
  }
  .cutoff-date {
    font-size: 18px;
    font-weight: 700;
    color: #8b4513;
    line-height: 1.25;
    letter-spacing: -0.4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .time-left-pill {
    border-radius: 40px;
    padding: 6px 16px;
    font-weight: 600;
    font-size: 14px;
    color: #4a2a0c;
    background-color: #fdf2d0;
    white-space: nowrap;
    flex-shrink: 0;
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.3),
      0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .cutoff-info-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    border: none;
    border-radius: 40px;
    padding: 10px 18px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    color: #5a3a00;
    white-space: nowrap;
    letter-spacing: -0.2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: opacity 0.15s ease, transform 0.1s ease;
  }
  .cutoff-info-btn:hover {
    opacity: 0.9;
  }
  .cutoff-info-btn:active {
    transform: scale(0.97);
  }

  /* ✅ Mobile & Tablets (below 1024px) - FULL WIDTH (MUST come first) */
  @media (max-width: 1023px) {
    .cutoff-status-card {
      max-width: 100% !important;
      width: 100%;
      margin: 0;
      border-radius: 0;
    }
    .cutoff-inner {
      padding: 10px 16px;
      gap: 10px;
    }
    .cutoff-info-group {
      min-width: 0;
      flex: 1;
    }
    .cutoff-date {
      font-size: 14px;
    }
    .cutoff-label {
      font-size: 11px;
    }
    .cutoff-info-btn {
      font-size: 12px;
      padding: 7px 12px;
    }
    .time-left-pill {
      font-size: 11px;
      padding: 4px 10px;
    }
  }

  /* ✅ Laptop-S (1280×800) → 406px centered */
  @media (min-width: 1024px) and (max-width: 1300px) {
    .cutoff-status-card {
      max-width: 406px;
    }
    .cutoff-inner {
      padding: 10px 14px;
      gap: 12px;
    }
    .cutoff-date {
      font-size: 15px;
    }
    .cutoff-label {
      font-size: 11px;
    }
    .cutoff-info-btn {
      font-size: 12px;
      padding: 8px 12px;
    }
    .time-left-pill {
      font-size: 11px;
      padding: 4px 10px;
    }
    .clock-icon svg {
      width: 18px;
      height: 18px;
    }
  }

  /* ✅ Laptop-M (1366×768) → 435px centered */
  @media (min-width: 1301px) and (max-width: 1450px) {
    .cutoff-status-card {
      max-width: 435px;
    }
    .cutoff-inner {
      padding: 11px 16px;
      gap: 14px;
    }
    .cutoff-date {
      font-size: 16px;
    }
    .cutoff-label {
      font-size: 12px;
    }
    .cutoff-info-btn {
      font-size: 13px;
      padding: 9px 14px;
    }
  }

  /* ✅ Desktop (1920px and above) → 655px centered */
  @media (min-width: 1451px) {
    .cutoff-status-card {
      max-width: 655px;
    }
  }

  /* ✅ Very small phones (below 480px) - extra compact */
  @media (max-width: 480px) {
    .cutoff-inner {
      padding: 8px 12px;
      gap: 8px;
    }
    .cutoff-date {
      font-size: 12px;
    }
    .cutoff-label {
      font-size: 10px;
    }
    .cutoff-info-btn {
      font-size: 11px;
      padding: 6px 10px;
    }
    .time-left-pill {
      font-size: 10px;
      padding: 3px 8px;
    }
    .clock-icon svg {
      width: 14px;
      height: 14px;
    }
  }
`}</style>
      </div>
    </div>
  );
}












