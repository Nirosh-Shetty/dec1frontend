import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { MdRemoveShoppingCart } from "react-icons/md";
import "../Styles/Checkout.css";
import { FaCheck } from "react-icons/fa";
import { PiWarningCircleBold } from "react-icons/pi";
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

  // Get cart data from helper
  const cartItems = useMemo(() => getCart(), [cartVersion]);

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
  const [loading, setLoading] = useState(false);
  const [gstRate, setGstRate] = useState(5); // Default GST rate
  const [deliveryRates, setDeliveryRates] = useState([]);
  const [hubCutoffTimes, setHubCutoffTimes] = useState(null);

  // // Use the calculated totals from cartHelper
  // const subtotal = totals.total;
  const totalSavings = totals.totalSavings;
  const regularTotal = totals.regularTotal;
  // const calculateTaxPrice = (5 / 100) * regularTotal;

  const primaryAddress =
    JSON.parse(localStorage.getItem("primaryAddress")) || {};
  const defaultAddress = primaryAddress;
  const addressHubId = defaultAddress?.hubId || "";

  useEffect(() => {
    const fetchDeliveryRatesByHub = async () => {
      if (!addressHubId) {
        setDeliveryRates([]);
        return;
      }

      try {
        const res = await axios.get(
          `https://dd-backend-3nm0.onrender.com/api/deliveryrate/hub/${encodeURIComponent(addressHubId)}`,
        );
        const rates = Array.isArray(res.data?.data) ? res.data.data : [];
        setDeliveryRates(rates);
        console.log("Delivery rates fetched:", rates);
      } catch (error) {
        console.error("Error fetching delivery rates by hub:", error);
        setDeliveryRates([]);
      }
    };

    fetchDeliveryRatesByHub();
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
        }
      } catch {
        // silently fail — cutoff validation will be skipped if unavailable
      }
    };
    fetchCutoffTimes();
  }, [addressHubId]);

  const roundAmount = (value) => Math.round((Number(value) || 0) * 100) / 100;

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

  const findDeliveryRate = (rates, hubId, acquisitionChannel, status) => {
    if (!hubId || !Array.isArray(rates) || rates.length === 0) return null;

    const matchesHub = (rate) => String(rate.hubId) === String(hubId);
    const matchers = [
      (rate) =>
        matchesHub(rate) &&
        rate.acquisition_channel === acquisitionChannel &&
        rate.status === status,
      (rate) =>
        matchesHub(rate) && rate.acquisition_channel === acquisitionChannel,
      (rate) => matchesHub(rate) && rate.status === status,
      (rate) =>
        matchesHub(rate) &&
        rate.acquisition_channel === "organic" &&
        rate.status === "Normal",
      matchesHub,
    ];

    const matchedRate = matchers
      .map((matcher) => rates.find(matcher))
      .find(Boolean);

    return matchedRate ? Number(matchedRate.deliveryRate || 0) : null;
  };

  const userDeliveryStatus =
    user?.status === "Employee" ? "Employee" : "Normal";
  const userAcquisitionChannel = user?.acquisition_channel || "organic";
  const fallbackDeliveryRate = Number(
    defaultAddress?.Delivarycharge ?? address?.Delivarycharge ?? 0,
  );

  // Calculate delivery charge per slot - use delivery rate if available, otherwise use fallback or default 15
  const deliveryChargePerSlot = useMemo(() => {
    const rateFromApi = findDeliveryRate(
      deliveryRates,
      addressHubId,
      userAcquisitionChannel,
      userDeliveryStatus,
    );

    console.log("Calculating delivery charge:", {
      rateFromApi,
      fallbackDeliveryRate,
      addressHubId,
      deliveryRatesLength: deliveryRates.length,
    });

    // If we have a rate from API, use it
    if (rateFromApi !== null) {
      return roundAmount(rateFromApi);
    }

    // Otherwise use fallback from address or default to 15
    return roundAmount(fallbackDeliveryRate || 15);
  }, [
    deliveryRates,
    addressHubId,
    userAcquisitionChannel,
    userDeliveryStatus,
    fallbackDeliveryRate,
  ]);
  const totalDeliveryCharge = roundAmount(
    deliveryChargePerSlot * deliverySlotCount,
  );
  const totalPayable = roundAmount(
    Math.max(
      subtotal + Cutlery + totalDeliveryCharge - discountWallet - coupon,
      0,
    ),
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

  const handleApplyWallet = (e) => {
    if (wallet?.balance === 0) {
      fireToast({ title: "Wallet balance is 0", icon: cross });
      e.target.checked = false;
      return;
    }
    if (e.target.checked) {
      let maxUsableAmount = subtotal + Cutlery + totalDeliveryCharge - coupon;
      let walletBalance = wallet?.balance || 0;
      let finalAmount = Math.min(walletBalance, Math.max(maxUsableAmount, 0));
      setDiscountWallet(finalAmount);
    } else {
      setDiscountWallet(0);
    }
  };

  const toggleBillingDetails = () => {
    setIsBillingOpen(!isBillingOpen);
  };

  const [isBillingOpen, setIsBillingOpen] = useState(true);

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

      const subtotalForPayable =
        subtotal + Cutlery + totalDeliveryCharge - coupon;
      const payableAmount = roundAmount(
        Math.max(subtotalForPayable - effectiveWalletDiscount, 0),
      );
      const totalAmount = Math.round(payableAmount * 100) / 100;

      // Cutoff validation — check every cart slot before proceeding to payment
      // Uses a 2:30 min grace window so users already mid-payment aren't blocked
      if (hubCutoffTimes) {
        const hubCutoffData = { cutoffTimes: hubCutoffTimes };
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
      const enrichedCartItems = cartdata.map((item) => ({
        ...item,
        deliveryCharge: deliveryChargePerSlot,
        username: user.Fname,
        mobile: user.Mobile,
        userId: user._id,
        hubId: defaultAddress?.hubId || "",
        hubName: defaultAddress?.hubName || "",
        address: defaultAddress?.fullAddress || "",
        customerType: user?.status || "User",
        coordinates: defaultAddress?.location,
      }));

      console.log(enrichedCartItems, "cartitems.............");
      console.log(payableAmount, "payable...............");
      console.log("Delivery Charge Per Slot:", deliveryChargePerSlot);
      console.log("Total Delivery Charge:", totalDeliveryCharge);
      console.log("Delivery Slot Count:", deliverySlotCount);
      console.log("Total Amount being sent to backend:", totalAmount);
      const handleSuccessfulCheckout = async (
        txnId,
        paymentMethod = "razorpay",
      ) => {
        localStorage.removeItem("cart");
        clearCart();

        // Fire wallet refresh in background — don't block navigation
        if (discountWallet && discountWallet > 0) {
          fetchWalletData();
        }

        // Get first delivery slot info for params
        const firstItem = enrichedCartItems?.[0] || {};
        const firstDeliveryDate =
          firstItem.deliveryDate || new Date().toISOString();
        const firstSession = firstItem.session || "Lunch";

        // Navigate immediately to success page
        const successParams = new URLSearchParams({
          transactionId: txnId || "completed",
          userId: user._id,
          session: firstSession,
          deliveryDate: firstDeliveryDate,
          username: user.Fname || "User",
          amount: payableAmount,
          orderId: txnId || "pending",
          hubName: defaultAddress?.hubName || "",
          delivarylocation: defaultAddress?.fullAddress || "",
          status: "COMPLETED",
          paymentMethod: paymentMethod,
          deliveryCharge: deliveryChargePerSlot,
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
          cartItems: enrichedCartItems,
          totalAmount,
          totalDeliveryCharge: Number(totalDeliveryCharge || 0),
          deliveryChargePerSlot: Number(deliveryChargePerSlot || 0),
          deliverySlotCount: Number(deliverySlotCount || 0),
          discountWallet: Number(effectiveWalletDiscount || 0),
          addressId: defaultAddress._id,
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
        console.log("Difference:", razorpayAmount - totalAmount * 100);

        // Validate that backend calculated the correct amount
        const expectedRazorpayAmount = Math.round(totalAmount * 100);
        if (Math.abs(razorpayAmount - expectedRazorpayAmount) > 1) {
          console.error("⚠️ AMOUNT MISMATCH DETECTED!");
          console.error(
            "Expected:",
            expectedRazorpayAmount,
            "paise (₹" + totalAmount + ")",
          );
          console.error(
            "Received:",
            razorpayAmount,
            "paise (₹" + razorpayAmount / 100 + ")",
          );
          console.error(
            "Delivery charge may not be included in backend calculation!",
          );

          // Show warning to user
          await Swal2.fire({
            icon: "warning",
            title: "Amount Mismatch",
            html: `
              <p>Expected amount: ₹${totalAmount.toFixed(2)}</p>
              <p>Razorpay amount: ₹${(razorpayAmount / 100).toFixed(2)}</p>
              <p>Difference: ₹${Math.abs(razorpayAmount / 100 - totalAmount).toFixed(2)}</p>
              <p><strong>The backend may not be including delivery charges correctly.</strong></p>
            `,
            confirmButtonText: "Proceed Anyway",
            showCancelButton: true,
            cancelButtonText: "Cancel",
          }).then((result) => {
            if (!result.isConfirmed) {
              throw new Error(
                "Payment cancelled by user due to amount mismatch",
              );
            }
          });
        }

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
    const addMoreArrow = "\u2190";

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

            return (
              <section key={session} className="cm-session-block">
                <h4 className="cm-session-title">{session}</h4>

                <div className="cm-session-items">
                  {items.map((item, index) => {
                    const itemTotal = getItemTotalPrice(item);
                    const itemSavings = getItemSavings(item);
                    const regularTotal = getItemRegularTotal(item);
                    const itemName =
                      item?.foodname || item?.itemName || item?.name || "Item";
                    const itemQuantity = getItemQuantity(item);

                    return (
                      <div
                        key={item.cartId || index}
                        className={`cm-item-row ${
                          index < items.length - 1 ? "cm-item-row--divided" : ""
                        }`}
                      >
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
                              -
                            </button>
                            <div className="cm-qty-value">{itemQuantity}</div>
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

                <div className="cm-session-footer">
                  <Link to="/home" replace className="cm-add-more-link">
                    <span className="cm-add-more-arrow">{addMoreArrow}</span>
                    <span className="cm-add-more-text">Add More</span>
                  </Link>

                  <div className="cm-total-chip">
                    <div className="cm-total-label">Total</div>
                    <div className="cm-total-price">
                      {sessionSavings > 0 && (
                        <div className="cm-total-old">
                          {rupeeSymbol}
                          {formatCartPrice(sessionOriginalTotal)}
                        </div>
                      )}
                      <div className="cm-total-current">
                        {rupeeSymbol}
                        {formatCartPrice(sessionTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
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
                        {deliveryChargePerSlot > 0 ? (
                          <b>₹ {deliveryChargePerSlot}</b>
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
                        {deliveryChargePerSlot > 0 ? (
                          <b>₹ {deliveryChargePerSlot}</b>
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
                      {deliveryChargePerSlot > 0 ? (
                        <b>₹ {deliveryChargePerSlot}</b>
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

          <div className="delivery-details-container">
            <div className="delivery-details-row">
              <div className="delivery-icon-wrapper">
                <img
                  style={{
                    filter:
                      "invert(40%) sepia(88%) saturate(390%) hue-rotate(36deg) brightness(94%) contrast(89%)",
                  }}
                  src="/Assets/selectlocation.svg"
                  alt="Location"
                  className="delivery-icon"
                />
              </div>
              <div className="delivery-content-wrapper">
                <p
                  className="select-location-text fw-semibold text-truncate mb-0"
                  style={{ maxWidth: "220px", color: "black" }}
                  title={
                    defaultAddress?.addressType === "Home"
                      ? defaultAddress?.homeName
                      : defaultAddress?.addressType === "PG"
                        ? defaultAddress?.apartmentName
                        : defaultAddress?.addressType === "School"
                          ? defaultAddress?.schoolName
                          : defaultAddress?.addressType === "Work"
                            ? defaultAddress?.companyName
                            : defaultAddress?.houseName || "No default address"
                  }
                >
                  {defaultAddress?.addressType === "Home"
                    ? defaultAddress?.homeName
                    : defaultAddress?.addressType === "PG"
                      ? defaultAddress?.apartmentName
                      : defaultAddress?.addressType === "School"
                        ? defaultAddress?.schoolName
                        : defaultAddress?.addressType === "Work"
                          ? defaultAddress?.companyName
                          : defaultAddress?.houseName || "No default address"}
                </p>
                <p
                  className="small text-truncate mb-0"
                  style={{
                    maxWidth: "280px",
                    color: "black",
                  }}
                  title={defaultAddress?.fullAddress}
                >
                  {defaultAddress?.fullAddress || ""}
                </p>
                <div className="caption-section" data-text-role="Caption">
                  <div className="user-detailss mt-1">
                    {address?.name || address?.Fname} | {user?.Mobile}
                  </div>
                  <div className="user-detailss mt-1">
                    {defaultAddress?.addressType === "School" ? (
                      <div className="d-flex gap-1">
                        <p>{defaultAddress?.studentInformation?.schoolName}</p>
                        <p>{defaultAddress?.studentInformation?.studentName}</p>
                        <p>
                          {defaultAddress?.studentInformation?.studentClass}
                        </p>
                        <p>
                          {defaultAddress?.studentInformation?.studentSection}
                        </p>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                {address.locationType === "school" && (
                  <div className="caption-section" data-text-role="Caption">
                    <div className="user-detailss mt-1">
                      {storedInfo?.studentName || ""} | class -{" "}
                      {storedInfo?.studentClass || ""}{" "}
                      {storedInfo?.studentSection
                        ? `| section - ${storedInfo.studentSection}`
                        : ""}
                    </div>
                  </div>
                )}
              </div>
              <div className="change-button">
                <div className="change-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M12.7869 4.06006C13.0026 4.06408 13.197 4.13649 13.3679 4.27393L13.4402 4.3374L13.4421 4.33936L14.0691 4.96729H14.0701C14.2584 5.15512 14.3562 5.37816 14.3562 5.63135C14.3561 5.88443 14.2583 6.10722 14.0701 6.29541L8.06909 12.2964L8.12964 12.356L7.97827 12.3872L7.92847 12.437L7.89526 12.4038L6.14429 12.7642L6.14331 12.7632C5.99732 12.7977 5.86495 12.7583 5.75757 12.6509C5.6507 12.5438 5.61079 12.4117 5.64526 12.2661L6.00366 10.5142L5.97144 10.4819L6.02124 10.4312L6.05249 10.2798L6.11304 10.3394L12.1277 4.33936C12.3159 4.15164 12.537 4.05551 12.7869 4.06006ZM3.90894 4.93896C4.82094 5.04553 5.51534 5.25975 5.98022 5.59033L6.14624 5.72217C6.50712 6.04333 6.68917 6.46017 6.68921 6.96631C6.68921 7.46798 6.48149 7.87559 6.07202 8.18018C5.66644 8.48179 5.09567 8.65629 4.37183 8.71533L4.3728 8.71631C3.56599 8.78862 2.97488 8.95356 2.58765 9.20166C2.20735 9.44537 2.02278 9.7739 2.02319 10.1958L2.03003 10.3452C2.06267 10.6821 2.20957 10.9385 2.46753 11.1235C2.76926 11.3398 3.255 11.4829 3.93921 11.5415L4.03296 11.5493L4.03101 11.6431L4.01538 12.3101L4.01245 12.4146L3.90894 12.4077C3.02682 12.3515 2.34286 12.14 1.86987 11.7622C1.39341 11.3812 1.15698 10.8553 1.15698 10.1958C1.15698 9.53364 1.4429 8.99511 2.00562 8.5874C2.56435 8.18297 3.33478 7.93994 4.3064 7.8501C4.8365 7.80039 5.22055 7.69624 5.46948 7.54639C5.71114 7.40131 5.823 7.21012 5.823 6.96631C5.82295 6.63775 5.67929 6.38651 5.37964 6.20361C5.07099 6.01541 4.55566 5.87468 3.82104 5.7915L3.72241 5.78076L3.73218 5.68213L3.79761 5.02881L3.80835 4.92725L3.90894 4.93896ZM12.7771 4.99463C12.7176 4.99466 12.671 5.01448 12.6306 5.05518H12.6296L7.20581 10.4771L7.9314 11.2026L13.3542 5.78076C13.3953 5.73967 13.4148 5.69221 13.4148 5.6333C13.4148 5.58902 13.4041 5.55139 13.3816 5.51807L13.3552 5.48584L12.9236 5.05518C12.883 5.01429 12.8361 4.99463 12.7771 4.99463Z"
                      fill="#6B6B6B"
                      stroke="#6B6B6B"
                      strokeWidth="0.2"
                    />
                  </svg>
                </div>
                <div className="change-badge" data-text-role="Badge/Chip">
                  <div className="change-text">
                    <span
                      onClick={() => setShowLocationModal(true)}
                      style={{ cursor: "pointer" }}
                    >
                      {defaultAddress ? "Change" : "Add address"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="spply-s">Apply & Save</h4>
            <div className="promo-wallet-container">
              <div className="wallet-section">
                <input
                  type="checkbox"
                  className="form-check-input wallet-checkbox"
                  name="Apply Wallet"
                  checked={discountWallet ? true : false}
                  onChange={(e) => handleApplyWallet(e)}
                  style={{
                    border: discountWallet
                      ? "1px solid #6B8E23 !important"
                      : "1px solid #6B6B6B !important",
                    backgroundColor: discountWallet ? "#6B8E23" : "white",
                  }}
                />
                <div className="wallet-text">
                  <div className="wallet-header">
                    <span className="wallet-title">Apply Wallet Credit</span>
                    <span className="wallet-amount">
                      (₹{(wallet?.balance - discountWallet)?.toFixed(2)}{" "}
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
                              Number(totalDeliveryCharge) || 0),
                        ),
                      )}{" "}
                      more to use
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="belling-head">
            <span className="billinf">Billing Details</span>
            <span onClick={toggleBillingDetails}>
              <span
                onClick={toggleBillingDetails}
                style={{ cursor: "pointer", display: "inline-block" }}
              >
                <img
                  src="/Assets/expanddown.svg"
                  alt="Toggle"
                  className={`expandable-chevron ${
                    isBillingOpen ? "open" : ""
                  }`}
                />
              </span>
            </span>
          </div>

          {isBillingOpen && (
            <div className="deliverycard">
              <div className="maincard2 p-3">
                <div
                  className="billdetail  w-100 flex-wrap"
                  style={{ gap: "20px" }}
                >
                  <div className="label-column">
                    <div className="toatal-va">Total Order Value</div>
                    {totalSavings > 0 && (
                      <div className="toatal-va" style={{ color: "green" }}>
                        Offer Savings
                      </div>
                    )}
                    <div className="toatal-va">Tax Breakdown ({gstRate}%)</div>
                    <div className="toatal-va">Delivery Charge</div>
                    {Cutlery !== 0 && <div className="toatal-va">Cutlery</div>}
                    {coupon !== 0 && (
                      <div className="toatal-va">Coupon Discount</div>
                    )}
                    {selectedOption && (
                      <div className="toatal-va">{`${selectedOption} Delivery`}</div>
                    )}
                    {discountWallet !== 0 && (
                      <div className="toatal-va">Wallet Pay</div>
                    )}
                    <div>
                      <b className="toatal-va">Total Payable</b>
                    </div>
                  </div>
                  <div className="value-column">
                    <div className="toatal-va">
                      ₹ {(regularTotal - calculateTaxPrice)?.toFixed(2)}
                    </div>
                    {totalSavings > 0 && (
                      <div className="toatal-va" style={{ color: "green" }}>
                        - ₹ {totalSavings.toFixed(2)}
                      </div>
                    )}
                    <div className="toatal-va">
                      ₹ {calculateTaxPrice.toFixed(2)}
                    </div>
                    {/* <div className="toatal-va">
                      ₹ {cartdata?.deliveryCharge || 0}
                    </div> */}
                    {/* {Cutlery !== 0 && (
                      <div className="toatal-va">₹ {Cutlery}</div>
                    )} */}
                    {/* {coupon !== 0 && (
                      <div className="toatal-va" style={{ color: "green" }}>
                        - ₹ {coupon}
                      </div>
                    )} */}

                    {/* {totalDeliveryCharge !== 0 && (
                      <div className="toatal-va">
                        {deliverySlotCount > 1
                          ? `Delivery (${deliverySlotCount} slots)`
                          : selectedOption
                            ? `${selectedOption} Delivery`
                            : "Delivery"}
                      </div>
                    )} */}
                    {/* {totalDeliveryCharge !== 0 && ( */}
                    <div className="toatal-va">₹ {totalDeliveryCharge}</div>
                    {/* )} */}
                    {discountWallet !== 0 && (
                      <div className="toatal-va" style={{ color: "green" }}>
                        - ₹ {discountWallet?.toFixed(2)}
                      </div>
                    )}
                    <div className="toatal-va">
                      <b>₹ {totalPayable.toFixed(2)}</b>
                    </div>
                  </div>
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
                    <div className="paybutton">Place Order | </div>
                    <p className="price-pay">{totalPayable.toFixed(2)}</p>
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
    </div>
  );
};

export default CheckoutMultiple;
