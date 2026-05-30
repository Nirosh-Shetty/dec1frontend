import { useState } from "react";
import moment from "moment";
import { FaAngleUp, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../Styles/MultiCartDrawer.css";
import MyMeal from "../assets/mymeal.svg";
import Swal2 from "sweetalert2";
import arrow from "./../assets/material-symbols_arrow-back-rounded.png";
import checkCircle from "../assets/check_circle.png";

const MultiCartDrawer = ({
  proceedToPlan,
  groupedCarts,
  overallSubtotal,
  overallTotalItems,
  onJumpToSlot, // Function to set selectedDate/Session in Home.jsx
}) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const address = JSON.parse(
    localStorage.getItem("primaryAddress"),
    // localStorage.getItem("currentLocation")
  );
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const formatSlotDate = (date) => {
    const today = moment().startOf("day");
    const tomorrow = moment().add(1, "days").startOf("day");
    const dateMoment = moment(date).startOf("day");
    if (dateMoment.isSame(today)) return "Today";
    if (dateMoment.isSame(tomorrow)) return "Tomorrow";
    return moment(date).format("MMM D");
  };

  const handleSlotDetailClick = (slot) => {
    // Normalize session to title case (e.g. "lunch" -> "Lunch")
    const normalizedSession =
      slot.session.charAt(0).toUpperCase() +
      slot.session.slice(1).toLowerCase();
    onJumpToSlot(slot.date, normalizedSession);
    setIsDrawerOpen(false);
  };

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    navigate("/checkout");
  };

  // Handle "My Meal" click for non-logged in users
  const handleMyMealClickForGuest = () => {
    // Navigate to login page without setting destination flag
    navigate("/login");
    setIsDrawerOpen(false); // Close drawer if open
  };

  // Handle "Move to My Plans" click for logged in users
  const handleMoveToMyPlans = () => {
    if (user && !address) {
      // If user doesn't have address, show toast message
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Please add your delivery address first!`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      return;
    }

    // Directly proceed to plan
    proceedToPlan();
  };

  // Helper function to format item count text
  const getItemCountText = (totalItems) => {
    if (totalItems === 1) {
      return "1 item";
    }
    return `${totalItems} items`;
  };

  // Helper function to format price display for closed drawer
  const getPriceDisplayText = (groupedCarts) => {
    if (groupedCarts.length === 1) {
      // Single slot - show its subtotal
      return `₹${groupedCarts[0].subtotal.toFixed(0)}`;
    } else {
      // Multiple slots - show total of all slots
      const totalPrice = groupedCarts.reduce((sum, slot) => sum + slot.subtotal, 0);
      return `₹${totalPrice.toFixed(0)}`;
    }
  };

  if (overallTotalItems === 0) {
    return null;
  }

  return (
    <>
      {/* small "View All" bubble above closed bar */}
      {isDrawerOpen || (
        <>
          {groupedCarts.length > 1 && (
            <>
              <div
                className="view-all-bubble"
                onClick={() => setIsDrawerOpen(true)}
              >
                View All
                <img src="/Assets/arrowup.svg" />
              </div>
            </>
          )}

          <div className="cartbutton">
            <div
              className={`cartbtn ${
                groupedCarts.length > 1 ? "multi-cart" : ""
              }`}
            >
              <div className="d-flex justify-content-between align-items-center flex-row">
                <div className="d-flex gap-1 align-items-center flex-row">
                  <div className="cart-items-price">
                    {/* Show item count with proper pluralization */}
                    {getItemCountText(overallTotalItems)} | {getPriceDisplayText(groupedCarts)}
                  </div>
                </div>
                {user && address ? (
                  <div
                    className="d-flex gap-2 viewcartbtn align-items-center"
                    onClick={handleMoveToMyPlans}
                  >
                    <div className="my-meal-text">
                      <img src={arrow} alt="Arrow" className="button-arrow" />
                      Checkout
                    </div>
                  </div>
                ) : user && !address ? (
                  <div
                    className="d-flex gap-2 viewcartbtn align-items-center"
                    onClick={() => {
                      navigate("/location");
                    }}
                  >
                    <div className="my-meal-text">
                      <img src={arrow} alt="Arrow" className="button-arrow" />
                      Add location
                    </div>
                  </div>
                ) : (
                  <div
                    className="d-flex gap-2 viewcartbtn align-items-center"
                    onClick={handleMyMealClickForGuest}
                  >
                    <div className="my-meal-text">
                      <img src={arrow} alt="Arrow" className="button-arrow" />
                      Login to continue
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Manual drawer implementation */}
      {isDrawerOpen && (
        <div className="manual-drawer-overlay">
          <div className="manual-drawer">
            <div className="multi-cart-drawer-content">
              {/* Close button at top center */}
              <div className="top-close-section">
                <button
                  className="close-button-top"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="multi-cart-header">
                <div
                  className="checkout-top"
                  onClick={() => {
                    user && address
                      ? handleMoveToMyPlans()
                      : user && !address
                        ? navigate("/location")
                        : handleMyMealClickForGuest();
                  }}
                >
                  <img src={arrow} alt="arrow" className="header-arrow" />
                  {user && !address
                    ? "Add location"
                    : user && address
                      ? "Move to Checkout"
                      : "Login to continue"}
                </div>
              </div>

              <div className="slot-list-container">
                {groupedCarts.map((slot, index) => (
                  <div className="cartbutton" key={index}>
                    <div className="mc-cartbtn">
                      <div className="d-flex justify-content-around align-items-center gap-2">
                        <div className="d-flex gap-1 align-items-center">
                          <div className="cart-items-price">
                            {/* Show item count with proper pluralization for each slot */}
                            {slot.totalItems === 1 
                              ? `${slot.totalItems} item` 
                              : `${slot.totalItems} items`} | ₹{slot.subtotal.toFixed(0)}
                          </div>
                        </div>
                        <div className="slot-title-details">
                          <div className="slot-session-date">
                            <span className="session-name">{slot.session}</span>
                            <span className="date-name">
                              {formatSlotDate(slot.date)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSlotDetailClick(slot)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "unset",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <div className="d-flex gap-1 align-content-center ">
                            <div className="my-meal-icon">
                              <img src={MyMeal} alt="" />
                            </div>
                            <div className="my-meal-text">Details</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MultiCartDrawer;