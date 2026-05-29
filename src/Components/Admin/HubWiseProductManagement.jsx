// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Button,
//   Modal,
//   Table,
//   Form,
//   Spinner,
//   Card,
//   Tabs,
//   Tab,
//   InputGroup,
// } from "react-bootstrap";
// import { AiFillDelete, AiOutlineEdit } from "react-icons/ai";
// import { BsSearch, BsPlus } from "react-icons/bs";
// import { MdLocationOn, MdPriceChange } from "react-icons/md";
// import axios from "axios";
// import ReactPaginate from "react-paginate";
// import * as XLSX from "xlsx";
// import { Link } from "react-router-dom";
// import { FaExternalLinkAlt } from "react-icons/fa";

// // API URL for HubMenu (Daily Menu)
// const API_URL = "https://dd-backend-3nm0.onrender.com/api/admin/hub-menu";
// // API URL for Admin actions (Products, Hubs)
// const ADMIN_API_URL = "https://dd-backend-3nm0.onrender.com/api/admin";
// const HUB_API_URL = "https://dd-backend-3nm0.onrender.com/api/Hub";

// const HubWiseProductManagement = () => {
//   // --- STATE ---

//   // Hub State
//   const [hubs, setHubs] = useState([]);
//   const [selectedHub, setSelectedHub] = useState(null);
//   const token = localStorage.getItem("authToken");

//   // Filter State
//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toISOString().split("T")[0],
//   );
//   const [selectedSession, setSelectedSession] = useState("Lunch");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState("");

//   // Data State
//   const [menuItems, setMenuItems] = useState([]); // For "Products" tab (Daily Menu)
//   const [allProducts, setAllProducts] = useState([]); // For "Price Management" tab (Base Products)
//   // const [defaultHubProducts, setDefaultHubProducts] = useState([]); // Filtered Base Products

//   const [isLoading, setIsLoading] = useState(false); // For modal buttons
//   const [isDataLoading, setIsDataLoading] = useState(false); // For table loading

//   // Modal States
//   const [showEditHubProduct, setShowEditHubProduct] = useState(false);
//   const [showDeleteProduct, setShowDeleteProduct] = useState(false);
//   const [showBulkPrice, setShowBulkPrice] = useState(false);
//   // const [showPriceManager, setShowPriceManager] = useState(false);
//   const [activeTab, setActiveTab] = useState("products");

//   // Form States
//   const [editHubProductForm, setEditHubProductForm] = useState({
//     _id: null,
//     productId: null,
//     foodname: "",
//     hubPrice: 0,
//     totalQuantity: 0,
//     remainingQuantity: 0,
//     hubPriority: 0,
//     product: null,
//     preOrderPrice: 0,
//   });

//   const [selectedProductForDelete, setSelectedProductForDelete] =
//     useState(null);

//   // --- DERIVED STATE (for "Products" Tab) ---
//   const filteredMenuItems = useMemo(() => {
//     let filteredData = [...menuItems];
//     if (searchTerm && activeTab === "products") {
//       filteredData = filteredData.filter(
//         (item) =>
//           item.productId?.foodname
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           item.productId?.foodcategory
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()),
//       );
//     }
//     if (filterType && activeTab === "products") {
//       switch (filterType) {
//         case "out_of_stock":
//           filteredData = filteredData.filter(
//             (item) => item.remainingQuantity === 0,
//           );
//           break;
//         case "low_stock":
//           filteredData = filteredData.filter(
//             (item) => item.remainingQuantity < 10 && item.remainingQuantity > 0,
//           );
//           break;
//         default:
//           break;
//       }
//     }
//     return filteredData;
//   }, [menuItems, searchTerm, filterType, activeTab]);

//   // --- DERIVED STATE (for "Price Management" Tab) ---
//   // const filteredDefaultProducts = useMemo(() => {
//   //    let filteredData = [...defaultHubProducts];
//   //    if (searchTerm && activeTab === 'pricing') {
//   //      filteredData = filteredData.filter(
//   //        (product) =>
//   //          product.foodname.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //          product.foodcategory.toLowerCase().includes(searchTerm.toLowerCase())
//   //      );
//   //    }
//   //    // Add any pricing-specific filters here if needed
//   //    return filteredData;
//   // }, [defaultHubProducts, searchTerm, activeTab]);

//   // Pagination
//   const [pageNumber, setPageNumber] = useState(0);
//   const usersPerPage = 20;
//   const pagesVisited = pageNumber * usersPerPage;
//   const changePage = ({ selected }) => setPageNumber(selected);

//   // Determine page count based on active tab
//   const pageCount = Math.ceil(filteredMenuItems.length / usersPerPage);

//   // --- API FUNCTIONS ---

//   const getHubs = async () => {
//     try {
//       const res = await axios.get(`${HUB_API_URL}/hubs`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setHubs(res.data);
//       if (res.data.length > 0) {
//         setSelectedHub(res.data[0]);
//       }
//     } catch (error) {
//       console.error("Failed to fetch hubs:", error);
//     }
//   };

//   // 1. Fetch Daily Menu (for "Products" tab)
//   const fetchHubMenu = async () => {
//     if (!selectedHub || !selectedDate || !selectedSession) {
//       setMenuItems([]);
//       return;
//     }
//     setIsDataLoading(true);
//     try {
//       const res = await axios.get(`${API_URL}/get-menu`, {
//         params: {
//           hubId: selectedHub._id,
//           menuDate: selectedDate,
//           session: selectedSession,
//         },
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMenuItems(res.data.menu || []);
//     } catch (error) {
//       console.error("Error fetching hub menu:", error);
//       setMenuItems([]);
//     } finally {
//       setIsDataLoading(false);
//     }
//   };
//   // --- ACTION FUNCTIONS ---

//   // (Actions for "Products" Tab - Daily Menu)
//   const updateHubMenuItem = async () => {
//     if (!editHubProductForm._id) return;
//     try {
//       setIsLoading(true);
//       const updateData = {
//         hubPrice: Number(editHubProductForm.hubPrice),
//         preOrderPrice: Number(editHubProductForm.preOrderPrice),
//         totalQuantity: Number(editHubProductForm.totalQuantity),
//         remainingQuantity: Number(editHubProductForm.remainingQuantity),
//         hubPriority: Number(editHubProductForm.hubPriority),
//       };
//       const res = await axios.put(
//         `${API_URL}/update/${editHubProductForm._id}`,
//         updateData,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       if (res.status === 200) {
//         alert("Menu item updated successfully!");
//         setShowEditHubProduct(false);
//         await fetchHubMenu();
//       }
//     } catch (error) {
//       console.error("Failed to update menu item:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteHubMenuItem = async () => {
//     if (!selectedProductForDelete) return;
//     try {
//       setIsLoading(true);
//       const res = await axios.delete(
//         `${API_URL}/delete/${selectedProductForDelete._id}`,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       if (res.status === 200) {
//         alert("Menu item removed successfully!");
//         setShowDeleteProduct(false);
//         setSelectedProductForDelete(null);
//         await fetchHubMenu();
//       }
//     } catch (error) {
//       console.error("Failed to delete menu item:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleToggleActive = async (item) => {
//     setMenuItems((prevItems) =>
//       prevItems.map((menuItem) =>
//         menuItem._id === item._id
//           ? { ...menuItem, isActive: !item.isActive }
//           : menuItem,
//       ),
//     );
//     try {
//       await axios.put(
//         `${API_URL}/update/${item._id}`,
//         { isActive: !item.isActive },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//     } catch (error) {
//       alert("Failed to update status.");
//       await fetchHubMenu(); // Revert on error
//     }
//   };
//   const exportToExcel = () => {
//     // 1. Check if there is data to export
//     if (filteredMenuItems.length === 0) {
//       alert("No data to export. Please check your filters.");
//       return;
//     }

//     // 2. Format the data from filteredMenuItems into a clean array
//     const exportData = filteredMenuItems.map((item, index) => ({
//       "Sl. No": index + 1,
//       "Product Name": item.productId?.foodname,
//       Category: item.productId?.foodcategory,
//       "Base Price (₹)": item.basePrice,
//       "Hub Price (₹)": item.hubPrice,
//       "Pre-order Price (₹)": item.preOrderPrice,
//       "Total Stock": item.totalQuantity,
//       "Remaining Stock": item.remainingQuantity,
//       Priority: item.hubPriority,
//       Status: item.isActive ? "Active" : "Closed",
//     }));

//     // 3. Create a worksheet from the formatted data
//     const worksheet = XLSX.utils.json_to_sheet(exportData);

//     // 4. Create a new workbook
//     const workbook = XLSX.utils.book_new();

//     // 5. Append the worksheet to the workbook with a sheet name
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Menu");

//     // 6. Define a dynamic filename
//     const filename = `HubMenu_${
//       selectedHub?.hubName || "Hub"
//     }_${selectedDate}_${selectedSession}.xlsx`;

//     // 7. Trigger the file download
//     XLSX.writeFile(workbook, filename);
//   };
//   const markProductSoldOut = async (item) => {
//     setMenuItems((prevItems) =>
//       prevItems.map((menuItem) =>
//         menuItem._id === item._id
//           ? { ...menuItem, remainingQuantity: 0 }
//           : menuItem,
//       ),
//     );
//     try {
//       await axios.put(
//         `${API_URL}/update/${item._id}`,
//         { remainingQuantity: 0 },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//     } catch (error) {
//       alert("Failed to mark as sold out.");
//       await fetchHubMenu();
//     }
//   };

//   const markAllProductsSoldOut = async () => {
//     if (!selectedHub) return;
//     const confirm = window.confirm(
//       `Are you sure you want to mark ALL items as sold out for this filter?`,
//     );
//     if (!confirm) return;
//     setIsDataLoading(true);
//     try {
//       await axios.post(
//         `${API_URL}/bulk-sold-out`,
//         {
//           hubId: selectedHub._id,
//           menuDate: selectedDate,
//           session: selectedSession,
//         },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       await fetchHubMenu();
//     } catch (error) {
//       alert("Failed to mark all as sold out.");
//     } finally {
//       setIsDataLoading(false);
//     }
//   };

//   // (Actions for "Price Management" Tab - Default Prices)

//   // This is for the "Bulk Price Update" modal
//   const handleBulkPriceUpdate = async (percentage, operation) => {
//     if (!selectedHub || !selectedDate || !selectedSession) {
//       alert("Please select a hub, date, and session first.");
//       return;
//     }

//     const confirmMsg = `Are you sure you want to ${operation} all prices by ${percentage}% for this menu?`;
//     if (!window.confirm(confirmMsg)) return;

//     setIsLoading(true); // Use the modal spinner
//     try {
//       const res = await axios.post(
//         `${API_URL}/bulk-price-update`, // The new endpoint
//         {
//           hubId: selectedHub._id,
//           menuDate: selectedDate,
//           session: selectedSession,
//           percentage: percentage,
//           operation: operation,
//         },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );

//       if (res.data.success) {
//         alert(res.data.message);
//         await fetchHubMenu(); // Refresh data to show new prices
//       }
//     } catch (error) {
//       console.error("Failed to bulk update prices:", error);
//       alert(error?.response?.data?.message || "Bulk update failed.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- MODAL HANDLERS ---
//   const openEditModal = (menuItem) => {
//     setEditHubProductForm({
//       _id: menuItem._id,
//       productId: menuItem.productId._id,
//       foodname: menuItem.productId.foodname,
//       hubPrice: menuItem.hubPrice,
//       preOrderPrice: menuItem.preOrderPrice,
//       totalQuantity: menuItem.totalQuantity,
//       remainingQuantity: menuItem.remainingQuantity,
//       hubPriority: menuItem.hubPriority,
//       product: menuItem.productId,
//     });
//     setShowEditHubProduct(true);
//   };

//   const openDeleteModal = (menuItem) => {
//     setSelectedProductForDelete(menuItem);
//     setShowDeleteProduct(true);
//   };

//   // --- EFFECTS ---
//   useEffect(() => {
//     getHubs();
//   }, [token]);

//   // Re-fetch daily menu when these filters change
//   useEffect(() => {
//     if (activeTab === "products") {
//       fetchHubMenu();
//     }
//   }, [selectedHub, selectedDate, selectedSession, activeTab]);

//   // // Re-filter default products when hub or base products change
//   // useEffect(() => {
//   //   if (selectedHub && allProducts.length > 0) {
//   //     const hubSpecificProducts = allProducts
//   //       .map((product) => {
//   //         const hubPriceData = product.locationPrice?.find(
//   //           (loc) => loc.hubId === selectedHub.hubId
//   //         );

//   //         if (hubPriceData) {
//   //           return {
//   //             ...product,
//   //             hubPriceData: hubPriceData,
//   //           };
//   //         }
//   //         return null;
//   //       })
//   //       .filter(Boolean); // Remove nulls

//   //     setDefaultHubProducts(hubSpecificProducts);
//   //   } else {
//   //     setDefaultHubProducts([]);
//   //   }
//   // }, [selectedHub, allProducts]);

//   // Reset pagination when data/tabs change
//   useEffect(() => {
//     setPageNumber(0);
//   }, [filteredMenuItems, activeTab]);

//   const onRemainingQuantityChange = (e) => {
//     const newRemaining = Number(e.target.value);
//     const oldRemaining = Number(editHubProductForm.remainingQuantity);
//     const oldTotal = Number(editHubProductForm.totalQuantity);

//     // Calculate how much the remaining changed
//     const diff = newRemaining - oldRemaining;

//     // Update both fields accordingly
//     setEditHubProductForm({
//       ...editHubProductForm,
//       remainingQuantity: newRemaining,
//       totalQuantity: oldTotal + diff, // keep total in sync
//     });
//   };
//   // --- RENDER ---
//   return (
//     <div className="container-fluid p-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2 className="header-c">Hub Menu Management</h2>
//         <div className="d-flex gap-2">
//           <Button
//             variant="outline-success"
//             onClick={() => setShowBulkPrice(true)}
//             // Disable if not on pricing tab
//             // disabled={activeTab !== "pricing"}
//           >
//             <MdPriceChange /> Bulk Price Update
//           </Button>
//         </div>
//       </div>

//       {/* Hub Selection */}
//       <Card className="mb-4">
//         <Card.Body>
//           <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
//             <strong>Select Hub:</strong>
//             {hubs.map((hub) => (
//               <Button
//                 key={hub._id}
//                 variant={
//                   selectedHub?._id === hub._id
//                     ? "outline-danger"
//                     : "outline-success"
//                 }
//                 onClick={() => setSelectedHub(hub)}
//                 className="d-flex align-items-center gap-2"
//               >
//                 <MdLocationOn />
//                 {hub.hubId}
//                 <small className="text-muted">({hub.hubName})</small>
//               </Button>
//             ))}
//           </div>
//         </Card.Body>
//       </Card>

//       {selectedHub && (
//         <Card>
//           <Card.Header>
//             <Tabs
//               activeKey={activeTab}
//               onSelect={(k) => setActiveTab(k)}
//               className="mb-0"
//             >
//               <Tab eventKey="products" title="Daily Menu"></Tab>
//               <Tab eventKey="pricing" title="Default Price Management"></Tab>
//             </Tabs>
//           </Card.Header>

//           <Card.Body>
//             {isDataLoading ? (
//               <div className="text-center py-5">
//                 <Spinner animation="border" variant="primary" />
//                 <p className="mt-2">Loading...</p>
//               </div>
//             ) : (
//               <>
//                 {/* --- TAB 1: DAILY MENU --- */}
//                 {activeTab === "products" && (
//                   <>
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <h5 className="mb-0">
//                         Daily Menu for <b>{selectedHub.hubName}</b>
//                       </h5>
//                       <Button
//                         variant="outline-secondary"
//                         size="sm"
//                         onClick={exportToExcel}
//                       >
//                         Export Excel
//                       </Button>
//                     </div>
//                     {/* Filters */}
//                     <div className="row mb-3">
//                       <div className="col-md-3">
//                         <Form.Group>
//                           <Form.Label>Select Date</Form.Label>
//                           <Form.Control
//                             type="date"
//                             value={selectedDate}
//                             onChange={(e) => setSelectedDate(e.target.value)}
//                           />
//                         </Form.Group>
//                       </div>
//                       <div className="col-md-3">
//                         <Form.Group>
//                           <Form.Label>Select Session</Form.Label>
//                           <Form.Select
//                             value={selectedSession}
//                             onChange={(e) => setSelectedSession(e.target.value)}
//                           >
//                             <option value="Lunch">Lunch</option>
//                             <option value="Dinner">Dinner</option>
//                           </Form.Select>
//                         </Form.Group>
//                       </div>
//                       <div className="col-md-3">
//                         <Form.Label>Search</Form.Label>
//                         <InputGroup>
//                           <InputGroup.Text>
//                             <BsSearch />
//                           </InputGroup.Text>
//                           <Form.Control
//                             type="text"
//                             placeholder="Search products..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                           />
//                         </InputGroup>
//                       </div>
//                       <div className="col-md-3">
//                         <Form.Label>Filter By</Form.Label>
//                         <Form.Select
//                           value={filterType}
//                           onChange={(e) => setFilterType(e.target.value)}
//                         >
//                           <option value="">All Products</option>
//                           <option value="out_of_stock">Out of Stock</option>
//                           <option value="low_stock">Low Stock</option>
//                         </Form.Select>
//                       </div>
//                     </div>
//                     <div className="mb-3 d-flex justify-content-between align-items-center">
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         onClick={markAllProductsSoldOut}
//                         disabled={isDataLoading || isLoading}
//                       >
//                         Mark All Filtered as Sold Out
//                       </Button>
//                       <Link to="/admin/menu-upload" className="ms-2">
//                         <Button variant="success">
//                           <FaExternalLinkAlt
//                             style={{
//                               paddingRight: "5px",
//                             }}
//                           />{" "}
//                           Add Product
//                         </Button>
//                       </Link>
//                     </div>

//                     {/* Products Table */}
//                     <div className="table-responsive">
//                       <Table striped bordered hover>
//                         <thead className="table-dark">
//                           <tr>
//                             <th>Sl. No</th>
//                             <th>Image</th>
//                             <th>Name</th>
//                             <th>Category</th>
//                             <th>Base (₹)</th>
//                             <th>Hub (₹)</th>
//                             <th>PreOrder (₹)</th>
//                             <th>Total</th>
//                             <th>Rem.</th>
//                             <th>Status</th>
//                             <th>Prio.</th>
//                             <th>Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredMenuItems
//                             .slice(pagesVisited, pagesVisited + usersPerPage)
//                             .map((item, index) => (
//                               <tr key={item._id}>
//                                 <td>{index + 1 + pagesVisited}</td>
//                                 <td>
//                                   <img
//                                     src={
//                                       item.productId?.Foodgallery?.[0]
//                                         ?.image2 ||
//                                       "https://via.placeholder.com/50"
//                                     }
//                                     alt={item.productId?.foodname}
//                                     style={{
//                                       width: "50px",
//                                       height: "50px",
//                                       objectFit: "cover",
//                                     }}
//                                     className="rounded"
//                                   />
//                                 </td>
//                                 <td>{item.productId?.foodname || "N/A"}</td>
//                                 <td>{item.productId?.foodcategory || "N/A"}</td>
//                                 <td>{item.basePrice}</td>
//                                 <td>{item.hubPrice}</td>
//                                 <td>{item.preOrderPrice}</td>
//                                 <td>{item.totalQuantity}</td>
//                                 <td>
//                                   <span
//                                     className={`badge ${
//                                       item.remainingQuantity === 0
//                                         ? "bg-danger"
//                                         : item.remainingQuantity < 10
//                                           ? "bg-warning"
//                                           : "bg-success"
//                                     }`}
//                                   >
//                                     {item.remainingQuantity}
//                                   </span>
//                                 </td>
//                                 <td>
//                                   <Form.Check
//                                     type="switch"
//                                     id={`active-switch-${item._id}`}
//                                     label={item.isActive ? "Active" : "Closed"}
//                                     checked={item.isActive}
//                                     onChange={() => handleToggleActive(item)}
//                                   />
//                                 </td>
//                                 <td>{item.hubPriority}</td>
//                                 <td>
//                                   <div className="d-flex gap-2">
//                                     <Button
//                                       variant="outline-primary"
//                                       size="sm"
//                                       onClick={() => openEditModal(item)}
//                                       title="Edit Daily Menu Item"
//                                     >
//                                       <AiOutlineEdit />
//                                     </Button>
//                                     <Button
//                                       variant="outline-warning"
//                                       size="sm"
//                                       onClick={() => markProductSoldOut(item)}
//                                       title="Mark as Sold Out"
//                                     >
//                                       Sold Out
//                                     </Button>
//                                     <Button
//                                       variant="outline-danger"
//                                       size="sm"
//                                       onClick={() => openDeleteModal(item)}
//                                       title="Remove from Daily Menu"
//                                     >
//                                       <AiFillDelete />
//                                     </Button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                         </tbody>
//                       </Table>
//                     </div>

//                     {/* Pagination */}
//                     <div className="d-flex justify-content-between align-items-center">
//                       <p className="mb-0">
//                         Total: {filteredMenuItems.length} products
//                       </p>
//                       <ReactPaginate
//                         previousLabel={"Back"}
//                         nextLabel={"Next"}
//                         pageCount={pageCount}
//                         onPageChange={changePage}
//                         containerClassName={"paginationBttns mb-0"}
//                         previousLinkClassName={"previousBttn"}
//                         nextLinkClassName={"nextBttn"}
//                         disabledClassName={"paginationDisabled"}
//                         activeClassName={"paginationActive"}
//                       />
//                     </div>
//                   </>
//                 )}

//                 {/* --- TAB 2: PRICE MANAGEMENT --- */}
//                 {activeTab === "pricing" && (
//                   <>
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <h5 className="mb-0">
//                         Price Management for {selectedHub.hubName}
//                       </h5>
//                       {/* <div className="col-md-3">
//         <InputGroup>
//           <InputGroup.Text><BsSearch /></InputGroup.Text>
//           <Form.Control
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </InputGroup>
//       </div> */}
//                     </div>

//                     <div className="row">
//                       {/* --- Price Overview (Left Side) --- */}
//                       <div className="col-md-7">
//                         <Card>
//                           <Card.Header>
//                             <h6>
//                               Price Overview (for {selectedDate} -{" "}
//                               {selectedSession})
//                             </h6>
//                           </Card.Header>
//                           <Card.Body
//                             style={{ maxHeight: "600px", overflowY: "auto" }}
//                           >
//                             {/* We map `filteredMenuItems` here */}
//                             {filteredMenuItems.length > 0 ? (
//                               filteredMenuItems.map((item) => (
//                                 <div
//                                   key={item._id}
//                                   className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
//                                 >
//                                   <span>
//                                     <img
//                                       src={
//                                         item.productId?.Foodgallery?.[0]
//                                           ?.image2 ||
//                                         "https://via.placeholder.com/50"
//                                       }
//                                       alt={item.productId?.foodname}
//                                       style={{
//                                         width: "40px",
//                                         height: "40px",
//                                         objectFit: "cover",
//                                         marginRight: "10px",
//                                       }}
//                                       className="rounded"
//                                     />
//                                     {item.productId?.foodname}
//                                   </span>
//                                   <div className="d-flex align-items-center gap-3">
//                                     <span className="text-muted">
//                                       Base: ₹{item.basePrice}
//                                     </span>
//                                     <div className="d-flex align-items-center gap-2">
//                                       <strong>Hub Price:</strong>
//                                       <span className="text-muted">₹</span>
//                                       <input
//                                         type="number"
//                                         className="form-control form-control-sm"
//                                         defaultValue={item.hubPrice}
//                                         onBlur={(e) => {
//                                           // This is an inline edit
//                                           // We call the *single item* update endpoint
//                                           const newPrice = Number(
//                                             e.target.value,
//                                           );
//                                           if (newPrice !== item.hubPrice) {
//                                             axios
//                                               .put(
//                                                 `${API_URL}/update/${item._id}`,
//                                                 { hubPrice: newPrice },
//                                                 {
//                                                   headers: {
//                                                     Authorization: `Bearer ${token}`,
//                                                   },
//                                                 },
//                                               )
//                                               .then(() => {
//                                                 // Optimistically update state
//                                                 setMenuItems((prev) =>
//                                                   prev.map((mi) =>
//                                                     mi._id === item._id
//                                                       ? {
//                                                           ...mi,
//                                                           hubPrice: newPrice,
//                                                         }
//                                                       : mi,
//                                                   ),
//                                                 );
//                                               })
//                                               .catch((err) => {
//                                                 console.error(err);
//                                                 alert(
//                                                   "Failed to update price.",
//                                                 );
//                                                 e.target.value = item.hubPrice; // Revert on fail
//                                               });
//                                           }
//                                         }}
//                                         style={{ width: "80px" }}
//                                       />
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))
//                             ) : (
//                               <p>No menu items found for this filter.</p>
//                             )}
//                           </Card.Body>
//                         </Card>
//                       </div>

//                       {/* --- Bulk Price Actions (Right Side) --- */}
//                       <div className="col-md-5">
//                         <Card>
//                           <Card.Header>
//                             <h6>Bulk Price Actions</h6>
//                           </Card.Header>
//                           <Card.Body>
//                             <div className="d-grid gap-2">
//                               <Button
//                                 variant="outline-success"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(10, "increase")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Increase All Prices by 10%"
//                                 )}
//                               </Button>
//                               <Button
//                                 variant="outline-warning"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(5, "increase")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Increase All Prices by 5%"
//                                 )}
//                               </Button>
//                               <Button
//                                 variant="outline-danger"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(5, "decrease")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Decrease All Prices by 5%"
//                                 )}
//                               </Button>
//                               <Button
//                                 variant="outline-dark"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(10, "decrease")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Decrease All Prices by 10%"
//                                 )}
//                               </Button>
//                             </div>
//                           </Card.Body>
//                         </Card>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </>
//             )}
//           </Card.Body>
//         </Card>
//       )}

//       {/* --- MODALS --- */}
//       {/* (All modals from previous response go here) */}

//       {/* Bulk Price Update Modal */}
//       <Modal show={showBulkPrice} onHide={() => setShowBulkPrice(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Bulk Price Update</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="text-center mb-4">
//             <h6>
//               Update default prices for all products in {selectedHub?.hubName}
//             </h6>
//             <p className="text-muted">
//               This will modify the 'locationPrice' for all products in this hub.
//             </p>
//           </div>
//           <div className="d-grid gap-3">
//             <Card className="border-success">
//               <Card.Body className="text-center">
//                 <h6 className="text-success mb-3">Increase Prices</h6>
//                 <div className="d-grid gap-2">
//                   <Button
//                     variant="outline-success"
//                     onClick={() => handleBulkPriceUpdate(5, "increase")}
//                     disabled={isLoading}
//                   >
//                     Increase by 5%
//                   </Button>
//                   <Button
//                     variant="outline-success"
//                     onClick={() => handleBulkPriceUpdate(10, "increase")}
//                     disabled={isLoading}
//                   >
//                     Increase by 10%
//                   </Button>
//                 </div>
//               </Card.Body>
//             </Card>
//             <Card className="border-danger">
//               <Card.Body className="text-center">
//                 <h6 className="text-danger mb-3">Decrease Prices</h6>
//                 <div className="d-grid gap-2">
//                   <Button
//                     variant="outline-danger"
//                     onClick={() => handleBulkPriceUpdate(5, "decrease")}
//                     disabled={isLoading}
//                   >
//                     Decrease by 5%
//                   </Button>
//                   <Button
//                     variant="outline-danger"
//                     onClick={() => handleBulkPriceUpdate(10, "decrease")}
//                     disabled={isLoading}
//                   >
//                     Decrease by 10%
//                   </Button>
//                 </div>
//               </Card.Body>
//             </Card>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowBulkPrice(false)}>
//             Cancel
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Price Manager Modal (Removed, as it's now inline on the tab) */}

//       {/* Delete Product Modal (For Daily Menu) */}
//       <Modal
//         show={showDeleteProduct}
//         onHide={() => setShowDeleteProduct(false)}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Delete</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>
//             Are you sure you want to remove "
//             {selectedProductForDelete?.productId?.foodname}" from this hub's
//             menu for this date/session?
//           </p>
//           <p className="text-danger">This action cannot be undone.</p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowDeleteProduct(false)}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="danger"
//             onClick={deleteHubMenuItem}
//             disabled={isLoading}
//           >
//             {isLoading ? <Spinner size="sm" /> : "Delete"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Edit Hub Product Modal (For Daily Menu) */}
//       <Modal
//         show={showEditHubProduct}
//         onHide={() => setShowEditHubProduct(false)}
//         size="lg"
//         style={{ zIndex: 99999 }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             Edit Daily Menu Item in {selectedHub?.hubName}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {editHubProductForm.product && (
//             <>
//               <div className="mb-3">
//                 <Card>
//                   <Card.Body className="p-3">
//                     <div className="d-flex align-items-center gap-3">
//                       <img
//                         src={
//                           editHubProductForm.product.Foodgallery?.[0]?.image2 ||
//                           "https://via.placeholder.com/60"
//                         }
//                         alt={editHubProductForm.product.foodname}
//                         style={{
//                           width: "60px",
//                           height: "60px",
//                           objectFit: "cover",
//                         }}
//                         className="rounded"
//                       />
//                       <div>
//                         <h6 className="mb-1">
//                           {editHubProductForm.product.foodname}
//                         </h6>
//                         <small className="text-muted">
//                           {editHubProductForm.product.foodcategory} • Base
//                           Price: ₹
//                           {editHubProductForm.product.basePrice ||
//                             editHubProductForm.product.foodprice}
//                         </small>
//                       </div>
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </div>

//               <div className="row">
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Hub Price (₹)</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.hubPrice}
//                       onChange={(e) =>
//                         setEditHubProductForm({
//                           ...editHubProductForm,
//                           hubPrice: e.target.value,
//                         })
//                       }
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Pre Order Price (₹)</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.preOrderPrice}
//                       onChange={(e) =>
//                         setEditHubProductForm({
//                           ...editHubProductForm,
//                           preOrderPrice: e.target.value,
//                         })
//                       }
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Total Stock</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.totalQuantity}
//                       disabled
//                       readOnly
//                       className="bg-light"
//                       // onChange={(e) =>
//                       //   setEditHubProductForm({
//                       //     ...editHubProductForm,
//                       //     totalQuantity: e.target.value,
//                       //   })
//                       // }
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Remaining Stock</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.remainingQuantity}
//                       onChange={onRemainingQuantityChange}
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Menu Priority</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.hubPriority}
//                       onChange={(e) =>
//                         setEditHubProductForm({
//                           ...editHubProductForm,
//                           hubPriority: e.target.value,
//                         })
//                       }
//                     />
//                   </Form.Group>
//                 </div>
//               </div>

//               <div className="alert alert-info">
//                 <small>
//                   <strong>Note:</strong> Changes will apply to this menu item
//                   for {selectedDate} ({selectedSession}) in{" "}
//                   {selectedHub?.hubName}.
//                 </small>
//               </div>
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowEditHubProduct(false)}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             onClick={updateHubMenuItem}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Spinner animation="border" size="sm" className="me-2" />
//                 Updating...
//               </>
//             ) : (
//               "Update Menu Item"
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default HubWiseProductManagement;

// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Button,
//   Modal,
//   Table,
//   Form,
//   Spinner,
//   Card,
//   Tabs,
//   Tab,
//   InputGroup,
//   Alert,
// } from "react-bootstrap";
// import { AiFillDelete, AiOutlineEdit } from "react-icons/ai";
// import { BsSearch, BsPlus, BsTrash } from "react-icons/bs";
// import { MdLocationOn, MdPriceChange } from "react-icons/md";
// import axios from "axios";
// import ReactPaginate from "react-paginate";
// import * as XLSX from "xlsx";
// import { Link } from "react-router-dom";
// import { FaExternalLinkAlt } from "react-icons/fa";

// // API URL for HubMenu (Daily Menu)
// const API_URL = "https://dd-backend-3nm0.onrender.com/api/admin/hub-menu";
// // API URL for Admin actions (Products, Hubs)
// const ADMIN_API_URL = "https://dd-backend-3nm0.onrender.com/api/admin";
// const HUB_API_URL = "https://dd-backend-3nm0.onrender.com/api/Hub";

// const HubWiseProductManagement = () => {
//   // --- STATE ---

//   // Hub State
//   const [hubs, setHubs] = useState([]);
//   const [selectedHub, setSelectedHub] = useState(null);
//   const token = localStorage.getItem("authToken");

//   // Filter State
//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toISOString().split("T")[0],
//   );
//   const [selectedSession, setSelectedSession] = useState("Lunch");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState("");

//   // Data State
//   const [menuItems, setMenuItems] = useState([]); // For "Products" tab (Daily Menu)
//   const [allProducts, setAllProducts] = useState([]); // For "Price Management" tab (Base Products)
//   // const [defaultHubProducts, setDefaultHubProducts] = useState([]); // Filtered Base Products

//   const [isLoading, setIsLoading] = useState(false); // For modal buttons
//   const [isDataLoading, setIsDataLoading] = useState(false); // For table loading

//   // Modal States
//   const [showEditHubProduct, setShowEditHubProduct] = useState(false);
//   const [showDeleteProduct, setShowDeleteProduct] = useState(false);
//   const [showBulkPrice, setShowBulkPrice] = useState(false);
//   const [showDeleteAll, setShowDeleteAll] = useState(false); // New modal for delete all
//   // const [showPriceManager, setShowPriceManager] = useState(false);
//   const [activeTab, setActiveTab] = useState("products");

//   // Form States
//   const [editHubProductForm, setEditHubProductForm] = useState({
//     _id: null,
//     productId: null,
//     foodname: "",
//     hubPrice: 0,
//     totalQuantity: 0,
//     remainingQuantity: 0,
//     hubPriority: 0,
//     product: null,
//     preOrderPrice: 0,
//   });

//   const [selectedProductForDelete, setSelectedProductForDelete] =
//     useState(null);

//   // --- DERIVED STATE (for "Products" Tab) ---
//   const filteredMenuItems = useMemo(() => {
//     let filteredData = [...menuItems];
//     if (searchTerm && activeTab === "products") {
//       filteredData = filteredData.filter(
//         (item) =>
//           item.productId?.foodname
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           item.productId?.foodcategory
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()),
//       );
//     }
//     if (filterType && activeTab === "products") {
//       switch (filterType) {
//         case "out_of_stock":
//           filteredData = filteredData.filter(
//             (item) => item.remainingQuantity === 0,
//           );
//           break;
//         case "low_stock":
//           filteredData = filteredData.filter(
//             (item) => item.remainingQuantity < 10 && item.remainingQuantity > 0,
//           );
//           break;
//         default:
//           break;
//       }
//     }
//     return filteredData;
//   }, [menuItems, searchTerm, filterType, activeTab]);

//   // --- DERIVED STATE (for "Price Management" Tab) ---
//   // const filteredDefaultProducts = useMemo(() => {
//   //    let filteredData = [...defaultHubProducts];
//   //    if (searchTerm && activeTab === 'pricing') {
//   //      filteredData = filteredData.filter(
//   //        (product) =>
//   //          product.foodname.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //          product.foodcategory.toLowerCase().includes(searchTerm.toLowerCase())
//   //      );
//   //    }
//   //    // Add any pricing-specific filters here if needed
//   //    return filteredData;
//   // }, [defaultHubProducts, searchTerm, activeTab]);

//   // Pagination
//   const [pageNumber, setPageNumber] = useState(0);
//   const usersPerPage = 20;
//   const pagesVisited = pageNumber * usersPerPage;
//   const changePage = ({ selected }) => setPageNumber(selected);

//   // Determine page count based on active tab
//   const pageCount = Math.ceil(filteredMenuItems.length / usersPerPage);

//   // --- API FUNCTIONS ---

//   const getHubs = async () => {
//     try {
//       const res = await axios.get(`${HUB_API_URL}/hubs`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setHubs(res.data);
//       if (res.data.length > 0) {
//         setSelectedHub(res.data[0]);
//       }
//     } catch (error) {
//       console.error("Failed to fetch hubs:", error);
//     }
//   };

//   // 1. Fetch Daily Menu (for "Products" tab)
//   const fetchHubMenu = async () => {
//     if (!selectedHub || !selectedDate || !selectedSession) {
//       setMenuItems([]);
//       return;
//     }
//     setIsDataLoading(true);
//     try {
//       const res = await axios.get(`${API_URL}/get-menu`, {
//         params: {
//           hubId: selectedHub._id,
//           menuDate: selectedDate,
//           session: selectedSession,
//         },
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMenuItems(res.data.menu || []);
//     } catch (error) {
//       console.error("Error fetching hub menu:", error);
//       setMenuItems([]);
//     } finally {
//       setIsDataLoading(false);
//     }
//   };

//   // --- ACTION FUNCTIONS ---

//   // (Actions for "Products" Tab - Daily Menu)
//   const updateHubMenuItem = async () => {
//     if (!editHubProductForm._id) return;
//     try {
//       setIsLoading(true);
//       const updateData = {
//         hubPrice: Number(editHubProductForm.hubPrice),
//         preOrderPrice: Number(editHubProductForm.preOrderPrice),
//         totalQuantity: Number(editHubProductForm.totalQuantity),
//         remainingQuantity: Number(editHubProductForm.remainingQuantity),
//         hubPriority: Number(editHubProductForm.hubPriority),
//       };
//       const res = await axios.put(
//         `${API_URL}/update/${editHubProductForm._id}`,
//         updateData,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       if (res.status === 200) {
//         alert("Menu item updated successfully!");
//         setShowEditHubProduct(false);
//         await fetchHubMenu();
//       }
//     } catch (error) {
//       console.error("Failed to update menu item:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteHubMenuItem = async () => {
//     if (!selectedProductForDelete) return;
//     try {
//       setIsLoading(true);
//       const res = await axios.delete(
//         `${API_URL}/delete/${selectedProductForDelete._id}`,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       if (res.status === 200) {
//         alert("Menu item removed successfully!");
//         setShowDeleteProduct(false);
//         setSelectedProductForDelete(null);
//         await fetchHubMenu();
//       }
//     } catch (error) {
//       console.error("Failed to delete menu item:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // New function: Delete All Hubwise Menu Items
//   const deleteAllHubwise = async () => {
//     if (!selectedHub || !selectedDate || !selectedSession) {
//       alert("Please select hub, date, and session first!");
//       return;
//     }

//     // Confirmation with warning
//     const confirmMsg = `Are you absolutely sure you want to delete ALL menu items for:\n\nHub: ${selectedHub.hubName}\nDate: ${selectedDate}\nSession: ${selectedSession}\n\nThis action will permanently delete ${filteredMenuItems.length} items and cannot be undone!`;

//     if (!window.confirm(confirmMsg)) {
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const res = await axios.delete(`${API_URL}/delete-all-hubwise`, {
//         data: {
//           hubId: selectedHub._id,
//           menuDate: selectedDate,
//           session: selectedSession,
//         },
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.status === 200) {
//         alert(`Successfully deleted ${res.data.deletedCount || 0} menu items!`);
//         setShowDeleteAll(false);
//         await fetchHubMenu(); // Refresh the data
//       }
//     } catch (error) {
//       console.error("Failed to delete all hubwise items:", error);
//       alert(
//         error.response?.data?.error ||
//           "Failed to delete items. Please try again.",
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleToggleActive = async (item) => {
//     setMenuItems((prevItems) =>
//       prevItems.map((menuItem) =>
//         menuItem._id === item._id
//           ? { ...menuItem, isActive: !item.isActive }
//           : menuItem,
//       ),
//     );
//     try {
//       await axios.put(
//         `${API_URL}/update/${item._id}`,
//         { isActive: !item.isActive },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//     } catch (error) {
//       alert("Failed to update status.");
//       await fetchHubMenu(); // Revert on error
//     }
//   };

//   const exportToExcel = () => {
//     // 1. Check if there is data to export
//     if (filteredMenuItems.length === 0) {
//       alert("No data to export. Please check your filters.");
//       return;
//     }

//     // 2. Format the data from filteredMenuItems into a clean array
//     const exportData = filteredMenuItems.map((item, index) => ({
//       "Sl. No": index + 1,
//       "Product Name": item.productId?.foodname,
//       Category: item.productId?.foodcategory,
//       "Base Price (₹)": item.basePrice,
//       "Hub Price (₹)": item.hubPrice,
//       "Pre-order Price (₹)": item.preOrderPrice,
//       "Total Stock": item.totalQuantity,
//       "Remaining Stock": item.remainingQuantity,
//       Priority: item.hubPriority,
//       Status: item.isActive ? "Active" : "Closed",
//     }));

//     // 3. Create a worksheet from the formatted data
//     const worksheet = XLSX.utils.json_to_sheet(exportData);

//     // 4. Create a new workbook
//     const workbook = XLSX.utils.book_new();

//     // 5. Append the worksheet to the workbook with a sheet name
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Menu");

//     // 6. Define a dynamic filename
//     const filename = `HubMenu_${
//       selectedHub?.hubName || "Hub"
//     }_${selectedDate}_${selectedSession}.xlsx`;

//     // 7. Trigger the file download
//     XLSX.writeFile(workbook, filename);
//   };

//   const markProductSoldOut = async (item) => {
//     setMenuItems((prevItems) =>
//       prevItems.map((menuItem) =>
//         menuItem._id === item._id
//           ? { ...menuItem, remainingQuantity: 0 }
//           : menuItem,
//       ),
//     );
//     try {
//       await axios.put(
//         `${API_URL}/update/${item._id}`,
//         { remainingQuantity: 0 },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//     } catch (error) {
//       alert("Failed to mark as sold out.");
//       await fetchHubMenu();
//     }
//   };

//   const markAllProductsSoldOut = async () => {
//     if (!selectedHub) return;
//     const confirm = window.confirm(
//       `Are you sure you want to mark ALL items as sold out for this filter?`,
//     );
//     if (!confirm) return;
//     setIsDataLoading(true);
//     try {
//       await axios.post(
//         `${API_URL}/bulk-sold-out`,
//         {
//           hubId: selectedHub._id,
//           menuDate: selectedDate,
//           session: selectedSession,
//         },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       await fetchHubMenu();
//     } catch (error) {
//       alert("Failed to mark all as sold out.");
//     } finally {
//       setIsDataLoading(false);
//     }
//   };

//   // (Actions for "Price Management" Tab - Default Prices)

//   // This is for the "Bulk Price Update" modal
//   const handleBulkPriceUpdate = async (percentage, operation) => {
//     if (!selectedHub || !selectedDate || !selectedSession) {
//       alert("Please select a hub, date, and session first.");
//       return;
//     }

//     const confirmMsg = `Are you sure you want to ${operation} all prices by ${percentage}% for this menu?`;
//     if (!window.confirm(confirmMsg)) return;

//     setIsLoading(true); // Use the modal spinner
//     try {
//       const res = await axios.post(
//         `${API_URL}/bulk-price-update`, // The new endpoint
//         {
//           hubId: selectedHub._id,
//           menuDate: selectedDate,
//           session: selectedSession,
//           percentage: percentage,
//           operation: operation,
//         },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );

//       if (res.data.success) {
//         alert(res.data.message);
//         await fetchHubMenu(); // Refresh data to show new prices
//       }
//     } catch (error) {
//       console.error("Failed to bulk update prices:", error);
//       alert(error?.response?.data?.message || "Bulk update failed.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- MODAL HANDLERS ---
//   const openEditModal = (menuItem) => {
//     setEditHubProductForm({
//       _id: menuItem._id,
//       productId: menuItem.productId._id,
//       foodname: menuItem.productId.foodname,
//       hubPrice: menuItem.hubPrice,
//       preOrderPrice: menuItem.preOrderPrice,
//       totalQuantity: menuItem.totalQuantity,
//       remainingQuantity: menuItem.remainingQuantity,
//       hubPriority: menuItem.hubPriority,
//       product: menuItem.productId,
//     });
//     setShowEditHubProduct(true);
//   };

//   const openDeleteModal = (menuItem) => {
//     setSelectedProductForDelete(menuItem);
//     setShowDeleteProduct(true);
//   };

//   // --- EFFECTS ---
//   useEffect(() => {
//     getHubs();
//   }, [token]);

//   // Re-fetch daily menu when these filters change
//   useEffect(() => {
//     if (activeTab === "products") {
//       fetchHubMenu();
//     }
//   }, [selectedHub, selectedDate, selectedSession, activeTab]);

//   // // Re-filter default products when hub or base products change
//   // useEffect(() => {
//   //   if (selectedHub && allProducts.length > 0) {
//   //     const hubSpecificProducts = allProducts
//   //       .map((product) => {
//   //         const hubPriceData = product.locationPrice?.find(
//   //           (loc) => loc.hubId === selectedHub.hubId
//   //         );

//   //         if (hubPriceData) {
//   //           return {
//   //             ...product,
//   //             hubPriceData: hubPriceData,
//   //           };
//   //         }
//   //         return null;
//   //       })
//   //       .filter(Boolean); // Remove nulls

//   //     setDefaultHubProducts(hubSpecificProducts);
//   //   } else {
//   //     setDefaultHubProducts([]);
//   //   }
//   // }, [selectedHub, allProducts]);

//   // Reset pagination when data/tabs change
//   useEffect(() => {
//     setPageNumber(0);
//   }, [filteredMenuItems, activeTab]);

//   const onRemainingQuantityChange = (e) => {
//     const newRemaining = Number(e.target.value);
//     const oldRemaining = Number(editHubProductForm.remainingQuantity);
//     const oldTotal = Number(editHubProductForm.totalQuantity);

//     // Calculate how much the remaining changed
//     const diff = newRemaining - oldRemaining;

//     // Update both fields accordingly
//     setEditHubProductForm({
//       ...editHubProductForm,
//       remainingQuantity: newRemaining,
//       totalQuantity: oldTotal + diff, // keep total in sync
//     });
//   };

//   // --- RENDER ---
//   return (
//     <div className="container-fluid p-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2 className="header-c">Hub Menu Management</h2>
//         <div className="d-flex gap-2">
//           <Button
//             variant="outline-success"
//             onClick={() => setShowBulkPrice(true)}
//             // Disable if not on pricing tab
//             // disabled={activeTab !== "pricing"}
//           >
//             <MdPriceChange /> Bulk Price Update
//           </Button>
//         </div>
//       </div>

//       {/* Hub Selection */}
//       <Card className="mb-4">
//         <Card.Body>
//           <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
//             <strong>Select Hub:</strong>
//             {hubs.map((hub) => (
//               <Button
//                 key={hub._id}
//                 variant={
//                   selectedHub?._id === hub._id
//                     ? "outline-danger"
//                     : "outline-success"
//                 }
//                 onClick={() => setSelectedHub(hub)}
//                 className="d-flex align-items-center gap-2"
//               >
//                 <MdLocationOn />
//                 {hub.hubId}
//                 <small className="text-muted">({hub.hubName})</small>
//               </Button>
//             ))}
//           </div>
//         </Card.Body>
//       </Card>

//       {selectedHub && (
//         <Card>
//           <Card.Header>
//             <Tabs
//               activeKey={activeTab}
//               onSelect={(k) => setActiveTab(k)}
//               className="mb-0"
//             >
//               <Tab eventKey="products" title="Daily Menu"></Tab>
//               <Tab eventKey="pricing" title="Default Price Management"></Tab>
//             </Tabs>
//           </Card.Header>

//           <Card.Body>
//             {isDataLoading ? (
//               <div className="text-center py-5">
//                 <Spinner animation="border" variant="primary" />
//                 <p className="mt-2">Loading...</p>
//               </div>
//             ) : (
//               <>
//                 {/* --- TAB 1: DAILY MENU --- */}
//                 {activeTab === "products" && (
//                   <>
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <h5 className="mb-0">
//                         Daily Menu for <b>{selectedHub.hubName}</b>
//                       </h5>
//                       <div className="d-flex gap-2">
//                         <Button
//                           variant="outline-secondary"
//                           size="sm"
//                           onClick={exportToExcel}
//                         >
//                           Export Excel
//                         </Button>
//                         {/* <Button
//                           variant="outline-danger"
//                           size="sm"
//                           onClick={() => setShowDeleteAll(true)}
//                           disabled={filteredMenuItems.length === 0}
//                         >
//                           <BsTrash /> Delete All
//                         </Button> */}
//                       </div>
//                     </div>
//                     {/* Filters */}
//                     <div className="row mb-3">
//                       <div className="col-md-3">
//                         <Form.Group>
//                           <Form.Label>Select Date</Form.Label>
//                           <Form.Control
//                             type="date"
//                             value={selectedDate}
//                             onChange={(e) => setSelectedDate(e.target.value)}
//                           />
//                         </Form.Group>
//                       </div>
//                       <div className="col-md-3">
//                         <Form.Group>
//                           <Form.Label>Select Session</Form.Label>
//                           <Form.Select
//                             value={selectedSession}
//                             onChange={(e) => setSelectedSession(e.target.value)}
//                           >
//                             <option value="Lunch">Lunch</option>
//                             <option value="Dinner">Dinner</option>
//                           </Form.Select>
//                         </Form.Group>
//                       </div>
//                       <div className="col-md-3">
//                         <Form.Label>Search</Form.Label>
//                         <InputGroup>
//                           <InputGroup.Text>
//                             <BsSearch />
//                           </InputGroup.Text>
//                           <Form.Control
//                             type="text"
//                             placeholder="Search products..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                           />
//                         </InputGroup>
//                       </div>
//                       <div className="col-md-3">
//                         <Form.Label>Filter By</Form.Label>
//                         <Form.Select
//                           value={filterType}
//                           onChange={(e) => setFilterType(e.target.value)}
//                         >
//                           <option value="">All Products</option>
//                           <option value="out_of_stock">Out of Stock</option>
//                           <option value="low_stock">Low Stock</option>
//                         </Form.Select>
//                       </div>
//                     </div>
//                     <div className="mb-3 d-flex justify-content-between align-items-center">
//                       <div className="d-flex gap-2">
//                         <Button
//                           variant="outline-danger"
//                           size="sm"
//                           onClick={markAllProductsSoldOut}
//                           disabled={isDataLoading || isLoading}
//                         >
//                           Mark All Filtered as Sold Out
//                         </Button>
//                         <Button
//                           variant="outline-danger"
//                           size="sm"
//                           onClick={() => setShowDeleteAll(true)}
//                           disabled={filteredMenuItems.length === 0}
//                         >
//                           <BsTrash /> Delete All Menu Items
//                         </Button>
//                       </div>
//                       <Link to="/admin/menu-upload" className="ms-2">
//                         <Button variant="success">
//                           <FaExternalLinkAlt
//                             style={{
//                               paddingRight: "5px",
//                             }}
//                           />{" "}
//                           Add Product
//                         </Button>
//                       </Link>
//                     </div>

//                     {/* Products Table */}
//                     <div className="table-responsive">
//                       <Table striped bordered hover>
//                         <thead className="table-dark">
//                           <tr>
//                             <th>Sl. No</th>
//                             <th>Image</th>
//                             <th>Name</th>
//                             <th>Category</th>
//                             <th>Base (₹)</th>
//                             <th>Hub (₹)</th>
//                             <th>PreOrder (₹)</th>
//                             <th>Total</th>
//                             <th>Rem.</th>
//                             <th>Status</th>
//                             <th>Prio.</th>
//                             <th>Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredMenuItems
//                             .slice(pagesVisited, pagesVisited + usersPerPage)
//                             .map((item, index) => (
//                               <tr key={item._id}>
//                                 <td>{index + 1 + pagesVisited}</td>
//                                 <td>
//                                   <img
//                                     src={
//                                       item.productId?.Foodgallery?.[0]
//                                         ?.image2 ||
//                                       "https://via.placeholder.com/50"
//                                     }
//                                     alt={item.productId?.foodname}
//                                     style={{
//                                       width: "50px",
//                                       height: "50px",
//                                       objectFit: "cover",
//                                     }}
//                                     className="rounded"
//                                   />
//                                 </td>
//                                 <td>{item.productId?.foodname || "N/A"}</td>
//                                 <td>{item.productId?.foodcategory || "N/A"}</td>
//                                 <td>{item.basePrice}</td>
//                                 <td>{item.hubPrice}</td>
//                                 <td>{item.preOrderPrice}</td>
//                                 <td>{item.totalQuantity}</td>
//                                 <td>
//                                   <span
//                                     className={`badge ${
//                                       item.remainingQuantity === 0
//                                         ? "bg-danger"
//                                         : item.remainingQuantity < 10
//                                           ? "bg-warning"
//                                           : "bg-success"
//                                     }`}
//                                   >
//                                     {item.remainingQuantity}
//                                   </span>
//                                 </td>
//                                 <td>
//                                   <Form.Check
//                                     type="switch"
//                                     id={`active-switch-${item._id}`}
//                                     label={item.isActive ? "Active" : "Closed"}
//                                     checked={item.isActive}
//                                     onChange={() => handleToggleActive(item)}
//                                   />
//                                 </td>
//                                 <td>{item.hubPriority}</td>
//                                 <td>
//                                   <div className="d-flex gap-2">
//                                     <Button
//                                       variant="outline-primary"
//                                       size="sm"
//                                       onClick={() => openEditModal(item)}
//                                       title="Edit Daily Menu Item"
//                                     >
//                                       <AiOutlineEdit />
//                                     </Button>
//                                     <Button
//                                       variant="outline-warning"
//                                       size="sm"
//                                       onClick={() => markProductSoldOut(item)}
//                                       title="Mark as Sold Out"
//                                     >
//                                       Sold Out
//                                     </Button>
//                                     <Button
//                                       variant="outline-danger"
//                                       size="sm"
//                                       onClick={() => openDeleteModal(item)}
//                                       title="Remove from Daily Menu"
//                                     >
//                                       <AiFillDelete />
//                                     </Button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                         </tbody>
//                       </Table>
//                     </div>

//                     {/* Pagination */}
//                     <div className="d-flex justify-content-between align-items-center">
//                       <p className="mb-0">
//                         Total: {filteredMenuItems.length} products
//                       </p>
//                       <ReactPaginate
//                         previousLabel={"Back"}
//                         nextLabel={"Next"}
//                         pageCount={pageCount}
//                         onPageChange={changePage}
//                         containerClassName={"paginationBttns mb-0"}
//                         previousLinkClassName={"previousBttn"}
//                         nextLinkClassName={"nextBttn"}
//                         disabledClassName={"paginationDisabled"}
//                         activeClassName={"paginationActive"}
//                       />
//                     </div>
//                   </>
//                 )}

//                 {/* --- TAB 2: PRICE MANAGEMENT --- */}
//                 {activeTab === "pricing" && (
//                   <>
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <h5 className="mb-0">
//                         Price Management for {selectedHub.hubName}
//                       </h5>
//                       {/* <div className="col-md-3">
//         <InputGroup>
//           <InputGroup.Text><BsSearch /></InputGroup.Text>
//           <Form.Control
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </InputGroup>
//       </div> */}
//                     </div>

//                     <div className="row">
//                       {/* --- Price Overview (Left Side) --- */}
//                       <div className="col-md-7">
//                         <Card>
//                           <Card.Header>
//                             <h6>
//                               Price Overview (for {selectedDate} -{" "}
//                               {selectedSession})
//                             </h6>
//                           </Card.Header>
//                           <Card.Body
//                             style={{ maxHeight: "600px", overflowY: "auto" }}
//                           >
//                             {/* We map `filteredMenuItems` here */}
//                             {filteredMenuItems.length > 0 ? (
//                               filteredMenuItems.map((item) => (
//                                 <div
//                                   key={item._id}
//                                   className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
//                                 >
//                                   <span>
//                                     <img
//                                       src={
//                                         item.productId?.Foodgallery?.[0]
//                                           ?.image2 ||
//                                         "https://via.placeholder.com/50"
//                                       }
//                                       alt={item.productId?.foodname}
//                                       style={{
//                                         width: "40px",
//                                         height: "40px",
//                                         objectFit: "cover",
//                                         marginRight: "10px",
//                                       }}
//                                       className="rounded"
//                                     />
//                                     {item.productId?.foodname}
//                                   </span>
//                                   <div className="d-flex align-items-center gap-3">
//                                     <span className="text-muted">
//                                       Base: ₹{item.basePrice}
//                                     </span>
//                                     <div className="d-flex align-items-center gap-2">
//                                       <strong>Hub Price:</strong>
//                                       <span className="text-muted">₹</span>
//                                       <input
//                                         type="number"
//                                         className="form-control form-control-sm"
//                                         defaultValue={item.hubPrice}
//                                         onBlur={(e) => {
//                                           // This is an inline edit
//                                           // We call the *single item* update endpoint
//                                           const newPrice = Number(
//                                             e.target.value,
//                                           );
//                                           if (newPrice !== item.hubPrice) {
//                                             axios
//                                               .put(
//                                                 `${API_URL}/update/${item._id}`,
//                                                 { hubPrice: newPrice },
//                                                 {
//                                                   headers: {
//                                                     Authorization: `Bearer ${token}`,
//                                                   },
//                                                 },
//                                               )
//                                               .then(() => {
//                                                 // Optimistically update state
//                                                 setMenuItems((prev) =>
//                                                   prev.map((mi) =>
//                                                     mi._id === item._id
//                                                       ? {
//                                                           ...mi,
//                                                           hubPrice: newPrice,
//                                                         }
//                                                       : mi,
//                                                   ),
//                                                 );
//                                               })
//                                               .catch((err) => {
//                                                 console.error(err);
//                                                 alert(
//                                                   "Failed to update price.",
//                                                 );
//                                                 e.target.value = item.hubPrice; // Revert on fail
//                                               });
//                                           }
//                                         }}
//                                         style={{ width: "80px" }}
//                                       />
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))
//                             ) : (
//                               <p>No menu items found for this filter.</p>
//                             )}
//                           </Card.Body>
//                         </Card>
//                       </div>

//                       {/* --- Bulk Price Actions (Right Side) --- */}
//                       <div className="col-md-5">
//                         <Card>
//                           <Card.Header>
//                             <h6>Bulk Price Actions</h6>
//                           </Card.Header>
//                           <Card.Body>
//                             <div className="d-grid gap-2">
//                               <Button
//                                 variant="outline-success"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(10, "increase")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Increase All Prices by 10%"
//                                 )}
//                               </Button>
//                               <Button
//                                 variant="outline-warning"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(5, "increase")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Increase All Prices by 5%"
//                                 )}
//                               </Button>
//                               <Button
//                                 variant="outline-danger"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(5, "decrease")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Decrease All Prices by 5%"
//                                 )}
//                               </Button>
//                               <Button
//                                 variant="outline-dark"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(10, "decrease")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Decrease All Prices by 10%"
//                                 )}
//                               </Button>
//                             </div>
//                           </Card.Body>
//                         </Card>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </>
//             )}
//           </Card.Body>
//         </Card>
//       )}

//       {/* --- MODALS --- */}
//       {/* (All modals from previous response go here) */}

//       {/* Bulk Price Update Modal */}
//       <Modal show={showBulkPrice} onHide={() => setShowBulkPrice(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Bulk Price Update</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="text-center mb-4">
//             <h6>
//               Update default prices for all products in {selectedHub?.hubName}
//             </h6>
//             <p className="text-muted">
//               This will modify the 'locationPrice' for all products in this hub.
//             </p>
//           </div>
//           <div className="d-grid gap-3">
//             <Card className="border-success">
//               <Card.Body className="text-center">
//                 <h6 className="text-success mb-3">Increase Prices</h6>
//                 <div className="d-grid gap-2">
//                   <Button
//                     variant="outline-success"
//                     onClick={() => handleBulkPriceUpdate(5, "increase")}
//                     disabled={isLoading}
//                   >
//                     Increase by 5%
//                   </Button>
//                   <Button
//                     variant="outline-success"
//                     onClick={() => handleBulkPriceUpdate(10, "increase")}
//                     disabled={isLoading}
//                   >
//                     Increase by 10%
//                   </Button>
//                 </div>
//               </Card.Body>
//             </Card>
//             <Card className="border-danger">
//               <Card.Body className="text-center">
//                 <h6 className="text-danger mb-3">Decrease Prices</h6>
//                 <div className="d-grid gap-2">
//                   <Button
//                     variant="outline-danger"
//                     onClick={() => handleBulkPriceUpdate(5, "decrease")}
//                     disabled={isLoading}
//                   >
//                     Decrease by 5%
//                   </Button>
//                   <Button
//                     variant="outline-danger"
//                     onClick={() => handleBulkPriceUpdate(10, "decrease")}
//                     disabled={isLoading}
//                   >
//                     Decrease by 10%
//                   </Button>
//                 </div>
//               </Card.Body>
//             </Card>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowBulkPrice(false)}>
//             Cancel
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Delete All Hubwise Modal */}
//       <Modal show={showDeleteAll} onHide={() => setShowDeleteAll(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             <BsTrash /> Delete All Menu Items
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Alert variant="danger">
//             <Alert.Heading>
//               Warning: This action cannot be undone!
//             </Alert.Heading>
//             <p>
//               You are about to delete ALL menu items for the following
//               selection:
//             </p>
//             <ul>
//               <li>
//                 <strong>Hub:</strong> {selectedHub?.hubName}
//               </li>
//               <li>
//                 <strong>Date:</strong> {selectedDate}
//               </li>
//               <li>
//                 <strong>Session:</strong> {selectedSession}
//               </li>
//               <li>
//                 <strong>Total Items to Delete:</strong>{" "}
//                 {filteredMenuItems.length}
//               </li>
//             </ul>
//             <hr />
//             <p className="mb-0">
//               <strong>
//                 This will permanently remove all menu items matching these
//                 filters.
//               </strong>
//               <br />
//               All associated data including prices, stock quantities, and
//               priorities will be lost.
//             </p>
//           </Alert>

//           <div className="mt-3">
//             <Form.Check
//               type="checkbox"
//               id="confirm-delete-all"
//               label="I understand this action is irreversible and I take full responsibility"
//               required
//               onChange={(e) => {
//                 // You can add additional confirmation logic here
//               }}
//             />
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDeleteAll(false)}>
//             Cancel
//           </Button>
//           <Button
//             variant="danger"
//             onClick={deleteAllHubwise}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Spinner
//                   as="span"
//                   animation="border"
//                   size="sm"
//                   role="status"
//                   aria-hidden="true"
//                   className="me-2"
//                 />
//                 Deleting...
//               </>
//             ) : (
//               <>
//                 <BsTrash className="me-2" />
//                 Delete All ({filteredMenuItems.length} items)
//               </>
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Price Manager Modal (Removed, as it's now inline on the tab) */}

//       {/* Delete Product Modal (For Daily Menu) */}
//       <Modal
//         show={showDeleteProduct}
//         onHide={() => setShowDeleteProduct(false)}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Delete</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>
//             Are you sure you want to remove "
//             {selectedProductForDelete?.productId?.foodname}" from this hub's
//             menu for this date/session?
//           </p>
//           <p className="text-danger">This action cannot be undone.</p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowDeleteProduct(false)}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="danger"
//             onClick={deleteHubMenuItem}
//             disabled={isLoading}
//           >
//             {isLoading ? <Spinner size="sm" /> : "Delete"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Edit Hub Product Modal (For Daily Menu) */}
//       <Modal
//         show={showEditHubProduct}
//         onHide={() => setShowEditHubProduct(false)}
//         size="lg"
//         style={{ zIndex: 99999 }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             Edit Daily Menu Item in {selectedHub?.hubName}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {editHubProductForm.product && (
//             <>
//               <div className="mb-3">
//                 <Card>
//                   <Card.Body className="p-3">
//                     <div className="d-flex align-items-center gap-3">
//                       <img
//                         src={
//                           editHubProductForm.product.Foodgallery?.[0]?.image2 ||
//                           "https://via.placeholder.com/60"
//                         }
//                         alt={editHubProductForm.product.foodname}
//                         style={{
//                           width: "60px",
//                           height: "60px",
//                           objectFit: "cover",
//                         }}
//                         className="rounded"
//                       />
//                       <div>
//                         <h6 className="mb-1">
//                           {editHubProductForm.product.foodname}
//                         </h6>
//                         <small className="text-muted">
//                           {editHubProductForm.product.foodcategory} • Base
//                           Price: ₹
//                           {editHubProductForm.product.basePrice ||
//                             editHubProductForm.product.foodprice}
//                         </small>
//                       </div>
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </div>

//               <div className="row">
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Hub Price (₹)</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.hubPrice}
//                       onChange={(e) =>
//                         setEditHubProductForm({
//                           ...editHubProductForm,
//                           hubPrice: e.target.value,
//                         })
//                       }
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Pre Order Price (₹)</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.preOrderPrice}
//                       onChange={(e) =>
//                         setEditHubProductForm({
//                           ...editHubProductForm,
//                           preOrderPrice: e.target.value,
//                         })
//                       }
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Total Stock</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.totalQuantity}
//                       disabled
//                       readOnly
//                       className="bg-light"
//                       // onChange={(e) =>
//                       //   setEditHubProductForm({
//                       //     ...editHubProductForm,
//                       //     totalQuantity: e.target.value,
//                       //   })
//                       // }
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Remaining Stock</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.remainingQuantity}
//                       onChange={onRemainingQuantityChange}
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Menu Priority</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.hubPriority}
//                       onChange={(e) =>
//                         setEditHubProductForm({
//                           ...editHubProductForm,
//                           hubPriority: e.target.value,
//                         })
//                       }
//                     />
//                   </Form.Group>
//                 </div>
//               </div>

//               <div className="alert alert-info">
//                 <small>
//                   <strong>Note:</strong> Changes will apply to this menu item
//                   for {selectedDate} ({selectedSession}) in{" "}
//                   {selectedHub?.hubName}.
//                 </small>
//               </div>
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowEditHubProduct(false)}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             onClick={updateHubMenuItem}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Spinner animation="border" size="sm" className="me-2" />
//                 Updating...
//               </>
//             ) : (
//               "Update Menu Item"
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default HubWiseProductManagement;

// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Button,
//   Modal,
//   Table,
//   Form,
//   Spinner,
//   Card,
//   Tabs,
//   Tab,
//   InputGroup,
//   Alert,
// } from "react-bootstrap";
// import { AiFillDelete, AiOutlineEdit } from "react-icons/ai";
// import { BsSearch, BsPlus, BsTrash, BsCalendarDate } from "react-icons/bs";
// import { MdLocationOn, MdPriceChange } from "react-icons/md";
// import axios from "axios";
// import ReactPaginate from "react-paginate";
// import * as XLSX from "xlsx";
// import { Link } from "react-router-dom";
// import { FaExternalLinkAlt } from "react-icons/fa";

// // API URL for HubMenu (Daily Menu)
// const API_URL = "https://dd-backend-3nm0.onrender.com/api/admin/hub-menu";
// // API URL for Admin actions (Products, Hubs)
// const ADMIN_API_URL = "https://dd-backend-3nm0.onrender.com/api/admin";
// const HUB_API_URL = "https://dd-backend-3nm0.onrender.com/api/Hub";

// const HubWiseProductManagement = () => {
//   // Add this helper function at the top of your component, after the imports
// // Fix the normalizeDate helper function
// const normalizeDate = (date) => {
//   if (!date) return '';
//   const d = new Date(date);

//   // Format to YYYY-MM-DD in local timezone
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');

//   return `${year}-${month}-${day}`;
// };

//   // --- STATE ---

//   // Hub State
//   const [hubs, setHubs] = useState([]);
//   const [selectedHub, setSelectedHub] = useState(null);
//   const token = localStorage.getItem("authToken");

//   // Filter State
//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toISOString().split("T")[0],
//   );
//   const [selectedSession, setSelectedSession] = useState("Lunch");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState("");

//   // Data State
//   const [menuItems, setMenuItems] = useState([]); // For "Products" tab (Daily Menu)
//   const [allProducts, setAllProducts] = useState([]); // For "Price Management" tab (Base Products)
//   // const [defaultHubProducts, setDefaultHubProducts] = useState([]); // Filtered Base Products

//   const [isLoading, setIsLoading] = useState(false); // For modal buttons
//   const [isDataLoading, setIsDataLoading] = useState(false); // For table loading

//   // Modal States
//   const [showEditHubProduct, setShowEditHubProduct] = useState(false);
//   const [showDeleteProduct, setShowDeleteProduct] = useState(false);
//   const [showBulkPrice, setShowBulkPrice] = useState(false);
//   const [showDeleteAll, setShowDeleteAll] = useState(false);
//   const [showChangeDate, setShowChangeDate] = useState(false); // New modal for change date
//   // const [showPriceManager, setShowPriceManager] = useState(false);
//   const [activeTab, setActiveTab] = useState("products");

//   // Form States
//   const [editHubProductForm, setEditHubProductForm] = useState({
//     _id: null,
//     productId: null,
//     foodname: "",
//     hubPrice: 0,
//     totalQuantity: 0,
//     remainingQuantity: 0,
//     hubPriority: 0,
//     product: null,
//     preOrderPrice: 0,
//   });

//   const [selectedProductForDelete, setSelectedProductForDelete] =
//     useState(null);

//   // Change Date State
//   const [changeDateData, setChangeDateData] = useState({
//     newDate: "",
//     selectedItems: "all", // "all" or "filtered"
//   });

//   // --- DERIVED STATE (for "Products" Tab) ---
//   const filteredMenuItems = useMemo(() => {
//     let filteredData = [...menuItems];
//     if (searchTerm && activeTab === "products") {
//       filteredData = filteredData.filter(
//         (item) =>
//           item.productId?.foodname
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           item.productId?.foodcategory
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()),
//       );
//     }
//     if (filterType && activeTab === "products") {
//       switch (filterType) {
//         case "out_of_stock":
//           filteredData = filteredData.filter(
//             (item) => item.remainingQuantity === 0,
//           );
//           break;
//         case "low_stock":
//           filteredData = filteredData.filter(
//             (item) => item.remainingQuantity < 10 && item.remainingQuantity > 0,
//           );
//           break;
//         default:
//           break;
//       }
//     }
//     return filteredData;
//   }, [menuItems, searchTerm, filterType, activeTab]);

//   // Pagination
//   const [pageNumber, setPageNumber] = useState(0);
//   const usersPerPage = 20;
//   const pagesVisited = pageNumber * usersPerPage;
//   const changePage = ({ selected }) => setPageNumber(selected);

//   // Determine page count based on active tab
//   const pageCount = Math.ceil(filteredMenuItems.length / usersPerPage);

//   // --- API FUNCTIONS ---

//   const getHubs = async () => {
//     try {
//       const res = await axios.get(`${HUB_API_URL}/hubs`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setHubs(res.data);
//       if (res.data.length > 0) {
//         setSelectedHub(res.data[0]);
//       }
//     } catch (error) {
//       console.error("Failed to fetch hubs:", error);
//     }
//   };

//   // 1. Fetch Daily Menu (for "Products" tab)
// // 1. Fetch Daily Menu (for "Products" tab)
// const fetchHubMenu = async () => {
//   if (!selectedHub || !selectedDate || !selectedSession) {
//     setMenuItems([]);
//     return;
//   }
//   setIsDataLoading(true);
//   try {
//     // Create a date at UTC midnight from the selected date string
//     const dateObj = new Date(selectedDate + 'T00:00:00.000Z');

//     const res = await axios.get(`${API_URL}/get-menu`, {
//       params: {
//         hubId: selectedHub._id,
//         menuDate: dateObj.toISOString(), // Send as ISO string
//         session: selectedSession,
//       },
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setMenuItems(res.data.menu || []);
//   } catch (error) {
//     console.error("Error fetching hub menu:", error);
//     setMenuItems([]);
//   } finally {
//     setIsDataLoading(false);
//   }
// };

//   // --- ACTION FUNCTIONS ---

//   // (Actions for "Products" Tab - Daily Menu)
//   const updateHubMenuItem = async () => {
//     if (!editHubProductForm._id) return;
//     try {
//       setIsLoading(true);
//       const updateData = {
//         hubPrice: Number(editHubProductForm.hubPrice),
//         preOrderPrice: Number(editHubProductForm.preOrderPrice),
//         totalQuantity: Number(editHubProductForm.totalQuantity),
//         remainingQuantity: Number(editHubProductForm.remainingQuantity),
//         hubPriority: Number(editHubProductForm.hubPriority),
//       };
//       const res = await axios.put(
//         `${API_URL}/update/${editHubProductForm._id}`,
//         updateData,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       if (res.status === 200) {
//         alert("Menu item updated successfully!");
//         setShowEditHubProduct(false);
//         await fetchHubMenu();
//       }
//     } catch (error) {
//       console.error("Failed to update menu item:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteHubMenuItem = async () => {
//     if (!selectedProductForDelete) return;
//     try {
//       setIsLoading(true);
//       const res = await axios.delete(
//         `${API_URL}/delete/${selectedProductForDelete._id}`,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       if (res.status === 200) {
//         alert("Menu item removed successfully!");
//         setShowDeleteProduct(false);
//         setSelectedProductForDelete(null);
//         await fetchHubMenu();
//       }
//     } catch (error) {
//       console.error("Failed to delete menu item:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // New function: Delete All Hubwise Menu Items
//   const deleteAllHubwise = async () => {
//     if (!selectedHub || !selectedDate || !selectedSession) {
//       alert("Please select hub, date, and session first!");
//       return;
//     }

//     // Confirmation with warning
//     const confirmMsg = `Are you absolutely sure you want to delete ALL menu items for:\n\nHub: ${selectedHub.hubName}\nDate: ${selectedDate}\nSession: ${selectedSession}\n\nThis action will permanently delete ${filteredMenuItems.length} items and cannot be undone!`;

//     if (!window.confirm(confirmMsg)) {
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const res = await axios.delete(`${API_URL}/delete-all-hubwise`, {
//         data: {
//           hubId: selectedHub._id,
//           menuDate: selectedDate,
//           session: selectedSession,
//         },
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.status === 200) {
//         alert(`Successfully deleted ${res.data.deletedCount || 0} menu items!`);
//         setShowDeleteAll(false);
//         await fetchHubMenu(); // Refresh the data
//       }
//     } catch (error) {
//       console.error("Failed to delete all hubwise items:", error);
//       alert(
//         error.response?.data?.error ||
//           "Failed to delete items. Please try again.",
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // FIXED: Change Date for Menu Items using /update-single-menu-date endpoint
// // FIXED: Change Date for Menu Items using /update-single-menu-date endpoint
// const changeMenuDate = async () => {
//   if (!selectedHub || !selectedDate || !selectedSession) {
//     alert("Please select hub, date, and session first!");
//     return;
//   }

//   if (!changeDateData.newDate) {
//     alert("Please select a new date!");
//     return;
//   }

//   // Check if new date is same as old date
//   if (changeDateData.newDate === selectedDate) {
//     alert("New date is the same as current date. Please select a different date.");
//     return;
//   }

//   const itemsToUpdate = changeDateData.selectedItems === "all"
//     ? menuItems
//     : filteredMenuItems;

//   if (itemsToUpdate.length === 0) {
//     alert("No items to update!");
//     return;
//   }

//   const confirmMsg = `Are you sure you want to change the date for ${itemsToUpdate.length} menu item(s) from ${selectedDate} to ${changeDateData.newDate}?`;

//   if (!window.confirm(confirmMsg)) {
//     return;
//   }

//   setIsLoading(true);
//   try {
//     let successCount = 0;
//     let errorCount = 0;
//     const failedItems = [];

//     // Update each item individually using the /update-single-menu-date endpoint
//     for (const item of itemsToUpdate) {
//       try {
//         const res = await axios.put(
//           `${API_URL}/update-single-menu-date/${item._id}`,
//           { newDate: changeDateData.newDate },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         // FIX: Check for success property (not 'success')
//         if (res.data && res.data.success === true) {
//           successCount++;
//         } else {
//           errorCount++;
//           failedItems.push({
//             name: item.productId?.foodname || "Unknown",
//             id: item._id,
//             error: res.data?.message || "Unknown error"
//           });
//         }
//       } catch (error) {
//         console.error(`Failed to update item ${item._id}:`, error);
//         errorCount++;
//         failedItems.push({
//           name: item.productId?.foodname || "Unknown",
//           id: item._id,
//           error: error.response?.data?.message || error.message
//         });
//       }
//     }

//     if (successCount > 0) {
//       let message = `Successfully updated date for ${successCount} item(s).`;
//       if (errorCount > 0) {
//         message += ` Failed to update ${errorCount} item(s).`;
//         console.log("Failed items:", failedItems);
//       }
//       alert(message);

//       // CRITICAL FIX: Update the selected date to the new date
//       setSelectedDate(changeDateData.newDate);

//       // Close the modal
//       setShowChangeDate(false);

//       // Reset change date form
//       setChangeDateData({ newDate: "", selectedItems: "all" });

//       // FIX: Manually fetch the menu for the new date
//       // The useEffect might not trigger immediately, so call it explicitly
//       await fetchHubMenu();

//     } else {
//       alert("Failed to update any items. Please try again.");
//     }
//   } catch (error) {
//     console.error("Failed to change menu date:", error);
//     alert(
//       error.response?.data?.message ||
//         "Failed to change date. Please try again.",
//     );
//   } finally {
//     setIsLoading(false);
//   }
// };

//   // Add a function to change date for a single item (for individual item action)
//   const changeSingleItemDate = async (itemId, newDate) => {
//     try {
//       const res = await axios.put(
//         `${API_URL}/update-single-menu-date/${itemId}`,
//         { newDate: newDate },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       return res.data;
//     } catch (error) {
//       console.error("Failed to update single item date:", error);
//       throw error;
//     }
//   };

//   const handleToggleActive = async (item) => {
//     setMenuItems((prevItems) =>
//       prevItems.map((menuItem) =>
//         menuItem._id === item._id
//           ? { ...menuItem, isActive: !item.isActive }
//           : menuItem,
//       ),
//     );
//     try {
//       await axios.put(
//         `${API_URL}/update/${item._id}`,
//         { isActive: !item.isActive },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//     } catch (error) {
//       alert("Failed to update status.");
//       await fetchHubMenu(); // Revert on error
//     }
//   };

//   const exportToExcel = () => {
//     // 1. Check if there is data to export
//     if (filteredMenuItems.length === 0) {
//       alert("No data to export. Please check your filters.");
//       return;
//     }

//     // 2. Format the data from filteredMenuItems into a clean array
//     const exportData = filteredMenuItems.map((item, index) => ({
//       "Sl. No": index + 1,
//       "Product Name": item.productId?.foodname,
//       Category: item.productId?.foodcategory,
//       "Base Price (₹)": item.basePrice,
//       "Hub Price (₹)": item.hubPrice,
//       "Pre-order Price (₹)": item.preOrderPrice,
//       "Total Stock": item.totalQuantity,
//       "Remaining Stock": item.remainingQuantity,
//       Priority: item.hubPriority,
//       Status: item.isActive ? "Active" : "Closed",
//     }));

//     // 3. Create a worksheet from the formatted data
//     const worksheet = XLSX.utils.json_to_sheet(exportData);

//     // 4. Create a new workbook
//     const workbook = XLSX.utils.book_new();

//     // 5. Append the worksheet to the workbook with a sheet name
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Menu");

//     // 6. Define a dynamic filename
//     const filename = `HubMenu_${
//       selectedHub?.hubName || "Hub"
//     }_${selectedDate}_${selectedSession}.xlsx`;

//     // 7. Trigger the file download
//     XLSX.writeFile(workbook, filename);
//   };

//   const markProductSoldOut = async (item) => {
//     setMenuItems((prevItems) =>
//       prevItems.map((menuItem) =>
//         menuItem._id === item._id
//           ? { ...menuItem, remainingQuantity: 0 }
//           : menuItem,
//       ),
//     );
//     try {
//       await axios.put(
//         `${API_URL}/update/${item._id}`,
//         { remainingQuantity: 0 },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//     } catch (error) {
//       alert("Failed to mark as sold out.");
//       await fetchHubMenu();
//     }
//   };

//   const markAllProductsSoldOut = async () => {
//     if (!selectedHub) return;
//     const confirm = window.confirm(
//       `Are you sure you want to mark ALL items as sold out for this filter?`,
//     );
//     if (!confirm) return;
//     setIsDataLoading(true);
//     try {
//       await axios.post(
//         `${API_URL}/bulk-sold-out`,
//         {
//           hubId: selectedHub._id,
//           menuDate: selectedDate,
//           session: selectedSession,
//         },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       await fetchHubMenu();
//     } catch (error) {
//       alert("Failed to mark all as sold out.");
//     } finally {
//       setIsDataLoading(false);
//     }
//   };

//   // (Actions for "Price Management" Tab - Default Prices)

//   // This is for the "Bulk Price Update" modal
//   const handleBulkPriceUpdate = async (percentage, operation) => {
//     if (!selectedHub || !selectedDate || !selectedSession) {
//       alert("Please select a hub, date, and session first.");
//       return;
//     }

//     const confirmMsg = `Are you sure you want to ${operation} all prices by ${percentage}% for this menu?`;
//     if (!window.confirm(confirmMsg)) return;

//     setIsLoading(true); // Use the modal spinner
//     try {
//       const res = await axios.post(
//         `${API_URL}/bulk-price-update`, // The new endpoint
//         {
//           hubId: selectedHub._id,
//           menuDate: selectedDate,
//           session: selectedSession,
//           percentage: percentage,
//           operation: operation,
//         },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );

//       if (res.data.success) {
//         alert(res.data.message);
//         await fetchHubMenu(); // Refresh data to show new prices
//       }
//     } catch (error) {
//       console.error("Failed to bulk update prices:", error);
//       alert(error?.response?.data?.message || "Bulk update failed.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- MODAL HANDLERS ---
//   const openEditModal = (menuItem) => {
//     setEditHubProductForm({
//       _id: menuItem._id,
//       productId: menuItem.productId._id,
//       foodname: menuItem.productId.foodname,
//       hubPrice: menuItem.hubPrice,
//       preOrderPrice: menuItem.preOrderPrice,
//       totalQuantity: menuItem.totalQuantity,
//       remainingQuantity: menuItem.remainingQuantity,
//       hubPriority: menuItem.hubPriority,
//       product: menuItem.productId,
//     });
//     setShowEditHubProduct(true);
//   };

//   const openDeleteModal = (menuItem) => {
//     setSelectedProductForDelete(menuItem);
//     setShowDeleteProduct(true);
//   };

//   const openChangeDateModal = () => {
//     setChangeDateData({
//       newDate: "",
//       selectedItems: "all",
//     });
//     setShowChangeDate(true);
//   };

//   // --- EFFECTS ---
//   useEffect(() => {
//     getHubs();
//   }, [token]);

//   // Re-fetch daily menu when these filters change
//   useEffect(() => {
//     if (activeTab === "products") {
//       fetchHubMenu();
//     }
//   }, [selectedHub, selectedDate, selectedSession, activeTab]);

//   // Reset pagination when data/tabs change
//   useEffect(() => {
//     setPageNumber(0);
//   }, [filteredMenuItems, activeTab]);

//   const onRemainingQuantityChange = (e) => {
//     const newRemaining = Number(e.target.value);
//     const oldRemaining = Number(editHubProductForm.remainingQuantity);
//     const oldTotal = Number(editHubProductForm.totalQuantity);

//     // Calculate how much the remaining changed
//     const diff = newRemaining - oldRemaining;

//     // Update both fields accordingly
//     setEditHubProductForm({
//       ...editHubProductForm,
//       remainingQuantity: newRemaining,
//       totalQuantity: oldTotal + diff, // keep total in sync
//     });
//   };

//   // --- RENDER ---
//   return (
//     <div className="container-fluid p-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2 className="header-c">Hub Menu Management</h2>
//         <div className="d-flex gap-2">
//           <Button
//             variant="outline-success"
//             onClick={() => setShowBulkPrice(true)}
//             // Disable if not on pricing tab
//             // disabled={activeTab !== "pricing"}
//           >
//             <MdPriceChange /> Bulk Price Update
//           </Button>
//         </div>
//       </div>

//       {/* Hub Selection */}
//       <Card className="mb-4">
//         <Card.Body>
//           <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
//             <strong>Select Hub:</strong>
//             {hubs.map((hub) => (
//               <Button
//                 key={hub._id}
//                 variant={
//                   selectedHub?._id === hub._id
//                     ? "outline-danger"
//                     : "outline-success"
//                 }
//                 onClick={() => setSelectedHub(hub)}
//                 className="d-flex align-items-center gap-2"
//               >
//                 <MdLocationOn />
//                 {hub.hubId}
//                 <small className="text-muted">({hub.hubName})</small>
//               </Button>
//             ))}
//           </div>
//         </Card.Body>
//       </Card>

//       {selectedHub && (
//         <Card>
//           <Card.Header>
//             <Tabs
//               activeKey={activeTab}
//               onSelect={(k) => setActiveTab(k)}
//               className="mb-0"
//             >
//               <Tab eventKey="products" title="Daily Menu"></Tab>
//               <Tab eventKey="pricing" title="Default Price Management"></Tab>
//             </Tabs>
//           </Card.Header>

//           <Card.Body>
//             {isDataLoading ? (
//               <div className="text-center py-5">
//                 <Spinner animation="border" variant="primary" />
//                 <p className="mt-2">Loading...</p>
//               </div>
//             ) : (
//               <>
//                 {/* --- TAB 1: DAILY MENU --- */}
//                 {activeTab === "products" && (
//                   <>
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <h5 className="mb-0">
//                         Daily Menu for <b>{selectedHub.hubName}</b>
//                       </h5>
//                       <div className="d-flex gap-2">
//                         <Button
//                           variant="outline-secondary"
//                           size="sm"
//                           onClick={exportToExcel}
//                         >
//                           Export Excel
//                         </Button>
//                         {/* <Button
//                           variant="outline-danger"
//                           size="sm"
//                           onClick={() => setShowDeleteAll(true)}
//                           disabled={filteredMenuItems.length === 0}
//                         >
//                           <BsTrash /> Delete All
//                         </Button> */}
//                       </div>
//                     </div>
//                     {/* Filters */}
//                     <div className="row mb-3">
//                       <div className="col-md-3">
//                         <Form.Group>
//                           <Form.Label>Select Date</Form.Label>
//                           <Form.Control
//                             type="date"
//                             value={selectedDate}
//                             onChange={(e) => setSelectedDate(e.target.value)}
//                           />
//                         </Form.Group>
//                       </div>
//                       <div className="col-md-3">
//                         <Form.Group>
//                           <Form.Label>Select Session</Form.Label>
//                           <Form.Select
//                             value={selectedSession}
//                             onChange={(e) => setSelectedSession(e.target.value)}
//                           >
//                             <option value="Lunch">Lunch</option>
//                             <option value="Dinner">Dinner</option>
//                           </Form.Select>
//                         </Form.Group>
//                       </div>
//                       <div className="col-md-3">
//                         <Form.Label>Search</Form.Label>
//                         <InputGroup>
//                           <InputGroup.Text>
//                             <BsSearch />
//                           </InputGroup.Text>
//                           <Form.Control
//                             type="text"
//                             placeholder="Search products..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                           />
//                         </InputGroup>
//                       </div>
//                       <div className="col-md-3">
//                         <Form.Label>Filter By</Form.Label>
//                         <Form.Select
//                           value={filterType}
//                           onChange={(e) => setFilterType(e.target.value)}
//                         >
//                           <option value="">All Products</option>
//                           <option value="out_of_stock">Out of Stock</option>
//                           <option value="low_stock">Low Stock</option>
//                         </Form.Select>
//                       </div>
//                     </div>
//                     <div className="mb-3 d-flex justify-content-between align-items-center">
//                       <div className="d-flex gap-2">
//                         <Button
//                           variant="outline-danger"
//                           size="sm"
//                           onClick={markAllProductsSoldOut}
//                           disabled={isDataLoading || isLoading}
//                         >
//                           Mark All Filtered as Sold Out
//                         </Button>
//                         <Button
//                           variant="outline-danger"
//                           size="sm"
//                           onClick={() => setShowDeleteAll(true)}
//                           disabled={filteredMenuItems.length === 0}
//                         >
//                           <BsTrash /> Delete All Menu Items
//                         </Button>
//                         {/* New Change Date Button */}
//                         <Button
//                           variant="outline-primary"
//                           size="sm"
//                           onClick={openChangeDateModal}
//                           disabled={filteredMenuItems.length === 0}
//                         >
//                           <BsCalendarDate /> Change Date
//                         </Button>
//                       </div>
//                       <Link to="/admin/menu-upload" className="ms-2">
//                         <Button variant="success">
//                           <FaExternalLinkAlt
//                             style={{
//                               paddingRight: "5px",
//                             }}
//                           />{" "}
//                           Add Product
//                         </Button>
//                       </Link>
//                     </div>

//                     {/* Products Table */}
//                     <div className="table-responsive">
//                       <Table striped bordered hover>
//                         <thead className="table-dark">
//                           <tr>
//                             <th>Sl. No</th>
//                             <th>Image</th>
//                             <th>Name</th>
//                             <th>Category</th>
//                             <th>Base (₹)</th>
//                             <th>Hub (₹)</th>
//                             <th>PreOrder (₹)</th>
//                             <th>Total</th>
//                             <th>Rem.</th>
//                             <th>Status</th>
//                             <th>Prio.</th>
//                             <th>Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredMenuItems
//                             .slice(pagesVisited, pagesVisited + usersPerPage)
//                             .map((item, index) => (
//                               <tr key={item._id}>
//                                 <td>{index + 1 + pagesVisited}</td>
//                                 <td>
//                                   <img
//                                     src={
//                                       item.productId?.Foodgallery?.[0]
//                                         ?.image2 ||
//                                       "https://via.placeholder.com/50"
//                                     }
//                                     alt={item.productId?.foodname}
//                                     style={{
//                                       width: "50px",
//                                       height: "50px",
//                                       objectFit: "cover",
//                                     }}
//                                     className="rounded"
//                                   />
//                                 </td>
//                                 <td>{item.productId?.foodname || "N/A"}</td>
//                                 <td>{item.productId?.foodcategory || "N/A"}</td>
//                                 <td>{item.basePrice}</td>
//                                 <td>{item.hubPrice}</td>
//                                 <td>{item.preOrderPrice}</td>
//                                 <td>{item.totalQuantity}</td>
//                                 <td>
//                                   <span
//                                     className={`badge ${
//                                       item.remainingQuantity === 0
//                                         ? "bg-danger"
//                                         : item.remainingQuantity < 10
//                                           ? "bg-warning"
//                                           : "bg-success"
//                                     }`}
//                                   >
//                                     {item.remainingQuantity}
//                                   </span>
//                                 </td>
//                                 <td>
//                                   <Form.Check
//                                     type="switch"
//                                     id={`active-switch-${item._id}`}
//                                     label={item.isActive ? "Active" : "Closed"}
//                                     checked={item.isActive}
//                                     onChange={() => handleToggleActive(item)}
//                                   />
//                                 </td>
//                                 <td>{item.hubPriority}</td>
//                                 <td>
//                                   <div className="d-flex gap-2">
//                                     <Button
//                                       variant="outline-primary"
//                                       size="sm"
//                                       onClick={() => openEditModal(item)}
//                                       title="Edit Daily Menu Item"
//                                     >
//                                       <AiOutlineEdit />
//                                     </Button>
//                                     <Button
//                                       variant="outline-warning"
//                                       size="sm"
//                                       onClick={() => markProductSoldOut(item)}
//                                       title="Mark as Sold Out"
//                                     >
//                                       Sold Out
//                                     </Button>
//                                     <Button
//                                       variant="outline-danger"
//                                       size="sm"
//                                       onClick={() => openDeleteModal(item)}
//                                       title="Remove from Daily Menu"
//                                     >
//                                       <AiFillDelete />
//                                     </Button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                         </tbody>
//                       </Table>
//                     </div>

//                     {/* Pagination */}
//                     <div className="d-flex justify-content-between align-items-center">
//                       <p className="mb-0">
//                         Total: {filteredMenuItems.length} products
//                       </p>
//                       <ReactPaginate
//                         previousLabel={"Back"}
//                         nextLabel={"Next"}
//                         pageCount={pageCount}
//                         onPageChange={changePage}
//                         containerClassName={"paginationBttns mb-0"}
//                         previousLinkClassName={"previousBttn"}
//                         nextLinkClassName={"nextBttn"}
//                         disabledClassName={"paginationDisabled"}
//                         activeClassName={"paginationActive"}
//                       />
//                     </div>
//                   </>
//                 )}

//                 {/* --- TAB 2: PRICE MANAGEMENT --- */}
//                 {activeTab === "pricing" && (
//                   <>
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <h5 className="mb-0">
//                         Price Management for {selectedHub.hubName}
//                       </h5>
//                       {/* <div className="col-md-3">
//         <InputGroup>
//           <InputGroup.Text><BsSearch /></InputGroup.Text>
//           <Form.Control
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </InputGroup>
//       </div> */}
//                     </div>

//                     <div className="row">
//                       {/* --- Price Overview (Left Side) --- */}
//                       <div className="col-md-7">
//                         <Card>
//                           <Card.Header>
//                             <h6>
//                               Price Overview (for {selectedDate} -{" "}
//                               {selectedSession})
//                             </h6>
//                           </Card.Header>
//                           <Card.Body
//                             style={{ maxHeight: "600px", overflowY: "auto" }}
//                           >
//                             {/* We map `filteredMenuItems` here */}
//                             {filteredMenuItems.length > 0 ? (
//                               filteredMenuItems.map((item) => (
//                                 <div
//                                   key={item._id}
//                                   className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
//                                 >
//                                   <span>
//                                     <img
//                                       src={
//                                         item.productId?.Foodgallery?.[0]
//                                           ?.image2 ||
//                                         "https://via.placeholder.com/50"
//                                       }
//                                       alt={item.productId?.foodname}
//                                       style={{
//                                         width: "40px",
//                                         height: "40px",
//                                         objectFit: "cover",
//                                         marginRight: "10px",
//                                       }}
//                                       className="rounded"
//                                     />
//                                     {item.productId?.foodname}
//                                   </span>
//                                   <div className="d-flex align-items-center gap-3">
//                                     <span className="text-muted">
//                                       Base: ₹{item.basePrice}
//                                     </span>
//                                     <div className="d-flex align-items-center gap-2">
//                                       <strong>Hub Price:</strong>
//                                       <span className="text-muted">₹</span>
//                                       <input
//                                         type="number"
//                                         className="form-control form-control-sm"
//                                         defaultValue={item.hubPrice}
//                                         onBlur={(e) => {
//                                           // This is an inline edit
//                                           // We call the *single item* update endpoint
//                                           const newPrice = Number(
//                                             e.target.value,
//                                           );
//                                           if (newPrice !== item.hubPrice) {
//                                             axios
//                                               .put(
//                                                 `${API_URL}/update/${item._id}`,
//                                                 { hubPrice: newPrice },
//                                                 {
//                                                   headers: {
//                                                     Authorization: `Bearer ${token}`,
//                                                   },
//                                                 },
//                                               )
//                                               .then(() => {
//                                                 // Optimistically update state
//                                                 setMenuItems((prev) =>
//                                                   prev.map((mi) =>
//                                                     mi._id === item._id
//                                                       ? {
//                                                           ...mi,
//                                                           hubPrice: newPrice,
//                                                         }
//                                                       : mi,
//                                                   ),
//                                                 );
//                                               })
//                                               .catch((err) => {
//                                                 console.error(err);
//                                                 alert(
//                                                   "Failed to update price.",
//                                                 );
//                                                 e.target.value = item.hubPrice; // Revert on fail
//                                               });
//                                           }
//                                         }}
//                                         style={{ width: "80px" }}
//                                       />
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))
//                             ) : (
//                               <p>No menu items found for this filter.</p>
//                             )}
//                           </Card.Body>
//                         </Card>
//                       </div>

//                       {/* --- Bulk Price Actions (Right Side) --- */}
//                       <div className="col-md-5">
//                         <Card>
//                           <Card.Header>
//                             <h6>Bulk Price Actions</h6>
//                           </Card.Header>
//                           <Card.Body>
//                             <div className="d-grid gap-2">
//                               <Button
//                                 variant="outline-success"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(10, "increase")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Increase All Prices by 10%"
//                                 )}
//                               </Button>
//                               <Button
//                                 variant="outline-warning"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(5, "increase")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Increase All Prices by 5%"
//                                 )}
//                               </Button>
//                               <Button
//                                 variant="outline-danger"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(5, "decrease")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Decrease All Prices by 5%"
//                                 )}
//                               </Button>
//                               <Button
//                                 variant="outline-dark"
//                                 onClick={() =>
//                                   handleBulkPriceUpdate(10, "decrease")
//                                 }
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <Spinner size="sm" />
//                                 ) : (
//                                   "Decrease All Prices by 10%"
//                                 )}
//                               </Button>
//                             </div>
//                           </Card.Body>
//                         </Card>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </>
//             )}
//           </Card.Body>
//         </Card>
//       )}

//       {/* --- MODALS --- */}

//       {/* Change Date Modal */}
//       <Modal show={showChangeDate} onHide={() => setShowChangeDate(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             <BsCalendarDate /> Change Menu Date
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Alert variant="info">
//             <Alert.Heading>Move menu items to a different date</Alert.Heading>
//             <p>
//               You are about to change the date for menu items from{" "}
//               <strong>{selectedDate}</strong> to a new date using the
//               <strong> /update-single-menu-date </strong> endpoint.
//             </p>
//           </Alert>

//           <Form.Group className="mb-3">
//             <Form.Label>
//               <strong>Select New Date</strong>
//             </Form.Label>
//             <Form.Control
//               type="date"
//               value={changeDateData.newDate}
//               onChange={(e) =>
//                 setChangeDateData({
//                   ...changeDateData,
//                   newDate: e.target.value,
//                 })
//               }
//               min={new Date().toISOString().split("T")[0]}
//             />
//             <Form.Text className="text-muted">
//               Choose the date to move the selected menu items to.
//             </Form.Text>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>
//               <strong>Items to Update</strong>
//             </Form.Label>
//             <Form.Select
//               value={changeDateData.selectedItems}
//               onChange={(e) =>
//                 setChangeDateData({
//                   ...changeDateData,
//                   selectedItems: e.target.value,
//                 })
//               }
//             >
//               <option value="all">All Items ({menuItems.length})</option>
//               <option value="filtered">
//                 Filtered Items ({filteredMenuItems.length})
//               </option>
//             </Form.Select>
//             <Form.Text className="text-muted">
//               {changeDateData.selectedItems === "filtered"
//                 ? `Only items matching current search/filter (${filteredMenuItems.length} items)`
//                 : `All menu items for this hub, date, and session (${menuItems.length} items)`}
//             </Form.Text>
//           </Form.Group>

//           <div className="mt-3">
//             <h6>Summary:</h6>
//             <ul className="list-unstyled">
//               <li>
//                 <strong>Hub:</strong> {selectedHub?.hubName}
//               </li>
//               <li>
//                 <strong>Current Date:</strong> {selectedDate}
//               </li>
//               <li>
//                 <strong>New Date:</strong>{" "}
//                 {changeDateData.newDate || "(not selected)"}
//               </li>
//               <li>
//                 <strong>Session:</strong> {selectedSession}
//               </li>
//               <li>
//                 <strong>Items to Update:</strong>{" "}
//                 {changeDateData.selectedItems === "all"
//                   ? menuItems.length
//                   : filteredMenuItems.length}
//               </li>
//             </ul>
//           </div>

//           <Alert variant="warning" className="mt-2">
//             <small>
//               <strong>Note:</strong> If items already exist on the new date with
//               the same product, hub, and session, the update will fail for those
//               items.
//             </small>
//           </Alert>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowChangeDate(false)}>
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             onClick={changeMenuDate}
//             disabled={
//               isLoading || !changeDateData.newDate || filteredMenuItems.length === 0
//             }
//           >
//             {isLoading ? (
//               <>
//                 <Spinner
//                   as="span"
//                   animation="border"
//                   size="sm"
//                   role="status"
//                   aria-hidden="true"
//                   className="me-2"
//                 />
//                 Updating...
//               </>
//             ) : (
//               <>
//                 <BsCalendarDate className="me-2" />
//                 Change Date ({changeDateData.selectedItems === "all"
//                   ? menuItems.length
//                   : filteredMenuItems.length} items)
//               </>
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Bulk Price Update Modal */}
//       <Modal show={showBulkPrice} onHide={() => setShowBulkPrice(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Bulk Price Update</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="text-center mb-4">
//             <h6>
//               Update default prices for all products in {selectedHub?.hubName}
//             </h6>
//             <p className="text-muted">
//               This will modify the 'locationPrice' for all products in this hub.
//             </p>
//           </div>
//           <div className="d-grid gap-3">
//             <Card className="border-success">
//               <Card.Body className="text-center">
//                 <h6 className="text-success mb-3">Increase Prices</h6>
//                 <div className="d-grid gap-2">
//                   <Button
//                     variant="outline-success"
//                     onClick={() => handleBulkPriceUpdate(5, "increase")}
//                     disabled={isLoading}
//                   >
//                     Increase by 5%
//                   </Button>
//                   <Button
//                     variant="outline-success"
//                     onClick={() => handleBulkPriceUpdate(10, "increase")}
//                     disabled={isLoading}
//                   >
//                     Increase by 10%
//                   </Button>
//                 </div>
//               </Card.Body>
//             </Card>
//             <Card className="border-danger">
//               <Card.Body className="text-center">
//                 <h6 className="text-danger mb-3">Decrease Prices</h6>
//                 <div className="d-grid gap-2">
//                   <Button
//                     variant="outline-danger"
//                     onClick={() => handleBulkPriceUpdate(5, "decrease")}
//                     disabled={isLoading}
//                   >
//                     Decrease by 5%
//                   </Button>
//                   <Button
//                     variant="outline-danger"
//                     onClick={() => handleBulkPriceUpdate(10, "decrease")}
//                     disabled={isLoading}
//                   >
//                     Decrease by 10%
//                   </Button>
//                 </div>
//               </Card.Body>
//             </Card>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowBulkPrice(false)}>
//             Cancel
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Delete All Hubwise Modal */}
//       <Modal show={showDeleteAll} onHide={() => setShowDeleteAll(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             <BsTrash /> Delete All Menu Items
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Alert variant="danger">
//             <Alert.Heading>
//               Warning: This action cannot be undone!
//             </Alert.Heading>
//             <p>
//               You are about to delete ALL menu items for the following
//               selection:
//             </p>
//             <ul>
//               <li>
//                 <strong>Hub:</strong> {selectedHub?.hubName}
//               </li>
//               <li>
//                 <strong>Date:</strong> {selectedDate}
//               </li>
//               <li>
//                 <strong>Session:</strong> {selectedSession}
//               </li>
//               <li>
//                 <strong>Total Items to Delete:</strong>{" "}
//                 {filteredMenuItems.length}
//               </li>
//             </ul>
//             <hr />
//             <p className="mb-0">
//               <strong>
//                 This will permanently remove all menu items matching these
//                 filters.
//               </strong>
//               <br />
//               All associated data including prices, stock quantities, and
//               priorities will be lost.
//             </p>
//           </Alert>

//           <div className="mt-3">
//             <Form.Check
//               type="checkbox"
//               id="confirm-delete-all"
//               label="I understand this action is irreversible and I take full responsibility"
//               required
//               onChange={(e) => {
//                 // You can add additional confirmation logic here
//               }}
//             />
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDeleteAll(false)}>
//             Cancel
//           </Button>
//           <Button
//             variant="danger"
//             onClick={deleteAllHubwise}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Spinner
//                   as="span"
//                   animation="border"
//                   size="sm"
//                   role="status"
//                   aria-hidden="true"
//                   className="me-2"
//                 />
//                 Deleting...
//               </>
//             ) : (
//               <>
//                 <BsTrash className="me-2" />
//                 Delete All ({filteredMenuItems.length} items)
//               </>
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Delete Product Modal (For Daily Menu) */}
//       <Modal
//         show={showDeleteProduct}
//         onHide={() => setShowDeleteProduct(false)}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Delete</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>
//             Are you sure you want to remove "
//             {selectedProductForDelete?.productId?.foodname}" from this hub's
//             menu for this date/session?
//           </p>
//           <p className="text-danger">This action cannot be undone.</p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowDeleteProduct(false)}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="danger"
//             onClick={deleteHubMenuItem}
//             disabled={isLoading}
//           >
//             {isLoading ? <Spinner size="sm" /> : "Delete"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Edit Hub Product Modal (For Daily Menu) */}
//       <Modal
//         show={showEditHubProduct}
//         onHide={() => setShowEditHubProduct(false)}
//         size="lg"
//         style={{ zIndex: 99999 }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             Edit Daily Menu Item in {selectedHub?.hubName}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {editHubProductForm.product && (
//             <>
//               <div className="mb-3">
//                 <Card>
//                   <Card.Body className="p-3">
//                     <div className="d-flex align-items-center gap-3">
//                       <img
//                         src={
//                           editHubProductForm.product.Foodgallery?.[0]?.image2 ||
//                           "https://via.placeholder.com/60"
//                         }
//                         alt={editHubProductForm.product.foodname}
//                         style={{
//                           width: "60px",
//                           height: "60px",
//                           objectFit: "cover",
//                         }}
//                         className="rounded"
//                       />
//                       <div>
//                         <h6 className="mb-1">
//                           {editHubProductForm.product.foodname}
//                         </h6>
//                         <small className="text-muted">
//                           {editHubProductForm.product.foodcategory} • Base
//                           Price: ₹
//                           {editHubProductForm.product.basePrice ||
//                             editHubProductForm.product.foodprice}
//                         </small>
//                       </div>
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </div>

//               <div className="row">
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Hub Price (₹)</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.hubPrice}
//                       onChange={(e) =>
//                         setEditHubProductForm({
//                           ...editHubProductForm,
//                           hubPrice: e.target.value,
//                         })
//                       }
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Pre Order Price (₹)</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.preOrderPrice}
//                       onChange={(e) =>
//                         setEditHubProductForm({
//                           ...editHubProductForm,
//                           preOrderPrice: e.target.value,
//                         })
//                       }
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Total Stock</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.totalQuantity}
//                       disabled
//                       readOnly
//                       className="bg-light"
//                       // onChange={(e) =>
//                       //   setEditHubProductForm({
//                       //     ...editHubProductForm,
//                       //     totalQuantity: e.target.value,
//                       //   })
//                       // }
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Remaining Stock</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.remainingQuantity}
//                       onChange={onRemainingQuantityChange}
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-md-6">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Menu Priority</Form.Label>
//                     <Form.Control
//                       type="number"
//                       value={editHubProductForm.hubPriority}
//                       onChange={(e) =>
//                         setEditHubProductForm({
//                           ...editHubProductForm,
//                           hubPriority: e.target.value,
//                         })
//                       }
//                     />
//                   </Form.Group>
//                 </div>
//               </div>

//               <div className="alert alert-info">
//                 <small>
//                   <strong>Note:</strong> Changes will apply to this menu item
//                   for {selectedDate} ({selectedSession}) in{" "}
//                   {selectedHub?.hubName}.
//                 </small>
//               </div>
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowEditHubProduct(false)}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             onClick={updateHubMenuItem}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Spinner animation="border" size="sm" className="me-2" />
//                 Updating...
//               </>
//             ) : (
//               "Update Menu Item"
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default HubWiseProductManagement;

import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Modal,
  Table,
  Form,
  Spinner,
  Card,
  Tabs,
  Tab,
  InputGroup,
  Alert,
} from "react-bootstrap";
import { AiFillDelete, AiOutlineEdit } from "react-icons/ai";
import { BsSearch, BsPlus, BsTrash, BsCalendarDate } from "react-icons/bs";
import { MdLocationOn, MdPriceChange } from "react-icons/md";
import axios from "axios";
import ReactPaginate from "react-paginate";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";

// API URL for HubMenu (Daily Menu)
const API_URL = "https://dd-backend-3nm0.onrender.com/api/admin/hub-menu";
// API URL for Admin actions (Products, Hubs)
const ADMIN_API_URL = "https://dd-backend-3nm0.onrender.com/api/admin";
const HUB_API_URL = "https://dd-backend-3nm0.onrender.com/api/Hub";

const HubWiseProductManagement = () => {
  // Helper function to format date consistently for display
  const formatDateForDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to format date for API requests (UTC midnight)
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    // Create date at UTC midnight
    return new Date(dateString + "T00:00:00.000Z").toISOString();
  };

  // --- STATE ---
  // Hub State
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState(null);
  const token = localStorage.getItem("authToken");

  // Filter State
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedSession, setSelectedSession] = useState("Lunch");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  // Data State
  const [menuItems, setMenuItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Modal States
  const [showEditHubProduct, setShowEditHubProduct] = useState(false);
  const [showDeleteProduct, setShowDeleteProduct] = useState(false);
  const [showBulkPrice, setShowBulkPrice] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [showChangeDate, setShowChangeDate] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  // Form States
  const [editHubProductForm, setEditHubProductForm] = useState({
    _id: null,
    productId: null,
    foodname: "",
    hubPrice: 0,
    basePrice: 0,
    totalQuantity: 0,
    remainingQuantity: 0,
    hubPriority: 0,
    product: null,
    preOrderPrice: 0,
  });

  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState(null);

  // Change Date State
  const [changeDateData, setChangeDateData] = useState({
    newDate: "",
    selectedItems: "all",
  });

  // --- DERIVED STATE ---
  const filteredMenuItems = useMemo(() => {
    let filteredData = [...menuItems];
    if (searchTerm && activeTab === "products") {
      filteredData = filteredData.filter(
        (item) =>
          item.productId?.foodname
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.productId?.foodcategory
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }
    if (filterType && activeTab === "products") {
      switch (filterType) {
        case "out_of_stock":
          filteredData = filteredData.filter(
            (item) => item.remainingQuantity === 0,
          );
          break;
        case "low_stock":
          filteredData = filteredData.filter(
            (item) => item.remainingQuantity < 10 && item.remainingQuantity > 0,
          );
          break;
        default:
          break;
      }
    }
    return filteredData;
  }, [menuItems, searchTerm, filterType, activeTab]);

  // Pagination
  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 20;
  const pagesVisited = pageNumber * usersPerPage;
  const changePage = ({ selected }) => setPageNumber(selected);
  const pageCount = Math.ceil(filteredMenuItems.length / usersPerPage);

  // --- API FUNCTIONS ---
  const getHubs = async () => {
    try {
      const res = await axios.get(`${HUB_API_URL}/hubs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHubs(res.data);
      if (res.data.length > 0) {
        setSelectedHub(res.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch hubs:", error);
    }
  };

  // FIXED: Fetch Daily Menu with proper date range
  const fetchHubMenu = async () => {
    if (!selectedHub || !selectedDate || !selectedSession) {
      setMenuItems([]);
      return;
    }
    setIsDataLoading(true);
    try {
      const res = await axios.get(`${API_URL}/get-menu`, {
        params: {
          hubId: selectedHub._id,
          menuDate: selectedDate, // Send as YYYY-MM-DD string
          session: selectedSession,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(res.data.menu || []);
    } catch (error) {
      console.error("Error fetching hub menu:", error);
      setMenuItems([]);
    } finally {
      setIsDataLoading(false);
    }
  };

  // --- ACTION FUNCTIONS ---
  const updateHubMenuItem = async () => {
    if (!editHubProductForm._id) return;
    try {
      setIsLoading(true);
      const updateData = {
        hubPrice: Number(editHubProductForm.hubPrice),
        preOrderPrice: Number(editHubProductForm.preOrderPrice),
        basePrice: Number(editHubProductForm.basePrice),
        totalQuantity: Number(editHubProductForm.totalQuantity),
        remainingQuantity: Number(editHubProductForm.remainingQuantity),
        hubPriority: Number(editHubProductForm.hubPriority),
      };
      const res = await axios.put(
        `${API_URL}/update/${editHubProductForm._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.status === 200) {
        alert("Menu item updated successfully!");
        setShowEditHubProduct(false);
        await fetchHubMenu();
      }
    } catch (error) {
      console.error("Failed to update menu item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHubMenuItem = async () => {
    if (!selectedProductForDelete) return;
    try {
      setIsLoading(true);
      const res = await axios.delete(
        `${API_URL}/delete/${selectedProductForDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.status === 200) {
        alert("Menu item removed successfully!");
        setShowDeleteProduct(false);
        setSelectedProductForDelete(null);
        await fetchHubMenu();
      }
    } catch (error) {
      console.error("Failed to delete menu item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllHubwise = async () => {
    if (!selectedHub || !selectedDate || !selectedSession) {
      alert("Please select hub, date, and session first!");
      return;
    }

    const confirmMsg = `Are you absolutely sure you want to delete ALL menu items for:\n\nHub: ${selectedHub.hubName}\nDate: ${selectedDate}\nSession: ${selectedSession}\n\nThis action will permanently delete ${filteredMenuItems.length} items and cannot be undone!`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.delete(`${API_URL}/delete-all-hubwise`, {
        data: {
          hubId: selectedHub._id,
          menuDate: selectedDate,
          session: selectedSession,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        alert(`Successfully deleted ${res.data.deletedCount || 0} menu items!`);
        setShowDeleteAll(false);
        await fetchHubMenu();
      }
    } catch (error) {
      console.error("Failed to delete all hubwise items:", error);
      alert(
        error.response?.data?.error ||
          "Failed to delete items. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Change Date for Menu Items
  const changeMenuDate = async () => {
    if (!selectedHub || !selectedDate || !selectedSession) {
      alert("Please select hub, date, and session first!");
      return;
    }

    if (!changeDateData.newDate) {
      alert("Please select a new date!");
      return;
    }

    if (changeDateData.newDate === selectedDate) {
      alert(
        "New date is the same as current date. Please select a different date.",
      );
      return;
    }

    const itemsToUpdate =
      changeDateData.selectedItems === "all" ? menuItems : filteredMenuItems;

    if (itemsToUpdate.length === 0) {
      alert("No items to update!");
      return;
    }

    const confirmMsg = `Are you sure you want to change the date for ${itemsToUpdate.length} menu item(s) from ${selectedDate} to ${changeDateData.newDate}?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      const failedItems = [];

      for (const item of itemsToUpdate) {
        try {
          const res = await axios.put(
            `${API_URL}/update-single-menu-date/${item._id}`,
            { newDate: changeDateData.newDate },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (res.data && res.data.success === true) {
            successCount++;
          } else {
            errorCount++;
            failedItems.push({
              name: item.productId?.foodname || "Unknown",
              id: item._id,
              error: res.data?.message || "Unknown error",
            });
          }
        } catch (error) {
          console.error(`Failed to update item ${item._id}:`, error);
          errorCount++;
          failedItems.push({
            name: item.productId?.foodname || "Unknown",
            id: item._id,
            error: error.response?.data?.message || error.message,
          });
        }
      }

      if (successCount > 0) {
        let message = `Successfully updated date for ${successCount} item(s).`;
        if (errorCount > 0) {
          message += ` Failed to update ${errorCount} item(s).`;
          console.log("Failed items:", failedItems);
        }
        alert(message);

        // Update the selected date to the new date
        setSelectedDate(changeDateData.newDate);

        // Close the modal
        setShowChangeDate(false);

        // Reset change date form
        setChangeDateData({ newDate: "", selectedItems: "all" });

        // Manually fetch the menu for the new date
        await fetchHubMenu();
      } else {
        alert("Failed to update any items. Please try again.");
      }
    } catch (error) {
      console.error("Failed to change menu date:", error);
      alert(
        error.response?.data?.message ||
          "Failed to change date. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (item) => {
    setMenuItems((prevItems) =>
      prevItems.map((menuItem) =>
        menuItem._id === item._id
          ? { ...menuItem, isActive: !item.isActive }
          : menuItem,
      ),
    );
    try {
      await axios.put(
        `${API_URL}/update/${item._id}`,
        { isActive: !item.isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      alert("Failed to update status.");
      await fetchHubMenu();
    }
  };

  const exportToExcel = () => {
    if (filteredMenuItems.length === 0) {
      alert("No data to export. Please check your filters.");
      return;
    }

    const exportData = filteredMenuItems.map((item, index) => ({
      "Sl. No": index + 1,
      "Product Name": item.productId?.foodname,
      Category: item.productId?.foodcategory,
      "Base Price (₹)": item.basePrice,
      "Hub Price (₹)": item.hubPrice,
      "Pre-order Price (₹)": item.preOrderPrice,
      "Total Stock": item.totalQuantity,
      "Remaining Stock": item.remainingQuantity,
      Priority: item.hubPriority,
      Status: item.isActive ? "Active" : "Closed",
      "Menu Date": formatDateForDisplay(item.menuDate),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Menu");
    const filename = `HubMenu_${
      selectedHub?.hubName || "Hub"
    }_${selectedDate}_${selectedSession}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const markProductSoldOut = async (item) => {
    setMenuItems((prevItems) =>
      prevItems.map((menuItem) =>
        menuItem._id === item._id
          ? { ...menuItem, remainingQuantity: 0 }
          : menuItem,
      ),
    );
    try {
      await axios.put(
        `${API_URL}/update/${item._id}`,
        { remainingQuantity: 0 },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      alert("Failed to mark as sold out.");
      await fetchHubMenu();
    }
  };

  const markAllProductsSoldOut = async () => {
    if (!selectedHub) return;
    const confirm = window.confirm(
      `Are you sure you want to mark ALL items as sold out for this filter?`,
    );
    if (!confirm) return;
    setIsDataLoading(true);
    try {
      await axios.post(
        `${API_URL}/bulk-sold-out`,
        {
          hubId: selectedHub._id,
          menuDate: selectedDate,
          session: selectedSession,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchHubMenu();
    } catch (error) {
      alert("Failed to mark all as sold out.");
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleBulkPriceUpdate = async (percentage, operation) => {
    if (!selectedHub || !selectedDate || !selectedSession) {
      alert("Please select a hub, date, and session first.");
      return;
    }

    const confirmMsg = `Are you sure you want to ${operation} all prices by ${percentage}% for this menu?`;
    if (!window.confirm(confirmMsg)) return;

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/bulk-price-update`,
        {
          hubId: selectedHub._id,
          menuDate: selectedDate,
          session: selectedSession,
          percentage: percentage,
          operation: operation,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        alert(res.data.message);
        await fetchHubMenu();
      }
    } catch (error) {
      console.error("Failed to bulk update prices:", error);
      alert(error?.response?.data?.message || "Bulk update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- MODAL HANDLERS ---
  const openEditModal = (menuItem) => {
    setEditHubProductForm({
      _id: menuItem._id,
      productId: menuItem.productId._id,
      foodname: menuItem.productId.foodname,
      hubPrice: menuItem.hubPrice,
      basePrice: menuItem.basePrice,
      preOrderPrice: menuItem.preOrderPrice,
      totalQuantity: menuItem.totalQuantity,
      remainingQuantity: menuItem.remainingQuantity,
      hubPriority: menuItem.hubPriority,
      product: menuItem.productId,
    });
    setShowEditHubProduct(true);
  };

  const openDeleteModal = (menuItem) => {
    setSelectedProductForDelete(menuItem);
    setShowDeleteProduct(true);
  };

  const openChangeDateModal = () => {
    setChangeDateData({
      newDate: "",
      selectedItems: "all",
    });
    setShowChangeDate(true);
  };

  // --- EFFECTS ---
  useEffect(() => {
    getHubs();
  }, [token]);

  useEffect(() => {
    if (activeTab === "products") {
      fetchHubMenu();
    }
  }, [selectedHub, selectedDate, selectedSession, activeTab]);

  useEffect(() => {
    setPageNumber(0);
  }, [filteredMenuItems, activeTab]);

  const onRemainingQuantityChange = (e) => {
    const newRemaining = Number(e.target.value);
    const oldRemaining = Number(editHubProductForm.remainingQuantity);
    const oldTotal = Number(editHubProductForm.totalQuantity);
    const diff = newRemaining - oldRemaining;
    setEditHubProductForm({
      ...editHubProductForm,
      remainingQuantity: newRemaining,
      totalQuantity: oldTotal + diff,
    });
  };

  // --- RENDER ---
  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="header-c">Hub Menu Management</h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-success"
            onClick={() => setShowBulkPrice(true)}
          >
            <MdPriceChange /> Bulk Price Update
          </Button>
        </div>
      </div>

      {/* Hub Selection */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
            <strong>Select Hub:</strong>
            {hubs.map((hub) => (
              <Button
                key={hub._id}
                variant={
                  selectedHub?._id === hub._id
                    ? "outline-danger"
                    : "outline-success"
                }
                onClick={() => setSelectedHub(hub)}
                className="d-flex align-items-center gap-2"
              >
                <MdLocationOn />
                {hub.hubId}
                <small className="text-muted">({hub.hubName})</small>
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Debug Info - Remove in production */}
      {activeTab === "products" && menuItems.length > 0 && (
        <Alert variant="info" className="mb-3">
          <small>
            <strong>Debug:</strong> Selected Date: {selectedDate} | First item
            stored date: {menuItems[0]?.menuDate} | Display date:{" "}
            {formatDateForDisplay(menuItems[0]?.menuDate)}
          </small>
        </Alert>
      )}

      {selectedHub && (
        <Card>
          <Card.Header>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0"
            >
              <Tab eventKey="products" title="Daily Menu"></Tab>
              <Tab eventKey="pricing" title="Default Price Management"></Tab>
            </Tabs>
          </Card.Header>

          <Card.Body>
            {isDataLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading...</p>
              </div>
            ) : (
              <>
                {/* --- TAB 1: DAILY MENU --- */}
                {activeTab === "products" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">
                        Daily Menu for <b>{selectedHub.hubName}</b> -{" "}
                        {formatDateForDisplay(selectedDate)}
                      </h5>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={exportToExcel}
                        >
                          Export Excel
                        </Button>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="row mb-3">
                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label>Select Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label>Select Session</Form.Label>
                          <Form.Select
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                          >
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Breakfast">Breakfast</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-3">
                        <Form.Label>Search</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <BsSearch />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </InputGroup>
                      </div>
                      <div className="col-md-3">
                        <Form.Label>Filter By</Form.Label>
                        <Form.Select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="">All Products</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="low_stock">Low Stock</option>
                        </Form.Select>
                      </div>
                    </div>

                    <div className="mb-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={markAllProductsSoldOut}
                          disabled={isDataLoading || isLoading}
                        >
                          Mark All Filtered as Sold Out
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setShowDeleteAll(true)}
                          disabled={filteredMenuItems.length === 0}
                        >
                          <BsTrash /> Delete All Menu Items
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={openChangeDateModal}
                          disabled={filteredMenuItems.length === 0}
                        >
                          <BsCalendarDate /> Change Date
                        </Button>
                      </div>
                      <Link to="/admin/menu-upload" className="ms-2">
                        <Button variant="success">
                          <FaExternalLinkAlt
                            style={{
                              paddingRight: "5px",
                            }}
                          />{" "}
                          Add Product
                        </Button>
                      </Link>
                    </div>

                    {/* Products Table */}
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead className="table-dark">
                          <tr>
                            <th>Sl. No</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Base (₹)</th>
                            <th>Hub (₹)</th>
                            <th>PreOrder (₹)</th>
                            <th>Total</th>
                            <th>Rem.</th>
                            <th>Status</th>
                            <th>Prio.</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMenuItems
                            .slice(pagesVisited, pagesVisited + usersPerPage)
                            .map((item, index) => (
                              <tr key={item._id}>
                                <td>{index + 1 + pagesVisited}</td>
                                <td>
                                  <img
                                    src={
                                      item.productId?.Foodgallery?.[0]
                                        ?.image2 ||
                                      "https://via.placeholder.com/50"
                                    }
                                    alt={item.productId?.foodname}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                    }}
                                    className="rounded"
                                  />
                                </td>
                                <td>{item.productId?.foodname || "N/A"}</td>
                                <td>{item.productId?.foodcategory || "N/A"}</td>
                                <td>{item.basePrice}</td>
                                <td>{item.hubPrice}</td>
                                <td>{item.preOrderPrice}</td>
                                <td>{item.totalQuantity}</td>
                                <td>
                                  <span
                                    className={`badge ${
                                      item.remainingQuantity === 0
                                        ? "bg-danger"
                                        : item.remainingQuantity < 10
                                          ? "bg-warning"
                                          : "bg-success"
                                    }`}
                                  >
                                    {item.remainingQuantity}
                                  </span>
                                </td>
                                <td>
                                  <Form.Check
                                    type="switch"
                                    id={`active-switch-${item._id}`}
                                    label={item.isActive ? "Active" : "Closed"}
                                    checked={item.isActive}
                                    onChange={() => handleToggleActive(item)}
                                  />
                                </td>
                                <td>{item.hubPriority}</td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => openEditModal(item)}
                                      title="Edit Daily Menu Item"
                                    >
                                      <AiOutlineEdit />
                                    </Button>
                                    <Button
                                      variant="outline-warning"
                                      size="sm"
                                      onClick={() => markProductSoldOut(item)}
                                      title="Mark as Sold Out"
                                    >
                                      Sold Out
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => openDeleteModal(item)}
                                      title="Remove from Daily Menu"
                                    >
                                      <AiFillDelete />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="mb-0">
                        Total: {filteredMenuItems.length} products
                      </p>
                      <ReactPaginate
                        previousLabel={"Back"}
                        nextLabel={"Next"}
                        pageCount={pageCount}
                        onPageChange={changePage}
                        containerClassName={"paginationBttns mb-0"}
                        previousLinkClassName={"previousBttn"}
                        nextLinkClassName={"nextBttn"}
                        disabledClassName={"paginationDisabled"}
                        activeClassName={"paginationActive"}
                      />
                    </div>
                  </>
                )}

                {/* --- TAB 2: PRICE MANAGEMENT --- */}
                {activeTab === "pricing" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">
                        Price Management for {selectedHub.hubName} -{" "}
                        {formatDateForDisplay(selectedDate)}
                      </h5>
                    </div>

                    <div className="row">
                      {/* Price Overview (Left Side) */}
                      <div className="col-md-7">
                        <Card>
                          <Card.Header>
                            <h6>
                              Price Overview (for{" "}
                              {formatDateForDisplay(selectedDate)} -{" "}
                              {selectedSession})
                            </h6>
                          </Card.Header>
                          <Card.Body
                            style={{ maxHeight: "600px", overflowY: "auto" }}
                          >
                            {filteredMenuItems.length > 0 ? (
                              filteredMenuItems.map((item) => (
                                <div
                                  key={item._id}
                                  className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                                >
                                  <span>
                                    <img
                                      src={
                                        item.productId?.Foodgallery?.[0]
                                          ?.image2 ||
                                        "https://via.placeholder.com/50"
                                      }
                                      alt={item.productId?.foodname}
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        objectFit: "cover",
                                        marginRight: "10px",
                                      }}
                                      className="rounded"
                                    />
                                    {item.productId?.foodname}
                                  </span>
                                  <div className="d-flex align-items-center gap-3">
                                    <span className="text-muted">
                                      Base: ₹{item.basePrice}
                                    </span>
                                    <div className="d-flex align-items-center gap-2">
                                      <strong>Hub Price:</strong>
                                      <span className="text-muted">₹</span>
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        defaultValue={item.hubPrice}
                                        onBlur={(e) => {
                                          const newPrice = Number(
                                            e.target.value,
                                          );
                                          if (newPrice !== item.hubPrice) {
                                            axios
                                              .put(
                                                `${API_URL}/update/${item._id}`,
                                                { hubPrice: newPrice },
                                                {
                                                  headers: {
                                                    Authorization: `Bearer ${token}`,
                                                  },
                                                },
                                              )
                                              .then(() => {
                                                setMenuItems((prev) =>
                                                  prev.map((mi) =>
                                                    mi._id === item._id
                                                      ? {
                                                          ...mi,
                                                          hubPrice: newPrice,
                                                        }
                                                      : mi,
                                                  ),
                                                );
                                              })
                                              .catch((err) => {
                                                console.error(err);
                                                alert(
                                                  "Failed to update price.",
                                                );
                                                e.target.value = item.hubPrice;
                                              });
                                          }
                                        }}
                                        style={{ width: "80px" }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p>No menu items found for this filter.</p>
                            )}
                          </Card.Body>
                        </Card>
                      </div>

                      {/* Bulk Price Actions (Right Side) */}
                      <div className="col-md-5">
                        <Card>
                          <Card.Header>
                            <h6>Bulk Price Actions</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="d-grid gap-2">
                              <Button
                                variant="outline-success"
                                onClick={() =>
                                  handleBulkPriceUpdate(10, "increase")
                                }
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Spinner size="sm" />
                                ) : (
                                  "Increase All Prices by 10%"
                                )}
                              </Button>
                              <Button
                                variant="outline-warning"
                                onClick={() =>
                                  handleBulkPriceUpdate(5, "increase")
                                }
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Spinner size="sm" />
                                ) : (
                                  "Increase All Prices by 5%"
                                )}
                              </Button>
                              <Button
                                variant="outline-danger"
                                onClick={() =>
                                  handleBulkPriceUpdate(5, "decrease")
                                }
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Spinner size="sm" />
                                ) : (
                                  "Decrease All Prices by 5%"
                                )}
                              </Button>
                              <Button
                                variant="outline-dark"
                                onClick={() =>
                                  handleBulkPriceUpdate(10, "decrease")
                                }
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Spinner size="sm" />
                                ) : (
                                  "Decrease All Prices by 10%"
                                )}
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      )}

      {/* --- MODALS --- */}

      {/* Change Date Modal */}
      <Modal show={showChangeDate} onHide={() => setShowChangeDate(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <BsCalendarDate /> Change Menu Date
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <Alert.Heading>Move menu items to a different date</Alert.Heading>
            <p>
              You are about to change the date for menu items from{" "}
              <strong>{selectedDate}</strong> to a new date.
            </p>
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>
              <strong>Select New Date</strong>
            </Form.Label>
            <Form.Control
              type="date"
              value={changeDateData.newDate}
              onChange={(e) =>
                setChangeDateData({
                  ...changeDateData,
                  newDate: e.target.value,
                })
              }
              min={new Date().toISOString().split("T")[0]}
            />
            <Form.Text className="text-muted">
              Choose the date to move the selected menu items to.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <strong>Items to Update</strong>
            </Form.Label>
            <Form.Select
              value={changeDateData.selectedItems}
              onChange={(e) =>
                setChangeDateData({
                  ...changeDateData,
                  selectedItems: e.target.value,
                })
              }
            >
              <option value="all">All Items ({menuItems.length})</option>
              <option value="filtered">
                Filtered Items ({filteredMenuItems.length})
              </option>
            </Form.Select>
            <Form.Text className="text-muted">
              {changeDateData.selectedItems === "filtered"
                ? `Only items matching current search/filter (${filteredMenuItems.length} items)`
                : `All menu items for this hub, date, and session (${menuItems.length} items)`}
            </Form.Text>
          </Form.Group>

          <div className="mt-3">
            <h6>Summary:</h6>
            <ul className="list-unstyled">
              <li>
                <strong>Hub:</strong> {selectedHub?.hubName}
              </li>
              <li>
                <strong>Current Date:</strong> {selectedDate}
              </li>
              <li>
                <strong>New Date:</strong>{" "}
                {changeDateData.newDate || "(not selected)"}
              </li>
              <li>
                <strong>Session:</strong> {selectedSession}
              </li>
              <li>
                <strong>Items to Update:</strong>{" "}
                {changeDateData.selectedItems === "all"
                  ? menuItems.length
                  : filteredMenuItems.length}
              </li>
            </ul>
          </div>

          <Alert variant="warning" className="mt-2">
            <small>
              <strong>Note:</strong> If items already exist on the new date with
              the same product, hub, and session, the update will fail for those
              items.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangeDate(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={changeMenuDate}
            disabled={
              isLoading ||
              !changeDateData.newDate ||
              filteredMenuItems.length === 0
            }
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Updating...
              </>
            ) : (
              <>
                <BsCalendarDate className="me-2" />
                Change Date (
                {changeDateData.selectedItems === "all"
                  ? menuItems.length
                  : filteredMenuItems.length}{" "}
                items)
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Price Update Modal */}
      <Modal show={showBulkPrice} onHide={() => setShowBulkPrice(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Price Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <h6>
              Update default prices for all products in {selectedHub?.hubName}
            </h6>
            <p className="text-muted">
              This will modify the 'locationPrice' for all products in this hub.
            </p>
          </div>
          <div className="d-grid gap-3">
            <Card className="border-success">
              <Card.Body className="text-center">
                <h6 className="text-success mb-3">Increase Prices</h6>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-success"
                    onClick={() => handleBulkPriceUpdate(5, "increase")}
                    disabled={isLoading}
                  >
                    Increase by 5%
                  </Button>
                  <Button
                    variant="outline-success"
                    onClick={() => handleBulkPriceUpdate(10, "increase")}
                    disabled={isLoading}
                  >
                    Increase by 10%
                  </Button>
                </div>
              </Card.Body>
            </Card>
            <Card className="border-danger">
              <Card.Body className="text-center">
                <h6 className="text-danger mb-3">Decrease Prices</h6>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-danger"
                    onClick={() => handleBulkPriceUpdate(5, "decrease")}
                    disabled={isLoading}
                  >
                    Decrease by 5%
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => handleBulkPriceUpdate(10, "decrease")}
                    disabled={isLoading}
                  >
                    Decrease by 10%
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkPrice(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete All Hubwise Modal */}
      <Modal show={showDeleteAll} onHide={() => setShowDeleteAll(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <BsTrash /> Delete All Menu Items
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <Alert.Heading>
              Warning: This action cannot be undone!
            </Alert.Heading>
            <p>
              You are about to delete ALL menu items for the following
              selection:
            </p>
            <ul>
              <li>
                <strong>Hub:</strong> {selectedHub?.hubName}
              </li>
              <li>
                <strong>Date:</strong> {selectedDate}
              </li>
              <li>
                <strong>Session:</strong> {selectedSession}
              </li>
              <li>
                <strong>Total Items to Delete:</strong>{" "}
                {filteredMenuItems.length}
              </li>
            </ul>
            <hr />
            <p className="mb-0">
              <strong>
                This will permanently remove all menu items matching these
                filters.
              </strong>
              <br />
              All associated data including prices, stock quantities, and
              priorities will be lost.
            </p>
          </Alert>

          <div className="mt-3">
            <Form.Check
              type="checkbox"
              id="confirm-delete-all"
              label="I understand this action is irreversible and I take full responsibility"
              required
              onChange={(e) => {}}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAll(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={deleteAllHubwise}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Deleting...
              </>
            ) : (
              <>
                <BsTrash className="me-2" />
                Delete All ({filteredMenuItems.length} items)
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Product Modal */}
      <Modal
        show={showDeleteProduct}
        onHide={() => setShowDeleteProduct(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to remove "
            {selectedProductForDelete?.productId?.foodname}" from this hub's
            menu for this date/session?
          </p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteProduct(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={deleteHubMenuItem}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Hub Product Modal */}
      <Modal
        show={showEditHubProduct}
        onHide={() => setShowEditHubProduct(false)}
        size="lg"
        style={{ zIndex: 99999 }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Daily Menu Item in {selectedHub?.hubName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editHubProductForm.product && (
            <>
              <div className="mb-3">
                <Card>
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={
                          editHubProductForm.product.Foodgallery?.[0]?.image2 ||
                          "https://via.placeholder.com/60"
                        }
                        alt={editHubProductForm.product.foodname}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                        className="rounded"
                      />
                      <div>
                        <h6 className="mb-1">
                          {editHubProductForm.product.foodname}
                        </h6>
                        <small className="text-muted">
                          {editHubProductForm.product.foodcategory} • Base
                          Price: ₹
                          {editHubProductForm.product.basePrice ||
                            editHubProductForm.product.foodprice}
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Hub Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      value={editHubProductForm.hubPrice}
                      onChange={(e) =>
                        setEditHubProductForm({
                          ...editHubProductForm,
                          hubPrice: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Base Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      value={editHubProductForm.basePrice}
                      onChange={(e) =>
                        setEditHubProductForm({
                          ...editHubProductForm,
                          basePrice: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Pre Order Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      value={editHubProductForm.preOrderPrice}
                      onChange={(e) =>
                        setEditHubProductForm({
                          ...editHubProductForm,
                          preOrderPrice: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Total Stock</Form.Label>
                    <Form.Control
                      type="number"
                      value={editHubProductForm.totalQuantity}
                      disabled
                      readOnly
                      className="bg-light"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Remaining Stock</Form.Label>
                    <Form.Control
                      type="number"
                      value={editHubProductForm.remainingQuantity}
                      onChange={onRemainingQuantityChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Menu Priority</Form.Label>
                    <Form.Control
                      type="number"
                      value={editHubProductForm.hubPriority}
                      onChange={(e) =>
                        setEditHubProductForm({
                          ...editHubProductForm,
                          hubPriority: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="alert alert-info">
                <small>
                  <strong>Note:</strong> Changes will apply to this menu item
                  for {formatDateForDisplay(selectedDate)} ({selectedSession})
                  in {selectedHub?.hubName}.
                </small>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditHubProduct(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={updateHubMenuItem}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "Update Menu Item"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HubWiseProductManagement;
