// Razorpay utility functions
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (orderData) => {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7013';
    const response = await fetch(`${API_BASE_URL}/api/user/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7013';
    const response = await fetch(`${API_BASE_URL}/api/user/razorpay/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Poll payment status - checks if webhook has processed the payment
export const pollPaymentStatus = async (transactionId, maxAttempts = 20, interval = 2000) => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7013';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/razorpay/payment-status/${transactionId}`
      );

      if (response.ok) {
        const result = await response.json();

        // If payment is processed (either success or failure)
        if (result.paymentProcess) {
          return result;
        }
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      console.error('Error polling payment status:', error);
    }
  }

  // Timeout - payment status not confirmed
  throw new Error('Payment status check timeout');
};

export const handleRazorpayPayment = async (orderData, onSuccess, onFailure) => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay script');
    }

    // Create order
    const order = await createRazorpayOrder(orderData);

    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: 'Daily Dish',
      description: 'Food Order Payment',
      order_id: order.razorpayOrderId,
      handler: async function (response) {
        // Payment completed - Razorpay provides payment details
        console.log('Payment completed, webhook will process:', response);

        // Redirect to payment success page immediately
        // Webhook will handle all backend processing
        // Frontend will poll to check when webhook completes
        window.location.href = `/payment-success?transactionId=${order.id}&userId=${orderData.userId}&paymentMethod=razorpay`;
      },
      prefill: {
        name: orderData.username || '',
        contact: orderData.Mobile || '',
      },
      theme: {
        color: '#6b8e23',
      },
      modal: {
        ondismiss: function () {
          // User closed the payment modal without completing payment
          console.log('Payment modal dismissed by user');
          onFailure(new Error('Payment cancelled by user'));
        },
        escape: false,
        backdropclose: false
      }
    };

    const razorpay = new window.Razorpay(options);

    // Handle payment failure (when payment fails in Razorpay)
    razorpay.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);

      // Redirect to payment-success page with failure status
      window.location.href = `/payment-success?transactionId=${order.id || ''}&userId=${orderData.userId}&status=FAILED&paymentMethod=razorpay&error=${encodeURIComponent(response.error.description || 'Payment failed')}`;
    });

    razorpay.open();
  } catch (error) {
    console.error('Error initiating Razorpay payment:', error);
    onFailure(error);
  }
};