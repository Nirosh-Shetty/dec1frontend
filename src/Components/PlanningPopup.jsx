import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../Styles/PlanningPopup.css";
import discountImg from '../../src/assets/myplandiscount.png'

const PlanningPopup = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup every time Home component loads
    setShow(true);
  }, []);

  const handleClose = () => setShow(false);
  const handleUnderstand = () => setShow(false);

  const handleKnowMore = () => {
    navigate("/lunch-dinner-plans");
    setShow(false);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
      className="planning-popup-modal"
    >
      <Modal.Body className="planning-popup-body">
        <div className="planning-popup-container">
          {/* Header - Yellow background, edge to edge */}
          <div className="planning-popup-header">
            <h3 className="planning-popup-title">Starting Sunday, Jan 11th evening  </h3>
          </div>

          {/* Subtitle Section with cream background */}
          <div className="planning-popup-subtitle-section">
            <h4 className="planning-popup-subtitle">
              DailyDish will work on planning, not last-minute orders
            </h4>
          </div>

          {/* Main Content - White background */}
          <div className="planning-popup-content">
            {/* Steps */}
            <div className="planning-steps">
              <div className="planning-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5 className="step-title">Plan meals ahead</h5>
                  <p className="step-description">
                    Pick lunch AND and dinner for upcoming days
                  </p>
                  <p className="step-time">Takes ~2mins</p>
                </div>
              </div>

              <div className="planning-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5 className="step-title">Confirm when you're sure</h5>
                  <p className="step-description">
                    Make sure to do it before the cut-offs
                  </p>
                  <p className="step-subtitle">
                    We prepare exactly what you need
                  </p>
                </div>
              </div>

              <div className="planning-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5 className="step-title">Delivered on-time</h5>
                  <p className="step-description">
                    Lunch <strong>12:15–1:00 PM</strong> • Dinner{" "}
                    <strong>7:30–8:30 PM</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Launch Offer Section */}
            <div className="launch-offer-section">
              <div className="launch-offer-header">
                <img
                  src={discountImg}
                  alt="Launch offer"
                  className="launch-offer-icon"
                />
                <span className="launch-offer-title">Launch offer</span>
              </div>
              <p className="launch-offer-text">
                Your first 3 plans get <span className="fw-bold">₹50</span> off each (₹150 in savings)
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="planning-popup-footer">
            <button className="know-more-btn" onClick={handleKnowMore}>
              Know More
            </button>
            <button className="understand-btn" onClick={handleUnderstand}>
              I understand
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PlanningPopup;
