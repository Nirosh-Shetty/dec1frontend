import React from "react";
import { MdAddLocationAlt } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const LocationRequiredPopup = ({ show, onClose }) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          animation: "modalFadeIn 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "16px",
            color: "#6B8E23",
          }}
        >
                        <MdAddLocationAlt />
          
        </div>
        <h3
          style={{
            marginBottom: "12px",
            color: "#333",
            fontSize: "20px",
            fontWeight: "600",
            fontFamily: "Inter",
          }}
        >
          Add Location to See Menu
        </h3>
        <p
          style={{
            marginBottom: "24px",
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.5",
            fontFamily: "Inter",
          }}
        >
          Please add your delivery location to view available menu items and place orders.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          <button
            onClick={() => {
              onClose();
              navigate("/location");
            }}
            style={{
              backgroundColor: "#6B8E23",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.2s",
              fontFamily: "Inter",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#5a7a1a";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#6B8E23";
            }}
          >
            Add Location
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "Inter",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LocationRequiredPopup;