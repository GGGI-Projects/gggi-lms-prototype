import type { Metadata } from "next";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { ROLE_LABEL, ROLE_SUMMARY, type StaffRole } from "@/content/staff";
import { admins, auditEntries, formatStamp, staffName } from "@/lib/admin";
import { formatDate, formatDateLong } from "@/lib/portal";
import {
  Badge,
  Cell,
  MetricCard,
  NameCell,
  PageBody,
  PageHeader,
  Panel,
  PrototypeNote,
  Row,
  TableFrame,
  type Column,
} from "@/components/console/ui";
import { ConfirmAction } from "@/components/console/actions";
import { NewAdministratorAction } from "@/components/console/new-administrator-action";
import { Restricted } from "@/components/console/permission";
import {
  STAFF_STATUS_LABEL,
  STAFF_STATUS_TONE,
} from "@/components/console/status";
import { ShieldIcon } from "@/components/console/icons";

export const metadata: Metadata = { title: "Administrators" };

const COLUMNS: Column[] = [
  { key: "name", head: "Account" },
  { key: "role", head: "Role" },
  { key: "title", head: "Responsibility", hideBelow: "lg" },
  { key: "created", head: "Appointed", hideBelow: "md" },
  { key: "active", head: "Last active", numeric: true, hideBelow: "sm" },
  { key: "status", head: "Status" },
  { key: "actions", head: "" },
];

/**
 * Administrator accounts.
 *
 * THE ONE SCREEN ONLY THE SUPER ADMINISTRATOR CAN OPEN, and the reason is the
 * single rule the whole role model rests on: an account that can appoint other
 * administrators can appoint itself a replacement, and from there nothing on
 * the platform has an owner. Keeping appointment in one pair of hands is what
 * makes every other permission mean something.
 *
 * Each row shows WHO APPOINTED IT. That is not decoration - it is the only
 * question worth asking about an administrator account nobody recognises.
 */
export default function TeamPage() {
  return (
    <Restricted capability="manageAdmins">
      <Team />
    </Restricted>
  );
}

function Team() {
  const team = admins();
  const accountTrail = auditEntries().filter((entry) =>
    entry.action.startsWith("account") || entry.action.startsWith("role"),
  );

  return (
    <PageBody>
      <PageHeader
        eyebrow="People"
        title="Administrators"
        lead="Who runs the platform, and who let them in. Only the super administrator can add, suspend or remove an account on this page."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Accounts" value={team.length} hint="with console access" />
        <MetricCard
          label="Administrators"
          value={team.filter((member) => member.role === "admin").length}
          hint="day-to-day operations"
        />
        <MetricCard
          label="Awaiting acceptance"
          value={team.filter((member) => member.status === "invited").length}
          hint="invitations sent"
        />
        <MetricCard label="Super administrators" value={1} hint="and only ever one" />
      </div>

      <div className={CONSOLE.stack}>
        {/* The button that ADDS to this register sits at its top-right edge
            rather than in a panel somebody has to scroll past every row to
            reach - see the note on `<NewAdministratorAction>`. */}
        <div className="mb-4 flex justify-end">
          <NewAdministratorAction />
        </div>

        <TableFrame columns={COLUMNS} caption="Administrator accounts">
          {team.map((member) => (
            <Row key={member.id}>
              <NameCell
                href="/admin/team"
                initials={member.initials}
                avatarUrl={member.avatarUrl}
                title={member.name}
                subtitle={member.email}
              />
              <Cell>
                <Badge tone={member.role === "super-admin" ? "active" : "info"}>
                  {ROLE_LABEL[member.role]}
                </Badge>
              </Cell>
              <Cell hideBelow="lg">{member.title}</Cell>
              <Cell hideBelow="md">
                <span className="block">{formatDate(member.createdOn)}</span>
                <span className={`block ${META.base}`}>
                  {member.createdBy
                    ? `by ${staffName(member.createdBy)}`
                    : "founding account"}
                </span>
              </Cell>
              <Cell numeric hideBelow="sm">
                {member.lastActive ? formatDate(member.lastActive) : "Never"}
              </Cell>
              <Cell>
                <Badge tone={STAFF_STATUS_TONE[member.status]}>
                  {STAFF_STATUS_LABEL[member.status]}
                </Badge>
              </Cell>
              <Cell>
                {member.role === "super-admin" ? (
                  <span className={`inline-flex items-center gap-1.5 ${META.base}`}>
                    <ShieldIcon className="size-4" />
                    Protected
                  </span>
                ) : (
                  <ConfirmAction
                    size="table"
                    label={member.status === "invited" ? "Cancel" : "Suspend"}
                    question={
                      member.status === "invited"
                        ? `Cancel ${member.name}'s invitation?`
                        : `Suspend ${member.name}?`
                    }
                    detail={
                      member.status === "invited"
                        ? "The link they were sent stops working. They can be invited again later."
                        : "They lose console access immediately. Everything they did stays in the audit log under their name."
                    }
                    confirmLabel={
                      member.status === "invited"
                        ? "Cancel the invitation"
                        : "Suspend the account"
                    }
                    done="Prototype - the account is unchanged."
                  />
                )}
              </Cell>
            </Row>
          ))}
        </TableFrame>
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            What each role can do
          </h2>
          <ul className="mt-5 space-y-5">
            {(["super-admin", "admin", "lecturer"] as StaffRole[]).map((role) => (
              <li key={role}>
                <p className="text-lg font-semibold text-ink">
                  {ROLE_LABEL[role]}
                </p>
                <p className={`mt-1 ${BODY.base}`}>{ROLE_SUMMARY[role]}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Account changes
          </h2>
          <ul className="mt-5 space-y-4">
            {accountTrail.slice(0, 5).map((entry) => (
              <li key={entry.id} className="border-l-2 border-surface-deep pl-4">
                <p className="text-lg leading-snug text-ink">{entry.target}</p>
                <p className={`mt-1 ${META.base}`}>
                  {staffName(entry.actorId)} · {formatStamp(entry.at)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            The founding account
          </h2>
          <p className={`mt-3 ${BODY.base}`}>
            The super administrator was created when the platform was set up on{" "}
            {formatDateLong(team[0].createdOn)} and cannot be created, suspended
            or removed from inside the console. Transferring it is a deliberate,
            separate act - not a dropdown on this page.
          </p>
        </Panel>
      </div>

      <PrototypeNote className="mt-6" />
    </PageBody>
  );
}
