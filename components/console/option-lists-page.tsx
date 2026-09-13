/**
 * The List Manager's own screen: every dynamic option list, and the values
 * inside each of them.
 *
 * ONE PAGE, NOT A LIST-THEN-DETAIL PAIR, unlike Laws and Tools - there are
 * two lists today with a handful of values each, and a click-through to a
 * whole second screen to see six checkboxes would be a detour, not a step.
 * If this ever grows past a glance, the shape to reach for is the Materials
 * Library's groups-then-shelf split, not invented fresh here.
 */

import { CONSOLE, META } from "@/lib/theme";
import { optionLists, valueUsageTotal } from "@/lib/option-lists";
import {
  Badge,
  MetricCard,
  PageBody,
  PageHeader,
  PrototypeNote,
  Section,
} from "@/components/console/ui";
import {
  AddListAction,
  AddValueAction,
  EditValueAction,
  RetireValueAction,
} from "@/components/console/option-list-actions";

export function OptionListsPage() {
  const lists = optionLists();
  const valuesWithList = lists.flatMap((list) =>
    list.values.map((value) => ({ list, value })),
  );
  const retired = valuesWithList.filter(({ value }) => !value.active);
  const unused = valuesWithList.filter(
    ({ list, value }) => valueUsageTotal(list.id, value.id) === 0,
  );

  return (
    <PageBody>
      <PageHeader
        eyebrow="Learning"
        title="Tags"
        lead="The dynamic option lists that tie Modules, Laws and Tools together (see BR-26). Hazards and Categories are the two the client has confirmed for now, kept illustrative on purpose - more can be opened here later."
        actions={<AddListAction />}
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Lists" value={lists.length} hint="Hazards, Categories, and any added later" />
        <MetricCard label="Tags" value={valuesWithList.length} hint="across every list" />
        <MetricCard label="Retired" value={retired.length} hint="hidden from new tagging" />
        <MetricCard
          label="Not used yet"
          value={unused.length}
          hint="no module, law or tool carries it"
          goodWhen="down"
        />
      </div>

      {lists.map((list) => (
        <Section
          key={list.id}
          title={list.name}
          description={
            list.id === "hazards"
              ? "What a Module, Law or Tool is exposed to or addresses."
              : list.id === "categories"
                ? "What subject area a Module, Law or Tool sits under."
                : "No description yet."
          }
          action={<AddValueAction list={list} />}
          className={CONSOLE.stack}
        >
          {list.values.length ? (
            <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
              {list.values.map((value) => {
                const usage = valueUsageTotal(list.id, value.id);
                return (
                  <li
                    key={value.id}
                    className="flex flex-wrap items-center gap-4 px-5 py-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold text-ink">
                        {value.label}
                      </p>
                      <p className={`mt-0.5 ${META.base}`}>
                        {usage
                          ? `Used by ${usage} ${usage === 1 ? "record" : "records"}`
                          : "Not used yet"}
                      </p>
                    </div>
                    <Badge tone={value.active ? "done" : "neutral"}>
                      {value.active ? "Active" : "Retired"}
                    </Badge>
                    <div className="flex shrink-0 items-center gap-4">
                      <EditValueAction list={list} value={value} />
                      <RetireValueAction value={value} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={`rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-10 text-center ${META.base}`}>
              This list is empty.
            </p>
          )}
        </Section>
      ))}

      <PrototypeNote className="mt-6">
        Reordering a list is not built in this prototype - values keep the
        order they were added in. Retiring one hides it from every new
        tagging picker without stripping it from anything already tagged
        with it.
      </PrototypeNote>
    </PageBody>
  );
}
