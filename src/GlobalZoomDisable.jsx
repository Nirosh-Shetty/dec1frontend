import React, { useEffect } from "react";

const GlobalZoomDisable = ({ children }) => {
  useEffect(() => {
    const preventZoom = (e) => {
      // Prevent zoom with Ctrl/Command + Scroll
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const preventKeyZoom = (e) => {
      // Prevent zoom with Ctrl/Command + (+/-/0)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "-" || e.key === "0")
      ) {
        e.preventDefault();
      }
    };

    const preventTouchZoom = (e) => {
      // Prevent pinch-to-zoom
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };
    const disableKeys = (e) => {
      if (
        e.ctrlKey &&
        (e.key === "u" || e.key === "i" || e.key === "j" || e.key === "s")
      ) {
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
      }
      if (e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "0")) {
        e.preventDefault();
      }
    };

    // Add event listeners to disable zoom
    document.addEventListener("wheel", preventZoom, { passive: false });
    document.addEventListener("keydown", disableKeys);
    document.addEventListener("touchmove", preventTouchZoom, {
      passive: false,
    });

    // Add viewport meta tag to disable zoom on mobile devices
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content =
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    document.head.appendChild(meta);


    // Disable Right Click
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    // Block DevTools Shortcuts
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    });


    return () => {
      document.removeEventListener("wheel", preventZoom);
      document.removeEventListener("keydown", preventKeyZoom);
      document.removeEventListener("touchmove", preventTouchZoom);
      document.head.removeChild(meta);
    
    };
  }, []);





  return <>{children}</>;
};

export default GlobalZoomDisable;
