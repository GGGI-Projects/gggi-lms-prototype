import type { Metadata } from "next";
import { LawsLibrary } from "@/components/console/laws-page";

export const metadata: Metadata = { title: "Laws" };

export default function LawsPage() {
  return <LawsLibrary />;
}
