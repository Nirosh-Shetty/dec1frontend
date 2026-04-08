// import React, { useState, useEffect } from "react";
// import { FaTimes, FaPlus, FaSearch } from "react-icons/fa";
// import "../../Styles/MenuUpload.css"; // Your CSS file
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { Box } from "@mui/material";
// import axios from "axios";

// // 2. Define ALL your API URLs
// const SAVE_API_URL = "http://localhost:7013/api/admin/hub-menu"; // This is for SAVING (from our plan)
// const HUBS_API = "http://localhost:7013/api/Hub/hubs"; // This is your live API
// const PRODUCTS_API = "http://localhost:7013/api/admin/getFoodItems"; // This is your live API

// const MenuUpload = () => {
//   const navigate = useNavigate();

//   // View 1: Product Selection
//   const [menuDate, setMenuDate] = useState("");
//   const [session, setSession] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   const [masterProducts, setMasterProducts] = useState([]); // Will hold products from API
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [allHubs, setAllHubs] = useState([]); // Will hold hubs from API
//   const [addedProducts, setAddedProducts] = useState([]);

//   // View 2: Hub Assignment
//   const [view, setView] = useState("selection"); // 'selection' or 'assignment'
//   const [currentProductIndex, setCurrentProductIndex] = useState(0);
//   const [assignments, setAssignments] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [pageLoading, setPageLoading] = useState(true);

//   // 3. Fetch Hubs and Products on component load
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       setPageLoading(true);
//       try {
//         // We'll fetch products and hubs at the same time
//         const [productsRes, hubsRes] = await Promise.all([
//           axios.get(PRODUCTS_API), // Use your live product API
//           axios.get(HUBS_API), // Use your live hub API
//         ]);

//         // Use the response structure you provided: response.data.data
//         if (productsRes.data && productsRes.data.data) {
//           setMasterProducts(productsRes.data.data);
//         } else {
//           toast.error("Could not parse products. Check API.");
//         }

//         // Use the response structure you provided: response.data (which is an array)
//         if (hubsRes.data && Array.isArray(hubsRes.data)) {
//           setAllHubs(hubsRes.data);
//         } else {
//           toast.error("Could not parse hubs. Check API.");
//         }
//       } catch (err) {
//         console.error("Error fetching initial data:", err);
//         toast.error("Failed to load products and hubs. Please refresh.");
//       } finally {
//         setPageLoading(false);
//       }
//     };

//     fetchInitialData();
//   }, []); // Runs once on component mount

//   // 4. Handle product search (FIX: use 'foodname')
//   useEffect(() => {
//     if (searchTerm.trim() === "") {
//       setFilteredProducts([]);
//     } else {
//       setFilteredProducts(
//         masterProducts.filter((p) =>
//           // Use your field 'foodname'
//           p.foodname.toLowerCase().includes(searchTerm.toLowerCase()),
//         ),
//       );
//     }
//   }, [searchTerm, masterProducts]);

//   // === VIEW 1 FUNCTIONS ===

//   const handleAddProduct = (product) => {
//     if (!addedProducts.find((p) => p._id === product._id)) {
//       setAddedProducts([...addedProducts, product]);
//     }
//     setSearchTerm("");
//   };

//   const handleRemoveProduct = (productId) => {
//     setAddedProducts(addedProducts.filter((p) => p._id !== productId));
//     // Also remove from assignments if it's there
//     setAssignments((prev) => {
//       const newAssignments = { ...prev };
//       delete newAssignments[productId];
//       return newAssignments;
//     });
//   };

//   const handleGoToAssignment = () => {
//     if (!menuDate || !session) {
//       return toast.warn("Please select a Date and Session.");
//     }
//     if (addedProducts.length === 0) {
//       return toast.warn("Please add at least one product.");
//     }

//     // Initialize assignments state for all added products
//     const newAssignments = {};
//     for (const product of addedProducts) {
//       newAssignments[product._id] = {};
//       // 5. FIX: Use allHubs from state, not DUMMY_HUBS
//       for (const hub of allHubs) {
//         // Pre-fill with default values
//         newAssignments[product._id][hub._id] = {
//           hubId: hub._id, // Store the hubId
//           // 6. FIX: Use your field 'foodprice' as the basePrice
//           hubPrice: product.foodprice,
//           preOrderPrice: product.foodprice,
//           totalQuantity: 10, // Default quantity
//           hubPriority: 1, // Default priority
//           isActive: true,
//         };
//       }
//     }
//     setAssignments(newAssignments);
//     setCurrentProductIndex(0);
//     setView("assignment"); // Switch to View 2
//   };

//   // === VIEW 2 FUNCTIONS ===

//   // NOTE:
//   // We no longer call API on "Save & Next". We only collect assignments client-side.
//   // The bulk upload will be triggered by "Add all".

//   // Advance to next product (no API call)
//   const handleNextClick = () => {
//     if (currentProductIndex < addedProducts.length - 1) {
//       setCurrentProductIndex((i) => i + 1);
//     }
//   };

//   // Delete local product (no backend delete because nothing has been pushed yet)
//   const handleDeleteItem = () => {
//     const productToDelete = addedProducts[currentProductIndex];
//     if (!productToDelete) return;
//     // Remove from addedProducts
//     const newAdded = addedProducts.filter(
//       (p, idx) => idx !== currentProductIndex,
//     );
//     setAddedProducts(newAdded);
//     // Remove assignments for that product
//     setAssignments((prev) => {
//       const copy = { ...prev };
//       delete copy[productToDelete._id];
//       return copy;
//     });
//     // Adjust index
//     if (newAdded.length === 0) {
//       // go back to selection view
//       setView("selection");
//       setCurrentProductIndex(0);
//     } else if (currentProductIndex >= newAdded.length) {
//       setCurrentProductIndex(newAdded.length - 1);
//     }
//   };

//   // Build bulk payload and send to backend
//   const handleSaveAllClick = async () => {
//     if (!menuDate || !session) {
//       toast.warn("Menu date and session are required.");
//       return;
//     }
//     if (!addedProducts || addedProducts.length === 0) {
//       toast.warn("No products to save.");
//       return;
//     }

//     const items = addedProducts
//       .map((product) => {
//         const hubObj = assignments[product._id] || {};
//         const hubData = Object.values(hubObj).map((h) => ({
//           hubId: h.hubId,
//           hubPrice: Number(h.hubPrice || product.foodprice || 0),
//           preOrderPrice: Number(h.preOrderPrice || product.foodprice || 0),
//           totalQuantity: Number(h.totalQuantity || 0),
//           hubPriority: Number(h.hubPriority || 0),
//           isActive: h.isActive !== undefined ? Boolean(h.isActive) : true,
//         }));
//         return {
//           productId: product._id,
//           menuDate,
//           session,
//           basePrice: Number(product.foodprice || 0),
//           hubData,
//         };
//       })
//       .filter((it) => Array.isArray(it.hubData) && it.hubData.length > 0);

//     if (items.length === 0) {
//       toast.warn("No hub assignments found to save.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post(`${SAVE_API_URL}/bulk`, { items });
//       if (res?.data?.success) {
//         toast.success("All items saved to hub menu.");
//         // optional: navigate to hub management or reset UI
//         setAddedProducts([]);
//         setAssignments({});
//         setView("selection");
//         navigate("/hub-product-mangement");
//       } else {
//         toast.error("Bulk save completed with issues.");
//       }
//     } catch (err) {
//       console.error("Bulk save error", err);
//       toast.error("Failed to save menus. See console.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAssignmentChange = (hubId, field, value) => {
//     const currentProductId = addedProducts[currentProductIndex]._id;
//     const numericValue = Number(value) < 0 ? 0 : Number(value); // Ensure non-negative numbers

//     setAssignments((prev) => ({
//       ...prev,
//       [currentProductId]: {
//         ...prev[currentProductId],
//         [hubId]: {
//           ...prev[currentProductId][hubId],
//           [field]: numericValue,
//         },
//       },
//     }));
//   };

//   const handleToggleHubActive = (hubId) => {
//     const currentProductId = addedProducts[currentProductIndex]._id;
//     setAssignments((prev) => ({
//       ...prev,
//       [currentProductId]: {
//         ...prev[currentProductId],
//         [hubId]: {
//           ...prev[currentProductId][hubId],
//           isActive: !prev[currentProductId][hubId].isActive,
//         },
//       },
//     }));
//   };

//   // This handles the "Next" button
//   // const handleNextClick = async () => {
//   //   const success = await handleSaveProductAssignments();
//   //   if (success) {
//   //     // Only move to next product if save was successful
//   //     setCurrentProductIndex(currentProductIndex + 1);
//   //   }
//   // };

//   // This handles the "Add all" button
//   // const handleSaveAllClick = async () => {
//   //   const success = await handleSaveProductAssignments();
//   //   if (success) {
//   //     // Navigate to hub management as requested
//   //     toast.info("All menus saved! Navigating to Hub Management...");
//   //     // 9. FIX: This must match your router path in Main.jsx
//   //     navigate("/hub-product-mangement");
//   //   }
//   // };

//   // const handleDeleteItem = () => {
//   //   const productToDelete = addedProducts[currentProductIndex];
//   //   handleRemoveProduct(productToDelete._id);

//   //   if (addedProducts.length - 1 === 0) {
//   //     // If no products left, go back to View 1
//   //     handleCancel();
//   //   } else if (currentProductIndex >= addedProducts.length - 1) {
//   //     // If we deleted the last item, move to the new last item
//   //     setCurrentProductIndex(currentProductIndex - 1);
//   //   }
//   //   // Otherwise, index stays the same (next item slides into place)
//   // };

//   const handleCancel = () => {
//     // We don't clear menuDate or session, as admin might want to add more
//     setAddedProducts([]);
//     setAssignments({});
//     setCurrentProductIndex(0);
//     setView("selection");
//   };

//   const currentProduct = addedProducts[currentProductIndex];
//   const currentAssignments = assignments[currentProduct?._id] || {};

//   // === RENDER ===

//   if (pageLoading) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <div className="mu-container">
//           <h3>Loading Products and Hubs...</h3>
//         </div>
//       </Box>
//     );
//   }

//   if (view === "assignment") {
//     // --- VIEW 2: HUB ASSIGNMENT (Matching image_65d19f.png) ---
//     return (
//       <Box sx={{ p: 3 }}>
//         <div className="mu-container">
//           <div className="mu-header">
//             <h3>Assign to Hubs</h3>
//             <button onClick={handleCancel} className="btn btn-secondary">
//               Cancel & Go Back
//             </button>
//           </div>

//           <div className="mu-item-header">
//             <h4>
//               <span className="mu-item-counter">
//                 {currentProductIndex + 1}/{addedProducts.length}
//               </span>
//               {/* 10. FIX: Use your fields 'foodname' and 'foodprice' ++ */}
//               {currentProduct.foodname} - ₹{currentProduct.foodprice}
//             </h4>
//             <button
//               className="btn btn-danger btn-sm"
//               onClick={handleDeleteItem}
//             >
//               Delete ITEM
//             </button>
//           </div>

//           <div className="table-responsive">
//             <table className="table table-bordered mu-hub-table">
//               <thead>
//                 <tr>
//                   <th>Hub</th>
//                   <th>Quantity</th>
//                   <th>Hub Priority</th>
//                   <th>Hub Pricing</th>
//                   <th>Pre Order Pricing</th>
//                   <th>Option to close</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {/* 11. FIX: Use allHubs from state ++ */}
//                 {allHubs.map((hub) => {
//                   const assignment = currentAssignments[hub._id];
//                   const isDisabled = !assignment?.isActive;
//                   return (
//                     <tr
//                       key={hub._id}
//                       className={isDisabled ? "row-disabled" : ""}
//                     >
//                       {/* Use 'hubName' from your API response */}
//                       <td>{hub.hubName}</td>
//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           disabled={isDisabled}
//                           value={assignment?.totalQuantity || 0}
//                           onChange={(e) =>
//                             handleAssignmentChange(
//                               hub._id,
//                               "totalQuantity",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </td>
//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           disabled={isDisabled}
//                           value={assignment?.hubPriority || 0}
//                           onChange={(e) =>
//                             handleAssignmentChange(
//                               hub._id,
//                               "hubPriority",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </td>
//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           disabled={isDisabled}
//                           value={assignment?.hubPrice || 0}
//                           onChange={(e) =>
//                             handleAssignmentChange(
//                               hub._id,
//                               "hubPrice",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </td>{" "}
//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           disabled={isDisabled}
//                           value={assignment?.preOrderPrice || 0}
//                           onChange={(e) =>
//                             handleAssignmentChange(
//                               hub._id,
//                               "preOrderPrice",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </td>
//                       <td>
//                         <button
//                           className={`btn ${
//                             isDisabled ? "btn-success" : "btn-danger"
//                           }`}
//                           onClick={() => handleToggleHubActive(hub._id)}
//                         >
//                           {isDisabled ? <FaPlus /> : <FaTimes />}
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           <div className="mu-footer">
//             <button
//               className="btn btn-outline-secondary"
//               onClick={() => setCurrentProductIndex(currentProductIndex - 1)}
//               disabled={currentProductIndex === 0 || loading}
//             >
//               Previous
//             </button>

//             {currentProductIndex === addedProducts.length - 1 ? (
//               <button
//                 className="btn btn-success"
//                 onClick={handleSaveAllClick}
//                 disabled={loading}
//               >
//                 {loading ? "Saving..." : "Add all"}
//               </button>
//             ) : (
//               <button
//                 className="btn btn-primary"
//                 onClick={handleNextClick}
//                 disabled={loading}
//               >
//                 {loading ? "Saving..." : "Save & Next"}
//               </button>
//             )}
//           </div>
//         </div>
//       </Box>
//     );
//   }

//   // --- VIEW 1: PRODUCT SELECTION (Matching image_65ca39.png) ---
//   return (
//     <Box sx={{ p: 3 }}>
//       <div className="mu-container">
//         <div className="mu-header">
//           <h3>Menu Upload</h3>
//         </div>

//         <div className="row">
//           <div className="col-md-6 form-group">
//             <label>+ Select Date</label>
//             <input
//               type="date"
//               className="form-control"
//               value={menuDate}
//               onChange={(e) => setMenuDate(e.target.value)}
//               min={new Date().toISOString().split("T")[0]} // Today's date
//             />
//           </div>
//           <div className="col-md-6 form-group">
//             <label>+ Select Session</label>
//             <select
//               className="form-control"
//               value={session}
//               onChange={(e) => setSession(e.target.value)}
//             >
//               <option value="">Select Lunch / Dinner</option>
//               <option value="Lunch">Lunch</option>
//               <option value="Dinner">Dinner</option>
//             </select>
//           </div>
//         </div>

//         <div className="form-group mu-product-search-container">
//           <label>+ Add Product (For that particular date and session)</label>
//           <div className="mu-search-wrapper">
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Search product..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <FaSearch className="mu-search-icon" />
//           </div>
//           {filteredProducts.length > 0 && (
//             <div className="mu-search-results">
//               {filteredProducts.map((product) => (
//                 <div key={product._id} className="mu-search-result-item">
//                   <img
//                     // 12. FIX: Use your 'Foodgallery' field
//                     src={
//                       product.Foodgallery[0]?.image2 ||
//                       "/Assets/logo-container.svg"
//                     }
//                     alt={product.foodname}
//                   />
//                   <span>
//                     {/* 13. FIX: Use your 'foodname' and 'foodprice' fields */}
//                     {product.foodname} (₹{product.foodprice})
//                   </span>
//                   <button
//                     className="btn btn-success btn-sm"
//                     onClick={() => handleAddProduct(product)}
//                   >
//                     <FaPlus /> ADD
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="mu-added-list">
//           <label>Added Lists</label>
//           <div className="mu-added-list-items">
//             {addedProducts.length === 0 ? (
//               <p className="mu-no-items">No products added yet.</p>
//             ) : (
//               addedProducts.map((product) => (
//                 <span key={product._id} className="mu-added-item-tag">
//                   {/* 14. FIX: Use your 'foodname' field */}
//                   {product.foodname}
//                   <button onClick={() => handleRemoveProduct(product._id)}>
//                     <FaTimes />
//                   </button>
//                 </span>
//               ))
//             )}
//           </div>
//         </div>

//         <div className="mu-footer">
//           <button
//             className="btn btn-primary btn-lg"
//             onClick={handleGoToAssignment}
//           >
//             Assign to Hub
//           </button>
//         </div>
//       </div>
//     </Box>
//   );
// };

// export default MenuUpload;

// import React, { useState, useEffect } from "react";
// import { FaTimes, FaPlus, FaSearch } from "react-icons/fa";
// import "../../Styles/MenuUpload.css"; // Your CSS file
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { Box } from "@mui/material";
// import axios from "axios";

// // 2. Define ALL your API URLs
// const SAVE_API_URL = "http://localhost:7013/api/admin/hub-menu"; // This is for SAVING (from our plan)
// const HUBS_API = "http://localhost:7013/api/Hub/hubs"; // This is your live API
// const PRODUCTS_API = "http://localhost:7013/api/admin/getFoodItems"; // This is your live API

// const MenuUpload = () => {
//   const navigate = useNavigate();

//   // View 1: Product Selection
//   const [menuDate, setMenuDate] = useState("");
//   const [session, setSession] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   const [masterProducts, setMasterProducts] = useState([]); // Will hold products from API
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [allHubs, setAllHubs] = useState([]); // Will hold hubs from API
//   const [addedProducts, setAddedProducts] = useState([]);

//   // View 2: Hub Assignment
//   const [view, setView] = useState("selection"); // 'selection' or 'assignment'
//   const [currentProductIndex, setCurrentProductIndex] = useState(0);
//   const [assignments, setAssignments] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [pageLoading, setPageLoading] = useState(true);

//   // Track the current priority for each product
//   const [currentPriority, setCurrentPriority] = useState(1);

//   // 3. Fetch Hubs and Products on component load
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       setPageLoading(true);
//       try {
//         // We'll fetch products and hubs at the same time
//         const [productsRes, hubsRes] = await Promise.all([
//           axios.get(PRODUCTS_API), // Use your live product API
//           axios.get(HUBS_API), // Use your live hub API
//         ]);

//         // Use the response structure you provided: response.data.data
//         if (productsRes.data && productsRes.data.data) {
//           setMasterProducts(productsRes.data.data);
//         } else {
//           toast.error("Could not parse products. Check API.");
//         }

//         // Use the response structure you provided: response.data (which is an array)
//         if (hubsRes.data && Array.isArray(hubsRes.data)) {
//           setAllHubs(hubsRes.data);
//         } else {
//           toast.error("Could not parse hubs. Check API.");
//         }
//       } catch (err) {
//         console.error("Error fetching initial data:", err);
//         toast.error("Failed to load products and hubs. Please refresh.");
//       } finally {
//         setPageLoading(false);
//       }
//     };

//     fetchInitialData();
//   }, []); // Runs once on component mount

//   // 4. Handle product search (FIX: use 'foodname')
//   useEffect(() => {
//     if (searchTerm.trim() === "") {
//       setFilteredProducts([]);
//     } else {
//       setFilteredProducts(
//         masterProducts.filter((p) =>
//           // Use your field 'foodname'
//           p.foodname.toLowerCase().includes(searchTerm.toLowerCase()),
//         ),
//       );
//     }
//   }, [searchTerm, masterProducts]);

//   // === VIEW 1 FUNCTIONS ===

//   const handleAddProduct = (product) => {
//     if (!addedProducts.find((p) => p._id === product._id)) {
//       setAddedProducts([...addedProducts, product]);
//     }
//     setSearchTerm("");
//   };

//   const handleRemoveProduct = (productId) => {
//     setAddedProducts(addedProducts.filter((p) => p._id !== productId));
//     // Also remove from assignments if it's there
//     setAssignments((prev) => {
//       const newAssignments = { ...prev };
//       delete newAssignments[productId];
//       return newAssignments;
//     });
//   };

//   const handleGoToAssignment = () => {
//     if (!menuDate || !session) {
//       return toast.warn("Please select a Date and Session.");
//     }
//     if (addedProducts.length === 0) {
//       return toast.warn("Please add at least one product.");
//     }

//     // Initialize assignments state for all added products
//     const newAssignments = {};
//     for (const product of addedProducts) {
//       newAssignments[product._id] = {};
//       // 5. FIX: Use allHubs from state, not DUMMY_HUBS
//       for (const hub of allHubs) {
//         // Pre-fill with default values
//         newAssignments[product._id][hub._id] = {
//           hubId: hub._id, // Store the hubId
//           // 6. FIX: Use your field 'foodprice' as the basePrice
//           hubPrice: product.foodprice,
//           preOrderPrice: product.foodprice,
//           totalQuantity: 10, // Default quantity
//           hubPriority: 1, // Default priority for all products initially
//           isActive: true,
//         };
//       }
//     }
//     setAssignments(newAssignments);
//     setCurrentProductIndex(0);
//     setCurrentPriority(1); // Reset to 1 when starting fresh
//     setView("assignment"); // Switch to View 2
//   };

//   // === VIEW 2 FUNCTIONS ===

//   // Advance to next product and update priority
//   const handleNextClick = () => {
//     if (currentProductIndex < addedProducts.length - 1) {
//       // First, update the current product's assignments with current priority
//       const currentProductId = addedProducts[currentProductIndex]._id;
//       const updatedAssignments = { ...assignments };

//       // Update all active hubs in current product with current priority
//       allHubs.forEach((hub) => {
//         if (
//           updatedAssignments[currentProductId]?.[hub._id]?.isActive !== false
//         ) {
//           updatedAssignments[currentProductId][hub._id] = {
//             ...updatedAssignments[currentProductId][hub._id],
//             hubPriority: currentPriority,
//           };
//         }
//       });

//       setAssignments(updatedAssignments);

//       // Move to next product
//       setCurrentProductIndex((i) => i + 1);

//       // Increment priority for the next product
//       setCurrentPriority((prev) => prev + 1);
//     }
//   };

//   // Go to previous product
//   const handlePreviousClick = () => {
//     if (currentProductIndex > 0) {
//       const newIndex = currentProductIndex - 1;
//       setCurrentProductIndex(newIndex);

//       // Calculate what priority should be shown for the previous product
//       // If we're going from product 2 to product 1, priority should be 1
//       // If we're going from product 3 to product 2, priority should be 2, etc.
//       // So: priority = current index + 1
//       setCurrentPriority(newIndex + 1);
//     }
//   };

//   // Delete local product (no backend delete because nothing has been pushed yet)
//   const handleDeleteItem = () => {
//     const productToDelete = addedProducts[currentProductIndex];
//     if (!productToDelete) return;
//     // Remove from addedProducts
//     const newAdded = addedProducts.filter(
//       (p, idx) => idx !== currentProductIndex,
//     );
//     setAddedProducts(newAdded);
//     // Remove assignments for that product
//     setAssignments((prev) => {
//       const copy = { ...prev };
//       delete copy[productToDelete._id];
//       return copy;
//     });
//     // Adjust index
//     if (newAdded.length === 0) {
//       // go back to selection view
//       setView("selection");
//       setCurrentProductIndex(0);
//       setCurrentPriority(1);
//     } else if (currentProductIndex >= newAdded.length) {
//       setCurrentProductIndex(newAdded.length - 1);
//       // Adjust priority based on new index
//       setCurrentPriority(newAdded.length);
//     } else {
//       // If deleting from middle, adjust priority based on current index
//       setCurrentPriority(currentProductIndex + 1);
//     }
//   };

//   // Build bulk payload and send to backend
//   const handleSaveAllClick = async () => {
//     if (!menuDate || !session) {
//       toast.warn("Menu date and session are required.");
//       return;
//     }
//     if (!addedProducts || addedProducts.length === 0) {
//       toast.warn("No products to save.");
//       return;
//     }

//     // First update the current product's assignments with current priority
//     const currentProductId = addedProducts[currentProductIndex]._id;
//     const updatedAssignments = { ...assignments };

//     // Update all active hubs in current product with current priority
//     allHubs.forEach((hub) => {
//       if (updatedAssignments[currentProductId]?.[hub._id]?.isActive !== false) {
//         updatedAssignments[currentProductId][hub._id] = {
//           ...updatedAssignments[currentProductId][hub._id],
//           hubPriority: currentPriority,
//         };
//       }
//     });

//     setAssignments(updatedAssignments);

//     const items = addedProducts
//       .map((product) => {
//         const hubObj = updatedAssignments[product._id] || {};
//         const hubData = Object.values(hubObj).map((h) => ({
//           hubId: h.hubId,
//           hubPrice: Number(h.hubPrice || product.foodprice || 0),
//           preOrderPrice: Number(h.preOrderPrice || product.foodprice || 0),
//           totalQuantity: Number(h.totalQuantity || 0),
//           hubPriority: Number(h.hubPriority || 0),
//           isActive: h.isActive !== undefined ? Boolean(h.isActive) : true,
//         }));
//         return {
//           productId: product._id,
//           menuDate,
//           session,
//           basePrice: Number(product.foodprice || 0),
//           hubData,
//         };
//       })
//       .filter((it) => Array.isArray(it.hubData) && it.hubData.length > 0);

//     if (items.length === 0) {
//       toast.warn("No hub assignments found to save.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post(`${SAVE_API_URL}/bulk`, { items });
//       if (res?.data?.success) {
//         toast.success("All items saved to hub menu.");
//         // optional: navigate to hub management or reset UI
//         setAddedProducts([]);
//         setAssignments({});
//         setView("selection");
//         setCurrentPriority(1);
//         navigate("/hub-product-mangement");
//       } else {
//         toast.error("Bulk save completed with issues.");
//       }
//     } catch (err) {
//       console.error("Bulk save error", err);
//       toast.error("Failed to save menus. See console.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAssignmentChange = (hubId, field, value) => {
//     const currentProductId = addedProducts[currentProductIndex]._id;
//     const numericValue = Number(value) < 0 ? 0 : Number(value); // Ensure non-negative numbers

//     setAssignments((prev) => ({
//       ...prev,
//       [currentProductId]: {
//         ...prev[currentProductId],
//         [hubId]: {
//           ...prev[currentProductId][hubId],
//           [field]: numericValue,
//         },
//       },
//     }));
//   };

//   const handleToggleHubActive = (hubId) => {
//     const currentProductId = addedProducts[currentProductIndex]._id;
//     setAssignments((prev) => ({
//       ...prev,
//       [currentProductId]: {
//         ...prev[currentProductId],
//         [hubId]: {
//           ...prev[currentProductId][hubId],
//           isActive: !prev[currentProductId][hubId].isActive,
//         },
//       },
//     }));
//   };

//   const handleCancel = () => {
//     // We don't clear menuDate or session, as admin might want to add more
//     setAddedProducts([]);
//     setAssignments({});
//     setCurrentProductIndex(0);
//     setCurrentPriority(1);
//     setView("selection");
//   };

//   const currentProduct = addedProducts[currentProductIndex];
//   const currentAssignments = assignments[currentProduct?._id] || {};

//   // === RENDER ===

//   if (pageLoading) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <div className="mu-container">
//           <h3>Loading Products and Hubs...</h3>
//         </div>
//       </Box>
//     );
//   }

//   if (view === "assignment") {
//     // --- VIEW 2: HUB ASSIGNMENT (Matching image_65d19f.png) ---
//     return (
//       <Box sx={{ p: 3 }}>
//         <div className="mu-container">
//           <div className="mu-header">
//             <h3>Assign to Hubs</h3>
//             <button onClick={handleCancel} className="btn btn-secondary">
//               Cancel & Go Back
//             </button>
//           </div>

//           <div className="mu-item-header">
//             <h4>
//               <span className="mu-item-counter">
//                 {currentProductIndex + 1}/{addedProducts.length}
//               </span>
//               {/* 10. FIX: Use your fields 'foodname' and 'foodprice' ++ */}
//               {currentProduct.foodname} - ₹{currentProduct.foodprice}
//             </h4>
//             <button
//               className="btn btn-danger btn-sm"
//               onClick={handleDeleteItem}
//             >
//               Delete ITEM
//             </button>
//           </div>

//           <div className="table-responsive">
//             <table className="table table-bordered mu-hub-table">
//               <thead>
//                 <tr>
//                   <th>Hub</th>
//                   <th>Quantity</th>
//                   <th>Hub Priority</th>
//                   <th>Hub Pricing</th>
//                   <th>Pre Order Pricing</th>
//                   <th>Option to close</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {/* 11. FIX: Use allHubs from state ++ */}
//                 {allHubs.map((hub) => {
//                   const assignment = currentAssignments[hub._id];
//                   const isDisabled = !assignment?.isActive;
//                   return (
//                     <tr
//                       key={hub._id}
//                       className={isDisabled ? "row-disabled" : ""}
//                     >
//                       {/* Use 'hubName' from your API response */}
//                       <td>{hub.hubName}</td>
//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           disabled={isDisabled}
//                           value={assignment?.totalQuantity || 0}
//                           onChange={(e) =>
//                             handleAssignmentChange(
//                               hub._id,
//                               "totalQuantity",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </td>
//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           disabled={isDisabled}
//                           value={currentPriority} // Show current priority for all hubs
//                           readOnly
//                           style={{
//                             fontWeight: "bold",
//                             backgroundColor: isDisabled ? "#f8f9fa" : "#e8f5e9",
//                             textAlign: "center",
//                           }}
//                         />
//                       </td>
//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           disabled={isDisabled}
//                           value={assignment?.hubPrice || 0}
//                           onChange={(e) =>
//                             handleAssignmentChange(
//                               hub._id,
//                               "hubPrice",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </td>{" "}
//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           disabled={isDisabled}
//                           value={assignment?.preOrderPrice || 0}
//                           onChange={(e) =>
//                             handleAssignmentChange(
//                               hub._id,
//                               "preOrderPrice",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </td>
//                       <td>
//                         <button
//                           className={`btn ${
//                             isDisabled ? "btn-success" : "btn-danger"
//                           }`}
//                           onClick={() => handleToggleHubActive(hub._id)}
//                         >
//                           {isDisabled ? <FaPlus /> : <FaTimes />}
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           <div className="mu-footer">
//             <button
//               className="btn btn-outline-secondary"
//               onClick={handlePreviousClick}
//               disabled={currentProductIndex === 0 || loading}
//             >
//               Previous
//             </button>

//             {currentProductIndex === addedProducts.length - 1 ? (
//               <button
//                 className="btn btn-success"
//                 onClick={handleSaveAllClick}
//                 disabled={loading}
//               >
//                 {loading ? "Saving..." : "Add all"}
//               </button>
//             ) : (
//               <button
//                 className="btn btn-primary"
//                 onClick={handleNextClick}
//                 disabled={loading}
//               >
//                 {loading ? "Saving..." : "Save & Next"}
//               </button>
//             )}
//           </div>
//         </div>
//       </Box>
//     );
//   }

//   // --- VIEW 1: PRODUCT SELECTION (Matching image_65ca39.png) ---
//   return (
//     <Box sx={{ p: 3 }}>
//       <div className="mu-container">
//         <div className="mu-header">
//           <h3>Menu Upload</h3>
//         </div>

//         <div className="row">
//           <div className="col-md-6 form-group">
//             <label>+ Select Date</label>
//             <input
//               type="date"
//               className="form-control"
//               value={menuDate}
//               onChange={(e) => setMenuDate(e.target.value)}
//               min={new Date().toISOString().split("T")[0]} // Today's date
//             />
//           </div>
//           <div className="col-md-6 form-group">
//             <label>+ Select Session</label>
//             <select
//               className="form-control"
//               value={session}
//               onChange={(e) => setSession(e.target.value)}
//             >
//               <option value="">Select Lunch / Dinner</option>
//               <option value="Lunch">Lunch</option>
//               <option value="Dinner">Dinner</option>
//             </select>
//           </div>
//         </div>

//         <div className="form-group mu-product-search-container">
//           <label>+ Add Product (For that particular date and session)</label>
//           <div className="mu-search-wrapper">
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Search product..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <FaSearch className="mu-search-icon" />
//           </div>
//           {filteredProducts.length > 0 && (
//             <div className="mu-search-results">
//               {filteredProducts.map((product) => (
//                 <div key={product._id} className="mu-search-result-item">
//                   <img
//                     // 12. FIX: Use your 'Foodgallery' field
//                     src={
//                       product.Foodgallery[0]?.image2 ||
//                       "/Assets/logo-container.svg"
//                     }
//                     alt={product.foodname}
//                   />
//                   <span>
//                     {/* 13. FIX: Use your 'foodname' and 'foodprice' fields */}
//                     {product.foodname} (₹{product.foodprice})
//                   </span>
//                   <button
//                     className="btn btn-success btn-sm"
//                     onClick={() => handleAddProduct(product)}
//                   >
//                     <FaPlus /> ADD
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="mu-added-list">
//           <label>Added Lists</label>
//           <div className="mu-added-list-items">
//             {addedProducts.length === 0 ? (
//               <p className="mu-no-items">No products added yet.</p>
//             ) : (
//               addedProducts.map((product) => (
//                 <span key={product._id} className="mu-added-item-tag">
//                   {/* 14. FIX: Use your 'foodname' field */}
//                   {product.foodname}
//                   <button onClick={() => handleRemoveProduct(product._id)}>
//                     <FaTimes />
//                   </button>
//                 </span>
//               ))
//             )}
//           </div>
//         </div>

//         <div className="mu-footer">
//           <button
//             className="btn btn-primary btn-lg"
//             onClick={handleGoToAssignment}
//           >
//             Assign to Hub
//           </button>
//         </div>
//       </div>
//     </Box>
//   );
// };

// export default MenuUpload;

import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaSearch } from "react-icons/fa";
import "../../Styles/MenuUpload.css"; // Your CSS file
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import axios from "axios";

// 2. Define ALL your API URLs
const SAVE_API_URL = "http://localhost:7013/api/admin/hub-menu"; // This is for SAVING (from our plan)
const HUBS_API = "http://localhost:7013/api/Hub/hubs"; // This is your live API
const PRODUCTS_API = "http://localhost:7013/api/admin/getFoodItems"; // This is your live API

const MenuUpload = () => {
  const navigate = useNavigate();

  // View 1: Product Selection
  const [menuDate, setMenuDate] = useState("");
  const [session, setSession] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [masterProducts, setMasterProducts] = useState([]); // Will hold products from API
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allHubs, setAllHubs] = useState([]); // Will hold hubs from API
  const [addedProducts, setAddedProducts] = useState([]);

  // View 2: Hub Assignment
  const [view, setView] = useState("selection"); // 'selection' or 'assignment'
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Track the current priority for each product
  const [currentPriority, setCurrentPriority] = useState(1);

  // 3. Fetch Hubs and Products on component load
  useEffect(() => {
    const fetchInitialData = async () => {
      setPageLoading(true);
      try {
        // We'll fetch products and hubs at the same time
        const [productsRes, hubsRes] = await Promise.all([
          axios.get(PRODUCTS_API), // Use your live product API
          axios.get(HUBS_API), // Use your live hub API
        ]);

        // Use the response structure you provided: response.data.data
        if (productsRes.data && productsRes.data.data) {
          setMasterProducts(productsRes.data.data);
        } else {
          toast.error("Could not parse products. Check API.");
        }

        // Use the response structure you provided: response.data (which is an array)
        if (hubsRes.data && Array.isArray(hubsRes.data)) {
          setAllHubs(hubsRes.data);
        } else {
          toast.error("Could not parse hubs. Check API.");
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        toast.error("Failed to load products and hubs. Please refresh.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Runs once on component mount

  // 4. Handle product search (FIX: use 'foodname')
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
    } else {
      setFilteredProducts(
        masterProducts.filter((p) =>
          // Use your field 'foodname'
          p.foodname.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [searchTerm, masterProducts]);

  // === VIEW 1 FUNCTIONS ===

  const handleAddProduct = (product) => {
    if (!addedProducts.find((p) => p._id === product._id)) {
      setAddedProducts([...addedProducts, product]);
    }
    setSearchTerm("");
  };

  const handleRemoveProduct = (productId) => {
    setAddedProducts(addedProducts.filter((p) => p._id !== productId));
    // Also remove from assignments if it's there
    setAssignments((prev) => {
      const newAssignments = { ...prev };
      delete newAssignments[productId];
      return newAssignments;
    });
  };

  const handleGoToAssignment = () => {
    if (!menuDate || !session) {
      return toast.warn("Please select a Date and Session.");
    }
    if (addedProducts.length === 0) {
      return toast.warn("Please add at least one product.");
    }

    // Initialize assignments state for all added products
    const newAssignments = {};
    for (const product of addedProducts) {
      newAssignments[product._id] = {};
      // 5. FIX: Use allHubs from state, not DUMMY_HUBS
      for (const hub of allHubs) {
        // Pre-fill with default values
        newAssignments[product._id][hub._id] = {
          hubId: hub._id, // Store the hubId
          // 6. FIX: Use your field 'foodprice' as the basePrice
          hubPrice: product.foodprice,
          preOrderPrice: product.foodprice,
          totalQuantity: 10, // Default quantity
          hubPriority: 1, // Default priority for all products initially
          isActive: true,
        };
      }
    }
    setAssignments(newAssignments);
    setCurrentProductIndex(0);
    setCurrentPriority(1); // Reset to 1 when starting fresh
    setView("assignment"); // Switch to View 2
  };

  // === VIEW 2 FUNCTIONS ===

  // Advance to next product and update priority
  const handleNextClick = () => {
    if (currentProductIndex < addedProducts.length - 1) {
      // First, update the current product's assignments with current priority
      const currentProductId = addedProducts[currentProductIndex]._id;
      const updatedAssignments = { ...assignments };

      // Update all active hubs in current product with current priority
      allHubs.forEach((hub) => {
        if (
          updatedAssignments[currentProductId]?.[hub._id]?.isActive !== false
        ) {
          updatedAssignments[currentProductId][hub._id] = {
            ...updatedAssignments[currentProductId][hub._id],
            hubPriority: currentPriority,
          };
        }
      });

      setAssignments(updatedAssignments);

      // Move to next product
      setCurrentProductIndex((i) => i + 1);

      // Increment priority for the next product
      setCurrentPriority((prev) => prev + 1);
    }
  };

  // Go to previous product
  const handlePreviousClick = () => {
    if (currentProductIndex > 0) {
      const newIndex = currentProductIndex - 1;
      setCurrentProductIndex(newIndex);

      // Calculate what priority should be shown for the previous product
      // If we're going from product 2 to product 1, priority should be 1
      // If we're going from product 3 to product 2, priority should be 2, etc.
      // So: priority = current index + 1
      setCurrentPriority(newIndex + 1);
    }
  };

  // Delete local product (no backend delete because nothing has been pushed yet)
  const handleDeleteItem = () => {
    const productToDelete = addedProducts[currentProductIndex];
    if (!productToDelete) return;
    // Remove from addedProducts
    const newAdded = addedProducts.filter(
      (p, idx) => idx !== currentProductIndex,
    );
    setAddedProducts(newAdded);
    // Remove assignments for that product
    setAssignments((prev) => {
      const copy = { ...prev };
      delete copy[productToDelete._id];
      return copy;
    });
    // Adjust index
    if (newAdded.length === 0) {
      // go back to selection view
      setView("selection");
      setCurrentProductIndex(0);
      setCurrentPriority(1);
    } else if (currentProductIndex >= newAdded.length) {
      setCurrentProductIndex(newAdded.length - 1);
      // Adjust priority based on new index
      setCurrentPriority(newAdded.length);
    } else {
      // If deleting from middle, adjust priority based on current index
      setCurrentPriority(currentProductIndex + 1);
    }
  };

  // Build bulk payload and send to backend
  const handleSaveAllClick = async () => {
    if (!menuDate || !session) {
      toast.warn("Menu date and session are required.");
      return;
    }
    if (!addedProducts || addedProducts.length === 0) {
      toast.warn("No products to save.");
      return;
    }

    // First update the current product's assignments with current priority
    const currentProductId = addedProducts[currentProductIndex]._id;
    const updatedAssignments = { ...assignments };

    // Update all active hubs in current product with current priority
    allHubs.forEach((hub) => {
      if (updatedAssignments[currentProductId]?.[hub._id]?.isActive !== false) {
        updatedAssignments[currentProductId][hub._id] = {
          ...updatedAssignments[currentProductId][hub._id],
          hubPriority: currentPriority,
        };
      }
    });

    setAssignments(updatedAssignments);

    const items = addedProducts
      .map((product) => {
        const hubObj = updatedAssignments[product._id] || {};
        const hubData = Object.values(hubObj).map((h) => ({
          hubId: h.hubId,
          hubPrice: Number(h.hubPrice || product.foodprice || 0),
          preOrderPrice: Number(h.preOrderPrice || product.foodprice || 0),
          totalQuantity: Number(h.totalQuantity || 0),
          hubPriority: Number(h.hubPriority || 0),
          isActive: h.isActive !== undefined ? Boolean(h.isActive) : true,
        }));
        return {
          productId: product._id,
          menuDate,
          session,
          basePrice: Number(product.foodprice || 0),
          hubData,
        };
      })
      .filter((it) => Array.isArray(it.hubData) && it.hubData.length > 0);

    if (items.length === 0) {
      toast.warn("No hub assignments found to save.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${SAVE_API_URL}/bulk`, { items });
      if (res?.data?.success) {
        toast.success("All items saved to hub menu.");
        // optional: navigate to hub management or reset UI
        setAddedProducts([]);
        setAssignments({});
        setView("selection");
        setCurrentPriority(1);
        navigate("/hub-product-mangement");
      } else {
        toast.error("Bulk save completed with issues.");
      }
    } catch (err) {
      console.error("Bulk save error", err);
      toast.error("Failed to save menus. See console.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentChange = (hubId, field, value) => {
    const currentProductId = addedProducts[currentProductIndex]._id;
    const numericValue = Number(value) < 0 ? 0 : Number(value); // Ensure non-negative numbers

    setAssignments((prev) => ({
      ...prev,
      [currentProductId]: {
        ...prev[currentProductId],
        [hubId]: {
          ...prev[currentProductId][hubId],
          [field]: numericValue,
        },
      },
    }));
  };

  const handleToggleHubActive = (hubId) => {
    const currentProductId = addedProducts[currentProductIndex]._id;
    setAssignments((prev) => ({
      ...prev,
      [currentProductId]: {
        ...prev[currentProductId],
        [hubId]: {
          ...prev[currentProductId][hubId],
          isActive: !prev[currentProductId][hubId].isActive,
        },
      },
    }));
  };

  const handleCancel = () => {
    // We don't clear menuDate or session, as admin might want to add more
    setAddedProducts([]);
    setAssignments({});
    setCurrentProductIndex(0);
    setCurrentPriority(1);
    setView("selection");
  };

  const currentProduct = addedProducts[currentProductIndex];
  const currentAssignments = assignments[currentProduct?._id] || {};

  // === RENDER ===

  if (pageLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <div className="mu-container">
          <h3>Loading Products and Hubs...</h3>
        </div>
      </Box>
    );
  }

  if (view === "assignment") {
    // --- VIEW 2: HUB ASSIGNMENT (Matching image_65d19f.png) ---
    return (
      <Box sx={{ p: 3 }}>
        <div className="mu-container">
          <div className="mu-header">
            <h3>Assign to Hubs</h3>
            <button onClick={handleCancel} className="btn btn-secondary">
              Cancel & Go Back
            </button>
          </div>

          <div className="mu-item-header">
            <h4>
              <span className="mu-item-counter">
                {currentProductIndex + 1}/{addedProducts.length}
              </span>
              {/* 10. FIX: Use your fields 'foodname' and 'foodprice' ++ */}
              {currentProduct.foodname} - ₹{currentProduct.foodprice}
            </h4>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDeleteItem}
            >
              Delete ITEM
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered mu-hub-table">
              <thead>
                <tr>
                  <th>Hub</th>
                  <th>Quantity</th>
                  <th>Hub Priority</th>
                  <th>Hub Pricing</th>
                  <th>Pre Order Pricing</th>
                  <th>Option to close</th>
                </tr>
              </thead>
              <tbody>
                {/* 11. FIX: Use allHubs from state ++ */}
                {allHubs.map((hub) => {
                  const assignment = currentAssignments[hub._id];
                  const isDisabled = !assignment?.isActive;
                  return (
                    <tr
                      key={hub._id}
                      className={isDisabled ? "row-disabled" : ""}
                    >
                      {/* Use 'hubName' from your API response */}
                      <td>{hub.hubName}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          disabled={isDisabled}
                          value={assignment?.totalQuantity || 0}
                          onChange={(e) =>
                            handleAssignmentChange(
                              hub._id,
                              "totalQuantity",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          disabled={isDisabled}
                          value={currentPriority} // Show current priority for all hubs
                          readOnly
                          style={{
                            fontWeight: "bold",
                            backgroundColor: isDisabled ? "#f8f9fa" : "#e8f5e9",
                            textAlign: "center",
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          disabled={isDisabled}
                          value={assignment?.hubPrice || 0}
                          onChange={(e) =>
                            handleAssignmentChange(
                              hub._id,
                              "hubPrice",
                              e.target.value,
                            )
                          }
                        />
                      </td>{" "}
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          disabled={isDisabled}
                          value={assignment?.preOrderPrice || 0}
                          onChange={(e) =>
                            handleAssignmentChange(
                              hub._id,
                              "preOrderPrice",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          className={`btn ${
                            isDisabled ? "btn-success" : "btn-danger"
                          }`}
                          onClick={() => handleToggleHubActive(hub._id)}
                        >
                          {isDisabled ? <FaPlus /> : <FaTimes />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mu-footer">
            <button
              className="btn btn-outline-secondary"
              onClick={handlePreviousClick}
              disabled={currentProductIndex === 0 || loading}
            >
              Previous
            </button>

            {currentProductIndex === addedProducts.length - 1 ? (
              <button
                className="btn btn-success"
                onClick={handleSaveAllClick}
                disabled={loading}
              >
                {loading ? "Saving..." : "Add all"}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleNextClick}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save & Next"}
              </button>
            )}
          </div>
        </div>
      </Box>
    );
  }

  // --- VIEW 1: PRODUCT SELECTION (Matching image_65ca39.png) ---
  return (
    <Box sx={{ p: 3 }}>
      <div className="mu-container">
        <div className="mu-header">
          <h3>Menu Upload</h3>
        </div>

        <div className="row">
          <div className="col-md-6 form-group">
            <label>+ Select Date</label>
            <input
              type="date"
              className="form-control"
              value={menuDate}
              onChange={(e) => setMenuDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} // Today's date
            />
          </div>
          <div className="col-md-6 form-group">
            <label>+ Select Session</label>
            <select
              className="form-control"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              <option value="">Select Lunch / Dinner / Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Breakfast">Breakfast</option>
            </select>
          </div>
        </div>

        <div className="form-group mu-product-search-container">
          <label>+ Add Product (For that particular date and session)</label>
          <div className="mu-search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="mu-search-icon" />
          </div>
          {filteredProducts.length > 0 && (
            <div className="mu-search-results">
              {filteredProducts.map((product) => (
                <div key={product._id} className="mu-search-result-item">
                  <img
                    // 12. FIX: Use your 'Foodgallery' field
                    src={
                      product.Foodgallery[0]?.image2 ||
                      "/Assets/logo-container.svg"
                    }
                    alt={product.foodname}
                  />
                  <span>
                    {/* 13. FIX: Use your 'foodname' and 'foodprice' fields */}
                    {product.foodname} (₹{product.foodprice})
                  </span>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleAddProduct(product)}
                  >
                    <FaPlus /> ADD
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mu-added-list">
          <label>Added Lists</label>
          <div className="mu-added-list-items">
            {addedProducts.length === 0 ? (
              <p className="mu-no-items">No products added yet.</p>
            ) : (
              addedProducts.map((product) => (
                <span key={product._id} className="mu-added-item-tag">
                  {/* 14. FIX: Use your 'foodname' field */}
                  {product.foodname}
                  <button onClick={() => handleRemoveProduct(product._id)}>
                    <FaTimes />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div className="mu-footer">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleGoToAssignment}
          >
            Assign to Hub
          </button>
        </div>
      </div>
    </Box>
  );
};

export default MenuUpload;

// import React, { useState, useEffect } from "react";
// import { FaTimes, FaPlus, FaSearch, FaClock, FaBox } from "react-icons/fa";
// import "../../Styles/MenuUpload.css";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { Box, Tabs, Tab, Chip } from "@mui/material";
// import axios from "axios";

// const SAVE_API_URL = "http://localhost:7013/api/admin/hub-menu";
// const HUBS_API = "http://localhost:7013/api/Hub/hubs";
// const PRODUCTS_API = "http://localhost:7013/api/admin/getFoodItems";

// // Helper to check if date is in the future
// const isFutureDate = (dateString) => {
//   const selectedDate = new Date(dateString);
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   return selectedDate >= today;
// };

// const MenuUpload = () => {
//   const navigate = useNavigate();

//   // State for order type management
//   const [activeTab, setActiveTab] = useState(0); // 0 = PreOrder, 1 = Instant
//   const [cutoffTime, setCutoffTime] = useState("06:00"); // Default 6 AM cutoff

//   // View 1: Product Selection
//   const [menuDate, setMenuDate] = useState("");
//   const [session, setSession] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [masterProducts, setMasterProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [allHubs, setAllHubs] = useState([]);
//   const [addedProducts, setAddedProducts] = useState([]);

//   // View 2: Hub Assignment
//   const [view, setView] = useState("selection");
//   const [currentProductIndex, setCurrentProductIndex] = useState(0);
//   const [assignments, setAssignments] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [pageLoading, setPageLoading] = useState(true);
//   const [currentPriority, setCurrentPriority] = useState(1);

//   // Fetch initial data
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       setPageLoading(true);
//       try {
//         const [productsRes, hubsRes] = await Promise.all([
//           axios.get(PRODUCTS_API),
//           axios.get(HUBS_API),
//         ]);

//         if (productsRes.data && productsRes.data.data) {
//           setMasterProducts(productsRes.data.data);
//         } else {
//           toast.error("Could not parse products.");
//         }

//         if (hubsRes.data && Array.isArray(hubsRes.data)) {
//           setAllHubs(hubsRes.data);
//         } else {
//           toast.error("Could not parse hubs.");
//         }
//       } catch (err) {
//         console.error("Error fetching initial data:", err);
//         toast.error("Failed to load data. Please refresh.");
//       } finally {
//         setPageLoading(false);
//       }
//     };

//     fetchInitialData();
//   }, []);

//   // Handle product search
//   useEffect(() => {
//     if (searchTerm.trim() === "") {
//       setFilteredProducts([]);
//     } else {
//       setFilteredProducts(
//         masterProducts.filter((p) =>
//           p.foodname.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }
//   }, [searchTerm, masterProducts]);

//   // Validate date for PreOrder vs Instant
//   const validateOrderType = () => {
//     if (!menuDate) return true;

//     const selectedDate = new Date(menuDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (activeTab === 0) { // PreOrder
//       // PreOrder can only be set for future dates
//       if (selectedDate < today) {
//         toast.error("PreOrder can only be set for future dates (tomorrow or later)");
//         return false;
//       }
//     } else { // Instant
//       // Instant can only be set for today
//       if (selectedDate.getTime() !== today.getTime()) {
//         toast.error("Instant orders can only be set for today's date");
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleDateChange = (e) => {
//     const newDate = e.target.value;
//     setMenuDate(newDate);

//     // Auto-validate and adjust tab if needed
//     if (newDate) {
//       const selectedDate = new Date(newDate);
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       if (selectedDate > today && activeTab === 1) {
//         // If future date selected while on Instant tab, switch to PreOrder
//         setActiveTab(0);
//         toast.info("Future dates automatically set to PreOrder mode");
//       } else if (selectedDate.getTime() === today.getTime() && activeTab === 0) {
//         // If today selected while on PreOrder tab, switch to Instant
//         setActiveTab(1);
//         toast.info("Today's date automatically set to Instant mode");
//       }
//     }
//   };

//   // Handle add product with validation
//   const handleAddProduct = (product) => {
//     if (!menuDate || !session) {
//       toast.warn("Please select Date and Session first");
//       return;
//     }

//     if (!validateOrderType()) return;

//     if (!addedProducts.find((p) => p._id === product._id)) {
//       setAddedProducts([...addedProducts, product]);
//     }
//     setSearchTerm("");
//   };

//   const handleRemoveProduct = (productId) => {
//     setAddedProducts(addedProducts.filter((p) => p._id !== productId));
//     setAssignments((prev) => {
//       const newAssignments = { ...prev };
//       delete newAssignments[productId];
//       return newAssignments;
//     });
//   };

//   const handleGoToAssignment = () => {
//     if (!menuDate || !session) {
//       return toast.warn("Please select a Date and Session.");
//     }
//     if (addedProducts.length === 0) {
//       return toast.warn("Please add at least one product.");
//     }
//     if (!validateOrderType()) return;

//     // Initialize assignments for all products
//     const newAssignments = {};
//     for (const product of addedProducts) {
//       newAssignments[product._id] = {};
//       for (const hub of allHubs) {
//         newAssignments[product._id][hub._id] = {
//           hubId: hub._id,
//           hubPrice: product.foodprice,
//           preOrderPrice: product.foodprice,
//           // For Instant orders, manage quantity
//           instantQuantity: activeTab === 1 ? 10 : 0, // Default quantity for instant
//           remainingInstantQuantity: activeTab === 1 ? 10 : 0,
//           // For PreOrder, no quantity limit
//           isPreOrderAvailable: activeTab === 0,
//           isInstantAvailable: activeTab === 1,
//           hubPriority: 1,
//           isActive: true,
//         };
//       }
//     }
//     setAssignments(newAssignments);
//     setCurrentProductIndex(0);
//     setCurrentPriority(1);
//     setView("assignment");
//   };

//   const handleNextClick = () => {
//     if (currentProductIndex < addedProducts.length - 1) {
//       const currentProductId = addedProducts[currentProductIndex]._id;
//       const updatedAssignments = { ...assignments };

//       allHubs.forEach((hub) => {
//         if (updatedAssignments[currentProductId]?.[hub._id]?.isActive !== false) {
//           updatedAssignments[currentProductId][hub._id] = {
//             ...updatedAssignments[currentProductId][hub._id],
//             hubPriority: currentPriority,
//           };
//         }
//       });

//       setAssignments(updatedAssignments);
//       setCurrentProductIndex((i) => i + 1);
//       setCurrentPriority((prev) => prev + 1);
//     }
//   };

//   const handlePreviousClick = () => {
//     if (currentProductIndex > 0) {
//       setCurrentProductIndex((i) => i - 1);
//       setCurrentPriority(currentProductIndex);
//     }
//   };

//   const handleDeleteItem = () => {
//     const productToDelete = addedProducts[currentProductIndex];
//     if (!productToDelete) return;

//     const newAdded = addedProducts.filter((p, idx) => idx !== currentProductIndex);
//     setAddedProducts(newAdded);

//     setAssignments((prev) => {
//       const copy = { ...prev };
//       delete copy[productToDelete._id];
//       return copy;
//     });

//     if (newAdded.length === 0) {
//       setView("selection");
//       setCurrentProductIndex(0);
//       setCurrentPriority(1);
//     } else if (currentProductIndex >= newAdded.length) {
//       setCurrentProductIndex(newAdded.length - 1);
//       setCurrentPriority(newAdded.length);
//     } else {
//       setCurrentPriority(currentProductIndex + 1);
//     }
//   };

//   const handleSaveAllClick = async () => {
//     if (!menuDate || !session) {
//       toast.warn("Menu date and session are required.");
//       return;
//     }
//     if (!addedProducts || addedProducts.length === 0) {
//       toast.warn("No products to save.");
//       return;
//     }

//     // Update current product's priority
//     const currentProductId = addedProducts[currentProductIndex]._id;
//     const updatedAssignments = { ...assignments };

//     allHubs.forEach((hub) => {
//       if (updatedAssignments[currentProductId]?.[hub._id]?.isActive !== false) {
//         updatedAssignments[currentProductId][hub._id] = {
//           ...updatedAssignments[currentProductId][hub._id],
//           hubPriority: currentPriority,
//         };
//       }
//     });

//     setAssignments(updatedAssignments);

//     // Build items based on order type
//     const items = addedProducts
//       .map((product) => {
//         const hubObj = updatedAssignments[product._id] || {};
//         const hubData = Object.values(hubObj).map((h) => ({
//           hubId: h.hubId,
//           hubPrice: Number(h.hubPrice || product.foodprice || 0),
//           preOrderPrice: Number(h.preOrderPrice || product.foodprice || 0),
//           // For Instant orders, include quantity
//           ...(activeTab === 1 && {
//             instantQuantity: Number(h.instantQuantity || 0),
//             remainingInstantQuantity: Number(h.instantQuantity || 0),
//             isInstantAvailable: h.isInstantAvailable !== false,
//           }),
//           // For PreOrder, set availability flag
//           ...(activeTab === 0 && {
//             isPreOrderAvailable: true,
//           }),
//           hubPriority: Number(h.hubPriority || 0),
//           isActive: h.isActive !== undefined ? Boolean(h.isActive) : true,
//         }));

//         return {
//           productId: product._id,
//           menuDate,
//           session,
//           basePrice: Number(product.foodprice || 0),
//           hubData,
//           orderType: activeTab === 0 ? "PreOrder" : "Instant",
//         };
//       })
//       .filter((it) => Array.isArray(it.hubData) && it.hubData.length > 0);

//     if (items.length === 0) {
//       toast.warn("No hub assignments found to save.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post(`${SAVE_API_URL}/bulk`, { items });
//       if (res?.data?.success) {
//         toast.success(`${activeTab === 0 ? "PreOrder" : "Instant"} menu saved successfully.`);
//         setAddedProducts([]);
//         setAssignments({});
//         setView("selection");
//         setCurrentPriority(1);
//         navigate("/hub-product-mangement");
//       } else {
//         toast.error("Bulk save completed with issues.");
//       }
//     } catch (err) {
//       console.error("Bulk save error", err);
//       toast.error("Failed to save menus. See console.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAssignmentChange = (hubId, field, value) => {
//     const currentProductId = addedProducts[currentProductIndex]._id;
//     let numericValue = field === "isActive" ? value : (Number(value) < 0 ? 0 : Number(value));

//     setAssignments((prev) => ({
//       ...prev,
//       [currentProductId]: {
//         ...prev[currentProductId],
//         [hubId]: {
//           ...prev[currentProductId][hubId],
//           [field]: numericValue,
//         },
//       },
//     }));
//   };

//   const handleToggleHubActive = (hubId) => {
//     const currentProductId = addedProducts[currentProductIndex]._id;
//     setAssignments((prev) => ({
//       ...prev,
//       [currentProductId]: {
//         ...prev[currentProductId],
//         [hubId]: {
//           ...prev[currentProductId][hubId],
//           isActive: !prev[currentProductId][hubId].isActive,
//         },
//       },
//     }));
//   };

//   const handleCancel = () => {
//     setAddedProducts([]);
//     setAssignments({});
//     setCurrentProductIndex(0);
//     setCurrentPriority(1);
//     setView("selection");
//   };

//   const currentProduct = addedProducts[currentProductIndex];
//   const currentAssignments = assignments[currentProduct?._id] || {};

//   // Render loading state
//   if (pageLoading) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <div className="mu-container">
//           <h3>Loading Products and Hubs...</h3>
//         </div>
//       </Box>
//     );
//   }

//   // View 2: Hub Assignment
//   if (view === "assignment") {
//     return (
//       <Box sx={{ p: 3 }}>
//         <div className="mu-container">
//           <div className="mu-header">
//             <h3>
//               {activeTab === 0 ? "PreOrder" : "Instant"} - Assign to Hubs
//               <Chip
//                 icon={activeTab === 0 ? <FaClock /> : <FaBox />}
//                 label={activeTab === 0 ? "Unlimited Stock | Discount Applied" : "Limited Stock | Base Price"}
//                 color={activeTab === 0 ? "success" : "warning"}
//                 size="small"
//                 sx={{ ml: 2 }}
//               />
//             </h3>
//             <button onClick={handleCancel} className="btn btn-secondary">
//               Cancel & Go Back
//             </button>
//           </div>

//           <div className="mu-item-header">
//             <h4>
//               <span className="mu-item-counter">
//                 {currentProductIndex + 1}/{addedProducts.length}
//               </span>
//               {currentProduct.foodname} - ₹{currentProduct.foodprice}
//             </h4>
//             <button className="btn btn-danger btn-sm" onClick={handleDeleteItem}>
//               Delete ITEM
//             </button>
//           </div>

//           <div className="table-responsive">
//             <table className="table table-bordered mu-hub-table">
//               <thead>
//                 <tr>
//                   <th>Hub</th>
//                   {activeTab === 1 && <th>Instant Quantity</th>}
//                   <th>Hub Priority</th>
//                   <th>Hub Pricing</th>
//                   <th>Pre Order Pricing</th>
//                   <th>Option to close</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {allHubs.map((hub) => {
//                   const assignment = currentAssignments[hub._id];
//                   const isDisabled = !assignment?.isActive;
//                   return (
//                     <tr key={hub._id} className={isDisabled ? "row-disabled" : ""}>
//                       <td>{hub.hubName}</td>

//                       {activeTab === 1 && (
//                         <td>
//                           <input
//                             type="number"
//                             className="form-control"
//                             disabled={isDisabled}
//                             value={assignment?.instantQuantity || 0}
//                             onChange={(e) =>
//                               handleAssignmentChange(
//                                 hub._id,
//                                 "instantQuantity",
//                                 e.target.value,
//                               )
//                             }
//                             min="0"
//                           />
//                           {assignment?.instantQuantity > 0 && (
//                             <small className="text-muted">Available: {assignment?.instantQuantity}</small>
//                           )}
//                         </td>
//                       )}

//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           disabled={isDisabled}
//                           value={currentPriority}
//                           readOnly
//                           style={{
//                             fontWeight: "bold",
//                             backgroundColor: isDisabled ? "#f8f9fa" : "#e8f5e9",
//                             textAlign: "center",
//                           }}
//                         />
//                       </td>

//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           disabled={isDisabled}
//                           value={assignment?.hubPrice || 0}
//                           onChange={(e) =>
//                             handleAssignmentChange(
//                               hub._id,
//                               "hubPrice",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </td>

//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           disabled={isDisabled}
//                           value={assignment?.preOrderPrice || 0}
//                           onChange={(e) =>
//                             handleAssignmentChange(
//                               hub._id,
//                               "preOrderPrice",
//                               e.target.value,
//                             )
//                           }
//                         />
//                         {activeTab === 0 && assignment?.preOrderPrice && (
//                           <small className="text-success">
//                             Discount: ₹{(assignment?.hubPrice || 0) - (assignment?.preOrderPrice || 0)}
//                           </small>
//                         )}
//                       </td>

//                       <td>
//                         <button
//                           className={`btn ${
//                             isDisabled ? "btn-success" : "btn-danger"
//                           }`}
//                           onClick={() => handleToggleHubActive(hub._id)}
//                         >
//                           {isDisabled ? <FaPlus /> : <FaTimes />}
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           <div className="mu-footer">
//             <button
//               className="btn btn-outline-secondary"
//               onClick={handlePreviousClick}
//               disabled={currentProductIndex === 0 || loading}
//             >
//               Previous
//             </button>

//             {currentProductIndex === addedProducts.length - 1 ? (
//               <button
//                 className="btn btn-success"
//                 onClick={handleSaveAllClick}
//                 disabled={loading}
//               >
//                 {loading ? "Saving..." : `Save All ${activeTab === 0 ? "PreOrder" : "Instant"} Items`}
//               </button>
//             ) : (
//               <button
//                 className="btn btn-primary"
//                 onClick={handleNextClick}
//                 disabled={loading}
//               >
//                 Save & Next
//               </button>
//             )}
//           </div>
//         </div>
//       </Box>
//     );
//   }

//   // View 1: Product Selection
//   return (
//     <Box sx={{ p: 3 }}>
//       <div className="mu-container">
//         <div className="mu-header">
//           <h3>Menu Upload</h3>
//         </div>

//         {/* Order Type Tabs */}
//         <Tabs
//           value={activeTab}
//           onChange={(e, newValue) => {
//             if (menuDate) {
//               const selectedDate = new Date(menuDate);
//               const today = new Date();
//               today.setHours(0, 0, 0, 0);

//               if (newValue === 0 && selectedDate.getTime() === today.getTime()) {
//                 toast.error("PreOrder cannot be set for today. Please select a future date.");
//                 return;
//               }
//               if (newValue === 1 && selectedDate > today) {
//                 toast.error("Instant orders can only be set for today.");
//                 return;
//               }
//             }
//             setActiveTab(newValue);
//           }}
//           sx={{ mb: 3 }}
//         >
//           <Tab
//             label="PreOrder (Unlimited, Discounted)"
//             icon={<FaClock />}
//             iconPosition="start"
//           />
//           <Tab
//             label="Instant (Limited Stock, Base Price)"
//             icon={<FaBox />}
//             iconPosition="start"
//           />
//         </Tabs>

//         <div className="row">
//           <div className="col-md-6 form-group">
//             <label>+ Select Date</label>
//             <input
//               type="date"
//               className="form-control"
//               value={menuDate}
//               onChange={handleDateChange}
//               min={activeTab === 0 ? new Date(Date.now() + 86400000).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
//             />
//             <small className="text-muted">
//               {activeTab === 0
//                 ? "PreOrder: Order until 6 AM on delivery day, guaranteed availability"
//                 : "Instant: Limited stock, base price applies"}
//             </small>
//           </div>
//           <div className="col-md-6 form-group">
//             <label>+ Select Session</label>
//             <select
//               className="form-control"
//               value={session}
//               onChange={(e) => setSession(e.target.value)}
//             >
//               <option value="">Select Lunch / Dinner</option>
//               <option value="Lunch">Lunch</option>
//               <option value="Dinner">Dinner</option>
//             </select>
//           </div>
//         </div>

//         <div className="form-group mu-product-search-container">
//           <label>+ Add Product (For that particular date and session)</label>
//           <div className="mu-search-wrapper">
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Search product..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <FaSearch className="mu-search-icon" />
//           </div>
//           {filteredProducts.length > 0 && (
//             <div className="mu-search-results">
//               {filteredProducts.map((product) => (
//                 <div key={product._id} className="mu-search-result-item">
//                   <img
//                     src={product.Foodgallery[0]?.image2 || "/Assets/logo-container.svg"}
//                     alt={product.foodname}
//                   />
//                   <span>
//                     {product.foodname} (₹{product.foodprice})
//                   </span>
//                   <button
//                     className="btn btn-success btn-sm"
//                     onClick={() => handleAddProduct(product)}
//                   >
//                     <FaPlus /> ADD
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="mu-added-list">
//           <label>Added Lists ({activeTab === 0 ? "PreOrder Mode" : "Instant Mode"})</label>
//           <div className="mu-added-list-items">
//             {addedProducts.length === 0 ? (
//               <p className="mu-no-items">No products added yet.</p>
//             ) : (
//               addedProducts.map((product) => (
//                 <span key={product._id} className="mu-added-item-tag">
//                   {product.foodname}
//                   <button onClick={() => handleRemoveProduct(product._id)}>
//                     <FaTimes />
//                   </button>
//                 </span>
//               ))
//             )}
//           </div>
//         </div>

//         <div className="mu-footer">
//           <button
//             className="btn btn-primary btn-lg"
//             onClick={handleGoToAssignment}
//             disabled={!menuDate || !session || addedProducts.length === 0}
//           >
//             Assign to Hub
//           </button>
//         </div>
//       </div>
//     </Box>
//   );
// };

// export default MenuUpload;
