import type { Metadata } from "next";
import { TOOLS } from "@/content/tools";
import { toolById } from "@/lib/laws-tools";
import { ToolDetail } from "@/components/console/tools-page";

type Params = { params: Promise<{ toolId: string }> };

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ toolId: tool.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { toolId } = await params;
  const tool = toolById(toolId);
  return { title: tool ? tool.title : "Tool not found" };
}

export default async function ToolPage({ params }: Params) {
  const { toolId } = await params;
  return <ToolDetail toolId={toolId} />;
}
