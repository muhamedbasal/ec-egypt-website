/* =========================================================================
   Egyptian Canadian Company (EC) — main.js
   Nav toggle · animated counters · scroll reveal · testimonial slider
   · graceful image fallbacks. Vanilla JS, no dependencies.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
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
      if (nav.classList.contains("is-open")) closeNav(); else openNav();
    });
    if (backdrop) backdrop.addEventListener("click", closeNav);
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Graceful image fallback ----------
     If a real photo is missing (404), swap the <img> for a styled box
     that shows the descriptive label, so the layout stays clean. */
  function buildPlaceholder(img) {
    var ph = document.createElement("div");
    var cls = img.getAttribute("data-ph-class") || "media-ph";
    ph.className = cls + " " + (img.className || "");
    ph.setAttribute("role", "img");
    var label = img.getAttribute("data-label") || img.getAttribute("alt") || "";
    ph.setAttribute("aria-label", label);
    ph.textContent = label;
    if (img.parentNode) img.parentNode.replaceChild(ph, img);
  }
  Array.prototype.forEach.call(document.querySelectorAll("img[data-fallback]"), function (img) {
    img.addEventListener("error", function () { buildPlaceholder(img); });
    // Already failed before listener attached (cached)
    if (img.complete && img.naturalWidth === 0) buildPlaceholder(img);
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var duration = 1600;
    var start = null;
    var fmt = new Intl.NumberFormat("en-US");
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt.format(target);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ---------- Testimonial slider ---------- */
  var slider = document.querySelector("[data-slider]");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".testi__slide"));
    var dotsWrap = slider.querySelector(".testi__dots");
    var prevBtn = slider.querySelector("[data-prev]");
    var nextBtn = slider.querySelector("[data-next]");
    var index = 0;
    var timer = null;
    var INTERVAL = 6000;

    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.className = "testi__dot";
      b.type = "button";
      b.setAttribute("aria-label", "Show testimonial " + (i + 1));
      b.addEventListener("click", function () { go(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        s.classList.toggle("is-active", n === index);
        s.setAttribute("aria-hidden", n === index ? "false" : "true");
      });
      dots.forEach(function (d, n) { d.classList.toggle("is-active", n === index); });
    }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }
    function restart() { if (timer) clearInterval(timer); timer = setInterval(next, INTERVAL); }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });
    slider.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    slider.addEventListener("mouseleave", restart);

    go(0);
    restart();
  }

  /* ---------- Footer year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Contact form: WhatsApp fallback prefill ---------- */
  var waFallback = document.getElementById("wa-fallback");
  if (waFallback) {
    waFallback.addEventListener("click", function (e) {
      var form = document.getElementById("contact-form");
      if (!form) return;
      var get = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ""; };
      var msg =
        "Hello Egyptian Canadian Company,%0A" +
        "Name: " + encodeURIComponent(get("first_name") + " " + get("last_name")) + "%0A" +
        "Email: " + encodeURIComponent(get("email")) + "%0A" +
        "Tel: " + encodeURIComponent(get("tel")) + "%0A" +
        "Message: " + encodeURIComponent(get("message"));
      waFallback.href = "https://api.whatsapp.com/send?phone=201061130918&text=" + msg;
    });
  }
})();
