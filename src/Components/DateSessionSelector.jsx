// import React, { useEffect, useState, useMemo } from "react";
// import "../Styles/DateSessionSelector.css";
// import { Colors } from "../Helper/themes.jsx";
// import axios from "axios";
// import { WiDaySunny } from "react-icons/wi";
// import { IoMoonOutline } from "react-icons/io5";

// const dateToKeyUTC = (date) => {
//   const y = date.getUTCFullYear();
//   const m = String(date.getUTCMonth() + 1).padStart(2, "0");
//   const d = String(date.getUTCDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// };

// const sessionConfig = {
//   Breakfast: {
//     icon: WiDaySunny,
//     timeRange: "7-8 AM",
//     displayName: "Breakfast",
//   },
//   Lunch: { icon: WiDaySunny, timeRange: "12-1 PM", displayName: "Lunch" },
//   Dinner: { icon: IoMoonOutline, timeRange: "7-8 PM", displayName: "Dinner" },
// };

// const DateSessionSelector = ({
//   onChange,
//   currentDate,
//   currentSession,
//   menuData = [],
// }) => {
//   const getUser = () => {
//     try {
//       return JSON.parse(localStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   };

//   const user = getUser();
//   const isEmployee = user?.status === "Employee";

//   const [hubData, setHubData] = useState(null);
//   const [currentHubId, setCurrentHubId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [hasInitialized, setHasInitialized] = useState(false);
//   const [selectedDateOverride, setSelectedDateOverride] = useState(null);

//   const sessionOrder = ["Breakfast", "Lunch", "Dinner"];

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 60000);
//     return () => clearInterval(timer);
//   }, []);

//   const getHubIdFromAddress = () => {
//     try {
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const currentLocation = localStorage.getItem("currentLocation");
//       if (primaryAddress && primaryAddress !== "null") {
//         const parsed = JSON.parse(primaryAddress);
//         return parsed.hubId;
//       }
//       if (currentLocation && currentLocation !== "null") {
//         const parsed = JSON.parse(currentLocation);
//         return parsed.hubId;
//       }
//     } catch (error) {
//       console.error("Error getting hub ID:", error);
//     }
//     return null;
//   };

//   const fetchHubData = async (hubId) => {
//     if (!hubId) return null;
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("authToken");
//       const res = await axios.get(
//         `https://dd-backend-3nm0.onrender.com/api/Hub/get-cutoff-times/${hubId}`,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       if (res.status === 200) {
//         console.log("Hub data fetched:", res.data);

//         const cutoffTimes = res.data.cutoffTimes || {};
//         const orderMode = res.data.orderMode || "preorder";

//         ["breakfast", "lunch", "dinner"].forEach((session) => {
//           if (!cutoffTimes[session]) {
//             cutoffTimes[session] = {};
//           }
//           if (!cutoffTimes[session].defaultCutoff) {
//             cutoffTimes[session].defaultCutoff =
//               orderMode === "instant" ? "20:00" : "23:59";
//           }
//           if (!cutoffTimes[session].employeeCutoff) {
//             cutoffTimes[session].employeeCutoff = "10:00";
//           }
//         });

//         return { orderMode, cutoffTimes };
//       }
//     } catch (error) {
//       console.error("Error fetching hub data:", error);
//       return {
//         orderMode: "preorder",
//         cutoffTimes: {
//           breakfast: { defaultCutoff: "23:59", employeeCutoff: "10:00" },
//           lunch: { defaultCutoff: "23:59", employeeCutoff: "10:00" },
//           dinner: { defaultCutoff: "23:59", employeeCutoff: "10:00" },
//         },
//       };
//     } finally {
//       setLoading(false);
//     }
//     return null;
//   };

//   useEffect(() => {
//     const handleLocationChange = async () => {
//       const hubId = getHubIdFromAddress();
//       if (hubId) {
//         if (hubId !== currentHubId) {
//           console.log("Hub changed to:", hubId);
//           setCurrentHubId(hubId);
//           setSelectedDateOverride(null);
//           const data = await fetchHubData(hubId);
//           if (data) {
//             setHubData(data);
//             setHasInitialized(false);
//           }
//         } else {
//           // Same hub, but location event fired — reset initialization so session re-selects
//           setHasInitialized(false);
//         }
//       }
//     };

//     handleLocationChange();

//     window.addEventListener("locationUpdated", handleLocationChange);
//     window.addEventListener("addressUpdated", handleLocationChange);
//     window.addEventListener("storage", handleLocationChange);

//     return () => {
//       window.removeEventListener("locationUpdated", handleLocationChange);
//       window.removeEventListener("addressUpdated", handleLocationChange);
//       window.removeEventListener("storage", handleLocationChange);
//     };
//   }, [currentHubId]);

//   const availability = useMemo(() => {
//     const map = {};
//     (menuData || []).forEach((item) => {
//       if (!item?.deliveryDate || !item?.session) return;
//       const d = new Date(item.deliveryDate);
//       const keyUtc = dateToKeyUTC(d);
//       if (!map[keyUtc]) map[keyUtc] = new Set();
//       map[keyUtc].add(item.session);
//     });
//     return map;
//   }, [menuData]);

//   // Calculate which date to show
//   const displayDate = useMemo(() => {
//     const now = currentTime;
//     const orderMode = hubData?.orderMode || "preorder";

//     console.log("Calculating display date:", { isEmployee, orderMode });

//     let offset = 0;

//     if (!isEmployee) {
//       if (orderMode === "instant") {
//         // For instant mode, ALWAYS show today (offset 0)
//         // The cutoff check will happen at order time
//         offset = 0;
//         console.log("Instant mode: showing TODAY (offset 0)");
//       } else {
//         // Preorder mode: Always show tomorrow
//         offset = 1;
//         console.log("Preorder mode: showing TOMORROW (offset 1)");
//       }
//     } else {
//       // Employees always see today
//       offset = 0;
//       console.log("Employee mode: showing TODAY (offset 0)");
//     }

//     // Use override if set
//     const finalOffset =
//       selectedDateOverride !== null ? selectedDateOverride : offset;

//     const dUtc = new Date(
//       Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + finalOffset),
//     );

//     let label;
//     if (finalOffset === 0) {
//       label = "Today";
//     } else if (finalOffset === 1) {
//       label = "Tomorrow";
//     } else {
//       label =
//         dUtc.toLocaleString("default", { month: "short" }) +
//         " " +
//         dUtc.getUTCDate();
//     }

//     return {
//       label,
//       date: dUtc.getUTCDate(),
//       month: dUtc.toLocaleString("default", { month: "short" }),
//       weekday: dUtc.toLocaleString("default", { weekday: "long" }),
//       dateObj: dUtc,
//       offsetFromToday: finalOffset,
//     };
//   }, [isEmployee, hubData, currentTime, selectedDateOverride]);

//   const isSessionAvailable = (dateObj, session) => {
//     if (!dateObj) return false;
//     const key = dateToKeyUTC(dateObj);
//     const availableSessions = availability[key] || new Set();

//     // Check if menu has this session
//     if (!availableSessions.has(session)) {
//       return false;
//     }

//     // For instant mode and today's date, we don't disable based on cutoff
//     // The actual order validation will happen when adding to cart
//     return true;
//   };

//   const sessionsForDate = (dateObj) => {
//     if (!dateObj) return new Set();
//     const key = dateToKeyUTC(dateObj);
//     const menuSessions = availability[key] || new Set();
//     const result = new Set();
//     menuSessions.forEach((session) => {
//       if (isSessionAvailable(dateObj, session)) {
//         result.add(session);
//       }
//     });
//     return result;
//   };

//   useEffect(() => {
//     if (!hubData || loading || hasInitialized) return;
//     if (!displayDate?.dateObj) return;

//     const sessions = sessionsForDate(displayDate.dateObj);
//     console.log("Available sessions for", displayDate.label, ":", [
//       ...sessions,
//     ]);

//     let sessionToSelect = null;
//     if (sessions.has("Breakfast")) {
//       sessionToSelect = "Breakfast";
//     } else if (sessions.has("Lunch")) {
//       sessionToSelect = "Lunch";
//     } else if (sessions.has("Dinner")) {
//       sessionToSelect = "Dinner";
//     }

//     if (sessionToSelect) {
//       const currentDateKey = currentDate ? dateToKeyUTC(currentDate) : null;
//       const displayDateKey = dateToKeyUTC(displayDate.dateObj);

//       if (
//         currentDateKey !== displayDateKey ||
//         currentSession !== sessionToSelect
//       ) {
//         console.log(
//           "Auto-selecting:",
//           displayDate.dateObj.toLocaleDateString(),
//           sessionToSelect,
//         );
//         onChange(displayDate.dateObj, sessionToSelect);
//       }
//       setHasInitialized(true);
//     }
//   }, [
//     hubData,
//     loading,
//     displayDate,
//     menuData,
//     hasInitialized,
//     currentDate,
//     currentSession,
//     onChange,
//   ]);

//   const handleSessionClick = (session) => {
//     if (!displayDate?.dateObj) return;
//     const sessions = sessionsForDate(displayDate.dateObj);
//     if (!sessions.has(session)) return;
//     onChange(displayDate.dateObj, session);
//   };

//   const isSessionDisabled = (session) => {
//     if (!displayDate?.dateObj) return true;
//     return !sessionsForDate(displayDate.dateObj).has(session);
//   };

//   const getSessionIcon = (session) => sessionConfig[session]?.icon;
//   const getTimeRange = (session) => sessionConfig[session]?.timeRange || "";

//   const getOrderModeInfo = () => {
//     const orderMode = hubData?.orderMode || "preorder";
//     if (isEmployee) {
//       return { badge: "👔 Employee", description: "Same-day ordering" };
//     } else if (orderMode === "instant") {
//       return { badge: "⚡ Instant", description: "Same-day delivery" };
//     } else {
//       return { badge: "📋 Preorder", description: "Order for tomorrow" };
//     }
//   };

//   const orderModeInfo = getOrderModeInfo();

//   if (loading) {
//     return (
//       <div className="date-session-wrapper">
//         <div
//           className="loading-placeholder"
//           style={{ textAlign: "center", padding: "20px" }}
//         >
//           Loading availability...
//         </div>
//       </div>
//     );
//   }

//   const cardBackground =
//     hubData?.orderMode === "instant"
//       ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
//       : Colors.greenCardamom;

//   return (
//     <div className="date-session-wrapper">
//       {/* Order Mode Badge */}
//       {/* <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         marginBottom: '12px'
//       }}>
//         <span style={{
//           background: hubData?.orderMode === 'instant' ? '#667eea' : '#f093fb',
//           color: 'white',
//           padding: '4px 16px',
//           borderRadius: '20px',
//           fontSize: '12px',
//           fontWeight: '600'
//         }}>
//           {orderModeInfo.badge} • {orderModeInfo.description}
//         </span>
//       </div> */}

//       {/* <div className="single-date-container" style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
//         <div
//           className="date-card active"
//           style={{
//             minWidth: "140px",
//             textAlign: "center",
//             padding: "14px 28px",
//             borderRadius: "16px",
//             background: cardBackground,
//             color: Colors.appForeground,
//             boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//           }}
//         >
//           <div className="day" style={{ fontSize: "14px", opacity: 0.9, fontWeight: 500 }}>
//             {displayDate.label}
//           </div>
//           <div className="date" style={{ fontSize: "28px", fontWeight: "bold", lineHeight: 1.2 }}>
//             {`${displayDate.date} ${displayDate.month}`}
//           </div>
//           <div className="weekday" style={{ fontSize: "14px", opacity: 0.9 }}>
//             {displayDate.weekday}
//           </div>
//         </div>
//       </div> */}

//       <div className="session-container">
//         {sessionOrder.map((session) => {
//           const Icon = getSessionIcon(session);
//           const isActive = currentSession === session;
//           const isDisabled = isSessionDisabled(session);
//           const timeRange = getTimeRange(session);

//           return (
//             <div
//               key={session}
//               className={`session-card ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
//               onClick={() => !isDisabled && handleSessionClick(session)}
//               title={isDisabled ? "Not available for this date" : ""}
//               style={{
//                 cursor: isDisabled ? "not-allowed" : "pointer",
//                 opacity: isDisabled ? 0.5 : 1,
//               }}
//             >
//               <div className="session-icon">
//                 <Icon size={32} />
//               </div>
//               <div className="session-info">
//                 <div className="session-title">
//                   {sessionConfig[session].displayName}
//                 </div>
//                 <div className="session-time">{timeRange}</div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default DateSessionSelector;

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import "../Styles/DateSessionSelector.css";
import { Colors } from "../Helper/themes.jsx";
import axios from "axios";
import { WiDaySunny } from "react-icons/wi";
import { IoMoonOutline } from "react-icons/io5";

const dateToKeyUTC = (date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const sessionConfig = {
  Breakfast: {
    icon: WiDaySunny,
    timeRange: "7-8 AM",
    displayName: "Breakfast",
  },
  Lunch: { icon: WiDaySunny, timeRange: "12-1 PM", displayName: "Lunch" },
  Dinner: { icon: IoMoonOutline, timeRange: "7-8 PM", displayName: "Dinner" },
};

// Helper function to check if a session is past cutoff
const isSessionPastCutoff = (session, currentTime, hubData, isEmployee) => {
  if (!hubData?.cutoffTimes) return false;

  const sessionKey = session.toLowerCase();
  const cutoffTimes = hubData.cutoffTimes[sessionKey];

  if (!cutoffTimes) return false;

  // Get appropriate cutoff time based on user type
  const cutoffTimeStr = isEmployee
    ? cutoffTimes.employeeCutoff
    : cutoffTimes.defaultCutoff;

  if (!cutoffTimeStr) return false;

  // Parse cutoff time (format: "HH:MM")
  const [cutoffHour, cutoffMinute] = cutoffTimeStr.split(":").map(Number);

  const cutoffDate = new Date(currentTime);
  cutoffDate.setHours(cutoffHour, cutoffMinute, 0, 0);

  // Session is past cutoff if current time is after cutoff time
  return currentTime > cutoffDate;
};

const DateSessionSelector = ({
  onChange,
  currentDate,
  currentSession,
  menuData = [],
  hubCutoffData = null, // passed from Home — avoids duplicate fetch
}) => {
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const user = getUser();
  const isEmployee = user?.status === "Employee";

  // Use prop if provided, otherwise fall back to internal fetch
  const [hubDataInternal, setHubDataInternal] = useState(null);
  const hubData = hubCutoffData || hubDataInternal;

  const [currentHubId, setCurrentHubId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDateOverride, setSelectedDateOverride] = useState(null);

  const sessionOrder = ["Breakfast", "Lunch", "Dinner"];

  // Update time every second for precise cutoff checking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getHubIdFromAddress = () => {
    try {
      const primaryAddress = localStorage.getItem("primaryAddress");
      const currentLocation = localStorage.getItem("currentLocation");
      if (primaryAddress && primaryAddress !== "null") {
        const parsed = JSON.parse(primaryAddress);
        return parsed.hubId;
      }
      if (currentLocation && currentLocation !== "null") {
        const parsed = JSON.parse(currentLocation);
        return parsed.hubId;
      }
    } catch (error) {
      console.error("Error getting hub ID:", error);
    }
    return null;
  };

  const fetchHubData = async (hubId) => {
    if (!hubId) return null;
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        `https://dd-backend-3nm0.onrender.com/api/Hub/get-cutoff-times/${hubId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.status === 200) {
        console.log("Hub data fetched:", res.data);

        const cutoffTimes = res.data.cutoffTimes || {};
        const orderMode = res.data.orderMode || "preorder";

        ["breakfast", "lunch", "dinner"].forEach((session) => {
          if (!cutoffTimes[session]) {
            cutoffTimes[session] = {};
          }
          if (!cutoffTimes[session].defaultCutoff) {
            cutoffTimes[session].defaultCutoff =
              orderMode === "instant" ? "20:00" : "23:59";
          }
          if (!cutoffTimes[session].employeeCutoff) {
            cutoffTimes[session].employeeCutoff = "10:00";
          }
        });

        return { orderMode, cutoffTimes };
      }
    } catch (error) {
      console.error("Error fetching hub data:", error);
      return {
        orderMode: "preorder",
        cutoffTimes: {
          breakfast: { defaultCutoff: "23:59", employeeCutoff: "10:00" },
          lunch: { defaultCutoff: "23:59", employeeCutoff: "10:00" },
          dinner: { defaultCutoff: "23:59", employeeCutoff: "10:00" },
        },
      };
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    const handleLocationChange = async () => {
      // If parent is providing hubCutoffData, skip internal fetch entirely
      if (hubCutoffData) return;

      const hubId = getHubIdFromAddress();
      if (hubId) {
        if (hubId !== currentHubId) {
          console.log("Hub changed to:", hubId);
          setCurrentHubId(hubId);
          setSelectedDateOverride(null);
          const data = await fetchHubData(hubId);
          if (data) {
            setHubDataInternal(data);
          }
        }
      }
    };

    handleLocationChange();

    window.addEventListener("locationUpdated", handleLocationChange);
    window.addEventListener("addressUpdated", handleLocationChange);
    window.addEventListener("storage", handleLocationChange);

    return () => {
      window.removeEventListener("locationUpdated", handleLocationChange);
      window.removeEventListener("addressUpdated", handleLocationChange);
      window.removeEventListener("storage", handleLocationChange);
    };
  }, [currentHubId, hubCutoffData]);

  const availability = useMemo(() => {
    const map = {};
    (menuData || []).forEach((item) => {
      if (!item?.deliveryDate || !item?.session) return;
      const d = new Date(item.deliveryDate);
      const keyUtc = dateToKeyUTC(d);
      if (!map[keyUtc]) map[keyUtc] = new Set();
      map[keyUtc].add(item.session);
    });
    return map;
  }, [menuData]);

  // Get all available future dates with sessions
  // Updates every second to reflect cutoff changes in real-time
  const getAvailableFutureDates = useCallback(() => {
    const now = currentTime;
    const futureDates = [];

    // Check next 30 days
    for (let i = 0; i <= 30; i++) {
      const checkDate = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + i),
      );
      const dateKey = dateToKeyUTC(checkDate);
      const sessions = availability[dateKey];

      if (sessions && sessions.size > 0) {
        // Filter sessions that are not past cutoff for this date
        const validSessions = new Set();
        sessions.forEach((session) => {
          // For future dates, cutoff doesn't matter (only for today)
          if (i > 0) {
            validSessions.add(session);
          } else {
            // For today, check cutoff
            const isPastCutoff = isSessionPastCutoff(
              session,
              now,
              hubData,
              isEmployee,
            );
            if (!isPastCutoff) {
              validSessions.add(session);
            }
          }
        });

        if (validSessions.size > 0) {
          futureDates.push({
            date: checkDate,
            offset: i,
            sessions: validSessions,
            dateKey,
          });
        }
      }
    }

    return futureDates;
  }, [availability, currentTime, hubData, isEmployee]);

  const isSessionAvailable = useCallback(
    (dateObj, session) => {
      if (!dateObj) return false;
      const key = dateToKeyUTC(dateObj);
      const availableSessions = availability[key] || new Set();

      // Check if menu has this session
      if (!availableSessions.has(session)) {
        return false;
      }

      // Check cutoff for today's date
      const now = currentTime;
      const dateKey = dateToKeyUTC(dateObj);
      const todayDateKey = dateToKeyUTC(now);

      if (dateKey === todayDateKey) {
        const isPastCutoff = isSessionPastCutoff(
          session,
          now,
          hubData,
          isEmployee,
        );
        if (isPastCutoff) {
          return false;
        }
      }

      return true;
    },
    [availability, currentTime, hubData, isEmployee],
  );

  const sessionsForDate = useCallback(
    (dateObj) => {
      if (!dateObj) return new Set();
      const key = dateToKeyUTC(dateObj);
      const menuSessions = availability[key] || new Set();
      const result = new Set();
      menuSessions.forEach((session) => {
        if (isSessionAvailable(dateObj, session)) {
          result.add(session);
        }
      });
      return result;
    },
    [availability, isSessionAvailable],
  );

  // Calculate which date to show
  // Updates every second to reflect cutoff changes in real-time
  const displayDate = useMemo(() => {
    const now = currentTime;
    const orderMode = hubData?.orderMode || "preorder";
    const availableFutureDates = getAvailableFutureDates();

    console.log("Calculating display date:", {
      isEmployee,
      orderMode,
      availableFutureDatesLength: availableFutureDates.length,
    });

    let targetDate = null;
    let targetOffset = null;

    // If there's a manual override, use that
    if (selectedDateOverride !== null) {
      const overrideDate = new Date(
        Date.UTC(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + selectedDateOverride,
        ),
      );
      targetDate = overrideDate;
      targetOffset = selectedDateOverride;
    } else {
      // Auto-select the next available date with sessions
      if (availableFutureDates.length > 0) {
        // For employees and instant mode, check today first
        if (isEmployee || orderMode === "instant") {
          const todayAvailable = availableFutureDates.find(
            (d) => d.offset === 0,
          );
          if (todayAvailable && todayAvailable.sessions.size > 0) {
            targetDate = todayAvailable.date;
            targetOffset = 0;
          } else if (availableFutureDates.length > 0) {
            // If today not available, take next available
            targetDate = availableFutureDates[0].date;
            targetOffset = availableFutureDates[0].offset;
          }
        } else {
          // Preorder mode: show tomorrow or next available (skip today)
          const tomorrowAvailable = availableFutureDates.find(
            (d) => d.offset === 1,
          );
          if (tomorrowAvailable && tomorrowAvailable.sessions.size > 0) {
            targetDate = tomorrowAvailable.date;
            targetOffset = 1;
          } else {
            // No tomorrow — find next available date that is NOT today
            const nextFuture = availableFutureDates.find((d) => d.offset > 1);
            if (nextFuture) {
              targetDate = nextFuture.date;
              targetOffset = nextFuture.offset;
            } else if (availableFutureDates.length > 0) {
              // Last resort: take whatever is available (could be today)
              targetDate = availableFutureDates[0].date;
              targetOffset = availableFutureDates[0].offset;
            }
          }
        }
      }
    }

    // Fallback if no dates available
    if (!targetDate) {
      targetDate = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
      );
      targetOffset = 0;
    }

    let label;
    if (targetOffset === 0) {
      label = "Today";
    } else if (targetOffset === 1) {
      label = "Tomorrow";
    } else {
      label =
        targetDate.toLocaleString("default", { month: "short" }) +
        " " +
        targetDate.getUTCDate();
    }

    return {
      label,
      date: targetDate.getUTCDate(),
      month: targetDate.toLocaleString("default", { month: "short" }),
      weekday: targetDate.toLocaleString("default", { weekday: "long" }),
      dateObj: targetDate,
      offsetFromToday: targetOffset,
    };
  }, [
    isEmployee,
    hubData,
    currentTime,
    selectedDateOverride,
    getAvailableFutureDates,
  ]);

  // When parent provides new hub data (hub switched), reset the date override
  useEffect(() => {
    if (hubCutoffData) {
      setSelectedDateOverride(null);
    }
  }, [hubCutoffData]);
  // Home.jsx owns the selected date/session state and handles all auto-selection logic.
  // DateSessionSelector only displays the current selection and reports user clicks via onChange.

  const handleSessionClick = (session) => {
    if (!displayDate?.dateObj) return;
    const sessions = sessionsForDate(displayDate.dateObj);
    if (!sessions.has(session)) return;
    onChange(displayDate.dateObj, session);
  };

  const isSessionDisabled = (session) => {
    if (!displayDate?.dateObj) return true;
    return !sessionsForDate(displayDate.dateObj).has(session);
  };

  const getSessionIcon = (session) => sessionConfig[session]?.icon;
  const getTimeRange = (session) => sessionConfig[session]?.timeRange || "";

  const getOrderModeInfo = () => {
    const orderMode = hubData?.orderMode || "preorder";
    if (isEmployee) {
      return { badge: "👔 Employee", description: "Same-day ordering" };
    } else if (orderMode === "instant") {
      return { badge: "⚡ Instant", description: "Same-day delivery" };
    } else {
      return { badge: "📋 Preorder", description: "Order for tomorrow" };
    }
  };

  if (loading) {
    return (
      <div className="date-session-wrapper">
        <div
          className="loading-placeholder"
          style={{ textAlign: "center", padding: "20px" }}
        >
          Loading availability...
        </div>
      </div>
    );
  }

  return (
    <div className="date-session-wrapper">
      <div className="session-container">
        {sessionOrder.map((session) => {
          const Icon = getSessionIcon(session);
          const isActive = currentSession === session;
          const isDisabled = isSessionDisabled(session);
          const timeRange = getTimeRange(session);

          // Check if disabled due to cutoff
          const isPastCutoff =
            displayDate?.dateObj &&
            dateToKeyUTC(displayDate.dateObj) === dateToKeyUTC(currentTime) &&
            isSessionPastCutoff(session, currentTime, hubData, isEmployee);

          return (
            <div
              key={session}
              className={`session-card ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
              onClick={() => !isDisabled && handleSessionClick(session)}
              title={
                isDisabled
                  ? isPastCutoff
                    ? "Ordering closed for this session"
                    : "Not available for this date"
                  : ""
              }
              style={{
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.5 : 1,
                transition: "all 0.3s ease",
              }}
            >
              <div className="session-icon">
                <Icon size={32} />
              </div>
              <div className="session-info">
                <div className="session-title">
                  {sessionConfig[session].displayName}
                </div>
                <div className="session-time">{timeRange}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DateSessionSelector;
