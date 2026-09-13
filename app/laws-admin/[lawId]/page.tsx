import type { Metadata } from "next";
import { LAWS } from "@/content/laws";
import { lawById } from "@/lib/laws-tools";
import { LawDetail } from "@/components/console/laws-page";

type Params = { params: Promise<{ lawId: string }> };

export function generateStaticParams() {
  return LAWS.map((law) => ({ lawId: law.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lawId } = await params;
  const law = lawById(lawId);
  return { title: law ? law.title : "Law not found" };
}

export default async function LawPage({ params }: Params) {
  const { lawId } = await params;
  return <LawDetail lawId={lawId} />;
}
