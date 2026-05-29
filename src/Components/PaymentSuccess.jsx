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
  const code = searchParams.get("code"); // PhonePe sends this (e.g., PAYMENT_ERROR)
  const errorMessage = searchParams.get("error"); // Custom error message (Razorpay sends this)

  // Extract payment details from URL parameters
  const urlSession = searchParams.get("session");
  const urlDeliveryDate = searchParams.get("deliveryDate");
  const urlUsername = searchParams.get("username");
  const urlAmount = searchParams.get("amount");
  const urlOrderId = searchParams.get("orderId");
  const urlHubName = searchParams.get("hubName");
  const urlDelivaryLocation = searchParams.get("delivarylocation");
  const urlStatus = searchParams.get("status"); // COMPLETED or FAILED (from backend)
  const urlPaymentMethod = searchParams.get("paymentMethod"); // razorpay, phonepe, or wallet

  // State for payment status
  const [paymentStatus, setPaymentStatus] = useState("LOADING");
  const [paymentDetails, setPaymentDetails] = useState({
    session: urlSession || "Lunch",
    deliveryDate: urlDeliveryDate || new Date().toISOString(),
    username: urlUsername || "User",
    amount: parseFloat(urlAmount) || 0,
    orderId: urlOrderId || transactionId,
    hubName: urlHubName || "",
    delivarylocation: urlDelivaryLocation || "",
    paymentMethod: urlPaymentMethod || "online",
  });

  // Debug: Log current state
  // console.log("Current payment status:", paymentStatus);
  // console.log("URL params:", { transactionId, userId, code, errorMessage });

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

  const handleFailureRedirect = () => {
    navigate("/checkout-multiple", { replace: true }); // Go back to plan to retry
  };

  const checkPaymentStatus = async () => {
    // No API call needed - all data is passed via URL parameters
    // This function is kept for backward compatibility but does nothing
    console.log(
      "Payment details already available from URL parameters:",
      paymentDetails,
    );
  };

  useEffect(() => {
    console.log(
      "PaymentSuccess useEffect - transactionId:",
      transactionId,
      "userId:",
      userId,
      "urlStatus:",
      urlStatus,
      "code:",
      code,
      "errorMessage:",
      errorMessage,
    );
    console.log("URL Payment Details:", paymentDetails);

    // PRIORITY 1: Check for explicit failure indicators
    if (
      urlStatus === "FAILED" ||
      code === "PAYMENT_ERROR" ||
      code === "PAYMENT_FAILED"
    ) {
      console.log(
        "Setting payment status to FAILED - urlStatus:",
        urlStatus,
        "code:",
        code,
      );
      setPaymentStatus("FAILED");
      setTimeout(() => {
        navigate("/checkout-multiple", { replace: true });
      }, 8000);
      return;
    }

    // PRIORITY 2: Check for explicit success indicators (wallet payment, etc.)
    if (
      urlStatus === "COMPLETED" ||
      transactionId === "completed" ||
      code === "PAYMENT_SUCCESS"
    ) {
      console.log("Payment successful - urlStatus:", urlStatus);
      setPaymentStatus("COMPLETED");
      localStorage.removeItem("cart");
      setTimeout(() => {
        navigate("/my-plan", { replace: true });
      }, 5000);
      return;
    }

    // PRIORITY 3: If we have transactionId and userId, verify from backend
    if (
      transactionId &&
      transactionId !== "null" &&
      transactionId !== "undefined" &&
      transactionId !== "completed" &&
      userId
    ) {
      console.log(
        "Transaction ID exists, verifying payment status from backend",
      );
      setPaymentStatus("LOADING");

      // Poll for payment status every 2 seconds for up to 30 seconds
      let pollCount = 0;
      const maxPolls = 15;

      const pollInterval = setInterval(async () => {
        pollCount++;
        console.log(
          `Polling payment status (attempt ${pollCount}/${maxPolls})...`,
        );

        try {
          const API_BASE_URL =
            process.env.REACT_APP_API_URL || "https://dd-backend-3nm0.onrender.com";
          const response = await fetch(
            `${API_BASE_URL}/api/user/razorpay/check-payment/${transactionId}/${userId}`,
          );

          if (response.ok) {
            const result = await response.json();
            console.log("Poll result:", result);

            if (result.success && result.success.status === "COMPLETED") {
              console.log("Payment verified as COMPLETED");
              clearInterval(pollInterval);

              // Update payment details from backend response
              if (result.success.planDetails) {
                setPaymentDetails({
                  session:
                    result.success.planDetails.session ||
                    paymentDetails.session,
                  deliveryDate:
                    result.success.planDetails.deliveryDate ||
                    paymentDetails.deliveryDate,
                  username:
                    result.success.planDetails.username ||
                    result.success.username ||
                    paymentDetails.username,
                  amount: result.success.amount || paymentDetails.amount,
                  orderId: result.success.orderId || paymentDetails.orderId,
                  hubName:
                    result.success.planDetails.hubName ||
                    paymentDetails.hubName,
                  delivarylocation:
                    result.success.planDetails.delivarylocation ||
                    paymentDetails.delivarylocation,
                  paymentMethod: "razorpay",
                });
              }

              setPaymentStatus("COMPLETED");
              localStorage.removeItem("cart");
              setTimeout(() => {
                navigate("/my-plan", { replace: true });
              }, 5000);
            } else if (result.success && result.success.status === "FAILED") {
              console.log("Payment verified as FAILED");
              clearInterval(pollInterval);
              setPaymentStatus("FAILED");
              setTimeout(() => {
                navigate("/my-plan", { replace: true });
              }, 8000);
            } else if (pollCount >= maxPolls) {
              // Max polls reached, assume success (webhook might still be processing)
              console.log("Max polls reached, assuming success");
              clearInterval(pollInterval);
              setPaymentStatus("COMPLETED");
              localStorage.removeItem("cart");
              setTimeout(() => {
                navigate("/my-plan", { replace: true });
              }, 5000);
            }
          } else if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setPaymentStatus("FAILED");
            setTimeout(() => {
              navigate("/my-plan", { replace: true });
            }, 8000);
          }
        } catch (error) {
          console.error("Error polling payment status:", error);
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setPaymentStatus("FAILED");
            setTimeout(() => {
              navigate("/my-plan", { replace: true });
            }, 8000);
          }
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }

    // PRIORITY 4: No transaction ID - this is a failure case
    console.log("No transaction ID found, treating as failure");
    setPaymentStatus("FAILED");
    setTimeout(() => {
      navigate("/my-plan", { replace: true });
    }, 8000);

    // eslint-disable-next-line
  }, [transactionId, userId, code, errorMessage, urlStatus]);

  // Additional safety net - if we're still in an unknown state after 15 seconds, verify from backend
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (
        paymentStatus === "LOADING" &&
        transactionId &&
        transactionId !== "null" &&
        transactionId !== "undefined" &&
        transactionId !== "completed"
      ) {
        console.log(
          "Safety timeout reached, verifying payment status from backend",
        );

        const verifyPaymentStatus = async () => {
          try {
            const API_BASE_URL =
              process.env.REACT_APP_API_URL || "https://dd-backend-3nm0.onrender.com";
            const response = await fetch(
              `${API_BASE_URL}/api/user/razorpay/check-payment/${transactionId}/${userId}`,
            );

            if (response.ok) {
              const result = await response.json();
              console.log(
                "Safety timeout - Payment verification result:",
                result,
              );

              if (result.success && result.success.status === "COMPLETED") {
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
            } else {
              setPaymentStatus("FAILED");
              setTimeout(() => {
                navigate("/my-plan", { replace: true });
              }, 8000);
            }
          } catch (error) {
            console.error(
              "Safety timeout - Error verifying payment status:",
              error,
            );
            setPaymentStatus("FAILED");
            setTimeout(() => {
              navigate("/my-plan", { replace: true });
            }, 8000);
          }
        };

        verifyPaymentStatus();
      } else if (paymentStatus === "LOADING") {
        console.log(
          "Safety timeout reached with no transaction ID, setting status to FAILED",
        );
        setPaymentStatus("FAILED");
      }
    }, 15000);

    return () => clearTimeout(safetyTimeout);
  }, [paymentStatus, transactionId, userId, navigate]);

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
      {/* Debug info - remove in production */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', top: 10, left: 10, background: 'white', padding: '10px', zIndex: 9999, fontSize: '12px', border: '1px solid #ccc' }}>
          <div><strong>Debug Info:</strong></div>
          <div>Status: {paymentStatus}</div>
          <div>TransactionId: {transactionId || 'null'}</div>
          <div>UserId: {userId || 'null'}</div>
          <div>Code: {code || 'null'}</div>
          <div>Error: {errorMessage || 'null'}</div>
          <div>Session: {paymentDetails?.session || 'null'}</div>
          <div>Date: {paymentDetails?.deliveryDate || 'null'}</div>
          <div>Amount: {paymentDetails?.amount || 'null'}</div>
          <div>OrderId: {paymentDetails?.orderId || 'null'}</div>
          <div>Hub: {paymentDetails?.hubName || 'null'}</div>
          <div>Payment Method: {paymentDetails?.paymentMethod || 'null'}</div>
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => {
                console.log("Manually setting status to FAILED");
                setPaymentStatus("FAILED");
              }}
              style={{ marginRight: '5px', padding: '5px', fontSize: '10px', background: '#ff4444', color: 'white', border: 'none' }}
            >
              Test Failure
            </button>
            <button 
              onClick={() => {
                console.log("Manually setting status to COMPLETED");
                setPaymentStatus("COMPLETED");
              }}
              style={{ padding: '5px', fontSize: '10px', background: '#44ff44', color: 'white', border: 'none' }}
            >
              Test Success
            </button>
          </div>
        </div>
      )} */}

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
            <p className="success-subtitle">
              Your{" "}
              <span className="highlight-text">
                {paymentDetails?.session || "meal"}
              </span>
              order for{" "}
              <span className="highlight-text">
                {formatDate(paymentDetails?.deliveryDate)}
              </span>{" "}
              is confirmed and scheduled!
            </p>
            {/* {paymentDetails?.orderId && (
              <p className="success-subtitle" style={{ fontSize: '16px', marginTop: '10px' }}>
                Order ID: <span className="highlight-text">{paymentDetails.orderId}</span>
              </p>
            )} */}
          </div>
        </div>
      ) : paymentStatus === "FAILED" ? (
        <div
          className="failure-content"
          style={{
            background: "white",
            padding: "40px 20px",
            borderRadius: "16px",
          }}
        >
          <FaTimesCircle
            className="payment-failed-icon"
            style={{ color: "#b22222", fontSize: "60px", marginBottom: "20px" }}
          />
          <h1
            className="payment-failed-title"
            style={{
              color: "#333",
              fontSize: "24px",
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            Payment Failed
          </h1>
          <p
            className="payment-failed-message"
            style={{
              color: "#666",
              fontSize: "16px",
              marginBottom: "30px",
              lineHeight: "1.4",
            }}
          >
            {errorMessage ||
              "We could not process your payment or it was cancelled. Please try again."}
          </p>
          <div
            className="failure-actions"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              margin: "30px 0",
              width: "100%",
              maxWidth: "300px",
            }}
          >
            <button
              onClick={handleFailureRedirect}
              className="failure-action-button primary"
              style={{
                backgroundColor: "#ff6b35",
                color: "white",
                padding: "15px 30px",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Retry Payment
            </button>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="failure-action-button secondary"
              style={{
                backgroundColor: "transparent",
                color: "#b22222",
                padding: "15px 30px",
                border: "2px solid #b22222",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Go to Home
            </button>
          </div>
          <p
            className="auto-redirect-text"
            style={{
              color: "#999",
              fontSize: "14px",
              marginTop: "20px",
              fontStyle: "italic",
            }}
          >
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
        // Fallback for any unknown state - treat as failure
        <div
          className="failure-content"
          style={{
            background: "white",
            padding: "40px 20px",
            borderRadius: "16px",
          }}
        >
          <FaTimesCircle
            className="payment-failed-icon"
            style={{ color: "#b22222", fontSize: "60px", marginBottom: "20px" }}
          />
          <h1
            className="payment-failed-title"
            style={{
              color: "#333",
              fontSize: "24px",
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            Payment Status Unknown
          </h1>
          <p
            className="payment-failed-message"
            style={{
              color: "#666",
              fontSize: "16px",
              marginBottom: "30px",
              lineHeight: "1.4",
            }}
          >
            We couldn't determine your payment status. Please check your order
            history or try again.
          </p>
          <div
            className="failure-actions"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              margin: "30px 0",
              width: "100%",
              maxWidth: "300px",
            }}
          >
            <button
              onClick={handleFailureRedirect}
              className="failure-action-button primary"
              style={{
                backgroundColor: "#ff6b35",
                color: "white",
                padding: "15px 30px",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Check My Orders
            </button>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="failure-action-button secondary"
              style={{
                backgroundColor: "transparent",
                color: "#b22222",
                padding: "15px 30px",
                border: "2px solid #b22222",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Go to Home
            </button>
          </div>
          <p
            className="auto-redirect-text"
            style={{
              color: "#999",
              fontSize: "14px",
              marginTop: "20px",
              fontStyle: "italic",
            }}
          >
            You will be redirected to My Plan in 8 seconds...
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
