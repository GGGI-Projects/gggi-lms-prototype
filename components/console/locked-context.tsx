"use client";

import { createContext, useContext } from "react";
import { RESTRICTION } from "@/lib/permissions";

/**
 * "Everything in here is read-only, and this is why."
 *
 * Its own module because both halves of the arrangement are client components
 * that must share one context object - `<SettingsGate>` provides it and
 * `<SettingsGroup>` reads it - and two files each calling `createContext`
 * would produce two contexts that never meet.
 *
 * `null` means not locked, which keeps the common case free of a wrapper.
 */
export type LockedReason = { note: string } | null;

const LockedGroupContext = createContext<LockedReason>(null);

export const LockedGroupProvider = LockedGroupContext.Provider;

export function useLockedGroup(): LockedReason {
  return useContext(LockedGroupContext);
}

/** The one reason used so far, taken from the permission model's own wording. */
export const LOCKED: LockedReason = {
  note:
    RESTRICTION.managePlatformSettings ??
    "Only the super administrator can change these.",
};
