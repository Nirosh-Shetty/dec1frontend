import { useState,useEffect } from "react";
import { Card, Table, Button, Form, Row, Col, Badge } from "react-bootstrap";
import { FaSearch, FaFilter, FaDownload, FaUser, FaUtensils, FaCheckCircle, FaClock, FaTimesCircle, FaListAlt, FaCommentDots } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Admin.css"; 
import axios from "axios";
import moment from "moment";
const AdminPlanDashboard = () => {
  const [activeView, setActiveView] = useState("sales"); // 'sales' or 'orders'
  const [startDate, setStartDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState("Lunch");
  const [selectedHub, setSelectedHub] = useState("All Hubs");

  
  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed": return "success";
      case "Pending Payment": return "warning";
      case "Skipped": return "secondary";
      case "Cancelled": return "danger";
      default: return "primary";
    }
  };

  
  const [salesData, setSalesData] = useState([]); 
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(false);
const fetchDashboardData = async () => {
      if (!startDate || !selectedSession) return; // Don't fetch if filters incomplete
      
      setLoading(true);
      try {
          // Format date for API (YYYY-MM-DD)
          // Using local date string to avoid timezone shifts
          const dateStr = moment(startDate).format("YYYY-MM-DD");
          
          const params = {
              date: dateStr,
              session: selectedSession,
              hubId: selectedHub
          };

          if (activeView === 'sales') {
              const res = await axios.get("https://dailydish-backend.onrender.com/api/admin/plan/sales-tracker", { params });
              if(res.data.success) setSalesData(res.data.data);
          } else {
              const res = await axios.get("https://dailydish-backend.onrender.com/api/admin/plan/orders-tracker", { params });
              if(res.data.success) setOrdersData(res.data.data);
          }
      } catch (error) {
          console.error("Fetch error", error);
      } finally {
          setLoading(false);
      }
  };

  // --- 2. TRIGGER FETCH ON FILTER CHANGE OR TAB SWITCH ---
  useEffect(() => {
      fetchDashboardData();
  }, [activeView, startDate, selectedSession, selectedHub]);
  const totalOrders = ordersData.length;
  const confirmedOrders = ordersData.filter(o => o.status === "Confirmed").length;
  const pendingOrders = ordersData.filter(o => o.status === "Pending Payment").length;
  const cancelledOrders = ordersData.filter(o => o.status === "Skipped" || o.status === "Cancelled").length;

  // --- 2. EFFECT HOOK ---

  // --- 3. REMINDER HANDLER ---
  const handleSendReminders = async () => {
      if(!window.confirm(`Send WhatsApp reminder to pending customers?`)) return;
      try {
          const dateStr = startDate.toISOString().split('T')[0];
          const res = await axios.post("https://dailydish-backend.onrender.com/api/admin/plan/send-reminders", {
               date: dateStr, session: selectedSession, hubId: selectedHub
          });
          if(res.data.success) alert(res.data.message);
      } catch(e) { alert("Failed to send"); }
  };
  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
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
                variant={activeView === 'sales' ? 'success' : 'light'} 
                className={`rounded-pill px-4 fw-bold ${activeView === 'sales' ? '' : 'text-muted'}`}
                onClick={() => setActiveView('sales')}
                style={{minWidth: '160px'}}
            >
                <FaUtensils className="me-2"/> Sales Tracker
            </Button>
            <Button 
                variant={activeView === 'orders' ? 'success' : 'light'} 
                className={`rounded-pill px-4 fw-bold ${activeView === 'orders' ? '' : 'text-muted'}`}
                onClick={() => setActiveView('orders')}
                 style={{minWidth: '160px'}}
            >
                <FaListAlt className="me-2"/> Orders Tracker
            </Button>
        </div>
      </div>

      {/* --- COMMON FILTERS --- */}
      {/* Z-Index fix applied to this Card to ensure dropdowns float ABOVE the tables */}
      <Card className="shadow-sm border-0 mb-4" style={{ overflow: 'visible', zIndex: 10 }}> 
        <Card.Body className="py-3">
            <div className="row g-3 align-items-end">
                <div className="col-md-3">
                    <label className="small fw-bold text-muted mb-1">Select Date</label>
                    {/* Fixed Strategy prevents datepicker from being hidden */}
                    <DatePicker 
                        selected={startDate} 
                        onChange={(date) => setStartDate(date)} 
                        className="form-control"
                        popperProps={{ strategy: "fixed" }} 
                    />
                </div>
                <div className="col-md-3">
                    <label className="small fw-bold text-muted mb-1">Select Session</label>
                    <Form.Select value={selectedSession} onChange={(e)=>setSelectedSession(e.target.value)}>
                        <option>Lunch</option>
                        <option>Dinner</option>
                    </Form.Select>
                </div>
                <div className="col-md-3">
                    <label className="small fw-bold text-muted mb-1">Select Hub</label>
                    <Form.Select value={selectedHub} onChange={(e)=>setSelectedHub(e.target.value)}>
                        <option>All Hubs</option>
                        <option>Manyata Tech Park</option>
                        <option>Hebbal</option>
                    </Form.Select>
                </div>
                <div className="col-md-3 text-end">
                    <Button variant="outline-success" className="fw-bold">
                        <FaDownload className="me-2"/> Export Report
                    </Button>
                </div>
            </div>
        </Card.Body>
      </Card>

      {/* ========================================== */}
      {/* VIEW 1: PLANNED SALES TRACKER (Product Focus) */}
      {/* ========================================== */}
      {activeView === 'sales' && (
        <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom">
                <h5 className="m-0 fw-bold text-dark">Item Sales Performance</h5>
            </Card.Header>
            <Card.Body className="p-0">
                <Table hover responsive className="m-0 align-middle text-nowrap">
                    <thead className="bg-light text-uppercase small text-muted">
                        <tr>
                            <th className="py-3 ps-4">Item Name</th>
                            <th>Hub</th>
                            <th className="text-center">Total Rsrvd</th>
                            <th className="text-center">Confirmed</th>
                            <th className="text-center">Pending</th>
                            <th className="text-center">Skipped/Cancelled</th>
                            {/* Price Columns */}
                            <th className="text-center bg-light border-start">Base ₹</th>
                            <th className="text-center bg-light">Hub ₹</th>
                            <th className="text-center bg-warning bg-opacity-10 text-dark">Pre-Order ₹</th>
                            {/* Value Columns */}
                            <th className="text-end border-start">Est. Sales Value</th>
                            <th className="text-end pe-4 text-success">Achieved Sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesData.map((item) => {
                          
                            return (
                                <tr key={item.id}>
                                    <td className="ps-4 fw-bold text-dark">{item.foodName}</td>
                                    <td className="text-muted small">{item.hub?.hubName}</td>
                                    <td className="text-center fw-bold bg-light">{item.totalReserved}</td>
                                    <td className="text-center text-success fw-bold">{item.confirmed}</td>
                                    <td className="text-center text-warning fw-bold">{item.pending}</td>
                                    <td className="text-center text-danger">{item.skipped}</td>
                                    
                                    <td className="text-center border-start text-muted">{item.basePrice}</td>
                                    <td className="text-center text-muted">{item.hubPrice}</td>
                                    <td className="text-center fw-bold bg-warning bg-opacity-10">{item.preOrderPrice}</td>
                                    
                                    <td className="text-end border-start text-muted">₹{item?.estSalesValue}</td>
                                    <td className="text-end pe-4 fw-bolder text-success">₹{item?.achievedSales}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
      )}

      {/* ========================================== */}
      {/* VIEW 2: PLANNED ORDERS TRACKER (User Focus) */}
      {/* ========================================== */}
      {activeView === 'orders' && (
        <>
            {/* KPI BOXES */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm border-start border-4 border-primary p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Total Orders</div>
                                <h3 className="fw-bold text-dark mb-0">{totalOrders}</h3>
                            </div>
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle-no-border text-primary">
                                <FaListAlt size={24} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm border-start border-4 border-success p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Confirmed</div>
                                <h3 className="fw-bold text-success mb-0">{confirmedOrders}</h3>
                            </div>
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle-no-border text-success">
                                <FaCheckCircle size={24} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm border-start border-4 border-warning p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Yet to Confirm</div>
                                <h3 className="fw-bold text-warning mb-0">{pendingOrders}</h3>
                            </div>
                            <div className="bg-warning bg-opacity-10 p-3 rounded-circle-no-border text-warning">
                                <FaClock size={24} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm border-start border-4 border-danger p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Skip / Cancel</div>
                                <h3 className="fw-bold text-danger mb-0">{cancelledOrders}</h3>
                            </div>
                            <div className="bg-danger bg-opacity-10 p-3 rounded-circle-no-border text-danger">
                                <FaTimesCircle size={24} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* ORDERS TABLE */}
            <Card className="shadow-sm border-0">
                 <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <h5 className="m-0 fw-bold text-dark">Customer Orders</h5>
                        <div className="input-group" style={{maxWidth: '300px'}}>
                            <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted"/></span>
                            <Form.Control placeholder="Search customer..." className="border-start-0 bg-light shadow-none" />
                        </div>
                    </div>

                    {/* --- NEW ACTION BUTTON --- */}
                    {pendingOrders > 0 && (
                        <Button 
                            variant="warning" 
                            className="text-dark fw-bold shadow-sm"
                            onClick={handleSendReminders}
                        >
                            <FaCommentDots className="me-2"/> 
                            Send Reminder to {pendingOrders} Pending
                        </Button>
                    )}
                    {/* ------------------------- */}

                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="m-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="py-3 ps-4">Customer Name</th>
                                <th>Contact</th>
                                <th>Items</th>
                                <th>Total Value</th>
                                <th>Status</th>
                                <th>Session</th>
                                <th>Hub</th>
                                <th className="pe-4 text-end">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersData.map((order) => (
                                <tr key={order.id}>
                                    <td className="ps-4 fw-bold text-dark">{order.customerName}</td>
                                    <td>{order.contact}</td>
                                    <td style={{maxWidth: '250px'}} title={order.items}>
                                        <small className="text-dark bg-light px-2 py-1 rounded border">
                                            {order.items}
                                        </small>
                                    </td>
                                    <td className="fw-bold">₹{order.value}</td>
                                    <td>
                                        <Badge bg={getStatusBadge(order.status)} pill className="px-3">
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td>{order.session}</td>
                                    <td>{order.hub?.hubName}</td>
                                    <td className="text-end pe-4 text-muted">{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </>
      )}
    </div>
  );
};

export default AdminPlanDashboard;