/**
 * "Continue with Google".
 *
 * Deliberately NOT an `<ActionButton>`. Every variant of that button floods
 * with a brand colour on hover, and this one has to stay a neutral white
 * surface: Google's identity guidelines are specific about the mark sitting on
 * white or on their own blue, and a teal wave washing over the G would put it
 * on neither. Same geometry as `.btn-md` - 1rem/2rem padding on a 2px border -
 * so it lines up with the submit button beneath it.
 *
 * Inert in the prototype: there is no OAuth behind it, and a button that
 * pretends to start a flow it cannot finish is worse in a demo than one that
 * visibly does nothing.
 */
export function GoogleButton() {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-surface-deep bg-paper-raised px-8 py-4 text-lg font-semibold text-ink transition-colors duration-300 hover:border-muted-light hover:bg-surface"
    >
      <GoogleMark className="size-5" />
      Continue with Google
    </button>
  );
}

/** The four-colour G, at its official proportions. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84a10.12 10.12 0 0 1-4.4 6.64v5.52h7.12c4.16-3.83 6.56-9.47 6.56-16.17Z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.12-5.52c-1.97 1.32-4.49 2.1-7.44 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7A21.99 21.99 0 0 0 24 46Z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18A13.2 13.2 0 0 1 11 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7Z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07Z"
      />
    </svg>
  );
}
