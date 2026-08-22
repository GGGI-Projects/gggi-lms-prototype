"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { MailIcon } from "@/components/console/icons";
import { META } from "@/lib/theme";
import type { ContactOption } from "@/lib/comms";

function groupContacts(contacts: ContactOption[]): [string, ContactOption[]][] {
  const groups = new Map<string, ContactOption[]>();
  for (const contact of contacts) {
    const key = contact.group ?? "";
    const bucket = groups.get(key);
    if (bucket) bucket.push(contact);
    else groups.set(key, [contact]);
  }
  return [...groups.entries()];
}

function MessageForm({
  formId,
  contacts,
  preselected,
}: {
  formId: string;
  contacts: ContactOption[];
  preselected?: ContactOption;
}) {
  const [recipientIds, setRecipientIds] = useState<string[]>(
    preselected ? [preselected.id] : [],
  );
  const [body, setBody] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [sent, setSent] = useState(false);

  const missing = [
    !recipientIds.length && "a recipient",
    !body.trim() && "a message",
  ].filter((entry): entry is string => Boolean(entry));
  const grouped = groupContacts(contacts);

  function toggle(id: string) {
    setRecipientIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  }

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        if (missing.length) {
          setBlocked(true);
          return;
        }
        setBlocked(false);
        setSent(true);
      }}
    >
      {preselected ? (
        <p className="text-lg text-ink">
          <span className="font-semibold">To:</span> {preselected.label}
        </p>
      ) : (
        <fieldset>
          <legend className="mb-2 block text-lg font-semibold text-ink">To</legend>
          <div className="space-y-4">
            {grouped.map(([group, options]) => (
              <div key={group || "_"}>
                {group ? <p className={`${META.base} mb-2`}>{group}</p> : null}
                <div className="flex flex-wrap gap-2">
                  {options.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-full border border-surface-deep bg-paper px-4 py-2 text-lg text-ink-soft transition-colors hover:border-muted-light"
                    >
                      <input
                        type="checkbox"
                        checked={recipientIds.includes(contact.id)}
                        onChange={() => toggle(contact.id)}
                        className="checkbox"
                      />
                      {contact.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      )}

      <label className="mt-5 block">
        <span className="mb-2 block text-lg font-semibold text-ink">Message</span>
        <textarea
          rows={5}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="They'll be able to reply - this is a conversation, not a broadcast."
          className="field"
        />
      </label>

      {blocked ? (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-clay/35 bg-clay-pale px-5 py-4 text-lg leading-relaxed text-clay"
        >
          Still missing: {missing.join(", ")}.
        </p>
      ) : null}

      {sent ? (
        <p
          role="status"
          className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          Prototype - nothing was sent. A real send would start a separate
          conversation with each person picked - one thread per recipient, so
          each can reply on their own - in their notifications right away,
          and yours once they reply.
        </p>
      ) : null}
    </form>
  );
}

/**
 * Starting a new conversation - unlike `ThreadDrawer`, which continues one
 * that already exists. Either party may be the one to start it (a student
 * asking a lecturer a question, a lecturer asking their administrator
 * something) - the difference between this file and that one is purely
 * "does a thread exist yet", not who is allowed to use which.
 */
export function ComposeMessageAction({
  contacts,
  preselectedId,
  buttonLabel = "New message",
  drawerTitle = "Send a message",
  drawerDescription = "They can reply - unlike an announcement, this is a conversation.",
}: {
  contacts: ContactOption[];
  /** Locks the recipient and hides the picker - the "Message this lecturer"
   *  / "Send a message" button on someone's own detail page. */
  preselectedId?: string;
  buttonLabel?: string;
  drawerTitle?: string;
  drawerDescription?: string;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const preselected = preselectedId
    ? contacts.find((contact) => contact.id === preselectedId)
    : undefined;

  if (!contacts.length) {
    return <p className={META.base}>Nobody to message yet.</p>;
  }

  return (
    <>
      <ActionButton variant="line" size="sm" onClick={() => setOpen(true)}>
        <MailIcon className="size-4" />
        {buttonLabel}
      </ActionButton>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={drawerTitle}
        description={drawerDescription}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Send
          </ActionButton>
        }
      >
        <MessageForm formId={formId} contacts={contacts} preselected={preselected} />
      </Drawer>
    </>
  );
}
