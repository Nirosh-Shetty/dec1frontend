/**
 * Cart Helper Utilities
 * Manages cart operations with localStorage persistence, grouping logic, and offer support
 */

const CART_KEY = "cart";

/**
 * Get current cart from localStorage
 * @returns {Array} Cart items array
 */
export const getCart = () => {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error("Error getting cart:", error);
    return [];
  }
};

/**
 * Save cart to localStorage
 * @param {Array} cartItems - Items to save
 */
const saveCart = (cartItems) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
};

/**
 * Calculate total price for a product with offer logic
 * @param {Object} item - Product item
 * @param {Number} quantity - Quantity
 * @returns {Object} { totalPrice, pricePerUnit, regularTotal, offerSavings }
 */
export const calculateProductPrice = (item, quantity) => {
  const qty = quantity || 1;
  const regularPrice = item.regularPrice || item.hubPrice || item.price || 0;
  const offerPrice = item.offerPrice || null;
  const hasOffer = item.offerProduct === true && offerPrice !== null;

  let totalPrice, pricePerUnit, offerApplied = false;

  if (hasOffer) {
    // First item at offer price, rest at regular price
    totalPrice = offerPrice + (regularPrice * (qty - 1));
    pricePerUnit = regularPrice;
    offerApplied = true;
  } else {
    // No offer - all at regular price
    totalPrice = regularPrice * qty;
    pricePerUnit = regularPrice;
    offerApplied = false;
  }

  const regularTotal = regularPrice * qty;
  const offerSavings = regularTotal - totalPrice;

  return {
    totalPrice,
    pricePerUnit,
    regularTotal,
    offerSavings,
    offerApplied,
    regularPrice,
    offerPrice: hasOffer ? offerPrice : null
  };
};

/**
 * Add or update item in cart with offer support
 * @param {Object} item - Item with properties: _id, itemName, price, hubId, slot, etc.
 * @param {String|Date} date - Delivery date (YYYY-MM-DD format or Date object)
 * @param {String} session - "lunch" or "dinner"
 * @param {Number} qty - Quantity (default: 1)
 * @param {Object} offerInfo - Optional offer information { offerProduct, offerPrice, regularPrice }
 * @returns {Array} Updated cart
 */
export const addToCart = (item, date, session, qty = 1, offerInfo = null) => {
  const cart = getCart();

  // Convert date to string format if it's a Date object
  let dateStr = date;
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dateStr = `${year}-${month}-${day}`;
  } else {
    dateStr = String(date);
  }

  // Determine offer information
  const hasOffer = offerInfo?.offerProduct === true;
  const regularPrice = offerInfo?.regularPrice || item.regularPrice || item.hubPrice || item.price || 0;
  const offerPrice = offerInfo?.offerPrice || null;

  // Calculate price based on offer
  const priceCalculation = calculateProductPrice(
    {
      regularPrice,
      offerPrice,
      offerProduct: hasOffer,
      hubPrice: item.hubPrice,
      price: item.price
    },
    qty
  );

  // Create cart item with slot identifier
  const cartItem = {
    ...item,
    cartId: `${item._id}-${dateStr}-${session}`, // Unique ID for this cart entry
    deliveryDate: dateStr,
    session: String(session).toLowerCase(),
    slot: `${dateStr}|${String(session).toLowerCase()}`, // Format: "2025-04-07|lunch"
    quantity: qty,
    addedAt: new Date().toISOString(),

    // Price fields
    price: priceCalculation.pricePerUnit,
    totalPrice: priceCalculation.totalPrice,
    regularPrice: regularPrice,

    // Offer fields
    offerProduct: hasOffer,
    offerApplied: priceCalculation.offerApplied,
    offerPrice: offerPrice,
    offerSavings: priceCalculation.offerSavings,
  };

  // Check if item already exists in cart
  const existingIndex = cart.findIndex(
    (c) => c.cartId === cartItem.cartId
  );

  if (existingIndex > -1) {
    // Update quantity if item exists - recalculate with new quantity
    const newQuantity = cart[existingIndex].quantity + qty;
    const updatedPriceCalc = calculateProductPrice(
      {
        regularPrice: cart[existingIndex].regularPrice,
        offerPrice: cart[existingIndex].offerPrice,
        offerProduct: cart[existingIndex].offerProduct
      },
      newQuantity
    );

    cart[existingIndex].quantity = newQuantity;
    cart[existingIndex].totalPrice = updatedPriceCalc.totalPrice;
    cart[existingIndex].price = updatedPriceCalc.pricePerUnit;
    cart[existingIndex].offerApplied = updatedPriceCalc.offerApplied;
    cart[existingIndex].offerSavings = updatedPriceCalc.offerSavings;
  } else {
    // Add new item
    cart.push(cartItem);
  }

  saveCart(cart);
  return cart;
};

/**
 * Remove item from cart by cartId
 * @param {String} cartId - Unique cart item ID
 * @returns {Array} Updated cart
 */
export const removeFromCart = (cartId) => {
  const cart = getCart();
  const updatedCart = cart.filter((item) => item.cartId !== cartId);
  saveCart(updatedCart);
  return updatedCart;
};

/**
 * Update item quantity in cart with offer recalculation
 * @param {String} cartId - Unique cart item ID
 * @param {Number} newQty - New quantity
 * @returns {Array} Updated cart
 */
export const updateCartItemQty = (cartId, newQty) => {
  const cart = getCart();
  const itemIndex = cart.findIndex((c) => c.cartId === cartId);

  if (itemIndex > -1) {
    if (newQty <= 0) {
      return removeFromCart(cartId);
    }

    const item = cart[itemIndex];
    const priceCalc = calculateProductPrice(
      {
        regularPrice: item.regularPrice,
        offerPrice: item.offerPrice,
        offerProduct: item.offerProduct
      },
      newQty
    );

    cart[itemIndex].quantity = newQty;
    cart[itemIndex].totalPrice = priceCalc.totalPrice;
    cart[itemIndex].price = priceCalc.pricePerUnit;
    cart[itemIndex].offerApplied = priceCalc.offerApplied;
    cart[itemIndex].offerSavings = priceCalc.offerSavings;

    saveCart(cart);
  }

  return cart;
};

/**
 * Clear entire cart
 * @returns {Array} Empty array
 */
export const clearCart = () => {
  try {
    localStorage.removeItem(CART_KEY);
    return [];
  } catch (error) {
    console.error("Error clearing cart:", error);
    return [];
  }
};

/**
 * Group cart items by date and session
 * Returns object with format: { "2025-04-07|lunch": [...items], "2025-04-08|dinner": [...items] }
 * @returns {Object} Grouped cart
 */
export const getCartGroupedByDateSession = () => {
  const cart = getCart();
  const grouped = {};

  cart.forEach((item) => {
    const slot = item.slot || `${item.deliveryDate}|${item.session}`;
    if (!grouped[slot]) {
      grouped[slot] = [];
    }
    grouped[slot].push(item);
  });

  return grouped;
};

/**
 * Get cart items for a specific date
 * @param {String|Date} date - YYYY-MM-DD format or Date object
 * @returns {Array} Items for that date
 */
export const getCartByDate = (date) => {
  const cart = getCart();

  let dateStr = date;
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dateStr = `${year}-${month}-${day}`;
  } else {
    dateStr = String(date);
  }

  return cart.filter((item) => {
    const itemDate = item.deliveryDate instanceof Date
      ? `${item.deliveryDate.getFullYear()}-${String(item.deliveryDate.getMonth() + 1).padStart(2, "0")}-${String(item.deliveryDate.getDate()).padStart(2, "0")}`
      : String(item.deliveryDate);
    return itemDate === dateStr;
  });
};

/**
 * Get cart items for a specific slot (date + session)
 * @param {String|Date} date - YYYY-MM-DD format or Date object
 * @param {String} session - "lunch" or "dinner"
 * @returns {Array} Items for that slot
 */
export const getCartBySlot = (date, session) => {
  const cart = getCart();

  let dateStr = date;
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dateStr = `${year}-${month}-${day}`;
  } else {
    dateStr = String(date);
  }

  const sessionLower = String(session).toLowerCase();

  return cart.filter((item) => {
    const itemDate = item.deliveryDate instanceof Date
      ? `${item.deliveryDate.getFullYear()}-${String(item.deliveryDate.getMonth() + 1).padStart(2, "0")}-${String(item.deliveryDate.getDate()).padStart(2, "0")}`
      : String(item.deliveryDate);
    const itemSession = String(item.session).toLowerCase();
    return itemDate === dateStr && itemSession === sessionLower;
  });
};

/**
 * Calculate cart totals with offer savings
 * Returns object with subtotal per slot and grand total
 * @returns {Object} { bySlot: { "date|session": { subtotal, total, savings, hasOffer }, ... }, total: number, totalSavings: number, itemCount: number }
 */
export const calculateCartTotals = () => {
  const cart = getCart();
  const grouped = getCartGroupedByDateSession();
  const bySlot = {};
  let grandTotal = 0;
  let grandRegularTotal = 0;
  let totalSavings = 0;
  let itemCount = 0;

  Object.entries(grouped).forEach(([slot, items]) => {
    const slotTotal = items.reduce((sum, item) => sum + (item.totalPrice || (item.price * item.quantity)), 0);
    const slotRegularTotal = items.reduce((sum, item) => sum + ((item.regularPrice || item.price) * item.quantity), 0);
    const slotSavings = slotRegularTotal - slotTotal;
    const hasOffer = items.some(item => item.offerApplied === true);

    bySlot[slot] = {
      subtotal: slotRegularTotal,
      total: slotTotal,
      savings: slotSavings,
      hasOffer: hasOffer
    };

    grandTotal += slotTotal;
    grandRegularTotal += slotRegularTotal;
    totalSavings += slotSavings;
  });

  itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    bySlot,
    total: grandTotal,
    regularTotal: grandRegularTotal,
    totalSavings: totalSavings,
    itemCount,
  };
};

/**
 * Get cart summary text and dates
 * Returns: { summary: "3 meals · 2 days", dates: ["Tue", "Wed"], datesFull: ["2025-04-07", "2025-04-08"] }
 * @returns {Object} Summary info
 */
export const getCartSummary = () => {
  const grouped = getCartGroupedByDateSession();
  const slots = Object.keys(grouped);

  if (slots.length === 0) {
    return {
      summary: "0 meals · 0 days",
      dates: [],
      datesFull: [],
      mealCount: 0,
      dayCount: 0,
      totalSavings: 0,
    };
  }

  // Extract unique dates and safely parse them
  const uniqueDates = [...new Set(slots.map((slot) => slot.split("|")[0]))];
  const mealCount = slots.length; // Each slot is one meal entry
  const dayCount = uniqueDates.length;

  // Calculate total savings
  const totals = calculateCartTotals();

  // Format dates for display (Tue, Wed, etc.)
  const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const formattedDates = uniqueDates.map((dateStr) => {
    try {
      let date;
      if (typeof dateStr === "string") {
        date = new Date(dateStr + "T00:00:00");
      } else {
        date = new Date(dateStr);
      }

      if (isNaN(date.getTime())) {
        return "Unknown";
      }
      return dateFormatter.format(date);
    } catch (e) {
      console.error("Error formatting date:", dateStr, e);
      return "Unknown";
    }
  });

  return {
    summary: `${mealCount} meals · ${dayCount} days`,
    dates: formattedDates,
    datesFull: uniqueDates,
    mealCount,
    dayCount,
    totalSavings: totals.totalSavings,
    hasOffer: totals.totalSavings > 0,
  };
};

/**
 * Check if item's cutoff time has passed
 * @param {String} deliveryDate - YYYY-MM-DD format
 * @param {String} session - "lunch" or "dinner"
 * @param {Object} cutoffData - { cutoffTime: "11:59:59", cutoffDate: "2025-04-06" }
 * @returns {Boolean} true if cutoff has passed
 */
export const isCutoffPassed = (deliveryDate, session, cutoffData) => {
  if (!cutoffData) return false;

  const now = new Date();
  const cutoffDateTime = new Date(`${cutoffData.cutoffDate}T${cutoffData.cutoffTime}`);

  return now > cutoffDateTime;
};

/**
 * Filter out expired items from cart (items past cutoff)
 * @param {Array} expiredSlots - Array of slots to remove: ["2025-04-07|lunch", ...]
 * @returns {Array} Updated cart
 */
export const removeExpiredItems = (expiredSlots = []) => {
  const cart = getCart();
  const updatedCart = cart.filter((item) => {
    const itemSlot = item.slot || `${item.deliveryDate}|${item.session}`;
    return !expiredSlots.includes(itemSlot);
  });
  saveCart(updatedCart);
  return updatedCart;
};

/**
 * Check if a specific date+session slot is past its local cutoff time.
 * Uses the hub's cutoffTimes data (same shape as hubLocalCutoffData).
 *
 * @param {String} dateStr - "YYYY-MM-DD"
 * @param {String} session - "Lunch" | "Dinner" | "Breakfast"
 * @param {Object} hubLocalCutoffData - { orderMode, cutoffTimes: { lunch: { defaultCutoff, employeeCutoff }, ... } }
 * @param {String} userStatus - "Employee" or anything else
 * @param {Date} [now] - optional override for current time (defaults to new Date())
 * @returns {Boolean}
 */
export const isSlotPastCutoff = (dateStr, session, hubLocalCutoffData, userStatus, now = new Date()) => {
  if (!hubLocalCutoffData?.cutoffTimes) return false;

  const key = session.toLowerCase();
  const times = hubLocalCutoffData.cutoffTimes[key];
  if (!times) return false;

  const cutoffStr = userStatus === "Employee" ? times.employeeCutoff : times.defaultCutoff;
  if (!cutoffStr) return false;

  // Build the cutoff datetime on the delivery date
  const [h, m] = cutoffStr.split(":").map(Number);
  const [y, mo, d] = dateStr.split("-").map(Number);
  const cutoffAt = new Date(y, mo - 1, d, h, m, 0, 0);

  return now >= cutoffAt;
};

/**
 * Remove cart items whose delivery slot cutoff has already passed.
 * Compares each item's deliveryDate+session against hubLocalCutoffData.
 *
 * @param {Object} hubLocalCutoffData - { orderMode, cutoffTimes: { ... } }
 * @param {String} userStatus - "Employee" or normal
 * @returns {{ removedCount: number, removedItems: Array, updatedCart: Array } | null}
 *   Returns null when nothing was removed.
 */
export const removeCutoffExpiredItems = (hubLocalCutoffData, userStatus = "Normal") => {
  if (!hubLocalCutoffData?.cutoffTimes) return null;

  const cart = getCart();
  const now = new Date();
  const removed = [];

  const updatedCart = cart.filter((item) => {
    const dateStr = typeof item.deliveryDate === "string"
      ? item.deliveryDate.split("T")[0]
      : item.deliveryDate instanceof Date
        ? `${item.deliveryDate.getFullYear()}-${String(item.deliveryDate.getMonth() + 1).padStart(2, "0")}-${String(item.deliveryDate.getDate()).padStart(2, "0")}`
        : null;

    if (!dateStr || !item.session) return true; // keep if we can't determine

    const past = isSlotPastCutoff(dateStr, item.session, hubLocalCutoffData, userStatus, now);
    if (past) {
      removed.push({
        foodname: item.foodname || item.itemName || "Unknown Item",
        deliveryDate: dateStr,
        session: item.session,
        quantity: item.quantity,
      });
      return false;
    }
    return true;
  });

  if (removed.length === 0) return null;

  saveCart(updatedCart);
  return { removedCount: removed.length, removedItems: removed, updatedCart };
};

/**
 * Get cart stats with offer information
 * @returns {Object} { totalItems, totalPrice, regularTotal, totalSavings, slotCount, hasOffer }
 */
export const getCartStats = () => {
  const cart = getCart();
  const totals = calculateCartTotals();
  const grouped = getCartGroupedByDateSession();

  return {
    totalItems: totals.itemCount,
    totalPrice: totals.total,
    regularTotal: totals.regularTotal,
    totalSavings: totals.totalSavings,
    slotCount: Object.keys(grouped).length,
    itemCount: cart.length,
    hasOffer: totals.totalSavings > 0,
  };
};

/**
 * Format slot string to readable format
 * Input: "2025-04-07|lunch" → Output: "Tue 7 Apr · Lunch"
 * @param {String} slot - Slot in format "date|session"
 * @returns {String} Formatted slot display
 */
export const formatSlot = (slot) => {
  try {
    const [dateStr, session] = slot.split("|");

    let date;
    if (typeof dateStr === "string") {
      date = new Date(dateStr + "T00:00:00");
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
      return `${session || "Unknown"} - Invalid date`;
    }

    const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short"
    });

    const day = dayFormatter.format(date);
    const dateFormatted = dateFormatter.format(date);
    const sessionCapitalized = session ? session.charAt(0).toUpperCase() + session.slice(1) : "Unknown";

    return `${day} ${dateFormatted} · ${sessionCapitalized}`;
  } catch (e) {
    console.error("Error formatting slot:", slot, e);
    return `${slot || "Unknown"}`;
  }
};

/**
 * Get offer info for a product
 * @param {Object} product - Product from API
 * @param {Number} quantity - Quantity to calculate for
 * @returns {Object} Offer information
 */
export const getProductOfferInfo = (product, quantity = 1) => {
  const hasOffer = product.offerProduct === true;
  const regularPrice = product.regularPrice || product.hubPrice || product.price || 0;
  const offerPrice = product.offerPrice || null;

  if (!hasOffer || !offerPrice) {
    return {
      hasOffer: false,
      regularPrice,
      offerPrice: null,
      savings: 0,
      totalPrice: regularPrice * quantity,
      pricePerUnit: regularPrice,
      offerMessage: null
    };
  }

  const totalPrice = offerPrice + (regularPrice * (quantity - 1));
  const savings = (regularPrice * quantity) - totalPrice;

  return {
    hasOffer: true,
    regularPrice,
    offerPrice,
    savings,
    totalPrice,
    pricePerUnit: regularPrice,
    offerMessage: quantity === 1
      ? `Special offer: ₹${offerPrice} (Save ₹${regularPrice - offerPrice})`
      : `First item at ₹${offerPrice}, next at ₹${regularPrice} (Save ₹${savings})`
  };
};

/**
 * Convert cart items to order format with offer data preserved
 * @returns {Array} Formatted items ready for API
 */
export const getCartItemsForOrder = () => {
  const cart = getCart();

  return cart.map(item => ({
    _id: item._id,
    foodItemId: item._id,
    foodname: item.itemName,
    name: item.itemName,
    image: item.image,
    foodcategory: item.foodcategory,
    basePrice: item.basePrice,
    hubPrice: item.hubPrice,
    preOrderPrice: item.preOrderPrice,
    price: item.price,
    Quantity: item.quantity,
    totalPrice: item.totalPrice,
    deliveryDate: item.deliveryDate,
    session: item.session,
    hubId: item.hubId,
    hubName: item.hubName,

    // Offer fields to preserve
    offerProduct: item.offerProduct || false,
    offerApplied: item.offerApplied || false,
    offerPrice: item.offerPrice || null,
    regularPrice: item.regularPrice || item.price,
  }));
};

/**
 * Get expired items from cart (items where deliveryDate < today)
 * @returns {Array} Items with passed delivery dates
 */
export const getExpiredItems = () => {
  const cart = getCart();

  // Get today's date at 00:00:00
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return cart.filter(item => {
    // Parse delivery date - handle both string and ISO formats
    let itemDate;
    const dateValue = item.deliveryDate;

    if (typeof dateValue === 'string') {
      // Handle ISO format (2026-04-20T...) and regular format (2026-04-20)
      const dateOnly = dateValue.split('T')[0]; // Extract date part only
      itemDate = new Date(dateOnly + 'T00:00:00');
    } else if (dateValue instanceof Date) {
      itemDate = new Date(dateValue);
      itemDate.setHours(0, 0, 0, 0);
    } else {
      return false; // Invalid date, keep item
    }

    // Check if item date is before today
    return itemDate < today;
  });
};

/**
 * Clear expired items from cart
 * @returns {Object|null} { removedCount, removedItems } or null if no items were removed
 */
export const clearExpiredItems = () => {
  const expiredItems = getExpiredItems();

  if (expiredItems.length === 0) {
    return null; // No expired items to remove
  }

  // Get current cart
  const cart = getCart();

  // Create set of expired cartIds for efficient removal
  const expiredCartIds = new Set(expiredItems.map(item => item.cartId));

  // Filter out expired items
  const updatedCart = cart.filter(item => !expiredCartIds.has(item.cartId));

  // Save updated cart
  saveCart(updatedCart);

  return {
    removedCount: expiredItems.length,
    removedItems: expiredItems.map(item => ({
      foodname: item.foodname || item.itemName || 'Unknown Item',
      deliveryDate: item.deliveryDate,
      session: item.session,
      quantity: item.quantity
    }))
  };
};

export default {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQty,
  clearCart,
  getCartGroupedByDateSession,
  getCartByDate,
  getCartBySlot,
  calculateCartTotals,
  getCartSummary,
  isCutoffPassed,
  removeExpiredItems,
  isSlotPastCutoff,
  removeCutoffExpiredItems,
  getCartStats,
  formatSlot,
  calculateProductPrice,
  getProductOfferInfo,
  getCartItemsForOrder,
  getExpiredItems,
  clearExpiredItems,
};