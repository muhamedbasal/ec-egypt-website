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
  var html = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  }

  // The URL selects the language. Both versions contain readable static HTML.
  applyLang(html.lang === "ar" ? "ar" : "en");

  /* ----------------------------------------------------------------
     MOBILE NAV
  ---------------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  var backdrop = document.querySelector(".nav-backdrop");
  var mobileNav = window.matchMedia("(max-width: 900px)");
  function syncNav() {
    if (nav) nav.inert = mobileNav.matches && !nav.classList.contains("is-open");
  }
  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    syncNav();
  }
  function openNav() {
    nav.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    syncNav();
    var firstLink = nav.querySelector("a");
    if (firstLink) firstLink.focus();
  }
  if (toggle && nav) {
    document.documentElement.classList.add("nav-ready");
    syncNav();
    mobileNav.addEventListener("change", closeNav);
    toggle.addEventListener("click", function () {
      nav.classList.contains("is-open") ? closeNav() : openNav();
    });
    if (backdrop) backdrop.addEventListener("click", closeNav);
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });
    document.addEventListener("keydown", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (e.key === "Escape") { closeNav(); toggle.focus(); }
      if (e.key === "Tab" && mobileNav.matches) {
        var links = Array.from(nav.querySelectorAll("a[href]"));
        var first = links[0], last = links[links.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === toggle)) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); toggle.focus();
        }
      }
    });
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
  if (!reducedMotion && "IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { el.classList.add("reveal-ready"); io.observe(el); });
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
  if (!reducedMotion && "IntersectionObserver" in window && counters.length) {
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
      b.addEventListener("click", function () { go(i); });
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });
    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("is-active", n === index); s.setAttribute("aria-hidden", n === index ? "false" : "true"); });
      dots.forEach(function (d, n) { d.classList.toggle("is-active", n === index); d.setAttribute("aria-pressed", n === index ? "true" : "false"); });
    }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }
    // Manual navigation avoids moving content while a visitor is reading.
    if (nextBtn) nextBtn.addEventListener("click", next);
    if (prevBtn) prevBtn.addEventListener("click", prev);
    go(0);
  }

  /* ----------------------------------------------------------------
     PRODUCT FILTER CHIPS
  ---------------------------------------------------------------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  if (chips.length) {
    var products = document.querySelectorAll(".product[data-cat]");
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.classList.contains("is-active") ? "true" : "false");
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        var f = chip.getAttribute("data-filter");
        products.forEach(function (p) {
          var show = f === "all" || p.getAttribute("data-cat") === f;
          p.style.display = show ? "" : "none";
        });
      });
    });

    // Product links must also work when a category filter hides their target.
    function revealLinkedProduct(hash) {
      var id;
      try { id = decodeURIComponent(hash.slice(1)); } catch (e) { return; }
      var target = document.getElementById(id);
      var allChip = document.querySelector('.chip[data-filter="all"]');
      if (!target || !Array.from(products).includes(target) || target.style.display !== "none" || !allChip) return;
      allChip.click();
      target.scrollIntoView({ block: "start", behavior: "instant" });
    }
    window.addEventListener("hashchange", function () {
      revealLinkedProduct(window.location.hash);
    });
    document.addEventListener("click", function (e) {
      var link = e.target.closest("a[href]");
      if (!link || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      var url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname &&
          url.search === window.location.search && url.hash === window.location.hash) {
        revealLinkedProduct(url.hash);
      }
    });
  }

  /* ----------------------------------------------------------------
     BACK TO TOP
  ---------------------------------------------------------------- */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    window.addEventListener("scroll", function () { toTop.classList.toggle("show", window.scrollY > 600); }, { passive: true });
    toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" }); });
  }

  /* ----------------------------------------------------------------
     FOOTER YEAR
  ---------------------------------------------------------------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------------
     CONTACT FORM → WhatsApp (works even without a form backend)
  ---------------------------------------------------------------- */
  var WA_PHONE = "201061130918";
  var contactForm = document.getElementById("contact-form");

  // Keep the selected catalogue product when preparing a quote; preserve visitor edits.
  if (contactForm) {
    var productField = contactForm.elements["product"];
    var selectedProduct = new URLSearchParams(window.location.search).get("product");
    if (productField && !productField.value && selectedProduct) {
      productField.value = selectedProduct.trim().slice(0, productField.maxLength > 0 ? productField.maxLength : 160);
    }
  }

  function buildWaLink(form) {
    var get = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ""; };
    var msg = "Hello Egyptian Canadian Company,%0A" +
      "Name: " + encodeURIComponent(get("first_name") + " " + get("last_name")) + "%0A" +
      "Email: " + encodeURIComponent(get("email")) + "%0A" +
      "Tel: " + encodeURIComponent(get("tel")) + "%0A" +
      "Product: " + encodeURIComponent(get("product")) + "%0A" +
      "Quantity: " + encodeURIComponent(get("quantity")) + "%0A" +
      "Destination: " + encodeURIComponent(get("destination")) + "%0A" +
      "Message: " + encodeURIComponent(get("message"));
    return "https://api.whatsapp.com/send?phone=" + WA_PHONE + "&text=" + msg;
  }

  var waFallback = document.getElementById("wa-fallback");
  if (waFallback && contactForm) {
    waFallback.addEventListener("click", function (e) {
      if (!contactForm.reportValidity()) { e.preventDefault(); return; }
      waFallback.href = buildWaLink(contactForm);
    });
  }

  // A handoff opens WhatsApp; only the visitor can send the message there.
  if (contactForm && contactForm.getAttribute("data-delivery") === "whatsapp") {
    var submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = false;
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.reportValidity()) return;
      if (window.ecTrack) window.ecTrack("rfq_whatsapp_handoff", "contact_form");
      window.location.assign(buildWaLink(contactForm));
    });
  }

  /* ----------------------------------------------------------------
     FLOATING WHATSAPP BUTTON (injected on every page)
  ---------------------------------------------------------------- */
  if (!document.querySelector(".wa-float")) {
    var wa = document.createElement("a");
    wa.className = "wa-float";
    wa.href = "https://api.whatsapp.com/send?phone=" + WA_PHONE;
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.setAttribute("aria-label", "Chat with us on WhatsApp");
    wa.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A2.8 2.8 0 0 0 6 8c0 1.7 1.2 3.3 1.4 3.5s2.4 3.7 5.8 5c2.1.8 2.1.5 2.5.5a2.5 2.5 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/></svg>';
    document.body.appendChild(wa);
  }
})();
