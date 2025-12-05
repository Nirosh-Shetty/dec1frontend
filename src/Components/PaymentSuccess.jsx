import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; 
import "../Styles/payment.css"; 
import axios from "axios";
import Swal2 from "sweetalert2"; // Using Swal2 for consistency with your MyPlan code

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract query parameters
  const transactionId = searchParams.get("transactionId");
  const userId = searchParams.get("userID");
  const code = searchParams.get("code"); // PhonePe sends this (e.g., PAYMENT_ERROR)

  // State for payment status
  const [paymentStatus, setPaymentStatus] = useState("LOADING"); // LOADING, COMPLETED, FAILED
  const [paymentDetails, setPaymentDetails] = useState(null); 

  const handleSuccessRedirect = () => {
    navigate("/orders"); // Changed to just /orders as per your request
  };

  const handleFailureRedirect = () => {
    navigate("/my-plan"); // Go back to plan to retry
  };

  const checkPaymentStatus = async () => {
    try {
      // 1. Check for immediate failure code from URL (User clicked Back/Cancel)
      if (code === "PAYMENT_ERROR" || code === "PAYMENT_DECLINED") {
        throw new Error("Payment was declined or cancelled by user.");
      }

      // 2. Verify with Backend
      // Using your existing endpoint structure
      const url = `https://dailydish-backend.onrender.com/api/User/checkPayment/${transactionId}/${userId}`;
      
      const response = await axios.get(url);

      if (response.status === 200) {
        const paymentData = response.data.success || response.data.data; // Handle different response structures
        setPaymentDetails(paymentData);

        if (paymentData.status === "COMPLETED" || paymentData.state === "COMPLETED") {
          setPaymentStatus("COMPLETED");
          
          // Optional: Clear cart if this was a cart order. 
          // For MyPlan, we don't strictly need to, but it's safe to leave if you use this page for Cart too.
          localStorage.removeItem("cart");

          Swal2.fire({
            icon: 'success',
            title: 'Payment Successful!',
            text: 'Your order has been confirmed.',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
             navigate("/orders");
          });

        } else {
          throw new Error("Payment status is not COMPLETED");
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setPaymentStatus("FAILED");
      
      // Allow user to see the error screen before auto-redirecting (optional)
      // or simply stay on the failed screen
    }
  };

  useEffect(() => {
    alert('hi')
    if (transactionId) {
      checkPaymentStatus();
    } else if (code === "PAYMENT_ERROR") {
        setPaymentStatus("FAILED");
    } else {
      // No params? Probably manual navigation, go home
      navigate("/home");
    }
    // eslint-disable-next-line
  }, [transactionId, userId, code]);

  return (
    <div className="payment-success-container" style={{ textAlign: 'center', padding: '50px' }}>
      {paymentStatus === "COMPLETED" ? (
        <>
          <FaCheckCircle className="payment-success-icon" style={{ color: '#6b8e23', fontSize: '50px', marginBottom: '20px' }} />
          <h1 className="payment-success-title">Payment Successful!</h1>
          <p className="payment-success-message">
            Thank you for your payment{paymentDetails?.username ? `, ${paymentDetails.username}` : ""}.
          </p>
          {paymentDetails?.amount && (
             <p className="payment-success-message">
               Amount: <strong>₹{paymentDetails.amount}</strong>
             </p>
          )}
          <button onClick={handleSuccessRedirect} className="payment-success-button" style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#6b8e23', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Go To My Orders
          </button>
        </>
      ) : paymentStatus === "FAILED" ? (
        <>
          <FaTimesCircle className="payment-failed-icon" style={{ color: '#dc3545', fontSize: '50px', marginBottom: '20px' }} />
          <h1 className="payment-failed-title">Payment Failed</h1>
          <p className="payment-failed-message">
            We could not process your payment or it was cancelled.
          </p>
          <button
            onClick={handleFailureRedirect}
            className="payment-success-button"
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Retry in My Plan
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
             {/* You can use your Spinner here if you have one imported */}
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