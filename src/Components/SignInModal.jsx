// SignInModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal2 from "sweetalert2";
import success from "./../assets/success-green.png";
import ValidateModal from "./ValidateModal"; // Import ValidateModal

const SignInModal = ({ show, onHide, onSuccess, proceedToPlan }) => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loader, setLoader] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false); // State for ValidateModal

  // State for keyboard visibility
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [modalHeight, setModalHeight] = useState("70vh");

  // Refs for input fields
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const modalContentRef = useRef(null);

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

  // Custom bezier curve for animation - smart animate equivalent
  const customBezier = [0.4, 0, 0.2, 1];

  // Handle keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const heightReduction = window.innerHeight - visualViewport.height;
        const isKeyboardOpen = heightReduction > 100;

        setKeyboardVisible(isKeyboardOpen);

        if (isKeyboardOpen) {
          setModalHeight(`${visualViewport.height * 0.8}px`);

          setTimeout(() => {
            const activeElement = document.activeElement;
            if (activeElement && modalContentRef.current) {
              activeElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 100);
        } else {
          setModalHeight("70vh");
        }
      }
    };

    if (show && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      return () =>
        window.visualViewport.removeEventListener("resize", handleResize);
    }
  }, [show]);

  // Handle input focus
  const handleInputFocus = (inputRef) => {
    if (inputRef.current && modalContentRef.current) {
      setTimeout(() => {
        inputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  };

  // Handle text change with animation delay
  React.useEffect(() => {
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

  const handleOtpClick = async () => {
    if (!customerName.trim()) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: `Please enter your full name.`,
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      return;
    }
    if (!phone.trim()) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: `Please enter your phone number.`,
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: `Please enter a valid 10-digit phone number.`,
        showConfirmButton: false,
        timer: 3000,
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
        baseURL: "https://api.dailydish.in/api",
        headers: { "content-type": "application/json" },
        data: {
          Mobile: phone,
        },
      };

      const res = await axios(config);
      if (res.status === 401) {
        setLoader(false);
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Invalid Phone Number`,
          showConfirmButton: false,
          timer: 3000,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      if (res.status === 402) {
        setLoader(false);
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Error sending OTP`,
          showConfirmButton: false,
          timer: 3000,
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
          onHide(); // Close the sign in modal
          setShowValidateModal(true); // Show OTP verification modal
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
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        centered={false}
        className="signin-modal-bottom"
        dialogClassName="bottom-modal-dialog"
        contentClassName="bottom-modal-content"
        backdropClassName="signin-modal-backdrop"
        animation={false}
        style={{
          position: "fixed",
          zIndex: 9999999,
        }}
      >
        <div
          ref={modalContentRef}
          className="login-container-modal"
          style={{
            backgroundColor: "#F8F6F0",
            minHeight: modalHeight,
            maxHeight: modalHeight,
            overflowY: "auto",
            borderRadius: "20px 20px 0 0",
            width: "100%",
            // maxWidth: "400px",
            margin: "0 auto",
            paddingBottom: keyboardVisible ? "20px" : "0",
          }}
        >
          {/* Show minimal header when keyboard is open */}
          {!keyboardVisible && (
            <motion.div
              className="header-wrapper"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { y: -100 },
                visible: {
                  y: 0,
                  transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
                },
              }}
            >
              <div
                className="login-header"
                style={{
                  padding: "16px",
                  width: "100%",
                  display: "flex",
                  height: "202px",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#6B8E23",
                  maxHeight: "280px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="logo-container"
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    height: "auto",
                    aspectRatio: "1.618",
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={"/Assets/logo-container.png"}
                    alt="Logo"
                    style={{
                      width: "70%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
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
                        delay: 0,
                        x: {
                          duration: 0.7,
                          ease: customBezier,
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
                          delay: 0.15,
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
          )}

          {/* Compact header when keyboard is open */}
          {keyboardVisible && (
            <div
              style={{
                padding: "16px",
                backgroundColor: "#6B8E23",
                borderBottom: "2px solid #F5DEB3",
                textAlign: "center",
              }}
            >
              <h5
                style={{
                  color: "white",
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                Welcome to Dailydish
              </h5>
            </div>
          )}

          <div
            className="main-content"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: keyboardVisible ? "flex-start" : "flex-start",
              paddingTop: keyboardVisible ? "20px" : "20px",
              paddingLeft: "16px",
              paddingRight: "16px",
              paddingBottom: keyboardVisible ? "100px" : "0",
            }}
          >
            {!keyboardVisible && (
              <div
                className="divider-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 16px",
                  gap: "8px",
                }}
              >
                <div
                  className="divider-line"
                  style={{
                    flex: 1,
                    height: "0.4px",
                    backgroundColor: "#6B6B6B",
                  }}
                ></div>
                <div className="divider-badge" style={{ padding: "12px" }}>
                  <span
                    className="divider-text"
                    style={{
                      fontSize: "10px",
                      fontWeight: "500",
                      lineHeight: "11px",
                      letterSpacing: "-0.5px",
                      color: "#6B6B6B",
                    }}
                  >
                    Log in or Sign-up
                  </span>
                </div>
                <div
                  className="divider-line"
                  style={{
                    flex: 1,
                    height: "0.4px",
                    backgroundColor: "#6B6B6B",
                  }}
                ></div>
              </div>
            )}

            <div
              className="customer-name"
              style={{
                padding: "0 16px",
                display: "flex",
                flexDirection: "row",
                gap: "24px",
                margin: keyboardVisible ? "20px 0 12px 0" : "8px 0",
              }}
            >
              <input
                ref={nameInputRef}
                className="customer-name-input"
                placeholder="Enter your full name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onFocus={() => handleInputFocus(nameInputRef)}
                style={{
                  display: "flex",
                  padding: "12px 16px",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  borderRadius: "18px",
                  border: "1px solid #6B8E23",
                  background: "#FAFAFA",
                  fontSize: "16px",
                  fontWeight: "400",
                  lineHeight: "21px",
                  letterSpacing: "-0.8px",
                  color: "#2C2C2C",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              className="phone-row"
              style={{
                padding: "0 16px",
                display: "flex",
                flexDirection: "row",
                gap: "24px",
                margin: keyboardVisible ? "12px 0 20px 0" : "8px 0",
              }}
            >
              <div
                className="input-group-phone"
                style={{
                  display: "flex",
                  padding: "8px",
                  width: "217px",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                  borderRadius: "18px",
                  border: "1px solid #6B8E23",
                  background: "#FAFAFA",
                }}
              >
                <div
                  className="prefix-box-phone"
                  style={{
                    display: "flex",
                    padding: "2px 4px",
                    alignItems: "center",
                    borderRadius: "10px",
                    border: "0.4px solid #C0C0C0",
                    background: "#F5DEB3",
                  }}
                >
                  <span
                    className="prefix-text-phone"
                    style={{
                      color: "#2C2C2C",
                      textAlign: "center",
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "18px",
                      letterSpacing: "-0.7px",
                    }}
                  >
                    +91
                  </span>
                </div>
                <input
                  ref={phoneInputRef}
                  className="phone-input"
                  placeholder="Enter phone number"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => handleInputFocus(phoneInputRef)}
                  style={{
                    flex: 1,
                    fontSize: "16px",
                    fontWeight: "400",
                    lineHeight: "21px",
                    letterSpacing: "-0.8px",
                    color: "#2C2C2C",
                    border: "none",
                    outline: "none",
                    width: "100%",
                    background: "#FAFAFA",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                className="otp-button"
                onClick={handleOtpClick}
                disabled={loader}
                style={{
                  display: "flex",
                  height: "44px",
                  padding: "8px 16px",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "18px",
                  border: "2px solid #F5DEB3",
                  background: "#FFF8DC",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                {loader ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    style={{
                      fontSize: "16px",
                      color: "#2C2C2C",
                    }}
                  />
                ) : (
                  <span
                    className="otp-text"
                    style={{
                      color: "#2C2C2C",
                      fontFamily: "Inter",
                      fontSize: "16px",
                      fontWeight: "500",
                      lineHeight: "21px",
                      letterSpacing: "-0.8px",
                    }}
                  >
                    Get OTP
                  </span>
                )}
              </button>
            </div>

            {!keyboardVisible && (
              <div
                className="footer"
                style={{
                  marginTop: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p
                  className="terms-and-conditions-text"
                  style={{
                    fontSize: "10px",
                    fontWeight: "500",
                    lineHeight: "11px",
                    letterSpacing: "-0.5px",
                    color: "#6B6B6B",
                    textAlign: "center",
                    marginTop: "16px",
                    marginBottom: "20px",
                  }}
                >
                  By continuing, you agree to our{" "}
                  <a
                    href="/termsconditions"
                    className="link-text-terms"
                    rel="noopener noreferrer"
                    style={{
                      color: "#6B8E23",
                      fontWeight: "bold",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy-policy"
                    className="link-text-terms"
                    rel="noopener noreferrer"
                    style={{
                      color: "#6B8E23",
                      fontWeight: "bold",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* OTP Verification Modal */}
      <ValidateModal
        show={showValidateModal}
        onHide={() => setShowValidateModal(false)}
        phone={phone}
        Fname={customerName}
        onVerificationSuccess={({ userData, hasAddresses }) => {
          // Close modals
          setShowValidateModal(false);
          onHide();

          if (onSuccess) {
            onSuccess(userData);
          }

          // Clean up any post-login destination flags
          localStorage.removeItem("postLoginDestination");

          // Handle the address flow
          if (!hasAddresses) {
            // No addresses - redirect to location page
            navigate("/location");
          } else {
            // Has addresses - prioritize primary address over pre-login location
            const primaryAddress = JSON.parse(
              localStorage.getItem("primaryAddress") || "null"
            );

            if (primaryAddress) {
              // User has primary address - use it and clear any pre-login location
              console.log("🔄 SignInModal - Using primary address after login");

              // Convert primary address to currentLocation format if needed
              const locationData = {
                location: primaryAddress.location || {
                  type: "Point",
                  coordinates: [
                    primaryAddress.lng || 0,
                    primaryAddress.lat || 0,
                  ],
                },
                fullAddress:
                  primaryAddress.fullAddress || primaryAddress.address,
                hubName: primaryAddress.hubName || "",
                hubId: primaryAddress.hubId || "",
                isAutoDetected: false,
                timestamp: new Date().toISOString(),
              };

              localStorage.setItem(
                "currentLocation",
                JSON.stringify(locationData)
              );
              localStorage.setItem("locationManuallySelected", "true");

              // Dispatch event to update other components
              window.dispatchEvent(new Event("locationUpdated"));
            }

            const currentLocation = JSON.parse(
              localStorage.getItem("currentLocation") || "null"
            );

            if (!primaryAddress && !currentLocation) {
              // No address selected - redirect to location
              navigate("/location");
            } else {
              // Always navigate to home after login
              navigate("/");
            }
          }
        }}
      />
    </>
  );
};

export default SignInModal;
