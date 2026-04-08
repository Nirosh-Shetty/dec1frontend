// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Swal2 from "sweetalert2";
// import locationpng from "./../assets/deliverylocation.svg";
// import homeimg from "./../assets/ion_home-outline.png";
// import homeimg2 from "./../assets/ion_home-outline-white.svg";
// import apartmentimg from "./../assets/apartment.png";
// import apartmentimg2 from "./../assets/tabler_building-skyscraper-white.svg";
// import workimg from "./../assets/streamline-ultimate_work-from-home-user-sofa.png";
// import workimg2 from "./../assets/streamline-ultimate_work-from-home-user-sofa-white.svg";
// import schoolimg from "./../assets/streamline-ultimate-color_study-exam-math.png";
// import schoolimg2 from "./../assets/streamline-ultimate-color_study-exam-math-white.png";
// import cross from "./../assets/cross.png";
// import { CircleCheck, Search, MapPin } from "lucide-react";
// import spilt from "./../assets/spilt.png";
// import secure from "./../assets/secure.png";
// import warning from "./../assets/warning.png";
// import axios from "axios";
// import "./../Styles/Location.css";

// const UpdateLocation = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Default Bengaluru coordinates
//   const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 };

//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [isConfirmed, setIsConfirmed] = useState(false);
//   const [scriptLoaded, setScriptLoaded] = useState(false);
//   const [address, setAddress] = useState("");
//   const [isGeocoding, setIsGeocoding] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchSuggestions, setSearchSuggestions] = useState([]);

//   // Location permission states
//   const [showLocationPermission, setShowLocationPermission] = useState(false);
//   const [locationDenied, setLocationDenied] = useState(false);
//   const [locationPermissionDenied, setLocationPermissionDenied] =
//     useState(false);

//   // Address form state
//   const [hub, setHub] = useState([]);
//   const [houseName, setHouseName] = useState("");
//   const [homeName, setHomeName] = useState("");
//   const [addressType, setAddressType] = useState("Home");
//   const [landmark, setLandmark] = useState("");
//   const [floor, setFloor] = useState("");

//   // PG specific fields
//   const [apartmentName, setApartmentName] = useState("");
//   const [towerBlock, setTowerBlock] = useState("");
//   const [flat, setFlat] = useState("");

//   // School specific fields
//   const [schoolName, setSchoolName] = useState("");
//   const [studentName, setStudentName] = useState("");
//   const [studentClass, setStudentClass] = useState("");
//   const [studentSection, setStudentSection] = useState("");

//   // Work specific field
//   const [companyName, setCompanyName] = useState("");
//   const [floorNo, setFloorNo] = useState("");
//   const [buildingName, setBuildingName] = useState("");

//   // Serviceability states
//   const [showServiceablePopup, setShowServiceablePopup] = useState(false);
//   const [serviceRequestName, setServiceRequestName] = useState();
//   const [serviceRequestPhone, setServiceRequestPhone] = useState("");
//   const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
//   const [isServiceable, setIsServiceable] = useState(null);
//   const [isValidatingServiceability, setIsValidatingServiceability] =
//     useState(false);

//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const markerRef = useRef(null);
//   const geocoderRef = useRef(null);
//   const autocompleteServiceRef = useRef(null);
//   const placesServiceRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const infoWindowRef = useRef(null);
//   const fixedPinRef = useRef(null);
//   const fixedMessageRef = useRef(null);

//   const API_KEY = import.meta.env.VITE_MAP_KEY;

//   // Detect iOS device
//   const isIOS =
//     /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

//   // Function to force map initialization
//   const forceMapInitialization = useCallback(
//     (location) => {
//       console.log("Force initializing map with location:", location);

//       if (!scriptLoaded) {
//         console.log("Script not loaded yet");
//         return false;
//       }

//       if (!mapRef.current) {
//         console.log("Map container not available");
//         return false;
//       }

//       if (mapInstanceRef.current) {
//         console.log("Map already initialized");
//         return true;
//       }

//       try {
//         initializeMap(location);

//         // Get address for the location
//         getAddressFromCoordinates(location.lat, location.lng);

//         // Validate serviceability
//         validateServiceabilityWithHub(location);

//         setIsLoading(false);
//         return true;
//       } catch (error) {
//         console.error("Error forcing map initialization:", error);
//         setIsLoading(false);
//         return false;
//       }
//     },
//     [scriptLoaded],
//   );

//   // Check location permission on component mount
//   useEffect(() => {
//     checkLocationPermission();

//     const handleBackButton = (e) => {
//       e.preventDefault();
//       navigate("/home");
//     };

//     window.history.pushState(null, null, window.location.pathname);
//     window.addEventListener("popstate", handleBackButton);

//     return () => {
//       window.removeEventListener("popstate", handleBackButton);
//     };
//   }, [navigate]);

//   // Check location permission
//   const checkLocationPermission = () => {
//     if (!navigator.geolocation) {
//       setLocationDenied(true);
//       setLocationPermissionDenied(true);
//       setShowLocationPermission(true);
//       return;
//     }

//     navigator.permissions
//       ?.query({ name: "geolocation" })
//       .then((result) => {
//         if (result.state === "denied") {
//           setLocationDenied(true);
//           setLocationPermissionDenied(true);
//           setShowLocationPermission(true);
//         } else if (result.state === "prompt") {
//           setShowLocationPermission(true);
//         }
//       })
//       .catch(() => {
//         setShowLocationPermission(true);
//       });
//   };

//   // Handle allow location
//   const handleAllowLocation = () => {
//     setShowLocationPermission(false);
//     setLocationPermissionDenied(false);
//     getCurrentLocation();
//   };

//   // Handle deny location
//   const handleDenyLocation = () => {
//     setLocationDenied(true);
//     setLocationPermissionDenied(true);
//     setShowLocationPermission(false);
//     setCurrentLocation(DEFAULT_LOCATION);
//     setSelectedLocation(DEFAULT_LOCATION);
//     setAddress("Location access denied. Using Bengaluru.");

//     // Force map initialization for iOS
//     if (isIOS) {
//       setTimeout(() => {
//         forceMapInitialization(DEFAULT_LOCATION);
//       }, 100);
//     } else {
//       setIsLoading(false);
//     }
//   };

//   // Handle retry location
//   const handleRetryLocation = () => {
//     setShowLocationPermission(false);
//     setLocationPermissionDenied(false);

//     if (!scriptLoaded) {
//       setIsLoading(true);
//       setTimeout(() => {
//         if (window.google && window.google.maps) {
//           setScriptLoaded(true);
//           initializeServices();
//           getCurrentLocation();
//         } else {
//           setError("Google Maps failed to load. Please refresh the page.");
//           setIsLoading(false);
//         }
//       }, 500);
//     } else {
//       getCurrentLocation();
//     }
//   };

//   // Check if coming from modal with selected place OR editing existing address
//   useEffect(() => {
//     if (location.state?.selectedPlace) {
//       const { selectedPlace } = location.state;
//       handleSelectedPlaceFromModal(selectedPlace);
//     } else if (location.state?.editingAddress) {
//       const { editingAddress } = location.state;
//       // console.log("editing address", editingAddress)
//       handleEditingAddress(editingAddress);
//     }
//   }, [location.state]);

//   // Handle place selected from modal
//   const handleSelectedPlaceFromModal = (selectedPlace) => {
//     if (selectedPlace.location && selectedPlace.address) {
//       let locationObj = selectedPlace.location;
//       if (
//         selectedPlace.location.type === "Point" &&
//         selectedPlace.location.coordinates
//       ) {
//         locationObj = {
//           lat: selectedPlace.location.coordinates[1],
//           lng: selectedPlace.location.coordinates[0],
//         };
//       }

//       setSelectedLocation(locationObj);
//       setAddress(selectedPlace.address);
//       setHouseName(selectedPlace.name || selectedPlace.address.split(",")[0]);

//       if (mapInstanceRef.current && markerRef.current) {
//         mapInstanceRef.current.panTo(locationObj);
//         mapInstanceRef.current.setZoom(16);
//         markerRef.current.setPosition(locationObj);
//       }

//       setIsConfirmed(false);
//       validateServiceabilityWithHub(locationObj);
//     }
//   };

//   // Handle editing existing address
//   const handleEditingAddress = (editingAddress) => {
//     console.log("Editing address:", editingAddress);

//     let locationCoords = DEFAULT_LOCATION;

//     if (editingAddress.location) {
//       if (
//         editingAddress.location.coordinates &&
//         editingAddress.location.coordinates.length >= 2
//       ) {
//         locationCoords = {
//           lat: parseFloat(editingAddress.location.coordinates[1]),
//           lng: parseFloat(editingAddress.location.coordinates[0]),
//         };
//       } else if (editingAddress.location.lat && editingAddress.location.lng) {
//         locationCoords = {
//           lat: parseFloat(editingAddress.location.lat),
//           lng: parseFloat(editingAddress.location.lng),
//         };
//       }
//     }

//     setSelectedLocation(locationCoords);
//     setAddress(editingAddress.fullAddress || editingAddress.address || "");
//     setHouseName(editingAddress.houseName || "");
//     setAddressType(editingAddress.addressType || "Home");

//     if (editingAddress.addressType === "Home") {
//       setHomeName(editingAddress.homeName || "");
//       setLandmark(editingAddress.landmark || "");
//       setFloor(editingAddress.floor || "");
//     } else if (editingAddress.addressType === "PG") {
//       setApartmentName(editingAddress.apartmentName || "");
//       setTowerBlock(editingAddress.towerBlock || "");
//       setFlat(editingAddress.flat || "");
//       setFloor(editingAddress.floor || "");
//     } else if (editingAddress.addressType === "School") {
//       setSchoolName(editingAddress.schoolName || "");
//       setStudentName(editingAddress.studentInformation.studentName || "");
//       setStudentClass(editingAddress.studentInformation.studentClass || "");
//       setStudentSection(editingAddress.studentInformation.studentSection || "");
//     } else if (editingAddress.addressType === "Work") {
//       setCompanyName(editingAddress.companyName || "");
//       setFloorNo(editingAddress.floorNo || "");
//       setBuildingName(editingAddress.buildingName || "");
//     }

//     setIsConfirmed(false);
//     validateServiceabilityWithHub(locationCoords);
//   };

//   // Initialize services
//   const initializeServices = useCallback(() => {
//     if (window.google && window.google.maps && !geocoderRef.current) {
//       geocoderRef.current = new window.google.maps.Geocoder();
//       autocompleteServiceRef.current =
//         new window.google.maps.places.AutocompleteService();

//       if (mapInstanceRef.current && !placesServiceRef.current) {
//         placesServiceRef.current = new window.google.maps.places.PlacesService(
//           mapInstanceRef.current,
//         );
//       }
//     }
//   }, []);

//   // Get address from coordinates
//   const getAddressFromCoordinates = useCallback(async (lat, lng) => {
//     if (!window.google || !window.google.maps || !geocoderRef.current) {
//       setAddress("Address service not available");
//       return "Address service not available";
//     }

//     if (
//       typeof lat !== "number" ||
//       typeof lng !== "number" ||
//       isNaN(lat) ||
//       isNaN(lng)
//     ) {
//       setAddress("Invalid location coordinates");
//       return "Invalid location coordinates";
//     }

//     setIsGeocoding(true);

//     try {
//       const response = await new Promise((resolve, reject) => {
//         geocoderRef.current.geocode(
//           { location: { lat, lng } },
//           (results, status) => {
//             if (status === "OK" && results && results[0]) {
//               resolve(results[0].formatted_address);
//             } else if (status === "ZERO_RESULTS") {
//               resolve("No address found for this location");
//             } else {
//               reject(new Error(`Geocoding failed: ${status}`));
//             }
//           },
//         );
//       });

//       setAddress(response);
//       const shortAddress = response.split(",")[0];
//       setHouseName(shortAddress);
//       return response;
//     } catch (error) {
//       console.error("Geocoding error:", error);
//       const errorMsg = "Address not available";
//       setAddress(errorMsg);
//       return errorMsg;
//     } finally {
//       setIsGeocoding(false);
//     }
//   }, []);

//   // Validate serviceability WITH HUB DATA
//   const validateServiceabilityWithHub = async (location) => {
//     if (!location) return false;

//     try {
//       setIsValidatingServiceability(true);

//       const response = await fetch(
//         "http://localhost:7013/api/Hub/validate-location",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             lat: location.lat.toString(),
//             lng: location.lng.toString(),
//           }),
//         },
//       );

//       const data = await response.json();

//       if (data.success) {
//         setIsServiceable(data.serviceable);

//         // Store hub data if available
//         if (data.serviceable && data.hubs && data.hubs.length > 0) {
//           setHub(data.hubs);
//           console.log("Hub data received:", data.hubs);
//         } else {
//           setHub([]);
//         }

//         return data.serviceable;
//       } else {
//         console.error("Serviceability validation failed:", data.message);
//         setIsServiceable(null);
//         setHub([]);
//         return false;
//       }
//     } catch (error) {
//       console.error("Serviceability validation error:", error);
//       setIsServiceable(null);
//       setHub([]);
//       return false;
//     } finally {
//       setIsValidatingServiceability(false);
//     }
//   };

//   // Load Google Maps script
//   useEffect(() => {
//     if (window.google && window.google.maps) {
//       setScriptLoaded(true);
//       initializeServices();
//       return;
//     }

//     if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
//       const checkGoogle = setInterval(() => {
//         if (window.google && window.google.maps) {
//           setScriptLoaded(true);
//           initializeServices();
//           clearInterval(checkGoogle);
//         }
//       }, 100);
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
//     script.async = true;
//     script.defer = true;

//     script.onload = () => {
//       setScriptLoaded(true);
//       initializeServices();
//       console.log("Google Maps script loaded successfully");
//     };

//     script.onerror = () => {
//       console.error("Google Maps script failed to load");
//       setError("Failed to load Google Maps. Please check your API key.");
//       setIsLoading(false);

//       setIsServiceable(null);
//       setIsConfirmed(true);
//     };

//     document.head.appendChild(script);
//   }, [initializeServices]);

//   // FIXED: Initialize map when script is loaded
//   useEffect(() => {
//     const initializeMapWithLocation = async () => {
//       if (!scriptLoaded || showLocationPermission) {
//         return;
//       }

//       console.log("Map initialization conditions met:", {
//         scriptLoaded,
//         showLocationPermission,
//         locationDenied,
//         selectedLocation,
//         currentLocation,
//         mapInstanceRef: !mapInstanceRef.current,
//         isIOS,
//       });

//       // Try to get location from localStorage first
//       let locationToUse = selectedLocation || currentLocation;

//       if (!locationToUse) {
//         const savedLocation = localStorage.getItem("currentLocation");
//         if (savedLocation) {
//           try {
//             const parsedLocation = JSON.parse(savedLocation);
//             console.log(
//               "Found saved location in localStorage:",
//               parsedLocation,
//             );

//             // Extract coordinates from saved location
//             if (
//               parsedLocation.location &&
//               parsedLocation.location.coordinates
//             ) {
//               // Handle GeoJSON format: [lng, lat]
//               locationToUse = {
//                 lat: parseFloat(parsedLocation.location.coordinates[1]),
//                 lng: parseFloat(parsedLocation.location.coordinates[0]),
//               };
//             } else if (parsedLocation.lat && parsedLocation.lng) {
//               // Handle simple lat/lng object
//               locationToUse = {
//                 lat: parseFloat(parsedLocation.lat),
//                 lng: parseFloat(parsedLocation.lng),
//               };
//             }

//             if (locationToUse) {
//               console.log("Using location from localStorage:", locationToUse);
//               setSelectedLocation(locationToUse);
//               setCurrentLocation(locationToUse);
//             }
//           } catch (error) {
//             console.error("Error parsing saved location:", error);
//           }
//         }
//       }

//       // If still no location, use default - especially for iOS
//       if (!locationToUse) {
//         locationToUse = DEFAULT_LOCATION;
//         setSelectedLocation(DEFAULT_LOCATION);
//         setCurrentLocation(DEFAULT_LOCATION);
//       }

//       console.log("Final location for map initialization:", locationToUse);

//       if (mapRef.current && !mapInstanceRef.current) {
//         try {
//           // Small delay to ensure DOM is ready
//           await new Promise((resolve) =>
//             setTimeout(resolve, isIOS ? 200 : 100),
//           );

//           console.log("Initializing map with location:", locationToUse);
//           initializeMap(locationToUse);

//           // Get address for the location
//           if (!address || address === "Detecting address...") {
//             getAddressFromCoordinates(locationToUse.lat, locationToUse.lng);
//           }

//           // Validate serviceability
//           validateServiceabilityWithHub(locationToUse);

//           setIsLoading(false);
//         } catch (error) {
//           console.error("Error in map initialization:", error);

//           // For iOS, try one more time with default location
//           if (isIOS && locationToUse !== DEFAULT_LOCATION) {
//             setTimeout(() => {
//               try {
//                 initializeMap(DEFAULT_LOCATION);
//                 getAddressFromCoordinates(
//                   DEFAULT_LOCATION.lat,
//                   DEFAULT_LOCATION.lng,
//                 );
//                 validateServiceabilityWithHub(DEFAULT_LOCATION);
//                 setIsLoading(false);
//               } catch (retryError) {
//                 console.error("Retry also failed:", retryError);
//                 setIsLoading(false);
//               }
//             }, 500);
//           } else {
//             setIsLoading(false);
//           }
//         }
//       } else if (isIOS && locationDenied && !mapInstanceRef.current) {
//         // iOS specific: if location denied and map not initialized, force it
//         setTimeout(() => {
//           try {
//             initializeMap(DEFAULT_LOCATION);
//             getAddressFromCoordinates(
//               DEFAULT_LOCATION.lat,
//               DEFAULT_LOCATION.lng,
//             );
//             validateServiceabilityWithHub(DEFAULT_LOCATION);
//             setIsLoading(false);
//           } catch (error) {
//             console.error("iOS fallback initialization failed:", error);
//             setIsLoading(false);
//           }
//         }, 200);
//       }
//     };

//     initializeMapWithLocation();
//   }, [scriptLoaded, showLocationPermission, locationDenied, isIOS]);

//   // FIXED: Check and set initial location based on priority
//   useEffect(() => {
//     if (scriptLoaded && !selectedLocation && !currentLocation) {
//       checkAndSetInitialLocation();
//     }
//   }, [scriptLoaded]);

//   // Helper functions for permission handling
//   const handleNoGeolocationSupport = () => {
//     setSelectedLocation(DEFAULT_LOCATION);
//     setCurrentLocation(DEFAULT_LOCATION);
//     setAddress("Geolocation not supported. Using Bengaluru.");

//     // Initialize map immediately
//     if (scriptLoaded) {
//       setTimeout(() => forceMapInitialization(DEFAULT_LOCATION), 100);
//     }
//   };

//   const handleIOSPermissionCheck = () => {
//     console.log("iOS detected, using fallback permission check");

//     // iOS often blocks geolocation, so use default immediately
//     setSelectedLocation(DEFAULT_LOCATION);
//     setCurrentLocation(DEFAULT_LOCATION);
//     setAddress("Using default location (Bengaluru)");

//     // Initialize map immediately for iOS
//     if (scriptLoaded) {
//       setTimeout(() => forceMapInitialization(DEFAULT_LOCATION), 100);
//     }

//     // Still try to get actual location in background
//     getCurrentLocation();
//   };

//   const handleStandardPermissionCheck = () => {
//     navigator.permissions
//       ?.query({ name: "geolocation" })
//       .then((result) => {
//         if (result.state === "granted") {
//           console.log(
//             "Location permission granted, getting current location...",
//           );
//           getCurrentLocation();
//         } else if (result.state === "prompt") {
//           console.log("Location permission prompt needed");
//           setShowLocationPermission(true);
//           setSelectedLocation(DEFAULT_LOCATION);
//           setCurrentLocation(DEFAULT_LOCATION);
//           setAddress("Using default location (Bengaluru)");

//           // Initialize map immediately with default
//           if (scriptLoaded) {
//             setTimeout(() => forceMapInitialization(DEFAULT_LOCATION), 100);
//           }
//         } else if (result.state === "denied") {
//           console.log("Location permission denied, using Bengaluru default");
//           setLocationDenied(true);
//           setLocationPermissionDenied(true);
//           setSelectedLocation(DEFAULT_LOCATION);
//           setCurrentLocation(DEFAULT_LOCATION);
//           setAddress("Location access denied. Using Bengaluru.");

//           // Initialize map immediately
//           if (scriptLoaded) {
//             setTimeout(() => forceMapInitialization(DEFAULT_LOCATION), 100);
//           }
//         }
//       })
//       .catch(() => {
//         console.log("Error checking permission, using Bengaluru default");
//         setSelectedLocation(DEFAULT_LOCATION);
//         setCurrentLocation(DEFAULT_LOCATION);
//         setAddress("Error checking location. Using Bengaluru.");

//         // Initialize map immediately
//         if (scriptLoaded) {
//           setTimeout(() => forceMapInitialization(DEFAULT_LOCATION), 100);
//         }
//       });
//   };

//   // Function to check and set initial location based on priority
//   const checkAndSetInitialLocation = () => {
//     console.log("Checking initial location...");

//     // Check for location from modal or editing first
//     if (location.state?.selectedPlace) {
//       const { selectedPlace } = location.state;
//       let locationObj = selectedPlace.location;

//       if (
//         selectedPlace.location.type === "Point" &&
//         selectedPlace.location.coordinates
//       ) {
//         locationObj = {
//           lat: selectedPlace.location.coordinates[1],
//           lng: selectedPlace.location.coordinates[0],
//         };
//       }

//       setSelectedLocation(locationObj);
//       setCurrentLocation(locationObj);
//       setAddress(selectedPlace.address);
//       setHouseName(selectedPlace.name || selectedPlace.address.split(",")[0]);

//       // Initialize map immediately - especially important for iOS
//       if (isIOS && scriptLoaded) {
//         setTimeout(() => forceMapInitialization(locationObj), 100);
//       }
//       return;
//     }

//     if (location.state?.editingAddress) {
//       const { editingAddress } = location.state;
//       let locationCoords = DEFAULT_LOCATION;

//       if (editingAddress.location) {
//         if (
//           editingAddress.location.coordinates &&
//           editingAddress.location.coordinates.length >= 2
//         ) {
//           locationCoords = {
//             lat: parseFloat(editingAddress.location.coordinates[1]),
//             lng: parseFloat(editingAddress.location.coordinates[0]),
//           };
//         } else if (editingAddress.location.lat && editingAddress.location.lng) {
//           locationCoords = {
//             lat: parseFloat(editingAddress.location.lat),
//             lng: parseFloat(editingAddress.location.lng),
//           };
//         }
//       }

//       setSelectedLocation(locationCoords);
//       setCurrentLocation(locationCoords);
//       setAddress(editingAddress.fullAddress || editingAddress.address || "");

//       // Initialize map immediately - especially important for iOS
//       if (isIOS && scriptLoaded) {
//         setTimeout(() => forceMapInitialization(locationCoords), 100);
//       }
//       return;
//     }

//     // Try to get location from localStorage
//     const savedLocation = localStorage.getItem("currentLocation");
//     if (savedLocation) {
//       try {
//         const parsedLocation = JSON.parse(savedLocation);
//         console.log("Found saved location in localStorage:", parsedLocation);

//         let locationObj;
//         if (parsedLocation.location && parsedLocation.location.coordinates) {
//           // Handle GeoJSON format from your screenshot
//           locationObj = {
//             lat: parseFloat(parsedLocation.location.coordinates[1]),
//             lng: parseFloat(parsedLocation.location.coordinates[0]),
//           };
//         } else if (parsedLocation.lat && parsedLocation.lng) {
//           // Handle simple lat/lng object
//           locationObj = {
//             lat: parseFloat(parsedLocation.lat),
//             lng: parseFloat(parsedLocation.lng),
//           };
//         }

//         if (locationObj && locationObj.lat && locationObj.lng) {
//           console.log("Using saved location from localStorage:", locationObj);
//           setCurrentLocation(locationObj);
//           setSelectedLocation(locationObj);

//           // Initialize map immediately - especially important for iOS
//           if (isIOS && scriptLoaded) {
//             setTimeout(() => forceMapInitialization(locationObj), 100);
//           }
//           return;
//         }
//       } catch (error) {
//         console.error("Error parsing saved location:", error);
//       }
//     }

//     // Check location permission
//     console.log("No saved location found, checking location permission...");

//     if (!navigator.geolocation) {
//       console.log("Geolocation not supported, using Bengaluru default");
//       handleNoGeolocationSupport();
//       return;
//     }

//     // For iOS, check permission differently
//     if (isIOS) {
//       handleIOSPermissionCheck();
//     } else {
//       // Android/Desktop - use permissions API
//       handleStandardPermissionCheck();
//     }
//   };

//   // Get current location
//   const getCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       setError("Geolocation is not supported by this browser.");
//       setCurrentLocation(DEFAULT_LOCATION);
//       setSelectedLocation(DEFAULT_LOCATION);
//       setIsLoading(false);
//       return;
//     }

//     setIsLoading(true);
//     setError("");

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         const location = {
//           lat: latitude,
//           lng: longitude,
//         };

//         console.log("Got current location coordinates:", location);
//         setCurrentLocation(location);
//         setSelectedLocation(location);
//         setLocationDenied(false);
//         setLocationPermissionDenied(false);

//         // Save to localStorage in simple format
//         localStorage.setItem("currentLocation", JSON.stringify(location));

//         await getAddressFromCoordinates(latitude, longitude);
//         validateServiceabilityWithHub(location);
//         setIsLoading(false);
//       },
//       (error) => {
//         console.error("Error getting location:", error);

//         if (error.code === error.PERMISSION_DENIED) {
//           setLocationPermissionDenied(true);
//           setLocationDenied(true);
//           setError("Location access denied by user");
//           localStorage.setItem("locationPermissionDenied", "true");
//         } else if (error.code === error.POSITION_UNAVAILABLE) {
//           setError("Location information is unavailable.");
//         } else if (error.code === error.TIMEOUT) {
//           setError("Location request timed out.");
//         } else {
//           setError(`Unable to retrieve your location: ${error.message}`);
//         }

//         console.log("Using Bengaluru as fallback location:", DEFAULT_LOCATION);
//         setCurrentLocation(DEFAULT_LOCATION);
//         setSelectedLocation(DEFAULT_LOCATION);

//         getAddressFromCoordinates(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
//         validateServiceabilityWithHub(DEFAULT_LOCATION);
//         setIsLoading(false);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0,
//       },
//     );
//   };

//   const initializeMap = (location) => {
//     // Check if we have a valid location
//     if (
//       !location ||
//       typeof location.lat !== "number" ||
//       typeof location.lng !== "number"
//     ) {
//       console.error("Invalid location provided to initializeMap:", location);
//       location = DEFAULT_LOCATION;
//     }

//     if (!mapRef.current || !window.google || !window.google.maps) {
//       console.error("Map container not found or Google Maps not loaded");

//       // For iOS, try to show error and fallback
//       if (isIOS) {
//         setError("Unable to load map. Please check your internet connection.");
//       }

//       setIsServiceable(null);
//       setIsConfirmed(true);
//       return;
//     }

//     try {
//       console.log("Creating new map instance at:", location);

//       if (!mapRef.current) {
//         console.error("Map container not found!");
//         return;
//       }

//       const map = new window.google.maps.Map(mapRef.current, {
//         zoom: 16,
//         center: location,
//         mapTypeControl: false,
//         streetViewControl: false,
//         fullscreenControl: false,
//         zoomControl: false,
//         rotateControl: false,
//         scaleControl: false,
//         styles: [
//           {
//             featureType: "poi",
//             elementType: "labels",
//             stylers: [{ visibility: "on" }],
//           },
//         ],
//         backgroundColor: "#f5f5f5",
//         disableDefaultUI: true,
//         gestureHandling: "greedy",
//       });

//       mapInstanceRef.current = map;

//       if (!placesServiceRef.current) {
//         placesServiceRef.current = new window.google.maps.places.PlacesService(
//           map,
//         );
//       }

//       // Create custom location button
//       const locationButton = document.createElement("button");
//       locationButton.style.backgroundColor = "#fff";
//       locationButton.style.border = "2px solid #fff";
//       locationButton.style.borderRadius = "8px";
//       locationButton.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
//       locationButton.style.color = "#6b8e23";
//       locationButton.style.cursor = "pointer";
//       locationButton.style.padding = "10px";
//       locationButton.style.width = "40px";
//       locationButton.style.height = "40px";
//       locationButton.style.display = "flex";
//       locationButton.style.alignItems = "center";
//       locationButton.style.justifyContent = "center";
//       locationButton.style.margin = "10px";
//       locationButton.style.transition = "all 0.3s ease";
//       locationButton.style.fontSize = "24px";

//       locationButton.innerHTML = `
//         <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
//           <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
//         </svg>
//       `;

//       locationButton.addEventListener("mouseenter", () => {
//         locationButton.style.backgroundColor = "#f8f8f8";
//         locationButton.style.transform = "scale(1.05)";
//       });

//       locationButton.addEventListener("mouseleave", () => {
//         locationButton.style.backgroundColor = "#fff";
//         locationButton.style.transform = "scale(1)";
//       });

//       locationButton.addEventListener("click", () => {
//         locationButton.innerHTML = `
//           <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
//             <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
//             <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
//               <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
//             </path>
//           </svg>
//         `;

//         if (navigator.geolocation) {
//           navigator.geolocation.getCurrentPosition(
//             (position) => {
//               const currentLocation = {
//                 lat: position.coords.latitude,
//                 lng: position.coords.longitude,
//               };

//               console.log("Current location:", currentLocation);

//               map.setCenter(currentLocation);
//               map.setZoom(16);

//               if (markerRef.current) {
//                 markerRef.current.setPosition(currentLocation);
//               }

//               setSelectedLocation(currentLocation);
//               setIsConfirmed(false);

//               localStorage.setItem(
//                 "currentLocation",
//                 JSON.stringify(currentLocation),
//               );

//               getAddressFromCoordinates(
//                 currentLocation.lat,
//                 currentLocation.lng,
//               );
//               validateServiceabilityWithHub(currentLocation);

//               locationButton.innerHTML = `
//                 <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
//                 </svg>
//               `;
//             },
//             (error) => {
//               console.error("Error getting location:", error);

//               if (error.code === error.PERMISSION_DENIED) {
//                 setLocationPermissionDenied(true);
//                 Swal2.fire({
//                   toast: true,
//                   position: "bottom",
//                   icon: "error",
//                   title:
//                     "Location access denied. Please enable location permissions in your browser settings.",
//                   showConfirmButton: false,
//                   timer: 4000,
//                   timerProgressBar: true,
//                   customClass: {
//                     popup: "me-small-toast",
//                     title: "me-small-toast-title",
//                   },
//                 });
//               } else {
//                 Swal2.fire({
//                   toast: true,
//                   position: "bottom",
//                   icon: "error",
//                   title: "Unable to get your location. Please try again.",
//                   showConfirmButton: false,
//                   timer: 3000,
//                   timerProgressBar: true,
//                   customClass: {
//                     popup: "me-small-toast",
//                     title: "me-small-toast-title",
//                   },
//                 });
//               }

//               locationButton.innerHTML = `
//                 <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
//                 </svg>
//               `;
//             },
//             {
//               enableHighAccuracy: true,
//               timeout: 10000,
//               maximumAge: 0,
//             },
//           );
//         } else {
//           Swal2.fire({
//             toast: true,
//             position: "bottom",
//             icon: "error",
//             title: "Geolocation is not supported by your browser",
//             showConfirmButton: false,
//             timer: 3000,
//             timerProgressBar: true,
//             customClass: {
//               popup: "me-small-toast",
//               title: "me-small-toast-title",
//             },
//           });
//         }
//       });

//       map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(
//         locationButton,
//       );

//       // Create fixed pin element
//       const fixedPinElement = document.createElement("div");
//       fixedPinElement.style.position = "absolute";
//       fixedPinElement.style.top = "50%";
//       fixedPinElement.style.left = "50%";
//       fixedPinElement.style.transform = "translate(-50%, -100%)";
//       fixedPinElement.style.width = "40px";
//       fixedPinElement.style.height = "50px";
//       fixedPinElement.style.pointerEvents = "none";
//       fixedPinElement.style.zIndex = "1000";

//       fixedPinElement.innerHTML = `
//         <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
//           <style>
//             @keyframes pulse {
//               0%, 100% { opacity: 1; }
//               50% { opacity: 0.7; }
//             }
//             @media (max-width: 480px) {
//               .pin-line {
//                 animation: pulse 1.5s ease-in-out infinite !important;
//               }
//             }
//           </style>
//           <circle cx="20" cy="10" r="8" fill="#6B8E23" stroke="#fff" stroke-width="2"/>
//           <line
//             x1="20" y1="18"
//             x2="20" y2="45"
//             stroke="#6B8E23"
//             stroke-width="3"
//             stroke-linecap="round"
//             class="pin-line"
//             style="animation: pulse 2s ease-in-out infinite;"
//           />
//           <ellipse cx="20" cy="48" rx="4" ry="2" fill="#000" opacity="0.2"/>
//         </svg>
//       `;

//       const fixedMessageElement = document.createElement("div");
//       fixedMessageElement.style.position = "absolute";
//       fixedMessageElement.style.top = "calc(50% - 70px)";
//       fixedMessageElement.style.left = "50%";
//       fixedMessageElement.style.transform = "translateX(-50%)";
//       fixedMessageElement.style.background = "#6b8e23";
//       fixedMessageElement.style.color = "white";
//       fixedMessageElement.style.padding = "8px 12px";
//       fixedMessageElement.style.borderRadius = "6px";
//       fixedMessageElement.style.fontFamily = "Arial, sans-serif";
//       fixedMessageElement.style.fontSize = "12px";
//       fixedMessageElement.style.fontWeight = "700";
//       fixedMessageElement.style.lineHeight = "1.2";
//       fixedMessageElement.style.maxWidth = "200px";
//       fixedMessageElement.style.textAlign = "center";
//       fixedMessageElement.style.pointerEvents = "none";
//       fixedMessageElement.style.zIndex = "1000";
//       fixedMessageElement.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

//       const mobileStyles = `
//         @media (max-width: 480px) {
//           .fixed-pin-message {
//             top: calc(50% - 60px) !important;
//             padding: 6px 10px !important;
//             font-size: 11px !important;
//             max-width: 160px !important;
//             border-radius: 4px !important;
//           }
//           .fixed-pin-message div:first-child {
//             font-size: 10px !important;
//           }
//           .fixed-pin-message div:last-child {
//             font-size: 9px !important;
//             margin-top: 1px !important;
//           }
//         }

//         @media (max-width: 360px) {
//           .fixed-pin-message {
//             top: calc(50% - 55px) !important;
//             padding: 5px 8px !important;
//             font-size: 10px !important;
//             max-width: 140px !important;
//           }
//           .fixed-pin-message div:first-child {
//             font-size: 9px !important;
//           }
//           .fixed-pin-message div:last-child {
//             font-size: 8px !important;
//           }
//         }

//         @media (min-width: 481px) and (max-width: 768px) {
//           .fixed-pin-message {
//             top: calc(50% - 65px) !important;
//             padding: 7px 10px !important;
//             font-size: 11px !important;
//             max-width: 180px !important;
//           }
//         }
//       `;

//       fixedMessageElement.className = "fixed-pin-message";

//       const styleElement = document.createElement("style");
//       styleElement.textContent = mobileStyles;
//       document.head.appendChild(styleElement);

//       fixedMessageElement.innerHTML = `
//         <div>Order will be delivered here</div>
//         <div style="font-size: 10px; opacity: 0.9; margin-top: 2px; font-weight: normal;">
//           Move the map to set delivery location
//         </div>
//       `;

//       const pinStyles = `
//         @media (max-width: 480px) {
//           .fixed-pin {
//             width: 32px !important;
//             height: 40px !important;
//           }
//           .fixed-pin svg {
//             width: 32px !important;
//             height: 40px !important;
//           }
//         }

//         @media (max-width: 360px) {
//           .fixed-pin {
//             width: 28px !important;
//             height: 35px !important;
//           }
//           .fixed-pin svg {
//             width: 28px !important;
//             height: 35px !important;
//           }
//         }

//         @media (min-width: 481px) and (max-width: 768px) {
//           .fixed-pin {
//             width: 36px !important;
//             height: 45px !important;
//           }
//           .fixed-pin svg {
//             width: 36px !important;
//             height: 45px !important;
//           }
//         }
//       `;

//       fixedPinElement.className = "fixed-pin";
//       const pinStyleElement = document.createElement("style");
//       pinStyleElement.textContent = pinStyles;
//       document.head.appendChild(pinStyleElement);

//       mapRef.current.appendChild(fixedPinElement);
//       mapRef.current.appendChild(fixedMessageElement);

//       fixedPinRef.current = fixedPinElement;
//       fixedMessageRef.current = fixedMessageElement;

//       infoWindowRef.current = null;

//       markerRef.current = new window.google.maps.Marker({
//         position: location,
//         map: map,
//         visible: false,
//         title: "Delivery location",
//       });

//       console.log("Fixed pin and message created at center");

//       let mapMoveTimeout;

//       const updateLocationFromCenter = () => {
//         const newCenter = map.getCenter();
//         const newLocation = {
//           lat: newCenter.lat(),
//           lng: newCenter.lng(),
//         };

//         console.log("Map moved to:", newLocation);
//         markerRef.current.setPosition(newLocation);
//         setSelectedLocation(newLocation);
//         setIsConfirmed(false);
//         getAddressFromCoordinates(newLocation.lat, newLocation.lng);
//         validateServiceabilityWithHub(newLocation);
//       };

//       map.addListener("center_changed", () => {
//         if (mapMoveTimeout) clearTimeout(mapMoveTimeout);
//         mapMoveTimeout = setTimeout(() => {
//           updateLocationFromCenter();
//         }, 300);
//       });

//       map.addListener("dragstart", () => {
//         if (fixedPinRef.current) {
//           const line = fixedPinRef.current.querySelector("line");
//           if (line) {
//             line.style.animation = "pulse 0.5s ease-in-out infinite";
//           }
//         }

//         if (fixedMessageRef.current) {
//           fixedMessageRef.current.style.transform =
//             "translateX(-50%) scale(0.95)";
//           fixedMessageRef.current.style.opacity = "0.9";
//         }
//       });

//       map.addListener("dragend", () => {
//         if (fixedPinRef.current) {
//           const line = fixedPinRef.current.querySelector("line");
//           if (line) {
//             line.style.animation = "pulse 2s ease-in-out infinite";
//           }
//         }

//         if (fixedMessageRef.current) {
//           fixedMessageRef.current.style.transform = "translateX(-50%)";
//           fixedMessageRef.current.style.opacity = "1";
//         }
//       });

//       map.addListener("idle", () => {
//         if (fixedPinRef.current) {
//           const line = fixedPinRef.current.querySelector("line");
//           if (line) {
//             line.style.animation = "pulse 2s ease-in-out infinite";
//           }
//         }

//         if (fixedMessageRef.current) {
//           fixedMessageRef.current.style.transform = "translateX(-50%)";
//           fixedMessageRef.current.style.opacity = "1";
//         }
//       });

//       console.log("Map initialized successfully with fixed pin and message");
//     } catch (error) {
//       console.error("Error initializing map:", error);
//       setError("Failed to initialize map. Please try again.");
//     }
//   };

//   // Handle iOS specific initialization
//   useEffect(() => {
//     if (isIOS) {
//       console.log("iOS device detected");

//       // Check if location permission might be denied
//       const timer = setTimeout(() => {
//         if (locationDenied && !mapInstanceRef.current && scriptLoaded) {
//           console.log(
//             "iOS: Location denied and map not initialized, forcing initialization",
//           );
//           setTimeout(() => forceMapInitialization(DEFAULT_LOCATION), 300);
//         }
//       }, 1000);

//       return () => clearTimeout(timer);
//     }
//   }, [locationDenied, scriptLoaded, isIOS]);

//   const handleSearchChange = (e) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     if (query.length > 2 && autocompleteServiceRef.current) {
//       autocompleteServiceRef.current.getPlacePredictions(
//         {
//           input: query,
//           types: ["geocode", "establishment"],
//           componentRestrictions: { country: "in" },
//         },
//         (predictions, status) => {
//           if (
//             status === window.google.maps.places.PlacesServiceStatus.OK &&
//             predictions
//           ) {
//             setSearchSuggestions(predictions);
//           } else {
//             setSearchSuggestions([]);
//           }
//         },
//       );
//     } else {
//       setSearchSuggestions([]);
//     }
//   };

//   const handleLocationSelect = (place) => {
//     if (placesServiceRef.current) {
//       placesServiceRef.current.getDetails(
//         {
//           placeId: place.place_id,
//           fields: ["geometry", "name", "formatted_address"],
//         },
//         (placeResult, status) => {
//           if (status === window.google.maps.places.PlacesServiceStatus.OK) {
//             const location = {
//               lat: placeResult.geometry.location.lat(),
//               lng: placeResult.geometry.location.lng(),
//             };

//             setSelectedLocation(location);
//             setAddress(placeResult.formatted_address);
//             setHouseName(
//               placeResult.name || placeResult.formatted_address.split(",")[0],
//             );

//             if (mapInstanceRef.current && markerRef.current) {
//               mapInstanceRef.current.panTo(location);
//               mapInstanceRef.current.setZoom(16);
//               markerRef.current.setPosition(location);
//             }

//             setSearchQuery("");
//             setSearchSuggestions([]);
//             setIsConfirmed(false);
//             validateServiceabilityWithHub(location);
//           }
//         },
//       );
//     }
//   };

//   const handleServiceRequest = async () => {
//     const name = String(serviceRequestName || "");
//     const phone = String(serviceRequestPhone || "");

//     if (!name.trim()) {
//       setError("Please enter your name");
//       return;
//     }

//     if (!phone.trim()) {
//       setError("Please enter your phone number");
//       return;
//     }

//     const phoneRegex = /^[0-9]{10}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       setError("Please enter a valid 10-digit phone number");
//       return;
//     }

//     try {
//       setIsSubmittingRequest(true);
//       setError("");

//       const user = JSON.parse(localStorage.getItem("user"));

//       if (!user || !user._id) {
//         setError("User not found. Please login again.");
//         return;
//       }

//       const customerId = user._id;

//       const requestData = {
//         customerId,
//         name: name.trim(),
//         phone: phone.trim(),
//         location: selectedLocation,
//         address: address,
//       };

//       console.log("Submitting service request:", requestData);

//       const response = await axios.post(
//         "http://localhost:7013/api/service-requests",
//         requestData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           timeout: 10000,
//         },
//       );

//       if (response.data.success) {
//         const isSmall = window.innerWidth <= 768;

//         const successData = {
//           name: name.trim(),
//           phone: phone.trim(),
//           address: address || "Address not available",
//         };

//         setShowServiceablePopup(false);
//         setServiceRequestName("");
//         setServiceRequestPhone("");

//         setTimeout(() => {
//           Swal2.fire({
//             html: `
//             <div style="text-align: center; padding: ${
//               isSmall ? "8px" : "12px"
//             }">
//               <div style="font-size: ${
//                 isSmall ? "16px" : "18px"
//               }; color: #6B8E23; margin-bottom: ${
//                 isSmall ? "12px" : "15px"
//               }; font-weight: 600;">
//                 ✅ Your service request has been successfully submitted!
//               </div>
//               <div style="font-size: ${
//                 isSmall ? "13px" : "14px"
//               }; color: #666; line-height: 1.5; margin-bottom: ${
//                 isSmall ? "12px" : "15px"
//               }">
//                 <div style="text-align: left; margin: 0 auto; max-width: ${
//                   isSmall ? "280px" : "320px"
//                 }; background: #f9f9f9; padding: 12px; border-radius: 8px; margin-bottom: 12px">
//                   <p style="margin: 6px 0"><strong>Name:</strong> ${
//                     successData.name
//                   }</p>
//                   <p style="margin: 6px 0"><strong>Phone:</strong> ${
//                     successData.phone
//                   }</p>
//                   <p style="margin: 6px 0"><strong>Address:</strong> ${
//                     successData.address
//                   }</p>
//                 </div>
//                 <p style="font-weight: 600; color: #333; margin-bottom: 8px">What happens next?</p>
//                 <div style="text-align: left; margin: 0 auto; max-width: ${
//                   isSmall ? "280px" : "320px"
//                 }">
//                   <p style="margin: 4px 0">• Our team will review your location</p>
//                   <p style="margin: 4px 0">• You'll be notified when service starts in your area</p>
//                 </div>
//               </div>
//             </div>
//           `,
//             icon: "success",
//             confirmButtonText: "Got it!",
//             confirmButtonColor: "#6B8E23",
//             width: isSmall ? "90%" : "500px",
//             padding: isSmall ? "1rem" : "1.5rem",
//             backdrop: true,
//             allowOutsideClick: true,
//             allowEscapeKey: true,
//             focusConfirm: true,
//             showConfirmButton: true,
//             zIndex: 9999999,
//           });
//         }, 500);

//         navigate("/location");
//       } else {
//         throw new Error(response.data.message || "Failed to submit request");
//       }
//     } catch (error) {
//       console.error("Error submitting service request:", error);

//       if (error.code === "ECONNABORTED") {
//         setError("Request timeout. Please try again.");
//       } else if (error.response) {
//         const status = error.response.status;
//         const message =
//           error.response.data?.message || "Failed to submit request";

//         if (status === 409) {
//           setError("You already have a pending request for this location.");
//         } else if (status === 400) {
//           setError("Invalid request. Please check your information.");
//         } else if (status === 404) {
//           setError("User not found. Please login again.");
//         } else if (status >= 500) {
//           setError("Server error. Please try again later.");
//         } else {
//           setError(message);
//         }
//       } else if (error.request) {
//         setError("Network error. Please check your connection and try again.");
//       } else {
//         setError(
//           error.message || "Failed to submit request. Please try again.",
//         );
//       }
//     } finally {
//       setIsSubmittingRequest(false);
//     }
//   };

//   const handleCancelServiceRequest = () => {
//     setShowServiceablePopup(false);
//     setServiceRequestName("");
//     setServiceRequestPhone("");
//   };

//   useEffect(() => {
//     if (!location.state?.editingAddress) {
//       setLandmark("");
//       setFloor("");
//       setTowerBlock("");
//       setFlat("");
//       setStudentName("");
//       setStudentClass("");
//       setStudentSection("");
//       setFloorNo("");
//       setHomeName("");
//       setApartmentName("");
//       setSchoolName("");
//       setCompanyName("");
//       setBuildingName("");
//     }
//   }, [addressType, location.state?.editingAddress]);

//   const isFormValid = () => {
//     if (!houseName.trim()) return false;

//     switch (addressType) {
//       case "Home":
//         return homeName.trim();
//       case "PG":
//         return apartmentName.trim() && towerBlock.trim() && flat.trim();
//       case "School":
//         return (
//           schoolName.trim() &&
//           studentName.trim() &&
//           studentClass.trim() &&
//           studentSection.trim()
//         );
//       case "Work":
//         return companyName.trim() && floorNo.trim() && buildingName.trim();
//       default:
//         return false;
//     }
//   };

//   const handleSaveAddress = async (e) => {
//     e.preventDefault();
//     if (!isFormValid()) {
//       setError("Please fill all required fields");
//       return;
//     }

//     let locationObj = selectedLocation;
//     console.log("🔍 handleSaveAddress - selectedLocation:", selectedLocation);

//     if (!locationObj || !locationObj.lat || !locationObj.lng) {
//       setError(
//         "Location coordinates are missing. Please try moving the pin on the map.",
//       );
//       setIsLoading(false);
//       return;
//     }

//     // Get hub data from serviceability check
//     const hubData = hub.length > 0 ? hub[0] : null;
//     console.log("Hub data for saving:", hubData);

//     const addressData = {
//       location: locationObj,
//       address: address,
//       houseName: houseName,
//       addressType: addressType,
//       homeName: homeName,
//       apartmentName: apartmentName,
//       schoolName: schoolName,
//       companyName: companyName,
//       hubName: hubData?.hubName || "",
//       hubId: hubData?.hub || "",
//       ...(addressType === "Home" && { landmark, floor }),
//       ...(addressType === "PG" && { towerBlock, flat, floor }),
//       ...(addressType === "School" && {
//         studentName,
//         studentClass,
//         studentSection,
//       }),
//       ...(addressType === "Work" && { floorNo, buildingName }),
//       fullAddress: generateFullAddress(),
//       isDefault: true,
//     };

//     console.log("Saving address as primary:", addressData);

//     try {
//       setIsLoading(true);

//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user._id;

//       if (!customerId) {
//         setError("Customer ID not found. Please login again.");
//         return;
//       }

//       // const requestPayload = {
//       //   customerId: customerId,
//       //   addressType: addressData.addressType,
//       //   houseName: addressData.houseName,
//       //   fullAddress: addressData.fullAddress,
//       //   location: {
//       //     lat: addressData.location.lat,
//       //     lng: addressData.location.lng,
//       //   },
//       //   landmark: addressData.landmark || "",
//       //   floor: addressData.floor || "",
//       //   towerBlock: addressData.towerBlock || "",
//       //   flat: addressData.flat || "",
//       //   studentName: addressData.studentName || "",
//       //   studentClass: addressData.studentClass || "",
//       //   studentSection: addressData.studentSection || "",
//       //   floorNo: addressData.floorNo || "",
//       //   buildingName: addressData.buildingName || "",
//       //   homeName: addressData.homeName || "",
//       //   apartmentName: addressData.apartmentName || "",
//       //   schoolName: addressData.schoolName || "",
//       //   companyName: addressData.companyName || "",
//       //   isDefault: true,
//       //   hubName: addressData.hubName || "",
//       //   hubId: addressData.hubId || "",
//       // };

//       const requestPayload = {
//         customerId: customerId,
//         addressType: addressData.addressType,
//         houseName: addressData.houseName,
//         fullAddress: addressData.fullAddress,
//         location: {
//           lat: addressData.location.lat,
//           lng: addressData.location.lng,
//         },
//         landmark: addressData.landmark || "",
//         floor: addressData.floor || "",
//         towerBlock: addressData.towerBlock || "",
//         flat: addressData.flat || "",
//         floorNo: addressData.floorNo || "",
//         buildingName: addressData.buildingName || "",
//         homeName: addressData.homeName || "",
//         apartmentName: addressData.apartmentName || "",
//         schoolName: addressData.schoolName || "",
//         companyName: addressData.companyName || "",
//         isDefault: true,
//         hubName: addressData.hubName || "",
//         hubId: addressData.hubId || "",
//       };

//       // Send BOTH formats to ensure compatibility with both operations
//       if (addressData.addressType === "School") {
//         // For editing (PUT) - nested format
//         requestPayload.studentInformation = {
//           studentName: addressData.studentName || "",
//           studentClass: addressData.studentClass || "",
//           studentSection: addressData.studentSection || "",
//         };
//       }

//       // Always send top-level fields for saving (POST)
//       requestPayload.studentName = addressData.studentName || "";
//       requestPayload.studentClass = addressData.studentClass || "";
//       requestPayload.studentSection = addressData.studentSection || "";

//       console.log("req payload", requestPayload);

//       if (location.state?.editingAddress?._id) {
//         requestPayload.addressId = location.state.editingAddress._id;
//         if (!location.state.editingAddress.isDefault) {
//           requestPayload.isDefault = false;
//         }
//       }

//       const endpoint = location.state?.editingAddress?._id
//         ? `http://localhost:7013/api/User/customers/${user._id}/addresses/${location.state.editingAddress._id}`
//         : "http://localhost:7013/api/User/addresses";
//       const method = location.state?.editingAddress?._id ? "PUT" : "POST";

//       const response = await fetch(endpoint, {
//         method: method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestPayload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to save address");
//       }

//       const result = await response.json();

//       if (result.success) {
//         if (!location.state?.editingAddress?._id) {
//           const savedAddressId = result.address?._id || result.addressId;

//           if (savedAddressId) {
//             await setAddressAsPrimary(customerId, savedAddressId);
//           }
//         }

//         resetForm();

//         window.dispatchEvent(new Event("addressAdded"));

//         localStorage.setItem("primaryAddress", JSON.stringify(addressData));
//         localStorage.setItem("locationManuallySelected", "true");
//         localStorage.removeItem("postLoginDestination");

//         navigate("/home", {
//           state: {
//             userLocation: selectedLocation,
//             userAddress: address,
//             addressData: addressData,
//             isPrimary: true,
//           },
//         });
//       } else {
//         throw new Error(result.message || "Failed to save address");
//       }
//     } catch (error) {
//       console.error("Error saving address:", error);
//       setError(error.message || "Failed to save address. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const setAddressAsPrimary = async (customerId, addressId) => {
//     try {
//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/addresses/${addressId}/primary`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//         },
//       );

//       if (response.ok) {
//         console.log(`Address ${addressId} set as primary successfully`);

//         const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
//         if (cachedAddresses) {
//           const cached = JSON.parse(cachedAddresses);
//           cached.primaryAddress = addressId;
//           localStorage.setItem(
//             `addresses_${customerId}`,
//             JSON.stringify(cached),
//           );
//         }

//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error("Error setting address as primary:", error);
//       return false;
//     }
//   };

//   const generateFullAddress = () => {
//     let fullAddress = address;
//     let parts = [];

//     switch (addressType) {
//       case "Home":
//         if (homeName) parts.push(homeName);
//         if (landmark) parts.push(`near ${landmark}`);
//         if (floor) parts.push(floor);
//         break;
//       case "PG":
//         if (apartmentName) parts.push(apartmentName);
//         if (towerBlock) parts.push(towerBlock);
//         if (flat) parts.push(flat);
//         if (floor) parts.push(floor);
//         break;
//       case "School":
//         if (schoolName) parts.push(schoolName);
//         if (studentName) parts.push(studentName);
//         if (studentClass) parts.push(`Class ${studentClass}`);
//         if (studentSection) parts.push(`Section ${studentSection}`);
//         break;
//       case "Work":
//         if (companyName) parts.push(companyName);
//         if (floorNo) parts.push(floorNo);
//         if (buildingName) parts.push(buildingName);
//         break;
//     }

//     // Always add the base address at the end
//     parts.push(fullAddress);

//     return parts.join(", ");
//   };

//   const resetForm = () => {
//     setHouseName("");
//     setLandmark("");
//     setFloor("");
//     setTowerBlock("");
//     setFlat("");
//     setStudentName("");
//     setStudentClass("");
//     setStudentSection("");
//     setFloorNo("");
//     setHomeName("");
//     setApartmentName("");
//     setSchoolName("");
//     setCompanyName("");
//     setBuildingName("");
//   };

//   const addressTypes = [
//     { key: "Home", label: "Home", icon: homeimg, icon2: homeimg2 },
//     {
//       key: "PG",
//       label: "PG/ Apartment",
//       icon: apartmentimg,
//       icon2: apartmentimg2,
//     },
//     { key: "School", label: "School", icon: schoolimg, icon2: schoolimg2 },
//     { key: "Work", label: "Work", icon: workimg, icon2: workimg2 },
//   ];

//   const renderTypeSpecificFields = () => {
//     const commonInputStyle = {
//       width: "100%",
//       height: "44px",
//       borderRadius: "12px",
//       padding: "8px 16px",
//       border: "0.4px solid #6B8E23",
//       background: "#FAFAFA",
//       fontSize: "14px",
//       marginBottom: "10px",
//     };

//     switch (addressType) {
//       case "Home":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={homeName}
//               onChange={(e) => setHomeName(e.target.value)}
//               placeholder="Home Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={landmark}
//               onChange={(e) => setLandmark(e.target.value)}
//               placeholder="Landmark, building, floor"
//               style={{ ...commonInputStyle, marginBottom: "0" }}
//             />
//           </div>
//         );

//       case "PG":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={apartmentName}
//               onChange={(e) => setApartmentName(e.target.value)}
//               placeholder="Apartment Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={towerBlock}
//               onChange={(e) => setTowerBlock(e.target.value)}
//               placeholder="Tower/Block name *"
//               style={commonInputStyle}
//             />
//             <div
//               className="d-flex"
//               style={{
//                 width: "100%",
//                 gap: "12px",
//               }}
//             >
//               <input
//                 type="text"
//                 value={flat}
//                 onChange={(e) => setFlat(e.target.value)}
//                 placeholder="Flat *"
//                 style={commonInputStyle}
//               />
//               <input
//                 type="text"
//                 value={floor}
//                 onChange={(e) => setFloor(e.target.value)}
//                 placeholder="Floor"
//                 style={commonInputStyle}
//               />
//             </div>
//           </div>
//         );

//       case "School":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <div
//               className=" gap-2 align-items-start"
//               style={{ display: "flex", gap: 2 }}
//             >
//               <img
//                 src={spilt}
//                 alt=""
//                 style={{ width: "20px", height: "20px", marginTop: "2px" }}
//               />
//               <p
//                 className="mb-0"
//                 style={{
//                   color: "#2c2c2c",
//                   fontSize: "14px",
//                   fontFamily: "Inter",
//                   fontWeight: "500",
//                 }}
//               >
//                 Later you can split the order
//               </p>
//               <img
//                 src={warning}
//                 alt=""
//                 style={{ width: "10px", height: "10px", marginTop: "6px" }}
//               />
//             </div>

//             <div
//               className=" gap-2 align-items-start"
//               style={{ display: "flex", gap: 2 }}
//             >
//               <img
//                 src={secure}
//                 alt=""
//                 style={{ width: "12px", height: "12px", marginTop: "2px" }}
//               />
//               <p
//                 className="mb-0"
//                 style={{
//                   color: "#2c2c2c",
//                   fontSize: "10px",
//                   fontFamily: "Inter",
//                   fontWeight: "500",
//                 }}
//               >
//                 Safe & Private: details are only used to deliver correctly.
//               </p>
//             </div>

//             <input
//               type="text"
//               value={schoolName}
//               onChange={(e) => setSchoolName(e.target.value)}
//               placeholder="School Name *"
//               style={commonInputStyle}
//             />

//             <input
//               type="text"
//               placeholder="Student's full name *"
//               value={studentName}
//               onChange={(e) => setStudentName(e.target.value)}
//               style={commonInputStyle}
//             />

//             <div
//               className="d-flex "
//               style={{
//                 width: "100%",
//                 gap: "12px",
//               }}
//             >
//               <input
//                 type="text"
//                 placeholder="Class *"
//                 value={studentClass}
//                 onChange={(e) => setStudentClass(e.target.value)}
//                 style={commonInputStyle}
//               />
//               <input
//                 type="text"
//                 placeholder="Section *"
//                 value={studentSection}
//                 onChange={(e) => setStudentSection(e.target.value)}
//                 style={commonInputStyle}
//               />
//             </div>
//           </div>
//         );

//       case "Work":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={companyName}
//               onChange={(e) => setCompanyName(e.target.value)}
//               placeholder="Company Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={buildingName}
//               onChange={(e) => setBuildingName(e.target.value)}
//               placeholder="Building Name *"
//               style={{ ...commonInputStyle, marginBottom: "0" }}
//             />
//             <input
//               type="text"
//               value={floorNo}
//               onChange={(e) => setFloorNo(e.target.value)}
//               placeholder="Gate no / Floor no *"
//               style={{ ...commonInputStyle, marginBottom: "0" }}
//             />
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   const detectLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const userLocation = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };

//           if (mapInstanceRef.current) {
//             mapInstanceRef.current.setCenter(userLocation);
//             mapInstanceRef.current.setZoom(16);
//           }

//           setSelectedLocation(userLocation);
//           setIsConfirmed(false);
//           getAddressFromCoordinates(userLocation.lat, userLocation.lng);
//           validateServiceabilityWithHub(userLocation);
//         },
//         (error) => {
//           console.error("Error getting current location:", error);

//           if (error.code === error.PERMISSION_DENIED) {
//             setLocationPermissionDenied(true);
//             setError(
//               "Location access denied. Please enable location permissions in your browser settings.",
//             );
//           } else {
//             setError(
//               "Unable to detect your current location. Please make sure location services are enabled.",
//             );
//           }
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 60000,
//         },
//       );
//     } else {
//       setError("Geolocation is not supported by this browser.");
//     }
//   };

//   useEffect(() => {
//     return () => {
//       if (fixedPinRef.current && fixedPinRef.current.parentNode) {
//         fixedPinRef.current.parentNode.removeChild(fixedPinRef.current);
//       }
//       if (fixedMessageRef.current && fixedMessageRef.current.parentNode) {
//         fixedMessageRef.current.parentNode.removeChild(fixedMessageRef.current);
//       }
//     };
//   }, []);

//   // Render JSX remains exactly the same
//   return (
//     <div
//       style={{
//         height: "100dvh",
//         backgroundColor: "#f5f5f5",
//         fontFamily: "Arial, sans-serif",
//         position: "relative",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       {/* Serviceability Popup */}
//       {showServiceablePopup && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0,0,0,0.7)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 3000,
//             padding: "20px",
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "#F8F6F0",
//               borderRadius: "16px",
//               padding: "24px",
//               maxWidth: "400px",
//               width: "100%",
//               textAlign: "center",
//               boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
//             }}
//           >
//             <div
//               style={{
//                 fontSize: "48px",
//                 marginBottom: "16px",
//                 color: "#ffa500",
//               }}
//             ></div>
//             <h3
//               style={{
//                 marginBottom: "12px",
//                 color: "#333",
//                 fontSize: "20px",
//                 fontWeight: "600",
//               }}
//             >
//               Coming Soon to Your Area!
//             </h3>
//             <p
//               style={{
//                 marginBottom: "16px",
//                 color: "#666",
//                 fontSize: "14px",
//                 lineHeight: "1.5",
//               }}
//             >
//               We're not currently operating in this location, but we're
//               expanding rapidly! Let us know you're interested, and we'll notify
//               you as soon as we launch in your area.
//             </p>

//             <div style={{ marginBottom: "20px", textAlign: "left" }}>
//               <div style={{ marginBottom: "12px" }}>
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: "4px",
//                     fontSize: "14px",
//                     fontWeight: "500",
//                   }}
//                 >
//                   Your Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={serviceRequestName}
//                   onChange={(e) => setServiceRequestName(e.target.value)}
//                   placeholder="Enter your name"
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     border: "1px solid #ddd",
//                     borderRadius: "8px",
//                     fontSize: "14px",
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: "16px" }}>
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: "4px",
//                     fontSize: "14px",
//                     fontWeight: "500",
//                   }}
//                 >
//                   Phone Number *
//                 </label>
//                 <input
//                   type="tel"
//                   value={serviceRequestPhone}
//                   onChange={(e) => setServiceRequestPhone(e.target.value)}
//                   placeholder="Enter your phone number"
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     border: "1px solid #ddd",
//                     borderRadius: "8px",
//                     fontSize: "14px",
//                   }}
//                 />
//               </div>

//               <div
//                 style={{
//                   fontSize: "12px",
//                   color: "#666",
//                   marginBottom: "16px",
//                 }}
//               >
//                 <strong>Selected Location:</strong> {address}
//               </div>
//             </div>

//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: "12px",
//               }}
//             >
//               <button
//                 onClick={handleServiceRequest}
//                 disabled={
//                   isSubmittingRequest ||
//                   !serviceRequestName ||
//                   !serviceRequestPhone
//                 }
//                 style={{
//                   backgroundColor:
//                     isSubmittingRequest ||
//                     !serviceRequestName ||
//                     !serviceRequestPhone
//                       ? "#ccc"
//                       : "#6B8E23",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "12px",
//                   padding: "14px",
//                   fontSize: "16px",
//                   fontWeight: "600",
//                   cursor:
//                     isSubmittingRequest ||
//                     !serviceRequestName ||
//                     !serviceRequestPhone
//                       ? "not-allowed"
//                       : "pointer",
//                   transition: "background-color 0.2s",
//                 }}
//               >
//                 {isSubmittingRequest ? "Submitting..." : "Request Location"}
//               </button>
//               <button
//                 onClick={handleCancelServiceRequest}
//                 style={{
//                   backgroundColor: "transparent",
//                   color: "#666",
//                   border: "1px solid #ddd",
//                   borderRadius: "12px",
//                   padding: "14px",
//                   fontSize: "16px",
//                   fontWeight: "500",
//                   cursor: "pointer",
//                   transition: "background-color 0.2s",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.target.style.backgroundColor = "#f5f5f5";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.backgroundColor = "transparent";
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Top Half - Map */}
//       <div
//         style={{
//           flex: "1",
//           position: "relative",
//           backgroundColor: "#e9ecef",
//           overflow: "hidden",
//           borderBottom: "1px solid #e0e0e0",
//         }}
//       >
//         <div
//           ref={mapRef}
//           style={{
//             width: "100%",
//             height: "100%",
//             backgroundColor: "#e9ecef",
//           }}
//         />

//         {/* Search Bar */}
//         <div
//           style={{
//             position: "absolute",
//             top: "16px",
//             left: "16px",
//             right: "16px",
//             backgroundColor: "white",
//             borderRadius: "12px",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//             border: "1px solid #e0e0e0",
//             zIndex: 999999,
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               padding: "8px 12px",
//               gap: "8px",
//             }}
//           >
//             <Search size={18} color="#666" style={{ flexShrink: 0 }} />
//             <input
//               ref={searchInputRef}
//               type="text"
//               value={searchQuery}
//               onChange={handleSearchChange}
//               placeholder="Search for area, street, landmark..."
//               style={{
//                 flex: 1,
//                 border: "none",
//                 outline: "none",
//                 fontSize: "14px",
//                 padding: "8px 0",
//                 backgroundColor: "transparent",
//               }}
//             />
//             {searchQuery && (
//               <button
//                 onClick={() => {
//                   setSearchQuery("");
//                   setSearchSuggestions([]);
//                 }}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   fontSize: "18px",
//                   color: "#666",
//                   cursor: "pointer",
//                   padding: "4px",
//                 }}
//               >
//                 ×
//               </button>
//             )}
//           </div>

//           {/* Search Suggestions */}
//           {searchSuggestions.length > 0 && (
//             <div
//               style={{
//                 borderTop: "1px solid #e0e0e0",
//                 maxHeight: "200px",
//                 overflowY: "auto",
//               }}
//             >
//               {searchSuggestions.map((place, index) => (
//                 <div
//                   key={place.place_id}
//                   onClick={() => handleLocationSelect(place)}
//                   style={{
//                     padding: "12px 16px",
//                     borderBottom:
//                       index < searchSuggestions.length - 1
//                         ? "1px solid #f0f0f0"
//                         : "none",
//                     cursor: "pointer",
//                     transition: "background-color 0.2s",
//                     fontSize: "14px",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.backgroundColor = "#f8f9fa";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.backgroundColor = "white";
//                   }}
//                 >
//                   <div style={{ fontWeight: "500", color: "#333" }}>
//                     {place.structured_formatting.main_text}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "12px",
//                       color: "#666",
//                       marginTop: "2px",
//                     }}
//                   >
//                     {place.structured_formatting.secondary_text}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Loading Overlay */}
//         {isLoading && (
//           <div
//             style={{
//               position: "absolute",
//               top: "0",
//               left: "0",
//               right: "0",
//               bottom: "0",
//               backgroundColor: "rgba(255, 255, 255, 0.9)",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: "2000",
//             }}
//           >
//             <div
//               style={{
//                 width: "40px",
//                 height: "40px",
//                 border: "4px solid #e0e0e0",
//                 borderTop: "4px solid #6B8E23",
//                 borderRadius: "50%",
//                 animation: "spin 1s linear infinite",
//                 marginBottom: "16px",
//               }}
//             ></div>
//             <div
//               style={{
//                 fontSize: "16px",
//                 color: "#333",
//                 fontWeight: "500",
//               }}
//             >
//               {isLoading ? "" : "Loading map..."}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Bottom Half - Address Form */}
//       <div
//         style={{
//           flex: "1",
//           backgroundColor: "white",
//           padding: window.innerWidth <= 480 ? "16px" : "24px",
//           boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
//         }}
//       >
//         <div style={{ maxWidth: "500px", margin: "0 auto" }}>
//           {/* Current Address Display */}
//           <div
//             style={{
//               backgroundColor: "#f8f9fa",
//               borderRadius: "8px",
//               padding: window.innerWidth <= 480 ? "8px 10px" : "10px 12px",
//               marginBottom: window.innerWidth <= 480 ? "12px" : "16px",
//               border: "1px solid #e0e0e0",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: window.innerWidth <= 480 ? "6px" : "8px",
//               }}
//             >
//               <MapPin size={16} color="#4caf50" />

//               <div
//                 style={{
//                   flex: 1,
//                   minWidth: 0,
//                   fontSize: window.innerWidth <= 480 ? "12px" : "14px",
//                   color: "#666",
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                   lineHeight: "1.2",
//                 }}
//               >
//                 {address || "Detecting address..."}
//               </div>
//             </div>
//           </div>

//           {/* Serviceability Status */}
//           {selectedLocation && isServiceable === false && (
//             <div
//               style={{
//                 backgroundColor: "#fff3e0",
//                 border: "1px solid #ffcc80",
//                 borderRadius: "8px",
//                 padding: "12px",
//                 marginBottom: "20px",
//                 fontSize: window.innerWidth <= 480 ? "13px" : "14px",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "8px",
//                   fontWeight: "500",
//                   color: "#b22222",
//                   marginBottom: "4px",
//                 }}
//               >
//                 <span>⚠️</span>
//                 <span>Service not available in this area</span>
//               </div>
//               <div
//                 style={{
//                   fontSize: window.innerWidth <= 480 ? "11px" : "12px",
//                   color: "#666",
//                   lineHeight: "1.4",
//                 }}
//               >
//                 You can still save this address and request service for this
//                 location.
//               </div>
//             </div>
//           )}

//           {/* Show address form if location is serviceable, otherwise show request button */}
//           {isServiceable === true || isServiceable === null ? (
//             <form onSubmit={handleSaveAddress}>
//               {/* Address Type Selection */}
//               <div style={{ marginBottom: "10px" }}>
//                 <div
//                   style={{
//                     display: window.innerWidth <= 768 ? "flex" : "grid",
//                     flexWrap: window.innerWidth <= 768 ? "wrap" : "nowrap",
//                     justifyContent:
//                       window.innerWidth <= 768 ? "flex-start" : "stretch",
//                     gridTemplateColumns:
//                       window.innerWidth <= 360
//                         ? "repeat(2, 1fr)"
//                         : "repeat(4, 1fr)",
//                     gap:
//                       window.innerWidth <= 360
//                         ? "8px"
//                         : window.innerWidth <= 768
//                           ? "6px"
//                           : "8px",
//                     width: "100%",
//                   }}
//                 >
//                   {addressTypes.map((type) => (
//                     <button
//                       key={type.key}
//                       type="button"
//                       onClick={() => setAddressType(type.key)}
//                       style={{
//                         width: window.innerWidth <= 768 ? "auto" : "100%",
//                         minHeight:
//                           window.innerWidth <= 360
//                             ? "38px"
//                             : window.innerWidth <= 768
//                               ? "43px"
//                               : "65px",
//                         padding:
//                           window.innerWidth <= 360
//                             ? "6px 4px"
//                             : window.innerWidth <= 768
//                               ? "8px"
//                               : "12px",
//                         borderRadius:
//                           window.innerWidth <= 360
//                             ? "8px"
//                             : window.innerWidth <= 768
//                               ? "12px"
//                               : "14px",
//                         border:
//                           addressType === type.key
//                             ? "1.2px solid #F5DEB3"
//                             : "1.2px solid #F5DEB3",
//                         backgroundColor:
//                           addressType === type.key ? "#6B8E23" : "#FFF8DC",
//                         cursor: "pointer",
//                         transition: "all 0.2s ease",
//                         display: "inline-flex",
//                         flexDirection: "row",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         gap:
//                           window.innerWidth <= 360
//                             ? "4px"
//                             : window.innerWidth <= 768
//                               ? "6px"
//                               : "8px",
//                         overflow: "hidden",
//                         flexShrink: 0,
//                       }}
//                       onMouseEnter={(e) => {
//                         if (addressType !== type.key) {
//                           e.currentTarget.style.backgroundColor = "#F8F4E8";
//                         }
//                       }}
//                       onMouseLeave={(e) => {
//                         if (addressType !== type.key) {
//                           e.currentTarget.style.backgroundColor = "#FFF8DC";
//                         }
//                       }}
//                     >
//                       <img
//                         src={addressType === type.key ? type.icon2 : type.icon}
//                         alt={type.label}
//                         style={{
//                           width:
//                             window.innerWidth <= 360
//                               ? "14px"
//                               : window.innerWidth <= 768
//                                 ? "16px"
//                                 : "24px",
//                           height:
//                             window.innerWidth <= 360
//                               ? "14px"
//                               : window.innerWidth <= 768
//                                 ? "16px"
//                                 : "24px",
//                           objectFit: "contain",
//                           flexShrink: 0,
//                         }}
//                       />
//                       <span
//                         style={{
//                           fontSize:
//                             window.innerWidth <= 360
//                               ? "10px"
//                               : window.innerWidth <= 768
//                                 ? "11px"
//                                 : "14px",
//                           fontWeight: "500",
//                           fontFamily: "Inter",
//                           color: addressType === type.key ? "#fff" : "#000",
//                           textAlign: "center",
//                           lineHeight: "1.3",
//                           whiteSpace:
//                             window.innerWidth <= 768 ? "nowrap" : "normal",
//                         }}
//                       >
//                         {type.label}
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Type Specific Fields */}
//               {addressType && renderTypeSpecificFields()}

//               {/* Save Address Button */}
//               {addressType && (
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginTop: "24px",
//                     gap:
//                       window.innerWidth <= 360
//                         ? "8px"
//                         : window.innerWidth <= 768
//                           ? "12px"
//                           : "16px",
//                     paddingTop: "20px",
//                     borderTop: "1px solid rgba(0,0,0,0.1)",
//                   }}
//                 >
//                   <button
//                     type="button"
//                     onClick={() => {
//                       navigate("/home");
//                     }}
//                     style={{
//                       backgroundColor: "transparent",
//                       border: "1px solid #d5c5b0",
//                       borderRadius:
//                         window.innerWidth <= 360
//                           ? "8px"
//                           : window.innerWidth <= 768
//                             ? "12px"
//                             : "14px",
//                       width: "48%",
//                       height:
//                         window.innerWidth <= 360
//                           ? "40px"
//                           : window.innerWidth <= 768
//                             ? "45px"
//                             : "50px",
//                       fontWeight: "600",
//                       textAlign: "center",
//                       fontSize:
//                         window.innerWidth <= 360
//                           ? "13px"
//                           : window.innerWidth <= 768
//                             ? "14px"
//                             : "16px",
//                       padding: "0 10px",
//                       display: "flex",
//                       flexDirection: "row",
//                       justifyContent: "center",
//                       alignItems: "center",
//                       gap: "6px",
//                       cursor: "pointer",
//                       transition: "all 0.2s ease",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = "#f9f9f9";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor = "transparent";
//                     }}
//                   >
//                     Cancel
//                     <img
//                       src={cross}
//                       alt=""
//                       style={{
//                         width:
//                           window.innerWidth <= 360
//                             ? "12px"
//                             : window.innerWidth <= 768
//                               ? "14px"
//                               : "16px",
//                         height:
//                           window.innerWidth <= 360
//                             ? "12px"
//                             : window.innerWidth <= 768
//                               ? "14px"
//                               : "16px",
//                       }}
//                     />
//                   </button>

//                   <button
//                     type="submit"
//                     disabled={!isFormValid() || isLoading}
//                     style={{
//                       backgroundColor:
//                         isFormValid() && !isLoading ? "#E6B800" : "#C0C0C0",
//                       borderRadius:
//                         window.innerWidth <= 360
//                           ? "8px"
//                           : window.innerWidth <= 768
//                             ? "12px"
//                             : "14px",
//                       border: "1px solid #c0c0c0",
//                       width: "48%",
//                       height:
//                         window.innerWidth <= 360
//                           ? "40px"
//                           : window.innerWidth <= 768
//                             ? "45px"
//                             : "50px",
//                       fontWeight: "600",
//                       color: "black",
//                       cursor:
//                         isFormValid() && !isLoading ? "pointer" : "not-allowed",
//                       fontSize:
//                         window.innerWidth <= 360
//                           ? "13px"
//                           : window.innerWidth <= 768
//                             ? "14px"
//                             : "16px",
//                       padding: "0 12px",
//                       gap: "6px",
//                       display: "flex",
//                       flexDirection: "row",
//                       justifyContent: "center",
//                       alignItems: "center",
//                       transition: "all 0.2s ease",
//                     }}
//                     onMouseEnter={(e) => {
//                       if (isFormValid() && !isLoading) {
//                         e.currentTarget.style.backgroundColor = "#FFD700";
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       if (isFormValid() && !isLoading) {
//                         e.currentTarget.style.backgroundColor = "#E6B800";
//                       }
//                     }}
//                   >
//                     {isLoading
//                       ? "Saving..."
//                       : location.state?.editingAddress
//                         ? "Update Address"
//                         : "Save Address"}
//                     {!isLoading && (
//                       <CircleCheck
//                         style={{
//                           width:
//                             window.innerWidth <= 360
//                               ? "14px"
//                               : window.innerWidth <= 768
//                                 ? "16px"
//                                 : "18px",
//                           height:
//                             window.innerWidth <= 360
//                               ? "14px"
//                               : window.innerWidth <= 768
//                                 ? "16px"
//                                 : "18px",
//                           marginTop: "1px",
//                         }}
//                       />
//                     )}
//                   </button>
//                 </div>
//               )}
//             </form>
//           ) : isServiceable === false ? (
//             <div>
//               <button
//                 onClick={() => setShowServiceablePopup(true)}
//                 disabled={isValidatingServiceability || !selectedLocation}
//                 style={{
//                   width: "100%",
//                   padding: window.innerWidth <= 480 ? "14px" : "16px",
//                   backgroundColor:
//                     isValidatingServiceability || !selectedLocation
//                       ? "#ccc"
//                       : "#b22222",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "10px",
//                   fontSize: window.innerWidth <= 480 ? "14px" : "16px",
//                   fontWeight: "600",
//                   cursor:
//                     isValidatingServiceability || !selectedLocation
//                       ? "default"
//                       : "pointer",
//                   transition: "all 0.3s ease",
//                   marginBottom: "24px",
//                 }}
//                 onMouseEnter={(e) => {
//                   if (!isValidatingServiceability && selectedLocation) {
//                     e.target.style.opacity = "0.9";
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   if (!isValidatingServiceability && selectedLocation) {
//                     e.target.style.opacity = "1";
//                   }
//                 }}
//               >
//                 {isValidatingServiceability
//                   ? "Checking serviceability..."
//                   : "Request Service for This Area"}
//               </button>
//             </div>
//           ) : (
//             <div
//               style={{
//                 textAlign: "center",
//                 padding: "40px 0",
//               }}
//             ></div>
//           )}
//         </div>
//       </div>

//       <style>
//         {`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default UpdateLocation;

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Swal2 from "sweetalert2";
// import locationpng from "./../assets/deliverylocation.svg";
// import homeimg from "./../assets/ion_home-outline.png";
// import homeimg2 from "./../assets/ion_home-outline-white.svg";
// import apartmentimg from "./../assets/apartment.png";
// import apartmentimg2 from "./../assets/tabler_building-skyscraper-white.svg";
// import workimg from "./../assets/streamline-ultimate_work-from-home-user-sofa.png";
// import workimg2 from "./../assets/streamline-ultimate_work-from-home-user-sofa-white.svg";
// import schoolimg from "./../assets/streamline-ultimate-color_study-exam-math.png";
// import schoolimg2 from "./../assets/streamline-ultimate-color_study-exam-math-white.png";
// import cross from "./../assets/cross.png";
// import { CircleCheck, Search, MapPin, Navigation } from "lucide-react";
// import spilt from "./../assets/spilt.png";
// import secure from "./../assets/secure.png";
// import warning from "./../assets/warning.png";
// import axios from "axios";
// import "./../Styles/Location.css";
// import locationIcon from "./../assets/red-location.png";

// function useWindowWidth() {
//   const [w, setW] = React.useState(
//     typeof window !== "undefined" ? window.innerWidth : 1024,
//   );
//   React.useEffect(() => {
//     const onResize = () => setW(window.innerWidth);
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);
//   return w;
// }

// const UpdateLocation = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Default Bengaluru coordinates
//   const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 };

//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [isMapLoading, setIsMapLoading] = useState(true);
//   const [isConfirmed, setIsConfirmed] = useState(false);
//   const [scriptLoaded, setScriptLoaded] = useState(false);
//   const [address, setAddress] = useState("Getting location...");
//   const [isGeocoding, setIsGeocoding] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchSuggestions, setSearchSuggestions] = useState([]);
//   const [locationPermissionGranted, setLocationPermissionGranted] =
//     useState(null);
//   const [isGettingLocation, setIsGettingLocation] = useState(false);
//   const [hasGeocoded, setHasGeocoded] = useState(false);

//   // Address form state
//   const [hub, setHub] = useState([]);
//   const [houseName, setHouseName] = useState("");
//   const [homeName, setHomeName] = useState("");
//   const [addressType, setAddressType] = useState("Home");
//   const [landmark, setLandmark] = useState("");
//   const [floor, setFloor] = useState("");

//   // PG specific fields
//   const [apartmentName, setApartmentName] = useState("");
//   const [towerBlock, setTowerBlock] = useState("");
//   const [flat, setFlat] = useState("");

//   // School specific fields
//   const [schoolName, setSchoolName] = useState("");
//   const [studentName, setStudentName] = useState("");
//   const [studentClass, setStudentClass] = useState("");
//   const [studentSection, setStudentSection] = useState("");

//   // Work specific field
//   const [companyName, setCompanyName] = useState("");
//   const [floorNo, setFloorNo] = useState("");
//   const [buildingName, setBuildingName] = useState("");

//   // Serviceability states
//   const [showServiceablePopup, setShowServiceablePopup] = useState(false);
//   const [serviceRequestName, setServiceRequestName] = useState();
//   const [serviceRequestPhone, setServiceRequestPhone] = useState("");
//   const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
//   const [isServiceable, setIsServiceable] = useState(null);
//   const [isValidatingServiceability, setIsValidatingServiceability] =
//     useState(false);

//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const markerRef = useRef(null);
//   const geocoderRef = useRef(null);
//   const autocompleteServiceRef = useRef(null);
//   const placesServiceRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const infoWindowRef = useRef(null);
//   const fixedPinRef = useRef(null);
//   const fixedMessageRef = useRef(null);
//   const locationAttemptRef = useRef(0);
//   const hasAttemptedLocationRef = useRef(false);

//   const width = useWindowWidth();
//   const isSmall = width <= 768; // For general mobile adjustments
//   const isVerySmall = width <= 360; // For stacking buttons vertically

//   const API_KEY = import.meta.env.VITE_MAP_KEY;

//   // Function to check location permission
//   const checkLocationPermission = useCallback(() => {
//     return new Promise((resolve) => {
//       if (!navigator.geolocation) {
//         resolve(false);
//         return;
//       }

//       if (navigator.permissions && navigator.permissions.query) {
//         navigator.permissions
//           .query({ name: "geolocation" })
//           .then((result) => {
//             if (result.state === "granted") {
//               resolve(true);
//             } else if (result.state === "denied") {
//               resolve(false);
//             } else {
//               resolve(null);
//             }
//           })
//           .catch(() => {
//             resolve(null);
//           });
//       } else {
//         resolve(null);
//       }
//     });
//   }, []);

//   // Get address from coordinates
//   const getAddressFromCoordinates = useCallback(async (lat, lng) => {
//     if (!window.google || !window.google.maps || !geocoderRef.current) {
//       setAddress("Address service not available");
//       return "Address service not available";
//     }

//     if (
//       typeof lat !== "number" ||
//       typeof lng !== "number" ||
//       isNaN(lat) ||
//       isNaN(lng)
//     ) {
//       setAddress("Invalid location coordinates");
//       return "Invalid location coordinates";
//     }

//     setIsGeocoding(true);
//     setAddress("Getting address...");

//     try {
//       const response = await new Promise((resolve, reject) => {
//         geocoderRef.current.geocode(
//           { location: { lat, lng } },
//           (results, status) => {
//             if (status === "OK" && results && results[0]) {
//               resolve(results[0].formatted_address);
//             } else if (status === "ZERO_RESULTS") {
//               resolve("No address found for this location");
//             } else {
//               reject(new Error(`Geocoding failed: ${status}`));
//             }
//           },
//         );
//       });

//       setAddress(response);
//       const shortAddress = response.split(",")[0];
//       setHouseName(shortAddress);
//       setHasGeocoded(true);
//       return response;
//     } catch (error) {
//       console.error("Geocoding error:", error);
//       const errorMsg = "Address not available";
//       setAddress(errorMsg);
//       setHasGeocoded(true);
//       return errorMsg;
//     } finally {
//       setIsGeocoding(false);
//     }
//   }, []);

//   // Get current location with smooth handling
//   const getCurrentLocation = useCallback(async () => {
//     if (!navigator.geolocation) {
//       console.log("Geolocation not supported");
//       setLocationPermissionGranted(false);
//       setAddress("Location service not available");
//       return DEFAULT_LOCATION;
//     }

//     setIsGettingLocation(true);
//     setAddress("Detecting your location...");
//     locationAttemptRef.current++;

//     return new Promise((resolve) => {
//       const locationOptions = {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0,
//       };

//       const successCallback = async (position) => {
//         console.log("Location obtained successfully");
//         const location = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         };

//         setLocationPermissionGranted(true);
//         localStorage.setItem("locationPermissionGranted", "true");
//         localStorage.setItem("lastKnownLocation", JSON.stringify(location));

//         if (scriptLoaded && geocoderRef.current) {
//           getAddressFromCoordinates(location.lat, location.lng);
//         } else {
//           setAddress("Location detected, loading address...");
//         }

//         setIsGettingLocation(false);
//         resolve(location);
//       };

//       const errorCallback = (error) => {
//         console.log("Location error:", error.code, error.message);

//         switch (error.code) {
//           case error.PERMISSION_DENIED:
//             console.log("Location permission denied by user");
//             setLocationPermissionGranted(false);
//             setAddress("Location access denied. Using default location.");
//             localStorage.setItem("locationPermissionGranted", "false");
//              // ADD THE SWEETALERT HERE
//     setTimeout(() => {
//   Swal2.fire({
//     title: '📍 Location Permission Denied',
//     html: `
//       <div style="text-align: center; padding: 12px">
//         <p style="color: #666; font-size: 15px; margin-bottom: 12px; line-height: 1.4;">
//           To use this feature, please enable location access from your browser and phone settings.
//         </p>
//         <div style="background: #f8f9fa; border-radius: 6px; padding: 10px; margin-bottom: 12px; text-align: left;">
//           <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.5;">
//             <strong>On Browser:</strong><br>
//             1. Click the lock icon in the address bar<br>
//             2. Select "Allow" for Location permissions<br>
//             3. Refresh the page
//           </p>
//         </div>
//         <div style="background: #f8f9fa; border-radius: 6px; padding: 10px; text-align: left;">
//           <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.5;">
//             <strong>On Phone:</strong><br>
//             • Go to <em>Settings</em> → <em>Apps</em> → Select your browser<br>
//             • Tap <em>Permissions</em> → Enable <em>Location</em><br>
//             • Reopen the browser and try again
//           </p>
//         </div>
//       </div>
//     `,
//     icon: 'warning',
//     iconColor: '#dc3545',
//     confirmButtonText: 'Got it',
//     confirmButtonColor: '#dc3545',
//     width: '400px',
//     padding: '0.75rem',
//     showCloseButton: true,
//     backdrop: true,
//   });
// }, 300);
//       break;
//           case error.POSITION_UNAVAILABLE:
//             console.log("Location information unavailable");
//             setLocationPermissionGranted(null);
//             setAddress("Unable to get location. Using default location.");
//             break;
//           case error.TIMEOUT:
//             console.log("Location request timed out");
//             setLocationPermissionGranted(null);
//             setAddress("Location request timed out. Using default location.");
//             break;
//           default:
//             console.log("Unknown error getting location");
//             setLocationPermissionGranted(null);
//             setAddress("Unable to get location. Using default location.");
//         }

//         setIsGettingLocation(false);
//         resolve(DEFAULT_LOCATION);
//       };

//       navigator.geolocation.getCurrentPosition(
//         successCallback,
//         errorCallback,
//         locationOptions,
//       );
//     });
//   }, [scriptLoaded, getAddressFromCoordinates]);

//   // Validate serviceability WITH HUB DATA
//   const validateServiceabilityWithHub = async (location) => {
//     if (!location) return false;

//     try {
//       setIsValidatingServiceability(true);

//       const response = await fetch(
//         "http://localhost:7013/api/Hub/validate-location",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             lat: location.lat.toString(),
//             lng: location.lng.toString(),
//           }),
//         },
//       );

//       const data = await response.json();

//       if (data.success) {
//         setIsServiceable(data.serviceable);

//         if (data.serviceable && data.hubs && data.hubs.length > 0) {
//           setHub(data.hubs);
//           console.log("Hub data received:", data.hubs);
//         } else {
//           setHub([]);
//         }

//         return data.serviceable;
//       } else {
//         console.error("Serviceability validation failed:", data.message);
//         setIsServiceable(null);
//         setHub([]);
//         return false;
//       }
//     } catch (error) {
//       console.error("Serviceability validation error:", error);
//       setIsServiceable(null);
//       setHub([]);
//       return false;
//     } finally {
//       setIsValidatingServiceability(false);
//     }
//   };

//   // Initialize services
//   const initializeServices = useCallback(() => {
//     if (window.google && window.google.maps && !geocoderRef.current) {
//       geocoderRef.current = new window.google.maps.Geocoder();
//       autocompleteServiceRef.current =
//         new window.google.maps.places.AutocompleteService();

//       if (mapInstanceRef.current && !placesServiceRef.current) {
//         placesServiceRef.current = new window.google.maps.places.PlacesService(
//           mapInstanceRef.current,
//         );
//       }

//       console.log("Google Maps services initialized");

//       if (selectedLocation && !hasGeocoded && !isGeocoding) {
//         console.log("Getting address for existing location:", selectedLocation);
//         getAddressFromCoordinates(selectedLocation.lat, selectedLocation.lng);
//       }
//     }
//   }, [selectedLocation, hasGeocoded, isGeocoding, getAddressFromCoordinates]);

//   // Smooth location initialization
//   const initializeLocation = useCallback(async () => {
//     if (hasAttemptedLocationRef.current) {
//       return;
//     }

//     hasAttemptedLocationRef.current = true;

//     console.log("Initializing location...");
//     setAddress("Initializing location...");

//     const storedPermission = localStorage.getItem("locationPermissionGranted");
//     const hasDeniedBefore = storedPermission === "false";

//     if (hasDeniedBefore) {
//       console.log("Previous location denial detected, using default location");
//       setLocationPermissionGranted(false);
//       setCurrentLocation(DEFAULT_LOCATION);
//       setSelectedLocation(DEFAULT_LOCATION);
//       setAddress("Using default location (Bengaluru)");

//       if (scriptLoaded && geocoderRef.current) {
//         setTimeout(() => {
//           getAddressFromCoordinates(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
//         }, 500);
//       }
//       return;
//     }

//     const permissionState = await checkLocationPermission();

//     if (permissionState === false) {
//       console.log("Location permission denied");
//       setLocationPermissionGranted(false);
//       setCurrentLocation(DEFAULT_LOCATION);
//       setSelectedLocation(DEFAULT_LOCATION);
//       setAddress("Location access denied. Using Bengaluru.");
//       localStorage.setItem("locationPermissionGranted", "false");

//       if (scriptLoaded && geocoderRef.current) {
//         setTimeout(() => {
//           getAddressFromCoordinates(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
//         }, 500);
//       }
//     } else if (permissionState === true) {
//       console.log("Location permission granted, getting location...");
//       setAddress("Getting your current location...");
//       const location = await getCurrentLocation();

//       if (location === DEFAULT_LOCATION) {
//         console.log("Failed to get location despite permission");
//         setCurrentLocation(DEFAULT_LOCATION);
//         setSelectedLocation(DEFAULT_LOCATION);
//         setAddress("Unable to get location. Using Bengaluru.");
//       } else {
//         console.log("Successfully obtained location:", location);
//         setCurrentLocation(location);
//         setSelectedLocation(location);

//         validateServiceabilityWithHub(location);
//       }
//     } else {
//       console.log(
//         "Attempting to get location (will trigger browser prompt if needed)",
//       );
//       setAddress("Requesting location access...");
//       const location = await getCurrentLocation();

//       if (location === DEFAULT_LOCATION) {
//         console.log("Location attempt failed or was denied");
//         setCurrentLocation(DEFAULT_LOCATION);
//         setSelectedLocation(DEFAULT_LOCATION);
//         setAddress("Using default location (Bengaluru)");
//       } else {
//         console.log("Successfully obtained location after prompt:", location);
//         setCurrentLocation(location);
//         setSelectedLocation(location);

//         validateServiceabilityWithHub(location);
//       }
//     }
//   }, [
//     checkLocationPermission,
//     getCurrentLocation,
//     scriptLoaded,
//     getAddressFromCoordinates,
//   ]);

//   // Load Google Maps script
//   useEffect(() => {
//     if (window.google && window.google.maps) {
//       setScriptLoaded(true);
//       initializeServices();
//       return;
//     }

//     if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
//       const checkGoogle = setInterval(() => {
//         if (window.google && window.google.maps) {
//           setScriptLoaded(true);
//           initializeServices();
//           clearInterval(checkGoogle);
//         }
//       }, 100);
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
//     script.async = true;
//     script.defer = true;

//     script.onload = () => {
//       setScriptLoaded(true);
//       initializeServices();
//       console.log("Google Maps script loaded successfully");
//     };

//     script.onerror = () => {
//       console.error("Google Maps script failed to load");
//       setError("Failed to load Google Maps. Please check your API key.");
//       setIsLoading(false);
//       setIsMapLoading(false);
//       setIsServiceable(null);
//       setIsConfirmed(true);
//     };

//     document.head.appendChild(script);
//   }, [initializeServices, API_KEY]);

//   // Handle back button
//   useEffect(() => {
//     const handleBackButton = (e) => {
//       e.preventDefault();
//       navigate("/home");
//     };

//     window.history.pushState(null, null, window.location.pathname);
//     window.addEventListener("popstate", handleBackButton);

//     return () => {
//       window.removeEventListener("popstate", handleBackButton);
//     };
//   }, [navigate]);

//   // Check if coming from modal with selected place OR editing existing address
//   useEffect(() => {
//     if (location.state?.selectedPlace) {
//       const { selectedPlace } = location.state;
//       handleSelectedPlaceFromModal(selectedPlace);
//     } else if (location.state?.editingAddress) {
//       const { editingAddress } = location.state;
//       handleEditingAddress(editingAddress);
//     }
//   }, [location.state]);

//   // Handle place selected from modal
//   const handleSelectedPlaceFromModal = (selectedPlace) => {
//     if (selectedPlace.location && selectedPlace.address) {
//       let locationObj = selectedPlace.location;
//       if (
//         selectedPlace.location.type === "Point" &&
//         selectedPlace.location.coordinates
//       ) {
//         locationObj = {
//           lat: selectedPlace.location.coordinates[1],
//           lng: selectedPlace.location.coordinates[0],
//         };
//       }

//       setSelectedLocation(locationObj);
//       setAddress(selectedPlace.address);
//       setHouseName(selectedPlace.name || selectedPlace.address.split(",")[0]);
//       setHasGeocoded(true);

//       if (mapInstanceRef.current && markerRef.current) {
//         mapInstanceRef.current.panTo(locationObj);
//         mapInstanceRef.current.setZoom(16);
//         markerRef.current.setPosition(locationObj);
//       }

//       setIsConfirmed(false);
//       validateServiceabilityWithHub(locationObj);
//     }
//   };

//   // Handle editing existing address
//   const handleEditingAddress = (editingAddress) => {
//     console.log("Editing address:", editingAddress);

//     let locationCoords = DEFAULT_LOCATION;

//     if (editingAddress.location) {
//       if (
//         editingAddress.location.coordinates &&
//         editingAddress.location.coordinates.length >= 2
//       ) {
//         locationCoords = {
//           lat: parseFloat(editingAddress.location.coordinates[1]),
//           lng: parseFloat(editingAddress.location.coordinates[0]),
//         };
//       } else if (editingAddress.location.lat && editingAddress.location.lng) {
//         locationCoords = {
//           lat: parseFloat(editingAddress.location.lat),
//           lng: parseFloat(editingAddress.location.lng),
//         };
//       }
//     }

//     setSelectedLocation(locationCoords);
//     setAddress(editingAddress.fullAddress || editingAddress.address || "");
//     setHouseName(editingAddress.houseName || "");
//     setAddressType(editingAddress.addressType || "Home");
//     setHasGeocoded(true);

//     if (editingAddress.addressType === "Home") {
//       setHomeName(editingAddress.homeName || "");
//       setLandmark(editingAddress.landmark || "");
//       setFloor(editingAddress.floor || "");
//     } else if (editingAddress.addressType === "PG") {
//       setApartmentName(editingAddress.apartmentName || "");
//       setTowerBlock(editingAddress.towerBlock || "");
//       setFlat(editingAddress.flat || "");
//       setFloor(editingAddress.floor || "");
//     } else if (editingAddress.addressType === "School") {
//       setSchoolName(editingAddress.schoolName || "");
//       setStudentName(editingAddress.studentInformation.studentName || "");
//       setStudentClass(editingAddress.studentInformation.studentClass || "");
//       setStudentSection(editingAddress.studentInformation.studentSection || "");
//     } else if (editingAddress.addressType === "Work") {
//       setCompanyName(editingAddress.companyName || "");
//       setFloorNo(editingAddress.floorNo || "");
//       setBuildingName(editingAddress.buildingName || "");
//     }

//     setIsConfirmed(false);
//     validateServiceabilityWithHub(locationCoords);
//   };

//   // Initialize location when component mounts
//   useEffect(() => {
//     initializeLocation();
//   }, [initializeLocation]);

//   // Initialize map when script is loaded and we have a location
//   useEffect(() => {
//     const initializeMapWithLocation = async () => {
//       if (!scriptLoaded || !selectedLocation) {
//         return;
//       }

//       console.log("Initializing map with location:", selectedLocation);

//       if (mapRef.current && !mapInstanceRef.current) {
//         try {
//           setIsMapLoading(true);

//           await new Promise((resolve) => setTimeout(resolve, 100));

//           initializeMap(selectedLocation);

//           if (
//             !hasGeocoded ||
//             address === "Getting address..." ||
//             address.includes("location")
//           ) {
//             console.log("Fetching address for map location...");
//             getAddressFromCoordinates(
//               selectedLocation.lat,
//               selectedLocation.lng,
//             );
//           }

//           validateServiceabilityWithHub(selectedLocation);

//           setIsMapLoading(false);
//           setIsLoading(false);
//         } catch (error) {
//           console.error("Error in map initialization:", error);
//           setIsMapLoading(false);
//           setIsLoading(false);
//         }
//       }
//     };

//     initializeMapWithLocation();
//   }, [
//     scriptLoaded,
//     selectedLocation,
//     hasGeocoded,
//     address,
//     getAddressFromCoordinates,
//   ]);

//   // Initialize map
//   const initializeMap = (location) => {
//     if (
//       !location ||
//       typeof location.lat !== "number" ||
//       typeof location.lng !== "number"
//     ) {
//       console.error("Invalid location provided to initializeMap:", location);
//       location = DEFAULT_LOCATION;
//     }

//     if (!mapRef.current || !window.google || !window.google.maps) {
//       console.error("Map container not found or Google Maps not loaded");
//       return;
//     }

//     try {
//       console.log("Creating new map instance at:", location);

//       const map = new window.google.maps.Map(mapRef.current, {
//         zoom: 16,
//         center: location,
//         mapTypeControl: false,
//         streetViewControl: false,
//         fullscreenControl: false,
//         zoomControl: false,
//         rotateControl: false,
//         scaleControl: false,
//         styles: [
//           {
//             featureType: "poi",
//             elementType: "labels",
//             stylers: [{ visibility: "on" }],
//           },
//         ],
//         backgroundColor: "#f5f5f5",
//         disableDefaultUI: true,
//         gestureHandling: "greedy",
//       });

//       mapInstanceRef.current = map;

//       if (!placesServiceRef.current) {
//         placesServiceRef.current = new window.google.maps.places.PlacesService(
//           map,
//         );
//       }

//       if (!geocoderRef.current) {
//         geocoderRef.current = new window.google.maps.Geocoder();
//       }

//       // Create custom location button
//       const locationButton = document.createElement("button");
//       locationButton.style.backgroundColor = "#fff";
//       locationButton.style.border = "2px solid #fff";
//       locationButton.style.borderRadius = "8px";
//       locationButton.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
//       locationButton.style.color = "#6b8e23";
//       locationButton.style.cursor = "pointer";
//       locationButton.style.padding = "10px";
//       locationButton.style.width = "40px";
//       locationButton.style.height = "40px";
//       locationButton.style.display = "flex";
//       locationButton.style.alignItems = "center";
//       locationButton.style.justifyContent = "center";
//       locationButton.style.margin = "10px";
//       locationButton.style.transition = "all 0.3s ease";
//       locationButton.style.fontSize = "24px";

//       locationButton.innerHTML = `
//         <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
//           <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
//         </svg>
//       `;

//       locationButton.addEventListener("mouseenter", () => {
//         locationButton.style.backgroundColor = "#f8f8f8";
//         locationButton.style.transform = "scale(1.05)";
//       });

//       locationButton.addEventListener("mouseleave", () => {
//         locationButton.style.backgroundColor = "#fff";
//         locationButton.style.transform = "scale(1)";
//       });

//       locationButton.addEventListener("click", () => {
//         locationButton.innerHTML = `
//           <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
//             <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
//             <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
//               <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
//             </path>
//           </svg>
//         `;

//         getCurrentLocation().then((location) => {
//           if (location !== DEFAULT_LOCATION) {
//             map.setCenter(location);
//             map.setZoom(16);

//             if (markerRef.current) {
//               markerRef.current.setPosition(location);
//             }

//             setSelectedLocation(location);
//             setIsConfirmed(false);

//             getAddressFromCoordinates(location.lat, location.lng);
//             validateServiceabilityWithHub(location);
//           }  else {
//       // If we got DEFAULT_LOCATION, it means permission was denied
//       // The SweetAlert will already be shown in the errorCallback
//     }

//           locationButton.innerHTML = `
//             <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
//               <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
//             </svg>
//           `;
//         });
//       });

//       map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(
//         locationButton,
//       );

//        // Create fixed pin element
//       const fixedPinElement = document.createElement("div");
//       fixedPinElement.style.position = "absolute";
//       fixedPinElement.style.top = "50%";
//       fixedPinElement.style.left = "50%";
//       fixedPinElement.style.transform = "translate(-50%, -100%)";
//       fixedPinElement.style.width = "40px";
//       fixedPinElement.style.height = "50px";
//       fixedPinElement.style.pointerEvents = "none";
//       fixedPinElement.style.zIndex = "1000";

//       fixedPinElement.innerHTML = `
//         <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
//           <style>
//             @keyframes pulse {
//               0%, 100% { opacity: 1; }
//               50% { opacity: 0.7; }
//             }
//             @media (max-width: 480px) {
//               .pin-line {
//                 animation: pulse 1.5s ease-in-out infinite !important;
//               }
//             }
//           </style>
//           <circle cx="20" cy="10" r="8" fill="#6B8E23" stroke="#fff" stroke-width="2"/>
//           <line
//             x1="20" y1="18"
//             x2="20" y2="45"
//             stroke="#6B8E23"
//             stroke-width="3"
//             stroke-linecap="round"
//             class="pin-line"
//             style="animation: pulse 2s ease-in-out infinite;"
//           />
//           <ellipse cx="20" cy="48" rx="4" ry="2" fill="#000" opacity="0.2"/>
//         </svg>
//       `;

//       const fixedMessageElement = document.createElement("div");
//       fixedMessageElement.style.position = "absolute";
//       fixedMessageElement.style.top = "calc(50% - 70px)";
//       fixedMessageElement.style.left = "50%";
//       fixedMessageElement.style.transform = "translateX(-50%)";
//       fixedMessageElement.style.background = "#6b8e23";
//       fixedMessageElement.style.color = "white";
//       fixedMessageElement.style.padding = "8px 12px";
//       fixedMessageElement.style.borderRadius = "6px";
//       fixedMessageElement.style.fontFamily = "Arial, sans-serif";
//       fixedMessageElement.style.fontSize = "12px";
//       fixedMessageElement.style.fontWeight = "700";
//       fixedMessageElement.style.lineHeight = "1.2";
//       fixedMessageElement.style.maxWidth = "200px";
//       fixedMessageElement.style.textAlign = "center";
//       fixedMessageElement.style.pointerEvents = "none";
//       fixedMessageElement.style.zIndex = "1000";
//       fixedMessageElement.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

//       const mobileStyles = `
//         @media (max-width: 480px) {
//           .fixed-pin-message {
//             top: calc(50% - 60px) !important;
//             padding: 6px 10px !important;
//             font-size: 11px !important;
//             max-width: 160px !important;
//             border-radius: 4px !important;
//           }
//           .fixed-pin-message div:first-child {
//             font-size: 10px !important;
//           }
//           .fixed-pin-message div:last-child {
//             font-size: 9px !important;
//             margin-top: 1px !important;
//           }
//         }

//         @media (max-width: 360px) {
//           .fixed-pin-message {
//             top: calc(50% - 55px) !important;
//             padding: 5px 8px !important;
//             font-size: 10px !important;
//             max-width: 140px !important;
//           }
//           .fixed-pin-message div:first-child {
//             font-size: 9px !important;
//           }
//           .fixed-pin-message div:last-child {
//             font-size: 8px !important;
//           }
//         }

//         @media (min-width: 481px) and (max-width: 768px) {
//           .fixed-pin-message {
//             top: calc(50% - 65px) !important;
//             padding: 7px 10px !important;
//             font-size: 11px !important;
//             max-width: 180px !important;
//           }
//         }
//       `;

//       fixedMessageElement.className = "fixed-pin-message";

//       const styleElement = document.createElement("style");
//       styleElement.textContent = mobileStyles;
//       document.head.appendChild(styleElement);

//       fixedMessageElement.innerHTML = `
//         <div>Order will be delivered here</div>
//         <div style="font-size: 10px; opacity: 0.9; margin-top: 2px; font-weight: normal;">
//           Move the map to set delivery location
//         </div>
//       `;

//       const pinStyles = `
//         @media (max-width: 480px) {
//           .fixed-pin {
//             width: 32px !important;
//             height: 40px !important;
//           }
//           .fixed-pin svg {
//             width: 32px !important;
//             height: 40px !important;
//           }
//         }

//         @media (max-width: 360px) {
//           .fixed-pin {
//             width: 28px !important;
//             height: 35px !important;
//           }
//           .fixed-pin svg {
//             width: 28px !important;
//             height: 35px !important;
//           }
//         }

//         @media (min-width: 481px) and (max-width: 768px) {
//           .fixed-pin {
//             width: 36px !important;
//             height: 45px !important;
//           }
//           .fixed-pin svg {
//             width: 36px !important;
//             height: 45px !important;
//           }
//         }
//       `;

//       fixedPinElement.className = "fixed-pin";
//       const pinStyleElement = document.createElement("style");
//       pinStyleElement.textContent = pinStyles;
//       document.head.appendChild(pinStyleElement);

//       mapRef.current.appendChild(fixedPinElement);
//       mapRef.current.appendChild(fixedMessageElement);

//       fixedPinRef.current = fixedPinElement;
//       fixedMessageRef.current = fixedMessageElement;

//       infoWindowRef.current = null;

//       markerRef.current = new window.google.maps.Marker({
//         position: location,
//         map: map,
//         visible: false,
//         title: "Delivery location",
//       });

//       console.log("Fixed pin and message created at center");

//       let mapMoveTimeout;

//       const updateLocationFromCenter = () => {
//         const newCenter = map.getCenter();
//         const newLocation = {
//           lat: newCenter.lat(),
//           lng: newCenter.lng(),
//         };

//         console.log("Map moved to:", newLocation);
//         markerRef.current.setPosition(newLocation);
//         setSelectedLocation(newLocation);
//         setIsConfirmed(false);
//         getAddressFromCoordinates(newLocation.lat, newLocation.lng);
//         validateServiceabilityWithHub(newLocation);
//       };

//       map.addListener("center_changed", () => {
//         if (mapMoveTimeout) clearTimeout(mapMoveTimeout);
//         mapMoveTimeout = setTimeout(() => {
//           updateLocationFromCenter();
//         }, 300);
//       });

//       console.log("Map initialized successfully with fixed pin and message");

//       setTimeout(() => {
//         if (!hasGeocoded || address === "Getting address...") {
//           console.log("Triggering initial address fetch after map load");
//           getAddressFromCoordinates(location.lat, location.lng);
//         }
//       }, 500);
//     } catch (error) {
//       console.error("Error initializing map:", error);
//       setError("Failed to initialize map. Please try again.");
//     }
//   };

//   const handleSearchChange = (e) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     if (query.length > 2 && autocompleteServiceRef.current) {
//       autocompleteServiceRef.current.getPlacePredictions(
//         {
//           input: query,
//           types: ["geocode", "establishment"],
//           componentRestrictions: { country: "in" },
//         },
//         (predictions, status) => {
//           if (
//             status === window.google.maps.places.PlacesServiceStatus.OK &&
//             predictions
//           ) {
//             setSearchSuggestions(predictions);
//           } else {
//             setSearchSuggestions([]);
//           }
//         },
//       );
//     } else {
//       setSearchSuggestions([]);
//     }
//   };

//   const handleLocationSelect = (place) => {
//     if (placesServiceRef.current) {
//       placesServiceRef.current.getDetails(
//         {
//           placeId: place.place_id,
//           fields: ["geometry", "name", "formatted_address"],
//         },
//         (placeResult, status) => {
//           if (status === window.google.maps.places.PlacesServiceStatus.OK) {
//             const location = {
//               lat: placeResult.geometry.location.lat(),
//               lng: placeResult.geometry.location.lng(),
//             };

//             setSelectedLocation(location);
//             setAddress(placeResult.formatted_address);
//             setHouseName(
//               placeResult.name || placeResult.formatted_address.split(",")[0],
//             );
//             setHasGeocoded(true);

//             if (mapInstanceRef.current && markerRef.current) {
//               mapInstanceRef.current.panTo(location);
//               mapInstanceRef.current.setZoom(16);
//               markerRef.current.setPosition(location);
//             }

//             setSearchQuery("");
//             setSearchSuggestions([]);
//             setIsConfirmed(false);
//             validateServiceabilityWithHub(location);
//           }
//         },
//       );
//     }
//   };

//   const handleServiceRequest = async () => {
//     const name = String(serviceRequestName || "");
//     const phone = String(serviceRequestPhone || "");

//     if (!name.trim()) {
//       setError("Please enter your name");
//       return;
//     }

//     if (!phone.trim()) {
//       setError("Please enter your phone number");
//       return;
//     }

//     const phoneRegex = /^[0-9]{10}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       setError("Please enter a valid 10-digit phone number");
//       return;
//     }

//     try {
//       setIsSubmittingRequest(true);
//       setError("");

//       const user = JSON.parse(localStorage.getItem("user"));

//       if (!user || !user._id) {
//         setError("User not found. Please login again.");
//         return;
//       }

//       const customerId = user._id;

//       const requestData = {
//         customerId,
//         name: name.trim(),
//         phone: phone.trim(),
//         location: selectedLocation,
//         address: address,
//       };

//       console.log("Submitting service request:", requestData);

//       const response = await axios.post(
//         "http://localhost:7013/api/service-requests",
//         requestData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           timeout: 10000,
//         },
//       );

//       if (response.data.success) {
//         const successData = {
//           name: name.trim(),
//           phone: phone.trim(),
//           address: address || "Address not available",
//         };

//         setShowServiceablePopup(false);
//         setServiceRequestName("");
//         setServiceRequestPhone("");

//         setTimeout(() => {
//           Swal2.fire({
//             html: `
//           <div style="text-align: center; padding: ${isSmall ? "8px" : "12px"}">
//             <div style="font-size: ${
//               isSmall ? "16px" : "18px"
//             }; color: #6B8E23; margin-bottom: ${
//               isSmall ? "12px" : "15px"
//             }; font-weight: 600;">
//               ✅ Your service request has been successfully submitted!
//             </div>
//             <div style="font-size: ${
//               isSmall ? "13px" : "14px"
//             }; color: #666; line-height: 1.5; margin-bottom: ${
//               isSmall ? "12px" : "15px"
//             }">
//               <div style="text-align: left; margin: 0 auto; max-width: ${
//                 isSmall ? "280px" : "320px"
//               }; background: #f9f9f9; padding: 12px; border-radius: 8px; margin-bottom: 12px">
//                 <p style="margin: 6px 0"><strong>Name:</strong> ${
//                   successData.name
//                 }</p>
//                 <p style="margin: 6px 0"><strong>Phone:</strong> ${
//                   successData.phone
//                 }</p>
//                 <p style="margin: 6px 0"><strong>Address:</strong> ${
//                   successData.address
//                 }</p>
//               </div>
//               <p style="font-weight: 600; color: #333; margin-bottom: 8px">What happens next?</p>
//               <div style="text-align: left; margin: 0 auto; max-width: ${
//                 isSmall ? "280px" : "320px"
//               }">
//                 <p style="margin: 4px 0">• Our team will review your location</p>
//                 <p style="margin: 4px 0">• You'll be notified when service starts in your area</p>
//               </div>
//             </div>
//           </div>
//         `,
//             icon: "success",
//             confirmButtonText: "Got it!",
//             confirmButtonColor: "#6B8E23",
//             width: isSmall ? "90%" : "500px",
//             padding: isSmall ? "1rem" : "1.5rem",
//             backdrop: true,
//             allowOutsideClick: true,
//             allowEscapeKey: true,
//             focusConfirm: true,
//             showConfirmButton: true,
//             zIndex: 9999999,
//           });
//         }, 500);

//         navigate("/location");
//       } else {
//         throw new Error(response.data.message || "Failed to submit request");
//       }
//     } catch (error) {
//       console.error("Error submitting service request:", error);

//       if (error.code === "ECONNABORTED") {
//         setError("Request timeout. Please try again.");
//       } else if (error.response) {
//         const status = error.response.status;
//         const message =
//           error.response.data?.message || "Failed to submit request";
//         if (status === 409) {
//           // Show the specific popup for duplicate request
//           setTimeout(() => {
//             Swal2.fire({
//               html: `
//     <div style="text-align: center; padding: ${isSmall ? "9px 0px" : "12px 16px"}">
//       <h4 style="color: #dc3545; margin: 0 0 ${isSmall ? "6px" : "10px"} 0; font-size: ${
//         isSmall ? "16px" : "18px"
//       }; font-weight: 600; line-height: 1.3;">
//         ⏳ Request Already Exists
//       </h4>
//       <p style="color: #666; font-size: ${isSmall ? "13px" : "14px"}; margin: 0 0 6px 0; line-height: 1.4;">
//         You've already submitted a service request for this location.
//       </p>
//       <p style="color: #888; font-size: ${isSmall ? "12px" : "13px"}; margin: 0; line-height: 1.4;">
//         Our team will contact you once service is available in your area.
//       </p>
//     </div>
//   `,
//               icon: "info",
//               iconColor: "#dc3545",
//               confirmButtonText: "OK",
//               confirmButtonColor: "#dc3545",
//               width: isSmall ? "340px" : "360px",
//               padding: isSmall ? "0.5rem" : "1rem", // Reduced modal padding
//               showCloseButton: true,
//               backdrop: true,
//               allowOutsideClick: true,
//               allowEscapeKey: true,
//               focusConfirm: true,
//               showConfirmButton: true,
//               zIndex: 9999999,
//             });
//           }, 300);

//           // Close the service request popup
//           setShowServiceablePopup(false);
//           setServiceRequestName("");
//           setServiceRequestPhone("");
//         } else if (status === 400) {
//           setError("Invalid request. Please check your information.");
//         } else if (status === 404) {
//           setError("User not found. Please login again.");
//         } else if (status >= 500) {
//           setError("Server error. Please try again later.");
//         } else {
//           setError(message);
//         }
//       } else if (error.request) {
//         setError("Network error. Please check your connection and try again.");
//       } else {
//         setError(
//           error.message || "Failed to submit request. Please try again.",
//         );
//       }
//     } finally {
//       setIsSubmittingRequest(false);
//     }
//   };

//   const handleCancelServiceRequest = () => {
//     setShowServiceablePopup(false);
//     setServiceRequestName("");
//     setServiceRequestPhone("");
//   };

//   useEffect(() => {
//     if (!location.state?.editingAddress) {
//       setLandmark("");
//       setFloor("");
//       setTowerBlock("");
//       setFlat("");
//       setStudentName("");
//       setStudentClass("");
//       setStudentSection("");
//       setFloorNo("");
//       setHomeName("");
//       setApartmentName("");
//       setSchoolName("");
//       setCompanyName("");
//       setBuildingName("");
//     }
//   }, [addressType, location.state?.editingAddress]);

//   const isFormValid = () => {
//     if (!houseName.trim()) return false;

//     switch (addressType) {
//       case "Home":
//         return homeName.trim();
//       case "PG":
//         return apartmentName.trim() && towerBlock.trim() && flat.trim();
//       case "School":
//         return (
//           schoolName.trim() &&
//           studentName.trim() &&
//           studentClass.trim() &&
//           studentSection.trim()
//         );
//       case "Work":
//         return companyName.trim() && floorNo.trim() && buildingName.trim();
//       default:
//         return false;
//     }
//   };

//   const handleSaveAddress = async (e) => {
//     e.preventDefault();
//     if (!isFormValid()) {
//       setError("Please fill all required fields");
//       return;
//     }

//     let locationObj = selectedLocation;
//     console.log("🔍 handleSaveAddress - selectedLocation:", selectedLocation);

//     if (!locationObj || !locationObj.lat || !locationObj.lng) {
//       setError(
//         "Location coordinates are missing. Please try moving the pin on the map.",
//       );
//       setIsLoading(false);
//       return;
//     }

//     const hubData = hub.length > 0 ? hub[0] : null;
//     console.log("Hub data for saving:", hubData);

//     const addressData = {
//       location: locationObj,
//       address: address,
//       houseName: houseName,
//       addressType: addressType,
//       homeName: homeName,
//       apartmentName: apartmentName,
//       schoolName: schoolName,
//       companyName: companyName,
//       hubName: hubData?.hubName || "",
//       hubId: hubData?.hub || "",
//       ...(addressType === "Home" && { landmark, floor }),
//       ...(addressType === "PG" && { towerBlock, flat, floor }),
//       ...(addressType === "School" && {
//         studentName,
//         studentClass,
//         studentSection,
//       }),
//       ...(addressType === "Work" && { floorNo, buildingName }),
//       fullAddress: generateFullAddress(),
//       isDefault: true,
//     };

//     console.log("Saving address as primary:", addressData);

//     try {
//       setIsLoading(true);

//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user._id;

//       if (!customerId) {
//         setError("Customer ID not found. Please login again.");
//         return;
//       }

//       const requestPayload = {
//         customerId: customerId,
//         addressType: addressData.addressType,
//         houseName: addressData.houseName,
//         fullAddress: addressData.fullAddress,
//         location: {
//           lat: addressData.location.lat,
//           lng: addressData.location.lng,
//         },
//         landmark: addressData.landmark || "",
//         floor: addressData.floor || "",
//         towerBlock: addressData.towerBlock || "",
//         flat: addressData.flat || "",
//         floorNo: addressData.floorNo || "",
//         buildingName: addressData.buildingName || "",
//         homeName: addressData.homeName || "",
//         apartmentName: addressData.apartmentName || "",
//         schoolName: addressData.schoolName || "",
//         companyName: addressData.companyName || "",
//         isDefault: true,
//         hubName: addressData.hubName || "",
//         hubId: addressData.hubId || "",
//       };

//       if (addressData.addressType === "School") {
//         requestPayload.studentInformation = {
//           studentName: addressData.studentName || "",
//           studentClass: addressData.studentClass || "",
//           studentSection: addressData.studentSection || "",
//         };
//       }

//       requestPayload.studentName = addressData.studentName || "";
//       requestPayload.studentClass = addressData.studentClass || "";
//       requestPayload.studentSection = addressData.studentSection || "";

//       console.log("req payload", requestPayload);

//       if (location.state?.editingAddress?._id) {
//         requestPayload.addressId = location.state.editingAddress._id;
//         if (!location.state.editingAddress.isDefault) {
//           requestPayload.isDefault = false;
//         }
//       }

//       const endpoint = location.state?.editingAddress?._id
//         ? `http://localhost:7013/api/User/customers/${user._id}/addresses/${location.state.editingAddress._id}`
//         : "http://localhost:7013/api/User/addresses";
//       const method = location.state?.editingAddress?._id ? "PUT" : "POST";

//       const response = await fetch(endpoint, {
//         method: method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestPayload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to save address");
//       }

//       const result = await response.json();

//       if (result.success) {
//         if (!location.state?.editingAddress?._id) {
//           const savedAddressId = result.address?._id || result.addressId;

//           if (savedAddressId) {
//             await setAddressAsPrimary(customerId, savedAddressId);
//           }
//         }

//         resetForm();

//         window.dispatchEvent(new Event("addressAdded"));

//         localStorage.setItem("primaryAddress", JSON.stringify(addressData));
//         localStorage.setItem("locationManuallySelected", "true");
//         localStorage.removeItem("postLoginDestination");

//         navigate("/home", {
//           state: {
//             userLocation: selectedLocation,
//             userAddress: address,
//             addressData: addressData,
//             isPrimary: true,
//           },
//         });
//       } else {
//         throw new Error(result.message || "Failed to save address");
//       }
//     } catch (error) {
//       console.error("Error saving address:", error);
//       setError(error.message || "Failed to save address. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const setAddressAsPrimary = async (customerId, addressId) => {
//     try {
//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/addresses/${addressId}/primary`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//         },
//       );

//       if (response.ok) {
//         console.log(`Address ${addressId} set as primary successfully`);

//         const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
//         if (cachedAddresses) {
//           const cached = JSON.parse(cachedAddresses);
//           cached.primaryAddress = addressId;
//           localStorage.setItem(
//             `addresses_${customerId}`,
//             JSON.stringify(cached),
//           );
//         }

//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error("Error setting address as primary:", error);
//       return false;
//     }
//   };

//   const generateFullAddress = () => {
//     let fullAddress = address;
//     let parts = [];

//     switch (addressType) {
//       case "Home":
//         if (homeName) parts.push(homeName);
//         if (landmark) parts.push(`near ${landmark}`);
//         if (floor) parts.push(floor);
//         break;
//       case "PG":
//         if (apartmentName) parts.push(apartmentName);
//         if (towerBlock) parts.push(towerBlock);
//         if (flat) parts.push(flat);
//         if (floor) parts.push(floor);
//         break;
//       case "School":
//         if (schoolName) parts.push(schoolName);
//         if (studentName) parts.push(studentName);
//         if (studentClass) parts.push(`Class ${studentClass}`);
//         if (studentSection) parts.push(`Section ${studentSection}`);
//         break;
//       case "Work":
//         if (companyName) parts.push(companyName);
//         if (floorNo) parts.push(floorNo);
//         if (buildingName) parts.push(buildingName);
//         break;
//     }

//     parts.push(fullAddress);

//     return parts.join(", ");
//   };

//   const resetForm = () => {
//     setHouseName("");
//     setLandmark("");
//     setFloor("");
//     setTowerBlock("");
//     setFlat("");
//     setStudentName("");
//     setStudentClass("");
//     setStudentSection("");
//     setFloorNo("");
//     setHomeName("");
//     setApartmentName("");
//     setSchoolName("");
//     setCompanyName("");
//     setBuildingName("");
//   };

//   const addressTypes = [
//     { key: "Home", label: "Home", icon: homeimg, icon2: homeimg2 },
//     {
//       key: "PG",
//       label: "PG/ Apartment",
//       icon: apartmentimg,
//       icon2: apartmentimg2,
//     },
//     { key: "School", label: "School", icon: schoolimg, icon2: schoolimg2 },
//     { key: "Work", label: "Work", icon: workimg, icon2: workimg2 },
//   ];

//   const renderTypeSpecificFields = () => {
//     const commonInputStyle = {
//       width: "100%",
//       height: "44px",
//       borderRadius: "12px",
//       padding: "8px 16px",
//       border: "0.4px solid #6B8E23",
//       background: "#FAFAFA",
//       fontSize: "14px",
//       marginBottom: "10px",
//     };

//     switch (addressType) {
//       case "Home":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={homeName}
//               onChange={(e) => setHomeName(e.target.value)}
//               placeholder="Home Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={landmark}
//               onChange={(e) => setLandmark(e.target.value)}
//               placeholder="Landmark, building, floor"
//               style={{ ...commonInputStyle, marginBottom: "0" }}
//             />
//           </div>
//         );

//       case "PG":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={apartmentName}
//               onChange={(e) => setApartmentName(e.target.value)}
//               placeholder="Apartment Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={towerBlock}
//               onChange={(e) => setTowerBlock(e.target.value)}
//               placeholder="Tower/Block name *"
//               style={commonInputStyle}
//             />
//             <div
//               className="d-flex"
//               style={{
//                 width: "100%",
//                 gap: "12px",
//               }}
//             >
//               <input
//                 type="text"
//                 value={flat}
//                 onChange={(e) => setFlat(e.target.value)}
//                 placeholder="Flat *"
//                 style={commonInputStyle}
//               />
//               <input
//                 type="text"
//                 value={floor}
//                 onChange={(e) => setFloor(e.target.value)}
//                 placeholder="Floor"
//                 style={commonInputStyle}
//               />
//             </div>
//           </div>
//         );

//       case "School":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <div
//               className=" gap-2 align-items-start"
//               style={{ display: "flex", gap: 2 }}
//             >
//               <img
//                 src={spilt}
//                 alt=""
//                 style={{ width: "20px", height: "20px", marginTop: "2px" }}
//               />
//               <p
//                 className="mb-0"
//                 style={{
//                   color: "#2c2c2c",
//                   fontSize: "14px",
//                   fontFamily: "Inter",
//                   fontWeight: "500",
//                 }}
//               >
//                 Later you can split the order
//               </p>
//               <img
//                 src={warning}
//                 alt=""
//                 style={{ width: "10px", height: "10px", marginTop: "6px" }}
//               />
//             </div>

//             <div
//               className=" gap-2 align-items-start"
//               style={{ display: "flex", gap: 2 }}
//             >
//               <img
//                 src={secure}
//                 alt=""
//                 style={{ width: "12px", height: "12px", marginTop: "2px" }}
//               />
//               <p
//                 className="mb-0"
//                 style={{
//                   color: "#2c2c2c",
//                   fontSize: "10px",
//                   fontFamily: "Inter",
//                   fontWeight: "500",
//                 }}
//               >
//                 Safe & Private: details are only used to deliver correctly.
//               </p>
//             </div>

//             <input
//               type="text"
//               value={schoolName}
//               onChange={(e) => setSchoolName(e.target.value)}
//               placeholder="School Name *"
//               style={commonInputStyle}
//             />

//             <input
//               type="text"
//               placeholder="Student's full name *"
//               value={studentName}
//               onChange={(e) => setStudentName(e.target.value)}
//               style={commonInputStyle}
//             />

//             <div
//               className="d-flex "
//               style={{
//                 width: "100%",
//                 gap: "12px",
//               }}
//             >
//               <input
//                 type="text"
//                 placeholder="Class *"
//                 value={studentClass}
//                 onChange={(e) => setStudentClass(e.target.value)}
//                 style={commonInputStyle}
//               />
//               <input
//                 type="text"
//                 placeholder="Section *"
//                 value={studentSection}
//                 onChange={(e) => setStudentSection(e.target.value)}
//                 style={commonInputStyle}
//               />
//             </div>
//           </div>
//         );

//       case "Work":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={companyName}
//               onChange={(e) => setCompanyName(e.target.value)}
//               placeholder="Company Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={buildingName}
//               onChange={(e) => setBuildingName(e.target.value)}
//               placeholder="Building Name *"
//               style={{ ...commonInputStyle, marginBottom: "0" }}
//             />
//             <input
//               type="text"
//               value={floorNo}
//               onChange={(e) => setFloorNo(e.target.value)}
//               placeholder="Gate no / Floor no *"
//               style={{ ...commonInputStyle, marginBottom: "0" }}
//             />
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   useEffect(() => {
//     return () => {
//       if (fixedPinRef.current && fixedPinRef.current.parentNode) {
//         fixedPinRef.current.parentNode.removeChild(fixedPinRef.current);
//       }
//       if (fixedMessageRef.current && fixedMessageRef.current.parentNode) {
//         fixedMessageRef.current.parentNode.removeChild(fixedMessageRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const renderLocationStatus = () => {
//     if (isGettingLocation) {
//       return (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             backgroundColor: "#e8f4fd",
//             padding: "8px 12px",
//             borderRadius: "8px",
//             marginBottom: "12px",
//             border: "1px solid #b3d9ff",
//           }}
//         >
//           <div
//             style={{
//               width: "16px",
//               height: "16px",
//               border: "2px solid #0066cc",
//               borderTopColor: "transparent",
//               borderRadius: "50%",
//               animation: "spin 1s linear infinite",
//             }}
//           ></div>
//           <span style={{ fontSize: "14px", color: "#0066cc" }}>
//             Detecting your location...
//           </span>
//         </div>
//       );
//     }

//     if (locationPermissionGranted === false) {
//       return (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             backgroundColor: "#fff3e0",
//             padding: "8px 12px",
//             borderRadius: "8px",
//             marginBottom: "12px",
//             border: "1px solid #ffcc80",
//           }}
//         >
//           <span style={{ fontSize: "14px", color: "#b22222" }}>
//             ⚠️ Using default location (Location access denied)
//           </span>
//         </div>
//       );
//     }

//     if (
//       locationPermissionGranted === true &&
//       selectedLocation &&
//       selectedLocation !== DEFAULT_LOCATION
//     ) {
//       return (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             backgroundColor: "#f0f9f0",
//             padding: "8px 12px",
//             borderRadius: "8px",
//             marginBottom: "12px",
//             border: "1px solid #90ee90",
//           }}
//         >
//           <Navigation size={16} color="#228B22" />
//           <span style={{ fontSize: "14px", color: "#228B22" }}>
//             Using your current location
//           </span>
//         </div>
//       );
//     }

//     return null;
//   };

//   return (
//     <div
//       style={{
//         height: "100dvh",
//         backgroundColor: "#f5f5f5",
//         fontFamily: "Arial, sans-serif",
//         position: "relative",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       {/* Serviceability Popup */}
//       {showServiceablePopup && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0,0,0,0.7)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 3000,
//             padding: "20px",
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "#F8F6F0",
//               borderRadius: "16px",
//               padding: "24px",
//               maxWidth: "400px",
//               width: "100%",
//               textAlign: "center",
//               boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
//             }}
//           >
//             <div
//               style={{
//                 fontSize: "48px",
//                 marginBottom: "16px",
//                 color: "#ffa500",
//               }}
//             ></div>
//             <img
//               src={locationIcon}
//               alt="Location"
//               style={{
//                 width: isSmall ? "52px" : "60px",
//                 height: isSmall ? "52px" : "60px",
//                 objectFit: "contain",
//               }}
//             />
//             <h3
//               style={{
//                 marginBottom: "12px",
//                 color: "#333",
//                 fontSize: "20px",
//                 fontWeight: "600",
//               }}
//             >
//               Coming Soon to Your Area!
//             </h3>
//             <p
//               style={{
//                 marginBottom: "16px",
//                 color: "#666",
//                 fontSize: "14px",
//                 lineHeight: "1.5",
//               }}
//             >
//               We're not currently operating in this location, but we're
//               expanding rapidly! Let us know you're interested, and we'll notify
//               you as soon as we launch in your area.
//             </p>

//             <div style={{ marginBottom: "20px", textAlign: "left" }}>
//               <div style={{ marginBottom: "12px" }}>
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: "4px",
//                     fontSize: "14px",
//                     fontWeight: "500",
//                   }}
//                 >
//                   Your Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={serviceRequestName}
//                   onChange={(e) => setServiceRequestName(e.target.value)}
//                   placeholder="Enter your name"
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     border: "1px solid #ddd",
//                     borderRadius: "8px",
//                     fontSize: "14px",
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: "16px" }}>
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: "4px",
//                     fontSize: "14px",
//                     fontWeight: "500",
//                   }}
//                 >
//                   Phone Number *
//                 </label>
//                 <input
//                   type="tel"
//                   value={serviceRequestPhone}
//                   onChange={(e) => setServiceRequestPhone(e.target.value)}
//                   placeholder="Enter your phone number"
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     border: "1px solid #ddd",
//                     borderRadius: "8px",
//                     fontSize: "14px",
//                   }}
//                 />
//               </div>

//               <div
//                 style={{
//                   fontSize: "12px",
//                   color: "#666",
//                   marginBottom: "16px",
//                 }}
//               >
//                 <strong>Selected Location:</strong> {address}
//               </div>
//             </div>

//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: "12px",
//               }}
//             >
//               <button
//                 onClick={handleServiceRequest}
//                 disabled={
//                   isSubmittingRequest ||
//                   !serviceRequestName ||
//                   !serviceRequestPhone
//                 }
//                 style={{
//                   backgroundColor:
//                     isSubmittingRequest ||
//                     !serviceRequestName ||
//                     !serviceRequestPhone
//                       ? "#ccc"
//                       : "#6B8E23",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "12px",
//                   padding: "14px",
//                   fontSize: "16px",
//                   fontWeight: "600",
//                   cursor:
//                     isSubmittingRequest ||
//                     !serviceRequestName ||
//                     !serviceRequestPhone
//                       ? "not-allowed"
//                       : "pointer",
//                   transition: "background-color 0.2s",
//                 }}
//               >
//                 {isSubmittingRequest ? "Submitting..." : "Request Location"}
//               </button>
//               <button
//                 onClick={handleCancelServiceRequest}
//                 style={{
//                   backgroundColor: "transparent",
//                   color: "#666",
//                   border: "1px solid #ddd",
//                   borderRadius: "12px",
//                   padding: "14px",
//                   fontSize: "16px",
//                   fontWeight: "500",
//                   cursor: "pointer",
//                   transition: "background-color 0.2s",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.target.style.backgroundColor = "#f5f5f5";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.backgroundColor = "transparent";
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Top Half - Map */}
//       <div
//         style={{
//           flex: "1",
//           position: "relative",
//           backgroundColor: "#e9ecef",
//           overflow: "hidden",
//           borderBottom: "1px solid #e0e0e0",
//         }}
//       >
//         <div
//           ref={mapRef}
//           style={{
//             width: "100%",
//             height: "100%",
//             backgroundColor: "#e9ecef",
//           }}
//         />

//         {/* Search Bar */}
//         <div
//           style={{
//             position: "absolute",
//             top: "16px",
//             left: "16px",
//             right: "16px",
//             backgroundColor: "white",
//             borderRadius: "12px",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//             border: "1px solid #e0e0e0",
//             zIndex: 1000,
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               padding: "8px 12px",
//               gap: "8px",
//             }}
//           >
//             <Search size={18} color="#666" style={{ flexShrink: 0 }} />
//             <input
//               ref={searchInputRef}
//               type="text"
//               value={searchQuery}
//               onChange={handleSearchChange}
//               placeholder="Search for area, street, landmark..."
//               style={{
//                 flex: 1,
//                 border: "none",
//                 outline: "none",
//                 fontSize: "14px",
//                 padding: "8px 0",
//                 backgroundColor: "transparent",
//               }}
//             />
//             {searchQuery && (
//               <button
//                 onClick={() => {
//                   setSearchQuery("");
//                   setSearchSuggestions([]);
//                 }}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   fontSize: "18px",
//                   color: "#666",
//                   cursor: "pointer",
//                   padding: "4px",
//                 }}
//               >
//                 ×
//               </button>
//             )}
//           </div>

//           {/* Search Suggestions */}
//           {searchSuggestions.length > 0 && (
//             <div
//               style={{
//                 borderTop: "1px solid #e0e0e0",
//                 maxHeight: "200px",
//                 overflowY: "auto",
//               }}
//             >
//               {searchSuggestions.map((place, index) => (
//                 <div
//                   key={place.place_id}
//                   onClick={() => handleLocationSelect(place)}
//                   style={{
//                     padding: "12px 16px",
//                     borderBottom:
//                       index < searchSuggestions.length - 1
//                         ? "1px solid #f0f0f0"
//                         : "none",
//                     cursor: "pointer",
//                     transition: "background-color 0.2s",
//                     fontSize: "14px",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.backgroundColor = "#f8f9fa";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.backgroundColor = "white";
//                   }}
//                 >
//                   <div style={{ fontWeight: "500", color: "#333" }}>
//                     {place.structured_formatting.main_text}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "12px",
//                       color: "#666",
//                       marginTop: "2px",
//                     }}
//                   >
//                     {place.structured_formatting.secondary_text}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Loading Overlay */}
//         {(isLoading || isMapLoading) && (
//           <div
//             style={{
//               position: "absolute",
//               top: "0",
//               left: "0",
//               right: "0",
//               bottom: "0",
//               backgroundColor: "rgba(255, 255, 255, 0.9)",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: "2000",
//             }}
//           >
//             <div
//               style={{
//                 width: "40px",
//                 height: "40px",
//                 border: "4px solid #e0e0e0",
//                 borderTop: "4px solid #6B8E23",
//                 borderRadius: "50%",
//                 animation: "spin 1s linear infinite",
//                 marginBottom: "16px",
//               }}
//             ></div>
//             <div
//               style={{
//                 fontSize: "16px",
//                 color: "#333",
//                 fontWeight: "500",
//               }}
//             >
//               {isGettingLocation
//                 ? "Detecting your location..."
//                 : "Loading map..."}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Bottom Half - Address Form */}
//       <div
//         style={{
//           flex: "1",
//           backgroundColor: "white",
//           padding: window.innerWidth <= 480 ? "16px" : "24px",
//           boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
//           overflowY: "auto",
//         }}
//       >
//         <div style={{ maxWidth: "500px", margin: "0 auto" }}>
//           {/* Location Status Indicator */}
//           {/* {renderLocationStatus()} */}

//           {/* Current Address Display */}
//           <div
//             style={{
//               backgroundColor: "#f8f9fa",
//               borderRadius: "8px",
//               padding: window.innerWidth <= 480 ? "8px 10px" : "10px 12px",
//               marginBottom: window.innerWidth <= 480 ? "12px" : "16px",
//               border: "1px solid #e0e0e0",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: window.innerWidth <= 480 ? "6px" : "8px",
//               }}
//             >
//               <MapPin size={16} color="#4caf50" />

//               <div
//                 style={{
//                   flex: 1,
//                   minWidth: 0,
//                   fontSize: window.innerWidth <= 480 ? "12px" : "14px",
//                   color: "#666",
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                   lineHeight: "1.2",
//                 }}
//               >
//                 {isGeocoding ? "Getting address..." : address}
//               </div>
//             </div>
//           </div>

//           {/* Error Display */}
//           {error && (
//             <div
//               style={{
//                 backgroundColor: "#fff2f2",
//                 border: "1px solid #ffcccc",
//                 borderRadius: "8px",
//                 padding: "12px",
//                 marginBottom: "16px",
//                 fontSize: window.innerWidth <= 480 ? "12px" : "14px",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "8px",
//                   fontWeight: "500",
//                   color: "#d32f2f",
//                   marginBottom: "4px",
//                 }}
//               >
//                 <span>❌</span>
//                 <span>{error}</span>
//               </div>
//             </div>
//           )}

//           {/* Serviceability Status */}
//           {selectedLocation && isServiceable === false && (
//             <div
//               style={{
//                 backgroundColor: "#fff3e0",
//                 border: "1px solid #ffcc80",
//                 borderRadius: "8px",
//                 padding: "12px",
//                 marginBottom: "20px",
//                 fontSize: window.innerWidth <= 480 ? "13px" : "14px",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "8px",
//                   fontWeight: "500",
//                   color: "#b22222",
//                   marginBottom: "4px",
//                 }}
//               >
//                 <span>⚠️</span>
//                 <span>Service not available in this area</span>
//               </div>
//               <div
//                 style={{
//                   fontSize: window.innerWidth <= 480 ? "11px" : "12px",
//                   color: "#666",
//                   lineHeight: "1.4",
//                 }}
//               >
//                 You can still save this address and request service for this
//                 location.
//               </div>
//             </div>
//           )}

//           {/* Show address form if location is serviceable, otherwise show request button */}
//           {isServiceable === true || isServiceable === null ? (
//             <form onSubmit={handleSaveAddress}>
//               {/* Address Type Selection */}
//               <div style={{ marginBottom: "10px" }}>
//                 <div
//                   style={{
//                     display: window.innerWidth <= 768 ? "flex" : "grid",
//                     flexWrap: window.innerWidth <= 768 ? "wrap" : "nowrap",
//                     justifyContent:
//                       window.innerWidth <= 768 ? "flex-start" : "stretch",
//                     gridTemplateColumns:
//                       window.innerWidth <= 360
//                         ? "repeat(2, 1fr)"
//                         : "repeat(4, 1fr)",
//                     gap:
//                       window.innerWidth <= 360
//                         ? "8px"
//                         : window.innerWidth <= 768
//                           ? "6px"
//                           : "8px",
//                     width: "100%",
//                   }}
//                 >
//                   {addressTypes.map((type) => (
//                     <button
//                       key={type.key}
//                       type="button"
//                       onClick={() => setAddressType(type.key)}
//                       style={{
//                         width: window.innerWidth <= 768 ? "auto" : "100%",
//                         minHeight:
//                           window.innerWidth <= 360
//                             ? "38px"
//                             : window.innerWidth <= 768
//                               ? "43px"
//                               : "65px",
//                         padding:
//                           window.innerWidth <= 360
//                             ? "6px 4px"
//                             : window.innerWidth <= 768
//                               ? "8px"
//                               : "12px",
//                         borderRadius:
//                           window.innerWidth <= 360
//                             ? "8px"
//                             : window.innerWidth <= 768
//                               ? "12px"
//                               : "14px",
//                         border:
//                           addressType === type.key
//                             ? "1.2px solid #F5DEB3"
//                             : "1.2px solid #F5DEB3",
//                         backgroundColor:
//                           addressType === type.key ? "#6B8E23" : "#FFF8DC",
//                         cursor: "pointer",
//                         transition: "all 0.2s ease",
//                         display: "inline-flex",
//                         flexDirection: "row",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         gap:
//                           window.innerWidth <= 360
//                             ? "4px"
//                             : window.innerWidth <= 768
//                               ? "6px"
//                               : "8px",
//                         overflow: "hidden",
//                         flexShrink: 0,
//                       }}
//                       onMouseEnter={(e) => {
//                         if (addressType !== type.key) {
//                           e.currentTarget.style.backgroundColor = "#F8F4E8";
//                         }
//                       }}
//                       onMouseLeave={(e) => {
//                         if (addressType !== type.key) {
//                           e.currentTarget.style.backgroundColor = "#FFF8DC";
//                         }
//                       }}
//                     >
//                       <img
//                         src={addressType === type.key ? type.icon2 : type.icon}
//                         alt={type.label}
//                         style={{
//                           width:
//                             window.innerWidth <= 360
//                               ? "14px"
//                               : window.innerWidth <= 768
//                                 ? "16px"
//                                 : "24px",
//                           height:
//                             window.innerWidth <= 360
//                               ? "14px"
//                               : window.innerWidth <= 768
//                                 ? "16px"
//                                 : "24px",
//                           objectFit: "contain",
//                           flexShrink: 0,
//                         }}
//                       />
//                       <span
//                         style={{
//                           fontSize:
//                             window.innerWidth <= 360
//                               ? "10px"
//                               : window.innerWidth <= 768
//                                 ? "11px"
//                                 : "14px",
//                           fontWeight: "500",
//                           fontFamily: "Inter",
//                           color: addressType === type.key ? "#fff" : "#000",
//                           textAlign: "center",
//                           lineHeight: "1.3",
//                           whiteSpace:
//                             window.innerWidth <= 768 ? "nowrap" : "normal",
//                         }}
//                       >
//                         {type.label}
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Type Specific Fields */}
//               {addressType && renderTypeSpecificFields()}

//               {/* Save Address Button */}
//               {addressType && (
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginTop: "24px",
//                     gap:
//                       window.innerWidth <= 360
//                         ? "8px"
//                         : window.innerWidth <= 768
//                           ? "12px"
//                           : "16px",
//                     paddingTop: "20px",
//                     borderTop: "1px solid rgba(0,0,0,0.1)",
//                   }}
//                 >
//                   <button
//                     type="button"
//                     onClick={() => {
//                       navigate("/home");
//                     }}
//                     style={{
//                       backgroundColor: "transparent",
//                       border: "1px solid #d5c5b0",
//                       borderRadius:
//                         window.innerWidth <= 360
//                           ? "8px"
//                           : window.innerWidth <= 768
//                             ? "12px"
//                             : "14px",
//                       width: "48%",
//                       height:
//                         window.innerWidth <= 360
//                           ? "40px"
//                           : window.innerWidth <= 768
//                             ? "45px"
//                             : "50px",
//                       fontWeight: "600",
//                       textAlign: "center",
//                       fontSize:
//                         window.innerWidth <= 360
//                           ? "13px"
//                           : window.innerWidth <= 768
//                             ? "14px"
//                             : "16px",
//                       padding: "0 10px",
//                       display: "flex",
//                       flexDirection: "row",
//                       justifyContent: "center",
//                       alignItems: "center",
//                       gap: "6px",
//                       cursor: "pointer",
//                       transition: "all 0.2s ease",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = "#f9f9f9";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor = "transparent";
//                     }}
//                   >
//                     Cancel
//                     <img
//                       src={cross}
//                       alt=""
//                       style={{
//                         width:
//                           window.innerWidth <= 360
//                             ? "12px"
//                             : window.innerWidth <= 768
//                               ? "14px"
//                               : "16px",
//                         height:
//                           window.innerWidth <= 360
//                             ? "12px"
//                             : window.innerWidth <= 768
//                               ? "14px"
//                               : "16px",
//                       }}
//                     />
//                   </button>

//                   <button
//                     type="submit"
//                     disabled={!isFormValid() || isLoading}
//                     style={{
//                       backgroundColor:
//                         isFormValid() && !isLoading ? "#E6B800" : "#C0C0C0",
//                       borderRadius:
//                         window.innerWidth <= 360
//                           ? "8px"
//                           : window.innerWidth <= 768
//                             ? "12px"
//                             : "14px",
//                       border: "1px solid #c0c0c0",
//                       width: "48%",
//                       height:
//                         window.innerWidth <= 360
//                           ? "40px"
//                           : window.innerWidth <= 768
//                             ? "45px"
//                             : "50px",
//                       fontWeight: "600",
//                       color: "black",
//                       cursor:
//                         isFormValid() && !isLoading ? "pointer" : "not-allowed",
//                       fontSize:
//                         window.innerWidth <= 360
//                           ? "13px"
//                           : window.innerWidth <= 768
//                             ? "14px"
//                             : "16px",
//                       padding: "0 12px",
//                       gap: "6px",
//                       display: "flex",
//                       flexDirection: "row",
//                       justifyContent: "center",
//                       alignItems: "center",
//                       transition: "all 0.2s ease",
//                     }}
//                     onMouseEnter={(e) => {
//                       if (isFormValid() && !isLoading) {
//                         e.currentTarget.style.backgroundColor = "#FFD700";
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       if (isFormValid() && !isLoading) {
//                         e.currentTarget.style.backgroundColor = "#E6B800";
//                       }
//                     }}
//                   >
//                     {isLoading
//                       ? "Saving..."
//                       : location.state?.editingAddress
//                         ? "Update Address"
//                         : "Save Address"}
//                     {!isLoading && (
//                       <CircleCheck
//                         style={{
//                           width:
//                             window.innerWidth <= 360
//                               ? "14px"
//                               : window.innerWidth <= 768
//                                 ? "16px"
//                                 : "18px",
//                           height:
//                             window.innerWidth <= 360
//                               ? "14px"
//                               : window.innerWidth <= 768
//                                 ? "16px"
//                                 : "18px",
//                           marginTop: "1px",
//                         }}
//                       />
//                     )}
//                   </button>
//                 </div>
//               )}
//             </form>
//           ) : isServiceable === false ? (
//             <div>
//               <button
//                 onClick={() => setShowServiceablePopup(true)}
//                 disabled={isValidatingServiceability || !selectedLocation}
//                 style={{
//                   width: "100%",
//                   padding: window.innerWidth <= 480 ? "14px" : "16px",
//                   backgroundColor:
//                     isValidatingServiceability || !selectedLocation
//                       ? "#ccc"
//                       : "#b22222",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "10px",
//                   fontSize: window.innerWidth <= 480 ? "14px" : "16px",
//                   fontWeight: "600",
//                   cursor:
//                     isValidatingServiceability || !selectedLocation
//                       ? "default"
//                       : "pointer",
//                   transition: "all 0.3s ease",
//                   marginBottom: "24px",
//                 }}
//                 onMouseEnter={(e) => {
//                   if (!isValidatingServiceability && selectedLocation) {
//                     e.target.style.opacity = "0.9";
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   if (!isValidatingServiceability && selectedLocation) {
//                     e.target.style.opacity = "1";
//                   }
//                 }}
//               >
//                 {isValidatingServiceability
//                   ? "Checking serviceability..."
//                   : "Request Service for This Area"}
//               </button>
//             </div>
//           ) : (
//             <div
//               style={{
//                 textAlign: "center",
//                 padding: "40px 0",
//               }}
//             ></div>
//           )}
//         </div>
//       </div>

//       <style>
//         {`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }

//           @media (max-width: 480px) {
//             .fixed-pin-message {
//               top: calc(50% - 60px) !important;
//               padding: 6px 10px !important;
//               font-size: 11px !important;
//               max-width: 160px !important;
//               border-radius: 4px !important;
//             }
//             .fixed-pin-message div:first-child {
//               font-size: 10px !important;
//             }
//             .fixed-pin-message div:last-child {
//               font-size: 9px !important;
//               margin-top: 1px !important;
//             }

//             .fixed-pin {
//               width: 32px !important;
//               height: 40px !important;
//             }
//             .fixed-pin svg {
//               width: 32px !important;
//               height: 40px !important;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default UpdateLocation;

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal2 from "sweetalert2";
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
import { CircleCheck, Search, MapPin, Navigation } from "lucide-react";
import spilt from "./../assets/spilt.png";
import secure from "./../assets/secure.png";
import warning from "./../assets/warning.png";
import axios from "axios";
import "./../Styles/Location.css";
import locationIcon from "./../assets/red-location.png";

function useWindowWidth() {
  const [w, setW] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  React.useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}

// iOS detection function
const detectIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

// iOS Safari detection (more specific)
const isIOSSafari = () => {
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const webkit = !!ua.match(/WebKit/i);
  return iOS && webkit && !ua.match(/CriOS/i) && !ua.match(/FxiOS/i);
};

const UpdateLocation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Default Bengaluru coordinates
  const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 };

  // Detect iOS platform
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSSafariBrowser, setIsIOSSafariBrowser] = useState(false);

  useEffect(() => {
    setIsIOS(detectIOS());
    setIsIOSSafariBrowser(isIOSSafari());
  }, []);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [address, setAddress] = useState("Getting location...");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [hasGeocoded, setHasGeocoded] = useState(false);

  // iOS specific states
  const [iosPermissionDenied, setIosPermissionDenied] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Address form state
  const [hub, setHub] = useState([]);
  const [houseName, setHouseName] = useState("");
  const [homeName, setHomeName] = useState("");
  const [addressType, setAddressType] = useState("Home");
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
  const [buildingName, setBuildingName] = useState("");

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
  const locationAttemptRef = useRef(0);
  const hasAttemptedLocationRef = useRef(false);

  const width = useWindowWidth();
  const isSmall = width <= 768;
  const isVerySmall = width <= 360;

  const API_KEY = import.meta.env.VITE_MAP_KEY;

  // Enhanced iOS location permission check
  const checkIOSLocationPermission = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(false);
        return;
      }

      // iOS specific: check if we're in Safari
      if (isIOSSafariBrowser) {
        console.log("iOS Safari detected - using specific permission check");

        // For iOS Safari, we need to check the actual permission state
        if (navigator.permissions && navigator.permissions.query) {
          navigator.permissions
            .query({ name: "geolocation" })
            .then((result) => {
              console.log("iOS Safari permission state:", result.state);
              if (result.state === "granted") {
                resolve(true);
              } else if (result.state === "denied") {
                setIosPermissionDenied(true);
                resolve(false);
              } else {
                resolve(null); // prompt state
              }
            })
            .catch((error) => {
              console.error("iOS permission query error:", error);
              resolve(null);
            });
        } else {
          // iOS may not support permissions API fully
          console.log("iOS device - permissions API not fully supported");
          resolve(null);
        }
      } else {
        // Non-iOS or other browsers
        resolve(null);
      }
    });
  }, [isIOSSafariBrowser]);

  // Function to check location permission
  const checkLocationPermission = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(false);
        return;
      }

      // iOS specific handling
      if (isIOS) {
        checkIOSLocationPermission().then(resolve);
        return;
      }

      // Android/Desktop - use standard permissions API
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions
          .query({ name: "geolocation" })
          .then((result) => {
            if (result.state === "granted") {
              resolve(true);
            } else if (result.state === "denied") {
              resolve(false);
            } else {
              resolve(null);
            }
          })
          .catch(() => {
            resolve(null);
          });
      } else {
        resolve(null);
      }
    });
  }, [isIOS, checkIOSLocationPermission]);

  // Get address from coordinates
  const getAddressFromCoordinates = useCallback(async (lat, lng) => {
    if (!window.google || !window.google.maps || !geocoderRef.current) {
      setAddress("Address service not available");
      return "Address service not available";
    }

    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      isNaN(lat) ||
      isNaN(lng)
    ) {
      setAddress("Invalid location coordinates");
      return "Invalid location coordinates";
    }

    setIsGeocoding(true);
    setAddress("Getting address...");

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
          },
        );
      });

      setAddress(response);
      const shortAddress = response.split(",")[0];
      setHouseName(shortAddress);
      setHasGeocoded(true);
      return response;
    } catch (error) {
      console.error("Geocoding error:", error);
      const errorMsg = "Address not available";
      setAddress(errorMsg);
      setHasGeocoded(true);
      return errorMsg;
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Get current location with smooth handling - iOS optimized
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      setLocationPermissionGranted(false);
      setAddress("Location service not available");
      return DEFAULT_LOCATION;
    }

    setIsGettingLocation(true);
    setAddress("Detecting your location...");
    locationAttemptRef.current++;

    return new Promise((resolve) => {
      const locationOptions = {
        enableHighAccuracy: true,
        timeout: isIOS ? 15000 : 10000, // Longer timeout for iOS
        maximumAge: 0,
      };

      const successCallback = async (position) => {
        console.log("Location obtained successfully");
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setLocationPermissionGranted(true);
        localStorage.setItem("locationPermissionGranted", "true");
        localStorage.setItem("lastKnownLocation", JSON.stringify(location));
        setIosPermissionDenied(false);

        if (scriptLoaded && geocoderRef.current) {
          getAddressFromCoordinates(location.lat, location.lng);
        } else {
          setAddress("Location detected, loading address...");
        }

        setIsGettingLocation(false);
        resolve(location);
      };

      const errorCallback = (error) => {
        console.log("Location error:", error.code, error.message);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log("Location permission denied by user");
            setLocationPermissionGranted(false);
            setAddress("Location access denied. Using default location.");
            localStorage.setItem("locationPermissionGranted", "false");

            // iOS specific handling
            if (isIOS) {
              setIosPermissionDenied(true);
              setShowIOSInstructions(true);

              setTimeout(() => {
                Swal2.fire({
                  title: "📍 iOS Location Access Required",
                  html: `
                    <div style="text-align: center; padding: 12px">
                      <p style="color: #666; font-size: 15px; margin-bottom: 12px; line-height: 1.4;">
                        On iOS devices, location access requires additional steps:
                      </p>
                      <div style="background: #f8f9fa; border-radius: 6px; padding: 10px; margin-bottom: 12px; text-align: left;">
                        <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.5;">
                          <strong>In Safari:</strong><br>
                          1. Tap <strong>AA</strong> in address bar<br>
                          2. Select <strong>Website Settings</strong><br>
                          3. Enable <strong>Location</strong> permission<br>
                          4. Refresh the page
                        </p>
                      </div>
                      <div style="background: #f8f9fa; border-radius: 6px; padding: 10px; text-align: left;">
                        <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.5;">
                          <strong>In App Browser:</strong><br>
                          • Go to iPhone <em>Settings</em><br>
                          • Tap <em>Privacy & Security</em><br>
                          • Tap <em>Location Services</em><br>
                          • Enable for your browser/app
                        </p>
                      </div>
                    </div>
                  `,
                  icon: "warning",
                  iconColor: "#dc3545",
                  confirmButtonText: "Got it",
                  confirmButtonColor: "#dc3545",
                  width: "400px",
                  padding: "0.75rem",
                  showCloseButton: true,
                  backdrop: true,
                });
              }, 300);
            } else {
              // Non-iOS devices
              setTimeout(() => {
                Swal2.fire({
                  title: "📍 Location Permission Denied",
                  html: `
                    <div style="text-align: center; padding: 12px">
                      <p style="color: #666; font-size: 15px; margin-bottom: 12px; line-height: 1.4;">
                        To use this feature, please enable location access from your browser and phone settings.
                      </p>
                      <div style="background: #f8f9fa; border-radius: 6px; padding: 10px; margin-bottom: 12px; text-align: left;">
                        <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.5;">
                          <strong>On Browser:</strong><br>
                          1. Click the  lock icon (or location pin icon if visible) in the address bar<br>
                          2. Select "Allow" for Location permissions<br>
                          3. Refresh the page
                        </p>
                      </div>
                      <div style="background: #f8f9fa; border-radius: 6px; padding: 10px; text-align: left;">
                        <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.5;">
                          <strong>On Phone:</strong><br>
                          • Go to <em>Settings</em> → <em>Apps</em> → Select your browser<br>
                          • Tap <em>Permissions</em> → Enable <em>Location</em><br>
                          • Reopen the browser and try again
                        </p>
                      </div>
                    </div>
                  `,
                  icon: "warning",
                  iconColor: "#dc3545",
                  confirmButtonText: "Got it",
                  confirmButtonColor: "#dc3545",
                  width: "400px",
                  padding: "0.75rem",
                  showCloseButton: true,
                  backdrop: true,
                });
              }, 300);
            }
            break;
          case error.POSITION_UNAVAILABLE:
            console.log("Location information unavailable");
            setLocationPermissionGranted(null);
            setAddress("Unable to get location. Using default location.");
            break;
          case error.TIMEOUT:
            console.log("Location request timed out");
            setLocationPermissionGranted(null);
            setAddress("Location request timed out. Using default location.");
            // iOS specific timeout handling
            if (isIOS) {
              setAddress(
                "iOS location timeout. Try moving to better signal area.",
              );
            }
            break;
          default:
            console.log("Unknown error getting location");
            setLocationPermissionGranted(null);
            setAddress("Unable to get location. Using default location.");
        }

        setIsGettingLocation(false);
        resolve(DEFAULT_LOCATION);
      };

      // iOS specific: show helpful message before requesting
      if (isIOS && locationAttemptRef.current === 1) {
        setAddress("iOS: Please allow location access when prompted...");
      }

      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        locationOptions,
      );
    });
  }, [scriptLoaded, getAddressFromCoordinates, isIOS]);

  // Validate serviceability WITH HUB DATA
  const validateServiceabilityWithHub = async (location) => {
    if (!location) return false;

    try {
      setIsValidatingServiceability(true);

      const response = await fetch(
        "http://localhost:7013/api/Hub/validate-location",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: location.lat.toString(),
            lng: location.lng.toString(),
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setIsServiceable(data.serviceable);

        if (data.serviceable && data.hubs && data.hubs.length > 0) {
          setHub(data.hubs);
          console.log("Hub data received:", data.hubs);
        } else {
          setHub([]);
        }

        return data.serviceable;
      } else {
        console.error("Serviceability validation failed:", data.message);
        setIsServiceable(null);
        setHub([]);
        return false;
      }
    } catch (error) {
      console.error("Serviceability validation error:", error);
      setIsServiceable(null);
      setHub([]);
      return false;
    } finally {
      setIsValidatingServiceability(false);
    }
  };

  // Initialize services
  const initializeServices = useCallback(() => {
    if (window.google && window.google.maps && !geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();

      if (mapInstanceRef.current && !placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          mapInstanceRef.current,
        );
      }

      console.log("Google Maps services initialized");

      if (selectedLocation && !hasGeocoded && !isGeocoding) {
        console.log("Getting address for existing location:", selectedLocation);
        getAddressFromCoordinates(selectedLocation.lat, selectedLocation.lng);
      }
    }
  }, [selectedLocation, hasGeocoded, isGeocoding, getAddressFromCoordinates]);

  // Smooth location initialization with iOS handling
  const initializeLocation = useCallback(async () => {
    if (hasAttemptedLocationRef.current) {
      return;
    }

    hasAttemptedLocationRef.current = true;

    console.log("Initializing location...");
    console.log("iOS Device:", isIOS);
    console.log("iOS Safari:", isIOSSafariBrowser);

    setAddress("Initializing location...");

    // Check for iOS specific stored permission
    const storedPermission = localStorage.getItem("locationPermissionGranted");
    const hasDeniedBefore = storedPermission === "false";

    // iOS specific: check if we should show instructions
    if (isIOS && hasDeniedBefore) {
      setIosPermissionDenied(true);
      setShowIOSInstructions(true);
    }

    if (hasDeniedBefore) {
      console.log("Previous location denial detected, using default location");
      setLocationPermissionGranted(false);
      setCurrentLocation(DEFAULT_LOCATION);
      setSelectedLocation(DEFAULT_LOCATION);
      setAddress("Using default location (Bengaluru)");

      if (scriptLoaded && geocoderRef.current) {
        setTimeout(() => {
          getAddressFromCoordinates(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
        }, 500);
      }
      return;
    }

    const permissionState = await checkLocationPermission();

    if (permissionState === false) {
      console.log("Location permission denied");
      setLocationPermissionGranted(false);
      setCurrentLocation(DEFAULT_LOCATION);
      setSelectedLocation(DEFAULT_LOCATION);
      setAddress("Location access denied. Using Bengaluru.");
      localStorage.setItem("locationPermissionGranted", "false");

      if (scriptLoaded && geocoderRef.current) {
        setTimeout(() => {
          getAddressFromCoordinates(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
        }, 500);
      }
    } else if (permissionState === true) {
      console.log("Location permission granted, getting location...");
      setAddress("Getting your current location...");
      const location = await getCurrentLocation();

      if (location === DEFAULT_LOCATION) {
        console.log("Failed to get location despite permission");
        setCurrentLocation(DEFAULT_LOCATION);
        setSelectedLocation(DEFAULT_LOCATION);
        setAddress("Unable to get location. Using Bengaluru.");
      } else {
        console.log("Successfully obtained location:", location);
        setCurrentLocation(location);
        setSelectedLocation(location);

        validateServiceabilityWithHub(location);
      }
    } else {
      console.log(
        "Attempting to get location (will trigger browser prompt if needed)",
      );
      setAddress("Requesting location access...");
      const location = await getCurrentLocation();

      if (location === DEFAULT_LOCATION) {
        console.log("Location attempt failed or was denied");
        setCurrentLocation(DEFAULT_LOCATION);
        setSelectedLocation(DEFAULT_LOCATION);
        setAddress("Using default location (Bengaluru)");
      } else {
        console.log("Successfully obtained location after prompt:", location);
        setCurrentLocation(location);
        setSelectedLocation(location);

        validateServiceabilityWithHub(location);
      }
    }
  }, [
    checkLocationPermission,
    getCurrentLocation,
    scriptLoaded,
    getAddressFromCoordinates,
    isIOS,
    isIOSSafariBrowser,
  ]);

  // Load Google Maps script with iOS optimization
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

    // iOS specific: add additional attributes for better loading
    if (isIOS) {
      script.crossOrigin = "anonymous";
      script.integrity = ""; // Add if you have integrity hash
    }

    script.onload = () => {
      setScriptLoaded(true);
      initializeServices();
      console.log("Google Maps script loaded successfully");
      console.log("iOS status:", isIOS);
    };

    script.onerror = () => {
      console.error("Google Maps script failed to load");
      setError("Failed to load Google Maps. Please check your API key.");
      setIsLoading(false);
      setIsMapLoading(false);
      setIsServiceable(null);
      setIsConfirmed(true);
    };

    document.head.appendChild(script);

    // iOS specific: force reload if script doesn't load within 5 seconds
    if (isIOS) {
      const timeout = setTimeout(() => {
        if (!window.google || !window.google.maps) {
          console.log("iOS: Google Maps loading slow, attempting fallback...");
          // You could implement a fallback here if needed
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [initializeServices, API_KEY, isIOS]);

  // Handle back button
  useEffect(() => {
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

  // Check if coming from modal with selected place OR editing existing address
  useEffect(() => {
    if (location.state?.selectedPlace) {
      const { selectedPlace } = location.state;
      handleSelectedPlaceFromModal(selectedPlace);
    } else if (location.state?.editingAddress) {
      const { editingAddress } = location.state;
      handleEditingAddress(editingAddress);
    }
  }, [location.state]);

  // Handle place selected from modal
  const handleSelectedPlaceFromModal = (selectedPlace) => {
    if (selectedPlace.location && selectedPlace.address) {
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
      setHasGeocoded(true);

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.panTo(locationObj);
        mapInstanceRef.current.setZoom(19);
        markerRef.current.setPosition(locationObj);
      }

      setIsConfirmed(false);
      validateServiceabilityWithHub(locationObj);
    }
  };

  // Handle editing existing address
  const handleEditingAddress = (editingAddress) => {
    console.log("Editing address:", editingAddress);

    let locationCoords = DEFAULT_LOCATION;

    if (editingAddress.location) {
      if (
        editingAddress.location.coordinates &&
        editingAddress.location.coordinates.length >= 2
      ) {
        locationCoords = {
          lat: parseFloat(editingAddress.location.coordinates[1]),
          lng: parseFloat(editingAddress.location.coordinates[0]),
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
    setAddressType(editingAddress.addressType || "Home");
    setHasGeocoded(true);

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
      setStudentName(editingAddress.studentInformation.studentName || "");
      setStudentClass(editingAddress.studentInformation.studentClass || "");
      setStudentSection(editingAddress.studentInformation.studentSection || "");
    } else if (editingAddress.addressType === "Work") {
      setCompanyName(editingAddress.companyName || "");
      setFloorNo(editingAddress.floorNo || "");
      setBuildingName(editingAddress.buildingName || "");
    }

    setIsConfirmed(false);
    validateServiceabilityWithHub(locationCoords);
  };

  // Initialize location when component mounts
  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  // Initialize map when script is loaded and we have a location - with iOS optimizations
  useEffect(() => {
    const initializeMapWithLocation = async () => {
      if (!scriptLoaded || !selectedLocation) {
        return;
      }

      console.log("Initializing map with location:", selectedLocation);
      console.log("iOS Device during map init:", isIOS);

      if (mapRef.current && !mapInstanceRef.current) {
        try {
          setIsMapLoading(true);

          // iOS specific: longer delay for map initialization
          await new Promise((resolve) =>
            setTimeout(resolve, isIOS ? 300 : 100),
          );

          initializeMap(selectedLocation);

          if (
            !hasGeocoded ||
            address === "Getting address..." ||
            address.includes("location")
          ) {
            console.log("Fetching address for map location...");
            getAddressFromCoordinates(
              selectedLocation.lat,
              selectedLocation.lng,
            );
          }

          validateServiceabilityWithHub(selectedLocation);

          setIsMapLoading(false);
          setIsLoading(false);
        } catch (error) {
          console.error("Error in map initialization:", error);

          // iOS specific: try fallback initialization
          if (isIOS) {
            console.log("iOS map init failed, trying fallback...");
            try {
              // Try with default location as fallback
              initializeMap(DEFAULT_LOCATION);
              getAddressFromCoordinates(
                DEFAULT_LOCATION.lat,
                DEFAULT_LOCATION.lng,
              );
            } catch (fallbackError) {
              console.error("iOS fallback also failed:", fallbackError);
            }
          }

          setIsMapLoading(false);
          setIsLoading(false);
        }
      }
    };

    initializeMapWithLocation();
  }, [
    scriptLoaded,
    selectedLocation,
    hasGeocoded,
    address,
    getAddressFromCoordinates,
    isIOS,
  ]);

  // Initialize map with iOS optimizations
  const initializeMap = (location) => {
    if (
      !location ||
      typeof location.lat !== "number" ||
      typeof location.lng !== "number"
    ) {
      console.error("Invalid location provided to initializeMap:", location);
      location = DEFAULT_LOCATION;
    }

    if (!mapRef.current || !window.google || !window.google.maps) {
      console.error("Map container not found or Google Maps not loaded");
      return;
    }

    try {
      console.log("Creating new map instance at:", location);

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 19,
        center: location,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        rotateControl: false,
        scaleControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
        backgroundColor: "#f5f5f5",
        disableDefaultUI: true,
        gestureHandling: "greedy",
        // iOS specific: enable zoom gestures
        gestureHandling: isIOS ? "cooperative" : "greedy",
      });

      mapInstanceRef.current = map;

      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          map,
        );
      }

      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
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

      // iOS specific: larger tap area for better touch experience
      if (isIOS) {
        locationButton.style.minWidth = "44px";
        locationButton.style.minHeight = "44px";
        locationButton.style.padding = "12px";
      }

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

        getCurrentLocation().then((location) => {
          if (location !== DEFAULT_LOCATION) {
            map.setCenter(location);
            map.setZoom(19);

            if (markerRef.current) {
              markerRef.current.setPosition(location);
            }

            setSelectedLocation(location);
            setIsConfirmed(false);

            getAddressFromCoordinates(location.lat, location.lng);
            validateServiceabilityWithHub(location);
          } else {
            // If we got DEFAULT_LOCATION, it means permission was denied
            // The SweetAlert will already be shown in the errorCallback
          }

          locationButton.innerHTML = `
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
            </svg>
          `;
        });
      });

      map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(
        locationButton,
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

      // iOS specific: adjust pin size for better visibility
      if (isIOS) {
        fixedPinElement.style.width = "48px";
        fixedPinElement.style.height = "60px";
      }

      fixedPinElement.innerHTML = `
        <svg width="${isIOS ? "48" : "40"}" height="${isIOS ? "60" : "50"}" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
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

      // iOS specific: adjust message positioning
      if (isIOS) {
        fixedMessageElement.style.top = "calc(50% - 80px)";
        fixedMessageElement.style.padding = "10px 14px";
        fixedMessageElement.style.fontSize = "14px";
      }

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
        
        /* iOS specific adjustments */
        @media (max-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
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

      fixedMessageElement.className = "fixed-pin-message";

      const styleElement = document.createElement("style");
      styleElement.textContent = mobileStyles;
      document.head.appendChild(styleElement);

      fixedMessageElement.innerHTML = `
        <div>Order will be delivered here</div>
        <div style="font-size: ${isIOS ? "12px" : "10px"}; opacity: 0.9; margin-top: 2px; font-weight: normal;">
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
        position: location,
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
        validateServiceabilityWithHub(newLocation);
      };

      map.addListener("center_changed", () => {
        if (mapMoveTimeout) clearTimeout(mapMoveTimeout);
        // iOS specific: longer timeout for smoother experience
        mapMoveTimeout = setTimeout(
          () => {
            updateLocationFromCenter();
          },
          isIOS ? 500 : 300,
        );
      });

      console.log("Map initialized successfully with fixed pin and message");

      setTimeout(
        () => {
          if (!hasGeocoded || address === "Getting address...") {
            console.log("Triggering initial address fetch after map load");
            getAddressFromCoordinates(location.lat, location.lng);
          }
        },
        isIOS ? 1000 : 500,
      ); // Longer delay for iOS
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
        },
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
              placeResult.name || placeResult.formatted_address.split(",")[0],
            );
            setHasGeocoded(true);

            if (mapInstanceRef.current && markerRef.current) {
              mapInstanceRef.current.panTo(location);
              mapInstanceRef.current.setZoom(19);
              markerRef.current.setPosition(location);
            }

            setSearchQuery("");
            setSearchSuggestions([]);
            setIsConfirmed(false);
            validateServiceabilityWithHub(location);
          }
        },
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
        "http://localhost:7013/api/service-requests",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      if (response.data.success) {
        const successData = {
          name: name.trim(),
          phone: phone.trim(),
          address: address || "Address not available",
        };

        setShowServiceablePopup(false);
        setServiceRequestName("");
        setServiceRequestPhone("");

        setTimeout(() => {
          Swal2.fire({
            html: `
          <div style="text-align: center; padding: ${isSmall ? "8px" : "12px"}">
            <div style="font-size: ${
              isSmall ? "16px" : "18px"
            }; color: #6B8E23; margin-bottom: ${
              isSmall ? "12px" : "15px"
            }; font-weight: 600;">
              ✅ Your service request has been successfully submitted!
            </div>
            <div style="font-size: ${
              isSmall ? "13px" : "14px"
            }; color: #666; line-height: 1.5; margin-bottom: ${
              isSmall ? "12px" : "15px"
            }">
              <div style="text-align: left; margin: 0 auto; max-width: ${
                isSmall ? "280px" : "320px"
              }; background: #f9f9f9; padding: 12px; border-radius: 8px; margin-bottom: 12px">
                <p style="margin: 6px 0"><strong>Name:</strong> ${
                  successData.name
                }</p>
                <p style="margin: 6px 0"><strong>Phone:</strong> ${
                  successData.phone
                }</p>
                <p style="margin: 6px 0"><strong>Address:</strong> ${
                  successData.address
                }</p>
              </div>
              <p style="font-weight: 600; color: #333; margin-bottom: 8px">What happens next?</p>
              <div style="text-align: left; margin: 0 auto; max-width: ${
                isSmall ? "280px" : "320px"
              }">
                <p style="margin: 4px 0">• Our team will review your location</p>
                <p style="margin: 4px 0">• You'll be notified when service starts in your area</p>
              </div>
            </div>
          </div>
        `,
            icon: "success",
            confirmButtonText: "Got it!",
            confirmButtonColor: "#6B8E23",
            width: isSmall ? "90%" : "500px",
            padding: isSmall ? "1rem" : "1.5rem",
            backdrop: true,
            allowOutsideClick: true,
            allowEscapeKey: true,
            focusConfirm: true,
            showConfirmButton: true,
            zIndex: 9999999,
          });
        }, 500);

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
          // Show the specific popup for duplicate request
          setTimeout(() => {
            Swal2.fire({
              html: `
    <div style="text-align: center; padding: ${isSmall ? "9px 0px" : "12px 16px"}">
      <h4 style="color: #dc3545; margin: 0 0 ${isSmall ? "6px" : "10px"} 0; font-size: ${
        isSmall ? "16px" : "18px"
      }; font-weight: 600; line-height: 1.3;">
        ⏳ Request Already Exists
      </h4>
      <p style="color: #666; font-size: ${isSmall ? "13px" : "14px"}; margin: 0 0 6px 0; line-height: 1.4;">
        You've already submitted a service request for this location.
      </p>
      <p style="color: #888; font-size: ${isSmall ? "12px" : "13px"}; margin: 0; line-height: 1.4;">
        Our team will contact you once service is available in your area.
      </p>
    </div>
  `,
              icon: "info",
              iconColor: "#dc3545",
              confirmButtonText: "OK",
              confirmButtonColor: "#dc3545",
              width: isSmall ? "340px" : "360px",
              padding: isSmall ? "0.5rem" : "1rem", // Reduced modal padding
              showCloseButton: true,
              backdrop: true,
              allowOutsideClick: true,
              allowEscapeKey: true,
              focusConfirm: true,
              showConfirmButton: true,
              zIndex: 9999999,
            });
          }, 300);

          // Close the service request popup
          setShowServiceablePopup(false);
          setServiceRequestName("");
          setServiceRequestPhone("");
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
          error.message || "Failed to submit request. Please try again.",
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
      setBuildingName("");
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
        return companyName.trim() && floorNo.trim() && buildingName.trim();
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

    let locationObj = selectedLocation;
    console.log("🔍 handleSaveAddress - selectedLocation:", selectedLocation);

    if (!locationObj || !locationObj.lat || !locationObj.lng) {
      setError(
        "Location coordinates are missing. Please try moving the pin on the map.",
      );
      setIsLoading(false);
      return;
    }

    const hubData = hub.length > 0 ? hub[0] : null;
    console.log("Hub data for saving:", hubData);

    const addressData = {
      location: locationObj,
      address: address,
      houseName: houseName,
      addressType: addressType,
      homeName: homeName,
      apartmentName: apartmentName,
      schoolName: schoolName,
      companyName: companyName,
      hubName: hubData?.hubName || "",
      hubId: hubData?.hub || "",
      ...(addressType === "Home" && { landmark, floor }),
      ...(addressType === "PG" && { towerBlock, flat, floor }),
      ...(addressType === "School" && {
        studentName,
        studentClass,
        studentSection,
      }),
      ...(addressType === "Work" && { floorNo, buildingName }),
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
        floorNo: addressData.floorNo || "",
        buildingName: addressData.buildingName || "",
        homeName: addressData.homeName || "",
        apartmentName: addressData.apartmentName || "",
        schoolName: addressData.schoolName || "",
        companyName: addressData.companyName || "",
        isDefault: true,
        hubName: addressData.hubName || "",
        hubId: addressData.hubId || "",
      };

      if (addressData.addressType === "School") {
        requestPayload.studentInformation = {
          studentName: addressData.studentName || "",
          studentClass: addressData.studentClass || "",
          studentSection: addressData.studentSection || "",
        };
      }

      requestPayload.studentName = addressData.studentName || "";
      requestPayload.studentClass = addressData.studentClass || "";
      requestPayload.studentSection = addressData.studentSection || "";

      console.log("req payload", requestPayload);

      if (location.state?.editingAddress?._id) {
        requestPayload.addressId = location.state.editingAddress._id;
        if (!location.state.editingAddress.isDefault) {
          requestPayload.isDefault = false;
        }
      }

      const endpoint = location.state?.editingAddress?._id
        ? `http://localhost:7013/api/User/customers/${user._id}/addresses/${location.state.editingAddress._id}`
        : "http://localhost:7013/api/User/addresses";
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
        localStorage.setItem("locationManuallySelected", "true");
        localStorage.removeItem("postLoginDestination");

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
        `http://localhost:7013/api/User/customers/${customerId}/addresses/${addressId}/primary`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.ok) {
        console.log(`Address ${addressId} set as primary successfully`);

        const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
        if (cachedAddresses) {
          const cached = JSON.parse(cachedAddresses);
          cached.primaryAddress = addressId;
          localStorage.setItem(
            `addresses_${customerId}`,
            JSON.stringify(cached),
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
    let parts = [];

    switch (addressType) {
      case "Home":
        if (homeName) parts.push(homeName);
        if (landmark) parts.push(`near ${landmark}`);
        if (floor) parts.push(floor);
        break;
      case "PG":
        if (apartmentName) parts.push(apartmentName);
        if (towerBlock) parts.push(towerBlock);
        if (flat) parts.push(flat);
        if (floor) parts.push(floor);
        break;
      case "School":
        if (schoolName) parts.push(schoolName);
        if (studentName) parts.push(studentName);
        if (studentClass) parts.push(`Class ${studentClass}`);
        if (studentSection) parts.push(`Section ${studentSection}`);
        break;
      case "Work":
        if (companyName) parts.push(companyName);
        if (floorNo) parts.push(floorNo);
        if (buildingName) parts.push(buildingName);
        break;
    }

    parts.push(fullAddress);

    return parts.join(", ");
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
    setBuildingName("");
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
            <div
              className=" gap-2 align-items-start"
              style={{ display: "flex", gap: 2 }}
            >
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

            <div
              className=" gap-2 align-items-start"
              style={{ display: "flex", gap: 2 }}
            >
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
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              placeholder="Building Name *"
              style={{ ...commonInputStyle, marginBottom: "0" }}
            />
            <input
              type="text"
              value={floorNo}
              onChange={(e) => setFloorNo(e.target.value)}
              placeholder="Gate no / Floor no *"
              style={{ ...commonInputStyle, marginBottom: "0" }}
            />
          </div>
        );

      default:
        return null;
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const renderLocationStatus = () => {
    if (isGettingLocation) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#e8f4fd",
            padding: "8px 12px",
            borderRadius: "8px",
            marginBottom: "12px",
            border: "1px solid #b3d9ff",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid #0066cc",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <span style={{ fontSize: "14px", color: "#0066cc" }}>
            Detecting your location...
          </span>
        </div>
      );
    }

    if (locationPermissionGranted === false) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#fff3e0",
            padding: "8px 12px",
            borderRadius: "8px",
            marginBottom: "12px",
            border: "1px solid #ffcc80",
          }}
        >
          <span style={{ fontSize: "14px", color: "#b22222" }}>
            ⚠️ Using default location (Location access denied)
          </span>
        </div>
      );
    }

    if (
      locationPermissionGranted === true &&
      selectedLocation &&
      selectedLocation !== DEFAULT_LOCATION
    ) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#f0f9f0",
            padding: "8px 12px",
            borderRadius: "8px",
            marginBottom: "12px",
            border: "1px solid #90ee90",
          }}
        >
          <Navigation size={16} color="#228B22" />
          <span style={{ fontSize: "14px", color: "#228B22" }}>
            Using your current location
          </span>
        </div>
      );
    }

    return null;
  };

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
      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
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
            zIndex: 4000,
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
            <h3
              style={{
                marginBottom: "16px",
                color: "#333",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              📍 iOS Location Access Required
            </h3>
            <p
              style={{
                marginBottom: "20px",
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              To use location features on iOS, please enable location access:
            </p>

            <div style={{ textAlign: "left", marginBottom: "20px" }}>
              <div style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#333" }}>In Safari:</strong>
                <ol
                  style={{
                    margin: "8px 0",
                    paddingLeft: "20px",
                    color: "#666",
                    fontSize: "13px",
                  }}
                >
                  <li>
                    Tap <strong>AA</strong> in the address bar
                  </li>
                  <li>
                    Select <strong>Website Settings</strong>
                  </li>
                  <li>
                    Enable <strong>Location</strong> permission
                  </li>
                  <li>Refresh this page</li>
                </ol>
              </div>

              <div>
                <strong style={{ color: "#333" }}>In App Browser:</strong>
                <ul
                  style={{
                    margin: "8px 0",
                    paddingLeft: "20px",
                    color: "#666",
                    fontSize: "13px",
                  }}
                >
                  <li>
                    Go to iPhone <strong>Settings</strong>
                  </li>
                  <li>
                    Tap <strong>Privacy & Security</strong>
                  </li>
                  <li>
                    Tap <strong>Location Services</strong>
                  </li>
                  <li>Find and enable for your browser/app</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              style={{
                backgroundColor: "#6B8E23",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "14px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#5a7a1d";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#6B8E23";
              }}
            >
              Got it, I'll enable location
            </button>
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
            <img
              src={locationIcon}
              alt="Location"
              style={{
                width: isSmall ? "52px" : "60px",
                height: isSmall ? "52px" : "60px",
                objectFit: "contain",
              }}
            />
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
        {(isLoading || isMapLoading) && (
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
              {isGettingLocation
                ? "Detecting your location..."
                : "Loading map..."}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Half - Address Form */}
      <div
        style={{
          flex: "1",
          backgroundColor: "white",
          padding: window.innerWidth <= 480 ? "16px" : "24px",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          {/* Location Status Indicator */}
          {/* {renderLocationStatus()} */}

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
                alignItems: "center",
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
                {isGeocoding ? "Getting address..." : address}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div
              style={{
                backgroundColor: "#fff2f2",
                border: "1px solid #ffcccc",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "16px",
                fontSize: window.innerWidth <= 480 ? "12px" : "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "500",
                  color: "#d32f2f",
                  marginBottom: "4px",
                }}
              >
                <span>❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

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
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
              }}
            ></div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
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
            
            .fixed-pin {
              width: 32px !important;
              height: 40px !important;
            }
            .fixed-pin svg {
              width: 32px !important;
              height: 40px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default UpdateLocation;
