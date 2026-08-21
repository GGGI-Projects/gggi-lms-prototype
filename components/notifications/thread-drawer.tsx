"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { META } from "@/lib/theme";
import { formatDate } from "@/lib/portal";
import type { MessageThread } from "@/content/comms";

/**
 * One conversation, opened from the notifications page's Messages list.
 *
 * Every message so far is shown in order, right-aligned for the viewer's
 * own and left for the other side - the one visual convention everybody
 * already reads as "a chat" - and a reply box sits under it. Replying
 * follows the same rule as every other form in this prototype: submitting
 * shows the standing "nothing was sent" note rather than appending the
 * reply to the thread, which would only be true until the page refreshed.
 */
export function ThreadDrawer({
  thread,
  viewerId,
  otherName,
  unread,
}: {
  thread: MessageThread;
  viewerId: string;
  otherName: string;
  unread: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const formId = useId();
  const last = thread.messages[thread.messages.length - 1];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-start justify-between gap-4 rounded-sm border border-surface-deep bg-paper-raised px-4 py-3.5 text-left transition-colors hover:border-muted-light"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate text-lg font-semibold text-ink">{otherName}</span>
            {unread ? (
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
            ) : null}
          </span>
          <span className={`mt-0.5 block truncate ${META.base}`}>{last.body}</span>
        </span>
        <span className={`shrink-0 whitespace-nowrap ${META.base}`}>
          {formatDate(last.sentOn)}
        </span>
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={otherName}
        description="Only the two of you can see this conversation."
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Send reply
          </ActionButton>
        }
      >
        <ul className="space-y-4">
          {thread.messages.map((message) => {
            const mine = message.from === viewerId;
            return (
              <li key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-sm border px-4 py-3 ${
                    mine
                      ? "border-primary/25 bg-tint-mist"
                      : "border-surface-deep bg-paper-raised"
                  }`}
                >
                  <p className="text-lg leading-relaxed text-ink">{message.body}</p>
                  <p className={`mt-1.5 ${META.base}`}>
                    {mine ? "You" : otherName} · {formatDate(message.sentOn)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <form
          id={formId}
          className="mt-6 border-t border-surface-deep pt-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!body.trim()) return;
            setSent(true);
          }}
        >
          <label className="block">
            <span className="mb-2 block text-lg font-semibold text-ink">
              Reply to {otherName}
            </span>
            <textarea
              rows={3}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write your reply"
              className="field"
            />
          </label>
          {sent ? (
            <p
              role="status"
              className="mt-4 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
            >
              Prototype - nothing was sent. A real reply would appear here for{" "}
              {otherName} immediately.
            </p>
          ) : null}
        </form>
      </Drawer>
    </>
  );
}
