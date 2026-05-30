import { useNavigate } from "react-router-dom";
import { ShoppingBasket, IndianRupee, ChefHat, ShieldCheck } from "lucide-react";
import "./WelcomeInfoModal.css";

const WelcomeInfoModal = ({ isOpen }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGotIt = () => {
    navigate("/home");
  };

  return (
    <div className="wim-overlay">
      <div className="wim-backdrop" />
      <div className="wim-sheet">
        {/* Drag handle */}
        <div className="wim-handle" />

        {/* Title */}
        <h2 className="wim-title">
          Home food.
          <br />
          Without the cooking.
        </h2>

        {/* Subtitle */}
        <span className="wim-subtitle">
          Fresh ingredients. Cooked from scratch. Hot and ready — every single day.
        </span>

        {/* Feature list */}
        <div className="wim-features">
          <div className="wim-feature-item">
            <div className="wim-feature-icon wim-icon-green">
               <ShoppingBasket size={20} strokeWidth={2} /> 
            </div>
            <div className="wim-feature-text">
              <p className="wim-feature-title">Sourced fresh. Every single day.</p>
              <p className="wim-feature-desc">
                Mandi vegetables at 5 AM. Meat 2 hours before it's cooked. Not a single shortcut.
              </p>
            </div>
          </div>

          <div className="wim-feature-item">
            <div className="wim-feature-icon wim-icon-orange">
              <IndianRupee size={20} strokeWidth={2} />
            </div>
            <div className="wim-feature-text">
              <p className="wim-feature-title">
                Less than cooking yourself.
              </p>
              <p className="wim-feature-desc">
                No groceries to buy. No cooking time lost. No vessels to scrub. Just food that's ready.
              </p>
            </div>
          </div>

          <div className="wim-feature-item">
            <div className="wim-feature-icon wim-icon-pink">
              <ChefHat size={20} strokeWidth={2} />
            </div>
            <div className="wim-feature-text">
              <p className="wim-feature-title">The way your mother would cook it.</p>
              <p className="wim-feature-desc">
                No preservatives. No food colours. No tasting powder. No old oil. Never oily.
              </p>
            </div>
          </div>

          <div className="wim-feature-item">
            <div className="wim-feature-icon wim-icon-blue">
              <ShieldCheck size={20} strokeWidth={2} />
            </div>
            <div className="wim-feature-text">
              <p className="wim-feature-title">Cancel anytime. No questions.</p>
              <p className="wim-feature-desc">
                Up to 10 free cancellations. Plans change — we get it.
              </p>
            </div>
          </div>
        </div>

        {/* Promo banner */}
        <div className="wim-promo-banner">
          <div className="wim-promo-left">
            <p className="wim-promo-title">Your first 3 meals at ₹10</p>
            <p className="wim-promo-desc">
              3 discounted dishes · one per session · New users only · 
            </p>
          </div>
          <div className="wim-promo-price">₹10</div>
        </div>

        {/* Got it button */}
        <button className="wim-got-it-btn" onClick={handleGotIt}>
          See what's cooking →
        </button>
      </div>
    </div>
  );
};

export default WelcomeInfoModal;
