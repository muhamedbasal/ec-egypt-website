/* =========================================================================
   Egyptian Canadian Company (EC) — main.js
   i18n EN/AR toggle (RTL) · sticky header · counters · reveal · slider
   · product filter · image fallback · back-to-top. Vanilla JS, no deps.
   ========================================================================= */
(function () {
  "use strict";

  /* ----------------------------------------------------------------
     LANGUAGE (EN / AR with RTL)
  ---------------------------------------------------------------- */
  var STORE_KEY = "ec-lang";
  var html = document.documentElement;

  function applyLang(lang) {
    var ar = lang === "ar";
    html.setAttribute("lang", ar ? "ar" : "en");
    html.setAttribute("dir", ar ? "rtl" : "ltr");

    // text content
    document.querySelectorAll("[data-en]").forEach(function (el) {
      var val = ar ? el.getAttribute("data-ar") : el.getAttribute("data-en");
      if (val !== null && val !== undefined) el.textContent = val;
    });
    // placeholders
    document.querySelectorAll("[data-ph-en]").forEach(function (el) {
      el.setAttribute("placeholder", ar ? el.getAttribute("data-ph-ar") : el.getAttribute("data-ph-en"));
    });
    // aria-labels
    document.querySelectorAll("[data-aria-en]").forEach(function (el) {
      el.setAttribute("aria-label", ar ? el.getAttribute("data-aria-ar") : el.getAttribute("data-aria-en"));
    });
    // document title
    if (document.body.getAttribute("data-title-" + (ar ? "ar" : "en"))) {
      document.title = document.body.getAttribute("data-title-" + (ar ? "ar" : "en"));
    }

    // switch buttons state
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
    });
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
  }

  var saved = "en";
  try { saved = localStorage.getItem(STORE_KEY) || "en"; } catch (e) {}
  applyLang(saved);

  document.querySelectorAll(".lang-switch button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  /* ----------------------------------------------------------------
     MOBILE NAV
  ---------------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  var backdrop = document.querySelector(".nav-backdrop");
  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  function openNav() {
    nav.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.contains("is-open") ? closeNav() : openNav();
    });
    if (backdrop) backdrop.addEventListener("click", closeNav);
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  }

  /* ----------------------------------------------------------------
     STICKY HEADER SHADOW
  ---------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------------
     IMAGE FALLBACK (graceful placeholder)
  ---------------------------------------------------------------- */
  function buildPlaceholder(img) {
    var ph = document.createElement("div");
    ph.className = "media-ph " + (img.getAttribute("data-ph-class") || "");
    ph.setAttribute("role", "img");
    var label = img.getAttribute("data-label") || img.getAttribute("alt") || "";
    ph.setAttribute("aria-label", label);
    ph.textContent = label;
    if (img.parentNode) img.parentNode.replaceChild(ph, img);
  }
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function () { buildPlaceholder(img); });
    if (img.complete && img.naturalWidth === 0) buildPlaceholder(img);
  });

  /* ----------------------------------------------------------------
     SCROLL REVEAL
  ---------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ----------------------------------------------------------------
     ANIMATED COUNTERS
  ---------------------------------------------------------------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var dur = 1700, start = null, fmt = new Intl.NumberFormat("en-US");
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt.format(target);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ----------------------------------------------------------------
     TESTIMONIAL SLIDER
  ---------------------------------------------------------------- */
  var slider = document.querySelector("[data-slider]");
  if (slider) {
    var slides = [].slice.call(slider.querySelectorAll(".testi__slide"));
    var dotsWrap = slider.querySelector(".testi__dots");
    var prevBtn = slider.querySelector("[data-prev]");
    var nextBtn = slider.querySelector("[data-next]");
    var index = 0, timer = null, INTERVAL = 6500;
    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.className = "testi__dot"; b.type = "button";
      b.setAttribute("aria-label", "Show testimonial " + (i + 1));
      b.addEventListener("click", function () { go(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });
    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("is-active", n === index); s.setAttribute("aria-hidden", n === index ? "false" : "true"); });
      dots.forEach(function (d, n) { d.classList.toggle("is-active", n === index); });
    }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }
    function restart() { if (timer) clearInterval(timer); timer = setInterval(next, INTERVAL); }
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });
    slider.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    slider.addEventListener("mouseleave", restart);
    go(0); restart();
  }

  /* ----------------------------------------------------------------
     PRODUCT FILTER CHIPS
  ---------------------------------------------------------------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  if (chips.length) {
    var products = document.querySelectorAll(".product[data-cat]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var f = chip.getAttribute("data-filter");
        products.forEach(function (p) {
          var show = f === "all" || p.getAttribute("data-cat") === f;
          p.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ----------------------------------------------------------------
     BACK TO TOP
  ---------------------------------------------------------------- */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    window.addEventListener("scroll", function () { toTop.classList.toggle("show", window.scrollY > 600); }, { passive: true });
    toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ----------------------------------------------------------------
     FOOTER YEAR
  ---------------------------------------------------------------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------------
     CONTACT FORM → WhatsApp fallback prefill
  ---------------------------------------------------------------- */
  var waFallback = document.getElementById("wa-fallback");
  if (waFallback) {
    waFallback.addEventListener("click", function () {
      var form = document.getElementById("contact-form");
      if (!form) return;
      var get = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ""; };
      var msg = "Hello Egyptian Canadian Company,%0A" +
        "Name: " + encodeURIComponent(get("first_name") + " " + get("last_name")) + "%0A" +
        "Email: " + encodeURIComponent(get("email")) + "%0A" +
        "Tel: " + encodeURIComponent(get("tel")) + "%0A" +
        "Message: " + encodeURIComponent(get("message"));
      waFallback.href = "https://api.whatsapp.com/send?phone=201061130918&text=" + msg;
    });
  }
})();
