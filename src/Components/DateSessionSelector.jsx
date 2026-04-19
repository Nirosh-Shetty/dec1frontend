// import React, { useRef, useMemo, useEffect, useState } from "react";
// import "../Styles/DateSessionSelector.css";
// import { FiInfo } from "react-icons/fi";
// import { Colors } from "../Helper/themes.jsx";
// import { BsClock } from "react-icons/bs";

// /*
//   Changes:
//   - Use UTC-based YYYY-MM-DD keys for both menu items and date list
//   - Add a fallback ISO-key mapping and a debug log for availability
// */

// const getNextSevenDays = () => {
//   const result = [];
//   const now = new Date(); // Browser time (Dec 30 00:28)

//   for (let i = 0; i < 3; i++) {
//     // This ensures if my laptop says 30th, the key is generated for 30th.
//     const dUtc = new Date(
//       Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + i),
//     );

//     result.push({
//       label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : null,
//       date: dUtc.getUTCDate(), // This will now be 30, 31, 1...
//       month: dUtc.toLocaleString("default", { month: "short" }),
//       weekday: dUtc.toLocaleString("default", { weekday: "long" }),
//       dateObj: dUtc,
//     });
//   }
//   return result;
// };

// // create YYYY-MM-DD from a Date using UTC components (stable)
// const dateToKeyUTC = (date) => {
//   const y = date.getUTCFullYear();
//   const m = String(date.getUTCMonth() + 1).padStart(2, "0");
//   const d = String(date.getUTCDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// };

// const DateSessionSelector = ({
//   onChange,
//   currentDate,
//   currentSession,
//   menuData = [],
// }) => {
//   const dates = getNextSevenDays();
//   const scrollRef = useRef(null);
//   const [canScrollLeft, setCanScrollLeft] = useState(false);
//   const [canScrollRight, setCanScrollRight] = useState(false);

//   // Build availability map YYYY-MM-DD (UTC) -> Set(session)
//   const availability = useMemo(() => {
//     const map = {};
//     (menuData || []).forEach((item) => {
//       if (!item?.deliveryDate || !item?.session) return;
//       const d = new Date(item.deliveryDate);
//       const keyUtc = dateToKeyUTC(d);
//       if (!map[keyUtc]) map[keyUtc] = new Set();
//       map[keyUtc].add(item.session);

//       // fallback: also map ISO slice key if backend or other parts use that
//       const isoKey = new Date(item.deliveryDate).toISOString().slice(0, 10);
//       if (!map[isoKey]) map[isoKey] = new Set();
//       map[isoKey].add(item.session);
//     });

//     // debug: inspect availability during dev
//     // eslint-disable-next-line no-console
//     console.debug("DateSessionSelector availability map:", map);
//     return map;
//   }, [menuData]);

//   const now = () => new Date();

//   const isSessionTimeBlocked = (dateObj, session) => {
//     // Only block for today's date based on local time cutoffs
//     const todayUtcKey = dateToKeyUTC(now());
//     const key = dateToKeyUTC(dateObj);
//     if (key !== todayUtcKey) return false;
//     const hr = now().getHours();
//     const min = now().getMinutes();
//     if (session === "Lunch" && (hr > 10 || (hr === 10 && min >= 0)))
//       return true; // block Lunch after 10:00am
//     if (session === "Dinner" && (hr > 17 || (hr === 17 && min >= 0)))
//       return true; // block Dinner after 5:00pm
//     return false;
//   };

//   const sessionsForDate = (dateObj) => {
//     if (!dateObj) return new Set();
//     const key = dateToKeyUTC(dateObj);
//     const base = availability[key] || new Set();
//     const result = new Set(base);
//     if (isSessionTimeBlocked(dateObj, "Lunch") && result.has("Lunch"))
//       result.delete("Lunch");
//     if (isSessionTimeBlocked(dateObj, "Dinner") && result.has("Dinner"))
//       result.delete("Dinner");
//     return result;
//   };

//   // Find nearest available session/date starting from given date (inclusive)
//   const findNextAvailable = (startDateObj, preferredSession = null) => {
//     const startKey = dateToKeyUTC(startDateObj);
//     const startIndex = dates.findIndex(
//       (d) => dateToKeyUTC(d.dateObj) === startKey,
//     );
//     const from = startIndex >= 0 ? startIndex : 0;
//     for (let offset = 0; offset < dates.length; offset++) {
//       const idx = from + offset;
//       if (idx >= dates.length) break;
//       const dobj = dates[idx].dateObj;
//       const sessions = sessionsForDate(dobj);
//       if (sessions.size === 0) continue;
//       if (preferredSession && sessions.has(preferredSession))
//         return { dateObj: dobj, session: preferredSession };
//       if (sessions.has("Lunch")) return { dateObj: dobj, session: "Lunch" };
//       if (sessions.has("Dinner")) return { dateObj: dobj, session: "Dinner" };
//     }
//     return null;
//   };

//   // Auto-switch when current session becomes unavailable - pick nearest available slot (today..+6)
//   useEffect(() => {
//     if (!currentDate || !currentSession) return;
//     const available = sessionsForDate(currentDate);
//     if (available.size === 0 || !available.has(currentSession)) {
//       const next = findNextAvailable(currentDate);
//       if (next) onChange(next.dateObj, next.session);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentDate, currentSession, menuData]);

//   const handleDateClick = (dateObj) => {
//     const sessions = sessionsForDate(dateObj);
//     if (!sessions || sessions.size === 0) return;
//     const sessionToUse =
//       currentSession && sessions.has(currentSession)
//         ? currentSession
//         : sessions.has("Lunch")
//           ? "Lunch"
//           : "Dinner";
//     onChange(dateObj, sessionToUse);
//   };

//   const handleSessionClick = (session) => {
//     if (!currentDate) return;
//     const sessions = sessionsForDate(currentDate);
//     if (!sessions.has(session)) return;
//     onChange(currentDate, session);
//   };

//   // --- scroll state handling
//   const updateScrollState = () => {
//     const el = scrollRef.current;
//     if (!el) {
//       setCanScrollLeft(false);
//       setCanScrollRight(false);
//       return;
//     }
//     const { scrollLeft, scrollWidth, clientWidth } = el;
//     setCanScrollLeft(scrollLeft > 5);
//     setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
//   };

//   useEffect(() => {
//     updateScrollState();
//     const el = scrollRef.current;
//     if (!el) return;
//     const onScroll = () => updateScrollState();
//     el.addEventListener("scroll", onScroll, { passive: true });
//     window.addEventListener("resize", updateScrollState);
//     return () => {
//       el.removeEventListener("scroll", onScroll);
//       window.removeEventListener("resize", updateScrollState);
//     };
//   }, [menuData, dates.length]);

//   const scrollLeft = () => {
//     if (!canScrollLeft) return;
//     scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
//     setTimeout(updateScrollState, 220);
//   };
//   const scrollRight = () => {
//     if (!canScrollRight) return;
//     scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
//     setTimeout(updateScrollState, 220);
//   };

//   const handleReset = () => {
//     const next = getNextSevenDays();
//     onChange(next[0].dateObj, "Lunch");
//   };

//   // info modal state
//   const [showInfoModal, setShowInfoModal] = useState(false);
//   const toggleInfoModal = () => setShowInfoModal((s) => !s);

//   // JS fallback sticky for session buttons: compute offsets and toggle fixed positioning
//   const sessionRef = useRef(null);
//   const [isFixedSession, setIsFixedSession] = useState(false);
//   const [sessionRect, setSessionRect] = useState({
//     top: 0,
//     left: 0,
//     width: 0,
//     height: 0,
//   });

//   useEffect(() => {
//     const compute = () => {
//       if (sessionRef.current) {
//         const r = sessionRef.current.getBoundingClientRect();
//         setSessionRect({
//           top: r.top + window.scrollY,
//           left: r.left,
//           width: r.width,
//           height: r.height,
//         });
//       }
//     };

//     compute();
//     window.addEventListener("resize", compute);
//     return () => window.removeEventListener("resize", compute);
//   }, []);

//   useEffect(() => {
//     const onScroll = () => {
//       if (sessionRect.top === 0) return;
//       const scrolled = window.scrollY || window.pageYOffset;
//       setIsFixedSession(scrolled >= sessionRect.top);
//     };
//     window.addEventListener("scroll", onScroll, { passive: true });
//     // initial check
//     onScroll();
//     return () => window.removeEventListener("scroll", onScroll);
//   }, [sessionRect]);

//   return (
//     <div className="date-session-wrapper">
//       {/* <div className="reset-line">
//         <span className="reset-btn" onClick={handleReset}>
//           Reset to now
//           <img src="/Assets/reset_to_now.svg" alt="reset now"></img>
//         </span>
//       </div> */}
//       {/* Centered banner like the reference image */}

//       {/* <div
//         className="info-banner1"
//         role="button"
//         tabIndex={0}
//         onClick={toggleInfoModal}
//         onKeyDown={(e) => e.key === "Enter" && toggleInfoModal()}
//         style={{ color: Colors.greenCardamom }}
//       >
//         <span className="info-banner-text">Secret behind our pricing</span>
//         <button
//           className="info-banner-icon"
//           aria-label="more info"
//           onClick={(e) => {
//             e.stopPropagation();
//             toggleInfoModal();
//           }}
//           style={{
//             // background: Colors.greenCardamom,
//             color: Colors.greenCardamom,
//           }}
//         >
//           <FiInfo size={20} />
//         </button>
//       </div> */}

//       {/* Flat Delivery Charge Section */}

//       {/* <div className="flat-delivery-wrapper d-flex  align-center flex-column gap-0">
//         <p className="flat-delivery-text">
//           • Category-leading <span className="del-price">₹9</span> flat
//           delivery.
//         </p>
//         <p className="sub-heading" style={{ marginTop: "0px" }}>
//           One price. <span>&nbsp;</span>
//           No surge.<span>&nbsp;</span>
//           No fluctuations.
//         </p>
//       </div> */}



//       {/* Secret Behind Pricing */}
//       <div
//         className="info-banner1"
//         role="button"
//         tabIndex={0}
//         onClick={toggleInfoModal}
//         onKeyDown={(e) => e.key === "Enter" && toggleInfoModal()}
//         style={{ color: Colors.greenCardamom }}
//       >
//         <span className="info-banner-text">Secret behind our pricing</span>

//         <button
//           className="info-banner-icon"
//           aria-label="more info"
//           onClick={(e) => {
//             e.stopPropagation();
//             toggleInfoModal();
//           }}
//           style={{
//             color: Colors.greenCardamom,
//           }}
//         >
//           <FiInfo size={20} />
//         </button>
//       </div>
//       {isFixedSession && (
//         <div style={{ height: sessionRect.height }} aria-hidden />
//       )}

//       <div
//         ref={sessionRef}
//         style={
//           isFixedSession
//             ? {
//                 position: "fixed",
//                 top: 0,
//                 left: `${sessionRect.left}px`,
//                 width: `${sessionRect.width}px`,
//                 zIndex: 1100,
//                 background: "inherit",
//               }
//             : undefined
//         }
//       >
//         <div className="date-header">
//           <button
//             className={`nav-btn ${!canScrollLeft ? "disabled" : ""}`}
//             onClick={scrollLeft}
//             disabled={!canScrollLeft}
//             aria-label="scroll-left"
//           >
//             <img
//               src="/Assets/arrowCircleBrown.svg"
//               style={{ transform: "rotate(180deg)" }}
//               alt="prev"
//             />
//           </button>

//           <div className="date-strip" ref={scrollRef}>
//             {dates.map((d, i) => {
//               const sessions = sessionsForDate(d.dateObj);
//               const isDisabled = sessions.size === 0;
//               const active =
//                 currentDate &&
//                 dateToKeyUTC(d.dateObj) === dateToKeyUTC(currentDate);
//               return (
//                 <div
//                   key={i}
//                   className={`date-card ${active ? "active" : ""} ${
//                     isDisabled ? "disabled" : ""
//                   }`}
//                   onClick={() => !isDisabled && handleDateClick(d.dateObj)}
//                 >
//                   <div className="day">{d.label}</div>
//                   <div className="date">{`${d.date} ${d.month}`}</div>
//                   <div className="weekday">{d.weekday}</div>
//                 </div>
//               );
//             })}
//           </div>

//           {showInfoModal && (
//             <div className="info-modal" role="dialog" aria-modal="true">
//               <div className="info-modal-backdrop" onClick={toggleInfoModal} />
//               <div className="info-modal-content">
//                 <div className="info-modal-card">
//                   <div className="info-modal-card-header">
//                     <h3 style={{ margin: 0, color: Colors.greenCardamom }}>
//                       Secret behind our pricing
//                     </h3>
//                     {/* <button
//                       className="info-modal-close-small mb-4"
//                       aria-label="close small"
//                       onClick={toggleInfoModal}
//                     >
//                       ×
//                     </button> */}
//                   </div>

//                   <div className="info-list">
//                     <div className="info-item">
//                       <div className="info-item-title">Cook-to-order model</div>
//                       <div className="info-item-desc">
//                         Meals are prepared only after confirmation, zero food
//                         wastage, no excess inventory
//                       </div>
//                     </div>
//                     <div className="info-item">
//                       <div className="info-item-title">
//                         Route-based delivery
//                       </div>
//                       <div className="info-item-desc">
//                         Orders are grouped by location and delivered in
//                         optimized routes, lowering delivery cost per order
//                       </div>
//                     </div>
//                     <div className="info-item">
//                       <div className="info-item-title">Direct kitchens</div>
//                       <div className="info-item-desc">
//                         We manage cooking and delivery end-to-end without
//                         intermediaries.
//                       </div>
//                     </div>
//                   </div>

//                   <div className="info-modal-actions">
//                     <button
//                       className="info-modal-ok"
//                       onClick={toggleInfoModal}
//                       style={{
//                         background: Colors.greenCardamom,
//                         color: Colors.appForeground,
//                       }}
//                     >
//                       OK
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <button
//             className={`nav-btn ${!canScrollRight ? "disabled" : ""}`}
//             onClick={scrollRight}
//             disabled={!canScrollRight}
//             aria-label="scroll-right"
//           >
//             <img src="/Assets/arrowCircleBrown.svg" alt="next" />
//           </button>
//         </div>

//         {/* spacer inserted when session becomes fixed to avoid layout jump */}

//         {/* {isFixedSession && (
//         <div style={{ height: sessionRect.height }} aria-hidden />
//       )} */}

//         <div className="session-container">
//           <div></div>
//           <div
//             className={`session-btn-wrapper ${
//               currentSession === "Lunch" ? "active" : ""
//             } ${
//               currentDate && !sessionsForDate(currentDate).has("Lunch")
//                 ? "disabled"
//                 : ""
//             }`}
//           >
//             <button
//               className={`session ${currentSession === "Lunch" ? "active" : ""} ${
//                 currentDate && !sessionsForDate(currentDate).has("Lunch")
//                   ? "disabled"
//                   : ""
//               }`}
//               onClick={() => handleSessionClick("Lunch")}
//               disabled={
//                 currentDate && !sessionsForDate(currentDate).has("Lunch")
//               }
//             >
//               <div className="title">Lunch</div>
//               <div
//                 className={`mb-1 subtext ${
//                   currentSession === "Lunch" ? "active" : ""
//                 }`}
//               >
//                 Confirm before 10AM
//               </div>
//               <div
//                 className={`subtext2 ${
//                   currentSession === "Lunch" ? "active" : "inactivebtn"
//                 }`}
//               >
//                 Delivered by 01:00PM
//               </div>
//             </button>
//           </div>

//           <div
//             className={`session-btn-wrapper ${
//               currentSession === "Dinner" ? "active" : ""
//             } ${
//               currentDate && !sessionsForDate(currentDate).has("Dinner")
//                 ? "disabled"
//                 : ""
//             }`}
//           >
//             <button
//               className={` session ${
//                 currentSession === "Dinner" ? "active" : ""
//               } ${
//                 currentDate && !sessionsForDate(currentDate).has("Dinner")
//                   ? "disabled"
//                   : ""
//               }`}
//               onClick={() => handleSessionClick("Dinner")}
//               disabled={
//                 currentDate && !sessionsForDate(currentDate).has("Dinner")
//               }
//             >
//               <div className="title">Dinner</div>
//               <div
//                 className={`mb-1 subtext ${
//                   currentSession === "Dinner" ? "active" : ""
//                 }`}
//               >
//                 Confirm before 5PM
//               </div>
//               <div
//                 className={`mt-2 subtext2 ${
//                   currentSession === "Dinner" ? "active" : "inactivebtn"
//                 }`}
//               >
//                 Delivered by 08:00PM
//               </div>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DateSessionSelector;




































// import React, { useRef, useMemo, useEffect, useState } from "react";
// import "../Styles/DateSessionSelector.css";
// import { FiInfo } from "react-icons/fi";
// import { Colors } from "../Helper/themes.jsx";
// import { BsClock } from "react-icons/bs";
// import axios from "axios";

// /*
//   Changes:
//   - Added dynamic cutoff times from hub
//   - Display hub-specific cutoff times for each session
//   - Fetch cutoff times when hub changes
//   - FIXED: Use user.status instead of acquisition_channel to identify employees
//   - FIXED: Properly disable dates/sessions when cutoff time has passed
//   - FIXED: Handle undefined cutoff times gracefully
// */

// const getNextSevenDays = () => {
//   const result = [];
//   const now = new Date();

//   // Limit to 3 days: Today, Tomorrow, and one more day
//   for (let i = 0; i < 1; i++) {
//     const dUtc = new Date(
//       Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + i),
//     );

//     result.push({
//       label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : null,
//       date: dUtc.getUTCDate(),
//       month: dUtc.toLocaleString("default", { month: "short" }),
//       weekday: dUtc.toLocaleString("default", { weekday: "long" }),
//       dateObj: dUtc,
//     });
//   }
//   return result;
// };

// // create YYYY-MM-DD from a Date using UTC components (stable)
// const dateToKeyUTC = (date) => {
//   const y = date.getUTCFullYear();
//   const m = String(date.getUTCMonth() + 1).padStart(2, "0");
//   const d = String(date.getUTCDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// };

// const DateSessionSelector = ({
//   onChange,
//   currentDate,
//   currentSession,
//   menuData = [],
// }) => {
//   const dates = getNextSevenDays();
//   const scrollRef = useRef(null);
//   const [canScrollLeft, setCanScrollLeft] = useState(false);
//   const [canScrollRight, setCanScrollRight] = useState(false);
  
//   // State for dynamic cutoff times - Initialize with default values
//   // For regular users: cutoff is 11:59 PM previous day (shown as "00:00" = midnight)
//   // For employees: cutoff is 10:00 AM / 5:00 PM same day
//   const [cutoffTimes, setCutoffTimes] = useState({
//     lunch: { 
//       cutoffTime: "00:00", // Midnight = previous day cutoff
//       formattedCutoff: "11:59 PM (Previous Day)",
//       deliveryTime: "01:00 PM (Next Day)", 
//       isEmployeeCutoff: false,
//       rawCutoff: "00:00"
//     },
//     dinner: { 
//       cutoffTime: "00:00", // Midnight = previous day cutoff
//       formattedCutoff: "11:59 PM (Previous Day)",
//       deliveryTime: "08:00 PM (Next Day)", 
//       isEmployeeCutoff: false,
//       rawCutoff: "00:00"
//     }
//   });
//   const [cutoffLoading, setCutoffLoading] = useState(true);
//   const [currentHubId, setCurrentHubId] = useState(null);

//   // Get user from localStorage and check status
//   const getUser = () => {
//     try {
//       return JSON.parse(localStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   };
  
//   const user = getUser();
//   const isEmployee = user?.status === "Employee";

//   // Fetch hub cutoff times
//   const fetchHubCutoffTimes = async (hubId) => {
//     if (!hubId) {
//       setCutoffLoading(false);
//       return;
//     }
    
//     try {
//       setCutoffLoading(true);
//       const response = await axios.get(`https://dd-backend-3nm0.onrender.com/api/Hub/get-cutoff-times/${hubId}`);
      
//       if (response.status === 200 && response.data.cutoffTimes) {
//         const hubCutoff = response.data.cutoffTimes;
        
//         const lunchCutoff = isEmployee 
//           ? hubCutoff.lunch?.employeeCutoff || "10:00"
//           : hubCutoff.lunch?.defaultCutoff || "00:00";
        
//         const dinnerCutoff = isEmployee
//           ? hubCutoff.dinner?.employeeCutoff || "17:00"
//           : hubCutoff.dinner?.defaultCutoff || "00:00";
        
//         const formatCutoffTime = (timeStr) => {
//           if (!timeStr || timeStr === "00:00") return "Midnight";
//           const [hours, minutes] = timeStr.split(':');
//           const hour = parseInt(hours);
//           const ampm = hour >= 12 ? 'PM' : 'AM';
//           const displayHour = hour % 12 || 12;
//           return `${displayHour}:${minutes} ${ampm}`;
//         };
        
//         const getDeliveryTime = (cutoffTime, session) => {
//           if (isEmployee) {
//             if (session === 'lunch') return "01:00 PM";
//             return "08:00 PM";
//           } else {
//             if (cutoffTime === "00:00") {
//               return session === 'lunch' ? "01:00 PM (Next Day)" : "08:00 PM (Next Day)";
//             }
//             return session === 'lunch' ? "01:00 PM" : "08:00 PM";
//           }
//         };
        
//         setCutoffTimes({
//           lunch: {
//             cutoffTime: lunchCutoff,
//             formattedCutoff: formatCutoffTime(lunchCutoff),
//             deliveryTime: getDeliveryTime(lunchCutoff, 'lunch'),
//             isEmployeeCutoff: isEmployee,
//             rawCutoff: lunchCutoff
//           },
//           dinner: {
//             cutoffTime: dinnerCutoff,
//             formattedCutoff: formatCutoffTime(dinnerCutoff),
//             deliveryTime: getDeliveryTime(dinnerCutoff, 'dinner'),
//             isEmployeeCutoff: isEmployee,
//             rawCutoff: dinnerCutoff
//           }
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching hub cutoff times:", error);
//       // Keep default values
//     } finally {
//       setCutoffLoading(false);
//     }
//   };

//   // Get hub ID from address
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

//   // Watch for hub ID changes and fetch cutoff times
//   useEffect(() => {
//     const hubId = getHubIdFromAddress();
//     if (hubId && hubId !== currentHubId) {
//       setCurrentHubId(hubId);
//       fetchHubCutoffTimes(hubId);
//     } else if (!hubId) {
//       setCutoffLoading(false);
//     }
//   }, [currentHubId, isEmployee]);

//   // Also listen for location changes
//   useEffect(() => {
//     const handleLocationChange = () => {
//       const hubId = getHubIdFromAddress();
//       if (hubId) {
//         setCurrentHubId(hubId);
//         fetchHubCutoffTimes(hubId);
//       }
//     };
    
//     window.addEventListener("locationUpdated", handleLocationChange);
//     window.addEventListener("addressUpdated", handleLocationChange);
//     window.addEventListener("storage", handleLocationChange);
    
//     return () => {
//       window.removeEventListener("locationUpdated", handleLocationChange);
//       window.removeEventListener("addressUpdated", handleLocationChange);
//       window.removeEventListener("storage", handleLocationChange);
//     };
//   }, []);

//   // Build availability map YYYY-MM-DD (UTC) -> Set(session)
//   const availability = useMemo(() => {
//     const map = {};
//     (menuData || []).forEach((item) => {
//       if (!item?.deliveryDate || !item?.session) return;
//       const d = new Date(item.deliveryDate);
//       const keyUtc = dateToKeyUTC(d);
//       if (!map[keyUtc]) map[keyUtc] = new Set();
//       map[keyUtc].add(item.session);

//       const isoKey = new Date(item.deliveryDate).toISOString().slice(0, 10);
//       if (!map[isoKey]) map[isoKey] = new Set();
//       map[isoKey].add(item.session);
//     });

//     return map;
//   }, [menuData]);

//   const now = () => new Date();

//   // FIXED: Check if a session is available for a given date (considering menu availability AND cutoff time)
//   const isSessionAvailable = (dateObj, session) => {
//     // First check if menu has this session on this date
//     const key = dateToKeyUTC(dateObj);
//     const availableSessions = availability[key] || new Set();
    
//     if (!availableSessions.has(session)) {
//       return false;
//     }
    
//     // For REGULAR USERS: cutoff is 11:59 PM PREVIOUS DAY
//     // This means: no same-day orders allowed, minimum tomorrow
//     if (!isEmployee) {
//       const todayUtcKey = dateToKeyUTC(now());
//       const keyToCheck = dateToKeyUTC(dateObj);
      
//       // TODAY is never available (cutoff was yesterday)
//       if (keyToCheck === todayUtcKey) {
//         return false;
//       }
      
//       // TOMORROW+ is available (menu permitting)
//       return true;
//     }
    
//     // For EMPLOYEES: can order same day until cutoff time (10 AM / 5 PM)
//     const todayUtcKey = dateToKeyUTC(now());
//     const keyToCheck = dateToKeyUTC(dateObj);
    
//     if (keyToCheck !== todayUtcKey) {
//       // Future dates are always available (menu permitting)
//       return true;
//     }
    
//     // For today, check employee cutoff time
//     const nowDate = now();
//     const currentHour = nowDate.getHours();
//     const currentMinute = nowDate.getMinutes();
//     const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
//     // Safely get cutoff config with fallback
//     const cutoffConfig = session === "Lunch" ? cutoffTimes?.lunch : cutoffTimes?.dinner;
//     if (!cutoffConfig) return false;
    
//     const cutoffTimeStr = cutoffConfig.rawCutoff;
    
//     const [cutoffHour, cutoffMinute] = cutoffTimeStr.split(':').map(Number);
//     const cutoffTimeInMinutes = cutoffHour * 60 + cutoffMinute;
    
//     // Session is available only if current time is BEFORE cutoff
//     return currentTimeInMinutes < cutoffTimeInMinutes;
//   };

//   // FIXED: Get all available sessions for a date (menu availability minus cutoff restrictions)
//   const sessionsForDate = (dateObj) => {
//     if (!dateObj) return new Set();
//     const key = dateToKeyUTC(dateObj);
//     const menuSessions = availability[key] || new Set();
//     const result = new Set();
    
//     // Only include sessions that are actually available (menu has them AND cutoff hasn't passed)
//     menuSessions.forEach(session => {
//       if (isSessionAvailable(dateObj, session)) {
//         result.add(session);
//       }
//     });
    
//     return result;
//   };

//   // FIXED: Check if a date has ANY available sessions
//   const isDateAvailable = (dateObj) => {
//     return sessionsForDate(dateObj).size > 0;
//   };

//   // Find nearest available session/date starting from given date (inclusive)
//   const findNextAvailable = (startDateObj, preferredSession = null) => {
//     const startKey = dateToKeyUTC(startDateObj);
//     const startIndex = dates.findIndex(
//       (d) => dateToKeyUTC(d.dateObj) === startKey,
//     );
//     const from = startIndex >= 0 ? startIndex : 0;
    
//     for (let offset = 0; offset < dates.length; offset++) {
//       const idx = from + offset;
//       if (idx >= dates.length) break;
//       const dobj = dates[idx].dateObj;
//       const sessions = sessionsForDate(dobj);
//       if (sessions.size === 0) continue;
      
//       if (preferredSession && sessions.has(preferredSession)) {
//         return { dateObj: dobj, session: preferredSession };
//       }
//       if (sessions.has("Lunch")) return { dateObj: dobj, session: "Lunch" };
//       if (sessions.has("Dinner")) return { dateObj: dobj, session: "Dinner" };
//     }
//     return null;
//   };

//   // Auto-switch when current session becomes unavailable
//   useEffect(() => {
//     if (!currentDate || !currentSession) return;
//     const available = sessionsForDate(currentDate);
//     if (available.size === 0 || !available.has(currentSession)) {
//       const next = findNextAvailable(currentDate, currentSession);
//       if (next) {
//         onChange(next.dateObj, next.session);
//       }
//     }
//   }, [currentDate, currentSession, menuData, cutoffTimes]);

//   const handleDateClick = (dateObj) => {
//     const sessions = sessionsForDate(dateObj);
//     if (!sessions || sessions.size === 0) return;
    
//     const sessionToUse =
//       currentSession && sessions.has(currentSession)
//         ? currentSession
//         : sessions.has("Lunch")
//           ? "Lunch"
//           : "Dinner";
//     onChange(dateObj, sessionToUse);
//   };

//   const handleSessionClick = (session) => {
//     if (!currentDate) return;
//     const sessions = sessionsForDate(currentDate);
//     if (!sessions.has(session)) return;
//     onChange(currentDate, session);
//   };

//   // --- scroll state handling
//   const updateScrollState = () => {
//     const el = scrollRef.current;
//     if (!el) {
//       setCanScrollLeft(false);
//       setCanScrollRight(false);
//       return;
//     }
//     const { scrollLeft, scrollWidth, clientWidth } = el;
//     setCanScrollLeft(scrollLeft > 5);
//     setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
//   };

//   useEffect(() => {
//     updateScrollState();
//     const el = scrollRef.current;
//     if (!el) return;
//     const onScroll = () => updateScrollState();
//     el.addEventListener("scroll", onScroll, { passive: true });
//     window.addEventListener("resize", updateScrollState);
//     return () => {
//       el.removeEventListener("scroll", onScroll);
//       window.removeEventListener("resize", updateScrollState);
//     };
//   }, [menuData, dates.length]);

//   const scrollLeft = () => {
//     if (!canScrollLeft) return;
//     scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
//     setTimeout(updateScrollState, 220);
//   };
//   const scrollRight = () => {
//     if (!canScrollRight) return;
//     scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
//     setTimeout(updateScrollState, 220);
//   };

//   // info modal state
//   const [showInfoModal, setShowInfoModal] = useState(false);
//   const toggleInfoModal = () => setShowInfoModal((s) => !s);

//   // JS fallback sticky for session buttons
//   const sessionRef = useRef(null);
//   const [isFixedSession, setIsFixedSession] = useState(false);
//   const [sessionRect, setSessionRect] = useState({
//     top: 0,
//     left: 0,
//     width: 0,
//     height: 0,
//   });

//   useEffect(() => {
//     const compute = () => {
//       if (sessionRef.current) {
//         const r = sessionRef.current.getBoundingClientRect();
//         setSessionRect({
//           top: r.top + window.scrollY,
//           left: r.left,
//           width: r.width,
//           height: r.height,
//         });
//       }
//     };

//     compute();
//     window.addEventListener("resize", compute);
//     return () => window.removeEventListener("resize", compute);
//   }, []);

//   useEffect(() => {
//     const onScroll = () => {
//       if (sessionRect.top === 0) return;
//       const scrolled = window.scrollY || window.pageYOffset;
//       setIsFixedSession(scrolled >= sessionRect.top);
//     };
//     window.addEventListener("scroll", onScroll, { passive: true });
//     onScroll();
//     return () => window.removeEventListener("scroll", onScroll);
//   }, [sessionRect]);

//   // Get cutoff description text - FIXED with safety checks
//   const getCutoffDescription = (session) => {
//     const cutoff = session === "Lunch" ? cutoffTimes?.lunch : cutoffTimes?.dinner;
    
//     if (isEmployee) {
//       // Employees: same-day ordering until cutoff time
//       const defaultTime = session === "Lunch" ? "10:00 AM" : "05:00 PM";
//       return cutoff ? `Confirm by ${cutoff.formattedCutoff}` : `Confirm before ${defaultTime}`;
//     } else {
//       // Regular users: must pre-order by 11:59 PM previous day
//       return "Pre-order by 11:59 PM (Previous Day)";
//     }
//   };

//   // Get delivery description - FIXED with safety checks
//   const getDeliveryDescription = (session) => {
//     if (isEmployee) {
//       // Employees: same-day delivery
//       return session === "Lunch" ? "Delivered by 01:00 PM" : "Delivered by 08:00 PM";
//     } else {
//       // Regular users: next-day delivery (pre-order from previous day)
//       return session === "Lunch" ? "Delivered by 01:00 PM (Next Day)" : "Delivered by 08:00 PM (Next Day)";
//     }
//   };

//   // FIXED: Get tooltip message for disabled session - with safety checks
//   const getDisabledTooltip = (session, dateObj) => {
//     if (!dateObj) return "";
    
//     const todayUtcKey = dateToKeyUTC(now());
//     const isToday = dateToKeyUTC(dateObj) === todayUtcKey;
    
//     // For regular users, today is always blocked (cutoff was yesterday)
//     if (!isEmployee && isToday) {
//       return "Orders must be placed by 11:59 PM the previous day";
//     }
    
//     if (!isToday) return "No sessions available for this date";
    
//     const cutoffConfig = session === "Lunch" ? cutoffTimes?.lunch : cutoffTimes?.dinner;
//     if (!cutoffConfig) return "Order cutoff has passed";
    
//     const cutoffTimeStr = cutoffConfig.rawCutoff;
    
//     if (cutoffTimeStr === "00:00") {
//       return `Order must be placed before midnight of previous day`;
//     }
    
//     const cutoffFormatted = cutoffConfig.formattedCutoff || "cutoff time";
//     return `Order cutoff was ${cutoffFormatted}. Next available: Tomorrow`;
//   };

//   return (
//     <div className="date-session-wrapper">
//       {/* Secret Behind Pricing */}
//       <div
//         className="info-banner1"
//         role="button"
//         tabIndex={0}
//         onClick={toggleInfoModal}
//         onKeyDown={(e) => e.key === "Enter" && toggleInfoModal()}
//         style={{ color: Colors.greenCardamom }}
//       >
//         <span className="info-banner-text">Secret behind our pricing</span>
//         <button
//           className="info-banner-icon"
//           aria-label="more info"
//           onClick={(e) => {
//             e.stopPropagation();
//             toggleInfoModal();
//           }}
//           style={{ color: Colors.greenCardamom }}
//         >
//           <FiInfo size={20} />
//         </button>
//       </div>

//       {isFixedSession && (
//         <div style={{ height: sessionRect.height }} aria-hidden="true" />
//       )}

//       <div
//         ref={sessionRef}
//         style={
//           isFixedSession
//             ? {
//                 position: "fixed",
//                 top: 0,
//                 left: `${sessionRect.left}px`,
//                 width: `${sessionRect.width}px`,
//                 zIndex: 1100,
//                 background: "inherit",
//               }
//             : undefined
//         }
//       >
//         <div className="date-header">
//           <button
//             className={`nav-btn ${!canScrollLeft ? "disabled" : ""}`}
//             onClick={scrollLeft}
//             disabled={!canScrollLeft}
//             aria-label="scroll-left"
//           >
//             <img
//               src="/Assets/arrowCircleBrown.svg"
//               style={{ transform: "rotate(180deg)" }}
//               alt="prev"
//             />
//           </button>

//           <div className="date-strip" ref={scrollRef}>
//             {dates.map((d, i) => {
//               const isDisabled = !isDateAvailable(d.dateObj);
//               const active =
//                 currentDate &&
//                 dateToKeyUTC(d.dateObj) === dateToKeyUTC(currentDate);
//               return (
//                 <div
//                   key={i}
//                   className={`date-card ${active ? "active" : ""} ${
//                     isDisabled ? "disabled" : ""
//                   }`}
//                   onClick={() => !isDisabled && handleDateClick(d.dateObj)}
//                   title={isDisabled ? "No sessions available for this date" : ""}
//                 >
//                   <div className="day">{d.label}</div>
//                   <div className="date">{`${d.date} ${d.month}`}</div>
//                   <div className="weekday">{d.weekday}</div>
//                 </div>
//               );
//             })}
//           </div>

//           {showInfoModal && (
//             <div className="info-modal" role="dialog" aria-modal="true">
//               <div className="info-modal-backdrop" onClick={toggleInfoModal} />
//               <div className="info-modal-content">
//                 <div className="info-modal-card">
//                   <div className="info-modal-card-header">
//                     <h3 style={{ margin: 0, color: Colors.greenCardamom }}>
//                       Secret behind our pricing
//                     </h3>
//                   </div>

//                   <div className="info-list">
//                     <div className="info-item">
//                       <div className="info-item-title">Cook-to-order model</div>
//                       <div className="info-item-desc">
//                         Meals are prepared only after confirmation, zero food
//                         wastage, no excess inventory
//                       </div>
//                     </div>
//                     <div className="info-item">
//                       <div className="info-item-title">
//                         Route-based delivery
//                       </div>
//                       <div className="info-item-desc">
//                         Orders are grouped by location and delivered in
//                         optimized routes, lowering delivery cost per order
//                       </div>
//                     </div>
//                     <div className="info-item">
//                       <div className="info-item-title">Direct kitchens</div>
//                       <div className="info-item-desc">
//                         We manage cooking and delivery end-to-end without
//                         intermediaries.
//                       </div>
//                     </div>
//                   </div>

//                   <div className="info-modal-actions">
//                     <button
//                       className="info-modal-ok"
//                       onClick={toggleInfoModal}
//                       style={{
//                         background: Colors.greenCardamom,
//                         color: Colors.appForeground,
//                       }}
//                     >
//                       OK
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <button
//             className={`nav-btn ${!canScrollRight ? "disabled" : ""}`}
//             onClick={scrollRight}
//             disabled={!canScrollRight}
//             aria-label="scroll-right"
//           >
//             <img src="/Assets/arrowCircleBrown.svg" alt="next" />
//           </button>
//         </div>

//         <div className="session-container">
//           <div></div>
//           <div
//             className={`session-btn-wrapper ${
//               currentSession === "Lunch" ? "active" : ""
//             } ${
//               currentDate && !sessionsForDate(currentDate).has("Lunch")
//                 ? "disabled"
//                 : ""
//             }`}
//             title={currentDate && !sessionsForDate(currentDate).has("Lunch") ? getDisabledTooltip("Lunch", currentDate) : ""}
//           >
//             <button
//               className={`session ${currentSession === "Lunch" ? "active" : ""} ${
//                 currentDate && !sessionsForDate(currentDate).has("Lunch")
//                   ? "disabled"
//                   : ""
//               }`}
//               onClick={() => handleSessionClick("Lunch")}
//               disabled={
//                 currentDate && !sessionsForDate(currentDate).has("Lunch")
//               }
//             >
//               <div className="title">Lunch</div>
//               <div
//                 className={`mb-1 subtext ${
//                   currentSession === "Lunch" ? "active" : ""
//                 }`}
//               >
//                 {cutoffLoading ? "Loading..." : getCutoffDescription("Lunch")}
//               </div>
//               <div
//                 className={`subtext2 ${
//                   currentSession === "Lunch" ? "active" : "inactivebtn"
//                 }`}
//               >
//                 {cutoffLoading ? "..." : getDeliveryDescription("Lunch")}
//               </div>
//             </button>
//           </div>

//           <div
//             className={`session-btn-wrapper ${
//               currentSession === "Dinner" ? "active" : ""
//             } ${
//               currentDate && !sessionsForDate(currentDate).has("Dinner")
//                 ? "disabled"
//                 : ""
//             }`}
//             title={currentDate && !sessionsForDate(currentDate).has("Dinner") ? getDisabledTooltip("Dinner", currentDate) : ""}
//           >
//             <button
//               className={`session ${
//                 currentSession === "Dinner" ? "active" : ""
//               } ${
//                 currentDate && !sessionsForDate(currentDate).has("Dinner")
//                   ? "disabled"
//                   : ""
//               }`}
//               onClick={() => handleSessionClick("Dinner")}
//               disabled={
//                 currentDate && !sessionsForDate(currentDate).has("Dinner")
//               }
//             >
//               <div className="title">Dinner</div>
//               <div
//                 className={`mb-1 subtext ${
//                   currentSession === "Dinner" ? "active" : ""
//                 }`}
//               >
//                 {cutoffLoading ? "Loading..." : getCutoffDescription("Dinner")}
//               </div>
//               <div
//                 className={`mt-2 subtext2 ${
//                   currentSession === "Dinner" ? "active" : "inactivebtn"
//                 }`}
//               >
//                 {cutoffLoading ? "..." : getDeliveryDescription("Dinner")}
//               </div>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DateSessionSelector;


















































import React, { useRef, useMemo, useEffect, useState } from "react";
import "../Styles/DateSessionSelector.css";
import { FiInfo } from "react-icons/fi";
import { Colors } from "../Helper/themes.jsx";
import axios from "axios";

// Icons for sessions
import { WiDaySunny } from "react-icons/wi";
import { IoMoonOutline } from "react-icons/io5";

/*
  Simplified Version:
  - Employees: Only TODAY's date (auto-selected)
  - Normal Users: Only TOMORROW's date (auto-selected)
  - Single date card, no scrolling needed
  - Sessions: Breakfast, Lunch, Dinner with icons and time ranges
*/

const getSingleDate = (isEmployee) => {
  const now = new Date();
  
  // Employees get today, normal users get tomorrow
  const offset = isEmployee ? 0 : 1;
  
  const dUtc = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + offset),
  );

  const label = isEmployee ? "Today" : "Tomorrow";

  return {
    label: label,
    date: dUtc.getUTCDate(),
    month: dUtc.toLocaleString("default", { month: "short" }),
    weekday: dUtc.toLocaleString("default", { weekday: "long" }),
    dateObj: dUtc,
    offsetFromToday: offset,
  };
};

// create YYYY-MM-DD from a Date using UTC components (stable)
const dateToKeyUTC = (date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Session configuration with icons and time ranges
const sessionConfig = {
  Breakfast: {
    icon: WiDaySunny,
    timeRange: "7-8 AM",
    displayName: "Breakfast"
  },
  Lunch: {
    icon: WiDaySunny,
    timeRange: "12-1 PM",
    displayName: "Lunch"
  },
  Dinner: {
    icon: IoMoonOutline,
    timeRange: "7-8 PM",
    displayName: "Dinner"
  }
};

const DateSessionSelector = ({
  onChange,
  currentDate,
  currentSession,
  menuData = [],
}) => {
  // Get user from localStorage and check status
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };
  
  const user = getUser();
  const isEmployee = user?.status === "Employee";
  
  // Generate single date based on user type
  const singleDate = useMemo(() => getSingleDate(isEmployee), [isEmployee]);
  
  const [currentHubId, setCurrentHubId] = useState(null);

  // Session order for display and selection logic
  const sessionOrder = ["Breakfast", "Lunch", "Dinner"];

  // Get hub ID from address
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

  // Listen for location changes
  useEffect(() => {
    const handleLocationChange = () => {
      const hubId = getHubIdFromAddress();
      if (hubId) {
        setCurrentHubId(hubId);
      }
    };
    
    window.addEventListener("locationUpdated", handleLocationChange);
    window.addEventListener("addressUpdated", handleLocationChange);
    window.addEventListener("storage", handleLocationChange);
    
    return () => {
      window.removeEventListener("locationUpdated", handleLocationChange);
      window.removeEventListener("addressUpdated", handleLocationChange);
      window.removeEventListener("storage", handleLocationChange);
    };
  }, []);

  // Build availability map YYYY-MM-DD (UTC) -> Set(session)
  const availability = useMemo(() => {
    const map = {};
    (menuData || []).forEach((item) => {
      if (!item?.deliveryDate || !item?.session) return;
      const d = new Date(item.deliveryDate);
      const keyUtc = dateToKeyUTC(d);
      if (!map[keyUtc]) map[keyUtc] = new Set();
      map[keyUtc].add(item.session);

      const isoKey = new Date(item.deliveryDate).toISOString().slice(0, 10);
      if (!map[isoKey]) map[isoKey] = new Set();
      map[isoKey].add(item.session);
    });

    return map;
  }, [menuData]);

  // Check if a session is available for the date
  const isSessionAvailable = (dateObj, session) => {
    if (!dateObj) return false;
    
    // Check if menu has this session on this date
    const key = dateToKeyUTC(dateObj);
    const availableSessions = availability[key] || new Set();
    
    if (!availableSessions.has(session)) {
      return false;
    }
    
    return true;
  };

  // Get all available sessions for the date
  const sessionsForDate = (dateObj) => {
    if (!dateObj) return new Set();
    const key = dateToKeyUTC(dateObj);
    const menuSessions = availability[key] || new Set();
    const result = new Set();
    
    menuSessions.forEach(session => {
      if (isSessionAvailable(dateObj, session)) {
        result.add(session);
      }
    });
    
    return result;
  };

  // Auto-select default session on mount
  useEffect(() => {
    if (singleDate?.dateObj) {
      const sessions = sessionsForDate(singleDate.dateObj);
      
      // Determine which session to select (priority: Breakfast > Lunch > Dinner)
      let sessionToSelect = null;
      if (sessions.has("Breakfast")) {
        sessionToSelect = "Breakfast";
      } else if (sessions.has("Lunch")) {
        sessionToSelect = "Lunch";
      } else if (sessions.has("Dinner")) {
        sessionToSelect = "Dinner";
      }
      
      if (sessionToSelect) {
        // Only update if different from current
        if (!currentDate || dateToKeyUTC(currentDate) !== dateToKeyUTC(singleDate.dateObj)) {
          onChange(singleDate.dateObj, sessionToSelect);
        } else if (currentSession !== sessionToSelect && sessions.has(sessionToSelect)) {
          onChange(singleDate.dateObj, sessionToSelect);
        }
      }
    }
  }, [singleDate, menuData]);

  const handleSessionClick = (session) => {
    if (!singleDate?.dateObj) return;
    const sessions = sessionsForDate(singleDate.dateObj);
    if (!sessions.has(session)) return;
    onChange(singleDate.dateObj, session);
  };

  // Info modal state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const toggleInfoModal = () => setShowInfoModal((s) => !s);

  // Check if session is disabled
  const isSessionDisabled = (session) => {
    if (!singleDate?.dateObj) return true;
    return !sessionsForDate(singleDate.dateObj).has(session);
  };

  // Get icon for session
  const getSessionIcon = (session) => {
    return sessionConfig[session]?.icon;
  };

  // Get time range for session
  const getTimeRange = (session) => {
    return sessionConfig[session]?.timeRange || "";
  };

  return (
    <div className="date-session-wrapper">
      {/* Secret Behind Pricing */}
      {/* <div
        className="info-banner1"
        role="button"
        tabIndex={0}
        onClick={toggleInfoModal}
        onKeyDown={(e) => e.key === "Enter" && toggleInfoModal()}
        style={{ color: Colors.greenCardamom }}
      >
        <span className="info-banner-text">Secret behind our pricing</span>
        <button
          className="info-banner-icon"
          aria-label="more info"
          onClick={(e) => {
            e.stopPropagation();
            toggleInfoModal();
          }}
          style={{ color: Colors.greenCardamom }}
        >
          <FiInfo size={20} />
        </button>
      </div> */}

      {/* Single Date Card - Centered */}
      {/* <div className="single-date-container" style={{ 
        display: "flex", 
        justifyContent: "center", 
        marginBottom: "24px" 
      }}>
        <div 
          className="date-card active"
          style={{
            minWidth: "140px",
            textAlign: "center",
            padding: "14px 28px",
            borderRadius: "16px",
            background: Colors.greenCardamom,
            color: Colors.appForeground,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <div className="day" style={{ fontSize: "14px", opacity: 0.9, fontWeight: 500 }}>
            {singleDate.label}
          </div>
          <div className="date" style={{ fontSize: "28px", fontWeight: "bold", lineHeight: 1.2 }}>
            {`${singleDate.date} ${singleDate.month}`}
          </div>
          <div className="weekday" style={{ fontSize: "14px", opacity: 0.9 }}>
            {singleDate.weekday}
          </div>
        </div>
      </div> */}

      {/* {showInfoModal && (
        <div className="info-modal" role="dialog" aria-modal="true">
          <div className="info-modal-backdrop" onClick={toggleInfoModal} />
          <div className="info-modal-content">
            <div className="info-modal-card">
              <div className="info-modal-card-header">
                <h3 style={{ margin: 0, color: Colors.greenCardamom }}>
                  Secret behind our pricing
                </h3>
              </div>

              <div className="info-list">
                <div className="info-item">
                  <div className="info-item-title">Cook-to-order model</div>
                  <div className="info-item-desc">
                    Meals are prepared only after confirmation, zero food
                    wastage, no excess inventory
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-item-title">
                    Route-based delivery
                  </div>
                  <div className="info-item-desc">
                    Orders are grouped by location and delivered in
                    optimized routes, lowering delivery cost per order
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-item-title">Direct kitchens</div>
                  <div className="info-item-desc">
                    We manage cooking and delivery end-to-end without
                    intermediaries.
                  </div>
                </div>
              </div>

              <div className="info-modal-actions">
                <button
                  className="info-modal-ok"
                  onClick={toggleInfoModal}
                  style={{
                    background: Colors.greenCardamom,
                    color: Colors.appForeground,
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Session Buttons - Breakfast, Lunch, Dinner with Figma styling */}
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
            >
              <div className="session-icon">
                <Icon size={32} />
              </div>
              <div className="session-info">
                <div className="session-title">{sessionConfig[session].displayName}</div>
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