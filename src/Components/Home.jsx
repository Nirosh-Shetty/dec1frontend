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
  const [gifUrl, setGifUrl] = useState("");
  const [message, setMessage] = useState("");
  const [AllOffer, setAllOffer] = useState([]);
  const [totalOrder, setTotalOrder] = useState([]);

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

  const getTotalOrder = async () => {
    try {
      let res = await axios.get("https://dd-backend-3nm0.onrender.com/api/admin/getallorders");
      if (res.status === 200) {
        setTotalOrder(res.data.order.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTotalOrder();
  }, []);

  const findNumberofOrders = () => {
    const customerId = user?._id;
    if (!customerId) return 0;
    return totalOrder.filter((customer) => customer?.customerId === customerId)
      .length;
  };

  const hasUserUsedOffer = (session = selectedSession) => {
    const customerId = user?._id;
    if (!customerId) return false;

    const selectedDateStr =
      selectedDate instanceof Date
        ? selectedDate.toISOString().split("T")[0]
        : new Date(selectedDate).toISOString().split("T")[0];

    const sessionLower = session?.toLowerCase();

    return totalOrder.some((order) => {
      if (order?.customerId !== customerId) return false;

      const orderDeliveryDate = order?.deliveryDate
        ? new Date(order.deliveryDate).toISOString().split("T")[0]
        : null;
      if (orderDeliveryDate !== selectedDateStr) return false;

      const orderItems =
        order?.allProduct || order?.items || order?.cartItems || [];
      return orderItems.some(
        (item) =>
          item?.offerApplied === true &&
          item?.session?.toLowerCase() === sessionLower,
      );
    });
  };

  const doesCustomerQualifyForOffer = (
    customerOrderCount,
    offerCustomerType,
  ) => {
    if (offerCustomerType === -1) return true;
    if (offerCustomerType === 0) return customerOrderCount === 0;
    return customerOrderCount <= offerCustomerType;
  };

  const getCustomerOrderCount = useMemo(() => {
    return findNumberofOrders();
  }, [user, totalOrder]);

  const getAllOffer = async () => {
    try {
      const response = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/admin/offers",
      );
      if (response.status === 200 && response.data?.data) {
        let offers = response.data.data;
        if (user?._id) {
          const customerOrderCount = findNumberofOrders();
          const filteredOffers = offers.filter((offer) => {
            return offer.products.some((product) =>
              doesCustomerQualifyForOffer(
                customerOrderCount,
                product.customerType,
              ),
            );
          });
          const processedOffers = filteredOffers.map((offer) => ({
            ...offer,
            products: offer.products.filter((product) =>
              doesCustomerQualifyForOffer(
                customerOrderCount,
                product.customerType,
              ),
            ),
          }));
          setAllOffer(processedOffers);
        } else {
          const publicOffers = offers
            .filter((offer) =>
              offer.products.some(
                (product) =>
                  product.customerType === -1 || product.customerType === 0,
              ),
            )
            .map((offer) => ({
              ...offer,
              products: offer.products.filter(
                (product) =>
                  product.customerType === -1 || product.customerType === 0,
              ),
            }));
          setAllOffer(publicOffers);
        }
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setAllOffer([]);
    }
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

        console.log("[validateCutoffTiming] Request:", {
          hubId,
          session: session.toLowerCase(),
          status,
          deliveryDate:
            deliveryDate instanceof Date
              ? deliveryDate.toISOString()
              : deliveryDate,
        });

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
          console.log(
            "[validateCutoffTiming] Raw API response:",
            response.data,
          );

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

          console.log("[validateCutoffTiming] Corrected times:", {
            rawCutoff: rawCutoff?.toISOString(),
            correctedCutoff: correctedCutoff?.toISOString(),
            now: new Date().toISOString(),
            allowed: response.data.allowed,
          });

          const validationData = {
            allowed: response.data.allowed,
            message: response.data.message,
            cutoffDateTime: correctedCutoff,
            nextAvailableDateTime: correctedNext,
            orderMode: response.data.orderMode || "preorder",
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
      if (address?.hubId) {
        validateCutoffTiming(address.hubId, nextSession, selectedDate);
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
            if (address?.hubId) {
              validateCutoffTiming(address.hubId, firstSession, futureDate);
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
    address?.hubId,
    validateCutoffTiming,
  ]);

  const isOfferAlreadyAppliedInCart = (slotKey = null) => {
    if (!Carts || Carts.length === 0) return false;
    return Carts.some((item) => {
      if (slotKey) {
        const itemDateStr =
          item.deliveryDate?.split("T")[0] || item.deliveryDate;
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

  const getAppliedOfferFromCart = (slotKey = null) => {
    if (!Carts || Carts.length === 0) return null;
    return Carts.find((item) => {
      if (slotKey) {
        const itemDateStr =
          item.deliveryDate?.split("T")[0] || item.deliveryDate;
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
      if (autoJumpedHubRef.current !== address?.hubId) return;

      const currentAddress =
        address ||
        (() => {
          try {
            const primaryAddress = localStorage.getItem("primaryAddress");
            const currentLocation = localStorage.getItem("currentLocation");
            return primaryAddress
              ? JSON.parse(primaryAddress)
              : currentLocation
                ? JSON.parse(currentLocation)
                : null;
          } catch {
            return null;
          }
        })();
      if (currentAddress?.hubId && selectedDate && selectedSession) {
        await validateCutoffTiming(
          currentAddress.hubId,
          selectedSession,
          selectedDate,
        );
      }
    };
    checkCutoff();
  }, [
    address,
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
    const hubChanged = autoJumpedHubRef.current !== address?.hubId;
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
      autoJumpedHubRef.current = address?.hubId;
      setSelectedDate(checkDate);
      setSelectedSession(firstSession);
      setSelectedCategory("");
      if (address?.hubId) {
        validateCutoffTiming(address.hubId, firstSession, checkDate);
      }
      return;
    }
  }, [
    allHubMenuData,
    hubLocalCutoffData,
    isSessionPastCutoffLocal,
    address?.hubId,
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
              "694e3650e5d3b79091854de9",
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
    const hubIdToUse =
      address?.hubId ||
      (shouldLoadDefaultMenu && !user ? "694e3650e5d3b79091854de9" : null);

    if (!hubIdToUse) {
      setAllHubMenuData([]);
      setHubLocalCutoffData(null);
      setloader(false);
      return;
    }

    // Reset auto-jump guard so the new hub gets a fresh auto-jump
    autoJumpedToRef.current = null;
    autoJumpedHubRef.current = null;
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
          axios.get("https://dd-backend-3nm0.onrender.com/api/user/get-hub-menu", {
            params: { hubId: hubIdToUse },
          }),
          fetch(
            `https://dd-backend-3nm0.onrender.com/api/Hub/get-cutoff-times/${hubIdToUse}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);

        // Process menu
        if (menuRes.status === "fulfilled" && menuRes.value.status === 200) {
          setAllHubMenuData(menuRes.value.data.menu);
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
  }, [address?.hubId, shouldLoadDefaultMenu, user]);

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
    if (address?.hubId && date1 && session1) {
      validateCutoffTiming(address.hubId, session1, date1);
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

  const currentSlotItems = useMemo(() => {
    if (!allHubMenuData?.length) return [];

    // Only block items if cutoff is not allowed AND we're viewing today's date
    // For future dates, always show the menu
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const selKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    const isViewingToday = todayKey === selKey;

    if (!cutoffValidation.allowed && isViewingToday) {
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
  }, [allHubMenuData, selectedDate, selectedSession, cutoffValidation.allowed]);

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
    const beforeCutoff = cutoffValidation.allowed;
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
      const primaryAddressJson = localStorage.getItem("primaryAddress");
      if (!primaryAddressJson || !AllOffer?.length) return null;
      const primaryAddress = JSON.parse(primaryAddressJson);
      const isEmployeeForOffer = user?.status === "Employee";
      const acquisitionChannelForOffer = isEmployeeForOffer
        ? "employee"
        : user?.acquisition_channel || "organic";
      const customerOrderCount = findNumberofOrders();
      const dateStr =
        selectedDate instanceof Date
          ? selectedDate.toISOString().split("T")[0]
          : new Date(selectedDate).toISOString().split("T")[0];
      const slotKey = `${dateStr}|${selectedSession.toLowerCase()}`;
      const hasOfferInCart = isOfferAlreadyAppliedInCart(slotKey);

      for (const offer of AllOffer) {
        const hubMatches = offer?.hubId === primaryAddress?.hubId;
        const acquisitionChannelMatch =
          offer?.acquisition_channel === acquisitionChannelForOffer;
        const offerStartDate = new Date(offer?.startDate);
        const offerEndDate = new Date(offer?.endDate);
        const deliverydate = new Date(item.deliveryDate);
        const isWithinDateRange =
          deliverydate >= offerStartDate && deliverydate <= offerEndDate;

        if (hubMatches && isWithinDateRange && acquisitionChannelMatch) {
          const matchingProduct = offer.products?.find(
            (product) =>
              product?.foodItemId?.toString() === item?._id?.toString(),
          );
          if (matchingProduct) {
            const customerQualifies = doesCustomerQualifyForOffer(
              customerOrderCount,
              matchingProduct.customerType,
            );
            if (!customerQualifies) return null;
            if (hasUserUsedOffer()) return null;
            if (hasOfferInCart) return { ...matchingProduct, isBlocked: true };
            return matchingProduct;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting product offer:", error);
      return null;
    }
  };

  const [deliveryCharge, setDeliveryCharge] = useState([]);
  const getDeliveryRates = async () => {
    try {
      const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/deliveryrate/all");
      setDeliveryCharge(res.data.data);
    } catch (error) {
      console.error("Error fetching delivery rates:", error);
    }
  };

  useEffect(() => {
    getDeliveryRates();
  }, []);

  const findDeliveryRate = (hubId, acquisitionChannel, status) => {
    if (!deliveryCharge || deliveryCharge.length === 0) return 15;
    const matchedRate = deliveryCharge.find(
      (rate) =>
        rate.hubId === hubId &&
        rate.acquisition_channel === acquisitionChannel &&
        rate.status === status,
    );
    return matchedRate?.deliveryRate || 15;
  };

  const isEmployeeForDelivery = user?.status === "Employee";
  const acquisitionChannelForDelivery = isEmployeeForDelivery
    ? "employee"
    : user?.acquisition_channel || "organic";
  const userStatus = user?.status;
  const hubId = address?.hubId;
  const deliveryRate = findDeliveryRate(
    hubId,
    acquisitionChannelForDelivery,
    userStatus,
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
    if (!cutoffValidation.allowed) {
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

    if (offerData && offerData.customerType !== undefined && user?._id) {
      const customerOrderCount = findNumberofOrders();
      const customerQualifies = doesCustomerQualifyForOffer(
        customerOrderCount,
        offerData.customerType,
      );
      if (!customerQualifies) {
        let message =
          offerData.customerType === 0
            ? `This offer is only for first-time customers! You have already placed ${customerOrderCount} order(s).`
            : `This offer is for customers with ${offerData.customerType} or fewer orders. You have placed ${customerOrderCount} order(s).`;
        fireToast({ title: message });
        return;
      }
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

    if (offerData && offerData.price && user?._id) {
      const customerOrderCount = findNumberofOrders();
      const customerQualifies = doesCustomerQualifyForOffer(
        customerOrderCount,
        offerData.customerType,
      );
      if (customerQualifies) {
        if (!hasOfferInCart && !hasUserUsedOffer()) {
          appliedPrice = offerData.price;
          isOfferApplied = true;
          finalOfferPrice = offerData.price;
        } else if (hasUserUsedOffer()) {
          appliedPrice = regularPrice;
          isOfferApplied = false;
          fireToast({
            title: `You've already used this offer for ${selectedSession} today.`,
          });
        } else {
          appliedPrice = regularPrice;
          isOfferApplied = false;
          fireToast({
            title: `Only one offer per slot allowed! ${appliedOffer?.foodname} already has the offer.`,
          });
        }
      } else {
        appliedPrice = regularPrice;
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
      offerProduct: !!offerData,
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
      offerProduct: !!offerData,
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
        await axios.post("https://dd-backend-3nm0.onrender.com/api/cart/addCart", {
          userId: user?._id,
          items: storedCart,
          lastUpdated: Date.now,
          username: user?.Fname,
          mobile: user?.Mobile,
        });
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

    if (!cutoffValidation.allowed) {
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
      fireToast({ title: `Second item added at ₹${regularPrice}` });
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

    if (!cutoffValidation.allowed) {
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

  useEffect(() => {
    if (Carts?.length > 0) handleShow();
    getAllOffer();
  }, [user?._id]);

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
    navigate("/checkout-multiple");
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
      if (address?.hubId && selectedDate && selectedSession) {
        await validateCutoffTiming(
          address.hubId,
          selectedSession,
          selectedDate,
        );
      }
    };
    checkCutoffForDisplay();
  }, [address?.hubId, selectedDate, selectedSession, validateCutoffTiming]);

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

  // Rest of the return statement remains the same...
  return (
    <div>
      <ToastContainer />
      <div>
        <Banner
          Carts={Carts}
          getAllOffer={getAllOffer}
          isVegOnly={isVegOnly}
          setIsVegOnly={setIsVegOnly}
          onLocationDetected={handleLocationDetected}
        />
      </div>

      {address?.hubId &&
        selectedDate &&
        selectedSession &&
        (hubLocalCutoffData &&
        cutoffValidation?.cutoffDateTime &&
        autoJumpedHubRef.current === address?.hubId ? (
          <CutoffStatusCard
            selectedDate={selectedDate}
            selectedSession={selectedSession}
            userStatus={user?.status}
            cutoffValidation={cutoffValidation}
            cutoffLoading={false}
            currentSelectedDate={selectedDate}
          />
        ) : (
          <CutoffStatusCard
            selectedDate={selectedDate}
            selectedSession={selectedSession}
            userStatus={user?.status}
            cutoffValidation={null}
            cutoffLoading={true}
            currentSelectedDate={selectedDate}
          />
        ))}

      <FreshIngredientsCarousel />

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

          {!cutoffValidation.allowed && finalDisplayItems.length === 0 && (
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
                const showOfferPrice =
                  productOffer && !hasOfferInCart && !productOffer.isBlocked;
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
                  displayPrice = Math.round(cartItem.totalPrice);
                  if (
                    cartItem.offerApplied &&
                    cartItem.Quantity > 1 &&
                    cartItem.regularPrice
                  ) {
                    offerPrice = Math.round(
                      cartItem.regularPrice * cartItem.Quantity,
                    );
                  }
                } else if (showOfferPrice && productOffer?.price) {
                  displayPrice = productOffer.price;
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
                            <span>SPECIAL OFFER</span>
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
                                className={`add-to-cart-btn ${(user && !address) || !cutoffValidation.allowed ? "disabled-btn" : ""}`}
                                onClick={() =>
                                  addCart1(item, productOffer, matchedLocation)
                                }
                                disabled={
                                  (user && !address) ||
                                  !cutoffValidation.allowed
                                }
                                style={{
                                  opacity:
                                    (user && !address) ||
                                    !cutoffValidation.allowed
                                      ? 0.5
                                      : 1,
                                  cursor:
                                    (user && !address) ||
                                    !cutoffValidation.allowed
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
                                  !(user && !address) &&
                                  !cutoffValidation.allowed
                                    ? null
                                    : decreaseQuantity(
                                        item?._id,
                                        productOffer,
                                        matchedLocation,
                                      )
                                }
                                style={{
                                  opacity:
                                    (user && !address) ||
                                    !cutoffValidation.allowed
                                      ? 0.5
                                      : 1,
                                  pointerEvents:
                                    (user && !address) ||
                                    !cutoffValidation.allowed
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
                                  !(user && !address) &&
                                  !cutoffValidation.allowed
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
                                    (user && !address) ||
                                    !cutoffValidation.allowed
                                      ? 0.5
                                      : 1,
                                  pointerEvents:
                                    (user && !address) ||
                                    !cutoffValidation.allowed
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
                cutoffValidation.allowed && (
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
                  productOffer && !hasOfferInCart && !productOffer.isBlocked;
                const eff = getEffectivePrice(
                  foodData,
                  matchedLocation,
                  foodData?.session,
                );
                const currentPrice =
                  showOfferPrice && productOffer?.price
                    ? productOffer.price
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
