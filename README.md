# FACE LEMMINGS
### Nowhere to go. Going anyway.

A procession of tiny Faces rolls across an indifferent digital landscape.

They have no feet. They have no destination worth mentioning. They are, nevertheless, entirely committed to the journey.

Each Face is drawn from the original **Face of Robin** emblem. Its features remain intact while the world insists on spinning around it—or perhaps it is the other way around.

## The experience

**The Playground** (`index.html`) is a place for aimless motion. The Faces roll over obstacles, fall off ledges, land on words, and submit reluctantly to gravity. Pick one up and throw it; it will resume its business as though nothing has happened.

**The Level** (`level.html`) introduces the dangerous fiction of purpose. Guide a small migration of Faces across a deliberately inconvenient landscape toward the exit. There is a switch. There is an obstruction. There is, ultimately, a scoreboard.

The Face does not care about the scoreboard.

## A small technical footnote

This experiment began with the tiny CSS walkers from [MarkBlah's Lemmings](https://github.com/MarkBlah/lemmings), whose clever collision and page-walking ideas sparked the adaptation. Face Lemmings replaces the pixel walker with the original Face SVG, given rotation, motion and a world of its own.

The project contains the original `walker.js` and `walker.min.js` as historical reference. The rolling playground uses `face-walker.js`; the game level has its own bounded, DOM-based level engine. The artwork is `Face-svg.svg`.

This is an artwork hosted by FACEOFROBIN.COM, not a general-purpose embeddable widget or CDN distribution.

---

*The Face has nowhere important to go. It insists on getting there anyway.*
