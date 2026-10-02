/* EC-owned GA4 measurement with explicit consent. Analytics is denied until the
   visitor chooses; no identifiers or form values are sent by this file. */
(function () {
  "use strict";
  var measurementId = "G-8Q120JRE14";
  var consentKey = "ec_analytics_consent";
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });
  var tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  document.head.appendChild(tag);
  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  function getConsent() {
    try { return window.localStorage.getItem(consentKey); } catch (_) { return null; }
  }
  function setConsent(choice) {
    try { window.localStorage.setItem(consentKey, choice); } catch (_) {}
    window.gtag("consent", "update", { analytics_storage: choice });
  }
  function showConsentBanner() {
    if (getConsent()) return;
    var banner = document.createElement("aside");
    banner.setAttribute("aria-label", "Analytics consent");
    banner.style.cssText = "position:fixed;z-index:9999;left:16px;right:16px;bottom:16px;max-width:720px;margin:auto;padding:16px 18px;border:1px solid #d7b55d;border-radius:14px;background:#173c2a;color:#fff;box-shadow:0 12px 32px rgba(0,0,0,.35);font:14px/1.55 system-ui,sans-serif";
    banner.innerHTML = "<div style=\"margin-bottom:10px\">نستخدم قياسًا مجهولًا لفهم استخدام الموقع وتحسينه. لن نفعّل تحليلات Google إلا بعد موافقتك. <span style=\"opacity:.8\">We use analytics to improve the site; Google Analytics stays off until you choose.</span></div><div style=\"display:flex;gap:8px;flex-wrap:wrap\"><button type=\"button\" data-consent=\"accept\" style=\"border:0;border-radius:999px;padding:9px 16px;background:#d7b55d;color:#173c2a;font-weight:700;cursor:pointer\">السماح بالتحليلات / Allow</button><button type=\"button\" data-consent=\"reject\" style=\"border:1px solid #bcd0c2;border-radius:999px;padding:9px 16px;background:transparent;color:#fff;cursor:pointer\">رفض / Reject</button></div>";
    document.body.appendChild(banner);
    banner.addEventListener("click", function (event) {
      var button = event.target.closest("[data-consent]");
      if (!button) return;
      setConsent(button.getAttribute("data-consent") === "accept" ? "granted" : "denied");
      banner.remove();
    });
  }
  if (getConsent() === "granted") window.gtag("consent", "update", { analytics_storage: "granted" });
  else if (getConsent() === "denied") window.gtag("consent", "update", { analytics_storage: "denied" });
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showConsentBanner);
  else showConsentBanner();

  var allowed = ["contact_whatsapp_click", "contact_phone_click", "contact_email_click", "rfq_form_start", "rfq_whatsapp_handoff"];
  window.ecTrack = function (event, location) {
    if (allowed.indexOf(event) === -1) return;
    window.dataLayer.push({
      event: event,
      page_language: document.documentElement.lang === "ar" ? "ar" : "en",
      contact_location: location
    });
  };
  document.addEventListener("click", function (event) {
    if (event.defaultPrevented) return;
    var link = event.target.closest && event.target.closest("a[href]");
    if (!link) return;
    var href = link.getAttribute("href");
    var type = /^https:\/\/(api\.whatsapp\.com|wa\.me)\//.test(href) ? "contact_whatsapp_click" :
      href.indexOf("tel:") === 0 ? "contact_phone_click" :
      href.indexOf("mailto:") === 0 ? "contact_email_click" : null;
    if (type) window.ecTrack(type, link.closest(".product") ? "product_card" :
      link.closest("form") ? "contact_form" : link.closest("footer") ? "footer" :
      link.classList.contains("wa-float") ? "floating_button" : "page");
  });
  var form = document.getElementById("contact-form");
  if (form) form.addEventListener("input", function () {
    window.ecTrack("rfq_form_start", "contact_form");
  }, { once: true });
})();
