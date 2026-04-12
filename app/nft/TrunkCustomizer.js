"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const LEATHER_COLORS = [
  { label: "Cognac", value: "#5c3a1e" },
  { label: "Noir", value: "#1a1008" },
  { label: "Caramel", value: "#8b5e2f" },
  { label: "Crème", value: "#f5e6c8" },
  { label: "Bordeaux", value: "#5c1a1a" },
  { label: "Navy", value: "#1a2a4a" },
  { label: "Forest", value: "#1a3a1a" },
  { label: "Bleu Nuit", value: "#1a1a3a" },
];

const TRIM_COLORS = [
  { label: "Gold", value: "#d4a44a" },
  { label: "Silver", value: "#c0c0c0" },
  { label: "Rose Gold", value: "#e8a090" },
  { label: "Gunmetal", value: "#4a4a4a" },
  { label: "Ivory", value: "#fffff0" },
];

const STRIPE_PATTERNS = [
  { label: "Classic (3 stripes)", value: "classic" },
  { label: "Bold (5 stripes)", value: "bold" },
  { label: "Monogram", value: "monogram" },
  { label: "Checkerboard", value: "checker" },
  { label: "Damier", value: "damier" },
  { label: "Plain", value: "plain" },
];

const ACCENT_PATCHES = [
  { label: "None", value: "none" },
  { label: "LV Flower", value: "flower" },
  { label: "Diamond", value: "diamond" },
  { label: "Star", value: "star" },
  { label: "Crown", value: "crown" },
];

export default function TrunkCustomizer() {
  const canvasRef = useRef(null);
  const [leather, setLeather] = useState(LEATHER_COLORS[0]);
  const [trim, setTrim] = useState(TRIM_COLORS[0]);
  const [pattern, setPattern] = useState(STRIPE_PATTERNS[0]);
  const [patch, setPatch] = useState(ACCENT_PATCHES[0]);
  const [minted, setMinted] = useState(null);
  const [minting, setMinting] = useState(false);

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
    const ty = H * 0.52;

    // Shadow
    cx.save();
    cx.shadowColor = "rgba(0,0,0,0.45)";
    cx.shadowBlur = 30;
    cx.shadowOffsetY = 12;
    cx.fillStyle = leather.value;
    cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.fill();
    cx.restore();

    // Main body
    cx.fillStyle = leather.value;
    cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.fill();

    // ---- Pattern overlay ----
    if (pattern.value === "classic") {
      cx.fillStyle = trim.value;
      const stripeH = 3;
      const positions = [0.2, 0.5, 0.8];
      for (const p of positions) {
        cx.fillRect(tx - tw / 2 + 8, ty - th + th * p, tw - 16, stripeH);
      }
    } else if (pattern.value === "bold") {
      cx.fillStyle = trim.value;
      const positions = [0.15, 0.3, 0.5, 0.7, 0.85];
      for (const p of positions) {
        cx.fillRect(tx - tw / 2 + 8, ty - th + th * p, tw - 16, 2.5);
      }
    } else if (pattern.value === "monogram") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.clip();
      cx.font = `${tw * 0.13}px serif`;
      cx.textAlign = "center";
      cx.fillStyle = trim.value;
      cx.globalAlpha = 0.18;
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
          cx.fillText("LV", tx - tw / 2 + (col + 0.5) * (tw / 3), ty - th + (row + 0.5) * (th / 5));
        }
      }
      cx.globalAlpha = 1;
      cx.restore();
    } else if (pattern.value === "checker") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.clip();
      const cs = 18;
      for (let row = 0; row < Math.ceil(th / cs); row++) {
        for (let col = 0; col < Math.ceil(tw / cs); col++) {
          if ((row + col) % 2 === 0) {
            cx.fillStyle = trim.value;
            cx.globalAlpha = 0.22;
            cx.fillRect(tx - tw / 2 + col * cs, ty - th + row * cs, cs, cs);
          }
        }
      }
      cx.globalAlpha = 1;
      cx.restore();
    } else if (pattern.value === "damier") {
      cx.save();
      cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.clip();
      const ds = 26;
      for (let row = 0; row < Math.ceil(th / ds); row++) {
        for (let col = 0; col < Math.ceil(tw / ds); col++) {
          if ((row + col) % 2 === 0) {
            cx.fillStyle = trim.value;
            cx.globalAlpha = 0.18;
            cx.fillRect(tx - tw / 2 + col * ds, ty - th + row * ds, ds, ds);
          }
        }
      }
      cx.globalAlpha = 1;
      cx.restore();
    }
    // plain = no pattern overlay

    // Outer border
    cx.strokeStyle = trim.value;
    cx.lineWidth = 3;
    cx.beginPath(); cx.roundRect(tx - tw / 2, ty - th, tw, th, 10); cx.stroke();

    // Inner border inset
    cx.strokeStyle = trim.value;
    cx.lineWidth = 1.2;
    cx.globalAlpha = 0.5;
    cx.beginPath(); cx.roundRect(tx - tw / 2 + 7, ty - th + 7, tw - 14, th - 14, 7); cx.stroke();
    cx.globalAlpha = 1;

    // Lid divider line
    cx.strokeStyle = trim.value;
    cx.lineWidth = 2;
    cx.beginPath();
    cx.moveTo(tx - tw / 2, ty - th * 0.38);
    cx.lineTo(tx + tw / 2, ty - th * 0.38);
    cx.stroke();

    // ---- Centre LV plate ----
    const plateW = tw * 0.26;
    const plateH = th * 0.18;
    const plateY = ty - th * 0.62;
    cx.fillStyle = trim.value;
    cx.beginPath(); cx.roundRect(tx - plateW / 2, plateY - plateH / 2, plateW, plateH, 4); cx.fill();
    cx.fillStyle = leather.value;
    cx.font = `bold ${plateH * 0.72}px serif`;
    cx.textAlign = "center";
    cx.fillText("LV", tx, plateY + plateH * 0.24);

    // ---- Accent patch ----
    const patchY = ty - th * 0.22;
    if (patch.value === "flower") {
      cx.save(); cx.translate(tx, patchY);
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        cx.fillStyle = trim.value;
        cx.beginPath(); cx.ellipse(Math.cos(a) * 12, Math.sin(a) * 12, 7, 4, a, 0, Math.PI * 2); cx.fill();
      }
      cx.fillStyle = trim.value; cx.beginPath(); cx.arc(0, 0, 6, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = leather.value; cx.font = "bold 7px serif"; cx.textAlign = "center";
      cx.fillText("LV", 0, 3);
      cx.restore();
    } else if (patch.value === "diamond") {
      cx.save(); cx.translate(tx, patchY);
      cx.fillStyle = trim.value;
      cx.beginPath(); cx.moveTo(0, -18); cx.lineTo(14, 0); cx.lineTo(0, 18); cx.lineTo(-14, 0); cx.closePath(); cx.fill();
      cx.fillStyle = leather.value; cx.font = "bold 8px serif"; cx.textAlign = "center";
      cx.fillText("LV", 0, 3);
      cx.restore();
    } else if (patch.value === "star") {
      cx.save(); cx.translate(tx, patchY);
      cx.fillStyle = trim.value;
      cx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const ai = a + Math.PI / 5;
        cx.lineTo(Math.cos(a) * 18, Math.sin(a) * 18);
        cx.lineTo(Math.cos(ai) * 8, Math.sin(ai) * 8);
      }
      cx.closePath(); cx.fill();
      cx.restore();
    } else if (patch.value === "crown") {
      cx.save(); cx.translate(tx, patchY);
      cx.fillStyle = trim.value;
      cx.beginPath();
      cx.moveTo(-16, 8); cx.lineTo(-16, -4); cx.lineTo(-8, -14); cx.lineTo(0, -4); cx.lineTo(8, -14); cx.lineTo(16, -4); cx.lineTo(16, 8); cx.closePath(); cx.fill();
      cx.fillStyle = leather.value;
      cx.beginPath(); cx.arc(-8, -2, 2.5, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.arc(0, -2, 2.5, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.arc(8, -2, 2.5, 0, Math.PI * 2); cx.fill();
      cx.restore();
    }

    // ---- Hardware / clasps ----
    // Left clasp
    cx.fillStyle = trim.value;
    cx.beginPath(); cx.roundRect(tx - tw * 0.28, ty - th * 0.4, 14, 10, 2); cx.fill();
    cx.fillStyle = leather.value; cx.fillRect(tx - tw * 0.28 + 3, ty - th * 0.4 + 3, 8, 4);
    // Right clasp
    cx.fillStyle = trim.value;
    cx.beginPath(); cx.roundRect(tx + tw * 0.28 - 14, ty - th * 0.4, 14, 10, 2); cx.fill();
    cx.fillStyle = leather.value; cx.fillRect(tx + tw * 0.28 - 14 + 3, ty - th * 0.4 + 3, 8, 4);

    // ---- Handle ----
    cx.strokeStyle = trim.value; cx.lineWidth = 5;
    cx.lineCap = "round";
    cx.beginPath();
    cx.moveTo(tx - 26, ty - th);
    cx.quadraticCurveTo(tx - 20, ty - th - 28, tx, ty - th - 30);
    cx.quadraticCurveTo(tx + 20, ty - th - 28, tx + 26, ty - th);
    cx.stroke();
    cx.fillStyle = trim.value;
    cx.beginPath(); cx.arc(tx - 26, ty - th, 4, 0, Math.PI * 2); cx.fill();
    cx.beginPath(); cx.arc(tx + 26, ty - th, 4, 0, Math.PI * 2); cx.fill();

    // ---- Corner protectors ----
    const corners = [
      [tx - tw / 2, ty - th], [tx + tw / 2, ty - th],
      [tx - tw / 2, ty], [tx + tw / 2, ty],
    ];
    for (const [cx2, cy2] of corners) {
      cx.fillStyle = trim.value;
      cx.beginPath(); cx.arc(cx2, cy2, 7, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = leather.value; cx.lineWidth = 1;
      cx.beginPath(); cx.arc(cx2, cy2, 4, 0, Math.PI * 2); cx.fill();
    }

    // ---- Token ID watermark (bottom) ----
    cx.font = "11px monospace";
    cx.textAlign = "center";
    cx.fillStyle = trim.value;
    cx.globalAlpha = 0.35;
    cx.fillText("LV SAFARI · NFT TRUNK", W / 2, H - 10);
    cx.globalAlpha = 1;
  }, [leather, trim, pattern, patch]);

  useEffect(() => {
    drawTrunk();
  }, [drawTrunk]);

  function handleMint() {
    setMinting(true);
    setTimeout(() => {
      const id = "0x" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setMinted(id);
      setMinting(false);
    }, 1800);
  }

  const sectionStyle = {
    marginBottom: 20,
  };

  const labelStyle = {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(212,164,74,0.6)",
    marginBottom: 8,
    display: "block",
    fontFamily: "var(--font-sans)",
  };

  const swatchRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  };

  function SwatchBtn({ item, selected, onSelect, children }) {
    return (
      <button
        onClick={() => onSelect(item)}
        style={{
          background: item.value && item.value !== "none" ? item.value : "transparent",
          border: selected ? "2px solid #d4a44a" : "2px solid rgba(212,164,74,0.25)",
          borderRadius: 6,
          width: item.value && item.value.startsWith("#") ? 30 : "auto",
          height: item.value && item.value.startsWith("#") ? 30 : "auto",
          padding: item.value && !item.value.startsWith("#") ? "5px 10px" : 0,
          cursor: "pointer",
          position: "relative",
          boxShadow: selected ? "0 0 0 1px #d4a44a" : "none",
          transition: "all 0.15s",
          color: "#d4a44a",
          fontSize: 11,
          fontFamily: "var(--font-sans)",
        }}
        title={item.label}
      >
        {children}
      </button>
    );
  }

  function PillBtn({ item, selected, onSelect }) {
    return (
      <button
        onClick={() => onSelect(item)}
        style={{
          padding: "5px 11px",
          background: selected ? "rgba(212,164,74,0.15)" : "transparent",
          border: selected ? "1.5px solid #d4a44a" : "1.5px solid rgba(212,164,74,0.2)",
          borderRadius: 20,
          color: selected ? "#d4a44a" : "rgba(212,164,74,0.5)",
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          letterSpacing: 0.5,
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        {item.label}
      </button>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0e0a04",
      color: "#f5e6c8",
      fontFamily: "var(--font-sans)",
      overflowY: "auto",
      padding: "0 0 40px",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(212,164,74,0.15)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 10, letterSpacing: 6, color: "#d4a44a" }}>LOUIS VUITTON</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, letterSpacing: 1, color: "#f5e6c8" }}>NFT Trunk Studio</div>
        </div>
        <a href="/" style={{
          fontSize: 11, letterSpacing: 1, color: "rgba(212,164,74,0.5)",
          textDecoration: "none", border: "1px solid rgba(212,164,74,0.2)",
          padding: "6px 14px", borderRadius: 20,
        }}>← Game</a>
      </div>

      <div style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}>
        {/* Canvas preview */}
        <div style={{ display: "flex", justifyContent: "center", padding: "28px 0 20px" }}>
          <div style={{
            position: "relative",
            background: "radial-gradient(ellipse at 50% 40%, #2a1a08 0%, #0e0a04 70%)",
            borderRadius: 16,
            border: "1px solid rgba(212,164,74,0.15)",
            padding: 8,
          }}>
            <canvas
              ref={canvasRef}
              width={320}
              height={280}
              style={{ display: "block", borderRadius: 10 }}
            />
          </div>
        </div>

        {/* Controls card */}
        <div style={{
          background: "rgba(212,164,74,0.04)",
          border: "1px solid rgba(212,164,74,0.12)",
          borderRadius: 14,
          padding: "22px 20px",
        }}>
          {/* Leather colour */}
          <div style={sectionStyle}>
            <span style={labelStyle}>LEATHER COLOUR</span>
            <div style={swatchRowStyle}>
              {LEATHER_COLORS.map((c) => (
                <SwatchBtn key={c.value} item={c} selected={leather.value === c.value} onSelect={setLeather} />
              ))}
            </div>
          </div>

          {/* Trim colour */}
          <div style={sectionStyle}>
            <span style={labelStyle}>HARDWARE & TRIM</span>
            <div style={swatchRowStyle}>
              {TRIM_COLORS.map((c) => (
                <SwatchBtn key={c.value} item={c} selected={trim.value === c.value} onSelect={setTrim} />
              ))}
            </div>
          </div>

          {/* Pattern */}
          <div style={sectionStyle}>
            <span style={labelStyle}>PATTERN</span>
            <div style={{ ...swatchRowStyle, flexWrap: "wrap" }}>
              {STRIPE_PATTERNS.map((p) => (
                <PillBtn key={p.value} item={p} selected={pattern.value === p.value} onSelect={setPattern} />
              ))}
            </div>
          </div>

          {/* Accent patch */}
          <div style={{ marginBottom: 0 }}>
            <span style={labelStyle}>ACCENT PATCH</span>
            <div style={{ ...swatchRowStyle, flexWrap: "wrap" }}>
              {ACCENT_PATCHES.map((p) => (
                <PillBtn key={p.value} item={p} selected={patch.value === p.value} onSelect={setPatch} />
              ))}
            </div>
          </div>
        </div>

        {/* Mint summary */}
        <div style={{
          marginTop: 16,
          background: "rgba(212,164,74,0.05)",
          border: "1px solid rgba(212,164,74,0.12)",
          borderRadius: 14,
          padding: "18px 20px",
        }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(212,164,74,0.5)", marginBottom: 10 }}>TRUNK SUMMARY</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 24px", marginBottom: 16 }}>
            {[
              ["Leather", leather.label],
              ["Hardware", trim.label],
              ["Pattern", pattern.label],
              ["Patch", patch.label],
            ].map(([k, v]) => (
              <div key={k} style={{ fontSize: 12 }}>
                <span style={{ color: "rgba(212,164,74,0.45)" }}>{k}: </span>
                <span style={{ color: "#f5e6c8" }}>{v}</span>
              </div>
            ))}
          </div>

          {!minted ? (
            <button
              onClick={handleMint}
              disabled={minting}
              style={{
                width: "100%",
                padding: "14px",
                background: minting ? "rgba(212,164,74,0.1)" : "rgba(212,164,74,0.14)",
                border: "1.5px solid #d4a44a",
                borderRadius: 30,
                color: "#d4a44a",
                fontSize: 13,
                letterSpacing: 2,
                cursor: minting ? "default" : "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all 0.2s",
              }}
            >
              {minting ? "MINTING..." : "MINT THIS TRUNK"}
            </button>
          ) : (
            <div style={{
              background: "rgba(212,164,74,0.08)",
              border: "1px solid rgba(212,164,74,0.3)",
              borderRadius: 10,
              padding: "14px 16px",
            }}>
              <div style={{ fontSize: 11, color: "#d4a44a", letterSpacing: 1, marginBottom: 6 }}>✓ NFT MINTED</div>
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
