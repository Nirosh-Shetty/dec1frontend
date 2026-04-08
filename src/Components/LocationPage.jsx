import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCrosshairs,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaSearch,
  FaPlus,
  FaTrash,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import ConfirmationModal from "./ConfirmationModal";
import Lottie from "lottie-react";
import addressjson from "./../assets/Address.json";

const LocationPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [primaryAddressId, setPrimaryAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const searchInputRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const fetchAbortControllerRef = useRef(null);
  const hasFetchedAddressesRef = useRef(false);
  const isPageMountedRef = useRef(false);
  const savedAddressesRef = useRef(null);

  const API_KEY = import.meta.env.VITE_MAP_KEY;

  // Update window dimensions
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize Google Maps services
  const initializeServices = useCallback(() => {
    console.log("Initializing Google Maps services...");

    if (!window.google?.maps?.places) {
      console.error("Google Maps Places API not available");
      return;
    }

    try {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current =
          new window.google.maps.places.AutocompleteService();
        console.log("AutocompleteService initialized successfully");
      }

      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          document.createElement("div"),
        );
        console.log("PlacesService initialized successfully");
      }
    } catch (error) {
      console.error("Error initializing Google Maps services:", error);
    }
  }, []);

  // Load Google Maps script
  useEffect(() => {
    isPageMountedRef.current = true;

    console.log("Location page mounted, checking Google Maps API...");

    // Check if already loaded
    if (window.google?.maps?.places) {
      console.log("Google Maps API already loaded");
      setScriptLoaded(true);
      initializeServices();
      return;
    }

    // Check if script element exists
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com"]`,
    );

    if (existingScript) {
      console.log("Google Maps script found, waiting for load...");
      // Script is loading, wait for it
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          console.log("Google Maps API loaded via existing script");
          setScriptLoaded(true);
          initializeServices();
          clearInterval(checkInterval);
        }
      }, 50);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.google?.maps?.places) {
          console.error("Google Maps API failed to load within timeout");
        }
      }, 10000);

      return () => clearInterval(checkInterval);
    }

    // Load new script
    console.log("Loading Google Maps script...");
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Google Maps script loaded successfully");
      if (isPageMountedRef.current) {
        setScriptLoaded(true);
        initializeServices();
      }
    };

    script.onerror = (error) => {
      console.error("Failed to load Google Maps script:", error);
    };

    document.head.appendChild(script);

    return () => {
      isPageMountedRef.current = false;
    };
  }, [API_KEY, initializeServices]);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const [selectUser, setSelectUser] = useState();

  // Fetch saved addresses
  const fetchSavedAddresses = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      setSelectUser(user);
      const customerId = user?._id;

      if (!customerId) {
        setLoading(false);
        return;
      }

      // Only use cache if not forced refresh
      if (!forceRefresh) {
        const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
        const cacheTimestamp = localStorage.getItem(
          `addresses_timestamp_${customerId}`,
        );
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        // Use cache if valid and recent
        if (cachedAddresses && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp);
          if (age < CACHE_DURATION) {
            const cached = JSON.parse(cachedAddresses);
            setSavedAddresses(cached.addresses || []);
            setPrimaryAddressId(cached.primaryAddress || null);
            setLoading(false);

            // Still fetch fresh data in background
            fetchAddressesInBackground(customerId);
            return;
          }
        }
      }

      // Create AbortController for cancellation
      fetchAbortControllerRef.current = new AbortController();

      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: fetchAbortControllerRef.current.signal,
        },
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const addresses = result.addresses || [];
          const primaryId = result.primaryAddress || null;

          setSavedAddresses(addresses);
          setPrimaryAddressId(primaryId);

          // Cache the results
          localStorage.setItem(
            `addresses_${customerId}`,
            JSON.stringify({ addresses, primaryAddress: primaryId }),
          );
          localStorage.setItem(
            `addresses_timestamp_${customerId}`,
            Date.now().toString(),
          );
        }
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching addresses:", error);
      }
    } finally {
      setLoading(false);
      hasFetchedAddressesRef.current = true;
    }
  }, []);

  // Background fetch to update cache
  const fetchAddressesInBackground = async (customerId) => {
    try {
      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const addresses = result.addresses || [];
          const primaryId = result.primaryAddress || null;

          // Update state if page is still mounted
          if (isPageMountedRef.current) {
            setSavedAddresses(addresses);
            setPrimaryAddressId(primaryId);
          }

          // Update cache
          localStorage.setItem(
            `addresses_${customerId}`,
            JSON.stringify({ addresses, primaryAddress: primaryId }),
          );
          localStorage.setItem(
            `addresses_timestamp_${customerId}`,
            Date.now().toString(),
          );
        }
      }
    } catch (error) {
      console.error("Background fetch error:", error);
    }
  };

  // Listen for address added events
  useEffect(() => {
    const handleAddressAdded = () => {
      // Force refresh addresses when an address is added
      fetchSavedAddresses(true);

      // Also refresh the primary address display
      const primary = localStorage.getItem("primaryAddress");
      if (primary) {
        try {
          const primaryData = JSON.parse(primary);
          setPrimaryAddressId(primaryData._id);
        } catch (e) {
          console.error("Error parsing primary address:", e);
        }
      }
    };

    // Custom event listener
    window.addEventListener("addressAdded", handleAddressAdded);

    return () => {
      window.removeEventListener("addressAdded", handleAddressAdded);
    };
  }, [fetchSavedAddresses]);

  // Fetch addresses when page loads
  useEffect(() => {
    fetchSavedAddresses();

    return () => {
      // Cleanup: abort ongoing fetch
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, [fetchSavedAddresses]);

  // Debounced search with cleanup
  const handleSearchChange = useCallback(
    (e) => {
      const query = e.target.value;
      setSearchQuery(query);

      console.log("query:", query);
      console.log("search suggestions:", searchSuggestions);
      console.log("Google Maps loaded:", !!window.google?.maps?.places);
      console.log(
        "AutocompleteService initialized:",
        !!autocompleteServiceRef.current,
      );

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Check if Google Maps is loaded
      if (!window.google?.maps?.places) {
        console.error("Google Maps Places API not loaded");
        return;
      }

      // Initialize service if not already done
      if (!autocompleteServiceRef.current) {
        console.log("Initializing AutocompleteService...");
        try {
          autocompleteServiceRef.current =
            new window.google.maps.places.AutocompleteService();
        } catch (error) {
          console.error("Failed to initialize AutocompleteService:", error);
          return;
        }
      }

      if (query.length > 2) {
        debounceTimerRef.current = setTimeout(() => {
          console.log("Making API call for query:", query);

          autocompleteServiceRef.current.getPlacePredictions(
            {
              input: query,
              types: ["geocode", "establishment"],
              componentRestrictions: { country: "in" },
            },
            (predictions, status) => {
              console.log("API Response - Status:", status);
              console.log("API Response - Predictions:", predictions);

              if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                predictions
              ) {
                console.log("Setting suggestions:", predictions);
                setSearchSuggestions(predictions);
              } else {
                console.log("No predictions or error status:", status);
                setSearchSuggestions([]);

                // Log specific error statuses
                if (
                  status ===
                  window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
                ) {
                  console.log("No results found for query");
                } else if (
                  status ===
                  window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT
                ) {
                  console.error("Google Places API quota exceeded");
                } else if (
                  status ===
                  window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED
                ) {
                  console.error(
                    "Google Places API request denied - check API key",
                  );
                } else if (
                  status ===
                  window.google.maps.places.PlacesServiceStatus.INVALID_REQUEST
                ) {
                  console.error("Invalid request to Google Places API");
                }
              }
            },
          );
        }, 300);
      } else {
        setSearchSuggestions([]);
      }
    },
    [searchSuggestions],
  );

  // Handle Add Location button click
  const handleAddLocation = useCallback(() => {
    navigate("/location", {
      state: {
        showAddressForm: true,
        fromPage: true,
      },
    });
  }, [navigate]);

  // Handle location selection from search
  const handleLocationSelect = useCallback(
    (place) => {
      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          document.createElement("div"),
        );
      }

      setActionLoading("search");
      setShowSearch(false);

      placesServiceRef.current.getDetails(
        {
          placeId: place.place_id,
          fields: ["geometry", "name", "formatted_address", "vicinity"],
        },
        (placeResult, status) => {
          setActionLoading(null);
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const locationData = {
              lat: placeResult.geometry.location.lat(),
              lng: placeResult.geometry.location.lng(),
            };

            navigate("/current-location", {
              state: {
                selectedPlace: {
                  location: locationData,
                  address: placeResult.formatted_address,
                  name:
                    placeResult.name ||
                    placeResult.formatted_address.split(",")[0],
                  vicinity: placeResult.vicinity,
                },
                setAsPrimary: false,
                fromSearch: true,
              },
            });
          }
        },
      );
    },
    [navigate],
  );

  // Handle current location
  const handleUseCurrentLocation = useCallback(() => {
    if (actionLoading) return;

    setActionLoading("location");
    navigate("/current-location", {
      state: {
        setAsPrimary: true,
        source: "locationPage",
      },
    });
  }, [navigate, actionLoading]);

  // Handle deliver here
  const handleDeliverHere = useCallback(
    async (address) => {
      if (actionLoading) return;

      setActionLoading(address._id);

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const customerId = user?._id;

        if (!customerId) return;

        // Update UI immediately
        setPrimaryAddressId(address._id);
        localStorage.setItem("primaryAddress", JSON.stringify(address));
        // Set manual location flag to prevent auto-detection
        localStorage.setItem("locationManuallySelected", "true");
        localStorage.removeItem("cart");
        // Update cache
        const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
        if (cachedAddresses) {
          const cached = JSON.parse(cachedAddresses);
          cached.primaryAddress = address._id;
          localStorage.setItem(
            `addresses_${customerId}`,
            JSON.stringify(cached),
          );
        }

        // API call
        const response = await fetch(
          `http://localhost:7013/api/User/customers/${customerId}/addresses/${address._id}/primary`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (response.ok) {
          // Trigger refresh everywhere
          window.dispatchEvent(new Event("addressUpdated"));

          // Navigate back or reload after a short delay
          setTimeout(() => {
            navigate(-1); // Go back to previous page
          }, 100);
        }
      } catch (error) {
        console.error("Error setting primary address:", error);
      } finally {
        setActionLoading(null);
      }
    },
    [navigate, actionLoading],
  );

  // Handle delete address confirmation
  const handleDeleteClick = useCallback((address) => {
    setAddressToDelete(address);
    setShowDeleteConfirm(true);
  }, []);

  // Handle delete address
  const handleDeleteAddress = useCallback(async () => {
    if (!addressToDelete) return;

    try {
      setActionLoading(`delete_${addressToDelete._id}`);
      const user = JSON.parse(localStorage.getItem("user"));
      const customerId = user?._id;

      if (!customerId) {
        throw new Error("Customer ID not found. Please login again.");
      }

      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses/${addressToDelete._id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      const result = await response.json();

      if (result.success) {
        // Update local state immediately
        const updatedAddresses = savedAddresses.filter(
          (addr) => addr._id !== addressToDelete._id,
        );
        setSavedAddresses(updatedAddresses);

        // If deleted address was primary, clear primary address
        let updatedPrimaryId = primaryAddressId;
        if (primaryAddressId === addressToDelete._id) {
          updatedPrimaryId = null;
          setPrimaryAddressId(null);
          localStorage.removeItem("primaryAddress");
        }

        // Update cache
        localStorage.setItem(
          `addresses_${customerId}`,
          JSON.stringify({
            addresses: updatedAddresses,
            primaryAddress: updatedPrimaryId,
          }),
        );
        localStorage.setItem(
          `addresses_timestamp_${customerId}`,
          Date.now().toString(),
        );

        // Trigger refresh everywhere
        window.dispatchEvent(new Event("addressUpdated"));

        // Close delete modal
        setShowDeleteConfirm(false);
        setAddressToDelete(null);
      } else {
        throw new Error(result.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert(error.message || "Failed to delete address");
    } finally {
      setActionLoading(null);
    }
  }, [savedAddresses, primaryAddressId, addressToDelete]);

  // Handle cancel delete
  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setAddressToDelete(null);
  }, []);

  // Navigate back
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Helper functions
  const getPrimaryName = useCallback((address) => {
    if (!address) return "";

    switch (address.addressType) {
      case "Home":
        return address.homeName || address.houseName || "";
      case "PG":
        return address.apartmentName || address.houseName || "";
      case "School":
        return address.schoolName || address.houseName || "";
      case "Work":
        return address.companyName || address.houseName || "";
      default:
        return address.houseName || "";
    }
  }, []);

  const getAddressIcon = useCallback((type) => {
    switch (type) {
      case "Home":
        return "🏠";
      case "PG":
        return "🏢";
      case "School":
        return "🎓";
      case "Work":
        return "💼";
      default:
        return "📍";
    }
  }, []);

  const isPrimaryAddress = useCallback(
    (addressId) => primaryAddressId === addressId,
    [primaryAddressId],
  );

  const getPrimaryAddress = useCallback(
    () => savedAddresses.find((addr) => addr._id === primaryAddressId),
    [savedAddresses, primaryAddressId],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
      isPageMountedRef.current = false;
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa", // Optional: background color for the entire page
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          minHeight: "auto",
          display: "flex",
          flexDirection: "column",
          maxWidth: "610px",
          width: "100%",
          borderRadius: "12px", // Added for better visual appearance
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // Added subtle shadow
          overflow: "hidden", // Ensure content stays within rounded corners
        }}
      >
        {/* Header - Fixed */}
        <div
          style={{
            padding: isMobile ? "20px 16px 16px" : "24px 20px 20px",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
            backgroundColor: "white",
          }}
        >
          <Lottie
            animationData={addressjson}
            loop={true}
            style={{ width: 360, height: 36 * 8 }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h5
                style={{
                  margin: 0,
                  color: "#6b8e23",
                  fontFamily: "Inter",
                  fontWeight: "800",
                  fontSize: isMobile ? "20px" : "24px",
                }}
              >
                Where Should We Deliver?
              </h5>
            </div>
          </div>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: isMobile ? "14px" : "16px",
              fontFamily: "Inter",
              lineHeight: "1.4",
            }}
          >
            Use your current location or search to see menus near you
          </p>
        </div>

        {/* Search Input */}
        {!selectUser ? (
          <div
            style={{
              padding: "20px",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "1px solid #e0e0e0",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  gap: "8px",
                }}
              >
                <FaSearch size={18} color="#666" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearch(true)}
                  placeholder="Search for area, street, landmark..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: "16px",
                    padding: "8px 0",
                    backgroundColor: "transparent",
                    fontFamily: "Inter",
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchSuggestions([]);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "18px",
                      color: "#666",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {showSearch && searchSuggestions.length > 0 && (
                <div
                  style={{
                    borderTop: "1px solid #e0e0e0",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {searchSuggestions.map((place, index) => (
                    <div
                      key={place.place_id}
                      onClick={() => handleLocationSelect(place)}
                      style={{
                        padding: "12px 16px",
                        borderBottom:
                          index < searchSuggestions.length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "white";
                      }}
                    >
                      <div style={{ fontWeight: "500", color: "#333" }}>
                        {place.structured_formatting.main_text}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "2px",
                        }}
                      >
                        {place.structured_formatting.secondary_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Main Content - Scrollable but fits screen */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f8f9fa",
          }}
        >
          {/* Action Buttons */}
          {selectUser ? (
            <div
              style={{
                padding: isMobile ? "16px" : "20px",
                paddingBottom: isMobile ? "16px" : "20px",
                flexShrink: 0,
                backgroundColor: "white",
              }}
            >
              <button
                onClick={handleAddLocation}
                style={{
                  width: "100%",
                  padding: isMobile ? "16px" : "18px",
                  backgroundColor: "transparent",
                  border: "2px dashed #6B8E23",
                  borderRadius: "12px",
                  color: "#6B8E23",
                  fontSize: isMobile ? "15px" : "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontFamily: "Inter",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f8fff8";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                <FaPlus size={isMobile ? 16 : 18} />
                Add Location
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: isMobile ? "16px" : "20px",
                paddingBottom: isMobile ? "16px" : "20px",
                flexShrink: 0,
                backgroundColor: "white",
              }}
            >
              <button
                onClick={handleUseCurrentLocation}
                disabled={actionLoading === "current-location"}
                style={{
                  width: "100%",
                  padding: isMobile ? "16px" : "18px",
                  backgroundColor: "#6B8E23",
                  border: "1px solid #6B8E23",
                  borderRadius: "1212px",
                  color: "#fff",
                  fontSize: isMobile ? "15px" : "16px",
                  fontWeight: "500",
                  cursor:
                    actionLoading === "current-location"
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontFamily: "Inter",
                  transition: "all 0.2s ease",
                  opacity: actionLoading === "current-location" ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!actionLoading) {
                    e.target.style.backgroundColor = "#5a7a1c";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!actionLoading) {
                    e.target.style.backgroundColor = "#6B8E23";
                  }
                }}
              >
                {actionLoading === "current-location" ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Getting location...
                  </>
                ) : (
                  <>
                    <FaCrosshairs size={isMobile ? 16 : 18} />
                    Use Current Location
                  </>
                )}
              </button>
            </div>
          )}

          {/* Saved Addresses Section - Scrollable within fixed height */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              padding: isMobile ? "0 16px 16px" : "0 20px 20px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Loading Overlay */}
            {loading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                }}
              >
                <div
                  className="spinner-border"
                  role="status"
                  style={{
                    width: "3rem",
                    height: "3rem",
                    color: "#6B8E23",
                  }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Action Loading */}
        {actionLoading === "search" && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="spinner-border"
              role="status"
              style={{
                width: "3.5rem",
                height: "3.5rem",
                color: "#6B8E23",
              }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <style>
          {`
        /* Custom scrollbar styling */
        div[style*="overflowY: auto"]::-webkit-scrollbar {
          width: 6px;
        }
        
        div[style*="overflowY: auto"]::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        /* Touch-friendly buttons */
        button {
          min-height: 44px;
          user-select: none;
        }
        
        /* Smooth animations */
        * {
          transition: background-color 0.2s ease, 
                      border-color 0.2s ease, 
                      opacity 0.2s ease,
                      transform 0.2s ease;
        }
        
        /* Prevent text selection */
        .no-select {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        /* Ensure parent container doesn't scroll */
        body, html {
          margin: 0;
          padding: 0;
          overflow: auto;
        }
      `}
        </style>
      </div>
    </div>
  );
};

export default LocationPage;
