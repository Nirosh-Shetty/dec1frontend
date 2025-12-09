// import React, { useMemo, useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { faGoogle, faCcDiscover } from "@fortawesome/free-brands-svg-icons";
// import Logo from "../assets/logo-container.svg";
// // import LeafSvg from "../assets/leafbanana.svg";
// import { Colors } from "../Helper/themes";
// import "../Styles/LeafWithLogo.css";
// import Swal2 from "sweetalert2";
// import axios from "axios";
// import { faSpinner } from "@fortawesome/free-solid-svg-icons";
// import success from "./../assets/success-green.png";
// import tasty from "./../assets/tasty.png";

// const LOGO_BASE_W = 768;
// const LOGO_BASE_H = 475;
// const LOGO_PADDING = 32;

// export default function LeafWithLogo() {
//   const [screenW, setScreenW] = useState(window.innerWidth);
//   const navigate = useNavigate();
//   const [phone, setPhone] = useState("");
//   const [customerName, setCustomerName] = useState("");
//   const [loader, setLoader] = useState(false);
//   useEffect(() => {
//     const handleResize = () => setScreenW(Math.min(window.innerWidth, 400)); // Fixed to 400 for consistent mobile width
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user") || "null");

//     if (user) {
//       setTimeout(() => {
//         navigate("/home", { replace: true });
//       }, 200);
//     }
//   }, []);

//   // const location = useLocation();
//   const { referralCode } = useParams();
//   useEffect(() => {
//     // const params = new URLSearchParams(location.search);
//     // const referralCode = params.get("ref");

//     if (referralCode) {
//       localStorage.setItem("referralCode", referralCode);
//       console.log("Referral code captured:", referralCode);
//     }
//   }, []);
//   const headerVariants = {
//     hidden: { y: -100 },
//     visible: {
//       y: 0,
//       transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
//     },
//   };

//   // Fixed sizing for consistent mobile appearance
//   const containerWidth = 360; // Fixed container width
//   const leafWidth = Math.max(0, containerWidth - 24); // Always use container width, not screen width
//   const leafAR = useMemo(() => 1.5, []);
//   const leafHeight = Math.max(0, leafWidth / leafAR);
//   const logoMaxW = Math.max(0, leafWidth - 2 * LOGO_PADDING);
//   const logoMaxH = Math.max(0, leafHeight - 2 * LOGO_PADDING);
//   const scale = Math.min(logoMaxW / LOGO_BASE_W, logoMaxH / LOGO_BASE_H, 1);
//   const LOGO_W = Math.round(LOGO_BASE_W * scale);
//   const LOGO_H = Math.round(LOGO_BASE_H * scale);

//   const handleContinueAsGuest = () => {
//     // navigate("/home", { state: { phone: null, isVerified: false } });
//     window.location.replace("/home");
//   };

//   const handleOtpClick = async () => {
//     if (!customerName) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: `Please enter your full name.`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//       return;
//     }
//     if (!phone) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: `Please enter your phone number.`,

//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//       return;
//     }
//     const phoneRegex = /^\d{10}$/;
//     if (!phoneRegex.test(phone)) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: `Please enter a valid 10-digit phone number.`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//       //   alert("Please enter a valid 10-digit phone number.");
//       return;
//     }
//     setLoader(true);
//     try {
//       const config = {
//         url: "/User/Sendotp",
//         method: "post",
//         baseURL: "https://dd-merge-backend-2.onrender.com/api",

//         headers: { "content-type": "application/json" },
//         data: {
//           Mobile: phone,
//         },
//       };

//       const res = await axios(config);
//       if (res.status === 401) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Invalid Phone Number`,
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//       if (res.status === 402) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Error sending OTP`,
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//       if (res.status === 200) {
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "success",
//           title: `Hi ${customerName}, OTP sent successfully on your whatsapp number`,
//           showConfirmButton: false,
//           timer: 2000,
//           timerProgressBar: true,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//         setTimeout(() => {
//           setLoader(false);
//           navigate("/otp-varification", {
//             state: { phone, Fname: customerName },
//           });
//         }, 2000);
//       }
//     } catch (error) {
//       setLoader(false);
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response?.data?.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//       console.log("error", error.message);
//     }
//   };

//   const [currentTextIndex, setCurrentTextIndex] = useState(0);

//   // Text items for the animation
//   const textItems = [
//     "Fresh Menu Everyday",
//     "No Subscription Stress",
//     "Gut friendly, and yummy",
//     "Super Affordable",
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTextIndex((prevIndex) =>
//         prevIndex === textItems.length - 1 ? 0 : prevIndex + 1
//       );
//     }, 4000); // Change text every 4 seconds

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="login-container">
//       <motion.div
//         className="header-wrapper"
//         initial="hidden"
//         animate="visible"
//         variants={headerVariants}
//       >
//         <div className="login-header">
//           <div
//             className="logo-container"
//             style={{
//               width: leafWidth,
//               height: leafHeight,
//               position: "relative",
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 width: LOGO_W,
//                 height: LOGO_H,
//                 display: "flex",
//                 flexDirection: "column", // Change to column
//                 justifyContent: "center",
//                 alignItems: "center",
//                 gap: "0px", // Add spacing between image and text
//               }}
//             >
//               <img
//                 src={Logo}
//                 width={LOGO_W} // Use LOGO_W
//                 height={LOGO_H}
//                 alt="Logo"
//                 style={{
//                   maxWidth: "100%",
//                   maxHeight: "100%",
//                   objectFit: "contain",
//                 }}
//               />
//               <h3
//                 style={{
//                   margin: 0,
//                   textAlign: "center",
//                   color: "#fafafa",
//                   fontSize: "16px",
//                   fontFamily: "'Inter', sans-serif",
//                 }}
//               >
//                 Plan Food, Not Appetite
//               </h3>
//             </div>

//             <div
//               className="yellow-container"
//               style={{
//                 backgroundColor: "#FFD700", // Yellow color
//                 padding: "20px 0",
//                 margin: "20px 0",
//                 overflow: "hidden",
//                 position: "relative",
//                 height: "60px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={currentTextIndex}
//                   initial={{ x: "100vw", opacity: 0 }}
//                   animate={{
//                     x: "0%",
//                     opacity: 1,
//                     transition: {
//                       x: { duration: 1, ease: "easeOut" },
//                       opacity: { duration: 0.8 },
//                     },
//                   }}
//                   exit={{ x: "-100vw", opacity: 0 }}
//                   transition={{ duration: 0.8 }}
//                   style={{
//                     position: "absolute",
//                     whiteSpace: "nowrap",
//                     fontFamily: "'Inter', sans-serif",
//                     fontSize: "18px",
//                     fontWeight: "600",
//                     color: "#333",
//                     textAlign: "center",
//                   }}
//                 >
//                   {textItems[currentTextIndex]}
//                 </motion.div>
//               </AnimatePresence>

//               {/* Optional: Dots indicator */}
//               <div
//                 style={{
//                   position: "absolute",
//                   bottom: "5px",
//                   display: "flex",
//                   gap: "8px",
//                 }}
//               >
//                 {textItems.map((_, index) => (
//                   <div
//                     key={index}
//                     style={{
//                       width: "8px",
//                       height: "8px",
//                       borderRadius: "50%",
//                       backgroundColor:
//                         index === currentTextIndex ? "#333" : "#FFED99",
//                       transition: "background-color 0.3s",
//                     }}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//           {/* Yellow container with text animation */}
//         </div>
//       </motion.div>

//       {/* YELLOW CONTAINER SHOULD BE HERE - OUTSIDE THE HEADER */}
//       <div
//         className="yellow-container"
//         style={{
//           backgroundColor: "#FFD700",
//           borderBottomLeftRadius: "45px",
//           borderBottomRightRadius: "45px",
//           overflow: "hidden",
//           position: "relative",
//           height: "41px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // Optional: subtle shadow
//         }}
//       >
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={currentTextIndex}
//             initial={{ x: "100vw", opacity: 0 }}
//             animate={{
//               x: "0%",
//               opacity: 1,
//               transition: {
//                 x: { duration: 1, ease: "easeOut" },
//                 opacity: { duration: 0.8 },
//               },
//             }}
//             exit={{ x: "-100vw", opacity: 0 }}
//             transition={{ duration: 0.8 }}
//             style={{
//               position: "absolute",
//               whiteSpace: "nowrap",
//               fontFamily: "'Inter', sans-serif",
//               fontSize: "16px",
//               fontWeight: "500",
//               color: "#333",
//               textAlign: "center",
//             }}
//           >
//             {textItems[currentTextIndex]}{" "}
//             <img src={success} alt="" style={{ width: "20px" }} />
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       <div className="main-content">
//         <div className="divider-row">
//           <div className="divider-line"></div>
//           <div className="divider-badge">
//             <span className="divider-text">Log in or Sign-up</span>
//           </div>
//           <div className="divider-line"></div>
//         </div>

//         <div className="customer-name">
//           <input
//             className="customer-name-input"
//             placeholder="Enter your full name"
//             type="text"
//             value={customerName}
//             onChange={(e) => setCustomerName(e.target.value)}
//           />
//         </div>

//         <div className="phone-row">
//           <div className="input-group-phone">
//             <div className="prefix-box-phone">
//               <span className="prefix-text-phone">+91</span>
//             </div>
//             <input
//               className="phone-input"
//               placeholder="Enter phone number"
//               type="tel"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//             />
//           </div>
//           <button
//             className="otp-button"
//             onClick={handleOtpClick}
//             disabled={loader}
//           >
//             {loader ? (
//               <FontAwesomeIcon
//                 icon={faSpinner}
//                 size="lg"
//                 color={Colors.warmWood}
//               />
//             ) : (
//               <span className="otp-text">Get OTP</span>
//             )}
//           </button>
//         </div>

//         {/* Uncomment if you want to add social login options */}
//         {/* <div className="divider-row">
//           <div className="divider-line"></div>
//           <div className="divider-badge">
//             <span className="divider-text">OR</span>
//           </div>
//           <div className="divider-line"></div>
//         </div>

//         <div className="social-login-row">
//           <button
//             className="social-login-button"
//             onClick={() => navigate("/google-login")}
//           >
//             <FontAwesomeIcon icon={faGoogle} size="lg" color={Colors.warmWood} />
//           </button>
//           <button
//             className="social-login-button"
//             onClick={() => navigate("/google-login")}
//           >
//             <FontAwesomeIcon icon={faCcDiscover} size="lg" color={Colors.warmWood} />
//           </button>
//         </div> */}
//       </div>

//       <div
//         className="footer"
//         style={{
//           position: "relative",
//           width: "100%",
//           textAlign: "center",
//         }}
//       >
//         {/* Background image */}
//         <img
//           src={tasty}
//           alt="footer"
//           style={{
//             width: "100%",
//             maxWidth: "420px",
//             display: "block",
//             margin: "0 auto",
//           }}
//         />

//         {/* Text inside image */}
//         <p
//           className="terms-and-conditions-text"
//           style={{
//             position: "absolute",
//             top: "160px", // distance from top of image
//             left: "50%",
//             transform: "translateX(-50%)",
//             width: "100%",
//             color: "#6b6b6b", // change as needed
//             fontWeight: "500",
//             fontSize: "12px",
//           }}
//         >
//           By continuing, you agree to our{" "}
//           <a
//             href="/termsconditions"
//             className="link-text-terms"
//             rel="noopener noreferrer"
//             color={Colors.greenCardamom}
//             style={{ fontWeight: "bold" }}
//           >
//             Terms of Service
//           </a>{" "}
//           and{" "}
//           <a
//             href="/privacy-policy"
//             className="link-text-terms"
//             rel="noopener noreferrer"
//             color={Colors.greenCardamom}
//             style={{ fontWeight: "bold" }}
//           >
//             Privacy Policy
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

import React, { useMemo, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import Logo from "../assets/logo-container.png";
import { Colors } from "../Helper/themes";
import "../Styles/LeafWithLogo.css";
import Swal2 from "sweetalert2";
import axios from "axios";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import success from "./../assets/success-green.png";
import tasty from "./../assets/tasty.png";

const LOGO_BASE_W = 768;
const LOGO_BASE_H = 475;
const LOGO_PADDING = 32;

export default function LeafWithLogo() {
  const [screenW, setScreenW] = useState(window.innerWidth);
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loader, setLoader] = useState(false);

  // State for text carousel animation
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Text items for the animation
  const textItems = [
    "Fresh Menu Everyday",
    "No Subscription Stress",
    "Gut friendly, and yummy",
    "Super Affordable",
  ];

  useEffect(() => {
    const handleResize = () => setScreenW(Math.min(window.innerWidth, 400));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (user) {
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 200);
    }
  }, []);

  const { referralCode } = useParams();

  useEffect(() => {
    if (referralCode) {
      localStorage.setItem("referralCode", referralCode);
      console.log("Referral code captured:", referralCode);
    }
  }, []);

  // Custom bezier curve for animation - smart animate equivalent
  const customBezier = [0.4, 0, 0.2, 1]; // Standard easing curve

  // Handle text change with animation delay
  useEffect(() => {
    let timeoutId;
    let intervalId;

    const startAnimationCycle = () => {
      intervalId = setInterval(() => {
        // Start animation
        setIsAnimating(true);

        // Change text after 150ms delay (as per Figma)
        timeoutId = setTimeout(() => {
          setCurrentTextIndex((prevIndex) =>
            prevIndex === textItems.length - 1 ? 0 : prevIndex + 1
          );

          // Reset animation state after the full animation duration
          setTimeout(() => {
            setIsAnimating(false);
          }, 800);
        }, 0);
      }, 2000); // Total cycle time: 4 seconds
    };

    startAnimationCycle();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [textItems.length]);

  const headerVariants = {
    hidden: { y: -100 },
    visible: {
      y: 0,
      transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
    },
  };

  // Fixed sizing for consistent mobile appearance
  const containerWidth = 360;
  const leafWidth = Math.max(0, containerWidth - 24);
  const leafAR = useMemo(() => 1.5, []);
  const leafHeight = Math.max(0, leafWidth / leafAR);
  const logoMaxW = Math.max(0, leafWidth - 2 * LOGO_PADDING);
  const logoMaxH = Math.max(0, leafHeight - 2 * LOGO_PADDING);
  const scale = Math.min(logoMaxW / LOGO_BASE_W, logoMaxH / LOGO_BASE_H, 1);
  const LOGO_W = Math.round(LOGO_BASE_W * scale);
  const LOGO_H = Math.round(LOGO_BASE_H * scale);

  const handleContinueAsGuest = () => {
    window.location.replace("/home");
  };

  const handleOtpClick = async () => {
    if (!customerName) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: `Please enter your full name.`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      return;
    }
    if (!phone) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: `Please enter your phone number.`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: `Please enter a valid 10-digit phone number.`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      return;
    }
    setLoader(true);
    try {
      const config = {
        url: "/User/Sendotp",
        method: "post",
        baseURL: "https://dd-merge-backend-2.onrender.com/api",
        headers: { "content-type": "application/json" },
        data: {
          Mobile: phone,
        },
      };

      const res = await axios(config);
      if (res.status === 401) {
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Invalid Phone Number`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      if (res.status === 402) {
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Error sending OTP`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      if (res.status === 200) {
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "success",
          title: `Hi ${customerName}, OTP sent successfully on your whatsapp number`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
        setTimeout(() => {
          setLoader(false);
          navigate("/otp-varification", {
            state: { phone, Fname: customerName },
          });
        }, 2000);
      }
    } catch (error) {
      setLoader(false);
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: error.response?.data?.error || `Something went wrong!`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      console.log("error", error.message);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <motion.div
          className="header-wrapper"
          initial="hidden"
          animate="visible"
          variants={headerVariants}
        >
          <div className="login-header">
            <div
              className="logo-container"
              style={{
                width: leafWidth,
                height: leafHeight,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: LOGO_W,
                  height: LOGO_H,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0px",
                }}
              >
                <img
                  src={"/assets/logo-container.png"}
                  width={LOGO_W}
                  height={LOGO_H}
                  alt="Logo"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
                {/* <h3
                  style={{
                    margin: 0,
                    textAlign: "center",
                    color: "#fafafa",
                    fontSize: "16px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Plan Food, Not Appetite
                </h3> */}
              </div>

              {/* First yellow container */}
            </div>
          </div>

          {/* Main yellow container with animation */}
          <div
            className="yellow-container"
            style={{
              height: "41px",
              background: "#E6B800",
              border: "2px solid #F5DEB3",
              borderRadius: "0px 0px 32px 32px",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={currentTextIndex}
                initial={{ x: "120%" }}
                animate={{
                  x: "0%",
                  transition: {
                    delay: 0, // 150ms delay as per Figma
                    x: {
                      duration: 0.7, // 1600ms duration as per Figma
                      ease: customBezier, // Custom bezier curve
                    },
                  },
                }}
                exit={{
                  x: "-180%",
                  transition: {
                    duration: 0.7,
                    ease: customBezier,
                  },
                }}
                style={{
                  position: "absolute",
                  whiteSpace: "nowrap",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#333",
                  textAlign: "center",
                }}
              >
                {textItems[currentTextIndex]}{" "}
                <motion.img
                  src={success}
                  alt=""
                  style={{ width: "20px", display: "inline-block" }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    transition: {
                      delay: 0.15, // Same 150ms delay
                      duration: 0.9,
                      ease: customBezier,
                    },
                  }}
                  exit={{
                    scale: 0,
                    rotate: 180,
                    transition: {
                      duration: 0.9,
                      ease: customBezier,
                    },
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="main-content">
          <div className="divider-row">
            <div className="divider-line"></div>
            <div className="divider-badge">
              <span className="divider-text">Log in or Sign-up</span>
            </div>
            <div className="divider-line"></div>
          </div>

          <div className="customer-name">
            <input
              className="customer-name-input"
              placeholder="Enter your full name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="phone-row">
            <div className="input-group-phone">
              <div className="prefix-box-phone">
                <span className="prefix-text-phone">+91</span>
              </div>
              <input
                className="phone-input"
                placeholder="Enter phone number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              className="otp-button"
              onClick={handleOtpClick}
              disabled={loader}
            >
              {loader ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  size="lg"
                  color={Colors.warmWood}
                />
              ) : (
                <span className="otp-text">Get OTP</span>
              )}
            </button>
          </div>
        </div>

        <div
          className="footer"
          style={{
            position: "relative",
            width: "100%",
            textAlign: "center",
          }}
        >
          <img
            src={tasty}
            alt="footer"
            style={{
              width: "100%",
              maxWidth: "420px",
              display: "block",
              margin: "0 auto",
            }}
          />

          <p
            className="terms-and-conditions-text"
            style={{
              position: "absolute",
              top: "160px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              color: "#6b6b6b",
              fontWeight: "500",
              fontSize: "12px",
            }}
          >
            By continuing, you agree to our{" "}
            <a
              href="/termsconditions"
              className="link-text-terms"
              rel="noopener noreferrer"
              color={Colors.greenCardamom}
              style={{ fontWeight: "bold" }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy-policy"
              className="link-text-terms"
              rel="noopener noreferrer"
              color={Colors.greenCardamom}
              style={{ fontWeight: "bold" }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
