import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
function formatCountdown(ms) {
  if (ms <= 0) return "CLOSED";
  const h = Math.floor(ms / 36e5);
  const m = Math.floor(ms % 36e5 / 6e4);
  const s = Math.floor(ms % 6e4 / 1e3);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
export default function AuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [autoBidMax, setAutoBidMax] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [submittingAuto, setSubmittingAuto] = useState(false);
  const [submittingQ, setSubmittingQ] = useState(false);
  const [bidMsg, setBidMsg] = useState({ type: "", text: "" });
  const [msLeft, setMsLeft] = useState(0);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const fetchDetails = useCallback(async () => {
    try {
      const [aucRes, bidsRes] = await Promise.all([
        axios.get(`/api/auctions/${id}`),
        axios.get(`/api/auctions/${id}/bids`)
      ]);
      setAuction(aucRes.data);
      setBids(Array.isArray(bidsRes.data) ? bidsRes.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    fetchDetails();
    const pollIv = setInterval(fetchDetails, 4e3);
    return () => clearInterval(pollIv);
  }, [fetchDetails]);
  useEffect(() => {
    if (!auction) return;
    const tick = () => setMsLeft(new Date(auction.closesAt) - Date.now());
    tick();
    const iv = setInterval(tick, 500);
    return () => clearInterval(iv);
  }, [auction]);
  const isClosed = msLeft <= 0;
  const isClosingSoon = msLeft > 0 && msLeft < 12e4;
  const sellerId = auction ? typeof auction.sellerId === "object" ? auction.sellerId?._id : auction.sellerId : null;
  const isSeller = userId && sellerId && sellerId.toString() === userId.toString();
  const currentPrice = Number(auction?.currentPrice || auction?.startPrice || 0);
  const minIncrement = Number(auction?.minIncrement || 10);
  const nextMinBid = currentPrice + minIncrement;
  const showBidMsg = (type, text) => {
    setBidMsg({ type, text });
    setTimeout(() => setBidMsg({ type: "", text: "" }), 3e3);
  };
  const handlePlaceBid = async (amount) => {
    const finalAmount = amount || Number(bidAmount);
    if (!token) {
      navigate("/login");
      return;
    }
    if (!finalAmount || finalAmount < nextMinBid) {
      showBidMsg("error", `Minimum bid is \u20B9${nextMinBid}`);
      return;
    }
    setSubmittingBid(true);
    try {
      await axios.post(`/api/auctions/${id}/bids`, { amount: finalAmount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBidAmount("");
      showBidMsg("success", `Bid of \u20B9${finalAmount} placed!`);
      fetchDetails();
    } catch (err) {
      showBidMsg("error", err.response?.data?.message || "Bid failed");
    } finally {
      setSubmittingBid(false);
    }
  };
  const handleSetAutoBid = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!autoBidMax) return;
    setSubmittingAuto(true);
    try {
      await axios.post(`/api/auctions/${id}/autobid`, { maxAmount: Number(autoBidMax) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutoBidMax("");
      showBidMsg("success", `Auto-bid max set to \u20B9${autoBidMax}`);
    } catch (err) {
      showBidMsg("error", err.response?.data?.message || "Auto-bid failed");
    } finally {
      setSubmittingAuto(false);
    }
  };
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    if (!token) {
      navigate("/login");
      return;
    }
    setSubmittingQ(true);
    try {
      await axios.post(`/api/auctions/${id}/questions`, { text: questionText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestionText("");
      showBidMsg("success", "Question sent to seller!");
      fetchDetails();
    } catch (err) {
      showBidMsg("error", err.response?.data?.message || "Failed to submit question");
    } finally {
      setSubmittingQ(false);
    }
  };
  if (loading) return /* @__PURE__ */ React.createElement("div", { className: "page-loader" }, /* @__PURE__ */ React.createElement("div", { className: "spinner" }), /* @__PURE__ */ React.createElement("span", null, "Loading auction lot\u2026"));
  if (!auction) return /* @__PURE__ */ React.createElement("div", { className: "page-main" }, /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, /* @__PURE__ */ React.createElement("div", { className: "icon" }, "\u{1F50D}"), /* @__PURE__ */ React.createElement("h3", null, "Auction not found"), /* @__PURE__ */ React.createElement("p", null, "This lot may have been removed."), /* @__PURE__ */ React.createElement(Link, { to: "/", className: "btn btn-primary", style: { marginTop: "1rem" } }, "\u2190 Back to Live Auctions")));
  const questions = auction.questions || [];
  const photos = auction.photos || [];
  return /* @__PURE__ */ React.createElement("div", { className: "page-main fade-up" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-sm", onClick: () => navigate("/"), style: { marginBottom: "1rem" } }, "\u2190 Back to Live Auctions"), isClosingSoon && /* @__PURE__ */ React.createElement("div", { className: "snipe-banner" }, "\u26A1 ANTI-SNIPE ACTIVE \u2014 bids placed in last 30s extend closing time by +60s automatically!"), bidMsg.text && /* @__PURE__ */ React.createElement("div", { className: `alert alert-${bidMsg.type === "success" ? "success" : "error"}`, style: { marginBottom: "1rem" } }, bidMsg.type === "success" ? "\u2705" : "\u26A0\uFE0F", " ", bidMsg.text), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", alignItems: "start" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.5rem" } }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.8rem", color: "var(--accent-blue)", textTransform: "uppercase", fontWeight: 700 } }, auction.category || "General", " \xB7 Lot #", auction._id.slice(-6).toUpperCase()), /* @__PURE__ */ React.createElement("span", { className: `badge badge-${auction.status === "ACTIVE" ? "active" : "closed"}` }, auction.status)), photos.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", marginBottom: "1rem", overflowX: "auto" } }, photos.map((p, i) => /* @__PURE__ */ React.createElement(
    "img",
    {
      key: i,
      src: p.url || p,
      alt: `Photo ${i + 1}`,
      style: { height: 160, width: 220, objectFit: "cover", borderRadius: "var(--radius-sm)", flexShrink: 0 },
      onError: (e) => {
        e.target.style.display = "none";
      }
    }
  ))), /* @__PURE__ */ React.createElement("h1", { style: { fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.75rem", color: "var(--text-primary)", marginBottom: "0.5rem" } }, auction.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" } }, "Listed by ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text-primary)" } }, auction.sellerId?.name || "Graduating Senior"), "\xA0\xB7\xA0Condition: ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text-primary)" } }, auction.condition || "Used")), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-secondary)", lineHeight: 1.7 } }, auction.description || "No description provided."))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("h2", { style: { fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.1rem", marginBottom: "0.4rem" } }, "\u{1F4AC} Pre-Bid Q&A"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.25rem" } }, "Public clarifications visible to all bidders."), !isSeller && !isClosed && /* @__PURE__ */ React.createElement("form", { onSubmit: handleAskQuestion, style: { display: "flex", gap: "0.5rem", marginBottom: "1.5rem" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-input",
      placeholder: "Ask about condition, accessories, hostel pickup\u2026",
      value: questionText,
      onChange: (e) => setQuestionText(e.target.value),
      style: { flex: 1 }
    }
  ), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary btn-sm", disabled: submittingQ }, submittingQ ? "\u2026" : "Ask")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem" } }, questions.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { color: "var(--text-muted)", fontSize: "0.85rem" } }, "No questions yet. Be the first to ask!") : questions.map((q, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { padding: "0.75rem 1rem", background: "var(--bg-primary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600, marginBottom: "0.25rem" } }, "Q: ", q.text), q.answer && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.8rem", color: "var(--text-secondary)" } }, "A: ", q.answer))))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "80px" } }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "countdown-display" }, /* @__PURE__ */ React.createElement("div", { className: "countdown-label" }, "Time Remaining"), /* @__PURE__ */ React.createElement("div", { className: `countdown-value ${isClosed ? "closed" : isClosingSoon ? "urgent" : "live"}` }, formatCountdown(msLeft)), /* @__PURE__ */ React.createElement("div", { className: "countdown-closes" }, "Closes: ", new Date(auction.closesAt).toLocaleString())), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.2rem" } }, "Current High Bid"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Space Grotesk', sans-serif", fontSize: "2rem", fontWeight: 700, color: "var(--accent-green)" } }, "\u20B9", currentPrice)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem" } }, "Min Next Bid"), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, color: "var(--text-secondary)", fontSize: "1.1rem" } }, "\u20B9", nextMinBid))), !isClosed && !isSeller && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "quick-bid-row" }, [minIncrement, minIncrement * 5, minIncrement * 10].map((inc) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: inc,
      className: "quick-bid-btn",
      onClick: () => handlePlaceBid(currentPrice + inc),
      disabled: submittingBid
    },
    "+\u20B9",
    inc
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", marginBottom: "1.25rem" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-input",
      type: "number",
      min: nextMinBid,
      placeholder: `Min: \u20B9${nextMinBid}`,
      value: bidAmount,
      onChange: (e) => setBidAmount(e.target.value),
      style: { flex: 1 }
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-gold",
      onClick: () => handlePlaceBid(),
      disabled: submittingBid
    },
    submittingBid ? "\u2026" : "Place Bid"
  )), /* @__PURE__ */ React.createElement("div", { style: { padding: "1rem", background: "var(--bg-primary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.3rem" } }, "\u{1F916} Proxy Auto-Bid"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" } }, "We auto-outbid rivals by \u20B9", minIncrement, " up to your ceiling."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-input",
      type: "number",
      placeholder: `e.g. \u20B9${currentPrice + minIncrement * 10}`,
      value: autoBidMax,
      onChange: (e) => setAutoBidMax(e.target.value),
      style: { flex: 1 }
    }
  ), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary btn-sm", onClick: handleSetAutoBid, disabled: submittingAuto }, submittingAuto ? "\u2026" : "Set Max")))), isClosed && /* @__PURE__ */ React.createElement("div", { className: "alert alert-error", style: { textAlign: "center" } }, "\u{1F512} This auction has closed."), isSeller && /* @__PURE__ */ React.createElement("div", { className: "alert alert-warning" }, "\u2139\uFE0F You are the seller.", " ", /* @__PURE__ */ React.createElement(Link, { to: "/my-listings", style: { color: "var(--accent-blue)", fontWeight: 600 } }, "Manage in Seller Dashboard \u2192")))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-body", style: { padding: "1.25rem" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "0.95rem", marginBottom: "0.85rem", color: "var(--text-primary)" } }, "\u{1F4CA} Bid History ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)", fontWeight: 400 } }, "(", bids.length, ")")), bids.length === 0 ? /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-muted)", fontSize: "0.85rem" } }, "No bids yet. Opening: \u20B9", auction.startPrice) : /* @__PURE__ */ React.createElement("div", { style: { maxHeight: 260, overflowY: "auto" } }, bids.map((b, i) => /* @__PURE__ */ React.createElement("div", { key: b._id || i, className: `bid-row ${i === 0 ? "top" : ""}` }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text-primary)", fontSize: "0.85rem" } }, i === 0 ? "\u{1F947} " : "", b.bidderId?.name || "Student"), b.isAuto && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.68rem", color: "var(--accent-blue)", marginLeft: 4 } }, "(auto)")), /* @__PURE__ */ React.createElement("span", { className: "bid-row-amount" }, "\u20B9", b.amount)))))))));
}
