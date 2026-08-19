import type { Metadata } from "next";
import { MATERIAL_GROUPS } from "@/content/materials";
import { groupById } from "@/lib/materials";
import { MaterialGroupPage } from "@/components/console/materials-page";

type Params = { params: Promise<{ groupId: string }> };

export function generateStaticParams() {
  return MATERIAL_GROUPS.map((group) => ({ groupId: group.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { groupId } = await params;
  const group = groupById(groupId);
  return { title: group ? group.name : "Group not found" };
}

export default async function GroupPage({ params }: Params) {
  const { groupId } = await params;
  return <MaterialGroupPage area="lecturer" groupId={groupId} />;
}
