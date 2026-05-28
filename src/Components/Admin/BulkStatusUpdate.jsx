import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Alert, Badge, Button, Card, Form, Spinner, Table } from "react-bootstrap";
import { FaCloudUploadAlt, FaSearch, FaWhatsapp } from "react-icons/fa";

const API_BASE = "http://localhost:7013";
const PLAN_API = `${API_BASE}/api/user/plan`;

const statuses = [
  "Confirmed",
  "Sourced Fresh",
  "Cooking",
  "Packing",
  "Packed",
  "ontheway",
  "Delivered",
];

const sessions = ["Breakfast", "Lunch", "Dinner"];

const BulkStatusUpdate = () => {
  const [hubs, setHubs] = useState([]);
  const [form, setForm] = useState({
    hubId: "all", // Default to "all" for all hubs
    deliveryDate: new Date().toISOString().slice(0, 10),
    session: "Lunch",
    status: "all", // New status filter, default to "all"
    currentStatus: "all", // Filter by current status
    newStatus: "Sourced Fresh", // Moved to update section
    sendNotification: false,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const selectedHub = useMemo(
    () => hubs.find((hub) => hub._id === form.hubId) || { hubName: "All Hubs" },
    [hubs, form.hubId]
  );

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/Hub/hubs`)
      .then((res) => setHubs(res.data || []))
      .catch(() => setMessage({ type: "danger", text: "Unable to load hubs." }));
  }, []);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setPreview(null);
    setMessage(null);
  };

  const fetchPreview = async () => {
    if (!form.deliveryDate || !form.session) {
      setMessage({ type: "warning", text: "Please select date and session." });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post(`${PLAN_API}/batch-update-preview`, form);
      setPreview(res.data.data);
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Preview failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitUpdate = async () => {
    if (!preview) {
      setMessage({ type: "warning", text: "Preview the affected orders first." });
      return;
    }

    if (preview.plansCount === 0 && preview.ordersCount === 0) {
      setMessage({ type: "warning", text: "No eligible orders found for this slot." });
      return;
    }

    const ok = window.confirm(
      `Update ${preview.plansCount} plan(s) and ${preview.ordersCount} order(s) to ${form.newStatus}?`
    );
    if (!ok) return;

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (image) data.append("image", image);

    setSaving(true);
    setMessage(null);
    try {
      const res = await axios.put(`${PLAN_API}/batch-update-status-with-image`, data);
      setMessage({ type: "success", text: res.data.message || "Status updated." });
      setPreview(null);
      setImage(null);
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Update failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#374151" }}>
            Bulk Status Update
          </h2>
          <p className="text-muted mb-0">Update MyPlan and order status by hub, date, and session.</p>
        </div>
      </div>

      {message && <Alert variant={message.type}>{message.text}</Alert>}

      {/* Filters Section */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Filters</h5>
        </Card.Header>
        <Card.Body>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <Form.Label className="small fw-bold text-muted">Hub</Form.Label>
              <Form.Select value={form.hubId} onChange={(e) => updateField("hubId", e.target.value)}>
                <option value="all">All Hubs</option>
                {hubs.map((hub) => (
                  <option key={hub._id} value={hub._id}>
                    {hub.hubName}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="col-md-2">
              <Form.Label className="small fw-bold text-muted">Date</Form.Label>
              <Form.Control
                type="date"
                value={form.deliveryDate}
                onChange={(e) => updateField("deliveryDate", e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <Form.Label className="small fw-bold text-muted">Session</Form.Label>
              <Form.Select value={form.session} onChange={(e) => updateField("session", e.target.value)}>
                {sessions.map((session) => (
                  <option key={session}>{session}</option>
                ))}
              </Form.Select>
            </div>

            <div className="col-md-2">
              <Form.Label className="small fw-bold text-muted">Current Status</Form.Label>
              <Form.Select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
                <option value="all">All Status</option>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </Form.Select>
            </div>

            <div className="col-md-3">
              <Button variant="outline-primary" className="w-100 fw-bold" onClick={fetchPreview} disabled={loading}>
                {loading ? <Spinner size="sm" /> : <FaSearch className="me-2" />}
                Preview
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Update Section */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Update Options</h5>
        </Card.Header>
        <Card.Body>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <Form.Label className="small fw-bold text-muted">New Status</Form.Label>
              <Form.Select value={form.newStatus} onChange={(e) => updateField("newStatus", e.target.value)}>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </Form.Select>
            </div>

            <div className="col-md-5">
              <Form.Label className="small fw-bold text-muted">Status Image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              <small className="text-muted">Saved for Sourced Fresh and Cooking updates.</small>
            </div>

            <div className="col-md-2">
              <Form.Check
                type="switch"
                id="notify-users"
                label={
                  <span>
                    <FaWhatsapp className="me-2 text-success" />
                    Notify users
                  </span>
                }
                checked={form.sendNotification}
                onChange={(e) => updateField("sendNotification", e.target.checked)}
              />
            </div>

            <div className="col-md-2">
              <Button variant="success" className="w-100 fw-bold" onClick={submitUpdate} disabled={saving || !preview}>
                {saving ? <Spinner size="sm" /> : <FaCloudUploadAlt className="me-2" />}
                Update Bulk Status
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Preview Section */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0">Preview</h5>
            <small className="text-muted">
              {selectedHub.hubName} | {form.deliveryDate} | {form.session} | Status: {form.status === "all" ? "All" : form.status}
            </small>
          </div>
          {preview && (
            <div className="d-flex gap-2">
              <Badge bg="primary" pill className="px-3 py-2">
                Plans: {preview.plansCount}
              </Badge>
              <Badge bg="secondary" pill className="px-3 py-2">
                Orders: {preview.ordersCount}
              </Badge>
            </div>
          )}
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4 py-3">Customer</th>
                <th>Mobile</th>
                <th>Status</th>
                <th className="text-end pe-4">Items</th>
              </tr>
            </thead>
            <tbody>
              {preview?.affectedPlans?.length ? (
                preview.affectedPlans.map((plan) => (
                  <tr key={plan._id}>
                    <td className="ps-4 fw-bold">{plan.username || "Customer"}</td>
                    <td>{plan.mobile || "-"}</td>
                    <td>
                      <Badge bg={plan.status === "Cancelled" ? "danger" : "success"}>{plan.status}</Badge>
                    </td>
                    <td className="text-end pe-4">{plan.productCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-5">
                    Preview will show eligible plans for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BulkStatusUpdate;
