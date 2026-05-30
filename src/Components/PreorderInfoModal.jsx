import "./PreorderInfoModal.css";

/**
 * PreorderInfoModal
 * Bottom-sheet modal explaining why orders are pre-order (not 30-min delivery).
 * Colors sourced from themes.jsx (Colors, Typography).
 */
const PreorderInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="pim-overlay">
      {/* Backdrop — click outside to close */}
      <div className="pim-backdrop" onClick={onClose} />

      <div className="pim-sheet">
        {/* Drag handle */}
        <div className="pim-handle" />

        {/* Title */}
        <h2 className="pim-title">
          What you're about to order cannot be cooked and delivered in 30
          minutes.
        </h2>

        {/* Divider */}
        <div className="pim-divider" />

        {/* Feature cards */}
        <div className="pim-features">
          {/* Card 1 — Fresh ingredients */}
          <div className="pim-feature-card">
            <div className="pim-feature-header">
              <span className="pim-feature-emoji">🌿</span>
              <p className="pim-feature-title">
                Fresh ingredients. Cooked from scratch.
              </p>
            </div>
            <p className="pim-feature-desc">
              Everything is bought after your order is confirmed, used the same
              day and gone by end of day — no ready gravies, no leftovers from
              the past.
            </p>

            {/* Freshness arrival table */}
            <div className="pim-freshness-table">
              <div className="pim-freshness-divider" />
              <div className="pim-freshness-header">
                <span className="pim-freshness-label">Arrives at kitkchen</span>
              </div>
              <div className="pim-freshness-row">
                <span className="pim-freshness-item">Veggies, dairy &amp; eggs</span>
                <span className="pim-freshness-time">5:00 AM</span>
              </div>
              <div className="pim-freshness-row">
                <span className="pim-freshness-item">Meat</span>
                <span className="pim-freshness-time">2 hrs before cooking</span>
              </div>
            </div>
          </div>

          {/* Card 2 — Fresh oil */}
          <div className="pim-feature-card">
            <div className="pim-feature-header">
              <span className="pim-feature-emoji">🫙</span>
              <p className="pim-feature-title">Fresh oil. Every dish. Every time.</p>
            </div>
            <p className="pim-feature-desc">
              We know exactly what's ordered, so we use only what's needed — never reheated, never old oil.
            </p>
          </div>

          {/* Card 3 — Affordable */}
          <div className="pim-feature-card">
            <div className="pim-feature-header">
              <span className="pim-feature-emoji">💰</span>
              <p className="pim-feature-title">As affordable as cooking at home.</p>
            </div>
            <p className="pim-feature-desc">
              We cook only what's ordered — less waste, lower costs, better price for you.
            </p>
          </div>

          {/* Card 4 — Cancellation */}
          <div className="pim-feature-card">
            <div className="pim-feature-header">
              <span className="pim-feature-emoji">🛡️</span>
              <p className="pim-feature-title">Plans change? Cancel before delivery.</p>
            </div>
            <p className="pim-feature-desc">
              Up to 10 free cancellations. No questions asked.
            </p>
          </div>
        </div>

        {/* Quality badges */}
        <div className="pim-quality-section">
          <p className="pim-quality-label">Every dish. Every order.</p>
          <p className="pim-quality-badges">
            ✅ No food colours &nbsp;·&nbsp; ✅ No MSG &nbsp;·&nbsp; ✅ Never oily
          </p>
        </div>

        {/* Closing statement */}
        <div className="pim-closing">
          <p className="pim-closing-text">
            Pre-ordering isn't a wait.
            <br />
            It's what makes your food fresher than anything you've ordered
            before.
          </p>
        </div>

        {/* CTA button */}
        <button className="pim-cta-btn" onClick={onClose}>
          Yes, cook it right for me
        </button>
      </div>
    </div>
  );
};

export default PreorderInfoModal;
