"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { MegaphoneIcon } from "@/components/console/icons";
import { META } from "@/lib/theme";
import type { AnnouncementScope } from "@/lib/comms";

/**
 * Sending an announcement - one-way, to an audience rather than a person.
 *
 * THE AUDIENCE LIST IS A PROP, NOT A DECISION THIS FILE MAKES. An
 * administrator may address every lecturer, every student, or a named few;
 * a lecturer may only ever address their own students. Both call sites
 * build their own `AnnouncementScope[]` from `lib/comms.ts`
 * (`announcementScopesForAdmin` / `announcementScopesForLecturer`) and hand
 * it to the same form, so "who may this account speak to" is answered once,
 * in data, rather than duplicated as two slightly different forms.
 */
function AnnouncementForm({
  formId,
  scopes,
}: {
  formId: string;
  scopes: AnnouncementScope[];
}) {
  const [scopeKind, setScopeKind] = useState<AnnouncementScope["kind"] | undefined>(
    scopes[0]?.kind,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [sent, setSent] = useState(false);

  const scope = scopes.find((entry) => entry.kind === scopeKind);
  const isModule = scope?.kind === "module";
  const needsPicker = Boolean(scope && "options" in scope);

  const missing = [
    !scope && "an audience",
    needsPicker && !selectedIds.length && (isModule ? "a module" : "at least one recipient"),
    !title.trim() && "a title",
    !body.trim() && "a message",
  ].filter((entry): entry is string => Boolean(entry));

  function toggle(id: string) {
    setSelectedIds((current) =>
      isModule
        ? [id]
        : current.includes(id)
          ? current.filter((entry) => entry !== id)
          : [...current, id],
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
      <fieldset>
        <legend className="mb-3 text-lg font-semibold text-ink">Send to</legend>
        <div className="space-y-2">
          {scopes.map((option) => (
            <label
              key={option.kind}
              className="flex cursor-pointer items-center gap-2.5 rounded-sm border border-surface-deep bg-paper px-4 py-2.5 text-lg text-ink-soft transition-colors hover:border-muted-light"
            >
              <input
                type="radio"
                name={`${formId}-scope`}
                checked={scopeKind === option.kind}
                onChange={() => {
                  setScopeKind(option.kind);
                  setSelectedIds([]);
                }}
                className="checkbox"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {scope && "options" in scope ? (
        <fieldset className="mt-5">
          <legend className="mb-3 text-lg font-semibold text-ink">
            {isModule ? "Which module" : "Who exactly"}
          </legend>
          {scope.options.length ? (
            <div className="flex flex-wrap gap-2">
              {scope.options.map((entry) => (
                <label
                  key={entry.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-full border border-surface-deep bg-paper px-4 py-2 text-lg text-ink-soft transition-colors hover:border-muted-light"
                >
                  <input
                    type={isModule ? "radio" : "checkbox"}
                    name={isModule ? `${formId}-module` : undefined}
                    checked={selectedIds.includes(entry.id)}
                    onChange={() => toggle(entry.id)}
                    className="checkbox"
                  />
                  {entry.label}
                </label>
              ))}
            </div>
          ) : (
            <p className={META.base}>Nothing to choose from yet.</p>
          )}
        </fieldset>
      ) : null}

      <label className="mt-6 block">
        <span className="mb-2 block text-lg font-semibold text-ink">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="A short line - this is what shows in the notification panel"
          className="field"
        />
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block text-lg font-semibold text-ink">Message</span>
        <textarea
          rows={4}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What you want them to know. Nobody can reply to an announcement - if this needs a back-and-forth, send a message instead."
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
          Prototype - nothing was sent. A real send would put this straight in
          the notification panel of everyone it reached.
        </p>
      ) : null}
    </form>
  );
}

export function ComposeAnnouncementAction({
  scopes,
  buttonLabel = "New announcement",
  drawerDescription,
}: {
  scopes: AnnouncementScope[];
  buttonLabel?: string;
  drawerDescription?: string;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <ActionButton variant="solid" size="sm" onClick={() => setOpen(true)}>
        <MegaphoneIcon className="size-4" />
        {buttonLabel}
      </ActionButton>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Send an announcement"
        description={
          drawerDescription ??
          "One-way - nobody can reply to this. For a back-and-forth, send a message instead."
        }
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Send it
          </ActionButton>
        }
      >
        <AnnouncementForm formId={formId} scopes={scopes} />
      </Drawer>
    </>
  );
}
