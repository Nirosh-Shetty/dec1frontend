import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { MdRemoveShoppingCart } from "react-icons/md";
import "../Styles/Checkout.css";
import { FaCheck } from "react-icons/fa";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { WalletContext } from "../WalletContext";
import Swal2 from "sweetalert2";
import IsVeg from "../assets/isVeg=yes.svg";
import IsNonVeg from "../assets/isVeg=no.svg";
import "../Styles/Normal.css";
import "../Styles/CheckoutMultiple.css";
import { CircleCheck, ShieldAlert } from "lucide-react";
import checkCircle from "../assets/check_circle.png";
import cross from "../assets/cross.png";
import LocationModal from "./LocationModal";
import {
  getCart,
  getCartGroupedByDateSession,
  calculateCartTotals,
  getCartSummary,
  clearCart,
  updateCartItemQty,
  isSlotPastCutoff,
} from "../Helper/cartHelper";
import bagdiscount from "./../assets/bagdiscount.png";
import breakfast from "./../assets/breakfast.png";
import dinner from "./../assets/dinner.png";
import lunch from "./../assets/lunch.png";
import { Modal } from "react-bootstrap";
import door from "./../assets/door.png";
import lobby from "./../assets/lobby.png";
import { FaScaleBalanced } from "react-icons/fa6";

const fireToast = ({ title, subtitle, icon = checkCircle }) => {
  Swal2.fire({
    toast: true,
    position: "bottom",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    html: `<div class="myplans-toast-content"><img src="${icon}" alt="" class="myplans-toast-check" /><div class="myplans-toast-text"><div class="myplans-toast-title">${title}</div>${subtitle ? `<div class="myplans-toast-subtitle">${subtitle}</div>` : ""}</div></div>`,
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

const CheckoutMultiple = () => {
  const navigate = useNavigate();
  const { wallet, walletSeting, fetchWalletData } = useContext(WalletContext);
  const location = useLocation();
  const data = location?.state;
  const addresstype = localStorage.getItem("addresstype");

  // Add this with your other state declarations
  const [addMoreModal, setAddMoreModal] = useState({
    show: false,
    hubId: null,
    session: null,
    deliveryDate: null,
  });

  // State declarations
  const [deliveryMethod, setDeliveryMethod] = useState("slot");
  const [address, setAddress] = useState(
    JSON.parse(localStorage.getItem("coporateaddress")) || {},
  );
  const [expandedSections, setExpandedSections] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [childName, setChildName] = useState("");
  const [childClass, setChildClass] = useState("");
  const [childSection, setChildSection] = useState("");
  const storedInfo =
    JSON.parse(localStorage.getItem("studentInformation")) || {};
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [cartVersion, setCartVersion] = useState(0);

  // Add state for modal
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState(null);
  // Add this state
  const [pickupPointsList, setPickupPointsList] = useState([]);

  // Get cart data from helper
  const cartItems = useMemo(() => getCart(), [cartVersion]);

  console.log(cartItems, "cartItems.................");

  // Handle opening the add more modal
  const handleOpenAddMoreModal = (hubId, session, deliveryDate) => {
    setAddMoreModal({
      show: true,
      hubId: hubId,
      session: session,
      deliveryDate: deliveryDate,
    });
  };

  // Handle closing the add more modal
  const handleCloseAddMoreModal = () => {
    setAddMoreModal({
      show: false,
      hubId: null,
      session: null,
      deliveryDate: null,
    });
  };

  // Handle items added from modal
  const handleItemsAdded = () => {
    refreshCartData();
  };

  const groupedCarts = useMemo(() => {
    try {
      return getCartGroupedByDateSession();
    } catch (error) {
      console.error("Error grouping cart items:", error);
      return {};
    }
  }, [cartItems]);

  const totals = useMemo(() => {
    try {
      return calculateCartTotals();
    } catch (error) {
      console.error("Error calculating totals:", error);
      return {
        bySlot: {},
        total: 0,
        itemCount: 0,
        totalSavings: 0,
        regularTotal: 0,
      };
    }
  }, [cartItems]);

  const summary = useMemo(() => {
    try {
      return getCartSummary();
    } catch (error) {
      console.error("Error getting cart summary:", error);
      return {
        summary: "0 meals · 0 days",
        dates: [],
        datesFull: [],
        mealCount: 0,
        dayCount: 0,
        totalSavings: 0,
      };
    }
  }, [cartItems]);

  const [cartdata, setCartData] = useState(cartItems);
  const lastCartRawRef = useRef(null);

  // Force refresh cart data
  const refreshCartData = () => {
    const freshCart = getCart();
    setCartData(freshCart);
    setCartVersion((prev) => prev + 1);
  };

  // Sync cartdata with localStorage
  useEffect(() => {
    const readCart = () => {
      try {
        const raw = localStorage.getItem("cart") || "[]";
        if (raw !== lastCartRawRef.current) {
          lastCartRawRef.current = raw;
          const parsed = JSON.parse(raw);
          setCartData(Array.isArray(parsed) ? parsed : []);
          setCartVersion((prev) => prev + 1);
        }
      } catch (err) {
        console.error("Failed to parse cart from localStorage", err);
      }
    };

    readCart();
    const intervalId = setInterval(readCart, 1000);

    const onStorage = (e) => {
      if (e.key === "cart") {
        readCart();
      }
    };

    const onCartUpdated = () => {
      readCart();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("cartUpdated", onCartUpdated);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cartUpdated", onCartUpdated);
    };
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [delivarychargetype, setdelivarychargetype] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [Cutlery, setCutlery] = useState(0);
  const [name, setname] = useState("");
  const [buildingaddress, setbuildingaddress] = useState("");
  const [mobilenumber, setmobilenumber] = useState("");
  const [flat, setFlat] = useState("");
  const [towerName, setTowerName] = useState("");
  const [apartmentname, setApartmentname] = useState("");
  const [couponId, setCouponId] = useState("");
  const [coupon, setCoupon] = useState(0);
  const [discountWallet, setDiscountWallet] = useState(0);
  const [walletApplied, setWalletApplied] = useState(true); // auto-apply by default
  const [loading, setLoading] = useState(false);
  const [gstRate, setGstRate] = useState(5); // Default GST rate
  const [hubCutoffTimes, setHubCutoffTimes] = useState(null);
  const [hubOrderMode, setHubOrderMode] = useState("preorder");

  const totalSavings = totals.totalSavings;
  const regularTotal = totals.regularTotal;

  const primaryAddress =
    JSON.parse(localStorage.getItem("primaryAddress")) || {};
  const defaultAddress = primaryAddress;
  const addressHubId = defaultAddress?.hubId || "";

  const [hubs, setHubs] = useState([]); // Fixed: usestate -> useState

  const [showSmallCartModal, setShowSmallCartModal] = useState(false);

  const getHubById = async (hubId) => {
    if (!hubId) {
      console.log("No hubId provided");
      return;
    }

    try {
      console.log("Fetching hub with ID:", hubId);

      const response = await axios.get(
        `https://dd-backend-3nm0.onrender.com/api/Hub/hubs/${hubId}`,
      );

      console.log("Hub API Response:", response);
      console.log("Hub Data:", response.data);

      if (response.status === 200 && response.data) {
        setHubs(response.data);
        console.log("Hub set to state:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching hub:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      return null;
    }
  };

  useEffect(() => {
    getHubById(addressHubId);
  }, []);

  const userDeliveryStatus =
    user?.status === "Employee" ? "Employee" : "Normal";
  const userAcquisitionChannel = user?.acquisition_channel || "organic";

  // --- Delivery rate helpers ---
  const roundAmount = (value) => Math.round((Number(value) || 0) * 100) / 100;

  // Seed delivery rate state instantly from navigation state (passed by Home on navigate).
  // If not present (e.g. user navigated directly), fall back to fetching.
  const passedRate = location?.state?.deliveryRateRecord || null;

  const [doorDeliveryRatePerSlot, setDoorDeliveryRatePerSlot] = useState(
    () => Number(passedRate?.doorDeliveryRate) || 0,
  );
  const [gateDeliveryRatePerSlot, setGateDeliveryRatePerSlot] = useState(
    () => Number(passedRate?.gateDeliveryRate) ?? 0,
  );
  const [gateDeliveryAvailable, setGateDeliveryAvailable] = useState(
    () => passedRate?.gateDeliveryAvailable === true,
  );
  const [deliveryRatesLoaded, setDeliveryRatesLoaded] = useState(
    () => passedRate !== null, // already loaded if passed from Home
  );
  const [deliveryType, setDeliveryType] = useState(() => {
    if (passedRate === null) return null; // unknown — wait for fetch
    return passedRate.gateDeliveryAvailable === true ? "gate" : "door";
  });

  // Only fetch if Home didn't pass the rate (e.g. direct navigation to /checkout-multiple)
  useEffect(() => {
    if (passedRate !== null) return; // already have data — skip fetch
    if (!addressHubId) return;
    const fetchDeliveryRatesByHub = async () => {
      try {
        const res = await axios.get(
          `https://dd-backend-3nm0.onrender.com/api/deliveryrate/hub/${encodeURIComponent(addressHubId)}`,
        );
        const rates = Array.isArray(res.data?.data) ? res.data.data : [];
        if (rates.length === 0) {
          setDeliveryType("door");
          setDeliveryRatesLoaded(true);
          return;
        }

        const matchedRate =
          rates.find((r) => r.status === userDeliveryStatus) ||
          rates.find((r) => r.status === "Normal") ||
          rates[0];

        if (!matchedRate) {
          setDeliveryType("door");
          setDeliveryRatesLoaded(true);
          return;
        }

        setDoorDeliveryRatePerSlot(Number(matchedRate.doorDeliveryRate) || 0);
        setGateDeliveryRatePerSlot(Number(matchedRate.gateDeliveryRate) ?? 0);
        setGateDeliveryAvailable(matchedRate.gateDeliveryAvailable === true);
        setDeliveryType(
          matchedRate.gateDeliveryAvailable === true ? "gate" : "door",
        );
      } catch {
        setDeliveryType("door");
      } finally {
        setDeliveryRatesLoaded(true);
      }
    };
    fetchDeliveryRatesByHub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressHubId]);

  // Fetch hub cutoff times for checkout validation
  useEffect(() => {
    if (!addressHubId) return;
    const fetchCutoffTimes = async () => {
      try {
        const res = await fetch(
          `https://dd-backend-3nm0.onrender.com/api/Hub/get-cutoff-times/${encodeURIComponent(addressHubId)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setHubCutoffTimes(data.cutoffTimes || null);
          setHubOrderMode(data.orderMode || "preorder");
        }
      } catch {
        // silently fail — cutoff validation will be skipped if unavailable
      }
    };
    fetchCutoffTimes();
  }, [addressHubId]);

  const subtotal = useMemo(() => {
    return roundAmount(
      cartdata.reduce((sum, item) => {
        const quantity = Number(item.quantity || item.Quantity || 1);
        const itemTotal = Number(
          item.totalPrice ??
            (item.preOrderPrice ?? item.price ?? item.hubPrice ?? 0) * quantity,
        );
        return sum + (Number.isFinite(itemTotal) ? itemTotal : 0);
      }, 0),
    );
  }, [cartdata]);

  const deliverySlotCount = useMemo(() => {
    const slots = new Set(
      cartdata.map((item) => `${item.deliveryDate}|${item.session}`),
    );
    return slots.size;
  }, [cartdata]);

  // Gate = rebate (minus from total), Door = extra charge (plus to total)
  const deliveryAdjustmentPerSlot =
    deliveryType === "gate"
      ? -gateDeliveryRatePerSlot
      : doorDeliveryRatePerSlot;
  const totalDeliveryAdjustment = roundAmount(
    deliveryAdjustmentPerSlot * deliverySlotCount,
  );

  // For TAX-INCLUSIVE products: break down the tax that's already in the price
  // Formula: If price = 105 with 5% tax included:
  //   amountBeforeTax = 105 / 1.05 = 100
  //   taxAmount = 105 - 100 = 5
  const amountBeforeTax = subtotal / (1 + gstRate / 100);
  const calculateTaxPrice = subtotal - amountBeforeTax;

  const increaseQuantity = (itemdata) => {
    const currentQty = itemdata.quantity || 1;
    if (currentQty >= (itemdata.remainingstock || 99)) {
      fireToast({ title: "No more stock available!", icon: cross });
      return;
    }

    // Update cart using cartHelper
    const updatedCart = updateCartItemQty(itemdata.cartId, currentQty + 1);
    setCartData(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("cartUpdated"));
    refreshCartData();
  };

  const decreaseQuantity = (itemdata) => {
    const currentQty = itemdata.quantity || 1;
    if (currentQty > 1) {
      const updatedCart = updateCartItemQty(itemdata.cartId, currentQty - 1);
      setCartData(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("cartUpdated"));
      refreshCartData();
    } else {
      // Remove item if quantity becomes 0
      const updatedCart = updateCartItemQty(itemdata.cartId, 0);
      setCartData(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("cartUpdated"));
      refreshCartData();
    }
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedIncreaseQuantity = debounce(increaseQuantity, 300);
  const debouncedDecreaseQuantity = debounce(decreaseQuantity, 300);

  const applycoupon = async () => {
    fireToast({ title: "Coupon feature coming soon" });
  };

  const toggleBillingDetails = () => {
    setIsBillingOpen(!isBillingOpen);
  };

  const [isBillingOpen, setIsBillingOpen] = useState(true);

  // Minimum cart threshold for handling charges - fetched from API
  const minCartThreshold = hubs?.minCart || 0; // Default to 50 if not available from API

  // Calculate handling charge and GST based on subtotal
  const baseTotal = subtotal + Cutlery + totalDeliveryAdjustment - coupon;
  const calculateHandlingChargePerSession = () => {
    // Group cart by session and sum per session
    const sessionTotals = {};
    cartdata.forEach((item) => {
      const sessionKey = `${item.deliveryDate}|${item.session}`;
      const itemTotal = Number(
        item.totalPrice ??
          (item.preOrderPrice ?? item.price ?? item.hubPrice ?? 0) *
            (item.quantity || 1),
      );
      sessionTotals[sessionKey] = (sessionTotals[sessionKey] || 0) + itemTotal;
    });

    // Count sessions that are below threshold AND have items
    let totalHandlingCharge = 0;
    Object.values(sessionTotals).forEach((sessionTotal) => {
      if (sessionTotal > 0 && sessionTotal < minCartThreshold) {
        totalHandlingCharge += 20; // ₹20 per session below threshold
      }
    });
    return totalHandlingCharge;
  };
  const handlingCharge = calculateHandlingChargePerSession();

  // GST only on item subtotal (and cutlery if applicable) — not on delivery or handling
  const gstableAmount = subtotal + Cutlery;
  const gstOnTotal = roundAmount(gstableAmount * (gstRate / 100));

  // Final total = items + delivery adjustment + handling + GST - coupon
  const finalTotal = roundAmount(
    subtotal +
      Cutlery +
      totalDeliveryAdjustment -
      coupon +
      handlingCharge +
      gstOnTotal,
  );

  const totalPayable = roundAmount(Math.max(finalTotal - discountWallet, 0));

  const handleApplyWallet = (e) => {
    if (wallet?.balance === 0) {
      fireToast({ title: "Wallet balance is 0", icon: cross });
      e.target.checked = false;
      return;
    }
    if (e.target.checked) {
      setWalletApplied(true);
      const gstableAmount = subtotal + Cutlery;
      const gstOnItems = roundAmount(gstableAmount * (gstRate / 100));
      const maxUsableAmount = Math.max(
        roundAmount(
          subtotal +
            Cutlery +
            totalDeliveryAdjustment -
            coupon +
            handlingCharge +
            gstOnItems,
        ),
        0,
      );
      const finalAmount = Math.min(wallet?.balance || 0, maxUsableAmount);
      setDiscountWallet(finalAmount);
    } else {
      setWalletApplied(false);
      setDiscountWallet(0);
    }
  };

  // Auto-apply wallet if balance > 0, and keep it clamped to the current order
  // total whenever subtotal/delivery/coupon changes (e.g. user adjusts quantity).
  useEffect(() => {
    const walletBalance = wallet?.balance || 0;
    if (walletBalance <= 0 || !walletApplied) return;

    const gstableAmount = subtotal + Cutlery;
    const gstOnItems = roundAmount(gstableAmount * (gstRate / 100));
    const fullOrderTotal = Math.max(
      roundAmount(
        subtotal +
          Cutlery +
          totalDeliveryAdjustment -
          coupon +
          handlingCharge +
          gstOnItems,
      ),
      0,
    );

    const optimal = Math.min(walletBalance, fullOrderTotal);
    setDiscountWallet(optimal);
  }, [
    wallet?.balance,
    walletApplied,
    subtotal,
    Cutlery,
    totalDeliveryAdjustment,
    coupon,
    handlingCharge,
    gstRate,
  ]);

  // REMOVE the old separate auto-select useEffect:
  // useEffect(() => {
  //   if (gateDeliveryAvailable && pickupPointsList.length > 0) {
  //     setSelectedPickupPoint(pickupPointsList[0]);
  //     setDeliveryType("gate");
  //   }
  // }, [gateDeliveryAvailable, pickupPointsList]);

  // UPDATE the fetch delivery rates useEffect to auto-select inline:

  // Update the fetch delivery rates effect
  useEffect(() => {
    if (!addressHubId) return;
    const fetchDeliveryRatesByHub = async () => {
      try {
        const res = await axios.get(
          `https://dd-backend-3nm0.onrender.com/api/deliveryrate/hub/${encodeURIComponent(addressHubId)}`,
        );
        const rates = Array.isArray(res.data?.data) ? res.data.data : [];

        if (rates.length === 0) {
          setDeliveryType("door");
          setDeliveryRatesLoaded(true);
          return;
        }

        const matchedRate =
          rates.find((r) => r.status === userDeliveryStatus) ||
          rates.find((r) => r.status === "Normal") ||
          rates[0];

        if (!matchedRate) {
          setDeliveryType("door");
          setDeliveryRatesLoaded(true);
          return;
        }

        const points = matchedRate.pickupPoints || [];

        setDoorDeliveryRatePerSlot(Number(matchedRate.doorDeliveryRate) || 0);
        setGateDeliveryRatePerSlot(Number(matchedRate.gateDeliveryRate) ?? 0);
        setGateDeliveryAvailable(matchedRate.gateDeliveryAvailable === true);
        setPickupPointsList(points);

        if (matchedRate.gateDeliveryAvailable === true && points.length > 0) {
          setSelectedPickupPoint(points[0]); // ← auto-select first point
          setDeliveryType("gate");
        } else {
          setDeliveryType("door");
        }
      } catch {
        setDeliveryType("door");
      } finally {
        setDeliveryRatesLoaded(true);
      }
    };
    fetchDeliveryRatesByHub();
  }, [addressHubId]);

  const getPickupSlotTimes = (pickupPoint, session) => {
    console.log("getPickupSlotTimes called with:", { pickupPoint, session });

    if (!pickupPoint || !session) {
      console.log("Missing pickupPoint or session");
      return { startTime: null, endTime: null };
    }

    // New format: deliverySlots = [{ session, timeSlots: [{ startTime, endTime, isActive }] }]
    if (
      Array.isArray(pickupPoint.deliverySlots) &&
      pickupPoint.deliverySlots.length > 0
    ) {
      console.log("Found deliverySlots array:", pickupPoint.deliverySlots);
      const slotGroup = pickupPoint.deliverySlots.find(
        (s) => s.session?.toLowerCase() === session?.toLowerCase(),
      );
      console.log("Found slotGroup:", slotGroup);
      const activeSlot = slotGroup?.timeSlots?.find(
        (ts) => ts.isActive !== false,
      );
      console.log("Found activeSlot:", activeSlot);
      return {
        startTime: activeSlot?.startTime || null,
        endTime: activeSlot?.endTime || null,
      };
    }

    // Old format: deliverySlot = "12:30,1:00" (fallback)
    if (typeof pickupPoint.deliverySlot === "string") {
      console.log("Using old format deliverySlot:", pickupPoint.deliverySlot);
      const parts = pickupPoint.deliverySlot
        .replace("-", ",")
        .split(",")
        .map((s) => s.trim());
      return {
        startTime: parts[0] || null,
        endTime: parts[1] || null,
      };
    }

    console.log("No valid format found, returning null");
    return { startTime: null, endTime: null };
  };

  const handleCheckout = async () => {
    if (!user) {
      fireToast({ title: "Please login first", icon: cross });
      return;
    }

    if (cartdata.length === 0) {
      fireToast({ title: "Please add items to cart", icon: cross });
      return;
    }

    if (!defaultAddress) {
      fireToast({ title: "Please add an address", icon: cross });
      return;
    }

    // ── NEW guard ──
    if (deliveryType === "gate" && !selectedPickupPoint) {
      fireToast({ title: "Please select a pickup point", icon: cross });
      return;
    }

    setLoading(true);

    try {
      // Refresh wallet balance before checkout to avoid stale data causing "Insufficient wallet balance"
      let effectiveWalletDiscount = discountWallet;
      if (discountWallet > 0) {
        try {
          const freshWalletRes = await axios.get(
            `https://dd-backend-3nm0.onrender.com/api/user/wallet/${user._id}`,
          );
          const freshBalance = freshWalletRes?.data?.data?.wallet?.balance || 0;
          // Clamp to actual available balance
          effectiveWalletDiscount = Math.min(discountWallet, freshBalance);
          if (effectiveWalletDiscount !== discountWallet) {
            setDiscountWallet(effectiveWalletDiscount);
          }
        } catch {
          // If wallet fetch fails, proceed with existing value
        }
      }

      const gstableAmount = subtotal + Cutlery;
      const gstAmount = roundAmount(gstableAmount * (gstRate / 100));
      const totalWithChargesAndGST = roundAmount(
        subtotal +
          Cutlery +
          totalDeliveryAdjustment -
          coupon +
          handlingCharge +
          gstAmount,
      );

      const payableAmount = roundAmount(
        Math.max(totalWithChargesAndGST - effectiveWalletDiscount, 0),
      );
      const totalAmount = Math.round(payableAmount * 100) / 100;

      // Build per-slot breakdown so the backend can store exact GST and handling
      // charge per plan document (needed for accurate cancel refunds).
      // GST is proportional to each slot's share of the total subtotal.
      // Handling charge is ₹20 for any slot whose item total < minCartThreshold.
      const slotBreakdown = (() => {
        const sessionTotals = {};
        cartdata.forEach((item) => {
          const slotKey = `${item.deliveryDate}|${item.session}`;
          const itemTotal = Number(
            item.totalPrice ??
              (item.preOrderPrice ?? item.price ?? item.hubPrice ?? 0) *
                (item.quantity || 1),
          );
          sessionTotals[slotKey] = (sessionTotals[slotKey] || 0) + itemTotal;
        });
        const breakdown = {};
        const totalSubtotal = Object.values(sessionTotals).reduce((s, v) => s + v, 0) || 1;
        Object.entries(sessionTotals).forEach(([slotKey, slotSubtotal]) => {
          // GST proportional to this slot's share of the total subtotal
          const slotGstPaid = roundAmount(gstAmount * (slotSubtotal / totalSubtotal));
          // Handling charge: ₹20 if this slot's item total is below the threshold
          const slotHandlingCharge =
            slotSubtotal > 0 && slotSubtotal < (minCartThreshold || 0) ? 20 : 0;
          breakdown[slotKey] = { gstPaid: slotGstPaid, handlingCharge: slotHandlingCharge };
        });
        return breakdown;
      })();

      // Cutoff validation — check every cart slot before proceeding to payment
      // Uses a 2:30 min grace window so users already mid-payment aren't blocked
      if (hubCutoffTimes) {
        const hubCutoffData = {
          cutoffTimes: hubCutoffTimes,
          orderMode: hubOrderMode,
        };
        const GRACE_MS = 2.5 * 60 * 1000;
        const nowWithGrace = new Date(Date.now() - GRACE_MS); // shift "now" back by 2:30
        const expiredSlots = cartdata
          .filter((item) => {
            const dateStr =
              typeof item.deliveryDate === "string"
                ? item.deliveryDate.split("T")[0]
                : item.deliveryDate instanceof Date
                  ? `${item.deliveryDate.getFullYear()}-${String(item.deliveryDate.getMonth() + 1).padStart(2, "0")}-${String(item.deliveryDate.getDate()).padStart(2, "0")}`
                  : null;
            if (!dateStr || !item.session) return false;
            return isSlotPastCutoff(
              dateStr,
              item.session,
              hubCutoffData,
              user?.status,
              nowWithGrace,
            );
          })
          .map((item) => ({
            session: item.session,
            deliveryDate:
              typeof item.deliveryDate === "string"
                ? item.deliveryDate.split("T")[0]
                : item.deliveryDate,
          }));

        if (expiredSlots.length > 0) {
          const slotList = [
            ...new Map(
              expiredSlots.map((s) => [`${s.deliveryDate}|${s.session}`, s]),
            ).values(),
          ];
          const slotText = slotList
            .map(
              (s) =>
                `• ${s.session.charAt(0).toUpperCase() + s.session.slice(1)} on ${s.deliveryDate}`,
            )
            .join("\n");

          setLoading(false);
          await Swal2.fire({
            icon: "error",
            title: "Ordering cutoff passed",
            html: `<p style="margin-bottom:8px">You can no longer order for:</p><pre style="text-align:left;font-size:13px;background:#f8f8f8;padding:10px;border-radius:8px">${slotText}</pre><p style="font-size:13px;color:#666;margin-top:8px">Please remove these items from your cart and try again.</p>`,
            confirmButtonText: "Go back to cart",
            confirmButtonColor: "#6B8E23",
          });
          navigate(-1);
          return;
        }
      }
      // Right before enrichedCartItems, add this guard log during dev:
      console.log("selectedPickupPoint at checkout:", selectedPickupPoint);
      console.log("deliveryType at checkout:", deliveryType);
      console.log(
        "Full selectedPickupPoint structure:",
        JSON.stringify(selectedPickupPoint, null, 2),
      );

      const enrichedCartItems = cartdata.map((item) => {
        console.log(`Processing item with session: ${item.session}`);
        const pickupTimes =
          deliveryType === "gate" && selectedPickupPoint
            ? getPickupSlotTimes(selectedPickupPoint, item.session)
            : { startTime: null, endTime: null };

        console.log(`Pickup times for ${item.session}:`, pickupTimes);

        return {
          ...item,
          deliveryCharge: deliveryType === "door" ? doorDeliveryRatePerSlot : 0,
          gateDeliveryCharge:
            deliveryType === "gate" ? gateDeliveryRatePerSlot : 0,
          deliveryType: deliveryType,
          username: user.Fname,
          mobile: user.Mobile,
          userId: user._id,
          hubId: defaultAddress?.hubId || "",
          hubName: defaultAddress?.hubName || "",
          address: defaultAddress?.fullAddress || "",
          customerType: user?.status,
          coordinates: defaultAddress?.location,
          selectedPickupPoint:
            deliveryType === "gate" && selectedPickupPoint
              ? {
                  name: selectedPickupPoint.name || null,
                  location: selectedPickupPoint.location || null,
                  contactNumber: selectedPickupPoint.contactNumber || null,
                  session: item.session || null, // e.g. "Breakfast"
                  startTime: pickupTimes.startTime, // e.g. "8:00"
                  endTime: pickupTimes.endTime, // e.g. "8:30"
                }
              : null,
        };
      });

      console.log(enrichedCartItems, "cartitems.............");
      console.log(payableAmount, "payable...............");
      console.log("Delivery Type:", deliveryType);
      console.log("Door Rate Per Slot:", doorDeliveryRatePerSlot);
      console.log("Gate Rate Per Slot:", gateDeliveryRatePerSlot);
      console.log("Delivery Adjustment Per Slot:", deliveryAdjustmentPerSlot);
      console.log("Total Delivery Adjustment:", totalDeliveryAdjustment);
      console.log("Delivery Slot Count:", deliverySlotCount);
      console.log("Total Amount being sent to backend:", totalAmount);
      const handleSuccessfulCheckout = async (
        txnId,
        paymentMethod = "razorpay",
      ) => {
        // Persist offer-used slots to localStorage so Home.jsx can check
        // hasUserUsedOffer() instantly on next load without any API call.
        if (user?._id) {
          try {
            const offerItems = enrichedCartItems.filter(
              (item) => item.offerApplied === true,
            );
            if (offerItems.length > 0) {
              const raw = localStorage.getItem("offerUsedSlots");
              const slots = raw ? JSON.parse(raw) : {};
              if (!Array.isArray(slots[user._id])) slots[user._id] = [];
              offerItems.forEach((item) => {
                const dateStr =
                  typeof item.deliveryDate === "string"
                    ? item.deliveryDate.split("T")[0]
                    : item.deliveryDate instanceof Date
                      ? `${item.deliveryDate.getFullYear()}-${String(item.deliveryDate.getMonth() + 1).padStart(2, "0")}-${String(item.deliveryDate.getDate()).padStart(2, "0")}`
                      : null;
                if (dateStr && item.session) {
                  // Include hubId in slot key for cross-hub blocking
                  const hubIdStr = item.hubId
                    ? item.hubId.toString()
                    : "unknown";
                  const slotKey = `${dateStr}|${item.session.toLowerCase()}|${hubIdStr}`;
                  if (!slots[user._id].includes(slotKey)) {
                    slots[user._id].push(slotKey);
                  }
                }
              });
              localStorage.setItem("offerUsedSlots", JSON.stringify(slots));
            }
          } catch {
            // non-critical — don't block checkout
          }
        }

        localStorage.removeItem("cart");
        clearCart();

        // Fire wallet refresh in background — don't block navigation
        if (discountWallet && discountWallet > 0) {
          fetchWalletData();
        }

        // Get all delivery slots info for params
        const allSessions = [...new Set(enrichedCartItems.map(item => item.session || "Lunch"))];
        const allDeliveryDates = [...new Set(enrichedCartItems.map(item => item.deliveryDate || new Date().toISOString()))];
        const firstItem = enrichedCartItems?.[0] || {};
        const firstDeliveryDate = firstItem.deliveryDate || new Date().toISOString();
        const firstSession = firstItem.session || "Lunch";

        // Navigate immediately to success page
        const successParams = new URLSearchParams({
          transactionId: txnId || "completed",
          userId: user._id,
          session: firstSession,
          deliveryDate: firstDeliveryDate,
          sessions: allSessions.join(","),
          deliveryDates: allDeliveryDates.join(","),
          username: user.Fname || "User",
          amount: payableAmount,
          orderId: txnId || "pending",
          hubName: defaultAddress?.hubName || "",
          delivarylocation: defaultAddress?.fullAddress || "",
          status: "COMPLETED",
          paymentMethod: paymentMethod,
          deliveryCharge: deliveryType === "door" ? doorDeliveryRatePerSlot : 0,
        });

        navigate("/payment-success?" + successParams.toString(), {
          replace: true,
        });
      };

      const confirmSkippedPaymentOrder = async (txnId) => {
        const verifyRes = await axios.post(
          "https://dd-backend-3nm0.onrender.com/api/user/razorpay/verify-payment-and-create-plan",
          {
            skipPayment: true,
            transactionId: txnId,
            userId: user._id,
            cartItems: enrichedCartItems,
            addressId: defaultAddress?._id,
          },
        );

        if (verifyRes.status === 200 && verifyRes.data?.success) {
          await handleSuccessfulCheckout(txnId, "wallet");
          return;
        }

        throw new Error(verifyRes.data?.error || "Order creation failed");
      };

      const res = await axios.post(
        "https://dd-backend-3nm0.onrender.com/api/user/razorpay/create-order-from-cart",
        {
          userId: user._id,
          cartItems: enrichedCartItems, // each item has selectedPickupPoint
          totalAmount,
          totalDeliveryCharge: Number(
            totalDeliveryAdjustment > 0 ? totalDeliveryAdjustment : 0,
          ),
          deliveryChargePerSlot: Number(
            deliveryType === "door" ? doorDeliveryRatePerSlot : 0,
          ),
          gateDeliveryRebate: Number(
            deliveryType === "gate"
              ? gateDeliveryRatePerSlot * deliverySlotCount
              : 0,
          ),
          deliverySlotCount: Number(deliverySlotCount || 0),
          discountWallet: Number(effectiveWalletDiscount || 0),
          addressId: defaultAddress._id,
          slotBreakdown,
          // ── NEW ──
          selectedPickupPoint:
            deliveryType === "gate" && selectedPickupPoint
              ? {
                  name: selectedPickupPoint.name || null,
                  location: selectedPickupPoint.location || null,
                  contactNumber: selectedPickupPoint.contactNumber || null,
                }
              : null,
          notes: {
            username: user.Fname,
            mobile: user.Mobile,
          },
        },
      );

      if (res.status === 200 && res.data?.paymentSkipped) {
        await confirmSkippedPaymentOrder(res.data.transactionId);
        return;
      }

      if (res.status === 200 && res.data?.razorpayOrderId) {
        const {
          razorpayOrderId,
          transactionId: txnId,
          key: razorpayKey,
          amount: razorpayAmount,
        } = res.data;

        console.log("Razorpay Amount from backend:", razorpayAmount);
        console.log("Expected Total Amount:", totalAmount);

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const options = {
            key: razorpayKey,
            amount: razorpayAmount,
            currency: "INR",
            order_id: razorpayOrderId,
            name: "Dailydish",
            description: `${summary.mealCount || cartdata.length} items`,
            handler: async (response) => {
              // Set loading state immediately to show processing UI
              setLoading(true);

              try {
                const verifyRes = await axios.post(
                  "https://dd-backend-3nm0.onrender.com/api/user/razorpay/verify-payment-and-create-plan",
                  {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    transactionId: txnId,
                    userId: user._id,
                    cartItems: enrichedCartItems,
                    addressId: defaultAddress?._id,
                    discountWallet: Number(effectiveWalletDiscount || 0),
                  },
                );

                if (verifyRes.status === 200 && verifyRes.data?.success) {
                  handleSuccessfulCheckout(txnId, "razorpay");
                } else {
                  throw new Error(
                    verifyRes.data?.error || "Order creation failed",
                  );
                }
              } catch (error) {
                console.error("Payment verification error:", error);

                // Navigate to failure page
                const failureParams = new URLSearchParams({
                  transactionId: txnId || "",
                  userId: user._id,
                  status: "FAILED",
                  paymentMethod: "razorpay",
                  error:
                    error.response?.data?.error ||
                    error.message ||
                    "Payment could not be processed",
                });

                navigate("/payment-success?" + failureParams.toString(), {
                  replace: true,
                });
              }
            },
            prefill: {
              name: user.Fname,
              email: user.email || "",
              contact: user.Mobile,
            },
            theme: {
              color: "#6B8E23",
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        script.onerror = () => {
          const failureParams = new URLSearchParams({
            transactionId: "",
            userId: user._id,
            status: "FAILED",
            paymentMethod: "razorpay",
            error: "Failed to load payment gateway",
          });
          navigate("/payment-success?" + failureParams.toString(), {
            replace: true,
          });
        };
        document.body.appendChild(script);
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Checkout error:", error);

      // Navigate to failure page with error details
      const failureParams = new URLSearchParams({
        transactionId: "",
        userId: user._id,
        status: "FAILED",
        paymentMethod: "razorpay",
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to process checkout",
      });

      navigate("/payment-success?" + failureParams.toString(), {
        replace: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate item total price correctly with offer
  const getItemQuantity = (item) => {
    const quantity = Number(item?.quantity ?? item?.Quantity ?? 1);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  };

  const getItemTotalPrice = (item) => {
    const explicitTotal = Number(item?.totalPrice);
    if (Number.isFinite(explicitTotal)) {
      return explicitTotal;
    }

    const unitPrice = Number(
      item?.preOrderPrice ?? item?.price ?? item?.hubPrice ?? 0,
    );
    return unitPrice * getItemQuantity(item);
  };

  // Calculate item savings if offer applied
  const getItemSavings = (item) => {
    const regularPrice = Number(item?.regularPrice);

    if (
      item?.offerApplied &&
      Number.isFinite(regularPrice) &&
      regularPrice > 0
    ) {
      const regularTotal = regularPrice * getItemQuantity(item);
      const actualTotal = getItemTotalPrice(item);
      return regularTotal - actualTotal;
    }
    return 0;
  };

  const getItemRegularTotal = (item) => {
    const regularPrice = Number(item?.regularPrice);

    if (Number.isFinite(regularPrice) && regularPrice > 0) {
      return regularPrice * getItemQuantity(item);
    }

    return getItemTotalPrice(item);
  };

  const formatCartPrice = (amount) => {
    const value = Number(amount || 0);
    if (!Number.isFinite(value)) return "0";

    return value
      .toFixed(2)
      .replace(/\.00$/, "")
      .replace(/(\.\d*[1-9])0$/, "$1");
  };

  const renderReferenceCartItems = () => {
    const groupedBySession = {};
    const sessionOrder = ["Breakfast", "Lunch", "Dinner"];
    const rupeeSymbol = "\u20B9";

    cartdata.forEach((item) => {
      const session = item.session || "Lunch";
      const sessionKey = session.charAt(0).toUpperCase() + session.slice(1);
      if (!groupedBySession[sessionKey]) {
        groupedBySession[sessionKey] = [];
      }
      groupedBySession[sessionKey].push(item);
    });

    const sortedSessions = Object.entries(groupedBySession).sort(
      ([sessionA], [sessionB]) => {
        const indexA = sessionOrder.indexOf(sessionA);
        const indexB = sessionOrder.indexOf(sessionB);
        if (indexA === -1 && indexB === -1)
          return sessionA.localeCompare(sessionB);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      },
    );

    return (
      <div className="cm-cart-shell">
        <div className="cm-cart-panel">
          {sortedSessions.map(([session, items]) => {
            const sessionTotal = items.reduce(
              (sum, item) => sum + getItemTotalPrice(item),
              0,
            );
            const sessionSavings = items.reduce(
              (sum, item) => sum + getItemSavings(item),
              0,
            );
            const sessionOriginalTotal = items.reduce(
              (sum, item) => sum + getItemRegularTotal(item),
              0,
            );
            const needsMore =
              sessionTotal > 0 && sessionTotal < minCartThreshold;
            const amountNeeded = minCartThreshold - sessionTotal;

            // Get hubId from first item or use default
            const hubIdForSession = items[0]?.hubId || addressHubId;

            return (
              <section key={session} className="cm-session-block">
                {/* Session header */}
                <div className="cm-session-header">
                  <div className="cm-session-header-left">
                    <span className="cm-session-meal-icon">
                      {session === "Breakfast" ? (
                        <img
                          src={breakfast}
                          alt="Breakfast"
                          style={{ width: "40px", height: "40px" }}
                        />
                      ) : session === "Lunch" ? (
                        <img
                          src={lunch}
                          alt="Lunch"
                          style={{ width: "40px", height: "40px" }}
                        />
                      ) : (
                        <img
                          src={dinner}
                          alt="Dinner"
                          style={{ width: "40px", height: "40px" }}
                        />
                      )}
                    </span>
                    <div>
                      <h4 className="cm-session-title">{session}</h4>
                      {items[0]?.deliveryDate && (
                        <span className="cm-session-date">
                          {new Date(items[0].deliveryDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="cm-session-item-count">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Items list */}
                <div className="cm-session-items">
                  {items.map((item, index) => {
                    const itemTotal = getItemTotalPrice(item);
                    const itemSavings = getItemSavings(item);
                    const regularTotal = getItemRegularTotal(item);
                    const itemName =
                      item?.foodname || item?.itemName || item?.name || "Item";
                    const itemQuantity = getItemQuantity(item);

                    return (
                      <div key={item.cartId || index} className="cm-item-row">
                        <div className="cm-item-main">
                          {item?.foodcategory === "Veg" ? (
                            <img
                              src={IsVeg}
                              alt="veg"
                              className="cm-item-indicator"
                            />
                          ) : (
                            <img
                              src={IsNonVeg}
                              alt="non-veg"
                              className="cm-item-indicator"
                            />
                          )}
                          <div className="cm-item-name" title={itemName}>
                            {itemName}
                          </div>
                        </div>

                        <div className="cm-item-side">
                          <div className="cm-qty-pill">
                            <button
                              type="button"
                              className="cm-qty-btn"
                              onClick={() => debouncedDecreaseQuantity(item)}
                              aria-label={`Decrease quantity for ${itemName}`}
                            >
                              −
                            </button>
                            <span className="cm-qty-value">{itemQuantity}</span>
                            <button
                              type="button"
                              className="cm-qty-btn"
                              onClick={() => debouncedIncreaseQuantity(item)}
                              aria-label={`Increase quantity for ${itemName}`}
                            >
                              +
                            </button>
                          </div>

                          <div className="cm-price-stack">
                            {itemSavings > 0 && (
                              <div className="cm-price-old">
                                {rupeeSymbol}
                                {formatCartPrice(regularTotal)}
                              </div>
                            )}
                            <div className="cm-price-current">
                              {rupeeSymbol}
                              {formatCartPrice(itemTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Handling charge banner — ABOVE footer */}
                {needsMore && (
                  <div
                    className="scf-inline-row"
                    onClick={() => setShowSmallCartModal(true)}
                  >
                    <div className="scf-inline-left">
                      <button type="button" className="scf-inline-fee-btn">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="1" y="3" width="15" height="13" rx="2" />
                          <path d="M16 8h4l3 5v3h-7V8z" />
                          <circle cx="5.5" cy="18.5" r="2.5" />
                          <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                        Small cart fee
                      </button>
                    </div>
                    <span className="scf-inline-amount">₹20</span>
                  </div>
                )}

                {/* Footer: Add More + Total — BELOW fee banner */}
                <div className="cm-session-footer">
                  <button
                    type="button"
                    className="cm-add-more-link"
                    onClick={() =>
                      handleOpenAddMoreModal(
                        hubIdForSession,
                        session,
                        items[0]?.deliveryDate,
                      )
                    }
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add more
                  </button>

                  {/* Total chip: slashed → "Total" → price */}
                  <div className="cm-total-chip">
                    <span className="cm-total-current">
                      {rupeeSymbol}
                      {formatCartPrice(sessionTotal + (needsMore ? 20 : 0))}
                    </span>
                    {needsMore && (
                      <span className="cm-total-sub">
                        No small cart fee above ₹{minCartThreshold}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  };

  const SmallCartFeeModal = ({ show, onClose, minCartThreshold }) => (
    <Modal
      show={show}
      onHide={onClose}
      centered
      className="hiw-modal"
      scrollable={false}
    >
      <div className="scf-sheet-handle" />
      <div className="scf-sheet-header">
        <div className="scf-sheet-icon">
          <FaScaleBalanced
            style={{
              color: "#8B4513",
              fontSize: "24px",
            }}
          />
        </div>
        <div className="scf-sheet-title">Why there's a ₹20 fee</div>
      </div>
      <Modal.Body className="scf-sheet-body">
        <p className="scf-sheet-desc">
          Below ₹99 per slot, the cost of cooking, packing and delivering
          exceeds what we earn. The ₹20 bridges that gap — not a penalty, just
          what keeps us running
        </p>
        {/* <div className="scf-sheet-table mt-4">
          <div className="scf-sheet-row">
            <span className="scf-row-label">Minimum per slot</span>
            <span className="scf-row-val">₹{minCartThreshold}</span>
          </div>
          <div className="scf-sheet-row">
            <span className="scf-row-label">Fee if below</span>
            <span className="scf-row-val">₹20 per slot</span>
          </div>
          
        </div> */}
      </Modal.Body>
      {/* <Modal.Footer className="scf-sheet-footer">
        <button className="scf-got-it-btn" onClick={() => navigate("/home")}>
          Add more to this slot
        </button>
      </Modal.Footer> */}
    </Modal>
  );

  // Add More Modal Component
  const AddMoreModal = ({
    show,
    onClose,
    hubId,
    session,
    deliveryDate,
    onItemsAdded,
  }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [originalQuantities, setOriginalQuantities] = useState({});
    const user = JSON.parse(localStorage.getItem("user"));
    const [hubCutoffTimes, setHubCutoffTimes] = useState(null);
    const [hubOrderMode, setHubOrderMode] = useState("preorder");

    useEffect(() => {
      if (!hubId) return;
      const fetchCutoffTimes = async () => {
        try {
          const res = await fetch(
            `https://dd-backend-3nm0.onrender.com/api/Hub/get-cutoff-times/${encodeURIComponent(hubId)}`,
          );
          if (res.ok) {
            const data = await res.json();
            setHubCutoffTimes(data.cutoffTimes || null);
            setHubOrderMode(data.orderMode || "preorder");
          }
        } catch (error) {
          console.error("Error fetching cutoff times:", error);
        }
      };
      fetchCutoffTimes();
    }, [hubId]);

    const isOrderingAllowed = useMemo(() => {
      if (!hubCutoffTimes || !deliveryDate || !session) return true;
      const GRACE_MS = 2.5 * 60 * 1000;
      const nowWithGrace = new Date(Date.now() - GRACE_MS);
      return !isSlotPastCutoff(
        deliveryDate,
        session,
        { cutoffTimes: hubCutoffTimes, orderMode: hubOrderMode },
        user?.status,
        nowWithGrace,
      );
    }, [hubCutoffTimes, deliveryDate, session, hubOrderMode, user?.status]);

    const fetchMenuForSlot = async () => {
      if (!hubId || !deliveryDate || !session) return;
      setIsLoading(true);
      try {
        const res = await axios.get(
          `https://dd-backend-3nm0.onrender.com/api/admin/hub-menu/get-hub-menu`,
          { params: { hubId, menuDate: deliveryDate, session } },
        );
        if (res.data && res.data.menu) {
          const menu = res.data.menu;
          setMenuItems(menu);

          const currentCart = getCart();

          console.log(
            "CART ENTRIES for this slot:",
            currentCart.filter(
              (c) => c.session === session && c.deliveryDate === deliveryDate,
            ),
          );
          console.log(
            "MENU ITEMS:",
            menu.map((m) => ({
              menuId: m._id,
              productId: m.productId?._id,
              foodname: m.productId?.foodname,
            })),
          );

          const initQty = {};
          menu.forEach((menuItem) => {
            const menuProductId = String(menuItem.productId?._id || "").trim();
            const menuFoodname = (menuItem.productId?.foodname || "")
              .trim()
              .toLowerCase();

            const cartEntry = currentCart.find((c) => {
              // Normalise date comparison — strip time part if ISO string
              const cartDate =
                typeof c.deliveryDate === "string"
                  ? c.deliveryDate.split("T")[0]
                  : c.deliveryDate;
              const modalDate =
                typeof deliveryDate === "string"
                  ? deliveryDate.split("T")[0]
                  : deliveryDate;

              const dateMatch = cartDate === modalDate;
              const sessionMatch =
                (c.session || "").toLowerCase() ===
                (session || "").toLowerCase();

              // Try productId match first, fall back to foodname
              const cartProductId = String(c.productId || "").trim();
              const idMatch =
                menuProductId &&
                cartProductId &&
                menuProductId === cartProductId;
              const nameMatch =
                menuFoodname &&
                (c.foodname || "").trim().toLowerCase() === menuFoodname;

              return dateMatch && sessionMatch && (idMatch || nameMatch);
            });

            if (cartEntry) {
              console.log(
                `MATCHED: ${menuItem.productId?.foodname} → qty ${cartEntry.quantity}`,
              );
            }

            initQty[menuItem._id] = cartEntry
              ? Number(cartEntry.quantity) || 1
              : 0;
          });

          setQuantities(initQty);
          setOriginalQuantities({ ...initQty });
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        fireToast({ title: "Failed to load menu", icon: cross });
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (show && hubId && deliveryDate && session) fetchMenuForSlot();
    }, [show, hubId, deliveryDate, session]);

    const updateQuantity = (itemId, delta, maxStock) => {
      setQuantities((prev) => {
        const next = Math.max(0, (prev[itemId] || 0) + delta);
        if (delta > 0 && next > (maxStock || 99)) return prev;
        return { ...prev, [itemId]: next };
      });
    };

    // Only items that changed from their original cart quantity
    const changedItems = menuItems.filter((item) => {
      const orig = originalQuantities[item._id] ?? 0;
      const curr = quantities[item._id] ?? 0;
      return curr !== orig;
    });

    const selectedTotal = menuItems.reduce((sum, item) => {
      const qty = quantities[item._id] || 0;
      if (qty === 0) return sum;
      let price =
        item.isOffer && item.offerPrice > 0
          ? item.offerPrice
          : item.preOrderPrice > 0
            ? item.preOrderPrice
            : item.hubPrice;
      return sum + price * qty;
    }, 0);

    const handleAddToCart = () => {
      if (changedItems.length === 0) {
        fireToast({ title: "No changes to apply", icon: cross });
        return;
      }
      if (!isOrderingAllowed) {
        fireToast({ title: "Ordering cutoff passed", icon: cross });
        return;
      }

      const currentCart = getCart();

      changedItems.forEach((menuItem) => {
        const newQty = quantities[menuItem._id] || 0;
        const menuProductId = String(menuItem.productId?._id || "").trim();
        const menuFoodname = (menuItem.productId?.foodname || "")
          .trim()
          .toLowerCase();
        const modalDate =
          typeof deliveryDate === "string"
            ? deliveryDate.split("T")[0]
            : deliveryDate;

        // Log all price fields to find which one has the value
        console.log("PRICE DEBUG for", menuItem.productId?.foodname, {
          offerPrice: menuItem.offerPrice,
          preOrderPrice: menuItem.preOrderPrice,
          hubPrice: menuItem.hubPrice,
          basePrice: menuItem.basePrice,
          price: menuItem.price,
          fullItem: menuItem,
        });
      });

      localStorage.setItem("cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("cartUpdated"));

      const added = changedItems.filter(
        (i) => (quantities[i._id] || 0) > (originalQuantities[i._id] || 0),
      ).length;
      const removed = changedItems.filter(
        (i) => (quantities[i._id] || 0) < (originalQuantities[i._id] || 0),
      ).length;
      const msg = [
        added > 0 && `${added} added`,
        removed > 0 && `${removed} removed`,
      ]
        .filter(Boolean)
        .join(", ");

      fireToast({ title: "Cart updated!", subtitle: msg, icon: checkCircle });
      if (onItemsAdded) onItemsAdded();
      onClose();
    };

    const sessionIcon =
      session === "Breakfast"
        ? breakfast
        : session === "Lunch"
          ? lunch
          : dinner;
    const formattedDate = deliveryDate
      ? new Date(deliveryDate).toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      : "";

    const hasChanges = changedItems.length > 0;

    return (
      <Modal
        show={show}
        onHide={onClose}
        centered
        className="amm-modal"
        scrollable
      >
        <Modal.Header closeButton className="amm-header">
          <div className="amm-header-inner">
            <div className="amm-header-session">
              <img
                src={sessionIcon}
                alt={session}
                className="amm-session-icon"
              />
              <div>
                <div className="amm-session-label">{session}</div>
                <div className="amm-session-date">{formattedDate}</div>
              </div>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="amm-body">
          {!isOrderingAllowed && (
            <div className="amm-cutoff-banner">
              <ShieldAlert size={15} />
              <span>
                Ordering cutoff passed — items cannot be added for this slot.
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="amm-loading">
              <Spinner
                animation="border"
                style={{
                  color: "#6B8E23",
                  width: 32,
                  height: 32,
                  borderWidth: 3,
                }}
              />
              <span>Loading menu…</span>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="amm-empty">
              <span>No items available for this slot</span>
            </div>
          ) : (
            <div className="amm-items">
              {menuItems.map((item) => {
                const qty = quantities[item._id] ?? 0;
                const origQty = originalQuantities[item._id] ?? 0;
                const isSoldOut = item.remainingQuantity === 0;
                const isUnavailable = isSoldOut || !isOrderingAllowed;
                const isInCart = origQty > 0;

                let displayPrice =
                  item.isOffer && item.offerPrice > 0
                    ? item.offerPrice
                    : item.preOrderPrice > 0
                      ? item.preOrderPrice
                      : item.hubPrice;
                let originalPrice =
                  item.isOffer && item.offerPrice > 0 ? item.hubPrice : null;

                return (
                  <div
                    key={item._id}
                    className={`amm-item ${isUnavailable ? "amm-item--unavail" : ""}`}
                  >
                    <div className="amm-item-img">
                      {item.productId?.Foodgallery?.[0]?.image2 ? (
                        <img
                          src={item.productId.Foodgallery[0].image2}
                          alt={item.productId?.foodname}
                        />
                      ) : (
                        <div className="amm-item-img-placeholder" />
                      )}
                    </div>

                    <div className="amm-item-info">
                      <div className="amm-item-top">
                        {item.productId?.foodcategory === "Veg" ? (
                          <img src={IsVeg} alt="veg" className="amm-veg-icon" />
                        ) : (
                          <img
                            src={IsNonVeg}
                            alt="non-veg"
                            className="amm-veg-icon"
                          />
                        )}
                        <span className="amm-item-name">
                          {item.productId?.foodname}
                        </span>
                        {item.isOffer && (
                          <span className="amm-offer-badge">Offer</span>
                        )}
                        {isInCart && qty > 0 && (
                          <span className="amm-in-cart-badge">In cart</span>
                        )}
                      </div>
                      <div className="amm-item-price-row">
                        {originalPrice && (
                          <span className="amm-price-old">
                            ₹{originalPrice}
                          </span>
                        )}
                        <span className="amm-price-current">
                          ₹{displayPrice}
                        </span>
                        {isSoldOut && (
                          <span className="amm-soldout-tag">Sold out</span>
                        )}
                      </div>
                    </div>

                    <div className="amm-item-action">
                      {isUnavailable ? (
                        <span className="amm-unavail-label">Unavailable</span>
                      ) : qty === 0 ? (
                        <button
                          type="button"
                          className="amm-add-btn"
                          onClick={() =>
                            updateQuantity(item._id, 1, item.remainingQuantity)
                          }
                        >
                          Add
                        </button>
                      ) : (
                        <div className="cm-qty-pill amm-qty-pill">
                          <button
                            type="button"
                            className="cm-qty-btn"
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                -1,
                                item.remainingQuantity,
                              )
                            }
                            aria-label="Decrease"
                          >
                            −
                          </button>
                          <span className="cm-qty-value">{qty}</span>
                          <button
                            type="button"
                            className="cm-qty-btn"
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                1,
                                item.remainingQuantity,
                              )
                            }
                            disabled={qty >= (item.remainingQuantity || 99)}
                            aria-label="Increase"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>

        {/* Footer — only show when there are actual changes */}
        {hasChanges && (
          <Modal.Footer className="amm-footer">
            <div className="amm-footer-summary">
              <span className="amm-footer-count">
                {changedItems.length} change
                {changedItems.length !== 1 ? "s" : ""}
              </span>
              <span className="amm-footer-total">
                ₹{selectedTotal.toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              className="amm-confirm-btn"
              onClick={handleAddToCart}
              disabled={isLoading || !isOrderingAllowed}
            >
              Update cart
            </button>
          </Modal.Footer>
        )}
      </Modal>
    );
  };

  // How it works modal
  const HowItWorksModal = ({ show, onClose, pickupPoints }) => {
    return (
      <Modal show={show} onHide={onClose} centered className="hiw-modal">
        <Modal.Header  className="hiw-header">
          <div>
            <span className="hiw-badge">LOBBY PICKUP · FREE</span>
            <Modal.Title className="scf-sheet-title">
              Your food arrives at your pickup point.
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="hiw-body">
          <div className="hiw-step">
            <div className="hiw-step-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#6b8e23">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
            </div>
            <div>
              <div className="hiw-step-title">
                We'll ping you the moment it arrives.
              </div>
              <div className="hiw-step-sub">
                No guessing, no waiting around.
              </div>
               <span className="hiw-wa-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#6b8e23">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                WhatsApp alert
              </span>
            </div>
          </div>

          <div className="hiw-step">
            <div className="hiw-step-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6B8E23"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <div className="hiw-step-title">Walk down, pick it up — done</div>
              <div className="hiw-step-sub">
                Your name and flat number are on your order.
              </div>
            </div>
          </div>

          
        </Modal.Body>
        {/* <Modal.Footer className="hiw-footer">
          <Button className="hiw-got-it-btn" onClick={onClose}>
            Got it
          </Button>
        </Modal.Footer> */}
      </Modal>
    );
  };

  // Delivery Type UI - Exactly matching your 2nd image
  {
    /* ── Lobby / Door Delivery Type ── */
  }

  // Helper — add near your other helpers (top of component, before return)
  const formatDeliverySlots = (deliverySlots = []) => {
    const sessionOrder = ["Breakfast", "Lunch", "Dinner"];
    return [...deliverySlots].sort(
      (a, b) =>
        sessionOrder.indexOf(a.session) - sessionOrder.indexOf(b.session),
    );
  };

  const sessionBadgeClass = (session) => {
    if (session === "Breakfast")
      return "dt-slot-session dt-slot-session--breakfast";
    if (session === "Dinner") return "dt-slot-session dt-slot-session--dinner";
    return "dt-slot-session";
  };

  return (
    <div className="mainbg">
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(255,255,255,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <Spinner
            animation="border"
            style={{ color: "#6B8E23", width: "48px", height: "48px" }}
          />
          <p style={{ fontWeight: 600, fontSize: "16px", color: "#333" }}>
            Processing your payment...
          </p>
        </div>
      )}
      <div className="checkoutcontainer">
        <div className="mobile-banner-updated">
          <div className="screen-checkout mb-2">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                onClick={() => navigate(-1)}
                className="cursor-pointer"
              >
                <path
                  d="M11.7375 19.5002L19.0875 26.8502C19.3875 27.1502 19.5315 27.5002 19.5195 27.9002C19.5075 28.3002 19.351 28.6502 19.05 28.9502C18.75 29.2252 18.4 29.3692 18 29.3822C17.6 29.3952 17.25 29.2512 16.95 28.9502L7.05001 19.0502C6.90001 18.9002 6.79351 18.7377 6.73051 18.5627C6.66751 18.3877 6.63701 18.2002 6.63901 18.0002C6.64101 17.8002 6.67251 17.6127 6.73351 17.4377C6.79451 17.2627 6.90051 17.1002 7.05151 16.9502L16.9515 7.05019C17.2265 6.77519 17.5705 6.6377 17.9835 6.6377C18.3965 6.6377 18.7525 6.77519 19.0515 7.05019C19.3515 7.35019 19.5015 7.7067 19.5015 8.1197C19.5015 8.5327 19.3515 8.8887 19.0515 9.1877L11.7375 16.5002H28.5C28.925 16.5002 29.2815 16.6442 29.5695 16.9322C29.8575 17.2202 30.001 17.5762 30 18.0002C29.999 18.4242 29.855 18.7807 29.568 19.0697C29.281 19.3587 28.925 19.5022 28.5 19.5002H11.7375Z"
                  fill="#FAFAFA"
                />
              </svg>
            </div>
            <h3 className="checkout-title">Checkout</h3>
          </div>
        </div>

        <div className="mobile-checkout">
          {cartdata.length > 0 ? (
            renderReferenceCartItems()
          ) : (
            <div className="cart-container">
              <div className="cart-section">
                <div className="cart-content">
                  <div className="text-center">
                    <MdRemoveShoppingCart style={{ fontSize: "18px" }} /> No
                    items in cart
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="delivery-details mt-3 mb-2">Delivery Details</h4>
          </div>
          {addresstype !== "corporate" && (
            <div className="deliverycard">
              <div className="deliveryHead">
                <span style={{ fontWeight: 700 }}>Choose Delivery Type</span>
              </div>
              <div className="maincard">
                {addresstype === "apartment" ? (
                  <>
                    <div
                      className={`leftcard ${
                        selectedOption === "Door" ? "active" : ""
                      }`}
                      onClick={() => setSelectedOption("Door")}
                    >
                      {selectedOption === "Door" && (
                        <div className="top-right-icon">
                          <FaCheck />
                        </div>
                      )}
                      <div className="top">
                        <div className="icon">
                          <img src="/Assets/door2.png" alt="" />
                        </div>
                      </div>
                      <div className="center mt-1">
                        {doorDeliveryRatePerSlot > 0 ? (
                          <b>₹ {doorDeliveryRatePerSlot}</b>
                        ) : (
                          <b
                            style={{
                              backgroundColor: "#355f2e",
                              borderRadius: "5px",
                              padding: "1px 8px",
                              color: "white",
                              marginTop: "5px",
                            }}
                          >
                            FREE
                          </b>
                        )}
                      </div>
                      <div className="bottom">
                        <div className="icon">
                          <h6>Deliver to Doors</h6>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`rightcard ${
                        selectedOption === "Gate/Tower" ? "active" : ""
                      }`}
                      onClick={() => setSelectedOption("Gate/Tower")}
                    >
                      {selectedOption === "Gate/Tower" && (
                        <div className="top-right-icon">
                          <FaCheck />
                        </div>
                      )}
                      <div className="top">
                        <div className="icon">
                          <img src="/Assets/guard.png" alt="" />
                        </div>
                      </div>
                      <div className="center mt-1">
                        {doorDeliveryRatePerSlot > 0 ? (
                          <b>₹ {doorDeliveryRatePerSlot}</b>
                        ) : (
                          <b
                            style={{
                              backgroundColor: "#355f2e",
                              borderRadius: "5px",
                              padding: "1px 8px",
                              color: "white",
                              marginTop: "5px",
                            }}
                          >
                            FREE
                          </b>
                        )}
                      </div>
                      <div className="bottom">
                        <div className="icon">
                          <h6>Deliver to Gate</h6>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    className={`rightcard ${
                      selectedOption === "Gate/Tower" ? "active" : ""
                    }`}
                    onClick={() => setSelectedOption("Gate/Tower")}
                  >
                    {selectedOption === "Gate/Tower" && (
                      <div className="top-right-icon">
                        <FaCheck />
                      </div>
                    )}
                    <div className="top">
                      <div className="icon">
                        <img src="/Assets/guard.png" alt="" />
                      </div>
                    </div>
                    <div className="center mt-1">
                      {doorDeliveryRatePerSlot > 0 ? (
                        <b>₹ {doorDeliveryRatePerSlot}</b>
                      ) : (
                        <b
                          style={{
                            backgroundColor: "#355f2e",
                            borderRadius: "5px",
                            padding: "1px 8px",
                            color: "white",
                            marginTop: "5px",
                          }}
                        >
                          FREE
                        </b>
                      )}
                    </div>
                    <div className="bottom">
                      <div className="icon">
                        <h6>Deliver to Gate</h6>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="dd-card">
            <div className="dd-card-inner">
              <div className="dd-icon-col">
                <div className="dd-location-dot">
                  <img
                    src="/Assets/selectlocation.svg"
                    alt=""
                    className="dd-location-svg"
                  />
                </div>
              </div>

              <div className="dd-content-col">
                <div className="dd-name-row">
                  <span className="wallet-title">
                    {defaultAddress?.addressType === "Home"
                      ? defaultAddress?.homeName
                      : defaultAddress?.addressType === "PG"
                        ? defaultAddress?.apartmentName
                        : defaultAddress?.addressType === "School"
                          ? defaultAddress?.schoolName
                          : defaultAddress?.addressType === "Work"
                            ? defaultAddress?.companyName
                            : defaultAddress?.houseName || "No address saved"}
                  </span>
                  <span className="dd-type-badge">
                    {defaultAddress?.addressType || "Home"}
                  </span>
                </div>

                <p className="dd-full-address">
                  {defaultAddress?.fullAddress || ""}
                </p>

                <div className="dd-meta-row">
                  <span className="dd-meta-item">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {address?.name || address?.Fname || user?.Fname}
                  </span>
                  <span className="dd-meta-dot">·</span>
                  <span className="dd-meta-item">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z" />
                    </svg>
                    {user?.Mobile}
                  </span>
                </div>

                {defaultAddress?.addressType === "School" && (
                  <div className="dd-school-row">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                    <span>
                      {defaultAddress?.studentInformation?.studentName}
                    </span>
                    {defaultAddress?.studentInformation?.studentClass && (
                      <span className="dd-school-chip">
                        Class {defaultAddress?.studentInformation?.studentClass}
                        {defaultAddress?.studentInformation?.studentSection
                          ? ` · ${defaultAddress?.studentInformation?.studentSection}`
                          : ""}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Wallet apply ── */}

          <div>
            <h4 className="spply-s">Apply &amp; Save</h4>
            <div className="promo-wallet-container">
              <div className="wallet-section">
                <input
                  type="checkbox"
                  className="form-check-input wallet-checkbox"
                  name="Apply Wallet"
                  checked={walletApplied && (wallet?.balance || 0) > 0}
                  onChange={(e) => handleApplyWallet(e)}
                  style={{
                    border:
                      walletApplied && (wallet?.balance || 0) > 0
                        ? "1px solid #6B8E23 !important"
                        : "1px solid #6B6B6B !important",
                    backgroundColor:
                      walletApplied && (wallet?.balance || 0) > 0
                        ? "#6B8E23"
                        : "white",
                  }}
                />
                <div className="wallet-text">
                  <div className="wallet-header">
                    <span className="wallet-title">Apply Wallet Credit</span>
                    <span className="wallet-amount">
                      (₹
                      {Math.max(
                        (wallet?.balance || 0) - discountWallet,
                        0,
                      ).toFixed(2)}{" "}
                      available)
                    </span>
                  </div>
                  {user?.status === "Employee" ? (
                    <p className="wallet-subtext">
                      Now you can pay with wallet
                    </p>
                  ) : (
                    <p className="wallet-subtext">
                      Add ₹
                      {Math.max(
                        0,
                        Math.min(
                          walletSeting?.minCartValueForWallet || 0,
                          (walletSeting?.minCartValueForWallet || 0) -
                            (Number(subtotal) +
                              Number(Cutlery) +
                              Number(totalDeliveryAdjustment) || 0),
                        ),
                      )}{" "}
                      more to use
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Lobby / Door Delivery Type ── */}
          <div className="dt-selector-wrapper">
            <h4 className="delivery-details mb-3">Delivery Type</h4>
            {!deliveryRatesLoaded ? (
              <div
                style={{
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="lds-ripple" style={{ transform: "scale(0.5)" }}>
                  <div></div>
                  <div></div>
                </div>
              </div>
            ) : (
              <>
                <div className="dt-selector-row">
                  {/* Lobby Pickup */}
                  {gateDeliveryAvailable && (
                    <button
                      type="button"
                      className={`dt-option-card dt-option-card--lobby ${deliveryType === "gate" ? "dt-option-card--active" : ""}`}
                      onClick={() => setDeliveryType("gate")}
                      aria-pressed={deliveryType === "gate"}
                    >
                      {deliveryType === "gate" && (
                        <span className="dt-option-check" aria-hidden="true">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <circle cx="10" cy="10" r="10" fill="#6B8E23" />
                            <path
                              d="M5.5 10.5L8.3 13.3L14.5 6.5"
                              stroke="#fff"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                      <div className="dt-option-icon dt-option-icon--lobby">
                        <img src={lobby} alt="Lobby pickup" />
                      </div>
                      <div className="dt-option-body">
                        <span className="dt-option-title">Lobby Pickup</span>
                      </div>
                       <span className="dt-option-badge dt-option-badge--free mt-1">
                          Free
                        </span>
                      <button
                        type="button"
                        className="dt-how-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHowItWorksModal(true);
                        }}
                      >
                        How does it work?
                      </button>
                    </button>
                  )}

                  {/* Door Delivery */}
                  <button
                    type="button"
                    className={`dt-option-card ${deliveryType === "door" ? "dt-option-card--active" : ""}`}
                    onClick={() => setDeliveryType("door")}
                    aria-pressed={deliveryType === "door"}
                  >
                    {deliveryType === "door" && (
                      <span className="dt-option-check" aria-hidden="true">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <circle cx="10" cy="10" r="10" fill="#6B8E23" />
                          <path
                            d="M5.5 10.5L8.3 13.3L14.5 6.5"
                            stroke="#fff"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                    <div className="dt-option-icon">
                      <img src={door} alt="Door delivery" />
                    </div>
                    <div className="dt-option-body">
                      <span className="dt-option-title">To your door</span>
                    </div>
                     <span className="dt-option-badge dt-option-badge--paid mt-1">
                        {doorDeliveryRatePerSlot > 0
                          ? `₹${doorDeliveryRatePerSlot} extra`
                          : "Free"}
                      </span>
                  </button>
                </div>

                {/* Pickup point selector — only when lobby is chosen */}
                {gateDeliveryAvailable &&
                  deliveryType === "gate" &&
                  pickupPointsList.length > 0 && (
                    <div className="dt-pickup-section">
                      <div className="dt-pickup-label">
                        Select your pickup point
                      </div>
                      <div className="dt-pickup-grid">
                        {pickupPointsList.map((point) => (
                          <button
                            key={point._id}
                            type="button"
                            className={`dt-pickup-card ${selectedPickupPoint?._id === point._id ? "dt-pickup-card--active" : ""}`}
                            onClick={() => setSelectedPickupPoint(point)}
                          >
                            {selectedPickupPoint?._id === point._id && (
                              <span
                                className="dt-pickup-check"
                                aria-hidden="true"
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                >
                                  <circle
                                    cx="10"
                                    cy="10"
                                    r="10"
                                    fill="#6B8E23"
                                  />
                                  <path
                                    d="M5.5 10.5L8.3 13.3L14.5 6.5"
                                    stroke="#fff"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            )}
                            <div className="dt-pickup-name">{point.name}</div>
                            <div className="dt-pickup-loc">
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {point.location}
                            </div>

                            {/* ── NEW: deliverySlots grouped by session ── */}
                            <div className="dt-pickup-slots">
                              {formatDeliverySlots(point.deliverySlots).map(
                                (slotGroup) => (
                                  <div
                                    key={slotGroup.session}
                                    className="dt-slot-row mt-1"
                                  >
                                    <span
                                      className={sessionBadgeClass(
                                        slotGroup.session,
                                      )}
                                    >
                                      {slotGroup.session}
                                    </span>
                                    <div className="dt-slot-times">
                                      {(slotGroup.timeSlots || [])
                                        .filter((ts) => ts.isActive !== false)
                                        .map((ts, i) => (
                                          <span
                                            key={i}
                                            className="dt-slot-time-entry"
                                          >
                                            {ts.startTime} – {ts.endTime}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>

          {/* ── Billing Details ── */}
          <div className="belling-head">
            <span className="billinf">Billing Details</span>
            <span onClick={toggleBillingDetails} style={{ cursor: "pointer" }}>
              <img
                src="/Assets/expanddown.svg"
                alt="Toggle"
                className={`expandable-chevron ${isBillingOpen ? "open" : ""}`}
              />
            </span>
          </div>

          {isBillingOpen && (
            <div className="bd-card">
              <div className="bd-rows">
                {/* Item total */}
                <div className="bd-row">
                  <span className="bd-label">Item total</span>
                  <span className="bd-value">₹{subtotal.toFixed(2)}</span>
                </div>

                {/* Offer savings */}
                {/* {totalSavings > 0 && (
                  <div className="bd-row">
                    <span className="bd-label">Offer savings</span>
                    <span className="bd-value bd-value--green">
                      − ₹{totalSavings.toFixed(2)}
                    </span>
                  </div>
                )} */}

                {/* Delivery */}
                {deliveryType === "door" && (
                  <div className="bd-row">
                    <span className="bd-label">
                      Delivery fee
                      <span className="bd-label-sub">
                        × {deliverySlotCount} slot
                        {deliverySlotCount !== 1 ? "s" : ""}
                      </span>
                    </span>

                    <span className="bd-value">
                      {doorDeliveryRatePerSlot > 0 ? (
                        `+ ₹${(doorDeliveryRatePerSlot * deliverySlotCount).toFixed(2)}`
                      ) : (
                        <span className="bd-free-badge">FREE</span>
                      )}
                    </span>
                  </div>
                )}

                {/* ── Handling Charges section ── */}
                {(() => {
                  const sessionOrder = ["Breakfast", "Lunch", "Dinner"];
                  const sessionTotals = {};

                  cartdata.forEach((item) => {
                    const key =
                      item.session?.charAt(0).toUpperCase() +
                        item.session?.slice(1) || "Lunch";

                    const itemTotal = Number(
                      item.totalPrice ??
                        (item.preOrderPrice ??
                          item.price ??
                          item.hubPrice ??
                          0) * (item.quantity || 1),
                    );

                    sessionTotals[key] = (sessionTotals[key] || 0) + itemTotal;
                  });

                  const sessions = Object.entries(sessionTotals).sort(
                    ([a], [b]) =>
                      sessionOrder.indexOf(a) - sessionOrder.indexOf(b),
                  );

                  const totalHC = sessions.reduce(
                    (sum, [, total]) =>
                      sum + (total > 0 && total < minCartThreshold ? 20 : 0),
                    0,
                  );

                  // Hide completely if no handling charge
                  if (sessions.length === 0 || totalHC === 0) return null;

                  return (
                    <>
                      <div className="bd-row bd-row--section-header">
                        <span className="bd-label bd-label--section">
                          Small cart fees
                          <span className="bd-label-sub">
                            Below min. order ₹{minCartThreshold}/session
                          </span>
                        </span>

                        <span className="bd-value bd-value--red">
                          {`+ ₹${totalHC.toFixed(2)}`}
                        </span>
                      </div>
                    </>
                  );
                })()}

                {/* Cutlery */}
                {Cutlery !== 0 && (
                  <div className="bd-row">
                    <span className="bd-label">Cutlery</span>
                    <span className="bd-value">+ ₹{Cutlery}</span>
                  </div>
                )}

                {/* Coupon */}
                {coupon !== 0 && (
                  <div className="bd-row">
                    <span className="bd-label">Coupon discount</span>
                    <span className="bd-value bd-value--green">
                      − ₹{coupon}
                    </span>
                  </div>
                )}

                {/* GST */}
                <div className="bd-row">
                  <span className="bd-label">
                    GST ({gstRate}%)
                    <span className="bd-label-sub">On item total only</span>
                  </span>
                  <span className="bd-value">+ ₹{gstOnTotal.toFixed(2)}</span>
                </div>

                {/* Wallet */}
                {discountWallet !== 0 && (
                  <div className="bd-row">
                    <span className="bd-label">Wallet credit</span>
                    <span className="bd-value bd-value--green">
                      − ₹{discountWallet.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* To Pay */}
                <div className="bd-row bd-row--total">
                  <span className="bd-label bd-label--total">To pay</span>
                  <span className="bd-value bd-value--total">
                    ₹{totalPayable.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="checkout-button-sticky-wrapper">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                variant=""
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  border: "1px solid var(--steel_light, #E8E8E8)",
                  background: " var(--success-green, #6B8E23)",
                  display: "flex",
                  height: "48px",
                  padding: "8px",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                }}
                className="placeorder-bill"
                disabled={loading}
                onClick={handleCheckout}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <div className="paybutton">Pay | </div>
                    <p className="price-pay">₹ {totalPayable.toFixed(2)}</p>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Add bottom padding to prevent content from hiding behind sticky button */}
          <div style={{ height: "80px" }}></div>
        </div>
      </div>

      <LocationModal
        show={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />

      {/* Inside the return, before the closing tags */}
      <AddMoreModal
        show={addMoreModal.show}
        onClose={handleCloseAddMoreModal}
        hubId={addMoreModal.hubId}
        session={addMoreModal.session}
        deliveryDate={addMoreModal.deliveryDate}
        onItemsAdded={handleItemsAdded}
      />

      <HowItWorksModal
        show={showHowItWorksModal}
        onClose={() => setShowHowItWorksModal(false)}
        pickupPoints={pickupPointsList}
      />

      <SmallCartFeeModal
        show={showSmallCartModal}
        onClose={() => setShowSmallCartModal(false)}
        minCartThreshold={minCartThreshold}
      />
    </div>
  );
};

export default CheckoutMultiple;
