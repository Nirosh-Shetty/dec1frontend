import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { Container } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { FaPlus, FaMinus, FaSquareWhatsapp } from "react-icons/fa6";
import "../Styles/Home.css";
import Banner from "./Banner";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Drawer } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CoinBalance from "./CoinBalance";
import { WalletContext } from "../WalletContext";
import RatingModal from "./RatingModal";
import { BiSolidOffer } from "react-icons/bi";
import Swal2 from "sweetalert2";
import IsVeg from "../assets/isVeg=yes.svg";
import IsNonVeg from "../assets/isVeg=no.svg";
import MultiCartDrawer from "./MultiCartDrawer";
import DateSessionSelector from "./DateSessionSelector";
import chef from "./../assets/chef_3.png";
import { Colors } from "../Helper/themes";
import checkCircle from "./../assets/check_circle.png";
import BottomNav from "./BottomNav";
import availabity from "./../assets/weui_done2-filled.png";
import { addToCart, removeCutoffExpiredItems } from "../Helper/cartHelper";
import Footer from "./Footer";
import CutoffStatusCard from "./../Helper/CutoffTimer.jsx";
import { RiInformationLine } from "react-icons/ri";
import { MdDeliveryDining, MdOutlineTimer } from "react-icons/md";
import FreshIngredientsCarousel from "./FreshIngredientsCarousel.jsx";
import confetti from "canvas-confetti";
import cross from "../assets/cross.png";
import dishImg from "../assets/dish.png";
import { BsCartPlus } from "react-icons/bs";


const fireToast = ({ title, subtitle, icon = checkCircle }) => {
  Swal2.fire({
    toast: true,
    position: "bottom",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    html: `
      <div class="myplans-toast-content">
        <img src="${icon}" alt="" class="myplans-toast-check" />
        <div class="myplans-toast-text">
          <div class="myplans-toast-title">${title}</div>
          ${subtitle ? `<div class="myplans-toast-subtitle">${subtitle}</div>` : ""}
        </div>
      </div>
    `,
    customClass: {
      popup: "myplans-custom-toast",
      htmlContainer: "myplans-toast-html",
    },
    didOpen: () => {
      const toast = document.querySelector(".myplans-custom-toast");
      if (toast) {
        toast.style.bottom = "60px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.position = "fixed";
      }
    },
  });
};

// Sticky wrapper: sits in normal flow, switches to fixed when scrolled past top
const CutoffStickyWrapper = ({ children }) => {
  const placeholderRef = useRef(null);
  const [isFixed, setIsFixed] = useState(false);
  const [barHeight, setBarHeight] = useState(0);
  const barRef = useRef(null);

  useEffect(() => {
    const placeholder = placeholderRef.current;
    if (!placeholder) return;

    const onScroll = () => {
      const rect = placeholder.getBoundingClientRect();
      setIsFixed(rect.top <= 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (barRef.current) {
      setBarHeight(barRef.current.offsetHeight);
    }
  });

  return (
    <>
      {/* Placeholder keeps the space so content below doesn't jump when bar goes fixed */}
      <div ref={placeholderRef} style={{ height: isFixed ? barHeight : 0 }} />
      <div
        ref={barRef}
        style={
          isFixed
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 999,
                width: "100%",
                maxWidth: "100vw",
                overflowX: "hidden",
              }
            : {
                width: "100%",
                overflowX: "hidden",
              }
        }
      >
        {children}
      </div>
    </>
  );
};

const Home = ({ selectArea, setSelectArea, Carts, setCarts }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "user") {
        try {
          setUser(JSON.parse(e.newValue));
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateUser = (userObj) => {
    setUser(userObj);
    if (userObj) {
      localStorage.setItem("user", JSON.stringify(userObj));
    } else {
      localStorage.removeItem("user");
    }
    window.dispatchEvent(new Event("userUpdated"));
  };

  const navigate = useNavigate();
  const location = useLocation();

  const { wallet, transactions } = useContext(WalletContext);

  const [loader, setloader] = useState(false);
  const [allHubMenuData, setAllHubMenuData] = useState([]);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [address, setAddress] = useState(null);
  const [shouldLoadDefaultMenu, setShouldLoadDefaultMenu] = useState(!user);

  // Computed hub ID: use address.hubId if available, otherwise default hub for guests
  const effectiveHubId = useMemo(() => {
    if (address?.hubId) return address.hubId;
    if (!user) return "69e747f999c3e8209908cb7b";
    return null;
  }, [address?.hubId, user]);

  const [cutoffValidation, setCutoffValidation] = useState({
    allowed: true,
    message: "",
    cutoffDateTime: null,
    nextAvailableDateTime: null,
    orderMode: "preorder",
  });
  const [cutoffLoading, setCutoffLoading] = useState(false);
  const [hubOrderMode, setHubOrderMode] = useState("preorder");
  const [hubLocalCutoffData, setHubLocalCutoffData] = useState(null); // local cutoff times for instant checks
  const [hubSettled, setHubSettled] = useState(false); // true once auto-jump has completed for the current hub
  const [gifUrl, setGifUrl] = useState("");
  const [message, setMessage] = useState("");
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  // userOrderCount = total orders placed by this user (for customerType eligibility)
  const [userOrderCount, setUserOrderCount] = useState(0);
  // New offer management: tracks which date|session|hubId slots the user has used an offer on
  const [userOfferStatus, setUserOfferStatus] = useState({ usedOfferCount: 0, usedSlots: [] });
  const [offerStatusLoaded, setOfferStatusLoaded] = useState(false);

  // Auto-switch tracking refs
  const autoSwitchInProgressRef = useRef(null); // stores last switched "date|session" key to prevent re-firing
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for precise cutoff checking
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user order count for customerType eligibility check
  const fetchUserOrderCounts = async (userId) => {
    if (!userId) {
      console.log("[Offer] fetchUserOrderCounts: no userId, setting count=0");
      setUserOrderCount(0);
      setOrdersLoaded(true);
      return;
    }
    try {
      const res = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/admin/count",
        { params: { userId } },
      );
      console.log("[Offer] fetchUserOrderCounts response:", res.status, res.data);
      if (res.status === 200 && res.data?.success) {
        const count = res.data.count ?? 0;
        console.log("[Offer] userOrderCount set to:", count);
        setUserOrderCount(count);
        setOrdersLoaded(true);
      }
    } catch (error) {
      console.error("[Offer] fetchUserOrderCounts error:", error);
    } finally {
      setOrdersLoaded(true);
    }
  };

  // Fetch user offer status: which date|session|hubId slots have been used
  const fetchUserOfferStatus = async (userId) => {
    if (!userId || user?.status === "Employee") {
      console.log("[Offer] fetchUserOfferStatus: no userId or Employee, skipping");
      setUserOfferStatus({ usedOfferCount: 0, usedSlots: [] });
      setOfferStatusLoaded(true);
      return;
    }
    try {
      const res = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/admin/hub-menu/user-offer-status",
        { params: { userId } }
      );
      console.log("[Offer] fetchUserOfferStatus response:", res.status, res.data);
      if (res.status === 200 && res.data?.success) {
        console.log("[Offer] userOfferStatus set to:", res.data.usedOfferCount, res.data.usedSlots);
        setUserOfferStatus({
          usedOfferCount: res.data.usedOfferCount ?? 0,
          usedSlots: res.data.usedSlots ?? []
        });
      }
    } catch (e) {
      console.error("[Offer] fetchUserOfferStatus error:", e);
    } finally {
      setOfferStatusLoaded(true);
    }
  };

  useEffect(() => {
    if (Carts?.length > 0) handleShow();
    // Refresh order count and offer status when user changes (also runs on mount)
    const refresh = async () => {
      setOfferStatusLoaded(false);
      setOrdersLoaded(false);
      await fetchUserOrderCounts(user?._id);
      await fetchUserOfferStatus(user?._id);
    };
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Returns total order count for the current user
  const findNumberofOrders = () => {
    if (!user?._id) return 0;
    return userOrderCount;
  };


  // Convert backend UTC time to IST display time
  const convertUTCToISTDisplay = (utcDateString) => {
    if (!utcDateString) return null;

    const utcDate = new Date(utcDateString);
    let utcHours = utcDate.getUTCHours();
    let utcMinutes = utcDate.getUTCMinutes();

    let displayUTCHours = utcHours - 5;
    let displayUTCMinutes = utcMinutes - 30;

    if (displayUTCMinutes < 0) {
      displayUTCHours -= 1;
      displayUTCMinutes += 60;
    }

    if (displayUTCHours < 0) {
      displayUTCHours += 24;
    }

    const correctedDate = new Date(utcDate);
    correctedDate.setUTCHours(displayUTCHours, displayUTCMinutes, 0, 0);

    return correctedDate;
  };

  const formatTime12Hour = (date) => {
    if (!date) return null;

    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${minutesStr} ${ampm}`;
  };

  const validateCutoffTiming = useCallback(
    async (hubId, session, deliveryDate) => {
      if (!hubId || !session) return true;
      try {
        setCutoffLoading(true);
        const status = user?.status === "Employee" ? "Employee" : "Normal";

        // console.log("[validateCutoffTiming] Request:", {
        //   hubId,
        //   session: session.toLowerCase(),
        //   status,
        //   deliveryDate:
        //     deliveryDate instanceof Date
        //       ? deliveryDate.toISOString()
        //       : deliveryDate,
        // });

        const response = await axios.post(
          "https://dd-backend-3nm0.onrender.com/api/Hub/validate-order-timing",
          {
            hubId: hubId,
            session: session.toLowerCase(),
            status: status,
            deliveryDate:
              deliveryDate instanceof Date
                ? deliveryDate.toISOString()
                : deliveryDate,
          },
        );

        if (response.status === 200) {
          // console.log(
          //   "[validateCutoffTiming] Raw API response:",
          //   response.data,
          // );

          const rawCutoff = response.data.cutoffDateTime
            ? new Date(response.data.cutoffDateTime)
            : null;
          const rawNext = response.data.nextAvailableDateTime
            ? new Date(response.data.nextAvailableDateTime)
            : null;

          // Backend runs on Render/AWS (UTC) and adds IST offset when calculating cutoff
          // We need to subtract 5:30 hours (19800000 ms) to get the correct local time
          const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 19800000 ms
          const correctedCutoff = rawCutoff
            ? new Date(rawCutoff.getTime() - IST_OFFSET_MS)
            : null;
          const correctedNext = rawNext
            ? new Date(rawNext.getTime() - IST_OFFSET_MS)
            : null;

          // console.log("[validateCutoffTiming] Corrected times:", {
          //   rawCutoff: rawCutoff?.toISOString(),
          //   correctedCutoff: correctedCutoff?.toISOString(),
          //   now: new Date().toISOString(),
          //   allowed: response.data.allowed,
          // });

          const validationData = {
            allowed: response.data.allowed,
            message: response.data.message,
            cutoffDateTime: correctedCutoff,
            nextAvailableDateTime: correctedNext,
            orderMode: response.data.orderMode || "preorder",
            // Stamp the session+date this validation was fetched for so stale
            // results from a previous session don't bleed into the current view.
            _forSession: session.toLowerCase(),
            _forDate:
              deliveryDate instanceof Date
                ? deliveryDate.toISOString().split("T")[0]
                : new Date(deliveryDate).toISOString().split("T")[0],
          };

          setCutoffValidation(validationData);
          setHubOrderMode(response.data.orderMode || "preorder");
          return response.data.allowed;
        }
        return true;
      } catch (error) {
        console.error("Error validating cutoff timing:", error);
        return true;
      } finally {
        setCutoffLoading(false);
      }
    },
    [user?.status],
  );

  const getNormalizedToday = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  // Fetch hub cutoff times locally so we can do instant (no-API) cutoff checks
  // NOTE: This is now handled inside the combined hub+menu fetch below.

  // Pure local check — no API, instant
  const isSessionPastCutoffLocal = useCallback(
    (session, checkTime = new Date()) => {
      if (!hubLocalCutoffData?.cutoffTimes) return false;
      const key = session.toLowerCase();
      const times = hubLocalCutoffData.cutoffTimes[key];
      if (!times) return false;
      const cutoffStr =
        user?.status === "Employee"
          ? times.employeeCutoff
          : times.defaultCutoff;
      if (!cutoffStr) return false;
      const [h, m] = cutoffStr.split(":").map(Number);
      const cutoff = new Date(checkTime);
      cutoff.setHours(h, m, 0, 0);
      return checkTime >= cutoff;
    },
    [hubLocalCutoffData, user?.status],
  );

  const [selectedDate, setSelectedDate] = useState(() => {
    if (location.state?.targetDate) return new Date(location.state.targetDate);
    return getNormalizedToday();
  });

  const [selectedSession, setSelectedSession] = useState(() => {
    if (location.state?.targetSession) return location.state.targetSession;
    return "Lunch";
  });

  // Auto-switch session when cutoff is reached - defined AFTER state variables
  const checkAndAutoSwitchSession = useCallback(() => {
    if (!selectedDate || !selectedSession || !hubLocalCutoffData) return;

    const now = new Date();

    // Build UTC date key for today and selected date
    const todayUTCKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
    const selUTCKey = `${selectedDate.getUTCFullYear()}-${String(selectedDate.getUTCMonth() + 1).padStart(2, "0")}-${String(selectedDate.getUTCDate()).padStart(2, "0")}`;

    // Only auto-switch when viewing today
    if (todayUTCKey !== selUTCKey) return;

    // Use local cutoff check — instant, no API
    const isPastCutoff = isSessionPastCutoffLocal(selectedSession, now);
    if (!isPastCutoff) return;

    const sessionOrder = ["Breakfast", "Lunch", "Dinner"];
    const currentIndex = sessionOrder.indexOf(selectedSession);

    // Build available sessions for today from menu data
    const availableSessions = new Set();
    allHubMenuData.forEach((item) => {
      if (!item.deliveryDate || !item.session) return;
      const d = new Date(item.deliveryDate);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      if (key === todayUTCKey) availableSessions.add(item.session);
    });

    // Find next session today that hasn't passed cutoff
    let nextSession = null;
    for (let i = currentIndex + 1; i < sessionOrder.length; i++) {
      const s = sessionOrder[i];
      if (availableSessions.has(s) && !isSessionPastCutoffLocal(s, now)) {
        nextSession = s;
        break;
      }
    }

    if (nextSession) {
      const switchKey = `${selUTCKey}|${selectedSession}->${nextSession}`;
      if (autoSwitchInProgressRef.current === switchKey) return;
      autoSwitchInProgressRef.current = switchKey;

      setSelectedSession(nextSession);
      setSelectedCategory("");
      window.scrollTo(0, 0);
      if (effectiveHubId) {
        validateCutoffTiming(effectiveHubId, nextSession, selectedDate);
      }
    } else {
      // All today's sessions are past cutoff — find next available date+session
      // No one-shot guard here: we keep trying every tick until state actually updates
      const dateSessionMap = {};
      allHubMenuData.forEach((item) => {
        if (!item.deliveryDate || !item.session) return;
        const d = new Date(item.deliveryDate);
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
        if (!dateSessionMap[key]) dateSessionMap[key] = new Set();
        dateSessionMap[key].add(item.session);
      });

      for (let i = 1; i <= 14; i++) {
        const futureDate = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + i,
          ),
        );
        const futureDateKey = `${futureDate.getUTCFullYear()}-${String(futureDate.getUTCMonth() + 1).padStart(2, "0")}-${String(futureDate.getUTCDate()).padStart(2, "0")}`;
        const futureSessions = dateSessionMap[futureDateKey];

        if (futureSessions && futureSessions.size > 0) {
          const firstSession = sessionOrder.find((s) => futureSessions.has(s));
          if (firstSession) {
            // Guard: only switch once per target date+session to avoid thrashing
            const switchKey = `${futureDateKey}|${firstSession}`;
            if (autoSwitchInProgressRef.current === switchKey) return;
            autoSwitchInProgressRef.current = switchKey;

            setSelectedDate(futureDate);
            setSelectedSession(firstSession);
            setSelectedCategory("");
            window.scrollTo(0, 0);
            if (effectiveHubId) {
              validateCutoffTiming(effectiveHubId, firstSession, futureDate);
            }
            break;
          }
        }
      }
    }
  }, [
    selectedDate,
    selectedSession,
    allHubMenuData,
    hubLocalCutoffData,
    isSessionPastCutoffLocal,
    effectiveHubId,
    validateCutoffTiming,
  ]);

  const isOfferAlreadyAppliedInCart = (slotKey = null) => {
    if (!Carts || Carts.length === 0) return false;
    return Carts.some((item) => {
      if (slotKey) {
        const itemDateStr =
          item.deliveryDate?.split("T")[0] || item.deliveryDate;
        // const itemSlotKey = `${itemDateStr}|${item.session?.toLowerCase()}`;
        const itemSlotKey = `${itemDateStr}|${item.session}`;
        return (
          itemSlotKey === slotKey &&
          item.offerProduct === true &&
          item.offerApplied === true
        );
      }
      return item.offerProduct === true && item.offerApplied === true;
    });
  };

  // Count how many distinct date|session slots already have an offer applied in the cart
  const countOfferSlotsInCart = () => {
    if (!Carts || Carts.length === 0) return 0;
    const offerSlots = new Set();
    Carts.forEach((item) => {
      if (item.offerProduct === true && item.offerApplied === true) {
        const itemDateStr =
          item.deliveryDate?.split("T")[0] || item.deliveryDate;
        const slotKey = `${itemDateStr}|${(item.session || "").toLowerCase()}`;
        offerSlots.add(slotKey);
      }
    });
    return offerSlots.size;
  };

  const getAppliedOfferFromCart = (slotKey = null) => {
    if (!Carts || Carts.length === 0) return null;
    return Carts.find((item) => {
      if (slotKey) {
        const itemDateStr =
          item.deliveryDate?.split("T")[0] || item.deliveryDate;
        // const itemSlotKey = `${itemDateStr}|${item.session?.toLowerCase()}`;
        const itemSlotKey = `${itemDateStr}|${item.session?.toLowerCase()}`;
        return (
          itemSlotKey === slotKey &&
          item.offerProduct === true &&
          item.offerApplied === true
        );
      }
      return item.offerProduct === true && item.offerApplied === true;
    });
  };

  useEffect(() => {
    const checkCutoff = async () => {
      // Don't validate until hub data is loaded and auto-jump has settled.
      // This prevents the initial today+Lunch (cutoff passed) flash on refresh.
      if (!hubLocalCutoffData) return;
      if (autoJumpedHubRef.current !== effectiveHubId) return;

      if (effectiveHubId && selectedDate && selectedSession) {
        await validateCutoffTiming(
          effectiveHubId,
          selectedSession,
          selectedDate,
        );
      }
    };
    checkCutoff();
  }, [
    address,
    effectiveHubId,
    selectedDate,
    selectedSession,
    validateCutoffTiming,
    hubLocalCutoffData,
  ]);

  // Every second: local cutoff check — fires within 1s of cutoff, zero API calls
  useEffect(() => {
    checkAndAutoSwitchSession();
  }, [currentTime, checkAndAutoSwitchSession]);

  // Auto-remove cart items whose slot cutoff has passed
  useEffect(() => {
    if (!hubLocalCutoffData) return;
    const result = removeCutoffExpiredItems(hubLocalCutoffData, user?.status);
    if (result && result.removedCount > 0) {
      const updatedCart = result.updatedCart;
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setCarts(updatedCart);

      // Group removed items by slot for a clear message
      const slotMap = {};
      result.removedItems.forEach(({ session, deliveryDate }) => {
        const key = `${deliveryDate}|${session}`;
        if (!slotMap[key]) slotMap[key] = { session, deliveryDate };
      });
      const slotLabels = Object.values(slotMap).map(
        ({ session, deliveryDate }) => {
          const d = new Date(deliveryDate + "T00:00:00");
          const day = d.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          return `${session.charAt(0).toUpperCase() + session.slice(1)}, ${day}`;
        },
      );

      fireToast({
        icon: cross,
        title: `${result.removedCount} item${result.removedCount > 1 ? "s" : ""} removed — ordering cutoff passed`,
        subtitle: slotLabels.join(" · "),
      });
    }
  }, [currentTime, hubLocalCutoffData, user?.status]);

  // When menu data loads, immediately jump to the next available date/session.
  // Only jumps if the current selection has no valid menu (e.g. no menu for tomorrow,
  // but menu exists for day-after-tomorrow). Does NOT override user's manual selection.
  const selectedDateRef = useRef(selectedDate);
  const selectedSessionRef = useRef(selectedSession);
  // Tracks the last key we auto-jumped to — prevents re-firing when deps change but result is the same
  const autoJumpedToRef = useRef(null);
  // Tracks which hub the last auto-jump was for — forces re-jump on hub change
  const autoJumpedHubRef = useRef(null);
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);
  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  useEffect(() => {
    if (!allHubMenuData?.length) return;
    // Wait for hub cutoff data before auto-jumping — without it we don't know
    // the orderMode, which determines whether today is a valid start date.
    // This prevents the today→tomorrow→today flicker on instant-mode hubs.
    if (!hubLocalCutoffData) return;

    const now = new Date();
    const sessionOrder = ["Breakfast", "Lunch", "Dinner"];

    // Build UTC date-key -> sessions map
    const dateSessionMap = {};
    allHubMenuData.forEach((item) => {
      if (!item.deliveryDate || !item.session) return;
      const d = new Date(item.deliveryDate);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      if (!dateSessionMap[key]) dateSessionMap[key] = new Set();
      dateSessionMap[key].add(item.session);
    });

    console.log("[Home] Menu dates available:", Object.keys(dateSessionMap));

    // Check if current selection is already valid — if so, don't override
    // BUT always re-jump if the hub changed (different orderMode may apply)
    const hubChanged = autoJumpedHubRef.current !== effectiveHubId;
    const curDate = selectedDateRef.current;
    const curSession = selectedSessionRef.current;
    if (!hubChanged && curDate && curSession) {
      const curKey = `${curDate.getUTCFullYear()}-${String(curDate.getUTCMonth() + 1).padStart(2, "0")}-${String(curDate.getUTCDate()).padStart(2, "0")}`;
      const curSessions = dateSessionMap[curKey];
      if (curSessions?.has(curSession)) {
        const todayKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
        const isToday = curKey === todayKey;
        const orderMode = hubLocalCutoffData?.orderMode || "preorder";
        const isEmployee = user?.status === "Employee";
        // In preorder mode, today is never a valid selection
        if (isToday && orderMode === "preorder" && !isEmployee) {
          // fall through to auto-jump
        } else if (!isToday || !isSessionPastCutoffLocal(curSession, now)) {
          autoJumpedHubRef.current = effectiveHubId; // mark settled even when no jump needed
          setHubSettled(true);
          return; // Valid selection, leave it alone
        }
      }
    }

    // Current selection is invalid — find the earliest valid date+session
    // For preorder mode: start from tomorrow (i=1), skip today
    const orderMode = hubLocalCutoffData?.orderMode || "preorder";
    const startOffset =
      orderMode === "preorder" && user?.status !== "Employee" ? 1 : 0;

    for (let i = startOffset; i <= 14; i++) {
      const checkDate = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + i),
      );
      const dateKey = `${checkDate.getUTCFullYear()}-${String(checkDate.getUTCMonth() + 1).padStart(2, "0")}-${String(checkDate.getUTCDate()).padStart(2, "0")}`;
      const sessions = dateSessionMap[dateKey];
      if (!sessions || sessions.size === 0) continue;

      const validSessions =
        i === 0
          ? [...sessions].filter((s) => !isSessionPastCutoffLocal(s, now))
          : [...sessions];

      if (validSessions.length === 0) continue;

      const firstSession = sessionOrder.find((s) => validSessions.includes(s));
      if (!firstSession) continue;

      console.log("[Home] Auto-jumping to:", dateKey, firstSession);
      const jumpKey = `${dateKey}|${firstSession}`;
      if (autoJumpedToRef.current === jumpKey && !hubChanged) return; // already jumped here for this hub
      autoJumpedToRef.current = jumpKey;
      autoJumpedHubRef.current = effectiveHubId;
      setHubSettled(true);
      setSelectedDate(checkDate);
      setSelectedSession(firstSession);
      setSelectedCategory("");
      if (effectiveHubId) {
        validateCutoffTiming(effectiveHubId, firstSession, checkDate);
      }
      return;
    }
  }, [
    allHubMenuData,
    hubLocalCutoffData,
    isSessionPastCutoffLocal,
    effectiveHubId,
    validateCutoffTiming,
  ]);

  // NOTE: cutoff re-validation on a timer is intentionally removed.
  // validateCutoffTiming is already called whenever selectedDate/selectedSession changes,
  // and CutoffTimer manages its own countdown internally.

  const refreshAddress = useCallback(() => {
    try {
      const primaryAddress = localStorage.getItem("primaryAddress");
      const currentLocation = localStorage.getItem("currentLocation");
      const defaultHubData = localStorage.getItem("defaultHubData");
      if (primaryAddress && primaryAddress !== "null") {
        const parsedPrimary = JSON.parse(primaryAddress);
        setAddress(parsedPrimary);
        setShouldLoadDefaultMenu(false);
      } else if (currentLocation && currentLocation !== "null") {
        const parsedCurrent = JSON.parse(currentLocation);
        setAddress(parsedCurrent);
        setShouldLoadDefaultMenu(false);
      } else if (defaultHubData && defaultHubData !== "null") {
        try {
          const parsedDefault = JSON.parse(defaultHubData);
          const defaultAddress = {
            hubId:
              parsedDefault.hubId ||
              parsedDefault._id ||
              "69e747f999c3e8209908cb7b",
            hubName:
              parsedDefault.hubName || parsedDefault.name || "Default Hub",
            fullAddress:
              parsedDefault.address || "Select your location to view menu",
            isDefaultHub: true,
            location: parsedDefault.location || {
              type: "Point",
              coordinates: [0, 0],
            },
          };
          setAddress(defaultAddress);
          setShouldLoadDefaultMenu(false);
          localStorage.setItem(
            "currentLocation",
            JSON.stringify(defaultAddress),
          );
        } catch (e) {
          console.error("Error parsing default hub data:", e);
          setAddress(null);
          setShouldLoadDefaultMenu(!user);
        }
      } else {
        setAddress(null);
        setShouldLoadDefaultMenu(!user);
      }
    } catch (error) {
      console.error("Error refreshing address:", error);
      setAddress(null);
      setShouldLoadDefaultMenu(!user);
    }
  }, [user]);

  // Combined hub data + menu fetch — runs once per hub change, sets both atomically
  // so the auto-jump logic always has both pieces of data at the same time (no flicker).
  useEffect(() => {
    const hubIdToUse = effectiveHubId;

    if (!hubIdToUse) {
      setAllHubMenuData([]);
      setHubLocalCutoffData(null);
      setloader(false);
      return;
    }

    // Reset auto-jump guard so the new hub gets a fresh auto-jump
    autoJumpedToRef.current = null;
    autoJumpedHubRef.current = null;
    // Mark hub as not yet settled — hides the "Orders Closed" card until auto-jump completes
    setHubSettled(false);
    // Clear stale cutoff data immediately so the auto-jump gate waits for fresh data
    setHubLocalCutoffData(null);
    // Clear stale cutoffValidation so CutoffStatusCard stays hidden until new data arrives
    setCutoffValidation({
      allowed: true,
      message: "",
      cutoffDateTime: null,
      nextAvailableDateTime: null,
      orderMode: "preorder",
    });

    const fetchHubDataAndMenu = async () => {
      setloader(true);
      try {
        const token = localStorage.getItem("authToken");

        // Fetch both in parallel
        const [menuRes, cutoffRes] = await Promise.allSettled([
          axios.get(
            "https://dd-backend-3nm0.onrender.com/api/user/get-hub-menu",
            {
              params: { hubId: hubIdToUse },
            },
          ),
          fetch(
            `https://dd-backend-3nm0.onrender.com/api/Hub/get-cutoff-times/${hubIdToUse}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);

        // Process menu
        if (menuRes.status === "fulfilled" && menuRes.value.status === 200) {
          const menuData = menuRes.value.data.menu;
          // Debug: log offer items received from backend
          const offerItems = menuData.filter(m => m.isOffer);
          // console.log("[OFFER DEBUG] Menu loaded. Total items:", menuData.length, "Offer items:", offerItems.length);
          // if (offerItems.length > 0) {
          //   console.log("[OFFER DEBUG] Offer items from backend:", offerItems.map(m => ({
          //     foodname: m.foodname,
          //     isOffer: m.isOffer,
          //     offerPrice: m.offerPrice,
          //     offerStartDate: m.offerStartDate,
          //     offerEndDate: m.offerEndDate,
          //     customerType: m.customerType,
          //     deliveryDate: m.deliveryDate,
          //     hubId: m.hubId,
          //   })));
          // } else {
          //   console.log("[OFFER DEBUG] ⚠️ No offer items in menu response. Sample item:", menuData[0]);
          // }
          setAllHubMenuData(menuData);
        } else {
          setAllHubMenuData([]);
        }

        // Process cutoff data
        if (cutoffRes.status === "fulfilled" && cutoffRes.value.ok) {
          const data = await cutoffRes.value.json();
          const cutoffTimes = data.cutoffTimes || {};
          const orderMode = data.orderMode || "preorder";
          ["breakfast", "lunch", "dinner"].forEach((s) => {
            if (!cutoffTimes[s]) cutoffTimes[s] = {};
            if (!cutoffTimes[s].defaultCutoff)
              cutoffTimes[s].defaultCutoff =
                orderMode === "instant" ? "20:00" : "23:59";
            if (!cutoffTimes[s].employeeCutoff)
              cutoffTimes[s].employeeCutoff = "10:00";
          });
          // Set both in the same tick so auto-jump fires once with complete data
          setHubLocalCutoffData({ orderMode, cutoffTimes });
        } else {
          setHubLocalCutoffData({
            orderMode: "preorder",
            cutoffTimes: {
              breakfast: { defaultCutoff: "23:59", employeeCutoff: "10:00" },
              lunch: { defaultCutoff: "23:59", employeeCutoff: "10:00" },
              dinner: { defaultCutoff: "23:59", employeeCutoff: "10:00" },
            },
          });
        }
      } catch (error) {
        console.error("Error fetching hub data:", error);
        setAllHubMenuData([]);
      } finally {
        setloader(false);
      }
    };

    fetchHubDataAndMenu();
  }, [effectiveHubId]);

  // Listen for location updates
  useEffect(() => {
    const handleLocationUpdated = () => refreshAddress();
    const handleAddressUpdated = () => refreshAddress();
    const handleAddressAdded = () => refreshAddress();
    const handleFocus = () => refreshAddress();
    const handleDefaultHubLoaded = () => refreshAddress();
    const handleStorageChange = (e) => {
      if (
        e.key === "currentLocation" ||
        e.key === "primaryAddress" ||
        e.key === "defaultHubData"
      ) {
        refreshAddress();
      }
    };

    window.addEventListener("locationUpdated", handleLocationUpdated);
    window.addEventListener("addressUpdated", handleAddressUpdated);
    window.addEventListener("addressAdded", handleAddressAdded);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("defaultHubLoaded", handleDefaultHubLoaded);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("locationUpdated", handleLocationUpdated);
      window.removeEventListener("addressUpdated", handleAddressUpdated);
      window.removeEventListener("addressAdded", handleAddressAdded);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("defaultHubLoaded", handleDefaultHubLoaded);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshAddress]);

  const handleSelectionChange = (date1, session1) => {
    setSelectedDate(date1);
    setSelectedSession(session1);
    setSelectedCategory("");
    window.scrollTo(0, 0);

    // Immediately validate cutoff for the new selection
    if (effectiveHubId && date1 && session1) {
      validateCutoffTiming(effectiveHubId, session1, date1);
    }
  };

  const handleLocationDetected = useCallback((newLocation) => {
    setAddress(newLocation);
    setShouldLoadDefaultMenu(false);
    if (newLocation) {
      localStorage.setItem("currentLocation", JSON.stringify(newLocation));
    }
    window.dispatchEvent(new Event("locationUpdated"));
  }, []);

  // Build a preliminary cutoffValidation from local hub cutoff data so CutoffStatusCard
  // can render as soon as the menu loads — without waiting for the validate-order-timing
  // API call to complete. Once the real API response arrives, cutoffValidation takes over.
  const preliminaryCutoffValidation = useMemo(() => {
    // If the real API data is already here, no need for a preliminary value
    if (cutoffValidation?.cutoffDateTime) return cutoffValidation;
    // Need local cutoff data and a selected session to compute anything
    if (!hubLocalCutoffData?.cutoffTimes || !selectedSession || !selectedDate)
      return null;

    const key = selectedSession.toLowerCase();
    const times = hubLocalCutoffData.cutoffTimes[key];
    if (!times) return null;

    const cutoffStr =
      user?.status === "Employee" ? times.employeeCutoff : times.defaultCutoff;
    if (!cutoffStr) return null;

    const [h, m] = cutoffStr.split(":").map(Number);
    // Build cutoff datetime for the selected date at the local cutoff time
    const cutoffDate = new Date(selectedDate);
    cutoffDate.setHours(h, m, 0, 0);

    const now = new Date();
    const allowed = now < cutoffDate;
    const orderMode = hubLocalCutoffData.orderMode || "preorder";

    return {
      allowed,
      message: allowed ? "" : `Orders closed for ${selectedSession}`,
      cutoffDateTime: cutoffDate,
      nextAvailableDateTime: null,
      orderMode,
      _forSession: key,
      _forDate: selectedDate.toISOString().split("T")[0],
      _isPreliminary: true,
    };
  }, [
    cutoffValidation,
    hubLocalCutoffData,
    selectedSession,
    selectedDate,
    user?.status,
  ]);

  // The effective cutoff to pass to CutoffStatusCard — real API data when available,
  // preliminary local data otherwise (so the card shows with the menu on refresh).
  const effectiveCutoffValidation = cutoffValidation?.cutoffDateTime
    ? cutoffValidation
    : preliminaryCutoffValidation;

  // Derive ordering-allowed state from the corrected cutoff timestamp rather than
  // trusting the raw API `allowed` flag, which can be stale or double-offset.
  // This mirrors the same logic in CutoffTimer.jsx (isActuallyAllowed).
  const isOrderingAllowed = useMemo(() => {
    if (!cutoffValidation?.cutoffDateTime)
      return cutoffValidation?.allowed ?? true;
    const now = currentTime; // updates every second
    const cutoff = new Date(cutoffValidation.cutoffDateTime);
    const calculated = now < cutoff;
    // If API says allowed but our local clock says cutoff passed, trust local clock
    // (the IST correction in validateCutoffTiming already adjusted the timestamp)
    if (cutoffValidation.allowed === true && !calculated) return false;
    return calculated;
  }, [cutoffValidation, currentTime]);

  const currentSlotItems = useMemo(() => {
    if (!allHubMenuData?.length) return [];

    // Only block items if cutoff is not allowed AND we're viewing today's date
    // For future dates, always show the menu
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const selKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    const isViewingToday = todayKey === selKey;

    if (!isOrderingAllowed && isViewingToday) {
      return [];
    }

    // Match using UTC date comparison to handle timezone differences
    const selUTCKey = `${selectedDate.getUTCFullYear()}-${String(selectedDate.getUTCMonth() + 1).padStart(2, "0")}-${String(selectedDate.getUTCDate()).padStart(2, "0")}`;
    return allHubMenuData.filter((item) => {
      if (!item.deliveryDate) return false;
      // Case-insensitive session match to handle "Lunch" vs "lunch"
      if (item.session?.toLowerCase() !== selectedSession?.toLowerCase())
        return false;
      const d = new Date(item.deliveryDate);
      const itemKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      return itemKey === selUTCKey;
    });
  }, [allHubMenuData, selectedDate, selectedSession, isOrderingAllowed]);

  const vegFilteredItems = useMemo(() => {
    if (isVegOnly) {
      return currentSlotItems.filter((item) => item.foodcategory === "Veg");
    }
    return currentSlotItems;
  }, [currentSlotItems, isVegOnly]);

  const dynamicTabs = useMemo(() => {
    const categories = new Set(
      vegFilteredItems.map((item) => item.menuCategory),
    );
    const uniqueCats = [...categories].filter(Boolean).sort();
    return uniqueCats;
  }, [vegFilteredItems]);

  useEffect(() => {
    if (dynamicTabs.length > 0 && !selectedCategory) {
      setSelectedCategory(dynamicTabs[0]);
    } else if (
      dynamicTabs.length > 0 &&
      !dynamicTabs.includes(selectedCategory)
    ) {
      setSelectedCategory(dynamicTabs[0]);
    }
  }, [dynamicTabs, selectedCategory]);

  const finalDisplayItems = useMemo(() => {
    if (!vegFilteredItems.length) return [];
    // If selectedCategory is not in the current tabs (e.g. just switched session),
    // fall back to the first available category so we never flash "no items"
    const effectiveCategory =
      selectedCategory &&
      vegFilteredItems.some((item) => item.menuCategory === selectedCategory)
        ? selectedCategory
        : dynamicTabs[0];
    if (!effectiveCategory) return [];
    return vegFilteredItems.filter(
      (item) => item.menuCategory === effectiveCategory,
    );
  }, [vegFilteredItems, selectedCategory, dynamicTabs]);

  const getEffectivePrice = (item, matchedLocation, session) => {
    const hubPrice =
      (matchedLocation &&
        (matchedLocation.hubPrice || matchedLocation.basePrice)) ||
      item?.hubPrice ||
      item?.basePrice ||
      0;
    const preOrderPrice =
      (matchedLocation &&
        (matchedLocation.preOrderPrice || matchedLocation.preorderPrice)) ||
      item?.preOrderPrice ||
      item?.preorderPrice ||
      0;
    if (hubOrderMode === "instant") {
      return { price: hubPrice };
    }
    const beforeCutoff = isOrderingAllowed;
    if (beforeCutoff && preOrderPrice > 0) return { price: preOrderPrice };
    return { price: hubPrice };
  };

  const [cartCount, setCartCount] = useState(0);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const handleShow = () => {
    setCartCount(cartCount + 1);
    setIsCartVisible(true);
  };

  const [foodData, setFoodData] = useState({});
  const [open, setOpen] = useState(false);
  const showDrawer = (food) => {
    setFoodData(food);
    setOpen(true);
  };
  const onClose = () => setOpen(false);

  useEffect(() => {
    if (open) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
    return () => document.body.classList.remove("drawer-open");
  }, [open]);

  useEffect(() => {
    refreshAddress();
  }, [user]);

  const getProductOffer = (item) => {
    try {
      // Rule 1: Employees never get offers
      if (user?.status === "Employee") return null;

      // Rule 2: Item must be flagged as offer in HubMenu
      if (!item?.isOffer || !item?.offerPrice) {
        // Only log for items that have isOffer set to see what's happening
        if (item?.isOffer) console.log("[OFFER DEBUG] Rule2 fail - isOffer:", item?.isOffer, "offerPrice:", item?.offerPrice, "item:", item?.foodname);
        return null;
      }

      // console.log("[OFFER DEBUG] Checking offer for:", item?.foodname, {
      //   isOffer: item.isOffer,
      //   offerPrice: item.offerPrice,
      //   offerStartDate: item.offerStartDate,
      //   offerEndDate: item.offerEndDate,
      //   customerType: item.customerType,
      //   deliveryDate: item.deliveryDate,
      //   menuDate: item.menuDate,
      //   hubId: item.hubId,
      // });

      // Rule 3: Must be within offer date range (compare date strings only — ignore time component)
      const deliveryDateStr = (item.deliveryDate || item.menuDate || "").toString().split("T")[0];
      if (!deliveryDateStr) {
        console.log("[OFFER DEBUG] Rule3 fail - no deliveryDateStr");
        return null;
      }
      // If no date range is set, the offer is always valid date-wise
      if (item.offerStartDate) {
        const startStr = new Date(item.offerStartDate).toISOString().split("T")[0];
        if (deliveryDateStr < startStr) {
          console.log("[OFFER DEBUG] Rule3 fail - before start:", deliveryDateStr, "<", startStr);
          return null;
        }
      }
      if (item.offerEndDate) {
        const endStr = new Date(item.offerEndDate).toISOString().split("T")[0];
        if (deliveryDateStr > endStr) {
          console.log("[OFFER DEBUG] Rule3 fail - after end:", deliveryDateStr, ">", endStr);
          return null;
        }
      }

      // Rule 4: Customer type eligibility (skip for non-logged-in — show offer to entice login)
      const orderCount = userOrderCount;
      const customerType = item.customerType ?? -1;
      if (user && customerType !== -1) {
        if (customerType === 0 && orderCount !== 0) {
          console.log("[OFFER DEBUG] Rule4 fail - customerType=0 but orderCount:", orderCount);
          return null;
        }
        if (customerType > 0 && orderCount > customerType) {
          console.log("[OFFER DEBUG] Rule4 fail - orderCount", orderCount, "> customerType", customerType);
          return null;
        }
      }

      // Rule 5: Check if user has exhausted their offer slot budget
      // Skip for non-logged-in users — show offer price to entice them
      if (user) {
        const maxAllowed = customerType === -1 ? Infinity : customerType + 1;
        const usedInPast = userOfferStatus.usedOfferCount;
        const usedInCart = countOfferSlotsInCart();
        const remaining = maxAllowed - usedInPast - usedInCart;
        // console.log("[OFFER DEBUG] Rule5 - maxAllowed:", maxAllowed, "usedInPast:", usedInPast, "usedInCart:", usedInCart, "remaining:", remaining);
        if (remaining <= 0) {
          console.log("[OFFER DEBUG] Rule5 fail - no remaining slots");
          return null;
        }
      }

      // Rule 6: Cross-hub + same-session block (logged-in only)
      const dateStr = deliveryDateStr;
      if (user) {
        const itemHubId = item.hubId?.toString();
        const slotKey = `${dateStr}|${selectedSession.toLowerCase()}|${itemHubId}`;
        const slotAlreadyUsed = userOfferStatus.usedSlots.includes(slotKey);
        // console.log("[OFFER DEBUG] Rule6 - slotKey:", slotKey, "usedSlots:", userOfferStatus.usedSlots, "alreadyUsed:", slotAlreadyUsed);
        if (slotAlreadyUsed) {
          console.log("[OFFER DEBUG] Rule6 fail - slot already used");
          return null;
        }
      }

      // Rule 7: One offer per date|session slot in cart (logged-in only)
      const cartSlotKey = `${dateStr}|${selectedSession.toLowerCase()}`;
      if (user) {
        const hasOfferInCart = isOfferAlreadyAppliedInCart(cartSlotKey);
        if (hasOfferInCart) {
          // console.log("[OFFER DEBUG] Rule7 - offer already in cart, returning isBlocked");
          return { ...item, isBlocked: true };
        }
      }

      // console.log("[OFFER DEBUG] ✅ Offer ELIGIBLE for:", item?.foodname);
      return item; // eligible
    } catch (error) {
      console.error("Error getting product offer:", error);
      return null;
    }
  };

  const [deliveryCharge, setDeliveryCharge] = useState([]);
  const getDeliveryRates = async () => {
    try {
      const res = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/deliveryrate/all",
      );
      setDeliveryCharge(res.data.data);
    } catch (error) {
      console.error("Error fetching delivery rates:", error);
    }
  };

  useEffect(() => {
    getDeliveryRates();
  }, []);

  const findDeliveryRate = (hubId, status) => {
    if (!deliveryCharge || deliveryCharge.length === 0) return 0;
    // Match by hubId + status, fall back to any record for this hub
    const matchedRate =
      deliveryCharge.find(
        (rate) =>
          String(rate.hubId) === String(hubId) && rate.status === status,
      ) || deliveryCharge.find((rate) => String(rate.hubId) === String(hubId));
    // Use doorDeliveryRate — the base charge stored on cart items
    return Number(matchedRate?.doorDeliveryRate) || 0;
  };

  // Returns the full matched delivery rate record for the current hub+status
  const findDeliveryRateRecord = (hubId, status) => {
    if (!deliveryCharge || deliveryCharge.length === 0) return null;
    return (
      deliveryCharge.find(
        (rate) => String(rate.hubId) === String(hubId) && rate.status === status,
      ) || deliveryCharge.find((rate) => String(rate.hubId) === String(hubId)) || null
    );
  };

  const isEmployeeForDelivery = user?.status === "Employee";
  const userStatus = user?.status;
  const hubId = address?.hubId;
  const deliveryRate = findDeliveryRate(
    hubId,
    isEmployeeForDelivery ? "Employee" : "Normal",
  );

  const triggerConfetti = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 99999,
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const addCart1 = async (item, offerData, matchedLocation) => {
    if (!user) {
      fireToast({ title: `Login to continue` });
      return;
    }

    if (!isOrderingAllowed) {
      fireToast({
        title:
          cutoffValidation.message ||
          `Cannot add to cart. Orders are closed for ${selectedSession}.`,
      });
      return;
    }

    if (!matchedLocation || matchedLocation?.Remainingstock === 0) {
      fireToast({ title: `Product is out of stock` });
      return;
    }

    const dateStr =
      selectedDate instanceof Date
        ? selectedDate.toISOString().split("T")[0]
        : new Date(selectedDate).toISOString().split("T")[0];
    const slotKey = `${dateStr}|${selectedSession.toLowerCase()}`;
    const hasOfferInCart = isOfferAlreadyAppliedInCart(slotKey);
    const appliedOffer = getAppliedOfferFromCart(slotKey);
    const regularPrice =
      matchedLocation?.hubPrice ||
      item?.hubPrice ||
      matchedLocation?.basePrice ||
      item?.basePrice ||
      115;

    let appliedPrice;
    let isOfferApplied = false;
    let finalOfferPrice = null;
    let finalRegularPrice = regularPrice;

    // New offer management: read offer data directly from HubMenu item
    if (user?.status === "Employee") {
      // Employees never get offer price
      appliedPrice = regularPrice;
    } else if (offerData && offerData.offerPrice && user?._id) {
      const itemHubId = matchedLocation?.hubId?.toString() || item?.hubId?.toString();
      const slotKey = `${dateStr}|${selectedSession.toLowerCase()}|${itemHubId}`;
      const cartSlotKey = `${dateStr}|${selectedSession.toLowerCase()}`;

      const slotAlreadyUsed = userOfferStatus.usedSlots.includes(slotKey);
      const customerType = offerData.customerType ?? -1;
      const maxAllowed = customerType === -1 ? Infinity : customerType + 1;
      const remaining = maxAllowed - userOfferStatus.usedOfferCount - countOfferSlotsInCart();
      const thisSlotInCart = isOfferAlreadyAppliedInCart(cartSlotKey);
      const wouldExceed = !thisSlotInCart && remaining <= 0;

      if (!slotAlreadyUsed && !thisSlotInCart && !wouldExceed) {
        appliedPrice = offerData.offerPrice;
        isOfferApplied = true;
        finalOfferPrice = offerData.offerPrice;
      } else if (slotAlreadyUsed) {
        appliedPrice = regularPrice;
        isOfferApplied = false;
        fireToast({ title: `Offer already used for this session today.` });
      } else if (wouldExceed) {
        appliedPrice = regularPrice;
        isOfferApplied = false;
        fireToast({ title: `Offer limit reached. Added at regular price.` });
      } else {
        appliedPrice = regularPrice;
        isOfferApplied = false;
        fireToast({ title: `Offer already applied for this session.` });
      }
    } else {
      appliedPrice = regularPrice;
    }

    const itemToAdd = {
      _id: item?._id,
      foodname: item?.foodname,
      itemName: item?.foodname,
      image: item?.Foodgallery?.[0]?.image2,
      unit: item?.unit,
      gst: item?.gst,
      discount: item?.discount,
      foodcategory: item?.foodcategory,
      remainingstock: matchedLocation?.Remainingstock,
      deliveryCharge: deliveryRate,
      price: appliedPrice,
      actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
      basePrice: matchedLocation?.basePrice || item?.basePrice || 0,
      hubPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
      preOrderPrice: matchedLocation?.preOrderPrice || item?.preOrderPrice || 0,
      offerProduct: !!(offerData && offerData.isOffer),
      offerApplied: isOfferApplied,
      offerPrice: finalOfferPrice,
      regularPrice: finalRegularPrice,
      minCart: offerData?.minCart || 0,
      customerType: offerData?.customerType || null,
      hubId: matchedLocation?.hubId || item?.hubId,
      hubName: matchedLocation?.hubName,
    };

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartId = `${item._id}-${dateStr}-${selectedSession.toLowerCase()}`;
    const exists = cart.some((c) => c.cartId === cartId);

    if (exists) {
      fireToast({ title: `Item is already in this slot's cart` });
      return;
    }

    addToCart(itemToAdd, selectedDate, selectedSession, 1, {
      offerProduct: !!(offerData && offerData.isOffer),
      offerPrice: finalOfferPrice,
      regularPrice: finalRegularPrice,
      offerApplied: isOfferApplied,
    });

    const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCarts(updatedCart);
    handleShow();

    if (isOfferApplied) {
      triggerConfetti();
      fireToast({
        title: `🎉 Yay! Special offer applied!`,
        subtitle: `You saved ₹${regularPrice - finalOfferPrice}! Now at just ₹${finalOfferPrice}`,
      });
    }
  };

  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
    const addonedCarts = async () => {
      try {
        await axios.post(
          "https://dd-backend-3nm0.onrender.com/api/cart/addCart",
          {
            userId: user?._id,
            items: storedCart,
            lastUpdated: Date.now,
            username: user?.Fname,
            mobile: user?.Mobile,
          },
        );
      } catch (error) {
        console.log(error);
      }
    };
    if (Carts && Carts.length > 0 && user?._id) {
      addonedCarts();
    }
  }, [JSON.stringify(Carts), user?._id]);

  const updateCartData = (updatedCart) => {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    setCarts(updatedCart);
  };

  const increaseQuantity = (foodItemId, offerData, item, matchedLocation) => {
    const maxStock = matchedLocation?.Remainingstock || 0;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const selectedDateStr = `${year}-${month}-${day}`;
    const sessionLower = selectedSession.toLowerCase();

    const existingItem = Carts.find(
      (cartItem) =>
        cartItem._id === foodItemId &&
        cartItem.deliveryDate === selectedDateStr &&
        cartItem.session === sessionLower,
    );
    if (!existingItem) return;

    const currentQuantity = existingItem.quantity;
    const newQuantity = currentQuantity + 1;

    if (!isOrderingAllowed) {
      fireToast({
        title:
          cutoffValidation.message ||
          `Cannot increase quantity. Orders are closed for ${selectedSession}.`,
      });
      return;
    }

    if (newQuantity > maxStock) {
      fireToast({ title: `No more stock available! Only ${maxStock} left.` });
      return;
    }

    const regularPrice =
      existingItem.regularPrice ||
      existingItem.hubPrice ||
      matchedLocation?.hubPrice ||
      115;
    const offerPrice = existingItem.offerPrice;
    const gotOfferPrice = existingItem.offerApplied === true;

    let newPricePerUnit;
    let newTotalPrice;
    let newOfferApplied = gotOfferPrice;
    let newOfferSavings = 0;

    if (gotOfferPrice && offerPrice) {
      if (currentQuantity === 1 && newQuantity === 2) {
        newPricePerUnit = regularPrice;
        newTotalPrice = offerPrice + regularPrice;
        newOfferSavings = regularPrice * 2 - newTotalPrice;
      } else if (currentQuantity >= 2) {
        newPricePerUnit = regularPrice;
        newTotalPrice = existingItem.totalPrice + regularPrice;
        newOfferSavings = regularPrice * newQuantity - newTotalPrice;
      } else {
        newTotalPrice = offerPrice + regularPrice * (newQuantity - 1);
        newPricePerUnit = regularPrice;
        newOfferSavings = regularPrice * newQuantity - newTotalPrice;
      }
    } else {
      newPricePerUnit = regularPrice;
      newTotalPrice = regularPrice * newQuantity;
      newOfferApplied = false;
    }

    const updatedCart = Carts.map((cartItem) => {
      if (
        cartItem._id === foodItemId &&
        cartItem.deliveryDate === selectedDateStr &&
        cartItem.session === sessionLower
      ) {
        return {
          ...cartItem,
          quantity: newQuantity,
          price: newPricePerUnit,
          totalPrice: newTotalPrice,
          offerApplied: newOfferApplied,
          offerSavings: newOfferSavings,
          offerProduct: cartItem.offerProduct,
          offerPrice: cartItem.offerPrice,
          regularPrice: cartItem.regularPrice,
        };
      }
      return cartItem;
    });

    updateCartData(updatedCart);

    if (gotOfferPrice && currentQuantity === 1 && newQuantity === 2) {
      fireToast({
        title: `Adding at full price — welcome price already used.`,
      });
    }
  };

  const [show, setShow] = useState(true);
  const [expiryDays, setExpiryDays] = useState(0);

  const decreaseQuantity = (foodItemId, offerData, matchedLocation) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const selectedDateStr = `${year}-${month}-${day}`;
    const sessionLower = selectedSession.toLowerCase();

    const existingItem = Carts.find(
      (cartItem) =>
        cartItem._id === foodItemId &&
        cartItem.deliveryDate === selectedDateStr &&
        cartItem.session === sessionLower,
    );
    if (!existingItem) return;

    const currentQuantity = existingItem.quantity;
    const newQuantity = currentQuantity - 1;

    if (!isOrderingAllowed) {
      fireToast({
        title:
          cutoffValidation.message ||
          `Cannot decrease quantity. Orders are closed for ${selectedSession}.`,
      });
      return;
    }

    if (newQuantity <= 0) {
      const updatedCart = Carts.filter(
        (cartItem) =>
          !(
            cartItem._id === foodItemId &&
            cartItem.deliveryDate === selectedDateStr &&
            cartItem.session === sessionLower
          ),
      );
      updateCartData(updatedCart);
      return;
    }

    const regularPrice =
      existingItem.regularPrice ||
      existingItem.hubPrice ||
      matchedLocation?.hubPrice ||
      115;
    const offerPrice = existingItem.offerPrice;
    const gotOfferPrice = existingItem.offerApplied === true;

    let newPricePerUnit;
    let newTotalPrice;
    let newOfferApplied = gotOfferPrice;
    let newOfferSavings = 0;

    if (gotOfferPrice && offerPrice) {
      if (currentQuantity === 2 && newQuantity === 1) {
        newPricePerUnit = offerPrice;
        newTotalPrice = offerPrice;
        newOfferSavings = regularPrice - offerPrice;
      } else if (currentQuantity > 2 && newQuantity >= 2) {
        newTotalPrice = offerPrice + regularPrice * (newQuantity - 1);
        newPricePerUnit = regularPrice;
        newOfferSavings = regularPrice * newQuantity - newTotalPrice;
      } else {
        newTotalPrice = offerPrice + regularPrice * (newQuantity - 1);
        newPricePerUnit = regularPrice;
        newOfferSavings = regularPrice * newQuantity - newTotalPrice;
      }
    } else {
      newPricePerUnit = regularPrice;
      newTotalPrice = regularPrice * newQuantity;
      newOfferApplied = false;
    }

    const updatedCart = Carts.map((cartItem) => {
      if (
        cartItem._id === foodItemId &&
        cartItem.deliveryDate === selectedDateStr &&
        cartItem.session === sessionLower
      ) {
        return {
          ...cartItem,
          quantity: newQuantity,
          price: newPricePerUnit,
          totalPrice: newTotalPrice,
          offerApplied: newOfferApplied,
          offerSavings: newOfferSavings,
          offerProduct: cartItem.offerProduct,
          offerPrice: cartItem.offerPrice,
          regularPrice: cartItem.regularPrice,
        };
      }
      return cartItem;
    });

    updateCartData(updatedCart);
  };

  const groupedCarts = useMemo(() => {
    if (!Carts || Carts.length === 0) return [];
    const groups = Carts.reduce((acc, item) => {
      const key = `${item.deliveryDate}|${item.session}`;
      if (!item.deliveryDate || !item.session) return acc;
      // Normalize session to title case for consistent display and jumping
      const normalizedSession =
        item.session.charAt(0).toUpperCase() +
        item.session.slice(1).toLowerCase();
      if (!acc[key]) {
        acc[key] = {
          session: normalizedSession,
          date: new Date(item.deliveryDate),
          totalItems: 0,
          subtotal: 0,
          items: [],
        };
      }
      acc[key].totalItems += item.quantity || item.Quantity || 0;
      acc[key].subtotal +=
        (item.price || 0) * (item.quantity || item.Quantity || 0);
      acc[key].items.push(item);
      return acc;
    }, {});
    return Object.values(groups).sort((a, b) => a.date - b.date);
  }, [Carts]);

  const overallTotalItems = useMemo(
    () => groupedCarts.reduce((acc, slot) => acc + slot.totalItems, 0),
    [groupedCarts],
  );
  const overallSubtotal = useMemo(
    () => groupedCarts.reduce((acc, slot) => acc + slot.subtotal, 0),
    [groupedCarts],
  );

  const proceedToCheckout = () => {
    if (!user) {
      fireToast({ title: `Please Login!` });
      return;
    }
    if (Carts.length === 0) return;
    if (!address) {
      fireToast({ title: `Please Select Address!` });
      return;
    }
    // Pass the already-fetched delivery rate record so checkout doesn't need to re-fetch
    const deliveryStatus = user?.status === "Employee" ? "Employee" : "Normal";
    const rateRecord = findDeliveryRateRecord(address?.hubId, deliveryStatus);
    navigate("/checkout-multiple", {
      state: { deliveryRateRecord: rateRecord },
    });
  };

  const getCartQuantity = (itemId) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const selectedDateStr = `${year}-${month}-${day}`;
    const sessionLower = selectedSession.toLowerCase();
    const matchingItems = Carts?.filter(
      (cartItem) =>
        (cartItem?._id === itemId || cartItem?.foodItemId === itemId) &&
        cartItem.deliveryDate === selectedDateStr &&
        cartItem.session === sessionLower,
    );
    const totalQuantity = matchingItems?.reduce(
      (total, curr) => total + (curr?.quantity || curr?.Quantity || 0),
      0,
    );
    return totalQuantity || 0;
  };

  useEffect(() => {
    const checkCutoffForDisplay = async () => {
      if (effectiveHubId && selectedDate && selectedSession) {
        await validateCutoffTiming(
          effectiveHubId,
          selectedSession,
          selectedDate,
        );
      }
    };
    checkCutoffForDisplay();
  }, [effectiveHubId, selectedDate, selectedSession, validateCutoffTiming]);

  const lastCartRawRef = useRef(null);
  useEffect(() => {
    const readCart = () => {
      try {
        const raw = localStorage.getItem("cart") || "[]";
        if (raw !== lastCartRawRef.current) {
          lastCartRawRef.current = raw;
          const parsed = JSON.parse(raw);
          setCarts(Array.isArray(parsed) ? parsed : []);
          setCart(Array.isArray(parsed) ? parsed : []);
        }
      } catch (err) {
        console.error("cart sync error", err);
      }
    };
    readCart();
    const intervalId = setInterval(readCart, 1000);
    const onStorage = (e) => {
      if (e.key === "cart") readCart();
    };
    const onCartUpdated = () => readCart();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart_updated", onCartUpdated);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart_updated", onCartUpdated);
    };
  }, [setCarts]);

  useEffect(() => {
    localStorage.removeItem("triggerProceedToPlan");
    sessionStorage.removeItem("justAddedAddress");
  }, []);

  return (
    <div>
      <ToastContainer />
      <div>
        <Banner
          Carts={Carts}
          isVegOnly={isVegOnly}
          setIsVegOnly={setIsVegOnly}
          onLocationDetected={handleLocationDetected}
        />
      </div>

      {user &&
        effectiveHubId &&
        selectedDate &&
        selectedSession &&
        hubSettled &&
        effectiveCutoffValidation?.cutoffDateTime && (
          <CutoffStickyWrapper>
            <CutoffStatusCard
              selectedDate={selectedDate}
              selectedSession={selectedSession}
              userStatus={user?.status}
              cutoffValidation={effectiveCutoffValidation}
              cutoffLoading={false}
              currentSelectedDate={selectedDate}
            />
          </CutoffStickyWrapper>
        )}

      {/* <FreshIngredientsCarousel /> */}

      {/* New User Offer Banner */}
      {(() => {
        const ordersWithOffer = user ? userOfferStatus.usedOfferCount : 0;
        const maxIntroOrders = 3;
        const introRemaining = Math.max(0, maxIntroOrders - ordersWithOffer);

        // Never show for employees
        if (user?.status === "Employee") return null;

        // Hide once all intro orders are used (logged-in only)
        if (user && introRemaining <= 0) return null;

        const headlineMap = {
          3: "3 dishes remaining at welcome price",
          2: "2 dishes remaining at welcome price",
          1: "1 dish remaining at welcome price",
        };
        const heading = user
          ? headlineMap[introRemaining] ||
            introRemaining + " dishes remaining at welcome price"
          : "Your first 3 meals at ₹25";
        const subtext = user
          ? "One per session"
          : "3 discounted dishes · one per session · New users only";

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
            className="user-banner-home"
          >
            <div
              style={{
                backgroundColor: "#6b8e23",
                padding: "10px 16px",
                // borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "14px",
                    lineHeight: "1.3",
                  }}
                >
                  {heading}
                </div>
                <div
                  style={{
                    color: "#ffffff",
                    fontSize: "12px",
                    marginTop: "2px",
                  }}
                >
                  {subtext}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#f5c842",
                  color: "#3b1a00",
                  fontWeight: "700",
                  fontSize: "13px",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  whiteSpace: "nowrap",
                  marginLeft: "12px",
                }}
              >
                ₹25 only
              </div>
            </div>
          </div>
        );
      })()}

      {wallet?.balance > 0 && show && (
        <div style={{ position: "relative" }}>
          <CoinBalance
            wallet={wallet}
            transactions={transactions}
            expiryDays={expiryDays}
            setExpiryDays={setExpiryDays}
            setShow={setShow}
          />
        </div>
      )}

      <div className="sticky-menu-header" style={{ position: "relative" }}>
        <DateSessionSelector
          onChange={handleSelectionChange}
          currentDate={selectedDate}
          currentSession={selectedSession}
          menuData={allHubMenuData}
          hubCutoffData={hubLocalCutoffData}
        />
      </div>

      <Container>
        <RatingModal />
        {loader ? (
          <div
            className="d-flex justify-content-center align-item-center"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
            }}
          >
            <div className="lds-ripple">
              <div></div>
              <div></div>
            </div>
          </div>
        ) : null}
      </Container>


      <div className="maincontainer">
        <div className="mobile-product-box" style={{ marginBottom: "30px" }}>
          <div style={{ marginBottom: "20px" }}>
            <TabsComponent
              tabs={dynamicTabs}
              activeTab={selectedCategory}
              onTabClick={setSelectedCategory}
            />
          </div>

          {!isOrderingAllowed &&
            finalDisplayItems.length === 0 &&
            hubSettled &&
            cutoffValidation?._forSession === selectedSession?.toLowerCase() &&
            cutoffValidation?._forDate ===
              selectedDate?.toISOString().split("T")[0] && (
              <div
                style={{
                  background: "#FFF3E0",
                  border: "1px solid #FF9800",
                  borderRadius: "12px",
                  padding: "20px",
                  margin: "16px",
                  textAlign: "center",
                }}
              >
                <MdOutlineTimer size={48} color="#FF9800" />
                <h4 style={{ marginTop: "12px", color: "#E65100" }}>
                  Orders Closed for {selectedSession}
                </h4>
                <p style={{ color: "#666" }}>{cutoffValidation.message}</p>
              </div>
            )}

          <div className="d-flex gap-1 mb-2 flex-column">
            <div className="row">
              {finalDisplayItems?.map((item, i) => {
                let matchedLocation = item.locationPrice?.[0] || {
                  Remainingstock: 0,
                  hubPrice: item.hubPrice || item.basePrice || 0,
                  preOrderPrice: item.preOrderPrice || 0,
                  basePrice: item.basePrice || 0,
                };

                const productOffer = getProductOffer(item);
                const slotKey = `${selectedDate.toISOString().split("T")[0]}|${selectedSession.toLowerCase()}`;
                const hasOfferInCart = isOfferAlreadyAppliedInCart(slotKey);
                // Only evaluate offer display once both offers and order history have loaded.
                // This prevents the flicker where the price briefly shows the offer price
                // (or original price) before the eligibility check data is available.
                // For non-logged-in users, no user-specific data is needed so skip the wait.
                const offerDataReady = !user || (offerStatusLoaded && ordersLoaded);
                const showOfferPrice =
                  offerDataReady &&
                  productOffer &&
                  !hasOfferInCart &&
                  !productOffer.isBlocked;

                // Debug log for offer items only
                // if (item.isOffer) {
                //   console.log("[OFFER DEBUG] Card render for:", item.foodname, {
                //     offerDataReady,
                //     offerStatusLoaded,
                //     ordersLoaded,
                //     productOffer: productOffer ? "✅ eligible" : "❌ null",
                //     hasOfferInCart,
                //     isBlocked: productOffer?.isBlocked,
                //     showOfferPrice: !!showOfferPrice,
                //     user: user ? user._id : "not logged in",
                //     userOrderCount,
                //     userOfferStatus,
                //   });
                // }
                const { price: effectivePrice } = getEffectivePrice(
                  item,
                  matchedLocation,
                  item?.session,
                );
                const selectedDateISO = selectedDate.toISOString();
                const cartItem = Carts.find(
                  (cartItem) =>
                    cartItem?.foodItemId === item?._id &&
                    cartItem.deliveryDate === selectedDateISO &&
                    cartItem.session === selectedSession,
                );

                let displayPrice = effectivePrice;
                let offerPrice = null;

                if (cartItem && typeof cartItem.totalPrice === "number") {
                  // If the item is in cart with offer applied, show cart total and strikethrough regular
                  if (cartItem.offerApplied) {
                    displayPrice = Math.round(cartItem.totalPrice);
                    if (cartItem.Quantity > 1 && cartItem.regularPrice) {
                      offerPrice = Math.round(
                        cartItem.regularPrice * cartItem.Quantity,
                      );
                    }
                  } else if (showOfferPrice && productOffer?.offerPrice) {
                    // Item is in cart at regular price (offer limit exceeded) but offer still exists —
                    // keep showing the offer price so the user knows what the offer is.
                    displayPrice = productOffer.offerPrice;
                    offerPrice = effectivePrice;
                  } else {
                    displayPrice = Math.round(cartItem.totalPrice);
                  }
                } else if (showOfferPrice && productOffer?.offerPrice) {
                  displayPrice = productOffer.offerPrice;
                  offerPrice = effectivePrice;
                }

                return (
                  <div
                    key={item._id?.toString() || i}
                    className="col-6 col-md-6 mb-2 d-flex justify-content-center"
                  >
                    <div className="mobl-product-card">
                      <div
                        className="productborder"
                        style={{ position: "relative" }}
                      >
                        {showOfferPrice && (
                          <div className="premium-offer-badge">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              style={{ marginRight: "6px" }}
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span>WELCOME OFFER</span>
                          </div>
                        )}
                        <div className="prduct-box rounded-1 cardbx">
                          <div
                            onClick={() => showDrawer(item)}
                            className="imagebg"
                          >
                            {item?.foodcategory === "Veg" ? (
                              <img
                                src={IsVeg}
                                alt="IsVeg"
                                className="isVegIcon"
                              />
                            ) : (
                              <img
                                src={IsNonVeg}
                                alt="IsNonVeg"
                                className="isVegIcon"
                              />
                            )}
                            <img
                              src={`${item?.Foodgallery[0]?.image2}`}
                              alt=""
                              className="mbl-product-img"
                            />
                          </div>
                        </div>
                        {item?.foodTags && (
                          <div className="food-tag-container">
                            {item.foodTags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="food-tag-pill"
                                style={{ backgroundColor: tag.tagColor }}
                              >
                                <img
                                  src={chef}
                                  alt=""
                                  style={{
                                    width: "10px",
                                    height: "10px",
                                    marginRight: "2px",
                                  }}
                                />
                                {tag.tagName}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="food-name-container">
                          <p className="food-name">{item?.foodname}</p>
                          <small className="food-unit">{item?.unit}</small>
                        </div>
                        <div
                          className="d-flex align-items-center mb-3"
                          style={{
                            gap: "8px",
                            flexWrap: "wrap",
                            paddingLeft: "6px",
                          }}
                        >
                          <div
                            className="d-flex align-items-center"
                            style={{ gap: "8px" }}
                          >
                            {offerPrice && (
                              <div
                                className="align-items-start"
                                style={{
                                  textDecoration: "line-through",
                                  color: "#6b6b6b",
                                  fontSize: "15px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                  display: "flex",
                                  gap: "2px",
                                }}
                              >
                                <span className="fw-normal">₹</span>
                                <span>{offerPrice}</span>
                              </div>
                            )}
                            <div
                              className="align-items-start"
                              style={{
                                color: "#2c2c2c",
                                fontFamily: "Inter",
                                fontSize: "20px",
                                fontWeight: "500",
                                lineHeight: "25px",
                                letterSpacing: "-0.8px",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                display: "flex",
                                gap: "2px",
                              }}
                            >
                              <div
                                className="align-items-start"
                                style={{
                                  display: "flex",
                                  gap: "1px",
                                }}
                              >
                                <span className="fw-bold">₹</span>
                                <span>{displayPrice}</span>
                              </div>
                            </div>
                          </div>
                          {showOfferPrice && offerPrice && (
                            <div className="offer-percentage-badge">
                              {Math.round(
                                ((offerPrice - displayPrice) / offerPrice) *
                                  100,
                              )}
                              % OFF
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="guaranteed-label">
                            <img
                              src={availabity}
                              alt=""
                              style={{ width: "11px", height: "11px" }}
                            />{" "}
                            Guaranteed Availability
                          </div>
                        </div>
                        <div className="d-flex justify-content-center mb-2">
                          {getCartQuantity(item?._id) === 0 ? (
                            address && gifUrl === "Closed.gif" ? (
                              <button
                                className="add-to-cart-btn-disabled"
                                disabled
                              >
                                <span className="add-to-cart-btn-text">
                                  Add
                                </span>
                                <FaPlus className="add-to-cart-btn-icon" />
                              </button>
                            ) : (
                              <button
                                className={`add-to-cart-btn ${(user && !address) || !isOrderingAllowed ? "disabled-btn" : ""}`}
                                onClick={() =>
                                  addCart1(item, productOffer, matchedLocation)
                                }
                                disabled={
                                  (user && !address) || !isOrderingAllowed
                                }
                                style={{
                                  opacity:
                                    (user && !address) || !isOrderingAllowed
                                      ? 0.5
                                      : 1,
                                  cursor:
                                    (user && !address) || !isOrderingAllowed
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                              >
                                <div className="pick-btn-text">
                                  <span className="pick-btn-text1">ADD</span>
                                </div>
                                <span className="add-to-cart-btn-icon">
                                  <FaPlus />
                                </span>
                              </button>
                            )
                          ) : getCartQuantity(item?._id) > 0 ? (
                            <button className="increaseBtn">
                              <div
                                className="faplus"
                                onClick={() =>
                                  !(user && !address) && !isOrderingAllowed
                                    ? null
                                    : decreaseQuantity(
                                        item?._id,
                                        productOffer,
                                        matchedLocation,
                                      )
                                }
                                style={{
                                  opacity:
                                    (user && !address) || !isOrderingAllowed
                                      ? 0.5
                                      : 1,
                                  pointerEvents:
                                    (user && !address) || !isOrderingAllowed
                                      ? "none"
                                      : "auto",
                                }}
                              >
                                <FaMinus />
                              </div>
                              <div className="faQuantity">
                                {getCartQuantity(item?._id)}
                              </div>
                              <div
                                className="faplus"
                                onClick={() =>
                                  !(user && !address) && !isOrderingAllowed
                                    ? null
                                    : increaseQuantity(
                                        item?._id,
                                        productOffer,
                                        item,
                                        matchedLocation,
                                      )
                                }
                                style={{
                                  opacity:
                                    (user && !address) || !isOrderingAllowed
                                      ? 0.5
                                      : 1,
                                  pointerEvents:
                                    (user && !address) || !isOrderingAllowed
                                      ? "none"
                                      : "auto",
                                }}
                              >
                                <FaPlus />
                              </div>
                            </button>
                          ) : gifUrl === "Closed.gif" ? (
                            <button className="add-to-cart-btn" disabled>
                              <span className="add-to-cart-btn-text">Add</span>
                              <span className="add-to-cart-btn-icon">
                                <FaPlus />
                              </span>
                            </button>
                          ) : (
                            <button
                              className="add-to-cart-btn"
                              onClick={() =>
                                addCart1(item, productOffer, matchedLocation)
                              }
                              disabled={user && !address}
                              style={{ opacity: user && !address ? 0.5 : 1 }}
                            >
                              <span className="add-to-cart-btn-text">Add</span>
                              <span className="add-to-cart-btn-icon">
                                <FaPlus />
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!loader &&
                !cutoffLoading &&
                finalDisplayItems.length === 0 &&
                isOrderingAllowed && (
                  <div className="col-12 text-center my-5">
                    {user &&
                    (!localStorage.getItem("primaryAddress") ||
                      localStorage.getItem("primaryAddress") === "null") ? (
                      <div>
                        <h4>No location selected.</h4>
                        <p>
                          Please add your location to view the menu for your
                          area.
                        </p>
                        <button
                          className="mt-2"
                          onClick={() => navigate("/location")}
                          style={{
                            backgroundColor: "#6B8E23",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            border: "none",
                          }}
                        >
                          Add Location
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4>No items available for this slot.</h4>
                        <p>
                          Please check back later or select a different day!
                        </p>
                      </>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <MultiCartDrawer
        proceedToPlan={proceedToCheckout}
        groupedCarts={groupedCarts}
        overallSubtotal={overallSubtotal}
        overallTotalItems={overallTotalItems}
        onJumpToSlot={handleSelectionChange}
      />

      <Drawer
        placement="bottom"
        closable={false}
        onClose={onClose}
        open={open}
        key="bottom"
        height={600}
        className="description-product"
        style={{ zIndex: 99999 }}
        zIndex={99999}
      >
        <div className="modal-container-food">
          <button className="custom-close-btn" onClick={onClose}>
            ×
          </button>
          <div className="modern-food-item">
            <div className="food-image-container">
              <div className="image-loading-spinner" id="image-spinner"></div>
              {foodData?.Foodgallery?.length > 0 && (
                <img
                  src={`${foodData.Foodgallery[0].image2}`}
                  alt={foodData?.foodname}
                  className="modern-food-image"
                  onLoad={() => {
                    const spinner = document.getElementById("image-spinner");
                    const image = document.querySelector(".modern-food-image");
                    if (spinner) spinner.classList.add("hidden");
                    if (image) image.classList.add("loaded");
                  }}
                  onError={() => {
                    const spinner = document.getElementById("image-spinner");
                    if (spinner) spinner.classList.add("hidden");
                  }}
                />
              )}
              <div className="food-category-icon">
                {foodData?.foodcategory === "Veg" ? (
                  <img src={IsVeg} alt="IsVeg" className="isVegIcon" />
                ) : (
                  <img src={IsNonVeg} alt="IsNonVeg" className="isVegIcon" />
                )}
              </div>
            </div>
            <div className="food-details">
              <h2 className="food-title">{foodData?.foodname}</h2>
              <p className="food-description">{foodData?.fooddescription}</p>
              {(() => {
                const matchedLocation =
                  foodData?.locationPrice?.length > 0
                    ? foodData.locationPrice[0]
                    : {
                        Remainingstock: 0,
                        hubPrice: foodData.hubPrice || foodData.basePrice || 0,
                        preOrderPrice: foodData.preOrderPrice || 0,
                        basePrice: foodData.basePrice || 0,
                      };
                const productOffer = getProductOffer(foodData);
                const slotKey = `${selectedDate.toISOString().split("T")[0]}|${selectedSession.toLowerCase()}`;
                const hasOfferInCart = isOfferAlreadyAppliedInCart(slotKey);
                const showOfferPrice =
                  (!user || (offerStatusLoaded && ordersLoaded)) &&
                  productOffer && !hasOfferInCart && !productOffer.isBlocked;
                const eff = getEffectivePrice(
                  foodData,
                  matchedLocation,
                  foodData?.session,
                );
                const currentPrice =
                  showOfferPrice && productOffer?.offerPrice
                    ? productOffer.offerPrice
                    : eff.price;
                const originalPrice = eff.price;
                const stockCount = matchedLocation?.Remainingstock || 0;

                return (
                  <>
                    <div className="pricing-section">
                      <div className="pricing-display">
                        <span className="current-price">₹{currentPrice}</span>
                        {showOfferPrice && (
                          <span
                            className="original-price"
                            style={{ marginLeft: "10px" }}
                          >
                            ₹{originalPrice}
                          </span>
                        )}
                      </div>
                      {/* <div className="availability-banner">
                        {stockCount > 0 ? (
                          <>
                            {showOfferPrice && (
                              <BiSolidOffer
                                color="green"
                                style={{ marginRight: "5px" }}
                              />
                            )}
                            {productOffer &&
                              productOffer.customerType !== undefined && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    marginLeft: "5px",
                                  }}
                                >
                                  {productOffer.customerType === 0
                                    ? "(First Order Only)"
                                    : productOffer.customerType === 1
                                      ? "(Up to 1 Order)"
                                      : `(Up to ${productOffer.customerType} orders)`}
                                </span>
                              )}
                          </>
                        ) : (
                          "Sold Out"
                        )}
                      </div> */}
                    </div>
                    {/* {getCartQuantity(foodData?._id) > 0 ? (
                      <div className="increaseBtn">
                        <div
                          className="faplus"
                          onClick={() => {
                            if (!(user && !address) && cutoffValidation.allowed)
                              decreaseQuantity(
                                foodData?._id,
                                productOffer,
                                matchedLocation,
                              );
                          }}
                          style={{
                            opacity:
                              (user && !address) || !cutoffValidation.allowed
                                ? 0.5
                                : 1,
                            pointerEvents:
                              (user && !address) || !cutoffValidation.allowed
                                ? "none"
                                : "auto",
                          }}
                        >
                          <FaMinus />
                        </div>
                        <div className="faQuantity">
                          {getCartQuantity(foodData?._id)}
                        </div>
                        <div
                          className="faplus"
                          onClick={() => {
                            if (!(user && !address) && cutoffValidation.allowed)
                              increaseQuantity(
                                foodData?._id,
                                productOffer,
                                foodData,
                                matchedLocation,
                              );
                          }}
                          style={{
                            opacity:
                              (user && !address) || !cutoffValidation.allowed
                                ? 0.5
                                : 1,
                            pointerEvents:
                              (user && !address) || !cutoffValidation.allowed
                                ? "none"
                                : "auto",
                          }}
                        >
                          <FaPlus />
                        </div>
                      </div>
                    ) : stockCount > 0 && gifUrl !== "Closed.gif" ? (
                      <button
                        className="add-to-cart-btn"
                        onClick={() =>
                          addCart1(foodData, productOffer, matchedLocation)
                        }
                        disabled={
                          (user && !address) || !cutoffValidation.allowed
                        }
                        style={{
                          opacity:
                            (user && !address) || !cutoffValidation.allowed
                              ? 0.5
                              : 1,
                          cursor:
                            (user && !address) || !cutoffValidation.allowed
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        <span className="add-to-cart-btn-text">Add</span>
                        <span className="add-to-cart-btn-icon">
                          <FaPlus />
                        </span>
                      </button>
                    ) : (
                      <button
                        className={
                          gifUrl === "Closed.gif" || !cutoffValidation.allowed
                            ? "add-to-cart-btn-disabled"
                            : "sold-out-btn"
                        }
                        disabled
                      >
                        <span className="add-to-cart-btn-text">
                          {gifUrl === "Closed.gif"
                            ? "Closed"
                            : !cutoffValidation.allowed
                              ? "Orders Closed"
                              : "Sold Out"}
                        </span>
                      </button>
                    )} */}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </Drawer>

      {/* <div style={{ marginBottom: "80px" }}>
        <Footer />
      </div> */}
      <BottomNav />
    </div>
  );
};

const TabsComponent = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="tabs-container2">
      <div className="tabs-scroll-container">
        <div className="tabs-scroll">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => onTabClick(tab)}
            >
              <span className="tab-button-text">{tab}</span>
            </button>
          ))}
        </div>
      </div>
      <style jsx>{`
        .tabs-container2 {
          background-color: ${Colors.creamWalls};
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
          position: relative;
          border-bottom: 2px solid #fff;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.1),
            0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .tabs-scroll-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .tabs-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .tabs-scroll {
          display: inline-flex;
          min-width: 100%;
          gap: 10px;
          padding: 0 4px;
        }
        .tab-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: 8px 24px;
          border-radius: 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          flex-shrink: 0;
          min-height: 25px;
        }
        .tab-button:hover {
          background-color: ${Colors.warmbeige}40;
          transform: translateY(-1px);
        }
        .tab-button.active {
          background-color: ${Colors.greenCardamom};
          padding: 4px 8px;
          box-shadow: 0 2px 8px ${Colors.greenCardamom}80;
          width: auto;
          height: auto;
          border-radius: 20px;
        }
        .tab-button.active:hover {
          background-color: ${Colors.greenCardamom}E6;
          transform: translateY(-1px) scale(1.02);
        }
        .tab-button-text {
          font-family: "Inter", sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 18px;
          letter-spacing: -0.7px;
          color: ${Colors.primaryText};
          transition: all 0.3s ease;
        }
        .tab-button.active .tab-button-text {
          font-size: 16px;
          font-weight: 900;
          line-height: 21px;
          letter-spacing: -0.8px;
          color: ${Colors.appForeground};
        }
      `}</style>
    </div>
  );
};

export default Home;
