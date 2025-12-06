import React, { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import axios from "axios";
import { FaStar } from "react-icons/fa";

const RatingModal = () => {
  const [rateorder, setRateOrder] = useState({});
  const [rateMode, setRateMode] = useState(false);
  const [currentRatingType, setCurrentRatingType] = useState("food"); // 'food' or 'delivery'
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Determine which step to show based on order data
  const determineRatingStep = (order) => {
    if (order?.ratings?.order?.status === "pending") {
      setCurrentRatingType("food");
      return true;
    } else if (order?.ratings?.delivery?.status === "pending") {
      setCurrentRatingType("delivery");
      return true;
    }
    return false; // Both rated or skipped
  };

  const getOrderByCustomerId = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("user"));
      if (!userId) return;

      const res = await axios.get(
        `https://dailydish-backend.onrender.com/api/admin/getorderNotRatedByUserID/${userId?._id}`
      );

      if (res.status === 200 && res.data.order) {
        setRateOrder(res.data.order);
        // Check which one needs rating
        const needsRating = determineRatingStep(res.data.order);
        if (needsRating) {
          setRateMode(true);
        }
      }
    } catch (error) {
      setRateMode(false);
      setRateOrder({});
    }
  };

  const submitRating = async (status = "rated") => {
    try {
      if (status === "rated" && rating === 0) {
        return alert("Please select a rating or click Skip");
      }
      if (status === "rated" && rating <= 3 && !comment.trim()) {
        return alert("Please provide a reason for the low rating");
      }

      const payload = {
        orderId: rateorder._id,
        ratingType: currentRatingType,
        rating: status === "skipped" ? 0 : rating,
        comment: status === "skipped" ? "" : comment,
        status: status, // 'rated' or 'skipped'
      };

      const res = await axios.put(
        "https://dailydish-backend.onrender.com/api/admin/submitOrderRating",
        payload
      );

      if (res.status === 200) {
        // Clear form for next step
        setRating(0);
        setComment("");

        // Logic for Sequential Flow
        if (currentRatingType === "food") {
          // We just finished Food. Check if Delivery is needed.
          if (rateorder.ratings?.delivery?.status === "pending") {
            setCurrentRatingType("delivery");
            // Important: Update local state to reflect that food is done
            setRateOrder((prev) => ({
                ...prev,
                ratings: {
                    ...prev.ratings,
                    order: { ...prev.ratings.order, status: status }
                }
            }));
          } else {
            handleClose();
          }
        } else {
          // We just finished Delivery. We are done.
          handleClose();
        }
      }
    } catch (error) {
      if (error.response) alert(error.response.data.error);
      console.log(error);
    }
  };

  const handleClose = () => {
    setRateMode(false);
    setRateOrder({});
    setRating(0);
    setComment("");
    setCurrentRatingType("food");
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-GB", options).replace(",", "");
  };

  useEffect(() => {
    getOrderByCustomerId();
  }, []);

  const handleRating = (value) => setRating(value);

  // Dynamic Texts based on Type
  const titleText = currentRatingType === "food" ? "Rate your Meal" : "Rate the Delivery";
  const subText = currentRatingType === "food" 
    ? "How was the food taste and quality?" 
    : "How was the delivery experience?";
  const placeholderText = currentRatingType === "food" 
    ? "Tell us about the taste, portion, etc." 
    : "Was the delivery on time? Was the packing good?";

  return (
    <Modal
      show={rateMode}
      onHide={handleClose}
      backdrop="static"
      centered
      contentClassName="border-0"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Modal.Body
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          position: "fixed",
          bottom: 0,
          margin: "10px",
          left: 0,
          right: 0,
        }}
      >
        <button className="custom-close-btn" onClick={handleClose}>
          ×
        </button>
        {rateorder && (
          <>
            <h6
              style={{
                textAlign: "center",
                fontWeight: 400,
                color: "#333",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              Order delivered on:{" "}
              <span style={{ fontWeight: 500 }}>
                {formatDateTime(rateorder.updatedAt)}
              </span>
            </h6>

            <Form>
              <Form.Group className="text-center mb-3">
                <Form.Label
                  style={{
                    display: "block",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "#444",
                    marginBottom: "8px",
                  }}
                >
                  {titleText}
                </Form.Label>
                <div className="d-flex justify-content-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={46}
                      color={star <= rating ? "#E6B800" : "#ccc"}
                      style={{ cursor: "pointer", transition: "color 0.2s" }}
                      onClick={() => handleRating(star)}
                    />
                  ))}
                </div>
              </Form.Group>

              <Form.Group>
                <Form.Label
                  style={{
                    fontWeight: 400,
                    fontSize: "0.9rem",
                    color: "#333",
                  }}
                >
                  {subText}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder={placeholderText}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{
                    fontSize: "0.9rem",
                    border: "1px solid #A9A9A9",
                    borderRadius: "8px",
                    resize: "none",
                    boxShadow: "none",
                  }}
                />
              </Form.Group>

              <div className="mt-4 d-flex justify-content-between gap-3">
                {/* Skip Button */}
                <button
                  className="btn w-50"
                  style={{
                    backgroundColor: "#f8f9fa",
                    color: "#6c757d",
                    fontWeight: 500,
                    borderRadius: "10px",
                    border: "1px solid #dee2e6",
                    padding: "10px 0",
                    fontSize: "1rem",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    submitRating("skipped");
                  }}
                >
                  Skip
                </button>

                {/* Submit Button */}
                <button
                  className="btn w-50"
                  style={{
                    backgroundColor: "#E6B800",
                    color: "black",
                    fontWeight: 600,
                    borderRadius: "10px",
                    border: "none",
                    padding: "10px 0",
                    fontSize: "1rem",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    submitRating("rated");
                  }}
                >
                  Submit
                </button>
              </div>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default RatingModal;