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

    const MARGIN = 30;
    const ITEM_TYPES = [
      { name: "handbag", accent: "#d4a44a" },
      { name: "heels", accent: "#ff5252" },
      { name: "sunglasses", accent: "#616161" },
      { name: "perfume", accent: "#7b1fa2" },
      { name: "watch", accent: "#b8860b" },
      { name: "necklace", accent: "#ffd700" },
    ];

    const G = {
      run: false, sc: 0, tk: 0, spd: 2.5,
      px: 0, py: 0,
      obs: [], col: [], ptc: [],
      best: 0, multi: 1, mTimer: 0,
      keys: { up: false, down: false, left: false, right: false },
      touchDir: { x: 0, y: 0 },
      walkCycle: 0,
    };

    /* ---- static background ---- */
    function drawBackground() {
      cx.fillStyle = "#e8c872";
      cx.fillRect(0, 0, W, H);
      cx.fillStyle = "rgba(210,170,80,0.3)";
      for (let i = 0; i < 30; i++) {
        const x = (i * 137 + 50) % W;
        const y = (i * 191 + 80) % H;
        cx.beginPath(); cx.arc(x, y, 15 + (i % 5) * 5, 0, Math.PI * 2); cx.fill();
      }
      cx.fillStyle = "#c49a4a";
      cx.fillRect(W * 0.15, 0, W * 0.7, H);
      cx.strokeStyle = "rgba(90,58,26,0.3)"; cx.lineWidth = 2;
      cx.beginPath(); cx.moveTo(W * 0.15, 0); cx.lineTo(W * 0.15, H); cx.stroke();
      cx.beginPath(); cx.moveTo(W * 0.85, 0); cx.lineTo(W * 0.85, H); cx.stroke();
      cx.fillStyle = "#6b8040";
      for (let i = 0; i < 4; i++) {
        const y = H * 0.15 + i * H * 0.22;
        cx.beginPath(); cx.arc(W * 0.07, y, 10, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = "#5a3a1a"; cx.fillRect(W * 0.07 - 2, y, 4, 12); cx.fillStyle = "#6b8040";
      }
      for (let i = 0; i < 4; i++) {
        const y = H * 0.25 + i * H * 0.22;
        cx.beginPath(); cx.arc(W * 0.93, y, 10, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = "#5a3a1a"; cx.fillRect(W * 0.93 - 2, y, 4, 12); cx.fillStyle = "#6b8040";
      }
      cx.fillStyle = "#e8a832"; cx.beginPath(); cx.arc(W * 0.85, 35, 15, 0, Math.PI * 2); cx.fill();
    }

    /* ---- player ---- */
    function drawPlayer() {
      const moving = G.keys.up || G.keys.down || G.keys.left || G.keys.right ||
        G.touchDir.x !== 0 || G.touchDir.y !== 0;
      const legKick = moving ? Math.sin(G.walkCycle) * 6 : 0;
      const armSwing = moving ? Math.sin(G.walkCycle) * 8 : 0;

      cx.save(); cx.translate(G.px, G.py);
      cx.fillStyle = "#f5d5a0"; cx.beginPath(); cx.arc(0, -52, 10, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = "#2a1a08"; cx.fillRect(-12, -48, 24, 5); cx.fillRect(-6, -56, 12, 8);
      cx.fillStyle = "#5c3a1e"; cx.fillRect(-12, -40, 24, 20);
      cx.fillStyle = "#d4a44a"; cx.fillRect(-12, -40, 24, 3); cx.fillRect(-12, -23, 24, 3);
      cx.font = "500 7px sans-serif"; cx.textAlign = "center"; cx.fillText("LV", 0, -28);
      cx.fillStyle = "#1a1008";
      cx.fillRect(-8, -20, 7, 16 + legKick); cx.fillRect(1, -20, 7, 16 - legKick);
      cx.fillStyle = "#f5d5a0";
      cx.fillRect(-15, -38, 5, 12 + armSwing); cx.fillRect(10, -38, 5, 12 - armSwing);
      cx.fillStyle = "#8b6914"; cx.fillRect(-8, -4, 7, 4); cx.fillRect(1, -4, 7, 4);
      cx.restore();
    }

    /* ---- luxury item drawing ---- */
    function drawItem(c) {
      const float = Math.sin(Date.now() * 0.003 + c.id) * 3;
      cx.save(); cx.translate(c.x, c.y + float);
      switch (c.type) {
        case 0: // Handbag
          cx.fillStyle = "#5c3a1e"; cx.strokeStyle = "#d4a44a"; cx.lineWidth = 1.5;
          cx.beginPath(); cx.roundRect(-12, -8, 24, 18, 3); cx.fill(); cx.stroke();
          cx.strokeStyle = "#d4a44a"; cx.lineWidth = 2;
          cx.beginPath(); cx.arc(0, -8, 8, Math.PI, 0); cx.stroke();
          cx.fillStyle = "#d4a44a"; cx.font = "600 7px sans-serif"; cx.textAlign = "center"; cx.fillText("LV", 0, 5);
          break;
        case 1: // Heels
          cx.fillStyle = "#c62828";
          cx.beginPath(); cx.moveTo(-12, 0); cx.lineTo(-12, -5); cx.lineTo(8, -10); cx.lineTo(12, -8); cx.lineTo(12, 0); cx.closePath(); cx.fill();
          cx.fillRect(8, -8, 3, 14);
          cx.fillStyle = "#ff5252"; cx.fillRect(-12, 0, 24, 3);
          break;
        case 2: // Sunglasses
          cx.fillStyle = "#1a1a1a";
          cx.beginPath(); cx.ellipse(-7, 0, 7, 5, 0, 0, Math.PI * 2); cx.fill();
          cx.beginPath(); cx.ellipse(7, 0, 7, 5, 0, 0, Math.PI * 2); cx.fill();
          cx.strokeStyle = "#1a1a1a"; cx.lineWidth = 2;
          cx.beginPath(); cx.moveTo(-1, -1); cx.lineTo(1, -1); cx.stroke();
          cx.beginPath(); cx.moveTo(-14, -2); cx.lineTo(-18, -4); cx.stroke();
          cx.beginPath(); cx.moveTo(14, -2); cx.lineTo(18, -4); cx.stroke();
          cx.fillStyle = "rgba(255,255,255,0.2)";
          cx.beginPath(); cx.ellipse(-7, -2, 3, 2, 0, 0, Math.PI * 2); cx.fill();
          cx.beginPath(); cx.ellipse(7, -2, 3, 2, 0, 0, Math.PI * 2); cx.fill();
          break;
        case 3: // Perfume
          cx.fillStyle = "#ce93d8"; cx.beginPath(); cx.roundRect(-8, -4, 16, 18, 3); cx.fill();
          cx.fillStyle = "#7b1fa2"; cx.fillRect(-4, -10, 8, 6); cx.fillRect(-1, -13, 2, 3);
          cx.fillStyle = "rgba(255,255,255,0.3)"; cx.fillRect(-6, 0, 12, 8);
          cx.fillStyle = "#7b1fa2"; cx.font = "500 5px sans-serif"; cx.textAlign = "center"; cx.fillText("LV", 0, 7);
          break;
        case 4: // Watch
          cx.fillStyle = "#ffd700"; cx.beginPath(); cx.arc(0, 0, 10, 0, Math.PI * 2); cx.fill();
          cx.strokeStyle = "#b8860b"; cx.lineWidth = 2; cx.stroke();
          cx.fillStyle = "#5c3a1e"; cx.fillRect(-4, -16, 8, 6); cx.fillRect(-4, 10, 8, 6);
          cx.strokeStyle = "#1a1a08"; cx.lineWidth = 1;
          cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, -6); cx.stroke();
          cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(4, 2); cx.stroke();
          cx.fillStyle = "#b8860b"; cx.beginPath(); cx.arc(0, 0, 1.5, 0, Math.PI * 2); cx.fill();
          break;
        case 5: // Necklace
          cx.strokeStyle = "#e0e0e0"; cx.lineWidth = 2;
          cx.beginPath(); cx.arc(0, -4, 12, Math.PI * 0.8, Math.PI * 0.2); cx.stroke();
          cx.fillStyle = "#ffd700";
          cx.beginPath(); cx.moveTo(0, 8); cx.lineTo(-6, 0); cx.lineTo(0, -4); cx.lineTo(6, 0); cx.closePath(); cx.fill();
          cx.fillStyle = "rgba(255,255,255,0.6)"; cx.beginPath(); cx.arc(-1, -1, 2, 0, Math.PI * 2); cx.fill();
          break;
      }
      cx.restore();
    }

    /* ---- obstacles ---- */
    function drawObstacle(o) {
      cx.save(); cx.translate(o.x, o.y);
      if (o.type === 0) {
        cx.fillStyle = "#888070";
        cx.beginPath(); cx.moveTo(-18, 5); cx.lineTo(-10, -18); cx.lineTo(8, -22); cx.lineTo(20, 5); cx.closePath(); cx.fill();
        cx.fillStyle = "#706858";
        cx.beginPath(); cx.moveTo(-10, -18); cx.lineTo(8, -22); cx.lineTo(20, 5); cx.lineTo(2, 5); cx.closePath(); cx.fill();
      } else if (o.type === 1) {
        cx.fillStyle = "#4a7030"; cx.beginPath(); cx.ellipse(0, -8, 20, 14, 0, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = "#3a5820"; cx.beginPath(); cx.ellipse(-5, -12, 12, 9, 0, 0, Math.PI * 2); cx.fill();
      } else {
        cx.fillStyle = "#7a5a2a"; cx.fillRect(-3, -40, 6, 40);
        cx.fillStyle = "#5a8030"; cx.beginPath(); cx.arc(0, -40, 16, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = "#4a6820"; cx.beginPath(); cx.arc(-6, -44, 10, 0, Math.PI * 2); cx.fill();
      }
      cx.restore();
    }

    /* ---- particles ---- */
    function drawParticles() {
      for (const p of G.ptc) { cx.globalAlpha = p.l; cx.fillStyle = p.c; cx.fillRect(p.x - 3, p.y - 3, 6, 6); }
      cx.globalAlpha = 1;
    }

    /* ---- spawners ---- */
    function spawnItems(count) {
      for (let i = 0; i < count; i++) {
        let x, y, ok, attempts = 0;
        do {
          ok = true;
          x = MARGIN + Math.random() * (W - MARGIN * 2);
          y = MARGIN + 60 + Math.random() * (H - MARGIN * 2 - 100);
          for (const c of G.col) { if (Math.abs(c.x - x) < 35 && Math.abs(c.y - y) < 35) { ok = false; break; } }
          for (const o of G.obs) { if (Math.abs(o.x - x) < 35 && Math.abs(o.y - y) < 35) { ok = false; break; } }
          if (Math.abs(x - W / 2) < 40 && Math.abs(y - H * 0.8) < 40) ok = false;
          attempts++;
        } while (!ok && attempts < 30);
        if (ok) G.col.push({ x, y, type: Math.floor(Math.random() * ITEM_TYPES.length), id: Math.random() * 1000 });
      }
    }

    function spawnObstacles(count) {
      for (let i = 0; i < count; i++) {
        let x, y, ok, attempts = 0;
        do {
          ok = true;
          x = MARGIN + Math.random() * (W - MARGIN * 2);
          y = MARGIN + 60 + Math.random() * (H - MARGIN * 2 - 100);
          for (const c of G.col) { if (Math.abs(c.x - x) < 40 && Math.abs(c.y - y) < 40) { ok = false; break; } }
          for (const o of G.obs) { if (Math.abs(o.x - x) < 40 && Math.abs(o.y - y) < 40) { ok = false; break; } }
          if (Math.abs(x - W / 2) < 40 && Math.abs(y - H * 0.8) < 40) ok = false;
          attempts++;
        } while (!ok && attempts < 30);
        if (ok) G.obs.push({ x, y, type: Math.floor(Math.random() * 3) });
      }
    }

    function burst(x, y, color, n) {
      for (let i = 0; i < n; i++) {
        G.ptc.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 6 - 2, l: 1, c: color });
      }
    }

    /* ---- update ---- */
    let spawnTimer = 0;
    function update(dt) {
      if (!G.run) return;
      let dx = 0, dy = 0;
      if (G.keys.left) dx -= 1;
      if (G.keys.right) dx += 1;
      if (G.keys.up) dy -= 1;
      if (G.keys.down) dy += 1;
      if (G.touchDir.x !== 0 || G.touchDir.y !== 0) { dx += G.touchDir.x; dy += G.touchDir.y; }
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 1) { dx /= len; dy /= len; }
      const moving = len > 0;
      const speed = G.spd * dt * 60;
      G.px += dx * speed;
      G.py += dy * speed;
      G.px = Math.max(MARGIN, Math.min(W - MARGIN, G.px));
      G.py = Math.max(MARGIN + 40, Math.min(H - MARGIN, G.py));
      if (moving) G.walkCycle += dt * 12;

      if (G.mTimer > 0) { G.mTimer -= dt; if (G.mTimer <= 0) G.multi = 1; }

      G.col = G.col.filter((c) => {
        if (Math.abs(c.x - G.px) < 22 && Math.abs(c.y - G.py) < 22) {
          const type = ITEM_TYPES[c.type];
          if (c.type === 0) { G.tk++; G.multi = Math.min(G.multi + 1, 5); G.mTimer = 4; }
          G.sc += 25 * G.multi;
          burst(c.x, c.y, type.accent, 10);
          return false;
        }
        return true;
      });

      for (const o of G.obs) {
        const hitR = o.type === 2 ? 14 : 18;
        if (Math.abs(o.x - G.px) < hitR && Math.abs(o.y - G.py) < hitR) { die(); return; }
      }

      if (G.col.length < 3) spawnItems(3);
      spawnTimer += dt;
      if (spawnTimer > 8 && G.obs.length < 12) { spawnObstacles(1); spawnTimer = 0; }

      G.ptc = G.ptc.filter((p) => { p.x += p.vx; p.y += p.vy; p.vy += 12 * dt; p.l -= 1.8 * dt; return p.l > 0; });

      scRef.current.textContent = G.sc;
      tkRef.current.textContent = G.tk;
      multRef.current.textContent = "x" + G.multi;
      multRef.current.style.color = G.multi > 1 ? "#ff6b35" : "#ffd700";
    }

    /* ---- draw ---- */
    function draw() {
      cx.clearRect(0, 0, W, H);
      drawBackground();
      for (const o of G.obs) drawObstacle(o);
      for (const c of G.col) drawItem(c);
      drawPlayer();
      drawParticles();
      if (G.mTimer > 0) { cx.fillStyle = "rgba(212,164,74,0.15)"; cx.fillRect(0, H - 4, W * (G.mTimer / 4), 4); }
    }

    function die() {
      G.run = false;
      if (G.sc > G.best) G.best = G.sc;
      fsRef.current.textContent = "Score: " + G.sc + (G.sc >= G.best ? " (New best!)" : "");
      ftRef.current.textContent = G.tk + " LV handbags collected";
      const h = "0x" + Array.from({ length: 10 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      nftRef.current.textContent = G.tk >= 3 ? "NFT minted: " + h : "Collect 3+ handbags to mint a run NFT";
      overRef.current.style.display = "flex";
    }

    function start() {
      G.run = true; G.sc = 0; G.tk = 0; G.spd = 2.5;
      G.px = W / 2; G.py = H * 0.8;
      G.obs = []; G.col = []; G.ptc = [];
      G.best = G.best || 0; G.multi = 1; G.mTimer = 0; G.walkCycle = 0;
      G.keys = { up: false, down: false, left: false, right: false };
      G.touchDir = { x: 0, y: 0 };
      spawnTimer = 0;
      spawnItems(5);
      spawnObstacles(4);
      splashRef.current.style.display = "none";
      overRef.current.style.display = "none";
    }

    playBtnRef.current.onclick = start;
    retryRef.current.onclick = start;

    /* ---- touch: drag-direction movement ---- */
    let tx0 = 0, ty0 = 0, touching = false;
    wr.addEventListener("touchstart", (e) => {
      e.preventDefault(); touching = true;
      tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY;
      G.touchDir = { x: 0, y: 0 };
    }, { passive: false });
    wr.addEventListener("touchmove", (e) => {
      e.preventDefault(); if (!touching) return;
      const dx = e.touches[0].clientX - tx0;
      const dy = e.touches[0].clientY - ty0;
      const l = Math.sqrt(dx * dx + dy * dy);
      G.touchDir = l > 10 ? { x: dx / l, y: dy / l } : { x: 0, y: 0 };
    }, { passive: false });
    wr.addEventListener("touchend", (e) => {
      e.preventDefault(); touching = false; G.touchDir = { x: 0, y: 0 };
    }, { passive: false });

    /* ---- keyboard ---- */
    function handleKeydown(e) {
      if (!G.run) return;
      if (e.key === "ArrowLeft") G.keys.left = true;
      if (e.key === "ArrowRight") G.keys.right = true;
      if (e.key === "ArrowUp") G.keys.up = true;
      if (e.key === "ArrowDown") G.keys.down = true;
    }
    function handleKeyup(e) {
      if (e.key === "ArrowLeft") G.keys.left = false;
      if (e.key === "ArrowRight") G.keys.right = false;
      if (e.key === "ArrowUp") G.keys.up = false;
      if (e.key === "ArrowDown") G.keys.down = false;
    }
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("keyup", handleKeyup);

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
      document.removeEventListener("keyup", handleKeyup);
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
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>LV BAGS</div>
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
        <div style={{ marginTop: 20, fontFamily: "var(--font-sans)", color: "rgba(245,230,200,0.5)", fontSize: 12 }}>Arrow keys or swipe to move</div>
        <div style={{ fontFamily: "var(--font-sans)", color: "rgba(245,230,200,0.5)", fontSize: 12 }}>Collect luxury items, avoid obstacles</div>
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
