
// PaymentSuccess.jsx - Updated version

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import Lottie from "lottie-react";
import "../Styles/payment.css";

import success from "../../src/assets/Success2.json";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract all payment details from URL parameters
  const transactionId = searchParams.get("transactionId");
  const userId =
    searchParams.get("userID") ||
    searchParams.get("userId") ||
    localStorage.getItem("userId") ||
    localStorage.getItem("userID");
  const code = searchParams.get("code");
  const errorMessage = searchParams.get("error");

  // Extract payment details from URL parameters
  const urlSession = searchParams.get("session");
  const urlDeliveryDate = searchParams.get("deliveryDate");
  const urlUsername = searchParams.get("username");
  const urlAmount = searchParams.get("amount");
  const urlOrderId = searchParams.get("orderId");
  const urlHubName = searchParams.get("hubName");
  const urlDelivaryLocation = searchParams.get("delivarylocation");
  const urlStatus = searchParams.get("status");
  const urlPaymentMethod = searchParams.get("paymentMethod");
  
  // NEW: Parse multiple sessions from URL (comma-separated)
  const urlMultipleSessions = searchParams.get("sessions");
  const urlMultipleDeliveryDates = searchParams.get("deliveryDates");
  const urlMultipleOrderIds = searchParams.get("orderIds");

  // State for payment status
  const [paymentStatus, setPaymentStatus] = useState("LOADING");
  const [paymentDetails, setPaymentDetails] = useState({
    sessions: urlMultipleSessions ? urlMultipleSessions.split(',') : [urlSession || "Lunch"],
    deliveryDates: urlMultipleDeliveryDates ? urlMultipleDeliveryDates.split(',') : [urlDeliveryDate || new Date().toISOString()],
    orderIds: urlMultipleOrderIds ? urlMultipleOrderIds.split(',') : [urlOrderId || transactionId],
    username: urlUsername || "User",
    amount: parseFloat(urlAmount) || 0,
    hubName: urlHubName || "",
    delivarylocation: urlDelivaryLocation || "",
    paymentMethod: urlPaymentMethod || "online",
  });

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "today";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "today";
    }
  };

  // Helper function to format session name
  const formatSession = (session) => {
    return session?.charAt(0).toUpperCase() + session?.slice(1) || "Meal";
  };

  const handleFailureRedirect = () => {
    navigate("/checkout-multiple", { replace: true });
  };

  const checkPaymentStatus = async () => {
    console.log(
      "Payment details already available from URL parameters:",
      paymentDetails,
    );
  };

  useEffect(() => {
    // Handle explicit failure indicators
    if (
      urlStatus === "FAILED" ||
      code === "PAYMENT_ERROR" ||
      code === "PAYMENT_FAILED"
    ) {
      setPaymentStatus("FAILED");
      setTimeout(() => {
        navigate("/checkout-multiple", { replace: true });
      }, 8000);
      return;
    }

    // Always fetch from backend when we have a real transactionId
    // This ensures all order details (all sessions) are shown correctly
    if (
      transactionId &&
      transactionId !== "null" &&
      transactionId !== "undefined" &&
      transactionId !== "completed" &&
      userId
    ) {
      setPaymentStatus("LOADING");

      const fetchOrderDetails = async () => {
        try {
          const API_BASE_URL =
            process.env.REACT_APP_API_URL ||
            "https://dd-backend-3nm0.onrender.com";

          // Poll up to 5 times with 1.5s delay — backend may still be creating plans
          let result = null;
          for (let attempt = 1; attempt <= 5; attempt++) {
            const response = await fetch(
              `${API_BASE_URL}/api/user/razorpay/check-payment/${transactionId}/${userId}`
            );

            if (!response.ok) {
              if (attempt === 5) throw new Error(`HTTP ${response.status}`);
              await new Promise(r => setTimeout(r, 1500));
              continue;
            }

            const data = await response.json();
            console.log(`[PaymentSuccess] attempt ${attempt}:`, data);

            // Keep polling if transaction isn't COMPLETED yet
            if (data.success && data.success.status === "COMPLETED") {
              result = data;
              break;
            }

            if (attempt < 5) {
              await new Promise(r => setTimeout(r, 1500));
            }
          }

          if (result && result.success && result.success.status === "COMPLETED") {
            const orderDetails = result.success.orderDetails || [];

            if (orderDetails.length > 0) {
              // Use backend data — most reliable source
              setPaymentDetails({
                sessions: orderDetails.map(o => o.session),
                deliveryDates: orderDetails.map(o => o.deliveryDate),
                orderIds: orderDetails.map(o => o.orderId),
                username: result.success.username || urlUsername || "User",
                amount: result.success.amount || parseFloat(urlAmount) || 0,
                hubName: orderDetails[0]?.hubName || urlHubName || "",
                delivarylocation: orderDetails[0]?.delivarylocation || urlDelivaryLocation || "",
                paymentMethod: result.success.paymentMethod || urlPaymentMethod || "razorpay",
              });
            } else {
              // Backend returned no orderDetails — fall back to URL params
              const parsedSessions = urlMultipleSessions
                ? urlMultipleSessions.split(",").filter(Boolean)
                : urlSession ? [urlSession] : ["Lunch"];
              const parsedDates = urlMultipleDeliveryDates
                ? urlMultipleDeliveryDates.split(",").filter(Boolean)
                : urlDeliveryDate ? [urlDeliveryDate] : [new Date().toISOString()];
              const parsedOrderIds = urlMultipleOrderIds
                ? urlMultipleOrderIds.split(",").filter(Boolean)
                : urlOrderId ? [urlOrderId] : [transactionId];

              setPaymentDetails(prev => ({
                ...prev,
                sessions: parsedSessions,
                deliveryDates: parsedDates,
                orderIds: parsedOrderIds,
              }));
            }

            setPaymentStatus("COMPLETED");
            localStorage.removeItem("cart");
            setTimeout(() => {
              navigate("/my-plan", { replace: true });
            }, 5000);
          } else {
            // All attempts failed or status not COMPLETED — fall back to URL params
            const parsedSessions = urlMultipleSessions
              ? urlMultipleSessions.split(",").filter(Boolean)
              : urlSession ? [urlSession] : ["Lunch"];
            const parsedDates = urlMultipleDeliveryDates
              ? urlMultipleDeliveryDates.split(",").filter(Boolean)
              : urlDeliveryDate ? [urlDeliveryDate] : [new Date().toISOString()];

            if (urlStatus === "COMPLETED" || code === "PAYMENT_SUCCESS") {
              // URL says success but backend didn't confirm — trust URL params
              setPaymentDetails(prev => ({
                ...prev,
                sessions: parsedSessions,
                deliveryDates: parsedDates,
              }));
              setPaymentStatus("COMPLETED");
              localStorage.removeItem("cart");
              setTimeout(() => {
                navigate("/my-plan", { replace: true });
              }, 5000);
            } else {
              setPaymentStatus("FAILED");
              setTimeout(() => {
                navigate("/my-plan", { replace: true });
              }, 8000);
            }
          }
        } catch (error) {
          console.error("Error fetching order details:", error);
          // On network error, fall back to URL params if status says COMPLETED
          if (urlStatus === "COMPLETED") {
            const parsedSessions = urlMultipleSessions
              ? urlMultipleSessions.split(",").filter(Boolean)
              : urlSession ? [urlSession] : ["Lunch"];
            const parsedDates = urlMultipleDeliveryDates
              ? urlMultipleDeliveryDates.split(",").filter(Boolean)
              : urlDeliveryDate ? [urlDeliveryDate] : [new Date().toISOString()];

            setPaymentDetails(prev => ({
              ...prev,
              sessions: parsedSessions,
              deliveryDates: parsedDates,
            }));
            setPaymentStatus("COMPLETED");
            localStorage.removeItem("cart");
            setTimeout(() => {
              navigate("/my-plan", { replace: true });
            }, 5000);
          } else {
            setPaymentStatus("FAILED");
            setTimeout(() => {
              navigate("/my-plan", { replace: true });
            }, 8000);
          }
        }
      };

      fetchOrderDetails();
      return;
    }

    // No transactionId — wallet-only or direct success from URL
    if (urlStatus === "COMPLETED" || code === "PAYMENT_SUCCESS") {
      const parsedSessions = urlMultipleSessions
        ? urlMultipleSessions.split(",").filter(Boolean)
        : urlSession ? [urlSession] : ["Lunch"];
      const parsedDates = urlMultipleDeliveryDates
        ? urlMultipleDeliveryDates.split(",").filter(Boolean)
        : urlDeliveryDate ? [urlDeliveryDate] : [new Date().toISOString()];
      const parsedOrderIds = urlMultipleOrderIds
        ? urlMultipleOrderIds.split(",").filter(Boolean)
        : urlOrderId ? [urlOrderId] : [];

      setPaymentDetails(prev => ({
        ...prev,
        sessions: parsedSessions,
        deliveryDates: parsedDates,
        orderIds: parsedOrderIds,
      }));
      setPaymentStatus("COMPLETED");
      localStorage.removeItem("cart");
      setTimeout(() => {
        navigate("/my-plan", { replace: true });
      }, 5000);
      return;
    }

    // No transactionId and no success indicator — failure
    setPaymentStatus("FAILED");
    setTimeout(() => {
      navigate("/my-plan", { replace: true });
    }, 8000);
  }, [transactionId, userId, code, errorMessage, urlStatus, navigate]);

  // Helper to render order summary
  const renderOrderSummary = () => {
    if (!paymentDetails.sessions || paymentDetails.sessions.length === 1) {
      // Single order display
      return (
        <p className="success-subtitle">
          Your{" "}
          <span className="highlight-text">
            {formatSession(paymentDetails.sessions[0])}
          </span>
          {paymentDetails.deliveryDates[0] && (
            <> order for{" "}
            <span className="highlight-text">
              {formatDate(paymentDetails.deliveryDates[0])}
            </span>
            </>
          )} is confirmed and scheduled!
        </p>
      );
    }

    // Multiple orders display
    const uniqueDates = [...new Set(paymentDetails.deliveryDates)];
    
    if (uniqueDates.length === 1) {
      // All orders for the same date
      const sessionsList = paymentDetails.sessions.map(s => formatSession(s));
      const sessionText = sessionsList.join(", ");
      const lastCommaIndex = sessionText.lastIndexOf(", ");
      const formattedSessions = lastCommaIndex !== -1
        ? `${sessionText.substring(0, lastCommaIndex)} & ${sessionText.substring(lastCommaIndex + 2)}`
        : sessionText;
      
      return (
        <>
          <p className="success-subtitle">
            Your <span className="highlight-text">{formattedSessions}</span> orders
            for <span className="highlight-text">{formatDate(uniqueDates[0])}</span> are confirmed and scheduled!
          </p>
          {/* <div className="order-details-list">
            {paymentDetails.sessions.map((session, index) => (
              <div key={index} className="order-detail-item">
                <span className="session-name">{formatSession(session)}</span>
                {paymentDetails.orderIds[index] && (
                  <span className="order-id-small">Order ID: {paymentDetails.orderIds[index]}</span>
                )}
              </div>
            ))}
          </div> */}
        </>
      );
    } else {
      // Orders for different dates
      const ordersByDate = {};
      paymentDetails.sessions.forEach((session, index) => {
        const date = paymentDetails.deliveryDates[index];
        if (!ordersByDate[date]) ordersByDate[date] = [];
        ordersByDate[date].push(formatSession(session));
      });
      
      return (
        <>
          <p className="success-subtitle">Your orders are confirmed and scheduled!</p>
          <div className="order-details-multidate">
            {Object.entries(ordersByDate).map(([date, sessions]) => (
              <div key={date} className="date-order-group">
                <div className="date-label">{formatDate(date)}</div>
                <div className="sessions-list">{sessions.join(", ")}</div>
              </div>
            ))}
          </div>
        </>
      );
    }
  };

  return (
    <div
      className={`payment-success-page ${
        paymentStatus === "COMPLETED"
          ? "success"
          : paymentStatus === "FAILED"
            ? "failure"
            : ""
      }`}
    >
      {paymentStatus === "COMPLETED" ? (
        <div className="success-content">
          {/* Lottie Animation */}
          <div className="success-animation">
            <Lottie
              animationData={success}
              loop={false}
              style={{ width: 360, height: 360 }}
            />
          </div>

          {/* Success Message */}
          <div className="success-text">
            <h1 className="success-title">
              Great choice! This is how stress-free eating starts
            </h1>
            {renderOrderSummary()}
          </div>
        </div>
      ) : paymentStatus === "FAILED" ? (
        <div className="failure-content" style={{ background: "white", padding: "40px 20px", borderRadius: "16px" }}>
          <FaTimesCircle className="payment-failed-icon" style={{ color: "#b22222", fontSize: "60px", marginBottom: "20px" }} />
          <h1 className="payment-failed-title" style={{ color: "#333", fontSize: "24px", fontWeight: "700", marginBottom: "10px" }}>
            Payment Failed
          </h1>
          <p className="payment-failed-message" style={{ color: "#666", fontSize: "16px", marginBottom: "30px", lineHeight: "1.4" }}>
            {errorMessage || "We could not process your payment or it was cancelled. Please try again."}
          </p>
          <div className="failure-actions" style={{ display: "flex", flexDirection: "column", gap: "15px", margin: "30px 0", width: "100%", maxWidth: "300px" }}>
            <button onClick={handleFailureRedirect} className="failure-action-button primary" style={{ backgroundColor: "#ff6b35", color: "white", padding: "15px 30px", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", width: "100%" }}>
              Retry Payment
            </button>
            <button onClick={() => navigate("/", { replace: true })} className="failure-action-button secondary" style={{ backgroundColor: "transparent", color: "#b22222", padding: "15px 30px", border: "2px solid #b22222", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", width: "100%" }}>
              Go to Home
            </button>
          </div>
          <p className="auto-redirect-text" style={{ color: "#999", fontSize: "14px", marginTop: "20px", fontStyle: "italic" }}>
            You will be redirected to My Plan in 8 seconds...
          </p>
        </div>
      ) : paymentStatus === "LOADING" ? (
        <div className="loading-content">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Verifying payment status...</p>
        </div>
      ) : (
        // Fallback for any unknown state
        <div className="failure-content" style={{ background: "white", padding: "40px 20px", borderRadius: "16px" }}>
          <FaTimesCircle className="payment-failed-icon" style={{ color: "#b22222", fontSize: "60px", marginBottom: "20px" }} />
          <h1 className="payment-failed-title" style={{ color: "#333", fontSize: "24px", fontWeight: "700", marginBottom: "10px" }}>
            Payment Status Unknown
          </h1>
          <p className="payment-failed-message" style={{ color: "#666", fontSize: "16px", marginBottom: "30px", lineHeight: "1.4" }}>
            We couldn't determine your payment status. Please check your order history or try again.
          </p>
          <div className="failure-actions" style={{ display: "flex", flexDirection: "column", gap: "15px", margin: "30px 0", width: "100%", maxWidth: "300px" }}>
            <button onClick={handleFailureRedirect} className="failure-action-button primary" style={{ backgroundColor: "#ff6b35", color: "white", padding: "15px 30px", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", width: "100%" }}>
              Check My Orders
            </button>
            <button onClick={() => navigate("/", { replace: true })} className="failure-action-button secondary" style={{ backgroundColor: "transparent", color: "#b22222", padding: "15px 30px", border: "2px solid #b22222", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", width: "100%" }}>
              Go to Home
            </button>
          </div>
          <p className="auto-redirect-text" style={{ color: "#999", fontSize: "14px", marginTop: "20px", fontStyle: "italic" }}>
            You will be redirected to My Plan in 8 seconds...
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;