
(function() {

  // ── CURSOR ──
  const cur=document.getElementById("cursor"),trail=document.getElementById("cursor-trail");
  if(cur&&window.matchMedia("(hover:hover)").matches){
    let mx=0,my=0,tx=0,ty=0;
    document.addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+"px";cur.style.top=my+"px";});
    setInterval(()=>{tx+=(mx-tx)*.18;ty+=(my-ty)*.18;trail.style.left=Math.round(tx)+"px";trail.style.top=Math.round(ty)+"px";},16);
    document.querySelectorAll("button,.photo-card,.tl-content").forEach(el=>{
      el.addEventListener("mouseenter",()=>cur.classList.add("big"));
      el.addEventListener("mouseleave",()=>cur.classList.remove("big"));
    });
  }

  // ── HEARTS ──
  const bgC=document.getElementById("bgCanvas"),bgX=bgC.getContext("2d");
  let hearts=[];
  function resizeBg(){bgC.width=window.innerWidth;bgC.height=window.innerHeight;}
  resizeBg();window.addEventListener("resize",resizeBg);
  function spawnHeart(){hearts.push({x:Math.random()*bgC.width,y:bgC.height+20,size:8+Math.random()*20,speed:.6+Math.random()*1.2,opacity:.35+Math.random()*.5,drift:(Math.random()-.5)*.6,color:["#f06090","#e8426e","#f9aec8","#d4537e","#fbc8d8"][Math.floor(Math.random()*5)]});}
  function drawHeart(x,y,s,c,op){bgX.save();bgX.globalAlpha=op;bgX.fillStyle=c;bgX.beginPath();bgX.moveTo(x,y+s*.3);bgX.bezierCurveTo(x,y,x-s*.5,y,x-s*.5,y+s*.3);bgX.bezierCurveTo(x-s*.5,y+s*.6,x,y+s*.9,x,y+s);bgX.bezierCurveTo(x,y+s*.9,x+s*.5,y+s*.6,x+s*.5,y+s*.3);bgX.bezierCurveTo(x+s*.5,y,x,y,x,y+s*.3);bgX.fill();bgX.restore();}
  function animBg(){bgX.clearRect(0,0,bgC.width,bgC.height);hearts.forEach(h=>{h.y-=h.speed;h.x+=h.drift;h.opacity-=.0025;drawHeart(h.x,h.y,h.size,h.color,Math.max(0,h.opacity));});hearts=hearts.filter(h=>h.opacity>0&&h.y>-50);requestAnimationFrame(animBg);}
  animBg();setInterval(spawnHeart,350);for(let i=0;i<12;i++)setTimeout(spawnHeart,i*120);

  // ── FLOWERS ──
  const flowerC=document.getElementById("flowerCanvas"),flowerX=flowerC.getContext("2d");
  let flowers=[],flowerActive=false,flowerTimer=null;
  function resizeFlower(){flowerC.width=window.innerWidth;flowerC.height=window.innerHeight;}
  resizeFlower();window.addEventListener("resize",resizeFlower);
  const PP=[["#f9aec8","#f4c0d1","#e8426e"],["#e8426e","#c0294f","#a0294f"],["#fbc8d8","#f06090","#d4537e"],["#fff0f5","#f9aec8","#f4c0d1"],["#d4537e","#a0294f","#7a2040"],["#ffd6e8","#f9aec8","#e8426e"]];
  function spawnFlower(){const p=PP[Math.floor(Math.random()*PP.length)];flowers.push({x:Math.random()*flowerC.width,y:-40-Math.random()*300,size:12+Math.random()*20,speed:1+Math.random()*2,drift:(Math.random()-.5),rot:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*.05,opacity:.75+Math.random()*.25,wobble:Math.random()*Math.PI*2,wobbleSpeed:.02+Math.random()*.025,p1:p[0],p2:p[1],center:p[2]});}
  function drawFlower(f){flowerX.save();flowerX.globalAlpha=f.opacity;flowerX.translate(f.x,f.y);flowerX.rotate(f.rot);const s=f.size,n=5;for(let i=0;i<n;i++){flowerX.save();flowerX.rotate((i/n)*Math.PI*2);flowerX.fillStyle=f.p1;flowerX.beginPath();flowerX.ellipse(0,-s*.58,s*.27,s*.44,0,0,Math.PI*2);flowerX.fill();flowerX.restore();}for(let i=0;i<n;i++){flowerX.save();flowerX.rotate(((i+.5)/n)*Math.PI*2);flowerX.fillStyle=f.p2;flowerX.beginPath();flowerX.ellipse(0,-s*.36,s*.18,s*.28,0,0,Math.PI*2);flowerX.fill();flowerX.restore();}flowerX.fillStyle=f.center;flowerX.beginPath();flowerX.arc(0,0,s*.2,0,Math.PI*2);flowerX.fill();flowerX.fillStyle="rgba(255,255,255,0.7)";flowerX.beginPath();flowerX.arc(0,0,s*.08,0,Math.PI*2);flowerX.fill();flowerX.restore();}
  function animFlowers(){if(!flowerActive)return;flowerX.clearRect(0,0,flowerC.width,flowerC.height);flowers.forEach(f=>{f.wobble+=f.wobbleSpeed;f.y+=f.speed;f.x+=f.drift+Math.sin(f.wobble)*.9;f.rot+=f.rotSpeed;drawFlower(f);});flowers=flowers.filter(f=>f.y<flowerC.height+80);requestAnimationFrame(animFlowers);}
  function startFlowers(){if(flowerActive)return;flowerActive=true;flowers=[];for(let i=0;i<40;i++)setTimeout(spawnFlower,i*60);flowerTimer=setInterval(()=>{if(flowerActive){spawnFlower();spawnFlower();}},280);animFlowers();}
  function stopFlowers(){flowerActive=false;clearInterval(flowerTimer);flowerX.clearRect(0,0,flowerC.width,flowerC.height);flowers=[];}

  // ════════════════════════════════
  // MUSIC — works on both phone & laptop
  // Strategy:
  //   1. Try silent autoplay first (works on desktop)
  //   2. On mobile, show a beautiful overlay asking user to tap once
  //   3. After that single tap, audio is unlocked for the whole session
  // ════════════════════════════════
  const audio = document.getElementById("bgAudio");
  const overlay = document.getElementById("musicOverlay");
  const moBtn = document.getElementById("moBtn");
  let musicUnlocked = false;

  function startMusic() {
    if (!audio || musicUnlocked) return;
    audio.volume = 0.55;
    audio.loop = true;
    audio.play().then(() => {
      musicUnlocked = true;
      if (overlay) overlay.classList.remove("show");
    }).catch(() => {
      // autoplay blocked (phone) — show the overlay
      if (overlay) overlay.classList.add("show");
    });
  }

  function unlockAndPlay() {
    if (!audio) return;
    musicUnlocked = true;
    audio.volume = 0.55;
    audio.loop = true;
    audio.play().catch(()=>{});
    if (overlay) overlay.classList.remove("show");
  }

  if (moBtn) moBtn.addEventListener("click", unlockAndPlay);
  // tapping anywhere on overlay also unlocks
  if (overlay) overlay.addEventListener("click", unlockAndPlay);

  // ── RIPPLE ──
  function addRipple(el,e){const r=document.createElement("span"),rect=el.getBoundingClientRect();const size=Math.max(rect.width,rect.height)*2;const cx=(e.clientX||e.touches?.[0]?.clientX||rect.left+rect.width/2)-rect.left-size/2;const cy=(e.clientY||e.touches?.[0]?.clientY||rect.top+rect.height/2)-rect.top-size/2;r.style.cssText=`position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,.35);transform:scale(0);left:${cx}px;top:${cy}px;animation:ripple .6s ease-out forwards;pointer-events:none;`;el.appendChild(r);setTimeout(()=>r.remove(),600);}
  document.querySelectorAll("#yesBtn,.surprise-btn").forEach(btn=>{btn.style.overflow="hidden";btn.style.position="relative";btn.addEventListener("click",e=>addRipple(btn,e));btn.addEventListener("touchend",e=>addRipple(btn,e));});

  // ── SCREEN SWITCH ──
  function showScreen(id){
    const c=document.querySelector(".screen.active"),n=document.getElementById(id);
    if(id!=="birthdayScreen")stopFlowers();
    if(c){c.classList.add("fade-out");setTimeout(()=>{c.classList.remove("active","fade-out");n.classList.add("active","fade-in");window.scrollTo(0,0);if(id==="birthdayScreen"){startFlowers();setTimeout(startMusic,600);}},380);}
    else{n.classList.add("active","fade-in");window.scrollTo(0,0);if(id==="birthdayScreen"){startFlowers();setTimeout(startMusic,600);}}
  }

  // ── NO BTN ──
  const noBtn=document.getElementById("noBtn"),arena=document.getElementById("btnArena");
  let noSize=16,escapes=0;
  function escapeNo(){
    escapes++;
    if(window.innerWidth<=520){noBtn.style.transform="translateX("+((Math.random()>.5?1:-1)*(30+Math.random()*80))+"px)";setTimeout(()=>noBtn.style.transform="none",350);return;}
    arena.classList.add("escaped");
    const aW=arena.offsetWidth,aH=arena.offsetHeight,bW=noBtn.offsetWidth||90,bH=noBtn.offsetHeight||46;
    noBtn.style.left=(10+Math.random()*Math.max(20,aW-bW-20))+"px";
    noBtn.style.top=(10+Math.random()*Math.max(10,aH-bH-10))+"px";
    noBtn.style.transform="none";
    if(noSize>10)noSize-=1.5;
    noBtn.style.fontSize=noSize+"px";
    noBtn.style.padding=Math.max(5,13-escapes)+"px "+Math.max(12,32-escapes*2)+"px";
  }
  noBtn.addEventListener("mouseover",escapeNo);
  noBtn.addEventListener("touchstart",e=>{e.preventDefault();escapeNo();});

  document.getElementById("yesBtn").addEventListener("click",function(){for(let i=0;i<20;i++)setTimeout(spawnHeart,i*30);setTimeout(()=>showScreen("yesScreen"),180);});
  document.getElementById("surpriseBtn").addEventListener("click",function(){launchConfetti();setTimeout(()=>{showScreen("birthdayScreen");initSparkles();buildHBText();startTypewriter();initScrollReveal();initTimeline();},320);for(let i=0;i<40;i++)setTimeout(spawnHeart,i*40);});

  // ── CONFETTI ──
  const confC=document.getElementById("confettiCanvas"),confX=confC.getContext("2d");
  let confetti=[],confRunning=false;
  function resizeConf(){confC.width=window.innerWidth;confC.height=window.innerHeight;}
  resizeConf();window.addEventListener("resize",resizeConf);
  function launchConfetti(){for(let i=0;i<200;i++){confetti.push({x:Math.random()*confC.width,y:-20-Math.random()*confC.height*.5,w:6+Math.random()*8,h:10+Math.random()*14,r:Math.random()*Math.PI*2,vx:(Math.random()-.5)*5,vy:2+Math.random()*5,vr:(Math.random()-.5)*.15,color:["#f06090","#e8426e","#f4c0d1","#ffd6e8","#a0294f","#fff","#fbc8d8","#d4537e"][Math.floor(Math.random()*8)],life:1});}if(!confRunning){confRunning=true;_animConf();}}
  function _animConf(){confX.clearRect(0,0,confC.width,confC.height);confetti.forEach(c=>{c.x+=c.vx;c.y+=c.vy;c.r+=c.vr;c.life-=.007;confX.save();confX.globalAlpha=Math.max(0,c.life);confX.fillStyle=c.color;confX.translate(c.x,c.y);confX.rotate(c.r);confX.fillRect(-c.w/2,-c.h/2,c.w,c.h);confX.restore();});confetti=confetti.filter(c=>c.life>0&&c.y<confC.height+40);if(confetti.length>0)requestAnimationFrame(_animConf);else confRunning=false;}

  // ── LIGHTBOX ──
  const lb=document.getElementById("lightbox"),lbImg=document.getElementById("lightbox-img"),lbS=document.getElementById("lightbox-sentence");
  document.querySelectorAll(".photo-card").forEach(card=>{
    function openLb(){lbImg.src=card.dataset.img;lbS.textContent=card.dataset.sentence||"";lb.classList.add("open");document.body.style.overflow="hidden";}
    card.addEventListener("click",openLb);
    card.addEventListener("touchend",e=>{e.preventDefault();openLb();});
  });
  document.getElementById("lightbox-close").addEventListener("click",()=>{lb.classList.remove("open");document.body.style.overflow="";});
  lb.addEventListener("click",e=>{if(e.target===lb){lb.classList.remove("open");document.body.style.overflow="";}});

  // 3D TILT desktop
  if(window.matchMedia("(hover:hover)").matches){document.querySelectorAll(".photo-card").forEach(card=>{card.addEventListener("mousemove",e=>{const rect=card.getBoundingClientRect();const x=((e.clientX-rect.left)/rect.width-.5)*16,y=((e.clientY-rect.top)/rect.height-.5)*-16;card.style.transform=`translateY(-8px) scale(1.05) rotateY(${x}deg) rotateX(${y}deg)`;});card.addEventListener("mouseleave",()=>card.style.transform="");});}

  // ── TYPEWRITER ──
  const MSG="On this beautiful day, I want the whole world to know how special you are to me. You are my sunshine, my heartbeat, my everything. Happy 21st birthday, my love \u2014 may this year bring you all the joy you truly deserve. I love you more than words can ever say. \u{1F339}";
  function startTypewriter(){const el=document.getElementById("messageText");if(el.dataset.typed)return;el.dataset.typed="1";el.innerHTML="";const cursor=document.createElement("span");cursor.id="typewriter-cursor";el.appendChild(cursor);let i=0;const iv=setInterval(()=>{if(i>=MSG.length){clearInterval(iv);setTimeout(()=>cursor.remove(),1200);return;}cursor.insertAdjacentText("beforebegin",MSG[i]);i++;},26);}

  // ── SPARKLES ──
  function initSparkles(){const sc=document.getElementById("sparkleCanvas");if(!sc)return;const sctx=sc.getContext("2d");let sparks=[];function rsz(){sc.width=sc.offsetWidth;sc.height=sc.offsetHeight;}rsz();function spawnSpark(){sparks.push({x:Math.random()*sc.width,y:Math.random()*sc.height,r:1+Math.random()*2.5,opacity:1,fade:.018+Math.random()*.028,color:["#f9aec8","#e8426e","#ffffff","#f4c0d1","#ffd6e8","#d4537e"][Math.floor(Math.random()*6)]});}function animSparks(){sctx.clearRect(0,0,sc.width,sc.height);sparks.forEach(s=>{sctx.save();sctx.globalAlpha=s.opacity;sctx.fillStyle=s.color;sctx.beginPath();sctx.arc(s.x,s.y,s.r,0,Math.PI*2);sctx.fill();sctx.restore();s.opacity-=s.fade;});sparks=sparks.filter(s=>s.opacity>0);requestAnimationFrame(animSparks);}animSparks();setInterval(spawnSpark,55);for(let i=0;i<24;i++)setTimeout(spawnSpark,i*40);}

  // ── HB TEXT ──
  function buildHBText(){const el=document.getElementById("hbText");if(!el||el.children.length>0)return;"Happy Birthday Diyuuu \u2728".split("").forEach((ch,i)=>{const sp=document.createElement("span");sp.className="hb-letter";sp.textContent=ch===" "?"\u00A0":ch;sp.style.animationDelay=(0.05+i*.065)+"s, "+(i*.11%2.8)+"s";el.appendChild(sp);});}

  // ── SCROLL REVEAL ──
  function initScrollReveal(){const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity="1";e.target.style.transform="translateY(0)";}});},{threshold:.12});document.querySelectorAll(".gallery-section,.message-card,.sparkle-box").forEach(el=>{el.style.opacity="0";el.style.transform="translateY(28px)";el.style.transition="opacity .7s ease,transform .7s ease";obs.observe(el);});}

  // ── TIMELINE REVEAL ──
  function initTimeline(){const items=document.querySelectorAll(".tl-item");if(!items.length)return;const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible");});},{threshold:.15});items.forEach(item=>obs.observe(item));}

})();
