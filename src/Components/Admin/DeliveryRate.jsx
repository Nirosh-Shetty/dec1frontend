import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form } from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";

function DeliveryRate() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form states
    const [hubId, setHubId] = useState(""); // This will store the MongoDB _id
    const [hubName, setHubName] = useState("");
    const [deliveryRate, setDeliveryRate] = useState("");
    const [acquisitionChannel, setAcquisitionChannel] = useState("organic");
    const [status, setStatus] = useState("Normal");

    // Data states
    const [deliveryRates, setDeliveryRates] = useState([]);
    const [filteredRates, setFilteredRates] = useState([]);
    const [hubs, setHubs] = useState([]);
    const [selectedRate, setSelectedRate] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination
    const [pageNumber, setPageNumber] = useState(0);
    const ratesPerPage = 6;
    const pagesVisited = pageNumber * ratesPerPage;
    const pageCount = Math.ceil(filteredRates.length / ratesPerPage);

    // Fetch hubs
    const getHubs = async () => {
        try {
            const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/Hub/hubs");
            console.log("Hubs data:", res.data); // Debug log
            setHubs(res.data);
        } catch (error) {
            console.error("Error fetching hubs:", error);
        }
    };

    // Fetch delivery rates
    const getDeliveryRates = async () => {
        try {
            const res = await axios.get("https://dd-backend-3nm0.onrender.com/api/deliveryrate/all");
            console.log("Delivery rates:", res.data.data); // Debug log
            setDeliveryRates(res.data.data);
            setFilteredRates(res.data.data);
        } catch (error) {
            console.error("Error fetching delivery rates:", error);
        }
    };

    // Add delivery rate
    const addDeliveryRate = async () => {
        try {
            const selectedHub = hubs.find(h => h._id === hubId);

            const config = {
                url: "deliveryrate/add",
                method: "post",
                baseURL: "https://dd-backend-3nm0.onrender.com/api",
                headers: { "Content-Type": "application/json" },
                data: {
                    hubId: hubId, // This will store the MongoDB _id
                    hubName: selectedHub?.hubName || hubName,
                    deliveryRate: Number(deliveryRate),
                    acquisition_channel: acquisitionChannel,
                    status
                }
            };

            const res = await axios(config);
            if (res.status === 200) {
                alert("Delivery Rate Added Successfully");
                handleCloseAdd();
                getDeliveryRates();
            }
        } catch (error) {
            console.error("Error adding delivery rate:", error);
            alert(error.response?.data?.message || "Error adding delivery rate");
        }
    };

    // Update delivery rate
    const updateDeliveryRate = async () => {
        try {
            const config = {
                url: `deliveryrate/update/${selectedRate._id}`,
                method: "put",
                baseURL: "https://dd-backend-3nm0.onrender.com/api",
                headers: { "Content-Type": "application/json" },
                data: {
                    deliveryRate: Number(deliveryRate),
                    acquisition_channel: acquisitionChannel,
                    status
                }
            };

            const res = await axios(config);
            if (res.status === 200) {
                alert("Delivery Rate Updated Successfully");
                handleCloseEdit();
                getDeliveryRates();
            }
        } catch (error) {
            console.error("Error updating delivery rate:", error);
            alert(error.response?.data?.message || "Error updating delivery rate");
        }
    };

    // Delete delivery rate
    const deleteDeliveryRate = async () => {
        try {
            const res = await axios.delete(
                `https://dd-backend-3nm0.onrender.com/api/deliveryrate/delete/${selectedRate._id}`
            );

            if (res.status === 200) {
                alert("Delivery Rate Deleted Successfully");
                handleCloseDelete();
                getDeliveryRates();
            }
        } catch (error) {
            console.error("Error deleting delivery rate:", error);
            alert(error.message);
        }
    };

    // Handle hub selection
    const handleHubChange = (e) => {
        const selectedHubId = e.target.value; // This will be the MongoDB _id
        setHubId(selectedHubId);

        const selectedHub = hubs.find(h => h._id === selectedHubId);
        if (selectedHub) {
            setHubName(selectedHub.hubName);
            console.log("Selected hub:", selectedHub); // Debug log
        }
    };

    // Get hub display name with ID
    const getHubDisplayName = (hub) => {
        return `${hub.hubName} (${hub.hubId || hub._id})`;
    };

    // Search filter
    useEffect(() => {
        const filtered = deliveryRates.filter(rate =>
            rate.hubName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rate.hubId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rate.acquisition_channel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rate.status?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRates(filtered);
        setPageNumber(0);
    }, [searchTerm, deliveryRates]);

    // Modal handlers
    const handleShowAdd = () => {
        setHubId("");
        setHubName("");
        setDeliveryRate("");
        setAcquisitionChannel("organic");
        setStatus("Normal");
        setShowAddModal(true);
    };

    const handleCloseAdd = () => {
        setShowAddModal(false);
        resetForm();
    };

    const handleShowEdit = (rate) => {
        setSelectedRate(rate);
        setHubId(rate.hubId);
        setHubName(rate.hubName);
        setDeliveryRate(rate.deliveryRate);
        setAcquisitionChannel(rate.acquisition_channel);
        setStatus(rate.status);
        setShowEditModal(true);
    };

    const handleCloseEdit = () => {
        setShowEditModal(false);
        resetForm();
    };

    const handleShowDelete = (rate) => {
        setSelectedRate(rate);
        setShowDeleteModal(true);
    };

    const handleCloseDelete = () => {
        setShowDeleteModal(false);
        setSelectedRate(null);
    };

    const resetForm = () => {
        setHubId("");
        setHubName("");
        setDeliveryRate("");
        setAcquisitionChannel("organic");
        setStatus("Normal");
        setSelectedRate(null);
    };

    // Pagination
    const changePage = ({ selected }) => {
        setPageNumber(selected);
    };

    useEffect(() => {
        getHubs();
        getDeliveryRates();
    }, []);

    const acquisitionChannels = ["organic", "refer", "socialMedia", "alpine", "hiranandani"];
    const statusOptions = ["Normal", "Employee"];

    return (
        <div>
            <h2 className="header-c">Delivery Rate</h2>
            <div className="customerhead p-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="col-lg-4 d-flex justify-content-center">
                        <div className="input-group">
                            <span className="input-group-text" id="basic-addon1">
                                <BsSearch />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by Hub, Channel or Status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button variant="success" onClick={handleShowAdd}>
                        + ADD Delivery Rate
                    </Button>
                </div>

                <div className="mb-3">
                    <Table responsive bordered>
                        <thead>
                            <tr>
                                <th>Sl. No</th>
                                <th>Hub ID</th>
                                <th>Hub Name</th>
                                <th>Delivery Rate</th>
                                <th>Acquisition Channel</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRates
                                ?.slice(pagesVisited, pagesVisited + ratesPerPage)
                                ?.map((rate, i) => (
                                    <tr key={rate._id}>
                                        <td style={{ paddingTop: "20px" }}>
                                            {i + 1 + ratesPerPage * pageNumber}
                                        </td>
                                        <td style={{ paddingTop: "20px" }}>
                                            {rate.hubId ? (rate.hubId.length > 10 ? rate.hubId : rate.hubId) : 'N/A'}
                                        </td>
                                        <td style={{ paddingTop: "20px" }}>{rate.hubName}</td>
                                        <td style={{ paddingTop: "20px" }}>₹{rate.deliveryRate}</td>
                                        <td style={{ paddingTop: "20px", textTransform: "capitalize" }}>
                                            {rate.acquisition_channel}
                                        </td>
                                        <td style={{ paddingTop: "20px" }}>
                                            <span className={`badge ${rate.status === 'Employee' ? 'bg-info' : 'bg-secondary'}`}>
                                                {rate.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
                                                <div>
                                                    <BiSolidEdit
                                                        className="text-success"
                                                        style={{ cursor: "pointer", fontSize: "20px" }}
                                                        onClick={() => handleShowEdit(rate)}
                                                    />
                                                </div>
                                                <div>
                                                    <AiFillDelete
                                                        className="text-danger"
                                                        style={{ cursor: "pointer", fontSize: "20px" }}
                                                        onClick={() => handleShowDelete(rate)}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>

                    <div style={{ display: "flex" }} className="reactPagination">
                        <p style={{ width: "100%", marginTop: "20px" }}>
                            Total Count: {filteredRates?.length}
                        </p>
                        <ReactPaginate
                            previousLabel={"Back"}
                            nextLabel={"Next"}
                            pageCount={pageCount}
                            onPageChange={changePage}
                            containerClassName={"paginationBttns"}
                            previousLinkClassName={"previousBttn"}
                            nextLinkClassName={"nextBttn"}
                            disabledClassName={"paginationDisabled"}
                            activeClassName={"paginationActive"}
                        />
                    </div>
                </div>

                {/* Add Modal */}
                <Modal show={showAddModal} onHide={handleCloseAdd} style={{ zIndex: "99999" }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Delivery Rate</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <div className="row">
                                <div className="do-sear mt-2">
                                    <Form.Label>Hub</Form.Label>
                                    <Form.Select value={hubId} onChange={handleHubChange}>
                                        <option value="">Select Hub</option>
                                        {hubs.map((hub) => (
                                            <option key={hub._id} value={hub._id}>
                                                {getHubDisplayName(hub)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="do-sear mt-2">
                                    <Form.Label>Delivery Rate (₹)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter Delivery Rate"
                                        value={deliveryRate}
                                        onChange={(e) => setDeliveryRate(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="do-sear mt-2">
                                    <Form.Label>Acquisition Channel</Form.Label>
                                    <Form.Select
                                        value={acquisitionChannel}
                                        onChange={(e) => setAcquisitionChannel(e.target.value)}
                                    >
                                        {acquisitionChannels.map((channel) => (
                                            <option key={channel} value={channel}>
                                                {channel}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="do-sear mt-2">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        {statusOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                            </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="d-flex">
                            <Button className="mx-2 modal-close-btn" variant="" onClick={handleCloseAdd}>
                                Close
                            </Button>
                            <Button className="mx-2 modal-add-btn" variant="" onClick={addDeliveryRate}>
                                Add
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* Edit Modal */}
                <Modal show={showEditModal} onHide={handleCloseEdit} style={{ zIndex: "99999" }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Delivery Rate</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <div className="row">
                                <div className="do-sear mt-2">
                                    <Form.Label>Hub</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={`${hubName} (${hubId ? (hubId.length > 10 ? hubId.slice(-6) : hubId) : 'N/A'})`}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="do-sear mt-2">
                                    <Form.Label>Delivery Rate (₹)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter Delivery Rate"
                                        value={deliveryRate}
                                        onChange={(e) => setDeliveryRate(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="do-sear mt-2">
                                    <Form.Label>Acquisition Channel</Form.Label>
                                    <Form.Select
                                        value={acquisitionChannel}
                                        onChange={(e) => setAcquisitionChannel(e.target.value)}
                                    >
                                        {acquisitionChannels.map((channel) => (
                                            <option key={channel} value={channel}>
                                                {channel}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="do-sear mt-2">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        {statusOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                            </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="d-flex">
                            <Button className="mx-2 modal-close-btn" variant="" onClick={handleCloseEdit}>
                                Close
                            </Button>
                            <Button className="mx-2 modal-add-btn" variant="" onClick={updateDeliveryRate}>
                                Update
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* Delete Modal */}
                <Modal show={showDeleteModal} onHide={handleCloseDelete} style={{ zIndex: "99999" }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Warning</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-12">
                                <p className="fs-4" style={{ color: "red" }}>
                                    Are you sure?
                                    <br /> you want to delete this delivery rate for{" "}
                                    {selectedRate?.hubName}?
                                </p>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="" className="modal-close-btn" onClick={handleCloseDelete}>
                            Close
                        </Button>
                        <Button variant="" className="modal-add-btn" onClick={deleteDeliveryRate}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}

export default DeliveryRate;