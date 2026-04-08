// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";

// const UserBanner = () => {
//   const [banners, setBanners] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentSlide, setCurrentSlide] = useState(0);

//   // Touch/swipe handling
//   const [touchStart, setTouchStart] = useState(null);
//   const [touchEnd, setTouchEnd] = useState(null);
//   const minSwipeDistance = 50;

//   // Fetch banners on component mount
//   useEffect(() => {
//     const fetchBanners = async () => {
//       try {
//         const res = await axios.get("http://localhost:7013/api/admin/banners");
//         if (res.status === 200) {
//           const bannerData = res.data.getbanner || [];
//           setBanners(
//             bannerData.filter((banner) => banner._id && banner.BannerImage),
//           );
//         }
//       } catch (error) {
//         console.error("Error fetching banners:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBanners();
//   }, []);

//   // Auto-slide functionality
//   useEffect(() => {
//     if (banners.length <= 1) return;

//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % banners.length);
//     }, 4000);

//     return () => clearInterval(interval);
//   }, [banners.length]);

//   // Touch handlers for swipe functionality
//   const onTouchStart = (e) => {
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//   };

//   const onTouchMove = (e) => {
//     setTouchEnd(e.targetTouches[0].clientX);
//   };

//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) return;

//     const distance = touchStart - touchEnd;
//     const isLeftSwipe = distance > minSwipeDistance;
//     const isRightSwipe = distance < -minSwipeDistance;

//     if (isLeftSwipe && banners.length > 1) {
//       // Swipe left - next slide
//       setCurrentSlide((prev) => (prev + 1) % banners.length);
//     }
//     if (isRightSwipe && banners.length > 1) {
//       // Swipe right - previous slide
//       setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
//     }
//   };

//   if (loading || banners.length === 0) return null;

//   // If only 1 banner, use simple version
//   if (banners.length === 1) {
//     return (
//       <div
//         className="container-fluid p-0 d-block user-banner-single"
//         style={{
//           maxWidth: "576px",
//           margin: "0 auto",
//           padding: "10px 16px",
//           marginBottom: "10px",
//         }}
//       >
//         <style>
//           {`
//             /* Tablet styles for single banner */
//             @media screen and (min-width: 800px) and (max-width: 900px) {
//               .user-banner-single {
//                 max-width: 100% !important;
//                 margin: 0 auto !important;
//                 padding: 12px 20px !important;
//                 margin-bottom: 12px !important;
//               }

//               .user-banner-single .banner-container {
//                 border-radius: 18px !important;
//                 border: 6px solid #cccccc !important;
//                 height: 240px !important;
//               }
//             }
//           `}
//         </style>
//         <Link to="/lunch-dinner-plans" style={{ textDecoration: "none" }}>
//           <div
//             className="banner-container"
//             style={{
//               borderRadius: "15px",
//               overflow: "hidden",
//               // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
//               border: "5px solid #cccccc",
//               height: "200px",
//               position: "relative",
//             }}
//           >
//             <div
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 backgroundImage: `url(${banners[0].BannerImage})`,
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 backgroundRepeat: "no-repeat",
//               }}
//             >
//               <div
//                 style={{
//                   position: "absolute",
//                   top: 0,
//                   left: 0,
//                   right: 0,
//                   bottom: 0,
//                   background:
//                     "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.1))",
//                 }}
//               />
//             </div>
//           </div>
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="container-fluid p-0 d-block user-banner-container"
//       style={{
//         maxWidth: "576px",
//         margin: "0 auto",
//         padding: "10px 16px",
//         marginBottom: "10px",
//       }}
//     >
//       <style>
//         {`
//           /* Custom carousel styles */
//           .custom-carousel {
//             position: relative;
//             border-radius: 15px;
//             overflow: hidden;
//             // box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
//             border: 5px solid #cccccc;
//             height: 200px;
//             touch-action: pan-y pinch-zoom;
//           }

//           /* Tablet container styles */
//           @media screen and (min-width: 800px) and (max-width: 900px) {
//             .user-banner-container {
//               max-width: 100% !important;
//               margin: 0 auto !important;
//               padding: 12px 20px !important;
//               margin-bottom: 12px !important;
//             }
//           }

//           .custom-carousel-slide {
//             position: absolute;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             opacity: 0;
//             transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
//             background-size: cover;
//             background-position: center;
//             background-repeat: no-repeat;
//           }

//           .custom-carousel-slide.active {
//             opacity: 1;
//           }

//           .custom-carousel-indicators {
//             position: absolute;
//             bottom: 15px;
//             left: 0;
//             right: 0;
//             display: flex;
//             justify-content: center;
//             gap: 10px;
//             z-index: 10;
//           }

//           .custom-indicator {
//             width: 12px;
//             height: 12px;
//             border-radius: 50%;
//             background-color: rgba(255, 255, 255, 0.6);
//             border: 2px solid rgba(255, 255, 255, 0.8);
//             padding: 0;
//             cursor: pointer;
//             transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
//           }

//           .custom-indicator:hover {
//             transform: scale(1.2);
//             background-color: rgba(255, 255, 255, 0.9);
//           }

//           .custom-indicator.active {
//             transform: scale(1.4);
//             background-color: #6B8E23;
//             border-color: #8BAB42;
//             box-shadow: 0 0 10px rgba(107, 142, 35, 0.7);
//           }

//           /* Mobile styles */
//           @media (max-width: 576px) {
//             .custom-carousel {
//               height: 140px;
//             }
//           }

//           /* Tablet styles for 820x1120 resolution */
//           @media screen and (min-width: 800px) and (max-width: 900px) {
//             .custom-carousel {
//               position: relative;
//               border-radius: 18px;
//               overflow: hidden;
//               border: 6px solid #cccccc;
//               height: 240px;
//               touch-action: pan-y pinch-zoom;
//             }

//             .custom-carousel-slide {
//               position: absolute;
//               top: 0;
//               left: 0;
//               width: 100%;
//               height: 100%;
//               opacity: 0;
//               transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
//               background-size: cover;
//               background-position: center;
//               background-repeat: no-repeat;
//             }

//             .custom-carousel-indicators {
//               position: absolute;
//               bottom: 18px;
//               left: 0;
//               right: 0;
//               display: flex;
//               justify-content: center;
//               gap: 12px;
//               z-index: 10;
//             }

//             .custom-indicator {
//               width: 14px;
//               height: 14px;
//               border-radius: 50%;
//               background-color: rgba(255, 255, 255, 0.6);
//               border: 2px solid rgba(255, 255, 255, 0.8);
//               padding: 0;
//               cursor: pointer;
//               transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
//             }

//             .custom-indicator:hover {
//               transform: scale(1.3);
//               background-color: rgba(255, 255, 255, 0.9);
//             }

//             .custom-indicator.active {
//               transform: scale(1.5);
//               background-color: #6B8E23;
//               border-color: #8BAB42;
//               box-shadow: 0 0 12px rgba(107, 142, 35, 0.8);
//             }
//           }
//         `}
//       </style>

//       {/* Custom carousel version without animation */}
//       <div
//         className="custom-carousel"
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//       >
//         {banners.map((banner, index) => (
//           <div
//             key={banner._id}
//             className={`custom-carousel-slide ${
//               index === currentSlide ? "active" : ""
//             }`}
//           >
//             <Link
//               to="/lunch-dinner-plans"
//               style={{
//                 display: "block",
//                 width: "100%",
//                 height: "100%",
//               }}
//             >
//               <div
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.15)), url(${banner.BannerImage})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                   backgroundRepeat: "no-repeat",
//                 }}
//               >
//                 {/* Optional overlay for better text readability if you add text later */}
//                 <div
//                   style={{
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     background:
//                       "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.05))",
//                   }}
//                 />
//               </div>
//             </Link>
//           </div>
//         ))}

//         <div className="custom-carousel-indicators">
//           {banners.map((_, index) => (
//             <button
//               key={index}
//               className={`custom-indicator ${
//                 index === currentSlide ? "active" : ""
//               }`}
//               onClick={() => setCurrentSlide(index)}
//               aria-label={`Go to slide ${index + 1}`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserBanner;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const UserBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  // Fetch banners on component mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get("http://localhost:7013/api/admin/banners");
        if (res.status === 200) {
          const bannerData = res.data.getbanner || [];
          setBanners(
            bannerData.filter((banner) => banner._id && banner.BannerImage),
          );
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Touch handlers for swipe functionality
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && banners.length > 1) {
      // Swipe left - next slide
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }
    if (isRightSwipe && banners.length > 1) {
      // Swipe right - previous slide
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  if (loading || banners.length === 0) return null;

  // Common styles for both cases
  const commonStyles = `
    /* Mobile styles */
    .user-banner-wrapper {
      max-width: 576px;
      margin: 0 auto;
      padding: 10px 16px;
      margin-bottom: 10px;
    }
    
    .banner-container {
      border-radius: 15px;
      overflow: hidden;
      border: 5px solid #cccccc;
      height: 200px;
      position: relative;
      touch-action: pan-y pinch-zoom;
    }
    
    /* Tablet styles */
    @media screen and (min-width: 800px) and (max-width: 900px) {
      .user-banner-wrapper {
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 12px 20px !important;
        margin-bottom: 12px !important;
      }
      
      .banner-container {
        border-radius: 18px !important;
        border: 6px solid #cccccc !important;
        height: 240px !important;
      }
    }
    
    /* Mobile height adjustment */
    @media (max-width: 576px) {
      .banner-container {
        height: 140px;
      }
    }
  `;

  // If only 1 banner
  if (banners.length === 1) {
    return (
      <>
        <style>{commonStyles}</style>
        <div className="container-fluid p-0 user-banner-wrapper">
          <Link to="/lunch-dinner-plans" style={{ textDecoration: "none" }}>
            <div className="banner-container">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${banners[0].BannerImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.1))",
                  }}
                />
              </div>
            </div>
          </Link>
        </div>
      </>
    );
  }

  // For multiple banners
  const carouselStyles = `
    ${commonStyles}
    
    /* Custom carousel styles */
    .custom-carousel-slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .custom-carousel-slide.active {
      opacity: 1;
    }

    .custom-carousel-indicators {
      position: absolute;
      bottom: 15px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 10px;
      z-index: 10;
    }

    .custom-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.6);
      border: 2px solid rgba(255, 255, 255, 0.8);
      padding: 0;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .custom-indicator:hover {
      transform: scale(1.2);
      background-color: rgba(255, 255, 255, 0.9);
    }

    .custom-indicator.active {
      transform: scale(1.4);
      background-color: #6B8E23;
      border-color: #8BAB42;
      box-shadow: 0 0 10px rgba(107, 142, 35, 0.7);
    }

    /* Tablet adjustments for carousel indicators */
    @media screen and (min-width: 800px) and (max-width: 900px) {
      .custom-carousel-indicators {
        bottom: 18px;
        gap: 12px;
      }

      .custom-indicator {
        width: 14px;
        height: 14px;
      }

      .custom-indicator:hover {
        transform: scale(1.3);
      }

      .custom-indicator.active {
        transform: scale(1.5);
        box-shadow: 0 0 12px rgba(107, 142, 35, 0.8);
      }
    }
  `;

  return (
    <>
      <style>{carouselStyles}</style>
      <div className="container-fluid p-0 user-banner-wrapper">
        {/* Custom carousel version without animation */}
        <div
          className="banner-container"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`custom-carousel-slide ${
                index === currentSlide ? "active" : ""
              }`}
            >
              <Link
                to="/lunch-dinner-plans"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.15)), url(${banner.BannerImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {/* Optional overlay for better text readability if you add text later */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.05))",
                    }}
                  />
                </div>
              </Link>
            </div>
          ))}

          <div className="custom-carousel-indicators">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`custom-indicator ${
                  index === currentSlide ? "active" : ""
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBanner;
