'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';
import icon from "./../assets/Icon-1.png"

export default function CutoffStatusCard({
  cutoffValidation,
  userStatus,
  selectedDate,
  selectedSession,
  cutoffLoading
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [displayInfo, setDisplayInfo] = useState(null);
  const intervalRef = useRef(null);

  // Check if user is Employee
  const isEmployee = userStatus && userStatus.includes('Employee');

  // Get order mode from cutoffValidation
  const orderMode = cutoffValidation?.orderMode || 'preorder';

  // Debug log
  // console.log('CutoffStatusCard:', {
  //   isEmployee,
  //   orderMode,
  //   cutoffValidation,
  //   userStatus,
  //   selectedDate: selectedDate?.toLocaleDateString(),
  //   selectedSession
  // });

  const formatTimeLeft = useCallback((milliseconds) => {
    if (milliseconds <= 0) return 'Cutoff passed';

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

    // cutoffValidation.cutoffDateTime is already a corrected Date (IST offset applied in Home.jsx)
    const cutoffDate = cutoffValidation.cutoffDateTime instanceof Date
      ? cutoffValidation.cutoffDateTime
      : new Date(cutoffValidation.cutoffDateTime);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let displayDate;
    let displayDay;
    let orderingText;
    let orderModeText = '';

    if (isEmployee) {
      // Employee: Always show today's date (both preorder and instant modes)
      displayDate = new Date();
      displayDay = days[displayDate.getDay()];
      orderingText = "You're ordering for today";
    } else {
      // Normal User: Depends on orderMode
      if (orderMode === 'instant') {
        // Instant mode: Show today's date
        displayDate = new Date();
        displayDay = days[displayDate.getDay()];
        orderingText = "You're ordering for today";
        orderModeText = '⚡ Instant';
      } else {
        // Preorder mode: Show tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        displayDate = tomorrow;
        displayDay = days[displayDate.getDay()];
        orderingText = "You're ordering for tomorrow";
        orderModeText = '📋 Preorder';
      }
    }

    const dateStr = `${displayDate.getDate()} ${months[displayDate.getMonth()]}`;

    // console.log('DisplayInfo calculated:', {
    //   orderingText,
    //   dateStr,
    //   displayDay,
    //   orderMode,
    //   orderModeText,
    //   allowed: cutoffValidation?.allowed
    // });

    return {
      orderingText,
      dateStr,
      displayDay,
      cutoffDate,
      orderMode,
      orderModeText,
      isEmployee,
      allowed: cutoffValidation?.allowed
    };
  }, [userStatus, cutoffValidation, orderMode, isEmployee]);

  // Recalculate whenever dependencies change
  useEffect(() => {
    const newDisplayInfo = calculateDisplayInfo();
    setDisplayInfo(newDisplayInfo);
  }, [userStatus, cutoffValidation, calculateDisplayInfo]);

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

  // Get background color based on order mode and allowed status
  const getCardBackground = () => {
    if (!displayInfo) return '#E6B800';

    if (!displayInfo.allowed) {
      return '#ffcccc';
    }

    if (orderMode === 'instant') {
      return '#667eea';
    }

    return '#E6B800';
  };

  // Get text color based on background
  const getTextColor = () => {
    if (!displayInfo?.allowed) return '#8B0000';
    if (orderMode === 'instant') return '#FFFFFF';
    return '#8B4513';
  };

  // Get clock icon color
  const getClockColor = () => {
    if (!displayInfo?.allowed) return '#8B0000';
    if (orderMode === 'instant') return '#FFFFFF';
    return '#8B4513';
  };

  // Get time left pill background
  const getTimeLeftPillBackground = () => {
    if (!displayInfo?.allowed) return 'rgba(139, 0, 0, 0.15)';
    if (orderMode === 'instant') return 'rgba(255, 255, 255, 0.2)';
    return 'rgba(139, 69, 19, 0.15)';
  };

  // Get time left pill text color
  const getTimeLeftPillTextColor = () => {
    if (!displayInfo?.allowed) return '#8B0000';
    if (orderMode === 'instant') return '#FFFFFF';
    return '#4a2a0c';
  };

  if (!displayInfo) {
    return (
      <div className="cutoff-status-main-card">
        <div className="cutoff-status-card">
          <div className="cutoff-inner" style={{ background: '#ffcccc' }}>
            <div className="cutoff-info-group">
              <div className="clock-icon">
                <Clock size={20} />
              </div>
              <span className="cutoff-message" style={{ color: 'red' }}>
                {cutoffLoading ? 'Checking availability...' : `Loading... (orderMode: ${orderMode})`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cardBackground = getCardBackground();
  const textColor = getTextColor();
  const clockColor = getClockColor();
  const pillBackground = getTimeLeftPillBackground();
  const pillTextColor = getTimeLeftPillTextColor();

  return (
    <div className="cutoff-status-main-card">
      <div className="cutoff-status-card">
        <div className="cutoff-inner" style={{ background: cardBackground }}>
          <div className="cutoff-info-group">
            <div className="clock-icon" style={{ color: clockColor }}>
              <Clock size={20} />
            </div>
            <span className="cutoff-message" style={{ color: textColor }}>
              {!displayInfo.allowed ? (
                <>❌ Orders closed for {selectedSession}</>
              ) : (
                <>
                  {displayInfo.orderingText} • {displayInfo.displayDay} {displayInfo.dateStr}
                  {!displayInfo.isEmployee && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.8 }}>
                      {displayInfo.orderModeText}
                    </span>
                  )}
                </>
              )}
            </span>
          </div>

          <div
            className="time-left-pill"
            style={{
              background: pillBackground,
              color: pillTextColor
            }}
          >
            {!displayInfo.allowed ? (
              'Cutoff passed'
            ) : (
              timeLeft || 'Loading...'
            )}
          </div>
        </div>

        {/* Fresh ingredients section */}
        {/* <div className="fresh-ingredients-section">
          <div className="fresh-ingredients-content">
            <div className="fresh-icon-wrapper">
              <img 
                src={icon} 
                alt="Fresh icon" 
                className="fresh-icon"
              />
            </div>
            <div className="fresh-text">
              <span className="fresh-title">
                {orderMode === 'instant' 
                  ? '⚡ Fresh ingredients sourced today'
                  : 'Sourced fresh at 5 AM tomorrow'
                }
              </span>
              <span className="fresh-description">
                {orderMode === 'instant'
                  ? 'We prepare your meal with fresh ingredients for same-day delivery.'
                  : 'We buy ingredients only after you order — nothing sits in storage overnight.'
                }
              </span>
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
            background: #E6B800;
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
            transition: background-color 0.3s ease;
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
          }
  
          .cutoff-message {
            font-size: 14px;
            font-weight: 500;
            line-height: 1.4;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            letter-spacing: -0.2px;
          }
  
          .time-left-pill {
            border-radius: 40px;
            padding: 6px 16px;
            font-weight: 600;
            font-size: 14px;
            white-space: nowrap;
            flex-shrink: 0;
            box-shadow: inset 0 1px 1px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.05);
          }

          .fresh-ingredients-section {
            background-color: #3D6701;
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

          .fresh-icon-wrapper {
            width: 50px;
            height: 50px;
            background-color: #54811F;
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
            color: #FFFFFF;
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











