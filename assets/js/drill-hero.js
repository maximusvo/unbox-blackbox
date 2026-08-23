(function () {
  "use strict";

  // Temporary debug switch, see main.js — remove once diagnosed.
  if (location.search.indexOf("nojs=1") !== -1) return;

  var wrapper = document.getElementById("drill-hero-wrapper");
  if (!wrapper) return;

  var flip = document.getElementById("drill-flip");
  var hint = wrapper.querySelector(".drill-scroll-hint");
  var parts = Array.prototype.slice.call(document.querySelectorAll(".drill-part"));
  if (!flip || !parts.length) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Pivot each part's rotation around its own center (from its assembled
  // bounding box) instead of the SVG's (0,0) origin, and cache its explode
  // vector/rotation so the scroll handler only does cheap arithmetic.
  parts.forEach(function (el) {
    var bbox = el.getBBox();
    var cx = bbox.x + bbox.width / 2;
    var cy = bbox.y + bbox.height / 2;
    el.style.transformOrigin = cx + "px " + cy + "px";

    var ex = (el.getAttribute("data-ex") || "0,0").split(",").map(Number);
    el.__dx = ex[0];
    el.__dy = ex[1];
    el.__rot = parseFloat(el.getAttribute("data-rot") || "0");
  });

  if (reduceMotion) {
    parts.forEach(function (el) {
      el.style.transform =
        "translate(" + el.__dx + "px," + el.__dy + "px) rotate(" + el.__rot + "deg)";
    });
    return;
  }

  var ticking = false;

  // Baseline viewport height, frozen against toolbar animation. Mobile
  // browsers shrink/grow window.innerHeight live as their address bar
  // collapses or reappears while the page scrolls (that's the "visual
  // viewport", separate from the stable viewport our CSS sizes off).
  // Reading it fresh on every scroll tick fed that fluctuation straight
  // into the progress calculation below, which is what made the hero
  // visibly jump on Firefox/Vivaldi. We only want to react to a genuine
  // resize (rotation, real window resize), which always changes the
  // width too — a toolbar show/hide never does.
  var viewportWidth = window.innerWidth;
  var viewportHeight = window.innerHeight;

  function syncViewportSize() {
    if (window.innerWidth !== viewportWidth) {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
    }
  }

  // Applied vs. target progress: even with a frozen viewportHeight, the
  // *scrollY* our getBoundingClientRect() math depends on can still get
  // yanked by the browser itself mid-scroll — some Firefox/Vivaldi mobile
  // builds adjust the actual scroll offset when their toolbar collapse
  // changes how much of the document fits on screen. That's a real (if
  // browser-forced) scrollY change, so freezing viewportHeight alone
  // doesn't stop it. Rather than snapping straight to it, we ease toward
  // it each frame, so a one-frame scrollY jump turns into a quick slide
  // instead of a visible pop.
  var appliedProgress = 0;

  function computeTargetProgress() {
    var scrollable = wrapper.offsetHeight - viewportHeight;
    if (scrollable <= 0) return 0;
    var rect = wrapper.getBoundingClientRect();
    return Math.min(1, Math.max(0, -rect.top / scrollable));
  }

  function applyProgress(progress) {
    // phase 1 (0 -> 0.45): the assembled tool turns around.
    // phase 2 (0.45 -> 1): it comes apart into its parts.
    var flipPhase = Math.min(1, progress / 0.45);
    var explodePhase = Math.min(1, Math.max(0, (progress - 0.45) / 0.55));

    flip.style.transform = "scaleX(" + Math.cos(flipPhase * Math.PI) + ")";

    parts.forEach(function (el) {
      var dx = el.__dx * explodePhase;
      var dy = el.__dy * explodePhase;
      var rot = el.__rot * explodePhase;
      el.style.transform = "translate(" + dx + "px," + dy + "px) rotate(" + rot + "deg)";
    });

    if (hint) {
      hint.style.opacity = Math.max(0, 1 - progress * 12);
    }
  }

  function render() {
    ticking = false;

    var targetProgress = computeTargetProgress();
    var delta = targetProgress - appliedProgress;

    if (Math.abs(delta) < 0.0008) {
      appliedProgress = targetProgress;
    } else {
      appliedProgress += delta * 0.22;
      // Keep easing next frame until we've caught up.
      onScroll();
    }

    applyProgress(appliedProgress);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  function onResize() {
    syncViewportSize();
    onScroll();
  }

  // Only listen for scroll while the (320svh-tall) hero is actually on
  // screen. A `getBoundingClientRect()` read forces a synchronous layout,
  // and without this, that ran on *every* scroll event site-wide — including
  // deep in the teaser list, thousands of pixels past the hero. On mobile,
  // that main-thread cost lands on top of the browser's own reflow work
  // while its toolbar show/hide animation runs, which is a plausible source
  // of the content lagging behind that animation and then jumping to catch
  // up. Detaching the listener once the hero scrolls out of view removes
  // that cost from the rest of the page entirely.
  var scrollActive = false;

  function enableScroll() {
    if (scrollActive) return;
    scrollActive = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function disableScroll() {
    if (!scrollActive) return;
    scrollActive = false;
    window.removeEventListener("scroll", onScroll);
  }

  if ("IntersectionObserver" in window) {
    var visibilityObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        enableScroll();
      } else {
        disableScroll();
      }
    });
    visibilityObserver.observe(wrapper);
  } else {
    enableScroll();
  }

  window.addEventListener("resize", onResize);
  render();
})();
