import type { Metadata } from "next";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { AUDIT, type AuditAction } from "@/content/operations";
import { auditEntries, formatStamp, staffById } from "@/lib/admin";
import { ROLE_LABEL } from "@/content/staff";
import {
  Badge,
  Cell,
  MetricCard,
  PageBody,
  PageHeader,
  Panel,
  PrototypeNote,
  Row,
  type BadgeTone,
  type Column,
} from "@/components/console/ui";
import { Register, type RegisterItem } from "@/components/console/register";
import { Restricted } from "@/components/console/permission";

export const metadata: Metadata = { title: "Audit log" };

const COLUMNS: Column[] = [
  { key: "when", head: "When" },
  { key: "who", head: "Who" },
  { key: "what", head: "Action" },
  { key: "target", head: "Subject" },
];

/**
 * Every consequential thing anybody did.
 *
 * SUPER ADMINISTRATOR ONLY, and the reason is worth stating plainly: a log the
 * people it records can read, filter and eventually argue with is a log that
 * gets managed. The one account that cannot be created by anybody on the
 * platform is the one account that reads it.
 *
 * WHAT GOES IN: account changes, role changes, publication, moderation
 * decisions, certificate withdrawals, settings and exports - things somebody
 * may later have to answer for. What does not: reading a page. A log of every
 * screen anybody opened is surveillance of colleagues, it buries the fourteen
 * entries that matter under thousands that do not, and nobody ever reads it.
 */
export default function AuditPage() {
  return (
    <Restricted capability="readAuditLog">
      <AuditLog />
    </Restricted>
  );
}

const ACTION_TONE: Record<string, BadgeTone> = {
  account: "info",
  role: "warn",
  programme: "done",
  module: "done",
  assignment: "info",
  review: "neutral",
  certificate: "warn",
  settings: "warn",
  export: "neutral",
};

/** "account.suspended" reads as "Account · suspended" on screen. */
function label(action: AuditAction) {
  const [subject, verb] = action.split(".");
  return {
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
    verb: verb.replace(/([A-Z])/g, " $1"),
    tone: ACTION_TONE[subject] ?? "neutral",
  };
}

function AuditLog() {
  const entries = auditEntries();
  const actors = new Set(entries.map((entry) => entry.actorId));

  const items: RegisterItem[] = entries.map((entry) => {
    const actor = staffById(entry.actorId);
    const { subject, verb, tone } = label(entry.action);

    return {
      id: entry.id,
      text: [actor?.name, entry.action, entry.target, entry.detail]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      tags: [entry.action.split(".")[0], entry.actorId],
      row: (
        <Row>
          <Cell className="whitespace-nowrap tabular-nums">
            {formatStamp(entry.at)}
          </Cell>
          <Cell>
            <span className="block font-semibold text-ink">
              {actor?.name ?? entry.actorId}
            </span>
            <span className={`block ${META.base}`}>
              {actor ? ROLE_LABEL[actor.role] : "Unknown account"}
            </span>
          </Cell>
          <Cell>
            <Badge tone={tone}>
              {subject} · {verb}
            </Badge>
          </Cell>
          <Cell>
            <span className="block text-ink">{entry.target}</span>
            {entry.detail ? (
              <span className={`block ${META.base}`}>{entry.detail}</span>
            ) : null}
          </Cell>
        </Row>
      ),
    };
  });

  return (
    <PageBody>
      <PageHeader
        eyebrow="Platform"
        title="Audit log"
        lead="Everything anybody did that somebody might later have to answer for. Entries cannot be edited or deleted by anyone, including the super administrator."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Entries" value={AUDIT.length} hint="in this prototype" />
        <MetricCard label="Accounts recorded" value={actors.size} hint="staff who acted" />
        <MetricCard
          label="Retention"
          value="7 years"
          hint="set in platform settings"
        />
        <MetricCard label="Readable by" value="1 role" hint="super administrator" />
      </div>

      <div className={CONSOLE.stack}>
        <Register
          columns={COLUMNS}
          caption="Audit log entries"
          items={items}
          searchPlaceholder="Search by person, action or subject"
          filters={[
            { value: "all", label: "Everything", count: entries.length },
            {
              value: "account",
              label: "Accounts",
              count: entries.filter((entry) => entry.action.startsWith("account"))
                .length,
            },
            {
              value: "programme",
              label: "Programmes",
              count: entries.filter((entry) => entry.action.startsWith("programme"))
                .length,
            },
            {
              value: "review",
              label: "Moderation",
              count: entries.filter((entry) => entry.action.startsWith("review"))
                .length,
            },
            {
              value: "settings",
              label: "Settings",
              count: entries.filter((entry) => entry.action.startsWith("settings"))
                .length,
            },
          ]}
          emptyMessage="No entry matches that."
        />
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-2`}>
        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            What is not recorded
          </h2>
          <p className={`mt-3 ${BODY.base}`}>
            Reading a page. A log of every screen a colleague opened is
            surveillance rather than accountability - it buries the fourteen
            entries that matter under ten thousand that do not, and a log nobody
            reads protects nobody.
          </p>
          <p className={`mt-3 ${BODY.base}`}>
            What is recorded is what changed something: accounts, roles,
            publication, moderation decisions, withdrawals, settings and
            exports.
          </p>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">Export</h2>
          <p className={`mt-3 ${BODY.base}`}>
            The log can be exported for an audit or an investigation. The export
            itself appears in the log - which is the point.
          </p>
          <PrototypeNote className="mt-6">
            The export button is not wired up in this prototype.
          </PrototypeNote>
        </Panel>
      </div>
    </PageBody>
  );
}
