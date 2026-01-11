import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./../assets/base_logo.png";
import "./../Styles/SplashScreen.css";

const SplashScreen = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set timeout for splash screen duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }

      // Check if location was manually selected before
      const locationManuallySelected = localStorage.getItem(
        "locationManuallySelected"
      );

      if (locationManuallySelected === "true") {
        // User has previously selected location, go directly to home
        navigate("/home");
      } else {
        // Check if geolocation is available and get permission status
        if (navigator.geolocation && navigator.permissions) {
          navigator.permissions
            .query({ name: "geolocation" })
            .then((result) => {
              if (result.state === "granted") {
                // Permission already granted, go to home
                navigate("/home");
              } else {
                // Permission not granted, show modal
                navigate("/location-permission");
              }
            })
            .catch(() => {
              // Permissions API not supported, show modal to be safe
              navigate("/location-permission");
            });
        } else {
          // Geolocation not supported, show modal
          navigate("/location-permission");
        }
      }
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onLoadingComplete, navigate]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="logo-container">
          <img src={logo} alt="Food You'd Cook Logo" className="splash-logo" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
