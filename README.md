# FACE MIGRATION
### Nowhere to go. Going anyway.

A procession of tiny Faces rolls across an indifferent digital landscape.

They have no feet. They have no destination worth mentioning. They are, nevertheless, entirely committed to the journey.

**The main work is [Face Migration](index.html)**: a single page full of borders, typography, ramps, accelerators, springs, steps, and an exit that may or may not deserve the name. Pick up a Face and throw it. A stuck Face should seek a way out. The page itself is its landscape.

## What lives here

- **[index.html](index.html)** — the current adventure. Add one Face or release eight; watch the on-page and escaped counters
- **[resources.html](resources.html)** — a library of copyable HTML terrain modules. Choose left, center, or right justification, and a width; the generated snippet updates accordingly
- **face-walker.js** — the page-aware physics engine: rolling, dragging, collision detection, ramps, conveyors, springs, exits, and automatic recovery from boxed-in drops
- **Face-svg.svg** — the canonical artwork. The color variants change only black ink, keeping the geometry and white negative space intact
- **level.html**, **sixteen-levels.html**, **migration.js** — archived and experimental approaches, not the primary experience
- **walker.js**, **walker.min.js** — original CSS walker reference files, preserved

## Building the landscape

Terrain blocks use small, declarative attributes:

- `data-face="boost"` with `data-dir="left"` or `"right"`: accelerator
- `data-face="ramp-up"` or `"ramp-down"`: inclined surfaces
- `data-face="spring"`: bounce pad
- `data-face="platform"`: flat horizontal surface
- `data-face="exit"`: the place where arrivals are counted

A module's wrapper can be set to `data-align="left"`, `"center"`, or `"right"`, with `style="--block-width:72%"`. See [resources.html](resources.html) for full, copy-ready examples separated by comments. These are HTML fragments, not iframe embeds, and are intended for this particular artwork.

## Provenance

This experiment grew from [MarkBlah's Lemmings](https://github.com/MarkBlah/lemmings) and its imaginative pure-CSS walkers. The Face is the original Face of Robin SVG; its source geometry has not been redrawn. Color variants recolor the dark ink without changing the contours.

This is an artwork for FACEOFROBIN.COM, not an advertised embeddable widget.

---

*The Face has nowhere important to go. It insists on getting there anyway.*
