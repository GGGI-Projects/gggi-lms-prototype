import type { Metadata } from "next";
import { MaterialsLibrary } from "@/components/console/materials-page";

export const metadata: Metadata = { title: "Materials" };

/**
 * The shared library, from the admin console.
 *
 * The screen is `<MaterialsLibrary>` - one component for both consoles,
 * because it is one shelf. See the note in `components/console/materials-page.tsx`.
 */
export default function MaterialsPage() {
  return <MaterialsLibrary area="admin" />;
}
