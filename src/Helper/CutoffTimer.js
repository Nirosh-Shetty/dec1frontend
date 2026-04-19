// 'use client';

// import { useEffect, useState, useRef, useCallback } from 'react';
// import { Clock } from 'lucide-react';
// import icon from "./../assets/Icon-1.png"


// export default function CutoffStatusCard({ cutoffValidation, userType = 'customer' }) {
//   const [timeLeft, setTimeLeft] = useState('');
//   const [displayInfo, setDisplayInfo] = useState(null);
//   const intervalRef = useRef(null);
//   const prevValidationRef = useRef(null);

//   const isEmployee = userType === 'employee';

//   const formatTimeLeft = useCallback((milliseconds) => {
//     if (milliseconds <= 0) return 'Cutoff passed';

//     const totalSeconds = Math.floor(milliseconds / 1000);
//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const seconds = totalSeconds % 60;

//     if (hours > 0) {
//       return `${hours}h ${minutes}m left`;
//     } else if (minutes > 0) {
//       return `${minutes}m ${seconds}s left`;
//     } else {
//       return `${seconds}s left`;
//     }
//   }, []);

//   const calculateDisplayInfo = useCallback(() => {
//     if (!cutoffValidation?.cutoffDateTime) return null;

//     const cutoffDate = new Date(cutoffValidation.cutoffDateTime);
//     const now = new Date();

//     const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//     let displayDate;
//     let displayDay;
//     let orderingText;

//     if (isEmployee) {
//       displayDate = cutoffDate;
//       displayDay = days[displayDate.getDay()];
//       orderingText = "You're ordering for today";
//     } else {
//       // For customers, show tomorrow
//       const tomorrow = new Date(now);
//       tomorrow.setDate(tomorrow.getDate() + 1);
//       displayDate = tomorrow;
//       displayDay = days[displayDate.getDay()];
//       orderingText = "You're ordering for tomorrow";
//     }

//     const dateStr = `${displayDate.getDate()} ${months[displayDate.getMonth()]}`;

//     return {
//       orderingText,
//       dateStr,
//       displayDay,
//       cutoffDate
//     };
//   }, [isEmployee, cutoffValidation]);

//   // Update display info when cutoffValidation changes
//   useEffect(() => {
//     if (cutoffValidation !== prevValidationRef.current) {
//       prevValidationRef.current = cutoffValidation;
//       const newDisplayInfo = calculateDisplayInfo();
//       setDisplayInfo(newDisplayInfo);
//     }
//   }, [cutoffValidation, calculateDisplayInfo]);

//   // Update countdown timer
//   useEffect(() => {
//     if (!displayInfo?.cutoffDate) return;

//     const updateTimer = () => {
//       const now = new Date();
//       const msLeft = displayInfo.cutoffDate - now;
//       setTimeLeft(formatTimeLeft(msLeft));
//     };

//     // Initial update
//     updateTimer();

//     // Update every second for smooth countdown (changed from 30s for better UX)
//     intervalRef.current = setInterval(updateTimer, 1000);

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [displayInfo, formatTimeLeft]);

//   if (!displayInfo) return null;

//   return (
//     <div className="cutoff-status-main-card" style={{ marginBottom: "-14px" }}>
//       <div className="cutoff-status-card">
//         <div className="cutoff-inner">
//           {/* Left group: Icon + descriptive text */}
//           <div className="cutoff-info-group">
//             <div className="clock-icon">
//               <Clock size={20} />
//             </div>
//             <span className="cutoff-message">
//               {displayInfo.orderingText} • {displayInfo.displayDay} {displayInfo.dateStr}
//             </span>
//           </div>

//           {/* Right side: Time left pill */}
//           <div className="time-left-pill">
//             {timeLeft || 'Loading...'}
//           </div>
//         </div>

//         <style jsx>{`
//         .cutoff-status-main-card {
//          display: flex;
//          align-items: center;
//          justify-content: center;
//          font-family: "Inter", sans-serif;
//         //  margin-bottom: 20px;
//         //  padding: 0 16px;
//         }
//           .cutoff-status-card {
//             max-width: 613px;
//             width: 100%;
//             background: #E6B800;
//             // border-radius: 20px;
//             border-top-left-radius: 0;
//             border-top-right-radius: 0;
//             border-bottom-left-radius: 0;
//             border-bottom-right-radius: 0;
//             box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
//             overflow: hidden;
//             margin-top:"20px"
//           }
  
//           .cutoff-inner {
//             display: flex;
//             align-items: center;
//             justify-content: space-between;
//             padding: 12px 20px;
//             width: 100%;
//             gap: 16px;
//           }
  
//           .cutoff-info-group {
//             display: flex;
//             align-items: center;
//             gap: 12px;
//             flex: 1;
//             min-width: 0;
//           }
  
//           .clock-icon {
//             flex-shrink: 0;
//             display: inline-flex;
//             align-items: center;
//             justify-content: center;
//             color: #8B4513;
//           }
  
//           .cutoff-message {
//             font-size: 14px;
//             font-weight: 500;
//             color: #8B4513;
//             line-height: 1.4;
//             white-space: nowrap;
//             overflow: hidden;
//             text-overflow: ellipsis;
//             letter-spacing: -0.2px;
//           }
  
//           .time-left-pill {
//             background: rgba(139, 69, 19, 0.15);
//             border-radius: 40px;
//             padding: 6px 16px;
//             font-weight: 600;
//             font-size: 14px;
//             color: #4a2a0c;
//             background-color: #FDF2D0;
//             white-space: nowrap;
//             flex-shrink: 0;
//             box-shadow: inset 0 1px 1px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.05);
//           }
  
//           /* Mobile responsive: stack if screen too narrow */
//           @media (max-width: 480px) {
//             .cutoff-inner {
//               flex-wrap: wrap;
//               padding: 12px 16px;
//               gap: 10px;
//             }
            
//             .cutoff-info-group {
//               min-width: calc(100% - 80px);
//             }
            
//             .cutoff-message {
//               white-space: normal;
//               font-size: 13px;
//             }
            
//             .time-left-pill {
//               font-size: 12px;
//               padding: 4px 12px;
//             }
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// }
































'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';
import icon from "./../assets/Icon-1.png"

export default function CutoffStatusCard({ cutoffValidation, userStatus}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [displayInfo, setDisplayInfo] = useState(null);
  const intervalRef = useRef(null);
  const prevValidationRef = useRef(null);

  const isEmployee = userStatus === 'Employee';

  // Helper function to get current time in IST
  const getCurrentIST = useCallback(() => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utcTime + istOffset);
  }, []);

  // Helper function to convert any date to IST
  const toIST = useCallback((date) => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utcTime + istOffset);
  }, []);

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

    const cutoffDate = new Date(cutoffValidation.cutoffDateTime);
    const nowIST = getCurrentIST();
    const cutoffIST = toIST(cutoffDate);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let displayDate;
    let displayDay;
    let orderingText;

    if (isEmployee) {
      displayDate = cutoffIST;
      displayDay = days[displayDate.getDay()];
      orderingText = "You're ordering for today";
    } else {
      const tomorrowIST = new Date(nowIST);
      tomorrowIST.setDate(tomorrowIST.getDate() + 1);
      displayDate = tomorrowIST;
      displayDay = days[displayDate.getDay()];
      orderingText = "You're ordering for tomorrow";
    }

    const dateStr = `${displayDate.getDate()} ${months[displayDate.getMonth()]}`;

    return {
      orderingText,
      dateStr,
      displayDay,
      cutoffDate: cutoffIST
    };
  }, [isEmployee, cutoffValidation, getCurrentIST, toIST]);

  useEffect(() => {
    if (cutoffValidation !== prevValidationRef.current) {
      prevValidationRef.current = cutoffValidation;
      const newDisplayInfo = calculateDisplayInfo();
      setDisplayInfo(newDisplayInfo);
    }
  }, [cutoffValidation, calculateDisplayInfo]);

  useEffect(() => {
    if (!displayInfo?.cutoffDate) return;

    const updateTimer = () => {
      const nowIST = getCurrentIST();
      const msLeft = displayInfo.cutoffDate - nowIST;
      setTimeLeft(formatTimeLeft(msLeft));
    };

    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [displayInfo, formatTimeLeft, getCurrentIST]);

  if (!displayInfo) return null;

  return (
    <div className="cutoff-status-main-card">
      <div className="cutoff-status-card">
        <div className="cutoff-inner">
          <div className="cutoff-info-group">
            <div className="clock-icon">
              <Clock size={20} />
            </div>
            <span className="cutoff-message">
              {displayInfo.orderingText} • {displayInfo.displayDay} {displayInfo.dateStr}
            </span>
          </div>

          <div className="time-left-pill">
            {timeLeft || 'Loading...'}
          </div>
        </div>

        {/* Fresh ingredients section - Centered with fixed height */}
        <div className="fresh-ingredients-section">
          <div className="fresh-ingredients-content">
            <div className="fresh-icon-wrapper">
              <img 
                src={icon} 
                alt="Fresh icon" 
                className="fresh-icon"
              />
            </div>
            <div className="fresh-text">
              <span className="fresh-title">Sourced fresh at 5 AM tomorrow</span>
              <span className="fresh-description">
                We buy ingredients only after you order — nothing sits in storage overnight.
              </span>
            </div>
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
            color: #8B4513;
          }
  
          .cutoff-message {
            font-size: 14px;
            font-weight: 500;
            color: #8B4513;
            line-height: 1.4;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            letter-spacing: -0.2px;
          }
  
          .time-left-pill {
            background: rgba(139, 69, 19, 0.15);
            border-radius: 40px;
            padding: 6px 16px;
            font-weight: 600;
            font-size: 14px;
            color: #4a2a0c;
            background-color: #FDF2D0;
            white-space: nowrap;
            flex-shrink: 0;
            box-shadow: inset 0 1px 1px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.05);
          }

          /* Fresh ingredients section - Fixed height 147.5px */
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

          /* Icon wrapper matching Figma design */
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
              font-size: 32px;
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
              font-size: 12px;
            }
            
            .fresh-description {
              font-size: 10px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}