// // import { useState, useEffect } from "react";
// // import { Card, Table, Button, Form, Row, Col, Badge } from "react-bootstrap";
// // import {
// //   FaSearch,
// //   FaFilter,
// //   FaDownload,
// //   FaUser,
// //   FaUtensils,
// //   FaCheckCircle,
// //   FaClock,
// //   FaTimesCircle,
// //   FaListAlt,
// //   FaCommentDots,
// // } from "react-icons/fa";
// // import DatePicker from "react-datepicker";
// // import "react-datepicker/dist/react-datepicker.css";
// // import "./Admin.css";
// // import axios from "axios";
// // import moment from "moment";
// // const AdminPlanDashboard = () => {
// //   const [activeView, setActiveView] = useState("sales"); // 'sales' or 'orders'
// //   const [startDate, setStartDate] = useState(new Date());
// //   const [selectedSession, setSelectedSession] = useState("Lunch");
// //   const [selectedHub, setSelectedHub] = useState("All Hubs");
// //   const [hubs, setHubs] = useState([]);
// //   const getStatusBadge = (status) => {
// //     switch (status) {
// //       case "Confirmed":
// //         return "success";
// //       case "Pending Payment":
// //         return "warning";
// //       case "Skipped":
// //         return "secondary";
// //       case "Cancelled":
// //         return "danger";
// //       default:
// //         return "primary";
// //     }
// //   };

// //   const [salesData, setSalesData] = useState([]);
// //   const [ordersData, setOrdersData] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const fetchDashboardData = async () => {
// //     if (!startDate || !selectedSession) return; // Don't fetch if filters incomplete

// //     setLoading(true);
// //     try {
// //       // Format date for API (YYYY-MM-DD)
// //       // Using local date string to avoid timezone shifts
// //       const dateStr = moment(startDate).format("YYYY-MM-DD");

// //       const params = {
// //         date: dateStr,
// //         session: selectedSession,
// //         hubId: selectedHub,
// //       };

// //       if (activeView === "sales") {
// //         const res = await axios.get(
// //           "https://dd-backend-3nm0.onrender.com/api/admin/plan/sales-tracker",
// //           { params }
// //         );
// //         if (res.data.success) setSalesData(res.data.data);
// //       } else {
// //         const res = await axios.get(
// //           "https://dd-backend-3nm0.onrender.com/api/admin/plan/orders-tracker",
// //           { params }
// //         );
// //         if (res.data.success) setOrdersData(res.data.data);
// //       }
// //     } catch (error) {
// //       console.error("Fetch error", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// //   const getHubs = async () => {
// //     try {
// //       const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/Hub/hubs");
// //       setHubs(res.data);
// //     } catch (error) {
// //       console.error("Failed to fetch hubs:", error);
// //     }
// //   };

// //   useEffect(() => {
// //     getHubs();
// //   }, []);
// //   // --- 2. TRIGGER FETCH ON FILTER CHANGE OR TAB SWITCH ---
// //   useEffect(() => {
// //     fetchDashboardData();
// //   }, [activeView, startDate, selectedSession, selectedHub]);
// //   const totalOrders = ordersData.length;
// //   const confirmedOrders = ordersData.filter(
// //     (o) => o.status === "Confirmed"
// //   ).length;
// //   const pendingOrders = ordersData.filter(
// //     (o) => o.status === "Pending Payment"
// //   ).length;
// //   const cancelledOrders = ordersData.filter(
// //     (o) => o.status === "Skipped" || o.status === "Cancelled"
// //   ).length;

// //   // --- 2. EFFECT HOOK ---

// //   // --- 3. REMINDER HANDLER ---
// //   const handleSendReminders = async () => {
// //     if (!window.confirm(`Send WhatsApp reminder to pending customers?`)) return;
// //     try {
// //       const dateStr = startDate.toISOString().split("T")[0];
// //       const res = await axios.post(
// //         "https://dd-backend-3nm0.onrender.com/api/admin/plan/send-reminders",
// //         {
// //           date: dateStr,
// //           session: selectedSession,
// //           hubId: selectedHub,
// //         }
// //       );
// //       if (res.data.success) alert(res.data.message);
// //     } catch (e) {
// //       alert("Failed to send");
// //     }
// //   };
// //   return (
// //     <div
// //       className="container-fluid p-4"
// //       style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
// //     >
// //       {/* --- HEADER & TOGGLE SWITCH --- */}
// //       <div className="d-flex justify-content-between align-items-center mb-4">
// //         <div>
// //           <h2 style={{ color: "#4b5563", fontWeight: "800", margin: 0 }}>
// //             My Plan Management
// //           </h2>
// //           <p className="text-muted mb-0">Track future reservations and sales</p>
// //         </div>

// //         <div className="bg-white p-1 rounded-pill shadow-sm border d-flex">
// //           <Button
// //             variant={activeView === "sales" ? "success" : "light"}
// //             className={`rounded-pill px-4 fw-bold ${
// //               activeView === "sales" ? "" : "text-muted"
// //             }`}
// //             onClick={() => setActiveView("sales")}
// //             style={{ minWidth: "160px" }}
// //           >
// //             <FaUtensils className="me-2" /> Sales Tracker
// //           </Button>
// //           <Button
// //             variant={activeView === "orders" ? "success" : "light"}
// //             className={`rounded-pill px-4 fw-bold ${
// //               activeView === "orders" ? "" : "text-muted"
// //             }`}
// //             onClick={() => setActiveView("orders")}
// //             style={{ minWidth: "160px" }}
// //           >
// //             <FaListAlt className="me-2" /> Orders Tracker
// //           </Button>
// //         </div>
// //       </div>

// //       {/* --- COMMON FILTERS --- */}
// //       {/* Z-Index fix applied to this Card to ensure dropdowns float ABOVE the tables */}
// //       <Card
// //         className="shadow-sm border-0 mb-4"
// //         style={{ overflow: "visible", zIndex: 10 }}
// //       >
// //         <Card.Body className="py-3">
// //           <div className="row g-3 align-items-end">
// //             <div className="col-md-3">
// //               <label className="small fw-bold text-muted mb-1">
// //                 Select Date
// //               </label>
// //               {/* Fixed Strategy prevents datepicker from being hidden */}
// //               <DatePicker
// //                 selected={startDate}
// //                 onChange={(date) => setStartDate(date)}
// //                 className="form-control"
// //                 popperProps={{ strategy: "fixed" }}
// //               />
// //             </div>
// //             <div className="col-md-3">
// //               <label className="small fw-bold text-muted mb-1">
// //                 Select Session
// //               </label>
// //               <Form.Select
// //                 value={selectedSession}
// //                 onChange={(e) => setSelectedSession(e.target.value)}
// //               >
// //                 <option>Lunch</option>
// //                 <option>Dinner</option>
// //               </Form.Select>
// //             </div>
// //             <div className="col-md-3">
// //               <label className="small fw-bold text-muted mb-1">
// //                 Select Hub
// //               </label>
// //               <Form.Select
// //                 value={selectedHub}
// //                 onChange={(e) => setSelectedHub(e.target.value)}
// //               >
// //                 <option value="">All Hubs</option>
// //                 {hubs?.map((hub) => (
// //                   <option key={hub._id} value={hub._id}>
// //                     {hub?.hubName}
// //                   </option>
// //                 ))}
// //               </Form.Select>
// //             </div>
// //             <div className="col-md-3 text-end">
// //               <Button variant="outline-success" className="fw-bold">
// //                 <FaDownload className="me-2" /> Export Report
// //               </Button>
// //             </div>
// //           </div>
// //         </Card.Body>
// //       </Card>

// //       {/* ========================================== */}
// //       {/* VIEW 1: PLANNED SALES TRACKER (Product Focus) */}
// //       {/* ========================================== */}
// //       {activeView === "sales" && (
// //         <Card className="shadow-sm border-0">
// //           <Card.Header className="bg-white py-3 border-bottom">
// //             <h5 className="m-0 fw-bold text-dark">Item Sales Performance</h5>
// //           </Card.Header>
// //           <Card.Body className="p-0">
// //             <Table hover responsive className="m-0 align-middle text-nowrap">
// //               <thead className="bg-light text-uppercase small text-muted">
// //                 <tr>
// //                   <th className="py-3 ps-4">Item Name</th>
// //                   <th>Hub Name</th>
// //                   <th className="text-center">Total Rsrvd</th>
// //                   <th className="text-center">Confirmed</th>
// //                   <th className="text-center">Pending</th>
// //                   <th className="text-center">Skipped/Cancelled</th>
// //                   {/* Price Columns */}
// //                   <th className="text-center bg-light border-start">Base ₹</th>
// //                   <th className="text-center bg-light">Hub ₹</th>
// //                   <th className="text-center bg-warning bg-opacity-10 text-dark">
// //                     Pre-Order ₹
// //                   </th>
// //                   {/* Value Columns */}
// //                   <th className="text-end border-start">Est. Sales Value</th>
// //                   <th className="text-end pe-4 text-success">Achieved Sales</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {salesData.map((item) => {
// //                   return (
// //                     <tr key={item.id}>
// //                       <td className="ps-4 fw-bold text-dark">
// //                         {item.foodName}
// //                       </td>
// //                       <td className="text-muted small">{item.hubName}</td>
// //                       <td className="text-center fw-bold bg-light">
// //                         {item.totalPreOrder}
// //                       </td>
// //                       <td className="text-center text-success fw-bold">
// //                         {item.confirmed}
// //                       </td>
// //                       <td className="text-center text-warning fw-bold">
// //                         {item.pending}
// //                       </td>
// //                       <td className="text-center text-danger">
// //                         {item.skipped}
// //                       </td>

// //                       <td className="text-center border-start text-muted">
// //                         {item.basePrice}
// //                       </td>
// //                       <td className="text-center text-muted">
// //                         {item.hubPrice}
// //                       </td>
// //                       <td className="text-center fw-bold bg-warning bg-opacity-10">
// //                         {item.preOrderPrice}
// //                       </td>

// //                       <td className="text-end border-start text-muted">
// //                         ₹{item?.estSalesValue}
// //                       </td>
// //                       <td className="text-end pe-4 fw-bolder text-success">
// //                         ₹{item?.achievedSales}
// //                       </td>
// //                     </tr>
// //                   );
// //                 })}
// //               </tbody>
// //             </Table>
// //           </Card.Body>
// //         </Card>
// //       )}

// //       {/* ========================================== */}
// //       {/* VIEW 2: PLANNED ORDERS TRACKER (User Focus) */}
// //       {/* ========================================== */}
// //       {activeView === "orders" && (
// //         <>
// //           {/* KPI BOXES */}
// //           <div className="row g-3 mb-4">
// //             <div className="col-md-3">
// //               <Card className="border-0 shadow-sm border-start border-4 border-primary p-3">
// //                 <div className="d-flex justify-content-between align-items-center">
// //                   <div>
// //                     <div className="text-muted small fw-bold text-uppercase">
// //                       Total Orders
// //                     </div>
// //                     <h3 className="fw-bold text-dark mb-0">{totalOrders}</h3>
// //                   </div>
// //                   <div className="bg-primary bg-opacity-10 p-3 rounded-circle-no-border text-primary">
// //                     <FaListAlt size={24} />
// //                   </div>
// //                 </div>
// //               </Card>
// //             </div>
// //             <div className="col-md-3">
// //               <Card className="border-0 shadow-sm border-start border-4 border-success p-3">
// //                 <div className="d-flex justify-content-between align-items-center">
// //                   <div>
// //                     <div className="text-muted small fw-bold text-uppercase">
// //                       Confirmed
// //                     </div>
// //                     <h3 className="fw-bold text-success mb-0">
// //                       {confirmedOrders}
// //                     </h3>
// //                   </div>
// //                   <div className="bg-success bg-opacity-10 p-3 rounded-circle-no-border text-success">
// //                     <FaCheckCircle size={24} />
// //                   </div>
// //                 </div>
// //               </Card>
// //             </div>
// //             <div className="col-md-3">
// //               <Card className="border-0 shadow-sm border-start border-4 border-warning p-3">
// //                 <div className="d-flex justify-content-between align-items-center">
// //                   <div>
// //                     <div className="text-muted small fw-bold text-uppercase">
// //                       Yet to Confirm
// //                     </div>
// //                     <h3 className="fw-bold text-warning mb-0">
// //                       {pendingOrders}
// //                     </h3>
// //                   </div>
// //                   <div className="bg-warning bg-opacity-10 p-3 rounded-circle-no-border text-warning">
// //                     <FaClock size={24} />
// //                   </div>
// //                 </div>
// //               </Card>
// //             </div>
// //             <div className="col-md-3">
// //               <Card className="border-0 shadow-sm border-start border-4 border-danger p-3">
// //                 <div className="d-flex justify-content-between align-items-center">
// //                   <div>
// //                     <div className="text-muted small fw-bold text-uppercase">
// //                       Skip / Cancel
// //                     </div>
// //                     <h3 className="fw-bold text-danger mb-0">
// //                       {cancelledOrders}
// //                     </h3>
// //                   </div>
// //                   <div className="bg-danger bg-opacity-10 p-3 rounded-circle-no-border text-danger">
// //                     <FaTimesCircle size={24} />
// //                   </div>
// //                 </div>
// //               </Card>
// //             </div>
// //           </div>

// //           {/* ORDERS TABLE */}
// //           <Card className="shadow-sm border-0">
// //             <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
// //               <div className="d-flex align-items-center gap-3">
// //                 <h5 className="m-0 fw-bold text-dark">Customer Orders</h5>
// //                 <div className="input-group" style={{ maxWidth: "300px" }}>
// //                   <span className="input-group-text bg-light border-end-0">
// //                     <FaSearch className="text-muted" />
// //                   </span>
// //                   <Form.Control
// //                     placeholder="Search customer..."
// //                     className="border-start-0 bg-light shadow-none"
// //                   />
// //                 </div>
// //               </div>

// //               {/* --- NEW ACTION BUTTON --- */}
// //               {pendingOrders > 0 && (
// //                 <Button
// //                   variant="warning"
// //                   className="text-dark fw-bold shadow-sm"
// //                   onClick={handleSendReminders}
// //                 >
// //                   <FaCommentDots className="me-2" />
// //                   Send Reminder to {pendingOrders} Pending
// //                 </Button>
// //               )}
// //               {/* ------------------------- */}
// //             </Card.Header>
// //             <Card.Body className="p-0">
// //               <Table hover responsive className="m-0 align-middle">
// //                 <thead className="bg-light text-muted small text-uppercase">
// //                   <tr>
// //                     <th className="py-3 ps-4">Customer Name</th>
// //                     <th>Contact</th>
// //                     <th>Items</th>
// //                     <th>Total Value</th>
// //                     <th>Status</th>
// //                     <th>Session</th>
// //                     <th>Hub</th>
// //                     <th className="pe-4 text-end">Date</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {ordersData.map((order) => (
// //                     <tr key={order.id}>
// //                       <td className="ps-4 fw-bold text-dark">
// //                         {order.customerName}
// //                       </td>
// //                       <td>{order.contact}</td>
// //                       <td style={{ maxWidth: "250px" }} title={order.items}>
// //                         <small className="text-dark bg-light px-2 py-1 rounded border">
// //                           {order.items}
// //                         </small>
// //                       </td>
// //                       <td className="fw-bold">₹{order.value}</td>
// //                       <td>
// //                         <Badge
// //                           bg={getStatusBadge(order.status)}
// //                           pill
// //                           className="px-3"
// //                         >
// //                           {order.status}
// //                         </Badge>
// //                       </td>
// //                       <td>{order.session}</td>
// //                       <td>{order.hub?.hubName}</td>
// //                       <td className="text-end pe-4 text-muted">{order.date}</td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </Table>
// //             </Card.Body>
// //           </Card>
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default AdminPlanDashboard;

// import { useState, useEffect } from "react";
// import { Card, Table, Button, Form, Row, Col, Badge } from "react-bootstrap";
// import {
//   FaSearch,
//   FaFilter,
//   FaDownload,
//   FaUser,
//   FaUtensils,
//   FaCheckCircle,
//   FaClock,
//   FaTimesCircle,
//   FaListAlt,
//   FaCommentDots,
// } from "react-icons/fa";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import "./Admin.css";
// import axios from "axios";
// import moment from "moment";
// import * as XLSX from "xlsx"; // Add this import

// const AdminPlanDashboard = () => {
//   const [activeView, setActiveView] = useState("sales"); // 'sales' or 'orders'
//   const [startDate, setStartDate] = useState(new Date());
//   const [selectedSession, setSelectedSession] = useState("Lunch");
//   const [selectedHub, setSelectedHub] = useState("All Hubs");
//   const [hubs, setHubs] = useState([]);

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "Confirmed":
//         return "success";
//       case "Pending Payment":
//         return "warning";
//       case "Skipped":
//         return "secondary";
//       case "Cancelled":
//         return "danger";
//       default:
//         return "primary";
//     }
//   };

//   const [salesData, setSalesData] = useState([]);
//   const [ordersData, setOrdersData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Format date function
//   const formatDate = (date) => {
//     if (!date) return "-";
//     return moment(date).format("DD/MM/YYYY, hh:mm A");
//   };

//   // For paymentInitiatedAt (show "Successful" when null)
//   const formatPaymentDate = (date) => {
//     if (date === null) return "Successful";
//     if (!date) return "-";
//     return moment(date).format("DD/MM/YYYY, hh:mm A");
//   };

//   const fetchDashboardData = async () => {
//     if (!startDate || !selectedSession) return; // Don't fetch if filters incomplete

//     setLoading(true);
//     try {
//       // Format date for API (YYYY-MM-DD)
//       // Using local date string to avoid timezone shifts
//       const dateStr = moment(startDate).format("YYYY-MM-DD");

//       const params = {
//         date: dateStr,
//         session: selectedSession,
//         hubId: selectedHub,
//       };

//       if (activeView === "sales") {
//         const res = await axios.get(
//           "https://dd-backend-3nm0.onrender.com/api/admin/plan/sales-tracker",
//           { params },
//         );
//         if (res.data.success) setSalesData(res.data.data);
//       } else {
//         const res = await axios.get(
//           "https://dd-backend-3nm0.onrender.com/api/admin/plan/orders-tracker",
//           { params },
//         );
//         if (res.data.success) setOrdersData(res.data.data);
//       }
//     } catch (error) {
//       console.error("Fetch error", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getHubs = async () => {
//     try {
//       const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/Hub/hubs");
//       setHubs(res.data);
//     } catch (error) {
//       console.error("Failed to fetch hubs:", error);
//     }
//   };

//   useEffect(() => {
//     getHubs();
//   }, []);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [activeView, startDate, selectedSession, selectedHub]);

//   const totalOrders = ordersData.length;
//   const confirmedOrders = ordersData.filter(
//     (o) => o.status === "Confirmed",
//   ).length;
//   const pendingOrders = ordersData.filter(
//     (o) => o.status === "Pending Payment",
//   ).length;
//   const cancelledOrders = ordersData.filter(
//     (o) => o.status === "Skipped" || o.status === "Cancelled",
//   ).length;

//   // --- EXPORT REPORT FUNCTION ---
//   const handleExportReport = () => {
//     let dataToExport = [];
//     let fileName = "";

//     if (activeView === "sales") {
//       // Prepare sales data for export
//       dataToExport = salesData.map((item) => ({
//         "Item Name": item.foodName,
//         "Hub Name": item.hubName,
//         "Total Reserved": item.totalPreOrder,
//         Confirmed: item.confirmed,
//         Pending: item.pending,
//         "Skipped/Cancelled": item.skipped,
//         "Base Price (₹)": item.basePrice,
//         "Hub Price (₹)": item.hubPrice,
//         "Pre-Order Price (₹)": item.preOrderPrice,
//         "Estimated Sales Value (₹)": item.estSalesValue,
//         "Achieved Sales (₹)": item.achievedSales,
//       }));
//       fileName = `sales-tracker_${moment(startDate).format(
//         "YYYY-MM-DD",
//       )}_${selectedSession}_${selectedHub || "all-hubs"}`;
//     } else {
//       // Prepare orders data for export
//       dataToExport = ordersData.map((order) => ({
//         "Customer Name": order.customerName,
//         Contact: order.contact,
//         Items: order.items,
//         "Total Value (₹)": order.value,
//         Status: order.status,
//         Session: order.session,
//         Hub: order.hub?.hubName || "N/A",
//         Date: order.date,
//       }));
//       fileName = `orders-tracker_${moment(startDate).format(
//         "YYYY-MM-DD",
//       )}_${selectedSession}_${selectedHub || "all-hubs"}`;
//     }

//     if (dataToExport.length === 0) {
//       alert("No data to export!");
//       return;
//     }

//     // Create worksheet
//     const ws = XLSX.utils.json_to_sheet(dataToExport);

//     // Set column widths
//     const wscols = [
//       { wch: 20 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 15 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 15 },
//       { wch: 20 },
//       { wch: 15 },
//     ];
//     ws["!cols"] = wscols;

//     // Create workbook
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Report");

//     // Generate Excel file
//     XLSX.writeFile(wb, `${fileName}.xlsx`);
//   };

//   const handleSendReminders = async () => {
//     if (!window.confirm(`Send WhatsApp reminder to pending customers?`)) return;
//     try {
//       const dateStr = moment(startDate).format("YYYY-MM-DD");
//       const res = await axios.post(
//         "https://dd-backend-3nm0.onrender.com/api/admin/plan/send-reminders",
//         {
//           date: dateStr,
//           session: selectedSession,
//           hubId: selectedHub,
//         },
//       );
//       if (res.data.success) alert(res.data.message);
//     } catch (e) {
//       alert("Failed to send");
//     }
//   };

//   return (
//     <div
//       className="container-fluid p-4"
//       style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
//     >
//       {/* --- HEADER & TOGGLE SWITCH --- */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div>
//           <h2 style={{ color: "#4b5563", fontWeight: "800", margin: 0 }}>
//             My Plan Management
//           </h2>
//           <p className="text-muted mb-0">Track future reservations and sales</p>
//         </div>

//         <div className="bg-white p-1 rounded-pill shadow-sm border d-flex">
//           <Button
//             variant={activeView === "sales" ? "success" : "light"}
//             className={`rounded-pill px-4 fw-bold ${
//               activeView === "sales" ? "" : "text-muted"
//             }`}
//             onClick={() => setActiveView("sales")}
//             style={{ minWidth: "160px" }}
//           >
//             <FaUtensils className="me-2" /> Sales Tracker
//           </Button>
//           <Button
//             variant={activeView === "orders" ? "success" : "light"}
//             className={`rounded-pill px-4 fw-bold ${
//               activeView === "orders" ? "" : "text-muted"
//             }`}
//             onClick={() => setActiveView("orders")}
//             style={{ minWidth: "160px" }}
//           >
//             <FaListAlt className="me-2" /> Orders Tracker
//           </Button>
//         </div>
//       </div>

//       {/* --- COMMON FILTERS --- */}
//       <Card
//         className="shadow-sm border-0 mb-4"
//         style={{ overflow: "visible", zIndex: 10 }}
//       >
//         <Card.Body className="py-3">
//           <div className="row g-3 align-items-end">
//             <div className="col-md-3">
//               <label className="small fw-bold text-muted mb-1">
//                 Select Date
//               </label>
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setStartDate(date)}
//                 className="form-control"
//                 popperProps={{ strategy: "fixed" }}
//               />
//             </div>
//             <div className="col-md-3">
//               <label className="small fw-bold text-muted mb-1">
//                 Select Session
//               </label>
//               <Form.Select
//                 value={selectedSession}
//                 onChange={(e) => setSelectedSession(e.target.value)}
//               >
//                 <option>Lunch</option>
//                 <option>Dinner</option>
//               </Form.Select>
//             </div>
//             <div className="col-md-3">
//               <label className="small fw-bold text-muted mb-1">
//                 Select Hub
//               </label>
//               <Form.Select
//                 value={selectedHub}
//                 onChange={(e) => setSelectedHub(e.target.value)}
//               >
//                 <option value="">All Hubs</option>
//                 {hubs?.map((hub) => (
//                   <option key={hub._id} value={hub._id}>
//                     {hub?.hubName}
//                   </option>
//                 ))}
//               </Form.Select>
//             </div>
//             <div className="col-md-3 text-end">
//               <Button
//                 variant="outline-success"
//                 className="fw-bold"
//                 onClick={handleExportReport}
//                 disabled={
//                   loading ||
//                   (activeView === "sales"
//                     ? salesData.length === 0
//                     : ordersData.length === 0)
//                 }
//               >
//                 <FaDownload className="me-2" />
//                 {loading ? "Loading..." : "Export Report"}
//               </Button>
//             </div>
//           </div>
//         </Card.Body>
//       </Card>

//       {/* ========================================== */}
//       {/* VIEW 1: PLANNED SALES TRACKER (Product Focus) */}
//       {/* ========================================== */}
//       {activeView === "sales" && (
//         <Card className="shadow-sm border-0">
//           <Card.Header className="bg-white py-3 border-bottom">
//             <h5 className="m-0 fw-bold text-dark">Item Sales Performance</h5>
//           </Card.Header>
//           <Card.Body className="p-0">
//             <Table hover responsive className="m-0 align-middle text-nowrap">
//               <thead className="bg-light text-uppercase small text-muted">
//                 <tr>
//                   <th className="py-3 ps-4">Item Name</th>
//                   <th>Hub Name</th>
//                   <th className="text-center">Total Rsrvd</th>
//                   <th className="text-center">Confirmed</th>
//                   <th className="text-center">Pending</th>
//                   <th className="text-center">Skipped/Cancelled</th>
//                   {/* Price Columns */}
//                   <th className="text-center bg-light border-start">Base ₹</th>
//                   <th className="text-center bg-light">Hub ₹</th>
//                   <th className="text-center bg-warning bg-opacity-10 text-dark">
//                     Pre-Order ₹
//                   </th>
//                   {/* Value Columns */}
//                   <th className="text-end border-start">Est. Sales Value</th>
//                   <th className="text-end pe-4 text-success">Achieved Sales</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {salesData.map((item) => {
//                   return (
//                     <tr key={item.id}>
//                       <td className="ps-4 fw-bold text-dark">
//                         {item.foodName}
//                       </td>
//                       <td className="text-muted small">{item.hubName}</td>
//                       <td className="text-center fw-bold bg-light">
//                         {item.totalPreOrder}
//                       </td>
//                       <td className="text-center text-success fw-bold">
//                         {item.confirmed}
//                       </td>
//                       <td className="text-center text-warning fw-bold">
//                         {item.pending}
//                       </td>
//                       <td className="text-center text-danger">
//                         {item.skipped}
//                       </td>

//                       <td className="text-center border-start text-muted">
//                         {item.basePrice}
//                       </td>
//                       <td className="text-center text-muted">
//                         {item.hubPrice}
//                       </td>
//                       <td className="text-center fw-bold bg-warning bg-opacity-10">
//                         {item.preOrderPrice}
//                       </td>

//                       <td className="text-end border-start text-muted">
//                         ₹{item?.estSalesValue}
//                       </td>
//                       <td className="text-end pe-4 fw-bolder text-success">
//                         ₹{item?.achievedSales}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </Table>
//           </Card.Body>
//         </Card>
//       )}

//       {/* ========================================== */}
//       {/* VIEW 2: PLANNED ORDERS TRACKER (User Focus) */}
//       {/* ========================================== */}
//       {activeView === "orders" && (
//         <>
//           {/* KPI BOXES */}
//           <div className="row g-3 mb-4">
//             <div className="col-md-3">
//               <Card className="border-0 shadow-sm border-start border-4 border-primary p-3">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Total Orders
//                     </div>
//                     <h3 className="fw-bold text-dark mb-0">{totalOrders}</h3>
//                   </div>
//                   <div className="bg-primary bg-opacity-10 p-3 rounded-circle-no-border text-primary">
//                     <FaListAlt size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//             <div className="col-md-3">
//               <Card className="border-0 shadow-sm border-start border-4 border-success p-3">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Confirmed
//                     </div>
//                     <h3 className="fw-bold text-success mb-0">
//                       {confirmedOrders}
//                     </h3>
//                   </div>
//                   <div className="bg-success bg-opacity-10 p-3 rounded-circle-no-border text-success">
//                     <FaCheckCircle size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//             <div className="col-md-3">
//               <Card className="border-0 shadow-sm border-start border-4 border-warning p-3">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Yet to Confirm
//                     </div>
//                     <h3 className="fw-bold text-warning mb-0">
//                       {pendingOrders}
//                     </h3>
//                   </div>
//                   <div className="bg-warning bg-opacity-10 p-3 rounded-circle-no-border text-warning">
//                     <FaClock size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//             <div className="col-md-3">
//               <Card className="border-0 shadow-sm border-start border-4 border-danger p-3">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Skip / Cancel
//                     </div>
//                     <h3 className="fw-bold text-danger mb-0">
//                       {cancelledOrders}
//                     </h3>
//                   </div>
//                   <div className="bg-danger bg-opacity-10 p-3 rounded-circle-no-border text-danger">
//                     <FaTimesCircle size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//           </div>

//           {/* ORDERS TABLE */}
//           <Card className="shadow-sm border-0">
//             <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
//               <div className="d-flex align-items-center gap-3">
//                 <h5 className="m-0 fw-bold text-dark">Customer Orders</h5>
//                 <div className="input-group" style={{ maxWidth: "300px" }}>
//                   <span className="input-group-text bg-light border-end-0">
//                     <FaSearch className="text-muted" />
//                   </span>
//                   <Form.Control
//                     placeholder="Search customer..."
//                     className="border-start-0 bg-light shadow-none"
//                   />
//                 </div>
//               </div>

//               {/* --- NEW ACTION BUTTON --- */}
//               {pendingOrders > 0 && (
//                 <Button
//                   variant="warning"
//                   className="text-dark fw-bold shadow-sm"
//                   onClick={handleSendReminders}
//                 >
//                   <FaCommentDots className="me-2" />
//                   Send Reminder to {pendingOrders} Pending
//                 </Button>
//               )}
//               {/* ------------------------- */}
//             </Card.Header>
//             <Card.Body className="p-0">
//               <Table hover responsive className="m-0 align-middle">
//                 <thead className="bg-light text-muted small text-uppercase">
//                   <tr>
//                     <th className="py-3 ps-4">Customer Name</th>
//                     <th>Contact</th>
//                     <th>Items</th>
//                     <th>Total Value</th>
//                     <th>Created At</th>
//                     <th>Payment Initiated</th>
//                     <th>Status</th>
//                     <th>Session</th>
//                     <th>Hub</th>
//                     <th className="pe-4 text-end">Date</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {ordersData.map((order) => (
//                     <tr key={order.id}>
//                       <td className="ps-4 fw-bold text-dark">
//                         {order.customerName}
//                       </td>
//                       <td>{order.contact}</td>
//                       <td style={{ maxWidth: "250px" }} title={order.items}>
//                         <small className="text-dark bg-light px-2 py-1 rounded border">
//                           {order.items}
//                         </small>
//                       </td>
//                       <td className="fw-bold">₹{order.value}</td>
//                       <td>{order.createdAt}</td>
//                       <td>{order.paymentInitiatedAt}</td>
//                       <td>
//                         <Badge
//                           bg={getStatusBadge(order.status)}
//                           pill
//                           className="px-3"
//                         >
//                           {order.status}
//                         </Badge>
//                       </td>

//                       <td>{order.session}</td>
//                       <td>{order.hub?.hubName}</td>
//                       <td className="text-end pe-4 text-muted">{order.date}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </Card.Body>
//           </Card>
//         </>
//       )}
//     </div>
//   );
// };

// export default AdminPlanDashboard;

// import { useState, useEffect, useMemo } from "react";
// import { Card, Table, Button, Form, Row, Col, Badge } from "react-bootstrap";
// import {
//   FaSearch,
//   FaFilter,
//   FaDownload,
//   FaUser,
//   FaUtensils,
//   FaCheckCircle,
//   FaClock,
//   FaTimesCircle,
//   FaListAlt,
//   FaCommentDots,
// } from "react-icons/fa";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import "./Admin.css";
// import axios from "axios";
// import moment from "moment";
// import * as XLSX from "xlsx";

// const AdminPlanDashboard = () => {
//   const [activeView, setActiveView] = useState("sales");
//   const [startDate, setStartDate] = useState(new Date());
//   const [selectedSession, setSelectedSession] = useState("Lunch");
//   const [selectedHub, setSelectedHub] = useState("All Hubs");
//   const [hubs, setHubs] = useState([]);

//   // State for search and filters
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState(null); // 'Confirmed', 'Pending Payment', 'Skipped/Cancelled', or null

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "Confirmed":
//         return "success";
//       case "Pending Payment":
//         return "warning";
//       case "Skipped":
//         return "secondary";
//       case "Cancelled":
//         return "danger";
//       default:
//         return "primary";
//     }
//   };

//   const [salesData, setSalesData] = useState([]);
//   const [ordersData, setOrdersData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const formatDate = (date) => {
//     if (!date) return "-";
//     return moment(date).format("DD/MM/YYYY, hh:mm A");
//   };

//   const formatPaymentDate = (date) => {
//     if (date === null) return "Successful";
//     if (!date) return "-";
//     return moment(date).format("DD/MM/YYYY, hh:mm A");
//   };

//   const fetchDashboardData = async () => {
//     if (!startDate || !selectedSession) return;

//     setLoading(true);
//     try {
//       const dateStr = moment(startDate).format("YYYY-MM-DD");
//       const params = {
//         date: dateStr,
//         session: selectedSession,
//         hubId: selectedHub,
//       };

//       if (activeView === "sales") {
//         const res = await axios.get(
//           "https://dd-backend-3nm0.onrender.com/api/admin/plan/sales-tracker",
//           { params },
//         );
//         if (res.data.success) setSalesData(res.data.data);
//       } else {
//         const res = await axios.get(
//           "https://dd-backend-3nm0.onrender.com/api/admin/plan/orders-tracker",
//           { params },
//         );
//         if (res.data.success) {
//           setOrdersData(res.data.data);
//           setStatusFilter(null); // Reset filter when new data is fetched
//         }
//       }
//     } catch (error) {
//       console.error("Fetch error", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getHubs = async () => {
//     try {
//       const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/Hub/hubs");
//       setHubs(res.data);
//     } catch (error) {
//       console.error("Failed to fetch hubs:", error);
//     }
//   };

//   useEffect(() => {
//     getHubs();
//   }, []);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [activeView, startDate, selectedSession, selectedHub]);

//   // Filter orders based on search query and status filter
//   const filteredOrders = useMemo(() => {
//     return ordersData.filter((order) => {
//       // Apply status filter
//       if (statusFilter === "Confirmed" && order.status !== "Confirmed")
//         return false;
//       if (
//         statusFilter === "Pending Payment" &&
//         order.status !== "Pending Payment"
//       )
//         return false;
//       if (
//         statusFilter === "Skipped/Cancelled" &&
//         !(order.status === "Skipped" || order.status === "Cancelled")
//       )
//         return false;

//       // Apply search filter
//       if (searchQuery) {
//         const query = searchQuery.toLowerCase();
//         return (
//           (order.customerName &&
//             order.customerName.toLowerCase().includes(query)) ||
//           (order.contact && order.contact.toLowerCase().includes(query)) ||
//           (order.items && order.items.toLowerCase().includes(query))
//         );
//       }

//       return true;
//     });
//   }, [ordersData, searchQuery, statusFilter]);

//   // Calculate KPI counts from filtered orders
//   const totalOrders = filteredOrders.length;
//   const confirmedOrders = filteredOrders.filter(
//     (o) => o.status === "Confirmed",
//   ).length;
//   const pendingOrders = filteredOrders.filter(
//     (o) => o.status === "Pending Payment",
//   ).length;
//   const cancelledOrders = filteredOrders.filter(
//     (o) => o.status === "Skipped" || o.status === "Cancelled",
//   ).length;

//   // Handle KPI box clicks
//   const handleKpiClick = (filterType) => {
//     if (statusFilter === filterType) {
//       // If clicking the same filter, clear it
//       setStatusFilter(null);
//     } else {
//       setStatusFilter(filterType);
//     }
//   };

//   // Handle search
//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   // Export report function
//   const handleExportReport = () => {
//     let dataToExport = [];
//     let fileName = "";

//     if (activeView === "sales") {
//       dataToExport = salesData.map((item) => ({
//         "Item Name": item.foodName,
//         "Hub Name": item.hubName,
//         "Total Reserved": item.totalPreOrder,
//         Confirmed: item.confirmed,
//         Pending: item.pending,
//         "Skipped/Cancelled": item.skipped,
//         "Base Price (₹)": item.basePrice,
//         "Hub Price (₹)": item.hubPrice,
//         "Pre-Order Price (₹)": item.preOrderPrice,
//         "Estimated Sales Value (₹)": item.estSalesValue,
//         "Achieved Sales (₹)": item.achievedSales,
//       }));
//       fileName = `sales-tracker_${moment(startDate).format(
//         "YYYY-MM-DD",
//       )}_${selectedSession}_${selectedHub || "all-hubs"}`;
//     } else {
//       dataToExport = filteredOrders.map((order) => ({
//         "Customer Name": order.customerName,
//         Contact: order.contact,
//         Items: order.items,
//         "Total Value (₹)": order.value,
//         Status: order.status,
//         Session: order.session,
//         Hub: order.hub?.hubName || "N/A",
//         Date: order.date,
//       }));
//       fileName = `orders-tracker_${moment(startDate).format(
//         "YYYY-MM-DD",
//       )}_${selectedSession}_${selectedHub || "all-hubs"}_${statusFilter || "all"}`;
//     }

//     if (dataToExport.length === 0) {
//       alert("No data to export!");
//       return;
//     }

//     const ws = XLSX.utils.json_to_sheet(dataToExport);
//     const wscols = [
//       { wch: 20 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 15 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 15 },
//       { wch: 20 },
//       { wch: 15 },
//     ];
//     ws["!cols"] = wscols;

//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Report");
//     XLSX.writeFile(wb, `${fileName}.xlsx`);
//   };

//   const handleSendReminders = async () => {
//     if (!window.confirm(`Send WhatsApp reminder to pending customers?`)) return;
//     try {
//       const dateStr = moment(startDate).format("YYYY-MM-DD");
//       const res = await axios.post(
//         "https://dd-backend-3nm0.onrender.com/api/admin/plan/send-reminders",
//         {
//           date: dateStr,
//           session: selectedSession,
//           hubId: selectedHub,
//         },
//       );
//       if (res.data.success) alert(res.data.message);
//     } catch (e) {
//       alert("Failed to send");
//     }
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     setSearchQuery("");
//     setStatusFilter(null);
//   };

//   return (
//     <div
//       className="container-fluid p-4"
//       style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
//     >
//       {/* --- HEADER & TOGGLE SWITCH --- */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div>
//           <h2 style={{ color: "#4b5563", fontWeight: "800", margin: 0 }}>
//             My Plan Management
//           </h2>
//           <p className="text-muted mb-0">Track future reservations and sales</p>
//         </div>

//         <div className="bg-white p-1 rounded-pill shadow-sm border d-flex">
//           <Button
//             variant={activeView === "sales" ? "success" : "light"}
//             className={`rounded-pill px-4 fw-bold ${
//               activeView === "sales" ? "" : "text-muted"
//             }`}
//             onClick={() => setActiveView("sales")}
//             style={{ minWidth: "160px" }}
//           >
//             <FaUtensils className="me-2" /> Sales Tracker
//           </Button>
//           <Button
//             variant={activeView === "orders" ? "success" : "light"}
//             className={`rounded-pill px-4 fw-bold ${
//               activeView === "orders" ? "" : "text-muted"
//             }`}
//             onClick={() => setActiveView("orders")}
//             style={{ minWidth: "160px" }}
//           >
//             <FaListAlt className="me-2" /> Orders Tracker
//           </Button>
//         </div>
//       </div>

//       {/* --- COMMON FILTERS --- */}
//       <Card
//         className="shadow-sm border-0 mb-4"
//         style={{ overflow: "visible", zIndex: 10 }}
//       >
//         <Card.Body className="py-3">
//           <div className="row g-3 align-items-end">
//             <div className="col-md-3">
//               <label className="small fw-bold text-muted mb-1">
//                 Select Date
//               </label>
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setStartDate(date)}
//                 className="form-control"
//                 popperProps={{ strategy: "fixed" }}
//               />
//             </div>
//             <div className="col-md-3">
//               <label className="small fw-bold text-muted mb-1">
//                 Select Session
//               </label>
//               <Form.Select
//                 value={selectedSession}
//                 onChange={(e) => setSelectedSession(e.target.value)}
//               >
//                 <option>Lunch</option>
//                 <option>Dinner</option>
//               </Form.Select>
//             </div>
//             <div className="col-md-3">
//               <label className="small fw-bold text-muted mb-1">
//                 Select Hub
//               </label>
//               <Form.Select
//                 value={selectedHub}
//                 onChange={(e) => setSelectedHub(e.target.value)}
//               >
//                 <option value="">All Hubs</option>
//                 {hubs?.map((hub) => (
//                   <option key={hub._id} value={hub._id}>
//                     {hub?.hubName}
//                   </option>
//                 ))}
//               </Form.Select>
//             </div>
//             <div className="col-md-3 text-end">
//               <Button
//                 variant="outline-success"
//                 className="fw-bold"
//                 onClick={handleExportReport}
//                 disabled={
//                   loading ||
//                   (activeView === "sales"
//                     ? salesData.length === 0
//                     : filteredOrders.length === 0)
//                 }
//               >
//                 <FaDownload className="me-2" />
//                 {loading ? "Loading..." : "Export Report"}
//               </Button>
//             </div>
//           </div>
//         </Card.Body>
//       </Card>

//       {/* ========================================== */}
//       {/* VIEW 1: PLANNED SALES TRACKER (Product Focus) */}
//       {/* ========================================== */}
//       {activeView === "sales" && (
//         <Card className="shadow-sm border-0">
//           <Card.Header className="bg-white py-3 border-bottom">
//             <h5 className="m-0 fw-bold text-dark">Item Sales Performance</h5>
//           </Card.Header>
//           <Card.Body className="p-0">
//             <Table hover responsive className="m-0 align-middle text-nowrap">
//               <thead className="bg-light text-uppercase small text-muted">
//                 <tr>
//                   <th className="py-3 ps-4">Item Name</th>
//                   <th>Hub Name</th>
//                   <th className="text-center">Total Rsrvd</th>
//                   <th className="text-center">Confirmed</th>
//                   <th className="text-center">Pending</th>
//                   <th className="text-center">Skipped/Cancelled</th>
//                   {/* Price Columns */}
//                   <th className="text-center bg-light border-start">Base ₹</th>
//                   <th className="text-center bg-light">Hub ₹</th>
//                   <th className="text-center bg-warning bg-opacity-10 text-dark">
//                     Pre-Order ₹
//                   </th>
//                   {/* Value Columns */}
//                   <th className="text-end border-start">Est. Sales Value</th>
//                   <th className="text-end pe-4 text-success">Achieved Sales</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {salesData.map((item) => {
//                   return (
//                     <tr key={item.id}>
//                       <td className="ps-4 fw-bold text-dark">
//                         {item.foodName}
//                       </td>
//                       <td className="text-muted small">{item.hubName}</td>
//                       <td className="text-center fw-bold bg-light">
//                         {item.totalPreOrder}
//                       </td>
//                       <td className="text-center text-success fw-bold">
//                         {item.confirmed}
//                       </td>
//                       <td className="text-center text-warning fw-bold">
//                         {item.pending}
//                       </td>
//                       <td className="text-center text-danger">
//                         {item.skipped}
//                       </td>

//                       <td className="text-center border-start text-muted">
//                         {item.basePrice}
//                       </td>
//                       <td className="text-center text-muted">
//                         {item.hubPrice}
//                       </td>
//                       <td className="text-center fw-bold bg-warning bg-opacity-10">
//                         {item.preOrderPrice}
//                       </td>

//                       <td className="text-end border-start text-muted">
//                         ₹{item?.estSalesValue}
//                       </td>
//                       <td className="text-end pe-4 fw-bolder text-success">
//                         ₹{item?.achievedSales}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </Table>
//           </Card.Body>
//         </Card>
//       )}

//       {/* ========================================== */}
//       {/* VIEW 2: PLANNED ORDERS TRACKER (User Focus) */}
//       {/* ========================================== */}
//       {activeView === "orders" && (
//         <>
//           {/* KPI BOXES - Made clickable */}
//           <div className="row g-3 mb-4">
//             <div className="col-md-3">
//               <Card
//                 className={`border-0 shadow-sm border-start border-4 border-primary p-3 ${statusFilter === null ? "active-kpi" : ""}`}
//                 style={{
//                   cursor: "pointer",
//                   transform: statusFilter === null ? "scale(1.02)" : "scale(1)",
//                   transition: "transform 0.2s",
//                   backgroundColor:
//                     statusFilter === null
//                       ? "rgba(13, 110, 253, 0.05)"
//                       : "white",
//                 }}
//                 onClick={() => handleKpiClick(null)}
//               >
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Total Orders
//                     </div>
//                     <h3 className="fw-bold text-dark mb-0">{totalOrders}</h3>
//                   </div>
//                   <div className="bg-primary bg-opacity-10 p-3 rounded-circle-no-border text-primary">
//                     <FaListAlt size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//             <div className="col-md-3">
//               <Card
//                 className={`border-0 shadow-sm border-start border-4 border-success p-3 ${statusFilter === "Confirmed" ? "active-kpi" : ""}`}
//                 style={{
//                   cursor: "pointer",
//                   transform:
//                     statusFilter === "Confirmed" ? "scale(1.02)" : "scale(1)",
//                   transition: "transform 0.2s",
//                   backgroundColor:
//                     statusFilter === "Confirmed"
//                       ? "rgba(25, 135, 84, 0.05)"
//                       : "white",
//                 }}
//                 onClick={() => handleKpiClick("Confirmed")}
//               >
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Confirmed
//                     </div>
//                     <h3 className="fw-bold text-success mb-0">
//                       {confirmedOrders}
//                     </h3>
//                   </div>
//                   <div className="bg-success bg-opacity-10 p-3 rounded-circle-no-border text-success">
//                     <FaCheckCircle size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//             <div className="col-md-3">
//               <Card
//                 className={`border-0 shadow-sm border-start border-4 border-warning p-3 ${statusFilter === "Pending Payment" ? "active-kpi" : ""}`}
//                 style={{
//                   cursor: "pointer",
//                   transform:
//                     statusFilter === "Pending Payment"
//                       ? "scale(1.02)"
//                       : "scale(1)",
//                   transition: "transform 0.2s",
//                   backgroundColor:
//                     statusFilter === "Pending Payment"
//                       ? "rgba(255, 193, 7, 0.05)"
//                       : "white",
//                 }}
//                 onClick={() => handleKpiClick("Pending Payment")}
//               >
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Yet to Confirm
//                     </div>
//                     <h3 className="fw-bold text-warning mb-0">
//                       {pendingOrders}
//                     </h3>
//                   </div>
//                   <div className="bg-warning bg-opacity-10 p-3 rounded-circle-no-border text-warning">
//                     <FaClock size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//             <div className="col-md-3">
//               <Card
//                 className={`border-0 shadow-sm border-start border-4 border-danger p-3 ${statusFilter === "Skipped/Cancelled" ? "active-kpi" : ""}`}
//                 style={{
//                   cursor: "pointer",
//                   transform:
//                     statusFilter === "Skipped/Cancelled"
//                       ? "scale(1.02)"
//                       : "scale(1)",
//                   transition: "transform 0.2s",
//                   backgroundColor:
//                     statusFilter === "Skipped/Cancelled"
//                       ? "rgba(220, 53, 69, 0.05)"
//                       : "white",
//                 }}
//                 onClick={() => handleKpiClick("Skipped/Cancelled")}
//               >
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Skip / Cancel
//                     </div>
//                     <h3 className="fw-bold text-danger mb-0">
//                       {cancelledOrders}
//                     </h3>
//                   </div>
//                   <div className="bg-danger bg-opacity-10 p-3 rounded-circle-no-border text-danger">
//                     <FaTimesCircle size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//           </div>

//           {/* Active filters indicator */}
//           {(statusFilter || searchQuery) && (
//             <div className="mb-3">
//               <div className="d-flex align-items-center gap-2">
//                 <small className="text-muted fw-bold">Active Filters:</small>
//                 {statusFilter && (
//                   <Badge bg="info" pill className="px-3 py-2">
//                     Status: {statusFilter}
//                     <button
//                       className="btn-close btn-close-white ms-2"
//                       style={{ fontSize: "0.6rem" }}
//                       onClick={() => setStatusFilter(null)}
//                       aria-label="Remove filter"
//                     ></button>
//                   </Badge>
//                 )}
//                 {searchQuery && (
//                   <Badge bg="secondary" pill className="px-3 py-2">
//                     Search: "{searchQuery}"
//                     <button
//                       className="btn-close btn-close-white ms-2"
//                       style={{ fontSize: "0.6rem" }}
//                       onClick={() => setSearchQuery("")}
//                       aria-label="Remove search"
//                     ></button>
//                   </Badge>
//                 )}
//                 {(statusFilter || searchQuery) && (
//                   <Button
//                     variant="outline-secondary"
//                     size="sm"
//                     onClick={clearFilters}
//                   >
//                     Clear All
//                   </Button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ORDERS TABLE */}
//           <Card className="shadow-sm border-0">
//             <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
//               <div className="d-flex align-items-center gap-3">
//                 <h5 className="m-0 fw-bold text-dark">
//                   Customer Orders{" "}
//                   {filteredOrders.length !== ordersData.length && (
//                     <span className="text-muted fw-normal">
//                       ({filteredOrders.length} of {ordersData.length})
//                     </span>
//                   )}
//                 </h5>
//                 <div className="input-group" style={{ maxWidth: "300px" }}>
//                   <span className="input-group-text bg-light border-end-0">
//                     <FaSearch className="text-muted" />
//                   </span>
//                   <Form.Control
//                     placeholder="Search customer, contact, or items..."
//                     className="border-start-0 bg-light shadow-none"
//                     value={searchQuery}
//                     onChange={handleSearchChange}
//                   />
//                 </div>
//               </div>

//               {/* --- NEW ACTION BUTTON --- */}
//               {pendingOrders > 0 && (
//                 <Button
//                   variant="warning"
//                   className="text-dark fw-bold shadow-sm"
//                   onClick={handleSendReminders}
//                 >
//                   <FaCommentDots className="me-2" />
//                   Send Reminder to {pendingOrders} Pending
//                 </Button>
//               )}
//             </Card.Header>
//             <Card.Body className="p-0">
//               <Table hover responsive className="m-0 align-middle">
//                 <thead className="bg-light text-muted small text-uppercase">
//                   <tr>
//                     <th className="py-3 ps-4">Customer Name</th>
//                     <th>Contact</th>
//                     <th>Items</th>
//                     <th>Total Value</th>
//                     <th>Created At</th>
//                     <th>Payment Initiated</th>
//                     <th>Status</th>
//                     <th>Session</th>
//                     <th>Hub</th>
//                     <th className="pe-4 text-end">Date</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredOrders.length > 0 ? (
//                     filteredOrders.map((order) => (
//                       <tr key={order.id}>
//                         <td className="ps-4 fw-bold text-dark">
//                           <div className="fw-bold">{order.customerName}</div>
//                           <small className="text-muted">
//                             {order?.customerType}
//                           </small>
//                         </td>
//                         <td>{order.contact}</td>
//                         <td style={{ maxWidth: "250px" }} title={order.items}>
//                           <small className="text-dark bg-light px-2 py-1 rounded border">
//                             {order.items}
//                           </small>
//                         </td>
//                         <td className="fw-bold">₹{order.value}</td>
//                         <td>{order.createdAt}</td>
//                         <td>{order.paymentInitiatedAt}</td>
//                         <td>
//                           <Badge
//                             bg={getStatusBadge(order.status)}
//                             pill
//                             className="px-3"
//                           >
//                             {order.status}
//                           </Badge>
//                         </td>
//                         <td>{order.session}</td>
//                         <td>{order.hub?.hubName}</td>
//                         <td className="text-end pe-4 text-muted">
//                           {order.date}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="10" className="text-center py-4">
//                         <div className="text-muted">
//                           {loading ? (
//                             <div className="spinner-border spinner-border-sm me-2"></div>
//                           ) : (
//                             <FaSearch className="me-2" />
//                           )}
//                           No orders found matching your criteria
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </Card.Body>
//           </Card>
//         </>
//       )}
//     </div>
//   );
// };

// export default AdminPlanDashboard;

// import { useState, useEffect, useMemo, useCallback, useRef } from "react";
// import { Card, Table, Button, Form, Badge } from "react-bootstrap";
// import {
//   FaSearch,
//   FaDownload,
//   FaUtensils,
//   FaCheckCircle,
//   FaClock,
//   FaTimesCircle,
//   FaListAlt,
//   FaCommentDots,
//   FaBox,
// } from "react-icons/fa";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import "./Admin.css";
// import axios from "axios";
// import moment from "moment";
// import * as XLSX from "xlsx";

// const AdminPlanDashboard = () => {
//   const [activeView, setActiveView] = useState("sales");
//   const [startDate, setStartDate] = useState(new Date());
//   const [selectedSession, setSelectedSession] = useState("Lunch");
//   const [selectedHub, setSelectedHub] = useState("All Hubs");
//   const [hubs, setHubs] = useState([]);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState(null);
//   const [quantitySearch, setQuantitySearch] = useState("");

//   const [salesData, setSalesData] = useState([]);
//   const [ordersData, setOrdersData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [initialLoad, setInitialLoad] = useState(true);

//   const fetchData = useCallback(async () => {
//     if (!startDate || !selectedSession) return;

//     setLoading(true);
//     try {
//       const dateStr = moment(startDate).format("YYYY-MM-DD");
//       const params = {
//         date: dateStr,
//         session: selectedSession,
//         hubId: selectedHub,
//       };

//       // Fetch sales data when in sales or quantity view
//       if (activeView === "sales" || activeView === "quantity") {
//         const salesRes = await axios.get(
//           "https://dd-backend-3nm0.onrender.com/api/admin/plan/sales-tracker",
//           { params },
//         );
//         if (salesRes.data.success) setSalesData(salesRes.data.data);
//       }

//       // Fetch orders data when in orders view
//       if (activeView === "orders") {
//         const ordersRes = await axios.get(
//           "https://dd-backend-3nm0.onrender.com/api/admin/plan/orders-tracker",
//           { params },
//         );
//         if (ordersRes.data.success) {
//           setOrdersData(ordersRes.data.data);
//         }
//       }
//     } catch (error) {
//       console.error("Fetch error", error);
//     } finally {
//       setLoading(false);
//       setInitialLoad(false);
//     }
//   }, [activeView, startDate, selectedSession, selectedHub]);

//   const getHubs = useCallback(async () => {
//     try {
//       const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/Hub/hubs");
//       setHubs(res.data);
//     } catch (error) {
//       console.error("Failed to fetch hubs:", error);
//     }
//   }, []);

//   useEffect(() => {
//     getHubs();
//   }, [getHubs]);

//   // Fetch data when filters change
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchData();
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [fetchData]);

//   // Helper function to determine category
//   const getCategory = (foodName) => {
//     if (foodName.includes("Biryani")) return "Biryani";
//     if (foodName.includes("Chapati")) return "Meal Combo";
//     if (foodName.includes("Chole")) return "Curry";
//     if (foodName.includes("Pulao")) return "Rice";
//     if (foodName.includes("Rice")) return "Rice";
//     if (foodName.includes("Curry")) return "Curry";
//     return "Main Course";
//   };

//   // Reset status filter when switching to orders view
//   useEffect(() => {
//     if (activeView === "orders") {
//       setStatusFilter(null);
//     }
//   }, [activeView]);

//   // Calculate quantity data - Group by item name only
//   const quantityData = useMemo(() => {
//     if (!salesData.length) return [];

//     // Filter based on selected hub
//     let filteredSales = salesData;
//     if (selectedHub !== "All Hubs" && selectedHub !== "") {
//       const hubName = hubs.find((h) => h._id === selectedHub)?.hubName;
//       if (hubName) {
//         filteredSales = salesData.filter((item) => item.hubName === hubName);
//       }
//     }

//     // Group by item name
//     const itemMap = new Map();

//     filteredSales.forEach((item) => {
//       if (item.confirmed > 0) {
//         const existing = itemMap.get(item.foodName);
//         if (existing) {
//           existing.confirmedQuantity += item.confirmed;
//           existing.achievedSales += item.achievedSales;
//           // Keep the latest prices
//           existing.basePrice = item.basePrice;
//           existing.hubPrice = item.hubPrice;
//           existing.preOrderPrice = item.preOrderPrice;
//         } else {
//           itemMap.set(item.foodName, {
//             foodName: item.foodName,
//             confirmedQuantity: item.confirmed,
//             basePrice: item.basePrice,
//             hubPrice: item.hubPrice,
//             preOrderPrice: item.preOrderPrice,
//             achievedSales: item.achievedSales,
//             unit: "pcs",
//             category: getCategory(item.foodName),
//           });
//         }
//       }
//     });

//     // Convert map to array and sort
//     return Array.from(itemMap.values()).sort(
//       (a, b) => b.confirmedQuantity - a.confirmedQuantity,
//     );
//   }, [salesData, selectedHub, hubs]);

//   // Filter quantity data based on search
//   const filteredQuantityData = useMemo(() => {
//     if (!quantitySearch) return quantityData;

//     const query = quantitySearch.toLowerCase();
//     return quantityData.filter(
//       (item) =>
//         item.foodName.toLowerCase().includes(query) ||
//         (item.category && item.category.toLowerCase().includes(query)),
//     );
//   }, [quantityData, quantitySearch]);

//   // Filter orders based on search query and status filter
//   const filteredOrders = useMemo(() => {
//     return ordersData.filter((order) => {
//       if (statusFilter === "Confirmed" && order.status !== "Confirmed")
//         return false;
//       if (
//         statusFilter === "Pending Payment" &&
//         order.status !== "Pending Payment"
//       )
//         return false;
//       if (
//         statusFilter === "Skipped/Cancelled" &&
//         !(order.status === "Skipped" || order.status === "Cancelled")
//       )
//         return false;

//       if (searchQuery) {
//         const query = searchQuery.toLowerCase();
//         return (
//           (order.customerName &&
//             order.customerName.toLowerCase().includes(query)) ||
//           (order.contact && order.contact.toLowerCase().includes(query)) ||
//           (order.items && order.items.toLowerCase().includes(query))
//         );
//       }

//       return true;
//     });
//   }, [ordersData, searchQuery, statusFilter]);

//   console.log(filteredOrders);

//   // Calculate KPI counts from filtered orders
//   const totalOrders = filteredOrders.length;
//   const confirmedOrders = filteredOrders.filter(
//     (o) => o.status === "Confirmed",
//   ).length;
//   const pendingOrders = filteredOrders.filter(
//     (o) => o.status === "Pending Payment",
//   ).length;
//   const cancelledOrders = filteredOrders.filter(
//     (o) => o.status === "Skipped" || o.status === "Cancelled",
//   ).length;

//   // Handle KPI box clicks
//   const handleKpiClick = (filterType) => {
//     if (statusFilter === filterType) {
//       setStatusFilter(null);
//     } else {
//       setStatusFilter(filterType);
//     }
//   };

//   // Export report function
//   const handleExportReport = () => {
//     let dataToExport = [];
//     let fileName = "";

//     if (activeView === "sales") {
//       dataToExport = salesData.map((item) => ({
//         "Item Name": item.foodName,
//         "Hub Name": item.hubName,
//         "Total Reserved": item.totalPreOrder,
//         Confirmed: item.confirmed,
//         Pending: item.pending,
//         "Skipped/Cancelled": item.skipped,
//         "Base Price (₹)": item.basePrice,
//         "Hub Price (₹)": item.hubPrice,
//         "Pre-Order Price (₹)": item.preOrderPrice,
//         "Estimated Sales Value (₹)": item.estSalesValue,
//         "Achieved Sales (₹)": item.achievedSales,
//       }));
//       fileName = `sales-tracker_${moment(startDate).format("YYYY-MM-DD")}_${selectedSession}_${selectedHub || "all-hubs"}`;
//     } else if (activeView === "orders") {
//       dataToExport = filteredOrders.map((order) => ({
//         "Customer Name": order.customerName,
//         Contact: order.contact,
//         Items: order.items,
//         "Total Value (₹)": order.value,
//         Status: order.status,
//         "Created At": order.createdAt,
//         "Payment Initiated": order.paymentInitiatedAt,
//         Session: order.session,
//         Hub: order.hub?.hubName || "N/A",
//         Date: order.date,
//       }));
//       fileName = `orders-tracker_${moment(startDate).format("YYYY-MM-DD")}_${selectedSession}_${selectedHub || "all-hubs"}_${statusFilter || "all"}`;
//     } else if (activeView === "quantity") {
//       dataToExport = filteredQuantityData.map((item) => ({
//         "Item Name": item.foodName,
//         Category: item.category || "-",
//         Unit: item.unit || "pcs",
//         "Confirmed Quantity": item.confirmedQuantity,
//         "Base Price (₹)": item.basePrice,
//         "Hub Price (₹)": item.hubPrice,
//         "Pre-Order Price (₹)": item.preOrderPrice,
//         "Achieved Sales (₹)": item.achievedSales,
//         Session: selectedSession,
//         Date: moment(startDate).format("DD/MM/YYYY"),
//         "Hub Filter":
//           selectedHub === ""
//             ? "All Hubs"
//             : hubs.find((h) => h._id === selectedHub)?.hubName || selectedHub,
//       }));
//       fileName = `quantity-tracker_${moment(startDate).format("YYYY-MM-DD")}_${selectedSession}_${selectedHub || "all-hubs"}`;
//     }

//     if (dataToExport.length === 0) {
//       alert("No data to export!");
//       return;
//     }

//     const ws = XLSX.utils.json_to_sheet(dataToExport);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Report");
//     XLSX.writeFile(wb, `${fileName}.xlsx`);
//   };

//   const handleSendReminders = async () => {
//     if (!window.confirm(`Send WhatsApp reminder to pending customers?`)) return;
//     try {
//       const dateStr = moment(startDate).format("YYYY-MM-DD");
//       const res = await axios.post(
//         "https://dd-backend-3nm0.onrender.com/api/admin/plan/send-reminders",
//         {
//           date: dateStr,
//           session: selectedSession,
//           hubId: selectedHub,
//         },
//       );
//       console.log(res);
//       if (res.data.success) alert(res.data.message);
//     } catch (e) {
//       alert("Failed to send");
//     }
//   };

//   // Calculate total confirmed quantity
//   const totalConfirmedQuantity = useMemo(() => {
//     return filteredQuantityData.reduce(
//       (total, item) => total + (item.confirmedQuantity || 0),
//       0,
//     );
//   }, [filteredQuantityData]);

//   // Calculate total confirmed sales value
//   const totalConfirmedSales = useMemo(() => {
//     return filteredQuantityData.reduce(
//       (total, item) => total + (item.achievedSales || 0),
//       0,
//     );
//   }, [filteredQuantityData]);

//   // Clear all filters
//   const clearFilters = () => {
//     setSearchQuery("");
//     setStatusFilter(null);
//   };

//   // Get status badge color
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "Confirmed":
//         return "success";
//       case "Pending Payment":
//         return "warning";
//       case "Skipped":
//         return "secondary";
//       case "Cancelled":
//         return "danger";
//       default:
//         return "primary";
//     }
//   };

//   return (
//     <div
//       className="container-fluid p-4"
//       style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
//     >
//       {/* --- HEADER & TOGGLE SWITCH --- */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div>
//           <h2 style={{ color: "#4b5563", fontWeight: "800", margin: 0 }}>
//             My Plan Management
//           </h2>
//           <p className="text-muted mb-0">Track future reservations and sales</p>
//         </div>

//         <div className="bg-white p-1 rounded-pill shadow-sm border d-flex">
//           <Button
//             variant={activeView === "sales" ? "success" : "light"}
//             className={`rounded-pill px-4 fw-bold ${
//               activeView === "sales" ? "" : "text-muted"
//             }`}
//             onClick={() => setActiveView("sales")}
//             style={{ minWidth: "160px" }}
//             disabled={loading}
//           >
//             <FaUtensils className="me-2" /> Sales Tracker
//           </Button>
//           <Button
//             variant={activeView === "orders" ? "success" : "light"}
//             className={`rounded-pill px-4 fw-bold ${
//               activeView === "orders" ? "" : "text-muted"
//             }`}
//             onClick={() => setActiveView("orders")}
//             style={{ minWidth: "160px" }}
//             disabled={loading}
//           >
//             <FaListAlt className="me-2" /> Orders Tracker
//           </Button>
//           <Button
//             variant={activeView === "quantity" ? "success" : "light"}
//             className={`rounded-pill px-4 fw-bold ${
//               activeView === "quantity" ? "" : "text-muted"
//             }`}
//             onClick={() => setActiveView("quantity")}
//             style={{ minWidth: "160px" }}
//             disabled={loading}
//           >
//             <FaBox className="me-2" /> Quantity Tracker
//           </Button>
//         </div>
//       </div>

//       {/* --- COMMON FILTERS --- */}
//       <Card
//         className="shadow-sm border-0 mb-4"
//         style={{ overflow: "visible", zIndex: 10 }}
//       >
//         <Card.Body className="py-3">
//           <div className="row g-3 align-items-end">
//             <div className="col-md-3">
//               <label className="small fw-bold text-muted mb-1">
//                 Select Date
//               </label>
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setStartDate(date)}
//                 className="form-control"
//                 popperProps={{ strategy: "fixed" }}
//                 dateFormat="dd/MM/yyyy"
//                 disabled={loading}
//               />
//             </div>
//             <div className="col-md-3">
//               <label className="small fw-bold text-muted mb-1">
//                 Select Session
//               </label>
//               <Form.Select
//                 value={selectedSession}
//                 onChange={(e) => setSelectedSession(e.target.value)}
//                 disabled={loading}
//               >
//                 <option>Lunch</option>
//                 <option>Dinner</option>
//               </Form.Select>
//             </div>
//             <div className="col-md-3">
//               <label className="small fw-bold text-muted mb-1">
//                 Select Hub
//               </label>
//               <Form.Select
//                 value={selectedHub}
//                 onChange={(e) => setSelectedHub(e.target.value)}
//                 disabled={loading}
//               >
//                 <option value="">All Hubs</option>
//                 {hubs?.map((hub) => (
//                   <option key={hub._id} value={hub._id}>
//                     {hub?.hubName}
//                   </option>
//                 ))}
//               </Form.Select>
//             </div>
//             <div className="col-md-3 text-end">
//               <Button
//                 variant="outline-success"
//                 className="fw-bold"
//                 onClick={handleExportReport}
//                 disabled={
//                   loading ||
//                   (activeView === "sales"
//                     ? salesData.length === 0
//                     : activeView === "orders"
//                       ? filteredOrders.length === 0
//                       : filteredQuantityData.length === 0)
//                 }
//               >
//                 <FaDownload className="me-2" />
//                 Export Report
//               </Button>
//             </div>
//           </div>
//         </Card.Body>
//       </Card>

//       {/* Single Loader at the top */}
//       {loading && (
//         <div className="text-center mb-3">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <p className="text-primary mt-2">Loading data...</p>
//         </div>
//       )}

//       {/* ========================================== */}
//       {/* VIEW 1: PLANNED SALES TRACKER */}
//       {/* ========================================== */}
//       {activeView === "sales" && (
//         <Card className="shadow-sm border-0">
//           <Card.Header className="bg-white py-3 border-bottom">
//             <div>
//               <h5 className="m-0 fw-bold text-dark">Item Sales Performance</h5>
//               <small className="text-muted">
//                 Date: {moment(startDate).format("DD/MM/YYYY")} | Session:{" "}
//                 {selectedSession} | Hub:{" "}
//                 {selectedHub === ""
//                   ? "All Hubs"
//                   : hubs.find((h) => h._id === selectedHub)?.hubName ||
//                     selectedHub}
//               </small>
//             </div>
//           </Card.Header>
//           <Card.Body className="p-0">
//             <Table hover responsive className="m-0 align-middle">
//               <thead className="bg-light text-uppercase small text-muted">
//                 <tr>
//                   <th className="py-3 ps-4">Item Name</th>
//                   <th>Hub Name</th>
//                   <th className="text-center">Total Rsrvd</th>
//                   <th className="text-center">Confirmed</th>
//                   <th className="text-center">Pending</th>
//                   <th className="text-center">Skipped/Cancelled</th>
//                   <th className="text-center bg-light border-start">Base ₹</th>
//                   <th className="text-center bg-light">Hub ₹</th>
//                   <th className="text-center bg-warning bg-opacity-10 text-dark">
//                     Pre-Order ₹
//                   </th>
//                   <th className="text-end border-start">Est. Sales Value</th>
//                   <th className="text-end pe-4 text-success">Achieved Sales</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {initialLoad ? (
//                   <tr>
//                     <td colSpan="11" className="text-center py-5">
//                       <div className="text-muted">
//                         Select filters and click "Apply" to view data
//                       </div>
//                     </td>
//                   </tr>
//                 ) : salesData.length > 0 ? (
//                   salesData.map((item) => (
//                     <tr key={item.id}>
//                       <td className="ps-4 fw-bold text-dark">
//                         {item.foodName}
//                       </td>
//                       <td className="text-muted small">{item.hubName}</td>
//                       <td className="text-center fw-bold bg-light">
//                         {item.totalPreOrder}
//                       </td>
//                       <td className="text-center text-success fw-bold">
//                         {item.confirmed}
//                       </td>
//                       <td className="text-center text-warning fw-bold">
//                         {item.pending}
//                       </td>
//                       <td className="text-center text-danger">
//                         {item.skipped}
//                       </td>
//                       <td className="text-center border-start text-muted">
//                         {item.basePrice}
//                       </td>
//                       <td className="text-center text-muted">
//                         {item.hubPrice}
//                       </td>
//                       <td className="text-center fw-bold bg-warning bg-opacity-10">
//                         {item.preOrderPrice}
//                       </td>
//                       <td className="text-end border-start text-muted">
//                         ₹{item?.estSalesValue}
//                       </td>
//                       <td className="text-end pe-4 fw-bolder text-success">
//                         ₹{item?.achievedSales}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="11" className="text-center py-5">
//                       <div className="text-muted">
//                         No sales data found for the selected filters
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </Table>
//           </Card.Body>
//         </Card>
//       )}

//       {/* ========================================== */}
//       {/* VIEW 2: PLANNED ORDERS TRACKER */}
//       {/* ========================================== */}
//       {activeView === "orders" && (
//         <>
//           {/* KPI BOXES */}
//           <div className="row g-3 mb-4">
//             <div className="col-md-3">
//               <Card
//                 className={`border-0 shadow-sm border-start border-4 border-primary p-3 ${statusFilter === null ? "active-kpi" : ""}`}
//                 style={{
//                   cursor: "pointer",
//                   transform: statusFilter === null ? "scale(1.02)" : "scale(1)",
//                   transition: "transform 0.2s",
//                   backgroundColor:
//                     statusFilter === null
//                       ? "rgba(13, 110, 253, 0.05)"
//                       : "white",
//                 }}
//                 onClick={() => handleKpiClick(null)}
//                 disabled={loading}
//               >
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Total Orders
//                     </div>
//                     <h3 className="fw-bold text-dark mb-0">{totalOrders}</h3>
//                   </div>
//                   <div className="bg-primary bg-opacity-10 p-3 rounded-circle-no-border text-primary">
//                     <FaListAlt size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//             <div className="col-md-3">
//               <Card
//                 className={`border-0 shadow-sm border-start border-4 border-success p-3 ${statusFilter === "Confirmed" ? "active-kpi" : ""}`}
//                 style={{
//                   cursor: "pointer",
//                   transform:
//                     statusFilter === "Confirmed" ? "scale(1.02)" : "scale(1)",
//                   transition: "transform 0.2s",
//                   backgroundColor:
//                     statusFilter === "Confirmed"
//                       ? "rgba(25, 135, 84, 0.05)"
//                       : "white",
//                 }}
//                 onClick={() => handleKpiClick("Confirmed")}
//                 disabled={loading}
//               >
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Confirmed
//                     </div>
//                     <h3 className="fw-bold text-success mb-0">
//                       {confirmedOrders}
//                     </h3>
//                   </div>
//                   <div className="bg-success bg-opacity-10 p-3 rounded-circle-no-border text-success">
//                     <FaCheckCircle size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//             <div className="col-md-3">
//               <Card
//                 className={`border-0 shadow-sm border-start border-4 border-warning p-3 ${statusFilter === "Pending Payment" ? "active-kpi" : ""}`}
//                 style={{
//                   cursor: "pointer",
//                   transform:
//                     statusFilter === "Pending Payment"
//                       ? "scale(1.02)"
//                       : "scale(1)",
//                   transition: "transform 0.2s",
//                   backgroundColor:
//                     statusFilter === "Pending Payment"
//                       ? "rgba(255, 193, 7, 0.05)"
//                       : "white",
//                 }}
//                 onClick={() => handleKpiClick("Pending Payment")}
//                 disabled={loading}
//               >
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Yet to Confirm
//                     </div>
//                     <h3 className="fw-bold text-warning mb-0">
//                       {pendingOrders}
//                     </h3>
//                   </div>
//                   <div className="bg-warning bg-opacity-10 p-3 rounded-circle-no-border text-warning">
//                     <FaClock size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//             <div className="col-md-3">
//               <Card
//                 className={`border-0 shadow-sm border-start border-4 border-danger p-3 ${statusFilter === "Skipped/Cancelled" ? "active-kpi" : ""}`}
//                 style={{
//                   cursor: "pointer",
//                   transform:
//                     statusFilter === "Skipped/Cancelled"
//                       ? "scale(1.02)"
//                       : "scale(1)",
//                   transition: "transform 0.2s",
//                   backgroundColor:
//                     statusFilter === "Skipped/Cancelled"
//                       ? "rgba(220, 53, 69, 0.05)"
//                       : "white",
//                 }}
//                 onClick={() => handleKpiClick("Skipped/Cancelled")}
//                 disabled={loading}
//               >
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <div className="text-muted small fw-bold text-uppercase">
//                       Skip / Cancel
//                     </div>
//                     <h3 className="fw-bold text-danger mb-0">
//                       {cancelledOrders}
//                     </h3>
//                   </div>
//                   <div className="bg-danger bg-opacity-10 p-3 rounded-circle-no-border text-danger">
//                     <FaTimesCircle size={24} />
//                   </div>
//                 </div>
//               </Card>
//             </div>
//           </div>

//           {/* Active filters indicator */}
//           {(statusFilter || searchQuery) && (
//             <div className="mb-3">
//               <div className="d-flex align-items-center gap-2">
//                 <small className="text-muted fw-bold">Active Filters:</small>
//                 {statusFilter && (
//                   <Badge bg="info" pill className="px-3 py-2">
//                     Status: {statusFilter}
//                     <button
//                       className="btn-close btn-close-white ms-2"
//                       style={{ fontSize: "0.6rem" }}
//                       onClick={() => setStatusFilter(null)}
//                       aria-label="Remove filter"
//                       disabled={loading}
//                     ></button>
//                   </Badge>
//                 )}
//                 {searchQuery && (
//                   <Badge bg="secondary" pill className="px-3 py-2">
//                     Search: "{searchQuery}"
//                     <button
//                       className="btn-close btn-close-white ms-2"
//                       style={{ fontSize: "0.6rem" }}
//                       onClick={() => setSearchQuery("")}
//                       aria-label="Remove search"
//                       disabled={loading}
//                     ></button>
//                   </Badge>
//                 )}
//                 {(statusFilter || searchQuery) && (
//                   <Button
//                     variant="outline-secondary"
//                     size="sm"
//                     onClick={clearFilters}
//                     disabled={loading}
//                   >
//                     Clear All
//                   </Button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ORDERS TABLE */}
//           <Card className="shadow-sm border-0">
//             <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
//               <div className="d-flex align-items-center gap-3">
//                 <div>
//                   <h5 className="m-0 fw-bold text-dark">Customer Orders</h5>
//                   <small className="text-muted">
//                     Date: {moment(startDate).format("DD/MM/YYYY")} | Session:{" "}
//                     {selectedSession} | Hub:{" "}
//                     {selectedHub === ""
//                       ? "All Hubs"
//                       : hubs.find((h) => h._id === selectedHub)?.hubName ||
//                         selectedHub}
//                   </small>
//                 </div>
//                 <div className="input-group" style={{ maxWidth: "300px" }}>
//                   <span className="input-group-text bg-light border-end-0">
//                     <FaSearch className="text-muted" />
//                   </span>
//                   <Form.Control
//                     placeholder="Search customer, contact, or items..."
//                     className="border-start-0 bg-light shadow-none"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     disabled={loading}
//                   />
//                 </div>
//               </div>

//               {pendingOrders > 0 && (
//                 <Button
//                   variant="warning"
//                   className="text-dark fw-bold shadow-sm"
//                   onClick={handleSendReminders}
//                   disabled={loading}
//                 >
//                   <FaCommentDots className="me-2" />
//                   Send Reminder to {pendingOrders} Pending
//                 </Button>
//               )}
//             </Card.Header>
//             <Card.Body className="p-0">
//               <Table hover responsive className="m-0 align-middle">
//                 <thead className="bg-light text-muted small text-uppercase">
//                   <tr>
//                     <th className="py-3 ps-4">Customer Name</th>
//                     <th>Contact</th>
//                     <th>Items</th>
//                     <th>Total Value</th>
//                     <th>Created At</th>
//                     <th>Payment Initiated</th>
//                     <th>Status</th>
//                     <th>Session</th>
//                     <th>Hub</th>
//                     <th>Delivery Location</th>
//                     <th className="pe-4 text-end">Date</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {initialLoad ? (
//                     <tr>
//                       <td colSpan="10" className="text-center py-5">
//                         <div className="text-muted">
//                           Select filters and click "Apply" to view data
//                         </div>
//                       </td>
//                     </tr>
//                   ) : ordersData.length > 0 && filteredOrders.length === 0 ? (
//                     <tr>
//                       <td colSpan="10" className="text-center py-4">
//                         <div className="text-muted">
//                           <FaSearch className="me-2" />
//                           No orders found matching your criteria
//                         </div>
//                       </td>
//                     </tr>
//                   ) : filteredOrders.length > 0 ? (
//                     filteredOrders.map((order) => (
//                       <tr key={order.id}>
//                         <td className="ps-4 fw-bold text-dark">
//                           {order.customerName}
//                         </td>
//                         <td>{order.contact}</td>
//                         <td style={{ maxWidth: "250px" }} title={order.items}>
//                           <small className="text-dark bg-light px-2 py-1 rounded border">
//                             {order.items}
//                           </small>
//                         </td>
//                         <td className="fw-bold">₹{order.value}</td>
//                         <td>{order.createdAt}</td>
//                         <td>{order.paymentInitiatedAt}</td>
//                         <td>
//                           <Badge
//                             bg={getStatusBadge(order.status)}
//                             pill
//                             className="px-3"
//                           >
//                             {order.status}
//                           </Badge>
//                         </td>
//                         <td>{order.session}</td>
//                         <td>{order.hub?.hubName}</td>
//                         <td className="text-muted small">
//                           {order.deliveryLocation}
//                         </td>

//                         <td className="text-end pe-4 text-muted">
//                           {order.date}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="10" className="text-center py-5">
//                         <div className="text-muted">
//                           No order data found for the selected filters
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </Card.Body>
//           </Card>
//         </>
//       )}

//       {/* ========================================== */}
//       {/* VIEW 3: QUANTITY TRACKER */}
//       {/* ========================================== */}
//       {activeView === "quantity" && (
//         <Card className="shadow-sm border-0">
//           <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
//             <div>
//               <h5 className="m-0 fw-bold text-dark">
//                 Confirmed Items Quantity
//               </h5>
//               <small className="text-muted">
//                 Date: {moment(startDate).format("DD/MM/YYYY")} | Session:{" "}
//                 {selectedSession} |
//                 {selectedHub === "" ? (
//                   "All Hubs"
//                 ) : (
//                   <>
//                     Hub:{" "}
//                     {hubs.find((h) => h._id === selectedHub)?.hubName ||
//                       selectedHub}
//                   </>
//                 )}
//               </small>
//             </div>
//             <div className="d-flex align-items-center gap-2">
//               <Badge bg="success" pill className="px-3 py-2">
//                 <FaCheckCircle className="me-1" /> Total:{" "}
//                 {totalConfirmedQuantity} items
//               </Badge>
//               <Badge bg="primary" pill className="px-3 py-2">
//                 ₹{totalConfirmedSales.toLocaleString("en-IN")}
//               </Badge>
//               <div className="input-group" style={{ maxWidth: "250px" }}>
//                 <span className="input-group-text bg-light border-end-0">
//                   <FaSearch className="text-muted" />
//                 </span>
//                 <Form.Control
//                   placeholder="Search items..."
//                   className="border-start-0 bg-light shadow-none"
//                   value={quantitySearch}
//                   onChange={(e) => setQuantitySearch(e.target.value)}
//                   disabled={loading}
//                 />
//               </div>
//             </div>
//           </Card.Header>
//           <Card.Body className="p-0">
//             <Table hover responsive className="m-0 align-middle">
//               <thead className="bg-light text-uppercase small text-muted">
//                 <tr>
//                   <th className="py-3 ps-4">Item Name</th>
//                   <th className="text-center">Category</th>
//                   <th className="text-center">Unit</th>
//                   <th className="text-center bg-success bg-opacity-10 text-success">
//                     Confirmed Qty
//                   </th>
//                   <th className="text-center bg-light border-start">
//                     Base Price
//                   </th>
//                   <th className="text-center bg-light">Hub Price</th>
//                   <th className="text-center bg-warning bg-opacity-10">
//                     Pre-Order Price
//                   </th>
//                   <th className="text-end pe-4 text-success">Achieved Sales</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {initialLoad ? (
//                   <tr>
//                     <td colSpan="8" className="text-center py-5">
//                       <div className="text-muted">
//                         Select filters and click "Apply" to view data
//                       </div>
//                     </td>
//                   </tr>
//                 ) : filteredQuantityData.length > 0 ? (
//                   filteredQuantityData.map((item, index) => (
//                     <tr key={index}>
//                       <td className="ps-4 fw-bold text-dark">
//                         <div className="d-flex align-items-center">
//                           <FaBox className="me-2 text-primary" />
//                           {item.foodName}
//                         </div>
//                       </td>
//                       <td className="text-center">
//                         <Badge bg="light" text="dark" className="border">
//                           {item.category}
//                         </Badge>
//                       </td>
//                       <td className="text-center text-muted">{item.unit}</td>
//                       <td className="text-center fw-bold bg-success bg-opacity-10 text-success">
//                         <div className="d-flex align-items-center justify-content-center">
//                           <FaCheckCircle className="me-2" />
//                           {item.confirmedQuantity}
//                         </div>
//                       </td>
//                       <td className="text-center border-start text-muted">
//                         ₹{item.basePrice}
//                       </td>
//                       <td className="text-center text-muted">
//                         ₹{item.hubPrice}
//                       </td>
//                       <td className="text-center fw-bold bg-warning bg-opacity-10">
//                         ₹{item.preOrderPrice}
//                       </td>
//                       <td className="text-end pe-4 fw-bolder text-success">
//                         ₹{item.achievedSales}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="8" className="text-center py-5">
//                       <div className="text-muted">
//                         <FaBox className="display-6 mb-3 text-muted" />
//                         <h5>No confirmed items found</h5>
//                         <p className="mb-0">
//                           {salesData.length > 0
//                             ? "There are no confirmed orders for the selected filters."
//                             : "No data available. Please check your filters or try a different date/session."}
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//               {filteredQuantityData.length > 0 && (
//                 <tfoot className="bg-light">
//                   <tr>
//                     <td colSpan="3" className="ps-4 fw-bold text-end">
//                       Total:
//                     </td>
//                     <td className="text-center fw-bold bg-success bg-opacity-25 text-success">
//                       {totalConfirmedQuantity}
//                     </td>
//                     <td colSpan="3" className="text-end fw-bold">
//                       Total Sales:
//                     </td>
//                     <td className="text-end pe-4 fw-bold text-success">
//                       ₹{totalConfirmedSales.toLocaleString("en-IN")}
//                     </td>
//                   </tr>
//                 </tfoot>
//               )}
//             </Table>
//           </Card.Body>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default AdminPlanDashboard;

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, Table, Button, Form, Badge, Modal } from "react-bootstrap";
import {
  FaSearch,
  FaDownload,
  FaUtensils,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaListAlt,
  FaCommentDots,
  FaBox,
  FaTrash,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Admin.css";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const AdminPlanDashboard = () => {
  const [activeView, setActiveView] = useState("sales");
  const [startDate, setStartDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState("Lunch");
  const [selectedHub, setSelectedHub] = useState("All Hubs");
  const [hubs, setHubs] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [quantitySearch, setQuantitySearch] = useState("");

  const [salesData, setSalesData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!startDate || !selectedSession) return;

    setLoading(true);
    try {
      const dateStr = moment(startDate).format("YYYY-MM-DD");
      const params = {
        date: dateStr,
        session: selectedSession,
        hubId: selectedHub,
      };

      // Fetch sales data when in sales or quantity view
      if (activeView === "sales" || activeView === "quantity") {
        const salesRes = await axios.get(
          "https://dd-backend-3nm0.onrender.com/api/admin/plan/sales-tracker",
          { params },
        );
        if (salesRes.data.success) setSalesData(salesRes.data.data);
      }

      // Fetch orders data when in orders view
      if (activeView === "orders") {
        const ordersRes = await axios.get(
          "https://dd-backend-3nm0.onrender.com/api/admin/plan/orders-tracker",
          { params },
        );
        if (ordersRes.data.success) {
          setOrdersData(ordersRes.data.data);
        }
      }
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [activeView, startDate, selectedSession, selectedHub]);

  const getHubs = useCallback(async () => {
    try {
      const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/Hub/hubs");
      setHubs(res.data);
    } catch (error) {
      console.error("Failed to fetch hubs:", error);
    }
  }, []);

  useEffect(() => {
    getHubs();
  }, [getHubs]);

  // Fetch data when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchData]);

  // Helper function to determine category
  const getCategory = (foodName) => {
    if (foodName.includes("Biryani")) return "Biryani";
    if (foodName.includes("Chapati")) return "Meal Combo";
    if (foodName.includes("Chole")) return "Curry";
    if (foodName.includes("Pulao")) return "Rice";
    if (foodName.includes("Rice")) return "Rice";
    if (foodName.includes("Curry")) return "Curry";
    return "Main Course";
  };

  // Reset status filter when switching to orders view
  useEffect(() => {
    if (activeView === "orders") {
      setStatusFilter(null);
    }
  }, [activeView]);

  // Calculate quantity data - Group by item name only
  const quantityData = useMemo(() => {
    if (!salesData.length) return [];

    // Filter based on selected hub
    let filteredSales = salesData;
    if (selectedHub !== "All Hubs" && selectedHub !== "") {
      const hubName = hubs.find((h) => h._id === selectedHub)?.hubName;
      if (hubName) {
        filteredSales = salesData.filter((item) => item.hubName === hubName);
      }
    }

    // Group by item name
    const itemMap = new Map();

    filteredSales.forEach((item) => {
      if (item.confirmed > 0) {
        const existing = itemMap.get(item.foodName);
        if (existing) {
          existing.confirmedQuantity += item.confirmed;
          existing.achievedSales += item.achievedSales;
          // Keep the latest prices
          existing.basePrice = item.basePrice;
          existing.hubPrice = item.hubPrice;
          existing.preOrderPrice = item.preOrderPrice;
        } else {
          itemMap.set(item.foodName, {
            foodName: item.foodName,
            confirmedQuantity: item.confirmed,
            basePrice: item.basePrice,
            hubPrice: item.hubPrice,
            preOrderPrice: item.preOrderPrice,
            achievedSales: item.achievedSales,
            unit: "pcs",
            category: getCategory(item.foodName),
          });
        }
      }
    });

    // Convert map to array and sort
    return Array.from(itemMap.values()).sort(
      (a, b) => b.confirmedQuantity - a.confirmedQuantity,
    );
  }, [salesData, selectedHub, hubs]);

  // Filter quantity data based on search
  const filteredQuantityData = useMemo(() => {
    if (!quantitySearch) return quantityData;

    const query = quantitySearch.toLowerCase();
    return quantityData.filter(
      (item) =>
        item.foodName.toLowerCase().includes(query) ||
        (item.category && item.category.toLowerCase().includes(query)),
    );
  }, [quantityData, quantitySearch]);

  // Filter orders based on search query and status filter
  const filteredOrders = useMemo(() => {
    return ordersData.filter((order) => {
      if (statusFilter === "Confirmed" && order.status !== "Confirmed")
        return false;
      if (
        statusFilter === "Pending Payment" &&
        order.status !== "Pending Payment"
      )
        return false;
      if (
        statusFilter === "Skipped/Cancelled" &&
        !(order.status === "Skipped" || order.status === "Cancelled")
      )
        return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (order.customerName &&
            order.customerName.toLowerCase().includes(query)) ||
          (order.contact && order.contact.toLowerCase().includes(query)) ||
          (order.items && order.items.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [ordersData, searchQuery, statusFilter]);

  console.log(filteredOrders);

  // Calculate KPI counts from filtered orders
  const totalOrders = filteredOrders.length;
  const confirmedOrders = filteredOrders.filter(
    (o) => o.status === "Confirmed",
  ).length;
  const pendingOrders = filteredOrders.filter(
    (o) => o.status === "Pending Payment",
  ).length;
  const cancelledOrders = filteredOrders.filter(
    (o) => o.status === "Skipped" || o.status === "Cancelled",
  ).length;

  // Handle KPI box clicks
  const handleKpiClick = (filterType) => {
    if (statusFilter === filterType) {
      setStatusFilter(null);
    } else {
      setStatusFilter(filterType);
    }
  };

  // Export report function
  const handleExportReport = () => {
    let dataToExport = [];
    let fileName = "";

    if (activeView === "sales") {
      dataToExport = salesData.map((item) => ({
        "Item Name": item.foodName,
        "Hub Name": item.hubName,
        "Total Reserved": item.totalPreOrder,
        Confirmed: item.confirmed,
        Pending: item.pending,
        "Skipped/Cancelled": item.skipped,
        "Base Price (₹)": item.basePrice,
        "Hub Price (₹)": item.hubPrice,
        "Pre-Order Price (₹)": item.preOrderPrice,
        "Estimated Sales Value (₹)": item.estSalesValue,
        "Achieved Sales (₹)": item.achievedSales,
      }));
      fileName = `sales-tracker_${moment(startDate).format("YYYY-MM-DD")}_${selectedSession}_${selectedHub || "all-hubs"}`;
    } else if (activeView === "orders") {
      dataToExport = filteredOrders.map((order) => ({
        "Customer Name": order.customerName,
        Contact: order.contact,
        Items: order.items,
        "Total Value (₹)": order.value,
        Status: order.status,
        "Created At": order.createdAt,
        "Payment Initiated": order.paymentInitiatedAt,
        Session: order.session,
        Hub: order.hub?.hubName || "N/A",
        Date: order.date,
      }));
      fileName = `orders-tracker_${moment(startDate).format("YYYY-MM-DD")}_${selectedSession}_${selectedHub || "all-hubs"}_${statusFilter || "all"}`;
    } else if (activeView === "quantity") {
      dataToExport = filteredQuantityData.map((item) => ({
        "Item Name": item.foodName,
        Category: item.category || "-",
        Unit: item.unit || "pcs",
        "Confirmed Quantity": item.confirmedQuantity,
        "Base Price (₹)": item.basePrice,
        "Hub Price (₹)": item.hubPrice,
        "Pre-Order Price (₹)": item.preOrderPrice,
        "Achieved Sales (₹)": item.achievedSales,
        Session: selectedSession,
        Date: moment(startDate).format("DD/MM/YYYY"),
        "Hub Filter":
          selectedHub === ""
            ? "All Hubs"
            : hubs.find((h) => h._id === selectedHub)?.hubName || selectedHub,
      }));
      fileName = `quantity-tracker_${moment(startDate).format("YYYY-MM-DD")}_${selectedSession}_${selectedHub || "all-hubs"}`;
    }

    if (dataToExport.length === 0) {
      alert("No data to export!");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const handleSendReminders = async () => {
    if (!window.confirm(`Send WhatsApp reminder to pending customers?`)) return;
    try {
      const dateStr = moment(startDate).format("YYYY-MM-DD");
      const res = await axios.post(
        "https://dd-backend-3nm0.onrender.com/api/admin/plan/send-reminders",
        {
          date: dateStr,
          session: selectedSession,
          hubId: selectedHub,
        },
      );
      console.log(res);
      if (res.data.success) alert(res.data.message);
    } catch (e) {
      alert("Failed to send");
    }
  };

  // Handle delete plan
  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    console.log(planToDelete, ".................");

    setDeleting(true);
    try {
      const response = await axios.post(
        "https://dd-backend-3nm0.onrender.com/api/user/plan/delete-plan",
        {
          planId: planToDelete.id,
          userId: planToDelete.customerId,
        },
      );

      if (response.data.success) {
        toast.success("Plan deleted successfully");
        // Refresh the data
        fetchData();
      } else {
        toast.error(response.data.error || "Failed to delete plan");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Error deleting plan");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setPlanToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  // Calculate total confirmed quantity
  const totalConfirmedQuantity = useMemo(() => {
    return filteredQuantityData.reduce(
      (total, item) => total + (item.confirmedQuantity || 0),
      0,
    );
  }, [filteredQuantityData]);

  // Calculate total confirmed sales value
  const totalConfirmedSales = useMemo(() => {
    return filteredQuantityData.reduce(
      (total, item) => total + (item.achievedSales || 0),
      0,
    );
  }, [filteredQuantityData]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return "success";
      case "Pending Payment":
        return "warning";
      case "Skipped":
        return "secondary";
      case "Cancelled":
        return "danger";
      default:
        return "primary";
    }
  };

  return (
    <div
      className="container-fluid p-4"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger">
            <FaTrash className="me-2" />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {planToDelete && (
            <>
              <p className="mb-3">Are you sure you want to delete this plan?</p>
              <div className="bg-light p-3 rounded">
                <p className="mb-2">
                  <strong>Customer:</strong> {planToDelete.customerName}
                </p>
                <p className="mb-2">
                  <strong>Contact:</strong> {planToDelete.contact}
                </p>
                <p className="mb-2">
                  <strong>Items:</strong> {planToDelete.items}
                </p>
                <p className="mb-2">
                  <strong>Value:</strong> ₹{planToDelete.value}
                </p>
                <p className="mb-2">
                  <strong>Status:</strong> {planToDelete.status}
                </p>
                <p className="mb-0">
                  <strong>Session:</strong> {planToDelete.session} -{" "}
                  {planToDelete.date}
                </p>
              </div>
              <p className="text-danger mt-3 small">
                <FaTimesCircle className="me-1" />
                This action cannot be undone.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="secondary"
            onClick={handleDeleteCancel}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Delete Plan
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- HEADER & TOGGLE SWITCH --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ color: "#4b5563", fontWeight: "800", margin: 0 }}>
            My Plan Management
          </h2>
          <p className="text-muted mb-0">Track future reservations and sales</p>
        </div>

        <div className="bg-white p-1 rounded-pill shadow-sm border d-flex">
          <Button
            variant={activeView === "sales" ? "success" : "light"}
            className={`rounded-pill px-4 fw-bold ${
              activeView === "sales" ? "" : "text-muted"
            }`}
            onClick={() => setActiveView("sales")}
            style={{ minWidth: "160px" }}
            disabled={loading}
          >
            <FaUtensils className="me-2" /> Sales Tracker
          </Button>
          <Button
            variant={activeView === "orders" ? "success" : "light"}
            className={`rounded-pill px-4 fw-bold ${
              activeView === "orders" ? "" : "text-muted"
            }`}
            onClick={() => setActiveView("orders")}
            style={{ minWidth: "160px" }}
            disabled={loading}
          >
            <FaListAlt className="me-2" /> Orders Tracker
          </Button>
          <Button
            variant={activeView === "quantity" ? "success" : "light"}
            className={`rounded-pill px-4 fw-bold ${
              activeView === "quantity" ? "" : "text-muted"
            }`}
            onClick={() => setActiveView("quantity")}
            style={{ minWidth: "160px" }}
            disabled={loading}
          >
            <FaBox className="me-2" /> Quantity Tracker
          </Button>
        </div>
      </div>

      {/* --- COMMON FILTERS --- */}
      <Card
        className="shadow-sm border-0 mb-4"
        style={{ overflow: "visible", zIndex: 10 }}
      >
        <Card.Body className="py-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="small fw-bold text-muted mb-1">
                Select Date
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="form-control"
                popperProps={{ strategy: "fixed" }}
                dateFormat="dd/MM/yyyy"
                disabled={loading}
              />
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-muted mb-1">
                Select Session
              </label>
              <Form.Select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                disabled={loading}
              >
                <option>Lunch</option>
                <option>Dinner</option>
              </Form.Select>
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-muted mb-1">
                Select Hub
              </label>
              <Form.Select
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                disabled={loading}
              >
                <option value="">All Hubs</option>
                {hubs?.map((hub) => (
                  <option key={hub._id} value={hub._id}>
                    {hub?.hubName}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-3 text-end">
              <Button
                variant="outline-success"
                className="fw-bold"
                onClick={handleExportReport}
                disabled={
                  loading ||
                  (activeView === "sales"
                    ? salesData.length === 0
                    : activeView === "orders"
                      ? filteredOrders.length === 0
                      : filteredQuantityData.length === 0)
                }
              >
                <FaDownload className="me-2" />
                Export Report
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Single Loader at the top */}
      {loading && (
        <div className="text-center mb-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-primary mt-2">Loading data...</p>
        </div>
      )}

      {/* ========================================== */}
      {/* VIEW 1: PLANNED SALES TRACKER */}
      {/* ========================================== */}
      {activeView === "sales" && (
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white py-3 border-bottom">
            <div>
              <h5 className="m-0 fw-bold text-dark">Item Sales Performance</h5>
              <small className="text-muted">
                Date: {moment(startDate).format("DD/MM/YYYY")} | Session:{" "}
                {selectedSession} | Hub:{" "}
                {selectedHub === ""
                  ? "All Hubs"
                  : hubs.find((h) => h._id === selectedHub)?.hubName ||
                    selectedHub}
              </small>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="m-0 align-middle">
              <thead className="bg-light text-uppercase small text-muted">
                <tr>
                  <th className="py-3 ps-4">Item Name</th>
                  <th>Hub Name</th>
                  <th className="text-center">Total Rsrvd</th>
                  <th className="text-center">Confirmed</th>
                  <th className="text-center">Pending</th>
                  <th className="text-center">Skipped/Cancelled</th>
                  <th className="text-center bg-light border-start">Base ₹</th>
                  <th className="text-center bg-light">Hub ₹</th>
                  <th className="text-center bg-warning bg-opacity-10 text-dark">
                    Pre-Order ₹
                  </th>
                  <th className="text-end border-start">Est. Sales Value</th>
                  <th className="text-end pe-4 text-success">Achieved Sales</th>
                </tr>
              </thead>
              <tbody>
                {initialLoad ? (
                  <tr>
                    <td colSpan="11" className="text-center py-5">
                      <div className="text-muted">
                        Select filters and click "Apply" to view data
                      </div>
                    </td>
                  </tr>
                ) : salesData.length > 0 ? (
                  salesData.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4 fw-bold text-dark">
                        {item.foodName}
                      </td>
                      <td className="text-muted small">{item.hubName}</td>
                      <td className="text-center fw-bold bg-light">
                        {item.totalPreOrder}
                      </td>
                      <td className="text-center text-success fw-bold">
                        {item.confirmed}
                      </td>
                      <td className="text-center text-warning fw-bold">
                        {item.pending}
                      </td>
                      <td className="text-center text-danger">
                        {item.skipped}
                      </td>
                      <td className="text-center border-start text-muted">
                        {item.basePrice}
                      </td>
                      <td className="text-center text-muted">
                        {item.hubPrice}
                      </td>
                      <td className="text-center fw-bold bg-warning bg-opacity-10">
                        {item.preOrderPrice}
                      </td>
                      <td className="text-end border-start text-muted">
                        ₹{item?.estSalesValue}
                      </td>
                      <td className="text-end pe-4 fw-bolder text-success">
                        ₹{item?.achievedSales}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-5">
                      <div className="text-muted">
                        No sales data found for the selected filters
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* ========================================== */}
      {/* VIEW 2: PLANNED ORDERS TRACKER */}
      {/* ========================================== */}
      {activeView === "orders" && (
        <>
          {/* KPI BOXES */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <Card
                className={`border-0 shadow-sm border-start border-4 border-primary p-3 ${statusFilter === null ? "active-kpi" : ""}`}
                style={{
                  cursor: "pointer",
                  transform: statusFilter === null ? "scale(1.02)" : "scale(1)",
                  transition: "transform 0.2s",
                  backgroundColor:
                    statusFilter === null
                      ? "rgba(13, 110, 253, 0.05)"
                      : "white",
                }}
                onClick={() => handleKpiClick(null)}
                disabled={loading}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">
                      Total Orders
                    </div>
                    <h3 className="fw-bold text-dark mb-0">{totalOrders}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle-no-border text-primary">
                    <FaListAlt size={24} />
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-md-3">
              <Card
                className={`border-0 shadow-sm border-start border-4 border-success p-3 ${statusFilter === "Confirmed" ? "active-kpi" : ""}`}
                style={{
                  cursor: "pointer",
                  transform:
                    statusFilter === "Confirmed" ? "scale(1.02)" : "scale(1)",
                  transition: "transform 0.2s",
                  backgroundColor:
                    statusFilter === "Confirmed"
                      ? "rgba(25, 135, 84, 0.05)"
                      : "white",
                }}
                onClick={() => handleKpiClick("Confirmed")}
                disabled={loading}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">
                      Confirmed
                    </div>
                    <h3 className="fw-bold text-success mb-0">
                      {confirmedOrders}
                    </h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle-no-border text-success">
                    <FaCheckCircle size={24} />
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-md-3">
              <Card
                className={`border-0 shadow-sm border-start border-4 border-warning p-3 ${statusFilter === "Pending Payment" ? "active-kpi" : ""}`}
                style={{
                  cursor: "pointer",
                  transform:
                    statusFilter === "Pending Payment"
                      ? "scale(1.02)"
                      : "scale(1)",
                  transition: "transform 0.2s",
                  backgroundColor:
                    statusFilter === "Pending Payment"
                      ? "rgba(255, 193, 7, 0.05)"
                      : "white",
                }}
                onClick={() => handleKpiClick("Pending Payment")}
                disabled={loading}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">
                      Yet to Confirm
                    </div>
                    <h3 className="fw-bold text-warning mb-0">
                      {pendingOrders}
                    </h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle-no-border text-warning">
                    <FaClock size={24} />
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-md-3">
              <Card
                className={`border-0 shadow-sm border-start border-4 border-danger p-3 ${statusFilter === "Skipped/Cancelled" ? "active-kpi" : ""}`}
                style={{
                  cursor: "pointer",
                  transform:
                    statusFilter === "Skipped/Cancelled"
                      ? "scale(1.02)"
                      : "scale(1)",
                  transition: "transform 0.2s",
                  backgroundColor:
                    statusFilter === "Skipped/Cancelled"
                      ? "rgba(220, 53, 69, 0.05)"
                      : "white",
                }}
                onClick={() => handleKpiClick("Skipped/Cancelled")}
                disabled={loading}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">
                      Skip / Cancel
                    </div>
                    <h3 className="fw-bold text-danger mb-0">
                      {cancelledOrders}
                    </h3>
                  </div>
                  <div className="bg-danger bg-opacity-10 p-3 rounded-circle-no-border text-danger">
                    <FaTimesCircle size={24} />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Active filters indicator */}
          {(statusFilter || searchQuery) && (
            <div className="mb-3">
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted fw-bold">Active Filters:</small>
                {statusFilter && (
                  <Badge bg="info" pill className="px-3 py-2">
                    Status: {statusFilter}
                    <button
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "0.6rem" }}
                      onClick={() => setStatusFilter(null)}
                      aria-label="Remove filter"
                      disabled={loading}
                    ></button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge bg="secondary" pill className="px-3 py-2">
                    Search: "{searchQuery}"
                    <button
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "0.6rem" }}
                      onClick={() => setSearchQuery("")}
                      aria-label="Remove search"
                      disabled={loading}
                    ></button>
                  </Badge>
                )}
                {(statusFilter || searchQuery) && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={clearFilters}
                    disabled={loading}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ORDERS TABLE */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <div>
                  <h5 className="m-0 fw-bold text-dark">Customer Orders</h5>
                  <small className="text-muted">
                    Date: {moment(startDate).format("DD/MM/YYYY")} | Session:{" "}
                    {selectedSession} | Hub:{" "}
                    {selectedHub === ""
                      ? "All Hubs"
                      : hubs.find((h) => h._id === selectedHub)?.hubName ||
                        selectedHub}
                  </small>
                </div>
                <div className="input-group" style={{ maxWidth: "300px" }}>
                  <span className="input-group-text bg-light border-end-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <Form.Control
                    placeholder="Search customer, contact, or items..."
                    className="border-start-0 bg-light shadow-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {pendingOrders > 0 && (
                <Button
                  variant="warning"
                  className="text-dark fw-bold shadow-sm"
                  onClick={handleSendReminders}
                  disabled={loading}
                >
                  <FaCommentDots className="me-2" />
                  Send Reminder to {pendingOrders} Pending
                </Button>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="m-0 align-middle">
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th className="py-3 ps-4">Customer Name</th>
                    <th>Contact</th>
                    <th>Items</th>
                    <th>Total Value</th>
                    <th>Created At</th>
                    <th>Payment Initiated</th>
                    <th>Status</th>
                    <th>Session</th>
                    <th>Hub</th>
                    <th>Delivery Location</th>
                    <th className="text-center">Action</th>
                    <th className="pe-4 text-end">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {initialLoad ? (
                    <tr>
                      <td colSpan="12" className="text-center py-5">
                        <div className="text-muted">
                          Select filters and click "Apply" to view data
                        </div>
                      </td>
                    </tr>
                  ) : ordersData.length > 0 && filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center py-4">
                        <div className="text-muted">
                          <FaSearch className="me-2" />
                          No orders found matching your criteria
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="ps-4 fw-bold text-dark">
                          {order.customerName}
                        </td>
                        <td>{order.contact}</td>
                        <td style={{ maxWidth: "250px" }} title={order.items}>
                          <small className="text-dark bg-light px-2 py-1 rounded border">
                            {order.items}
                          </small>
                        </td>
                        <td className="fw-bold">₹{order.value}</td>
                        <td>{order.createdAt}</td>
                        <td>{order.paymentInitiatedAt}</td>
                        <td>
                          <Badge
                            bg={getStatusBadge(order.status)}
                            pill
                            className="px-3"
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td>{order.session}</td>
                        <td>{order.hub?.hubName}</td>
                        <td className="text-muted small">
                          {order.deliveryLocation}
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(order)}
                            disabled={loading || deleting}
                            title="Delete Plan"
                          >
                            <FaTrash />
                          </Button>
                        </td>
                        <td className="text-end pe-4 text-muted">
                          {order.date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="text-center py-5">
                        <div className="text-muted">
                          No order data found for the selected filters
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}

      {/* ========================================== */}
      {/* VIEW 3: QUANTITY TRACKER */}
      {/* ========================================== */}
      {activeView === "quantity" && (
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <div>
              <h5 className="m-0 fw-bold text-dark">
                Confirmed Items Quantity
              </h5>
              <small className="text-muted">
                Date: {moment(startDate).format("DD/MM/YYYY")} | Session:{" "}
                {selectedSession} |
                {selectedHub === "" ? (
                  "All Hubs"
                ) : (
                  <>
                    Hub:{" "}
                    {hubs.find((h) => h._id === selectedHub)?.hubName ||
                      selectedHub}
                  </>
                )}
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge bg="success" pill className="px-3 py-2">
                <FaCheckCircle className="me-1" /> Total:{" "}
                {totalConfirmedQuantity} items
              </Badge>
              <Badge bg="primary" pill className="px-3 py-2">
                ₹{totalConfirmedSales.toLocaleString("en-IN")}
              </Badge>
              <div className="input-group" style={{ maxWidth: "250px" }}>
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <Form.Control
                  placeholder="Search items..."
                  className="border-start-0 bg-light shadow-none"
                  value={quantitySearch}
                  onChange={(e) => setQuantitySearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="m-0 align-middle">
              <thead className="bg-light text-uppercase small text-muted">
                <tr>
                  <th className="py-3 ps-4">Item Name</th>
                  <th className="text-center">Category</th>
                  <th className="text-center">Unit</th>
                  <th className="text-center bg-success bg-opacity-10 text-success">
                    Confirmed Qty
                  </th>
                  <th className="text-center bg-light border-start">
                    Base Price
                  </th>
                  <th className="text-center bg-light">Hub Price</th>
                  <th className="text-center bg-warning bg-opacity-10">
                    Pre-Order Price
                  </th>
                  <th className="text-end pe-4 text-success">Achieved Sales</th>
                </tr>
              </thead>
              <tbody>
                {initialLoad ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-muted">
                        Select filters and click "Apply" to view data
                      </div>
                    </td>
                  </tr>
                ) : filteredQuantityData.length > 0 ? (
                  filteredQuantityData.map((item, index) => (
                    <tr key={index}>
                      <td className="ps-4 fw-bold text-dark">
                        <div className="d-flex align-items-center">
                          <FaBox className="me-2 text-primary" />
                          {item.foodName}
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge bg="light" text="dark" className="border">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="text-center text-muted">{item.unit}</td>
                      <td className="text-center fw-bold bg-success bg-opacity-10 text-success">
                        <div className="d-flex align-items-center justify-content-center">
                          <FaCheckCircle className="me-2" />
                          {item.confirmedQuantity}
                        </div>
                      </td>
                      <td className="text-center border-start text-muted">
                        ₹{item.basePrice}
                      </td>
                      <td className="text-center text-muted">
                        ₹{item.hubPrice}
                      </td>
                      <td className="text-center fw-bold bg-warning bg-opacity-10">
                        ₹{item.preOrderPrice}
                      </td>
                      <td className="text-end pe-4 fw-bolder text-success">
                        ₹{item.achievedSales}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-muted">
                        <FaBox className="display-6 mb-3 text-muted" />
                        <h5>No confirmed items found</h5>
                        <p className="mb-0">
                          {salesData.length > 0
                            ? "There are no confirmed orders for the selected filters."
                            : "No data available. Please check your filters or try a different date/session."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredQuantityData.length > 0 && (
                <tfoot className="bg-light">
                  <tr>
                    <td colSpan="3" className="ps-4 fw-bold text-end">
                      Total:
                    </td>
                    <td className="text-center fw-bold bg-success bg-opacity-25 text-success">
                      {totalConfirmedQuantity}
                    </td>
                    <td colSpan="3" className="text-end fw-bold">
                      Total Sales:
                    </td>
                    <td className="text-end pe-4 fw-bold text-success">
                      ₹{totalConfirmedSales.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tfoot>
              )}
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AdminPlanDashboard;
