/* Danish Syafiq — Portfolio interactions (vanilla JS, no dependencies) */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Nav: blur border on scroll + mobile menu ---------- */
  const nav = $("#nav");
  $("#navToggle").addEventListener("click", () => nav.classList.toggle("open"));
  $$("#navLinks a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

  /* ---------- Reveal on scroll (staggered) ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const siblings = $$(".reveal", el.parentElement);
      const i = Math.max(0, siblings.indexOf(el));
      el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
      el.classList.add("in");
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  // Hero shows immediately
  requestAnimationFrame(() => $$(".hero .reveal").forEach((el, i) => {
    el.style.transitionDelay = `${150 + i * 120}ms`;
    el.classList.add("in");
  }));

  /* ---------- Decrypt / scramble text ---------- */
  const chars = "!<>-_\\/[]{}=+*^?#01ABCDEF";
  function scramble(el) {
    const final = el.dataset.text;
    if (reduce) { el.textContent = final; return; }
    let frame = 0;
    const queue = [...final].map((ch, i) => ({ ch, start: Math.floor(i * 1.2), end: Math.floor(i * 1.2) + 12 + Math.floor(Math.random() * 14) }));
    const tick = () => {
      let out = "", done = 0;
      queue.forEach(q => {
        if (frame >= q.end) { out += q.ch; done++; }
        else if (frame >= q.start && q.ch !== " ") out += `<span class="sc">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
        else out += q.ch === " " ? " " : "&nbsp;";
      });
      el.innerHTML = out;
      frame++;
      if (done < queue.length) requestAnimationFrame(tick);
    };
    tick();
  }
  setTimeout(() => $$(".scramble").forEach(scramble), 600);

  /* ---------- About statement: quick staggered word fade-in ---------- */
  const stText = $("#statementText");
  if (stText) {
    const list = stText.textContent.trim().split(/\s+/);
    const step = Math.min(30, 1200 / list.length); // whole sentence in ~1.2s
    stText.innerHTML = list
      .map((w, i) => `<span class="w" style="transition-delay:${Math.round(i * step)}ms">${w}</span>`)
      .join(" ");
    const stIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { stText.classList.add("in"); stIO.disconnect(); }
      });
    }, { threshold: 0.35 });
    stIO.observe(stText);
  }

  /* ---------- Scroll-driven effects ---------- */
  const heroContent = $("#heroContent");
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    nav.classList.toggle("scrolled", y > 10);

    if (!reduce) {
      // Hero: scale down + fade as you scroll away
      const p = Math.min(y / vh, 1);
      heroContent.style.transform = `translateY(${p * 80}px) scale(${1 - p * 0.08})`;
      heroContent.style.opacity = 1 - p * 1.1;
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Count-up numbers ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, to = parseFloat(el.dataset.to), dec = +el.dataset.dec;
      countIO.unobserve(el);
      if (reduce) { el.textContent = to.toFixed(dec); return; }
      const dur = 1600, t0 = performance.now();
      const step = (t) => {
        const k = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - k, 4);
        el.textContent = (to * eased).toFixed(dec);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$(".count").forEach(el => countIO.observe(el));

  /* ---------- Certification filters ---------- */
  const filters = $("#filters");
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    $$("button", filters).forEach(b => b.classList.toggle("active", b === btn));
    const f = btn.dataset.f;
    $$("#certGrid .cert").forEach(c => {
      const show = f === "all" || c.dataset.c === f;
      c.classList.toggle("hide", !show);
      if (show) c.classList.add("in");
    });
  });

  /* ---------- Photo lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $("img", lb);
  const closeLb = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); };
  $$("img[data-zoom]").forEach(img => img.addEventListener("click", () => {
    lbImg.src = img.src; lbImg.alt = img.alt;
    lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
  }));
  lb.addEventListener("click", closeLb);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLb(); });

  /* ---------- Active nav link ---------- */
  const links = $$("#navLinks a");
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${e.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id]").forEach(s => secIO.observe(s));
})();
