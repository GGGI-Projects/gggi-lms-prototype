"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { CheckIcon, DownloadIcon, LinkIcon } from "@/components/student-portal/icons";

/**
 * The two things anyone does with a certificate: keep a copy, and send it to
 * someone.
 *
 * "Download as PDF" is the browser's own print dialog, and the print rules in
 * globals.css cut everything except the sheet. That is not a stand-in for a
 * real export - it IS the export a document-shaped credential should have, and
 * it works offline, on a projector, with no server behind it.
 *
 * "Copy link" writes the current URL. The clipboard API needs a secure context
 * and can be refused, so the failure path is handled rather than assumed: if
 * the write is rejected the button says so instead of silently claiming
 * success.
 */
export function CertificateActions({ reference }: { reference: string }) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied("done");
      window.setTimeout(() => setCopied("idle"), 2500);
    } catch {
      setCopied("failed");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <ActionButton
          variant="solid"
          size="sm"
          className="group"
          onClick={() => window.print()}
        >
          <DownloadIcon className="size-4" />
          Download as PDF
        </ActionButton>

        <ActionButton variant="line" size="sm" onClick={copyLink}>
          {copied === "done" ? (
            <CheckIcon className="size-4" />
          ) : (
            <LinkIcon className="size-4" />
          )}
          {copied === "done" ? "Link copied" : "Copy link"}
        </ActionButton>
      </div>

      <p role="status" className="mt-3 text-sm text-muted">
        {copied === "failed"
          ? `Your browser blocked the clipboard. The reference is ${reference}.`
          : "The PDF is produced by your browser's print dialog - choose “Save as PDF”."}
      </p>
    </div>
  );
}
