/**
 * The curriculum: every lecture of every module, and what is inside it.
 *
 * Same job as `content/site.ts` - this is mock data standing in for what will
 * later be an API response, kept in one file so copy changes never touch a
 * component. `site.ts` owns what the LANDING page says about a module
 * (summary, topics, totals); this owns what a LEARNER sees once they are
 * inside it.
 *
 * The two must agree: `LECTURES[id].length` has to equal `MODULES[i].lectures`,
 * or the marketing page promises nine lectures and the module page shows
 * eight. `lib/portal.ts` asserts this in development rather than leaving it to
 * be spotted in a demo.
 *
 * A lecture is a short list of CONTENT BLOCKS rather than a single body of
 * prose, because the real platform will mix three kinds of thing inside one
 * lecture - a recorded video, written material, and files to take away - and
 * the lecture page has to be built to render them in any order. Every lecture
 * here carries at least one primary block (video or text) and a materials
 * block, so the page has all three shapes to draw from whichever lecture is
 * opened during a demo.
 */

/* -------------------------------------------------------------- attachments */

/**
 * `kind` drives the icon and the wording of the download control, not the
 * mime type - the prototype downloads nothing.
 */
export type MaterialKind = "pdf" | "slides" | "sheet" | "dataset" | "link";

export type Material = {
  title: string;
  kind: MaterialKind;
  /** Shown next to the title. A link has no size, which is why this is optional. */
  size?: string;
};

/* ------------------------------------------------------------------- blocks */

export type ContentBlock =
  /**
   * A recorded video. There is no video file in the prototype - the player
   * is a mock (see `<VideoStage>`), and `caption` is what a learner would
   * otherwise get from the first thirty seconds of it.
   */
  | { type: "video"; title: string; minutes: number; caption: string }
  /** Written material. One heading, one passage - never a wall. */
  | { type: "text"; heading: string; body: string }
  /** Files attached to the lecture. */
  | { type: "materials"; items: Material[] };

export type Lecture = {
  id: string;
  /** Two digits, like the module numerals on the landing page. */
  number: string;
  title: string;
  /**
   * What the lecture mostly IS, for the badge in a list. A video lecture still
   * carries written material and a reading lecture can still carry a clip; this
   * is the headline, not an exclusive category.
   */
  kind: "video" | "reading";
  /**
   * Estimated study time for the WHOLE lecture - the video plus the written
   * material plus working through the attachments - not the length of the
   * video, which the video block carries separately. The lectures of a
   * module sum to the hours `content/site.ts` advertises for it, and
   * `lib/portal.ts` checks that in development.
   */
  minutes: number;
  summary: string;
  /** Three, always. A list of five stops being read. */
  objectives: string[];
  content: ContentBlock[];
};

/* ------------------------------------------------------------------ lectures */

/** Keyed by `Module["id"]` from `content/site.ts`. */
export const LECTURES: Record<string, Lecture[]> = {
  "climate-vulnerability-assessment": [
    {
      id: "why-vulnerability-is-not-risk",
      number: "01",
      title: "Why vulnerability is not the same as risk",
      kind: "video",
      minutes: 35,
      summary:
        "The three-part model behind every serious climate risk assessment, and why treating vulnerability as a stand-alone problem gets the diagnosis wrong before the work even starts.",
      objectives: [
        "Separate hazard, exposure and vulnerability",
        "Explain why the same hazard produces different outcomes",
        "Place vulnerability assessment inside the wider risk framework",
      ],
      content: [
        {
          type: "video",
          title: "Three words, one equation",
          minutes: 8,
          caption:
            "Risk is not a hazard, and a hazard is not a threat until something is exposed to it and unable to absorb it. This opening lecture builds the hazard-exposure-vulnerability model climate risk assessments use, and follows one cyclone through all three terms to show why the same storm produces a fatality in one town and a power cut in the next.",
        },
        {
          type: "text",
          heading: "Vulnerability is the part policy can change fastest",
          body: "A department cannot move a coastline or cancel a monsoon, but it can put a title deed, a second income or an early-warning system in front of a household before the next event arrives. Hazard and exposure are largely given; vulnerability is where an assessment earns its budget, because it is the term most open to intervention.",
        },
        {
          type: "materials",
          items: [
            { title: "Vulnerability Assessment 01 - slide deck", kind: "slides", size: "2.0 MB" },
            { title: "Risk framework glossary", kind: "pdf", size: "310 KB" },
          ],
        },
      ],
    },
    {
      id: "hazard-exposure-sensitivity",
      number: "02",
      title: "Hazard, exposure and sensitivity: the three inputs",
      kind: "reading",
      minutes: 40,
      summary:
        "What each of the three inputs to a vulnerability assessment actually measures, and the data source a Sri Lankan officer can realistically get for each one.",
      objectives: [
        "Define sensitivity separately from exposure",
        "Match each input to an available data source",
        "Avoid double-counting between inputs",
      ],
      content: [
        {
          type: "text",
          heading: "Exposure is a location question",
          body: "Exposure asks only where people, assets and systems sit relative to the hazard - a school on a flood plain is exposed whether or not it ever floods. Confusing exposure with vulnerability is the most common error in a first assessment, and it inflates the apparent risk of well-protected places while hiding the real one.",
        },
        {
          type: "text",
          heading: "Sensitivity is a condition, not a location",
          body: "Two schools on the same flood plain are not equally sensitive: one built on stilts with a raised generator room absorbs a flood the other cannot. Sensitivity records the physical and social condition that decides how much a given exposure actually hurts, and it is normally the hardest of the three inputs to find good data for.",
        },
        {
          type: "materials",
          items: [
            { title: "District-level hazard layers", kind: "dataset", size: "480 KB" },
            { title: "Sensitivity indicator checklist", kind: "sheet", size: "88 KB" },
          ],
        },
      ],
    },
    {
      id: "reading-sri-lankas-climate-hazard-data",
      number: "03",
      title: "Reading Sri Lanka's climate hazard data",
      kind: "video",
      minutes: 40,
      summary:
        "Where the country's actual hazard data lives, what each dataset is and is not good for, and the mistake that makes an assessment quietly wrong.",
      objectives: [
        "Locate the main national hazard datasets",
        "Match a dataset's resolution to the decision it can support",
        "Avoid over-reading a coarse national dataset",
      ],
      content: [
        {
          type: "video",
          title: "A tour of what already exists",
          minutes: 10,
          caption:
            "Before commissioning new data, a working tour of what the Department of Meteorology, the Disaster Management Centre and the National Adaptation Plan's own technical annexes already hold - rainfall, temperature, sea-level and past-event records - and what resolution each one actually supports.",
        },
        {
          type: "text",
          heading: "National resolution is not divisional resolution",
          body: "A national hazard map is built to compare provinces, not to site a culvert. Using it to make a divisional-level decision borrows a precision the data never had, and an assessment that says so plainly is more useful than one that quietly assumes a downscaling nobody checked.",
        },
        {
          type: "materials",
          items: [
            { title: "National hazard data sources - map", kind: "pdf", size: "1.1 MB" },
          ],
        },
      ],
    },
    {
      id: "building-a-vulnerability-index",
      number: "04",
      title: "Building a vulnerability index",
      kind: "reading",
      minutes: 35,
      summary:
        "Combining sensitivity and adaptive-capacity indicators into one score without hiding the decisions that went into it.",
      objectives: [
        "Select indicators that do not overlap",
        "Weight indicators defensibly",
        "Present an index alongside its components",
      ],
      content: [
        {
          type: "text",
          heading: "An index is a compression, not a discovery",
          body: "Every composite score throws information away on purpose, in exchange for something that ranks. The value of a vulnerability index is entirely in whether the compression was done honestly - indicators that do not double-count the same underlying condition, and weights that are stated rather than buried in a spreadsheet.",
        },
        {
          type: "text",
          heading: "Publish the components, not just the score",
          body: "Two districts scoring 0.6 can need opposite interventions if one result is driven by income and the other by distance from a hospital. An index published with its component indicators lets a planner see which one; an index published alone does not.",
        },
        {
          type: "materials",
          items: [
            { title: "Index-building worksheet", kind: "sheet", size: "140 KB" },
            { title: "Worked example - district index", kind: "pdf", size: "620 KB" },
          ],
        },
      ],
    },
    {
      id: "assessing-adaptive-capacity",
      number: "05",
      title: "Assessing adaptive capacity",
      kind: "video",
      minutes: 35,
      summary:
        "What actually predicts whether a household or an institution can respond to a shock, and why income alone is a weak proxy for it.",
      objectives: [
        "Distinguish coping capacity from adaptive capacity",
        "Identify institutional as well as household capacity",
        "Avoid income as the sole indicator",
      ],
      content: [
        {
          type: "video",
          title: "Capacity is not just money",
          minutes: 9,
          caption:
            "A household with savings still fails to adapt if it has no information about the hazard or no access to the institutions that could help it. This lecture works through the non-financial capacities that predict recovery as reliably as income does, using two households with identical earnings and very different outcomes.",
        },
        {
          type: "text",
          heading: "Institutions have capacity too",
          body: "A divisional secretariat's adaptive capacity - its staffing, its early-warning links, its access to contingency funds - shapes every household's outcome inside its boundary. An assessment that measures only households and never the institution around them is missing half the picture.",
        },
        {
          type: "materials",
          items: [
            { title: "Adaptive capacity indicator set", kind: "sheet", size: "96 KB" },
          ],
        },
      ],
    },
    {
      id: "ground-truthing-a-desk-assessment",
      number: "06",
      title: "Ground-truthing a desk assessment",
      kind: "reading",
      minutes: 40,
      summary:
        "Why a desk-based vulnerability assessment has to be checked against a site visit, and how to run one that a small team can complete in days, not months.",
      objectives: [
        "Design a short field verification",
        "Spot where desk data and reality diverge",
        "Record findings that can update the index",
      ],
      content: [
        {
          type: "text",
          heading: "Desk data is a hypothesis",
          body: "A composite index built entirely from national datasets is a hypothesis about a place, not a description of it. A short field visit - a walk-through, a handful of household conversations, a look at what has already flooded - is what turns the hypothesis into an assessment somebody can act on.",
        },
        {
          type: "text",
          heading: "Two days, one ward, real answers",
          body: "A verification visit does not need to be exhaustive to be useful. A structured half-day per ward, checking the two or three indicators the desk data was least confident about, catches most of the divergence a full re-survey would find at a fraction of the cost.",
        },
        {
          type: "materials",
          items: [
            { title: "Field verification checklist", kind: "sheet", size: "78 KB" },
            { title: "Ward visit recording sheet", kind: "sheet", size: "64 KB" },
          ],
        },
      ],
    },
    {
      id: "presenting-findings-to-decision-makers",
      number: "07",
      title: "Presenting findings to decision-makers",
      kind: "video",
      minutes: 40,
      summary:
        "Turning an assessment into a briefing a busy official will actually read and act on, rather than a report that gets filed.",
      objectives: [
        "Lead with the decision, not the method",
        "Use a map before a table",
        "State the confidence level honestly",
      ],
      content: [
        {
          type: "video",
          title: "The one page that gets read",
          minutes: 10,
          caption:
            "Most vulnerability assessments are read by exactly one person, once, for about four minutes. This lecture builds a one-page briefing from a full assessment - the map first, the three highest-priority areas named, the method held to an appendix - and shows what a rewrite for a district secretary cuts compared with the technical report underneath it.",
        },
        {
          type: "text",
          heading: "Say what you are not sure of",
          body: "A briefing that states its confidence level plainly - which figures are measured and which are modelled - is trusted more, not less, than one that presents everything with equal certainty. Decision-makers have usually been shown at least one report that overclaimed, and they read for the tell.",
        },
        {
          type: "materials",
          items: [
            { title: "Briefing template - one page", kind: "pdf", size: "540 KB" },
          ],
        },
      ],
    },
    {
      id: "from-assessment-to-action",
      number: "08",
      title: "From assessment to action",
      kind: "reading",
      minutes: 35,
      summary:
        "Handing a finished assessment to the planning process it exists to feed, and keeping it from becoming a document nobody opens again.",
      objectives: [
        "Link assessment findings to specific planning decisions",
        "Set a review cycle for the index",
        "Avoid a one-off assessment that goes stale",
      ],
      content: [
        {
          type: "text",
          heading: "An assessment with no receiving process is wasted",
          body: "A vulnerability assessment commissioned without a named planning process to feed - a provincial adaptation plan, a budget cycle, a zoning review - is written once and read never. Before the fieldwork starts, name the decision the assessment is for.",
        },
        {
          type: "text",
          heading: "Set the next update before you file this one",
          body: "Conditions the index measures - income, infrastructure, hazard exposure - move over a three-to-five-year horizon. An assessment with a stated review date is a living input to planning; one without it is a snapshot nobody remembers to retake.",
        },
        {
          type: "materials",
          items: [
            { title: "Assessment-to-planning handover note", kind: "pdf", size: "410 KB" },
          ],
        },
      ],
    },
  ],

  "provincial-adaptation-plan": [
    {
      id: "what-the-nap-asks-of-a-province",
      number: "01",
      title: "What the National Adaptation Plan asks of a province",
      kind: "video",
      minutes: 40,
      summary:
        "What the National Adaptation Plan actually obliges a province to do, and where the gap between a national commitment and provincial delivery usually opens up.",
      objectives: [
        "Explain the NAP's status and structure",
        "Identify a province's specific obligations",
        "Locate where implementation typically stalls",
      ],
      content: [
        {
          type: "video",
          title: "A plan written nationally, delivered locally",
          minutes: 10,
          caption:
            "The NAP sets direction at a national scale, but almost every action inside it is actually delivered by a provincial or divisional office. This lecture follows one named NAP action from its national chapter down to the provincial department that is - often unknowingly - responsible for it.",
        },
        {
          type: "text",
          heading: "The gap is administrative, not technical",
          body: "Most localisation failures are not caused by a lack of technical knowledge in the province - they are caused by nobody at the provincial level having been told the action exists, or being shown how to read it. Localisation starts as an administrative act: finding the action and naming an owner.",
        },
        {
          type: "materials",
          items: [
            { title: "NAP structure and provincial obligations - briefing", kind: "pdf", size: "1.0 MB" },
          ],
        },
      ],
    },
    {
      id: "reading-the-naps-sector-chapters",
      number: "02",
      title: "Reading the NAP's sector chapters for local relevance",
      kind: "reading",
      minutes: 45,
      summary:
        "How to read a NAP sector chapter for what it means at provincial scale, rather than taking the national framing at face value.",
      objectives: [
        "Extract province-relevant actions from a sector chapter",
        "Separate national-level and sub-national actions",
        "Flag actions with unclear ownership",
      ],
      content: [
        {
          type: "text",
          heading: "Every chapter has a provincial reading",
          body: "A sector chapter written for a national ministry still contains actions that only make sense once translated to a specific province - an irrigation action reads differently in the dry zone than on the wet southwest coast. The chapter itself rarely makes that translation; a province has to do it.",
        },
        {
          type: "text",
          heading: "Unclear ownership is the most common finding",
          body: "The most frequent output of a first localisation read-through is not a list of actions to deliver - it is a list of actions with no province, department or budget line clearly attached to them yet. Naming that gap is itself useful work.",
        },
        {
          type: "materials",
          items: [
            { title: "Sector chapter extraction template", kind: "sheet", size: "110 KB" },
          ],
        },
      ],
    },
    {
      id: "translating-priorities-into-provincial-action",
      number: "03",
      title: "Translating national priorities into provincial action",
      kind: "video",
      minutes: 40,
      summary:
        "Converting a national adaptation priority into a specific, deliverable provincial action - the step most localisation exercises skip.",
      objectives: [
        "Convert a general priority into a specific action",
        "Match an action to a provincial delivery unit",
        "State a realistic timeframe",
      ],
      content: [
        {
          type: "video",
          title: "From 'strengthen resilience' to a named culvert",
          minutes: 9,
          caption:
            "A national priority stated as 'strengthen drainage resilience in flood-prone areas' means nothing until it becomes a specific culvert, on a specific road, sized against a specific rainfall figure. This lecture walks the translation from priority to deliverable action for one province's roads department.",
        },
        {
          type: "text",
          heading: "Specificity is what makes an action fundable",
          body: "A vague provincial action attracts no budget, because nobody can cost it. The same priority, translated into a named site with an estimated cost, is what a budget officer or a climate fund can actually act on.",
        },
        {
          type: "materials",
          items: [
            { title: "Priority-to-action translation worksheet", kind: "sheet", size: "104 KB" },
          ],
        },
      ],
    },
    {
      id: "consulting-divisional-secretariats",
      number: "04",
      title: "Consulting divisional secretariats and local government",
      kind: "reading",
      minutes: 45,
      summary:
        "Running a consultation with divisional secretariats and local authorities that produces real local knowledge rather than a signed attendance sheet.",
      objectives: [
        "Design a consultation that surfaces local priorities",
        "Avoid consultation fatigue",
        "Record input in a form planning can use",
      ],
      content: [
        {
          type: "text",
          heading: "The divisional secretariat already knows the answer",
          body: "Divisional secretariats hold local knowledge no national dataset carries - which roads actually flood, which communities were already relocated once, which measures were tried and abandoned. A localisation exercise that skips this consultation rediscovers, slowly and expensively, what a two-hour meeting would have surfaced.",
        },
        {
          type: "text",
          heading: "One good meeting beats five token ones",
          body: "Local officials asked to attend a fourth consultation on the same plan in a year give a fourth-rate answer. A single, well-prepared session with clear questions and visible follow-through earns better input than a round of box-ticking visits.",
        },
        {
          type: "materials",
          items: [
            { title: "Divisional consultation guide", kind: "pdf", size: "780 KB" },
            { title: "Input recording template", kind: "sheet", size: "72 KB" },
          ],
        },
      ],
    },
    {
      id: "costing-a-localised-adaptation-action",
      number: "05",
      title: "Costing a localised adaptation action",
      kind: "video",
      minutes: 40,
      summary:
        "Putting a defensible cost on a localised adaptation action, using the same discipline a national costing exercise would require.",
      objectives: [
        "Cost a localised action against a unit-cost reference",
        "Include operation and maintenance",
        "Present a cost range, not a single figure",
      ],
      content: [
        {
          type: "video",
          title: "Costing what the national plan left blank",
          minutes: 9,
          caption:
            "National adaptation plans frequently cost a priority at a national scale, or not at all. This lecture builds a bottom-up cost for one localised action - a coastal buffer strip for a specific stretch of shoreline - including the maintenance line that most provincial submissions leave out.",
        },
        {
          type: "text",
          heading: "A range, honestly bounded, survives review",
          body: "A single costed figure invites challenge the moment ground conditions differ from the assumption behind it. A cost presented as a bounded range, with the assumptions stated, survives scrutiny because it has already admitted where it could be wrong.",
        },
        {
          type: "materials",
          items: [
            { title: "Localised costing worksheet", kind: "sheet", size: "150 KB" },
          ],
        },
      ],
    },
    {
      id: "sequencing-across-the-budget-cycle",
      number: "06",
      title: "Sequencing actions across the provincial budget cycle",
      kind: "reading",
      minutes: 45,
      summary:
        "Fitting a set of localised actions into the province's actual budget cycle, rather than a wish list that competes with everything else every year.",
      objectives: [
        "Match actions to budget cycle stages",
        "Sequence actions across multiple years",
        "Avoid an all-at-once submission that gets cut",
      ],
      content: [
        {
          type: "text",
          heading: "The budget cycle does not wait for the plan",
          body: "A provincial budget cycle runs on its own calendar, and an adaptation action submitted after the relevant call for bids waits a full year for nothing but timing. Sequencing starts with knowing the calendar, not the actions.",
        },
        {
          type: "text",
          heading: "Sequence for delivery, not for ambition",
          body: "A submission asking for every action in one year is the easiest one to cut in full. A sequenced submission - a smaller first-year ask that unlocks a second, larger one - survives a tight budget round better than an ambitious one submitted whole.",
        },
        {
          type: "materials",
          items: [
            { title: "Provincial budget cycle map", kind: "pdf", size: "540 KB" },
            { title: "Multi-year sequencing template", kind: "sheet", size: "98 KB" },
          ],
        },
      ],
    },
    {
      id: "monitoring-a-localised-plan",
      number: "07",
      title: "Monitoring and reporting a localised plan",
      kind: "video",
      minutes: 45,
      summary:
        "Setting up monitoring for a localised plan from the day it is adopted, so a province can report progress rather than reconstruct it later.",
      objectives: [
        "Set indicators before implementation starts",
        "Assign reporting responsibility to a named post",
        "Feed provincial monitoring back to the national NAP cycle",
      ],
      content: [
        {
          type: "video",
          title: "Report upward, not just outward",
          minutes: 11,
          caption:
            "A localised plan that only reports to the province it serves quietly disconnects from the national NAP reporting cycle, and the national plan loses visibility of exactly the delivery it depends on. This closing lecture sets up a monitoring structure that reports in both directions from a single indicator set.",
        },
        {
          type: "text",
          heading: "A name against the indicator, not just a target",
          body: "A target with nobody named to report against it drifts unmeasured within a year. Monitoring survives staff turnover only when a specific post - not a person - is made responsible for it, with the reporting date built into that post's own calendar.",
        },
        {
          type: "materials",
          items: [
            { title: "Provincial monitoring indicator set", kind: "sheet", size: "116 KB" },
          ],
        },
      ],
    },
  ],

  "bankable-climate-finance-proposals": [
    {
      id: "what-makes-a-project-bankable",
      number: "01",
      title: "What makes a project bankable",
      kind: "video",
      minutes: 40,
      summary:
        "The difference between a good idea and a financeable one, seen from the side of the institution deciding whether to fund it.",
      objectives: [
        "Identify a revenue or savings stream",
        "Allocate risk to who can carry it",
        "Show the project can be delivered",
      ],
      content: [
        {
          type: "video",
          title: "Read it as the funder does",
          minutes: 10,
          caption:
            "The same project, read twice - once as its author wrote it, once as an appraisal officer reads it. The second reading looks for one thing the first rarely states plainly: what repays the money, and what happens to that if the project underperforms.",
        },
        {
          type: "text",
          heading: "Bankable is not the same as worthwhile",
          body: "A project can be entirely worth doing and still not be bankable, if nothing about it produces a measurable return or saving a funder can point to. Recognising that distinction early saves months spent writing a proposal for the wrong kind of finance.",
        },
        {
          type: "materials",
          items: [
            { title: "Bankability checklist", kind: "sheet", size: "108 KB" },
          ],
        },
      ],
    },
    {
      id: "matching-a-project-to-a-source-of-finance",
      number: "02",
      title: "Matching a project to the right source of finance",
      kind: "reading",
      minutes: 45,
      summary:
        "The sources of climate finance actually available to Sri Lankan applicants, and what each one wants in exchange.",
      objectives: [
        "Map the main sources of finance",
        "Distinguish grant, concessional and commercial",
        "Match a source to a project type",
      ],
      content: [
        {
          type: "text",
          heading: "Every source has an objective",
          body: "A climate fund is not a bank and does not want what a bank wants. Reading the objective a source is accountable for - emissions avoided, adaptation benefit, private capital mobilised - tells you which parts of a project to lead with, and which will simply be tolerated.",
        },
        {
          type: "text",
          heading: "Grant, concessional, commercial: pick correctly",
          body: "A grant-appropriate project pitched to a commercial lender reads as unbankable; a revenue-generating project pitched only for grant funding wastes the strongest thing it has. Matching the finance type to the project's actual cash flow is decided before the proposal is drafted, not during review.",
        },
        {
          type: "materials",
          items: [
            { title: "Sources of climate finance - map", kind: "pdf", size: "1.2 MB" },
          ],
        },
      ],
    },
    {
      id: "building-the-climate-rationale",
      number: "03",
      title: "Building the climate rationale",
      kind: "video",
      minutes: 45,
      summary:
        "Connecting a project to a climate outcome by a chain a reviewer can follow and dispute - the test every concept note is actually held to.",
      objectives: [
        "Write a defensible climate rationale",
        "Distinguish causal claims from correlated ones",
        "Handle a project that would have happened anyway",
      ],
      content: [
        {
          type: "video",
          title: "The chain a reviewer follows",
          minutes: 11,
          caption:
            "A climate rationale has to connect an intervention to a climate outcome by steps someone else can check, not assert. This lecture rewrites a weak rationale - 'this project supports climate resilience' - into a chain of specific, checkable claims, and shows what each rewrite was fixing.",
        },
        {
          type: "text",
          heading: "Projects that were worth doing anyway",
          body: "A project is not disqualified for being sensible on its own merits. What matters is stating plainly what the climate finance specifically buys beyond what would have happened regardless - the increment, not the whole project, is the rationale's job to defend.",
        },
        {
          type: "materials",
          items: [
            { title: "Climate rationale worksheet", kind: "sheet", size: "94 KB" },
          ],
        },
      ],
    },
    {
      id: "structuring-a-concept-note",
      number: "04",
      title: "Structuring a concept note",
      kind: "reading",
      minutes: 40,
      summary:
        "The structure reviewers expect from a concept note, and why departing from it costs more than it saves.",
      objectives: [
        "Structure a concept note in the expected order",
        "Write a problem statement a stranger can follow",
        "Keep the ask specific and singular",
      ],
      content: [
        {
          type: "text",
          heading: "Structure is not bureaucracy, it is comparison",
          body: "A reviewer reads dozens of concept notes against each other. A note in the expected order - problem, rationale, intervention, ask - is compared fairly against the others; a note that reorders itself for effect is compared unfavourably by default, because the reviewer has to work to locate what they need.",
        },
        {
          type: "text",
          heading: "One ask, stated once, early",
          body: "A concept note that buries its funding request in a final paragraph, after pages of context, reads as unsure of itself. State the ask in the first page, then use the rest of the note to justify it.",
        },
        {
          type: "materials",
          items: [
            { title: "Concept note structure - template", kind: "pdf", size: "620 KB" },
          ],
        },
      ],
    },
    {
      id: "modelling-the-financial-case",
      number: "05",
      title: "Modelling the financial case",
      kind: "video",
      minutes: 50,
      summary:
        "Assembling a cash-flow model an appraiser can follow, and stating its assumptions where they can be challenged rather than discovered.",
      objectives: [
        "Build a simple project cash flow",
        "Test it against downside cases",
        "Present assumptions transparently",
      ],
      content: [
        {
          type: "video",
          title: "A model nobody can follow is not evidence",
          minutes: 12,
          caption:
            "The purpose of a financial model in a proposal is to let someone else check the reasoning behind it. This lecture builds a cash-flow model from a real project's numbers, keeping every assumption on one visible sheet rather than buried in a formula.",
        },
        {
          type: "text",
          heading: "Show the case where it fails",
          body: "Appraisers trust a proposal that names the conditions under which it does not work. Running the downside - lower uptake, higher capital cost, delayed commissioning - and stating the point the project stops being viable earns more trust than withholding it, because they will find it either way.",
        },
        {
          type: "materials",
          items: [
            { title: "Cash-flow model skeleton", kind: "sheet", size: "240 KB" },
            { title: "Sensitivity testing note", kind: "pdf", size: "560 KB" },
          ],
        },
      ],
    },
    {
      id: "allocating-risk-correctly",
      number: "06",
      title: "Allocating risk correctly",
      kind: "reading",
      minutes: 40,
      summary:
        "Placing project risk with whoever can actually manage it, and why that decision affects the price a funder sets more than almost anything else.",
      objectives: [
        "Identify the major risk categories in a project",
        "Allocate each risk to the party best able to manage it",
        "Recognise when the public sector should retain a risk",
      ],
      content: [
        {
          type: "text",
          heading: "Risk goes to whoever can control it",
          body: "Bankability is largely a question of whether risks sit with the party able to manage them. Demand risk placed on a contractor who cannot influence demand is priced heavily, or refused outright; the same risk retained by the implementing authority may cost far less across the life of the project.",
        },
        {
          type: "text",
          heading: "Some risks belong with government, deliberately",
          body: "Land acquisition delay, permitting risk and policy risk are usually cheaper for the public sector to hold than to transfer, because the public sector is the party that can actually resolve them. Transferring them anyway is not caution, it is an expensive way to look prudent.",
        },
        {
          type: "materials",
          items: [
            { title: "Risk allocation matrix - template", kind: "sheet", size: "118 KB" },
          ],
        },
      ],
    },
    {
      id: "writing-the-proposal-that-survives-review",
      number: "07",
      title: "Writing the proposal that survives review",
      kind: "video",
      minutes: 45,
      summary:
        "Structure, evidence and the climate rationale together - what reviewers look for first, and what they discount immediately.",
      objectives: [
        "Assemble a complete proposal from its parts",
        "Write an executive summary that survives a four-minute read",
        "Handle the sustainability question directly",
      ],
      content: [
        {
          type: "video",
          title: "The first two pages decide it",
          minutes: 12,
          caption:
            "Reviewers form a view early and read the rest of a proposal to confirm or overturn it. This lecture rewrites the opening of a real proposal - problem, rationale, intervention, and what changes if it is funded - and shows what each revision was fixing.",
        },
        {
          type: "text",
          heading: "Sustainability is a specific question",
          body: "'What happens after the funded period ends' is asked of almost every proposal, and a vague answer is one of the most common reasons a concept note is not advanced. Naming a specific institution, budget line or revenue stream that continues the work after funding closes is what the question is actually asking for.",
        },
        {
          type: "materials",
          items: [
            { title: "Full proposal - annotated example", kind: "pdf", size: "1.8 MB" },
            { title: "Reviewer's scoring rubric", kind: "sheet", size: "112 KB" },
          ],
        },
      ],
    },
    {
      id: "reporting-once-finance-is-approved",
      number: "08",
      title: "Reporting once the finance is approved",
      kind: "reading",
      minutes: 55,
      summary:
        "The obligations that come with accepted finance, and budgeting for them before signature rather than after the first report is due.",
      objectives: [
        "List the standard reporting obligations",
        "Budget for verification",
        "Set up data collection at the start of implementation",
      ],
      content: [
        {
          type: "text",
          heading: "Compliance is a line item, not an afterthought",
          body: "Monitoring, third-party verification and annual reporting consume a real share of a facility's budget, and a proposal that omits the cost funds the project but not the obligations attached to it. Funders expect to see it costed, not discover its absence.",
        },
        {
          type: "text",
          heading: "Collect from day one",
          body: "Impact reporting asks for baselines and time series that cannot be reconstructed later. Set up the data collection when the agreement is signed, not when the first report is due, or that report will be an estimate defended in front of people whose job is to audit estimates.",
        },
        {
          type: "materials",
          items: [
            { title: "Reporting obligations checklist", kind: "sheet", size: "96 KB" },
          ],
        },
      ],
    },
  ],

  "gender-social-inclusion": [
    {
      id: "gsi-as-a-planning-discipline",
      number: "01",
      title: "Why GSI is a planning discipline, not an add-on",
      kind: "video",
      minutes: 35,
      summary:
        "What Gender Equality and Social Inclusion actually means as a working discipline, and why bolting it onto a finished plan produces worse outcomes than building it in from the start.",
      objectives: [
        "Define GSI as distinct from a stand-alone women's programme",
        "Name the groups a GSI lens routinely misses",
        "Explain why late-stage GSI review changes little",
      ],
      content: [
        {
          type: "video",
          title: "Not a chapter, a lens",
          minutes: 8,
          caption:
            "A GSI annex added after a plan is written rarely changes what the plan actually does. This opening lecture shows what changes when the same lens is applied from the first consultation instead - using one district plan revised at two different stages to show the difference.",
        },
        {
          type: "text",
          heading: "GSI is wider than gender alone",
          body: "Gender is the most visible axis of exclusion and the one most often addressed, but disability, age, ethnicity, language and poverty routinely decide who benefits from a plan just as much. A GSI approach that only asks about women misses most of who it is meant to include.",
        },
        {
          type: "materials",
          items: [
            { title: "GSI Module 01 - slide deck", kind: "slides", size: "1.8 MB" },
            { title: "GSI glossary of terms", kind: "pdf", size: "260 KB" },
          ],
        },
      ],
    },
    {
      id: "reading-a-situation-through-a-gsi-lens",
      number: "02",
      title: "Reading a situation through a GSI lens",
      kind: "reading",
      minutes: 40,
      summary:
        "A structured way to read who is affected by a plan or a project, and who was left out of the version already on the table.",
      objectives: [
        "Map stakeholders by exposure and by voice",
        "Identify who was consulted and who was not",
        "Read a plan for its unstated assumptions",
      ],
      content: [
        {
          type: "text",
          heading: "Two questions, asked separately",
          body: "Who is affected by a decision and who had a say in it are two different questions, and a plan can score well on one while failing the other completely. Reading a plan through a GSI lens means asking both, and naming the gap when they diverge.",
        },
        {
          type: "text",
          heading: "The unstated assumption is the one that excludes",
          body: "A consultation scheduled for a weekday afternoon assumes the attendee does not do paid or unpaid care work that hour. Most exclusion in planning is not a decision, it is an unexamined assumption about who the 'typical' participant is.",
        },
        {
          type: "materials",
          items: [
            { title: "Stakeholder mapping worksheet", kind: "sheet", size: "92 KB" },
          ],
        },
      ],
    },
    {
      id: "designing-an-inclusive-consultation",
      number: "03",
      title: "Designing an inclusive consultation",
      kind: "video",
      minutes: 45,
      summary:
        "Designing a consultation that reaches people a standard meeting misses, without turning the exercise into a much larger undertaking.",
      objectives: [
        "Identify barriers to standard consultation formats",
        "Design at least one alternative format",
        "Record input from people who could not attend in person",
      ],
      content: [
        {
          type: "video",
          title: "Who the standard meeting already excludes",
          minutes: 10,
          caption:
            "A single public meeting, on a working day, at the district office, quietly filters out shift workers, carers, people with mobility restrictions and anyone without transport. This lecture redesigns one such consultation into a small number of parallel formats that reach each of those groups without multiplying the budget.",
        },
        {
          type: "text",
          heading: "Small and local beats large and central",
          body: "Three short sessions held in different wards, at different times, typically surface more usable input than one large central meeting - and cost less, because travel and venue costs fall rather than rise with the split.",
        },
        {
          type: "materials",
          items: [
            { title: "Inclusive consultation design guide", kind: "pdf", size: "890 KB" },
          ],
        },
      ],
    },
    {
      id: "setting-gsi-indicators-that-mean-something",
      number: "04",
      title: "Setting GSI indicators that mean something",
      kind: "reading",
      minutes: 40,
      summary:
        "Choosing GSI indicators that can actually be measured and that change behaviour, rather than indicators chosen because the data already exists.",
      objectives: [
        "Distinguish a meaningful indicator from a convenient one",
        "Set a baseline before the intervention starts",
        "Avoid indicators that reward participation over outcome",
      ],
      content: [
        {
          type: "text",
          heading: "Available is not the same as meaningful",
          body: "'Number of women attending' is easy to count and measures almost nothing about whether the plan changed anything for them. A meaningful indicator asks what changed - access, decision-making role, resource control - not who showed up.",
        },
        {
          type: "text",
          heading: "Baseline first, always",
          body: "An indicator without a baseline can only ever report a number, never a change. Setting the baseline before an intervention starts is the single most commonly skipped step in GSI monitoring, and the one that makes every later report defensible.",
        },
        {
          type: "materials",
          items: [
            { title: "GSI indicator selection guide", kind: "sheet", size: "104 KB" },
            { title: "Baseline data collection template", kind: "sheet", size: "78 KB" },
          ],
        },
      ],
    },
    {
      id: "mainstreaming-gsi-into-a-sector-plan",
      number: "05",
      title: "Mainstreaming GSI into a sector plan",
      kind: "video",
      minutes: 45,
      summary:
        "Embedding GSI into a sector plan's actual decisions - budget lines, procurement criteria, staffing - rather than a preamble nobody reads.",
      objectives: [
        "Locate the decision points a sector plan actually makes",
        "Attach a GSI requirement to a specific decision point",
        "Avoid GSI language with no operational consequence",
      ],
      content: [
        {
          type: "video",
          title: "Find the decision, not the paragraph",
          minutes: 11,
          caption:
            "Mainstreaming succeeds or fails at specific decision points - who qualifies for a subsidy, what a procurement scores on, who sits on a selection panel - not in a plan's introductory language. This lecture finds four such decision points in a real sector plan and attaches a specific, checkable GSI requirement to each.",
        },
        {
          type: "text",
          heading: "A requirement with no consequence is a wish",
          body: "'Gender considerations will be taken into account' commits nobody to anything. 'At least one of three technical panel members must be trained in GSI screening' can be checked, and only the second kind of statement changes what a sector plan actually does.",
        },
        {
          type: "materials",
          items: [
            { title: "Sector plan mainstreaming checklist", kind: "sheet", size: "112 KB" },
          ],
        },
      ],
    },
    {
      id: "handling-exclusion-when-you-find-it",
      number: "06",
      title: "Handling exclusion when you find it",
      kind: "reading",
      minutes: 40,
      summary:
        "What to do once an assessment or a consultation surfaces real exclusion, rather than recording it and moving on.",
      objectives: [
        "Distinguish a finding from a response",
        "Prioritise responses within a limited budget",
        "Report back to the people who raised the issue",
      ],
      content: [
        {
          type: "text",
          heading: "A finding without a response trains people not to speak",
          body: "A community that raises an exclusion issue and sees no visible response learns, correctly, that raising it again is a waste of their time. The response does not have to be immediate or complete, but it has to be visible.",
        },
        {
          type: "text",
          heading: "Close the loop, even with a partial answer",
          body: "Reporting back - even to say a raised issue could not be funded this cycle and why - keeps a consultation channel usable for the next round. Silence after a finding is what ends participation, not the limits of the budget itself.",
        },
        {
          type: "materials",
          items: [
            { title: "Exclusion-response prioritisation template", kind: "sheet", size: "86 KB" },
          ],
        },
      ],
    },
    {
      id: "reporting-on-gsi-without-tokenism",
      number: "07",
      title: "Reporting on GSI without tokenism",
      kind: "video",
      minutes: 55,
      summary:
        "Reporting GSI progress in a way that survives scrutiny, avoiding both the token photograph and the number that means nothing on its own.",
      objectives: [
        "Choose reporting formats that show outcomes, not optics",
        "Avoid the most common tokenism traps",
        "Present a GSI report alongside the sector results it sits within",
      ],
      content: [
        {
          type: "video",
          title: "The photograph is not the report",
          minutes: 13,
          caption:
            "A page of photographs captioned 'women participants' is the most common form GSI reporting takes and the least informative. This closing lecture rebuilds a real GSI report around outcome indicators instead - what changed, for whom, against the baseline set earlier in this module - and shows what the photograph-led version was actually hiding.",
        },
        {
          type: "text",
          heading: "Report GSI inside the sector result, not beside it",
          body: "A GSI report filed separately from the sector's main results reads as a compliance exercise. Presented inside the same report - this is what the irrigation scheme delivered, and this is who it reached - GSI reporting reads as part of judging whether the scheme worked at all, which is the point.",
        },
        {
          type: "materials",
          items: [
            { title: "GSI reporting template", kind: "pdf", size: "740 KB" },
          ],
        },
      ],
    },
  ],

  "gender-responsive-budgeting": [
    {
      id: "what-grb-actually-changes",
      number: "01",
      title: "What gender-responsive budgeting actually changes",
      kind: "video",
      minutes: 40,
      summary:
        "What gender-responsive budgeting is not - a separate fund for women - and what it actually is: a way of reading and building an ordinary budget.",
      objectives: [
        "Correct the most common misunderstanding of GRB",
        "Explain what a gender-responsive budget actually contains",
        "Locate GRB inside the existing budget cycle",
      ],
      content: [
        {
          type: "video",
          title: "It is not a separate budget",
          minutes: 9,
          caption:
            "The most persistent misconception about gender-responsive budgeting is that it means setting aside a fund earmarked for women. This opening lecture corrects that directly: GRB is a method for examining and adjusting the whole budget - every vote, not a new one - for who it actually reaches.",
        },
        {
          type: "text",
          heading: "The same rupee, read differently",
          body: "A road maintenance budget line looks gender-neutral until it is read against who walks, who drives, and whose unpaid care journeys depend on the footpath rather than the carriageway. GRB does not add spending; it changes how existing spending is examined and, where the reading shows a gap, adjusted.",
        },
        {
          type: "materials",
          items: [
            { title: "GRB Module 01 - slide deck", kind: "slides", size: "1.9 MB" },
          ],
        },
      ],
    },
    {
      id: "reading-a-budget-for-who-it-reaches",
      number: "02",
      title: "Reading a budget for who it reaches",
      kind: "reading",
      minutes: 35,
      summary:
        "A practical method for reading an existing budget line for who benefits from it, before proposing any change.",
      objectives: [
        "Read a budget line against beneficiary data",
        "Identify a line that looks neutral but is not",
        "Avoid assuming neutrality without checking",
      ],
      content: [
        {
          type: "text",
          heading: "Gender-neutral language is not gender-neutral spending",
          body: "A budget line written in gender-neutral language - 'agricultural extension services' - can still reach men and women in very different proportions if extension officers visit farms during hours or through channels that only one group can access. The line is neutral on paper and not neutral in effect.",
        },
        {
          type: "text",
          heading: "Check before you conclude",
          body: "The only way to know whether a line is genuinely neutral in effect is to check who used it last year, disaggregated by sex where the data exists. Assuming neutrality from the wording alone is the single most common error in a first budget read-through.",
        },
        {
          type: "materials",
          items: [
            { title: "Budget line reading worksheet", kind: "sheet", size: "84 KB" },
          ],
        },
      ],
    },
    {
      id: "gender-budget-statements",
      number: "03",
      title: "Gender budget statements: what goes in one",
      kind: "video",
      minutes: 45,
      summary:
        "What a gender budget statement actually contains, and how to write one that a treasury officer will accept rather than return.",
      objectives: [
        "Structure a gender budget statement",
        "Support each claim with data",
        "Avoid a statement that restates the budget without analysis",
      ],
      content: [
        {
          type: "video",
          title: "Analysis, not a restated budget",
          minutes: 11,
          caption:
            "A gender budget statement that lists spending by ministry without analysing who it reaches is rejected as often as it is approved. This lecture builds a statement from a real sector budget, showing the analysis a treasury officer is actually checking for underneath the required format.",
        },
        {
          type: "text",
          heading: "Every claim needs a number behind it",
          body: "'This programme benefits women and men equally' is a claim, not evidence. A statement that instead says '58% of participants in 2025 were women, against a target beneficiary population that is 51% women' gives a reviewer something to check, and something that survives scrutiny.",
        },
        {
          type: "materials",
          items: [
            { title: "Gender budget statement template", kind: "pdf", size: "920 KB" },
          ],
        },
      ],
    },
    {
      id: "sex-disaggregated-data",
      number: "04",
      title: "Sex-disaggregated data: finding and using it",
      kind: "reading",
      minutes: 40,
      summary:
        "Where sex-disaggregated data actually exists in the public sector, and how to work with what exists when the ideal dataset does not.",
      objectives: [
        "Locate existing sex-disaggregated administrative data",
        "Assess data quality before using it",
        "Work credibly with a partial dataset",
      ],
      content: [
        {
          type: "text",
          heading: "More exists than most officers expect",
          body: "Beneficiary registers, training attendance sheets and service uptake records are frequently already collected by sex, even where nobody has analysed them that way. The first step is rarely commissioning new data collection - it is asking what is already sitting in an existing register.",
        },
        {
          type: "text",
          heading: "A partial dataset, used honestly, still helps",
          body: "Where disaggregated data covers only part of a programme or a recent year, using it with that limitation stated is more credible than waiting for a complete dataset that may never arrive. State the coverage, and the gap becomes part of the evidence rather than a reason to say nothing.",
        },
        {
          type: "materials",
          items: [
            { title: "Data source inventory - public sector", kind: "pdf", size: "680 KB" },
            { title: "Data quality checklist", kind: "sheet", size: "70 KB" },
          ],
        },
      ],
    },
    {
      id: "costing-a-gender-responsive-intervention",
      number: "05",
      title: "Costing a gender-responsive intervention",
      kind: "video",
      minutes: 35,
      summary:
        "Putting a specific cost on a gender-responsive adjustment to an existing programme, rather than treating GRB as a costless exercise in review.",
      objectives: [
        "Identify the marginal cost of a gender-responsive adjustment",
        "Distinguish design changes from new spending",
        "Present the cost alongside the benefit it targets",
      ],
      content: [
        {
          type: "video",
          title: "The adjustment usually costs less than expected",
          minutes: 8,
          caption:
            "Shifting an extension visit schedule, adding a second consultation time, or translating a form into the language most applicants actually use are typically marginal design changes, not new budget lines. This lecture costs three such adjustments against a real programme budget to show how small the increment usually is.",
        },
        {
          type: "text",
          heading: "State the cost against the gap it closes",
          body: "A costed adjustment presented beside the participation gap it is meant to close - not as an abstract 'inclusion cost' - is far easier for a budget officer to approve, because the return on the marginal spend is stated in the same breath as the spend itself.",
        },
        {
          type: "materials",
          items: [
            { title: "Marginal costing worksheet", kind: "sheet", size: "98 KB" },
          ],
        },
      ],
    },
    {
      id: "auditing-a-budget-circular-for-gsi-compliance",
      number: "06",
      title: "Auditing a budget circular for GSI compliance",
      kind: "reading",
      minutes: 45,
      summary:
        "Checking a budget circular against GSI compliance requirements before submission, rather than after it is returned.",
      objectives: [
        "Read a budget circular for its GSI requirements",
        "Run a compliance check before submission",
        "Avoid the most common reasons a submission is returned",
      ],
      content: [
        {
          type: "text",
          heading: "The circular already tells you what it wants",
          body: "Budget circulars increasingly state their gender-responsive requirements directly - a disaggregation requirement, a mandatory statement, a specific annex. Missing a stated requirement is an avoidable rejection, not a technical judgment call, and a checklist against the circular's own text catches most of them.",
        },
        {
          type: "text",
          heading: "The three reasons submissions come back",
          body: "In practice, most GRB submissions are returned for the same three reasons: no baseline data, a claim with no evidence behind it, or a gender budget statement that restates the budget without analysis. Checking a draft against these three before submission clears most of a review cycle.",
        },
        {
          type: "materials",
          items: [
            { title: "Budget circular GSI compliance checklist", kind: "sheet", size: "90 KB" },
          ],
        },
      ],
    },
    {
      id: "reporting-gender-responsive-spending-upward",
      number: "07",
      title: "Reporting gender-responsive spending upward",
      kind: "video",
      minutes: 60,
      summary:
        "Reporting gender-responsive spending upward through the budget cycle so it is counted, credited and used to justify the next allocation.",
      objectives: [
        "Report against the indicators set earlier in the cycle",
        "Route a report to where it is actually read",
        "Use a completed report to strengthen the next year's ask",
      ],
      content: [
        {
          type: "video",
          title: "Uncounted spending cannot be defended",
          minutes: 14,
          caption:
            "Spending that is not tagged and reported as gender-responsive cannot be counted at the national level, and an institution that cannot demonstrate its own record is in a weak position when the next budget round is negotiated. This closing lecture builds an upward report from the indicators, baselines and costings set earlier in the module, and follows it to where it is actually read in the budget cycle.",
        },
        {
          type: "text",
          heading: "Last year's report is next year's evidence",
          body: "A completed, well-evidenced gender budget report is the strongest argument for the following year's allocation - it is proof the previous investment worked, rather than a promise that the next one will. Institutions that report consistently tend to be trusted with larger, less-scrutinised allocations over time.",
        },
        {
          type: "materials",
          items: [
            { title: "Upward reporting template", kind: "pdf", size: "860 KB" },
            { title: "Multi-year GRB tracking sheet", kind: "sheet", size: "104 KB" },
          ],
        },
      ],
    },
  ],
};
