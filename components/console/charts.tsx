/**
 * The dashboard's charts.
 *
 * DRAWN BY HAND, in SVG, as server components. No charting library, and that
 * is a considered decision rather than an aesthetic one:
 *
 *   - Recharts and its relatives are 40-90kB of JavaScript that runs on the
 *     client to produce markup this file produces on the server. The console's
 *     first screen would then be blank until that arrived.
 *   - Every one of them ships its own visual language - its own grid, its own
 *     tooltip, its own default palette - and the first hour with one is spent
 *     turning those off. The site already has a palette, a type scale and a
 *     line weight.
 *   - Four chart types is the whole requirement. That is a day of drawing, not
 *     a dependency to carry into production and upgrade for five years.
 *
 * COLOUR IS ROLE, not decoration, and follows the palette's own rule: `accent`
 * (amber) is for graphics and never for small text, so it is the fill of every
 * primary series; teal is the second series; clay marks the thing that is not
 * going well. No chart uses colour as its only signal - every one carries its
 * numbers as text somewhere on the screen, and each has an sr-only table so a
 * screen reader gets the data rather than "graphic".
 *
 * Everything is in a `viewBox` and scales with its container. Nothing measures
 * the DOM, so the server HTML is already correct - which is also what keeps
 * these off the wrong side of the SSR visibility rule.
 */

import { META } from "@/lib/theme";

/* ------------------------------------------------------------------- shared */

/** The palette, once. Series names are roles: `primary` is the thing being
 *  reported, `second` its companion, `weak` the neutral remainder. */
const SERIES = {
  primary: "var(--color-accent)",
  second: "var(--color-primary)",
  weak: "var(--color-surface-deep)",
  warn: "var(--color-clay)",
} as const;

export type SeriesTone = keyof typeof SERIES;

/** The data behind a chart, for anyone not looking at it. */
function DataTableFallback({
  caption,
  rows,
  valueHead = "Value",
}: {
  caption: string;
  rows: { label: string; value: string | number }[];
  valueHead?: string;
}) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          <th scope="col">{valueHead}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* --------------------------------------------------------------- area chart */

export type TrendPoint = { label: string; value: number; muted?: boolean };

/**
 * Twelve months of one number.
 *
 * An area rather than a line: the quantity is a count of people, and the fill
 * says "this much" in a way a 2px line does not. The last column is drawn
 * hatched when `muted` is set, because the current month is not over and a
 * chart that lets a part month look like a collapse is a chart that starts
 * meetings about nothing.
 */
export function AreaChart({
  points,
  caption,
  height = 200,
  tone = "primary",
}: {
  points: TrendPoint[];
  caption: string;
  height?: number;
  tone?: SeriesTone;
}) {
  const width = 720;
  const pad = { top: 16, right: 8, bottom: 28, left: 8 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const max = Math.max(...points.map((point) => point.value)) * 1.12;

  const x = (index: number) =>
    pad.left + (index / (points.length - 1)) * plotWidth;
  const y = (value: number) => pad.top + plotHeight * (1 - value / max);

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.value)}`)
    .join(" ");
  const area = `${line} L ${x(points.length - 1)} ${pad.top + plotHeight} L ${pad.left} ${pad.top + plotHeight} Z`;

  const gradientId = `area-${caption.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={caption}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES[tone]} stopOpacity="0.32" />
            <stop offset="100%" stopColor={SERIES[tone]} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Three gridlines and no axis. A frame around a twelve-point series
            is more ink than the series. */}
        {[0.25, 0.5, 0.75].map((step) => (
          <line
            key={step}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + plotHeight * step}
            y2={pad.top + plotHeight * step}
            stroke="var(--color-surface-deep)"
            strokeWidth="1"
          />
        ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={SERIES[tone]}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {points.map((point, index) => (
          <circle
            key={point.label}
            cx={x(index)}
            cy={y(point.value)}
            r={index === points.length - 1 ? 4 : 2.5}
            fill={point.muted ? "var(--color-paper)" : SERIES[tone]}
            stroke={SERIES[tone]}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Labels are HTML, not SVG text: `preserveAspectRatio="none"` stretches
          the drawing to the container, and stretched type is unreadable. */}
      <div className="mt-2 flex justify-between">
        {points.map((point) => (
          <span
            key={point.label}
            className={`text-sm ${point.muted ? "text-muted-light" : "text-muted"}`}
          >
            {point.label}
          </span>
        ))}
      </div>

      <DataTableFallback
        caption={caption}
        rows={points.map((point) => ({ label: point.label, value: point.value }))}
      />
    </figure>
  );
}

/* ---------------------------------------------------------------- bar chart */

export type BarDatum = {
  label: string;
  value: number;
  /** A second, smaller quantity drawn inside the bar - completions inside
   *  enrolments. Omit for a plain bar. */
  inner?: number;
  href?: string;
};

/**
 * Horizontal bars, because the labels are module titles.
 *
 * Vertical bars with "Climate Vulnerability Assessment" underneath them means
 * rotated type or truncation, and both are worse than turning the chart on its
 * side. Every bar carries its number at the end - the length is the
 * comparison, the figure is the fact.
 */
export function BarChart({
  data,
  caption,
  innerLabel,
}: {
  data: BarDatum[];
  caption: string;
  /** What the inner bar means, for the legend. */
  innerLabel?: string;
}) {
  const max = Math.max(...data.map((datum) => datum.value));

  return (
    <figure className="m-0">
      {innerLabel ? (
        <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-2 text-sm text-muted">
            <span className="size-2.5 rounded-full bg-accent" />
            Enrolments
          </span>
          <span className="flex items-center gap-2 text-sm text-muted">
            <span className="size-2.5 rounded-full bg-primary" />
            {innerLabel}
          </span>
        </div>
      ) : null}

      <ul className="space-y-4">
        {data.map((datum) => (
          <li key={datum.label}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="truncate text-lg text-ink">{datum.label}</span>
              <span className="shrink-0 font-display text-lg font-bold tabular-nums tracking-tight text-ink">
                {datum.value.toLocaleString("en-GB")}
              </span>
            </div>

            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-deep">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(datum.value / max) * 100}%` }}
              >
                {datum.inner !== undefined ? (
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(datum.inner / datum.value) * 100}%` }}
                  />
                ) : null}
              </div>
            </div>

            {datum.inner !== undefined ? (
              <p className={`mt-1.5 ${META.base}`}>
                {datum.inner.toLocaleString("en-GB")} {innerLabel?.toLowerCase()}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <DataTableFallback
        caption={caption}
        rows={data.map((datum) => ({ label: datum.label, value: datum.value }))}
      />
    </figure>
  );
}

/* -------------------------------------------------------------- donut chart */

export type Slice = {
  label: string;
  value: number;
  percent: number;
  tone: "primary" | "accent" | "muted" | "warn";
};

const SLICE_FILL = {
  primary: "var(--color-primary)",
  accent: "var(--color-accent)",
  muted: "var(--color-surface-deep)",
  warn: "var(--color-clay)",
} as const;

const SLICE_DOT = {
  primary: "bg-primary",
  accent: "bg-accent",
  muted: "bg-surface-deep",
  warn: "bg-clay",
} as const;

/**
 * Three parts of a whole.
 *
 * A donut and not a pie, because the hole is where the total goes, and the
 * total is the thing every other number on the card is a share of. Drawn with
 * `stroke-dasharray` on one circle per slice - no arc maths, no path strings,
 * and it is exact in the server HTML.
 *
 * Three slices is the ceiling. Past that the legend is doing all the work and
 * the drawing is decoration, which is what the bar chart above is for.
 */
export function DonutChart({
  slices,
  total,
  totalLabel,
  caption,
  size = 176,
}: {
  slices: Slice[];
  total: number;
  totalLabel: string;
  caption: string;
  size?: number;
}) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  // Each slice starts where the ones before it ended. Worked out up front
  // rather than accumulated inside the map - a running total mutated during
  // render is exactly what the compiler's immutability rule is there to catch,
  // and it would also be wrong the moment this rendered twice.
  const arcs = slices.map((slice, index) => ({
    slice,
    length: (slice.value / total) * circumference,
    offset:
      (slices
        .slice(0, index)
        .reduce((sum, earlier) => sum + earlier.value, 0) /
        total) *
      circumference,
  }));

  return (
    <figure className="m-0 flex flex-col items-center gap-7 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 160 160" className="size-full -rotate-90" role="img" aria-label={caption}>
          {arcs.map(({ slice, length, offset }) => (
            <circle
              key={slice.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={SLICE_FILL[slice.tone]}
              strokeWidth="18"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
            />
          ))}
        </svg>

        <div className="absolute inset-0 grid place-content-center text-center">
          <p className="font-display text-2xl font-bold leading-none tracking-tight text-ink">
            {total.toLocaleString("en-GB")}
          </p>
          <p className="mt-1.5 text-sm text-muted">{totalLabel}</p>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-3">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-baseline gap-3">
            <span
              aria-hidden="true"
              className={`mt-1.5 size-2.5 shrink-0 rounded-full ${SLICE_DOT[slice.tone]}`}
            />
            <span className="min-w-0 flex-1 truncate text-lg text-ink">
              {slice.label}
            </span>
            <span className="shrink-0 font-display text-lg font-bold tabular-nums tracking-tight text-ink">
              {slice.percent}%
            </span>
            <span className={`w-20 shrink-0 text-right tabular-nums ${META.base}`}>
              {slice.value.toLocaleString("en-GB")}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/* ---------------------------------------------------------------- sparkline */

/**
 * Twelve numbers, 96px wide, no axis and no labels.
 *
 * It answers one question - which way has this been going - beside a figure
 * that answers "how much". Anything more on a chart this size is texture.
 */
export function Sparkline({
  values,
  label,
  tone = "second",
  width = 96,
  height = 32,
}: {
  values: number[];
  label: string;
  tone?: SeriesTone;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
      className="overflow-visible"
    >
      <path
        d={points}
        fill="none"
        stroke={SERIES[tone]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width}
        cy={height - ((values[values.length - 1] - min) / span) * (height - 4) - 2}
        r="2.5"
        fill={SERIES[tone]}
      />
    </svg>
  );
}

/* ------------------------------------------------------------- share ranking */

/**
 * A ranked list with a share bar behind each row - districts, sectors.
 *
 * Not a chart so much as a table that shows its proportions. Nine districts on
 * a pie is nine wedges nobody can compare; as a ranked list the order IS the
 * information and the bars are the texture.
 */
export function RankedBars({
  data,
  caption,
  unit,
}: {
  data: { label: string; value: number; percent?: number }[];
  caption: string;
  /** "learners", "enrolments" - what the numbers count. */
  unit: string;
}) {
  const max = Math.max(...data.map((entry) => entry.value));

  return (
    <figure className="m-0">
      <ul className="space-y-2.5">
        {data.map((entry) => (
          <li key={entry.label} className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 rounded-sm bg-tint-mist"
              style={{ width: `${(entry.value / max) * 100}%` }}
            />
            <div className="relative flex items-baseline justify-between gap-4 px-3 py-2">
              <span className="truncate text-lg text-ink">{entry.label}</span>
              <span className="flex shrink-0 items-baseline gap-3">
                {entry.percent !== undefined ? (
                  <span className={META.base}>{entry.percent}%</span>
                ) : null}
                <span className="font-display text-lg font-bold tabular-nums tracking-tight text-ink">
                  {entry.value.toLocaleString("en-GB")}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>

      <DataTableFallback
        caption={caption}
        rows={data.map((entry) => ({ label: entry.label, value: entry.value }))}
        valueHead={unit}
      />
    </figure>
  );
}
