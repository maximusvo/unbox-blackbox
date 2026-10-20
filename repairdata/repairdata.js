(function () {
  "use strict";

  var root = document.querySelector(".rd");
  if (!root) return;

  var STATUS = [
    { key: "Fixed", label: "Repariert", cls: "fixed" },
    { key: "Repairable", label: "Reparierbar", cls: "repairable" },
    { key: "End of life", label: "End of life", cls: "eol" }
  ];
  var state = { scope: "all", kind: "all", sort: "n" };
  var openIds = new Set();
  var DATA, BARRIERS;

  function $(name) { return root.querySelector('[data-rd="' + name + '"]'); }
  var rowsEl = $("rows");
  var tip = $("tooltip");
  // Tooltip direkt an <body>, damit position: fixed nicht von Eltern-Transforms abhängt
  document.body.appendChild(tip);

  var fmtInt = new Intl.NumberFormat("de-DE");
  var fmtCompact = new Intl.NumberFormat("de-DE", { notation: "compact", maximumFractionDigits: 1 });
  function pct(x) { return isFinite(x) ? Math.round(x * 100) + " %" : "–"; }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function derive(c) {
    var s = c.status;
    var known = c.n - s.Unknown;
    return {
      c: c,
      known: known,
      fixed: s.Fixed / known,
      repairable: s.Repairable / known,
      eol: s["End of life"] / known,
      unknown: s.Unknown / c.n,
      barrierTotal: c.barriers.reduce(function (a, b) { return a + b[1]; }, 0)
    };
  }

  function current() {
    var list = DATA.scopes[state.scope]
      .filter(function (c) { return state.kind === "all" || c.kind === state.kind; })
      .map(derive);
    list.sort(function (a, b) {
      if (state.sort === "n") return b.c.n - a.c.n;
      return b[state.sort] - a[state.sort] || b.c.n - a.c.n;
    });
    return list;
  }

  function updateStats(list) {
    var n = 0, fixed = 0, eol = 0, known = 0;
    list.forEach(function (d) {
      n += d.c.n; known += d.known;
      fixed += d.c.status.Fixed; eol += d.c.status["End of life"];
    });
    $("n").textContent = fmtInt.format(n);
    $("fixed").textContent = pct(fixed / known);
    $("eol").textContent = pct(eol / known);
    $("countries").textContent = state.scope === "eu" ? DATA.meta.eu_countries : DATA.meta.countries;
  }

  // Tooltip
  function showTip(evt, d) {
    tip.replaceChildren();
    tip.appendChild(el("div", "rd-tt-title", d.c.label + " · " + fmtInt.format(d.c.n) + " Versuche"));
    STATUS.forEach(function (s) {
      var r = el("div", "rd-tt-row");
      var key = el("i");
      key.style.background = "var(--rd-" + s.cls + ")";
      r.appendChild(key);
      r.appendChild(el("b", null, pct(d[s.cls])));
      r.appendChild(el("span", null, s.label + " (" + fmtInt.format(d.c.status[s.key]) + ")"));
      tip.appendChild(r);
    });
    if (d.c.status.Unknown) {
      tip.appendChild(el("div", "rd-tt-foot",
        "Ohne Ergebnis: " + fmtInt.format(d.c.status.Unknown) + " (" + pct(d.unknown) + ", nicht eingerechnet)"));
    }
    tip.hidden = false;
    moveTip(evt);
  }
  function moveTip(evt) {
    var r = evt.currentTarget.getBoundingClientRect();
    var pointer = evt.type !== "focus" && evt.clientX != null;
    var x = pointer ? evt.clientX : r.left + r.width / 2;
    var y = pointer ? evt.clientY : r.top;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.min(Math.max(8, x + 14), window.innerWidth - w - 8) + "px";
    tip.style.top = (y - h - 12 < 64 ? y + 18 : y - h - 12) + "px";
  }
  function hideTip() { tip.hidden = true; }

  function barList(items) {
    var ul = el("ul", "rd-bars");
    var max = Math.max.apply(null, items.map(function (i) { return i.share; }).concat([0.0001]));
    items.forEach(function (i) {
      var li = el("li");
      li.appendChild(el("span", null, i.label));
      var track = el("div", "rd-track");
      var fill = el("div", "rd-fill");
      fill.style.width = (i.share / max * 100) + "%";
      if (i.color) fill.style.background = i.color;
      track.appendChild(fill);
      li.appendChild(track);
      var v = el("span", "rd-v");
      v.appendChild(el("b", null, pct(i.share)));
      v.appendChild(document.createTextNode(" · " + fmtCompact.format(i.count)));
      li.appendChild(v);
      ul.appendChild(li);
    });
    return ul;
  }

  function renderRow(d, i, maxN) {
    var c = d.c;
    var details = el("details", "rd-row");
    if (openIds.has(c.id)) details.open = true;
    details.addEventListener("toggle", function () {
      if (details.open) openIds.add(c.id); else openIds.delete(c.id);
    });

    var sum = el("summary", "rd-summary");

    var cat = el("div", "rd-cat");
    cat.appendChild(el("span", "rd-rank", String(i + 1)));
    cat.appendChild(el("span", "rd-cat-name", c.label));
    cat.appendChild(el("span", "rd-chev", "▶"));
    sum.appendChild(cat);

    var vol = el("div", "rd-vol");
    var track = el("div", "rd-vol-track");
    var bar = el("div", "rd-vol-bar");
    bar.style.width = (c.n / maxN * 100) + "%";
    track.appendChild(bar);
    vol.appendChild(track);
    vol.appendChild(el("span", "rd-vol-val", fmtInt.format(c.n)));
    sum.appendChild(vol);

    var out = el("div", "rd-outcome");
    out.setAttribute("role", "img");
    out.setAttribute("aria-label",
      STATUS.map(function (s) { return s.label + " " + pct(d[s.cls]); }).join(", "));
    STATUS.forEach(function (s) {
      if (!d[s.cls]) return;
      var seg = el("span", "rd-seg-" + s.cls);
      seg.style.flex = String(d[s.cls]);
      out.appendChild(seg);
    });
    out.addEventListener("pointerenter", function (e) { showTip(e, d); });
    out.addEventListener("pointermove", moveTip);
    out.addEventListener("pointerleave", hideTip);
    sum.addEventListener("focus", function () { showTip({ currentTarget: out, type: "focus" }, d); });
    sum.addEventListener("blur", hideTip);
    sum.appendChild(out);

    var fix = el("span", "rd-pct rd-fix");
    fix.appendChild(el("span", "rd-pct-key", "Erfolg"));
    fix.appendChild(document.createTextNode(pct(d.fixed)));
    sum.appendChild(fix);
    var eol = el("span", "rd-pct rd-eolp");
    eol.appendChild(el("span", "rd-pct-key", "End of life"));
    eol.appendChild(document.createTextNode(pct(d.eol)));
    sum.appendChild(eol);

    var reasons = el("ul", "rd-reasons");
    if (c.kind === "non") {
      reasons.appendChild(el("li", "rd-none", "Für Produkte ohne Strom nicht erfasst"));
    } else if (!d.barrierTotal) {
      reasons.appendChild(el("li", "rd-none", "Keine Angaben"));
    } else {
      c.barriers.slice(0, 3).forEach(function (b) {
        var li = el("li");
        li.appendChild(el("b", null, pct(b[1] / d.barrierTotal)));
        li.appendChild(document.createTextNode(" " + BARRIERS[b[0]]));
        reasons.appendChild(li);
      });
    }
    sum.appendChild(reasons);
    details.appendChild(sum);

    var det = el("div", "rd-detail");
    var left = el("div");
    left.appendChild(el("h3", null, "Ergebnis der Reparaturversuche"));
    left.appendChild(barList(STATUS.map(function (s) {
      return { label: s.label, share: d[s.cls], count: c.status[s.key], color: "var(--rd-" + s.cls + ")" };
    })));
    left.appendChild(el("p", "rd-small",
      "Anteile an " + fmtInt.format(d.known) + " Versuchen mit bekanntem Ergebnis." +
      (c.status.Unknown ? " " + fmtInt.format(c.status.Unknown) + " Versuche ohne Ergebnis." : "")));
    det.appendChild(left);

    var right = el("div");
    right.appendChild(el("h3", null, "Gründe für „End of life“"));
    if (c.kind === "non") {
      right.appendChild(el("p", "rd-small", "Bei Produkten ohne Strom erfassen die Initiativen keine Gründe."));
    } else if (!d.barrierTotal) {
      right.appendChild(el("p", "rd-small", "Keine Angaben zu Gründen."));
    } else {
      right.appendChild(barList(c.barriers.map(function (b) {
        return { label: BARRIERS[b[0]], share: b[1] / d.barrierTotal, count: b[1] };
      })));
      right.appendChild(el("p", "rd-small",
        "Grund angegeben bei " + fmtInt.format(d.barrierTotal) + " von " +
        fmtInt.format(c.status["End of life"]) + " End-of-life-Fällen (" +
        pct(d.barrierTotal / c.status["End of life"]) + ")."));
    }
    det.appendChild(right);
    details.appendChild(det);
    return details;
  }

  function render() {
    hideTip();
    var list = current();
    var maxN = Math.max.apply(null, list.map(function (d) { return d.c.n; }));
    var frag = document.createDocumentFragment();
    list.forEach(function (d, i) { frag.appendChild(renderRow(d, i, maxN)); });
    rowsEl.replaceChildren(frag);
    updateStats(list);
  }

  function initMeta() {
    var m = DATA.meta;
    $("years").textContent = m.date_min.slice(0, 4) + "–" + m.date_max.slice(0, 4);
    $("eushare").textContent = pct(m.eu_rows / m.rows);
    $("providers").textContent = m.providers.join(", ");
  }

  root.querySelectorAll(".filter-btn[data-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.dataset.filter;
      state[f] = btn.dataset.value;
      root.querySelectorAll('.filter-btn[data-filter="' + f + '"]').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on);
      });
      if (DATA) render();
    });
  });
  window.addEventListener("scroll", hideTip, { passive: true });

  fetch(root.dataset.src)
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (json) {
      DATA = json;
      BARRIERS = json.barrier_labels;
      initMeta();
      render();
    })
    .catch(function () {
      rowsEl.replaceChildren(el("p", "rd-loading", "Die Daten konnten nicht geladen werden."));
    });
})();
