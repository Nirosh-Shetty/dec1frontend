import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import IsVeg from "./../assets/isVeg=yes.svg";
import IsNonVeg from "./../assets/isVeg=no.svg";
import "../Styles/AddMoreToSlotModal.css";

const AddMoreToSlotModal = ({
  show,
  onClose,
  planId,
//   hubId,
  userId,
  onItemsUpdated,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [quantities, setQuantities] = useState({});

  // Fetch menu items when modal opens
  useEffect(() => {
    if (show && planId) {
      fetchMenuItems();
    }
  }, [show, planId]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://dd-merge-backend-2.onrender.com/api/user/plan/menu-items-for-slot/${planId}`
      );

      if (response.data.success) {
        const menuItems = response.data.data.items || [];
        setItems(menuItems);

        // Initialize quantities from current plan
        const initialQties = {};
        menuItems.forEach((item) => {
          initialQties[item._id] = item.currentQuantity || 0;
        });
        setQuantities(initialQties);
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId, newQty) => {
    const qty = Math.max(0, newQty);
    setQuantities((prev) => ({
      ...prev,
      [itemId]: qty,
    }));
  };

  const handleAddMore = async () => {
    try {
      setUpdating(true);

      // Build items array with changed quantities
      const itemsToUpdate = items.map((item) => ({
        foodItemId: item._id,
        quantity: quantities[item._id] || 0,
      }));

      const response = await axios.post(
        "https://dd-merge-backend-2.onrender.com/api/user/plan/batch-update-items",
        {
          planId,
          userId,
          items: itemsToUpdate,
        }
      );

      if (response.data.success) {
        toast.success("Items updated successfully!");
        // Pass the updated plan back to parent
        onItemsUpdated && onItemsUpdated(response.data.data);
        onClose();
      }
    } catch (err) {
      console.error("Error updating items:", err);
      toast.error(
        err?.response?.data?.error || "Failed to update items"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (!show) return null;

  return (
    <div className="add-more-modal-overlay" onClick={onClose}>
      <div
        className="add-more-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="add-more-modal-header">
          <h3>Add More Items</h3>
          <button
            className="close-btn"
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="add-more-loading">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading menu items...</p>
          </div>
        )}

        {/* Items List */}
        {!loading && items.length > 0 && (
          <div className="add-more-items-list">
            {items.map((item) => (
              <div key={item._id} className="add-more-item-card">
                {/* Item Image & Info */}
                <div className="add-more-item-info">
                  <div className="add-more-item-image">
                    <img
                      src={item.foodimage || "/Assets/placeholder.png"}
                      alt={item.foodname}
                      onError={(e) => {
                        e.target.src = "/Assets/placeholder.png";
                      }}
                    />
                  </div>

                  <div className="add-more-item-details">
                    <div className="add-more-item-header">
                      <img
                        src={item.foodcategory === "Veg" ? IsVeg : IsNonVeg}
                        alt="type"
                        className="add-more-veg-icon"
                      />
                      <h5 className="add-more-item-name">{item.foodname}</h5>
                    </div>
                    <p className="add-more-item-category">
                      {item.foodcategory}
                    </p>
                    <div className="add-more-item-prices">
                      <span className="add-more-price-preorder">
                        ₹{item.preOrderPrice || item.hubPrice}
                      </span>
                      {item.preOrderPrice &&
                        item.preOrderPrice < item.hubPrice && (
                          <span className="add-more-price-original">
                            ₹{item.hubPrice}
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="add-more-quantity-control">
                    {quantities[item._id]==0?
                    <button className="add-btn"
                    onClick={() =>
                      handleQuantityChange(
                        item._id,
                         1
                      )
                    }>
                        Add
                    </button>
                    : <>
                  <button
                    className="qty-btn"
                    onClick={() =>
                      handleQuantityChange(
                        item._id,
                        (quantities[item._id] || 0) - 1
                      )
                    }
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="qty-input"
                    value={quantities[item._id] || 0}
                    onChange={(e) =>
                      handleQuantityChange(item._id, parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                  <button
                    className="qty-btn"
                    onClick={() =>
                      handleQuantityChange(
                        item._id,
                        (quantities[item._id] || 0) + 1
                      )
                    }
                  >
                    +
                  </button>
                  </>}
                
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="add-more-empty-state">
            <p>No items available for this slot</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="add-more-modal-footer">
          <button className="add-more-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="add-more-submit-btn"
            onClick={handleAddMore}
            disabled={updating || loading}
          >
            {updating ? (
              <>
                <span className="button-loader"></span> Updating...
              </>
            ) : (
              "Add More"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMoreToSlotModal;
