import React, { useState } from 'react';
import { handleRazorpayPayment } from '../Helper/razorpay';
import Swal2 from 'sweetalert2';

const RazorpayCheckout = ({ 
  orderData, 
  onPaymentSuccess, 
  onPaymentFailure, 
  children,
  disabled = false 
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (disabled) return;
    
    setLoading(true);
    
    try {
      // Get order data (could be async function)
      let orderInfo;
      if (typeof orderData === 'function') {
        orderInfo = await orderData();
      } else {
        orderInfo = orderData;
      }

      if (!orderInfo) {
        setLoading(false);
        return;
      }
      
      await handleRazorpayPayment(
        orderInfo,
        (response) => {
          setLoading(false);
          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "success",
            title: "Payment Successful",
            text: "Your payment has been processed successfully",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
              popup: "me-small-toast",
              title: "me-small-toast-title",
            },
          });
          onPaymentSuccess(response);
        },
        (error) => {
          setLoading(false);
          console.error('Payment failed:', error);
          
          // Show toast notification
          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "error",
            title: "Payment Failed",
            text: error.message || "Payment could not be processed",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
              popup: "me-small-toast",
              title: "me-small-toast-title",
            },
          });
          
          // Call the failure callback which should handle navigation
          onPaymentFailure(error);
        }
      );
    } catch (error) {
      setLoading(false);
      console.error('Payment initialization failed:', error);
      
      // Show toast notification
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: "Payment Error",
        text: "Failed to initialize payment",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      
      // Call the failure callback which should handle navigation
      onPaymentFailure(error);
    }
  };

  return (
    <div onClick={handlePayment} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {children}
    </div>
  );
};

export default RazorpayCheckout;