import type { Metadata } from "next";
import { MATERIALS } from "@/content/materials";
import { materialById } from "@/lib/materials";
import { MaterialDetail } from "@/components/console/materials-page";

type Params = { params: Promise<{ materialId: string }> };

export function generateStaticParams() {
  return MATERIALS.map((asset) => ({ materialId: asset.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { materialId } = await params;
  const asset = materialById(materialId);
  return { title: asset ? asset.title : "Material not found" };
}

export default async function MaterialPage({ params }: Params) {
  const { materialId } = await params;
  return <MaterialDetail area="instructor" materialId={materialId} />;
}
