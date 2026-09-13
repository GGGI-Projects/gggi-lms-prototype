import { redirect } from "next/navigation";

/**
 * `/learn` on its own has nothing to show - Dashboard is what "Learn" means
 * by default, the way clicking a section heading in a document jumps to its
 * first paragraph. This exists so the nav's top-level "Learn" row is a real,
 * bookmarkable destination rather than a dead link, without every other
 * link in the portal needing to know that "the default sub-page" is
 * `/learn/dashboard` specifically.
 */
export default function LearnIndexPage() {
  redirect("/learn/dashboard");
}
