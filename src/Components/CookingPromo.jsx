// import { useState, useEffect } from "react";
// import "../Styles/CookingPromo.css";
// import discountIcon from './../assets/bxs_offer.png';

// const CookingPromo = () => {
//   const [showOffer, setShowOffer] = useState(false);

//   useEffect(() => {
//     // Show offer section after 1.5 seconds
//     const timer = setTimeout(() => {
//       setShowOffer(true);
//     }, 1500);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <div className="cooking-promo">
//       <div className="promo-container">
//         {/* Main Heading */}
//         <div className="main-heading">
//           <h1 className="plan-ahead">Plan Ahead.</h1>
//           <h2 className="confirm-before">Confirm Before we Cook.</h2>
//         </div>

//         {/* Features List */}
//         <div className="features-list">
//           <div className="feature-item">
//             <span className="bullet">•</span>
//             <span className="feature-text">No Subscription</span>
//             <span className="bullet">•</span>
//             <span className="feature-text">Edit or skip anytime</span>
//           </div>

//           <div className="feature-item">
//             <span className="bullet">•</span>
//             <span className="feature-text">
//               Cooked Fresh after Confirmation
//             </span>
//           </div>

//           <div className="feature-item">
//             <span className="bullet">•</span>
//             <span className="feature-text">No Hidden Charges</span>
//             <span className="bullet">•</span>
//             <span className="feature-text">Free Deliveries</span>
//           </div>
//         </div>

//         {/* Offer Section with Animation */}
//         <div className={`offer-section ${showOffer ? "offer-visible" : ""}`}>
//           <span className="rupee-symbol">
//             <img 
//               src={discountIcon} 
//               alt="Discount" 
//               style={{width:"24px", height:"24px"}} 
//             />
//           </span>
//           <span className="offer-text" style={{marginRight:"2px"}}>
//             ₹50 
//           </span>
//           <span className="offer-text2" >off each on your first 3 confirmed plans.</span>
//           <span className="rupee-symbol">
//             <img 
//               src={discountIcon} 
//               alt="Discount" 
//               style={{width:"24px", height:"24px"}}
//             />
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CookingPromo;























import { useState, useEffect } from "react";
import "../Styles/CookingPromo.css";
import discountIcon from "./../assets/bxs_offer.png";
import { FaCheck } from "react-icons/fa";

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
          {/* <h1 className="plan-ahead">Plan Ahead.</h1> */}
          <h1 className="plan-ahead">Your daily food, handled.</h1>
           {/* <h1 className="plan-ahead">Category-leading ₹9 flat delivery.</h1> */}
          {/* <span className="bullet">•</span>  */}
          <p className="sub-heading">
            No daily decisions.<span>&nbsp;</span>
             No cooking effort.<span>&nbsp;</span> 
              No surprise costs.
          </p>
          {/* <h2 className="confirm-before">Your daily food,handled.</h2> */}
        </div>

        {/* Features List */}
        {/* <div className="features-list">
          <div className="feature-item">
            <FaCheck color="#6B8E23" />
            <span className="feature-text">No <span className="">subscription</span>.</span>
          </div>

          <div className="feature-item">
            <FaCheck color="#6B8E23" />
            <span className="feature-text">
              Affordable prices for daily use.
            </span>
          </div>

          <div className="feature-item">
            <FaCheck color="#6B8E23" />
            <span className="feature-text">
              Food is cooked fresh <span className="">after confirmation.</span>
            </span>
          </div>

          <div className="feature-item">
            <FaCheck color="#6B8E23" />
            <span className="feature-text">
              Delivery included.
            </span>
          </div>
        </div> */}

        {/* Offer Section with Animation */}
        {/* <div className={`offer-section ${showOffer ? "offer-visible" : ""}`}>
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
        </div> */}
      </div>
    </div>
  );
};

export default CookingPromo;
