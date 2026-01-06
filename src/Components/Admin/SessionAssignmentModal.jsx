import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNotification } from "../../hooks/useNotification";
import NotificationToast from "./NotificationToast";

const SessionAssignmentModal = ({
  showModal,
  onClose,
  orders,
  onAssignmentComplete,
}) => {
  const [selectedRider, setSelectedRider] = useState("");
  const [availableRiders, setAvailableRiders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  
  const { notifications, showSuccess, showError, showWarning, removeNotification } = useNotification();

  // Fetch available riders
  useEffect(() => {
    if (showModal) {
      fetchRiders();
      // Select all unassigned orders by default
      const unassignedOrders = orders.filter(order => !order.riderId);
      setSelectedOrders(unassignedOrders.map(order => order._id));
    }
  }, [showModal, orders]);

  const fetchRiders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("https://dd-merge-backend-2.onrender.com/api/admin/riders");
      if (response.data?.riders) {
        setAvailableRiders(response.data.riders);
      }
    } catch (error) {
      console.error("Error fetching riders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderSelection = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAll = () => {
    const unassignedOrders = orders.filter(order => !order.riderId);
    if (selectedOrders.length === unassignedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(unassignedOrders.map(order => order._id));
    }
  };

  const handleAssignRider = async () => {
    if (!selectedRider || selectedOrders.length === 0) {
      showWarning("Please select a rider and at least one order");
      return;
    }

    try {
      setIsAssigning(true);
      const response = await axios.put("https://dd-merge-backend-2.onrender.com/api/admin/bulk-assign-rider", {
        riderId: selectedRider,
        orderIds: selectedOrders
      });

      if (response.data.success !== false) {
        showSuccess(`Successfully assigned ${response.data.assignedCount} orders to rider`);
        onAssignmentComplete();
        onClose();
      } else {
        showError(response.data.message || "Failed to assign rider");
      }
    } catch (error) {
      console.error("Error assigning rider:", error);
      showError("Failed to assign rider. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  if (!showModal) return null;

  const unassignedOrders = orders.filter(order => !order.riderId);
  const assignedOrders = orders.filter(order => order.riderId);

  return (
    <div className="zone-modal-overlay" onClick={onClose}>
      <div
        className="zone-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "800px", maxHeight: "90vh" }}
      >
        <div className="zone-modal-header">
          <div>
            <h2 style={{ margin: 0 }}>Assign Rider to Orders</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748b", fontWeight: "normal" }}>
              Select orders and assign them to a rider
            </p>
          </div>
          <button className="btn btn-ghost btn-small" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="zone-modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Summary Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f0f9ff",
                borderRadius: "8px",
                border: "1px solid #bae6fd",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#0284c7" }}>
                {orders.length}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Total Orders
              </div>
            </div>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fff7ed",
                borderRadius: "8px",
                border: "1px solid #fed7aa",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#ea580c" }}>
                {unassignedOrders.length}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Unassigned
              </div>
            </div>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#ecfdf5",
                borderRadius: "8px",
                border: "1px solid #a7f3d0",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#059669" }}>
                {assignedOrders.length}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Already Assigned
              </div>
            </div>
          </div>

          {/* Rider Selection */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Select Rider:
            </label>
            <select
              value={selectedRider}
              onChange={(e) => setSelectedRider(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "2px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              disabled={isLoading}
            >
              <option value="">
                {isLoading ? "Loading riders..." : "Choose a rider"}
              </option>
              {availableRiders.map((rider) => (
                <option key={rider._id} value={rider._id}>
                  {rider.name} {rider.phone ? `(${rider.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Order Selection */}
          {unassignedOrders.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ fontWeight: "600" }}>
                  Select Orders to Assign ({selectedOrders.length} selected):
                </label>
                <button
                  onClick={handleSelectAll}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {selectedOrders.length === unassignedOrders.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                {unassignedOrders.map((order) => (
                  <div
                    key={order._id}
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: selectedOrders.includes(order._id) ? "#f0f9ff" : "white",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => handleOrderSelection(order._id)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>
                        {order.username} - ID: {order.orderid || order.orderId || order._id?.slice(-6)}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        📞 {order.Mobilenumber} | 💰 ₹{order.allTotal} | 🕐 {order.slot}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Already Assigned Orders */}
          {assignedOrders.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "12px", fontWeight: "600" }}>
                Already Assigned Orders ({assignedOrders.length}):
              </label>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                {assignedOrders.map((order) => (
                  <div
                    key={order._id}
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f1f5f9",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "14px" }}>
                          {order.username} - ID: {order.orderid || order.orderId || order._id?.slice(-6)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          📞 {order.Mobilenumber} | 💰 ₹{order.allTotal}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                          🏍️ {order.riderId?.name || "Unknown Rider"}
                        </div>
                        {order.riderId?.phone && (
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            📞 {order.riderId.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAssignRider}
              disabled={!selectedRider || selectedOrders.length === 0 || isAssigning}
              style={{
                padding: "10px 20px",
                backgroundColor: selectedRider && selectedOrders.length > 0 ? "#059669" : "#cbd5e1",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: selectedRider && selectedOrders.length > 0 ? "pointer" : "not-allowed",
                fontWeight: "600",
              }}
            >
              {isAssigning ? "Assigning..." : `Assign Rider to ${selectedOrders.length} Orders`}
            </button>
          </div>
        </div>
      </div>
      
      {/* Notification Toasts */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default SessionAssignmentModal;