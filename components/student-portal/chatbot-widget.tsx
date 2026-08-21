"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { answerFromKnowledgeBase } from "@/lib/chatbot";
import { META } from "@/lib/theme";
import { ChatIcon, CloseIcon } from "@/components/student-portal/icons";

type ChatMessage = { id: string; from: "bot" | "learner"; text: string };

const GREETING =
  "Hello - I can answer questions about the platform, its modules and lectures, and its lecturers, right away. Ask me anything, or try one of these:";

const SUGGESTIONS = [
  "What modules are available?",
  "How do I earn a certificate?",
  "Who writes the lectures?",
];

/**
 * The floating assistant, present on every signed-in learner screen (see
 * `PortalShell`) - a FLOATING BUTTON rather than a header icon, chosen
 * because the header itself scrolls out of view while reading a lecture and
 * the one place a learner is most likely to have a question is exactly
 * there.
 *
 * IT ANSWERS FROM ONE PLACE ONLY: `knowledgeBase`, the paragraph an
 * administrator keeps in Platform Settings (§4.23/§4.26 of the SRS),
 * matched against a question entirely in the browser - see
 * `answerFromKnowledgeBase` in `lib/chatbot.ts` for why that is a keyword
 * search and not a real model, and why that is the honest choice for this
 * prototype rather than a shortcut. A question it cannot answer gets a
 * plain "I don't know" that points at messaging a lecturer instead (§4.25) -
 * never an invented answer.
 *
 * The panel is a small anchored popup, not the console's full-height sliding
 * `<Drawer>` - the same shape as `NotificationBell`'s preview panel, because
 * this is a running conversation someone dips in and out of beside the page
 * they are reading, not a form that needs the whole screen.
 */
export function ChatbotWidget({ knowledgeBase }: { knowledgeBase: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "greeting", from: "bot", text: GREETING },
  ]);
  const [draft, setDraft] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Keeps the latest message in view, including the greeting on first open.
  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [open, messages]);

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    const answer = answerFromKnowledgeBase(trimmed, knowledgeBase);
    setMessages((previous) => [
      ...previous,
      { id: `q-${previous.length}`, from: "learner", text: trimmed },
      { id: `a-${previous.length + 1}`, from: "bot", text: answer.text },
    ]);
    setDraft("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    ask(draft);
  }

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7">
      {open ? (
        <div
          role="dialog"
          aria-label="Ask a question"
          className="mb-3 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-sm border border-surface-deep bg-paper shadow-lg"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-surface-deep px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-ink">
                Ask a question
              </p>
              <p className={`truncate ${META.base}`}>
                Answers immediately - no lecturer needed
              </p>
            </div>
            <button
              type="button"
              aria-label="Close the assistant"
              onClick={() => setOpen(false)}
              className="grid size-8 shrink-0 place-items-center rounded-sm text-ink-soft transition-colors hover:bg-surface hover:text-ink"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.from === "learner" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-sm px-3 py-2 text-base leading-snug ${
                    message.from === "learner"
                      ? "bg-tint-mist text-ink"
                      : "bg-surface text-ink"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          {/* Only offered before the first real question - once a
              conversation exists these would just be clutter under it. */}
          {messages.length === 1 ? (
            <div className="flex shrink-0 flex-wrap gap-2 border-t border-surface-deep px-4 py-3">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="rounded-full border border-surface-deep px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <form
            onSubmit={onSubmit}
            className="flex shrink-0 items-center gap-2 border-t border-surface-deep p-3"
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about a module, lecture or lecturer"
              aria-label="Your question"
              className="field flex-1"
            />
            <ActionButton type="submit" variant="solid" size="sm">
              Ask
            </ActionButton>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        aria-label={open ? "Close the assistant" : "Ask a question"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="grid size-14 place-items-center rounded-full bg-primary text-paper shadow-lg transition-transform duration-300 hover:scale-105"
      >
        {open ? <CloseIcon className="size-5" /> : <ChatIcon className="size-6" />}
      </button>
    </div>
  );
}
