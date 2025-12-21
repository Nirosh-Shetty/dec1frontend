import React, { useState, useCallback, useEffect, useRef } from "react";
import "./../Styles/LocationDropdown.css";

const LocationDropdown = ({ onClose, onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);

  const API_KEY = import.meta.env.VITE_MAP_KEY;

  // Initialize Google Maps services
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
    }
  }, []);

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 2) {
      fetchSearchSuggestions(value);
    } else {
      setSearchSuggestions([]);
      setShowSearch(false);
    }
  };

  // Fetch search suggestions from Google Places API
  const fetchSearchSuggestions = useCallback((query) => {
    if (!autocompleteServiceRef.current) return;

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: query,
        types: ["geocode", "establishment"],
        componentRestrictions: { country: "in" }, // Change country code as needed
      },
      (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSearchSuggestions(predictions);
          setShowSearch(true);
          setError("");
        } else {
          setSearchSuggestions([]);
          if (status !== "ZERO_RESULTS") {
            console.error("Error fetching suggestions:", status);
          }
        }
      }
    );
  }, []);

  // Handle "Use my current location"
  const handleUseCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted_address;

            // Check serviceability
            await saveLocationToLocalStorage({
              lat: latitude,
              lng: longitude,
              address: address,
              name: "Current Location",
            });

            // Call onLocationSelect callback if provided
            if (onLocationSelect) {
              onLocationSelect({ lat: latitude, lng: longitude, address });
            }

            // Close the dropdown
            if (onClose) onClose();
          } else {
            setError("Could not get address for your location");
          }
        } catch (error) {
          console.error("Error getting address:", error);
          setError("Failed to get your location address");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError(
              "Location permission denied. Please enable location services."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setError("Location request timed out.");
            break;
          default:
            setError("An unknown error occurred.");
            break;
        }
      }
    );
  }, [onClose, onLocationSelect]);

  // Handle search suggestion selection
  const handleSuggestionSelect = useCallback(
    async (place) => {
      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );
      }

      setIsLoading(true);
      setShowSearch(false);

      placesServiceRef.current.getDetails(
        {
          placeId: place.place_id,
          fields: ["geometry", "name", "formatted_address", "vicinity"],
        },
        async (placeResult, status) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const locationData = {
              lat: placeResult.geometry.location.lat(),
              lng: placeResult.geometry.location.lng(),
            };

            await saveLocationToLocalStorage({
              ...locationData,
              address: placeResult.formatted_address,
              name:
                placeResult.name || placeResult.formatted_address.split(",")[0],
            });

            // Call onLocationSelect callback if provided
            if (onLocationSelect) {
              onLocationSelect({
                ...locationData,
                address: placeResult.formatted_address,
                name:
                  placeResult.name ||
                  placeResult.formatted_address.split(",")[0],
              });
            }

            // Close the dropdown
            if (onClose) onClose();
          } else {
            setError("Failed to get location details");
          }
        }
      );
    },
    [onClose, onLocationSelect]
  );

  // Save location to localStorage
  const saveLocationToLocalStorage = async (location) => {
    try {
      // Check serviceability
      const serviceabilityResponse = await fetch(
        "https://dd-merge-backend-2.onrender.com/api/Hub/validate-location",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: location.lat.toString(),
            lng: location.lng.toString(),
          }),
        }
      );

      const data = await serviceabilityResponse.json();

      let hubData = null;
      if (data.success && data.hubs && data.hubs.length > 0) {
        hubData = data.hubs[0];
      }

      const locationToSave = {
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
        fullAddress: location.address,
        hubName: hubData?.hubName || "",
        hubId: hubData?.hub || null,
        isServiceable: data.isServiceable || false,
        name: location.name,
        timestamp: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem("currentLocation", JSON.stringify(locationToSave));

      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error saving location:", error);
      // Still save basic location info even if serviceability check fails
      const locationToSave = {
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
        fullAddress: location.address,
        hubName: "",
        hubId: null,
        isServiceable: false,
        name: location.name,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("currentLocation", JSON.stringify(locationToSave));
      window.location.reload();
    }
  };

  // Get current location from localStorage
  const getCurrentLocation = () => {
    try {
      const savedLocation = localStorage.getItem("currentLocation");
      return savedLocation ? JSON.parse(savedLocation) : null;
    } catch (error) {
      console.error("Error reading location from localStorage:", error);
      return null;
    }
  };

  const currentLocation = getCurrentLocation();

  return (
    <div className="location-dropdown">
      <div className="location-dropdown-header">
        <h3>Enter Delivery Location</h3>
        <p>We need your delivery location to serve you a delicious meal.</p>
      </div>

      <div className="location-search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search for area, street name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="location-search-input"
            onClick={() => setShowSearch(true)}
          />
          {isLoading && <div className="loading-spinner"></div>}
        </div>

        {error && <div className="error-message">{error}</div>}

        {showSearch && searchSuggestions.length > 0 && (
          <div className="search-suggestions">
            {searchSuggestions.map((place, index) => (
              <div
                key={place.place_id}
                className="suggestion-item"
                onClick={() => handleSuggestionSelect(place)}
              >
                <div className="suggestion-main-text">
                  {place.structured_formatting.main_text}
                </div>
                <div className="suggestion-secondary-text">
                  {place.structured_formatting.secondary_text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="current-location-section">
        <button
          className="current-location-btn"
          onClick={handleUseCurrentLocation}
          disabled={isGettingLocation}
        >
          {isGettingLocation ? (
            <>
              <div className="spinner"></div>
              Getting your location...
            </>
          ) : (
            <>
              <span className="location-icon">📍</span>
              Use my current location
            </>
          )}
        </button>
      </div>

      {currentLocation && (
        <div className="saved-location-section">
          <h4>DELIVERY Showing Default Location</h4>
          <div className="saved-location-card">
            <div className="saved-location-icon">🏠</div>
            <div className="saved-location-info">
              <div className="saved-location-name">{currentLocation.name}</div>
              <div className="saved-location-address">
                {currentLocation.fullAddress}
              </div>
              {currentLocation.isServiceable && (
                <div className="serviceable-badge">Service Available</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="location-dropdown-footer">
        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LocationDropdown;
