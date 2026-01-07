// ValidateModal.jsx - Complete component with border and box-shadow removed
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSpinner,
  faBackspace,
  faTimes,
  faPaste,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp as faWhatsappBrand } from "@fortawesome/free-brands-svg-icons";
import { Colors } from "../Helper/themes";
import Swal2 from "sweetalert2";
import axios from "axios";
import "./../Styles/validateModal.css";

const ValidateModal = ({
  show,
  onHide,
  phone,
  Fname,
  onVerificationSuccess,
}) => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(15);
  const [currentInputIndex, setCurrentInputIndex] = useState(0);
  const inputs = useRef([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [modalHeight, setModalHeight] = useState("70vh");

  // Check if user is already logged in (similar to Validate.jsx)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

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

  const handleVerify = useCallback(
    async (code) => {
      if (loader) return;
      setLoader(true);
      try {
        const capturedReferralCode = localStorage.getItem("referralCode");
        const payload = {
          Mobile: phone,
          otp: code,
          Fname: Fname,
        };

        if (capturedReferralCode) {
          payload.referralCode = capturedReferralCode;
        }

        const config = {
          url: "/User/mobileotpverification",
          method: "post",
          baseURL: "https://api.dailydish.in/api",
          headers: { "content-type": "application/json" },
          data: payload,
        };

        const res = await axios(config);

        if (res.status === 200) {
          setLoader(false);
          const userData = res.data.details;
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("addresstype", "corporate");
          window.dispatchEvent(new Event("userUpdated"));

          if (capturedReferralCode) {
            localStorage.removeItem("referralCode");
          }

          // ✅ Fix: Properly handle fetch response (from Validate.jsx)
          if (userData?.primaryAddress) {
            try {
              const response = await fetch(
                `https://api.dailydish.in/api/User/customers/${userData._id}/addresses/${userData.primaryAddress}/primary`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                }
              );

              if (response.ok) {
                const addressData = await response.json();
                localStorage.setItem(
                  "primaryAddress",
                  JSON.stringify(addressData?.primaryAddress)
                );
              } else {
                // Don't crash if this fails - just use user data as fallback
                localStorage.setItem(
                  "primaryAddress",
                  JSON.stringify(userData?.primaryAddress)
                );
              }
            } catch (fetchError) {
              // Fallback to user data
              localStorage.setItem(
                "primaryAddress",
                JSON.stringify(userData?.primaryAddress)
              );
            }
          } else {
            // If no primaryAddress in userData, use userData as fallback
            localStorage.setItem(
              "primaryAddress",
              JSON.stringify(userData?.primaryAddress)
            );
          }

          // ✅ HAS ADDRESSES LOGIC ADDED HERE (from Validate.jsx)
          const hasAddresses =
            Array.isArray(userData.addresses) && userData.addresses.length > 0;

          // Notify parent component of successful verification
          if (onVerificationSuccess) {
            onVerificationSuccess({ userData, hasAddresses });
          }

          onHide(); // Close the modal

          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "success",
            title: `OTP verified successfully`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
              popup: "me-small-toast",
              title: "me-small-toast-title",
            },
          });

          // ✅ Check for post-login destination
          console.log("🔍 ValidateModal - hasAddresses:", hasAddresses);

          // ✅ Always redirect to home after login, regardless of address status
          setTimeout(() => {
            if (hasAddresses) {
              // User has addresses
              const primaryAddress = JSON.parse(
                localStorage.getItem("primaryAddress") || "null"
              );
              const currentLocation = JSON.parse(
                localStorage.getItem("currentLocation") || "null"
              );

              console.log("🔍 ValidateModal - primaryAddress:", primaryAddress);
              console.log(
                "🔍 ValidateModal - currentLocation:",
                currentLocation
              );

              // Debug address fields
              if (primaryAddress) {
                console.log(
                  "🔍 ValidateModal - primaryAddress.fullAddress:",
                  primaryAddress.fullAddress
                );
                console.log(
                  "🔍 ValidateModal - primaryAddress.address:",
                  primaryAddress.address
                );
              }
              if (currentLocation) {
                console.log(
                  "🔍 ValidateModal - currentLocation.fullAddress:",
                  currentLocation.fullAddress
                );
                console.log(
                  "🔍 ValidateModal - currentLocation.address:",
                  currentLocation.address
                );
              }

              // Prioritize primary address over pre-login location
              if (primaryAddress) {
                // User has primary address - use it and clear any pre-login location
                console.log(
                  "🔄 ValidateModal - Using primary address after login"
                );

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
            }

            // Clean up any post-login destination flags
            localStorage.removeItem("postLoginDestination");

            // Always navigate to home after login
            console.log("➡️ ValidateModal - Navigating to home after login");
            navigate("/", { replace: true });
          }, 100);
        }
      } catch (error) {
        setLoader(false);
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `${
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Error verifying OTP"
          }`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
    },
    [phone, Fname, onVerificationSuccess, onHide, loader, navigate]
  );

  // Countdown timer (from Validate.jsx)
  useEffect(() => {
    if (countdown === 0) return; // stop countdown

    const timerId = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [countdown]);

  const handleChange = (text, idx) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;

    let chars = text.split("");

    if (chars.length > 1) {
      // Handle multiple characters (paste or type)
      const arr = chars.slice(0, 6);
      const newOtp = arr.concat(Array(6 - arr.length).fill(""));
      setOtp(newOtp);
      setCurrentInputIndex(Math.min(arr.length, 5));

      // Focus the next empty input or last filled input
      if (arr.length < 6 && inputs.current[arr.length]) {
        inputs.current[arr.length].focus();
      } else if (arr.length === 6) {
        // All inputs filled, focus last input
        if (inputs.current[5]) {
          inputs.current[5].focus();
        }
        // ✅ Only call when full OTP entered
        setTimeout(() => {
          handleVerify(newOtp.join(""));
        }, 200);
      }
    } else {
      // Single character entry
      const temp = [...otp];
      temp[idx] = text;
      setOtp(temp);
      setCurrentInputIndex(idx);

      // Move to next input if current is filled
      if (text && idx < 5 && inputs.current[idx + 1]) {
        inputs.current[idx + 1].focus();
        setCurrentInputIndex(idx + 1);
      }

      // ✅ Call verify only when all boxes filled
      if (temp.every((digit) => digit !== "")) {
        setTimeout(() => {
          handleVerify(temp.join(""));
        }, 200);
      }
    }
  };

  // Enhanced paste handler for better mobile support (from Validate.jsx)
  const handleInputPaste = async (e, idx) => {
    e.preventDefault();
    let pastedData = "";

    try {
      // For mobile, prioritize clipboardData as it's more reliable
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        // Mobile: Use clipboardData first
        pastedData = e.clipboardData?.getData("text") || "";

        // If clipboardData is empty, try clipboard API
        if (
          !pastedData &&
          navigator.clipboard &&
          navigator.clipboard.readText
        ) {
          try {
            pastedData = await navigator.clipboard.readText();
          } catch (clipboardErr) {
            console.log("Mobile clipboard API failed:", clipboardErr);
          }
        }
      } else {
        // Desktop: Try clipboard API first
        if (navigator.clipboard && navigator.clipboard.readText) {
          pastedData = await navigator.clipboard.readText();
        } else {
          // Fallback to clipboardData
          pastedData = e.clipboardData?.getData("text") || "";
        }
      }
    } catch (err) {
      // Final fallback
      pastedData = e.clipboardData?.getData("text") || "";
    }

    if (pastedData) {
      const cleanData = pastedData.replace(/\D/g, "");

      if (cleanData.length > 0) {
        // Always start from the first position and fill all boxes
        const newOtp = Array(6).fill("");
        for (let i = 0; i < Math.min(cleanData.length, 6); i++) {
          newOtp[i] = cleanData[i];
        }

        setOtp(newOtp);
        setCurrentInputIndex(Math.min(cleanData.length, 5));

        // Show success feedback
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "success",
          title: `Pasted ${cleanData.length} digit${
            cleanData.length > 1 ? "s" : ""
          }`,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });

        // Auto-verify if all filled
        if (cleanData.length >= 6) {
          setTimeout(() => {
            handleVerify(cleanData.substring(0, 6));
          }, 200);
        }
      }
    }
  };

  // Enhanced paste button click with better mobile support (from Validate.jsx)
  const handlePasteButton = useCallback(async () => {
    try {
      let pastedData = "";
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        // For mobile, focus first input to allow paste via keyboard
        if (inputs.current[0]) {
          inputs.current[0].focus();
        }

        // Try clipboard API
        if (navigator.clipboard && navigator.clipboard.readText) {
          try {
            pastedData = await navigator.clipboard.readText();
          } catch (clipboardError) {
            console.log("Clipboard API failed:", clipboardError);
          }
        }
      } else {
        // For desktop, try clipboard API
        if (navigator.clipboard && navigator.clipboard.readText) {
          try {
            pastedData = await navigator.clipboard.readText();
          } catch (clipboardError) {
            console.log("Clipboard API failed:", clipboardError);
            // Fallback to execCommand for desktop
            const textArea = document.createElement("textarea");
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
              const successful = document.execCommand("paste");
              if (successful) {
                pastedData = textArea.value;
              }
            } catch (err) {
              console.log("Fallback paste failed:", err);
            }

            document.body.removeChild(textArea);
          }
        }
      }

      if (pastedData) {
        // Clean the data - remove all non-digit characters
        const cleanData = pastedData.replace(/\D/g, "");

        if (cleanData.length > 0) {
          const newOtp = Array(6).fill("");
          for (let i = 0; i < Math.min(cleanData.length, 6); i++) {
            newOtp[i] = cleanData[i];
          }

          setOtp(newOtp);
          setCurrentInputIndex(Math.min(cleanData.length, 5));

          // Show success feedback
          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "success",
            title: `Pasted ${cleanData.length} digit${
              cleanData.length > 1 ? "s" : ""
            }`,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            customClass: {
              popup: "me-small-toast",
              title: "me-small-toast-title",
            },
          });

          // Auto-verify if all 6 digits are filled
          if (cleanData.length >= 6) {
            setTimeout(() => {
              handleVerify(cleanData.substring(0, 6));
            }, 200);
          }
        } else {
          // Show message if no digits found
          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "info",
            title: "No numbers found in clipboard",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            customClass: {
              popup: "me-small-toast",
              title: "me-small-toast-title",
            },
          });
        }
      } else {
        // Show message if clipboard is empty
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "info",
          title: "Clipboard is empty",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
    } catch (error) {
      console.log("Paste failed:", error);
      // Show user-friendly message
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: "Unable to access clipboard. Please paste manually.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
  }, [handleVerify]);

  // Listen for backspace (from Validate.jsx)
  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      // If this box is empty, go back
      if (otp[idx] === "" && idx > 0) {
        const temp = [...otp];
        temp[idx - 1] = "";
        setOtp(temp);
        setCurrentInputIndex(idx - 1);
        if (inputs.current[idx - 1]) {
          inputs.current[idx - 1].focus();
        }
      } else {
        // Delete current box
        const temp = [...otp];
        temp[idx] = "";
        setOtp(temp);
        setCurrentInputIndex(idx);
      }
    } else if (e.key === "Enter") {
      if (otp.every((digit) => digit !== "")) {
        handleVerify(otp.join(""));
      }
    }
    // Allow arrow keys for navigation
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      setCurrentInputIndex(idx - 1);
      if (inputs.current[idx - 1]) {
        inputs.current[idx - 1].focus();
      }
    } else if (e.key === "ArrowRight" && idx < 5) {
      e.preventDefault();
      setCurrentInputIndex(idx + 1);
      if (inputs.current[idx + 1]) {
        inputs.current[idx + 1].focus();
      }
    }
  };

  // Handle input focus
  const handleInputFocus = (idx) => {
    setCurrentInputIndex(idx);
  };

  // Global paste handler and keyboard shortcuts - MOVED BELOW handleVerify
  useEffect(() => {
    const handleGlobalPaste = async (e) => {
      // Only handle paste if we're not already in an input
      if (e.target.tagName !== "INPUT") {
        let pastedData = "";

        try {
          // Try clipboard API first
          if (navigator.clipboard && navigator.clipboard.readText) {
            pastedData = await navigator.clipboard.readText();
          } else {
            // Fallback to clipboardData
            pastedData = e.clipboardData?.getData("text") || "";
          }
        } catch (err) {
          // Final fallback
          pastedData = e.clipboardData?.getData("text") || "";
        }

        if (pastedData) {
          const cleanData = pastedData.replace(/\D/g, "");
          if (cleanData.length >= 4) {
            // Only handle if it looks like an OTP
            const newOtp = Array(6).fill("");
            for (let i = 0; i < Math.min(cleanData.length, 6); i++) {
              newOtp[i] = cleanData[i];
            }
            setOtp(newOtp);
            setCurrentInputIndex(Math.min(cleanData.length, 5));

            // Show feedback for successful paste
            Swal2.fire({
              toast: true,
              position: "bottom",
              icon: "success",
              title: `Auto-pasted ${cleanData.length} digit${
                cleanData.length > 1 ? "s" : ""
              }`,
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              customClass: {
                popup: "me-small-toast",
                title: "me-small-toast-title",
              },
            });

            if (cleanData.length >= 6) {
              setTimeout(() => {
                handleVerify(cleanData.substring(0, 6));
              }, 200);
            }
          }
        }
      }
    };

    // Desktop keyboard shortcuts
    const handleKeyDown = (e) => {
      // Ctrl+V or Cmd+V for paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        handlePasteButton();
        return;
      }

      // Enter key to verify if all fields are filled (global fallback)
      if (e.key === "Enter" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        if (otp.every((digit) => digit !== "")) {
          handleVerify(otp.join(""));
        }
        return;
      }
    };

    document.addEventListener("paste", handleGlobalPaste);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("paste", handleGlobalPaste);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleVerify, otp, handlePasteButton]);

  const handleResendOTP = async () => {
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
      if (res.status === 200) {
        setLoader(false);
        setCountdown(15);
        if (inputs.current[0]) {
          inputs.current[0].focus();
        }
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "success",
          title: `Hi ${Fname}, OTP resent successfully on your whatsapp number`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
    } catch (error) {
      setLoader(false);
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: `${
          error.response.data.error ||
          error.response.data.message ||
          "Error sending OTP"
        }`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      console.log(error);
    }

    // Add your resend OTP logic here
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered={false}
      className="validate-modal-bottom"
      dialogClassName="bottom-modal-dialog"
      contentClassName="bottom-modal-content"
      backdropClassName="validate-modal-backdrop"
      animation={false}
      style={{
        position: "fixed",
        zIndex: 9999999,
      }}
    >
      <div
        className="validate-container-modal"
        style={{
          backgroundColor: "#F8F6F0", // Beige/cream background
          minHeight: modalHeight,
          maxHeight: modalHeight,
          overflowY: "auto",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          paddingBottom: keyboardVisible ? "20px" : "0",
        }}
      >
        {/* Header */}
        <div
          className="validate-header"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 24px 12px 12px",
            gap: "16px",
            backgroundColor: "#F8F6F0", // Same beige/cream background
            borderBottom: "0.4px solid #6B6B6B",
            borderBottomLeftRadius: "24px",
            borderBottomRightRadius: "24px",
            flexShrink: 0,
            boxShadow: "0 4px 6px rgba(107, 107, 107, 0.3)",
            width: "100%",
            margin: "0",
            position: "relative",
            zIndex: 10,
          }}
        >
          <button
            onClick={onHide}
            className="back-button"
            style={{
              background: "none",
              border: "none",
              padding: "0",
              cursor: "pointer",
              color: "#2C2C2C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s ease",
            }}
          >
            <FontAwesomeIcon
              icon={faTimes}
              size="lg"
              height={24}
              width={24}
              className="back-button-icon"
              style={{ color: "#2C2C2C", height: "36px", width: "36px" }}
            />
          </button>
          <div
            className="header-center"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <h1
              className="validate-title"
              style={{
                fontSize: "20px",
                fontWeight: "500",
                lineHeight: "26px",
                letterSpacing: "-1px",
                color: "#2C2C2C",
                margin: "0",
              }}
            >
              OTP Verification
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="validate-content"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
            margin: "0",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            position: "relative",
            zIndex: 5,
            backgroundColor: "#F8F6F0", // Same beige/cream background
            flex: 1,
          }}
        >
          <p
            className="validate-subtitle"
            style={{
              fontSize: "16px",
              fontWeight: "400",
              lineHeight: "21px",
              letterSpacing: "-0.8px",
              color: "#2C2C2C",
              textAlign: "center",
              margin: "16px 0 8px 0",
            }}
          >
            We have sent a One-Time Password to{" "}
          </p>

          <div
            className="phone-display"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "36px",
              gap: "6px",
            }}
          >
            <FontAwesomeIcon
              icon={faWhatsappBrand}
              className="whatsapp-icon"
              style={{ width: "24px", height: "24px", color: "#2C2C2C" }}
            />
            <span
              className="phone-number"
              style={{
                fontSize: "16px",
                fontWeight: "400",
                lineHeight: "21px",
                letterSpacing: "-0.8px",
                color: "#2C2C2C",
              }}
            >
              +91 {phone}
            </span>
          </div>

          {/* OTP Input Section - Border and BoxShadow removed */}
          <div
            className="otp-container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "24px 0",
              gap: "12px",
            }}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(ref) => (inputs.current[i] = ref)}
                className={`otp-input ${
                  currentInputIndex === i ? "active" : ""
                }`}
                type="text"
                inputMode="numeric"
                maxLength={i === 0 ? 6 : 1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={(e) => handleInputPaste(e, i)}
                onFocus={() => handleInputFocus(i)}
                autoComplete="off"
                placeholder="*"
                style={{
                  display: "flex",
                  width: "48px",
                  height: "48px",
                  padding: "10px 0",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "8px",
                  borderRadius: "16px",
                  border: "none", // Removed border
                  background: "#FAFAFA",
                  padding: "10px 16px",
                  color: "#2C2C2C",
                  fontFamily: "Inter",
                  fontSize: "22px",
                  fontWeight: "700",
                  lineHeight: "27px",
                  letterSpacing: "-0.88px",
                  cursor: "pointer",
                  userSelect: "none",
                  outline: "none",
                  textAlign: "center",
                  boxSizing: "border-box",
                  ...(currentInputIndex === i && {
                    transform: "scale(1.05)",
                  }),
                }}
              />
            ))}
          </div>

          <div
            className="resend-section"
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              marginBottom: "24px",
              gap: "4px",
              flexWrap: "wrap",
            }}
          >
            <span
              className="resend-text"
              style={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "21px",
                letterSpacing: "-0.8px",
                color: "#2C2C2C",
              }}
            >
              Didn't get the OTP?{" "}
            </span>
            <div
              className="resend-timer-wrapper"
              style={{
                minWidth: "130px",
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              {countdown > 0 ? (
                <span
                  className="resend-timer"
                  style={{
                    fontSize: "14px",
                    fontWeight: "400",
                    lineHeight: "18px",
                    letterSpacing: "-0.7px",
                    color: "#6B6B6B",
                  }}
                >
                  Resend it in{" "}
                  <span
                    className="resend-countdown"
                    style={{
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "18px",
                      letterSpacing: "-0.7px",
                      color: "#6B6B6B",
                    }}
                  >
                    {countdown}s
                  </span>
                </span>
              ) : (
                <button
                  onClick={handleResendOTP}
                  className="resend-button"
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0",
                    cursor: "pointer",
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
                      className="resend-now"
                      style={{
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "18px",
                        letterSpacing: "-0.7px",
                        color: "#6B6B6B",
                      }}
                    >
                      Resend OTP
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ValidateModal;
