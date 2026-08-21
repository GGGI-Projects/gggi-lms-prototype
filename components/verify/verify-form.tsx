"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";
import { SearchIcon } from "@/components/student-portal/icons";

/**
 * The "check by reference" box on `/verify`.
 *
 * A QR code is one way to arrive here with a reference already filled in -
 * see `lib/qr.ts` - but a certificate is also printed, screenshotted and read
 * out over the phone, and none of those give anyone a camera pointed at a
 * code. This is the other way in.
 *
 * Submitting NAVIGATES rather than fetching in place: the result lives at
 * `/verify/[reference]`, a real URL someone can bookmark, paste back to
 * whoever they are checking, or share to say "this one's real" - a result
 * that only ever existed as client state under the form would not survive
 * being copied out of the address bar.
 */
export function VerifyForm({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState(defaultValue);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = value.trim();
        router.push(trimmed ? `/verify/${encodeURIComponent(trimmed)}` : "/verify");
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <label htmlFor={id} className="sr-only">
        Certificate reference
      </label>
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. GP-2026-PA-04817"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="field pl-11 font-display tracking-tight tabular-nums"
        />
      </div>
      <ActionButton type="submit" variant="solid" size="lg" className="shrink-0">
        Check certificate
      </ActionButton>
    </form>
  );
}
