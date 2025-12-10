import React from "react";

const ConfirmationModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonStyle = "danger"
}) => {
  if (!show) return null;

  const getConfirmButtonColor = () => {
    switch (confirmButtonStyle) {
      case "danger":
        return "#dc3545";
      case "primary":
        return "#6B8E23";
      case "warning":
        return "#ffc107";
      default:
        return "#dc3545";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          animation: "modalFadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h5
          style={{
            margin: "0 0 12px 0",
            color: "#2c2c2c",
            fontFamily: "Inter",
            fontWeight: "600",
            fontSize: "18px",
          }}
        >
          {title}
        </h5>
        
        <p
          style={{
            margin: "0 0 24px 0",
            color: "#666",
            fontSize: "14px",
            fontFamily: "Inter",
            lineHeight: "1.5",
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              backgroundColor: "transparent",
              border: "1px solid #ddd",
              borderRadius: "8px",
              color: "#666",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              fontFamily: "Inter",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              backgroundColor: getConfirmButtonColor(),
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              fontFamily: "Inter",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = "1";
            }}
          >
            {confirmText}
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

export default ConfirmationModal;