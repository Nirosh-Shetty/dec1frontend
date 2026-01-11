import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import Lottie from "lottie-react";
import "../Styles/payment.css";
import axios from "axios";
import Swal2 from "sweetalert2";
import success from "../../src/assets/Success2.json";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract query parameters
  const transactionId = searchParams.get("transactionId");
  const userId = searchParams.get("userID");
  const code = searchParams.get("code"); // PhonePe sends this (e.g., PAYMENT_ERROR)

  // State for payment status - Set to COMPLETED for UI testing
  const [paymentStatus, setPaymentStatus] = useState(""); // Changed to show success UI
  const [paymentDetails, setPaymentDetails] = useState({
    session: "Lunch",
    deliveryDate: "2024-01-15T00:00:00.000Z",
    username: "John Doe",
    amount: 299,
  }); // Added static data for UI testing

  const handleSuccessRedirect = () => {
    navigate("/orders"); // Changed to just /orders as per your request
  };

  const handleFailureRedirect = () => {
    navigate("/my-plan"); // Go back to plan to retry
  };

  const checkPaymentStatus = async () => {
    try {
  

      // 2. Verify with Backend
      // Using your existing endpoint structure
      const url = `https://dailydish.in/api/User/checkPayment/${transactionId}/${userId}`;

      const response = await axios.get(url);

      if (response.status === 200) {
        const paymentData = response.data.success || response.data.data; // Handle different response structures
        setPaymentDetails(paymentData);

        if (
          paymentData.status === "COMPLETED" ||
          paymentData.state === "COMPLETED"
        ) {
          setPaymentStatus("COMPLETED");

          // Optional: Clear cart if this was a cart order.
          // For MyPlan, we don't strictly need to, but it's safe to leave if you use this page for Cart too.
          localStorage.removeItem("cart");
          setTimeout(()=>{
                navigate("/my-plan");
          },5000)
        } else {
          throw new Error("Payment status is not COMPLETED");
        }
      } else {

        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setPaymentStatus("FAILED");
       setTimeout(()=>{
                navigate("/my-plan");
          },5000)

      // Allow user to see the error screen before auto-redirecting (optional)
      // or simply stay on the failed screen
    }
  };

  useEffect(() => {
    // Commented out for UI testing - always show success
    if (transactionId) {
      checkPaymentStatus();
    } else if (code === "PAYMENT_ERROR") {
      setPaymentStatus("FAILED");
    } else {
      // No params? Probably manual navigation, go home
      navigate("/");
    }

    // eslint-disable-next-line
  }, [transactionId, userId, code]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "15/01/2024";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
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
            <p className="success-subtitle">
              Your{" "}
              <span className="highlight-text">
                {paymentDetails?.session || "Lunch"}
              </span>{" "}
              for{" "}
              <span className="highlight-text">
                {formatDate(paymentDetails?.deliveryDate)}
              </span>{" "}
              is confirmed and scheduled!
            </p>
          </div>

          {/* Action Button */}
          {/* <button
            onClick={handleSuccessRedirect}
            className="success-action-button"
          >
            Go To My Plan
          </button> */}
        </div>
      ) : paymentStatus === "FAILED" ? (
        <div className="failure-content">
          <FaTimesCircle className="payment-failed-icon" />
          <h1 className="payment-failed-title">Payment Failed</h1>
          <p className="payment-failed-message">
            We could not process your payment or it was cancelled.
          </p>
          <button
            onClick={handleFailureRedirect}
            className="failure-action-button"
          >
            Retry in My Plan
          </button>
        </div>
      ) : (
        <div className="loading-content">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Verifying payment status...</p>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
