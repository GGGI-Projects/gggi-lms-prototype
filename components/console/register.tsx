"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import {
  EmptyRow,
  TableFoot,
  TableHead,
  type Column,
} from "@/components/console/table";
import { CARD, META } from "@/lib/theme";
import { SearchIcon } from "@/components/student-portal/icons";
import { FilterIcon } from "@/components/console/icons";

/**
 * A register you can search and narrow.
 *
 * THE ROWS ARE RENDERED ON THE SERVER and handed here as `ReactNode`s, the
 * same arrangement the portal's module filter uses. The page does the
 * joining - a learner's modules, a lecturer's lecture counts - and this
 * component only decides which of the finished rows to show. Nothing about the
 * register's data crosses into the browser bundle except the two strings each
 * row is matched against.
 *
 * The FILTER IS CLIENT-SIDE and instant, with no submit button, because the
 * question being asked is "where is this person" and any round trip makes that
 * a slower question than scrolling. On a real register this becomes a server
 * query with the same interface.
 *
 * `useMemo` is not here for speed on 27 rows. It is here so that typing a
 * letter does not rebuild the array on every keystroke of an unrelated state
 * change; on the real thing this list is the expensive part.
 */

export type RegisterItem = {
  id: string;
  /** Everything the search box should match, joined into one lowercase string. */
  text: string;
  /** Which filter chips this row belongs to. */
  tags: string[];
  row: ReactNode;
};

export type RegisterFilter = {
  value: string;
  label: string;
  /** Shown in the chip. Omit to leave the count off. */
  count?: number;
};

export type RegisterSelectFilter = {
  /** Screen-reader label only - the control has no visible caption, the same
   *  way the material shelf's group and kind selects don't. */
  label: string;
  /** The default option's text, shown at the "match everything" value. */
  placeholder: string;
  options: { value: string; label: string }[];
};

export function Register({
  columns,
  caption,
  items,
  filters,
  selectFilter,
  action,
  searchPlaceholder = "Search",
  total,
  footNote,
  emptyMessage = "Nothing matches that.",
}: {
  columns: Column[];
  caption: string;
  items: RegisterItem[];
  /** The first entry is the default. Give it a value no row carries and it
   *  matches everything - conventionally "all". */
  filters?: RegisterFilter[];
  /** A SECOND, independent narrowing - module alongside status, say - matched
   *  against the same `tags` a row already carries. Rendered as a `<select>`
   *  rather than chips: `filters` assumes a handful of short labels, and a
   *  module list is neither short nor few enough to read as a row of pills. */
  selectFilter?: RegisterSelectFilter;
  /** The thing that adds to this register - "New lecturer" and its like.
   *  Pinned to the right end of the search row, where the table starts. */
  action?: ReactNode;
  searchPlaceholder?: string;
  /** The size of the whole register, when this is showing part of it. */
  total?: number;
  footNote?: string;
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState(filters?.[0]?.value ?? "all");
  const [selectTag, setSelectTag] = useState("all");

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTag = tag === "all" || item.tags.includes(tag);
      const matchesSelectTag =
        selectTag === "all" || item.tags.includes(selectTag);
      const matchesQuery = !needle || item.text.includes(needle);
      return matchesTag && matchesSelectTag && matchesQuery;
    });
  }, [items, query, tag, selectTag]);

  return (
    <div>
      {/* ONE flex-wrap row for the whole toolbar, not the nested groups this
          used to be (a search+select+pills group, itself inside a row split
          against the action button). Nesting meant the pills only ever had
          the LEFTOVER width after everything else in their row claimed
          space to wrap inside - which is how five short buttons ended up
          squeezed into a narrow stacked column next to "New lecturer"
          rather than spreading across a line of their own. Flat, every
          piece - search, select, the pill group, the action - is a sibling
          that either fits on the current line or drops to a fresh one at
          the container's FULL width, the way flex-wrap is supposed to work. */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">{searchPlaceholder}</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-light" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="field py-2.5 pl-12"
          />
        </label>

        {/* Right beside the search box, not after the status pills - this is
            the other half of "find this row", and putting it at the far end
            of the row read as an afterthought rather than a second way in.
            Same `w-full sm:max-w-sm` shape as the search box, on purpose: two
            controls doing the same job should size the same way, not one
            fixed to its own text and the other filling the line. */}
        {selectFilter ? (
          <label className="block w-full sm:max-w-sm">
            <span className="sr-only">{selectFilter.label}</span>
            <select
              value={selectTag}
              onChange={(event) => setSelectTag(event.target.value)}
              className="field py-2.5"
            >
              <option value="all">{selectFilter.placeholder}</option>
              {selectFilter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {filters?.length ? (
          <div
            role="group"
            aria-label="Filter the register"
            className="flex flex-wrap items-center gap-2"
          >
            <FilterIcon className="size-4 shrink-0 text-muted-light" />
            {filters.map((filter) => {
              const active = filter.value === tag;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setTag(filter.value)}
                  aria-pressed={active}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-300 ${
                    active
                      ? "border-primary bg-primary text-paper"
                      : "border-surface-deep bg-paper text-ink-soft hover:border-muted-light hover:text-ink"
                  }`}
                >
                  {filter.label}
                  {filter.count !== undefined ? (
                    <span className={active ? "opacity-70" : "text-muted"}>
                      {" "}
                      {filter.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}

        {action ? <div className="shrink-0 sm:ml-auto">{action}</div> : null}
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <caption className="sr-only">{caption}</caption>
            <TableHead columns={columns} />
            <tbody className="divide-y divide-surface-deep">
              {/* A `<Fragment>` with a key, because a `<div>` cannot sit
                  inside `<tbody>` and shorthand fragments take no key. */}
              {shown.length ? (
                shown.map((item) => <Fragment key={item.id}>{item.row}</Fragment>)
              ) : (
                <EmptyRow columns={columns.length}>{emptyMessage}</EmptyRow>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total !== undefined ? (
        <TableFoot showing={shown.length} total={total} note={footNote} />
      ) : (
        <p className={`mt-4 ${META.base}`}>
          {shown.length} of {items.length} shown
        </p>
      )}
    </div>
  );
}
