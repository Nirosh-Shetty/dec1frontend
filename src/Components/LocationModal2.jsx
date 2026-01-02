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
} from "react-icons/fa";
import ConfirmationModal from "./ConfirmationModal";

const LocationModal2 = ({
  show,
  onClose,
  onAddressAdded,
  onAddressSelected,
  selectedLocationId,
}) => {
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
  const isModalMountedRef = useRef(false);
  const modalContentRef = useRef(null);
  const savedAddressesRef = useRef(null);
  const modalRef = useRef(null);

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

  // Handle body scroll lock
  useEffect(() => {
    if (show) {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restore scroll position
        const scrollY = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      };
    }
  }, [show]);

  // Optimized Google Maps script loading with caching check
  useEffect(() => {
    if (!show) return;

    isModalMountedRef.current = true;

    // Check if already loaded
    if (window.google?.maps?.places) {
      setScriptLoaded(true);
      initializeServices();
      return;
    }

    // Check if script element exists
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com"]`
    );

    if (existingScript) {
      // Script is loading, wait for it
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          setScriptLoaded(true);
          initializeServices();
          clearInterval(checkInterval);
        }
      }, 50);

      return () => clearInterval(checkInterval);
    }

    // Load new script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (isModalMountedRef.current) {
        setScriptLoaded(true);
        initializeServices();
      }
    };

    script.onerror = () => console.error("Failed to load Google Maps");
    document.head.appendChild(script);

    return () => {
      isModalMountedRef.current = false;
    };
  }, [show, API_KEY]);

  // Initialize Google Maps services
  const initializeServices = useCallback(() => {
    if (!window.google?.maps?.places) return;

    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
    }
    if (!placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
    }
  }, []);

  // Focus search input
  useEffect(() => {
    if (show && searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const [selectUser, setSelectUser] = useState();

  // Fetch saved addresses
  const fetchSavedAddresses = useCallback(
    async (forceRefresh = false) => {
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
          const cachedAddresses = localStorage.getItem(
            `addresses_${customerId}`
          );
          const cacheTimestamp = localStorage.getItem(
            `addresses_timestamp_${customerId}`
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
          `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/addresses`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: fetchAbortControllerRef.current.signal,
          }
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
              JSON.stringify({ addresses, primaryAddress: primaryId })
            );
            localStorage.setItem(
              `addresses_timestamp_${customerId}`,
              Date.now().toString()
            );

            // Notify parent component if address was just added
            if (forceRefresh && onAddressAdded) {
              onAddressAdded();
            }
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
    },
    [onAddressAdded]
  );

  // Background fetch to update cache
  const fetchAddressesInBackground = async (customerId) => {
    try {
      const response = await fetch(
        `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/addresses`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const addresses = result.addresses || [];
          const primaryId = result.primaryAddress || null;

          // Update state if modal is still open
          if (isModalMountedRef.current) {
            setSavedAddresses(addresses);
            setPrimaryAddressId(primaryId);
          }

          // Update cache
          localStorage.setItem(
            `addresses_${customerId}`,
            JSON.stringify({ addresses, primaryAddress: primaryId })
          );
          localStorage.setItem(
            `addresses_timestamp_${customerId}`,
            Date.now().toString()
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

  // Fetch addresses when modal opens
  useEffect(() => {
    if (show) {
      fetchSavedAddresses();
    }

    return () => {
      // Cleanup: abort ongoing fetch
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, [show, fetchSavedAddresses]);

  // Debounced search with cleanup
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!window.google?.maps?.places || !autocompleteServiceRef.current) {
      return;
    }

    if (query.length > 2) {
      debounceTimerRef.current = setTimeout(() => {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: query,
            types: ["geocode", "establishment"],
            componentRestrictions: { country: "in" },
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setSearchSuggestions(predictions);
            } else {
              setSearchSuggestions([]);
            }
          }
        );
      }, 300);
    } else {
      setSearchSuggestions([]);
    }
  }, []);

  // Handle Add Location button click
  const handleAddLocation = useCallback(() => {
    onClose();
    navigate("/location", {
      state: {
        showAddressForm: true,
        fromModal: true,
      },
    });
  }, [navigate, onClose]);

  // Handle location selection from search
  const handleLocationSelect = useCallback(
    (place) => {
      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          document.createElement("div")
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

            onClose();
            navigate("/location", {
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
        }
      );
    },
    [navigate, onClose]
  );

  // Handle adding new address
  const handleAddNewAddress = useCallback(() => {
    onClose();
    navigate("/location", {
      state: {
        showAddressForm: true,
        fromModal: true,
      },
    });
  }, [navigate, onClose]);

  // Handle current location
  const handleUseCurrentLocation = useCallback(() => {
    if (actionLoading) return;

    setActionLoading("location");
    onClose();
    navigate("/current-location", {
      state: {
        setAsPrimary: true,
        source: "addressDrawer",
      },
    });
    // Note: The loading state will be handled by the current-location page
  }, [navigate, onClose, actionLoading]);

  // Handle deliver here
  const handleDeliverHere = useCallback(
    async (address) => {
      if (actionLoading) return;

      setActionLoading(address._id);

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const customerId = user?._id;

        if (!customerId) return;

        // If onAddressSelected callback is provided (e.g., from MyPlan), call it instead of reloading
        if (onAddressSelected) {
          onAddressSelected(address);
          setActionLoading(null);
          return;
        }

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
            JSON.stringify(cached)
          );
        }

        // Close modal first
        onClose();

        // API call
        const response = await fetch(
          `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/addresses/${address._id}/primary`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.ok) {
          // Trigger refresh everywhere
          window.dispatchEvent(new Event("addressUpdated"));

          // Reload after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } catch (error) {
        console.error("Error setting primary address:", error);
      } finally {
        setActionLoading(null);
      }
    },
    [onClose, actionLoading, onAddressSelected]
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
        `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/addresses/${addressToDelete._id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      const result = await response.json();

      if (result.success) {
        // Update local state immediately
        const updatedAddresses = savedAddresses.filter(
          (addr) => addr._id !== addressToDelete._id
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
          })
        );
        localStorage.setItem(
          `addresses_timestamp_${customerId}`,
          Date.now().toString()
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
    [primaryAddressId]
  );

  const getPrimaryAddress = useCallback(
    () => savedAddresses.find((addr) => addr._id === primaryAddressId),
    [savedAddresses, primaryAddressId]
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
      isModalMountedRef.current = false;
    };
  }, []);

  if (!show) return null;

  return (
    <div
      ref={modalRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#ffffff",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        maxWidth: "610px",
        margin: "0 auto",
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "12px",
          }}
        >
          <h5
            style={{
              margin: 0,
              color: "#2c2c2c",
              fontFamily: "Inter",
              fontWeight: "600",
              fontSize: isMobile ? "20px" : "24px",
            }}
          >
            Delivery Location
          </h5>

          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: isMobile ? "24px" : "28px",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#555",
              lineHeight: "1",
              flexShrink: 0,
              padding: "4px",
              width: isMobile ? "36px" : "40px",
              height: isMobile ? "36px" : "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            ×
          </button>
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
          Select or add a delivery address
        </p>
      </div>

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
                borderRadius: "12px",
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

          <h6
            style={{
              color: "#2c2c2c",
              fontFamily: "Inter",
              fontWeight: "600",
              marginBottom: "16px",
              fontSize: isMobile ? "16px" : "18px",
              paddingTop: "8px",
              lineHeight: "1.3",
              flexShrink: 0,
            }}
          >
            Saved Addresses
            {primaryAddressId && (
              <span
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: "400",
                  color: "#666",
                  display: "block",
                  marginTop: "4px",
                }}
              >
                Primary: {getPrimaryName(getPrimaryAddress())}
              </span>
            )}
          </h6>

          <div
            ref={savedAddressesRef}
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "4px",
              minHeight: "200px",
            }}
          >
            {savedAddresses.length === 0 && !loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#666",
                  fontFamily: "Inter",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <FaMapMarkerAlt
                  size={isMobile ? 48 : 56}
                  color="#ccc"
                  style={{ marginBottom: "16px" }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: isMobile ? "14px" : "16px",
                    lineHeight: "1.4",
                    color: "#888",
                  }}
                >
                  No saved addresses yet.
                </p>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: isMobile ? "13px" : "14px",
                    lineHeight: "1.4",
                    color: "#666",
                  }}
                >
                  Click "Add Location" above to add your first address.
                </p>
              </div>
            ) : (
              savedAddresses.map((address, index) => {
                const isSelected =
                  (selectedLocationId && selectedLocationId === address._id) ||
                  (!selectedLocationId && isPrimaryAddress(address._id));
                console.log(
                  selectedLocationId,
                  address._id,
                  isSelected,
                  address
                );
                return (
                  <div
                    key={address._id}
                    style={{
                      padding: isMobile ? "16px" : "18px",
                      border: isSelected
                        ? "2px solid #6B8E23"
                        : "1px solid #e0e0e0",
                      borderRadius: "12px",
                      marginBottom:
                        index < savedAddresses.length - 1 ? "12px" : "0",
                      backgroundColor: isSelected ? "#f8fff8" : "white",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: isMobile ? "20px" : "22px",
                            marginRight: "12px",
                            marginTop: "2px",
                            flexShrink: 0,
                          }}
                        >
                          {getAddressIcon(address.addressType)}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "6px",
                              flexWrap: "wrap",
                              gap: "6px",
                            }}
                          >
                            <h6
                              style={{
                                margin: 0,
                                color: "#2c2c2c",
                                fontFamily: "Inter",
                                fontWeight: "600",
                                fontSize: isMobile ? "14px" : "15px",
                                lineHeight: "1.3",
                              }}
                            >
                              {getPrimaryName(address)}
                            </h6>
                            {isPrimaryAddress(address._id) && (
                              <span
                                style={{
                                  fontSize: isMobile ? "10px" : "11px",
                                  color: "#6B8E23",
                                  fontWeight: "500",
                                  backgroundColor: "#f0f9f0",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  flexShrink: 0,
                                }}
                              >
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              margin: 0,
                              color: "#666",
                              fontSize: isMobile ? "12px" : "13px",
                              fontFamily: "Inter",
                              lineHeight: "1.4",
                              wordBreak: "break-word",
                            }}
                          >
                            {address.fullAddress}
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          alignItems: "flex-end",
                          flexShrink: 0,
                        }}
                      >
                        <button
                          onClick={() => handleDeliverHere(address)}
                          disabled={actionLoading === address._id}
                          style={{
                            backgroundColor: isSelected
                              ? "#6B8E23"
                              : "transparent",
                            border: isSelected ? "none" : "1px solid #6B8E23",
                            borderRadius: "8px",
                            color: isSelected ? "white" : "#6B8E23",
                            fontSize: isMobile ? "12px" : "13px",
                            fontWeight: "500",
                            padding: isMobile ? "8px 12px" : "10px 16px",
                            cursor:
                              actionLoading === address._id
                                ? "not-allowed"
                                : "pointer",
                            whiteSpace: "nowrap",
                            fontFamily: "Inter",
                            transition: "all 0.2s ease",
                            minWidth: "100px",
                            opacity: actionLoading === address._id ? 0.7 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected && !actionLoading) {
                              e.target.style.backgroundColor = "#6B8E23";
                              e.target.style.color = "white";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected && !actionLoading) {
                              e.target.style.backgroundColor = "transparent";
                              e.target.style.color = "#6B8E23";
                            }
                          }}
                        >
                          {actionLoading === address._id ? (
                            <div
                              className="spinner-border spinner-border-sm"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          ) : isSelected ? (
                            <>
                              <FaCheckCircle
                                size={isMobile ? 12 : 14}
                                style={{ marginRight: "4px" }}
                              />
                              Selected
                            </>
                          ) : (
                            "Deliver here"
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteClick(address)}
                          disabled={actionLoading === `delete_${address._id}`}
                          style={{
                            backgroundColor: "transparent",
                            border: "1px solid #dc3545",
                            borderRadius: "6px",
                            color: "#dc3545",
                            fontSize: isMobile ? "11px" : "12px",
                            fontWeight: "500",
                            padding: isMobile ? "5px 25px" : "6px 12px",
                            cursor:
                              actionLoading === `delete_${address._id}`
                                ? "not-allowed"
                                : "pointer",
                            fontFamily: "Inter",
                            transition: "all 0.2s ease",
                            opacity:
                              actionLoading === `delete_${address._id}`
                                ? 0.7
                                : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          {actionLoading === `delete_${address._id}` ? (
                            <div
                              className="spinner-border spinner-border-sm"
                              role="status"
                              style={{
                                width: isMobile ? "10px" : "12px",
                                height: isMobile ? "10px" : "12px",
                              }}
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          ) : (
                            <>
                              <FaTrash size={isMobile ? 10 : 11} />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Search Action Loading */}
      {actionLoading === "search" && (
        <div
          style={{
            position: "absolute",
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
          
          /* Modal animations */
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          
          /* Apply animation based on device */
          @media (max-width: 768px) {
            div[style*="position: fixed"] {
              animation: slideUp 0.3s ease-out;
            }
          }
          
          @media (min-width: 769px) {
            div[style*="position: fixed"] {
              animation: fadeIn 0.3s ease-out;
            }
          }
        `}
      </style>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleDeleteAddress}
        title="Delete Address"
        message={`Are you sure you want to delete this address?${
          addressToDelete ? `\n\n${getPrimaryName(addressToDelete)}` : ""
        }`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="danger"
      />
    </div>
  );
};

export default LocationModal2;

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FaCrosshairs,
//   FaMapMarkerAlt,
//   FaCheckCircle,
//   FaSearch,
//   FaPlus,
//   FaTrash,
// } from "react-icons/fa";
// import ConfirmationModal from "./ConfirmationModal";

// const LocationModal2 = ({ show, onClose, onAddressAdded }) => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchSuggestions, setSearchSuggestions] = useState([]);
//   const [showSearch, setShowSearch] = useState(false);
//   const [savedAddresses, setSavedAddresses] = useState([]);
//   const [primaryAddressId, setPrimaryAddressId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(null);
//   const [scriptLoaded, setScriptLoaded] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [addressToDelete, setAddressToDelete] = useState(null);

//   const searchInputRef = useRef(null);
//   const autocompleteServiceRef = useRef(null);
//   const placesServiceRef = useRef(null);
//   const debounceTimerRef = useRef(null);
//   const fetchAbortControllerRef = useRef(null);
//   const hasFetchedAddressesRef = useRef(false);
//   const isModalMountedRef = useRef(false);

//   const API_KEY = import.meta.env.VITE_MAP_KEY;

//   // Optimized Google Maps script loading with caching check
//   useEffect(() => {
//     if (!show) return;

//     isModalMountedRef.current = true;

//     // Check if already loaded
//     if (window.google?.maps?.places) {
//       setScriptLoaded(true);
//       initializeServices();
//       return;
//     }

//     // Check if script element exists
//     const existingScript = document.querySelector(
//       `script[src*="maps.googleapis.com"]`
//     );

//     if (existingScript) {
//       // Script is loading, wait for it
//       const checkInterval = setInterval(() => {
//         if (window.google?.maps?.places) {
//           setScriptLoaded(true);
//           initializeServices();
//           clearInterval(checkInterval);
//         }
//       }, 50);

//       return () => clearInterval(checkInterval);
//     }

//     // Load new script
//     const script = document.createElement("script");
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
//     script.async = true;
//     script.defer = true;

//     script.onload = () => {
//       if (isModalMountedRef.current) {
//         setScriptLoaded(true);
//         initializeServices();
//       }
//     };

//     script.onerror = () => console.error("Failed to load Google Maps");
//     document.head.appendChild(script);

//     return () => {
//       isModalMountedRef.current = false;
//     };
//   }, [show, API_KEY]);

//   // Initialize Google Maps services
//   const initializeServices = useCallback(() => {
//     if (!window.google?.maps?.places) return;

//     if (!autocompleteServiceRef.current) {
//       autocompleteServiceRef.current =
//         new window.google.maps.places.AutocompleteService();
//     }
//     if (!placesServiceRef.current) {
//       placesServiceRef.current = new window.google.maps.places.PlacesService(
//         document.createElement("div")
//       );
//     }
//   }, []);

//   // Focus search input
//   useEffect(() => {
//     if (show && searchInputRef.current) {
//       const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
//       return () => clearTimeout(timer);
//     }
//   }, [show]);

//   // Fetch saved addresses
//   const fetchSavedAddresses = useCallback(
//     async (forceRefresh = false) => {
//       try {
//         setLoading(true);

//         const user = JSON.parse(localStorage.getItem("user"));
//         const customerId = user?._id;

//         if (!customerId) {
//           setLoading(false);
//           return;
//         }

//         // Only use cache if not forced refresh
//         if (!forceRefresh) {
//           const cachedAddresses = localStorage.getItem(
//             `addresses_${customerId}`
//           );
//           const cacheTimestamp = localStorage.getItem(
//             `addresses_timestamp_${customerId}`
//           );
//           const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

//           // Use cache if valid and recent
//           if (cachedAddresses && cacheTimestamp) {
//             const age = Date.now() - parseInt(cacheTimestamp);
//             if (age < CACHE_DURATION) {
//               const cached = JSON.parse(cachedAddresses);
//               setSavedAddresses(cached.addresses || []);
//               setPrimaryAddressId(cached.primaryAddress || null);
//               setLoading(false);

//               // Still fetch fresh data in background
//               fetchAddressesInBackground(customerId);
//               return;
//             }
//           }
//         }

//         // Create AbortController for cancellation
//         fetchAbortControllerRef.current = new AbortController();

//         const response = await fetch(
//           `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/addresses`,
//           {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//             signal: fetchAbortControllerRef.current.signal,
//           }
//         );

//         if (response.ok) {
//           const result = await response.json();
//           if (result.success) {
//             const addresses = result.addresses || [];
//             const primaryId = result.primaryAddress || null;

//             setSavedAddresses(addresses);
//             setPrimaryAddressId(primaryId);

//             // Cache the results
//             localStorage.setItem(
//               `addresses_${customerId}`,
//               JSON.stringify({ addresses, primaryAddress: primaryId })
//             );
//             localStorage.setItem(
//               `addresses_timestamp_${customerId}`,
//               Date.now().toString()
//             );

//             // Notify parent component if address was just added
//             if (forceRefresh && onAddressAdded) {
//               onAddressAdded();
//             }
//           }
//         }
//       } catch (error) {
//         if (error.name !== "AbortError") {
//           console.error("Error fetching addresses:", error);
//         }
//       } finally {
//         setLoading(false);
//         hasFetchedAddressesRef.current = true;
//       }
//     },
//     [onAddressAdded]
//   );

//   // Background fetch to update cache
//   const fetchAddressesInBackground = async (customerId) => {
//     try {
//       const response = await fetch(
//         `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/addresses`,
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       if (response.ok) {
//         const result = await response.json();
//         if (result.success) {
//           const addresses = result.addresses || [];
//           const primaryId = result.primaryAddress || null;

//           // Update state if modal is still open
//           if (isModalMountedRef.current) {
//             setSavedAddresses(addresses);
//             setPrimaryAddressId(primaryId);
//           }

//           // Update cache
//           localStorage.setItem(
//             `addresses_${customerId}`,
//             JSON.stringify({ addresses, primaryAddress: primaryId })
//           );
//           localStorage.setItem(
//             `addresses_timestamp_${customerId}`,
//             Date.now().toString()
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Background fetch error:", error);
//     }
//   };

//   // Listen for address added events
//   // Listen for address added events
//   useEffect(() => {
//     const handleAddressAdded = () => {
//       // Force refresh addresses when an address is added
//       fetchSavedAddresses(true);

//       // Also refresh the primary address display
//       const primary = localStorage.getItem("primaryAddress");
//       if (primary) {
//         try {
//           const primaryData = JSON.parse(primary);
//           setPrimaryAddressId(primaryData._id);
//         } catch (e) {
//           console.error("Error parsing primary address:", e);
//         }
//       }
//     };

//     // Custom event listener
//     window.addEventListener("addressAdded", handleAddressAdded);

//     return () => {
//       window.removeEventListener("addressAdded", handleAddressAdded);
//     };
//   }, [fetchSavedAddresses]);

//   // Fetch addresses when modal opens
//   useEffect(() => {
//     if (show) {
//       fetchSavedAddresses();
//     }

//     return () => {
//       // Cleanup: abort ongoing fetch
//       if (fetchAbortControllerRef.current) {
//         fetchAbortControllerRef.current.abort();
//       }
//     };
//   }, [show, fetchSavedAddresses]);

//   // Debounced search with cleanup
//   const handleSearchChange = useCallback((e) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     // Clear previous timer
//     if (debounceTimerRef.current) {
//       clearTimeout(debounceTimerRef.current);
//     }

//     if (!window.google?.maps?.places || !autocompleteServiceRef.current) {
//       return;
//     }

//     if (query.length > 2) {
//       debounceTimerRef.current = setTimeout(() => {
//         autocompleteServiceRef.current.getPlacePredictions(
//           {
//             input: query,
//             types: ["geocode", "establishment"],
//             componentRestrictions: { country: "in" },
//           },
//           (predictions, status) => {
//             if (
//               status === window.google.maps.places.PlacesServiceStatus.OK &&
//               predictions
//             ) {
//               setSearchSuggestions(predictions);
//             } else {
//               setSearchSuggestions([]);
//             }
//           }
//         );
//       }, 300);
//     } else {
//       setSearchSuggestions([]);
//     }
//   }, []);

//   // Handle location selection
//   const handleLocationSelect = useCallback(
//     (place) => {
//       if (!placesServiceRef.current) {
//         placesServiceRef.current = new window.google.maps.places.PlacesService(
//           document.createElement("div")
//         );
//       }

//       setActionLoading("search");
//       setShowSearch(false);

//       placesServiceRef.current.getDetails(
//         {
//           placeId: place.place_id,
//           fields: ["geometry", "name", "formatted_address", "vicinity"],
//         },
//         (placeResult, status) => {
//           setActionLoading(null);
//           if (status === window.google.maps.places.PlacesServiceStatus.OK) {
//             const locationData = {
//               lat: placeResult.geometry.location.lat(),
//               lng: placeResult.geometry.location.lng(),
//             };

//             onClose();
//             navigate("/location", {
//               state: {
//                 selectedPlace: {
//                   location: locationData,
//                   address: placeResult.formatted_address,
//                   name:
//                     placeResult.name ||
//                     placeResult.formatted_address.split(",")[0],
//                   vicinity: placeResult.vicinity,
//                 },
//                 setAsPrimary: false,
//               },
//             });
//           }
//         }
//       );
//     },
//     [navigate, onClose]
//   );

//   // Handle adding new address
//   const handleAddNewAddress = useCallback(() => {
//     onClose();
//     navigate("/location", {
//       state: {
//         showAddressForm: true,
//         fromModal: true,
//       },
//     });
//   }, [navigate, onClose]);

//   // Remove primary address
//   const removePrimaryAddress = useCallback(async () => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user?._id;

//       if (!customerId || !primaryAddressId) return;

//       // Update UI immediately
//       setPrimaryAddressId(null);
//       localStorage.removeItem("primaryAddress");

//       // Update cache
//       const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
//       if (cachedAddresses) {
//         const cached = JSON.parse(cachedAddresses);
//         cached.primaryAddress = null;
//         localStorage.setItem(`addresses_${customerId}`, JSON.stringify(cached));
//       }

//       // API call
//       await fetch(
//         `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/primary-address/remove`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     } catch (error) {
//       console.error("Error removing primary address:", error);
//     }
//   }, [primaryAddressId]);

//   // Handle current location
//   // const handleUseCurrentLocation = useCallback(async () => {
//   //   if (actionLoading) return;

//   //   setActionLoading("location");

//   //   try {
//   //     if (primaryAddressId) {
//   //       await removePrimaryAddress();
//   //     }

//   //     onClose();
//   //     navigate("/location", { state: { setAsPrimary: false } });
//   //   } catch (error) {
//   //     console.error("Error handling current location:", error);
//   //     onClose();
//   //     navigate("/location", { state: { setAsPrimary: false } });
//   //   } finally {
//   //     setActionLoading(null);
//   //   }
//   // }, [
//   //   primaryAddressId,
//   //   removePrimaryAddress,
//   //   navigate,
//   //   onClose,
//   //   actionLoading,
//   // ]);

//   const handleUseCurrentLocation = useCallback(async () => {
//     if (actionLoading) return;

//     setActionLoading("location");

//     try {
//       // Don't remove the primary address - just navigate to location selection
//       // This preserves existing addresses while allowing new location selection
//       onClose();
//       navigate("/current-location", {
//         state: {
//           setAsPrimary: true, // Set this to true if you want it to be primary
//           source: "addressDrawer", // Optional: track where this came from
//         },
//       });
//     } catch (error) {
//       console.error("Error handling current location:", error);
//       onClose();
//       navigate("/current-location", { state: { setAsPrimary: true } });
//     } finally {
//       setActionLoading(null);
//     }
//   }, [navigate, onClose, actionLoading]);

//   // Handle deliver here
//   const handleDeliverHere = useCallback(
//     async (address) => {
//       if (actionLoading) return;

//       setActionLoading(address._id);

//       try {
//         const user = JSON.parse(localStorage.getItem("user"));
//         const customerId = user?._id;

//         if (!customerId) return;

//         // Update UI immediately
//         setPrimaryAddressId(address._id);
//         localStorage.setItem("primaryAddress", JSON.stringify(address));
//         localStorage.removeItem("cart");
//         // Update cache
//         const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
//         if (cachedAddresses) {
//           const cached = JSON.parse(cachedAddresses);
//           cached.primaryAddress = address._id;
//           localStorage.setItem(
//             `addresses_${customerId}`,
//             JSON.stringify(cached)
//           );
//         }

//         // Close modal first
//         onClose();

//         // API call
//         const response = await fetch(
//           `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/addresses/${address._id}/primary`,
//           {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//           }
//         );

//         if (response.ok) {
//           // Trigger refresh everywhere
//           window.dispatchEvent(new Event("addressUpdated"));

//           // Reload after a short delay
//           setTimeout(() => {
//             window.location.reload();
//           }, 100);
//         }
//       } catch (error) {
//         console.error("Error setting primary address:", error);
//       } finally {
//         setActionLoading(null);
//       }
//     },
//     [onClose, actionLoading]
//   );

//   // Handle delete address confirmation
//   const handleDeleteClick = useCallback((address) => {
//     setAddressToDelete(address);
//     setShowDeleteConfirm(true);
//   }, []);

//   // Handle delete address
//   const handleDeleteAddress = useCallback(async () => {
//     if (!addressToDelete) return;

//     try {
//       setActionLoading(`delete_${addressToDelete._id}`);
//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user?._id;

//       if (!customerId) {
//         throw new Error("Customer ID not found. Please login again.");
//       }

//       const response = await fetch(
//         `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/addresses/${addressToDelete._id}`,
//         {
//           method: "DELETE",
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to delete address");
//       }

//       const result = await response.json();

//       if (result.success) {
//         // Update local state immediately
//         const updatedAddresses = savedAddresses.filter(
//           (addr) => addr._id !== addressToDelete._id
//         );
//         setSavedAddresses(updatedAddresses);

//         // If deleted address was primary, clear primary address
//         let updatedPrimaryId = primaryAddressId;
//         if (primaryAddressId === addressToDelete._id) {
//           updatedPrimaryId = null;
//           setPrimaryAddressId(null);
//           localStorage.removeItem("primaryAddress");
//         }

//         // Update cache
//         localStorage.setItem(
//           `addresses_${customerId}`,
//           JSON.stringify({
//             addresses: updatedAddresses,
//             primaryAddress: updatedPrimaryId,
//           })
//         );
//         localStorage.setItem(
//           `addresses_timestamp_${customerId}`,
//           Date.now().toString()
//         );

//         // Trigger refresh everywhere
//         window.dispatchEvent(new Event("addressUpdated"));

//         // Close delete modal
//         setShowDeleteConfirm(false);
//         setAddressToDelete(null);
//       } else {
//         throw new Error(result.message || "Failed to delete address");
//       }
//     } catch (error) {
//       console.error("Error deleting address:", error);
//       alert(error.message || "Failed to delete address");
//     } finally {
//       setActionLoading(null);
//     }
//   }, [savedAddresses, primaryAddressId, addressToDelete]);

//   // Handle cancel delete
//   const handleCancelDelete = useCallback(() => {
//     setShowDeleteConfirm(false);
//     setAddressToDelete(null);
//   }, []);

//   // Helper functions
//   const getPrimaryName = useCallback((address) => {
//     if (!address) return "";

//     switch (address.addressType) {
//       case "Home":
//         return address.homeName || address.houseName || "";
//       case "PG":
//         return address.apartmentName || address.houseName || "";
//       case "School":
//         return address.schoolName || address.houseName || "";
//       case "Work":
//         return address.companyName || address.houseName || "";
//       default:
//         return address.houseName || "";
//     }
//   }, []);

//   const getAddressIcon = useCallback((type) => {
//     switch (type) {
//       case "Home":
//         return "🏠";
//       case "PG":
//         return "🏢";
//       case "School":
//         return "🎓";
//       case "Work":
//         return "💼";
//       default:
//         return "📍";
//     }
//   }, []);

//   const isPrimaryAddress = useCallback(
//     (addressId) => primaryAddressId === addressId,
//     [primaryAddressId]
//   );

//   const getPrimaryAddress = useCallback(
//     () => savedAddresses.find((addr) => addr._id === primaryAddressId),
//     [savedAddresses, primaryAddressId]
//   );

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (debounceTimerRef.current) {
//         clearTimeout(debounceTimerRef.current);
//       }
//       if (fetchAbortControllerRef.current) {
//         fetchAbortControllerRef.current.abort();
//       }
//       isModalMountedRef.current = false;
//     };
//   }, []);

//   if (!show) return null;

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: "rgba(0,0,0,0.5)",
//         zIndex: 10500,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "20px",
//       }}
//       onClick={onClose}
//     >
//       <div
//         style={{
//           width: "100%",
//           height: "100%",
//           maxWidth: "605px",
//           maxHeight: "100vh",
//           backgroundColor: "white",
//           borderRadius: "16px",
//           border: "none",
//           boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//           position: "relative",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Loading Overlay */}
//         {loading && (
//           <div
//             style={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               zIndex: 20,
//             }}
//           >
//             <div
//               className="spinner-border"
//               role="status"
//               style={{
//                 width: "2.5rem",
//                 height: "2.5rem",
//                 color: "#6B8E23",
//               }}
//             >
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div
//           style={{
//             padding: "23px",
//             borderBottom: "1px solid #f0f0f0",
//             flexShrink: 0,
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               width: "100%",
//               marginBottom: "10px",
//             }}
//           >
//             <h5
//               style={{
//                 margin: 0,
//                 color: "#2c2c2c",
//                 fontFamily: "Inter",
//                 fontWeight: "600",
//               }}
//             >
//               Delivery Location
//             </h5>

//             <button
//               type="button"
//               onClick={onClose}
//               style={{
//                 fontSize: "20px",
//                 border: "none",
//                 background: "none",
//                 cursor: "pointer",
//                 color: "#555",
//                 lineHeight: "1",
//                 flexShrink: 0,
//               }}
//             >
//               &times;
//             </button>
//           </div>

//           <p
//             style={{
//               margin: 0,
//               color: "#666",
//               fontSize: "14px",
//               fontFamily: "Inter",
//             }}
//           >
//             Select or add a delivery address
//           </p>
//         </div>

//         {/* Add New Address Button */}
//         {/* <div
//           style={{
//             padding: "0 20px 20px 20px",
//             flexShrink: 0,
//           }}
//         >
//           <button
//             onClick={handleAddNewAddress}
//             style={{
//               width: "100%",
//               padding: "12px 16px",
//               backgroundColor: "transparent",
//               border: "2px dashed #6B8E23",
//               borderRadius: "12px",
//               color: "#6B8E23",
//               fontSize: "14px",
//               fontWeight: "500",
//               cursor: "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "8px",
//               fontFamily: "Inter",
//               transition: "all 0.2s ease",
//             }}
//             onMouseEnter={(e) => {
//               e.target.style.backgroundColor = "#f8fff8";
//             }}
//             onMouseLeave={(e) => {
//               e.target.style.backgroundColor = "transparent";
//             }}
//           >
//             <FaPlus size={14} />
//             Add New Address
//           </button>
//         </div> */}

//         {/* Use Current Location Button */}
//         <div
//           style={{
//             padding: "0 20px 20px 20px",
//             flexShrink: 0,
//           }}
//         >
//           <button
//             onClick={handleUseCurrentLocation}
//             disabled={actionLoading === "current-location"}
//             style={{
//               width: "100%",
//               padding: "12px 16px",
//               backgroundColor: "#6B8E23",
//               border: "1px solid #6B8E23",
//               borderRadius: "12px",
//               color: "#fff",
//               fontSize: "14px",
//               fontWeight: "500",
//               cursor:
//                 actionLoading === "current-location"
//                   ? "not-allowed"
//                   : "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "8px",
//               fontFamily: "Inter",
//               transition: "all 0.2s ease",
//               opacity: actionLoading === "current-location" ? 0.7 : 1,
//             }}
//             onMouseEnter={(e) => {
//               if (!actionLoading) {
//                 e.target.style.backgroundColor = "#5a7a1c";
//               }
//             }}
//             onMouseLeave={(e) => {
//               if (!actionLoading) {
//                 e.target.style.backgroundColor = "#6B8E23";
//               }
//             }}
//           >
//             {actionLoading === "current-location" ? (
//               <>
//                 <div className="spinner-border spinner-border-sm" role="status">
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//                 Getting location...
//               </>
//             ) : (
//               <>
//                 <FaCrosshairs size={16} />
//                 Change location
//                 {/* {primaryAddressId && " (Clear primary)"} */}
//               </>
//             )}
//           </button>
//         </div>

//         {/* Saved Addresses */}
//         <div
//           style={{
//             padding: "0 20px 20px 20px",
//             flex: 1,
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: "column",
//             opacity: loading ? 0.5 : 1,
//             transition: "opacity 0.3s",
//           }}
//         >
//           <h6
//             style={{
//               color: "#2c2c2c",
//               fontFamily: "Inter",
//               fontWeight: "600",
//               marginBottom: "16px",
//               fontSize: "16px",
//             }}
//           >
//             Saved Addresses
//             {primaryAddressId &&
//               ` (Primary: ${getPrimaryName(getPrimaryAddress())})`}
//           </h6>

//           {savedAddresses.length === 0 && !loading ? (
//             <div
//               style={{
//                 textAlign: "center",
//                 padding: "20px",
//                 color: "#666",
//                 fontFamily: "Inter",
//                 flex: 1,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <FaMapMarkerAlt size={32} color="#ccc" className="mb-2" />
//               <p style={{ margin: 0, fontSize: "14px" }}>
//                 No saved addresses yet. Click "Add New Address" above.
//               </p>
//             </div>
//           ) : (
//             <div style={{ flex: 1, overflowY: "auto" }}>
//               {savedAddresses.map((address, index) => (
//                 <div
//                   key={address._id}
//                   style={{
//                     padding: "16px",
//                     border: isPrimaryAddress(address._id)
//                       ? "2px solid #6B8E23"
//                       : "1px solid #e0e0e0",
//                     borderRadius: "12px",
//                     marginBottom:
//                       index < savedAddresses.length - 1 ? "12px" : "0",
//                     backgroundColor: isPrimaryAddress(address._id)
//                       ? "#f8fff8"
//                       : "white",
//                     transition: "all 0.2s ease",
//                   }}
//                 >
//                   <div className="d-flex justify-content-between align-items-start">
//                     <div className="d-flex align-items-start flex-grow-1">
//                       <span
//                         style={{
//                           fontSize: "18px",
//                           marginRight: "12px",
//                           marginTop: "2px",
//                         }}
//                       >
//                         {getAddressIcon(address.addressType)}
//                       </span>
//                       <div className="flex-grow-1">
//                         <div className="d-flex align-items-center mb-1">
//                           <h6
//                             style={{
//                               margin: 0,
//                               color: "#2c2c2c",
//                               fontFamily: "Inter",
//                               fontWeight: "600",
//                               fontSize: "14px",
//                             }}
//                           >
//                             {getPrimaryName(address)}
//                           </h6>
//                           {isPrimaryAddress(address._id) && (
//                             <span
//                               style={{
//                                 marginLeft: "8px",
//                                 fontSize: "10px",
//                                 color: "#6B8E23",
//                                 fontWeight: "500",
//                                 backgroundColor: "#f0f9f0",
//                                 padding: "2px 6px",
//                                 borderRadius: "4px",
//                               }}
//                             >
//                               PRIMARY
//                             </span>
//                           )}
//                         </div>
//                         <p
//                           style={{
//                             margin: 0,
//                             color: "#666",
//                             fontSize: "12px",
//                             fontFamily: "Inter",
//                             lineHeight: "1.4",
//                           }}
//                         >
//                           {address.fullAddress}
//                         </p>
//                       </div>
//                     </div>
//                     <div
//                       style={{
//                         display: "flex",
//                         gap: "8px",
//                         alignItems: "center",
//                       }}
//                     >
//                       <button
//                         onClick={() => handleDeliverHere(address)}
//                         disabled={actionLoading === address._id}
//                         style={{
//                           backgroundColor: isPrimaryAddress(address._id)
//                             ? "#6B8E23"
//                             : "transparent",
//                           border: isPrimaryAddress(address._id)
//                             ? "none"
//                             : "1px solid #6B8E23",
//                           borderRadius: "8px",
//                           color: isPrimaryAddress(address._id)
//                             ? "white"
//                             : "#6B8E23",
//                           fontSize: "12px",
//                           fontWeight: "500",
//                           padding: "6px 12px",
//                           cursor:
//                             actionLoading === address._id
//                               ? "not-allowed"
//                               : "pointer",
//                           whiteSpace: "nowrap",
//                           fontFamily: "Inter",
//                           transition: "all 0.2s ease",
//                           minWidth: "100px",
//                           opacity: actionLoading === address._id ? 0.7 : 1,
//                         }}
//                         onMouseEnter={(e) => {
//                           if (
//                             !isPrimaryAddress(address._id) &&
//                             !actionLoading
//                           ) {
//                             e.target.style.backgroundColor = "#6B8E23";
//                             e.target.style.color = "white";
//                           }
//                         }}
//                         onMouseLeave={(e) => {
//                           if (
//                             !isPrimaryAddress(address._id) &&
//                             !actionLoading
//                           ) {
//                             e.target.style.backgroundColor = "transparent";
//                             e.target.style.color = "#6B8E23";
//                           }
//                         }}
//                       >
//                         {actionLoading === address._id ? (
//                           <div
//                             className="spinner-border spinner-border-sm"
//                             role="status"
//                           >
//                             <span className="visually-hidden">Loading...</span>
//                           </div>
//                         ) : isPrimaryAddress(address._id) ? (
//                           <>
//                             <FaCheckCircle size={12} className="me-1" />
//                             Selected
//                           </>
//                         ) : (
//                           "Deliver here"
//                         )}
//                       </button>

//                       <button
//                         onClick={() => handleDeleteClick(address)}
//                         disabled={actionLoading === `delete_${address._id}`}
//                         style={{
//                           backgroundColor: "transparent",
//                           border: "1px solid #dc3545",
//                           borderRadius: "6px",
//                           color: "#dc3545",
//                           fontSize: "11px",
//                           fontWeight: "500",
//                           padding: "4px 8px",
//                           cursor:
//                             actionLoading === `delete_${address._id}`
//                               ? "not-allowed"
//                               : "pointer",
//                           fontFamily: "Inter",
//                           transition: "all 0.2s ease",
//                           opacity:
//                             actionLoading === `delete_${address._id}` ? 0.7 : 1,
//                           display: "flex",
//                           alignItems: "center",
//                           gap: "4px",
//                         }}
//                       >
//                         {actionLoading === `delete_${address._id}` ? (
//                           <div
//                             className="spinner-border spinner-border-sm"
//                             role="status"
//                             style={{ width: "12px", height: "12px" }}
//                           >
//                             <span className="visually-hidden">Loading...</span>
//                           </div>
//                         ) : (
//                           <FaTrash size={10} />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Search Action Loading */}
//         {actionLoading === "search" && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               backgroundColor: "rgba(255, 255, 255, 0.8)",
//               zIndex: 10,
//               borderRadius: "16px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <div
//               className="spinner-border"
//               role="status"
//               style={{
//                 width: "3rem",
//                 height: "3rem",
//                 color: "#6B8E23",
//               }}
//             >
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Delete Confirmation Modal */}
//       <ConfirmationModal
//         show={showDeleteConfirm}
//         onClose={handleCancelDelete}
//         onConfirm={handleDeleteAddress}
//         title="Delete Address"
//         message={`Are you sure you want to delete this address?${
//           addressToDelete ? `\n\n${getPrimaryName(addressToDelete)}` : ""
//         }`}
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmButtonStyle="danger"
//       />
//     </div>
//   );
// };

// export default LocationModal2;
