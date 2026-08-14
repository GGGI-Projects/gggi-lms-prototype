import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";
import {
  Badge,
  EmptyState,
  PageBody,
  PageHeader,
  Panel,
  ProgressBar,
  Section,
} from "@/components/student-portal/ui";
import {
  ArrowRightIcon,
  CertificateIcon,
  CheckIcon,
} from "@/components/student-portal/icons";
import { LEARNER } from "@/content/portal";
import {
  enrolledProgress,
  formatDate,
  formatDuration,
  progressFor,
} from "@/lib/portal";
import { CERTIFICATES } from "@/content/portal";
import { BODY, META, PORTAL } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Certificates",
  description:
    "Every certificate you have earned, with the reference that lets anyone check it.",
};

/**
 * The credential shelf.
 *
 * Two sections, and the second one is the point. A certificates page that only
 * lists what you already hold is a trophy cabinet; the programmes you are part
 * way through, with what is left to do spelled out, are what makes it a page
 * worth opening twice. So "On the way" carries the same weight as "Earned" and
 * says exactly what stands between the learner and each one - so many modules,
 * so many quizzes - rather than a percentage.
 */
export default function CertificatesPage() {
  const earned = CERTIFICATES.map((certificate) => ({
    certificate,
    progress: progressFor(certificate.programmeId)!,
  })).filter((entry) => entry.progress);

  const onTheWay = enrolledProgress().filter(
    (entry) => entry.status !== "completed",
  );

  return (
    <PageBody>
      <PageHeader
        eyebrow="Certificates"
        title="Proof you can put in front of someone."
        lead="Complete every module and pass every quiz in a programme and the certificate issues straight away - carrying your name, the programme, the date, and a reference number that can be checked against the register."
      />

      <Section
        className="mt-12"
        title={earned.length ? "Earned" : "Nothing earned yet"}
        description={
          earned.length
            ? `Issued to ${LEARNER.certificateName}. Downloadable again at any time.`
            : undefined
        }
      >
        {earned.length ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {earned.map(({ certificate, progress }) => (
              <article
                key={certificate.id}
                className="group relative flex flex-col rounded-sm border border-surface-deep bg-paper-raised p-6 transition-colors duration-500 hover:border-muted-light sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-primary-950">
                    <CertificateIcon className="size-6" />
                  </span>
                  <Badge tone="done" icon={<CheckIcon className="size-3.5" />}>
                    Issued {formatDate(certificate.issuedOn)}
                  </Badge>
                </div>

                <h3 className="font-display mt-5 text-2xl leading-snug tracking-tight text-ink">
                  <Link
                    href={`/certificates/${certificate.id}`}
                    className="after:absolute after:inset-0"
                  >
                    {progress.programme.title}
                  </Link>
                </h3>

                <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <dt className={META.base}>Reference</dt>
                    <dd className="font-display mt-0.5 text-lg tracking-tight tabular-nums text-ink">
                      {certificate.reference}
                    </dd>
                  </div>
                  <div>
                    <dt className={META.base}>Average score</dt>
                    <dd className="font-display mt-0.5 text-lg text-ink">
                      {certificate.averageScore}%
                    </dd>
                  </div>
                  <div>
                    <dt className={META.base}>Material</dt>
                    <dd className="font-display mt-0.5 text-lg text-ink">
                      {formatDuration(progress.minutesTotal)}
                    </dd>
                  </div>
                </dl>

                <p
                  aria-hidden="true"
                  className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-primary"
                >
                  View and download
                  <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your first certificate is a programme away"
            body="Finish every module and quiz in any programme and it issues immediately - there is no application, no fee and no waiting period."
            action={
              <ActionButton href="/programmes" variant="solid" size="sm">
                Browse programmes
              </ActionButton>
            }
          />
        )}
      </Section>

      {onTheWay.length ? (
        <Section
          className={PORTAL.stack}
          title="On the way"
          description="What is left between you and each of these."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {onTheWay.map((progress) => {
              const modulesLeft = progress.moduleCount - progress.completedCount;
              const quizzesLeft = progress.moduleCount - progress.quizzesPassed;

              return (
                <Panel key={progress.programme.id}>
                  <h3 className="font-display text-xl leading-snug tracking-tight text-ink">
                    <Link
                      href={`/programmes/${progress.programme.id}`}
                      className="link-wipe"
                    >
                      {progress.programme.title}
                    </Link>
                  </h3>

                  <ProgressBar
                    percent={progress.percent}
                    label={`${progress.programme.title} progress`}
                    className="mt-5"
                  />

                  <p className={`mt-4 ${BODY.base}`}>
                    {modulesLeft} {modulesLeft === 1 ? "module" : "modules"} and{" "}
                    {quizzesLeft} {quizzesLeft === 1 ? "quiz" : "quizzes"} left.
                  </p>

                  {progress.nextModule ? (
                    <Link
                      href={`/programmes/${progress.programme.id}/modules/${progress.nextModule.id}`}
                      className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-primary"
                    >
                      <span className="link-wipe">Carry on with module {progress.nextModule.number}</span>
                      <ArrowRightIcon className="size-4" />
                    </Link>
                  ) : null}
                </Panel>
              );
            })}
          </div>
        </Section>
      ) : null}
    </PageBody>
  );
}
