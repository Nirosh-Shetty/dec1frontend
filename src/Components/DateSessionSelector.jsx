import React, { useEffect, useState, useMemo } from "react";
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

const DateSessionSelector = ({
  onChange,
  currentDate,
  currentSession,
  menuData = [],
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

  const [hubData, setHubData] = useState(null);
  const [currentHubId, setCurrentHubId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedDateOverride, setSelectedDateOverride] = useState(null);

  const sessionOrder = ["Breakfast", "Lunch", "Dinner"];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
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
      const hubId = getHubIdFromAddress();
      if (hubId) {
        if (hubId !== currentHubId) {
          console.log("Hub changed to:", hubId);
          setCurrentHubId(hubId);
          setSelectedDateOverride(null);
          const data = await fetchHubData(hubId);
          if (data) {
            setHubData(data);
            setHasInitialized(false);
          }
        } else {
          // Same hub, but location event fired — reset initialization so session re-selects
          setHasInitialized(false);
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
  }, [currentHubId]);

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

  // Calculate which date to show
  const displayDate = useMemo(() => {
    const now = currentTime;
    const orderMode = hubData?.orderMode || "preorder";

    console.log("Calculating display date:", { isEmployee, orderMode });

    let offset = 0;

    if (!isEmployee) {
      if (orderMode === "instant") {
        // For instant mode, ALWAYS show today (offset 0)
        // The cutoff check will happen at order time
        offset = 0;
        console.log("Instant mode: showing TODAY (offset 0)");
      } else {
        // Preorder mode: Always show tomorrow
        offset = 1;
        console.log("Preorder mode: showing TOMORROW (offset 1)");
      }
    } else {
      // Employees always see today
      offset = 0;
      console.log("Employee mode: showing TODAY (offset 0)");
    }

    // Use override if set
    const finalOffset =
      selectedDateOverride !== null ? selectedDateOverride : offset;

    const dUtc = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + finalOffset),
    );

    let label;
    if (finalOffset === 0) {
      label = "Today";
    } else if (finalOffset === 1) {
      label = "Tomorrow";
    } else {
      label =
        dUtc.toLocaleString("default", { month: "short" }) +
        " " +
        dUtc.getUTCDate();
    }

    return {
      label,
      date: dUtc.getUTCDate(),
      month: dUtc.toLocaleString("default", { month: "short" }),
      weekday: dUtc.toLocaleString("default", { weekday: "long" }),
      dateObj: dUtc,
      offsetFromToday: finalOffset,
    };
  }, [isEmployee, hubData, currentTime, selectedDateOverride]);

  const isSessionAvailable = (dateObj, session) => {
    if (!dateObj) return false;
    const key = dateToKeyUTC(dateObj);
    const availableSessions = availability[key] || new Set();

    // Check if menu has this session
    if (!availableSessions.has(session)) {
      return false;
    }

    // For instant mode and today's date, we don't disable based on cutoff
    // The actual order validation will happen when adding to cart
    return true;
  };

  const sessionsForDate = (dateObj) => {
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
  };

  useEffect(() => {
    if (!hubData || loading || hasInitialized) return;
    if (!displayDate?.dateObj) return;

    const sessions = sessionsForDate(displayDate.dateObj);
    console.log("Available sessions for", displayDate.label, ":", [
      ...sessions,
    ]);

    let sessionToSelect = null;
    if (sessions.has("Breakfast")) {
      sessionToSelect = "Breakfast";
    } else if (sessions.has("Lunch")) {
      sessionToSelect = "Lunch";
    } else if (sessions.has("Dinner")) {
      sessionToSelect = "Dinner";
    }

    if (sessionToSelect) {
      const currentDateKey = currentDate ? dateToKeyUTC(currentDate) : null;
      const displayDateKey = dateToKeyUTC(displayDate.dateObj);

      if (
        currentDateKey !== displayDateKey ||
        currentSession !== sessionToSelect
      ) {
        console.log(
          "Auto-selecting:",
          displayDate.dateObj.toLocaleDateString(),
          sessionToSelect,
        );
        onChange(displayDate.dateObj, sessionToSelect);
      }
      setHasInitialized(true);
    }
  }, [
    hubData,
    loading,
    displayDate,
    menuData,
    hasInitialized,
    currentDate,
    currentSession,
    onChange,
  ]);

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

  const orderModeInfo = getOrderModeInfo();

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

  const cardBackground =
    hubData?.orderMode === "instant"
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : Colors.greenCardamom;

  return (
    <div className="date-session-wrapper">
      {/* Order Mode Badge */}
      {/* <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '12px' 
      }}>
        <span style={{
          background: hubData?.orderMode === 'instant' ? '#667eea' : '#f093fb',
          color: 'white',
          padding: '4px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {orderModeInfo.badge} • {orderModeInfo.description}
        </span>
      </div> */}

      {/* <div className="single-date-container" style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
        <div 
          className="date-card active"
          style={{
            minWidth: "140px",
            textAlign: "center",
            padding: "14px 28px",
            borderRadius: "16px",
            background: cardBackground,
            color: Colors.appForeground,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <div className="day" style={{ fontSize: "14px", opacity: 0.9, fontWeight: 500 }}>
            {displayDate.label}
          </div>
          <div className="date" style={{ fontSize: "28px", fontWeight: "bold", lineHeight: 1.2 }}>
            {`${displayDate.date} ${displayDate.month}`}
          </div>
          <div className="weekday" style={{ fontSize: "14px", opacity: 0.9 }}>
            {displayDate.weekday}
          </div>
        </div>
      </div> */}

      <div className="session-container">
        {sessionOrder.map((session) => {
          const Icon = getSessionIcon(session);
          const isActive = currentSession === session;
          const isDisabled = isSessionDisabled(session);
          const timeRange = getTimeRange(session);

          return (
            <div
              key={session}
              className={`session-card ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
              onClick={() => !isDisabled && handleSessionClick(session)}
              title={isDisabled ? "Not available for this date" : ""}
              style={{
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.5 : 1,
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
