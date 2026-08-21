import type { ReactNode } from "react";
import { PortalShell } from "@/components/student-portal/portal-shell";
import { LEARNER, ENROLMENTS } from "@/content/portal";
import { feedForStudent, summariseFeed } from "@/lib/comms";
import { PLATFORM_SETTINGS } from "@/content/operations";

/**
 * The signed-in area.
 *
 * A route GROUP - `(portal)` is in brackets, so it adds no segment to any URL
 * and the routes underneath stay at `/dashboard`, `/modules` and so on. All
 * it does is give those ten screens one layout, which is the whole point: the
 * rail, the header and the page measure are decided once here rather than
 * imported by each page and drifting apart.
 *
 * There is no auth check because there is no auth - this is a front-end
 * prototype and every route is reachable directly, which is what lets the
 * client be shown any screen without walking through a login first.
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  const enrolledModuleIds = ENROLMENTS.map((enrolment) => enrolment.moduleId);
  const notifications = summariseFeed(
    feedForStudent(LEARNER.id, enrolledModuleIds),
    LEARNER.id,
  );

  return (
    <PortalShell
      notifications={notifications}
      chatbotKnowledgeBase={PLATFORM_SETTINGS.chatbot.knowledgeBase}
    >
      {children}
    </PortalShell>
  );
}
