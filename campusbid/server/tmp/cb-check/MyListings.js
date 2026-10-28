import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
function StatusBadge({ status }) {
  const cls = status === "ACTIVE" ? "active" : status === "CLOSED" ? "closed" : "pending";
  return /* @__PURE__ */ React.createElement("span", { className: `badge badge-${cls}` }, status);
}
export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const token = localStorage.getItem("token");
  const fetchListings = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get("/api/auctions/mine", { headers: { Authorization: `Bearer ${token}` } });
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchListings();
  }, []);
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/auctions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchListings();
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };
  if (!token) return /* @__PURE__ */ React.createElement("div", { className: "page-main" }, /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, /* @__PURE__ */ React.createElement("div", { className: "icon" }, "\u{1F510}"), /* @__PURE__ */ React.createElement("h3", null, "Please log in to see your listings"), /* @__PURE__ */ React.createElement(Link, { to: "/login", className: "btn btn-primary", style: { marginTop: "1rem" } }, "Sign In")));
  if (loading) return /* @__PURE__ */ React.createElement("div", { className: "page-loader" }, /* @__PURE__ */ React.createElement("div", { className: "spinner" }), /* @__PURE__ */ React.createElement("span", null, "Loading your listings\u2026"));
  return /* @__PURE__ */ React.createElement("div", { className: "page-main fade-up" }, /* @__PURE__ */ React.createElement("div", { className: "section-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "section-title" }, "My Listings"), /* @__PURE__ */ React.createElement("p", { className: "section-sub" }, "Items you've listed for auction.")), /* @__PURE__ */ React.createElement(Link, { to: "/create-listing", className: "btn btn-gold" }, "+ New Listing")), listings.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, /* @__PURE__ */ React.createElement("div", { className: "icon" }, "\u{1F3F7}\uFE0F"), /* @__PURE__ */ React.createElement("h3", null, "No listings yet"), /* @__PURE__ */ React.createElement("p", null, "Put your first item up for auction and let the campus bid!"), /* @__PURE__ */ React.createElement(Link, { to: "/create-listing", className: "btn btn-primary", style: { marginTop: "1rem" } }, "Create a Listing")) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" } }, listings.map((a) => /* @__PURE__ */ React.createElement("div", { key: a._id, className: "card", style: { cursor: "default" } }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" } }, /* @__PURE__ */ React.createElement(StatusBadge, { status: a.status }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.75rem", color: "var(--text-muted)" } }, a.category, " \xB7 Lot #", a._id.slice(-6).toUpperCase())), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "0.25rem" } }, a.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", gap: "1.5rem" } }, /* @__PURE__ */ React.createElement("span", null, "Start: \u20B9", a.startPrice), /* @__PURE__ */ React.createElement("span", null, "Current: ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--accent-green)" } }, "\u20B9", a.currentPrice || a.startPrice)), /* @__PURE__ */ React.createElement("span", null, "Closes: ", new Date(a.closesAt).toLocaleString()))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-sm", onClick: () => navigate(`/auction/${a._id}`) }, "View"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-red btn-sm", onClick: () => handleDelete(a._id), disabled: deleting === a._id }, deleting === a._id ? "\u2026" : "Delete")))))));
}
