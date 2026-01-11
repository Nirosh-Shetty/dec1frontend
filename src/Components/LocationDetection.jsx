import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../src/assets/base_logo.png";

const LocationDetection = ({ show = true, onEnableLocation, onClose }) => {
  const navigate = useNavigate();

  // Default handlers when used as a route
  const handleDefaultEnableLocation = () => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Location enabled:", position.coords);

          try {
            // Get actual address from coordinates using reverse geocoding
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${import.meta.env.VITE_MAP_KEY}`
            );

            const data = await response.json();
            let fullAddress = "Current Location";

            if (
              data.status === "OK" &&
              data.results &&
              data.results.length > 0
            ) {
              fullAddress = data.results[0].formatted_address;
            }

            // Create location data with actual address
            const locationData = {
              location: {
                type: "Point",
                coordinates: [
                  position.coords.longitude,
                  position.coords.latitude,
                ],
              },
              fullAddress: fullAddress,
              hubName: "",
              hubId: null,
              isAutoDetected: false, // Mark as user-selected, not auto-detected
              timestamp: new Date().toISOString(),
            };

            // Check serviceability of the location
            console.log("🔍 Checking serviceability for coordinates:", {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });

            try {
              const serviceabilityResponse = await fetch(
                "https://dailydish.in/api/Hub/validate-location",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    lat: position.coords.latitude.toString(),
                    lng: position.coords.longitude.toString(),
                  }),
                }
              );

              const serviceabilityData = await serviceabilityResponse.json();
              console.log(
                "🔍 Serviceability API response:",
                serviceabilityData
              );

              if (serviceabilityData.success) {
                locationData.isServiceable = serviceabilityData.serviceable;
                console.log(
                  "✅ Serviceability status:",
                  serviceabilityData.serviceable
                );

                if (
                  serviceabilityData.hubs &&
                  serviceabilityData.hubs.length > 0
                ) {
                  const hubData = serviceabilityData.hubs[0];
                  locationData.hubName = hubData.hubName || "";
                  locationData.hubId = hubData.hub || null;
                  console.log("🏢 Hub data:", hubData);
                }
              } else {
                console.log("❌ Serviceability API returned success: false");
                locationData.isServiceable = false;
              }
            } catch (serviceabilityError) {
              console.error(
                "❌ Error checking serviceability:",
                serviceabilityError
              );
              // Continue without serviceability data
              locationData.isServiceable = false;
            }

            console.log("💾 Final location data to save:", locationData);

            // Save location data
            localStorage.setItem(
              "currentLocation",
              JSON.stringify(locationData)
            );
            // Don't set locationManuallySelected - only set when user manually selects from modal

            // Navigate to home after location is enabled
            navigate("/home");
          } catch (error) {
            console.error("Error getting address:", error);

            // Fallback: save with generic address
            const locationData = {
              location: {
                type: "Point",
                coordinates: [
                  position.coords.longitude,
                  position.coords.latitude,
                ],
              },
              fullAddress: "Current Location",
              hubName: "",
              hubId: null,
              isServiceable: false,
              isAutoDetected: false, // Mark as user-selected, not auto-detected
              timestamp: new Date().toISOString(),
            };

            localStorage.setItem(
              "currentLocation",
              JSON.stringify(locationData)
            );
            // Don't set locationManuallySelected - only for manual selection
            navigate("/home");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          // If location fails, still navigate to home but don't set manual flag
          navigate("/home");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      // Don't set manual flag - navigate to home
      navigate("/home");
    }
  };

  const handleDefaultClose = () => {
    navigate("/home");
  };

  if (!show) return null;

  const handleEnableLocation = () => {
    if (onEnableLocation) {
      onEnableLocation();
    } else {
      handleDefaultEnableLocation();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      handleDefaultClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(135deg, rgba(107, 142, 35, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Main Content Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "rgba(107, 142, 35, 0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "32px 24px 0",
          textAlign: "center",
          position: "relative",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        {/* Welcome Text */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "28px",
                fontWeight: "600",
                fontFamily: "Inter, sans-serif",
                lineHeight: "1.2",
              }}
            >
              Welcome to
            </span>
            <img
              src={logo}
              alt="DailyDish Logo"
              style={{
                width: "120px",
                height: "40px",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>

        {/* Yellow Banner */}
        <div
          style={{
            backgroundColor: "#F4D03F",
            borderRadius: "16px",
            padding: "20px 16px",
            marginBottom: "24px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            style={{
              color: "#2C2C2C",
              fontSize: "18px",
              fontWeight: "700",
              margin: 0,
              fontFamily: "Inter, sans-serif",
              lineHeight: "1.3",
            }}
          >
            Our fresh menus change based on your location.
          </h2>
        </div>

        {/* Bottom Section with Cream Background */}
        <div
          style={{
            backgroundColor: "#F5F5DC",
            padding: "32px 24px 40px",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            textAlign: "center",
            marginLeft: "-24px",
            marginRight: "-24px",
            marginBottom: "0",
          }}
        >
          {/* Description Text */}
          <div
            style={{
              color: "#2C2C2C",
              fontSize: "18px",
              fontWeight: "500",
              margin: "0 0 32px 0",
              fontFamily: "Inter, sans-serif",
              lineHeight: "1.4",
              textAlign: "left",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              1. Turn on <strong>location</strong> on your phone
            </div>
            <div>
              2. <strong>Allow it here</strong> to load your menu
            </div>
          </div>

          {/* Enable Location Button */}
          <button
            onClick={handleEnableLocation}
            style={{
              backgroundColor: "#6B8E23",
              color: "white",
              border: "none",
              borderRadius: "16px",
              padding: "14px 32px",
              fontSize: "16px",
              fontWeight: "600",
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
              width: "100%",
              maxWidth: "280px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(107, 142, 35, 0.3)",
              margin: "0 auto",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#5a7a1c";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(107, 142, 35, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#6B8E23";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(107, 142, 35, 0.3)";
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="currentColor"
              />
            </svg>
            Enable Location
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          div[style*="position: fixed"] > div {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default LocationDetection;
