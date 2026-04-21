// "use client";

// import { useState, useMemo, useRef, useEffect } from "react";
// import useSWR, { mutate as globalMutate } from "swr";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Badge,
//   Form,
//   Button,
//   Alert,
//   Spinner,
//   Modal,
// } from "react-bootstrap";
// import {
//   FaCheckCircle,
//   FaBox,
//   FaTimes,
//   FaTable,
//   FaListAlt,
// } from "react-icons/fa";
// import { Link } from "react-router-dom";

// // Constants
// const API_BASE_URL = "https://dd-backend-3nm0.onrender.com/api/packer";
// const ADMIN_ORDERS_URL = "https://dd-backend-3nm0.onrender.com/api/admin/getPackerOrders2";
// const PACKING_GROUPED_URL = `${API_BASE_URL}/packing/today/grouped`;
// const HUBS_API_URL = "https://dd-backend-3nm0.onrender.com/api/Hub/hubs";
// const SWR_KEY = "packer:combined";
// const LOCAL_CACHE_KEY = "packer:combined:cache:v1";
// const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// function getUserRole() {
//   if (typeof window === "undefined") return null;

//   const isAdmin = localStorage.getItem("admin");
//   if (isAdmin === "Admin Login Successfully") {
//     return "admin";
//   }

//   const packerData = localStorage.getItem("packer");
//   if (packerData) {
//     try {
//       const packer = JSON.parse(packerData);
//       return "packer";
//     } catch {
//       return null;
//     }
//   }

//   return null;
// }

// function getPackerData() {
//   if (typeof window === "undefined") return null;

//   const packerData = localStorage.getItem("packer");
//   if (packerData) {
//     try {
//       return JSON.parse(packerData);
//     } catch {
//       return null;
//     }
//   }

//   return null;
// }

// // Util: read/write local cache with TTL
// function readLocalCache() {
//   try {
//     const raw = localStorage.getItem(LOCAL_CACHE_KEY);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     if (!parsed || !parsed.data || !parsed.ts) return null;
//     if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
//     return parsed.data;
//   } catch {}
//   return null;
// }
// function writeLocalCache(data) {
//   try {
//     localStorage.setItem(
//       LOCAL_CACHE_KEY,
//       JSON.stringify({ data, ts: Date.now() }),
//     );
//   } catch {}
// }

// // AbortError helper and clearer error messaging
// function isAbortError(err) {
//   return err?.name === "AbortError" || /aborted/i.test(err?.message || "");
// }

// // Fetch with timeout + graceful fallback to cache
// async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeoutMs);
//   try {
//     const res = await fetch(url, {
//       cache: "no-store",
//       ...opts,
//       signal: controller.signal,
//     });
//     if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
//     const ct = res.headers.get("content-type") || "";
//     if (!ct.includes("application/json")) {
//       const text = await res.text();
//       throw new Error(`Non-JSON for ${url}: ${text.slice(0, 120)}...`);
//     }
//     const json = await res.json();
//     return json;
//   } catch (err) {
//     if (isAbortError(err)) {
//       throw new Error(`Request timed out after ${timeoutMs}ms`);
//     }
//     throw err;
//   } finally {
//     clearTimeout(id);
//   }
// }

// // Add cache-busting helper for grouped endpoint
// function withBust(url) {
//   const sep = url.includes("?") ? "&" : "?";
//   return `${url}${sep}ts=${Date.now()}`;
// }

// // Combined fetcher for SWR
// async function fetchCombined() {
//   const cached = readLocalCache();

//   // 1) Kick admin transform (persists items for today) with a short timeout
//   try {
//     await fetchWithTimeout(ADMIN_ORDERS_URL, {}, 5000);
//   } catch (e) {
//     console.log("[v0] getPackerOrders2 skipped/failed:", e.message);
//   }

//   // 2) Fetch grouped with cache-bust and a few retries to catch just-written docs
//   let groupedJson = null;
//   for (let attempt = 0; attempt < 3; attempt++) {
//     try {
//       groupedJson = await fetchWithTimeout(
//         withBust(PACKING_GROUPED_URL),
//         {},
//         6000,
//       );
//       break;
//     } catch (e) {
//       if (attempt < 2) {
//         await new Promise((r) => setTimeout(r, 500));
//         continue;
//       }
//       console.log("[v0] grouped fetch failed:", e.message);
//     }
//   }

//   let groupedData = [];
//   if (
//     Array.isArray(groupedJson?.data?.groupedData) &&
//     groupedJson.data.groupedData.length > 0
//   ) {
//     groupedData = groupedJson.data.groupedData;
//   } else if (
//     cached &&
//     Array.isArray(cached.groupedData) &&
//     cached.groupedData.length > 0
//   ) {
//     groupedData = cached.groupedData;
//   }

//   // Instead of throwing, return cached/empty to keep UI responsive; SWR will revalidate again soon
//   if (!Array.isArray(groupedData)) groupedData = [];

//   const combined = {
//     sendToPackingResult: null,
//     groupedData,
//     __fromCache: !(
//       Array.isArray(groupedJson?.data?.groupedData) &&
//       groupedJson.data.groupedData.length > 0
//     ),
//   };

//   writeLocalCache(combined);
//   return combined;
// }

// // Custom hook: SWR + fallbackData from localStorage for instant paint
// function usePackingData() {
//   const fallbackData = typeof window !== "undefined" ? readLocalCache() : null;

//   const {
//     data,
//     error,
//     isValidating,
//     mutate: swrMutate,
//   } = useSWR(SWR_KEY, fetchCombined, {
//     fallbackData,
//     revalidateOnFocus: true,
//     revalidateOnReconnect: true,
//     revalidateOnMount: true,
//     revalidateIfStale: true,
//     dedupingInterval: 2000,
//     refreshInterval: 0, // we'll run our own interval below
//     refreshWhenHidden: true, // keep polling even if tab hidden
//     errorRetryCount: 1,
//     errorRetryInterval: 3000,
//     shouldRetryOnError: (err) => {
//       if (isAbortError(err)) return false;
//       return true;
//     },
//   });

//   return {
//     data,
//     error,
//     isValidating,
//     refresh: () => swrMutate(),
//     mutate: swrMutate,
//   };
// }

// function useHubs() {
//   const { data, error, isValidating } = useSWR(
//     HUBS_API_URL,
//     async (url) => {
//       try {
//         const res = await fetchWithTimeout(url, {}, 8000);
//         return Array.isArray(res) ? res : [];
//       } catch (err) {
//         console.log("[v0] hubs fetch failed:", err.message);
//         return [];
//       }
//     },
//     {
//       revalidateOnFocus: false,
//       revalidateOnReconnect: false,
//       dedupingInterval: 60000, // cache for 1 minute
//     },
//   );

//   return {
//     hubs: data || [],
//     hubsLoading: isValidating,
//     hubsError: error,
//   };
// }

// function getPackerHubName(packerHubIds, allHubs) {
//   if (!Array.isArray(packerHubIds) || !Array.isArray(allHubs)) return null;
//   const matchedHub = allHubs.find((hub) => packerHubIds.includes(hub.hubId));
//   return matchedHub ? matchedHub.hubName : null;
// }

// function getLocationsForHub(hubName, allHubs) {
//   if (!hubName || !Array.isArray(allHubs)) return [];
//   const hub = allHubs.find((h) => h.hubName === hubName);
//   return hub?.locations || [];
// }

// // Derive filters from dataset (memoized)
// function useAvailableFilters(
//   groupedData,
//   userRole,
//   packerData,
//   allHubs,
//   packerHubName,
// ) {
//   return useMemo(() => {
//     if (!Array.isArray(groupedData)) {
//       return { hubs: [], slots: [], deliveryLocations: [] };
//     }
//     const hubs = [
//       ...new Set(
//         groupedData.flatMap((item) =>
//           Array.isArray(item.hub) ? item.hub : [item.hub].filter(Boolean),
//         ),
//       ),
//     ];
//     const slots = [
//       ...new Set(groupedData.map((item) => item.slot).filter(Boolean)),
//     ];

//     let deliveryLocations = [
//       ...new Set(
//         groupedData.flatMap((item) =>
//           Array.isArray(item.orders)
//             ? item.orders
//                 .map((order) => order?.deliveryLocation)
//                 .filter(Boolean)
//                 .filter((loc) => loc !== "Unknown Location")
//             : [],
//         ),
//       ),
//     ];

//     if (userRole === "packer" && packerHubName) {
//       const packerHubLocations = getLocationsForHub(packerHubName, allHubs);
//       deliveryLocations = deliveryLocations.filter((loc) =>
//         packerHubLocations.some(
//           (hLoc) =>
//             loc.toLowerCase().includes(hLoc.toLowerCase()) ||
//             hLoc.toLowerCase().includes(loc.toLowerCase()),
//         ),
//       );
//     } else if (userRole === "packer" && packerData?.locations) {
//       // Fallback to packer's locations if hub name not found
//       const packerLocations = packerData.locations;
//       deliveryLocations = deliveryLocations.filter((loc) =>
//         packerLocations.some(
//           (pLoc) =>
//             loc.toLowerCase().includes(pLoc.toLowerCase()) ||
//             pLoc.toLowerCase().includes(loc.toLowerCase()),
//         ),
//       );
//     }

//     return { hubs, slots, deliveryLocations };
//   }, [groupedData, userRole, packerData, allHubs, packerHubName]);
// }

// // Summary calc (memoized)
// function useSummary(packingData, filters, packer, userRole, packerHubName) {
//   return useMemo(() => {
//     if (!Array.isArray(packingData))
//       return {
//         totalGroups: 0,
//         totalOrdered: 0,
//         totalPacked: 0,
//         remainingItems: 0,
//         fullyPackedGroups: 0,
//         partiallyPackedGroups: 0,
//         notPackedGroups: 0,
//       };

//     let filtered = packingData;

//     if (userRole === "packer" && packerHubName) {
//       // Packers only see their assigned hub
//       filtered = filtered.filter((item) => {
//         const itemHubs = Array.isArray(item.hub)
//           ? item.hub
//           : [item.hub].filter(Boolean);
//         return itemHubs.includes(packerHubName);
//       });
//     } else if (userRole === "admin") {
//       // Admin can see all hubs
//       if (filters.hub !== "all") {
//         filtered = filtered.filter((item) => {
//           const itemHubs = Array.isArray(item.hub)
//             ? item.hub
//             : [item.hub].filter(Boolean);
//           return itemHubs.includes(filters.hub);
//         });
//       }
//     }

//     if (filters.slot !== "all") {
//       filtered = filtered.filter((item) => item.slot === filters.slot);
//     }
//     if (filters.deliveryLocation !== "all") {
//       const needle = filters.deliveryLocation.toLowerCase();
//       filtered = filtered.filter(
//         (item) =>
//           Array.isArray(item.orders) &&
//           item.orders.some(
//             (o) =>
//               o?.deliveryLocation &&
//               o.deliveryLocation.toLowerCase().includes(needle),
//           ),
//       );
//     }
//     if (filters.deliveryLocations?.length > 0) {
//       filtered = filtered.filter(
//         (item) =>
//           Array.isArray(item.orders) &&
//           item.orders.some((o) =>
//             filters.deliveryLocations.some(
//               (sel) =>
//                 o?.deliveryLocation &&
//                 o.deliveryLocation.toLowerCase().includes(sel.toLowerCase()),
//             ),
//           ),
//       );
//     }

//     const totalOrdered = filtered.reduce(
//       (sum, it) => sum + (Number(it.totalOrdered) || 0),
//       0,
//     );
//     const totalPacked = filtered.reduce(
//       (sum, it) => sum + (Number(it.totalPacked ?? it.packed) || 0),
//       0,
//     );

//     return {
//       totalGroups: filtered.length,
//       totalOrdered,
//       totalPacked,
//       remainingItems: Math.max(0, totalOrdered - totalPacked),
//       fullyPackedGroups: filtered.filter((it) => it.isFullyPacked).length,
//       partiallyPackedGroups: filtered.filter(
//         (it) => it.isPacked && !it.isFullyPacked,
//       ).length,
//       notPackedGroups: filtered.filter((it) => !it.isPacked).length,
//     };
//   }, [packingData, filters, packer, userRole, packerHubName]);
// }

// // Group items for table (memoized)
// function useGroupedItems(
//   packingData,
//   filters,
//   packer,
//   userRole,
//   packerHubName,
// ) {
//   return useMemo(() => {
//     if (!Array.isArray(packingData)) return [];

//     const groupedMap = new Map();

//     for (const item of packingData) {
//       if (!item || typeof item !== "object") continue;

//       const itemHubs = Array.isArray(item.hub)
//         ? item.hub
//         : [item.hub].filter(Boolean);

//       if (userRole === "packer" && packerHubName) {
//         if (!itemHubs.includes(packerHubName)) continue;
//       } else if (userRole === "admin") {
//         if (filters.hub !== "all" && !itemHubs.includes(filters.hub)) continue;
//       }

//       if (filters.slot !== "all" && item.slot !== filters.slot) continue;

//       if (filters.deliveryLocation !== "all") {
//         const needle = filters.deliveryLocation.toLowerCase();
//         const ok =
//           Array.isArray(item.orders) &&
//           item.orders.some(
//             (o) =>
//               o?.deliveryLocation &&
//               o.deliveryLocation.toLowerCase().includes(needle),
//           );
//         if (!ok) continue;
//       }
//       if (filters.deliveryLocations?.length > 0) {
//         const ok =
//           Array.isArray(item.orders) &&
//           item.orders.some((o) =>
//             filters.deliveryLocations.some(
//               (sel) =>
//                 o?.deliveryLocation &&
//                 o.deliveryLocation.toLowerCase().includes(sel.toLowerCase()),
//             ),
//           );
//         if (!ok) continue;
//       }

//       const key = `${item.name}-${itemHubs[0]}`;
//       if (!groupedMap.has(key)) {
//         groupedMap.set(key, {
//           name: item.name || "Unknown Item",
//           category: item.category || "Unknown Category",
//           categoryName: item.categoryName || "Unknown Category Name",
//           unit: item.unit || "unit",
//           hub: itemHubs,
//           totalOrdered: 0,
//           totalPacked: 0,
//           slots: new Map(),
//           isPacked: false,
//           isFullyPacked: false,
//           deliveryLocations: new Set(),
//         });
//       }
//       const group = groupedMap.get(key);
//       const itemOrdered = Number(item.totalOrdered) || 0;
//       const itemPacked = Number(item.totalPacked ?? item.packed) || 0;

//       group.totalOrdered += itemOrdered;
//       group.totalPacked += itemPacked;

//       const slotName = item.slot || "Unknown Slot";
//       if (!group.slots.has(slotName)) {
//         group.slots.set(slotName, {
//           slot: slotName,
//           ordered: itemOrdered,
//           packed: itemPacked,
//           remaining: Math.max(0, itemOrdered - itemPacked),
//           isFullyPacked: !!item.isFullyPacked,
//           isPacked: !!item.isPacked,
//         });
//       } else {
//         const s = group.slots.get(slotName);
//         s.ordered += itemOrdered;
//         s.packed += itemPacked;
//         s.remaining = Math.max(0, s.ordered - s.packed);
//         s.isPacked = s.packed > 0;
//         s.isFullyPacked = s.packed === s.ordered;
//       }

//       if (Array.isArray(item.orders)) {
//         for (const o of item.orders) {
//           if (
//             o?.deliveryLocation &&
//             o.deliveryLocation !== "Unknown Location"
//           ) {
//             group.deliveryLocations.add(o.deliveryLocation);
//           }
//         }
//       }

//       group.isPacked = group.totalPacked > 0;
//       group.isFullyPacked = group.totalPacked === group.totalOrdered;
//     }

//     return Array.from(groupedMap.values()).map((g) => ({
//       ...g,
//       slots: Array.from(g.slots.values()),
//       deliveryLocations: Array.from(g.deliveryLocations),
//       totalOrdered: Number(g.totalOrdered) || 0,
//       totalPacked: Number(g.totalPacked) || 0,
//       remaining: Math.max(
//         0,
//         (Number(g.totalOrdered) || 0) - (Number(g.totalPacked) || 0),
//       ),
//     }));
//   }, [packingData, filters, packer, userRole, packerHubName]);
// }

// const PackerOrders = () => {
//   const [userRole, setUserRole] = useState(null);
//   const [packerData, setPackerData] = useState(null);
//   const { hubs: allHubs } = useHubs();
//   const [packerHubName, setPackerHubName] = useState(null);

//   const [filters, setFilters] = useState(() => {
//     try {
//       const raw = sessionStorage.getItem("packer:filters:v1");
//       return raw
//         ? JSON.parse(raw)
//         : {
//             hub: "all",
//             slot: "all",
//             deliveryLocation: "all",
//             deliveryLocations: [],
//           };
//     } catch {
//       return {
//         hub: "all",
//         slot: "all",
//         deliveryLocation: "all",
//         deliveryLocations: [],
//       };
//     }
//   });
//   useEffect(() => {
//     try {
//       sessionStorage.setItem("packer:filters:v1", JSON.stringify(filters));
//     } catch {}
//   }, [filters]);

//   useEffect(() => {
//     const role = getUserRole();
//     setUserRole(role);

//     if (role === "packer") {
//       const pData = getPackerData();
//       setPackerData(pData);
//     }
//   }, []);

//   useEffect(() => {
//     if (
//       userRole === "packer" &&
//       packerData?.hubs &&
//       Array.isArray(allHubs) &&
//       allHubs.length > 0
//     ) {
//       const hubName = getPackerHubName(packerData.hubs, allHubs);
//       if (hubName) {
//         setPackerHubName(hubName);
//         // Auto-select the hub for packers
//         setFilters((prev) => ({
//           ...prev,
//           hub: hubName,
//         }));
//       }
//     }
//   }, [userRole, packerData, allHubs]);

//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showSlotModal, setShowSlotModal] = useState(false);
//   const [selectedItemForSlot, setSelectedItemForSlot] = useState(null);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [lastRefreshed, setLastRefreshed] = useState(null);
//   const lastGoodDataRef = useRef(null);

//   // SWR data
//   const { data, error, isValidating, refresh, mutate } = usePackingData();
//   const packingData = data?.groupedData || [];

//   // Keep a ref to the last good data for instant fallback
//   useEffect(() => {
//     if (Array.isArray(packingData) && packingData.length > 0) {
//       lastGoodDataRef.current = packingData;
//     }
//   }, [packingData]);

//   const availableFilters = useAvailableFilters(
//     packingData,
//     userRole,
//     packerData,
//     allHubs,
//     packerHubName,
//   );
//   const summary = useSummary(
//     packingData,
//     filters,
//     packerData || { hubs: [] },
//     userRole,
//     packerHubName,
//   );
//   const groupedItems = useGroupedItems(
//     packingData,
//     filters,
//     packerData || { hubs: [] },
//     userRole,
//     packerHubName,
//   );

//   const loading = !data && !error && !lastGoodDataRef.current;

//   const handleFilterChange = (filterType, value) => {
//     setFilters((prev) => ({ ...prev, [filterType]: value }));
//   };

//   const handleDeliveryLocationSelect = (location) => {
//     if (location === "all") {
//       setFilters((prev) => ({
//         ...prev,
//         deliveryLocations: [],
//         deliveryLocation: "all",
//       }));
//     } else if (!filters.deliveryLocations.includes(location)) {
//       setFilters((prev) => ({
//         ...prev,
//         deliveryLocations: [...prev.deliveryLocations, location],
//         deliveryLocation: "all",
//       }));
//     }
//   };
//   const removeDeliveryLocation = (locationToRemove) => {
//     setFilters((prev) => ({
//       ...prev,
//       deliveryLocations: prev.deliveryLocations.filter(
//         (l) => l !== locationToRemove,
//       ),
//     }));
//   };
//   const clearAllDeliveryLocations = () => {
//     setFilters((prev) => ({ ...prev, deliveryLocations: [] }));
//   };

//   // Smooth manual refresh with background revalidate
//   const handleRefresh = async () => {
//     console.log("[v0] manual refresh requested");
//     await mutate();
//     setLastRefreshed(new Date());
//   };

//   const handlePackedClick = (item) => {
//     setSelectedItemForSlot(item);
//     setShowSlotModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setIsUpdating(false);
//   };
//   const handleCloseSlotModal = () => {
//     setShowSlotModal(false);
//     setIsUpdating(false);
//   };

//   const handleSlotSelect = async (slot) => {
//     setShowSlotModal(false);
//     try {
//       const url = `${API_BASE_URL}/packing/today/individual?name=${encodeURIComponent(
//         selectedItemForSlot.name,
//       )}&hub=${selectedItemForSlot.hub[0]}&slot=${slot}`;
//       const res = await fetchWithTimeout(url, {}, 8000);
//       if (res?.success && Array.isArray(res?.data)) {
//         const individualItems = res.data;
//         const packedCount = individualItems.filter((it) => it.isPacked).length;
//         const totalCount = individualItems.length;
//         setSelectedItem({
//           ...selectedItemForSlot,
//           slot,
//           individualItems,
//           totalOrdered: totalCount,
//           packed: packedCount,
//           isPacked: packedCount > 0,
//           isFullyPacked: packedCount === totalCount,
//         });
//         setShowModal(true);
//       } else {
//         alert("No individual items found for this slot");
//       }
//     } catch (err) {
//       console.log("[v0] individual items fetch failed, using fast fallback");
//       alert("Error fetching individual items: " + err.message);
//     }
//   };

//   // Optimistic update using SWR mutate to keep UI instant
//   const updateIndividualPackingStatus = async (individualItemId, isPacked) => {
//     if (!selectedItem || !selectedItemForSlot) return;
//     setIsUpdating(true);

//     // Prepare optimistic update for the grouped list and details modal
//     const optimisticUpdater = (current) => {
//       if (!current) return current;
//       const copy = {
//         ...current,
//         groupedData: [...(current.groupedData || [])],
//       };

//       // Update matching grouped item
//       copy.groupedData = copy.groupedData.map((it) => {
//         const itemHubs = Array.isArray(it.hub)
//           ? it.hub
//           : [it.hub].filter(Boolean);
//         const matches =
//           it.name === selectedItemForSlot.name &&
//           itemHubs[0] === selectedItemForSlot.hub[0] &&
//           it.slot === selectedItem.slot;
//         if (!matches) return it;

//         // Recalculate packed based on modal state
//         const currentItems = (selectedItem.individualItems || []).map((x) =>
//           x._id === individualItemId ? { ...x, isPacked } : x,
//         );
//         const newPacked = currentItems.filter((x) => x.isPacked).length;
//         const ordered = Number(it.totalOrdered || it.ordered || 0);
//         return {
//           ...it,
//           packed: newPacked,
//           totalPacked: newPacked,
//           isPacked: newPacked > 0,
//           isFullyPacked: newPacked === ordered,
//         };
//       });

//       return copy;
//     };

//     // Apply optimistic global mutate
//     await globalMutate(
//       SWR_KEY,
//       (current) => optimisticUpdater(current),
//       false, // don't revalidate yet
//     );

//     // Update modal immediately
//     setSelectedItem((prev) => {
//       if (!prev) return prev;
//       const updatedIndividualItems = (prev.individualItems || []).map((it) =>
//         it._id === individualItemId
//           ? { ...it, isPacked, packed: isPacked ? 1 : 0 }
//           : it,
//       );
//       const packedCount = updatedIndividualItems.filter(
//         (x) => x.isPacked,
//       ).length;
//       const totalCount = updatedIndividualItems.length;
//       return {
//         ...prev,
//         individualItems: updatedIndividualItems,
//         packed: packedCount,
//         isPacked: packedCount > 0,
//         isFullyPacked: packedCount === totalCount,
//       };
//     });

//     // Make API call
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/packing/update-individual-packed`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ packingId: individualItemId, isPacked }),
//         },
//       );
//       const json = await res.json();
//       if (!json?.success) {
//         throw new Error(json?.message || "Failed to update packing status");
//       }
//       // Background revalidate eventually to sync
//       mutate();
//     } catch (err) {
//       // Revert optimistic update on failure
//       console.log("[v0] update failed, reverting:", err.message);
//       await globalMutate(SWR_KEY, undefined, true); // revalidate to restore
//       alert("Update failed: " + err.message);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   useEffect(() => {
//     if (data && Array.isArray(data.groupedData) && !isValidating) {
//       setLastRefreshed(new Date());
//     }
//   }, [data, isValidating]);

//   useEffect(() => {
//     const onFocus = () => {
//       console.log("[v0] focus/visible -> revalidate");
//       mutate().then(() => setLastRefreshed(new Date()));
//     };
//     const onVisibility = () => {
//       if (document.visibilityState === "visible") onFocus();
//     };
//     window.addEventListener("focus", onFocus);
//     document.addEventListener("visibilitychange", onVisibility);
//     return () => {
//       window.removeEventListener("focus", onFocus);
//       document.removeEventListener("visibilitychange", onVisibility);
//     };
//   }, [mutate]);

//   useEffect(() => {
//     const id = setInterval(() => {
//       mutate().then(() => setLastRefreshed(new Date()));
//     }, 20000);
//     return () => clearInterval(id);
//   }, [mutate]);

//   useEffect(() => {
//     const id = setTimeout(() => {
//       mutate().then(() => setLastRefreshed(new Date()));
//     }, 300);
//     return () => clearTimeout(id);
//   }, [mutate]);

//   return (
//     <Container fluid className="py-4">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <h2 className="text-black mb-1">Item Packer</h2>
//               <p className="text-muted mb-0">
//                 Manage and track order packing progress
//                 {lastRefreshed && (
//                   <span className="text-success fw-bold ms-2">
//                     Last refreshed: {lastRefreshed.toLocaleTimeString()}
//                   </span>
//                 )}
//                 {isValidating && (
//                   <span className="text-warning fw-bold ms-2">
//                     <Spinner
//                       animation="border"
//                       size="sm"
//                       className="me-2"
//                       style={{ width: "1rem", height: "1rem" }}
//                     />
//                     <Spinner
//                       animation="border"
//                       size="sm"
//                       style={{ width: "1rem", height: "1rem" }}
//                     />
//                   </span>
//                 )}
//               </p>
//             </div>
//             <div className="d-flex gap-2">
//               <div className="d-flex gap-2">
//                 <Link to="/packer-dashboard">
//                   <button
//                     className="btn packer-toggle-btn"
//                     style={{
//                       backgroundColor: "#6c757d",
//                       color: "white",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     <FaTable className="me-2" /> View Orders
//                   </button>
//                 </Link>
//                 <button
//                   className="btn packer-toggle-btn"
//                   style={{
//                     backgroundColor: "#6B8E23",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                   onClick={handleRefresh}
//                   disabled={isValidating}
//                 >
//                   <FaListAlt className="me-2" /> Refresh
//                 </button>
//               </div>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {/* Summary Cards */}
//       {!loading && summary.totalGroups > 0 && (
//         <Row className="mb-4">
//           <Col md={4}>
//             <Card
//               className="text-center"
//               style={{ backgroundColor: "#aeaeae" }}
//             >
//               <Card.Body>
//                 <Card.Title className="text-black fs-2 fw-bold">
//                   {summary.totalOrdered || 0}
//                 </Card.Title>
//                 <Card.Text className="text-black">Total Ordered</Card.Text>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={4}>
//             <Card
//               className="text-center"
//               style={{ backgroundColor: "#6B8E23" }}
//             >
//               <Card.Body>
//                 <Card.Title className="text-white fs-2 fw-bold">
//                   {summary.totalPacked || 0}
//                 </Card.Title>
//                 <Card.Text className="text-white">Packed Items</Card.Text>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={4}>
//             <Card
//               className="text-center"
//               style={{ backgroundColor: "#FFD700" }}
//             >
//               <Card.Body>
//                 <Card.Title className="text-black fs-2 fw-bold">
//                   {summary.remainingItems || 0}
//                 </Card.Title>
//                 <Card.Text className="text-black">Remaining Items</Card.Text>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       )}

//       {/* Filters */}
//       <Card className="mb-4" style={{ backgroundColor: "#fff8dc" }}>
//         <Card.Body>
//           <Row>
//             {userRole === "admin" && (
//               <Col md={3}>
//                 <Form.Group>
//                   <Form.Label>Hub</Form.Label>
//                   <Form.Select
//                     value={filters.hub}
//                     onChange={(e) => handleFilterChange("hub", e.target.value)}
//                   >
//                     <option value="all">All Hubs</option>
//                     {availableFilters.hubs.map((hub) => (
//                       <option key={hub} value={hub}>
//                         {hub}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             )}
//             <Col md={userRole === "admin" ? 3 : 4}>
//               <Form.Group>
//                 <Form.Label>Delivery Slot</Form.Label>
//                 <Form.Select
//                   value={filters.slot}
//                   onChange={(e) => handleFilterChange("slot", e.target.value)}
//                 >
//                   <option value="all">All Slots</option>
//                   {availableFilters.slots.map((slot) => (
//                     <option key={slot} value={slot}>
//                       {slot}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//             <Col md={userRole === "admin" ? 4 : 5}>
//               <Form.Group>
//                 <Form.Label>Delivery Location</Form.Label>
//                 <Form.Select
//                   value="all"
//                   onChange={(e) => handleDeliveryLocationSelect(e.target.value)}
//                 >
//                   <option value="all">Select Locations (Multi-select)</option>
//                   {availableFilters.deliveryLocations.map((location) => (
//                     <option key={location} value={location}>
//                       {location}
//                     </option>
//                   ))}
//                 </Form.Select>

//                 {filters.deliveryLocations.length > 0 && (
//                   <div className="mt-2">
//                     <div className="d-flex justify-content-between align-items-center mb-2">
//                       <small className="text-muted">Selected Locations:</small>
//                       <Button
//                         variant="link"
//                         size="sm"
//                         className="p-0 text-danger"
//                         onClick={clearAllDeliveryLocations}
//                       >
//                         Clear All
//                       </Button>
//                     </div>
//                     <div className="d-flex flex-wrap gap-1">
//                       {filters.deliveryLocations.map((location) => (
//                         <Badge
//                           key={location}
//                           bg="primary"
//                           className="d-flex align-items-center gap-1"
//                         >
//                           {location}
//                           <FaTimes
//                             className="cursor-pointer"
//                             style={{ cursor: "pointer", fontSize: "0.8rem" }}
//                             onClick={() => removeDeliveryLocation(location)}
//                           />
//                         </Badge>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </Form.Group>
//             </Col>
//             <Col md={userRole === "admin" ? 2 : 3}>
//               <div className="text-muted small">
//                 <div>Showing:</div>
//                 {userRole === "admin" && (
//                   <div>
//                     <strong>
//                       {filters.hub === "all" ? "All Hubs" : filters.hub}
//                     </strong>
//                   </div>
//                 )}
//                 <div>
//                   <strong>
//                     {filters.slot === "all" ? "All Slots" : filters.slot}
//                   </strong>
//                 </div>
//                 <div>
//                   <strong>
//                     {filters.deliveryLocations.length > 0
//                       ? `${filters.deliveryLocations.length} location(s)`
//                       : filters.deliveryLocation === "all"
//                         ? "All Locations"
//                         : filters.deliveryLocation}
//                   </strong>
//                 </div>
//               </div>
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       {error && (
//         <Alert variant="danger" className="mb-4">
//           <Alert.Heading>Error Loading Data</Alert.Heading>
//           <div className="mb-1">{error.message || "Failed to fetch data."}</div>
//           {data?.__fromCache && (
//             <small className="text-muted">
//               Showing cached data. We'll refresh in the background when the
//               network is available.
//             </small>
//           )}
//         </Alert>
//       )}

//       {loading && (
//         <div className="text-center py-5">
//           <Spinner animation="border" variant="primary" />
//           <p className="mt-2">Loading packing data...</p>
//         </div>
//       )}

//       {!loading && groupedItems.length > 0 && (
//         <Card>
//           <Card.Header className="d-flex justify-content-between align-items-center">
//             <h5 className="mb-0">Packing Summary - All Items</h5>
//             <Badge bg="primary">{groupedItems.length} unique items</Badge>
//           </Card.Header>
//           <Card.Body className="p-0">
//             <div className="packer-table-responsive shadow-lg rounded">
//               <table className="table table-hover">
//                 <thead style={{ backgroundColor: "#6B8E23", color: "white" }}>
//                   <tr>
//                     <th>Category</th>
//                     {userRole === "admin" && <th>Hub</th>}
//                     <th>Available Slots</th>
//                     <th>Total Ordered</th>
//                     <th>Total Packed</th>
//                     <th>Yet to Pack</th>
//                     <th>Pack Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {groupedItems.map((item, index) => {
//                     const totalOrdered = Number(item.totalOrdered) || 0;
//                     const totalPacked = Number(item.totalPacked) || 0;
//                     const remainingQuantity = Math.max(
//                       0,
//                       totalOrdered - totalPacked,
//                     );
//                     const isFullyPacked = remainingQuantity === 0;
//                     const isPartiallyPacked = totalPacked > 0 && !isFullyPacked;

//                     return (
//                       <tr key={`${item.name}-${item.hub[0]}-${index}`}>
//                         <td>
//                           <strong
//                             className="d-flex align-items-center gap-2 justify-content-center"
//                             style={{ fontSize: "18px" }}
//                           >
//                             <span
//                               className={`d-inline-block rounded-circle ${
//                                 item.category &&
//                                 item.category.toLowerCase() === "veg"
//                                   ? "bg-success"
//                                   : "bg-danger"
//                               }`}
//                               style={{ width: "12px", height: "12px" }}
//                             ></span>
//                             {item.categoryName}
//                           </strong>
//                           <br />
//                           <small>{item.name}</small>
//                         </td>
//                         {userRole === "admin" && (
//                           <td>
//                             <Badge bg="secondary" style={{ fontSize: "18px" }}>
//                               {item.hub[0]}
//                             </Badge>
//                           </td>
//                         )}
//                         <td>
//                           <div className="d-flex flex-wrap gap-1 fs-6">
//                             {item.slots.map((slotInfo, idx) => (
//                               <Badge
//                                 key={idx}
//                                 bg={
//                                   slotInfo.isFullyPacked
//                                     ? "success"
//                                     : slotInfo.isPacked
//                                       ? "warning"
//                                       : "outline-info"
//                                 }
//                                 style={{
//                                   border: slotInfo.isFullyPacked
//                                     ? "none"
//                                     : "1px solid #8b4513",
//                                   color: slotInfo.isFullyPacked
//                                     ? "white"
//                                     : "#8b4513",
//                                 }}
//                               >
//                                 {slotInfo.slot} ({slotInfo.remaining || 0})
//                               </Badge>
//                             ))}
//                           </div>
//                         </td>
//                         <td>
//                           <span className="badge bg-secondary fs-6">
//                             {totalOrdered}
//                           </span>
//                         </td>
//                         <td>
//                           <span
//                             className={`badge ${
//                               isFullyPacked
//                                 ? "bg-success"
//                                 : isPartiallyPacked
//                                   ? "bg-warning"
//                                   : "bg-danger"
//                             } fs-6`}
//                           >
//                             {totalPacked}
//                           </span>
//                         </td>
//                         <td>
//                           <span className="badge bg-secondary fs-6">
//                             {remainingQuantity}
//                           </span>
//                         </td>
//                         <td>
//                           <Button
//                             size="sm"
//                             variant={
//                               remainingQuantity > 0
//                                 ? "success"
//                                 : "outline-success"
//                             }
//                             onClick={() => handlePackedClick(item)}
//                             disabled={isFullyPacked}
//                           >
//                             {remainingQuantity > 0
//                               ? `Pack Items`
//                               : "All Packed"}
//                           </Button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </Card.Body>
//         </Card>
//       )}

//       {!loading && !error && groupedItems.length === 0 && (
//         <Card>
//           <Card.Body className="text-center py-5">
//             <h5>No packing items found</h5>
//             <p className="text-muted">
//               {Array.isArray(packingData) && packingData.length === 0
//                 ? "There are no packing items for today. Items will appear here when orders are placed."
//                 : "No items match the current filters. Try selecting different hub, slot, or location filters."}
//             </p>
//           </Card.Body>
//         </Card>
//       )}

//       <Modal
//         show={showSlotModal}
//         onHide={handleCloseSlotModal}
//         size="xxl" // Changed from xl to xxl
//         style={{ maxWidth: "98vw" }} // Increased from 95vw to 98vw
//         dialogClassName="modal-dialog-scrollable" // Added for better scrolling
//       >
//         <Modal.Header closeButton className="py-3">
//           <Modal.Title className="h4">Select Delivery Slot</Modal.Title>{" "}
//           {/* Increased font size */}
//         </Modal.Header>
//         <Modal.Body className="p-4">
//           {" "}
//           {/* Increased padding */}
//           {selectedItemForSlot && (
//             <div>
//               <h5 className="mb-3">
//                 {" "}
//                 {/* Increased from h6 to h5 */}
//                 Packing: <strong>{selectedItemForSlot.name}</strong>
//               </h5>
//               <p className="text-muted fs-6">
//                 {" "}
//                 {/* Added font size */}
//                 Hub: {selectedItemForSlot.hub[0]} | Total Ordered:{" "}
//                 {selectedItemForSlot.totalOrdered || 0} | Total Packed:{" "}
//                 {selectedItemForSlot.totalPacked || 0}
//               </p>

//               <div className="row g-4">
//                 {" "}
//                 {/* Increased gap from g-3 to g-4 */}
//                 {selectedItemForSlot.slots.map((slotInfo, index) => (
//                   <div key={index} className="col-lg-6 col-md-12">
//                     {" "}
//                     {/* Adjusted columns for tablets */}
//                     <Card
//                       className={`h-100 cursor-pointer ${
//                         slotInfo.isFullyPacked
//                           ? "border-success"
//                           : "border-primary"
//                       }`}
//                       style={{
//                         cursor: slotInfo.isFullyPacked ? "default" : "pointer",
//                         opacity: slotInfo.isFullyPacked ? 0.7 : 1,
//                         minHeight: "140px", // Added minimum height for better touch targets
//                       }}
//                       onClick={() =>
//                         !slotInfo.isFullyPacked &&
//                         handleSlotSelect(slotInfo.slot)
//                       }
//                     >
//                       <Card.Body className="text-center p-4">
//                         {" "}
//                         {/* Increased padding */}
//                         <h5 className="mb-3">{slotInfo.slot}</h5>{" "}
//                         {/* Increased font size */}
//                         <div className="mt-3">
//                           {" "}
//                           {/* Increased margin */}
//                           <div className="mb-3">
//                             {" "}
//                             {/* Increased margin */}
//                             <Badge bg="primary" className="fs-6 p-2">
//                               {" "}
//                               {/* Increased font size and padding */}
//                               Ordered: {slotInfo.ordered || 0}
//                             </Badge>
//                           </div>
//                           <div className="mb-3">
//                             <Badge
//                               bg={
//                                 (slotInfo.packed || 0) > 0
//                                   ? "success"
//                                   : "secondary"
//                               }
//                               className="fs-6 p-2"
//                             >
//                               Packed: {slotInfo.packed || 0}
//                             </Badge>
//                           </div>
//                           <div>
//                             <Badge
//                               bg={
//                                 (slotInfo.remaining || 0) > 0
//                                   ? "warning"
//                                   : "success"
//                               }
//                               className="fs-6 p-2"
//                             >
//                               {(slotInfo.remaining || 0) > 0
//                                 ? `${slotInfo.remaining} to pack`
//                                 : "All packed"}
//                             </Badge>
//                           </div>
//                         </div>
//                         {slotInfo.isFullyPacked && (
//                           <div className="mt-3">
//                             <FaCheckCircle className="text-success fs-5" />{" "}
//                             {/* Increased icon size */}
//                             <small className="text-success ms-1 fs-6">
//                               Fully Packed
//                             </small>
//                           </div>
//                         )}
//                       </Card.Body>
//                     </Card>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* Individual Packing Modal - Made larger */}
//       {showModal && selectedItem && (
//         <div
//           className="modal fade show d-block"
//           tabIndex="-1"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//         >
//           <div
//             className="modal-dialog modal-xxl modal-dialog-scrollable"
//             style={{ maxWidth: "98vw" }}
//           >
//             <div className="modal-content">
//               <div className="modal-header py-3">
//                 <h4 className="modal-title">
//                   Packing: {selectedItem.name}
//                   <small className="text-muted d-block fs-6 mt-1">
//                     {selectedItem.unit} | {selectedItem.hub[0]} |{" "}
//                     {selectedItem.slot}
//                   </small>
//                 </h4>
//                 <button
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                   style={{ transform: "scale(1.2)" }}
//                 ></button>
//               </div>

//               <div className="modal-body p-4">
//                 <div className="row mb-5">
//                   <div className="col-4 text-center">
//                     <div className="card bg-light h-100">
//                       <div className="card-body p-4">
//                         <h5 className="card-title text-muted mb-2">Total</h5>
//                         <h3 className="mb-0 text-primary">
//                           {selectedItem.totalOrdered || 0}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-4 text-center">
//                     <div className="card bg-light h-100">
//                       <div className="card-body p-4">
//                         <h5 className="card-title text-muted mb-2">Packed</h5>
//                         <h3 className="mb-0 text-success">
//                           {selectedItem.packed || 0}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-4 text-center">
//                     <div className="card bg-light h-100">
//                       <div className="card-body p-4">
//                         <h5 className="card-title text-muted mb-2">
//                           Remaining
//                         </h5>
//                         <h3 className="mb-0 text-warning">
//                           {Math.max(
//                             0,
//                             (selectedItem.totalOrdered || 0) -
//                               (selectedItem.packed || 0),
//                           )}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row g-4">
//                   {selectedItem.individualItems?.map((individualItem) => (
//                     <div
//                       key={individualItem._id}
//                       className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-12"
//                     >
//                       {/* Changed from col-xl-3 col-lg-4 col-md-6 to col-xl-4 col-lg-4 col-md-4 for 3 columns */}
//                       <div
//                         className={`card h-100 cursor-pointer ${
//                           individualItem.isPacked
//                             ? "border-success bg-success"
//                             : "border-warning bg-light"
//                         }`}
//                         style={{
//                           transition: "all 0.2s",
//                           cursor: "pointer",
//                           minHeight: "120px",
//                         }}
//                         onClick={async () => {
//                           await updateIndividualPackingStatus(
//                             individualItem._id,
//                             !individualItem.isPacked,
//                           );
//                         }}
//                       >
//                         <div className="card-body text-center p-3 d-flex flex-column justify-content-center">
//                           {/* Reduced padding from p-4 to p-3 for smaller boxes */}
//                           <h6
//                             className={`card-title mb-2 ${
//                               individualItem.isPacked
//                                 ? "text-white"
//                                 : "text-dark"
//                             }`}
//                           >
//                             {/* Changed from h5 to h6 for smaller text */}
//                             {selectedItem.categoryName}
//                           </h6>
//                           <div className="mt-1">
//                             {/* Reduced margin */}
//                             {individualItem.isPacked ? (
//                               <div className="text-white fs-6">
//                                 <FaCheckCircle className="me-1 fs-6" />
//                                 {/* Reduced icon size and margin */}
//                                 <span>Packed</span>
//                               </div>
//                             ) : (
//                               <div className="text-dark fs-6">
//                                 <FaBox className="me-1 fs-6" />
//                                 <span>Click to Pack</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="modal-footer py-3">
//                 <button
//                   className="btn btn-secondary btn-lg"
//                   onClick={handleCloseModal}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default PackerOrders;

// "use client";

// import { useState, useMemo, useRef, useEffect } from "react";
// import useSWR, { mutate as globalMutate } from "swr";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Badge,
//   Form,
//   Button,
//   Alert,
//   Spinner,
//   Modal,
// } from "react-bootstrap";
// import {
//   FaCheckCircle,
//   FaBox,
//   FaTable,
//   FaListAlt,
// } from "react-icons/fa";
// import { Link } from "react-router-dom";

// // Constants - Updated to match backend
// const API_BASE_URL = "https://dd-backend-3nm0.onrender.com/api";
// const ADMIN_ORDERS_URL = `${API_BASE_URL}/admin/getPackerOrders2`;
// const PACKING_GROUPED_URL = `${API_BASE_URL}/packer/packing/today/grouped`;
// const HUBS_API_URL = `${API_BASE_URL}/Hub/hubs`;
// const SWR_KEY = "packer:combined";
// const LOCAL_CACHE_KEY = "packer:combined:cache:v1";
// const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// function getUserRole() {
//   if (typeof window === "undefined") return null;

//   const isAdmin = localStorage.getItem("admin");
//   if (isAdmin === "Admin Login Successfully") {
//     return "admin";
//   }

//   const packerData = localStorage.getItem("packer");
//   if (packerData) {
//     try {
//       const packer = JSON.parse(packerData);
//       return "packer";
//     } catch {
//       return null;
//     }
//   }

//   return null;
// }

// function getPackerData() {
//   if (typeof window === "undefined") return null;

//   const packerData = localStorage.getItem("packer");
//   if (packerData) {
//     try {
//       return JSON.parse(packerData);
//     } catch {
//       return null;
//     }
//   }

//   return null;
// }

// // Util: read/write local cache with TTL
// function readLocalCache() {
//   try {
//     const raw = localStorage.getItem(LOCAL_CACHE_KEY);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     if (!parsed || !parsed.data || !parsed.ts) return null;
//     if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
//     return parsed.data;
//   } catch {}
//   return null;
// }
// function writeLocalCache(data) {
//   try {
//     localStorage.setItem(
//       LOCAL_CACHE_KEY,
//       JSON.stringify({ data, ts: Date.now() }),
//     );
//   } catch {}
// }

// // AbortError helper and clearer error messaging
// function isAbortError(err) {
//   return err?.name === "AbortError" || /aborted/i.test(err?.message || "");
// }

// // Fetch with timeout + graceful fallback to cache
// async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeoutMs);
//   try {
//     const res = await fetch(url, {
//       cache: "no-store",
//       ...opts,
//       signal: controller.signal,
//     });
//     if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
//     const ct = res.headers.get("content-type") || "";
//     if (!ct.includes("application/json")) {
//       const text = await res.text();
//       throw new Error(`Non-JSON for ${url}: ${text.slice(0, 120)}...`);
//     }
//     const json = await res.json();
//     return json;
//   } catch (err) {
//     if (isAbortError(err)) {
//       throw new Error(`Request timed out after ${timeoutMs}ms`);
//     }
//     throw err;
//   } finally {
//     clearTimeout(id);
//   }
// }

// // Add cache-busting helper for grouped endpoint
// function withBust(url) {
//   const sep = url.includes("?") ? "&" : "?";
//   return `${url}${sep}ts=${Date.now()}`;
// }

// // Combined fetcher for SWR
// async function fetchCombined() {
//   const cached = readLocalCache();

//   // 1) First call the admin transform endpoint
//   let adminData = null;
//   try {
//     adminData = await fetchWithTimeout(ADMIN_ORDERS_URL, {}, 5000);
//   } catch (e) {
//     console.log("[v1] getPackerOrders2 skipped/failed:", e.message);
//   }

//   // 2) Fetch grouped data with retries
//   let groupedJson = null;
//   for (let attempt = 0; attempt < 3; attempt++) {
//     try {
//       groupedJson = await fetchWithTimeout(
//         withBust(PACKING_GROUPED_URL),
//         {},
//         6000,
//       );
//       break;
//     } catch (e) {
//       if (attempt < 2) {
//         await new Promise((r) => setTimeout(r, 500));
//         continue;
//       }
//       console.log("[v1] grouped fetch failed:", e.message);
//     }
//   }

//   // Extract groupedData from backend response structure
//   let groupedData = [];
//   if (
//     Array.isArray(groupedJson?.data?.groupedData) &&
//     groupedJson.data.groupedData.length > 0
//   ) {
//     groupedData = groupedJson.data.groupedData;
//   } else if (Array.isArray(groupedJson?.groupedData)) {
//     groupedData = groupedJson.groupedData;
//   } else if (
//     cached &&
//     Array.isArray(cached.groupedData) &&
//     cached.groupedData.length > 0
//   ) {
//     groupedData = cached.groupedData;
//   }

//   if (!Array.isArray(groupedData)) groupedData = [];

//   const combined = {
//     adminResult: adminData,
//     groupedData,
//     __fromCache: !(Array.isArray(groupedJson?.groupedData) && groupedJson.groupedData.length > 0),
//   };

//   writeLocalCache(combined);
//   return combined;
// }

// // Custom hook: SWR + fallbackData from localStorage for instant paint
// function usePackingData() {
//   const fallbackData = typeof window !== "undefined" ? readLocalCache() : null;

//   const {
//     data,
//     error,
//     isValidating,
//     mutate: swrMutate,
//   } = useSWR(SWR_KEY, fetchCombined, {
//     fallbackData,
//     revalidateOnFocus: true,
//     revalidateOnReconnect: true,
//     revalidateOnMount: true,
//     revalidateIfStale: true,
//     dedupingInterval: 2000,
//     refreshInterval: 0,
//     refreshWhenHidden: true,
//     errorRetryCount: 1,
//     errorRetryInterval: 3000,
//     shouldRetryOnError: (err) => {
//       if (isAbortError(err)) return false;
//       return true;
//     },
//   });

//   return {
//     data,
//     error,
//     isValidating,
//     refresh: () => swrMutate(),
//     mutate: swrMutate,
//   };
// }

// function useHubs() {
//   const { data, error, isValidating } = useSWR(
//     HUBS_API_URL,
//     async (url) => {
//       try {
//         const res = await fetchWithTimeout(url, {}, 8000);
//         return Array.isArray(res) ? res : [];
//       } catch (err) {
//         console.log("[v1] hubs fetch failed:", err.message);
//         return [];
//       }
//     },
//     {
//       revalidateOnFocus: false,
//       revalidateOnReconnect: false,
//       dedupingInterval: 60000,
//     },
//   );

//   return {
//     hubs: data || [],
//     hubsLoading: isValidating,
//     hubsError: error,
//   };
// }

// function getPackerHubName(packerHubIds, allHubs) {
//   if (!Array.isArray(packerHubIds) || !Array.isArray(allHubs)) return null;
//   const matchedHub = allHubs.find((hub) => packerHubIds.includes(hub.hubId));
//   return matchedHub ? matchedHub.hubName : null;
// }

// // Simplified - only need hubs and sessions
// function useAvailableFilters(groupedData, userRole, packerData, allHubs, packerHubName) {
//   return useMemo(() => {
//     if (!Array.isArray(groupedData)) {
//       return { hubs: [], sessions: [] };
//     }

//     const hubs = [
//       ...new Set(
//         groupedData
//           .map((item) => item.hubName)
//           .filter(Boolean)
//       ),
//     ];

//     const sessions = [
//       ...new Set(
//         groupedData
//           .map((item) => item.session)
//           .filter(Boolean)
//       ),
//     ];

//     return { hubs, sessions };
//   }, [groupedData]);
// }

// // Simplified summary calculation - only hub and session filters
// function useSummary(packingData, filters, userRole, packerHubName) {
//   return useMemo(() => {
//     if (!Array.isArray(packingData))
//       return {
//         totalGroups: 0,
//         totalOrdered: 0,
//         totalPacked: 0,
//         remainingItems: 0,
//         fullyPackedGroups: 0,
//         partiallyPackedGroups: 0,
//         notPackedGroups: 0,
//       };

//     let filtered = packingData;

//     if (userRole === "packer" && packerHubName) {
//       filtered = filtered.filter((item) => item.hubName === packerHubName);
//     } else if (userRole === "admin") {
//       if (filters.hub !== "all") {
//         filtered = filtered.filter((item) => item.hubName === filters.hub);
//       }
//     }

//     if (filters.session !== "all") {
//       filtered = filtered.filter((item) => item.session === filters.session);
//     }

//     const totalOrdered = filtered.reduce(
//       (sum, it) => sum + (Number(it.totalOrdered) || 0),
//       0,
//     );
//     const totalPacked = filtered.reduce(
//       (sum, it) => sum + (Number(it.packed) || 0),
//       0,
//     );

//     return {
//       totalGroups: filtered.length,
//       totalOrdered,
//       totalPacked,
//       remainingItems: Math.max(0, totalOrdered - totalPacked),
//       fullyPackedGroups: filtered.filter((it) => it.isFullyPacked).length,
//       partiallyPackedGroups: filtered.filter(
//         (it) => it.isPacked && !it.isFullyPacked,
//       ).length,
//       notPackedGroups: filtered.filter((it) => !it.isPacked).length,
//     };
//   }, [packingData, filters, userRole, packerHubName]);
// }

// // Simplified grouping logic - only hub and session filters
// function useGroupedItems(packingData, filters, userRole, packerHubName) {
//   return useMemo(() => {
//     if (!Array.isArray(packingData)) return [];

//     const groupedMap = new Map();

//     for (const item of packingData) {
//       if (!item || typeof item !== "object") continue;

//       // Filter by hub
//       if (userRole === "packer" && packerHubName) {
//         if (item.hubName !== packerHubName) continue;
//       } else if (userRole === "admin") {
//         if (filters.hub !== "all" && item.hubName !== filters.hub) continue;
//       }

//       // Filter by session
//       if (filters.session !== "all" && item.session !== filters.session) continue;

//       // Create grouping key
//       const key = `${item.name}-${item.hubName}`;
//       if (!groupedMap.has(key)) {
//         groupedMap.set(key, {
//           name: item.name || "Unknown Item",
//           category: item.category || "Unknown Category",
//           categoryName: item.categoryName || "Unknown Category Name",
//           unit: item.unit || "unit",
//           hub: [item.hubName],
//           hubName: item.hubName,
//           totalOrdered: 0,
//           totalPacked: 0,
//           sessions: new Map(),
//           isPacked: false,
//           isFullyPacked: false,
//         });
//       }

//       const group = groupedMap.get(key);
//       const itemOrdered = Number(item.totalOrdered) || 0;
//       const itemPacked = Number(item.packed) || 0;

//       group.totalOrdered += itemOrdered;
//       group.totalPacked += itemPacked;

//       // Group by session
//       const sessionName = item.session || "Unknown Session";
//       if (!group.sessions.has(sessionName)) {
//         group.sessions.set(sessionName, {
//           session: sessionName,
//           ordered: itemOrdered,
//           packed: itemPacked,
//           remaining: Math.max(0, itemOrdered - itemPacked),
//           isFullyPacked: !!item.isFullyPacked,
//           isPacked: !!item.isPacked,
//         });
//       } else {
//         const s = group.sessions.get(sessionName);
//         s.ordered += itemOrdered;
//         s.packed += itemPacked;
//         s.remaining = Math.max(0, s.ordered - s.packed);
//         s.isPacked = s.packed > 0;
//         s.isFullyPacked = s.packed === s.ordered;
//       }

//       group.isPacked = group.totalPacked > 0;
//       group.isFullyPacked = group.totalPacked === group.totalOrdered;
//     }

//     return Array.from(groupedMap.values()).map((g) => ({
//       ...g,
//       sessions: Array.from(g.sessions.values()),
//       totalOrdered: Number(g.totalOrdered) || 0,
//       totalPacked: Number(g.totalPacked) || 0,
//       remaining: Math.max(
//         0,
//         (Number(g.totalOrdered) || 0) - (Number(g.totalPacked) || 0),
//       ),
//     }));
//   }, [packingData, filters, userRole, packerHubName]);
// }

// const PackerOrders = () => {
//   const [userRole, setUserRole] = useState(null);
//   const [packerData, setPackerData] = useState(null);
//   const { hubs: allHubs } = useHubs();
//   const [packerHubName, setPackerHubName] = useState(null);

//   // Simplified filters - only hub and session
//   const [filters, setFilters] = useState(() => {
//     try {
//       const raw = sessionStorage.getItem("packer:filters:simple");
//       return raw
//         ? JSON.parse(raw)
//         : {
//             hub: "all",
//             session: "all",
//           };
//     } catch {
//       return {
//         hub: "all",
//         session: "all",
//       };
//     }
//   });

//   useEffect(() => {
//     try {
//       sessionStorage.setItem("packer:filters:simple", JSON.stringify(filters));
//     } catch {}
//   }, [filters]);

//   useEffect(() => {
//     const role = getUserRole();
//     setUserRole(role);

//     if (role === "packer") {
//       const pData = getPackerData();
//       setPackerData(pData);
//     }
//   }, []);

//   useEffect(() => {
//     if (
//       userRole === "packer" &&
//       packerData?.hubs &&
//       Array.isArray(allHubs) &&
//       allHubs.length > 0
//     ) {
//       const hubName = getPackerHubName(packerData.hubs, allHubs);
//       if (hubName) {
//         setPackerHubName(hubName);
//         setFilters((prev) => ({
//           ...prev,
//           hub: hubName,
//         }));
//       }
//     }
//   }, [userRole, packerData, allHubs]);

//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showSessionModal, setShowSessionModal] = useState(false);
//   const [selectedItemForSession, setSelectedItemForSession] = useState(null);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [lastRefreshed, setLastRefreshed] = useState(null);
//   const lastGoodDataRef = useRef(null);

//   // SWR data
//   const { data, error, isValidating, refresh, mutate } = usePackingData();
//   const packingData = data?.groupedData || [];

//   // Keep a ref to the last good data
//   useEffect(() => {
//     if (Array.isArray(packingData) && packingData.length > 0) {
//       lastGoodDataRef.current = packingData;
//     }
//   }, [packingData]);

//   const availableFilters = useAvailableFilters(
//     packingData,
//     userRole,
//     packerData,
//     allHubs,
//     packerHubName,
//   );

//   const summary = useSummary(
//     packingData,
//     filters,
//     userRole,
//     packerHubName,
//   );

//   const groupedItems = useGroupedItems(
//     packingData,
//     filters,
//     userRole,
//     packerHubName,
//   );

//   const loading = !data && !error && !lastGoodDataRef.current;

//   const handleFilterChange = (filterType, value) => {
//     setFilters((prev) => ({ ...prev, [filterType]: value }));
//   };

//   const handleRefresh = async () => {
//     console.log("[simple] manual refresh requested");
//     await mutate();
//     setLastRefreshed(new Date());
//   };

//   const handlePackedClick = (item) => {
//     setSelectedItemForSession(item);
//     setShowSessionModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setIsUpdating(false);
//   };

//   const handleCloseSessionModal = () => {
//     setShowSessionModal(false);
//     setIsUpdating(false);
//   };

//   const handleSessionSelect = async (session) => {
//     setShowSessionModal(false);
//     try {
//       const url = `${API_BASE_URL}/packer/packing/today/individual?name=${encodeURIComponent(
//         selectedItemForSession.name,
//       )}&hubName=${selectedItemForSession.hubName}&session=${session}`;

//       const res = await fetchWithTimeout(url, {}, 8000);
//       if (res?.success && Array.isArray(res?.data)) {
//         const individualItems = res.data;
//         const packedCount = individualItems.filter((it) => it.isPacked).length;
//         const totalCount = individualItems.length;

//         setSelectedItem({
//           ...selectedItemForSession,
//           session,
//           individualItems,
//           totalOrdered: totalCount,
//           packed: packedCount,
//           isPacked: packedCount > 0,
//           isFullyPacked: packedCount === totalCount,
//         });
//         setShowModal(true);
//       } else {
//         alert("No individual items found for this session");
//       }
//     } catch (err) {
//       console.log("[simple] individual items fetch failed:", err.message);
//       alert("Error fetching individual items: " + err.message);
//     }
//   };

//   const updateIndividualPackingStatus = async (individualItemId, isPacked) => {
//     if (!selectedItem || !selectedItemForSession) return;
//     setIsUpdating(true);

//     const optimisticUpdater = (current) => {
//       if (!current) return current;
//       const copy = {
//         ...current,
//         groupedData: [...(current.groupedData || [])],
//       };

//       copy.groupedData = copy.groupedData.map((it) => {
//         const matches =
//           it.name === selectedItemForSession.name &&
//           it.hubName === selectedItemForSession.hubName &&
//           it.session === selectedItem.session;

//         if (!matches) return it;

//         const currentItems = (selectedItem.individualItems || []).map((x) =>
//           x._id === individualItemId ? { ...x, isPacked } : x,
//         );

//         const newPacked = currentItems.filter((x) => x.isPacked).length;
//         const ordered = Number(it.totalOrdered || 0);

//         return {
//           ...it,
//           packed: newPacked,
//           isPacked: newPacked > 0,
//           isFullyPacked: newPacked === ordered,
//         };
//       });

//       return copy;
//     };

//     await globalMutate(
//       SWR_KEY,
//       (current) => optimisticUpdater(current),
//       false,
//     );

//     setSelectedItem((prev) => {
//       if (!prev) return prev;
//       const updatedIndividualItems = (prev.individualItems || []).map((it) =>
//         it._id === individualItemId
//           ? { ...it, isPacked, packed: isPacked ? 1 : 0 }
//           : it,
//       );

//       const packedCount = updatedIndividualItems.filter(
//         (x) => x.isPacked,
//       ).length;

//       const totalCount = updatedIndividualItems.length;

//       return {
//         ...prev,
//         individualItems: updatedIndividualItems,
//         packed: packedCount,
//         isPacked: packedCount > 0,
//         isFullyPacked: packedCount === totalCount,
//       };
//     });

//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/packer/packing/update-individual-packed`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ packingId: individualItemId, isPacked }),
//         },
//       );

//       const json = await res.json();
//       if (!json?.success) {
//         throw new Error(json?.message || "Failed to update packing status");
//       }

//       mutate();
//     } catch (err) {
//       console.log("[simple] update failed:", err.message);
//       await globalMutate(SWR_KEY, undefined, true);
//       alert("Update failed: " + err.message);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   useEffect(() => {
//     if (data && Array.isArray(data.groupedData) && !isValidating) {
//       setLastRefreshed(new Date());
//     }
//   }, [data, isValidating]);

//   useEffect(() => {
//     const onFocus = () => {
//       console.log("[simple] focus/visible -> revalidate");
//       mutate().then(() => setLastRefreshed(new Date()));
//     };
//     const onVisibility = () => {
//       if (document.visibilityState === "visible") onFocus();
//     };
//     window.addEventListener("focus", onFocus);
//     document.addEventListener("visibilitychange", onVisibility);
//     return () => {
//       window.removeEventListener("focus", onFocus);
//       document.removeEventListener("visibilitychange", onVisibility);
//     };
//   }, [mutate]);

//   useEffect(() => {
//     const id = setInterval(() => {
//       mutate().then(() => setLastRefreshed(new Date()));
//     }, 20000);
//     return () => clearInterval(id);
//   }, [mutate]);

//   useEffect(() => {
//     const id = setTimeout(() => {
//       mutate().then(() => setLastRefreshed(new Date()));
//     }, 300);
//     return () => clearTimeout(id);
//   }, [mutate]);

//   return (
//     <Container fluid className="py-4">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <h2 className="text-black mb-1">Item Packer</h2>
//               <p className="text-muted mb-0">
//                 Manage and track order packing progress
//                 {lastRefreshed && (
//                   <span className="text-success fw-bold ms-2">
//                     Last refreshed: {lastRefreshed.toLocaleTimeString()}
//                   </span>
//                 )}
//                 {isValidating && (
//                   <span className="text-warning fw-bold ms-2">
//                     <Spinner
//                       animation="border"
//                       size="sm"
//                       className="me-2"
//                       style={{ width: "1rem", height: "1rem" }}
//                     />
//                     <Spinner
//                       animation="border"
//                       size="sm"
//                       style={{ width: "1rem", height: "1rem" }}
//                     />
//                   </span>
//                 )}
//               </p>
//             </div>
//             <div className="d-flex gap-2">
//               <div className="d-flex gap-2">
//                 <Link to="/packer-dashboard">
//                   <button
//                     className="btn packer-toggle-btn"
//                     style={{
//                       backgroundColor: "#6c757d",
//                       color: "white",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     <FaTable className="me-2" /> View Orders
//                   </button>
//                 </Link>
//                 <button
//                   className="btn packer-toggle-btn"
//                   style={{
//                     backgroundColor: "#6B8E23",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                   onClick={handleRefresh}
//                   disabled={isValidating}
//                 >
//                   <FaListAlt className="me-2" /> Refresh
//                 </button>
//               </div>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {/* Summary Cards */}
//       {!loading && summary.totalGroups > 0 && (
//         <Row className="mb-4">
//           <Col md={4}>
//             <Card
//               className="text-center"
//               style={{ backgroundColor: "#aeaeae" }}
//             >
//               <Card.Body>
//                 <Card.Title className="text-black fs-2 fw-bold">
//                   {summary.totalOrdered || 0}
//                 </Card.Title>
//                 <Card.Text className="text-black">Total Ordered</Card.Text>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={4}>
//             <Card
//               className="text-center"
//               style={{ backgroundColor: "#6B8E23" }}
//             >
//               <Card.Body>
//                 <Card.Title className="text-white fs-2 fw-bold">
//                   {summary.totalPacked || 0}
//                 </Card.Title>
//                 <Card.Text className="text-white">Packed Items</Card.Text>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={4}>
//             <Card
//               className="text-center"
//               style={{ backgroundColor: "#FFD700" }}
//             >
//               <Card.Body>
//                 <Card.Title className="text-black fs-2 fw-bold">
//                   {summary.remainingItems || 0}
//                 </Card.Title>
//                 <Card.Text className="text-black">Remaining Items</Card.Text>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       )}

//       {/* Simplified Filters - Only Hub and Session */}
//       <Card className="mb-4" style={{ backgroundColor: "#fff8dc" }}>
//         <Card.Body>
//           <Row>
//             {userRole === "admin" && (
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Hub</Form.Label>
//                   <Form.Select
//                     value={filters.hub}
//                     onChange={(e) => handleFilterChange("hub", e.target.value)}
//                   >
//                     <option value="all">All Hubs</option>
//                     {availableFilters.hubs.map((hub) => (
//                       <option key={hub} value={hub}>
//                         {hub}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             )}
//             <Col md={userRole === "admin" ? 6 : 12}>
//               <Form.Group>
//                 <Form.Label>Delivery Session</Form.Label>
//                 <Form.Select
//                   value={filters.session}
//                   onChange={(e) => handleFilterChange("session", e.target.value)}
//                 >
//                   <option value="all">All Sessions</option>
//                   {availableFilters.sessions.map((session) => (
//                     <option key={session} value={session}>
//                       {session}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//             <Col md={12} className="mt-3">
//               <div className="text-muted small">
//                 <div>Showing:</div>
//                 {userRole === "admin" && (
//                   <div>
//                     <strong>
//                       {filters.hub === "all" ? "All Hubs" : filters.hub}
//                     </strong>
//                   </div>
//                 )}
//                 <div>
//                   <strong>
//                     {filters.session === "all" ? "All Sessions" : filters.session}
//                   </strong>
//                 </div>
//               </div>
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       {error && (
//         <Alert variant="danger" className="mb-4">
//           <Alert.Heading>Error Loading Data</Alert.Heading>
//           <div className="mb-1">{error.message || "Failed to fetch data."}</div>
//           {data?.__fromCache && (
//             <small className="text-muted">
//               Showing cached data. We'll refresh in the background when the
//               network is available.
//             </small>
//           )}
//         </Alert>
//       )}

//       {loading && (
//         <div className="text-center py-5">
//           <Spinner animation="border" variant="primary" />
//           <p className="mt-2">Loading packing data...</p>
//         </div>
//       )}

//       {!loading && groupedItems.length > 0 && (
//         <Card>
//           <Card.Header className="d-flex justify-content-between align-items-center">
//             <h5 className="mb-0">Packing Summary - All Items</h5>
//             <Badge bg="primary">{groupedItems.length} unique items</Badge>
//           </Card.Header>
//           <Card.Body className="p-0">
//             <div className="packer-table-responsive shadow-lg rounded">
//               <table className="table table-hover">
//                 <thead style={{ backgroundColor: "#6B8E23", color: "white" }}>
//                   <tr>
//                     <th>Category</th>
//                     {userRole === "admin" && <th>Hub</th>}
//                     <th>Available Sessions</th>
//                     <th>Total Ordered</th>
//                     <th>Total Packed</th>
//                     <th>Yet to Pack</th>
//                     <th>Pack Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {groupedItems.map((item, index) => {
//                     const totalOrdered = Number(item.totalOrdered) || 0;
//                     const totalPacked = Number(item.totalPacked) || 0;
//                     const remainingQuantity = Math.max(
//                       0,
//                       totalOrdered - totalPacked,
//                     );
//                     const isFullyPacked = remainingQuantity === 0;
//                     const isPartiallyPacked = totalPacked > 0 && !isFullyPacked;

//                     return (
//                       <tr key={`${item.name}-${item.hubName}-${index}`}>
//                         <td>
//                           <strong
//                             className="d-flex align-items-center gap-2 justify-content-center"
//                             style={{ fontSize: "18px" }}
//                           >
//                             <span
//                               className={`d-inline-block rounded-circle ${
//                                 item.category &&
//                                 item.category.toLowerCase() === "veg"
//                                   ? "bg-success"
//                                   : "bg-danger"
//                               }`}
//                               style={{ width: "12px", height: "12px" }}
//                             ></span>
//                             {item.categoryName}
//                           </strong>
//                           <br />
//                           <small>{item.name}</small>
//                         </td>
//                         {userRole === "admin" && (
//                           <td>
//                             <Badge bg="secondary" style={{ fontSize: "18px" }}>
//                               {item.hubName}
//                             </Badge>
//                           </td>
//                         )}
//                         <td>
//                           <div className="d-flex flex-wrap gap-1 fs-6">
//                             {item.sessions.map((sessionInfo, idx) => (
//                               <Badge
//                                 key={idx}
//                                 bg={
//                                   sessionInfo.isFullyPacked
//                                     ? "success"
//                                     : sessionInfo.isPacked
//                                       ? "warning"
//                                       : "outline-info"
//                                 }
//                                 style={{
//                                   border: sessionInfo.isFullyPacked
//                                     ? "none"
//                                     : "1px solid #8b4513",
//                                   color: sessionInfo.isFullyPacked
//                                     ? "white"
//                                     : "#8b4513",
//                                 }}
//                               >
//                                 {sessionInfo.session} ({sessionInfo.remaining || 0})
//                               </Badge>
//                             ))}
//                           </div>
//                         </td>
//                         <td>
//                           <span className="badge bg-secondary fs-6">
//                             {totalOrdered}
//                           </span>
//                         </td>
//                         <td>
//                           <span
//                             className={`badge ${
//                               isFullyPacked
//                                 ? "bg-success"
//                                 : isPartiallyPacked
//                                   ? "bg-warning"
//                                   : "bg-danger"
//                             } fs-6`}
//                           >
//                             {totalPacked}
//                           </span>
//                         </td>
//                         <td>
//                           <span className="badge bg-secondary fs-6">
//                             {remainingQuantity}
//                           </span>
//                         </td>
//                         <td>
//                           <Button
//                             size="sm"
//                             variant={
//                               remainingQuantity > 0
//                                 ? "success"
//                                 : "outline-success"
//                             }
//                             onClick={() => handlePackedClick(item)}
//                             disabled={isFullyPacked}
//                           >
//                             {remainingQuantity > 0
//                               ? `Pack Items`
//                               : "All Packed"}
//                           </Button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </Card.Body>
//         </Card>
//       )}

//       {!loading && !error && groupedItems.length === 0 && (
//         <Card>
//           <Card.Body className="text-center py-5">
//             <h5>No packing items found</h5>
//             <p className="text-muted">
//               {Array.isArray(packingData) && packingData.length === 0
//                 ? "There are no packing items for today. Items will appear here when orders are placed."
//                 : "No items match the current filters. Try selecting different hub or session filters."}
//             </p>
//           </Card.Body>
//         </Card>
//       )}

//       {/* Session Selection Modal */}
//       <Modal
//         show={showSessionModal}
//         onHide={handleCloseSessionModal}
//         size="xxl"
//         style={{ maxWidth: "98vw" }}
//         dialogClassName="modal-dialog-scrollable"
//       >
//         <Modal.Header closeButton className="py-3">
//           <Modal.Title className="h4">Select Delivery Session</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="p-4">
//           {selectedItemForSession && (
//             <div>
//               <h5 className="mb-3">
//                 Packing: <strong>{selectedItemForSession.name}</strong>
//               </h5>
//               <p className="text-muted fs-6">
//                 Hub: {selectedItemForSession.hubName} | Total Ordered:{" "}
//                 {selectedItemForSession.totalOrdered || 0} | Total Packed:{" "}
//                 {selectedItemForSession.totalPacked || 0}
//               </p>

//               <div className="row g-4">
//                 {selectedItemForSession.sessions.map((sessionInfo, index) => (
//                   <div key={index} className="col-lg-6 col-md-12">
//                     <Card
//                       className={`h-100 cursor-pointer ${
//                         sessionInfo.isFullyPacked
//                           ? "border-success"
//                           : "border-primary"
//                       }`}
//                       style={{
//                         cursor: sessionInfo.isFullyPacked ? "default" : "pointer",
//                         opacity: sessionInfo.isFullyPacked ? 0.7 : 1,
//                         minHeight: "140px",
//                       }}
//                       onClick={() =>
//                         !sessionInfo.isFullyPacked &&
//                         handleSessionSelect(sessionInfo.session)
//                       }
//                     >
//                       <Card.Body className="text-center p-4">
//                         <h5 className="mb-3">{sessionInfo.session}</h5>
//                         <div className="mt-3">
//                           <div className="mb-3">
//                             <Badge bg="primary" className="fs-6 p-2">
//                               Ordered: {sessionInfo.ordered || 0}
//                             </Badge>
//                           </div>
//                           <div className="mb-3">
//                             <Badge
//                               bg={
//                                 (sessionInfo.packed || 0) > 0
//                                   ? "success"
//                                   : "secondary"
//                               }
//                               className="fs-6 p-2"
//                             >
//                               Packed: {sessionInfo.packed || 0}
//                             </Badge>
//                           </div>
//                           <div>
//                             <Badge
//                               bg={
//                                 (sessionInfo.remaining || 0) > 0
//                                   ? "warning"
//                                   : "success"
//                               }
//                               className="fs-6 p-2"
//                             >
//                               {(sessionInfo.remaining || 0) > 0
//                                 ? `${sessionInfo.remaining} to pack`
//                                 : "All packed"}
//                             </Badge>
//                           </div>
//                         </div>
//                         {sessionInfo.isFullyPacked && (
//                           <div className="mt-3">
//                             <FaCheckCircle className="text-success fs-5" />
//                             <small className="text-success ms-1 fs-6">
//                               Fully Packed
//                             </small>
//                           </div>
//                         )}
//                       </Card.Body>
//                     </Card>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* Individual Packing Modal */}
//       {showModal && selectedItem && (
//         <div
//           className="modal fade show d-block"
//           tabIndex="-1"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//         >
//           <div
//             className="modal-dialog modal-xxl modal-dialog-scrollable"
//             style={{ maxWidth: "98vw" }}
//           >
//             <div className="modal-content">
//               <div className="modal-header py-3">
//                 <h4 className="modal-title">
//                   Packing: {selectedItem.name}
//                   <small className="text-muted d-block fs-6 mt-1">
//                     {selectedItem.unit} | {selectedItem.hubName} |{" "}
//                     {selectedItem.session}
//                   </small>
//                 </h4>
//                 <button
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                   style={{ transform: "scale(1.2)" }}
//                 ></button>
//               </div>

//               <div className="modal-body p-4">
//                 <div className="row mb-5">
//                   <div className="col-4 text-center">
//                     <div className="card bg-light h-100">
//                       <div className="card-body p-4">
//                         <h5 className="card-title text-muted mb-2">Total</h5>
//                         <h3 className="mb-0 text-primary">
//                           {selectedItem.totalOrdered || 0}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-4 text-center">
//                     <div className="card bg-light h-100">
//                       <div className="card-body p-4">
//                         <h5 className="card-title text-muted mb-2">Packed</h5>
//                         <h3 className="mb-0 text-success">
//                           {selectedItem.packed || 0}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-4 text-center">
//                     <div className="card bg-light h-100">
//                       <div className="card-body p-4">
//                         <h5 className="card-title text-muted mb-2">
//                           Remaining
//                         </h5>
//                         <h3 className="mb-0 text-warning">
//                           {Math.max(
//                             0,
//                             (selectedItem.totalOrdered || 0) -
//                               (selectedItem.packed || 0),
//                           )}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row g-4">
//                   {selectedItem.individualItems?.map((individualItem) => (
//                     <div
//                       key={individualItem._id}
//                       className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-12"
//                     >
//                       <div
//                         className={`card h-100 cursor-pointer ${
//                           individualItem.isPacked
//                             ? "border-success bg-success"
//                             : "border-warning bg-light"
//                         }`}
//                         style={{
//                           transition: "all 0.2s",
//                           cursor: "pointer",
//                           minHeight: "120px",
//                         }}
//                         onClick={async () => {
//                           await updateIndividualPackingStatus(
//                             individualItem._id,
//                             !individualItem.isPacked,
//                           );
//                         }}
//                       >
//                         <div className="card-body text-center p-3 d-flex flex-column justify-content-center">
//                           <h6
//                             className={`card-title mb-2 ${
//                               individualItem.isPacked
//                                 ? "text-white"
//                                 : "text-dark"
//                             }`}
//                           >
//                             {selectedItem.categoryName}
//                           </h6>
//                           <div className="mt-1">
//                             {individualItem.isPacked ? (
//                               <div className="text-white fs-6">
//                                 <FaCheckCircle className="me-1 fs-6" />
//                                 <span>Packed</span>
//                               </div>
//                             ) : (
//                               <div className="text-dark fs-6">
//                                 <FaBox className="me-1 fs-6" />
//                                 <span>Click to Pack</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="modal-footer py-3">
//                 <button
//                   className="btn btn-secondary btn-lg"
//                   onClick={handleCloseModal}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default PackerOrders;

// "use client";

// import { useState, useMemo, useRef, useEffect } from "react";
// import useSWR, { mutate as globalMutate } from "swr";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Badge,
//   Form,
//   Button,
//   Alert,
//   Spinner,
//   Modal,
// } from "react-bootstrap";
// import {
//   FaCheckCircle,
//   FaBox,
//   FaTable,
//   FaListAlt,
//   FaMotorcycle,
// } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import axios from "axios";

// // Constants
// const API_BASE_URL = "https://dd-backend-3nm0.onrender.com/api";
// const ADMIN_ORDERS_URL = `${API_BASE_URL}/admin/getPackerOrders2`;
// const PACKING_GROUPED_URL = `${API_BASE_URL}/packer/packing/today/grouped`;
// const HUBS_API_URL = `${API_BASE_URL}/Hub/hubs`;
// const RIDERS_API_URL = `${API_BASE_URL}/admin/riders`;
// const SWR_KEY = "packer:combined";
// const LOCAL_CACHE_KEY = "packer:combined:cache:v1";
// const CACHE_TTL_MS = 5 * 60 * 1000;

// function getUserRole() {
//   if (typeof window === "undefined") return null;

//   const isAdmin = localStorage.getItem("admin");
//   if (isAdmin === "Admin Login Successfully") {
//     return "admin";
//   }

//   const packerData = localStorage.getItem("packer");
//   if (packerData) {
//     try {
//       const packer = JSON.parse(packerData);
//       return "packer";
//     } catch {
//       return null;
//     }
//   }

//   return null;
// }

// function getPackerData() {
//   if (typeof window === "undefined") return null;

//   const packerData = localStorage.getItem("packer");
//   if (packerData) {
//     try {
//       return JSON.parse(packerData);
//     } catch {
//       return null;
//     }
//   }

//   return null;
// }

// function readLocalCache() {
//   try {
//     const raw = localStorage.getItem(LOCAL_CACHE_KEY);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     if (!parsed || !parsed.data || !parsed.ts) return null;
//     if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
//     return parsed.data;
//   } catch {}
//   return null;
// }

// function writeLocalCache(data) {
//   try {
//     localStorage.setItem(
//       LOCAL_CACHE_KEY,
//       JSON.stringify({ data, ts: Date.now() }),
//     );
//   } catch {}
// }

// function isAbortError(err) {
//   return err?.name === "AbortError" || /aborted/i.test(err?.message || "");
// }

// async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeoutMs);
//   try {
//     const res = await fetch(url, {
//       cache: "no-store",
//       ...opts,
//       signal: controller.signal,
//     });
//     if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
//     const ct = res.headers.get("content-type") || "";
//     if (!ct.includes("application/json")) {
//       const text = await res.text();
//       throw new Error(`Non-JSON for ${url}: ${text.slice(0, 120)}...`);
//     }
//     const json = await res.json();
//     return json;
//   } catch (err) {
//     if (isAbortError(err)) {
//       throw new Error(`Request timed out after ${timeoutMs}ms`);
//     }
//     throw err;
//   } finally {
//     clearTimeout(id);
//   }
// }

// function withBust(url) {
//   const sep = url.includes("?") ? "&" : "?";
//   return `${url}${sep}ts=${Date.now()}`;
// }

// async function fetchCombined() {
//   const cached = readLocalCache();

//   let adminData = null;
//   try {
//     adminData = await fetchWithTimeout(ADMIN_ORDERS_URL, {}, 5000);
//   } catch (e) {
//     console.log("[v4] getPackerOrders2 skipped/failed:", e.message);
//   }

//   let groupedJson = null;
//   for (let attempt = 0; attempt < 3; attempt++) {
//     try {
//       groupedJson = await fetchWithTimeout(
//         withBust(PACKING_GROUPED_URL),
//         {},
//         6000,
//       );
//       break;
//     } catch (e) {
//       if (attempt < 2) {
//         await new Promise((r) => setTimeout(r, 500));
//         continue;
//       }
//       console.log("[v4] grouped fetch failed:", e.message);
//     }
//   }

//   let groupedData = [];
//   if (
//     Array.isArray(groupedJson?.data?.groupedData) &&
//     groupedJson.data.groupedData.length > 0
//   ) {
//     groupedData = groupedJson.data.groupedData;
//   } else if (Array.isArray(groupedJson?.groupedData)) {
//     groupedData = groupedJson.groupedData;
//   } else if (
//     cached &&
//     Array.isArray(cached.groupedData) &&
//     cached.groupedData.length > 0
//   ) {
//     groupedData = cached.groupedData;
//   }

//   if (!Array.isArray(groupedData)) groupedData = [];

//   const combined = {
//     adminResult: adminData,
//     groupedData,
//     __fromCache: !(
//       Array.isArray(groupedJson?.groupedData) &&
//       groupedJson.groupedData.length > 0
//     ),
//   };

//   writeLocalCache(combined);
//   return combined;
// }

// function usePackingData() {
//   const fallbackData = typeof window !== "undefined" ? readLocalCache() : null;

//   const {
//     data,
//     error,
//     isValidating,
//     mutate: swrMutate,
//   } = useSWR(SWR_KEY, fetchCombined, {
//     fallbackData,
//     revalidateOnFocus: true,
//     revalidateOnReconnect: true,
//     revalidateOnMount: true,
//     revalidateIfStale: true,
//     dedupingInterval: 2000,
//     refreshInterval: 0,
//     refreshWhenHidden: true,
//     errorRetryCount: 1,
//     errorRetryInterval: 3000,
//     shouldRetryOnError: (err) => {
//       if (isAbortError(err)) return false;
//       return true;
//     },
//   });

//   return {
//     data,
//     error,
//     isValidating,
//     refresh: () => swrMutate(),
//     mutate: swrMutate,
//   };
// }

// function useHubs() {
//   const { data, error, isValidating } = useSWR(
//     HUBS_API_URL,
//     async (url) => {
//       try {
//         const res = await fetchWithTimeout(url, {}, 8000);
//         return Array.isArray(res) ? res : [];
//       } catch (err) {
//         console.log("[v4] hubs fetch failed:", err.message);
//         return [];
//       }
//     },
//     {
//       revalidateOnFocus: false,
//       revalidateOnReconnect: false,
//       dedupingInterval: 60000,
//     },
//   );

//   return {
//     hubs: data || [],
//     hubsLoading: isValidating,
//     hubsError: error,
//   };
// }

// function useRiders() {
//   const [riders, setRiders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchRiders = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(RIDERS_API_URL);
//       console.log("Riders API response:", response.data);
//       if (response.data && response.data.riders) {
//         const activeRiders = response.data.riders.filter(
//           (rider) => rider.status === "active",
//         );
//         setRiders(activeRiders);
//         console.log("Active riders set:", activeRiders);
//       }
//     } catch (err) {
//       console.error("Error fetching riders:", err);
//       setError(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRiders();
//   }, []);

//   return {
//     riders,
//     ridersLoading: loading,
//     ridersError: error,
//     refreshRiders: fetchRiders,
//   };
// }

// function getPackerHubName(packerHubIds, allHubs) {
//   if (!Array.isArray(packerHubIds) || !Array.isArray(allHubs)) return null;
//   const matchedHub = allHubs.find((hub) => packerHubIds.includes(hub.hubId));
//   return matchedHub ? matchedHub.hubName : null;
// }

// // Available filters - hubs, sessions, riders
// function useAvailableFilters(
//   groupedData,
//   userRole,
//   packerData,
//   allHubs,
//   packerHubName,
//   allRiders,
// ) {
//   return useMemo(() => {
//     if (!Array.isArray(groupedData)) {
//       return { hubs: [], sessions: [], riders: [] };
//     }

//     const hubs = [
//       ...new Set(groupedData.map((item) => item.hubName).filter(Boolean)),
//     ];

//     const sessions = [
//       ...new Set(groupedData.map((item) => item.session).filter(Boolean)),
//     ];

//     const riderNamesFromOrders = [
//       ...new Set(
//         groupedData.flatMap((item) =>
//           Array.isArray(item.orders)
//             ? item.orders
//                 .map((order) => order?.riderName || order?.assignedRider)
//                 .filter(Boolean)
//             : [],
//         ),
//       ),
//     ];

//     const activeRiderNames = allRiders.map(
//       (rider) => rider.name || rider.riderName || rider.username,
//     );
//     const allRiderNames = [
//       ...new Set([...riderNamesFromOrders, ...activeRiderNames]),
//     ].sort();

//     return { hubs, sessions, riders: allRiderNames };
//   }, [groupedData, allRiders]);
// }

// // Summary calculation with hub, session, and rider filters - FIXED HUB FILTER
// function useSummary(packingData, filters, userRole, packerHubName) {
//   return useMemo(() => {
//     if (!Array.isArray(packingData))
//       return {
//         totalGroups: 0,
//         totalOrdered: 0,
//         totalPacked: 0,
//         remainingItems: 0,
//         fullyPackedGroups: 0,
//         partiallyPackedGroups: 0,
//         notPackedGroups: 0,
//       };

//     let filtered = packingData;

//     // FIXED: Hub filter - check if filters.hub exists and is not "all"
//     if (filters.hub && filters.hub !== "all") {
//       filtered = filtered.filter((item) => item.hubName === filters.hub);
//     }

//     // For packers, also filter by their hub if set
//     if (userRole === "packer" && packerHubName) {
//       filtered = filtered.filter((item) => item.hubName === packerHubName);
//     }

//     // Filter by session
//     if (filters.session && filters.session !== "all") {
//       filtered = filtered.filter((item) => item.session === filters.session);
//     }

//     // Filter by rider
//     if (filters.rider && filters.rider !== "all") {
//       filtered = filtered.filter(
//         (item) =>
//           Array.isArray(item.orders) &&
//           item.orders.some(
//             (order) =>
//               order?.riderName === filters.rider ||
//               order?.assignedRider === filters.rider,
//           ),
//       );
//     }

//     const totalOrdered = filtered.reduce(
//       (sum, it) => sum + (Number(it.totalOrdered) || 0),
//       0,
//     );
//     const totalPacked = filtered.reduce(
//       (sum, it) => sum + (Number(it.packed) || 0),
//       0,
//     );

//     return {
//       totalGroups: filtered.length,
//       totalOrdered,
//       totalPacked,
//       remainingItems: Math.max(0, totalOrdered - totalPacked),
//       fullyPackedGroups: filtered.filter((it) => it.isFullyPacked).length,
//       partiallyPackedGroups: filtered.filter(
//         (it) => it.isPacked && !it.isFullyPacked,
//       ).length,
//       notPackedGroups: filtered.filter((it) => !it.isPacked).length,
//     };
//   }, [packingData, filters, userRole, packerHubName]);
// }

// // Grouped items - GROUP BY CATEGORY/ITEM NAME ONLY, not hub-wise
// function useGroupedItems(packingData, filters, userRole, packerHubName) {
//   return useMemo(() => {
//     if (!Array.isArray(packingData)) return [];

//     const groupedMap = new Map();

//     // First filter the data
//     let filteredData = [...packingData];

//     // FIXED: Apply hub filter
//     if (filters.hub && filters.hub !== "all") {
//       filteredData = filteredData.filter(
//         (item) => item.hubName === filters.hub,
//       );
//     }

//     if (userRole === "packer" && packerHubName) {
//       filteredData = filteredData.filter(
//         (item) => item.hubName === packerHubName,
//       );
//     }

//     if (filters.session && filters.session !== "all") {
//       filteredData = filteredData.filter(
//         (item) => item.session === filters.session,
//       );
//     }

//     if (filters.rider && filters.rider !== "all") {
//       filteredData = filteredData.filter(
//         (item) =>
//           Array.isArray(item.orders) &&
//           item.orders.some(
//             (order) =>
//               order?.riderName === filters.rider ||
//               order?.assignedRider === filters.rider,
//           ),
//       );
//     }

//     // Group by item name/category only (NOT by hub)
//     for (const item of filteredData) {
//       if (!item || typeof item !== "object") continue;

//       // Create grouping key - ONLY by item name, NOT including hub
//       const key = `${item.name}`; // Removed hubName from key

//       if (!groupedMap.has(key)) {
//         groupedMap.set(key, {
//           name: item.name || "Unknown Item",
//           category: item.category || "Unknown Category",
//           categoryName: item.categoryName || "Unknown Category Name",
//           unit: item.unit || "unit",
//           // Aggregate hubs instead of single hub
//           hubs: new Set(),
//           totalOrdered: 0,
//           totalPacked: 0,
//           sessions: new Map(),
//           riders: new Set(),
//           isPacked: false,
//           isFullyPacked: false,
//         });
//       }

//       const group = groupedMap.get(key);
//       const itemOrdered = Number(item.totalOrdered) || 0;
//       const itemPacked = Number(item.packed) || 0;

//       // Add hub to hubs set
//       if (item.hubName) {
//         group.hubs.add(item.hubName);
//       }

//       group.totalOrdered += itemOrdered;
//       group.totalPacked += itemPacked;

//       // Group by session
//       const sessionName = item.session || "Unknown Session";
//       if (!group.sessions.has(sessionName)) {
//         group.sessions.set(sessionName, {
//           session: sessionName,
//           ordered: itemOrdered,
//           packed: itemPacked,
//           remaining: Math.max(0, itemOrdered - itemPacked),
//           isFullyPacked: !!item.isFullyPacked,
//           isPacked: !!item.isPacked,
//         });
//       } else {
//         const s = group.sessions.get(sessionName);
//         s.ordered += itemOrdered;
//         s.packed += itemPacked;
//         s.remaining = Math.max(0, s.ordered - s.packed);
//         s.isPacked = s.packed > 0;
//         s.isFullyPacked = s.packed === s.ordered;
//       }

//       // Collect riders from orders
//       if (Array.isArray(item.orders)) {
//         item.orders.forEach((order) => {
//           const rider = order?.riderName || order?.assignedRider;
//           if (rider) {
//             group.riders.add(rider);
//           }
//         });
//       }

//       group.isPacked = group.totalPacked > 0;
//       group.isFullyPacked = group.totalPacked === group.totalOrdered;
//     }

//     return Array.from(groupedMap.values()).map((g) => ({
//       ...g,
//       hubs: Array.from(g.hubs), // Convert Set to Array
//       sessions: Array.from(g.sessions.values()),
//       riders: Array.from(g.riders),
//       totalOrdered: Number(g.totalOrdered) || 0,
//       totalPacked: Number(g.totalPacked) || 0,
//       remaining: Math.max(
//         0,
//         (Number(g.totalOrdered) || 0) - (Number(g.totalPacked) || 0),
//       ),
//     }));
//   }, [packingData, filters, userRole, packerHubName]);
// }

// const PackerOrders = () => {
//   const [userRole, setUserRole] = useState(null);
//   const [packerData, setPackerData] = useState(null);
//   const { hubs: allHubs } = useHubs();
//   const { riders: allRiders, ridersLoading, refreshRiders } = useRiders();
//   const [packerHubName, setPackerHubName] = useState(null);

//   const [filters, setFilters] = useState(() => {
//     try {
//       const raw = sessionStorage.getItem("packer:filters:grouped");
//       return raw
//         ? JSON.parse(raw)
//         : {
//             hub: "all",
//             session: "all",
//             rider: "all",
//           };
//     } catch {
//       return {
//         hub: "all",
//         session: "all",
//         rider: "all",
//       };
//     }
//   });

//   useEffect(() => {
//     try {
//       sessionStorage.setItem("packer:filters:grouped", JSON.stringify(filters));
//     } catch {}
//   }, [filters]);

//   useEffect(() => {
//     const role = getUserRole();
//     setUserRole(role);

//     if (role === "packer") {
//       const pData = getPackerData();
//       setPackerData(pData);
//     }
//   }, []);

//   useEffect(() => {
//     if (
//       userRole === "packer" &&
//       packerData?.hubs &&
//       Array.isArray(allHubs) &&
//       allHubs.length > 0
//     ) {
//       const hubName = getPackerHubName(packerData.hubs, allHubs);
//       if (hubName) {
//         setPackerHubName(hubName);
//         setFilters((prev) => ({
//           ...prev,
//           hub: hubName,
//         }));
//       }
//     }
//   }, [userRole, packerData, allHubs]);

//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showSessionModal, setShowSessionModal] = useState(false);
//   const [selectedItemForSession, setSelectedItemForSession] = useState(null);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [lastRefreshed, setLastRefreshed] = useState(null);
//   const lastGoodDataRef = useRef(null);

//   const { data, error, isValidating, refresh, mutate } = usePackingData();
//   const packingData = data?.groupedData || [];

//   useEffect(() => {
//     if (Array.isArray(packingData) && packingData.length > 0) {
//       lastGoodDataRef.current = packingData;
//     }
//   }, [packingData]);

//   const availableFilters = useAvailableFilters(
//     packingData,
//     userRole,
//     packerData,
//     allHubs,
//     packerHubName,
//     allRiders,
//   );

//   const summary = useSummary(packingData, filters, userRole, packerHubName);

//   const groupedItems = useGroupedItems(
//     packingData,
//     filters,
//     userRole,
//     packerHubName,
//   );

//   const loading =
//     (!data && !error && !lastGoodDataRef.current) || ridersLoading;

//   const handleFilterChange = (filterType, value) => {
//     setFilters((prev) => ({ ...prev, [filterType]: value }));
//   };

//   const handleRefresh = async () => {
//     console.log("[grouped] manual refresh requested");
//     await Promise.all([mutate(), refreshRiders()]);
//     setLastRefreshed(new Date());
//   };

//   const handlePackedClick = (item) => {
//     setSelectedItemForSession(item);
//     setShowSessionModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setIsUpdating(false);
//   };

//   const handleCloseSessionModal = () => {
//     setShowSessionModal(false);
//     setIsUpdating(false);
//   };

//   const handleSessionSelect = async (session) => {
//     setShowSessionModal(false);
//     try {
//       // We need to get items for this item across all hubs
//       // Since items are now grouped by name, we need to fetch for the selected hub filter
//       const hubToFetch =
//         filters.hub !== "all" ? filters.hub : selectedItemForSession.hubs[0];

//       const url = `${API_BASE_URL}/packer/packing/today/individual?name=${encodeURIComponent(
//         selectedItemForSession.name,
//       )}&hubName=${hubToFetch}&session=${session}`;

//       const res = await fetchWithTimeout(url, {}, 8000);
//       if (res?.success && Array.isArray(res?.data)) {
//         const individualItems = res.data;
//         const packedCount = individualItems.filter((it) => it.isPacked).length;
//         const totalCount = individualItems.length;

//         setSelectedItem({
//           ...selectedItemForSession,
//           session,
//           hubName: hubToFetch,
//           individualItems,
//           totalOrdered: totalCount,
//           packed: packedCount,
//           isPacked: packedCount > 0,
//           isFullyPacked: packedCount === totalCount,
//         });
//         setShowModal(true);
//       } else {
//         alert("No individual items found for this session");
//       }
//     } catch (err) {
//       console.log("[grouped] individual items fetch failed:", err.message);
//       alert("Error fetching individual items: " + err.message);
//     }
//   };

//   const updateIndividualPackingStatus = async (individualItemId, isPacked) => {
//     if (!selectedItem || !selectedItemForSession) return;
//     setIsUpdating(true);

//     const optimisticUpdater = (current) => {
//       if (!current) return current;
//       const copy = {
//         ...current,
//         groupedData: [...(current.groupedData || [])],
//       };

//       copy.groupedData = copy.groupedData.map((it) => {
//         const matches =
//           it.name === selectedItemForSession.name &&
//           it.session === selectedItem.session;

//         if (!matches) return it;

//         const currentItems = (selectedItem.individualItems || []).map((x) =>
//           x._id === individualItemId ? { ...x, isPacked } : x,
//         );

//         const newPacked = currentItems.filter((x) => x.isPacked).length;
//         const ordered = Number(it.totalOrdered || 0);

//         return {
//           ...it,
//           packed: newPacked,
//           isPacked: newPacked > 0,
//           isFullyPacked: newPacked === ordered,
//         };
//       });

//       return copy;
//     };

//     await globalMutate(SWR_KEY, (current) => optimisticUpdater(current), false);

//     setSelectedItem((prev) => {
//       if (!prev) return prev;
//       const updatedIndividualItems = (prev.individualItems || []).map((it) =>
//         it._id === individualItemId
//           ? { ...it, isPacked, packed: isPacked ? 1 : 0 }
//           : it,
//       );

//       const packedCount = updatedIndividualItems.filter(
//         (x) => x.isPacked,
//       ).length;

//       const totalCount = updatedIndividualItems.length;

//       return {
//         ...prev,
//         individualItems: updatedIndividualItems,
//         packed: packedCount,
//         isPacked: packedCount > 0,
//         isFullyPacked: packedCount === totalCount,
//       };
//     });

//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/packer/packing/update-individual-packed`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ packingId: individualItemId, isPacked }),
//         },
//       );

//       const json = await res.json();
//       if (!json?.success) {
//         throw new Error(json?.message || "Failed to update packing status");
//       }

//       mutate();
//     } catch (err) {
//       console.log("[grouped] update failed:", err.message);
//       await globalMutate(SWR_KEY, undefined, true);
//       alert("Update failed: " + err.message);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   useEffect(() => {
//     if (data && Array.isArray(data.groupedData) && !isValidating) {
//       setLastRefreshed(new Date());
//     }
//   }, [data, isValidating]);

//   useEffect(() => {
//     const onFocus = () => {
//       console.log("[grouped] focus/visible -> revalidate");
//       mutate().then(() => setLastRefreshed(new Date()));
//     };
//     const onVisibility = () => {
//       if (document.visibilityState === "visible") onFocus();
//     };
//     window.addEventListener("focus", onFocus);
//     document.addEventListener("visibilitychange", onVisibility);
//     return () => {
//       window.removeEventListener("focus", onFocus);
//       document.removeEventListener("visibilitychange", onVisibility);
//     };
//   }, [mutate]);

//   useEffect(() => {
//     const id = setInterval(() => {
//       mutate().then(() => setLastRefreshed(new Date()));
//     }, 20000);
//     return () => clearInterval(id);
//   }, [mutate]);

//   return (
//     <Container fluid className="py-4">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <h2 className="text-black mb-1">Item Packer</h2>
//               <p className="text-muted mb-0">
//                 Manage and track order packing progress
//                 {lastRefreshed && (
//                   <span className="text-success fw-bold ms-2">
//                     Last refreshed: {lastRefreshed.toLocaleTimeString()}
//                   </span>
//                 )}
//                 {isValidating && (
//                   <span className="text-warning fw-bold ms-2">
//                     <Spinner
//                       animation="border"
//                       size="sm"
//                       className="me-2"
//                       style={{ width: "1rem", height: "1rem" }}
//                     />
//                     <Spinner
//                       animation="border"
//                       size="sm"
//                       style={{ width: "1rem", height: "1rem" }}
//                     />
//                   </span>
//                 )}
//               </p>
//             </div>
//             <div className="d-flex gap-2">
//               <Link to="/packer-dashboard">
//                 <button
//                   className="btn packer-toggle-btn"
//                   style={{
//                     backgroundColor: "#6c757d",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   <FaTable className="me-2" /> View Orders
//                 </button>
//               </Link>
//               <button
//                 className="btn packer-toggle-btn"
//                 style={{
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   fontWeight: "bold",
//                 }}
//                 onClick={handleRefresh}
//                 disabled={isValidating || ridersLoading}
//               >
//                 <FaListAlt className="me-2" /> Refresh
//               </button>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {/* Summary Cards */}
//       {!loading && summary.totalGroups > 0 && (
//         <Row className="mb-4">
//           <Col md={4}>
//             <Card
//               className="text-center"
//               style={{ backgroundColor: "#aeaeae" }}
//             >
//               <Card.Body>
//                 <Card.Title className="text-black fs-2 fw-bold">
//                   {summary.totalOrdered || 0}
//                 </Card.Title>
//                 <Card.Text className="text-black">Total Ordered</Card.Text>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={4}>
//             <Card
//               className="text-center"
//               style={{ backgroundColor: "#6B8E23" }}
//             >
//               <Card.Body>
//                 <Card.Title className="text-white fs-2 fw-bold">
//                   {summary.totalPacked || 0}
//                 </Card.Title>
//                 <Card.Text className="text-white">Packed Items</Card.Text>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={4}>
//             <Card
//               className="text-center"
//               style={{ backgroundColor: "#FFD700" }}
//             >
//               <Card.Body>
//                 <Card.Title className="text-black fs-2 fw-bold">
//                   {summary.remainingItems || 0}
//                 </Card.Title>
//                 <Card.Text className="text-black">Remaining Items</Card.Text>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       )}

//       {/* Filters - Hub, Session, and Rider */}
//       <Card className="mb-4" style={{ backgroundColor: "#fff8dc" }}>
//         <Card.Body>
//           <Row>
//             {/* Hub Filter */}
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>
//                   <strong>Hub</strong>
//                 </Form.Label>
//                 <Form.Select
//                   value={filters.hub}
//                   onChange={(e) => handleFilterChange("hub", e.target.value)}
//                   disabled={userRole === "packer"}
//                 >
//                   <option value="all">All Hubs</option>
//                   {availableFilters.hubs.map((hub) => (
//                     <option key={hub} value={hub}>
//                       {hub}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {userRole === "packer" && packerHubName && (
//                   <Form.Text className="text-muted">
//                     Auto-set to your hub: {packerHubName}
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>

//             {/* Session Filter */}
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>
//                   <strong>Session</strong>
//                 </Form.Label>
//                 <Form.Select
//                   value={filters.session}
//                   onChange={(e) =>
//                     handleFilterChange("session", e.target.value)
//                   }
//                 >
//                   <option value="all">All Sessions</option>
//                   {availableFilters.sessions.map((session) => (
//                     <option key={session} value={session}>
//                       {session}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//             </Col>

//             {/* Rider Filter */}
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>
//                   <strong>
//                     <FaMotorcycle className="me-1" /> Rider
//                   </strong>
//                 </Form.Label>
//                 <Form.Select
//                   value={filters.rider}
//                   onChange={(e) => handleFilterChange("rider", e.target.value)}
//                 >
//                   <option value="all">All Riders</option>
//                   {availableFilters.riders.map((rider) => (
//                     <option key={rider} value={rider}>
//                       {rider}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//             </Col>

//             {/* Active Filters Summary */}
//             <Col md={12} className="mt-3">
//               <div className="text-muted small bg-light p-2 rounded">
//                 <div className="d-flex flex-wrap gap-3">
//                   <div>
//                     <strong>Hub:</strong>{" "}
//                     {filters.hub === "all" ? "All Hubs" : filters.hub}
//                   </div>
//                   <div>
//                     <strong>Session:</strong>{" "}
//                     {filters.session === "all"
//                       ? "All Sessions"
//                       : filters.session}
//                   </div>
//                   <div>
//                     <strong>Rider:</strong>{" "}
//                     {filters.rider === "all" ? "All Riders" : filters.rider}
//                   </div>
//                 </div>
//               </div>
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       {error && (
//         <Alert variant="danger" className="mb-4">
//           <Alert.Heading>Error Loading Data</Alert.Heading>
//           <div className="mb-1">{error.message || "Failed to fetch data."}</div>
//           {data?.__fromCache && (
//             <small className="text-muted">
//               Showing cached data. We'll refresh in the background when the
//               network is available.
//             </small>
//           )}
//         </Alert>
//       )}

//       {loading && (
//         <div className="text-center py-5">
//           <Spinner animation="border" variant="primary" />
//           <p className="mt-2">Loading packing data...</p>
//         </div>
//       )}

//       {!loading && groupedItems.length > 0 && (
//         <Card>
//           <Card.Header className="d-flex justify-content-between align-items-center">
//             <h5 className="mb-0">Packing Summary - Grouped by Item</h5>
//             <div>
//               <Badge bg="primary" className="me-2">
//                 {groupedItems.length} unique items
//               </Badge>
//               {filters.hub !== "all" && (
//                 <Badge bg="secondary" className="me-2">
//                   Hub: {filters.hub}
//                 </Badge>
//               )}
//               {filters.rider !== "all" && (
//                 <Badge bg="info">
//                   <FaMotorcycle className="me-1" />
//                   {filters.rider}
//                 </Badge>
//               )}
//             </div>
//           </Card.Header>
//           <Card.Body className="p-0">
//             <div className="packer-table-responsive shadow-lg rounded">
//               <table className="table table-hover">
//                 <thead style={{ backgroundColor: "#6B8E23", color: "white" }}>
//                   <tr>
//                     <th>Category</th>
//                     <th>Available Hubs</th> {/* New column for hubs */}
//                     <th>Available Sessions</th>
//                     <th>Assigned Riders</th>
//                     <th>Total Ordered</th>
//                     <th>Total Packed</th>
//                     <th>Yet to Pack</th>
//                     <th>Pack Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {groupedItems.map((item, index) => {
//                     const totalOrdered = Number(item.totalOrdered) || 0;
//                     const totalPacked = Number(item.totalPacked) || 0;
//                     const remainingQuantity = Math.max(
//                       0,
//                       totalOrdered - totalPacked,
//                     );
//                     const isFullyPacked = remainingQuantity === 0;
//                     const isPartiallyPacked = totalPacked > 0 && !isFullyPacked;

//                     return (
//                       <tr key={`${item.name}-${index}`}>
//                         <td>
//                           <strong
//                             className="d-flex align-items-center gap-2"
//                             style={{ fontSize: "16px" }}
//                           >
//                             <span
//                               className={`d-inline-block rounded-circle ${
//                                 item.category &&
//                                 item.category.toLowerCase() === "veg"
//                                   ? "bg-success"
//                                   : "bg-danger"
//                               }`}
//                               style={{ width: "10px", height: "10px" }}
//                             ></span>
//                             {item.categoryName}
//                           </strong>
//                           <br />
//                           <small className="text-muted">{item.name}</small>
//                         </td>
//                         <td>
//                           <div className="d-flex flex-wrap gap-1">
//                             {item.hubs.map((hub, idx) => (
//                               <Badge key={idx} bg="secondary">
//                                 {hub}
//                               </Badge>
//                             ))}
//                           </div>
//                         </td>
//                         <td>
//                           <div className="d-flex flex-wrap gap-1">
//                             {item.sessions.map((sessionInfo, idx) => (
//                               <Badge
//                                 key={idx}
//                                 bg={
//                                   sessionInfo.isFullyPacked
//                                     ? "success"
//                                     : sessionInfo.isPacked
//                                       ? "warning"
//                                       : "light"
//                                 }
//                                 text={
//                                   sessionInfo.isFullyPacked
//                                     ? "white"
//                                     : sessionInfo.isPacked
//                                       ? "dark"
//                                       : "dark"
//                                 }
//                                 className="p-2"
//                               >
//                                 {sessionInfo.session}:{" "}
//                                 {sessionInfo.remaining || 0} left
//                               </Badge>
//                             ))}
//                           </div>
//                         </td>
//                         <td>
//                           <div className="d-flex flex-wrap gap-1">
//                             {item.riders.map((rider, idx) => (
//                               <Badge
//                                 key={idx}
//                                 bg="info"
//                                 className="d-flex align-items-center gap-1 p-2"
//                               >
//                                 <FaMotorcycle />
//                                 {rider}
//                               </Badge>
//                             ))}
//                             {item.riders.length === 0 && (
//                               <Badge bg="secondary">No Rider</Badge>
//                             )}
//                           </div>
//                         </td>
//                         <td>
//                           <span className="badge bg-secondary fs-6">
//                             {totalOrdered}
//                           </span>
//                         </td>
//                         <td>
//                           <span
//                             className={`badge ${
//                               isFullyPacked
//                                 ? "bg-success"
//                                 : isPartiallyPacked
//                                   ? "bg-warning"
//                                   : "bg-danger"
//                             } fs-6`}
//                           >
//                             {totalPacked}
//                           </span>
//                         </td>
//                         <td>
//                           <span className="badge bg-secondary fs-6">
//                             {remainingQuantity}
//                           </span>
//                         </td>
//                         <td>
//                           <Button
//                             size="sm"
//                             variant={
//                               remainingQuantity > 0
//                                 ? "success"
//                                 : "outline-success"
//                             }
//                             onClick={() => handlePackedClick(item)}
//                             disabled={isFullyPacked}
//                           >
//                             {remainingQuantity > 0
//                               ? `Pack Items`
//                               : "All Packed"}
//                           </Button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </Card.Body>
//         </Card>
//       )}

//       {!loading && !error && groupedItems.length === 0 && (
//         <Card>
//           <Card.Body className="text-center py-5">
//             <h5>No packing items found</h5>
//             <p className="text-muted">
//               {Array.isArray(packingData) && packingData.length === 0
//                 ? "There are no packing items for today. Items will appear here when orders are placed."
//                 : "No items match the current filters. Try selecting different hub, session, or rider filters."}
//             </p>
//           </Card.Body>
//         </Card>
//       )}

//       {/* Session Selection Modal */}
//       <Modal
//         show={showSessionModal}
//         onHide={handleCloseSessionModal}
//         size="xl"
//         dialogClassName="modal-dialog-scrollable"
//       >
//         <Modal.Header closeButton className="py-3">
//           <Modal.Title className="h4">Select Delivery Session</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="p-4">
//           {selectedItemForSession && (
//             <div>
//               <h5 className="mb-3">
//                 Packing: <strong>{selectedItemForSession.name}</strong>
//               </h5>
//               <div className="row mb-4">
//                 <div className="col-md-6">
//                   <p className="text-muted mb-1">
//                     <strong>Available Hubs:</strong>
//                   </p>
//                   <div className="d-flex flex-wrap gap-1 mb-2">
//                     {selectedItemForSession.hubs?.map((hub, idx) => (
//                       <Badge key={idx} bg="secondary">
//                         {hub}
//                       </Badge>
//                     ))}
//                   </div>
//                   <p className="text-muted mb-1">
//                     <strong>Total Ordered:</strong>{" "}
//                     {selectedItemForSession.totalOrdered || 0}
//                   </p>
//                   <p className="text-muted mb-1">
//                     <strong>Total Packed:</strong>{" "}
//                     {selectedItemForSession.totalPacked || 0}
//                   </p>
//                 </div>
//                 <div className="col-md-6">
//                   <p className="text-muted mb-1">
//                     <strong>Assigned Riders:</strong>
//                   </p>
//                   <div className="d-flex flex-wrap gap-1">
//                     {selectedItemForSession.riders?.map((rider, idx) => (
//                       <Badge key={idx} bg="info" className="p-2">
//                         <FaMotorcycle className="me-1" />
//                         {rider}
//                       </Badge>
//                     )) || "None"}
//                   </div>
//                   <p className="text-muted mt-2 mb-1">
//                     <strong>Currently filtering by hub:</strong>{" "}
//                     {filters.hub !== "all" ? filters.hub : "All Hubs"}
//                   </p>
//                 </div>
//               </div>

//               <div className="row g-4">
//                 {selectedItemForSession.sessions.map((sessionInfo, index) => (
//                   <div key={index} className="col-lg-6 col-md-12">
//                     <Card
//                       className={`h-100 cursor-pointer ${
//                         sessionInfo.isFullyPacked
//                           ? "border-success bg-light"
//                           : "border-primary"
//                       }`}
//                       style={{
//                         cursor: sessionInfo.isFullyPacked
//                           ? "default"
//                           : "pointer",
//                         opacity: sessionInfo.isFullyPacked ? 0.8 : 1,
//                         transition: "all 0.2s",
//                       }}
//                       onClick={() =>
//                         !sessionInfo.isFullyPacked &&
//                         handleSessionSelect(sessionInfo.session)
//                       }
//                     >
//                       <Card.Body className="text-center p-4">
//                         <h5 className="mb-3 text-primary">
//                           {sessionInfo.session}
//                         </h5>
//                         <div className="mt-3">
//                           <div className="mb-2">
//                             <Badge bg="primary" className="fs-6 p-2 w-100">
//                               Ordered: {sessionInfo.ordered || 0}
//                             </Badge>
//                           </div>
//                           <div className="mb-2">
//                             <Badge
//                               bg={
//                                 (sessionInfo.packed || 0) > 0
//                                   ? "success"
//                                   : "secondary"
//                               }
//                               className="fs-6 p-2 w-100"
//                             >
//                               Packed: {sessionInfo.packed || 0}
//                             </Badge>
//                           </div>
//                           <div className="mb-2">
//                             <Badge
//                               bg={
//                                 (sessionInfo.remaining || 0) > 0
//                                   ? "warning"
//                                   : "success"
//                               }
//                               className="fs-6 p-2 w-100"
//                             >
//                               {(sessionInfo.remaining || 0) > 0
//                                 ? `${sessionInfo.remaining} to pack`
//                                 : "All packed"}
//                             </Badge>
//                           </div>
//                         </div>
//                         {sessionInfo.isFullyPacked && (
//                           <div className="mt-3">
//                             <FaCheckCircle className="text-success fs-5" />
//                             <span className="text-success ms-2 fw-bold">
//                               Fully Packed
//                             </span>
//                           </div>
//                         )}
//                       </Card.Body>
//                     </Card>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* Individual Packing Modal */}
//       {showModal && selectedItem && (
//         <div
//           className="modal fade show d-block"
//           tabIndex="-1"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog modal-xl modal-dialog-scrollable">
//             <div className="modal-content">
//               <div className="modal-header py-3">
//                 <div>
//                   <h4 className="modal-title">Packing: {selectedItem.name}</h4>
//                   <div className="text-muted mt-2">
//                     <Badge bg="secondary" className="me-2">
//                       {selectedItem.unit}
//                     </Badge>
//                     <Badge bg="info" className="me-2">
//                       {selectedItem.hubName}
//                     </Badge>
//                     <Badge bg="primary">{selectedItem.session}</Badge>
//                   </div>
//                   <div className="mt-2">
//                     <FaMotorcycle className="me-1 text-info" />
//                     <span className="text-muted">
//                       Riders: {selectedItem.riders?.join(", ") || "None"}
//                     </span>
//                   </div>
//                 </div>
//                 <button
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                 ></button>
//               </div>

//               <div className="modal-body p-4">
//                 <div className="row mb-4">
//                   <div className="col-4">
//                     <div className="card bg-light">
//                       <div className="card-body text-center">
//                         <h6 className="text-muted mb-2">Total Items</h6>
//                         <h3 className="text-primary mb-0">
//                           {selectedItem.totalOrdered || 0}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-4">
//                     <div className="card bg-light">
//                       <div className="card-body text-center">
//                         <h6 className="text-muted mb-2">Packed</h6>
//                         <h3 className="text-success mb-0">
//                           {selectedItem.packed || 0}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-4">
//                     <div className="card bg-light">
//                       <div className="card-body text-center">
//                         <h6 className="text-muted mb-2">Remaining</h6>
//                         <h3 className="text-warning mb-0">
//                           {Math.max(
//                             0,
//                             (selectedItem.totalOrdered || 0) -
//                               (selectedItem.packed || 0),
//                           )}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <h6 className="mb-3">
//                   Individual Items - Click to toggle packing status
//                 </h6>
//                 <div className="row g-3">
//                   {selectedItem.individualItems?.map((individualItem) => (
//                     <div
//                       key={individualItem._id}
//                       className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
//                     >
//                       <div
//                         className={`card h-100 cursor-pointer ${
//                           individualItem.isPacked
//                             ? "bg-success text-white"
//                             : "bg-light"
//                         }`}
//                         style={{
//                           transition: "all 0.2s",
//                           cursor: "pointer",
//                           border: individualItem.isPacked
//                             ? "2px solid #28a745"
//                             : "2px solid #ffc107",
//                         }}
//                         onClick={async () => {
//                           await updateIndividualPackingStatus(
//                             individualItem._id,
//                             !individualItem.isPacked,
//                           );
//                         }}
//                       >
//                         <div className="card-body text-center p-3">
//                           <div className="mb-2">
//                             {individualItem.isPacked ? (
//                               <FaCheckCircle className="fs-3" />
//                             ) : (
//                               <FaBox className="fs-3 text-warning" />
//                             )}
//                           </div>
//                           <h6
//                             className={`card-title mb-1 ${
//                               individualItem.isPacked
//                                 ? "text-white"
//                                 : "text-dark"
//                             }`}
//                           >
//                             {selectedItem.categoryName}
//                           </h6>
//                           <div className="mt-2">
//                             {individualItem.isPacked ? (
//                               <Badge bg="light" text="dark">
//                                 Packed
//                               </Badge>
//                             ) : (
//                               <Badge bg="warning" text="dark">
//                                 Click to Pack
//                               </Badge>
//                             )}
//                           </div>
//                           {individualItem.assignedRider && (
//                             <small
//                               className={`d-block mt-2 ${
//                                 individualItem.isPacked
//                                   ? "text-white-50"
//                                   : "text-muted"
//                               }`}
//                             >
//                               <FaMotorcycle className="me-1" />
//                               {individualItem.assignedRider}
//                             </small>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button
//                   className="btn btn-secondary"
//                   onClick={handleCloseModal}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default PackerOrders;

// "use client";

// import { useState, useMemo, useRef, useEffect } from "react";
// import useSWR, { mutate as globalMutate } from "swr";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Badge,
//   Form,
//   Button,
//   Alert,
//   Spinner,
//   Modal,
// } from "react-bootstrap";
// import {
//   FaCheckCircle,
//   FaBox,
//   FaTable,
//   FaListAlt,
//   FaMotorcycle,
// } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import axios from "axios";

// // Constants
// const API_BASE_URL = "https://dd-backend-3nm0.onrender.com/api";
// const ADMIN_ORDERS_URL = `${API_BASE_URL}/admin/getPackerOrders2`;
// const PACKING_GROUPED_URL = `${API_BASE_URL}/packer/packing/today/grouped`;
// const HUBS_API_URL = `${API_BASE_URL}/Hub/hubs`;
// const RIDERS_API_URL = `${API_BASE_URL}/admin/riders`;
// const SWR_KEY = "packer:combined";
// const LOCAL_CACHE_KEY = "packer:combined:cache:v1";
// const CACHE_TTL_MS = 5 * 60 * 1000;

// function getUserRole() {
//   if (typeof window === "undefined") return null;

//   const isAdmin = localStorage.getItem("admin");
//   if (isAdmin && isAdmin.includes("Admin Login Successfully")) {
//     return "admin";
//   }

//   const packerData = localStorage.getItem("packer");
//   if (packerData) {
//     try {
//       const packer = JSON.parse(packerData);
//       return "packer";
//     } catch {
//       return null;
//     }
//   }

//   return null;
// }

// function getPackerData() {
//   if (typeof window === "undefined") return null;

//   const packerData = localStorage.getItem("packer");
//   if (packerData) {
//     try {
//       return JSON.parse(packerData);
//     } catch {
//       return null;
//     }
//   }

//   return null;
// }

// function readLocalCache() {
//   try {
//     const raw = localStorage.getItem(LOCAL_CACHE_KEY);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     if (!parsed || !parsed.data || !parsed.ts) return null;
//     if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
//     return parsed.data;
//   } catch {}
//   return null;
// }

// function writeLocalCache(data) {
//   try {
//     localStorage.setItem(
//       LOCAL_CACHE_KEY,
//       JSON.stringify({ data, ts: Date.now() }),
//     );
//   } catch {}
// }

// function isAbortError(err) {
//   return err?.name === "AbortError" || /aborted/i.test(err?.message || "");
// }

// async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeoutMs);
//   try {
//     const res = await fetch(url, {
//       cache: "no-store",
//       ...opts,
//       signal: controller.signal,
//     });
//     if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
//     const ct = res.headers.get("content-type") || "";
//     if (!ct.includes("application/json")) {
//       const text = await res.text();
//       throw new Error(`Non-JSON for ${url}: ${text.slice(0, 120)}...`);
//     }
//     const json = await res.json();
//     return json;
//   } catch (err) {
//     if (isAbortError(err)) {
//       throw new Error(`Request timed out after ${timeoutMs}ms`);
//     }
//     throw err;
//   } finally {
//     clearTimeout(id);
//   }
// }

// function withBust(url) {
//   const sep = url.includes("?") ? "&" : "?";
//   return `${url}${sep}ts=${Date.now()}`;
// }

// async function fetchCombined() {
//   const cached = readLocalCache();

//   let adminData = null;
//   try {
//     adminData = await fetchWithTimeout(ADMIN_ORDERS_URL, {}, 5000);
//   } catch (e) {
//     console.log("[v4] getPackerOrders2 skipped/failed:", e.message);
//   }

//   let groupedJson = null;
//   for (let attempt = 0; attempt < 3; attempt++) {
//     try {
//       groupedJson = await fetchWithTimeout(
//         withBust(PACKING_GROUPED_URL),
//         {},
//         6000,
//       );
//       break;
//     } catch (e) {
//       if (attempt < 2) {
//         await new Promise((r) => setTimeout(r, 500));
//         continue;
//       }
//       console.log("[v4] grouped fetch failed:", e.message);
//     }
//   }

//   let groupedData = [];
//   if (
//     Array.isArray(groupedJson?.data?.groupedData) &&
//     groupedJson.data.groupedData.length > 0
//   ) {
//     groupedData = groupedJson.data.groupedData;
//   } else if (Array.isArray(groupedJson?.groupedData)) {
//     groupedData = groupedJson.groupedData;
//   } else if (
//     cached &&
//     Array.isArray(cached.groupedData) &&
//     cached.groupedData.length > 0
//   ) {
//     groupedData = cached.groupedData;
//   }

//   if (!Array.isArray(groupedData)) groupedData = [];

//   const combined = {
//     adminResult: adminData,
//     groupedData,
//     __fromCache: !(
//       Array.isArray(groupedJson?.groupedData) &&
//       groupedJson.groupedData.length > 0
//     ),
//   };

//   writeLocalCache(combined);
//   return combined;
// }

// function usePackingData() {
//   const fallbackData = typeof window !== "undefined" ? readLocalCache() : null;

//   const {
//     data,
//     error,
//     isValidating,
//     mutate: swrMutate,
//   } = useSWR(SWR_KEY, fetchCombined, {
//     fallbackData,
//     revalidateOnFocus: true,
//     revalidateOnReconnect: true,
//     revalidateOnMount: true,
//     revalidateIfStale: true,
//     dedupingInterval: 2000,
//     refreshInterval: 0,
//     refreshWhenHidden: true,
//     errorRetryCount: 1,
//     errorRetryInterval: 3000,
//     shouldRetryOnError: (err) => {
//       if (isAbortError(err)) return false;
//       return true;
//     },
//   });

//   return {
//     data,
//     error,
//     isValidating,
//     refresh: () => swrMutate(),
//     mutate: swrMutate,
//   };
// }

// function useHubs() {
//   const { data, error, isValidating } = useSWR(
//     HUBS_API_URL,
//     async (url) => {
//       try {
//         const res = await fetchWithTimeout(url, {}, 8000);
//         return Array.isArray(res) ? res : [];
//       } catch (err) {
//         console.log("[v4] hubs fetch failed:", err.message);
//         return [];
//       }
//     },
//     {
//       revalidateOnFocus: false,
//       revalidateOnReconnect: false,
//       dedupingInterval: 60000,
//     },
//   );

//   return {
//     hubs: data || [],
//     hubsLoading: isValidating,
//     hubsError: error,
//   };
// }

// function useRiders() {
//   const [riders, setRiders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchRiders = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(RIDERS_API_URL);
//       if (response.data && response.data.riders) {
//         const activeRiders = response.data.riders.filter(
//           (rider) => rider.status === "active",
//         );
//         setRiders(activeRiders);
//       }
//     } catch (err) {
//       console.error("Error fetching riders:", err);
//       setError(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRiders();
//   }, []);

//   return {
//     riders,
//     ridersLoading: loading,
//     ridersError: error,
//     refreshRiders: fetchRiders,
//   };
// }

// // Available filters - hubs, sessions, riders
// function useAvailableFilters(
//   groupedData,
//   userRole,
//   packerData,
//   allHubs,
//   packerHubNames,
//   allRiders,
// ) {
//   return useMemo(() => {
//     if (!Array.isArray(groupedData)) {
//       return { hubs: [], sessions: [], riders: [] };
//     }

//     let hubs = [
//       ...new Set(groupedData.map((item) => item.hubName).filter(Boolean)),
//     ];

//     // For packers, filter hubs to only show their assigned hubs
//     if (userRole === "packer" && packerHubNames && packerHubNames.length > 0) {
//       hubs = hubs.filter(hub => packerHubNames.includes(hub));
//     }

//     const sessions = [
//       ...new Set(groupedData.map((item) => item.session).filter(Boolean)),
//     ];

//     const riderNamesFromOrders = [
//       ...new Set(
//         groupedData.flatMap((item) =>
//           Array.isArray(item.orders)
//             ? item.orders
//                 .map((order) => order?.riderName || order?.assignedRider)
//                 .filter(Boolean)
//             : [],
//         ),
//       ),
//     ];

//     const activeRiderNames = allRiders.map(
//       (rider) => rider.name || rider.riderName || rider.username,
//     );
//     const allRiderNames = [
//       ...new Set([...riderNamesFromOrders, ...activeRiderNames]),
//     ].sort();

//     return { hubs, sessions, riders: allRiderNames };
//   }, [groupedData, userRole, packerHubNames, allRiders]);
// }

// // Summary calculation with hub, session, and rider filters
// function useSummary(packingData, filters, userRole, packerHubNames) {
//   return useMemo(() => {
//     if (!Array.isArray(packingData))
//       return {
//         totalGroups: 0,
//         totalOrdered: 0,
//         totalPacked: 0,
//         remainingItems: 0,
//         fullyPackedGroups: 0,
//         partiallyPackedGroups: 0,
//         notPackedGroups: 0,
//       };

//     let filtered = packingData;

//     if (filters.hub && filters.hub !== "all") {
//       filtered = filtered.filter((item) => item.hubName === filters.hub);
//     }

//     // For packers, filter to only show their assigned hubs
//     if (userRole === "packer" && packerHubNames && packerHubNames.length > 0) {
//       filtered = filtered.filter((item) => packerHubNames.includes(item.hubName));
//     }

//     if (filters.session && filters.session !== "all") {
//       filtered = filtered.filter((item) => item.session === filters.session);
//     }

//     if (filters.rider && filters.rider !== "all") {
//       filtered = filtered.filter(
//         (item) =>
//           Array.isArray(item.orders) &&
//           item.orders.some(
//             (order) =>
//               order?.riderName === filters.rider ||
//               order?.assignedRider === filters.rider,
//           ),
//       );
//     }

//     const totalOrdered = filtered.reduce(
//       (sum, it) => sum + (Number(it.totalOrdered) || 0),
//       0,
//     );
//     const totalPacked = filtered.reduce(
//       (sum, it) => sum + (Number(it.packed) || 0),
//       0,
//     );

//     return {
//       totalGroups: filtered.length,
//       totalOrdered,
//       totalPacked,
//       remainingItems: Math.max(0, totalOrdered - totalPacked),
//       fullyPackedGroups: filtered.filter((it) => it.isFullyPacked).length,
//       partiallyPackedGroups: filtered.filter(
//         (it) => it.isPacked && !it.isFullyPacked,
//       ).length,
//       notPackedGroups: filtered.filter((it) => !it.isPacked).length,
//     };
//   }, [packingData, filters, userRole, packerHubNames]);
// }

// // Grouped items - GROUP BY ITEM NAME ONLY
// function useGroupedItems(packingData, filters, userRole, packerHubNames) {
//   return useMemo(() => {
//     if (!Array.isArray(packingData)) return [];

//     const groupedMap = new Map();

//     let filteredData = [...packingData];

//     if (filters.hub && filters.hub !== "all") {
//       filteredData = filteredData.filter(
//         (item) => item.hubName === filters.hub,
//       );
//     }

//     // For packers, filter to only show their assigned hubs
//     if (userRole === "packer" && packerHubNames && packerHubNames.length > 0) {
//       filteredData = filteredData.filter((item) =>
//         packerHubNames.includes(item.hubName)
//       );
//     }

//     if (filters.session && filters.session !== "all") {
//       filteredData = filteredData.filter(
//         (item) => item.session === filters.session,
//       );
//     }

//     for (const item of filteredData) {
//       if (!item || typeof item !== "object") continue;

//       const key = `${item.name}`;

//       if (!groupedMap.has(key)) {
//         groupedMap.set(key, {
//           name: item.name || "Unknown Item",
//           itemName: item.name || "Unknown Item",
//           category: item.category || "Unknown Category",
//           categoryName: item.categoryName || "Unknown Category Name",
//           unit: item.unit || "unit",
//           hubs: new Set(),
//           totalOrdered: 0,
//           totalPacked: 0,
//           sessions: new Map(),
//           riders: new Set(),
//           isPacked: false,
//           isFullyPacked: false,
//         });
//       }

//       const group = groupedMap.get(key);

//       const itemOrdered = Number(item.totalOrdered) || 0;
//       const itemPacked = Number(item.packed) || 0;

//       group.totalOrdered += itemOrdered;
//       group.totalPacked += itemPacked;

//       if (item.hubName) {
//         group.hubs.add(item.hubName);
//       }

//       const sessionName = item.session || "Unknown Session";

//       if (!group.sessions.has(sessionName)) {
//         group.sessions.set(sessionName, {
//           session: sessionName,
//           ordered: itemOrdered,
//           packed: itemPacked,
//           remaining: Math.max(0, itemOrdered - itemPacked),
//           isFullyPacked: itemPacked === itemOrdered && itemOrdered > 0,
//           isPacked: itemPacked > 0,
//         });
//       } else {
//         const s = group.sessions.get(sessionName);
//         s.ordered += itemOrdered;
//         s.packed += itemPacked;
//         s.remaining = Math.max(0, s.ordered - s.packed);
//         s.isPacked = s.packed > 0;
//         s.isFullyPacked = s.packed === s.ordered && s.ordered > 0;
//       }

//       if (Array.isArray(item.orders)) {
//         item.orders.forEach((order) => {
//           const rider = order?.riderName || order?.assignedRider;
//           if (rider) {
//             group.riders.add(rider);
//           }
//         });
//       }

//       group.isPacked = group.totalPacked > 0;
//       group.isFullyPacked = group.totalPacked === group.totalOrdered && group.totalOrdered > 0;
//     }

//     const result = Array.from(groupedMap.values())
//       .map((g) => ({
//         ...g,
//         hubs: Array.from(g.hubs),
//         sessions: Array.from(g.sessions.values()),
//         riders: Array.from(g.riders),
//         totalOrdered: Number(g.totalOrdered) || 0,
//         totalPacked: Number(g.totalPacked) || 0,
//         remaining: Math.max(
//           0,
//           (Number(g.totalOrdered) || 0) - (Number(g.totalPacked) || 0),
//         ),
//       }))
//       .sort((a, b) => {
//         const nameA = (a.itemName || a.name || "").toLowerCase();
//         const nameB = (b.itemName || b.name || "").toLowerCase();
//         return nameA.localeCompare(nameB);
//       });

//     return result;
//   }, [packingData, filters, userRole, packerHubNames]);
// }

// const PackerOrders = () => {
//   const [userRole, setUserRole] = useState(null);
//   const [packerData, setPackerData] = useState(null);
//   const { hubs: allHubs } = useHubs();
//   const { riders: allRiders, ridersLoading, refreshRiders } = useRiders();
//   const [packerHubNames, setPackerHubNames] = useState([]);

//   // Clear ALL storage on component mount to ensure fresh start
//   useEffect(() => {
//     sessionStorage.removeItem("packer:filters:grouped");
//     sessionStorage.removeItem("packer:filters");
//     localStorage.removeItem("packer:selectedHub");

//     const adminValue = localStorage.getItem("admin");
//     if (adminValue && adminValue.includes("Admin Login Successfully")) {
//       console.log("Admin detected in localStorage");
//     }
//   }, []);

//   const [filters, setFilters] = useState(() => {
//     return {
//       hub: "all",
//       session: "all",
//       rider: "all",
//     };
//   });

//   useEffect(() => {
//     if (userRole !== "admin") {
//       try {
//         sessionStorage.setItem("packer:filters:grouped", JSON.stringify(filters));
//       } catch {}
//     }
//   }, [filters, userRole]);

//   useEffect(() => {
//     const role = getUserRole();
//     console.log("Detected user role:", role);
//     setUserRole(role);

//     if (role === "packer") {
//       const pData = getPackerData();
//       console.log("Packer data from localStorage:", pData);
//       setPackerData(pData);
//     }
//   }, []);

//   // Update the packer hub setup to handle multiple hubs (using hub names directly)
//   useEffect(() => {
//     if (!userRole || !allHubs.length) return;

//     console.log("Setting filters based on role:", userRole);
//     console.log("Packer data:", packerData);
//     console.log("All hubs:", allHubs);

//     if (userRole === "packer") {
//       if (packerData?.hubs && Array.isArray(packerData.hubs)) {
//         // packerData.hubs already contains hub names directly
//         const hubNames = packerData.hubs.filter(Boolean);

//         console.log("Packer hub names from localStorage:", hubNames);

//         if (hubNames.length > 0) {
//           console.log("Setting packer hubs to:", hubNames);
//           setPackerHubNames(hubNames);
//           // Don't set a specific hub filter - show all packer's hubs
//           setFilters({
//             hub: "all",
//             session: "all",
//             rider: "all",
//           });
//         } else {
//           console.log("No valid hubs found for packer");
//           setPackerHubNames([]);
//         }
//       }
//     } else if (userRole === "admin") {
//       console.log("Setting admin filters to all hubs");
//       setPackerHubNames([]);
//       setFilters({
//         hub: "all",
//         session: "all",
//         rider: "all",
//       });
//       sessionStorage.removeItem("packer:filters:grouped");
//     }
//   }, [userRole, packerData, allHubs]);

//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showSessionModal, setShowSessionModal] = useState(false);
//   const [selectedItemForSession, setSelectedItemForSession] = useState(null);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [lastRefreshed, setLastRefreshed] = useState(null);
//   const lastGoodDataRef = useRef(null);

//   // Add new state declarations for hub selection
//   const [showHubSelectionModal, setShowHubSelectionModal] = useState(false);
//   const [pendingSessionSelection, setPendingSessionSelection] = useState(null);

//   const { data, error, isValidating, refresh, mutate } = usePackingData();
//   const packingData = data?.groupedData || [];

//   useEffect(() => {
//     if (Array.isArray(packingData) && packingData.length > 0) {
//       lastGoodDataRef.current = packingData;
//     }
//   }, [packingData]);

//   const availableFilters = useAvailableFilters(
//     packingData,
//     userRole,
//     packerData,
//     allHubs,
//     packerHubNames,
//     allRiders,
//   );

//   const summary = useSummary(packingData, filters, userRole, packerHubNames);

//   const groupedItems = useGroupedItems(
//     packingData,
//     filters,
//     userRole,
//     packerHubNames,
//   );

//   const loading =
//     (!data && !error && !lastGoodDataRef.current) || ridersLoading;

//   const handleFilterChange = (filterType, value) => {
//     setFilters((prev) => ({ ...prev, [filterType]: value }));
//   };

//   const handleRefresh = async () => {
//     console.log("[grouped] manual refresh requested");
//     await Promise.all([mutate(), refreshRiders()]);
//     setLastRefreshed(new Date());
//   };

//   const handlePackedClick = (item) => {
//     setSelectedItemForSession(item);
//     setShowSessionModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedItem(null);
//     setIsUpdating(false);
//   };

//   const handleCloseSessionModal = () => {
//     setShowSessionModal(false);
//     setSelectedItemForSession(null);
//     setIsUpdating(false);
//   };

//   const handleHubSelection = async (selectedHub) => {
//     setShowHubSelectionModal(false);
//     if (!pendingSessionSelection) return;

//     try {
//       const { session, sessionData, item, hubCounts } = pendingSessionSelection;
//       const hubToFetch = selectedHub;

//       // Get the actual count for this hub
//       const hubItemCount = hubCounts?.[selectedHub] || sessionData.ordered;

//       console.log('Session data:', {
//         name: item.name,
//         hub: hubToFetch,
//         session,
//         expectedOrdered: sessionData.ordered,
//         hubItemCount,
//         expectedPacked: sessionData.packed,
//         expectedRemaining: sessionData.remaining,
//         userRole
//       });

//       const today = new Date().toISOString().split('T')[0];

//       const url = `${API_BASE_URL}/packer/packing/today/individual?name=${encodeURIComponent(
//         item.name,
//       )}&hubName=${encodeURIComponent(hubToFetch)}&session=${encodeURIComponent(session)}&deliveryDate=${today}`;

//       console.log("Fetching individual items from:", url);
//       const res = await fetchWithTimeout(url, {}, 8000);
//       console.log("Individual items response:", res);

//       if (res?.success && Array.isArray(res?.data)) {
//         const individualItems = res.data;
//         const packedCount = individualItems.filter((it) => it.isPacked).length;

//         setSelectedItem({
//           ...item,
//           session,
//           hubName: hubToFetch,
//           individualItems,
//           totalOrdered: individualItems.length,
//           packed: packedCount,
//           isPacked: packedCount > 0,
//           isFullyPacked: packedCount === individualItems.length && individualItems.length > 0,
//           totalAcrossAllHubs: sessionData.ordered,
//           otherHubsCount: sessionData.ordered - individualItems.length,
//           availableHubs: item.hubs
//         });

//         setShowModal(true);
//       } else {
//         console.error("Invalid response structure:", res);
//         alert("No individual items found for this session or invalid response format");
//       }
//     } catch (err) {
//       console.log("[grouped] individual items fetch failed:", err.message);
//       alert("Error fetching individual items: " + err.message);
//     } finally {
//       setPendingSessionSelection(null);
//     }
//   };

//   const handleSessionSelect = async (session) => {
//     setShowSessionModal(false);
//     try {
//       let availableHubsForUser = [];
//       let hubCounts = {};

//       if (userRole === "admin") {
//         availableHubsForUser = selectedItemForSession.hubs;
//       } else if (userRole === "packer") {
//         if (packerHubNames && packerHubNames.length > 0) {
//           console.log("Packer hub names:", packerHubNames);
//           console.log("Item hubs:", selectedItemForSession.hubs);

//           // Filter to only show hubs that belong to this packer
//           availableHubsForUser = selectedItemForSession.hubs.filter(hub =>
//             packerHubNames.includes(hub)
//           );

//           console.log("Available hubs for packer:", availableHubsForUser);
//         }
//       }

//       if (availableHubsForUser.length === 0) {
//         alert("No hubs available for you to view");
//         return;
//       }

//       const sessionData = selectedItemForSession.sessions.find(
//         s => s.session === session
//       );

//       if (!sessionData) {
//         alert("Session data not found");
//         return;
//       }

//       // Calculate per-hub counts from the original packing data
//       if (packingData && Array.isArray(packingData)) {
//         // Filter items for this specific session and item name
//         const sessionItems = packingData.filter(item =>
//           item.name === selectedItemForSession.name &&
//           item.session === session
//         );

//         // Count items per hub
//         sessionItems.forEach(item => {
//           if (item.hubName) {
//             hubCounts[item.hubName] = (hubCounts[item.hubName] || 0) + (item.totalOrdered || 1);
//           }
//         });

//         console.log("Hub counts:", hubCounts);
//       }

//       if (availableHubsForUser.length > 1) {
//         setPendingSessionSelection({
//           session,
//           sessionData,
//           hubs: availableHubsForUser,
//           item: selectedItemForSession,
//           hubCounts
//         });
//         setShowHubSelectionModal(true);
//         return;
//       }

//       const hubToFetch = availableHubsForUser[0];

//       console.log('Session data:', {
//         name: selectedItemForSession.name,
//         hub: hubToFetch,
//         session,
//         expectedOrdered: sessionData.ordered,
//         expectedPacked: sessionData.packed,
//         expectedRemaining: sessionData.remaining,
//         userRole,
//         availableHubs: availableHubsForUser
//       });

//       const today = new Date().toISOString().split('T')[0];

//       const url = `${API_BASE_URL}/packer/packing/today/individual?name=${encodeURIComponent(
//         selectedItemForSession.name,
//       )}&hubName=${encodeURIComponent(hubToFetch)}&session=${encodeURIComponent(session)}&deliveryDate=${today}`;

//       console.log("Fetching individual items from:", url);
//       const res = await fetchWithTimeout(url, {}, 8000);
//       console.log("Individual items response:", res);

//       if (res?.success && Array.isArray(res?.data)) {
//         const individualItems = res.data;

//         console.log(`Found ${individualItems.length} individual items in database for this session at hub ${hubToFetch}`);

//         const packedCount = individualItems.filter((it) => it.isPacked).length;

//         setSelectedItem({
//           ...selectedItemForSession,
//           session,
//           hubName: hubToFetch,
//           individualItems,
//           totalOrdered: individualItems.length,
//           packed: packedCount,
//           isPacked: packedCount > 0,
//           isFullyPacked: packedCount === individualItems.length && individualItems.length > 0,
//           totalAcrossAllHubs: sessionData.ordered,
//           otherHubsCount: sessionData.ordered - individualItems.length,
//           availableHubs: availableHubsForUser
//         });

//         setShowModal(true);
//       } else {
//         console.error("Invalid response structure:", res);
//         alert("No individual items found for this session or invalid response format");
//       }
//     } catch (err) {
//       console.log("[grouped] individual items fetch failed:", err.message);
//       alert("Error fetching individual items: " + err.message);
//     }
//   };

//   useEffect(() => {
//     if (!showModal && !showSessionModal) {
//       mutate();
//     }
//   }, [showModal, showSessionModal, mutate]);

//   const updateIndividualPackingStatus = async (individualItemId, isPacked) => {
//     if (!selectedItem || !selectedItemForSession) return;
//     setIsUpdating(true);

//     const previousSelectedItem = { ...selectedItem };

//     setSelectedItem((prev) => {
//       if (!prev) return prev;
//       const updatedIndividualItems = (prev.individualItems || []).map((it) =>
//         it._id === individualItemId ? { ...it, isPacked } : it
//       );

//       const packedCount = updatedIndividualItems.filter((x) => x.isPacked).length;
//       const totalCount = updatedIndividualItems.length;

//       return {
//         ...prev,
//         individualItems: updatedIndividualItems,
//         packed: packedCount,
//         isPacked: packedCount > 0,
//         isFullyPacked: packedCount === totalCount,
//       };
//     });

//     await globalMutate(
//       SWR_KEY,
//       (current) => {
//         if (!current) return current;

//         const newGroupedData = (current.groupedData || []).map((item) => {
//           const matches =
//             item.name === selectedItemForSession.name &&
//             item.session === selectedItem.session &&
//             item.hubName === selectedItem.hubName;

//           if (!matches) return item;

//           const currentPacked = Number(item.packed) || 0;
//           const newPacked = isPacked ? currentPacked + 1 : Math.max(0, currentPacked - 1);
//           const ordered = Number(item.totalOrdered) || 0;

//           return {
//             ...item,
//             packed: newPacked,
//             isPacked: newPacked > 0,
//             isFullyPacked: newPacked === ordered,
//           };
//         });

//         return {
//           ...current,
//           groupedData: newGroupedData,
//         };
//       },
//       false
//     );

//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/packer/packing/update-individual-packed`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ packingId: individualItemId, isPacked }),
//         }
//       );

//       const json = await res.json();
//       if (!json?.success) {
//         throw new Error(json?.message || "Failed to update packing status");
//       }

//       await mutate();
//     } catch (err) {
//       console.log("[grouped] update failed:", err.message);

//       setSelectedItem(previousSelectedItem);
//       await globalMutate(SWR_KEY, undefined, true);
//       alert("Update failed: " + err.message);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   useEffect(() => {
//     if (data && Array.isArray(data.groupedData) && !isValidating) {
//       setLastRefreshed(new Date());
//     }
//   }, [data, isValidating]);

//   useEffect(() => {
//     const onFocus = () => {
//       console.log("[grouped] focus/visible -> revalidate");
//       mutate().then(() => setLastRefreshed(new Date()));
//     };
//     const onVisibility = () => {
//       if (document.visibilityState === "visible") onFocus();
//     };
//     window.addEventListener("focus", onFocus);
//     document.addEventListener("visibilitychange", onVisibility);
//     return () => {
//       window.removeEventListener("focus", onFocus);
//       document.removeEventListener("visibilitychange", onVisibility);
//     };
//   }, [mutate]);

//   useEffect(() => {
//     const id = setInterval(() => {
//       mutate().then(() => setLastRefreshed(new Date()));
//     }, 20000);
//     return () => clearInterval(id);
//   }, [mutate]);

//   return (
//     <Container fluid className="py-4">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <h2 className="text-black mb-1">Item Packer</h2>
//               <p className="text-muted mb-0">
//                 Manage and track order packing progress
//                 {lastRefreshed && (
//                   <span className="text-success fw-bold ms-2">
//                     Last refreshed: {lastRefreshed.toLocaleTimeString()}
//                   </span>
//                 )}
//                 {isValidating && (
//                   <span className="text-warning fw-bold ms-2">
//                     <Spinner
//                       animation="border"
//                       size="sm"
//                       className="me-2"
//                       style={{ width: "1rem", height: "1rem" }}
//                     />
//                     <Spinner
//                       animation="border"
//                       size="sm"
//                       style={{ width: "1rem", height: "1rem" }}
//                     />
//                   </span>
//                 )}
//               </p>
//             </div>
//             <div className="d-flex gap-2">
//               <Link to="/packer-dashboard">
//                 <button
//                   className="btn packer-toggle-btn"
//                   style={{
//                     backgroundColor: "#6c757d",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   <FaTable className="me-2" /> View Orders
//                 </button>
//               </Link>
//               <button
//                 className="btn packer-toggle-btn"
//                 style={{
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   fontWeight: "bold",
//                 }}
//                 onClick={handleRefresh}
//                 disabled={isValidating || ridersLoading}
//               >
//                 <FaListAlt className="me-2" /> Refresh
//               </button>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {/* Summary Cards */}
//      {!loading && (
//   <Row className="mb-4">
//     <Col md={4}>
//       <Card className="text-center" style={{ backgroundColor: "#aeaeae" }}>
//         <Card.Body>
//           <Card.Title className="text-black fs-2 fw-bold">
//             {data?.data?.summary?.totalItems || summary.totalOrdered || 0}
//           </Card.Title>
//           <Card.Text className="text-black">Total Items</Card.Text>
//         </Card.Body>
//       </Card>
//     </Col>
//     <Col md={4}>
//       <Card className="text-center" style={{ backgroundColor: "#6B8E23" }}>
//         <Card.Body>
//           <Card.Title className="text-white fs-2 fw-bold">
//             {data?.data?.summary?.totalPacked || summary.totalPacked || 0}
//           </Card.Title>
//           <Card.Text className="text-white">Packed Items</Card.Text>
//         </Card.Body>
//       </Card>
//     </Col>
//     <Col md={4}>
//       <Card className="text-center" style={{ backgroundColor: "#FFD700" }}>
//         <Card.Body>
//           <Card.Title className="text-black fs-2 fw-bold">
//             {(data?.data?.summary?.totalItems || 0) - (data?.data?.summary?.totalPacked || 0) || summary.remainingItems || 0}
//           </Card.Title>
//           <Card.Text className="text-black">Remaining Items</Card.Text>
//         </Card.Body>
//       </Card>
//     </Col>
//   </Row>
// )}

//       {/* Filters - Hub, Session, and Rider */}
//       <Card className="mb-4" style={{ backgroundColor: "#fff8dc" }}>
//         <Card.Body>
//           <Row>
//             {/* Hub Filter */}
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>
//                   <strong>Hub</strong>
//                 </Form.Label>
//                 <Form.Select
//                   value={filters.hub}
//                   onChange={(e) => handleFilterChange("hub", e.target.value)}
//                   disabled={userRole === "packer"}
//                 >
//                   <option value="all">All Hubs</option>
//                   {availableFilters.hubs.map((hub) => (
//                     <option key={hub} value={hub}>
//                       {hub}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {userRole === "packer" && packerHubNames.length > 0 && (
//                   <Form.Text className="text-muted">
//                     You have access to: {packerHubNames.join(', ')}
//                   </Form.Text>
//                 )}
//                 {userRole === "admin" && (
//                   <Form.Text className="text-muted">
//                     Admin view - showing all hubs
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>

//             {/* Session Filter */}
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>
//                   <strong>Session</strong>
//                 </Form.Label>
//                 <Form.Select
//                   value={filters.session}
//                   onChange={(e) =>
//                     handleFilterChange("session", e.target.value)
//                   }
//                 >
//                   <option value="all">All Sessions</option>
//                   {availableFilters.sessions.map((session) => (
//                     <option key={session} value={session}>
//                       {session}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//             </Col>

//             {/* Active Filters Summary */}
//             <Col md={12} className="mt-3">
//               <div className="text-muted small bg-light p-2 rounded">
//                 <div className="d-flex flex-wrap gap-3">
//                   <div>
//                     <strong>Hub:</strong>{" "}
//                     {filters.hub === "all" ? "All Hubs" : filters.hub}
//                   </div>
//                   <div>
//                     <strong>Session:</strong>{" "}
//                     {filters.session === "all"
//                       ? "All Sessions"
//                       : filters.session}
//                   </div>
//                   {userRole === "packer" && packerHubNames.length > 0 && (
//                     <div>
//                       <strong>Your Hubs:</strong> {packerHubNames.join(', ')}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       {error && (
//         <Alert variant="danger" className="mb-4">
//           <Alert.Heading>Error Loading Data</Alert.Heading>
//           <div className="mb-1">{error.message || "Failed to fetch data."}</div>
//           {data?.__fromCache && (
//             <small className="text-muted">
//               Showing cached data. We'll refresh in the background when the
//               network is available.
//             </small>
//           )}
//         </Alert>
//       )}

//       {loading && (
//         <div className="text-center py-5">
//           <Spinner animation="border" variant="primary" />
//           <p className="mt-2">Loading packing data...</p>
//         </div>
//       )}

//       {!loading && groupedItems.length > 0 && (
//         <Card>
//           <Card.Header className="d-flex justify-content-between align-items-center">
//             <h5 className="mb-0">Packing Summary - Grouped by Item Name</h5>
//             <div>
//               <Badge bg="primary" className="me-2">
//                 {groupedItems.length} unique items
//               </Badge>
//               {filters.hub !== "all" && (
//                 <Badge bg="secondary" className="me-2">
//                   Hub: {filters.hub}
//                 </Badge>
//               )}
//             </div>
//           </Card.Header>
//           <Card.Body className="p-0">
//             <div className="packer-table-responsive shadow-lg rounded">
//               <table className="table table-hover">
//                 <thead style={{ backgroundColor: "#6B8E23", color: "white" }}>
//                   <tr>
//                     <th>Item Name</th>
//                     <th>Category</th>
//                     <th>Available Sessions</th>
//                     <th>Total Ordered</th>
//                     <th>Total Packed</th>
//                     <th>Yet to Pack</th>
//                     <th>Pack Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {groupedItems.map((item, index) => {
//                     const totalOrdered = Number(item.totalOrdered) || 0;
//                     const totalPacked = Number(item.totalPacked) || 0;
//                     const remainingQuantity = Math.max(
//                       0,
//                       totalOrdered - totalPacked,
//                     );
//                     const isFullyPacked = remainingQuantity === 0;
//                     const isPartiallyPacked = totalPacked > 0 && !isFullyPacked;

//                     return (
//                       <tr key={`${item.name}-${index}`}>
//                         <td>
//                           <strong className="d-block" style={{ fontSize: "16px" }}>
//                             {item.itemName || item.name}
//                           </strong>
//                           <small className="text-muted">
//                             {item.unit}
//                           </small>
//                         </td>
//                         <td>
//                           <span
//                             className={`d-inline-block rounded-circle me-2 ${
//                               item.category &&
//                               item.category.toLowerCase() === "veg"
//                                 ? "bg-success"
//                                 : "bg-danger"
//                             }`}
//                             style={{ width: "10px", height: "10px" }}
//                           ></span>
//                           {item.categoryName}
//                         </td>
//                         <td>
//                           <div className="d-flex flex-wrap gap-1">
//                             {item.sessions.map((sessionInfo, idx) => (
//                               <Badge
//                                 key={idx}
//                                 bg={
//                                   sessionInfo.isFullyPacked
//                                     ? "success"
//                                     : sessionInfo.isPacked
//                                       ? "warning"
//                                       : "light"
//                                 }
//                                 text={
//                                   sessionInfo.isFullyPacked
//                                     ? "white"
//                                     : sessionInfo.isPacked
//                                       ? "dark"
//                                       : "dark"
//                                 }
//                                 className="p-2"
//                               >
//                                 {sessionInfo.session}:{" "}
//                                 {sessionInfo.remaining || 0} left
//                               </Badge>
//                             ))}
//                           </div>
//                         </td>
//                         <td>
//                           <span className="badge bg-secondary fs-6">
//                             {totalOrdered}
//                           </span>
//                         </td>
//                         <td>
//                           <span
//                             className={`badge ${
//                               isFullyPacked
//                                 ? "bg-success"
//                                 : isPartiallyPacked
//                                   ? "bg-warning"
//                                   : "bg-danger"
//                             } fs-6`}
//                           >
//                             {totalPacked}
//                           </span>
//                         </td>
//                         <td>
//                           <span className="badge bg-secondary fs-6">
//                             {remainingQuantity}
//                           </span>
//                         </td>
//                         <td>
//                           <Button
//                             size="sm"
//                             variant={
//                               remainingQuantity > 0
//                                 ? "success"
//                                 : "outline-success"
//                             }
//                             onClick={() => handlePackedClick(item)}
//                             disabled={isFullyPacked}
//                           >
//                             {remainingQuantity > 0
//                               ? `Pack Items`
//                               : "All Packed"}
//                           </Button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </Card.Body>
//         </Card>
//       )}

//       {!loading && !error && groupedItems.length === 0 && (
//         <Card>
//           <Card.Body className="text-center py-5">
//             <h5>No packing items found</h5>
//             <p className="text-muted">
//               {Array.isArray(packingData) && packingData.length === 0
//                 ? "There are no packing items for today. Items will appear here when orders are placed."
//                 : "No items match the current filters. Try selecting different hub, session, or rider filters."}
//             </p>
//           </Card.Body>
//         </Card>
//       )}

//       {/* Session Selection Modal */}
//       <Modal
//         show={showSessionModal}
//         onHide={handleCloseSessionModal}
//         size="xl"
//         dialogClassName="modal-dialog-scrollable"
//       >
//         <Modal.Header closeButton className="py-3">
//           <Modal.Title className="h4">Select Delivery Session</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="p-4">
//           {selectedItemForSession && (
//             <div>
//               <h5 className="mb-3">
//                 Packing: <strong>{selectedItemForSession.name}</strong>
//               </h5>
//               <div className="row mb-4">
//                 <div className="col-md-6">
//                   <p className="text-muted mb-1">
//                     <strong>Category:</strong> {selectedItemForSession.categoryName}
//                   </p>
//                   <p className="text-muted mb-1">
//                     <strong>Available Hubs:</strong>
//                   </p>
//                   <div className="d-flex flex-wrap gap-1 mb-2">
//                     {selectedItemForSession.hubs?.map((hub, idx) => (
//                       <Badge key={idx} bg="secondary">
//                         {hub}
//                       </Badge>
//                     ))}
//                   </div>
//                   <p className="text-muted mb-1">
//                     <strong>Total Ordered:</strong>{" "}
//                     {selectedItemForSession.totalOrdered || 0}
//                   </p>
//                   <p className="text-muted mb-1">
//                     <strong>Total Packed:</strong>{" "}
//                     {selectedItemForSession.totalPacked || 0}
//                   </p>
//                 </div>
//                 <div className="col-md-6">
//                   <div className="d-flex flex-wrap gap-1">
//                     {selectedItemForSession.riders?.map((rider, idx) => (
//                       <Badge key={idx} bg="info" className="p-2">
//                         <FaMotorcycle className="me-1" />
//                         {rider}
//                       </Badge>
//                     )) || "None"}
//                   </div>
//                   <p className="text-muted mt-2 mb-1">
//                     <strong>Currently filtering by hub:</strong>{" "}
//                     {filters.hub !== "all" ? filters.hub : "All Hubs"}
//                   </p>
//                 </div>
//               </div>

//               <div className="row g-4">
//                 {selectedItemForSession.sessions.map((sessionInfo, index) => (
//                   <div key={index} className="col-lg-6 col-md-12">
//                     <Card
//                       className={`h-100 cursor-pointer ${
//                         sessionInfo.isFullyPacked
//                           ? "border-success bg-light"
//                           : "border-primary"
//                       }`}
//                       style={{
//                         cursor: sessionInfo.isFullyPacked
//                           ? "default"
//                           : "pointer",
//                         opacity: sessionInfo.isFullyPacked ? 0.8 : 1,
//                         transition: "all 0.2s",
//                       }}
//                       onClick={() => {
//                         if (!sessionInfo.isFullyPacked) {
//                           handleSessionSelect(sessionInfo.session);
//                         }
//                       }}
//                     >
//                       <Card.Body className="text-center p-4">
//                         <h5 className="mb-3 text-primary">
//                           {sessionInfo.session}
//                         </h5>
//                         {userRole === "admin" && (
//                           <Badge bg="info" className="mb-2">
//                             Click to view (all hubs)
//                           </Badge>
//                         )}
//                         {userRole === "packer" && packerHubNames.length > 1 && (
//                           <Badge bg="success" className="mb-2">
//                             {packerHubNames.length} hubs available
//                           </Badge>
//                         )}
//                         <div className="mt-3">
//                           <div className="mb-2">
//                             <Badge bg="primary" className="fs-6 p-2 w-100">
//                               Ordered: {sessionInfo.ordered || 0}
//                             </Badge>
//                           </div>
//                           <div className="mb-2">
//                             <Badge
//                               bg={
//                                 (sessionInfo.packed || 0) > 0
//                                   ? "success"
//                                   : "secondary"
//                               }
//                               className="fs-6 p-2 w-100"
//                             >
//                               Packed: {sessionInfo.packed || 0}
//                             </Badge>
//                           </div>
//                           <div className="mb-2">
//                             <Badge
//                               bg={
//                                 (sessionInfo.remaining || 0) > 0
//                                   ? "warning"
//                                   : "success"
//                               }
//                               className="fs-6 p-2 w-100"
//                             >
//                               {(sessionInfo.remaining || 0) > 0
//                                 ? `${sessionInfo.remaining} to pack`
//                                 : "All packed"}
//                             </Badge>
//                           </div>
//                         </div>
//                         {sessionInfo.isFullyPacked && (
//                           <div className="mt-3">
//                             <FaCheckCircle className="text-success fs-5" />
//                             <span className="text-success ms-2 fw-bold">
//                               Fully Packed
//                             </span>
//                           </div>
//                         )}
//                       </Card.Body>
//                     </Card>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* Hub Selection Modal */}
//       <Modal
//         show={showHubSelectionModal}
//         onHide={() => {
//           setShowHubSelectionModal(false);
//           setPendingSessionSelection(null);
//         }}
//         size="md"
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Select Hub</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {pendingSessionSelection && (
//             <>
//               <p className="mb-3">
//                 {userRole === "admin" ? (
//                   <>Select a hub to view items for <strong>{pendingSessionSelection.item.name}</strong> ({pendingSessionSelection.session} session):</>
//                 ) : (
//                   <>You have access to multiple hubs. Select which hub's items you want to view for <strong>{pendingSessionSelection.item.name}</strong> ({pendingSessionSelection.session} session):</>
//                 )}
//               </p>
//               <div className="d-flex flex-column gap-2">
//                 {pendingSessionSelection.hubs.map((hub, idx) => {
//                   // Get the actual count for this hub from hubCounts
//                   const hubCount = pendingSessionSelection.hubCounts?.[hub] || 0;

//                   return (
//                     <Button
//                       key={idx}
//                       variant="outline-primary"
//                       className="text-start d-flex justify-content-between align-items-center"
//                       onClick={() => handleHubSelection(hub)}
//                     >
//                       <span>{hub}</span>
//                       <Badge bg="secondary">{hubCount} items</Badge>
//                     </Button>
//                   );
//                 })}
//               </div>
//               <div className="mt-3 text-muted small">
//                 <strong>Total across all hubs:</strong> {pendingSessionSelection.sessionData?.ordered || 0} items
//               </div>
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => {
//               setShowHubSelectionModal(false);
//               setPendingSessionSelection(null);
//             }}
//           >
//             Cancel
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Individual Packing Modal */}
//       {showModal && selectedItem && (
//         <div
//           className="modal fade show d-block"
//           tabIndex="-1"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog modal-xl modal-dialog-scrollable" style={{ maxWidth: "90%" }}>
//             <div className="modal-content">
//               <div className="modal-header py-3">
//                 <div>
//                   <h4 className="modal-title">Packing: {selectedItem.name}</h4>
//                   <div className="text-muted mt-2">
//                     <Badge bg="secondary" className="me-2">
//                       {selectedItem.unit}
//                     </Badge>
//                     <Badge
//                       bg={
//                         selectedItem.category &&
//                         selectedItem.category.toLowerCase() === "veg"
//                           ? "success"
//                           : "danger"
//                       }
//                       className="me-2"
//                     >
//                       {selectedItem.categoryName}
//                     </Badge>
//                     <Badge bg="info" className="me-2">
//                       {selectedItem.hubName}
//                     </Badge>
//                     <Badge bg="primary">{selectedItem.session}</Badge>
//                   </div>
//                   <div className="mt-2">
//                     <FaMotorcycle className="me-1 text-info" />
//                     <span className="text-muted">
//                       Riders: {selectedItem.riders?.join(", ") || "None"}
//                     </span>
//                   </div>
//                   {selectedItem.totalAcrossAllHubs && selectedItem.totalAcrossAllHubs > selectedItem.totalOrdered && (
//                     <div className="alert alert-info mt-2 mb-0 py-2">
//                       <small>
//                         <strong>Note:</strong> This item has {selectedItem.totalAcrossAllHubs} total orders across all hubs.
//                         You are seeing {selectedItem.totalOrdered} items for {selectedItem.hubName} hub.
//                         The remaining {selectedItem.otherHubsCount} items are assigned to other hubs.
//                       </small>
//                     </div>
//                   )}
//                 </div>
//                 <button
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                 ></button>
//               </div>

//               <div className="modal-body p-4">
//                 <div className="row mb-4">
//                   <div className="col-4">
//                     <div className="card bg-light">
//                       <div className="card-body text-center">
//                         <h6 className="text-muted mb-2">Total Items</h6>
//                         <h3 className="text-primary mb-0">
//                           {selectedItem.totalOrdered || 0}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-4">
//                     <div className="card bg-light">
//                       <div className="card-body text-center">
//                         <h6 className="text-muted mb-2">Packed</h6>
//                         <h3 className="text-success mb-0">
//                           {selectedItem.packed || 0}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-4">
//                     <div className="card bg-light">
//                       <div className="card-body text-center">
//                         <h6 className="text-muted mb-2">Remaining</h6>
//                         <h3 className="text-warning mb-0">
//                           {Math.max(
//                             0,
//                             (selectedItem.totalOrdered || 0) -
//                               (selectedItem.packed || 0),
//                           )}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <h6 className="mb-3">
//                   Individual Items - Click to toggle packing status
//                 </h6>
//                 <div className="row g-3">
//                   {selectedItem.individualItems?.map((individualItem) => (
//                     <div
//                       key={individualItem._id}
//                       className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
//                     >
//                       <div
//                         className={`card h-100 cursor-pointer ${
//                           individualItem.isPacked
//                             ? "bg-success text-white"
//                             : "bg-light"
//                         }`}
//                         style={{
//                           transition: "all 0.2s",
//                           cursor: "pointer",
//                           border: individualItem.isPacked
//                             ? "2px solid #28a745"
//                             : "2px solid #ffc107",
//                         }}
//                         onClick={async () => {
//                           if (isUpdating) return;
//                           await updateIndividualPackingStatus(
//                             individualItem._id,
//                             !individualItem.isPacked,
//                           );
//                         }}
//                       >
//                         <div className="card-body text-center p-3">
//                           <div className="mb-2">
//                             {individualItem.isPacked ? (
//                               <FaCheckCircle className="fs-3" />
//                             ) : (
//                               <FaBox className="fs-3 text-warning" />
//                             )}
//                           </div>
//                           <h6
//                             className={`card-title mb-1 ${
//                               individualItem.isPacked
//                                 ? "text-white"
//                                 : "text-dark"
//                             }`}
//                           >
//                             {selectedItem.categoryName}
//                           </h6>
//                           <div className="mt-2">
//                             {individualItem.isPacked ? (
//                               <Badge bg="light" text="dark">
//                                 Packed
//                               </Badge>
//                             ) : (
//                               <Badge bg="warning" text="dark">
//                                 Click to Pack
//                               </Badge>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button
//                   className="btn btn-secondary"
//                   onClick={handleCloseModal}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default PackerOrders;




















"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Form,
  Button,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import {
  FaCheckCircle,
  FaBox,
  FaTable,
  FaListAlt,
  FaMotorcycle,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

// Constants
const API_BASE_URL = "https://dd-backend-3nm0.onrender.com/api";
const ADMIN_ORDERS_URL = `${API_BASE_URL}/admin/getPackerOrders2`;
const PACKING_GROUPED_URL = `${API_BASE_URL}/packer/packing/today/grouped`;
const HUBS_API_URL = `${API_BASE_URL}/Hub/hubs`;
const RIDERS_API_URL = `${API_BASE_URL}/admin/riders`;
const SWR_KEY = "packer:combined";
const LOCAL_CACHE_KEY = "packer:combined:cache:v1";
const CACHE_TTL_MS = 5 * 60 * 1000;

function getUserRole() {
  if (typeof window === "undefined") return null;

  const isAdmin = localStorage.getItem("admin");
  if (isAdmin && isAdmin.includes("Admin Login Successfully")) {
    return "admin";
  }

  const packerData = localStorage.getItem("packer");
  if (packerData) {
    try {
      const packer = JSON.parse(packerData);
      return "packer";
    } catch {
      return null;
    }
  }

  return null;
}

function getPackerData() {
  if (typeof window === "undefined") return null;

  const packerData = localStorage.getItem("packer");
  if (packerData) {
    try {
      return JSON.parse(packerData);
    } catch {
      return null;
    }
  }

  return null;
}

function readLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data || !parsed.ts) return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {}
  return null;
}

function writeLocalCache(data) {
  try {
    localStorage.setItem(
      LOCAL_CACHE_KEY,
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch {}
}

function isAbortError(err) {
  return err?.name === "AbortError" || /aborted/i.test(err?.message || "");
}

async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...opts,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Non-JSON for ${url}: ${text.slice(0, 120)}...`);
    }
    const json = await res.json();
    return json;
  } catch (err) {
    if (isAbortError(err)) {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

function withBust(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}ts=${Date.now()}`;
}

async function fetchCombined() {
  const cached = readLocalCache();

  let adminData = null;
  try {
    adminData = await fetchWithTimeout(ADMIN_ORDERS_URL, {}, 5000);
  } catch (e) {
    console.log("[v4] getPackerOrders2 skipped/failed:", e.message);
  }

  let groupedJson = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      groupedJson = await fetchWithTimeout(
        withBust(PACKING_GROUPED_URL),
        {},
        6000,
      );
      break;
    } catch (e) {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      console.log("[v4] grouped fetch failed:", e.message);
    }
  }

  let groupedData = [];
  if (
    Array.isArray(groupedJson?.data?.groupedData) &&
    groupedJson.data.groupedData.length > 0
  ) {
    groupedData = groupedJson.data.groupedData;
  } else if (Array.isArray(groupedJson?.groupedData)) {
    groupedData = groupedJson.groupedData;
  } else if (
    cached &&
    Array.isArray(cached.groupedData) &&
    cached.groupedData.length > 0
  ) {
    groupedData = cached.groupedData;
  }

  if (!Array.isArray(groupedData)) groupedData = [];

  const combined = {
    adminResult: adminData,
    groupedData,
    __fromCache: !(
      Array.isArray(groupedJson?.groupedData) &&
      groupedJson.groupedData.length > 0
    ),
  };

  writeLocalCache(combined);
  return combined;
}

function usePackingData() {
  const fallbackData = typeof window !== "undefined" ? readLocalCache() : null;

  const {
    data,
    error,
    isValidating,
    mutate: swrMutate,
  } = useSWR(SWR_KEY, fetchCombined, {
    fallbackData,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    revalidateIfStale: true,
    dedupingInterval: 0,
    refreshInterval: 0,
    refreshWhenHidden: true,
    errorRetryCount: 1,
    errorRetryInterval: 3000,
    shouldRetryOnError: (err) => {
      if (isAbortError(err)) return false;
      return true;
    },
  });

  return {
    data,
    error,
    isValidating,
    refresh: () => swrMutate(),
    mutate: swrMutate,
  };
}

function useHubs() {
  const { data, error, isValidating } = useSWR(
    HUBS_API_URL,
    async (url) => {
      try {
        const res = await fetchWithTimeout(url, {}, 8000);
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.log("[v4] hubs fetch failed:", err.message);
        return [];
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    },
  );

  return {
    hubs: data || [],
    hubsLoading: isValidating,
    hubsError: error,
  };
}

function useRiders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(RIDERS_API_URL);
      if (response.data && response.data.riders) {
        const activeRiders = response.data.riders.filter(
          (rider) => rider.status === "active",
        );
        setRiders(activeRiders);
      }
    } catch (err) {
      console.error("Error fetching riders:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  return {
    riders,
    ridersLoading: loading,
    ridersError: error,
    refreshRiders: fetchRiders,
  };
}

// Available filters - hubs, sessions, riders
function useAvailableFilters(
  groupedData,
  userRole,
  packerData,
  allHubs,
  packerHubNames,
  allRiders,
) {
  return useMemo(() => {
    if (!Array.isArray(groupedData)) {
      return { hubs: [], sessions: [], riders: [] };
    }

    let hubs = [
      ...new Set(groupedData.map((item) => item.hubName).filter(Boolean)),
    ];

    // For packers, filter hubs to only show their assigned hubs
    if (userRole === "packer" && packerHubNames && packerHubNames.length > 0) {
      hubs = hubs.filter((hub) => packerHubNames.includes(hub));
    }

    const sessions = [
      ...new Set(groupedData.map((item) => item.session).filter(Boolean)),
    ];

    const riderNamesFromOrders = [
      ...new Set(
        groupedData.flatMap((item) =>
          Array.isArray(item.orders)
            ? item.orders
                .map((order) => order?.riderName || order?.assignedRider)
                .filter(Boolean)
            : [],
        ),
      ),
    ];

    const activeRiderNames = allRiders.map(
      (rider) => rider.name || rider.riderName || rider.username,
    );
    const allRiderNames = [
      ...new Set([...riderNamesFromOrders, ...activeRiderNames]),
    ].sort();

    return { hubs, sessions, riders: allRiderNames };
  }, [groupedData, userRole, packerHubNames, allRiders]);
}

// Summary calculation with hub, session, and rider filters
function useSummary(packingData, filters, userRole, packerHubNames) {
  return useMemo(() => {
    if (!Array.isArray(packingData))
      return {
        totalGroups: 0,
        totalOrdered: 0,
        totalPacked: 0,
        remainingItems: 0,
        fullyPackedGroups: 0,
        partiallyPackedGroups: 0,
        notPackedGroups: 0,
      };

    let filtered = packingData;

    if (filters.hub && filters.hub !== "all") {
      filtered = filtered.filter((item) => item.hubName === filters.hub);
    }

    // For packers, filter to only show their assigned hubs
    if (userRole === "packer" && packerHubNames && packerHubNames.length > 0) {
      filtered = filtered.filter((item) =>
        packerHubNames.includes(item.hubName),
      );
    }

    if (filters.session && filters.session !== "all") {
      filtered = filtered.filter((item) => item.session === filters.session);
    }

    if (filters.rider && filters.rider !== "all") {
      filtered = filtered.filter(
        (item) =>
          Array.isArray(item.orders) &&
          item.orders.some(
            (order) =>
              order?.riderName === filters.rider ||
              order?.assignedRider === filters.rider,
          ),
      );
    }

    const totalOrdered = filtered.reduce(
      (sum, it) => sum + (Number(it.totalOrdered) || 0),
      0,
    );
    const totalPacked = filtered.reduce(
      (sum, it) => sum + (Number(it.totalPacked) || 0),
      0,
    );

    return {
      totalGroups: filtered.length,
      totalOrdered,
      totalPacked,
      remainingItems: Math.max(0, totalOrdered - totalPacked),
      fullyPackedGroups: filtered.filter((it) => it.isFullyPacked).length,
      partiallyPackedGroups: filtered.filter(
        (it) => it.isPacked && !it.isFullyPacked,
      ).length,
      notPackedGroups: filtered.filter((it) => !it.isPacked).length,
    };
  }, [packingData, filters, userRole, packerHubNames]);
}

// Grouped items - GROUP BY ITEM NAME ONLY
function useGroupedItems(packingData, filters, userRole, packerHubNames) {
  return useMemo(() => {
    if (!Array.isArray(packingData)) return [];

    const groupedMap = new Map();

    let filteredData = [...packingData];

    if (filters.hub && filters.hub !== "all") {
      filteredData = filteredData.filter(
        (item) => item.hubName === filters.hub,
      );
    }

    // For packers, filter to only show their assigned hubs
    if (userRole === "packer" && packerHubNames && packerHubNames.length > 0) {
      filteredData = filteredData.filter((item) =>
        packerHubNames.includes(item.hubName),
      );
    }

    if (filters.session && filters.session !== "all") {
      filteredData = filteredData.filter(
        (item) => item.session === filters.session,
      );
    }

    for (const item of filteredData) {
      if (!item || typeof item !== "object") continue;

      const key = `${item.name}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          name: item.name || "Unknown Item",
          itemName: item.name || "Unknown Item",
          category: item.category || "Unknown Category",
          categoryName: item.categoryName || "Unknown Category Name",
          unit: item.unit || "unit",
          hubs: new Set(),
          totalOrdered: 0,
          totalPacked: 0,
          sessions: new Map(),
          riders: new Set(),
          isPacked: false,
          isFullyPacked: false,
        });
      }

      const group = groupedMap.get(key);

      const itemOrdered = Number(item.totalOrdered) || 0;
      const itemPacked = Number(item.totalPacked) || 0;

      group.totalOrdered += itemOrdered;
      group.totalPacked += itemPacked;

      if (item.hubName) {
        group.hubs.add(item.hubName);
      }

      const sessionName = item.session || "Unknown Session";

      if (!group.sessions.has(sessionName)) {
        group.sessions.set(sessionName, {
          session: sessionName,
          ordered: itemOrdered,
          packed: itemPacked,
          remaining: Math.max(0, itemOrdered - itemPacked),
          isFullyPacked: itemPacked === itemOrdered && itemOrdered > 0,
          isPacked: itemPacked > 0,
        });
      } else {
        const s = group.sessions.get(sessionName);
        s.ordered += itemOrdered;
        s.packed += itemPacked;
        s.remaining = Math.max(0, s.ordered - s.packed);
        s.isPacked = s.packed > 0;
        s.isFullyPacked = s.packed === s.ordered && s.ordered > 0;
      }

      if (Array.isArray(item.orders)) {
        item.orders.forEach((order) => {
          const rider = order?.riderName || order?.assignedRider;
          if (rider) {
            group.riders.add(rider);
          }
        });
      }

      group.isPacked = group.totalPacked > 0;
      group.isFullyPacked =
        group.totalPacked === group.totalOrdered && group.totalOrdered > 0;
    }

    const result = Array.from(groupedMap.values())
      .map((g) => ({
        ...g,
        hubs: Array.from(g.hubs),
        sessions: Array.from(g.sessions.values()),
        riders: Array.from(g.riders),
        totalOrdered: Number(g.totalOrdered) || 0,
        totalPacked: Number(g.totalPacked) || 0,
        remaining: Math.max(
          0,
          (Number(g.totalOrdered) || 0) - (Number(g.totalPacked) || 0),
        ),
      }))
      .sort((a, b) => {
        const nameA = (a.itemName || a.name || "").toLowerCase();
        const nameB = (b.itemName || b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });

    return result;
  }, [packingData, filters, userRole, packerHubNames]);
}

const PackerOrders = () => {
  const [userRole, setUserRole] = useState(null);
  const [packerData, setPackerData] = useState(null);
  const { hubs: allHubs } = useHubs();
  const { riders: allRiders, ridersLoading, refreshRiders } = useRiders();
  const [packerHubNames, setPackerHubNames] = useState([]);

  // Clear ALL storage on component mount to ensure fresh start
  useEffect(() => {
    sessionStorage.removeItem("packer:filters:grouped");
    sessionStorage.removeItem("packer:filters");
    localStorage.removeItem("packer:selectedHub");

    const adminValue = localStorage.getItem("admin");
    if (adminValue && adminValue.includes("Admin Login Successfully")) {
      console.log("Admin detected in localStorage");
    }
  }, []);

  const [filters, setFilters] = useState(() => {
    return {
      hub: "all",
      session: "all",
      rider: "all",
    };
  });

  useEffect(() => {
    if (userRole !== "admin") {
      try {
        sessionStorage.setItem(
          "packer:filters:grouped",
          JSON.stringify(filters),
        );
      } catch {}
    }
  }, [filters, userRole]);

  useEffect(() => {
    const role = getUserRole();
    console.log("Detected user role:", role);
    setUserRole(role);

    if (role === "packer") {
      const pData = getPackerData();
      console.log("Packer data from localStorage:", pData);
      setPackerData(pData);
    }
  }, []);

  // Update the packer hub setup to handle multiple hubs (using hub names directly)
  useEffect(() => {
    if (!userRole || !allHubs.length) return;

    console.log("Setting filters based on role:", userRole);
    console.log("Packer data:", packerData);
    console.log("All hubs:", allHubs);

    if (userRole === "packer") {
      if (packerData?.hubs && Array.isArray(packerData.hubs)) {
        // packerData.hubs already contains hub names directly
        const hubNames = packerData.hubs.filter(Boolean);

        console.log("Packer hub names from localStorage:", hubNames);

        if (hubNames.length > 0) {
          console.log("Setting packer hubs to:", hubNames);
          setPackerHubNames(hubNames);
          // Don't set a specific hub filter - show all packer's hubs
          setFilters({
            hub: "all",
            session: "all",
            rider: "all",
          });
        } else {
          console.log("No valid hubs found for packer");
          setPackerHubNames([]);
        }
      }
    } else if (userRole === "admin") {
      console.log("Setting admin filters to all hubs");
      setPackerHubNames([]);
      setFilters({
        hub: "all",
        session: "all",
        rider: "all",
      });
      sessionStorage.removeItem("packer:filters:grouped");
    }
  }, [userRole, packerData, allHubs]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedItemForSession, setSelectedItemForSession] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const lastGoodDataRef = useRef(null);

  // Add new state declarations for hub selection
  const [showHubSelectionModal, setShowHubSelectionModal] = useState(false);
  const [pendingSessionSelection, setPendingSessionSelection] = useState(null);

  const { data, error, isValidating, refresh, mutate } = usePackingData();
  const packingData = data?.groupedData || [];

  useEffect(() => {
    if (Array.isArray(packingData) && packingData.length > 0) {
      lastGoodDataRef.current = packingData;
    }
  }, [packingData]);

  const availableFilters = useAvailableFilters(
    packingData,
    userRole,
    packerData,
    allHubs,
    packerHubNames,
    allRiders,
  );

  const summary = useSummary(packingData, filters, userRole, packerHubNames);

  const groupedItems = useGroupedItems(
    packingData,
    filters,
    userRole,
    packerHubNames,
  );

  const loading =
    (!data && !error && !lastGoodDataRef.current) || ridersLoading;

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleRefresh = async () => {
    console.log("[grouped] manual refresh requested");
    await Promise.all([mutate(), refreshRiders()]);
    setLastRefreshed(new Date());
  };

  const handlePackedClick = (item) => {
    setSelectedItemForSession(item);
    setShowSessionModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setIsUpdating(false);
  };

  const handleCloseSessionModal = () => {
    setShowSessionModal(false);
    setSelectedItemForSession(null);
    setIsUpdating(false);
  };

  const handleHubSelection = async (selectedHub) => {
    setShowHubSelectionModal(false);
    if (!pendingSessionSelection) return;

    try {
      const { session, sessionData, item, hubCounts } = pendingSessionSelection;
      const hubToFetch = selectedHub;

      // Get the actual count for this hub
      const hubItemCount = hubCounts?.[selectedHub] || sessionData.ordered;

      console.log("Session data:", {
        name: item.name,
        hub: hubToFetch,
        session,
        expectedOrdered: sessionData.ordered,
        hubItemCount,
        expectedPacked: sessionData.packed,
        expectedRemaining: sessionData.remaining,
        userRole,
      });

      const today = new Date().toISOString().split("T")[0];

      const url = `${API_BASE_URL}/packer/packing/today/individual?name=${encodeURIComponent(
        item.name,
      )}&hubName=${encodeURIComponent(hubToFetch)}&session=${encodeURIComponent(session)}&deliveryDate=${today}`;

      console.log("Fetching individual items from:", url);
      const res = await fetchWithTimeout(url, {}, 8000);
      console.log("Individual items response:", res);

      if (res?.success && Array.isArray(res?.data)) {
        const individualItems = res.data;
        // Fix: Check for packed status correctly - API uses 'packed' as number (0 or 1)
        const packedCount = individualItems.filter(
          (it) => it.packed === 1,
        ).length;

        setSelectedItem({
          ...item,
          session,
          hubName: hubToFetch,
          individualItems,
          totalOrdered: individualItems.length,
          packed: packedCount,
          isPacked: packedCount > 0,
          isFullyPacked:
            packedCount === individualItems.length &&
            individualItems.length > 0,
          totalAcrossAllHubs: sessionData.ordered,
          otherHubsCount: sessionData.ordered - individualItems.length,
          availableHubs: item.hubs,
        });

        setShowModal(true);
      } else {
        console.error("Invalid response structure:", res);
        alert(
          "No individual items found for this session or invalid response format",
        );
      }
    } catch (err) {
      console.log("[grouped] individual items fetch failed:", err.message);
      alert("Error fetching individual items: " + err.message);
    } finally {
      setPendingSessionSelection(null);
    }
  };

  const handleSessionSelect = async (session) => {
    setShowSessionModal(false);
    try {
      let availableHubsForUser = [];
      let hubCounts = {};

      if (userRole === "admin") {
        availableHubsForUser = selectedItemForSession.hubs;
      } else if (userRole === "packer") {
        if (packerHubNames && packerHubNames.length > 0) {
          console.log("Packer hub names:", packerHubNames);
          console.log("Item hubs:", selectedItemForSession.hubs);

          // Filter to only show hubs that belong to this packer
          availableHubsForUser = selectedItemForSession.hubs.filter((hub) =>
            packerHubNames.includes(hub),
          );

          console.log("Available hubs for packer:", availableHubsForUser);
        }
      }

      if (availableHubsForUser.length === 0) {
        alert("No hubs available for you to view");
        return;
      }

      const sessionData = selectedItemForSession.sessions.find(
        (s) => s.session === session,
      );

      if (!sessionData) {
        alert("Session data not found");
        return;
      }

      // Calculate per-hub counts from the original packing data
      if (packingData && Array.isArray(packingData)) {
        // Filter items for this specific session and item name
        const sessionItems = packingData.filter(
          (item) =>
            item.name === selectedItemForSession.name &&
            item.session === session,
        );

        // Count items per hub
        sessionItems.forEach((item) => {
          if (item.hubName) {
            hubCounts[item.hubName] =
              (hubCounts[item.hubName] || 0) + (item.totalOrdered || 1);
          }
        });

        console.log("Hub counts:", hubCounts);
      }

      if (availableHubsForUser.length > 1) {
        setPendingSessionSelection({
          session,
          sessionData,
          hubs: availableHubsForUser,
          item: selectedItemForSession,
          hubCounts,
        });
        setShowHubSelectionModal(true);
        return;
      }

      const hubToFetch = availableHubsForUser[0];

      console.log("Session data:", {
        name: selectedItemForSession.name,
        hub: hubToFetch,
        session,
        expectedOrdered: sessionData.ordered,
        expectedPacked: sessionData.packed,
        expectedRemaining: sessionData.remaining,
        userRole,
        availableHubs: availableHubsForUser,
      });

      const today = new Date().toISOString().split("T")[0];

      const url = `${API_BASE_URL}/packer/packing/today/individual?name=${encodeURIComponent(
        selectedItemForSession.name,
      )}&hubName=${encodeURIComponent(hubToFetch)}&session=${encodeURIComponent(session)}&deliveryDate=${today}`;

      console.log("Fetching individual items from:", url);
      const res = await fetchWithTimeout(url, {}, 8000);
      console.log("Individual items response:", res);

      if (res?.success && Array.isArray(res?.data)) {
        const individualItems = res.data;

        console.log(
          `Found ${individualItems.length} individual items in database for this session at hub ${hubToFetch}`,
        );

        // Fix: Check for packed status correctly - API uses 'packed' as number (0 or 1)
        const packedCount = individualItems.filter(
          (it) => it.packed === 1,
        ).length;

        setSelectedItem({
          ...selectedItemForSession,
          session,
          hubName: hubToFetch,
          individualItems,
          totalOrdered: individualItems.length,
          packed: packedCount,
          isPacked: packedCount > 0,
          isFullyPacked:
            packedCount === individualItems.length &&
            individualItems.length > 0,
          totalAcrossAllHubs: sessionData.ordered,
          otherHubsCount: sessionData.ordered - individualItems.length,
          availableHubs: availableHubsForUser,
        });

        setShowModal(true);
      } else {
        console.error("Invalid response structure:", res);
        alert(
          "No individual items found for this session or invalid response format",
        );
      }
    } catch (err) {
      console.log("[grouped] individual items fetch failed:", err.message);
      alert("Error fetching individual items: " + err.message);
    }
  };

  useEffect(() => {
    if (!showModal && !showSessionModal) {
      mutate();
    }
  }, [showModal, showSessionModal, mutate]);

  const updateIndividualPackingStatus = async (individualItemId, isPacked) => {
    if (!selectedItem || !selectedItemForSession) return;
    setIsUpdating(true);

    const previousSelectedItem = { ...selectedItem };

    // Update local state optimistically
    setSelectedItem((prev) => {
      if (!prev) return prev;
      const updatedIndividualItems = (prev.individualItems || []).map((it) => {
        if (it._id === individualItemId) {
          // The API uses 'packed' as a number (0 or 1)
          return { ...it, packed: isPacked ? 1 : 0 };
        }
        return it;
      });

      const packedCount = updatedIndividualItems.filter(
        (x) => x.packed === 1,
      ).length;
      const totalCount = updatedIndividualItems.length;

      return {
        ...prev,
        individualItems: updatedIndividualItems,
        packed: packedCount,
        isPacked: packedCount > 0,
        isFullyPacked: packedCount === totalCount,
      };
    });

    try {
      const res = await fetch(
        `${API_BASE_URL}/packer/packing/update-individual-packed`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packingId: individualItemId, isPacked }),
        },
      );

      const json = await res.json();
      if (!json?.success) {
        throw new Error(json?.message || "Failed to update packing status");
      }

      console.log("Update successful, refreshing all data...", json.data);

      // Force a complete refresh of all data
      await mutate();

      // Also refresh the specific item data to ensure modal shows correct counts
      const today = new Date().toISOString().split("T")[0];
      const refreshUrl = `${API_BASE_URL}/packer/packing/today/individual?name=${encodeURIComponent(
        selectedItem.name,
      )}&hubName=${encodeURIComponent(selectedItem.hubName)}&session=${encodeURIComponent(selectedItem.session)}&deliveryDate=${today}`;

      try {
        const refreshRes = await fetchWithTimeout(refreshUrl, {}, 8000);
        if (refreshRes?.success && Array.isArray(refreshRes?.data)) {
          const refreshedItems = refreshRes.data;
          const refreshedPackedCount = refreshedItems.filter(
            (it) => it.packed === 1,
          ).length;

          setSelectedItem((prev) => ({
            ...prev,
            individualItems: refreshedItems,
            packed: refreshedPackedCount,
            isPacked: refreshedPackedCount > 0,
            isFullyPacked: refreshedPackedCount === refreshedItems.length,
          }));
        }
      } catch (refreshErr) {
        console.log("Error refreshing individual items:", refreshErr);
      }
    } catch (err) {
      console.log("[grouped] update failed:", err.message);

      // Revert on error
      setSelectedItem(previousSelectedItem);
      await globalMutate(SWR_KEY, undefined, true);
      alert("Update failed: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (data && Array.isArray(data.groupedData) && !isValidating) {
      setLastRefreshed(new Date());
    }
  }, [data, isValidating]);

  useEffect(() => {
    const onFocus = () => {
      console.log("[grouped] focus/visible -> revalidate");
      mutate().then(() => setLastRefreshed(new Date()));
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mutate]);

  useEffect(() => {
    const id = setInterval(() => {
      mutate().then(() => setLastRefreshed(new Date()));
    }, 20000);
    return () => clearInterval(id);
  }, [mutate]);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-black mb-1">Item Packer</h2>
              <p className="text-muted mb-0">
                Manage and track order packing progress
                {lastRefreshed && (
                  <span className="text-success fw-bold ms-2">
                    Last refreshed: {lastRefreshed.toLocaleTimeString()}
                  </span>
                )}
                {isValidating && (
                  <span className="text-warning fw-bold ms-2">
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                      style={{ width: "1rem", height: "1rem" }}
                    />
                    <Spinner
                      animation="border"
                      size="sm"
                      style={{ width: "1rem", height: "1rem" }}
                    />
                  </span>
                )}
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/packer-dashboard">
                <button
                  className="btn packer-toggle-btn"
                  style={{
                    backgroundColor: "#6c757d",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <FaTable className="me-2" /> View Orders
                </button>
              </Link>
              <button
                className="btn packer-toggle-btn"
                style={{
                  backgroundColor: "#6B8E23",
                  color: "white",
                  fontWeight: "bold",
                }}
                onClick={handleRefresh}
                disabled={isValidating || ridersLoading}
              >
                <FaListAlt className="me-2" /> Refresh
              </button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Summary Cards */}
      {!loading && (
        <Row className="mb-4">
          <Col md={4}>
            <Card
              className="text-center"
              style={{ backgroundColor: "#aeaeae" }}
            >
              <Card.Body>
                <Card.Title className="text-black fs-2 fw-bold">
                  {data?.data?.summary?.totalItems || summary.totalOrdered || 0}
                </Card.Title>
                <Card.Text className="text-black">Total Items</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              className="text-center"
              style={{ backgroundColor: "#6B8E23" }}
            >
              <Card.Body>
                <Card.Title className="text-white fs-2 fw-bold">
                  {data?.data?.summary?.totalPacked || summary.totalPacked || 0}
                </Card.Title>
                <Card.Text className="text-white">Packed Items</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              className="text-center"
              style={{ backgroundColor: "#FFD700" }}
            >
              <Card.Body>
                <Card.Title className="text-black fs-2 fw-bold">
                  {(data?.data?.summary?.totalItems || 0) -
                    (data?.data?.summary?.totalPacked || 0) ||
                    summary.remainingItems ||
                    0}
                </Card.Title>
                <Card.Text className="text-black">Remaining Items</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters - Hub, Session, and Rider */}
      <Card className="mb-4" style={{ backgroundColor: "#fff8dc" }}>
        <Card.Body>
          <Row>
            {/* Hub Filter */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <strong>Hub</strong>
                </Form.Label>
                <Form.Select
                  value={filters.hub}
                  onChange={(e) => handleFilterChange("hub", e.target.value)}
                  disabled={userRole === "packer"}
                >
                  <option value="all">All Hubs</option>
                  {availableFilters.hubs.map((hub) => (
                    <option key={hub} value={hub}>
                      {hub}
                    </option>
                  ))}
                </Form.Select>
                {userRole === "packer" && packerHubNames.length > 0 && (
                  <Form.Text className="text-muted">
                    You have access to: {packerHubNames.join(", ")}
                  </Form.Text>
                )}
                {userRole === "admin" && (
                  <Form.Text className="text-muted">
                    Admin view - showing all hubs
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            {/* Session Filter */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <strong>Session</strong>
                </Form.Label>
                <Form.Select
                  value={filters.session}
                  onChange={(e) =>
                    handleFilterChange("session", e.target.value)
                  }
                >
                  <option value="all">All Sessions</option>
                  {availableFilters.sessions.map((session) => (
                    <option key={session} value={session}>
                      {session}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Active Filters Summary */}
            <Col md={12} className="mt-3">
              <div className="text-muted small bg-light p-2 rounded">
                <div className="d-flex flex-wrap gap-3">
                  <div>
                    <strong>Hub:</strong>{" "}
                    {filters.hub === "all" ? "All Hubs" : filters.hub}
                  </div>
                  <div>
                    <strong>Session:</strong>{" "}
                    {filters.session === "all"
                      ? "All Sessions"
                      : filters.session}
                  </div>
                  {userRole === "packer" && packerHubNames.length > 0 && (
                    <div>
                      <strong>Your Hubs:</strong> {packerHubNames.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error Loading Data</Alert.Heading>
          <div className="mb-1">{error.message || "Failed to fetch data."}</div>
          {data?.__fromCache && (
            <small className="text-muted">
              Showing cached data. We'll refresh in the background when the
              network is available.
            </small>
          )}
        </Alert>
      )}

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading packing data...</p>
        </div>
      )}

      {!loading && groupedItems.length > 0 && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Packing Summary - Grouped by Item Name</h5>
            <div>
              <Badge bg="primary" className="me-2">
                {groupedItems.length} unique items
              </Badge>
              {filters.hub !== "all" && (
                <Badge bg="secondary" className="me-2">
                  Hub: {filters.hub}
                </Badge>
              )}
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="packer-table-responsive shadow-lg rounded">
              <table className="table table-hover">
                <thead style={{ backgroundColor: "#6B8E23", color: "white" }}>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Available Sessions</th>
                    <th>Total Ordered</th>
                    <th>Total Packed</th>
                    <th>Yet to Pack</th>
                    <th>Pack Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedItems.map((item, index) => {
                    const totalOrdered = Number(item.totalOrdered) || 0;
                    const totalPacked = Number(item.totalPacked) || 0;
                    const remainingQuantity = Math.max(
                      0,
                      totalOrdered - totalPacked,
                    );
                    const isFullyPacked = remainingQuantity === 0;
                    const isPartiallyPacked = totalPacked > 0 && !isFullyPacked;

                    return (
                      <tr key={`${item.name}-${index}`}>
                        <td>
                          <strong
                            className="d-block"
                            style={{ fontSize: "16px" }}
                          >
                            {item.itemName || item.name}
                          </strong>
                          <small className="text-muted">{item.unit}</small>
                        </td>
                        <td>
                          <span
                            className={`d-inline-block rounded-circle me-2 ${
                              item.category &&
                              item.category.toLowerCase() === "veg"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                            style={{ width: "10px", height: "10px" }}
                          ></span>
                          {item.categoryName}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {item.sessions.map((sessionInfo, idx) => (
                              <Badge
                                key={idx}
                                bg={
                                  sessionInfo.isFullyPacked
                                    ? "success"
                                    : sessionInfo.isPacked
                                      ? "warning"
                                      : "light"
                                }
                                text={
                                  sessionInfo.isFullyPacked
                                    ? "white"
                                    : sessionInfo.isPacked
                                      ? "dark"
                                      : "dark"
                                }
                                className="p-2"
                              >
                                {sessionInfo.session}:{" "}
                                {sessionInfo.remaining || 0} left
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary fs-6">
                            {totalOrdered}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isFullyPacked
                                ? "bg-success"
                                : isPartiallyPacked
                                  ? "bg-warning"
                                  : "bg-danger"
                            } fs-6`}
                          >
                            {totalPacked}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary fs-6">
                            {remainingQuantity}
                          </span>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant={
                              remainingQuantity > 0
                                ? "success"
                                : "outline-success"
                            }
                            onClick={() => handlePackedClick(item)}
                            disabled={isFullyPacked}
                          >
                            {remainingQuantity > 0
                              ? `Pack Items`
                              : "All Packed"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {!loading && !error && groupedItems.length === 0 && (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No packing items found</h5>
            <p className="text-muted">
              {Array.isArray(packingData) && packingData.length === 0
                ? "There are no packing items for today. Items will appear here when orders are placed."
                : "No items match the current filters. Try selecting different hub, session, or rider filters."}
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Session Selection Modal */}
      <Modal
        show={showSessionModal}
        onHide={handleCloseSessionModal}
        size="xl"
        dialogClassName="modal-dialog-scrollable"
      >
        <Modal.Header closeButton className="py-3">
          <Modal.Title className="h4">Select Delivery Session</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedItemForSession && (
            <div>
              <h5 className="mb-3">
                Packing: <strong>{selectedItemForSession.name}</strong>
              </h5>
              <div className="row mb-4">
                <div className="col-md-6">
                  <p className="text-muted mb-1">
                    <strong>Category:</strong>{" "}
                    {selectedItemForSession.categoryName}
                  </p>
                  <p className="text-muted mb-1">
                    <strong>Available Hubs:</strong>
                  </p>
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {selectedItemForSession.hubs?.map((hub, idx) => (
                      <Badge key={idx} bg="secondary">
                        {hub}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted mb-1">
                    <strong>Total Ordered:</strong>{" "}
                    {selectedItemForSession.totalOrdered || 0}
                  </p>
                  <p className="text-muted mb-1">
                    <strong>Total Packed:</strong>{" "}
                    {selectedItemForSession.totalPacked || 0}
                  </p>
                </div>
                <div className="col-md-6">
                  <div className="d-flex flex-wrap gap-1">
                    {selectedItemForSession.riders?.map((rider, idx) => (
                      <Badge key={idx} bg="info" className="p-2">
                        <FaMotorcycle className="me-1" />
                        {rider}
                      </Badge>
                    )) || "None"}
                  </div>
                  <p className="text-muted mt-2 mb-1">
                    <strong>Currently filtering by hub:</strong>{" "}
                    {filters.hub !== "all" ? filters.hub : "All Hubs"}
                  </p>
                </div>
              </div>

              <div className="row g-4">
                {selectedItemForSession.sessions.map((sessionInfo, index) => (
                  <div key={index} className="col-lg-6 col-md-12">
                    <Card
                      className={`h-100 cursor-pointer ${
                        sessionInfo.isFullyPacked
                          ? "border-success bg-light"
                          : "border-primary"
                      }`}
                      style={{
                        cursor: sessionInfo.isFullyPacked
                          ? "default"
                          : "pointer",
                        opacity: sessionInfo.isFullyPacked ? 0.8 : 1,
                        transition: "all 0.2s",
                      }}
                      onClick={() => {
                        if (!sessionInfo.isFullyPacked) {
                          handleSessionSelect(sessionInfo.session);
                        }
                      }}
                    >
                      <Card.Body className="text-center p-4">
                        <h5 className="mb-3 text-primary">
                          {sessionInfo.session}
                        </h5>
                        {userRole === "admin" && (
                          <Badge bg="info" className="mb-2">
                            Click to view (all hubs)
                          </Badge>
                        )}
                        {userRole === "packer" && packerHubNames.length > 1 && (
                          <Badge bg="success" className="mb-2">
                            {packerHubNames.length} hubs available
                          </Badge>
                        )}
                        <div className="mt-3">
                          <div className="mb-2">
                            <Badge bg="primary" className="fs-6 p-2 w-100">
                              Ordered: {sessionInfo.ordered || 0}
                            </Badge>
                          </div>
                          <div className="mb-2">
                            <Badge
                              bg={
                                (sessionInfo.packed || 0) > 0
                                  ? "success"
                                  : "secondary"
                              }
                              className="fs-6 p-2 w-100"
                            >
                              Packed: {sessionInfo.packed || 0}
                            </Badge>
                          </div>
                          <div className="mb-2">
                            <Badge
                              bg={
                                (sessionInfo.remaining || 0) > 0
                                  ? "warning"
                                  : "success"
                              }
                              className="fs-6 p-2 w-100"
                            >
                              {(sessionInfo.remaining || 0) > 0
                                ? `${sessionInfo.remaining} to pack`
                                : "All packed"}
                            </Badge>
                          </div>
                        </div>
                        {sessionInfo.isFullyPacked && (
                          <div className="mt-3">
                            <FaCheckCircle className="text-success fs-5" />
                            <span className="text-success ms-2 fw-bold">
                              Fully Packed
                            </span>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Hub Selection Modal */}
      <Modal
        show={showHubSelectionModal}
        onHide={() => {
          setShowHubSelectionModal(false);
          setPendingSessionSelection(null);
        }}
        size="md"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Hub</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pendingSessionSelection && (
            <>
              <p className="mb-3">
                {userRole === "admin" ? (
                  <>
                    Select a hub to view items for{" "}
                    <strong>{pendingSessionSelection.item.name}</strong> (
                    {pendingSessionSelection.session} session):
                  </>
                ) : (
                  <>
                    You have access to multiple hubs. Select which hub's items
                    you want to view for{" "}
                    <strong>{pendingSessionSelection.item.name}</strong> (
                    {pendingSessionSelection.session} session):
                  </>
                )}
              </p>
              <div className="d-flex flex-column gap-2">
                {pendingSessionSelection.hubs.map((hub, idx) => {
                  // Get the actual count for this hub from hubCounts
                  const hubCount =
                    pendingSessionSelection.hubCounts?.[hub] || 0;

                  return (
                    <Button
                      key={idx}
                      variant="outline-primary"
                      className="text-start d-flex justify-content-between align-items-center"
                      onClick={() => handleHubSelection(hub)}
                    >
                      <span>{hub}</span>
                      <Badge bg="secondary">{hubCount} items</Badge>
                    </Button>
                  );
                })}
              </div>
              <div className="mt-3 text-muted small">
                <strong>Total across all hubs:</strong>{" "}
                {pendingSessionSelection.sessionData?.ordered || 0} items
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowHubSelectionModal(false);
              setPendingSessionSelection(null);
            }}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Individual Packing Modal */}
      {showModal && selectedItem && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-scrollable"
            style={{ maxWidth: "90%" }}
          >
            <div className="modal-content">
              <div className="modal-header py-3">
                <div>
                  <h4 className="modal-title">Packing: {selectedItem.name}</h4>
                  <div className="text-muted mt-2">
                    <Badge bg="secondary" className="me-2">
                      {selectedItem.unit}
                    </Badge>
                    <Badge
                      bg={
                        selectedItem.category &&
                        selectedItem.category.toLowerCase() === "veg"
                          ? "success"
                          : "danger"
                      }
                      className="me-2"
                    >
                      {selectedItem.categoryName}
                    </Badge>
                    <Badge bg="info" className="me-2">
                      {selectedItem.hubName}
                    </Badge>
                    <Badge bg="primary">{selectedItem.session}</Badge>
                  </div>
                  <div className="mt-2">
                    <FaMotorcycle className="me-1 text-info" />
                    <span className="text-muted">
                      Riders: {selectedItem.riders?.join(", ") || "None"}
                    </span>
                  </div>
                  {selectedItem.totalAcrossAllHubs &&
                    selectedItem.totalAcrossAllHubs >
                      selectedItem.totalOrdered && (
                      <div className="alert alert-info mt-2 mb-0 py-2">
                        <small>
                          <strong>Note:</strong> This item has{" "}
                          {selectedItem.totalAcrossAllHubs} total orders across
                          all hubs. You are seeing {selectedItem.totalOrdered}{" "}
                          items for {selectedItem.hubName} hub. The remaining{" "}
                          {selectedItem.otherHubsCount} items are assigned to
                          other hubs.
                        </small>
                      </div>
                    )}
                </div>
                <button
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row mb-4">
                  <div className="col-4">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Total Items</h6>
                        <h3 className="text-primary mb-0">
                          {selectedItem.totalOrdered || 0}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Packed</h6>
                        <h3 className="text-success mb-0">
                          {selectedItem.packed || 0}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Remaining</h6>
                        <h3 className="text-warning mb-0">
                          {Math.max(
                            0,
                            (selectedItem.totalOrdered || 0) -
                              (selectedItem.packed || 0),
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <h6 className="mb-3">
                  Individual Items - Click to toggle packing status
                </h6>
                <div className="row g-3">
                  {selectedItem.individualItems?.map((individualItem) => {
                    // Determine if this item is packed - API uses 'packed' as number (0 or 1)
                    const isItemPacked = individualItem.packed === 1;

                    return (
                      <div
                        key={individualItem._id}
                        className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
                      >
                        <div
                          className={`card h-100 cursor-pointer ${
                            isItemPacked ? "bg-success text-white" : "bg-light"
                          }`}
                          style={{
                            transition: "all 0.2s",
                            cursor: "pointer",
                            border: isItemPacked
                              ? "2px solid #28a745"
                              : "2px solid #ffc107",
                          }}
                          onClick={async () => {
                            if (isUpdating) return;
                            await updateIndividualPackingStatus(
                              individualItem._id,
                              !isItemPacked,
                            );
                          }}
                        >
                          <div className="card-body text-center p-3">
                            <div className="mb-2">
                              {isItemPacked ? (
                                <FaCheckCircle className="fs-3" />
                              ) : (
                                <FaBox className="fs-3 text-warning" />
                              )}
                            </div>
                            <h6
                              className={`card-title mb-1 ${
                                isItemPacked ? "text-white" : "text-dark"
                              }`}
                            >
                              {selectedItem.categoryName}
                            </h6>
                            <div className="mt-2">
                              {isItemPacked ? (
                                <Badge bg="light" text="dark">
                                  Packed
                                </Badge>
                              ) : (
                                <Badge bg="warning" text="dark">
                                  Click to Pack
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default PackerOrders;

// "use client";

// import { useState, useMemo, useRef, useEffect } from "react";
// import useSWR, { mutate as globalMutate } from "swr";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Badge,
//   Form,
//   Button,
//   Alert,
//   Spinner,
//   Modal,
// } from "react-bootstrap";
// import {
//   FaCheckCircle,
//   FaBox,
//   FaTable,
//   FaListAlt,
//   FaMotorcycle,
// } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import axios from "axios";

// // Constants
// const API_BASE_URL = "https://dd-backend-3nm0.onrender.com/api";
// const ADMIN_ORDERS_URL = `${API_BASE_URL}/admin/getPackerOrders2`;
// const PACKING_GROUPED_URL = `${API_BASE_URL}/packer/packing/today/grouped`;
// const HUBS_API_URL = `${API_BASE_URL}/Hub/hubs`;
// const RIDERS_API_URL = `${API_BASE_URL}/admin/riders`;
// const SWR_KEY = "packer:combined";
// const LOCAL_CACHE_KEY = "packer:combined:cache:v1";
// const CACHE_TTL_MS = 5 * 60 * 1000;

// function getUserRole() {
//   if (typeof window === "undefined") return null;

//   const isAdmin = localStorage.getItem("admin");
//   if (isAdmin === "Admin Login Successfully") {
//     return "admin";
//   }

//   const packerData = localStorage.getItem("packer");
//   if (packerData) {
//     try {
//       const packer = JSON.parse(packerData);
//       return "packer";
//     } catch {
//       return null;
//     }
//   }

//   return null;
// }

// function getPackerData() {
//   if (typeof window === "undefined") return null;

//   const packerData = localStorage.getItem("packer");
//   if (packerData) {
//     try {
//       return JSON.parse(packerData);
//     } catch {
//       return null;
//     }
//   }

//   return null;
// }

// function readLocalCache() {
//   try {
//     const raw = localStorage.getItem(LOCAL_CACHE_KEY);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     if (!parsed || !parsed.data || !parsed.ts) return null;
//     if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
//     return parsed.data;
//   } catch {}
//   return null;
// }

// function writeLocalCache(data) {
//   try {
//     localStorage.setItem(
//       LOCAL_CACHE_KEY,
//       JSON.stringify({ data, ts: Date.now() }),
//     );
//   } catch {}
// }

// function isAbortError(err) {
//   return err?.name === "AbortError" || /aborted/i.test(err?.message || "");
// }

// async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeoutMs);
//   try {
//     const res = await fetch(url, {
//       cache: "no-store",
//       ...opts,
//       signal: controller.signal,
//     });
//     if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
//     const ct = res.headers.get("content-type") || "";
//     if (!ct.includes("application/json")) {
//       const text = await res.text();
//       throw new Error(`Non-JSON for ${url}: ${text.slice(0, 120)}...`);
//     }
//     const json = await res.json();
//     return json;
//   } catch (err) {
//     if (isAbortError(err)) {
//       throw new Error(`Request timed out after ${timeoutMs}ms`);
//     }
//     throw err;
//   } finally {
//     clearTimeout(id);
//   }
// }

// function withBust(url) {
//   const sep = url.includes("?") ? "&" : "?";
//   return `${url}${sep}ts=${Date.now()}`;
// }

// async function fetchCombined() {
//   const cached = readLocalCache();

//   let adminData = null;
//   try {
//     adminData = await fetchWithTimeout(ADMIN_ORDERS_URL, {}, 5000);
//   } catch (e) {
//     console.log("[v4] getPackerOrders2 skipped/failed:", e.message);
//   }

//   let groupedJson = null;
//   for (let attempt = 0; attempt < 3; attempt++) {
//     try {
//       groupedJson = await fetchWithTimeout(
//         withBust(PACKING_GROUPED_URL),
//         {},
//         6000,
//       );
//       break;
//     } catch (e) {
//       if (attempt < 2) {
//         await new Promise((r) => setTimeout(r, 500));
//         continue;
//       }
//       console.log("[v4] grouped fetch failed:", e.message);
//     }
//   }

//   let groupedData = [];
//   if (
//     Array.isArray(groupedJson?.data?.groupedData) &&
//     groupedJson.data.groupedData.length > 0
//   ) {
//     groupedData = groupedJson.data.groupedData;
//   } else if (Array.isArray(groupedJson?.groupedData)) {
//     groupedData = groupedJson.groupedData;
//   } else if (
//     cached &&
//     Array.isArray(cached.groupedData) &&
//     cached.groupedData.length > 0
//   ) {
//     groupedData = cached.groupedData;
//   }

//   if (!Array.isArray(groupedData)) groupedData = [];

//   const combined = {
//     adminResult: adminData,
//     groupedData,
//     __fromCache: !(
//       Array.isArray(groupedJson?.groupedData) &&
//       groupedJson.groupedData.length > 0
//     ),
//   };

//   writeLocalCache(combined);
//   return combined;
// }

// function usePackingData() {
//   const fallbackData = typeof window !== "undefined" ? readLocalCache() : null;

//   const {
//     data,
//     error,
//     isValidating,
//     mutate: swrMutate,
//   } = useSWR(SWR_KEY, fetchCombined, {
//     fallbackData,
//     revalidateOnFocus: true,
//     revalidateOnReconnect: true,
//     revalidateOnMount: true,
//     revalidateIfStale: true,
//     dedupingInterval: 2000,
//     refreshInterval: 0,
//     refreshWhenHidden: true,
//     errorRetryCount: 1,
//     errorRetryInterval: 3000,
//     shouldRetryOnError: (err) => {
//       if (isAbortError(err)) return false;
//       return true;
//     },
//   });

//   return {
//     data,
//     error,
//     isValidating,
//     refresh: () => swrMutate(),
//     mutate: swrMutate,
//   };
// }

// function useHubs() {
//   const { data, error, isValidating } = useSWR(
//     HUBS_API_URL,
//     async (url) => {
//       try {
//         const res = await fetchWithTimeout(url, {}, 8000);
//         return Array.isArray(res) ? res : [];
//       } catch (err) {
//         console.log("[v4] hubs fetch failed:", err.message);
//         return [];
//       }
//     },
//     {
//       revalidateOnFocus: false,
//       revalidateOnReconnect: false,
//       dedupingInterval: 60000,
//     },
//   );

//   return {
//     hubs: data || [],
//     hubsLoading: isValidating,
//     hubsError: error,
//   };
// }

// function useRiders() {
//   const [riders, setRiders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchRiders = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(RIDERS_API_URL);
//       // console.log("Riders API response:", response.data);
//       if (response.data && response.data.riders) {
//         const activeRiders = response.data.riders.filter(
//           (rider) => rider.status === "active",
//         );
//         setRiders(activeRiders);
//         // console.log("Active riders set:", activeRiders);
//       }
//     } catch (err) {
//       console.error("Error fetching riders:", err);
//       setError(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRiders();
//   }, []);

//   return {
//     riders,
//     ridersLoading: loading,
//     ridersError: error,
//     refreshRiders: fetchRiders,
//   };
// }

// function getPackerHubName(packerHubIds, allHubs) {
//   if (!Array.isArray(packerHubIds) || !Array.isArray(allHubs)) return null;
//   const matchedHub = allHubs.find((hub) => packerHubIds.includes(hub.hubId));
//   return matchedHub ? matchedHub.hubName : null;
// }

// // Available filters - hubs, sessions, riders
// function useAvailableFilters(
//   groupedData,
//   userRole,
//   packerData,
//   allHubs,
//   packerHubName,
//   allRiders,
// ) {
//   return useMemo(() => {
//     if (!Array.isArray(groupedData)) {
//       return { hubs: [], sessions: [], riders: [] };
//     }

//     const hubs = [
//       ...new Set(groupedData.map((item) => item.hubName).filter(Boolean)),
//     ];

//     const sessions = [
//       ...new Set(groupedData.map((item) => item.session).filter(Boolean)),
//     ];

//     const riderNamesFromOrders = [
//       ...new Set(
//         groupedData.flatMap((item) =>
//           Array.isArray(item.orders)
//             ? item.orders
//                 .map((order) => order?.riderName || order?.assignedRider)
//                 .filter(Boolean)
//             : [],
//         ),
//       ),
//     ];

//     const activeRiderNames = allRiders.map(
//       (rider) => rider.name || rider.riderName || rider.username,
//     );
//     const allRiderNames = [
//       ...new Set([...riderNamesFromOrders, ...activeRiderNames]),
//     ].sort();

//     return { hubs, sessions, riders: allRiderNames };
//   }, [groupedData, allRiders]);
// }

// // Summary calculation with hub, session, and rider filters - FIXED HUB FILTER
// function useSummary(packingData, filters, userRole, packerHubName) {
//   return useMemo(() => {
//     if (!Array.isArray(packingData))
//       return {
//         totalGroups: 0,
//         totalOrdered: 0,
//         totalPacked: 0,
//         remainingItems: 0,
//         fullyPackedGroups: 0,
//         partiallyPackedGroups: 0,
//         notPackedGroups: 0,
//       };

//     let filtered = packingData;

//     // FIXED: Hub filter - check if filters.hub exists and is not "all"
//     if (filters.hub && filters.hub !== "all") {
//       filtered = filtered.filter((item) => item.hubName === filters.hub);
//     }

//     // For packers, also filter by their hub if set
//     if (userRole === "packer" && packerHubName) {
//       filtered = filtered.filter((item) => item.hubName === packerHubName);
//     }

//     // Filter by session
//     if (filters.session && filters.session !== "all") {
//       filtered = filtered.filter((item) => item.session === filters.session);
//     }

//     // Filter by rider
//     if (filters.rider && filters.rider !== "all") {
//       filtered = filtered.filter(
//         (item) =>
//           Array.isArray(item.orders) &&
//           item.orders.some(
//             (order) =>
//               order?.riderName === filters.rider ||
//               order?.assignedRider === filters.rider,
//           ),
//       );
//     }

//     const totalOrdered = filtered.reduce(
//       (sum, it) => sum + (Number(it.totalOrdered) || 0),
//       0,
//     );
//     const totalPacked = filtered.reduce(
//       (sum, it) => sum + (Number(it.packed) || 0),
//       0,
//     );

//     return {
//       totalGroups: filtered.length,
//       totalOrdered,
//       totalPacked,
//       remainingItems: Math.max(0, totalOrdered - totalPacked),
//       fullyPackedGroups: filtered.filter((it) => it.isFullyPacked).length,
//       partiallyPackedGroups: filtered.filter(
//         (it) => it.isPacked && !it.isFullyPacked,
//       ).length,
//       notPackedGroups: filtered.filter((it) => !it.isPacked).length,
//     };
//   }, [packingData, filters, userRole, packerHubName]);
// }

// // Grouped items - GROUP BY ITEM NAME ONLY
// function useGroupedItems(packingData, filters, userRole, packerHubName) {
//   return useMemo(() => {
//     if (!Array.isArray(packingData)) return [];

//     const groupedMap = new Map();

//     // First filter the data
//     let filteredData = [...packingData];

//     // Apply hub filter
//     if (filters.hub && filters.hub !== "all") {
//       filteredData = filteredData.filter(
//         (item) => item.hubName === filters.hub,
//       );
//     }

//     if (userRole === "packer" && packerHubName) {
//       filteredData = filteredData.filter(
//         (item) => item.hubName === packerHubName,
//       );
//     }

//     if (filters.session && filters.session !== "all") {
//       filteredData = filteredData.filter(
//         (item) => item.session === filters.session,
//       );
//     }

//     console.log("Filtered data for grouping:", filteredData.length);

//     // Group by ITEM NAME only
//     for (const item of filteredData) {
//       if (!item || typeof item !== "object") continue;

//       // Create grouping key - ONLY by item name
//       const key = `${item.name}`;

//       if (!groupedMap.has(key)) {
//         groupedMap.set(key, {
//           name: item.name || "Unknown Item",
//           itemName: item.name || "Unknown Item",
//           category: item.category || "Unknown Category",
//           categoryName: item.categoryName || "Unknown Category Name",
//           unit: item.unit || "unit",
//           hubs: new Set(),
//           totalOrdered: 0,
//           totalPacked: 0,
//           sessions: new Map(),
//           riders: new Set(),
//           isPacked: false,
//           isFullyPacked: false,
//         });
//       }

//       const group = groupedMap.get(key);

//       // Each item in packingData represents ONE grouped item that might contain multiple individual items
//       // The totalOrdered field should be the count of individual items for this group
//       const itemOrdered = Number(item.totalOrdered) || 0;
//       const itemPacked = Number(item.packed) || 0;

//       // Add to totals
//       group.totalOrdered += itemOrdered;
//       group.totalPacked += itemPacked;

//       // Add hub to hubs set
//       if (item.hubName) {
//         group.hubs.add(item.hubName);
//       }

//       // Group by session
//       const sessionName = item.session || "Unknown Session";

//       if (!group.sessions.has(sessionName)) {
//         group.sessions.set(sessionName, {
//           session: sessionName,
//           ordered: itemOrdered,
//           packed: itemPacked,
//           remaining: Math.max(0, itemOrdered - itemPacked),
//           isFullyPacked: itemPacked === itemOrdered && itemOrdered > 0,
//           isPacked: itemPacked > 0,
//         });
//       } else {
//         const s = group.sessions.get(sessionName);
//         s.ordered += itemOrdered;
//         s.packed += itemPacked;
//         s.remaining = Math.max(0, s.ordered - s.packed);
//         s.isPacked = s.packed > 0;
//         s.isFullyPacked = s.packed === s.ordered && s.ordered > 0;
//       }

//       // Collect riders from orders
//       if (Array.isArray(item.orders)) {
//         item.orders.forEach((order) => {
//           const rider = order?.riderName || order?.assignedRider;
//           if (rider) {
//             group.riders.add(rider);
//           }
//         });
//       }

//       group.isPacked = group.totalPacked > 0;
//       group.isFullyPacked = group.totalPacked === group.totalOrdered && group.totalOrdered > 0;
//     }

//     // Convert Map to Array and sort by ITEM NAME
//     const result = Array.from(groupedMap.values())
//       .map((g) => ({
//         ...g,
//         hubs: Array.from(g.hubs),
//         sessions: Array.from(g.sessions.values()),
//         riders: Array.from(g.riders),
//         totalOrdered: Number(g.totalOrdered) || 0,
//         totalPacked: Number(g.totalPacked) || 0,
//         remaining: Math.max(
//           0,
//           (Number(g.totalOrdered) || 0) - (Number(g.totalPacked) || 0),
//         ),
//       }))
//       .sort((a, b) => {
//         const nameA = (a.itemName || a.name || "").toLowerCase();
//         const nameB = (b.itemName || b.name || "").toLowerCase();
//         return nameA.localeCompare(nameB);
//       });

//     console.log("Grouped items result:", result.map(r => ({
//       name: r.name,
//       ordered: r.totalOrdered,
//       packed: r.totalPacked,
//       remaining: r.remaining
//     })));

//     return result;
//   }, [packingData, filters, userRole, packerHubName]);
// }

// const PackerOrders = () => {
//   const [userRole, setUserRole] = useState(null);
//   const [packerData, setPackerData] = useState(null);
//   const { hubs: allHubs } = useHubs();
//   const { riders: allRiders, ridersLoading, refreshRiders } = useRiders();
//   const [packerHubName, setPackerHubName] = useState(null);

//   const [filters, setFilters] = useState(() => {
//     try {
//       const raw = sessionStorage.getItem("packer:filters:grouped");
//       return raw
//         ? JSON.parse(raw)
//         : {
//             hub: "all",
//             session: "all",
//             rider: "all",
//           };
//     } catch {
//       return {
//         hub: "all",
//         session: "all",
//         rider: "all",
//       };
//     }
//   });

//   useEffect(() => {
//     try {
//       sessionStorage.setItem("packer:filters:grouped", JSON.stringify(filters));
//     } catch {}
//   }, [filters]);

//   useEffect(() => {
//     const role = getUserRole();
//     setUserRole(role);

//     if (role === "packer") {
//       const pData = getPackerData();
//       setPackerData(pData);
//     }
//   }, []);

//   useEffect(() => {
//     if (
//       userRole === "packer" &&
//       packerData?.hubs &&
//       Array.isArray(allHubs) &&
//       allHubs.length > 0
//     ) {
//       const hubName = getPackerHubName(packerData.hubs, allHubs);
//       if (hubName) {
//         setPackerHubName(hubName);
//         setFilters((prev) => ({
//           ...prev,
//           hub: hubName,
//         }));
//       }
//     }
//   }, [userRole, packerData, allHubs]);

//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showSessionModal, setShowSessionModal] = useState(false);
//   const [selectedItemForSession, setSelectedItemForSession] = useState(null);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [lastRefreshed, setLastRefreshed] = useState(null);
//   const lastGoodDataRef = useRef(null);

//   const { data, error, isValidating, refresh, mutate } = usePackingData();
//   const packingData = data?.groupedData || [];

//   useEffect(() => {
//     if (Array.isArray(packingData) && packingData.length > 0) {
//       lastGoodDataRef.current = packingData;
//     }
//   }, [packingData]);

//   const availableFilters = useAvailableFilters(
//     packingData,
//     userRole,
//     packerData,
//     allHubs,
//     packerHubName,
//     allRiders,
//   );

//   const summary = useSummary(packingData, filters, userRole, packerHubName);

//   const groupedItems = useGroupedItems(
//     packingData,
//     filters,
//     userRole,
//     packerHubName,
//   );

//   const loading =
//     (!data && !error && !lastGoodDataRef.current) || ridersLoading;

//   const handleFilterChange = (filterType, value) => {
//     setFilters((prev) => ({ ...prev, [filterType]: value }));
//   };

//   const handleRefresh = async () => {
//     console.log("[grouped] manual refresh requested");
//     await Promise.all([mutate(), refreshRiders()]);
//     setLastRefreshed(new Date());
//   };

//   const handlePackedClick = (item) => {
//     setSelectedItemForSession(item);
//     setShowSessionModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setIsUpdating(false);
//   };

//   const handleCloseSessionModal = () => {
//     setShowSessionModal(false);
//     setIsUpdating(false);
//   };

//   const handleSessionSelect = async (session) => {
//     setShowSessionModal(false);
//     try {
//       // We need to get items for this item across all hubs
//       // Since items are now grouped by name, we need to fetch for the selected hub filter
//       const hubToFetch =
//         filters.hub !== "all" ? filters.hub : selectedItemForSession.hubs[0];

//       const url = `${API_BASE_URL}/packer/packing/today/individual?name=${encodeURIComponent(
//         selectedItemForSession.name,
//       )}&hubName=${hubToFetch}&session=${session}`;

//       const res = await fetchWithTimeout(url, {}, 8000);
//       if (res?.success && Array.isArray(res?.data)) {
//         const individualItems = res.data;
//         const packedCount = individualItems.filter((it) => it.isPacked).length;
//         const totalCount = individualItems.length;

//         setSelectedItem({
//           ...selectedItemForSession,
//           session,
//           hubName: hubToFetch,
//           individualItems,
//           totalOrdered: totalCount,
//           packed: packedCount,
//           isPacked: packedCount > 0,
//           isFullyPacked: packedCount === totalCount,
//         });
//         setShowModal(true);
//       } else {
//         alert("No individual items found for this session");
//       }
//     } catch (err) {
//       console.log("[grouped] individual items fetch failed:", err.message);
//       alert("Error fetching individual items: " + err.message);
//     }
//   };

//   useEffect(() => {
//   if (!showModal && !showSessionModal) {
//     // Refresh data when modals are closed
//     mutate();
//   }
// }, [showModal, showSessionModal, mutate]);

// const updateIndividualPackingStatus = async (individualItemId, isPacked) => {
//   if (!selectedItem || !selectedItemForSession) return;
//   setIsUpdating(true);

//   // Optimistic update for the modal
//   setSelectedItem((prev) => {
//     if (!prev) return prev;
//     const updatedIndividualItems = (prev.individualItems || []).map((it) =>
//       it._id === individualItemId ? { ...it, isPacked } : it
//     );

//     const packedCount = updatedIndividualItems.filter((x) => x.isPacked).length;
//     const totalCount = updatedIndividualItems.length;

//     return {
//       ...prev,
//       individualItems: updatedIndividualItems,
//       packed: packedCount,
//       isPacked: packedCount > 0,
//       isFullyPacked: packedCount === totalCount,
//     };
//   });

//   // Optimistic update for the main data
//   await globalMutate(
//     SWR_KEY,
//     (current) => {
//       if (!current) return current;

//       const newGroupedData = (current.groupedData || []).map((item) => {
//         // Check if this is the item we're updating
//         const matches =
//           item.name === selectedItemForSession.name &&
//           item.session === selectedItem.session &&
//           item.hubName === selectedItem.hubName;

//         if (!matches) return item;

//         // Calculate new packed count for this specific item/session/hub combination
//         const currentPacked = Number(item.packed) || 0;
//         const newPacked = isPacked ? currentPacked + 1 : currentPacked - 1;
//         const ordered = Number(item.totalOrdered) || 0;

//         return {
//           ...item,
//           packed: Math.max(0, newPacked),
//           isPacked: newPacked > 0,
//           isFullyPacked: newPacked === ordered,
//         };
//       });

//       // Also update the grouped items by name
//       // This ensures the main table shows correct counts
//       const groupedByName = new Map();
//       newGroupedData.forEach((item) => {
//         const key = item.name;
//         if (!groupedByName.has(key)) {
//           groupedByName.set(key, {
//             ...item,
//             sessions: [],
//             totalOrdered: 0,
//             totalPacked: 0,
//           });
//         }
//         const group = groupedByName.get(key);
//         group.totalOrdered += Number(item.totalOrdered) || 0;
//         group.totalPacked += Number(item.packed) || 0;

//         // Update session info
//         const sessionIndex = group.sessions.findIndex(
//           (s) => s.session === item.session
//         );
//         if (sessionIndex >= 0) {
//           group.sessions[sessionIndex] = {
//             ...group.sessions[sessionIndex],
//             packed: Number(item.packed) || 0,
//             remaining: Math.max(0, (Number(item.totalOrdered) || 0) - (Number(item.packed) || 0)),
//             isPacked: (Number(item.packed) || 0) > 0,
//             isFullyPacked: (Number(item.packed) || 0) === (Number(item.totalOrdered) || 0),
//           };
//         }
//       });

//       return {
//         ...current,
//         groupedData: newGroupedData,
//       };
//     },
//     false
//   );

//   try {
//     // Make API call
//     const res = await fetch(
//       `${API_BASE_URL}/packer/packing/update-individual-packed`,
//       {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ packingId: individualItemId, isPacked }),
//       }
//     );

//     const json = await res.json();
//     if (!json?.success) {
//       throw new Error(json?.message || "Failed to update packing status");
//     }

//     // Refresh data after successful update
//     await mutate();
//   } catch (err) {
//     console.log("[grouped] update failed:", err.message);
//     // Revert optimistic update on error
//     await globalMutate(SWR_KEY, undefined, true);
//     alert("Update failed: " + err.message);
//   } finally {
//     setIsUpdating(false);
//   }
// };

//   useEffect(() => {
//     if (data && Array.isArray(data.groupedData) && !isValidating) {
//       setLastRefreshed(new Date());
//     }
//   }, [data, isValidating]);

//   useEffect(() => {
//     const onFocus = () => {
//       console.log("[grouped] focus/visible -> revalidate");
//       mutate().then(() => setLastRefreshed(new Date()));
//     };
//     const onVisibility = () => {
//       if (document.visibilityState === "visible") onFocus();
//     };
//     window.addEventListener("focus", onFocus);
//     document.addEventListener("visibilitychange", onVisibility);
//     return () => {
//       window.removeEventListener("focus", onFocus);
//       document.removeEventListener("visibilitychange", onVisibility);
//     };
//   }, [mutate]);

//   useEffect(() => {
//     const id = setInterval(() => {
//       mutate().then(() => setLastRefreshed(new Date()));
//     }, 20000);
//     return () => clearInterval(id);
//   }, [mutate]);

//   return (
//     <Container fluid className="py-4">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <h2 className="text-black mb-1">Item Packer</h2>
//               <p className="text-muted mb-0">
//                 Manage and track order packing progress
//                 {lastRefreshed && (
//                   <span className="text-success fw-bold ms-2">
//                     Last refreshed: {lastRefreshed.toLocaleTimeString()}
//                   </span>
//                 )}
//                 {isValidating && (
//                   <span className="text-warning fw-bold ms-2">
//                     <Spinner
//                       animation="border"
//                       size="sm"
//                       className="me-2"
//                       style={{ width: "1rem", height: "1rem" }}
//                     />
//                     <Spinner
//                       animation="border"
//                       size="sm"
//                       style={{ width: "1rem", height: "1rem" }}
//                     />
//                   </span>
//                 )}
//               </p>
//             </div>
//             <div className="d-flex gap-2">
//               <Link to="/packer-dashboard">
//                 <button
//                   className="btn packer-toggle-btn"
//                   style={{
//                     backgroundColor: "#6c757d",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   <FaTable className="me-2" /> View Orders
//                 </button>
//               </Link>
//               <button
//                 className="btn packer-toggle-btn"
//                 style={{
//                   backgroundColor: "#6B8E23",
//                   color: "white",
//                   fontWeight: "bold",
//                 }}
//                 onClick={handleRefresh}
//                 disabled={isValidating || ridersLoading}
//               >
//                 <FaListAlt className="me-2" /> Refresh
//               </button>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {/* Summary Cards */}
//      {!loading && (
//   <Row className="mb-4">
//     <Col md={4}>
//       <Card className="text-center" style={{ backgroundColor: "#aeaeae" }}>
//         <Card.Body>
//           <Card.Title className="text-black fs-2 fw-bold">
//             {data?.data?.summary?.totalItems || summary.totalOrdered || 0}
//           </Card.Title>
//           <Card.Text className="text-black">Total Items</Card.Text>
//         </Card.Body>
//       </Card>
//     </Col>
//     <Col md={4}>
//       <Card className="text-center" style={{ backgroundColor: "#6B8E23" }}>
//         <Card.Body>
//           <Card.Title className="text-white fs-2 fw-bold">
//             {data?.data?.summary?.totalPacked || summary.totalPacked || 0}
//           </Card.Title>
//           <Card.Text className="text-white">Packed Items</Card.Text>
//         </Card.Body>
//       </Card>
//     </Col>
//     <Col md={4}>
//       <Card className="text-center" style={{ backgroundColor: "#FFD700" }}>
//         <Card.Body>
//           <Card.Title className="text-black fs-2 fw-bold">
//             {(data?.data?.summary?.totalItems || 0) - (data?.data?.summary?.totalPacked || 0) || summary.remainingItems || 0}
//           </Card.Title>
//           <Card.Text className="text-black">Remaining Items</Card.Text>
//         </Card.Body>
//       </Card>
//     </Col>
//   </Row>
// )}

//       {/* Filters - Hub, Session, and Rider */}
//       <Card className="mb-4" style={{ backgroundColor: "#fff8dc" }}>
//         <Card.Body>
//           <Row>
//             {/* Hub Filter */}
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>
//                   <strong>Hub</strong>
//                 </Form.Label>
//                 <Form.Select
//                   value={filters.hub}
//                   onChange={(e) => handleFilterChange("hub", e.target.value)}
//                   disabled={userRole === "packer"}
//                 >
//                   <option value="all">All Hubs</option>
//                   {availableFilters.hubs.map((hub) => (
//                     <option key={hub} value={hub}>
//                       {hub}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {userRole === "packer" && packerHubName && (
//                   <Form.Text className="text-muted">
//                     Auto-set to your hub: {packerHubName}
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>

//             {/* Session Filter */}
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>
//                   <strong>Session</strong>
//                 </Form.Label>
//                 <Form.Select
//                   value={filters.session}
//                   onChange={(e) =>
//                     handleFilterChange("session", e.target.value)
//                   }
//                 >
//                   <option value="all">All Sessions</option>
//                   {availableFilters.sessions.map((session) => (
//                     <option key={session} value={session}>
//                       {session}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//             </Col>

//             {/* Rider Filter */}
//             {/* <Col md={4}>
//               <Form.Group>
//                 <Form.Label>
//                   <strong>
//                     <FaMotorcycle className="me-1" /> Rider
//                   </strong>
//                 </Form.Label>
//                 <Form.Select
//                   value={filters.rider}
//                   onChange={(e) => handleFilterChange("rider", e.target.value)}
//                 >
//                   <option value="all">All Riders</option>
//                   {availableFilters.riders.map((rider) => (
//                     <option key={rider} value={rider}>
//                       {rider}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//             </Col> */}

//             {/* Active Filters Summary */}
//             <Col md={12} className="mt-3">
//               <div className="text-muted small bg-light p-2 rounded">
//                 <div className="d-flex flex-wrap gap-3">
//                   <div>
//                     <strong>Hub:</strong>{" "}
//                     {filters.hub === "all" ? "All Hubs" : filters.hub}
//                   </div>
//                   <div>
//                     <strong>Session:</strong>{" "}
//                     {filters.session === "all"
//                       ? "All Sessions"
//                       : filters.session}
//                   </div>
//                   {/* <div>
//                     <strong>Rider:</strong>{" "}
//                     {filters.rider === "all" ? "All Riders" : filters.rider}
//                   </div> */}
//                 </div>
//               </div>
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       {error && (
//         <Alert variant="danger" className="mb-4">
//           <Alert.Heading>Error Loading Data</Alert.Heading>
//           <div className="mb-1">{error.message || "Failed to fetch data."}</div>
//           {data?.__fromCache && (
//             <small className="text-muted">
//               Showing cached data. We'll refresh in the background when the
//               network is available.
//             </small>
//           )}
//         </Alert>
//       )}

//       {loading && (
//         <div className="text-center py-5">
//           <Spinner animation="border" variant="primary" />
//           <p className="mt-2">Loading packing data...</p>
//         </div>
//       )}

//       {!loading && groupedItems.length > 0 && (
//         <Card>
//           <Card.Header className="d-flex justify-content-between align-items-center">
//             <h5 className="mb-0">Packing Summary - Grouped by Item Name</h5>
//             <div>
//               <Badge bg="primary" className="me-2">
//                 {groupedItems.length} unique items
//               </Badge>
//               {filters.hub !== "all" && (
//                 <Badge bg="secondary" className="me-2">
//                   Hub: {filters.hub}
//                 </Badge>
//               )}
//               {/* {filters.rider !== "all" && (
//                 <Badge bg="info">
//                   <FaMotorcycle className="me-1" />
//                   {filters.rider}
//                 </Badge>
//               )} */}
//             </div>
//           </Card.Header>
//           <Card.Body className="p-0">
//             <div className="packer-table-responsive shadow-lg rounded">
//               <table className="table table-hover">
//                 <thead style={{ backgroundColor: "#6B8E23", color: "white" }}>
//                   <tr>
//                     <th>Item Name</th> {/* Changed from Category to Item Name */}
//                     <th>Category</th> {/* Added Category column */}
//                     {/* <th>Available Hubs</th> */}
//                     <th>Available Sessions</th>
//                     {/* <th>Assigned Riders</th> */}
//                     <th>Total Ordered</th>
//                     <th>Total Packed</th>
//                     <th>Yet to Pack</th>
//                     <th>Pack Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {groupedItems.map((item, index) => {
//                     // console.log(groupedItems,"................groupitems")
//                     const totalOrdered = Number(item.totalOrdered) || 0;
//                     const totalPacked = Number(item.totalPacked) || 0;
//                     const remainingQuantity = Math.max(
//                       0,
//                       totalOrdered - totalPacked,
//                     );
//                     const isFullyPacked = remainingQuantity === 0;
//                     const isPartiallyPacked = totalPacked > 0 && !isFullyPacked;

//                     return (
//                       <tr key={`${item.name}-${index}`}>
//                         <td>
//                           <strong className="d-block" style={{ fontSize: "16px" }}>
//                             {item.itemName || item.name}
//                           </strong>
//                           <small className="text-muted">
//                             {item.unit}
//                           </small>
//                         </td>
//                         <td>
//                           <span
//                             className={`d-inline-block rounded-circle me-2 ${
//                               item.category &&
//                               item.category.toLowerCase() === "veg"
//                                 ? "bg-success"
//                                 : "bg-danger"
//                             }`}
//                             style={{ width: "10px", height: "10px" }}
//                           ></span>
//                           {item.categoryName}
//                         </td>
//                         {/* <td>
//                           <div className="d-flex flex-wrap gap-1">
//                             {item.hubs.map((hub, idx) => (
//                               <Badge key={idx} bg="secondary">
//                                 {hub}
//                               </Badge>
//                             ))}
//                           </div>
//                         </td> */}
//                         <td>
//                           <div className="d-flex flex-wrap gap-1">
//                             {item.sessions.map((sessionInfo, idx) => (
//                               <Badge
//                                 key={idx}
//                                 bg={
//                                   sessionInfo.isFullyPacked
//                                     ? "success"
//                                     : sessionInfo.isPacked
//                                       ? "warning"
//                                       : "light"
//                                 }
//                                 text={
//                                   sessionInfo.isFullyPacked
//                                     ? "white"
//                                     : sessionInfo.isPacked
//                                       ? "dark"
//                                       : "dark"
//                                 }
//                                 className="p-2"
//                               >
//                                 {sessionInfo.session}:{" "}
//                                 {sessionInfo.remaining || 0} left
//                               </Badge>
//                             ))}
//                           </div>
//                         </td>
//                         {/* <td>
//                           <div className="d-flex flex-wrap gap-1">
//                             {item.riders.map((rider, idx) => (
//                               <Badge
//                                 key={idx}
//                                 bg="info"
//                                 className="d-flex align-items-center gap-1 p-2"
//                               >
//                                 <FaMotorcycle />
//                                 {rider}
//                               </Badge>
//                             ))}
//                             {item.riders.length === 0 && (
//                               <Badge bg="secondary">No Rider</Badge>
//                             )}
//                           </div>
//                         </td> */}
//                         <td>
//                           <span className="badge bg-secondary fs-6">
//                             {totalOrdered}
//                           </span>
//                         </td>
//                         <td>
//                           <span
//                             className={`badge ${
//                               isFullyPacked
//                                 ? "bg-success"
//                                 : isPartiallyPacked
//                                   ? "bg-warning"
//                                   : "bg-danger"
//                             } fs-6`}
//                           >
//                             {totalPacked}
//                           </span>
//                         </td>
//                         <td>
//                           <span className="badge bg-secondary fs-6">
//                             {remainingQuantity}
//                           </span>
//                         </td>
//                         <td>
//                           <Button
//                             size="sm"
//                             variant={
//                               remainingQuantity > 0
//                                 ? "success"
//                                 : "outline-success"
//                             }
//                             onClick={() => handlePackedClick(item)}
//                             disabled={isFullyPacked}
//                           >
//                             {remainingQuantity > 0
//                               ? `Pack Items`
//                               : "All Packed"}
//                           </Button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </Card.Body>
//         </Card>
//       )}

//       {!loading && !error && groupedItems.length === 0 && (
//         <Card>
//           <Card.Body className="text-center py-5">
//             <h5>No packing items found</h5>
//             <p className="text-muted">
//               {Array.isArray(packingData) && packingData.length === 0
//                 ? "There are no packing items for today. Items will appear here when orders are placed."
//                 : "No items match the current filters. Try selecting different hub, session, or rider filters."}
//             </p>
//           </Card.Body>
//         </Card>
//       )}

//       {/* Session Selection Modal */}
//       <Modal
//         show={showSessionModal}
//         onHide={handleCloseSessionModal}
//         size="xl"
//         dialogClassName="modal-dialog-scrollable"
//       >
//         <Modal.Header closeButton className="py-3">
//           <Modal.Title className="h4">Select Delivery Session</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="p-4">
//           {selectedItemForSession && (
//             <div>
//               <h5 className="mb-3">
//                 Packing: <strong>{selectedItemForSession.name}</strong>
//               </h5>
//               <div className="row mb-4">
//                 <div className="col-md-6">
//                   <p className="text-muted mb-1">
//                     <strong>Category:</strong> {selectedItemForSession.categoryName}
//                   </p>
//                   <p className="text-muted mb-1">
//                     <strong>Available Hubs:</strong>
//                   </p>
//                   <div className="d-flex flex-wrap gap-1 mb-2">
//                     {selectedItemForSession.hubs?.map((hub, idx) => (
//                       <Badge key={idx} bg="secondary">
//                         {hub}
//                       </Badge>
//                     ))}
//                   </div>
//                   <p className="text-muted mb-1">
//                     <strong>Total Ordered:</strong>{" "}
//                     {selectedItemForSession.totalOrdered || 0}
//                   </p>
//                   <p className="text-muted mb-1">
//                     <strong>Total Packed:</strong>{" "}
//                     {selectedItemForSession.totalPacked || 0}
//                   </p>
//                 </div>
//                 <div className="col-md-6">
//                   {/* <p className="text-muted mb-1">
//                     <strong>Assigned Riders:</strong>
//                   </p> */}
//                   <div className="d-flex flex-wrap gap-1">
//                     {selectedItemForSession.riders?.map((rider, idx) => (
//                       <Badge key={idx} bg="info" className="p-2">
//                         <FaMotorcycle className="me-1" />
//                         {rider}
//                       </Badge>
//                     )) || "None"}
//                   </div>
//                   <p className="text-muted mt-2 mb-1">
//                     <strong>Currently filtering by hub:</strong>{" "}
//                     {filters.hub !== "all" ? filters.hub : "All Hubs"}
//                   </p>
//                 </div>
//               </div>

//               <div className="row g-4">
//                 {selectedItemForSession.sessions.map((sessionInfo, index) => (
//                   <div key={index} className="col-lg-6 col-md-12">
//                     <Card
//                       className={`h-100 cursor-pointer ${
//                         sessionInfo.isFullyPacked
//                           ? "border-success bg-light"
//                           : "border-primary"
//                       }`}
//                       style={{
//                         cursor: sessionInfo.isFullyPacked
//                           ? "default"
//                           : "pointer",
//                         opacity: sessionInfo.isFullyPacked ? 0.8 : 1,
//                         transition: "all 0.2s",
//                       }}
//                       onClick={() =>
//                         !sessionInfo.isFullyPacked &&
//                         handleSessionSelect(sessionInfo.session)
//                       }
//                     >
//                       <Card.Body className="text-center p-4">
//                         <h5 className="mb-3 text-primary">
//                           {sessionInfo.session}
//                         </h5>
//                         <div className="mt-3">
//                           <div className="mb-2">
//                             <Badge bg="primary" className="fs-6 p-2 w-100">
//                               Ordered: {sessionInfo.ordered || 0}
//                             </Badge>
//                           </div>
//                           <div className="mb-2">
//                             <Badge
//                               bg={
//                                 (sessionInfo.packed || 0) > 0
//                                   ? "success"
//                                   : "secondary"
//                               }
//                               className="fs-6 p-2 w-100"
//                             >
//                               Packed: {sessionInfo.packed || 0}
//                             </Badge>
//                           </div>
//                           <div className="mb-2">
//                             <Badge
//                               bg={
//                                 (sessionInfo.remaining || 0) > 0
//                                   ? "warning"
//                                   : "success"
//                               }
//                               className="fs-6 p-2 w-100"
//                             >
//                               {(sessionInfo.remaining || 0) > 0
//                                 ? `${sessionInfo.remaining} to pack`
//                                 : "All packed"}
//                             </Badge>
//                           </div>
//                         </div>
//                         {sessionInfo.isFullyPacked && (
//                           <div className="mt-3">
//                             <FaCheckCircle className="text-success fs-5" />
//                             <span className="text-success ms-2 fw-bold">
//                               Fully Packed
//                             </span>
//                           </div>
//                         )}
//                       </Card.Body>
//                     </Card>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* Individual Packing Modal */}
//       {showModal && selectedItem && (
//         <div
//           className="modal fade show d-block"
//           tabIndex="-1"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog modal-xl modal-dialog-scrollable" style={{ maxWidth: "90%" }}>
//             <div className="modal-content">
//               <div className="modal-header py-3">
//                 <div>
//                   <h4 className="modal-title">Packing: {selectedItem.name}</h4>
//                   <div className="text-muted mt-2">
//                     <Badge bg="secondary" className="me-2">
//                       {selectedItem.unit}
//                     </Badge>
//                     <Badge
//                       bg={
//                         selectedItem.category &&
//                         selectedItem.category.toLowerCase() === "veg"
//                           ? "success"
//                           : "danger"
//                       }
//                       className="me-2"
//                     >
//                       {selectedItem.categoryName}
//                     </Badge>
//                     <Badge bg="info" className="me-2">
//                       {selectedItem.hubName}
//                     </Badge>
//                     <Badge bg="primary">{selectedItem.session}</Badge>
//                   </div>
//                   <div className="mt-2">
//                     <FaMotorcycle className="me-1 text-info" />
//                     <span className="text-muted">
//                       Riders: {selectedItem.riders?.join(", ") || "None"}
//                     </span>
//                   </div>
//                 </div>
//                 <button
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                 ></button>
//               </div>

//               <div className="modal-body p-4">
//                 <div className="row mb-4">
//                   <div className="col-4">
//                     <div className="card bg-light">
//                       <div className="card-body text-center">
//                         <h6 className="text-muted mb-2">Total Items</h6>
//                         <h3 className="text-primary mb-0">
//                           {selectedItem.totalOrdered || 0}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-4">
//                     <div className="card bg-light">
//                       <div className="card-body text-center">
//                         <h6 className="text-muted mb-2">Packed</h6>
//                         <h3 className="text-success mb-0">
//                           {selectedItem.packed || 0}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-4">
//                     <div className="card bg-light">
//                       <div className="card-body text-center">
//                         <h6 className="text-muted mb-2">Remaining</h6>
//                         <h3 className="text-warning mb-0">
//                           {Math.max(
//                             0,
//                             (selectedItem.totalOrdered || 0) -
//                               (selectedItem.packed || 0),
//                           )}
//                         </h3>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <h6 className="mb-3">
//                   Individual Items - Click to toggle packing status
//                 </h6>
//                 <div className="row g-3">
//                   {selectedItem.individualItems?.map((individualItem) => (
//                     <div
//                       key={individualItem._id}
//                       className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
//                     >
//                     {/* {console.log(individualItem,"...........individual")} */}

//                       <div
//                         className={`card h-100 cursor-pointer ${
//                           individualItem.isPacked
//                             ? "bg-success text-white"
//                             : "bg-light"
//                         }`}
//                         style={{
//                           transition: "all 0.2s",
//                           cursor: "pointer",
//                           border: individualItem.isPacked
//                             ? "2px solid #28a745"
//                             : "2px solid #ffc107",
//                         }}
//                         onClick={async () => {
//                           await updateIndividualPackingStatus(
//                             individualItem._id,
//                             !individualItem.isPacked,
//                           );
//                         }}
//                       >
//                         <div className="card-body text-center p-3">
//                           <div className="mb-2">
//                             {individualItem.isPacked ? (
//                               <FaCheckCircle className="fs-3" />
//                             ) : (
//                               <FaBox className="fs-3 text-warning" />
//                             )}
//                           </div>
//                           <h6
//                             className={`card-title mb-1 ${
//                               individualItem.isPacked
//                                 ? "text-white"
//                                 : "text-dark"
//                             }`}
//                           >
//                             {selectedItem.categoryName}
//                           </h6>
//                           <div className="mt-2">
//                             {individualItem.isPacked ? (
//                               <Badge bg="light" text="dark">
//                                 Packed
//                               </Badge>
//                             ) : (
//                               <Badge bg="warning" text="dark">
//                                 Click to Pack
//                               </Badge>
//                             )}
//                           </div>
//                           {/* {individualItem.assignedRider && (
//                             <small
//                               className={`d-block mt-2 ${
//                                 individualItem.isPacked
//                                   ? "text-white-50"
//                                   : "text-muted"
//                               }`}
//                             >
//                               <FaMotorcycle className="me-1" />
//                               {individualItem.assignedRider}
//                             </small>
//                           )} */}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button
//                   className="btn btn-secondary"
//                   onClick={handleCloseModal}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default PackerOrders;

// "use client";

// import { useState, useMemo, useRef, useEffect } from "react";
// import useSWR, { mutate as globalMutate } from "swr";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Badge,
//   Form,
//   Button,
//   Alert,
//   Spinner,
//   Modal,
//   Tab,
//   Tabs,
// } from "react-bootstrap";
// import { FaCheckCircle, FaBox, FaTable, FaListAlt } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import axios from "axios";

// // Constants
// const API_BASE_URL = "https://dd-backend-3nm0.onrender.com/api";
// const ADMIN_ORDERS_URL = `${API_BASE_URL}/admin/getPackerOrders2`;
// const PACKING_GROUPED_URL = `${API_BASE_URL}/packer/packing/today/grouped`;
// const HUBS_API_URL = `${API_BASE_URL}/Hub/hubs`;
// const SWR_KEY = "packer:simple";
// const CACHE_TTL_MS = 5 * 60 * 1000;

// // Helper functions
// function getUserRole() {
//   if (typeof window === "undefined") return null;
//   const isAdmin = localStorage.getItem("admin");
//   if (isAdmin === "Admin Login Successfully") return "admin";
//   return localStorage.getItem("packer") ? "packer" : null;
// }

// function getPackerData() {
//   if (typeof window === "undefined") return null;
//   try {
//     return JSON.parse(localStorage.getItem("packer") || "null");
//   } catch {
//     return null;
//   }
// }

// async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeoutMs);
//   try {
//     const res = await fetch(url, {
//       cache: "no-store",
//       ...opts,
//       signal: controller.signal,
//     });
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     return await res.json();
//   } finally {
//     clearTimeout(id);
//   }
// }

// // Custom hooks
// function usePackingData() {
//   const { data, error, isValidating, mutate } = useSWR(
//     SWR_KEY,
//     async () => {
//       try {
//         const grouped = await fetchWithTimeout(PACKING_GROUPED_URL, {}, 6000);
//         return grouped?.data?.groupedData || grouped?.groupedData || [];
//       } catch {
//         return [];
//       }
//     },
//     {
//       revalidateOnFocus: true,
//       revalidateOnReconnect: true,
//       refreshInterval: 30000, // Auto refresh every 30 seconds
//     },
//   );
//   return { data: data || [], error, isValidating, refresh: mutate };
// }

// function useHubs() {
//   const { data } = useSWR(
//     HUBS_API_URL,
//     (url) =>
//       fetchWithTimeout(url, {}, 8000).then((res) =>
//         Array.isArray(res) ? res : [],
//       ),
//     { revalidateOnFocus: false, dedupingInterval: 60000 },
//   );
//   return { hubs: data || [] };
// }

// // Main Component
// const SimplePackerOrders = () => {
//   const [userRole] = useState(getUserRole);
//   const [packerData] = useState(getPackerData);
//   const { hubs } = useHubs();
//   const { data: packingData, error, isValidating, refresh } = usePackingData();

//   const [activeTab, setActiveTab] = useState("items");
//   const [filters, setFilters] = useState({ hub: "all", session: "all" });
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [individualItems, setIndividualItems] = useState([]);

//   // Get packer's hub name
//   const packerHubName = useMemo(() => {
//     if (userRole !== "packer" || !packerData?.hubs || !hubs.length) return null;
//     const hub = hubs.find((h) => packerData.hubs.includes(h.hubId));
//     return hub?.hubName || null;
//   }, [userRole, packerData, hubs]);

//   // Set packer's hub filter
//   useEffect(() => {
//     if (packerHubName) {
//       setFilters((prev) => ({ ...prev, hub: packerHubName }));
//     }
//   }, [packerHubName]);

//   // Get unique filter options
//   const filterOptions = useMemo(() => {
//     const items = Array.isArray(packingData) ? packingData : [];
//     return {
//       hubs: [...new Set(items.map((i) => i.hubName).filter(Boolean))],
//       sessions: [...new Set(items.map((i) => i.session).filter(Boolean))],
//     };
//   }, [packingData]);

//   // Filter data
//   const filteredData = useMemo(() => {
//     let items = Array.isArray(packingData) ? packingData : [];

//     if (filters.hub && filters.hub !== "all") {
//       items = items.filter((i) => i.hubName === filters.hub);
//     }
//     if (filters.session && filters.session !== "all") {
//       items = items.filter((i) => i.session === filters.session);
//     }

//     return items;
//   }, [packingData, filters]);

//   // Group by item name for items view
//   const groupedItems = useMemo(() => {
//     const groups = new Map();

//     filteredData.forEach((item) => {
//       const key = item.name;
//       if (!groups.has(key)) {
//         groups.set(key, {
//           name: item.name,
//           category: item.categoryName || item.category,
//           unit: item.unit || "unit",
//           totalOrdered: 0,
//           totalPacked: 0,
//           hubs: new Set(),
//           sessions: new Set(),
//           remaining: 0,
//         });
//       }
//       const group = groups.get(key);
//       group.totalOrdered += 1;
//       if (item.isPacked) group.totalPacked += 1;
//       if (item.hubName) group.hubs.add(item.hubName);
//       if (item.session) group.sessions.add(item.session);
//     });

//     return Array.from(groups.values())
//       .map((g) => ({
//         ...g,
//         hubs: Array.from(g.hubs),
//         sessions: Array.from(g.sessions),
//         remaining: g.totalOrdered - g.totalPacked,
//         isFullyPacked: g.totalPacked === g.totalOrdered && g.totalOrdered > 0,
//       }))
//       .sort((a, b) => a.name.localeCompare(b.name));
//   }, [filteredData]);

//   // Calculate summary stats
//   const summary = useMemo(() => {
//     const items = filteredData;
//     const totalItems = items.length;
//     const packedItems = items.filter((i) => i.isPacked).length;
//     return {
//       total: totalItems,
//       packed: packedItems,
//       remaining: totalItems - packedItems,
//       groups: groupedItems.length,
//     };
//   }, [filteredData, groupedItems]);

//   // Handle item click to view details
//   const handleItemClick = async (item) => {
//     try {
//       setIsUpdating(true);
//       const hub = filters.hub !== "all" ? filters.hub : item.hubs[0];
//       const session =
//         filters.session !== "all" ? filters.session : item.sessions[0];

//       const res = await fetch(
//         `${API_BASE_URL}/packer/packing/today/individual?name=${encodeURIComponent(item.name)}&hubName=${hub}&session=${session}`,
//       );
//       const data = await res.json();

//       if (data?.success && Array.isArray(data?.data)) {
//         setIndividualItems(data.data);
//         setSelectedItem({
//           ...item,
//           hubName: hub,
//           session: session,
//         });
//         setShowModal(true);
//       }
//     } catch (err) {
//       alert("Error loading items: " + err.message);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // Toggle individual item packing status
//   const toggleItemStatus = async (itemId, currentStatus) => {
//     try {
//       setIsUpdating(true);

//       // Optimistic update
//       setIndividualItems((prev) =>
//         prev.map((i) =>
//           i._id === itemId ? { ...i, isPacked: !currentStatus } : i,
//         ),
//       );

//       await fetch(`${API_BASE_URL}/packer/packing/update-individual-packed`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ packingId: itemId, isPacked: !currentStatus }),
//       });

//       refresh(); // Refresh main data
//     } catch (err) {
//       // Revert on error
//       setIndividualItems((prev) =>
//         prev.map((i) =>
//           i._id === itemId ? { ...i, isPacked: currentStatus } : i,
//         ),
//       );
//       alert("Update failed: " + err.message);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   return (
//     <Container fluid className="py-3">
//       {/* Header */}
//       <Row className="mb-3">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <h3 className="mb-1">Item Packer</h3>
//               <p className="text-muted small mb-0">
//                 {isValidating && (
//                   <Spinner animation="border" size="sm" className="me-2" />
//                 )}
//                 {!isValidating &&
//                   summary.total > 0 &&
//                   `${summary.total} items to pack`}
//               </p>
//             </div>
//             <div>
//               <Link to="/packer-dashboard">
//                 <Button variant="secondary" size="sm" className="me-2">
//                   <FaTable className="me-1" /> Orders
//                 </Button>
//               </Link>
//               <Button
//                 variant="success"
//                 size="sm"
//                 onClick={refresh}
//                 disabled={isValidating}
//               >
//                 <FaListAlt className="me-1" /> Refresh
//               </Button>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {/* Summary Cards */}
//       <Row className="mb-3 g-2">
//         <Col xs={4}>
//           <Card className="text-center bg-light">
//             <Card.Body className="py-2">
//               <h5 className="mb-0">{summary.total}</h5>
//               <small className="text-muted">Total</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xs={4}>
//           <Card className="text-center" style={{ backgroundColor: "#e8f5e8" }}>
//             <Card.Body className="py-2">
//               <h5 className="mb-0 text-success">{summary.packed}</h5>
//               <small className="text-muted">Packed</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xs={4}>
//           <Card className="text-center" style={{ backgroundColor: "#fff3cd" }}>
//             <Card.Body className="py-2">
//               <h5 className="mb-0 text-warning">{summary.remaining}</h5>
//               <small className="text-muted">Remaining</small>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Filters */}
//       <Card className="mb-3">
//         <Card.Body className="p-3">
//           <Row className="g-2">
//             <Col xs={6}>
//               <Form.Select
//                 size="sm"
//                 value={filters.hub}
//                 onChange={(e) =>
//                   setFilters((prev) => ({ ...prev, hub: e.target.value }))
//                 }
//                 disabled={userRole === "packer"}
//               >
//                 <option value="all">All Hubs</option>
//                 {filterOptions.hubs.map((h) => (
//                   <option key={h} value={h}>
//                     {h}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Col>
//             <Col xs={6}>
//               <Form.Select
//                 size="sm"
//                 value={filters.session}
//                 onChange={(e) =>
//                   setFilters((prev) => ({ ...prev, session: e.target.value }))
//                 }
//               >
//                 <option value="all">All Sessions</option>
//                 {filterOptions.sessions.map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       {/* Error Alert */}
//       {error && (
//         <Alert variant="danger" className="mb-3 py-2">
//           <small>Error loading data. Showing cached data if available.</small>
//         </Alert>
//       )}

//       {/* Main Content */}
//       <Card>
//         <Card.Header className="p-0">
//           <Tabs
//             activeKey={activeTab}
//             onSelect={(k) => setActiveTab(k)}
//             className="px-2 pt-2"
//             fill
//           >
//             <Tab eventKey="items" title={`Items (${groupedItems.length})`} />
//             <Tab
//               eventKey="sessions"
//               title={`Sessions (${filterOptions.sessions.length})`}
//             />
//           </Tabs>
//         </Card.Header>
//         <Card.Body className="p-2">
//           {activeTab === "items" && (
//             <div className="item-list">
//               {groupedItems.length === 0 ? (
//                 <p className="text-center text-muted py-4 small">
//                   No items to display
//                 </p>
//               ) : (
//                 groupedItems.map((item) => (
//                   <div
//                     key={item.name}
//                     className="border rounded p-2 mb-2 bg-white"
//                     onClick={() => handleItemClick(item)}
//                     style={{ cursor: "pointer" }}
//                   >
//                     <div className="d-flex justify-content-between align-items-center">
//                       <div>
//                         <h6 className="mb-1">{item.name}</h6>
//                         <small className="text-muted">
//                           {item.category} • {item.unit}
//                         </small>
//                       </div>
//                       <div className="text-end">
//                         <Badge
//                           bg={item.isFullyPacked ? "success" : "warning"}
//                           className="mb-1"
//                         >
//                           {item.remaining} left
//                         </Badge>
//                         <div>
//                           <small className="text-muted">
//                             {item.sessions.join(" • ")}
//                           </small>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}

//           {activeTab === "sessions" && (
//             <div className="session-list">
//               {filterOptions.sessions.length === 0 ? (
//                 <p className="text-center text-muted py-4 small">
//                   No sessions available
//                 </p>
//               ) : (
//                 filterOptions.sessions.map((session) => {
//                   const sessionItems = filteredData.filter(
//                     (i) => i.session === session,
//                   );
//                   const packedInSession = sessionItems.filter(
//                     (i) => i.isPacked,
//                   ).length;

//                   return (
//                     <div
//                       key={session}
//                       className="border rounded p-2 mb-2 bg-white"
//                     >
//                       <div className="d-flex justify-content-between align-items-center mb-2">
//                         <h6 className="mb-0">{session}</h6>
//                         <Badge bg="primary">{sessionItems.length} items</Badge>
//                       </div>
//                       <div className="progress" style={{ height: "5px" }}>
//                         <div
//                           className="progress-bar bg-success"
//                           style={{
//                             width: `${(packedInSession / sessionItems.length) * 100}%`,
//                           }}
//                         />
//                       </div>
//                       <small className="text-muted mt-1 d-block">
//                         {packedInSession} of {sessionItems.length} packed
//                       </small>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Individual Items Modal */}
//       <Modal
//         show={showModal}
//         onHide={() => setShowModal(false)}
//         size="lg"
//         fullscreen="sm-down"
//       >
//         <Modal.Header closeButton className="py-2">
//           <Modal.Title as="h6">
//             {selectedItem?.name} • {selectedItem?.hubName} •{" "}
//             {selectedItem?.session}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="p-2">
//           {isUpdating ? (
//             <div className="text-center py-4">
//               <Spinner animation="border" size="sm" />
//             </div>
//           ) : (
//             <div className="item-grid">
//               <Row className="g-2">
//                 {individualItems.map((item) => (
//                   <Col xs={6} sm={4} md={3} key={item._id}>
//                     <div
//                       className={`border rounded p-2 text-center ${item.isPacked ? "bg-success text-white" : "bg-light"}`}
//                       onClick={() => toggleItemStatus(item._id, item.isPacked)}
//                       style={{ cursor: "pointer", minHeight: "80px" }}
//                     >
//                       {item.isPacked ? (
//                         <FaCheckCircle className="mb-1" />
//                       ) : (
//                         <FaBox className="mb-1 text-warning" />
//                       )}
//                       <div className="small">Item #{item.itemSequence}</div>
//                       <Badge
//                         bg={item.isPacked ? "light" : "warning"}
//                         text="dark"
//                         className="mt-1"
//                       >
//                         {item.isPacked ? "Packed" : "Tap to pack"}
//                       </Badge>
//                     </div>
//                   </Col>
//                 ))}
//               </Row>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer className="py-2">
//           <Button
//             size="sm"
//             variant="secondary"
//             onClick={() => setShowModal(false)}
//           >
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default SimplePackerOrders;
