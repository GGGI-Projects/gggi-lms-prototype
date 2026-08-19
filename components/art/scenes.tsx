/**
 * Illustrated artwork.
 *
 * The editorial direction is photography-led, but shipping a prototype that
 * depends on remote image URLs means a broken demo the first time it is shown
 * on bad conference wifi. These scenes are inline SVG instead: zero network
 * requests, crisp at any size, and they can be animated layer by layer on
 * scroll, which stock photography cannot.
 *
 * Every one of them is a plain server component - no client JS is shipped for
 * the artwork itself; the parent sections apply the motion.
 *
 * To swap in real photography later, see `<PhotoSlot>` at the bottom of this
 * file: give it a `src` and it renders the image instead of the illustration.
 */

import Image from "next/image";
import type { Module } from "@/content/site";

/* ------------------------------------------------------- shared decoration */

/** Faint topographic contour lines, tiled as a section background. */
export function Topography({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 800 600"
      fill="none"
    >
      <g stroke="currentColor" strokeWidth="1" opacity="0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={i}
            d={`M-40 ${90 + i * 58} C 130 ${40 + i * 58}, 260 ${140 + i * 58}, 400 ${96 + i * 58
              } S 690 ${34 + i * 58}, 840 ${104 + i * 58}`}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * The leaf-in-a-coin logo mark.
 *
 * A struck coin: a heavy rim, a milled edge, a hairline inner circle, and the
 * platform's leaf filling the face. That is the whole idea in one shape -
 * value with a leaf minted into it, rather than a leaf and a coin sitting
 * side by side.
 *
 * The leaf is FILLED, not outlined, and its veins are cut OUT of the mass as
 * negative space rather than drawn on top of it. That is what gives the mark
 * its weight: at 40px an outlined leaf is four hairlines and reads as grey,
 * whereas a solid one reads as a leaf.
 *
 * TWO DELIBERATE DEPARTURES from the artwork this is drawn from, both forced
 * by the size the mark actually ships at:
 *
 * - The milled edge has 40 slots, not the ~120 of a real coin. At the 40px
 *   the shells render this at, the band is 106px around; 120 slots is one
 *   every 0.9px and aliases into a grey smear, while 40 gives a 1.3px slot
 *   against a 1.3px separator and stays crisp.
 * - The slots are cut with `stroke-dasharray` rather than by masking, so the
 *   GROUND shows through them. Everything here is `currentColor` on whatever
 *   the parent chip is filled with, which is what lets one mark sit on amber
 *   in the console, teal on the certificate and the season accent in the site
 *   header. The dash and gap are each a fortieth of the band's circumference,
 *   so the pattern closes on itself with no seam.
 *
 * The mark FILLS its chip - the chip's `rounded-full` background is the
 * coin's face, and the rim is struck just inside its edge. Sizing it smaller
 * than the chip would draw a coin inside a disc and read as two circles.
 *
 * Below about 32px the milled band and the hairline stop resolving, so small
 * renderings use the reduced cut in `app/icon.svg` instead of this one.
 */
export function LeafMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 64 64"
      fill="none"
    >
      <g stroke="currentColor" fill="none">
        {/* Rim, then the milled band with its two containing rings, then the
            hairline that closes the face off from the leaf. */}
        <circle cx="32" cy="32" r="30.39" strokeWidth="2.81" />
        <circle
          cx="32"
          cy="32"
          r="27.1"
          strokeWidth="2.81"
          strokeDasharray="2.128 2.128"
        />
        <circle cx="32" cy="32" r="25.695" strokeWidth="0.62" />
        <circle cx="32" cy="32" r="28.505" strokeWidth="0.62" />
        <circle cx="32" cy="32" r="23.37" strokeWidth="0.7" />
      </g>
      {/* One path, three subpaths: the blade, then the two vein channels that
          `evenodd` knocks back out of it. */}
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="
          M 37.8 14.0 C 37.8 14.0 39.6 15.3 40.4 16.1 C 41.3 16.9 42.2 17.9 42.9 18.8 C 43.5
          19.6 44.1 20.5 44.5 21.4 C 45.1 22.5 45.8 24.1 46.2 25.3 C 46.5 26.4 46.8 27.6
          46.9 28.8 C 47.1 30.1 47.2 31.4 47.0 32.7 C 46.8 34.4 46.0 37.6 45.5 39.1 C 45.2
          40.0 44.7 40.8 44.2 41.6 C 43.6 42.5 42.9 43.5 42.1 44.3 C 41.0 45.3 39.1 46.7
          37.5 47.5 C 36.1 48.2 34.4 48.7 32.9 48.9 C 31.6 49.2 30.0 49.1 28.8 49.1 C 27.7
          49.1 26.6 48.7 25.6 48.8 C 24.6 48.8 23.7 49.5 22.6 49.7 C 21.6 49.9 20.3 50.1
          19.6 50.0 C 19.0 50.0 18.5 49.7 18.1 49.4 C 17.7 49.1 17.0 48.3 17.0 48.3 C 17.0
          48.3 24.0 47.3 24.0 47.3 C 24.0 47.3 22.5 45.4 22.1 44.4 C 21.6 43.4 21.3 42.4
          21.1 41.4 C 21.0 40.3 20.9 39.1 21.0 38.0 C 21.1 36.8 21.3 35.7 21.7 34.7 C 22.1
          33.6 22.7 32.6 23.4 31.7 C 24.2 30.7 25.2 29.5 26.3 28.7 C 28.1 27.4 32.7 25.2
          34.4 24.0 C 35.4 23.4 36.3 22.7 37.0 21.8 C 37.6 20.8 38.2 19.5 38.3 18.2 C 38.5
          16.9 37.8 14.0 37.8 14.0 Z M 38.9 15.8 C 38.9 15.8 41.4 18.3 42.4 19.8 C 43.3 21.3
          44.2 23.1 44.8 24.8 C 45.3 26.5 45.6 28.4 45.7 30.0 C 45.8 31.4 45.7 32.9 45.5
          34.2 C 45.2 35.4 44.7 36.6 44.1 37.6 C 43.4 38.6 42.5 39.7 41.5 40.5 C 40.5 41.3
          39.0 42.2 37.6 42.8 C 36.3 43.4 33.4 44.0 33.4 44.0 C 33.4 44.0 36.1 41.2 37.2
          39.7 C 38.3 38.3 38.9 36.3 39.9 35.0 C 40.7 33.9 42.1 33.0 42.9 32.0 C 43.6 31.2
          44.2 30.0 44.5 29.3 C 44.7 28.9 44.9 28.0 44.9 28.0 C 44.9 28.0 44.6 28.6 44.4
          29.0 C 44.0 29.5 43.3 30.8 42.7 31.6 C 42.0 32.4 40.4 33.8 40.4 33.8 C 40.4 33.8
          41.7 28.8 41.9 27.0 C 42.1 25.8 42.0 24.5 41.8 23.3 C 41.6 22.1 40.9 19.8 40.9
          19.8 C 40.9 19.8 41.4 22.2 41.4 23.3 C 41.5 24.4 41.5 25.4 41.4 26.5 C 41.3 27.6
          41.1 28.7 40.8 29.8 C 40.5 31.0 39.5 33.4 39.5 33.4 C 39.5 33.4 39.5 31.4 39.4
          30.5 C 39.2 29.8 38.9 29.0 38.6 28.4 C 38.3 27.7 37.9 27.1 37.4 26.6 C 37.0 26.1
          35.9 25.3 35.9 25.3 C 35.9 25.3 37.6 23.4 38.1 22.7 C 38.5 22.1 38.9 21.4 39.0
          20.7 C 39.2 19.8 39.3 18.3 39.3 17.5 C 39.2 16.9 38.9 15.8 38.9 15.8 Z M 35.7 25.4
          C 35.7 25.4 37.5 27.1 38.1 27.9 C 38.5 28.7 38.7 29.6 38.9 30.4 C 39.0 31.2 39.1
          31.9 39.0 32.7 C 38.9 33.7 38.5 35.4 38.0 36.5 C 37.5 37.5 35.9 39.3 35.9 39.3 C
          35.9 39.3 35.9 36.5 35.7 35.5 C 35.5 34.7 35.0 33.8 34.6 33.1 C 34.3 32.6 33.4
          31.8 33.4 31.8 C 33.4 31.8 34.3 33.0 34.6 33.7 C 35.0 34.5 35.3 35.7 35.4 36.6 C
          35.5 37.3 35.5 38.2 35.3 38.9 C 35.2 39.5 35.1 40.2 34.7 40.7 C 33.9 41.6 32.3
          43.0 30.9 44.0 C 29.4 44.9 26.0 46.6 26.0 46.6 C 26.0 46.6 27.6 45.4 28.2 44.7 C
          28.9 43.9 29.5 43.1 29.7 42.2 C 29.9 40.6 29.4 37.3 29.6 35.5 C 29.7 34.0 30.2
          32.3 30.7 31.2 C 31.1 30.2 31.7 29.3 32.4 28.5 C 33.3 27.5 35.7 25.4 35.7 25.4 Z
        "
      />
    </svg>
  );
}

/* ---------------------------------------------------------------- the arch */

/**
 * Hero artwork: a Sri Lankan hill landscape seen through an arched window.
 * The arch is an editorial framing device - it turns a generic landscape into
 * a deliberate composition and gives the asymmetric hero a strong right edge.
 *
 * Layers carry `data-layer` attributes so the hero can parallax them
 * independently.
 */
export function ArchScene({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 520 660"
      fill="none"
    >
      <defs>
        <clipPath id="arch-clip">
          <path d="M0 660V260C0 116.4 116.4 0 260 0S520 116.4 520 260v400H0Z" />
        </clipPath>
        <linearGradient id="arch-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-highlight-pale)" />
          <stop offset="45%" stopColor="var(--color-paper)" />
          <stop offset="100%" stopColor="var(--color-tint-mist)" />
        </linearGradient>
        <linearGradient id="arch-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-paper)" stopOpacity="0" />
          <stop offset="55%" stopColor="var(--color-paper)" stopOpacity="0.75" />
          <stop offset="100%" stopColor="var(--color-paper)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g clipPath="url(#arch-clip)">
        <rect width="520" height="660" fill="url(#arch-sky)" />

        {/* Sun */}
        <circle
          cx="338"
          cy="206"
          r="66"
          fill="var(--color-highlight)"
          opacity="0.5"
          className="origin-[338px_206px] [animation:sun-pulse_9s_ease-in-out_infinite]"
        />
        <circle cx="338" cy="206" r="34" fill="var(--color-highlight)" opacity="0.7" />

        {/* Birds */}
        <g
          stroke="var(--color-primary)"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.45"
          className="[animation:bob_11s_ease-in-out_infinite]"
        >
          <path d="M112 178c5-5 9-5 13 0 4-5 8-5 13 0" />
          <path d="M158 152c4-4 7-4 10 0 3-4 6-4 10 0" />
          <path d="M96 214c3-3 6-3 8 0 3-3 6-3 8 0" />
        </g>

        {/* Far ridge */}
        <path
          data-layer="far"
          d="M0 386C80 344 140 356 200 332s120 8 180-10 90 6 140-6v344H0V386Z"
          fill="var(--color-tint-mist)"
        />

        {/* Mid ridge */}
        <path
          data-layer="mid"
          d="M0 462C70 430 120 446 190 422s110 14 170-2 100 12 160-4v324H0V462Z"
          fill="var(--color-tint-pale)"
        />

        {/* Mist band caught between the ridges */}
        <rect y="430" width="520" height="90" fill="url(#arch-mist)" />

        {/* Near ridge, terraced */}
        <path
          data-layer="near"
          d="M0 528C60 506 110 522 180 502s130 16 200 0 100 8 140 2v226H0V528Z"
          fill="var(--color-tint)"
        />
        <g
          stroke="var(--color-primary-600)"
          strokeWidth="1.4"
          opacity="0.30"
          fill="none"
        >
          <path d="M4 556C70 536 140 548 210 532s160 10 306-6" />
          <path d="M0 582C74 564 148 574 220 560s170 8 300-4" />
          <path d="M0 608C80 592 156 600 230 588s176 6 290-2" />
        </g>

        {/* Foreground bank */}
        <path
          data-layer="fore"
          d="M0 600C70 582 130 596 200 584s130 12 200 0 90 6 120 2v74H0v-60Z"
          fill="var(--color-primary-500)"
        />

        {/* Palms on the foreground bank */}
        <g fill="var(--color-primary-600)">
          <PalmTree x={62} y={604} scale={1} />
          <PalmTree x={452} y={598} scale={0.82} />
          <PalmTree x={392} y={614} scale={0.6} />
        </g>
      </g>

      {/* Arch outline */}
      <path
        d="M0 660V260C0 116.4 116.4 0 260 0S520 116.4 520 260v400"
        stroke="var(--color-primary)"
        strokeOpacity="0.30"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

/** A single palm silhouette, used along the hero's foreground bank. */
function PalmTree({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-2 0c0-18 1-30 4-44h4c-3 14-4 26-4 44h-4Z" />
      <path d="M2 -44c-10-8-22-9-30-4 9-1 19 2 27 8l3-4ZM2 -44c10-8 22-9 30-4-9-1-19 2-27 8l-3-4ZM2 -46c-4-11-2-21 5-27-3 8-3 17-1 26l-4 1ZM4 -44c9-4 19-2 25 5-8-3-17-3-25 0v-5Z" />
    </g>
  );
}

/* ------------------------------------------------- module thumbnail art */

/**
 * One hue per module, drawn from the five subject hues in `@theme`.
 *
 * All five of these were teal, which meant the row of thumbnails read as one
 * repeated image and the list looked like five versions of the same course.
 * The hues are the SAME five the marquee already puts on screen directly above
 * (teal, clay, amber, marine, plum), held at one depth and chroma, so this is a
 * callback to that band rather than a new palette - and the hue lives only in
 * a 112x80 illustration, never in a heading, a border or a ground.
 *
 * The five illustrations below were drawn for the prototype's original five
 * subjects (adaptation, waste, energy, finance, mobility). The 2026-08-16
 * curriculum swap kept the hue assignment but inherited three of the
 * drawings as-is, so `waste`'s recycling loop and `energy`'s turbine sat
 * beside modules that were not literally about either. `waste`, `energy` and
 * `coast` have since been redrawn for the real subjects in their slot,
 * keeping the same hue-per-row logic; `hills` and `finance` needed no
 * change - a landscape and a finance bar chart still read correctly under
 * their new module titles.
 */
const SCENES: Record<Module["scene"], React.ReactNode> = {
  /* Now Climate Vulnerability Assessment - teal. */
  hills: (
    <>
      <circle cx="118" cy="42" r="20" fill="var(--color-highlight)" opacity="0.65" />
      <path d="M0 78c26-16 44-4 66-16s42 6 74-10v68H0V78Z" fill="var(--color-tint-pale)" />
      <path d="M0 96c30-14 50-2 74-14s44 8 66-6v44H0V96Z" fill="var(--color-tint)" />
      <path d="M0 112c28-10 52 0 78-10s40 6 62-2v20H0v-8Z" fill="var(--color-primary-600)" />
    </>
  ),
  /* Maintaining GSI - clay. Three figures at one height, linked at the
     hands: the module is about consultation design and inclusion, not any
     one group, so no figure is drawn taller, first or apart from the rest. */
  waste: (
    <>
      <path
        d="M0 120c26-6 54 2 80-4s40 6 80-2v16H0v-10Z"
        fill="var(--color-clay-pale)"
        opacity="0.7"
      />
      <path
        d="M27 120C27 90 27 63 40 63C53 63 53 90 53 120Z"
        fill="var(--color-clay-soft)"
      />
      <circle cx="40" cy="54" r="9" fill="var(--color-clay-soft)" />
      <path
        d="M67 120C67 90 67 63 80 63C93 63 93 90 93 120Z"
        fill="var(--color-clay)"
      />
      <circle cx="80" cy="54" r="9" fill="var(--color-clay)" />
      <path
        d="M107 120C107 90 107 63 120 63C133 63 133 90 133 120Z"
        fill="var(--color-clay-soft)"
      />
      <circle cx="120" cy="54" r="9" fill="var(--color-clay-soft)" />
      {/* Linked hands, drawn low and loose rather than as a rigid bar */}
      <path
        d="M40 100Q60 112 80 100Q100 112 120 100"
        stroke="var(--color-clay-pale)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
  /* Gender-Responsive Budgeting - amber. A budget ring, the same chart
     device the finance module uses for proposals, with the combined
     gender-equality mark drawn beside it at full size rather than folded
     into the ring's hollow - the same lesson the finance sprout already
     applies: a detail that small only reads if it isn't crammed in. */
  energy: (
    <>
      <g transform="rotate(-90 52 70)" fill="none" strokeWidth="14">
        <circle
          cx="52"
          cy="70"
          r="24"
          stroke="var(--color-accent)"
          strokeDasharray="67.8 83"
        />
        <circle
          cx="52"
          cy="70"
          r="24"
          stroke="var(--color-accent-600)"
          strokeDasharray="48.3 102.5"
          strokeDashoffset="-67.8"
        />
        <circle
          cx="52"
          cy="70"
          r="24"
          stroke="var(--color-accent-soft)"
          strokeDasharray="34.7 116.1"
          strokeDashoffset="-116.1"
        />
      </g>
      {/* Combined gender-equality mark */}
      <g
        fill="none"
        stroke="var(--color-accent-strong)"
        strokeWidth="3.2"
        strokeLinecap="round"
      >
        <circle cx="112" cy="52" r="11" />
        <path d="M112 63v15M104 71h16" />
        <circle cx="132" cy="78" r="11" />
        <path d="M139.8 70.2 150 60M142 60h8v8" />
      </g>
      <rect x="0" y="120" width="160" height="10" fill="var(--color-accent-pale)" />
    </>
  ),
  /* Now Developing Bankable Climate Finance Proposals - marine, and still a
     good fit. The sprout stays amber: it is the same mark as the seal and
     the journey's nodes, and it is what makes the bar chart read as
     *climate* finance rather than as any other chart. */
  finance: (
    <>
      <rect x="24" y="76" width="22" height="42" rx="4" fill="var(--color-marine-pale)" />
      <rect x="56" y="56" width="22" height="62" rx="4" fill="var(--color-marine-soft)" />
      <rect x="88" y="34" width="22" height="84" rx="4" fill="var(--color-marine)" />
      {/* Leaf sprouting from the tallest bar */}
      <path
        d="M99 34c0-12 8-20 22-22 0 12-8 20-22 22Z"
        fill="var(--color-accent)"
      />
      <path
        d="M20 122h120"
        stroke="var(--color-marine)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  /* Localising the Provincial Adaptation Plan - plum. A place with a plan
     pinned to it: the map is generic on purpose (this is the exercise of
     localising, not one named province), and the checklist stands in for
     the costing and sequencing work the module actually teaches. */
  coast: (
    <>
      <circle cx="128" cy="32" r="15" fill="var(--color-highlight)" opacity="0.6" />
      <path
        d="M10 100C10 74 34 58 62 58C92 58 116 76 116 100C116 112 104 122 84 122H30C18 122 10 112 10 100Z"
        fill="var(--color-plum-pale)"
      />
      {/* Pin, planted where the plan applies */}
      <path d="M50 68 62 96 74 68Z" fill="var(--color-plum)" />
      <circle cx="62" cy="58" r="15" fill="var(--color-plum)" />
      <circle cx="62" cy="58" r="6" fill="var(--color-plum-pale)" />
      {/* Checklist: the plan, sequenced */}
      <g stroke="var(--color-plum-soft)" strokeWidth="3" strokeLinecap="round">
        <circle cx="94" cy="48" r="3" fill="var(--color-plum-soft)" stroke="none" />
        <path d="M102 48h14" />
        <circle cx="94" cy="64" r="3" fill="var(--color-plum-soft)" stroke="none" />
        <path d="M102 64h10" />
        <circle cx="94" cy="80" r="3" fill="var(--color-plum-soft)" stroke="none" />
        <path d="M102 80h14" />
      </g>
    </>
  ),
};

/** Small square illustration shown beside each module row. */
export function ModuleScene({
  scene,
  className,
}: {
  scene: Module["scene"];
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 160 130"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="160" height="130" fill="var(--color-surface)" />
      {SCENES[scene]}
    </svg>
  );
}

/* ------------------------------------------------------- full-bleed ribbon */

/** Wide landscape strip used behind the closing call to action. */
export function RibbonScene({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
    >
      <path
        d="M0 176c160-46 280-6 420-34s260 22 420-10 300 14 420-16h180v204H0V176Z"
        fill="var(--color-primary-800)"
        opacity="0.55"
      />
      <path
        d="M0 226c180-40 300 0 460-26s280 26 440-6 320 8 540-14v140H0v-94Z"
        fill="var(--color-primary-900)"
        opacity="0.75"
      />
      <path
        d="M0 268c200-30 340 8 520-16s300 24 460-4 260 6 460-10v82H0v-52Z"
        fill="var(--color-primary-950)"
      />
      <g fill="var(--color-primary-950)">
        <PalmTree x={140} y={282} scale={1.15} />
        <PalmTree x={1280} y={276} scale={0.95} />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------- photo slot */

/**
 * Drop-in replacement point for the illustrations.
 *
 * Put a real photograph at e.g. `public/images/hero.jpg` and pass
 * `src="/images/hero.jpg"` - the illustration passed as `children` is used as
 * the fallback until then, so the page never renders an empty box.
 */
export function PhotoSlot({
  src,
  alt,
  children,
  className,
}: {
  src?: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!src) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
