/**
 * What every state on the platform is called, and what colour it is.
 *
 * ONE TABLE, because the same three learner statuses appear on the register,
 * the learner's own page, the lecturer's learner list and two dashboards.
 * Written at each call site, "dormant" becomes "inactive" on one of them
 * within a month, and an administrator has to work out whether those are the
 * same thing.
 *
 * Tones are the portal's badge ROLES rather than colours - see `Badge` - so
 * re-pitching "suspended" from clay to something else is one edit here.
 *
 * No data imports: this is a lookup table, and it has to be safe for a client
 * component to import.
 */

import type { BadgeTone } from "@/components/student-portal/ui";

/* ---------------------------------------------------------------- learners */

export const STATUS_LABEL = {
  active: "Active",
  dormant: "Dormant",
  suspended: "Suspended",
} as const;

export const STATUS_TONE: Record<keyof typeof STATUS_LABEL, BadgeTone> = {
  active: "done",
  dormant: "neutral",
  suspended: "warn",
};

/* ------------------------------------------------------------------- staff */

export const STAFF_STATUS_LABEL = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
} as const;

export const STAFF_STATUS_TONE: Record<
  keyof typeof STAFF_STATUS_LABEL,
  BadgeTone
> = {
  active: "done",
  // Amber: an invitation is outstanding work, not a problem.
  invited: "active",
  suspended: "warn",
};

/* -------------------------------------------------------------- modules */

export const MODULE_STATUS_LABEL = {
  published: "Published",
  draft: "Draft",
} as const;

export const MODULE_STATUS_TONE: Record<
  keyof typeof MODULE_STATUS_LABEL,
  BadgeTone
> = {
  published: "done",
  draft: "neutral",
};

/* ----------------------------------------------------------------- lectures */

export const LECTURE_STATE_LABEL = {
  published: "Published",
  "in-review": "In review",
  draft: "Draft",
  "not-started": "Not started",
} as const;

export const LECTURE_STATE_TONE: Record<
  keyof typeof LECTURE_STATE_LABEL,
  BadgeTone
> = {
  published: "done",
  "in-review": "active",
  draft: "info",
  "not-started": "neutral",
};

/* ----------------------------------------------------------------- reviews */

export const REVIEW_STATUS_LABEL = {
  pending: "Waiting",
  published: "Published",
  rejected: "Rejected",
} as const;

export const REVIEW_STATUS_TONE: Record<
  keyof typeof REVIEW_STATUS_LABEL,
  BadgeTone
> = {
  pending: "active",
  published: "done",
  rejected: "warn",
};

/* ------------------------------------------------------------ certificates */

export const CERTIFICATE_STATUS_LABEL = {
  issued: "Issued",
  revoked: "Revoked",
} as const;

export const CERTIFICATE_STATUS_TONE: Record<
  keyof typeof CERTIFICATE_STATUS_LABEL,
  BadgeTone
> = {
  issued: "done",
  revoked: "warn",
};
