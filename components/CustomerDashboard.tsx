"use client";

import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, Clock, CheckCircle, Truck, Package, MapPin, Navigation, Sliders, AlertTriangle, Heart, Trash2, ShoppingBag, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string;
  categorySlug: string;
  featured: boolean;
  rating?: number;
  reviewsCount?: number;
}

interface CustomerDashboardProps {
  token: string;
  user: { id: string; name: string; email: string; role: string };
  brandColor: string;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  products?: Product[];
  onAddToCart?: (product: Product, quantity?: number) => void;
}

const ZAMBIAN_TRANSPORT_SYSTEMS = [
  {
    id: "yango",
    name: "Yango Delivery Zambia",
    type: "On-Demand Moto Dispatch",
    cost: 45.00,
    timeEstimate: "30-45 Mins",
    description: "Rapid motorcycle courier tracking with immediate pickup and direct door-to-door delivery within Lusaka.",
    logoEmoji: "🏍️",
    colorClass: "bg-amber-50 text-amber-800 border-amber-200",
    badgeColor: "bg-amber-600",
    checkpoints: [
      { name: "ShopEase Lusaka Depot", pct: 10 },
      { name: "Cairo Road Junction", pct: 35 },
      { name: "Independence Avenue", pct: 60 },
      { name: "Kabulonga Neighborhood Entry", pct: 85 },
      { name: "Customer Address", pct: 100 },
    ],
  },
  {
    id: "mercury",
    name: "Mercury Express Zambia",
    type: "Premium Express Courier",
    cost: 120.00,
    timeEstimate: "4-6 Hours",
    description: "High-security domestic courier utilizing dedicated vans and professional dispatch agents.",
    logoEmoji: "📦",
    colorClass: "bg-blue-50 text-blue-800 border-blue-200",
    badgeColor: "bg-blue-600",
    checkpoints: [
      { name: "ShopEase Lusaka Depot", pct: 10 },
      { name: "Mercury Sort Facility", pct: 30 },
      { name: "Great East Road Hub", pct: 55 },
      { name: "Regional Dispatch Depot", pct: 80 },
      { name: "Customer Address", pct: 100 },
    ],
  },
  {
    id: "zampost",
    name: "ZamPost (Zambia Postal Services)",
    type: "Government Postal & EMS Courier",
    cost: 35.00,
    timeEstimate: "1-2 Days",
    description: "Extensive state-owned postal network, serving both rural districts and urban Lusaka addresses.",
    logoEmoji: "✉️",
    colorClass: "bg-red-50 text-red-800 border-red-200",
    badgeColor: "bg-red-600",
    checkpoints: [
      { name: "ShopEase Lusaka Depot", pct: 10 },
      { name: "Lusaka Main Post Office", pct: 35 },
      { name: "District Sorting Depot", pct: 60 },
      { name: "Postal Runner Dispatch", pct: 85 },
      { name: "Customer Address", pct: 100 },
    ],
  },
  {
    id: "powertools",
    name: "Power Tools Logistics",
    type: "Intercity Bus Cargo Transit",
    cost: 80.00,
    timeEstimate: "12-24 Hours",
    description: "Bulky cargo and package transportation leveraging the largest inter-provincial bus transit network in Zambia.",
    logoEmoji: "🚌",
    colorClass: "bg-purple-50 text-purple-800 border-purple-200",
    badgeColor: "bg-purple-600",
    checkpoints: [
      { name: "ShopEase Lusaka Depot", pct: 10 },
      { name: "Intercity Terminus (Lusaka)", pct: 35 },
      { name: "Kabwe T2 Highway Waypoint", pct: 60 },
      { name: "Copperbelt Cargo Sorting Hub", pct: 85 },
      { name: "Customer Destination Depot", pct: 100 },
    ],
  },
  {
    id: "ulendo",
    name: "Ulendo Delivery",
    type: "Ride-hail Delivery Partner",
    cost: 55.00,
    timeEstimate: "1-2 Hours",
    description: "Sedan-based dispatch via the premier local ride-hailing network. Perfect for delicate or high-value items.",
    logoEmoji: "🚗",
    colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    badgeColor: "bg-emerald-600",
    checkpoints: [
      { name: "ShopEase Lusaka Depot", pct: 10 },
      { name: "Leopards Hill Transit Gate", pct: 35 },
      { name: "Kabulonga Complex Route", pct: 60 },
      { name: "Showgrounds Outer Ring", pct: 85 },
      { name: "Customer Address", pct: 100 },
    ],
  },
];

const getActiveCarrier = (carrierName: string | null) => {
  if (!carrierName) return ZAMBIAN_TRANSPORT_SYSTEMS[0];
  const found = ZAMBIAN_TRANSPORT_SYSTEMS.find(
    (c) => c.name.toLowerCase() === carrierName.toLowerCase() || c.id === carrierName.toLowerCase()
  );
  return found || ZAMBIAN_TRANSPORT_SYSTEMS[0];
};

export default function CustomerDashboard({ 
  token, 
  user, 
  brandColor, 
  wishlist = [], 
  onToggleWishlist, 
  products = [], 
  onAddToCart 
}: CustomerDashboardProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingTransport, setUpdatingTransport] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState<"orders" | "wishlist">("orders");

  // Local image helper for wishlist items
  const parseLocalImage = (imageStr: string): string => {
    try {
      let current = imageStr;
      while (typeof current === "string") {
        if (current.startsWith('"') && current.endsWith('"')) {
          current = current.slice(1, -1);
        } else if (current.startsWith("'") && current.endsWith("'")) {
          current = current.slice(1, -1);
        } else {
          break;
        }
      }
      current = current.replace(/\\\\/g, "\\").replace(/\\"/g, '"');
      try {
        const parsed = JSON.parse(current);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch {
        const match = current.match(/https?:\/\/[^\s"',\\]+/i);
        if (match) return match[0];
      }
      const matchFallback = imageStr.match(/https?:\/\/[^\s"',\\]+/i);
      if (matchFallback) return matchFallback[0];
    } catch (e) {
      console.error("Local image parsing failed", e);
    }
    return "https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&q=80&w=400";
  };


  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customer/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const freshOrders = data.orders || [];
        setOrders(freshOrders);
        
        // Synchronize selected order state if there's an active selected order
        if (selectedOrder) {
          const freshSelected = freshOrders.find((o: any) => o.id === selectedOrder.id);
          if (freshSelected) {
            setSelectedOrder(freshSelected);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransport = async (carrierName: string) => {
    if (!selectedOrder) return;
    setUpdatingTransport(true);
    try {
      const res = await fetch("/api/customer/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          carrier: carrierName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh full order set from DB
        await fetchOrders();
        // Set selected order to updated database response
        setSelectedOrder(data.order);
        alert(`Successfully linked route and assigned transport using ${carrierName}!`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update transport carrier");
      }
    } catch (err) {
      console.error("Failed to update transport:", err);
      alert("Error contacting the server.");
    } finally {
      setUpdatingTransport(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Determine current active index of tracking steps
  const getStatusIndex = (status: string, deliveryMode?: string) => {
    const defaultSteps = ["PENDING", "CONFIRMED", "PACKED", "DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
    const pickupSteps = ["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "COLLECTED"];
    const activeSteps = deliveryMode === "PICKUP" ? pickupSteps : defaultSteps;
    return activeSteps.indexOf(status.toUpperCase());
  };

  const getSteps = (deliveryMode?: string) => {
    if (deliveryMode === "PICKUP") {
      return [
        { key: "PENDING", title: "Order Placed", desc: "Order submitted and pending confirmation." },
        { key: "CONFIRMED", title: "Confirmed", desc: "Payment received and order verified." },
        { key: "READY_FOR_PICKUP", title: "Ready for Pick-up", desc: "Items packed and ready for pick-up at our Central Depot." },
        { key: "COLLECTED", title: "Collected", desc: "Order picked up and signed successfully by customer." },
      ];
    }
    return [
      { key: "PENDING", title: "Order Placed", desc: "Order submitted and pending confirmation." },
      { key: "CONFIRMED", title: "Confirmed", desc: "Payment received and order verified." },
      { key: "PACKED", title: "Packed", desc: "Items packed securely in custom boxes." },
      { key: "DISPATCHED", title: "Dispatched", desc: "Handed over to local courier service." },
      { key: "IN_TRANSIT", title: "In Transit", desc: "Moving between regional logistics hubs." },
      { key: "OUT_FOR_DELIVERY", title: "Out for Delivery", desc: "Courier driver is delivering today." },
      { key: "DELIVERED", title: "Delivered", desc: "Order signed and received successfully." },
    ];
  };

  // Route map coordinates representation for Lusaka logistics
  const checkpoints = [
    { name: "Central Depot, Lusaka", pct: 15 },
    { name: "Cairo Road Hub, Central", pct: 35 },
    { name: "Kabulonga Avenue Hub, East", pct: 60 },
    { name: "Great East Road Dispatch", pct: 85 },
    { name: "Your Address", pct: 100 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
        <div>
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">Customer Portal</span>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-1">Hello, {user.name}</h2>
          <p className="text-sm text-stone-500 mt-1">Manage past transactions and track deliveries in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeDashboardTab === "orders" && (
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-lg text-xs font-bold text-stone-700 flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Status
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Sub-tabs */}
      <div className="flex border-b border-stone-150 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveDashboardTab("orders")}
          className={`pb-4 px-6 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all border-b-2 flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeDashboardTab === "orders"
              ? "border-emerald-700 text-stone-950 font-black"
              : "border-transparent text-stone-400 hover:text-stone-700"
          }`}
        >
          <Package className="w-4 h-4" />
          My Orders & Tracking
        </button>
        <button
          onClick={() => setActiveDashboardTab("wishlist")}
          className={`pb-4 px-6 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all border-b-2 flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeDashboardTab === "wishlist"
              ? "border-emerald-700 text-stone-950 font-black"
              : "border-transparent text-stone-400 hover:text-stone-700"
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-current" />
          Saved Wishlist ({wishlist.length})
        </button>
      </div>

      {activeDashboardTab === "orders" ? (
        loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-stone-500 text-xs">Loading order logistics database...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-dashed border-stone-200 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 mx-auto text-2xl">
              📦
            </div>
            <h3 className="font-bold text-stone-800 text-base">No orders found</h3>
            <p className="text-xs text-stone-500">
              You haven&apos;t placed any orders with ShopEase yet. Browse our catalog to place your first delivery!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Orders History List */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">Your Order History ({orders.length})</h3>
            
            <div className="space-y-3">
              {orders.map((order) => {
                const isActive = selectedOrder?.id === order.id;
                const statusIdx = getStatusIndex(order.status, order.deliveryMode);
                
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isActive
                        ? "border-emerald-600 bg-emerald-50/10 shadow-sm"
                        : "border-stone-150 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 font-mono tracking-wider">#{order.orderNumber}</span>
                        <h4 className="font-bold text-stone-900 text-sm mt-0.5">K{order.total.toFixed(2)}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                        order.status === "DELIVERED" || order.status === "COLLECTED" || order.status === "PICKED_UP"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status === "READY_FOR_PICKUP"
                          ? "bg-blue-50 text-blue-700 font-extrabold"
                          : "bg-amber-50 text-amber-700 animate-pulse"
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-500 mt-4 pt-4 border-t border-stone-100">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span>•</span>
                      <span>{order.OrderItem?.length || 0} items</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Order Logistics Tracker */}
          <div className="lg:col-span-7 bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-100 space-y-8">
            {selectedOrder ? (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
                  <div>
                    <span className="text-[10px] text-stone-400 font-mono">ORDER DETAIL & TRACKING</span>
                    <h3 className="font-bold text-stone-900 text-base mt-0.5">#{selectedOrder.orderNumber}</h3>
                    <p className="text-xs text-stone-500 mt-1">Delivery address: {selectedOrder.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-400 block font-semibold">Total Price:</span>
                    <span className="font-extrabold text-emerald-800 text-lg">K{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Visual Transport Partner Summary */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  selectedOrder.carrier ? "bg-emerald-50/25 border-emerald-100" : "bg-amber-50/25 border-amber-100"
                }`}>
                  {selectedOrder.deliveryMode === "PICKUP" ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 shadow-xs flex items-center justify-center text-2xl shrink-0">
                        🏬
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest block">In-Store Self-Pickup</span>
                        <h4 className="font-bold text-stone-900 text-sm">ShopEase Cairo Road Depot</h4>
                        <p className="text-[11px] text-stone-500 mt-0.5 font-medium">
                          Cairo Road, Central Business District, Lusaka
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 shadow-xs flex items-center justify-center text-2xl shrink-0">
                        {getActiveCarrier(selectedOrder.carrier).logoEmoji}
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">Zambian Transport Partner</span>
                        <h4 className="font-bold text-stone-900 text-sm">
                          {selectedOrder.carrier || "Not Assigned (Defaulting to Yango)"}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5 font-medium">
                          {getActiveCarrier(selectedOrder.carrier).type} • Est: {getActiveCarrier(selectedOrder.carrier).timeEstimate}
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block sm:text-right">
                      {selectedOrder.deliveryMode === "PICKUP" ? "Pickup Order Code" : "Local Tracking ID"}
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-800 bg-white border px-2.5 py-1 rounded-md block mt-1">
                      {selectedOrder.trackingNumber || (selectedOrder.deliveryMode === "PICKUP" ? "READY" : "PENDING")}
                    </span>
                  </div>
                </div>

                {/* Simulated Delivery Vehicle Road Map Tracking or Self-Pickup Milestone Progress */}
                {selectedOrder.status !== "DELIVERED" && selectedOrder.status !== "COLLECTED" && selectedOrder.status !== "CANCELLED" && (
                  selectedOrder.deliveryMode === "PICKUP" ? (
                    <div className="bg-white p-6 rounded-2xl border border-stone-150 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        <MapPin className="w-4 h-4 animate-bounce" />
                        <span>In-Store Self-Pickup Depot Progress</span>
                      </div>

                      <p className="text-xs text-stone-500 leading-relaxed">
                        Your order is marked for in-store pickup at our Cairo Road Depot. Please present your Order Code <strong>#{selectedOrder.orderNumber}</strong> to our shop manager at the front counter.
                      </p>

                      {/* Progress Slider Track */}
                      <div className="relative pt-6 pb-2">
                        <div className="h-2 w-full bg-stone-100 rounded-full relative overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 transition-all duration-1000"
                            style={{
                              width: `${
                                selectedOrder.status === "PENDING" ? "15%" :
                                selectedOrder.status === "CONFIRMED" ? "45%" :
                                selectedOrder.status === "READY_FOR_PICKUP" ? "75%" : "100%"
                              }%`
                            }}
                          />
                        </div>

                        {/* Moving Logistics Indicator */}
                        <div
                          className="absolute top-2 transition-all duration-1000 -translate-x-1/2 shrink-0 bg-stone-900 text-white text-[10px] py-1 px-2.5 rounded-full shadow font-bold flex items-center gap-1.5"
                          style={{
                            left: `${
                              selectedOrder.status === "PENDING" ? "15%" :
                              selectedOrder.status === "CONFIRMED" ? "45%" :
                              selectedOrder.status === "READY_FOR_PICKUP" ? "75%" : "100%"
                            }%`
                          }}
                        >
                          <span>🏬</span>
                          <span>Depot</span>
                        </div>
                      </div>

                      {/* Pick-up Checkpoints */}
                      <div className="grid grid-cols-4 text-[9px] text-stone-400 font-bold text-center gap-1.5 pt-1 border-t border-stone-50">
                        {["1. Order Placed", "2. Approved & Paid", "3. Packed & Ready", "4. Collected"].map((cp, idx) => {
                          const statusIdx = getStatusIndex(selectedOrder.status, "PICKUP");
                          const isReached = statusIdx >= idx;
                          return (
                            <div key={cp} className="flex flex-col items-center gap-1">
                              <span className={`w-2.5 h-2.5 rounded-full border-2 ${
                                isReached ? "bg-emerald-600 border-emerald-200" : "bg-stone-200 border-white"
                              }`} />
                              <span className={`truncate w-full block ${isReached ? "text-emerald-700 font-semibold" : ""}`}>
                                {cp}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-stone-150 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        <Navigation className="w-4 h-4 animate-bounce" />
                        <span>Live Lusaka Delivery Progress: {getActiveCarrier(selectedOrder.carrier).name}</span>
                      </div>

                      <p className="text-xs text-stone-500 leading-relaxed">
                        Delivery dispatcher is navigating active routes. Map links <strong>ShopEase Lusaka Depot</strong> to your location. Estimated arrival (Central African Time) is within the hour.
                      </p>

                      {/* Progress Slider Track */}
                      <div className="relative pt-6 pb-2">
                        <div className="h-2 w-full bg-stone-100 rounded-full relative overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 transition-all duration-1000"
                            style={{
                              width: `${
                                selectedOrder.status === "PENDING" ? "10%" :
                                selectedOrder.status === "CONFIRMED" ? "30%" :
                                selectedOrder.status === "PACKED" ? "50%" :
                                selectedOrder.status === "DISPATCHED" ? "70%" :
                                selectedOrder.status === "IN_TRANSIT" ? "85%" : "95%"
                              }%`
                            }}
                          />
                        </div>

                        {/* Moving Logistics Indicator */}
                        <div
                          className="absolute top-2 transition-all duration-1000 -translate-x-1/2 shrink-0 bg-stone-900 text-white text-[10px] py-1 px-2.5 rounded-full shadow font-bold flex items-center gap-1.5"
                          style={{
                            left: `${
                              selectedOrder.status === "PENDING" ? "10%" :
                              selectedOrder.status === "CONFIRMED" ? "30%" :
                              selectedOrder.status === "PACKED" ? "50%" :
                              selectedOrder.status === "DISPATCHED" ? "70%" :
                              selectedOrder.status === "IN_TRANSIT" ? "85%" : "95%"
                            }%`
                          }}
                        >
                          <span className="animate-pulse">{getActiveCarrier(selectedOrder.carrier).logoEmoji}</span>
                          <span>Dispatch</span>
                        </div>
                      </div>

                      {/* Checkpoint list */}
                      <div className="grid grid-cols-5 text-[9px] text-stone-400 font-bold text-center gap-1.5 pt-1 border-t border-stone-50">
                        {getActiveCarrier(selectedOrder.carrier).checkpoints.map((cp, idx) => {
                          const statusIdx = getStatusIndex(selectedOrder.status, selectedOrder.deliveryMode);
                          const isReached = (statusIdx >= 0 && idx <= Math.floor(statusIdx * 0.7)) || selectedOrder.status === "DELIVERED";
                          return (
                            <div key={cp.name} className="flex flex-col items-center gap-1">
                              <span className={`w-2.5 h-2.5 rounded-full border-2 ${
                                isReached ? "bg-emerald-600 border-emerald-200" : "bg-stone-200 border-white"
                              }`} />
                              <span className={`truncate w-full block ${isReached ? "text-emerald-700 font-semibold" : ""}`} title={cp.name}>
                                {cp.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}

                {/* Choose / Switch Transport System section */}
                {selectedOrder.status !== "DELIVERED" && selectedOrder.status !== "COLLECTED" && selectedOrder.status !== "CANCELLED" && selectedOrder.deliveryMode !== "PICKUP" && (
                  <div className="bg-white p-6 rounded-2xl border border-stone-150 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
                      <Sliders className="w-4 h-4 text-emerald-600" />
                      <span>Choose / Switch Zambian Transport System</span>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Select your preferred Zambian-based logistics provider below to update your tracking configuration and real-time transit checkpoints.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ZAMBIAN_TRANSPORT_SYSTEMS.map((sys) => {
                        const isSelected = selectedOrder.carrier?.toLowerCase() === sys.name.toLowerCase() || 
                                           (!selectedOrder.carrier && sys.id === "yango");
                        return (
                          <button
                            key={sys.id}
                            type="button"
                            disabled={updatingTransport}
                            onClick={() => handleUpdateTransport(sys.name)}
                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-50/10 shadow-sm"
                                : "border-stone-100 hover:border-stone-200 bg-stone-50/50 hover:bg-stone-50"
                            } ${updatingTransport ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {isSelected && (
                              <span className="absolute top-0 right-0 bg-emerald-600 text-white font-bold text-[8px] uppercase px-2 py-0.5 rounded-bl">
                                Active Route
                              </span>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-2xl">{sys.logoEmoji}</span>
                              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{sys.timeEstimate}</span>
                            </div>
                            <h5 className="font-bold text-stone-900 text-xs mt-2">{sys.name}</h5>
                            <p className="text-[10px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">{sys.description}</p>
                            
                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 text-[10px]">
                              <span className="text-stone-400 font-semibold">{sys.type}</span>
                              <span className="font-extrabold text-stone-950">K{sys.cost.toFixed(2)}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Timeline Logistics Steps */}
                <div className="space-y-6">
                  <h4 className="font-bold text-stone-900 text-sm">Real-Time Logistics Milestones</h4>

                  <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                    {getSteps(selectedOrder.deliveryMode).map((st, index) => {
                      const isActive = getStatusIndex(selectedOrder.status, selectedOrder.deliveryMode) >= index;
                      const isCurrent = getStatusIndex(selectedOrder.status, selectedOrder.deliveryMode) === index;

                      return (
                        <div key={st.key} className="flex gap-4 items-start relative z-10">
                          {/* Dot */}
                          <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center border font-bold text-[10px] shrink-0 transition-all ${
                            isCurrent
                              ? "bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-50"
                              : isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "bg-white text-stone-300 border-stone-200"
                          }`}>
                            {isActive ? "✓" : index + 1}
                          </div>

                          {/* Detail */}
                          <div className="space-y-1 pt-0.5">
                            <h5 className={`font-bold text-xs ${isActive ? "text-stone-900" : "text-stone-400"}`}>
                              {st.title}
                            </h5>
                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              {st.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Database Logging Checkpoints */}
                {selectedOrder.TrackingLog && selectedOrder.TrackingLog.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl border border-stone-150 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-widest text-emerald-700">
                      <MapPin className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <span>Direct Courier Routing Logs (Zambia Transit)</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Immediate scan logs uploaded directly by the ShopEase admin and dispatcher teams.
                    </p>

                    <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100">
                      {selectedOrder.TrackingLog.map((log: any) => (
                        <div key={log.id} className="flex gap-4 items-start relative z-10">
                          <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          </div>
                          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex-1 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-bold">
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">
                                {log.status}
                              </span>
                              <span className="text-stone-400 font-mono">
                                {new Date(log.timestamp).toLocaleString("en-GB")}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-stone-800 mt-1">
                              📍 {log.location || "ShopEase Central Depot"}
                            </p>
                            <p className="text-xs text-stone-600 leading-relaxed font-medium">
                              {log.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items in order */}
                <div className="space-y-3 border-t border-stone-200 pt-6">
                  <h4 className="font-bold text-stone-900 text-xs">Included Items</h4>
                  <ul className="space-y-2">
                    {selectedOrder.OrderItem?.map((item: any) => (
                      <li key={item.id} className="flex items-center justify-between text-xs p-3.5 bg-white border border-stone-150 rounded-xl">
                        <span className="text-stone-800 font-semibold">{item.name} <span className="text-stone-400">x{item.quantity}</span></span>
                        <span className="font-bold text-stone-950">K{item.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                <span className="text-4xl animate-bounce">🗺️</span>
                <h4 className="font-bold text-stone-800">Select an order</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Select any order from your history column on the left to track real-time dispatch details and view delivery coordinates.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    ) : (
        /* WISHLIST RENDERING */
        <div className="space-y-6">
          <div className="text-left">
            <h3 className="font-extrabold text-stone-900 text-lg">My Saved Products</h3>
            <p className="text-xs text-stone-500 mt-0.5">Quickly access, buy, or remove your saved premium items.</p>
          </div>

          {products.filter(p => wishlist.includes(p.id)).length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-dashed border-stone-200 text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 mx-auto text-2xl">
                ❤️
              </div>
              <h3 className="font-bold text-stone-800 text-base">Your Wishlist is empty</h3>
              <p className="text-xs text-stone-500">
                You haven&apos;t saved any products to your wishlist yet. Explore our high-quality catalog to bookmark items!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter(p => wishlist.includes(p.id))
                .map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl overflow-hidden border border-stone-150 shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image banner */}
                        <div className="aspect-square relative w-full bg-stone-50 border-b border-stone-100 overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={parseLocalImage(product.images)}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {isOutOfStock && (
                            <span className="absolute top-3 left-3 px-2 py-0.5 bg-stone-900/80 text-white text-[9px] font-bold uppercase rounded-md backdrop-blur-xs">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-2">
                          <span className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                            {product.categorySlug}
                          </span>
                          <h4 className="font-bold text-stone-900 text-sm leading-tight line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-xs font-extrabold text-stone-950">
                            K{product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="p-4 pt-0 border-t border-stone-50 mt-2 flex gap-2 items-center">
                        <button
                          onClick={() => onAddToCart && onAddToCart(product)}
                          disabled={isOutOfStock}
                          className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-100 disabled:text-stone-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Buy
                        </button>
                        <button
                          onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                          className="p-2.5 border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-400 hover:text-rose-500 transition-colors"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
