/**
 * Announcements and messages between the four kinds of account on the
 * platform: super administrator, administrator, lecturer, student.
 *
 * TWO SHAPES, DELIBERATELY KEPT APART. An `Announcement` is one-way and
 * broadcasts to an audience - a lecturer never replies to "platform
 * maintenance this Saturday". A `MessageThread` is a conversation between
 * exactly two people, and either of them may have started it. Modelling both
 * as one "notification" type with an optional reply field would let an
 * announcement quietly grow a reply box, which is a rule this file is
 * supposed to make impossible rather than merely unlikely.
 *
 * VALID CONVERSATION PAIRS ARE A HIERARCHY, NOT A MESH: admin<->lecturer,
 * admin<->student, lecturer<->student. Never lecturer<->lecturer,
 * student<->student, or admin<->admin - nothing in this file enforces that at
 * the type level (a `[Party, Party]` tuple cannot express "not this
 * combination"), so anything that builds a new thread must respect it.
 *
 * NOTHING PERSISTS, same as everywhere else in this prototype. Sending an
 * announcement or replying to a thread shows the standing "Prototype -
 * nothing was sent" confirmation; the lists below are what a demo account
 * already has, not a log a real send would append to.
 *
 * `isNew` and `unreadFor` are AUTHORED, not computed from the clock. This
 * platform's "today" is fixed at 15 August 2026 (see `content/operations.ts`)
 * and nothing else in the codebase compares a stored date against
 * `Date.now()` - doing that here would make every "New" badge quietly expire
 * the day this prototype is opened a week late.
 */

/* -------------------------------------------------------------- audiences */

/** Who an announcement reaches. Messages have no audience - see `Party`. */
export type Audience =
  | { kind: "all-lecturers" }
  | { kind: "lecturers"; staffIds: string[] }
  | { kind: "all-students" }
  | { kind: "students"; studentIds: string[] }
  | { kind: "module"; moduleId: string };

export type Announcement = {
  id: string;
  /** A staff id - only staff broadcast announcements. */
  from: string;
  audience: Audience;
  title: string;
  body: string;
  sentOn: string;
  /** Authored, not derived - see the file note above. */
  isNew?: boolean;
};

/* ------------------------------------------------------------------ threads */

export type PartyKind = "staff" | "student";

/** One end of a conversation. `kind` disambiguates the id namespace - staff
 *  ids look like `staff-inst-3`, student ids like `stu-2037`, so the two
 *  never collide, but a party is still meaningless without knowing which
 *  register to look it up in. */
export type Party = { id: string; kind: PartyKind };

export type ThreadMessage = {
  id: string;
  /** A party id - must be one of the thread's own two participants. */
  from: string;
  body: string;
  sentOn: string;
};

export type MessageThread = {
  id: string;
  participants: [Party, Party];
  messages: ThreadMessage[];
  /** Party ids who have something in this thread they have not opened yet. */
  unreadFor: string[];
};

/* -------------------------------------------------------------- seed data */

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    from: "staff-super",
    audience: { kind: "all-lecturers" },
    title: "Your public profile page is now live",
    body:
      "Every lecturer's qualifications, experience, publications and achievements are now visible to learners from a byline on each lecture, and learners can review you once they finish one of your lectures. Keep it current from your own profile page - nothing there is edited by an administrator.",
    sentOn: "2026-08-20",
    isNew: true,
  },
  {
    id: "ann-2",
    from: "staff-admin-1",
    audience: { kind: "lecturers", staffIds: ["staff-inst-3", "staff-inst-1"] },
    title: "Please clear the review queue by Friday",
    body:
      "A few learner reviews on your modules have been waiting more than a week. Nothing is published until it's moderated, so a slow queue is a slow page for the learner who wrote it.",
    sentOn: "2026-08-12",
  },
  {
    id: "ann-3",
    from: "staff-inst-1",
    audience: { kind: "module", moduleId: "climate-vulnerability-assessment" },
    title: "Office hours this Thursday",
    body:
      "I'll be online 4-5pm Thursday for anyone stuck on adaptive capacity or the vulnerability index - drop your question in the module's discussion beforehand if you can, so I can prepare an answer rather than improvise one.",
    sentOn: "2026-08-19",
    isNew: true,
  },
  {
    id: "ann-4",
    from: "staff-inst-2",
    audience: { kind: "module", moduleId: "provincial-adaptation-plan" },
    title: "Costing template updated",
    body:
      "Lecture 5's downloadable costing template had a formula error in the contingency column - it's fixed on the shelf now. If you downloaded it before 28 July, please re-download.",
    sentOn: "2026-07-30",
  },
  {
    id: "ann-5",
    from: "staff-admin-1",
    audience: { kind: "all-students" },
    title: "Platform maintenance, Saturday night",
    body:
      "The platform will be briefly unavailable between 11pm and midnight on Saturday for scheduled maintenance. Nothing you're partway through will be lost.",
    sentOn: "2026-08-20",
    isNew: true,
  },
  {
    id: "ann-6",
    from: "staff-super",
    audience: { kind: "students", studentIds: ["stu-1904"] },
    title: "Congratulations on your certificate",
    body:
      "Your Provincial Adaptation Plan certificate has been issued - it's a strong module to have finished first. It's on your certificates page whenever you need to show it.",
    sentOn: "2026-08-05",
  },
  {
    id: "ann-7",
    from: "staff-inst-3",
    audience: { kind: "module", moduleId: "gender-social-inclusion" },
    title: "New reading added to lecture 5",
    body:
      "A shorter companion reading is now on the shelf for lecture 5, for anyone who found the UNDP evaluation heavy going - same argument, half the length.",
    sentOn: "2026-08-18",
    isNew: true,
  },
];

export const THREADS: MessageThread[] = [
  {
    id: "thr-1",
    participants: [
      { id: "staff-admin-1", kind: "staff" },
      { id: "staff-inst-3", kind: "staff" },
    ],
    messages: [
      {
        id: "thr-1-m1",
        from: "staff-admin-1",
        body:
          "How's Green Buildings coming along? We'd like at least two more lectures published before the end of the month if that's realistic.",
        sentOn: "2026-08-18",
      },
      {
        id: "thr-1-m2",
        from: "staff-inst-3",
        body:
          "Two more are drafted and in review now - aiming to publish by Friday. I'll flag it if the retrofitting one needs another pass first.",
        sentOn: "2026-08-19",
      },
    ],
    unreadFor: ["staff-admin-1"],
  },
  {
    id: "thr-2",
    participants: [
      { id: "staff-admin-1", kind: "staff" },
      { id: "stu-1904", kind: "student" },
    ],
    messages: [
      {
        id: "thr-2-m1",
        from: "stu-1904",
        body:
          "Hi - my certificate for the Provincial Adaptation Plan shows my display name rather than my full legal name. Can that be corrected?",
        sentOn: "2026-08-14",
      },
      {
        id: "thr-2-m2",
        from: "staff-admin-1",
        body:
          "Thanks for flagging it - a certificate is meant to carry the legal name from your registration, so it should already read correctly. Could you send a screenshot of what you're seeing so we can check?",
        sentOn: "2026-08-15",
      },
    ],
    unreadFor: ["stu-1904"],
  },
  {
    id: "thr-3",
    participants: [
      { id: "staff-inst-3", kind: "staff" },
      { id: "stu-2037", kind: "student" },
    ],
    messages: [
      {
        id: "thr-3-m1",
        from: "stu-2037",
        body:
          "In lecture 6 you mention 'consultation fatigue' - is there a reading that goes deeper into that?",
        sentOn: "2026-08-16",
      },
      {
        id: "thr-3-m2",
        from: "staff-inst-3",
        body:
          "Good question - I'll add one to the shelf this week. In the meantime, the UNDP GSI focal point evaluation from 2019 covers it well.",
        sentOn: "2026-08-17",
      },
    ],
    unreadFor: [],
  },
  {
    id: "thr-4",
    participants: [
      { id: "staff-inst-1", kind: "staff" },
      { id: "stu-1904", kind: "student" },
    ],
    messages: [
      {
        id: "thr-4-m1",
        from: "stu-1904",
        body:
          "I'm on 'assessing adaptive capacity' now and struggling to separate it from sensitivity - are they ever actually the same thing in practice?",
        sentOn: "2026-08-20",
      },
    ],
    unreadFor: ["staff-inst-1"],
  },
];
