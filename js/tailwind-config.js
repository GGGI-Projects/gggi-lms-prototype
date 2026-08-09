/* ==========================================================================
   EcoLearn Prototype — Canonical Tailwind Theme
   --------------------------------------------------------------------------
   Loaded by every page right after the Tailwind CDN script. Previously each
   exported page carried its own inline tailwind.config with slightly
   different color values (e.g. "primary" was #00490e on one page and
   #003006 on another), which was the main cause of the visual
   inconsistency between pages. This file is the single source of truth for
   colors, radii, spacing and type scale across the whole app.

   Source of truth: student-settings.html (approved reference design).
   ========================================================================== */
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-primary": "#88d982",
        "secondary-container": "#baecbc",
        "on-error": "#ffffff",
        "secondary-fixed-dim": "#a2d2a4",
        "inverse-surface": "#2f3131",
        "on-tertiary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container-highest": "#e2e2e2",
        "primary-fixed": "#a3f69c",
        "on-primary-container": "#cbffc2",
        "on-tertiary-container": "#b0cbff",
        "surface-container-low": "#f4f3f3",
        "on-secondary": "#ffffff",
        "on-surface": "#1a1c1c",
        "surface-tint": "#1b6d24",
        "on-primary-fixed-variant": "#005312",
        "on-secondary-fixed-variant": "#24502c",
        "outline-variant": "#bfcaba",
        secondary: "#3c6842",
        "on-secondary-fixed": "#002109",
        "on-tertiary-fixed-variant": "#00468c",
        "secondary-fixed": "#bdefbf",
        "on-tertiary-fixed": "#001b3e",
        "primary-fixed-dim": "#88d982",
        "on-primary-fixed": "#002203",
        tertiary: "#003d7d",
        "surface-container": "#eeeeed",
        "tertiary-fixed-dim": "#a9c7ff",
        "on-surface-variant": "#40493d",
        "tertiary-container": "#0054a7",
        primary: "#00490e",
        "inverse-on-surface": "#f1f1f0",
        "on-error-container": "#93000a",
        "error-container": "#ffdad6",
        "on-background": "#1a1c1c",
        error: "#ba1a1a",
        "surface-variant": "#e2e2e2",
        "surface-container-high": "#e8e8e8",
        "tertiary-fixed": "#d6e3ff",
        "surface-dim": "#dadad9",
        "on-primary": "#ffffff",
        outline: "#707a6c",
        surface: "#f9f9f9",
        background: "#f9f9f9",
        "on-secondary-container": "#406c46",
        "primary-container": "#0d631b",
        "surface-bright": "#f9f9f9",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        "container-max": "1280px",
        base: "8px",
        gutter: "24px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
      },
      fontFamily: {
        "label-md": ["Inter"],
        "display-lg": ["Inter"],
        "body-lg": ["Inter"],
        "headline-lg-mobile": ["Inter"],
        "headline-lg": ["Inter"],
        "body-md": ["Inter"],
        "title-lg": ["Inter"],
        "label-lg": ["Inter"],
      },
      fontSize: {
        "label-md": [
          "12px",
          {
            lineHeight: "16px",
            letterSpacing: "0.5px",
            fontWeight: "500",
          },
        ],
        "display-lg": [
          "57px",
          {
            lineHeight: "64px",
            letterSpacing: "-0.25px",
            fontWeight: "700",
          },
        ],
        "body-lg": [
          "16px",
          {
            lineHeight: "24px",
            letterSpacing: "0.5px",
            fontWeight: "400",
          },
        ],
        "headline-lg-mobile": [
          "28px",
          { lineHeight: "36px", letterSpacing: "0px", fontWeight: "600" },
        ],
        "headline-lg": [
          "32px",
          { lineHeight: "40px", letterSpacing: "0px", fontWeight: "600" },
        ],
        "body-md": [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0.25px",
            fontWeight: "400",
          },
        ],
        "title-lg": [
          "22px",
          { lineHeight: "28px", letterSpacing: "0px", fontWeight: "500" },
        ],
        "label-lg": [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0.1px",
            fontWeight: "500",
          },
        ],
      },
    },
  },
};
