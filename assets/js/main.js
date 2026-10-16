/*
 * TGUOMN — Main JavaScript
 * The Great Union of Micro Nations
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Add app-shell styling when launched from a home-screen icon.
  const standaloneQuery = window.matchMedia("(display-mode: standalone)");
  const isAppInstalled = () =>
    standaloneQuery.matches || window.navigator.standalone === true;

  if (isAppInstalled()) {
    document.documentElement.classList.add("is-installed-app");
  }

  // Capture the browser's native install prompt when supported.
  let deferredInstallPrompt = null;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    const installButton = document.querySelector(".home-screen-reminder__add");
    if (installButton) installButton.textContent = "Install app";
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    document.querySelector(".home-screen-reminder")?.remove();
    document.documentElement.classList.add("is-installed-app");
  });

  // Automatically update the copyright year.
  const yearElements = document.querySelectorAll("[data-current-year]");
  yearElements.forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  // Highlight the current page in the navigation.
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a[href]").forEach((link) => {
    const linkPage = link.getAttribute("href")
      .split("/")
      .pop()
      .split("?")[0]
      .split("#")[0];

    if (linkPage === currentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  // Allow the mobile navigation toggle to work, if present.
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-main-navigation]");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isExpanded));
      navigation.classList.toggle("is-open", !isExpanded);
    });
  }

  // Home-screen popup: use the native install dialog where the browser supports it.
  const isMobile = window.matchMedia("(max-width: 760px)").matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  let dismissed = false;
  try {
    dismissed = localStorage.getItem("tguomn-home-screen-dismissed") === "yes";
  } catch (_) {}

  if (isMobile && !isAppInstalled() && !dismissed) {
    const reminder = document.createElement("aside");
    reminder.className = "home-screen-reminder";
    reminder.setAttribute("aria-label", "Add TGUOMN to your home screen");
    reminder.innerHTML = `
      <div class="home-screen-reminder__copy">
        <strong>Install TGUOMN</strong>
        <p>Add TGUOMN to your home screen for an app-like experience.</p>
        <div class="home-screen-reminder__instructions" hidden></div>
      </div>
      <div class="home-screen-reminder__actions">
        <button type="button" class="home-screen-reminder__add">Add to Home</button>
        <button type="button" class="home-screen-reminder__close" aria-label="Dismiss popup">×</button>
      </div>
    `;
    document.body.appendChild(reminder);

    const help = reminder.querySelector(".home-screen-reminder__instructions");
    const addButton = reminder.querySelector(".home-screen-reminder__add");

    addButton.addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const result = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;

        if (result && result.outcome === "accepted") {
          reminder.remove();
          return;
        }

        addButton.textContent = "Try again";
        return;
      }

      const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      help.hidden = false;
      help.textContent = isApple
        ? "To install: open this page in Safari, tap Share, then choose “Add to Home Screen.”"
        : "If no install dialog appeared, open your browser menu (⋮) and choose “Add to Home screen” or “Install app.”";
      addButton.textContent = "Instructions";
    });

    reminder.querySelector(".home-screen-reminder__close").addEventListener("click", () => {
      reminder.remove();
      try {
        localStorage.setItem("tguomn-home-screen-dismissed", "yes");
      } catch (_) {}
    });

    // The install event can arrive after the popup has already appeared.
    if (deferredInstallPrompt) addButton.textContent = "Install app";
  }

  // Register the service worker for offline support and PWA features.
  if ("serviceWorker" in navigator && window.isSecureContext) {
    navigator.serviceWorker.register("./sw.js")
      .then((registration) => {
        console.log("TGUOMN service worker registered:", registration.scope);
      })
      .catch((error) => {
        console.error("TGUOMN service worker registration failed:", error);
      });
  }
});
