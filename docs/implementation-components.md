# Real Application — Major Implementation Components

This is a workload-splitting reference for the two of us, not a spec. It lists the **major functional pieces** the real (backend + database + working frontend) build breaks into, mapped from the current prototype and `docs/SRS.md`. It is deliberately flat and coarse — no sub-task breakdown — because the exact scope of several roles is still likely to shift as the client confirms open questions (see SRS Appendix D). Use it to divide ownership by component, not to estimate hours.

**Size** is relative to the other items in this list only (S / M / L / XL), not a time estimate. **Depends on** flags what should exist first, since the two Foundational items block almost everything else.

---

## A. Foundational Components
_Needed before most role-specific work can be real (not mocked). Whoever starts here effectively unblocks the other developer — worth splitting or pairing on early._

| # | Component | What it covers | Size |
|---|---|---|---|
| 1 | **Database design & data layer** | Schema + ORM/migrations for every record type in SRS §8 (Learner, Module, Lecture, Quiz/Question, FillInTheBlankQuestion, Enrolment, QuizAttempt/BlankAttempt, Certificate, Material assets/groups, StaffMember, Law, Tool, DynamicOptionList/OptionValue, RegistrationApplication, LecturerProfile + its sub-entries, Review, Announcement/MessageThread, AuditEntry, PlatformSettings) and the relationships between them. | XL |
| 2 | **Authentication & authorization** | Learner sign-in and staff sign-in (with 2-step verification), password rules (8/12 char minimums), session expiry (8h idle), and the full role/permission model for all seven roles (super-admin, module-admin, laws-admin, tools-admin, list-manager, provincial-registrar, lecturer) enforced server-side — the prototype's on-screen checks are illustrative only and must be rebuilt as real checks. | L |
| 3 | **File & media storage** | Real upload/storage/delivery for Materials Library assets, video hosting/streaming for lectures, and Law document files — all currently non-functional placeholders in the prototype. | M |
| 4 | **Email / notification delivery** | Transactional email service: password resets, staff invitations, registration decision emails (approved/rejected), certificate-given notices, and any in-app notification delivery. | M |
| 5 | **Audit log** | Append-only action log (who/what/when) that is genuinely immutable at the database level, not just hidden in the UI; 7-year retention. | S |
| 6 | **Platform settings & configuration** | The single-record platform settings store (brand fields, registration toggle, chatbot knowledge-base paragraph, etc.) read across every console. | S |

---

## B. Role-Specific Portals & Consoles
_Each maps to one signed-in experience. These can mostly be split developer-by-developer once Section A exists._

| # | Component | What it covers | Size |
|---|---|---|---|
| 7 | **Public website & registration/application flow** | Marketing pages, and the province-based registration application → provincial approval → status/resubmit flow that replaced open self-signup (SRS §4.1–§4.2). Landing-page redesign itself is client-deferred. | M |
| 8 | **Learner portal — core learning experience** | Dashboard, module catalogue/enrolment, lecture consumption, Quiz engine, Fill-in-the-blank engine, certificates (view + real PDF/design), profile & settings, module/lecturer reviews (SRS §4.3–§4.9, §4.5a). | XL |
| 9 | **Learner portal — Laws, Tools & Assistant** | The Laws tab and Tools tab (browse, province ordering), and the learner assistant/chatbot — worth calling out separately from #8 because a real build likely means a real LLM reading live catalogue data instead of the prototype's keyword search (SRS §4.26–§4.28). | M |
| 10 | **Lecturer console** | Lecturer dashboard, module/lecture management, lecture + quiz + fill-in-blank authoring (incl. a real rich-text/video tool, not the decorative toolbar), linking related Laws/Tools to a lecture, lecturer profile/credentials, learner progress visibility (SRS §4.9–§4.14, §4.10a). | L |
| 11 | **Super Administrator console** | Platform dashboard/analytics, module creation, lecturer account suspension, cross-province learner oversight, certificate oversight, console account management, audit log viewer, platform settings screen (SRS §4.15–§4.23). | L |
| 12 | **Module Administrator console** | Own-module editing/tagging/publishing, own-module lecturer assignment, reviews and certificates scoped to that module (SRS §4.29). | M |
| 13 | **Laws Administrator console** | Global Law entity management — create/edit/tag/publish/archive (SRS §4.30). | S |
| 14 | **Tools Administrator console** | Global Tool entity management, same shape as Laws (SRS §4.31). | S |
| 15 | **List Manager console** | Dynamic option lists (Hazards, Categories, and future lists) used to tag Modules/Laws/Tools (SRS §4.32). | S |
| 16 | **Provincial Registrar console** | Per-province application approval queue, scoped learner oversight (SRS §4.33). | M |

---

## C. Cross-Cutting Systems
_Each is used by more than one role above — worth assigning as its own unit rather than splitting mid-feature._

| # | Component | What it covers | Size |
|---|---|---|---|
| 17 | **Communications** | Announcements (one-way, audience-targeted) and Messages (two-way, fixed valid pairs) between admin/lecturer/student, plus the notification bell/feed (SRS §4.25). | M |
| 18 | **Certificates & public verification** | Certificate generation/reference numbering, withdrawal, and the no-login public lookup page (SRS §4.7, §4.19, §9.2). | M |
| 19 | **Materials Library** | Shared asset/group system used by lecturers and admins to attach files to lectures (SRS §4.12). | S |
| 20 | **Reviews & moderation** | Module and lecturer reviews, and the shared moderation queue used by Super Admin / Module Admin (SRS §4.20). | S |
| 21 | **Tagging / relatedness engine** | The "found by shared tags, never manually linked" logic that relates Modules ↔ Laws ↔ Tools, and lets a lecturer curate a subset onto one lecture (SRS BR-26, §4.10a). | M |

---

## D. Non-Functional / Platform-Wide
_Not owned by one page — cuts across everything above and needs conscious attention throughout, not a single sprint at the end._

| # | Component | What it covers | Size |
|---|---|---|---|
| 22 | **Security & compliance hardening** | Server-side enforcement of every permission check, data retention rules (learner records, 7-year audit log), data minimisation. | M |
| 23 | **Performance & accessibility** | Device/connection-tolerant performance, reduced-motion support, screen-reader-correct interactive states, SSR content that never depends on JS to become visible. | S |
| 24 | **Deployment, infra & DevOps** | Hosting, environment config, CI/CD, backups/monitoring — not covered by the SRS itself but required to actually run the above in production. | M |

---

## Suggested way to split between two developers

A workable first cut, keeping each person's slice roughly balanced and self-contained:

- **Developer 1:** Foundational (#1–2) to start, then Learner Portal (#8–9), Public site/registration (#7), Materials Library (#19), Certificates (#18).
- **Developer 2:** Foundational (#3–6) to start, then Lecturer Console (#10), Super Admin + the four scoped consoles (#11–16), Communications (#17), Reviews (#20), Tagging engine (#21).
- **Together / whoever finishes first:** Non-functional items (#22–24), since they touch both halves.

This is only a suggestion — swap items freely as long as #1 and #2 land first for whoever needs them soonest.
