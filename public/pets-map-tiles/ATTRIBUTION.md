# Pets Map Tiles — Attribution & License

These are Stamen Watercolor map tiles, vendored into this repo as static assets for the
Pets game's map screen.

## Required attribution

Any screen that displays these tiles **must** show the following text (this is the exact
wording requested by the tile host):

> Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.

As HTML:

```html
Map tiles by <a href="https://stamen.com/" target="_blank" rel="noreferrer">Stamen Design</a>,
under <a href="https://creativecommons.org/licenses/by/3.0" target="_blank" rel="noreferrer">CC BY 3.0</a>.
Data by <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>,
under <a href="https://creativecommons.org/licenses/by-sa/2.0" target="_blank" rel="noreferrer">CC BY SA</a>.
```

## License

| Component | License |
| --- | --- |
| Map tile artwork (Stamen Design) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
| Underlying map data (OpenStreetMap) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) |

CC BY 3.0 permits redistribution (including in this public repo and on the GitHub Pages
site) provided attribution is given, so vendoring the tiles here is allowed.

The host states directly: *"We are happy for you to use these tiles for your own projects,
with the following attribution"* and *"The public is welcome to use and generate map tiles
on this site in accordance with the Creative Commons copyright licenses provided by Stamen
Design and OpenStreetMap."*

## Source

- **Host:** Cooper Hewitt, Smithsonian Design Museum — https://watercolormaps.collection.cooperhewitt.org/
- **Tile URL template:** `https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg`
- **API key:** not required.

Stamen's own tile service shut down on 2023-10-31. The tiles are now also served by
[Stadia Maps](https://docs.stadiamaps.com/map-styles/stamen-watercolor/), but Stadia's
Terms of Service prohibit bulk downloading, server-side caching, and redistribution, so
Stadia was **not** used as the source here. The Smithsonian archive — a preserved, live
copy of the original Stamen site, acquired into the museum's permanent collection — is the
source of every tile in this directory.

## Coverage

Central Helsinki, Finland.

| | |
| --- | --- |
| Latitude | 60.130 – 60.212 |
| Longitude | 24.850 – 24.985 |
| Zoom levels | 11 – 15 (inclusive) |
| Projection | Web Mercator / slippy map (EPSG:3857) |
| Layout | `{z}/{x}/{y}.jpg` |

| Zoom | Tiles | Size |
| --- | --- | --- |
| 11 | 4 | 0.06 MB |
| 12 | 9 | 0.15 MB |
| 13 | 20 | 0.28 MB |
| 14 | 72 | 0.94 MB |
| 15 | 224 | 2.82 MB |
| **Total** | **329** | **4.25 MB** |

Downloaded 2026-08-15.

## Regenerating

Run `node scrapers/scrapePetsMapTiles.js` from the repo root. The script is idempotent —
it skips tiles already on disk — and caps the total payload at 15 MB, dropping the highest
zoom level if that would be exceeded.
