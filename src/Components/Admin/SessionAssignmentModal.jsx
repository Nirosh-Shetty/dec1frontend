import React, { useState, useEffect } from "react";
import axios from "axios";

const SessionAssignmentModal = ({
  showModal,
  onClose,
  orders,
  availableRiders,
  onAssignmentComplete,
}) => {
  const [selectedSession, setSelectedSession] = useState("all");
  const [sessionOrders, setSessionOrders] = useState([]);
  const [selectedRider, setSelectedRider] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (showModal) {
      filterOrdersBySession(selectedSession);
    }
  }, [showModal, orders, selectedSession]);

  const filterOrdersBySession = (session) => {
    let filtered = orders;
    if (session !== "all") {
      filtered = orders.filter(order => order.session === session);
    }
    setSessionOrders(filtered);
    setSelectedOrderIds([]); // Reset selection when session changes
  };

  const handleSessionChange = (session) => {
    setSelectedSession(session);
    filterOrdersBySession(session);
  };

  const handleOrderSelection = (orderId) => {
    setSelectedOrderIds(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === sessionOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(sessionOrders.map(order => order._id));
    }
  };

  const handleBulkAssignment = async () => {
    if (!selectedRider || selectedOrderIds.length === 0) {
      alert("Please select a rider and at least one order");
      return;
    }

    setIsAssigning(true);
    try {
      const response = await axios.put(
        "https://dd-merge-backend-2.onrender.com/api/admin/bulk-assign-rider",
        {
          riderId: selectedRider,
          orderIds: selectedOrderIds
        }
      );
      
      if (response.status === 200) {
        alert(`Successfully assigned rider to ${selectedOrderIds.length} orders`);
        onAssignmentComplete();
        onClose();
      }
    } catch (error) {
      console.error("Error assigning rider:", error);
      alert("Failed to assign rider. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const getSessionStats = () => {
    const lunchOrders = orders.filter(order => order.session === "Lunch");
    const dinnerOrders = orders.filter(order => order.session === "Dinner");
    const unassignedOrders = sessionOrders.filter(order => !order.riderId);
    
    return {
      lunch: lunchOrders.length,
      dinner: dinnerOrders.length,
      unassigned: unassignedOrders.length,
      total: sessionOrders.length
    };
  };

  if (!showModal) return null;

  const stats = getSessionStats();

  return (
    <div className="zone-modal-overlay" onClick={onClose}>
      <div
        className="zone-modal-content"
        style={{ maxWidth: "800px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="zone-modal-header">
          <div>
            <h2 style={{ margin: 0 }}>Session-Based Rider Assignment</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748b", fontWeight: "normal" }}>
              Assign riders to orders by session (Lunch/Dinner)
            </p>
          </div>
          <button className="btn btn-ghost btn-small" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="zone-modal-body">
          {/* Session Filter */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Filter by Session:
            </label>
            <select
              value={selectedSession}
              onChange={(e) => handleSessionChange(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                minWidth: "200px"
              }}
            >
              <option value="all">All Sessions ({orders.length} orders)</option>
              <option value="Lunch">Lunch ({stats.lunch} orders)</option>
              <option value="Dinner">Dinner ({stats.dinner} orders)</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
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
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#0284c7" }}>
                {stats.total}
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
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#ea580c" }}>
                {stats.unassigned}
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
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#059669" }}>
                {selectedOrderIds.length}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Selected
              </div>
            </div>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fef3c7",
                borderRadius: "8px",
                border: "1px solid #fde68a",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#d97706" }}>
                {selectedSession === "all" ? "All" : selectedSession}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Session
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
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                minWidth: "300px"
              }}
            >
              <option value="">Choose a rider...</option>
              {availableRiders.map((rider) => (
                <option key={rider._id} value={rider._id}>
                  {rider.name || "Unnamed Rider"} {rider.phone ? `(${rider.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Order Selection */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ fontWeight: "600" }}>
                Select Orders to Assign:
              </label>
              <button
                onClick={handleSelectAll}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                {selectedOrderIds.length === sessionOrders.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px"
              }}
            >
              {sessionOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No orders found for the selected session
                </div>
              ) : (
                sessionOrders.map((order, index) => (
                  <div
                    key={order._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px",
                      marginBottom: "8px",
                      backgroundColor: selectedOrderIds.includes(order._id) ? "#ecfdf5" : "#fff",
                      border: `1px solid ${selectedOrderIds.includes(order._id) ? "#a7f3d0" : "#e5e7eb"}`,
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                    onClick={() => handleOrderSelection(order._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(order._id)}
                      onChange={() => handleOrderSelection(order._id)}
                      style={{ marginRight: "12px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "14px" }}>
                            Order #{index + 1} - {order.username}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                            📞 {order.Mobilenumber} | 🏢 {order.hubName}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                            📍 {order.delivarylocation}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              padding: "4px 8px",
                              backgroundColor: order.session === "Lunch" ? "#fef3c7" : "#ddd6fe",
                              color: order.session === "Lunch" ? "#d97706" : "#7c3aed",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "600",
                              marginBottom: "4px"
                            }}
                          >
                            {order.session || "No Session"}
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#059669" }}>
                            ₹{order.allTotal}
                          </div>
                          {order.riderId && (
                            <div style={{ fontSize: "10px", color: "#dc2626", marginTop: "2px" }}>
                              Already assigned
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleBulkAssignment}
              disabled={!selectedRider || selectedOrderIds.length === 0 || isAssigning}
              style={{
                padding: "10px 20px",
                backgroundColor: selectedRider && selectedOrderIds.length > 0 ? "#059669" : "#d1d5db",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: selectedRider && selectedOrderIds.length > 0 ? "pointer" : "not-allowed",
                opacity: isAssigning ? 0.7 : 1
              }}
            >
              {isAssigning ? "Assigning..." : `Assign to ${selectedOrderIds.length} Orders`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAssignmentModal;