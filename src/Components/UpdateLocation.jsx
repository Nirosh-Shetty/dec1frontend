import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import locationpng from "./../assets/deliverylocation.svg";
import homeimg from "./../assets/ion_home-outline.png";
import homeimg2 from "./../assets/ion_home-outline-white.svg";
import apartmentimg from "./../assets/apartment.png";
import apartmentimg2 from "./../assets/tabler_building-skyscraper-white.svg";
import workimg from "./../assets/streamline-ultimate_work-from-home-user-sofa.png";
import workimg2 from "./../assets/streamline-ultimate_work-from-home-user-sofa-white.svg";
import schoolimg from "./../assets/streamline-ultimate-color_study-exam-math.png";
import schoolimg2 from "./../assets/streamline-ultimate-color_study-exam-math-white.png";
import cross from "./../assets/cross.png";
import { CircleCheck, Search, MapPin } from "lucide-react";
import spilt from "./../assets/spilt.png";
import secure from "./../assets/secure.png";
import warning from "./../assets/warning.png";
import axios from "axios";
import { MdAddLocationAlt, MdMyLocation } from "react-icons/md";
import "./../Styles/Location.css";
import no_location from "./../assets/red-location.png";

const UpdateLocation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [address, setAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const isLargeScreen = window.innerWidth >= 768;

  // Location permission states
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);

  // Address form state
  const [hub, setHub] = useState([]);
  const [houseName, setHouseName] = useState("");
  const [homeName, setHomeName] = useState("");
  const [addressType, setAddressType] = useState("Home"); // Set Home as default
  const [landmark, setLandmark] = useState("");
  const [floor, setFloor] = useState("");

  // PG specific fields
  const [apartmentName, setApartmentName] = useState("");
  const [towerBlock, setTowerBlock] = useState("");
  const [flat, setFlat] = useState("");

  // School specific fields
  const [schoolName, setSchoolName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentSection, setStudentSection] = useState("");

  // Work specific field
  const [companyName, setCompanyName] = useState("");
  const [floorNo, setFloorNo] = useState("");

  // Serviceability states
  const [showServiceablePopup, setShowServiceablePopup] = useState(false);
  const [serviceRequestName, setServiceRequestName] = useState();
  const [serviceRequestPhone, setServiceRequestPhone] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isServiceable, setIsServiceable] = useState(null);
  const [isValidatingServiceability, setIsValidatingServiceability] =
    useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const searchInputRef = useRef(null);
  const infoWindowRef = useRef(null);
  const fixedPinRef = useRef(null);
  const fixedMessageRef = useRef(null);

  const API_KEY = import.meta.env.VITE_MAP_KEY;

  // Track if we're editing an address
  const [isEditing, setIsEditing] = useState(false);

  // Check location permission on component mount
  useEffect(() => {
    checkLocationPermission();

    // Handle back navigation to go to /home
    const handleBackButton = (e) => {
      e.preventDefault();
      navigate("/home");
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  // Check location permission
  const checkLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      setLocationPermissionDenied(true);
      setShowLocationPermission(true);
      return;
    }

    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "denied") {
          setLocationDenied(true);
          setLocationPermissionDenied(true);
          setShowLocationPermission(true);
        } else if (result.state === "prompt") {
          setShowLocationPermission(true);
        }
      })
      .catch(() => {
        setShowLocationPermission(true);
      });
  };

  // Handle allow location
  const handleAllowLocation = () => {
    setShowLocationPermission(false);
    setLocationPermissionDenied(false);
    getCurrentLocation();
  };

  // Handle deny location
  const handleDenyLocation = () => {
    setLocationDenied(true);
    setLocationPermissionDenied(true);
    setShowLocationPermission(false);
    const defaultLocation = { lat: 40.7128, lng: -74.006 };
    setCurrentLocation(defaultLocation);
    setSelectedLocation(defaultLocation);
    setIsLoading(false);
  };

  // Handle retry location
  const handleRetryLocation = () => {
    setShowLocationPermission(false);
    setLocationPermissionDenied(false);

    if (!scriptLoaded) {
      setIsLoading(true);
      setTimeout(() => {
        if (window.google && window.google.maps) {
          setScriptLoaded(true);
          initializeServices();
          getCurrentLocation();
        } else {
          setError("Google Maps failed to load. Please refresh the page.");
          setIsLoading(false);
        }
      }, 500);
    } else {
      getCurrentLocation();
    }
  };

  // Check if coming from modal with selected place OR editing existing address
  useEffect(() => {
    if (location.state?.selectedPlace) {
      const { selectedPlace } = location.state;
      handleSelectedPlaceFromModal(selectedPlace);
    } else if (location.state?.editingAddress) {
      const { editingAddress } = location.state;
      setIsEditing(true);
      handleEditingAddress(editingAddress);
    }
  }, [location.state]);

  // Handle place selected from modal
  const handleSelectedPlaceFromModal = (selectedPlace) => {
    if (selectedPlace.location && selectedPlace.address) {
      // Convert GeoJSON Point to lat/lng object if needed
      let locationObj = selectedPlace.location;
      if (
        selectedPlace.location.type === "Point" &&
        selectedPlace.location.coordinates
      ) {
        locationObj = {
          lat: selectedPlace.location.coordinates[1],
          lng: selectedPlace.location.coordinates[0],
        };
      }

      setSelectedLocation(locationObj);
      setAddress(selectedPlace.address);
      setHouseName(selectedPlace.name || selectedPlace.address.split(",")[0]);

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.panTo(locationObj);
        mapInstanceRef.current.setZoom(16);
        markerRef.current.setPosition(locationObj);

        if (infoWindowRef.current) {
          infoWindowRef.current.setPosition(locationObj);
        }
      }

      setIsConfirmed(false);
      validateServiceability(locationObj);
    }
  };

  // Handle editing existing address
  const handleEditingAddress = (editingAddress) => {
    console.log("Editing address:", editingAddress);

    let locationCoords = { lat: 40.7128, lng: -74.006 };

    if (editingAddress.location) {
      if (
        editingAddress.location.coordinates &&
        editingAddress.location.coordinates.length >= 2
      ) {
        locationCoords = {
          lng: parseFloat(editingAddress.location.coordinates[0]),
          lat: parseFloat(editingAddress.location.coordinates[1]),
        };
      } else if (editingAddress.location.lat && editingAddress.location.lng) {
        locationCoords = {
          lat: parseFloat(editingAddress.location.lat),
          lng: parseFloat(editingAddress.location.lng),
        };
      }
    }

    setSelectedLocation(locationCoords);
    setAddress(editingAddress.fullAddress || editingAddress.address || "");
    setHouseName(editingAddress.houseName || "");
    setAddressType(editingAddress.addressType || "Home"); // Default to Home if not specified

    // Pre-fill all the form fields based on address type
    if (editingAddress.addressType === "Home") {
      setHomeName(editingAddress.homeName || "");
      setLandmark(editingAddress.landmark || "");
      setFloor(editingAddress.floor || "");
    } else if (editingAddress.addressType === "PG") {
      setApartmentName(editingAddress.apartmentName || "");
      setTowerBlock(editingAddress.towerBlock || "");
      setFlat(editingAddress.flat || "");
      setFloor(editingAddress.floor || "");
    } else if (editingAddress.addressType === "School") {
      setSchoolName(editingAddress.schoolName || "");
      setStudentName(editingAddress.studentName || "");
      setStudentClass(editingAddress.studentClass || "");
      setStudentSection(editingAddress.studentSection || "");
    } else if (editingAddress.addressType === "Work") {
      setCompanyName(editingAddress.companyName || "");
      setFloorNo(editingAddress.floorNo || "");
    }

    setIsConfirmed(false);
    validateServiceability(locationCoords);
  };

  // Initialize services
  const initializeServices = useCallback(() => {
    if (window.google && window.google.maps && !geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();

      if (mapInstanceRef.current && !placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          mapInstanceRef.current
        );
      }
    }
  }, []);

  // Get address from coordinates - UPDATED VERSION
  const getAddressFromCoordinates = useCallback(
    async (lat, lng) => {
      if (!window.google || !window.google.maps) {
        console.warn("Google Maps not available");

        // Try reverse geocoding using a fallback API
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data.display_name) {
            setAddress(data.display_name);
            setHouseName(data.display_name.split(",")[0]);
          } else {
            setAddress("Location detected, but address not available");
          }
        } catch (fallbackError) {
          console.error("Fallback geocoding failed:", fallbackError);
          setAddress(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }

        return;
      }

      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }

      if (
        typeof lat !== "number" ||
        typeof lng !== "number" ||
        isNaN(lat) ||
        isNaN(lng)
      ) {
        console.warn("Invalid coordinates:", { lat, lng });
        setAddress("Invalid location coordinates");
        return;
      }

      setIsGeocoding(true);

      try {
        const response = await new Promise((resolve, reject) => {
          geocoderRef.current.geocode(
            { location: { lat, lng } },
            (results, status) => {
              if (status === "OK" && results && results[0]) {
                resolve(results[0].formatted_address);
              } else if (status === "ZERO_RESULTS") {
                resolve("No address found for this location");
              } else {
                reject(new Error(`Geocoding failed: ${status}`));
              }
            }
          );
        });

        setAddress(response);
        const shortAddress = response.split(",")[0];
        setHouseName(shortAddress);
        console.log("Address found:", response);
      } catch (error) {
        console.error("Geocoding error:", error);

        // Try with simpler coordinates
        try {
          const simpleResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
          );
          const data = await simpleResponse.json();
          if (data.results && data.results[0]) {
            setAddress(data.results[0].formatted_address);
            setHouseName(data.results[0].formatted_address.split(",")[0]);
          } else {
            setAddress(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        } catch (fetchError) {
          console.error("Fallback fetch error:", fetchError);
          setAddress("Address not available");
        }
      } finally {
        setIsGeocoding(false);
      }
    },
    [API_KEY]
  );

  // Validate serviceability of a location
  const validateServiceability = async (location) => {
    if (!location) return;

    try {
      setIsValidatingServiceability(true);

      const response = await fetch(
        "https://api.dailydish.in/api/Hub/validate-location",
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

      const data = await response.json();

      if (data.success) {
        setIsServiceable(data.serviceable);
        if (data.serviceable) {
          setHub(data.hubs || []);
          console.log("Location is serviceable. Hubs:", data.hubs);
          // Auto-confirm location when serviceable
          setIsConfirmed(true);
        } else {
          console.log("Location is not serviceable");
          setHub([]);
          setIsConfirmed(false);
        }
      } else {
        console.error("Serviceability validation failed:", data.message);
        setIsServiceable(null);
        setHub([]);
        setIsConfirmed(false);
      }
    } catch (error) {
      console.error("Serviceability validation error:", error);
      setIsServiceable(null);
      setHub([]);
      setIsConfirmed(false);
    } finally {
      setIsValidatingServiceability(false);
    }
  };

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setScriptLoaded(true);
      initializeServices();
      return;
    }

    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          setScriptLoaded(true);
          initializeServices();
          clearInterval(checkGoogle);
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setScriptLoaded(true);
      initializeServices();
      console.log("Google Maps script loaded successfully");
    };

    script.onerror = () => {
      console.error("Google Maps script failed to load");
      setError("Failed to load Google Maps. Please check your API key.");
      setIsLoading(false);

      // Show the form anyway so user can still add address
      setIsServiceable(null);
      setIsConfirmed(true);
    };

    document.head.appendChild(script);
  }, [initializeServices]);

  // Initialize map when script is loaded AND we have a location
  useEffect(() => {
    if (
      scriptLoaded &&
      selectedLocation &&
      !showLocationPermission &&
      !locationDenied &&
      !mapInstanceRef.current
    ) {
      console.log(
        "Script loaded and selected location available:",
        selectedLocation
      );

      setTimeout(() => {
        if (mapRef.current) {
          console.log("Initializing map with location:", selectedLocation);
          initializeMap(selectedLocation);

          // Convert GeoJSON Point to lat/lng object if needed
          let locationObj = selectedLocation;
          if (
            selectedLocation.type === "Point" &&
            selectedLocation.coordinates
          ) {
            locationObj = {
              lat: selectedLocation.coordinates[1],
              lng: selectedLocation.coordinates[0],
            };
          }

          if (
            !address ||
            address === "Detecting your address..." ||
            address === "Address not available"
          ) {
            getAddressFromCoordinates(locationObj.lat, locationObj.lng);
          }

          validateServiceability(locationObj);
        }
        setIsLoading(false);
      }, 500);

      // Fallback: If map doesn't load within 3 seconds, show form anyway
      setTimeout(() => {
        if (!mapInstanceRef.current) {
          console.log("⏰ Map loading timeout - showing address form anyway");
          setIsServiceable(null);
          setIsConfirmed(true);
          setIsLoading(false);
        }
      }, 3000);
    }
  }, [scriptLoaded, selectedLocation, showLocationPermission, locationDenied]);

  // Set initial location based on scenario
  useEffect(() => {
    if (scriptLoaded) {
      if (location.state?.selectedPlace) {
        const { selectedPlace } = location.state;
        setSelectedLocation(selectedPlace.location);
        setAddress(selectedPlace.address);
        setHouseName(selectedPlace.name || selectedPlace.address.split(",")[0]);
      } else if (location.state?.editingAddress) {
        const { editingAddress } = location.state;
        let locationCoords = { lat: 40.7128, lng: -74.006 };

        if (editingAddress.location) {
          if (
            editingAddress.location.coordinates &&
            editingAddress.location.coordinates.length >= 2
          ) {
            locationCoords = {
              lng: parseFloat(editingAddress.location.coordinates[0]),
              lat: parseFloat(editingAddress.location.coordinates[1]),
            };
          } else if (
            editingAddress.location.lat &&
            editingAddress.location.lng
          ) {
            locationCoords = {
              lat: parseFloat(editingAddress.location.lat),
              lng: parseFloat(editingAddress.location.lng),
            };
          }
        }

        setSelectedLocation(locationCoords);
        setAddress(editingAddress.fullAddress || editingAddress.address || "");
      } else {
        getCurrentLocation();
      }
    }
  }, [scriptLoaded, showLocationPermission, locationDenied]);

  // Get current location - UPDATED VERSION
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location = {
          lat: latitude,
          lng: longitude,
        };

        console.log("Got current location coordinates:", location);
        setCurrentLocation(location);
        setSelectedLocation(location);
        setLocationDenied(false);
        setLocationPermissionDenied(false);

        // Get address from coordinates
        await getAddressFromCoordinates(latitude, longitude);

        // Validate serviceability
        validateServiceability(location);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermissionDenied(true);
          setLocationDenied(true);
          setError("Location access denied by user");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setError("Location information is unavailable. Trying fallback...");
        } else if (error.code === error.TIMEOUT) {
          setError("Location request timed out. Trying fallback...");
        } else {
          setError(`Unable to retrieve your location: ${error.message}`);
        }

        // Use fallback location (Delhi coordinates)
        const fallbackLocation = { lat: 28.6139, lng: 77.209 }; // Delhi coordinates
        console.log("Using fallback location:", fallbackLocation);
        setCurrentLocation(fallbackLocation);
        setSelectedLocation(fallbackLocation);

        // Get address for fallback location
        getAddressFromCoordinates(fallbackLocation.lat, fallbackLocation.lng);

        // Validate serviceability
        validateServiceability(fallbackLocation);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Don't use cached location
      }
    );
  };

  const initializeMap = (location) => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.error("Map container not found or Google Maps not loaded");
      // Show address form anyway if map fails
      setIsServiceable(null);
      setIsConfirmed(true);
      return;
    }

    try {
      // Convert GeoJSON Point to lat/lng object if needed
      let mapCenter = location;
      if (location.type === "Point" && location.coordinates) {
        mapCenter = {
          lat: location.coordinates[1],
          lng: location.coordinates[0],
        };
      }

      console.log("Creating new map instance at:", mapCenter);
      console.log("Map container element:", mapRef.current);
      console.log("Google Maps available:", !!window.google?.maps);

      if (!mapRef.current) {
        console.error("Map container not found!");
        return;
      }

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 16,
        center: mapCenter,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        rotateControl: false,
        scaleControl: false,
        // panControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
        backgroundColor: "#f5f5f5",
        disableDefaultUI: false,
        gestureHandling: "greedy",
        disableDefaultUI: true, // This will disable all default UI controls
      });

      mapInstanceRef.current = map;

      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          map
        );
      }

      // Create custom location button
      const locationButton = document.createElement("button");
      locationButton.style.backgroundColor = "#fff";
      locationButton.style.border = "2px solid #fff";
      locationButton.style.borderRadius = "8px";
      locationButton.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      locationButton.style.color = "#6b8e23";
      locationButton.style.cursor = "pointer";
      locationButton.style.padding = "10px";
      locationButton.style.width = "40px";
      locationButton.style.height = "40px";
      locationButton.style.display = "flex";
      locationButton.style.alignItems = "center";
      locationButton.style.justifyContent = "center";
      locationButton.style.margin = "10px";
      locationButton.style.transition = "all 0.3s ease";
      locationButton.style.fontSize = "24px";

      locationButton.innerHTML = `
  <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
  </svg>
`;

      locationButton.addEventListener("mouseenter", () => {
        locationButton.style.backgroundColor = "#f8f8f8";
        locationButton.style.transform = "scale(1.05)";
      });

      locationButton.addEventListener("mouseleave", () => {
        locationButton.style.backgroundColor = "#fff";
        locationButton.style.transform = "scale(1)";
      });

      locationButton.addEventListener("click", () => {
        locationButton.innerHTML = `
    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
  `;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };

              console.log("Current location:", currentLocation);

              map.setCenter(currentLocation);
              map.setZoom(16);

              if (markerRef.current) {
                markerRef.current.setPosition(currentLocation);
              }

              setSelectedLocation(currentLocation);
              setIsConfirmed(false);

              getAddressFromCoordinates(
                currentLocation.lat,
                currentLocation.lng
              );

              validateServiceability(currentLocation);

              locationButton.innerHTML = `
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
          </svg>
        `;
            },
            (error) => {
              console.error("Error getting location:", error);

              if (error.code === error.PERMISSION_DENIED) {
                setLocationPermissionDenied(true);
                alert(
                  "Location access denied. Please enable location permissions in your browser settings."
                );
              } else {
                alert("Unable to get your location. Please try again.");
              }

              locationButton.innerHTML = `
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
          </svg>
        `;
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        } else {
          alert("Geolocation is not supported by your browser");
        }
      });

      map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(
        locationButton
      );

      // Create fixed pin element
      const fixedPinElement = document.createElement("div");
      fixedPinElement.style.position = "absolute";
      fixedPinElement.style.top = "50%";
      fixedPinElement.style.left = "50%";
      fixedPinElement.style.transform = "translate(-50%, -100%)";
      fixedPinElement.style.width = "40px";
      fixedPinElement.style.height = "50px";
      fixedPinElement.style.pointerEvents = "none";
      fixedPinElement.style.zIndex = "1000";

      fixedPinElement.innerHTML = `
  <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @media (max-width: 480px) {
        .pin-line {
          animation: pulse 1.5s ease-in-out infinite !important;
        }
      }
    </style>
    <circle cx="20" cy="10" r="8" fill="#6B8E23" stroke="#fff" stroke-width="2"/>
    <line 
      x1="20" y1="18" 
      x2="20" y2="45" 
      stroke="#6B8E23" 
      stroke-width="3" 
      stroke-linecap="round"
      class="pin-line"
      style="animation: pulse 2s ease-in-out infinite;"
    />
    <ellipse cx="20" cy="48" rx="4" ry="2" fill="#000" opacity="0.2"/>
  </svg>
`;

      const fixedMessageElement = document.createElement("div");
      fixedMessageElement.style.position = "absolute";
      fixedMessageElement.style.top = "calc(50% - 70px)";
      fixedMessageElement.style.left = "50%";
      fixedMessageElement.style.transform = "translateX(-50%)";
      fixedMessageElement.style.background = "#6b8e23";
      fixedMessageElement.style.color = "white";
      fixedMessageElement.style.padding = "8px 12px";
      fixedMessageElement.style.borderRadius = "6px";
      fixedMessageElement.style.fontFamily = "Arial, sans-serif";
      fixedMessageElement.style.fontSize = "12px";
      fixedMessageElement.style.fontWeight = "700";
      fixedMessageElement.style.lineHeight = "1.2";
      fixedMessageElement.style.maxWidth = "200px";
      fixedMessageElement.style.textAlign = "center";
      fixedMessageElement.style.pointerEvents = "none";
      fixedMessageElement.style.zIndex = "1000";
      fixedMessageElement.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

      const mobileStyles = `
  @media (max-width: 480px) {
    .fixed-pin-message {
      top: calc(50% - 60px) !important;
      padding: 6px 10px !important;
      font-size: 11px !important;
      max-width: 160px !important;
      border-radius: 4px !important;
    }
    .fixed-pin-message div:first-child {
      font-size: 10px !important;
    }
    .fixed-pin-message div:last-child {
      font-size: 9px !important;
      margin-top: 1px !important;
    }
  }
  
  @media (max-width: 360px) {
    .fixed-pin-message {
      top: calc(50% - 55px) !important;
      padding: 5px 8px !important;
      font-size: 10px !important;
      max-width: 140px !important;
    }
    .fixed-pin-message div:first-child {
      font-size: 9px !important;
    }
    .fixed-pin-message div:last-child {
      font-size: 8px !important;
    }
  }
  
  @media (min-width: 481px) and (max-width: 768px) {
    .fixed-pin-message {
      top: calc(50% - 65px) !important;
      padding: 7px 10px !important;
      font-size: 11px !important;
      max-width: 180px !important;
    }
  }
`;

      fixedMessageElement.className = "fixed-pin-message";

      const styleElement = document.createElement("style");
      styleElement.textContent = mobileStyles;
      document.head.appendChild(styleElement);

      fixedMessageElement.innerHTML = `
  <div>Order will be delivered here</div>
  <div style="font-size: 10px; opacity: 0.9; margin-top: 2px; font-weight: normal;">
    Move the map to set delivery location
  </div>
`;

      const pinStyles = `
  @media (max-width: 480px) {
    .fixed-pin {
      width: 32px !important;
      height: 40px !important;
    }
    .fixed-pin svg {
      width: 32px !important;
      height: 40px !important;
    }
  }
  
  @media (max-width: 360px) {
    .fixed-pin {
      width: 28px !important;
      height: 35px !important;
    }
    .fixed-pin svg {
      width: 28px !important;
      height: 35px !important;
    }
  }
  
  @media (min-width: 481px) and (max-width: 768px) {
    .fixed-pin {
      width: 36px !important;
      height: 45px !important;
    }
    .fixed-pin svg {
      width: 36px !important;
      height: 45px !important;
    }
  }
`;

      fixedPinElement.className = "fixed-pin";
      const pinStyleElement = document.createElement("style");
      pinStyleElement.textContent = pinStyles;
      document.head.appendChild(pinStyleElement);

      mapRef.current.appendChild(fixedPinElement);
      mapRef.current.appendChild(fixedMessageElement);

      fixedPinRef.current = fixedPinElement;
      fixedMessageRef.current = fixedMessageElement;

      infoWindowRef.current = null;

      markerRef.current = new window.google.maps.Marker({
        position: mapCenter,
        map: map,
        visible: false,
        title: "Delivery location",
      });

      console.log("Fixed pin and message created at center");

      let mapMoveTimeout;

      const updateLocationFromCenter = () => {
        const newCenter = map.getCenter();
        const newLocation = {
          lat: newCenter.lat(),
          lng: newCenter.lng(),
        };

        console.log("Map moved to:", newLocation);
        markerRef.current.setPosition(newLocation);
        setSelectedLocation(newLocation);
        setIsConfirmed(false);
        getAddressFromCoordinates(newLocation.lat, newLocation.lng);
        validateServiceability(newLocation);
      };

      map.addListener("center_changed", () => {
        if (mapMoveTimeout) clearTimeout(mapMoveTimeout);
        mapMoveTimeout = setTimeout(() => {
          updateLocationFromCenter();
        }, 300);
      });

      map.addListener("dragstart", () => {
        if (fixedPinRef.current) {
          const line = fixedPinRef.current.querySelector("line");
          if (line) {
            line.style.animation = "pulse 0.5s ease-in-out infinite";
          }
        }

        if (fixedMessageRef.current) {
          fixedMessageRef.current.style.transform =
            "translateX(-50%) scale(0.95)";
          fixedMessageRef.current.style.opacity = "0.9";
        }
      });

      map.addListener("dragend", () => {
        if (fixedPinRef.current) {
          const line = fixedPinRef.current.querySelector("line");
          if (line) {
            line.style.animation = "pulse 2s ease-in-out infinite";
          }
        }

        if (fixedMessageRef.current) {
          fixedMessageRef.current.style.transform = "translateX(-50%)";
          fixedMessageRef.current.style.opacity = "1";
        }
      });

      map.addListener("idle", () => {
        if (fixedPinRef.current) {
          const line = fixedPinRef.current.querySelector("line");
          if (line) {
            line.style.animation = "pulse 2s ease-in-out infinite";
          }
        }

        if (fixedMessageRef.current) {
          fixedMessageRef.current.style.transform = "translateX(-50%)";
          fixedMessageRef.current.style.opacity = "1";
        }
      });

      console.log("Map initialized successfully with fixed pin and message");
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Failed to initialize map. Please try again.");
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2 && autocompleteServiceRef.current) {
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
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleLocationSelect = (place) => {
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        {
          placeId: place.place_id,
          fields: ["geometry", "name", "formatted_address"],
        },
        (placeResult, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const location = {
              lat: placeResult.geometry.location.lat(),
              lng: placeResult.geometry.location.lng(),
            };

            setSelectedLocation(location);
            setAddress(placeResult.formatted_address);
            setHouseName(
              placeResult.name || placeResult.formatted_address.split(",")[0]
            );

            if (mapInstanceRef.current && markerRef.current) {
              mapInstanceRef.current.panTo(location);
              mapInstanceRef.current.setZoom(16);
              markerRef.current.setPosition(location);

              if (infoWindowRef.current) {
                infoWindowRef.current.setPosition(location);
              }
            }

            setSearchQuery("");
            setSearchSuggestions([]);
            setIsConfirmed(false);
            validateServiceability(location);
          }
        }
      );
    }
  };

  const handleServiceRequest = async () => {
    const name = String(serviceRequestName || "");
    const phone = String(serviceRequestPhone || "");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setIsSubmittingRequest(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user._id) {
        setError("User not found. Please login again.");
        return;
      }

      const customerId = user._id;

      const requestData = {
        customerId,
        name: name.trim(),
        phone: phone.trim(),
        location: selectedLocation,
        address: address,
      };

      console.log("Submitting service request:", requestData);

      const response = await axios.post(
        "https://api.dailydish.in/api/service-requests",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log(response, "rrrrrrrrrrrrrrrrrrrrrrrr");

      if (response.data.success) {
        alert(
          "Thank you! Your request has been submitted successfully. We'll notify you when we start operations in your area."
        );

        setShowServiceablePopup(false);
        setServiceRequestName("");
        setServiceRequestPhone("");

        navigate("/location");
      } else {
        throw new Error(response.data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting service request:", error);

      if (error.code === "ECONNABORTED") {
        setError("Request timeout. Please try again.");
      } else if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || "Failed to submit request";

        if (status === 409) {
          setError("You already have a pending request for this location.");
        } else if (status === 400) {
          setError("Invalid request. Please check your information.");
        } else if (status === 404) {
          setError("User not found. Please login again.");
        } else if (status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(message);
        }
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(
          error.message || "Failed to submit request. Please try again."
        );
      }
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleCancelServiceRequest = () => {
    setShowServiceablePopup(false);
    setServiceRequestName("");
    setServiceRequestPhone("");
  };

  useEffect(() => {
    if (!location.state?.editingAddress) {
      setLandmark("");
      setFloor("");
      setTowerBlock("");
      setFlat("");
      setStudentName("");
      setStudentClass("");
      setStudentSection("");
      setFloorNo("");
      setHomeName("");
      setApartmentName("");
      setSchoolName("");
      setCompanyName("");
    }
  }, [addressType, location.state?.editingAddress]);

  const isFormValid = () => {
    if (!houseName.trim()) return false;

    switch (addressType) {
      case "Home":
        return homeName.trim();
      case "PG":
        return apartmentName.trim() && towerBlock.trim() && flat.trim();
      case "School":
        return (
          schoolName.trim() &&
          studentName.trim() &&
          studentClass.trim() &&
          studentSection.trim()
        );
      case "Work":
        return companyName.trim() && floorNo.trim();
      default:
        return false;
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("Please fill all required fields");
      return;
    }

    // Convert GeoJSON Point to lat/lng object if needed
    let locationObj = selectedLocation;
    console.log("🔍 handleSaveAddress - selectedLocation:", selectedLocation);

    if (
      selectedLocation &&
      selectedLocation.type === "Point" &&
      selectedLocation.coordinates
    ) {
      locationObj = {
        lat: selectedLocation.coordinates[1],
        lng: selectedLocation.coordinates[0],
      };
      console.log("🔄 Converted GeoJSON to lat/lng:", locationObj);
    }

    console.log("📍 Final locationObj for save:", locationObj);

    // Ensure we have valid coordinates
    if (!locationObj || !locationObj.lat || !locationObj.lng) {
      setError(
        "Location coordinates are missing. Please try moving the pin on the map."
      );
      setIsLoading(false);
      return;
    }

    const addressData = {
      location: locationObj,
      address: address,
      houseName: houseName,
      addressType: addressType,
      homeName: homeName,
      apartmentName: apartmentName,
      schoolName: schoolName,
      companyName: companyName,
      hubName: hub[0]?.hubName || "",
      hubId: hub[0]?.hub || "",
      ...(addressType === "Home" && { landmark, floor }),
      ...(addressType === "PG" && { towerBlock, flat, floor }),
      ...(addressType === "School" && {
        studentName,
        studentClass,
        studentSection,
      }),
      ...(addressType === "Work" && { floorNo }),
      fullAddress: generateFullAddress(),
      isDefault: true,
    };

    console.log("Saving address as primary:", addressData);

    try {
      setIsLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      const customerId = user._id;

      if (!customerId) {
        setError("Customer ID not found. Please login again.");
        return;
      }

      const requestPayload = {
        customerId: customerId,
        addressType: addressData.addressType,
        houseName: addressData.houseName,
        fullAddress: addressData.fullAddress,
        location: {
          lat: addressData.location.lat,
          lng: addressData.location.lng,
        },
        landmark: addressData.landmark || "",
        floor: addressData.floor || "",
        towerBlock: addressData.towerBlock || "",
        flat: addressData.flat || "",
        studentName: addressData.studentName || "",
        studentClass: addressData.studentClass || "",
        studentSection: addressData.studentSection || "",
        floorNo: addressData.floorNo || "",
        homeName: addressData.homeName || "",
        apartmentName: addressData.apartmentName || "",
        schoolName: addressData.schoolName || "",
        companyName: addressData.companyName || "",
        isDefault: true,
        hubName: addressData.hubName || "",
        hubId: addressData.hubId || "",
      };

      if (location.state?.editingAddress?._id) {
        requestPayload.addressId = location.state.editingAddress._id;
        if (!location.state.editingAddress.isDefault) {
          requestPayload.isDefault = false;
        }
      }

      const endpoint = location.state?.editingAddress?._id
        ? `https://api.dailydish.in/api/User/customers/${user._id}/addresses/${location.state.editingAddress._id}`
        : "https://api.dailydish.in/api/User/addresses";
      const method = location.state?.editingAddress?._id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save address");
      }

      const result = await response.json();

      if (result.success) {
        if (!location.state?.editingAddress?._id) {
          const savedAddressId = result.address?._id || result.addressId;

          if (savedAddressId) {
            await setAddressAsPrimary(customerId, savedAddressId);
          }
        }

        resetForm();

        window.dispatchEvent(new Event("addressAdded"));

        localStorage.setItem("primaryAddress", JSON.stringify(addressData));

        // Set manual location flag to prevent auto-detection
        localStorage.setItem("locationManuallySelected", "true");

        // Clean up any post-login destination flags
        localStorage.removeItem("postLoginDestination");

        // Always navigate to home after adding location
        navigate("/home", {
          state: {
            userLocation: selectedLocation,
            userAddress: address,
            addressData: addressData,
            isPrimary: true,
          },
        });
      } else {
        throw new Error(result.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setError(error.message || "Failed to save address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const setAddressAsPrimary = async (customerId, addressId) => {
    try {
      const response = await fetch(
        `https://api.dailydish.in/api/User/customers/${customerId}/addresses/${addressId}/primary`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        console.log(`Address ${addressId} set as primary successfully`);

        const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
        if (cachedAddresses) {
          const cached = JSON.parse(cachedAddresses);
          cached.primaryAddress = addressId;
          localStorage.setItem(
            `addresses_${customerId}`,
            JSON.stringify(cached)
          );
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error setting address as primary:", error);
      return false;
    }
  };

  const generateFullAddress = () => {
    let fullAddress = address;

    switch (addressType) {
      case "Home":
        if (homeName) fullAddress = `${homeName}, ${fullAddress}`;
        if (landmark) fullAddress += `, near ${landmark}`;
        if (floor) fullAddress += `, ${floor}`;
        break;
      case "PG":
        if (apartmentName) fullAddress = `${apartmentName}, ${fullAddress}`;
        if (towerBlock) fullAddress += `, ${towerBlock}`;
        if (flat) fullAddress += `, ${flat}`;
        if (floor) fullAddress += `, ${floor}`;
        break;
      case "School":
        if (schoolName) fullAddress = `${schoolName}, ${fullAddress}`;
        if (studentName) fullAddress += `, ${studentName}`;
        if (studentClass) fullAddress += `, Class ${studentClass}`;
        if (studentSection) fullAddress += `, Section ${studentSection}`;
        break;
      case "Work":
        if (companyName) fullAddress = `${companyName}, ${fullAddress}`;
        if (floorNo) fullAddress += `, ${floorNo}`;
        break;
    }

    return fullAddress;
  };

  const resetForm = () => {
    setHouseName("");
    setLandmark("");
    setFloor("");
    setTowerBlock("");
    setFlat("");
    setStudentName("");
    setStudentClass("");
    setStudentSection("");
    setFloorNo("");
    setHomeName("");
    setApartmentName("");
    setSchoolName("");
    setCompanyName("");
  };

  const addressTypes = [
    { key: "Home", label: "Home", icon: homeimg, icon2: homeimg2 },
    {
      key: "PG",
      label: "PG/ Apartment",
      icon: apartmentimg,
      icon2: apartmentimg2,
    },
    { key: "School", label: "School", icon: schoolimg, icon2: schoolimg2 },
    { key: "Work", label: "Work", icon: workimg, icon2: workimg2 },
  ];

  const renderTypeSpecificFields = () => {
    const commonInputStyle = {
      width: "100%",
      height: "44px",
      borderRadius: "12px",
      padding: "8px 16px",
      border: "0.4px solid #6B8E23",
      background: "#FAFAFA",
      fontSize: "14px",
      marginBottom: "10px",
    };

    switch (addressType) {
      case "Home":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: window.innerWidth > 768 ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <input
              type="text"
              value={homeName}
              onChange={(e) => setHomeName(e.target.value)}
              placeholder="Home Name *"
              style={commonInputStyle}
            />
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Landmark, building, floor"
              style={{ ...commonInputStyle, marginBottom: "0" }}
            />
          </div>
        );

      case "PG":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: window.innerWidth > 768 ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <input
              type="text"
              value={apartmentName}
              onChange={(e) => setApartmentName(e.target.value)}
              placeholder="Apartment Name *"
              style={commonInputStyle}
            />
            <input
              type="text"
              value={towerBlock}
              onChange={(e) => setTowerBlock(e.target.value)}
              placeholder="Tower/Block name *"
              style={commonInputStyle}
            />
            <div
              className="d-flex"
              style={{
                width: "100%",
                gap: "12px",
              }}
            >
              <input
                type="text"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="Flat *"
                style={commonInputStyle}
              />
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="Floor"
                style={commonInputStyle}
              />
            </div>
          </div>
        );

      case "School":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: window.innerWidth > 768 ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <div className="d-flex gap-2 align-items-start">
              <img
                src={spilt}
                alt=""
                style={{ width: "20px", height: "20px", marginTop: "2px" }}
              />
              <p
                className="mb-0"
                style={{
                  color: "#2c2c2c",
                  fontSize: "14px",
                  fontFamily: "Inter",
                  fontWeight: "500",
                }}
              >
                Later you can split the order
              </p>
              <img
                src={warning}
                alt=""
                style={{ width: "10px", height: "10px", marginTop: "6px" }}
              />
            </div>

            <div className="d-flex gap-2 align-items-start">
              <img
                src={secure}
                alt=""
                style={{ width: "12px", height: "12px", marginTop: "2px" }}
              />
              <p
                className="mb-0"
                style={{
                  color: "#2c2c2c",
                  fontSize: "10px",
                  fontFamily: "Inter",
                  fontWeight: "500",
                }}
              >
                Safe & Private: details are only used to deliver correctly.
              </p>
            </div>

            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="School Name *"
              style={commonInputStyle}
            />

            <input
              type="text"
              placeholder="Student's full name *"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={commonInputStyle}
            />

            <div
              className="d-flex "
              style={{
                width: "100%",
                gap: "12px",
              }}
            >
              <input
                type="text"
                placeholder="Class *"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                style={commonInputStyle}
              />
              <input
                type="text"
                placeholder="Section *"
                value={studentSection}
                onChange={(e) => setStudentSection(e.target.value)}
                style={commonInputStyle}
              />
            </div>
          </div>
        );

      case "Work":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: window.innerWidth > 768 ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name *"
              style={commonInputStyle}
            />
            <input
              type="text"
              value={floorNo}
              onChange={(e) => setFloorNo(e.target.value)}
              placeholder="Floor no *"
              style={{ ...commonInputStyle, marginBottom: "0" }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(userLocation);
            mapInstanceRef.current.setZoom(16);
          }

          setSelectedLocation(userLocation);
          setIsConfirmed(false);
          getAddressFromCoordinates(userLocation.lat, userLocation.lng);
          validateServiceability(userLocation);
        },
        (error) => {
          console.error("Error getting current location:", error);

          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermissionDenied(true);
            setError(
              "Location access denied. Please enable location permissions in your browser settings."
            );
          } else {
            setError(
              "Unable to detect your current location. Please make sure location services are enabled."
            );
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    return () => {
      if (fixedPinRef.current && fixedPinRef.current.parentNode) {
        fixedPinRef.current.parentNode.removeChild(fixedPinRef.current);
      }
      if (fixedMessageRef.current && fixedMessageRef.current.parentNode) {
        fixedMessageRef.current.parentNode.removeChild(fixedMessageRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        height: "100dvh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Location Permission Popup */}
      {showLocationPermission && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                color: "#ff6b6b",
              }}
            >
              <MdAddLocationAlt />
            </div>
            <h3
              style={{
                marginBottom: "12px",
                color: "#333",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Location is Disabled
            </h3>
            <p
              style={{
                marginBottom: "24px",
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              Please enable location access in your browser settings to use this
              feature.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              <button
                onClick={handleRetryLocation}
                style={{
                  backgroundColor: "#6B8E23",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#5a7a1a";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#6B8E23";
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Denied Popup */}
      {locationPermissionDenied && !showLocationPermission && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                color: "#ff6b6b",
              }}
            >
              📍
            </div>
            <h3
              style={{
                marginBottom: "12px",
                color: "#333",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Location is Disabled
            </h3>
            <p
              style={{
                marginBottom: "24px",
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              Please enable location access in your browser settings to use this
              feature.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              <button
                onClick={handleRetryLocation}
                style={{
                  backgroundColor: "#6B8E23",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#5a7a1a";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#6B8E23";
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Serviceability Popup */}
      {showServiceablePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#F8F6F0",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                color: "#ffa500",
              }}
            ></div>
            <h3
              style={{
                marginBottom: "12px",
                color: "#333",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Coming Soon to Your Area!
            </h3>
            <p
              style={{
                marginBottom: "16px",
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              We're not currently operating in this location, but we're
              expanding rapidly! Let us know you're interested, and we'll notify
              you as soon as we launch in your area.
            </p>

            <div style={{ marginBottom: "20px", textAlign: "left" }}>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Your Name *
                </label>
                <input
                  type="text"
                  value={serviceRequestName}
                  onChange={(e) => setServiceRequestName(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={serviceRequestPhone}
                  onChange={(e) => setServiceRequestPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "16px",
                }}
              >
                <strong>Selected Location:</strong> {address}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button
                onClick={handleServiceRequest}
                disabled={
                  isSubmittingRequest ||
                  !serviceRequestName ||
                  !serviceRequestPhone
                }
                style={{
                  backgroundColor:
                    isSubmittingRequest ||
                    !serviceRequestName ||
                    !serviceRequestPhone
                      ? "#ccc"
                      : "#6B8E23",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor:
                    isSubmittingRequest ||
                    !serviceRequestName ||
                    !serviceRequestPhone
                      ? "not-allowed"
                      : "pointer",
                  transition: "background-color 0.2s",
                }}
              >
                {isSubmittingRequest ? "Submitting..." : "Request Location"}
              </button>
              <button
                onClick={handleCancelServiceRequest}
                style={{
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Half - Map */}
      <div
        style={{
          flex: "1",
          position: "relative",
          backgroundColor: "#e9ecef",
          overflow: "hidden",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#e9ecef",
          }}
        />

        {/* Search Bar */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            right: "16px",
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
              padding: "8px 12px",
              gap: "8px",
            }}
          >
            <Search size={18} color="#666" style={{ flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for area, street, landmark..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "14px",
                padding: "8px 0",
                backgroundColor: "transparent",
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

          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
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

        {/* Loading Overlay */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: "2000",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #e0e0e0",
                borderTop: "4px solid #6B8E23",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "16px",
              }}
            ></div>
            <div
              style={{
                fontSize: "16px",
                color: "#333",
                fontWeight: "500",
              }}
            >
              {isLoading ? "" : "Loading map..."}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Half - Address Form */}
      <div
        style={{
          flex: "1",
          backgroundColor: "white",
          overflowY: "auto",
          padding: window.innerWidth <= 480 ? "16px" : "24px",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          {/* Current Address Display */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              padding: window.innerWidth <= 480 ? "8px 10px" : "10px 12px",
              marginBottom: window.innerWidth <= 480 ? "12px" : "16px",
              border: "1px solid #e0e0e0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center", // center for one line
                gap: window.innerWidth <= 480 ? "6px" : "8px",
              }}
            >
              <MapPin size={16} color="#4caf50" />

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: window.innerWidth <= 480 ? "12px" : "14px",
                  color: "#666",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: "1.2",
                }}
              >
                {address || "Detecting address..."}
              </div>
            </div>
          </div>

          {/* Serviceability Status */}
          {selectedLocation && isServiceable === false && (
            <div
              style={{
                backgroundColor: "#fff3e0",
                border: "1px solid #ffcc80",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "20px",
                fontSize: window.innerWidth <= 480 ? "13px" : "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "500",
                  color: "#b22222",
                  marginBottom: "4px",
                }}
              >
                <span>⚠️</span>
                <span>Service not available in this area</span>
              </div>
              <div
                style={{
                  fontSize: window.innerWidth <= 480 ? "11px" : "12px",
                  color: "#666",
                  lineHeight: "1.4",
                }}
              >
                You can still save this address and request service for this
                location.
              </div>
            </div>
          )}

          {/* Show address form if location is serviceable, otherwise show request button */}
          {console.log(
            "🔍 Render check - isServiceable:",
            isServiceable,
            "isConfirmed:",
            isConfirmed
          )}
          {isServiceable === true || isServiceable === null ? (
            <form onSubmit={handleSaveAddress}>
              {/* Address Type Selection */}
              <div style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    display: window.innerWidth <= 768 ? "flex" : "grid",
                    flexWrap: window.innerWidth <= 768 ? "wrap" : "nowrap",
                    justifyContent:
                      window.innerWidth <= 768 ? "flex-start" : "stretch",
                    gridTemplateColumns:
                      window.innerWidth <= 360
                        ? "repeat(2, 1fr)"
                        : "repeat(4, 1fr)",
                    gap:
                      window.innerWidth <= 360
                        ? "8px"
                        : window.innerWidth <= 768
                        ? "6px"
                        : "8px",
                    width: "100%",
                  }}
                >
                  {addressTypes.map((type) => (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setAddressType(type.key)}
                      style={{
                        width: window.innerWidth <= 768 ? "auto" : "100%",
                        minHeight:
                          window.innerWidth <= 360
                            ? "38px"
                            : window.innerWidth <= 768
                            ? "43px"
                            : "65px",
                        padding:
                          window.innerWidth <= 360
                            ? "6px 4px"
                            : window.innerWidth <= 768
                            ? "8px"
                            : "12px",
                        borderRadius:
                          window.innerWidth <= 360
                            ? "8px"
                            : window.innerWidth <= 768
                            ? "12px"
                            : "14px",
                        border:
                          addressType === type.key
                            ? "1.2px solid #F5DEB3"
                            : "1.2px solid #F5DEB3",
                        backgroundColor:
                          addressType === type.key ? "#6B8E23" : "#FFF8DC",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "inline-flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap:
                          window.innerWidth <= 360
                            ? "4px"
                            : window.innerWidth <= 768
                            ? "6px"
                            : "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        if (addressType !== type.key) {
                          e.currentTarget.style.backgroundColor = "#F8F4E8";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (addressType !== type.key) {
                          e.currentTarget.style.backgroundColor = "#FFF8DC";
                        }
                      }}
                    >
                      <img
                        src={addressType === type.key ? type.icon2 : type.icon}
                        alt={type.label}
                        style={{
                          width:
                            window.innerWidth <= 360
                              ? "14px"
                              : window.innerWidth <= 768
                              ? "16px"
                              : "24px",
                          height:
                            window.innerWidth <= 360
                              ? "14px"
                              : window.innerWidth <= 768
                              ? "16px"
                              : "24px",
                          objectFit: "contain",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize:
                            window.innerWidth <= 360
                              ? "10px"
                              : window.innerWidth <= 768
                              ? "11px"
                              : "14px",
                          fontWeight: "500",
                          fontFamily: "Inter",
                          color: addressType === type.key ? "#fff" : "#000",
                          textAlign: "center",
                          lineHeight: "1.3",
                          whiteSpace:
                            window.innerWidth <= 768 ? "nowrap" : "normal",
                        }}
                      >
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Specific Fields */}
              {addressType && renderTypeSpecificFields()}

              {/* Save Address Button */}
              {addressType && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "24px",
                    gap:
                      window.innerWidth <= 360
                        ? "8px"
                        : window.innerWidth <= 768
                        ? "12px"
                        : "16px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/home");
                    }}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #d5c5b0",
                      borderRadius:
                        window.innerWidth <= 360
                          ? "8px"
                          : window.innerWidth <= 768
                          ? "12px"
                          : "14px",
                      width: "48%",
                      height:
                        window.innerWidth <= 360
                          ? "40px"
                          : window.innerWidth <= 768
                          ? "45px"
                          : "50px",
                      fontWeight: "600",
                      textAlign: "center",
                      fontSize:
                        window.innerWidth <= 360
                          ? "13px"
                          : window.innerWidth <= 768
                          ? "14px"
                          : "16px",
                      padding: "0 10px",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f9f9f9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    Cancel
                    <img
                      src={cross}
                      alt=""
                      style={{
                        width:
                          window.innerWidth <= 360
                            ? "12px"
                            : window.innerWidth <= 768
                            ? "14px"
                            : "16px",
                        height:
                          window.innerWidth <= 360
                            ? "12px"
                            : window.innerWidth <= 768
                            ? "14px"
                            : "16px",
                      }}
                    />
                  </button>

                  <button
                    type="submit"
                    disabled={!isFormValid() || isLoading}
                    style={{
                      backgroundColor:
                        isFormValid() && !isLoading ? "#E6B800" : "#C0C0C0",
                      borderRadius:
                        window.innerWidth <= 360
                          ? "8px"
                          : window.innerWidth <= 768
                          ? "12px"
                          : "14px",
                      border: "1px solid #c0c0c0",
                      width: "48%",
                      height:
                        window.innerWidth <= 360
                          ? "40px"
                          : window.innerWidth <= 768
                          ? "45px"
                          : "50px",
                      fontWeight: "600",
                      color: "black",
                      cursor:
                        isFormValid() && !isLoading ? "pointer" : "not-allowed",
                      fontSize:
                        window.innerWidth <= 360
                          ? "13px"
                          : window.innerWidth <= 768
                          ? "14px"
                          : "16px",
                      padding: "0 12px",
                      gap: "6px",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (isFormValid() && !isLoading) {
                        e.currentTarget.style.backgroundColor = "#FFD700";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isFormValid() && !isLoading) {
                        e.currentTarget.style.backgroundColor = "#E6B800";
                      }
                    }}
                  >
                    {isLoading
                      ? "Saving..."
                      : location.state?.editingAddress
                      ? "Update Address"
                      : "Save Address"}
                    {!isLoading && (
                      <CircleCheck
                        style={{
                          width:
                            window.innerWidth <= 360
                              ? "14px"
                              : window.innerWidth <= 768
                              ? "16px"
                              : "18px",
                          height:
                            window.innerWidth <= 360
                              ? "14px"
                              : window.innerWidth <= 768
                              ? "16px"
                              : "18px",
                          marginTop: "1px",
                        }}
                      />
                    )}
                  </button>
                </div>
              )}
            </form>
          ) : isServiceable === false ? (
            // Show request service button for non-serviceable areas
            <div>
              <button
                onClick={() => setShowServiceablePopup(true)}
                disabled={isValidatingServiceability || !selectedLocation}
                style={{
                  width: "100%",
                  padding: window.innerWidth <= 480 ? "14px" : "16px",
                  backgroundColor:
                    isValidatingServiceability || !selectedLocation
                      ? "#ccc"
                      : "#b22222",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: window.innerWidth <= 480 ? "14px" : "16px",
                  fontWeight: "600",
                  cursor:
                    isValidatingServiceability || !selectedLocation
                      ? "default"
                      : "pointer",
                  transition: "all 0.3s ease",
                  marginBottom: "24px",
                }}
                onMouseEnter={(e) => {
                  if (!isValidatingServiceability && selectedLocation) {
                    e.target.style.opacity = "0.9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isValidatingServiceability && selectedLocation) {
                    e.target.style.opacity = "1";
                  }
                }}
              >
                {isValidatingServiceability
                  ? "Checking serviceability..."
                  : "Request Service for This Area"}
              </button>

              {/* Optional: Still allow users to save address even if not serviceable */}
              {/* <div
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <button
                  onClick={() => setIsConfirmed(true)}
                  style={{
                    backgroundColor: "#6B8E23",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Still Save This Address
                </button>
              </div> */}
            </div>
          ) : (
            // Show loading while checking serviceability
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
              }}
            >
              {/* <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #e0e0e0",
                  borderTop: "4px solid #6B8E23",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                }}
              ></div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                Checking serviceability...
              </div> */}
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default UpdateLocation;
