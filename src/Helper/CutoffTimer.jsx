"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Clock } from "lucide-react";

export default function CutoffStatusCard({
  cutoffValidation,
  userStatus,
  currentSelectedDate,
  cutoffLoading,
}) {
  const [timeLeft, setTimeLeft] = useState("");
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
      if (isSameDay(date, today)) return `Today, ${dateLabel}`;
      if (isSameDay(date, tomorrow)) return `Tomorrow, ${dateLabel}`;
      return dateLabel;
    };

    // Use locally-derived allowed so stale API flags don't cause wrong display
    const allowed = isActuallyAllowed;
    const effectiveDeliveryDateObj =
      !allowed && isToday ? tomorrow : deliveryDateObj;

    let displayDate;
    let orderingText;

    if (isEmployee) {
      displayDate = effectiveDeliveryDateObj || today;
      orderingText = `You're ordering for ${getRelativeLabel(displayDate)}`;
    } else if (orderMode === "instant") {
      displayDate = effectiveDeliveryDateObj || today;
      orderingText = `You're ordering for ${getRelativeLabel(displayDate)}`;
    } else {
      displayDate = effectiveDeliveryDateObj || tomorrow;
      orderingText = `You're ordering for ${getRelativeLabel(displayDate)}`;
    }

    return { orderingText, cutoffDate, allowed };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cutoffTimestamp,
    isActuallyAllowed,
    isEmployee,
    orderMode,
    currentSelectedDate,
  ]);

  // Countdown interval — restarts when cutoff time changes
  useEffect(() => {
    if (!displayInfo?.cutoffDate) return;
    const updateTimer = () => {
      const now = new Date();
      const msLeft = displayInfo.cutoffDate - now;
      setTimeLeft(formatTimeLeft(msLeft));
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
    return (
      <div className="cutoff-status-main-card">
        <div className="cutoff-status-card cutoff-skeleton">
          <div className="cutoff-inner">
            <div className="cutoff-info-group">
              <div className="skeleton-circle" />
              <div className="skeleton-bar skeleton-bar-long" />
            </div>
            <div className="skeleton-pill" />
          </div>
          <style jsx>{`
            .cutoff-status-main-card {
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: "Inter", sans-serif;
            }
            .cutoff-status-card {
              max-width: 655px;
              width: 100%;
              background: #e6b800;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
              overflow: hidden;
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
              gap: 12px;
              flex: 1;
            }
            @keyframes shimmer {
              0% {
                background-position: -400px 0;
              }
              100% {
                background-position: 400px 0;
              }
            }
            .skeleton-circle {
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: linear-gradient(
                90deg,
                rgba(139, 69, 19, 0.15) 25%,
                rgba(139, 69, 19, 0.3) 50%,
                rgba(139, 69, 19, 0.15) 75%
              );
              background-size: 400px 100%;
              animation: shimmer 1.4s infinite linear;
              flex-shrink: 0;
            }
            .skeleton-bar {
              height: 14px;
              border-radius: 6px;
              background: linear-gradient(
                90deg,
                rgba(139, 69, 19, 0.15) 25%,
                rgba(139, 69, 19, 0.3) 50%,
                rgba(139, 69, 19, 0.15) 75%
              );
              background-size: 400px 100%;
              animation: shimmer 1.4s infinite linear;
            }
            .skeleton-bar-long {
              width: 180px;
            }
            .skeleton-pill {
              width: 90px;
              height: 32px;
              border-radius: 40px;
              background: linear-gradient(
                90deg,
                rgba(253, 242, 208, 0.6) 25%,
                rgba(253, 242, 208, 1) 50%,
                rgba(253, 242, 208, 0.6) 75%
              );
              background-size: 400px 100%;
              animation: shimmer 1.4s infinite linear;
              flex-shrink: 0;
            }
            @media (max-width: 480px) {
              .cutoff-inner {
                padding: 12px 30px;
              }
              .skeleton-bar-long {
                width: 130px;
              }
              .skeleton-pill {
                width: 72px;
                height: 28px;
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!displayInfo) return null;

  const { orderingText, allowed } = displayInfo;
  const isCutoffPassed = !allowed || timeLeft === "Cutoff passed";
  const displayMessage = isCutoffPassed ? (
    <>❌ Orders closed</>
  ) : (
    <>{orderingText}</>
  );

  return (
    <div className="cutoff-status-main-card">
      <div className="cutoff-status-card">
        <div className="cutoff-inner">
          <div className="cutoff-info-group">
            <div className="clock-icon">
              <Clock size={20} />
            </div>
            <div className="cutoff-text-group">
              <span className="cutoff-message">{displayMessage}</span>
            </div>
          </div>
          <div className="time-left-pill">
            {isCutoffPassed ? "Cutoff passed" : timeLeft || "..."}
          </div>
        </div>

        <style jsx>{`
          .cutoff-status-main-card {
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "Inter", sans-serif;
          }
          .cutoff-status-card {
            max-width: 655px;
            width: 100%;
            background: #e6b800;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            overflow: hidden;
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
            gap: 12px;
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
          .cutoff-message {
            font-size: 14px;
            font-weight: 500;
            color: #8b4513;
            line-height: 1.4;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            letter-spacing: -0.2px;
          }
          .cutoff-text-group {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
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
          @media (max-width: 480px) {
            .cutoff-inner {
              padding: 12px 30px;
              gap: 10px;
            }
            .cutoff-info-group {
              min-width: calc(100% - 80px);
            }
            .cutoff-message {
              white-space: normal;
              font-size: 13px;
            }
            .time-left-pill {
              font-size: 12px;
              padding: 4px 12px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
