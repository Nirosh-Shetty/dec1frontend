import { useState, useCallback } from "react";

// Helper function to check if a point is inside a polygon
const isPointInPolygon = (point, polygon) => {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Normalize polygon (ensure it's closed)
const normalizePolygon = (paths) => {
  const pts = paths.map((p) => ({
    lat: parseFloat(p.lat),
    lng: parseFloat(p.lng),
  }));

  const first = pts[0];
  const last = pts[pts.length - 1];

  if (first.lat !== last.lat || first.lng !== last.lng) {
    pts.push({ lat: first.lat, lng: first.lng });
  }

  return pts;
};

export const useZoneOrders = (filteredOrders) => {
  const [showZoneOrdersModal, setShowZoneOrdersModal] = useState(false);
  const [zoneOrders, setZoneOrders] = useState([]);
  const [loadingZoneOrders, setLoadingZoneOrders] = useState(false);

  // Function to get orders within a zone
  const getOrdersInZone = useCallback(
    (zone) => {
      if (!zone || !zone.paths || zone.paths.length < 3) {
        return [];
      }

      const normalizedPaths = normalizePolygon(zone.paths);

      // Filter orders that fall within the zone
      const ordersInZone = filteredOrders.filter((order) => {
        if (!order.coordinates?.coordinates) return false;

        const [orderLng, orderLat] = order.coordinates.coordinates;
        const orderPoint = { lat: orderLat, lng: orderLng };

        return isPointInPolygon(orderPoint, normalizedPaths);
      });

      return ordersInZone;
    },
    [filteredOrders]
  );

  // Function to show zone orders modal
  const handleShowZoneOrders = useCallback(
    async (zone) => {
      setLoadingZoneOrders(true);
      setShowZoneOrdersModal(true);

      try {
        const ordersInZone = getOrdersInZone(zone);
        setZoneOrders(ordersInZone);
      } catch (error) {
        console.error("Error getting zone orders:", error);
        setZoneOrders([]);
      } finally {
        setLoadingZoneOrders(false);
      }
    },
    [getOrdersInZone]
  );

  const closeModal = useCallback(() => {
    setShowZoneOrdersModal(false);
  }, []);

  return {
    showZoneOrdersModal,
    zoneOrders,
    loadingZoneOrders,
    handleShowZoneOrders,
    closeModal,
  };
};
