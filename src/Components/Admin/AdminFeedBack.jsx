import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaComments, FaEdit, FaSearch } from "react-icons/fa"; // Added icons import

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
  }, [orders, searchTerm, ratingFilter, commentFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Ensure this matches your route in backend
      const response = await axios.get(
        "https://dd-merge-backend-2.onrender.com/api/admin/feedback-orders" 
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
          order.ratings?.order?.comment?.toLowerCase().includes(lowerTerm) ||
          order.ratings?.delivery?.comment?.toLowerCase().includes(lowerTerm)
      );
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
            return (orderRating > 0 && orderRating <= 2) || (deliveryRating > 0 && deliveryRating <= 2);
          case "order-only":
            return order.ratings?.order?.rating && !order.ratings?.delivery?.rating;
          case "delivery-only":
            return !order.ratings?.order?.rating && order.ratings?.delivery?.rating;
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

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- Statistics Calculation (Updated for nested structure) ---
  const totalOrdersWithFeedback = orders.length;
  
  const ordersWithComments = orders.filter(
    (order) => order.ratings?.order?.comment || order.ratings?.delivery?.comment
  ).length;
  
  const ordersWithHighRating = orders.filter(
    (order) => (order.ratings?.order?.rating >= 4) || (order.ratings?.delivery?.rating >= 4)
  ).length;
  
  const ordersWithLowRating = orders.filter(
    (order) => (order.ratings?.order?.rating > 0 && order.ratings?.order?.rating <= 2) || 
               (order.ratings?.delivery?.rating > 0 && order.ratings?.delivery?.rating <= 2)
  ).length;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          color={i <= rating ? "#ffc107" : "#e4e5e9"}
          style={{ marginRight: "2px" }}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border" style={{ color: customStyles.primaryColor }} role="status">
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
            <div className="card-header text-white" style={{ backgroundColor: customStyles.primaryColor }}>
              <h4 className="mb-0">
                <FaComments className="me-2" />
                Customer Feedback Dashboard
                <span className="badge bg-light text-dark ms-2">{filteredOrders.length} Orders</span>
              </h4>
            </div>

            <div className="card-body">
              {/* Statistics Cards */}
              <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-3">
                  <div className="card text-white" style={{ backgroundColor: customStyles.primaryColor }}>
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
                  <div className="card text-white" style={{ backgroundColor: customStyles.primaryLight }}>
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

              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-4 mb-2">
                   <div className="input-group">
                      <span className="input-group-text"><FaSearch /></span>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                      />
                   </div>
                </div>
                <div className="col-md-4 mb-2">
                   <select className="form-select" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                      <option value="all">All Ratings</option>
                      <option value="4+">High (4-5 Stars)</option>
                      <option value="3">Average (3 Stars)</option>
                      <option value="1-2">Low (1-2 Stars)</option>
                   </select>
                </div>
                <div className="col-md-4 mb-2">
                   <select className="form-select" value={commentFilter} onChange={(e) => setCommentFilter(e.target.value)}>
                      <option value="all">All Comments</option>
                      <option value="with-comments">Has Comments</option>
                      <option value="no-comments">No Comments</option>
                   </select>
                </div>
              </div>

              {/* Table */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <h5>No Feedback Found</h5>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped align-middle">
                    <thead className="text-white" style={{ backgroundColor: customStyles.primaryDark }}>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Food Rating</th>
                        <th>Delivery Rating</th>
                        <th>Food Comment</th>
                        <th>Delivery Comment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map((order) => (
                        <tr key={order._id}>
                          <td><strong>{order.orderid}</strong></td>
                          <td>
                            <div className="fw-bold">{order.username}</div>
                            <small className="text-muted">{order.Mobilenumber}</small>
                          </td>
                          
                          {/* Food Rating */}
                          <td style={{minWidth: '140px'}}>
                            {order.ratings?.order?.status === 'skipped' ? (
                               <span className="badge bg-secondary">Skipped</span>
                            ) : order.ratings?.order?.rating ? (
                               <div className="text-warning">
                                  {renderStars(order.ratings.order.rating)}
                               </div>
                            ) : (
                               <span className="text-muted">-</span>
                            )}
                          </td>

                          {/* Delivery Rating */}
                          <td style={{minWidth: '140px'}}>
                             {order.ratings?.delivery?.status === 'skipped' ? (
                               <span className="badge bg-secondary">Skipped</span>
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
                             ) : <span className="text-muted">-</span>}
                          </td>

                          {/* Delivery Comment */}
                          <td>
                             {order.ratings?.delivery?.comment ? (
                                <small>{order.ratings.delivery.comment}</small>
                             ) : <span className="text-muted">-</span>}
                          </td>

                          <td>
                             <small>{new Date(order.createdAt).toLocaleDateString()}</small><br/>
                             <small className="text-muted">{new Date(order.createdAt).toLocaleTimeString()}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination (Keeping it simple for snippet) */}
              {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-3">
                      <nav>
                          <ul className="pagination">
                              {[...Array(totalPages)].map((_, i) => (
                                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                      <button 
                                        className="page-link" 
                                        onClick={() => paginate(i + 1)}
                                        style={currentPage === i + 1 ? {backgroundColor: customStyles.primaryColor, borderColor: customStyles.primaryColor} : {color: customStyles.primaryColor}}
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