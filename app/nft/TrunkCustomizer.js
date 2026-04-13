"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── TRUNK BASE TYPES ───
const TRUNK_TYPES = [
  {
    label: "Classic Monogram",
    value: "monogram",
    desc: "The iconic Louis Vuitton monogram canvas — timeless since 1896.",
    baseColor: "#5c3a1e",
    accentColor: "#d4a44a",
  },
  {
    label: "Damier",
    value: "damier",
    desc: "The signature checkerboard motif — refined and understated.",
    baseColor: "#3a2a18",
    accentColor: "#6b5a3a",
  },
  {
    label: "Rare Archival",
    value: "archival",
    desc: "A heritage stripe pattern drawn from the LV archive — limited edition.",
    baseColor: "#1a1a2e",
    accentColor: "#c8a87a",
  },
];

// ─── MATERIAL OPTIONS ───
const MATERIALS = [
  { label: "Monogram Canvas", value: "canvas" },
  { label: "Full Leather", value: "leather" },
  { label: "Exotic Crocodile", value: "exotic" },
  { label: "Epi Leather", value: "epi" },
];

const MATERIAL_COLORS = [
  { label: "Cognac", value: "#5c3a1e" },
  { label: "Noir", value: "#1a1008" },
  { label: "Caramel", value: "#8b5e2f" },
  { label: "Crème", value: "#f5e6c8" },
  { label: "Bordeaux", value: "#5c1a1a" },
  { label: "Navy", value: "#1a2a4a" },
  { label: "Forest", value: "#1a3a1a" },
  { label: "Bleu Nuit", value: "#1a1a3a" },
];

const MATERIAL_PATTERNS = [
  { label: "Classic Stripes", value: "classic" },
  { label: "Bold Stripes", value: "bold" },
  { label: "Monogram Repeat", value: "monogram" },
  { label: "Damier Grid", value: "damier" },
  { label: "Plain", value: "plain" },
];

// ─── HARDWARE OPTIONS ───
const LOCK_STYLES = [
  { label: "S-Lock", value: "slock" },
  { label: "Push Lock", value: "pushlock" },
  { label: "Tumbler Lock", value: "tumbler" },
];

const CORNER_STYLES = [
  { label: "Brass Corners", value: "brass" },
  { label: "Lozine Corners", value: "lozine" },
  { label: "None", value: "none" },
];

const HANDLE_STYLES = [
  { label: "Top Handle", value: "top" },
  { label: "Leather Strap", value: "strap" },
  { label: "Side Handles", value: "side" },
];

const HARDWARE_METALS = [
  { label: "Gold", value: "#d4a44a" },
  { label: "Silver", value: "#c0c0c0" },
  { label: "Rose Gold", value: "#e8a090" },
  { label: "Gunmetal", value: "#4a4a4a" },
  { label: "Palladium", value: "#b0b8c0" },
];

// ─── PERSONAL TAG OPTIONS ───
const STICKERS = [
  { label: "None", value: "none" },
  { label: "LV Flower", value: "flower" },
  { label: "Diamond", value: "diamond" },
  { label: "Star", value: "star" },
  { label: "Crown", value: "crown" },
  { label: "Heart", value: "heart" },
];

// ─── STEPS ───
const STEPS = ["Trunk", "Material", "Hardware", "Personal"];

export default function TrunkCustomizer() {
  const canvasRef = useRef(null);
  const [step, setStep] = useState(0);

  // Step 0 — Trunk type
  const [trunkType, setTrunkType] = useState(TRUNK_TYPES[0]);

  // Step 1 — Material
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [matColor, setMatColor] = useState(MATERIAL_COLORS[0]);
  const [matPattern, setMatPattern] = useState(MATERIAL_PATTERNS[0]);

  // Step 2 — Hardware
  const [hwMetal, setHwMetal] = useState(HARDWARE_METALS[0]);
  const [lockStyle, setLockStyle] = useState(LOCK_STYLES[0]);
  const [cornerStyle, setCornerStyle] = useState(CORNER_STYLES[0]);
  const [handleStyle, setHandleStyle] = useState(HANDLE_STYLES[0]);

  // Step 3 — Personal
  const [initials, setInitials] = useState("");
  const [sticker, setSticker] = useState(STICKERS[0]);

  // Mint
  const [minted, setMinted] = useState(null);
  const [minting, setMinting] = useState(false);

  // ─── CANVAS DRAW ───
  const drawTrunk = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    const W = cv.width;
    const H = cv.height;
    cx.clearRect(0, 0, W, H);

    const tw = W * 0.62;
    const th = H * 0.54;
    const tx = W / 2;
    const ty = H / 2 + th / 2;

    const base = matColor.value;
    const metal = hwMetal.value;

    // Shadow
    cx.save();
    cx.shadowColor = "rgba(0,0,0,0.45)";
    cx.shadowBlur = 30;
    cx.shadowOffsetY = 12;
    cx.fillStyle = base;
    cx.beginPath();
    cx.roundRect(tx - tw / 2, ty - th, tw, th, 10);
    cx.fill();
    cx.restore();

    // Main body
    cx.fillStyle = base;
    cx.beginPath();
    cx.roundRect(tx - tw / 2, ty - th, tw, th, 10);
    cx.fill();

    // ── Material texture overlay ──
    if (material.value === "epi") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.clip();
      cx.strokeStyle = metal;
      cx.globalAlpha = 0.07;
      cx.lineWidth = 0.5;
      for (let y = 0; y < th; y += 3) {
        cx.beginPath();
        cx.moveTo(tx - tw / 2, ty - th + y);
        cx.lineTo(tx + tw / 2, ty - th + y);
        cx.stroke();
      }
      cx.globalAlpha = 1;
      cx.restore();
    } else if (material.value === "exotic") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.clip();
      cx.strokeStyle = metal;
      cx.globalAlpha = 0.08;
      cx.lineWidth = 0.5;
      const cs = 12;
      for (let row = 0; row < Math.ceil(th / cs); row++) {
        for (let col = 0; col < Math.ceil(tw / cs); col++) {
          const ox = tx - tw / 2 + col * cs + (row % 2 ? cs / 2 : 0);
          const oy = ty - th + row * cs;
          cx.beginPath();
          cx.ellipse(ox + cs / 2, oy + cs / 2, cs / 2.3, cs / 2.8, 0, 0, Math.PI * 2);
          cx.stroke();
        }
      }
      cx.globalAlpha = 1;
      cx.restore();
    }

    // ── Trunk-type base pattern ──
    if (trunkType.value === "monogram") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.clip();
      cx.font = tw * 0.1 + "px serif";
      cx.textAlign = "center";
      cx.fillStyle = metal;
      cx.globalAlpha = 0.1;
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++) {
          const sym = (row + col) % 2 === 0 ? "LV" : "\u2756";
          cx.fillText(sym, tx - tw / 2 + (col + 0.5) * (tw / 4), ty - th + (row + 0.5) * (th / 6));
        }
      }
      cx.globalAlpha = 1;
      cx.restore();
    } else if (trunkType.value === "damier") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.clip();
      const ds = 22;
      for (let row = 0; row < Math.ceil(th / ds); row++) {
        for (let col = 0; col < Math.ceil(tw / ds); col++) {
          if ((row + col) % 2 === 0) {
            cx.fillStyle = metal;
            cx.globalAlpha = 0.12;
            cx.fillRect(tx - tw / 2 + col * ds, ty - th + row * ds, ds, ds);
          }
        }
      }
      cx.globalAlpha = 1;
      cx.restore();
    } else if (trunkType.value === "archival") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.clip();
      cx.strokeStyle = trunkType.accentColor;
      cx.globalAlpha = 0.18;
      cx.lineWidth = 2;
      const gap = 18;
      for (let i = -tw; i < tw + th; i += gap) {
        cx.beginPath();
        cx.moveTo(tx - tw / 2 + i, ty - th);
        cx.lineTo(tx - tw / 2 + i + th, ty);
        cx.stroke();
        cx.beginPath();
        cx.moveTo(tx - tw / 2 + i, ty);
        cx.lineTo(tx - tw / 2 + i + th, ty - th);
        cx.stroke();
      }
      cx.globalAlpha = 1;
      cx.restore();
    }

    // ── Material pattern overlay ──
    if (matPattern.value === "classic") {
      cx.fillStyle = metal;
      for (var _i = 0, _a = [0.2, 0.5, 0.8]; _i < _a.length; _i++) {
        var p = _a[_i];
        cx.fillRect(tx - tw / 2 + 8, ty - th + th * p, tw - 16, 3);
      }
    } else if (matPattern.value === "bold") {
      cx.fillStyle = metal;
      for (var _i2 = 0, _b = [0.15, 0.3, 0.5, 0.7, 0.85]; _i2 < _b.length; _i2++) {
        var p2 = _b[_i2];
        cx.fillRect(tx - tw / 2 + 8, ty - th + th * p2, tw - 16, 2.5);
      }
    } else if (matPattern.value === "monogram") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.clip();
      cx.font = tw * 0.13 + "px serif";
      cx.textAlign = "center";
      cx.fillStyle = metal;
      cx.globalAlpha = 0.18;
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
          cx.fillText("LV", tx - tw / 2 + (col + 0.5) * (tw / 3), ty - th + (row + 0.5) * (th / 5));
        }
      }
      cx.globalAlpha = 1;
      cx.restore();
    } else if (matPattern.value === "damier") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.clip();
      const ds = 26;
      for (let row = 0; row < Math.ceil(th / ds); row++) {
        for (let col = 0; col < Math.ceil(tw / ds); col++) {
          if ((row + col) % 2 === 0) {
            cx.fillStyle = metal;
            cx.globalAlpha = 0.18;
            cx.fillRect(tx - tw / 2 + col * ds, ty - th + row * ds, ds, ds);
          }
        }
      }
      cx.globalAlpha = 1;
      cx.restore();
    }

    // Outer border
    cx.strokeStyle = metal;
    cx.lineWidth = 3;
    cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.stroke();

    // Inner border inset
    cx.strokeStyle = metal;
    cx.lineWidth = 1.2;
    cx.globalAlpha = 0.5;
    cx.beginPath(); cx.roundRect(tx - tw / 2 + 7, ty - th + 7, tw - 14, th - 14, 7); cx.stroke();
    cx.globalAlpha = 1;

    // Lid divider line
    cx.strokeStyle = metal;
    cx.lineWidth = 2;
    cx.beginPath();
    cx.moveTo(tx - tw / 2, ty - th * 0.38);
    cx.lineTo(tx + tw / 2, ty - th * 0.38);
    cx.stroke();

    // ── Lock ──
    const lockY = ty - th * 0.38;
    if (lockStyle.value === "slock") {
      const lw = 20, lh = 16;
      cx.fillStyle = metal;
      cx.beginPath(); cx.roundRect(tx - lw / 2, lockY - lh / 2, lw, lh, 3); cx.fill();
      cx.fillStyle = base;
      cx.font = "bold 10px serif"; cx.textAlign = "center";
      cx.fillText("S", tx, lockY + 4);
    } else if (lockStyle.value === "pushlock") {
      cx.fillStyle = metal;
      cx.beginPath(); cx.arc(tx, lockY, 9, 0, Math.PI * 2); cx.fill();
      cx.strokeStyle = base; cx.lineWidth = 1.5;
      cx.beginPath(); cx.arc(tx, lockY, 5, 0, Math.PI * 2); cx.stroke();
    } else if (lockStyle.value === "tumbler") {
      const lw = 22, lh = 14;
      cx.fillStyle = metal;
      cx.beginPath(); cx.roundRect(tx - lw / 2, lockY - lh / 2, lw, lh, 2); cx.fill();
      cx.fillStyle = base;
      cx.beginPath(); cx.arc(tx, lockY - 1, 3, 0, Math.PI * 2); cx.fill();
      cx.fillRect(tx - 1.5, lockY, 3, 5);
    }

    // ── Clasps ──
    cx.fillStyle = metal;
    cx.beginPath(); cx.roundRect(tx - tw * 0.28, lockY - 5, 14, 10, 2); cx.fill();
    cx.fillStyle = base; cx.fillRect(tx - tw * 0.28 + 3, lockY - 2, 8, 4);
    cx.fillStyle = metal;
    cx.beginPath(); cx.roundRect(tx + tw * 0.28 - 14, lockY - 5, 14, 10, 2); cx.fill();
    cx.fillStyle = base; cx.fillRect(tx + tw * 0.28 - 14 + 3, lockY - 2, 8, 4);

    // ── Handle ──
    if (handleStyle.value === "top") {
      cx.strokeStyle = metal; cx.lineWidth = 5; cx.lineCap = "round";
      cx.beginPath();
      cx.moveTo(tx - 26, ty - th);
      cx.quadraticCurveTo(tx - 20, ty - th - 28, tx, ty - th - 30);
      cx.quadraticCurveTo(tx + 20, ty - th - 28, tx + 26, ty - th);
      cx.stroke();
      cx.fillStyle = metal;
      cx.beginPath(); cx.arc(tx - 26, ty - th, 4, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.arc(tx + 26, ty - th, 4, 0, Math.PI * 2); cx.fill();
    } else if (handleStyle.value === "strap") {
      cx.strokeStyle = metal; cx.lineWidth = 3; cx.lineCap = "round";
      cx.beginPath();
      cx.moveTo(tx - 16, ty - th);
      cx.lineTo(tx - 16, ty - th - 36);
      cx.lineTo(tx + 16, ty - th - 36);
      cx.lineTo(tx + 16, ty - th);
      cx.stroke();
      cx.fillStyle = metal;
      cx.beginPath(); cx.roundRect(tx - 20, ty - th - 40, 40, 8, 3); cx.fill();
    } else if (handleStyle.value === "side") {
      cx.strokeStyle = metal; cx.lineWidth = 3; cx.lineCap = "round";
      cx.beginPath();
      cx.moveTo(tx - tw / 2, ty - th * 0.7);
      cx.quadraticCurveTo(tx - tw / 2 - 14, ty - th * 0.58, tx - tw / 2, ty - th * 0.46);
      cx.stroke();
      cx.beginPath();
      cx.moveTo(tx + tw / 2, ty - th * 0.7);
      cx.quadraticCurveTo(tx + tw / 2 + 14, ty - th * 0.58, tx + tw / 2, ty - th * 0.46);
      cx.stroke();
    }

    // ── Corner protectors ──
    if (cornerStyle.value !== "none") {
      const corners = [
        [tx - tw / 2, ty - th], [tx + tw / 2, ty - th],
        [tx - tw / 2, ty], [tx + tw / 2, ty],
      ];
      for (const [cx2, cy2] of corners) {
        if (cornerStyle.value === "brass") {
          cx.fillStyle = metal;
          cx.beginPath(); cx.arc(cx2, cy2, 7, 0, Math.PI * 2); cx.fill();
          cx.fillStyle = base; cx.lineWidth = 1;
          cx.beginPath(); cx.arc(cx2, cy2, 4, 0, Math.PI * 2); cx.fill();
        } else if (cornerStyle.value === "lozine") {
          cx.fillStyle = metal;
          cx.save();
          cx.translate(cx2, cy2);
          cx.beginPath();
          cx.moveTo(-8, 0); cx.lineTo(0, -8); cx.lineTo(8, 0); cx.lineTo(0, 8);
          cx.closePath(); cx.fill();
          cx.restore();
        }
      }
    }

    // ── Centre LV plate ──
    const plateW = tw * 0.26;
    const plateH = th * 0.18;
    const plateY = ty - th * 0.62;
    cx.fillStyle = metal;
    cx.beginPath(); cx.roundRect(tx - plateW / 2, plateY - plateH / 2, plateW, plateH, 4); cx.fill();
    cx.fillStyle = base;
    cx.font = "bold " + (plateH * 0.72) + "px serif";
    cx.textAlign = "center";
    cx.fillText("LV", tx, plateY + plateH * 0.24);

    // ── Digital sticker ──
    const patchY = ty - th * 0.22;
    if (sticker.value === "flower") {
      cx.save(); cx.translate(tx, patchY);
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        cx.fillStyle = metal;
        cx.beginPath(); cx.ellipse(Math.cos(a) * 12, Math.sin(a) * 12, 7, 4, a, 0, Math.PI * 2); cx.fill();
      }
      cx.fillStyle = metal; cx.beginPath(); cx.arc(0, 0, 6, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = base; cx.font = "bold 7px serif"; cx.textAlign = "center";
      cx.fillText("LV", 0, 3);
      cx.restore();
    } else if (sticker.value === "diamond") {
      cx.save(); cx.translate(tx, patchY);
      cx.fillStyle = metal;
      cx.beginPath(); cx.moveTo(0, -18); cx.lineTo(14, 0); cx.lineTo(0, 18); cx.lineTo(-14, 0); cx.closePath(); cx.fill();
      cx.fillStyle = base; cx.font = "bold 8px serif"; cx.textAlign = "center";
      cx.fillText("LV", 0, 3);
      cx.restore();
    } else if (sticker.value === "star") {
      cx.save(); cx.translate(tx, patchY);
      cx.fillStyle = metal;
      cx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const ai = a + Math.PI / 5;
        cx.lineTo(Math.cos(a) * 18, Math.sin(a) * 18);
        cx.lineTo(Math.cos(ai) * 8, Math.sin(ai) * 8);
      }
      cx.closePath(); cx.fill();
      cx.restore();
    } else if (sticker.value === "crown") {
      cx.save(); cx.translate(tx, patchY);
      cx.fillStyle = metal;
      cx.beginPath();
      cx.moveTo(-16, 8); cx.lineTo(-16, -4); cx.lineTo(-8, -14); cx.lineTo(0, -4);
      cx.lineTo(8, -14); cx.lineTo(16, -4); cx.lineTo(16, 8); cx.closePath(); cx.fill();
      cx.fillStyle = base;
      cx.beginPath(); cx.arc(-8, -2, 2.5, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.arc(0, -2, 2.5, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.arc(8, -2, 2.5, 0, Math.PI * 2); cx.fill();
      cx.restore();
    } else if (sticker.value === "heart") {
      cx.save(); cx.translate(tx, patchY);
      cx.fillStyle = metal;
      cx.beginPath();
      cx.moveTo(0, 14);
      cx.bezierCurveTo(-18, 0, -18, -14, -4, -14);
      cx.bezierCurveTo(0, -14, 0, -10, 0, -8);
      cx.bezierCurveTo(0, -10, 0, -14, 4, -14);
      cx.bezierCurveTo(18, -14, 18, 0, 0, 14);
      cx.fill();
      cx.restore();
    }

    // ── Initials hot-stamp ──
    if (initials.trim()) {
      cx.save();
      cx.font = "bold 14px serif";
      cx.textAlign = "center";
      cx.fillStyle = metal;
      cx.globalAlpha = 0.65;
      cx.fillText(initials.toUpperCase(), tx, ty - 10);
      cx.globalAlpha = 1;
      cx.restore();
    }

    // ── Token ID watermark ──
    cx.font = "11px monospace";
    cx.textAlign = "center";
    cx.fillStyle = metal;
    cx.globalAlpha = 0.35;
    cx.fillText("LV SAFARI \u00B7 NFT TRUNK", W / 2, H - 10);
    cx.globalAlpha = 1;
  }, [trunkType, material, matColor, matPattern, hwMetal, lockStyle, cornerStyle, handleStyle, sticker, initials]);

  useEffect(() => {
    drawTrunk();
  }, [drawTrunk]);

  function handleMint() {
    setMinting(true);
    setTimeout(() => {
      const id = "0x" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const trunkData = {
        trunkType: trunkType.value,
        trunkTypeLabel: trunkType.label,
        material: material.value,
        materialLabel: material.label,
        matColor: matColor.value,
        matColorLabel: matColor.label,
        matPattern: matPattern.value,
        matPatternLabel: matPattern.label,
        hwMetal: hwMetal.value,
        hwMetalLabel: hwMetal.label,
        lockStyle: lockStyle.value,
        lockStyleLabel: lockStyle.label,
        cornerStyle: cornerStyle.value,
        cornerStyleLabel: cornerStyle.label,
        handleStyle: handleStyle.value,
        handleStyleLabel: handleStyle.label,
        initials,
        sticker: sticker.value,
        stickerLabel: sticker.label,
        tokenId: id,
        mintedAt: Date.now(),
      };
      // Persist trunk config so the game can render it on the player
      try {
        localStorage.setItem("lv_trunk", JSON.stringify(trunkData));
        // Also save to collection for marketplace
        const existing = JSON.parse(localStorage.getItem("lv_trunks_collection") || "[]");
        existing.push(trunkData);
        localStorage.setItem("lv_trunks_collection", JSON.stringify(existing));
        // Give user tokens for minting
        const balance = parseInt(localStorage.getItem("lv_token_balance") || "1000", 10);
        localStorage.setItem("lv_token_balance", String(balance));
      } catch (_) { /* quota / private mode */ }
      setMinted(id);
      setMinting(false);
    }, 1800);
  }

  // ─── SHARED STYLES ───
  const gold = "#d4a44a";
  const sectionStyle = { marginBottom: 20 };
  const labelStyle = {
    fontSize: 10, letterSpacing: 2, color: "rgba(212,164,74,0.6)",
    marginBottom: 8, display: "block", fontFamily: "var(--font-sans)",
  };
  const swatchRowStyle = { display: "flex", flexWrap: "wrap", gap: 8 };

  function SwatchBtn({ item, selected, onSelect }) {
    const isColor = item.value && item.value.startsWith("#");
    return (
      <button
        onClick={() => onSelect(item)}
        style={{
          background: isColor ? item.value : "transparent",
          border: selected ? "2px solid " + gold : "2px solid rgba(212,164,74,0.25)",
          borderRadius: 6,
          width: isColor ? 30 : "auto",
          height: isColor ? 30 : "auto",
          padding: isColor ? 0 : "5px 10px",
          cursor: "pointer",
          boxShadow: selected ? "0 0 0 1px " + gold : "none",
          transition: "all 0.15s",
          color: gold, fontSize: 11, fontFamily: "var(--font-sans)",
        }}
        title={item.label}
      />
    );
  }

  function PillBtn({ item, selected, onSelect }) {
    return (
      <button
        onClick={() => onSelect(item)}
        style={{
          padding: "5px 11px",
          background: selected ? "rgba(212,164,74,0.15)" : "transparent",
          border: selected ? "1.5px solid " + gold : "1.5px solid rgba(212,164,74,0.2)",
          borderRadius: 20,
          color: selected ? gold : "rgba(212,164,74,0.5)",
          fontSize: 11, cursor: "pointer", fontFamily: "var(--font-sans)",
          letterSpacing: 0.5, transition: "all 0.15s", whiteSpace: "nowrap",
        }}
      >
        {item.label}
      </button>
    );
  }

  // ─── STEP RENDERERS ───
  function renderTrunkSelection() {
    return (
      <div>
        <span style={labelStyle}>SELECT YOUR TRUNK</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TRUNK_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTrunkType(t)}
              style={{
                padding: "14px 16px",
                background: trunkType.value === t.value ? "rgba(212,164,74,0.1)" : "rgba(212,164,74,0.03)",
                border: trunkType.value === t.value
                  ? "2px solid " + gold
                  : "2px solid rgba(212,164,74,0.12)",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 32, borderRadius: 6,
                  background: t.baseColor,
                  border: "2px solid " + t.accentColor,
                  position: "relative", overflow: "hidden", flexShrink: 0,
                }}>
                  {t.value === "monogram" && (
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: t.accentColor, fontSize: 10, fontFamily: "serif", opacity: 0.6,
                    }}>LV</div>
                  )}
                  {t.value === "damier" && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "repeating-conic-gradient(" + t.accentColor + "22 0% 25%, transparent 0% 50%) 0 0 / 12px 12px",
                    }} />
                  )}
                  {t.value === "archival" && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "repeating-linear-gradient(45deg, " + t.accentColor + "22, " + t.accentColor + "22 3px, transparent 3px, transparent 8px)",
                    }} />
                  )}
                </div>
                <div>
                  <div style={{
                    fontSize: 13, fontFamily: "var(--font-serif)",
                    color: trunkType.value === t.value ? "#f5e6c8" : "rgba(245,230,200,0.6)",
                    letterSpacing: 1,
                  }}>{t.label}</div>
                  <div style={{
                    fontSize: 10, color: "rgba(212,164,74,0.4)", marginTop: 2,
                    fontFamily: "var(--font-sans)",
                  }}>{t.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderMaterialStep() {
    return (
      <div>
        <div style={sectionStyle}>
          <span style={labelStyle}>MATERIAL</span>
          <div style={swatchRowStyle}>
            {MATERIALS.map((m) => (
              <PillBtn key={m.value} item={m} selected={material.value === m.value} onSelect={setMaterial} />
            ))}
          </div>
        </div>
        <div style={sectionStyle}>
          <span style={labelStyle}>COLOUR</span>
          <div style={swatchRowStyle}>
            {MATERIAL_COLORS.map((c) => (
              <SwatchBtn key={c.value} item={c} selected={matColor.value === c.value} onSelect={setMatColor} />
            ))}
          </div>
        </div>
        <div>
          <span style={labelStyle}>PATTERN</span>
          <div style={swatchRowStyle}>
            {MATERIAL_PATTERNS.map((p) => (
              <PillBtn key={p.value} item={p} selected={matPattern.value === p.value} onSelect={setMatPattern} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderHardwareStep() {
    return (
      <div>
        <div style={sectionStyle}>
          <span style={labelStyle}>METAL FINISH</span>
          <div style={swatchRowStyle}>
            {HARDWARE_METALS.map((m) => (
              <SwatchBtn key={m.value} item={m} selected={hwMetal.value === m.value} onSelect={setHwMetal} />
            ))}
          </div>
        </div>
        <div style={sectionStyle}>
          <span style={labelStyle}>LOCK</span>
          <div style={swatchRowStyle}>
            {LOCK_STYLES.map((l) => (
              <PillBtn key={l.value} item={l} selected={lockStyle.value === l.value} onSelect={setLockStyle} />
            ))}
          </div>
        </div>
        <div style={sectionStyle}>
          <span style={labelStyle}>CORNERS</span>
          <div style={swatchRowStyle}>
            {CORNER_STYLES.map((c) => (
              <PillBtn key={c.value} item={c} selected={cornerStyle.value === c.value} onSelect={setCornerStyle} />
            ))}
          </div>
        </div>
        <div>
          <span style={labelStyle}>HANDLE</span>
          <div style={swatchRowStyle}>
            {HANDLE_STYLES.map((h) => (
              <PillBtn key={h.value} item={h} selected={handleStyle.value === h.value} onSelect={setHandleStyle} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderPersonalStep() {
    return (
      <div>
        <div style={sectionStyle}>
          <span style={labelStyle}>INITIALS (HOT-STAMPED)</span>
          <input
            type="text"
            maxLength={3}
            value={initials}
            onChange={(e) => setInitials(e.target.value.replace(/[^a-zA-Z]/g, ""))}
            placeholder="ABC"
            style={{
              width: 100, padding: "8px 12px",
              background: "rgba(212,164,74,0.06)",
              border: "1.5px solid rgba(212,164,74,0.25)",
              borderRadius: 8, color: "#f5e6c8",
              fontFamily: "serif", fontSize: 18, letterSpacing: 6,
              textAlign: "center", outline: "none",
            }}
          />
          <div style={{ fontSize: 10, color: "rgba(212,164,74,0.35)", marginTop: 6 }}>
            Up to 3 letters — stamped in {hwMetal.label.toLowerCase()} on the trunk face
          </div>
        </div>
        <div>
          <span style={labelStyle}>DIGITAL STICKER</span>
          <div style={swatchRowStyle}>
            {STICKERS.map((s) => (
              <PillBtn key={s.value} item={s} selected={sticker.value === s.value} onSelect={setSticker} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stepContent = [renderTrunkSelection, renderMaterialStep, renderHardwareStep, renderPersonalStep];

  return (
    <div style={{
      minHeight: "100vh", background: "#0e0a04", color: "#f5e6c8",
      fontFamily: "var(--font-sans)", overflowY: "auto", padding: "0 0 40px",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(212,164,74,0.15)", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 10, letterSpacing: 6, color: gold }}>LOUIS VUITTON</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, letterSpacing: 1, color: "#f5e6c8" }}>NFT Trunk Studio</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/marketplace" style={{
            fontSize: 11, letterSpacing: 1, color: "rgba(212,164,74,0.5)",
            textDecoration: "none", border: "1px solid rgba(212,164,74,0.2)",
            padding: "6px 14px", borderRadius: 20,
          }}>Marketplace</a>
          <a href="/" style={{
            fontSize: 11, letterSpacing: 1, color: "rgba(212,164,74,0.5)",
            textDecoration: "none", border: "1px solid rgba(212,164,74,0.2)",
            padding: "6px 14px", borderRadius: 20,
          }}>&larr; Game</a>
        </div>
      </div>

      <div style={{
        maxWidth: 820, margin: "0 auto", padding: "0 20px",
        display: "flex", flexDirection: "column", gap: 0,
      }}>
        {/* Step indicator */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 0, padding: "20px 0 6px",
        }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={() => setStep(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontFamily: "var(--font-sans)",
                  background: step === i ? gold : "transparent",
                  color: step === i ? "#0e0a04" : "rgba(212,164,74,0.4)",
                  border: step === i ? "1.5px solid " + gold : "1.5px solid rgba(212,164,74,0.2)",
                  transition: "all 0.2s",
                }}>{i + 1}</div>
                <span style={{
                  fontSize: 10, letterSpacing: 1,
                  color: step === i ? gold : "rgba(212,164,74,0.35)",
                  fontFamily: "var(--font-sans)", transition: "color 0.2s",
                }}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 24, height: 1,
                  background: "rgba(212,164,74,0.15)",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Canvas preview */}
        <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 20px" }}>
          <div style={{
            position: "relative",
            background: "radial-gradient(ellipse at 50% 40%, #2a1a08 0%, #0e0a04 70%)",
            borderRadius: 16, border: "1px solid rgba(212,164,74,0.15)", padding: 8,
          }}>
            <canvas ref={canvasRef} width={320} height={280} style={{ display: "block", borderRadius: 10 }} />
          </div>
        </div>

        {/* Controls card */}
        <div style={{
          background: "rgba(212,164,74,0.04)",
          border: "1px solid rgba(212,164,74,0.12)",
          borderRadius: 14, padding: "22px 20px",
        }}>
          {stepContent[step]()}
        </div>

        {/* Step navigation */}
        <div style={{
          display: "flex", gap: 10, marginTop: 12, justifyContent: "space-between",
        }}>
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              flex: 1, padding: "12px",
              background: "transparent",
              border: step === 0 ? "1.5px solid rgba(212,164,74,0.1)" : "1.5px solid rgba(212,164,74,0.3)",
              borderRadius: 30,
              color: step === 0 ? "rgba(212,164,74,0.2)" : "rgba(212,164,74,0.6)",
              fontSize: 12, letterSpacing: 1, cursor: step === 0 ? "default" : "pointer",
              fontFamily: "var(--font-sans)", transition: "all 0.2s",
            }}
          >
            &larr; BACK
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              style={{
                flex: 1, padding: "12px",
                background: "rgba(212,164,74,0.14)",
                border: "1.5px solid " + gold,
                borderRadius: 30, color: gold,
                fontSize: 12, letterSpacing: 1, cursor: "pointer",
                fontFamily: "var(--font-sans)", transition: "all 0.2s",
              }}
            >
              NEXT &rarr;
            </button>
          ) : (
            !minted && (
              <button
                onClick={handleMint}
                disabled={minting}
                style={{
                  flex: 1, padding: "12px",
                  background: minting ? "rgba(212,164,74,0.1)" : "rgba(212,164,74,0.14)",
                  border: "1.5px solid " + gold,
                  borderRadius: 30, color: gold,
                  fontSize: 12, letterSpacing: 2, cursor: minting ? "default" : "pointer",
                  fontFamily: "var(--font-sans)", transition: "all 0.2s",
                }}
              >
                {minting ? "MINTING..." : "MINT THIS TRUNK"}
              </button>
            )
          )}
        </div>

        {/* Trunk summary */}
        <div style={{
          marginTop: 12,
          background: "rgba(212,164,74,0.05)",
          border: "1px solid rgba(212,164,74,0.12)",
          borderRadius: 14, padding: "18px 20px",
        }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(212,164,74,0.5)", marginBottom: 10 }}>TRUNK SUMMARY</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 24px", marginBottom: minted ? 16 : 0 }}>
            {[
              ["Trunk", trunkType.label],
              ["Material", material.label],
              ["Colour", matColor.label],
              ["Pattern", matPattern.label],
              ["Metal", hwMetal.label],
              ["Lock", lockStyle.label],
              ["Corners", cornerStyle.label],
              ["Handle", handleStyle.label],
              ["Initials", initials || "\u2014"],
              ["Sticker", sticker.label],
            ].map(([k, v]) => (
              <div key={k} style={{ fontSize: 12 }}>
                <span style={{ color: "rgba(212,164,74,0.45)" }}>{k}: </span>
                <span style={{ color: "#f5e6c8" }}>{v}</span>
              </div>
            ))}
          </div>

          {minted && (
            <div style={{
              background: "rgba(212,164,74,0.08)",
              border: "1px solid rgba(212,164,74,0.3)",
              borderRadius: 10, padding: "14px 16px", marginTop: 12,
            }}>
              <div style={{ fontSize: 11, color: gold, letterSpacing: 1, marginBottom: 6 }}>&check; NFT MINTED</div>
              <div style={{ fontSize: 10, color: "rgba(212,164,74,0.5)", wordBreak: "break-all", fontFamily: "monospace" }}>
                Token ID: {minted}
              </div>
              <button
                onClick={() => setMinted(null)}
                style={{
                  marginTop: 12, width: "100%", padding: "10px",
                  background: "transparent", border: "1px solid rgba(212,164,74,0.2)",
                  borderRadius: 30, color: "rgba(212,164,74,0.5)", fontSize: 12,
                  cursor: "pointer", fontFamily: "var(--font-sans)",
                }}
              >
                Mint another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
