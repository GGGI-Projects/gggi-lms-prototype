"use client";

/**
 * Form controls for the account pages.
 *
 * The look of a control - height, radius, border, focus ring - is `.field` in
 * globals.css, not a pile of utilities here. What this file owns is the
 * STRUCTURE around it: where the label sits, how an optional field is marked,
 * where a hint goes, and how a trailing control is placed inside the box. Those
 * are the parts a second form would otherwise get subtly wrong.
 */

import { useId, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------- shell */

type ShellProps = {
  id: string;
  label: string;
  /** Rendered next to the label, for fields that are not required. */
  optional?: boolean;
  /**
   * A link sharing the label's row - "Forgot password?" and nothing else so
   * far. It sits up here rather than under the input because that is where a
   * visitor looks when the password they just typed was rejected, and because
   * anything below the field competes with the submit button.
   *
   * Shares the slot with `optional`; a field that is both would be asking two
   * questions in one line, so the marker wins.
   */
  action?: ReactNode;
  /** One line under the control - guidance, not an error. */
  hint?: ReactNode;
  /**
   * Anything richer that belongs under the control - currently the password
   * meter.
   *
   * It has to sit OUTSIDE the relative box below, not inside it. That box is
   * what the password field's Show button is positioned against, and anything
   * added to it makes the box taller - so a meter in there would drag a
   * `top-1/2` button down out of the input the moment it appeared.
   */
  below?: ReactNode;
  children: ReactNode;
};

function FieldShell({
  id,
  label,
  optional,
  action,
  hint,
  below,
  children,
}: ShellProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        {/* The Body step, not Small - the same rule the button sizes follow:
            a control is something you act on, not a caption about something
            else, so it is never Small. This label names the box the visitor is
            about to type in, and it sat a step below the text they type into
            it. What separates it from the hint underneath is now weight and
            colour - semibold ink against Small muted - which is the hierarchy
            the rest of the page uses. */}
        <label htmlFor={id} className="text-lg font-semibold text-ink">
          {label}
        </label>
        {optional ? <span className="text-sm text-muted">Optional</span> : action}
      </div>
      <div className="relative mt-2">{children}</div>
      {below}
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

/* --------------------------------------------------------------- text field */

export function TextField({
  label,
  type = "text",
  name,
  placeholder,
  autoComplete,
  optional,
  hint,
  defaultValue,
  readOnly,
}: {
  label: string;
  type?: "text" | "email";
  name: string;
  placeholder?: string;
  autoComplete?: string;
  optional?: boolean;
  hint?: ReactNode;
  /**
   * For the profile form, where every field arrives holding what the account
   * already says. The account pages leave it undefined and get empty fields.
   */
  defaultValue?: string;
  /** A value the learner can see but not change - see the profile form. */
  readOnly?: boolean;
}) {
  // `useId` rather than the name: two of these can appear on one page (a form
  // and a modal of the same form) and a duplicated id silently breaks the label
  // association for the second one.
  const id = useId();

  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint}>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        readOnly={readOnly}
        required={!optional}
        // A read-only field still has to look like a field - it is showing a
        // real value - so it keeps the border and loses only the interaction
        // affordances.
        className={`field ${readOnly ? "cursor-not-allowed bg-surface text-muted" : ""}`}
      />
    </FieldShell>
  );
}

/* ------------------------------------------------------------- select field */

export function SelectField({
  label,
  name,
  options,
  optional,
  hint,
  defaultValue = "",
}: {
  label: string;
  name: string;
  options: readonly string[];
  optional?: boolean;
  hint?: ReactNode;
  /** Empty shows the "Choose one" placeholder - see `TextField`. */
  defaultValue?: string;
}) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint}>
      {/* `appearance-none` plus a drawn chevron: the native arrow is rendered
          by the OS and cannot be recoloured, so on this palette it arrives as a
          grey Windows triangle in the middle of a warm form. */}
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={!optional}
        className="field appearance-none pr-12"
      >
        <option value="" disabled>
          Choose one
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </FieldShell>
  );
}

/* ----------------------------------------------------------- password field */

export function PasswordField({
  label,
  name,
  autoComplete,
  placeholder,
  /**
   * Only when a password is being CHOSEN. Metering one that already exists
   * tells the visitor something they can do nothing about, at the moment they
   * are trying to get back into their account - and grading an existing
   * password "Weak" as they type it is a small insult with no remedy attached.
   */
  meter: showMeter = false,
  action,
}: {
  label: string;
  name: string;
  autoComplete?: string;
  placeholder?: string;
  meter?: boolean;
  action?: ReactNode;
}) {
  const id = useId();
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const strength = scorePassword(value);

  // Only once there is something to measure. A strength meter under an empty
  // box is a judgement on nothing.
  const meter = showMeter && value ? (
    <div id={`${id}-strength`} className="mt-3 flex items-center gap-3">
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((step) => (
          <span
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              step < strength.score ? STRENGTH_BAR[strength.score] : "bg-surface-deep"
            }`}
          />
        ))}
      </div>
      {/* Announced politely: it updates as the visitor types, and an assertive
          region would interrupt them mid-word. */}
      <p aria-live="polite" className="w-24 shrink-0 text-right text-sm text-muted">
        {strength.label}
      </p>
    </div>
  ) : null;

  return (
    <FieldShell id={id} label={label} action={action} below={meter}>
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoComplete={autoComplete}
        required
        // A length floor belongs on the field where the password is being set,
        // not on the one where an old password is being recalled - an account
        // made before the rule changed would otherwise be locked out by its own
        // sign-in form.
        minLength={showMeter ? 8 : undefined}
        placeholder={placeholder}
        className="field pr-24"
        aria-describedby={meter ? `${id}-strength` : undefined}
      />

      {/* A real button, not an icon with a click handler: this is reachable by
          Tab, and it announces which state it will move to. */}
      <button
        type="button"
        onClick={() => setVisible((shown) => !shown)}
        // The visible word is the first word of the label, so a voice-control
        // user saying "click Show" still hits it.
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xs px-3 py-2 text-sm font-semibold text-primary transition-colors hover:text-primary-950"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </FieldShell>
  );
}

/**
 * Four filled segments = four things done right, not an entropy estimate.
 *
 * This is a prototype and nothing behind it enforces anything, so the meter's
 * job is to say what a real one would ask for rather than to be accurate about
 * crackability. Length counts twice because it is the one that actually
 * matters.
 */
function scorePassword(value: string) {
  if (!value) return { score: 0, label: "" };

  const checks = [
    value.length >= 8,
    value.length >= 12,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value) || /[^\w\s]/.test(value),
  ];

  const score = checks.filter(Boolean).length;
  return { score, label: STRENGTH_LABEL[score] };
}

const STRENGTH_LABEL = ["Too short", "Weak", "Fair", "Good", "Strong"] as const;

/* Indexed by score, so a class name is never constructed - Tailwind finds
   classes by scanning source text and cannot see an interpolated one. */
const STRENGTH_BAR = [
  "bg-surface-deep",
  "bg-clay",
  "bg-accent",
  "bg-primary-600",
  "bg-primary",
] as const;

/* ------------------------------------------------------------------- icons */

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
