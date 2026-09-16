# User Accounts, Login & Authorization — Build Requirements

This is the spec for the very first real slice of the LMS Platform build:
account creation, sign-in, and role-based access — for `backend-fastapi-app`
and `nextjs-frontend-app`. It does **not** touch either of those repos; it's
the shared reference doc to build from. Grounded in `docs/SRS.md` §4.2,
§4.21–§4.24, §4.29–§4.33, §6 (Business Rules), §7 (Roles matrix), §10.3
(Security), and the prototype's own `lib/permissions.ts` (the authoritative
role → capability list, reproduced in the Appendix below) — cite the FR-IDs
in commits/PRs so this stays traceable back to the SRS.

---

## 1. The two account families

There is no single "user" type — two completely separate front doors:

- **Learner** — the public side. Cannot self-activate; every application is
  reviewed by a human before sign-in works at all (FR-AUTH-015).
- **Staff** — seven roles, all on the console side. **None of them can sign
  themselves up.** Every staff account (bar one) is created by someone else
  who already has the power to (FR-AUTH-070, FR-SA-010).

An account can be **either** kind, never both — a learner is never also a
staff member on the same account.

## 2. The seven staff roles

Names, scope, and what each is actually for (full capability list is in the
Appendix):

| Role | Scope | What it does |
|---|---|---|
| **Super Administrator** | Whole platform | Appoints every other role, owns the audit log and platform settings. Exactly one account, ever (FR-SA-030). |
| **Module Administrator** | One or more specific Modules | Runs a Module day-to-day — its lecturer roster, details, tags, publish state, its own reviews/certificates. |
| **Laws Administrator** | Whole platform, one library | Manages the Law library only. Never touches a Module, lecturer, or learner. |
| **Tools Administrator** | Whole platform, one directory | Manages the Tool directory only. Same isolation as Laws Administrator. |
| **List Manager** | Whole platform, one mechanism | Manages the dynamic tag lists (Hazards, Categories, ...) that tie Modules/Laws/Tools together. |
| **Provincial Registrar** | One specific province | Approves/rejects that province's pending applications; administers the learners it lets in. |
| **Lecturer** | One or more specific Modules | Writes lecture content for the Module(s) they're assigned to. |

**A staff account can hold more than one role at once** (e.g. Module
Administrator on one Module *and* Lecturer on another) — FR-AUTH-080. When
that account signs in, it's asked which portal to enter; the choice is a
"which dashboard" hint, never a scope restriction — all granted roles apply
to every request regardless of which one was picked at login.

## 3. Who creates whom

```
Super Administrator (seeded once, outside the app, before anything else exists)
   │
   ├── creates → Module Administrator, Laws Administrator,
   │             Tools Administrator, List Manager, Provincial Registrar
   │
   └── creates → Lecturer  ◄── a Module Administrator can also do this,
                              for their own Module(s) only (FR-MODADM-050/055)

Applicant (public, no account yet)
   │
   ├── submits a registration application (name, email, password, province, ...)
   │
   └── a Provincial Registrar for that province (or the Super Administrator,
       for "National / Head Office") approves it → a real Learner account
       is created. Rejecting is not final — the applicant can edit and
       resubmit the same application (FR-AUTH-025).
```

The Super Administrator itself is the one exception to "someone creates
you" — it's seeded directly into the database by a script, never through
the API, before the app is even live (mirrors the pattern already proven in
`ol-backend/app/scripts/seed_super_admin.py`, which is worth reading for
the exact shape even though that codebase isn't the one we're building on).

---

## 4. Backend Requirements

### 4.1 Data model

| Table | Key fields | Notes |
|---|---|---|
| **provinces** | id, name | **Fixed reference data — seed directly via migration data, not through any API.** Sri Lanka's 9 provinces (Western, Central, Southern, Northern, Eastern, North Western, North Central, Uva, Sabaragamuwa). Never created/edited by a List Manager or anyone else — the SRS is explicit that these are fixed platform data, not a dynamic option list (FR-LIST-050, BR-27). Reused later by a Law's province scope (§4.30) — worth getting this table's shape right now since two things in this very first slice already depend on it, and a third will. |
| **users** | id, email (unique), password_hash, full_name, certificate_name, account_status, must_change_password, created_at | One row per account of *either* family. `account_status`: `pending` \| `active` \| `suspended` \| `deactivated`. |
| **learner_profiles** | user_id (FK), province_id (FK → provinces, **nullable**), sector (optional), district | Only for learner accounts. `province_id` is `NULL` when the learner chose "National / Head Office" at registration — see the note below the table. |
| **staff_roles** | user_id (FK), role, module_ids (nullable array/join table), province_id (FK → provinces, nullable), appointed_by (FK → users, nullable only for the seeded Super Admin) | One row per role an account holds — supports the multi-role case directly (§2). `module_ids`/`province_id` populated only for the roles that are scoped (Module Administrator, Lecturer, Provincial Registrar). |
| **registration_applications** | id, submitted fields (name, email, password_hash, province_id nullable, sector), status (`pending`\|`approved`\|`rejected`), decided_by (FK → users, nullable), decided_at, rejection_reason | **Reopened to `pending` on resubmit, never duplicated** (FR-AUTH-025) — same row, not a new one. |
| **refresh_tokens** | id, user_id, token_hash, expires_at, revoked_at | One per active session; revoke on logout/password change. |
| **password_reset_tokens** | id, user_id, token_hash, expires_at, used_at | Single-use. |
| **audit_log** | id, actor_id, action, target, detail, created_at | Append-only — see §4.4. Every account-related action in this doc must write here. |

Two account-status states matter here specifically: **`pending`** covers a
still-under-review learner application (they can sign in and see their own
status, but nothing else — FR-AUTH-055) and a freshly privileged-created
staff account waiting on its first forced password change; **`suspended`**/
**`deactivated`** block sign-in outright.

**"National / Head Office" is not a row in `provinces`** — it's the fixed
tenth *choice* on the registration form, represented as `province_id IS
NULL` on `registration_applications`/`learner_profiles` (an applicant who
picked it routes to the Super Administrator instead of a Provincial
Registrar — FR-REG-040). `staff_roles.province_id` for a
`provincial_registrar` row, by contrast, is **never** `NULL` — there is no
Provincial Registrar for National/Head Office, only real provinces get
one. This mirrors the prototype's own type split exactly (`LearnerProvince
= Province | NATIONAL_LEARNER` for a learner, the narrower `Province` alone
for staff) — same distinction, just enforced in the schema instead of the
type system.

### 4.2 Authentication mechanics

- **Password hashing:** Argon2id (not bcrypt/plain SHA) — matches
  `backend-fastapi-app`'s own stack choices.
- **Password length:** learner accounts ≥ 8 characters; **staff accounts ≥
  12** (FR-ADM-260 — deliberately stricter).
- **Tokens:** short-lived JWT access token + a longer-lived refresh token,
  bearer-style (`Authorization: Bearer <token>`), refreshed via a dedicated
  endpoint. Revoke the refresh token on logout and on password change.
- **Session expiry:** learner session — reasonable "remember me" duration;
  **staff console session — 8 hours idle, hard requirement (FR-ADM-280).**
- **Two-step verification: deferred, not part of this build.** SRS
  FR-ADM-270 requires it eventually (available to every staff role,
  mandatory for the Super Administrator) — recorded here so it isn't
  forgotten, but not built now. Build it only if the client actually asks
  for it; until then, staff sign-in is password-only like a learner's, just
  with the stricter 12-character minimum and the shorter 8-hour session
  below.
- **Staff onboarding:** a privileged-created account (any of the six
  appointed roles) starts with a system-generated temporary password,
  emailed to them, and is locked to a "change your password" endpoint
  (`must_change_password = true`) until they set a real one. This exact
  pattern is already proven working in `ol-backend` — reuse the shape, not
  the code.
- **Learner self-service password reset:** a normal "forgot password" email
  link (FR-AUTH-060). **Staff have no self-service reset** — the recovery
  text tells them to contact whoever appointed them (FR-AUTH-070); a staff
  password reset is always done *by* an admin, not requested by the account
  itself.

### 4.3 Authorization

Two checks stacked, every request that isn't public:

1. **Role check** — does any of this account's granted roles hold the
   capability the endpoint requires? (Reproduce the `CAPABILITIES` table
   from `lib/permissions.ts` — see Appendix — as the server-side source of
   truth; the prototype's version is UI-only and must be rebuilt for real,
   SRS §10.3.)
2. **Scope check**, only for the roles that carry one — a Module
   Administrator or Lecturer's request must be checked against their own
   `module_ids`; a Provincial Registrar's against their own `province_id`.
   Never trust a scope claim from the client — always re-derive it from
   the authenticated account's own `staff_roles` row(s) server-side.

Every permission failure and every account-lifecycle action (create,
suspend, restore, role granted/revoked, application approved/rejected)
writes an audit log entry (FR-SA-060) — never viewing a page, only doing
something.

### 4.4 Endpoints (minimum set)

**Public**
- `POST /auth/register` — creates a `registration_applications` row (not a
  user), always starts `pending`.
- `GET /auth/application-status` — an applicant checks their own
  application (name/email/password only — this *is* their only way to sign
  in before a decision, FR-AUTH-055).
- `PATCH /auth/application` — edit-and-resubmit after rejection
  (FR-AUTH-025).
- `POST /auth/login` — learner and staff both come through here (a
  multi-role staff account gets a short-lived role-selection response
  instead of a token pair — see §4.2's "two-step exchange" note; the
  `ol-backend` devlog on `login-role-selection` documents a working shape
  for this worth reading before designing it fresh).
- `POST /auth/select-role` — second step of the exchange above.
- `POST /auth/refresh`, `POST /auth/logout`
- `POST /auth/forgot-password`, `POST /auth/reset-password` (learner only)

**Authenticated**
- `POST /auth/change-password` — the only endpoint reachable while
  `must_change_password` is set.
- `GET /me` — current account + granted roles.

**Super Administrator only**
- `POST /staff` — create a Module/Laws/Tools Administrator, List Manager,
  or Provincial Registrar (role-specific required fields: `module_ids` for
  Module Administrator, `province_id` for Provincial Registrar — none for the
  other three, FR-SA-015).
- `POST /staff/lecturers` — also reachable by a Module Administrator, but
  scoped to their own Module(s) only (FR-MODADM-050).
- `PATCH /staff/{id}/suspend`, `PATCH /staff/{id}/restore`
- `GET /audit-log` (Super Administrator only, read-only, FR-SA-040)

**Provincial Registrar (and Super Administrator, for "National / Head
Office")**
- `GET /applications?status=pending` (own province only)
- `POST /applications/{id}/approve`, `POST /applications/{id}/reject`
  (rejecting requires a written reason, FR-REG-020)

### 4.5 Business rules to enforce server-side, not just in the UI

- Exactly one Super Administrator account, ever (FR-SA-030) — enforce at
  the DB level (a partial unique constraint or a single-row check), not
  just in application code.
- No endpoint may let a caller create or elevate their own account into a
  more powerful role (FR-SA-010's whole reason for existing).
- A rejected application is reopened, never duplicated, on resubmit
  (FR-AUTH-025).
- An account's `role` history — who appointed it — is permanent and
  immutable (FR-SA-020).
- Audit log rows are insert-only at the schema level — no `UPDATE`/`DELETE`
  grants on that table for the application's own DB role (FR-SA-070,
  SRS §10.3's "impossible to change at the database level, not just hidden
  in the screen design").

---

## 5. Frontend Requirements

### 5.1 Public / learner-facing pages

| Page | Purpose |
|---|---|
| `/register` | The 6-field application form (FR-AUTH-010): name, email, password (+ strength meter, FR-AUTH-040), province select, optional sector, terms tick-box. No Google option (FR-AUTH-030). |
| `/application-status` | What an applicant/pending learner sees: Pending (names their reviewer), Rejected (reason + edit-and-resubmit back into `/register`), or redirects to the dashboard once Approved (FR-AUTH-050/055). |
| `/login` | Learner sign-in: email, password, "keep me signed in", forgot-password link. No Google option (FR-AUTH-060). |
| `/forgot-password`, `/reset-password` | Learner self-service reset. |

### 5.2 Console / staff-facing pages

| Page | Purpose |
|---|---|
| `/console/login` | Separate from learner login (FR-AUTH-070). No self-signup, no Google. Recovery text points to "contact whoever appointed you", not a reset link. |
| `/console/select-role` | Only shown when the authenticated account holds more than one role (FR-AUTH-080) — picks which dashboard to land on. |
| `/console/change-password` | The forced first-login screen for a privileged-created account (`must_change_password`). Nothing else in the console is reachable until this is done. |
| A "create staff account" screen | Super Administrator only, one role-aware form: a role `<select>`, then the fields that role needs (module picker for Module Administrator, province picker for Provincial Registrar, nothing extra for Laws/Tools Administrator or List Manager) — mirrors the "one form, role-aware fields" pattern already built in the prototype's `NewStaffAction`/`InviteForm`. |
| A "province applications" queue | Provincial Registrar (and Super Administrator for National/Head Office) — pending list with approve/reject, decided history below it (FR-REG-020/050). |

### 5.3 Shared auth behaviour (needs an explicit decision before building — flag per both repos' `CLAUDE.md` "ask before deciding" rule)

- **Where the token lives** — httpOnly cookie vs. `localStorage`/memory.
  Affects CSRF exposure and how refresh is wired; pick one and write it
  down before either repo starts depending on it.
- **Route guarding** — middleware/layout-level guard per role + scope,
  driven by the same server-side capability check (§4.3), never a
  client-only `if (role === ...)` — the server is the real gate; the
  frontend guard only avoids a flash of the wrong screen.
- **The "which role am I acting as" state** for a multi-role account —
  needs to survive a refresh and drive which nav/dashboard renders, without
  ever being treated as an actual permission boundary (§2).
- **Session-expiry handling** — the 8-hour staff idle timeout (FR-ADM-280)
  needs a real countdown/refresh strategy, not just a token that silently
  stops working.

---

## Appendix — role → capability matrix (source of truth, from `lib/permissions.ts`)

| Capability | Super Admin | Module Admin | Laws Admin | Tools Admin | List Manager | Registrar | Lecturer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View console | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage admin accounts | ✓ | — | — | — | — | — | — |
| Read audit log | ✓ | — | — | — | — | — | — |
| Manage platform settings | ✓ | — | — | — | — | — | — |
| Create a Module (platform-wide) | ✓ | — | — | — | — | — | — |
| Manage own Module's details/tags/publish | ✓ | ✓ | — | — | — | — | — |
| Suspend a lecturer's whole account | ✓ | — | — | — | — | — | — |
| Invite/assign a lecturer to own Module | ✓ | ✓ | — | — | — | — | — |
| Assign modules (general) | ✓ | — | — | — | — | — | — |
| View all learners platform-wide | ✓ | — | — | — | — | — | — |
| Manage learners (own scope) | ✓ | — | — | — | — | ✓* | — |
| Moderate reviews (own scope) | ✓ | ✓ | — | — | — | — | — |
| Manage certificates (own scope) | ✓ | ✓ | — | — | — | — | — |
| Author lectures (assigned modules) | ✓ | — | — | — | — | — | ✓ |
| View assigned learners | ✓ | — | — | — | — | — | ✓ |
| Manage Laws library | ✓ | — | ✓ | — | — | — | — |
| Manage Tools directory | ✓ | — | — | ✓ | — | — | — |
| Manage dynamic option lists | ✓ | — | — | — | ✓ | — | — |
| Manage registration applications | ✓ | — | — | — | — | ✓ | — |

*Provincial Registrar holds `manageLearners`, scoped to their own province's approved learners — not the same grant as Super Administrator's platform-wide one; enforce the scope difference server-side even though the capability name is shared.
