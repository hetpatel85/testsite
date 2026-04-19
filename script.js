
(function() {

  // ── CUSTOM CURSOR (desktop) ──
  const cur = document.getElementById("cursor");
  const trail = document.getElementById("cursor-trail");
  if (cur && window.matchMedia("(hover: hover)").matches) {
    let mx=0, my=0, tx=0, ty=0;
    document.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + "px"; cur.style.top = my + "px";
    });
    setInterval(() => {
      tx += (mx-tx) * .18; ty += (my-ty) * .18;
      trail.style.left = Math.round(tx) + "px";
      trail.style.top  = Math.round(ty) + "px";
    }, 16);
    document.querySelectorAll("button, .photo-card").forEach(el => {
      el.addEventListener("mouseenter", () => cur.classList.add("big"));
      el.addEventListener("mouseleave", () => cur.classList.remove("big"));
    });
  }

  // ── FLOATING HEARTS (background) ──
  const bgC = document.getElementById("bgCanvas");
  const bgX = bgC.getContext("2d");
  let hearts = [];
  function resizeBg() { bgC.width = window.innerWidth; bgC.height = window.innerHeight; }
  resizeBg(); window.addEventListener("resize", resizeBg);
  function spawnHeart() {
    hearts.push({
      x: Math.random() * bgC.width, y: bgC.height + 20,
      size: 8 + Math.random() * 20, speed: .6 + Math.random() * 1.2,
      opacity: .35 + Math.random() * .5, drift: (Math.random()-.5) * .6,
      color: ["#f06090","#e8426e","#f9aec8","#d4537e","#fbc8d8"][Math.floor(Math.random()*5)]
    });
  }
  function drawHeart(x,y,s,c,op) {
    bgX.save(); bgX.globalAlpha = op; bgX.fillStyle = c;
    bgX.beginPath(); bgX.moveTo(x, y+s*.3);
    bgX.bezierCurveTo(x,y, x-s*.5,y, x-s*.5, y+s*.3);
    bgX.bezierCurveTo(x-s*.5, y+s*.6, x, y+s*.9, x, y+s);
    bgX.bezierCurveTo(x, y+s*.9, x+s*.5, y+s*.6, x+s*.5, y+s*.3);
    bgX.bezierCurveTo(x+s*.5, y, x, y, x, y+s*.3);
    bgX.fill(); bgX.restore();
  }
  function animBg() {
    bgX.clearRect(0,0,bgC.width,bgC.height);
    hearts.forEach(h => {
      h.y -= h.speed; h.x += h.drift; h.opacity -= .0025;
      drawHeart(h.x, h.y, h.size, h.color, Math.max(0,h.opacity));
    });
    hearts = hearts.filter(h => h.opacity > 0 && h.y > -50);
    requestAnimationFrame(animBg);
  }
  animBg();
  setInterval(spawnHeart, 350);
  for (let i=0; i<12; i++) setTimeout(spawnHeart, i*120);

  // ── FLOWER FALL (birthday screen only) ──
  const flowerC = document.getElementById("flowerCanvas");
  const flowerX = flowerC.getContext("2d");
  let flowers = [];
  let flowerActive = false;
  function resizeFlower() { flowerC.width = window.innerWidth; flowerC.height = window.innerHeight; }
  resizeFlower(); window.addEventListener("resize", resizeFlower);

  const petalColors = [
    ["#f9aec8","#f4c0d1"],["#e8426e","#c0294f"],["#fbc8d8","#f06090"],
    ["#d4537e","#a0294f"],["#fff0f5","#f9aec8"],["#e75480","#c04070"]
  ];

  function spawnFlower() {
    const col = petalColors[Math.floor(Math.random() * petalColors.length)];
    flowers.push({
      x: Math.random() * flowerC.width,
      y: -30 - Math.random() * 200,
      size: 10 + Math.random() * 18,
      speed: 1.2 + Math.random() * 2.2,
      drift: (Math.random() - .5) * 1.2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - .5) * .06,
      opacity: .7 + Math.random() * .3,
      petalColor: col[0], centerColor: col[1],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: .02 + Math.random() * .03
    });
  }

  function drawFlower(f) {
    flowerX.save();
    flowerX.globalAlpha = f.opacity;
    flowerX.translate(f.x, f.y);
    flowerX.rotate(f.rot);
    const s = f.size;
    const numPetals = 5;
    for (let i = 0; i < numPetals; i++) {
      flowerX.save();
      flowerX.rotate((i / numPetals) * Math.PI * 2);
      flowerX.fillStyle = f.petalColor;
      flowerX.beginPath();
      flowerX.ellipse(0, -s * .55, s * .28, s * .42, 0, 0, Math.PI * 2);
      flowerX.fill();
      flowerX.restore();
    }
    flowerX.fillStyle = f.centerColor;
    flowerX.beginPath();
    flowerX.arc(0, 0, s * .22, 0, Math.PI * 2);
    flowerX.fill();
    flowerX.restore();
  }

  function animFlowers() {
    if (!flowerActive) return;
    flowerX.clearRect(0, 0, flowerC.width, flowerC.height);
    flowers.forEach(f => {
      f.wobble += f.wobbleSpeed;
      f.y += f.speed;
      f.x += f.drift + Math.sin(f.wobble) * 0.8;
      f.rot += f.rotSpeed;
      drawFlower(f);
    });
    flowers = flowers.filter(f => f.y < flowerC.height + 60);
    requestAnimationFrame(animFlowers);
  }

  function startFlowers() {
    if (flowerActive) return;
    flowerActive = true;
    // Spawn initial burst
    for (let i = 0; i < 30; i++) setTimeout(spawnFlower, i * 80);
    // Keep spawning continuously while on birthday screen
    window._flowerInterval = setInterval(() => {
      if (flowerActive) {
        spawnFlower();
        spawnFlower();
      }
    }, 300);
    animFlowers();
  }

  function stopFlowers() {
    flowerActive = false;
    clearInterval(window._flowerInterval);
    flowerX.clearRect(0, 0, flowerC.width, flowerC.height);
    flowers = [];
  }

  // ── RIPPLE ──
  function addRipple(el, e) {
    const r = document.createElement("span");
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const cx = (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width/2) - rect.left - size/2;
    const cy = (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height/2) - rect.top - size/2;
    r.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,0.35);transform:scale(0);left:${cx}px;top:${cy}px;animation:ripple .6s ease-out forwards;pointer-events:none;`;
    el.appendChild(r);
    setTimeout(() => r.remove(), 600);
  }
  document.querySelectorAll("#yesBtn, .surprise-btn").forEach(btn => {
    btn.style.overflow = "hidden"; btn.style.position = "relative";
    btn.addEventListener("click", e => addRipple(btn, e));
    btn.addEventListener("touchend", e => addRipple(btn, e));
  });

  // ── SCREEN TRANSITIONS ──
  function showScreen(id) {
    const current = document.querySelector(".screen.active");
    const next = document.getElementById(id);
    if (id !== "birthdayScreen") stopFlowers();
    if (current) {
      current.classList.add("fade-out");
      setTimeout(() => {
        current.classList.remove("active", "fade-out");
        next.classList.add("active", "fade-in");
        window.scrollTo(0, 0);
        if (id === "birthdayScreen") startFlowers();
      }, 380);
    } else {
      next.classList.add("active", "fade-in");
      window.scrollTo(0, 0);
      if (id === "birthdayScreen") startFlowers();
    }
  }

  // ── NO BTN ESCAPE ──
  const noBtn = document.getElementById("noBtn");
  const arena = document.getElementById("btnArena");
  let noSize = 17, escapes = 0;
  function escapeNo() {
    escapes++;
    if (window.innerWidth <= 520) {
      noBtn.style.transform = "translateX(" + ((Math.random()>.5?1:-1)*(30+Math.random()*80)) + "px)";
      setTimeout(() => noBtn.style.transform = "none", 350);
      return;
    }
    arena.classList.add("escaped");
    const aW = arena.offsetWidth, aH = arena.offsetHeight;
    const bW = noBtn.offsetWidth || 100, bH = noBtn.offsetHeight || 50;
    noBtn.style.left = (10 + Math.random() * Math.max(20, aW-bW-20)) + "px";
    noBtn.style.top  = (10 + Math.random() * Math.max(10, aH-bH-10)) + "px";
    noBtn.style.transform = "none";
    if (noSize > 10) noSize -= 1.5;
    noBtn.style.fontSize = noSize + "px";
    noBtn.style.padding = Math.max(5,14-escapes)+"px "+Math.max(12,36-escapes*2)+"px";
  }
  noBtn.addEventListener("mouseover", escapeNo);
  noBtn.addEventListener("touchstart", e => { e.preventDefault(); escapeNo(); });

  // ── YES BTN ──
  document.getElementById("yesBtn").addEventListener("click", function() {
    // heart burst
    for (let i=0; i<20; i++) setTimeout(spawnHeart, i*30);
    setTimeout(() => showScreen("yesScreen"), 180);
  });

  // ── SURPRISE BTN ──
  document.getElementById("surpriseBtn").addEventListener("click", function() {
    launchConfetti();
    setTimeout(() => {
      showScreen("birthdayScreen");
      initSparkles();
      buildHBText();
      startTypewriter();
      initScrollReveal();
    }, 320);
    for (let i=0; i<40; i++) setTimeout(spawnHeart, i*40);
  });

  // ── CONFETTI ──
  const confC = document.getElementById("confettiCanvas");
  const confX = confC.getContext("2d");
  let confetti = [], confRunning = false;
  function resizeConf() { confC.width = window.innerWidth; confC.height = window.innerHeight; }
  resizeConf(); window.addEventListener("resize", resizeConf);
  function launchConfetti() {
    for (let i=0; i<200; i++) {
      confetti.push({
        x: Math.random() * confC.width, y: -20 - Math.random() * confC.height * .5,
        w: 6+Math.random()*8, h: 10+Math.random()*14,
        r: Math.random()*Math.PI*2, vx: (Math.random()-.5)*5,
        vy: 2+Math.random()*5, vr: (Math.random()-.5)*.15,
        color: ["#f06090","#e8426e","#f4c0d1","#ffd6e8","#a0294f","#fff","#fbc8d8","#d4537e"][Math.floor(Math.random()*8)],
        life: 1
      });
    }
    if (!confRunning) { confRunning = true; _animConf(); }
  }
  function _animConf() {
    confX.clearRect(0,0,confC.width,confC.height);
    confetti.forEach(c => {
      c.x+=c.vx; c.y+=c.vy; c.r+=c.vr; c.life-=.007;
      confX.save(); confX.globalAlpha=Math.max(0,c.life);
      confX.fillStyle=c.color; confX.translate(c.x,c.y); confX.rotate(c.r);
      confX.fillRect(-c.w/2,-c.h/2,c.w,c.h); confX.restore();
    });
    confetti = confetti.filter(c => c.life>0 && c.y<confC.height+40);
    if (confetti.length > 0) requestAnimationFrame(_animConf);
    else confRunning = false;
  }

  // ── LIGHTBOX ──
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  document.querySelectorAll(".photo-card").forEach(card => {
    function openLb() {
      lbImg.src = card.dataset.img;
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    card.addEventListener("click", openLb);
    card.addEventListener("touchend", e => { e.preventDefault(); openLb(); });
  });
  document.getElementById("lightbox-close").addEventListener("click", () => {
    lb.classList.remove("open"); document.body.style.overflow = "";
  });
  lb.addEventListener("click", e => {
    if (e.target === lb) { lb.classList.remove("open"); document.body.style.overflow = ""; }
  });

  // ── 3D TILT on photo cards (desktop only) ──
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".photo-card").forEach(card => {
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - .5) * 18;
        const y = ((e.clientY - rect.top) / rect.height - .5) * -18;
        card.style.transform = `translateY(-10px) scale(1.06) rotateY(${x}deg) rotateX(${y}deg)`;
      });
      card.addEventListener("mouseleave", () => card.style.transform = "");
    });
  }

  // ── TYPEWRITER ──
  const MSG = "On this beautiful day, I want the whole world to know how special you are to me. You are my sunshine, my heartbeat, my everything. Happy 21st birthday, my love — may this year bring you all the joy you truly deserve. I love you more than words can ever say. 🌹";
  function startTypewriter() {
    const el = document.getElementById("messageText");
    if (el.dataset.typed) return;
    el.dataset.typed = "1"; el.innerHTML = "";
    const cursor = document.createElement("span");
    cursor.id = "typewriter-cursor"; el.appendChild(cursor);
    let i = 0;
    const iv = setInterval(() => {
      if (i >= MSG.length) { clearInterval(iv); setTimeout(() => cursor.remove(), 1200); return; }
      cursor.insertAdjacentText("beforebegin", MSG[i]); i++;
    }, 26);
  }

  // ── SPARKLES ──
  function initSparkles() {
    const sc = document.getElementById("sparkleCanvas");
    if (!sc) return;
    const sctx = sc.getContext("2d");
    let sparks = [];
    function rsz() { sc.width = sc.offsetWidth; sc.height = sc.offsetHeight; } rsz();
    function spawnSpark() {
      sparks.push({ x:Math.random()*sc.width, y:Math.random()*sc.height, r:1+Math.random()*2.5, opacity:1,
        fade:.018+Math.random()*.028, color:["#f9aec8","#e8426e","#ffffff","#f4c0d1","#ffd6e8","#d4537e"][Math.floor(Math.random()*6)] });
    }
    function animSparks() {
      sctx.clearRect(0,0,sc.width,sc.height);
      sparks.forEach(s => {
        sctx.save(); sctx.globalAlpha=s.opacity; sctx.fillStyle=s.color;
        sctx.beginPath(); sctx.arc(s.x,s.y,s.r,0,Math.PI*2); sctx.fill();
        sctx.restore(); s.opacity -= s.fade;
      });
      sparks = sparks.filter(s => s.opacity > 0);
      requestAnimationFrame(animSparks);
    }
    animSparks(); setInterval(spawnSpark, 55);
    for (let i=0; i<24; i++) setTimeout(spawnSpark, i*40);
  }

  // ── HB TEXT ──
  function buildHBText() {
    const el = document.getElementById("hbText");
    if (!el || el.children.length > 0) return;
    "Happy Birthday Diyuuu ✨".split("").forEach((ch, i) => {
      const sp = document.createElement("span");
      sp.className = "hb-letter";
      sp.textContent = ch === " " ? " " : ch;
      sp.style.animationDelay = (0.05 + i*.065) + "s, " + (i*.11 % 2.8) + "s";
      el.appendChild(sp);
    });
  }

  // ── SCROLL REVEAL ──
  function initScrollReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll(".gallery-section, .message-card, .sparkle-box").forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(32px)";
      el.style.transition = "opacity .7s ease, transform .7s ease";
      obs.observe(el);
    });
  }

})();
