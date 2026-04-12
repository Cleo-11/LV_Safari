"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── RARITY TIERS ───
const RARITY_MAP = {
  exotic: { label: "Exotic", color: "#e8a090", weight: 4 },
  epi: { label: "Épi", color: "#c8a87a", weight: 3 },
  leather: { label: "Leather", color: "#d4a44a", weight: 2 },
  canvas: { label: "Canvas", color: "rgba(212,164,74,0.6)", weight: 1 },
};

function getTrunkRarity(trunk) {
  return RARITY_MAP[trunk.material] || RARITY_MAP.canvas;
}

function estimateValue(trunk) {
  const rarity = getTrunkRarity(trunk);
  let base = rarity.weight * 250;
  if (trunk.initials) base += 50;
  if (trunk.sticker !== "none") base += 75;
  if (trunk.cornerStyle !== "none") base += 40;
  if (trunk.trunkType === "archival") base += 150;
  return base;
}

// ─── MINI TRUNK CANVAS RENDERER ───
function TrunkPreview({ trunk, size = 140 }) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    const W = cv.width;
    const H = cv.height;
    cx.clearRect(0, 0, W, H);

    const tw = W * 0.72;
    const th = H * 0.58;
    const tx = W / 2;
    const ty = H * 0.56;
    const base = trunk.matColor;
    const metal = trunk.hwMetal;

    // Shadow
    cx.save();
    cx.shadowColor = "rgba(0,0,0,0.5)";
    cx.shadowBlur = 14;
    cx.shadowOffsetY = 6;
    cx.fillStyle = base;
    cx.beginPath();
    cx.roundRect(tx - tw / 2, ty - th, tw, th, 6);
    cx.fill();
    cx.restore();

    // Body
    cx.fillStyle = base;
    cx.beginPath();
    cx.roundRect(tx - tw / 2, ty - th, tw, th, 6);
    cx.fill();

    // Texture: epi
    if (trunk.material === "epi") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 6); cx.clip();
      cx.strokeStyle = metal; cx.globalAlpha = 0.07; cx.lineWidth = 0.5;
      for (let y = 0; y < th; y += 3) {
        cx.beginPath(); cx.moveTo(tx - tw / 2, ty - th + y); cx.lineTo(tx + tw / 2, ty - th + y); cx.stroke();
      }
      cx.globalAlpha = 1; cx.restore();
    } else if (trunk.material === "exotic") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 6); cx.clip();
      cx.strokeStyle = metal; cx.globalAlpha = 0.08; cx.lineWidth = 0.5;
      const cs = 8;
      for (let row = 0; row < Math.ceil(th / cs); row++) {
        for (let col = 0; col < Math.ceil(tw / cs); col++) {
          const ox = tx - tw / 2 + col * cs + (row % 2 ? cs / 2 : 0);
          const oy = ty - th + row * cs;
          cx.beginPath(); cx.ellipse(ox + cs / 2, oy + cs / 2, cs / 2.3, cs / 2.8, 0, 0, Math.PI * 2); cx.stroke();
        }
      }
      cx.globalAlpha = 1; cx.restore();
    }

    // Trunk pattern
    if (trunk.trunkType === "monogram") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 6); cx.clip();
      cx.font = tw * 0.12 + "px serif"; cx.textAlign = "center"; cx.fillStyle = metal; cx.globalAlpha = 0.1;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
          const sym = (row + col) % 2 === 0 ? "LV" : "\u2756";
          cx.fillText(sym, tx - tw / 2 + (col + 0.5) * (tw / 3), ty - th + (row + 0.5) * (th / 4));
        }
      }
      cx.globalAlpha = 1; cx.restore();
    } else if (trunk.trunkType === "damier") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 6); cx.clip();
      const ds = 14;
      for (let row = 0; row < Math.ceil(th / ds); row++) {
        for (let col = 0; col < Math.ceil(tw / ds); col++) {
          if ((row + col) % 2 === 0) {
            cx.fillStyle = metal; cx.globalAlpha = 0.12;
            cx.fillRect(tx - tw / 2 + col * ds, ty - th + row * ds, ds, ds);
          }
        }
      }
      cx.globalAlpha = 1; cx.restore();
    } else if (trunk.trunkType === "archival") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 6); cx.clip();
      cx.strokeStyle = metal; cx.globalAlpha = 0.18; cx.lineWidth = 1.5;
      const gap = 12;
      for (let i = -tw; i < tw + th; i += gap) {
        cx.beginPath(); cx.moveTo(tx - tw / 2 + i, ty - th); cx.lineTo(tx - tw / 2 + i + th, ty); cx.stroke();
        cx.beginPath(); cx.moveTo(tx - tw / 2 + i, ty); cx.lineTo(tx - tw / 2 + i + th, ty - th); cx.stroke();
      }
      cx.globalAlpha = 1; cx.restore();
    }

    // Material pattern
    if (trunk.matPattern === "classic") {
      cx.fillStyle = metal;
      for (const p of [0.2, 0.5, 0.8]) cx.fillRect(tx - tw / 2 + 4, ty - th + th * p, tw - 8, 2);
    } else if (trunk.matPattern === "bold") {
      cx.fillStyle = metal;
      for (const p of [0.15, 0.3, 0.5, 0.7, 0.85]) cx.fillRect(tx - tw / 2 + 4, ty - th + th * p, tw - 8, 1.5);
    } else if (trunk.matPattern === "monogram") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 6); cx.clip();
      cx.font = tw * 0.14 + "px serif"; cx.textAlign = "center"; cx.fillStyle = metal; cx.globalAlpha = 0.18;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
          cx.fillText("LV", tx - tw / 2 + (col + 0.5) * (tw / 2), ty - th + (row + 0.5) * (th / 3));
        }
      }
      cx.globalAlpha = 1; cx.restore();
    } else if (trunk.matPattern === "damier") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 6); cx.clip();
      const ds = 16;
      for (let row = 0; row < Math.ceil(th / ds); row++) {
        for (let col = 0; col < Math.ceil(tw / ds); col++) {
          if ((row + col) % 2 === 0) {
            cx.fillStyle = metal; cx.globalAlpha = 0.18;
            cx.fillRect(tx - tw / 2 + col * ds, ty - th + row * ds, ds, ds);
          }
        }
      }
      cx.globalAlpha = 1; cx.restore();
    }

    // Border
    cx.strokeStyle = metal; cx.lineWidth = 2;
    cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 6); cx.stroke();

    // Lid divider
    cx.strokeStyle = metal; cx.lineWidth = 1.5;
    cx.beginPath(); cx.moveTo(tx - tw / 2, ty - th * 0.38); cx.lineTo(tx + tw / 2, ty - th * 0.38); cx.stroke();

    // Lock
    const lockY = ty - th * 0.38;
    if (trunk.lockStyle === "slock") {
      cx.fillStyle = metal;
      cx.beginPath(); cx.roundRect(tx - 8, lockY - 6, 16, 12, 2); cx.fill();
      cx.fillStyle = base; cx.font = "bold 7px serif"; cx.textAlign = "center";
      cx.fillText("S", tx, lockY + 3);
    } else if (trunk.lockStyle === "pushlock") {
      cx.fillStyle = metal;
      cx.beginPath(); cx.arc(tx, lockY, 6, 0, Math.PI * 2); cx.fill();
    } else if (trunk.lockStyle === "tumbler") {
      cx.fillStyle = metal;
      cx.beginPath(); cx.roundRect(tx - 8, lockY - 5, 16, 10, 2); cx.fill();
    }

    // Handle
    if (trunk.handleStyle === "top") {
      cx.strokeStyle = metal; cx.lineWidth = 3; cx.lineCap = "round";
      cx.beginPath();
      cx.moveTo(tx - 16, ty - th);
      cx.quadraticCurveTo(tx, ty - th - 18, tx + 16, ty - th);
      cx.stroke();
    } else if (trunk.handleStyle === "strap") {
      cx.strokeStyle = metal; cx.lineWidth = 2; cx.lineCap = "round";
      cx.beginPath();
      cx.moveTo(tx - 10, ty - th); cx.lineTo(tx - 10, ty - th - 20);
      cx.lineTo(tx + 10, ty - th - 20); cx.lineTo(tx + 10, ty - th);
      cx.stroke();
    } else if (trunk.handleStyle === "side") {
      cx.strokeStyle = metal; cx.lineWidth = 2; cx.lineCap = "round";
      cx.beginPath(); cx.moveTo(tx - tw / 2, ty - th * 0.7);
      cx.quadraticCurveTo(tx - tw / 2 - 8, ty - th * 0.58, tx - tw / 2, ty - th * 0.46); cx.stroke();
      cx.beginPath(); cx.moveTo(tx + tw / 2, ty - th * 0.7);
      cx.quadraticCurveTo(tx + tw / 2 + 8, ty - th * 0.58, tx + tw / 2, ty - th * 0.46); cx.stroke();
    }

    // Corners
    if (trunk.cornerStyle !== "none") {
      const corners = [
        [tx - tw / 2, ty - th], [tx + tw / 2, ty - th],
        [tx - tw / 2, ty], [tx + tw / 2, ty],
      ];
      for (const [cx2, cy2] of corners) {
        if (trunk.cornerStyle === "brass") {
          cx.fillStyle = metal;
          cx.beginPath(); cx.arc(cx2, cy2, 4, 0, Math.PI * 2); cx.fill();
        } else if (trunk.cornerStyle === "lozine") {
          cx.fillStyle = metal;
          cx.save(); cx.translate(cx2, cy2);
          cx.beginPath(); cx.moveTo(-5, 0); cx.lineTo(0, -5); cx.lineTo(5, 0); cx.lineTo(0, 5);
          cx.closePath(); cx.fill(); cx.restore();
        }
      }
    }

    // LV plate
    const plateW = tw * 0.28;
    const plateH = th * 0.18;
    const plateY = ty - th * 0.62;
    cx.fillStyle = metal;
    cx.beginPath(); cx.roundRect(tx - plateW / 2, plateY - plateH / 2, plateW, plateH, 3); cx.fill();
    cx.fillStyle = base; cx.font = "bold " + (plateH * 0.7) + "px serif"; cx.textAlign = "center";
    cx.fillText("LV", tx, plateY + plateH * 0.22);

    // Initials
    if (trunk.initials && trunk.initials.trim()) {
      cx.font = "bold 9px serif"; cx.textAlign = "center"; cx.fillStyle = metal; cx.globalAlpha = 0.65;
      cx.fillText(trunk.initials.toUpperCase(), tx, ty - 6); cx.globalAlpha = 1;
    }
  }, [trunk]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={Math.round(size * 0.85)}
      style={{ display: "block", borderRadius: 8 }}
    />
  );
}

// ─── SAMPLE MARKETPLACE LISTINGS ───
const SAMPLE_LISTINGS = [
  {
    tokenId: "0xa1b2c3d4e5f6",
    trunkType: "monogram", trunkTypeLabel: "Classic Monogram",
    material: "leather", materialLabel: "Full Leather",
    matColor: "#5c3a1e", matColorLabel: "Cognac",
    matPattern: "classic", matPatternLabel: "Classic Stripes",
    hwMetal: "#d4a44a", hwMetalLabel: "Gold",
    lockStyle: "slock", lockStyleLabel: "S-Lock",
    cornerStyle: "brass", cornerStyleLabel: "Brass Corners",
    handleStyle: "top", handleStyleLabel: "Top Handle",
    initials: "LV", sticker: "flower", stickerLabel: "LV Flower",
    mintedAt: Date.now() - 86400000 * 3,
    seller: "Maison_LV",
    price: 850,
  },
  {
    tokenId: "0xf7e6d5c4b3a2",
    trunkType: "damier", trunkTypeLabel: "Damier",
    material: "exotic", materialLabel: "Exotic Crocodile",
    matColor: "#1a1008", matColorLabel: "Noir",
    matPattern: "damier", matPatternLabel: "Damier Grid",
    hwMetal: "#c0c0c0", hwMetalLabel: "Silver",
    lockStyle: "tumbler", lockStyleLabel: "Tumbler Lock",
    cornerStyle: "lozine", cornerStyleLabel: "Lozine Corners",
    handleStyle: "strap", handleStyleLabel: "Leather Strap",
    initials: "", sticker: "diamond", stickerLabel: "Diamond",
    mintedAt: Date.now() - 86400000 * 7,
    seller: "Atelier_Rare",
    price: 1400,
  },
  {
    tokenId: "0x9a8b7c6d5e4f",
    trunkType: "archival", trunkTypeLabel: "Rare Archival",
    material: "epi", materialLabel: "Epi Leather",
    matColor: "#1a1a2e", matColorLabel: "Bleu Nuit",
    matPattern: "plain", matPatternLabel: "Plain",
    hwMetal: "#e8a090", hwMetalLabel: "Rose Gold",
    lockStyle: "pushlock", lockStyleLabel: "Push Lock",
    cornerStyle: "brass", cornerStyleLabel: "Brass Corners",
    handleStyle: "side", handleStyleLabel: "Side Handles",
    initials: "VIP", sticker: "crown", stickerLabel: "Crown",
    mintedAt: Date.now() - 86400000 * 1,
    seller: "Heritage_Vault",
    price: 1750,
  },
  {
    tokenId: "0x1122334455aa",
    trunkType: "monogram", trunkTypeLabel: "Classic Monogram",
    material: "canvas", materialLabel: "Monogram Canvas",
    matColor: "#8b5e2f", matColorLabel: "Caramel",
    matPattern: "monogram", matPatternLabel: "Monogram Repeat",
    hwMetal: "#d4a44a", hwMetalLabel: "Gold",
    lockStyle: "slock", lockStyleLabel: "S-Lock",
    cornerStyle: "none", cornerStyleLabel: "None",
    handleStyle: "top", handleStyleLabel: "Top Handle",
    initials: "", sticker: "none", stickerLabel: "None",
    mintedAt: Date.now() - 86400000 * 14,
    seller: "Canvas_Club",
    price: 420,
  },
];

// ─── TOKEN ICON ───
function TokenIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <circle cx="12" cy="12" r="10" stroke="#d4a44a" strokeWidth="1.5" fill="rgba(212,164,74,0.1)" />
      <text x="12" y="16" textAnchor="middle" fontSize="11" fontFamily="serif" fontWeight="bold" fill="#d4a44a">L</text>
    </svg>
  );
}

// ─── MAIN MARKETPLACE COMPONENT ───
export default function Marketplace() {
  const [tab, setTab] = useState("browse"); // browse | my-trunks | activity
  const [myTrunks, setMyTrunks] = useState([]);
  const [listings, setListings] = useState([]);
  const [balance, setBalance] = useState(1000);
  const [listingPrice, setListingPrice] = useState({});
  const [notification, setNotification] = useState(null);
  const [selectedTrunk, setSelectedTrunk] = useState(null);
  const [filterRarity, setFilterRarity] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activity, setActivity] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    try {
      const collection = JSON.parse(localStorage.getItem("lv_trunks_collection") || "[]");
      setMyTrunks(collection);
      const stored = JSON.parse(localStorage.getItem("lv_marketplace_listings") || "null");
      if (stored && stored.length > 0) {
        setListings(stored);
      } else {
        setListings(SAMPLE_LISTINGS);
        localStorage.setItem("lv_marketplace_listings", JSON.stringify(SAMPLE_LISTINGS));
      }
      const bal = parseInt(localStorage.getItem("lv_token_balance") || "1000", 10);
      setBalance(bal);
      const act = JSON.parse(localStorage.getItem("lv_marketplace_activity") || "[]");
      setActivity(act);
    } catch (_) { /* private mode */ }
  }, []);

  function notify(msg) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }

  function saveListings(next) {
    setListings(next);
    try { localStorage.setItem("lv_marketplace_listings", JSON.stringify(next)); } catch (_) {}
  }

  function saveBalance(next) {
    setBalance(next);
    try { localStorage.setItem("lv_token_balance", String(next)); } catch (_) {}
  }

  function saveActivity(next) {
    setActivity(next);
    try { localStorage.setItem("lv_marketplace_activity", JSON.stringify(next)); } catch (_) {}
  }

  function handleListTrunk(trunk) {
    const price = parseInt(listingPrice[trunk.tokenId], 10);
    if (!price || price <= 0) {
      notify("Enter a valid price");
      return;
    }
    const listing = { ...trunk, seller: "You", price, listedAt: Date.now() };
    const next = [listing, ...listings];
    saveListings(next);
    // Remove from my trunks
    const remaining = myTrunks.filter((t) => t.tokenId !== trunk.tokenId);
    setMyTrunks(remaining);
    try { localStorage.setItem("lv_trunks_collection", JSON.stringify(remaining)); } catch (_) {}
    const act = [{ type: "list", trunk: listing, time: Date.now() }, ...activity];
    saveActivity(act);
    notify("Trunk listed for " + price + " LV Tokens");
  }

  function handleBuy(listing) {
    if (listing.seller === "You") {
      // Delist
      const next = listings.filter((l) => l.tokenId !== listing.tokenId);
      saveListings(next);
      const updated = [...myTrunks, listing];
      setMyTrunks(updated);
      try { localStorage.setItem("lv_trunks_collection", JSON.stringify(updated)); } catch (_) {}
      const act = [{ type: "delist", trunk: listing, time: Date.now() }, ...activity];
      saveActivity(act);
      notify("Trunk delisted and returned to your collection");
      setSelectedTrunk(null);
      return;
    }
    if (balance < listing.price) {
      notify("Insufficient LV Tokens");
      return;
    }
    const newBal = balance - listing.price;
    saveBalance(newBal);
    const next = listings.filter((l) => l.tokenId !== listing.tokenId);
    saveListings(next);
    const purchased = { ...listing };
    delete purchased.seller;
    delete purchased.price;
    delete purchased.listedAt;
    const updated = [...myTrunks, purchased];
    setMyTrunks(updated);
    try { localStorage.setItem("lv_trunks_collection", JSON.stringify(updated)); } catch (_) {}
    const act = [{ type: "buy", trunk: listing, price: listing.price, time: Date.now() }, ...activity];
    saveActivity(act);
    notify("Acquired for " + listing.price + " LV Tokens!");
    setSelectedTrunk(null);
  }

  // Filtering & sorting
  let displayed = [...listings];
  if (filterRarity !== "all") {
    displayed = displayed.filter((l) => l.material === filterRarity);
  }
  if (sortBy === "price-low") displayed.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-high") displayed.sort((a, b) => b.price - a.price);
  else if (sortBy === "rarity") displayed.sort((a, b) => (getTrunkRarity(b).weight - getTrunkRarity(a).weight));
  else displayed.sort((a, b) => (b.listedAt || b.mintedAt) - (a.listedAt || a.mintedAt));

  const gold = "#d4a44a";
  const bg = "#0e0a04";

  return (
    <div style={{
      minHeight: "100vh", background: bg, color: "#f5e6c8",
      fontFamily: "var(--font-sans)", overflowY: "auto",
    }}>
      {/* ─── NOTIFICATION TOAST ─── */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "rgba(212,164,74,0.15)", border: "1px solid " + gold,
          borderRadius: 30, padding: "10px 24px", zIndex: 100,
          color: gold, fontSize: 12, letterSpacing: 1, backdropFilter: "blur(10px)",
          animation: "fadeIn 0.3s ease",
        }}>
          {notification}
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div style={{
        borderBottom: "1px solid rgba(212,164,74,0.12)",
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(212,164,74,0.02)",
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 10, letterSpacing: 6, color: gold }}>LOUIS VUITTON</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, letterSpacing: 1, color: "#f5e6c8" }}>
            Trunk Marketplace
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Token Balance */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(212,164,74,0.08)", border: "1px solid rgba(212,164,74,0.2)",
            borderRadius: 24, padding: "6px 14px",
          }}>
            <TokenIcon size={16} />
            <span style={{ fontSize: 13, color: gold, fontFamily: "monospace", fontWeight: "bold" }}>
              {balance.toLocaleString()}
            </span>
            <span style={{ fontSize: 9, color: "rgba(212,164,74,0.5)", letterSpacing: 1 }}>LVT</span>
          </div>
          <a href="/nft" style={{
            fontSize: 11, letterSpacing: 1, color: "rgba(212,164,74,0.5)",
            textDecoration: "none", border: "1px solid rgba(212,164,74,0.2)",
            padding: "6px 14px", borderRadius: 20,
          }}>+ Create</a>
          <a href="/" style={{
            fontSize: 11, letterSpacing: 1, color: "rgba(212,164,74,0.5)",
            textDecoration: "none", border: "1px solid rgba(212,164,74,0.2)",
            padding: "6px 14px", borderRadius: 20,
          }}>&larr; Game</a>
        </div>
      </div>

      {/* ─── HERO BANNER ─── */}
      <div style={{
        padding: "32px 24px 24px",
        background: "linear-gradient(180deg, rgba(212,164,74,0.06) 0%, transparent 100%)",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 6, color: "rgba(212,164,74,0.4)",
          marginBottom: 8, fontFamily: "var(--font-sans)",
        }}>EXCLUSIVE COLLECTION</div>
        <div style={{
          fontFamily: "var(--font-serif)", fontSize: 26, letterSpacing: 2,
          color: "#f5e6c8", marginBottom: 6,
        }}>Trade Rare Trunks</div>
        <div style={{
          fontSize: 12, color: "rgba(212,164,74,0.45)", maxWidth: 400, margin: "0 auto",
        }}>
          Acquire and trade bespoke Louis Vuitton NFT trunks. Each piece is unique — crafted by hand, valued by rarity.
        </div>
        {/* Stats */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 32, marginTop: 20,
        }}>
          {[
            ["Floor Price", Math.min(...listings.map((l) => l.price), 9999).toLocaleString() + " LVT"],
            ["Listed", listings.length],
            ["Volume", listings.reduce((s, l) => s + l.price, 0).toLocaleString() + " LVT"],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 16, color: gold, fontFamily: "monospace" }}>{val}</div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(212,164,74,0.35)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── TAB BAR ─── */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 0,
        borderBottom: "1px solid rgba(212,164,74,0.1)", padding: "0 24px",
      }}>
        {[
          { id: "browse", label: "BROWSE" },
          { id: "my-trunks", label: "MY TRUNKS (" + myTrunks.length + ")" },
          { id: "activity", label: "ACTIVITY" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "12px 20px",
              background: "none", border: "none", cursor: "pointer",
              fontSize: 10, letterSpacing: 2, fontFamily: "var(--font-sans)",
              color: tab === t.id ? gold : "rgba(212,164,74,0.3)",
              borderBottom: tab === t.id ? "2px solid " + gold : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 60px" }}>
        {/* ─── BROWSE TAB ─── */}
        {tab === "browse" && (
          <div>
            {/* Filters */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 12, marginBottom: 20, flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { id: "all", label: "All" },
                  { id: "exotic", label: "Exotic" },
                  { id: "epi", label: "Épi" },
                  { id: "leather", label: "Leather" },
                  { id: "canvas", label: "Canvas" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterRarity(f.id)}
                    style={{
                      padding: "5px 12px", borderRadius: 20,
                      background: filterRarity === f.id ? "rgba(212,164,74,0.12)" : "transparent",
                      border: filterRarity === f.id ? "1px solid " + gold : "1px solid rgba(212,164,74,0.15)",
                      color: filterRarity === f.id ? gold : "rgba(212,164,74,0.4)",
                      fontSize: 10, letterSpacing: 1, cursor: "pointer",
                      fontFamily: "var(--font-sans)", transition: "all 0.15s",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "5px 12px", borderRadius: 8,
                  background: "rgba(212,164,74,0.06)",
                  border: "1px solid rgba(212,164,74,0.2)",
                  color: gold, fontSize: 10, letterSpacing: 1,
                  fontFamily: "var(--font-sans)", outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="recent">Recently Listed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rarity">Rarity</option>
              </select>
            </div>

            {/* Listings Grid */}
            {displayed.length === 0 ? (
              <div style={{
                textAlign: "center", padding: 60,
                color: "rgba(212,164,74,0.3)", fontSize: 13,
              }}>
                No trunks listed. Be the first to list one.
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
              }}>
                {displayed.map((listing) => {
                  const rarity = getTrunkRarity(listing);
                  return (
                    <button
                      key={listing.tokenId}
                      onClick={() => setSelectedTrunk(listing)}
                      style={{
                        background: "rgba(212,164,74,0.03)",
                        border: "1px solid rgba(212,164,74,0.12)",
                        borderRadius: 14, padding: 0, cursor: "pointer",
                        overflow: "hidden", transition: "all 0.2s",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(212,164,74,0.35)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(212,164,74,0.12)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Preview */}
                      <div style={{
                        background: "radial-gradient(ellipse at 50% 40%, #1a1008 0%, #0e0a04 70%)",
                        display: "flex", justifyContent: "center", padding: "16px 12px 8px",
                      }}>
                        <TrunkPreview trunk={listing} size={160} />
                      </div>
                      {/* Info */}
                      <div style={{ padding: "10px 14px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{
                            fontSize: 12, color: "#f5e6c8", fontFamily: "var(--font-serif)", letterSpacing: 0.5,
                          }}>{listing.trunkTypeLabel || listing.trunkType}</span>
                          <span style={{
                            fontSize: 8, letterSpacing: 1, color: rarity.color,
                            background: rarity.color + "18",
                            padding: "2px 6px", borderRadius: 10,
                            fontFamily: "var(--font-sans)",
                          }}>{rarity.label}</span>
                        </div>
                        <div style={{ fontSize: 9, color: "rgba(212,164,74,0.4)", marginBottom: 8 }}>
                          {listing.materialLabel || listing.material} · {listing.hwMetalLabel || "Gold"}
                        </div>
                        <div style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <TokenIcon size={12} />
                            <span style={{ fontSize: 14, color: gold, fontFamily: "monospace", fontWeight: "bold" }}>
                              {listing.price.toLocaleString()}
                            </span>
                          </div>
                          <span style={{ fontSize: 9, color: "rgba(212,164,74,0.3)" }}>
                            {listing.seller}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── MY TRUNKS TAB ─── */}
        {tab === "my-trunks" && (
          <div>
            {myTrunks.length === 0 ? (
              <div style={{
                textAlign: "center", padding: 60, color: "rgba(212,164,74,0.3)",
              }}>
                <div style={{ fontSize: 13, marginBottom: 12 }}>Your collection is empty</div>
                <a href="/nft" style={{
                  display: "inline-block", padding: "10px 24px",
                  background: "rgba(212,164,74,0.12)", border: "1px solid " + gold,
                  borderRadius: 30, color: gold, fontSize: 11, letterSpacing: 2,
                  textDecoration: "none",
                }}>CREATE A TRUNK</a>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
              }}>
                {myTrunks.map((trunk) => {
                  const rarity = getTrunkRarity(trunk);
                  const est = estimateValue(trunk);
                  return (
                    <div
                      key={trunk.tokenId}
                      style={{
                        background: "rgba(212,164,74,0.03)",
                        border: "1px solid rgba(212,164,74,0.12)",
                        borderRadius: 14, overflow: "hidden",
                      }}
                    >
                      <div style={{
                        background: "radial-gradient(ellipse at 50% 40%, #1a1008 0%, #0e0a04 70%)",
                        display: "flex", justifyContent: "center", padding: "16px 12px 8px",
                      }}>
                        <TrunkPreview trunk={trunk} size={160} />
                      </div>
                      <div style={{ padding: "10px 14px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{
                            fontSize: 12, color: "#f5e6c8", fontFamily: "var(--font-serif)",
                          }}>{trunk.trunkTypeLabel || trunk.trunkType}</span>
                          <span style={{
                            fontSize: 8, letterSpacing: 1, color: rarity.color,
                            background: rarity.color + "18", padding: "2px 6px",
                            borderRadius: 10,
                          }}>{rarity.label}</span>
                        </div>
                        <div style={{ fontSize: 9, color: "rgba(212,164,74,0.4)", marginBottom: 4 }}>
                          {trunk.materialLabel || trunk.material} · {trunk.hwMetalLabel || "Gold"}
                        </div>
                        <div style={{ fontSize: 9, color: "rgba(212,164,74,0.3)", marginBottom: 10 }}>
                          Est. value: ~{est} LVT
                        </div>
                        {/* List for sale */}
                        <div style={{ display: "flex", gap: 6 }}>
                          <input
                            type="number"
                            min="1"
                            placeholder={String(est)}
                            value={listingPrice[trunk.tokenId] || ""}
                            onChange={(e) => setListingPrice((p) => ({ ...p, [trunk.tokenId]: e.target.value }))}
                            style={{
                              flex: 1, padding: "6px 10px",
                              background: "rgba(212,164,74,0.06)",
                              border: "1px solid rgba(212,164,74,0.2)",
                              borderRadius: 8, color: gold, fontSize: 12,
                              fontFamily: "monospace", outline: "none",
                              width: 60,
                            }}
                          />
                          <button
                            onClick={() => handleListTrunk(trunk)}
                            style={{
                              padding: "6px 14px",
                              background: "rgba(212,164,74,0.12)",
                              border: "1px solid " + gold,
                              borderRadius: 8, color: gold, fontSize: 10,
                              letterSpacing: 1, cursor: "pointer",
                              fontFamily: "var(--font-sans)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            LIST
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── ACTIVITY TAB ─── */}
        {tab === "activity" && (
          <div>
            {activity.length === 0 ? (
              <div style={{
                textAlign: "center", padding: 60, color: "rgba(212,164,74,0.3)", fontSize: 13,
              }}>
                No activity yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activity.map((a, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: "rgba(212,164,74,0.03)",
                    border: "1px solid rgba(212,164,74,0.08)",
                    borderRadius: 10, padding: "12px 16px",
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: a.type === "buy"
                        ? "rgba(74,212,120,0.12)"
                        : a.type === "list"
                          ? "rgba(212,164,74,0.12)"
                          : "rgba(212,100,100,0.12)",
                      fontSize: 12,
                    }}>
                      {a.type === "buy" ? "↓" : a.type === "list" ? "↑" : "↺"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#f5e6c8" }}>
                        {a.type === "buy" && "Purchased "}
                        {a.type === "list" && "Listed "}
                        {a.type === "delist" && "Delisted "}
                        <span style={{ fontFamily: "var(--font-serif)" }}>
                          {a.trunk?.trunkTypeLabel || a.trunk?.trunkType}
                        </span>
                      </div>
                      <div style={{ fontSize: 9, color: "rgba(212,164,74,0.35)" }}>
                        {new Date(a.time).toLocaleDateString()} · {a.trunk?.tokenId?.slice(0, 10)}...
                      </div>
                    </div>
                    {(a.type === "buy" || a.type === "list") && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <TokenIcon size={12} />
                        <span style={{
                          fontSize: 13, fontFamily: "monospace", fontWeight: "bold",
                          color: a.type === "buy" ? "#e86060" : "#60e880",
                        }}>
                          {a.type === "buy" ? "-" : "+"}{(a.price || a.trunk?.price || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── TRUNK DETAIL MODAL ─── */}
      {selectedTrunk && (
        <div
          onClick={() => setSelectedTrunk(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 50, backdropFilter: "blur(8px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0e0a04",
              border: "1px solid rgba(212,164,74,0.2)",
              borderRadius: 18, maxWidth: 420, width: "90%",
              overflow: "hidden",
            }}
          >
            {/* Modal preview */}
            <div style={{
              background: "radial-gradient(ellipse at 50% 40%, #2a1a08 0%, #0e0a04 70%)",
              display: "flex", justifyContent: "center", padding: "24px 16px 16px",
              position: "relative",
            }}>
              <button
                onClick={() => setSelectedTrunk(null)}
                style={{
                  position: "absolute", top: 12, right: 14,
                  background: "none", border: "none", color: "rgba(212,164,74,0.4)",
                  fontSize: 18, cursor: "pointer",
                }}
              >&times;</button>
              <TrunkPreview trunk={selectedTrunk} size={220} />
            </div>
            {/* Modal details */}
            <div style={{ padding: "16px 20px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{
                  fontFamily: "var(--font-serif)", fontSize: 18, color: "#f5e6c8",
                }}>{selectedTrunk.trunkTypeLabel || selectedTrunk.trunkType}</span>
                <span style={{
                  fontSize: 9, letterSpacing: 1,
                  color: getTrunkRarity(selectedTrunk).color,
                  background: getTrunkRarity(selectedTrunk).color + "18",
                  padding: "3px 8px", borderRadius: 10,
                }}>{getTrunkRarity(selectedTrunk).label}</span>
              </div>

              {/* Attributes */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "6px 16px", marginBottom: 16,
              }}>
                {[
                  ["Material", selectedTrunk.materialLabel || selectedTrunk.material],
                  ["Colour", selectedTrunk.matColorLabel || "—"],
                  ["Pattern", selectedTrunk.matPatternLabel || "—"],
                  ["Metal", selectedTrunk.hwMetalLabel || "—"],
                  ["Lock", selectedTrunk.lockStyleLabel || "—"],
                  ["Corners", selectedTrunk.cornerStyleLabel || "—"],
                  ["Handle", selectedTrunk.handleStyleLabel || "—"],
                  ["Initials", selectedTrunk.initials || "—"],
                  ["Sticker", selectedTrunk.stickerLabel || "—"],
                  ["Seller", selectedTrunk.seller || "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ fontSize: 11 }}>
                    <span style={{ color: "rgba(212,164,74,0.4)" }}>{k}: </span>
                    <span style={{ color: "#f5e6c8" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Token ID */}
              <div style={{
                fontSize: 9, color: "rgba(212,164,74,0.3)", fontFamily: "monospace",
                marginBottom: 16, wordBreak: "break-all",
              }}>
                Token: {selectedTrunk.tokenId}
              </div>

              {/* Price & Buy */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(212,164,74,0.06)",
                border: "1px solid rgba(212,164,74,0.15)",
                borderRadius: 12, padding: "12px 16px",
              }}>
                <div>
                  <div style={{ fontSize: 9, color: "rgba(212,164,74,0.4)", letterSpacing: 1, marginBottom: 2 }}>PRICE</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <TokenIcon size={16} />
                    <span style={{ fontSize: 20, color: gold, fontFamily: "monospace", fontWeight: "bold" }}>
                      {selectedTrunk.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 10, color: "rgba(212,164,74,0.4)" }}>LVT</span>
                  </div>
                </div>
                <button
                  onClick={() => handleBuy(selectedTrunk)}
                  style={{
                    padding: "10px 28px",
                    background: selectedTrunk.seller === "You"
                      ? "transparent"
                      : "rgba(212,164,74,0.14)",
                    border: "1.5px solid " + gold,
                    borderRadius: 30, color: gold,
                    fontSize: 11, letterSpacing: 2, cursor: "pointer",
                    fontFamily: "var(--font-sans)", transition: "all 0.2s",
                  }}
                >
                  {selectedTrunk.seller === "You" ? "DELIST" : "ACQUIRE"}
                </button>
              </div>

              {balance < selectedTrunk.price && selectedTrunk.seller !== "You" && (
                <div style={{
                  fontSize: 10, color: "rgba(212,100,100,0.7)", textAlign: "center", marginTop: 8,
                }}>
                  Insufficient balance — you need {(selectedTrunk.price - balance).toLocaleString()} more LVT
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <div style={{
        textAlign: "center", padding: "20px",
        borderTop: "1px solid rgba(212,164,74,0.08)",
        fontSize: 9, letterSpacing: 3, color: "rgba(212,164,74,0.2)",
      }}>
        LOUIS VUITTON &middot; LV SAFARI &middot; TRUNK MARKETPLACE
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        select option { background: #1a1008; color: #d4a44a; }
      `}</style>
    </div>
  );
}
