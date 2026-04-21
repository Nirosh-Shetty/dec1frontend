import { useState } from "react";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Icons as inline SVGs
const HomeCookedIcon = () => (
  <svg
    width="34"
    height="36"
    viewBox="0 0 34 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M28 12H6C4.89543 12 4 12.8954 4 14V30C4 31.1046 4.89543 32 6 32H28C29.1046 32 30 31.1046 30 30V14C30 12.8954 29.1046 12 28 12Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#54811F"
    />
    <path
      d="M22 8L17 4L12 8"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle
      cx="17"
      cy="22"
      r="4"
      stroke="white"
      strokeWidth="2"
      fill="#3D6701"
    />
    <path
      d="M17 18V20M17 24V26"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M15 22H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const DoorstepIcon = () => (
  <svg
    width="34"
    height="36"
    viewBox="0 0 34 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 10L17 4L30 10V28C30 29.1046 29.1046 30 28 30H6C4.89543 30 4 29.1046 4 28V10Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#54811F"
    />
    <path
      d="M12 30V18H22V30"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M17 22H17.01"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="8" cy="14" r="1.5" fill="white" stroke="white" />
    <circle cx="26" cy="14" r="1.5" fill="white" stroke="white" />
  </svg>
);

const FreshSourcedIcon = () => (
  <svg
    width="34"
    height="36"
    viewBox="0 0 34 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 4L19.5 9.5L25.5 10L21 14.5L22.5 20L17 17L11.5 20L13 14.5L8.5 10L14.5 9.5L17 4Z"
      fill="#54811F"
      stroke="white"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M17 17V28" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M12 24L17 28L22 24"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="17" cy="13" r="1.5" fill="white" />
  </svg>
);

const FreshIngredientsCarousel = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const togglePause = () => {
    setPaused((p) => !p);
  };

  const carouselData = [
    {
      title: "Cooked like home, every time",
      description:
        "Made fresh by our kitchen team. No reheating. No preservatives. Just real food.",
      icon: <HomeCookedIcon />,
    },
    {
      title: "On your doorstep, on the dot",
      description:
        "Breakfast 7 AM · Lunch 12 PM · Dinner 7 PM — free delivery, always.",
      icon: <DoorstepIcon />,
    },
    {
      title: "Sourced fresh at 5 AM tomorrow",
      description:
        "We buy ingredients only after you order — nothing sits in storage overnight.",
      icon: <FreshSourcedIcon />,
    },
  ];

  return (
    <div className="fresh-carousel-wrapper">
      <style jsx>{`
        .fresh-carousel-wrapper {
          max-width: 613px;
          width: 100%;
          margin: 0 auto;
        }

        .fresh-carousel-card {
          background: transparent;
          overflow: hidden;
        }

        /* Original fresh-ingredients-section style */
        .fresh-ingredients-section {
          background-color: #3d6701;
          padding: 16px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          height: auto;
          min-height: 147.5px;
          width: 100%;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .fresh-ingredients-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          max-width: 100%;
        }

        .fresh-icon-wrapper {
          width: 50px;
          height: 50px;
          background-color: #54811f;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .fresh-icon {
          width: 34px;
          height: 36px;
          object-fit: contain;
          display: block;
        }

        .fresh-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .fresh-title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.2px;
          line-height: 1.3;
        }

        .fresh-description {
          font-size: 14px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.4;
          letter-spacing: -0.1px;
        }

        /* Carousel custom styles - clean and fresh */
        .custom-carousel :global(.carousel-control-prev),
        .custom-carousel :global(.carousel-control-next) {
          width: 40px;
          height: 40px;
          background: rgba(61, 103, 1, 0.85);
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.9;
          transition: all 0.2s ease;
        }

        .custom-carousel :global(.carousel-control-prev) {
          left: 12px;
        }

        .custom-carousel :global(.carousel-control-next) {
          right: 12px;
        }

        .custom-carousel :global(.carousel-control-prev:hover),
        .custom-carousel :global(.carousel-control-next:hover) {
          background: #3d6701;
          opacity: 1;
        }

        .custom-carousel :global(.carousel-indicators) {
          display: none;
        }

        /* Custom indicator row */
        .carousel-indicator-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          padding: 0 16px 12px;
          background-color: #3d6701;
        }

        .carousel-pause-btn {
          background: none;
          border: none;
          padding: 0 4px 0 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 2.5px;
          opacity: 0.75;
        }

        .carousel-pause-btn:hover {
          opacity: 1;
        }

        .pause-bar {
          width: 2.5px;
          height: 11px;
          background-color: rgba(255, 255, 255, 0.75);
          border-radius: 2px;
        }

        .play-triangle {
          width: 0;
          height: 0;
          border-top: 5.5px solid transparent;
          border-bottom: 5.5px solid transparent;
          border-left: 9px solid rgba(255, 255, 255, 0.75);
        }

        .carousel-dot {
          height: 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          padding: 0;
        }

        .carousel-dot.active {
          width: 24px;
          background-color: #e6b800;
        }

        .carousel-dot.inactive {
          width: 16px;
          background-color: rgba(255, 255, 255, 0.35);
        }

        /* Mobile responsive overrides */
        @media (max-width: 480px) {
          .fresh-ingredients-section {
            padding: 14px 16px;
            min-height: 135px;
          }

          .fresh-ingredients-content {
            gap: 12px;
          }

          .fresh-icon-wrapper {
            width: 44px;
            height: 44px;
          }

          .fresh-icon svg {
            width: 28px;
            height: 30px;
          }

          .fresh-title {
            font-size: 16px;
          }

          .fresh-description {
            font-size: 13px;
          }

          .custom-carousel :global(.carousel-control-prev),
          .custom-carousel :global(.carousel-control-next) {
            width: 32px;
            height: 32px;
          }
        }

        @media (max-width: 380px) {
          .fresh-ingredients-content {
            gap: 10px;
          }

          .fresh-icon-wrapper {
            width: 40px;
            height: 40px;
          }

          .fresh-icon svg {
            width: 24px;
            height: 26px;
          }

          .fresh-text {
            gap: 2px;
          }

          .fresh-title {
            font-size: 14px;
          }

          .fresh-description {
            font-size: 11px;
          }
        }
      `}</style>

      <div className="fresh-carousel-card">
        <Carousel
          activeIndex={index}
          onSelect={handleSelect}
          interval={paused ? null : 5000}
          pause="hover"
          className="custom-carousel"
          indicators={false}
          controls={false}
        >
          {carouselData.map((item, idx) => (
            <Carousel.Item key={idx}>
              <div className="fresh-ingredients-section">
                <div className="fresh-ingredients-content">
                  <div className="fresh-icon-wrapper">
                    <div className="fresh-icon">{item.icon}</div>
                  </div>
                  <div className="fresh-text">
                    <span className="fresh-title">{item.title}</span>
                    <span className="fresh-description">
                      {item.description}
                    </span>
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>

        {/* Custom indicator row */}
        <div className="carousel-indicator-row">
          <button
            className="carousel-pause-btn"
            onClick={togglePause}
            aria-label={paused ? "Play" : "Pause"}
          >
            {paused ? (
              <span className="play-triangle" />
            ) : (
              <>
                <span className="pause-bar" />
                <span className="pause-bar" />
              </>
            )}
          </button>
          {carouselData.map((_, idx) => (
            <button
              key={idx}
              className={`carousel-dot ${idx === index ? "active" : "inactive"}`}
              onClick={() => setIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreshIngredientsCarousel;
