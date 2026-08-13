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
import type { Programme } from "@/content/site";

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

/** The leaf-on-a-path logo mark. */
export function LeafMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M5 27C5 27 6.5 17.5 13 12.5C19.5 7.5 27 8 27 8C27 8 27.5 16.5 21.5 21.5C15.5 26.5 8 25 8 25"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 27C7.5 21.5 13 15.5 20.5 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
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

/* ------------------------------------------------- programme thumbnail art */

const SCENES: Record<Programme["scene"], React.ReactNode> = {
  hills: (
    <>
      <circle cx="118" cy="42" r="20" fill="var(--color-highlight)" opacity="0.65" />
      <path d="M0 78c26-16 44-4 66-16s42 6 74-10v68H0V78Z" fill="var(--color-tint-pale)" />
      <path d="M0 96c30-14 50-2 74-14s44 8 66-6v44H0V96Z" fill="var(--color-tint)" />
      <path d="M0 112c28-10 52 0 78-10s40 6 62-2v20H0v-8Z" fill="var(--color-primary-600)" />
    </>
  ),
  waste: (
    <>
      {/* Circular-economy loop */}
      <path
        d="M70 34a36 36 0 1 1-32 52"
        stroke="var(--color-primary-600)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M30 74l8 16 16-8-24-8Z" fill="var(--color-primary-600)" />
      <path
        d="M70 52a18 18 0 1 0 16 26"
        stroke="var(--color-accent)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M92 70l-8 12 12 6-4-18Z" fill="var(--color-accent)" />
      <path d="M0 118c30-8 60 4 90-4s40 2 70-4v18H0v-10Z" fill="var(--color-tint)" />
    </>
  ),
  energy: (
    <>
      <circle cx="34" cy="38" r="18" fill="var(--color-highlight)" opacity="0.7" />
      {/* Turbine */}
      <path d="M112 108V52" stroke="var(--color-primary-600)" strokeWidth="4" />
      <g
        stroke="var(--color-primary-600)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M112 50 92 30M112 50l24-14M112 50l4 26" />
      </g>
      {/* Solar array */}
      <path d="M22 108l14-30h44l-14 30H22Z" fill="var(--color-primary)" />
      <g stroke="var(--color-tint-pale)" strokeWidth="2" opacity="0.7">
        <path d="M38 78 30 108M54 78l-8 30M70 78l-8 30M30 92h44" />
      </g>
      <path d="M0 116h160v14H0z" fill="var(--color-tint)" />
    </>
  ),
  finance: (
    <>
      <rect x="24" y="76" width="22" height="42" rx="4" fill="var(--color-tint)" />
      <rect x="56" y="56" width="22" height="62" rx="4" fill="var(--color-tint-pale)" />
      <rect x="88" y="34" width="22" height="84" rx="4" fill="var(--color-primary-600)" />
      {/* Leaf sprouting from the tallest bar */}
      <path
        d="M99 34c0-12 8-20 22-22 0 12-8 20-22 22Z"
        fill="var(--color-accent)"
      />
      <path
        d="M20 122h120"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  coast: (
    <>
      <circle cx="126" cy="36" r="16" fill="var(--color-highlight)" opacity="0.6" />
      {/* Mangrove canopy + stilt roots */}
      <path
        d="M44 66c0-16 14-28 30-28s30 12 30 28c0 6-4 10-10 10H54c-6 0-10-4-10-10Z"
        fill="var(--color-primary-600)"
      />
      <g stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round">
        <path d="M74 76v18M74 94l-16 14M74 94l16 14M62 88 48 108M86 88l14 20" />
      </g>
      {/* Water */}
      <g stroke="var(--color-tint)" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M8 116c10-6 20-6 30 0s20 6 30 0 20-6 30 0 20 6 30 0" />
        <path d="M0 128c10-6 20-6 30 0s20 6 30 0 20-6 30 0 20 6 30 0" opacity="0.6" />
      </g>
    </>
  ),
};

/** Small square illustration shown beside each programme row. */
export function ProgrammeScene({
  scene,
  className,
}: {
  scene: Programme["scene"];
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
