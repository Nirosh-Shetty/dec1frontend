// import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
// import "../Styles/Banner.css";

// import { Button, Modal, Form, Dropdown, InputGroup } from "react-bootstrap";
// import { FaUser, FaEye, FaEyeSlash, FaWallet } from "react-icons/fa";

// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
// // import TextField from "@mui/material/TextField";
// // import Autocomplete from "@mui/material/Autocomplete";
// // import ApartmentIcon from "@mui/icons-material/Apartment"; // Icon to represent apartments
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// // import Nav from "react-bootstrap/Nav";
// // import { MdAccountCircle } from "react-icons/md";
// // import { MdOutlineLogout } from "react-icons/md";
// import { FaLock } from "react-icons/fa";
// // import { BiMessageDetail } from "react-icons/bi";
// // import { IoLogoYoutube, IoSearchCircleOutline } from "react-icons/io5";
// // import { ImSpoonKnife } from "react-icons/im";
// // import Offcanvas from "react-bootstrap/Offcanvas";
// // import { IoMdHeart } from "react-icons/io";
// // import { GrDocumentUser } from "react-icons/gr";
// import Swal2 from "sweetalert2";
// import swal from "sweetalert";

// import { FaSquareWhatsapp } from "react-icons/fa6";
// import { WalletContext } from "../WalletContext";

// import Selectlocation from "../assets/selectlocation.svg";
// import UserIcons from "../assets/userp.svg";
// import clockone from "./../assets/mynaui_clock-one.png";
// import switch2 from "./../assets/switch.png";

// // import SearchIcon from "../assets/search.svg";
// // import Logo from "../assets/logo-container.svg";
// import UserBanner from "./UserBanner";
// import ProfileOffcanvas from "./Navbar2";
// import LocationModal from "./LocationModal";
// import LocationModal2 from "./LocationModal2";

// // const Banner = ({ Carts, getAllOffer, hubName, setHubName }) => {
// const Banner = ({ Carts, getAllOffer, isVegOnly, setIsVegOnly }) => {
//   const addresstype = localStorage.getItem("addresstype");
//   const corporateaddress = JSON.parse(localStorage.getItem("coporateaddress"));
//   const user = JSON.parse(localStorage.getItem("user"));

//   const navigate = useNavigate("");
//   const [OTP, setOTP] = useState(["", "", "", ""]);
//   const [PasswordShow, setPasswordShow] = useState(false);

//   const { wallet, walletSeting, rateorder, rateMode } =
//     useContext(WalletContext);
//   const [show, setShow] = useState(false);
//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);

//   const [show2, setShow2] = useState(false);
//   const handleClose2 = () => setShow2(false);
//   const handleShow2 = () => setShow2(true);
//   const [showCart, setShowCart] = useState(false);

//   const [show3, setShow3] = useState(false);
//   const handleClose3 = () => setShow3(false);
//   const handleShow3 = () => {
//     handleClose4();
//     setShow3(true);
//   };

//   const [show4, setShow4] = useState(false);
//   const handleShow4 = () => setShow4(true);
//   const handleClose4 = () => setShow4(false);

//   const [show5, setShow5] = useState(false);
//   const handleClose5 = () => setShow5(false);
//   const handleShow5 = () => setShow5(true);

//   const [show7, setShow7] = useState(false);
//   const handleClose7 = () => setShow7(false);
//   const handleShow7 = () => setShow7(true);
//   const [Mobile, setMobile] = useState("");

//   const [addresses, setAddresses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [expandedSections, setExpandedSections] = useState({});

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
//     try {
//       const config = {
//         url: "/User/Sendotp",
//         method: "post",
//         baseURL: "https://dd-merge-backend-2.onrender.com/api",
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
//           title: `Error sending OTP`,
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
//         handleClose3();
//         handleShow7();
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

//   const [show8, setShow8] = useState(false);
//   const handleClose8 = () => setShow8(false);
//   const handleShow8 = () => setShow8(true);

//   const handleShowCart = () => setShowCart(true);

//   const phoneNumber = "7204188504";
//   const message = "Hello! I need assistance.";
//   const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
//     message
//   )}`;

//   const logOut = () => {
//     swal({
//       title: "Yeah!",
//       text: "Successfully Logged Out",
//       icon: "success",
//       button: "Ok!",
//     });
//     setTimeout(() => {
//       window.location.assign("/");
//     }, 5000);
//     localStorage.clear();
//   };

//   const [apartmentdata, setapartmentdata] = useState([]);
//   const getapartmentd = async () => {
//     try {
//       let res = await axios.get("https://dd-merge-backend-2.onrender.com/api/admin/getapartment");
//       if (res.status === 200) {
//         setapartmentdata(res.data.corporatedata);
//       }
//     } catch (error) {
//       // console.log(error);
//     }
//   };

//   useEffect(() => {
//     getapartmentd();
//   }, []);

//   const [corporatedata, setcorporatedata] = useState([]);
//   const getcorporate = async () => {
//     try {
//       let res = await axios.get("https://dd-merge-backend-2.onrender.com/api/admin/getcorporate");
//       if (res.status === 200) {
//         setcorporatedata(res.data.corporatedata);
//       }
//     } catch (error) {
//       // console.log(error);
//     }
//   };

//   useEffect(() => {
//     getcorporate();
//   }, []);

//   const [storyLength, setStoryLength] = useState(0);

//   useEffect(() => {
//     const getAddWebstory = async () => {
//       try {
//         let res = await axios.get("https://dd-merge-backend-2.onrender.com/api/admin/getstories");
//         if (res.status === 200) {
//           setStoryLength(res.data.getbanner.length);
//         }
//       } catch (error) {
//         // console.log(error);
//       }
//     };
//     getAddWebstory();
//   }, []);

//   const address = JSON.parse(
//     localStorage.getItem(
//       addresstype === "apartment" ? "address" : "coporateaddress"
//     )
//   );

//   const Handeledata = (ab, def) => {
//     try {
//       if (ab) {
//         if (!user) return navigate("/", { replace: true });
//         let data = JSON.parse(ab);
//         const addressData = {
//           Address: data?.Address,
//           Delivarycharge: data?.apartmentdelivaryprice,
//           doordelivarycharge: data?.doordelivaryprice,
//           apartmentname: data?.Apartmentname,
//           pincode: data?.pincode,
//           approximatetime: data?.approximatetime,
//           prefixcode: data?.prefixcode,
//           name: ab?.Name || user?.Fname || "",
//           flatno: ab?.fletNumber || "",
//           mobilenumber: ab?.Number || user?.Mobile || "",
//           towerName: ab?.towerName ? ab?.towerName : "",
//           lunchSlots: data?.lunchSlots ? data?.lunchSlots : [],
//           dinnerSlots: data?.dinnerSlots ? data?.dinnerSlots : [],
//           deliverypoint: data?.deliverypoint ? data?.deliverypoint : "",
//           locationType: data?.locationType || "",
//         };
//         if (!def) {
//           saveSelectedAddress(data);
//         }

//         if (addresstype === "apartment") {
//           localStorage.setItem("address", JSON.stringify(addressData));
//         } else {
//           localStorage.setItem("coporateaddress", JSON.stringify(addressData));
//         }
//       }
//     } catch (error) {
//       // console.log(error);
//     }
//   };

//   //Request Location
//   const [Name, setName] = useState("");
//   const [Number, setNumber] = useState("");
//   const [ApartmentName, setApartmentName] = useState("");
//   const [Message, setMessage] = useState("");

//   function validateIndianMobileNumber(mobileNumber) {
//     const regex = /^[6-9]\d{9}$/;
//     return regex.test(mobileNumber);
//   }

//   const Requestaddress = async () => {
//     try {
//       if (!Name) {
//         return alert("Please Add Your Name");
//       }
//       if (!Number) {
//         return alert("Please Add Your Contact Number");
//       }
//       if (!ApartmentName) {
//         return alert("Please Add Apartment Name");
//       }
//       if (!Message) {
//         return alert("Please Add Your Address");
//       }
//       if (!validateIndianMobileNumber(Number)) {
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
//       const config = {
//         url: "User/EnquiryEnquiry",
//         method: "post",
//         baseURL: "https://dd-merge-backend-2.onrender.com/api/",
//         header: { "content-type": "application/json" },
//         data: {
//           Name: Name,
//           Number: Number,
//           ApartmentName: ApartmentName,
//           Message: Message,
//         },
//       };
//       const res = await axios(config);
//       if (res.status === 200) {
//         toast.success("Request Submitted Successfully.");
//         handleClose2();
//         setName("");
//         setNumber("");
//         setApartmentName("");
//         setMessage("");
//       }
//     } catch (error) {
//       // console.log(error);
//     }
//   };

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
//         baseURL: "https://dd-merge-backend-2.onrender.com/api/",
//         header: { "content-type": "application/json" },
//         data: {
//           Mobile: Mobile,
//           otp: OTP,
//         },
//       };
//       const res = await axios(config);
//       if (res.status === 200) {
//         localStorage.setItem("user", JSON.stringify(res.data.details));
//         sessionStorage.setItem("user", JSON.stringify(res.data.details));
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
//         window.location.reload();
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

//   const [selectedAddress, setSelectedAddress] = useState({});

//   const getSelectedAddress = async () => {
//     try {
//       let res = await axios.get(
//         `https://dd-merge-backend-2.onrender.com/api/user/getSelectedAddressByUserIDAddType/${user?._id}/${addresstype}`
//       );
//       if (res.status === 200) {
//         setSelectedAddress(res.data.getdata);
//       }
//     } catch (error) {
//       // console.log(error);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       getSelectedAddress();
//     }
//   }, []);

//   useEffect(() => {
//     if (selectedAddress) {
//       if (addresstype === "apartment") {
//         const am = apartmentdata.find(
//           (ele) => ele?._id?.toString() === selectedAddress?.addressid
//         );
//         if (am) {
//           Handeledata(JSON.stringify({ ...am, ...selectedAddress }), "def");
//         }
//       } else {
//         const co = corporatedata.find(
//           (ele) => ele?._id?.toString() === selectedAddress?.addressid
//         );
//         if (co) {
//           Handeledata(JSON.stringify({ ...co, ...selectedAddress }), "def");
//         }
//       }
//     }
//   }, [selectedAddress, addresstype, apartmentdata, corporatedata]);

//   const saveSelectedAddress = async (data) => {
//     try {
//       if (!user) return;
//       let res = await axios.post(`https://dd-merge-backend-2.onrender.com/api/user/addressadd`, {
//         Name: user?.Fname,
//         Number: user?.Mobile,
//         userId: user?._id,
//         ApartmentName: data?.Apartmentname,
//         addresstype: addresstype,
//         addressid: data?._id,
//       });
//     } catch (error) {
//       // console.log(error);
//     }
//   };

//   const inputRef = useRef(null);
//   const [open, setOpen] = useState(false);
//   const [searchValue, setSearchValue] = useState("");

//   // Get customer ID from localStorage
//   const getCustomerId = () => {
//     return user?._id;
//   };

//   // Get auth headers
//   const getAuthHeaders = () => {
//     const token = localStorage.getItem("token");
//     return {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     };
//   };

//   const [userData, setUserData] = useState([]);
//   const [alert, setAlert] = useState({ show: false, message: "", type: "" });

//   const showAlert = (message, type) => {
//     setAlert({ show: true, message, type });
//     setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
//   };

//   const [primaryAddressId, setPrimaryAddressId] = useState(null);
//   const [primaryAddress, setPrimaryAddress] = useState(null);

//   // 1. Wrap fetchAddresses in useCallback to keep the function stable
//   const fetchAddresses = React.useCallback(async () => {
//     try {
//       setLoading(true);
//       const customerId = user?._id; // Safe access

//       if (!customerId) {
//         // Don't throw error here, just return, allows for smoother logout/no-user state
//         return;
//       }

//       const response = await fetch(
//         `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/addresses`,
//         {
//           method: "GET",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch addresses");
//       }

//       const result = await response.json();

//       if (result.success) {
//         const addresses = result.addresses || [];
//         setAddresses(addresses);
//         setPrimaryAddressId(result.primaryAddress || null);

//         const primaryAddr = addresses.find(
//           (addr) => addr._id === result.primaryAddress
//         );
//         setPrimaryAddress(primaryAddr || null);
//         // if (primaryAddr) {
//         //         localStorage.setItem("primaryAddress", JSON.stringify(primaryAddr));
//         //     }
//         //      else {
//         //         localStorage.removeItem("currentLocation"); // Clean up if no primary exists
//         //     }

//         if (addresses && addresses.length > 0) {
//           const firstType = addresses[0].addressType;
//           setExpandedSections({ [firstType]: true });
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching addresses:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [user?._id]); // Re-create function only if ID changes

//   // 2. Update the useEffect to depend on user._id (or the memoized function)
//   useEffect(() => {
//     if (user?._id) {
//       fetchAddresses();
//     }
//   }, [fetchAddresses]);

//   // ... existing code ...

//   // Handle location click - show toast and redirect if not logged in
//   const handleLocationClick = () => {
//     // if (!user) {
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
//     //   setTimeout(() => {
//     //     navigate("/", { replace: true });
//     //   }, 1000);
//     //   return;
//     // }
//     // If user is logged in, open location modal
//     setShowLocationModal(true);
//   };

//   const [currentLocation, setCurrentLocation] = useState(null);

//   // ✅ Load from localStorage on component mount
//   useEffect(() => {
//     const savedLocation = localStorage.getItem("currentLocation");
//     if (savedLocation) {
//       try {
//         setCurrentLocation(JSON.parse(savedLocation));
//       } catch (e) {
//         console.error("Invalid JSON in localStorage:", e);
//       }
//     }
//   }, []);

//   // ✅ Save to localStorage when currentLocation changes
//   useEffect(() => {
//     if (currentLocation) {
//       localStorage.setItem("currentLocation", JSON.stringify(currentLocation));
//     }
//   }, [currentLocation]);

//   // Set hubName when addresses are loaded
//   // ✅ Set hubName from primaryAddress or currentLocation
//   // useEffect(() => {
//   //   if (setHubName) {
//   //     if (primaryAddress?.hubName) {
//   //       // Use hubName from primaryAddress if available
//   //       setHubName(primaryAddress.hubName
//   // );
//   //     } else if (currentLocation?.hubName) {
//   //       // Fall back to hubName from currentLocation
//   //       setHubName(currentLocation.hubName);
//   //     }
//   //     // If neither has hubName, don't set anything (or set to empty string if needed)
//   //   }
//   // }, [primaryAddress, currentLocation, setHubName]);

//   // Get display name for address
//   const getDisplayName = (address) => {
//     if (!address) return "";

//     console.log(address, ".................................");

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
//         return address.fullAddress || "";
//     }
//   };

//   // Get display address text
//   const getDisplayAddress = () => {
//     // Priority 1: Primary address (selected by user)
//     if (primaryAddress) {
//       return getDisplayName(primaryAddress);
//     }

//     // Priority 2: Current location (temporary selection)
//     if (currentLocation?.fullAddress) {
//       return currentLocation.fullAddress;
//     }

//     // Priority 3: Any saved address (fallback)
//     if (addresses.length > 0) {
//       return getDisplayName(addresses[0]);
//     }

//     // Default fallback
//     return "Select Location";
//   };

//   return (
//     <div>
//       <div className="ban-container">
//         <div className="mobile-banner-updated">
//           <div className="screen-3"
//           style={{ padding:"0 24px 8px 24px"}}>
//             <div className="screen-2 mb-3 mt-2 d-flex align-items-center">
//               {/* <div className="w-100"> */}
//               {/* <div className="d-flex flex-column align-items-start gap-3"
//                   style={{ height:"100%" }}
//               > */}
//                 <div
//                   className="d-flex align-items-center gap-2 w-100"
//                   onClick={handleLocationClick}
//                   style={{ cursor: "pointer"}}
//                 >
//                   <img
//                     src={Selectlocation}
//                     alt="select-location"
//                     className="flex-shrink-0"
//                     style={{ width: "32px", height: "32px" }}
//                   />

//                   <div className="d-flex flex-column cursor-pointer flex-grow-1 aligen-center"
//                   // style={{
//                   //   // height:"100%"
//                   // }}
//                   >
//                     <p
//                       className="select-location-text fw-semibold text-truncate mb-0 banner-address-line"
//                       // style={{ maxWidth: "220px" }}
//                       title={getDisplayAddress()}
//                     >
//                       {getDisplayAddress()}
//                     </p>

//                     {user && (
//                       <p
//                         className="select-location-text-small mb-0 banner-user-details"
//                         style={{
//                           color: "rgba(255, 255, 255, 0.8)",
//                         }}
//                       >
//                         {user?.Fname} | {user?.Mobile}
//                         {primaryAddress && ""}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               {/* </div> */}
//               {/* </div> */}
//               <div className="d-flex gap-1 justify-content-center align-items-center referbtn"
//               >
//                 {user && ( // Only show if user is logged in
//                   <button
//                     className="refer-earn-btn"
//                     onClick={() => navigate("/refer")}
//                   >
//                     <img
//                       src="/Assets/gifticon.svg"
//                       alt="refer"
//                       className="refer-icon"
//                     />
//                     <span className="refer-earn-text">Refer & Earn</span>
//                   </button>
//                 )}

//                 <img
//                   src={UserIcons}
//                   alt="user-icon"
//                   onClick={handleShow8}
//                   className="p-2"
//                 />
//               </div>
//             </div>

//             <div
//               className="d-flex align-items-center m-0 order-row"
//               style={{ width: "100%" }}
//             >
//               {/* LEFT — text area */}
//               <div className="d-flex align-items-center flex-grow-1 min-w-0"
//               style={{gap:"4px"}}>
//                 <img
//                   src={clockone}
//                   alt=""
//                   style={{ width: "24px", height: "24px" }}
//                 />
//                 <span className="clock-text mt-2">
//                   Order by 12 & Get Lunch by 1:00 PM
//                 </span>
//               </div>

//               {/* RIGHT — Veg Only */}
//               <div className="veg-btn d-flex flex-column align-items-center ms-2" onClick={() => setIsVegOnly(!isVegOnly)} >
//                 <h6 className="m-0 veg-title">Veg Only</h6>
//                 <div
//                   className="veg-btn-toggle"
//                   // 1. Toggle state on click
//                   style={{ cursor: "pointer" }}
//                 >
//                   <div
//                     className="veg-btn-switch"
//                     style={{
//                       // 2. Dynamic styling for animation and color
//                       transform: isVegOnly
//                         ? "translateX(18px)"
//                         : "translateX(0)",
//                       backgroundColor: isVegOnly ? "#6B8E23" : "#6c757d", // Green when Active, Grey when inactive
//                       transition: "all 0.3s ease", // Smooth sliding effect
//                     }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {!user && (
//             <div className="benifits-container mb-3">
//               <ul className="benifits-item">
//                 <li className="benifits-text">
//                   ✨ Unlock more with an account:
//                 </li>
//                 <li className="benifits-text">Wallet bonuses 💰</li>
//                 <li className="benifits-text">Loyalty discounts 🎁</li>
//                 <li className="benifits-text">Special member pricing 💡</li>
//                 <li className="benifits-text">
//                   👉 Sign up to redeem (new users only)
//                 </li>
//               </ul>

//               <button
//                 className="signup-button"
//                 onClick={() => navigate("/", { replace: true })}
//               >
//                 Signup
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Request Aprtment modal */}
//         <Modal show={show2} onHide={handleClose2} style={{ zIndex: "99999" }}>
//           <Modal.Header closeButton>
//             <Modal.Title>Request Add {addresstype}</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 Requestaddress();
//               }}
//             >
//               <Form.Control
//                 type="text"
//                 placeholder="Enter Name"
//                 style={{ marginTop: "18px" }}
//                 required
//                 onChange={(e) => setName(e.target.value)}
//               />
//               <Form.Control
//                 type="number"
//                 placeholder="Enter Contact Number"
//                 style={{ marginTop: "18px" }}
//                 required
//                 onChange={(e) => setNumber(e.target.value)}
//                 className="numberremove"
//               />

//               <Form.Control
//                 type="text"
//                 placeholder="Enter Apartment Name"
//                 style={{ marginTop: "18px" }}
//                 required
//                 onChange={(e) => setApartmentName(e.target.value)}
//               />

//               <Form.Control
//                 type="text"
//                 placeholder="Enter Address "
//                 style={{ marginTop: "18px" }}
//                 onChange={(e) => setMessage(e.target.value)}
//               />
//               <button
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   color: "white",
//                   textAlign: "center",
//                   height: "30px",
//                   borderRadius: "6px",
//                   backgroundColor: "orangered",
//                 }}
//                 type="submit"
//               >
//                 Send Request
//               </button>
//             </Form>
//           </Modal.Body>
//         </Modal>
//         <ProfileOffcanvas show={show8} handleClose={handleClose8} />

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
//                     return Swal2.fire({
//                       toast: true,
//                       position: "bottom",
//                       icon: "error",
//                       title: `Invalid Mobile Number`,
//                       showConfirmButton: false,
//                       timer: 3000,
//                       timerProgressBar: true,
//                       customClass: {
//                         popup: "me-small-toast",
//                         title: "me-small-toast-title",
//                       },
//                     });
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
//           show={show7}
//           onHide={handleClose7}
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
//               An OTP has been sent to your whatsapp
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
//                 onClick={verifyOTP}
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//               >
//                 Continue
//               </Button>
//             </div>
//           </Modal.Body>
//         </Modal>
//       </div>

//       <div className="ban-container">
//         <div className="mobile-banner" style={{ position: "relative" }}>
//           {/* {user && !address && (
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
//           )} */}
//           <UserBanner />
//         </div>
//       </div>
//       <LocationModal2
//         show={showLocationModal}
//         onClose={() => {
//           setShowLocationModal(false);
//           // Refresh addresses when modal closes to get updated primary address
//           if (user) {
//             fetchAddresses();
//           }
//         }}
//       />
//     </div>
//   );
// };

// export default Banner;

// import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
// import "../Styles/Banner.css";

// import { Button, Modal, Form, Dropdown, InputGroup } from "react-bootstrap";
// import { FaUser, FaEye, FaEyeSlash, FaWallet, FaMapMarkerAlt, FaSpinner, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { FaLock } from "react-icons/fa";
// import Swal2 from "sweetalert2";
// import swal from "sweetalert";
// import { FaSquareWhatsapp } from "react-icons/fa6";
// import { WalletContext } from "../WalletContext";

// import Selectlocation from "../assets/selectlocation.svg";
// import UserIcons from "../assets/userp.svg";
// import clockone from "./../assets/mynaui_clock-one.png";

// import UserBanner from "./UserBanner";
// import ProfileOffcanvas from "./Navbar2";
// import LocationModal2 from "./LocationModal2";

// const Banner = ({ Carts, getAllOffer, isVegOnly, setIsVegOnly, onLocationDetected  }) => {
//   const addresstype = localStorage.getItem("addresstype");
//   const corporateaddress = JSON.parse(localStorage.getItem("coporateaddress"));
//   const user = JSON.parse(localStorage.getItem("user"));

//   const navigate = useNavigate("");
//   const [OTP, setOTP] = useState(["", "", "", ""]);
//   const [PasswordShow, setPasswordShow] = useState(false);

//   const { wallet, walletSeting, rateorder, rateMode } =
//     useContext(WalletContext);
//   const [show, setShow] = useState(false);
//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);

//   const [show2, setShow2] = useState(false);
//   const handleClose2 = () => setShow2(false);
//   const handleShow2 = () => setShow2(true);
//   const [showCart, setShowCart] = useState(false);

//   const [show3, setShow3] = useState(false);
//   const handleClose3 = () => setShow3(false);
//   const handleShow3 = () => {
//     handleClose4();
//     setShow3(true);
//   };

//   const [show4, setShow4] = useState(false);
//   const handleShow4 = () => setShow4(true);
//   const handleClose4 = () => setShow4(false);

//   const [show5, setShow5] = useState(false);
//   const handleClose5 = () => setShow5(false);
//   const handleShow5 = () => setShow5(true);

//   const [show7, setShow7] = useState(false);
//   const handleClose7 = () => setShow7(false);
//   const handleShow7 = () => setShow7(true);
//   const [Mobile, setMobile] = useState("");

//   const [addresses, setAddresses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [expandedSections, setExpandedSections] = useState({});

//   // New states for automatic location detection
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [locationError, setLocationError] = useState(null);
//   const [isCheckingServiceability, setIsCheckingServiceability] = useState(false);
//   const [isServiceable, setIsServiceable] = useState(null);
//   const [showServiceablePopup, setShowServiceablePopup] = useState(false);
//   const [serviceRequestName, setServiceRequestName] = useState("");
//   const [serviceRequestPhone, setServiceRequestPhone] = useState("");
//   const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
//   const [isLocationEnabled, setIsLocationEnabled] = useState(true);

//   // Function to get location using browser's geolocation API
//   const getCurrentLocation = useCallback(() => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         setIsLocationEnabled(false);
//         reject(new Error("Geolocation is not supported by your browser"));
//         return;
//       }

//       setIsLocating(true);
//       setLocationError(null);

//       // Set a timeout for location detection
//       const locationTimeout = setTimeout(() => {
//         setIsLocating(false);
//         reject(new Error("Location request timed out"));
//       }, 15000);

//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           clearTimeout(locationTimeout);
//           try {
//             const { latitude, longitude } = position.coords;

//             console.log("Raw coordinates:", { latitude, longitude });

//             // Get more accurate address using multiple methods
//             const address = await getAccurateAddress(latitude, longitude);

//             const locationData = {
//               lat: latitude,
//               lng: longitude,
//               fullAddress: address,
//               isAutoDetected: true,
//               timestamp: new Date().toISOString(),
//               addressType: "Current Location",
//               houseName: "Current Location",
//               location: {
//                 type: "Point",
//                 coordinates: [longitude, latitude]
//               }
//             };

//             console.log("Location data:", locationData);

//             // Save to localStorage
//             localStorage.setItem("currentLocation", JSON.stringify(locationData));

//             setCurrentLocation(locationData);
//             setIsLocating(false);

//             // Check serviceability after getting location
//             checkServiceability(latitude, longitude, address);

//             resolve(locationData);
//           } catch (error) {
//             clearTimeout(locationTimeout);
//             setIsLocating(false);
//             setLocationError("Could not get address from coordinates");
//             reject(error);
//           }
//         },
//         (error) => {
//           clearTimeout(locationTimeout);
//           setIsLocating(false);
//           let errorMessage = "Unable to get your location";

//           switch(error.code) {
//             case error.PERMISSION_DENIED:
//               errorMessage = "Location permission denied. Please enable location services.";
//               setIsLocationEnabled(false);
//               break;
//             case error.POSITION_UNAVAILABLE:
//               errorMessage = "Location information is unavailable.";
//               break;
//             case error.TIMEOUT:
//               errorMessage = "Location request timed out.";
//               break;
//             default:
//               errorMessage = "An unknown error occurred.";
//               break;
//           }

//           setLocationError(errorMessage);
//           reject(new Error(errorMessage));
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 0
//         }
//       );
//     });
//   }, []);

//   // Multiple methods to get accurate address
//   const getAccurateAddress = async (lat, lng) => {
//     try {
//       // Try method 1: Use browser's built-in reverse geocoding (most accurate)
//       if (navigator.geolocation && navigator.geolocation.reverseGeocode) {
//         try {
//           const addresses = await navigator.geolocation.reverseGeocode({
//             latitude: lat,
//             longitude: lng
//           });
//           if (addresses && addresses[0]) {
//             return formatBrowserAddress(addresses[0]);
//           }
//         } catch (e) {
//           console.log("Browser reverse geocoding failed:", e);
//         }
//       }

//       // Try method 2: Use Google Maps API if available
//       const googleApiKey = import.meta.env.VITE_MAP_KEY;
//       if (googleApiKey) {
//         try {
//           const response = await fetch(
//             `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}&result_type=street_address|premise`
//           );

//           if (response.ok) {
//             const data = await response.json();
//             if (data.status === 'OK' && data.results[0]) {
//               return data.results[0].formatted_address;
//             }
//           }
//         } catch (e) {
//           console.log("Google geocoding failed:", e);
//         }
//       }

//       // Fallback: Return coordinates
//       return `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
//     } catch (error) {
//       console.error('All geocoding methods failed:', error);
//       return `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
//     }
//   };

//   // Format browser address
//   const formatBrowserAddress = (address) => {
//     const parts = [];
//     if (address.street) parts.push(address.street);
//     if (address.city) parts.push(address.city);
//     if (address.region) parts.push(address.region);
//     if (address.country) parts.push(address.country);
//     return parts.join(', ') || "Address not available";
//   };

//   // Verify location coordinates are valid
//   const isValidCoordinates = (lat, lng) => {
//     return (
//       typeof lat === 'number' && !isNaN(lat) &&
//       typeof lng === 'number' && !isNaN(lng) &&
//       lat >= -90 && lat <= 90 &&
//       lng >= -180 && lng <= 180
//     );
//   };

//   // Check serviceability of a location
//   const checkServiceability = async (lat, lng, address = "") => {
//     try {
//       setIsCheckingServiceability(true);

//       const response = await fetch(
//         "https://dd-merge-backend-2.onrender.com/api/Hub/validate-location",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             lat: lat.toString(),
//             lng: lng.toString(),
//           }),
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         setIsServiceable(data.serviceable);

//         // If serviceable, save the hub information
//         if (data.serviceable && data.hubs && data.hubs.length > 0) {
//           const hubData = data.hubs[0];
//           const locationData = {
//             location: {
//               type: "Point",
//               coordinates: [lng, lat],
//             },
//             fullAddress: address,
//             hubName: hubData?.hubName || "",
//             hubId: hubData?.hub || null,
//             isAutoDetected: true,
//             timestamp: new Date().toISOString(),
//             lat: lat,
//             lng: lng
//           };

//           // Save to localStorage
//           localStorage.setItem("currentLocation", JSON.stringify(locationData));

//           // Update current location state
//           setCurrentLocation(locationData);

//           // ✅ NEW: Notify parent component that location is detected
//           if (onLocationDetected) {
//             onLocationDetected(locationData);
//           }
//         }

//         // If not serviceable, show option to request service
//         if (!data.serviceable) {
//           setTimeout(() => {
//             setShowServiceablePopup(true);
//           }, 1000);
//         }
//       } else {
//         console.error("Serviceability validation failed:", data.message);
//         setIsServiceable(null);
//       }
//     } catch (error) {
//       console.error("Serviceability validation error:", error);
//       setIsServiceable(null);
//     } finally {
//       setIsCheckingServiceability(false);
//     }
//   };

//   // Handle service request submission
//   const handleServiceRequest = async () => {
//     // Convert to string and handle null/undefined
//     const name = String(serviceRequestName || "");
//     const phone = String(serviceRequestPhone || "");

//     if (!name.trim()) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: "Please enter your name",
//         showConfirmButton: false,
//         timer: 3000,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//       return;
//     }

//     if (!phone.trim()) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: "Please enter your phone number",
//         showConfirmButton: false,
//         timer: 3000,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//       return;
//     }

//     // Basic phone validation
//     const phoneRegex = /^[0-9]{10}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: "Please enter a valid 10-digit phone number",
//         showConfirmButton: false,
//         timer: 3000,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//       return;
//     }

//     try {
//       setIsSubmittingRequest(true);

//       const requestData = {
//         name: name.trim(),
//         phone: phone.trim(),
//         location: {
//           lat: currentLocation?.lat || 0,
//           lng: currentLocation?.lng || 0
//         },
//         address: currentLocation?.fullAddress || "Address not available",
//         customerId: user?._id || null
//       };

//       console.log("Submitting service request:", requestData);

//       const response = await fetch(
//         "https://dd-merge-backend-2.onrender.com/api/service-requests",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(requestData),
//         }
//       );

//       const result = await response.json();

//       if (result.success) {
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "success",
//           title: "Request submitted successfully! We'll notify you when we start operations in your area.",
//           showConfirmButton: false,
//           timer: 4000,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });

//         // Reset and close popup
//         setShowServiceablePopup(false);
//         setServiceRequestName("");
//         setServiceRequestPhone("");
//       } else {
//         throw new Error(result.message || "Failed to submit request");
//       }
//     } catch (error) {
//       console.error("Error submitting service request:", error);
//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "error",
//         title: error.message || "Failed to submit request. Please try again.",
//         showConfirmButton: false,
//         timer: 3000,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     } finally {
//       setIsSubmittingRequest(false);
//     }
//   };

//   // Check location permissions
//   const checkLocationPermissions = useCallback(async () => {
//     if (!navigator.permissions) {
//       return 'prompt'; // If permissions API not available, assume prompt state
//     }

//     try {
//       const permission = await navigator.permissions.query({ name: 'geolocation' });
//       return permission.state;
//     } catch (error) {
//       console.error("Error checking permissions:", error);
//       return 'prompt';
//     }
//   }, []);

//   // Auto-detect location on component mount
//   useEffect(() => {
//     const autoDetectLocation = async () => {
//       try {
//         // Check location permissions first
//         const permissionState = await checkLocationPermissions();

//         if (permissionState === 'denied') {
//           setIsLocationEnabled(false);
//           console.log("Location permission denied by user");
//           return;
//         }

//         // Check if we already have a location in localStorage
//         const savedLocation = localStorage.getItem("currentLocation");
//         if (savedLocation) {
//           try {
//             const parsedLocation = JSON.parse(savedLocation);
//             // Check if location is less than 30 minutes old
//             const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
//             if (parsedLocation.timestamp > thirtyMinutesAgo) {
//               setCurrentLocation(parsedLocation);

//               // Check serviceability for cached location
//               if (parsedLocation.lat && parsedLocation.lng) {
//                 checkServiceability(parsedLocation.lat, parsedLocation.lng, parsedLocation.fullAddress);
//               }
//               return;
//             }
//           } catch (e) {
//             console.error("Error parsing saved location:", e);
//             localStorage.removeItem("currentLocation");
//           }
//         }

//         // Only auto-detect if permission is granted or in prompt state
//         if (permissionState === 'granted' || permissionState === 'prompt') {
//           // Add a small delay before auto-detecting
//           const timer = setTimeout(() => {
//             getCurrentLocation().catch(error => {
//               console.error("Auto location detection failed:", error);
//               if (error.message.includes("permission denied")) {
//                 setIsLocationEnabled(false);
//               }
//             });
//           }, 1000);

//           return () => clearTimeout(timer);
//         }
//       } catch (error) {
//         console.error("Auto location detection setup failed:", error);
//       }
//     };

//     autoDetectLocation();
//   }, [getCurrentLocation, checkLocationPermissions]);

//   // Manual location detection function
//   const handleDetectLocation = async () => {
//     try {
//       const location = await getCurrentLocation();

//       Swal2.fire({
//         toast: true,
//         position: "bottom",
//         icon: "success",
//         title: `Location updated successfully`,
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     } catch (error) {
//       console.error("Location detection failed:", error);

//       if (error.message.includes("permission denied")) {
//         setIsLocationEnabled(false);
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: "Location permission denied. Please enable location in browser settings.",
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       } else {
//         Swal2.fire({
//           toast: true,
//           position: "bottom",
//           icon: "error",
//           title: `Location detection failed: ${error.message}`,
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//     }
//   };

//   // Modified handleLocationClick to show location modal or detect location
//   const handleLocationClick = () => {
//     setShowLocationModal(true);
//   };

//   // Rest of your existing functions remain the same...
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
//     try {
//       const config = {
//         url: "/User/Sendotp",
//         method: "post",
//         baseURL: "https://dd-merge-backend-2.onrender.com/api",
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
//           title: `Error sending OTP`,
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
//         handleClose3();
//         handleShow7();
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

//   const [show8, setShow8] = useState(false);
//   const handleClose8 = () => setShow8(false);
//   const handleShow8 = () => setShow8(true);

//   const handleShowCart = () => setShowCart(true);

//   const phoneNumber = "7204188504";
//   const message = "Hello! I need assistance.";
//   const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
//     message
//   )}`;

//   const logOut = () => {
//     swal({
//       title: "Yeah!",
//       text: "Successfully Logged Out",
//       icon: "success",
//       button: "Ok!",
//     });
//     setTimeout(() => {
//       window.location.assign("/");
//     }, 5000);
//     localStorage.clear();
//   };

//   const [apartmentdata, setapartmentdata] = useState([]);
//   const getapartmentd = async () => {
//     try {
//       let res = await axios.get("https://dd-merge-backend-2.onrender.com/api/admin/getapartment");
//       if (res.status === 200) {
//         setapartmentdata(res.data.corporatedata);
//       }
//     } catch (error) {
//       // console.log(error);
//     }
//   };

//   useEffect(() => {
//     getapartmentd();
//   }, []);

//   const [corporatedata, setcorporatedata] = useState([]);
//   const getcorporate = async () => {
//     try {
//       let res = await axios.get("https://dd-merge-backend-2.onrender.com/api/admin/getcorporate");
//       if (res.status === 200) {
//         setcorporatedata(res.data.corporatedata);
//       }
//     } catch (error) {
//       // console.log(error);
//     }
//   };

//   useEffect(() => {
//     getcorporate();
//   }, []);

//   const [storyLength, setStoryLength] = useState(0);

//   useEffect(() => {
//     const getAddWebstory = async () => {
//       try {
//         let res = await axios.get("https://dd-merge-backend-2.onrender.com/api/admin/getstories");
//         if (res.status === 200) {
//           setStoryLength(res.data.getbanner.length);
//         }
//       } catch (error) {
//         // console.log(error);
//       }
//     };
//     getAddWebstory();
//   }, []);

//   const address = JSON.parse(
//     localStorage.getItem(
//       addresstype === "apartment" ? "address" : "coporateaddress"
//     )
//   );

//   const Handeledata = (ab, def) => {
//     try {
//       if (ab) {
//         if (!user) return navigate("/", { replace: true });
//         let data = JSON.parse(ab);
//         const addressData = {
//           Address: data?.Address,
//           Delivarycharge: data?.apartmentdelivaryprice,
//           doordelivarycharge: data?.doordelivaryprice,
//           apartmentname: data?.Apartmentname,
//           pincode: data?.pincode,
//           approximatetime: data?.approximatetime,
//           prefixcode: data?.prefixcode,
//           name: ab?.Name || user?.Fname || "",
//           flatno: ab?.fletNumber || "",
//           mobilenumber: ab?.Number || user?.Mobile || "",
//           towerName: ab?.towerName ? ab?.towerName : "",
//           lunchSlots: data?.lunchSlots ? data?.lunchSlots : [],
//           dinnerSlots: data?.dinnerSlots ? data?.dinnerSlots : [],
//           deliverypoint: data?.deliverypoint ? data?.deliverypoint : "",
//           locationType: data?.locationType || "",
//         };
//         if (!def) {
//           saveSelectedAddress(data);
//         }

//         if (addresstype === "apartment") {
//           localStorage.setItem("address", JSON.stringify(addressData));
//         } else {
//           localStorage.setItem("coporateaddress", JSON.stringify(addressData));
//         }
//       }
//     } catch (error) {
//       // console.log(error);
//     }
//   };

//   //Request Location
//   const [Name, setName] = useState("");
//   const [Number, setNumber] = useState("");
//   const [ApartmentName, setApartmentName] = useState("");
//   const [Message, setMessage] = useState("");

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
//         baseURL: "https://dd-merge-backend-2.onrender.com/api/",
//         header: { "content-type": "application/json" },
//         data: {
//           Mobile: Mobile,
//           otp: OTP,
//         },
//       };
//       const res = await axios(config);
//       if (res.status === 200) {
//         localStorage.setItem("user", JSON.stringify(res.data.details));
//         sessionStorage.setItem("user", JSON.stringify(res.data.details));
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
//         window.location.reload();
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

//   const [selectedAddress, setSelectedAddress] = useState({});

//   const getSelectedAddress = async () => {
//     try {
//       let res = await axios.get(
//         `https://dd-merge-backend-2.onrender.com/api/user/getSelectedAddressByUserIDAddType/${user?._id}/${addresstype}`
//       );
//       if (res.status === 200) {
//         setSelectedAddress(res.data.getdata);
//       }
//     } catch (error) {
//       // console.log(error);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       getSelectedAddress();
//     }
//   }, []);

//   useEffect(() => {
//     if (selectedAddress) {
//       if (addresstype === "apartment") {
//         const am = apartmentdata.find(
//           (ele) => ele?._id?.toString() === selectedAddress?.addressid
//         );
//         if (am) {
//           Handeledata(JSON.stringify({ ...am, ...selectedAddress }), "def");
//         }
//       } else {
//         const co = corporatedata.find(
//           (ele) => ele?._id?.toString() === selectedAddress?.addressid
//         );
//         if (co) {
//           Handeledata(JSON.stringify({ ...co, ...selectedAddress }), "def");
//         }
//       }
//     }
//   }, [selectedAddress, addresstype, apartmentdata, corporatedata]);

//   const saveSelectedAddress = async (data) => {
//     try {
//       if (!user) return;
//       let res = await axios.post(`https://dd-merge-backend-2.onrender.com/api/user/addressadd`, {
//         Name: user?.Fname,
//         Number: user?.Mobile,
//         userId: user?._id,
//         ApartmentName: data?.Apartmentname,
//         addresstype: addresstype,
//         addressid: data?._id,
//       });
//     } catch (error) {
//       // console.log(error);
//     }
//   };

//   const inputRef = useRef(null);
//   const [open, setOpen] = useState(false);
//   const [searchValue, setSearchValue] = useState("");

//   // Get customer ID from localStorage
//   const getCustomerId = () => {
//     return user?._id;
//   };

//   // Get auth headers
//   const getAuthHeaders = () => {
//     const token = localStorage.getItem("token");
//     return {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     };
//   };

//   const [userData, setUserData] = useState([]);
//   const [alert, setAlert] = useState({ show: false, message: "", type: "" });

//   const showAlert = (message, type) => {
//     setAlert({ show: true, message, type });
//     setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
//   };

//   const [primaryAddressId, setPrimaryAddressId] = useState(null);
//   const [primaryAddress, setPrimaryAddress] = useState(null);

//   // Fetch addresses
//   const fetchAddresses = React.useCallback(async () => {
//     try {
//       setLoading(true);
//       const customerId = user?._id; // Safe access

//       if (!customerId) {
//         // Don't throw error here, just return, allows for smoother logout/no-user state
//         return;
//       }

//       const response = await fetch(
//         `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/addresses`,
//         {
//           method: "GET",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch addresses");
//       }

//       const result = await response.json();

//       if (result.success) {
//         const addresses = result.addresses || [];
//         setAddresses(addresses);
//         setPrimaryAddressId(result.primaryAddress || null);

//         const primaryAddr = addresses.find(
//           (addr) => addr._id === result.primaryAddress
//         );
//         setPrimaryAddress(primaryAddr || null);

//         if (addresses && addresses.length > 0) {
//           const firstType = addresses[0].addressType;
//           setExpandedSections({ [firstType]: true });
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching addresses:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [user?._id]);

//   // Update the useEffect to depend on user._id
//   useEffect(() => {
//     if (user?._id) {
//       fetchAddresses();
//     }
//   }, [fetchAddresses]);

//   // Get display name for address
//   const getDisplayName = (address) => {
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
//         return address.fullAddress || "";
//     }
//   };

//   // Get display address text - updated to show auto-detected location with serviceability status
// // Get display address text - with proper priority
// const getDisplayAddress = () => {
//   // If we're actively detecting location, show loading
//   if (isLocating) {
//     return "Detecting location...";
//   }

//   // If location is disabled, show message
//   if (!isLocationEnabled && !addresses.length && !primaryAddress) {
//     return "Enable location";
//   }

//   // Priority 1: Show auto-detected location ONLY if it's fresh and user hasn't selected a saved address
//   const hasValidAutoLocation = currentLocation?.fullAddress &&
//     currentLocation?.timestamp &&
//     (new Date() - new Date(currentLocation.timestamp)) < 30 * 60 * 1000; // Less than 30 minutes old

//   if (hasValidAutoLocation && !primaryAddress && addresses.length === 0) {
//     const address = currentLocation.fullAddress.length > 40
//       ? `${currentLocation.fullAddress.substring(0, 37)}...`
//       : currentLocation.fullAddress;
//     return address;
//   }

//   // Priority 2: Show primary saved address (user's chosen address)
//   if (primaryAddress) {
//     const name = getDisplayName(primaryAddress);
//     return name.length > 40 ? `${name.substring(0, 37)}...` : name;
//   }

//   // Priority 3: Show any saved address
//   if (addresses.length > 0) {
//     const name = getDisplayName(addresses[0]);
//     return name.length > 40 ? `${name.substring(0, 37)}...` : name;
//   }

//   // Priority 4: Show auto-detected location (even if not fresh, as fallback)
//   if (currentLocation?.fullAddress) {
//     const address = currentLocation.fullAddress.length > 40
//       ? `${currentLocation.fullAddress.substring(0, 37)}...`
//       : currentLocation.fullAddress;
//     return address + " (detected)";
//   }

//   // Default fallback
//   return "Select Location";
// };

// // Add this function to get a more detailed tooltip
// const getAddressTooltip = () => {
//   if (isLocating) return "Detecting your location...";

//   if (primaryAddress) {
//     const name = getDisplayName(primaryAddress);
//     const type = primaryAddress.addressType || "Saved";
//     return `${type}: ${name}`;
//   }

//   if (addresses.length > 0) {
//     const name = getDisplayName(addresses[0]);
//     const type = addresses[0].addressType || "Saved";
//     return `${type}: ${name}`;
//   }

//   if (currentLocation?.fullAddress) {
//     return `Detected: ${currentLocation.fullAddress}`;
//   }

//   return "Click to select or detect location";
// };

//   // Get serviceability status icon and text
//   const getServiceabilityStatus = () => {
//     if (!currentLocation) return null;

//     if (isCheckingServiceability) {
//       return {
//         icon: <FaSpinner className="fa-spin" />,
//         text: "Checking serviceability...",
//         color: "#ff9800"
//       };
//     }

//     if (isServiceable === true) {
//       return {
//         icon: <FaCheckCircle />,
//         text: "Service available",
//         color: "#4caf50"
//       };
//     }

//     if (isServiceable === false) {
//       return {
//         icon: <FaTimesCircle />,
//         text: "Service not available",
//         color: "#f44336"
//       };
//     }

//     return null;
//   };

//   // Handle location disabled state
//   const handleLocationDisabledClick = () => {
//     Swal2.fire({
//       title: "Location Access Required",
//       text: "Please enable location services in your browser settings to use this feature.",
//       icon: "info",
//       confirmButtonText: "OK",
//       confirmButtonColor: "#6B8E23",
//     });
//   };

//   return (
//     <div>
//       <div className="ban-container">
//         <div className="mobile-banner-updated">
//           <div className="screen-3" style={{ padding: "0 24px 8px 24px" }}>
//             <div className="screen-2 mb-3 mt-2 d-flex align-items-center">
//               <div
//                 className="d-flex align-items-center gap-2 w-100"
//                 onClick={isLocationEnabled ? handleLocationClick : handleLocationDisabledClick}
//                 style={{ cursor: "pointer" }}
//               >
//                 {isLocating ? (
//                   <FaSpinner className="fa-spin" style={{
//                     width: "32px",
//                     height: "32px",
//                     color: "#6B8E23"
//                   }} />
//                 ) : (
//                   <img
//                     src={Selectlocation}
//                     alt="select-location"
//                     className="flex-shrink-0"
//                     style={{ width: "32px", height: "32px", opacity: isLocationEnabled ? 1 : 0.5 }}
//                   />
//                 )}

//                 <div className="d-flex flex-column cursor-pointer flex-grow-1 aligen-center">
//                   <div className="d-flex align-items-center">
//                     <p
//   className="select-location-text fw-semibold text-truncate mb-0 banner-address-line"
//   title={getAddressTooltip()}
//   style={{ opacity: isLocationEnabled ? 1 : 0.7 }}
// >
//   {getDisplayAddress()}
// </p>

//                     {/* Show location icon for auto-detected location */}
//                     {currentLocation?.isAutoDetected && (
//                       <span
//                         className="ms-1"
//                         title="Auto-detected location"
//                         style={{ color: "#6B8E23", fontSize: "12px" }}
//                       >
//                         <FaMapMarkerAlt />
//                       </span>
//                     )}

//                     {/* Show refresh button for location */}
//                     {currentLocation && !isLocating && isLocationEnabled && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleDetectLocation();
//                         }}
//                         style={{
//                           background: "none",
//                           border: "none",
//                           color: "#6B8E23",
//                           marginLeft: "8px",
//                           cursor: "pointer",
//                           fontSize: "12px"
//                         }}
//                         title="Refresh location"
//                       >
//                         ↻
//                       </button>
//                     )}
//                   </div>

//                   {user && (
//                     <p
//                       className="select-location-text-small mb-0 banner-user-details"
//                       style={{
//                         color: "rgba(255, 255, 255, 0.8)",
//                       }}
//                     >
//                       {user?.Fname} | {user?.Mobile}
//                       {primaryAddress && ""}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="d-flex gap-1 justify-content-center align-items-center referbtn">
//                 {user && (
//                   <button
//                     className="refer-earn-btn"
//                     onClick={() => navigate("/refer")}
//                   >
//                     <img
//                       src="/Assets/gifticon.svg"
//                       alt="refer"
//                       className="refer-icon"
//                     />
//                     <span className="refer-earn-text">Refer & Earn</span>
//                   </button>
//                 )}

//                 <img
//                   src={UserIcons}
//                   alt="user-icon"
//                   onClick={handleShow8}
//                   className="p-2"
//                 />
//               </div>
//             </div>

//             <div
//               className="d-flex align-items-center m-0 order-row"
//               style={{ width: "100%" }}
//             >
//               {/* LEFT — text area */}
//               <div className="d-flex align-items-center flex-grow-1 min-w-0"
//               style={{gap:"4px"}}>
//                 <img
//                   src={clockone}
//                   alt=""
//                   style={{ width: "24px", height: "24px" }}
//                 />
//                 <span className="clock-text mt-2">
//                   Order by 12 & Get Lunch by 1:00 PM
//                 </span>
//               </div>

//               {/* RIGHT — Veg Only */}
//               <div className="veg-btn d-flex flex-column align-items-center ms-2" onClick={() => setIsVegOnly(!isVegOnly)} >
//                 <h6 className="m-0 veg-title">Veg Only</h6>
//                 <div
//                   className="veg-btn-toggle"
//                   style={{ cursor: "pointer" }}
//                 >
//                   <div
//                     className="veg-btn-switch"
//                     style={{
//                       transform: isVegOnly
//                         ? "translateX(18px)"
//                         : "translateX(0)",
//                       backgroundColor: isVegOnly ? "#6B8E23" : "#6c757d",
//                       transition: "all 0.3s ease",
//                     }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* {!user && (
//             <div className="benifits-container mb-3">
//               <ul className="benifits-item">
//                 <li className="benifits-text">
//                   ✨ Unlock more with an account:
//                 </li>
//                 <li className="benifits-text">Wallet bonuses 💰</li>
//                 <li className="benifits-text">Loyalty discounts 🎁</li>
//                 <li className="benifits-text">Special member pricing 💡</li>
//                 <li className="benifits-text">
//                   👉 Sign up to redeem (new users only)
//                 </li>
//               </ul>

//               <button
//                 className="signup-button"
//                 onClick={() => navigate("/", { replace: true })}
//               >
//                 Signup
//               </button>
//             </div>
//           )} */}
//         </div>

//         {/* Serviceability Popup */}
//         {showServiceablePopup && (
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "rgba(0,0,0,0.7)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: 3000,
//               padding: "20px",
//             }}
//           >
//             <div
//               style={{
//                 backgroundColor: "#F8F6F0",
//                 borderRadius: "16px",
//                 padding: "24px",
//                 maxWidth: "400px",
//                 width: "100%",
//                 textAlign: "center",
//                 boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: "48px",
//                   marginBottom: "16px",
//                   color: "#ffa500",
//                 }}
//               >
//                 📍
//               </div>
//               <h3
//                 style={{
//                   marginBottom: "12px",
//                   color: "#333",
//                   fontSize: "20px",
//                   fontWeight: "600",
//                 }}
//               >
//                 Coming Soon to Your Area!
//               </h3>
//               <p
//                 style={{
//                   marginBottom: "16px",
//                   color: "#666",
//                   fontSize: "14px",
//                   lineHeight: "1.5",
//                 }}
//               >
//                 We're not currently operating in this location, but we're
//                 expanding rapidly! Let us know you're interested, and we'll notify
//                 you as soon as we launch in your area.
//               </p>

//               <div style={{ marginBottom: "20px", textAlign: "left" }}>
//                 <div style={{ marginBottom: "12px" }}>
//                   <label
//                     style={{
//                       display: "block",
//                       marginBottom: "4px",
//                       fontSize: "14px",
//                       fontWeight: "500",
//                     }}
//                   >
//                     Your Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={serviceRequestName}
//                     onChange={(e) => setServiceRequestName(e.target.value)}
//                     placeholder="Enter your name"
//                     style={{
//                       width: "100%",
//                       padding: "12px",
//                       border: "1px solid #ddd",
//                       borderRadius: "8px",
//                       fontSize: "14px",
//                     }}
//                   />
//                 </div>

//                 <div style={{ marginBottom: "16px" }}>
//                   <label
//                     style={{
//                       display: "block",
//                       marginBottom: "4px",
//                       fontSize: "14px",
//                       fontWeight: "500",
//                     }}
//                   >
//                     Phone Number *
//                   </label>
//                   <input
//                     type="tel"
//                     value={serviceRequestPhone}
//                     onChange={(e) => setServiceRequestPhone(e.target.value)}
//                     placeholder="Enter your phone number"
//                     style={{
//                       width: "100%",
//                       padding: "12px",
//                       border: "1px solid #ddd",
//                       borderRadius: "8px",
//                       fontSize: "14px",
//                     }}
//                   />
//                 </div>

//                 <div
//                   style={{
//                     fontSize: "12px",
//                     color: "#666",
//                     marginBottom: "16px",
//                   }}
//                 >
//                   <strong>Selected Location:</strong> {currentLocation?.fullAddress || "Address not available"}
//                 </div>
//               </div>

//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "12px",
//                 }}
//               >
//                 <button
//                   onClick={handleServiceRequest}
//                   disabled={
//                     isSubmittingRequest ||
//                     !serviceRequestName ||
//                     !serviceRequestPhone
//                   }
//                   style={{
//                     backgroundColor:
//                       isSubmittingRequest ||
//                       !serviceRequestName ||
//                       !serviceRequestPhone
//                         ? "#ccc"
//                         : "#6B8E23",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "12px",
//                     padding: "14px",
//                     fontSize: "16px",
//                     fontWeight: "600",
//                     cursor:
//                       isSubmittingRequest ||
//                       !serviceRequestName ||
//                       !serviceRequestPhone
//                         ? "not-allowed"
//                         : "pointer",
//                     transition: "background-color 0.2s",
//                   }}
//                 >
//                   {isSubmittingRequest ? "Submitting..." : "Request Service"}
//                 </button>
//                 <button
//                   onClick={() => setShowServiceablePopup(false)}
//                   style={{
//                     backgroundColor: "transparent",
//                     color: "#666",
//                     border: "1px solid #ddd",
//                     borderRadius: "12px",
//                     padding: "14px",
//                     fontSize: "16px",
//                     fontWeight: "500",
//                     cursor: "pointer",
//                     transition: "background-color 0.2s",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.backgroundColor = "#f5f5f5";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.backgroundColor = "transparent";
//                   }}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         <ProfileOffcanvas show={show8} handleClose={handleClose8} />

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
//                     return Swal2.fire({
//                       toast: true,
//                       position: "bottom",
//                       icon: "error",
//                       title: `Invalid Mobile Number`,
//                       showConfirmButton: false,
//                       timer: 3000,
//                       timerProgressBar: true,
//                       customClass: {
//                         popup: "me-small-toast",
//                         title: "me-small-toast-title",
//                       },
//                     });
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
//           show={show7}
//           onHide={handleClose7}
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
//               An OTP has been sent to your whatsapp
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
//                 onClick={verifyOTP}
//                 style={{
//                   width: "100%",
//                   marginTop: "24px",
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   textAlign: "center",
//                 }}
//               >
//                 Continue
//               </Button>
//             </div>
//           </Modal.Body>
//         </Modal>
//       </div>

//       <div className="ban-container">
//         <div className="mobile-banner" style={{ position: "relative" }}>
//           <UserBanner />
//         </div>
//       </div>
//       <LocationModal2
//         show={showLocationModal}
//         onClose={() => {
//           setShowLocationModal(false);
//           // Refresh addresses when modal closes to get updated primary address
//           if (user) {
//             fetchAddresses();
//           }
//         }}
//         currentLocation={currentLocation}
//         onLocationDetect={handleDetectLocation}
//         isLocationEnabled={isLocationEnabled}
//       />
//     </div>
//   );
// };

// export default Banner;

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import "../Styles/Banner.css";

import { Button, Modal, Form, Dropdown, InputGroup } from "react-bootstrap";
import {
  FaUser,
  FaEye,
  FaEyeSlash,
  FaWallet,
  FaMapMarkerAlt,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import locationIcon from "./../assets/red-location.png";

import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaLock } from "react-icons/fa";
import Swal2 from "sweetalert2";
import swal from "sweetalert";
import { FaSquareWhatsapp } from "react-icons/fa6";
import { WalletContext } from "../WalletContext";
import usericon from "./../assets/login_profile.png";
import Selectlocation from "../assets/selectlocation.svg";
import UserIcons from "../assets/userp.svg";
import clockone from "./../assets/mynaui_clock-one.png";

import UserBanner from "./UserBanner";
import ProfileOffcanvas from "./Navbar2";
import LocationModal2 from "./LocationModal2";
import CookingPromo from "./CookingPromo";

function useWindowWidth() {
  const [w, setW] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  React.useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}

const Banner = ({
  Carts,
  getAllOffer,
  isVegOnly,
  setIsVegOnly,
  onLocationDetected,
}) => {
  const width = useWindowWidth();
  const isSmall = width <= 768; // For general mobile adjustments
  const isVerySmall = width <= 360; // For stacking buttons vertically
  const addresstype = localStorage.getItem("addresstype");
  const corporateaddress = JSON.parse(localStorage.getItem("coporateaddress"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const navigate = useNavigate("");
  const [OTP, setOTP] = useState(["", "", "", ""]);
  const [PasswordShow, setPasswordShow] = useState(false);

  const { wallet, walletSeting, rateorder, rateMode } =
    useContext(WalletContext);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [show2, setShow2] = useState(false);
  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);
  const [showCart, setShowCart] = useState(false);

  const [show3, setShow3] = useState(false);
  const handleClose3 = () => setShow3(false);
  const handleShow3 = () => {
    handleClose4();
    setShow3(true);
  };

  const [show4, setShow4] = useState(false);
  const handleShow4 = () => setShow4(true);
  const handleClose4 = () => setShow4(false);

  const [show5, setShow5] = useState(false);
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);

  const [show7, setShow7] = useState(false);
  const handleClose7 = () => setShow7(false);
  const handleShow7 = () => setShow7(true);
  const [Mobile, setMobile] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // New states for automatic location detection
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isCheckingServiceability, setIsCheckingServiceability] =
    useState(false);
  const [isServiceable, setIsServiceable] = useState(null);
  const [showServiceablePopup, setShowServiceablePopup] = useState(false);
  const [serviceRequestName, setServiceRequestName] = useState("");
  const [serviceRequestPhone, setServiceRequestPhone] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);

  // Default hub ID for non-serviceable areas
  const DEFAULT_HUB_ID = "6943daf278eca12b0b53b36b";

  // Function to get location using browser's geolocation API
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setIsLocationEnabled(false);
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      setIsLocating(true);
      setLocationError(null);

      // Set a timeout for location detection
      const locationTimeout = setTimeout(() => {
        setIsLocating(false);
        reject(new Error("Location request timed out"));
      }, 15000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(locationTimeout);
          try {
            const { latitude, longitude } = position.coords;

            console.log("Raw coordinates:", { latitude, longitude });

            // Get more accurate address using multiple methods
            const address = await getAccurateAddress(latitude, longitude);

            const locationData = {
              lat: latitude,
              lng: longitude,
              fullAddress: address,
              isAutoDetected: true,
              timestamp: new Date().toISOString(),
              addressType: "Current Location",
              houseName: "Current Location",
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            };

            console.log("Location data:", locationData);

            // Save to localStorage
            localStorage.setItem(
              "currentLocation",
              JSON.stringify(locationData)
            );

            setCurrentLocation(locationData);
            setIsLocating(false);

            // Check serviceability after getting location
            checkServiceability(latitude, longitude, address);

            resolve(locationData);
          } catch (error) {
            clearTimeout(locationTimeout);
            setIsLocating(false);
            setLocationError("Could not get address from coordinates");
            reject(error);
          }
        },
        (error) => {
          clearTimeout(locationTimeout);
          setIsLocating(false);
          let errorMessage = "Unable to get your location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location permission denied. Please enable location services.";
              setIsLocationEnabled(false);
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred.";
              break;
          }

          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  // Multiple methods to get accurate address
  const getAccurateAddress = async (lat, lng) => {
    try {
      // Try method 2: Use Google Maps API if available
      const googleApiKey = import.meta.env.VITE_MAP_KEY;
      if (googleApiKey) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}&result_type=street_address|premise`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.status === "OK" && data.results[0]) {
              return data.results[0].formatted_address;
            }
          }
        } catch (e) {
          console.log("Google geocoding failed:", e);
        }
      }

      // Fallback: Return coordinates
      return `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error("All geocoding methods failed:", error);
      return `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Format browser address
  const formatBrowserAddress = (address) => {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.country) parts.push(address.country);
    return parts.join(", ") || "Address not available";
  };

  // Verify location coordinates are valid
  const isValidCoordinates = (lat, lng) => {
    return (
      typeof lat === "number" &&
      !isNaN(lat) &&
      typeof lng === "number" &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  // Check serviceability of a location
  const checkServiceability = async (lat, lng, address = "") => {
    try {
      setIsCheckingServiceability(true);

      const response = await fetch(
        "https://dd-merge-backend-2.onrender.com/api/Hub/validate-location",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: lat.toString(),
            lng: lng.toString(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsServiceable(data.serviceable);

        // If serviceable, save the hub information
        if (data.serviceable && data.hubs && data.hubs.length > 0) {
          const hubData = data.hubs[0];
          const locationData = {
            location: {
              type: "Point",
              coordinates: [lng, lat],
            },
            fullAddress: address,
            hubName: hubData?.hubName || "",
            hubId: hubData?.hub || null,
            isAutoDetected: true,
            timestamp: new Date().toISOString(),
            lat: lat,
            lng: lng,
          };

          // Save to localStorage
          localStorage.setItem("currentLocation", JSON.stringify(locationData));

          // Update current location state
          setCurrentLocation(locationData);

          // ✅ NEW: Notify parent component that location is detected
          if (onLocationDetected) {
            onLocationDetected(locationData);
          }
        } else if (!data.serviceable) {
          // If NOT serviceable, still save location but with default hub ID
          const locationData = {
            location: {
              type: "Point",
              coordinates: [lng, lat],
            },
            fullAddress: address,
            hubName: "Default Hub",
            hubId: DEFAULT_HUB_ID, // Use default hub ID for non-serviceable areas
            isAutoDetected: true,
            isServiceable: false, // Mark as non-serviceable
            timestamp: new Date().toISOString(),
            lat: lat,
            lng: lng,
          };

          // Save to localStorage
          localStorage.setItem("currentLocation", JSON.stringify(locationData));

          // Update current location state
          setCurrentLocation(locationData);

          // Notify parent component
          if (onLocationDetected) {
            onLocationDetected(locationData);
          }

          // REMOVED: Don't automatically show popup
          // Only show the "We're not here yet" popup, NOT the "Coming Soon" modal
        }
      } else {
        console.error("Serviceability validation failed:", data.message);
        setIsServiceable(null);
      }
    } catch (error) {
      console.error("Serviceability validation error:", error);
      setIsServiceable(null);
    } finally {
      setIsCheckingServiceability(false);
    }
  };

  // Handle service request submission
  // const handleServiceRequest = async () => {
  //   // Convert to string and handle null/undefined
  //   const name = String(serviceRequestName || "");
  //   const phone = String(serviceRequestPhone || "");

  //   if (!name.trim()) {
  //     Swal2.fire({
  //       toast: true,
  //       position: "bottom",
  //       icon: "error",
  //       title: "Please enter your name",
  //       showConfirmButton: false,
  //       timer: 3000,
  //       customClass: {
  //         popup: "me-small-toast",
  //         title: "me-small-toast-title",
  //       },
  //     });
  //     return;
  //   }

  //   if (!phone.trim()) {
  //     Swal2.fire({
  //       toast: true,
  //       position: "bottom",
  //       icon: "error",
  //       title: "Please enter your phone number",
  //       showConfirmButton: false,
  //       timer: 3000,
  //       customClass: {
  //         popup: "me-small-toast",
  //         title: "me-small-toast-title",
  //       },
  //     });
  //     return;
  //   }

  //   // Basic phone validation
  //   const phoneRegex = /^[0-9]{10}$/;
  //   if (!phoneRegex.test(phone.trim())) {
  //     Swal2.fire({
  //       toast: true,
  //       position: "bottom",
  //       icon: "error",
  //       title: "Please enter a valid 10-digit phone number",
  //       showConfirmButton: false,
  //       timer: 3000,
  //       customClass: {
  //         popup: "me-small-toast",
  //         title: "me-small-toast-title",
  //       },
  //     });
  //     return;
  //   }

  //   try {
  //     setIsSubmittingRequest(true);

  //     const requestData = {
  //       name: name.trim(),
  //       phone: phone.trim(),
  //       location: {
  //         lat: currentLocation?.lat || 0,
  //         lng: currentLocation?.lng || 0,
  //       },
  //       address: currentLocation?.fullAddress || "Address not available",
  //       customerId: user?._id || null,
  //     };

  //     console.log("Submitting service request:", requestData);

  //     const response = await fetch(
  //       "https://dd-merge-backend-2.onrender.com/api/service-requests",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(requestData),
  //       }
  //     );

  //     const result = await response.json();

  //     if (result.success) {
  //       // Close the service request popup first
  //       setShowServiceablePopup(false);
  //       setServiceRequestName("");
  //       setServiceRequestPhone("");

  //       // Show success popup with improved mobile responsiveness
  //       await Swal2.fire({
  //         title: "🎉 Request Submitted Successfully!",
  //         html: `
  //           <div style="text-align: center; padding: ${
  //             isSmall ? "8px" : "12px"
  //           };">
  //             <div style="font-size: ${
  //               isSmall ? "16px" : "18px"
  //             }; color: #6B8E23; margin-bottom: ${
  //           isSmall ? "12px" : "15px"
  //         }; font-weight: 600;">
  //               ✅ Your service request has been successfully submitted!
  //             </div>
  //             <div style="font-size: ${
  //               isSmall ? "13px" : "14px"
  //             }; color: #666; line-height: 1.5; margin-bottom: ${
  //           isSmall ? "12px" : "15px"
  //         };">
  //               <p style="margin: ${
  //                 isSmall ? "8px 0" : "10px 0"
  //               }; font-weight: 600;">What happens next?</p>
  //               <div style="text-align: left; margin: 0 auto; max-width: ${
  //                 isSmall ? "280px" : "320px"
  //               };">
  //                 <p style="margin: ${
  //                   isSmall ? "6px 0" : "8px 0"
  //                 };">• Our team will review your location</p>
  //                 <p style="margin: ${
  //                   isSmall ? "6px 0" : "8px 0"
  //                 };">• We'll contact you within 24 hours</p>
  //                 <p style="margin: ${
  //                   isSmall ? "6px 0" : "8px 0"
  //                 };">• You'll be notified when service starts in your area</p>
  //               </div>
  //             </div>
  //             <div style="font-size: ${
  //               isSmall ? "11px" : "12px"
  //             }; color: #999; margin-top: ${
  //           isSmall ? "12px" : "15px"
  //         }; padding: ${
  //           isSmall ? "8px" : "10px"
  //         }; background: #f8f9fa; border-radius: 8px; line-height: 1.4;">
  //               Thank you for your interest in DailyDish! We're excited to serve you soon. 🍽️
  //             </div>
  //           </div>
  //         `,
  //         icon: "success",
  //         confirmButtonText: "Got it!",
  //         confirmButtonColor: "#6B8E23",
  //         width: isSmall ? "90%" : "500px",
  //         padding: isSmall ? "1rem" : "1.5rem",
  //         customClass: {
  //           popup: "custom-success-popup",
  //           title: "custom-success-title",
  //           confirmButton: "custom-success-button",
  //           htmlContainer: "custom-success-content",
  //         },
  //         showClass: {
  //           popup: "animate__animated animate__fadeInUp animate__faster",
  //         },
  //         hideClass: {
  //           popup: "animate__animated animate__fadeOutDown animate__faster",
  //         },
  //         backdrop: true,
  //         allowOutsideClick: true,
  //         allowEscapeKey: true,
  //         focusConfirm: true,
  //       });
  //     } else {
  //       throw new Error(result.message || "Failed to submit request");
  //     }
  //   } catch (error) {
  //     console.error("Error submitting service request:", error);
  //     Swal2.fire({
  //       toast: true,
  //       position: "bottom",
  //       icon: "error",
  //       title: error.message || "Failed to submit request. Please try again.",
  //       showConfirmButton: false,
  //       timer: 4000,
  //       timerProgressBar: true,
  //       customClass: {
  //         popup: "me-small-toast",
  //         title: "me-small-toast-title",
  //       },
  //     });
  //   } finally {
  //     setIsSubmittingRequest(false);
  //   }
  // };

  const handleServiceRequest = async () => {
  // Convert to string and handle null/undefined
  const name = String(serviceRequestName || "");
  const phone = String(serviceRequestPhone || "");

  if (!name.trim()) {
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "error",
      title: "Please enter your name",
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
      title: "Please enter your phone number",
      showConfirmButton: false,
      timer: 3000,
      customClass: {
        popup: "me-small-toast",
        title: "me-small-toast-title",
      },
    });
    return;
  }

  // Basic phone validation
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone.trim())) {
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "error",
      title: "Please enter a valid 10-digit phone number",
      showConfirmButton: false,
      timer: 3000,
      customClass: {
        popup: "me-small-toast",
        title: "me-small-toast-title",
      },
    });
    return;
  }

  try {
    setIsSubmittingRequest(true);

    const requestData = {
      name: name.trim(),
      phone: phone.trim(),
      location: {
        lat: currentLocation?.lat || 0,
        lng: currentLocation?.lng || 0,
      },
      address: currentLocation?.fullAddress || "Address not available",
      customerId: user?._id || null,
    };

    console.log("Submitting service request:", requestData);

    const response = await fetch(
      "https://dd-merge-backend-2.onrender.com/api/service-requests",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    const result = await response.json();

    if (response.status === 409) {
  // Handle duplicate request case
  setIsSubmittingRequest(false);
  setShowServiceablePopup(false);
  
  setTimeout(() => {
    Swal2.fire({
      // title: "⏳ Already Requested",
      html: `
        <div style="text-align: center; padding: 16px;">
          <h4 style="color: #856404; margin: 0 0 12px 0;">Request Already Exists</h4>
          <p style="color: #666; font-size: 14px; margin-bottom: 8px;">
            You've already submitted a service request for this location.
          </p>
          <p style="color: #888; font-size: 12px;">
            Our team will contact you once service is available in your area.
          </p>
        </div>
      `,
      confirmButtonText: "OK",
      confirmButtonColor: "#856404",
      width: isSmall ? "300px" : "360px",
      showCloseButton: true,
      backdrop: true,
    });
  }, 300);
  
  return;
}

    if (result.success) {
      // Store the success data first
      const successData = {
        name: name.trim(),
        phone: phone.trim(),
        address: currentLocation?.fullAddress || "Address not available",
      };
      
      // Close the service request popup
      setShowServiceablePopup(false);
      
      // Clear form fields
      setServiceRequestName("");
      setServiceRequestPhone("");
      
      // Reset submitting state
      setIsSubmittingRequest(false);
      
      // Wait for modal to fully close before showing success
      setTimeout(() => {
        // Use a simpler Swal2 configuration without custom classes
        Swal2.fire({
          // title: "🎉 Request Submitted Successfully!",
          html: `
            <div style="text-align: center; padding: ${isSmall ? "8px" : "12px"};">
              <div style="font-size: ${isSmall ? "16px" : "18px"}; color: #6B8E23; margin-bottom: ${isSmall ? "12px" : "15px"}; font-weight: 600;">
                ✅ Your service request has been successfully submitted!
              </div>
              <div style="font-size: ${isSmall ? "13px" : "14px"}; color: #666; line-height: 1.5; margin-bottom: ${isSmall ? "12px" : "15px"};">
                <div style="text-align: left; margin: 0 auto; max-width: ${isSmall ? "280px" : "320px"}; background: #f9f9f9; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                  <p style="margin: 6px 0;"><strong>Name:</strong> ${successData.name}</p>
                  <p style="margin: 6px 0;"><strong>Phone:</strong> ${successData.phone}</p>
                  <p style="margin: 6px 0;"><strong>Address:</strong> ${successData.address}</p>
                </div>
                <p style="font-weight: 600; color: #333; margin-bottom: 8px;">What happens next?</p>
                <div style="text-align: left; margin: 0 auto; max-width: ${isSmall ? "280px" : "320px"};">
                  <p style="margin: 4px 0;">• Our team will review your location</p>
                  <p style="margin: 4px 0;">• We'll contact you within 24 hours</p>
                  <p style="margin: 4px 0;">• You'll be notified when service starts in your area</p>
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
        });
      }, 500); // Increased delay to ensure modal is fully closed
    } else {
      throw new Error(result.message || "Failed to submit request");
    }
  } catch (error) {
    console.error("Error submitting service request:", error);
    setIsSubmittingRequest(false);
    
    Swal2.fire({
      toast: true,
      position: "bottom",
      icon: "error",
      title: error.message || "Failed to submit request. Please try again.",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: {
        popup: "me-small-toast",
        title: "me-small-toast-title",
      },
    });
  }
};

  // Function to handle Request Location click
  const handleRequestLocationClick = () => {
    setShowServiceablePopup(true);
  };

  // Check location permissions
  const checkLocationPermissions = useCallback(async () => {
    if (!navigator.permissions) {
      return "prompt"; // If permissions API not available, assume prompt state
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      return permission.state;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return "prompt";
    }
  }, []);

  // Get primary address from state
  const [primaryAddress, setPrimaryAddress] = useState(null);

  // Replace the problematic autoDetectLocation useEffect with this:
  useEffect(() => {
    let isMounted = true;
    let timerId = null;

    const autoDetectLocation = async () => {
      if (!isMounted) return;

      try {
        const savedCurrentLocation = localStorage.getItem("currentLocation");
        const savedLocation = savedCurrentLocation
          ? JSON.parse(savedCurrentLocation)
          : null;

        const savedPrimaryAddress = localStorage.getItem("primaryAddress");
        if (savedPrimaryAddress) {
          try {
            const parsedPrimaryAddress = JSON.parse(savedPrimaryAddress);
            if (isMounted) {
              setPrimaryAddress(parsedPrimaryAddress);
            }
            return;
          } catch (e) {
            console.error("Error parsing saved primary address:", e);
          }
        }

        // Check if location was manually selected by user
        const manualLocationFlag = localStorage.getItem(
          "locationManuallySelected"
        );
        if (manualLocationFlag === "true") {
          console.log(
            "Location was manually selected, skipping auto-detection"
          );
          return; // Don't auto-detect if user manually selected location
        }

        // For non-logged-in users, always attempt location detection on refresh
        // For logged-in users, only detect if no saved location exists
        const shouldDetectLocation = !user || !savedLocation;

        if (shouldDetectLocation && isMounted) {
          const permissionState = await checkLocationPermissions();

          if (permissionState === "denied") {
            if (isMounted) {
              setIsLocationEnabled(false);
            }
            return;
          }

          if (permissionState === "granted" || permissionState === "prompt") {
            timerId = setTimeout(() => {
              if (isMounted) {
                getCurrentLocation().catch((error) => {
                  console.error("Auto location detection failed:", error);
                  if (
                    error.message.includes("permission denied") &&
                    isMounted
                  ) {
                    setIsLocationEnabled(false);
                  }
                });
              }
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Auto location detection setup failed:", error);
      }
    };

    autoDetectLocation();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
    // Only include these dependencies
  }, [checkLocationPermissions, user]); // Added user as dependency

  // Manual location detection function
  const handleDetectLocation = async () => {
    try {
      const location = await getCurrentLocation();

      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "success",
        title: `Location updated successfully`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    } catch (error) {
      console.error("Location detection failed:", error);

      if (error.message.includes("permission denied")) {
        setIsLocationEnabled(false);
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title:
            "Location permission denied. Please enable location in browser settings.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      } else {
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Location detection failed: ${error.message}`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
    }
  };

  // Handle location from LocationModal2
  const handleLocationFromModal = useCallback(
    (locationData) => {
      if (locationData) {
        // First, save the location data
        const locationToSave = {
          ...locationData,
          isAutoDetected: false, // Mark as user-selected, not auto-detected
          timestamp: new Date().toISOString(),
        };

        // Save to localStorage
        localStorage.setItem("currentLocation", JSON.stringify(locationToSave));

        // Set manual location flag to prevent auto-detection
        localStorage.setItem("locationManuallySelected", "true");

        // Update state
        setCurrentLocation(locationToSave);

        // Check serviceability for the new location
        if (locationData.lat && locationData.lng) {
          checkServiceability(
            locationData.lat,
            locationData.lng,
            locationData.fullAddress
          );
        }

        // Notify parent component
        if (onLocationDetected) {
          onLocationDetected(locationToSave);
        }
      }
    },
    [onLocationDetected]
  );

  // Modified handleLocationClick to show location modal
  const handleLocationClick = () => {
    setShowLocationModal(true);
  };

  // Rest of your existing functions remain the same...
  const userLogin = async () => {
    if (!Mobile) {
      return Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Enter Your Mobile Number`,
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
    try {
      const config = {
        url: "/User/Sendotp",
        method: "post",
        baseURL: "https://dd-merge-backend-2.onrender.com/api",
        headers: { "content-type": "application/json" },
        data: {
          Mobile: Mobile,
        },
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
        handleClose3();
        handleShow7();
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

  const [show8, setShow8] = useState(false);
  const handleClose8 = () => setShow8(false);
  const handleShow8 = () => setShow8(true);

  const handleShowCart = () => setShowCart(true);

  const phoneNumber = "7204188504";
  const message = "Hello! I need assistance.";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  const logOut = () => {
    swal({
      title: "Yeah!",
      text: "Successfully Logged Out",
      icon: "success",
      button: "Ok!",
    });
    setTimeout(() => {
      window.location.assign("/");
    }, 5000);
    localStorage.clear();
  };

  const [apartmentdata, setapartmentdata] = useState([]);
  const getapartmentd = async () => {
    try {
      let res = await axios.get("https://dd-merge-backend-2.onrender.com/api/admin/getapartment");
      if (res.status === 200) {
        setapartmentdata(res.data.corporatedata);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    getapartmentd();
  }, []);

  const [corporatedata, setcorporatedata] = useState([]);
  const getcorporate = async () => {
    try {
      let res = await axios.get("https://dd-merge-backend-2.onrender.com/api/admin/getcorporate");
      if (res.status === 200) {
        setcorporatedata(res.data.corporatedata);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    getcorporate();
  }, []);

  const [storyLength, setStoryLength] = useState(0);

  useEffect(() => {
    const getAddWebstory = async () => {
      try {
        let res = await axios.get("https://dd-merge-backend-2.onrender.com/api/admin/getstories");
        if (res.status === 200) {
          setStoryLength(res.data.getbanner.length);
        }
      } catch (error) {
        // console.log(error);
      }
    };
    getAddWebstory();
  }, []);

  const address = JSON.parse(
    localStorage.getItem(
      addresstype === "apartment" ? "address" : "coporateaddress"
    )
  );

  const Handeledata = (ab, def) => {
    try {
      if (ab) {
        if (!user) return navigate("/", { replace: true });
        let data = JSON.parse(ab);
        const addressData = {
          Address: data?.Address,
          Delivarycharge: data?.apartmentdelivaryprice,
          doordelivarycharge: data?.doordelivaryprice,
          apartmentname: data?.Apartmentname,
          pincode: data?.pincode,
          approximatetime: data?.approximatetime,
          prefixcode: data?.prefixcode,
          name: ab?.Name || user?.Fname || "",
          flatno: ab?.fletNumber || "",
          mobilenumber: ab?.Number || user?.Mobile || "",
          towerName: ab?.towerName ? ab?.towerName : "",
          lunchSlots: data?.lunchSlots ? data?.lunchSlots : [],
          dinnerSlots: data?.dinnerSlots ? data?.dinnerSlots : [],
          deliverypoint: data?.deliverypoint ? data?.deliverypoint : "",
          locationType: data?.locationType || "",
        };
        if (!def) {
          saveSelectedAddress(data);
        }

        if (addresstype === "apartment") {
          localStorage.setItem("address", JSON.stringify(addressData));
        } else {
          localStorage.setItem("coporateaddress", JSON.stringify(addressData));
        }
      }
    } catch (error) {
      // console.log(error);
    }
  };

  //Request Location
  const [Name, setName] = useState("");
  const [Number, setNumber] = useState("");
  const [ApartmentName, setApartmentName] = useState("");
  const [Message, setMessage] = useState("");

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
        baseURL: "https://dd-merge-backend-2.onrender.com/api/",
        header: { "content-type": "application/json" },
        data: {
          Mobile: Mobile,
          otp: OTP,
        },
      };
      const res = await axios(config);
      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(res.data.details));
        sessionStorage.setItem("user", JSON.stringify(res.data.details));
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
        window.location.reload();
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

  const [selectedAddress, setSelectedAddress] = useState({});

  const getSelectedAddress = async () => {
    try {
      let res = await axios.get(
        `https://dd-merge-backend-2.onrender.com/api/user/getSelectedAddressByUserIDAddType/${user?._id}/${addresstype}`
      );
      if (res.status === 200) {
        setSelectedAddress(res.data.getdata);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      getSelectedAddress();
    }
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      if (addresstype === "apartment") {
        const am = apartmentdata.find(
          (ele) => ele?._id?.toString() === selectedAddress?.addressid
        );
        if (am) {
          Handeledata(JSON.stringify({ ...am, ...selectedAddress }), "def");
        }
      } else {
        const co = corporatedata.find(
          (ele) => ele?._id?.toString() === selectedAddress?.addressid
        );
        if (co) {
          Handeledata(JSON.stringify({ ...co, ...selectedAddress }), "def");
        }
      }
    }
  }, [selectedAddress, addresstype, apartmentdata, corporatedata]);

  const saveSelectedAddress = async (data) => {
    try {
      if (!user) return;
      let res = await axios.post(`https://dd-merge-backend-2.onrender.com/api/user/addressadd`, {
        Name: user?.Fname,
        Number: user?.Mobile,
        userId: user?._id,
        ApartmentName: data?.Apartmentname,
        addresstype: addresstype,
        addressid: data?._id,
      });
    } catch (error) {
      // console.log(error);
    }
  };

  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Get customer ID from localStorage
  const getCustomerId = () => {
    return user?._id;
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const [userData, setUserData] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  const [primaryAddressId, setPrimaryAddressId] = useState(null);

  // Fetch addresses
  // 1. First, fix the fetchAddresses function to use stable dependencies
  const fetchAddresses = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        const customerId = user?._id;

        if (!customerId) {
          return;
        }

        const response = await fetch(
          `https://dd-merge-backend-2.onrender.com/api/User/customers/${customerId}/addresses`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch addresses");
        }

        const result = await response.json();

        if (result.success) {
          const addresses = result.addresses || [];
          setAddresses(addresses);
          setPrimaryAddressId(result.primaryAddress || null);

          const primaryAddr = addresses.find(
            (addr) => addr._id === result.primaryAddress
          );
          setPrimaryAddress(primaryAddr || null);

          if (primaryAddr) {
            localStorage.setItem("primaryAddress", JSON.stringify(primaryAddr));
          }

          if (addresses && addresses.length > 0) {
            const firstType = addresses[0].addressType;
            setExpandedSections({ [firstType]: true });
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoading(false);
      }
    };
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchAddresses();
    }
  }, [user?._id, fetchAddresses]);

  // Get display name for address
  const getDisplayName = (address) => {
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
        return address.fullAddress || "";
    }
  };

  // Get display address text - with proper priority based on requirements
  const getDisplayAddress = () => {
    // If we're actively detecting location, show loading
    if (isLocating) {
      return "Detecting location...";
    }

    // If location is disabled, show message
    if (!isLocationEnabled && !addresses.length && !primaryAddress) {
      return "Enable location";
    }

    // Priority 1: Show primary address if set (from saved addresses)
    if (primaryAddress) {
      const name = getDisplayName(primaryAddress);
      return name.length > 40 ? `${name.substring(0, 37)}...` : name;
    }

    // Priority 2: Show user-selected location from LocationModal2 (not auto-detected)
    const savedLocation = localStorage.getItem("currentLocation");
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        // Only show if it's not auto-detected (user selected it manually)
        if (!parsedLocation.isAutoDetected) {
          const address =
            parsedLocation.fullAddress || parsedLocation.houseName || "";
          return address.length > 40
            ? `${address.substring(0, 37)}...`
            : address;
        }
      } catch (e) {
        console.error("Error parsing saved location:", e);
      }
    }

    // Priority 3: Show auto-detected location ONLY if no primary address and no user-selected location
    if (currentLocation?.fullAddress && !primaryAddress) {
      const address =
        currentLocation.fullAddress.length > 40
          ? `${currentLocation.fullAddress.substring(0, 37)}...`
          : currentLocation.fullAddress;
      return address;
    }

    // Priority 4: Show any saved address
    if (addresses.length > 0) {
      const name = getDisplayName(addresses[0]);
      return name.length > 40 ? `${name.substring(0, 37)}...` : name;
    }

    // Default fallback
    return "Select Location";
  };

  // Add this function to get a more detailed tooltip
  const getAddressTooltip = () => {
    if (isLocating) return "Detecting your location...";

    if (primaryAddress) {
      const name = getDisplayName(primaryAddress);
      const type = primaryAddress.addressType || "Primary Address";
      return `${type}: ${name}`;
    }

    // Check for user-selected location from modal
    const savedLocation = localStorage.getItem("currentLocation");
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        if (!parsedLocation.isAutoDetected) {
          return `Selected: ${
            parsedLocation.fullAddress || parsedLocation.houseName
          }`;
        }
      } catch (e) {
        console.error("Error parsing saved location:", e);
      }
    }

    if (currentLocation?.fullAddress) {
      return `Detected: ${currentLocation.fullAddress}`;
    }

    return "Click to select or detect location";
  };

  // Get serviceability status icon and text
  const getServiceabilityStatus = () => {
    if (!currentLocation) return null;

    if (isCheckingServiceability) {
      return {
        icon: <FaSpinner className="fa-spin" />,
        text: "Checking serviceability...",
        color: "#ff9800",
      };
    }

    if (isServiceable === true) {
      return {
        icon: <FaCheckCircle />,
        text: "Service available",
        color: "#4caf50",
      };
    }

    if (isServiceable === false) {
      return {
        icon: <FaTimesCircle />,
        text: "Service not available",
        color: "#f44336",
      };
    }

    return null;
  };

  // Handle location disabled state
  const handleLocationDisabledClick = () => {
    Swal2.fire({
      title: "Location Access Required",
      text: "Please enable location services in your browser settings to use this feature.",
      icon: "info",
      confirmButtonText: "OK",
      confirmButtonColor: "#6B8E23",
    });
  };

  return (
    <div>
      <div className="ban-container">
        <div className="mobile-banner-updated">
          <div className="screen-3" style={{ padding: "0 24px 8px 24px" }}>
            <div className="screen-2 mb-3 mt-2 d-flex align-items-center">
              <div
                className="d-flex align-items-center gap-2 w-100"
                onClick={
                  isLocationEnabled
                    ? handleLocationClick
                    : handleLocationDisabledClick
                }
                style={{ cursor: "pointer" }}
              >
                {isLocating ? (
                  <FaSpinner
                    className="fa-spin"
                    style={{
                      width: "32px",
                      height: "32px",
                      color: "#6B8E23",
                    }}
                  />
                ) : (
                  <img
                    src={Selectlocation}
                    alt="select-location"
                    className="flex-shrink-0"
                    style={{
                      width: "32px",
                      height: "32px",
                      opacity: isLocationEnabled ? 1 : 0.5,
                    }}
                  />
                )}

                <div className="d-flex flex-column cursor-pointer flex-grow-1 aligen-center">
                  <div className="d-flex align-items-center">
                    <p
                      className={`select-location-text fw-semibold text-truncate mb-0 banner-address-line ${
                        user ? "with-user-icon" : "with-login-btn"
                      }`}
                      title={getAddressTooltip()}
                      style={{ opacity: isLocationEnabled ? 1 : 0.7 }}
                    >
                      {getDisplayAddress()}
                    </p>

                    {/* Show location icon for auto-detected location */}
                    {currentLocation?.isAutoDetected && !primaryAddress && (
                      <span
                        className="ms-1"
                        title="Auto-detected location"
                        style={{ color: "#6B8E23", fontSize: "12px" }}
                      >
                        <FaMapMarkerAlt />
                      </span>
                    )}

                    {/* Show primary address badge */}
                    {primaryAddress && (
                      <span
                        className="ms-1"
                        title="Primary Address"
                        style={{ color: "#6B8E23", fontSize: "12px" }}
                      >
                        ★
                      </span>
                    )}

                    {/* Show refresh button for location - only if no primary address */}
                    {currentLocation &&
                      !isLocating &&
                      isLocationEnabled &&
                      !primaryAddress && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDetectLocation();
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#6B8E23",
                            marginLeft: "8px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                          title="Refresh location"
                        >
                          ↻
                        </button>
                      )}
                  </div>

                  {user && (
                    <p
                      className="select-location-text-small mb-0 banner-user-details"
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      {user?.Fname} | {user?.Mobile}
                      {primaryAddress && ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="d-flex gap-1 justify-content-center align-items-center referbtn">
                {/* <button
                  className="refer-earn-btn"
                  onClick={() => navigate("/refer")}
                >
                  <img
                    src="/Assets/gifticon.svg"
                    alt="refer"
                    className="refer-icon"
                  />
                  <span className="refer-earn-text">Refer & Earn</span>
                </button> */}

                {user ? (
                  <img
                    src={UserIcons}
                    alt="user-icon"
                    onClick={handleShow8}
                    className="p-2"
                  />
                ) : (
                  <button
                    className="d-flex gap-2 justify-content-center align-items-center"
                    style={{
                      background: "#FFF8DC",
                      border: "2px solid #F5DEB3",
                      color: "#2c2c2c",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontFamily: "Inter",
                      fontWeight: "600",
                      width: "106px",
                      height: "44px",
                      borderRadius: "18px",
                    }}
                    onClick={() => {
                      navigate("/login");
                    }}
                  >
                    <img
                      src={usericon}
                      alt=""
                      style={{ width: "27px", height: "27px" }}
                    />
                    LOGIN
                  </button>
                )}
              </div>
            </div>

            {/* <div
              className="d-flex align-items-center m-0 order-row"
              style={{ width: "100%" }}
            >
              <div
                className="d-flex align-items-center flex-grow-1 min-w-0"
                style={{ gap: "4px" }}
              >
                <img
                  src={clockone}
                  alt=""
                  style={{ width: "24px", height: "24px" }}
                />
                <span className="clock-text mt-2">
                  Order by 12 & Get Lunch by 1:00 PM
                </span>
              </div>

              <div
                className="veg-btn d-flex flex-column align-items-center ms-2"
                onClick={() => setIsVegOnly(!isVegOnly)}
              >
                <h6 className="m-0 veg-title">Veg Only</h6>
                <div className="veg-btn-toggle" style={{ cursor: "pointer" }}>
                  <div
                    className="veg-btn-switch"
                    style={{
                      transform: isVegOnly
                        ? "translateX(18px)"
                        : "translateX(0)",
                      backgroundColor: isVegOnly ? "#6B8E23" : "#6c757d",
                      transition: "all 0.3s ease",
                    }}
                  ></div>
                </div>
              </div>
            </div> */}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <CookingPromo />
          </div>
        </div>

        {/* Serviceability Popup - Only show when explicitly not serviceable */}
        {isServiceable === false && !showServiceablePopup && (
          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              padding: isSmall ? "0 12px 16px" : "0 16px 20px",
              zIndex: 999990,
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "600px",
                backgroundColor: "#F5DEB3",
                borderRadius: isSmall ? "16px" : "18px",
                padding: isSmall ? "16px" : "20px",
                boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                pointerEvents: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: isSmall ? "12px" : "16px",
                  marginBottom: isSmall ? "16px" : "20px",
                }}
              >
                <div
                  style={{
                    width: isSmall ? "40px" : "44px",
                    height: isSmall ? "40px" : "44px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(139, 100, 68, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={locationIcon}
                    alt="Location"
                    style={{
                      width: isSmall ? "24px" : "28px",
                      height: isSmall ? "24px" : "28px",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      margin: 0,
                      color: "#3A2E2A",
                      fontSize: isSmall ? "18px" : "20px",
                      fontWeight: "700",
                      lineHeight: "1.2",
                      marginBottom: "4px",
                    }}
                  >
                    We're not here yet
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#6A5A52",
                      fontSize: isSmall ? "14px" : "15px",
                      lineHeight: "1.4",
                    }}
                  >
                    We don't serve this address yet, but nearby areas are live
                  </p>
                </div>
              </div>

              {/* Buttons - Side by side for most screens, stacked only on very small screens */}
              <div
                style={{
                  display: "flex",
                  flexDirection: isVerySmall ? "column" : "row",
                  gap: "12px",
                  width: "100%",
                }}
              >
                <button
                  onClick={handleRequestLocationClick}
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    color: "#4B3B33",
                    border: "1.5px solid rgba(120, 92, 70, 0.35)",
                    borderRadius: isSmall ? "12px" : "14px",
                    padding: isSmall ? "12px 8px" : "14px 16px",
                    fontSize: isSmall ? "14px" : "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    minWidth: 0, // Allows text truncation if needed
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#E9D9C8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Request Location
                </button>

                <button
                  onClick={() => (window.location.href = "/current-location")}
                  style={{
                    flex: 1,
                    backgroundColor: "#E6B800",
                    color: "#2C241B",
                    border: "none",
                    borderRadius: isSmall ? "12px" : "14px",
                    padding: isSmall ? "12px 8px" : "14px 16px",
                    fontSize: isSmall ? "14px" : "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.filter = "brightness(0.96)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                >
                  Change address
                </button>
              </div>
            </div>
          </div>
        )}

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
              zIndex: 3001, // Higher z-index to appear above the first popup
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
                  width: isSmall ? "38px" : "44px",
                  height: isSmall ? "38px" : "44px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                  margin: "0 auto",
                }}
              >
                <img
                  src={locationIcon}
                  alt=""
                  style={{
                    width: isSmall ? "34px" : "40px",
                    height: isSmall ? "34px" : "40px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
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
                expanding rapidly! Let us know you're interested, and we'll
                notify you as soon as we launch in your area.
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
                  <strong>Selected Location:</strong>{" "}
                  {currentLocation?.fullAddress || "Address not available"}
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
                  {isSubmittingRequest ? "Submitting..." : "Request Service"}
                </button>
                <button
                  onClick={() => setShowServiceablePopup(false)}
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
        <ProfileOffcanvas show={show8} handleClose={handleClose8} />

        <Modal show={show3} backdrop="static" onHide={handleClose3}>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center gap-1">
              <FaLock color="#6B8E23" /> <span>Welcome to Dailydish</span>{" "}
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
                    return Swal2.fire({
                      toast: true,
                      position: "bottom",
                      icon: "error",
                      title: `Invalid Mobile Number`,
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: "me-small-toast",
                        title: "me-small-toast-title",
                      },
                    });
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
          show={show7}
          onHide={handleClose7}
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
              An OTP has been sent to your whatsapp
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
                onClick={verifyOTP}
                style={{
                  width: "100%",
                  marginTop: "24px",
                  backgroundColor: "#6B8E23",
                  color: "white",
                  textAlign: "center",
                }}
              >
                Continue
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>

      <div className="ban-container2">
        <div className="mobile-banner" style={{ position: "relative" }}>
          <UserBanner />
        </div>
        {/* <div style={{ alignSelf: "end", marginRight: "16px" }}> */}
        <div
          className="veg-btn d-flex flex-row align-items-center ms-2"
          onClick={() => setIsVegOnly(!isVegOnly)}
        >
          <h6 className="m-0 veg-title">Veg Only</h6>
          <div
            className="veg-btn-toggle"
            // 1. Toggle state on click
            style={{ cursor: "pointer" }}
          >
            <div
              className="veg-btn-switch"
              style={{
                // 2. Dynamic styling for animation and color
                transform: isVegOnly ? "translateX(18px)" : "translateX(0)",
                backgroundColor: isVegOnly ? "#6B8E23" : "#6c757d", // Green when Active, Grey when inactive
                transition: "all 0.3s ease", // Smooth sliding effect
              }}
            ></div>
          </div>
        </div>
        {/* </div> */}
      </div>

      <LocationModal2
        show={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          // Refresh addresses when modal closes to get updated primary address
          if (user) {
            fetchAddresses();
          }
        }}
        onLocationSelect={handleLocationFromModal} // Pass the handler
        currentLocation={currentLocation}
        onLocationDetect={handleDetectLocation}
        isLocationEnabled={isLocationEnabled}
      />
    </div>
  );
};

export default Banner;
