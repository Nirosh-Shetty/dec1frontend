import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import moment from "moment";
import ReactPaginate from "react-paginate";
import {
  Modal,
  Button,
  Form,
  Spinner,
  Alert,
  Table,
  Badge,
  Card,
  Row,
  Col,
  Tabs,
  Tab,
  Accordion,
} from "react-bootstrap";
import "./HubList.css";
import AreaSelector from "../Map/AreaSelector";

const HubList = () => {
  // Modal states
  const [showAddHub, setShowAddHub] = useState(false);
  const [showEditHub, setShowEditHub] = useState(false);
  const [showDeleteHub, setShowDeleteHub] = useState(false);
  const [showViewAllPolygons, setShowViewAllPolygons] = useState(false);
  const [showCutoffSettings, setShowCutoffSettings] = useState(false);
  const [showOrderModeModal, setShowOrderModeModal] = useState(false);
  const [showMinCartModal, setShowMinCartModal] = useState(false);
  const [showBulkMinCartModal, setShowBulkMinCartModal] = useState(false);

  // Hub data states
  const [hubs, setHubs] = useState([]);
  const [noChangeData, setNoChangeData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Add/Edit/Delete hub states
  const [newHub, setNewHub] = useState({
    hubName: "",
    locations: [],
    geometry: null,
    orderMode: "preorder",
    minCart: 0,
    cutoffTimes: {
      breakfast: {
        defaultCutoff: "00:00",
        employeeCutoff: "10:00",
      },
      lunch: {
        defaultCutoff: "00:00",
        employeeCutoff: "10:00",
      },
      dinner: {
        defaultCutoff: "00:00",
        employeeCutoff: "10:00",
      },
    },
  });

  const [editHub, setEditHub] = useState({
    hubId: "",
    hubName: "",
    locations: [],
    geometry: null,
    orderMode: "preorder",
    minCart: 0,
    cutoffTimes: {
      breakfast: {
        defaultCutoff: "00:00",
        employeeCutoff: "10:00",
      },
      lunch: {
        defaultCutoff: "00:00",
        employeeCutoff: "10:00",
      },
      dinner: {
        defaultCutoff: "00:00",
        employeeCutoff: "10:00",
      },
    },
  });

  const [selectedHub, setSelectedHub] = useState(null);
  const [selectedHubForCutoff, setSelectedHubForCutoff] = useState(null);
  const [selectedHubForOrderMode, setSelectedHubForOrderMode] = useState(null);
  const [selectedHubForMinCart, setSelectedHubForMinCart] = useState(null);
  const [bulkMinCartValue, setBulkMinCartValue] = useState(0);
  
  const [addHubLoading, setAddHubLoading] = useState(false);
  const [editHubLoading, setEditHubLoading] = useState(false);
  const [deleteHubLoading, setDeleteHubLoading] = useState(false);
  const [cutoffLoading, setCutoffLoading] = useState(false);
  const [orderModeLoading, setOrderModeLoading] = useState(false);
  const [minCartLoading, setMinCartLoading] = useState(false);
  const [bulkMinCartLoading, setBulkMinCartLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Pagination states
  const [pageNumber, setPageNumber] = useState(0);
  const hubsPerPage = 10;
  const pagesVisited = pageNumber * hubsPerPage;
  const pageCount = Math.ceil(hubs.length / hubsPerPage);

  // Location data states
  const [corporateLocations, setCorporateLocations] = useState([]);
  const [apartmentLocations, setApartmentLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

  // Token from localStorage
  const token = localStorage.getItem("authToken");

  // Fetch corporate locations
  const getCorporateLocations = useCallback(async () => {
    try {
      const res = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/admin/getcorporate",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.status === 200) {
        setCorporateLocations(res.data.corporatedata);
      }
    } catch (error) {
      console.error("Error fetching corporate locations:", error);
      showToast("Failed to fetch corporate locations.", "error");
    }
  }, [token]);

  // Fetch apartment locations
  const getApartmentLocations = useCallback(async () => {
    try {
      const res = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/admin/getapartment",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.status === 200) {
        setApartmentLocations(res.data.corporatedata);
      }
    } catch (error) {
      console.error("Error fetching apartment locations:", error);
      showToast("Failed to fetch apartment locations.", "error");
    }
  }, [token]);

  // Combine all locations
  useEffect(() => {
    const combinedLocations = [
      ...corporateLocations.map((loc) => ({
        value: `${loc.Apartmentname}, ${loc.Address}, ${loc.pincode}`,
        label: `${loc.Apartmentname}, ${loc.Address}, ${loc.pincode}`,
        type: "Corporate",
      })),
      ...apartmentLocations.map((loc) => ({
        value: `${loc.Apartmentname}, ${loc.Address}, ${loc.pincode}`,
        label: `${loc.Apartmentname}, ${loc.Address}, ${loc.pincode}`,
        type: "Apartment",
      })),
    ];
    setAllLocations(combinedLocations);
  }, [corporateLocations, apartmentLocations]);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch hubs
  const getHubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://dd-backend-3nm0.onrender.com/api/Hub/hubs",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setHubs(res.data);
      setNoChangeData(res.data);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch hubs.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Get default cutoff times based on order mode
  const getDefaultCutoffTimes = (orderMode) => {
    const defaultCutoff = orderMode === "preorder" ? "00:00" : "10:00";
    const employeeCutoff = "10:00";

    return {
      breakfast: { defaultCutoff, employeeCutoff },
      lunch: { defaultCutoff, employeeCutoff },
      dinner: { defaultCutoff, employeeCutoff },
    };
  };

  // Handle order mode change for new hub
  const handleNewHubOrderModeChange = (mode) => {
    const defaultCutoffTimes = getDefaultCutoffTimes(mode);
    setNewHub({
      ...newHub,
      orderMode: mode,
      cutoffTimes: defaultCutoffTimes,
    });
  };

  // Handle order mode change for edit hub
  const handleEditHubOrderModeChange = (mode) => {
    const defaultCutoffTimes = getDefaultCutoffTimes(mode);
    setEditHub({
      ...editHub,
      orderMode: mode,
      cutoffTimes: defaultCutoffTimes,
    });
  };

  // Add Hub
  const handleAddHub = async () => {
    if (!newHub.hubName.trim()) {
      showToast("Hub name is required.", "error");
      return;
    }
    if (!newHub.geometry) {
      showToast("Please draw a service area polygon on the map.", "error");
      return;
    }
    if (newHub.minCart < 0 || isNaN(newHub.minCart)) {
      showToast("Minimum cart value must be a non-negative number.", "error");
      return;
    }
    setAddHubLoading(true);
    try {
      const res = await axios.post(
        "https://dd-backend-3nm0.onrender.com/api/Hub/hubs",
        {
          hubName: newHub.hubName.trim(),
          locations: newHub.locations,
          geometry: newHub.geometry,
          orderMode: newHub.orderMode,
          minCart: newHub.minCart,
          cutoffTimes: newHub.cutoffTimes,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.status === 201) {
        showToast("Hub added successfully");
        setShowAddHub(false);
        setNewHub({
          hubName: "",
          locations: [],
          geometry: null,
          orderMode: "preorder",
          minCart: 0,
          cutoffTimes: getDefaultCutoffTimes("preorder"),
        });
        getHubs();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to add hub.",
        "error",
      );
    } finally {
      setAddHubLoading(false);
    }
  };

  // Edit Hub
  const handleEditHub = async () => {
    if (!editHub.hubName.trim()) {
      showToast("Hub name is required.", "error");
      return;
    }
    if (editHub.minCart < 0 || isNaN(editHub.minCart)) {
      showToast("Minimum cart value must be a non-negative number.", "error");
      return;
    }
    setEditHubLoading(true);
    try {
      const payload = {
        hubName: editHub.hubName.trim(),
        locations: editHub.locations || [],
        orderMode: editHub.orderMode,
        minCart: editHub.minCart,
      };

      if (editHub.geometry) {
        payload.geometry = editHub.geometry;
      }

      const res = await axios.put(
        `https://dd-backend-3nm0.onrender.com/api/Hub/hubs/${editHub.hubId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.status === 200) {
        showToast("Hub updated successfully");
        setShowEditHub(false);
        getHubs();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to update hub.",
        "error",
      );
    } finally {
      setEditHubLoading(false);
    }
  };

  // Update Order Mode
  const handleUpdateOrderMode = async () => {
    if (!selectedHubForOrderMode) return;

    setOrderModeLoading(true);
    try {
      const res = await axios.put(
        `https://dd-backend-3nm0.onrender.com/api/Hub/update-order-mode/${selectedHubForOrderMode.hubId}`,
        {
          orderMode: selectedHubForOrderMode.orderMode,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.status === 200) {
        showToast(
          `Order mode updated to ${selectedHubForOrderMode.orderMode}. ` +
            `${res.data.propagationStats?.customers || 0} customer addresses, ` +
            `${res.data.propagationStats?.orders || 0} orders, and ` +
            `${res.data.propagationStats?.mealPlans || 0} meal plans updated.`,
        );
        setShowOrderModeModal(false);
        getHubs();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to update order mode.",
        "error",
      );
    } finally {
      setOrderModeLoading(false);
    }
  };

  // Update Min Cart
  const handleUpdateMinCart = async () => {
    if (!selectedHubForMinCart) return;

    if (selectedHubForMinCart.minCart < 0 || isNaN(selectedHubForMinCart.minCart)) {
      showToast("Minimum cart value must be a non-negative number.", "error");
      return;
    }

    setMinCartLoading(true);
    try {
      const res = await axios.put(
        `https://dd-backend-3nm0.onrender.com/api/Hub/update-min-cart/${selectedHubForMinCart.hubId}`,
        {
          minCart: selectedHubForMinCart.minCart,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.status === 200) {
        showToast(
          `Minimum cart value updated to ₹${selectedHubForMinCart.minCart}. ` +
            `${res.data.propagationStats?.customers || 0} customer addresses, ` +
            `${res.data.propagationStats?.orders || 0} orders, and ` +
            `${res.data.propagationStats?.mealPlans || 0} meal plans updated.`,
        );
        setShowMinCartModal(false);
        getHubs();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to update minimum cart value.",
        "error",
      );
    } finally {
      setMinCartLoading(false);
    }
  };

  // Bulk Update Min Cart
  const handleBulkUpdateMinCart = async () => {
    if (bulkMinCartValue < 0 || isNaN(bulkMinCartValue)) {
      showToast("Minimum cart value must be a non-negative number.", "error");
      return;
    }

    setBulkMinCartLoading(true);
    try {
      const res = await axios.put(
        "https://dd-backend-3nm0.onrender.com/api/Hub/bulk-update-min-cart",
        {
          minCart: bulkMinCartValue,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.status === 200) {
        showToast(
          `Bulk update completed! ${res.data.modifiedCount} hubs updated. ` +
            `${res.data.propagationStats?.customers || 0} customer addresses, ` +
            `${res.data.propagationStats?.orders || 0} orders, and ` +
            `${res.data.propagationStats?.mealPlans || 0} meal plans updated.`,
        );
        setShowBulkMinCartModal(false);
        setBulkMinCartValue(0);
        getHubs();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to bulk update minimum cart value.",
        "error",
      );
    } finally {
      setBulkMinCartLoading(false);
    }
  };

  // Delete Hub
  const handleDeleteHub = async () => {
    setDeleteHubLoading(true);
    try {
      const res = await axios.delete(
        `https://dd-backend-3nm0.onrender.com/api/Hub/hubs/${selectedHub.hubId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.status === 200) {
        showToast("Hub deleted successfully");
        setShowDeleteHub(false);
        setSelectedHub(null);
        getHubs();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to delete hub.",
        "error",
      );
    } finally {
      setDeleteHubLoading(false);
    }
  };

  // Update Cutoff Times
  const handleUpdateCutoffTimes = async () => {
    if (!selectedHubForCutoff) return;

    setCutoffLoading(true);
    try {
      const res = await axios.put(
        `https://dd-backend-3nm0.onrender.com/api/Hub/update-cutoff-times/${selectedHubForCutoff.hubId}`,
        {
          cutoffTimes: selectedHubForCutoff.cutoffTimes,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.status === 200) {
        showToast("Cutoff times updated successfully");
        setShowCutoffSettings(false);
        getHubs();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to update cutoff times.",
        "error",
      );
    } finally {
      setCutoffLoading(false);
    }
  };

  // Search filter
  const handleFilter = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
    setPageNumber(0);
    if (searchTerm) {
      const filteredData = noChangeData.filter((hub) => {
        const hubName = hub.hubName ? hub.hubName.toLowerCase() : "";
        const hubId = hub.hubId ? hub.hubId.toLowerCase() : "";
        const locations = hub.locations
          ? hub.locations.join(" ").toLowerCase()
          : "";
        return (
          hubName.includes(searchTerm) ||
          hubId.includes(searchTerm) ||
          locations.includes(searchTerm)
        );
      });
      setHubs(filteredData);
    } else {
      setHubs(noChangeData);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    setLoading(true);
    try {
      const customHeaders = noChangeData.map((item) => ({
        "Hub ID": item.hubId || "N/A",
        "Hub Name": item.hubName || "N/A",
        "Order Mode": item.orderMode || "preorder",
        "Minimum Cart (₹)": item.minCart || 0,
        "Total Locations": item.locations ? item.locations.length : 0,
        Locations: item.locations ? item.locations.join(", ") : "N/A",
        "Breakfast Default Cutoff":
          item.cutoffTimes?.breakfast?.defaultCutoff || "00:00",
        "Breakfast Employee Cutoff":
          item.cutoffTimes?.breakfast?.employeeCutoff || "10:00",
        "Lunch Default Cutoff":
          item.cutoffTimes?.lunch?.defaultCutoff || "00:00",
        "Lunch Employee Cutoff":
          item.cutoffTimes?.lunch?.employeeCutoff || "10:00",
        "Dinner Default Cutoff":
          item.cutoffTimes?.dinner?.defaultCutoff || "00:00",
        "Dinner Employee Cutoff":
          item.cutoffTimes?.dinner?.employeeCutoff || "10:00",
      }));
      const worksheet = XLSX.utils.json_to_sheet(customHeaders);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Hub List");
      XLSX.writeFile(workbook, `HubList_${moment().format("YYYYMMDD")}.xlsx`);
      showToast("Exported to Excel successfully");
    } catch (e) {
      console.error(e);
      showToast("Failed to export to Excel.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const changePage = ({ selected }) => setPageNumber(selected);

  // Fetch data on mount
  useEffect(() => {
    getHubs();
    getCorporateLocations();
    getApartmentLocations();
  }, [getHubs, getCorporateLocations, getApartmentLocations]);

  // Get location type badge
  const getLocationBadge = (location) => {
    const locationData = allLocations.find((loc) => loc.value === location);
    return locationData ? (
      <Badge
        bg={locationData.type === "Corporate" ? "info" : "success"}
        className="me-1 mb-1"
      >
        {locationData.type}
      </Badge>
    ) : null;
  };

  // Get order mode badge
  const getOrderModeBadge = (orderMode) => {
    return orderMode === "preorder" ? (
      <Badge bg="warning" text="dark">
        📋 Preorder
      </Badge>
    ) : (
      <Badge bg="success">⚡ Instant</Badge>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Order Mode Selector Component
  const OrderModeSelector = ({ orderMode, onChange, disabled = false }) => {
    return (
      <div className="order-mode-selector mb-3">
        <Form.Label className="fw-bold">Order Mode</Form.Label>
        <div className="d-flex gap-3">
          <Form.Check
            type="radio"
            id="preorder-mode"
            label={
              <span>
                <Badge bg="warning" text="dark" className="me-2">
                  📋 Preorder
                </Badge>
                <span className="text-muted">
                  (Default cutoff: Previous day midnight)
                </span>
              </span>
            }
            name="orderMode"
            value="preorder"
            checked={orderMode === "preorder"}
            onChange={() => onChange("preorder")}
            disabled={disabled}
          />
          <Form.Check
            type="radio"
            id="instant-mode"
            label={
              <span>
                <Badge bg="success" className="me-2">
                  ⚡ Instant
                </Badge>
                <span className="text-muted">
                  (Default cutoff: Same day 10:00 AM)
                </span>
              </span>
            }
            name="orderMode"
            value="instant"
            checked={orderMode === "instant"}
            onChange={() => onChange("instant")}
            disabled={disabled}
          />
        </div>
        <Form.Text className="text-muted">
          {orderMode === "preorder"
            ? "Preorder mode: Customers must order by previous day midnight. Employees can order same day until 10:00 AM."
            : "Instant mode: Both customers and employees can order same day until cutoff time (default 10:00 AM)."}
        </Form.Text>
      </div>
    );
  };

  // Cutoff Time Input Component
  const CutoffTimeInput = ({
    label,
    session,
    cutoffTimes,
    onChange,
    orderMode,
  }) => {
    return (
      <div className="mb-3 p-3 border rounded">
        <h6 className="mb-3">{label}</h6>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small">
                <Badge bg="secondary" className="me-1">
                  Regular Customers
                </Badge>
                Cutoff Time
                {orderMode === "preorder" && (
                  <Badge bg="info" className="ms-1">
                    Previous Day
                  </Badge>
                )}
              </Form.Label>
              <Form.Control
                type="time"
                value={cutoffTimes[session]?.defaultCutoff || "00:00"}
                onChange={(e) =>
                  onChange(session, "defaultCutoff", e.target.value)
                }
                step="60"
              />
              <Form.Text className="text-muted small">
                {orderMode === "preorder"
                  ? "Orders must be placed by this time on the previous day"
                  : "Orders must be placed by this time on the same day"}
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small">
                <Badge bg="primary" className="me-1">
                  Employees
                </Badge>
                Cutoff Time (Same Day)
              </Form.Label>
              <Form.Control
                type="time"
                value={cutoffTimes[session]?.employeeCutoff || "10:00"}
                onChange={(e) =>
                  onChange(session, "employeeCutoff", e.target.value)
                }
                step="60"
              />
              <Form.Text className="text-muted small">
                Employees can order on the same day until this time
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
      </div>
    );
  };

  // Location selector component
  const LocationSelector = ({
    selectedLocations,
    onLocationChange,
    disabled = false,
  }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredLocations = allLocations.filter((location) =>
      location.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleLocationToggle = (locationValue) => {
      const newLocations = selectedLocations.includes(locationValue)
        ? selectedLocations.filter((loc) => loc !== locationValue)
        : [...selectedLocations, locationValue];
      onLocationChange(newLocations);
    };

    return (
      <div className="location-selector">
        <div className="selected-locations mb-2">
          {selectedLocations.map((location) => (
            <Badge
              key={location}
              bg="primary"
              className="me-1 mb-1 d-flex align-items-center"
              style={{ fontSize: "0.75rem" }}
            >
              {location.split(",")[0]}
              <button
                type="button"
                className="btn-close btn-close-white ms-1"
                style={{ fontSize: "0.5rem" }}
                onClick={() => handleLocationToggle(location)}
                disabled={disabled}
              />
            </Badge>
          ))}
        </div>
        <div className="dropdown">
          <Form.Control
            type="text"
            placeholder="Search and select locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            disabled={disabled}
          />
          {isDropdownOpen && (
            <div
              className="dropdown-menu show w-100"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {filteredLocations.map((location) => (
                <div
                  key={location.value}
                  className={`dropdown-item d-flex align-items-center justify-content-between ${
                    selectedLocations.includes(location.value) ? "active" : ""
                  }`}
                  onClick={() => handleLocationToggle(location.value)}
                  style={{ cursor: "pointer" }}
                >
                  <span>{location.label}</span>
                  <Badge
                    bg={location.type === "Corporate" ? "info" : "success"}
                  >
                    {location.type}
                  </Badge>
                </div>
              ))}
              {filteredLocations.length === 0 && (
                <div className="dropdown-item text-muted">
                  No locations found
                </div>
              )}
            </div>
          )}
        </div>
        <div className="d-flex justify-content-end mt-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setIsDropdownOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="hub-list">
      {/* Toast Notification */}
      <Alert
        variant={toast.type === "success" ? "success" : "danger"}
        show={toast.show}
        className="hub-list-toast position-fixed"
        style={{ top: "20px", right: "20px", zIndex: 1050 }}
      >
        {toast.message}
      </Alert>

      {/* Loading Overlay */}
      {loading && (
        <div
          className="hub-list-loading-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }}
        >
          <div className="text-center">
            <Spinner animation="border" variant="light" />
            <div className="text-light mt-2">Loading...</div>
          </div>
        </div>
      )}

      <Card className="shadow-sm">
        <Card.Header className="text-white" style={{ background: "#fe4500" }}>
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-0">Hub Management</h4>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2">
                <Button
                  variant="outline-light"
                  onClick={() => setShowViewAllPolygons(true)}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  🗺️ View All Polygons
                </Button>
                <Button
                  variant="outline-light"
                  onClick={() => setShowBulkMinCartModal(true)}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  💰 Bulk Update Min Cart
                </Button>
                <Button
                  variant="outline-light"
                  onClick={handleExportExcel}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : null}
                  Export Excel
                </Button>
                <Button
                  variant="light"
                  onClick={() => setShowAddHub(true)}
                  disabled={loading}
                >
                  + Add Hub
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Search and Stats */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="🔍 Search by Hub Name, ID, or Locations..."
                value={search}
                onChange={handleFilter}
                className="shadow-sm"
              />
            </Col>
            <Col
              md={6}
              className="d-flex align-items-center justify-content-end"
            >
              <div className="text-muted">
                <strong>{hubs.length}</strong> hubs found
              </div>
            </Col>
          </Row>

          {/* Hub Table */}
          <div className="table-responsive">
            <Table striped hover className="shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th width="5%">SL.NO</th>
                  <th width="8%">Hub ID</th>
                  <th width="10%">Hub Name</th>
                  <th width="8%">Mode</th>
                  <th width="8%">Min Cart</th>
                  {/* <th width="18%">Locations</th> */}
                  <th width="18%">Cutoff Times</th>
                  <th width="25%">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hubs.length > 0 ? (
                  hubs
                    .slice(pagesVisited, pagesVisited + hubsPerPage)
                    .map((hub, i) => (
                      <tr key={hub._id}>
                        <td className="align-middle">{i + 1 + pagesVisited}</td>
                        <td className="align-middle">
                          <Badge bg="secondary">{hub.hubId || "N/A"}</Badge>
                        </td>
                        <td className="align-middle">
                          <strong>{hub.hubName || "N/A"}</strong>
                        </td>
                        <td className="align-middle">
                          {getOrderModeBadge(hub.orderMode || "preorder")}
                        </td>
                        <td className="align-middle">
                          <Badge bg="info" className="fs-6">
                            {formatCurrency(hub.minCart || 0)}
                          </Badge>
                        </td>
                        {/* <td className="align-middle">
                          <div className="d-flex flex-wrap gap-1">
                            {hub.locations && hub.locations.length > 0 ? (
                              hub.locations.map((location, index) => (
                                <div key={index}>
                                  <Badge className="me-1">{location}</Badge>
                                  {getLocationBadge(location)}
                                </div>
                              ))
                            ) : (
                              <span className="text-muted">No locations</span>
                            )}
                          </div>
                          {hub.locations && hub.locations.length > 0 && (
                            <small className="text-muted d-block">
                              {hub.locations.length} location(s)
                            </small>
                          )}
                        </td> */}
                        <td className="align-middle">
                          <Accordion>
                            <Accordion.Item eventKey="0">
                              <Accordion.Header className="p-0">
                                <small>View Cutoff Times</small>
                              </Accordion.Header>
                              <Accordion.Body className="p-2">
                                <div className="small">
                                  <div className="mb-1">
                                    <Badge bg="secondary">Breakfast</Badge>
                                    <div>
                                      Regular:{" "}
                                      {hub.cutoffTimes?.breakfast
                                        ?.defaultCutoff || "00:00"}
                                    </div>
                                    <div>
                                      Employee:{" "}
                                      {hub.cutoffTimes?.breakfast
                                        ?.employeeCutoff || "10:00"}
                                    </div>
                                  </div>
                                  <div className="mb-1">
                                    <Badge bg="secondary">Lunch</Badge>
                                    <div>
                                      Regular:{" "}
                                      {hub.cutoffTimes?.lunch?.defaultCutoff ||
                                        "00:00"}
                                    </div>
                                    <div>
                                      Employee:{" "}
                                      {hub.cutoffTimes?.lunch?.employeeCutoff ||
                                        "10:00"}
                                    </div>
                                  </div>
                                  <div>
                                    <Badge bg="secondary">Dinner</Badge>
                                    <div>
                                      Regular:{" "}
                                      {hub.cutoffTimes?.dinner?.defaultCutoff ||
                                        "00:00"}
                                    </div>
                                    <div>
                                      Employee:{" "}
                                      {hub.cutoffTimes?.dinner
                                        ?.employeeCutoff || "10:00"}
                                    </div>
                                  </div>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        </td>
                        <td className="align-middle">
                          <div className="d-flex gap-1 flex-wrap">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setEditHub({
                                  hubId: hub.hubId,
                                  hubName: hub.hubName,
                                  locations: hub.locations || [],
                                  geometry: hub.geometry || null,
                                  orderMode: hub.orderMode || "preorder",
                                  minCart: hub.minCart || 0,
                                  cutoffTimes:
                                    hub.cutoffTimes ||
                                    getDefaultCutoffTimes(
                                      hub.orderMode || "preorder",
                                    ),
                                });
                                setShowEditHub(true);
                              }}
                              disabled={loading}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => {
                                setSelectedHubForCutoff({
                                  hubId: hub.hubId,
                                  hubName: hub.hubName,
                                  orderMode: hub.orderMode || "preorder",
                                  cutoffTimes: {
                                    breakfast: hub.cutoffTimes?.breakfast || {
                                      defaultCutoff: "00:00",
                                      employeeCutoff: "10:00",
                                    },
                                    lunch: hub.cutoffTimes?.lunch || {
                                      defaultCutoff: "00:00",
                                      employeeCutoff: "10:00",
                                    },
                                    dinner: hub.cutoffTimes?.dinner || {
                                      defaultCutoff: "00:00",
                                      employeeCutoff: "10:00",
                                    },
                                  },
                                });
                                setShowCutoffSettings(true);
                              }}
                              disabled={loading}
                            >
                              ⏰ Cutoff
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => {
                                setSelectedHubForOrderMode({
                                  hubId: hub.hubId,
                                  hubName: hub.hubName,
                                  orderMode: hub.orderMode || "preorder",
                                });
                                setShowOrderModeModal(true);
                              }}
                              disabled={loading}
                            >
                              🔄 Mode
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => {
                                setSelectedHubForMinCart({
                                  hubId: hub.hubId,
                                  hubName: hub.hubName,
                                  minCart: hub.minCart || 0,
                                });
                                setShowMinCartModal(true);
                              }}
                              disabled={loading}
                            >
                              💰 Min Cart
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedHub(hub);
                                setShowDeleteHub(true);
                              }}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="text-muted">
                        {search
                          ? "No hubs found matching your search."
                          : "No hubs available."}
                      </div>
                     </td>
                   </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {hubs.length > hubsPerPage && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted">
                Showing {pagesVisited + 1} to{" "}
                {Math.min(pagesVisited + hubsPerPage, hubs.length)} of{" "}
                {hubs.length} entries
              </div>
              <ReactPaginate
                previousLabel="← Previous"
                nextLabel="Next →"
                pageCount={pageCount}
                onPageChange={changePage}
                containerClassName="pagination mb-0"
                previousLinkClassName="page-link"
                nextLinkClassName="page-link"
                disabledClassName="disabled"
                activeClassName="active"
                pageLinkClassName="page-link"
                pageClassName="page-item"
                previousClassName="page-item"
                nextClassName="page-item"
              />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Hub Modal */}
      <Modal
        show={showAddHub}
        onHide={() => setShowAddHub(false)}
        size="xl"
        fullscreen
        style={{ zIndex: 99999 }}
      >
        <Modal.Header
          closeButton
          className="text-white"
          style={{ background: "#fe4500" }}
        >
          <Modal.Title className="text-white">Add New Hub</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <Tabs defaultActiveKey="basic" className="mb-3">
            <Tab eventKey="basic" title="Basic Information">
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Hub Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newHub.hubName}
                    onChange={(e) =>
                      setNewHub({ ...newHub, hubName: e.target.value })
                    }
                    placeholder="Enter hub name"
                    className="shadow-sm"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    Minimum Cart Value (₹)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={newHub.minCart}
                    onChange={(e) =>
                      setNewHub({ ...newHub, minCart: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Enter minimum cart amount"
                    className="shadow-sm"
                    min="0"
                    step="0.01"
                  />
                  <Form.Text className="text-muted">
                    Minimum order value required for this hub (applies to all meal sessions)
                  </Form.Text>
                </Form.Group>

                <OrderModeSelector
                  orderMode={newHub.orderMode}
                  onChange={handleNewHubOrderModeChange}
                  disabled={addHubLoading}
                />

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Locations ({newHub.locations.length} selected)
                  </Form.Label>
                  <LocationSelector
                    selectedLocations={newHub.locations}
                    onLocationChange={(locations) =>
                      setNewHub({ ...newHub, locations })
                    }
                    disabled={addHubLoading}
                  />
                  {allLocations.length === 0 && (
                    <Form.Text className="text-danger">
                      No locations available. Please add locations first.
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Service Area (Polygon)
                  </Form.Label>
                  <div className="border rounded overflow-hidden">
                    <AreaSelector
                      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
                      value={newHub.geometry}
                      onGeoJSONChange={(feature) =>
                        setNewHub({ ...newHub, geometry: feature })
                      }
                      editable={!addHubLoading}
                    />
                  </div>
                  <Form.Text muted>
                    Draw the hub's service area. This will be saved with the
                    hub.
                  </Form.Text>
                </Form.Group>
              </Form>
            </Tab>

            <Tab eventKey="cutoff" title="Cutoff Times">
              <div className="p-3">
                <Alert
                  variant={
                    newHub.orderMode === "preorder" ? "warning" : "success"
                  }
                >
                  <strong>
                    Current Order Mode:{" "}
                    {newHub.orderMode === "preorder"
                      ? "📋 Preorder"
                      : "⚡ Instant"}
                  </strong>
                  <br />
                  {newHub.orderMode === "preorder" ? (
                    <>
                      • <strong>Regular Customers:</strong> Must order by cutoff
                      time on the <strong>PREVIOUS day</strong>
                      <br />• <strong>Employees:</strong> Can order on the{" "}
                      <strong>SAME day</strong> until cutoff time
                    </>
                  ) : (
                    <>
                      • <strong>Both Regular Customers & Employees:</strong> Can
                      order on the <strong>SAME day</strong> until cutoff time
                    </>
                  )}
                </Alert>

                <CutoffTimeInput
                  label="Breakfast Session"
                  session="breakfast"
                  cutoffTimes={newHub.cutoffTimes}
                  orderMode={newHub.orderMode}
                  onChange={(session, type, value) => {
                    setNewHub({
                      ...newHub,
                      cutoffTimes: {
                        ...newHub.cutoffTimes,
                        [session]: {
                          ...newHub.cutoffTimes[session],
                          [type]: value,
                        },
                      },
                    });
                  }}
                />

                <CutoffTimeInput
                  label="Lunch Session"
                  session="lunch"
                  cutoffTimes={newHub.cutoffTimes}
                  orderMode={newHub.orderMode}
                  onChange={(session, type, value) => {
                    setNewHub({
                      ...newHub,
                      cutoffTimes: {
                        ...newHub.cutoffTimes,
                        [session]: {
                          ...newHub.cutoffTimes[session],
                          [type]: value,
                        },
                      },
                    });
                  }}
                />

                <CutoffTimeInput
                  label="Dinner Session"
                  session="dinner"
                  cutoffTimes={newHub.cutoffTimes}
                  orderMode={newHub.orderMode}
                  onChange={(session, type, value) => {
                    setNewHub({
                      ...newHub,
                      cutoffTimes: {
                        ...newHub.cutoffTimes,
                        [session]: {
                          ...newHub.cutoffTimes[session],
                          [type]: value,
                        },
                      },
                    });
                  }}
                />
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddHub(false)}
            disabled={addHubLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddHub}
            disabled={addHubLoading}
          >
            {addHubLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Adding...
              </>
            ) : (
              "Add Hub"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Hub Modal */}
      <Modal
        show={showEditHub}
        onHide={() => setShowEditHub(false)}
        size="lg"
        fullscreen
        style={{ zIndex: 99999 }}
      >
        <Modal.Header
          closeButton
          className="text-white"
          style={{ background: "#fe4500" }}
        >
          <Modal.Title>Edit Hub</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Hub Name</Form.Label>
              <Form.Control
                type="text"
                value={editHub.hubName}
                onChange={(e) =>
                  setEditHub({ ...editHub, hubName: e.target.value })
                }
                placeholder="Enter hub name"
                className="shadow-sm"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">
                Minimum Cart Value (₹)
              </Form.Label>
              <Form.Control
                type="number"
                value={editHub.minCart}
                onChange={(e) =>
                  setEditHub({ ...editHub, minCart: parseFloat(e.target.value) || 0 })
                }
                placeholder="Enter minimum cart amount"
                className="shadow-sm"
                min="0"
                step="0.01"
              />
              <Form.Text className="text-muted">
                Minimum order value required for this hub (applies to all meal sessions)
              </Form.Text>
            </Form.Group>

            <OrderModeSelector
              orderMode={editHub.orderMode}
              onChange={handleEditHubOrderModeChange}
              disabled={editHubLoading}
            />

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Locations ({editHub.locations.length} selected)
              </Form.Label>
              <LocationSelector
                selectedLocations={editHub.locations}
                onLocationChange={(locations) =>
                  setEditHub({ ...editHub, locations })
                }
                disabled={editHubLoading}
              />
              {allLocations.length === 0 && (
                <Form.Text className="text-danger">
                  No locations available. Please add locations first.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Service Area (Polygon)
              </Form.Label>
              <div className="border rounded overflow-hidden">
                <AreaSelector
                  apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
                  value={editHub.geometry}
                  onGeoJSONChange={(feature) =>
                    setEditHub({ ...editHub, geometry: feature })
                  }
                  editable={!editHubLoading}
                />
              </div>
              <Form.Text muted>
                Draw or update the hub's service area. Leave unchanged to keep
                existing polygon.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditHub(false)}
            disabled={editHubLoading}
          >
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleEditHub}
            disabled={editHubLoading}
          >
            {editHubLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Mode Modal */}
      <Modal
        show={showOrderModeModal}
        onHide={() => setShowOrderModeModal(false)}
        style={{ zIndex: 99999 }}
      >
        <Modal.Header
          closeButton
          className="text-white"
          style={{ background: "#fe4500" }}
        >
          <Modal.Title>
            Change Order Mode - {selectedHubForOrderMode?.hubName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>Changing order mode will:</strong>
            <ul className="mt-2 mb-0">
              <li>Update cutoff time defaults for all sessions</li>
              <li>Propagate changes to all customer addresses in this hub</li>
              <li>Update existing orders and meal plans</li>
            </ul>
          </Alert>

          {selectedHubForOrderMode && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Current Mode</Form.Label>
                <div>
                  {getOrderModeBadge(selectedHubForOrderMode.orderMode)}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Select New Mode</Form.Label>
                <div className="d-flex gap-3">
                  <Form.Check
                    type="radio"
                    id="modal-preorder"
                    label={
                      <span>
                        <Badge bg="warning" text="dark" className="me-2">
                          📋 Preorder
                        </Badge>
                        <span className="text-muted">
                          (Previous day cutoff)
                        </span>
                      </span>
                    }
                    name="modalOrderMode"
                    value="preorder"
                    checked={selectedHubForOrderMode.orderMode === "preorder"}
                    onChange={() =>
                      setSelectedHubForOrderMode({
                        ...selectedHubForOrderMode,
                        orderMode: "preorder",
                      })
                    }
                  />
                  <Form.Check
                    type="radio"
                    id="modal-instant"
                    label={
                      <span>
                        <Badge bg="success" className="me-2">
                          ⚡ Instant
                        </Badge>
                        <span className="text-muted">(Same day cutoff)</span>
                      </span>
                    }
                    name="modalOrderMode"
                    value="instant"
                    checked={selectedHubForOrderMode.orderMode === "instant"}
                    onChange={() =>
                      setSelectedHubForOrderMode({
                        ...selectedHubForOrderMode,
                        orderMode: "instant",
                      })
                    }
                  />
                </div>
              </Form.Group>

              <Alert variant="warning">
                <strong>Note:</strong> This change will affect all customers,
                orders, and meal plans associated with this hub.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowOrderModeModal(false)}
            disabled={orderModeLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateOrderMode}
            disabled={orderModeLoading}
          >
            {orderModeLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "Update Order Mode"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Min Cart Modal */}
      <Modal
        show={showMinCartModal}
        onHide={() => setShowMinCartModal(false)}
        style={{ zIndex: 99999 }}
      >
        <Modal.Header
          closeButton
          className="text-white"
          style={{ background: "#fe4500" }}
        >
          <Modal.Title>
            Update Minimum Cart Value - {selectedHubForMinCart?.hubName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>Updating minimum cart value will:</strong>
            <ul className="mt-2 mb-0">
              <li>Change the minimum order amount required for this hub</li>
              <li>Apply to all meal sessions (breakfast, lunch, dinner)</li>
              <li>Propagate changes to all customer addresses in this hub</li>
              <li>Update existing orders and meal plans</li>
            </ul>
          </Alert>

          {selectedHubForMinCart && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Current Minimum Cart</Form.Label>
                <div>
                  <Badge bg="info" className="fs-6">
                    {formatCurrency(selectedHubForMinCart.minCart)}
                  </Badge>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">New Minimum Cart Value (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedHubForMinCart.minCart}
                  onChange={(e) =>
                    setSelectedHubForMinCart({
                      ...selectedHubForMinCart,
                      minCart: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter minimum cart amount"
                  min="0"
                  step="0.01"
                />
                <Form.Text className="text-muted">
                  Minimum order value required for all meal sessions
                </Form.Text>
              </Form.Group>

              <Alert variant="warning">
                <strong>Note:</strong> This change will affect all customers,
                orders, and meal plans associated with this hub. Orders below
                this amount will not be allowed.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowMinCartModal(false)}
            disabled={minCartLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateMinCart}
            disabled={minCartLoading}
          >
            {minCartLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "Update Min Cart"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Min Cart Modal */}
      <Modal
        show={showBulkMinCartModal}
        onHide={() => setShowBulkMinCartModal(false)}
        style={{ zIndex: 99999 }}
      >
        <Modal.Header
          closeButton
          className="text-white"
          style={{ background: "#fe4500" }}
        >
          <Modal.Title>Bulk Update Minimum Cart Value</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>This will update the minimum cart value for ALL hubs.</strong>
            <ul className="mt-2 mb-0">
              <li>Apply the same minimum cart value to every hub</li>
              <li>Affect all meal sessions across all hubs</li>
              <li>Propagate changes to all customer addresses</li>
              <li>Update all existing orders and meal plans</li>
            </ul>
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              Minimum Cart Value for All Hubs (₹)
            </Form.Label>
            <Form.Control
              type="number"
              value={bulkMinCartValue}
              onChange={(e) => setBulkMinCartValue(parseFloat(e.target.value) || 0)}
              placeholder="Enter minimum cart amount for all hubs"
              min="0"
              step="0.01"
            />
            <Form.Text className="text-muted">
              This value will be applied to every hub in the system
            </Form.Text>
          </Form.Group>

          <Alert variant="warning">
            <strong>Warning:</strong> This action cannot be undone and will affect:
            <ul className="mt-2 mb-0">
              <li><strong>{hubs.length}</strong> hubs</li>
              <li>All customers associated with these hubs</li>
              <li>All existing and future orders</li>
              <li>All meal plans</li>
            </ul>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowBulkMinCartModal(false)}
            disabled={bulkMinCartLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleBulkUpdateMinCart}
            disabled={bulkMinCartLoading}
          >
            {bulkMinCartLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating All Hubs...
              </>
            ) : (
              `Apply ₹${bulkMinCartValue} to All Hubs`
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cutoff Settings Modal */}
      <Modal
        show={showCutoffSettings}
        onHide={() => setShowCutoffSettings(false)}
        size="lg"
        style={{ zIndex: 99999 }}
      >
        <Modal.Header
          closeButton
          className="text-white"
          style={{ background: "#fe4500" }}
        >
          <Modal.Title>
            Cutoff Time Settings - {selectedHubForCutoff?.hubName}
            <span className="ms-2">
              {selectedHubForCutoff &&
                getOrderModeBadge(selectedHubForCutoff.orderMode)}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert
            variant={
              selectedHubForCutoff?.orderMode === "preorder"
                ? "warning"
                : "success"
            }
          >
            <strong>
              Current Order Mode:{" "}
              {selectedHubForCutoff?.orderMode === "preorder"
                ? "📋 Preorder"
                : "⚡ Instant"}
            </strong>
            <ul className="mt-2 mb-0">
              {selectedHubForCutoff?.orderMode === "preorder" ? (
                <>
                  <li>
                    <strong>Regular Customers:</strong> Must place orders by the
                    cutoff time on the <strong>previous day</strong>
                  </li>
                  <li>
                    <strong>Employees:</strong> Can place orders on the{" "}
                    <strong>same day</strong> until the cutoff time
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>Both Regular Customers & Employees:</strong> Can
                    place orders on the <strong>same day</strong> until the
                    cutoff time
                  </li>
                </>
              )}
            </ul>
          </Alert>

          {selectedHubForCutoff && (
            <>
              <CutoffTimeInput
                label="Breakfast Session"
                session="breakfast"
                cutoffTimes={selectedHubForCutoff.cutoffTimes}
                orderMode={selectedHubForCutoff.orderMode}
                onChange={(session, type, value) => {
                  setSelectedHubForCutoff({
                    ...selectedHubForCutoff,
                    cutoffTimes: {
                      ...selectedHubForCutoff.cutoffTimes,
                      [session]: {
                        ...selectedHubForCutoff.cutoffTimes[session],
                        [type]: value,
                      },
                    },
                  });
                }}
              />

              <CutoffTimeInput
                label="Lunch Session"
                session="lunch"
                cutoffTimes={selectedHubForCutoff.cutoffTimes}
                orderMode={selectedHubForCutoff.orderMode}
                onChange={(session, type, value) => {
                  setSelectedHubForCutoff({
                    ...selectedHubForCutoff,
                    cutoffTimes: {
                      ...selectedHubForCutoff.cutoffTimes,
                      [session]: {
                        ...selectedHubForCutoff.cutoffTimes[session],
                        [type]: value,
                      },
                    },
                  });
                }}
              />

              <CutoffTimeInput
                label="Dinner Session"
                session="dinner"
                cutoffTimes={selectedHubForCutoff.cutoffTimes}
                orderMode={selectedHubForCutoff.orderMode}
                onChange={(session, type, value) => {
                  setSelectedHubForCutoff({
                    ...selectedHubForCutoff,
                    cutoffTimes: {
                      ...selectedHubForCutoff.cutoffTimes,
                      [session]: {
                        ...selectedHubForCutoff.cutoffTimes[session],
                        [type]: value,
                      },
                    },
                  });
                }}
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCutoffSettings(false)}
            disabled={cutoffLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateCutoffTimes}
            disabled={cutoffLoading}
          >
            {cutoffLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Save Cutoff Times"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Hub Modal */}
      <Modal show={showDeleteHub} onHide={() => setShowDeleteHub(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Delete Hub</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mb-3">
              <i
                className="fas fa-exclamation-triangle text-danger"
                style={{ fontSize: "3rem" }}
              ></i>
            </div>
            <p className="mb-2">Are you sure you want to delete this hub?</p>
            <div className="alert alert-warning">
              <strong>Hub Name:</strong> {selectedHub?.hubName}
              <br />
              <strong>Hub ID:</strong> {selectedHub?.hubId}
              <br />
              <strong>Order Mode:</strong>{" "}
              {selectedHub?.orderMode || "preorder"}
              <br />
              <strong>Min Cart:</strong> {formatCurrency(selectedHub?.minCart || 0)}
              <br />
              <strong>Locations:</strong> {selectedHub?.locations?.length || 0}
            </div>
            <p className="text-muted">This action cannot be undone.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteHub(false)}
            disabled={deleteHubLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteHub}
            disabled={deleteHubLoading}
          >
            {deleteHubLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete Hub"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View All Polygons Modal */}
      <Modal
        show={showViewAllPolygons}
        onHide={() => setShowViewAllPolygons(false)}
        size="xl"
        fullscreen
        style={{ zIndex: 99999 }}
      >
        <Modal.Header
          closeButton
          className="text-white"
          style={{ background: "#fe4500" }}
        >
          <Modal.Title>All Hub Service Areas</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "85vh", padding: 0 }}>
          <AreaSelector
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
            value={null}
            allPolygons={hubs
              .filter((hub) => hub.geometry)
              .map((hub) => ({
                geometry: hub.geometry,
                hubName: hub.hubName,
                hubId: hub.hubId,
                orderMode: hub.orderMode,
                minCart: hub.minCart,
              }))}
            editable={false}
            viewOnly={true}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowViewAllPolygons(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HubList;