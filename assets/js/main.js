
/*
 * TGUOMN — Main JavaScript
 * The Great Union of Micro Nations
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Add app-shell styling when launched from a home-screen icon.
  if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
    document.documentElement.classList.add("is-installed-app");
  }
  // Automatically update the copyright year.
  const yearElements = document.querySelectorAll("[data-current-year]");

  yearElements.forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  // Highlight the current page in the navigation.
  const currentPage = window.location.pathname
    .split("/")
    .pop() || "index.html";

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
      const isExpanded =
        menuButton.getAttribute("aria-expanded") === "true";

      menuButton.setAttribute("aria-expanded", String(!isExpanded));
      navigation.classList.toggle("is-open", !isExpanded);
    });
  }


  // Mobile home-screen reminder. Hide it when already installed or dismissed.
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  const isMobile = window.matchMedia("(max-width: 760px)").matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  let dismissed = false;
  try {
    dismissed = localStorage.getItem("tguomn-home-screen-dismissed") === "yes";
  } catch (_) {}

  if (isMobile && !isStandalone && !dismissed) {
    const reminder = document.createElement("aside");
    reminder.className = "home-screen-reminder";
    reminder.setAttribute("aria-label", "Add TGUOMN to your home screen");
    reminder.innerHTML = `
      <div class="home-screen-reminder__copy">
        <strong>Keep TGUOMN on your home screen</strong>
        <p>Add this website to your phone for quick access, like an app.</p>
        <div class="home-screen-reminder__instructions" hidden></div>
      </div>
      <div class="home-screen-reminder__actions">
        <button type="button" class="home-screen-reminder__add">How to add</button>
        <button type="button" class="home-screen-reminder__close" aria-label="Dismiss reminder">×</button>
      </div>
    `;
    document.body.appendChild(reminder);

    const help = reminder.querySelector(".home-screen-reminder__instructions");
    reminder.querySelector(".home-screen-reminder__add").addEventListener("click", () => {
      const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      help.hidden = !help.hidden;
      help.textContent = isApple
        ? "In Safari, tap Share, then choose “Add to Home Screen.”"
        : "In your browser, open the menu (⋮), then choose “Add to Home screen” or “Install app” if available.";
      reminder.querySelector(".home-screen-reminder__add").textContent =
        help.hidden ? "How to add" : "Hide instructions";
    });

    reminder.querySelector(".home-screen-reminder__close").addEventListener("click", () => {
      reminder.remove();
      try {
        localStorage.setItem("tguomn-home-screen-dismissed", "yes");
      } catch (_) {}
    });
  }

  // Register the service worker for offline support and PWA features.
  if ("serviceWorker" in navigator && window.isSecureContext) {
    navigator.serviceWorker.register("./sw.js")
      .then((registration) => {
        console.log(
          "TGUOMN service worker registered:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error(
          "TGUOMN service worker registration failed:",
          error
        );
      });
  }
});
