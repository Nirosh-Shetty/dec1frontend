import { useState, useEffect } from "react";
import "../Styles/CookingPromo.css";
import discountIcon from './../assets/bxs_offer.png';

const CookingPromo = () => {
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    // Show offer section after 1.5 seconds
    const timer = setTimeout(() => {
      setShowOffer(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="cooking-promo">
      <div className="promo-container">
        {/* Main Heading */}
        <div className="main-heading">
          <h1 className="plan-ahead">Plan Ahead.</h1>
          <h2 className="confirm-before">Confirm Before we Cook.</h2>
        </div>

        {/* Features List */}
        <div className="features-list">
          <div className="feature-item">
            <span className="bullet">•</span>
            <span className="feature-text">No Subscription</span>
            <span className="bullet">•</span>
            <span className="feature-text">Edit or skip anytime</span>
          </div>

          <div className="feature-item">
            <span className="bullet">•</span>
            <span className="feature-text">
              Cooked Fresh after Confirmation
            </span>
          </div>

          <div className="feature-item">
            <span className="bullet">•</span>
            <span className="feature-text">No Hidden Charges</span>
            <span className="bullet">•</span>
            <span className="feature-text">Free Deliveries</span>
          </div>
        </div>

        {/* Offer Section with Animation */}
        <div className={`offer-section ${showOffer ? "offer-visible" : ""}`}>
          <span className="rupee-symbol">
            <img 
              src={discountIcon} 
              alt="Discount" 
              style={{width:"24px", height:"24px"}} 
            />
          </span>
          <span className="offer-text" style={{marginRight:"2px"}}>
            ₹50 
          </span>
          <span className="offer-text2" >off each on your first 3 confirmed plans.</span>
          <span className="rupee-symbol">
            <img 
              src={discountIcon} 
              alt="Discount" 
              style={{width:"24px", height:"24px"}}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default CookingPromo;