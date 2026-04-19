// import {
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   useRef,
//   useCallback,
// } from "react";
// import { Container } from "react-bootstrap";
// import { FaEye, FaEyeSlash, FaLock, FaUser, FaAngleUp } from "react-icons/fa";
// import { Button, Form, InputGroup, Modal } from "react-bootstrap";
// import { FaPlus, FaMinus, FaSquareWhatsapp } from "react-icons/fa6";
// import "../Styles/Home.css";
// import Banner from "./Banner";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Drawer } from "antd";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import CoinBalance from "./CoinBalance";
// import { WalletContext } from "../WalletContext";
// import RatingModal from "./RatingModal";
// import { BiSolidOffer } from "react-icons/bi";
// import Swal2 from "sweetalert2";
// import moment from "moment";
// import IsVeg from "../assets/isVeg=yes.svg";
// import IsNonVeg from "../assets/isVeg=no.svg";
// import MultiCartDrawer from "./MultiCartDrawer";
// import DateSessionSelector from "./DateSessionSelector";
// import chef from "./../assets/chef_3.png";
// import { Colors, FontFamily } from "../Helper/themes";
// import BottomNav from "./BottomNav";
// import LocationRequiredPopup from "./LocationRequiredPopup";
// import { MdAddLocationAlt } from "react-icons/md";
// import availabity from "./../assets/weui_done2-filled.png";
// import Footer from "./Footer";

// const Home = ({ selectArea, setSelectArea, Carts, setCarts }) => {
//   // Store user in state to avoid infinite render loop
//   const [user, setUser] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   });

//   // Listen for user changes in localStorage
//   useEffect(() => {
//     const handleStorage = (e) => {
//       if (e.key === "user") {
//         try {
//           setUser(JSON.parse(e.newValue));
//         } catch {
//           setUser(null);
//         }
//       }
//     };
//     window.addEventListener("storage", handleStorage);
//     return () => window.removeEventListener("storage", handleStorage);
//   }, []);

//   // Provide a function to update user state and localStorage together
//   const updateUser = (userObj) => {
//     setUser(userObj);
//     if (userObj) {
//       localStorage.setItem("user", JSON.stringify(userObj));
//     } else {
//       localStorage.removeItem("user");
//     }
//     window.dispatchEvent(new Event("userUpdated"));
//   };

//   const navigate = useNavigate();
//   const location = useLocation();

//   const { wallet, transactions, loading, walletSeting, getorderByCustomerId } =
//     useContext(WalletContext);

//   const [loader, setloader] = useState(false);
//   const [allHubMenuData, setAllHubMenuData] = useState([]);

//   // --- NEW STATE FOR FILTERS ---
//   const [isVegOnly, setIsVegOnly] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("All");

//   const [address, setAddress] = useState(null);

//   // Initial address loading with better error handling
//   useEffect(() => {
//     const loadInitialAddress = () => {
//       try {
//         const primaryAddress = localStorage.getItem("primaryAddress");
//         const currentLocation = localStorage.getItem("currentLocation");

//         // console.log("Initial load - primaryAddress:", primaryAddress);
//         // console.log("Initial load - currentLocation:", currentLocation);

//         if (primaryAddress && primaryAddress !== "null") {
//           const parsedPrimary = JSON.parse(primaryAddress);
//           // console.log(
//           //   "Initial load - setting address from primaryAddress:",
//           //   parsedPrimary
//           // );
//           setAddress(parsedPrimary);
//         } else if (currentLocation && currentLocation !== "null") {
//           const parsedCurrent = JSON.parse(currentLocation);
//           // console.log(
//           //   "Initial load - setting address from currentLocation:",
//           //   parsedCurrent
//           // );
//           setAddress(parsedCurrent);
//         } else {
//           console.log("Initial load - no address found");
//           setAddress(null);
//         }
//       } catch (error) {
//         console.error("Error loading initial address:", error);
//         setAddress(null);
//       }
//     };

//     loadInitialAddress();
//   }, []);

//   // console.log(address, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

//   // Add a function to refresh address from localStorage
//   const refreshAddress = useCallback(() => {
//     try {
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const currentLocation = localStorage.getItem("currentLocation");

//       // console.log("Refreshing address - primaryAddress:", primaryAddress);
//       // console.log("Refreshing address - currentLocation:", currentLocation);

//       // Clear manual location flag if no addresses are found
//       if (
//         (!primaryAddress || primaryAddress === "null") &&
//         (!currentLocation || currentLocation === "null")
//       ) {
//         console.log("No addresses found");
//       }

//       if (primaryAddress && primaryAddress !== "null") {
//         const parsedPrimary = JSON.parse(primaryAddress);
//         // console.log("Setting address from primaryAddress:", parsedPrimary);
//         setAddress(parsedPrimary);
//       } else if (currentLocation && currentLocation !== "null") {
//         const parsedCurrent = JSON.parse(currentLocation);
//         // console.log("Setting address from currentLocation:", parsedCurrent);
//         setAddress(parsedCurrent);
//       } else {
//         console.log("No address found, setting to null");
//         setAddress(null);
//       }
//     } catch (error) {
//       console.error("Error refreshing address:", error);
//       setAddress(null);
//     }
//   }, []);

//   // Listen for location updates from Banner
//   useEffect(() => {
//     const handleLocationUpdated = () => {
//       console.log("Location updated event received");
//       refreshAddress();
//     };

//     const handleAddressUpdated = () => {
//       console.log("Address updated event received");
//       refreshAddress();
//     };

//     const handleAddressAdded = () => {
//       console.log("Address added event received");
//       refreshAddress();
//     };

//     const handleFocus = () => {
//       console.log("Window focus event - refreshing address");
//       refreshAddress();
//     };

//     // Listen for all location/address related events
//     window.addEventListener("locationUpdated", handleLocationUpdated);
//     window.addEventListener("addressUpdated", handleAddressUpdated);
//     window.addEventListener("addressAdded", handleAddressAdded);
//     window.addEventListener("focus", handleFocus);

//     // Also listen for localStorage changes
//     const handleStorageChange = (e) => {
//       if (e.key === "currentLocation" || e.key === "primaryAddress") {
//         // console.log("localStorage change detected for:", e.key);
//         refreshAddress();
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);

//     // Add periodic check to ensure address stays in sync
//     const intervalId = setInterval(() => {
//       refreshAddress();
//     }, 2000); // Check every 2 seconds

//     return () => {
//       window.removeEventListener("locationUpdated", handleLocationUpdated);
//       window.removeEventListener("addressUpdated", handleAddressUpdated);
//       window.removeEventListener("addressAdded", handleAddressAdded);
//       window.removeEventListener("focus", handleFocus);
//       window.removeEventListener("storage", handleStorageChange);
//       clearInterval(intervalId);
//     };
//   }, [refreshAddress]);

//   // Removed: useEffect that depends on user - moved to after user declaration

//   // --- DATE & SESSION STATE ---
//   const getNormalizedToday = () => {
//     const now = new Date();
//     return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
//   };

//   const [selectedDate, setSelectedDate] = useState(() => {
//     if (location.state?.targetDate) return new Date(location.state.targetDate);
//     return getNormalizedToday();
//   });

//   const [selectedSession, setSelectedSession] = useState(() => {
//     if (location.state?.targetSession) return location.state.targetSession;
//     return "Lunch";
//   });

//   // State for location popup
//   const [showLocationPopup, setShowLocationPopup] = useState(false);

//   const handleSelectionChange = (date1, session1) => {
//     // console.log("Selection changed:", date1, session1);
//     setSelectedDate(date1);
//     setSelectedSession(session1);
//     // Reset category to All when session changes to avoid empty states
//     setSelectedCategory("All");
//     window.scrollTo(0, 0);
//   };

//   // Check if user is logged in but has no address selected
//   useEffect(() => {
//     if (user && !address) {
//       // Show popup after a short delay to ensure page is loaded
//       const timer = setTimeout(() => {
//         setShowLocationPopup(true);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [user, address]);

//   // Add location detection for users coming from splash screen
//   useEffect(() => {
//     const checkLocationPermission = async () => {
//       // Only run this check if user has no address data at all
//       const currentLocation = localStorage.getItem("currentLocation");
//       const primaryAddress = localStorage.getItem("primaryAddress");

//       // If user has any address data, don't redirect
//       if (currentLocation || primaryAddress || address) {
//         return;
//       }

//       // Check if browser supports geolocation
//       if (navigator.geolocation && navigator.permissions) {
//         try {
//           const permission = await navigator.permissions.query({
//             name: "geolocation",
//           });

//           if (permission.state === "denied" || permission.state === "prompt") {
//             // Permission denied or will prompt, redirect to modal
//             navigate("/location-permission");
//             return;
//           }

//           // If permission is granted but we still don't have location, let user stay on home
//           // They can use the location selection in the banner
//         } catch (error) {
//           // Permissions API not supported, let user stay on home
//           console.error("Permissions API error:", error);
//         }
//       }
//       // If geolocation not supported, let user stay on home
//     };

//     // Run the check after component mounts, but only once
//     const timer = setTimeout(checkLocationPermission, 500);
//     return () => clearTimeout(timer);
//   }, []); // Remove dependencies to prevent re-running

//   // --- 1. FETCH DATA (Only when Hub Changes) ---
//   // useEffect(() => {
//   //   if (!address || !address.hubId) {
//   //     setAllHubMenuData([]);
//   //     setloader(false);
//   //     return;
//   //   }

//   //   const fetchAllMenuData = async () => {
//   //     setloader(true);
//   //     try {
//   //       const res = await axios.get(
//   //         "http://localhost:7013/api/user/get-hub-menu",
//   //         {
//   //           params: {
//   //             hubId: address.hubId,
//   //           },
//   //         }
//   //       );

//   //       if (res.status === 200) {
//   //         setAllHubMenuData(res.data.menu);
//   //       } else {
//   //         setAllHubMenuData([]);
//   //       }
//   //     } catch (error) {
//   //       console.log(error);
//   //       setAllHubMenuData([]);
//   //     } finally {
//   //       setloader(false);
//   //     }
//   //   };

//   //   fetchAllMenuData();
//   // }, [address?.hubId]);

//   // Update the fetch menu effect to depend on address?.hubId
//   useEffect(() => {
//     if (!address || !address.hubId) {
//       setAllHubMenuData([]);
//       setloader(false);
//       return;
//     }

//     const fetchAllMenuData = async () => {
//       setloader(true);
//       try {
//         // console.log("Fetching menu for hub:", address.hubId);

//         const res = await axios.get(
//           "http://localhost:7013/api/user/get-hub-menu",
//           {
//             params: {
//               hubId: address.hubId,
//             },
//           },
//         );

//         if (res.status === 200) {
//           // console.log("Menu data received:", res.data.menu.length, "items");
//           setAllHubMenuData(res.data.menu);
//         } else {
//           setAllHubMenuData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching menu:", error);
//         setAllHubMenuData([]);
//       } finally {
//         setloader(false);
//       }
//     };

//     fetchAllMenuData();
//   }, [address?.hubId]); // This will re-run whenever hubId changes

//   const handleLocationDetected = useCallback((newLocation) => {
//     // console.log("Location detected from Banner:", newLocation);

//     // Don't override manual selection - removed check for locationManuallySelected
//     // console.log("Manual location flag:", manualLocationFlag);

//     // console.log("Setting new location from Banner:", newLocation);
//     setAddress(newLocation);

//     // Save to localStorage for persistence
//     if (newLocation) {
//       localStorage.setItem("currentLocation", JSON.stringify(newLocation));
//     }

//     // Dispatch event for other components
//     window.dispatchEvent(new Event("locationUpdated"));
//   }, []);

//   // --- 2. CORE FILTERING LOGIC (The "Magic" Part) ---

//   // A. Get items for the selected Date & Session
//   const currentSlotItems = useMemo(() => {
//     if (!allHubMenuData?.length) return [];
//     const selectedDateISO = selectedDate.toISOString();

//     return allHubMenuData.filter(
//       (item) =>
//         item.deliveryDate === selectedDateISO &&
//         item.session === selectedSession,
//     );
//   }, [allHubMenuData, selectedDate, selectedSession]);

//   // B. Filter those items by "Veg Only" toggle
//   const vegFilteredItems = useMemo(() => {
//     if (isVegOnly) {
//       return currentSlotItems.filter((item) => item.foodcategory === "Veg");
//     }
//     return currentSlotItems;
//   }, [currentSlotItems, isVegOnly]);

//   // C. Derive Categories dynamically from the VALID items (Step B)
//   // This ensures we ONLY show categories that actually have items to show.
//   const dynamicTabs = useMemo(() => {
//     // Extract unique categories
//     const categories = new Set(
//       vegFilteredItems.map((item) => item.menuCategory),
//     );
//     // Remove undefined/null and sort
//     const uniqueCats = [...categories].filter(Boolean).sort();
//     return ["All", ...uniqueCats];
//   }, [vegFilteredItems]);

//   // D. Final List: Filter by the Selected Tab
//   const finalDisplayItems = useMemo(() => {
//     if (selectedCategory === "All") return vegFilteredItems;
//     return vegFilteredItems.filter(
//       (item) => item.menuCategory === selectedCategory,
//     );
//   }, [vegFilteredItems, selectedCategory]);

//   const isSameDay = (d1, d2) => {
//     const a = new Date(d1);
//     const b = new Date(d2);
//     a.setHours(0, 0, 0, 0);
//     b.setHours(0, 0, 0, 0);
//     return a.getTime() === b.getTime();
//   };
//   const isFutureDate = (deliveryDate) => {
//     const today = new Date();
//     return !isSameDay(deliveryDate, today) && new Date(deliveryDate) > today;
//   };

//   // Helper: enforce cutoff for Lunch (10am) and Dinner (5pm)
//   const isBeforeCutoff = (deliveryDate, session) => {
//     if (!deliveryDate || !session) return false;
//     const now = new Date();
//     const delivery = new Date(deliveryDate);
//     delivery.setHours(0, 0, 0, 0);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     if (delivery.getTime() > today.getTime()) return true; // future date
//     if (delivery.getTime() < today.getTime()) return false; // past
//     if (session.toLowerCase() === "lunch") {
//       return now.getHours() < 10;
//     }
//      if (session.toLowerCase() === "dinner") {
//       return now.getHours() < 17;
//     }
//     return false;
//   };

//   // console.log(address, "address");
//   // Helper: always use preorder price if available and before cutoff
//   const getEffectivePrice = (item, matchedLocation, session) => {
//     const hubPrice =
//       (matchedLocation &&
//         (matchedLocation.hubPrice || matchedLocation.basePrice)) ||
//       item?.hubPrice ||
//       item?.basePrice ||
//       0;
//     const preOrderPrice =
//       (matchedLocation &&
//         (matchedLocation.preOrderPrice || matchedLocation.preorderPrice)) ||
//       item?.preOrderPrice ||
//       item?.preorderPrice ||
//       0;
//     const beforeCutoff = isBeforeCutoff(
//       item?.deliveryDate || item?.deliveryDateISO,
//       session,
//     );
//     if (beforeCutoff && preOrderPrice > 0) return { price: preOrderPrice };
//     return { price: hubPrice };
//   };

//   const [cartCount, setCartCount] = useState(0);
//   const [isCartVisible, setIsCartVisible] = useState(false);

//   const handleShow = () => {
//     setCartCount(cartCount + 1);
//     setIsCartVisible(true);
//   };

//   const [foodData, setFoodData] = useState({});
//   const [open, setOpen] = useState(false);

//   const showDrawer = (food) => {
//     setFoodData(food);
//     setOpen(true);
//   };
//   const onClose = () => {
//     setOpen(false);
//   };

//   // Add body class when drawer is open to control z-index of other elements
//   useEffect(() => {
//     if (open) {
//       document.body.classList.add("drawer-open");
//     } else {
//       document.body.classList.remove("drawer-open");
//     }

//     // Cleanup on unmount
//     return () => {
//       document.body.classList.remove("drawer-open");
//     };
//   }, [open]);
//   const [show4, setShow4] = useState(false);
//   const handleClose4 = () => setShow4(false);
//   const [show3, setShow3] = useState(false);
//   const handleClose3 = () => setShow3(false);
//   const [show2, setShow2] = useState(false);
//   const handleClose2 = () => setShow2(false);
//   const handleShow2 = () => setShow2(true);

//   // const user = JSON.parse(localStorage.getItem("user"));

//   // Refresh address when user logs in/out
//   useEffect(() => {
//     // console.log("User state changed, refreshing address");
//     refreshAddress();
//   }, [user]);

//   const addCart1 = async (item, checkOf, matchedLocation) => {
//     // Enforce cutoff for adding to cart
//     if (!isBeforeCutoff(selectedDate, selectedSession)) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Cutoff time passed. Cannot add to cart.`,
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
//     if (!matchedLocation || matchedLocation?.Remainingstock === 0) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Product is out of stock`,
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

//     // if (checkOf && !user) {
//     //   Swal2.fire({
//     //     toast: true,
//     //     position: "bottom",
//     //     icon: "info",
//     //     title: `Please login!`,
//     //     showConfirmButton: false,
//     //     timer: 3000,
//     //     timerProgressBar: true,
//     //     customClass: {
//     //       popup: "me-small-toast",
//     //       title: "me-small-toast-title",
//     //     },
//     //   });
//     //   return;
//     // }

//     // determine applied price
//     const eff = getEffectivePrice(item, matchedLocation, selectedSession);
//     const appliedPrice = checkOf ? checkOf?.price : eff.price;

//     const newCartItem = {
//       deliveryDate: new Date(selectedDate).toISOString(),
//       session: selectedSession,
//       foodItemId: item?._id,
//       price: appliedPrice,
//       totalPrice: appliedPrice,
//       image: item?.Foodgallery[0]?.image2,
//       unit: item?.unit,
//       foodname: item?.foodname,
//       quantity: item?.quantity,
//       Quantity: 1,
//       gst: item?.gst,
//       discount: item?.discount,
//       foodcategory: item?.foodcategory,
//       remainingstock: matchedLocation?.Remainingstock,
//       offerProduct: !!checkOf,
//       minCart: checkOf?.minCart || 0,
//       actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//       offerQ: 1,
//       basePrice: matchedLocation?.basePrice || item?.basePrice || 0,
//       hubPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//       preOrderPrice: matchedLocation?.preOrderPrice || item?.preOrderPrice || 0,
//     };

//     const cart = JSON.parse(localStorage.getItem("cart"));
//     const cartArray = Array.isArray(cart) ? cart : [];

//     // Find item IN THE CURRENT SLOT
//     const itemIndex = cartArray.findIndex(
//       (cartItem) =>
//         cartItem?.foodItemId === newCartItem?.foodItemId &&
//         cartItem.deliveryDate === newCartItem.deliveryDate &&
//         cartItem.session === newCartItem.session,
//     );

//     if (itemIndex === -1) {
//       cartArray.push(newCartItem);
//       localStorage.setItem("cart", JSON.stringify(cartArray));
//       setCarts(cartArray);
//       handleShow();
//     } else {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Item is already in this slot's cart`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const [cart, setCart] = useState([]);

//   useEffect(() => {
//     const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
//     setCart(storedCart);

//     const addonedCarts = async () => {
//       try {
//         await axios.post("http://localhost:7013/api/cart/addCart", {
//           userId: user?._id,
//           items: storedCart,
//           lastUpdated: Date.now,
//           username: user?.Fname,
//           mobile: user?.Mobile,
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     if (Carts && Carts.length > 0 && user?._id) {
//       addonedCarts();
//     }
//   }, [JSON.stringify(Carts), user?._id]);

//   const updateCartData = (updatedCart) => {
//     // console.log("Updating cart data:", updatedCart);
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//     setCart(updatedCart);
//     setCarts(updatedCart);
//   };

//   const increaseQuantity = (foodItemId, checkOf, item, matchedLocation) => {
//     const maxStock = matchedLocation?.Remainingstock || 0;
//     const selectedDateISO = selectedDate.toISOString();
//     // const isPreOrder = isFutureDate(selectedDate);
//     if (!checkOf) {
//       if (!isBeforeCutoff(selectedDate, selectedSession)) {
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "info",
//           title: `Cutoff time passed. Cannot increase quantity.`,
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//         return;
//       }
//       const updatedCart = Carts.map((cartItem) => {
//         if (
//           cartItem.foodItemId === foodItemId &&
//           cartItem.deliveryDate === selectedDateISO &&
//           cartItem.session === selectedSession &&
//           !cartItem.extra
//         ) {
//           if (cartItem.Quantity < maxStock) {
//             return {
//               ...cartItem,
//               Quantity: cartItem.Quantity + 1,
//               totalPrice: cartItem.price * (cartItem.Quantity + 1),
//             };
//           } else {
//             Swal2.fire({
//               toast: true,
//               position: "bottom",
//               icon: "info",
//               title: `No more stock available!`,
//               showConfirmButton: false,
//               timer: 3000,
//               timerProgressBar: true,
//               customClass: {
//                 popup: "me-small-toast",
//                 title: "me-small-toast-title",
//               },
//             });
//           }
//         }
//         return cartItem;
//       });
//       updateCartData(updatedCart);
//     } else {
//       const offerPr = Carts.find(
//         (ele) =>
//           ele.foodItemId == foodItemId &&
//           ele.deliveryDate === selectedDate.toISOString() &&
//           ele.session === selectedSession &&
//           !ele.extra,
//       );

//       if (offerPr && offerPr.offerQ > offerPr.Quantity) {
//         const updatedCart = Carts.map((cartItem) => {
//           if (
//             cartItem.foodItemId === foodItemId &&
//             cartItem.deliveryDate === selectedDateISO &&
//             cartItem.session === selectedSession &&
//             !cartItem.extra
//           ) {
//             if (cartItem.Quantity < maxStock) {
//               return {
//                 ...cartItem,
//                 Quantity: cartItem.Quantity + 1,
//                 totalPrice: cartItem.price * (cartItem.Quantity + 1),
//               };
//             } else {
//               Swal2.fire({
//                 toast: true,
//                 position: "bottom",
//                 icon: "info",
//                 title: `No more stock available!`,
//                 showConfirmButton: false,
//                 timer: 3000,
//                 timerProgressBar: true,
//                 customClass: {
//                   popup: "me-small-toast",
//                   title: "me-small-toast-title",
//                 },
//               });
//             }
//           }
//           return cartItem;
//         });

//         updateCartData(updatedCart);
//       } else {
//         const offerPrXt = Carts?.find(
//           (ele) =>
//             ele.foodItemId === foodItemId &&
//             ele.deliveryDate === selectedDate.toISOString() &&
//             ele.session === selectedSession &&
//             ele.extra === true,
//         );

//         if (offerPrXt) {
//           const updatedCart = Carts.map((cartItem) => {
//             if (
//               cartItem.foodItemId === foodItemId &&
//               cartItem.deliveryDate === selectedDateISO &&
//               cartItem.session === selectedSession &&
//               cartItem.extra === true
//             ) {
//               if (cartItem.Quantity < maxStock) {
//                 return {
//                   ...cartItem,
//                   Quantity: cartItem.Quantity + 1,
//                   totalPrice: cartItem.price * (cartItem.Quantity + 1),
//                 };
//               } else {
//                 Swal2.fire({
//                   toast: true,
//                   position: "bottom",
//                   icon: "info",
//                   title: `No more stock available!`,
//                   showConfirmButton: false,
//                   timer: 3000,
//                   timerProgressBar: true,
//                   customClass: {
//                     popup: "me-small-toast",
//                     title: "me-small-toast-title",
//                   },
//                 });
//               }
//             }
//             return cartItem;
//           });

//           updateCartData(updatedCart);
//         } else {
//           const effNew = getEffectivePrice(
//             item,
//             matchedLocation,
//             selectedSession,
//             true,
//           );
//           updateCartData([
//             ...Carts,
//             {
//               deliveryDate: selectedDate.toISOString(),
//               session: selectedSession,
//               foodItemId: item?._id,
//               price: effNew.price,
//               totalPrice: effNew.price,
//               image: item?.Foodgallery[0]?.image2,
//               unit: item?.unit,
//               foodname: item?.foodname,
//               quantity: item?.quantity,
//               Quantity: 1,
//               gst: item?.gst,
//               discount: item?.discount,
//               foodcategory: item?.foodcategory,
//               remainingstock: maxStock,
//               offerProduct: false,
//               minCart: 0,
//               actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//               offerQ: 0,
//               extra: true,
//             },
//           ]);
//         }
//       }
//     }
//   };

//   const [show, setShow] = useState(true);
//   const [expiryDays, setExpiryDays] = useState(0);

//   const decreaseQuantity = (foodItemId, checkOf, matchedLocation) => {
//     const selectedDateISO = selectedDate.toISOString();
//     if (!checkOf) {
//       const updatedCart = Carts.map((item) => {
//         if (
//           item.foodItemId === foodItemId &&
//           item.Quantity > 0 &&
//           item.deliveryDate === selectedDateISO &&
//           item.session === selectedSession &&
//           !item.extra
//         ) {
//           return {
//             ...item,
//             Quantity: item.Quantity - 1,
//             totalPrice: item.price * (item.Quantity - 1),
//           };
//         }
//         return item;
//       }).filter((item) => item.Quantity > 0);

//       updateCartData(updatedCart);
//     } else {
//       const offerPr = Carts.find(
//         (ele) =>
//           ele.foodItemId == foodItemId &&
//           ele.deliveryDate === selectedDate.toISOString() &&
//           ele.session === selectedSession &&
//           !ele.extra,
//       );

//       if (offerPr && offerPr.offerQ > offerPr.Quantity) {
//         // Handle regular offer item decrease
//         const updatedCart = Carts.map((item) => {
//           if (
//             item.foodItemId === foodItemId &&
//             item.Quantity > 0 &&
//             item.deliveryDate === selectedDateISO &&
//             item.session === selectedSession &&
//             !item.extra
//           ) {
//             const newQuantity = item.Quantity - 1;
//             // Calculate offer price correctly
//             let newTotalPrice;
//             if (newQuantity <= offerPr.offerQ) {
//               newTotalPrice = offerPr.price * newQuantity;
//             } else {
//               newTotalPrice = offerPr.actualPrice * newQuantity;
//             }

//             return {
//               ...item,
//               Quantity: newQuantity,
//               totalPrice: newTotalPrice,
//             };
//           }
//           return item;
//         }).filter((item) => item.Quantity > 0);

//         updateCartData(updatedCart);
//       } else {
//         // Handle extra item decrease
//         const offerExtraItem = Carts?.find(
//           (ele) =>
//             ele.foodItemId === foodItemId &&
//             ele.deliveryDate === selectedDate.toISOString() &&
//             ele.session === selectedSession &&
//             ele.extra === true,
//         );

//         if (offerExtraItem) {
//           const updatedCart = Carts.map((item) => {
//             if (
//               item.foodItemId === foodItemId &&
//               item.extra === true &&
//               item.Quantity > 0 &&
//               item.deliveryDate === selectedDateISO &&
//               item.session === selectedSession
//             ) {
//               return {
//                 ...item,
//                 Quantity: item.Quantity - 1,
//                 totalPrice: item.price * (item.Quantity - 1),
//               };
//             }
//             return item;
//           }).filter((item) => item.Quantity > 0);

//           updateCartData(updatedCart);
//         } else {
//           const updatedCart = Carts.map((item) => {
//             if (
//               item.foodItemId === foodItemId &&
//               item.Quantity > 0 &&
//               item.deliveryDate === selectedDateISO &&
//               item.session === selectedSession
//             ) {
//               return {
//                 ...item,
//                 Quantity: item.Quantity - 1,
//                 totalPrice: item.price * (item.Quantity - 1),
//               };
//             }
//             return item;
//           }).filter((item) => item.Quantity > 0);

//           updateCartData(updatedCart);
//         }
//       }
//     }
//   };

//   const isAddressReady = () => {
//     const addresstype1 = localStorage.getItem("addresstype");
//     if (!addresstype1) return false;

//     const addressKey =
//       addresstype1 === "apartment" ? "address" : "coporateaddress";
//     const addressRaw = localStorage.getItem(addressKey);

//     if (!addressRaw) return false;

//     try {
//       const address1 = JSON.parse(addressRaw);
//       if (!address1) return false;

//       const apartmentname =
//         address1?.apartmentname || address1?.Apartmentname || "";
//       const addressField = address1?.Address || address1?.address || "";
//       const pincode = address1?.pincode || "";

//       return apartmentname && addressField && pincode;
//     } catch (error) {
//       return false;
//     }
//   };

//   useEffect(() => {
//     if (Carts?.length > 0) {
//       handleShow();
//     }
//     if (isAddressReady() && user?._id) {
//       getAllOffer();
//     }
//   }, [user?._id, address?.apartmentname]);

//   const groupedCarts = useMemo(() => {
//     if (!Carts || Carts.length === 0) return [];
//     const groups = Carts.reduce((acc, item) => {
//       const key = `${item.deliveryDate}|${item.session}`;

//       if (!item.deliveryDate || !item.session) return acc;

//       if (!acc[key]) {
//         acc[key] = {
//           session: item.session,
//           date: new Date(item.deliveryDate),
//           totalItems: 0,
//           subtotal: 0,
//           items: [],
//         };
//       }

//       acc[key].totalItems += item.Quantity;
//       acc[key].subtotal += item.price * item.Quantity;
//       acc[key].items.push(item);

//       return acc;
//     }, {});

//     return Object.values(groups).sort((a, b) => a.date - b.date);
//   }, [Carts]);

//   const overallTotalItems = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.totalItems, 0);
//   }, [groupedCarts]);

//   const overallSubtotal = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.subtotal, 0);
//   }, [groupedCarts]);
//   // console.log(address.location?.coordinates,'sfsdfdsf')
//   const proceedToPlan = async () => {
//     // console.log("🚀 proceedToPlan called");
//     // console.log("🚀 user:", user);
//     // console.log("🚀 Carts.length:", Carts.length);
//     // console.log("🚀 address:", address);

//     if (!user) {
//       console.log("❌ proceedToPlan - No user");
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Please Login!`,
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
//     if (Carts.length === 0) {
//       console.log("❌ proceedToPlan - No cart items");
//       return;
//     }

//     if (!address) {
//       console.log("❌ proceedToPlan - No address");
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Please Select Address!`,
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
//     // console.log("✅ proceedToPlan - All checks passed, proceeding...");
//     setloader(true);
//     try {
//       const addressDetails = {
//         addressId: address._id || "",
//         addressline: `${address.fullAddress}`,
//         addressType: address.addressType || "",
//         coordinates: address.location?.coordinates || [0, 0],
//         hubId: address.hubId || "",
//         hubName: address.hubName || "",
//         studentInformation: address.studentInformation,
//         schoolName: address.schoolName || "",
//         houseName: address.houseName || "",
//         apartmentName: address.apartmentName || "",
//         companyName: address.companyName || "",

//         companyId: address.companyId || "",
//         customerType: user.status || "",
//       };

//       // console.log("🚀 proceedToPlan - Making API call with:", {
//       //   userId: user._id,
//       //   mobile: user.Mobile,
//       //   username: user.Fname,
//       //   itemsCount: Carts.length,
//       //   addressDetails: addressDetails,
//       // });

//       const res = await axios.post(
//         "http://localhost:7013/api/user/plan/add-to-plan",
//         {
//           userId: user._id,
//           mobile: user.Mobile,
//           username: user.Fname,
//           companyId: user?.companyId || "",
//           items: Carts,
//           addressDetails: addressDetails,
//         },
//       );

//       // console.log("🚀 proceedToPlan - API response:", res.status);

//       if (res.status === 200) {
//         // console.log(
//         //   "✅ proceedToPlan - Success! Clearing cart and navigating to /my-plan"
//         // );
//         localStorage.removeItem("cart");
//         setCarts([]);
//         navigate("/my-plan");
//       }
//     } catch (error) {
//       console.error("❌ proceedToPlan - Error:", error);
//     } finally {
//       setloader(false);
//     }
//   };

//   const [gifUrl, setGifUrl] = useState("");
//   const [message, setMessage] = useState("");
//   const [AllOffer, setAllOffer] = useState([]);

//   const getAllOffer = async () => {
//     try {
//       const addresstype1 = localStorage.getItem("addresstype");
//       const addressRaw = localStorage.getItem(
//         addresstype1 === "apartment" ? "address" : "coporateaddress",
//       );

//       if (!addressRaw) return;

//       let address1;
//       try {
//         address1 = JSON.parse(addressRaw);
//       } catch (parseError) {
//         return;
//       }

//       if (!address1) return;

//       const apartmentname =
//         address1?.apartmentname || address1?.Apartmentname || "";
//       const addressField = address1?.Address || address1?.address || "";
//       const pincode = address1?.pincode || "";

//       if (!apartmentname || !addressField || !pincode) return;

//       const location = `${apartmentname}, ${addressField}, ${pincode}`;

//       if (user?._id && location) {
//         const response = await axios.put(
//           "http://localhost:7013/api/admin/getuseroffer",
//           {
//             id: user._id,
//             location,
//             addressRaw,
//             selectArea,
//           },
//         );

//         if (response.status === 200 && response.data?.data) {
//           setAllOffer(response.data.data);
//         }
//       }
//     } catch (error) {
//       // console.log("getAllOffer error:", error);
//       setAllOffer([]);
//     }
//   };

//   useEffect(() => {
//     const checkTime = () => {
//       const now = new Date();
//       const currentTimeInMinutes = 10 * 60 + now.getMinutes();
//       const lunchStart = 7 * 60;
//       const lunchPrepStart = 9 * 60;
//       const lunchCookingStart = 11 * 60;
//       const lunchEnd = 14 * 60;

//       const dinnerStart = 14 * 60;
//       const dinnerPrepStart = 16 * 60 + 30;
//       const dinnerCookingStart = 18 * 60;
//       const dinnerEnd = 21 * 60;

//       const shopCloseTime = 21 * 60;

//       if (
//         currentTimeInMinutes >= lunchStart &&
//         currentTimeInMinutes < lunchPrepStart
//       ) {
//         setGifUrl("sourcing.gif");
//         setMessage(
//           "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= lunchPrepStart &&
//         currentTimeInMinutes < lunchCookingStart
//       ) {
//         setGifUrl("cuttingveg.gif");
//         setMessage(
//           "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= lunchCookingStart &&
//         currentTimeInMinutes < lunchEnd
//       ) {
//         setGifUrl("cookinggif.gif");
//         setMessage(
//           "Cooking your meal. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerStart &&
//         currentTimeInMinutes < dinnerPrepStart
//       ) {
//         setGifUrl("sourcing.gif");
//         setMessage(
//           "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerPrepStart &&
//         currentTimeInMinutes < dinnerCookingStart
//       ) {
//         setGifUrl("cuttingveg.gif");
//         setMessage(
//           "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerCookingStart &&
//         currentTimeInMinutes <= dinnerEnd
//       ) {
//         setGifUrl("cookinggif.gif");
//         setMessage(
//           "Cooking your meal. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (currentTimeInMinutes >= shopCloseTime) {
//         setGifUrl("Closed.gif");
//         setMessage(
//           "The Store is now closed. Operating hours: Lunch: 7:00 AM - 02:00 PM, Dinner: 2:00 PM - 9:00 PM.",
//         );
//       } else {
//         setGifUrl("Closed.gif");
//         setMessage(
//           "Orders are currently closed. Lunch: 7:00 AM - 02:00 PM. Dinner: 2:00 PM - 9:00 PM.",
//         );
//       }
//     };
//     checkTime();
//     const interval = setInterval(checkTime, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const [Fname, setFname] = useState("");
//   const [Mobile, setMobile] = useState("");
//   const [OTP, setOTP] = useState(["", "", "", ""]);
//   const [PasswordShow, setPasswordShow] = useState(false);

//   const userLogin = async () => {
//     if (!Mobile) {
//       return Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Enter Your Mobile Number`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//     setloader(true);
//     try {
//       const config = {
//         url: "/User/Sendotp",
//         method: "post",
//         baseURL: "http://localhost:7013/api",

//         headers: { "content-type": "application/json" },
//         data: {
//           Mobile: Mobile,
//         },
//       };

//       const res = await axios(config);
//       if (res.status === 401) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Invalid Mobile Number`,
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
//           title: `Something went wrong`,
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
//         setloader(false);
//         handleClose3();
//         handleShow2();
//       }
//     } catch (error) {
//       setloader(false);
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   function validateIndianMobileNumber(mobileNumber) {
//     const regex = /^[6-9]\d{9}$/;
//     return regex.test(mobileNumber);
//   }

//   const verifyOTP = async () => {
//     try {
//       if (!OTP) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Enter a valid OTP`,
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//       const config = {
//         url: "User/mobileotpverification",
//         method: "post",
//         baseURL: "http://localhost:7013/api/",
//         header: { "content-type": "application/json" },
//         data: {
//           Mobile: Mobile,
//           otp: OTP,
//         },
//       };
//       const res = await axios(config);
//       if (res.status === 200) {
//         updateUser(res.data.details);
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "success",
//           title: `OTP verified successfully`,
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });

//         if (!address) {
//           handleClose2();
//           handleClose3();
//           return navigate("/");
//         }
//         navigate("/");
//         handleClose2();
//         setOTP("");
//         setMobile("");
//       }
//     } catch (error) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const getCartQuantity = (itemId) => {
//     const selectedDateISO = selectedDate.toISOString();
//     return Carts?.filter(
//       (cartItem) =>
//         cartItem?.foodItemId === itemId &&
//         cartItem.deliveryDate === selectedDateISO &&
//         cartItem.session === selectedSession,
//     )?.reduce((total, curr) => total + curr?.Quantity, 0);
//   };

//   // Automatically remove today's Lunch/Dinner cart items after cutoff times
//   useEffect(() => {
//     if (!Carts || !setCarts) return;
//     const toKey = (date) => new Date(date).toISOString().slice(0, 10);
//     const cleanup = () => {
//       const now = new Date();
//       const todayKey = toKey(now);
//       let removed = [];
//       const shouldRemove = (item) => {
//         if (!item) return false;
//         const dateVal =
//           item.deliveryDate ||
//           item.date ||
//           item.slotDate ||
//           item.deliveryDateString;
//         const sessionVal = (
//           item.session ||
//           item.slotSession ||
//           item.mealSession ||
//           ""
//         ).toString();
//         if (!dateVal || !sessionVal) return false;
//         const itemKey = toKey(dateVal);
//         if (itemKey !== todayKey) return false;
//         // Remove if after cutoff
//         return !isBeforeCutoff(dateVal, sessionVal);
//       };
//       const newCarts = [];
//       Carts.forEach((it) => {
//         if (shouldRemove(it)) {
//           removed.push(it);
//         } else {
//           newCarts.push(it);
//         }
//       });
//       if (removed.length > 0) {
//         setCarts(newCarts);
//       }
//     };
//     cleanup();
//     const id = setInterval(cleanup, 60 * 5000);
//     return () => clearInterval(id);
//   }, [Carts, setCarts]);

//   const lastCartRawRef = useRef(null);
//   useEffect(() => {
//     const readCart = () => {
//       try {
//         const raw = localStorage.getItem("cart") || "[]";
//         if (raw !== lastCartRawRef.current) {
//           lastCartRawRef.current = raw;
//           const parsed = JSON.parse(raw);
//           setCarts(Array.isArray(parsed) ? parsed : []);
//           setCart(Array.isArray(parsed) ? parsed : []);
//         }
//       } catch (err) {
//         console.error("cart sync error", err);
//       }
//     };

//     readCart();
//     const intervalId = setInterval(readCart, 1000); // same-tab updates
//     const onStorage = (e) => {
//       if (e.key === "cart") readCart();
//     };
//     const onCartUpdated = () => readCart(); // custom event from Checkout
//     window.addEventListener("storage", onStorage);
//     window.addEventListener("cart_updated", onCartUpdated);

//     return () => {
//       clearInterval(intervalId);
//       window.removeEventListener("storage", onStorage);
//       window.removeEventListener("cart_updated", onCartUpdated);
//     };
//   }, [setCarts]);

//   // Remove auto-proceed to MyPlan logic - users should manually click "Move to My Plans"
//   // This prevents unwanted navigation to MyPlan when users add location after adding items
//   useEffect(() => {
//     // Clean up any leftover flags
//     localStorage.removeItem("triggerProceedToPlan");
//     sessionStorage.removeItem("justAddedAddress");
//   }, []);

//   // Render DateSessionSelector inline (no JS sticky in Home)
//   // The selector itself will handle sticky behavior if needed.

//   return (
//     <div>
//       <ToastContainer />

//       <div>
//         <Banner
//           Carts={Carts}
//           getAllOffer={getAllOffer}
//           isVegOnly={isVegOnly}
//           setIsVegOnly={setIsVegOnly}
//           onLocationDetected={handleLocationDetected} // Add this prop
//         />
//       </div>

//       {wallet?.balance > 0 && show && (
//         <div style={{ position: "relative" }}>
//           {/* DISABLED OVERLAY — visible + fully blocks interaction */}
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 backgroundColor: "#f9f8f6",
//                 opacity: 1,
//                 zIndex: 20,
//                 pointerEvents: "auto",
//               }}
//             ></div>
//           )}

//           {/* CONTENT */}
//           <CoinBalance
//             wallet={wallet}
//             transactions={transactions}
//             expiryDays={expiryDays}
//             setExpiryDays={setExpiryDays}
//             setShow={setShow}
//           />
//         </div>
//       )}

//       {/* Header for Date/Session selector (no sticky here) */}
//       <div className="sticky-menu-header" style={{ position: "relative" }}>
//         <div style={{ position: "relative" }}>
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 backgroundColor: "#f9f8f6",
//                 zIndex: 10,
//                 pointerEvents: "none",
//                 opacity: 0.8,
//               }}
//             ></div>
//           )}
//           <DateSessionSelector
//             onChange={handleSelectionChange}
//             currentDate={selectedDate}
//             currentSession={selectedSession}
//             menuData={allHubMenuData}
//           />
//         </div>
//       </div>

//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "#f9f8f6",
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.8,
//             }}
//           ></div>
//         )}
//         <Container>
//           <RatingModal />

//           {AllOffer?.length > 0 ? (
//             <div className="maincontainer">
//               <div
//                 className="d-flex gap-3 mb-2 messageDiv  rounded-2 mt-3 justify-content-center"
//                 style={{
//                   backgroundColor: "white",
//                   padding: "5px",
//                   height: "50px",
//                 }}
//               >
//                 <p
//                   className="mb-0 typewriter-desc"
//                   style={{
//                     color: "#6B8E23",
//                     fontSize: "1rem",
//                     textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
//                     lineHeight: "1.6",
//                     textAlign: "center",
//                   }}
//                 >
//                   🥳 {AllOffer[0]?.foodname} @ Just ₹{AllOffer[0]?.price}
//                 </p>
//               </div>
//             </div>
//           ) : null}

//           {loader ? (
//             <div
//               className="d-flex justify-content-center align-item-center"
//               style={{
//                 position: "fixed",
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)",
//                 zIndex: 9999,
//               }}
//             >
//               <div class="lds-ripple">
//                 <div></div>
//                 <div></div>
//               </div>
//             </div>
//           ) : null}
//         </Container>
//       </div>
//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "#f9f8f6",
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.8,
//             }}
//           ></div>
//         )}
//         <div className="maincontainer">
//           <div className="mobile-product-box " style={{ marginBottom: "30px" }}>
//             <div style={{ marginBottom: "20px" }}>
//               {/* Pass Derived Tabs and State Handlers */}
//               <TabsComponent
//                 tabs={dynamicTabs}
//                 activeTab={selectedCategory}
//                 onTabClick={setSelectedCategory}
//               />
//             </div>

//             <div className="d-flex gap-1 mb-2 flex-column">
//               <div className="row">
//                 {/* RENDER THE FILTERED LIST */}
//                 {finalDisplayItems?.map((item, i) => {
//                   // const isPreOrder = isPreOrderFor(
//                   //   item?.deliveryDate || item?.deliveryDateISO,
//                   //   item?.session
//                   // );
//                   let matchedLocation = item.locationPrice?.[0];
//                   const checkOf = AllOffer?.find(
//                     (ele) => ele?.foodItemId == item?._id?.toString(),
//                   );
//                   if (!matchedLocation) {
//                     matchedLocation = {
//                       Remainingstock: 0,
//                       hubPrice: item.hubPrice || item.basePrice || 0,
//                       preOrderPrice: item.preOrderPrice || 0,
//                       basePrice: item.basePrice || 0,
//                     };
//                   }
//                   const { price: effectivePrice } = getEffectivePrice(
//                     item,
//                     matchedLocation,
//                     item?.session,
//                     true,
//                   );
//                   return (
//                     <div
//                       key={item._id?.toString() || i}
//                       className="col-6 col-md-6 mb-2 d-flex justify-content-center"
//                     >
//                       <div className="mobl-product-card">
//                         <div className="productborder ">
//                           <div className="prduct-box rounded-1 cardbx">
//                             <div
//                               onClick={() => showDrawer(item)}
//                               className="imagebg"
//                             >
//                               {item?.foodcategory === "Veg" ? (
//                                 <img
//                                   src={IsVeg}
//                                   alt="IsVeg"
//                                   className="isVegIcon"
//                                 />
//                               ) : (
//                                 <img
//                                   src={IsNonVeg}
//                                   alt="IsNonVeg"
//                                   className="isVegIcon"
//                                 />
//                               )}
//                               <img
//                                 src={`${item?.Foodgallery[0]?.image2}`}
//                                 alt=""
//                                 className="mbl-product-img"
//                               />
//                             </div>
//                           </div>
//                           {item?.foodTags && (
//                             <div className="food-tag-container">
//                               {item.foodTags.map((tag) => (
//                                 <span
//                                   className="food-tag-pill"
//                                   style={{
//                                     backgroundColor: tag.tagColor,
//                                   }}
//                                 >
//                                   <img
//                                     src={chef}
//                                     alt=""
//                                     style={{
//                                       width: "10px",
//                                       height: "10px",
//                                       marginRight: "2px",
//                                     }}
//                                   />
//                                   {tag.tagName}
//                                 </span>
//                               ))}
//                             </div>
//                           )}

//                           <div className="food-name-container">
//                             <p className="food-name">{item?.foodname}</p>
//                             <small className="food-unit">{item?.unit}</small>
//                           </div>

//                           <div
//                             className="d-flex align-items-center mb-3"
//                             style={{ gap: "8px", flexWrap: "nowrap" }}
//                           >
//                             {matchedLocation?.basePrice &&
//                             matchedLocation?.basePrice !== effectivePrice &&
//                             parseFloat(matchedLocation?.basePrice) !==
//                               parseFloat(effectivePrice) ? (
//                               <div
//                                 className="align-items-start"
//                                 style={{
//                                   textDecoration: "line-through",
//                                   color: "#6b6b6b",
//                                   fontSize: "15px",
//                                   whiteSpace: "nowrap",
//                                   flexShrink: 0,
//                                   display: "flex",
//                                   gap: "2px",
//                                   marginLeft: "7px",
//                                 }}
//                               >
//                                 <span className="fw-normal">₹</span>
//                                 <span>{matchedLocation?.basePrice}</span>
//                               </div>
//                             ) : null}

//                             <div
//                               className="align-items-start"
//                               style={{
//                                 color: "#2c2c2c",
//                                 fontFamily: "Inter",
//                                 fontSize: "20px",
//                                 fontWeight: "500",
//                                 lineHeight: "25px",
//                                 letterSpacing: "-0.8px",
//                                 whiteSpace: "nowrap",
//                                 flexShrink: 0,
//                                 display: "flex",
//                                 gap: "2px",
//                               }}
//                             >
//                               {checkOf ? (
//                                 <div className="d-flex align-items-start gap-2">
//                                   <div
//                                     className="align-items-start"
//                                     style={{ display: "flex", gap: "2px" }}
//                                   >
//                                     <span className="fw-bold">₹</span>
//                                     <span
//                                       style={{
//                                         textDecoration: "line-through",
//                                         color: "#6b6b6b",
//                                         fontSize: "15px",
//                                         fontWeight: "400",
//                                         lineHeight: "18px",
//                                         letterSpacing: "-0.6px",
//                                       }}
//                                     >
//                                       {effectivePrice}
//                                     </span>
//                                   </div>
//                                   <div
//                                     className="align-items-start"
//                                     style={{
//                                       display: "flex",
//                                       gap: "2px",
//                                       marginLeft: "5px",
//                                     }}
//                                   >
//                                     <span className="fw-normal">₹</span>
//                                     <span>{checkOf?.price}</span>
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <div
//                                   className=" align-items-start"
//                                   style={{
//                                     display: "flex",
//                                     gap: "1px",
//                                     marginLeft: "6px",
//                                   }}
//                                 >
//                                   <span className="fw-bold">₹</span>
//                                   <span>{effectivePrice}</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>

//                           {address && (
//                             <div>
//                               <div className="guaranteed-label">
//                                 <img
//                                   src={availabity}
//                                   alt=""
//                                   style={{ width: "11px", height: "11px" }}
//                                 />{" "}
//                                 Guaranteed Availability{" "}
//                               </div>
//                               {checkOf && <BiSolidOffer color="green" />}
//                               {/* </div> */}
//                             </div>
//                           )}

//                           <div className="d-flex justify-content-center mb-2">
//                             {getCartQuantity(item?._id) === 0 ? (
//                               // Item not in cart
//                               address && gifUrl === "Closed.gif" ? (
//                                 <button
//                                   className="add-to-cart-btn-disabled"
//                                   disabled
//                                 >
//                                   <span className="add-to-cart-btn-text">
//                                     {" "}
//                                     Add
//                                   </span>
//                                   <FaPlus className="add-to-cart-btn-icon" />
//                                 </button>
//                               ) : (
//                                 <button
//                                   className={`add-to-cart-btn
//                                     ${
//                                       (user && !address) ||
//                                       isBeforeCutoff(
//                                         item.deliveryDate,
//                                         item.deliverySession,
//                                       )
//                                         ? "disabled-btn"
//                                         : ""
//                                     }`}
//                                   onClick={() =>
//                                     addCart1(item, checkOf, matchedLocation)
//                                   }
//                                   disabled={
//                                     (user && !address) ||
//                                     isBeforeCutoff(
//                                       item.deliveryDate,
//                                       item.deliverySession,
//                                     )
//                                   }
//                                 >
//                                   <div className="pick-btn-text">
//                                     <span className="pick-btn-text1">PICK</span>
//                                     <span className="pick-btn-text2">
//                                       {/* {`for ${new Date(
//                                           item.deliveryDate
//                                         ).toLocaleDateString("en-GB", {
//                                           day: "2-digit",
//                                           month: "short",
//                                         })}`} */}
//                                       Confirm Later
//                                     </span>
//                                   </div>

//                                   <span className="add-to-cart-btn-icon">
//                                     {" "}
//                                     <FaPlus />
//                                   </span>
//                                 </button>
//                               )
//                             ) : getCartQuantity(item?._id) > 0 ? (
//                               // Item in cart with quantity
//                               <button className="increaseBtn">
//                                 <div
//                                   className="faplus"
//                                   onClick={() =>
//                                     !(user && !address) &&
//                                     decreaseQuantity(
//                                       item?._id,
//                                       checkOf,
//                                       matchedLocation,
//                                     )
//                                   }
//                                   style={{
//                                     opacity: user && !address ? 0.5 : 1,
//                                     pointerEvents:
//                                       user && !address ? "none" : "auto",
//                                   }}
//                                 >
//                                   <FaMinus />
//                                 </div>
//                                 <div className="faQuantity">
//                                   {getCartQuantity(item?._id)}
//                                 </div>
//                                 <div
//                                   className="faplus"
//                                   onClick={() =>
//                                     !(user && !address) &&
//                                     increaseQuantity(
//                                       item?._id,
//                                       checkOf,
//                                       item,
//                                       matchedLocation,
//                                     )
//                                   }
//                                   style={{
//                                     opacity: user && !address ? 0.5 : 1,
//                                     pointerEvents:
//                                       user && !address ? "none" : "auto",
//                                   }}
//                                 >
//                                   <FaPlus />
//                                 </div>
//                               </button>
//                             ) : gifUrl === "Closed.gif" ? (
//                               <button className="add-to-cart-btn" disabled>
//                                 <span className="add-to-cart-btn-text">
//                                   {" "}
//                                   Add{" "}
//                                 </span>
//                                 <span className="add-to-cart-btn-icon">
//                                   {" "}
//                                   <FaPlus />
//                                 </span>
//                               </button>
//                             ) : (
//                               <button
//                                 className="add-to-cart-btn"
//                                 onClick={() =>
//                                   addCart1(item, checkOf, matchedLocation)
//                                 }
//                                 disabled={user && !address}
//                                 style={{
//                                   opacity: user && !address ? 0.5 : 1,
//                                 }}
//                               >
//                                 <span className="add-to-cart-btn-text">
//                                   {" "}
//                                   Add{" "}
//                                 </span>
//                                 <span className="add-to-cart-btn-icon">
//                                   {" "}
//                                   <FaPlus />
//                                 </span>
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}

//                 {!loader && finalDisplayItems.length === 0 && (
//                   <div className="col-12 text-center my-5">
//                     <h4>No items available for this slot.</h4>
//                     <p>Please check back later or select a different day!</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {/* <div className="col-md-12">
//               <p className="copyright-text">
//                 © CULINARY CRAVINGS CONVENIENCE PVT LTD all rights reserved.
//               </p>
//             </div> */}
//           </div>
//         </div>

//         <MultiCartDrawer
//           proceedToPlan={proceedToPlan}
//           groupedCarts={groupedCarts}
//           overallSubtotal={overallSubtotal}
//           overallTotalItems={overallTotalItems}
//           onJumpToSlot={handleSelectionChange}
//         />

//         <Modal show={show3} backdrop="static" onHide={handleClose3}>
//           <Modal.Header closeButton>
//             <Modal.Title className="d-flex align-items-center gap-1">
//               <FaLock color="#6B8E23" /> <span>Welcome to Dailydish</span>{" "}
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <div className="login-whatsappwithicon">
//                 <FaSquareWhatsapp size={42} color="green" />

//                 <Form.Control
//                   type="number"
//                   placeholder="Enter Your WhatsApp Number"
//                   value={Mobile}
//                   onChange={(e) => setMobile(e.target.value)}
//                 />
//               </div>

//               <Button
//                 variant=""
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//                 onClick={() => {
//                   if (!validateIndianMobileNumber(Mobile)) {
//                     Swal2.fire({
//                       toast: true,
//                       position: "bottom",
//                       icon: "error",
//                       title: `Invalid mobile number`,
//                       showConfirmButton: false,
//                       timer: 3000,
//                       timerProgressBar: true,
//                       customClass: {
//                         popup: "me-small-toast",
//                         title: "me-small-toast-title",
//                       },
//                     });
//                     return;
//                   }
//                   userLogin();
//                 }}
//               >
//                 Send otp
//               </Button>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleClose3}>
//               Close
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         <Modal
//           show={show2}
//           onHide={handleClose2}
//           size="sm"
//           style={{
//             zIndex: "99999",
//             position: "absolute",
//             top: "30%",
//             left: "0%",
//           }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Enter OTP</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <span style={{ fontSize: "13px" }}>
//               An OTP has been sent to your Phone Number
//             </span>
//             <div className="d-flex gap-1 mt-3 mb-3">
//               <InputGroup className="mb-2" style={{ background: "white" }}>
//                 <Form.Control
//                   type={PasswordShow ? "text" : "password"}
//                   className="login-input"
//                   placeholder="Enter OTP"
//                   aria-describedby="basic-addon1"
//                   onChange={(e) => setOTP(e.target.value)}
//                 />
//                 <Button
//                   variant=""
//                   style={{ borderRadius: "0px", border: "1px solid black" }}
//                   onClick={() => setPasswordShow(!PasswordShow)}
//                   className="passbtn"
//                 >
//                   {PasswordShow ? <FaEye /> : <FaEyeSlash />}
//                 </Button>
//               </InputGroup>
//             </div>
//             <div>
//               <Button
//                 variant=""
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//                 onClick={verifyOTP}
//               >
//                 Continue
//               </Button>
//             </div>
//           </Modal.Body>
//         </Modal>

//         <Drawer
//           placement="bottom"
//           closable={false}
//           onClose={onClose}
//           open={open}
//           key="bottom"
//           height={600}
//           className="description-product"
//           style={{ zIndex: 99999 }}
//           zIndex={99999}
//         >
//           <div className="modal-container-food">
//             <button className="custom-close-btn" onClick={onClose}>
//               ×
//             </button>
//             <div className="modern-food-item">
//               <div className="food-image-container">
//                 <div className="image-loading-spinner" id="image-spinner"></div>

//                 {foodData?.Foodgallery?.length > 0 && (
//                   <img
//                     src={`${foodData.Foodgallery[0].image2}`}
//                     alt={foodData?.foodname}
//                     className="modern-food-image"
//                     onLoad={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       const image =
//                         document.querySelector(".modern-food-image");
//                       if (spinner) spinner.classList.add("hidden");
//                       if (image) image.classList.add("loaded");
//                     }}
//                     onError={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       if (spinner) spinner.classList.add("hidden");
//                     }}
//                   />
//                 )}
//                 <div className="food-category-icon">
//                   {foodData?.foodcategory === "Veg" ? (
//                     <img src={IsVeg} alt="IsVeg" className="isVegIcon" />
//                   ) : (
//                     <img src={IsNonVeg} alt="IsNonVeg" className="isVegIcon" />
//                   )}
//                 </div>
//               </div>

//               <div className="food-details">
//                 <h2 className="food-title">{foodData?.foodname}</h2>
//                 <p className="food-description">{foodData?.fooddescription}</p>

//                 {(() => {
//                   const currentLocationString = `${address?.apartmentname}, ${address?.Address}, ${address?.pincode}`;

//                   const matchedLocation =
//                     foodData?.locationPrice?.length > 0
//                       ? foodData.locationPrice[0]
//                       : {
//                           Remainingstock: 0,
//                           hubPrice:
//                             foodData.hubPrice || foodData.basePrice || 0,
//                           preOrderPrice: foodData.preOrderPrice || 0,
//                           basePrice: foodData.basePrice || 0,
//                         };

//                   const checkOffer = AllOffer?.find(
//                     (offer) =>
//                       offer?.locationId?._id === address?._id &&
//                       offer?.products
//                         ?.map((product) => product._id)
//                         .includes(foodData?._id),
//                   );

//                   const eff = getEffectivePrice(
//                     foodData,
//                     matchedLocation,
//                     foodData?.session,
//                     true,
//                   );
//                   const currentPrice = checkOffer
//                     ? checkOffer.price
//                     : eff.price;
//                   const originalPrice = eff.price;

//                   const stockCount = matchedLocation?.Remainingstock || 0;

//                   // const isPreOrderDrawer = isPreOrderFor(
//                   //   foodData?.deliveryDate || foodData?.deliveryDateISO,
//                   //   foodData?.session
//                   // );

//                   return (
//                     <>
//                       <div className="pricing-section">
//                         <div className="pricing-display">
//                           <span className="current-price">₹{currentPrice}</span>
//                           {checkOffer && (
//                             <span
//                               className="original-price"
//                               style={{ marginLeft: "10px" }}
//                             >
//                               ₹{originalPrice}
//                             </span>
//                           )}
//                         </div>
//                         <div className="availability-banner">
//                           {stockCount > 0 ? (
//                             <>
//                               {checkOffer && (
//                                 <BiSolidOffer
//                                   color="green"
//                                   style={{ marginRight: "5px" }}
//                                 />
//                               )}{" "}
//                               {/* {!isPreOrderDrawer &&
//                                 `${stockCount} servings left!`} */}
//                             </>
//                           ) : (
//                             "Sold Out"
//                           )}
//                         </div>
//                       </div>

//                       {getCartQuantity(foodData?._id) > 0 ? (
//                         <div className="increaseBtn">
//                           <div
//                             className="faplus"
//                             onClick={() => {
//                               if (!(user && !address)) {
//                                 decreaseQuantity(
//                                   foodData?._id,
//                                   checkOffer,
//                                   matchedLocation,
//                                 );
//                               }
//                             }}
//                             style={{
//                               opacity: user && !address ? 0.5 : 1,
//                               pointerEvents: user && !address ? "none" : "auto",
//                             }}
//                           >
//                             <FaMinus />
//                           </div>
//                           <div className="faQuantity">
//                             {getCartQuantity(foodData?._id)}
//                           </div>
//                           <div
//                             className="faplus"
//                             onClick={() => {
//                               if (!(user && !address)) {
//                                 increaseQuantity(
//                                   foodData?._id,
//                                   checkOffer,
//                                   foodData,
//                                   matchedLocation,
//                                 );
//                               }
//                             }}
//                             style={{
//                               opacity: user && !address ? 0.5 : 1,
//                               pointerEvents: user && !address ? "none" : "auto",
//                             }}
//                           >
//                             <FaPlus />
//                           </div>
//                         </div>
//                       ) : stockCount > 0 && gifUrl !== "Closed.gif" ? (
//                         // <button
//                         //   className="add-to-plate-btn"
//                         //   onClick={() => {
//                         //     addCart1(foodData, checkOffer, matchedLocation);
//                         //   }}
//                         //   disabled={user && !address}
//                         //   style={{
//                         //     opacity: user && !address ? 0.5 : 1,
//                         //     pointerEvents: user && !address ? "none" : "auto",
//                         //   }}
//                         // >
//                         //   <span>Add to plate</span>
//                         //   <div className="plate-icon">🍽️</div>
//                         // </button>
//                         ""
//                       ) : (
//                         <button
//                           className={
//                             gifUrl === "Closed.gif"
//                               ? "add-to-cart-btn-disabled"
//                               : "sold-out-btn"
//                           }
//                           disabled
//                         >
//                           <span className="add-to-cart-btn-text">
//                             {gifUrl === "Closed.gif" ? "Closed" : "Sold Out"}
//                           </span>
//                         </button>
//                       )}
//                     </>
//                   );
//                 })()}
//               </div>
//             </div>
//           </div>
//         </Drawer>
//       </div>

//       {/* Location Selection Popup */}
//       {/* <LocationRequiredPopup
//         show={showLocationPopup}
//         onClose={() => setShowLocationPopup(false)}
//       /> */}

//       {/* {false && showLocationPopup && (
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
//           onClick={() => setShowLocationPopup(false)}
//         >
//           <div
//             style={{
//               backgroundColor: "white",
//               borderRadius: "16px",
//               padding: "24px",
//               maxWidth: "400px",
//               width: "100%",
//               textAlign: "center",
//               boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
//               animation: "modalFadeIn 0.3s ease-out",
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div
//               style={{
//                 fontSize: "48px",
//                 marginBottom: "16px",
//                 color: "#6B8E23",
//               }}
//             >
//               <MdAddLocationAlt />
//             </div>
//             <h3
//               style={{
//                 marginBottom: "12px",
//                 color: "#333",
//                 fontSize: "20px",
//                 fontWeight: "600",
//                 fontFamily: "Inter",
//               }}
//             >
//               Add Location to See Menu
//             </h3>
//             <p
//               style={{
//                 marginBottom: "24px",
//                 color: "#666",
//                 fontSize: "14px",
//                 lineHeight: "1.5",
//                 fontFamily: "Inter",
//               }}
//             >
//               Please add your delivery location to view available menu items and place orders.
//             </p>
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: "12px",
//                 marginTop: "12px",
//               }}
//             >
//               <button
//                 onClick={() => {
//                   setShowLocationPopup(false);
//                   navigate("/location");
//                 }}
//                 style={{
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "12px",
//                   padding: "14px",
//                   fontSize: "16px",
//                   fontWeight: "600",
//                   cursor: "pointer",
//                   transition: "background-color 0.2s",
//                   fontFamily: "Inter",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.target.style.backgroundColor = "#5a7a1a";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.backgroundColor = "#6B8E23";
//                 }}
//               >
//                 Add Location
//               </button>
//               <button
//                 onClick={() => setShowLocationPopup(false)}
//                 style={{
//                   backgroundColor: "transparent",
//                   color: "#666",
//                   border: "1px solid #ddd",
//                   borderRadius: "12px",
//                   padding: "12px",
//                   fontSize: "14px",
//                   fontWeight: "500",
//                   cursor: "pointer",
//                   transition: "all 0.2s",
//                   fontFamily: "Inter",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.target.style.backgroundColor = "#f5f5f5";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.backgroundColor = "transparent";
//                 }}
//               >
//                 Close
//               </button>
//             </div>
//           </div>

//           <style jsx>{`
//             @keyframes modalFadeIn {
//               from {
//                 opacity: 0;
//                 transform: scale(0.9);
//               }
//               to {
//                 opacity: 1;
//                 transform: scale(1);
//               }
//             }
//           `}</style>
//         </div>
//       )} */}

//       <div style={{ marginBottom: "80px" }}>
//         <Footer />
//       </div>

//       <BottomNav />
//     </div>
//   );
// };

// const TabsComponent = ({ tabs, activeTab, onTabClick }) => {
//   return (
//     <div className="tabs-container2">
//       <div className="tabs-scroll-container">
//         <div className="tabs-scroll">
//           {tabs.map((tab) => (
//             <button
//               key={tab}
//               className={`tab-button ${activeTab === tab ? "active" : ""}`}
//               onClick={() => onTabClick(tab)}
//             >
//               <span className="tab-button-text">{tab}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//       <style jsx>{`
//         .tabs-container2 {
//           background-color: ${Colors.creamWalls};
//           border-bottom-left-radius: 16px;
//           border-bottom-right-radius: 16px;
//           position: relative;
//           border-bottom: 2px solid #fff;
//           box-shadow:
//             0 1px 3px rgba(0, 0, 0, 0.1),
//             0 2px 6px rgba(0, 0, 0, 0.05);
//         }
//         .tabs-scroll-container {
//           overflow-x: auto;
//           -webkit-overflow-scrolling: touch;
//           scrollbar-width: none;
//         }
//         .tabs-scroll-container::-webkit-scrollbar {
//           display: none;
//         }
//         .tabs-scroll {
//           display: inline-flex;
//           min-width: 100%;
//           gap: 10px;
//           padding: 0 4px;
//         }
//         .tab-button {
//           display: inline-flex;
//           justify-content: center;
//           align-items: center;
//           padding: 8px 24px;
//           border-radius: 20px;
//           border: none;
//           background: transparent;
//           cursor: pointer;
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//           white-space: nowrap;
//           flex-shrink: 0;
//           min-height: 25px;
//         }
//         .tab-button:hover {
//           background-color: ${Colors.warmbeige}40;
//           transform: translateY(-1px);
//         }
//         .tab-button.active {
//           background-color: ${Colors.greenCardamom};
//           padding: 4px 8px;
//           box-shadow: 0 2px 8px ${Colors.greenCardamom}80;
//           width: auto;
//           height: auto;
//           border-radius: 20px;
//         }
//         .tab-button.active:hover {
//           background-color: ${Colors.greenCardamom}E6;
//           transform: translateY(-1px) scale(1.02);
//         }
//         .tab-button-text {
//           font-family: "Inter", sans-serif;
//           font-size: 14px;
//           font-weight: 400;
//           line-height: 18px;
//           letter-spacing: -0.7px;
//           color: ${Colors.primaryText};
//           transition: all 0.3s ease;
//         }
//         .tab-button.active .tab-button-text {
//           font-family: "Inter", sans-serif;
//           font-size: 16px;
//           font-weight: 900;
//           line-height: 21px;
//           letter-spacing: -0.8px;
//           color: ${Colors.appForeground};
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Home;

// import {
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   useRef,
//   useCallback,
// } from "react";
// import { Container } from "react-bootstrap";
// import { FaEye, FaEyeSlash, FaLock, FaUser, FaAngleUp } from "react-icons/fa";
// import { Button, Form, InputGroup, Modal } from "react-bootstrap";
// import { FaPlus, FaMinus, FaSquareWhatsapp } from "react-icons/fa6";
// import "../Styles/Home.css";
// import Banner from "./Banner";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Drawer } from "antd";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import CoinBalance from "./CoinBalance";
// import { WalletContext } from "../WalletContext";
// import RatingModal from "./RatingModal";
// import { BiSolidOffer } from "react-icons/bi";
// import Swal2 from "sweetalert2";
// import moment from "moment";
// import IsVeg from "../assets/isVeg=yes.svg";
// import IsNonVeg from "../assets/isVeg=no.svg";
// import MultiCartDrawer from "./MultiCartDrawer";
// import DateSessionSelector from "./DateSessionSelector";
// import chef from "./../assets/chef_3.png";
// import { Colors, FontFamily } from "../Helper/themes";
// import BottomNav from "./BottomNav";
// import LocationRequiredPopup from "./LocationRequiredPopup";
// import { MdAddLocationAlt } from "react-icons/md";
// import availabity from "./../assets/weui_done2-filled.png";
// import Footer from "./Footer";

// const Home = ({ selectArea, setSelectArea, Carts, setCarts }) => {
//   // Store user in state to avoid infinite render loop
//   const [user, setUser] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   });

//   // Listen for user changes in localStorage
//   useEffect(() => {
//     const handleStorage = (e) => {
//       if (e.key === "user") {
//         try {
//           setUser(JSON.parse(e.newValue));
//         } catch {
//           setUser(null);
//         }
//       }
//     };
//     window.addEventListener("storage", handleStorage);
//     return () => window.removeEventListener("storage", handleStorage);
//   }, []);

//   // Provide a function to update user state and localStorage together
//   const updateUser = (userObj) => {
//     setUser(userObj);
//     if (userObj) {
//       localStorage.setItem("user", JSON.stringify(userObj));
//     } else {
//       localStorage.removeItem("user");
//     }
//     window.dispatchEvent(new Event("userUpdated"));
//   };

//   const navigate = useNavigate();
//   const location = useLocation();

//   const { wallet, transactions, loading, walletSeting, getorderByCustomerId } =
//     useContext(WalletContext);

//   const [loader, setloader] = useState(false);
//   const [allHubMenuData, setAllHubMenuData] = useState([]);

//   // --- NEW STATE FOR FILTERS ---
//   const [isVegOnly, setIsVegOnly] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("");

//   const [address, setAddress] = useState(null);

//   // ============ NEW: Track if default hub menu should load ============
//   const [shouldLoadDefaultMenu, setShouldLoadDefaultMenu] = useState(!user);

//   // Initial address loading with better error handling
//   useEffect(() => {
//     const loadInitialAddress = () => {
//       try {
//         const primaryAddress = localStorage.getItem("primaryAddress");
//         const currentLocation = localStorage.getItem("currentLocation");
//         const defaultHubData = localStorage.getItem("defaultHubData");

//         // console.log("Initial load - primaryAddress:", primaryAddress);
//         // console.log("Initial load - currentLocation:", currentLocation);
//         // console.log("Initial load - defaultHubData:", defaultHubData);

//         // Priority 1: Primary address (for logged-in users)
//         if (primaryAddress && primaryAddress !== "null") {
//           const parsedPrimary = JSON.parse(primaryAddress);
//           // console.log(
//           //   "Initial load - setting address from primaryAddress:",
//           //   parsedPrimary
//           // );
//           setAddress(parsedPrimary);
//           setShouldLoadDefaultMenu(false);
//         }
//         // Priority 2: Current location (user-selected)
//         else if (currentLocation && currentLocation !== "null") {
//           const parsedCurrent = JSON.parse(currentLocation);
//           // console.log(
//           //   "Initial load - setting address from currentLocation:",
//           //   parsedCurrent
//           // );
//           setAddress(parsedCurrent);
//           setShouldLoadDefaultMenu(false);
//         }
//         // Priority 3: Default hub data (for non-logged-in users)
//         else if (defaultHubData && defaultHubData !== "null") {
//           try {
//             const parsedDefault = JSON.parse(defaultHubData);
//             // console.log(
//             //   "Initial load - setting address from defaultHubData:",
//             //   parsedDefault
//             // );

//             // Create address object from default hub data
//             const defaultAddress = {
//               hubId:
//                 parsedDefault.hubId ||
//                 parsedDefault._id ||
//                 "69613cb1145c1aaedd9859cd",
//               hubName:
//                 parsedDefault.hubName || parsedDefault.name || "Default Hub",
//               fullAddress:
//                 parsedDefault.address || "Select your location to view menu",
//               isDefaultHub: true,
//               location: parsedDefault.location || {
//                 type: "Point",
//                 coordinates: [0, 0],
//               },
//             };

//             setAddress(defaultAddress);
//             setShouldLoadDefaultMenu(false);

//             // Also save to currentLocation for consistency
//             localStorage.setItem(
//               "currentLocation",
//               JSON.stringify(defaultAddress),
//             );
//           } catch (e) {
//             console.error("Error parsing default hub data:", e);
//             setAddress(null);
//             setShouldLoadDefaultMenu(true);
//           }
//         } else {
//           console.log("Initial load - no address found");
//           setAddress(null);
//           setShouldLoadDefaultMenu(!user); // Load default menu for non-logged-in users
//         }
//       } catch (error) {
//         console.error("Error loading initial address:", error);
//         setAddress(null);
//         setShouldLoadDefaultMenu(!user);
//       }
//     };

//     loadInitialAddress();
//     getDeliveryRates();
//   }, [user]);

//   // console.log(address, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

//   // Add a function to refresh address from localStorage
//   const refreshAddress = useCallback(() => {
//     try {
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const currentLocation = localStorage.getItem("currentLocation");
//       const defaultHubData = localStorage.getItem("defaultHubData");

//       // console.log("Refreshing address - primaryAddress:", primaryAddress);
//       // console.log("Refreshing address - currentLocation:", currentLocation);
//       // console.log("Refreshing address - defaultHubData:", defaultHubData);

//       // Clear manual location flag if no addresses are found
//       if (
//         (!primaryAddress || primaryAddress === "null") &&
//         (!currentLocation || currentLocation === "null") &&
//         (!defaultHubData || defaultHubData === "null")
//       ) {
//         console.log("No addresses found");
//       }

//       if (primaryAddress && primaryAddress !== "null") {
//         const parsedPrimary = JSON.parse(primaryAddress);
//         // console.log("Setting address from primaryAddress:", parsedPrimary);
//         setAddress(parsedPrimary);
//         setShouldLoadDefaultMenu(false);
//       } else if (currentLocation && currentLocation !== "null") {
//         const parsedCurrent = JSON.parse(currentLocation);
//         // console.log("Setting address from currentLocation:", parsedCurrent);
//         setAddress(parsedCurrent);
//         setShouldLoadDefaultMenu(false);
//       } else if (defaultHubData && defaultHubData !== "null") {
//         try {
//           const parsedDefault = JSON.parse(defaultHubData);
//           // console.log("Setting address from defaultHubData:", parsedDefault);

//           // Create address object from default hub data
//           const defaultAddress = {
//             hubId:
//               parsedDefault.hubId ||
//               parsedDefault._id ||
//               "69613cb1145c1aaedd9859cd",
//             hubName:
//               parsedDefault.hubName || parsedDefault.name || "Default Hub",
//             fullAddress:
//               parsedDefault.address || "Select your location to view menu",
//             isDefaultHub: true,
//             location: parsedDefault.location || {
//               type: "Point",
//               coordinates: [0, 0],
//             },
//           };

//           setAddress(defaultAddress);
//           setShouldLoadDefaultMenu(false);

//           // Also save to currentLocation for consistency
//           localStorage.setItem(
//             "currentLocation",
//             JSON.stringify(defaultAddress),
//           );
//         } catch (e) {
//           console.error("Error parsing default hub data:", e);
//           setAddress(null);
//           setShouldLoadDefaultMenu(!user);
//         }
//       } else {
//         console.log("No address found, setting to null");
//         setAddress(null);
//         setShouldLoadDefaultMenu(!user);
//       }
//     } catch (error) {
//       console.error("Error refreshing address:", error);
//       setAddress(null);
//       setShouldLoadDefaultMenu(!user);
//     }
//   }, [user]);

//   // Listen for location updates from Banner
//   useEffect(() => {
//     const handleLocationUpdated = () => {
//       console.log("Location updated event received");
//       refreshAddress();
//     };

//     const handleAddressUpdated = () => {
//       console.log("Address updated event received");
//       refreshAddress();
//     };

//     const handleAddressAdded = () => {
//       console.log("Address added event received");
//       refreshAddress();
//     };

//     const handleFocus = () => {
//       console.log("Window focus event - refreshing address");
//       refreshAddress();
//     };

//     // Listen for default hub data loaded event
//     const handleDefaultHubLoaded = () => {
//       console.log("Default hub data loaded event received");
//       refreshAddress();
//     };

//     // Listen for all location/address related events
//     window.addEventListener("locationUpdated", handleLocationUpdated);
//     window.addEventListener("addressUpdated", handleAddressUpdated);
//     window.addEventListener("addressAdded", handleAddressAdded);
//     window.addEventListener("focus", handleFocus);
//     window.addEventListener("defaultHubLoaded", handleDefaultHubLoaded);

//     // Also listen for localStorage changes
//     const handleStorageChange = (e) => {
//       if (
//         e.key === "currentLocation" ||
//         e.key === "primaryAddress" ||
//         e.key === "defaultHubData"
//       ) {
//         // console.log("localStorage change detected for:", e.key);
//         refreshAddress();
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);

//     // Add periodic check to ensure address stays in sync
//     const intervalId = setInterval(() => {
//       refreshAddress();
//     }, 2000); // Check every 2 seconds

//     return () => {
//       window.removeEventListener("locationUpdated", handleLocationUpdated);
//       window.removeEventListener("addressUpdated", handleAddressUpdated);
//       window.removeEventListener("addressAdded", handleAddressAdded);
//       window.removeEventListener("focus", handleFocus);
//       window.removeEventListener("defaultHubLoaded", handleDefaultHubLoaded);
//       window.removeEventListener("storage", handleStorageChange);
//       clearInterval(intervalId);
//     };
//   }, [refreshAddress]);

//   // Removed: useEffect that depends on user - moved to after user declaration

//   // --- DATE & SESSION STATE ---
//   const getNormalizedToday = () => {
//     const now = new Date();
//     return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
//   };

//   const [selectedDate, setSelectedDate] = useState(() => {
//     if (location.state?.targetDate) return new Date(location.state.targetDate);
//     return getNormalizedToday();
//   });

//   const [selectedSession, setSelectedSession] = useState(() => {
//     if (location.state?.targetSession) return location.state.targetSession;
//     return "Lunch";
//   });

//   // State for location popup
//   const [showLocationPopup, setShowLocationPopup] = useState(false);

//   // Update handleSelectionChange to reset selectedCategory
//   const handleSelectionChange = (date1, session1) => {
//     // console.log("Selection changed:", date1, session1);
//     setSelectedDate(date1);
//     setSelectedSession(session1);
//     // Reset category to first available when session changes
//     setSelectedCategory(""); // This will trigger the useEffect to set first category
//     window.scrollTo(0, 0);
//   };

//   // Check if user is logged in but has no address selected
//   useEffect(() => {
//     if (user && !address) {
//       // Show popup after a short delay to ensure page is loaded
//       const timer = setTimeout(() => {
//         setShowLocationPopup(true);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [user, address]);

//   // Add location detection for users coming from splash screen
//   useEffect(() => {
//     const checkLocationPermission = async () => {
//       // Only run this check if user has no address data at all
//       const currentLocation = localStorage.getItem("currentLocation");
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const defaultHubData = localStorage.getItem("defaultHubData");

//       // If user has any address data, don't redirect
//       if (currentLocation || primaryAddress || defaultHubData || address) {
//         return;
//       }

//       // Check if browser supports geolocation
//       if (navigator.geolocation && navigator.permissions) {
//         try {
//           const permission = await navigator.permissions.query({
//             name: "geolocation",
//           });

//           // if (permission.state === "denied" || permission.state === "prompt") {
//           //   // Permission denied or will prompt, redirect to modal
//           //   navigate("/location-permission");
//           //   return;
//           // }

//           // If permission is granted but we still don't have location, let user stay on home
//           // They can use the location selection in the banner
//         } catch (error) {
//           // Permissions API not supported, let user stay on home
//           console.error("Permissions API error:", error);
//         }
//       }
//       // If geolocation not supported, let user stay on home
//     };

//     // Run the check after component mounts, but only once
//     const timer = setTimeout(checkLocationPermission, 500);
//     return () => clearTimeout(timer);
//   }, []); // Remove dependencies to prevent re-running

//   // --- 1. FETCH DATA (Only when Hub Changes) ---
//   useEffect(() => {
//     // If we should load default menu for non-logged-in users, use default hub ID
//     const hubIdToUse =
//       address?.hubId ||
//       (shouldLoadDefaultMenu && !user ? "69613cb1145c1aaedd9859cd" : null);

//     if (!hubIdToUse) {
//       setAllHubMenuData([]);
//       setloader(false);
//       return;
//     }

//     const fetchAllMenuData = async () => {
//       setloader(true);
//       try {
//         // console.log("Fetching menu for hub:", hubIdToUse);

//         const res = await axios.get(
//           "http://localhost:7013/api/user/get-hub-menu",
//           {
//             params: {
//               hubId: hubIdToUse,
//             },
//           },
//         );

//         if (res.status === 200) {
//           // console.log("Menu data received:", res.data.menu.length, "items");
//           setAllHubMenuData(res.data.menu);
//         } else {
//           setAllHubMenuData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching menu:", error);
//         setAllHubMenuData([]);
//       } finally {
//         setloader(false);
//       }
//     };

//     fetchAllMenuData();
//   }, [address?.hubId, shouldLoadDefaultMenu, user]); // This will re-run whenever hubId changes or shouldLoadDefaultMenu changes

//   const handleLocationDetected = useCallback((newLocation) => {
//     // console.log("Location detected from Banner:", newLocation);

//     // Don't override manual selection - removed check for locationManuallySelected
//     // console.log("Manual location flag:", manualLocationFlag);

//     // console.log("Setting new location from Banner:", newLocation);
//     setAddress(newLocation);
//     setShouldLoadDefaultMenu(false);

//     // Save to localStorage for persistence
//     if (newLocation) {
//       localStorage.setItem("currentLocation", JSON.stringify(newLocation));
//     }

//     // Dispatch event for other components
//     window.dispatchEvent(new Event("locationUpdated"));
//   }, []);

//   // --- 2. CORE FILTERING LOGIC (The "Magic" Part) ---

//   // A. Get items for the selected Date & Session
//   const currentSlotItems = useMemo(() => {
//     if (!allHubMenuData?.length) return [];
//     const selectedDateISO = selectedDate.toISOString();

//     return allHubMenuData.filter(
//       (item) =>
//         item.deliveryDate === selectedDateISO &&
//         item.session === selectedSession,
//     );
//   }, [allHubMenuData, selectedDate, selectedSession]);

//   // console.log(currentSlotItems, "...................");

//   // B. Filter those items by "Veg Only" toggle
//   const vegFilteredItems = useMemo(() => {
//     if (isVegOnly) {
//       return currentSlotItems.filter((item) => item.foodcategory === "Veg");
//     }
//     return currentSlotItems;
//   }, [currentSlotItems, isVegOnly]);

//   // console.log(vegFilteredItems, "...............");

//   // C. Derive Categories dynamically from the VALID items (Step B)
//   // This ensures we ONLY show categories that actually have items to show.
//   // Replace the dynamicTabs useMemo
//   const dynamicTabs = useMemo(() => {
//     // Extract unique categories
//     const categories = new Set(
//       vegFilteredItems.map((item) => item.menuCategory),
//     );
//     // Remove undefined/null and sort
//     const uniqueCats = [...categories].filter(Boolean).sort();

//     // Return only the categories without "All"
//     return uniqueCats;
//   }, [vegFilteredItems]);

//   // Add useEffect to set first category when tabs change
//   useEffect(() => {
//     if (dynamicTabs.length > 0 && !selectedCategory) {
//       setSelectedCategory(dynamicTabs[0]);
//     } else if (
//       dynamicTabs.length > 0 &&
//       !dynamicTabs.includes(selectedCategory)
//     ) {
//       // If current selected category is no longer available, select first available
//       setSelectedCategory(dynamicTabs[0]);
//     }
//   }, [dynamicTabs, selectedCategory]);

//   // Replace the finalDisplayItems useMemo
//   const finalDisplayItems = useMemo(() => {
//     if (!selectedCategory) return [];
//     return vegFilteredItems.filter(
//       (item) => item.menuCategory === selectedCategory,
//     );
//   }, [vegFilteredItems, selectedCategory]);

//   // console.log("Final items to display:", finalDisplayItems);

//   const isSameDay = (d1, d2) => {
//     const a = new Date(d1);
//     const b = new Date(d2);
//     a.setHours(0, 0, 0, 0);
//     b.setHours(0, 0, 0, 0);
//     return a.getTime() === b.getTime();
//   };
//   const isFutureDate = (deliveryDate) => {
//     const today = new Date();
//     return !isSameDay(deliveryDate, today) && new Date(deliveryDate) > today;
//   };

//   // Helper: enforce cutoff for Lunch (10am) and Dinner (4pm)
//   const isBeforeCutoff = (deliveryDate, session) => {
//     if (!deliveryDate || !session) return false;
//     const now = new Date();
//     const delivery = new Date(deliveryDate);
//     delivery.setHours(0, 0, 0, 0);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     if (delivery.getTime() > today.getTime()) return true; // future date
//     if (delivery.getTime() < today.getTime()) return false; // past
//     if (session.toLowerCase() === "lunch") {
//       return now.getHours() < 10;
//     }
//     if (session.toLowerCase() === "dinner") {
//       return now.getHours() < 17;
//     }
//     return false;
//   };

//   // console.log(address, "address");
//   // Helper: always use preorder price if available and before cutoff
//   const getEffectivePrice = (item, matchedLocation, session) => {
//     const hubPrice =
//       (matchedLocation &&
//         (matchedLocation.hubPrice || matchedLocation.basePrice)) ||
//       item?.hubPrice ||
//       item?.basePrice ||
//       0;
//     const preOrderPrice =
//       (matchedLocation &&
//         (matchedLocation.preOrderPrice || matchedLocation.preorderPrice)) ||
//       item?.preOrderPrice ||
//       item?.preorderPrice ||
//       0;
//     const beforeCutoff = isBeforeCutoff(
//       item?.deliveryDate || item?.deliveryDateISO,
//       session,
//     );
//     if (beforeCutoff && preOrderPrice > 0) return { price: preOrderPrice };
//     return { price: hubPrice };
//   };

//   const [cartCount, setCartCount] = useState(0);
//   const [isCartVisible, setIsCartVisible] = useState(false);

//   const handleShow = () => {
//     setCartCount(cartCount + 1);
//     setIsCartVisible(true);
//   };

//   const [foodData, setFoodData] = useState({});
//   const [open, setOpen] = useState(false);

//   const showDrawer = (food) => {
//     setFoodData(food);
//     setOpen(true);
//   };
//   const onClose = () => {
//     setOpen(false);
//   };

//   // Add body class when drawer is open to control z-index of other elements
//   useEffect(() => {
//     if (open) {
//       document.body.classList.add("drawer-open");
//     } else {
//       document.body.classList.remove("drawer-open");
//     }

//     // Cleanup on unmount
//     return () => {
//       document.body.classList.remove("drawer-open");
//     };
//   }, [open]);
//   const [show4, setShow4] = useState(false);
//   const handleClose4 = () => setShow4(false);
//   const [show3, setShow3] = useState(false);
//   const handleClose3 = () => setShow3(false);
//   const [show2, setShow2] = useState(false);
//   const handleClose2 = () => setShow2(false);
//   const handleShow2 = () => setShow2(true);

//   // const user = JSON.parse(localStorage.getItem("user"));

//   // Refresh address when user logs in/out
//   useEffect(() => {
//     // console.log("User state changed, refreshing address");
//     refreshAddress();
//   }, [user]);

//   const addCart1 = async (item, checkOf, matchedLocation) => {
//     // Enforce cutoff for adding to cart
//     if (!isBeforeCutoff(selectedDate, selectedSession)) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Cutoff time passed. Cannot add to cart.`,
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
//     if (!matchedLocation || matchedLocation?.Remainingstock === 0) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Product is out of stock`,
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

//     // if (checkOf && !user) {
//     //   Swal2.fire({
//     //     toast: true,
//     //     position: "bottom",
//     //     icon: "info",
//     //     title: `Please login!`,
//     //     showConfirmButton: false,
//     //     timer: 3000,
//     //     timerProgressBar: true,
//     //     customClass: {
//     //       popup: "me-small-toast",
//     //       title: "me-small-toast-title",
//     //     },
//     //   });
//     //   return;
//     // }

//     // determine applied price
//     const eff = getEffectivePrice(item, matchedLocation, selectedSession);
//     const appliedPrice = checkOf ? checkOf?.price : eff.price;

//     const newCartItem = {
//       deliveryDate: new Date(selectedDate).toISOString(),
//       session: selectedSession,
//       foodItemId: item?._id,
//       price: appliedPrice,
//       totalPrice: appliedPrice,
//       image: item?.Foodgallery[0]?.image2,
//       unit: item?.unit,
//       foodname: item?.foodname,
//       quantity: item?.quantity,
//       Quantity: 1,
//       gst: item?.gst,
//       discount: item?.discount,
//       foodcategory: item?.foodcategory,
//       remainingstock: matchedLocation?.Remainingstock,
//       offerProduct: !!checkOf,
//       minCart: checkOf?.minCart || 0,
//       actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//       offerQ: 1,
//       basePrice: matchedLocation?.basePrice || item?.basePrice || 0,
//       hubPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//       preOrderPrice: matchedLocation?.preOrderPrice || item?.preOrderPrice || 0,
//     };

//     const cart = JSON.parse(localStorage.getItem("cart"));
//     const cartArray = Array.isArray(cart) ? cart : [];

//     // Find item IN THE CURRENT SLOT
//     const itemIndex = cartArray.findIndex(
//       (cartItem) =>
//         cartItem?.foodItemId === newCartItem?.foodItemId &&
//         cartItem.deliveryDate === newCartItem.deliveryDate &&
//         cartItem.session === newCartItem.session,
//     );

//     if (itemIndex === -1) {
//       cartArray.push(newCartItem);
//       localStorage.setItem("cart", JSON.stringify(cartArray));
//       setCarts(cartArray);
//       handleShow();
//     } else {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Item is already in this slot's cart`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const [cart, setCart] = useState([]);

//   useEffect(() => {
//     const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
//     setCart(storedCart);

//     const addonedCarts = async () => {
//       try {
//         await axios.post("http://localhost:7013/api/cart/addCart", {
//           userId: user?._id,
//           items: storedCart,
//           lastUpdated: Date.now,
//           username: user?.Fname,
//           mobile: user?.Mobile,
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     if (Carts && Carts.length > 0 && user?._id) {
//       addonedCarts();
//     }
//   }, [JSON.stringify(Carts), user?._id]);

//   const updateCartData = (updatedCart) => {
//     // console.log("Updating cart data:", updatedCart);
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//     setCart(updatedCart);
//     setCarts(updatedCart);
//   };

//   const increaseQuantity = (foodItemId, checkOf, item, matchedLocation) => {
//     const maxStock = matchedLocation?.Remainingstock || 0;
//     const selectedDateISO = selectedDate.toISOString();
//     // const isPreOrder = isFutureDate(selectedDate);
//     if (!checkOf) {
//       if (!isBeforeCutoff(selectedDate, selectedSession)) {
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "info",
//           title: `Cutoff time passed. Cannot increase quantity.`,
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//         return;
//       }
//       const updatedCart = Carts.map((cartItem) => {
//         if (
//           cartItem.foodItemId === foodItemId &&
//           cartItem.deliveryDate === selectedDateISO &&
//           cartItem.session === selectedSession &&
//           !cartItem.extra
//         ) {
//           if (cartItem.Quantity < maxStock) {
//             return {
//               ...cartItem,
//               Quantity: cartItem.Quantity + 1,
//               totalPrice: cartItem.price * (cartItem.Quantity + 1),
//             };
//           } else {
//             Swal2.fire({
//               toast: true,
//               position: "bottom",
//               icon: "info",
//               title: `No more stock available!`,
//               showConfirmButton: false,
//               timer: 3000,
//               timerProgressBar: true,
//               customClass: {
//                 popup: "me-small-toast",
//                 title: "me-small-toast-title",
//               },
//             });
//           }
//         }
//         return cartItem;
//       });
//       updateCartData(updatedCart);
//     } else {
//       const offerPr = Carts.find(
//         (ele) =>
//           ele.foodItemId == foodItemId &&
//           ele.deliveryDate === selectedDate.toISOString() &&
//           ele.session === selectedSession &&
//           !ele.extra,
//       );

//       if (offerPr && offerPr.offerQ > offerPr.Quantity) {
//         const updatedCart = Carts.map((cartItem) => {
//           if (
//             cartItem.foodItemId === foodItemId &&
//             cartItem.deliveryDate === selectedDateISO &&
//             cartItem.session === selectedSession &&
//             !cartItem.extra
//           ) {
//             if (cartItem.Quantity < maxStock) {
//               return {
//                 ...cartItem,
//                 Quantity: cartItem.Quantity + 1,
//                 totalPrice: cartItem.price * (cartItem.Quantity + 1),
//               };
//             } else {
//               Swal2.fire({
//                 toast: true,
//                 position: "bottom",
//                 icon: "info",
//                 title: `No more stock available!`,
//                 showConfirmButton: false,
//                 timer: 3000,
//                 timerProgressBar: true,
//                 customClass: {
//                   popup: "me-small-toast",
//                   title: "me-small-toast-title",
//                 },
//               });
//             }
//           }
//           return cartItem;
//         });

//         updateCartData(updatedCart);
//       } else {
//         const offerPrXt = Carts?.find(
//           (ele) =>
//             ele.foodItemId === foodItemId &&
//             ele.deliveryDate === selectedDate.toISOString() &&
//             ele.session === selectedSession &&
//             ele.extra === true,
//         );

//         if (offerPrXt) {
//           const updatedCart = Carts.map((cartItem) => {
//             if (
//               cartItem.foodItemId === foodItemId &&
//               cartItem.deliveryDate === selectedDateISO &&
//               cartItem.session === selectedSession &&
//               cartItem.extra === true
//             ) {
//               if (cartItem.Quantity < maxStock) {
//                 return {
//                   ...cartItem,
//                   Quantity: cartItem.Quantity + 1,
//                   totalPrice: cartItem.price * (cartItem.Quantity + 1),
//                 };
//               } else {
//                 Swal2.fire({
//                   toast: true,
//                   position: "bottom",
//                   icon: "info",
//                   title: `No more stock available!`,
//                   showConfirmButton: false,
//                   timer: 3000,
//                   timerProgressBar: true,
//                   customClass: {
//                     popup: "me-small-toast",
//                     title: "me-small-toast-title",
//                   },
//                 });
//               }
//             }
//             return cartItem;
//           });

//           updateCartData(updatedCart);
//         } else {
//           const effNew = getEffectivePrice(
//             item,
//             matchedLocation,
//             selectedSession,
//             true,
//           );
//           updateCartData([
//             ...Carts,
//             {
//               deliveryDate: selectedDate.toISOString(),
//               session: selectedSession,
//               foodItemId: item?._id,
//               price: effNew.price,
//               totalPrice: effNew.price,
//               image: item?.Foodgallery[0]?.image2,
//               unit: item?.unit,
//               foodname: item?.foodname,
//               quantity: item?.quantity,
//               Quantity: 1,
//               gst: item?.gst,
//               discount: item?.discount,
//               foodcategory: item?.foodcategory,
//               remainingstock: maxStock,
//               offerProduct: false,
//               minCart: 0,
//               actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//               offerQ: 0,
//               extra: true,
//             },
//           ]);
//         }
//       }
//     }
//   };

//   const [show, setShow] = useState(true);
//   const [expiryDays, setExpiryDays] = useState(0);

//   const decreaseQuantity = (foodItemId, checkOf, matchedLocation) => {
//     const selectedDateISO = selectedDate.toISOString();
//     if (!checkOf) {
//       const updatedCart = Carts.map((item) => {
//         if (
//           item.foodItemId === foodItemId &&
//           item.Quantity > 0 &&
//           item.deliveryDate === selectedDateISO &&
//           item.session === selectedSession &&
//           !item.extra
//         ) {
//           return {
//             ...item,
//             Quantity: item.Quantity - 1,
//             totalPrice: item.price * (item.Quantity - 1),
//           };
//         }
//         return item;
//       }).filter((item) => item.Quantity > 0);

//       updateCartData(updatedCart);
//     } else {
//       const offerPr = Carts.find(
//         (ele) =>
//           ele.foodItemId == foodItemId &&
//           ele.deliveryDate === selectedDate.toISOString() &&
//           ele.session === selectedSession &&
//           !ele.extra,
//       );

//       if (offerPr && offerPr.offerQ > offerPr.Quantity) {
//         // Handle regular offer item decrease
//         const updatedCart = Carts.map((item) => {
//           if (
//             item.foodItemId === foodItemId &&
//             item.Quantity > 0 &&
//             item.deliveryDate === selectedDateISO &&
//             item.session === selectedSession &&
//             !item.extra
//           ) {
//             const newQuantity = item.Quantity - 1;
//             // Calculate offer price correctly
//             let newTotalPrice;
//             if (newQuantity <= offerPr.offerQ) {
//               newTotalPrice = offerPr.price * newQuantity;
//             } else {
//               newTotalPrice = offerPr.actualPrice * newQuantity;
//             }

//             return {
//               ...item,
//               Quantity: newQuantity,
//               totalPrice: newTotalPrice,
//             };
//           }
//           return item;
//         }).filter((item) => item.Quantity > 0);

//         updateCartData(updatedCart);
//       } else {
//         // Handle extra item decrease
//         const offerExtraItem = Carts?.find(
//           (ele) =>
//             ele.foodItemId === foodItemId &&
//             ele.deliveryDate === selectedDate.toISOString() &&
//             ele.session === selectedSession &&
//             ele.extra === true,
//         );

//         if (offerExtraItem) {
//           const updatedCart = Carts.map((item) => {
//             if (
//               item.foodItemId === foodItemId &&
//               item.extra === true &&
//               item.Quantity > 0 &&
//               item.deliveryDate === selectedDateISO &&
//               item.session === selectedSession
//             ) {
//               return {
//                 ...item,
//                 Quantity: item.Quantity - 1,
//                 totalPrice: item.price * (item.Quantity - 1),
//               };
//             }
//             return item;
//           }).filter((item) => item.Quantity > 0);

//           updateCartData(updatedCart);
//         } else {
//           const updatedCart = Carts.map((item) => {
//             if (
//               item.foodItemId === foodItemId &&
//               item.Quantity > 0 &&
//               item.deliveryDate === selectedDateISO &&
//               item.session === selectedSession
//             ) {
//               return {
//                 ...item,
//                 Quantity: item.Quantity - 1,
//                 totalPrice: item.price * (item.Quantity - 1),
//               };
//             }
//             return item;
//           }).filter((item) => item.Quantity > 0);

//           updateCartData(updatedCart);
//         }
//       }
//     }
//   };

//   const isAddressReady = () => {
//     const addresstype1 = localStorage.getItem("addresstype");
//     if (!addresstype1) return false;

//     const addressKey =
//       addresstype1 === "apartment" ? "address" : "coporateaddress";
//     const addressRaw = localStorage.getItem(addressKey);

//     if (!addressRaw) return false;

//     try {
//       const address1 = JSON.parse(addressRaw);
//       if (!address1) return false;

//       const apartmentname =
//         address1?.apartmentname || address1?.Apartmentname || "";
//       const addressField = address1?.Address || address1?.address || "";
//       const pincode = address1?.pincode || "";

//       return apartmentname && addressField && pincode;
//     } catch (error) {
//       return false;
//     }
//   };

//   useEffect(() => {
//     if (Carts?.length > 0) {
//       handleShow();
//     }
//     // if (isAddressReady() && user?._id) {
//     if (user?._id) {
//       getAllOffer();
//     }
//   }, [user?._id]);

//   const groupedCarts = useMemo(() => {
//     if (!Carts || Carts.length === 0) return [];
//     const groups = Carts.reduce((acc, item) => {
//       const key = `${item.deliveryDate}|${item.session}`;

//       if (!item.deliveryDate || !item.session) return acc;

//       if (!acc[key]) {
//         acc[key] = {
//           session: item.session,
//           date: new Date(item.deliveryDate),
//           totalItems: 0,
//           subtotal: 0,
//           items: [],
//         };
//       }

//       acc[key].totalItems += item.Quantity;
//       acc[key].subtotal += item.price * item.Quantity;
//       acc[key].items.push(item);

//       return acc;
//     }, {});

//     return Object.values(groups).sort((a, b) => a.date - b.date);
//   }, [Carts]);

//   const overallTotalItems = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.totalItems, 0);
//   }, [groupedCarts]);

//   const overallSubtotal = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.subtotal, 0);
//   }, [groupedCarts]);
//   // console.log(address.location?.coordinates,'sfsdfdsf')

//   const [deliveryCharge, setDeliveryCharge] = useState([]);
//   const [filteredRates, setFilteredRates] = useState([]);

//   const getDeliveryRates = async () => {
//     try {
//       const res = await axios.get("http://localhost:7013/api/deliveryrate/all");
//       // console.log("Delivery rates:", res.data.data);
//       setDeliveryCharge(res.data.data);
//       setFilteredRates(res.data.data);
//     } catch (error) {
//       console.error("Error fetching delivery rates:", error);
//     }
//   };

//   const findDeliveryRate = (hubId, acquisitionChannel, status) => {
//     if (!deliveryCharge || deliveryCharge.length === 0) {
//       return 15; // Default fallback rate
//     }

//     // Try to find exact match with ALL criteria
//     const matchedRate = deliveryCharge.find(
//       (rate) =>
//         rate.hubId === hubId &&
//         rate.acquisition_channel === acquisitionChannel &&
//         rate.status === status,
//     );

//     // Return the matched rate if found, otherwise return default 15
//     return matchedRate?.deliveryRate || 15;
//   };

//   // Find delivery rate for this plan
//   const acquisitionChannel = user?.acquisition_channel;
//   const userStatus = user?.status;
//   const hubId = address?.hubId;
//   const deliveryRate = findDeliveryRate(hubId, acquisitionChannel, userStatus);

//   // console.log(userStatus, "status")

//   const proceedToPlan = async () => {
//     // console.log("🚀 proceedToPlan called");
//     // console.log("🚀 user:", user);
//     // console.log("🚀 Carts.length:", Carts.length);
//     // console.log("🚀 address:", address);

//     if (!user) {
//       console.log("❌ proceedToPlan - No user");
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Please Login!`,
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
//     if (Carts.length === 0) {
//       console.log("❌ proceedToPlan - No cart items");
//       return;
//     }

//     if (!address) {
//       console.log("❌ proceedToPlan - No address");
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Please Select Address!`,
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
//     // console.log("✅ proceedToPlan - All checks passed, proceeding...");
//     setloader(true);
//     try {
//       const addressDetails = {
//         addressId: address._id || "",
//         addressline: `${address.fullAddress}`,
//         addressType: address.addressType || "",
//         coordinates: address.location?.coordinates || [0, 0],
//         hubId: address.hubId || "",
//         hubName: address.hubName || "",
//         studentInformation: address.studentInformation,
//         schoolName: address.schoolName || "",
//         houseName: address.houseName || "",
//         apartmentName: address.apartmentName || "",
//         companyName: address.companyName || "",

//         companyId: address.companyId || "",
//         customerType: user.status || "",
//       };

//       // console.log("🚀 proceedToPlan - Making API call with:", {
//       //   userId: user._id,
//       //   mobile: user.Mobile,
//       //   username: user.Fname,
//       //   itemsCount: Carts.length,
//       //   addressDetails: addressDetails,
//       // });

//       const res = await axios.post(
//         "http://localhost:7013/api/user/plan/add-to-plan",
//         {
//           userId: user._id,
//           mobile: user.Mobile,
//           username: user.Fname,
//           companyId: user?.companyId || "",
//           items: Carts,
//           addressDetails: addressDetails,
//           deliveryCharge: deliveryRate,
//         },
//       );

//       // console.log("🚀 proceedToPlan - API response:", res.status);

//       if (res.status === 200) {
//         // console.log(
//         //   "✅ proceedToPlan - Success! Clearing cart and navigating to /my-plan"
//         // );
//         localStorage.removeItem("cart");
//         setCarts([]);
//         navigate("/my-plan");
//       }
//     } catch (error) {
//       console.error("❌ proceedToPlan - Error:", error);
//     } finally {
//       setloader(false);
//     }
//   };

//   const [gifUrl, setGifUrl] = useState("");
//   const [message, setMessage] = useState("");
//   const [AllOffer, setAllOffer] = useState([]);

//   const getAllOffer = async () => {
//     try {
//       const addresstype1 = localStorage.getItem("addresstype");
//       const addressRaw = localStorage.getItem(
//         addresstype1 === "apartment" ? "address" : "coporateaddress",
//       );

//       // if (!addressRaw) return;

//       // let address1;
//       // try {
//       //   address1 = JSON.parse(addressRaw);
//       // } catch (parseError) {
//       //   return;
//       // }

//       // if (!address1) return;

//       // const apartmentname =
//       //   address1?.apartmentname || address1?.Apartmentname || "";
//       // const addressField = address1?.Address || address1?.address || "";
//       // const pincode = address1?.pincode || "";

//       // if (!apartmentname || !addressField || !pincode) return;

//       // const location = `${apartmentname}, ${addressField}, ${pincode}`;

//       // if (user?._id && location) {
//       // if (user?._id ) {
//       const response = await axios.get(
//         // "http://localhost:7013/api/admin/getuseroffer",
//         "http://localhost:7013/api/admin/offers",
//         // {
//         //   id: user._id,
//         //   location,
//         //   addressRaw,
//         //   selectArea,
//         // },
//       );

//       // console.log(response, "offers............");

//       if (response.status === 200 && response.data?.data) {
//         setAllOffer(response.data.data);
//         // }
//       }
//     } catch (error) {
//       // console.log("getAllOffer error:", error);
//       setAllOffer([]);
//     }
//   };

//   // console.log(AllOffer, "alloffers.........");

//   useEffect(() => {
//     const checkTime = () => {
//       const now = new Date();
//       const currentTimeInMinutes = 10 * 60 + now.getMinutes();
//       const lunchStart = 7 * 60;
//       const lunchPrepStart = 9 * 60;
//       const lunchCookingStart = 11 * 60;
//       const lunchEnd = 14 * 60;

//       const dinnerStart = 14 * 60;
//       const dinnerPrepStart = 16 * 60 + 30;
//       const dinnerCookingStart = 18 * 60;
//       const dinnerEnd = 21 * 60;

//       const shopCloseTime = 21 * 60;

//       if (
//         currentTimeInMinutes >= lunchStart &&
//         currentTimeInMinutes < lunchPrepStart
//       ) {
//         setGifUrl("sourcing.gif");
//         setMessage(
//           "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= lunchPrepStart &&
//         currentTimeInMinutes < lunchCookingStart
//       ) {
//         setGifUrl("cuttingveg.gif");
//         setMessage(
//           "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= lunchCookingStart &&
//         currentTimeInMinutes < lunchEnd
//       ) {
//         setGifUrl("cookinggif.gif");
//         setMessage(
//           "Cooking your meal. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerStart &&
//         currentTimeInMinutes < dinnerPrepStart
//       ) {
//         setGifUrl("sourcing.gif");
//         setMessage(
//           "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerPrepStart &&
//         currentTimeInMinutes < dinnerCookingStart
//       ) {
//         setGifUrl("cuttingveg.gif");
//         setMessage(
//           "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerCookingStart &&
//         currentTimeInMinutes <= dinnerEnd
//       ) {
//         setGifUrl("cookinggif.gif");
//         setMessage(
//           "Cooking your meal. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (currentTimeInMinutes >= shopCloseTime) {
//         setGifUrl("Closed.gif");
//         setMessage(
//           "The Store is now closed. Operating hours: Lunch: 7:00 AM - 02:00 PM, Dinner: 2:00 PM - 9:00 PM.",
//         );
//       } else {
//         setGifUrl("Closed.gif");
//         setMessage(
//           "Orders are currently closed. Lunch: 7:00 AM - 02:00 PM. Dinner: 2:00 PM - 9:00 PM.",
//         );
//       }
//     };
//     checkTime();
//     const interval = setInterval(checkTime, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const [Fname, setFname] = useState("");
//   const [Mobile, setMobile] = useState("");
//   const [OTP, setOTP] = useState(["", "", "", ""]);
//   const [PasswordShow, setPasswordShow] = useState(false);

//   const userLogin = async () => {
//     if (!Mobile) {
//       return Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Enter Your Mobile Number`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//     setloader(true);
//     try {
//       const config = {
//         url: "/User/Sendotp",
//         method: "post",
//         baseURL: "http://localhost:7013/api",

//         headers: { "content-type": "application/json" },
//         data: {
//           Mobile: Mobile,
//         },
//       };

//       const res = await axios(config);
//       if (res.status === 401) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Invalid Mobile Number`,
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
//           title: `Something went wrong`,
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
//         setloader(false);
//         handleClose3();
//         handleShow2();
//       }
//     } catch (error) {
//       setloader(false);
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   function validateIndianMobileNumber(mobileNumber) {
//     const regex = /^[6-9]\d{9}$/;
//     return regex.test(mobileNumber);
//   }

//   const verifyOTP = async () => {
//     try {
//       if (!OTP) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Enter a valid OTP`,
//           showConfirmButton: false,
//           timer: 3000,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//       const config = {
//         url: "User/mobileotpverification",
//         method: "post",
//         baseURL: "http://localhost:7013/api/",
//         header: { "content-type": "application/json" },
//         data: {
//           Mobile: Mobile,
//           otp: OTP,
//         },
//       };
//       const res = await axios(config);
//       if (res.status === 200) {
//         updateUser(res.data.details);
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "success",
//           title: `OTP verified successfully`,
//           showConfirmButton: false,
//           timer: 3000,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });

//         if (!address) {
//           handleClose2();
//           handleClose3();
//           return navigate("/");
//         }
//         navigate("/");
//         handleClose2();
//         setOTP("");
//         setMobile("");
//       }
//     } catch (error) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const getCartQuantity = (itemId) => {
//     const selectedDateISO = selectedDate.toISOString();
//     return Carts?.filter(
//       (cartItem) =>
//         cartItem?.foodItemId === itemId &&
//         cartItem.deliveryDate === selectedDateISO &&
//         cartItem.session === selectedSession,
//     )?.reduce((total, curr) => total + curr?.Quantity, 0);
//   };

//   // Automatically remove today's Lunch/Dinner cart items after cutoff times
//   useEffect(() => {
//     if (!Carts || !setCarts) return;
//     const toKey = (date) => new Date(date).toISOString().slice(0, 10);
//     const cleanup = () => {
//       const now = new Date();
//       const todayKey = toKey(now);
//       let removed = [];
//       const shouldRemove = (item) => {
//         if (!item) return false;
//         const dateVal =
//           item.deliveryDate ||
//           item.date ||
//           item.slotDate ||
//           item.deliveryDateString;
//         const sessionVal = (
//           item.session ||
//           item.slotSession ||
//           item.mealSession ||
//           ""
//         ).toString();
//         if (!dateVal || !sessionVal) return false;
//         const itemKey = toKey(dateVal);
//         if (itemKey !== todayKey) return false;
//         // Remove if after cutoff
//         return !isBeforeCutoff(dateVal, sessionVal);
//       };
//       const newCarts = [];
//       Carts.forEach((it) => {
//         if (shouldRemove(it)) {
//           removed.push(it);
//         } else {
//           newCarts.push(it);
//         }
//       });
//       if (removed.length > 0) {
//         setCarts(newCarts);
//       }
//     };
//     cleanup();
//     const id = setInterval(cleanup, 60 * 5000);
//     return () => clearInterval(id);
//   }, [Carts, setCarts]);

//   const lastCartRawRef = useRef(null);
//   useEffect(() => {
//     const readCart = () => {
//       try {
//         const raw = localStorage.getItem("cart") || "[]";
//         if (raw !== lastCartRawRef.current) {
//           lastCartRawRef.current = raw;
//           const parsed = JSON.parse(raw);
//           setCarts(Array.isArray(parsed) ? parsed : []);
//           setCart(Array.isArray(parsed) ? parsed : []);
//         }
//       } catch (err) {
//         console.error("cart sync error", err);
//       }
//     };

//     readCart();
//     const intervalId = setInterval(readCart, 1000); // same-tab updates
//     const onStorage = (e) => {
//       if (e.key === "cart") readCart();
//     };
//     const onCartUpdated = () => readCart(); // custom event from Checkout
//     window.addEventListener("storage", onStorage);
//     window.addEventListener("cart_updated", onCartUpdated);

//     return () => {
//       clearInterval(intervalId);
//       window.removeEventListener("storage", onStorage);
//       window.removeEventListener("cart_updated", onCartUpdated);
//     };
//   }, [setCarts]);

//   // Remove auto-proceed to MyPlan logic - users should manually click "Move to My Plans"
//   // This prevents unwanted navigation to MyPlan when users add location after adding items
//   useEffect(() => {
//     // Clean up any leftover flags
//     localStorage.removeItem("triggerProceedToPlan");
//     sessionStorage.removeItem("justAddedAddress");
//   }, []);

//   // Render DateSessionSelector inline (no JS sticky in Home)
//   // The selector itself will handle sticky behavior if needed.

//   return (
//     <div>
//       <ToastContainer />

//       <div>
//         <Banner
//           Carts={Carts}
//           getAllOffer={getAllOffer}
//           isVegOnly={isVegOnly}
//           setIsVegOnly={setIsVegOnly}
//           onLocationDetected={handleLocationDetected} // Add this prop
//         />
//       </div>

//       {wallet?.balance > 0 && show && (
//         <div style={{ position: "relative" }}>
//           {/* DISABLED OVERLAY — visible + fully blocks interaction */}
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 backgroundColor: "#f9f8f6",
//                 opacity: 1,
//                 zIndex: 20,
//                 pointerEvents: "auto",
//               }}
//             ></div>
//           )}

//           {/* CONTENT */}
//           <CoinBalance
//             wallet={wallet}
//             transactions={transactions}
//             expiryDays={expiryDays}
//             setExpiryDays={setExpiryDays}
//             setShow={setShow}
//           />
//         </div>
//       )}

//       {/* Header for Date/Session selector (no sticky here) */}
//       <div className="sticky-menu-header" style={{ position: "relative" }}>
//         <div style={{ position: "relative" }}>
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 // backgroundColor: "#f9f8f6",
//                 zIndex: 10,
//                 pointerEvents: "none",
//                 opacity: 0.8,
//               }}
//             ></div>
//           )}
//           <DateSessionSelector
//             onChange={handleSelectionChange}
//             currentDate={selectedDate}
//             currentSession={selectedSession}
//             menuData={allHubMenuData}
//           />
//         </div>
//       </div>

//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               // backgroundColor: "#f9f8f6",
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.8,
//             }}
//           ></div>
//         )}
//         <Container>
//           <RatingModal />

//           {AllOffer?.length > 0 &&
//           JSON.parse(localStorage.getItem("primaryAddress")).hubId ===
//             AllOffer[0].hubId &&
//           user?.acquisition_channel === AllOffer[0]?.acquisition_channel ? (
//             <div className="maincontainer">
//               <div
//                 className="d-flex gap-3 mb-2 messageDiv  rounded-2 mt-3 justify-content-center"
//                 style={{
//                   backgroundColor: "white",
//                   padding: "5px",
//                   height: "50px",
//                 }}
//               >
//                 {/* <p
//                   className="mb-0 typewriter-desc"
//                   style={{
//                     color: "#6B8E23",
//                     fontSize: "1rem",
//                     textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
//                     lineHeight: "1.6",
//                     textAlign: "center",
//                   }}
//                 >
//                      🥳 {AllOffer[0]?.products[0]?.foodname} @ Just ₹{AllOffer[0]?.products[0]?.price})
//                 </p> */}
//                 <p
//                   className="mb-0 typewriter-desc"
//                   style={{
//                     color: "#6B8E23",
//                     fontSize: "1rem",
//                     textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
//                     lineHeight: "1.6",
//                     textAlign: "center",
//                   }}
//                 >
//                   {AllOffer[0]?.session === "Lunch" ? (
//                     <>
//                       {" "}
//                       Beat the afternoon hunger!{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price} for Lunch!
//                     </>
//                   ) : AllOffer[0]?.session === "Dinner" ? (
//                     <>
//                       {" "}
//                       Make your evening special!{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price} for Dinner!
//                     </>
//                   ) : (
//                     <>
//                       🥳 Limited time offer:{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price}!
//                     </>
//                   )}
//                 </p>
//               </div>
//             </div>
//           ) : null}

//           {loader ? (
//             <div
//               className="d-flex justify-content-center align-item-center"
//               style={{
//                 position: "fixed",
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)",
//                 zIndex: 9999,
//               }}
//             >
//               <div class="lds-ripple">
//                 <div></div>
//                 <div></div>
//               </div>
//             </div>
//           ) : null}
//         </Container>
//       </div>
//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               // backgroundColor: "#f9f8f6",
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.2,
//             }}
//           ></div>
//         )}
//         <div className="maincontainer">
//           <div className="mobile-product-box " style={{ marginBottom: "30px" }}>
//             <div style={{ marginBottom: "20px" }}>
//               {/* Pass Derived Tabs and State Handlers */}
//               <TabsComponent
//                 tabs={dynamicTabs}
//                 activeTab={selectedCategory}
//                 onTabClick={setSelectedCategory}
//               />
//             </div>

//             <div className="d-flex gap-1 mb-2 flex-column">
//               <div className="row">
//                 {/* RENDER THE FILTERED LIST */}
//                 {finalDisplayItems?.map((item, i) => {
//                   // const isPreOrder = isPreOrderFor(
//                   //   item?.deliveryDate || item?.deliveryDateISO,
//                   //   item?.session
//                   // );
//                   let matchedLocation = item.locationPrice?.[0];

//                   //   let checkOf = null;

//                   //  if (JSON.parse(localStorage.getItem("primaryAddress")).hubId === AllOffer[0]?.hubId) {
//                   //    checkOf = AllOffer?.flatMap(offer => offer?.products || [])
//                   //    .find(product => product?.foodItemId == item?._id?.toString());
//                   //  }

//                   let checkOf = null;

//                   // Safely get primary address from localStorage
//                   const primaryAddressJson =
//                     localStorage.getItem("primaryAddress");
//                   if (primaryAddressJson) {
//                     try {
//                       const primaryAddress = JSON.parse(primaryAddressJson);
//                       const selectedDate = new Date(); // Or get your selected date from state/props
//                       // const selectedDate = new Date(yourSelectedDate); // If you have a selected date from calendar

//                       // Check if AllOffer exists and has items
//                       if (AllOffer && AllOffer.length > 0) {
//                         // Find offers that match hubId AND have valid date range
//                         const validOffers = AllOffer.filter((offer) => {
//                           // Check hub match
//                           const hubMatches =
//                             offer?.hubId === primaryAddress?.hubId;
//                           const acquisitionChannel =
//                             offer?.acquisition_channel ===
//                             user?.acquisition_channel;
//                           // Parse dates
//                           const offerStartDate = new Date(offer?.startDate);
//                           const offerEndDate = new Date(offer?.endDate);
//                           const deliverydate = new Date(item.deliveryDate);

//                           // Check if selected date is within offer's date range
//                           const isWithinDateRange =
//                             deliverydate >= offerStartDate &&
//                             deliverydate <= offerEndDate;

//                           return (
//                             hubMatches &&
//                             isWithinDateRange &&
//                             acquisitionChannel
//                           );
//                         });

//                         // If valid offers exist, find the matching product
//                         if (validOffers.length > 0) {
//                           checkOf = validOffers
//                             .flatMap((offer) => offer?.products || [])
//                             .find(
//                               (product) =>
//                                 product?.foodItemId == item?._id?.toString(),
//                             );
//                         }
//                       }
//                     } catch (error) {
//                       console.error("Error parsing primaryAddress:", error);
//                     }
//                   }

//                   if (!matchedLocation) {
//                     matchedLocation = {
//                       Remainingstock: 0,
//                       hubPrice: item.hubPrice || item.basePrice || 0,
//                       preOrderPrice: item.preOrderPrice || 0,
//                       basePrice: item.basePrice || 0,
//                     };
//                   }
//                   const { price: effectivePrice } = getEffectivePrice(
//                     item,
//                     matchedLocation,
//                     item?.session,
//                     true,
//                   );
//                   return (
//                     <div
//                       key={item._id?.toString() || i}
//                       className="col-6 col-md-6 mb-2 d-flex justify-content-center"
//                     >
//                       <div className="mobl-product-card">
//                         <div className="productborder ">
//                           <div className="prduct-box rounded-1 cardbx">
//                             <div
//                               onClick={() => showDrawer(item)}
//                               className="imagebg"
//                             >
//                               {item?.foodcategory === "Veg" ? (
//                                 <img
//                                   src={IsVeg}
//                                   alt="IsVeg"
//                                   className="isVegIcon"
//                                 />
//                               ) : (
//                                 <img
//                                   src={IsNonVeg}
//                                   alt="IsNonVeg"
//                                   className="isVegIcon"
//                                 />
//                               )}
//                               <img
//                                 src={`${item?.Foodgallery[0]?.image2}`}
//                                 alt=""
//                                 className="mbl-product-img"
//                               />
//                             </div>
//                           </div>
//                           {item?.foodTags && (
//                             <div className="food-tag-container">
//                               {item.foodTags.map((tag) => (
//                                 <span
//                                   className="food-tag-pill"
//                                   style={{
//                                     backgroundColor: tag.tagColor,
//                                   }}
//                                 >
//                                   <img
//                                     src={chef}
//                                     alt=""
//                                     style={{
//                                       width: "10px",
//                                       height: "10px",
//                                       marginRight: "2px",
//                                     }}
//                                   />
//                                   {tag.tagName}
//                                 </span>
//                               ))}
//                             </div>
//                           )}

//                           <div className="food-name-container">
//                             <p className="food-name">{item?.foodname}</p>
//                             <small className="food-unit">{item?.unit}</small>
//                           </div>

//                           <div
//                             className="d-flex align-items-center mb-3"
//                             style={{ gap: "8px", flexWrap: "nowrap" }}
//                           >
//                             {matchedLocation?.basePrice &&
//                             matchedLocation?.basePrice !== effectivePrice &&
//                             parseFloat(matchedLocation?.basePrice) !==
//                               parseFloat(effectivePrice) ? (
//                               <div
//                                 className="align-items-start"
//                                 style={{
//                                   textDecoration: "line-through",
//                                   color: "#6b6b6b",
//                                   fontSize: "15px",
//                                   whiteSpace: "nowrap",
//                                   flexShrink: 0,
//                                   display: "flex",
//                                   gap: "2px",
//                                   marginLeft: "7px",
//                                 }}
//                               >
//                                 <span className="fw-normal">₹</span>
//                                 <span>{matchedLocation?.basePrice}</span>
//                               </div>
//                             ) : null}

//                             <div
//                               className="align-items-start"
//                               style={{
//                                 color: "#2c2c2c",
//                                 fontFamily: "Inter",
//                                 fontSize: "20px",
//                                 fontWeight: "500",
//                                 lineHeight: "25px",
//                                 letterSpacing: "-0.8px",
//                                 whiteSpace: "nowrap",
//                                 flexShrink: 0,
//                                 display: "flex",
//                                 gap: "2px",
//                               }}
//                             >
//                               {checkOf ? (
//                                 <div className="d-flex align-items-start gap-2">
//                                   <div
//                                     className="align-items-start"
//                                     style={{ display: "flex", gap: "2px" }}
//                                   >
//                                     <span className="fw-bold">₹</span>
//                                     <span
//                                       style={{
//                                         textDecoration: "line-through",
//                                         color: "#6b6b6b",
//                                         fontSize: "15px",
//                                         fontWeight: "400",
//                                         lineHeight: "18px",
//                                         letterSpacing: "-0.6px",
//                                         marginTop: "4px",
//                                       }}
//                                     >
//                                       {effectivePrice}
//                                     </span>
//                                   </div>
//                                   <div
//                                     className="align-items-start"
//                                     style={{
//                                       display: "flex",
//                                       gap: "2px",
//                                       marginLeft: "5px",
//                                     }}
//                                   >
//                                     <span className="fw-normal">₹</span>
//                                     <span>{checkOf?.price}</span>
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <div
//                                   className=" align-items-start"
//                                   style={{
//                                     display: "flex",
//                                     gap: "1px",
//                                     marginLeft: "6px",
//                                   }}
//                                 >
//                                   <span className="fw-bold">₹</span>
//                                   <span>{effectivePrice}</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>

//                           {/* {address && ( */}
//                           <div>
//                             <div className="guaranteed-label">
//                               <img
//                                 src={availabity}
//                                 alt=""
//                                 style={{ width: "11px", height: "11px" }}
//                               />{" "}
//                               Guaranteed Availability{" "}
//                             </div>
//                             {/* {checkOf && <BiSolidOffer color="green" />} */}
//                             {/* </div> */}
//                           </div>
//                           {/* )} */}

//                           <div className="d-flex justify-content-center mb-2">
//                             {getCartQuantity(item?._id) === 0 ? (
//                               // Item not in cart
//                               address && gifUrl === "Closed.gif" ? (
//                                 <button
//                                   className="add-to-cart-btn-disabled"
//                                   disabled
//                                 >
//                                   <span className="add-to-cart-btn-text">
//                                     {" "}
//                                     Add
//                                   </span>
//                                   <FaPlus className="add-to-cart-btn-icon" />
//                                 </button>
//                               ) : (
//                                 <button
//                                   className={`add-to-cart-btn
//                                     ${
//                                       (user && !address) ||
//                                       isBeforeCutoff(
//                                         item.deliveryDate,
//                                         item.deliverySession,
//                                       )
//                                         ? "disabled-btn"
//                                         : ""
//                                     }`}
//                                   onClick={() =>
//                                     addCart1(item, checkOf, matchedLocation)
//                                   }
//                                   disabled={
//                                     (user && !address) ||
//                                     isBeforeCutoff(
//                                       item.deliveryDate,
//                                       item.deliverySession,
//                                     )
//                                   }
//                                 >
//                                   <div className="pick-btn-text">
//                                     <span className="pick-btn-text1">PICK</span>
//                                     <span className="pick-btn-text2">
//                                       {/* {`for ${new Date(
//                                           item.deliveryDate
//                                         ).toLocaleDateString("en-GB", {
//                                           day: "2-digit",
//                                           month: "short",
//                                         })}`} */}
//                                       Confirm Later
//                                     </span>
//                                   </div>

//                                   <span className="add-to-cart-btn-icon">
//                                     {" "}
//                                     <FaPlus />
//                                   </span>
//                                 </button>
//                               )
//                             ) : getCartQuantity(item?._id) > 0 ? (
//                               // Item in cart with quantity
//                               <button className="increaseBtn">
//                                 <div
//                                   className="faplus"
//                                   onClick={() =>
//                                     !(user && !address) &&
//                                     decreaseQuantity(
//                                       item?._id,
//                                       checkOf,
//                                       matchedLocation,
//                                     )
//                                   }
//                                   style={{
//                                     opacity: user && !address ? 0.5 : 1,
//                                     pointerEvents:
//                                       user && !address ? "none" : "auto",
//                                   }}
//                                 >
//                                   <FaMinus />
//                                 </div>
//                                 <div className="faQuantity">
//                                   {getCartQuantity(item?._id)}
//                                 </div>
//                                 <div
//                                   className="faplus"
//                                   onClick={() =>
//                                     !(user && !address) &&
//                                     increaseQuantity(
//                                       item?._id,
//                                       checkOf,
//                                       item,
//                                       matchedLocation,
//                                     )
//                                   }
//                                   style={{
//                                     opacity: user && !address ? 0.5 : 1,
//                                     pointerEvents:
//                                       user && !address ? "none" : "auto",
//                                   }}
//                                 >
//                                   <FaPlus />
//                                 </div>
//                               </button>
//                             ) : gifUrl === "Closed.gif" ? (
//                               <button className="add-to-cart-btn" disabled>
//                                 <span className="add-to-cart-btn-text">
//                                   {" "}
//                                   Add{" "}
//                                 </span>
//                                 <span className="add-to-cart-btn-icon">
//                                   {" "}
//                                   <FaPlus />
//                                 </span>
//                               </button>
//                             ) : (
//                               <button
//                                 className="add-to-cart-btn"
//                                 onClick={() =>
//                                   addCart1(item, checkOf, matchedLocation)
//                                 }
//                                 disabled={user && !address}
//                                 style={{
//                                   opacity: user && !address ? 0.5 : 1,
//                                 }}
//                               >
//                                 <span className="add-to-cart-btn-text">
//                                   {" "}
//                                   Add{" "}
//                                 </span>
//                                 <span className="add-to-cart-btn-icon">
//                                   {" "}
//                                   <FaPlus />
//                                 </span>
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}

//                 {!loader && finalDisplayItems.length === 0 && (
//                   <div className="col-12 text-center my-5">
//                     {user &&
//                     (!localStorage.getItem("primaryAddress") ||
//                       localStorage.getItem("primaryAddress") === "null") ? (
//                       <div>
//                         <h4>No location selected.</h4>
//                         <p>
//                           Please add your location to view the menu for your
//                           area.
//                         </p>
//                         <button
//                           className="mt-2"
//                           onClick={() => navigate("/location")}
//                           style={{
//                             backgroundColor: "#6B8E23",
//                             color: "white",
//                             padding: "10px 20px",
//                             borderRadius: "5px",
//                             border: "none",
//                           }}
//                         >
//                           Add Location
//                         </button>
//                       </div>
//                     ) : (
//                       <>
//                         <h4>No items available for this slot.</h4>
//                         <p>
//                           Please check back later or select a different day!
//                         </p>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//             {/* <div className="col-md-12">
//               <p className="copyright-text">
//                 © CULINARY CRAVINGS CONVENIENCE PVT LTD all rights reserved.
//               </p>
//             </div> */}
//           </div>
//         </div>

//         <MultiCartDrawer
//           proceedToPlan={proceedToPlan}
//           groupedCarts={groupedCarts}
//           overallSubtotal={overallSubtotal}
//           overallTotalItems={overallTotalItems}
//           onJumpToSlot={handleSelectionChange}
//         />

//         <Modal show={show3} backdrop="static" onHide={handleClose3}>
//           <Modal.Header closeButton>
//             <Modal.Title className="d-flex align-items-center gap-1">
//               <FaLock color="#6B8E23" /> <span>Welcome to Dailydish</span>{" "}
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <div className="login-whatsappwithicon">
//                 <FaSquareWhatsapp size={42} color="green" />

//                 <Form.Control
//                   type="number"
//                   placeholder="Enter Your WhatsApp Number"
//                   value={Mobile}
//                   onChange={(e) => setMobile(e.target.value)}
//                 />
//               </div>

//               <Button
//                 variant=""
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//                 onClick={() => {
//                   if (!validateIndianMobileNumber(Mobile)) {
//                     Swal2.fire({
//                       toast: true,
//                       position: "bottom",
//                       icon: "error",
//                       title: `Invalid mobile number`,
//                       showConfirmButton: false,
//                       timer: 3000,
//                       timerProgressBar: true,
//                       customClass: {
//                         popup: "me-small-toast",
//                         title: "me-small-toast-title",
//                       },
//                     });
//                     return;
//                   }
//                   userLogin();
//                 }}
//               >
//                 Send otp
//               </Button>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleClose3}>
//               Close
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         <Modal
//           show={show2}
//           onHide={handleClose2}
//           size="sm"
//           style={{
//             zIndex: "99999",
//             position: "absolute",
//             top: "30%",
//             left: "0%",
//           }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Enter OTP</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <span style={{ fontSize: "13px" }}>
//               An OTP has been sent to your Phone Number
//             </span>
//             <div className="d-flex gap-1 mt-3 mb-3">
//               <InputGroup className="mb-2" style={{ background: "white" }}>
//                 <Form.Control
//                   type={PasswordShow ? "text" : "password"}
//                   className="login-input"
//                   placeholder="Enter OTP"
//                   aria-describedby="basic-addon1"
//                   onChange={(e) => setOTP(e.target.value)}
//                 />
//                 <Button
//                   variant=""
//                   style={{ borderRadius: "0px", border: "1px solid black" }}
//                   onClick={() => setPasswordShow(!PasswordShow)}
//                   className="passbtn"
//                 >
//                   {PasswordShow ? <FaEye /> : <FaEyeSlash />}
//                 </Button>
//               </InputGroup>
//             </div>
//             <div>
//               <Button
//                 variant=""
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//                 onClick={verifyOTP}
//               >
//                 Continue
//               </Button>
//             </div>
//           </Modal.Body>
//         </Modal>

//         <Drawer
//           placement="bottom"
//           closable={false}
//           onClose={onClose}
//           open={open}
//           key="bottom"
//           height={600}
//           className="description-product"
//           style={{ zIndex: 99999 }}
//           zIndex={99999}
//         >
//           <div className="modal-container-food">
//             <button className="custom-close-btn" onClick={onClose}>
//               ×
//             </button>
//             <div className="modern-food-item">
//               <div className="food-image-container">
//                 <div className="image-loading-spinner" id="image-spinner"></div>

//                 {foodData?.Foodgallery?.length > 0 && (
//                   <img
//                     src={`${foodData.Foodgallery[0].image2}`}
//                     alt={foodData?.foodname}
//                     className="modern-food-image"
//                     onLoad={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       const image =
//                         document.querySelector(".modern-food-image");
//                       if (spinner) spinner.classList.add("hidden");
//                       if (image) image.classList.add("loaded");
//                     }}
//                     onError={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       if (spinner) spinner.classList.add("hidden");
//                     }}
//                   />
//                 )}
//                 <div className="food-category-icon">
//                   {foodData?.foodcategory === "Veg" ? (
//                     <img src={IsVeg} alt="IsVeg" className="isVegIcon" />
//                   ) : (
//                     <img src={IsNonVeg} alt="IsNonVeg" className="isVegIcon" />
//                   )}
//                 </div>
//               </div>

//               <div className="food-details">
//                 <h2 className="food-title">{foodData?.foodname}</h2>
//                 <p className="food-description">{foodData?.fooddescription}</p>

//                 {(() => {
//                   const currentLocationString = `${address?.apartmentname}, ${address?.Address}, ${address?.pincode}`;

//                   const matchedLocation =
//                     foodData?.locationPrice?.length > 0
//                       ? foodData.locationPrice[0]
//                       : {
//                           Remainingstock: 0,
//                           hubPrice:
//                             foodData.hubPrice || foodData.basePrice || 0,
//                           preOrderPrice: foodData.preOrderPrice || 0,
//                           basePrice: foodData.basePrice || 0,
//                         };

//                   const checkOffer = AllOffer?.find(
//                     (offer) =>
//                       offer?.locationId?._id === address?._id &&
//                       offer?.products
//                         ?.map((product) => product._id)
//                         .includes(foodData?._id),
//                   );

//                   const eff = getEffectivePrice(
//                     foodData,
//                     matchedLocation,
//                     foodData?.session,
//                     true,
//                   );
//                   const currentPrice = checkOffer
//                     ? checkOffer.price
//                     : eff.price;
//                   const originalPrice = eff.price;

//                   const stockCount = matchedLocation?.Remainingstock || 0;

//                   // const isPreOrderDrawer = isPreOrderFor(
//                   //   foodData?.deliveryDate || foodData?.deliveryDateISO,
//                   //   foodData?.session
//                   // );

//                   return (
//                     <>
//                       <div className="pricing-section">
//                         <div className="pricing-display">
//                           <span className="current-price">₹{currentPrice}</span>
//                           {checkOffer && (
//                             <span
//                               className="original-price"
//                               style={{ marginLeft: "10px" }}
//                             >
//                               ₹{originalPrice}
//                             </span>
//                           )}
//                         </div>
//                         <div className="availability-banner">
//                           {stockCount > 0 ? (
//                             <>
//                               {checkOffer && (
//                                 <BiSolidOffer
//                                   color="green"
//                                   style={{ marginRight: "5px" }}
//                                 />
//                               )}{" "}
//                               {/* {!isPreOrderDrawer &&
//                                 `${stockCount} servings left!`} */}
//                             </>
//                           ) : (
//                             "Sold Out"
//                           )}
//                         </div>
//                       </div>

//                       {getCartQuantity(foodData?._id) > 0 ? (
//                         <div className="increaseBtn">
//                           <div
//                             className="faplus"
//                             onClick={() => {
//                               if (!(user && !address)) {
//                                 decreaseQuantity(
//                                   foodData?._id,
//                                   checkOffer,
//                                   matchedLocation,
//                                 );
//                               }
//                             }}
//                             style={{
//                               opacity: user && !address ? 0.5 : 1,
//                               pointerEvents: user && !address ? "none" : "auto",
//                             }}
//                           >
//                             <FaMinus />
//                           </div>
//                           <div className="faQuantity">
//                             {getCartQuantity(foodData?._id)}
//                           </div>
//                           <div
//                             className="faplus"
//                             onClick={() => {
//                               if (!(user && !address)) {
//                                 increaseQuantity(
//                                   foodData?._id,
//                                   checkOffer,
//                                   foodData,
//                                   matchedLocation,
//                                 );
//                               }
//                             }}
//                             style={{
//                               opacity: user && !address ? 0.5 : 1,
//                               pointerEvents: user && !address ? "none" : "auto",
//                             }}
//                           >
//                             <FaPlus />
//                           </div>
//                         </div>
//                       ) : stockCount > 0 && gifUrl !== "Closed.gif" ? (
//                         // <button
//                         //   className="add-to-plate-btn"
//                         //   onClick={() => {
//                         //     addCart1(foodData, checkOffer, matchedLocation);
//                         //   }}
//                         //   disabled={user && !address}
//                         //   style={{
//                         //     opacity: user && !address ? 0.5 : 1,
//                         //     pointerEvents: user && !address ? "none" : "auto",
//                         //   }}
//                         // >
//                         //   <span>Add to plate</span>
//                         //   <div className="plate-icon">🍽️</div>
//                         // </button>
//                         ""
//                       ) : (
//                         <button
//                           className={
//                             gifUrl === "Closed.gif"
//                               ? "add-to-cart-btn-disabled"
//                               : "sold-out-btn"
//                           }
//                           disabled
//                         >
//                           <span className="add-to-cart-btn-text">
//                             {gifUrl === "Closed.gif" ? "Closed" : "Sold Out"}
//                           </span>
//                         </button>
//                       )}
//                     </>
//                   );
//                 })()}
//               </div>
//             </div>
//           </div>
//         </Drawer>
//       </div>

//       {/* Location Selection Popup */}
//       {/* <LocationRequiredPopup
//         show={showLocationPopup}
//         onClose={() => setShowLocationPopup(false)}
//       /> */}

//       {/* {false && showLocationPopup && (
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
//           onClick={() => setShowLocationPopup(false)}
//         >
//           <div
//             style={{
//               backgroundColor: "white",
//               borderRadius: "16px",
//               padding: "24px",
//               maxWidth: "400px",
//               width: "100%",
//               textAlign: "center",
//               boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
//               animation: "modalFadeIn 0.3s ease-out",
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div
//               style={{
//                 fontSize: "48px",
//                 marginBottom: "16px",
//                 color: "#6B8E23",
//               }}
//             >
//               <MdAddLocationAlt />
//             </div>
//             <h3
//               style={{
//                 marginBottom: "12px",
//                 color: "#333",
//                 fontSize: "20px",
//                 fontWeight: "600",
//                 fontFamily: "Inter",
//               }}
//             >
//               Add Location to See Menu
//             </h3>
//             <p
//               style={{
//                 marginBottom: "24px",
//                 color: "#666",
//                 fontSize: "14px",
//                 lineHeight: "1.5",
//                 fontFamily: "Inter",
//               }}
//             >
//               Please add your delivery location to view available menu items and place orders.
//             </p>
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: "12px",
//                 marginTop: "12px",
//               }}
//             >
//               <button
//                 onClick={() => {
//                   setShowLocationPopup(false);
//                   navigate("/location");
//                 }}
//                 style={{
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "12px",
//                   padding: "14px",
//                   fontSize: "16px",
//                   fontWeight: "600",
//                   cursor: "pointer",
//                   transition: "background-color 0.2s",
//                   fontFamily: "Inter",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.target.style.backgroundColor = "#5a7a1a";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.backgroundColor = "#6B8E23";
//                 }}
//               >
//                 Add Location
//               </button>
//               <button
//                 onClick={() => setShowLocationPopup(false)}
//                 style={{
//                   backgroundColor: "transparent",
//                   color: "#666",
//                   border: "1px solid #ddd",
//                   borderRadius: "12px",
//                   padding: "12px",
//                   fontSize: "14px",
//                   fontWeight: "500",
//                   cursor: "pointer",
//                   transition: "all 0.2s",
//                   fontFamily: "Inter",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.target.style.backgroundColor = "#f5f5f5";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.backgroundColor = "transparent";
//                 }}
//               >
//                 Close
//               </button>
//             </div>
//           </div>

//           <style jsx>{`
//             @keyframes modalFadeIn {
//               from {
//                 opacity: 0;
//                 transform: scale(0.9);
//               }
//               to {
//                 opacity: 1;
//                 transform: scale(1);
//               }
//             }
//           `}</style>
//         </div>
//       )} */}

//       <div style={{ marginBottom: "80px" }}>
//         <Footer />
//       </div>

//       <BottomNav />
//     </div>
//   );
// };

// const TabsComponent = ({ tabs, activeTab, onTabClick }) => {
//   return (
//     <div className="tabs-container2">
//       <div className="tabs-scroll-container">
//         <div className="tabs-scroll">
//           {tabs.map((tab) => (
//             <button
//               key={tab}
//               className={`tab-button ${activeTab === tab ? "active" : ""}`}
//               onClick={() => onTabClick(tab)}
//             >
//               <span className="tab-button-text">{tab}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//       <style jsx>{`
//         .tabs-container2 {
//           background-color: ${Colors.creamWalls};
//           border-bottom-left-radius: 16px;
//           border-bottom-right-radius: 16px;
//           position: relative;
//           border-bottom: 2px solid #fff;
//           box-shadow:
//             0 1px 3px rgba(0, 0, 0, 0.1),
//             0 2px 6px rgba(0, 0, 0, 0.05);
//         }
//         .tabs-scroll-container {
//           overflow-x: auto;
//           -webkit-overflow-scrolling: touch;
//           scrollbar-width: none;
//         }
//         .tabs-scroll-container::-webkit-scrollbar {
//           display: none;
//         }
//         .tabs-scroll {
//           display: inline-flex;
//           min-width: 100%;
//           gap: 10px;
//           padding: 0 4px;
//         }
//         .tab-button {
//           display: inline-flex;
//           justify-content: center;
//           align-items: center;
//           padding: 8px 24px;
//           border-radius: 20px;
//           border: none;
//           background: transparent;
//           cursor: pointer;
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//           white-space: nowrap;
//           flex-shrink: 0;
//           min-height: 25px;
//         }
//         .tab-button:hover {
//           background-color: ${Colors.warmbeige}40;
//           transform: translateY(-1px);
//         }
//         .tab-button.active {
//           background-color: ${Colors.greenCardamom};
//           padding: 4px 8px;
//           box-shadow: 0 2px 8px ${Colors.greenCardamom}80;
//           width: auto;
//           height: auto;
//           border-radius: 20px;
//         }
//         .tab-button.active:hover {
//           background-color: ${Colors.greenCardamom}E6;
//           transform: translateY(-1px) scale(1.02);
//         }
//         .tab-button-text {
//           font-family: "Inter", sans-serif;
//           fontsize: 14px;
//           font-weight: 400;
//           line-height: 18px;
//           letter-spacing: -0.7px;
//           color: ${Colors.primaryText};
//           transition: all 0.3s ease;
//         }
//         .tab-button.active .tab-button-text {
//           font-family: "Inter", sans-serif;
//           fontsize: 16px;
//           font-weight: 900;
//           line-height: 21px;
//           letter-spacing: -0.8px;
//           color: ${Colors.appForeground};
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Home;













































// import {
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   useRef,
//   useCallback,
// } from "react";
// import { Container } from "react-bootstrap";
// import { FaEye, FaEyeSlash, FaLock, FaUser, FaAngleUp } from "react-icons/fa";
// import { Button, Form, InputGroup, Modal } from "react-bootstrap";
// import { FaPlus, FaMinus, FaSquareWhatsapp } from "react-icons/fa6";
// import "../Styles/Home.css";
// import Banner from "./Banner";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Drawer } from "antd";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import CoinBalance from "./CoinBalance";
// import { WalletContext } from "../WalletContext";
// import RatingModal from "./RatingModal";
// import { BiSolidOffer } from "react-icons/bi";
// import Swal2 from "sweetalert2";
// import moment from "moment";
// import IsVeg from "../assets/isVeg=yes.svg";
// import IsNonVeg from "../assets/isVeg=no.svg";
// import MultiCartDrawer from "./MultiCartDrawer";
// import DateSessionSelector from "./DateSessionSelector";
// import chef from "./../assets/chef_3.png";
// import { Colors, FontFamily } from "../Helper/themes";
// import BottomNav from "./BottomNav";
// import LocationRequiredPopup from "./LocationRequiredPopup";
// import { MdAddLocationAlt } from "react-icons/md";
// import availabity from "./../assets/weui_done2-filled.png";
// import Footer from "./Footer";

// const Home = ({ selectArea, setSelectArea, Carts, setCarts }) => {
//   // Store user in state to avoid infinite render loop
//   const [user, setUser] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   });

//   // Listen for user changes in localStorage
//   useEffect(() => {
//     const handleStorage = (e) => {
//       if (e.key === "user") {
//         try {
//           setUser(JSON.parse(e.newValue));
//         } catch {
//           setUser(null);
//         }
//       }
//     };
//     window.addEventListener("storage", handleStorage);
//     return () => window.removeEventListener("storage", handleStorage);
//   }, []);

//   // Provide a function to update user state and localStorage together
//   const updateUser = (userObj) => {
//     setUser(userObj);
//     if (userObj) {
//       localStorage.setItem("user", JSON.stringify(userObj));
//     } else {
//       localStorage.removeItem("user");
//     }
//     window.dispatchEvent(new Event("userUpdated"));
//   };

//   const navigate = useNavigate();
//   const location = useLocation();

//   const { wallet, transactions, loading, walletSeting, getorderByCustomerId } =
//     useContext(WalletContext);

//   const [loader, setloader] = useState(false);
//   const [allHubMenuData, setAllHubMenuData] = useState([]);

//   // --- NEW STATE FOR FILTERS ---
//   const [isVegOnly, setIsVegOnly] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("");

//   const [address, setAddress] = useState(null);

//   // ============ NEW: Track if default hub menu should load ============
//   const [shouldLoadDefaultMenu, setShouldLoadDefaultMenu] = useState(!user);

//   // ============ NEW: Cutoff validation state ============
//   const [cutoffValidation, setCutoffValidation] = useState({
//     allowed: true,
//     message: "",
//     cutoffDateTime: null,
//     nextAvailableDateTime: null,
//   });
//   const [cutoffLoading, setCutoffLoading] = useState(false);

//   // State for offers
//   const [gifUrl, setGifUrl] = useState("");
//   const [message, setMessage] = useState("");
//   const [AllOffer, setAllOffer] = useState([]);

//   // ============ getAllOffer function - MOVED HERE before useEffect that uses it ============
//   const getAllOffer = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:7013/api/admin/offers",
//       );
//       if (response.status === 200 && response.data?.data) {
//         setAllOffer(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching offers:", error);
//       setAllOffer([]);
//     }
//   };
//   // ================================================================================

//   // Initial address loading with better error handling
//   useEffect(() => {
//     const loadInitialAddress = () => {
//       try {
//         const primaryAddress = localStorage.getItem("primaryAddress");
//         const currentLocation = localStorage.getItem("currentLocation");
//         const defaultHubData = localStorage.getItem("defaultHubData");

//         // Priority 1: Primary address (for logged-in users)
//         if (primaryAddress && primaryAddress !== "null") {
//           const parsedPrimary = JSON.parse(primaryAddress);
//           setAddress(parsedPrimary);
//           setShouldLoadDefaultMenu(false);
//         }
//         // Priority 2: Current location (user-selected)
//         else if (currentLocation && currentLocation !== "null") {
//           const parsedCurrent = JSON.parse(currentLocation);
//           setAddress(parsedCurrent);
//           setShouldLoadDefaultMenu(false);
//         }
//         // Priority 3: Default hub data (for non-logged-in users)
//         else if (defaultHubData && defaultHubData !== "null") {
//           try {
//             const parsedDefault = JSON.parse(defaultHubData);
//             const defaultAddress = {
//               hubId:
//                 parsedDefault.hubId ||
//                 parsedDefault._id ||
//                 "69613cb1145c1aaedd9859cd",
//               hubName:
//                 parsedDefault.hubName || parsedDefault.name || "Default Hub",
//               fullAddress:
//                 parsedDefault.address || "Select your location to view menu",
//               isDefaultHub: true,
//               location: parsedDefault.location || {
//                 type: "Point",
//                 coordinates: [0, 0],
//               },
//             };
//             setAddress(defaultAddress);
//             setShouldLoadDefaultMenu(false);
//             localStorage.setItem(
//               "currentLocation",
//               JSON.stringify(defaultAddress),
//             );
//           } catch (e) {
//             console.error("Error parsing default hub data:", e);
//             setAddress(null);
//             setShouldLoadDefaultMenu(true);
//           }
//         } else {
//           setAddress(null);
//           setShouldLoadDefaultMenu(!user);
//         }
//       } catch (error) {
//         console.error("Error loading initial address:", error);
//         setAddress(null);
//         setShouldLoadDefaultMenu(!user);
//       }
//     };

//     loadInitialAddress();
//     getDeliveryRates();
//   }, [user]);

//   // ============ Function to validate cutoff timing (FIXED: uses status) ============
//   const validateCutoffTiming = useCallback(
//     async (hubId, session, deliveryDate) => {
//       if (!hubId || !session) return true;

//       try {
//         setCutoffLoading(true);
//         // FIXED: Use status instead of acquisitionChannel
//         const status = user?.status === "Employee" ? "Employee" : "Normal";

//         // console.log("User status:", user?.status);
//         // console.log("Status being sent:", status);

//         const response = await axios.post(
//           "http://localhost:7013/api/Hub/validate-order-timing",
//           {
//             hubId: hubId,
//             session: session.toLowerCase(),
//             status: status, // Changed from acquisitionChannel to status
//             deliveryDate:
//               deliveryDate instanceof Date
//                 ? deliveryDate.toISOString()
//                 : deliveryDate,
//           },
//         );

//         if (response.status === 200) {
//           setCutoffValidation({
//             allowed: response.data.allowed,
//             message: response.data.message,
//             cutoffDateTime: response.data.cutoffDateTime,
//             nextAvailableDateTime: response.data.nextAvailableDateTime,
//           });
//           return response.data.allowed;
//         }
//         return true;
//       } catch (error) {
//         console.error("Error validating cutoff timing:", error);
//         return true;
//       } finally {
//         setCutoffLoading(false);
//       }
//     },
//     [user?.status],
//   );

//   // Function to get next available ordering time
//   const getNextAvailableTime = useCallback(
//     async (hubId, session) => {
//       if (!hubId || !session) return null;

//       try {
//         const status = user?.status === "Employee" ? "Employee" : "Normal";
//         const response = await axios.get(
//           `http://localhost:7013/api/Hub/next-available-time/${hubId}/${session.toLowerCase()}/${status}`,
//         );

//         if (response.status === 200) {
//           return response.data;
//         }
//         return null;
//       } catch (error) {
//         console.error("Error getting next available time:", error);
//         return null;
//       }
//     },
//     [user?.status],
//   );

//   // --- DATE & SESSION STATE ---
//   const getNormalizedToday = () => {
//     const now = new Date();
//     return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
//   };

//   const [selectedDate, setSelectedDate] = useState(() => {
//     if (location.state?.targetDate) return new Date(location.state.targetDate);
//     return getNormalizedToday();
//   });

//   const [selectedSession, setSelectedSession] = useState(() => {
//     if (location.state?.targetSession) return location.state.targetSession;
//     return "Lunch";
//   });

//   // ============ Check cutoff when date/session or hub changes ============
//   useEffect(() => {
//     const checkCutoff = async () => {
//       const currentAddress =
//         address ||
//         (() => {
//           try {
//             const primaryAddress = localStorage.getItem("primaryAddress");
//             const currentLocation = localStorage.getItem("currentLocation");
//             return primaryAddress
//               ? JSON.parse(primaryAddress)
//               : currentLocation
//                 ? JSON.parse(currentLocation)
//                 : null;
//           } catch {
//             return null;
//           }
//         })();

//       if (currentAddress?.hubId && selectedDate && selectedSession) {
//         const isAllowed = await validateCutoffTiming(
//           currentAddress.hubId,
//           selectedSession,
//           selectedDate,
//         );

//         // If not allowed and user tries to add to cart, show message
//         if (!isAllowed) {
//           console.log(
//             "Order not allowed for this slot:",
//             cutoffValidation.message,
//           );
//         }
//       }
//     };

//     checkCutoff();
//   }, [address, selectedDate, selectedSession, validateCutoffTiming]);

//   // ============ Check cutoff when date/session or hub changes ============
//   useEffect(() => {
//     const checkCutoff = async () => {
//       const currentAddress =
//         address ||
//         (() => {
//           try {
//             const primaryAddress = localStorage.getItem("primaryAddress");
//             const currentLocation = localStorage.getItem("currentLocation");
//             return primaryAddress
//               ? JSON.parse(primaryAddress)
//               : currentLocation
//                 ? JSON.parse(currentLocation)
//                 : null;
//           } catch {
//             return null;
//           }
//         })();

//       if (currentAddress?.hubId && selectedDate && selectedSession) {
//         await validateCutoffTiming(
//           currentAddress.hubId,
//           selectedSession,
//           selectedDate,
//         );
//       }
//     };

//     checkCutoff();
//   }, [address, selectedDate, selectedSession, validateCutoffTiming]);

//   // Add a function to refresh address from localStorage
//   const refreshAddress = useCallback(() => {
//     try {
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const currentLocation = localStorage.getItem("currentLocation");
//       const defaultHubData = localStorage.getItem("defaultHubData");

//       if (primaryAddress && primaryAddress !== "null") {
//         const parsedPrimary = JSON.parse(primaryAddress);
//         setAddress(parsedPrimary);
//         setShouldLoadDefaultMenu(false);
//       } else if (currentLocation && currentLocation !== "null") {
//         const parsedCurrent = JSON.parse(currentLocation);
//         setAddress(parsedCurrent);
//         setShouldLoadDefaultMenu(false);
//       } else if (defaultHubData && defaultHubData !== "null") {
//         try {
//           const parsedDefault = JSON.parse(defaultHubData);
//           const defaultAddress = {
//             hubId:
//               parsedDefault.hubId ||
//               parsedDefault._id ||
//               "69613cb1145c1aaedd9859cd",
//             hubName:
//               parsedDefault.hubName || parsedDefault.name || "Default Hub",
//             fullAddress:
//               parsedDefault.address || "Select your location to view menu",
//             isDefaultHub: true,
//             location: parsedDefault.location || {
//               type: "Point",
//               coordinates: [0, 0],
//             },
//           };
//           setAddress(defaultAddress);
//           setShouldLoadDefaultMenu(false);
//           localStorage.setItem(
//             "currentLocation",
//             JSON.stringify(defaultAddress),
//           );
//         } catch (e) {
//           console.error("Error parsing default hub data:", e);
//           setAddress(null);
//           setShouldLoadDefaultMenu(!user);
//         }
//       } else {
//         setAddress(null);
//         setShouldLoadDefaultMenu(!user);
//       }
//     } catch (error) {
//       console.error("Error refreshing address:", error);
//       setAddress(null);
//       setShouldLoadDefaultMenu(!user);
//     }
//   }, [user]);

//   // Listen for location updates from Banner
//   useEffect(() => {
//     const handleLocationUpdated = () => {
//       refreshAddress();
//     };

//     const handleAddressUpdated = () => {
//       refreshAddress();
//     };

//     const handleAddressAdded = () => {
//       refreshAddress();
//     };

//     const handleFocus = () => {
//       refreshAddress();
//     };

//     const handleDefaultHubLoaded = () => {
//       refreshAddress();
//     };

//     window.addEventListener("locationUpdated", handleLocationUpdated);
//     window.addEventListener("addressUpdated", handleAddressUpdated);
//     window.addEventListener("addressAdded", handleAddressAdded);
//     window.addEventListener("focus", handleFocus);
//     window.addEventListener("defaultHubLoaded", handleDefaultHubLoaded);

//     const handleStorageChange = (e) => {
//       if (
//         e.key === "currentLocation" ||
//         e.key === "primaryAddress" ||
//         e.key === "defaultHubData"
//       ) {
//         refreshAddress();
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);

//     const intervalId = setInterval(() => {
//       refreshAddress();
//     }, 2000);

//     return () => {
//       window.removeEventListener("locationUpdated", handleLocationUpdated);
//       window.removeEventListener("addressUpdated", handleAddressUpdated);
//       window.removeEventListener("addressAdded", handleAddressAdded);
//       window.removeEventListener("focus", handleFocus);
//       window.removeEventListener("defaultHubLoaded", handleDefaultHubLoaded);
//       window.removeEventListener("storage", handleStorageChange);
//       clearInterval(intervalId);
//     };
//   }, [refreshAddress]);

//   // State for location popup
//   const [showLocationPopup, setShowLocationPopup] = useState(false);

//   // Update handleSelectionChange to reset selectedCategory
//   const handleSelectionChange = (date1, session1) => {
//     setSelectedDate(date1);
//     setSelectedSession(session1);
//     setSelectedCategory("");
//     window.scrollTo(0, 0);
//   };

//   // Check if user is logged in but has no address selected
//   useEffect(() => {
//     if (user && !address) {
//       const timer = setTimeout(() => {
//         setShowLocationPopup(true);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [user, address]);

//   // Add location detection for users coming from splash screen
//   useEffect(() => {
//     const checkLocationPermission = async () => {
//       const currentLocation = localStorage.getItem("currentLocation");
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const defaultHubData = localStorage.getItem("defaultHubData");

//       if (currentLocation || primaryAddress || defaultHubData || address) {
//         return;
//       }

//       if (navigator.geolocation && navigator.permissions) {
//         try {
//           const permission = await navigator.permissions.query({
//             name: "geolocation",
//           });
//         } catch (error) {
//           console.error("Permissions API error:", error);
//         }
//       }
//     };

//     const timer = setTimeout(checkLocationPermission, 500);
//     return () => clearTimeout(timer);
//   }, []);

//   // --- 1. FETCH DATA (Only when Hub Changes) ---
//   useEffect(() => {
//     const hubIdToUse =
//       address?.hubId ||
//       (shouldLoadDefaultMenu && !user ? "69613cb1145c1aaedd9859cd" : null);

//     if (!hubIdToUse) {
//       setAllHubMenuData([]);
//       setloader(false);
//       return;
//     }

//     const fetchAllMenuData = async () => {
//       setloader(true);
//       try {
//         const res = await axios.get(
//           "http://localhost:7013/api/user/get-hub-menu",
//           {
//             params: { hubId: hubIdToUse },
//           },
//         );

//         if (res.status === 200) {
//           setAllHubMenuData(res.data.menu);
//         } else {
//           setAllHubMenuData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching menu:", error);
//         setAllHubMenuData([]);
//       } finally {
//         setloader(false);
//       }
//     };

//     fetchAllMenuData();
//   }, [address?.hubId, shouldLoadDefaultMenu, user]);

//   const handleLocationDetected = useCallback((newLocation) => {
//     setAddress(newLocation);
//     setShouldLoadDefaultMenu(false);

//     if (newLocation) {
//       localStorage.setItem("currentLocation", JSON.stringify(newLocation));
//     }

//     window.dispatchEvent(new Event("locationUpdated"));
//   }, []);

//   // --- 2. CORE FILTERING LOGIC ---
//   const currentSlotItems = useMemo(() => {
//     if (!allHubMenuData?.length) return [];
//     const selectedDateISO = selectedDate.toISOString();

//     return allHubMenuData.filter(
//       (item) =>
//         item.deliveryDate === selectedDateISO &&
//         item.session === selectedSession,
//     );
//   }, [allHubMenuData, selectedDate, selectedSession]);

//   const vegFilteredItems = useMemo(() => {
//     if (isVegOnly) {
//       return currentSlotItems.filter((item) => item.foodcategory === "Veg");
//     }
//     return currentSlotItems;
//   }, [currentSlotItems, isVegOnly]);

//   const dynamicTabs = useMemo(() => {
//     const categories = new Set(
//       vegFilteredItems.map((item) => item.menuCategory),
//     );
//     const uniqueCats = [...categories].filter(Boolean).sort();
//     return uniqueCats;
//   }, [vegFilteredItems]);

//   useEffect(() => {
//     if (dynamicTabs.length > 0 && !selectedCategory) {
//       setSelectedCategory(dynamicTabs[0]);
//     } else if (
//       dynamicTabs.length > 0 &&
//       !dynamicTabs.includes(selectedCategory)
//     ) {
//       setSelectedCategory(dynamicTabs[0]);
//     }
//   }, [dynamicTabs, selectedCategory]);

//   const finalDisplayItems = useMemo(() => {
//     if (!selectedCategory) return [];
//     return vegFilteredItems.filter(
//       (item) => item.menuCategory === selectedCategory,
//     );
//   }, [vegFilteredItems, selectedCategory]);

//   const isSameDay = (d1, d2) => {
//     const a = new Date(d1);
//     const b = new Date(d2);
//     a.setHours(0, 0, 0, 0);
//     b.setHours(0, 0, 0, 0);
//     return a.getTime() === b.getTime();
//   };

//   // ============ Check cutoff using validation result ============
//   const isBeforeCutoff = (deliveryDate, session) => {
//     if (!deliveryDate || !session) return false;

//     // Use the cutoff validation result from API
//     if (!cutoffValidation.allowed) {
//       return false;
//     }

//     const now = new Date();
//     const delivery = new Date(deliveryDate);
//     delivery.setHours(0, 0, 0, 0);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Future dates are always allowed
//     if (delivery.getTime() > today.getTime()) return true;

//     // Past dates are not allowed
//     if (delivery.getTime() < today.getTime()) return false;

//     // For today, use the API validation result
//     return cutoffValidation.allowed;
//   };

//   // Helper: always use preorder price if available and before cutoff
//   const getEffectivePrice = (item, matchedLocation, session) => {
//     const hubPrice =
//       (matchedLocation &&
//         (matchedLocation.hubPrice || matchedLocation.basePrice)) ||
//       item?.hubPrice ||
//       item?.basePrice ||
//       0;
//     const preOrderPrice =
//       (matchedLocation &&
//         (matchedLocation.preOrderPrice || matchedLocation.preorderPrice)) ||
//       item?.preOrderPrice ||
//       item?.preorderPrice ||
//       0;
//     const beforeCutoff = isBeforeCutoff(
//       item?.deliveryDate || item?.deliveryDateISO,
//       session,
//     );
//     if (beforeCutoff && preOrderPrice > 0) return { price: preOrderPrice };
//     return { price: hubPrice };
//   };

//   const [cartCount, setCartCount] = useState(0);
//   const [isCartVisible, setIsCartVisible] = useState(false);

//   const handleShow = () => {
//     setCartCount(cartCount + 1);
//     setIsCartVisible(true);
//   };

//   const [foodData, setFoodData] = useState({});
//   const [open, setOpen] = useState(false);

//   const showDrawer = (food) => {
//     setFoodData(food);
//     setOpen(true);
//   };
//   const onClose = () => {
//     setOpen(false);
//   };

//   useEffect(() => {
//     if (open) {
//       document.body.classList.add("drawer-open");
//     } else {
//       document.body.classList.remove("drawer-open");
//     }
//     return () => {
//       document.body.classList.remove("drawer-open");
//     };
//   }, [open]);

//   const [show4, setShow4] = useState(false);
//   const handleClose4 = () => setShow4(false);
//   const [show3, setShow3] = useState(false);
//   const handleClose3 = () => setShow3(false);
//   const [show2, setShow2] = useState(false);
//   const handleClose2 = () => setShow2(false);
//   const handleShow2 = () => setShow2(true);

//   useEffect(() => {
//     refreshAddress();
//   }, [user]);

//   // ============ Add to cart with cutoff validation ============
//   const addCart1 = async (item, checkOf, matchedLocation) => {
//     // Check cutoff before adding to cart
//     if (!cutoffValidation.allowed) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title:
//           cutoffValidation.message ||
//           `Cannot add to cart. Orders are closed for ${selectedSession}.`,
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

//     if (!matchedLocation || matchedLocation?.Remainingstock === 0) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Product is out of stock`,
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

//     const eff = getEffectivePrice(item, matchedLocation, selectedSession);
//     const appliedPrice = checkOf ? checkOf?.price : eff.price;

//     const newCartItem = {
//       deliveryDate: new Date(selectedDate).toISOString(),
//       session: selectedSession,
//       foodItemId: item?._id,
//       price: appliedPrice,
//       totalPrice: appliedPrice,
//       image: item?.Foodgallery[0]?.image2,
//       unit: item?.unit,
//       foodname: item?.foodname,
//       quantity: item?.quantity,
//       Quantity: 1,
//       gst: item?.gst,
//       discount: item?.discount,
//       foodcategory: item?.foodcategory,
//       remainingstock: matchedLocation?.Remainingstock,
//       offerProduct: !!checkOf,
//       minCart: checkOf?.minCart || 0,
//       actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//       offerQ: 1,
//       basePrice: matchedLocation?.basePrice || item?.basePrice || 0,
//       hubPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//       preOrderPrice: matchedLocation?.preOrderPrice || item?.preOrderPrice || 0,
//     };

//     const cart = JSON.parse(localStorage.getItem("cart"));
//     const cartArray = Array.isArray(cart) ? cart : [];

//     const itemIndex = cartArray.findIndex(
//       (cartItem) =>
//         cartItem?.foodItemId === newCartItem?.foodItemId &&
//         cartItem.deliveryDate === newCartItem.deliveryDate &&
//         cartItem.session === newCartItem.session,
//     );

//     if (itemIndex === -1) {
//       cartArray.push(newCartItem);
//       localStorage.setItem("cart", JSON.stringify(cartArray));
//       setCarts(cartArray);
//       handleShow();
//     } else {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Item is already in this slot's cart`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const [cart, setCart] = useState([]);

//   useEffect(() => {
//     const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
//     setCart(storedCart);

//     const addonedCarts = async () => {
//       try {
//         await axios.post("http://localhost:7013/api/cart/addCart", {
//           userId: user?._id,
//           items: storedCart,
//           lastUpdated: Date.now,
//           username: user?.Fname,
//           mobile: user?.Mobile,
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     if (Carts && Carts.length > 0 && user?._id) {
//       addonedCarts();
//     }
//   }, [JSON.stringify(Carts), user?._id]);

//   const updateCartData = (updatedCart) => {
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//     setCart(updatedCart);
//     setCarts(updatedCart);
//   };

//   const increaseQuantity = (foodItemId, checkOf, item, matchedLocation) => {
//     const maxStock = matchedLocation?.Remainingstock || 0;
//     const selectedDateISO = selectedDate.toISOString();

//     if (!checkOf) {
//       if (!cutoffValidation.allowed) {
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "info",
//           title:
//             cutoffValidation.message ||
//             `Cannot increase quantity. Orders are closed for ${selectedSession}.`,
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//         return;
//       }

//       const updatedCart = Carts.map((cartItem) => {
//         if (
//           cartItem.foodItemId === foodItemId &&
//           cartItem.deliveryDate === selectedDateISO &&
//           cartItem.session === selectedSession &&
//           !cartItem.extra
//         ) {
//           if (cartItem.Quantity < maxStock) {
//             return {
//               ...cartItem,
//               Quantity: cartItem.Quantity + 1,
//               totalPrice: cartItem.price * (cartItem.Quantity + 1),
//             };
//           } else {
//             Swal2.fire({
//               toast: true,
//               position: "bottom",
//               icon: "info",
//               title: `No more stock available!`,
//               showConfirmButton: false,
//               timer: 3000,
//               timerProgressBar: true,
//               customClass: {
//                 popup: "me-small-toast",
//                 title: "me-small-toast-title",
//               },
//             });
//           }
//         }
//         return cartItem;
//       });
//       updateCartData(updatedCart);
//     } else {
//       const offerPr = Carts.find(
//         (ele) =>
//           ele.foodItemId == foodItemId &&
//           ele.deliveryDate === selectedDate.toISOString() &&
//           ele.session === selectedSession &&
//           !ele.extra,
//       );

//       if (offerPr && offerPr.offerQ > offerPr.Quantity) {
//         const updatedCart = Carts.map((cartItem) => {
//           if (
//             cartItem.foodItemId === foodItemId &&
//             cartItem.deliveryDate === selectedDateISO &&
//             cartItem.session === selectedSession &&
//             !cartItem.extra
//           ) {
//             if (cartItem.Quantity < maxStock) {
//               return {
//                 ...cartItem,
//                 Quantity: cartItem.Quantity + 1,
//                 totalPrice: cartItem.price * (cartItem.Quantity + 1),
//               };
//             } else {
//               Swal2.fire({
//                 toast: true,
//                 position: "bottom",
//                 icon: "info",
//                 title: `No more stock available!`,
//                 showConfirmButton: false,
//                 timer: 3000,
//                 timerProgressBar: true,
//                 customClass: {
//                   popup: "me-small-toast",
//                   title: "me-small-toast-title",
//                 },
//               });
//             }
//           }
//           return cartItem;
//         });

//         updateCartData(updatedCart);
//       } else {
//         const offerPrXt = Carts?.find(
//           (ele) =>
//             ele.foodItemId === foodItemId &&
//             ele.deliveryDate === selectedDate.toISOString() &&
//             ele.session === selectedSession &&
//             ele.extra === true,
//         );

//         if (offerPrXt) {
//           const updatedCart = Carts.map((cartItem) => {
//             if (
//               cartItem.foodItemId === foodItemId &&
//               cartItem.deliveryDate === selectedDateISO &&
//               cartItem.session === selectedSession &&
//               cartItem.extra === true
//             ) {
//               if (cartItem.Quantity < maxStock) {
//                 return {
//                   ...cartItem,
//                   Quantity: cartItem.Quantity + 1,
//                   totalPrice: cartItem.price * (cartItem.Quantity + 1),
//                 };
//               } else {
//                 Swal2.fire({
//                   toast: true,
//                   position: "bottom",
//                   icon: "info",
//                   title: `No more stock available!`,
//                   showConfirmButton: false,
//                   timer: 3000,
//                   timerProgressBar: true,
//                   customClass: {
//                     popup: "me-small-toast",
//                     title: "me-small-toast-title",
//                   },
//                 });
//               }
//             }
//             return cartItem;
//           });

//           updateCartData(updatedCart);
//         } else {
//           const effNew = getEffectivePrice(
//             item,
//             matchedLocation,
//             selectedSession,
//             true,
//           );
//           updateCartData([
//             ...Carts,
//             {
//               deliveryDate: selectedDate.toISOString(),
//               session: selectedSession,
//               foodItemId: item?._id,
//               price: effNew.price,
//               totalPrice: effNew.price,
//               image: item?.Foodgallery[0]?.image2,
//               unit: item?.unit,
//               foodname: item?.foodname,
//               quantity: item?.quantity,
//               Quantity: 1,
//               gst: item?.gst,
//               discount: item?.discount,
//               foodcategory: item?.foodcategory,
//               remainingstock: maxStock,
//               offerProduct: false,
//               minCart: 0,
//               actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//               offerQ: 0,
//               extra: true,
//             },
//           ]);
//         }
//       }
//     }
//   };

//   const [show, setShow] = useState(true);
//   const [expiryDays, setExpiryDays] = useState(0);

//   const decreaseQuantity = (foodItemId, checkOf, matchedLocation) => {
//     const selectedDateISO = selectedDate.toISOString();
//     if (!checkOf) {
//       const updatedCart = Carts.map((item) => {
//         if (
//           item.foodItemId === foodItemId &&
//           item.Quantity > 0 &&
//           item.deliveryDate === selectedDateISO &&
//           item.session === selectedSession &&
//           !item.extra
//         ) {
//           return {
//             ...item,
//             Quantity: item.Quantity - 1,
//             totalPrice: item.price * (item.Quantity - 1),
//           };
//         }
//         return item;
//       }).filter((item) => item.Quantity > 0);

//       updateCartData(updatedCart);
//     } else {
//       const offerPr = Carts.find(
//         (ele) =>
//           ele.foodItemId == foodItemId &&
//           ele.deliveryDate === selectedDate.toISOString() &&
//           ele.session === selectedSession &&
//           !ele.extra,
//       );

//       if (offerPr && offerPr.offerQ > offerPr.Quantity) {
//         const updatedCart = Carts.map((item) => {
//           if (
//             item.foodItemId === foodItemId &&
//             item.Quantity > 0 &&
//             item.deliveryDate === selectedDateISO &&
//             item.session === selectedSession &&
//             !item.extra
//           ) {
//             const newQuantity = item.Quantity - 1;
//             let newTotalPrice;
//             if (newQuantity <= offerPr.offerQ) {
//               newTotalPrice = offerPr.price * newQuantity;
//             } else {
//               newTotalPrice = offerPr.actualPrice * newQuantity;
//             }

//             return {
//               ...item,
//               Quantity: newQuantity,
//               totalPrice: newTotalPrice,
//             };
//           }
//           return item;
//         }).filter((item) => item.Quantity > 0);

//         updateCartData(updatedCart);
//       } else {
//         const offerExtraItem = Carts?.find(
//           (ele) =>
//             ele.foodItemId === foodItemId &&
//             ele.deliveryDate === selectedDate.toISOString() &&
//             ele.session === selectedSession &&
//             ele.extra === true,
//         );

//         if (offerExtraItem) {
//           const updatedCart = Carts.map((item) => {
//             if (
//               item.foodItemId === foodItemId &&
//               item.extra === true &&
//               item.Quantity > 0 &&
//               item.deliveryDate === selectedDateISO &&
//               item.session === selectedSession
//             ) {
//               return {
//                 ...item,
//                 Quantity: item.Quantity - 1,
//                 totalPrice: item.price * (item.Quantity - 1),
//               };
//             }
//             return item;
//           }).filter((item) => item.Quantity > 0);

//           updateCartData(updatedCart);
//         } else {
//           const updatedCart = Carts.map((item) => {
//             if (
//               item.foodItemId === foodItemId &&
//               item.Quantity > 0 &&
//               item.deliveryDate === selectedDateISO &&
//               item.session === selectedSession
//             ) {
//               return {
//                 ...item,
//                 Quantity: item.Quantity - 1,
//                 totalPrice: item.price * (item.Quantity - 1),
//               };
//             }
//             return item;
//           }).filter((item) => item.Quantity > 0);

//           updateCartData(updatedCart);
//         }
//       }
//     }
//   };

//   const isAddressReady = () => {
//     const addresstype1 = localStorage.getItem("addresstype");
//     if (!addresstype1) return false;

//     const addressKey =
//       addresstype1 === "apartment" ? "address" : "coporateaddress";
//     const addressRaw = localStorage.getItem(addressKey);

//     if (!addressRaw) return false;

//     try {
//       const address1 = JSON.parse(addressRaw);
//       if (!address1) return false;

//       const apartmentname =
//         address1?.apartmentname || address1?.Apartmentname || "";
//       const addressField = address1?.Address || address1?.address || "";
//       const pincode = address1?.pincode || "";

//       return apartmentname && addressField && pincode;
//     } catch (error) {
//       return false;
//     }
//   };

//   // This useEffect now calls getAllOffer which is defined above
//   useEffect(() => {
//     if (Carts?.length > 0) {
//       handleShow();
//     }
//     if (user?._id) {
//       getAllOffer();
//     }
//   }, [user?._id]);

//   const groupedCarts = useMemo(() => {
//     if (!Carts || Carts.length === 0) return [];
//     const groups = Carts.reduce((acc, item) => {
//       const key = `${item.deliveryDate}|${item.session}`;

//       if (!item.deliveryDate || !item.session) return acc;

//       if (!acc[key]) {
//         acc[key] = {
//           session: item.session,
//           date: new Date(item.deliveryDate),
//           totalItems: 0,
//           subtotal: 0,
//           items: [],
//         };
//       }

//       acc[key].totalItems += item.Quantity;
//       acc[key].subtotal += item.price * item.Quantity;
//       acc[key].items.push(item);

//       return acc;
//     }, {});

//     return Object.values(groups).sort((a, b) => a.date - b.date);
//   }, [Carts]);

//   const overallTotalItems = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.totalItems, 0);
//   }, [groupedCarts]);

//   const overallSubtotal = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.subtotal, 0);
//   }, [groupedCarts]);

//   const [deliveryCharge, setDeliveryCharge] = useState([]);
//   const [filteredRates, setFilteredRates] = useState([]);

//   const getDeliveryRates = async () => {
//     try {
//       const res = await axios.get("http://localhost:7013/api/deliveryrate/all");
//       setDeliveryCharge(res.data.data);
//       setFilteredRates(res.data.data);
//     } catch (error) {
//       console.error("Error fetching delivery rates:", error);
//     }
//   };

//   const findDeliveryRate = (hubId, acquisitionChannel, status) => {
//     if (!deliveryCharge || deliveryCharge.length === 0) {
//       return 15;
//     }

//     const matchedRate = deliveryCharge.find(
//       (rate) =>
//         rate.hubId === hubId &&
//         rate.acquisition_channel === acquisitionChannel &&
//         rate.status === status,
//     );

//     return matchedRate?.deliveryRate || 15;
//   };

//   // FIXED: Use status to determine acquisition channel for delivery rate
//   const isEmployeeForDelivery = user?.status === "Employee";
//   const acquisitionChannelForDelivery = isEmployeeForDelivery
//     ? "employee"
//     : user?.acquisition_channel || "organic";
//   const userStatus = user?.status;
//   const hubId = address?.hubId;
//   const deliveryRate = findDeliveryRate(
//     hubId,
//     acquisitionChannelForDelivery,
//     userStatus,
//   );

//   const proceedToPlan = async () => {
//     if (!user) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Please Login!`,
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
//     if (Carts.length === 0) {
//       return;
//     }

//     if (!address) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Please Select Address!`,
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

//     setloader(true);
//     try {
//       const addressDetails = {
//         addressId: address._id || "",
//         addressline: `${address.fullAddress}`,
//         addressType: address.addressType || "",
//         coordinates: address.location?.coordinates || [0, 0],
//         hubId: address.hubId || "",
//         hubName: address.hubName || "",
//         studentInformation: address.studentInformation,
//         schoolName: address.schoolName || "",
//         houseName: address.houseName || "",
//         apartmentName: address.apartmentName || "",
//         companyName: address.companyName || "",
//         companyId: address.companyId || "",
//         customerType: user.status || "",
//       };

//       const res = await axios.post(
//         "http://localhost:7013/api/user/plan/add-to-plan",
//         {
//           userId: user._id,
//           mobile: user.Mobile,
//           username: user.Fname,
//           companyId: user?.companyId || "",
//           items: Carts,
//           addressDetails: addressDetails,
//           deliveryCharge: deliveryRate,
//         },
//       );

//       if (res.status === 200) {
//         localStorage.removeItem("cart");
//         setCarts([]);
//         navigate("/my-plan");
//       }
//     } catch (error) {
//       console.error("❌ proceedToPlan - Error:", error);
//     } finally {
//       setloader(false);
//     }
//   };

//   // Time check effect
//   useEffect(() => {
//     const checkTime = () => {
//       const now = new Date();
//       const currentTimeInMinutes = 10 * 60 + now.getMinutes();
//       const lunchStart = 7 * 60;
//       const lunchPrepStart = 9 * 60;
//       const lunchCookingStart = 11 * 60;
//       const lunchEnd = 14 * 60;

//       const dinnerStart = 14 * 60;
//       const dinnerPrepStart = 16 * 60 + 30;
//       const dinnerCookingStart = 18 * 60;
//       const dinnerEnd = 21 * 60;

//       const shopCloseTime = 21 * 60;

//       if (
//         currentTimeInMinutes >= lunchStart &&
//         currentTimeInMinutes < lunchPrepStart
//       ) {
//         setGifUrl("sourcing.gif");
//         setMessage(
//           "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= lunchPrepStart &&
//         currentTimeInMinutes < lunchCookingStart
//       ) {
//         setGifUrl("cuttingveg.gif");
//         setMessage(
//           "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= lunchCookingStart &&
//         currentTimeInMinutes < lunchEnd
//       ) {
//         setGifUrl("cookinggif.gif");
//         setMessage(
//           "Cooking your meal. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerStart &&
//         currentTimeInMinutes < dinnerPrepStart
//       ) {
//         setGifUrl("sourcing.gif");
//         setMessage(
//           "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerPrepStart &&
//         currentTimeInMinutes < dinnerCookingStart
//       ) {
//         setGifUrl("cuttingveg.gif");
//         setMessage(
//           "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerCookingStart &&
//         currentTimeInMinutes <= dinnerEnd
//       ) {
//         setGifUrl("cookinggif.gif");
//         setMessage(
//           "Cooking your meal. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (currentTimeInMinutes >= shopCloseTime) {
//         setGifUrl("Closed.gif");
//         setMessage(
//           "The Store is now closed. Operating hours: Lunch: 7:00 AM - 02:00 PM, Dinner: 2:00 PM - 9:00 PM.",
//         );
//       } else {
//         setGifUrl("Closed.gif");
//         setMessage(
//           "Orders are currently closed. Lunch: 7:00 AM - 02:00 PM. Dinner: 2:00 PM - 9:00 PM.",
//         );
//       }
//     };
//     checkTime();
//     const interval = setInterval(checkTime, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const [Fname, setFname] = useState("");
//   const [Mobile, setMobile] = useState("");
//   const [OTP, setOTP] = useState(["", "", "", ""]);
//   const [PasswordShow, setPasswordShow] = useState(false);

//   const userLogin = async () => {
//     if (!Mobile) {
//       return Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Enter Your Mobile Number`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//     setloader(true);
//     try {
//       const config = {
//         url: "/User/Sendotp",
//         method: "post",
//         baseURL: "http://localhost:7013/api",
//         headers: { "content-type": "application/json" },
//         data: { Mobile: Mobile },
//       };

//       const res = await axios(config);
//       if (res.status === 401) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Invalid Mobile Number`,
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
//           title: `Something went wrong`,
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
//         setloader(false);
//         handleClose3();
//         handleShow2();
//       }
//     } catch (error) {
//       setloader(false);
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   function validateIndianMobileNumber(mobileNumber) {
//     const regex = /^[6-9]\d{9}$/;
//     return regex.test(mobileNumber);
//   }

//   const verifyOTP = async () => {
//     try {
//       if (!OTP) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Enter a valid OTP`,
//           showConfirmButton: false,
//           timer: 3000,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//       const config = {
//         url: "User/mobileotpverification",
//         method: "post",
//         baseURL: "http://localhost:7013/api/",
//         header: { "content-type": "application/json" },
//         data: { Mobile: Mobile, otp: OTP },
//       };
//       const res = await axios(config);
//       if (res.status === 200) {
//         updateUser(res.data.details);
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "success",
//           title: `OTP verified successfully`,
//           showConfirmButton: false,
//           timer: 3000,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });

//         if (!address) {
//           handleClose2();
//           handleClose3();
//           return navigate("/");
//         }
//         navigate("/");
//         handleClose2();
//         setOTP("");
//         setMobile("");
//       }
//     } catch (error) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const getCartQuantity = (itemId) => {
//     const selectedDateISO = selectedDate.toISOString();
//     return Carts?.filter(
//       (cartItem) =>
//         cartItem?.foodItemId === itemId &&
//         cartItem.deliveryDate === selectedDateISO &&
//         cartItem.session === selectedSession,
//     )?.reduce((total, curr) => total + curr?.Quantity, 0);
//   };

//   // Automatically remove today's Lunch/Dinner cart items after cutoff times
//   useEffect(() => {
//     if (!Carts || !setCarts) return;
//     const toKey = (date) => new Date(date).toISOString().slice(0, 10);
//     const cleanup = () => {
//       const now = new Date();
//       const todayKey = toKey(now);
//       let removed = [];
//       const shouldRemove = (item) => {
//         if (!item) return false;
//         const dateVal =
//           item.deliveryDate ||
//           item.date ||
//           item.slotDate ||
//           item.deliveryDateString;
//         const sessionVal = (
//           item.session ||
//           item.slotSession ||
//           item.mealSession ||
//           ""
//         ).toString();
//         if (!dateVal || !sessionVal) return false;
//         const itemKey = toKey(dateVal);
//         if (itemKey !== todayKey) return false;
//         return !isBeforeCutoff(dateVal, sessionVal);
//       };
//       const newCarts = [];
//       Carts.forEach((it) => {
//         if (shouldRemove(it)) {
//           removed.push(it);
//         } else {
//           newCarts.push(it);
//         }
//       });
//       if (removed.length > 0) {
//         setCarts(newCarts);
//       }
//     };
//     cleanup();
//     const id = setInterval(cleanup, 60 * 5000);
//     return () => clearInterval(id);
//   }, [Carts, setCarts]);

//   const lastCartRawRef = useRef(null);
//   useEffect(() => {
//     const readCart = () => {
//       try {
//         const raw = localStorage.getItem("cart") || "[]";
//         if (raw !== lastCartRawRef.current) {
//           lastCartRawRef.current = raw;
//           const parsed = JSON.parse(raw);
//           setCarts(Array.isArray(parsed) ? parsed : []);
//           setCart(Array.isArray(parsed) ? parsed : []);
//         }
//       } catch (err) {
//         console.error("cart sync error", err);
//       }
//     };

//     readCart();
//     const intervalId = setInterval(readCart, 1000);
//     const onStorage = (e) => {
//       if (e.key === "cart") readCart();
//     };
//     const onCartUpdated = () => readCart();
//     window.addEventListener("storage", onStorage);
//     window.addEventListener("cart_updated", onCartUpdated);

//     return () => {
//       clearInterval(intervalId);
//       window.removeEventListener("storage", onStorage);
//       window.removeEventListener("cart_updated", onCartUpdated);
//     };
//   }, [setCarts]);

//   // Clean up any leftover flags
//   useEffect(() => {
//     localStorage.removeItem("triggerProceedToPlan");
//     sessionStorage.removeItem("justAddedAddress");
//   }, []);

//   // Compute showOffer safely (FIXED: uses status)
//   const showOffer = useMemo(() => {
//     if (!AllOffer?.length) return false;
//     try {
//       const primaryAddressStr = localStorage.getItem("primaryAddress");
//       const primaryAddress = primaryAddressStr
//         ? JSON.parse(primaryAddressStr)
//         : null;
//       const isEmployeeForOffer = user?.status === "Employee";
//       const acquisitionChannelForOffer = isEmployeeForOffer
//         ? "employee"
//         : user?.acquisition_channel || "organic";
//       return (
//         primaryAddress?.hubId === AllOffer[0]?.hubId &&
//         acquisitionChannelForOffer === AllOffer[0]?.acquisition_channel
//       );
//     } catch (error) {
//       console.error("Error parsing primaryAddress for offer:", error);
//       return false;
//     }
//   }, [AllOffer, user?.status]);

//   return (
//     <div>
//       <ToastContainer />

//       <div>
//         <Banner
//           Carts={Carts}
//           getAllOffer={getAllOffer}
//           isVegOnly={isVegOnly}
//           setIsVegOnly={setIsVegOnly}
//           onLocationDetected={handleLocationDetected}
//         />
//       </div>

//       {wallet?.balance > 0 && show && (
//         <div style={{ position: "relative" }}>
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 backgroundColor: "#f9f8f6",
//                 opacity: 1,
//                 zIndex: 20,
//                 pointerEvents: "auto",
//               }}
//             ></div>
//           )}

//           <CoinBalance
//             wallet={wallet}
//             transactions={transactions}
//             expiryDays={expiryDays}
//             setExpiryDays={setExpiryDays}
//             setShow={setShow}
//           />
//         </div>
//       )}

//       <div className="sticky-menu-header" style={{ position: "relative" }}>
//         <div style={{ position: "relative" }}>
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 zIndex: 10,
//                 pointerEvents: "none",
//                 opacity: 0.8,
//               }}
//             ></div>
//           )}
//           <DateSessionSelector
//             onChange={handleSelectionChange}
//             currentDate={selectedDate}
//             currentSession={selectedSession}
//             menuData={allHubMenuData}
//           />
//         </div>
//       </div>

//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.8,
//             }}
//           ></div>
//         )}
//         <Container>
//           <RatingModal />

//           {showOffer && (
//             <div className="maincontainer">
//               <div
//                 className="d-flex gap-3 mb-2 messageDiv rounded-2 mt-3 justify-content-center"
//                 style={{
//                   backgroundColor: "white",
//                   padding: "5px",
//                   height: "50px",
//                 }}
//               >
//                 <p
//                   className="mb-0 typewriter-desc"
//                   style={{
//                     color: "#6B8E23",
//                     fontSize: "1rem",
//                     textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
//                     lineHeight: "1.6",
//                     textAlign: "center",
//                   }}
//                 >
//                   {AllOffer[0]?.session === "Lunch" ? (
//                     <>
//                       Beat the afternoon hunger!{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price} for Lunch!
//                     </>
//                   ) : AllOffer[0]?.session === "Dinner" ? (
//                     <>
//                       Make your evening special!{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price} for Dinner!
//                     </>
//                   ) : (
//                     <>
//                       🥳 Limited time offer:{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price}!
//                     </>
//                   )}
//                 </p>
//               </div>
//             </div>
//           )}

//           {loader ? (
//             <div
//               className="d-flex justify-content-center align-item-center"
//               style={{
//                 position: "fixed",
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)",
//                 zIndex: 9999,
//               }}
//             >
//               <div class="lds-ripple">
//                 <div></div>
//                 <div></div>
//               </div>
//             </div>
//           ) : null}
//         </Container>
//       </div>

//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.2,
//             }}
//           ></div>
//         )}
//         <div className="maincontainer">
//           <div className="mobile-product-box" style={{ marginBottom: "30px" }}>
//             <div style={{ marginBottom: "20px" }}>
//               <TabsComponent
//                 tabs={dynamicTabs}
//                 activeTab={selectedCategory}
//                 onTabClick={setSelectedCategory}
//               />
//             </div>

//             <div className="d-flex gap-1 mb-2 flex-column">
//               <div className="row">
//                 {finalDisplayItems?.map((item, i) => {
//                   let matchedLocation = item.locationPrice?.[0];
//                   let checkOf = null;

//                   const primaryAddressJson =
//                     localStorage.getItem("primaryAddress");
//                   if (primaryAddressJson) {
//                     try {
//                       const primaryAddress = JSON.parse(primaryAddressJson);
//                       if (AllOffer && AllOffer.length > 0) {
//                         const isEmployeeForOffer = user?.status === "Employee";
//                         const acquisitionChannelForOffer = isEmployeeForOffer
//                           ? "employee"
//                           : user?.acquisition_channel || "organic";

//                         const validOffers = AllOffer.filter((offer) => {
//                           const hubMatches =
//                             offer?.hubId === primaryAddress?.hubId;
//                           const acquisitionChannelMatch =
//                             offer?.acquisition_channel ===
//                             acquisitionChannelForOffer;
//                           const offerStartDate = new Date(offer?.startDate);
//                           const offerEndDate = new Date(offer?.endDate);
//                           const deliverydate = new Date(item.deliveryDate);
//                           const isWithinDateRange =
//                             deliverydate >= offerStartDate &&
//                             deliverydate <= offerEndDate;
//                           return (
//                             hubMatches &&
//                             isWithinDateRange &&
//                             acquisitionChannelMatch
//                           );
//                         });

//                         if (validOffers.length > 0) {
//                           checkOf = validOffers
//                             .flatMap((offer) => offer?.products || [])
//                             .find(
//                               (product) =>
//                                 product?.foodItemId == item?._id?.toString(),
//                             );
//                         }
//                       }
//                     } catch (error) {
//                       console.error("Error parsing primaryAddress:", error);
//                     }
//                   }

//                   if (!matchedLocation) {
//                     matchedLocation = {
//                       Remainingstock: 0,
//                       hubPrice: item.hubPrice || item.basePrice || 0,
//                       preOrderPrice: item.preOrderPrice || 0,
//                       basePrice: item.basePrice || 0,
//                     };
//                   }
//                   const { price: effectivePrice } = getEffectivePrice(
//                     item,
//                     matchedLocation,
//                     item?.session,
//                     true,
//                   );

//                   return (
//                     <div
//                       key={item._id?.toString() || i}
//                       className="col-6 col-md-6 mb-2 d-flex justify-content-center"
//                     >
//                       <div className="mobl-product-card">
//                         <div className="productborder">
//                           <div className="prduct-box rounded-1 cardbx">
//                             <div
//                               onClick={() => showDrawer(item)}
//                               className="imagebg"
//                             >
//                               {item?.foodcategory === "Veg" ? (
//                                 <img
//                                   src={IsVeg}
//                                   alt="IsVeg"
//                                   className="isVegIcon"
//                                 />
//                               ) : (
//                                 <img
//                                   src={IsNonVeg}
//                                   alt="IsNonVeg"
//                                   className="isVegIcon"
//                                 />
//                               )}
//                               <img
//                                 src={`${item?.Foodgallery[0]?.image2}`}
//                                 alt=""
//                                 className="mbl-product-img"
//                               />
//                             </div>
//                           </div>
//                           {item?.foodTags && (
//                             <div className="food-tag-container">
//                               {item.foodTags.map((tag, idx) => (
//                                 <span
//                                   key={idx}
//                                   className="food-tag-pill"
//                                   style={{ backgroundColor: tag.tagColor }}
//                                 >
//                                   <img
//                                     src={chef}
//                                     alt=""
//                                     style={{
//                                       width: "10px",
//                                       height: "10px",
//                                       marginRight: "2px",
//                                     }}
//                                   />
//                                   {tag.tagName}
//                                 </span>
//                               ))}
//                             </div>
//                           )}

//                           <div className="food-name-container">
//                             <p className="food-name">{item?.foodname}</p>
//                             <small className="food-unit">{item?.unit}</small>
//                           </div>

//                           <div
//                             className="d-flex align-items-center mb-3"
//                             style={{ gap: "8px", flexWrap: "nowrap" }}
//                           >
//                             {matchedLocation?.basePrice &&
//                             matchedLocation?.basePrice !== effectivePrice &&
//                             parseFloat(matchedLocation?.basePrice) !==
//                               parseFloat(effectivePrice) ? (
//                               <div
//                                 className="align-items-start"
//                                 style={{
//                                   textDecoration: "line-through",
//                                   color: "#6b6b6b",
//                                   fontSize: "15px",
//                                   whiteSpace: "nowrap",
//                                   flexShrink: 0,
//                                   display: "flex",
//                                   gap: "2px",
//                                   marginLeft: "7px",
//                                 }}
//                               >
//                                 <span className="fw-normal">₹</span>
//                                 <span>{matchedLocation?.basePrice}</span>
//                               </div>
//                             ) : null}

//                             <div
//                               className="align-items-start"
//                               style={{
//                                 color: "#2c2c2c",
//                                 fontFamily: "Inter",
//                                 fontSize: "20px",
//                                 fontWeight: "500",
//                                 lineHeight: "25px",
//                                 letterSpacing: "-0.8px",
//                                 whiteSpace: "nowrap",
//                                 flexShrink: 0,
//                                 display: "flex",
//                                 gap: "2px",
//                               }}
//                             >
//                               {checkOf ? (
//                                 <div className="d-flex align-items-start gap-2">
//                                   <div
//                                     className="align-items-start"
//                                     style={{ display: "flex", gap: "2px" }}
//                                   >
//                                     <span className="fw-bold">₹</span>
//                                     <span
//                                       style={{
//                                         textDecoration: "line-through",
//                                         color: "#6b6b6b",
//                                         fontSize: "15px",
//                                         fontWeight: "400",
//                                         lineHeight: "18px",
//                                         letterSpacing: "-0.6px",
//                                         marginTop: "4px",
//                                       }}
//                                     >
//                                       {effectivePrice}
//                                     </span>
//                                   </div>
//                                   <div
//                                     className="align-items-start"
//                                     style={{
//                                       display: "flex",
//                                       gap: "2px",
//                                       marginLeft: "5px",
//                                     }}
//                                   >
//                                     <span className="fw-normal">₹</span>
//                                     <span>{checkOf?.price}</span>
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <div
//                                   className="align-items-start"
//                                   style={{
//                                     display: "flex",
//                                     gap: "1px",
//                                     marginLeft: "6px",
//                                   }}
//                                 >
//                                   <span className="fw-bold">₹</span>
//                                   <span>{effectivePrice}</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>

//                           <div>
//                             <div className="guaranteed-label">
//                               <img
//                                 src={availabity}
//                                 alt=""
//                                 style={{ width: "11px", height: "11px" }}
//                               />{" "}
//                               Guaranteed Availability
//                             </div>
//                           </div>

//                           <div className="d-flex justify-content-center mb-2">
//                             {getCartQuantity(item?._id) === 0 ? (
//                               address && gifUrl === "Closed.gif" ? (
//                                 <button
//                                   className="add-to-cart-btn-disabled"
//                                   disabled
//                                 >
//                                   <span className="add-to-cart-btn-text">
//                                     Add
//                                   </span>
//                                   <FaPlus className="add-to-cart-btn-icon" />
//                                 </button>
//                               ) : (
//                                 <button
//                                   className={`add-to-cart-btn ${(user && !address) || !cutoffValidation.allowed ? "disabled-btn" : ""}`}
//                                   onClick={() =>
//                                     addCart1(item, checkOf, matchedLocation)
//                                   }
//                                   disabled={
//                                     (user && !address) ||
//                                     !cutoffValidation.allowed
//                                   }
//                                 >
//                                   <div className="pick-btn-text">
//                                     <span className="pick-btn-text1">PICK</span>
//                                     <span className="pick-btn-text2">
//                                       Confirm Later
//                                     </span>
//                                   </div>
//                                   <span className="add-to-cart-btn-icon">
//                                     <FaPlus />
//                                   </span>
//                                 </button>
//                               )
//                             ) : getCartQuantity(item?._id) > 0 ? (
//                               <button className="increaseBtn">
//                                 <div
//                                   className="faplus"
//                                   onClick={() =>
//                                     !(user && !address) &&
//                                     decreaseQuantity(
//                                       item?._id,
//                                       checkOf,
//                                       matchedLocation,
//                                     )
//                                   }
//                                   style={{
//                                     opacity: user && !address ? 0.5 : 1,
//                                     pointerEvents:
//                                       user && !address ? "none" : "auto",
//                                   }}
//                                 >
//                                   <FaMinus />
//                                 </div>
//                                 <div className="faQuantity">
//                                   {getCartQuantity(item?._id)}
//                                 </div>
//                                 <div
//                                   className="faplus"
//                                   onClick={() =>
//                                     !(user && !address) &&
//                                     increaseQuantity(
//                                       item?._id,
//                                       checkOf,
//                                       item,
//                                       matchedLocation,
//                                     )
//                                   }
//                                   style={{
//                                     opacity: user && !address ? 0.5 : 1,
//                                     pointerEvents:
//                                       user && !address ? "none" : "auto",
//                                   }}
//                                 >
//                                   <FaPlus />
//                                 </div>
//                               </button>
//                             ) : gifUrl === "Closed.gif" ? (
//                               <button className="add-to-cart-btn" disabled>
//                                 <span className="add-to-cart-btn-text">
//                                   Add
//                                 </span>
//                                 <span className="add-to-cart-btn-icon">
//                                   <FaPlus />
//                                 </span>
//                               </button>
//                             ) : (
//                               <button
//                                 className="add-to-cart-btn"
//                                 onClick={() =>
//                                   addCart1(item, checkOf, matchedLocation)
//                                 }
//                                 disabled={user && !address}
//                                 style={{ opacity: user && !address ? 0.5 : 1 }}
//                               >
//                                 <span className="add-to-cart-btn-text">
//                                   Add
//                                 </span>
//                                 <span className="add-to-cart-btn-icon">
//                                   <FaPlus />
//                                 </span>
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}

//                 {!loader && finalDisplayItems.length === 0 && (
//                   <div className="col-12 text-center my-5">
//                     {user &&
//                     (!localStorage.getItem("primaryAddress") ||
//                       localStorage.getItem("primaryAddress") === "null") ? (
//                       <div>
//                         <h4>No location selected.</h4>
//                         <p>
//                           Please add your location to view the menu for your
//                           area.
//                         </p>
//                         <button
//                           className="mt-2"
//                           onClick={() => navigate("/location")}
//                           style={{
//                             backgroundColor: "#6B8E23",
//                             color: "white",
//                             padding: "10px 20px",
//                             borderRadius: "5px",
//                             border: "none",
//                           }}
//                         >
//                           Add Location
//                         </button>
//                       </div>
//                     ) : (
//                       <>
//                         <h4>No items available for this slot.</h4>
//                         <p>
//                           Please check back later or select a different day!
//                         </p>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <MultiCartDrawer
//           proceedToPlan={proceedToPlan}
//           groupedCarts={groupedCarts}
//           overallSubtotal={overallSubtotal}
//           overallTotalItems={overallTotalItems}
//           onJumpToSlot={handleSelectionChange}
//         />

//         <Modal show={show3} backdrop="static" onHide={handleClose3}>
//           <Modal.Header closeButton>
//             <Modal.Title className="d-flex align-items-center gap-1">
//               <FaLock color="#6B8E23" /> <span>Welcome to Dailydish</span>
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <div className="login-whatsappwithicon">
//                 <FaSquareWhatsapp size={42} color="green" />
//                 <Form.Control
//                   type="number"
//                   placeholder="Enter Your WhatsApp Number"
//                   value={Mobile}
//                   onChange={(e) => setMobile(e.target.value)}
//                 />
//               </div>
//               <Button
//                 variant=""
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//                 onClick={() => {
//                   if (!validateIndianMobileNumber(Mobile)) {
//                     Swal2.fire({
//                       toast: true,
//                       position: "bottom",
//                       icon: "error",
//                       title: `Invalid mobile number`,
//                       showConfirmButton: false,
//                       timer: 3000,
//                       timerProgressBar: true,
//                       customClass: {
//                         popup: "me-small-toast",
//                         title: "me-small-toast-title",
//                       },
//                     });
//                     return;
//                   }
//                   userLogin();
//                 }}
//               >
//                 Send otp
//               </Button>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleClose3}>
//               Close
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         <Modal
//           show={show2}
//           onHide={handleClose2}
//           size="sm"
//           style={{
//             zIndex: "99999",
//             position: "absolute",
//             top: "30%",
//             left: "0%",
//           }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Enter OTP</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <span style={{ fontSize: "13px" }}>
//               An OTP has been sent to your Phone Number
//             </span>
//             <div className="d-flex gap-1 mt-3 mb-3">
//               <InputGroup className="mb-2" style={{ background: "white" }}>
//                 <Form.Control
//                   type={PasswordShow ? "text" : "password"}
//                   className="login-input"
//                   placeholder="Enter OTP"
//                   aria-describedby="basic-addon1"
//                   onChange={(e) => setOTP(e.target.value)}
//                 />
//                 <Button
//                   variant=""
//                   style={{ borderRadius: "0px", border: "1px solid black" }}
//                   onClick={() => setPasswordShow(!PasswordShow)}
//                   className="passbtn"
//                 >
//                   {PasswordShow ? <FaEye /> : <FaEyeSlash />}
//                 </Button>
//               </InputGroup>
//             </div>
//             <div>
//               <Button
//                 variant=""
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//                 onClick={verifyOTP}
//               >
//                 Continue
//               </Button>
//             </div>
//           </Modal.Body>
//         </Modal>

//         <Drawer
//           placement="bottom"
//           closable={false}
//           onClose={onClose}
//           open={open}
//           key="bottom"
//           height={600}
//           className="description-product"
//           style={{ zIndex: 99999 }}
//           zIndex={99999}
//         >
//           <div className="modal-container-food">
//             <button className="custom-close-btn" onClick={onClose}>
//               ×
//             </button>
//             <div className="modern-food-item">
//               <div className="food-image-container">
//                 <div className="image-loading-spinner" id="image-spinner"></div>
//                 {foodData?.Foodgallery?.length > 0 && (
//                   <img
//                     src={`${foodData.Foodgallery[0].image2}`}
//                     alt={foodData?.foodname}
//                     className="modern-food-image"
//                     onLoad={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       const image =
//                         document.querySelector(".modern-food-image");
//                       if (spinner) spinner.classList.add("hidden");
//                       if (image) image.classList.add("loaded");
//                     }}
//                     onError={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       if (spinner) spinner.classList.add("hidden");
//                     }}
//                   />
//                 )}
//                 <div className="food-category-icon">
//                   {foodData?.foodcategory === "Veg" ? (
//                     <img src={IsVeg} alt="IsVeg" className="isVegIcon" />
//                   ) : (
//                     <img src={IsNonVeg} alt="IsNonVeg" className="isVegIcon" />
//                   )}
//                 </div>
//               </div>

//               <div className="food-details">
//                 <h2 className="food-title">{foodData?.foodname}</h2>
//                 <p className="food-description">{foodData?.fooddescription}</p>

//                 {(() => {
//                   const matchedLocation =
//                     foodData?.locationPrice?.length > 0
//                       ? foodData.locationPrice[0]
//                       : {
//                           Remainingstock: 0,
//                           hubPrice:
//                             foodData.hubPrice || foodData.basePrice || 0,
//                           preOrderPrice: foodData.preOrderPrice || 0,
//                           basePrice: foodData.basePrice || 0,
//                         };

//                   const checkOffer = AllOffer?.find(
//                     (offer) =>
//                       offer?.locationId?._id === address?._id &&
//                       offer?.products
//                         ?.map((product) => product._id)
//                         .includes(foodData?._id),
//                   );

//                   const eff = getEffectivePrice(
//                     foodData,
//                     matchedLocation,
//                     foodData?.session,
//                     true,
//                   );
//                   const currentPrice = checkOffer
//                     ? checkOffer.price
//                     : eff.price;
//                   const originalPrice = eff.price;
//                   const stockCount = matchedLocation?.Remainingstock || 0;

//                   return (
//                     <>
//                       <div className="pricing-section">
//                         <div className="pricing-display">
//                           <span className="current-price">₹{currentPrice}</span>
//                           {checkOffer && (
//                             <span
//                               className="original-price"
//                               style={{ marginLeft: "10px" }}
//                             >
//                               ₹{originalPrice}
//                             </span>
//                           )}
//                         </div>
//                         <div className="availability-banner">
//                           {stockCount > 0 ? (
//                             <>
//                               {checkOffer && (
//                                 <BiSolidOffer
//                                   color="green"
//                                   style={{ marginRight: "5px" }}
//                                 />
//                               )}
//                             </>
//                           ) : (
//                             "Sold Out"
//                           )}
//                         </div>
//                       </div>

//                       {getCartQuantity(foodData?._id) > 0 ? (
//                         <div className="increaseBtn">
//                           <div
//                             className="faplus"
//                             onClick={() => {
//                               if (!(user && !address))
//                                 decreaseQuantity(
//                                   foodData?._id,
//                                   checkOffer,
//                                   matchedLocation,
//                                 );
//                             }}
//                             style={{
//                               opacity: user && !address ? 0.5 : 1,
//                               pointerEvents: user && !address ? "none" : "auto",
//                             }}
//                           >
//                             <FaMinus />
//                           </div>
//                           <div className="faQuantity">
//                             {getCartQuantity(foodData?._id)}
//                           </div>
//                           <div
//                             className="faplus"
//                             onClick={() => {
//                               if (!(user && !address))
//                                 increaseQuantity(
//                                   foodData?._id,
//                                   checkOffer,
//                                   foodData,
//                                   matchedLocation,
//                                 );
//                             }}
//                             style={{
//                               opacity: user && !address ? 0.5 : 1,
//                               pointerEvents: user && !address ? "none" : "auto",
//                             }}
//                           >
//                             <FaPlus />
//                           </div>
//                         </div>
//                       ) : stockCount > 0 && gifUrl !== "Closed.gif" ? (
//                         ""
//                       ) : (
//                         <button
//                           className={
//                             gifUrl === "Closed.gif"
//                               ? "add-to-cart-btn-disabled"
//                               : "sold-out-btn"
//                           }
//                           disabled
//                         >
//                           <span className="add-to-cart-btn-text">
//                             {gifUrl === "Closed.gif" ? "Closed" : "Sold Out"}
//                           </span>
//                         </button>
//                       )}
//                     </>
//                   );
//                 })()}
//               </div>
//             </div>
//           </div>
//         </Drawer>
//       </div>

//       <div style={{ marginBottom: "80px" }}>
//         <Footer />
//       </div>

//       <BottomNav />
//     </div>
//   );
// };

// const TabsComponent = ({ tabs, activeTab, onTabClick }) => {
//   return (
//     <div className="tabs-container2">
//       <div className="tabs-scroll-container">
//         <div className="tabs-scroll">
//           {tabs.map((tab) => (
//             <button
//               key={tab}
//               className={`tab-button ${activeTab === tab ? "active" : ""}`}
//               onClick={() => onTabClick(tab)}
//             >
//               <span className="tab-button-text">{tab}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//       <style jsx>{`
//         .tabs-container2 {
//           background-color: ${Colors.creamWalls};
//           border-bottom-left-radius: 16px;
//           border-bottom-right-radius: 16px;
//           position: relative;
//           border-bottom: 2px solid #fff;
//           box-shadow:
//             0 1px 3px rgba(0, 0, 0, 0.1),
//             0 2px 6px rgba(0, 0, 0, 0.05);
//         }
//         .tabs-scroll-container {
//           overflow-x: auto;
//           -webkit-overflow-scrolling: touch;
//           scrollbar-width: none;
//         }
//         .tabs-scroll-container::-webkit-scrollbar {
//           display: none;
//         }
//         .tabs-scroll {
//           display: inline-flex;
//           min-width: 100%;
//           gap: 10px;
//           padding: 0 4px;
//         }
//         .tab-button {
//           display: inline-flex;
//           justify-content: center;
//           align-items: center;
//           padding: 8px 24px;
//           border-radius: 20px;
//           border: none;
//           background: transparent;
//           cursor: pointer;
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//           white-space: nowrap;
//           flex-shrink: 0;
//           min-height: 25px;
//         }
//         .tab-button:hover {
//           background-color: ${Colors.warmbeige}40;
//           transform: translateY(-1px);
//         }
//         .tab-button.active {
//           background-color: ${Colors.greenCardamom};
//           padding: 4px 8px;
//           box-shadow: 0 2px 8px ${Colors.greenCardamom}80;
//           width: auto;
//           height: auto;
//           border-radius: 20px;
//         }
//         .tab-button.active:hover {
//           background-color: ${Colors.greenCardamom}E6;
//           transform: translateY(-1px) scale(1.02);
//         }
//         .tab-button-text {
//           font-family: "Inter", sans-serif;
//           fontsize: 14px;
//           font-weight: 400;
//           line-height: 18px;
//           letter-spacing: -0.7px;
//           color: ${Colors.primaryText};
//           transition: all 0.3s ease;
//         }
//         .tab-button.active .tab-button-text {
//           font-family: "Inter", sans-serif;
//           fontsize: 16px;
//           font-weight: 900;
//           line-height: 21px;
//           letter-spacing: -0.8px;
//           color: ${Colors.appForeground};
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Home;















// import {
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   useRef,
//   useCallback,
// } from "react";
// import { Container } from "react-bootstrap";
// import { FaEye, FaEyeSlash, FaLock, FaUser, FaAngleUp } from "react-icons/fa";
// import { Button, Form, InputGroup, Modal } from "react-bootstrap";
// import { FaPlus, FaMinus, FaSquareWhatsapp } from "react-icons/fa6";
// import "../Styles/Home.css";
// import Banner from "./Banner";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Drawer } from "antd";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import CoinBalance from "./CoinBalance";
// import { WalletContext } from "../WalletContext";
// import RatingModal from "./RatingModal";
// import { BiSolidOffer } from "react-icons/bi";
// import Swal2 from "sweetalert2";
// import moment from "moment";
// import IsVeg from "../assets/isVeg=yes.svg";
// import IsNonVeg from "../assets/isVeg=no.svg";
// import MultiCartDrawer from "./MultiCartDrawer";
// import DateSessionSelector from "./DateSessionSelector";
// import chef from "./../assets/chef_3.png";
// import { Colors, FontFamily } from "../Helper/themes";
// import BottomNav from "./BottomNav";
// import LocationRequiredPopup from "./LocationRequiredPopup";
// import { MdAddLocationAlt } from "react-icons/md";
// import availabity from "./../assets/weui_done2-filled.png";
// import Footer from "./Footer";

// const Home = ({ selectArea, setSelectArea, Carts, setCarts }) => {
//   // Store user in state to avoid infinite render loop
//   const [user, setUser] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   });

//   // Listen for user changes in localStorage
//   useEffect(() => {
//     const handleStorage = (e) => {
//       if (e.key === "user") {
//         try {
//           setUser(JSON.parse(e.newValue));
//         } catch {
//           setUser(null);
//         }
//       }
//     };
//     window.addEventListener("storage", handleStorage);
//     return () => window.removeEventListener("storage", handleStorage);
//   }, []);

//   // Provide a function to update user state and localStorage together
//   const updateUser = (userObj) => {
//     setUser(userObj);
//     if (userObj) {
//       localStorage.setItem("user", JSON.stringify(userObj));
//     } else {
//       localStorage.removeItem("user");
//     }
//     window.dispatchEvent(new Event("userUpdated"));
//   };

//   const navigate = useNavigate();
//   const location = useLocation();

//   const { wallet, transactions, loading, walletSeting, getorderByCustomerId } =
//     useContext(WalletContext);

//   const [loader, setloader] = useState(false);
//   const [allHubMenuData, setAllHubMenuData] = useState([]);

//   // --- NEW STATE FOR FILTERS ---
//   const [isVegOnly, setIsVegOnly] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("");

//   const [address, setAddress] = useState(null);

//   // ============ NEW: Track if default hub menu should load ============
//   const [shouldLoadDefaultMenu, setShouldLoadDefaultMenu] = useState(!user);

//   // ============ NEW: Cutoff validation state ============
//   const [cutoffValidation, setCutoffValidation] = useState({
//     allowed: true,
//     message: "",
//     cutoffDateTime: null,
//     nextAvailableDateTime: null,
//   });
//   const [cutoffLoading, setCutoffLoading] = useState(false);

//   // State for offers
//   const [gifUrl, setGifUrl] = useState("");
//   const [message, setMessage] = useState("");
//   const [AllOffer, setAllOffer] = useState([]);
  
//   // NEW: Track which offer has been applied (only ONE offer per slot)
//   const [appliedOfferForSlot, setAppliedOfferForSlot] = useState(null);

//   // ============ getAllOffer function ============
//   const getAllOffer = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:7013/api/admin/offers",
//       );
//       if (response.status === 200 && response.data?.data) {
//         setAllOffer(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching offers:", error);
//       setAllOffer([]);
//     }
//   };

//   // Initial address loading with better error handling
//   useEffect(() => {
//     const loadInitialAddress = () => {
//       try {
//         const primaryAddress = localStorage.getItem("primaryAddress");
//         const currentLocation = localStorage.getItem("currentLocation");
//         const defaultHubData = localStorage.getItem("defaultHubData");

//         // Priority 1: Primary address (for logged-in users)
//         if (primaryAddress && primaryAddress !== "null") {
//           const parsedPrimary = JSON.parse(primaryAddress);
//           setAddress(parsedPrimary);
//           setShouldLoadDefaultMenu(false);
//         }
//         // Priority 2: Current location (user-selected)
//         else if (currentLocation && currentLocation !== "null") {
//           const parsedCurrent = JSON.parse(currentLocation);
//           setAddress(parsedCurrent);
//           setShouldLoadDefaultMenu(false);
//         }
//         // Priority 3: Default hub data (for non-logged-in users)
//         else if (defaultHubData && defaultHubData !== "null") {
//           try {
//             const parsedDefault = JSON.parse(defaultHubData);
//             const defaultAddress = {
//               hubId:
//                 parsedDefault.hubId ||
//                 parsedDefault._id ||
//                 "69613cb1145c1aaedd9859cd",
//               hubName:
//                 parsedDefault.hubName || parsedDefault.name || "Default Hub",
//               fullAddress:
//                 parsedDefault.address || "Select your location to view menu",
//               isDefaultHub: true,
//               location: parsedDefault.location || {
//                 type: "Point",
//                 coordinates: [0, 0],
//               },
//             };
//             setAddress(defaultAddress);
//             setShouldLoadDefaultMenu(false);
//             localStorage.setItem(
//               "currentLocation",
//               JSON.stringify(defaultAddress),
//             );
//           } catch (e) {
//             console.error("Error parsing default hub data:", e);
//             setAddress(null);
//             setShouldLoadDefaultMenu(true);
//           }
//         } else {
//           setAddress(null);
//           setShouldLoadDefaultMenu(!user);
//         }
//       } catch (error) {
//         console.error("Error loading initial address:", error);
//         setAddress(null);
//         setShouldLoadDefaultMenu(!user);
//       }
//     };

//     loadInitialAddress();
//     getDeliveryRates();
//   }, [user]);

//   // ============ Function to validate cutoff timing ============
//   const validateCutoffTiming = useCallback(
//     async (hubId, session, deliveryDate) => {
//       if (!hubId || !session) return true;

//       try {
//         setCutoffLoading(true);
//         const status = user?.status === "Employee" ? "Employee" : "Normal";

//         const response = await axios.post(
//           "http://localhost:7013/api/Hub/validate-order-timing",
//           {
//             hubId: hubId,
//             session: session.toLowerCase(),
//             status: status,
//             deliveryDate:
//               deliveryDate instanceof Date
//                 ? deliveryDate.toISOString()
//                 : deliveryDate,
//           },
//         );

//         if (response.status === 200) {
//           setCutoffValidation({
//             allowed: response.data.allowed,
//             message: response.data.message,
//             cutoffDateTime: response.data.cutoffDateTime,
//             nextAvailableDateTime: response.data.nextAvailableDateTime,
//           });
//           return response.data.allowed;
//         }
//         return true;
//       } catch (error) {
//         console.error("Error validating cutoff timing:", error);
//         return true;
//       } finally {
//         setCutoffLoading(false);
//       }
//     },
//     [user?.status],
//   );

//   // Function to get next available ordering time
//   const getNextAvailableTime = useCallback(
//     async (hubId, session) => {
//       if (!hubId || !session) return null;

//       try {
//         const status = user?.status === "Employee" ? "Employee" : "Normal";
//         const response = await axios.get(
//           `http://localhost:7013/api/Hub/next-available-time/${hubId}/${session.toLowerCase()}/${status}`,
//         );

//         if (response.status === 200) {
//           return response.data;
//         }
//         return null;
//       } catch (error) {
//         console.error("Error getting next available time:", error);
//         return null;
//       }
//     },
//     [user?.status],
//   );

//   // --- DATE & SESSION STATE ---
//   const getNormalizedToday = () => {
//     const now = new Date();
//     return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
//   };

//   const [selectedDate, setSelectedDate] = useState(() => {
//     if (location.state?.targetDate) return new Date(location.state.targetDate);
//     return getNormalizedToday();
//   });

//   const [selectedSession, setSelectedSession] = useState(() => {
//     if (location.state?.targetSession) return location.state.targetSession;
//     return "Lunch";
//   });

//   // ============ Check cutoff when date/session or hub changes ============
//   useEffect(() => {
//     const checkCutoff = async () => {
//       const currentAddress =
//         address ||
//         (() => {
//           try {
//             const primaryAddress = localStorage.getItem("primaryAddress");
//             const currentLocation = localStorage.getItem("currentLocation");
//             return primaryAddress
//               ? JSON.parse(primaryAddress)
//               : currentLocation
//                 ? JSON.parse(currentLocation)
//                 : null;
//           } catch {
//             return null;
//           }
//         })();

//       if (currentAddress?.hubId && selectedDate && selectedSession) {
//         const isAllowed = await validateCutoffTiming(
//           currentAddress.hubId,
//           selectedSession,
//           selectedDate,
//         );

//         if (!isAllowed) {
//           console.log(
//             "Order not allowed for this slot:",
//             cutoffValidation.message,
//           );
//         }
//       }
//     };

//     checkCutoff();
//   }, [address, selectedDate, selectedSession, validateCutoffTiming]);

//   // Add a function to refresh address from localStorage
//   const refreshAddress = useCallback(() => {
//     try {
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const currentLocation = localStorage.getItem("currentLocation");
//       const defaultHubData = localStorage.getItem("defaultHubData");

//       if (primaryAddress && primaryAddress !== "null") {
//         const parsedPrimary = JSON.parse(primaryAddress);
//         setAddress(parsedPrimary);
//         setShouldLoadDefaultMenu(false);
//       } else if (currentLocation && currentLocation !== "null") {
//         const parsedCurrent = JSON.parse(currentLocation);
//         setAddress(parsedCurrent);
//         setShouldLoadDefaultMenu(false);
//       } else if (defaultHubData && defaultHubData !== "null") {
//         try {
//           const parsedDefault = JSON.parse(defaultHubData);
//           const defaultAddress = {
//             hubId:
//               parsedDefault.hubId ||
//               parsedDefault._id ||
//               "69613cb1145c1aaedd9859cd",
//             hubName: parsedDefault.hubName || parsedDefault.name || "Default Hub",
//             fullAddress:
//               parsedDefault.address || "Select your location to view menu",
//             isDefaultHub: true,
//             location: parsedDefault.location || {
//               type: "Point",
//               coordinates: [0, 0],
//             },
//           };
//           setAddress(defaultAddress);
//           setShouldLoadDefaultMenu(false);
//           localStorage.setItem(
//             "currentLocation",
//             JSON.stringify(defaultAddress),
//           );
//         } catch (e) {
//           console.error("Error parsing default hub data:", e);
//           setAddress(null);
//           setShouldLoadDefaultMenu(!user);
//         }
//       } else {
//         setAddress(null);
//         setShouldLoadDefaultMenu(!user);
//       }
//     } catch (error) {
//       console.error("Error refreshing address:", error);
//       setAddress(null);
//       setShouldLoadDefaultMenu(!user);
//     }
//   }, [user]);

//   // Listen for location updates from Banner
//   useEffect(() => {
//     const handleLocationUpdated = () => {
//       refreshAddress();
//     };

//     const handleAddressUpdated = () => {
//       refreshAddress();
//     };

//     const handleAddressAdded = () => {
//       refreshAddress();
//     };

//     const handleFocus = () => {
//       refreshAddress();
//     };

//     const handleDefaultHubLoaded = () => {
//       refreshAddress();
//     };

//     window.addEventListener("locationUpdated", handleLocationUpdated);
//     window.addEventListener("addressUpdated", handleAddressUpdated);
//     window.addEventListener("addressAdded", handleAddressAdded);
//     window.addEventListener("focus", handleFocus);
//     window.addEventListener("defaultHubLoaded", handleDefaultHubLoaded);

//     const handleStorageChange = (e) => {
//       if (
//         e.key === "currentLocation" ||
//         e.key === "primaryAddress" ||
//         e.key === "defaultHubData"
//       ) {
//         refreshAddress();
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);

//     const intervalId = setInterval(() => {
//       refreshAddress();
//     }, 2000);

//     return () => {
//       window.removeEventListener("locationUpdated", handleLocationUpdated);
//       window.removeEventListener("addressUpdated", handleAddressUpdated);
//       window.removeEventListener("addressAdded", handleAddressAdded);
//       window.removeEventListener("focus", handleFocus);
//       window.removeEventListener("defaultHubLoaded", handleDefaultHubLoaded);
//       window.removeEventListener("storage", handleStorageChange);
//       clearInterval(intervalId);
//     };
//   }, [refreshAddress]);

//   // State for location popup
//   const [showLocationPopup, setShowLocationPopup] = useState(false);

//   // Update handleSelectionChange to reset selectedCategory
//   const handleSelectionChange = (date1, session1) => {
//     setSelectedDate(date1);
//     setSelectedSession(session1);
//     setSelectedCategory("");
//     // Reset applied offer when changing slot
//     setAppliedOfferForSlot(null);
//     window.scrollTo(0, 0);
//   };

//   // Check if user is logged in but has no address selected
//   useEffect(() => {
//     if (user && !address) {
//       const timer = setTimeout(() => {
//         setShowLocationPopup(true);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [user, address]);

//   // Add location detection for users coming from splash screen
//   useEffect(() => {
//     const checkLocationPermission = async () => {
//       const currentLocation = localStorage.getItem("currentLocation");
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const defaultHubData = localStorage.getItem("defaultHubData");

//       if (currentLocation || primaryAddress || defaultHubData || address) {
//         return;
//       }

//       if (navigator.geolocation && navigator.permissions) {
//         try {
//           const permission = await navigator.permissions.query({
//             name: "geolocation",
//           });
//         } catch (error) {
//           console.error("Permissions API error:", error);
//         }
//       }
//     };

//     const timer = setTimeout(checkLocationPermission, 500);
//     return () => clearTimeout(timer);
//   }, []);

//   // --- 1. FETCH DATA (Only when Hub Changes) ---
//   useEffect(() => {
//     const hubIdToUse =
//       address?.hubId ||
//       (shouldLoadDefaultMenu && !user ? "69613cb1145c1aaedd9859cd" : null);

//     if (!hubIdToUse) {
//       setAllHubMenuData([]);
//       setloader(false);
//       return;
//     }

//     const fetchAllMenuData = async () => {
//       setloader(true);
//       try {
//         const res = await axios.get(
//           "http://localhost:7013/api/user/get-hub-menu",
//           {
//             params: { hubId: hubIdToUse },
//           },
//         );

//         if (res.status === 200) {
//           setAllHubMenuData(res.data.menu);
//         } else {
//           setAllHubMenuData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching menu:", error);
//         setAllHubMenuData([]);
//       } finally {
//         setloader(false);
//       }
//     };

//     fetchAllMenuData();
//   }, [address?.hubId, shouldLoadDefaultMenu, user]);

//   const handleLocationDetected = useCallback((newLocation) => {
//     setAddress(newLocation);
//     setShouldLoadDefaultMenu(false);

//     if (newLocation) {
//       localStorage.setItem("currentLocation", JSON.stringify(newLocation));
//     }

//     window.dispatchEvent(new Event("locationUpdated"));
//   }, []);

//   // --- 2. CORE FILTERING LOGIC ---
//   const currentSlotItems = useMemo(() => {
//     if (!allHubMenuData?.length) return [];
//     const selectedDateISO = selectedDate.toISOString();

//     return allHubMenuData.filter(
//       (item) =>
//         item.deliveryDate === selectedDateISO &&
//         item.session === selectedSession,
//     );
//   }, [allHubMenuData, selectedDate, selectedSession]);

//   const vegFilteredItems = useMemo(() => {
//     if (isVegOnly) {
//       return currentSlotItems.filter((item) => item.foodcategory === "Veg");
//     }
//     return currentSlotItems;
//   }, [currentSlotItems, isVegOnly]);

//   const dynamicTabs = useMemo(() => {
//     const categories = new Set(
//       vegFilteredItems.map((item) => item.menuCategory),
//     );
//     const uniqueCats = [...categories].filter(Boolean).sort();
//     return uniqueCats;
//   }, [vegFilteredItems]);

//   useEffect(() => {
//     if (dynamicTabs.length > 0 && !selectedCategory) {
//       setSelectedCategory(dynamicTabs[0]);
//     } else if (
//       dynamicTabs.length > 0 &&
//       !dynamicTabs.includes(selectedCategory)
//     ) {
//       setSelectedCategory(dynamicTabs[0]);
//     }
//   }, [dynamicTabs, selectedCategory]);

//   const finalDisplayItems = useMemo(() => {
//     if (!selectedCategory) return [];
//     return vegFilteredItems.filter(
//       (item) => item.menuCategory === selectedCategory,
//     );
//   }, [vegFilteredItems, selectedCategory]);

//   const isSameDay = (d1, d2) => {
//     const a = new Date(d1);
//     const b = new Date(d2);
//     a.setHours(0, 0, 0, 0);
//     b.setHours(0, 0, 0, 0);
//     return a.getTime() === b.getTime();
//   };

//   // ============ Check cutoff using validation result ============
//   const isBeforeCutoff = (deliveryDate, session) => {
//     if (!deliveryDate || !session) return false;

//     // Use the cutoff validation result from API
//     if (!cutoffValidation.allowed) {
//       return false;
//     }

//     const now = new Date();
//     const delivery = new Date(deliveryDate);
//     delivery.setHours(0, 0, 0, 0);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Future dates are always allowed
//     if (delivery.getTime() > today.getTime()) return true;

//     // Past dates are not allowed
//     if (delivery.getTime() < today.getTime()) return false;

//     // For today, use the API validation result
//     return cutoffValidation.allowed;
//   };

//   // Helper: always use preorder price if available and before cutoff
//   const getEffectivePrice = (item, matchedLocation, session) => {
//     const hubPrice =
//       (matchedLocation &&
//         (matchedLocation.hubPrice || matchedLocation.basePrice)) ||
//       item?.hubPrice ||
//       item?.basePrice ||
//       0;
//     const preOrderPrice =
//       (matchedLocation &&
//         (matchedLocation.preOrderPrice || matchedLocation.preorderPrice)) ||
//       item?.preOrderPrice ||
//       item?.preorderPrice ||
//       0;
//     const beforeCutoff = isBeforeCutoff(
//       item?.deliveryDate || item?.deliveryDateISO,
//       session,
//     );
//     if (beforeCutoff && preOrderPrice > 0) return { price: preOrderPrice };
//     return { price: hubPrice };
//   };

//   const [cartCount, setCartCount] = useState(0);
//   const [isCartVisible, setIsCartVisible] = useState(false);

//   const handleShow = () => {
//     setCartCount(cartCount + 1);
//     setIsCartVisible(true);
//   };

//   const [foodData, setFoodData] = useState({});
//   const [open, setOpen] = useState(false);

//   const showDrawer = (food) => {
//     setFoodData(food);
//     setOpen(true);
//   };
//   const onClose = () => {
//     setOpen(false);
//   };

//   useEffect(() => {
//     if (open) {
//       document.body.classList.add("drawer-open");
//     } else {
//       document.body.classList.remove("drawer-open");
//     }
//     return () => {
//       document.body.classList.remove("drawer-open");
//     };
//   }, [open]);

//   const [show4, setShow4] = useState(false);
//   const handleClose4 = () => setShow4(false);
//   const [show3, setShow3] = useState(false);
//   const handleClose3 = () => setShow3(false);
//   const [show2, setShow2] = useState(false);
//   const handleClose2 = () => setShow2(false);
//   const handleShow2 = () => setShow2(true);

//   useEffect(() => {
//     refreshAddress();
//   }, [user]);

//   // ============ Helper function to check if any offer is already applied in cart ============
//   const isOfferAlreadyAppliedInCart = () => {
//     return Carts.some(item => item.offerProduct === true && item.offerApplied === true);
//   };

//   // ============ Helper function to get the applied offer details ============
//   const getAppliedOfferFromCart = () => {
//     return Carts.find(item => item.offerProduct === true && item.offerApplied === true);
//   };

// // ============ Add to cart with FIRST OFFER ONLY logic (UPDATED) ============
// const addCart1 = async (item, offerData, matchedLocation) => {
//   // Check cutoff before adding to cart
//   if (!cutoffValidation.allowed) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title:
//         cutoffValidation.message ||
//         `Cannot add to cart. Orders are closed for ${selectedSession}.`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   if (!matchedLocation || matchedLocation?.Remainingstock === 0) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Product is out of stock`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   const eff = getEffectivePrice(item, matchedLocation, selectedSession);
  
//   // CRITICAL LOGIC: Check if any offer is already applied in cart for this slot
//   const hasOfferInCart = isOfferAlreadyAppliedInCart();
//   const appliedOffer = getAppliedOfferFromCart();
  
//   // Get regular price (base price without any offer)
//   const regularPrice = matchedLocation?.hubPrice || item?.hubPrice || matchedLocation?.basePrice || item?.basePrice || 115;
//   const offerPriceValue = offerData?.price || null;
  
//   let appliedPrice;
//   let isOfferApplied = false;
//   let finalOfferPrice = null;
//   let finalRegularPrice = regularPrice;
  
//   // If this product has an offer available
//   if (offerData && offerData.price) {
//     // If NO offer has been applied yet in cart, apply this offer (FIRST OFFER WINS)
//     if (!hasOfferInCart) {
//       appliedPrice = offerData.price;
//       isOfferApplied = true;
//       finalOfferPrice = offerData.price;
//       console.log(`FIRST OFFER APPLIED: ${item.foodname} at ₹${offerData.price}`);
//     } 
//     // If an offer is already applied in cart, this product gets regular price (SECOND OFFER DOESN'T APPLY)
//     else {
//       appliedPrice = regularPrice;
//       isOfferApplied = false;
//       console.log(`SECOND OFFER REJECTED: ${item.foodname} at regular price ₹${regularPrice} (Offer already applied to ${appliedOffer?.foodname})`);
      
//       // Show toast notification that only one offer per slot is allowed
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Only one offer per slot allowed! ${appliedOffer?.foodname} already has the offer.`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   } else {
//     // No offer available for this product
//     appliedPrice = regularPrice;
//   }

//   const slotKey = `${selectedDate.toISOString()}|${selectedSession}`;
  
//   const newCartItem = {
//     deliveryDate: new Date(selectedDate).toISOString(),
//     session: selectedSession,
//     slotKey: slotKey,
//     foodItemId: item?._id,
//     price: appliedPrice,
//     totalPrice: appliedPrice,
//     image: item?.Foodgallery[0]?.image2,
//     unit: item?.unit,
//     foodname: item?.foodname,
//     quantity: item?.quantity,
//     Quantity: 1,
//     gst: item?.gst,
//     discount: item?.discount,
//     foodcategory: item?.foodcategory,
//     remainingstock: matchedLocation?.Remainingstock,
//     offerProduct: !!offerData,
//     offerApplied: isOfferApplied, // Track if this item actually got the offer price
//     offerPrice: finalOfferPrice,
//     regularPrice: finalRegularPrice,
//     minCart: offerData?.minCart || 0,
//     actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//     offerQ: 1,
//     basePrice: matchedLocation?.basePrice || item?.basePrice || 0,
//     hubPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//     preOrderPrice: matchedLocation?.preOrderPrice || item?.preOrderPrice || 0,
//   };

//   const cart = JSON.parse(localStorage.getItem("cart"));
//   const cartArray = Array.isArray(cart) ? cart : [];

//   const itemIndex = cartArray.findIndex(
//     (cartItem) =>
//       cartItem?.foodItemId === newCartItem?.foodItemId &&
//       cartItem.deliveryDate === newCartItem.deliveryDate &&
//       cartItem.session === newCartItem.session,
//   );

//   if (itemIndex === -1) {
//     cartArray.push(newCartItem);
//     localStorage.setItem("cart", JSON.stringify(cartArray));
//     setCarts(cartArray);
//     handleShow();
//   } else {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Item is already in this slot's cart`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   }
// };

//   const [cart, setCart] = useState([]);

//   useEffect(() => {
//     const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
//     setCart(storedCart);

//     const addonedCarts = async () => {
//       try {
//         await axios.post("http://localhost:7013/api/cart/addCart", {
//           userId: user?._id,
//           items: storedCart,
//           lastUpdated: Date.now,
//           username: user?.Fname,
//           mobile: user?.Mobile,
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     if (Carts && Carts.length > 0 && user?._id) {
//       addonedCarts();
//     }
//   }, [JSON.stringify(Carts), user?._id]);

//   const updateCartData = (updatedCart) => {
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//     setCart(updatedCart);
//     setCarts(updatedCart);
//   };


// // ============ Increase quantity with offer logic (FIXED) ============
// const increaseQuantity = (foodItemId, offerData, item, matchedLocation) => {
//   const maxStock = matchedLocation?.Remainingstock || 0;
//   const selectedDateISO = selectedDate.toISOString();
  
//   // Find the existing cart item
//   const existingItem = Carts.find(
//     (cartItem) =>
//       cartItem.foodItemId === foodItemId &&
//       cartItem.deliveryDate === selectedDateISO &&
//       cartItem.session === selectedSession
//   );
  
//   if (!existingItem) return;
  
//   // Check if this item got the offer price (first item in cart with offer)
//   const gotOfferPrice = existingItem.offerApplied === true;
//   const regularPrice = existingItem.regularPrice || existingItem.hubPrice || matchedLocation?.hubPrice || 115;
//   const offerPriceValue = existingItem.offerPrice;
  
//   // Calculate price for new quantity
//   let newPricePerUnit;
//   let newTotalPrice;
//   const currentQuantity = existingItem.Quantity;
//   const newQuantity = currentQuantity + 1;
  
//   if (gotOfferPrice) {
//     // This product got the offer price (it's the first offer item in cart)
//     if (currentQuantity === 1 && newQuantity === 2) {
//       // Adding second item: first at offer price, second at regular price
//       // Total = offerPrice + regularPrice, average price changes
//       newPricePerUnit = regularPrice; // Display price per unit becomes regular for UI
//       newTotalPrice = offerPriceValue + regularPrice;
//     } else if (currentQuantity >= 2) {
//       // Already have offer + regular items, adding another regular item
//       newPricePerUnit = regularPrice;
//       newTotalPrice = existingItem.totalPrice + regularPrice;
//     } else {
//       // Should not happen, but fallback
//       newPricePerUnit = regularPrice;
//       newTotalPrice = offerPriceValue + (regularPrice * (newQuantity - 1));
//     }
//   } else {
//     // No offer applied to this product, all at regular price
//     newPricePerUnit = regularPrice;
//     newTotalPrice = regularPrice * newQuantity;
//   }
  
//   if (newQuantity <= maxStock) {
//     const updatedCart = Carts.map((cartItem) => {
//       if (
//         cartItem.foodItemId === foodItemId &&
//         cartItem.deliveryDate === selectedDateISO &&
//         cartItem.session === selectedSession
//       ) {
//         return {
//           ...cartItem,
//           Quantity: newQuantity,
//           price: newPricePerUnit,
//           totalPrice: newTotalPrice,
//         };
//       }
//       return cartItem;
//     });
    
//     updateCartData(updatedCart);
//   } else {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `No more stock available!`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   }
// };

//   const [show, setShow] = useState(true);
//   const [expiryDays, setExpiryDays] = useState(0);

// // ============ Decrease quantity with offer logic (FIXED) ============
// const decreaseQuantity = (foodItemId, offerData, matchedLocation) => {
//   const selectedDateISO = selectedDate.toISOString();
  
//   const existingItem = Carts.find(
//     (cartItem) =>
//       cartItem.foodItemId === foodItemId &&
//       cartItem.deliveryDate === selectedDateISO &&
//       cartItem.session === selectedSession
//   );
  
//   if (!existingItem) return;
  
//   const gotOfferPrice = existingItem.offerApplied === true;
//   const regularPrice = existingItem.regularPrice || existingItem.hubPrice || matchedLocation?.hubPrice || 115;
//   const offerPriceValue = existingItem.offerPrice;
//   const currentQuantity = existingItem.Quantity;
//   const newQuantity = currentQuantity - 1;
  
//   if (newQuantity === 0) {
//     // Remove item completely
//     const updatedCart = Carts.filter(
//       (item) =>
//         !(item.foodItemId === foodItemId &&
//           item.deliveryDate === selectedDateISO &&
//           item.session === selectedSession)
//     );
//     updateCartData(updatedCart);
//     return;
//   }
  
//   let newPricePerUnit;
//   let newTotalPrice;
  
//   if (gotOfferPrice) {
//     if (newQuantity === 1) {
//       // Going back to just the offer item
//       newPricePerUnit = offerPriceValue;
//       newTotalPrice = offerPriceValue;
//     } else if (newQuantity > 1) {
//       // Still have offer + regular items
//       // Total = offerPrice + (regularPrice * (newQuantity - 1))
//       newPricePerUnit = regularPrice;
//       newTotalPrice = offerPriceValue + (regularPrice * (newQuantity - 1));
//     } else {
//       newPricePerUnit = regularPrice;
//       newTotalPrice = regularPrice * newQuantity;
//     }
//   } else {
//     // No offer, all regular
//     newPricePerUnit = regularPrice;
//     newTotalPrice = regularPrice * newQuantity;
//   }
  
//   const updatedCart = Carts.map((cartItem) => {
//     if (
//       cartItem.foodItemId === foodItemId &&
//       cartItem.deliveryDate === selectedDateISO &&
//       cartItem.session === selectedSession
//     ) {
//       return {
//         ...cartItem,
//         Quantity: newQuantity,
//         price: newPricePerUnit,
//         totalPrice: newTotalPrice,
//       };
//     }
//     return cartItem;
//   });
  
//   updateCartData(updatedCart);
// };

//   const isAddressReady = () => {
//     const addresstype1 = localStorage.getItem("addresstype");
//     if (!addresstype1) return false;

//     const addressKey =
//       addresstype1 === "apartment" ? "address" : "coporateaddress";
//     const addressRaw = localStorage.getItem(addressKey);

//     if (!addressRaw) return false;

//     try {
//       const address1 = JSON.parse(addressRaw);
//       if (!address1) return false;

//       const apartmentname =
//         address1?.apartmentname || address1?.Apartmentname || "";
//       const addressField = address1?.Address || address1?.address || "";
//       const pincode = address1?.pincode || "";

//       return apartmentname && addressField && pincode;
//     } catch (error) {
//       return false;
//     }
//   };

//   // This useEffect now calls getAllOffer which is defined above
//   useEffect(() => {
//     if (Carts?.length > 0) {
//       handleShow();
//     }
//     if (user?._id) {
//       getAllOffer();
//     }
//   }, [user?._id]);

//   const groupedCarts = useMemo(() => {
//     if (!Carts || Carts.length === 0) return [];
//     const groups = Carts.reduce((acc, item) => {
//       const key = `${item.deliveryDate}|${item.session}`;

//       if (!item.deliveryDate || !item.session) return acc;

//       if (!acc[key]) {
//         acc[key] = {
//           session: item.session,
//           date: new Date(item.deliveryDate),
//           totalItems: 0,
//           subtotal: 0,
//           items: [],
//         };
//       }

//       acc[key].totalItems += item.Quantity;
//       acc[key].subtotal += item.price * item.Quantity;
//       acc[key].items.push(item);

//       return acc;
//     }, {});

//     return Object.values(groups).sort((a, b) => a.date - b.date);
//   }, [Carts]);

//   const overallTotalItems = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.totalItems, 0);
//   }, [groupedCarts]);

//   const overallSubtotal = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.subtotal, 0);
//   }, [groupedCarts]);

//   const [deliveryCharge, setDeliveryCharge] = useState([]);
//   const [filteredRates, setFilteredRates] = useState([]);

//   const getDeliveryRates = async () => {
//     try {
//       const res = await axios.get("http://localhost:7013/api/deliveryrate/all");
//       setDeliveryCharge(res.data.data);
//       setFilteredRates(res.data.data);
//     } catch (error) {
//       console.error("Error fetching delivery rates:", error);
//     }
//   };

//   const findDeliveryRate = (hubId, acquisitionChannel, status) => {
//     if (!deliveryCharge || deliveryCharge.length === 0) {
//       return 15;
//     }

//     const matchedRate = deliveryCharge.find(
//       (rate) =>
//         rate.hubId === hubId &&
//         rate.acquisition_channel === acquisitionChannel &&
//         rate.status === status,
//     );

//     return matchedRate?.deliveryRate || 15;
//   };

//   const isEmployeeForDelivery = user?.status === "Employee";
//   const acquisitionChannelForDelivery = isEmployeeForDelivery
//     ? "employee"
//     : user?.acquisition_channel || "organic";
//   const userStatus = user?.status;
//   const hubId = address?.hubId;
//   const deliveryRate = findDeliveryRate(
//     hubId,
//     acquisitionChannelForDelivery,
//     userStatus,
//   );

//   const proceedToPlan = async () => {
//     if (!user) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Please Login!`,
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
//     if (Carts.length === 0) {
//       return;
//     }

//     if (!address) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Please Select Address!`,
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

//     setloader(true);
//     try {
//       const addressDetails = {
//         addressId: address._id || "",
//         addressline: `${address.fullAddress}`,
//         addressType: address.addressType || "",
//         coordinates: address.location?.coordinates || [0, 0],
//         hubId: address.hubId || "",
//         hubName: address.hubName || "",
//         studentInformation: address.studentInformation,
//         schoolName: address.schoolName || "",
//         houseName: address.houseName || "",
//         apartmentName: address.apartmentName || "",
//         companyName: address.companyName || "",
//         companyId: address.companyId || "",
//         customerType: user.status || "",
//       };

//       const res = await axios.post(
//         "http://localhost:7013/api/user/plan/add-to-plan",
//         {
//           userId: user._id,
//           mobile: user.Mobile,
//           username: user.Fname,
//           companyId: user?.companyId || "",
//           items: Carts,
//           addressDetails: addressDetails,
//           deliveryCharge: deliveryRate,
//         },
//       );

//       if (res.status === 200) {
//         localStorage.removeItem("cart");
//         setCarts([]);
//         navigate("/my-plan");
//       }
//     } catch (error) {
//       console.error("❌ proceedToPlan - Error:", error);
//     } finally {
//       setloader(false);
//     }
//   };

//   // Time check effect
//   useEffect(() => {
//     const checkTime = () => {
//       const now = new Date();
//       const currentTimeInMinutes = 10 * 60 + now.getMinutes();
//       const lunchStart = 7 * 60;
//       const lunchPrepStart = 9 * 60;
//       const lunchCookingStart = 11 * 60;
//       const lunchEnd = 14 * 60;

//       const dinnerStart = 14 * 60;
//       const dinnerPrepStart = 16 * 60 + 30;
//       const dinnerCookingStart = 18 * 60;
//       const dinnerEnd = 21 * 60;

//       const shopCloseTime = 21 * 60;

//       if (
//         currentTimeInMinutes >= lunchStart &&
//         currentTimeInMinutes < lunchPrepStart
//       ) {
//         setGifUrl("sourcing.gif");
//         setMessage(
//           "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= lunchPrepStart &&
//         currentTimeInMinutes < lunchCookingStart
//       ) {
//         setGifUrl("cuttingveg.gif");
//         setMessage(
//           "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= lunchCookingStart &&
//         currentTimeInMinutes < lunchEnd
//       ) {
//         setGifUrl("cookinggif.gif");
//         setMessage(
//           "Cooking your meal. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerStart &&
//         currentTimeInMinutes < dinnerPrepStart
//       ) {
//         setGifUrl("sourcing.gif");
//         setMessage(
//           "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerPrepStart &&
//         currentTimeInMinutes < dinnerCookingStart
//       ) {
//         setGifUrl("cuttingveg.gif");
//         setMessage(
//           "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerCookingStart &&
//         currentTimeInMinutes <= dinnerEnd
//       ) {
//         setGifUrl("cookinggif.gif");
//         setMessage(
//           "Cooking your meal. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (currentTimeInMinutes >= shopCloseTime) {
//         setGifUrl("Closed.gif");
//         setMessage(
//           "The Store is now closed. Operating hours: Lunch: 7:00 AM - 02:00 PM, Dinner: 2:00 PM - 9:00 PM.",
//         );
//       } else {
//         setGifUrl("Closed.gif");
//         setMessage(
//           "Orders are currently closed. Lunch: 7:00 AM - 02:00 PM. Dinner: 2:00 PM - 9:00 PM.",
//         );
//       }
//     };
//     checkTime();
//     const interval = setInterval(checkTime, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const [Fname, setFname] = useState("");
//   const [Mobile, setMobile] = useState("");
//   const [OTP, setOTP] = useState(["", "", "", ""]);
//   const [PasswordShow, setPasswordShow] = useState(false);

//   const userLogin = async () => {
//     if (!Mobile) {
//       return Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Enter Your Mobile Number`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//     setloader(true);
//     try {
//       const config = {
//         url: "/User/Sendotp",
//         method: "post",
//         baseURL: "http://localhost:7013/api",
//         headers: { "content-type": "application/json" },
//         data: { Mobile: Mobile },
//       };

//       const res = await axios(config);
//       if (res.status === 401) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Invalid Mobile Number`,
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
//           title: `Something went wrong`,
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
//         setloader(false);
//         handleClose3();
//         handleShow2();
//       }
//     } catch (error) {
//       setloader(false);
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   function validateIndianMobileNumber(mobileNumber) {
//     const regex = /^[6-9]\d{9}$/;
//     return regex.test(mobileNumber);
//   }

//   const verifyOTP = async () => {
//     try {
//       if (!OTP) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Enter a valid OTP`,
//           showConfirmButton: false,
//           timer: 3000,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//       const config = {
//         url: "User/mobileotpverification",
//         method: "post",
//         baseURL: "http://localhost:7013/api/",
//         header: { "content-type": "application/json" },
//         data: { Mobile: Mobile, otp: OTP },
//       };
//       const res = await axios(config);
//       if (res.status === 200) {
//         updateUser(res.data.details);
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "success",
//           title: `OTP verified successfully`,
//           showConfirmButton: false,
//           timer: 3000,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });

//         if (!address) {
//           handleClose2();
//           handleClose3();
//           return navigate("/");
//         }
//         navigate("/");
//         handleClose2();
//         setOTP("");
//         setMobile("");
//       }
//     } catch (error) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const getCartQuantity = (itemId) => {
//     const selectedDateISO = selectedDate.toISOString();
//     return Carts?.filter(
//       (cartItem) =>
//         cartItem?.foodItemId === itemId &&
//         cartItem.deliveryDate === selectedDateISO &&
//         cartItem.session === selectedSession,
//     )?.reduce((total, curr) => total + curr?.Quantity, 0);
//   };

//   // Automatically remove today's Lunch/Dinner cart items after cutoff times
//   useEffect(() => {
//     if (!Carts || !setCarts) return;
//     const toKey = (date) => new Date(date).toISOString().slice(0, 10);
//     const cleanup = () => {
//       const now = new Date();
//       const todayKey = toKey(now);
//       let removed = [];
//       const shouldRemove = (item) => {
//         if (!item) return false;
//         const dateVal =
//           item.deliveryDate ||
//           item.date ||
//           item.slotDate ||
//           item.deliveryDateString;
//         const sessionVal = (
//           item.session ||
//           item.slotSession ||
//           item.mealSession ||
//           ""
//         ).toString();
//         if (!dateVal || !sessionVal) return false;
//         const itemKey = toKey(dateVal);
//         if (itemKey !== todayKey) return false;
//         return !isBeforeCutoff(dateVal, sessionVal);
//       };
//       const newCarts = [];
//       Carts.forEach((it) => {
//         if (shouldRemove(it)) {
//           removed.push(it);
//         } else {
//           newCarts.push(it);
//         }
//       });
//       if (removed.length > 0) {
//         setCarts(newCarts);
//       }
//     };
//     cleanup();
//     const id = setInterval(cleanup, 60 * 5000);
//     return () => clearInterval(id);
//   }, [Carts, setCarts]);

//   const lastCartRawRef = useRef(null);
//   useEffect(() => {
//     const readCart = () => {
//       try {
//         const raw = localStorage.getItem("cart") || "[]";
//         if (raw !== lastCartRawRef.current) {
//           lastCartRawRef.current = raw;
//           const parsed = JSON.parse(raw);
//           setCarts(Array.isArray(parsed) ? parsed : []);
//           setCart(Array.isArray(parsed) ? parsed : []);
//         }
//       } catch (err) {
//         console.error("cart sync error", err);
//       }
//     };

//     readCart();
//     const intervalId = setInterval(readCart, 1000);
//     const onStorage = (e) => {
//       if (e.key === "cart") readCart();
//     };
//     const onCartUpdated = () => readCart();
//     window.addEventListener("storage", onStorage);
//     window.addEventListener("cart_updated", onCartUpdated);

//     return () => {
//       clearInterval(intervalId);
//       window.removeEventListener("storage", onStorage);
//       window.removeEventListener("cart_updated", onCartUpdated);
//     };
//   }, [setCarts]);

//   // Clean up any leftover flags
//   useEffect(() => {
//     localStorage.removeItem("triggerProceedToPlan");
//     sessionStorage.removeItem("justAddedAddress");
//   }, []);

//   // Compute showOffer safely
//   const showOffer = useMemo(() => {
//     if (!AllOffer?.length) return false;
//     try {
//       const primaryAddressStr = localStorage.getItem("primaryAddress");
//       const primaryAddress = primaryAddressStr
//         ? JSON.parse(primaryAddressStr)
//         : null;
//       const isEmployeeForOffer = user?.status === "Employee";
//       const acquisitionChannelForOffer = isEmployeeForOffer
//         ? "employee"
//         : user?.acquisition_channel || "organic";
//       return (
//         primaryAddress?.hubId === AllOffer[0]?.hubId &&
//         acquisitionChannelForOffer === AllOffer[0]?.acquisition_channel
//       );
//     } catch (error) {
//       console.error("Error parsing primaryAddress for offer:", error);
//       return false;
//     }
//   }, [AllOffer, user?.status]);

//   // ============ Helper to check if product has offer ============
//   const getProductOffer = (item) => {
//     try {
//       const primaryAddressJson = localStorage.getItem("primaryAddress");
//       if (!primaryAddressJson || !AllOffer?.length) return null;
      
//       const primaryAddress = JSON.parse(primaryAddressJson);
//       const isEmployeeForOffer = user?.status === "Employee";
//       const acquisitionChannelForOffer = isEmployeeForOffer
//         ? "employee"
//         : user?.acquisition_channel || "organic";
      
//       // Check if any offer is already applied in cart
//       const hasOfferInCart = isOfferAlreadyAppliedInCart();
      
//       // Find valid offers for this product
//       for (const offer of AllOffer) {
//         const hubMatches = offer?.hubId === primaryAddress?.hubId;
//         const acquisitionChannelMatch = offer?.acquisition_channel === acquisitionChannelForOffer;
//         const offerStartDate = new Date(offer?.startDate);
//         const offerEndDate = new Date(offer?.endDate);
//         const deliverydate = new Date(item.deliveryDate);
//         const isWithinDateRange = deliverydate >= offerStartDate && deliverydate <= offerEndDate;
        
//         if (hubMatches && isWithinDateRange && acquisitionChannelMatch) {
//           const matchingProduct = offer.products?.find(
//             (product) => product?.foodItemId?.toString() === item?._id?.toString()
//           );
          
//           if (matchingProduct) {
//             // If an offer is already applied in cart, don't show offer price for other products
//             if (hasOfferInCart) {
//               return { ...matchingProduct, isBlocked: true };
//             }
//             return matchingProduct;
//           }
//         }
//       }
//       return null;
//     } catch (error) {
//       console.error("Error getting product offer:", error);
//       return null;
//     }
//   };

//   return (
//     <div>
//       <ToastContainer />

//       <div>
//         <Banner
//           Carts={Carts}
//           getAllOffer={getAllOffer}
//           isVegOnly={isVegOnly}
//           setIsVegOnly={setIsVegOnly}
//           onLocationDetected={handleLocationDetected}
//         />
//       </div>

//       {wallet?.balance > 0 && show && (
//         <div style={{ position: "relative" }}>
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 backgroundColor: "#f9f8f6",
//                 opacity: 1,
//                 zIndex: 20,
//                 pointerEvents: "auto",
//               }}
//             ></div>
//           )}

//           <CoinBalance
//             wallet={wallet}
//             transactions={transactions}
//             expiryDays={expiryDays}
//             setExpiryDays={setExpiryDays}
//             setShow={setShow}
//           />
//         </div>
//       )}

//       <div className="sticky-menu-header" style={{ position: "relative" }}>
//         <div style={{ position: "relative" }}>
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 zIndex: 10,
//                 pointerEvents: "none",
//                 opacity: 0.8,
//               }}
//             ></div>
//           )}
//           <DateSessionSelector
//             onChange={handleSelectionChange}
//             currentDate={selectedDate}
//             currentSession={selectedSession}
//             menuData={allHubMenuData}
//           />
//         </div>
//       </div>

//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.8,
//             }}
//           ></div>
//         )}
//         <Container>
//           <RatingModal />

//           {showOffer && (
//             <div className="maincontainer">
//               <div
//                 className="d-flex gap-3 mb-2 messageDiv rounded-2 mt-3 justify-content-center"
//                 style={{
//                   backgroundColor: "white",
//                   padding: "5px",
//                   height: "50px",
//                 }}
//               >
//                 <p
//                   className="mb-0 typewriter-desc"
//                   style={{
//                     color: "#6B8E23",
//                     fontSize: "1rem",
//                     textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
//                     lineHeight: "1.6",
//                     textAlign: "center",
//                   }}
//                 >
//                   {AllOffer[0]?.session === "Lunch" ? (
//                     <>
//                       Beat the afternoon hunger!{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price} for Lunch!
//                     </>
//                   ) : AllOffer[0]?.session === "Dinner" ? (
//                     <>
//                       Make your evening special!{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price} for Dinner!
//                     </>
//                   ) : (
//                     <>
//                       🥳 Limited time offer:{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price}!
//                     </>
//                   )}
//                 </p>
//               </div>
//             </div>
//           )}

//           {loader ? (
//             <div
//               className="d-flex justify-content-center align-item-center"
//               style={{
//                 position: "fixed",
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)",
//                 zIndex: 9999,
//               }}
//             >
//               <div class="lds-ripple">
//                 <div></div>
//                 <div></div>
//               </div>
//             </div>
//           ) : null}
//         </Container>
//       </div>

//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.2,
//             }}
//           ></div>
//         )}
//         <div className="maincontainer">
//           <div className="mobile-product-box" style={{ marginBottom: "30px" }}>
//             <div style={{ marginBottom: "20px" }}>
//               <TabsComponent
//                 tabs={dynamicTabs}
//                 activeTab={selectedCategory}
//                 onTabClick={setSelectedCategory}
//               />
//             </div>

//             <div className="d-flex gap-1 mb-2 flex-column">
//               <div className="row">
//                 {finalDisplayItems?.map((item, i) => {
//                   let matchedLocation = item.locationPrice?.[0];
                  
//                   if (!matchedLocation) {
//                     matchedLocation = {
//                       Remainingstock: 0,
//                       hubPrice: item.hubPrice || item.basePrice || 0,
//                       preOrderPrice: item.preOrderPrice || 0,
//                       basePrice: item.basePrice || 0,
//                     };
//                   }
                  
//                   // Get product offer (will return null if offer already applied to another product)
//                   const productOffer = getProductOffer(item);
//                   const hasOfferInCart = isOfferAlreadyAppliedInCart();
//                   const showOfferPrice = productOffer && !hasOfferInCart;
                  
//                   const { price: effectivePrice } = getEffectivePrice(
//                     item,
//                     matchedLocation,
//                     item?.session,
//                     true,
//                   );
                  
//                   // Determine display price
//                   let displayPrice = effectivePrice;
//                   let offerPrice = null;
                  
//                   if (showOfferPrice && productOffer?.price) {
//                     displayPrice = productOffer.price;
//                     offerPrice = effectivePrice;
//                   }

//                   return (
//                     <div
//                       key={item._id?.toString() || i}
//                       className="col-6 col-md-6 mb-2 d-flex justify-content-center"
//                     >
//                       <div className="mobl-product-card">
//                         <div className="productborder">
//                           <div className="prduct-box rounded-1 cardbx">
//                             <div
//                               onClick={() => showDrawer(item)}
//                               className="imagebg"
//                             >
//                               {item?.foodcategory === "Veg" ? (
//                                 <img
//                                   src={IsVeg}
//                                   alt="IsVeg"
//                                   className="isVegIcon"
//                                 />
//                               ) : (
//                                 <img
//                                   src={IsNonVeg}
//                                   alt="IsNonVeg"
//                                   className="isVegIcon"
//                                 />
//                               )}
//                               <img
//                                 src={`${item?.Foodgallery[0]?.image2}`}
//                                 alt=""
//                                 className="mbl-product-img"
//                               />
//                             </div>
//                           </div>
//                           {item?.foodTags && (
//                             <div className="food-tag-container">
//                               {item.foodTags.map((tag, idx) => (
//                                 <span
//                                   key={idx}
//                                   className="food-tag-pill"
//                                   style={{ backgroundColor: tag.tagColor }}
//                                 >
//                                   <img
//                                     src={chef}
//                                     alt=""
//                                     style={{
//                                       width: "10px",
//                                       height: "10px",
//                                       marginRight: "2px",
//                                     }}
//                                   />
//                                   {tag.tagName}
//                                 </span>
//                               ))}
//                             </div>
//                           )}

//                           <div className="food-name-container">
//                             <p className="food-name">{item?.foodname}</p>
//                             <small className="food-unit">{item?.unit}</small>
//                           </div>

//                           <div
//                             className="d-flex align-items-center mb-3"
//                             style={{ gap: "8px", flexWrap: "nowrap" }}
//                           >
//                             {offerPrice && (
//                               <div
//                                 className="align-items-start"
//                                 style={{
//                                   textDecoration: "line-through",
//                                   color: "#6b6b6b",
//                                   fontSize: "15px",
//                                   whiteSpace: "nowrap",
//                                   flexShrink: 0,
//                                   display: "flex",
//                                   gap: "2px",
//                                   marginLeft: "7px",
//                                 }}
//                               >
//                                 <span className="fw-normal">₹</span>
//                                 <span>{offerPrice}</span>
//                               </div>
//                             )}

//                             <div
//                               className="align-items-start"
//                               style={{
//                                 color: "#2c2c2c",
//                                 fontFamily: "Inter",
//                                 fontSize: "20px",
//                                 fontWeight: "500",
//                                 lineHeight: "25px",
//                                 letterSpacing: "-0.8px",
//                                 whiteSpace: "nowrap",
//                                 flexShrink: 0,
//                                 display: "flex",
//                                 gap: "2px",
//                               }}
//                             >
//                               <div
//                                 className="align-items-start"
//                                 style={{
//                                   display: "flex",
//                                   gap: "1px",
//                                   marginLeft: "6px",
//                                 }}
//                               >
//                                 <span className="fw-bold">₹</span>
//                                 <span>{displayPrice}</span>
//                               </div>
//                             </div>
//                           </div>

//                           <div>
//                             <div className="guaranteed-label">
//                               <img
//                                 src={availabity}
//                                 alt=""
//                                 style={{ width: "11px", height: "11px" }}
//                               />{" "}
//                               Guaranteed Availability
//                             </div>
//                           </div>

//                           <div className="d-flex justify-content-center mb-2">
//                             {getCartQuantity(item?._id) === 0 ? (
//                               address && gifUrl === "Closed.gif" ? (
//                                 <button
//                                   className="add-to-cart-btn-disabled"
//                                   disabled
//                                 >
//                                   <span className="add-to-cart-btn-text">
//                                     Add
//                                   </span>
//                                   <FaPlus className="add-to-cart-btn-icon" />
//                                 </button>
//                               ) : (
//                                 <button
//                                   className={`add-to-cart-btn ${(user && !address) || !cutoffValidation.allowed ? "disabled-btn" : ""}`}
//                                   onClick={() =>
//                                     addCart1(item, productOffer, matchedLocation)
//                                   }
//                                   disabled={
//                                     (user && !address) ||
//                                     !cutoffValidation.allowed
//                                   }
//                                 >
//                                   <div className="pick-btn-text">
//                                     <span className="pick-btn-text1">PICK</span>
//                                     <span className="pick-btn-text2">
//                                       Confirm Later
//                                     </span>
//                                   </div>
//                                   <span className="add-to-cart-btn-icon">
//                                     <FaPlus />
//                                   </span>
//                                 </button>
//                               )
//                             ) : getCartQuantity(item?._id) > 0 ? (
//                               <button className="increaseBtn">
//                                 <div
//                                   className="faplus"
//                                   onClick={() =>
//                                     !(user && !address) &&
//                                     decreaseQuantity(
//                                       item?._id,
//                                       productOffer,
//                                       matchedLocation,
//                                     )
//                                   }
//                                   style={{
//                                     opacity: user && !address ? 0.5 : 1,
//                                     pointerEvents:
//                                       user && !address ? "none" : "auto",
//                                   }}
//                                 >
//                                   <FaMinus />
//                                 </div>
//                                 <div className="faQuantity">
//                                   {getCartQuantity(item?._id)}
//                                 </div>
//                                 <div
//                                   className="faplus"
//                                   onClick={() =>
//                                     !(user && !address) &&
//                                     increaseQuantity(
//                                       item?._id,
//                                       productOffer,
//                                       item,
//                                       matchedLocation,
//                                     )
//                                   }
//                                   style={{
//                                     opacity: user && !address ? 0.5 : 1,
//                                     pointerEvents:
//                                       user && !address ? "none" : "auto",
//                                   }}
//                                 >
//                                   <FaPlus />
//                                 </div>
//                               </button>
//                             ) : gifUrl === "Closed.gif" ? (
//                               <button className="add-to-cart-btn" disabled>
//                                 <span className="add-to-cart-btn-text">
//                                   Add
//                                 </span>
//                                 <span className="add-to-cart-btn-icon">
//                                   <FaPlus />
//                                 </span>
//                               </button>
//                             ) : (
//                               <button
//                                 className="add-to-cart-btn"
//                                 onClick={() =>
//                                   addCart1(item, productOffer, matchedLocation)
//                                 }
//                                 disabled={user && !address}
//                                 style={{ opacity: user && !address ? 0.5 : 1 }}
//                               >
//                                 <span className="add-to-cart-btn-text">
//                                   Add
//                                 </span>
//                                 <span className="add-to-cart-btn-icon">
//                                   <FaPlus />
//                                 </span>
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}

//                 {!loader && finalDisplayItems.length === 0 && (
//                   <div className="col-12 text-center my-5">
//                     {user &&
//                     (!localStorage.getItem("primaryAddress") ||
//                       localStorage.getItem("primaryAddress") === "null") ? (
//                       <div>
//                         <h4>No location selected.</h4>
//                         <p>
//                           Please add your location to view the menu for your
//                           area.
//                         </p>
//                         <button
//                           className="mt-2"
//                           onClick={() => navigate("/location")}
//                           style={{
//                             backgroundColor: "#6B8E23",
//                             color: "white",
//                             padding: "10px 20px",
//                             borderRadius: "5px",
//                             border: "none",
//                           }}
//                         >
//                           Add Location
//                         </button>
//                       </div>
//                     ) : (
//                       <>
//                         <h4>No items available for this slot.</h4>
//                         <p>
//                           Please check back later or select a different day!
//                         </p>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <MultiCartDrawer
//           proceedToPlan={proceedToPlan}
//           groupedCarts={groupedCarts}
//           overallSubtotal={overallSubtotal}
//           overallTotalItems={overallTotalItems}
//           onJumpToSlot={handleSelectionChange}
//         />

//         <Modal show={show3} backdrop="static" onHide={handleClose3}>
//           <Modal.Header closeButton>
//             <Modal.Title className="d-flex align-items-center gap-1">
//               <FaLock color="#6B8E23" /> <span>Welcome to Dailydish</span>
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <div className="login-whatsappwithicon">
//                 <FaSquareWhatsapp size={42} color="green" />
//                 <Form.Control
//                   type="number"
//                   placeholder="Enter Your WhatsApp Number"
//                   value={Mobile}
//                   onChange={(e) => setMobile(e.target.value)}
//                 />
//               </div>
//               <Button
//                 variant=""
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//                 onClick={() => {
//                   if (!validateIndianMobileNumber(Mobile)) {
//                     Swal2.fire({
//                       toast: true,
//                       position: "bottom",
//                       icon: "error",
//                       title: `Invalid mobile number`,
//                       showConfirmButton: false,
//                       timer: 3000,
//                       timerProgressBar: true,
//                       customClass: {
//                         popup: "me-small-toast",
//                         title: "me-small-toast-title",
//                       },
//                     });
//                     return;
//                   }
//                   userLogin();
//                 }}
//               >
//                 Send otp
//               </Button>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleClose3}>
//               Close
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         <Modal
//           show={show2}
//           onHide={handleClose2}
//           size="sm"
//           style={{
//             zIndex: "99999",
//             position: "absolute",
//             top: "30%",
//             left: "0%",
//           }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Enter OTP</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <span style={{ fontSize: "13px" }}>
//               An OTP has been sent to your Phone Number
//             </span>
//             <div className="d-flex gap-1 mt-3 mb-3">
//               <InputGroup className="mb-2" style={{ background: "white" }}>
//                 <Form.Control
//                   type={PasswordShow ? "text" : "password"}
//                   className="login-input"
//                   placeholder="Enter OTP"
//                   aria-describedby="basic-addon1"
//                   onChange={(e) => setOTP(e.target.value)}
//                 />
//                 <Button
//                   variant=""
//                   style={{ borderRadius: "0px", border: "1px solid black" }}
//                   onClick={() => setPasswordShow(!PasswordShow)}
//                   className="passbtn"
//                 >
//                   {PasswordShow ? <FaEye /> : <FaEyeSlash />}
//                 </Button>
//               </InputGroup>
//             </div>
//             <div>
//               <Button
//                 variant=""
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//                 onClick={verifyOTP}
//               >
//                 Continue
//               </Button>
//             </div>
//           </Modal.Body>
//         </Modal>

//         <Drawer
//           placement="bottom"
//           closable={false}
//           onClose={onClose}
//           open={open}
//           key="bottom"
//           height={600}
//           className="description-product"
//           style={{ zIndex: 99999 }}
//           zIndex={99999}
//         >
//           <div className="modal-container-food">
//             <button className="custom-close-btn" onClick={onClose}>
//               ×
//             </button>
//             <div className="modern-food-item">
//               <div className="food-image-container">
//                 <div className="image-loading-spinner" id="image-spinner"></div>
//                 {foodData?.Foodgallery?.length > 0 && (
//                   <img
//                     src={`${foodData.Foodgallery[0].image2}`}
//                     alt={foodData?.foodname}
//                     className="modern-food-image"
//                     onLoad={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       const image =
//                         document.querySelector(".modern-food-image");
//                       if (spinner) spinner.classList.add("hidden");
//                       if (image) image.classList.add("loaded");
//                     }}
//                     onError={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       if (spinner) spinner.classList.add("hidden");
//                     }}
//                   />
//                 )}
//                 <div className="food-category-icon">
//                   {foodData?.foodcategory === "Veg" ? (
//                     <img src={IsVeg} alt="IsVeg" className="isVegIcon" />
//                   ) : (
//                     <img src={IsNonVeg} alt="IsNonVeg" className="isVegIcon" />
//                   )}
//                 </div>
//               </div>

//               <div className="food-details">
//                 <h2 className="food-title">{foodData?.foodname}</h2>
//                 <p className="food-description">{foodData?.fooddescription}</p>

//                 {(() => {
//                   const matchedLocation =
//                     foodData?.locationPrice?.length > 0
//                       ? foodData.locationPrice[0]
//                       : {
//                           Remainingstock: 0,
//                           hubPrice:
//                             foodData.hubPrice || foodData.basePrice || 0,
//                           preOrderPrice: foodData.preOrderPrice || 0,
//                           basePrice: foodData.basePrice || 0,
//                         };

//                   const productOffer = getProductOffer(foodData);
//                   const hasOfferInCart = isOfferAlreadyAppliedInCart();
//                   const showOfferPrice = productOffer && !hasOfferInCart;

//                   const eff = getEffectivePrice(
//                     foodData,
//                     matchedLocation,
//                     foodData?.session,
//                     true,
//                   );
                  
//                   const currentPrice = showOfferPrice && productOffer?.price 
//                     ? productOffer.price 
//                     : eff.price;
//                   const originalPrice = eff.price;
//                   const stockCount = matchedLocation?.Remainingstock || 0;

//                   return (
//                     <>
//                       <div className="pricing-section">
//                         <div className="pricing-display">
//                           <span className="current-price">₹{currentPrice}</span>
//                           {showOfferPrice && (
//                             <span
//                               className="original-price"
//                               style={{ marginLeft: "10px" }}
//                             >
//                               ₹{originalPrice}
//                             </span>
//                           )}
//                         </div>
//                         <div className="availability-banner">
//                           {stockCount > 0 ? (
//                             <>
//                               {showOfferPrice && (
//                                 <BiSolidOffer
//                                   color="green"
//                                   style={{ marginRight: "5px" }}
//                                 />
//                               )}
//                             </>
//                           ) : (
//                             "Sold Out"
//                           )}
//                         </div>
//                       </div>

//                       {getCartQuantity(foodData?._id) > 0 ? (
//                         <div className="increaseBtn">
//                           <div
//                             className="faplus"
//                             onClick={() => {
//                               if (!(user && !address))
//                                 decreaseQuantity(
//                                   foodData?._id,
//                                   productOffer,
//                                   matchedLocation,
//                                 );
//                             }}
//                             style={{
//                               opacity: user && !address ? 0.5 : 1,
//                               pointerEvents: user && !address ? "none" : "auto",
//                             }}
//                           >
//                             <FaMinus />
//                           </div>
//                           <div className="faQuantity">
//                             {getCartQuantity(foodData?._id)}
//                           </div>
//                           <div
//                             className="faplus"
//                             onClick={() => {
//                               if (!(user && !address))
//                                 increaseQuantity(
//                                   foodData?._id,
//                                   productOffer,
//                                   foodData,
//                                   matchedLocation,
//                                 );
//                             }}
//                             style={{
//                               opacity: user && !address ? 0.5 : 1,
//                               pointerEvents: user && !address ? "none" : "auto",
//                             }}
//                           >
//                             <FaPlus />
//                           </div>
//                         </div>
//                       ) : stockCount > 0 && gifUrl !== "Closed.gif" ? (
//                         <button
//                           className="add-to-cart-btn"
//                           onClick={() => addCart1(foodData, productOffer, matchedLocation)}
//                           disabled={user && !address}
//                           style={{ opacity: user && !address ? 0.5 : 1 }}
//                         >
//                           <span className="add-to-cart-btn-text">Add</span>
//                           <span className="add-to-cart-btn-icon">
//                             <FaPlus />
//                           </span>
//                         </button>
//                       ) : (
//                         <button
//                           className={
//                             gifUrl === "Closed.gif"
//                               ? "add-to-cart-btn-disabled"
//                               : "sold-out-btn"
//                           }
//                           disabled
//                         >
//                           <span className="add-to-cart-btn-text">
//                             {gifUrl === "Closed.gif" ? "Closed" : "Sold Out"}
//                           </span>
//                         </button>
//                       )}
//                     </>
//                   );
//                 })()}
//               </div>
//             </div>
//           </div>
//         </Drawer>
//       </div>

//       <div style={{ marginBottom: "80px" }}>
//         <Footer />
//       </div>

//       <BottomNav />
//     </div>
//   );
// };

// const TabsComponent = ({ tabs, activeTab, onTabClick }) => {
//   return (
//     <div className="tabs-container2">
//       <div className="tabs-scroll-container">
//         <div className="tabs-scroll">
//           {tabs.map((tab) => (
//             <button
//               key={tab}
//               className={`tab-button ${activeTab === tab ? "active" : ""}`}
//               onClick={() => onTabClick(tab)}
//             >
//               <span className="tab-button-text">{tab}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//       <style jsx>{`
//         .tabs-container2 {
//           background-color: ${Colors.creamWalls};
//           border-bottom-left-radius: 16px;
//           border-bottom-right-radius: 16px;
//           position: relative;
//           border-bottom: 2px solid #fff;
//           box-shadow:
//             0 1px 3px rgba(0, 0, 0, 0.1),
//             0 2px 6px rgba(0, 0, 0, 0.05);
//         }
//         .tabs-scroll-container {
//           overflow-x: auto;
//           -webkit-overflow-scrolling: touch;
//           scrollbar-width: none;
//         }
//         .tabs-scroll-container::-webkit-scrollbar {
//           display: none;
//         }
//         .tabs-scroll {
//           display: inline-flex;
//           min-width: 100%;
//           gap: 10px;
//           padding: 0 4px;
//         }
//         .tab-button {
//           display: inline-flex;
//           justify-content: center;
//           align-items: center;
//           padding: 8px 24px;
//           border-radius: 20px;
//           border: none;
//           background: transparent;
//           cursor: pointer;
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//           white-space: nowrap;
//           flex-shrink: 0;
//           min-height: 25px;
//         }
//         .tab-button:hover {
//           background-color: ${Colors.warmbeige}40;
//           transform: translateY(-1px);
//         }
//         .tab-button.active {
//           background-color: ${Colors.greenCardamom};
//           padding: 4px 8px;
//           box-shadow: 0 2px 8px ${Colors.greenCardamom}80;
//           width: auto;
//           height: auto;
//           border-radius: 20px;
//         }
//         .tab-button.active:hover {
//           background-color: ${Colors.greenCardamom}E6;
//           transform: translateY(-1px) scale(1.02);
//         }
//         .tab-button-text {
//           font-family: "Inter", sans-serif;
//           fontsize: 14px;
//           font-weight: 400;
//           line-height: 18px;
//           letter-spacing: -0.7px;
//           color: ${Colors.primaryText};
//           transition: all 0.3s ease;
//         }
//         .tab-button.active .tab-button-text {
//           font-family: "Inter", sans-serif;
//           fontsize: 16px;
//           font-weight: 900;
//           line-height: 21px;
//           letter-spacing: -0.8px;
//           color: ${Colors.appForeground};
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Home;  






































// import {
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   useRef,
//   useCallback,
// } from "react";
// import { Container } from "react-bootstrap";
// import { FaEye, FaEyeSlash, FaLock, FaUser, FaAngleUp } from "react-icons/fa";
// import { Button, Form, InputGroup, Modal } from "react-bootstrap";
// import { FaPlus, FaMinus, FaSquareWhatsapp } from "react-icons/fa6";
// import "../Styles/Home.css";
// import Banner from "./Banner";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Drawer } from "antd";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import CoinBalance from "./CoinBalance";
// import { WalletContext } from "../WalletContext";
// import RatingModal from "./RatingModal";
// import { BiSolidOffer } from "react-icons/bi";
// import Swal2 from "sweetalert2";
// import moment from "moment";
// import IsVeg from "../assets/isVeg=yes.svg";
// import IsNonVeg from "../assets/isVeg=no.svg";
// import MultiCartDrawer from "./MultiCartDrawer";
// import DateSessionSelector from "./DateSessionSelector";
// import chef from "./../assets/chef_3.png";
// import { Colors, FontFamily } from "../Helper/themes";
// import BottomNav from "./BottomNav";
// import LocationRequiredPopup from "./LocationRequiredPopup";
// import { MdAddLocationAlt } from "react-icons/md";
// import availabity from "./../assets/weui_done2-filled.png";
// import Footer from "./Footer";

// const Home = ({ selectArea, setSelectArea, Carts, setCarts }) => {
//   // Store user in state to avoid infinite render loop
//   const [user, setUser] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   });

//   // Listen for user changes in localStorage
//   useEffect(() => {
//     const handleStorage = (e) => {
//       if (e.key === "user") {
//         try {
//           setUser(JSON.parse(e.newValue));
//         } catch {
//           setUser(null);
//         }
//       }
//     };
//     window.addEventListener("storage", handleStorage);
//     return () => window.removeEventListener("storage", handleStorage);
//   }, []);

//   // Provide a function to update user state and localStorage together
//   const updateUser = (userObj) => {
//     setUser(userObj);
//     if (userObj) {
//       localStorage.setItem("user", JSON.stringify(userObj));
//     } else {
//       localStorage.removeItem("user");
//     }
//     window.dispatchEvent(new Event("userUpdated"));
//   };

//   const navigate = useNavigate();
//   const location = useLocation();

//   const { wallet, transactions, loading, walletSeting, getorderByCustomerId } =
//     useContext(WalletContext);

//   const [loader, setloader] = useState(false);
//   const [allHubMenuData, setAllHubMenuData] = useState([]);

//   // --- NEW STATE FOR FILTERS ---
//   const [isVegOnly, setIsVegOnly] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("");

//   const [address, setAddress] = useState(null);

//   // ============ NEW: Track if default hub menu should load ============
//   const [shouldLoadDefaultMenu, setShouldLoadDefaultMenu] = useState(!user);

//   // ============ NEW: Cutoff validation state ============
//   const [cutoffValidation, setCutoffValidation] = useState({
//     allowed: true,
//     message: "",
//     cutoffDateTime: null,
//     nextAvailableDateTime: null,
//   });
//   const [cutoffLoading, setCutoffLoading] = useState(false);

//   // State for offers
//   const [gifUrl, setGifUrl] = useState("");
//   const [message, setMessage] = useState("");
//   const [AllOffer, setAllOffer] = useState([]);
  
//   // NEW: Track which offer has been applied (only ONE offer per slot)
//   const [appliedOfferForSlot, setAppliedOfferForSlot] = useState(null);

//   // ============ getAllOffer function ============
//   const getAllOffer = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:7013/api/admin/offers",
//       );
//       if (response.status === 200 && response.data?.data) {
//         setAllOffer(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching offers:", error);
//       setAllOffer([]);
//     }
//   };

//    // Fetch total orders
//     const [totalOrder, setTotalOrder] = useState([]);
//     const getTotalOrder = async () => {
//       try {
//         let res = await axios.get("http://localhost:7013/api/admin/getallorders");
//         if (res.status === 200) {
//           setTotalOrder(res.data.order.reverse());
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     };
  
//     useEffect(() => {
//       getTotalOrder();
//     }, []);

//       const findNumberofOrders = () => {
//         const customerId = user?._id
//     return totalOrder.filter(
//       (customer) => customer?.customerId === customerId,
//     ).length;
//   };

//   console.log(findNumberofOrders(),"....................")

//   // Initial add 
//   // ============ Function to validate cutoff timing ============
//   const validateCutoffTiming = useCallback(
//     async (hubId, session, deliveryDate) => {
//       if (!hubId || !session) return true;

//       try {
//         setCutoffLoading(true);
//         const status = user?.status === "Employee" ? "Employee" : "Normal";

//         const response = await axios.post(
//           "http://localhost:7013/api/Hub/validate-order-timing",
//           {
//             hubId: hubId,
//             session: session.toLowerCase(),
//             status: status,
//             deliveryDate:
//               deliveryDate instanceof Date
//                 ? deliveryDate.toISOString()
//                 : deliveryDate,
//           },
//         );

//         if (response.status === 200) {
//           setCutoffValidation({
//             allowed: response.data.allowed,
//             message: response.data.message,
//             cutoffDateTime: response.data.cutoffDateTime,
//             nextAvailableDateTime: response.data.nextAvailableDateTime,
//           });
//           return response.data.allowed;
//         }
//         return true;
//       } catch (error) {
//         console.error("Error validating cutoff timing:", error);
//         return true;
//       } finally {
//         setCutoffLoading(false);
//       }
//     },
//     [user?.status],
//   );

//   // Function to get next available ordering time
//   const getNextAvailableTime = useCallback(
//     async (hubId, session) => {
//       if (!hubId || !session) return null;

//       try {
//         const status = user?.status === "Employee" ? "Employee" : "Normal";
//         const response = await axios.get(
//           `http://localhost:7013/api/Hub/next-available-time/${hubId}/${session.toLowerCase()}/${status}`,
//         );

//         if (response.status === 200) {
//           return response.data;
//         }
//         return null;
//       } catch (error) {
//         console.error("Error getting next available time:", error);
//         return null;
//       }
//     },
//     [user?.status],
//   );

//   // --- DATE & SESSION STATE ---
//   const getNormalizedToday = () => {
//     const now = new Date();
//     return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
//   };

//   const [selectedDate, setSelectedDate] = useState(() => {
//     if (location.state?.targetDate) return new Date(location.state.targetDate);
//     return getNormalizedToday();
//   });

//   const [selectedSession, setSelectedSession] = useState(() => {
//     if (location.state?.targetSession) return location.state.targetSession;
//     return "Lunch";
//   });

//   // ============ Check cutoff when date/session or hub changes ============
//   useEffect(() => {
//     const checkCutoff = async () => {
//       const currentAddress =
//         address ||
//         (() => {
//           try {
//             const primaryAddress = localStorage.getItem("primaryAddress");
//             const currentLocation = localStorage.getItem("currentLocation");
//             return primaryAddress
//               ? JSON.parse(primaryAddress)
//               : currentLocation
//                 ? JSON.parse(currentLocation)
//                 : null;
//           } catch {
//             return null;
//           }
//         })();

//       if (currentAddress?.hubId && selectedDate && selectedSession) {
//         const isAllowed = await validateCutoffTiming(
//           currentAddress.hubId,
//           selectedSession,
//           selectedDate,
//         );

//         if (!isAllowed) {
//           console.log(
//             "Order not allowed for this slot:",
//             cutoffValidation.message,
//           );
//         }
//       }
//     };

//     checkCutoff();
//   }, [address, selectedDate, selectedSession, validateCutoffTiming]);

//   // Add a function to refresh address from localStorage
//   const refreshAddress = useCallback(() => {
//     try {
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const currentLocation = localStorage.getItem("currentLocation");
//       const defaultHubData = localStorage.getItem("defaultHubData");

//       if (primaryAddress && primaryAddress !== "null") {
//         const parsedPrimary = JSON.parse(primaryAddress);
//         setAddress(parsedPrimary);
//         setShouldLoadDefaultMenu(false);
//       } else if (currentLocation && currentLocation !== "null") {
//         const parsedCurrent = JSON.parse(currentLocation);
//         setAddress(parsedCurrent);
//         setShouldLoadDefaultMenu(false);
//       } else if (defaultHubData && defaultHubData !== "null") {
//         try {
//           const parsedDefault = JSON.parse(defaultHubData);
//           const defaultAddress = {
//             hubId:
//               parsedDefault.hubId ||
//               parsedDefault._id ||
//               "69613cb1145c1aaedd9859cd",
//             hubName: parsedDefault.hubName || parsedDefault.name || "Default Hub",
//             fullAddress:
//               parsedDefault.address || "Select your location to view menu",
//             isDefaultHub: true,
//             location: parsedDefault.location || {
//               type: "Point",
//               coordinates: [0, 0],
//             },
//           };
//           setAddress(defaultAddress);
//           setShouldLoadDefaultMenu(false);
//           localStorage.setItem(
//             "currentLocation",
//             JSON.stringify(defaultAddress),
//           );
//         } catch (e) {
//           console.error("Error parsing default hub data:", e);
//           setAddress(null);
//           setShouldLoadDefaultMenu(!user);
//         }
//       } else {
//         setAddress(null);
//         setShouldLoadDefaultMenu(!user);
//       }
//     } catch (error) {
//       console.error("Error refreshing address:", error);
//       setAddress(null);
//       setShouldLoadDefaultMenu(!user);
//     }
//   }, [user]);

//   // Listen for location updates from Banner
//   useEffect(() => {
//     const handleLocationUpdated = () => {
//       refreshAddress();
//     };

//     const handleAddressUpdated = () => {
//       refreshAddress();
//     };

//     const handleAddressAdded = () => {
//       refreshAddress();
//     };

//     const handleFocus = () => {
//       refreshAddress();
//     };

//     const handleDefaultHubLoaded = () => {
//       refreshAddress();
//     };

//     window.addEventListener("locationUpdated", handleLocationUpdated);
//     window.addEventListener("addressUpdated", handleAddressUpdated);
//     window.addEventListener("addressAdded", handleAddressAdded);
//     window.addEventListener("focus", handleFocus);
//     window.addEventListener("defaultHubLoaded", handleDefaultHubLoaded);

//     const handleStorageChange = (e) => {
//       if (
//         e.key === "currentLocation" ||
//         e.key === "primaryAddress" ||
//         e.key === "defaultHubData"
//       ) {
//         refreshAddress();
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);

//     const intervalId = setInterval(() => {
//       refreshAddress();
//     }, 2000);

//     return () => {
//       window.removeEventListener("locationUpdated", handleLocationUpdated);
//       window.removeEventListener("addressUpdated", handleAddressUpdated);
//       window.removeEventListener("addressAdded", handleAddressAdded);
//       window.removeEventListener("focus", handleFocus);
//       window.removeEventListener("defaultHubLoaded", handleDefaultHubLoaded);
//       window.removeEventListener("storage", handleStorageChange);
//       clearInterval(intervalId);
//     };
//   }, [refreshAddress]);

//   // State for location popup
//   const [showLocationPopup, setShowLocationPopup] = useState(false);

//   // Update handleSelectionChange to reset selectedCategory
//   const handleSelectionChange = (date1, session1) => {
//     setSelectedDate(date1);
//     setSelectedSession(session1);
//     setSelectedCategory("");
//     // Reset applied offer when changing slot
//     setAppliedOfferForSlot(null);
//     window.scrollTo(0, 0);
//   };

//   // Check if user is logged in but has no address selected
//   useEffect(() => {
//     if (user && !address) {
//       const timer = setTimeout(() => {
//         setShowLocationPopup(true);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [user, address]);

//   // Add location detection for users coming from splash screen
//   useEffect(() => {
//     const checkLocationPermission = async () => {
//       const currentLocation = localStorage.getItem("currentLocation");
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const defaultHubData = localStorage.getItem("defaultHubData");

//       if (currentLocation || primaryAddress || defaultHubData || address) {
//         return;
//       }

//       if (navigator.geolocation && navigator.permissions) {
//         try {
//           const permission = await navigator.permissions.query({
//             name: "geolocation",
//           });
//         } catch (error) {
//           console.error("Permissions API error:", error);
//         }
//       }
//     };

//     const timer = setTimeout(checkLocationPermission, 500);
//     return () => clearTimeout(timer);
//   }, []);

//   // --- 1. FETCH DATA (Only when Hub Changes) ---
//   useEffect(() => {
//     const hubIdToUse =
//       address?.hubId ||
//       (shouldLoadDefaultMenu && !user ? "69613cb1145c1aaedd9859cd" : null);

//     if (!hubIdToUse) {
//       setAllHubMenuData([]);
//       setloader(false);
//       return;
//     }

//     const fetchAllMenuData = async () => {
//       setloader(true);
//       try {
//         const res = await axios.get(
//           "http://localhost:7013/api/user/get-hub-menu",
//           {
//             params: { hubId: hubIdToUse },
//           },
//         );

//         if (res.status === 200) {
//           setAllHubMenuData(res.data.menu);
//         } else {
//           setAllHubMenuData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching menu:", error);
//         setAllHubMenuData([]);
//       } finally {
//         setloader(false);
//       }
//     };

//     fetchAllMenuData();
//   }, [address?.hubId, shouldLoadDefaultMenu, user]);

//   const handleLocationDetected = useCallback((newLocation) => {
//     setAddress(newLocation);
//     setShouldLoadDefaultMenu(false);

//     if (newLocation) {
//       localStorage.setItem("currentLocation", JSON.stringify(newLocation));
//     }

//     window.dispatchEvent(new Event("locationUpdated"));
//   }, []);

//   // --- 2. CORE FILTERING LOGIC ---
//   const currentSlotItems = useMemo(() => {
//     if (!allHubMenuData?.length) return [];
//     const selectedDateISO = selectedDate.toISOString();

//     return allHubMenuData.filter(
//       (item) =>
//         item.deliveryDate === selectedDateISO &&
//         item.session === selectedSession,
//     );
//   }, [allHubMenuData, selectedDate, selectedSession]);

//   const vegFilteredItems = useMemo(() => {
//     if (isVegOnly) {
//       return currentSlotItems.filter((item) => item.foodcategory === "Veg");
//     }
//     return currentSlotItems;
//   }, [currentSlotItems, isVegOnly]);

//   const dynamicTabs = useMemo(() => {
//     const categories = new Set(
//       vegFilteredItems.map((item) => item.menuCategory),
//     );
//     const uniqueCats = [...categories].filter(Boolean).sort();
//     return uniqueCats;
//   }, [vegFilteredItems]);

//   useEffect(() => {
//     if (dynamicTabs.length > 0 && !selectedCategory) {
//       setSelectedCategory(dynamicTabs[0]);
//     } else if (
//       dynamicTabs.length > 0 &&
//       !dynamicTabs.includes(selectedCategory)
//     ) {
//       setSelectedCategory(dynamicTabs[0]);
//     }
//   }, [dynamicTabs, selectedCategory]);

//   const finalDisplayItems = useMemo(() => {
//     if (!selectedCategory) return [];
//     return vegFilteredItems.filter(
//       (item) => item.menuCategory === selectedCategory,
//     );
//   }, [vegFilteredItems, selectedCategory]);

//   const isSameDay = (d1, d2) => {
//     const a = new Date(d1);
//     const b = new Date(d2);
//     a.setHours(0, 0, 0, 0);
//     b.setHours(0, 0, 0, 0);
//     return a.getTime() === b.getTime();
//   };

//   // ============ Check cutoff using validation result ============
//   const isBeforeCutoff = (deliveryDate, session) => {
//     if (!deliveryDate || !session) return false;

//     // Use the cutoff validation result from API
//     if (!cutoffValidation.allowed) {
//       return false;
//     }

//     const now = new Date();
//     const delivery = new Date(deliveryDate);
//     delivery.setHours(0, 0, 0, 0);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Future dates are always allowed
//     if (delivery.getTime() > today.getTime()) return true;

//     // Past dates are not allowed
//     if (delivery.getTime() < today.getTime()) return false;

//     // For today, use the API validation result
//     return cutoffValidation.allowed;
//   };

//   // Helper: always use preorder price if available and before cutoff
//   const getEffectivePrice = (item, matchedLocation, session) => {
//     const hubPrice =
//       (matchedLocation &&
//         (matchedLocation.hubPrice || matchedLocation.basePrice)) ||
//       item?.hubPrice ||
//       item?.basePrice ||
//       0;
//     const preOrderPrice =
//       (matchedLocation &&
//         (matchedLocation.preOrderPrice || matchedLocation.preorderPrice)) ||
//       item?.preOrderPrice ||
//       item?.preorderPrice ||
//       0;
//     const beforeCutoff = isBeforeCutoff(
//       item?.deliveryDate || item?.deliveryDateISO,
//       session,
//     );
//     if (beforeCutoff && preOrderPrice > 0) return { price: preOrderPrice };
//     return { price: hubPrice };
//   };

//   const [cartCount, setCartCount] = useState(0);
//   const [isCartVisible, setIsCartVisible] = useState(false);

//   const handleShow = () => {
//     setCartCount(cartCount + 1);
//     setIsCartVisible(true);
//   };

//   const [foodData, setFoodData] = useState({});
//   const [open, setOpen] = useState(false);

//   const showDrawer = (food) => {
//     setFoodData(food);
//     setOpen(true);
//   };
//   const onClose = () => {
//     setOpen(false);
//   };

//   useEffect(() => {
//     if (open) {
//       document.body.classList.add("drawer-open");
//     } else {
//       document.body.classList.remove("drawer-open");
//     }
//     return () => {
//       document.body.classList.remove("drawer-open");
//     };
//   }, [open]);

//   const [show4, setShow4] = useState(false);
//   const handleClose4 = () => setShow4(false);
//   const [show3, setShow3] = useState(false);
//   const handleClose3 = () => setShow3(false);
//   const [show2, setShow2] = useState(false);
//   const handleClose2 = () => setShow2(false);
//   const handleShow2 = () => setShow2(true);

//   useEffect(() => {
//     refreshAddress();
//   }, [user]);

//   // ============ Helper function to check if any offer is already applied in cart ============
//   const isOfferAlreadyAppliedInCart = () => {
//     return Carts.some(item => item.offerProduct === true && item.offerApplied === true);
//   };

//   // ============ Helper function to get the applied offer details ============
//   const getAppliedOfferFromCart = () => {
//     return Carts.find(item => item.offerProduct === true && item.offerApplied === true);
//   };

// // ============ Add to cart with FIRST OFFER ONLY logic (UPDATED) ============
// const addCart1 = async (item, offerData, matchedLocation) => {
//   // Check cutoff before adding to cart
//   if (!cutoffValidation.allowed) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title:
//         cutoffValidation.message ||
//         `Cannot add to cart. Orders are closed for ${selectedSession}.`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   if (!matchedLocation || matchedLocation?.Remainingstock === 0) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Product is out of stock`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   const eff = getEffectivePrice(item, matchedLocation, selectedSession);
  
//   // CRITICAL LOGIC: Check if any offer is already applied in cart for this slot
//   const hasOfferInCart = isOfferAlreadyAppliedInCart();
//   const appliedOffer = getAppliedOfferFromCart();
  
//   // Get regular price (base price without any offer)
//   const regularPrice = matchedLocation?.hubPrice || item?.hubPrice || matchedLocation?.basePrice || item?.basePrice || 115;
//   const offerPriceValue = offerData?.price || null;
  
//   let appliedPrice;
//   let isOfferApplied = false;
//   let finalOfferPrice = null;
//   let finalRegularPrice = regularPrice;
  
//   // If this product has an offer available
//   if (offerData && offerData.price) {
//     // If NO offer has been applied yet in cart, apply this offer (FIRST OFFER WINS)
//     if (!hasOfferInCart) {
//       appliedPrice = offerData.price;
//       isOfferApplied = true;
//       finalOfferPrice = offerData.price;
//       console.log(`FIRST OFFER APPLIED: ${item.foodname} at ₹${offerData.price}`);
//     } 
//     // If an offer is already applied in cart, this product gets regular price (SECOND OFFER DOESN'T APPLY)
//     else {
//       appliedPrice = regularPrice;
//       isOfferApplied = false;
//       console.log(`SECOND OFFER REJECTED: ${item.foodname} at regular price ₹${regularPrice} (Offer already applied to ${appliedOffer?.foodname})`);
      
//       // Show toast notification that only one offer per slot is allowed
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Only one offer per slot allowed! ${appliedOffer?.foodname} already has the offer.`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   } else {
//     // No offer available for this product
//     appliedPrice = regularPrice;
//   }

//   const slotKey = `${selectedDate.toISOString()}|${selectedSession}`;
  
//   const newCartItem = {
//     deliveryDate: new Date(selectedDate).toISOString(),
//     session: selectedSession,
//     slotKey: slotKey,
//     foodItemId: item?._id,
//     price: appliedPrice,
//     totalPrice: appliedPrice,
//     image: item?.Foodgallery[0]?.image2,
//     unit: item?.unit,
//     foodname: item?.foodname,
//     quantity: item?.quantity,
//     Quantity: 1,
//     gst: item?.gst,
//     discount: item?.discount,
//     foodcategory: item?.foodcategory,
//     remainingstock: matchedLocation?.Remainingstock,
//     offerProduct: !!offerData,
//     offerApplied: isOfferApplied, // Track if this item actually got the offer price
//     offerPrice: finalOfferPrice,
//     regularPrice: finalRegularPrice,
//     minCart: offerData?.minCart || 0,
//     actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//     offerQ: 1,
//     basePrice: matchedLocation?.basePrice || item?.basePrice || 0,
//     hubPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//     preOrderPrice: matchedLocation?.preOrderPrice || item?.preOrderPrice || 0,
//   };

//   const cart = JSON.parse(localStorage.getItem("cart"));
//   const cartArray = Array.isArray(cart) ? cart : [];

//   const itemIndex = cartArray.findIndex(
//     (cartItem) =>
//       cartItem?.foodItemId === newCartItem?.foodItemId &&
//       cartItem.deliveryDate === newCartItem.deliveryDate &&
//       cartItem.session === newCartItem.session,
//   );

//   if (itemIndex === -1) {
//     cartArray.push(newCartItem);
//     localStorage.setItem("cart", JSON.stringify(cartArray));
//     setCarts(cartArray);
//     handleShow();
//   } else {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Item is already in this slot's cart`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   }
// };

//   const [cart, setCart] = useState([]);

//   useEffect(() => {
//     const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
//     setCart(storedCart);

//     const addonedCarts = async () => {
//       try {
//         await axios.post("http://localhost:7013/api/cart/addCart", {
//           userId: user?._id,
//           items: storedCart,
//           lastUpdated: Date.now,
//           username: user?.Fname,
//           mobile: user?.Mobile,
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     if (Carts && Carts.length > 0 && user?._id) {
//       addonedCarts();
//     }
//   }, [JSON.stringify(Carts), user?._id]);

//   const updateCartData = (updatedCart) => {
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//     setCart(updatedCart);
//     setCarts(updatedCart);
//   };


// // ============ Increase quantity with offer logic (FIXED) ============
// const increaseQuantity = (foodItemId, offerData, item, matchedLocation) => {
//   const maxStock = matchedLocation?.Remainingstock || 0;
//   const selectedDateISO = selectedDate.toISOString();
  
//   // Find the existing cart item
//   const existingItem = Carts.find(
//     (cartItem) =>
//       cartItem.foodItemId === foodItemId &&
//       cartItem.deliveryDate === selectedDateISO &&
//       cartItem.session === selectedSession
//   );
  
//   if (!existingItem) return;
  
//   // Check if this item got the offer price (first item in cart with offer)
//   const gotOfferPrice = existingItem.offerApplied === true;
//   const regularPrice = existingItem.regularPrice || existingItem.hubPrice || matchedLocation?.hubPrice || 115;
//   const offerPriceValue = existingItem.offerPrice;
  
//   // Calculate price for new quantity
//   let newPricePerUnit;
//   let newTotalPrice;
//   const currentQuantity = existingItem.Quantity;
//   const newQuantity = currentQuantity + 1;
  
//   if (gotOfferPrice) {
//     // This product got the offer price (it's the first offer item in cart)
//     if (currentQuantity === 1 && newQuantity === 2) {
//       // Adding second item: first at offer price, second at regular price
//       // Total = offerPrice + regularPrice, average price changes
//       newPricePerUnit = regularPrice; // Display price per unit becomes regular for UI
//       newTotalPrice = offerPriceValue + regularPrice;
//     } else if (currentQuantity >= 2) {
//       // Already have offer + regular items, adding another regular item
//       newPricePerUnit = regularPrice;
//       newTotalPrice = existingItem.totalPrice + regularPrice;
//     } else {
//       // Should not happen, but fallback
//       newPricePerUnit = regularPrice;
//       newTotalPrice = offerPriceValue + (regularPrice * (newQuantity - 1));
//     }
//   } else {
//     // No offer applied to this product, all at regular price
//     newPricePerUnit = regularPrice;
//     newTotalPrice = regularPrice * newQuantity;
//   }
  
//   if (newQuantity <= maxStock) {
//     const updatedCart = Carts.map((cartItem) => {
//       if (
//         cartItem.foodItemId === foodItemId &&
//         cartItem.deliveryDate === selectedDateISO &&
//         cartItem.session === selectedSession
//       ) {
//         return {
//           ...cartItem,
//           Quantity: newQuantity,
//           price: newPricePerUnit,
//           totalPrice: newTotalPrice,
//         };
//       }
//       return cartItem;
//     });
    
//     updateCartData(updatedCart);
//   } else {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `No more stock available!`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   }
// };

//   const [show, setShow] = useState(true);
//   const [expiryDays, setExpiryDays] = useState(0);

// // ============ Decrease quantity with offer logic (FIXED) ============
// const decreaseQuantity = (foodItemId, offerData, matchedLocation) => {
//   const selectedDateISO = selectedDate.toISOString();
  
//   const existingItem = Carts.find(
//     (cartItem) =>
//       cartItem.foodItemId === foodItemId &&
//       cartItem.deliveryDate === selectedDateISO &&
//       cartItem.session === selectedSession
//   );
  
//   if (!existingItem) return;
  
//   const gotOfferPrice = existingItem.offerApplied === true;
//   const regularPrice = existingItem.regularPrice || existingItem.hubPrice || matchedLocation?.hubPrice || 115;
//   const offerPriceValue = existingItem.offerPrice;
//   const currentQuantity = existingItem.Quantity;
//   const newQuantity = currentQuantity - 1;
  
//   if (newQuantity === 0) {
//     // Remove item completely
//     const updatedCart = Carts.filter(
//       (item) =>
//         !(item.foodItemId === foodItemId &&
//           item.deliveryDate === selectedDateISO &&
//           item.session === selectedSession)
//     );
//     updateCartData(updatedCart);
//     return;
//   }
  
//   let newPricePerUnit;
//   let newTotalPrice;
  
//   if (gotOfferPrice) {
//     if (newQuantity === 1) {
//       // Going back to just the offer item
//       newPricePerUnit = offerPriceValue;
//       newTotalPrice = offerPriceValue;
//     } else if (newQuantity > 1) {
//       // Still have offer + regular items
//       // Total = offerPrice + (regularPrice * (newQuantity - 1))
//       newPricePerUnit = regularPrice;
//       newTotalPrice = offerPriceValue + (regularPrice * (newQuantity - 1));
//     } else {
//       newPricePerUnit = regularPrice;
//       newTotalPrice = regularPrice * newQuantity;
//     }
//   } else {
//     // No offer, all regular
//     newPricePerUnit = regularPrice;
//     newTotalPrice = regularPrice * newQuantity;
//   }
  
//   const updatedCart = Carts.map((cartItem) => {
//     if (
//       cartItem.foodItemId === foodItemId &&
//       cartItem.deliveryDate === selectedDateISO &&
//       cartItem.session === selectedSession
//     ) {
//       return {
//         ...cartItem,
//         Quantity: newQuantity,
//         price: newPricePerUnit,
//         totalPrice: newTotalPrice,
//       };
//     }
//     return cartItem;
//   });
  
//   updateCartData(updatedCart);
// };

//   const isAddressReady = () => {
//     const addresstype1 = localStorage.getItem("addresstype");
//     if (!addresstype1) return false;

//     const addressKey =
//       addresstype1 === "apartment" ? "address" : "coporateaddress";
//     const addressRaw = localStorage.getItem(addressKey);

//     if (!addressRaw) return false;

//     try {
//       const address1 = JSON.parse(addressRaw);
//       if (!address1) return false;

//       const apartmentname =
//         address1?.apartmentname || address1?.Apartmentname || "";
//       const addressField = address1?.Address || address1?.address || "";
//       const pincode = address1?.pincode || "";

//       return apartmentname && addressField && pincode;
//     } catch (error) {
//       return false;
//     }
//   };

//   // This useEffect now calls getAllOffer which is defined above
//   useEffect(() => {
//     if (Carts?.length > 0) {
//       handleShow();
//     }
//     if (user?._id) {
//       getAllOffer();
//     }
//   }, [user?._id]);

//   const groupedCarts = useMemo(() => {
//     if (!Carts || Carts.length === 0) return [];
//     const groups = Carts.reduce((acc, item) => {
//       const key = `${item.deliveryDate}|${item.session}`;

//       if (!item.deliveryDate || !item.session) return acc;

//       if (!acc[key]) {
//         acc[key] = {
//           session: item.session,
//           date: new Date(item.deliveryDate),
//           totalItems: 0,
//           subtotal: 0,
//           items: [],
//         };
//       }

//       acc[key].totalItems += item.Quantity;
//       acc[key].subtotal += item.price * item.Quantity;
//       acc[key].items.push(item);

//       return acc;
//     }, {});

//     return Object.values(groups).sort((a, b) => a.date - b.date);
//   }, [Carts]);

//   const overallTotalItems = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.totalItems, 0);
//   }, [groupedCarts]);

//   const overallSubtotal = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.subtotal, 0);
//   }, [groupedCarts]);

//   const [deliveryCharge, setDeliveryCharge] = useState([]);
//   const [filteredRates, setFilteredRates] = useState([]);

//   const getDeliveryRates = async () => {
//     try {
//       const res = await axios.get("http://localhost:7013/api/deliveryrate/all");
//       setDeliveryCharge(res.data.data);
//       setFilteredRates(res.data.data);
//     } catch (error) {
//       console.error("Error fetching delivery rates:", error);
//     }
//   };

//   const findDeliveryRate = (hubId, acquisitionChannel, status) => {
//     if (!deliveryCharge || deliveryCharge.length === 0) {
//       return 15;
//     }

//     const matchedRate = deliveryCharge.find(
//       (rate) =>
//         rate.hubId === hubId &&
//         rate.acquisition_channel === acquisitionChannel &&
//         rate.status === status,
//     );

//     return matchedRate?.deliveryRate || 15;
//   };

//   const isEmployeeForDelivery = user?.status === "Employee";
//   const acquisitionChannelForDelivery = isEmployeeForDelivery
//     ? "employee"
//     : user?.acquisition_channel || "organic";
//   const userStatus = user?.status;
//   const hubId = address?.hubId;
//   const deliveryRate = findDeliveryRate(
//     hubId,
//     acquisitionChannelForDelivery,
//     userStatus,
//   );

// //   const proceedToPlan = async () => {
// //     if (!user) {
// //       Swal2.fire({
// //         toast: true,
// //         position: "bottom",
// //         icon: "info",
// //         title: `Please Login!`,
// //         showConfirmButton: false,
// //         timer: 3000,
// //         timerProgressBar: true,
// //         customClass: {
// //           popup: "me-small-toast",
// //           title: "me-small-toast-title",
// //         },
// //       });
// //       return;
// //     }
// //     if (Carts.length === 0) {
// //       return;
// //     }

// //     if (!address) {
// //       Swal2.fire({
// //         toast: true,
// //         position: "bottom",
// //         icon: "info",
// //         title: `Please Select Address!`,
// //         showConfirmButton: false,
// //         timer: 3000,
// //         timerProgressBar: true,
// //         customClass: {
// //           popup: "me-small-toast",
// //           title: "me-small-toast-title",
// //         },
// //       });
// //       return;
// //     }

// //     setloader(true);
// //     try {
// //       const addressDetails = {
// //         addressId: address._id || "",
// //         addressline: `${address.fullAddress}`,
// //         addressType: address.addressType || "",
// //         coordinates: address.location?.coordinates || [0, 0],
// //         hubId: address.hubId || "",
// //         hubName: address.hubName || "",
// //         studentInformation: address.studentInformation,
// //         schoolName: address.schoolName || "",
// //         houseName: address.houseName || "",
// //         apartmentName: address.apartmentName || "",
// //         companyName: address.companyName || "",
// //         companyId: address.companyId || "",
// //         customerType: user.status || "",
// //       };

// //       const res = await axios.post(
// //         "http://localhost:7013/api/user/plan/add-to-plan",
// //         {
// //           userId: user._id,
// //           mobile: user.Mobile,
// //           username: user.Fname,
// //           companyId: user?.companyId || "",
// //           items: Carts,
// //           addressDetails: addressDetails,
// //           deliveryCharge: deliveryRate,
// //         },
// //       );

// //       if (res.status === 200) {
// //         localStorage.removeItem("cart");
// //         setCarts([]);
// //         navigate("/my-plan");
// //       }
// //     } catch (error) {
// //       console.error("❌ proceedToPlan - Error:", error);
// //     } finally {
// //       setloader(false);
// //     }
// //   };

// const proceedToPlan = async () => {
//   // 1. Check if user is logged in
//   if (!user) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Please Login!`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   // 2. Check if cart has items
//   if (Carts.length === 0) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Your cart is empty!`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   // 3. Check if address is selected
//   if (!address) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Please Select Address!`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   setloader(true);
  
//   try {
//     // 4. Prepare address details
//     const addressDetails = {
//       addressId: address._id || "",
//       addressline: `${address.fullAddress || address.address || ""}`,
//       addressType: address.addressType || "",
//       coordinates: address.location?.coordinates || [0, 0],
//       hubId: address.hubId || "",
//       hubName: address.hubName || address.name || "",
//       studentInformation: address.studentInformation || null,
//       schoolName: address.schoolName || "",
//       houseName: address.houseName || "",
//       apartmentName: address.apartmentName || address.apartmentname || "",
//       companyName: address.companyName || "",
//       companyId: address.companyId || user?.companyId || "",
//       customerType: user?.status || "Normal",
//     };

//     // 5. Transform cart items with OFFER PRESERVATION
//     const itemsWithOfferInfo = Carts.map((item) => {
//       // Get the base values
//       const quantity = item.Quantity || 1;
//       const basePrice = item.basePrice || 0;
//       const hubPrice = item.hubPrice || item.actualPrice || 0;
//       const preOrderPrice = item.preOrderPrice || 0;
      
//       // OFFER FIELDS - Preserve from cart
//       const offerProduct = item.offerProduct || false;
//       const offerApplied = item.offerApplied || false;
//       const offerPrice = item.offerPrice || null;
//       const regularPrice = item.regularPrice || hubPrice;
      
//       // The price per unit (after offer calculation)
//       const pricePerUnit = item.price || (offerApplied && offerPrice ? regularPrice : hubPrice);
      
//       // The total price for all quantities (already calculated with offer logic in cart)
//       const totalPrice = item.totalPrice || (pricePerUnit * quantity);

//       return {
//         // Basic item info
//         foodItemId: item.foodItemId,
//         foodname: item.foodname,
//         image: item.image || "",
//         foodcategory: item.foodcategory || "",
//         unit: item.unit || "portion",
//         gst: item.gst || 0,
//         discount: item.discount || 0,
        
//         // Slot info
//         deliveryDate: item.deliveryDate,
//         session: item.session,
//         slotKey: item.slotKey || `${item.deliveryDate}|${item.session}`,
        
//         // Quantity
//         Quantity: quantity,
//         remainingstock: item.remainingstock || 0,
        
//         // Pricing - Base
//         basePrice: basePrice,
//         actualPrice: item.actualPrice || hubPrice,
//         hubPrice: hubPrice,
//         preOrderPrice: preOrderPrice,
        
//         // OFFER FIELDS - Critical for preserving offer logic in backend
//         offerProduct: offerProduct,
//         offerApplied: offerApplied,
//         offerPrice: offerPrice,
//         regularPrice: regularPrice,
        
//         // Calculated prices
//         price: pricePerUnit,           // Per unit price after offer
//         totalPrice: totalPrice,         // Total for all quantities
        
//         // Additional offer info
//         minCart: item.minCart || 0,
//         offerQ: item.offerQ || 1,
//       };
//     });

//     // 6. Log for debugging (optional)
//     console.log("📦 Proceeding to Plan with items:", itemsWithOfferInfo);
//     console.log("📍 Address Details:", addressDetails);
    
//     // Count items with offers applied
//     const offerItemsCount = itemsWithOfferInfo.filter(item => item.offerApplied).length;
//     if (offerItemsCount > 0) {
//       console.log(`🎁 ${offerItemsCount} item(s) with offer applied being sent to backend`);
//     }

//     // 7. Get delivery rate
//     const isEmployeeForDelivery = user?.status === "Employee";
//     const acquisitionChannelForDelivery = isEmployeeForDelivery
//       ? "employee"
//       : user?.acquisition_channel || "organic";
//     const userStatus = user?.status;
//     const hubId = address?.hubId;
    
//     const deliveryRate = findDeliveryRate(
//       hubId,
//       acquisitionChannelForDelivery,
//       userStatus,
//     );

//     // 8. Make API call to add to plan
//     const res = await axios.post(
//       "http://localhost:7013/api/user/plan/add-to-plan",
//       {
//         userId: user._id,
//         mobile: user.Mobile,
//         username: user.Fname,
//         companyId: user?.companyId || "",
//         items: itemsWithOfferInfo,
//         addressDetails: addressDetails,
//         deliveryCharge: deliveryRate,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // 9. Handle success
//     if (res.status === 200) {
//       console.log("✅ Items added to My Plan successfully");
      
//       // Clear cart from localStorage and state
//       localStorage.removeItem("cart");
//       setCarts([]);
//       setCart([]);
      
//       // Reset applied offer for slot
//       setAppliedOfferForSlot(null);
      
//       // Show success message
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "success",
//         title: `Items added to My Plan!`,
//         showConfirmButton: false,
//         timer: 2000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
      
//       // Navigate to My Plan page
//       navigate("/my-plan");
      
//       // Dispatch cart updated event
//       window.dispatchEvent(new Event("cart_updated"));
//     }
//   } catch (error) {
//     // 10. Handle errors
//     console.error("❌ proceedToPlan - Error:", error);
//     console.error("Error details:", error.response?.data || error.message);
    
//     let errorMessage = "Something went wrong. Please try again.";
    
//     if (error.response?.data?.error) {
//       errorMessage = error.response.data.error;
//     } else if (error.response?.data?.message) {
//       errorMessage = error.response.data.message;
//     } else if (error.message) {
//       errorMessage = error.message;
//     }
    
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "error",
//       title: errorMessage,
//       showConfirmButton: false,
//       timer: 4000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   } finally {
//     setloader(false);
//   }
// };

//   // Time check effect
//   useEffect(() => {
//     const checkTime = () => {
//       const now = new Date();
//       const currentTimeInMinutes = 10 * 60 + now.getMinutes();
//       const lunchStart = 7 * 60;
//       const lunchPrepStart = 9 * 60;
//       const lunchCookingStart = 11 * 60;
//       const lunchEnd = 14 * 60;

//       const dinnerStart = 14 * 60;
//       const dinnerPrepStart = 16 * 60 + 30;
//       const dinnerCookingStart = 18 * 60;
//       const dinnerEnd = 21 * 60;

//       const shopCloseTime = 21 * 60;

//       if (
//         currentTimeInMinutes >= lunchStart &&
//         currentTimeInMinutes < lunchPrepStart
//       ) {
//         setGifUrl("sourcing.gif");
//         setMessage(
//           "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= lunchPrepStart &&
//         currentTimeInMinutes < lunchCookingStart
//       ) {
//         setGifUrl("cuttingveg.gif");
//         setMessage(
//           "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= lunchCookingStart &&
//         currentTimeInMinutes < lunchEnd
//       ) {
//         setGifUrl("cookinggif.gif");
//         setMessage(
//           "Cooking your meal. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerStart &&
//         currentTimeInMinutes < dinnerPrepStart
//       ) {
//         setGifUrl("sourcing.gif");
//         setMessage(
//           "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerPrepStart &&
//         currentTimeInMinutes < dinnerCookingStart
//       ) {
//         setGifUrl("cuttingveg.gif");
//         setMessage(
//           "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (
//         currentTimeInMinutes >= dinnerCookingStart &&
//         currentTimeInMinutes <= dinnerEnd
//       ) {
//         setGifUrl("cookinggif.gif");
//         setMessage(
//           "Cooking your meal. Orders placed now will be delivered at your selected slot.",
//         );
//       } else if (currentTimeInMinutes >= shopCloseTime) {
//         setGifUrl("Closed.gif");
//         setMessage(
//           "The Store is now closed. Operating hours: Lunch: 7:00 AM - 02:00 PM, Dinner: 2:00 PM - 9:00 PM.",
//         );
//       } else {
//         setGifUrl("Closed.gif");
//         setMessage(
//           "Orders are currently closed. Lunch: 7:00 AM - 02:00 PM. Dinner: 2:00 PM - 9:00 PM.",
//         );
//       }
//     };
//     checkTime();
//     const interval = setInterval(checkTime, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const [Fname, setFname] = useState("");
//   const [Mobile, setMobile] = useState("");
//   const [OTP, setOTP] = useState(["", "", "", ""]);
//   const [PasswordShow, setPasswordShow] = useState(false);

//   const userLogin = async () => {
//     if (!Mobile) {
//       return Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Enter Your Mobile Number`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//     setloader(true);
//     try {
//       const config = {
//         url: "/User/Sendotp",
//         method: "post",
//         baseURL: "http://localhost:7013/api",
//         headers: { "content-type": "application/json" },
//         data: { Mobile: Mobile },
//       };

//       const res = await axios(config);
//       if (res.status === 401) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Invalid Mobile Number`,
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
//           title: `Something went wrong`,
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
//         setloader(false);
//         handleClose3();
//         handleShow2();
//       }
//     } catch (error) {
//       setloader(false);
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   function validateIndianMobileNumber(mobileNumber) {
//     const regex = /^[6-9]\d{9}$/;
//     return regex.test(mobileNumber);
//   }

//   const verifyOTP = async () => {
//     try {
//       if (!OTP) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Enter a valid OTP`,
//           showConfirmButton: false,
//           timer: 3000,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//       const config = {
//         url: "User/mobileotpverification",
//         method: "post",
//         baseURL: "http://localhost:7013/api/",
//         header: { "content-type": "application/json" },
//         data: { Mobile: Mobile, otp: OTP },
//       };
//       const res = await axios(config);
//       if (res.status === 200) {
//         updateUser(res.data.details);
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "success",
//           title: `OTP verified successfully`,
//           showConfirmButton: false,
//           timer: 3000,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });

//         if (!address) {
//           handleClose2();
//           handleClose3();
//           return navigate("/");
//         }
//         navigate("/");
//         handleClose2();
//         setOTP("");
//         setMobile("");
//       }
//     } catch (error) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const getCartQuantity = (itemId) => {
//     const selectedDateISO = selectedDate.toISOString();
//     return Carts?.filter(
//       (cartItem) =>
//         cartItem?.foodItemId === itemId &&
//         cartItem.deliveryDate === selectedDateISO &&
//         cartItem.session === selectedSession,
//     )?.reduce((total, curr) => total + curr?.Quantity, 0);
//   };

//   // Automatically remove today's Lunch/Dinner cart items after cutoff times
//   useEffect(() => {
//     if (!Carts || !setCarts) return;
//     const toKey = (date) => new Date(date).toISOString().slice(0, 10);
//     const cleanup = () => {
//       const now = new Date();
//       const todayKey = toKey(now);
//       let removed = [];
//       const shouldRemove = (item) => {
//         if (!item) return false;
//         const dateVal =
//           item.deliveryDate ||
//           item.date ||
//           item.slotDate ||
//           item.deliveryDateString;
//         const sessionVal = (
//           item.session ||
//           item.slotSession ||
//           item.mealSession ||
//           ""
//         ).toString();
//         if (!dateVal || !sessionVal) return false;
//         const itemKey = toKey(dateVal);
//         if (itemKey !== todayKey) return false;
//         return !isBeforeCutoff(dateVal, sessionVal);
//       };
//       const newCarts = [];
//       Carts.forEach((it) => {
//         if (shouldRemove(it)) {
//           removed.push(it);
//         } else {
//           newCarts.push(it);
//         }
//       });
//       if (removed.length > 0) {
//         setCarts(newCarts);
//       }
//     };
//     cleanup();
//     const id = setInterval(cleanup, 60 * 5000);
//     return () => clearInterval(id);
//   }, [Carts, setCarts]);

//   const lastCartRawRef = useRef(null);
//   useEffect(() => {
//     const readCart = () => {
//       try {
//         const raw = localStorage.getItem("cart") || "[]";
//         if (raw !== lastCartRawRef.current) {
//           lastCartRawRef.current = raw;
//           const parsed = JSON.parse(raw);
//           setCarts(Array.isArray(parsed) ? parsed : []);
//           setCart(Array.isArray(parsed) ? parsed : []);
//         }
//       } catch (err) {
//         console.error("cart sync error", err);
//       }
//     };

//     readCart();
//     const intervalId = setInterval(readCart, 1000);
//     const onStorage = (e) => {
//       if (e.key === "cart") readCart();
//     };
//     const onCartUpdated = () => readCart();
//     window.addEventListener("storage", onStorage);
//     window.addEventListener("cart_updated", onCartUpdated);

//     return () => {
//       clearInterval(intervalId);
//       window.removeEventListener("storage", onStorage);
//       window.removeEventListener("cart_updated", onCartUpdated);
//     };
//   }, [setCarts]);

//   // Clean up any leftover flags
//   useEffect(() => {
//     localStorage.removeItem("triggerProceedToPlan");
//     sessionStorage.removeItem("justAddedAddress");
//   }, []);

//   // Compute showOffer safely
//   const showOffer = useMemo(() => {
//     if (!AllOffer?.length) return false;
//     try {
//       const primaryAddressStr = localStorage.getItem("primaryAddress");
//       const primaryAddress = primaryAddressStr
//         ? JSON.parse(primaryAddressStr)
//         : null;
//       const isEmployeeForOffer = user?.status === "Employee";
//       const acquisitionChannelForOffer = isEmployeeForOffer
//         ? "employee"
//         : user?.acquisition_channel || "organic";
//       return (
//         primaryAddress?.hubId === AllOffer[0]?.hubId &&
//         acquisitionChannelForOffer === AllOffer[0]?.acquisition_channel
//       );
//     } catch (error) {
//       console.error("Error parsing primaryAddress for offer:", error);
//       return false;
//     }
//   }, [AllOffer, user?.status]);

//   // ============ Helper to check if product has offer ============
//   const getProductOffer = (item) => {
//     try {
//       const primaryAddressJson = localStorage.getItem("primaryAddress");
//       if (!primaryAddressJson || !AllOffer?.length) return null;
      
//       const primaryAddress = JSON.parse(primaryAddressJson);
//       const isEmployeeForOffer = user?.status === "Employee";
//       const acquisitionChannelForOffer = isEmployeeForOffer
//         ? "employee"
//         : user?.acquisition_channel || "organic";
      
//       // Check if any offer is already applied in cart
//       const hasOfferInCart = isOfferAlreadyAppliedInCart();
      
//       // Find valid offers for this product
//       for (const offer of AllOffer) {
//         const hubMatches = offer?.hubId === primaryAddress?.hubId;
//         const acquisitionChannelMatch = offer?.acquisition_channel === acquisitionChannelForOffer;
//         const offerStartDate = new Date(offer?.startDate);
//         const offerEndDate = new Date(offer?.endDate);
//         const deliverydate = new Date(item.deliveryDate);
//         const isWithinDateRange = deliverydate >= offerStartDate && deliverydate <= offerEndDate;
        
//         if (hubMatches && isWithinDateRange && acquisitionChannelMatch) {
//           const matchingProduct = offer.products?.find(
//             (product) => product?.foodItemId?.toString() === item?._id?.toString()
//           );
          
//           if (matchingProduct) {
//             // If an offer is already applied in cart, don't show offer price for other products
//             if (hasOfferInCart) {
//               return { ...matchingProduct, isBlocked: true };
//             }
//             return matchingProduct;
//           }
//         }
//       }
//       return null;
//     } catch (error) {
//       console.error("Error getting product offer:", error);
//       return null;
//     }
//   };

//   return (
//     <div>
//       <ToastContainer />

//       <div>
//         <Banner
//           Carts={Carts}
//           getAllOffer={getAllOffer}
//           isVegOnly={isVegOnly}
//           setIsVegOnly={setIsVegOnly}
//           onLocationDetected={handleLocationDetected}
//         />
//       </div>

//       {wallet?.balance > 0 && show && (
//         <div style={{ position: "relative" }}>
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 backgroundColor: "#f9f8f6",
//                 opacity: 1,
//                 zIndex: 20,
//                 pointerEvents: "auto",
//               }}
//             ></div>
//           )}

//           <CoinBalance
//             wallet={wallet}
//             transactions={transactions}
//             expiryDays={expiryDays}
//             setExpiryDays={setExpiryDays}
//             setShow={setShow}
//           />
//         </div>
//       )}

//       <div className="sticky-menu-header" style={{ position: "relative" }}>
//         <div style={{ position: "relative" }}>
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 zIndex: 10,
//                 pointerEvents: "none",
//                 opacity: 0.8,
//               }}
//             ></div>
//           )}
//           <DateSessionSelector
//             onChange={handleSelectionChange}
//             currentDate={selectedDate}
//             currentSession={selectedSession}
//             menuData={allHubMenuData}
//           />
//         </div>
//       </div>

//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.8,
//             }}
//           ></div>
//         )}
//         <Container>
//           <RatingModal />

//           {showOffer && (
//             <div className="maincontainer">
//               <div
//                 className="d-flex gap-3 mb-2 messageDiv rounded-2 mt-3 justify-content-center"
//                 style={{
//                   backgroundColor: "white",
//                   padding: "5px",
//                   height: "50px",
//                 }}
//               >
//                 <p
//                   className="mb-0 typewriter-desc"
//                   style={{
//                     color: "#6B8E23",
//                     fontSize: "1rem",
//                     textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
//                     lineHeight: "1.6",
//                     textAlign: "center",
//                   }}
//                 >
//                   {AllOffer[0]?.session === "Lunch" ? (
//                     <>
//                       Beat the afternoon hunger!{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price} for Lunch!
//                     </>
//                   ) : AllOffer[0]?.session === "Dinner" ? (
//                     <>
//                       Make your evening special!{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price} for Dinner!
//                     </>
//                   ) : (
//                     <>
//                       🥳 Limited time offer:{" "}
//                       {AllOffer[0]?.products[0]?.foodname} at just ₹
//                       {AllOffer[0]?.products[0]?.price}!
//                     </>
//                   )}
//                 </p>
//               </div>
//             </div>
//           )}

//           {loader ? (
//             <div
//               className="d-flex justify-content-center align-item-center"
//               style={{
//                 position: "fixed",
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)",
//                 zIndex: 9999,
//               }}
//             >
//               <div class="lds-ripple">
//                 <div></div>
//                 <div></div>
//               </div>
//             </div>
//           ) : null}
//         </Container>
//       </div>

//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.2,
//             }}
//           ></div>
//         )}
//         <div className="maincontainer">
//           <div className="mobile-product-box" style={{ marginBottom: "30px" }}>
//             <div style={{ marginBottom: "20px" }}>
//               <TabsComponent
//                 tabs={dynamicTabs}
//                 activeTab={selectedCategory}
//                 onTabClick={setSelectedCategory}
//               />
//             </div>

//             <div className="d-flex gap-1 mb-2 flex-column">
//               <div className="row">
//                 {finalDisplayItems?.map((item, i) => {
//                   let matchedLocation = item.locationPrice?.[0];
                  
//                   if (!matchedLocation) {
//                     matchedLocation = {
//                       Remainingstock: 0,
//                       hubPrice: item.hubPrice || item.basePrice || 0,
//                       preOrderPrice: item.preOrderPrice || 0,
//                       basePrice: item.basePrice || 0,
//                     };
//                   }
                  
//                   // Get product offer (will return null if offer already applied to another product)
//                   const productOffer = getProductOffer(item);
//                   const hasOfferInCart = isOfferAlreadyAppliedInCart();
//                   const showOfferPrice = productOffer && !hasOfferInCart;
                  
//                   const { price: effectivePrice } = getEffectivePrice(
//                     item,
//                     matchedLocation,
//                     item?.session,
//                     true,
//                   );
                  
//                   // Check if item is in cart and get its total price
//                   const selectedDateISO = selectedDate.toISOString();
                  
//                   const cartItem = Carts.find(
//                     (cartItem) =>
//                       cartItem?.foodItemId === item?._id &&
//                       cartItem.deliveryDate === selectedDateISO &&
//                       cartItem.session === selectedSession
//                   );
                  
//                   // Determine display price
//                   let displayPrice = effectivePrice;
//                   let offerPrice = null;
                  
//                   if (cartItem && typeof cartItem.totalPrice === 'number') {
//                     // If item is in cart, display the total price for all items
//                     displayPrice = Math.round(cartItem.totalPrice);
//                     // For offer items with multiple quantities, show what it costs without the offer
//                     if (cartItem.offerApplied && cartItem.Quantity > 1 && cartItem.regularPrice) {
//                       offerPrice = Math.round(cartItem.regularPrice * cartItem.Quantity);
//                     }
//                   } else if (showOfferPrice && productOffer?.price) {
//                     // Only show strikethrough for single items with offers not yet in cart
//                     displayPrice = productOffer.price;
//                     offerPrice = effectivePrice;
//                   }

//                   return (
//                     <div
//                       key={item._id?.toString() || i}
//                       className="col-6 col-md-6 mb-2 d-flex justify-content-center"
//                     >
//                       <div className="mobl-product-card">
//                         <div className="productborder">
//                           <div className="prduct-box rounded-1 cardbx">
//                             <div
//                               onClick={() => showDrawer(item)}
//                               className="imagebg"
//                             >
//                               {item?.foodcategory === "Veg" ? (
//                                 <img
//                                   src={IsVeg}
//                                   alt="IsVeg"
//                                   className="isVegIcon"
//                                 />
//                               ) : (
//                                 <img
//                                   src={IsNonVeg}
//                                   alt="IsNonVeg"
//                                   className="isVegIcon"
//                                 />
//                               )}
//                               <img
//                                 src={`${item?.Foodgallery[0]?.image2}`}
//                                 alt=""
//                                 className="mbl-product-img"
//                               />
//                             </div>
//                           </div>
//                           {item?.foodTags && (
//                             <div className="food-tag-container">
//                               {item.foodTags.map((tag, idx) => (
//                                 <span
//                                   key={idx}
//                                   className="food-tag-pill"
//                                   style={{ backgroundColor: tag.tagColor }}
//                                 >
//                                   <img
//                                     src={chef}
//                                     alt=""
//                                     style={{
//                                       width: "10px",
//                                       height: "10px",
//                                       marginRight: "2px",
//                                     }}
//                                   />
//                                   {tag.tagName}
//                                 </span>
//                               ))}
//                             </div>
//                           )}

//                           <div className="food-name-container">
//                             <p className="food-name">{item?.foodname}</p>
//                             <small className="food-unit">{item?.unit}</small>
//                           </div>

//                           <div
//                             className="d-flex align-items-center mb-3"
//                             style={{ gap: "8px", flexWrap: "nowrap" }}
//                           >
//                             {offerPrice && (
//                               <div
//                                 className="align-items-start"
//                                 style={{
//                                   textDecoration: "line-through",
//                                   color: "#6b6b6b",
//                                   fontSize: "15px",
//                                   whiteSpace: "nowrap",
//                                   flexShrink: 0,
//                                   display: "flex",
//                                   gap: "2px",
//                                   marginLeft: "7px",
//                                 }}
//                               >
//                                 <span className="fw-normal">₹</span>
//                                 <span>{offerPrice}</span>
//                               </div>
//                             )}

//                             <div
//                               className="align-items-start"
//                               style={{
//                                 color: "#2c2c2c",
//                                 fontFamily: "Inter",
//                                 fontSize: "20px",
//                                 fontWeight: "500",
//                                 lineHeight: "25px",
//                                 letterSpacing: "-0.8px",
//                                 whiteSpace: "nowrap",
//                                 flexShrink: 0,
//                                 display: "flex",
//                                 gap: "2px",
//                               }}
//                             >
//                               <div
//                                 className="align-items-start"
//                                 style={{
//                                   display: "flex",
//                                   gap: "1px",
//                                   marginLeft: "6px",
//                                 }}
//                               >
//                                 <span className="fw-bold">₹</span>
//                                 <span>{displayPrice}</span>
//                               </div>
//                             </div>
//                           </div>

//                           <div>
//                             <div className="guaranteed-label">
//                               <img
//                                 src={availabity}
//                                 alt=""
//                                 style={{ width: "11px", height: "11px" }}
//                               />{" "}
//                               Guaranteed Availability
//                             </div>
//                           </div>

//                           <div className="d-flex justify-content-center mb-2">
//                             {getCartQuantity(item?._id) === 0 ? (
//                               address && gifUrl === "Closed.gif" ? (
//                                 <button
//                                   className="add-to-cart-btn-disabled"
//                                   disabled
//                                 >
//                                   <span className="add-to-cart-btn-text">
//                                     Add
//                                   </span>
//                                   <FaPlus className="add-to-cart-btn-icon" />
//                                 </button>
//                               ) : (
//                                 <button
//                                   className={`add-to-cart-btn ${(user && !address) || !cutoffValidation.allowed ? "disabled-btn" : ""}`}
//                                   onClick={() =>
//                                     addCart1(item, productOffer, matchedLocation)
//                                   }
//                                   disabled={
//                                     (user && !address) ||
//                                     !cutoffValidation.allowed
//                                   }
//                                 >
//                                   <div className="pick-btn-text">
//                                     <span className="pick-btn-text1">PICK</span>
//                                     <span className="pick-btn-text2">
//                                       Confirm Later
//                                     </span>
//                                   </div>
//                                   <span className="add-to-cart-btn-icon">
//                                     <FaPlus />
//                                   </span>
//                                 </button>
//                               )
//                             ) : getCartQuantity(item?._id) > 0 ? (
//                               <button className="increaseBtn">
//                                 <div
//                                   className="faplus"
//                                   onClick={() =>
//                                     !(user && !address) &&
//                                     decreaseQuantity(
//                                       item?._id,
//                                       productOffer,
//                                       matchedLocation,
//                                     )
//                                   }
//                                   style={{
//                                     opacity: user && !address ? 0.5 : 1,
//                                     pointerEvents:
//                                       user && !address ? "none" : "auto",
//                                   }}
//                                 >
//                                   <FaMinus />
//                                 </div>
//                                 <div className="faQuantity">
//                                   {getCartQuantity(item?._id)}
//                                 </div>
//                                 <div
//                                   className="faplus"
//                                   onClick={() =>
//                                     !(user && !address) &&
//                                     increaseQuantity(
//                                       item?._id,
//                                       productOffer,
//                                       item,
//                                       matchedLocation,
//                                     )
//                                   }
//                                   style={{
//                                     opacity: user && !address ? 0.5 : 1,
//                                     pointerEvents:
//                                       user && !address ? "none" : "auto",
//                                   }}
//                                 >
//                                   <FaPlus />
//                                 </div>
//                               </button>
//                             ) : gifUrl === "Closed.gif" ? (
//                               <button className="add-to-cart-btn" disabled>
//                                 <span className="add-to-cart-btn-text">
//                                   Add
//                                 </span>
//                                 <span className="add-to-cart-btn-icon">
//                                   <FaPlus />
//                                 </span>
//                               </button>
//                             ) : (
//                               <button
//                                 className="add-to-cart-btn"
//                                 onClick={() =>
//                                   addCart1(item, productOffer, matchedLocation)
//                                 }
//                                 disabled={user && !address}
//                                 style={{ opacity: user && !address ? 0.5 : 1 }}
//                               >
//                                 <span className="add-to-cart-btn-text">
//                                   Add
//                                 </span>
//                                 <span className="add-to-cart-btn-icon">
//                                   <FaPlus />
//                                 </span>
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}

//                 {!loader && finalDisplayItems.length === 0 && (
//                   <div className="col-12 text-center my-5">
//                     {user &&
//                     (!localStorage.getItem("primaryAddress") ||
//                       localStorage.getItem("primaryAddress") === "null") ? (
//                       <div>
//                         <h4>No location selected.</h4>
//                         <p>
//                           Please add your location to view the menu for your
//                           area.
//                         </p>
//                         <button
//                           className="mt-2"
//                           onClick={() => navigate("/location")}
//                           style={{
//                             backgroundColor: "#6B8E23",
//                             color: "white",
//                             padding: "10px 20px",
//                             borderRadius: "5px",
//                             border: "none",
//                           }}
//                         >
//                           Add Location
//                         </button>
//                       </div>
//                     ) : (
//                       <>
//                         <h4>No items available for this slot.</h4>
//                         <p>
//                           Please check back later or select a different day!
//                         </p>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <MultiCartDrawer
//           proceedToPlan={proceedToPlan}
//           groupedCarts={groupedCarts}
//           overallSubtotal={overallSubtotal}
//           overallTotalItems={overallTotalItems}
//           onJumpToSlot={handleSelectionChange}
//         />

//         <Modal show={show3} backdrop="static" onHide={handleClose3}>
//           <Modal.Header closeButton>
//             <Modal.Title className="d-flex align-items-center gap-1">
//               <FaLock color="#6B8E23" /> <span>Welcome to Dailydish</span>
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <div className="login-whatsappwithicon">
//                 <FaSquareWhatsapp size={42} color="green" />
//                 <Form.Control
//                   type="number"
//                   placeholder="Enter Your WhatsApp Number"
//                   value={Mobile}
//                   onChange={(e) => setMobile(e.target.value)}
//                 />
//               </div>
//               <Button
//                 variant=""
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//                 onClick={() => {
//                   if (!validateIndianMobileNumber(Mobile)) {
//                     Swal2.fire({
//                       toast: true,
//                       position: "bottom",
//                       icon: "error",
//                       title: `Invalid mobile number`,
//                       showConfirmButton: false,
//                       timer: 3000,
//                       timerProgressBar: true,
//                       customClass: {
//                         popup: "me-small-toast",
//                         title: "me-small-toast-title",
//                       },
//                     });
//                     return;
//                   }
//                   userLogin();
//                 }}
//               >
//                 Send otp
//               </Button>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleClose3}>
//               Close
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         <Modal
//           show={show2}
//           onHide={handleClose2}
//           size="sm"
//           style={{
//             zIndex: "99999",
//             position: "absolute",
//             top: "30%",
//             left: "0%",
//           }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Enter OTP</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <span style={{ fontSize: "13px" }}>
//               An OTP has been sent to your Phone Number
//             </span>
//             <div className="d-flex gap-1 mt-3 mb-3">
//               <InputGroup className="mb-2" style={{ background: "white" }}>
//                 <Form.Control
//                   type={PasswordShow ? "text" : "password"}
//                   className="login-input"
//                   placeholder="Enter OTP"
//                   aria-describedby="basic-addon1"
//                   onChange={(e) => setOTP(e.target.value)}
//                 />
//                 <Button
//                   variant=""
//                   style={{ borderRadius: "0px", border: "1px solid black" }}
//                   onClick={() => setPasswordShow(!PasswordShow)}
//                   className="passbtn"
//                 >
//                   {PasswordShow ? <FaEye /> : <FaEyeSlash />}
//                 </Button>
//               </InputGroup>
//             </div>
//             <div>
//               <Button
//                 variant=""
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//                 onClick={verifyOTP}
//               >
//                 Continue
//               </Button>
//             </div>
//           </Modal.Body>
//         </Modal>

//         <Drawer
//           placement="bottom"
//           closable={false}
//           onClose={onClose}
//           open={open}
//           key="bottom"
//           height={600}
//           className="description-product"
//           style={{ zIndex: 99999 }}
//           zIndex={99999}
//         >
//           <div className="modal-container-food">
//             <button className="custom-close-btn" onClick={onClose}>
//               ×
//             </button>
//             <div className="modern-food-item">
//               <div className="food-image-container">
//                 <div className="image-loading-spinner" id="image-spinner"></div>
//                 {foodData?.Foodgallery?.length > 0 && (
//                   <img
//                     src={`${foodData.Foodgallery[0].image2}`}
//                     alt={foodData?.foodname}
//                     className="modern-food-image"
//                     onLoad={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       const image =
//                         document.querySelector(".modern-food-image");
//                       if (spinner) spinner.classList.add("hidden");
//                       if (image) image.classList.add("loaded");
//                     }}
//                     onError={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       if (spinner) spinner.classList.add("hidden");
//                     }}
//                   />
//                 )}
//                 <div className="food-category-icon">
//                   {foodData?.foodcategory === "Veg" ? (
//                     <img src={IsVeg} alt="IsVeg" className="isVegIcon" />
//                   ) : (
//                     <img src={IsNonVeg} alt="IsNonVeg" className="isVegIcon" />
//                   )}
//                 </div>
//               </div>

//               <div className="food-details">
//                 <h2 className="food-title">{foodData?.foodname}</h2>
//                 <p className="food-description">{foodData?.fooddescription}</p>

//                 {(() => {
//                   const matchedLocation =
//                     foodData?.locationPrice?.length > 0
//                       ? foodData.locationPrice[0]
//                       : {
//                           Remainingstock: 0,
//                           hubPrice:
//                             foodData.hubPrice || foodData.basePrice || 0,
//                           preOrderPrice: foodData.preOrderPrice || 0,
//                           basePrice: foodData.basePrice || 0,
//                         };

//                   const productOffer = getProductOffer(foodData);
//                   const hasOfferInCart = isOfferAlreadyAppliedInCart();
//                   const showOfferPrice = productOffer && !hasOfferInCart;

//                   const eff = getEffectivePrice(
//                     foodData,
//                     matchedLocation,
//                     foodData?.session,
//                     true,
//                   );
                  
//                   const currentPrice = showOfferPrice && productOffer?.price 
//                     ? productOffer.price 
//                     : eff.price;
//                   const originalPrice = eff.price;
//                   const stockCount = matchedLocation?.Remainingstock || 0;

//                   return (
//                     <>
//                       <div className="pricing-section">
//                         <div className="pricing-display">
//                           <span className="current-price">₹{currentPrice}</span>
//                           {showOfferPrice && (
//                             <span
//                               className="original-price"
//                               style={{ marginLeft: "10px" }}
//                             >
//                               ₹{originalPrice}
//                             </span>
//                           )}
//                         </div>
//                         <div className="availability-banner">
//                           {stockCount > 0 ? (
//                             <>
//                               {showOfferPrice && (
//                                 <BiSolidOffer
//                                   color="green"
//                                   style={{ marginRight: "5px" }}
//                                 />
//                               )}
//                             </>
//                           ) : (
//                             "Sold Out"
//                           )}
//                         </div>
//                       </div>

//                       {getCartQuantity(foodData?._id) > 0 ? (
//                         <div className="increaseBtn">
//                           <div
//                             className="faplus"
//                             onClick={() => {
//                               if (!(user && !address))
//                                 decreaseQuantity(
//                                   foodData?._id,
//                                   productOffer,
//                                   matchedLocation,
//                                 );
//                             }}
//                             style={{
//                               opacity: user && !address ? 0.5 : 1,
//                               pointerEvents: user && !address ? "none" : "auto",
//                             }}
//                           >
//                             <FaMinus />
//                           </div>
//                           <div className="faQuantity">
//                             {getCartQuantity(foodData?._id)}
//                           </div>
//                           <div
//                             className="faplus"
//                             onClick={() => {
//                               if (!(user && !address))
//                                 increaseQuantity(
//                                   foodData?._id,
//                                   productOffer,
//                                   foodData,
//                                   matchedLocation,
//                                 );
//                             }}
//                             style={{
//                               opacity: user && !address ? 0.5 : 1,
//                               pointerEvents: user && !address ? "none" : "auto",
//                             }}
//                           >
//                             <FaPlus />
//                           </div>
//                         </div>
//                       ) : stockCount > 0 && gifUrl !== "Closed.gif" ? (
//                         <button
//                           className="add-to-cart-btn"
//                           onClick={() => addCart1(foodData, productOffer, matchedLocation)}
//                           disabled={user && !address}
//                           style={{ opacity: user && !address ? 0.5 : 1 }}
//                         >
//                           <span className="add-to-cart-btn-text">Add</span>
//                           <span className="add-to-cart-btn-icon">
//                             <FaPlus />
//                           </span>
//                         </button>
//                       ) : (
//                         <button
//                           className={
//                             gifUrl === "Closed.gif"
//                               ? "add-to-cart-btn-disabled"
//                               : "sold-out-btn"
//                           }
//                           disabled
//                         >
//                           <span className="add-to-cart-btn-text">
//                             {gifUrl === "Closed.gif" ? "Closed" : "Sold Out"}
//                           </span>
//                         </button>
//                       )}
//                     </>
//                   );
//                 })()}
//               </div>
//             </div>
//           </div>
//         </Drawer>
//       </div>

//       <div style={{ marginBottom: "80px" }}>
//         <Footer />
//       </div>

//       <BottomNav />
//     </div>
//   );
// };

// const TabsComponent = ({ tabs, activeTab, onTabClick }) => {
//   return (
//     <div className="tabs-container2">
//       <div className="tabs-scroll-container">
//         <div className="tabs-scroll">
//           {tabs.map((tab) => (
//             <button
//               key={tab}
//               className={`tab-button ${activeTab === tab ? "active" : ""}`}
//               onClick={() => onTabClick(tab)}
//             >
//               <span className="tab-button-text">{tab}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//       <style jsx>{`
//         .tabs-container2 {
//           background-color: ${Colors.creamWalls};
//           border-bottom-left-radius: 16px;
//           border-bottom-right-radius: 16px;
//           position: relative;
//           border-bottom: 2px solid #fff;
//           box-shadow:
//             0 1px 3px rgba(0, 0, 0, 0.1),
//             0 2px 6px rgba(0, 0, 0, 0.05);
//         }
//         .tabs-scroll-container {
//           overflow-x: auto;
//           -webkit-overflow-scrolling: touch;
//           scrollbar-width: none;
//         }
//         .tabs-scroll-container::-webkit-scrollbar {
//           display: none;
//         }
//         .tabs-scroll {
//           display: inline-flex;
//           min-width: 100%;
//           gap: 10px;
//           padding: 0 4px;
//         }
//         .tab-button {
//           display: inline-flex;
//           justify-content: center;
//           align-items: center;
//           padding: 8px 24px;
//           border-radius: 20px;
//           border: none;
//           background: transparent;
//           cursor: pointer;
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//           white-space: nowrap;
//           flex-shrink: 0;
//           min-height: 25px;
//         }
//         .tab-button:hover {
//           background-color: ${Colors.warmbeige}40;
//           transform: translateY(-1px);
//         }
//         .tab-button.active {
//           background-color: ${Colors.greenCardamom};
//           padding: 4px 8px;
//           box-shadow: 0 2px 8px ${Colors.greenCardamom}80;
//           width: auto;
//           height: auto;
//           border-radius: 20px;
//         }
//         .tab-button.active:hover {
//           background-color: ${Colors.greenCardamom}E6;
//           transform: translateY(-1px) scale(1.02);
//         }
//         .tab-button-text {
//           font-family: "Inter", sans-serif;
//           fontsize: 14px;
//           font-weight: 400;
//           line-height: 18px;
//           letter-spacing: -0.7px;
//           color: ${Colors.primaryText};
//           transition: all 0.3s ease;
//         }
//         .tab-button.active .tab-button-text {
//           font-family: "Inter", sans-serif;
//           fontsize: 16px;
//           font-weight: 900;
//           line-height: 21px;
//           letter-spacing: -0.8px;
//           color: ${Colors.appForeground};
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Home;  


































// =========================================================================






import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { Container } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaLock, FaUser, FaAngleUp } from "react-icons/fa";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { FaPlus, FaMinus, FaSquareWhatsapp } from "react-icons/fa6";
import "../Styles/Home.css";
import Banner from "./Banner";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Drawer } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CoinBalance from "./CoinBalance";
import { WalletContext } from "../WalletContext";
import RatingModal from "./RatingModal";
import { BiSolidOffer } from "react-icons/bi";
import Swal2 from "sweetalert2";
// import moment from "moment";
import IsVeg from "../assets/isVeg=yes.svg";
import IsNonVeg from "../assets/isVeg=no.svg";
import MultiCartDrawer from "./MultiCartDrawer";
import DateSessionSelector from "./DateSessionSelector";
import chef from "./../assets/chef_3.png";
import { Colors, FontFamily } from "../Helper/themes";
import BottomNav from "./BottomNav";
// import LocationRequiredPopup from "./LocationRequiredPopup";
// import { MdAddLocationAlt } from "react-icons/md";
import availabity from "./../assets/weui_done2-filled.png";
import { addToCart } from "../Helper/cartHelper";
import Footer from "./Footer";
import CutoffStatusCard from './../Helper/CutoffTimer.jsx';

const Home = ({ selectArea, setSelectArea, Carts, setCarts }) => {
  // Store user in state to avoid infinite render loop
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // Listen for user changes in localStorage
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "user") {
        try {
          setUser(JSON.parse(e.newValue));
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Provide a function to update user state and localStorage together
  const updateUser = (userObj) => {
    setUser(userObj);
    if (userObj) {
      localStorage.setItem("user", JSON.stringify(userObj));
    } else {
      localStorage.removeItem("user");
    }
    window.dispatchEvent(new Event("userUpdated"));
  };

  const navigate = useNavigate();
  const location = useLocation();

  const { wallet, transactions, loading, walletSeting, getorderByCustomerId } =
    useContext(WalletContext);

  const [loader, setloader] = useState(false);
  const [allHubMenuData, setAllHubMenuData] = useState([]);

  // --- NEW STATE FOR FILTERS ---
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [address, setAddress] = useState(null);

  // ============ NEW: Track if default hub menu should load ============
  const [shouldLoadDefaultMenu, setShouldLoadDefaultMenu] = useState(!user);

  // ============ NEW: Cutoff validation state ============
  const [cutoffValidation, setCutoffValidation] = useState({
    allowed: true,
    message: "",
    cutoffDateTime: null,
    nextAvailableDateTime: null,
  });
  const [cutoffLoading, setCutoffLoading] = useState(false);

 

  // State for offers
  const [gifUrl, setGifUrl] = useState("");
  const [message, setMessage] = useState("");
  const [AllOffer, setAllOffer] = useState([]);
  
  // NEW: Track which offer has been applied (only ONE offer per slot)
  const [appliedOfferForSlot, setAppliedOfferForSlot] = useState(null);

  // Fetch total orders
  const [totalOrder, setTotalOrder] = useState([]);
  const getTotalOrder = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getallorders");
      if (res.status === 200) {
        setTotalOrder(res.data.order.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTotalOrder();
  }, []);

  // Function to find number of orders for current customer
  const findNumberofOrders = () => {
    const customerId = user?._id;
    if (!customerId) return 0;
    return totalOrder.filter(
      (customer) => customer?.customerId === customerId,
    ).length;
  };

  // ============ UPDATED: Helper function to check if customer qualifies for offer 
  const doesCustomerQualifyForOffer = (customerOrderCount, offerCustomerType) => {
    // customerType = -1 means all customers qualify (regardless of order count)
    if (offerCustomerType === -1) return true;
    
    // customerType = 0 means ONLY customers with 0 orders (first-time buyers only)
    // Once they order (1+ orders), they should NOT see this offer again
    if (offerCustomerType === 0) {
      return customerOrderCount === 0;
    }
    
    // For other customerType values (1, 2, etc.) - customers with up to X orders
    // Example: customerType=1 -> customers with 0 or 1 orders
    // Once they have 2+ orders, they shouldn't see it
    return customerOrderCount <= offerCustomerType;
  };

  // Get customer order count for eligibility messages
  const getCustomerOrderCount = useMemo(() => {
    return findNumberofOrders();
  }, [user, totalOrder]);

  // ============ getAllOffer function with customerType filtering ============
  const getAllOffer = async () => {
    try {
      const response = await axios.get(
        "http://localhost:7013/api/admin/offers",
      );
      if (response.status === 200 && response.data?.data) {
        let offers = response.data.data;
        
        // Filter offers based on customer's order count
        if (user?._id) {
          const customerOrderCount = findNumberofOrders();
          
          // Filter offers: keep only offers where at least one product qualifies
          const filteredOffers = offers.filter(offer => {
            return offer.products.some(product => 
              doesCustomerQualifyForOffer(customerOrderCount, product.customerType)
            );
          });
          
          // Also filter the products within each offer
          const processedOffers = filteredOffers.map(offer => ({
            ...offer,
            products: offer.products.filter(product => 
              doesCustomerQualifyForOffer(customerOrderCount, product.customerType)
            )
          }));
          
          setAllOffer(processedOffers);
        } else {
          // For non-logged in users, show offers with customerType = -1 or 0 (but 0 will be filtered after login)
          const publicOffers = offers.filter(offer => 
            offer.products.some(product => product.customerType === -1 || product.customerType === 0)
          ).map(offer => ({
            ...offer,
            products: offer.products.filter(product => product.customerType === -1 || product.customerType === 0)
          }));
          setAllOffer(publicOffers);
        }
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setAllOffer([]);
    }
  };

  // ============ Function to validate cutoff timing ============
// In your Home component, modify the validateCutoffTiming function to not cause continuous re-renders
const validateCutoffTiming = useCallback(
  async (hubId, session, deliveryDate) => {
    if (!hubId || !session) return true;

    try {
      setCutoffLoading(true);
      const status = user?.status === "Employee" ? "Employee" : "Normal";

      const response = await axios.post(
        "http://localhost:7013/api/Hub/validate-order-timing",
        {
          hubId: hubId,
          session: session.toLowerCase(),
          status: status,
          deliveryDate:
            deliveryDate instanceof Date
              ? deliveryDate.toISOString()
              : deliveryDate,
        },
      );

      if (response.status === 200) {
        setCutoffValidation({
          allowed: response.data.allowed,
          message: response.data.message,
          cutoffDateTime: response.data.cutoffDateTime,
          nextAvailableDateTime: response.data.nextAvailableDateTime,
        });
        return response.data.allowed;
      }
      return true;
    } catch (error) {
      console.error("Error validating cutoff timing:", error);
      return true;
    } finally {
      setCutoffLoading(false);
    }
  },
  [user?.status],
);



  // Function to get next available ordering time
  const getNextAvailableTime = useCallback(
    async (hubId, session) => {
      if (!hubId || !session) return null;

      try {
        const status = user?.status === "Employee" ? "Employee" : "Normal";
        const response = await axios.get(
          `http://localhost:7013/api/Hub/next-available-time/${hubId}/${session.toLowerCase()}/${status}`,
        );

        if (response.status === 200) {
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("Error getting next available time:", error);
        return null;
      }
    },
    [user?.status],
  );

  // --- DATE & SESSION STATE ---
  const getNormalizedToday = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    if (location.state?.targetDate) return new Date(location.state.targetDate);
    return getNormalizedToday();
  });

  const [selectedSession, setSelectedSession] = useState(() => {
    if (location.state?.targetSession) return location.state.targetSession;
    return "Lunch";
  });

  // ============ Check cutoff when date/session or hub changes ============
  useEffect(() => {
    const checkCutoff = async () => {
      const currentAddress =
        address ||
        (() => {
          try {
            const primaryAddress = localStorage.getItem("primaryAddress");
            const currentLocation = localStorage.getItem("currentLocation");
            return primaryAddress
              ? JSON.parse(primaryAddress)
              : currentLocation
                ? JSON.parse(currentLocation)
                : null;
          } catch {
            return null;
          }
        })();

      if (currentAddress?.hubId && selectedDate && selectedSession) {
        const isAllowed = await validateCutoffTiming(
          currentAddress.hubId,
          selectedSession,
          selectedDate,
        );

        if (!isAllowed) {
          console.log(
            "Order not allowed for this slot:",
            cutoffValidation.message,
          );
        }
      }
    };

    checkCutoff();
  }, [address, selectedDate, selectedSession, validateCutoffTiming]);

  // Add a function to refresh address from localStorage
  const refreshAddress = useCallback(() => {
    try {
      const primaryAddress = localStorage.getItem("primaryAddress");
      const currentLocation = localStorage.getItem("currentLocation");
      const defaultHubData = localStorage.getItem("defaultHubData");

      if (primaryAddress && primaryAddress !== "null") {
        const parsedPrimary = JSON.parse(primaryAddress);
        setAddress(parsedPrimary);
        setShouldLoadDefaultMenu(false);
      } else if (currentLocation && currentLocation !== "null") {
        const parsedCurrent = JSON.parse(currentLocation);
        setAddress(parsedCurrent);
        setShouldLoadDefaultMenu(false);
      } else if (defaultHubData && defaultHubData !== "null") {
        try {
          const parsedDefault = JSON.parse(defaultHubData);
          const defaultAddress = {
            hubId:
              parsedDefault.hubId ||
              parsedDefault._id ||
              "69613cb1145c1aaedd9859cd",
            hubName: parsedDefault.hubName || parsedDefault.name || "Default Hub",
            fullAddress:
              parsedDefault.address || "Select your location to view menu",
            isDefaultHub: true,
            location: parsedDefault.location || {
              type: "Point",
              coordinates: [0, 0],
            },
          };
          setAddress(defaultAddress);
          setShouldLoadDefaultMenu(false);
          localStorage.setItem(
            "currentLocation",
            JSON.stringify(defaultAddress),
          );
        } catch (e) {
          console.error("Error parsing default hub data:", e);
          setAddress(null);
          setShouldLoadDefaultMenu(!user);
        }
      } else {
        setAddress(null);
        setShouldLoadDefaultMenu(!user);
      }
    } catch (error) {
      console.error("Error refreshing address:", error);
      setAddress(null);
      setShouldLoadDefaultMenu(!user);
    }
  }, [user]);

  // Listen for location updates from Banner
  useEffect(() => {
    const handleLocationUpdated = () => {
      refreshAddress();
    };

    const handleAddressUpdated = () => {
      refreshAddress();
    };

    const handleAddressAdded = () => {
      refreshAddress();
    };

    const handleFocus = () => {
      refreshAddress();
    };

    const handleDefaultHubLoaded = () => {
      refreshAddress();
    };

    window.addEventListener("locationUpdated", handleLocationUpdated);
    window.addEventListener("addressUpdated", handleAddressUpdated);
    window.addEventListener("addressAdded", handleAddressAdded);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("defaultHubLoaded", handleDefaultHubLoaded);

    const handleStorageChange = (e) => {
      if (
        e.key === "currentLocation" ||
        e.key === "primaryAddress" ||
        e.key === "defaultHubData"
      ) {
        refreshAddress();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const intervalId = setInterval(() => {
      refreshAddress();
    }, 2000);

    return () => {
      window.removeEventListener("locationUpdated", handleLocationUpdated);
      window.removeEventListener("addressUpdated", handleAddressUpdated);
      window.removeEventListener("addressAdded", handleAddressAdded);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("defaultHubLoaded", handleDefaultHubLoaded);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [refreshAddress]);

  // State for location popup
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Update handleSelectionChange to reset selectedCategory
  const handleSelectionChange = (date1, session1) => {
    setSelectedDate(date1);
    setSelectedSession(session1);
    setSelectedCategory("");
    // Reset applied offer when changing slot
    setAppliedOfferForSlot(null);
    window.scrollTo(0, 0);
  };

  // Check if user is logged in but has no address selected
  useEffect(() => {
    if (user && !address) {
      const timer = setTimeout(() => {
        setShowLocationPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, address]);

  // Add location detection for users coming from splash screen
  useEffect(() => {
    const checkLocationPermission = async () => {
      const currentLocation = localStorage.getItem("currentLocation");
      const primaryAddress = localStorage.getItem("primaryAddress");
      const defaultHubData = localStorage.getItem("defaultHubData");

      if (currentLocation || primaryAddress || defaultHubData || address) {
        return;
      }

      if (navigator.geolocation && navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({
            name: "geolocation",
          });
        } catch (error) {
          console.error("Permissions API error:", error);
        }
      }
    };

    const timer = setTimeout(checkLocationPermission, 500);
    return () => clearTimeout(timer);
  }, []);

  // --- 1. FETCH DATA (Only when Hub Changes) ---
  useEffect(() => {
    const hubIdToUse =
      address?.hubId ||
      (shouldLoadDefaultMenu && !user ? "69613cb1145c1aaedd9859cd" : null);

    if (!hubIdToUse) {
      setAllHubMenuData([]);
      setloader(false);
      return;
    }

    const fetchAllMenuData = async () => {
      setloader(true);
      try {
        const res = await axios.get(
          "http://localhost:7013/api/user/get-hub-menu",
          {
            params: { hubId: hubIdToUse },
          },
        );

        if (res.status === 200) {
          setAllHubMenuData(res.data.menu);
        } else {
          setAllHubMenuData([]);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        setAllHubMenuData([]);
      } finally {
        setloader(false);
      }
    };

    fetchAllMenuData();
  }, [address?.hubId, shouldLoadDefaultMenu, user]);

  const handleLocationDetected = useCallback((newLocation) => {
    setAddress(newLocation);
    setShouldLoadDefaultMenu(false);

    if (newLocation) {
      localStorage.setItem("currentLocation", JSON.stringify(newLocation));
    }

    window.dispatchEvent(new Event("locationUpdated"));
  }, []);

  // --- 2. CORE FILTERING LOGIC ---
  const currentSlotItems = useMemo(() => {
    if (!allHubMenuData?.length) return [];
    const selectedDateISO = selectedDate.toISOString();

    return allHubMenuData.filter(
      (item) =>
        item.deliveryDate === selectedDateISO &&
        item.session === selectedSession,
    );
  }, [allHubMenuData, selectedDate, selectedSession]);

  const vegFilteredItems = useMemo(() => {
    if (isVegOnly) {
      return currentSlotItems.filter((item) => item.foodcategory === "Veg");
    }
    return currentSlotItems;
  }, [currentSlotItems, isVegOnly]);

  const dynamicTabs = useMemo(() => {
    const categories = new Set(
      vegFilteredItems.map((item) => item.menuCategory),
    );
    const uniqueCats = [...categories].filter(Boolean).sort();
    return uniqueCats;
  }, [vegFilteredItems]);

  useEffect(() => {
    if (dynamicTabs.length > 0 && !selectedCategory) {
      setSelectedCategory(dynamicTabs[0]);
    } else if (
      dynamicTabs.length > 0 &&
      !dynamicTabs.includes(selectedCategory)
    ) {
      setSelectedCategory(dynamicTabs[0]);
    }
  }, [dynamicTabs, selectedCategory]);

  const finalDisplayItems = useMemo(() => {
    if (!selectedCategory) return [];
    return vegFilteredItems.filter(
      (item) => item.menuCategory === selectedCategory,
    );
  }, [vegFilteredItems, selectedCategory]);

  const isSameDay = (d1, d2) => {
    const a = new Date(d1);
    const b = new Date(d2);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    return a.getTime() === b.getTime();
  };

  // ============ Check cutoff using validation result ============
  const isBeforeCutoff = (deliveryDate, session) => {
    if (!deliveryDate || !session) return false;

    // Use the cutoff validation result from API
    if (!cutoffValidation.allowed) {
      return false;
    }

    const now = new Date();
    const delivery = new Date(deliveryDate);
    delivery.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Future dates are always allowed
    if (delivery.getTime() > today.getTime()) return true;

    // Past dates are not allowed
    if (delivery.getTime() < today.getTime()) return false;

    // For today, use the API validation result
    return cutoffValidation.allowed;
  };

  // Helper: always use preorder price if available and before cutoff
  const getEffectivePrice = (item, matchedLocation, session) => {
    const hubPrice =
      (matchedLocation &&
        (matchedLocation.hubPrice || matchedLocation.basePrice)) ||
      item?.hubPrice ||
      item?.basePrice ||
      0;
    const preOrderPrice =
      (matchedLocation &&
        (matchedLocation.preOrderPrice || matchedLocation.preorderPrice)) ||
      item?.preOrderPrice ||
      item?.preorderPrice ||
      0;
    const beforeCutoff = isBeforeCutoff(
      item?.deliveryDate || item?.deliveryDateISO,
      session,
    );
    if (beforeCutoff && preOrderPrice > 0) return { price: preOrderPrice };
    return { price: hubPrice };
  };

  const [cartCount, setCartCount] = useState(0);
  const [isCartVisible, setIsCartVisible] = useState(false);

  const handleShow = () => {
    setCartCount(cartCount + 1);
    setIsCartVisible(true);
  };

  const [foodData, setFoodData] = useState({});
  const [open, setOpen] = useState(false);

  const showDrawer = (food) => {
    setFoodData(food);
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
    return () => {
      document.body.classList.remove("drawer-open");
    };
  }, [open]);

  const [show4, setShow4] = useState(false);
  const handleClose4 = () => setShow4(false);
  const [show3, setShow3] = useState(false);
  const handleClose3 = () => setShow3(false);
  const [show2, setShow2] = useState(false);
  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);

  useEffect(() => {
    refreshAddress();
  }, [user]);

  // ============ Helper function to check if any offer is already applied in cart ============
  const isOfferAlreadyAppliedInCart = () => {
    return Carts.some(item => item.offerProduct === true && item.offerApplied === true);
  };

  // ============ Helper function to get the applied offer details ============
  const getAppliedOfferFromCart = () => {
    return Carts.find(item => item.offerProduct === true && item.offerApplied === true);
  };

  // Get customer order count for eligibility messages
  const getCustomerOrderCountForMessage = () => {
    return findNumberofOrders();
  };

  // Get offer eligibility message based on customerType
  const getOfferEligibilityMessage = (customerType) => {
    const orderCount = getCustomerOrderCountForMessage();
    
    if (customerType === -1) {
      return "Available for all customers!";
    }
    
    if (customerType === 0) {
      if (orderCount === 0) {
        return "🎁 First order special offer! Available only for first-time customers.";
      } else {
        return "🔒 This offer is only for first-time customers. You have already placed an order.";
      }
    }
    
    if (orderCount <= customerType) {
      if (customerType === 1) {
        return "🎉 Welcome offer for new customers (0-1 orders)!";
      } else {
        return `✨ Special offer for customers with ${customerType} or fewer orders!`;
      }
    } else {
      return `🔒 This offer is for customers with ${customerType} or fewer orders. You have placed ${orderCount} order(s).`;
    }
  };

// ============ Add to cart with FIRST OFFER ONLY logic and customerType validation ============
// const addCart1 = async (item, offerData, matchedLocation) => {
//   // Check cutoff before adding to cart
//   if (!cutoffValidation.allowed) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title:
//         cutoffValidation.message ||
//         `Cannot add to cart. Orders are closed for ${selectedSession}.`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   if (!matchedLocation || matchedLocation?.Remainingstock === 0) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Product is out of stock`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   // VALIDATE CUSTOMER ELIGIBILITY FOR OFFER
//   if (offerData && offerData.customerType !== undefined && user?._id) {
//     const customerOrderCount = findNumberofOrders();
//     const customerQualifies = doesCustomerQualifyForOffer(
//       customerOrderCount,
//       offerData.customerType
//     );
    
//     if (!customerQualifies) {
//       let message = "";
//       if (offerData.customerType === 0) {
//         message = `This offer is only for first-time customers! You have already placed ${customerOrderCount} order(s).`;
//       } else {
//         message = `This offer is for customers with ${offerData.customerType} or fewer orders. You have placed ${customerOrderCount} order(s).`;
//       }
      
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: message,
//         showConfirmButton: false,
//         timer: 4000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//       return;
//     }
//   }

//   const eff = getEffectivePrice(item, matchedLocation, selectedSession);
  
//   // CRITICAL LOGIC: Check if any offer is already applied in cart for this slot
//   const hasOfferInCart = isOfferAlreadyAppliedInCart();
//   const appliedOffer = getAppliedOfferFromCart();
  
//   // Get regular price (base price without any offer)
//   const regularPrice = matchedLocation?.hubPrice || item?.hubPrice || matchedLocation?.basePrice || item?.basePrice || 115;
//   const offerPriceValue = offerData?.price || null;
  
//   let appliedPrice;
//   let isOfferApplied = false;
//   let finalOfferPrice = null;
//   let finalRegularPrice = regularPrice;
  
//   // If this product has an offer available AND customer qualifies
//   if (offerData && offerData.price && user?._id) {
//     const customerOrderCount = findNumberofOrders();
//     const customerQualifies = doesCustomerQualifyForOffer(
//       customerOrderCount,
//       offerData.customerType
//     );
    
//     if (customerQualifies) {
//       // If NO offer has been applied yet in cart, apply this offer (FIRST OFFER WINS)
//       if (!hasOfferInCart) {
//         appliedPrice = offerData.price;
//         isOfferApplied = true;
//         finalOfferPrice = offerData.price;
//         console.log(`FIRST OFFER APPLIED: ${item.foodname} at ₹${offerData.price}`);
//       } 
//       // If an offer is already applied in cart, this product gets regular price (SECOND OFFER DOESN'T APPLY)
//       else {
//         appliedPrice = regularPrice;
//         isOfferApplied = false;
//         console.log(`SECOND OFFER REJECTED: ${item.foodname} at regular price ₹${regularPrice} (Offer already applied to ${appliedOffer?.foodname})`);
        
//         // Show toast notification that only one offer per slot is allowed
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "info",
//           title: `Only one offer per slot allowed! ${appliedOffer?.foodname} already has the offer.`,
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//     } else {
//       appliedPrice = regularPrice;
//       isOfferApplied = false;
//     }
//   } else {
//     // No offer available for this product
//     appliedPrice = regularPrice;
//   }

//   const slotKey = `${selectedDate.toISOString()}|${selectedSession}`;
  
//   const newCartItem = {
//     deliveryDate: new Date(selectedDate).toISOString(),
//     session: selectedSession,
//     slotKey: slotKey,
//     foodItemId: item?._id,
//     price: appliedPrice,
//     totalPrice: appliedPrice,
//     image: item?.Foodgallery[0]?.image2,
//     unit: item?.unit,
//     foodname: item?.foodname,
//     quantity: item?.quantity,
//     Quantity: 1,
//     gst: item?.gst,
//     discount: item?.discount,
//     foodcategory: item?.foodcategory,
//     remainingstock: matchedLocation?.Remainingstock,
//     offerProduct: !!offerData,
//     offerApplied: isOfferApplied, // Track if this item actually got the offer price
//     offerPrice: finalOfferPrice,
//     regularPrice: finalRegularPrice,
//     minCart: offerData?.minCart || 0,
//     actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//     basePrice: matchedLocation?.basePrice || item?.basePrice || 0,
//     hubPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
//     preOrderPrice: matchedLocation?.preOrderPrice || item?.preOrderPrice || 0,
//     customerType: offerData?.customerType || null, // Store customerType for reference
//   };

//   const cart = JSON.parse(localStorage.getItem("cart"));
//   const cartArray = Array.isArray(cart) ? cart : [];

//   const itemIndex = cartArray.findIndex(
//     (cartItem) =>
//       cartItem?.foodItemId === newCartItem?.foodItemId &&
//       cartItem.deliveryDate === newCartItem.deliveryDate &&
//       cartItem.session === newCartItem.session,
//   );

//   if (itemIndex === -1) {
//     cartArray.push(newCartItem);
//     localStorage.setItem("cart", JSON.stringify(cartArray));
//     setCarts(cartArray);
//     handleShow();
//   } else {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Item is already in this slot's cart`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   }
// };

  // ============  Add to cart with cutoff validation ============
// ============ Add to cart with cutoff validation and offer support ============
const addCart1 = async (item, offerData, matchedLocation) => {
  // Validate cutoff before adding
  if (!cutoffValidation.allowed) {
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "info",
      title: cutoffValidation.message || `Cannot add to cart. Orders are closed for ${selectedSession}.`,
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

  // Validate stock
  if (!matchedLocation || matchedLocation?.Remainingstock === 0) {
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "info",
      title: `Product is out of stock`,
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

  // VALIDATE CUSTOMER ELIGIBILITY FOR OFFER
  if (offerData && offerData.customerType !== undefined && user?._id) {
    const customerOrderCount = findNumberofOrders();
    const customerQualifies = doesCustomerQualifyForOffer(
      customerOrderCount,
      offerData.customerType
    );
    
    if (!customerQualifies) {
      let message = "";
      if (offerData.customerType === 0) {
        message = `This offer is only for first-time customers! You have already placed ${customerOrderCount} order(s).`;
      } else {
        message = `This offer is for customers with ${offerData.customerType} or fewer orders. You have placed ${customerOrderCount} order(s).`;
      }
      
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: message,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      return;
    }
  }

  // Get slot key for the current selection
  const dateStr = selectedDate instanceof Date 
    ? selectedDate.toISOString().split('T')[0]
    : new Date(selectedDate).toISOString().split('T')[0];
  const slotKey = `${dateStr}|${selectedSession.toLowerCase()}`;

  // CRITICAL LOGIC: Check if any offer is already applied in cart for this slot
  const hasOfferInCart = isOfferAlreadyAppliedInCart(slotKey);
  const appliedOffer = getAppliedOfferFromCart(slotKey);
  
  // Get regular price (base price without any offer)
  const regularPrice = matchedLocation?.hubPrice || item?.hubPrice || matchedLocation?.basePrice || item?.basePrice || 115;
  const offerPriceValue = offerData?.price || null;
  
  let appliedPrice;
  let isOfferApplied = false;
  let finalOfferPrice = null;
  let finalRegularPrice = regularPrice;
  
  // If this product has an offer available AND customer qualifies
  if (offerData && offerData.price && user?._id) {
    const customerOrderCount = findNumberofOrders();
    const customerQualifies = doesCustomerQualifyForOffer(
      customerOrderCount,
      offerData.customerType
    );
    
    if (customerQualifies) {
      // If NO offer has been applied yet in cart, apply this offer (FIRST OFFER WINS)
      if (!hasOfferInCart) {
        appliedPrice = offerData.price;
        isOfferApplied = true;
        finalOfferPrice = offerData.price;
        console.log(`FIRST OFFER APPLIED: ${item.foodname} at ₹${offerData.price}`);
      } 
      // If an offer is already applied in cart, this product gets regular price (SECOND OFFER DOESN'T APPLY)
      else {
        appliedPrice = regularPrice;
        isOfferApplied = false;
        console.log(`SECOND OFFER REJECTED: ${item.foodname} at regular price ₹${regularPrice} (Offer already applied to ${appliedOffer?.foodname})`);
        
        // Show toast notification that only one offer per slot is allowed
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "info",
          title: `Only one offer per slot allowed! ${appliedOffer?.foodname} already has the offer.`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
    } else {
      appliedPrice = regularPrice;
      isOfferApplied = false;
    }
  } else {
    // No offer available for this product
    appliedPrice = regularPrice;
  }

  // Prepare item for cart helper with offer information
  const itemToAdd = {
    _id: item?._id,
    foodname: item?.foodname,
    itemName: item?.foodname,
    image: item?.Foodgallery?.[0]?.image2,
    unit: item?.unit,
    gst: item?.gst,
    discount: item?.discount,
    foodcategory: item?.foodcategory,
    remainingstock: matchedLocation?.Remainingstock,
    deliveryCharge: deliveryRate,
    
    // Price fields
    price: appliedPrice,
    actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
    basePrice: matchedLocation?.basePrice || item?.basePrice || 0,
    hubPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
    preOrderPrice: matchedLocation?.preOrderPrice || item?.preOrderPrice || 0,
    
    // Offer fields
    offerProduct: !!offerData,
    offerApplied: isOfferApplied,
    offerPrice: finalOfferPrice,
    regularPrice: finalRegularPrice,
    minCart: offerData?.minCart || 0,
    customerType: offerData?.customerType || null,
    
    // Hub info
    hubId: matchedLocation?.hubId || item?.hubId,
    hubName: matchedLocation?.hubName,
  };

  // Check if item already exists in this slot
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartId = `${item._id}-${dateStr}-${selectedSession.toLowerCase()}`;
  const exists = cart.some(c => c.cartId === cartId);
  
  if (exists) {
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "info",
      title: `Item is already in this slot's cart`,
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

  // Use cartHelper to add item with offer info
  addToCart(itemToAdd, selectedDate, selectedSession, 1, {
    offerProduct: !!offerData,
    offerPrice: finalOfferPrice,
    regularPrice: finalRegularPrice,
    offerApplied: isOfferApplied
  });
  
  // Update state with normalized cart
  const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
  setCarts(updatedCart);
  handleShow();
  
  // Show success toast with offer info if applied
  if (isOfferApplied) {
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "success",
      title: `Added with offer! ₹${finalOfferPrice} instead of ₹${regularPrice}`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: "me-small-toast",
        title: "me-small-toast-title",
      },
    });
  }
};




  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);

    const addonedCarts = async () => {
      try {
        await axios.post("http://localhost:7013/api/cart/addCart", {
          userId: user?._id,
          items: storedCart,
          lastUpdated: Date.now,
          username: user?.Fname,
          mobile: user?.Mobile,
        });
      } catch (error) {
        console.log(error);
      }
    };
    if (Carts && Carts.length > 0 && user?._id) {
      addonedCarts();
    }
  }, [JSON.stringify(Carts), user?._id]);

  const updateCartData = (updatedCart) => {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    setCarts(updatedCart);
  };


// ============ Increase quantity with offer logic (FIXED) ============
// const increaseQuantity = (foodItemId, offerData, item, matchedLocation) => {
//   const maxStock = matchedLocation?.Remainingstock || 0;
//   const selectedDateISO = selectedDate.toISOString();
  
//   // Find the existing cart item
//   const existingItem = Carts.find(
//     (cartItem) =>
//       cartItem.foodItemId === foodItemId &&
//       cartItem.deliveryDate === selectedDateISO &&
//       cartItem.session === selectedSession
//   );
  
//   if (!existingItem) return;
  
//   // Check if this item got the offer price (first item in cart with offer)
//   const gotOfferPrice = existingItem.offerApplied === true;
//   const regularPrice = existingItem.regularPrice || existingItem.hubPrice || matchedLocation?.hubPrice || 115;
//   const offerPriceValue = existingItem.offerPrice;
  
//   // Calculate price for new quantity
//   let newPricePerUnit;
//   let newTotalPrice;
//   const currentQuantity = existingItem.Quantity;
//   const newQuantity = currentQuantity + 1;
  
//   if (gotOfferPrice) {
//     // This product got the offer price (it's the first offer item in cart)
//     if (currentQuantity === 1 && newQuantity === 2) {
//       // Adding second item: first at offer price, second at regular price
//       // Total = offerPrice + regularPrice, average price changes
//       newPricePerUnit = regularPrice; // Display price per unit becomes regular for UI
//       newTotalPrice = offerPriceValue + regularPrice;
//     } else if (currentQuantity >= 2) {
//       // Already have offer + regular items, adding another regular item
//       newPricePerUnit = regularPrice;
//       newTotalPrice = existingItem.totalPrice + regularPrice;
//     } else {
//       // Should not happen, but fallback
//       newPricePerUnit = regularPrice;
//       newTotalPrice = offerPriceValue + (regularPrice * (newQuantity - 1));
//     }
//   } else {
//     // No offer applied to this product, all at regular price
//     newPricePerUnit = regularPrice;
//     newTotalPrice = regularPrice * newQuantity;
//   }
  
//   if (newQuantity <= maxStock) {
//     const updatedCart = Carts.map((cartItem) => {
//       if (
//         cartItem.foodItemId === foodItemId &&
//         cartItem.deliveryDate === selectedDateISO &&
//         cartItem.session === selectedSession
//       ) {
//         return {
//           ...cartItem,
//           Quantity: newQuantity,
//           price: newPricePerUnit,
//           totalPrice: newTotalPrice,
//         };
//       }
//       return cartItem;
//     });
    
//     updateCartData(updatedCart);
//   } else {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `No more stock available!`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   }
// };

const increaseQuantity = (foodItemId, offerData, item, matchedLocation) => {
  const maxStock = matchedLocation?.Remainingstock || 0;
  
  // Convert selected date to YYYY-MM-DD format (new cartHelper format)
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.getDate()).padStart(2, "0");
  const selectedDateStr = `${year}-${month}-${day}`;
  const sessionLower = selectedSession.toLowerCase();
  const slotKey = `${selectedDateStr}|${sessionLower}`;
  
  // Find the existing cart item
  const existingItem = Carts.find(
    (cartItem) =>
      cartItem._id === foodItemId &&
      cartItem.deliveryDate === selectedDateStr &&
      cartItem.session === sessionLower
  );
  
  if (!existingItem) return;
  
  const currentQuantity = existingItem.quantity;
  const newQuantity = currentQuantity + 1;
  
  // Check cutoff before increasing
  if (!cutoffValidation.allowed) {
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "info",
      title: cutoffValidation.message || `Cannot increase quantity. Orders are closed for ${selectedSession}.`,
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
  
  // Check stock
  if (newQuantity > maxStock) {
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "info",
      title: `No more stock available! Only ${maxStock} left.`,
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
  
  // Get product prices
  const regularPrice = existingItem.regularPrice || existingItem.hubPrice || matchedLocation?.hubPrice || 115;
  const offerPrice = existingItem.offerPrice;
  const gotOfferPrice = existingItem.offerApplied === true;
  
  // Calculate new prices based on offer status
  let newPricePerUnit;
  let newTotalPrice;
  let newOfferApplied = gotOfferPrice;
  let newOfferSavings = 0;
  
  if (gotOfferPrice && offerPrice) {
    // This product got the offer price (it's the first offer item in cart)
    if (currentQuantity === 1 && newQuantity === 2) {
      // Adding second item: first at offer price, second at regular price
      // Total = offerPrice + regularPrice
      newPricePerUnit = regularPrice; // Display price per unit becomes regular for UI
      newTotalPrice = offerPrice + regularPrice;
      newOfferSavings = (regularPrice * 2) - newTotalPrice;
    } else if (currentQuantity >= 2) {
      // Already have offer + regular items, adding another regular item
      newPricePerUnit = regularPrice;
      newTotalPrice = existingItem.totalPrice + regularPrice;
      newOfferSavings = (regularPrice * newQuantity) - newTotalPrice;
    } else {
      // Fallback for edge cases
      newTotalPrice = offerPrice + (regularPrice * (newQuantity - 1));
      newPricePerUnit = regularPrice;
      newOfferSavings = (regularPrice * newQuantity) - newTotalPrice;
    }
  } else {
    // No offer applied to this product, all at regular price
    newPricePerUnit = regularPrice;
    newTotalPrice = regularPrice * newQuantity;
    newOfferApplied = false;
  }
  
  // Update the cart
  const updatedCart = Carts.map((cartItem) => {
    if (
      cartItem._id === foodItemId &&
      cartItem.deliveryDate === selectedDateStr &&
      cartItem.session === sessionLower
    ) {
      return {
        ...cartItem,
        quantity: newQuantity,
        price: newPricePerUnit,
        totalPrice: newTotalPrice,
        offerApplied: newOfferApplied,
        offerSavings: newOfferSavings,
        // Preserve offer fields
        offerProduct: cartItem.offerProduct,
        offerPrice: cartItem.offerPrice,
        regularPrice: cartItem.regularPrice,
      };
    }
    return cartItem;
  });
  
  updateCartData(updatedCart);
  
  // Optional: Show toast when adding second item with offer
  if (gotOfferPrice && currentQuantity === 1 && newQuantity === 2) {
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "info",
      title: `Second item added at ₹${regularPrice}`,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      customClass: {
        popup: "me-small-toast",
        title: "me-small-toast-title",
      },
    });
  }
};

  const [show, setShow] = useState(true);
  const [expiryDays, setExpiryDays] = useState(0);

// ============ Decrease quantity with offer logic (FIXED) ============
// const decreaseQuantity = (foodItemId, offerData, matchedLocation) => {
//   const selectedDateISO = selectedDate.toISOString();
  
//   const existingItem = Carts.find(
//     (cartItem) =>
//       cartItem.foodItemId === foodItemId &&
//       cartItem.deliveryDate === selectedDateISO &&
//       cartItem.session === selectedSession
//   );
  
//   if (!existingItem) return;
  
//   const gotOfferPrice = existingItem.offerApplied === true;
//   const regularPrice = existingItem.regularPrice || existingItem.hubPrice || matchedLocation?.hubPrice || 115;
//   const offerPriceValue = existingItem.offerPrice;
//   const currentQuantity = existingItem.Quantity;
//   const newQuantity = currentQuantity - 1;
  
//   if (newQuantity === 0) {
//     // Remove item completely
//     const updatedCart = Carts.filter(
//       (item) =>
//         !(item.foodItemId === foodItemId &&
//           item.deliveryDate === selectedDateISO &&
//           item.session === selectedSession)
//     );
//     updateCartData(updatedCart);
//     return;
//   }
  
//   let newPricePerUnit;
//   let newTotalPrice;
  
//   if (gotOfferPrice) {
//     if (newQuantity === 1) {
//       // Going back to just the offer item
//       newPricePerUnit = offerPriceValue;
//       newTotalPrice = offerPriceValue;
//     } else if (newQuantity > 1) {
//       // Still have offer + regular items
//       // Total = offerPrice + (regularPrice * (newQuantity - 1))
//       newPricePerUnit = regularPrice;
//       newTotalPrice = offerPriceValue + (regularPrice * (newQuantity - 1));
//     } else {
//       newPricePerUnit = regularPrice;
//       newTotalPrice = regularPrice * newQuantity;
//     }
//   } else {
//     // No offer, all regular
//     newPricePerUnit = regularPrice;
//     newTotalPrice = regularPrice * newQuantity;
//   }
  
//   const updatedCart = Carts.map((cartItem) => {
//     if (
//       cartItem.foodItemId === foodItemId &&
//       cartItem.deliveryDate === selectedDateISO &&
//       cartItem.session === selectedSession
//     ) {
//       return {
//         ...cartItem,
//         Quantity: newQuantity,
//         price: newPricePerUnit,
//         totalPrice: newTotalPrice,
//       };
//     }
//     return cartItem;
//   });
  
//   updateCartData(updatedCart);
// };

const decreaseQuantity = (foodItemId, offerData, matchedLocation) => {
  // Convert selected date to YYYY-MM-DD format (new cartHelper format)
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.getDate()).padStart(2, "0");
  const selectedDateStr = `${year}-${month}-${day}`;
  const sessionLower = selectedSession.toLowerCase();
  
  // Find the existing cart item
  const existingItem = Carts.find(
    (cartItem) =>
      cartItem._id === foodItemId &&
      cartItem.deliveryDate === selectedDateStr &&
      cartItem.session === sessionLower
  );
  
  if (!existingItem) return;
  
  const currentQuantity = existingItem.quantity;
  const newQuantity = currentQuantity - 1;
  
  // Check cutoff before decreasing
  if (!cutoffValidation.allowed) {
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "info",
      title: cutoffValidation.message || `Cannot decrease quantity. Orders are closed for ${selectedSession}.`,
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
  
  // If quantity becomes 0, remove the item completely
  if (newQuantity <= 0) {
    const updatedCart = Carts.filter(
      (cartItem) =>
        !(
          cartItem._id === foodItemId &&
          cartItem.deliveryDate === selectedDateStr &&
          cartItem.session === sessionLower
        )
    );
    updateCartData(updatedCart);
    return;
  }
  
  // Get product prices
  const regularPrice = existingItem.regularPrice || existingItem.hubPrice || matchedLocation?.hubPrice || 115;
  const offerPrice = existingItem.offerPrice;
  const gotOfferPrice = existingItem.offerApplied === true;
  
  // Calculate new prices based on offer status
  let newPricePerUnit;
  let newTotalPrice;
  let newOfferApplied = gotOfferPrice;
  let newOfferSavings = 0;
  
  if (gotOfferPrice && offerPrice) {
    // This product got the offer price
    if (currentQuantity === 2 && newQuantity === 1) {
      // Removing the second item (regular price item), only offer item remains
      newPricePerUnit = offerPrice;
      newTotalPrice = offerPrice;
      newOfferSavings = regularPrice - offerPrice;
    } 
    else if (currentQuantity > 2 && newQuantity >= 2) {
      // Removing a regular price item (still have offer + regular items)
      // Total = offerPrice + (regularPrice * (newQuantity - 1))
      newTotalPrice = offerPrice + (regularPrice * (newQuantity - 1));
      newPricePerUnit = regularPrice;
      newOfferSavings = (regularPrice * newQuantity) - newTotalPrice;
    } 
    else if (currentQuantity === 1) {
      // This shouldn't happen since newQuantity would be 0 and already handled
      newPricePerUnit = offerPrice;
      newTotalPrice = offerPrice;
      newOfferSavings = regularPrice - offerPrice;
    }
    else {
      // Fallback for edge cases
      newTotalPrice = offerPrice + (regularPrice * (newQuantity - 1));
      newPricePerUnit = regularPrice;
      newOfferSavings = (regularPrice * newQuantity) - newTotalPrice;
    }
  } else {
    // No offer applied, all at regular price
    newPricePerUnit = regularPrice;
    newTotalPrice = regularPrice * newQuantity;
    newOfferApplied = false;
    newOfferSavings = 0;
  }
  
  // Update the cart
  const updatedCart = Carts.map((cartItem) => {
    if (
      cartItem._id === foodItemId &&
      cartItem.deliveryDate === selectedDateStr &&
      cartItem.session === sessionLower
    ) {
      return {
        ...cartItem,
        quantity: newQuantity,
        price: newPricePerUnit,
        totalPrice: newTotalPrice,
        offerApplied: newOfferApplied,
        offerSavings: newOfferSavings,
        // Preserve offer fields
        offerProduct: cartItem.offerProduct,
        offerPrice: cartItem.offerPrice,
        regularPrice: cartItem.regularPrice,
      };
    }
    return cartItem;
  });
  
  updateCartData(updatedCart);
};

  const isAddressReady = () => {
    const addresstype1 = localStorage.getItem("addresstype");
    if (!addresstype1) return false;

    const addressKey =
      addresstype1 === "apartment" ? "address" : "coporateaddress";
    const addressRaw = localStorage.getItem(addressKey);

    if (!addressRaw) return false;

    try {
      const address1 = JSON.parse(addressRaw);
      if (!address1) return false;

      const apartmentname =
        address1?.apartmentname || address1?.Apartmentname || "";
      const addressField = address1?.Address || address1?.address || "";
      const pincode = address1?.pincode || "";

      return apartmentname && addressField && pincode;
    } catch (error) {
      return false;
    }
  };

  // This useEffect now calls getAllOffer which is defined above
  useEffect(() => {
    if (Carts?.length > 0) {
      handleShow();
    }
    if (user?._id) {
      getAllOffer();
    } else {
      getAllOffer(); // Still fetch for non-logged in users (shows public offers)
    }
  }, [user?._id]);

  const groupedCarts = useMemo(() => {
    if (!Carts || Carts.length === 0) return [];
    const groups = Carts.reduce((acc, item) => {
      const key = `${item.deliveryDate}|${item.session}`;

      if (!item.deliveryDate || !item.session) return acc;

      if (!acc[key]) {
        acc[key] = {
          session: item.session,
          date: new Date(item.deliveryDate),
          totalItems: 0,
          subtotal: 0,
          items: [],
        };
      }

      acc[key].totalItems += item.Quantity;
      acc[key].subtotal += item.price * item.Quantity;
      acc[key].items.push(item);

      return acc;
    }, {});

    return Object.values(groups).sort((a, b) => a.date - b.date);
  }, [Carts]);

  const overallTotalItems = useMemo(() => {
    return groupedCarts.reduce((acc, slot) => acc + slot.totalItems, 0);
  }, [groupedCarts]);

  const overallSubtotal = useMemo(() => {
    return groupedCarts.reduce((acc, slot) => acc + slot.subtotal, 0);
  }, [groupedCarts]);

  const [deliveryCharge, setDeliveryCharge] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);

  const getDeliveryRates = async () => {
    try {
      const res = await axios.get("http://localhost:7013/api/deliveryrate/all");
      setDeliveryCharge(res.data.data);
      setFilteredRates(res.data.data);
    } catch (error) {
      console.error("Error fetching delivery rates:", error);
    }
  };

  const findDeliveryRate = (hubId, acquisitionChannel, status) => {
    if (!deliveryCharge || deliveryCharge.length === 0) {
      return 15;
    }

    const matchedRate = deliveryCharge.find(
      (rate) =>
        rate.hubId === hubId &&
        rate.acquisition_channel === acquisitionChannel &&
        rate.status === status,
    );

    return matchedRate?.deliveryRate || 15;
  };

  const isEmployeeForDelivery = user?.status === "Employee";
  const acquisitionChannelForDelivery = isEmployeeForDelivery
    ? "employee"
    : user?.acquisition_channel || "organic";
  const userStatus = user?.status;
  const hubId = address?.hubId;
  const deliveryRate = findDeliveryRate(
    hubId,
    acquisitionChannelForDelivery,
    userStatus,
  );

// const proceedToPlan = async () => {
//   // 1. Check if user is logged in
//   if (!user) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Please Login!`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   // 2. Check if cart has items
//   if (Carts.length === 0) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Your cart is empty!`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   // 3. Check if address is selected
//   if (!address) {
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "info",
//       title: `Please Select Address!`,
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//     return;
//   }

//   setloader(true);
  
//   try {
//     // 4. Prepare address details
//     const addressDetails = {
//       addressId: address._id || "",
//       addressline: `${address.fullAddress || address.address || ""}`,
//       addressType: address.addressType || "",
//       coordinates: address.location?.coordinates || [0, 0],
//       hubId: address.hubId || "",
//       hubName: address.hubName || address.name || "",
//       studentInformation: address.studentInformation || null,
//       schoolName: address.schoolName || "",
//       houseName: address.houseName || "",
//       apartmentName: address.apartmentName || address.apartmentname || "",
//       companyName: address.companyName || "",
//       companyId: address.companyId || user?.companyId || "",
//       customerType: user?.status || "Normal",
//     };

//     // 5. Transform cart items with OFFER PRESERVATION
//     const itemsWithOfferInfo = Carts.map((item) => {
//       // Get the base values
//       const quantity = item.Quantity || 1;
//       const basePrice = item.basePrice || 0;
//       const hubPrice = item.hubPrice || item.actualPrice || 0;
//       const preOrderPrice = item.preOrderPrice || 0;
      
//       // OFFER FIELDS - Preserve from cart
//       const offerProduct = item.offerProduct || false;
//       const offerApplied = item.offerApplied || false;
//       const offerPrice = item.offerPrice || null;
//       const regularPrice = item.regularPrice || hubPrice;
      
//       // The price per unit (after offer calculation)
//       const pricePerUnit = item.price || (offerApplied && offerPrice ? regularPrice : hubPrice);
      
//       // The total price for all quantities (already calculated with offer logic in cart)
//       const totalPrice = item.totalPrice || (pricePerUnit * quantity);

//       return {
//         // Basic item info
//         foodItemId: item.foodItemId,
//         foodname: item.foodname,
//         image: item.image || "",
//         foodcategory: item.foodcategory || "",
//         unit: item.unit || "portion",
//         gst: item.gst || 0,
//         discount: item.discount || 0,
        
//         // Slot info
//         deliveryDate: item.deliveryDate,
//         session: item.session,
//         slotKey: item.slotKey || `${item.deliveryDate}|${item.session}`,
        
//         // Quantity
//         Quantity: quantity,
//         remainingstock: item.remainingstock || 0,
        
//         // Pricing - Base
//         basePrice: basePrice,
//         actualPrice: item.actualPrice || hubPrice,
//         hubPrice: hubPrice,
//         preOrderPrice: preOrderPrice,
        
//         // OFFER FIELDS - Critical for preserving offer logic in backend
//         offerProduct: offerProduct,
//         offerApplied: offerApplied,
//         offerPrice: offerPrice,
//         regularPrice: regularPrice,
        
//         // Calculated prices
//         price: pricePerUnit,           // Per unit price after offer
//         totalPrice: totalPrice,         // Total for all quantities
        
//         // Additional offer info
//         minCart: item.minCart || 0,
//         offerQ: item.offerQ || 1,
//         customerType: item.customerType || null,
//       };
//     });

//     // 6. Log for debugging (optional)
//     console.log("📦 Proceeding to Plan with items:", itemsWithOfferInfo);
//     console.log("📍 Address Details:", addressDetails);
    
//     // Count items with offers applied
//     const offerItemsCount = itemsWithOfferInfo.filter(item => item.offerApplied).length;
//     if (offerItemsCount > 0) {
//       console.log(`🎁 ${offerItemsCount} item(s) with offer applied being sent to backend`);
//     }

//     // 7. Get delivery rate
//     const isEmployeeForDelivery = user?.status === "Employee";
//     const acquisitionChannelForDelivery = isEmployeeForDelivery
//       ? "employee"
//       : user?.acquisition_channel || "organic";
//     const userStatus = user?.status;
//     const hubId = address?.hubId;
    
//     const deliveryRate = findDeliveryRate(
//       hubId,
//       acquisitionChannelForDelivery,
//       userStatus,
//     );

//     // 8. Make API call to add to plan
//     const res = await axios.post(
//       "http://localhost:7013/api/user/plan/add-to-plan",
//       {
//         userId: user._id,
//         mobile: user.Mobile,
//         username: user.Fname,
//         companyId: user?.companyId || "",
//         items: itemsWithOfferInfo,
//         addressDetails: addressDetails,
//         deliveryCharge: deliveryRate,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // 9. Handle success
//     if (res.status === 200) {
//       console.log("✅ Items added to My Plan successfully");
      
//       // Clear cart from localStorage and state
//       localStorage.removeItem("cart");
//       setCarts([]);
//       setCart([]);
      
//       // Reset applied offer for slot
//       setAppliedOfferForSlot(null);
      
//       // Show success message
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "success",
//         title: `Items added to My Plan!`,
//         showConfirmButton: false,
//         timer: 2000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
      
//       // Navigate to My Plan page
//       navigate("/my-plan");
      
//       // Dispatch cart updated event
//       window.dispatchEvent(new Event("cart_updated"));
//     }
//   } catch (error) {
//     // 10. Handle errors
//     console.error("❌ proceedToPlan - Error:", error);
//     console.error("Error details:", error.response?.data || error.message);
    
//     let errorMessage = "Something went wrong. Please try again.";
    
//     if (error.response?.data?.error) {
//       errorMessage = error.response.data.error;
//     } else if (error.response?.data?.message) {
//       errorMessage = error.response.data.message;
//     } else if (error.message) {
//       errorMessage = error.message;
//     }
    
//     Swal2.fire({
//       toast: true,
//       position: "bottom",
//       icon: "error",
//       title: errorMessage,
//       showConfirmButton: false,
//       timer: 4000,
//       timerProgressBar: true,
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   } finally {
//     setloader(false);
//   }
// };

  const proceedToCheckout = () => {
    // Validate: User logged in
    if (!user) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Please Login!`,
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

    // Validate: Cart not empty
    if (Carts.length === 0) {
      return;
    }

    // Validate: Address selected
    if (!address) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Please Select Address!`,
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

    // All validations passed - navigate to checkout
    navigate("/checkout-multiple");
  };

  // Legacy alias for backwards compatibility (if used elsewhere)
  const proceedToPlan = proceedToCheckout;

  // Time check effect
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentTimeInMinutes = 10 * 60 + now.getMinutes();
      const lunchStart = 7 * 60;
      const lunchPrepStart = 9 * 60;
      const lunchCookingStart = 11 * 60;
      const lunchEnd = 14 * 60;

      const dinnerStart = 14 * 60;
      const dinnerPrepStart = 16 * 60 + 30;
      const dinnerCookingStart = 18 * 60;
      const dinnerEnd = 21 * 60;

      const shopCloseTime = 21 * 60;

      if (
        currentTimeInMinutes >= lunchStart &&
        currentTimeInMinutes < lunchPrepStart
      ) {
        setGifUrl("sourcing.gif");
        setMessage(
          "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
        );
      } else if (
        currentTimeInMinutes >= lunchPrepStart &&
        currentTimeInMinutes < lunchCookingStart
      ) {
        setGifUrl("cuttingveg.gif");
        setMessage(
          "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
        );
      } else if (
        currentTimeInMinutes >= lunchCookingStart &&
        currentTimeInMinutes < lunchEnd
      ) {
        setGifUrl("cookinggif.gif");
        setMessage(
          "Cooking your meal. Orders placed now will be delivered at your selected slot.",
        );
      } else if (
        currentTimeInMinutes >= dinnerStart &&
        currentTimeInMinutes < dinnerPrepStart
      ) {
        setGifUrl("sourcing.gif");
        setMessage(
          "Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.",
        );
      } else if (
        currentTimeInMinutes >= dinnerPrepStart &&
        currentTimeInMinutes < dinnerCookingStart
      ) {
        setGifUrl("cuttingveg.gif");
        setMessage(
          "Preparing ingredients. Orders placed now will be delivered at your selected slot.",
        );
      } else if (
        currentTimeInMinutes >= dinnerCookingStart &&
        currentTimeInMinutes <= dinnerEnd
      ) {
        setGifUrl("cookinggif.gif");
        setMessage(
          "Cooking your meal. Orders placed now will be delivered at your selected slot.",
        );
      } else if (currentTimeInMinutes >= shopCloseTime) {
        setGifUrl("Closed.gif");
        setMessage(
          "The Store is now closed. Operating hours: Lunch: 7:00 AM - 02:00 PM, Dinner: 2:00 PM - 9:00 PM.",
        );
      } else {
        setGifUrl("Closed.gif");
        setMessage(
          "Orders are currently closed. Lunch: 7:00 AM - 02:00 PM. Dinner: 2:00 PM - 9:00 PM.",
        );
      }
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const [Fname, setFname] = useState("");
  const [Mobile, setMobile] = useState("");
  const [OTP, setOTP] = useState(["", "", "", ""]);
  const [PasswordShow, setPasswordShow] = useState(false);

  const userLogin = async () => {
    if (!Mobile) {
      return Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Enter Your Mobile Number`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
    setloader(true);
    try {
      const config = {
        url: "/User/Sendotp",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "content-type": "application/json" },
        data: { Mobile: Mobile },
      };

      const res = await axios(config);
      if (res.status === 401) {
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Invalid Mobile Number`,
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
          title: `Something went wrong`,
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
        setloader(false);
        handleClose3();
        handleShow2();
      }
    } catch (error) {
      setloader(false);
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: error.response.data.error || `Something went wrong!`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
  };

  function validateIndianMobileNumber(mobileNumber) {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(mobileNumber);
  }

  const verifyOTP = async () => {
    try {
      if (!OTP) {
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Enter a valid OTP`,
          showConfirmButton: false,
          timer: 3000,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      const config = {
        url: "User/mobileotpverification",
        method: "post",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
        data: { Mobile: Mobile, otp: OTP },
      };
      const res = await axios(config);
      if (res.status === 200) {
        updateUser(res.data.details);
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "success",
          title: `OTP verified successfully`,
          showConfirmButton: false,
          timer: 3000,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });

        if (!address) {
          handleClose2();
          handleClose3();
          return navigate("/");
        }
        navigate("/");
        handleClose2();
        setOTP("");
        setMobile("");
      }
    } catch (error) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: error.response.data.error || `Something went wrong!`,
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
  };

//   const getCartQuantity = (itemId) => {
//     const selectedDateISO = selectedDate.toISOString();
//     return Carts?.filter(
//       (cartItem) =>
//         cartItem?.foodItemId === itemId &&
//         cartItem.deliveryDate === selectedDateISO &&
//         cartItem.session === selectedSession,
//     )?.reduce((total, curr) => total + curr?.Quantity, 0);
//   };

const getCartQuantity = (itemId) => {
  // Convert selected date to YYYY-MM-DD format
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.getDate()).padStart(2, "0");
  const selectedDateStr = `${year}-${month}-${day}`;
  const sessionLower = selectedSession.toLowerCase();
  
  // Filter cart items for this specific item and slot
  const matchingItems = Carts?.filter(
    (cartItem) =>
      (cartItem?._id === itemId || cartItem?.foodItemId === itemId) &&
      cartItem.deliveryDate === selectedDateStr &&
      cartItem.session === sessionLower
  );
  
  // Calculate total quantity
  const totalQuantity = matchingItems?.reduce(
    (total, curr) => total + (curr?.quantity || curr?.Quantity || 0), 
    0
  );
  
  console.log(`getCartQuantity for ${itemId}:`, { 
    selectedDateStr, 
    sessionLower, 
    matchingItems, 
    totalQuantity 
  });
  
  return totalQuantity || 0;
};

// Add this to your Home component (you already have validateCutoffTiming function)
useEffect(() => {
  const checkCutoffForDisplay = async () => {
    if (address?.hubId && selectedDate && selectedSession) {
      const isAllowed = await validateCutoffTiming(
        address.hubId,
        selectedSession,
        selectedDate
      );
      // validateCutoffTiming already updates cutoffValidation state
      console.log(`Order ${isAllowed ? 'allowed' : 'not allowed'} for ${selectedSession}:`, cutoffValidation.message);
    }
  };
  
  checkCutoffForDisplay();
}, [address?.hubId, selectedDate, selectedSession]);

  // Automatically remove today's Lunch/Dinner cart items after cutoff times
  useEffect(() => {
    if (!Carts || !setCarts) return;
    const toKey = (date) => new Date(date).toISOString().slice(0, 10);
    const cleanup = () => {
      const now = new Date();
      const todayKey = toKey(now);
      let removed = [];
      const shouldRemove = (item) => {
        if (!item) return false;
        const dateVal =
          item.deliveryDate ||
          item.date ||
          item.slotDate ||
          item.deliveryDateString;
        const sessionVal = (
          item.session ||
          item.slotSession ||
          item.mealSession ||
          ""
        ).toString();
        if (!dateVal || !sessionVal) return false;
        const itemKey = toKey(dateVal);
        if (itemKey !== todayKey) return false;
        return !isBeforeCutoff(dateVal, sessionVal);
      };
      const newCarts = [];
      Carts.forEach((it) => {
        if (shouldRemove(it)) {
          removed.push(it);
        } else {
          newCarts.push(it);
        }
      });
      if (removed.length > 0) {
        setCarts(newCarts);
      }
    };
    cleanup();
    const id = setInterval(cleanup, 60 * 5000);
    return () => clearInterval(id);
  }, [Carts, setCarts]);

  const lastCartRawRef = useRef(null);
  useEffect(() => {
    const readCart = () => {
      try {
        const raw = localStorage.getItem("cart") || "[]";
        if (raw !== lastCartRawRef.current) {
          lastCartRawRef.current = raw;
          const parsed = JSON.parse(raw);
          setCarts(Array.isArray(parsed) ? parsed : []);
          setCart(Array.isArray(parsed) ? parsed : []);
        }
      } catch (err) {
        console.error("cart sync error", err);
      }
    };

    readCart();
    const intervalId = setInterval(readCart, 1000);
    const onStorage = (e) => {
      if (e.key === "cart") readCart();
    };
    const onCartUpdated = () => readCart();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart_updated", onCartUpdated);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart_updated", onCartUpdated);
    };
  }, [setCarts]);

  // Clean up any leftover flags
  useEffect(() => {
    localStorage.removeItem("triggerProceedToPlan");
    sessionStorage.removeItem("justAddedAddress");
  }, []);

  // Compute showOffer safely with customerType filtering
  const showOffer = useMemo(() => {
    if (!AllOffer?.length) return false;
    try {
      const primaryAddressStr = localStorage.getItem("primaryAddress");
      const primaryAddress = primaryAddressStr
        ? JSON.parse(primaryAddressStr)
        : null;
      const isEmployeeForOffer = user?.status === "Employee";
      const acquisitionChannelForOffer = isEmployeeForOffer
        ? "employee"
        : user?.acquisition_channel || "organic";
      
      // Find an offer that the customer is eligible for
      const eligibleOffer = AllOffer.find(offer => {
        const hubMatches = offer?.hubId === primaryAddress?.hubId;
        const acquisitionChannelMatch = offer?.acquisition_channel === acquisitionChannelForOffer;
        
        if (!hubMatches || !acquisitionChannelMatch) return false;
        
        // Check if any product in this offer is eligible for the customer
        return offer.products.some(product => {
          const customerOrderCount = findNumberofOrders();
          return doesCustomerQualifyForOffer(customerOrderCount, product.customerType);
        });
      });
      
      return !!eligibleOffer;
    } catch (error) {
      console.error("Error parsing primaryAddress for offer:", error);
      return false;
    }
  }, [AllOffer, user?.status, totalOrder]);

  // ============ Helper to check if product has offer with customerType validation ============
  const getProductOffer = (item) => {
    try {
      const primaryAddressJson = localStorage.getItem("primaryAddress");
      if (!primaryAddressJson || !AllOffer?.length) return null;
      
      const primaryAddress = JSON.parse(primaryAddressJson);
      const isEmployeeForOffer = user?.status === "Employee";
      const acquisitionChannelForOffer = isEmployeeForOffer
        ? "employee"
        : user?.acquisition_channel || "organic";
      
      // Get customer's total order count
      const customerOrderCount = findNumberofOrders();
      
      // Check if any offer is already applied in cart
      const hasOfferInCart = isOfferAlreadyAppliedInCart();
      
      // Find valid offers for this product
      for (const offer of AllOffer) {
        const hubMatches = offer?.hubId === primaryAddress?.hubId;
        const acquisitionChannelMatch = offer?.acquisition_channel === acquisitionChannelForOffer;
        const offerStartDate = new Date(offer?.startDate);
        const offerEndDate = new Date(offer?.endDate);
        const deliverydate = new Date(item.deliveryDate);
        const isWithinDateRange = deliverydate >= offerStartDate && deliverydate <= offerEndDate;
        
        if (hubMatches && isWithinDateRange && acquisitionChannelMatch) {
          const matchingProduct = offer.products?.find(
            (product) => product?.foodItemId?.toString() === item?._id?.toString()
          );
          
          if (matchingProduct) {
            // Check if customer qualifies based on order count
            const customerQualifies = doesCustomerQualifyForOffer(
              customerOrderCount,
              matchingProduct.customerType
            );
            
            if (!customerQualifies) {
              return null; // Customer doesn't qualify for this offer
            }
            
            // If an offer is already applied in cart, don't show offer price for other products
            if (hasOfferInCart) {
              return { ...matchingProduct, isBlocked: true };
            }
            return matchingProduct;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting product offer:", error);
      return null;
    }
  };


// Replace your existing cutoff validation useEffect with this:
useEffect(() => {
  let isMounted = true;
  let timeoutId;
  
  const fetchCutoffForDate = async () => {
    if (!address?.hubId || !selectedDate || !selectedSession) return;
    
    // Don't fetch if already loading
    if (cutoffLoading) return;
    
    try {
      const status = user?.status === "Employee" ? "Employee" : "Normal";
      
      const response = await axios.post(
        "http://localhost:7013/api/Hub/validate-order-timing",
        {
          hubId: address.hubId,
          session: selectedSession.toLowerCase(),
          status: status,
          deliveryDate: selectedDate instanceof Date ? selectedDate.toISOString() : selectedDate,
        }
      );
      
      if (isMounted && response.status === 200) {
        setCutoffValidation({
          allowed: response.data.allowed,
          message: response.data.message,
          cutoffDateTime: response.data.cutoffDateTime,
          nextAvailableDateTime: response.data.nextAvailableDateTime,
        });
      }
    } catch (error) {
      console.error("Error validating cutoff timing:", error);
    }
  };
  
  // Debounce the API call
  timeoutId = setTimeout(() => {
    fetchCutoffForDate();
  }, 500);
  
  return () => {
    isMounted = false;
    if (timeoutId) clearTimeout(timeoutId);
  };
}, [address?.hubId, selectedDate, selectedSession, user?.status]);

  return (
    <div>
      <ToastContainer />

      <div>
   
        <Banner
          Carts={Carts}
          getAllOffer={getAllOffer}
          isVegOnly={isVegOnly}
          setIsVegOnly={setIsVegOnly}
          onLocationDetected={handleLocationDetected}
        />
    
      </div>

        {/* Cutoff Status Card - Show after Banner */}
    {address?.hubId && selectedDate && selectedSession && (
      <CutoffStatusCard
        selectedDate={selectedDate}
        selectedSession={selectedSession}
        userStatus={user?.status}
        cutoffValidation={cutoffValidation}
        cutoffLoading={cutoffLoading}
      />
    )}

      {wallet?.balance > 0 && show && (
        <div style={{ position: "relative" }}>
          {user && !address && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#f9f8f6",
                opacity: 1,
                zIndex: 20,
                pointerEvents: "auto",
              }}
            ></div>
          )}

          <CoinBalance
            wallet={wallet}
            transactions={transactions}
            expiryDays={expiryDays}
            setExpiryDays={setExpiryDays}
            setShow={setShow}
          />
        </div>
      )}

      <div className="sticky-menu-header" style={{ position: "relative" }}>
        <div style={{ position: "relative" }}>
          {user && !address && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
                pointerEvents: "none",
                opacity: 0.8,
              }}
            ></div>
          )}
          <DateSessionSelector
            onChange={handleSelectionChange}
            currentDate={selectedDate}
            currentSession={selectedSession}
            menuData={allHubMenuData}
          />
        </div>
      </div>

      <div style={{ position: "relative" }}>
        {user && !address && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              pointerEvents: "none",
              opacity: 0.8,
            }}
          ></div>
        )}
        <Container>
          <RatingModal />

          {/* {showOffer && AllOffer.length > 0 && AllOffer[0]?.products?.length > 0 && (
            <div className="maincontainer">
              <div
                className="d-flex gap-3 mb-2 messageDiv rounded-2 mt-3 justify-content-center"
                style={{
                  backgroundColor: "white",
                  padding: "5px",
                  height: "auto",
                  minHeight: "50px",
                }}
              >
                <p
                  className="mb-0 typewriter-desc"
                  style={{
                    color: "#6B8E23",
                    fontSize: "1rem",
                    textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
                    lineHeight: "1.6",
                    textAlign: "center",
                  }}
                >
                  {AllOffer[0]?.session === "Lunch" ? (
                    <>
                      Beat the afternoon hunger!{" "}
                      {AllOffer[0]?.products[0]?.foodname} at just ₹
                      {AllOffer[0]?.products[0]?.price} for Lunch!
                      {AllOffer[0]?.products[0]?.customerType === 0 && (
                        <span style={{ fontSize: "0.8rem", display: "block", color: "#d4a017" }}>
                          🎁 First order special offer! Only for new customers!
                        </span>
                      )}
                      {AllOffer[0]?.products[0]?.customerType === 1 && (
                        <span style={{ fontSize: "0.8rem", display: "block", color: "#d4a017" }}>
                          🎉 Welcome offer for customers with 0-1 orders!
                        </span>
                      )}
                      {AllOffer[0]?.products[0]?.customerType === 2 && (
                        <span style={{ fontSize: "0.8rem", display: "block", color: "#d4a017" }}>
                          ✨ Special offer for customers with 0-2 orders!
                        </span>
                      )}
                    </>
                  ) : AllOffer[0]?.session === "Dinner" ? (
                    <>
                      Make your evening special!{" "}
                      {AllOffer[0]?.products[0]?.foodname} at just ₹
                      {AllOffer[0]?.products[0]?.price} for Dinner!
                      {AllOffer[0]?.products[0]?.customerType === 0 && (
                        <span style={{ fontSize: "0.8rem", display: "block", color: "#d4a017" }}>
                          🎁 First order special offer! Only for new customers!
                        </span>
                      )}
                      {AllOffer[0]?.products[0]?.customerType === 1 && (
                        <span style={{ fontSize: "0.8rem", display: "block", color: "#d4a017" }}>
                          🎉 Welcome offer for customers with 0-1 orders!
                        </span>
                      )}
                      {AllOffer[0]?.products[0]?.customerType === 2 && (
                        <span style={{ fontSize: "0.8rem", display: "block", color: "#d4a017" }}>
                          ✨ Special offer for customers with 0-2 orders!
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      🥳 Limited time offer:{" "}
                      {AllOffer[0]?.products[0]?.foodname} at just ₹
                      {AllOffer[0]?.products[0]?.price}!
                      {AllOffer[0]?.products[0]?.customerType === 0 && (
                        <span style={{ fontSize: "0.8rem", display: "block", color: "#d4a017" }}>
                          🎁 First order special offer! Only for new customers!
                        </span>
                      )}
                    </>
                  )}
                  {user?._id && AllOffer[0]?.products[0]?.customerType !== undefined && (
                    <span style={{ fontSize: "0.7rem", display: "block", color: "#666" }}>
                      {getOfferEligibilityMessage(AllOffer[0]?.products[0]?.customerType)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )} */}

          {loader ? (
            <div
              className="d-flex justify-content-center align-item-center"
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 9999,
              }}
            >
              <div class="lds-ripple">
                <div></div>
                <div></div>
              </div>
            </div>
          ) : null}
        </Container>
      </div>

      <div style={{ position: "relative" }}>
        {user && !address && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              pointerEvents: "none",
              opacity: 0.2,
            }}
          ></div>
        )}
        <div className="maincontainer">
          <div className="mobile-product-box" style={{ marginBottom: "30px" }}>
            <div style={{ marginBottom: "20px" }}>
              <TabsComponent
                tabs={dynamicTabs}
                activeTab={selectedCategory}
                onTabClick={setSelectedCategory}
              />
            </div>

            <div className="d-flex gap-1 mb-2 flex-column">
              <div className="row">
                {finalDisplayItems?.map((item, i) => {
                  let matchedLocation = item.locationPrice?.[0];
                  
                  if (!matchedLocation) {
                    matchedLocation = {
                      Remainingstock: 0,
                      hubPrice: item.hubPrice || item.basePrice || 0,
                      preOrderPrice: item.preOrderPrice || 0,
                      basePrice: item.basePrice || 0,
                    };
                  }
                  
                  // Get product offer (will return null if customer doesn't qualify or offer already applied)
                  const productOffer = getProductOffer(item);
                  const hasOfferInCart = isOfferAlreadyAppliedInCart();
                  const showOfferPrice = productOffer && !hasOfferInCart && !productOffer.isBlocked;
                  
                  const { price: effectivePrice } = getEffectivePrice(
                    item,
                    matchedLocation,
                    item?.session,
                    true,
                  );
                  
                  // Check if item is in cart and get its total price
                  const selectedDateISO = selectedDate.toISOString();
                  
                  const cartItem = Carts.find(
                    (cartItem) =>
                      cartItem?.foodItemId === item?._id &&
                      cartItem.deliveryDate === selectedDateISO &&
                      cartItem.session === selectedSession
                  );
                  
                  // Determine display price
                  let displayPrice = effectivePrice;
                  let offerPrice = null;
                  
                  if (cartItem && typeof cartItem.totalPrice === 'number') {
                    // If item is in cart, display the total price for all items
                    displayPrice = Math.round(cartItem.totalPrice);
                    // For offer items with multiple quantities, show what it costs without the offer
                    if (cartItem.offerApplied && cartItem.Quantity > 1 && cartItem.regularPrice) {
                      offerPrice = Math.round(cartItem.regularPrice * cartItem.Quantity);
                    }
                  } else if (showOfferPrice && productOffer?.price) {
                    // Only show strikethrough for single items with offers not yet in cart
                    displayPrice = productOffer.price;
                    offerPrice = effectivePrice;
                  }

                  return (
                    <div
                      key={item._id?.toString() || i}
                      className="col-6 col-md-6 mb-2 d-flex justify-content-center"
                    >
                      <div className="mobl-product-card">
                        <div className="productborder">
                          <div className="prduct-box rounded-1 cardbx">
                            <div
                              onClick={() => showDrawer(item)}
                              className="imagebg"
                            >
                              {item?.foodcategory === "Veg" ? (
                                <img
                                  src={IsVeg}
                                  alt="IsVeg"
                                  className="isVegIcon"
                                />
                              ) : (
                                <img
                                  src={IsNonVeg}
                                  alt="IsNonVeg"
                                  className="isVegIcon"
                                />
                              )}
                              <img
                                src={`${item?.Foodgallery[0]?.image2}`}
                                alt=""
                                className="mbl-product-img"
                              />
                            </div>
                          </div>
                          {item?.foodTags && (
                            <div className="food-tag-container">
                              {item.foodTags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="food-tag-pill"
                                  style={{ backgroundColor: tag.tagColor }}
                                >
                                  <img
                                    src={chef}
                                    alt=""
                                    style={{
                                      width: "10px",
                                      height: "10px",
                                      marginRight: "2px",
                                    }}
                                  />
                                  {tag.tagName}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="food-name-container">
                            <p className="food-name">{item?.foodname}</p>
                            <small className="food-unit">{item?.unit}</small>
                          </div>

                          <div
                            className="d-flex align-items-center mb-3"
                            style={{ gap: "8px", flexWrap: "nowrap" }}
                          >
                            {offerPrice && (
                              <div
                                className="align-items-start"
                                style={{
                                  textDecoration: "line-through",
                                  color: "#6b6b6b",
                                  fontSize: "15px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                  display: "flex",
                                  gap: "2px",
                                  marginLeft: "7px",
                                }}
                              >
                                <span className="fw-normal">₹</span>
                                <span>{offerPrice}</span>
                              </div>
                            )}

                            <div
                              className="align-items-start"
                              style={{
                                color: "#2c2c2c",
                                fontFamily: "Inter",
                                fontSize: "20px",
                                fontWeight: "500",
                                lineHeight: "25px",
                                letterSpacing: "-0.8px",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                display: "flex",
                                gap: "2px",
                              }}
                            >
                              <div
                                className="align-items-start"
                                style={{
                                  display: "flex",
                                  gap: "1px",
                                  marginLeft: "6px",
                                }}
                              >
                                <span className="fw-bold">₹</span>
                                <span>{displayPrice}</span>
                              </div>
                            </div>
                          </div>

                          {/* Show offer eligibility badge if applicable */}
                          {productOffer && productOffer.customerType !== undefined && !cartItem && (
                            <div style={{ marginBottom: "8px", marginLeft: "6px" }}>
                              <span style={{
                                fontSize: "10px",
                                backgroundColor: "#f0f0f0",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                color: "#666"
                              }}>
                                {productOffer.customerType === 0 ? "🎁 First Order Only" : 
                                 productOffer.customerType === 1 ? "🎉 Up to 1 Order" : 
                                 `✨ Up to ${productOffer.customerType} orders`}
                              </span>
                            </div>
                          )}

                          <div>
                            <div className="guaranteed-label">
                              <img
                                src={availabity}
                                alt=""
                                style={{ width: "11px", height: "11px" }}
                              />{" "}
                              Guaranteed Availability
                            </div>
                          </div>

                          <div className="d-flex justify-content-center mb-2">
                            {getCartQuantity(item?._id) === 0 ? (
                              address && gifUrl === "Closed.gif" ? (
                                <button
                                  className="add-to-cart-btn-disabled"
                                  disabled
                                >
                                  <span className="add-to-cart-btn-text">
                                    Add
                                  </span>
                                  <FaPlus className="add-to-cart-btn-icon" />
                                </button>
                              ) : (
                                <button
                                  className={`add-to-cart-btn ${(user && !address) || !cutoffValidation.allowed ? "disabled-btn" : ""}`}
                                  onClick={() =>
                                    addCart1(item, productOffer, matchedLocation)
                                  }
                                  disabled={
                                    (user && !address) ||
                                    !cutoffValidation.allowed
                                  }
                                >
                                  <div className="pick-btn-text">
                                    <span className="pick-btn-text1">PICK</span>
                                    <span className="pick-btn-text2">
                                      Confirm Later
                                    </span>
                                  </div>
                                  <span className="add-to-cart-btn-icon">
                                    <FaPlus />
                                  </span>
                                </button>
                              )
                            ) : getCartQuantity(item?._id) > 0 ? (
                              <button className="increaseBtn">
                                <div
                                  className="faplus"
                                  onClick={() =>
                                    !(user && !address) &&
                                    decreaseQuantity(
                                      item?._id,
                                      productOffer,
                                      matchedLocation,
                                    )
                                  }
                                  style={{
                                    opacity: user && !address ? 0.5 : 1,
                                    pointerEvents:
                                      user && !address ? "none" : "auto",
                                  }}
                                >
                                  <FaMinus />
                                </div>
                                <div className="faQuantity">
                                  {getCartQuantity(item?._id)}
                                </div>
                                <div
                                  className="faplus"
                                  onClick={() =>
                                    !(user && !address) &&
                                    increaseQuantity(
                                      item?._id,
                                      productOffer,
                                      item,
                                      matchedLocation,
                                    )
                                  }
                                  style={{
                                    opacity: user && !address ? 0.5 : 1,
                                    pointerEvents:
                                      user && !address ? "none" : "auto",
                                  }}
                                >
                                  <FaPlus />
                                </div>
                              </button>
                            ) : gifUrl === "Closed.gif" ? (
                              <button className="add-to-cart-btn" disabled>
                                <span className="add-to-cart-btn-text">
                                  Add
                                </span>
                                <span className="add-to-cart-btn-icon">
                                  <FaPlus />
                                </span>
                              </button>
                            ) : (
                              <button
                                className="add-to-cart-btn"
                                onClick={() =>
                                  addCart1(item, productOffer, matchedLocation)
                                }
                                disabled={user && !address}
                                style={{ opacity: user && !address ? 0.5 : 1 }}
                              >
                                <span className="add-to-cart-btn-text">
                                  Add
                                </span>
                                <span className="add-to-cart-btn-icon">
                                  <FaPlus />
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!loader && finalDisplayItems.length === 0 && (
                  <div className="col-12 text-center my-5">
                    {user &&
                    (!localStorage.getItem("primaryAddress") ||
                      localStorage.getItem("primaryAddress") === "null") ? (
                      <div>
                        <h4>No location selected.</h4>
                        <p>
                          Please add your location to view the menu for your
                          area.
                        </p>
                        <button
                          className="mt-2"
                          onClick={() => navigate("/location")}
                          style={{
                            backgroundColor: "#6B8E23",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            border: "none",
                          }}
                        >
                          Add Location
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4>No items available for this slot.</h4>
                        <p>
                          Please check back later or select a different day!
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <MultiCartDrawer
          proceedToPlan={proceedToPlan}
          groupedCarts={groupedCarts}
          overallSubtotal={overallSubtotal}
          overallTotalItems={overallTotalItems}
          onJumpToSlot={handleSelectionChange}
        />

        <Modal show={show3} backdrop="static" onHide={handleClose3}>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center gap-1">
              <FaLock color="#6B8E23" /> <span>Welcome to Dailydish</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className="login-whatsappwithicon">
                <FaSquareWhatsapp size={42} color="green" />
                <Form.Control
                  type="number"
                  placeholder="Enter Your WhatsApp Number"
                  value={Mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
              <Button
                variant=""
                style={{
                  width: "100%",
                  marginTop: "24px",
                  backgroundColor: "#6B8E23",
                  color: "white",
                  textAlign: "center",
                }}
                onClick={() => {
                  if (!validateIndianMobileNumber(Mobile)) {
                    Swal2.fire({
                      toast: true,
                      position: "bottom",
                      icon: "error",
                      title: `Invalid mobile number`,
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
                  userLogin();
                }}
              >
                Send otp
              </Button>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose3}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={show2}
          onHide={handleClose2}
          size="sm"
          style={{
            zIndex: "99999",
            position: "absolute",
            top: "30%",
            left: "0%",
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Enter OTP</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span style={{ fontSize: "13px" }}>
              An OTP has been sent to your Phone Number
            </span>
            <div className="d-flex gap-1 mt-3 mb-3">
              <InputGroup className="mb-2" style={{ background: "white" }}>
                <Form.Control
                  type={PasswordShow ? "text" : "password"}
                  className="login-input"
                  placeholder="Enter OTP"
                  aria-describedby="basic-addon1"
                  onChange={(e) => setOTP(e.target.value)}
                />
                <Button
                  variant=""
                  style={{ borderRadius: "0px", border: "1px solid black" }}
                  onClick={() => setPasswordShow(!PasswordShow)}
                  className="passbtn"
                >
                  {PasswordShow ? <FaEye /> : <FaEyeSlash />}
                </Button>
              </InputGroup>
            </div>
            <div>
              <Button
                variant=""
                style={{
                  width: "100%",
                  marginTop: "24px",
                  backgroundColor: "#6B8E23",
                  color: "white",
                  textAlign: "center",
                }}
                onClick={verifyOTP}
              >
                Continue
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        <Drawer
          placement="bottom"
          closable={false}
          onClose={onClose}
          open={open}
          key="bottom"
          height={600}
          className="description-product"
          style={{ zIndex: 99999 }}
          zIndex={99999}
        >
          <div className="modal-container-food">
            <button className="custom-close-btn" onClick={onClose}>
              ×
            </button>
            <div className="modern-food-item">
              <div className="food-image-container">
                <div className="image-loading-spinner" id="image-spinner"></div>
                {foodData?.Foodgallery?.length > 0 && (
                  <img
                    src={`${foodData.Foodgallery[0].image2}`}
                    alt={foodData?.foodname}
                    className="modern-food-image"
                    onLoad={() => {
                      const spinner = document.getElementById("image-spinner");
                      const image =
                        document.querySelector(".modern-food-image");
                      if (spinner) spinner.classList.add("hidden");
                      if (image) image.classList.add("loaded");
                    }}
                    onError={() => {
                      const spinner = document.getElementById("image-spinner");
                      if (spinner) spinner.classList.add("hidden");
                    }}
                  />
                )}
                <div className="food-category-icon">
                  {foodData?.foodcategory === "Veg" ? (
                    <img src={IsVeg} alt="IsVeg" className="isVegIcon" />
                  ) : (
                    <img src={IsNonVeg} alt="IsNonVeg" className="isVegIcon" />
                  )}
                </div>
              </div>

              <div className="food-details">
                <h2 className="food-title">{foodData?.foodname}</h2>
                <p className="food-description">{foodData?.fooddescription}</p>

                {(() => {
                  const matchedLocation =
                    foodData?.locationPrice?.length > 0
                      ? foodData.locationPrice[0]
                      : {
                          Remainingstock: 0,
                          hubPrice:
                            foodData.hubPrice || foodData.basePrice || 0,
                          preOrderPrice: foodData.preOrderPrice || 0,
                          basePrice: foodData.basePrice || 0,
                        };

                  const productOffer = getProductOffer(foodData);
                  const hasOfferInCart = isOfferAlreadyAppliedInCart();
                  const showOfferPrice = productOffer && !hasOfferInCart && !productOffer.isBlocked;

                  const eff = getEffectivePrice(
                    foodData,
                    matchedLocation,
                    foodData?.session,
                    true,
                  );
                  
                  const currentPrice = showOfferPrice && productOffer?.price 
                    ? productOffer.price 
                    : eff.price;
                  const originalPrice = eff.price;
                  const stockCount = matchedLocation?.Remainingstock || 0;

                  return (
                    <>
                      <div className="pricing-section">
                        <div className="pricing-display">
                          <span className="current-price">₹{currentPrice}</span>
                          {showOfferPrice && (
                            <span
                              className="original-price"
                              style={{ marginLeft: "10px" }}
                            >
                              ₹{originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="availability-banner">
                          {stockCount > 0 ? (
                            <>
                              {showOfferPrice && (
                                <BiSolidOffer
                                  color="green"
                                  style={{ marginRight: "5px" }}
                                />
                              )}
                              {productOffer && productOffer.customerType !== undefined && (
                                <span style={{ fontSize: "11px", marginLeft: "5px" }}>
                                  {productOffer.customerType === 0 ? "(First Order Only)" : 
                                   productOffer.customerType === 1 ? "(Up to 1 Order)" : 
                                   `(Up to ${productOffer.customerType} orders)`}
                                </span>
                              )}
                            </>
                          ) : (
                            "Sold Out"
                          )}
                        </div>
                      </div>

                      {getCartQuantity(foodData?._id) > 0 ? (
                        <div className="increaseBtn">
                          <div
                            className="faplus"
                            onClick={() => {
                              if (!(user && !address))
                                decreaseQuantity(
                                  foodData?._id,
                                  productOffer,
                                  matchedLocation,
                                );
                            }}
                            style={{
                              opacity: user && !address ? 0.5 : 1,
                              pointerEvents: user && !address ? "none" : "auto",
                            }}
                          >
                            <FaMinus />
                          </div>
                          <div className="faQuantity">
                            {getCartQuantity(foodData?._id)}
                          </div>
                          <div
                            className="faplus"
                            onClick={() => {
                              if (!(user && !address))
                                increaseQuantity(
                                  foodData?._id,
                                  productOffer,
                                  foodData,
                                  matchedLocation,
                                );
                            }}
                            style={{
                              opacity: user && !address ? 0.5 : 1,
                              pointerEvents: user && !address ? "none" : "auto",
                            }}
                          >
                            <FaPlus />
                          </div>
                        </div>
                      ) : stockCount > 0 && gifUrl !== "Closed.gif" ? (
                        <button
                          className="add-to-cart-btn"
                          onClick={() => addCart1(foodData, productOffer, matchedLocation)}
                          disabled={user && !address}
                          style={{ opacity: user && !address ? 0.5 : 1 }}
                        >
                          <span className="add-to-cart-btn-text">Add</span>
                          <span className="add-to-cart-btn-icon">
                            <FaPlus />
                          </span>
                        </button>
                      ) : (
                        <button
                          className={
                            gifUrl === "Closed.gif"
                              ? "add-to-cart-btn-disabled"
                              : "sold-out-btn"
                          }
                          disabled
                        >
                          <span className="add-to-cart-btn-text">
                            {gifUrl === "Closed.gif" ? "Closed" : "Sold Out"}
                          </span>
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </Drawer>
      </div>

      <div style={{ marginBottom: "80px" }}>
        <Footer />
      </div>

      <BottomNav />
    </div>
  );
};

const TabsComponent = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="tabs-container2">
      <div className="tabs-scroll-container">
        <div className="tabs-scroll">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => onTabClick(tab)}
            >
              <span className="tab-button-text">{tab}</span>
            </button>
          ))}
        </div>
      </div>
      <style jsx>{`
        .tabs-container2 {
          background-color: ${Colors.creamWalls};
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
          position: relative;
          border-bottom: 2px solid #fff;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.1),
            0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .tabs-scroll-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .tabs-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .tabs-scroll {
          display: inline-flex;
          min-width: 100%;
          gap: 10px;
          padding: 0 4px;
        }
        .tab-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: 8px 24px;
          border-radius: 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          flex-shrink: 0;
          min-height: 25px;
        }
        .tab-button:hover {
          background-color: ${Colors.warmbeige}40;
          transform: translateY(-1px);
        }
        .tab-button.active {
          background-color: ${Colors.greenCardamom};
          padding: 4px 8px;
          box-shadow: 0 2px 8px ${Colors.greenCardamom}80;
          width: auto;
          height: auto;
          border-radius: 20px;
        }
        .tab-button.active:hover {
          background-color: ${Colors.greenCardamom}E6;
          transform: translateY(-1px) scale(1.02);
        }
        .tab-button-text {
          font-family: "Inter", sans-serif;
          fontsize: 14px;
          font-weight: 400;
          line-height: 18px;
          letter-spacing: -0.7px;
          color: ${Colors.primaryText};
          transition: all 0.3s ease;
        }
        .tab-button.active .tab-button-text {
          font-family: "Inter", sans-serif;
          fontsize: 16px;
          font-weight: 900;
          line-height: 21px;
          letter-spacing: -0.8px;
          color: ${Colors.appForeground};
        }
      `}</style>
    </div>
  );
};

export default Home;









// =============================================================

























// import {
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   useRef,
//   useCallback,
// } from "react";
// import { Container } from "react-bootstrap";
// import { FaEye, FaEyeSlash, FaLock, FaUser, FaAngleUp } from "react-icons/fa";
// import { Button, Form, InputGroup, Modal } from "react-bootstrap";
// import { FaPlus, FaMinus, FaSquareWhatsapp } from "react-icons/fa6";
// import "../Styles/Home.css";
// import Banner from "./Banner";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Drawer } from "antd";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import CoinBalance from "./CoinBalance";
// import { WalletContext } from "../WalletContext";
// import RatingModal from "./RatingModal";
// import { BiSolidOffer } from "react-icons/bi";
// import Swal2 from "sweetalert2";
// // import moment from "moment";
// import IsVeg from "../assets/isVeg=yes.svg";
// import IsNonVeg from "../assets/isVeg=no.svg";
// import MultiCartDrawer from "./MultiCartDrawer";
// import DateSessionSelector from "./DateSessionSelector";
// import chef from "./../assets/chef_3.png";
// import { Colors, FontFamily } from "../Helper/themes";
// import BottomNav from "./BottomNav";
// // import LocationRequiredPopup from "./LocationRequiredPopup";
// // import { MdAddLocationAlt } from "react-icons/md";
// import availabity from "./../assets/weui_done2-filled.png";
// import Footer from "./Footer";
// import { addToCart } from "../Helper/cartHelper";

// const Home = ({ selectArea, setSelectArea, Carts, setCarts }) => {
//   // Store user in state to avoid infinite render loop
//   const [user, setUser] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   });

//   // Listen for user changes in localStorage
//   useEffect(() => {
//     const handleStorage = (e) => {
//       if (e.key === "user") {
//         try {
//           setUser(JSON.parse(e.newValue));
//         } catch {
//           setUser(null);
//         }
//       }
//     };
//     window.addEventListener("storage", handleStorage);
//     return () => window.removeEventListener("storage", handleStorage);
//   }, []);

//   // Provide a function to update user state and localStorage together
//   const updateUser = (userObj) => {
//     setUser(userObj);
//     if (userObj) {
//       localStorage.setItem("user", JSON.stringify(userObj));
//     } else {
//       localStorage.removeItem("user");
//     }
//     window.dispatchEvent(new Event("userUpdated"));
//   };

//   const navigate = useNavigate();
//   const location = useLocation();

//   const { wallet, transactions, loading, walletSeting, getorderByCustomerId } =
//     useContext(WalletContext);

//   const [loader, setloader] = useState(false);
//   const [allHubMenuData, setAllHubMenuData] = useState([]);

//   // --- NEW STATE FOR FILTERS ---
//   const [isVegOnly, setIsVegOnly] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("");

//   const [address, setAddress] = useState(null);

//   // ============ NEW: Track if default hub menu should load ============
//   const [shouldLoadDefaultMenu, setShouldLoadDefaultMenu] = useState(!user);

//   // ============ NEW: Cutoff validation state ============
//   const [cutoffValidation, setCutoffValidation] = useState({
//     allowed: true,
//     message: "",
//     cutoffDateTime: null,
//     nextAvailableDateTime: null
//   });
//   const [cutoffLoading, setCutoffLoading] = useState(false);

//   // State for offers
//   const [gifUrl, setGifUrl] = useState("");
//   const [message, setMessage] = useState("");
//   const [AllOffer, setAllOffer] = useState([]);

//   // ============ getAllOffer function - MOVED HERE before useEffect that uses it ============
//   const getAllOffer = async () => {
//     try {
//       const response = await axios.get("http://localhost:7013/api/admin/offers");
//       if (response.status === 200 && response.data?.data) {
//         setAllOffer(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching offers:", error);
//       setAllOffer([]);
//     }
//   };
//   // ================================================================================

//   // Initial address loading with better error handling
//   useEffect(() => {
//     const loadInitialAddress = () => {
//       try {
//         const primaryAddress = localStorage.getItem("primaryAddress");
//         const currentLocation = localStorage.getItem("currentLocation");
//         const defaultHubData = localStorage.getItem("defaultHubData");

//         // Priority 1: Primary address (for logged-in users)
//         if (primaryAddress && primaryAddress !== "null") {
//           const parsedPrimary = JSON.parse(primaryAddress);
//           setAddress(parsedPrimary);
//           setShouldLoadDefaultMenu(false);
//         }
//         // Priority 2: Current location (user-selected)
//         else if (currentLocation && currentLocation !== "null") {
//           const parsedCurrent = JSON.parse(currentLocation);
//           setAddress(parsedCurrent);
//           setShouldLoadDefaultMenu(false);
//         }
//         // Priority 3: Default hub data (for non-logged-in users)
//         else if (defaultHubData && defaultHubData !== "null") {
//           try {
//             const parsedDefault = JSON.parse(defaultHubData);
//             const defaultAddress = {
//               hubId: parsedDefault.hubId || parsedDefault._id || "69613cb1145c1aaedd9859cd",
//               hubName: parsedDefault.hubName || parsedDefault.name || "Default Hub",
//               fullAddress: parsedDefault.address || "Select your location to view menu",
//               isDefaultHub: true,
//               location: parsedDefault.location || {
//                 type: "Point",
//                 coordinates: [0, 0],
//               },
//             };
//             setAddress(defaultAddress);
//             setShouldLoadDefaultMenu(false);
//             localStorage.setItem("currentLocation", JSON.stringify(defaultAddress));
//           } catch (e) {
//             console.error("Error parsing default hub data:", e);
//             setAddress(null);
//             setShouldLoadDefaultMenu(true);
//           }
//         } else {
//           setAddress(null);
//           setShouldLoadDefaultMenu(!user);
//         }
//       } catch (error) {
//         console.error("Error loading initial address:", error);
//         setAddress(null);
//         setShouldLoadDefaultMenu(!user);
//       }
//     };

//     loadInitialAddress();
//     getDeliveryRates();
//   }, [user]);

// // ============ Function to validate cutoff timing (FIXED: uses status) ============
// const validateCutoffTiming = useCallback(async (hubId, session, deliveryDate) => {
//   if (!hubId || !session) return true;

//   try {
//     setCutoffLoading(true);
//     // FIXED: Use status instead of acquisitionChannel
//     const status = user?.status === "Employee" ? "Employee" : "Normal";

//     // console.log("User status:", user?.status);
//     // console.log("Status being sent:", status);
    
//     const response = await axios.post(
//       "http://localhost:7013/api/Hub/validate-order-timing",
//       {
//         hubId: hubId,
//         session: session.toLowerCase(),
//         status: status,  // Changed from acquisitionChannel to status
//         deliveryDate: deliveryDate instanceof Date ? deliveryDate.toISOString() : deliveryDate
//       }
//     );

//     if (response.status === 200) {
//       setCutoffValidation({
//         allowed: response.data.allowed,
//         message: response.data.message,
//         cutoffDateTime: response.data.cutoffDateTime,
//         nextAvailableDateTime: response.data.nextAvailableDateTime
//       });
//       return response.data.allowed;
//     }
//     return true;
//   } catch (error) {
//     console.error("Error validating cutoff timing:", error);
//     return true;
//   } finally {
//     setCutoffLoading(false);
//   }
// }, [user?.status]);

// // Function to get next available ordering time
// const getNextAvailableTime = useCallback(async (hubId, session) => {
//   if (!hubId || !session) return null;
  
//   try {
//     const status = user?.status === "Employee" ? "Employee" : "Normal";
//     const response = await axios.get(
//       `http://localhost:7013/api/Hub/next-available-time/${hubId}/${session.toLowerCase()}/${status}`
//     );
    
//     if (response.status === 200) {
//       return response.data;
//     }
//     return null;
//   } catch (error) {
//     console.error("Error getting next available time:", error);
//     return null;
//   }
// }, [user?.status]);

//   // --- DATE & SESSION STATE ---
//   const getNormalizedToday = () => {
//     const now = new Date();
//     return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
//   };

//   const [selectedDate, setSelectedDate] = useState(() => {
//     if (location.state?.targetDate) return new Date(location.state.targetDate);
//     return getNormalizedToday();
//   });

//   const [selectedSession, setSelectedSession] = useState(() => {
//     if (location.state?.targetSession) return location.state.targetSession;
//     return "Lunch";
//   });

//   // ============ Check cutoff when date/session or hub changes ============
// useEffect(() => {
//   const checkCutoff = async () => {
//     const currentAddress = address || (() => {
//       try {
//         const primaryAddress = localStorage.getItem("primaryAddress");
//         const currentLocation = localStorage.getItem("currentLocation");
//         return primaryAddress ? JSON.parse(primaryAddress) : 
//                currentLocation ? JSON.parse(currentLocation) : null;
//       } catch {
//         return null;
//       }
//     })();

//     if (currentAddress?.hubId && selectedDate && selectedSession) {
//       const isAllowed = await validateCutoffTiming(
//         currentAddress.hubId,
//         selectedSession,
//         selectedDate
//       );
      
//       // If not allowed and user tries to add to cart, show message
//       if (!isAllowed) {
//         console.log("Order not allowed for this slot:", cutoffValidation.message);
//       }
//     }
//   };

//   checkCutoff();
// }, [address, selectedDate, selectedSession, validateCutoffTiming]);

//   // ============ Check cutoff when date/session or hub changes ============
//   useEffect(() => {
//     const checkCutoff = async () => {
//       const currentAddress = address || (() => {
//         try {
//           const primaryAddress = localStorage.getItem("primaryAddress");
//           const currentLocation = localStorage.getItem("currentLocation");
//           return primaryAddress ? JSON.parse(primaryAddress) : 
//                  currentLocation ? JSON.parse(currentLocation) : null;
//         } catch {
//           return null;
//         }
//       })();

//       if (currentAddress?.hubId && selectedDate && selectedSession) {
//         await validateCutoffTiming(
//           currentAddress.hubId,
//           selectedSession,
//           selectedDate
//         );
//       }
//     };

//     checkCutoff();
//   }, [address, selectedDate, selectedSession, validateCutoffTiming]);

//   // Add a function to refresh address from localStorage
//   const refreshAddress = useCallback(() => {
//     try {
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const currentLocation = localStorage.getItem("currentLocation");
//       const defaultHubData = localStorage.getItem("defaultHubData");

//       if (primaryAddress && primaryAddress !== "null") {
//         const parsedPrimary = JSON.parse(primaryAddress);
//         setAddress(parsedPrimary);
//         setShouldLoadDefaultMenu(false);
//       } else if (currentLocation && currentLocation !== "null") {
//         const parsedCurrent = JSON.parse(currentLocation);
//         setAddress(parsedCurrent);
//         setShouldLoadDefaultMenu(false);
//       } else if (defaultHubData && defaultHubData !== "null") {
//         try {
//           const parsedDefault = JSON.parse(defaultHubData);
//           const defaultAddress = {
//             hubId: parsedDefault.hubId || parsedDefault._id || "69613cb1145c1aaedd9859cd",
//             hubName: parsedDefault.hubName || parsedDefault.name || "Default Hub",
//             fullAddress: parsedDefault.address || "Select your location to view menu",
//             isDefaultHub: true,
//             location: parsedDefault.location || {
//               type: "Point",
//               coordinates: [0, 0],
//             },
//           };
//           setAddress(defaultAddress);
//           setShouldLoadDefaultMenu(false);
//           localStorage.setItem("currentLocation", JSON.stringify(defaultAddress));
//         } catch (e) {
//           console.error("Error parsing default hub data:", e);
//           setAddress(null);
//           setShouldLoadDefaultMenu(!user);
//         }
//       } else {
//         setAddress(null);
//         setShouldLoadDefaultMenu(!user);
//       }
//     } catch (error) {
//       console.error("Error refreshing address:", error);
//       setAddress(null);
//       setShouldLoadDefaultMenu(!user);
//     }
//   }, [user]);

//   // Listen for location updates from Banner
//   useEffect(() => {
//     const handleLocationUpdated = () => {
//       refreshAddress();
//     };

//     const handleAddressUpdated = () => {
//       refreshAddress();
//     };

//     const handleAddressAdded = () => {
//       refreshAddress();
//     };

//     const handleFocus = () => {
//       refreshAddress();
//     };

//     const handleDefaultHubLoaded = () => {
//       refreshAddress();
//     };

//     window.addEventListener("locationUpdated", handleLocationUpdated);
//     window.addEventListener("addressUpdated", handleAddressUpdated);
//     window.addEventListener("addressAdded", handleAddressAdded);
//     window.addEventListener("focus", handleFocus);
//     window.addEventListener("defaultHubLoaded", handleDefaultHubLoaded);

//     const handleStorageChange = (e) => {
//       if (e.key === "currentLocation" || e.key === "primaryAddress" || e.key === "defaultHubData") {
//         refreshAddress();
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);

//     const intervalId = setInterval(() => {
//       refreshAddress();
//     }, 2000);

//     return () => {
//       window.removeEventListener("locationUpdated", handleLocationUpdated);
//       window.removeEventListener("addressUpdated", handleAddressUpdated);
//       window.removeEventListener("addressAdded", handleAddressAdded);
//       window.removeEventListener("focus", handleFocus);
//       window.removeEventListener("defaultHubLoaded", handleDefaultHubLoaded);
//       window.removeEventListener("storage", handleStorageChange);
//       clearInterval(intervalId);
//     };
//   }, [refreshAddress]);

//   // State for location popup
//   const [showLocationPopup, setShowLocationPopup] = useState(false);

//   // Update handleSelectionChange to reset selectedCategory
//   const handleSelectionChange = (date1, session1) => {
//     setSelectedDate(date1);
//     setSelectedSession(session1);
//     setSelectedCategory("");
//     window.scrollTo(0, 0);
//   };

//   // Check if user is logged in but has no address selected
//   useEffect(() => {
//     if (user && !address) {
//       const timer = setTimeout(() => {
//         setShowLocationPopup(true);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [user, address]);

//   // Add location detection for users coming from splash screen
//   useEffect(() => {
//     const checkLocationPermission = async () => {
//       const currentLocation = localStorage.getItem("currentLocation");
//       const primaryAddress = localStorage.getItem("primaryAddress");
//       const defaultHubData = localStorage.getItem("defaultHubData");

//       if (currentLocation || primaryAddress || defaultHubData || address) {
//         return;
//       }

//       if (navigator.geolocation && navigator.permissions) {
//         try {
//           const permission = await navigator.permissions.query({
//             name: "geolocation",
//           });
//         } catch (error) {
//           console.error("Permissions API error:", error);
//         }
//       }
//     };

//     const timer = setTimeout(checkLocationPermission, 500);
//     return () => clearTimeout(timer);
//   }, []);

//   // --- 1. FETCH DATA (Only when Hub Changes) ---
//   useEffect(() => {
//     const hubIdToUse = address?.hubId || (shouldLoadDefaultMenu && !user ? "69613cb1145c1aaedd9859cd" : null);

//     if (!hubIdToUse) {
//       setAllHubMenuData([]);
//       setloader(false);
//       return;
//     }

//     const fetchAllMenuData = async () => {
//       setloader(true);
//       try {
//         const res = await axios.get("http://localhost:7013/api/user/get-hub-menu", {
//           params: { hubId: hubIdToUse },
//         });

//         if (res.status === 200) {
//           setAllHubMenuData(res.data.menu);
//         } else {
//           setAllHubMenuData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching menu:", error);
//         setAllHubMenuData([]);
//       } finally {
//         setloader(false);
//       }
//     };

//     fetchAllMenuData();
//   }, [address?.hubId, shouldLoadDefaultMenu, user]);

//   const handleLocationDetected = useCallback((newLocation) => {
//     setAddress(newLocation);
//     setShouldLoadDefaultMenu(false);

//     if (newLocation) {
//       localStorage.setItem("currentLocation", JSON.stringify(newLocation));
//     }

//     window.dispatchEvent(new Event("locationUpdated"));
//   }, []);

//   // --- 2. CORE FILTERING LOGIC ---
//   const currentSlotItems = useMemo(() => {
//     if (!allHubMenuData?.length) return [];
//     const selectedDateISO = selectedDate.toISOString();

//     return allHubMenuData.filter(
//       (item) => item.deliveryDate === selectedDateISO && item.session === selectedSession,
//     );
//   }, [allHubMenuData, selectedDate, selectedSession]);

//   const vegFilteredItems = useMemo(() => {
//     if (isVegOnly) {
//       return currentSlotItems.filter((item) => item.foodcategory === "Veg");
//     }
//     return currentSlotItems;
//   }, [currentSlotItems, isVegOnly]);

//   const dynamicTabs = useMemo(() => {
//     const categories = new Set(vegFilteredItems.map((item) => item.menuCategory));
//     const uniqueCats = [...categories].filter(Boolean).sort();
//     return uniqueCats;
//   }, [vegFilteredItems]);

//   useEffect(() => {
//     if (dynamicTabs.length > 0 && !selectedCategory) {
//       setSelectedCategory(dynamicTabs[0]);
//     } else if (dynamicTabs.length > 0 && !dynamicTabs.includes(selectedCategory)) {
//       setSelectedCategory(dynamicTabs[0]);
//     }
//   }, [dynamicTabs, selectedCategory]);

//   const finalDisplayItems = useMemo(() => {
//     if (!selectedCategory) return [];
//     return vegFilteredItems.filter((item) => item.menuCategory === selectedCategory);
//   }, [vegFilteredItems, selectedCategory]);

//   const isSameDay = (d1, d2) => {
//     const a = new Date(d1);
//     const b = new Date(d2);
//     a.setHours(0, 0, 0, 0);
//     b.setHours(0, 0, 0, 0);
//     return a.getTime() === b.getTime();
//   };

//  // ============ Check cutoff using validation result ============
// const isBeforeCutoff = (deliveryDate, session) => {
//   if (!deliveryDate || !session) return false;
  
//   // Use the cutoff validation result from API
//   if (!cutoffValidation.allowed) {
//     return false;
//   }
  
//   const now = new Date();
//   const delivery = new Date(deliveryDate);
//   delivery.setHours(0, 0, 0, 0);
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
  
//   // Future dates are always allowed
//   if (delivery.getTime() > today.getTime()) return true;
  
//   // Past dates are not allowed
//   if (delivery.getTime() < today.getTime()) return false;
  
//   // For today, use the API validation result
//   return cutoffValidation.allowed;
// };

//   // Helper: always use preorder price if available and before cutoff
//   const getEffectivePrice = (item, matchedLocation, session) => {
//     const hubPrice = (matchedLocation && (matchedLocation.hubPrice || matchedLocation.basePrice)) || item?.hubPrice || item?.basePrice || 0;
//     const preOrderPrice = (matchedLocation && (matchedLocation.preOrderPrice || matchedLocation.preorderPrice)) || item?.preOrderPrice || item?.preorderPrice || 0;
//     const beforeCutoff = isBeforeCutoff(item?.deliveryDate || item?.deliveryDateISO, session);
//     if (beforeCutoff && preOrderPrice > 0) return { price: preOrderPrice };
//     return { price: hubPrice };
//   };

//   const [cartCount, setCartCount] = useState(0);
//   const [isCartVisible, setIsCartVisible] = useState(false);

//   const handleShow = () => {
//     setCartCount(cartCount + 1);
//     setIsCartVisible(true);
//   };

//   const [foodData, setFoodData] = useState({});
//   const [open, setOpen] = useState(false);

//   const showDrawer = (food) => {
//     setFoodData(food);
//     setOpen(true);
//   };
//   const onClose = () => {
//     setOpen(false);
//   };

//   useEffect(() => {
//     if (open) {
//       document.body.classList.add("drawer-open");
//     } else {
//       document.body.classList.remove("drawer-open");
//     }
//     return () => {
//       document.body.classList.remove("drawer-open");
//     };
//   }, [open]);
  
//   const [show4, setShow4] = useState(false);
//   const handleClose4 = () => setShow4(false);
//   const [show3, setShow3] = useState(false);
//   const handleClose3 = () => setShow3(false);
//   const [show2, setShow2] = useState(false);
//   const handleClose2 = () => setShow2(false);
//   const handleShow2 = () => setShow2(true);

//   useEffect(() => {
//     refreshAddress();
//   }, [user]);

//   // ============ Add to cart with cutoff validation ============
//   const addCart1 = async (item, checkOf, matchedLocation) => {
//   };

//   const [cart, setCart] = useState([]);

//   useEffect(() => {
//     const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
//     setCart(storedCart);

//     const addonedCarts = async () => {
//       try {
//         await axios.post("http://localhost:7013/api/cart/addCart", {
//           userId: user?._id,
//           items: storedCart,
//           lastUpdated: Date.now,
//           username: user?.Fname,
//           mobile: user?.Mobile,
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     if (Carts && Carts.length > 0 && user?._id) {
//       addonedCarts();
//     }
//   }, [JSON.stringify(Carts), user?._id]);

//   const updateCartData = (updatedCart) => {
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//     setCart(updatedCart);
//     setCarts(updatedCart);
//   };

//   const increaseQuantity = (foodItemId, checkOf, item, matchedLocation) => {
//   };

//   const [show, setShow] = useState(true);
//   const [expiryDays, setExpiryDays] = useState(0);

//   const decreaseQuantity = (foodItemId, checkOf, matchedLocation) => {
//   };

//   const isAddressReady = () => {
//     const addresstype1 = localStorage.getItem("addresstype");
//     if (!addresstype1) return false;

//     const addressKey = addresstype1 === "apartment" ? "address" : "coporateaddress";
//     const addressRaw = localStorage.getItem(addressKey);

//     if (!addressRaw) return false;

//     try {
//       const address1 = JSON.parse(addressRaw);
//       if (!address1) return false;

//       const apartmentname = address1?.apartmentname || address1?.Apartmentname || "";
//       const addressField = address1?.Address || address1?.address || "";
//       const pincode = address1?.pincode || "";

//       return apartmentname && addressField && pincode;
//     } catch (error) {
//       return false;
//     }
//   };

//   // This useEffect now calls getAllOffer which is defined above
//   useEffect(() => {
//     if (Carts?.length > 0) {
//       handleShow();
//     }
//     if (user?._id) {
//       getAllOffer();
//     }
//   }, [user?._id]);

//   const groupedCarts = useMemo(() => {
//     if (!Carts || Carts.length === 0) return [];
//     const groups = Carts.reduce((acc, item) => {
//       const key = `${item.deliveryDate}|${item.session}`;

//       if (!item.deliveryDate || !item.session) return acc;

//       if (!acc[key]) {
//         acc[key] = {
//           session: item.session,
//           date: new Date(item.deliveryDate),
//           totalItems: 0,
//           subtotal: 0,
//           items: [],
//         };
//       }

//       acc[key].totalItems += item.quantity;
//       acc[key].subtotal += item.price * item.quantity;
//       acc[key].items.push(item);

//       return acc;
//     }, {});

//     return Object.values(groups).sort((a, b) => a.date - b.date);
//   }, [Carts]);

//   const overallTotalItems = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.totalItems, 0);
//   }, [groupedCarts]);

//   const overallSubtotal = useMemo(() => {
//     return groupedCarts.reduce((acc, slot) => acc + slot.subtotal, 0);
//   }, [groupedCarts]);

//   const [deliveryCharge, setDeliveryCharge] = useState([]);
//   const [filteredRates, setFilteredRates] = useState([]);

//   const getDeliveryRates = async () => {
//     try {
//       const res = await axios.get("http://localhost:7013/api/deliveryrate/all");
//       setDeliveryCharge(res.data.data);
//       setFilteredRates(res.data.data);
//     } catch (error) {
//       console.error("Error fetching delivery rates:", error);
//     }
//   };

//   const findDeliveryRate = (hubId, acquisitionChannel, status) => {
//     if (!deliveryCharge || deliveryCharge.length === 0) {
//       return 15;
//     }

//     const matchedRate = deliveryCharge.find(
//       (rate) =>
//         rate.hubId === hubId &&
//         rate.acquisition_channel === acquisitionChannel &&
//         rate.status === status,
//     );

//     return matchedRate?.deliveryRate || 15;
//   };

//   // FIXED: Use status to determine acquisition channel for delivery rate
//   const isEmployeeForDelivery = user?.status === "Employee";
//   const acquisitionChannelForDelivery = isEmployeeForDelivery ? "employee" : (user?.acquisition_channel || "organic");
//   const userStatus = user?.status;
//   const hubId = address?.hubId;
//   const deliveryRate = findDeliveryRate(hubId, acquisitionChannelForDelivery, userStatus);

//   const proceedToCheckout = () => {
//     // Validate: User logged in
//     if (!user) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Please Login!`,
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

//     // Validate: Cart not empty
//     if (Carts.length === 0) {
//       return;
//     }

//     // Validate: Address selected
//     if (!address) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Please Select Address!`,
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

//     // All validations passed - navigate to checkout
//     navigate("/checkout-multiple");
//   };

//   // Legacy alias for backwards compatibility (if used elsewhere)
//   const proceedToPlan = proceedToCheckout;

//   // Time check effect
//   useEffect(() => {
//     const checkTime = () => {
//       const now = new Date();
//       const currentTimeInMinutes = 10 * 60 + now.getMinutes();
//       const lunchStart = 7 * 60;
//       const lunchPrepStart = 9 * 60;
//       const lunchCookingStart = 11 * 60;
//       const lunchEnd = 14 * 60;

//       const dinnerStart = 14 * 60;
//       const dinnerPrepStart = 16 * 60 + 30;
//       const dinnerCookingStart = 18 * 60;
//       const dinnerEnd = 21 * 60;

//       const shopCloseTime = 21 * 60;

//       if (currentTimeInMinutes >= lunchStart && currentTimeInMinutes < lunchPrepStart) {
//         setGifUrl("sourcing.gif");
//         setMessage("Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.");
//       } else if (currentTimeInMinutes >= lunchPrepStart && currentTimeInMinutes < lunchCookingStart) {
//         setGifUrl("cuttingveg.gif");
//         setMessage("Preparing ingredients. Orders placed now will be delivered at your selected slot.");
//       } else if (currentTimeInMinutes >= lunchCookingStart && currentTimeInMinutes < lunchEnd) {
//         setGifUrl("cookinggif.gif");
//         setMessage("Cooking your meal. Orders placed now will be delivered at your selected slot.");
//       } else if (currentTimeInMinutes >= dinnerStart && currentTimeInMinutes < dinnerPrepStart) {
//         setGifUrl("sourcing.gif");
//         setMessage("Sourcing Quality Ingredients. Orders placed now will be delivered at your selected slot.");
//       } else if (currentTimeInMinutes >= dinnerPrepStart && currentTimeInMinutes < dinnerCookingStart) {
//         setGifUrl("cuttingveg.gif");
//         setMessage("Preparing ingredients. Orders placed now will be delivered at your selected slot.");
//       } else if (currentTimeInMinutes >= dinnerCookingStart && currentTimeInMinutes <= dinnerEnd) {
//         setGifUrl("cookinggif.gif");
//         setMessage("Cooking your meal. Orders placed now will be delivered at your selected slot.");
//       } else if (currentTimeInMinutes >= shopCloseTime) {
//         setGifUrl("Closed.gif");
//         setMessage("The Store is now closed. Operating hours: Lunch: 7:00 AM - 02:00 PM, Dinner: 2:00 PM - 9:00 PM.");
//       } else {
//         setGifUrl("Closed.gif");
//         setMessage("Orders are currently closed. Lunch: 7:00 AM - 02:00 PM. Dinner: 2:00 PM - 9:00 PM.");
//       }
//     };
//     checkTime();
//     const interval = setInterval(checkTime, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const [Fname, setFname] = useState("");
//   const [Mobile, setMobile] = useState("");
//   const [OTP, setOTP] = useState(["", "", "", ""]);
//   const [PasswordShow, setPasswordShow] = useState(false);

//   const userLogin = async () => {
//     if (!Mobile) {
//       return Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "info",
//         title: `Enter Your Mobile Number`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//     setloader(true);
//     try {
//       const config = {
//         url: "/User/Sendotp",
//         method: "post",
//         baseURL: "http://localhost:7013/api",
//         headers: { "content-type": "application/json" },
//         data: { Mobile: Mobile },
//       };

//       const res = await axios(config);
//       if (res.status === 401) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Invalid Mobile Number`,
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
//           title: `Something went wrong`,
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
//         setloader(false);
//         handleClose3();
//         handleShow2();
//       }
//     } catch (error) {
//       setloader(false);
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   function validateIndianMobileNumber(mobileNumber) {
//     const regex = /^[6-9]\d{9}$/;
//     return regex.test(mobileNumber);
//   }

//   const verifyOTP = async () => {
//     try {
//       if (!OTP) {
//         return Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Enter a valid OTP`,
//           showConfirmButton: false,
//           timer: 3000,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//       const config = {
//         url: "User/mobileotpverification",
//         method: "post",
//         baseURL: "http://localhost:7013/api/",
//         header: { "content-type": "application/json" },
//         data: { Mobile: Mobile, otp: OTP },
//       };
//       const res = await axios(config);
//       if (res.status === 200) {
//         updateUser(res.data.details);
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "success",
//           title: `OTP verified successfully`,
//           showConfirmButton: false,
//           timer: 3000,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });

//         if (!address) {
//           handleClose2();
//           handleClose3();
//           return navigate("/");
//         }
//         navigate("/");
//         handleClose2();
//         setOTP("");
//         setMobile("");
//       }
//     } catch (error) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.response.data.error || `Something went wrong!`,
//         showConfirmButton: false,
//         timer: 3000,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const getCartQuantity = (itemId) => {
//     // Convert selected date to YYYY-MM-DD format (new cartHelper format)
//     const year = selectedDate.getFullYear();
//     const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
//     const day = String(selectedDate.getDate()).padStart(2, "0");
//     const selectedDateStr = `${year}-${month}-${day}`;
    
//     return Carts?.filter(
//       (cartItem) =>
//         cartItem?._id === itemId &&
//         cartItem.deliveryDate === selectedDateStr &&
//         cartItem.session === selectedSession.toLowerCase(),
//     )?.reduce((total, curr) => total + curr?.quantity, 0);
//   };

//   // Automatically remove today's Lunch/Dinner cart items after cutoff times
//   useEffect(() => {
//     if (!Carts || !setCarts) return;
//     const toKey = (date) => new Date(date).toISOString().slice(0, 10);
//     const cleanup = () => {
//       const now = new Date();
//       const todayKey = toKey(now);
//       let removed = [];
//       const shouldRemove = (item) => {
//         if (!item) return false;
//         const dateVal = item.deliveryDate || item.date || item.slotDate || item.deliveryDateString;
//         const sessionVal = (item.session || item.slotSession || item.mealSession || "").toString();
//         if (!dateVal || !sessionVal) return false;
//         const itemKey = toKey(dateVal);
//         if (itemKey !== todayKey) return false;
//         return !isBeforeCutoff(dateVal, sessionVal);
//       };
//       const newCarts = [];
//       Carts.forEach((it) => {
//         if (shouldRemove(it)) {
//           removed.push(it);
//         } else {
//           newCarts.push(it);
//         }
//       });
//       if (removed.length > 0) {
//         setCarts(newCarts);
//       }
//     };
//     cleanup();
//     const id = setInterval(cleanup, 60 * 5000);
//     return () => clearInterval(id);
//   }, [Carts, setCarts]);

//   const lastCartRawRef = useRef(null);
//   useEffect(() => {
//     const readCart = () => {
//       try {
//         const raw = localStorage.getItem("cart") || "[]";
//         if (raw !== lastCartRawRef.current) {
//           lastCartRawRef.current = raw;
//           const parsed = JSON.parse(raw);
//           setCarts(Array.isArray(parsed) ? parsed : []);
//           setCart(Array.isArray(parsed) ? parsed : []);
//         }
//       } catch (err) {
//         console.error("cart sync error", err);
//       }
//     };

//     readCart();
//     const intervalId = setInterval(readCart, 1000);
//     const onStorage = (e) => {
//       if (e.key === "cart") readCart();
//     };
//     const onCartUpdated = () => readCart();
//     window.addEventListener("storage", onStorage);
//     window.addEventListener("cart_updated", onCartUpdated);

//     return () => {
//       clearInterval(intervalId);
//       window.removeEventListener("storage", onStorage);
//       window.removeEventListener("cart_updated", onCartUpdated);
//     };
//   }, [setCarts]);

//   // Clean up any leftover flags
//   useEffect(() => {
//     localStorage.removeItem("triggerProceedToPlan");
//     sessionStorage.removeItem("justAddedAddress");
//   }, []);

//   // Compute showOffer safely (FIXED: uses status)
//   const showOffer = useMemo(() => {
//     if (!AllOffer?.length) return false;
//     try {
//       const primaryAddressStr = localStorage.getItem("primaryAddress");
//       const primaryAddress = primaryAddressStr ? JSON.parse(primaryAddressStr) : null;
//       const isEmployeeForOffer = user?.status === "Employee";
//       const acquisitionChannelForOffer = isEmployeeForOffer ? "employee" : (user?.acquisition_channel || "organic");
//       return primaryAddress?.hubId === AllOffer[0]?.hubId && 
//              acquisitionChannelForOffer === AllOffer[0]?.acquisition_channel;
//     } catch (error) {
//       console.error("Error parsing primaryAddress for offer:", error);
//       return false;
//     }
//   }, [AllOffer, user?.status]);

//   return (
//     <div>
//       <ToastContainer />

//       <div>
//         <Banner
//           Carts={Carts}
//           getAllOffer={getAllOffer}
//           isVegOnly={isVegOnly}
//           setIsVegOnly={setIsVegOnly}
//           onLocationDetected={handleLocationDetected}
//         />
//       </div>

//       {wallet?.balance > 0 && show && (
//         <div style={{ position: "relative" }}>
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 backgroundColor: "#f9f8f6",
//                 opacity: 1,
//                 zIndex: 20,
//                 pointerEvents: "auto",
//               }}
//             ></div>
//           )}

//           <CoinBalance
//             wallet={wallet}
//             transactions={transactions}
//             expiryDays={expiryDays}
//             setExpiryDays={setExpiryDays}
//             setShow={setShow}
//           />
//         </div>
//       )}

//       <div className="sticky-menu-header" style={{ position: "relative" }}>
//         <div style={{ position: "relative" }}>
//           {user && !address && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 zIndex: 10,
//                 pointerEvents: "none",
//                 opacity: 0.8,
//               }}
//             ></div>
//           )}
//           <DateSessionSelector
//             onChange={handleSelectionChange}
//             currentDate={selectedDate}
//             currentSession={selectedSession}
//             menuData={allHubMenuData}
//           />
//         </div>
//       </div>

//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.8,
//             }}
//           ></div>
//         )}
//         <Container>
//           <RatingModal />

//           {showOffer && (
//             <div className="maincontainer">
//               <div
//                 className="d-flex gap-3 mb-2 messageDiv rounded-2 mt-3 justify-content-center"
//                 style={{
//                   backgroundColor: "white",
//                   padding: "5px",
//                   height: "50px",
//                 }}
//               >
//                 <p
//                   className="mb-0 typewriter-desc"
//                   style={{
//                     color: "#6B8E23",
//                     fontSize: "1rem",
//                     textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
//                     lineHeight: "1.6",
//                     textAlign: "center",
//                   }}
//                 >
//                   {AllOffer[0]?.session === "Lunch" ? (
//                     <>Beat the afternoon hunger! {AllOffer[0]?.products[0]?.foodname} at just ₹{AllOffer[0]?.products[0]?.price} for Lunch!</>
//                   ) : AllOffer[0]?.session === "Dinner" ? (
//                     <>Make your evening special! {AllOffer[0]?.products[0]?.foodname} at just ₹{AllOffer[0]?.products[0]?.price} for Dinner!</>
//                   ) : (
//                     <>🥳 Limited time offer: {AllOffer[0]?.products[0]?.foodname} at just ₹{AllOffer[0]?.products[0]?.price}!</>
//                   )}
//                 </p>
//               </div>
//             </div>
//           )}

//           {loader ? (
//             <div
//               className="d-flex justify-content-center align-item-center"
//               style={{
//                 position: "fixed",
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)",
//                 zIndex: 9999,
//               }}
//             >
//               <div class="lds-ripple">
//                 <div></div>
//                 <div></div>
//               </div>
//             </div>
//           ) : null}
//         </Container>
//       </div>
      
//       <div style={{ position: "relative" }}>
//         {user && !address && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               zIndex: 10,
//               pointerEvents: "none",
//               opacity: 0.2,
//             }}
//           ></div>
//         )}
//         <div className="maincontainer">
//           <div className="mobile-product-box" style={{ marginBottom: "30px" }}>
//             <div style={{ marginBottom: "20px" }}>
//               <TabsComponent
//                 tabs={dynamicTabs}
//                 activeTab={selectedCategory}
//                 onTabClick={setSelectedCategory}
//               />
//             </div>

//             <div className="d-flex gap-1 mb-2 flex-column">
//               <div className="row">
//                 {finalDisplayItems?.map((item, i) => {
//                   let matchedLocation = item.locationPrice?.[0];
//                   let checkOf = null;

//                   const primaryAddressJson = localStorage.getItem("primaryAddress");
//                   if (primaryAddressJson) {
//                     try {
//                       const primaryAddress = JSON.parse(primaryAddressJson);
//                       if (AllOffer && AllOffer.length > 0) {
//                         const isEmployeeForOffer = user?.status === "Employee";
//                         const acquisitionChannelForOffer = isEmployeeForOffer ? "employee" : (user?.acquisition_channel || "organic");
                        
//                         const validOffers = AllOffer.filter((offer) => {
//                           const hubMatches = offer?.hubId === primaryAddress?.hubId;
//                           const acquisitionChannelMatch = offer?.acquisition_channel === acquisitionChannelForOffer;
//                           const offerStartDate = new Date(offer?.startDate);
//                           const offerEndDate = new Date(offer?.endDate);
//                           const deliverydate = new Date(item.deliveryDate);
//                           const isWithinDateRange = deliverydate >= offerStartDate && deliverydate <= offerEndDate;
//                           return hubMatches && isWithinDateRange && acquisitionChannelMatch;
//                         });

//                         if (validOffers.length > 0) {
//                           checkOf = validOffers
//                             .flatMap((offer) => offer?.products || [])
//                             .find((product) => product?.foodItemId == item?._id?.toString());
//                         }
//                       }
//                     } catch (error) {
//                       console.error("Error parsing primaryAddress:", error);
//                     }
//                   }

//                   if (!matchedLocation) {
//                     matchedLocation = {
//                       Remainingstock: 0,
//                       hubPrice: item.hubPrice || item.basePrice || 0,
//                       preOrderPrice: item.preOrderPrice || 0,
//                       basePrice: item.basePrice || 0,
//                     };
//                   }
//                   const { price: effectivePrice } = getEffectivePrice(item, matchedLocation, item?.session, true);
                  
//                   return (
//                     <div key={item._id?.toString() || i} className="col-6 col-md-6 mb-2 d-flex justify-content-center">
//                       <div className="mobl-product-card">
//                         <div className="productborder">
//                           <div className="prduct-box rounded-1 cardbx">
//                             <div onClick={() => showDrawer(item)} className="imagebg">
//                               {item?.foodcategory === "Veg" ? (
//                                 <img src={IsVeg} alt="IsVeg" className="isVegIcon" />
//                               ) : (
//                                 <img src={IsNonVeg} alt="IsNonVeg" className="isVegIcon" />
//                               )}
//                               <img src={`${item?.Foodgallery[0]?.image2}`} alt="" className="mbl-product-img" />
//                             </div>
//                           </div>
//                           {item?.foodTags && (
//                             <div className="food-tag-container">
//                               {item.foodTags.map((tag, idx) => (
//                                 <span key={idx} className="food-tag-pill" style={{ backgroundColor: tag.tagColor }}>
//                                   <img src={chef} alt="" style={{ width: "10px", height: "10px", marginRight: "2px" }} />
//                                   {tag.tagName}
//                                 </span>
//                               ))}
//                             </div>
//                           )}

//                           <div className="food-name-container">
//                             <p className="food-name">{item?.foodname}</p>
//                             <small className="food-unit">{item?.unit}</small>
//                           </div>

//                           <div className="d-flex align-items-center mb-3" style={{ gap: "8px", flexWrap: "nowrap" }}>
//                             {matchedLocation?.basePrice && matchedLocation?.basePrice !== effectivePrice && parseFloat(matchedLocation?.basePrice) !== parseFloat(effectivePrice) ? (
//                               <div className="align-items-start" style={{ textDecoration: "line-through", color: "#6b6b6b", fontSize: "15px", whiteSpace: "nowrap", flexShrink: 0, display: "flex", gap: "2px", marginLeft: "7px" }}>
//                                 <span className="fw-normal">₹</span>
//                                 <span>{matchedLocation?.basePrice}</span>
//                               </div>
//                             ) : null}

//                             <div className="align-items-start" style={{ color: "#2c2c2c", fontFamily: "Inter", fontSize: "20px", fontWeight: "500", lineHeight: "25px", letterSpacing: "-0.8px", whiteSpace: "nowrap", flexShrink: 0, display: "flex", gap: "2px" }}>
//                               {checkOf ? (
//                                 <div className="d-flex align-items-start gap-2">
//                                   <div className="align-items-start" style={{ display: "flex", gap: "2px" }}>
//                                     <span className="fw-bold">₹</span>
//                                     <span style={{ textDecoration: "line-through", color: "#6b6b6b", fontSize: "15px", fontWeight: "400", lineHeight: "18px", letterSpacing: "-0.6px", marginTop: "4px" }}>{effectivePrice}</span>
//                                   </div>
//                                   <div className="align-items-start" style={{ display: "flex", gap: "2px", marginLeft: "5px" }}>
//                                     <span className="fw-normal">₹</span>
//                                     <span>{checkOf?.price}</span>
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <div className="align-items-start" style={{ display: "flex", gap: "1px", marginLeft: "6px" }}>
//                                   <span className="fw-bold">₹</span>
//                                   <span>{effectivePrice}</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>

//                           <div>
//                             <div className="guaranteed-label">
//                               <img src={availabity} alt="" style={{ width: "11px", height: "11px" }} /> Guaranteed Availability
//                             </div>
//                           </div>

//                           <div className="d-flex justify-content-center mb-2">
//                             {getCartQuantity(item?._id) === 0 ? (
//                               address && gifUrl === "Closed.gif" ? (
//                                 <button className="add-to-cart-btn-disabled" disabled>
//                                   <span className="add-to-cart-btn-text">Add</span>
//                                   <FaPlus className="add-to-cart-btn-icon" />
//                                 </button>
//                               ) : (
//                                 <button
//                                   className={`add-to-cart-btn ${(user && !address) || !cutoffValidation.allowed ? "disabled-btn" : ""}`}
//                                   onClick={() => addCart1(item, checkOf, matchedLocation)}
//                                   disabled={(user && !address) || !cutoffValidation.allowed}
//                                 >
//                                   <div className="pick-btn-text">
//                                     <span className="pick-btn-text1">PICK</span>
//                                     <span className="pick-btn-text2">Confirm Later</span>
//                                   </div>
//                                   <span className="add-to-cart-btn-icon"><FaPlus /></span>
//                                 </button>
//                               )
//                             ) : getCartQuantity(item?._id) > 0 ? (
//                               <button className="increaseBtn">
//                                 <div
//                                   className="faplus"
//                                   onClick={() => !(user && !address) && decreaseQuantity(item?._id, checkOf, matchedLocation)}
//                                   style={{ opacity: user && !address ? 0.5 : 1, pointerEvents: user && !address ? "none" : "auto" }}
//                                 >
//                                   <FaMinus />
//                                 </div>
//                                 <div className="faQuantity">{getCartQuantity(item?._id)}</div>
//                                 <div
//                                   className="faplus"
//                                   onClick={() => !(user && !address) && increaseQuantity(item?._id, checkOf, item, matchedLocation)}
//                                   style={{ opacity: user && !address ? 0.5 : 1, pointerEvents: user && !address ? "none" : "auto" }}
//                                 >
//                                   <FaPlus />
//                                 </div>
//                               </button>
//                             ) : gifUrl === "Closed.gif" ? (
//                               <button className="add-to-cart-btn" disabled>
//                                 <span className="add-to-cart-btn-text">Add</span>
//                                 <span className="add-to-cart-btn-icon"><FaPlus /></span>
//                               </button>
//                             ) : (
//                               <button
//                                 className="add-to-cart-btn"
//                                 onClick={() => addCart1(item, checkOf, matchedLocation)}
//                                 disabled={user && !address}
//                                 style={{ opacity: user && !address ? 0.5 : 1 }}
//                               >
//                                 <span className="add-to-cart-btn-text">Add</span>
//                                 <span className="add-to-cart-btn-icon"><FaPlus /></span>
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}

//                 {!loader && finalDisplayItems.length === 0 && (
//                   <div className="col-12 text-center my-5">
//                     {user && (!localStorage.getItem("primaryAddress") || localStorage.getItem("primaryAddress") === "null") ? (
//                       <div>
//                         <h4>No location selected.</h4>
//                         <p>Please add your location to view the menu for your area.</p>
//                         <button
//                           className="mt-2"
//                           onClick={() => navigate("/location")}
//                           style={{ backgroundColor: "#6B8E23", color: "white", padding: "10px 20px", borderRadius: "5px", border: "none" }}
//                         >
//                           Add Location
//                         </button>
//                       </div>
//                     ) : (
//                       <>
//                         <h4>No items available for this slot.</h4>
//                         <p>Please check back later or select a different day!</p>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <MultiCartDrawer
//           proceedToPlan={proceedToPlan}
//           groupedCarts={groupedCarts}
//           overallSubtotal={overallSubtotal}
//           overallTotalItems={overallTotalItems}
//           onJumpToSlot={handleSelectionChange}
//         />

//         <Modal show={show3} backdrop="static" onHide={handleClose3}>
//           <Modal.Header closeButton>
//             <Modal.Title className="d-flex align-items-center gap-1">
//               <FaLock color="#6B8E23" /> <span>Welcome to Dailydish</span>
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form>
//               <div className="login-whatsappwithicon">
//                 <FaSquareWhatsapp size={42} color="green" />
//                 <Form.Control
//                   type="number"
//                   placeholder="Enter Your WhatsApp Number"
//                   value={Mobile}
//                   onChange={(e) => setMobile(e.target.value)}
//                 />
//               </div>
//               <Button
//                 variant=""
//                 style={{ width: "100%", marginTop: "24px", backgroundColor: "#6B8E23", color: "white", textAlign: "center" }}
//                 onClick={() => {
//                   if (!validateIndianMobileNumber(Mobile)) {
//                     Swal2.fire({
//                       toast: true,
//                       position: "bottom",
//                       icon: "error",
//                       title: `Invalid mobile number`,
//                       showConfirmButton: false,
//                       timer: 3000,
//                       timerProgressBar: true,
//                       customClass: { popup: "me-small-toast", title: "me-small-toast-title" },
//                     });
//                     return;
//                   }
//                   userLogin();
//                 }}
//               >
//                 Send otp
//               </Button>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleClose3}>Close</Button>
//           </Modal.Footer>
//         </Modal>

//         <Modal
//           show={show2}
//           onHide={handleClose2}
//           size="sm"
//           style={{ zIndex: "99999", position: "absolute", top: "30%", left: "0%" }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Enter OTP</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <span style={{ fontSize: "13px" }}>An OTP has been sent to your Phone Number</span>
//             <div className="d-flex gap-1 mt-3 mb-3">
//               <InputGroup className="mb-2" style={{ background: "white" }}>
//                 <Form.Control
//                   type={PasswordShow ? "text" : "password"}
//                   className="login-input"
//                   placeholder="Enter OTP"
//                   aria-describedby="basic-addon1"
//                   onChange={(e) => setOTP(e.target.value)}
//                 />
//                 <Button
//                   variant=""
//                   style={{ borderRadius: "0px", border: "1px solid black" }}
//                   onClick={() => setPasswordShow(!PasswordShow)}
//                   className="passbtn"
//                 >
//                   {PasswordShow ? <FaEye /> : <FaEyeSlash />}
//                 </Button>
//               </InputGroup>
//             </div>
//             <div>
//               <Button
//                 variant=""
//                 style={{ width: "100%", marginTop: "24px", backgroundColor: "#6B8E23", color: "white", textAlign: "center" }}
//                 onClick={verifyOTP}
//               >
//                 Continue
//               </Button>
//             </div>
//           </Modal.Body>
//         </Modal>

//         <Drawer
//           placement="bottom"
//           closable={false}
//           onClose={onClose}
//           open={open}
//           key="bottom"
//           height={600}
//           className="description-product"
//           style={{ zIndex: 99999 }}
//           zIndex={99999}
//         >
//           <div className="modal-container-food">
//             <button className="custom-close-btn" onClick={onClose}>×</button>
//             <div className="modern-food-item">
//               <div className="food-image-container">
//                 <div className="image-loading-spinner" id="image-spinner"></div>
//                 {foodData?.Foodgallery?.length > 0 && (
//                   <img
//                     src={`${foodData.Foodgallery[0].image2}`}
//                     alt={foodData?.foodname}
//                     className="modern-food-image"
//                     onLoad={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       const image = document.querySelector(".modern-food-image");
//                       if (spinner) spinner.classList.add("hidden");
//                       if (image) image.classList.add("loaded");
//                     }}
//                     onError={() => {
//                       const spinner = document.getElementById("image-spinner");
//                       if (spinner) spinner.classList.add("hidden");
//                     }}
//                   />
//                 )}
//                 <div className="food-category-icon">
//                   {foodData?.foodcategory === "Veg" ? (
//                     <img src={IsVeg} alt="IsVeg" className="isVegIcon" />
//                   ) : (
//                     <img src={IsNonVeg} alt="IsNonVeg" className="isVegIcon" />
//                   )}
//                 </div>
//               </div>

//               <div className="food-details">
//                 <h2 className="food-title">{foodData?.foodname}</h2>
//                 <p className="food-description">{foodData?.fooddescription}</p>

//                 {(() => {
//                   const matchedLocation = foodData?.locationPrice?.length > 0
//                     ? foodData.locationPrice[0]
//                     : { Remainingstock: 0, hubPrice: foodData.hubPrice || foodData.basePrice || 0, preOrderPrice: foodData.preOrderPrice || 0, basePrice: foodData.basePrice || 0 };

//                   const checkOffer = AllOffer?.find(
//                     (offer) => offer?.locationId?._id === address?._id && offer?.products?.map((product) => product._id).includes(foodData?._id)
//                   );

//                   const eff = getEffectivePrice(foodData, matchedLocation, foodData?.session, true);
//                   const currentPrice = checkOffer ? checkOffer.price : eff.price;
//                   const originalPrice = eff.price;
//                   const stockCount = matchedLocation?.Remainingstock || 0;

//                   return (
//                     <>
//                       <div className="pricing-section">
//                         <div className="pricing-display">
//                           <span className="current-price">₹{currentPrice}</span>
//                           {checkOffer && <span className="original-price" style={{ marginLeft: "10px" }}>₹{originalPrice}</span>}
//                         </div>
//                         <div className="availability-banner">
//                           {stockCount > 0 ? (
//                             <>{checkOffer && <BiSolidOffer color="green" style={{ marginRight: "5px" }} />}</>
//                           ) : "Sold Out"}
//                         </div>
//                       </div>

//                       {getCartQuantity(foodData?._id) > 0 ? (
//                         <div className="increaseBtn">
//                           <div
//                             className="faplus"
//                             onClick={() => { if (!(user && !address)) decreaseQuantity(foodData?._id, checkOffer, matchedLocation); }}
//                             style={{ opacity: user && !address ? 0.5 : 1, pointerEvents: user && !address ? "none" : "auto" }}
//                           >
//                             <FaMinus />
//                           </div>
//                           <div className="faQuantity">{getCartQuantity(foodData?._id)}</div>
//                           <div
//                             className="faplus"
//                             onClick={() => { if (!(user && !address)) increaseQuantity(foodData?._id, checkOffer, foodData, matchedLocation); }}
//                             style={{ opacity: user && !address ? 0.5 : 1, pointerEvents: user && !address ? "none" : "auto" }}
//                           >
//                             <FaPlus />
//                           </div>
//                         </div>
//                       ) : stockCount > 0 && gifUrl !== "Closed.gif" ? ("") : (
//                         <button className={gifUrl === "Closed.gif" ? "add-to-cart-btn-disabled" : "sold-out-btn"} disabled>
//                           <span className="add-to-cart-btn-text">{gifUrl === "Closed.gif" ? "Closed" : "Sold Out"}</span>
//                         </button>
//                       )}
//                     </>
//                   );
//                 })()}
//               </div>
//             </div>
//           </div>
//         </Drawer>
//       </div>

//       <div style={{ marginBottom: "80px" }}>
//         <Footer />
//       </div>

//       <BottomNav />
//     </div>
//   );
// };

// const TabsComponent = ({ tabs, activeTab, onTabClick }) => {
//   return (
//     <div className="tabs-container2">
//       <div className="tabs-scroll-container">
//         <div className="tabs-scroll">
//           {tabs.map((tab) => (
//             <button
//               key={tab}
//               className={`tab-button ${activeTab === tab ? "active" : ""}`}
//               onClick={() => onTabClick(tab)}
//             >
//               <span className="tab-button-text">{tab}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//       <style jsx>{`
//         .tabs-container2 {
//           background-color: ${Colors.creamWalls};
//           border-bottom-left-radius: 16px;
//           border-bottom-right-radius: 16px;
//           position: relative;
//           border-bottom: 2px solid #fff;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05);
//         }
//         .tabs-scroll-container {
//           overflow-x: auto;
//           -webkit-overflow-scrolling: touch;
//           scrollbar-width: none;
//         }
//         .tabs-scroll-container::-webkit-scrollbar {
//           display: none;
//         }
//         .tabs-scroll {
//           display: inline-flex;
//           min-width: 100%;
//           gap: 10px;
//           padding: 0 4px;
//         }
//         .tab-button {
//           display: inline-flex;
//           justify-content: center;
//           align-items: center;
//           padding: 8px 24px;
//           border-radius: 20px;
//           border: none;
//           background: transparent;
//           cursor: pointer;
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//           white-space: nowrap;
//           flex-shrink: 0;
//           min-height: 25px;
//         }
//         .tab-button:hover {
//           background-color: ${Colors.warmbeige}40;
//           transform: translateY(-1px);
//         }
//         .tab-button.active {
//           background-color: ${Colors.greenCardamom};
//           padding: 4px 8px;
//           box-shadow: 0 2px 8px ${Colors.greenCardamom}80;
//           width: auto;
//           height: auto;
//           border-radius: 20px;
//         }
//         .tab-button.active:hover {
//           background-color: ${Colors.greenCardamom}E6;
//           transform: translateY(-1px) scale(1.02);
//         }
//         .tab-button-text {
//           font-family: "Inter", sans-serif;
//           fontsize: 14px;
//           font-weight: 400;
//           line-height: 18px;
//           letter-spacing: -0.7px;
//           color: ${Colors.primaryText};
//           transition: all 0.3s ease;
//         }
//         .tab-button.active .tab-button-text {
//           font-family: "Inter", sans-serif;
//           fontsize: 16px;
//           font-weight: 900;
//           line-height: 21px;
//           letter-spacing: -0.8px;
//           color: ${Colors.appForeground};
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Home