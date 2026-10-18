# Product Marketing Context

**Document version:** v3
**Last updated:** 2026-10-18

Read by the `copywriting`, `copy-editing`, and `product-marketing` skills before
they ask questions. Update this file instead of re-answering.
Where this file and `lib/config.js` disagree on price or name, `config.js` wins.

## Product Overview

**One-liner:** A curved, vented detangling brush that dries and detangles in one pass.

**What it does:** The paddle is bowed to follow the scalp, and slots run through
it so blow-dryer heat reaches the hair underneath. Ball-tipped nylon pins work
through knots; boar bristles smooth the hair behind them. Waterproof, so it
works on wet or dry hair.

**Product category:** Detangling brush / vented paddle brush — the shelf a
customer searches from.

**Product type:** B2C e-commerce, single-product page.

**Business model:** Cash on delivery only. No card payment, no cart, no account.
Price is stated openly on the page.

**Spec (Alibaba listing):** ABS body with wood-grain finish, handle material
plastic, feature waterproof, brush material nylon, ball-tipped nylon pins plus
boar bristles.

## Target Audience

**Target companies:** n/a (B2C)
**Decision-makers:** n/a (B2C)
**Primary use case:** Broad hair-care shoppers in Lebanon — owner-supplied launch hypothesis (2026-10-18), not order data. Anyone who washes their hair and blow-dries it; wet-hair detangling and drying.
**Jobs to be done:** Get through wet knots without tugging; cut a step out of blow-drying.
**Use cases:** Detangling after washing; blow-drying while brushing.

*Owner-set launch hypothesis, 2026-10-18. Replace with real order data as soon as traffic starts — do not treat this as validated.*

## Personas

**Skipped.** The skill marks this section B2B only and this is B2C.

## Problems & Pain Points

**Core problem:** Wet hair knots, and getting through it tugs.

**Why alternatives fall short:** `[NEED: research]` Written from the product
spec only. No customer interviews, no review mining, no validation.

**What it costs them:** `[NEED: research]`

**Emotional tension:** `[NEED: research]`

## Competitive Landscape

**Direct:** Ordinary flat paddle brushes — no venting, so blow-drying takes a
second tool and a second pass.
**Secondary:** Comb or wide-tooth detangler.
**Indirect:** Working knots out with fingers.

*Written from the product's own mechanism. Not validated against real
alternatives a buyer is weighing.*

## Differentiation

**Key differentiator:** **Curved + vented head.** The paddle is bowed to follow
the scalp, and slots run through it so blow-dryer heat passes through while you
brush.

This leads the copy and occupies the top two positions in the "About this item"
list.

**How we do it differently:** The curve and the vents are one design, not two
features — they let one brush cover more scalp per stroke and pass heat at the
same time.

**Why that's better:** Dry and detangle in one pass.

**Why customers choose us:** Launch hypothesis: one brush covers both the detangling and the drying, at $7 cash on delivery. Not validated against real buyers.

## Objections

| Objection | Response |
|-----------|----------|
| `[NEED: objection]` | Unknown. Pre-launch, no data. |

**Anti-persona:** `[NEED: audience]`

*Do not invent objections. Fill from Plausible events and real order feedback.*

## Switching Dynamics

**Push:** A flat brush doesn't vent, so drying needs a separate pass.
**Pull:** One brush covers the drying and the detangling.
**Habit:** People already own a brush. The bar is not switching, it is buying
another one.
**Anxiety:** Ordering from an unfamiliar site. Answered on-page by cash on
delivery and the call to confirm — not by claims.

## Customer Language

**How they describe the problem:** `[NEED: customer language]`
**How they describe us:** `[NEED: customer language]`

**Words to use:** knots, tangles, scalp, vent, paddle, blow-dry, wet hair.
**Words to avoid:** streamline, seamless, innovative, luxury, salon-grade, and
any superlative we cannot evidence.

*Capture verbatim phrases from real buyers. Exact words beat polished
descriptions.*

## Brand Voice

**Tone:** Direct, practical, plain.
**Style:** Short sentences. Speaks to the reader, not about the company. Price
stated openly. No hype, no invented statistics.
**Personality:** straightforward, unfussy, honest.

**2026-10-18 note:** the "About This Item" bullets now use owner-supplied
product-marketing language ("Dual Bristle Synergy", "Geometric aerodynamic open
back channels", "High-Velocity"). That is more technical than the voice above.
It is kept deliberately in that one block — do not let it spread to the lede,
the CTAs, or the checkout copy.

## Proof Points

**Metrics:** `[NEED: proof]`
**Customers:** `[NEED: proof]`
**Testimonials:** None. Fabricating social proof is prohibited and a reviews
section must not ship empty.
**Value themes:**

| Theme | Proof |
|-------|-------|
| Dries while you brush | The slots through the paddle — visible in photos |
| Covers more scalp per stroke | The bowed head — visible in photos |

*Only claims backed by the physical product or its spec.*

## Goals

**Business goal:** First real orders through the page.
**Conversion action:** Submit the inline COD order form.
**Current metrics:** None. `PLAUSIBLE_DOMAIN` is unset, so no baseline is
being collected.

## Open flags

- `[NEED: objection]` — no data pre-launch
- `[NEED: proof]` — no reviews, cannot be fabricated
- `[NEED: audience]` — no order data
- `[NEED: delivery promise]` — blocked on Wakilni quote
- `[NEED: dimensions]` — Alibaba weight/length if available
- `[NEED: research]` — problems and competitive landscape unvalidated
- `[NEED: customer language]` — no verbatim buyer phrases yet

## Hard rules

- No fabricated social proof of any kind.
- No performance statistics without a supplier test. The "cutting blow-drying
  time by up to 45%" line was rejected 2026-10-18 on these grounds.
- No material or temperature claims beyond the supplier spec sheet. "100%
  natural boar", "248°F (120°C)" and "coffee-ground bio-composite" were all
  rejected 2026-10-18; the documented terms are "Ball-tipped nylon pins with
  boar bristles", "Coffee Material + ABS" and "Waterproof body".
- No delivery price until Wakilni quotes it (`lib/config.js` → `DELIVERY`).
- No contact details until a number exists (`lib/config.js` → `CONTACT`).
- Verification is `npm run build` only. No lint, test, or typecheck exists.

## Copy direction agreed 2026-10-06 (updated 2026-10-18)

- **h1** is Amazon's descriptive title formula, not a slogan:
  `[product name], [use case], [key feature], [differentiator]`.
  **2026-10-18:** the brand now LEADS the h1 ("Silk & Bristle Curved Vented
  Hairbrush with…"), the lede is removed, and the "by *[brand]*" byline is
  removed — with the brand in the h1 the byline only repeated it. The h1 is
  rendered from `PRODUCT.name` so it cannot drift again.
- Rejected: "Brush your hair. Not the knots." — an AI-tell contrast reveal.
- Visual target is an Amazon-style product page: white, dense, 8px radii, buy
  box card. Brand shows only in the wordmark, the accent colour, and voice.
- **2026-10-18:** the order form is no longer inline in the buy box — the
  product page's CTA links to `/order`, which carries the form with
  district/village comboboxes scoped to Lebanon. This supersedes
  "stays inline in the buy box".

## Changelog

*Newest first. One line per revision: what changed and why.*

- v3 (2026-10-18) — Lebanon launch copy pass. Brand now leads the h1; lede and
  byline removed; "About This Item" rewritten as four benefit-led bullets
  (owner-supplied wording, tightened to drop the unevidenced "up to 45%" and
  "micro-circulation" claims); spec table gains "Hair compatibility" and
  relabels the resistance row; audience flag filled from the owner's launch
  hypothesis; recorded that the order form has moved off the inline buy box.

- v2 (2026-10-06) — Restructured into the skill's canonical section template; carried over product, differentiator, voice, hard rules and agreed copy direction; left audience, objections, customer language and proof as open flags rather than inventing them.
- v1 (2026-10-06) — Initial context.
