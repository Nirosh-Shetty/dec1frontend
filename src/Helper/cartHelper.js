/**
 * Cart Helper Utilities
 * Manages cart operations with localStorage persistence and grouping logic
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
 * Add or update item in cart
 * @param {Object} item - Item with properties: _id, itemName, price, hubId, slot, etc.
 * @param {String|Date} date - Delivery date (YYYY-MM-DD format or Date object)
 * @param {String} session - "lunch" or "dinner"
 * @param {Number} qty - Quantity (default: 1)
 * @returns {Array} Updated cart
 */
export const addToCart = (item, date, session, qty = 1) => {
  const cart = getCart();
  
  // Convert date to string format if it's a Date object
  let dateStr = date;
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dateStr = `${year}-${month}-${day}`;
  } else {
    // Ensure it's a string
    dateStr = String(date);
  }
  
  // Create cart item with slot identifier
  const cartItem = {
    ...item,
    cartId: `${item._id}-${dateStr}-${session}`, // Unique ID for this cart entry
    deliveryDate: dateStr,
    session: String(session).toLowerCase(),
    slot: `${dateStr}|${String(session).toLowerCase()}`, // Format: "2025-04-07|lunch"
    quantity: qty,
    addedAt: new Date().toISOString(),
  };

  // Check if item already exists in cart
  const existingIndex = cart.findIndex(
    (c) => c.cartId === cartItem.cartId
  );

  if (existingIndex > -1) {
    // Update quantity if item exists
    cart[existingIndex].quantity += qty;
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
 * Update item quantity in cart
 * @param {String} cartId - Unique cart item ID
 * @param {Number} newQty - New quantity
 * @returns {Array} Updated cart
 */
export const updateCartItemQty = (cartId, newQty) => {
  const cart = getCart();
  const item = cart.find((c) => c.cartId === cartId);
  
  if (item) {
    if (newQty <= 0) {
      return removeFromCart(cartId);
    }
    item.quantity = newQty;
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
 * Calculate cart totals
 * Returns object with subtotal per slot and grand total
 * @returns {Object} { bySlot: { "date|session": price, ... }, total: number, itemCount: number }
 */
export const calculateCartTotals = () => {
  const cart = getCart();
  const grouped = getCartGroupedByDateSession();
  const bySlot = {};
  let grandTotal = 0;
  let itemCount = 0;

  Object.entries(grouped).forEach(([slot, items]) => {
    const slotTotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    bySlot[slot] = slotTotal;
    grandTotal += slotTotal;
  });

  itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    bySlot,
    total: grandTotal,
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
    };
  }

  // Extract unique dates and safely parse them
  const uniqueDates = [...new Set(slots.map((slot) => slot.split("|")[0]))];
  const mealCount = slots.length; // Each slot is one meal entry
  const dayCount = uniqueDates.length;

  // Format dates for display (Tue, Wed, etc.)
  const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const formattedDates = uniqueDates.map((dateStr) => {
    try {
      // Handle both string and Date object formats
      let date;
      if (typeof dateStr === "string") {
        date = new Date(dateStr + "T00:00:00");
      } else {
        date = new Date(dateStr);
      }
      
      // Validate the date
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
    summary: `${mealCount} meals · ${dayCount} days confirmed tonight`,
    dates: formattedDates,
    datesFull: uniqueDates,
    mealCount,
    dayCount,
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
 * Get cart stats
 * @returns {Object} { totalItems, totalPrice, slotCount }
 */
export const getCartStats = () => {
  const cart = getCart();
  const totals = calculateCartTotals();
  const grouped = getCartGroupedByDateSession();

  return {
    totalItems: totals.itemCount,
    totalPrice: totals.total,
    slotCount: Object.keys(grouped).length,
    itemCount: cart.length,
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
    
    // Handle both string and Date object formats
    let date;
    if (typeof dateStr === "string") {
      date = new Date(dateStr + "T00:00:00");
    } else {
      date = new Date(dateStr);
    }
    
    // Validate the date
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
  getCartStats,
  formatSlot,
};
