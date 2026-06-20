"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, Bell, UserCircle, Plus, LayoutDashboard, ShoppingBag, 
  Users, Settings, PackageOpen, MoreVertical, X, CheckCircle2, 
  Clock, AlertTriangle, ShieldAlert
} from "lucide-react";

type Order = {
  id: string;
  status: string;
  rtoRiskScore: number;
  codAmount: number;
  createdAt: string;
  customer: { name: string; phone: string };
  courier: { name: string; code: string };
};

type Meta = {
  total: number;
  page: number;
  totalPages: number;
};

type Filters = {
  status: string;
  courier: string;
  risk: string;
};

const STATUSES = ["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RTO"];
const COURIERS = [
  { name: "Delhivery", code: "DELHIVERY" },
  { name: "BlueDart", code: "BLUEDART" },
  { name: "Xpressbees", code: "XPRESSBEES" },
];

function getRiskLabel(score: number) {
  if (score >= 80) return { label: "High Risk", icon: <ShieldAlert className="w-3.5 h-3.5 text-red-600" />, cls: "bg-red-50 text-red-700 border-red-200" };
  if (score >= 40) return { label: "Medium", icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />, cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Low Risk", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

function getStatusBadge(status: string) {
  switch (status) {
    case "DELIVERED": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "RTO": return "bg-red-100 text-red-800 border-red-200";
    case "IN_TRANSIT": return "bg-blue-100 text-blue-800 border-blue-200";
    case "OUT_FOR_DELIVERY": return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "PICKED_UP": return "bg-amber-100 text-amber-800 border-amber-200";
    default: return "bg-zinc-100 text-zinc-800 border-zinc-200";
  }
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, totalPages: 1 });
  const [globalStats, setGlobalStats] = useState({ totalOrders: 0, deliveredOrders: 0, rtoPercentage: "0.0%", codPending: 0 });
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [filters, setFilters] = useState<Filters>({ status: "", courier: "", risk: "" });
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState({ customerName: "", phone: "", courierId: "", codAmount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("page", String(page));
      q.set("limit", "10");
      if (filters.status) q.set("status", filters.status);
      if (filters.courier) q.set("courier", filters.courier);
      if (filters.risk) q.set("risk", filters.risk);

      const [res, statsRes] = await Promise.all([
        fetch(`/api/orders?${q}`),
        fetch(`/api/stats`)
      ]);
      
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setOrders(data.data ?? []);
      setMeta(data.meta ?? { total: 0, page: 1, totalPages: 1 });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setGlobalStats(statsData);
      }
      
      setDbConnected(true);
    } catch {
      setDbConnected(false);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newOrder, codAmount: Number(newOrder.codAmount) }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      setShowModal(false);
      setNewOrder({ customerName: "", phone: "", courierId: "", codAmount: "" });
      fetchOrders();
    } catch {
      alert("Failed to create order. Ensure database is connected.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (order: Order, status: string) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      setShowStatusModal(null);
      fetchOrders();
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      fetchOrders();
    } finally {
      setSeeding(false);
    }
  };

  const stats = [
    { label: "Total Orders", value: globalStats.totalOrders, change: "+12.5%", isPositive: true },
    { label: "Delivered Orders", value: globalStats.deliveredOrders, change: "+5.2%", isPositive: true },
    { label: "RTO %", value: globalStats.rtoPercentage, change: "-2.1%", isPositive: true },
    { label: "COD Pending", value: `₹${globalStats.codPending.toLocaleString()}`, change: "+8.4%", isPositive: true },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <PackageOpen className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900">SpokenPro</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700">
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Shipments module coming soon!"); }} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
            <ShoppingBag className="w-4 h-4" />
            Shipments
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Customers module coming soon!"); }} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
            <Users className="w-4 h-4" />
            Customers
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Settings module coming soon!"); }} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </a>
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
              <UserCircle className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">Ayush Shukla</p>
              <p className="text-xs text-zinc-500">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAV */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search orders, customers..." 
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!dbConnected && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Database Disconnected
              </span>
            )}
            {dbConnected && (
              <button 
                onClick={handleSeed}
                disabled={seeding}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-lg shadow-sm transition-all"
              >
                {seeding ? "Seeding..." : "Seed Mock Data"}
              </button>
            )}
            <button className="relative p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Order
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Logistics Overview</h1>
              <p className="text-sm text-zinc-500 mt-1">Monitor your shipments and manage RTO risks in real-time.</p>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-zinc-500">{s.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-zinc-900">{s.value}</p>
                  <span className={`text-xs font-medium ${s.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {s.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* TABLE SECTION */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col">
            
            {/* Filters */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 rounded-t-xl flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <select
                  className="bg-white border border-zinc-200 text-zinc-700 text-sm rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={filters.status}
                  onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
                >
                  <option value="">All Statuses</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
                <select
                  className="bg-white border border-zinc-200 text-zinc-700 text-sm rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={filters.courier}
                  onChange={(e) => { setFilters(f => ({ ...f, courier: e.target.value })); setPage(1); }}
                >
                  <option value="">All Couriers</option>
                  {COURIERS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
                <select
                  className="bg-white border border-zinc-200 text-zinc-700 text-sm rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={filters.risk}
                  onChange={(e) => { setFilters(f => ({ ...f, risk: e.target.value })); setPage(1); }}
                >
                  <option value="">All Risk Levels</option>
                  <option value="LOW">Low Risk (0–39)</option>
                  <option value="MEDIUM">Medium Risk (40–79)</option>
                  <option value="HIGH">High Risk (80–100)</option>
                </select>
              </div>
              <button
                onClick={() => { setFilters({ status: "", courier: "", risk: "" }); setPage(1); }}
                className="text-sm text-zinc-500 hover:text-zinc-900 font-medium px-2"
              >
                Clear Filters
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Order Details</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">RTO Prediction</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                        <PackageOpen className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                        <p>No shipments found matching your criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const risk = getRiskLabel(order.rtoRiskScore);
                      return (
                        <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                              <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-900">{order.customer?.name}</span>
                              <span className="text-xs text-zinc-500 mt-0.5">{order.customer?.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-zinc-900">₹{Number(order.codAmount).toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusBadge(order.status)}`}>
                              {order.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${risk.cls}`}>
                              {risk.icon}
                              {risk.label} ({order.rtoRiskScore}%)
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => setShowStatusModal(order)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Edit Status
                            </button>
                            <button className="ml-3 text-zinc-400 hover:text-zinc-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/50 rounded-b-xl flex items-center justify-between">
                <span className="text-sm text-zinc-500">
                  Showing <span className="font-medium text-zinc-900">{orders.length}</span> of <span className="font-medium text-zinc-900">{meta.total}</span> results
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={meta.page === 1}
                    className="px-3 py-1.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 disabled:opacity-50 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                    disabled={meta.page === meta.totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 disabled:opacity-50 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CREATE ORDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="text-lg font-semibold text-zinc-900">Create Shipment</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-full hover:bg-zinc-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-5">
              <div className="space-y-4">
                {[
                  { label: "Customer Name", key: "customerName", type: "text", placeholder: "e.g. John Doe" },
                  { label: "Phone Number", key: "phone", type: "tel", placeholder: "e.g. +91 9876543210" },
                  { label: "COD Amount (₹)", key: "codAmount", type: "number", placeholder: "0.00" },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">{f.label}</label>
                    <input
                      required
                      type={f.type}
                      placeholder={f.placeholder}
                      className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg px-3 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-zinc-400"
                      value={(newOrder as Record<string, string>)[f.key]}
                      onChange={e => setNewOrder(o => ({ ...o, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Courier Partner</label>
                  <select
                    required
                    className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg px-3 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={newOrder.courierId}
                    onChange={e => setNewOrder(o => ({ ...o, courierId: e.target.value }))}
                  >
                    <option value="" disabled>Select a courier</option>
                    {COURIERS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg shadow-sm hover:bg-zinc-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-zinc-900 border border-transparent rounded-lg shadow-sm hover:bg-zinc-800 disabled:opacity-70 transition-colors">
                  {submitting ? "Creating..." : "Confirm Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="text-lg font-semibold text-zinc-900">Update Status</h3>
              <button onClick={() => setShowStatusModal(null)} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-full hover:bg-zinc-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-zinc-500 mb-4">
                Updating shipment <span className="font-medium text-zinc-900">#{showStatusModal.id.slice(0, 8).toUpperCase()}</span>
              </p>
              <div className="space-y-2">
                {STATUSES.map(s => {
                  const isActive = s === showStatusModal.status;
                  return (
                    <button
                      key={s}
                      onClick={() => handleUpdateStatus(showStatusModal, s)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                        isActive 
                          ? "bg-blue-50 border-blue-200 text-blue-800 shadow-sm" 
                          : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {s.replace(/_/g, " ")}
                        {isActive && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
