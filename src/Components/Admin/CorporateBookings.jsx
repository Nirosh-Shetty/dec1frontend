// import React, { useState, useEffect, useMemo, useRef } from "react";
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
//   ButtonGroup,
// } from "react-bootstrap";
// import { AiFillDelete } from "react-icons/ai";
// import { BsSearch } from "react-icons/bs";
// import "../Admin/Admin.css";
// import { IoIosEye } from "react-icons/io";
// import axios from "axios";
// import * as XLSX from "xlsx";
// import moment from "moment";
// import { useNavigate } from "react-router-dom";
// import ReactPaginate from "react-paginate";
// import { FaStar, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
// import Swal from "sweetalert2";
// // import { debounce } from "lodash"; // Kept from original, but not used in new filter state

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

//   // --- NEW Filter State Management ---
//   const [filters, setFilters] = useState({
//     dateFilterType: "today",
//     startDate: null,
//     endDate: null,
//     hubId: "",
//     session: "All",
//     status: "",
//     search: "",
//     page: 1,
//   });
//   const [sortConfig, setSortConfig] = useState({
//     key: "createdAt", // Default sort by Placed On
//     direction: "desc", // Default Newest First
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
//   const [markloder, setmarkloader] = useState(false);
//   const [statusdata, setstatusdata] = useState("");
//   const [reason, setreason] = useState("");
//   const [excelLoading, setExeclLoading] = useState(false);

//   // MODIFIED: Fetches corporate orders based on new filters
//   const getApartmentOrder = async (page = 1) => {
//     setLoading(true);
//     try {
//       const params = {
//         page: filters.page,
//         limit: pagination.pageSize,
//         orderType: "corporate",
//         search: filters.search,
//         dateFilterType: filters.dateFilterType,
//         startDate: filters.startDate,
//         endDate: filters.endDate,
//         hubId: filters.hubId,
//         session: filters.session,
//         status: filters.status,
//         sortBy: sortConfig.key,
//         sortOrder: sortConfig.direction,
//       };

//       const res = await axios.get(
//         "https://dd-backend-3nm0.onrender.com/api/admin/getallordersfilter",
//         { params }
//       );

//       if (res.data.success) {
//         setOrder(res.data.data.orders);
//         setPagination(res.data.data.pagination);
//         // REMOVED: setAllTimesSlote and setLocations
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log(error);
//       setOrder([]);
//       Swal.fire({
//         title: "Error",
//         text: "Failed to fetch orders",
//         icon: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch Hubs (from original)
//   const getHubs = async () => {
//     try {
//       const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/Hub/hubs");
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
//   }, [filters, sortConfig]); // Re-fetch orders when any filter changes

//   // --- Filter Handlers ---
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
//   };

//   const handleDateFilterChange = (type) => {
//     setFilters((prev) => ({ ...prev, dateFilterType: type, page: 1 }));
//   };

//   const handlePageChange = ({ selected }) => {
//     setFilters((prev) => ({ ...prev, page: selected + 1 }));
//   };

//   const clearFilters = () => {
//     setFilters({
//       dateFilterType: "today",
//       hubId: "",
//       session: "All",
//       status: "",
//       search: "",
//       page: 1,
//     });
//   };

//   // --- Original Functions (Kept as requested) ---
//   const deleteBooking = async (data) => {
//     // ... (Your existing function)
//     try {
//       setLoading(true);
//       let res = await axios.delete(
//         `https://dd-backend-3nm0.onrender.com/api/admin/deletefoodorder/${data}`
//       );
//       if (res) {
//         Swal.fire("Success", "Booking deleted", "success");
//         handleClose4();
//         getApartmentOrder(); // Refresh
//       }
//     } catch (error) {
//       setLoading(false);
//       Swal.fire("Error", "Failed to delete", "error");
//     }
//   };

//   const changestatus = async (item) => {
//     // ... (Your existing function)
//     if (!statusdata) return alert("Please select a status");
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
//         getApartmentOrder(); // Refresh
//         Swal.fire("Success", "Order status updated", "success");
//       }
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//       Swal.fire("Error", "Failed to update status", "error");
//     }
//   };

//   // WARNING: This function is kept, but will fail
//   // It depends on filters (slot, locations) that have been removed.
//   const updateSelectedMarks = async () => {
//     if (!filters.slot) {
//       // This will now always fail
//       return Swal.fire("Info", "Please select slot", "info");
//     }
//     if (!filters.locations.length) {
//       // This will now always fail
//       return Swal.fire("Info", "Please select location", "info");
//     }
//     if (!filters.status) {
//       return Swal.fire("Info", "Please select order status", "info");
//     }
//     // ... (rest of your function)
//     setmarkloader(true);
//     try {
//       const config = {
//         url: "/admin/updateMultipleOrderStatus",
//         method: "put",
//         baseURL: "https://dd-backend-3nm0.onrender.com/api",
//         headers: { "Content-Type": "application/json" },
//         data: {
//           status: filters.status,
//           locations: filters.locations,
//           slot: filters.slot,
//         },
//       };
//       let res = await axios(config);
//       // ... (rest of your function)
//     } catch (error) {
//       // ... (rest of your function)
//     }
//   };

//   // Export Excel (Updated to use new filters)
//   const handleExportExcel = async () => {
//     setExeclLoading(true);
//     try {
//       const params = {
//         ...filters,
//         page: 1,
//         limit: 10000, // Fetch all for export
//         orderType: "corporate",
//       };

//       const res = await axios.get(
//         "https://dd-backend-3nm0.onrender.com/api/admin/getallordersfilter",
//         { params }
//       );

//       if (res.data.success) {
//         const dataToExport = res.data.data.orders.map((item, index) => ({
//           "Sl.No": index + 1,
//           "Delivery Date": moment(item?.deliveryDate).format("DD-MM-YYYY"),
//           Session: item?.session || "N/A",
//           "Placed On": moment(item?.createdAt).format("DD-MM-YYYY h:mm A"),
//           // "Placed Time": moment(item?.createdAt).format("h:mm A"),
//           "Order ID": item?.orderid,
//           "Customer Name": item?.username,
//           "Student Details": `${item?.studentName} | Class: ${item?.studentClass} | Section: ${item?.studentSection}`,
//           "Hub Name": item?.hubName || "N/A",
//           Category: item?.allProduct
//             ?.map((p) => p.foodItemId?.foodcategory)
//             .join(", "),
//           Product: item?.allProduct
//             ?.map((p) => `${p.foodItemId?.foodname} - ${p.quantity} Qty`)
//             .join("\n"),
//           Cutlery: item?.Cutlery > 0 ? "Yes" : "No",
//           Unit: item?.allProduct?.map((p) => p.foodItemId?.unit).join(", "),
//           Phone: item?.Mobilenumber,
//           Corporate: item?.customerType,
//           "Delivery location": item?.delivarylocation,
//           "Address Type": item?.addressType,
//           // "Delivery Method": item.deliveryMethod || "N/A",
//           "Payment Method": item?.paymentmethod,
//           "Delivery Amount": item?.deliveryCharge,
//           Tax: item?.tax?.toFixed(2),
//           "Wallet Discount": item?.discountWallet || 0,
//           "Coupon Discount": item?.coupon || 0,
//           "Total Amount": item?.allTotal,
//         }));

//         const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, "CorporateOrders");
//         XLSX.writeFile(
//           workbook,
//           `Corporate_Bookings_${moment().format("DDMMYYYY")}.xlsx`
//         );
//       }
//     } catch (error) {
//       console.error("Export error:", error);
//       alert("Export failed.");
//     } finally {
//       setExeclLoading(false);
//     }
//   };

//   const renderStars = (rating) => {
//     // ... (Your existing function, no changes)
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

//   // REMOVED: debouncedSearch useEffect

//   return (
//     <div style={{ height: "80vh", overflow: "scroll" }}>
//       <Card className="mb-3 shadow-sm">
//         <Card.Body className="p-3">
//           {/* Row 1: Date & Time Filters */}
//           <Row className="g-3 align-items-end mb-3">
//             {/* Date Filter Type (Dropdown) */}
//             <Col md={3}>
//               <Form.Label className="fw-bold small">Time Period</Form.Label>
//               <Form.Select
//                 name="dateFilterType"
//                 value={filters.dateFilterType}
//                 onChange={handleFilterChange}
//                 className="shadow-sm"
//               >
//                 <option value="today">Today</option>
//                 <option value="future">Future (Upcoming)</option>
//                 <option value="custom">Custom Date Range</option>
//                 <option value="all">All Time</option>
//               </Form.Select>
//             </Col>

//             {/* Custom Date Inputs (Only visible if 'custom' is selected) */}
//             {filters.dateFilterType === "custom" && (
//               <>
//                 <Col md={3}>
//                   <Form.Label className="fw-bold small">
//                     Start Date(Delivery Date)
//                   </Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="startDate"
//                     value={filters.startDate}
//                     onChange={handleFilterChange}
//                     className="shadow-sm"
//                   />
//                 </Col>
//                 <Col md={3}>
//                   <Form.Label className="fw-bold small">
//                     End Date (Optional)
//                   </Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="endDate"
//                     value={filters.endDate}
//                     onChange={handleFilterChange}
//                     className="shadow-sm"
//                     min={filters.startDate} // Prevent end date before start date
//                   />
//                 </Col>
//               </>
//             )}

//             {/* Session Filter */}
//             <Col md={2}>
//               <Form.Label className="fw-bold small">Session</Form.Label>
//               <Form.Select
//                 name="session"
//                 value={filters.session}
//                 onChange={handleFilterChange}
//                 className="shadow-sm"
//               >
//                 <option value="All">All Sessions</option>
//                 <option value="Lunch">Lunch</option>
//                 <option value="Dinner">Dinner</option>
//               </Form.Select>
//             </Col>
//           </Row>

//           {/* Row 2: Hub, Status, Search */}
//           <Row className="g-3 align-items-end">
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
//                 <option value="Packed">Packing</option>
//                 <option value="On the way">On the way</option>
//                 <option value="Delivered">Delivered</option>
//                 <option value="Cancelled">Cancelled</option>
//               </Form.Select>
//             </Col>

//             <Col md={4}>
//               <Form.Label className="fw-bold small">Search</Form.Label>
//               <InputGroup className="shadow-sm">
//                 <InputGroup.Text>
//                   <BsSearch />
//                 </InputGroup.Text>
//                 <Form.Control
//                   type="text"
//                   placeholder="Order ID / Name"
//                   name="search"
//                   value={filters.search}
//                   onChange={handleFilterChange}
//                 />
//               </InputGroup>
//             </Col>

//             <Col md={2}>
//               <Button
//                 variant="outline-danger"
//                 onClick={clearFilters}
//                 className="w-100 fw-bold"
//               >
//                 Reset
//               </Button>
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       {/* Main Content */}
//       <div className="customerhead p-2">
//         <div className="d-flex justify-content-between align-items-center">
//           <h2 className="header-c">Corporate Booking List</h2>
//           <h3 className="header-c">
//             Total Orders: {pagination?.totalCount || 0}
//           </h3>
//           <Button
//             variant="success"
//             onClick={handleExportExcel}
//             disabled={excelLoading}
//           >
//             {excelLoading ? <Spinner size="sm" /> : "Export Excel"}
//           </Button>
//         </div>

//         <div className="mb-3">
//           <Table
//             responsive
//             bordered
//             style={{ width: "-webkit-fill-available" }}
//           >
//             <thead>
//               {/* === ALL COLUMNS KEPT + 2 NEW ADDED === */}
//               <tr>
//                 <th>S.No</th>
//                 <th
//                   onClick={() => handleSort("createdAt")}
//                   style={{ cursor: "pointer", whiteSpace: "nowrap" }}
//                 >
//                   Placed On {renderSortIcon("createdAt")}
//                 </th>
//                 {/* <th>Placed Time</th> */}
//                 <th
//                   onClick={() => handleSort("deliveryDate")}
//                   style={{ cursor: "pointer", whiteSpace: "nowrap" }}
//                 >
//                   Delivery Date {renderSortIcon("deliveryDate")}
//                 </th>{" "}
//                 {/* NEW */}
//                 <th
//                   onClick={() => handleSort("session")}
//                   style={{ cursor: "pointer", whiteSpace: "nowrap" }}
//                 >
//                   Session {renderSortIcon("session")}
//                 </th>{" "}
//                 {/* NEW */}
//                 <th
//                   onClick={() => handleSort("orderid")}
//                   style={{ cursor: "pointer", whiteSpace: "nowrap" }}
//                 >
//                   Order ID {renderSortIcon("orderid")}
//                 </th>
//                 <th>Customer Name</th>
//                 <th>Student Details </th>
//                 <th>Total Order</th>
//                 <th
//                   onClick={() => handleSort("status")}
//                   style={{
//                     padding: "30px",
//                     cursor: "pointer",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   Order Status {renderSortIcon("status")}
//                 </th>
//                 <th>Hub</th>
//                 <th>Slots Details</th>
//                 <th>Category Name</th>
//                 <th>Product Name</th>
//                 <th>Cutlery</th>
//                 <th>Unit</th>
//                 <th>Phone Number</th>
//                 <th>Corporate</th>
//                 <th>Address Type</th>
//                 <th>Delivery location</th>
//                 {/* <th>Delivery Method</th> */}
//                 <th>Payment Method</th>
//                 <th>Delivery Amount</th>
//                 <th>Tax</th>
//                 <th>Apply Wallet</th>
//                 <th>Coupon Discount</th>
//                 <th>Total Amount</th>
//                 <th>Rate/Comment</th>
//                 <th>Order Invoice</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={28} className="text-center">
//                     {" "}
//                     {/* Updated colSpan */}
//                     <Spinner animation="border" variant="primary" />
//                   </td>
//                 </tr>
//               ) : order.length === 0 ? (
//                 <tr>
//                   <td colSpan={28} className="text-center">
//                     {" "}
//                     {/* Updated colSpan */}
//                     No orders found
//                   </td>
//                 </tr>
//               ) : (
//                 order.map((items, i) => {
//                   const serialNumber =
//                     (pagination.currentPage - 1) * pagination.pageSize + i + 1;
//                   return (
//                     <tr key={items._id}>
//                       <td>{serialNumber}</td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {moment(items?.createdAt).format("DD-MM-YYYY h:mm A")}
//                       </td>
//                       {/* <td style={{ paddingTop: "20px" }}>
//                         {moment(items?.createdAt).format("h:mm A")}
//                       </td> */}
//                       {/* === NEW DATA CELLS === */}
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.deliveryDate
//                           ? moment(items.deliveryDate).format("DD-MM-YYYY")
//                           : "N/A"}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.session || "N/A"}
//                       </td>
//                       {/* === END NEW DATA CELLS === */}
//                       <td style={{ paddingTop: "20px" }}>{items?.orderid}</td>
//                       <td style={{ paddingTop: "20px" }}>{items?.username}</td>
//                       <td>
//                         {items?.studentName && (
//                           <>
//                             Student: {items.studentName} Class:{" "}
//                             {items.studentClass} Section: {items.studentSection}
//                           </>
//                         )}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.totalOrder || 0}
//                       </td>
//                       <td style={{ paddingTop: "20px", width: "400px" }}>
//                         {items?.status}
//                         <Button
//                           className="modal-add-btn mt-2"
//                           variant=""
//                           onClick={() => handleShow3(items)}
//                         >
//                           Change Status
//                         </Button>
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.hubName || "N/A"}{" "}
//                         {/* Using populated hub name */}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>{items?.slot}</td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.allProduct?.map((item, idx) => (
//                           <span key={idx}>
//                             {item?.foodItemId?.foodcategory}
//                             {idx !== items.allProduct.length - 1 ? ", " : ""}
//                           </span>
//                         ))}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.allProduct?.map((item, idx) => (
//                           <span key={idx}>
//                             {`${item?.foodItemId?.foodname} - ${item?.quantity} Qty`}
//                             {idx !== items.allProduct.length - 1 ? ", " : ""}
//                             {/* <br></br> */}
//                           </span>
//                         ))}
//                       </td>
//                       <td>{items?.Cutlery > 0 ? "Yes" : "No"}</td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.allProduct?.map((item, idx) => (
//                           <span key={idx}>
//                             {item?.foodItemId?.unit}
//                             {idx !== items.allProduct.length - 1 ? ", " : ""}
//                           </span>
//                         ))}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.Mobilenumber}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.customerType}
//                       </td>{" "}
//                       {/* Using customerType */}
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.addressType}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.delivarylocation},{items?.addressline}
//                       </td>
//                       {/* <td style={{ paddingTop: "20px" }}>
//                         {items.deliveryMethod ? items?.deliveryMethod : "N/A"}
//                       </td> */}
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.paymentmethod}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.deliveryCharge}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.tax?.toFixed(2)}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.discountWallet ? "Yes" : "No"}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         {items?.coupon || "No"}
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>₹{items?.allTotal}</td>
//                       <td style={{ paddingTop: "20px", minWidth: "150px" }}>
//                         {/* Food Rating */}
//                         {items?.ratings?.order?.rating ? (
//                           <div className="mb-2">
//                             <strong>Food:</strong>
//                             <div>{renderStars(items.ratings.order.rating)}</div>
//                             <small className="text-muted">
//                               "{items.ratings.order.comment || "No comment"}"
//                             </small>
//                           </div>
//                         ) : null}

//                         {/* Delivery Rating */}
//                         {items?.ratings?.delivery?.rating ? (
//                           <div>
//                             <strong>Delivery:</strong>
//                             <div>
//                               {renderStars(items.ratings.delivery.rating)}
//                             </div>
//                             <small className="text-muted">
//                               "{items.ratings.delivery.comment || "No comment"}"
//                             </small>
//                           </div>
//                         ) : null}

//                         {/* Fallback if neither exists */}
//                         {!items?.ratings?.order?.rating &&
//                           !items?.ratings?.delivery?.rating && (
//                             <span className="text-muted">Not rated</span>
//                           )}
//                       </td>
//                       <td style={{ paddingTop: "5px" }}>
//                         <Button onClick={() => handleShow(items)}>
//                           <IoIosEye size={20} />
//                         </Button>
//                         <Button
//                           variant=""
//                           style={{
//                             background: "green",
//                             color: "white",
//                             border: "1px solid white",
//                           }}
//                           onClick={() =>
//                             navigate("/thermalinvoice", {
//                               state: { item: items },
//                             })
//                           }
//                         >
//                           Print
//                         </Button>
//                       </td>
//                       <td style={{ paddingTop: "20px" }}>
//                         <Button
//                           className="modal-add-btn"
//                           variant=""
//                           onClick={() => {
//                             setdelData(items._id);
//                             handleShow4();
//                           }}
//                         >
//                           <AiFillDelete />
//                         </Button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </Table>
//         </div>

//         {/* Pagination */}
//         {pagination.totalPages > 1 && (
//           <div className="d-flex justify-content-center">
//             <ReactPaginate
//               previousLabel={"Back"}
//               nextLabel={"Next"}
//               breakLabel="..."
//               pageCount={pagination.totalPages}
//               onPageChange={handlePageChange}
//               forcePage={pagination.currentPage - 1}
//               containerClassName={"paginationBttns"}
//               previousLinkClassName={"previousBttn"}
//               nextLinkClassName={"nextBttn"}
//               disabledClassName={"paginationDisabled"}
//               activeClassName={"paginationActive"}
//             />
//           </div>
//         )}
//       </div>

//       {/* --- ALL MODALS (Kept from original) --- */}

//       {/* Delete booking */}
//       <Modal
//         show={show4}
//         onHide={handleClose4}
//         backdrop="static"
//         keyboard={false}
//         style={{ zIndex: "99999" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Warning</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="row">
//             <div className="col-md-12">
//               <p className="fs-4" style={{ color: "red" }}>
//                 Are you sure?
//                 <br /> you want to delete this data?
//               </p>
//             </div>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="" className="modal-close-btn" onClick={handleClose4}>
//             Close
//           </Button>
//           <Button
//             variant=""
//             onClick={() => deleteBooking(delData)}
//             className="modal-add-btn"
//           >
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Invoice */}
//       <Modal
//         show={show}
//         onHide={handleClose}
//         size="lg"
//         aria-labelledby="contained-modal-title-vcenter"
//         centered
//         style={{ zIndex: 9999999 }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title id="contained-modal-title-vcenter">
//             Order Details
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="row">
//             {data && (
//               <div>
//                 <h4>Order Summary</h4>
//                 <b>{data?.allProduct?.length} Items</b>
//                 <hr />

//                 <div className="row w-100">
//                   {data?.allProduct?.map((Item) => {
//                     return (
//                       <div className="row  border mt-1 mx-1" key={Item?._id}>
//                         <div className="col-md-4">
//                           <img
//                             src={`${Item?.foodItemId?.Foodgallery[0]?.image2}`}
//                             alt=""
//                             style={{ width: "90px", height: "80px" }}
//                           />
//                         </div>
//                         <div className="col-md-4">
//                           <div style={{ textAlign: "left" }}>
//                             <b>{Item?.foodItemId?.foodname}</b> <br />
//                             <span>
//                               <b> ₹ {Item?.totalPrice / Item?.quantity}</b>
//                             </span>
//                             <br />
//                             <b> Qty. {Item?.quantity}</b>
//                           </div>
//                         </div>
//                         <div className="col-md-4 d-flex align-items-center">
//                           <div style={{ textAlign: "left" }}>
//                             <b>₹ {(Item?.totalPrice).toFixed(2)}</b> <br />
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 <div className="row m-2 mt-3 align-items-center">
//                   <b>Bill Details</b>
//                   <div className="col-md-10 mb-2">
//                     <div>
//                       <div>Item Total (Excl. Tax)</div>
//                       <div>Tax ({data?.taxPercentage || 5}%)</div>
//                       {data?.Cutlery ? <div>Cutlery</div> : null}
//                       {data?.delivarytype ? <div>Delivery charges</div> : null}
//                       {data?.coupon ? <div>Coupon Discount</div> : null}
//                       {data?.preorderDiscount ? (
//                         <div>Preorder Discount</div>
//                       ) : null}
//                       {data?.discountWallet ? <div>Apply Wallet</div> : null}
//                       <div>
//                         <b>Bill total</b>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-md-2 mb-2">
//                     <div style={{ textAlign: "left" }}>
//                       <div>
//                         <div>
//                           ₹{" "}
//                           {data?.amountBeforeTax
//                             ? data.amountBeforeTax.toFixed(2)
//                             : (
//                                 (data?.subTotal || 0) - (data?.tax || 0)
//                               ).toFixed(2)}
//                         </div>

//                         <div>₹ {data?.tax ? data.tax.toFixed(2) : "0.00"}</div>

//                         {data?.Cutlery ? <div>₹ {data?.Cutlery}</div> : null}
//                         {data?.delivarytype ? (
//                           <div>₹ {data?.delivarytype}</div>
//                         ) : null}
//                         {data?.coupon ? <div>- ₹ {data?.coupon}</div> : null}
//                         {data?.preorderDiscount ? (
//                           <div>- ₹ {data?.preorderDiscount}</div>
//                         ) : null}
//                         {data?.discountWallet ? (
//                           <div>- ₹ {data?.discountWallet}</div>
//                         ) : null}

//                         <div>
//                           <b>₹ {data?.allTotal?.toFixed(2)}</b>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row m-2 mt-3">
//                   <h5 className="mb-3">Customer Feedback</h5>

//                   {/* Food Rating Section */}
//                   <div className="col-md-6 mb-3">
//                     <div className="p-2 border rounded">
//                       <h6>Food Rating</h6>
//                       {data?.ratings?.order?.rating ? (
//                         <>
//                           <div className="mb-1">
//                             {renderStars(data.ratings.order.rating)}
//                             <span className="ms-2 badge bg-success">
//                               {data.ratings.order.rating}/5
//                             </span>
//                           </div>
//                           <p className="small text-muted mb-0">
//                             {data.ratings.order.comment ||
//                               "No comment provided."}
//                           </p>
//                         </>
//                       ) : (
//                         <small className="text-muted">
//                           {data?.ratings?.order?.status === "skipped"
//                             ? "Skipped by user"
//                             : "Pending / Not Rated"}
//                         </small>
//                       )}
//                     </div>
//                   </div>

//                   {/* Delivery Rating Section */}
//                   <div className="col-md-6 mb-3">
//                     <div className="p-2 border rounded">
//                       <h6>Delivery Rating</h6>
//                       {data?.ratings?.delivery?.rating ? (
//                         <>
//                           <div className="mb-1">
//                             {renderStars(data.ratings.delivery.rating)}
//                             <span className="ms-2 badge bg-primary">
//                               {data.ratings.delivery.rating}/5
//                             </span>
//                           </div>
//                           <p className="small text-muted mb-0">
//                             {data.ratings.delivery.comment ||
//                               "No comment provided."}
//                           </p>
//                         </>
//                       ) : (
//                         <small className="text-muted">
//                           {data?.ratings?.delivery?.status === "skipped"
//                             ? "Skipped by user"
//                             : "Pending / Not Rated"}
//                         </small>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//           <div className="d-flex gap-4 justify-content-end mt-3 mb-3">
//             <div>
//               <Button
//                 variant=""
//                 style={{
//                   background: "white",
//                   color: "green",
//                   border: "1px solid green",
//                 }}
//                 onClick={handleClose}
//               >
//                 Close
//               </Button>
//             </div>
//             <div>
//               <Button
//                 variant=""
//                 style={{
//                   background: "green",
//                   color: "white",
//                   border: "1px solid white",
//                 }}
//                 onClick={() =>
//                   navigate("/AdminInvoice", { state: { item: data } })
//                 }
//               >
//                 Invoice
//               </Button>
//             </div>
//           </div>
//         </Modal.Body>
//       </Modal>

//       {/* status change  */}
//       <Modal
//         show={show3}
//         onHide={handleClose3}
//         backdrop="static"
//         keyboard={false}
//         style={{ zIndex: "99999" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Change Status</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="col-md-12 mb-2">
//             <Form.Select // Changed to Form.Select
//               name="status"
//               id="status"
//               onChange={(e) => {
//                 setstatusdata(e.target.value);
//               }}
//               defaultValue="" // Use defaultValue
//             >
//               <option value="" disabled>
//                 Select Status
//               </option>
//               <option value="Cooking">Cooking</option>
//               <option value="Packed">Packing</option>
//               <option value="On the way">On the way</option>
//               <option value="Delivered">Delivered</option>
//             </Form.Select>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleClose3}>
//             Close
//           </Button>
//           <Button
//             variant="primary" // Changed variant
//             className="modal-add-btn"
//             onClick={() => changestatus(dataa)}
//           >
//             Save
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

  // Helper function to calculate order summary - FIXED NaN issue
  // const calculateOrderSummary = (order) => {
  //   if (!order) {
  //     return {
  //       subtotal: 0,
  //       tax: 0,
  //       deliveryCharge: 0,
  //       cutlery: 0,
  //       preorderDiscount: 0,
  //       walletDiscount: 0,
  //       couponDiscount: 0,
  //       totalDiscounts: 0,
  //       amountBeforeDiscounts: 0,
  //       finalAmount: 0,
  //     };
  //   }

  //   const subtotal = parseFloat(order?.allTotal) || 0;
  //   const tax = parseFloat(order?.tax) || 0;
  //   const deliveryCharge = parseFloat(order?.deliveryCharge) || 0;
  //   const cutlery = parseFloat(order?.Cutlery) || 0;
  //   const preorderDiscount = parseFloat(order?.preorderDiscount) || 0;
  //   const walletDiscount = parseFloat(order?.discountWallet) || 0;
  //   const couponDiscount = parseFloat(order?.coupon) || 0;

  //   const totalDiscounts = preorderDiscount + walletDiscount + couponDiscount;
  //   const amountBeforeDiscounts = subtotal + totalDiscounts;
  //   const finalAmount = subtotal;

  //   return {
  //     subtotal: isNaN(subtotal) ? 0 : subtotal,
  //     tax: isNaN(tax) ? 0 : tax,
  //     deliveryCharge: isNaN(deliveryCharge) ? 0 : deliveryCharge,
  //     cutlery: isNaN(cutlery) ? 0 : cutlery,
  //     preorderDiscount: isNaN(preorderDiscount) ? 0 : preorderDiscount,
  //     walletDiscount: isNaN(walletDiscount) ? 0 : walletDiscount,
  //     couponDiscount: isNaN(couponDiscount) ? 0 : couponDiscount,
  //     totalDiscounts: isNaN(totalDiscounts) ? 0 : totalDiscounts,
  //     amountBeforeDiscounts: isNaN(amountBeforeDiscounts)
  //       ? 0
  //       : amountBeforeDiscounts,
  //     finalAmount: isNaN(finalAmount) ? 0 : finalAmount,
  //   };
  // };

  const calculateOrderSummary = (order) => {
    console.log(order, "order......................");
    if (!order) {
      return {
        subtotal: 0,
        tax: 0,
        deliveryCharge: 0,
        cutlery: 0,
        preorderDiscount: 0,
        walletDiscount: 0,
        couponDiscount: 0,
        totalDiscounts: 0,
        amountBeforeDiscounts: 0,
        finalAmount: 0,
      };
    }

    // ✅ Calculate subtotal from allProduct array instead of relying on allTotal field
    const subtotal =
      order?.allProduct?.reduce((sum, item) => {
        return sum + (parseFloat(item?.totalPrice) || 0);
      }, 0) ||
      parseFloat(order?.allTotal) ||
      0;

    const tax = parseFloat(order?.tax) || 0;
    const deliveryCharge = parseFloat(order?.deliveryCharge) || 0;
    const cutlery = parseFloat(order?.Cutlery) || 0;
    const preorderDiscount = parseFloat(order?.preorderDiscount) || 0;
    const walletDiscount = parseFloat(order?.discountWallet) || 0;
    const couponDiscount = parseFloat(order?.coupon) || 0;

    const totalDiscounts = preorderDiscount + walletDiscount + couponDiscount;

    // ✅ amountBeforeDiscounts = subtotal + discounts (i.e. what it was before discounts applied)
    const amountBeforeDiscounts = subtotal;

    // ✅ finalAmount = subtotal (discounts already deducted in subtotal)

    var finalAmount = 0;
    if (deliveryCharge > 0) {
      finalAmount = 0;
    } else {
      finalAmount = subtotal - totalDiscounts;
    }

    return {
      subtotal,
      tax,
      deliveryCharge,
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
        const startOfLastMonth = moment()
          .subtract(1, "months")
          .startOf("month");
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
        orderType: "corporate",
        search: filters.search,
        dateFilterType: filters.dateFilterType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        hubId: filters.hubId,
        session: filters.session,
        status: filters.status,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };

      const res = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/admin/getallordersfilter",
        { params },
      );

      if (res.data.success) {
        setOrder(res.data.data.orders);
        setPagination(res.data.data.pagination);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      setOrder([]);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch orders",
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
        "https://dd-backend-3nm0.onrender.com/api/Hub/hubs",
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
      page: 1,
    });
  };

  // --- Original Functions (Kept as requested) ---
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
            `https://dd-backend-3nm0.onrender.com/api/admin/deletefoodorder/${data}`,
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

  // Export Excel (Updated with new fields)
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
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };

      const res = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/admin/getallordersfilter",
        { params },
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
            "Student Details": `${item?.studentName} | Class: ${item?.studentClass} | Section: ${item?.studentSection}`,
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
            "Delivery Amount": item?.deliveryCharge,
            Tax: item?.tax?.toFixed(2),
            "Subtotal (Before Discounts)": summary.amountBeforeDiscounts,
            "Preorder Discount": summary.preorderDiscount,
            "Wallet Applied Amount": summary.walletDiscount,
            "Coupon Discount": summary.couponDiscount,
            "Total Discounts": summary.totalDiscounts,
            "Final Amount":
              summary.amountBeforeDiscounts +
              summary.deliveryCharge -
              summary.preorderDiscount,
            "Total Paid": summary.finalAmount,
            Status: item?.status,
          };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CorporateOrders");
        XLSX.writeFile(
          workbook,
          `Corporate_Bookings_${moment().format("DDMMYYYY_HHmm")}.xlsx`,
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
        />,
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
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="g-3 align-items-end">
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

            <Col md={4}>
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

            <Col md={2}>
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
                    <td colSpan={19} className="text-center py-5">
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
                    <td colSpan={19} className="text-center py-5">
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
                    {
                      console.log("items.........1111111111111", items);
                    }
                    const serialNumber =
                      (pagination.currentPage - 1) * pagination.pageSize +
                      i +
                      1;
                    const summary = calculateOrderSummary(items);

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
                            bg={items?.session === "Lunch" ? "warning" : "info"}
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
                            <small className="text-muted">
                              {items?.customerType}
                            </small>
                          </div>
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
                        <td className="text-end">
                          <div className="text-success fw-bold">
                            ₹{summary.amountBeforeDiscounts.toFixed(2)}
                          </div>
                        </td>
                        <td className="text-end">
                          {summary.preorderDiscount > 0 ? (
                            <span className="text-danger fw-bold">
                              -₹{summary.preorderDiscount.toFixed(2)}
                            </span>
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
                          <span className="text-danger fw-bold">
                            ₹{items?.deliveryCharge || "0"}
                          </span>
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
                          {items?.deliveryCharge > 0 ? (
                            <div className="fw-bold fs-6 text-primary">
                              ₹
                              {(
                                summary.amountBeforeDiscounts +
                                (items?.deliveryCharge || 0) -
                                summary.preorderDiscount -
                                summary.couponDiscount
                              ).toFixed(2)}
                            </div>
                          ) : (
                            <div className="fw-bold fs-6 text-primary">
                              ₹
                              {(
                                summary.finalAmount +
                                summary.totalDiscounts -
                                summary.preorderDiscount
                              ).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="fw-bold fs-6 text-primary">
                            ₹
                            {/* {items?.deliveryCharge === 0
                              ? (
                                  summary.amountBeforeDiscounts +
                                  summary.tax -                                -
                                  summary?.totalDiscounts
                                ).toFixed(2)
                              : (summary.finalAmount - summary.tax).toFixed(2)} */}
                            {summary.finalAmount.toFixed(2)}
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
                            {items?.allProduct?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="mb-1">
                                {item?.foodItemId?.foodname} × {item?.quantity}
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

          {/* Pagination - Fixed with proper styling */}
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
                      pagination.totalCount,
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

      {/* --- ALL MODALS --- */}

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

      {/* Invoice/Details Modal - FIXED NaN issue */}
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

              {/* Bill Details - FIXED NaN calculations */}
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
                          {summary.deliveryCharge > 0 && (
                            <div className="mb-2">Delivery Charges</div>
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
                          <div className="mb-2">₹ {summary.tax.toFixed(2)}</div>
                          {(data?.Cutlery || 0) > 0 && (
                            <div className="mb-2">₹ {data.Cutlery}</div>
                          )}
                          {summary.deliveryCharge > 0 && (
                            <div className="mb-2">
                              ₹ {summary.deliveryCharge.toFixed(2)}
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
            onClick={() => navigate("/AdminInvoice", { state: { item: data } })}
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
//   FaCheckDouble,
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
//   const [bulkUpdating, setBulkUpdating] = useState(false);

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

//   // Helper function to calculate order summary - FIXED NaN issue
//   const calculateOrderSummary = (order) => {
//     if (!order) {
//       return {
//         subtotal: 0,
//         tax: 0,
//         deliveryCharge: 0,
//         cutlery: 0,
//         preorderDiscount: 0,
//         walletDiscount: 0,
//         couponDiscount: 0,
//         totalDiscounts: 0,
//         amountBeforeDiscounts: 0,
//         finalAmount: 0,
//       };
//     }

//     const subtotal = parseFloat(order?.allTotal) || 0;
//     const tax = parseFloat(order?.tax) || 0;
//     const deliveryCharge = parseFloat(order?.deliveryCharge) || 0;
//     const cutlery = parseFloat(order?.Cutlery) || 0;
//     const preorderDiscount = parseFloat(order?.preorderDiscount) || 0;
//     const walletDiscount = parseFloat(order?.discountWallet) || 0;
//     const couponDiscount = parseFloat(order?.coupon) || 0;

//     const totalDiscounts = preorderDiscount + walletDiscount + couponDiscount;
//     const amountBeforeDiscounts = subtotal + totalDiscounts;
//     const finalAmount = subtotal;

//     return {
//       subtotal: isNaN(subtotal) ? 0 : subtotal,
//       tax: isNaN(tax) ? 0 : tax,
//       deliveryCharge: isNaN(deliveryCharge) ? 0 : deliveryCharge,
//       cutlery: isNaN(cutlery) ? 0 : cutlery,
//       preorderDiscount: isNaN(preorderDiscount) ? 0 : preorderDiscount,
//       walletDiscount: isNaN(walletDiscount) ? 0 : walletDiscount,
//       couponDiscount: isNaN(couponDiscount) ? 0 : couponDiscount,
//       totalDiscounts: isNaN(totalDiscounts) ? 0 : totalDiscounts,
//       amountBeforeDiscounts: isNaN(amountBeforeDiscounts)
//         ? 0
//         : amountBeforeDiscounts,
//       finalAmount: isNaN(finalAmount) ? 0 : finalAmount,
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
//         const startOfLastMonth = moment()
//           .subtract(1, "months")
//           .startOf("month");
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
//   const getApartmentOrder = async (page = 1) => {
//     setLoading(true);
//     try {
//       const dateRange = getDateRangeForFilter(filters.dateFilterType);

//       const params = {
//         page: filters.page,
//         limit: pagination.pageSize,
//         orderType: "corporate",
//         search: filters.search,
//         dateFilterType: filters.dateFilterType,
//         startDate: dateRange.startDate,
//         endDate: dateRange.endDate,
//         hubId: filters.hubId,
//         session: filters.session,
//         status: filters.status,
//         sortBy: sortConfig.key,
//         sortOrder: sortConfig.direction,
//       };

//       const res = await axios.get(
//         "https://dd-backend-3nm0.onrender.com/api/admin/getallordersfilter",
//         { params },
//       );

//       if (res.data.success) {
//         setOrder(res.data.data.orders);
//         setPagination(res.data.data.pagination);
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log(error);
//       setOrder([]);
//       Swal.fire({
//         title: "Error",
//         text: "Failed to fetch orders",
//         icon: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // NEW: Mark all non-delivered orders as delivered
//   const markAllAsDelivered = async () => {
//     // First, get count of orders that are not delivered
//     const nonDeliveredOrders = order.filter(
//       (item) => item.status !== "Delivered" && item.status !== "Cancelled"
//     );

//     if (nonDeliveredOrders.length === 0) {
//       Swal.fire({
//         title: "Info",
//         text: "No orders to mark as delivered. All orders are already delivered or cancelled.",
//         icon: "info",
//       });
//       return;
//     }

//     // Confirm with user
//     const result = await Swal.fire({
//       title: "Mark All as Delivered?",
//       html: `
//         <div class="text-start">
//           <p>You are about to mark <strong>${nonDeliveredOrders.length}</strong> orders as delivered.</p>
//           <p class="text-warning">This action will:</p>
//           <ul class="text-start">
//             <li>Change status of all non-delivered orders to "Delivered"</li>
//             <li>This includes orders with status:
//               ${[...new Set(nonDeliveredOrders.map(o => o.status))].join(", ")}
//             </li>
//           </ul>
//           <p class="text-danger small">This action cannot be undone!</p>
//         </div>
//       `,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#28a745",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, mark all as delivered",
//       cancelButtonText: "Cancel",
//       reverseButtons: true,
//     });

//     if (!result.isConfirmed) return;

//     setBulkUpdating(true);

//     try {
//       const orderIds = nonDeliveredOrders.map((item) => item._id);

//       const response = await axios.post(
//         "https://dd-backend-3nm0.onrender.com/api/admin/bulkUpdateOrderStatus",
//         {
//           orderIds: orderIds,
//           newStatus: "Delivered",
//         }
//       );

//       if (response.data.success) {
//         Swal.fire({
//           title: "Success!",
//           text: `${response.data.updatedCount || nonDeliveredOrders.length} orders have been marked as delivered.`,
//           icon: "success",
//         });
//         // Refresh the orders list
//         getApartmentOrder();
//       } else {
//         throw new Error(response.data.message || "Failed to update orders");
//       }
//     } catch (error) {
//       console.error("Bulk update error:", error);
//       Swal.fire({
//         title: "Error",
//         text: error.response?.data?.message || "Failed to update orders. Please try again.",
//         icon: "error",
//       });
//     } finally {
//       setBulkUpdating(false);
//     }
//   };

//   // Fetch Hubs
//   const getHubs = async () => {
//     try {
//       const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/Hub/hubs");
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
//       page: 1,
//     });
//   };

//   // --- Original Functions (Kept as requested) ---
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
//             `https://dd-backend-3nm0.onrender.com/api/admin/deletefoodorder/${data}`,
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

//   // Export Excel (Updated with new fields)
//   const handleExportExcel = async () => {
//     setExeclLoading(true);
//     try {
//       const dateRange = getDateRangeForFilter(filters.dateFilterType);

//       const params = {
//         page: 1,
//         limit: 10000,
//         orderType: "corporate",
//         search: filters.search,
//         dateFilterType: filters.dateFilterType,
//         startDate: dateRange.startDate,
//         endDate: dateRange.endDate,
//         hubId: filters.hubId,
//         session: filters.session,
//         status: filters.status,
//         sortBy: sortConfig.key,
//         sortOrder: sortConfig.direction,
//       };

//       const res = await axios.get(
//         "https://dd-backend-3nm0.onrender.com/api/admin/getallordersfilter",
//         { params },
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
//             "Student Details": `${item?.studentName} | Class: ${item?.studentClass} | Section: ${item?.studentSection}`,
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
//             "Delivery Amount": item?.deliveryCharge,
//             Tax: item?.tax?.toFixed(2),
//             "Subtotal (Before Discounts)": summary.amountBeforeDiscounts,
//             "Preorder Discount": summary.preorderDiscount,
//             "Wallet Applied Amount": summary.walletDiscount,
//             "Coupon Discount": summary.couponDiscount,
//             "Total Discounts": summary.totalDiscounts,
//             "Total Amount": summary.finalAmount,
//             Status: item?.status,
//           };
//         });

//         const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, "CorporateOrders");
//         XLSX.writeFile(
//           workbook,
//           `Corporate_Bookings_${moment().format("DDMMYYYY_HHmm")}.xlsx`,
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
//         />,
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
//                 <option value="Lunch">Lunch</option>
//                 <option value="Dinner">Dinner</option>
//               </Form.Select>
//             </Col>
//           </Row>

//           <Row className="g-3 align-items-end">
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

//             <Col md={4}>
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

//             <Col md={2}>
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
//                 {/* NEW: Mark All as Delivered Button */}
//                 <Button
//                   variant="success"
//                   onClick={markAllAsDelivered}
//                   disabled={bulkUpdating || order.length === 0 || loading}
//                   className="d-flex align-items-center"
//                 >
//                   {bulkUpdating ? (
//                     <Spinner size="sm" className="me-2" />
//                   ) : (
//                     <FaCheckDouble className="me-2" />
//                   )}
//                   Mark All as Delivered
//                 </Button>
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
//                   <th style={{ whiteSpace: "nowrap" }}>Total Discounts</th>
//                   <th style={{ whiteSpace: "nowrap" }}>Tax Applied</th>
//                   <th style={{ whiteSpace: "nowrap" }}>Final Amount</th>
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
//                     <td colSpan={19} className="text-center py-5">
//                       <Spinner
//                         animation="border"
//                         variant="primary"
//                         className="me-2"
//                       />
//                       Loading orders...
//                     </td>
//                   </tr>
//                 ) : order.length === 0 ? (
//                   <tr>
//                     <td colSpan={19} className="text-center py-5">
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
//                             bg={items?.session === "Lunch" ? "warning" : "info"}
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
//                             <small className="text-muted">
//                               {items?.customerType}
//                             </small>
//                           </div>
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
//                             <span className="text-danger fw-bold">
//                               -₹{summary.preorderDiscount.toFixed(2)}
//                             </span>
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
//                             {items?.allProduct?.slice(0, 2).map((item, idx) => (
//                               <div key={idx} className="mb-1">
//                                 {item?.foodItemId?.foodname} × {item?.quantity}
//                               </div>
//                             ))}
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

//           {/* Pagination - Fixed with proper styling */}
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
//                       pagination.totalCount,
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

//       {/* --- ALL MODALS --- */}

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

//       {/* Invoice/Details Modal - FIXED NaN issue */}
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

//               {/* Bill Details - FIXED NaN calculations */}
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
//                           {summary.deliveryCharge > 0 && (
//                             <div className="mb-2">Delivery Charges</div>
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
//                           <div className="mb-2">₹ {summary.tax.toFixed(2)}</div>
//                           {(data?.Cutlery || 0) > 0 && (
//                             <div className="mb-2">₹ {data.Cutlery}</div>
//                           )}
//                           {summary.deliveryCharge > 0 && (
//                             <div className="mb-2">
//                               ₹ {summary.deliveryCharge.toFixed(2)}
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
//             onClick={() => navigate("/AdminInvoice", { state: { item: data } })}
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
