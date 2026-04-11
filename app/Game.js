"use client";

import { useEffect, useRef } from "react";

export default function Game() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const scRef = useRef(null);
  const multRef = useRef(null);
  const tkRef = useRef(null);
  const splashRef = useRef(null);
  const overRef = useRef(null);
  const fsRef = useRef(null);
  const ftRef = useRef(null);
  const nftRef = useRef(null);
  const playBtnRef = useRef(null);
  const retryRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const cx = cv.getContext("2d");
    const wr = wrapRef.current;

    let W, H, dpr;
    function sz() {
      dpr = window.devicePixelRatio || 1;
      W = wr.clientWidth;
      H = wr.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sz();
    window.addEventListener("resize", sz);

    /* ---- constants ---- */
    const TOP_PAD = 60;
    const ROAD_LEFT = () => W * 0.08;
    const ROAD_RIGHT = () => W * 0.92;
    const ROAD_W = () => ROAD_RIGHT() - ROAD_LEFT();
    const LANE_W = () => ROAD_W() / 3;
    const PLAYER_Y_RATIO = 0.82;
    const ITEM_TYPES = [
      { name: "handbag", accent: "#d4a44a" },
      { name: "heels", accent: "#ff5252" },
      { name: "sunglasses", accent: "#424242" },
      { name: "perfume", accent: "#9c27b0" },
      { name: "watch", accent: "#b8860b" },
      { name: "necklace", accent: "#ffd700" },
    ];

    const G = {
      run: false, sc: 0, tk: 0, spd: 1.0,
      lane: 1, tgtLane: 1, px: 0, playerY: 0,
      jmpV: 0, jmp: false,
      obs: [], col: [], ptc: [],
      dist: 0, best: 0, multi: 1, mTimer: 0,
    };

    /* ---- helpers ---- */
    function lerp(a, b, t) { return a + (b - a) * t; }

    function laneX(lane) {
      return ROAD_LEFT() + LANE_W() * lane + LANE_W() / 2;
    }

    function objY(scrollY) {
      return scrollY;
    }

    /* ---- static background ---- */
    function drawBackground() {
      // Sand / ground
      cx.fillStyle = "#e8c872";
      cx.fillRect(0, 0, W, H);

      // Side decorations
      cx.fillStyle = "#d4b860";
      cx.fillRect(0, 0, ROAD_LEFT(), H);
      cx.fillRect(ROAD_RIGHT(), 0, W - ROAD_RIGHT(), H);

      // Road
      cx.fillStyle = "#c49a4a";
      cx.fillRect(ROAD_LEFT(), 0, ROAD_W(), H);

      // Lane dividers (dashed, scroll with dist)
      cx.strokeStyle = "rgba(90,58,26,0.35)"; cx.lineWidth = 2;
      const divX1 = ROAD_LEFT() + LANE_W();
      const divX2 = ROAD_LEFT() + LANE_W() * 2;
      const dashLen = 30; const gapLen = 20; const period = dashLen + gapLen;
      const offset = (G.dist * 4) % period;
      cx.setLineDash([dashLen, gapLen]);
      cx.lineDashOffset = -offset;
      cx.beginPath(); cx.moveTo(divX1, 0); cx.lineTo(divX1, H); cx.stroke();
      cx.beginPath(); cx.moveTo(divX2, 0); cx.lineTo(divX2, H); cx.stroke();
      cx.setLineDash([]);

      // Road edges
      cx.strokeStyle = "rgba(90,58,26,0.5)"; cx.lineWidth = 3;
      cx.beginPath(); cx.moveTo(ROAD_LEFT(), 0); cx.lineTo(ROAD_LEFT(), H); cx.stroke();
      cx.beginPath(); cx.moveTo(ROAD_RIGHT(), 0); cx.lineTo(ROAD_RIGHT(), H); cx.stroke();

      // Side palm trees (decorative, static)
      const palmPositions = [0.1, 0.35, 0.6, 0.85];
      for (const py of palmPositions) {
        for (const side of [ROAD_LEFT() / 2, ROAD_RIGHT() + (W - ROAD_RIGHT()) / 2]) {
          const ty = H * py;
          cx.fillStyle = "#5a3a1a"; cx.fillRect(side - 2, ty - 20, 4, 24);
          cx.fillStyle = "#3a7a28";
          cx.beginPath(); cx.arc(side, ty - 24, 10, 0, Math.PI * 2); cx.fill();
          cx.fillStyle = "#2a6a18";
          cx.beginPath(); cx.arc(side - 3, ty - 28, 7, 0, Math.PI * 2); cx.fill();
        }
      }
    }

    /* ---- draw player with LV trunk ---- */
    function drawPlayer() {
      const targetX = laneX(G.tgtLane);
      G.px = lerp(G.px, targetX, 0.18);
      const by = H * PLAYER_Y_RATIO + G.playerY;
      const bob = Math.sin(G.dist * 0.2) * 2 * (G.jmp ? 0 : 1);
      const legKick = Math.sin(G.dist * 0.3) * 6 * (G.jmp ? 0 : 1);
      const armSwing = Math.sin(G.dist * 0.3) * 8 * (G.jmp ? 0 : 1);

      cx.save();
      cx.translate(G.px, by + bob);

      // LV trunk on back (drawn behind player)
      cx.save();
      cx.translate(0, -28);
      cx.fillStyle = "#5c3a1e";
      cx.beginPath(); cx.roundRect(-18, -14, 36, 26, 3); cx.fill();
      cx.strokeStyle = "#d4a44a"; cx.lineWidth = 1.5; cx.stroke();
      cx.fillStyle = "#d4a44a";
      cx.fillRect(-16, -12, 32, 2.5);
      cx.fillRect(-16, 9, 32, 2.5);
      cx.fillRect(-16, -1, 32, 2);
      cx.font = "bold 9px sans-serif"; cx.textAlign = "center"; cx.fillStyle = "#d4a44a";
      cx.fillText("LV", 0, 6);
      cx.fillStyle = "#8b6914";
      cx.beginPath(); cx.roundRect(-4, -18, 8, 5, 2); cx.fill();
      cx.restore();

      // Head
      cx.fillStyle = "#f5d5a0";
      cx.beginPath(); cx.arc(0, -54, 10, 0, Math.PI * 2); cx.fill();
      // Hat
      cx.fillStyle = "#2a1a08";
      cx.fillRect(-12, -58, 24, 4);
      cx.fillRect(-7, -66, 14, 9);
      // Eyes
      cx.fillStyle = "#1a1008";
      cx.fillRect(-5, -55, 3, 2); cx.fillRect(2, -55, 3, 2);

      // Torso (safari jacket)
      cx.fillStyle = "#c49a4a";
      cx.fillRect(-12, -44, 24, 22);
      cx.fillStyle = "#a88030";
      cx.fillRect(-1, -44, 2, 22);
      cx.fillStyle = "#8b6914";
      cx.fillRect(-11, -38, 8, 6);
      cx.fillRect(3, -38, 8, 6);

      // Arms
      cx.fillStyle = "#c49a4a";
      cx.fillRect(-16, -42, 5, 14 + armSwing);
      cx.fillRect(11, -42, 5, 14 - armSwing);
      cx.fillStyle = "#f5d5a0";
      cx.fillRect(-16, -28 + armSwing, 5, 4);
      cx.fillRect(11, -28 - armSwing, 5, 4);

      // Legs
      cx.fillStyle = "#5c3a1e";
      cx.fillRect(-9, -22, 8, 18 + legKick);
      cx.fillRect(1, -22, 8, 18 - legKick);

      // Shoes
      cx.fillStyle = "#2a1a08";
      cx.fillRect(-10, -4 + legKick, 10, 5);
      cx.fillRect(1, -4 - legKick, 10, 5);

      cx.restore();
    }

    /* ---- LV-themed barricades (large, lane-based) ---- */
    function drawObstacle(o) {
      const x = laneX(o.lane);
      const y = o.screenY;
      const bw = LANE_W() * 0.82;
      const bh = 50;
      cx.save(); cx.translate(x, y);

      if (o.type === 0) {
        // LV monogram crate
        cx.fillStyle = "#5c3a1e";
        cx.beginPath(); cx.roundRect(-bw / 2, -bh, bw, bh, 4); cx.fill();
        cx.strokeStyle = "#d4a44a"; cx.lineWidth = 2; cx.stroke();
        cx.fillStyle = "#d4a44a";
        cx.fillRect(-bw / 2 + 4, -bh + 4, bw - 8, 3);
        cx.fillRect(-bw / 2 + 4, -5, bw - 8, 3);
        cx.font = "bold 14px sans-serif"; cx.textAlign = "center"; cx.fillStyle = "#d4a44a";
        cx.fillText("LV", 0, -bh / 2 + 6);
        // Monogram pattern
        cx.fillStyle = "rgba(212,164,74,0.25)";
        cx.font = "8px sans-serif";
        for (let r = 0; r < 2; r++) {
          for (let col = 0; col < 3; col++) {
            cx.fillText("✦", -bw / 3 + col * (bw / 3), -bh + 22 + r * 14);
          }
        }
      } else if (o.type === 1) {
        // Gold stanchion barrier
        cx.fillStyle = "#b8860b";
        cx.fillRect(-bw / 2, -bh * 0.6, 6, bh * 0.6);
        cx.fillRect(bw / 2 - 6, -bh * 0.6, 6, bh * 0.6);
        // Base plates
        cx.fillStyle = "#8b6914";
        cx.beginPath(); cx.ellipse(-bw / 2 + 3, 0, 10, 4, 0, 0, Math.PI * 2); cx.fill();
        cx.beginPath(); cx.ellipse(bw / 2 - 3, 0, 10, 4, 0, 0, Math.PI * 2); cx.fill();
        // Rope
        cx.strokeStyle = "#d4a44a"; cx.lineWidth = 3;
        cx.beginPath();
        cx.moveTo(-bw / 2 + 3, -bh * 0.5);
        cx.quadraticCurveTo(0, -bh * 0.3, bw / 2 - 3, -bh * 0.5);
        cx.stroke();
        // Knob tops
        cx.fillStyle = "#ffd700";
        cx.beginPath(); cx.arc(-bw / 2 + 3, -bh * 0.6, 5, 0, Math.PI * 2); cx.fill();
        cx.beginPath(); cx.arc(bw / 2 - 3, -bh * 0.6, 5, 0, Math.PI * 2); cx.fill();
      } else {
        // LV shopping bag barricade
        cx.fillStyle = "#f5e6c8";
        cx.beginPath(); cx.roundRect(-bw / 2, -bh, bw, bh, 2); cx.fill();
        cx.strokeStyle = "#5c3a1e"; cx.lineWidth = 1.5; cx.stroke();
        // Handles
        cx.strokeStyle = "#5c3a1e"; cx.lineWidth = 2;
        cx.beginPath(); cx.arc(-bw / 6, -bh, bw / 6, Math.PI, 0); cx.stroke();
        cx.beginPath(); cx.arc(bw / 6, -bh, bw / 6, Math.PI, 0); cx.stroke();
        // LV logo
        cx.fillStyle = "#5c3a1e";
        cx.font = "bold 16px sans-serif"; cx.textAlign = "center";
        cx.fillText("LV", 0, -bh / 2 + 8);
        cx.font = "7px sans-serif"; cx.fillStyle = "#8b6914";
        cx.fillText("LOUIS VUITTON", 0, -bh / 2 + 20);
      }
      cx.restore();
    }

    /* ---- luxury collectibles (lane-based) ---- */
    function drawCollectible(c) {
      const x = laneX(c.lane);
      const y = c.screenY;
      const float = Math.sin(G.dist * 0.08 + c.id) * 4;
      cx.save();
      cx.translate(x, y - 18 + float);

      switch (c.type) {
        case 0: // Handbag
          cx.fillStyle = "#5c3a1e"; cx.strokeStyle = "#d4a44a"; cx.lineWidth = 1.5;
          cx.beginPath(); cx.roundRect(-12, -8, 24, 18, 3); cx.fill(); cx.stroke();
          cx.strokeStyle = "#d4a44a"; cx.lineWidth = 2;
          cx.beginPath(); cx.arc(0, -8, 8, Math.PI, 0); cx.stroke();
          cx.fillStyle = "#d4a44a"; cx.font = "bold 7px sans-serif"; cx.textAlign = "center";
          cx.fillText("LV", 0, 5);
          break;
        case 1: // Heels
          cx.fillStyle = "#c62828";
          cx.beginPath(); cx.moveTo(-10, 2); cx.lineTo(-10, -4); cx.lineTo(8, -8); cx.lineTo(10, -6); cx.lineTo(10, 2); cx.closePath(); cx.fill();
          cx.fillStyle = "#8b0000"; cx.fillRect(7, -6, 3, 12);
          cx.fillStyle = "#ff5252"; cx.fillRect(-10, 2, 20, 2);
          cx.fillStyle = "#d4a44a"; cx.beginPath(); cx.arc(0, -3, 2, 0, Math.PI * 2); cx.fill();
          break;
        case 2: // Sunglasses
          cx.fillStyle = "#212121";
          cx.beginPath(); cx.ellipse(-7, 0, 7, 5, 0, 0, Math.PI * 2); cx.fill();
          cx.beginPath(); cx.ellipse(7, 0, 7, 5, 0, 0, Math.PI * 2); cx.fill();
          cx.strokeStyle = "#d4a44a"; cx.lineWidth = 1.5;
          cx.beginPath(); cx.moveTo(-1, -1); cx.lineTo(1, -1); cx.stroke();
          cx.beginPath(); cx.moveTo(-14, -2); cx.lineTo(-18, -4); cx.stroke();
          cx.beginPath(); cx.moveTo(14, -2); cx.lineTo(18, -4); cx.stroke();
          cx.fillStyle = "rgba(255,255,255,0.15)";
          cx.beginPath(); cx.ellipse(-7, -2, 3, 2, 0, 0, Math.PI * 2); cx.fill();
          break;
        case 3: // Perfume bottle
          cx.fillStyle = "#ce93d8";
          cx.beginPath(); cx.roundRect(-8, -4, 16, 18, 3); cx.fill();
          cx.fillStyle = "#9c27b0"; cx.fillRect(-4, -10, 8, 6);
          cx.fillRect(-1, -14, 2, 4);
          cx.fillStyle = "rgba(255,255,255,0.25)"; cx.fillRect(-6, 0, 12, 8);
          cx.fillStyle = "#9c27b0"; cx.font = "500 5px sans-serif"; cx.textAlign = "center";
          cx.fillText("LV", 0, 8);
          break;
        case 4: // Watch
          cx.strokeStyle = "#b8860b"; cx.lineWidth = 3;
          cx.beginPath(); cx.arc(0, 0, 9, 0, Math.PI * 2); cx.stroke();
          cx.fillStyle = "#ffeebb"; cx.beginPath(); cx.arc(0, 0, 8, 0, Math.PI * 2); cx.fill();
          cx.fillStyle = "#5c3a1e"; cx.fillRect(-3, -14, 6, 5); cx.fillRect(-3, 9, 6, 5);
          cx.strokeStyle = "#1a1a08"; cx.lineWidth = 1;
          cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, -5); cx.stroke();
          cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(4, 2); cx.stroke();
          cx.fillStyle = "#b8860b"; cx.beginPath(); cx.arc(0, 0, 1.5, 0, Math.PI * 2); cx.fill();
          break;
        case 5: // Necklace
          cx.strokeStyle = "#c0c0c0"; cx.lineWidth = 1.5;
          cx.beginPath(); cx.arc(0, -2, 12, Math.PI * 0.75, Math.PI * 0.25); cx.stroke();
          cx.fillStyle = "#ffd700";
          cx.beginPath(); cx.moveTo(0, 10); cx.lineTo(-6, 2); cx.lineTo(0, -4); cx.lineTo(6, 2); cx.closePath(); cx.fill();
          cx.fillStyle = "#fff"; cx.beginPath(); cx.arc(0, 1, 2, 0, Math.PI * 2); cx.fill();
          break;
      }
      cx.restore();
    }

    /* ---- particles ---- */
    function drawParticles() {
      for (const p of G.ptc) {
        cx.globalAlpha = p.l; cx.fillStyle = p.c;
        cx.fillRect(p.x - 3, p.y - 3, 6, 6);
      }
      cx.globalAlpha = 1;
    }

    /* ---- spawners (lane-based, screen-Y position) ---- */
    function spawnObs() {
      const lane = Math.floor(Math.random() * 3);
      for (const o of G.obs) { if (o.lane === lane && o.screenY < H * 0.35) return; }
      for (const c of G.col) { if (c.lane === lane && c.screenY < H * 0.35) return; }
      G.obs.push({ lane, type: Math.floor(Math.random() * 3), screenY: -60 });
    }

    function spawnCol() {
      const lane = Math.floor(Math.random() * 3);
      for (const o of G.obs) { if (o.lane === lane && o.screenY < H * 0.35) return; }
      for (const c of G.col) { if (c.lane === lane && c.screenY < H * 0.35) return; }
      G.col.push({
        lane,
        type: Math.floor(Math.random() * ITEM_TYPES.length),
        screenY: -60,
        id: Math.random() * 1000,
      });
    }

    function burst(x, y, color, n) {
      for (let i = 0; i < n; i++) {
        G.ptc.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 6 - 2, l: 1, c: color });
      }
    }

    /* ---- update ---- */
    function update(dt) {
      if (!G.run) return;
      const s = G.spd * dt * 60;
      G.dist += s;
      G.sc += Math.round(s * G.multi);
      G.spd = Math.min(1.0 + G.dist * 0.0001, 2.5);

      if (G.mTimer > 0) { G.mTimer -= dt; if (G.mTimer <= 0) G.multi = 1; }

      // Jump
      if (G.jmp) {
        G.jmpV += 600 * dt;
        G.playerY += G.jmpV * dt;
        if (G.playerY >= 0) { G.playerY = 0; G.jmp = false; G.jmpV = 0; }
      }

      // Smooth lane transition
      G.px = lerp(G.px, laneX(G.tgtLane), 10 * dt);

      // Spawn
      if (Math.random() < 0.025 * s) spawnObs();
      if (Math.random() < 0.035 * s) spawnCol();

      // Move objects downward (toward player)
      const ySpd = s * 2.0;
      for (const o of G.obs) o.screenY += ySpd;
      for (const c of G.col) c.screenY += ySpd;

      // Player hit box Y position
      const pY = H * PLAYER_Y_RATIO;

      // Collision with obstacles
      G.obs = G.obs.filter((o) => {
        if (Math.abs(o.screenY - pY) < 30 && o.lane === G.tgtLane && G.playerY > -40) {
          die(); return false;
        }
        return o.screenY < H + 80;
      });

      // Collision with collectibles
      G.col = G.col.filter((c) => {
        if (Math.abs(c.screenY - pY) < 30 && c.lane === G.tgtLane) {
          const cx2 = laneX(c.lane);
          const type = ITEM_TYPES[c.type];
          G.tk++;
          G.sc += 30 * G.multi;
          if (c.type === 0) {
            G.multi = Math.min(G.multi + 1, 5);
            G.mTimer = 5;
            burst(cx2, c.screenY - 15, "#d4a44a", 14);
          } else {
            burst(cx2, c.screenY - 15, type.accent, 10);
          }
          return false;
        }
        return c.screenY < H + 80;
      });

      // Particles
      G.ptc = G.ptc.filter((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 12 * dt; p.l -= 1.8 * dt;
        return p.l > 0;
      });

      scRef.current.textContent = G.sc;
      tkRef.current.textContent = G.tk;
      multRef.current.textContent = "x" + G.multi;
      multRef.current.style.color = G.multi > 1 ? "#ff6b35" : "#ffd700";
    }

    /* ---- draw ---- */
    function draw() {
      cx.clearRect(0, 0, W, H);
      drawBackground();

      // Sort by screenY so higher items draw first
      const all = [
        ...G.obs.map((o) => ({ ...o, kind: "o" })),
        ...G.col.map((c) => ({ ...c, kind: "c" })),
      ];
      all.sort((a, b) => a.screenY - b.screenY);
      for (const item of all) {
        if (item.screenY < -80) continue;
        if (item.kind === "o") drawObstacle(item);
        else drawCollectible(item);
      }
      drawPlayer();
      drawParticles();

      // Multiplier bar
      if (G.mTimer > 0) {
        cx.fillStyle = "rgba(212,164,74,0.25)";
        cx.fillRect(0, H - 5, W * (G.mTimer / 5), 5);
      }
    }

    function die() {
      G.run = false;
      if (G.sc > G.best) G.best = G.sc;
      fsRef.current.textContent = "Score: " + G.sc + (G.sc >= G.best ? " (New best!)" : "");
      ftRef.current.textContent = G.tk + " LV items collected";
      const h = "0x" + Array.from({ length: 10 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      nftRef.current.textContent = G.tk >= 3 ? "NFT minted: " + h : "Collect 3+ handbags to mint a run NFT";
      overRef.current.style.display = "flex";
    }

    function start() {
      G.run = true; G.sc = 0; G.tk = 0; G.spd = 1.0;
      G.lane = 1; G.tgtLane = 1;
      G.px = laneX(1); G.playerY = 0; G.jmpV = 0; G.jmp = false;
      G.obs = []; G.col = []; G.ptc = [];
      G.dist = 0; G.best = G.best || 0; G.multi = 1; G.mTimer = 0;
      splashRef.current.style.display = "none";
      overRef.current.style.display = "none";
    }

    playBtnRef.current.onclick = start;
    retryRef.current.onclick = start;

    /* ---- touch controls (swipe) ---- */
    let tx0 = 0, ty0 = 0, t0 = 0;
    wr.addEventListener("touchstart", (e) => {
      e.preventDefault();
      tx0 = e.touches[0].clientX;
      ty0 = e.touches[0].clientY;
      t0 = Date.now();
    }, { passive: false });
    wr.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (!G.run) return;
      const dx = e.changedTouches[0].clientX - tx0;
      const dy = e.changedTouches[0].clientY - ty0;
      const elapsed = Date.now() - t0;
      // Tap: use side of screen
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20 && elapsed < 300) {
        const rect = wr.getBoundingClientRect();
        const rx = e.changedTouches[0].clientX - rect.left;
        if (rx < W / 3 && G.tgtLane > 0) G.tgtLane--;
        else if (rx > (W * 2) / 3 && G.tgtLane < 2) G.tgtLane++;
        return;
      }
      // Swipe
      if (Math.abs(dy) > Math.abs(dx) && dy < -30) {
        if (!G.jmp) { G.jmp = true; G.jmpV = -300; }
      } else if (dx > 30 && G.tgtLane < 2) G.tgtLane++;
      else if (dx < -30 && G.tgtLane > 0) G.tgtLane--;
    }, { passive: false });

    /* ---- keyboard ---- */
    function handleKeydown(e) {
      if (!G.run) return;
      if (e.key === "ArrowLeft" && G.tgtLane > 0) G.tgtLane--;
      if (e.key === "ArrowRight" && G.tgtLane < 2) G.tgtLane++;
      if ((e.key === "ArrowUp" || e.key === " ") && !G.jmp) { G.jmp = true; G.jmpV = -300; }
    }
    document.addEventListener("keydown", handleKeydown);

    let last = 0;
    let animId;
    function loop(ts) {
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      update(dt);
      draw();
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame((ts) => { last = ts; loop(ts); });

    return () => {
      window.removeEventListener("resize", sz);
      document.removeEventListener("keydown", handleKeydown);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative", width: "100%", maxWidth: 440, margin: "0 auto",
        aspectRatio: "9/16", borderRadius: "var(--border-radius-lg)",
        overflow: "hidden", touchAction: "none", userSelect: "none", background: "#d4a44a",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

      {/* HUD */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, padding: "12px 16px",
        display: "flex", justifyContent: "space-between", pointerEvents: "none",
        fontFamily: "var(--font-sans)",
      }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>SCORE</div>
          <div ref={scRef} style={{ fontSize: 22, fontWeight: 500, color: "#fff" }}>0</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>MULTIPLIER</div>
          <div ref={multRef} style={{ fontSize: 22, fontWeight: 500, color: "#ffd700" }}>x1</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>LV ITEMS</div>
          <div ref={tkRef} style={{ fontSize: 22, fontWeight: 500, color: "#ffd700" }}>0</div>
        </div>
      </div>

      {/* Splash */}
      <div ref={splashRef} style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "rgba(42,26,8,0.92)", zIndex: 5,
      }}>
        <div style={{ fontFamily: "var(--font-serif)", color: "#d4a44a", fontSize: 11, letterSpacing: 8, marginBottom: 2 }}>LOUIS VUITTON</div>
        <div style={{ fontFamily: "var(--font-serif)", color: "#f5e6c8", fontSize: 26, letterSpacing: 2, marginBottom: 28 }}>Safari runner</div>
        <div ref={playBtnRef} style={{
          width: 64, height: 64, borderRadius: "50%", border: "2px solid #d4a44a",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", pointerEvents: "auto",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#d4a44a"><polygon points="8,5 19,12 8,19" /></svg>
        </div>
        <div style={{ marginTop: 20, fontFamily: "var(--font-sans)", color: "rgba(245,230,200,0.5)", fontSize: 12 }}>Swipe left/right or tap sides to switch lanes</div>
        <div style={{ fontFamily: "var(--font-sans)", color: "rgba(245,230,200,0.5)", fontSize: 12 }}>Swipe up to jump &bull; Collect luxury items</div>
      </div>

      {/* Game Over */}
      <div ref={overRef} style={{
        position: "absolute", inset: 0, display: "none", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "rgba(42,26,8,0.92)",
        zIndex: 5, fontFamily: "var(--font-sans)",
      }}>
        <div style={{ fontFamily: "var(--font-serif)", color: "#d4a44a", fontSize: 22, marginBottom: 12 }}>Run complete</div>
        <div ref={fsRef} style={{ color: "#f5e6c8", fontSize: 16, marginBottom: 4 }}></div>
        <div ref={ftRef} style={{ color: "#d4a44a", fontSize: 14, marginBottom: 6 }}></div>
        <div ref={nftRef} style={{ color: "rgba(245,230,200,0.4)", fontSize: 11, marginBottom: 28 }}></div>
        <div ref={retryRef} style={{
          padding: "10px 28px", border: "1px solid #d4a44a", borderRadius: 24,
          color: "#d4a44a", fontSize: 14, cursor: "pointer", pointerEvents: "auto",
        }}>Run again</div>
      </div>
    </div>
  );
}
