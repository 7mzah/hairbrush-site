# Shot list — Silk & Bristle

Six files: five for the gallery, one for the link preview. The gallery is the
only evidence a buyer gets on a cash-on-delivery site — no reviews, no store
front, no brand recognition — so each frame has to answer one question and the
five together have to answer "is this a real, well-made brush".

Filenames are new (the current `public/*.jpg` are placeholders). When the files
land, the only code change is the `PHOTOS` array in `app/page.js` and the OG
image in `app/layout.js` — one line each, plus the alt text below.

## File spec

| | Gallery (×5) | Link preview (×1) |
|---|---|---|
| Filename | `brush-hero`, `brush-bristles`, `brush-curve`, `brush-in-hand`, `brush-in-use` | `og` |
| Size | 1200 × 1500 (4:5 portrait) | 1200 × 630 (landscape) |
| Format | JPEG, sRGB, quality ~85 | JPEG, sRGB, quality ~85 |
| Weight | ≤ 250 KB each | ≤ 200 KB |
| Display | 513 × 642 on a 1440 screen, full-screen in the lightbox | WhatsApp / TikTok / X link cards |

Do not upscale a smaller original — a soft 1200px file looks worse than a sharp
900px one. Shoot in the largest size the camera offers and export down.

Two things the frame does to the image:

- the bottom-right corner is rounded by 64px (the site's photo card), so keep
  the end of the handle out of that corner;
- the gallery crops to 4:5 with `object-fit: cover` — anything outside a 4:5
  window is lost, so frame in 4:5, not 3:4 or 16:9.

## Set-up — one set-up for all five

Consistency is worth more than any single shot: five images from the same light
on the same background read as a product; five images from five places read as
five brushes.

- **Background:** the page tone, `#f6efeb` — a smooth wall, a sheet of paper, or
  a large board, filling the frame with no visible edge or floor line.
- **Light:** one soft source at about 45° from the left (a window works), white
  card or foam board opposite to lift the shadow side. No on-axis flash — it
  flattens the curve of the paddle, which is the whole point of the product.
- **Camera:** level with the middle of the brush, not looking down. Same
  distance and height for all five so the brush is the same size in frame.
- **The brush:** clean, no dust between the pins, bristles combed straight.
  The coffee-coloured handle shows fingerprints.
- **Nothing else in frame.** No props, no towels, no text, no watermark, no
  logo overlay, no filters or colour grading beyond white balance. A prop is a
  claim you cannot back up.
- **Hands are allowed** where scale is the point — clean, neutral, no jewellery.

## The shots

### 1. `brush-hero.jpg` — the hero

Whole brush, three-quarter angle, head up and left, bristle face angled toward
the camera so both the pins and the curve are legible. Held loosely in one hand
at chest height (as the current placeholder does) or standing against the
background — the hand version is better, because the first question a buyer has
is "how big is it".

This is the shot that has to survive being seen for one second in a feed.

Alt: `Silk & Bristle curved vented paddle brush held in one hand`

### 2. `brush-bristles.jpg` — the bristle detail

Macro, filling the frame with the head only: the ball tips of the nylon pins and
the boar bristles next to them, with the vent slot visible behind. Camera square
to the face, focus on the tips nearest the lens, aperture around f/8 so the
second row is still sharp — a single sharp row of pins dissolving into blur
reads as a stock photo.

This is the frame that answers "will it scratch my scalp" — the ball tips are
the answer, so they must be unmistakable.

Alt: `Close-up of the ball-tipped nylon pins and boar bristles`

### 3. `brush-curve.jpg` — the profile

True side-on profile against the background, handle down, so the paddle's curve
and the vent slots are silhouetted. Slight angle is fine, but the curve reads
best flat.

This is the shot that answers "why is this different from a $2 brush".

Alt: `Side profile showing the curve of the paddle and the vent slots`

### 4. `brush-in-hand.jpg` — scale

The brush held in a hand as it would be used, angled up and away from the face,
head filling the upper half of the frame. Grip on the handle, not the head.

This is the answer to "how big is it", second only to the hero — and it is the
one frame where the hand is doing the work, so keep it in focus.

Alt: `The brush held in one hand, showing its size against the palm`

### 5. `brush-in-use.jpg` — in use

Brush passing through hair, mid-stroke. Freeze the hair, not the brush: a fast
shutter (1/500 or faster, or a phone's burst/sports mode) so the bristles stay
sharp and only the hair suggests movement. Wet or dry both work; wet shows the
detangling claim better and photographs with more contrast.

Do not fake motion with blur — a smeared brush proves nothing.

Alt: `Brush passing through hair while blow-drying`

### 6. `og.jpg` — the link preview

1200 × 630, landscape. A crop of the hero (or a fresh composition with the same
light): brush on the left third, the right two thirds left empty background.
No text — the platform draws the title and price itself, and text baked into
the image gets cropped or duplicated.

Safe area: keep the brush inside the central 1000 × 600 and nothing within 60px
of any edge. X crops this card to 2:1, WhatsApp shows it small and square-ish,
TikTok crops to the card's own ratio — the safe area is what survives all three.

Alt (used by `app/layout.js`): `Silk & Bristle curved vented hairbrush with dual boar and nylon bristles`

## If a phone is the only camera

- Back camera, 2× lens, never the ultrawide — it bends the straight handle.
- Tap the brush to lock focus and exposure; do not use digital zoom, move closer.
- Window light, mid-morning; the brush between you and the window, a white
  pillow or sheet on the shadow side.
- Turn HDR off if the background is paper-white, or the pins go grey.
- Prop the phone on books at the brush's height; a hand-held camera drifts
  between the five shots and the set stops matching.

## When the files arrive

1. Drop them in `public/` with the six names above.
2. `app/page.js`: replace the `PHOTOS` entries (filename + alt from this list,
   in this order — hero first, since that is the gallery's opening slide).
3. `app/layout.js`: point `openGraph.images` and `twitter.images` at `/og.jpg`
   at 1200 × 630.
4. Delete the three placeholders the new names do not overwrite —
   `brush-front.jpg`, `brush-side.jpg`, `brush-back.jpg`. They are untracked
   (the photos are not in git), so do not remove them before the reshoot.

`npm run build` is the only check. There is nothing to test: the images are
static files, and a wrong path shows up as a broken frame on the page.
