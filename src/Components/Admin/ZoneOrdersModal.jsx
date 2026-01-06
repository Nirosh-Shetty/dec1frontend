import React, { useState, useEffect } from "react";
import axios from "axios";
import SessionAssignmentModal from "./SessionAssignmentModal";
import NotificationToast from "./NotificationToast";
import { useNotification } from "../../hooks/useNotification";

const ZoneOrdersModal = ({
  showModal,
  onClose,
  loading,
  orders,
  addressTypeConfig,
  onOrderClick,
  onAssignmentComplete,
  currentZone,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"
  
  const { notifications, showSuccess, showError, showWarning, showInfo, removeNotification } = useNotification();

  // Filter orders based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.orderid?.toLowerCase().includes(searchLower) ||
          order.orderId?.toLowerCase().includes(searchLower) ||
          order._id?.toLowerCase().includes(searchLower) ||
          order.username?.toLowerCase().includes(searchLower) ||
          order.Mobilenumber?.includes(searchTerm) ||
          order.riderId?.name?.toLowerCase().includes(searchLower) ||
          order.riderId?.phone?.includes(searchTerm)
        );
      });
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  if (!showModal) return null;

  const assignedCount = filteredOrders.filter((o) => o.riderId).length;
  const unassignedCount = filteredOrders.length - assignedCount;

  const handleAutoAssign = async () => {
    if (!currentZone || !currentZone.id && !currentZone._id) {
      showError("Zone information not available");
      return;
    }

    if (!currentZone.assignedRiders || currentZone.assignedRiders.length === 0) {
      showWarning("No riders are assigned to this zone. Please assign riders to the zone first.");
      return;
    }

    const unassignedOrders = filteredOrders.filter(order => !order.riderId);
    if (unassignedOrders.length === 0) {
      showInfo("All orders in this zone are already assigned to riders.");
      return;
    }

    const confirmMessage = `Auto-assign ${unassignedOrders.length} unassigned orders to ${currentZone.assignedRiders.length} zone riders?\n\nZone: ${currentZone.name}\nRiders: ${currentZone.assignedRiders.map(r => r.name).join(', ')}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsAutoAssigning(true);
      showInfo("Processing auto-assignment...", 2000);
      
      const response = await axios.post("https://dd-merge-backend-2.onrender.com/api/admin/auto-assign-zone-riders", {
        zoneId: currentZone.id || currentZone._id,
        session: "all"
      });

      if (response.data.assignedCount > 0) {
        const successMessage = `Successfully assigned ${response.data.assignedCount} orders to ${response.data.riderAssignments?.length || 0} riders`;
        showSuccess(successMessage, 4000);
        
        if (onAssignmentComplete) {
          onAssignmentComplete();
        }
      } else {
        const infoMessage = response.data.message || "No orders were assigned";
        showWarning(infoMessage, 4000);
      }
    } catch (error) {
      console.error("Error in auto-assignment:", error);
      const errorMessage = error.response?.data?.message || error.message || "Auto-assignment failed";
      showError(`Auto-assignment failed: ${errorMessage}`, 5000);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  return (
    <div className="zone-modal-overlay" onClick={onClose}>
      <div
        className="zone-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="zone-modal-header">
          <div>
            <h2 style={{ margin: 0 }}>Orders in Zone</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748b", fontWeight: "normal" }}>
              Click any order to view on map
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button 
              className={`btn btn-small ${viewMode === "table" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setViewMode("table")}
              style={{ fontSize: "11px", padding: "4px 8px" }}
            >
              📊 Table
            </button>
            <button 
              className={`btn btn-small ${viewMode === "cards" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setViewMode("cards")}
              style={{ fontSize: "11px", padding: "4px 8px" }}
            >
              🗃️ Cards
            </button>
            {unassignedCount > 0 && currentZone && (currentZone.assignedRiders?.length > 0) && (
              <button 
                className="btn btn-primary btn-small"
                onClick={handleAutoAssign}
                disabled={isAutoAssigning}
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                {isAutoAssigning ? "⏳ Auto-Assigning..." : "🤖 Auto-Assign Zone Riders"}
              </button>
            )}
            <button 
              className="btn btn-success btn-small"
              onClick={() => setShowAssignmentModal(true)}
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              🏍️ Manual Assign
            </button>
            <button className="btn btn-ghost btn-small" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
        <div className="zone-modal-body">
          {/* Zone Information */}
          {currentZone && (
            <div style={{ 
              marginBottom: "20px", 
              padding: "12px", 
              backgroundColor: "#f0f9ff", 
              borderRadius: "8px", 
              border: "1px solid #bae6fd" 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "14px", color: "#1e40af" }}>
                  📍 {currentZone.name}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {currentZone.assignedRiders?.length || 0} riders assigned
                </span>
              </div>
              {currentZone.assignedRiders && currentZone.assignedRiders.length > 0 && (
                <div style={{ fontSize: "12px", color: "#475569" }}>
                  <strong>Zone Riders:</strong> {currentZone.assignedRiders.map(r => r.name).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, Mobile, or Rider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 40px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "16px",
                  color: "#64748b",
                }}
              >
                🔍
              </div>
            </div>
            {searchTerm && (
              <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            )}
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  border: "4px solid #e2e8f0",
                  borderTop: "4px solid #2563eb",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "20px",
                }}
              />
              <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>
                Loading orders...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "40px",
                  marginBottom: "20px",
                }}
              >
                📦
              </div>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "18px",
                  color: "#1e293b",
                  fontWeight: "600",
                }}
              >
                {searchTerm ? "No Matching Orders" : "No Orders Found"}
              </h3>
              <p
                style={{
                  color: "#64748b",
                  margin: 0,
                  fontSize: "14px",
                  maxWidth: "300px",
                }}
              >
                {searchTerm 
                  ? `No orders match "${searchTerm}". Try a different search term.`
                  : "There are no orders in this zone at the moment"
                }
              </p>
            </div>
          ) : (
            <div className="zone-orders-list">
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
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#0284c7",
                    }}
                  >
                    {filteredOrders.length}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    Total
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
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#059669",
                    }}
                  >
                    {assignedCount}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    🏍️ Assigned
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
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#ea580c",
                    }}
                  >
                    {unassignedCount}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    ⏳ Unassigned
                  </div>
                </div>
              </div>

              {/* Orders Display - Table or Cards */}
              {viewMode === "table" ? (
                <>
                  {/* Orders Table */}
                  <div className="zone-orders-table">
                    <div className="table-header">
                      <div className="table-row header-row">
                        <div className="table-cell">#</div>
                        <div className="table-cell">Customer</div>
                        <div className="table-cell">Order ID</div>
                        <div className="table-cell">Type</div>
                        <div className="table-cell">Rider</div>
                        <div className="table-cell">Status</div>
                        <div className="table-cell">Slot</div>
                        <div className="table-cell">Amount</div>
                        <div className="table-cell">Items</div>
                      </div>
                    </div>
                    <div className="table-body">
                      {filteredOrders.map((order, index) => (
                        <div
                          key={order._id}
                          className="table-row order-row"
                          onClick={() => onOrderClick(order, index)}
                          style={{
                            cursor: "pointer",
                            transition: "all 0.2s",
                            backgroundColor: order.riderId ? "#ecfdf5" : "#fff7ed",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f0f9ff";
                            e.currentTarget.style.transform = "translateX(2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = order.riderId ? "#ecfdf5" : "#fff7ed";
                            e.currentTarget.style.transform = "translateX(0)";
                          }}
                        >
                          <div className="table-cell">
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                backgroundColor: addressTypeConfig[order.addressType]?.color || "#007bff",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "14px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              }}
                            >
                              {index + 1}
                            </div>
                          </div>
                          <div className="table-cell">
                            <div style={{ fontWeight: "600", fontSize: "14px", color: "#1e293b", marginBottom: "4px" }}>
                              {order.username}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              📞 {order.Mobilenumber}
                            </div>
                          </div>
                          <div className="table-cell">
                            <span
                              style={{
                                padding: "4px 10px",
                                backgroundColor: "#f1f5f9",
                                color: "#475569",
                                borderRadius: "5px",
                                fontSize: "12px",
                                fontWeight: "600",
                                display: "inline-block",
                              }}
                            >
                              {order.orderid || order.orderId || order._id?.slice(-6)}
                            </span>
                          </div>
                          <div className="table-cell">
                            <span
                              style={{
                                padding: "5px 10px",
                                backgroundColor: addressTypeConfig[order.addressType]?.color || "#007bff",
                                color: "white",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "600",
                                whiteSpace: "nowrap",
                                display: "inline-block",
                              }}
                            >
                              {addressTypeConfig[order.addressType]?.icon} {order.addressType}
                            </span>
                            {order.hubName && (
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "#64748b",
                                  backgroundColor: "#f1f5f9",
                                  padding: "2px 6px",
                                  borderRadius: "3px",
                                  marginTop: "4px",
                                  display: "inline-block",
                                }}
                              >
                                🏢 {order.hubName}
                              </div>
                            )}
                          </div>
                          <div className="table-cell">
                            {order.riderId ? (
                              <div className="table-status-assigned">
                                <div style={{ fontSize: "12px", marginBottom: "2px", fontWeight: "600" }}>
                                  🏍️ {order.riderId.name || "Unknown"}
                                </div>
                                {order.riderId.phone && (
                                  <div style={{ fontSize: "10px", opacity: 0.8 }}>
                                    📞 {order.riderId.phone}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="table-status-unassigned">
                                <div style={{ fontSize: "12px", fontWeight: "600" }}>
                                  ⏳ Unassigned
                                </div>
                                <div style={{ fontSize: "10px", opacity: 0.8 }}>
                                  No rider yet
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="table-cell">
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                backgroundColor:
                                  order.status === "Delivered"
                                    ? "#ecfdf5"
                                    : order.status === "Cooking"
                                    ? "#fef3c7"
                                    : "#f0f9ff",
                                color:
                                  order.status === "Delivered"
                                    ? "#059669"
                                    : order.status === "Cooking"
                                    ? "#d97706"
                                    : "#2563eb",
                              }}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="table-cell">
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                              {order.slot}
                            </span>
                          </div>
                          <div className="table-cell">
                            <span 
                              style={{ 
                                fontSize: "15px", 
                                fontWeight: "700", 
                                color: "#059669",
                                padding: "2px 6px",
                                backgroundColor: "#ecfdf5",
                                borderRadius: "4px",
                              }}
                            >
                              ₹{order.allTotal}
                            </span>
                          </div>
                          <div className="table-cell">
                            <span 
                              style={{ 
                                fontSize: "14px", 
                                fontWeight: "600", 
                                color: "#1e293b",
                                padding: "3px 8px",
                                backgroundColor: "#f8fafc",
                                borderRadius: "4px",
                              }}
                            >
                              {order.allProduct?.length || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Address Details - Show on hover/click */}
                  <div style={{ 
                    marginTop: "16px", 
                    padding: "12px", 
                    backgroundColor: "#fef3c7", 
                    borderRadius: "6px", 
                    border: "1px solid #fde68a",
                    fontSize: "11px",
                    color: "#78350f"
                  }}>
                    <div style={{ fontSize: "9px", color: "#92400e", fontWeight: "600", marginBottom: "4px" }}>
                      💡 TIP: Click any order row to view its location on the map and see full delivery address
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Orders Cards */}
                  {filteredOrders.map((order, index) => (
                    <div
                      key={order._id}
                      className="zone-order-item"
                      style={{
                        padding: "12px",
                        marginBottom: "12px",
                        backgroundColor: "#fff",
                        border: "2px solid #e9ecef",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        position: "relative",
                      }}
                      onClick={() => onOrderClick(order, index)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.borderColor = "#2563eb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "#e9ecef";
                      }}
                    >
                      {/* Order Number Badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-8px",
                          left: "12px",
                          width: "28px",
                          height: "28px",
                          backgroundColor: addressTypeConfig[order.addressType]?.color || "#007bff",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "12px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          border: "2px solid white",
                        }}
                      >
                        {index + 1}
                      </div>

                      {/* Header Section */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "10px",
                          paddingTop: "6px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <h4 style={{ margin: "0", fontSize: "14px", color: "#1e293b" }}>
                              {order.username}
                            </h4>
                            <span
                              style={{
                                padding: "2px 6px",
                                backgroundColor: "#f1f5f9",
                                color: "#475569",
                                borderRadius: "3px",
                                fontSize: "10px",
                                fontWeight: "600",
                              }}
                            >
                              ID: {order.orderid || order.orderId || order._id?.slice(-6)}
                            </span>
                          </div>
                          <p style={{ margin: "0", fontSize: "12px", color: "#64748b" }}>
                            📞 {order.Mobilenumber}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                          <span
                            style={{
                              padding: "4px 8px",
                              backgroundColor: addressTypeConfig[order.addressType]?.color || "#007bff",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: "600",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {addressTypeConfig[order.addressType]?.icon} {order.addressType}
                          </span>
                          {order.hubName && (
                            <span
                              style={{
                                fontSize: "9px",
                                color: "#64748b",
                                backgroundColor: "#f1f5f9",
                                padding: "2px 6px",
                                borderRadius: "3px",
                              }}
                            >
                              🏢 {order.hubName}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Rider Information */}
                      {order.riderId ? (
                        <div
                          style={{
                            padding: "8px 10px",
                            backgroundColor: "#ecfdf5",
                            borderRadius: "6px",
                            border: "1px solid #a7f3d0",
                            marginBottom: "8px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                backgroundColor: "#059669",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                flexShrink: 0,
                              }}
                            >
                              🏍️
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "9px", color: "#059669", fontWeight: "600", marginBottom: "1px" }}>
                                ASSIGNED RIDER
                              </div>
                              <div style={{ fontSize: "12px", fontWeight: "600", color: "#064e3b" }}>
                                {order.riderId.name || "Unknown Rider"}
                              </div>
                              {order.riderId.phone && (
                                <div style={{ fontSize: "10px", color: "#047857", marginTop: "1px" }}>
                                  📞 {order.riderId.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "8px 10px",
                            backgroundColor: "#fff7ed",
                            borderRadius: "6px",
                            border: "1px solid #fed7aa",
                            marginBottom: "8px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                backgroundColor: "#ea580c",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                flexShrink: 0,
                              }}
                            >
                              ⏳
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "9px", color: "#ea580c", fontWeight: "600", marginBottom: "1px" }}>
                                UNASSIGNED ORDER
                              </div>
                              <div style={{ fontSize: "12px", fontWeight: "600", color: "#9a3412" }}>
                                No rider assigned yet
                              </div>
                              <div style={{ fontSize: "10px", color: "#c2410c", marginTop: "1px" }}>
                                Awaiting assignment
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Order Details Grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "8px",
                          padding: "8px",
                          backgroundColor: "#f8fafc",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                          marginBottom: "8px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "9px", color: "#64748b", marginBottom: "2px" }}>
                            Status
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              color:
                                order.status === "Delivered"
                                  ? "#059669"
                                  : order.status === "Cooking"
                                  ? "#d97706"
                                  : "#2563eb",
                            }}
                          >
                            {order.status}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "9px", color: "#64748b", marginBottom: "2px" }}>
                            Time Slot
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#1e293b" }}>
                            {order.slot}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "9px", color: "#64748b", marginBottom: "2px" }}>
                            Amount
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#059669" }}>
                            ₹{order.allTotal}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "9px", color: "#64748b", marginBottom: "2px" }}>
                            Items
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#1e293b" }}>
                            {order.allProduct?.length || 0} items
                          </div>
                        </div>
                      </div>
                      
                      {/* Address */}
                      <div
                        style={{
                          padding: "8px",
                          backgroundColor: "#fef3c7",
                          borderRadius: "6px",
                          border: "1px solid #fde68a",
                        }}
                      >
                        <div style={{ fontSize: "9px", color: "#92400e", fontWeight: "600", marginBottom: "2px" }}>
                          📍 DELIVERY ADDRESS
                        </div>
                        <div style={{ fontSize: "11px", color: "#78350f", lineHeight: "1.4" }}>
                          {order.delivarylocation}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          
          {/* Summary Footer */}
          {filteredOrders.length > 0 && (
            <div style={{ 
              marginTop: "20px", 
              padding: "16px", 
              backgroundColor: "#f8fafc", 
              borderRadius: "8px", 
              border: "1px solid #e2e8f0",
              borderTop: "3px solid #2563eb"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px", fontSize: "12px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold", color: "#2563eb", fontSize: "16px" }}>{filteredOrders.length}</div>
                  <div style={{ color: "#64748b" }}>Total Orders</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold", color: "#059669", fontSize: "16px" }}>{assignedCount}</div>
                  <div style={{ color: "#64748b" }}>Assigned</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold", color: "#ea580c", fontSize: "16px" }}>{unassignedCount}</div>
                  <div style={{ color: "#64748b" }}>Unassigned</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold", color: "#7c3aed", fontSize: "16px" }}>
                    ₹{filteredOrders.reduce((sum, order) => sum + (parseFloat(order.allTotal) || 0), 0).toFixed(0)}
                  </div>
                  <div style={{ color: "#64748b" }}>Total Value</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Assignment Modal */}
      <SessionAssignmentModal
        showModal={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        orders={filteredOrders}
        onAssignmentComplete={() => {
          setShowAssignmentModal(false);
          showSuccess("Rider assignment completed successfully!");
          if (onAssignmentComplete) {
            onAssignmentComplete();
          }
        }}
      />
      
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

export default ZoneOrdersModal;
