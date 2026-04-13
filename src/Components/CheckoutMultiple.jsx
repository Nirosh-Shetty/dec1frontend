import React, { useMemo, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal2 from "sweetalert2";
import { toast } from "react-toastify";
import { WalletContext } from "../WalletContext";
import {
  getCart,
  getCartGroupedByDateSession,
  calculateCartTotals,
  getCartSummary,
  formatSlot,
  clearCart,
} from "../Helper/cartHelper";
import "../Styles/CheckoutMultiple.css";

const CheckoutMultiple = () => {
  const navigate = useNavigate();
  const { wallet } = useContext(WalletContext);

  // State
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [address, setAddress] = useState(() => {
    try {
      const primary = localStorage.getItem("primaryAddress");
      return primary ? JSON.parse(primary) : null;
    } catch {
      return null;
    }
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(address?._id || "");
  const [expandedSlots, setExpandedSlots] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  // Get cart data
  const cartItems = useMemo(() => getCart(), []);
  const groupedCarts = useMemo(() => {
    try {
      return getCartGroupedByDateSession();
    } catch (error) {
      console.error("Error grouping cart items:", error);
      return {};
    }
  }, []);
  const totals = useMemo(() => {
    try {
      return calculateCartTotals();
    } catch (error) {
      console.error("Error calculating totals:", error);
      return { bySlot: {}, total: 0, itemCount: 0 };
    }
  }, []);
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
      };
    }
  }, []);

  // Compute order summary by slot
  const orderSummary = useMemo(() => {
    const summary = [];
    try {
      Object.entries(groupedCarts).forEach(([slot, items]) => {
        const [dateStr, session] = slot.split("|");
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const slotTotal = totals.bySlot[slot] || 0;
        const sessionLabel = session.charAt(0).toUpperCase() + session.slice(1);
        
        try {
          const date = new Date(dateStr + "T00:00:00");
          if (isNaN(date.getTime())) {
            console.error("Invalid date string:", dateStr);
            return;
          }
          const dateFormatter = new Intl.DateTimeFormat("en-US", { 
            weekday: "short",
            day: "numeric", 
            month: "short" 
          });
          const dateFormatted = dateFormatter.format(date);
          
          summary.push({
            slot,
            dateFormatted: `${dateFormatted} ${sessionLabel}`,
            itemCount,
            total: slotTotal,
          });
        } catch (slotError) {
          console.error("Error formatting date for slot", slot, slotError);
        }
      });
    } catch (error) {
      console.error("Error computing order summary:", error);
    }
    return summary;
  }, [groupedCarts, totals]);

  // Fetch addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `http://localhost:7013/api/user/address/get-addresses?userId=${user._id}`
        );
        if (res.status === 200 && res.data?.data) {
          setAddresses(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    fetchAddresses();
  }, [user]);

  // Get current address from selected ID
  const currentAddress = useMemo(() => {
    if (selectedAddressId) {
      const found = addresses.find((a) => a._id === selectedAddressId);
      if (found) return found;
    }
    return address;
  }, [selectedAddressId, addresses, address]);

  // Toggle slot expansion
  const toggleSlotExpansion = (slot) => {
    setExpandedSlots((prev) => ({
      ...prev,
      [slot]: !prev[slot],
    }));
  };

  // Validate cutoffs
  const validateCutoffs = async () => {
    try {
      for (const [slot, items] of Object.entries(groupedCarts)) {
        const [dateStr, session] = slot.split("|");
        
        // Simple validation: check if date is not in past
        const slotDate = new Date(dateStr + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (slotDate < today) {
          toast.error(`Cannot order for past date: ${dateStr}`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Cutoff validation error:", error);
      return false;
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    // Validate
    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!currentAddress) {
      toast.error("Please select delivery address");
      return;
    }

    // Validate cutoffs
    const cutoffsValid = await validateCutoffs();
    if (!cutoffsValid) {
      return;
    }

    setIsProcessing(true);

    try {
      // Call backend to create Razorpay order
      const res = await axios.post(
        "http://localhost:7013/api/user/razorpay/create-order-from-cart",
        {
          userId: user._id,
          cartItems: cartItems,
          totalAmount: Math.round(totals.total), // Convert to paise/smallest unit
          addressId: currentAddress._id,
          notes: {
            username: user.Fname,
            mobile: user.Mobile,
          },
        }
      );

      if (res.status === 200 && res.data?.razorpayOrderId) {
        const { razorpayOrderId, transactionId: txnId, key: razorpayKey } = res.data;
        setTransactionId(txnId); // Store for verify step

        // Open Razorpay modal
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const options = {
            key: razorpayKey, // Get key from backend response
            amount: Math.round(totals.total * 100), // Amount in paise
            currency: "INR",
            order_id: razorpayOrderId,
            name: "Dailydish",
            description: `${summary.mealCount} meals · ${summary.dayCount} days`,
            handler: (response) => {
              handlePaymentSuccess(response, txnId);
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
        document.body.appendChild(script);
      } else {
        toast.error("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error.response?.data?.message || "Failed to process checkout"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (response, txnId) => {
    try {
      // Augment cart items with user and address metadata for MyPlan creation
      const enrichedCartItems = cartItems.map((item) => ({
        ...item,
        username: user.Fname,
        mobile: user.Mobile,
        userId: user._id,
        hubId: currentAddress?.hubId || "",
        hubName: currentAddress?.hubName || "",
        address: currentAddress?.fullAddress || currentAddress?.address || "",
        customerType: "User",
      }));

      // Verify payment with backend - call the NEW endpoint that creates MyPlan
      const res = await axios.post(
        "http://localhost:7013/api/user/razorpay/verify-payment-and-create-plan",
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          transactionId: txnId,
          userId: user._id,
          cartItems: enrichedCartItems,
          addressId: currentAddress?._id,
        }
      );

      if (res.status === 200 && res.data?.success) {
        // Payment verified - clear cart and navigate
        localStorage.removeItem("cart");
        clearCart();
        
        toast.success("Order placed successfully! ✓");
        
        // Redirect to MyPlan
        setTimeout(() => {
          navigate("/my-plan");
        }, 1500);
      } else {
        throw new Error(res.data?.error || "Order creation failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error(error.response?.data?.error || error.message || "Payment verification failed. Contact support.");
    }
  };

  // Handle edit dishes
  const handleEditDishes = () => {
    navigate("/home");
  };

  // Handle address change
  const handleAddressChange = (addressId) => {
    setSelectedAddressId(addressId);
    setShowAddressModal(false);
  };

  // Render item row (with quantity)
  const renderItemRow = (item) => (
    <div key={item.cartId} className="checkout-item-row">
      <div className="checkout-item-name">
        {item.itemName} {item.quantity > 1 && `×${item.quantity}`}
      </div>
      <div className="checkout-item-price">₹{item.price * item.quantity}</div>
    </div>
  );

  // Render slot section (grouped by date+session)
  const renderSlotSection = (slot, items) => {
    const isExpanded = expandedSlots[slot];
    const displayCount = 2; // Show 2 items, rest in "more"
    const hiddenCount = items.length - displayCount;
    const [dateStr, session] = slot.split("|");
    const sessionLabel = session.charAt(0).toUpperCase() + session.slice(1);
    
    let dayFormatted = "Unknown";
    let dateFormatted = "Unknown";
    
    try {
      const date = new Date(dateStr + "T00:00:00");
      if (!isNaN(date.getTime())) {
        const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
        const formatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" });
        dayFormatted = dayFormatter.format(date);
        dateFormatted = formatter.format(date);
      }
    } catch (dateError) {
      console.error("Error parsing date:", dateStr, dateError);
    }

    const slotTotal = totals.bySlot[slot] || 0;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div key={slot} className="checkout-slot-section">
        <div className="checkout-slot-header">
          <div>
            <div className="checkout-slot-title">
              {dayFormatted} {dateFormatted} · {sessionLabel}
            </div>
          </div>
          <div className="checkout-slot-cutoff">By 1:00 PM</div>
        </div>

        <div className="checkout-items-container">
          {/* Show first 2 items always */}
          {items.slice(0, displayCount).map(renderItemRow)}

          {/* Show "more items" button if hidden items exist */}
          {!isExpanded && hiddenCount > 0 && (
            <button
              className="checkout-show-more-btn"
              onClick={() => toggleSlotExpansion(slot)}
            >
              + {hiddenCount} more items
              <span className="checkout-show-all-link">Show all</span>
            </button>
          )}

          {/* Show remaining items if expanded */}
          {isExpanded && items.slice(displayCount).map(renderItemRow)}

          {/* Hide button when expanded */}
          {isExpanded && hiddenCount > 0 && (
            <button
              className="checkout-show-more-btn"
              onClick={() => toggleSlotExpansion(slot)}
            >
              Show less
            </button>
          )}
        </div>

        <div className="checkout-slot-footer">
          <div className="checkout-subtotal">
            Subtotal · {itemCount} items
          </div>
          <div className="checkout-subtotal-price">₹{slotTotal}</div>
        </div>

        <button
          className="checkout-edit-dishes-btn"
          onClick={handleEditDishes}
        >
          ← Edit dishes
        </button>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="checkout-container">
        <div className="checkout-error">Please login to proceed with checkout</div>
      </div>
    );
  }

  if (cartItems.length === 0 || Object.keys(groupedCarts).length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="checkout-back-btn" onClick={() => navigate("/home")}>
            ← Back
          </button>
          <h1 className="checkout-title">Checkout</h1>
        </div>
        <div className="checkout-error" style={{ marginTop: "100px" }}>
          <div>Your cart is empty</div>
          <button 
            onClick={() => navigate("/home")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#6B8E23",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Header */}
      <div className="checkout-header">
        <button className="checkout-back-btn" onClick={() => navigate("/home")}>
          ← Back
        </button>
        <h1 className="checkout-title">Checkout</h1>
      </div>

      {/* Summary */}
      <div className="checkout-summary-bar">
        <div className="checkout-summary-text">
          {summary.summary}
        </div>
        <div className="checkout-date-pills">
          {summary.dates.map((date, idx) => (
            <span key={idx} className="checkout-date-pill">{date}</span>
          ))}
        </div>
      </div>

      {/* Grouped Items */}
      <div className="checkout-items-section">
        {Object.entries(groupedCarts).map(([slot, items]) =>
          renderSlotSection(slot, items)
        )}
      </div>

      {/* Address Card */}
      <div className="checkout-address-section">
        <div className="checkout-address-icon">📍</div>
        <div className="checkout-address-details">
          <div className="checkout-address-type">
            {currentAddress?.addressType || "Home"}
          </div>
          <div className="checkout-address-text">
            {currentAddress?.fullAddress || currentAddress?.address || "No address"}
          </div>
          <button
            className="checkout-change-address-btn"
            onClick={() => setShowAddressModal(true)}
          >
            Change address
          </button>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="checkout-modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Delivery Address</h3>
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`checkout-address-option ${
                  selectedAddressId === addr._id ? "selected" : ""
                }`}
                onClick={() => handleAddressChange(addr._id)}
              >
                <div className="checkbox">
                  {selectedAddressId === addr._id && "✓"}
                </div>
                <div className="address-info">
                  <div className="address-type">{addr.addressType || "Home"}</div>
                  <div className="address-full">{addr.fullAddress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="checkout-summary-section">
        {orderSummary.map((item) => (
          <div key={item.slot} className="checkout-summary-row">
            <span className="checkout-summary-label">
              {item.dateFormatted} ({item.itemCount} items)
            </span>
            <span className="checkout-summary-amount">₹{item.total}</span>
          </div>
        ))}

        {/* Delivery charge (always free) */}
        <div className="checkout-summary-row">
          <span className="checkout-summary-label">
            Delivery ({Object.keys(groupedCarts).length} orders)
          </span>
          <span className="checkout-summary-amount checkout-free">Free</span>
        </div>

        {/* Total */}
        <div className="checkout-total-row">
          <span className="checkout-total-label">Total</span>
          <span className="checkout-total-amount">₹{totals.total}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="checkout-actions">
        <button
          className="checkout-place-order-btn"
          onClick={() => {
            Swal2.fire({
              title: "Confirm Order?",
              text: `${summary.summary}`,
              icon: "info",
              showCancelButton: true,
              confirmButtonText: "Confirm",
              cancelButtonText: "Cancel",
              confirmButtonColor: "#6B8E23",
            }).then((result) => {
              if (result.isConfirmed) {
                handleCheckout();
              }
            });
          }}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : `Place all orders - Pay ₹${totals.total}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutMultiple;
