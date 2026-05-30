import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaSearch, FaTag } from "react-icons/fa";
import "../../Styles/MenuUpload.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import axios from "axios";

// Define ALL your API URLs
const SAVE_API_URL = "https://dd-backend-3nm0.onrender.com/api/admin/hub-menu";
const HUBS_API = "https://dd-backend-3nm0.onrender.com/api/Hub/hubs";
const PRODUCTS_API =
  "https://dd-backend-3nm0.onrender.com/api/admin/getFoodItems";

const MenuUpload = () => {
  const navigate = useNavigate();

  // View 1: Product Selection
  const [menuDate, setMenuDate] = useState("");
  const [session, setSession] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [masterProducts, setMasterProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allHubs, setAllHubs] = useState([]);
  const [addedProducts, setAddedProducts] = useState([]);

  // View 2: Hub Assignment
  const [view, setView] = useState("selection");
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Track the current priority for each product
  const [currentPriority, setCurrentPriority] = useState(1);

  // Global discount settings
  const [globalDiscountPercentage, setGlobalDiscountPercentage] = useState(0);

  // Fetch Hubs and Products on component load
  useEffect(() => {
    const fetchInitialData = async () => {
      setPageLoading(true);
      try {
        const [productsRes, hubsRes] = await Promise.all([
          axios.get(PRODUCTS_API),
          axios.get(HUBS_API),
        ]);

        if (productsRes.data && productsRes.data.data) {
          setMasterProducts(productsRes.data.data);
        } else {
          toast.error("Could not parse products. Check API.");
        }

        if (hubsRes.data && Array.isArray(hubsRes.data)) {
          setAllHubs(hubsRes.data);
        } else {
          toast.error("Could not parse hubs. Check API.");
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        toast.error("Failed to load products and hubs. Please refresh.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle product search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
    } else {
      setFilteredProducts(
        masterProducts.filter((p) =>
          p.foodname.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [searchTerm, masterProducts]);

  // Calculate discounted price (always rounded off)
  const calculateDiscountedPrice = (basePrice, discount) => {
    if (!discount || discount <= 0 || discount > 100) return basePrice;
    const discountedPrice = basePrice - (basePrice * discount) / 100;
    return Math.round(discountedPrice);
  };

  // === VIEW 1 FUNCTIONS ===

  const handleAddProduct = (product) => {
    if (!addedProducts.find((p) => p._id === product._id)) {
      setAddedProducts([...addedProducts, product]);
    }
    setSearchTerm("");
  };

  const handleRemoveProduct = (productId) => {
    setAddedProducts(addedProducts.filter((p) => p._id !== productId));
    setAssignments((prev) => {
      const newAssignments = { ...prev };
      delete newAssignments[productId];
      return newAssignments;
    });
  };

  const handleGoToAssignment = () => {
    if (!menuDate || !session) {
      return toast.warn("Please select a Date and Session.");
    }
    if (addedProducts.length === 0) {
      return toast.warn("Please add at least one product.");
    }

    // Initialize assignments state for all added products
    const newAssignments = {};
    for (const product of addedProducts) {
      newAssignments[product._id] = {};
      for (const hub of allHubs) {
        const basePrice = Number(product.foodprice || 0);

        newAssignments[product._id][hub._id] = {
          hubId: hub._id,
          hubPrice: basePrice,
          preOrderPrice: basePrice,
          totalQuantity: 10,
          hubPriority: 1,
          isActive: true,
          // Per-hub discount and offer settings
          discountPercentage: 0,
          isOffer: false,
          offerPrice: basePrice,
          offerStartDate: "",
          offerEndDate: "",
          customerType: "",
          minCart: "",
        };
      }
    }
    setAssignments(newAssignments);
    setCurrentProductIndex(0);
    setCurrentPriority(1);
    setGlobalDiscountPercentage(0);
    setView("assignment");
  };

  // === VIEW 2 FUNCTIONS ===

  // Apply global discount to all hubs for current product
  const handleApplyGlobalDiscount = () => {
    const discount = Number(globalDiscountPercentage);
    if (discount < 0 || discount > 100) {
      return toast.warn("Discount should be between 0 and 100");
    }

    const currentProductId = addedProducts[currentProductIndex]._id;
    const updatedAssignments = { ...assignments };

    if (updatedAssignments[currentProductId]) {
      Object.keys(updatedAssignments[currentProductId]).forEach((hubId) => {
        const assignment = updatedAssignments[currentProductId][hubId];
        const basePrice = assignment.hubPrice || 0;
        const discountedPrice = calculateDiscountedPrice(basePrice, discount);

        updatedAssignments[currentProductId][hubId] = {
          ...assignment,
          discountPercentage: discount,
          preOrderPrice: discountedPrice,
        };
      });
    }

    setAssignments(updatedAssignments);
    toast.success(`Applied ${discount}% discount to all hubs`);
  };

  // Update individual hub discount
  const handleHubDiscountChange = (hubId, discountValue) => {
    const currentProductId = addedProducts[currentProductIndex]._id;
    const discount = Number(discountValue);

    if (discount < 0 || discount > 100) return;

    setAssignments((prev) => {
      const currentAssignment = prev[currentProductId]?.[hubId] || {};
      const basePrice = currentAssignment.hubPrice || 0;
      const discountedPrice = calculateDiscountedPrice(basePrice, discount);

      return {
        ...prev,
        [currentProductId]: {
          ...prev[currentProductId],
          [hubId]: {
            ...currentAssignment,
            discountPercentage: discount,
            preOrderPrice: discountedPrice,
          },
        },
      };
    });
  };

  // Toggle offer for individual hub
  const handleHubOfferToggle = (hubId) => {
    const currentProductId = addedProducts[currentProductIndex]._id;

    setAssignments((prev) => {
      const currentAssignment = prev[currentProductId]?.[hubId] || {};
      const newIsOffer = !currentAssignment.isOffer;

      return {
        ...prev,
        [currentProductId]: {
          ...prev[currentProductId],
          [hubId]: {
            ...currentAssignment,
            isOffer: newIsOffer,
            offerPrice: newIsOffer
              ? currentAssignment.hubPrice
              : currentAssignment.offerPrice,
          },
        },
      };
    });
  };

  // Update offer fields for individual hub
// Update handleHubOfferFieldChange function
const handleHubOfferFieldChange = (hubId, field, value) => {
  const currentProductId = addedProducts[currentProductIndex]._id;

  setAssignments((prev) => {
    const currentAssignment = prev[currentProductId]?.[hubId] || {};
    
    // Convert to number for numeric fields
    let processedValue = value;
    if (['offerPrice', 'customerType', 'minCart'].includes(field)) {
      processedValue = value === '' || value === undefined ? undefined : Number(value);
    }

    return {
      ...prev,
      [currentProductId]: {
        ...prev[currentProductId],
        [hubId]: {
          ...currentAssignment,
          [field]: processedValue,
        },
      },
    };
  });
};

  // Advance to next product and update priority
  const handleNextClick = () => {
    if (currentProductIndex < addedProducts.length - 1) {
      const currentProductId = addedProducts[currentProductIndex]._id;
      const updatedAssignments = { ...assignments };

      allHubs.forEach((hub) => {
        if (
          updatedAssignments[currentProductId]?.[hub._id]?.isActive !== false
        ) {
          updatedAssignments[currentProductId][hub._id] = {
            ...updatedAssignments[currentProductId][hub._id],
            hubPriority: currentPriority,
          };
        }
      });

      setAssignments(updatedAssignments);
      setCurrentProductIndex((i) => i + 1);
      setCurrentPriority((prev) => prev + 1);
      setGlobalDiscountPercentage(0); // Reset global discount for next product
    }
  };

  // Go to previous product
  const handlePreviousClick = () => {
    if (currentProductIndex > 0) {
      const newIndex = currentProductIndex - 1;
      setCurrentProductIndex(newIndex);
      setCurrentPriority(newIndex + 1);
    }
  };

  // Delete local product
  const handleDeleteItem = () => {
    const productToDelete = addedProducts[currentProductIndex];
    if (!productToDelete) return;

    const newAdded = addedProducts.filter(
      (p, idx) => idx !== currentProductIndex,
    );
    setAddedProducts(newAdded);

    setAssignments((prev) => {
      const copy = { ...prev };
      delete copy[productToDelete._id];
      return copy;
    });

    if (newAdded.length === 0) {
      setView("selection");
      setCurrentProductIndex(0);
      setCurrentPriority(1);
    } else if (currentProductIndex >= newAdded.length) {
      setCurrentProductIndex(newAdded.length - 1);
      setCurrentPriority(newAdded.length);
    } else {
      setCurrentPriority(currentProductIndex + 1);
    }
  };

  // Build bulk payload and send to backend
  const handleSaveAllClick = async () => {
    if (!menuDate || !session) {
      toast.warn("Menu date and session are required.");
      return;
    }
    if (!addedProducts || addedProducts.length === 0) {
      toast.warn("No products to save.");
      return;
    }

    // Update current product's assignments with current priority
    const currentProductId = addedProducts[currentProductIndex]._id;
    const updatedAssignments = { ...assignments };

    allHubs.forEach((hub) => {
      if (updatedAssignments[currentProductId]?.[hub._id]?.isActive !== false) {
        updatedAssignments[currentProductId][hub._id] = {
          ...updatedAssignments[currentProductId][hub._id],
          hubPriority: currentPriority,
        };
      }
    });

    setAssignments(updatedAssignments);

    const items = addedProducts
      .map((product) => {
        const hubObj = updatedAssignments[product._id] || {};
        // In handleSaveAllClick, update the hubData mapping:
const hubData = Object.values(hubObj).map((h) => ({
  hubId: h.hubId,
  hubPrice: Number(h.hubPrice || product.foodprice || 0),
  preOrderPrice: Number(h.preOrderPrice || product.foodprice || 0),
  totalQuantity: Number(h.totalQuantity || 0),
  hubPriority: Number(h.hubPriority || 0),
  isActive: h.isActive !== undefined ? Boolean(h.isActive) : true,
  isOffer: h.isOffer || false,
  offerPrice: h.isOffer ? Number(h.offerPrice || 0) : undefined,
  offerStartDate: h.isOffer ? h.offerStartDate : undefined,
  offerEndDate: h.isOffer ? h.offerEndDate : undefined,
  customerType: h.isOffer && h.customerType !== undefined && h.customerType !== '' ? Number(h.customerType) : undefined,
  minCart: h.isOffer && h.minCart !== undefined && h.minCart !== '' ? Number(h.minCart) : undefined,
}));
        return {
          productId: product._id,
          menuDate,
          session,
          basePrice: Number(product.foodprice || 0),
          hubData,
        };
      })
      .filter((it) => Array.isArray(it.hubData) && it.hubData.length > 0);

    if (items.length === 0) {
      toast.warn("No hub assignments found to save.");
      return;
    }

    try {
      setLoading(true);
      // Note: You may need to update your backend to handle per-hub offer data
      // For now, we'll send individual menu items for each hub with offer
      const flatItems = [];
      items.forEach((item) => {
        item.hubData.forEach((hubItem) => {
          flatItems.push({
            productId: item.productId,
            menuDate: item.menuDate,
            session: item.session,
            basePrice: item.basePrice,
            hubData: [hubItem],
          });
        });
      });

      const res = await axios.post(`${SAVE_API_URL}/bulk`, {
        items: flatItems,
      });
      if (res?.data?.success) {
        toast.success("All items saved to hub menu.");
        setAddedProducts([]);
        setAssignments({});
        setView("selection");
        setCurrentPriority(1);
        setGlobalDiscountPercentage(0);
        navigate("/hub-product-mangement");
      } else {
        toast.error("Bulk save completed with issues.");
      }
    } catch (err) {
      console.error("Bulk save error", err);
      toast.error("Failed to save menus. See console.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentChange = (hubId, field, value) => {
    const currentProductId = addedProducts[currentProductIndex]._id;
    const numericValue = Number(value) < 0 ? 0 : Number(value);

    setAssignments((prev) => {
      const currentAssignment = prev[currentProductId]?.[hubId] || {};
      const updatedAssignment = {
        ...currentAssignment,
        [field]: numericValue,
      };

      // If hubPrice changed, recalculate preOrderPrice with existing discount
      if (field === "hubPrice") {
        const discount = currentAssignment.discountPercentage || 0;
        updatedAssignment.preOrderPrice = calculateDiscountedPrice(
          numericValue,
          discount,
        );
      }

      return {
        ...prev,
        [currentProductId]: {
          ...prev[currentProductId],
          [hubId]: updatedAssignment,
        },
      };
    });
  };

  const handleToggleHubActive = (hubId) => {
    const currentProductId = addedProducts[currentProductIndex]._id;
    setAssignments((prev) => ({
      ...prev,
      [currentProductId]: {
        ...prev[currentProductId],
        [hubId]: {
          ...prev[currentProductId][hubId],
          isActive: !prev[currentProductId][hubId].isActive,
        },
      },
    }));
  };

  const handleCancel = () => {
    setAddedProducts([]);
    setAssignments({});
    setCurrentProductIndex(0);
    setCurrentPriority(1);
    setGlobalDiscountPercentage(0);
    setView("selection");
  };

  const currentProduct = addedProducts[currentProductIndex];
  const currentAssignments = assignments[currentProduct?._id] || {};

  // Check if current product has any offers
  const hasAnyOffer = Object.values(currentAssignments).some((a) => a?.isOffer);

  // === RENDER ===

  if (pageLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <div className="mu-container">
          <h3>Loading Products and Hubs...</h3>
        </div>
      </Box>
    );
  }

  if (view === "assignment") {
    // --- VIEW 2: HUB ASSIGNMENT ---
    return (
      <Box sx={{ p: 3 }}>
        <div className="mu-container">
          <div className="mu-header">
            <h3>Assign to Hubs</h3>
            <button onClick={handleCancel} className="btn btn-secondary">
              Cancel & Go Back
            </button>
          </div>

          <div className="mu-item-header">
            <h4>
              <span className="mu-item-counter">
                {currentProductIndex + 1}/{addedProducts.length}
              </span>
              {currentProduct.foodname} - ₹{currentProduct.foodprice}
              {Object.values(currentAssignments).some(
                (a) => a?.discountPercentage > 0,
              ) && (
                <span className="mu-discount-badge">
                  {
                    Object.values(currentAssignments).find(
                      (a) => a?.discountPercentage > 0,
                    )?.discountPercentage
                  }
                  % OFF
                </span>
              )}
              {hasAnyOffer && <span className="mu-offer-badge">OFFER</span>}
            </h4>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDeleteItem}
            >
              Delete ITEM
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered mu-hub-table">
              <thead>
                <tr>
                  <th>Hub</th>
                  <th>Quantity</th>
                  <th>Hub Priority</th>
                  <th>Hub Pricing (₹)</th>
                  <th>Pre Order Pricing (₹)</th>
                  <th>Discount (%)</th>
                  <th>Special Offer</th>
                  <th>Option to close</th>
                </tr>
              </thead>
              <tbody>
                {allHubs.map((hub) => {
                  const assignment = currentAssignments[hub._id];
                  const isDisabled = !assignment?.isActive;
                  return (
                    <React.Fragment key={hub._id}>
                      <tr className={isDisabled ? "row-disabled" : ""}>
                        <td>{hub.hubName}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            disabled={isDisabled}
                            value={assignment?.totalQuantity || 0}
                            onChange={(e) =>
                              handleAssignmentChange(
                                hub._id,
                                "totalQuantity",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            disabled={isDisabled}
                            value={currentPriority}
                            readOnly
                            style={{
                              fontWeight: "bold",
                              backgroundColor: isDisabled
                                ? "#f8f9fa"
                                : "#e8f5e9",
                              textAlign: "center",
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            disabled={isDisabled}
                            value={assignment?.hubPrice || 0}
                            onChange={(e) =>
                              handleAssignmentChange(
                                hub._id,
                                "hubPrice",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            disabled={isDisabled}
                            value={assignment?.preOrderPrice || 0}
                            readOnly
                            style={{
                              backgroundColor:
                                assignment?.discountPercentage > 0
                                  ? "#fff3cd"
                                  : "#f8f9fa",
                              fontWeight: "bold",
                              color:
                                assignment?.discountPercentage > 0
                                  ? "#d32f2f"
                                  : "#333",
                            }}
                          />
                        </td>
                        <td>
                          <div className="mu-discount-cell">
                            <input
                              type="number"
                              className="form-control mu-discount-input"
                              min="0"
                              max="100"
                              value={assignment?.discountPercentage || 0}
                              onChange={(e) =>
                                handleHubDiscountChange(hub._id, e.target.value)
                              }
                              disabled={isDisabled}
                              placeholder="0"
                            />
                            <span className="mu-percent-sign">%</span>
                          </div>
                        </td>
                        <td>
                          <div className="mu-offer-cell">
                            <label className="mu-offer-toggle-label">
                              <input
                                type="checkbox"
                                checked={assignment?.isOffer || false}
                                onChange={() => handleHubOfferToggle(hub._id)}
                                disabled={isDisabled}
                              />
                              <span className="mu-offer-toggle-text">
                                Offer
                              </span>
                            </label>
                          </div>
                        </td>
                        <td>
                          <button
                            className={`btn ${
                              isDisabled ? "btn-success" : "btn-danger"
                            }`}
                            onClick={() => handleToggleHubActive(hub._id)}
                          >
                            {isDisabled ? <FaPlus /> : <FaTimes />}
                          </button>
                        </td>
                      </tr>
                      {/* Offer Details Row - shown when offer is enabled for this hub */}
                      {assignment?.isOffer && !isDisabled && (
                        <tr className="mu-offer-details-row">
                          <td colSpan="8">
                            <div className="mu-offer-details">
                              <div className="mu-offer-details-grid">
                                <div className="mu-offer-field">
                                  <label>Offer Price (₹)</label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={
                                      assignment?.offerPrice ||
                                      assignment?.hubPrice ||
                                      0
                                    }
                                    onChange={(e) =>
                                      handleHubOfferFieldChange(
                                        hub._id,
                                        "offerPrice",
                                        Number(e.target.value),
                                      )
                                    }
                                    min="0"
                                  />
                                </div>
                                <div className="mu-offer-field">
                                  <label>Offer Start Date</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={assignment?.offerStartDate || ""}
                                    onChange={(e) =>
                                      handleHubOfferFieldChange(
                                        hub._id,
                                        "offerStartDate",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="mu-offer-field">
                                  <label>Offer End Date</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={assignment?.offerEndDate || ""}
                                    onChange={(e) =>
                                      handleHubOfferFieldChange(
                                        hub._id,
                                        "offerEndDate",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="mu-offer-field">
                                  <label>Customer Type (Number)</label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={assignment?.customerType || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      handleHubOfferFieldChange(
                                        hub._id,
                                        "customerType",
                                        value === "" ? "" : Number(value),
                                      );
                                    }}
                                    min="1"
                                    placeholder="Enter customer type number"
                                  />
                                  <small className="text-muted">
                                    e.g., 1, 2, 3, etc.
                                  </small>
                                </div>
                                <div className="mu-offer-field">
                                  <label>Min Cart Value (₹)</label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={assignment?.minCart || ""}
                                    onChange={(e) =>
                                      handleHubOfferFieldChange(
                                        hub._id,
                                        "minCart",
                                        e.target.value,
                                      )
                                    }
                                    min="0"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mu-footer">
            <button
              className="btn btn-outline-secondary"
              onClick={handlePreviousClick}
              disabled={currentProductIndex === 0 || loading}
            >
              Previous
            </button>

            {currentProductIndex === addedProducts.length - 1 ? (
              <button
                className="btn btn-success"
                onClick={handleSaveAllClick}
                disabled={loading}
              >
                {loading ? "Saving..." : "Add all"}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleNextClick}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save & Next"}
              </button>
            )}
          </div>
        </div>
      </Box>
    );
  }

  // --- VIEW 1: PRODUCT SELECTION ---
  return (
    <Box sx={{ p: 3 }}>
      <div className="mu-container">
        <div className="mu-header">
          <h3>Menu Upload</h3>
        </div>

        <div className="row">
          <div className="col-md-6 form-group">
            <label>+ Select Date</label>
            <input
              type="date"
              className="form-control"
              value={menuDate}
              onChange={(e) => setMenuDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="col-md-6 form-group">
            <label>+ Select Session</label>
            <select
              className="form-control"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              <option value="">Select Lunch / Dinner / Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Breakfast">Breakfast</option>
            </select>
          </div>
        </div>

        <div className="form-group mu-product-search-container">
          <label>+ Add Product (For that particular date and session)</label>
          <div className="mu-search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="mu-search-icon" />
          </div>
          {filteredProducts.length > 0 && (
            <div className="mu-search-results">
              {filteredProducts.map((product) => (
                <div key={product._id} className="mu-search-result-item">
                  <img
                    src={
                      product.Foodgallery?.[0]?.image2 ||
                      "/Assets/logo-container.svg"
                    }
                    alt={product.foodname}
                  />
                  <span>
                    {product.foodname} (₹{product.foodprice})
                  </span>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleAddProduct(product)}
                  >
                    <FaPlus /> ADD
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mu-added-list">
          <label>Added Lists</label>
          <div className="mu-added-list-items">
            {addedProducts.length === 0 ? (
              <p className="mu-no-items">No products added yet.</p>
            ) : (
              addedProducts.map((product) => (
                <span key={product._id} className="mu-added-item-tag">
                  {product.foodname}
                  <button onClick={() => handleRemoveProduct(product._id)}>
                    <FaTimes />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div className="mu-footer">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleGoToAssignment}
          >
            Assign to Hub
          </button>
        </div>
      </div>
    </Box>
  );
};

export default MenuUpload;
