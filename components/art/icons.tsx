/**
 * Duotone icons.
 *
 * Drawn here rather than pulled from a stock set for two reasons. Flaticon's
 * free tier requires a visible "icon by ... from Flaticon" credit on any page
 * that uses one, which is not something a client-facing product wants to
 * carry, and their files cannot be redistributed inside a repo. Permissively
 * licensed sets (Lucide, Phosphor, Tabler) have no such problem, but they are
 * uniform 2px outlines - exactly what these already were, so swapping would
 * not have made them any more graphic.
 *
 * What makes an icon read at 40px is a solid shape, not a heavier line. Each
 * of these is built the same way: a filled silhouette at 16% of the card's
 * colour, a crisp outline on top of it, and one solid detail at full strength
 * for the eye to land on. They share a 24 grid and a 1.8 weight, so they sit
 * together as a set.
 *
 * Colour comes from `currentColor` throughout, so the card sets the hue once
 * and every layer follows. All are `aria-hidden` - each sits above a heading
 * that already says the same thing.
 */

type IconProps = { className?: string; style?: React.CSSProperties };

/** The soft fill sitting under every outline. */
const SOFT = 0.16;

const base = {
  "aria-hidden": true as const,
  viewBox: "0 0 24 24",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** An open padlock - nothing here is held behind a paywall. */
export function OpenLockIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      {/* Drawn first so the body covers where it meets the case. */}
      <path
        d="M13.5 10.4V6.6a3.9 3.9 0 0 1 7.8 0v2.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="2.6"
        y="9.8"
        width="14.8"
        height="11.6"
        rx="3.2"
        fill="currentColor"
        opacity={SOFT}
      />
      <rect
        x="2.6"
        y="9.8"
        width="14.8"
        height="11.6"
        rx="3.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="10" cy="14.7" r="1.55" fill="currentColor" />
      <path
        d="M10 16.2v2.3"
        stroke="currentColor"
        strokeWidth="1.8"
        opacity="0.75"
      />
    </svg>
  );
}

/** An open gateway - you can walk in without qualifying first. */
export function GatewayIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path
        d="M3.2 20.6V11.4a8.8 8.8 0 0 1 17.6 0v9.2Z"
        fill="currentColor"
        opacity={SOFT}
      />
      <path
        d="M3.2 20.6V11.4a8.8 8.8 0 0 1 17.6 0v9.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* The opening itself - the whole point of the mark. */}
      <path
        d="M8.6 20.6v-8a3.4 3.4 0 0 1 6.8 0v8"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.7"
      />
      <path d="M1.7 20.6h20.6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const PIN =
  "M12 20.4s6.9-6.3 6.9-11.2a6.9 6.9 0 1 0-13.8 0c0 4.9 6.9 11.2 6.9 11.2Z";

/** A map pin - this is written for one country, not adapted to it. */
export function PinIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      {/* Ground shadow. It plants the pin on a surface, which is the
          difference between "located here" and a generic marker. */}
      <ellipse
        cx="12"
        cy="21.6"
        rx="4.6"
        ry="1.4"
        fill="currentColor"
        opacity={SOFT}
      />
      <path d={PIN} fill="currentColor" opacity={SOFT} />
      <path d={PIN} stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="9.2" r="2.45" fill="currentColor" />
    </svg>
  );
}
