"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Clock } from "lucide-react";
import icon from "./../assets/Icon-1.png";

export default function CutoffStatusCard({ cutoffValidation, userStatus }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [displayInfo, setDisplayInfo] = useState(null);
  const intervalRef = useRef(null);
  const prevValidationRef = useRef(null);

  const isEmployee = userStatus === "Employee";

  // Get order mode from cutoffValidation
  const orderMode = cutoffValidation?.orderMode || "preorder";

  const formatTimeLeft = useCallback((milliseconds) => {
    if (milliseconds <= 0) return "Cutoff passed";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s left`;
    } else {
      return `${seconds}s left`;
    }
  }, []);

  const calculateDisplayInfo = useCallback(() => {
    if (!cutoffValidation?.cutoffDateTime) return null;

    const cutoffDate = new Date(cutoffValidation.cutoffDateTime);
    const now = new Date();

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

    let displayDate;
    let displayDay;
    let orderingText;
    let orderModeText = "";
    let freshTitle = "";
    let freshDescription = "";

    if (isEmployee) {
      // Employee: Always show today's date
      displayDate = new Date();
      displayDay = days[displayDate.getDay()];
      orderingText = "You're ordering for today";
      freshTitle = "⚡ Fresh ingredients sourced today";
      freshDescription = "Same-day ordering available for employees.";
    } else {
      // Normal User: Depends on orderMode
      if (orderMode === "instant") {
        // Instant mode: Show today's date
        displayDate = new Date();
        displayDay = days[displayDate.getDay()];
        orderingText = "You're ordering for today";
        orderModeText = "⚡ Instant";
        freshTitle = "⚡ Fresh ingredients sourced today";
        freshDescription =
          "We prepare your meal with fresh ingredients for same-day delivery.";
      } else {
        // Preorder mode: Show tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        displayDate = tomorrow;
        displayDay = days[displayDate.getDay()];
        orderingText = "You're ordering for tomorrow";
        orderModeText = "📋 Preorder";
        freshTitle = "Sourced fresh at 5 AM tomorrow";
        freshDescription =
          "We buy ingredients only after you order — nothing sits in storage overnight.";
      }
    }

    const dateStr = `${displayDate.getDate()} ${months[displayDate.getMonth()]}`;

    // Determine if allowed
    const allowed = cutoffValidation?.allowed;

    return {
      orderingText,
      dateStr,
      displayDay,
      cutoffDate,
      orderMode,
      orderModeText,
      isEmployee,
      allowed,
      freshTitle,
      freshDescription,
    };
  }, [isEmployee, cutoffValidation, orderMode]);

  useEffect(() => {
    if (cutoffValidation !== prevValidationRef.current) {
      prevValidationRef.current = cutoffValidation;
      const newDisplayInfo = calculateDisplayInfo();
      setDisplayInfo(newDisplayInfo);

      // Debug log
      console.log("CutoffStatusCard updated:", {
        isEmployee,
        orderMode,
        allowed: cutoffValidation?.allowed,
        displayInfo: newDisplayInfo,
      });
    }
  }, [cutoffValidation, calculateDisplayInfo, isEmployee, orderMode]);

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
  }, [displayInfo, formatTimeLeft]);

  if (!displayInfo) {
    // Only show loading if cutoffValidation hasn't arrived yet
    if (cutoffValidation === null || cutoffValidation === undefined) {
      return (
        <div className="cutoff-status-main-card">
          <div className="cutoff-status-card">
            <div className="cutoff-inner">
              <div className="cutoff-info-group">
                <div className="clock-icon">
                  <Clock size={20} />
                </div>
                <span
                  className="cutoff-message text-center"
                  style={{ color: "#6b8e23" }}
                >
                  Loading availability...
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    // No menu or no cutoff data — render nothing
    return null;
  }

  const {
    orderingText,
    dateStr,
    displayDay,
    orderModeText,
    isEmployee: isEmp,
    allowed,
    freshTitle,
    freshDescription,
  } = displayInfo;

  // Determine display message based on allowed status
  const displayMessage = !allowed ? (
    <>❌ Orders closed</>
  ) : (
    <>
      {orderingText} • {displayDay} {dateStr}
      {/* {!isEmp && orderModeText && (
        <span className="order-mode-badge">{orderModeText}</span>
      )} */}
    </>
  );

  return (
    <div className="cutoff-status-main-card">
      <div className="cutoff-status-card">
        <div className="cutoff-inner">
          <div className="cutoff-info-group">
            <div className="clock-icon">
              <Clock size={20} />
            </div>
            <span className="cutoff-message">{displayMessage}</span>
          </div>

          <div className="time-left-pill">
            {!allowed ? "Cutoff passed" : timeLeft || "Loading..."}
          </div>
        </div>

        {/* Fresh ingredients section - Centered with fixed height */}
        {/* <div className="fresh-ingredients-section">
          <div className="fresh-ingredients-content">
            <div className="fresh-icon-wrapper">
              <img src={icon} alt="Fresh icon" className="fresh-icon" />
            </div>
            <div className="fresh-text">
              <span className="fresh-title">{freshTitle}</span>
              <span className="fresh-description">{freshDescription}</span>
            </div>
          </div>
        </div> */}

        <style jsx>{`
          .cutoff-status-main-card {
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "Inter", sans-serif;
          }

          .cutoff-status-card {
            max-width: 613px;
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

          .order-mode-badge {
            margin-left: 8px;
            font-size: 12px;
            opacity: 0.9;
            font-weight: 500;
          }

          .time-left-pill {
            background: rgba(139, 69, 19, 0.15);
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

          /* Fresh ingredients section - Fixed height 147.5px */
          .fresh-ingredients-section {
            background-color: #3d6701;
            padding: 16px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 147.5px;
          }

          .fresh-ingredients-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            max-width: 100%;
          }

          /* Icon wrapper matching Figma design */
          .fresh-icon-wrapper {
            width: 50px;
            height: 50px;
            background-color: #54811f;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .fresh-icon {
            width: 34px;
            height: 36px;
            object-fit: contain;
            display: block;
          }

          .fresh-text {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
          }

          .fresh-title {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            letter-spacing: -0.2px;
            line-height: 1.3;
          }

          .fresh-description {
            font-size: 14px;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.85);
            line-height: 1.4;
            letter-spacing: -0.1px;
          }

          /* Mobile responsive */
          @media (max-width: 480px) {
            .cutoff-inner {
              flex-wrap: wrap;
              padding: 12px 16px;
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

            .fresh-ingredients-section {
              padding: 14px 16px;
              height: auto;
              min-height: 147.5px;
            }

            .fresh-ingredients-content {
              gap: 12px;
            }

            .fresh-icon-wrapper {
              width: 44px;
              height: 44px;
            }

            .fresh-icon {
              width: 30px;
              height: 32px;
            }

            .fresh-title {
              font-size: 16px;
            }

            .fresh-description {
              font-size: 13px;
            }
          }

          @media (max-width: 380px) {
            .fresh-ingredients-content {
              gap: 10px;
            }

            .fresh-icon-wrapper {
              width: 40px;
              height: 40px;
            }

            .fresh-icon {
              width: 26px;
              height: 28px;
            }

            .fresh-text {
              gap: 2px;
            }

            .fresh-title {
              font-size: 14px;
            }

            .fresh-description {
              font-size: 11px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
