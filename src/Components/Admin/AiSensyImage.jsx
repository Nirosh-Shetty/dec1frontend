import React, { useState } from "react";
import axios from "axios";

const AiSensyImage = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSendCampaign = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      if (image) {
        formData.append("image", image); // file upload
      }

      if (imageUrl) {
        formData.append("imageUrl", imageUrl); // url
      }

      const res = await axios.post(
        "https://dd-backend-3nm0.onrender.com/api/admin/plan/send-reminders-to-all",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log(formData);

      alert(res.data.message);
    } catch (error) {
      console.error(error);
      alert("Failed to send campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">AiSensy Campaign Image</h5>
        </div>

        <div className="card-body">
          {/* Upload Image */}
          <div className="mb-3">
            <label className="form-label">Upload Image</label>
            <input
              type="file"
              className="form-control"
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="mb-3 text-center">
              <img
                src={preview}
                alt="preview"
                className="img-fluid rounded shadow"
                style={{ maxHeight: "250px" }}
              />
            </div>
          )}

          {/* Image URL */}
          <div className="mb-3">
            <label className="form-label">Or Paste Image URL</label>
            <input
              type="text"
              className="form-control"
              placeholder="https://your-image-url.com/image.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          {/* Send Button */}
          <div className="text-center">
            <button
              className="btn btn-success px-4"
              onClick={handleSendCampaign}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send WhatsApp Campaign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSensyImage;
