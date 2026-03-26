/**
 * seo.js - SEO Reference documentation site
 * https://kb-rc.github.io/SEO-For-Developers/
 */

(function () {
  "use strict";

  // ── Theme Toggle ─────────────────────────────────────────────────
  const html = document.documentElement;
  const iconSun = document.getElementById("icon-sun");
  const iconMoon = document.getElementById("icon-moon");

  function applyTheme(t) {
    html.setAttribute("data-theme", t);
    if (iconSun) iconSun.style.display = t === "dark" ? "none" : "block";
    if (iconMoon) iconMoon.style.display = t === "dark" ? "block" : "none";
    localStorage.setItem("seo-ref-theme", t);
  }

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  // Restore saved theme
  const savedTheme = localStorage.getItem("seo-ref-theme");
  if (savedTheme) applyTheme(savedTheme);

  // ── Mobile Menu ───────────────────────────────────────────────────
  const menuBtn = document.getElementById("mobile-menu-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("open");
      overlay.classList.toggle("active", isOpen);
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");
    });

    // Close sidebar when a nav link is tapped on mobile
    sidebar.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 720) {
          sidebar.classList.remove("open");
          overlay.classList.remove("active");
          menuBtn.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  // ── Active Nav Link ───────────────────────────────────────────────
  const page = document.body.dataset.page;
  if (page) {
    document.querySelectorAll(`.nav-link[data-page="${page}"]`).forEach((l) => {
      l.classList.add("active");
    });
  }

  // ── Table of Contents (auto-generated) ───────────────────────────
  function buildToC() {
    const tocEl = document.getElementById("toc-content");
    if (!tocEl) return;

    const headings = document.querySelectorAll(".content h2[id]");
    if (!headings.length) {
      tocEl.innerHTML = "";
      return;
    }

    tocEl.innerHTML = Array.from(headings)
      .map(
        (h) =>
          `<a class="toc-link sub" href="#${h.id}" data-anchor="${
            h.id
          }">${h.textContent.trim()}</a>`
      )
      .join("");
  }

  buildToC();

  // ── ToC Scroll Highlight (IntersectionObserver) ───────────────────
  function initToCHighlight() {
    const headings = document.querySelectorAll(".content h2[id]");
    if (!headings.length) return;

    const mainEl = document.querySelector(".main");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document
              .querySelectorAll(".toc-link")
              .forEach((l) => l.classList.remove("active"));
            const link = document.querySelector(
              `.toc-link[data-anchor="${entry.target.id}"]`
            );
            if (link) link.classList.add("active");
          }
        });
      },
      {
        root: mainEl || null,
        rootMargin: "-10% 0px -75% 0px",
      }
    );

    headings.forEach((h) => observer.observe(h));
  }

  initToCHighlight();

  // ── Copy Buttons ──────────────────────────────────────────────────
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const blockId = btn.getAttribute("data-copy");
      const block = document.getElementById(blockId);
      if (!block) return;

      // Get plain text content (strip HTML tags used for syntax highlighting)
      const text = block.textContent;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          const orig = btn.textContent;
          btn.textContent = "Copied!";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = orig;
            btn.classList.remove("copied");
          }, 1800);
        })
        .catch(() => {
          // Fallback for older browsers
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          btn.textContent = "Copied!";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("copied");
          }, 1800);
        });
    });
  });

  // ── Utility: Dynamic JSON-LD injection ───────────────────────────
  /**
   * Injects a JSON-LD block into <head>.
   * Removes any previous block with the same id to avoid duplicates.
   * @param {Object} schema - Schema.org object
   * @param {string} id     - Unique ID for the script tag
   */
  function injectJSONLD(schema, id) {
    if (id === undefined) id = "jsonld-main";
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.text = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  // ── Utility: Dynamic page title ───────────────────────────────────
  /**
   * Sets document.title following keyword-first, brand-last convention.
   * Use only when SSR is not available. Prefer static <title> in HTML.
   * @param {string} primary - Primary keyword / page topic
   * @param {string} brand   - Brand name suffix
   */
  function setPageTitle(primary, brand) {
    if (brand === undefined) brand = "SEO For Developers";
    document.title = primary + " \u2014 " + brand;
  }

  // ── Utility: Client-side redirect (last resort only) ─────────────
  /**
   * Server-side 301 redirects are always preferred.
   * Use this only for client-side SPA routing fallbacks.
   * Configuring 301s in nginx/Caddy/Vercel/GitHub Pages is the correct approach.
   */
  var REDIRECTS = {
    "/SEO-For-Developers/blog/json-ld-guide.html":
      "/SEO-For-Developers/docs/json-ld.html",
    "/SEO-For-Developers/docs/structured_data":
      "/SEO-For-Developers/docs/json-ld.html",
  };

  var redirect = REDIRECTS[window.location.pathname];
  if (redirect) window.location.replace(redirect);

  // Expose utilities for console use / SPA integration
  window.seoRef = { injectJSONLD: injectJSONLD, setPageTitle: setPageTitle };
})();
