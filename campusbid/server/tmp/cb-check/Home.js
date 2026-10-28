import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const CATEGORIES = ["All", "Electronics", "Cycles", "Books", "Dorm", "Sports", "Clothing", "Other"];
const CONDITIONS = ["All", "new", "like-new", "used", "damaged"];
const EMOJI = {
  Electronics: "\u{1F4BB}",
  Cycles: "\u{1F6B2}",
  Books: "\u{1F4DA}",
  Dorm: "\u{1F3E0}",
  Sports: "\u26BD",
  Clothing: "\u{1F455}",
  Other: "\u{1F4E6}"
};
function Countdown({ closesAt }) {
  const [label, setLabel] = useState("");
  const [cls, setCls] = useState("live");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(closesAt) - Date.now();
      if (diff <= 0) {
        setLabel("CLOSED");
        setCls("closed");
        return;
      }
      const h = Math.floor(diff / 36e5);
      const m = Math.floor(diff % 36e5 / 6e4);
      const s = Math.floor(diff % 6e4 / 1e3);
      if (diff < 18e5) setCls("urgent");
      else setCls("live");
      setLabel(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    tick();
    const iv = setInterval(tick, 1e3);
    return () => clearInterval(iv);
  }, [closesAt]);
  return /* @__PURE__ */ React.createElement("span", { className: `countdown-chip ${cls === "urgent" ? "urgent" : ""}` }, "\u23F1 ", label);
}
export default function Home() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("All");
  const fetchAuctions = useCallback(async () => {
    try {
      const params = { status: "ACTIVE" };
      if (search) params.q = search;
      if (category !== "All") params.category = category;
      if (condition !== "All") params.condition = condition;
      const res = await axios.get("/api/auctions", { params });
      setAuctions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, category, condition]);
  useEffect(() => {
    fetchAuctions();
    const iv = setInterval(fetchAuctions, 8e3);
    return () => clearInterval(iv);
  }, [fetchAuctions]);
  if (loading) return /* @__PURE__ */ React.createElement("div", { className: "page-loader" }, /* @__PURE__ */ React.createElement("div", { className: "spinner" }), /* @__PURE__ */ React.createElement("span", null, "Loading live auctions\u2026"));
  return /* @__PURE__ */ React.createElement("div", { className: "page-main fade-up" }, /* @__PURE__ */ React.createElement("div", { className: "hero" }, /* @__PURE__ */ React.createElement("div", { className: "hero-eyebrow" }, /* @__PURE__ */ React.createElement("span", { className: "dot", style: { width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 1.5s ease infinite" } }), "Live Auction Platform"), /* @__PURE__ */ React.createElement("h1", null, "Campus Clearance ", /* @__PURE__ */ React.createElement("span", { className: "gradient-text" }, "Auction Hub")), /* @__PURE__ */ React.createElement("p", null, "Graduating seniors liquidating essentials \u2014 cycles, electronics, dorm gear & more. Bid live, win big, with anti-snipe & escrow protection."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary btn-lg", onClick: () => navigate("/create-listing") }, "+ List Your Item"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-lg", onClick: () => navigate("/wanted") }, "\u{1F3AF} Set Wanted Alert")), /* @__PURE__ */ React.createElement("div", { className: "hero-stats" }, /* @__PURE__ */ React.createElement("div", { className: "hero-stat-item" }, /* @__PURE__ */ React.createElement("div", { className: "hero-stat-value" }, auctions.length), /* @__PURE__ */ React.createElement("div", { className: "hero-stat-label" }, "Live Lots")), /* @__PURE__ */ React.createElement("div", { className: "hero-stat-item" }, /* @__PURE__ */ React.createElement("div", { className: "hero-stat-value" }, "30s"), /* @__PURE__ */ React.createElement("div", { className: "hero-stat-label" }, "Anti-Snipe Extension")), /* @__PURE__ */ React.createElement("div", { className: "hero-stat-item" }, /* @__PURE__ */ React.createElement("div", { className: "hero-stat-value" }, "100%"), /* @__PURE__ */ React.createElement("div", { className: "hero-stat-label" }, "Escrow Protected")), /* @__PURE__ */ React.createElement("div", { className: "hero-stat-item" }, /* @__PURE__ */ React.createElement("div", { className: "hero-stat-value" }, "\u20B90"), /* @__PURE__ */ React.createElement("div", { className: "hero-stat-label" }, "Platform Fee")))), /* @__PURE__ */ React.createElement("div", { className: "filter-bar" }, /* @__PURE__ */ React.createElement("div", { className: "search-wrap", style: { flex: 1, minWidth: 200, position: "relative" } }, /* @__PURE__ */ React.createElement("span", { className: "search-icon", style: { position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" } }, "\u{1F50D}"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-input",
      style: { paddingLeft: "2.4rem" },
      placeholder: "Search cycles, calculators, fridges\u2026",
      value: search,
      onChange: (e) => setSearch(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "chip-group" }, CATEGORIES.map((c) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: c,
      className: `chip-btn ${category === c ? "active" : ""}`,
      onClick: () => setCategory(c)
    },
    EMOJI[c] || "",
    " ",
    c
  ))), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-select",
      style: { width: 140 },
      value: condition,
      onChange: (e) => setCondition(e.target.value)
    },
    CONDITIONS.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c === "All" ? "Any Condition" : c.charAt(0).toUpperCase() + c.slice(1)))
  )), /* @__PURE__ */ React.createElement("div", { className: "section-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "section-title" }, "Live Lots"), /* @__PURE__ */ React.createElement("p", { className: "section-sub" }, auctions.length, " active auction", auctions.length !== 1 ? "s" : "")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-sm", onClick: fetchAuctions }, "\u21BB Refresh")), auctions.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, /* @__PURE__ */ React.createElement("div", { className: "icon" }, "\u{1F3F7}\uFE0F"), /* @__PURE__ */ React.createElement("h3", null, "No live auctions found"), /* @__PURE__ */ React.createElement("p", null, "Try a different search or category. Check back soon \u2014 seniors list daily!"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", style: { marginTop: "1rem" }, onClick: () => navigate("/create-listing") }, "Be the first to list")) : /* @__PURE__ */ React.createElement("div", { className: "auction-grid" }, auctions.map((auc) => {
    const photos = auc.photos || [];
    const emoji = EMOJI[auc.category] || "\u{1F4E6}";
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: auc._id,
        className: "auction-card",
        onClick: () => navigate(`/auction/${auc._id}`)
      },
      /* @__PURE__ */ React.createElement("div", { className: "auction-card-img" }, photos.length > 0 ? /* @__PURE__ */ React.createElement(
        "img",
        {
          src: photos[0].url || photos[0],
          alt: auc.title,
          style: { width: "100%", height: "100%", objectFit: "cover" },
          onError: (e) => {
            e.target.style.display = "none";
          }
        }
      ) : /* @__PURE__ */ React.createElement("span", { style: { fontSize: "3rem" } }, emoji)),
      /* @__PURE__ */ React.createElement("div", { className: "auction-card-body" }, /* @__PURE__ */ React.createElement("div", { className: "auction-card-meta" }, /* @__PURE__ */ React.createElement("span", { className: "badge badge-active" }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" } }), "LIVE"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.75rem", color: "var(--text-muted)" } }, auc.category || "General", " \xB7 ", auc.condition || "used")), /* @__PURE__ */ React.createElement("div", { className: "auction-card-title" }, auc.title), /* @__PURE__ */ React.createElement("div", { className: "auction-card-desc" }, auc.description || "No description provided."), /* @__PURE__ */ React.createElement("div", { className: "auction-card-footer" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.1rem" } }, "Current Bid"), /* @__PURE__ */ React.createElement("div", { className: "auction-card-price" }, "\u20B9", auc.currentPrice || auc.startPrice)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement(Countdown, { closesAt: auc.closesAt }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.3rem" } }, auc.bidCount || 0, " bid", auc.bidCount !== 1 ? "s" : ""))))
    );
  })));
}
