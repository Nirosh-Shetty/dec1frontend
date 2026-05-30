// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   Modal,
//   Table,
//   Image,
//   Spinner,
//   Form,
//   Row,
//   Col,
//   Card,
//   InputGroup,
//   Badge,
//   Tooltip,
//   OverlayTrigger,
// } from "react-bootstrap";
// import { AiFillDelete, AiOutlineInfoCircle } from "react-icons/ai";
// import { BsSearch, BsGeoAlt } from "react-icons/bs";
// import "../Admin/Admin.css";
// import { IoIosEye } from "react-icons/io";
// import axios from "axios";
// import * as XLSX from "xlsx";
// import moment from "moment";
// import { useNavigate } from "react-router-dom";
// import ReactPaginate from "react-paginate";
// import {
//   FaStar,
//   FaSort,
//   FaSortUp,
//   FaSortDown,
//   FaFileExcel,
//   FaMapMarkerAlt,
// } from "react-icons/fa";
// import Swal from "sweetalert2";

// const CorporateBookings = () => {
//   // --- Original Modal States ---
//   const [show, setShow] = useState(false);
//   const handleClose = () => setShow(false);
//   const [data, setdata] = useState();
//   const handleShow = (item) => {
//     setdata(item);
//     setShow(true);
//   };

//   const [show4, setShow4] = useState(false);
//   const handleClose4 = () => setShow4(false);
//   const handleShow4 = () => setShow4(true);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);

//   const [show3, setShow3] = useState(false);
//   const [dataa, setdataa] = useState(false);
//   const handleClose3 = () => setShow3(false);
//   const handleShow3 = (items) => {
//     setShow3(true);
//     setdataa(items);
//   };

//   // --- Data & Pagination States ---
//   const [order, setOrder] = useState([]);
//   const [hubs, setHubs] = useState([]);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     pageSize: 10,
//   });

//   // --- Filter State Management ---
//   const [filters, setFilters] = useState({
//     dateFilterType: "today",
//     startDate: moment().format("YYYY-MM-DD"),
//     endDate: moment().format("YYYY-MM-DD"),
//     hubId: "",
//     session: "All",
//     status: "",
//     search: "",
//     customerType: "",
//     deliveryType: "",
//     hasPreorderDiscount: "",
//     page: 1,
//   });
  
//   const [sortConfig, setSortConfig] = useState({
//     key: "createdAt",
//     direction: "desc",
//   });

//   // --- Sorting Handler ---
//   const handleSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });
//   };

//   // --- Helper to render Sort Icon ---
//   const renderSortIcon = (columnKey) => {
//     if (sortConfig.key !== columnKey)
//       return <FaSort className="text-muted ms-1" size={12} />;
//     if (sortConfig.direction === "asc")
//       return <FaSortUp className="text-primary ms-1" size={12} />;
//     return <FaSortDown className="text-primary ms-1" size={12} />;
//   };

//   // --- States for Modal Actions ---
//   const [delData, setdelData] = useState();
//   const [statusdata, setstatusdata] = useState("");
//   const [reason, setreason] = useState("");
//   const [excelLoading, setExeclLoading] = useState(false);

//   // Helper function to calculate order summary
//   const calculateOrderSummary = (order) => {
//     if (!order) {
//       return {
//         subtotal: 0,
//         tax: 0,
//         deliveryCharge: 0,
//         gateDeliveryCharge: 0,
//         deliveryType: "",
//         cutlery: 0,
//         preorderDiscount: 0,
//         walletDiscount: 0,
//         couponDiscount: 0,
//         totalDiscounts: 0,
//         amountBeforeDiscounts: 0,
//         finalAmount: 0,
//       };
//     }

//     const subtotal =
//       order?.allProduct?.reduce((sum, item) => {
//         return sum + (parseFloat(item?.totalPrice) || 0);
//       }, 0) ||
//       parseFloat(order?.allTotal) ||
//       0;

//     const tax = parseFloat(order?.tax) || 0;
//     const deliveryCharge = parseFloat(order?.deliveryCharge) || 0;
//     const gateDeliveryCharge = parseFloat(order?.gateDeliveryCharge) || 0;

//     const deliveryTypeValue = (order?.deliveryType);
//     const isGateDelivery = deliveryTypeValue === "gate";
//     const deliveryType = isGateDelivery ? "gate" : "door";

//     const cutlery = parseFloat(order?.Cutlery) || 0;
//     const preorderDiscount = parseFloat(order?.preorderDiscount) || 0;
//     const walletDiscount = parseFloat(order?.discountWallet) || 0;
//     const couponDiscount = parseFloat(order?.coupon) || 0;

//     const totalDiscounts = preorderDiscount + walletDiscount + couponDiscount;
//     const amountBeforeDiscounts = subtotal;

//     let finalAmount = 0;
//     if (deliveryType === "gate") {
//       finalAmount = subtotal - gateDeliveryCharge - totalDiscounts;
//     } else {
//       finalAmount = subtotal + deliveryCharge - totalDiscounts;
//     }

//     return {
//       subtotal,
//       tax,
//       deliveryCharge,
//       gateDeliveryCharge,
//       deliveryType,
//       cutlery,
//       preorderDiscount,
//       walletDiscount,
//       couponDiscount,
//       totalDiscounts,
//       amountBeforeDiscounts,
//       finalAmount,
//     };
//   };

//   // Helper function to calculate date ranges based on filter type
//   const getDateRangeForFilter = (filterType) => {
//     const today = moment().startOf("day");

//     switch (filterType) {
//       case "today":
//         return {
//           startDate: today.format("YYYY-MM-DD"),
//           endDate: today.format("YYYY-MM-DD"),
//         };
//       case "yesterday":
//         const yesterday = moment().subtract(1, "days").startOf("day");
//         return {
//           startDate: yesterday.format("YYYY-MM-DD"),
//           endDate: yesterday.format("YYYY-MM-DD"),
//         };
//       case "thisWeek":
//         const startOfWeek = moment().startOf("week");
//         const endOfWeek = moment().endOf("week");
//         return {
//           startDate: startOfWeek.format("YYYY-MM-DD"),
//           endDate: endOfWeek.format("YYYY-MM-DD"),
//         };
//       case "thisMonth":
//         const startOfMonth = moment().startOf("month");
//         const endOfMonth = moment().endOf("month");
//         return {
//           startDate: startOfMonth.format("YYYY-MM-DD"),
//           endDate: endOfMonth.format("YYYY-MM-DD"),
//         };
//       case "lastMonth":
//         const startOfLastMonth = moment().subtract(1, "months").startOf("month");
//         const endOfLastMonth = moment().subtract(1, "months").endOf("month");
//         return {
//           startDate: startOfLastMonth.format("YYYY-MM-DD"),
//           endDate: endOfLastMonth.format("YYYY-MM-DD"),
//         };
//       case "custom":
//         return {
//           startDate: filters.startDate,
//           endDate: filters.endDate,
//         };
//       case "all":
//       default:
//         return {
//           startDate: null,
//           endDate: null,
//         };
//     }
//   };

//   // Fetch corporate orders
// // Fetch corporate orders
// const getApartmentOrder = async (page = 1) => {
//   setLoading(true);
//   try {
//     const dateRange = getDateRangeForFilter(filters.dateFilterType);

//     const params = {
//       page: filters.page,
//       limit: pagination.pageSize,
//       // REMOVE orderType if it's not in your database
//       // orderType: "corporate",
//       search: filters.search,
//       dateFilterType: filters.dateFilterType,
//       startDate: dateRange.startDate,
//       endDate: dateRange.endDate,
//       hubId: filters.hubId,
//       session: filters.session,
//       status: filters.status,
//       customerType: filters.customerType,
//       deliveryType: filters.deliveryType,
//       hasPreorderDiscount: filters.hasPreorderDiscount,
//       sortBy: sortConfig.key,
//       sortOrder: sortConfig.direction,
//     };

//     // Remove undefined params
//     Object.keys(params).forEach(key => {
//       if (params[key] === "" || params[key] === null || params[key] === undefined) {
//         delete params[key];
//       }
//     });

//     console.log("Sending params to API:", params);

//     const res = await axios.get(
//       "https://dd-backend-3nm0.onrender.com/api/admin/getallordersfilter",
//       { params }
//     );

//     console.log("API Response:", res.data);

//     if (res.data.success) {
//       setOrder(res.data.data.orders || []);
//       setPagination(res.data.data.pagination || {
//         currentPage: 1,
//         totalPages: 1,
//         totalCount: 0,
//         pageSize: 10,
//       });
      
//       if (res.data.data.orders.length === 0) {
//         console.log("No orders found with current filters");
//       }
//     } else {
//       console.error("API returned success: false", res.data);
//       setOrder([]);
//     }
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     setOrder([]);
//     Swal.fire({
//       title: "Error",
//       text: error.response?.data?.message || "Failed to fetch orders",
//       icon: "error",
//     });
//   } finally {
//     setLoading(false);
//   }
// };

//   // Fetch Hubs
//   const getHubs = async () => {
//     try {
//       const res = await axios.get(
//         "https://dd-backend-3nm0.onrender.com/api/Hub/hubs"
//       );
//       setHubs(res.data);
//     } catch (error) {
//       console.error("Failed to fetch hubs:", error);
//     }
//   };

//   // --- useEffects ---
//   useEffect(() => {
//     getHubs();
//   }, []);

//   useEffect(() => {
//     getApartmentOrder();
//   }, [filters, sortConfig]);

//   // --- Filter Handlers ---
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
//   };

//   const handlePageChange = ({ selected }) => {
//     setFilters((prev) => ({ ...prev, page: selected + 1 }));
//     window.scrollTo(0, 0);
//   };

//   const clearFilters = () => {
//     setFilters({
//       dateFilterType: "today",
//       startDate: moment().format("YYYY-MM-DD"),
//       endDate: moment().format("YYYY-MM-DD"),
//       hubId: "",
//       session: "All",
//       status: "",
//       search: "",
//       customerType: "",
//       deliveryType: "",
//       hasPreorderDiscount: "",
//       page: 1,
//     });
//     setSortConfig({ key: "createdAt", direction: "desc" });
//   };

//   // --- Original Functions ---
//   const deleteBooking = async (data) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You are about to delete this booking permanently. This action cannot be undone!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//       reverseButtons: true,
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           setLoading(true);
//           let res = await axios.delete(
//             `https://dd-backend-3nm0.onrender.com/api/admin/deletefoodorder/${data}`
//           );
//           if (res) {
//             Swal.fire("Success", "Booking deleted", "success");
//             handleClose4();
//             getApartmentOrder();
//           }
//         } catch (error) {
//           setLoading(false);
//           Swal.fire("Error", "Failed to delete", "error");
//         }
//       }
//     });
//   };

//   const changestatus = async (item) => {
//     if (!statusdata) return Swal.fire("Info", "Please select a status", "info");
//     setLoading(true);
//     try {
//       const config = {
//         url: "/admin/updateOrderStatus/" + item._id,
//         method: "put",
//         baseURL: "https://dd-backend-3nm0.onrender.com/api",
//         headers: { "Content-Type": "application/json" },
//         data: { newStatus: statusdata },
//       };
//       const res = await axios(config);
//       if (res.status === 200) {
//         handleClose3();
//         getApartmentOrder();
//         Swal.fire("Success", "Order status updated", "success");
//       }
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//       Swal.fire("Error", "Failed to update status", "error");
//     }
//   };

//   // Export Excel
//   const handleExportExcel = async () => {
//     setExeclLoading(true);
//     try {
//       const dateRange = getDateRangeForFilter(filters.dateFilterType);

//       const params = {
//         page: 1,
//         limit: 50000,
//         orderType: "corporate",
//         search: filters.search,
//         dateFilterType: filters.dateFilterType,
//         startDate: dateRange.startDate,
//         endDate: dateRange.endDate,
//         hubId: filters.hubId,
//         session: filters.session,
//         status: filters.status,
//         customerType: filters.customerType,
//         deliveryType: filters.deliveryType,
//         hasPreorderDiscount: filters.hasPreorderDiscount,
//         sortBy: sortConfig.key,
//         sortOrder: sortConfig.direction,
//       };

//       const res = await axios.get(
//         "https://dd-backend-3nm0.onrender.com/api/admin/getallordersfilter",
//         { params }
//       );

//       if (res.data.success) {
//         const dataToExport = res.data.data.orders.map((item, index) => {
//           const summary = calculateOrderSummary(item);
//           return {
//             "Sl.No": index + 1,
//             "Delivery Date": moment(item?.deliveryDate).format("DD-MM-YYYY"),
//             Session: item?.session || "N/A",
//             "Placed On": moment(item?.createdAt).format("DD-MM-YYYY h:mm A"),
//             "Order ID": item?.orderid,
//             "Customer Name": item?.username,
//             "Customer Type": item?.customerType || "N/A",
//             "Student Details": `${item?.studentName || ""} | Class: ${item?.studentClass || ""} | Section: ${item?.studentSection || ""}`,
//             "Hub Name": item?.hubName || "N/A",
//             "Delivery Location": item?.delivarylocation || "N/A",
//             Category: item?.allProduct
//               ?.map((p) => p.foodItemId?.foodcategory)
//               .join(", "),
//             Product: item?.allProduct
//               ?.map((p) => `${p.foodItemId?.foodname} - ${p.quantity} Qty`)
//               .join("\n"),
//             Cutlery: item?.Cutlery > 0 ? "Yes" : "No",
//             Unit: item?.allProduct?.map((p) => p.foodItemId?.unit).join(", "),
//             Phone: item?.Mobilenumber,
//             Corporate: item?.customerType,
//             "Address Type": item?.addressType,
//             "Payment Method": item?.paymentmethod,
//             "Delivery Type": summary.deliveryType === "gate" ? "Gate" : "Door",
//             "Delivery Charge": summary.deliveryType === "gate" 
//               ? `-₹${summary.gateDeliveryCharge.toFixed(2)}` 
//               : summary.deliveryCharge > 0 
//                 ? `+₹${summary.deliveryCharge.toFixed(2)}` 
//                 : "Free",
//             Tax: item?.tax?.toFixed(2),
//             "Subtotal (Before Discounts)": summary.amountBeforeDiscounts,
//             "Preorder Discount": summary.preorderDiscount,
//             "Has Preorder Discount": summary.preorderDiscount > 0 ? "Yes" : "No",
//             "Wallet Applied Amount": summary.walletDiscount,
//             "Coupon Discount": summary.couponDiscount,
//             "Total Discounts": summary.totalDiscounts,
//             "Final Amount": summary.finalAmount,
//             "Total Paid": summary.finalAmount,
//             Status: item?.status,
//           };
//         });

//         const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, "CorporateOrders");
//         XLSX.writeFile(
//           workbook,
//           `Corporate_Bookings_${moment().format("DDMMYYYY_HHmm")}.xlsx`
//         );
//         Swal.fire("Success", "Excel exported successfully!", "success");
//       }
//     } catch (error) {
//       console.error("Export error:", error);
//       Swal.fire("Error", "Export failed", "error");
//     } finally {
//       setExeclLoading(false);
//     }
//   };

//   const renderStars = (rating) => {
//     const stars = [];
//     for (let i = 1; i <= 5; i++) {
//       stars.push(
//         <FaStar
//           key={i}
//           color={i <= rating ? "#ffc107" : "#e4e5e9"}
//           style={{ marginRight: "2px" }}
//         />
//       );
//     }
//     return stars;
//   };

//   // Render Status Badge
//   const renderStatusBadge = (status) => {
//     const statusColors = {
//       Pending: "warning",
//       Confirmed: "info",
//       Cooking: "primary",
//       Packed: "secondary",
//       "On the way": "warning",
//       Delivered: "success",
//       Cancelled: "danger",
//     };
//     return <Badge bg={statusColors[status] || "secondary"}>{status}</Badge>;
//   };

//   // Pagination CSS styles
//   const paginationStyles = `
//     .pagination {
//       margin-bottom: 0;
//     }
//     .pagination .page-item.active .page-link {
//       background-color: #0d6efd;
//       border-color: #0d6efd;
//       color: white;
//     }
//     .pagination .page-link {
//       color: #0d6efd;
//       border: 1px solid #dee2e6;
//       padding: 0.375rem 0.75rem;
//       font-size: 0.875rem;
//     }
//     .pagination .page-link:hover {
//       background-color: #e9ecef;
//     }
//     .pagination .page-item.disabled .page-link {
//       color: #6c757d;
//       pointer-events: none;
//       background-color: #f8f9fa;
//     }
//   `;

//   return (
//     <div className="p-3" style={{ minHeight: "80vh" }}>
//       <style>{paginationStyles}</style>

//       {/* Filter Card */}
//       <Card className="mb-4 border-0 shadow-sm">
//         <Card.Body className="p-4">
//           <h5 className="mb-4 text-primary fw-bold">
//             <i className="fas fa-filter me-2"></i>
//             Filter Orders
//           </h5>

//           <Row className="g-3 align-items-end mb-3">
//             <Col md={3}>
//               <Form.Label className="fw-bold small">Time Period</Form.Label>
//               <Form.Select
//                 name="dateFilterType"
//                 value={filters.dateFilterType}
//                 onChange={handleFilterChange}
//                 className="shadow-sm border-primary"
//               >
//                 <option value="today">Today</option>
//                 <option value="yesterday">Yesterday</option>
//                 <option value="thisWeek">This Week</option>
//                 <option value="thisMonth">This Month</option>
//                 <option value="lastMonth">Last Month</option>
//                 <option value="custom">Custom Date Range</option>
//                 <option value="all">All Time</option>
//               </Form.Select>
//             </Col>

//             {filters.dateFilterType === "custom" && (
//               <>
//                 <Col md={3}>
//                   <Form.Label className="fw-bold small">Start Date</Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="startDate"
//                     value={filters.startDate}
//                     onChange={handleFilterChange}
//                     className="shadow-sm"
//                   />
//                 </Col>
//                 <Col md={3}>
//                   <Form.Label className="fw-bold small">End Date</Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="endDate"
//                     value={filters.endDate}
//                     onChange={handleFilterChange}
//                     className="shadow-sm"
//                     min={filters.startDate}
//                   />
//                 </Col>
//               </>
//             )}

//             <Col md={filters.dateFilterType === "custom" ? 3 : 2}>
//               <Form.Label className="fw-bold small">Session</Form.Label>
//               <Form.Select
//                 name="session"
//                 value={filters.session}
//                 onChange={handleFilterChange}
//                 className="shadow-sm"
//               >
//                 <option value="All">All Sessions</option>
//                 <option value="Breakfast">Breakfast</option>
//                 <option value="Lunch">Lunch</option>
//                 <option value="Dinner">Dinner</option>
//               </Form.Select>
//             </Col>
//           </Row>

//           <Row className="g-3 align-items-end mb-3">
//             <Col md={3}>
//               <Form.Label className="fw-bold small">Hub</Form.Label>
//               <Form.Select
//                 name="hubId"
//                 value={filters.hubId}
//                 onChange={handleFilterChange}
//                 className="shadow-sm"
//               >
//                 <option value="">All Hubs</option>
//                 {hubs?.map((hub) => (
//                   <option key={hub._id} value={hub._id}>
//                     {hub?.hubName}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Col>

//             <Col md={3}>
//               <Form.Label className="fw-bold small">Status</Form.Label>
//               <Form.Select
//                 name="status"
//                 value={filters.status}
//                 onChange={handleFilterChange}
//                 className="shadow-sm"
//               >
//                 <option value="">All Status</option>
//                 <option value="Pending">Pending</option>
//                 <option value="Confirmed">Confirmed</option>
//                 <option value="Cooking">Cooking</option>
//                 <option value="Packing">Packing</option>
//                 <option value="Packed">Packed</option>
//                 <option value="On the way">On the way</option>
//                 <option value="Delivered">Delivered</option>
//                 <option value="Cancelled">Cancelled</option>
//               </Form.Select>
//             </Col>

//             <Col md={3}>
//               <Form.Label className="fw-bold small">Customer Type</Form.Label>
//               <Form.Select
//                 name="customerType"
//                 value={filters.customerType}
//                 onChange={handleFilterChange}
//                 className="shadow-sm"
//               >
//                 <option value="">All Customers</option>
//                 <option value="Normal">Normal</option>
//                 <option value="Employee">Employee</option>
//               </Form.Select>
//             </Col>

//             <Col md={3}>
//               <Form.Label className="fw-bold small">Delivery Type</Form.Label>
//               <Form.Select
//                 name="deliveryType"
//                 value={filters.deliveryType}
//                 onChange={handleFilterChange}
//                 className="shadow-sm"
//               >
//                 <option value="">All Delivery Types</option>
//                 <option value="door">Door Delivery</option>
//                 <option value="gate">Gate Delivery</option>
//               </Form.Select>
//             </Col>
//           </Row>

//           <Row className="g-3 align-items-end mb-3">
//             <Col md={3}>
//               <Form.Label className="fw-bold small">Preorder Discount</Form.Label>
//               <Form.Select
//                 name="hasPreorderDiscount"
//                 value={filters.hasPreorderDiscount}
//                 onChange={handleFilterChange}
//                 className="shadow-sm"
//               >
//                 <option value="">All Orders</option>
//                 <option value="true">Has Preorder Discount</option>
//                 <option value="false">No Preorder Discount</option>
//               </Form.Select>
//             </Col>

//             <Col md={6}>
//               <Form.Label className="fw-bold small">Search</Form.Label>
//               <InputGroup className="shadow-sm">
//                 <InputGroup.Text className="bg-light">
//                   <BsSearch />
//                 </InputGroup.Text>
//                 <Form.Control
//                   type="text"
//                   placeholder="Search by Order ID, Customer Name, or Phone"
//                   name="search"
//                   value={filters.search}
//                   onChange={handleFilterChange}
//                 />
//               </InputGroup>
//             </Col>

//             <Col md={3}>
//               <Button
//                 variant="outline-danger"
//                 onClick={clearFilters}
//                 className="w-100 fw-bold"
//               >
//                 <i className="fas fa-redo me-1"></i> Reset
//               </Button>
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       {/* Main Content */}
//       <Card className="border-0 shadow-sm">
//         <Card.Body className="p-0">
//           <div className="p-3 border-bottom bg-light">
//             <div className="d-flex justify-content-between align-items-center">
//               <div>
//                 <h4 className="mb-0 text-primary fw-bold">
//                   <i className="fas fa-building me-2"></i>
//                   Corporate Bookings
//                 </h4>
//                 <p className="text-muted mb-0 small">
//                   Total Orders:{" "}
//                   <span className="fw-bold">{pagination?.totalCount || 0}</span>
//                 </p>
//               </div>
//               <div className="d-flex gap-2">
//                 <Button
//                   variant="success"
//                   onClick={handleExportExcel}
//                   disabled={excelLoading || order.length === 0}
//                   className="d-flex align-items-center"
//                 >
//                   {excelLoading ? (
//                     <Spinner size="sm" className="me-2" />
//                   ) : (
//                     <FaFileExcel className="me-2" />
//                   )}
//                   Export Excel
//                 </Button>
//               </div>
//             </div>
//           </div>

//           <div
//             className="table-responsive"
//             style={{ maxHeight: "60vh", overflowY: "auto" }}
//           >
//             <Table hover className="mb-0">
//               <thead className="bg-light sticky-top" style={{ top: 0 }}>
//                 <tr>
//                   <th>S.No</th>
//                   <th
//                     onClick={() => handleSort("createdAt")}
//                     style={{ cursor: "pointer", whiteSpace: "nowrap" }}
//                   >
//                     Placed On {renderSortIcon("createdAt")}
//                   </th>
//                   <th
//                     onClick={() => handleSort("deliveryDate")}
//                     style={{ cursor: "pointer", whiteSpace: "nowrap" }}
//                   >
//                     Delivery Date {renderSortIcon("deliveryDate")}
//                   </th>
//                   <th
//                     onClick={() => handleSort("session")}
//                     style={{ cursor: "pointer", whiteSpace: "nowrap" }}
//                   >
//                     Session {renderSortIcon("session")}
//                   </th>
//                   <th
//                     onClick={() => handleSort("orderid")}
//                     style={{ cursor: "pointer", whiteSpace: "nowrap" }}
//                   >
//                     Order ID {renderSortIcon("orderid")}
//                   </th>
//                   <th>Customer</th>
//                   <th>Customer Type</th>
//                   <th>Student Details</th>
//                   <th>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Delivery Location</Tooltip>}
//                     >
//                       <span>
//                         <FaMapMarkerAlt className="me-1" size={12} /> Location
//                       </span>
//                     </OverlayTrigger>
//                   </th>
//                   <th style={{ whiteSpace: "nowrap" }}>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Before discounts & tax</Tooltip>}
//                     >
//                       <span>
//                         Subtotal{" "}
//                         <AiOutlineInfoCircle className="ms-1" size={12} />
//                       </span>
//                     </OverlayTrigger>
//                   </th>
//                   <th style={{ whiteSpace: "nowrap" }}>Preorder Discount</th>
//                   <th style={{ whiteSpace: "nowrap" }}>Wallet Applied</th>
//                   <th style={{ whiteSpace: "nowrap" }}>Coupon Discount</th>
//                   <th style={{ whiteSpace: "nowrap" }}>Delivery Charge</th>
//                   <th style={{ whiteSpace: "nowrap" }}>Delivery Type</th>
//                   <th style={{ whiteSpace: "nowrap" }}>Total Discounts</th>
//                   <th style={{ whiteSpace: "nowrap" }}>Tax Applied</th>
//                   <th style={{ whiteSpace: "nowrap" }}>Final Amount</th>
//                   <th style={{ whiteSpace: "nowrap" }}>Total Paid</th>
//                   <th
//                     onClick={() => handleSort("status")}
//                     style={{ cursor: "pointer", whiteSpace: "nowrap" }}
//                   >
//                     Status {renderSortIcon("status")}
//                   </th>
//                   <th>Hub</th>
//                   <th>Products</th>
//                   <th>Payment</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan={26} className="text-center py-5">
//                       <Spinner
//                         animation="border"
//                         variant="primary"
//                         className="me-2"
//                       />
//                       Loading orders...
//                      </td>
//                    </tr>
//                 ) : order.length === 0 ? (
//                   <tr>
//                     <td colSpan={26} className="text-center py-5">
//                       <div className="text-muted">
//                         <i className="fas fa-inbox fa-2x mb-3"></i>
//                         <p>No orders found</p>
//                         <Button
//                           variant="outline-primary"
//                           size="sm"
//                           onClick={clearFilters}
//                         >
//                           Clear Filters
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   order.map((items, i) => {
//                     const serialNumber =
//                       (pagination.currentPage - 1) * pagination.pageSize +
//                       i +
//                       1;
//                     const summary = calculateOrderSummary(items);

//                     return (
//                       <tr key={items._id} className="align-middle">
//                         <td className="fw-bold">{serialNumber}</td>
//                         <td>
//                           <small className="text-muted d-block">Date:</small>
//                           {moment(items?.createdAt).format("DD-MM-YYYY")}
//                           <br />
//                           <small className="text-muted d-block">Time:</small>
//                           {moment(items?.createdAt).format("h:mm A")}
//                         </td>
//                         <td>
//                           {items?.deliveryDate
//                             ? moment(items.deliveryDate).format("DD-MM-YYYY")
//                             : "N/A"}
//                         </td>
//                         <td>
//                           <Badge
//                             bg={
//                               items?.session === "Lunch" ? "warning" : "info"
//                             }
//                           >
//                             {items?.session || "N/A"}
//                           </Badge>
//                         </td>
//                         <td>
//                           <code className="bg-light p-1 rounded">
//                             {items?.orderid}
//                           </code>
//                         </td>
//                         <td>
//                           <div className="fw-bold">{items?.username}</div>
//                           <div className="d-flex flex-column ">
//                             <small className="text-muted">
//                               {items?.Mobilenumber}
//                             </small>
//                           </div>
//                         </td>
//                         <td>
//                           <Badge
//                             bg={items?.customerType === "Employee" ? "success" : "secondary"}
//                           >
//                             {items?.customerType || "N/A"}
//                           </Badge>
//                         </td>
//                         <td>
//                           {items?.studentName ? (
//                             <>
//                               <div>
//                                 <strong>{items.studentName}</strong>
//                               </div>
//                               <small>
//                                 Class {items.studentClass}, Sec{" "}
//                                 {items.studentSection}
//                               </small>
//                             </>
//                           ) : (
//                             <span className="text-muted">-</span>
//                           )}
//                         </td>
//                         <td>
//                           <div className="d-flex align-items-center">
//                             <FaMapMarkerAlt
//                               className="me-1 text-primary"
//                               size={12}
//                             />
//                             <div>
//                               <div
//                                 className="small text-truncate"
//                                 style={{ maxWidth: "150px" }}
//                               >
//                                 {items?.delivarylocation || "N/A"}
//                               </div>
//                               {items?.addressline && (
//                                 <div
//                                   className="text-muted smaller"
//                                   style={{ fontSize: "0.7rem" }}
//                                 >
//                                   {items.addressline}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="text-end">
//                           <div className="text-success fw-bold">
//                             ₹{summary.amountBeforeDiscounts.toFixed(2)}
//                           </div>
//                         </td>
//                         <td className="text-end">
//                           {summary.preorderDiscount > 0 ? (
//                             <div>
//                               <span className="text-danger fw-bold">
//                                 -₹{summary.preorderDiscount.toFixed(2)}
//                               </span>
//                               <Badge bg="success" className="ms-1">Applied</Badge>
//                             </div>
//                           ) : (
//                             <span className="text-muted">-</span>
//                           )}
//                         </td>
//                         <td className="text-end">
//                           {summary.walletDiscount > 0 ? (
//                             <span className="text-danger fw-bold">
//                               -₹{summary.walletDiscount.toFixed(2)}
//                             </span>
//                           ) : (
//                             <span className="text-muted">-</span>
//                           )}
//                         </td>
//                         <td className="text-end">
//                           {summary.couponDiscount > 0 ? (
//                             <span className="text-danger fw-bold">
//                               -₹{summary.couponDiscount.toFixed(2)}
//                             </span>
//                           ) : (
//                             <span className="text-muted">-</span>
//                           )}
//                         </td>
//                         <td className="text-end">
//                           {summary.deliveryType === "gate" ? (
//                             <span className="text-success fw-bold">
//                               -₹{summary.gateDeliveryCharge.toFixed(2)}
//                             </span>
//                           ) : summary.deliveryCharge > 0 ? (
//                             <span className="text-danger fw-bold">
//                               +₹{summary.deliveryCharge.toFixed(2)}
//                             </span>
//                           ) : (
//                             <span className="text-success">Free</span>
//                           )}
//                         </td>
//                         <td className="text-center">
//                           {summary.deliveryType === "gate" ? (
//                             <div>
//                               <Badge bg="success" className="d-block mb-1">
//                                 Gate
//                               </Badge>
//                               <small className="text-success fw-bold">
//                                 Rebate: -₹{summary.gateDeliveryCharge.toFixed(2)}
//                               </small>
//                             </div>
//                           ) : (
//                             <div>
//                               <Badge bg="primary" className="d-block mb-1">
//                                 Door
//                               </Badge>
//                               {summary.deliveryCharge > 0 ? (
//                                 <small className="text-danger fw-bold">
//                                   Charge: +₹{summary.deliveryCharge.toFixed(2)}
//                                 </small>
//                               ) : (
//                                 <small className="text-success">
//                                   Free Delivery
//                                 </small>
//                               )}
//                             </div>
//                           )}
//                         </td>
//                         <td className="text-end">
//                           {summary.totalDiscounts > 0 ? (
//                             <div className="fw-bold text-danger">
//                               -₹{summary.totalDiscounts.toFixed(2)}
//                             </div>
//                           ) : (
//                             <span className="text-muted">No discounts</span>
//                           )}
//                         </td>
//                         <td className="text-end">
//                           <div className="fw-bold text-danger">
//                             -₹ {summary?.tax ? summary.tax.toFixed(2) : "0.00"}
//                           </div>
//                         </td>
//                         <td className="text-end">
//                           <div className="fw-bold fs-6 text-primary">
//                             ₹{summary.finalAmount.toFixed(2)}
//                           </div>
//                         </td>
//                         <td className="text-end">
//                           <div className="fw-bold fs-6 text-primary">
//                             ₹{summary.finalAmount.toFixed(2)}
//                           </div>
//                         </td>
//                         <td>
//                           <div className="d-flex flex-column gap-1">
//                             {renderStatusBadge(items?.status)}
//                             <Button
//                               size="sm"
//                               variant="outline-primary"
//                               onClick={() => handleShow3(items)}
//                               className="mt-1"
//                             >
//                               Change
//                             </Button>
//                           </div>
//                         </td>
//                         <td>{items?.hubName || "N/A"}</td>
//                         <td style={{ maxWidth: "200px" }}>
//                           <div className="small">
//                             {items?.allProduct
//                               ?.slice(0, 2)
//                               .map((item, idx) => (
//                                 <div key={idx} className="mb-1">
//                                   {item?.foodItemId?.foodname} ×{" "}
//                                   {item?.quantity}
//                                 </div>
//                               ))}
//                             {items?.allProduct?.length > 2 && (
//                               <Badge bg="secondary" className="ms-1">
//                                 +{items.allProduct.length - 2} more
//                               </Badge>
//                             )}
//                           </div>
//                         </td>
//                         <td>
//                           <Badge
//                             bg={
//                               items?.paymentmethod === "Online"
//                                 ? "success"
//                                 : "warning"
//                             }
//                           >
//                             {items?.paymentmethod}
//                           </Badge>
//                         </td>
//                         <td>
//                           <div className="d-flex flex-column gap-2">
//                             <Button
//                               size="sm"
//                               variant="outline-primary"
//                               onClick={() => handleShow(items)}
//                               className="d-flex align-items-center justify-content-center"
//                             >
//                               <IoIosEye className="me-1" /> View
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline-success"
//                               onClick={() =>
//                                 navigate("/thermalinvoice", {
//                                   state: { item: items },
//                                 })
//                               }
//                             >
//                               <i className="fas fa-print me-1"></i> Print
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline-danger"
//                               onClick={() => {
//                                 setdelData(items._id);
//                                 handleShow4();
//                               }}
//                             >
//                               <AiFillDelete /> Delete
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </Table>
//           </div>

//           {/* Pagination */}
//           {pagination.totalPages > 1 && (
//             <div className="p-3 border-top bg-light">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div className="text-muted small">
//                   Showing{" "}
//                   <span className="fw-bold">
//                     {(pagination.currentPage - 1) * pagination.pageSize + 1}
//                   </span>{" "}
//                   to{" "}
//                   <span className="fw-bold">
//                     {Math.min(
//                       pagination.currentPage * pagination.pageSize,
//                       pagination.totalCount
//                     )}
//                   </span>{" "}
//                   of <span className="fw-bold">{pagination.totalCount}</span>{" "}
//                   orders
//                 </div>
//                 <div>
//                   <ReactPaginate
//                     previousLabel={
//                       <span>
//                         <i className="fas fa-chevron-left me-1"></i> Previous
//                       </span>
//                     }
//                     nextLabel={
//                       <span>
//                         Next <i className="fas fa-chevron-right ms-1"></i>
//                       </span>
//                     }
//                     breakLabel={<span className="mx-1">...</span>}
//                     pageCount={pagination.totalPages}
//                     onPageChange={handlePageChange}
//                     forcePage={pagination.currentPage - 1}
//                     containerClassName={"pagination mb-0"}
//                     pageClassName={"page-item"}
//                     pageLinkClassName={"page-link"}
//                     previousClassName={"page-item"}
//                     previousLinkClassName={"page-link"}
//                     nextClassName={"page-item"}
//                     nextLinkClassName={"page-link"}
//                     breakClassName={"page-item"}
//                     breakLinkClassName={"page-link"}
//                     activeClassName={"active"}
//                     disabledClassName={"disabled"}
//                     marginPagesDisplayed={2}
//                     pageRangeDisplayed={5}
//                     renderOnZeroPageCount={null}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Delete Modal */}
//       <Modal
//         show={show4}
//         onHide={handleClose4}
//         backdrop="static"
//         keyboard={false}
//         centered
//       >
//         <Modal.Header closeButton className="border-0">
//           <Modal.Title className="text-danger">
//             <i className="fas fa-exclamation-triangle me-2"></i>
//             Confirm Deletion
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="text-center py-4">
//             <i className="fas fa-trash-alt fa-3x text-danger mb-3"></i>
//             <h5>Are you sure you want to delete this booking?</h5>
//             <p className="text-muted">
//               This action cannot be undone. All order data will be permanently
//               removed.
//             </p>
//           </div>
//         </Modal.Body>
//         <Modal.Footer className="border-0">
//           <Button variant="outline-secondary" onClick={handleClose4}>
//             Cancel
//           </Button>
//           <Button
//             variant="danger"
//             onClick={() => deleteBooking(delData)}
//             className="d-flex align-items-center"
//           >
//             <AiFillDelete className="me-2" /> Delete Permanently
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Invoice/Details Modal */}
//       <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
//         <Modal.Header closeButton className="bg-light">
//           <Modal.Title>
//             <i className="fas fa-file-invoice me-2"></i>
//             Order Details - {data?.orderid || "N/A"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {data && (
//             <>
//               {/* Order Summary */}
//               <Card className="mb-4 border-0 shadow-sm">
//                 <Card.Body>
//                   <h6 className="fw-bold mb-3 text-primary">
//                     <i className="fas fa-shopping-basket me-2"></i>
//                     Order Summary ({data?.allProduct?.length || 0} Items)
//                   </h6>
//                   <div className="row">
//                     {data?.allProduct?.map((Item, idx) => (
//                       <div className="col-12 mb-2" key={Item?._id || idx}>
//                         <div className="d-flex align-items-center p-2 border rounded">
//                           {Item?.foodItemId?.Foodgallery?.[0]?.image2 && (
//                             <div className="me-3">
//                               <Image
//                                 src={Item.foodItemId.Foodgallery[0].image2}
//                                 alt={Item?.foodItemId?.foodname}
//                                 rounded
//                                 style={{
//                                   width: "60px",
//                                   height: "60px",
//                                   objectFit: "cover",
//                                 }}
//                                 onError={(e) => {
//                                   e.target.style.display = "none";
//                                 }}
//                               />
//                             </div>
//                           )}
//                           <div className="flex-grow-1">
//                             <div className="fw-bold">
//                               {Item?.foodItemId?.foodname || "Item"}
//                             </div>
//                             <div className="small text-muted">
//                               {Item?.foodItemId?.foodcategory || ""} •{" "}
//                               {Item?.foodItemId?.unit || ""}
//                             </div>
//                           </div>
//                           <div className="text-end">
//                             <div className="fw-bold">
//                               ₹{" "}
//                               {(
//                                 Item?.totalPrice / (Item?.quantity || 1)
//                               ).toFixed(2)}
//                             </div>
//                             <div className="small">× {Item?.quantity || 1}</div>
//                           </div>
//                           <div className="ms-4 text-end">
//                             <div className="fw-bold text-success">
//                               ₹ {(Item?.totalPrice || 0).toFixed(2)}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </Card.Body>
//               </Card>

//               {/* Bill Details */}
//               <Card className="mb-4 border-0 shadow-sm">
//                 <Card.Body>
//                   <h6 className="fw-bold mb-3 text-primary">
//                     <i className="fas fa-receipt me-2"></i>
//                     Bill Details
//                   </h6>
//                   {(() => {
//                     const summary = calculateOrderSummary(data);
//                     return (
//                       <div className="row">
//                         <div className="col-8">
//                           <div className="mb-2">
//                             Item Total (Before Discounts)
//                           </div>
//                           <div className="mb-2">
//                             Tax ({data?.taxPercentage || 5}%)
//                           </div>
//                           {(data?.Cutlery || 0) > 0 && (
//                             <div className="mb-2">Cutlery</div>
//                           )}
//                           {summary.deliveryType === "gate" && (
//                             <div className="mb-2 text-success">
//                               Gate Delivery Rebate{" "}
//                               <Badge bg="success" className="ms-1">
//                                 Gate
//                               </Badge>
//                             </div>
//                           )}
//                           {summary.deliveryType === "door" && summary.deliveryCharge > 0 && (
//                             <div className="mb-2">
//                               Door Delivery Charge{" "}
//                               <Badge bg="primary" className="ms-1">
//                                 Door
//                               </Badge>
//                             </div>
//                           )}
//                           {summary.deliveryType === "door" && summary.deliveryCharge === 0 && (
//                             <div className="mb-2 text-success">
//                               Free Delivery{" "}
//                               <Badge bg="primary" className="ms-1">
//                                 Door
//                               </Badge>
//                             </div>
//                           )}
//                           {summary.preorderDiscount > 0 && (
//                             <div className="mb-2">Preorder Discount</div>
//                           )}
//                           {summary.couponDiscount > 0 && (
//                             <div className="mb-2">Coupon Discount</div>
//                           )}
//                           {summary.walletDiscount > 0 && (
//                             <div className="mb-2">Wallet Applied</div>
//                           )}
//                           <hr />
//                           <div className="fw-bold">Grand Total</div>
//                         </div>
//                         <div className="col-4 text-end">
//                           <div className="mb-2">
//                             ₹ {summary.amountBeforeDiscounts.toFixed(2)}
//                           </div>
//                           <div className="mb-2">
//                             ₹ {summary.tax.toFixed(2)}
//                           </div>
//                           {(data?.Cutlery || 0) > 0 && (
//                             <div className="mb-2">₹ {data.Cutlery}</div>
//                           )}
//                           {summary.deliveryType === "gate" && (
//                             <div className="mb-2 text-success fw-bold">
//                               - ₹ {summary.gateDeliveryCharge.toFixed(2)}
//                             </div>
//                           )}
//                           {summary.deliveryType === "door" && summary.deliveryCharge > 0 && (
//                             <div className="mb-2 text-danger fw-bold">
//                               + ₹ {summary.deliveryCharge.toFixed(2)}
//                             </div>
//                           )}
//                           {summary.deliveryType === "door" && summary.deliveryCharge === 0 && (
//                             <div className="mb-2 text-success fw-bold">
//                               ₹ 0.00
//                             </div>
//                           )}
//                           {summary.preorderDiscount > 0 && (
//                             <div className="mb-2 text-danger">
//                               - ₹ {summary.preorderDiscount.toFixed(2)}
//                             </div>
//                           )}
//                           {summary.couponDiscount > 0 && (
//                             <div className="mb-2 text-danger">
//                               - ₹ {summary.couponDiscount.toFixed(2)}
//                             </div>
//                           )}
//                           {summary.walletDiscount > 0 && (
//                             <div className="mb-2 text-danger">
//                               - ₹ {summary.walletDiscount.toFixed(2)}
//                             </div>
//                           )}
//                           <hr />
//                           <div className="fw-bold fs-5 text-success">
//                             ₹ {summary.finalAmount.toFixed(2)}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })()}
//                 </Card.Body>
//               </Card>

//               {/* Delivery Location */}
//               <Card className="mb-4 border-0 shadow-sm">
//                 <Card.Body>
//                   <h6 className="fw-bold mb-3 text-primary">
//                     <i className="fas fa-map-marker-alt me-2"></i>
//                     Delivery Location
//                   </h6>
//                   <div className="p-3 border rounded">
//                     <div className="d-flex align-items-start">
//                       <FaMapMarkerAlt className="me-2 text-primary mt-1" />
//                       <div>
//                         <div className="fw-bold">
//                           {data?.delivarylocation || "Location not specified"}
//                         </div>
//                         {data?.addressline && (
//                           <div className="text-muted mt-1">
//                             {data.addressline}
//                           </div>
//                         )}
//                         {data?.addressType && (
//                           <Badge bg="info" className="mt-2">
//                             {data.addressType}
//                           </Badge>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </Card.Body>
//               </Card>

//               {/* Customer Feedback */}
//               <Card className="border-0 shadow-sm">
//                 <Card.Body>
//                   <h6 className="fw-bold mb-3 text-primary">
//                     <i className="fas fa-comment-alt me-2"></i>
//                     Customer Feedback
//                   </h6>
//                   <div className="row">
//                     <div className="col-md-6 mb-3">
//                       <div className="p-3 border rounded">
//                         <h6 className="fw-bold">Food Rating</h6>
//                         {data?.ratings?.order?.rating ? (
//                           <>
//                             <div className="mb-2">
//                               {renderStars(data.ratings.order.rating)}
//                               <span className="ms-2 badge bg-success">
//                                 {data.ratings.order.rating}/5
//                               </span>
//                             </div>
//                             <p className="mb-0 text-muted">
//                               "
//                               {data.ratings.order.comment ||
//                                 "No comment provided."}
//                               "
//                             </p>
//                           </>
//                         ) : (
//                           <div className="text-muted">
//                             <i className="fas fa-clock me-1"></i>
//                             {data?.ratings?.order?.status === "skipped"
//                               ? "Skipped by user"
//                               : "Pending / Not Rated"}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                     <div className="col-md-6 mb-3">
//                       <div className="p-3 border rounded">
//                         <h6 className="fw-bold">Delivery Rating</h6>
//                         {data?.ratings?.delivery?.rating ? (
//                           <>
//                             <div className="mb-2">
//                               {renderStars(data.ratings.delivery.rating)}
//                               <span className="ms-2 badge bg-primary">
//                                 {data.ratings.delivery.rating}/5
//                               </span>
//                             </div>
//                             <p className="mb-0 text-muted">
//                               "
//                               {data.ratings.delivery.comment ||
//                                 "No comment provided."}
//                               "
//                             </p>
//                           </>
//                         ) : (
//                           <div className="text-muted">
//                             <i className="fas fa-clock me-1"></i>
//                             {data?.ratings?.delivery?.status === "skipped"
//                               ? "Skipped by user"
//                               : "Pending / Not Rated"}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </Card.Body>
//               </Card>
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer className="bg-light">
//           <Button variant="outline-secondary" onClick={handleClose}>
//             Close
//           </Button>
//           <Button
//             variant="primary"
//             onClick={() =>
//               navigate("/AdminInvoice", { state: { item: data } })
//             }
//             disabled={!data}
//           >
//             <i className="fas fa-file-invoice me-2"></i>
//             View Full Invoice
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Status Change Modal */}
//       <Modal
//         show={show3}
//         onHide={handleClose3}
//         backdrop="static"
//         keyboard={false}
//         centered
//       >
//         <Modal.Header closeButton className="border-0">
//           <Modal.Title>
//             <i className="fas fa-exchange-alt me-2"></i>
//             Update Order Status
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="mb-3">
//             <Form.Label className="fw-bold">Select New Status</Form.Label>
//             <Form.Select
//               name="status"
//               id="status"
//               onChange={(e) => setstatusdata(e.target.value)}
//               value={statusdata}
//               className="border-primary"
//               size="lg"
//             >
//               <option value="" disabled>
//                 Select Status
//               </option>
//               <option value="Cooking">Cooking</option>
//               <option value="Packing">Packing</option>
//               <option value="Packed">Packed</option>
//               <option value="On the way">On the way</option>
//               <option value="Delivered">Delivered</option>
//               <option value="Cancelled">Cancelled</option>
//             </Form.Select>
//           </div>
//           <div className="alert alert-info small">
//             <i className="fas fa-info-circle me-2"></i>
//             Current order: <strong>{dataa?.orderid}</strong>
//           </div>
//         </Modal.Body>
//         <Modal.Footer className="border-0">
//           <Button variant="outline-secondary" onClick={handleClose3}>
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             onClick={() => changestatus(dataa)}
//             disabled={!statusdata}
//           >
//             Update Status
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default CorporateBookings;


















import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Table,
  Image,
  Spinner,
  Form,
  Row,
  Col,
  Card,
  InputGroup,
  Badge,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { AiFillDelete, AiOutlineInfoCircle } from "react-icons/ai";
import { BsSearch, BsGeoAlt } from "react-icons/bs";
import "../Admin/Admin.css";
import { IoIosEye } from "react-icons/io";
import axios from "axios";
import * as XLSX from "xlsx";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import {
  FaStar,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileExcel,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import Swal from "sweetalert2";

const CorporateBookings = () => {
  // --- Original Modal States ---
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [data, setdata] = useState();
  const handleShow = (item) => {
    setdata(item);
    setShow(true);
  };

  const [show4, setShow4] = useState(false);
  const handleClose4 = () => setShow4(false);
  const handleShow4 = () => setShow4(true);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [show3, setShow3] = useState(false);
  const [dataa, setdataa] = useState(false);
  const handleClose3 = () => setShow3(false);
  const handleShow3 = (items) => {
    setShow3(true);
    setdataa(items);
  };

  // --- Pickup Point Modal State ---
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState(null);
  const handleClosePickupModal = () => setShowPickupModal(false);
  const handleShowPickupModal = (pickupPoint) => {
    setSelectedPickupPoint(pickupPoint);
    setShowPickupModal(true);
  };

  // --- Data & Pagination States ---
  const [order, setOrder] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  });

  // --- Filter State Management ---
  const [filters, setFilters] = useState({
    dateFilterType: "today",
    startDate: moment().format("YYYY-MM-DD"),
    endDate: moment().format("YYYY-MM-DD"),
    hubId: "",
    session: "All",
    status: "",
    search: "",
    customerType: "",
    deliveryType: "",
    hasPreorderDiscount: "",
    page: 1,
  });
  
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // --- Sorting Handler ---
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // --- Helper to render Sort Icon ---
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey)
      return <FaSort className="text-muted ms-1" size={12} />;
    if (sortConfig.direction === "asc")
      return <FaSortUp className="text-primary ms-1" size={12} />;
    return <FaSortDown className="text-primary ms-1" size={12} />;
  };

  // --- States for Modal Actions ---
  const [delData, setdelData] = useState();
  const [statusdata, setstatusdata] = useState("");
  const [reason, setreason] = useState("");
  const [excelLoading, setExeclLoading] = useState(false);

  // Helper function to calculate order summary
  const calculateOrderSummary = (order) => {
    if (!order) {
      return {
        subtotal: 0,
        tax: 0,
        deliveryCharge: 0,
        gateDeliveryCharge: 0,
        deliveryType: "",
        cutlery: 0,
        preorderDiscount: 0,
        walletDiscount: 0,
        couponDiscount: 0,
        totalDiscounts: 0,
        amountBeforeDiscounts: 0,
        finalAmount: 0,
      };
    }

    const subtotal =
      order?.allProduct?.reduce((sum, item) => {
        return sum + (parseFloat(item?.totalPrice) || 0);
      }, 0) ||
      parseFloat(order?.allTotal) ||
      0;

    const tax = parseFloat(order?.tax) || 0;
    const deliveryCharge = parseFloat(order?.deliveryCharge) || 0;
    const gateDeliveryCharge = parseFloat(order?.gateDeliveryCharge) || 0;

    const deliveryTypeValue = (order?.deliveryType);
    const isGateDelivery = deliveryTypeValue === "gate";
    const deliveryType = isGateDelivery ? "gate" : "door";

    const cutlery = parseFloat(order?.Cutlery) || 0;
    const preorderDiscount = parseFloat(order?.preorderDiscount) || 0;
    const walletDiscount = parseFloat(order?.discountWallet) || 0;
    const couponDiscount = parseFloat(order?.coupon) || 0;

    const totalDiscounts = preorderDiscount + walletDiscount + couponDiscount;
    const amountBeforeDiscounts = subtotal;

    let finalAmount = 0;
    if (deliveryType === "gate") {
      finalAmount = subtotal - gateDeliveryCharge - totalDiscounts;
    } else {
      finalAmount = subtotal + deliveryCharge - totalDiscounts;
    }

    return {
      subtotal,
      tax,
      deliveryCharge,
      gateDeliveryCharge,
      deliveryType,
      cutlery,
      preorderDiscount,
      walletDiscount,
      couponDiscount,
      totalDiscounts,
      amountBeforeDiscounts,
      finalAmount,
    };
  };

  // Helper function to calculate date ranges based on filter type
  const getDateRangeForFilter = (filterType) => {
    const today = moment().startOf("day");

    switch (filterType) {
      case "today":
        return {
          startDate: today.format("YYYY-MM-DD"),
          endDate: today.format("YYYY-MM-DD"),
        };
      case "yesterday":
        const yesterday = moment().subtract(1, "days").startOf("day");
        return {
          startDate: yesterday.format("YYYY-MM-DD"),
          endDate: yesterday.format("YYYY-MM-DD"),
        };
      case "thisWeek":
        const startOfWeek = moment().startOf("week");
        const endOfWeek = moment().endOf("week");
        return {
          startDate: startOfWeek.format("YYYY-MM-DD"),
          endDate: endOfWeek.format("YYYY-MM-DD"),
        };
      case "thisMonth":
        const startOfMonth = moment().startOf("month");
        const endOfMonth = moment().endOf("month");
        return {
          startDate: startOfMonth.format("YYYY-MM-DD"),
          endDate: endOfMonth.format("YYYY-MM-DD"),
        };
      case "lastMonth":
        const startOfLastMonth = moment().subtract(1, "months").startOf("month");
        const endOfLastMonth = moment().subtract(1, "months").endOf("month");
        return {
          startDate: startOfLastMonth.format("YYYY-MM-DD"),
          endDate: endOfLastMonth.format("YYYY-MM-DD"),
        };
      case "custom":
        return {
          startDate: filters.startDate,
          endDate: filters.endDate,
        };
      case "all":
      default:
        return {
          startDate: null,
          endDate: null,
        };
    }
  };

  // Fetch corporate orders
  const getApartmentOrder = async (page = 1) => {
    setLoading(true);
    try {
      const dateRange = getDateRangeForFilter(filters.dateFilterType);

      const params = {
        page: filters.page,
        limit: pagination.pageSize,
        search: filters.search,
        dateFilterType: filters.dateFilterType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        hubId: filters.hubId,
        session: filters.session,
        status: filters.status,
        customerType: filters.customerType,
        deliveryType: filters.deliveryType,
        hasPreorderDiscount: filters.hasPreorderDiscount,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };

      // Remove undefined params
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log("Sending params to API:", params);

      const res = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/admin/getallordersfilter",
        { params }
      );

      console.log("API Response:", res.data);

      if (res.data.success) {
        setOrder(res.data.data.orders || []);
        setPagination(res.data.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          pageSize: 10,
        });
        
        if (res.data.data.orders.length === 0) {
          console.log("No orders found with current filters");
        }
      } else {
        console.error("API returned success: false", res.data);
        setOrder([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrder([]);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch orders",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Hubs
  const getHubs = async () => {
    try {
      const res = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/Hub/hubs"
      );
      setHubs(res.data);
    } catch (error) {
      console.error("Failed to fetch hubs:", error);
    }
  };

  // --- useEffects ---
  useEffect(() => {
    getHubs();
  }, []);

  useEffect(() => {
    getApartmentOrder();
  }, [filters, sortConfig]);

  // --- Filter Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = ({ selected }) => {
    setFilters((prev) => ({ ...prev, page: selected + 1 }));
    window.scrollTo(0, 0);
  };

  const clearFilters = () => {
    setFilters({
      dateFilterType: "today",
      startDate: moment().format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
      hubId: "",
      session: "All",
      status: "",
      search: "",
      customerType: "",
      deliveryType: "",
      hasPreorderDiscount: "",
      page: 1,
    });
    setSortConfig({ key: "createdAt", direction: "desc" });
  };

  // --- Original Functions ---
  const deleteBooking = async (data) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this booking permanently. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          let res = await axios.delete(
            `https://dd-backend-3nm0.onrender.com/api/admin/deletefoodorder/${data}`
          );
          if (res) {
            Swal.fire("Success", "Booking deleted", "success");
            handleClose4();
            getApartmentOrder();
          }
        } catch (error) {
          setLoading(false);
          Swal.fire("Error", "Failed to delete", "error");
        }
      }
    });
  };

  const changestatus = async (item) => {
    if (!statusdata) return Swal.fire("Info", "Please select a status", "info");
    setLoading(true);
    try {
      const config = {
        url: "/admin/updateOrderStatus/" + item._id,
        method: "put",
        baseURL: "https://dd-backend-3nm0.onrender.com/api",
        headers: { "Content-Type": "application/json" },
        data: { newStatus: statusdata },
      };
      const res = await axios(config);
      if (res.status === 200) {
        handleClose3();
        getApartmentOrder();
        Swal.fire("Success", "Order status updated", "success");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  // Export Excel
  const handleExportExcel = async () => {
    setExeclLoading(true);
    try {
      const dateRange = getDateRangeForFilter(filters.dateFilterType);

      const params = {
        page: 1,
        limit: 50000,
        orderType: "corporate",
        search: filters.search,
        dateFilterType: filters.dateFilterType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        hubId: filters.hubId,
        session: filters.session,
        status: filters.status,
        customerType: filters.customerType,
        deliveryType: filters.deliveryType,
        hasPreorderDiscount: filters.hasPreorderDiscount,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };

      const res = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/admin/getallordersfilter",
        { params }
      );

      if (res.data.success) {
        const dataToExport = res.data.data.orders.map((item, index) => {
          const summary = calculateOrderSummary(item);
          return {
            "Sl.No": index + 1,
            "Delivery Date": moment(item?.deliveryDate).format("DD-MM-YYYY"),
            Session: item?.session || "N/A",
            "Placed On": moment(item?.createdAt).format("DD-MM-YYYY h:mm A"),
            "Order ID": item?.orderid,
            "Customer Name": item?.username,
            "Customer Type": item?.customerType || "N/A",
            "Student Details": `${item?.studentName || ""} | Class: ${item?.studentClass || ""} | Section: ${item?.studentSection || ""}`,
            "Hub Name": item?.hubName || "N/A",
            "Delivery Location": item?.delivarylocation || "N/A",
            Category: item?.allProduct
              ?.map((p) => p.foodItemId?.foodcategory)
              .join(", "),
            Product: item?.allProduct
              ?.map((p) => `${p.foodItemId?.foodname} - ${p.quantity} Qty`)
              .join("\n"),
            Cutlery: item?.Cutlery > 0 ? "Yes" : "No",
            Unit: item?.allProduct?.map((p) => p.foodItemId?.unit).join(", "),
            Phone: item?.Mobilenumber,
            Corporate: item?.customerType,
            "Address Type": item?.addressType,
            "Payment Method": item?.paymentmethod,
            "Delivery Type": summary.deliveryType === "gate" ? "Gate" : "Door",
            "Delivery Charge": summary.deliveryType === "gate" 
              ? `-₹${summary.gateDeliveryCharge.toFixed(2)}` 
              : summary.deliveryCharge > 0 
                ? `+₹${summary.deliveryCharge.toFixed(2)}` 
                : "Free",
            "Pickup Point Name": item?.selectedPickupPoint?.name || "N/A",
            "Pickup Point Location": item?.selectedPickupPoint?.location || "N/A",
            "Pickup Point Time": item?.selectedPickupPoint?.startTime && item?.selectedPickupPoint?.endTime
              ? `${item.selectedPickupPoint.startTime} - ${item.selectedPickupPoint.endTime}`
              : "N/A",
            Tax: item?.tax?.toFixed(2),
            "Subtotal (Before Discounts)": summary.amountBeforeDiscounts,
            "Preorder Discount": summary.preorderDiscount,
            "Has Preorder Discount": summary.preorderDiscount > 0 ? "Yes" : "No",
            "Wallet Applied Amount": summary.walletDiscount,
            "Coupon Discount": summary.couponDiscount,
            "Total Discounts": summary.totalDiscounts,
            "Final Amount": summary.finalAmount,
            "Total Paid": summary.finalAmount,
            Status: item?.status,
          };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CorporateOrders");
        XLSX.writeFile(
          workbook,
          `Corporate_Bookings_${moment().format("DDMMYYYY_HHmm")}.xlsx`
        );
        Swal.fire("Success", "Excel exported successfully!", "success");
      }
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire("Error", "Export failed", "error");
    } finally {
      setExeclLoading(false);
    }
  };

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

  // Render Status Badge
  const renderStatusBadge = (status) => {
    const statusColors = {
      Pending: "warning",
      Confirmed: "info",
      Cooking: "primary",
      Packed: "secondary",
      "On the way": "warning",
      Delivered: "success",
      Cancelled: "danger",
    };
    return <Badge bg={statusColors[status] || "secondary"}>{status}</Badge>;
  };

  // Pagination CSS styles
  const paginationStyles = `
    .pagination {
      margin-bottom: 0;
    }
    .pagination .page-item.active .page-link {
      background-color: #0d6efd;
      border-color: #0d6efd;
      color: white;
    }
    .pagination .page-link {
      color: #0d6efd;
      border: 1px solid #dee2e6;
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }
    .pagination .page-link:hover {
      background-color: #e9ecef;
    }
    .pagination .page-item.disabled .page-link {
      color: #6c757d;
      pointer-events: none;
      background-color: #f8f9fa;
    }
  `;

  return (
    <div className="p-3" style={{ minHeight: "80vh" }}>
      <style>{paginationStyles}</style>

      {/* Filter Card */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-4">
          <h5 className="mb-4 text-primary fw-bold">
            <i className="fas fa-filter me-2"></i>
            Filter Orders
          </h5>

          <Row className="g-3 align-items-end mb-3">
            <Col md={3}>
              <Form.Label className="fw-bold small">Time Period</Form.Label>
              <Form.Select
                name="dateFilterType"
                value={filters.dateFilterType}
                onChange={handleFilterChange}
                className="shadow-sm border-primary"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Date Range</option>
                <option value="all">All Time</option>
              </Form.Select>
            </Col>

            {filters.dateFilterType === "custom" && (
              <>
                <Col md={3}>
                  <Form.Label className="fw-bold small">Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="shadow-sm"
                  />
                </Col>
                <Col md={3}>
                  <Form.Label className="fw-bold small">End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="shadow-sm"
                    min={filters.startDate}
                  />
                </Col>
              </>
            )}

            <Col md={filters.dateFilterType === "custom" ? 3 : 2}>
              <Form.Label className="fw-bold small">Session</Form.Label>
              <Form.Select
                name="session"
                value={filters.session}
                onChange={handleFilterChange}
                className="shadow-sm"
              >
                <option value="All">All Sessions</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="g-3 align-items-end mb-3">
            <Col md={3}>
              <Form.Label className="fw-bold small">Hub</Form.Label>
              <Form.Select
                name="hubId"
                value={filters.hubId}
                onChange={handleFilterChange}
                className="shadow-sm"
              >
                <option value="">All Hubs</option>
                {hubs?.map((hub) => (
                  <option key={hub._id} value={hub._id}>
                    {hub?.hubName}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label className="fw-bold small">Status</Form.Label>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="shadow-sm"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cooking">Cooking</option>
                <option value="Packing">Packing</option>
                <option value="Packed">Packed</option>
                <option value="On the way">On the way</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label className="fw-bold small">Customer Type</Form.Label>
              <Form.Select
                name="customerType"
                value={filters.customerType}
                onChange={handleFilterChange}
                className="shadow-sm"
              >
                <option value="">All Customers</option>
                <option value="Normal">Normal</option>
                <option value="Employee">Employee</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label className="fw-bold small">Delivery Type</Form.Label>
              <Form.Select
                name="deliveryType"
                value={filters.deliveryType}
                onChange={handleFilterChange}
                className="shadow-sm"
              >
                <option value="">All Delivery Types</option>
                <option value="door">Door Delivery</option>
                <option value="gate">Gate Delivery</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="g-3 align-items-end mb-3">
            <Col md={3}>
              <Form.Label className="fw-bold small">Preorder Discount</Form.Label>
              <Form.Select
                name="hasPreorderDiscount"
                value={filters.hasPreorderDiscount}
                onChange={handleFilterChange}
                className="shadow-sm"
              >
                <option value="">All Orders</option>
                <option value="true">Has Preorder Discount</option>
                <option value="false">No Preorder Discount</option>
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label className="fw-bold small">Search</Form.Label>
              <InputGroup className="shadow-sm">
                <InputGroup.Text className="bg-light">
                  <BsSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by Order ID, Customer Name, or Phone"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </InputGroup>
            </Col>

            <Col md={3}>
              <Button
                variant="outline-danger"
                onClick={clearFilters}
                className="w-100 fw-bold"
              >
                <i className="fas fa-redo me-1"></i> Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Content */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="p-3 border-bottom bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0 text-primary fw-bold">
                  <i className="fas fa-building me-2"></i>
                  Corporate Bookings
                </h4>
                <p className="text-muted mb-0 small">
                  Total Orders:{" "}
                  <span className="fw-bold">{pagination?.totalCount || 0}</span>
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="success"
                  onClick={handleExportExcel}
                  disabled={excelLoading || order.length === 0}
                  className="d-flex align-items-center"
                >
                  {excelLoading ? (
                    <Spinner size="sm" className="me-2" />
                  ) : (
                    <FaFileExcel className="me-2" />
                  )}
                  Export Excel
                </Button>
              </div>
            </div>
          </div>

          <div
            className="table-responsive"
            style={{ maxHeight: "60vh", overflowY: "auto" }}
          >
            <Table hover className="mb-0">
              <thead className="bg-light sticky-top" style={{ top: 0 }}>
                <tr>
                  <th>S.No</th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Placed On {renderSortIcon("createdAt")}
                  </th>
                  <th
                    onClick={() => handleSort("deliveryDate")}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Delivery Date {renderSortIcon("deliveryDate")}
                  </th>
                  <th
                    onClick={() => handleSort("session")}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Session {renderSortIcon("session")}
                  </th>
                  <th
                    onClick={() => handleSort("orderid")}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Order ID {renderSortIcon("orderid")}
                  </th>
                  <th>Customer</th>
                  <th>Customer Type</th>
                  <th>Student Details</th>
                  <th>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Delivery Location</Tooltip>}
                    >
                      <span>
                        <FaMapMarkerAlt className="me-1" size={12} /> Location
                      </span>
                    </OverlayTrigger>
                  </th>
                  <th>Pickup Point</th>
                  <th style={{ whiteSpace: "nowrap" }}>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Before discounts & tax</Tooltip>}
                    >
                      <span>
                        Subtotal{" "}
                        <AiOutlineInfoCircle className="ms-1" size={12} />
                      </span>
                    </OverlayTrigger>
                  </th>
                  <th style={{ whiteSpace: "nowrap" }}>Preorder Discount</th>
                  <th style={{ whiteSpace: "nowrap" }}>Wallet Applied</th>
                  <th style={{ whiteSpace: "nowrap" }}>Coupon Discount</th>
                  <th style={{ whiteSpace: "nowrap" }}>Delivery Charge</th>
                  <th style={{ whiteSpace: "nowrap" }}>Delivery Type</th>
                  <th style={{ whiteSpace: "nowrap" }}>Total Discounts</th>
                  <th style={{ whiteSpace: "nowrap" }}>Tax Applied</th>
                  <th style={{ whiteSpace: "nowrap" }}>Final Amount</th>
                  <th style={{ whiteSpace: "nowrap" }}>Total Paid</th>
                  <th
                    onClick={() => handleSort("status")}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Status {renderSortIcon("status")}
                  </th>
                  <th>Hub</th>
                  <th>Products</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={27} className="text-center py-5">
                      <Spinner
                        animation="border"
                        variant="primary"
                        className="me-2"
                      />
                      Loading orders...
                    </td>
                  </tr>
                ) : order.length === 0 ? (
                  <tr>
                    <td colSpan={27} className="text-center py-5">
                      <div className="text-muted">
                        <i className="fas fa-inbox fa-2x mb-3"></i>
                        <p>No orders found</p>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  order.map((items, i) => {
                    const serialNumber =
                      (pagination.currentPage - 1) * pagination.pageSize +
                      i +
                      1;
                    const summary = calculateOrderSummary(items);
                    const hasPickupPoint = items?.selectedPickupPoint && 
                      (items.selectedPickupPoint.name || items.selectedPickupPoint.location);

                    return (
                      <tr key={items._id} className="align-middle">
                        <td className="fw-bold">{serialNumber}</td>
                        <td>
                          <small className="text-muted d-block">Date:</small>
                          {moment(items?.createdAt).format("DD-MM-YYYY")}
                          <br />
                          <small className="text-muted d-block">Time:</small>
                          {moment(items?.createdAt).format("h:mm A")}
                        </td>
                        <td>
                          {items?.deliveryDate
                            ? moment(items.deliveryDate).format("DD-MM-YYYY")
                            : "N/A"}
                        </td>
                        <td>
                          <Badge
                            bg={
                              items?.session === "Lunch" ? "warning" : "info"
                            }
                          >
                            {items?.session || "N/A"}
                          </Badge>
                        </td>
                        <td>
                          <code className="bg-light p-1 rounded">
                            {items?.orderid}
                          </code>
                        </td>
                        <td>
                          <div className="fw-bold">{items?.username}</div>
                          <div className="d-flex flex-column ">
                            <small className="text-muted">
                              {items?.Mobilenumber}
                            </small>
                          </div>
                        </td>
                        <td>
                          <Badge
                            bg={items?.customerType === "Employee" ? "success" : "secondary"}
                          >
                            {items?.customerType || "N/A"}
                          </Badge>
                        </td>
                        <td>
                          {items?.studentName ? (
                            <>
                              <div>
                                <strong>{items.studentName}</strong>
                              </div>
                              <small>
                                Class {items.studentClass}, Sec{" "}
                                {items.studentSection}
                              </small>
                            </>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt
                              className="me-1 text-primary"
                              size={12}
                            />
                            <div>
                              <div
                                className="small text-truncate"
                                style={{ maxWidth: "150px" }}
                              >
                                {items?.delivarylocation || "N/A"}
                              </div>
                              {items?.addressline && (
                                <div
                                  className="text-muted smaller"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {items.addressline}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {hasPickupPoint ? (
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleShowPickupModal(items.selectedPickupPoint)}
                              className="d-flex align-items-center gap-1"
                            >
                              <BsGeoAlt size={12} />
                              <span>{items.selectedPickupPoint.name || "View Point"}</span>
                            </Button>
                          ) : (
                            <Badge bg="secondary">No Pickup Point</Badge>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="text-success fw-bold">
                            ₹{summary.amountBeforeDiscounts.toFixed(2)}
                          </div>
                        </td>
                        <td className="text-end">
                          {summary.preorderDiscount > 0 ? (
                            <div>
                              <span className="text-danger fw-bold">
                                -₹{summary.preorderDiscount.toFixed(2)}
                              </span>
                              <Badge bg="success" className="ms-1">Applied</Badge>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="text-end">
                          {summary.walletDiscount > 0 ? (
                            <span className="text-danger fw-bold">
                              -₹{summary.walletDiscount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="text-end">
                          {summary.couponDiscount > 0 ? (
                            <span className="text-danger fw-bold">
                              -₹{summary.couponDiscount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="text-end">
                          {summary.deliveryType === "gate" ? (
                            <span className="text-success fw-bold">
                              -₹{summary.gateDeliveryCharge.toFixed(2)}
                            </span>
                          ) : summary.deliveryCharge > 0 ? (
                            <span className="text-danger fw-bold">
                              +₹{summary.deliveryCharge.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-success">Free</span>
                          )}
                        </td>
                        <td className="text-center">
                          {summary.deliveryType === "gate" ? (
                            <div>
                              <Badge bg="success" className="d-block mb-1">
                                Gate
                              </Badge>
                              <small className="text-success fw-bold">
                                Rebate: -₹{summary.gateDeliveryCharge.toFixed(2)}
                              </small>
                            </div>
                          ) : (
                            <div>
                              <Badge bg="primary" className="d-block mb-1">
                                Door
                              </Badge>
                              {summary.deliveryCharge > 0 ? (
                                <small className="text-danger fw-bold">
                                  Charge: +₹{summary.deliveryCharge.toFixed(2)}
                                </small>
                              ) : (
                                <small className="text-success">
                                  Free Delivery
                                </small>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="text-end">
                          {summary.totalDiscounts > 0 ? (
                            <div className="fw-bold text-danger">
                              -₹{summary.totalDiscounts.toFixed(2)}
                            </div>
                          ) : (
                            <span className="text-muted">No discounts</span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="fw-bold text-danger">
                            -₹ {summary?.tax ? summary.tax.toFixed(2) : "0.00"}
                          </div>
                        </td>
                        <td className="text-end">
                          <div className="fw-bold fs-6 text-primary">
                            ₹{summary.finalAmount.toFixed(2)}
                          </div>
                        </td>
                        <td className="text-end">
                          <div className="fw-bold fs-6 text-primary">
                            ₹{summary.finalAmount.toFixed(2)}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            {renderStatusBadge(items?.status)}
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleShow3(items)}
                              className="mt-1"
                            >
                              Change
                            </Button>
                          </div>
                        </td>
                        <td>{items?.hubName || "N/A"}</td>
                        <td style={{ maxWidth: "200px" }}>
                          <div className="small">
                            {items?.allProduct
                              ?.slice(0, 2)
                              .map((item, idx) => (
                                <div key={idx} className="mb-1">
                                  {item?.foodItemId?.foodname} ×{" "}
                                  {item?.quantity}
                                </div>
                              ))}
                            {items?.allProduct?.length > 2 && (
                              <Badge bg="secondary" className="ms-1">
                                +{items.allProduct.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge
                            bg={
                              items?.paymentmethod === "Online"
                                ? "success"
                                : "warning"
                            }
                          >
                            {items?.paymentmethod}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleShow(items)}
                              className="d-flex align-items-center justify-content-center"
                            >
                              <IoIosEye className="me-1" /> View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() =>
                                navigate("/thermalinvoice", {
                                  state: { item: items },
                                })
                              }
                            >
                              <i className="fas fa-print me-1"></i> Print
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => {
                                setdelData(items._id);
                                handleShow4();
                              }}
                            >
                              <AiFillDelete /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-3 border-top bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">
                  Showing{" "}
                  <span className="fw-bold">
                    {(pagination.currentPage - 1) * pagination.pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="fw-bold">
                    {Math.min(
                      pagination.currentPage * pagination.pageSize,
                      pagination.totalCount
                    )}
                  </span>{" "}
                  of <span className="fw-bold">{pagination.totalCount}</span>{" "}
                  orders
                </div>
                <div>
                  <ReactPaginate
                    previousLabel={
                      <span>
                        <i className="fas fa-chevron-left me-1"></i> Previous
                      </span>
                    }
                    nextLabel={
                      <span>
                        Next <i className="fas fa-chevron-right ms-1"></i>
                      </span>
                    }
                    breakLabel={<span className="mx-1">...</span>}
                    pageCount={pagination.totalPages}
                    onPageChange={handlePageChange}
                    forcePage={pagination.currentPage - 1}
                    containerClassName={"pagination mb-0"}
                    pageClassName={"page-item"}
                    pageLinkClassName={"page-link"}
                    previousClassName={"page-item"}
                    previousLinkClassName={"page-link"}
                    nextClassName={"page-item"}
                    nextLinkClassName={"page-link"}
                    breakClassName={"page-item"}
                    breakLinkClassName={"page-link"}
                    activeClassName={"active"}
                    disabledClassName={"disabled"}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    renderOnZeroPageCount={null}
                  />
                </div>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Pickup Point Details Modal */}
      <Modal
        show={showPickupModal}
        onHide={handleClosePickupModal}
        size="md"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>
            <BsGeoAlt className="me-2" /> Pickup Point Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedPickupPoint ? (
            <div>
              {/* Pickup Point Name */}
              <div className="mb-4 p-3 bg-light rounded">
                <div className="d-flex align-items-center mb-2">
                  <FaMapMarkerAlt className="text-info me-2" size={20} />
                  <h5 className="mb-0 fw-bold">{selectedPickupPoint.name || "N/A"}</h5>
                </div>
              </div>

              {/* Location */}
              <div className="mb-3">
                <div className="d-flex align-items-start">
                  <div className="text-muted me-3" style={{ minWidth: "100px" }}>
                    <strong>📍 Location:</strong>
                  </div>
                  <div className="flex-grow-1">
                    {selectedPickupPoint.location || "N/A"}
                  </div>
                </div>
              </div>

              {/* Contact Number */}
              <div className="mb-3">
                <div className="d-flex align-items-start">
                  <div className="text-muted me-3" style={{ minWidth: "100px" }}>
                    <strong>📞 Contact:</strong>
                  </div>
                  <div className="flex-grow-1">
                    {selectedPickupPoint.contactNumber ? (
                      <a href={`tel:${selectedPickupPoint.contactNumber}`} className="text-decoration-none">
                        {selectedPickupPoint.contactNumber}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              </div>

              {/* Session */}
              <div className="mb-3">
                <div className="d-flex align-items-start">
                  <div className="text-muted me-3" style={{ minWidth: "100px" }}>
                    <strong>🍽️ Session:</strong>
                  </div>
                  <div className="flex-grow-1">
                    <Badge bg={selectedPickupPoint.session === "Breakfast" ? "warning" : 
                               selectedPickupPoint.session === "Lunch" ? "info" : "danger"}>
                      {selectedPickupPoint.session || "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Time Slot */}
              <div className="mb-3">
                <div className="d-flex align-items-start">
                  <div className="text-muted me-3" style={{ minWidth: "100px" }}>
                    <strong>⏰ Time Slot:</strong>
                  </div>
                  <div className="flex-grow-1">
                    {selectedPickupPoint.startTime && selectedPickupPoint.endTime ? (
                      <div>
                        <span className="fw-bold">{selectedPickupPoint.startTime}</span>
                        {" - "}
                        <span className="fw-bold">{selectedPickupPoint.endTime}</span>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr className="my-3" />
            
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="fas fa-info-circle fa-2x mb-2"></i>
              <p>No pickup point information available</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={handleClosePickupModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal
        show={show4}
        onHide={handleClose4}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-4">
            <i className="fas fa-trash-alt fa-3x text-danger mb-3"></i>
            <h5>Are you sure you want to delete this booking?</h5>
            <p className="text-muted">
              This action cannot be undone. All order data will be permanently
              removed.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={handleClose4}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteBooking(delData)}
            className="d-flex align-items-center"
          >
            <AiFillDelete className="me-2" /> Delete Permanently
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Invoice/Details Modal */}
      <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="fas fa-file-invoice me-2"></i>
            Order Details - {data?.orderid || "N/A"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {data && (
            <>
              {/* Pickup Point Section - Add this in the modal as well */}
              {data?.selectedPickupPoint && (data.selectedPickupPoint.name || data.selectedPickupPoint.location) && (
                <Card className="mb-4 border-0 shadow-sm bg-info bg-opacity-10">
                  <Card.Body>
                    <h6 className="fw-bold mb-3 text-info">
                      <BsGeoAlt className="me-2" />
                      Pickup Point Details
                    </h6>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>📍 Name:</strong> {data.selectedPickupPoint.name || "N/A"}
                        </div>
                        <div className="mb-2">
                          <strong>📍 Location:</strong> {data.selectedPickupPoint.location || "N/A"}
                        </div>
                        <div className="mb-2">
                          <strong>📞 Contact:</strong> {data.selectedPickupPoint.contactNumber || "N/A"}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>🍽️ Session:</strong>{" "}
                          <Badge bg={data.selectedPickupPoint.session === "Breakfast" ? "warning" : 
                                     data.selectedPickupPoint.session === "Lunch" ? "info" : "danger"}>
                            {data.selectedPickupPoint.session || "N/A"}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <strong>⏰ Time Slot:</strong>{" "}
                          {data.selectedPickupPoint.startTime && data.selectedPickupPoint.endTime
                            ? `${data.selectedPickupPoint.startTime} - ${data.selectedPickupPoint.endTime}`
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Order Summary */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="fas fa-shopping-basket me-2"></i>
                    Order Summary ({data?.allProduct?.length || 0} Items)
                  </h6>
                  <div className="row">
                    {data?.allProduct?.map((Item, idx) => (
                      <div className="col-12 mb-2" key={Item?._id || idx}>
                        <div className="d-flex align-items-center p-2 border rounded">
                          {Item?.foodItemId?.Foodgallery?.[0]?.image2 && (
                            <div className="me-3">
                              <Image
                                src={Item.foodItemId.Foodgallery[0].image2}
                                alt={Item?.foodItemId?.foodname}
                                rounded
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-grow-1">
                            <div className="fw-bold">
                              {Item?.foodItemId?.foodname || "Item"}
                            </div>
                            <div className="small text-muted">
                              {Item?.foodItemId?.foodcategory || ""} •{" "}
                              {Item?.foodItemId?.unit || ""}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">
                              ₹{" "}
                              {(
                                Item?.totalPrice / (Item?.quantity || 1)
                              ).toFixed(2)}
                            </div>
                            <div className="small">× {Item?.quantity || 1}</div>
                          </div>
                          <div className="ms-4 text-end">
                            <div className="fw-bold text-success">
                              ₹ {(Item?.totalPrice || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              {/* Bill Details */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="fas fa-receipt me-2"></i>
                    Bill Details
                  </h6>
                  {(() => {
                    const summary = calculateOrderSummary(data);
                    return (
                      <div className="row">
                        <div className="col-8">
                          <div className="mb-2">
                            Item Total (Before Discounts)
                          </div>
                          <div className="mb-2">
                            Tax ({data?.taxPercentage || 5}%)
                          </div>
                          {(data?.Cutlery || 0) > 0 && (
                            <div className="mb-2">Cutlery</div>
                          )}
                          {summary.deliveryType === "gate" && (
                            <div className="mb-2 text-success">
                              Gate Delivery Rebate{" "}
                              <Badge bg="success" className="ms-1">
                                Gate
                              </Badge>
                            </div>
                          )}
                          {summary.deliveryType === "door" && summary.deliveryCharge > 0 && (
                            <div className="mb-2">
                              Door Delivery Charge{" "}
                              <Badge bg="primary" className="ms-1">
                                Door
                              </Badge>
                            </div>
                          )}
                          {summary.deliveryType === "door" && summary.deliveryCharge === 0 && (
                            <div className="mb-2 text-success">
                              Free Delivery{" "}
                              <Badge bg="primary" className="ms-1">
                                Door
                              </Badge>
                            </div>
                          )}
                          {summary.preorderDiscount > 0 && (
                            <div className="mb-2">Preorder Discount</div>
                          )}
                          {summary.couponDiscount > 0 && (
                            <div className="mb-2">Coupon Discount</div>
                          )}
                          {summary.walletDiscount > 0 && (
                            <div className="mb-2">Wallet Applied</div>
                          )}
                          <hr />
                          <div className="fw-bold">Grand Total</div>
                        </div>
                        <div className="col-4 text-end">
                          <div className="mb-2">
                            ₹ {summary.amountBeforeDiscounts.toFixed(2)}
                          </div>
                          <div className="mb-2">
                            ₹ {summary.tax.toFixed(2)}
                          </div>
                          {(data?.Cutlery || 0) > 0 && (
                            <div className="mb-2">₹ {data.Cutlery}</div>
                          )}
                          {summary.deliveryType === "gate" && (
                            <div className="mb-2 text-success fw-bold">
                              - ₹ {summary.gateDeliveryCharge.toFixed(2)}
                            </div>
                          )}
                          {summary.deliveryType === "door" && summary.deliveryCharge > 0 && (
                            <div className="mb-2 text-danger fw-bold">
                              + ₹ {summary.deliveryCharge.toFixed(2)}
                            </div>
                          )}
                          {summary.deliveryType === "door" && summary.deliveryCharge === 0 && (
                            <div className="mb-2 text-success fw-bold">
                              ₹ 0.00
                            </div>
                          )}
                          {summary.preorderDiscount > 0 && (
                            <div className="mb-2 text-danger">
                              - ₹ {summary.preorderDiscount.toFixed(2)}
                            </div>
                          )}
                          {summary.couponDiscount > 0 && (
                            <div className="mb-2 text-danger">
                              - ₹ {summary.couponDiscount.toFixed(2)}
                            </div>
                          )}
                          {summary.walletDiscount > 0 && (
                            <div className="mb-2 text-danger">
                              - ₹ {summary.walletDiscount.toFixed(2)}
                            </div>
                          )}
                          <hr />
                          <div className="fw-bold fs-5 text-success">
                            ₹ {summary.finalAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </Card.Body>
              </Card>

              {/* Delivery Location */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Delivery Location
                  </h6>
                  <div className="p-3 border rounded">
                    <div className="d-flex align-items-start">
                      <FaMapMarkerAlt className="me-2 text-primary mt-1" />
                      <div>
                        <div className="fw-bold">
                          {data?.delivarylocation || "Location not specified"}
                        </div>
                        {data?.addressline && (
                          <div className="text-muted mt-1">
                            {data.addressline}
                          </div>
                        )}
                        {data?.addressType && (
                          <Badge bg="info" className="mt-2">
                            {data.addressType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Customer Feedback */}
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="fas fa-comment-alt me-2"></i>
                    Customer Feedback
                  </h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="p-3 border rounded">
                        <h6 className="fw-bold">Food Rating</h6>
                        {data?.ratings?.order?.rating ? (
                          <>
                            <div className="mb-2">
                              {renderStars(data.ratings.order.rating)}
                              <span className="ms-2 badge bg-success">
                                {data.ratings.order.rating}/5
                              </span>
                            </div>
                            <p className="mb-0 text-muted">
                              "
                              {data.ratings.order.comment ||
                                "No comment provided."}
                              "
                            </p>
                          </>
                        ) : (
                          <div className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            {data?.ratings?.order?.status === "skipped"
                              ? "Skipped by user"
                              : "Pending / Not Rated"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="p-3 border rounded">
                        <h6 className="fw-bold">Delivery Rating</h6>
                        {data?.ratings?.delivery?.rating ? (
                          <>
                            <div className="mb-2">
                              {renderStars(data.ratings.delivery.rating)}
                              <span className="ms-2 badge bg-primary">
                                {data.ratings.delivery.rating}/5
                              </span>
                            </div>
                            <p className="mb-0 text-muted">
                              "
                              {data.ratings.delivery.comment ||
                                "No comment provided."}
                              "
                            </p>
                          </>
                        ) : (
                          <div className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            {data?.ratings?.delivery?.status === "skipped"
                              ? "Skipped by user"
                              : "Pending / Not Rated"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              navigate("/AdminInvoice", { state: { item: data } })
            }
            disabled={!data}
          >
            <i className="fas fa-file-invoice me-2"></i>
            View Full Invoice
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        show={show3}
        onHide={handleClose3}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <i className="fas fa-exchange-alt me-2"></i>
            Update Order Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Form.Label className="fw-bold">Select New Status</Form.Label>
            <Form.Select
              name="status"
              id="status"
              onChange={(e) => setstatusdata(e.target.value)}
              value={statusdata}
              className="border-primary"
              size="lg"
            >
              <option value="" disabled>
                Select Status
              </option>
              <option value="Cooking">Cooking</option>
              <option value="Packing">Packing</option>
              <option value="Packed">Packed</option>
              <option value="On the way">On the way</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </div>
          <div className="alert alert-info small">
            <i className="fas fa-info-circle me-2"></i>
            Current order: <strong>{dataa?.orderid}</strong>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={handleClose3}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => changestatus(dataa)}
            disabled={!statusdata}
          >
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CorporateBookings;