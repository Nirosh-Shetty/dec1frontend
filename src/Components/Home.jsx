import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { Container } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { FaPlus, FaMinus, FaSquareWhatsapp } from "react-icons/fa6";
import "../Styles/Home.css";
import Banner from "./Banner";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Drawer } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CoinBalance from "./CoinBalance";
import { WalletContext } from "../WalletContext";
import RatingModal from "./RatingModal";
import { BiSolidOffer } from "react-icons/bi";
import Swal2 from "sweetalert2";
import IsVeg from "../assets/isVeg=yes.svg";
import IsNonVeg from "../assets/isVeg=no.svg";
import MultiCartDrawer from "./MultiCartDrawer";
import DateSessionSelector from "./DateSessionSelector";
import chef from "./../assets/chef_3.png";
import { Colors } from "../Helper/themes";
import BottomNav from "./BottomNav";
import availabity from "./../assets/weui_done2-filled.png";
import { addToCart } from "../Helper/cartHelper";
import Footer from "./Footer";
import CutoffStatusCard from "./../Helper/CutoffTimer.jsx";
import { RiInformationLine } from "react-icons/ri";
import { MdDeliveryDining, MdOutlineTimer } from "react-icons/md";
import FreshIngredientsCarousel from "./FreshIngredientsCarousel.jsx";

const Home = ({ selectArea, setSelectArea, Carts, setCarts }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

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

  const { wallet, transactions } = useContext(WalletContext);

  const [loader, setloader] = useState(false);
  const [allHubMenuData, setAllHubMenuData] = useState([]);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [address, setAddress] = useState(null);
  const [shouldLoadDefaultMenu, setShouldLoadDefaultMenu] = useState(!user);
  const [cutoffValidation, setCutoffValidation] = useState({
    allowed: true,
    message: "",
    cutoffDateTime: null,
    nextAvailableDateTime: null,
    orderMode: "preorder",
  });
  const [cutoffLoading, setCutoffLoading] = useState(false);
  const [hubOrderMode, setHubOrderMode] = useState("preorder");
  const [gifUrl, setGifUrl] = useState("");
  const [message, setMessage] = useState("");
  const [AllOffer, setAllOffer] = useState([]);
  const [totalOrder, setTotalOrder] = useState([]);

  const getTotalOrder = async () => {
    try {
      let res = await axios.get("https://dd-backend-3nm0.onrender.com/api/admin/getallorders");
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

  const findNumberofOrders = () => {
    const customerId = user?._id;
    if (!customerId) return 0;
    return totalOrder.filter((customer) => customer?.customerId === customerId)
      .length;
  };

  const hasUserUsedOffer = () => {
    const customerId = user?._id;
    if (!customerId) return false;

    // Check if user used any offer on the currently selected delivery date
    const selectedDateStr =
      selectedDate instanceof Date
        ? selectedDate.toISOString().split("T")[0]
        : new Date(selectedDate).toISOString().split("T")[0];

    return totalOrder.some((order) => {
      if (order?.customerId !== customerId) return false;

      // Match order by top-level deliveryDate field
      const orderDeliveryDate = order?.deliveryDate
        ? new Date(order.deliveryDate).toISOString().split("T")[0]
        : null;
      if (orderDeliveryDate !== selectedDateStr) return false;

      // Check if any item in this order had an offer applied
      const orderItems =
        order?.allProduct || order?.items || order?.cartItems || [];
      return orderItems.some((item) => item?.offerApplied === true);
    });
  };

  const doesCustomerQualifyForOffer = (
    customerOrderCount,
    offerCustomerType,
  ) => {
    if (offerCustomerType === -1) return true;
    if (offerCustomerType === 0) return customerOrderCount === 0;
    return customerOrderCount <= offerCustomerType;
  };

  const getCustomerOrderCount = useMemo(() => {
    return findNumberofOrders();
  }, [user, totalOrder]);

  const getAllOffer = async () => {
    try {
      const response = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/admin/offers",
      );
      if (response.status === 200 && response.data?.data) {
        let offers = response.data.data;
        if (user?._id) {
          const customerOrderCount = findNumberofOrders();
          const filteredOffers = offers.filter((offer) => {
            return offer.products.some((product) =>
              doesCustomerQualifyForOffer(
                customerOrderCount,
                product.customerType,
              ),
            );
          });
          const processedOffers = filteredOffers.map((offer) => ({
            ...offer,
            products: offer.products.filter((product) =>
              doesCustomerQualifyForOffer(
                customerOrderCount,
                product.customerType,
              ),
            ),
          }));
          setAllOffer(processedOffers);
        } else {
          const publicOffers = offers
            .filter((offer) =>
              offer.products.some(
                (product) =>
                  product.customerType === -1 || product.customerType === 0,
              ),
            )
            .map((offer) => ({
              ...offer,
              products: offer.products.filter(
                (product) =>
                  product.customerType === -1 || product.customerType === 0,
              ),
            }));
          setAllOffer(publicOffers);
        }
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setAllOffer([]);
    }
  };

  const validateCutoffTiming = useCallback(
    async (hubId, session, deliveryDate) => {
      if (!hubId || !session) return true;
      try {
        setCutoffLoading(true);
        const status = user?.status === "Employee" ? "Employee" : "Normal";
        const response = await axios.post(
          "https://dd-backend-3nm0.onrender.com/api/Hub/validate-order-timing",
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
            orderMode: response.data.orderMode || "preorder",
          });
          setHubOrderMode(response.data.orderMode || "preorder");
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

  const isOfferAlreadyAppliedInCart = (slotKey = null) => {
    if (!Carts || Carts.length === 0) return false;
    return Carts.some((item) => {
      if (slotKey) {
        const itemDateStr =
          item.deliveryDate?.split("T")[0] || item.deliveryDate;
        const itemSlotKey = `${itemDateStr}|${item.session?.toLowerCase()}`;
        return (
          itemSlotKey === slotKey &&
          item.offerProduct === true &&
          item.offerApplied === true
        );
      }
      return item.offerProduct === true && item.offerApplied === true;
    });
  };

  const getAppliedOfferFromCart = (slotKey = null) => {
    if (!Carts || Carts.length === 0) return null;
    return Carts.find((item) => {
      if (slotKey) {
        const itemDateStr =
          item.deliveryDate?.split("T")[0] || item.deliveryDate;
        const itemSlotKey = `${itemDateStr}|${item.session?.toLowerCase()}`;
        return (
          itemSlotKey === slotKey &&
          item.offerProduct === true &&
          item.offerApplied === true
        );
      }
      return item.offerProduct === true && item.offerApplied === true;
    });
  };

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
        await validateCutoffTiming(
          currentAddress.hubId,
          selectedSession,
          selectedDate,
        );
      }
    };
    checkCutoff();
  }, [address, selectedDate, selectedSession, validateCutoffTiming]);

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
              "694e3650e5d3b79091854de9",
            hubName:
              parsedDefault.hubName || parsedDefault.name || "Default Hub",
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

  // FIXED: Menu fetch with proper dependencies
  useEffect(() => {
    const hubIdToUse =
      address?.hubId ||
      (shouldLoadDefaultMenu && !user ? "694e3650e5d3b79091854de9" : null);

    if (!hubIdToUse) {
      setAllHubMenuData([]);
      setloader(false);
      return;
    }

    const fetchAllMenuData = async () => {
      setloader(true);
      try {
        const res = await axios.get(
          "https://dd-backend-3nm0.onrender.com/api/user/get-hub-menu",
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

  // Listen for location updates
  useEffect(() => {
    const handleLocationUpdated = () => refreshAddress();
    const handleAddressUpdated = () => refreshAddress();
    const handleAddressAdded = () => refreshAddress();
    const handleFocus = () => refreshAddress();
    const handleDefaultHubLoaded = () => refreshAddress();
    const handleStorageChange = (e) => {
      if (
        e.key === "currentLocation" ||
        e.key === "primaryAddress" ||
        e.key === "defaultHubData"
      ) {
        refreshAddress();
      }
    };

    window.addEventListener("locationUpdated", handleLocationUpdated);
    window.addEventListener("addressUpdated", handleAddressUpdated);
    window.addEventListener("addressAdded", handleAddressAdded);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("defaultHubLoaded", handleDefaultHubLoaded);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("locationUpdated", handleLocationUpdated);
      window.removeEventListener("addressUpdated", handleAddressUpdated);
      window.removeEventListener("addressAdded", handleAddressAdded);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("defaultHubLoaded", handleDefaultHubLoaded);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshAddress]);

  const handleSelectionChange = (date1, session1) => {
    setSelectedDate(date1);
    setSelectedSession(session1);
    setSelectedCategory("");
    window.scrollTo(0, 0);
  };

  const handleLocationDetected = useCallback((newLocation) => {
    setAddress(newLocation);
    setShouldLoadDefaultMenu(false);
    if (newLocation) {
      localStorage.setItem("currentLocation", JSON.stringify(newLocation));
    }
    window.dispatchEvent(new Event("locationUpdated"));
  }, []);

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
    if (hubOrderMode === "instant") {
      return { price: hubPrice };
    }
    const beforeCutoff = cutoffValidation.allowed;
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
  const onClose = () => setOpen(false);

  useEffect(() => {
    if (open) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
    return () => document.body.classList.remove("drawer-open");
  }, [open]);

  useEffect(() => {
    refreshAddress();
  }, [user]);

  const getProductOffer = (item) => {
    try {
      const primaryAddressJson = localStorage.getItem("primaryAddress");
      if (!primaryAddressJson || !AllOffer?.length) return null;
      const primaryAddress = JSON.parse(primaryAddressJson);
      const isEmployeeForOffer = user?.status === "Employee";
      const acquisitionChannelForOffer = isEmployeeForOffer
        ? "employee"
        : user?.acquisition_channel || "organic";
      const customerOrderCount = findNumberofOrders();
      const dateStr =
        selectedDate instanceof Date
          ? selectedDate.toISOString().split("T")[0]
          : new Date(selectedDate).toISOString().split("T")[0];
      const slotKey = `${dateStr}|${selectedSession.toLowerCase()}`;
      const hasOfferInCart = isOfferAlreadyAppliedInCart(slotKey);

      for (const offer of AllOffer) {
        const hubMatches = offer?.hubId === primaryAddress?.hubId;
        const acquisitionChannelMatch =
          offer?.acquisition_channel === acquisitionChannelForOffer;
        const offerStartDate = new Date(offer?.startDate);
        const offerEndDate = new Date(offer?.endDate);
        const deliverydate = new Date(item.deliveryDate);
        const isWithinDateRange =
          deliverydate >= offerStartDate && deliverydate <= offerEndDate;

        if (hubMatches && isWithinDateRange && acquisitionChannelMatch) {
          const matchingProduct = offer.products?.find(
            (product) =>
              product?.foodItemId?.toString() === item?._id?.toString(),
          );
          if (matchingProduct) {
            const customerQualifies = doesCustomerQualifyForOffer(
              customerOrderCount,
              matchingProduct.customerType,
            );
            if (!customerQualifies) return null;
            // Check if user already used any offer in a past order
            if (hasUserUsedOffer()) return null;
            if (hasOfferInCart) return { ...matchingProduct, isBlocked: true };
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

  const [deliveryCharge, setDeliveryCharge] = useState([]);
  const getDeliveryRates = async () => {
    try {
      const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/deliveryrate/all");
      setDeliveryCharge(res.data.data);
    } catch (error) {
      console.error("Error fetching delivery rates:", error);
    }
  };

  useEffect(() => {
    getDeliveryRates();
  }, []);

  const findDeliveryRate = (hubId, acquisitionChannel, status) => {
    if (!deliveryCharge || deliveryCharge.length === 0) return 15;
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

  const addCart1 = async (item, offerData, matchedLocation) => {
    if (!cutoffValidation.allowed) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title:
          cutoffValidation.message ||
          `Cannot add to cart. Orders are closed for ${selectedSession}.`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: "me-small-toast", title: "me-small-toast-title" },
      });
      return;
    }

    if (!matchedLocation || matchedLocation?.Remainingstock === 0) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Product is out of stock`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: "me-small-toast", title: "me-small-toast-title" },
      });
      return;
    }

    if (offerData && offerData.customerType !== undefined && user?._id) {
      const customerOrderCount = findNumberofOrders();
      const customerQualifies = doesCustomerQualifyForOffer(
        customerOrderCount,
        offerData.customerType,
      );
      if (!customerQualifies) {
        let message =
          offerData.customerType === 0
            ? `This offer is only for first-time customers! You have already placed ${customerOrderCount} order(s).`
            : `This offer is for customers with ${offerData.customerType} or fewer orders. You have placed ${customerOrderCount} order(s).`;
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

    const dateStr =
      selectedDate instanceof Date
        ? selectedDate.toISOString().split("T")[0]
        : new Date(selectedDate).toISOString().split("T")[0];
    const slotKey = `${dateStr}|${selectedSession.toLowerCase()}`;
    const hasOfferInCart = isOfferAlreadyAppliedInCart(slotKey);
    const appliedOffer = getAppliedOfferFromCart(slotKey);
    const regularPrice =
      matchedLocation?.hubPrice ||
      item?.hubPrice ||
      matchedLocation?.basePrice ||
      item?.basePrice ||
      115;

    let appliedPrice;
    let isOfferApplied = false;
    let finalOfferPrice = null;
    let finalRegularPrice = regularPrice;

    if (offerData && offerData.price && user?._id) {
      const customerOrderCount = findNumberofOrders();
      const customerQualifies = doesCustomerQualifyForOffer(
        customerOrderCount,
        offerData.customerType,
      );
      if (customerQualifies) {
        if (!hasOfferInCart && !hasUserUsedOffer()) {
          appliedPrice = offerData.price;
          isOfferApplied = true;
          finalOfferPrice = offerData.price;
        } else if (hasUserUsedOffer()) {
          appliedPrice = regularPrice;
          isOfferApplied = false;
          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "info",
            title: `You've already used this offer in a previous order.`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
              popup: "me-small-toast",
              title: "me-small-toast-title",
            },
          });
        } else {
          appliedPrice = regularPrice;
          isOfferApplied = false;
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
      }
    } else {
      appliedPrice = regularPrice;
    }

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
      price: appliedPrice,
      actualPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
      basePrice: matchedLocation?.basePrice || item?.basePrice || 0,
      hubPrice: matchedLocation?.hubPrice || item?.hubPrice || 0,
      preOrderPrice: matchedLocation?.preOrderPrice || item?.preOrderPrice || 0,
      offerProduct: !!offerData,
      offerApplied: isOfferApplied,
      offerPrice: finalOfferPrice,
      regularPrice: finalRegularPrice,
      minCart: offerData?.minCart || 0,
      customerType: offerData?.customerType || null,
      hubId: matchedLocation?.hubId || item?.hubId,
      hubName: matchedLocation?.hubName,
    };

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartId = `${item._id}-${dateStr}-${selectedSession.toLowerCase()}`;
    const exists = cart.some((c) => c.cartId === cartId);

    if (exists) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Item is already in this slot's cart`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: "me-small-toast", title: "me-small-toast-title" },
      });
      return;
    }

    addToCart(itemToAdd, selectedDate, selectedSession, 1, {
      offerProduct: !!offerData,
      offerPrice: finalOfferPrice,
      regularPrice: finalRegularPrice,
      offerApplied: isOfferApplied,
    });

    const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCarts(updatedCart);
    handleShow();

    if (isOfferApplied) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "success",
        title: `Added with offer! ₹${finalOfferPrice} instead of ₹${regularPrice}`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: "me-small-toast", title: "me-small-toast-title" },
      });
    }
  };

  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
    const addonedCarts = async () => {
      try {
        await axios.post("https://dd-backend-3nm0.onrender.com/api/cart/addCart", {
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

  const increaseQuantity = (foodItemId, offerData, item, matchedLocation) => {
    const maxStock = matchedLocation?.Remainingstock || 0;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const selectedDateStr = `${year}-${month}-${day}`;
    const sessionLower = selectedSession.toLowerCase();

    const existingItem = Carts.find(
      (cartItem) =>
        cartItem._id === foodItemId &&
        cartItem.deliveryDate === selectedDateStr &&
        cartItem.session === sessionLower,
    );
    if (!existingItem) return;

    const currentQuantity = existingItem.quantity;
    const newQuantity = currentQuantity + 1;

    if (!cutoffValidation.allowed) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title:
          cutoffValidation.message ||
          `Cannot increase quantity. Orders are closed for ${selectedSession}.`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: "me-small-toast", title: "me-small-toast-title" },
      });
      return;
    }

    if (newQuantity > maxStock) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `No more stock available! Only ${maxStock} left.`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: "me-small-toast", title: "me-small-toast-title" },
      });
      return;
    }

    const regularPrice =
      existingItem.regularPrice ||
      existingItem.hubPrice ||
      matchedLocation?.hubPrice ||
      115;
    const offerPrice = existingItem.offerPrice;
    const gotOfferPrice = existingItem.offerApplied === true;

    let newPricePerUnit;
    let newTotalPrice;
    let newOfferApplied = gotOfferPrice;
    let newOfferSavings = 0;

    if (gotOfferPrice && offerPrice) {
      if (currentQuantity === 1 && newQuantity === 2) {
        newPricePerUnit = regularPrice;
        newTotalPrice = offerPrice + regularPrice;
        newOfferSavings = regularPrice * 2 - newTotalPrice;
      } else if (currentQuantity >= 2) {
        newPricePerUnit = regularPrice;
        newTotalPrice = existingItem.totalPrice + regularPrice;
        newOfferSavings = regularPrice * newQuantity - newTotalPrice;
      } else {
        newTotalPrice = offerPrice + regularPrice * (newQuantity - 1);
        newPricePerUnit = regularPrice;
        newOfferSavings = regularPrice * newQuantity - newTotalPrice;
      }
    } else {
      newPricePerUnit = regularPrice;
      newTotalPrice = regularPrice * newQuantity;
      newOfferApplied = false;
    }

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
          offerProduct: cartItem.offerProduct,
          offerPrice: cartItem.offerPrice,
          regularPrice: cartItem.regularPrice,
        };
      }
      return cartItem;
    });

    updateCartData(updatedCart);

    if (gotOfferPrice && currentQuantity === 1 && newQuantity === 2) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Second item added at ₹${regularPrice}`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        customClass: { popup: "me-small-toast", title: "me-small-toast-title" },
      });
    }
  };

  const [show, setShow] = useState(true);
  const [expiryDays, setExpiryDays] = useState(0);

  const decreaseQuantity = (foodItemId, offerData, matchedLocation) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const selectedDateStr = `${year}-${month}-${day}`;
    const sessionLower = selectedSession.toLowerCase();

    const existingItem = Carts.find(
      (cartItem) =>
        cartItem._id === foodItemId &&
        cartItem.deliveryDate === selectedDateStr &&
        cartItem.session === sessionLower,
    );
    if (!existingItem) return;

    const currentQuantity = existingItem.quantity;
    const newQuantity = currentQuantity - 1;

    if (!cutoffValidation.allowed) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title:
          cutoffValidation.message ||
          `Cannot decrease quantity. Orders are closed for ${selectedSession}.`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: "me-small-toast", title: "me-small-toast-title" },
      });
      return;
    }

    if (newQuantity <= 0) {
      const updatedCart = Carts.filter(
        (cartItem) =>
          !(
            cartItem._id === foodItemId &&
            cartItem.deliveryDate === selectedDateStr &&
            cartItem.session === sessionLower
          ),
      );
      updateCartData(updatedCart);
      return;
    }

    const regularPrice =
      existingItem.regularPrice ||
      existingItem.hubPrice ||
      matchedLocation?.hubPrice ||
      115;
    const offerPrice = existingItem.offerPrice;
    const gotOfferPrice = existingItem.offerApplied === true;

    let newPricePerUnit;
    let newTotalPrice;
    let newOfferApplied = gotOfferPrice;
    let newOfferSavings = 0;

    if (gotOfferPrice && offerPrice) {
      if (currentQuantity === 2 && newQuantity === 1) {
        newPricePerUnit = offerPrice;
        newTotalPrice = offerPrice;
        newOfferSavings = regularPrice - offerPrice;
      } else if (currentQuantity > 2 && newQuantity >= 2) {
        newTotalPrice = offerPrice + regularPrice * (newQuantity - 1);
        newPricePerUnit = regularPrice;
        newOfferSavings = regularPrice * newQuantity - newTotalPrice;
      } else {
        newTotalPrice = offerPrice + regularPrice * (newQuantity - 1);
        newPricePerUnit = regularPrice;
        newOfferSavings = regularPrice * newQuantity - newTotalPrice;
      }
    } else {
      newPricePerUnit = regularPrice;
      newTotalPrice = regularPrice * newQuantity;
      newOfferApplied = false;
    }

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
          offerProduct: cartItem.offerProduct,
          offerPrice: cartItem.offerPrice,
          regularPrice: cartItem.regularPrice,
        };
      }
      return cartItem;
    });

    updateCartData(updatedCart);
  };

  useEffect(() => {
    if (Carts?.length > 0) handleShow();
    getAllOffer();
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

  const overallTotalItems = useMemo(
    () => groupedCarts.reduce((acc, slot) => acc + slot.totalItems, 0),
    [groupedCarts],
  );
  const overallSubtotal = useMemo(
    () => groupedCarts.reduce((acc, slot) => acc + slot.subtotal, 0),
    [groupedCarts],
  );

  const proceedToCheckout = () => {
    if (!user) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Please Login!`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: "me-small-toast", title: "me-small-toast-title" },
      });
      return;
    }
    if (Carts.length === 0) return;
    if (!address) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Please Select Address!`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: "me-small-toast", title: "me-small-toast-title" },
      });
      return;
    }
    navigate("/checkout-multiple");
  };

  const getCartQuantity = (itemId) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const selectedDateStr = `${year}-${month}-${day}`;
    const sessionLower = selectedSession.toLowerCase();
    const matchingItems = Carts?.filter(
      (cartItem) =>
        (cartItem?._id === itemId || cartItem?.foodItemId === itemId) &&
        cartItem.deliveryDate === selectedDateStr &&
        cartItem.session === sessionLower,
    );
    const totalQuantity = matchingItems?.reduce(
      (total, curr) => total + (curr?.quantity || curr?.Quantity || 0),
      0,
    );
    return totalQuantity || 0;
  };

  useEffect(() => {
    const checkCutoffForDisplay = async () => {
      if (address?.hubId && selectedDate && selectedSession) {
        await validateCutoffTiming(
          address.hubId,
          selectedSession,
          selectedDate,
        );
      }
    };
    checkCutoffForDisplay();
  }, [address?.hubId, selectedDate, selectedSession, validateCutoffTiming]);

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

  useEffect(() => {
    localStorage.removeItem("triggerProceedToPlan");
    sessionStorage.removeItem("justAddedAddress");
  }, []);

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

      {address?.hubId && selectedDate && selectedSession && (
        <CutoffStatusCard
          selectedDate={selectedDate}
          selectedSession={selectedSession}
          userStatus={user?.status}
          cutoffValidation={cutoffValidation}
          cutoffLoading={cutoffLoading}
        />
      )}

      <FreshIngredientsCarousel/>

      {wallet?.balance > 0 && show && (
        <div style={{ position: "relative" }}>
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
        <DateSessionSelector
          onChange={handleSelectionChange}
          currentDate={selectedDate}
          currentSession={selectedSession}
          menuData={allHubMenuData}
        />
      </div>

      <Container>
        <RatingModal />
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
            <div className="lds-ripple">
              <div></div>
              <div></div>
            </div>
          </div>
        ) : null}
      </Container>

      <div className="maincontainer">
        <div className="mobile-product-box" style={{ marginBottom: "30px" }}>
          <div style={{ marginBottom: "20px" }}>
            <TabsComponent
              tabs={dynamicTabs}
              activeTab={selectedCategory}
              onTabClick={setSelectedCategory}
            />
          </div>

          {!cutoffValidation.allowed && finalDisplayItems.length === 0 && (
            <div
              style={{
                background: "#FFF3E0",
                border: "1px solid #FF9800",
                borderRadius: "12px",
                padding: "20px",
                margin: "16px",
                textAlign: "center",
              }}
            >
              <MdOutlineTimer size={48} color="#FF9800" />
              <h4 style={{ marginTop: "12px", color: "#E65100" }}>
                Orders Closed for {selectedSession}
              </h4>
              <p style={{ color: "#666" }}>{cutoffValidation.message}</p>
            </div>
          )}

          <div className="d-flex gap-1 mb-2 flex-column">
            <div className="row">
              {finalDisplayItems?.map((item, i) => {
                let matchedLocation = item.locationPrice?.[0] || {
                  Remainingstock: 0,
                  hubPrice: item.hubPrice || item.basePrice || 0,
                  preOrderPrice: item.preOrderPrice || 0,
                  basePrice: item.basePrice || 0,
                };

                const productOffer = getProductOffer(item);
                const slotKey = `${selectedDate.toISOString().split("T")[0]}|${selectedSession.toLowerCase()}`;
                const hasOfferInCart = isOfferAlreadyAppliedInCart(slotKey);
                const showOfferPrice =
                  productOffer && !hasOfferInCart && !productOffer.isBlocked;
                const { price: effectivePrice } = getEffectivePrice(
                  item,
                  matchedLocation,
                  item?.session,
                );
                const selectedDateISO = selectedDate.toISOString();
                const cartItem = Carts.find(
                  (cartItem) =>
                    cartItem?.foodItemId === item?._id &&
                    cartItem.deliveryDate === selectedDateISO &&
                    cartItem.session === selectedSession,
                );

                let displayPrice = effectivePrice;
                let offerPrice = null;

                if (cartItem && typeof cartItem.totalPrice === "number") {
                  displayPrice = Math.round(cartItem.totalPrice);
                  if (
                    cartItem.offerApplied &&
                    cartItem.Quantity > 1 &&
                    cartItem.regularPrice
                  ) {
                    offerPrice = Math.round(
                      cartItem.regularPrice * cartItem.Quantity,
                    );
                  }
                } else if (showOfferPrice && productOffer?.price) {
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
                        {/* {productOffer &&
                          productOffer.customerType !== undefined &&
                          !cartItem && (
                            <div
                              style={{ marginBottom: "8px", marginLeft: "6px" }}
                            >
                              <span
                                style={{
                                  fontSize: "10px",
                                  backgroundColor: "#f0f0f0",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  color: "#666",
                                }}
                              >
                                {productOffer.customerType === 0
                                  ? "🎁 First Order Only"
                                  : productOffer.customerType === 1
                                    ? "🎉 Up to 1 Order"
                                    : `✨ Up to ${productOffer.customerType} orders`}
                              </span>
                            </div>
                          )} */}
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
                                style={{
                                  opacity:
                                    (user && !address) ||
                                    !cutoffValidation.allowed
                                      ? 0.5
                                      : 1,
                                  cursor:
                                    (user && !address) ||
                                    !cutoffValidation.allowed
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                              >
                                <div className="pick-btn-text">
                                  <span className="pick-btn-text1">ADD</span>
                                  {/* <span className="pick-btn-text2">
                                    Confirm Later
                                  </span> */}
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
                                  !cutoffValidation.allowed
                                    ? null
                                    : decreaseQuantity(
                                        item?._id,
                                        productOffer,
                                        matchedLocation,
                                      )
                                }
                                style={{
                                  opacity:
                                    (user && !address) ||
                                    !cutoffValidation.allowed
                                      ? 0.5
                                      : 1,
                                  pointerEvents:
                                    (user && !address) ||
                                    !cutoffValidation.allowed
                                      ? "none"
                                      : "auto",
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
                                  !cutoffValidation.allowed
                                    ? null
                                    : increaseQuantity(
                                        item?._id,
                                        productOffer,
                                        item,
                                        matchedLocation,
                                      )
                                }
                                style={{
                                  opacity:
                                    (user && !address) ||
                                    !cutoffValidation.allowed
                                      ? 0.5
                                      : 1,
                                  pointerEvents:
                                    (user && !address) ||
                                    !cutoffValidation.allowed
                                      ? "none"
                                      : "auto",
                                }}
                              >
                                <FaPlus />
                              </div>
                            </button>
                          ) : gifUrl === "Closed.gif" ? (
                            <button className="add-to-cart-btn" disabled>
                              <span className="add-to-cart-btn-text">Add</span>
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
                              <span className="add-to-cart-btn-text">Add</span>
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

              {!loader &&
                finalDisplayItems.length === 0 &&
                cutoffValidation.allowed && (
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
        proceedToPlan={proceedToCheckout}
        groupedCarts={groupedCarts}
        overallSubtotal={overallSubtotal}
        overallTotalItems={overallTotalItems}
        onJumpToSlot={handleSelectionChange}
      />

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
                    const image = document.querySelector(".modern-food-image");
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
                        hubPrice: foodData.hubPrice || foodData.basePrice || 0,
                        preOrderPrice: foodData.preOrderPrice || 0,
                        basePrice: foodData.basePrice || 0,
                      };
                const productOffer = getProductOffer(foodData);
                const slotKey = `${selectedDate.toISOString().split("T")[0]}|${selectedSession.toLowerCase()}`;
                const hasOfferInCart = isOfferAlreadyAppliedInCart(slotKey);
                const showOfferPrice =
                  productOffer && !hasOfferInCart && !productOffer.isBlocked;
                const eff = getEffectivePrice(
                  foodData,
                  matchedLocation,
                  foodData?.session,
                );
                const currentPrice =
                  showOfferPrice && productOffer?.price
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
                            {productOffer &&
                              productOffer.customerType !== undefined && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    marginLeft: "5px",
                                  }}
                                >
                                  {productOffer.customerType === 0
                                    ? "(First Order Only)"
                                    : productOffer.customerType === 1
                                      ? "(Up to 1 Order)"
                                      : `(Up to ${productOffer.customerType} orders)`}
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
                            if (!(user && !address) && cutoffValidation.allowed)
                              decreaseQuantity(
                                foodData?._id,
                                productOffer,
                                matchedLocation,
                              );
                          }}
                          style={{
                            opacity:
                              (user && !address) || !cutoffValidation.allowed
                                ? 0.5
                                : 1,
                            pointerEvents:
                              (user && !address) || !cutoffValidation.allowed
                                ? "none"
                                : "auto",
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
                            if (!(user && !address) && cutoffValidation.allowed)
                              increaseQuantity(
                                foodData?._id,
                                productOffer,
                                foodData,
                                matchedLocation,
                              );
                          }}
                          style={{
                            opacity:
                              (user && !address) || !cutoffValidation.allowed
                                ? 0.5
                                : 1,
                            pointerEvents:
                              (user && !address) || !cutoffValidation.allowed
                                ? "none"
                                : "auto",
                          }}
                        >
                          <FaPlus />
                        </div>
                      </div>
                    ) : stockCount > 0 && gifUrl !== "Closed.gif" ? (
                      <button
                        className="add-to-cart-btn"
                        onClick={() =>
                          addCart1(foodData, productOffer, matchedLocation)
                        }
                        disabled={
                          (user && !address) || !cutoffValidation.allowed
                        }
                        style={{
                          opacity:
                            (user && !address) || !cutoffValidation.allowed
                              ? 0.5
                              : 1,
                          cursor:
                            (user && !address) || !cutoffValidation.allowed
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        <span className="add-to-cart-btn-text">Add</span>
                        <span className="add-to-cart-btn-icon">
                          <FaPlus />
                        </span>
                      </button>
                    ) : (
                      <button
                        className={
                          gifUrl === "Closed.gif" || !cutoffValidation.allowed
                            ? "add-to-cart-btn-disabled"
                            : "sold-out-btn"
                        }
                        disabled
                      >
                        <span className="add-to-cart-btn-text">
                          {gifUrl === "Closed.gif"
                            ? "Closed"
                            : !cutoffValidation.allowed
                              ? "Orders Closed"
                              : "Sold Out"}
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
          font-size: 14px;
          font-weight: 400;
          line-height: 18px;
          letter-spacing: -0.7px;
          color: ${Colors.primaryText};
          transition: all 0.3s ease;
        }
        .tab-button.active .tab-button-text {
          font-size: 16px;
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
