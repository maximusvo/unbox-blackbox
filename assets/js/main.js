(function () {
  "use strict";

  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open);
    });
  }

  // Pins the archive headline + filter bar below the header while the
  // teaser list scrolls past, releasing again once the section ends —
  // the same behavior `position: sticky` used to give it. Done by hand as
  // a scrollY -> translateY calculation instead, because stacking that
  // sticky element on top of the already-sticky .site-header (two sticky
  // layers with hardcoded pixel offsets) is what made Chromium's dynamic
  // toolbar resize (Vivaldi/Chrome mobile) snap the teaser list underneath
  // every time the toolbar showed or hid. This math only reads
  // document-absolute offsets and the live scroll position — nothing here
  // depends on viewport height, so a toolbar animation has nothing to feed
  // into it.
  var archivPin = document.getElementById("archiv-pin");
  var remeasureArchivPin = null;
  if (archivPin) {
    var sectionInner = archivPin.parentElement;
    var PIN_TOP = 55;

    var pinStart = 0;
    var releaseAt = 0;

    function documentTop(el) {
      var top = 0;
      while (el) {
        top += el.offsetTop;
        el = el.offsetParent;
      }
      return top;
    }

    function measureArchivPin() {
      var containerBottom = documentTop(sectionInner) + sectionInner.offsetHeight;
      pinStart = documentTop(archivPin) - PIN_TOP;
      releaseAt = containerBottom - archivPin.offsetHeight - PIN_TOP;
      applyArchivPin();
    }

    var pinTicking = false;
    function applyArchivPin() {
      pinTicking = false;
      var scrollY = window.scrollY;
      var translate = scrollY <= pinStart ? 0 : Math.min(scrollY, releaseAt) - pinStart;
      archivPin.style.transform = translate > 0 ? "translateY(" + translate + "px)" : "";
    }

    function onArchivScroll() {
      if (!pinTicking) {
        pinTicking = true;
        requestAnimationFrame(applyArchivPin);
      }
    }

    window.addEventListener("scroll", onArchivScroll, { passive: true });
    window.addEventListener("resize", measureArchivPin);

    if ("ResizeObserver" in window) {
      var pinResizeObserver = new ResizeObserver(measureArchivPin);
      pinResizeObserver.observe(sectionInner);
      pinResizeObserver.observe(archivPin);
    }

    remeasureArchivPin = measureArchivPin;
    measureArchivPin();
  }

  var filters = document.getElementById("filters");
  var grid = document.getElementById("teaser-grid");
  if (filters && grid) {
    var buttons = filters.querySelectorAll(".filter-btn");
    var teasers = grid.querySelectorAll(".teaser");

    filters.addEventListener("click", function (event) {
      var btn = event.target.closest(".filter-btn");
      if (!btn) return;

      buttons.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");

      var filter = btn.getAttribute("data-filter");
      teasers.forEach(function (teaser) {
        var cats = (teaser.getAttribute("data-cats") || "").split(" ");
        var show = filter === "all" || cats.indexOf(filter) !== -1;
        teaser.classList.toggle("is-hidden", !show);
      });

      // Hiding/showing teasers changes the grid's (and so the section's)
      // height, which shifts where the pin should release.
      if (remeasureArchivPin) remeasureArchivPin();
    });
  }
})();
