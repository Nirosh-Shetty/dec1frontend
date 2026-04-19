import Swal2 from "sweetalert2";
import { useState, useMemo, useEffect, useContext } from "react";
import { WalletContext } from "../WalletContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal } from "react-bootstrap";
import IsVeg from "./../assets/isVeg=yes.svg";
import IsNonVeg from "./../assets/isVeg=no.svg";
// import name from "./../assets/successGroup.png";
// import myplanlocation from "./../assets/myplanlocation.png";
// import myplancalender from "./../assets/myplancalender.png";
// import IsNonVeg from "./../assets/isVeg=no.svg";
// import IsVeg from "./../assets/isVeg=yes.svg";
// import myplancancelicon from "./../assets/myplancancelicon.png";
// import myplandrop from "./../assets/myplandrop.png";
// import myplanseparator from "./../assets/myplanseparator.png";
// import myplanskip from "./../assets/myplanskip.png";
import myplancancel3 from "./../assets/myplancancelicon.png";
// import myplancancel2 from "./../assets/mycancel.png";
// import myplanblackedit from "./../assets/myplanblackedit.png";
import BottomNav from "./BottomNav";
import "../Styles/MyPlan.css";
// import "../Styles/Checkout.css"
import { toast } from "react-toastify";
import pending from "./../assets/pending.png";
import success from "./../assets/success-green.png";
// import discount from "./../assets/discount.png";
import myplancancel from "./../assets/myplancancel.png";
import "./../Styles/Normal.css";
import orderhistoryicon from "./../assets/orderhistory.png";
// import LocationModal2 from "./LocationModal2";
// import AddMoreToSlotModal from "./AddMoreToSlotModal";

import "../Styles/AddMoreToSlotModal.css";
// import checkCircle from "../assets/check_circle.png";
// import { use } from "react";

const MyPlan = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [showQuickAnswers, setShowQuickAnswers] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  // const [isProcessingAllPlans, setIsProcessingAllPlans] = useState(false);
  const { wallet, fetchWalletData } = useContext(WalletContext);
  const walletBalance = wallet?.balance || 0;
  const [deliveryCharge, setDeliveryCharge] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);

  // parse stored user once so we can access properties safely
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = null;
  }
  const address = JSON.parse(
    localStorage.getItem("primaryAddress") ??
      localStorage.getItem("currentLocation"),
  );

  const userId = user ? user._id : null;

  const fetchPlans = async () => {
    if (!userId) {
      setIsLoadingPlans(false);
      return;
    }
    try {
      setIsLoadingPlans(true);
      const res = await axios.get(
        `https://dd-backend-3nm0.onrender.com/api/user/plan/get-plan/${userId}`,
      );
      if (res.data.success) {
        const newPlans = res.data.data || [];
        setPlans(newPlans);

        if (selectedPlan && isModalOpen) {
          const updatedSelectedPlan = newPlans.find(
            (p) => p._id === selectedPlan._id,
          );
          if (updatedSelectedPlan) {
            setSelectedPlan(updatedSelectedPlan);
          } else {
            setIsModalOpen(false);
            setSelectedPlan(null);
          }
        }
      }
    } catch (err) {
      console.error("fetch plans error", err);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const getDeliveryRates = async () => {
    try {
      const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/deliveryrate/all");
      console.log("Delivery rates:", res.data.data);
      setDeliveryCharge(res.data.data);
      setFilteredRates(res.data.data);
    } catch (error) {
      console.error("Error fetching delivery rates:", error);
    }
  };

  // Helper function to find delivery rate based on hub, acquisition channel, and status
  const findDeliveryRate = (hubId, acquisitionChannel, status) => {
    if (!deliveryCharge || deliveryCharge.length === 0) {
      console.log("No delivery rates available");
      return 15; // Default fallback rate
    }

    // First try to find exact match with all criteria
    let matchedRate = deliveryCharge.find(
      (rate) =>
        rate.hubId === hubId &&
        rate.acquisition_channel === acquisitionChannel &&
        rate.status === status,
    );

    // If no exact match, try matching hubId and acquisition_channel only
    if (!matchedRate) {
      matchedRate = deliveryCharge.find(
        (rate) =>
          rate.hubId === hubId &&
          rate.acquisition_channel === acquisitionChannel,
      );
    }

    // If still no match, try matching hubId only
    if (!matchedRate) {
      matchedRate = deliveryCharge.find((rate) => rate.hubId === hubId);
    }

    return matchedRate?.deliveryRate || 15; // Return rate or default 20
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString(
      "en-US",
      { month: "short" },
    )}`;
  };

  const formatDay = (isoString) => {
    return new Date(isoString)
      .toLocaleString("en-US", { weekday: "short" })
      .toUpperCase();
  };

  // const ViewPlanModal = ({
  //   isOpen,
  //   onClose,
  //   plan,
  //   userId,
  //   onPlanUpdated,
  //   handlePayPlan,
  //   handleTrackOrder,
  //   address,
  // }) => {
  //   const user = JSON.parse(localStorage.getItem("user") || "null");
  //   const navigate = useNavigate();
  //   const [localPlan, setLocalPlan] = useState(plan);
  //   // console.log("Viewing plan:", localPlan);

  //   const [deliveryNotes, setDeliveryNotes] = useState(
  //     plan.deliveryNotes || "",
  //   );
  //   const [isProcessing, setIsProcessing] = useState(false);
  //   useEffect(() => {
  //     setLocalPlan(plan);
  //   }, [plan]);

  //   function getCutoffTime(deliveryDate, session) {
  //     // New cutoff logic: 11:59 PM on the previous day
  //     const cutoff = new Date(deliveryDate);
  //     cutoff.setDate(cutoff.getDate() - 1); // Go to previous day
  //     cutoff.setHours(23, 59, 59, 0); // Set to 11:59:59 PM
  //     return cutoff;
  //   }

  //   const now = new Date();
  //   const cutoffTime = getCutoffTime(localPlan.deliveryDate, localPlan.session);
  //   const isEditable =
  //     localPlan.status === "Pending Payment" && now < cutoffTime;

  //   async function changeQuantity(foodItemId, delta) {
  //     if (!isEditable) return;

  //     const product = localPlan.products.find(
  //       (p) => p.foodItemId === foodItemId || p.foodItemId?._id === foodItemId,
  //     );
  //     if (!product) return;

  //     const newQty = (product.quantity || 0) + delta;
  //     if (newQty < 0) return;

  //     try {
  //       const res = await axios.post(
  //         "https://dd-backend-3nm0.onrender.com/api/user/plan/update-product",
  //         {
  //           planId: localPlan._id,
  //           foodItemId:
  //             typeof product.foodItemId === "string"
  //               ? product.foodItemId
  //               : product.foodItemId?._id,
  //           quantity: newQty,
  //         },
  //       );

  //       if (res.data.success) {
  //         if (
  //           !res.data.data ||
  //           res.data.message === "Plan removed as it is empty"
  //         ) {
  //           Swal2.fire({
  //             toast: true,
  //             position: "bottom",
  //             showConfirmButton: false,
  //             timer: 2500,
  //             timerProgressBar: true,
  //             html: `
  //               <div class="myplans-toast-content">
  //                 <img src="${checkCircle}" alt="Success" class="myplans-toast-check" />
  //                 <div class="myplans-toast-text">
  //                   <div class="myplans-toast-title">Plan Removed.</div>
  //                   <div class="myplans-toast-subtitle">Plan removed as it is empty</div>
  //                 </div>
  //               </div>
  //             `,
  //             customClass: {
  //               popup: "myplans-custom-toast",
  //               htmlContainer: "myplans-toast-html",
  //             },
  //             didOpen: () => {
  //               const toast = document.querySelector(".myplans-custom-toast");
  //               if (toast) {
  //                 toast.style.bottom = "90px";
  //                 toast.style.left = "50%";
  //                 toast.style.transform = "translateX(-50%)";
  //                 toast.style.position = "fixed";
  //               }
  //             },
  //           });
  //           onClose();
  //           if (onPlanUpdated) onPlanUpdated();
  //           return;
  //         }
  //         const updatedPlan = res.data.data;
  //         setLocalPlan(updatedPlan);
  //         onPlanUpdated && onPlanUpdated();
  //       } else {
  //         alert(res.data.error || "Failed to update quantity");
  //       }
  //     } catch (e) {
  //       alert(e.response?.data?.error || "Failed to update quantity");
  //     }
  //   }

  //   const handleAddMore = async () => {
  //     await handleSetPrimary(localPlan.addressId);
  //     navigate("/", {
  //       state: {
  //         targetDate: localPlan.deliveryDate,
  //         targetSession: localPlan.session,
  //       },
  //     });
  //   };

  //   const handleSetPrimary = async (addressId) => {
  //     try {
  //       if (!userId) {
  //         throw new Error("Customer ID not found. Please login again.");
  //       }
  //       const response = await axios.patch(
  //         `https://dd-backend-3nm0.onrender.com/api/User/customers/${userId}/addresses/${addressId}/primary`,
  //       );
  //       alert("Setting primary address...");

  //       try {
  //         const cacheKey = `addresses_${userId}`;
  //         const cacheTsKey = `addresses_timestamp_${userId}`;

  //         const cachedStr = localStorage.getItem(cacheKey);
  //         if (cachedStr) {
  //           const cached = JSON.parse(cachedStr);
  //           cached.primaryAddress = addressId;

  //           const fullAddr = Array.isArray(cached.addresses)
  //             ? cached.addresses.find((a) => a._id === addressId) || null
  //             : null;

  //           localStorage.setItem(cacheKey, JSON.stringify(cached));
  //           localStorage.setItem(cacheTsKey, Date.now().toString());

  //           if (fullAddr) {
  //             localStorage.setItem("primaryAddress", JSON.stringify(fullAddr));
  //           } else if (response.data?.primaryAddress) {
  //             localStorage.setItem(
  //               "primaryAddress",
  //               JSON.stringify(response.data.primaryAddress),
  //             );
  //           } else {
  //             localStorage.setItem("primaryAddress", JSON.stringify(addressId));
  //           }
  //         } else {
  //           localStorage.setItem(
  //             `addresses_timestamp_${userId}`,
  //             Date.now().toString(),
  //           );
  //           if (response.data?.primaryAddress) {
  //             localStorage.setItem(
  //               "primaryAddress",
  //               JSON.stringify(response.data.primaryAddress),
  //             );
  //           } else {
  //             localStorage.setItem("primaryAddress", JSON.stringify(addressId));
  //           }
  //         }
  //       } catch (cacheErr) {
  //         console.warn("Failed to update address cache:", cacheErr);
  //       }
  //     } catch (error) {
  //       console.error("Error setting primary address:", error);
  //       console.log(error.message || "Failed to set primary address", "danger");
  //     }
  //   };

  //   const [isBillingOpen, setIsBillingOpen] = useState(false);
  //   const [loading, setLoading] = useState(false);
  //   const [showLocationModal, setShowLocationModal] = useState(false);
  //   const [showAddMoreModal, setShowAddMoreModal] = useState(false);
  //   const { wallet } = useContext(WalletContext);
  //   const walletBalance = wallet?.balance || 0;
  //   const [useWallet, setUseWallet] = useState(false);

  //   // Find delivery rate for this plan
  //   const acquisitionChannel = user?.acquisition_channel || "organic";
  //   const userStatus = user?.status || "Normal";
  //   const hubId = localPlan.hubId || localPlan.hub?._id;
  //   const deliveryRate = findDeliveryRate(
  //     hubId,
  //     acquisitionChannel,
  //     userStatus,
  //   );

  //   const maxWalletDeduction = Math.max(
  //     0,
  //     Math.min(
  //       walletBalance,
  //       localPlan.payableAmount + deliveryRate + localPlan.taxAmount,
  //     ),
  //   );
  //   const [walletDeduction, setWalletDeduction] = useState(0);

  //   useEffect(() => {
  //     if (useWallet) {
  //       setWalletDeduction(maxWalletDeduction);
  //     } else {
  //       setWalletDeduction(0);
  //     }
  //   }, [useWallet, walletBalance, localPlan.slotTotalAmount]);

  //   const payableAmount = Math.max(
  //     0,
  //     (localPlan.payableAmount || 0) -
  //       walletDeduction +
  //       deliveryRate +
  //       localPlan.taxAmount,
  //   );

  //   if (!isOpen || !localPlan) return null;

  //   const toggleBillingDetails = () => setIsBillingOpen((p) => !p);

  //   const isUnpaidEditable =
  //     localPlan.status === "Pending Payment" && now < cutoffTime;
  //   const isPaidEditable = localPlan.status === "Confirmed" && now < cutoffTime;
  //   const isPaidLocked = localPlan.status === "Confirmed" && now >= cutoffTime;
  //   const isConfirmed = localPlan.status === "Confirmed";

  //   const getTimeRemainingToCutoff = () => {
  //     const diff = cutoffTime - now;
  //     if (diff <= 0) return { days: 0, hours: 0, mins: 0, isExpired: true };
  //     const totalMinutes = Math.floor(diff / (1000 * 60));
  //     const days = Math.floor(totalMinutes / (60 * 24));
  //     const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  //     const mins = totalMinutes % 60;
  //     return { days, hours, mins, isExpired: false };
  //   };
  //   const { days, hours, mins, isExpired } = getTimeRemainingToCutoff();

  //   const handleAddressChange = async () => {
  //     setShowLocationModal(true);
  //   };

  //   const handleAddressSelected = async (address) => {
  //     try {
  //       setLoading(true);
  //       const response = await axios.post(
  //         "https://dd-backend-3nm0.onrender.com/api/user/plan/update-address",
  //         {
  //           planId: localPlan._id,
  //           userId,
  //           addressId: address._id,
  //         },
  //       );

  //       if (response.data.success) {
  //         const updatedPlan = response.data.data;
  //         setLocalPlan(updatedPlan);
  //         setShowLocationModal(false);
  //         toast.success("Address updated successfully!");
  //         onPlanUpdated && onPlanUpdated();
  //       }
  //     } catch (err) {
  //       console.error("Error updating address:", err);
  //       toast.error(err?.response?.data?.error || "Failed to update address");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const handleSkipOrCancel = async () => {
  //     try {
  //       setLoading(true);
  //       await axios.post("https://dd-backend-3nm0.onrender.com/api/user/plan/skip-cancel", {
  //         planId: plan._id,
  //         userId,
  //       });

  //       Swal2.fire({
  //         toast: true,
  //         position: "bottom",
  //         showConfirmButton: false,
  //         timer: 2500,
  //         timerProgressBar: true,
  //         html: `
  //           <div class="myplans-toast-content">
  //             <img src="${checkCircle}" alt="Success" class="myplans-toast-check" />
  //             <div class="myplans-toast-text">
  //               <div class="myplans-toast-title">Plan skipped.</div>
  //               <div class="myplans-toast-subtitle">Removing from your upcoming list</div>
  //             </div>
  //           </div>
  //         `,
  //         customClass: {
  //           popup: "myplans-custom-toast",
  //           htmlContainer: "myplans-toast-html",
  //         },
  //         didOpen: () => {
  //           const toast = document.querySelector(".myplans-custom-toast");
  //           if (toast) {
  //             toast.style.bottom = "90px";
  //             toast.style.left = "50%";
  //             toast.style.transform = "translateX(-50%)";
  //             toast.style.position = "fixed";
  //           }
  //         },
  //       });

  //       onPlanUpdated && onPlanUpdated();
  //       onClose();
  //     } catch (err) {
  //       alert(err?.response?.data?.error || "Something went wrong");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   return (
  //     <div
  //       className="plan-modal-overlay"
  //       onClick={onClose}
  //       role="dialog"
  //       aria-modal="true"
  //       aria-labelledby="plan-modal-title"
  //     >
  //       <div className="close-button-container">
  //         <button
  //           onClick={onClose}
  //           className="close-modal-btn"
  //           tabIndex={0}
  //           aria-label="Close modal"
  //           onKeyDown={(e) => {
  //             if (e.key === "Enter" || e.key === " ") {
  //               e.preventDefault();
  //               onClose();
  //             }
  //           }}
  //         >
  //           <img src={myplancancel2} alt="" style={{ width: 39, height: 39 }} />
  //         </button>
  //       </div>

  //       <div
  //         className="plan-modal-content"
  //         onClick={(e) => {
  //           e.stopPropagation();
  //         }}
  //       >
  //         <div className="modal-header-section">
  //           <div className="plan-header">
  //             <div className="plan-session-info">
  //               <h3 className="session-title" id="plan-modal-title">
  //                 {localPlan.session}
  //               </h3>
  //               <div className="delivery-time-text">
  //                 Arrives fresh between{" "}
  //                 {localPlan?.addressType === "School"
  //                   ? "12:00 to 12:15 PM"
  //                   : localPlan?.session === "Lunch"
  //                     ? "12:00 to 01:00 PM"
  //                     : "07:30 to 08:30 PM"}
  //               </div>
  //             </div>

  //             <div className="upcoming-date-badge2">
  //               <div className="date-column2">
  //                 <div className="date-day2">
  //                   {new Date(plan.deliveryDate).toLocaleDateString("en-US", {
  //                     day: "numeric",
  //                   })}
  //                 </div>
  //                 <div className="date-month2">
  //                   {new Date(plan.deliveryDate).toLocaleDateString("en-US", {
  //                     month: "short",
  //                   })}
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         <div className="checkoutcontainer">
  //           <div className="cart-container">
  //             <div className="plans-item-section">
  //               <div className="plans-item-content">
  //                 <div className="plan-item-header">
  //                   <div className="header-title">
  //                     <div className="title-text">
  //                       <div className="title-label">From Kitchen</div>
  //                     </div>
  //                   </div>
  //                   <div className="header-right">
  //                     <div className="qty-header">
  //                       <div className="qty-text">
  //                         <div className="title-label">Qty</div>
  //                       </div>
  //                     </div>
  //                     <div className="price-text">
  //                       <div className="title-label">Price</div>
  //                     </div>
  //                   </div>
  //                 </div>

  //                 {(localPlan.products || []).map((product, index) => (
  //                   <div className="plan-item" key={product._id || index}>
  //                     {/* {console.log(product, "prooooooooooooooooooooooooo")} */}
  //                     <div className="plan-item-details">
  //                       <div className="plan-left-left">
  //                         {index + 1}.
  //                         <img
  //                           src={
  //                             product?.foodCategory === "Veg" ? IsVeg : IsNonVeg
  //                           }
  //                           alt="type"
  //                           className="indicator-icon"
  //                         />
  //                       </div>
  //                       <div className="plan-left-right">
  //                         <div className="plan-item-name">
  //                           {product.foodName}
  //                         </div>
  //                         <div className="portion-tag">
  //                           <div className="plan-portion-label">
  //                             {product.quantity} Portion
  //                             {product.quantity > 1 ? "s" : ""}
  //                           </div>
  //                         </div>
  //                       </div>
  //                     </div>
  //                     <div className="plan-item-controls">
  //                       <div className="quantity-control">
  //                         <div
  //                           className={`${
  //                             !isEditable && "disabled"
  //                           } quantity-control`}
  //                         >
  //                           <button
  //                             className="quantity-btn"
  //                             disabled={!isEditable}
  //                             tabIndex={isEditable ? 0 : -1}
  //                             aria-label={`Decrease quantity of ${product.foodName}`}
  //                             onClick={() =>
  //                               changeQuantity(
  //                                 product.foodItemId?.toString?.() ||
  //                                   product.foodItemId,
  //                                 -1,
  //                               )
  //                             }
  //                             onKeyDown={(e) => {
  //                               if (e.key === "Enter" || e.key === " ") {
  //                                 e.preventDefault();
  //                                 changeQuantity(
  //                                   product.foodItemId?.toString?.() ||
  //                                     product.foodItemId,
  //                                   -1,
  //                                 );
  //                               }
  //                             }}
  //                           >
  //                             <div className="btn-text">-</div>
  //                           </button>
  //                           <div className="quantity-display">
  //                             <div className="quantity-text">
  //                               {product.quantity}
  //                             </div>
  //                           </div>
  //                           <button
  //                             className="quantity-btn"
  //                             disabled={!isEditable}
  //                             tabIndex={isEditable ? 0 : -1}
  //                             aria-label={`Increase quantity of ${product.foodName}`}
  //                             onClick={() =>
  //                               changeQuantity(
  //                                 product.foodItemId?.toString?.() ||
  //                                   product.foodItemId,
  //                                 1,
  //                               )
  //                             }
  //                             onKeyDown={(e) => {
  //                               if (e.key === "Enter" || e.key === " ") {
  //                                 e.preventDefault();
  //                                 changeQuantity(
  //                                   product.foodItemId?.toString?.() ||
  //                                     product.foodItemId,
  //                                   1,
  //                                 );
  //                               }
  //                             }}
  //                           >
  //                             <div className="btn-text">+</div>
  //                           </button>
  //                         </div>
  //                       </div>
  //                       <div className="price-container vertical">
  //                         {product.hubTotalPrice?.toFixed(0) <
  //                           product.totalPrice?.toFixed(0) && (
  //                           <div className="plan-actual-price">
  //                             <div className="plan-current-currency">
  //                               <div className="current-currency-text">₹</div>
  //                             </div>
  //                             <div className="plan-hub-amount">
  //                               <div className="hub-amount-text">
  //                                 {product.hubTotalPrice?.toFixed(0)}
  //                               </div>
  //                             </div>
  //                           </div>
  //                         )}

  //                         <div className="plan-current-price">
  //                           <div className="plan-current-currency">
  //                             <div className="current-currency-text"></div>
  //                           </div>
  //                           <div className="plan-current-amount-text">
  //                             <div>₹{product.totalPrice?.toFixed(0)}</div>
  //                           </div>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 ))}

  //                 <div className="plan-cart-footer">
  //                   {isEditable && (
  //                     <div className="plan-add-more-section">
  //                       <button
  //                         className="plan-add-more-btn"
  //                         tabIndex={0}
  //                         aria-label="Add more items to plan"
  //                         onClick={() => setShowAddMoreModal(true)}
  //                         onKeyDown={(e) => {
  //                           if (e.key === "Enter" || e.key === " ") {
  //                             e.preventDefault();
  //                             setShowAddMoreModal(true);
  //                           }
  //                         }}
  //                       >
  //                         <svg
  //                           xmlns="http://www.w3.org/2000/svg"
  //                           width="26"
  //                           height="26"
  //                           viewBox="0 0 18 18"
  //                           fill="none"
  //                           aria-hidden="true"
  //                         >
  //                           <path
  //                             d="M9 3C12.3082 3 15 5.69175 15 9C15 12.3082 12.3082 15 9 15C5.69175 15 3 12.3082 3 9C3 5.69175 5.69175 3 9 3ZM9 1.5C4.85775 1.5 1.5 4.85775 1.5 9C1.5 13.1423 4.85775 16.5 9 16.5C13.1423 16.5 16.5 13.1423 16.5 9C16.5 4.85775 13.1423 1.5 9 1.5ZM12.75 8.25H9.75V5.25H8.25V8.25H5.25V9.75H8.25V12.75H9.75V9.75H12.75V8.25Z"
  //                             fill="#6b8e23"
  //                           />
  //                         </svg>
  //                         Add More
  //                       </button>
  //                     </div>
  //                   )}
  //                 </div>
  //               </div>
  //             </div>

  //             <div
  //               style={{
  //                 fontWeight: 500,
  //                 color: "#212121",
  //                 paddingBottom: 8,
  //                 paddingLeft: 8,
  //                 fontSize: 20,
  //                 letterSpacing: "-1px",
  //               }}
  //             >
  //               Delivery Details
  //             </div>

  //             <div className="plan-delivery-details-container">
  //               <div className="plan-delivery-details-row">
  //                 <div className="delivery-icon-wrapper">
  //                   <img
  //                     style={{
  //                       filter:
  //                         "invert(40%) sepia(88%) saturate(390%) hue-rotate(36deg) brightness(94%) contrast(89%)",
  //                     }}
  //                     src="/Assets/selectlocation.svg"
  //                     alt="Location"
  //                     className="delivery-icon"
  //                   />
  //                 </div>

  //                 <div className="plan-delivery-content-wrapper">
  //                   <p
  //                     className="text-truncate plan-location-name"
  //                     style={{ maxWidth: "220px", color: "black" }}
  //                     title={
  //                       localPlan?.addressType === "Home"
  //                         ? localPlan?.homeName || "Home"
  //                         : localPlan?.addressType === "PG"
  //                           ? localPlan?.apartmentName || "PG"
  //                           : localPlan?.addressType === "School"
  //                             ? localPlan?.schoolName || "School"
  //                             : localPlan?.addressType === "Work" ||
  //                                 localPlan?.addressType === "corporate"
  //                               ? localPlan?.companyName
  //                               : localPlan?.addressType || "Delivery Location"
  //                     }
  //                   >
  //                     {localPlan?.addressType === "Home"
  //                       ? localPlan?.homeName || "Home"
  //                       : localPlan?.addressType === "PG"
  //                         ? localPlan?.apartmentName || "PG"
  //                         : localPlan?.addressType === "School"
  //                           ? localPlan?.schoolName || "School"
  //                           : localPlan?.addressType === "Work" ||
  //                               localPlan?.addressType === "corporate"
  //                             ? localPlan?.companyName
  //                             : localPlan?.addressType || "Delivery Location"}
  //                   </p>

  //                   <p
  //                     className="text-truncate plan-full-address"
  //                     style={{
  //                       maxWidth: "280px",
  //                       color: "black",
  //                     }}
  //                     title={localPlan?.delivarylocation}
  //                   >
  //                     {localPlan?.delivarylocation || ""}
  //                   </p>

  //                   <div className="plan-user-mobile" data-text-role="Caption">
  //                     <div className="user-detailss mt-1">
  //                       {localPlan?.username} | {localPlan?.mobileNumber}
  //                     </div>
  //                   </div>

  //                   {(localPlan?.addressType === "School" ||
  //                     localPlan?.studentName) && (
  //                     <div className="caption-section" data-text-role="Caption">
  //                       <div className="user-detailss mt-1">
  //                         {localPlan?.studentName}
  //                         {localPlan?.studentClass
  //                           ? ` | Class - ${localPlan.studentClass}`
  //                           : ""}
  //                         {localPlan?.studentSection
  //                           ? ` | Section - ${localPlan.studentSection}`
  //                           : ""}
  //                       </div>
  //                     </div>
  //                   )}
  //                 </div>

  //                 <div className="change-button">
  //                   <div className="change-icon">
  //                     <svg
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       width="16"
  //                       height="16"
  //                       viewBox="0 0 16 16"
  //                       fill="none"
  //                       aria-hidden="true"
  //                     >
  //                       <path
  //                         d="M12.7869 4.06006C13.0026 4.06408 13.197 4.13649 13.3679 4.27393L13.4402 4.3374L13.4421 4.33936L14.0691 4.96729H14.0701C14.2584 5.15512 14.3562 5.37816 14.3562 5.63135C14.3561 5.88443 14.2583 6.10722 14.0701 6.29541L8.06909 12.2964L8.12964 12.356L7.97827 12.3872L7.92847 12.437L7.89526 12.4038L6.14429 12.7642L6.14331 12.7632C5.99732 12.7977 5.86495 12.7583 5.75757 12.6509C5.6507 12.5438 5.61079 12.4117 5.64526 12.2661L6.00366 10.5142L5.97144 10.4819L6.02124 10.4312L6.05249 10.2798L6.11304 10.3394L12.1277 4.33936C12.3159 4.15164 12.537 4.05551 12.7869 4.06006ZM3.90894 4.93896C4.82094 5.04553 5.51534 5.25975 5.98022 5.59033L6.14624 5.72217C6.50712 6.04333 6.68917 6.46017 6.68921 6.96631C6.68921 7.46798 6.48149 7.87559 6.07202 8.18018C5.66644 8.48179 5.09567 8.65629 4.37183 8.71533L4.3728 8.71631C3.56599 8.78862 2.97488 8.95356 2.58765 9.20166C2.20735 9.44537 2.02278 9.7739 2.02319 10.1958L2.03003 10.3452C2.06267 10.6821 2.20957 10.9385 2.46753 11.1235C2.76926 11.3398 3.255 11.4829 3.93921 11.5415L4.03296 11.5493L4.03101 11.6431L4.01538 12.3101L4.01245 12.4146L3.90894 12.4077C3.02682 12.3515 2.34286 12.14 1.86987 11.7622C1.39341 11.3812 1.15698 10.8553 1.15698 10.1958C1.15698 9.53364 1.4429 8.99511 2.00562 8.5874C2.56435 8.18297 3.33478 7.93994 4.3064 7.8501C4.8365 7.80039 5.22055 7.69624 5.46948 7.54639C5.71114 7.40131 5.823 7.21012 5.823 6.96631C5.82295 6.63775 5.67929 6.38651 5.37964 6.20361C5.07099 6.01541 4.55566 5.87468 3.82104 5.7915L3.72241 5.78076L3.73218 5.68213L3.79761 5.02881L3.80835 4.92725L3.90894 4.93896ZM12.7771 4.99463C12.7176 4.99466 12.671 5.01448 12.6306 5.05518H12.6296L7.20581 10.4771L7.9314 11.2026L13.3542 5.78076C13.3953 5.73967 13.4148 5.69221 13.4148 5.6333C13.4148 5.58902 13.4041 5.55139 13.3816 5.51807L13.3552 5.48584L12.9236 5.05518C12.883 5.01429 12.8361 4.99463 12.7771 4.99463Z"
  //                         fill="#6B6B6B"
  //                         stroke="#6B6B6B"
  //                         strokeWidth="0.2"
  //                       />
  //                     </svg>
  //                   </div>
  //                   <div className="change-badge" data-text-role="Badge/Chip">
  //                     <div className="change-text">
  //                       <span
  //                         onClick={() => {
  //                           handleAddressChange();
  //                         }}
  //                         onKeyDown={(e) => {
  //                           if (e.key === "Enter" || e.key === " ") {
  //                             e.preventDefault();
  //                             handleAddressChange();
  //                           }
  //                         }}
  //                         tabIndex={0}
  //                         role="button"
  //                         aria-label="Change delivery address"
  //                         style={{ cursor: "pointer" }}
  //                       >
  //                         Change
  //                       </span>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>

  //               <img className="separator-line" src={myplanseparator} alt="" />

  //               <div className="delivery-details-row">
  //                 <div className="delivery-icon-wrapper">
  //                   <img
  //                     style={{
  //                       scale: "1.5",
  //                     }}
  //                     src="/Assets/securityIcon.svg"
  //                     alt="Handover"
  //                     className="delivery-icon"
  //                   />
  //                 </div>

  //                 <div className="plan-delivery-content-wrapper">
  //                   <input
  //                     type="text"
  //                     className="delivery-notes-input"
  //                     placeholder="Add Delivery Notes"
  //                     tabIndex={0}
  //                     aria-label="Delivery notes"
  //                     value={deliveryNotes}
  //                     onChange={(e) => setDeliveryNotes(e.target.value)}
  //                   />
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         <div
  //           style={{
  //             fontWeight: 500,
  //             color: "#212121",
  //             paddingBottom: 8,
  //             paddingLeft: 8,
  //             fontSize: 20,
  //             letterSpacing: "-1px",
  //           }}
  //         >
  //           Apply & Save
  //         </div>

  //         {localPlan.status === "Pending Payment" && (
  //           <div className="promo-wallet-container">
  //             <div className="wallet-section">
  //               <input
  //                 type="checkbox"
  //                 className="form-check-input wallet-checkbox"
  //                 tabIndex={0}
  //                 aria-label="Apply wallet credit"
  //                 name="Apply Wallet"
  //                 onChange={(e) => setUseWallet(e.target.checked)}
  //                 disabled={walletBalance <= 0}
  //               />
  //               <div className="wallet-text">
  //                 <div className="wallet-header">
  //                   <span className="wallet-title">Apply Wallet Credit</span>
  //                   <span className="wallet-amount">
  //                     ₹{walletBalance.toFixed(0)} available
  //                   </span>
  //                 </div>
  //                 <p className="wallet-subtext">Now you can pay with wallet</p>
  //               </div>
  //             </div>
  //           </div>
  //         )}

  //         <div className="billing-details-container">
  //           <span
  //             style={{
  //               fontWeight: 500,
  //               color: "#212121",
  //               paddingBottom: 8,
  //               paddingLeft: 8,
  //               fontSize: 20,
  //               letterSpacing: "-1px",
  //             }}
  //           >
  //             Billing Details
  //           </span>
  //           <div className="billing-details-list">
  //             <div className="billing-details-row">
  //               <span>Item Total (Excl. Tax)</span>
  //               {/* <span> ₹{localPlan?.amountBeforeTax?.toFixed(2)}</span>  */}
  //               <span> ₹{localPlan?.slotTotalAmount}</span>
  //             </div>

  //             <div className="billing-details-row">
  //               <span>Delivery Fees</span>
  //               <span>₹{deliveryRate}</span>
  //             </div>

  //             <div className="billing-details-row">
  //               <span>Tax ({localPlan?.taxPercentage || 5}%)</span>
  //               <span> ₹{localPlan?.taxAmount?.toFixed(2)}</span>
  //             </div>

  //             <div
  //               className="billing-details-row"
  //               style={{ borderTop: "1px dashed #ddd", paddingTop: "5px" }}
  //             >
  //               <span style={{ fontWeight: 600 }}>Total Order Value</span>
  //               <span style={{ fontWeight: 600 }}>
  //                 {" "}
  //                 ₹
  //                 {Number(localPlan?.slotTotalAmount) +
  //                   Number(localPlan?.taxAmount?.toFixed(2)) +
  //                   deliveryRate}
  //               </span>
  //             </div>
  //             {localPlan?.slotHubTotalAmount < localPlan?.slotTotalAmount && (
  //               <div className="billing-details-row">
  //                 <span>Pre-Order Savings</span>
  //                 <span>
  //                   - ₹
  //                   {localPlan?.slotHubTotalAmount - localPlan?.slotTotalAmount}
  //                 </span>
  //               </div>
  //             )}

  //             {localPlan?.preorderDiscount > 0 && (
  //               <div className="billing-details-row">
  //                 <span>Preorder Discount</span>
  //                 <span style={{ color: "#388e3c", fontWeight: 600 }}>
  //                   - ₹{localPlan.preorderDiscount}
  //                 </span>
  //               </div>
  //             )}
  //             <div className="billing-details-row">
  //               <span>Wallet</span>
  //               <span>
  //                 {" "}
  //                 -₹
  //                 {localPlan.status === "Confirmed"
  //                   ? localPlan.discountWallet
  //                   : walletDeduction.toFixed(0)}
  //               </span>
  //             </div>

  //             {localPlan.status === "Confirmed" ? (
  //               <div className="billing-details-row">
  //                 <span>Amount Paid</span>
  //                 <span> ₹{localPlan?.payableAmount} </span>
  //               </div>
  //             ) : (
  //               <div className="billing-details-row">
  //                 <span>Payable Amount</span>
  //                 <span> ₹{payableAmount?.toFixed(2)}</span>
  //               </div>
  //             )}
  //           </div>
  //         </div>

  //         <div className="modal-footer-actions">
  //           {isUnpaidEditable && (
  //             <>
  //               <button
  //                 className="skip-btn"
  //                 tabIndex={0}
  //                 aria-label="Skip this order"
  //                 onClick={handleSkipOrCancel}
  //                 onKeyDown={(e) => {
  //                   if (e.key === "Enter" || e.key === " ") {
  //                     e.preventDefault();
  //                     if (!loading) handleSkipOrCancel();
  //                   }
  //                 }}
  //                 disabled={loading}
  //               >
  //                 Skip Order
  //                 <img
  //                   src={myplanskip}
  //                   alt=""
  //                   style={{ marginLeft: 6, width: 16 }}
  //                   aria-hidden="true"
  //                 />
  //               </button>
  //               <button
  //                 className={`pay-btn ${isProcessing ? "processing" : ""}`}
  //                 tabIndex={0}
  //                 aria-label={`Confirm and pay ${payableAmount} rupees`}
  //                 onClick={async () => {
  //                   setIsProcessing(true);
  //                   setLoading(true);
  //                   try {
  //                     await handlePayPlan(
  //                       localPlan,
  //                       deliveryNotes,
  //                       walletDeduction,
  //                     );
  //                   } catch (e) {
  //                     setLoading(false);
  //                     setIsProcessing(false);
  //                   }
  //                 }}
  //                 onKeyDown={(e) => {
  //                   if (e.key === "Enter" || e.key === " ") {
  //                     e.preventDefault();
  //                     if (!loading && !isProcessing) {
  //                       setIsProcessing(true);
  //                       setLoading(true);
  //                       handlePayPlan(
  //                         localPlan,
  //                         deliveryNotes,
  //                         walletDeduction,
  //                       ).catch((e) => {
  //                         setLoading(false);
  //                         setIsProcessing(false);
  //                       });
  //                     }
  //                   }
  //                 }}
  //                 disabled={loading || isProcessing}
  //               >
  //                 <div className="pay-btn-left">
  //                   <div className="confirm-text">
  //                     {loading || isProcessing ? (
  //                       <>
  //                         <span className="button-loader"></span>
  //                         Processing
  //                       </>
  //                     ) : (
  //                       "Confirm"
  //                     )}
  //                   </div>
  //                   <div className="and-pay-text">
  //                     {loading || isProcessing ? "" : "& Pay"}
  //                   </div>
  //                 </div>
  //                 <div className="pay-btn-right">
  //                   {localPlan.slotHubTotalAmount > payableAmount ? (
  //                     <div className="price-container">
  //                       <span className="original-price">
  //                         ₹
  //                         {(
  //                           localPlan.slotHubTotalAmount +
  //                           localPlan.taxAmount +
  //                           localPlan.deliveryCharge
  //                         ).toFixed(2)}
  //                       </span>
  //                       <div className="final-price-box">
  //                         ₹{payableAmount?.toFixed(2)}
  //                       </div>
  //                     </div>
  //                   ) : (
  //                     <div
  //                       className="price-container"
  //                       style={{ color: "black" }}
  //                     >
  //                       <div className="final-price-box1">
  //                         ₹{payableAmount?.toFixed(2)}
  //                       </div>
  //                     </div>
  //                   )}
  //                 </div>
  //               </button>
  //             </>
  //           )}

  //           {isPaidEditable && (
  //             <button
  //               className="skip-btn"
  //               onClick={handleSkipOrCancel}
  //               disabled={loading}
  //             >
  //               Cancel Order
  //               <img
  //                 src={myplancancelicon}
  //                 alt=""
  //                 style={{ marginLeft: 6, width: 16 }}
  //               />
  //             </button>
  //           )}
  //           {isConfirmed && (
  //             <button
  //               className="track-order-btn"
  //               tabIndex={0}
  //               aria-label="Track your order"
  //               onClick={() => handleTrackOrder(plan)}
  //               onKeyDown={(e) => {
  //                 if (e.key === "Enter" || e.key === " ") {
  //                   e.preventDefault();
  //                   handleTrackOrder(plan);
  //                 }
  //               }}
  //             >
  //               <span> Track Order</span>

  //               <img
  //                 style={{
  //                   scale: "0.8",
  //                 }}
  //                 src="/Assets/tracker.svg"
  //                 alt=""
  //                 aria-hidden="true"
  //               />
  //             </button>
  //           )}
  //         </div>
  //       </div>

  //       <LocationModal2
  //         show={showLocationModal}
  //         onClose={() => setShowLocationModal(false)}
  //         onAddressSelected={handleAddressSelected}
  //         selectedLocationId={localPlan?.addressId}
  //       />

  //       <AddMoreToSlotModal
  //         show={showAddMoreModal}
  //         onClose={() => setShowAddMoreModal(false)}
  //         planId={localPlan._id}
  //         userId={userId}
  //         onItemsUpdated={(updatedPlan) => {
  //           if (!updatedPlan) {
  //             Swal2.fire({
  //               toast: true,
  //               position: "bottom",
  //               showConfirmButton: false,
  //               timer: 2500,
  //               timerProgressBar: true,
  //               html: `
  //                 <div class="myplans-toast-content">
  //                   <img src="${checkCircle}" alt="Success" class="myplans-toast-check" />
  //                   <div class="myplans-toast-text">
  //                     <div class="myplans-toast-title">Plan Removed.</div>
  //                     <div class="myplans-toast-subtitle">Plan removed as it is empty</div>
  //                   </div>
  //                 </div>
  //               `,
  //               customClass: {
  //                 popup: "myplans-custom-toast",
  //                 htmlContainer: "myplans-toast-html",
  //               },
  //               didOpen: () => {
  //                 const toast = document.querySelector(".myplans-custom-toast");
  //                 if (toast) {
  //                   toast.style.bottom = "90px";
  //                   toast.style.left = "50%";
  //                   toast.style.transform = "translateX(-50%)";
  //                   toast.style.position = "fixed";
  //                 }
  //               },
  //             });
  //             setShowAddMoreModal(false);
  //             onClose();
  //             if (onPlanUpdated) onPlanUpdated();
  //             return;
  //           }
  //           if (updatedPlan) {
  //             setLocalPlan(updatedPlan);
  //           }
  //           setShowAddMoreModal(false);
  //           if (onPlanUpdated) onPlanUpdated();
  //         }}
  //       />
  //     </div>
  //   );
  // };

  useEffect(() => {
    fetchPlans();
    getDeliveryRates();
  }, [userId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPlan(null);
    setIsModalOpen(false);
  };

  const onPlanUpdated = () => {
    fetchPlans();
  };

  const mobile = user?.Mobile;
  const username = user?.Fname;

  async function handlePayPlan(
    plan,
    deliveryNotes,
    discountWallet = 0,
    deliveryRate = 0,
  ) {
    try {
      // Find delivery rate for this plan
      const acquisitionChannel = user?.acquisition_channel || "organic";
      const userStatus = user?.status || "Normal";
      const hubId = plan.hubId || plan.hub?._id;
      const deliveryRate = findDeliveryRate(
        hubId,
        acquisitionChannel,
        userStatus,
      );

      const rawAmount =
        plan.payableAmount - discountWallet + deliveryRate + plan.taxAmount;
      const amount = Math.round(rawAmount * 100) / 100; // Round to 2 decimal places

      console.log(amount, "amount payable..............");

      // CRITICAL: Log the amount to verify calculation
      console.log("💰 Calculated amount:", {
        taxAmount: plan.taxAmount,
        slotTotalAmount: plan.slotTotalAmount,
        deliveryRate,
        payableAmount: plan.payableAmount,
        discountWallet,
        preorderDiscount: plan.preorderDiscount,
        finalAmount: amount,
        isZero: amount === 0,
      });

      if (amount === 0) {
        const generateUniqueId = () => {
          const timestamp = Date.now().toString().slice(-4);
          const randomNumber = Math.floor(1000 + Math.random() * 9000);
          return `${address?.prefixcode}${timestamp}${randomNumber}`;
        };

        const configObj = {
          method: "post",
          baseURL: "https://dd-backend-3nm0.onrender.com/api/",
          url: "/user/plan/create-from-plan",
          headers: { "content-type": "application/json" },
          data: {
            userId,
            planId: plan._id,
            discountWallet,
            coupon: 0,
            studentName: plan.studentName,
            studentClass: plan.studentClass,
            studentSection: plan.studentSection,
            addressType: plan.addressType,
            coordinates: plan.coordinates,
            hubName: plan?.hubName,
            username: username,
            mobile: mobile,
            deliveryNotes: deliveryNotes,
            orderid: generateUniqueId(),
            deliveryCharge: deliveryRate,
          },
        };

        const res = await axios(configObj);
        if (res.status === 200 || res.data?.success) {
          if (res.data?.duplicate) {
            console.log("Order already exists, skipping wallet deduction");
          }

          await fetchWalletData();

          const paymentParams = new URLSearchParams({
            transactionId: "completed",
            userId: userId,
            session: plan.session,
            deliveryDate: plan.deliveryDate,
            username: username || plan.username,
            amount: amount,
            orderId: plan._id,
            hubName: plan.hubName || "",
            delivarylocation: plan.delivarylocation || "",
            status: "COMPLETED",
            paymentMethod: "wallet",
            deliveryCharge: deliveryRate,
          });

          navigate("/payment-success?" + paymentParams.toString());

          setTimeout(() => {
            if (typeof fetchPlans === "function") {
              fetchPlans();
            }
            setProcessingPlanId(null);
          }, 1200);
        }
        return;
      }

      const generateUniqueId = () => {
        const timestamp = Date.now().toString().slice(-4);
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        return `${address?.prefixcode}${timestamp}${randomNumber}`;
      };

      const configObj = {
        method: "post",
        baseURL: "https://dd-backend-3nm0.onrender.com/api/",
        url: "/user/plan/create-from-plan",
        headers: { "content-type": "application/json" },
        data: {
          userId,
          planId: plan._id,
          discountWallet,
          coupon: 0,
          studentName: plan.studentName,
          studentClass: plan.studentClass,
          studentSection: plan.studentSection,
          addressType: plan.addressType,
          coordinates: plan.coordinates,
          hubName: plan?.hubName,
          username: username,
          mobile: mobile,
          deliveryNotes: deliveryNotes,
          orderid: generateUniqueId(),
          deliveryCharge: deliveryRate,
        },
      };

      const razorpayOrderData = {
        userId,
        username,
        Mobile: mobile,
        amount,
        orderId: plan._id,
        config: JSON.stringify(configObj),
        cartId: null,
        offerconfig: null,
        cart_id: null,
      };

      const { handleRazorpayPayment } = await import("../Helper/razorpay");

      await handleRazorpayPayment(
        razorpayOrderData,
        async (response) => {
          console.log(
            "Payment handler called (should not happen with callback_url):",
            response,
          );
        },
        (error) => {
          console.error("Payment failed:", error);
          setProcessingPlanId(null);

          const failureParams = new URLSearchParams({
            transactionId: "",
            userId: userId,
            status: "FAILED",
            paymentMethod: "razorpay",
            error: error.message || "Payment could not be processed",
          });
          navigate("/payment-success?" + failureParams.toString());
        },
      );
    } catch (err) {
      setProcessingPlanId(null);
      console.error("pay plan error", err);
      if (err.response?.data?.error === "OUT_OF_STOCK") {
        Swal2.fire({
          icon: "info",
          title: "Item Unavailable",
          text: err.response.data.message,
          confirmButtonText: "See Other Options",
          confirmButtonColor: "#d33",
        }).then(() => {
          if (isModalOpen) closeModal();
          navigate("/");
        });
      } else {
        toast.error(err.response?.data?.message || "Failed to start payment");
      }
    }
  }

  return (
    <div className="my-plan-container mainbg">
      <div className="checkoutcontainer">
        <div className="mobile-banner-updated">
          <div
            className="screen-checkout mb-2 checkout-header d-flex align-items-center justify-content-between"
            style={{ gap: "24px",flexDirection:"row" }}
          >
            <div 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              justifyContent: "center",
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                onClick={() => navigate("/home")}
                className="cursor-pointer"
              >
                <path
                  d="M11.7375 19.5002L19.0875 26.8502C19.3875 27.1502 19.5315 27.5002 19.5195 27.9002C19.5075 28.3002 19.351 28.6502 19.05 28.9502C18.75 29.2252 18.4 29.3692 18 29.3822C17.6 29.3952 17.25 29.2512 16.95 28.9502L7.05001 19.0502C6.90001 18.9002 6.79351 18.7377 6.73051 18.5627C6.66751 18.3877 6.63701 18.2002 6.63901 18.0002C6.64101 17.8002 6.67251 17.6127 6.73351 17.4377C6.79451 17.2627 6.90051 17.1002 7.05151 16.9502L16.9515 7.05019C17.2265 6.77519 17.5705 6.6377 17.9835 6.6377C18.3965 6.6377 18.7525 6.77519 19.0515 7.05019C19.3515 7.35019 19.5015 7.7067 19.5015 8.1197C19.5015 8.5327 19.3515 8.8887 19.0515 9.1877L11.7375 16.5002H28.5C28.925 16.5002 29.2815 16.6442 29.5695 16.9322C29.8575 17.2202 30.001 17.5762 30 18.0002C29.999 18.4242 29.855 18.7807 29.568 19.0697C29.281 19.3587 28.925 19.5022 28.5 19.5002H11.7375Z"
                  fill="#FAFAFA"
                />
              </svg>
            {/* <div
              className=""
              style={{ display: "flex", alignItems: "center", gap: 3 }}
            > */}
              <h3 className="tagline">My Plans</h3>
              {/* <img
                src={pending}
                alt=""
                onClick={() => setShowQuickAnswers(true)}
                style={{
                  width: "20px",
                  height: "20px",
                  position: "relative",
                  top: "-6px",
                  cursor: "pointer",
                }}
              /> */}
            {/* </div> */}
            </div>
            <div
              onClick={() => navigate("/orders")}
              className="Order-history-btn"
            >
              Order History
            </div>
          </div>
          {/* <div className="d-flex justify-content-end align-items-center w-100">
            <div
              onClick={() => navigate("/orders")}
              style={{
                cursor: "pointer",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                marginLeft: "auto",
                marginRight: "15px",
              }}
            >
              <img
                src={orderhistoryicon}
                alt="My Orders"
                className="icon-img-l"
              />
              <h6
                style={{
                  color: "#2c2c2c",
                  fontSize: "16px",
                  fontWeight: "400",
                  fontFamily: "Inter",
                  textDecoration: "underline",
                  margin: 0,
                  whiteSpace: "nowrap",
                }}
              >
                Order History
              </h6>
            </div>
          </div> */}
        </div>

        <div className="myplan-mid-section">
          <div className="plans-list">
            {isLoadingPlans ? (
              <div className="loading-plans">
                <div className="plans-loader-container">
                  <span className="plans-loader"></span>
                  <div className="loading-text">Loading your plans...</div>
                </div>
              </div>
            ) : plans.length === 0 ? (
              <div className="no-plans-text">No plans yet</div>
            ) : (
              plans
                .sort(
                  (a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate),
                )
                .map((plan) => {
                  const now = new Date();
                  const deadline = new Date(plan.paymentDeadline);
                  const isBeforeDeadline = now < deadline;

                  // Find delivery rate for this plan
                  const acquisitionChannel =
                    user?.acquisition_channel || "organic";
                  const userStatus = user?.status || "Normal";
                  const hubId = plan.hubId || plan.hub?._id;
                  const deliveryRate = findDeliveryRate(
                    hubId,
                    acquisitionChannel,
                    userStatus,
                  );

                  const payableAmount = Math.max(
                    0,
                    plan?.payableAmount -
                      (plan.discountWallet || 0) +
                      deliveryRate +
                      plan.taxAmount,
                  ).toFixed(2);

                  const isUnpaidEditable =
                    plan.status === "Pending Payment" && isBeforeDeadline;

                  const isPaidEditable =
                    plan.status === "Confirmed" && isBeforeDeadline;
                  const isPaidLocked =
                    plan.status === "Confirmed" && !isBeforeDeadline;

                  const isConfirmed = plan.status === "Confirmed";

                  return (
                    <div key={plan._id} className="plan-card-section">
                      <div className="plan-card-container">
                        
                        {/* HEADER: Badge, Date, Price */}
                        <div className="plan-card-header">
                          <div className="plan-header-left">
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0" }}>
                              <span className={`plan-badge ${plan.deliveryDate && new Date(plan.deliveryDate).toDateString() === new Date().toDateString() ? 'today' : 'tomorrow'}`}>
                                {plan.deliveryDate && new Date(plan.deliveryDate).toDateString() === new Date().toDateString() ? 'TODAY' : new Date(plan.deliveryDate) < new Date(Date.now() + 86400000) ? 'TOMORROW' : 'UPCOMING'}
                              </span>
                              <div className="plan-date-time">
                                {new Date(plan.deliveryDate).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short"
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="plan-header-right">
                            <div className="plan-total-price">₹{plan.slotTotalAmount}</div>
                          </div>
                        </div>

                        {/* SESSION & TIME Row */}
                        <div className="plan-session-row">
                          <div className="plan-session-left">
                            <div className="plan-session-title">{plan.session}</div>
                            <div className="plan-session-time">
                              {plan.session === "Lunch" ? "12:00–1:00 PM" : plan.session === "Breakfast" ? "7:00–8:00 AM" : "7:00–8:00 PM"}
                            </div>
                          </div>
                          <div className={`plan-status-badge ${plan.status === 'Confirmed' ? 'confirmed' : plan.status === 'Pending Payment' ? 'pending' : 'cooking'}`} >
                            {plan.status === 'Confirmed' ? 'Cooking now' : plan.status === 'Pending Payment' ? 'Pending' : 'Skipped'}
                          </div>
                        </div>

                        {/* ITEMS LIST */}
                        <div className="plan-items-list">
                          {(plan.products || []).map((product, idx) => (
                            <div key={product._id || idx} className="plan-item-line">
                              <div className="plan-item-info">
                                <img src={product.foodCategory==="Veg" ? IsVeg : IsNonVeg} className="plan-item-category" />
                                <span className="plan-item-food-name">
                                  {product.foodName}
                                  {product.quantity > 1 && <span style={{ marginLeft: '4px' }}>×{product.quantity}</span>}
                                </span>
                              </div>
                              <div className="plan-item-cost">₹{product.totalPrice?.toFixed(0)}</div>
                            </div>
                          ))}
                        </div>

                        {/* DELIVERY ADDRESS - BEFORE FRESHNESS JOURNEY */}
                        <div className="plan-delivery-info">
                          <span className="plan-delivery-info-left">
                            !
                            </span>
                            <div className="plan-delivery-info-right">
                              <div className="delivery-location-label">
                            DELIVERING TO
                          </div>
                          <div className="delivery-address-main">
                            {plan.delivarylocation || ""}
                          </div>
                            </div>
                          
                        </div>

                        {/* FRESHNESS JOURNEY - Only for confirmed orders */}
                        {plan.status === "Confirmed" && (
                          <div className="plan-journey-section">
                            <div className="journey-title">Freshness Journey</div>
                            <div className="journey-track">
                              {/* Order placed */}
                              <div className="journey-point">
                                <div className="point-circle done">✓</div>
                                <div className="point-label">Order<br/>placed</div>
                                <div className="point-time">Yesterday</div>
                              </div>

                              {/* Sourced */}
                              <div className="journey-point">
                                <div className="point-circle done">✓</div>
                                <div className="point-label">Sourced<br/>fresh</div>
                                <div className="point-time">5:02 AM</div>
                              </div>

                              {/* Cooking (Current) */}
                              <div className="journey-point">
                                <div className="point-circle active">●</div>
                                <div className="point-label">Cooking</div>
                                <div className="point-time">now</div>
                              </div>

                              {/* Packed */}
                              <div className="journey-point">
                                <div className="point-circle pending">○</div>
                                <div className="point-label">Packed &<br/>out</div>
                                <div className="point-time">~11:45</div>
                              </div>

                              {/* Delivery */}
                              <div className="journey-point">
                                <div className="point-circle pending">○</div>
                                <div className="point-label">On the<br/>way</div>
                                <div className="point-time">~12:30</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ACTION BUTTONS - Only for pending plans */}
                        {plan.status === 'Pending Payment' && (
                          <div className="plan-actions">
                            <button 
                              className="plan-btn primary"
                              onClick={() => {
                                setProcessingPlanId(plan._id);
                                handlePayPlan(plan, "");
                              }}
                              disabled={processingPlanId === plan._id}
                            >
                              {processingPlanId === plan._id ? 'Processing...' : 'Confirm & Pay'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
{/* 
      <Modal
        show={showQuickAnswers}
        onHide={() => setShowQuickAnswers(false)}
        centered
        dialogClassName="quick-answers-modal"
        style={{ zIndex: "10000" }}
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 14, color: "#222", lineHeight: 1.5 }}>
            🥗 Meal Planning — quick answers 📅🚚
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ fontSize: 14, color: "#222", lineHeight: 1.5 }}>
            <h5
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px",
                marginTop: "16px",
              }}
            >
              1. How do daily plans work?
            </h5>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              We organize your meals into <strong>Today, Tomorrow</strong>, and{" "}
              <strong>Upcoming</strong> lists. You can plan ahead for the whole
              week, but nothing is ordered until you tap "
              <strong>Confirm & Pay</strong>" for each specific day.
            </p>

            <h5
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px",
                marginTop: "16px",
              }}
            >
              2. Why confirm early?
            </h5>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              Confirming early guarantees your meal. We start cooking based on
              confirmed orders to ensure freshness and zero waste. Once the
              cutoff time passes, we stop taking orders for that meal—no
              exceptions.
            </p>

            <h5
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px",
                marginTop: "16px",
              }}
            >
              3. What are the cutoff times?
            </h5>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              <strong>Lunch:</strong> Confirm by <strong>10:00 AM</strong>{" "}
              (Delivered <strong>12:00–1:30 PM</strong>)<br />
              <strong>Dinner:</strong> Confirm by <strong>5:00 PM</strong>{" "}
              (Delivered <strong>7:30–8:30 PM</strong>)<br />
              After these times, ordering for that meal is closed.
            </p>

            <h5
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px",
                marginTop: "16px",
              }}
            >
              4. What does "View Plan" show?
            </h5>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              "View Plan" is your checkout screen. It shows exactly what's in
              your meal, the total bill, any discounts, and your delivery
              address. This is also where you apply your Wallet Credits before
              paying.
            </p>

            <h5
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px",
                marginTop: "16px",
              }}
            >
              5. What do the statuses mean?
            </h5>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              <strong>Pending:</strong> You planned this meal but haven't paid.
              It is not ordered yet.
              <br />
              <strong>Confirmed:</strong> You've paid. Your meal is locked in
              and will be delivered.
              <br />
              <strong>Skipped:</strong> You removed this plan or missed the
              cutoff.
            </p>

            <h5
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px",
                marginTop: "16px",
              }}
            >
              6. Can I cancel after confirming?
            </h5>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              Once you confirm, we start preparing your order almost
              immediately.
              <br />
              <br />
              <strong>Before Cutoff:</strong> You can't self-cancel in the app
              (yet), but please contact Customer Support. We handle these
              requests case-by-case.
              <br />
              <strong>After Cutoff:</strong> Cancellations are generally not
              possible as food preparation has begun.
            </p>

            <h5
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px",
                marginTop: "16px",
              }}
            >
              7. What happens if I "Skip" a plan?
            </h5>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              Skipping tells us you definitely don't want that meal, which helps
              us forecast our kitchen stock better.
              <br />
              <br />
              <strong>Note:</strong> If you don't confirm a "Pending" plan by
              the cutoff time, it gets skipped automatically. You won't be
              charged.
            </p>

            <h5
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px",
                marginTop: "16px",
              }}
            >
              8. How do discounts work?
            </h5>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              Discounts apply automatically where eligible.
              <br />
              <br />
              Get <strong>₹75 off</strong> across your <strong>first 3</strong>{" "}
              orders.
              <br />
              <br />
              You'll see the discount breakdown inside "View Plan" before you
              pay.
            </p>

            <h5
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px",
                marginTop: "16px",
              }}
            >
              9. What if I forget to confirm?
            </h5>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              Nothing bad happens! Your plan stays "Pending" until the cutoff
              passes, then it simply disappears. You are never charged unless
              you explicitly hit "Confirm & Pay".
            </p>

            <h5
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px",
                marginTop: "16px",
              }}
            >
              10. Where is my refund?
            </h5>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              If a refund is approved by support for any reason, the money is
              refunded instantly to your <strong>DailyDish Wallet</strong>. You
              can use it for your next meal.
            </p>

            <h5
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px",
                marginTop: "16px",
              }}
            >
              11. Where can I see past orders?
            </h5>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              Delivered meals move to My Orders / Order History automatically.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer
          style={{
            display: "flex",
            justifyContent: "center",
            borderTop: "none",
            paddingTop: "0",
          }}
        >
          <button
            style={{
              backgroundColor: "#6B8E23",
              border: "none",
              color: "white",
              padding: "10px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              width: "120px",
            }}
            onClick={() => setShowQuickAnswers(false)}
          >
            Got it
          </button>
        </Modal.Footer>
      </Modal> */}

      <BottomNav />
    </div>
  );
};

export default MyPlan;