---
layout: default
title: Was in Reparaturinitiativen repariert wird
description: "Welche Produkte Repair Cafés und andere Reparaturinitiativen am häufigsten reparieren, wie oft es gelingt und woran Reparaturen scheitern – ausgewertet aus den Open Repair Data."
permalink: /reparaturdaten/
---

<div class="rd" markdown="0" data-src="{{ '/repairdata/repairdata.json' | relative_url }}">
<link rel="stylesheet" href="{{ '/repairdata/repairdata.css' | relative_url }}">
<div class="rd-inner">
<header class="rd-intro">
<p class="rd-kicker">Open Repair Data · <span data-rd="years">2012–2026</span></p>
<h1>{{ page.title }} und woran es scheitert</h1>
<p class="rd-lede">Repair Cafés, Restart Parties und ähnliche Initiativen dokumentieren jeden Reparaturversuch. Die Übersicht zeigt alle Produktkategorien von der am häufigsten bis zur am seltensten reparierten, wie oft die Reparatur gelang, wie oft das Gerät als „End of life“ aufgegeben wurde – und warum.</p>
</header>
<section class="rd-stats" aria-label="Kennzahlen">
<div class="rd-stat"><span class="rd-stat-label">Reparaturversuche</span><span class="rd-stat-value" data-rd="n">–</span></div>
<div class="rd-stat"><span class="rd-stat-label">Erfolgsquote gesamt</span><span class="rd-stat-value" data-rd="fixed">–</span></div>
<div class="rd-stat"><span class="rd-stat-label">End of life gesamt</span><span class="rd-stat-value" data-rd="eol">–</span></div>
<div class="rd-stat"><span class="rd-stat-label">Länder</span><span class="rd-stat-value" data-rd="countries">–</span></div>
</section>
<section class="rd-controls" aria-label="Filter">
<div class="rd-group" role="group" aria-labelledby="rd-l-scope"><span class="rd-group-label" id="rd-l-scope">Region</span><div class="filters">
<button type="button" class="filter-btn is-active" data-filter="scope" data-value="all" aria-pressed="true">Alle Länder</button>
<button type="button" class="filter-btn" data-filter="scope" data-value="eu" aria-pressed="false">Nur EU</button>
</div></div>
<div class="rd-group" role="group" aria-labelledby="rd-l-kind"><span class="rd-group-label" id="rd-l-kind">Produkte</span><div class="filters">
<button type="button" class="filter-btn is-active" data-filter="kind" data-value="all" aria-pressed="true">Alle</button>
<button type="button" class="filter-btn" data-filter="kind" data-value="eee" aria-pressed="false">Elektro</button>
<button type="button" class="filter-btn" data-filter="kind" data-value="non" aria-pressed="false">Ohne Strom</button>
</div></div>
<div class="rd-group" role="group" aria-labelledby="rd-l-sort"><span class="rd-group-label" id="rd-l-sort">Sortieren nach</span><div class="filters">
<button type="button" class="filter-btn is-active" data-filter="sort" data-value="n" aria-pressed="true">Anzahl</button>
<button type="button" class="filter-btn" data-filter="sort" data-value="fixed" aria-pressed="false">Erfolgsquote</button>
<button type="button" class="filter-btn" data-filter="sort" data-value="eol" aria-pressed="false">End of life</button>
</div></div>
</section>
<section class="rd-chart" aria-labelledby="rd-chart-title">
<div class="rd-chart-head">
<h2 id="rd-chart-title">Produktkategorien</h2>
<ul class="rd-legend" aria-label="Legende Reparaturergebnis">
<li><span class="rd-swatch rd-c-fixed"></span>Repariert</li>
<li><span class="rd-swatch rd-c-repairable"></span>Reparierbar</li>
<li><span class="rd-swatch rd-c-eol"></span>End of life</li>
</ul>
</div>
<p class="rd-hint">Zeile anklicken für alle Gründe des Scheiterns.</p>
<div class="rd-grid-head" aria-hidden="true">
<span>Kategorie</span><span>Reparaturversuche</span><span>Ergebnis</span><span class="rd-num">Erfolg</span><span class="rd-num">End of life</span><span>Häufigste Gründe für „End of life“</span>
</div>
<div class="rd-rows" data-rd="rows"><p class="rd-loading">Daten werden geladen …</p></div>
</section>
<section class="rd-notes">
<h2>So sind die Zahlen zu lesen</h2>
<ul>
<li><strong>Erfolgsquote</strong> = Anteil „Repariert“ an allen Versuchen mit bekanntem Ergebnis. <strong>End-of-life-Quote</strong> = Anteil der Geräte, die als nicht reparierbar aufgegeben wurden. Versuche ohne Ergebnis („Unknown“) sind herausgerechnet; ihr Anteil steht im Tooltip.</li>
<li><strong>Reparierbar</strong> heißt: Fehler gefunden, aber vor Ort nicht behoben – meist fehlt ein Ersatzteil, das nachbestellt wird.</li>
<li><strong>Gründe</strong> werden nur bei „End of life“ und nur bei Elektrogeräten erfasst – und auch dort nur bei einem Teil der Fälle. Die Prozentwerte beziehen sich auf die Fälle mit Angabe.</li>
<li><strong>Kategorien</strong> stammen aus dem Open Repair Data Standard (ORDS); die deutschen Bezeichnungen sind eigene Übersetzungen.</li>
<li>Die Daten sind <strong>nicht repräsentativ</strong>: Sie zeigen, was Menschen in Reparaturinitiativen bringen. Nur <span data-rd="eushare">–</span> der Einträge stammen aus der EU, fast alle davon aus den Niederlanden, Dänemark, Belgien, Deutschland und Frankreich. Die Datenlieferanten erfassen unterschiedlich detailliert.</li>
<li>Datenlieferanten: <span data-rd="providers">–</span>.</li>
<li>Daten: <a href="https://openrepair.org/open-data/">Open Repair Alliance – Open Repair Data</a> (v0.3, Stand Juli 2026), lizenziert unter <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</li>
</ul>
</section>
</div>
<div class="rd-tooltip" data-rd="tooltip" role="status" hidden></div>
<script src="{{ '/repairdata/repairdata.js' | relative_url }}" defer></script>
</div>
