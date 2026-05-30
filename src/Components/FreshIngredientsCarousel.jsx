import { useState, useEffect, useRef } from "react";
import {
  Leaf,
  CookingPot,
  BadgeDollarSign,
  SquareCheckBig,
} from "lucide-react";

const carouselData = [
  {
    title: "Fresh every meal.",
    description:
      "Veggies sourced at 5AM. Meat 2 hours before cooking.",
    icon: <Leaf size={24} color="white" />,
  },
  {
    title: "Cooking like home, every time.",
    description:
      "No added colours. No MSG. Never oily",
    icon: <CookingPot size={24} color="white" />,
  },
  {
    title: "Cheaper than cooking yourself.",
    description:
      "Groceries + gas + your time. We're cheaper.",
    icon: <BadgeDollarSign size={24} color="white" />,
  },
  {
    title: "Cancel anytime. No questions.",
    description:
      "Up to 10 free cancellations. No charges.",
    icon: <SquareCheckBig size={24} color="white" />,
  },
];

const TOTAL = carouselData.length;

// Left-to-right infinite loop strategy:
// DOM order: [clone of last] [slide0] [slide1] [slide2]
// We start at visualIndex=1 (showing slide0, offset = -1*100%).
// Each tick we DECREASE the offset (move track right → content enters from left).
// When visualIndex reaches 0 (showing clone of last), we snap to visualIndex=TOTAL (real last slide).
const FreshIngredientsCarousel = () => {
  // visualIndex: position in the extended array [clone-of-last, slide0, slide1, slide2]
  // starts at 1 so we're showing slide0
  const [visualIndex, setVisualIndex] = useState(1);
  const [animated, setAnimated] = useState(true);
  const timerRef = useRef(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setAnimated(true);
      setVisualIndex((prev) => prev - 1); // move right → content slides in from left
    }, 3500);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  // When we land on the clone at position 0, snap to the real last slide
  useEffect(() => {
    if (visualIndex !== 0) return;
    const snap = setTimeout(() => {
      setAnimated(false);
      setVisualIndex(TOTAL); // real last slide is at index TOTAL in extended array
    }, 450);
    return () => clearTimeout(snap);
  }, [visualIndex]);

  // Re-enable animation one frame after the silent snap
  useEffect(() => {
    if (animated) return;
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, [animated]);

  return (
    <div className="fresh-carousel-wrapper">
      <style>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        .fresh-carousel-wrapper {
          max-width: 657px;
          width: 100%;
          margin: 0 auto;
          overflow: hidden;
        }

        .fresh-carousel-card {
          background: transparent;
          overflow: hidden;
          width: 100%;
          border-radius: 0 0 40px 40px;
        }

        .fresh-carousel-track-outer {
          overflow: hidden;
          width: 100%;
        }

        .fresh-carousel-track {
          display: flex;
          will-change: transform;
          width: 100%;
        }

        .fresh-carousel-slide {
          min-width: 100%;
          width: 100%;
          flex-shrink: 0;
          overflow: hidden;
        }

        .fresh-ingredients-section {
          background-color: #3d6701;
          padding: 16px 20px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          height: auto;
          min-height: 120px;
          width: 100%;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          border-radius: 0 0 40px 40px;
          overflow: hidden;
        }

        .fresh-ingredients-content {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          min-width: 0;
        }

        .fresh-icon-wrapper {
          width: 50px;
          height: 50px;
          min-width: 50px;
          background-color: #54811f;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .fresh-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .fresh-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .fresh-title {
          font-size: 17px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.2px;
          line-height: 1.3;
          white-space: normal;
          word-break: break-word;
        }

        .fresh-description {
          font-size: 13px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.4;
          letter-spacing: -0.1px;
          white-space: normal;
          word-break: break-word;
        }

        @media (max-width: 576px) {
          .fresh-ingredients-section {
            padding: 14px 16px;
            min-height: 110px;
            border-radius: 0 0 32px 32px;
          }
          .fresh-carousel-card {
            border-radius: 0 0 32px 32px;
          }
          .fresh-ingredients-content {
            gap: 12px;
          }
          .fresh-icon-wrapper {
            width: 44px;
            height: 44px;
            min-width: 44px;
          }
          .fresh-title {
            font-size: 15px;
          }
          .fresh-description {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .fresh-ingredients-section {
            padding: 12px 14px;
            min-height: 100px;
            border-radius: 0 0 28px 28px;
          }
          .fresh-carousel-card {
            border-radius: 0 0 28px 28px;
          }
          .fresh-ingredients-content {
            gap: 10px;
          }
          .fresh-icon-wrapper {
            width: 40px;
            height: 40px;
            min-width: 40px;
            border-radius: 10px;
          }
          .fresh-title {
            font-size: 14px;
          }
          .fresh-description {
            font-size: 11.5px;
            line-height: 1.35;
          }
        }

        @media (max-width: 320px) {
          .fresh-ingredients-section {
            padding: 10px 12px;
            min-height: 90px;
            border-radius: 0 0 20px 20px;
          }
          .fresh-carousel-card {
            border-radius: 0 0 20px 20px;
          }
          .fresh-ingredients-content {
            gap: 8px;
          }
          .fresh-icon-wrapper {
            width: 34px;
            height: 34px;
            min-width: 34px;
            border-radius: 8px;
          }
          .fresh-text {
            gap: 2px;
          }
          .fresh-title {
            font-size: 12.5px;
            letter-spacing: 0;
          }
          .fresh-description {
            font-size: 10.5px;
            line-height: 1.3;
          }
        }
      `}</style>

      <div className="fresh-carousel-card">
        <div className="fresh-carousel-track-outer">
          {/*
            DOM order: [clone-of-last] [slide0] [slide1] [slide2]
            visualIndex starts at 1 (showing slide0).
            Each tick decreases visualIndex → track moves right → content enters from the LEFT.
            When visualIndex hits 0 (clone-of-last visible), snap to TOTAL (real last slide).
          */}
          <div
            className="fresh-carousel-track"
            style={{
              transform: `translateX(-${visualIndex * 100}%)`,
              transition: animated ? "transform 0.45s ease-in-out" : "none",
            }}
          >
            {/* Clone of last slide prepended for seamless wrap */}
            <div className="fresh-carousel-slide" key="clone">
              <SlideContent item={carouselData[TOTAL - 1]} />
            </div>
            {/* Real slides in correct order */}
            {carouselData.map((item, idx) => (
              <div className="fresh-carousel-slide" key={idx}>
                <SlideContent item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SlideContent = ({ item }) => (
  <div className="fresh-ingredients-section">
    <div className="fresh-ingredients-content">
      <div className="fresh-icon-wrapper">
        <div className="fresh-icon">{item.icon}</div>
      </div>
      <div className="fresh-text">
        <span className="fresh-title">{item.title}</span>
        <span className="fresh-description">{item.description}</span>
      </div>
    </div>
  </div>
);

export default FreshIngredientsCarousel;