import type { Metadata } from "next";
import { ToolsDirectory } from "@/components/console/tools-page";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  return <ToolsDirectory />;
}
