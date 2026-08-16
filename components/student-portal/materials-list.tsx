import type { Material, MaterialKind } from "@/content/curriculum";
import {
  DatasetIcon,
  DownloadIcon,
  LinkIcon,
  PdfIcon,
  SheetIcon,
  SlidesIcon,
} from "@/components/student-portal/icons";
import { META } from "@/lib/theme";

/**
 * The files attached to a lecture.
 *
 * The third of the three content shapes, and the one most easily got wrong: a
 * bare list of filenames tells a learner nothing about whether the thing is
 * worth opening. Each row carries what it IS - slides, a worksheet, a data
 * extract - beside its size, because "1.6 MB PDF" and "an editable worksheet"
 * are answers to different questions and a learner on a metered connection is
 * asking both.
 *
 * A `link` row is deliberately not a download. It has no size, and its control
 * says "Open" rather than carrying the download arrow, so nothing here
 * promises a file that is really a web page.
 */

const KIND: Record<MaterialKind, { label: string; icon: typeof PdfIcon }> = {
  pdf: { label: "PDF", icon: PdfIcon },
  slides: { label: "Slides", icon: SlidesIcon },
  sheet: { label: "Worksheet", icon: SheetIcon },
  dataset: { label: "Data", icon: DatasetIcon },
  link: { label: "External link", icon: LinkIcon },
};

export function MaterialsList({ items }: { items: Material[] }) {
  return (
    <div>
      <ul className="overflow-hidden rounded-sm border border-surface-deep bg-paper-raised divide-y divide-surface-deep">
        {items.map((item) => {
          const kind = KIND[item.kind];
          const Icon = kind.icon;
          const isLink = item.kind === "link";

          return (
            <li
              key={item.title}
              className="flex items-center gap-4 px-5 py-4 sm:px-6"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-surface text-primary">
                <Icon className="size-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">
                  {item.title}
                </span>
                <span className={`mt-0.5 block ${META.base}`}>
                  {kind.label}
                  {item.size ? ` · ${item.size}` : ""}
                </span>
              </span>

              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-surface-deep px-4 py-2 font-semibold text-primary transition-colors duration-300 hover:border-primary hover:bg-tint-mist"
              >
                {isLink ? null : <DownloadIcon className="size-4" />}
                {isLink ? "Open" : "Download"}
                <span className="sr-only"> {item.title}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className={`mt-3 ${META.base}`}>
        Design prototype - the attachments are placeholders and nothing
        downloads yet.
      </p>
    </div>
  );
}
