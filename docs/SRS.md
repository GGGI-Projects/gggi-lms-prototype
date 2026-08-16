# Software Requirements Specification

## Free Public Green-Growth Learning Platform

**Working title used throughout this document:** *GreenPath Academy* — a placeholder brand name. The final product name is pending the client's decision; every reference to it in the codebase resolves from a single file (`lib/brand.ts`), so renaming the platform is a one-file change, not a rewrite. **The platform is deliberately unbranded with respect to its commissioning organisation** — no sponsor name, logo, or sponsor colour scheme may appear anywhere in the product. It is designed, and must always read, as a standalone product.

| | |
|---|---|
| **Document status** | Draft for client review |
| **Prepared from** | A working, front-end prototype (Next.js, TypeScript) built to demonstrate the design, navigation and functional behaviour of the platform ahead of a production build |
| **Prepared on** | 16 August 2026 |
| **Document owner** | Product / Engineering |
| **Audience** | Client stakeholders, product owner, engineering team, QA |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 0.1 | 2026-08-16 | Initial draft, derived from a full audit of the interactive prototype | Engineering |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [User Classes and Characteristics](#3-user-classes-and-characteristics)
4. [System Features — Functional Requirements](#4-system-features--functional-requirements)
5. [The Curriculum — Content Model](#5-the-curriculum--content-model)
6. [Business Rules](#6-business-rules-consolidated)
7. [Roles and Permissions Matrix](#7-roles-and-permissions-matrix)
8. [Data Requirements](#8-data-requirements)
9. [External Interface Requirements](#9-external-interface-requirements)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Out of Prototype Scope / Roadmap](#11-out-of-prototype-scope--roadmap)
12. [Appendix A — Note on Illustrative Sample Content](#appendix-a--note-on-illustrative-sample-content)
13. [Appendix B — Screen Inventory](#appendix-b--screen-inventory)
14. [Appendix C — Glossary](#appendix-c--glossary)
15. [Appendix D — Open Questions for the Client](#appendix-d--open-questions-for-the-client)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for a free, open public learning platform. It is derived from a comprehensive audit of an interactive, front-end-only prototype that has already been built and demonstrated to establish the product's design language, navigation model and user flows. Every requirement below is either:

- a behaviour the prototype already demonstrates end-to-end (with mock data standing in for a real backend), or
- a behaviour the prototype explicitly discloses as intended but not yet implemented — the prototype shows a banner such as *"This is a design prototype — nothing was saved"* at exactly the points where a real backend, a real email service, or real authentication will need to take over.

Where the prototype's own disclosure text describes the intended real behaviour, that description is captured here as a requirement, not as a caveat.

### 1.2 Scope

The product is a **free-to-use, self-paced online learning platform** delivering short, video- and text-based programmes on green-growth subjects, open to anyone, each closing in a short multiple-choice quiz per module and a verifiable certificate on completion of a whole programme. The specific subject areas, the number of programmes, and the depth of each programme's curriculum are content decisions the client will define separately; this specification describes the platform's *capability* to manage any number of programmes and modules, not a fixed set of them (see the note in §2.4 and the caveat at the head of §4).

The product has **four faces**, all specified in this document:

1. A **public marketing website** — persuades a visitor to sign up.
2. A **learner (student) portal** — where an enrolled learner studies, takes quizzes, and collects certificates.
3. An **instructor console** — where a subject-matter expert writes and maintains the curriculum for the programme(s) they are assigned to.
4. An **administration console**, with two privilege tiers (*Administrator* and *Super Administrator*) — where the platform's people, programmes, moderation, certificates and settings are run.

The platform carries no payment functionality, no advertising, and no revenue model of any kind — this is a constraint carried through every requirement below, not an omission.

### 1.3 Definitions, Acronyms and Abbreviations

| Term | Meaning |
|---|---|
| **Programme** | One of the platform's top-level courses. Self-contained; a learner needs no other programme to complete it. The number of programmes, their subjects, and their curriculum are content decisions for the client, not fixed by this specification. |
| **Module** | One lesson within a programme. Carries a short lecture and/or written material, downloadable materials, and closes with a quiz. |
| **Content block** | One unit of a module's body: a *video* block, a *text* block, or a *materials* block. A module is an ordered list of these. |
| **Quiz** | The four-question, multiple-choice assessment that closes a module. |
| **Certificate** | The credential automatically issued once a learner has completed every module and passed every quiz in a programme. |
| **Learner** | Anyone using the student portal to enrol and study. Not a "staff" role. |
| **Staff** | Collective term for the three console roles: Super Administrator, Administrator, Instructor. |
| **Console** | Either staff-facing application (Instructor console or Admin console), as distinct from the learner portal. |
| **Capability** | One named, gate-able permission (e.g. `manageProgrammes`, `readAuditLog`) checked against a staff member's role. |
| **The Platform** | This product as a whole, across all four faces. |
| **MoSCoW priority** | **M**ust have / **S**hould have / **C**ould have — used against every requirement below to signal build priority. |

### 1.4 References

- The working prototype codebase (Next.js 15 / React / TypeScript), audited in full to produce this document.
- `docs/seasonal-hero.md` and `docs/performance-backlog.md` — existing internal engineering notes on two subsystems (the animated hero and animation-performance tiering) referenced in §10.
- `lib/brand.ts`, `lib/permissions.ts` — the two single-source-of-truth files for brand identity and the role/capability model respectively.

### 1.5 Document Overview

Section 2 describes the product at a high level. Section 3 profiles its user classes. Section 4 is the bulk of the document: every functional requirement, organised by feature area and screen, each carrying a stable requirement ID and a MoSCoW priority. Section 5 documents the *shape* of curriculum content the platform must support, without specifying what that content actually is. Section 6 consolidates the business rules that recur across many screens into one authoritative list. Section 7 gives the full permission matrix. Sections 8–10 cover data, interfaces and non-functional requirements. Section 11 lists everything the prototype deliberately does **not** yet cover, so it is understood as future scope rather than an oversight. The appendices carry a caveat on the prototype's sample data, a full screen/route inventory, a glossary, and a list of decisions still open for the client.

---

## 2. Overall Description

### 2.1 Product Perspective

This is a new, standalone product — it has no predecessor system and integrates with no existing institutional system at launch. It is built as a modern web application, deployed as a single responsive site that serves all four faces (marketing, learner portal, instructor console, admin console) from one codebase, gated by authentication and role rather than by separate applications.

The current prototype is **front-end only**: every page, form, table and chart is fully built and interactive, but all data is static mock data bundled with the application, and every action that would normally write to a server (signing up, saving a profile, publishing a module, moderating a review, revoking a certificate, changing a setting…) is simulated — the UI completes the interaction and visibly discloses that nothing was actually persisted. Turning this into the production system means building the backend, authentication, storage, and email/notification services described throughout this document behind an interface that, in most cases, does not need to change.

### 2.2 Product Functions (Summary)

At a high level, the platform must:

- Present the programme catalogue and the platform's value proposition to an anonymous visitor, and convert them into a signed-up learner.
- Let a learner create a free account, verify their email, sign in, enrol in any number of programmes, work through modules at their own pace, take unlimited-attempt quizzes, and receive an automatically-issued, permanently valid, verifiable certificate on completion of each programme.
- Let an **instructor** author and maintain the modules and quizzes of the programme(s) they are assigned to, draw on a platform-wide shared library of materials, and see how learners are progressing through their own material — without visibility into anything outside their assignment.
- Let an **administrator** run the platform day to day: create and publish programmes, appoint and assign instructors, manage the learner register, moderate submitted reviews, and manage (specifically, withdraw) certificates.
- Let the **super administrator** — exactly one such account exists — additionally appoint or remove other administrator accounts, read an immutable audit log of every consequential action taken on the platform, and set the platform-wide rules (pass mark, moderation policy, retention, etc.) that every other role can see but not change.

### 2.3 Operating Environment

A responsive web application, used through desktop, laptop and mobile browsers, on a wide range of device capability and connection quality — including older machines and slower connections, which is treated as a first-class design constraint rather than an edge case (see §10.1). No native mobile application is in scope.

### 2.4 Design and Implementation Constraints

- **No sponsor branding.** Nothing in the shipped product — copy, imagery, colour palette, or metadata — may identify the commissioning organisation. The brand identity (name, tagline, contact address) is a placeholder resolved from one configuration file, precisely so it can be swapped for the client's chosen brand without a rewrite.
- **Free, permanently.** No requirement in this document, and no future requirement, should introduce billing, a paid tier, or any gating of content behind payment. This is a stated product principle, not merely the current price point.
- **English at launch; Sinhala and Tamil are a committed roadmap item**, and the architecture (content model, settings, footer/legal copy) is built so all three languages can run side by side once translated content exists (see §11).
- **A single visual design system** (a light, editorial layout with a teal/amber colour system, one shared typeface family for headings and body text, and a deliberately calibrated level of motion) has already been approved by the client through the prototype and should be carried into production largely as built, rather than re-designed.
- **All content records in the prototype are illustrative placeholder data, not requirements.** Programme titles and subjects, module counts and durations, quiz questions, and every learner/instructor/administrator record shown are sample data used to demonstrate how the platform behaves — not a specification of what the real catalogue, curriculum, or user base must contain. Wherever this document needs to describe such a screen, it describes the *mechanism* (e.g. "a programme has a title, a level, and a set of modules") rather than the prototype's specific sample values. See the note at the head of §4.

### 2.5 Assumptions and Dependencies

- A production build assumes a conventional web backend (API + database + authentication + object storage + transactional email) will be built behind the existing front end; this document specifies the *behaviour* that backend must support, not its technology.
- Real video hosting/streaming, real file storage for downloadable materials, and a real OAuth integration with Google are assumed but are not yet built (see §11).
- The learner-facing certificate is assumed to require no physical/wet-ink signature — a verifiable digital reference is the entire mechanism of trust (§4.8, §6).

---

## 3. User Classes and Characteristics

| User class | Who they are | Primary goal | Key constraint |
|---|---|---|---|
| **Visitor** | Anyone reaching the public site, not yet signed up. | Understand what the platform offers and decide whether to enrol. | No account, no access beyond the marketing site. |
| **Learner** | Any member of the public. No prior qualification assumed; may be on a low-powered device or a slow connection. | Learn a subject at their own pace and walk away with evidence of having done so. | Self-registers; no approval step, no sponsorship, no fee, ever. |
| **Instructor** | A subject-matter expert appointed by an administrator to author material. | Write, revise and maintain the modules and quizzes of the programme(s) they are assigned to; understand how their own material is performing. | Can never see learners, materials, or programmes outside their own assignment; cannot appoint themselves to a programme. |
| **Administrator** | Runs day-to-day platform operations. Appointed, not self-served. | Publish programmes, appoint instructors, manage the learner register, moderate reviews, manage certificates. | Cannot appoint another administrator and cannot read the audit log — those two capabilities belong to the super administrator alone. |
| **Super Administrator** | Owns the platform. Exactly one account exists. | Everything an administrator can do, plus appoint/remove administrators, read the audit log, and set platform-wide rules. | This account is the platform's single point of ultimate accountability; it cannot be created or removed from within the console itself. |

A single person may legitimately hold more than one of these roles at once (for example, the platform owner is also an instructor on a programme they wrote); the sign-in flow for staff must therefore ask **which portal** to enter, rather than assume one role per person (see FR-AUTH-050).

---

## 4. System Features — Functional Requirements

Each requirement below carries a stable ID (`FR-<area>-<number>`) and a priority (**M**ust / **S**hould / **C**ould). IDs are numbered in steps of ten so related requirements can be inserted later without renumbering everything after them.

> **Note on sample data.** The prototype this section is derived from ships with mock content — specific programme titles, module counts, hours, and sample learner/instructor/administrator records — purely to make the screens demonstrable. None of that *content* is a requirement, and no specific programme, module, or user record from the prototype should be treated as confirmed scope. Every requirement below describes the *mechanism* a screen must provide, not the prototype's current sample values. (Quiz *mechanics* — question count, pass mark, and attempt rules in §4.6 — are a different thing: they are configurable platform behaviour, deliberately designed and explained in §6, not incidental sample content, so they are specified with their current default values.) The client's real curriculum and catalogue size are expected to differ from the prototype and will be defined separately as content.

### 4.1 Public Marketing Website

**Purpose:** convert an anonymous visitor into a signed-up learner. One long-form landing page plus the account-creation flow.

| ID | Requirement | Pri. |
|---|---|---|
| FR-MKT-010 | The landing page shall present, in order: a hero statement of what the platform is; a scrolling strip of the subjects it covers; why the platform exists; the programme catalogue; how the learning journey works; what the certificate is worth; who the platform is for; frequently asked questions; and a single closing call to enrol. | M |
| FR-MKT-020 | The hero section shall state the platform's live totals — number of programmes, number of modules, total hours of material, and "free" as the cost — computed from the current catalogue so the figures can never drift out of sync with what a learner actually sees. | M |
| FR-MKT-030 | The programme catalogue on the landing page shall list every published programme with its title, level (Foundation or Intermediate), one-line summary, topics covered, module count and duration, and shall let the visitor expand any one of them in place to see full topic coverage and an "Enrol for free" call to action. | M |
| FR-MKT-040 | The site shall present a five-step "how it works" explanation of the learner journey — create an account, enrol, work through modules at your own pace, pass the quizzes (unlimited attempts), earn the certificate — using this framing consistently everywhere else the journey is described. | S |
| FR-MKT-050 | The site shall present at least six FAQ items covering: cost, whether prior subject knowledge is required, typical time investment, what the certificate certifies, whether group/departmental enrolment is available (currently individual sign-up only — see §11), and which languages the material is available in. | S |
| FR-MKT-060 | Every primary call to action on the marketing site ("Get started", "Enrol for free", "Create your free account") shall route to account sign-up; every secondary call to action ("Sign in") shall route to learner sign-in. A separate, clearly distinct entry point for staff sign-in shall exist and shall not be the primary call to action anywhere on the public site. | M |
| FR-MKT-070 | The global header and footer shall be present and identical across every marketing page, linking to the catalogue, "how it works", the certificate explanation, FAQs, account creation and sign-in, and a support contact address. | M |
| FR-MKT-080 | Individual programme detail pages (distinct URLs, not just an in-place expansion on the landing page) shall be built for production — the prototype intentionally uses an expand-in-place accordion because no such pages exist yet to link to (see §11). | S |

### 4.2 Learner Account Creation, Verification and Sign-In

| ID | Requirement | Pri. |
|---|---|---|
| FR-AUTH-010 | Sign-up shall collect exactly five inputs: full name (as it should appear on certificates), email address, a password, an optional "where you work" sector, and a required agreement to terms of use and a privacy notice. No other field (department, phone number, national identity number, physical address) shall be requested at sign-up. | M |
| FR-AUTH-020 | "Where you work" shall never affect what a learner may enrol in; its stated purpose is exclusively to inform which future programmes get built. | M |
| FR-AUTH-030 | Sign-up shall offer a one-tap "Continue with Google" option, presented above and visually prior to the email/password form. | S |
| FR-AUTH-040 | A password field being set (sign-up, and password-change on Settings) shall show a live strength indicator and enforce a minimum of 8 characters for a learner account. A password field being *entered* to sign in shall not carry a strength indicator or minimum-length validation. | M |
| FR-AUTH-050 | After sign-up, the learner shall be taken to an email-verification screen naming the address a verification link was sent to, offering to resend the link (with a 30-second cooldown between sends) and a link valid for 24 hours, and an option to go back and correct the address. | M |
| FR-AUTH-060 | Learner sign-in shall collect exactly two inputs (email, password), offer the same one-tap Google option, offer "keep me signed in on this device," and offer a self-service "forgot password" recovery flow. | M |
| FR-AUTH-070 | A distinct, non-learner-facing "sign in to the console" screen shall exist for staff. It shall not offer self-registration or a Google sign-in option, since staff accounts are provisioned by an administrator, not self-served; its own password-recovery guidance shall direct the person to their administrator rather than a self-service reset link. | M |
| FR-AUTH-080 | On successful staff sign-in, if the account holds more than one role (for example, super-administrator **and** instructor on a programme they authored), the system shall ask which portal to enter as, rather than guessing; the list offered shall be filtered to only the roles that account actually holds. | M |
| FR-AUTH-090 | Real terms-of-use and privacy-notice pages, linked from sign-up, shall be authored and published (currently placeholder links — see §11). | M |

### 4.3 Learner Dashboard

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-010 | On sign-in, the learner shall land on a dashboard whose first and most prominent element, when applicable, is a "continue" card for the programme they most recently made progress on but have not finished — showing the next module, its duration, and a one-click resume action. This element shall not appear if nothing is in progress. | M |
| FR-STU-020 | The dashboard shall show four running totals: programmes enrolled, modules completed, hours studied, and certificates earned. | M |
| FR-STU-030 | The dashboard shall show the learner's own enrolled programmes as cards, with a "browse all" path to the full catalogue, and shall show an empty-state prompt to browse the catalogue if the learner has not yet enrolled in anything. | M |
| FR-STU-040 | The dashboard shall surface, in a dedicated panel, every quiz belonging to a module the learner has finished but not yet passed — this is the one thing on the platform that is genuinely outstanding, since finishing a module's content and passing its quiz are tracked independently (see BR-4). An empty state shall confirm nothing is outstanding. | M |
| FR-STU-050 | The dashboard shall show a short, most-recent-first activity feed (module completions, quiz results, certificates issued, new enrolments), each entry linking to the relevant page. | S |
| FR-STU-060 | The dashboard shall additionally surface programmes the learner has not yet enrolled in ("room for another"), and shall omit this section entirely once the learner is enrolled in every programme on the platform. | C |

### 4.4 Programme Catalogue and Enrolment (Learner-Facing)

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-070 | The learner-side catalogue shall list every programme in one grid regardless of enrolment status, distinguished by a status indicator on each card, filterable by All / In progress / Completed / Not started. A filter option that would return zero results shall be shown disabled rather than hidden. | M |
| FR-STU-080 | Enrolling in a programme shall require no approval step and shall be possible for any number of programmes simultaneously; progress in each is tracked entirely independently of the others. | M |
| FR-STU-090 | A programme's own page shall show: its topic coverage; every module in order with each module's completion/quiz status; a progress ring/bar with modules completed and time studied vs. remaining; and a certificate panel showing either the earned certificate or exactly what remains (modules left, quizzes left) before one issues. | M |
| FR-STU-100 | The primary action on a programme page shall read "Enrol and start" if not yet enrolled, "Resume" if in progress, or "Review" if completed, and shall always route to the correct next module. | M |
| FR-STU-110 | A learner shall be able to leave (self-unenrol from) a programme and later return to it with progress held, per the platform's stated "your place is held" promise. | S |

### 4.5 Module Content Consumption

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-120 | A module page shall render its content as an ordered sequence of blocks of three possible kinds — a video lecture, a written passage, or a set of downloadable materials — in whatever order the module's own content declares, and shall always display exactly three learning objectives for the module. | M |
| FR-STU-130 | **No module, quiz, or programme shall ever be locked or gated behind another.** A learner may open any module of any enrolled programme at any point, in any order, regardless of what else has or hasn't been completed. This is a deliberate product principle ("this is a foundation, not a filter"), not an oversight to be fixed later — no future requirement should introduce sequential locking. | M |
| FR-STU-140 | A module page shall let the learner mark the module complete, and this action shall be reversible (a learner may un-mark a module they completed by mistake). | S |
| FR-STU-150 | A module page shall show, and let the learner navigate directly to, the previous and next module in the programme, and shall show every module in the programme in a persistent contents list with completion state. | M |
| FR-STU-160 | Marking a module complete is entirely independent of passing its quiz — a module can be "done" with its quiz unattempted or failed, and this state must be visible and actionable both on the module page and via the outstanding-quizzes panel described in FR-STU-040. | M |
| FR-STU-170 | Real video hosting/playback and real downloadable material delivery shall be implemented in production (the prototype uses a fully-interactive but file-less mock player and inert download buttons — see §11). | M |

### 4.6 Quiz Engine

**Purpose:** the closing assessment for every module. Applies uniformly across the whole platform.

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-180 | Every module's quiz shall consist of exactly four multiple-choice questions, each with four options and exactly one correct answer. | M |
| FR-STU-190 | The platform-wide pass mark shall be a single configurable percentage (currently 70%), applied identically to every quiz on the platform — never configurable per module or per programme, so that a certificate means the same thing regardless of which module it passed through. | M |
| FR-STU-200 | A learner shall have **unlimited attempts** at any quiz, with **no time limit**, and the **highest score achieved** shall be the score that counts toward certificate eligibility. | M |
| FR-STU-210 | A quiz shall be presented one question at a time with a progress indicator, previous/next navigation, and shall refuse to submit until every question has been answered, with a clear inline message explaining why. | M |
| FR-STU-220 | On submission, the learner shall immediately see their score, a pass/fail result against the platform pass mark, and — separately, on demand — a full review of every question showing their chosen answer, the correct answer, and a written explanation, **whether or not that question was answered correctly.** Explanatory feedback must never be withheld for a question the learner got right. | M |
| FR-STU-230 | A learner shall be able to retake a quiz at any time from the result screen, the review screen, the module page, or the quizzes index, with no penalty and no cooldown. | M |
| FR-STU-240 | A dedicated "quizzes" index shall list every quiz across every enrolled programme, grouped by programme, showing for each: passed, needs retake (with the failing score against the pass mark), module finished but quiz never attempted, or quiz available but module not yet finished — and every one of these states shall remain clickable and attemptable (see FR-STU-130). | M |
| FR-STU-250 | Every quiz attempt and its resulting score must be recorded against the learner's account server-side in production (the prototype explicitly discloses that no attempt is currently recorded). | M |

### 4.7 Certificates (Learner-Facing)

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-260 | A certificate for a programme shall be **issued automatically, immediately**, the moment a learner has completed every module and passed every module's quiz in that programme — there is no manual request, approval, or issuance step on the learner side. | M |
| FR-STU-270 | Each certificate shall carry: the holder's name **as separately entered for certificates** (distinct from the display name used elsewhere in the portal), the programme title, modules completed, average quiz score, hours of material, the date of issue, and a unique, human-readable reference number. | M |
| FR-STU-280 | A certificate shall never expire, shall be exactly one per completed programme, and shall remain downloadable and re-downloadable by the learner at any later date. | M |
| FR-STU-290 | Changing the "name on certificates" field after a certificate has already been issued shall not retroactively alter that certificate — only certificates issued after the change reflect the new name. | M |
| FR-STU-300 | A learner shall be able to export/print their certificate as a document suitable for attaching to an application or a proposal, and to copy a direct link to it. | M |
| FR-STU-310 | Anyone holding a certificate reference number — not only the certificate's owner — shall be able to check it against a public verification lookup that confirms the programme, the holder, and the date, and nothing else. This public verification page does not yet exist in the prototype and must be built for production (see §11); it is a load-bearing promise made explicitly in the platform's own marketing and certificate copy. | M |
| FR-STU-320 | A certificate's detail page shall invite the learner to submit a rating (1–5 stars, required) and an optional written review for that programme; submission shall be blocked until a star rating is chosen. Submitted reviews enter a moderation queue and are not shown publicly until an administrator approves them (see FR-ADM-190). | S |
| FR-STU-330 | A certificates index shall separately show what has been earned (with an empty-state prompt if nothing has yet) and, for every enrolled-but-incomplete programme, how close the learner is and a direct link to continue. | S |

### 4.8 Learner Profile and Settings

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-340 | A **Profile** screen shall hold identity information: display name, the (separately editable) name printed on certificates, email address, and optional workplace details (role, organisation, sector, district) that never gate enrolment. It shall also show read-only learning facts (member since, programmes enrolled, modules completed, hours studied, certificates) and a short statement of what personal data the platform retains. | M |
| FR-STU-350 | A separate **Settings** screen shall hold platform-behaviour preferences, kept deliberately apart from identity: email notification toggles (progress/certificates, new programmes, product news), a study-reminder cadence, a language preference (English now; Sinhala and Tamil marked "coming soon"), and a password-change form. None of these preferences shall affect enrolment or completed progress. | S |
| FR-STU-360 | Settings shall offer account deletion behind a two-step confirmation, and shall disclose accurately that deletion removes the learner's enrolments and progress but **does not** invalidate certificates already issued — those remain valid in the register under their reference even though the former learner can no longer download them from a deleted account. | M |

### 4.9 Instructor Console — Dashboard and Programme Management

| ID | Requirement | Pri. |
|---|---|---|
| FR-INS-010 | An instructor's console is scoped entirely to the programme(s) an administrator has explicitly assigned them to. An instructor with no assignment shall see a clear empty state, not an error, and shall have no path to assign themselves a programme. | M |
| FR-INS-020 | The instructor dashboard shall summarise, across their assigned programmes only: modules still to write, modules awaiting review, quizzes worth attention (see FR-INS-070), unused uploaded materials, modules published, learners reached, and average programme rating. | M |
| FR-INS-030 | An instructor shall be able to list their assigned programmes and open any one to see its modules, each showing state (Not started / Draft / In review / Published), materials attached, quiz link, author, and last-updated date. | M |
| FR-INS-040 | Programme creation and publication are **administrator-only**; an instructor may create, edit, and self-publish *modules* within a programme they are assigned to, but may never create a programme or change a programme's own published/draft status. A draft programme (regardless of any module's individual state) is never visible to a learner. | M |
| FR-INS-050 | An instructor shall be able to add a new module to an assigned programme, giving it a title and a study-time estimate; the module shall be created empty, in Draft state, numbered automatically as the next in sequence — module numbering is never chosen by hand. | M |

### 4.10 Instructor Console — Module Content Authoring

| ID | Requirement | Pri. |
|---|---|---|
| FR-INS-060 | The module editor shall let an instructor add, edit, and remove content blocks of two authoring kinds — a video block (title, the recording itself, duration, a short caption) and a written block (heading, body passage) — and the on-screen order of blocks is the order a learner will read them in. | M |
| FR-INS-070 | Removing a content block, or deleting a module entirely, shall require an explicit two-step confirmation naming exactly what will be lost — never a bare "Are you sure?" — and shall state accurately that learners already past that point keep their existing progress. | M |
| FR-INS-080 | A module's publication state (Draft / In review / Published) shall be changeable by the instructor themselves for their own material — an instructor does not need administrator sign-off to publish a module. Moving a module to "In review" instead is offered as a **voluntary** hand-off for anything making a claim about policy or money, not an enforced gate. | M |
| FR-INS-090 | Deleting a module shall renumber the modules after it and shall be reflected in the progress of every learner already part-way through the programme; materials it referenced remain on the shared library shelf regardless. | M |
| FR-INS-100 | Rich media authoring — real video upload/transcoding and a real rich-text editor — must be implemented for production; the prototype demonstrates the screen these tools live in without a functioning uploader or editor. | M |

### 4.11 Instructor Console — Quiz Authoring

| ID | Requirement | Pri. |
|---|---|---|
| FR-INS-110 | A quiz cannot be authored until its module has content — quiz authoring is a distinct step that follows content, not a parallel one. | M |
| FR-INS-120 | The quiz editor shall let an instructor add, edit and remove questions; each question shall require a prompt, exactly four answer options, one of them marked correct via a single-select control (not a checkbox), and a required explanation shown to the learner after every attempt regardless of outcome. | M |
| FR-INS-130 | Removing a question shall require confirmation and shall state that learners who already answered it keep their historical attempt — only future attempts see the changed question set. | S |
| FR-INS-140 | Platform-wide quiz rules (question count, pass mark, unlimited attempts, no time limit) shall be shown to the instructor as read-only facts on the quiz screen, with an explicit note that only the super administrator can change them — an instructor cannot set a different pass mark or attempt limit for their own quiz. | M |
| FR-INS-150 | Any quiz whose pass rate falls below a defined "needs attention" threshold, or whose average score falls below the platform pass mark, shall be visibly flagged to the instructor (and, in aggregate, to administrators) as likely to contain a wrong or ambiguous question rather than reflecting a weak cohort — since attempts are unlimited, a persistently low pass rate is a content signal. | S |
| FR-INS-160 | An instructor shall be able to clear (reset) recorded attempts for a quiz after correcting a question, with an explicit statement that this clears scores but never revokes a certificate already issued on the strength of a prior attempt. | S |
| FR-INS-170 | A dedicated "quizzes" index shall list every quiz an instructor is responsible for, ranked weakest-pass-rate-first, so the quiz most in need of attention is always the first thing seen. | S |

### 4.12 Shared Materials Library

**Purpose:** one platform-wide shelf of downloadable/reference material, used by instructors when authoring and administrators when reviewing. Applies identically in both the Instructor and Admin consoles.

| ID | Requirement | Pri. |
|---|---|---|
| FR-LIB-010 | Materials shall be uploaded once into a single shared library, organised into named groups ("shelves"), and **attached to modules by reference** — never duplicated per module. Replacing a file (uploading a new version under the same library entry) shall update every module that references it; the library shall discourage re-uploading a "second copy" of an existing file. | M |
| FR-LIB-020 | **Any staff member may attach any material, from any group, to any module they are authoring — across any programme.** There is no ownership or exclusivity restriction on a material or a group; the only legitimate "already attached" restriction is a duplicate-attachment check against the *specific module currently being edited*, never against use elsewhere. No future requirement, UI copy, or warning message may introduce or imply a stronger restriction than this. | M |
| FR-LIB-030 | Where a material is used shall be **derived** by scanning the current curriculum for modules that reference it — never separately recorded and hand-maintained — so the "used in" list can never claim a module that does not actually attach the file. | M |
| FR-LIB-040 | A module editor shall offer two clearly distinct actions: attaching an existing library file to the module being edited, and uploading a brand-new file into the library (which lands on the library, not automatically on the module — attaching it afterwards is a separate step). | S |
| FR-LIB-050 | Uploading a new material shall require a title (unique across the library — the title is the join key used to determine where a file is used, so two entries may never share one) and an assignment to a group; group is a required field to prevent an unsorted catch-all shelf from accumulating. | M |
| FR-LIB-060 | Attaching an entire group ("shelf") of materials to a module in one action shall copy in the group's current contents as a point-in-time snapshot — files added to that group afterwards do not retroactively appear on modules that attached it earlier. | S |
| FR-LIB-070 | The library index shall report totals (files, groups, total attachments, files never used, recently added) and a search/filter over the full shelf; a file uploaded and never attached to anything shall be visibly flagged so it can be attached or removed. | S |

### 4.13 Instructor Console — Learner Progress Visibility

| ID | Requirement | Pri. |
|---|---|---|
| FR-INS-180 | An instructor shall see the progress of every learner enrolled in their own **published** programmes only — never a draft programme's (nonexistent) learners, and never any learner or programme outside their assignment. A learner enrolled in two of an instructor's programmes shall appear as two separate progress rows, not merged. | M |
| FR-INS-190 | Instructor-facing learner views shall show progress facts only — name, programme, percentage/modules complete, average score, last active — and shall **never** expose a learner's email address, employer, district, account status, or any administrative action (suspend, reset, message). Those are exclusively an administrator's to see and act on. | M |
| FR-INS-200 | An individual learner's detail view, where offered to an instructor, shall be restricted to the instructor's own programmes and shall be inaccessible (not merely hidden) for any learner not enrolled in one of them. | M |

### 4.14 Instructor Console — Profile and Settings

| ID | Requirement | Pri. |
|---|---|---|
| FR-INS-210 | An instructor profile shall separate what a learner sees about them (display name, field/title, a short optional biography) from private account settings (email, password, notification preferences, language, session controls) — kept as two distinct screens. | S |
| FR-INS-220 | Programme assignment shall be shown to the instructor as **read-only**, naming who to contact (their appointing administrator) to request a change — an instructor can never assign themselves to, or remove themselves from, a programme. | M |
| FR-INS-230 | Instructor notification preferences shall cover only their own material: a learner review lands, a programme assignment changes, one of their quizzes' average score falls below the pass mark, another instructor attaches their uploaded material, and a weekly progress summary. None of these shall email a learner. | C |
| FR-INS-240 | An instructor account is closed only by an administrator, never self-service; modules an instructor authored remain published and retain their attribution after the account is closed. | S |

### 4.15 Admin Console — Dashboard and Analytics

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-010 | The admin dashboard shall present, in priority order, **queues first, then metrics, then charts**: reviews awaiting moderation, modules awaiting review, instructors with no programme assigned, and suspended learner accounts — each linking directly into the screen that resolves it. | M |
| FR-ADM-020 | Headline KPIs shall include registered learners, active-in-30-days learners, total enrolments and total certificates issued, each shown with a month-over-month change indicator. | M |
| FR-ADM-030 | The dashboard shall chart monthly sign-ups and monthly completions over the platform's lifetime, enrolment status as a whole-platform split (completed / in progress / not started), and enrolments by programme — with the current, partially-elapsed month visually distinguished so a natural mid-month dip is never misread as a decline. | M |
| FR-ADM-040 | The dashboard shall list the most recently registered learners and the most recently updated modules platform-wide, and a breakdown of learners by self-declared work sector. | S |
| FR-ADM-050 | Every figure shown across admin dashboards and reports must reconcile to the platform's own authoritative totals — a production requirement is that these are computed from one source of truth, never independently maintained per screen. | M |

### 4.16 Admin Console — Programme Lifecycle Management

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-060 | An administrator (or super administrator) shall be able to create a new programme — title, purpose summary, level, and optionally one or more instructors — which is always created in **Draft** state, invisible to learners until explicitly published. | M |
| FR-ADM-070 | A draft programme's detail view shall omit enrolment/completion/rating figures (rather than showing zeroes, which would misleadingly read as a failing live programme) and shall visibly flag if it has no instructor assigned. | S |
| FR-ADM-080 | An administrator shall be able to change a programme's own state between Published (in the catalogue, open to enrolment) and Draft (hidden; learners already enrolled keep full access and progress). | M |
| FR-ADM-090 | An administrator shall be able to archive a programme, behind a confirmation naming the consequence explicitly: archiving hides it from the catalogue permanently, but **certificates already issued for it remain valid** — a completed fact does not stop being true because the programme is later withdrawn. | M |
| FR-ADM-100 | An administrator shall be able to view (but, per FR-INS-060/080, not author) every module's content and quiz for oversight purposes, and shall be able to change a module's own publish state where the platform's editorial process calls for administrator sign-off. | S |

### 4.17 Admin Console — Instructor Management

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-110 | An administrator shall be able to invite a new instructor (name, email, field, optionally one or more initial programme assignments) — invitation is the only route to a new instructor account; instructors never self-register. | M |
| FR-ADM-120 | An administrator shall be able to change which programme(s) an instructor is assigned to at any time. Removing an assignment shall be confirmed with an explicit warning that it does not delete or unpublish anything the instructor already wrote — it only removes their ability to edit it further. | M |
| FR-ADM-130 | An administrator shall be able to suspend an instructor account; suspension blocks console sign-in but explicitly does **not** unpublish modules that instructor already published. | M |
| FR-ADM-140 | The instructor register/list shall show, per instructor: assigned programmes (draft ones marked as such), modules published vs. pending, learners reached, last active date, and account status (Active / Invited / Suspended), filterable by these states. | S |

### 4.18 Admin Console — Learner Management

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-150 | An administrator shall be able to search/filter the full learner register (Active / Dormant / Suspended) and open an individual learner's record. There is deliberately **no** "create learner" action here — learners only ever self-register via the public site. | M |
| FR-ADM-160 | A learner's detail record, for an administrator, shall show identity, enrolments and progress, certificates, and administrative actions — but shall **never** expose quiz-answer-level detail, per-module time-on-task, or sign-in history. Administrators have a legitimate need to see *that* progress happened, never a reason to see how. | M |
| FR-ADM-170 | Administrative actions available on a learner record shall include: sending a password-reset link (single-use, time-limited), suspending or restoring the account (progress and certificates untouched either way), and exporting the full record as a single file, as a learner is entitled to request. Every one of these actions shall be recorded against the acting administrator's name in the audit log (see FR-SA-030). | M |

### 4.19 Admin Console — Certificate Management

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-180 | **There is no manual "issue certificate" action anywhere in the admin console.** A certificate means exactly one thing — every module completed, every quiz passed — and that meaning must never be weakened by allowing an administrator to grant one by hand. If a learner has genuinely finished and no certificate exists, that is a data/progress bug to be fixed at the source, not a certificate to be issued around it. | M |
| FR-ADM-190 | An administrator shall be able to **withdraw (revoke)** an issued certificate, which requires a mandatory, permanently-recorded reason and immediately stops that reference verifying publicly. Withdrawal cannot be undone; a corrected certificate is issued as a new reference, never by reinstating the old one. | M |
| FR-ADM-200 | The certificate register shall be filterable (Valid / Withdrawn) and shall show, per certificate: reference, learner, programme, score, issue date, and status; withdrawn certificates shall retain their reason, who withdrew them, and when, indefinitely. | S |

### 4.20 Admin Console — Review Moderation

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-210 | Learner-submitted reviews shall enter a moderation queue and shall not appear anywhere public until an administrator approves them (default platform behaviour; configurable — see FR-SA-060). | M |
| FR-ADM-220 | The queue shall run an automated check (contact details, links, abusive language) that **flags** a review for priority attention but never auto-rejects it — a human decision is always required. Flagged reviews shall sort ahead of the rest of the queue. | S |
| FR-ADM-230 | Approving a review shall require no justification; **rejecting** one shall require a mandatory written reason, recorded against the review and retained after the decision — publishing agrees with what was already written, refusing is a decision someone may have to explain later, and the asymmetry is deliberate. | M |
| FR-ADM-240 | A rejected review's reason is not shown to the learner who wrote it — only that it was not published. | S |
| FR-ADM-250 | Already-decided reviews (published and rejected) shall remain visible to administrators, most recent first, each showing who decided and when. | C |

### 4.21 Super Administrator — Administrator Management

*Every requirement in this subsection is exclusive to the Super Administrator role; an Administrator can neither perform nor view the underlying data for any of them.*

| ID | Requirement | Pri. |
|---|---|---|
| FR-SA-010 | Only the super administrator may create, suspend, or otherwise manage other administrator accounts. This is the one capability the entire role hierarchy exists to protect: an account able to appoint further administrators would be able to appoint its own replacement, at which point no account on the platform is ultimately accountable to anyone. | M |
| FR-SA-020 | Every administrator account shall permanently record **who appointed it** (or that it is the platform's one founding account, appointed by nobody) — an administrator list that cannot answer "who let this account in" is not a usable control. | M |
| FR-SA-030 | **Exactly one super-administrator account shall exist at any time.** It cannot be created, suspended, or removed from within the console itself — transferring platform ownership to a different account is a deliberate, separate, out-of-band process, never a console action. | M |

### 4.22 Super Administrator — Audit Log

| ID | Requirement | Pri. |
|---|---|---|
| FR-SA-040 | The platform shall maintain an audit log, readable **only** by the super administrator — the rationale being that a log the people it records about can read, filter, or eventually argue with stops functioning as a log. | M |
| FR-SA-050 | Every entry shall record: the actor (an entry is never attributed to "the system" — every consequential action has a named human actor), the action taken, the target of that action in plain language, an optional detail line (what changed, from what, to what), and a timestamp to the minute. | M |
| FR-SA-060 | The categories of action recorded shall include, at minimum: account creation/suspension/restoration, role changes, programme creation/publication/update, module publication, instructor assignment changes, review approval/rejection, certificate withdrawal, settings changes, and data exports. Routine page views/reads shall **never** be logged — a log of every screen someone opened is surveillance, not accountability, and would bury the events that matter. | M |
| FR-SA-070 | **Log entries shall be immutable — never editable or deletable by anyone, including the super administrator** — and shall be retained for a fixed seven years, a period that cannot be shortened from within the console. | M |
| FR-SA-080 | Exporting the audit log for an investigation shall itself generate a new audit log entry, so the export trail is as accountable as everything it exports. | S |

### 4.23 Platform Settings

*Readable by both Administrator and Super Administrator; changeable by the Super Administrator only. Administrators must be able to see every current setting (even ones they cannot change), so they can explain platform behaviour to a learner without guessing.*

| ID | Requirement | Pri. |
|---|---|---|
| FR-SA-090 | **General** settings: platform display name, support contact address, default and available languages, console timezone. | S |
| FR-SA-100 | **Enrolment** settings: whether registration is open, whether email verification is required before a first certificate can issue, whether learners may self-unenrol, and any cap on concurrent programme enrolments (default: no limit). | S |
| FR-SA-110 | **Certificate** settings: the platform-wide quiz pass mark (a single percentage applied to every quiz — raising or lowering it must never retroactively affect certificates already issued), whether certificates issue automatically on completion, whether public verification is enabled, and the certificate reference prefix (changing it must never renumber certificates already issued). | M |
| FR-SA-120 | **Moderation** settings: whether reviews are held for approval by default, whether automated flagging (contact details/links/abuse) is active, and whether an administrator is emailed when something is flagged. | S |
| FR-SA-130 | **Email** settings: whether a weekly learner progress digest is sent, whether new-programme announcements are sent, and after how many days of inactivity a nudge email is sent (or never). | C |
| FR-SA-140 | **Data retention** shall be shown as fixed, informational values, not editable from the console: learner records retained for the life of the account plus two years after closure (to preserve certificate verification), audit log retained seven years (see FR-SA-070). | M |

### 4.24 Console Account: Profile and Sign-In (Instructor and Admin)

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-260 | A staff (console) password shall require a minimum of **12 characters**, deliberately stricter than a learner account's 8 — the difference reflects what each kind of account can reach. | M |
| FR-ADM-270 | Two-step (multi-factor) sign-in shall be available to every staff role and shall be **mandatory** for the super administrator specifically. | S |
| FR-ADM-280 | A console session shall time out after **8 hours of inactivity** — shorter than a learner portal session, reflecting the greater consequence of an unattended console session. | S |
| FR-ADM-290 | Each staff role's profile page shall display, in plain language, every capability that role does and does not hold, so a new administrator or instructor can immediately see the boundary of their own access without needing to ask. | C |

---

## 5. The Curriculum — Content Model

The curriculum itself is a requirement, not merely content, because its *shape* constrains what the module editor and the learner-facing module page must be able to render.

| Rule | Detail |
|---|---|
| A **programme** | is self-contained: it has a title, a one-line summary, a level (*Foundation* or *Intermediate*), a set of topics, a module count, and a total duration in hours — and never depends on any other programme being started or finished first. |
| A **module** | belongs to exactly one programme, carries a sequence number, a title, a kind badge (*video* or *reading* — describing what the module mostly is, not an exclusive category), a total estimated study time, a short, consistent list of learning objectives (the prototype's sample content uses three per module as a content-style convention, not a system limit), and an ordered list of **content blocks**. |
| A **content block** | is one of: a **video** block (title, duration, caption text standing in for the opening of the lecture); a **text** block (one heading, one passage — never a long unbroken wall of text); or a **materials** block (a set of files/links drawn from the shared library). |
| The **quiz** | belonging to a module is a fixed set of exactly four multiple-choice questions (see §4.6); it is authored once the module has content, never before. |
| **Consistency rule** | the module count and total study hours a programme advertises publicly must always equal what its actual modules sum to — this must be enforced as a data-integrity check in the production content pipeline, exactly as it is checked automatically in the current codebase during development. |

---

## 6. Business Rules (Consolidated)

The rules below recur across many screens in the prototype and are gathered here as the single authoritative list. Every functional requirement above that touches one of these rules must remain consistent with it.

1. **Nothing on the learner side is locked.** No module, quiz, or programme may ever require another to be finished first. (See FR-STU-130.)
2. **Every quiz on the platform shares one pass mark, one question count, unlimited attempts, and no time limit** — set once, platform-wide, by the super administrator. No quiz, module, or programme may override these individually. (See FR-STU-190, FR-SA-110.)
3. **The highest score achieved on a quiz, not the most recent, is the score that counts** toward certificate eligibility.
4. **Module completion and quiz-passing are two independent facts.** A module can be marked complete without its quiz being passed, and a quiz can be attempted and passed even if the module has not been marked read. The dashboard's "quizzes to take" panel exists specifically to surface the gap between the two.
5. **A certificate is issued automatically and exclusively by finishing a programme** — every module complete, every quiz passed. There is, and must remain, no manual "issue" action anywhere in the product.
6. **A certificate never expires, is exactly one per completed programme, and stays valid even if**: the issuing programme is later archived; the learner's certificate-name preference is later changed; or the learner's account is later deleted. Only an explicit, reasoned, permanently-recorded withdrawal by an administrator invalidates one.
7. **Any material or group in the shared library may be attached to any module, by any authoring staff member, across any programme, without limit.** There is no ownership or exclusivity of a material or a group — this must never be gated or implied otherwise in code, UI, or copy.
8. **Materials are attached by reference, not duplicated.** Replacing a file's content updates every module that references it; group ("shelf") attachment to a module is a point-in-time snapshot, not a live sync.
9. **An instructor's authoring scope is strictly limited to the programme(s) an administrator has explicitly assigned them to** — never self-assigned, never inferred, and always changeable only by an administrator.
10. **An instructor may publish their own modules without administrator sign-off**; moving a module to "in review" is a voluntary request for a second read, not an enforced gate — except that a programme itself can only ever be published or archived by an administrator, never by an instructor.
11. **A draft programme is invisible to learners in its entirety**, regardless of any individual module's own publish state.
12. **Suspending an account (learner, instructor, or administrator) blocks sign-in only** — it never deletes, hides, or unpublishes anything that account already produced or earned, and it is always reversible.
13. **Only the super administrator may create or remove another administrator account, and only the super administrator may read the audit log.** Exactly one super-administrator account exists at any time, and it cannot be created or removed from inside the console.
14. **The audit log is append-only and immutable** — no entry may ever be edited or deleted by anyone, including the super administrator — and it never records passive activity (page views), only consequential, state-changing actions.
15. **Reviews are moderated before they are public.** Approving requires no justification; rejecting always requires a permanently-recorded reason. Automated flagging surfaces likely-problematic reviews for priority attention but never auto-rejects.
16. **Learner data shown to staff is need-based and minimal.** Instructors see aggregate progress on their own programmes only, never contact details or administrative controls. Administrators see progress and account status, but never quiz-answer-level detail, per-module time-on-task, or sign-in history.
17. **The platform carries no payment functionality of any kind, at any tier, ever** — "free" is a product principle, not a current promotional price.
18. **Nothing in the shipped product may identify the commissioning organisation** by name, logo, or brand colour — the platform's identity is a placeholder, deliberately swappable from a single configuration point.

---

## 7. Roles and Permissions Matrix

| Capability | Super Admin | Administrator | Instructor |
|---|:---:|:---:|:---:|
| Sign in to a console | ✓ | ✓ | ✓ |
| Create / suspend administrator accounts | ✓ | — | — |
| Read the audit log | ✓ | — | — |
| Change platform-wide settings | ✓ | (read-only) | (read-only, restricted) |
| Create, publish, or archive a programme | ✓ | ✓ | — |
| Appoint or suspend an instructor | ✓ | ✓ | — |
| Change an instructor's programme assignments | ✓ | ✓ | — |
| View the full learner register | ✓ | ✓ | — |
| Suspend / reset / export a learner account | ✓ | ✓ | — |
| Approve or reject a review | ✓ | ✓ | — |
| Withdraw a certificate | ✓ | ✓ | — |
| View own assigned learners' progress | ✓ | ✓ | ✓ |
| Author (write/edit/publish) modules and quizzes | — | (view-only) | ✓ (assigned programmes only) |

*A capability an active role does not hold is always shown in that role's console — greyed, with the reason stated inline — rather than hidden, so a permission can be asked about rather than never discovered.*

---

## 8. Data Requirements

The production backend must, at minimum, model and persist the following entities and relationships (field lists are representative, not exhaustive):

| Entity | Key attributes | Relationships |
|---|---|---|
| **Learner** | name, certificate name, email, password/auth, sector, organisation, district, join date, status (active/dormant/suspended), notification & language preferences | has many Enrolments; has many QuizAttempts; has many Certificates; has many Reviews |
| **Programme** | title, summary, level, topics, status (draft/published/archived), created/updated dates | has many Modules; has many Enrolments; has many Instructor assignments |
| **Module** | number, title, kind, study minutes, objectives (3), content blocks, publish state, author, last-updated | belongs to one Programme; has one Quiz; has many attached Materials (by reference) |
| **Content Block** | type (video / text / materials), type-specific fields, order index | belongs to one Module |
| **Quiz / Question** | prompt, 4 options, correct index, explanation | belongs to one Module |
| **Enrolment** | learner, programme, enrolled date, current module, completed module list | links Learner ↔ Programme |
| **QuizAttempt** | learner, module, score, pass/fail, timestamp | belongs to one Learner, one Module |
| **Certificate** | reference (unique, format e.g. `[PREFIX]-[YEAR]-[PROGRAMME CODE]-[SEQUENCE]`), learner, programme, issue date, average score, status (issued/withdrawn), withdrawal reason/actor/date if applicable | belongs to one Learner, one Programme |
| **MaterialAsset** | title (unique), description, kind, size, language, group, uploader, upload date | belongs to one MaterialGroup; referenced by many Modules |
| **MaterialGroup** | name, description, created by, created date | has many MaterialAssets |
| **StaffMember** | name, email, role (super-admin/admin/instructor), title, status, created date, created-by, last active, assigned programmes (instructors) | — |
| **Review** | learner, programme, rating, body, status (pending/published/rejected), decided-by, decided-on, rejection reason, auto-flag state | belongs to one Learner, one Programme |
| **AuditEntry** | actor, action type, target, detail, timestamp | immutable, append-only |
| **PlatformSettings** | one row, all fields per §4.23 | singleton |

---

## 9. External Interface Requirements

### 9.1 User Interfaces

- A single responsive design system serves all four faces of the product from one codebase, already validated with the client through the prototype: a light, editorial visual language, a small set of named colour roles (rather than hard-coded hues) so the palette can be revised centrally, and one shared typeface for both headings and body copy.
- The learner portal, instructor console, and admin console share one navigation shell pattern (a left rail plus a top bar) with role-appropriate contents; the public marketing site uses a separate, persuasion-oriented layout.
- All destructive or consequential staff actions (suspend, archive, withdraw, delete, remove) must use a consistent two-step, in-place confirmation pattern that states the specific consequence in plain language — never a generic "Are you sure?" dialog.

### 9.2 Software Interfaces (to be built for production)

| Interface | Purpose |
|---|---|
| Authentication provider | Learner and staff sign-in, including Google OAuth for learners and multi-factor sign-in for staff. |
| Transactional email service | Verification links, password resets, staff invitations, notification preferences, certificate-issued notices. |
| Object storage / CDN | Uploaded materials and video hosting/streaming. |
| Application database | All entities in §8, including the immutable audit log. |
| Public certificate verification endpoint | A no-login lookup by certificate reference (see FR-STU-310). |

### 9.3 Communications Interfaces

Standard HTTPS web delivery; outbound transactional email for the flows above. No SMS, push notification, or third-party integration is currently in scope.

---

## 10. Non-Functional Requirements

### 10.1 Performance

- The product must remain usable on older machines and slower connections — an explicit design constraint given the audience spans a wide range of device capability and connection quality. Decorative animation must degrade automatically on lower-capability devices rather than being applied uniformly.
- Server-rendered pages (particularly the marketing landing page and any scroll-triggered content) must never ship a hidden/invisible initial state that depends on client-side JavaScript to become visible — content must be present and readable in the raw server response.

### 10.2 Accessibility

- All interactive/expandable UI (accordions, dialogs, filters) must carry correct semantic state (expanded/collapsed, selected) for assistive technology.
- Content that rotates or updates automatically (e.g. a rotating headline) must not be repeatedly re-announced to screen readers, and must provide a stable, equivalent static description.
- Respecting a visitor's reduced-motion preference must not leave any element permanently invisible — reduced motion should remove movement, never remove content.
- Charts and data visualisations must provide a text/table equivalent of the data they present, not rely on colour alone to convey meaning (e.g. pass vs. fail states).

### 10.3 Security

- Learner passwords: minimum 8 characters. Staff/console passwords: minimum 12 characters (see FR-ADM-260).
- Multi-factor sign-in available to all staff, mandatory for the super administrator (FR-ADM-270).
- Console sessions expire after 8 hours of inactivity (FR-ADM-280).
- Role/capability checks must be enforced server-side in production; the prototype's client-side gating demonstrates the *model* only and is not itself a security boundary.
- The audit log must be genuinely immutable at the data layer, not merely hidden from the UI (see BR-14).

### 10.4 Privacy and Data Minimisation

- The platform must collect and retain the minimum learner data needed to operate: name, certificate name, email, and completion records. No national identity number, phone number, or similar is to be collected, and nothing about a learner is to be shared with the organisations behind individual programmes.
- Staff-facing learner views must never expose quiz-answer-level detail or session/sign-in history (see BR-16, FR-ADM-160).
- Learner records: retained for the life of the account plus two years post-closure (to preserve certificate verification). Audit log: retained a fixed seven years (see FR-SA-140).

### 10.5 Reliability and Data Integrity

- Programme-level advertised figures (module count, total hours) must always reconcile with the actual authored curriculum — enforced as an automated integrity check in the content pipeline.
- All platform-wide reporting totals must be computed from a single source of truth, never independently authored or duplicated per screen (see FR-ADM-050).

### 10.6 Maintainability

- Brand identity (name, tagline, contact address) must remain a single, centrally swappable configuration point.
- The permission/capability model must remain centrally defined and imported everywhere it is checked, rather than re-implemented per screen.

### 10.7 Localisation

- The learner-facing product must be built to run in English, Sinhala, and Tamil side by side, even though only English content exists at launch; language is a per-learner preference on the settings screen. Staff console language may remain English-only for the initial release.

---

## 11. Out of Prototype Scope / Roadmap

The following are explicitly **not** built in the current prototype but are either promised in the product's own copy or flagged during the audit as required before a production launch. Each should be scoped as its own workstream.

| Item | Why it matters |
|---|---|
| Real backend, authentication, and persistence for every flow described above | The prototype simulates every write with an on-screen disclosure; this document specifies the behaviour that backend must reproduce. |
| Real Google OAuth integration | Currently a non-functional button, by design, rather than a broken flow. |
| Public certificate verification lookup page | Promised explicitly in the platform's own certificate and marketing copy; does not yet exist. |
| Real video hosting/playback and file storage/delivery for materials | The module page's video player and download buttons are fully interactive mocks with no underlying file. |
| A production rich-text / video-authoring toolset for instructors | The module editor demonstrates the target screen, not a working content authoring tool. |
| Real terms-of-use and privacy-notice pages | Currently placeholder links from the sign-up form. |
| Self-service "forgot password" flow (learner) | Currently a placeholder link; staff password recovery is intentionally administrator-mediated instead. |
| Individual, linkable programme detail pages | The marketing site currently expands programme detail in place because no dedicated pages exist to link to yet. |
| Group / departmental enrolment and departmental progress reporting | Explicitly flagged in the platform's own FAQ as planned but not yet available; only individual sign-up exists today. |
| Sinhala and Tamil translations of all learner-facing content | The architecture supports all three languages; the translated content itself does not yet exist. |
| Final certificate artwork/design | The prototype deliberately ships a labelled placeholder frame rather than a fabricated design nobody has approved. |
| Final brand name, and the resulting one-file propagation of it | Placeholder brand in place pending the client's decision. |

---

## Appendix A — Note on Illustrative Sample Content

The prototype this specification is derived from ships with a working demonstration catalogue — a handful of sample programmes covering illustrative green-growth subjects, each with sample modules, sample quiz questions, and sample learner/instructor/administrator records — so that every screen in Sections 4–7 could be exercised end-to-end while writing this document.

**None of that sample content is part of this specification**, and it is deliberately not reproduced here:

- The **number of programmes**, their **titles and subject areas**, and the **module count and duration of each** are curriculum decisions for the client to define. This document specifies that a programme has a title, a level, a set of topics, and an ordered set of modules (§5) — never how many programmes or modules must exist.
- The **specific quiz questions, options and explanations** are content to be authored by the client's instructors, per the authoring workflow specified in §4.11 — this document specifies the *shape* of a question (a prompt, four options, one correct answer, an explanation), not any question's actual text.
- The **sample learner, instructor and administrator records**, and any platform-wide totals derived from them (registered learners, enrolments, certificates issued, and similar figures shown on dashboards), are demonstration data only. The corresponding requirement in this document is always that the platform *compute and display such a total live* from real records (see FR-ADM-050) — never a specific number.

Where a concrete example is useful for illustration elsewhere in this document (for instance, the certificate reference format in §8), it is given in an abstract, bracketed form rather than as one of the prototype's actual sample values, for the same reason.

---

## Appendix B — Screen Inventory

| Face | Screen | Notes |
|---|---|---|
| Public site | Landing page | Single long-form page (§4.1) |
| Public site | Sign up | §4.2 |
| Public site | Sign in (learner) | §4.2 |
| Public site | Verify email | §4.2 |
| Public site | Console sign-in (staff) | §4.2 |
| Learner portal | Dashboard | §4.3 |
| Learner portal | Programme catalogue | §4.4 |
| Learner portal | Programme detail | §4.4 |
| Learner portal | Module page | §4.5 |
| Learner portal | Quiz | §4.6 |
| Learner portal | Quizzes index | §4.6 |
| Learner portal | Certificates index | §4.7 |
| Learner portal | Certificate detail | §4.7 |
| Learner portal | Profile | §4.8 |
| Learner portal | Settings | §4.8 |
| Instructor console | Dashboard | §4.9 |
| Instructor console | My programmes / Programme detail | §4.9 |
| Instructor console | Module editor | §4.10 |
| Instructor console | Quiz editor | §4.11 |
| Instructor console | Modules index / Quizzes index | §4.10, §4.11 |
| Instructor console | Materials library / group / material detail | §4.12 |
| Instructor console | Learners index / learner detail | §4.13 |
| Instructor console | Profile / Settings | §4.14 |
| Admin console | Dashboard | §4.15 |
| Admin console | Programmes list / detail / module / quiz | §4.16 |
| Admin console | Instructors list / detail | §4.17 |
| Admin console | Students (learners) list / detail | §4.18 |
| Admin console | Materials library / group / material detail | §4.12 |
| Admin console | Certificates | §4.19 |
| Admin console | Reviews | §4.20 |
| Admin console | Audit log (super admin only) | §4.22 |
| Admin console | Team / administrators (super admin only) | §4.21 |
| Admin console | Settings | §4.23 |
| Admin console | Profile | §4.24 |

---

## Appendix C — Glossary

See §1.3.

---

## Appendix D — Open Questions for the Client

The following require a client decision before or during production build and are flagged here rather than assumed:

1. **Final brand name, tagline, and visual identity** — the current name is a working placeholder only.
2. **Certificate artwork** — the certificate document layout carries the platform's own visual language but has not yet had a final design pass.
3. **Group/departmental enrolment** — scope and priority of the "enrol as a team" capability mentioned in the platform's own FAQ as planned.
4. **Sinhala and Tamil translation** — timeline and source of translated curriculum content.
5. **Certificate legal weight** — whether the certificate should reference any accreditation, and any wording constraints that follow from that.
6. **Data retention periods** — the two-year post-closure and seven-year audit retention figures used throughout this document are working defaults; confirm against any applicable data-retention regulation.
7. **Whether the client wishes to be named anywhere in the finished product** (e.g. an "in partnership with" footer credit) or whether the current fully-unbranded approach should remain permanent policy.

---

*End of document.*
