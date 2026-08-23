(function () {
  "use strict";

  // Temporary debug switch: visiting any page with ?nojs=1 in the URL skips
  // all of this site's JS, to help bisect whether a rendering issue is
  // caused by our scripts or is pure CSS/layout. Remove once diagnosed.
  if (location.search.indexOf("nojs=1") !== -1) return;

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
  // what `position: sticky` used to give it. Done as a manual 3-state
  // polyfill (static -> fixed -> absolute) instead, because a *single*
  // `position: sticky` element anywhere on the page turned out to be
  // enough to trigger Chromium/Vivaldi's dynamic-toolbar-resize
  // repositioning bug (confirmed by elimination against .site-header and
  // .drill-hero-sticky, both since converted away from sticky too, with
  // the jump persisting each time until this one was also removed).
  // Once a state below is applied, the browser's own compositor tracks
  // scroll natively — updateArchivPin only compares numbers and touches
  // the DOM on an actual state change, so there's no per-frame layout
  // work for it to fall behind on.
  var archivPin = document.getElementById("archiv-pin");
  if (archivPin) {
    var sectionInner = archivPin.parentElement;
    var PIN_TOP = 55;

    var pinStartY = 0;
    var releaseY = 0;
    var releasedTop = 0;
    var pinState = "static";

    function documentTop(el) {
      var top = 0;
      while (el) {
        top += el.offsetTop;
        el = el.offsetParent;
      }
      return top;
    }

    function updateArchivPin() {
      var y = window.scrollY;
      var nextState = y <= pinStartY ? "static" : y < releaseY ? "pinned" : "released";
      if (nextState === pinState) return;
      pinState = nextState;
      archivPin.classList.toggle("is-pinned", nextState === "pinned");
      archivPin.classList.toggle("is-released", nextState === "released");
      archivPin.style.top = nextState === "released" ? releasedTop + "px" : "";
    }

    function measureArchivPin() {
      pinState = "static";
      archivPin.classList.remove("is-pinned", "is-released");
      archivPin.style.top = "";

      var pinnedHeight = archivPin.offsetHeight;
      var containerBottom = documentTop(sectionInner) + sectionInner.offsetHeight;
      pinStartY = documentTop(archivPin) - PIN_TOP;
      releaseY = containerBottom - pinnedHeight - PIN_TOP;
      releasedTop = sectionInner.offsetHeight - pinnedHeight;
      updateArchivPin();
    }

    var pinTicking = false;
    function onArchivScroll() {
      if (!pinTicking) {
        pinTicking = true;
        requestAnimationFrame(function () {
          pinTicking = false;
          updateArchivPin();
        });
      }
    }

    window.addEventListener("scroll", onArchivScroll, { passive: true });
    window.addEventListener("resize", measureArchivPin);

    if ("ResizeObserver" in window) {
      var pinResizeObserver = new ResizeObserver(measureArchivPin);
      pinResizeObserver.observe(sectionInner);
    }

    measureArchivPin();

    // The pin ends up flush with the bottom edge of .section-inner's
    // padding box once released — same edge native `position: sticky`
    // would've released at. That's shorter than the footer that follows,
    // so without this it would sit on top of the footer for the last
    // stretch of the page. Watching the footer directly and fading the pin
    // out exactly when it appears sidesteps that.
    var siteFooter = document.querySelector(".site-footer");
    if (siteFooter && "IntersectionObserver" in window) {
      var footerObserver = new IntersectionObserver(function (entries) {
        archivPin.classList.toggle("is-hidden-by-footer", entries[0].isIntersecting);
      });
      footerObserver.observe(siteFooter);
    }
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
    });
  }
})();
