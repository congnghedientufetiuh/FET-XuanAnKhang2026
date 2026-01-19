// app.js – Xuân An Khang 2025
// UI đẹp + Nền + Petals + Fireworks + Nhạc toggle + Flow 4 màn

let threeInited = false;

window.addEventListener("load", async () => {
  /* ===== 1. KHỞI TẠO DOM ELEMENTS ===== */
  const screens = {
    gate: document.getElementById("gate"),
    auth: document.getElementById("auth"),
    scene: document.getElementById("scene"),
    thanks: document.getElementById("thanks"),
  };

  const btnStart = document.getElementById("btnStart");
  const btnBackToGate = document.getElementById("btnBackToGate");
  const btnCheck = document.getElementById("btnCheck");

  const inputName = document.getElementById("inputName");
  const inputId = document.getElementById("inputId");
  const authMsg = document.getElementById("authMsg");

  const btnToThanks = document.getElementById("btnToThanks");
  const btnReplay = document.getElementById("btnReplay");
  const btnBackToScene = document.getElementById("btnBackToScene");

  const musicToggle = document.getElementById("musicToggle");
  const bgm = document.getElementById("bgm");

  // Scene profile
  const soldierAvatar = document.getElementById("soldierAvatar");
  const soldierName = document.getElementById("soldierName");
  const soldierId = document.getElementById("soldierId");
  const soldierGoal = document.getElementById("soldierGoal");
  const soldierMessage = document.getElementById("soldierMessage");

  const btnOpenMemory = document.getElementById("btnOpenMemory");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const galleryTrack = document.getElementById("galleryTrack");

  // Overlay
  const overlay = document.getElementById("overlay");
  const btnCloseOverlay = document.getElementById("btnCloseOverlay");
  const ovAvatar = document.getElementById("ovAvatar");
  const ovName = document.getElementById("ovName");
  const ovId = document.getElementById("ovId");
  const ovGoal = document.getElementById("ovGoal");
  const ovMsg2030 = document.getElementById("ovMsg2030");
  const ovGallery = document.getElementById("ovGallery");

  const petalsGate = document.getElementById("petalsGate");
  const petalsAuth = document.getElementById("petalsAuth");

  // Fireworks
  const fxCanvasGate = document.getElementById("fireworksCanvas");
  const fxCanvasAuth = document.getElementById("fireworksCanvasAuth");
  const fxCanvasScene = document.getElementById("fireworksCanvasScene");
  const fxGate = makeFireworks(fxCanvasGate);
  const fxAuth = makeFireworks(fxCanvasAuth);
  const fxScene = makeFireworks(fxCanvasScene);
  /* ===== 2. HÀM HỖ TRỢ (HELPERS) ===== */
  function showScreen(key) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[key].classList.add("active");

    if (key === "gate" || key === "auth") {
      fxGate.start();
      fxAuth.start();

      // 🎵 Bật lại nhạc cổng
      if (bgm && musicEnabled) {
        bgm.muted = false;
        bgm.play().catch(() => {});
      }
    } 
    else if (key === "scene") {
      fxGate.stop();
      fxAuth.stop();
      fxScene.start();
      
      // 🔇 TẮT NHẠC CỔNG TRƯỚC KHI VÀO SCENE
      if (bgm) {
        bgm.pause();
        bgm.currentTime = 0;
      }

      if (!threeInited) {
        initThreeScene(document.getElementById("threeCanvas"));
        threeInited = true;
      }
      // 🔥 BẬT NHẠC SCENE MỖI LẦN VÀO
      if (window.threeAudio) {
        window.threeAudio.currentTime = 0;
        window.threeAudio.play().catch(() => {});
      }
      createGalleryCarousel(scene3D.scene, currentSoldier.gallery || []);

      requestAnimationFrame(() => {
        createSoldierCard(scene3D.scene, currentSoldier, () => {
          openMemory(currentSoldier);
        });
      });
    } 
    else if (key === "thanks") {
      initThanksPage(currentSoldier);
    }
    else {
      fxGate.stop();
      fxAuth.stop();
    }
  }

  function normalizeText(text) {
    return (text || "").toLowerCase().trim().replace(/\s+/g, " ");
  }

  function safeText(text, fallback = "—") {
    const t = (text ?? "").toString().trim();
    return t.length ? t : fallback;
  }

  function setImgSafe(imgEl, src) {
    imgEl.src = src || "";
    imgEl.onerror = () => {
      imgEl.onerror = null;
      imgEl.removeAttribute("src");
    };
  }

  /* ===== 3. TẢI DỮ LIỆU SOLDIERS ===== */
  let soldiers = [];
  let currentSoldier = null;

  try {
    const res = await fetch("data/soldiers.json");
    soldiers = await res.json();
    console.log("✅ soldiers loaded:", soldiers.length);
  } catch (e) {
    console.error("❌ Không load được soldiers.json", e);
  }

  /* ===== 4. QUẢN LÝ NHẠC NỀN (BGM) ===== */
  let musicEnabled = false;

  if (bgm) {
    bgm.volume = 0.6;
    bgm.muted = true;
    bgm.loop = true;
    bgm.pause();
    bgm.currentTime = 0;
  }

  function updateMusicUI() {
    if (!musicToggle) return;
    if (musicEnabled) {
      musicToggle.textContent = "🔊";
      musicToggle.classList.add("playing");
      musicToggle.classList.remove("muted");
    } else {
      musicToggle.textContent = "🔇";
      musicToggle.classList.remove("playing");
      musicToggle.classList.add("muted");
    }
  }
  updateMusicUI();

  function enableSound() {
    if (!bgm) return;
    bgm.muted = false;
    bgm.play().catch(() => {});
    musicEnabled = true;
    updateMusicUI();
  }

  function disableSound() {
    if (!bgm) return;
    bgm.muted = true;
    musicEnabled = false;
    updateMusicUI();
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", () => {
      if (!bgm) return;
      if (!musicEnabled) enableSound();
      else disableSound();
    });
  }

  // Click đầu tiên: bật tiếng (nếu user muốn)
  let firstInteractionDone = false;
  document.addEventListener("click", () => {
      if (firstInteractionDone) return;
      firstInteractionDone = true;

      if (bgm) {
        bgm.muted = false;
        bgm.currentTime = 0;
        bgm.play();
        musicEnabled = true;
        updateMusicUI();
      }
    },
    { once: true }
  );

  /* ===== 5. HIỆU ỨNG HOA RƠI (PETALS) ===== */
  spawnPetals(petalsGate, 80); // Tăng/giảm số lượng hoa mai rơi
  spawnPetals(document.getElementById("petalsScene"), 50); // Tăng/giảm số lượng hoa đào rơi
  spawnPetals(petalsAuth, 80);

  /* ===== 6. ĐIỀU HƯỚNG & XÁC THỰC (NAVIGATION & AUTH) ===== */
  btnStart.addEventListener("click", () => {
    showScreen("auth");
    authMsg.textContent = "";
    setTimeout(() => inputName.focus(), 80);
  });

  btnBackToGate.addEventListener("click", () => showScreen("gate"));

  btnCheck.addEventListener("click", () => {
    const nameInput = normalizeText(inputName.value);
    const idInput = (inputId.value || "").trim();

    if (!nameInput || !idInput) {
      authMsg.textContent = "Bạn vui lòng nhập đầy đủ Họ tên và MSSV nhé 🌸";
      return;
    }

    const found = soldiers.find(
      (s) => (s.id || "") === idInput && normalizeText(s.name) === nameInput
    );

    if (!found) {
      authMsg.textContent = "Thông tin chưa khớp 😥 Bạn kiểm tra lại nhé!";
      return;
    }

    currentSoldier = found;
    authMsg.textContent = "Đúng rồi! Cổng Xuân đang mở ra… ✨";

    setTimeout(() => {
      showScreen("scene");
      renderScene(currentSoldier);
    }, 650);
  });

  [inputName, inputId].forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btnCheck.click();
    });
  });

  btnToThanks?.addEventListener("click", () => showScreen("thanks"));
  btnBackToScene?.addEventListener("click", () => {showScreen("scene") });
  btnReplay?.addEventListener("click", () => {
    if (typeof stopThreeAudio === "function") {
      stopThreeAudio();
    }
    currentSoldier = null;
    inputName.value = "";
    inputId.value = "";
    authMsg.textContent = "";
    closeOverlay();
    showScreen("gate");
  });

  /* ===== 7. QUẢN LÝ OVERLAY ===== */
  btnOpenMemory?.addEventListener("click", () => {
    if (!currentSoldier) return;
    openMemory(currentSoldier);
  });

  btnCloseOverlay?.addEventListener("click", closeOverlay);
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

  function openMemory(s) {
    setImgSafe(ovAvatar, s.avatar);
    ovName.textContent = safeText(s.name);
    ovId.textContent = `MSSV/MSNS: ${safeText(s.id)}`;
    ovGoal.textContent = safeText(s.goal2026);
    ovMsg2030.textContent = safeText(s.message2030);

    ovGallery.innerHTML = "";

    const imgs = Array.isArray(s.gallery) ? s.gallery : [];

    if (imgs.length === 0) {
      const div = document.createElement("div");
      div.className = "ov-text";
      div.textContent = "Chưa có ảnh hoạt động.";
      ovGallery.appendChild(div);
    } else {
      imgs.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.loading = "lazy";

        img.addEventListener("click", (e) => {
          e.stopPropagation(); // 🔥 bắt buộc
          zoomImage(src);
        });

        img.onerror = () => img.remove();
        ovGallery.appendChild(img);
      });
  }

  overlay.classList.remove("hidden");
}


  function closeOverlay() {
    overlay.classList.add("hidden");
  }

  /* ===== 8. RENDER SCENE & GALLERY ===== */
  let typingTimer = null;

  function renderScene(s) {
    // Avatar & Info
    setImgSafe(soldierAvatar, s.avatar);
    soldierName.textContent = safeText(s.name);
    soldierId.textContent = `MSSV/MSNS: ${safeText(s.id)}`;
    soldierGoal.textContent = safeText(s.goal2026);

    // Typing message effect
    const full = safeText(s.message2030, "");
    soldierMessage.textContent = "";
    if (typingTimer) clearInterval(typingTimer);

    let i = 0;
    typingTimer = setInterval(() => {
      soldierMessage.textContent = full.slice(0, i);
      i += Math.max(1, Math.floor(full.length / 180));
      if (i >= full.length + 1) {
        soldierMessage.textContent = full;
        clearInterval(typingTimer);
        typingTimer = null;
      }
    }, 35);

    // Gallery Render
    galleryTrack.innerHTML = "";
    const imgs = Array.isArray(s.gallery) ? s.gallery : [];
    const list = imgs.length ? imgs : makePlaceholders(8);

    list.forEach((src, idx) => {
      const item = document.createElement("div");
      item.className = "g-item";
      
      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      img.onerror = () => {
        img.remove();
        item.innerHTML = `<div class="cap">Ảnh #${idx + 1} (chưa có)</div>`;
      };
      
      const cap = document.createElement("div");
      cap.className = "cap";
      cap.textContent = `Khoảnh khắc #${idx + 1}`;

      item.appendChild(img);
      item.appendChild(cap);
      galleryTrack.appendChild(item);
    });
  }

  btnPrev?.addEventListener("click", () => {
    galleryTrack.scrollBy({ left: -460, behavior: "smooth" });
  });
  btnNext?.addEventListener("click", () => {
    galleryTrack.scrollBy({ left: 460, behavior: "smooth" });
  });

  function makePlaceholders(n) {
    const arr = [];
    for (let i = 0; i < n; i++) arr.push("");
    return arr;
  }

  /* ===== 9. KHỞI CHẠY (INIT) ===== */
  showScreen("gate");
});

/* =========================================
   HÀM TẠO HIỆU ỨNG HOA RƠI (PETALS)
========================================= */
function spawnPetals(container, count) {
  if (!container) return;

  const mai = "assets/images/giao-dien/hoa-mai.png";
  const dao = "assets/images/giao-dien/hoa-dao.png";

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "petal";
    const isMai = Math.random() < 0.55;
    
    // Sử dụng template literal cho backgroundImage
    el.style.backgroundImage = `url("${isMai ? mai : dao}")`;

    const left = Math.random() * 100;
    const size = 40 + Math.random() * 50; 
    const dur = 14 + Math.random() * 18; 
    const delay = Math.random() * 10;

    const x = (Math.random() - 0.5) * 240;
    const x2 = x + (Math.random() - 0.5) * 260;

    el.style.left = `${left}%`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.animationDuration = `${dur}s`;
    el.style.animationDelay = `${delay}s`;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--x2", `${x2}px`);
    el.style.opacity = `${0.45 + Math.random() * 0.55}`;

    container.appendChild(el);
  }
}

/* =========================================
   HÀM TẠO PHÁO HOA (FIREWORKS)
========================================= */
function makeFireworks(canvas) {
  let ctx, w, h, raf = null, running = false;
  const rockets = [];
  const particles = [];

  // 🎨 BẢNG MÀU PHÁO HOA XUÂN
  const COLORS = ["#ff3b3b", "#ffd93b", "#ff77aa", "#a855f7", "#22d3ee", "#ffffff"];

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function spawnRocket() {
    rockets.push({
      x: Math.random() * w,
      y: h + 30,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(4.5 + Math.random() * 2.5),
      life: 55 + Math.random() * 20,
      color: randomColor(),
    });
  }

  function explode(x, y, baseColor) {
    const count = 60 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 1.6 + Math.random() * 3.8;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 110 + Math.random() * 40,
        max: 150,
        size: 2 + Math.random() * 2,
        color: baseColor,
      });
    }
  }

  function openingBurst() {
    for (let i = 0; i < 8; i++) {
      explode(
        Math.random() * w * 0.8 + w * 0.1,
        Math.random() * h * 0.4 + 80,
        randomColor()
      );
    }
  }

  function tick() {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    ctx.clearRect(0, 0, w, h);

    if (Math.random() < 0.06) spawnRocket();

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.03;
      r.life--;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = r.color;
      ctx.fill();
      if (r.life <= 0 || r.vy > -0.8) {
        explode(r.x, r.y, r.color);
        rockets.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.03;
      p.life--;
      const alpha = Math.max(0, p.life / p.max);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      if (p.life <= 0) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
  }

  function start() {
    if (!canvas || running) return;
    running = true;
    resize();
    openingBurst();
    openingBurst();
    window.addEventListener("resize", resize);
    tick();
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    window.removeEventListener("resize", resize);
    if (ctx) ctx.clearRect(0, 0, w, h);
    rockets.length = 0;
    particles.length = 0;
  }

  return { start, stop };
}

// Global function
window.showThanksScreen = function () {
  showScreen("thanks");
};

function zoomImage(src) {
  if (!src) return;

  const wrap = document.createElement("div");
  wrap.className = "img-zoom";

  const img = document.createElement("img");
  img.src = src;

  wrap.appendChild(img);
  document.body.appendChild(wrap);

  wrap.addEventListener("click", () => {
    wrap.remove();
  });
}

