import { useState, useEffect } from "react";
import axios from "axios";
import NotificationToast from "./NotificationToast";
import { useNotification } from "../../hooks/useNotification";
import "../../Styles/OrderTracking.css";
import { 
  FaSearch, 
  FaSync, 
  FaPause, 
  FaPlay, 
  FaEye, 
  FaMotorcycle, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock, 
  FaRupeeSign,
  FaShoppingBag,
  FaCalendarAlt,
  FaArrowLeft,
  FaArrowRight,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaSpinner,
  FaTruck,
  FaClipboardCheck,
  FaFileExcel,
  FaDownload
} from "react-icons/fa";
import { 
  MdDashboard, 
  MdFilterList,
  MdAssignment,
  MdRestaurant,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdLocalShipping
} from "react-icons/md";

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveryDateFilter, setDeliveryDateFilter] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [riderFilter, setRiderFilter] = useState("all");
  const [riders, setRiders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(20);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [exporting, setExporting] = useState(false);

  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotification();

  // Status options for filtering with icons
  const statusOptions = [
    { value: "all", label: "All Orders", color: "#6b7280", icon: <MdDashboard /> },
    { value: "Pending", label: "Pending", color: "#f59e0b", icon: <MdPending /> },
    { value: "Confirmed", label: "Confirmed", color: "#3b82f6", icon: <MdAssignment /> },
    { value: "Cooking", label: "Cooking", color: "#f97316", icon: <MdRestaurant /> },
    { value: "Ready", label: "Ready", color: "#8b5cf6", icon: <FaClipboardCheck /> },
    { value: "Out for Delivery", label: "Out for Delivery", color: "#06b6d4", icon: <MdLocalShipping /> },
    { value: "Delivered", label: "Delivered", color: "#10b981", icon: <MdCheckCircle /> },
    { value: "Cancelled", label: "Cancelled", color: "#ef4444", icon: <MdCancel /> },
  ];

  // Rider status options
  const riderStatusOptions = [
    { value: "available", label: "Available", color: "#10b981", icon: <FaCheckCircle /> },
    { value: "busy", label: "Busy", color: "#f59e0b", icon: <FaSpinner /> },
    { value: "offline", label: "Offline", color: "#6b7280", icon: <FaTimesCircle /> },
    { value: "on_delivery", label: "On Delivery", color: "#06b6d4", icon: <FaTruck /> },
  ];

  // Date filter options - removed, only keeping delivery date filter
  const deliveryDateOptions = [
    { value: "today", label: "Today's Delivery" },
    { value: "tomorrow", label: "Tomorrow's Delivery" },
    { value: "week", label: "This Week's Delivery" },
    { value: "all", label: "All Delivery Dates" },
  ];

  // Fetch riders for filter dropdown
  const fetchRiders = async () => {
    try {
      const response = await axios.get("https://api.dailydish.in/api/admin/riders");
      console.log("Riders API response:", response.data);
      if (response.data && response.data.riders) {
        setRiders(response.data.riders);
        console.log("Riders set:", response.data.riders);
      }
    } catch (error) {
      console.error("Error fetching riders:", error);
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        deliveryDateFilter: deliveryDateFilter,
        startDate: startDate,
        endDate: endDate,
        riderId: riderFilter,
        sortBy: sortBy,
        sortOrder: sortOrder,
        page: currentPage.toString(),
        limit: ordersPerPage.toString()
      });
      
      console.log("Fetching orders with params:", Object.fromEntries(params));
      
      const response = await axios.get(`https://api.dailydish.in/api/admin/all-orders?${params}`);
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders);
        
        // Update pagination info if available
        if (response.data.pagination) {
          console.log('Pagination info:', response.data.pagination);
        }
        
        showInfo(`Loaded ${response.data.orders.length} orders`, 2000);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showError("Failed to fetch orders. Please try again.", 4000);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      setExporting(true);
      showInfo("Preparing Excel export...", 3000);
      
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        deliveryDateFilter: deliveryDateFilter,
        startDate: startDate,
        endDate: endDate,
        riderId: riderFilter,
        sortBy: sortBy,
        sortOrder: sortOrder,
        export: "true"
      });
      
      const response = await axios.get(`https://api.dailydish.in/api/admin/export-orders?${params}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      link.setAttribute('download', `Order_Tracking_Export_${dateStr}_${timeStr}.xlsx`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccess("Excel file downloaded successfully!", 3000);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showError("Failed to export Excel file. Please try again.", 4000);
    } finally {
      setExporting(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    fetchRiders(); // Fetch riders on component mount
    fetchOrders();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchOrders();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, searchTerm, statusFilter, deliveryDateFilter, startDate, endDate, riderFilter, sortBy, sortOrder, currentPage]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`https://api.dailydish.in/api/admin/update-order-status/${orderId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        showSuccess(`Order status updated to ${newStatus}`, 3000);
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showError("Failed to update order status", 4000);
    }
  };

  // Pagination - now handled by server
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders; // Use all filtered orders since pagination is server-side
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage); // This will be updated when we get pagination info from server

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-IN"),
      time: date.toLocaleTimeString("en-IN", { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Get rider status display
  const getRiderStatusDisplay = (status) => {
    const riderStatus = riderStatusOptions.find(option => option.value === status) || riderStatusOptions[0];
    return (
      <div className="rider-status-badge" style={{ backgroundColor: riderStatus.color }}>
        {riderStatus.icon}
        <span>{riderStatus.label}</span>
      </div>
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : "#6b7280";
  };

  return (
    <div className="order-tracking-container">
      <div className="order-tracking-header">
        <div className="header-title">
          <h2><MdDashboard /> Order Tracking Dashboard</h2>
          <p>Monitor all orders with real-time status updates and rider information</p>
        </div>
        <div className="header-actions">
          <button 
            className={`refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <><FaPause /> Auto-Refresh ON</> : <><FaPlay /> Auto-Refresh OFF</>}
          </button>
          <button className="manual-refresh-btn" onClick={fetchOrders}>
            <FaSync /> Refresh Now
          </button>
          <button 
            className="export-btn" 
            onClick={exportToExcel}
            disabled={exporting}
          >
            {exporting ? <><FaSpinner className="spinning" /> Exporting...</> : <><FaFileExcel /> Export Excel</>}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="search-filter">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer, Phone, Rider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="status-filter">
            <FaFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="delivery-date-filter">
            <FaTruck className="filter-icon" />
            <select
              value={deliveryDateFilter}
              onChange={(e) => setDeliveryDateFilter(e.target.value)}
              className="filter-select"
            >
              {deliveryDateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rider-filter">
            <FaMotorcycle className="filter-icon" />
            <select
              value={riderFilter}
              onChange={(e) => setRiderFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Riders</option>
              {riders.map(rider => (
                <option key={rider._id} value={rider._id}>
                  {rider.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range Row */}
        <div className="date-range-row">
          <div className="date-range-filter">
            <label className="date-label">
              <FaCalendarAlt /> Start Date:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          
          <div className="date-range-filter">
            <label className="date-label">
              <FaCalendarAlt /> End Date:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="sort-controls">
            <FaSort className="sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Order Date</option>
              <option value="deliveryDate">Delivery Date</option>
              <option value="status">Status</option>
              <option value="username">Customer</option>
              <option value="allTotal">Amount</option>
            </select>
            <button
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            >
              {sortOrder === "desc" ? <FaSortDown /> : <FaSortUp />}
            </button>
          </div>
        </div>

        <div className="stats-row">
          <div className="stats-line">
            <span className="stat-item">
              <FaShoppingBag /> <strong>{filteredOrders.length}</strong> Total Orders
            </span>
            {statusOptions.slice(1).map(status => {
              const count = filteredOrders.filter(order => order.status === status.value).length;
              return (
                <span key={status.value} className="stat-item" style={{ color: status.color }}>
                  {status.icon} <strong>{count}</strong> {status.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : (
          <>
            <div className="orders-table">
              <div className="table-header">
                <div className="table-row header-row">
                  <div className="table-cell"><FaShoppingBag /> Order ID</div>
                  <div className="table-cell"><FaUser /> Customer</div>
                  <div className="table-cell"><MdAssignment /> Status</div>
                  <div className="table-cell"><FaMotorcycle /> Rider</div>
                  <div className="table-cell"><FaRupeeSign /> Amount</div>
                  <div className="table-cell"><FaTruck /> Delivery Date</div>
                  <div className="table-cell"><FaCalendarAlt /> Order Date</div>
                  <div className="table-cell"><FaClock /> Last Updated</div>
                  <div className="table-cell"><MdFilterList /> Actions</div>
                </div>
              </div>
              
              <div className="table-body">
                {currentOrders.map((order) => {
                  const orderDateTime = formatDateTime(order.createdAt);
                  const updateDateTime = formatDateTime(order.updatedAt);
                  const deliveryDateTime = formatDateTime(order.deliveryDate);
                  
                  return (
                    <div key={order._id} className="table-row order-row">
                      <div className="table-cell">
                        <div className="order-id">
                          <strong>{order.orderid || order.orderId || order._id?.slice(-8)}</strong>
                          <div className="order-type">
                            {order.addressType}
                          </div>
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <div className="customer-info">
                          <strong><FaUser /> {order.username}</strong>
                          <div className="customer-phone"><FaPhone /> {order.Mobilenumber}</div>
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="status-select"
                          style={{ 
                            backgroundColor: getStatusColor(order.status),
                            color: 'white'
                          }}
                        >
                          {statusOptions.slice(1).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="table-cell">
                        {order.riderId ? (
                          <div className="rider-info">
                            <div className="rider-main">
                              <strong><FaMotorcycle /> {order.riderId.name}</strong>
                              <div className="rider-phone"><FaPhone /> {order.riderId.phone}</div>
                            </div>
                            <div className="rider-status">
                              {getRiderStatusDisplay(order.riderId.status || 'available')}
                            </div>
                          </div>
                        ) : (
                          <div className="no-rider">
                            <span><FaExclamationCircle /> Unassigned</span>
                            <div className="assign-rider-hint">Click to assign rider</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="table-cell">
                        <div className="amount">
                          <strong><FaRupeeSign />{order.allTotal}</strong>
                          <div className="items-count"><FaShoppingBag /> {order.allProduct?.length || 0} items</div>
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <div className="date-time">
                          <div className="date"><FaTruck /> {deliveryDateTime.date || 'Today'}</div>
                          <div className="time">{order.slot || 'No slot'}</div>
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <div className="date-time">
                          <div className="date"><FaCalendarAlt /> {orderDateTime.date}</div>
                          <div className="time"><FaClock /> {orderDateTime.time}</div>
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <div className="date-time">
                          <div className="date">{updateDateTime.date}</div>
                          <div className="time">{updateDateTime.time}</div>
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <div className="action-buttons">
                          <button 
                            className="view-btn"
                            onClick={() => showInfo(`Order Details: ${order.delivarylocation}`, 5000)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="location-btn"
                            onClick={() => showInfo(`Location: ${order.delivarylocation}`, 5000)}
                            title="View Location"
                          >
                            <FaMapMarkerAlt />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            <div className="pagination-container">
              <div className="pagination-info">
                <FaShoppingBag /> Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <FaArrowLeft /> Previous
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum <= totalPages) {
                      return (
                        <button
                          key={pageNum}
                          className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <FaArrowRight />
                </button>
              </div>
            </div>
          </>
        )}
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

export default OrderTracking;