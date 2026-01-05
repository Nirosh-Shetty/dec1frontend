const ZoneOrdersModal = ({
  showModal,
  onClose,
  loading,
  orders,
  addressTypeConfig,
  onOrderClick,
}) => {
  if (!showModal) return null;

  const assignedCount = orders.filter((o) => o.riderId).length;
  const unassignedCount = orders.length - assignedCount;

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
          <button className="btn btn-ghost btn-small" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="zone-modal-body">
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
          ) : orders.length === 0 ? (
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
                No Orders Found
              </h3>
              <p
                style={{
                  color: "#64748b",
                  margin: 0,
                  fontSize: "14px",
                  maxWidth: "300px",
                }}
              >
                There are no orders in this zone at the moment
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
                    {orders.length}
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

              {/* Orders List */}
              {orders.map((order, index) => (
                <div
                  key={order._id}
                  className="zone-order-item"
                  style={{
                    padding: "18px",
                    marginBottom: "16px",
                    backgroundColor: "#fff",
                    border: "2px solid #e9ecef",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                  onClick={() => onOrderClick(order, index)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
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
                      top: "-10px",
                      left: "16px",
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
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      border: "3px solid white",
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
                      marginBottom: "14px",
                      paddingTop: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#1e293b" }}>
                        {order.username}
                      </h4>
                      <p style={{ margin: "0", fontSize: "13px", color: "#64748b" }}>
                        📞 {order.Mobilenumber}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                      <span
                        style={{
                          padding: "6px 12px",
                          backgroundColor: addressTypeConfig[order.addressType]?.color || "#007bff",
                          color: "white",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {addressTypeConfig[order.addressType]?.icon} {order.addressType}
                      </span>
                      {order.hubName && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            backgroundColor: "#f1f5f9",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          🏢 {order.hubName}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Order Details Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "12px",
                      padding: "14px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                        Status
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
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
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                        Time Slot
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                        {order.slot}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                        Amount
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#059669" }}>
                        ₹{order.allTotal}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                        Items
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                        {order.allProduct?.length || 0} items
                      </div>
                    </div>
                  </div>
                  
                  {/* Rider Information */}
                  {order.riderId && (
                    <div
                      style={{
                        padding: "12px 14px",
                        backgroundColor: "#ecfdf5",
                        borderRadius: "8px",
                        border: "1px solid #a7f3d0",
                        marginBottom: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            backgroundColor: "#059669",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            flexShrink: 0,
                          }}
                        >
                          🏍️
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "11px", color: "#059669", fontWeight: "600", marginBottom: "2px" }}>
                            ASSIGNED RIDER
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "#064e3b" }}>
                            {order.riderId.name || "Unknown Rider"}
                          </div>
                          {order.riderId.phone && (
                            <div style={{ fontSize: "12px", color: "#047857", marginTop: "2px" }}>
                              📞 {order.riderId.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Address */}
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#fef3c7",
                      borderRadius: "8px",
                      border: "1px solid #fde68a",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#92400e", fontWeight: "600", marginBottom: "4px" }}>
                      📍 DELIVERY ADDRESS
                    </div>
                    <div style={{ fontSize: "13px", color: "#78350f", lineHeight: "1.5" }}>
                      {order.delivarylocation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneOrdersModal;
