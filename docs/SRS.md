# Software Requirements Specification

## Free Public Green-Growth Learning Platform

**Working title used in this document:** *GreenFin Academy* — a placeholder name only. The client has not yet chosen the final product name. Every place the name appears in the code comes from one file (`lib/brand.ts`), so changing the name later is a small, one-file change, not a full rewrite. **The platform must not show who is funding or running it** — no sponsor name, logo, or sponsor colours may appear anywhere in the product. It must look and feel like a stand-alone product.

| | |
|---|---|
| **Document status** | Draft for client review |
| **Prepared from** | A working, front-end prototype (Next.js, TypeScript) built to show the platform's design, navigation, and how it works, before the real, live version is built |
| **Prepared on** | 16 August 2026 |
| **Document owner** | Product / Engineering |
| **Audience** | Client stakeholders, product owner, engineering team, QA |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 0.1 | 2026-08-16 | First draft, based on a full review of the working prototype | Engineering |

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

This document lists the requirements for a free, open, public learning platform — what it must do, and how it must behave. It is based on a full review of a working prototype: an interactive, front-end-only version of the platform, already built and shown to the client, that sets out the design, the navigation, and how a user moves through the product. Every requirement below is one of two things:

- something the prototype already shows working from start to finish (using sample data in place of a real backend), or
- something the prototype clearly says it intends to do but has not yet built — at these points the prototype shows a message such as *"This is a design prototype — nothing was saved"*, marking exactly where a real backend, a real email service, or real sign-in will need to take over.

Where the prototype's own message describes what the real, finished version should do, that description is written here as a requirement, not just as a note.

### 1.2 Scope

The product is a **free, self-paced online learning platform**. It offers short modules, made of video and written lessons, on green-growth subjects, open to anyone. Each lesson ends with a short multiple-choice quiz, and finishing a whole module earns a certificate that can be checked. The exact subjects covered, how many modules there are, and how deep each one goes are content decisions the client will make separately — this document describes the platform's *ability* to manage any number of modules and lessons, not a fixed, final list of them (see the note in §2.4 and the note at the start of §4).

The product has **four parts**, and this document covers all of them:

1. A **public marketing website** — convinces a visitor to sign up.
2. A **learner (student) portal** — where a signed-up learner studies, takes quizzes, and collects certificates.
3. An **lecturer console** — where a subject expert writes and keeps up to date the material for the module(s) they are assigned to.
4. An **administration console**, with two levels of access (*Administrator* and *Super Administrator*) — where the platform's people, modules, moderation, certificates, and settings are managed.

The platform has no payment feature, no advertising, and no way of making money of any kind — this rule applies to every requirement below, and nothing should ever break it.

### 1.3 Definitions, Acronyms and Abbreviations

| Term | Meaning |
|---|---|
| **Module** | One of the platform's top-level courses. It stands on its own — a learner does not need to finish any other module first. How many modules exist, what they cover, and their content are decisions for the client to make, not fixed by this document. |
| **Lecture** | One lesson inside a module. It includes a short video and/or written material, files to download, and ends with a quiz and, optionally, written questions. |
| **Content block** | One piece of a lecture's body: a *video* block, a *text* block, or a *materials* block. A lecture is simply an ordered list of these. |
| **Quiz** | The four-question, multiple-choice test that closes a lecture. |
| **Written questions** | An *optional* second, short-answer step a lecturer may add to a lecture on top of its quiz — up to four questions, each answered in two or three sentences and checked automatically for required words and phrases (see §4.6a, §4.11a). Most lectures have none. |
| **Certificate** | The proof of completion given automatically once a learner has finished every lecture and passed every quiz — and every lecture's written questions, where it has any — in a module. |
| **Learner** | Anyone using the student portal to sign up and study. Not a "staff" role. |
| **Staff** | A general word for the three console roles: Super Administrator, Administrator, Lecturer. |
| **Console** | Either staff-facing app (the Lecturer console or the Admin console), as opposed to the learner portal. |
| **Capability** | One named permission (for example `manageModules`, `readAuditLog`) that is checked against a staff member's role before an action is allowed. |
| **The Platform** | This product as a whole, covering all four parts. |
| **MoSCoW priority** | **M**ust have / **S**hould have / **C**ould have — marks how important each requirement is to build. |

### 1.4 References

- The working prototype's code (Next.js 15 / React / TypeScript), fully reviewed to write this document.
- `docs/seasonal-hero.md` and `docs/performance-backlog.md` — existing engineering notes on two parts of the system (the animated hero section, and how animation adjusts to slower devices), mentioned again in §10.
- `lib/brand.ts` and `lib/permissions.ts` — the two files that hold the single, correct version of the brand identity and the role/permission model.

### 1.5 Document Overview

Section 2 describes the product at a high level. Section 3 describes its different types of users. Section 4 is the main part of the document: every functional requirement, grouped by feature area and screen, each with its own requirement ID and MoSCoW priority. Section 5 describes the *shape* of the lesson content the platform must support, without saying what that content actually is. Section 6 brings together the business rules that repeat across many screens into one final list. Section 7 gives the full permissions table. Sections 8–10 cover data, outside interfaces, and non-functional requirements. Section 11 lists everything the prototype does **not** yet cover on purpose, so it is understood as future work rather than something missed. The appendices carry a note on the prototype's sample data, a full list of every screen, a glossary, and a list of decisions still open for the client to make.

---

## 2. Overall Description

### 2.1 Product Perspective

This is a brand-new, stand-alone product — there is no earlier system it replaces, and it does not connect to any existing organisation's system at launch. It is built as a modern web app, delivered as a single responsive site that serves all four parts (marketing, learner portal, lecturer console, admin console) from one codebase, with access controlled by sign-in and role rather than by separate apps.

The current prototype is **front-end only**: every page, form, table, and chart is fully built and works on screen, but all the data is fixed sample data built into the app, and every action that would normally save something to a server (signing up, saving a profile, publishing a lecture, checking a review, cancelling a certificate, changing a setting…) is only pretend — the screen completes the action and clearly says that nothing was actually saved. Turning this into the real, live system means building the backend, sign-in, storage, and email/notification services described throughout this document, sitting behind a front end that, in most cases, does not need to change.

### 2.2 Product Functions (Summary)

At a high level, the platform must:

- Show the module catalogue and explain what the platform offers to a visitor who has not signed up yet, and turn them into a signed-up learner.
- Let a learner create a free account, confirm their email, sign in, join any number of modules, work through lessons at their own pace, take quizzes with no limit on attempts, and get a certificate automatically — one that never expires and can be checked — as soon as they finish a module.
- Let an **lecturer** write and keep up to date the lessons and quizzes for the module(s) they are assigned to, use a shared, platform-wide library of files, and see how learners are doing on their own material — without being able to see anything outside their own assignment.
- Let an **administrator** run the platform day to day: create and publish modules, appoint and assign lecturers, manage the list of learners, check submitted reviews before they go public, and manage (specifically, cancel) certificates.
- Let the **super administrator** — there is exactly one such account — do everything an administrator can do, plus add or remove other administrator accounts, read a permanent log of every important action taken on the platform, and set the platform-wide rules (pass mark, review policy, how long data is kept, and so on) that every other role can see but not change.

### 2.3 Operating Environment

A responsive web app, used through desktop, laptop, and mobile browsers, on a wide range of device power and connection quality — including older machines and slower connections, which is treated as a main design concern, not a rare edge case (see §10.1). A separate mobile app is not part of this project.

### 2.4 Design and Implementation Constraints

- **No sponsor branding.** Nothing in the finished product — text, images, colours, or hidden page details — may show who is behind it. The brand identity (name, slogan, contact address) is a placeholder held in one settings file, so it can be swapped for the client's chosen brand without a rewrite.
- **Free, always.** No requirement in this document, now or in future, should add billing, a paid tier, or lock any content behind payment. This is a core rule of the product, not just today's price.
- **English at launch; Sinhala and Tamil are planned**, and the system (content structure, settings, footer/legal text) is built so all three languages can run side by side once the translated content exists (see §11).
- **One shared visual design** (a light, magazine-style layout with a teal/amber colour scheme, one shared font for headings and body text, and a carefully chosen amount of motion) has already been approved by the client through the prototype and should be carried into the finished product largely as built, rather than redesigned.
- **Every content record in the prototype is sample data only, not a requirement.** Module titles and subjects, lecture counts and lengths, quiz questions, and every learner/lecturer/administrator record shown are sample data used to show how the platform behaves — they are not a description of what the real catalogue, content, or user base must contain. Wherever this document needs to describe such a screen, it describes the *mechanism* (for example, "a module has a title, a level, and a set of lectures") rather than the prototype's specific sample values. See the note at the start of §4.

### 2.5 Assumptions and Dependencies

- Building the real, finished version assumes a normal web backend (an API, a database, sign-in, file storage, and email) will be built behind the front end that already exists; this document describes the *behaviour* that backend must support, not the technology it should be built with.
- Real video hosting/streaming, real file storage for downloadable files, and a real Google sign-in connection are assumed but not yet built (see §11).
- The learner's certificate is assumed to need no physical, hand-signed signature — a reference number that can be checked online is the entire way it is trusted (§4.8, §6).

---

## 3. User Classes and Characteristics

| User class | Who they are | Main goal | Key limit |
|---|---|---|---|
| **Visitor** | Anyone reaching the public site who has not signed up yet. | Understand what the platform offers and decide whether to join. | No account, no access beyond the marketing site. |
| **Learner** | Any member of the public. No earlier qualification is assumed; they may be using a low-powered device or a slow connection. | Learn a subject at their own pace and come away with proof that they did. | Signs up alone; no approval step, no sponsor needed, no fee, ever. |
| **Lecturer** | A subject expert appointed by an administrator to write material. | Write, update, and maintain the lessons and quizzes of the module(s) they are assigned to; understand how well their own material is working. | Can never see learners, files, or modules outside their own assignment; cannot assign themselves to a module. |
| **Administrator** | Runs the platform's day-to-day work. Appointed by someone else, not self-signed-up. | Publish modules, appoint lecturers, manage the list of learners, check reviews, manage certificates. | Cannot appoint another administrator and cannot read the permanent action log — those two things belong to the super administrator alone. |
| **Super Administrator** | Owns the platform. Exactly one account exists. | Everything an administrator can do, plus add/remove administrators, read the permanent action log, and set platform-wide rules. | This account is the platform's one final point of responsibility; it cannot be created or removed from inside the console itself. |

One person may fairly hold more than one of these roles at once (for example, the platform's owner may also be a lecturer on a module they wrote themselves); when staff sign in, the system must therefore ask **which portal** they want to enter, rather than guess (see FR-AUTH-050).

---

## 4. System Features — Functional Requirements

Each requirement below has a stable ID (`FR-<area>-<number>`) and a priority (**M**ust / **S**hould / **C**ould). IDs are numbered in steps of ten so related requirements can be added later without renumbering everything that comes after them.

> **Note on sample data.** The prototype this section is based on comes with sample content — specific module titles, lecture counts, hours, and sample learner/lecturer/administrator records — used only to make the screens work for a demo. None of that *content* is a requirement, and no specific module, lecture, or user record from the prototype should be treated as confirmed. Every requirement below describes the *mechanism* a screen must offer, not the prototype's current sample values. (Quiz *rules* — the number of questions, the pass mark, and the attempt rules in §4.6 — are a different matter: they are settings the platform can be configured with, carefully chosen and explained in §6, not incidental sample content, so they are written here with their current default values.) The client's real curriculum and catalogue are expected to differ from the prototype and will be defined separately, as content.

### 4.1 Public Marketing Website

**Purpose:** turn a visitor who has not signed up into a signed-up learner. One long landing page plus the account sign-up flow.

| ID | Requirement | Pri. |
|---|---|---|
| FR-MKT-010 | The landing page shall show, in order: an opening statement of what the platform is; a scrolling strip of the subjects it covers; why the platform exists; the module catalogue; how the learning process works; what the certificate is worth; who the platform is for; frequently asked questions; and a single closing call to sign up. | M |
| FR-MKT-020 | The opening section shall show the platform's live totals — number of modules, number of lectures, total hours of material, and "free" as the cost — worked out from the current catalogue so these figures always match what a learner actually sees. | M |
| FR-MKT-030 | The module catalogue on the landing page shall list every published module with its title, level (Foundation or Intermediate), a one-line summary, the topics it covers, its lecture count and length, and shall let the visitor open any one of them in place to see the full topic list and a "Join for free" button. | M |
| FR-MKT-040 | The site shall show a five-step "how it works" explanation of the learner's journey — create an account, join a module, work through lessons at your own pace, pass the quizzes (no limit on attempts), earn the certificate — and shall describe the journey this same way everywhere else on the site. | S |
| FR-MKT-050 | The site shall show at least six FAQ items covering: cost, whether earlier subject knowledge is needed, how much time it typically takes, what the certificate proves, whether groups or departments can join together (currently only single sign-up is offered — see §11), and which languages the material is available in. | S |
| FR-MKT-060 | Every main button on the marketing site ("Get started", "Join for free", "Create your free account") shall lead to account sign-up; every second-level button ("Sign in") shall lead to learner sign-in. A separate, clearly marked way in for staff shall exist and shall never be the main button shown anywhere on the public site. | M |
| FR-MKT-070 | The header and footer shall appear, unchanged, on every marketing page, linking to the catalogue, "how it works", the certificate explanation, FAQs, account sign-up and sign-in, and a support contact address. | M |
| FR-MKT-080 | Separate, linkable pages for each module's details (with their own web addresses, not just an in-place expand on the landing page) shall be built for the finished product — the prototype uses an expand-in-place accordion only because no such separate pages exist yet to link to (see §11). | S |

### 4.2 Learner Account Creation, Verification and Sign-In

| ID | Requirement | Pri. |
|---|---|---|
| FR-AUTH-010 | Sign-up shall ask for exactly five things: full name (as it should appear on certificates), email address, a password, an optional "where you work" category, and a required tick-box agreeing to the terms of use and the privacy notice. No other field (department, phone number, national ID number, home address) shall be asked for at sign-up. | M |
| FR-AUTH-020 | "Where you work" shall never affect what a learner is allowed to join; its only stated purpose is to help decide which future modules to build. | M |
| FR-AUTH-030 | Sign-up shall offer a one-tap "Continue with Google" option, shown above and before the email/password form. | S |
| FR-AUTH-040 | A password field being *set* (at sign-up, and when changing a password in Settings) shall show a live strength meter and require at least 8 characters for a learner account. A password field being *typed in* to sign in shall not show a strength meter or check its length. | M |
| FR-AUTH-050 | After sign-up, the learner shall be taken to an email-check screen that names the address a confirmation link was sent to, offers to resend it (with a 30-second wait between each send) with a link that stays valid for 24 hours, and offers a way to go back and correct the address. | M |
| FR-AUTH-060 | Learner sign-in shall ask for exactly two things (email, password), offer the same one-tap Google option, offer "keep me signed in on this device", and offer a way to reset a forgotten password without help from anyone. | M |
| FR-AUTH-070 | A separate sign-in screen, not aimed at learners, shall exist for staff to "sign in to the console". It shall not offer self-sign-up or a Google sign-in option, since staff accounts are set up by an administrator, not created by the person themselves; its password-recovery text shall tell the person to contact their administrator rather than offering a self-service reset link. | M |
| FR-AUTH-080 | When a staff member signs in successfully, if their account holds more than one role (for example, both super-administrator **and** lecturer on a module they wrote), the system shall ask which portal to enter, rather than guessing; the choices offered shall be limited to only the roles that account actually holds. | M |
| FR-AUTH-090 | Real terms-of-use and privacy-notice pages, linked from sign-up, shall be written and published (they are currently placeholder links — see §11). | M |

### 4.3 Learner Dashboard

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-010 | On signing in, the learner shall land on a dashboard whose first and most noticeable part, when there is one, is a "continue" card for the module they most recently made progress on but have not yet finished — showing the next lesson, its length, and a one-click button to carry on. This card shall not appear if nothing is currently in progress. | M |
| FR-STU-020 | The dashboard shall show four running totals: modules joined, lectures completed, hours studied, and certificates earned. | M |
| FR-STU-030 | The dashboard shall show the learner's own joined modules as cards, with a "browse all" link to the full catalogue, and shall show a message inviting them to browse the catalogue if they have not joined anything yet. | M |
| FR-STU-040 | The dashboard shall show, in its own clearly marked area, every quiz for a lecture the learner has finished but not yet passed — this is the one thing on the platform that is genuinely still to do, since finishing a lecture's content and passing its quiz are tracked as two separate things (see BR-4). A message shall confirm when nothing is left to do. | M |
| FR-STU-050 | The dashboard shall show a short, newest-first list of recent activity (lectures finished, quiz results, certificates earned, new sign-ups), each one linking to the right page. | S |
| FR-STU-060 | The dashboard shall also show modules the learner has not yet joined ("room for another"), and shall leave this part out entirely once the learner has joined every module on the platform. | C |

### 4.4 Module Catalogue and Sign-Up (Learner-Facing)

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-070 | The learner-side catalogue shall list every module in one grid, whether joined or not, each one marked with a status label, and shall be filterable by All / In progress / Completed / Not started. A filter choice that would show zero results shall appear switched off rather than be hidden completely. | M |
| FR-STU-080 | Joining a module shall need no approval step and shall be possible for any number of modules at the same time; progress in each one is tracked completely separately from the others. | M |
| FR-STU-090 | A module's own page shall show: the topics it covers; every lecture in order, with each lecture's completion and quiz status; a progress ring/bar showing lectures completed and time studied against time left; and a certificate panel showing either the earned certificate, or exactly what is left (lectures to finish, quizzes to pass) before one is given. | M |
| FR-STU-100 | The main button on a module page shall read "Join and start" if not yet joined, "Continue" if in progress, or "Review" if completed, and shall always lead to the correct next lecture. | M |
| FR-STU-110 | A learner shall be able to leave a module themselves and later come back to it with their progress kept, as the platform promises. | S |

### 4.5 Lecture Content Consumption

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-120 | A lecture page shall show its content as an ordered set of blocks of three possible kinds — a video lesson, a piece of writing, or a set of files to download — in whatever order the lecture's own content sets, and shall always show exactly three learning aims for the lecture. | M |
| FR-STU-130 | **Opening a lecture is never locked.** A learner may open any lecture of any module they have joined, at any time, in any order, no matter what else has or has not been finished — there is no padlock on the module contents list. **Advancing past a lecture is the one exception**: the "next lecture" action on a lecture's own page is withheld until that lecture's own quiz is passed and, where the lecture has any, its written questions are passed too (see §4.6, §4.6a). This is a deliberate, narrow gate — it blocks one button, not the platform's browsing — and no future requirement should extend it into locking the contents list itself. | M |
| FR-STU-140 | A lecture page shall let the learner mark the lecture as finished, and this shall be reversible (a learner may un-mark a lecture they finished by mistake). This marker is informational only and is never what the "next lecture" gate in FR-STU-130 checks. | S |
| FR-STU-150 | A lecture page shall show, and let the learner go directly to, the previous and next lecture in the module, and shall show every lecture in the module in a list that stays visible, with each one's completion, quiz, and (where it has any) written-question state marked. When the "next lecture" gate (FR-STU-130) is not yet cleared, the next-lecture control shall say so plainly rather than simply being absent. | M |
| FR-STU-160 | Marking a lecture as finished is completely separate from passing its quiz (or its written questions) — a lecture can be "done" even though its quiz has not been tried, or was failed — and this state must be visible and clickable, both on the lecture page and in the still-to-do panel described in FR-STU-040. | M |
| FR-STU-170 | Real video hosting/playback and real delivery of downloadable files shall be built for the finished product (the prototype has a working video player with no real video file behind it, and download buttons that do nothing — see §11). | M |

### 4.6 Quiz Engine

**Purpose:** the closing test for every lecture. Works the same way across the whole platform.

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-180 | Every lecture's quiz shall consist of exactly four multiple-choice questions, each with four options and exactly one correct answer. | M |
| FR-STU-190 | The platform-wide pass mark shall be a single percentage that can be changed by the super administrator (currently 70%), applied the same way to every quiz on the platform — it shall never be set separately for one lecture or one module, so a certificate means the same thing no matter which lecture it passed through. | M |
| FR-STU-200 | A learner shall have **no limit on the number of attempts** at any quiz, with **no time limit**, and their **highest score so far** shall be the score that counts towards earning the certificate. | M |
| FR-STU-210 | A quiz shall show one question at a time with a progress indicator and previous/next buttons, and shall refuse to submit until every question has been answered, showing a clear message on screen explaining why. | M |
| FR-STU-220 | On submitting, the learner shall immediately see their score and whether they passed or failed against the platform's pass mark, and how many questions were correct out of how many. **No correct answer, no chosen-option marking, and no explanation is ever shown to the learner** — not on the result screen, not anywhere else in the student portal, for any question, whether it was answered correctly or not. A question bank is reused across lectures and across every retake (see §5), so revealing one answer once would leak it permanently; explanations exist only for staff, in the lecturer and admin consoles (FR-INS-120). | M |
| FR-STU-230 | A learner shall be able to retake a quiz at any time from the result screen, the lecture page, or the quizzes list, with no penalty and no waiting period. | M |
| FR-STU-240 | A dedicated "quizzes" list shall show every quiz across every module the learner has joined, grouped by module, showing for each one whether it is: passed; needs a retake (with the failing score shown against the pass mark); finished lecture but quiz never tried; or quiz available but lecture not yet finished — and every one of these shall stay clickable and able to be attempted (see FR-STU-130), plus a marker on any row whose lecture also carries written questions and whether those are passed. | M |
| FR-STU-250 | Every quiz attempt and its resulting score must be saved against the learner's account on the server once the real system is built (the prototype clearly states that no attempt is currently saved). | M |

### 4.6a Written Questions Engine

**Purpose:** an *optional* second, short-answer check on top of a lecture's quiz, for the lectures where a lecturer judges that multiple choice cannot tell whether an explanation actually landed. Most lectures carry none of these.

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-201 | A lecture may carry zero to four written questions, each asking for a short, free-text explanation (two or three sentences — never an essay, and never graded as one). Where a lecture has none, nothing about it changes from today's quiz-only flow. | M |
| FR-STU-202 | Written questions shall only be reachable after the same lecture's quiz has been passed — they are a second step, not an alternative one — and a learner who reaches the page directly without a passed quiz shall be shown why and offered the quiz, not a broken or empty screen. | M |
| FR-STU-203 | Each written answer shall be checked **automatically, the instant it is submitted**, against the required words and phrases the lecturer attached to that question (see FR-INS-121a) — there is no lecturer review queue and no waiting period. | M |
| FR-STU-204 | On submitting, the learner shall immediately see the same kind of result as the quiz - a score, a pass/fail, and how many of the written questions passed. **No model answer and no per-question pass/fail is ever shown to the learner**, on the same rule as FR-STU-220; a model answer is a staff-facing fact (FR-INS-121a), not a learner-facing one. | M |
| FR-STU-205 | The pass mark for written questions is the same single, platform-wide percentage used for the quiz (FR-STU-190) — the proportion of a lecture's written questions passed must reach it. There is no limit on attempts and no time limit, matching FR-STU-200. | M |
| FR-STU-206 | Where a lecture has written questions, the "next lecture" gate described in FR-STU-130 is cleared only once **both** the quiz and the written questions are passed; the quiz result screen shall lead to the written questions rather than to the next lecture in that case. | M |

### 4.7 Certificates (Learner-Facing)

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-260 | A certificate for a module shall be **given automatically, straight away**, the moment a learner has finished every lecture and passed every lecture's quiz — and, for any lecture that has them, its written questions — in that module. There is no request, approval, or manual step for the learner to take. | M |
| FR-STU-270 | Each certificate shall show: the holder's name **as entered separately for certificates** (different from the display name used elsewhere in the portal), the module title, lectures completed, average quiz score, hours of material, the date it was given, and a unique reference number that is easy to read. | M |
| FR-STU-280 | A certificate shall never expire, shall be exactly one per completed module, and shall stay downloadable — and re-downloadable — by the learner at any later date. | M |
| FR-STU-290 | Changing the "name on certificates" field after a certificate has already been given shall not change that certificate after the fact — only certificates given after the change shall show the new name. | M |
| FR-STU-300 | A learner shall be able to export or print their certificate as a document suitable for attaching to a job application or a proposal, and shall be able to copy a direct link to it. | M |
| FR-STU-310 | Anyone holding a certificate reference number — not only the person it belongs to — shall be able to check it against a public lookup that confirms the module, the holder, and the date, and nothing else. This public lookup page does not yet exist in the prototype and must be built for the finished product (see §11); it is a promise the platform's own marketing and certificate text already makes directly. | M |
| FR-STU-320 | A certificate's detail page shall invite the learner to leave a rating (1–5 stars, required) and an optional written review for that module; submitting shall be blocked until a star rating is chosen. Submitted reviews go into a review queue and are not shown to the public until an administrator approves them (see FR-ADM-190). | S |
| FR-STU-330 | A certificates list shall show, in two separate parts, what has been earned (with a message if nothing has yet) and, for every module joined but not finished, how close the learner is and a direct link to carry on. | S |

### 4.8 Learner Profile and Settings

| ID | Requirement | Pri. |
|---|---|---|
| FR-STU-340 | A **Profile** screen shall hold identity information: display name, the (separately editable) name printed on certificates, email address, and optional work details (role, organisation, sector, district) that never affect what the learner can join. It shall also show read-only facts about their learning (member since, modules joined, lectures completed, hours studied, certificates) and a short note on what personal data the platform keeps. | M |
| FR-STU-350 | A separate **Settings** screen shall hold preferences about how the platform behaves, kept clearly apart from identity: email notification switches (progress/certificates, new modules, product news), how often study reminders are sent, a language choice (English now; Sinhala and Tamil marked "coming soon"), and a form to change password. None of these preferences shall affect what the learner has joined or already completed. | S |
| FR-STU-360 | Settings shall offer account deletion behind a two-step confirmation, and shall state clearly and correctly that deleting the account removes the learner's memberships and progress, but **does not** cancel certificates already given — those stay valid under their reference number even though the former learner can no longer download them from a deleted account. | M |

### 4.9 Lecturer Console — Dashboard and Module Management

| ID | Requirement | Pri. |
|---|---|---|
| FR-INS-010 | A lecturer's console shall be limited entirely to the module(s) an administrator has directly assigned them to. A lecturer with no assignment shall see a clear "nothing here yet" message, not an error, and shall have no way to assign themselves a module. | M |
| FR-INS-020 | The lecturer dashboard shall sum up, across their assigned modules only: lectures still to write, lectures waiting for review, quizzes worth a closer look (see FR-INS-070), uploaded files not yet used anywhere, lectures published, learners reached, and average module rating. | M |
| FR-INS-030 | A lecturer shall be able to list their assigned modules and open any one to see its lectures, each showing its state (Not started / Draft / In review / Published), files attached, a link to its quiz, its author, and when it was last updated. | M |
| FR-INS-040 | Creating and publishing a module is **for administrators only**; a lecturer may create, edit, and publish *lectures* by themselves within a module they are assigned to, but may never create a module or change whether a module itself is published or in draft. A draft module (no matter what state any of its lectures are in) is never visible to a learner. | M |
| FR-INS-050 | A lecturer shall be able to add a new lecture to an assigned module, giving it a title and an estimated study time; the lecture shall start out empty, in Draft state, numbered automatically as the next one in order — lecture numbers are never chosen by hand. | M |

### 4.10 Lecturer Console — Lecture Content Authoring

| ID | Requirement | Pri. |
|---|---|---|
| FR-INS-060 | The lecture editor shall let a lecturer add, edit, and remove content blocks of two kinds — a video block (title, the recording itself, its length, a short caption) and a written block (heading, body text) — and the order the blocks appear on screen is the order a learner will read them in. | M |
| FR-INS-070 | Removing a content block, or deleting a lecture completely, shall require a clear two-step confirmation naming exactly what will be lost — never a plain "Are you sure?" — and shall correctly say that learners already past that point keep the progress they already made. | M |
| FR-INS-080 | A lecture's publishing state (Draft / In review / Published) shall be changeable by the lecturer themselves for their own material — a lecturer does not need an administrator's approval to publish a lecture. Moving a lecture to "In review" is instead offered as an **optional** step for anything that makes a claim about policy or money, not something forced on every lecture. | M |
| FR-INS-090 | Deleting a lecture shall renumber the lectures that come after it and shall show up in the progress of every learner already part-way through the module; any files it used stay in the shared library either way. | M |
| FR-INS-100 | Real tools for adding video and formatted text — real video upload/processing and a real text editor — must be built for the finished product; the prototype shows the screen these tools will live in, without a working uploader or editor behind it. | M |

### 4.11 Lecturer Console — Quiz Authoring

| ID | Requirement | Pri. |
|---|---|---|
| FR-INS-110 | A quiz cannot be written until its lecture has content — writing the quiz is a separate step that comes after the content, not alongside it. | M |
| FR-INS-120 | The quiz editor shall let a lecturer add, edit, and remove questions; each question shall need a prompt, exactly four answer options, one of them marked correct with a single-choice control (not a checkbox), and a required explanation. A learner attempting the quiz sees the prompt and the four options, same as always, but never which option is marked correct and never the explanation - those stay visible to the lecturer and to administrators only. See FR-STU-220. | M |
| FR-INS-130 | Removing a question shall need confirmation and shall state that learners who already answered it keep their earlier attempt — only future attempts see the changed set of questions. | S |
| FR-INS-140 | Platform-wide quiz rules (number of questions, pass mark, no limit on attempts, no time limit) shall be shown to the lecturer as read-only facts on the quiz screen, with a clear note that only the super administrator can change them — a lecturer cannot set a different pass mark or attempt limit for their own quiz. | M |
| FR-INS-150 | Any quiz whose pass rate falls below a set "needs attention" level, or whose average score falls below the platform pass mark, shall be clearly flagged to the lecturer (and, as a combined figure, to administrators) as likely to have a wrong or unclear question, rather than reflecting a weak group of learners — since attempts are unlimited, a pass rate that stays low over time is a sign about the content, not the learners. | S |
| FR-INS-160 | A lecturer shall be able to clear (reset) recorded attempts for a quiz after fixing a question, with a clear statement that this clears scores but never takes back a certificate already given based on an earlier attempt. | S |
| FR-INS-170 | A dedicated "quizzes" list shall show every quiz a lecturer is responsible for, ranked with the weakest pass rate first, so the quiz that most needs attention is always the first thing seen, and shall mark which of those lectures also carry written questions. | S |

### 4.11a Lecturer Console — Written Question Authoring

**Purpose:** letting a lecturer add the optional short-answer step described in §4.6a to a lecture they are responsible for, on the same screen as that lecture's quiz.

| ID | Requirement | Pri. |
|---|---|---|
| FR-INS-121 | Written questions are entirely **optional**, up to **four per lecture**, and shown in their own section of the quiz screen — a lecture with none shall show a plain empty state explaining that most lectures do not need them, never a prompt nagging a lecturer to add some. | M |
| FR-INS-121a | Each written question shall need: a prompt asking for a short (two-to-three-sentence) explanation; a list of the specific words and phrases a correct answer would use; how many of those must appear for an answer to pass (never all of them, since a real answer paraphrases); and a model answer. The model answer, and the required words and phrases, are visible to the lecturer and to administrators only - a learner is told only whether their own answer passed, never what a correct one would have said. See FR-STU-204. | M |
| FR-INS-121b | The lecturer authoring screen shall state plainly, next to the "add a written question" control, that writing even one written question turns on a **mandatory second step** a learner must clear, alongside the quiz, before the next lecture opens (see FR-STU-206) — this consequence must be visible where the decision is made, not only in a policy document. | M |
| FR-INS-122 | A lecturer shall be able to edit and remove a written question the same way as a quiz question (FR-INS-120, FR-INS-130): removing one shall need confirmation, and shall state that learners who already passed it keep that pass. | S |
| FR-INS-123 | The same platform-wide rules that apply to the quiz (one pass mark, no attempt limit, no time limit — FR-INS-140) apply to written questions too, shown as read-only facts on the same screen. | M |

### 4.12 Shared Materials Library

**Purpose:** one platform-wide shelf of downloadable and reference files, used by lecturers when writing lessons and by administrators when checking them. Works the same way in both the Lecturer and Admin consoles.

| ID | Requirement | Pri. |
|---|---|---|
| FR-LIB-010 | Files shall be uploaded once into a single shared library, organised into named groups ("shelves"), and **linked to lectures rather than copied** — never duplicated for each lecture. Replacing a file (uploading a new version under the same library entry) shall update every lecture that links to it; the library shall discourage uploading a "second copy" of a file that already exists. | M |
| FR-LIB-020 | **Any staff member may link any file, from any group, to any lecture they are writing — in any module.** No file or group belongs only to one person or one module; the only fair reason to block a link is if the file is *already linked to that exact same lecture being edited* — never because it is used somewhere else. No future requirement, screen text, or warning message may add or imply a stricter rule than this. | M |
| FR-LIB-030 | Where a file is used shall be **worked out automatically** by checking the current curriculum for lectures that link to it — never written down and kept up to date by hand — so the "used in" list can never claim a lecture uses a file it does not actually link to. | M |
| FR-LIB-040 | A lecture editor shall offer two clearly separate actions: linking a file that is already in the library to the lecture being edited, and uploading a brand-new file into the library (which goes into the library only — linking it to a lecture afterwards is a separate step). | S |
| FR-LIB-050 | Uploading a new file shall require a title (unique across the whole library — the title is what is used to identify where a file is used, so no two entries may share one) and a group to belong to; the group is required, so files do not pile up in one unsorted, catch-all place. | M |
| FR-LIB-060 | Linking a whole group ("shelf") of files to a lecture in one action shall copy in the group's current contents as they are at that moment — files added to the group afterwards shall not automatically appear on lectures that linked it earlier. | S |
| FR-LIB-070 | The library's main page shall show totals (files, groups, total links, files never used, recently added) and let staff search and filter the whole library; a file uploaded but never linked to anything shall be clearly flagged so it can be linked or removed. | S |

### 4.13 Lecturer Console — Learner Progress Visibility

| ID | Requirement | Pri. |
|---|---|---|
| FR-INS-180 | A lecturer shall see the progress of every learner enrolled in their own **published** modules only — never learners of a draft module (since none exist yet), and never any learner or module outside their own assignment. A learner enrolled in two of a lecturer's modules shall appear as two separate progress rows, not combined into one. | M |
| FR-INS-190 | Lecturer-facing learner views shall show only progress facts — name, module, percentage/lectures complete, average score, last active — plus a direct way to email the learner. They shall **never** show an employer, district, account status, or any admin action (suspend, reset). Those belong to an administrator alone to see and act on. | M |
| FR-INS-200 | A single learner's detail view, where offered to a lecturer, shall be limited to the lecturer's own modules and shall be completely blocked (not just hidden) for any learner not enrolled in one of them. | M |

### 4.14 Lecturer Console — Profile and Settings

| ID | Requirement | Pri. |
|---|---|---|
| FR-INS-210 | A lecturer's profile shall keep what a learner sees about them (display name, field/title, a short optional bio) separate from their private account settings (email, password, notification preferences, language, session controls) — as two separate screens. | S |
| FR-INS-220 | Module assignment shall be shown to the lecturer as **read-only**, naming who to contact (the administrator who assigned them) to ask for a change — a lecturer can never assign themselves to, or remove themselves from, a module. | M |
| FR-INS-230 | Lecturer notification preferences shall cover only their own material: a learner leaves a review, a module assignment changes, one of their quizzes' average score drops below the pass mark, another lecturer links their uploaded file, and a weekly progress summary. None of these shall send an email to a learner. | C |
| FR-INS-240 | A lecturer account is closed only by an administrator, never by the lecturer themselves; lectures a lecturer wrote stay published and keep their name on them after the account is closed. | S |

### 4.15 Admin Console — Dashboard and Analytics

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-010 | The admin dashboard shall show, in this order of importance — **things waiting for action first, then key numbers, then charts**: reviews waiting to be checked, lectures waiting for review, lecturers with no module assigned, and suspended learner accounts — each one linking straight into the screen that fixes it. | M |
| FR-ADM-020 | Headline numbers shall include registered learners, learners active in the last 30 days, total sign-ups to modules, and total certificates given, each shown with how much it changed compared to last month. | M |
| FR-ADM-030 | The dashboard shall chart monthly sign-ups and monthly completions over the platform's whole history, the state of all sign-ups across the platform (completed / in progress / not started), and sign-ups by module — with the current, not-yet-finished month clearly marked, so a normal mid-month dip is never mistaken for a real drop. | M |
| FR-ADM-040 | The dashboard shall list the most recently registered learners and the most recently updated lectures across the whole platform, plus a breakdown of learners by the work sector they told us they belong to. | S |
| FR-ADM-050 | Every number shown across admin dashboards and reports must match the platform's own official totals — the finished product must work these out from one shared source, never keep a separate copy on each screen. | M |

### 4.16 Admin Console — Module Lifecycle Management

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-060 | An administrator (or super administrator) shall be able to create a new module — title, a short summary of its purpose, level, and optionally one or more lecturers — which always starts out in **Draft** state, hidden from learners until it is directly published. | M |
| FR-ADM-070 | A draft module's detail view shall leave out sign-up/completion/rating numbers (rather than showing zeroes, which could wrongly look like a live module that is failing) and shall clearly flag if it has no lecturer assigned. | S |
| FR-ADM-080 | An administrator shall be able to switch a module between Published (in the catalogue, open to sign-up) and Draft (hidden; learners already enrolled keep full access and their progress). | M |
| FR-ADM-090 | An administrator shall be able to archive a module, behind a confirmation that clearly states what happens: archiving hides it from the catalogue for good, but **certificates already given for it stay valid** — something that has already happened stays true even after the module is later taken down. | M |
| FR-ADM-100 | An administrator shall be able to view (but, per FR-INS-060/080, not write) every lecture's content, quiz, and written questions (where it has any) to check them, and shall be able to change a lecture's own publishing state where the platform's review process calls for an administrator's approval. | S |

### 4.17 Admin Console — Lecturer Management

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-110 | An administrator shall be able to invite a new lecturer (name, email, field, optionally one or more starting module assignments) — an invitation is the only way to create a new lecturer account; lecturers can never sign themselves up. | M |
| FR-ADM-120 | An administrator shall be able to change which module(s) a lecturer is assigned to at any time. Removing an assignment shall show a clear warning that it does not delete or unpublish anything the lecturer already wrote — it only stops them from editing it further. | M |
| FR-ADM-130 | An administrator shall be able to suspend a lecturer's account; suspension blocks console sign-in but clearly does **not** unpublish lectures that lecturer already published. | M |
| FR-ADM-140 | The lecturer list shall show, for each one: assigned modules (draft ones clearly marked), lectures published vs. still to do, learners reached, last active date, and account status (Active / Invited / Suspended), and shall be filterable by these states. | S |

### 4.18 Admin Console — Learner Management

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-150 | An administrator shall be able to search and filter the full learner list (Active / Dormant / Suspended) and open any one learner's record. There is **no** "create learner" button here, on purpose — learners only ever sign themselves up through the public site. | M |
| FR-ADM-160 | A learner's detail record, as seen by an administrator, shall show their identity, sign-ups and progress, certificates, and admin actions — but shall **never** show quiz-answer-level detail, time spent on each lecture, or sign-in history. Administrators have a real reason to see *that* progress happened, but never a reason to see exactly how. | M |
| FR-ADM-170 | Admin actions available on a learner record shall include: sending a password-reset link (usable once, and time-limited), suspending or restoring the account (progress and certificates untouched either way), and exporting the full record as a single file, which a learner has the right to request. Every one of these actions shall be recorded, with the acting administrator's name, in the action log (see FR-SA-030). | M |

### 4.19 Admin Console — Certificate Management

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-180 | **There is no "give certificate" button anywhere in the admin console.** A certificate means exactly one thing — every lecture finished, every quiz passed — and that meaning must never be weakened by letting an administrator hand one out manually. If a learner has genuinely finished but no certificate exists, that is a bug in their progress record to fix at the source, not something to work around by issuing a certificate. | M |
| FR-ADM-190 | An administrator shall be able to **withdraw** an already-given certificate, which requires a reason that must be given and is kept on record permanently, and immediately stops that reference number checking out as valid in public. Withdrawing cannot be undone; a corrected certificate is given as a brand-new reference number, never by bringing back the old one. | M |
| FR-ADM-200 | The certificate list shall be filterable (Valid / Withdrawn) and shall show, for each certificate: reference number, learner, module, score, date given, and status; withdrawn certificates shall keep their reason, who withdrew them, and when, permanently. | S |

### 4.20 Admin Console — Review Moderation

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-210 | Reviews submitted by learners shall go into a review queue and shall not appear anywhere public until an administrator approves them (this is the default behaviour; it can be turned off — see FR-SA-060). | M |
| FR-ADM-220 | The queue shall run an automatic check (contact details, links, offensive language) that **flags** a review for closer attention but never rejects it automatically — a person must always make the final decision. Flagged reviews shall be shown at the top of the queue, ahead of everything else. | S |
| FR-ADM-230 | Approving a review shall need no reason given; **rejecting** one shall always require a written reason, which is recorded against the review and kept after the decision is made — approving simply agrees with what was already written, while rejecting is a decision someone may have to explain later, and this difference in treatment is deliberate. | M |
| FR-ADM-240 | A rejected review's reason is not shown to the learner who wrote it — they are only told that it was not published. | S |
| FR-ADM-250 | Reviews already decided (approved and rejected) shall stay visible to administrators, newest first, each one showing who decided and when. | C |

### 4.21 Super Administrator — Administrator Management

*Every requirement in this part of the document applies only to the Super Administrator role; an Administrator can neither carry out nor see the data behind any of them.*

| ID | Requirement | Pri. |
|---|---|---|
| FR-SA-010 | Only the super administrator may create, suspend, or otherwise manage other administrator accounts. This is the one thing the whole system of roles exists to protect: an account able to appoint more administrators could appoint its own replacement, and from that point on, no account on the platform truly answers to anyone. | M |
| FR-SA-020 | Every administrator account shall permanently record **who appointed it** (or that it is the platform's one founding account, appointed by no one) — a list of administrators that cannot answer "who let this account in" is not a useful check. | M |
| FR-SA-030 | **Exactly one super-administrator account shall exist at any time.** It cannot be created, suspended, or removed from inside the console itself — moving platform ownership to a different account is a deliberate, separate process, handled outside the console, never a button inside it. | M |

### 4.22 Super Administrator — Audit Log

| ID | Requirement | Pri. |
|---|---|---|
| FR-SA-040 | The platform shall keep a permanent log of important actions, readable **only** by the super administrator — the reasoning being that a log which the people it records about can read, filter, or argue with stops working as a real log. | M |
| FR-SA-050 | Every entry shall record: the person who did it (an entry is never credited to "the system" alone — every important action has a named human behind it), the action taken, what it was done to, in plain words, an optional detail line (what changed, from what, to what), and a timestamp to the minute. | M |
| FR-SA-060 | The kinds of action recorded shall include, at least: account creation/suspension/restoring, role changes, module creation/publishing/updates, lecture publishing, changes to lecturer assignments, review approval/rejection, certificate withdrawal, settings changes, and data exports. Simply viewing a page shall **never** be logged — a log of every screen someone opened is watching people, not holding them accountable, and would bury the events that actually matter. | M |
| FR-SA-070 | **Log entries shall never be changeable — not edited, not deleted, by anyone, including the super administrator** — and shall be kept for a fixed seven years, a period that cannot be shortened from inside the console. | M |
| FR-SA-080 | Exporting the action log for an investigation shall itself create a new log entry, so the export itself is tracked the same way as everything it contains. | S |

### 4.23 Platform Settings

*Can be read by both Administrator and Super Administrator; can be changed only by the Super Administrator. Administrators must be able to see every current setting (even ones they cannot change), so they can explain how the platform behaves to a learner without having to guess.*

| ID | Requirement | Pri. |
|---|---|---|
| FR-SA-090 | **General** settings: platform display name, support contact address, default and available languages, console time zone. | S |
| FR-SA-100 | **Sign-up** settings: whether registration is open, whether email confirmation is required before a first certificate can be given, whether learners may leave a module themselves, and any limit on how many modules a learner can join at once (default: no limit). | S |
| FR-SA-110 | **Certificate** settings: the platform-wide quiz pass mark (a single percentage applied to every quiz — raising or lowering it must never change certificates already given, even looking back), whether certificates are given automatically on completion, whether public checking is turned on, and the certificate reference prefix (changing it must never change the numbers of certificates already given). | M |
| FR-SA-120 | **Review** settings: whether reviews are held for approval by default, whether the automatic check (contact details/links/offensive language) is active, and whether an administrator is emailed when something is flagged. | S |
| FR-SA-130 | **Email** settings: whether a weekly learner progress summary is sent, whether new-module announcements are sent, and after how many days without activity a reminder email is sent (or never). | C |
| FR-SA-140 | **How long data is kept** shall be shown as fixed, information-only values, not editable from the console: learner records kept for as long as the account exists plus two years after it closes (to keep certificates checkable), action log kept for seven years (see FR-SA-070). | M |

### 4.24 Console Account: Profile and Sign-In (Lecturer and Admin)

| ID | Requirement | Pri. |
|---|---|---|
| FR-ADM-260 | A staff (console) password shall require at least **12 characters** — stricter than a learner account's 8, on purpose, since the difference reflects how much each kind of account can reach and affect. | M |
| FR-ADM-270 | Two-step sign-in (an extra code alongside the password) shall be available to every staff role and shall be **required** for the super administrator specifically. | S |
| FR-ADM-280 | A console session shall time out after **8 hours with no activity** — shorter than a learner's session, reflecting the greater risk of a console left signed in and unattended. | S |
| FR-ADM-290 | Each staff role's profile page shall show, in plain words, everything that role can and cannot do, so a new administrator or lecturer can immediately see the limits of their own access without needing to ask. | C |

---

## 5. The Curriculum — Content Model

The shape of the curriculum is itself a requirement, not just content, because it decides what the lecture editor and the learner-facing lecture page must be able to display.

| Rule | Detail |
|---|---|
| A **module** | stands on its own: it has a title, a one-line summary, a level (*Foundation* or *Intermediate*), a set of topics, a lecture count, and a total length in hours — and never depends on any other module being started or finished first. |
| A **lecture** | belongs to exactly one module, and has a number in sequence, a title, a type label (*video* or *reading* — describing what the lecture mostly is, not a strict category), a total estimated study time, a short, consistent list of learning aims (the prototype's sample content uses three per lecture, as a style choice, not a fixed system limit), and an ordered list of **content blocks**. |
| A **content block** | is one of: a **video** block (title, length, caption text standing in for the opening of the video); a **text** block (one heading, one passage — never a long, unbroken wall of text); or a **materials** block (a set of files/links taken from the shared library). |
| The **quiz** | belonging to a lecture is a fixed set of exactly four multiple-choice questions (see §4.6); it is written once the lecture has content, never before. |
| The **written questions** | belonging to a lecture are an *optional* set of zero to four short-answer questions (see §4.6a, §4.11a) — a lecture is complete without any, and most have none. |
| **Consistency rule** | the lecture count and total study hours a module advertises publicly must always match what its actual lectures add up to — this must be checked automatically as part of the finished product's content system, the same way it is checked automatically in the current codebase while it is being built. |

---

## 6. Business Rules (Consolidated)

The rules below repeat across many screens in the prototype and are brought together here as one final list. Every functional requirement above that touches one of these rules must stay consistent with it.

1. **Opening any lecture or module is never locked; advancing past one is, exactly once.** A learner may open any lecture of any joined module at any time, in any order (see FR-STU-130) — but the "next lecture" action on a lecture's own page is withheld until that lecture's quiz, and any written questions it has, are passed. This is the one gate on the platform, it blocks one button, and no future requirement may extend it into locking the module contents list itself.
2. **Every quiz on the platform shares one pass mark, one question count, no limit on attempts, and no time limit** — set once, for the whole platform, by the super administrator. No single quiz, lecture, or module may set its own different version of these. Written questions, where a lecture has them, share the same pass mark, attempt, and time rules (see FR-STU-190, FR-STU-205, FR-SA-110).
3. **The highest score ever reached on a quiz, not the most recent one, is the score that counts** towards earning the certificate.
4. **Finishing a lecture and passing its quiz (or written questions) are separate facts.** A lecture can be marked finished without its quiz being passed, and a quiz can be tried and passed even if the lecture has not been marked as read. The dashboard's "quizzes to take" panel exists specifically to show this gap.
5. **A certificate is given automatically, and only, by finishing a whole module** — every lecture finished, every quiz passed, and every written question set (where a lecture has one) passed. There is, and must always be, no manual "give certificate" button anywhere in the product.
6. **A certificate never expires, is exactly one per completed module, and stays valid even if**: the module it came from is later archived; the learner later changes their certificate-name preference; or the learner's account is later deleted. Only a clear, reasoned, permanently recorded withdrawal by an administrator can make one invalid.
7. **Any file or group in the shared library may be linked to any lecture, by any staff member writing it, in any module, with no limit.** No file or group belongs only to one person or one module — this must never be blocked, or made to sound blocked, in code, on screen, or in any written message.
8. **Files are linked, not copied.** Replacing a file's content updates every lecture that links to it; linking a whole group ("shelf") to a lecture copies its contents as they are at that moment, and does not stay updated afterward.
9. **A lecturer may only write for the module(s) an administrator has directly assigned them to** — never assumed, never chosen by the lecturer, and always changed only by an administrator.
10. **A lecturer may publish their own lectures without an administrator's approval**; moving a lecture to "in review" is an optional request for a second opinion, not something forced — except that a module itself can only ever be published or archived by an administrator, never by a lecturer.
11. **A draft module is completely hidden from learners**, no matter what state any of its individual lectures are in.
12. **Suspending an account (learner, lecturer, or administrator) only blocks sign-in** — it never deletes, hides, or unpublishes anything that account already made or earned, and it can always be undone.
13. **Only the super administrator may create or remove another administrator account, and only the super administrator may read the action log.** Exactly one super-administrator account exists at any time, and it cannot be created or removed from inside the console.
14. **The action log can only be added to, never changed or deleted** — no entry may ever be edited or removed by anyone, including the super administrator — and it never records simple browsing (page views), only actions that change something.
15. **Reviews are checked before they go public.** Approving needs no reason; rejecting always needs a reason that is kept on record. The automatic check brings reviews that look like they might be a problem to the top, for closer attention, but never rejects one by itself.
16. **Learner data shown to staff is kept to the minimum needed.** Lecturers see combined progress on their own modules, plus a direct way to email a learner, but no other contact details and no admin controls. Administrators see progress and account status, but never quiz-answer-level detail, time spent on each lecture, or sign-in history.
17. **The platform has no way to charge money, at any level, ever** — "free" is a core rule of the product, not just today's price.
18. **Nothing in the finished product may show who is behind it**, by name, logo, or brand colour — the platform's identity is a placeholder that can be swapped from one place.

---

## 7. Roles and Permissions Matrix

| Capability | Super Admin | Administrator | Lecturer |
|---|:---:|:---:|:---:|
| Sign in to a console | ✓ | ✓ | ✓ |
| Create / suspend administrator accounts | ✓ | — | — |
| Read the action log | ✓ | — | — |
| Change platform-wide settings | ✓ | (read-only) | (read-only, limited) |
| Create, publish, or archive a module | ✓ | ✓ | — |
| Appoint or suspend a lecturer | ✓ | ✓ | — |
| Change a lecturer's module assignments | ✓ | ✓ | — |
| View the full learner list | ✓ | ✓ | — |
| Suspend / reset / export a learner account | ✓ | ✓ | — |
| Approve or reject a review | ✓ | ✓ | — |
| Withdraw a certificate | ✓ | ✓ | — |
| View own assigned learners' progress | ✓ | ✓ | ✓ |
| Write (add/edit/publish) lectures and quizzes | — | (view-only) | ✓ (assigned modules only) |

*A capability that a role does not have is always shown in that role's console — greyed out, with the reason written next to it — rather than hidden completely, so a permission can be asked about, not just never discovered.*

---

## 8. Data Requirements

The finished backend must, at minimum, store the following kinds of record and the links between them (the field lists below are examples, not a complete list):

| Record type | Main fields | Linked to |
|---|---|---|
| **Learner** | name, certificate name, email, password/sign-in details, sector, organisation, district, date joined, status (active/dormant/suspended), notification and language preferences | many Enrolments; many QuizAttempts; many WrittenAttempts; many Certificates; many Reviews |
| **Module** | title, summary, level, topics, status (draft/published/archived), created/updated dates | many Lectures; many Enrolments; many Lecturer assignments |
| **Lecture** | number, title, type, study minutes, learning aims (3), content blocks, publishing state, author, last updated | belongs to one Module; has one Quiz; has zero or more WrittenQuestions; links to many Materials |
| **Content Block** | type (video / text / materials), fields specific to that type, order number | belongs to one Lecture |
| **Quiz / Question** | prompt, 4 options, which one is correct, explanation | belongs to one Lecture |
| **WrittenQuestion** | prompt, required keywords/phrases, minimum keywords needed to pass, model answer | belongs to one Lecture (zero to four per lecture) |
| **Enrolment** | learner, module, date joined, current lecture, list of completed lectures | links a Learner to a Module |
| **QuizAttempt** | learner, lecture, score, pass/fail, timestamp | belongs to one Learner, one Lecture |
| **WrittenAttempt** | learner, lecture, per-question answer text and pass/fail, overall score, timestamp | belongs to one Learner, one Lecture (only where that lecture has WrittenQuestions) |
| **Certificate** | reference number (unique, in the form e.g. `[PREFIX]-[YEAR]-[MODULE CODE]-[NUMBER]`), learner, module, date given, average score, status (given/withdrawn), withdrawal reason/who/when if it applies | belongs to one Learner, one Module |
| **MaterialAsset** | title (unique), description, type, size, language, group, who uploaded it, upload date | belongs to one MaterialGroup; linked to by many Lectures |
| **MaterialGroup** | name, description, who created it, date created | has many MaterialAssets |
| **StaffMember** | name, email, role (super-admin/admin/lecturer), title, status, date created, who created them, last active, assigned modules (lecturers) | — |
| **Review** | learner, module, rating, text, status (pending/published/rejected), decided by, decided on, rejection reason, whether auto-flagged | belongs to one Learner, one Module |
| **AuditEntry** (action log) | who did it, action type, what it applied to, detail, timestamp | can only be added to, never changed |
| **PlatformSettings** | one record holding all the fields listed in §4.23 | there is only ever one of these |

---

## 9. External Interface Requirements

### 9.1 User Interfaces

- One shared, responsive design serves all four parts of the product from one codebase, already agreed with the client through the prototype: a light, magazine-style look, a small set of named colour categories (rather than fixed colours written into every screen) so the colour scheme can be changed from one place, and one shared font for both headings and body text.
- The learner portal, lecturer console, and admin console share one navigation layout (a side menu plus a top bar) with content that matches the role signed in; the public marketing site uses a separate layout, designed to convince a visitor to sign up.
- Every staff action that is hard to undo or has a real effect (suspend, archive, withdraw, delete, remove) must use one consistent two-step confirmation, shown on the same screen, that states clearly in plain words what will happen — never a generic "Are you sure?" pop-up.

### 9.2 Software Interfaces (to be built for production)

| Interface | Purpose |
|---|---|
| Sign-in service | Learner and staff sign-in, including Google sign-in for learners and two-step sign-in for staff. |
| Email service | Confirmation links, password resets, staff invitations, notification preferences, "certificate given" messages. |
| File storage | Uploaded files and video hosting/streaming. |
| Application database | Every record type in §8, including the permanent action log. |
| Public certificate lookup | A no-login check by certificate reference number (see FR-STU-310). |

### 9.3 Communications Interfaces

Normal secure web delivery (HTTPS); outgoing email for the flows listed above. No text messages, push notifications, or other outside services are part of this project right now.

---

## 10. Non-Functional Requirements

### 10.1 Performance

- The product must stay usable on older machines and slower connections — a main design concern, given that its users may have a wide range of device power and connection quality. Decorative animation must automatically reduce itself on lower-powered devices rather than being applied the same way everywhere.
- Pages built on the server (in particular the marketing landing page and anything that appears as the visitor scrolls) must never send a hidden or invisible starting state that depends on the browser's JavaScript to make it visible — the content must already be there and readable in the raw page sent from the server.

### 10.2 Accessibility

- All interactive or expandable parts of the screen (accordions, pop-ups, filters) must correctly mark their state (open/closed, selected) so that screen-reading software can describe them.
- Content that changes or updates on its own (for example, a headline that rotates) must not be read out again and again by a screen reader every time it changes, and must offer one steady, equivalent description instead.
- Turning on a visitor's "reduce motion" preference must never leave anything permanently invisible — reducing motion should remove movement, never remove content.
- Charts and other visual data must also be available as text or a table, and must never rely on colour alone to show meaning (for example, telling a pass from a fail).

### 10.3 Security

- Learner passwords: at least 8 characters. Staff/console passwords: at least 12 characters (see FR-ADM-260).
- Two-step sign-in available to all staff, required for the super administrator (FR-ADM-270).
- Console sessions expire after 8 hours with no activity (FR-ADM-280).
- Role and permission checks must be enforced on the server once the real system is built; the prototype's on-screen checks only show *how the rules should work* and are not, by themselves, real security.
- The action log must be genuinely impossible to change at the database level, not just hidden in the screen design (see BR-14).

### 10.4 Privacy and Data Minimisation

- The platform must collect and keep only the minimum learner data it needs to work: name, certificate name, email, and completion records. No national ID number, phone number, or similar shall be collected, and nothing about a learner shall be shared with the organisations behind individual modules.
- Staff-facing learner screens must never show quiz-answer-level detail or sign-in/session history (see BR-16, FR-ADM-160).
- Learner records: kept for as long as the account exists, plus two years after it closes (to keep certificates checkable). Action log: kept for a fixed seven years (see FR-SA-140).

### 10.5 Reliability and Data Integrity

- Figures a module advertises (lecture count, total hours) must always match the actual content that has been written — checked automatically as part of the finished content system.
- Every platform-wide reporting total must be worked out from one shared, trusted source, never written or kept separately on each screen (see FR-ADM-050).

### 10.6 Maintainability

- Brand identity (name, slogan, contact address) must stay in one place that can be swapped easily.
- The permission model must stay defined in one place and be used everywhere it is checked, rather than rebuilt separately on each screen.

### 10.7 Localisation

- The learner-facing product must be built to run in English, Sinhala, and Tamil side by side, even though only English content exists at launch; language is a preference each learner sets on the settings screen. The staff console itself may stay English-only for the first release.

---

## 11. Out of Prototype Scope / Roadmap

The items below are clearly **not** built in the current prototype, but are either promised in the product's own text or noted during this review as needed before the finished product can launch. Each should be planned as its own piece of work.

| Item | Why it matters |
|---|---|
| A real backend, real sign-in, and real saved data for every flow described above | The prototype pretends to save every action and clearly says so on screen; this document describes the behaviour the real backend must copy. |
| Real Google sign-in connection | Currently a button that does nothing, on purpose, rather than one that breaks. |
| Public certificate lookup page | Promised directly in the platform's own certificate and marketing text; does not exist yet. |
| Real video hosting/playback and real file delivery for materials | The lecture page's video player and download buttons work on screen but have no real file behind them. |
| Real tools for lecturers to add formatted text and video | The lecture editor shows the screen these tools will live in, but has no working uploader or text editor yet. |
| Real terms-of-use and privacy-notice pages | Currently placeholder links from the sign-up form. |
| A way for learners to reset a forgotten password themselves | Currently a placeholder link; staff password recovery is handled by an administrator on purpose instead. |
| Separate, linkable pages for each module's details | The marketing site currently expands module details in place because no separate pages exist yet to link to. |
| Group or department sign-up, with department-level progress reports | Clearly noted in the platform's own FAQ as planned but not yet available; only single sign-up exists today. |
| Sinhala and Tamil translations of all learner-facing content | The system is built to support all three languages; the translated content itself does not exist yet. |
| Final certificate design | The prototype shows a labelled placeholder frame on purpose, rather than a finished design nobody has approved yet. |
| Final brand name, and updating it everywhere from one file | Placeholder brand in place until the client decides. |

---

## Appendix A — Note on Illustrative Sample Content

The prototype this document is based on comes with a working demo catalogue — a small number of sample modules covering example green-growth subjects, each with sample lectures, sample quiz questions, and sample learner/lecturer/administrator records — so that every screen in Sections 4–7 could be tried from start to finish while writing this document.

**None of that sample content is part of this specification**, and it is left out of this document on purpose:

- The **number of modules**, their **titles and subjects**, and the **lecture count and length of each** are content decisions for the client to make. This document specifies that a module has a title, a level, a set of topics, and an ordered set of lectures (§5) — never how many modules or lectures there must be.
- The **specific quiz questions, options, and explanations** are content to be written by the client's lecturers, following the process set out in §4.11 — this document specifies the *shape* of a question (a prompt, four options, one correct answer, an explanation), not the actual wording of any question.
- The **sample learner, lecturer, and administrator records**, and any platform-wide totals worked out from them (registered learners, sign-ups, certificates given, and similar dashboard figures), are demo data only. The matching requirement in this document is always that the platform *works out and shows such a total live* from real records (see FR-ADM-050) — never a specific number.

Where a real example is useful elsewhere in this document (for instance, the certificate reference format in §8), it is given in a general, bracketed form rather than as one of the prototype's actual sample values, for the same reason.

---

## Appendix B — Screen Inventory

| Part | Screen | Notes |
|---|---|---|
| Public site | Landing page | Single long page (§4.1) |
| Public site | Sign up | §4.2 |
| Public site | Sign in (learner) | §4.2 |
| Public site | Confirm email | §4.2 |
| Public site | Console sign-in (staff) | §4.2 |
| Learner portal | Dashboard | §4.3 |
| Learner portal | Module catalogue | §4.4 |
| Learner portal | Module detail | §4.4 |
| Learner portal | Lecture page | §4.5 |
| Learner portal | Quiz | §4.6 |
| Learner portal | Written questions | §4.6a |
| Learner portal | Quizzes list | §4.6 |
| Learner portal | Certificates list | §4.7 |
| Learner portal | Certificate detail | §4.7 |
| Learner portal | Profile | §4.8 |
| Learner portal | Settings | §4.8 |
| Lecturer console | Dashboard | §4.9 |
| Lecturer console | My modules / Module detail | §4.9 |
| Lecturer console | Lecture editor | §4.10 |
| Lecturer console | Quiz editor (includes written questions) | §4.11, §4.11a |
| Lecturer console | Lectures list / Quizzes list | §4.10, §4.11 |
| Lecturer console | Materials library / group / file detail | §4.12 |
| Lecturer console | Learners list / learner detail | §4.13 |
| Lecturer console | Profile / Settings | §4.14 |
| Admin console | Dashboard | §4.15 |
| Admin console | Modules list / detail / lecture / quiz (includes written questions, read-only) | §4.16 |
| Admin console | Lecturers list / detail | §4.17 |
| Admin console | Students (learners) list / detail | §4.18 |
| Admin console | Materials library / group / file detail | §4.12 |
| Admin console | Certificates | §4.19 |
| Admin console | Reviews | §4.20 |
| Admin console | Action log (super admin only) | §4.22 |
| Admin console | Team / administrators (super admin only) | §4.21 |
| Admin console | Settings | §4.23 |
| Admin console | Profile | §4.24 |

---

## Appendix C — Glossary

See §1.3.

---

## Appendix D — Open Questions for the Client

The items below need a decision from the client before, or during, the build of the finished product, and are listed here rather than assumed:

1. **Final brand name, slogan, and look** — the current name is a working placeholder only.
2. **Certificate design** — the certificate document already uses the platform's own visual style, but has not yet had a final design pass.
3. **Group or department sign-up** — how important this is, and when the "join as a team" feature mentioned in the platform's own FAQ should be built.
4. **Sinhala and Tamil translation** — timeline, and where the translated content will come from.
5. **What the certificate legally represents** — whether it should mention any formal accreditation, and any wording rules that follow from that.
6. **How long data is kept** — the two-year (after account closure) and seven-year (action log) figures used throughout this document are working defaults; please confirm against any data-retention rules that apply.
7. **Whether the client wants to be named anywhere in the finished product** (for example, an "in partnership with" line in the footer), or whether the current fully unbranded approach should stay in place permanently.

---

*End of document.*
