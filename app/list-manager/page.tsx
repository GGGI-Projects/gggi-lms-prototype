import type { Metadata } from "next";
import { OptionListsPage } from "@/components/console/option-lists-page";

export const metadata: Metadata = { title: "Tags" };

export default function TagsPage() {
  return <OptionListsPage />;
}
