"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "react-bootstrap"
import "./../Styles/OnboardScreen.css"

import slide1_1 from "../assets/1.1.png"
import slide1_2 from "../assets/1.2.png"
import slide2_1 from "../assets/2.1.png"
import slide2_2 from "../assets/2.2.png"
import slide3_1 from "../assets/3.1.png"
import slide3_2 from "../assets/3.2.png"
import leftarrow from "./../assets/leftarrow.png"
import rightarrow from "./../assets/rightarrow.png"
import { Colors } from "../Helper/themes"

const OnboardScreen = () => {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const slides = [
    {
      id: 1,
      title: "Plan once & relax",
      bodyLine1: "Pick meals when you have a minute.",
      bodyLine2: "Food sorted before your day even begins.",
      image: slide1_2,
      topImage: slide1_1,
      layout: "column",
    },
    {
      id: 2,
      title: "No subscription stress",
      bodyLine1: "Pay, cancel, or skip up to an hour before delivery.",
      bodyLine2: "Confirm only when your day is clear.",
      image: slide2_2,
      topImage: slide2_1,
      layout: "stack",
    },
    {
      id: 3,
      title: "Save Everyday",
      bodyLine1: "Get lower prices when you pre‑order at least 6 hours in advance.",
      bodyLine2: "Or pay full price if you confirm an hour before, it's up to you.",
      image: slide3_2,
      topImage: slide3_1,
      layout: "background",
    },
  ]

  const handlePrev = () => {
    if (activeIndex > 0 && !isAnimating) {
      setIsAnimating(true)
      setActiveIndex(activeIndex - 1)
      // Reset animation state after transition
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  const handleNext = () => {
    if (activeIndex < slides.length - 1 && !isAnimating) {
      setIsAnimating(true)
      setActiveIndex(activeIndex + 1)
      // Reset animation state after transition
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  const handleGetStarted = () => {
    navigate('/location')
  }

  return (
    <div className="onboard-wrapper" style={{ backgroundColor: Colors.appForeground }}>
      <div className="onboard-container">
        <div className="onboard-carousel">
          <div className="carousel-fade">
            {slides.map((slide, index) => (
              <div 
                key={slide.id} 
                className={`carousel-item onboard-slide ${index === activeIndex ? 'active' : ''}`}
                style={{
                  opacity: index === activeIndex ? 1 : 0,
                  transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: index === activeIndex ? 'relative' : 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  display: index === activeIndex ? 'block' : 'none'
                }}
              >
                <div className="onboard-card">
                  <div
                    className={`onboard-illustration-wrapper layout-${slide.layout}`}
                    style={{
                      backgroundColor: slide.layout === "background" ? "transparent" : Colors.greenCardamom,
                      backgroundImage: slide.layout === "background" ? `url(${slide.topImage})` : "none",
                      backgroundSize: slide.layout === "background" ? "cover" : "initial",
                      backgroundPosition: slide.layout === "background" ? "center" : "initial",
                    }}
                  >
                    {slide.layout === "column" && (
                      <>
                        <img src={slide.topImage || "/placeholder.svg"} alt="" className="slide-image slide-1-top" />
                        <img
                          src={slide.image || "/placeholder.svg"}
                          alt={slide.title}
                          className="slide-image slide-1-bottom"
                        />
                      </>
                    )}
                    {slide.layout === "stack" && (
                      <>
                        <img src={slide.topImage || "/placeholder.svg"} alt="" className="slide-image slide-2-top" />
                        <img
                          src={slide.image || "/placeholder.svg"}
                          alt={slide.title}
                          className="slide-image slide-2-bottom"
                        />
                      </>
                    )}
                    {slide.layout === "background" && (
                      <img
                        src={slide.image || "/placeholder.svg"}
                        alt={slide.title}
                        className="slide-image slide-3-overlay"
                      />
                    )}
                  </div>

                  <div className="onboard-bottom-panel" style={{ backgroundColor: Colors.appForeground }}>
                    <div className="onboard-indicator-container">
                      <div 
                        className="onboard-indicator" 
                        style={{ 
                          backgroundColor: Colors.turmericGolden,
                          transform: `translateX(${activeIndex * 100}%)`
                        }} 
                      />
                    </div>
                    <h4 className="onboard-title" style={{ color: Colors.greenCardamom }}>
                      {slide.title}
                    </h4>
                    <p className="onboard-body" >
                      {slide.bodyLine1}
                    </p>
                    <p className="onboard-body" >
                      {slide.bodyLine2}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="onboard-actions-fixed">
          {activeIndex > 0 && (
            <Button
              variant="link"
              className="onboard-arrow-btn onboard-arrow-left"
              onClick={handlePrev}
              disabled={isAnimating}
              style={{ backgroundColor: Colors.cuminBrown }}
            >
              <img src={leftarrow || "/placeholder.svg"} alt="Previous" />
            </Button>
          )}
          {activeIndex < slides.length - 1 ? (
            <Button
              variant="link"
              className={`onboard-arrow-btn onboard-arrow-right ${activeIndex === 0 ? 'single-button' : ''}`}
              onClick={handleNext}
              disabled={isAnimating}
              style={{ backgroundColor: Colors.cuminBrown }}
            >
              <img src={rightarrow || "/placeholder.svg"} alt="Next" />
            </Button>
          ) : (
            <Button
              variant="link"
              className="onboard-arrow-btn onboard-arrow-right"
              onClick={handleGetStarted}
              style={{ backgroundColor: Colors.cuminBrown }}
            >
              <img src={rightarrow || "/placeholder.svg"} alt="Get Started" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OnboardScreen