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

  // The sticky "Texte & Talks" headline and filter bar should disappear once
  // the footer is reached. Pure `position: sticky` can't guarantee that on
  // its own — it only releases once its containing block (.section-inner)
  // has scrolled past by at least the pinned elements' own height, which
  // needs the footer to be at least that tall. Ours is shorter, so they'd
  // otherwise sit on top of the footer at the bottom of the page. Watching
  // the footer directly sidesteps that and always hides them exactly when
  // the footer appears.
  var pinned = document.querySelectorAll("#archiv .section-headline, #archiv .filters");
  var siteFooter = document.querySelector(".site-footer");
  if (pinned.length && siteFooter && "IntersectionObserver" in window) {
    var footerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        pinned.forEach(function (el) {
          el.classList.toggle("is-hidden-by-footer", entry.isIntersecting);
        });
      });
    });
    footerObserver.observe(siteFooter);
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
