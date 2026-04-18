import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { MdRemoveShoppingCart } from "react-icons/md";
import "../Styles/Checkout.css";
import { FaCheck } from "react-icons/fa";
import { PiWarningCircleBold } from "react-icons/pi";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { WalletContext } from "../WalletContext";
import { BiSolidOffer } from "react-icons/bi";
import Swal2 from "sweetalert2";
import IsVeg from "../assets/isVeg=yes.svg";
import IsNonVeg from "../assets/isVeg=no.svg";
import "../Styles/Normal.css";
import { CircleCheck, ShieldAlert } from "lucide-react";
import cross from "../assets/cross.png";
import LocationModal from "./LocationModal";
import {
  getCart,
  getCartGroupedByDateSession,
  calculateCartTotals,
  getCartSummary,
  clearCart,
} from "../Helper/cartHelper";

const CheckoutMultiple = () => {
  const navigate = useNavigate();
  const { wallet, walletSeting } = useContext(WalletContext);
  const location = useLocation();
  const data = location?.state;
  const addresstype = localStorage.getItem("addresstype");

  const [address, setAddress] = useState(
    JSON.parse(localStorage.getItem("coporateaddress")) || {},
  );

  const [expandedSections, setExpandedSections] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [childName, setChildName] = useState("");
  const [childClass, setChildClass] = useState("");
  const [childSection, setChildSection] = useState("");
  const storedInfo = JSON.parse(localStorage.getItem("studentInformation")) || {};
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Get cart data from helper
  const cartItems = useMemo(() => getCart(), []);
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
      return { bySlot: {}, total: 0, itemCount: 0 };
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
      };
    }
  }, [cartItems]);

  const [cartdata, setCartData] = useState(cartItems);
  const lastCartRawRef = useRef(null);

  // Sync cartdata with localStorage
  useEffect(() => {
    const readCart = () => {
      try {
        const raw = localStorage.getItem("cart") || "[]";
        if (raw !== lastCartRawRef.current) {
          lastCartRawRef.current = raw;
          const parsed = JSON.parse(raw);
          setCartData(Array.isArray(parsed) ? parsed : []);
        }
      } catch (err) {
        console.error("Failed to parse cart from localStorage", err);
      }
    };

    readCart();
    const intervalId = setInterval(readCart, 1000);
    const onStorage = (e) => {
      if (e.key === "cart") readCart();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [apartmentdata, setapartmentdata] = useState([]);
  const [corporatedata, setcorporatedata] = useState([]);

  const getapartmentd = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getapartment");
      if (res.status === 200) {
        setapartmentdata(res.data.corporatedata);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCorporatedata = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getcorporate");
      if (res.status === 200) {
        setcorporatedata(res.data.corporatedata);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getapartmentd();
    getCorporatedata();
  }, []);

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

  // Fetch GST rate from backend
  useEffect(() => {
    const fetchGST = async () => {
      try {
        const res = await axios.get("http://localhost:7013/api/admin/gst/getall");
        if (res.status === 200 && res.data?.data?.[0]) {
          setGstRate(res.data.data[0].TotalGst || 5);
        }
      } catch (error) {
        console.error("Error fetching GST:", error);
      }
    };
    fetchGST();
  }, []);

  const subtotal = totals.total;

  // For TAX-INCLUSIVE products: break down the tax that's already in the price
  // Formula: If price = 105 with 5% tax included:
  //   amountBeforeTax = 105 / 1.05 = 100
  //   taxAmount = 105 - 100 = 5
  const amountBeforeTax = subtotal / (1 + gstRate / 100);
  const calculateTaxPrice = subtotal - amountBeforeTax;

  const increaseQuantity = (itemdata) => {
    const updatedCart = cartdata.map((item) => {
      if (item.cartId === itemdata?.cartId) {
        const currentQty = item.quantity || 1;
        if (currentQty < (item.remainingstock || 99)) {
          item.quantity = currentQty + 1;
          item.totalPrice = Number(item.preOrderPrice) * item.quantity;
        } else {
          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "error",
            title: "Stock Alert",
            text: "No more stock available!",
            showConfirmButton: false,
            timer: 3000,
          });
        }
      }
      return item;
    });
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartData(updatedCart);
    // Trigger storage event to update other components
    window.dispatchEvent(new Event("storage"));
  };

  const decreaseQuantity = (itemdata) => {
    let updatedCart = cartdata
      .map((item) => {
        if (item.cartId === itemdata?.cartId) {
          const currentQty = item.quantity || 1;
          if (currentQty > 1) {
            item.quantity = currentQty - 1;
            item.totalPrice = Number(item.preOrderPrice) * item.quantity;
            return item;
          } else {
            return null; // Mark for removal
          }
        }
        return item;
      })
      .filter(item => item !== null);

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartData(updatedCart);
    // Trigger storage event to update other components
    window.dispatchEvent(new Event("storage"));
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
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "info",
      title: "Coming Soon",
      text: "Coupon feature coming soon",
      showConfirmButton: false,
      timer: 3000,
    });
  };

  const handleApplyWallet = (e) => {
    if (wallet?.balance === 0) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        text: "Wallet balance is 0",
        showConfirmButton: false,
        timer: 3000,
      });
      e.target.checked = false;
      return;
    }
    if (e.target.checked) {
      let maxUsableAmount =  subtotal + Cutlery;
      let walletBalance = wallet?.balance || 0;
      let finalAmount = Math.min(walletBalance, maxUsableAmount);
      setDiscountWallet(finalAmount);
    } else {
      setDiscountWallet(0);
    }
  };

  const toggleBillingDetails = () => {
    setIsBillingOpen(!isBillingOpen);
  };

  const [isBillingOpen, setIsBillingOpen] = useState(true);

  const primaryAddress = JSON.parse(localStorage.getItem("primaryAddress")) || {};
  const defaultAddress = primaryAddress;

  const handleCheckout = async () => {
    if (!user) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: "Login Required",
        text: "Please login first",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    if (cartdata.length === 0) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: "Cart Alert",
        text: "Please add items to cart",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    if (!defaultAddress) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: "Address Alert",
        text: "Please add address",
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const payableAmount = Math.max(
        subtotal +
        Cutlery -
        discountWallet -
        coupon,
        0
      );
      const totalAmount = Math.round(payableAmount * 100) / 100;
      const enrichedCartItems = cartdata.map((item) => ({
        ...item,
        username: user.Fname,
        mobile: user.Mobile,
        userId: user._id,
        hubId: defaultAddress?.hubId || "",
        hubName: defaultAddress?.hubName || "",
        address: defaultAddress?.fullAddress || "",
        customerType: user?.status || "User",
      }));

      const handleSuccessfulCheckout = () => {
        localStorage.removeItem("cart");
        clearCart();

        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "success",
          title: "Order",
          text: "Order Successfully Done",
          showConfirmButton: false,
          timer: 3000,
        });

        setTimeout(() => {
          navigate("/my-plan", { replace: true });
        }, 600);
      };

      const confirmSkippedPaymentOrder = async (txnId) => {
        const verifyRes = await axios.post(
          "http://localhost:7013/api/user/razorpay/verify-payment-and-create-plan",
          {
            skipPayment: true,
            transactionId: txnId,
            userId: user._id,
            cartItems: enrichedCartItems,
            addressId: defaultAddress?._id,
          }
        );

        if (verifyRes.status === 200 && verifyRes.data?.success) {
          handleSuccessfulCheckout();
          return;
        }

        throw new Error(verifyRes.data?.error || "Order creation failed");
      };

      const res = await axios.post(
        "http://localhost:7013/api/user/razorpay/create-order-from-cart",
        {
          userId: user._id,
          cartItems: enrichedCartItems,
          totalAmount,
          discountWallet: Number(discountWallet || 0),
          addressId: defaultAddress._id,
          notes: {
            username: user.Fname,
            mobile: user.Mobile,
          },
        }
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
              try {
                const verifyRes = await axios.post(
                  "http://localhost:7013/api/user/razorpay/verify-payment-and-create-plan",
                  {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    transactionId: txnId,
                    userId: user._id,
                    cartItems: enrichedCartItems,
                    addressId: defaultAddress?._id,
                  }
                );

                if (verifyRes.status === 200 && verifyRes.data?.success) {
                  handleSuccessfulCheckout();
                } else {
                  throw new Error(verifyRes.data?.error || "Order creation failed");
                }
              } catch (error) {
                console.error("Payment verification error:", error);
                Swal2.fire({
                  toast: true,
                  position: "bottom",
                  icon: "error",
                  title: "Payment Failed",
                  text: error.response?.data?.error || error.message || "Payment verification failed",
                  showConfirmButton: false,
                  timer: 3000,
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
          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "error",
            title: "Payment Failed",
            text: "Failed to load payment gateway",
            showConfirmButton: false,
            timer: 3000,
          });
        };
        document.body.appendChild(script);
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: "Warning",
        text:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to process checkout",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newInfo = {
      studentName: childName.trim(),
      studentClass: childClass.trim(),
      studentSection: childSection.trim(),
    };
    try {
      const res = await axios.post(
        "http://localhost:7013/api/User/addStudentInformation",
        {
          customerId: user._id,
          ...newInfo,
        },
      );
      if (res.status === 200 && res.data.success) {
        localStorage.setItem("studentInformation", JSON.stringify(newInfo));
        setShowModal(false);
      } else {
        alert(res.data.message || "Failed to add student information.");
      }
    } catch (error) {
      console.error("Error adding student info:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const Handeledata = () => {
    if (!apartmentname) {
      return alert("Please Select Apartment");
    }
    if (!name) {
      return alert("Please Enter Name!");
    }
    if (!mobilenumber) {
      return alert("Please Enter Mobile Number!");
    }
    if (addresstype === "apartment" && !flat) {
      return alert("Please Enter flat number");
    }
    if (addresstype === "apartment" && !towerName) {
      return alert("Please Enter Tower Name");
    }
    const selectedLocationData = (
      addresstype === "apartment" ? apartmentdata : corporatedata
    )?.find((data) => data?.Apartmentname === apartmentname);
    const Savedaddress = {
      _id: (addresstype === "apartment" ? apartmentdata : corporatedata)?.find(
        (data) => data?.Apartmentname === apartmentname,
      )?._id,
      apartmentname: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.Apartmentname,
      doordelivarycharge: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)
        ?.doordelivaryprice,
      // sequentialDeliveryPrice: selectedLocationData?.sequentialDeliveryPrice,
      // sequentialDeliveryTime: selectedLocationData?.sequentialDeliveryTime,
      // expressDeliveryPrice: selectedLocationData?.expressDeliveryPrice,
      // expressDeliveryTime: selectedLocationData?.expressDeliveryTime,
      buildingaddress: buildingaddress,
      flatno: flat,
      name: name,
      towerName: towerName,
      mobilenumber: mobilenumber,
      prefixcode: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.prefixcode,
      lunchSlots: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.lunchSlots,
      dinnerSlots: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.dinnerSlots,
      deliverypoint: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.deliverypoint,
      locationType: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.locationType,
    };
    addresstype === "apartment"
      ? localStorage.setItem("address", JSON.stringify(Savedaddress))
      : sessionStorage.setItem("coporateaddress", JSON.stringify(Savedaddress));
    setAddress(Savedaddress);
    sessionStorage.setItem("Savedaddress", JSON.stringify(Savedaddress));
    handleClose();
  };

  // Render items grouped by session (Breakfast, Lunch, Dinner)
  const renderGroupedItems = () => {
    // Group cart items by session
    const groupedBySession = {};
    
    cartdata.forEach((item) => {
      const session = item.session || "Lunch";
      if (!groupedBySession[session]) {
        groupedBySession[session] = [];
      }
      groupedBySession[session].push(item);
    });

    return Object.entries(groupedBySession).map(([session, items]) => (
      <div key={session} className="session-group">
        <div className="session-header">
          <h4 className="session-title">{session}</h4>
        </div>
        <div className="cart-container">
          <div className="cart-section">
            <div className="cart-content">
              {items.map((item, i) => (
                <div className="cart-item" key={item.cartId || i}>
                  <div className="veg-indicator">
                    {item?.foodcategory === "Veg" ? (
                      <img src={IsVeg} alt="veg" className="indicator-icon" />
                    ) : (
                      <img src={IsNonVeg} alt="non-veg" className="indicator-icon" />
                    )}
                  </div>
                  <div className="item-content">
                    <div className="item-details">
                      <div className="item-name">
                        <div className="item-name-text">
                          {item.offerProduct && <BiSolidOffer color="green" />}
                          {item?.foodname || item?.itemName}
                        </div>
                      </div>
                      <div className="item-tags">
                        <div className="portion-tag">
                          <div className="portion-text">
                            <div className="portion-label">
                              {item?.quantity || 1} Portion{(item?.quantity || 1) > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="item-controls">
                      <div className="quantity-control">
                        <div
                          className="quantity-btn"
                          onClick={() => debouncedDecreaseQuantity(item)}
                        >
                          <div className="btn-text">-</div>
                        </div>
                        <div className="quantity-display">
                          <div className="quantity-text">
                            {item?.quantity || 1}
                          </div>
                        </div>
                        <div
                          className="quantity-btn"
                          onClick={() => debouncedIncreaseQuantity(item)}
                        >
                          <div className="btn-text">+</div>
                        </div>
                      </div>
                      <div className="price-container vertical">
                        {item.originalPrice && item.originalPrice > item.preOrderPrice && (
                          <div className="original-price">
                            <div className="price-line"></div>
                            <div className="original-price-content">
                              <div className="original-currency">
                                <div className="original-currency-text">₹</div>
                              </div>
                              <div className="original-amount">
                                <div className="original-amount-text">
                                  {item.originalPrice * (item.quantity || 1)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="current-price">
                          <div className="current-currency">
                            <div className="current-currency-text">₹</div>
                          </div>
                          <div className="current-amount">
                            <div className="current-amount-text">
                              {(item?.totalPrice || (item?.preOrderPrice || 0) * (item?.quantity || 1)) || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-footer">

            <div className="add-more-section">
              <div className="add-more-btn">
                <div className="add-more-content">
                  <div className="add-more-text-container">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        d="M9 3C12.3082 3 15 5.69175 15 9C15 12.3082 12.3082 15 9 15C5.69175 15 3 12.3082 3 9C3 5.69175 5.69175 3 9 3ZM9 1.5C4.85775 1.5 1.5 4.85775 1.5 9C1.5 13.1423 4.85775 16.5 9 16.5C13.1423 16.5 16.5 13.1423 16.5 9C16.5 4.85775 13.1423 1.5 9 1.5ZM12.75 8.25H9.75V5.25H8.25V8.25H5.25V9.75H8.25V12.75H9.75V9.75H12.75V8.25Z"
                        fill="black"
                      />
                    </svg>
                    <div className="add-more-text">
                      <Link to="/home" replace>
                        <div className="add-more-label">Add More</div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="total-section">
              <div className="total-label-container">
                <div className="total-label">Total</div>
              </div>
              <div className="total-price-section">
                <div className="total-price-content d-flex align-items-center justify-content-center gap-4">
                  <div className="total-current-price d-flex align-items-center">
                    <div className="current-currency">
                      <div className="current-currency-text">₹</div>
                    </div>
                    <div className="current-amount">
                      <div className="current-amount-text">
                        {items.reduce((sum, item) => sum + (item?.totalPrice || (item?.preOrderPrice || 0) * (item?.quantity || 1)), 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="mainbg">
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
          {/* Grouped Items by Session */}
          {cartdata.length > 0 ? (
            renderGroupedItems()
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
            <h4 className="delivery-details mt-3">Delivery Details</h4>
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
                      onClick={() =>
                        setdelivarychargetype(address?.doordelivarycharge) ||
                        setSelectedOption("Door")
                      }
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
                        {address?.doordelivarycharge > 0 ? (
                          <b>₹ {address?.doordelivarycharge}</b>
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
                      onClick={() =>
                        setdelivarychargetype(address?.Delivarycharge) ||
                        setSelectedOption("Gate/Tower")
                      }
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
                        {address?.Delivarycharge > 0 ? (
                          <b>₹ {address?.Delivarycharge}</b>
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
                    onClick={() =>
                      setdelivarychargetype(address?.Delivarycharge) ||
                      setSelectedOption("Gate/Tower")
                    }
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
                      {address?.Delivarycharge > 0 ? (
                        <b>₹ {address?.Delivarycharge}</b>
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
              <div className="promo-section">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                >
                  <path
                    d="M28.5123 18L29.8387 15.7076C29.9982 15.4318 30.0415 15.104 29.9593 14.7962C29.877 14.4885 29.6759 14.226 29.4002 14.0665L27.1054 12.7401V10.0969C27.1054 9.77825 26.9789 9.47265 26.7535 9.24734C26.5282 9.02203 26.2226 8.89545 25.904 8.89545H23.262L21.9368 6.60189C21.7776 6.32596 21.5152 6.12457 21.2075 6.04202C21.0551 6.00117 20.8961 5.99076 20.7396 6.01137C20.5832 6.03199 20.4323 6.08323 20.2956 6.16216L18.0009 7.48856L15.7061 6.16096C15.4301 6.00165 15.1022 5.95847 14.7944 6.04094C14.4867 6.1234 14.2242 6.32475 14.0649 6.60069L12.7385 8.89545H10.0965C9.77788 8.89545 9.47229 9.02203 9.24697 9.24734C9.02166 9.47265 8.89508 9.77825 8.89508 10.0969V12.7389L6.60031 14.0653C6.46362 14.1442 6.34384 14.2494 6.24781 14.3747C6.15178 14.5 6.08139 14.643 6.04067 14.7956C5.99994 14.9481 5.98967 15.1071 6.01045 15.2636C6.03124 15.4201 6.08266 15.571 6.16178 15.7076L7.48818 18L6.16178 20.2923C6.00317 20.5684 5.96014 20.896 6.04207 21.2036C6.12399 21.5113 6.32422 21.7741 6.59911 21.9347L8.89388 23.2611V25.9031C8.89388 26.2217 9.02046 26.5273 9.24577 26.7526C9.47109 26.9779 9.77668 27.1045 10.0953 27.1045H12.7385L14.0649 29.3993C14.1713 29.5811 14.3231 29.7321 14.5056 29.8374C14.688 29.9428 14.8947 29.9988 15.1054 30C15.3144 30 15.5223 29.9447 15.7073 29.8378L17.9997 28.5114L20.2944 29.8378C20.5702 29.9972 20.8981 30.0406 21.2058 29.9583C21.5136 29.8761 21.7761 29.675 21.9356 29.3993L23.2608 27.1045H25.9028C26.2214 27.1045 26.527 26.9779 26.7523 26.7526C26.9777 26.5273 27.1042 26.2217 27.1042 25.9031V23.2611L29.399 21.9347C29.5357 21.8557 29.6555 21.7506 29.7515 21.6253C29.8475 21.4999 29.9179 21.3569 29.9587 21.2044C29.9994 21.0519 30.0096 20.8928 29.9889 20.7363C29.9681 20.5798 29.9167 20.429 29.8375 20.2923L28.5123 18ZM14.996 11.9808C15.4742 11.9809 15.9326 12.171 16.2706 12.5092C16.6086 12.8474 16.7984 13.306 16.7982 13.7841C16.798 14.2622 16.608 14.7207 16.2698 15.0587C15.9316 15.3967 15.473 15.5864 14.9948 15.5863C14.5167 15.5861 14.0582 15.396 13.7203 15.0578C13.3823 14.7196 13.1925 14.261 13.1927 13.7829C13.1928 13.3048 13.3829 12.8463 13.7211 12.5083C14.0593 12.1704 14.5179 11.9806 14.996 11.9808ZM15.3565 23.5146L13.4342 22.0741L20.6428 12.4625L22.5652 13.9031L15.3565 23.5146ZM21.0033 23.9952C20.7665 23.9951 20.5321 23.9484 20.3134 23.8577C20.0947 23.7671 19.8961 23.6342 19.7287 23.4667C19.5614 23.2993 19.4286 23.1005 19.3381 22.8818C19.2476 22.663 19.201 22.4286 19.2011 22.1918C19.2012 21.9551 19.2479 21.7207 19.3386 21.502C19.4292 21.2833 19.5621 21.0846 19.7296 20.9172C19.897 20.7499 20.0958 20.6172 20.3145 20.5267C20.5333 20.4361 20.7677 20.3896 21.0045 20.3897C21.4826 20.3898 21.9411 20.5799 22.2791 20.9181C22.617 21.2563 22.8068 21.7149 22.8067 22.193C22.8065 22.6711 22.6164 23.1296 22.2782 23.4676C21.94 23.8056 21.4814 23.9953 21.0033 23.9952Z"
                    fill="#6B8E23"
                  />
                </svg>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Enter your promo code"
                    value={couponId}
                    onChange={(e) => setCouponId(e.target.value)}
                    className="promo-input"
                  />
                  <div className="search-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M13.0667 14L8.86667 9.8C8.53333 10.0667 8.15 10.2778 7.71667 10.4333C7.28333 10.5889 6.82222 10.6667 6.33333 10.6667C5.12222 10.6667 4.09733 10.2471 3.25867 9.408C2.42 8.56889 2.00044 7.544 2 6.33333C1.99956 5.12267 2.41911 4.09778 3.25867 3.25867C4.09822 2.41956 5.12311 2 6.33333 2C7.54356 2 8.56867 2.41956 9.40867 3.25867C10.2487 4.09778 10.668 5.12267 10.6667 6.33333C10.6667 6.82222 10.5889 7.28333 10.4333 7.71667C10.2778 8.15 10.0667 8.53333 9.8 8.86667L14 13.0667L13.0667 14ZM6.33333 9.33333C7.16667 9.33333 7.87511 9.04178 8.45867 8.45867C9.04222 7.87556 9.33378 7.16711 9.33333 6.33333C9.33289 5.49956 9.04133 4.79133 8.45867 4.20867C7.876 3.626 7.16756 3.33422 6.33333 3.33333C5.49911 3.33244 4.79089 3.62422 4.20867 4.20867C3.62644 4.79311 3.33467 5.50133 3.33333 6.33333C3.332 7.16533 3.62378 7.87378 4.20867 8.45867C4.79356 9.04356 5.50178 9.33511 6.33333 9.33333Z"
                        fill="#6B6B6B"
                      />
                    </svg>
                  </div>
                </div>
                <button className="apply-btn" onClick={() => applycoupon()}>
                  Apply
                </button>
              </div>
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
                            (                              Number(subtotal) +
                              Number(Cutlery) || 0),
                        ),
                      )}
                      {/* {Math.max(
                        0,
                        Math.min(
                          walletSeting?.minCartValueForWallet || 0,
                          (walletSeting?.minCartValueForWallet || 0) -
                            (Number(calculateTaxPrice) +
                              Number(subtotal) +
                              Number(Cutlery) || 0),
                        ),
                      )} */}
                      more to use
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="belling-head">
            <span className="billing">Billing Details</span>
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
                  className="billdetail d-flex justify-content-between align-items-start w-100 flex-wrap"
                  style={{ gap: "20px" }}
                >
                  <div className="label-column">
                    <div className="toatal-va">Total Order Value</div>
                    <div className="toatal-va">Tax Breakdown ({gstRate}%)</div>
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
                    <div className="tootal-va">₹ {subtotal?.toFixed(2) - calculateTaxPrice.toFixed(2) }</div>
                    <div className="toatal-va" style={{ fontSize: "12px", color: "#999" }}>
                      ₹ {calculateTaxPrice.toFixed(2)}
                    </div>
                    {Cutlery !== 0 && (
                      <div className="toatal-va">₹ {Cutlery}</div>
                    )}
                    {coupon !== 0 && (
                      <div className="toatal-va" style={{ color: "green" }}>
                        - ₹ {coupon}
                      </div>
                    )}
                    {selectedOption && (
                      <div className="toatal-va">₹ {delivarychargetype}</div>
                    )}
                    {discountWallet !== 0 && (
                      <div className="toatal-va" style={{ color: "green" }}>
                        - ₹ {discountWallet}
                      </div>
                    )}
                    <div className="toatal-va">
                      <b>
                        ₹{" "}
                        {(
                          // calculateTaxPrice +
                          subtotal +
                          Cutlery -
                          discountWallet -
                          coupon
                        ).toFixed(2)}
                      </b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                marginTop: "8px",
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
                  <p className="price-pay">
                    ₹
                    {(
                      // calculateTaxPrice +
                      subtotal +
                      Cutlery -
                      discountWallet -
                      coupon
                    ).toFixed(2)}
                  </p>
                </div>
              )}
            </Button>
          </div>
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
