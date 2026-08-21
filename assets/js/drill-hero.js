(function () {
  "use strict";

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

  function render() {
    ticking = false;

    var scrollable = wrapper.offsetHeight - window.innerHeight;
    var progress = 0;
    if (scrollable > 0) {
      var rect = wrapper.getBoundingClientRect();
      progress = Math.min(1, Math.max(0, -rect.top / scrollable));
    }

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

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  render();
})();
