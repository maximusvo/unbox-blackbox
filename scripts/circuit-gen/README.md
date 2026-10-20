# circuit-gen

Erzeugt die Teaser-Bilder der Blogposts. Das Script `render.js` öffnet den originalen
[35c3-Circuit-Generator von bleeptrack](https://35c3.bleeptrack.de/) (liegt unverändert in
`vendor/`, GPL-3.0) in einem headless Chrome und lässt ihn für jeden Post ein SVG erzeugen.
Als Text-Input nimmt es den Titel aus dem Front Matter des Posts.

## Ausführen

```bash
cd scripts/circuit-gen
npm install          # nur beim ersten Mal (puppeteer-core, js-yaml)
node render.js
```

Es gibt kein npm-Script dafür. Das Script wird direkt mit `node` gestartet.

## Was beim Ausführen passiert

- Alle Posts in `_posts/` werden eingelesen. Den Dateinamen jedes Bildes bildet das Script aus
  dem Dateinamen des Posts, ohne Datum und ohne Endung. Das ist derselbe Slug, den Jekyll als
  `post.slug` benutzt.
- Normalerweise erzeugt es nur Bilder, die noch fehlen. Gespeichert werden sie unter
  `assets/img/teasers/<slug>.svg`.
- Ist schon alles vorhanden, gibt es „Teaser images are already up to date“ aus.

## Optionen

| Aufruf | Wirkung |
|---|---|
| `node render.js --all` (oder `--force`) | Erzeugt alle Bilder neu und überschreibt die vorhandenen |
| `node render.js /anderer/ordner` | Speichert in einen anderen Ordner statt `assets/img/teasers` |
| `CHROME_PATH=/pfad/zu/chrome node render.js` | Gibt Chrome selbst an, falls das Script es nicht findet. Es sucht nur in `/Applications/Google Chrome.app` und unter `/usr/bin/google-chrome` bzw. `chromium-browser`. |

Man braucht ein lokal installiertes Chrome, weil `puppeteer-core` keinen eigenen Browser mitbringt.

## Hinweis

Das Bild entsteht aus dem Titel des Posts. Nach einer Titeländerung sieht es deshalb erst
anders aus, wenn man die zugehörige SVG-Datei löscht oder `--all` verwendet.
