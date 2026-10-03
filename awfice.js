
const USERS_KEY = "ws_users", SESSION_KEY = "ws_session";
const getUsers   = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const saveUsers  = u  => localStorage.setItem(USERS_KEY, JSON.stringify(u));
const getSession = () => JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
const emailOk    = s  => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const authModal = new bootstrap.Modal(document.getElementById("authModal"));

function openAuth(tab) {
  const btn = document.querySelector(`#authTabs button[data-bs-target="#${tab}Pane"]`);
  bootstrap.Tab.getOrCreateInstance(btn).show();
  authModal.show();
}
document.querySelectorAll("[data-auth]").forEach(a =>
  a.addEventListener("click", e => { e.preventDefault(); openAuth(a.dataset.auth); }));

function renderAuth() {
  const s = getSession();
  document.getElementById("guestLinks").classList.toggle("d-none", !!s);
  document.getElementById("userMenu").classList.toggle("d-none", !s);
  if (s) {
    document.getElementById("userName").textContent = s.name;
    document.getElementById("userInitial").textContent = s.name[0].toUpperCase();
  }
}

document.getElementById("signupPane").addEventListener("submit", e => {
  e.preventDefault();
  const name = sName.value.trim(), email = sEmail.value.trim().toLowerCase(), pass = sPass.value;
  const err = document.getElementById("signupErr");
  if (name.length < 2)        return err.textContent = "Please enter your name";
  if (!emailOk(email))        return err.textContent = "Invalid email ID";
  if (pass.length < 6)        return err.textContent = "Password must be at least 6 characters";
  if (!sAgree.checked)        return err.textContent = "Please accept the User Agreement";
  const users = getUsers();
  if (users.some(u => u.email === email)) return err.textContent = "This email is already registered";
  users.push({ name, email, pass });                
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email }));
  err.textContent = ""; e.target.reset(); authModal.hide(); renderAuth();
});

document.getElementById("loginPane").addEventListener("submit", e => {
  e.preventDefault();
  const email = lEmail.value.trim().toLowerCase(), pass = lPass.value;
  const err = document.getElementById("loginErr");
  if (!emailOk(email)) return err.textContent = "Invalid email ID";
  if (!pass)           return err.textContent = "Password is required field";
  const user = getUsers().find(u => u.email === email && u.pass === pass);
  if (!user)           return err.textContent = "Incorrect email or password";
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email }));
  err.textContent = ""; e.target.reset(); authModal.hide(); renderAuth();
});

document.getElementById("logoutBtn").addEventListener("click", e => {
  e.preventDefault();
  localStorage.removeItem(SESSION_KEY);
  renderAuth();
});

renderAuth();


const siteHeader = document.querySelector(".sticky-site-header");
const onScroll = () => siteHeader.classList.toggle("scrolled", window.scrollY > 80);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();


const wPhone      = document.getElementById("wPhone");
const wContinue   = document.getElementById("wContinue");
const wConsent    = document.getElementById("wConsent");
const wMsg        = document.getElementById("wMsg");

const phoneValid = () => /^[6-9]\d{9}$/.test(wPhone.value);   
function syncContinue() { wContinue.disabled = !(phoneValid() && wConsent.checked); }

wPhone.addEventListener("input", () => {
  wPhone.value = wPhone.value.replace(/\D/g, "");             
  wMsg.textContent = "";
  syncContinue();
});
wConsent.addEventListener("change", syncContinue);

document.getElementById("welcomeForm").addEventListener("submit", e => {
  e.preventDefault();
  if (!phoneValid()) { wMsg.className = "small mt-2 text-danger"; wMsg.textContent = "Enter a valid 10-digit mobile number"; return; }
 
  wMsg.className = "small mt-2 text-success";
  wMsg.textContent = "Thanks! (Demo: OTP verification needs a backend)";
});


(() => {
  const wrap = document.getElementById("wpWrap");
  if (!wrap) return;
  const panels = [...wrap.querySelectorAll(".wp-panel")];
  
  const bg = (key, n, id, w) =>
    `url(images/${key}-${n}.jpg), url(https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80)`;

  
  panels.forEach(p => {
    const key = p.dataset.key, ids = p.dataset.imgs.split(",").map(s => "1" + s.trim());
    const box = p.querySelector(".wp-slides");
    const dots = document.createElement("div");
    dots.className = "wp-dots";
    ids.forEach((id, i) => {
      const s = document.createElement("div");
      s.className = "wp-slide" + (i === 0 ? " on" : "");
      s.style.backgroundImage = bg(key, i + 1, id, 1000);
      box.appendChild(s);
      const d = document.createElement("button");
      d.type = "button"; d.setAttribute("aria-label", "Photo " + (i + 1));
      if (i === 0) d.className = "on";
      d.addEventListener("click", () => { show(p, i); restart(); });
      dots.appendChild(d);
    });
    box.appendChild(dots);
    p.querySelector(".wp-cover").style.backgroundImage = bg(key, 1, ids[0], 900);
    p._i = 0;
  });

  function show(p, i) {
    const slides = p.querySelectorAll(".wp-slide"), dots = p.querySelectorAll(".wp-dots button");
    p._i = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("on", k === p._i));
    dots.forEach((d, k) => d.classList.toggle("on", k === p._i));
  }


  let timer;
  const restart = () => {
    clearInterval(timer);
    timer = setInterval(() => {
      const a = wrap.querySelector(".wp-panel.active");
      if (a) show(a, a._i + 1);
    }, 4000);
  };

  function activate(p) {
    if (p.classList.contains("active")) return;
    wrap.classList.add("is-interactive");
    panels.forEach(x => { x.classList.remove("active"); x.setAttribute("aria-expanded", "false"); });
    p.classList.add("active"); p.setAttribute("aria-expanded", "true");
    show(p, 0); restart();
  }
  function deactivate() {
    clearInterval(timer);
    panels.forEach(p => {
      p.classList.remove("active");
      p.setAttribute("aria-expanded", "false");
      show(p, 0);
    });
    wrap.classList.remove("is-interactive");
  }
  panels.forEach(p => {
    p.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") activate(p); });
    p.addEventListener("click", () => activate(p));      
    p.addEventListener("focus", () => activate(p));      
  });
  wrap.addEventListener("pointerleave", e => {
    if (e.pointerType === "mouse") deactivate();
  });


  function sizeOpen() {
    if (window.matchMedia("(max-width: 767.98px)").matches) { wrap.style.removeProperty("--open-w"); return; }
    const cw = parseFloat(getComputedStyle(wrap).getPropertyValue("--cw")) || 96;
    wrap.style.setProperty("--open-w", (wrap.clientWidth - cw * (panels.length - 1)) + "px");
  }
  window.addEventListener("resize", sizeOpen);
  sizeOpen();
})();