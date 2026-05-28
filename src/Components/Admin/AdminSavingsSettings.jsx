import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Table } from "react-bootstrap";

const API_BASE = "http://localhost:7013/api/admin/savings";

const AdminSavingsSettings = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [timeIfMadeAtHome, setTimeIfMadeAtHome] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [cookingPattern, setCookingPattern] = useState("SCALABLE");
  const [editingId, setEditingId] = useState(null);
  const [cleanupMinutes, setCleanupMinutes] = useState(25);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    const res = await axios.get(`${API_BASE}/time-saving-categories`);
    setCategories(res.data.data || []);
  };

  const fetchCleanupSettings = async () => {
    const res = await axios.get(`${API_BASE}/planning-cleanup-settings`);
    setCleanupMinutes(res.data.data?.timePerOrder ?? 25);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchCleanupSettings()]);
    } catch (error) {
      console.error(error);
      alert("Failed to load savings settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setName("");
    setTimeIfMadeAtHome("");
    setCategoryDescription("");
    setCookingPattern("SCALABLE");
    setEditingId(null);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter category name");
    if (timeIfMadeAtHome === "") return alert("Please enter cooking time");

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        timeIfMadeAtHome: Number(timeIfMadeAtHome),
        categoryDescription: categoryDescription.trim(),
        cookingPattern: cookingPattern,
      };

      if (editingId) {
        await axios.put(`${API_BASE}/time-saving-categories/${editingId}`, payload);
      } else {
        await axios.post(`${API_BASE}/time-saving-categories`, payload);
      }

      resetForm();
      await fetchCategories();
      alert(`Category ${editingId ? "updated" : "added"} successfully!`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setName(category.name || "");
    setTimeIfMadeAtHome(category.timeIfMadeAtHome ?? "");
    setCategoryDescription(category.categoryDescription || "");
    setCookingPattern(category.cookingPattern || "SCALABLE");
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Delete this time saving category?")) return;

    try {
      setSaving(true);
      await axios.delete(`${API_BASE}/time-saving-categories/${categoryId}`);
      if (editingId === categoryId) resetForm();
      await fetchCategories();
      alert("Category deleted successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete category");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCleanup = async () => {
    try {
      setSaving(true);
      await axios.put(`${API_BASE}/planning-cleanup-settings`, {
        timePerOrder: Number(cleanupMinutes),
      });
      alert("Planning + cleanup time updated");
      await fetchCleanupSettings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update cleanup time");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-savings-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="header-c">Savings Settings</h2>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p>Loading savings settings...</p>
        </div>
      ) : (
        <>
          <div className="admin-savings-grid">
            <form className="admin-savings-panel" onSubmit={handleSubmitCategory}>
              <h4>{editingId ? "Edit Category" : "Add Time Saving Category"}</h4>
              <div className="do-sear mt-3">
                <label>Category Name</label>
                <input
                  className="vi_0"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Curry, Rice, Sides"
                />
              </div>
              <div className="do-sear mt-3">
                <label>Time If Made At Home (minutes)</label>
                <input
                  className="vi_0"
                  type="number"
                  min="0"
                  value={timeIfMadeAtHome}
                  onChange={(e) => setTimeIfMadeAtHome(e.target.value)}
                  placeholder="25"
                />
              </div>
              <div className="do-sear mt-3">
                <label>Category Description</label>
                <input
                  className="vi_0"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="e.g., Gravy-based curries"
                />
              </div>
              <div className="do-sear mt-3">
                <label>Cooking Pattern</label>
                <select
                  className="vi_0"
                  value={cookingPattern}
                  onChange={(e) => setCookingPattern(e.target.value)}
                >
                  <option value="SCALABLE">
                    SCALABLE (Time increases with quantity, e.g., Chapati)
                  </option>
                  <option value="BATCH">
                    BATCH (Same time regardless of quantity, e.g., Kichidi)
                  </option>
                </select>
              </div>
              <div className="admin-savings-actions">
                <Button className="modal-add-btn" type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update" : "Add"}
                </Button>
                {editingId && (
                  <Button className="modal-close-btn" type="button" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>

            <div className="admin-savings-panel">
              <h4>Planning + Cleanup</h4>
              <div className="do-sear mt-3">
                <label>Flat Minutes Per Order</label>
                <input
                  className="vi_0"
                  type="number"
                  min="0"
                  value={cleanupMinutes}
                  onChange={(e) => setCleanupMinutes(e.target.value)}
                />
              </div>
              <div className="admin-savings-actions">
                <Button
                  className="modal-add-btn"
                  type="button"
                  onClick={handleSaveCleanup}
                  disabled={saving}
                >
                  Save Cleanup Time
                </Button>
              </div>
            </div>
          </div>

          <div className="customerhead p-2">
            <Table responsive bordered>
              <thead>
                <tr>
                  <th>Sl. No</th>
                  <th>Category</th>
                  <th>Minutes</th>
                  <th>Pattern</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="6">No time saving categories added yet</td>
                  </tr>
                ) : (
                  categories.map((category, index) => (
                    <tr key={category._id}>
                      <td>{index + 1}</td>
                      <td><strong>{category.name}</strong></td>
                      <td>{category.timeIfMadeAtHome} min</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor:
                              category.cookingPattern === "BATCH"
                                ? "rgba(255, 193, 7, 0.2)"
                                : "rgba(107, 142, 35, 0.2)",
                            color:
                              category.cookingPattern === "BATCH"
                                ? "#f57f17"
                                : "#6b8e23",
                          }}
                        >
                          {category.cookingPattern || "SCALABLE"}
                        </span>
                      </td>
                      <td>{category.categoryDescription}</td>
                      <td>
                        <div className="admin-savings-table-actions">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEdit(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(category._id)}
                            disabled={saving}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSavingsSettings;
