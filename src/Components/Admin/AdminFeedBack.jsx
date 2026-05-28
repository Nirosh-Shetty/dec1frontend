import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaStar,
  FaStarHalfAlt,
  FaComments,
  FaEdit,
  FaSearch,
  FaFileExcel,
  FaFilter,
  FaCalendarAlt,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { Badge } from "react-bootstrap";

const AdminFeedBack = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [commentFilter, setCommentFilter] = useState("all");
  const [hubFilter, setHubFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  const customStyles = {
    primaryColor: "#6b8e23",
    primaryLight: "#8fbc8f",
    primaryDark: "#556b2f",
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, ratingFilter, commentFilter, hubFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:7013/api/admin/feedback-orders",
      );

      if (response.data.success) {
        setOrders(response.data.order || []);
      } else {
        setOrders([]);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch orders");
      setLoading(false);
      console.error("Error fetching orders:", err);
    }
  };

  // Get unique hub names for the filter dropdown
  const getUniqueHubNames = () => {
    const hubNames = orders
      .map((order) => order.hubName)
      .filter(
        (hubName, index, self) => hubName && self.indexOf(hubName) === index,
      )
      .sort((a, b) => a?.localeCompare(b));

    return hubNames;
  };

  const applyFilters = () => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.username?.toLowerCase().includes(lowerTerm) ||
          order.orderid?.toLowerCase().includes(lowerTerm) ||
          order.Mobilenumber?.toString().includes(lowerTerm) ||
          order.hubName?.toLowerCase().includes(lowerTerm) ||
          order.ratings?.order?.comment?.toLowerCase().includes(lowerTerm) ||
          order.ratings?.delivery?.comment?.toLowerCase().includes(lowerTerm),
      );
    }

    // Hub filter
    if (hubFilter !== "all") {
      filtered = filtered.filter((order) => order.hubName === hubFilter);
    }

    // Rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter((order) => {
        const orderRating = order.ratings?.order?.rating || 0;
        const deliveryRating = order.ratings?.delivery?.rating || 0;

        switch (ratingFilter) {
          case "4+":
            return orderRating >= 4 || deliveryRating >= 4;
          case "3":
            return orderRating === 3 || deliveryRating === 3;
          case "1-2":
            return (
              (orderRating > 0 && orderRating <= 2) ||
              (deliveryRating > 0 && deliveryRating <= 2)
            );
          case "order-only":
            return (
              order.ratings?.order?.rating && !order.ratings?.delivery?.rating
            );
          case "delivery-only":
            return (
              !order.ratings?.order?.rating && order.ratings?.delivery?.rating
            );
          default:
            return true;
        }
      });
    }

    // Comment filter
    if (commentFilter !== "all") {
      filtered = filtered.filter((order) => {
        const hasOrderComment = order.ratings?.order?.comment;
        const hasDeliveryComment = order.ratings?.delivery?.comment;

        switch (commentFilter) {
          case "with-comments":
            return hasOrderComment || hasDeliveryComment;
          case "order-comments":
            return hasOrderComment;
          case "delivery-comments":
            return hasDeliveryComment;
          case "no-comments":
            return !hasOrderComment && !hasDeliveryComment;
          default:
            return true;
        }
      });
    }

    // Date filter
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);

        if (dateFilter.startDate && dateFilter.endDate) {
          const startDate = new Date(dateFilter.startDate);
          const endDate = new Date(dateFilter.endDate);
          // Set end date to end of day
          endDate.setHours(23, 59, 59, 999);
          return orderDate >= startDate && orderDate <= endDate;
        } else if (dateFilter.startDate) {
          const startDate = new Date(dateFilter.startDate);
          return orderDate >= startDate;
        } else if (dateFilter.endDate) {
          const endDate = new Date(dateFilter.endDate);
          endDate.setHours(23, 59, 59, 999);
          return orderDate <= endDate;
        }
        return true;
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  // Export to Excel function
  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredOrders.map((order) => ({
      "Order ID": order.orderid || "",
      "Customer Name": order.username || "",
      "Hub Name": order.hubName || "",
      "Mobile Number": order.Mobilenumber || "",
      "Food Rating":
        order.ratings?.order?.rating ||
        (order.ratings?.order?.status === "skipped" ? "Skipped" : "Not Rated"),
      "Food Comment": order.ratings?.order?.comment || "",
      "Delivery Rating":
        order.ratings?.delivery?.rating ||
        (order.ratings?.delivery?.status === "skipped"
          ? "Skipped"
          : "Not Rated"),
      "Delivery Comment": order.ratings?.delivery?.comment || "",
      Date: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : "",
      Time: order.createdAt
        ? new Date(order.createdAt).toLocaleTimeString()
        : "",
      "Total Rating":
        ((order.ratings?.order?.rating || 0) +
          (order.ratings?.delivery?.rating || 0)) /
        2,
      "Has Food Comment": order.ratings?.order?.comment ? "Yes" : "No",
      "Has Delivery Comment": order.ratings?.delivery?.comment ? "Yes" : "No",
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback Data");

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Order ID
      { wch: 20 }, // Customer Name
      { wch: 20 }, // Hub Name
      { wch: 15 }, // Mobile Number
      { wch: 12 }, // Food Rating
      { wch: 40 }, // Food Comment
      { wch: 15 }, // Delivery Rating
      { wch: 40 }, // Delivery Comment
      { wch: 12 }, // Date
      { wch: 12 }, // Time
      { wch: 12 }, // Total Rating
      { wch: 15 }, // Has Food Comment
      { wch: 15 }, // Has Delivery Comment
    ];
    worksheet["!cols"] = colWidths;

    // Generate Excel file name with filter information
    const hubFilterText =
      hubFilter !== "all" ? `_${hubFilter.replace(/\s+/g, "_")}` : "";
    const ratingFilterText = ratingFilter !== "all" ? `_${ratingFilter}` : "";
    const commentFilterText =
      commentFilter !== "all" ? `_${commentFilter}` : "";
    const dateFilterText =
      dateFilter.startDate || dateFilter.endDate
        ? `_${
            dateFilter.startDate
              ? dateFilter.startDate.replace(/-/g, "")
              : "start"
          }-${
            dateFilter.endDate ? dateFilter.endDate.replace(/-/g, "") : "end"
          }`
        : "";

    XLSX.writeFile(
      workbook,
      `Customer_Feedback${hubFilterText}${ratingFilterText}${commentFilterText}${dateFilterText}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`,
    );
  };

  // Export filtered data to Excel
  const exportFilteredToExcel = () => {
    exportToExcel();
  };

  // Export all data to Excel
  const exportAllToExcel = () => {
    // Temporarily set filteredOrders to all orders for export
    const originalFilteredOrders = [...filteredOrders];
    const allData = [...orders];
    setFilteredOrders(allData);

    // Use setTimeout to ensure state update before export
    setTimeout(() => {
      exportToExcel();
      // Restore filtered orders
      setFilteredOrders(originalFilteredOrders);
    }, 100);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setRatingFilter("all");
    setCommentFilter("all");
    setHubFilter("all");
    setDateFilter({
      startDate: "",
      endDate: "",
    });
  };

  // Quick date filters
  const applyQuickDateFilter = (range) => {
    const today = new Date();
    const startDate = new Date();

    switch (range) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        setDateFilter({
          startDate: startDate.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });
        break;
      case "yesterday":
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        setDateFilter({
          startDate: startDate.toISOString().split("T")[0],
          endDate: yesterday.toISOString().split("T")[0],
        });
        break;
      case "last7days":
        startDate.setDate(today.getDate() - 7);
        setDateFilter({
          startDate: startDate.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });
        break;
      case "last30days":
        startDate.setDate(today.getDate() - 30);
        setDateFilter({
          startDate: startDate.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });
        break;
      case "thismonth":
        startDate.setDate(1);
        setDateFilter({
          startDate: startDate.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });
        break;
      default:
        setDateFilter({ startDate: "", endDate: "" });
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- Statistics Calculation ---
  const totalOrdersWithFeedback = orders.length;

  const ordersWithComments = orders.filter(
    (order) =>
      order.ratings?.order?.comment || order.ratings?.delivery?.comment,
  ).length;

  const ordersWithHighRating = orders.filter(
    (order) =>
      order.ratings?.order?.rating >= 4 || order.ratings?.delivery?.rating >= 4,
  ).length;

  const ordersWithLowRating = orders.filter(
    (order) =>
      (order.ratings?.order?.rating > 0 && order.ratings?.order?.rating <= 2) ||
      (order.ratings?.delivery?.rating > 0 &&
        order.ratings?.delivery?.rating <= 2),
  ).length;

  // Hub-specific statistics
  const hubWiseStats = () => {
    const stats = {};
    orders.forEach((order) => {
      const hub = order.hubName || "Unknown";
      if (!stats[hub]) {
        stats[hub] = {
          count: 0,
          withComments: 0,
          highRating: 0,
          lowRating: 0,
        };
      }
      stats[hub].count++;

      if (order.ratings?.order?.comment || order.ratings?.delivery?.comment) {
        stats[hub].withComments++;
      }

      if (
        order.ratings?.order?.rating >= 4 ||
        order.ratings?.delivery?.rating >= 4
      ) {
        stats[hub].highRating++;
      }

      if (
        (order.ratings?.order?.rating > 0 &&
          order.ratings?.order?.rating <= 2) ||
        (order.ratings?.delivery?.rating > 0 &&
          order.ratings?.delivery?.rating <= 2)
      ) {
        stats[hub].lowRating++;
      }
    });

    return Object.entries(stats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5); // Show top 5 hubs
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          color={i <= rating ? "#ffc107" : "#e4e5e9"}
          style={{ marginRight: "2px" }}
        />,
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div
          className="spinner-border"
          style={{ color: customStyles.primaryColor }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger text-center m-4">{error}</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            {/* Header */}
            <div
              className="card-header text-white d-flex justify-content-between align-items-center"
              style={{ backgroundColor: customStyles.primaryColor }}
            >
              <div>
                <h4 className="mb-0">
                  <FaComments className="me-2" />
                  Customer Feedback Dashboard
                  <span className="badge bg-light text-dark ms-2">
                    {filteredOrders.length} Orders
                  </span>
                  {hubFilter !== "all" && (
                    <span className="badge bg-info ms-2">Hub: {hubFilter}</span>
                  )}
                </h4>
              </div>

              {/* Export Buttons */}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-light btn-sm d-flex align-items-center"
                  onClick={clearAllFilters}
                  title="Clear all filters"
                >
                  <FaFilter className="me-2" />
                  Clear Filters
                </button>
                <button
                  className="btn btn-success btn-sm d-flex align-items-center"
                  onClick={exportFilteredToExcel}
                  disabled={filteredOrders.length === 0}
                  title="Export filtered data to Excel"
                >
                  <FaFileExcel className="me-2" />
                  Export Filtered ({filteredOrders.length})
                </button>
                <button
                  className="btn btn-outline-light btn-sm d-flex align-items-center"
                  onClick={exportAllToExcel}
                  disabled={orders.length === 0}
                  title="Export all data to Excel"
                >
                  <FaFileExcel className="me-2" />
                  Export All ({orders.length})
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Statistics Cards */}
              <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-3">
                  <div
                    className="card text-white"
                    style={{ backgroundColor: customStyles.primaryColor }}
                  >
                    <div className="card-body d-flex justify-content-between">
                      <div>
                        <h4 className="mb-0">{totalOrdersWithFeedback}</h4>
                        <small>Total Feedback</small>
                      </div>
                      <FaComments size={24} className="opacity-75" />
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-3">
                  <div
                    className="card text-white"
                    style={{ backgroundColor: customStyles.primaryLight }}
                  >
                    <div className="card-body d-flex justify-content-between">
                      <div>
                        <h4 className="mb-0">{ordersWithComments}</h4>
                        <small>With Comments</small>
                      </div>
                      <FaEdit size={24} className="opacity-75" />
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-3">
                  <div className="card text-white bg-success">
                    <div className="card-body d-flex justify-content-between">
                      <div>
                        <h4 className="mb-0">{ordersWithHighRating}</h4>
                        <small>High Ratings (4+)</small>
                      </div>
                      <FaStar size={24} className="opacity-75" />
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-3">
                  <div className="card text-white bg-danger">
                    <div className="card-body d-flex justify-content-between">
                      <div>
                        <h4 className="mb-0">{ordersWithLowRating}</h4>
                        <small>Low Ratings (1-2)</small>
                      </div>
                      <FaStarHalfAlt size={24} className="opacity-75" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hub-wise Quick Stats */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <FaFilter className="me-2" />
                        Hub-wise Statistics (Top 5)
                      </h6>
                    </div>
                    <div className="card-body p-2">
                      <div className="d-flex flex-wrap gap-2">
                        {hubWiseStats().map(([hubName, stats]) => (
                          <div
                            key={hubName}
                            className={`badge p-2 d-flex align-items-center ${
                              hubFilter === hubName
                                ? "bg-primary"
                                : "bg-secondary"
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setHubFilter(
                                hubFilter === hubName ? "all" : hubName,
                              )
                            }
                            title={`Click to filter by ${hubName}`}
                          >
                            <span className="fw-bold">{hubName}</span>
                            <span className="ms-2">{stats.count}</span>
                          </div>
                        ))}
                        {getUniqueHubNames().length > 5 && (
                          <span className="badge bg-light text-dark p-2">
                            +{getUniqueHubNames().length - 5} more hubs
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Date Filters */}
              <div className="row mb-3">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header bg-light py-2">
                      <h6 className="mb-0">
                        <FaCalendarAlt className="me-2" />
                        Quick Date Filters
                      </h6>
                    </div>
                    <div className="card-body p-2">
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className={`btn btn-sm ${
                            dateFilter.startDate ===
                              new Date().toISOString().split("T")[0] &&
                            dateFilter.endDate ===
                              new Date().toISOString().split("T")[0]
                              ? "btn-primary"
                              : "btn-outline-primary"
                          }`}
                          onClick={() => applyQuickDateFilter("today")}
                        >
                          Today
                        </button>
                        <button
                          className={`btn btn-sm ${
                            dateFilter.startDate ===
                            new Date(
                              new Date().setDate(new Date().getDate() - 1),
                            )
                              .toISOString()
                              .split("T")[0]
                              ? "btn-primary"
                              : "btn-outline-primary"
                          }`}
                          onClick={() => applyQuickDateFilter("yesterday")}
                        >
                          Yesterday
                        </button>
                        <button
                          className={`btn btn-sm ${
                            dateFilter.startDate ===
                            new Date(
                              new Date().setDate(new Date().getDate() - 7),
                            )
                              .toISOString()
                              .split("T")[0]
                              ? "btn-primary"
                              : "btn-outline-primary"
                          }`}
                          onClick={() => applyQuickDateFilter("last7days")}
                        >
                          Last 7 Days
                        </button>
                        <button
                          className={`btn btn-sm ${
                            dateFilter.startDate ===
                            new Date(
                              new Date().setDate(new Date().getDate() - 30),
                            )
                              .toISOString()
                              .split("T")[0]
                              ? "btn-primary"
                              : "btn-outline-primary"
                          }`}
                          onClick={() => applyQuickDateFilter("last30days")}
                        >
                          Last 30 Days
                        </button>
                        <button
                          className={`btn btn-sm ${
                            dateFilter.startDate ===
                            new Date(
                              new Date().getFullYear(),
                              new Date().getMonth(),
                              1,
                            )
                              .toISOString()
                              .split("T")[0]
                              ? "btn-primary"
                              : "btn-outline-primary"
                          }`}
                          onClick={() => applyQuickDateFilter("thismonth")}
                        >
                          This Month
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            setDateFilter({ startDate: "", endDate: "" })
                          }
                        >
                          Clear Dates
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="row mb-4">
                <div className="col-lg-2 col-md-6 mb-2">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-lg-2 col-md-6 mb-2">
                  <select
                    className="form-select"
                    value={hubFilter}
                    onChange={(e) => setHubFilter(e.target.value)}
                  >
                    <option value="all">All Hubs</option>
                    {getUniqueHubNames().map((hubName) => (
                      <option key={hubName} value={hubName}>
                        {hubName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-2 col-md-6 mb-2">
                  <select
                    className="form-select"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                  >
                    <option value="all">All Ratings</option>
                    <option value="4+">High (4-5 Stars)</option>
                    <option value="3">Average (3 Stars)</option>
                    <option value="1-2">Low (1-2 Stars)</option>
                  </select>
                </div>
                <div className="col-lg-2 col-md-6 mb-2">
                  <select
                    className="form-select"
                    value={commentFilter}
                    onChange={(e) => setCommentFilter(e.target.value)}
                  >
                    <option value="all">All Comments</option>
                    <option value="with-comments">Has Comments</option>
                    <option value="no-comments">No Comments</option>
                  </select>
                </div>
                <div className="col-lg-2 col-md-6 mb-2">
                  <input
                    type="date"
                    className="form-control"
                    value={dateFilter.startDate}
                    onChange={(e) =>
                      setDateFilter({
                        ...dateFilter,
                        startDate: e.target.value,
                      })
                    }
                    max={
                      dateFilter.endDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    placeholder="From Date"
                  />
                </div>
                <div className="col-lg-2 col-md-6 mb-2">
                  <input
                    type="date"
                    className="form-control"
                    value={dateFilter.endDate}
                    onChange={(e) =>
                      setDateFilter({
                        ...dateFilter,
                        endDate: e.target.value,
                      })
                    }
                    min={dateFilter.startDate}
                    max={new Date().toISOString().split("T")[0]}
                    placeholder="To Date"
                  />
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchTerm ||
                hubFilter !== "all" ||
                ratingFilter !== "all" ||
                commentFilter !== "all" ||
                dateFilter.startDate ||
                dateFilter.endDate) && (
                <div className="row mb-3">
                  <div className="col-12">
                    <div className="alert alert-info py-2">
                      <small className="d-flex align-items-center">
                        <FaFilter className="me-2" />
                        Active Filters:
                        {searchTerm && (
                          <span className="badge bg-secondary ms-2">
                            Search: "{searchTerm}"
                          </span>
                        )}
                        {hubFilter !== "all" && (
                          <span className="badge bg-primary ms-2">
                            Hub: {hubFilter}
                          </span>
                        )}
                        {ratingFilter !== "all" && (
                          <span className="badge bg-warning text-dark ms-2">
                            Rating: {ratingFilter}
                          </span>
                        )}
                        {commentFilter !== "all" && (
                          <span className="badge bg-success ms-2">
                            Comments: {commentFilter.replace("-", " ")}
                          </span>
                        )}
                        {(dateFilter.startDate || dateFilter.endDate) && (
                          <span className="badge bg-info ms-2">
                            <FaCalendarAlt className="me-1" />
                            Date: {dateFilter.startDate || "Start"} to{" "}
                            {dateFilter.endDate || "End"}
                          </span>
                        )}
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* Table */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <h5>No Feedback Found</h5>
                  <p className="mb-0">Try changing your filter criteria</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped align-middle">
                    <thead
                      className="text-white"
                      style={{ backgroundColor: customStyles.primaryDark }}
                    >
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Hub Name</th>
                        <th>Food Rating</th>
                        <th>Delivery Rating</th>
                        <th>Food Comment</th>
                        <th>Delivery Comment</th>
                        <th>Food Ordered</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <strong>{order.orderid}</strong>
                          </td>
                          <td>
                            <div className="fw-bold">{order.username}</div>
                            <small className="text-muted">
                              {order.Mobilenumber}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {order.hubName || "Unknown"}
                            </span>
                          </td>

                          {/* Food Rating */}
                          <td style={{ minWidth: "140px" }}>
                            {order.ratings?.order?.status === "skipped" ? (
                              <span className="badge bg-secondary">
                                Skipped
                              </span>
                            ) : order.ratings?.order?.rating ? (
                              <div className="text-warning">
                                {renderStars(order.ratings.order.rating)}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>

                          {/* Delivery Rating */}
                          <td style={{ minWidth: "140px" }}>
                            {order.ratings?.delivery?.status === "skipped" ? (
                              <span className="badge bg-secondary">
                                Skipped
                              </span>
                            ) : order.ratings?.delivery?.rating ? (
                              <div className="text-warning">
                                {renderStars(order.ratings.delivery.rating)}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>

                          {/* Food Comment */}
                          <td>
                            {order.ratings?.order?.comment ? (
                              <small>{order.ratings.order.comment}</small>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>

                          {/* Delivery Comment */}
                          <td>
                            {order.ratings?.delivery?.comment ? (
                              <small>{order.ratings.delivery.comment}</small>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>

                          {/* Food Ordered */}
                          <td>
                            <div className="small">
                              {order?.allProduct?.map((item, idx) => (
                                <div key={idx} className="mb-1">
                                  {item?.foodItemId?.foodname} ×{" "}
                                  {item?.quantity}
                                </div>
                              ))}
                            </div>
                          </td>

                          <td>
                            <small>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </small>
                            <br />
                            <small className="text-muted">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <small className="text-muted">
                      Showing {indexOfFirstItem + 1} to{" "}
                      {Math.min(indexOfLastItem, filteredOrders.length)} of{" "}
                      {filteredOrders.length} entries
                    </small>
                  </div>
                  <nav>
                    <ul className="pagination">
                      {[...Array(totalPages)].map((_, i) => (
                        <li
                          key={i}
                          className={`page-item ${
                            currentPage === i + 1 ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => paginate(i + 1)}
                            style={
                              currentPage === i + 1
                                ? {
                                    backgroundColor: customStyles.primaryColor,
                                    borderColor: customStyles.primaryColor,
                                  }
                                : { color: customStyles.primaryColor }
                            }
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedBack;
