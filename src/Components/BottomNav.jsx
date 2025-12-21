import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/BottomNav.css";
import { BiFoodMenu } from "react-icons/bi";
import { FaCalendarAlt } from "react-icons/fa";
import LocationRequiredPopup from "./LocationRequiredPopup";
import { MdAddLocationAlt } from "react-icons/md";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Use Ref for scroll position to avoid re-binding event listeners constantly
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Threshold of 10px to prevent jitter
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // Scrolling DOWN -> Hide
        setIsVisible(false);
      } else {
        // Scrolling UP -> Show
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- CRITICAL FIX FOR OVERLAP ---
  // We set a CSS variable on the body so OTHER components (like Cart Bar) know where to sit
  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("nav-visible");
      document.body.classList.remove("nav-hidden");
    } else {
      document.body.classList.add("nav-hidden");
      document.body.classList.remove("nav-visible");
    }
  }, [isVisible]);

  const activeTab = location.pathname.includes("my-plan") ? "plan" : "menu";

  // Check if user has address selected
  const handleMenuClick = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const address = JSON.parse(
      localStorage.getItem("primaryAddress") ??
        localStorage.getItem("currentLocation")
    );

    if (user && !address) {
      setShowLocationPopup(true);
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className={`bottom-nav-container ${isVisible ? "" : "bottom-nav-hidden"}`}
    >
     <div>
        <button
          className={`nav-item ${activeTab === "menu" ? "active" : ""}`}
          onClick={handleMenuClick}
        >
          <BiFoodMenu size={22} className="nav-icon-svg" />
          <span className="nav-label">Menu</span>
        </button>
     </div>

     <div>
        <button
          className={`nav-item ${activeTab === "plan" ? "active" : ""}`}
          onClick={() => navigate("/my-plan")}
        >
          <FaCalendarAlt size={20} className="nav-icon-svg" />
          <span className="nav-label">My Plans</span>
        </button>
     </div>

     {/* Location Selection Popup */}
     {/* <LocationRequiredPopup 
       show={showLocationPopup} 
       onClose={() => setShowLocationPopup(false)} 
     /> */}

     {/* {false && showLocationPopup && (
       <div
         style={{
           position: "fixed",
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           backgroundColor: "rgba(0,0,0,0.7)",
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           zIndex: 3000,
           padding: "20px",
         }}
         onClick={() => setShowLocationPopup(false)}
       >
         <div
           style={{
             backgroundColor: "white",
             borderRadius: "16px",
             padding: "24px",
             maxWidth: "400px",
             width: "100%",
             textAlign: "center",
             boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
             animation: "modalFadeIn 0.3s ease-out",
           }}
           onClick={(e) => e.stopPropagation()}
         >
           <div
             style={{
               fontSize: "48px",
               marginBottom: "16px",
               color: "#6B8E23",
             }}
           >
                           <MdAddLocationAlt />
             
           </div>
           <h3
             style={{
               marginBottom: "12px",
               color: "#333",
               fontSize: "20px",
               fontWeight: "600",
               fontFamily: "Inter",
             }}
           >
             Add Location to See Menu
           </h3>
           <p
             style={{
               marginBottom: "24px",
               color: "#666",
               fontSize: "14px",
               lineHeight: "1.5",
               fontFamily: "Inter",
             }}
           >
             Please add your delivery location to view available menu items and place orders.
           </p>
           <div
             style={{
               display: "flex",
               flexDirection: "column",
               gap: "12px",
               marginTop: "12px",
             }}
           >
             <button
               onClick={() => {
                 setShowLocationPopup(false);
                 navigate("/location");
               }}
               style={{
                 backgroundColor: "#6B8E23",
                 color: "white",
                 border: "none",
                 borderRadius: "12px",
                 padding: "14px",
                 fontSize: "16px",
                 fontWeight: "600",
                 cursor: "pointer",
                 transition: "background-color 0.2s",
                 fontFamily: "Inter",
               }}
               onMouseEnter={(e) => {
                 e.target.style.backgroundColor = "#5a7a1a";
               }}
               onMouseLeave={(e) => {
                 e.target.style.backgroundColor = "#6B8E23";
               }}
             >
               Add Location
             </button>
             <button
               onClick={() => setShowLocationPopup(false)}
               style={{
                 backgroundColor: "transparent",
                 color: "#666",
                 border: "1px solid #ddd",
                 borderRadius: "12px",
                 padding: "12px",
                 fontSize: "14px",
                 fontWeight: "500",
                 cursor: "pointer",
                 transition: "all 0.2s",
                 fontFamily: "Inter",
               }}
               onMouseEnter={(e) => {
                 e.target.style.backgroundColor = "#f5f5f5";
               }}
               onMouseLeave={(e) => {
                 e.target.style.backgroundColor = "transparent";
               }}
             >
               Close
             </button>
           </div>
         </div>

         <style jsx>{`
           @keyframes modalFadeIn {
             from {
               opacity: 0;
               transform: scale(0.9);
             }
             to {
               opacity: 1;
               transform: scale(1);
             }
           }
         `}</style>
       </div>
     )} */}
    </div>
  );
};

export default BottomNav;
