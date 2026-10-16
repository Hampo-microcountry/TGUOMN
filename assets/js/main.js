
/*
 * TGUOMN — Main JavaScript
 * The Great Union of Micro Nations
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
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
