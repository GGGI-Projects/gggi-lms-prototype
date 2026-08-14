/**
 * The curriculum: every module of every programme, and what is inside it.
 *
 * Same job as `content/site.ts` - this is mock data standing in for what will
 * later be an API response, kept in one file so copy changes never touch a
 * component. `site.ts` owns what the LANDING page says about a programme
 * (summary, topics, totals); this owns what a LEARNER sees once they are
 * inside it.
 *
 * The two must agree: `MODULES[id].length` has to equal `PROGRAMMES[i].modules`,
 * or the marketing page promises nine modules and the programme page shows
 * eight. `lib/portal.ts` asserts this in development rather than leaving it to
 * be spotted in a demo.
 *
 * A module is a short list of CONTENT BLOCKS rather than a single body of
 * prose, because the real platform will mix three kinds of thing inside one
 * module - a recorded lecture, written material, and files to take away - and
 * the module page has to be built to render them in any order. Every module
 * here carries at least one primary block (video or text) and a materials
 * block, so the page has all three shapes to draw from whichever module is
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
   * A recorded lecture. There is no video file in the prototype - the player
   * is a mock (see `<VideoStage>`), and `caption` is what a learner would
   * otherwise get from the first thirty seconds of it.
   */
  | { type: "video"; title: string; minutes: number; caption: string }
  /** Written material. One heading, one passage - never a wall. */
  | { type: "text"; heading: string; body: string }
  /** Files attached to the module. */
  | { type: "materials"; items: Material[] };

export type Module = {
  id: string;
  /** Two digits, like the programme numerals on the landing page. */
  number: string;
  title: string;
  /**
   * What the module mostly IS, for the badge in a list. A video module still
   * carries written material and a reading module can still carry a clip; this
   * is the headline, not an exclusive category.
   */
  kind: "video" | "reading";
  /**
   * Estimated study time for the WHOLE module - the lecture plus the written
   * material plus working through the attachments - not the length of the
   * video, which the video block carries separately. The modules of a
   * programme sum to the hours `content/site.ts` advertises for it, and
   * `lib/portal.ts` checks that in development.
   */
  minutes: number;
  summary: string;
  /** Three, always. A list of five stops being read. */
  objectives: string[];
  content: ContentBlock[];
};

/* ------------------------------------------------------------------ modules */

/** Keyed by `Programme["id"]` from `content/site.ts`. */
export const MODULES: Record<string, Module[]> = {
  "climate-resilience": [
    {
      id: "why-climate-reaches-your-desk",
      number: "01",
      title: "Why climate reaches your desk",
      kind: "video",
      minutes: 35,
      summary:
        "How a global temperature figure turns into a decision an officer has to sign, and why adaptation arrives as an administrative problem before it arrives as a technical one.",
      objectives: [
        "Trace a climate signal to a departmental decision",
        "Separate mitigation from adaptation",
        "Name who is accountable for what",
      ],
      content: [
        {
          type: "video",
          title: "From global average to local decision",
          minutes: 8,
          caption:
            "A degree and a half is an abstraction until it is a drainage culvert sized for rainfall that no longer happens. This opening lecture follows one number down through the levels of government until it becomes a line in a procurement file.",
        },
        {
          type: "text",
          heading: "Adaptation is not a separate workstream",
          body: "Departments often set up adaptation as its own unit, which is how it ends up parallel to the work rather than inside it. Every roads budget, every housing approval and every water licence already makes an assumption about the climate. Adaptation is the practice of making that assumption explicit and checking it.",
        },
        {
          type: "materials",
          items: [
            { title: "Module 01 - lecture slides", kind: "slides", size: "2.1 MB" },
            { title: "Glossary of adaptation terms", kind: "pdf", size: "480 KB" },
          ],
        },
      ],
    },
    {
      id: "reading-a-climate-risk-assessment",
      number: "02",
      title: "Reading a climate risk assessment",
      kind: "reading",
      minutes: 45,
      summary:
        "The structure every risk assessment shares, and the four places where the numbers in one are usually weakest.",
      objectives: [
        "Find the hazard, exposure and vulnerability sections",
        "Check which scenario the figures assume",
        "Read an uncertainty range honestly",
      ],
      content: [
        {
          type: "text",
          heading: "Hazard, exposure, vulnerability",
          body: "Risk is not a hazard. A cyclone over open sea is a hazard and no risk at all; the same cyclone over a coastal town is a risk because something is exposed to it and unable to absorb it. Any assessment worth reading treats those three as separate quantities, and tells you which one it measured well.",
        },
        {
          type: "text",
          heading: "Which future is being described",
          body: "Every projection is conditional on a scenario. An assessment that quotes a single sea-level figure without naming its scenario and time horizon has not given you a number, it has given you a mood. Look for the horizon first, then the scenario, then the confidence range - in that order.",
        },
        {
          type: "materials",
          items: [
            {
              title: "Worked example - district risk assessment",
              kind: "pdf",
              size: "1.6 MB",
            },
            { title: "Assessment reading checklist", kind: "sheet", size: "92 KB" },
          ],
        },
      ],
    },
    {
      id: "sri-lanka-exposure",
      number: "03",
      title: "Exposure in Sri Lanka: heat, rain, sea",
      kind: "video",
      minutes: 40,
      summary:
        "What the observed record already shows for the island, and which three changes are doing most of the damage to public assets.",
      objectives: [
        "Read the observed trend, not the projection",
        "Rank hazards by what they cost",
        "Locate the districts most exposed",
      ],
      content: [
        {
          type: "video",
          title: "What the record already shows",
          minutes: 10,
          caption:
            "Before any projection, the observed record: rainfall arriving in fewer and heavier events, a lengthening dry spell in the intermediate zone, and a coastline losing ground faster than the maps behind most planning decisions admit.",
        },
        {
          type: "text",
          heading: "Intensity, not just totals",
          body: "Annual rainfall totals have moved less than people expect. What has moved is how the rain arrives - the same volume delivered in fewer, harder events, which is a drainage problem rather than a water-supply one. Infrastructure sized on annual averages is sized for a climate that no longer exists.",
        },
        {
          type: "materials",
          items: [
            {
              title: "District exposure summary - all 25",
              kind: "dataset",
              size: "310 KB",
            },
          ],
        },
      ],
    },
    {
      id: "vulnerability-and-who-carries-it",
      number: "04",
      title: "Vulnerability and who carries it",
      kind: "reading",
      minutes: 40,
      summary:
        "Why two communities behind the same sea wall experience the same storm differently, and what that means for how a measure is targeted.",
      objectives: [
        "Distinguish sensitivity from adaptive capacity",
        "Read a vulnerability index critically",
        "Target a measure at the people it protects",
      ],
      content: [
        {
          type: "text",
          heading: "The same hazard, two outcomes",
          body: "Vulnerability is the part of risk that policy can act on fastest. A household with savings, a second income and a title deed recovers from a flood; the household next door, with none of the three, does not. Nothing about the water was different. Measures that ignore this protect the people who were already protected.",
        },
        {
          type: "text",
          heading: "What an index hides",
          body: "A composite vulnerability score is useful for ranking and dangerous for designing. It compresses a dozen distinct conditions into one number, and two districts scoring 0.61 may need entirely opposite interventions. Use the index to decide where to look, and the underlying indicators to decide what to do.",
        },
        {
          type: "materials",
          items: [
            {
              title: "Vulnerability indicators - working list",
              kind: "sheet",
              size: "120 KB",
            },
            { title: "Case note: two wards, one flood", kind: "pdf", size: "740 KB" },
          ],
        },
      ],
    },
    {
      id: "inside-the-national-adaptation-plan",
      number: "05",
      title: "Inside the National Adaptation Plan",
      kind: "video",
      minutes: 35,
      summary:
        "What the NAP actually obliges a department to do, how its sector chapters are organised, and where your own work already appears in it.",
      objectives: [
        "Navigate the plan's sector structure",
        "Find your department's named actions",
        "Understand the reporting cycle",
      ],
      content: [
        {
          type: "video",
          title: "The plan, chapter by chapter",
          minutes: 9,
          caption:
            "A guided read of the plan's structure - the sector chapters, the cross-cutting actions, and the annexes where the costed measures and the responsible agencies are actually listed. Most officers have never been shown the annexes.",
        },
        {
          type: "text",
          heading: "You are probably already in it",
          body: "Departments frequently discover they hold named actions in the plan that nobody in the building is tracking. The actions were agreed at ministry level and never travelled down. Finding yours is a fifteen-minute exercise and it changes what you can put in a budget submission.",
        },
        {
          type: "materials",
          items: [
            { title: "NAP sector chapter map", kind: "pdf", size: "1.1 MB" },
            {
              title: "Where to find your department's actions",
              kind: "link",
            },
          ],
        },
      ],
    },
    {
      id: "choosing-adaptation-options",
      number: "06",
      title: "Choosing between adaptation options",
      kind: "reading",
      minutes: 45,
      summary:
        "Hard infrastructure, ecosystem-based measures and behavioural change compared on the terms a department is actually judged by.",
      objectives: [
        "Compare grey, green and soft measures",
        "Apply a no-regrets test",
        "Avoid locking in a bad assumption",
      ],
      content: [
        {
          type: "text",
          heading: "No-regrets first",
          body: "A no-regrets measure pays for itself under the climate you have now, and pays more under the climate you are heading into. Fixing a leaking distribution network is one. Because it does not depend on a projection being right, it is the easiest kind of measure to defend in a budget hearing, and it should be exhausted before anything harder is proposed.",
        },
        {
          type: "text",
          heading: "The lock-in problem",
          body: "A sea wall built to one design standard commits the coastline behind it for fifty years, including the settlement that grows in its shadow because the wall made the land look safe. Measures that can be adjusted later - raised in stages, extended, abandoned cheaply - are worth a real premium over ones that cannot.",
        },
        {
          type: "materials",
          items: [
            {
              title: "Options appraisal template",
              kind: "sheet",
              size: "160 KB",
            },
          ],
        },
      ],
    },
    {
      id: "costing-an-adaptation-measure",
      number: "07",
      title: "Costing an adaptation measure",
      kind: "video",
      minutes: 40,
      summary:
        "How to put a defensible number on a measure when the benefit is a loss that did not happen.",
      objectives: [
        "Cost avoided damage, not just capital",
        "Include operation and maintenance",
        "State the assumptions with the number",
      ],
      content: [
        {
          type: "video",
          title: "Costing what did not happen",
          minutes: 10,
          caption:
            "The central difficulty of adaptation economics: the benefit is an absence. This lecture walks through an avoided-damage calculation for a drainage upgrade, including the maintenance line that most submissions leave out and that decides whether the asset survives a decade.",
        },
        {
          type: "text",
          heading: "Maintenance is the measure",
          body: "An adaptation asset with no maintenance budget is a capital expense with a five-year life pretending to be a thirty-year one. Where the operating cost cannot be secured, the honest move is to propose a smaller measure that can be maintained rather than a larger one that cannot.",
        },
        {
          type: "materials",
          items: [
            { title: "Avoided-damage worksheet", kind: "sheet", size: "180 KB" },
            { title: "Unit cost reference - common measures", kind: "pdf", size: "890 KB" },
          ],
        },
      ],
    },
    {
      id: "adaptation-in-a-budget-line",
      number: "08",
      title: "Writing adaptation into a budget line",
      kind: "reading",
      minutes: 45,
      summary:
        "Where adaptation spending sits in the estimates, and how to write a submission that survives the treasury officer reading it.",
      objectives: [
        "Place a measure in the right budget head",
        "Write a justification that answers the obvious question",
        "Tag spending so it can be reported",
      ],
      content: [
        {
          type: "text",
          heading: "The question you will be asked",
          body: "Every adaptation submission meets the same challenge: why now, and why this amount. A submission that answers it in its first paragraph - with the observed trend, the exposed asset and the cost of losing it - clears review far more often than one that opens with international commitments.",
        },
        {
          type: "text",
          heading: "Tagging, and why it matters later",
          body: "Spending that is not tagged as climate-related cannot be counted, and a country that cannot count its own adaptation spending is in a weak position when it asks for external finance. Tagging costs a field on a form and is the cheapest thing in this module.",
        },
        {
          type: "materials",
          items: [
            { title: "Budget submission - annotated example", kind: "pdf", size: "1.3 MB" },
            { title: "Climate expenditure tagging codes", kind: "sheet", size: "88 KB" },
          ],
        },
      ],
    },
    {
      id: "monitoring-what-adaptation-achieved",
      number: "09",
      title: "Monitoring what adaptation achieved",
      kind: "video",
      minutes: 35,
      summary:
        "Choosing indicators that show whether a measure worked, rather than indicators that show it was built.",
      objectives: [
        "Separate output from outcome indicators",
        "Set a baseline before the measure",
        "Report against the plan's cycle",
      ],
      content: [
        {
          type: "video",
          title: "Built is not the same as working",
          minutes: 9,
          caption:
            "Kilometres of drain laid is an output. Households not flooded in the following monsoon is an outcome. This closing lecture builds a small indicator set for one measure and shows how to collect the baseline before construction starts - which is the only moment it can be collected.",
        },
        {
          type: "text",
          heading: "Baselines cannot be recovered",
          body: "The single most common failure in adaptation monitoring is starting to measure after the work is finished, which leaves nothing to compare against. A baseline is a week of effort before the contract is signed and it is unrecoverable afterwards.",
        },
        {
          type: "materials",
          items: [
            { title: "Indicator set - starter list", kind: "sheet", size: "104 KB" },
          ],
        },
      ],
    },
  ],

  "circular-economy": [
    {
      id: "collect-and-dump-to-recover",
      number: "01",
      title: "From collect-and-dump to recover-and-reuse",
      kind: "video",
      minutes: 35,
      summary:
        "What changes in a local authority when waste stops being a disposal problem and starts being a stream of materials with a value.",
      objectives: [
        "Describe the linear and circular models",
        "Locate the value in a waste stream",
        "See where the current system loses it",
      ],
      content: [
        {
          type: "video",
          title: "The same lorry, a different job",
          minutes: 9,
          caption:
            "A circular system is not built by buying different lorries. It is built by changing what happens in the ten minutes before the lorry arrives, at the household. This lecture follows one district's transition and the three decisions that made it hold.",
        },
        {
          type: "text",
          heading: "Where the value leaks",
          body: "Mixed waste is worth close to nothing. The same material, kept separate at the point it is discarded, is worth enough to fund part of the collection that moved it. Almost the entire economics of a circular scheme is decided in the household, not at the facility.",
        },
        {
          type: "materials",
          items: [
            { title: "Module 01 - lecture slides", kind: "slides", size: "2.4 MB" },
          ],
        },
      ],
    },
    {
      id: "characterising-a-waste-stream",
      number: "02",
      title: "Characterising a waste stream",
      kind: "reading",
      minutes: 40,
      summary:
        "How to find out what is actually in your authority's waste, using a method a small team can run in a week.",
      objectives: [
        "Run a simple characterisation study",
        "Sample without biasing the result",
        "Convert findings into a recovery estimate",
      ],
      content: [
        {
          type: "text",
          heading: "You cannot plan for waste you have not weighed",
          body: "Most municipal plans quote national composition figures because no local study exists. Composition varies enormously between a coastal town, a hill town and a city ward - organic fractions between forty and seventy per cent - and a facility sized on the wrong figure is the most expensive mistake available in this field.",
        },
        {
          type: "text",
          heading: "A week, eight households, four rounds",
          body: "A defensible characterisation needs a stratified sample across income levels and housing types, repeated across the week to catch the weekend shift, and separated into no more than eight categories. Finer categories look rigorous and are rarely used by any decision that follows.",
        },
        {
          type: "materials",
          items: [
            { title: "Characterisation protocol", kind: "pdf", size: "980 KB" },
            { title: "Field recording sheet", kind: "sheet", size: "76 KB" },
          ],
        },
      ],
    },
    {
      id: "segregation-at-source",
      number: "03",
      title: "Segregation at source, in practice",
      kind: "video",
      minutes: 40,
      summary:
        "Why household separation schemes fail, and the small number of operational details that decide whether one survives its first six months.",
      objectives: [
        "Design a two- or three-bin scheme",
        "Keep collection days consistent",
        "Handle the first non-compliant month",
      ],
      content: [
        {
          type: "video",
          title: "The scheme fails on the third week",
          minutes: 11,
          caption:
            "Households separate reliably until the first time a mixed lorry takes both bins in front of them. This lecture is about the operational discipline that prevents that moment, and what to do in the month after it happens anyway.",
        },
        {
          type: "text",
          heading: "Two bins before three",
          body: "Organic and non-organic is a distinction every household already understands. Adding a third and fourth stream at launch raises the error rate on all of them. Schemes that start with two, hold them for a year and then split the dry stream consistently outperform schemes that launch with four.",
        },
        {
          type: "materials",
          items: [
            { title: "Household leaflet - editable", kind: "pdf", size: "620 KB" },
            { title: "Collection roster template", kind: "sheet", size: "110 KB" },
          ],
        },
      ],
    },
    {
      id: "composting-and-organic-recovery",
      number: "04",
      title: "Composting and organic recovery",
      kind: "reading",
      minutes: 35,
      summary:
        "The organic fraction is the majority of Sri Lankan municipal waste. What to do with it at household, ward and district scale.",
      objectives: [
        "Match a method to a scale",
        "Manage moisture and odour",
        "Find an outlet for the product",
      ],
      content: [
        {
          type: "text",
          heading: "Scale decides the method",
          body: "Household bins, ward-level windrows and district composting plants are three different operations with different failure modes. The common error is choosing the largest option available with the funding on offer, then discovering the collection system cannot feed it and the plant runs at a fifth of capacity.",
        },
        {
          type: "text",
          heading: "Compost nobody wants is still waste",
          body: "A plant that produces material it cannot sell or give away has moved the problem, not solved it. Secure the outlet - estates, nurseries, municipal landscaping, farmer cooperatives - before the plant is commissioned, and test the product against what that buyer will actually accept.",
        },
        {
          type: "materials",
          items: [
            { title: "Composting methods compared", kind: "pdf", size: "1.2 MB" },
          ],
        },
      ],
    },
    {
      id: "recyclables-markets-and-buyers",
      number: "05",
      title: "Recyclables, markets and buyers",
      kind: "video",
      minutes: 35,
      summary:
        "Who buys recovered material in Sri Lanka, what they pay, and how price volatility should shape a scheme's finances.",
      objectives: [
        "Map the buyers for each stream",
        "Read the price cycle for PET and paper",
        "Build a contract that survives a price fall",
      ],
      content: [
        {
          type: "video",
          title: "The buyer decides your quality standard",
          minutes: 10,
          caption:
            "Recovered material is only worth what a specific buyer will pay for it, at a specific cleanliness. This lecture works through the actual chain for PET, paper, glass and metal - who is at each step, and where the margin sits.",
        },
        {
          type: "text",
          heading: "Never build the budget on the peak price",
          body: "Recovered material prices move with international commodity cycles and can halve inside a year. A scheme whose operating budget assumes last year's peak is insolvent at the trough. Budget at the low end of the five-year range and treat anything above it as surplus.",
        },
        {
          type: "materials",
          items: [
            { title: "Buyer directory - by province", kind: "dataset", size: "240 KB" },
            { title: "Five-year price ranges", kind: "sheet", size: "94 KB" },
          ],
        },
      ],
    },
    {
      id: "economics-of-a-municipal-scheme",
      number: "06",
      title: "The economics of a municipal scheme",
      kind: "reading",
      minutes: 45,
      summary:
        "The full cost of collection, sorting and disposal set against the revenue and the avoided disposal cost - the arithmetic a council has to approve.",
      objectives: [
        "Build a per-tonne cost model",
        "Count avoided disposal as revenue",
        "Present the case to a council",
      ],
      content: [
        {
          type: "text",
          heading: "Per tonne, all in",
          body: "A scheme is judged on cost per tonne handled, and most models understate it by leaving out supervision, vehicle depreciation and the site's eventual closure cost. A model that is honest about those three is more likely to be believed on everything else, including its savings.",
        },
        {
          type: "text",
          heading: "The saving is mostly avoided disposal",
          body: "Material sales rarely fund a scheme. What funds it is the tonnage that no longer needs collecting, hauling and burying - and that saving only appears if the disposal cost was being properly counted in the first place. Establish the true baseline disposal cost before proposing anything.",
        },
        {
          type: "materials",
          items: [
            { title: "Per-tonne cost model", kind: "sheet", size: "210 KB" },
            { title: "Council presentation - worked example", kind: "slides", size: "1.9 MB" },
          ],
        },
      ],
    },
    {
      id: "contracts-tenders-service-levels",
      number: "07",
      title: "Contracts, tenders and service levels",
      kind: "video",
      minutes: 35,
      summary:
        "Procuring a collection or processing contract that specifies the outcome you need rather than the vehicles you imagined.",
      objectives: [
        "Write output-based service levels",
        "Set penalties that are actually applied",
        "Keep the data rights with the authority",
      ],
      content: [
        {
          type: "video",
          title: "Specify the outcome, not the lorry",
          minutes: 9,
          caption:
            "Contracts that specify equipment get the equipment and not the service. This lecture rewrites three real clauses - collection frequency, contamination rates and reporting - from input terms into output terms, and shows what each change does when a dispute arises.",
        },
        {
          type: "text",
          heading: "Own your own data",
          body: "If the contractor owns the weighbridge records, the authority cannot verify performance, cannot retender competitively and cannot report its own diversion rate. A clause placing operational data with the authority costs nothing at signature and is close to unobtainable afterwards.",
        },
        {
          type: "materials",
          items: [
            { title: "Model service-level schedule", kind: "pdf", size: "760 KB" },
          ],
        },
      ],
    },
    {
      id: "past-year-one",
      number: "08",
      title: "Keeping a scheme alive past year one",
      kind: "reading",
      minutes: 35,
      summary:
        "Most separation schemes are working at month six and gone at month twenty. What the surviving ones did differently.",
      objectives: [
        "Plan for the post-launch attention drop",
        "Keep political sponsorship after a handover",
        "Publish performance where residents see it",
      ],
      content: [
        {
          type: "text",
          heading: "The quiet failure",
          body: "Schemes rarely collapse. They erode - a route missed, then a week, then the separate lorry reassigned during a festival and never returned. By the time anyone reviews it, households stopped separating months earlier and the reported diversion rate is being estimated rather than measured.",
        },
        {
          type: "text",
          heading: "Publish the number monthly",
          body: "The single strongest predictor of a scheme surviving is a diversion figure published every month somewhere residents and councillors both see it. It makes erosion visible while it is still cheap to reverse, and it converts a project into a standing commitment.",
        },
        {
          type: "materials",
          items: [
            { title: "Month-by-month review checklist", kind: "sheet", size: "98 KB" },
            { title: "Two schemes, four years - case notes", kind: "pdf", size: "1.1 MB" },
          ],
        },
      ],
    },
  ],

  "sustainable-energy": [
    {
      id: "the-grid-you-already-have",
      number: "01",
      title: "The grid you already have",
      kind: "video",
      minutes: 40,
      summary:
        "How electricity reaches a household in Sri Lanka today, and which parts of that system a transition actually has to change.",
      objectives: [
        "Follow a unit of power from plant to meter",
        "Name the system's current constraints",
        "See where renewables have to fit",
      ],
      content: [
        {
          type: "video",
          title: "Generation, transmission, distribution",
          minutes: 8,
          caption:
            "A short tour of the national system as it stands - the hydro backbone, the thermal plants that fill the evening peak, and the distribution network that most new renewable capacity will have to connect through rather than around.",
        },
        {
          type: "text",
          heading: "The evening peak is the problem",
          body: "Sri Lanka's demand peaks after dark, which is precisely when solar output is zero. Almost every difficult decision in the transition - storage, tariffs, which thermal plant retires last - follows from that one fact, and any proposal that ignores it will not survive technical review.",
        },
        {
          type: "materials",
          items: [
            { title: "System overview - lecture slides", kind: "slides", size: "2.6 MB" },
          ],
        },
      ],
    },
    {
      id: "solar-wind-and-what-they-need",
      number: "02",
      title: "Solar, wind and what they need",
      kind: "reading",
      minutes: 45,
      summary:
        "What each technology produces, when, and what it demands from the site and the network around it.",
      objectives: [
        "Compare capacity with actual output",
        "Read a capacity factor",
        "Match a technology to a site",
      ],
      content: [
        {
          type: "text",
          heading: "Capacity is not output",
          body: "A ten-megawatt solar plant does not produce ten megawatts. It produces that at noon on a clear day and nothing at night, averaging perhaps a fifth of its nameplate across the year. Capacity factor is the number that makes two proposals comparable, and it is the first figure to ask for.",
        },
        {
          type: "text",
          heading: "The site does most of the deciding",
          body: "Wind resource in Sri Lanka is concentrated and seasonal; solar is distributed and reliable. A proposal that puts the wrong technology on a site can rarely be rescued by better equipment, which is why resource assessment belongs before procurement rather than inside it.",
        },
        {
          type: "materials",
          items: [
            { title: "Technology comparison table", kind: "sheet", size: "130 KB" },
            { title: "Resource maps - solar and wind", kind: "pdf", size: "3.2 MB" },
          ],
        },
      ],
    },
    {
      id: "reading-a-generation-profile",
      number: "03",
      title: "Reading a generation profile",
      kind: "video",
      minutes: 40,
      summary:
        "Twenty-four hours of output on one chart, and what it tells you about whether a project helps the system or strains it.",
      objectives: [
        "Read a daily and seasonal profile",
        "Overlay generation on demand",
        "Spot a curtailment risk early",
      ],
      content: [
        {
          type: "video",
          title: "Output against demand, hour by hour",
          minutes: 10,
          caption:
            "Two curves on one axis explain most of what is contested in energy planning. This lecture builds the overlay for a mid-sized solar project and shows the hours where its output has real value and the hours where it may simply be turned off.",
        },
        {
          type: "text",
          heading: "Curtailment is a cost, not a footnote",
          body: "Power that cannot be absorbed is not generated, and a plant curtailed for hours each afternoon earns less than its feasibility study assumed. Ask any proposal what it expects to be curtailed and what the contract says happens when it is.",
        },
        {
          type: "materials",
          items: [
            { title: "Sample generation profiles", kind: "dataset", size: "420 KB" },
          ],
        },
      ],
    },
    {
      id: "integrating-variable-renewables",
      number: "04",
      title: "Integrating variable renewables",
      kind: "reading",
      minutes: 45,
      summary:
        "What a network operator has to do differently once a meaningful share of supply cannot be dispatched on demand.",
      objectives: [
        "Explain why variability is an operating problem",
        "Name the flexibility options available",
        "Judge a hosting-capacity claim",
      ],
      content: [
        {
          type: "text",
          heading: "Dispatchable and non-dispatchable",
          body: "A thermal plant is asked to produce and does. A solar farm produces what the weather allows. Beyond a certain share, the system needs something that can move quickly in the other direction - hydro, storage, demand response - and the cost of that flexibility belongs in the comparison between options.",
        },
        {
          type: "text",
          heading: "Hosting capacity is local",
          body: "A feeder can absorb only so much distributed generation before voltage rises out of limits. National headroom figures say nothing about the particular line a project wants to connect to, and connection studies are the only real answer. Budget time for them at the start rather than discovering them at financial close.",
        },
        {
          type: "materials",
          items: [
            { title: "Flexibility options briefing", kind: "pdf", size: "1.4 MB" },
          ],
        },
      ],
    },
    {
      id: "storage-what-it-solves",
      number: "05",
      title: "Storage: what it does and does not solve",
      kind: "video",
      minutes: 40,
      summary:
        "Batteries move energy by hours, not by seasons. What that limitation means for how storage should be sized and justified.",
      objectives: [
        "Distinguish power from energy capacity",
        "Size storage against a real duty",
        "Avoid over-specifying duration",
      ],
      content: [
        {
          type: "video",
          title: "Hours, not seasons",
          minutes: 9,
          caption:
            "A battery rated in megawatts and megawatt-hours is answering two different questions - how hard it can push, and how long it can push for. This lecture sizes one against an actual evening peak and shows how quickly cost grows with duration.",
        },
        {
          type: "text",
          heading: "Duration is where the money goes",
          body: "Doubling a battery's duration roughly doubles its cost while adding nothing to the peak it can cover. Storage justified against a specific two- or four-hour duty is affordable; storage specified as general insurance against variability is not, and rarely clears appraisal.",
        },
        {
          type: "materials",
          items: [
            { title: "Storage sizing worksheet", kind: "sheet", size: "150 KB" },
          ],
        },
      ],
    },
    {
      id: "efficiency-before-generation",
      number: "06",
      title: "Energy efficiency before generation",
      kind: "reading",
      minutes: 40,
      summary:
        "The cheapest unit is the one not consumed. Where the savings actually are in public buildings and municipal services.",
      objectives: [
        "Rank measures by cost per unit saved",
        "Find the savings in lighting and cooling",
        "Build the case without capital funding",
      ],
      content: [
        {
          type: "text",
          heading: "Cost per unit saved",
          body: "Efficiency measures compete with each other and with generation on one metric: rupees per kilowatt-hour saved or supplied. Ranked that way, lighting retrofits and cooling set-point control usually sit far below any new generation, and they need no connection study.",
        },
        {
          type: "text",
          heading: "Street lighting and pumping",
          body: "For most local authorities, street lighting and water pumping are the two largest electricity bills and the two least examined. Both respond to unglamorous interventions - schedules, sensors, correctly sized pumps - that pay back inside three years and are within an authority's own control.",
        },
        {
          type: "materials",
          items: [
            { title: "Measure ranking template", kind: "sheet", size: "140 KB" },
            { title: "Public-building savings benchmarks", kind: "pdf", size: "820 KB" },
          ],
        },
      ],
    },
    {
      id: "running-a-building-energy-audit",
      number: "07",
      title: "Running a building energy audit",
      kind: "video",
      minutes: 50,
      summary:
        "A walk-through audit a two-person team can complete in a day, and what to do with the findings afterwards.",
      objectives: [
        "Prepare twelve months of billing data",
        "Run a structured walk-through",
        "Turn findings into a costed list",
      ],
      content: [
        {
          type: "video",
          title: "One building, one day",
          minutes: 12,
          caption:
            "An audit of a district secretariat building, filmed room by room - meter readings, load inventory, the plant room, and the four findings that accounted for most of the saving. Nothing here needs equipment beyond a clamp meter and a spreadsheet.",
        },
        {
          type: "text",
          heading: "Bills before buildings",
          body: "A year of billing data tells you the shape of consumption before you set foot in the building, and it is usually enough to identify whether the problem is cooling, lighting or something running overnight that nobody has noticed. Walking in without it wastes the visit.",
        },
        {
          type: "materials",
          items: [
            { title: "Walk-through audit form", kind: "sheet", size: "170 KB" },
            { title: "Load inventory template", kind: "sheet", size: "82 KB" },
          ],
        },
      ],
    },
    {
      id: "tariffs-ppas-and-cost-recovery",
      number: "08",
      title: "Tariffs, PPAs and cost recovery",
      kind: "reading",
      minutes: 45,
      summary:
        "How a project earns money, who pays it, and why the tariff structure matters more to viability than the technology does.",
      objectives: [
        "Read the key terms of a power purchase agreement",
        "Understand net metering and net accounting",
        "See how cost recovery constrains policy",
      ],
      content: [
        {
          type: "text",
          heading: "The four terms that decide a PPA",
          body: "Price, term, curtailment treatment and the definition of an event of default. Everything else in a power purchase agreement is administration. A project that has not modelled what happens under each of the four is not yet a project, whatever its feasibility study concludes.",
        },
        {
          type: "text",
          heading: "Rooftop schemes are a tariff design",
          body: "Whether a household exports at the retail rate, a lower rate, or receives credit in units rather than money changes both the uptake and the utility's revenue. These schemes are policy instruments dressed as technical arrangements, and the arithmetic should be understood before they are extended.",
        },
        {
          type: "materials",
          items: [
            { title: "PPA term sheet - annotated", kind: "pdf", size: "1.5 MB" },
            { title: "Rooftop scheme comparison", kind: "sheet", size: "120 KB" },
          ],
        },
      ],
    },
    {
      id: "procuring-a-renewable-project",
      number: "09",
      title: "Procuring a renewable project",
      kind: "video",
      minutes: 40,
      summary:
        "Running a competitive process that gets a working plant rather than the lowest number on a page.",
      objectives: [
        "Set qualification criteria that matter",
        "Evaluate on lifetime cost",
        "Guard against underbidding",
      ],
      content: [
        {
          type: "video",
          title: "The lowest bid and the working plant",
          minutes: 10,
          caption:
            "Underbidding is the standard failure in renewable procurement, and it is visible at evaluation if anyone is looking. This lecture goes through three bids for the same site and identifies which one could not have been delivered at the price offered.",
        },
        {
          type: "text",
          heading: "Evaluate over the life, not at handover",
          body: "Capital cost is between a half and two thirds of what a plant costs over twenty years. An evaluation that scores only the capital number reliably selects equipment that is cheap to install and expensive to keep running, and the authority carries the difference.",
        },
        {
          type: "materials",
          items: [
            { title: "Evaluation criteria - worked set", kind: "pdf", size: "940 KB" },
          ],
        },
      ],
    },
    {
      id: "operations-maintenance-handover",
      number: "10",
      title: "Operations, maintenance and handover",
      kind: "reading",
      minutes: 35,
      summary:
        "What has to be in place on the day a contractor leaves site, and why so many public installations stop producing within three years.",
      objectives: [
        "Specify a handover pack",
        "Plan maintenance and its budget",
        "Monitor output after commissioning",
      ],
      content: [
        {
          type: "text",
          heading: "The three-year failure",
          body: "Public solar installations frequently stop producing not because equipment failed but because nobody was watching the output, no one held the passwords to the monitoring portal, and the cleaning that inverter output depends on was never assigned to a post. All three are handover problems.",
        },
        {
          type: "text",
          heading: "Somebody's name against the asset",
          body: "Maintenance that belongs to a department belongs to nobody. Name the post responsible, give it the budget line and the monthly output report, and the asset survives staff changes - which over twenty years it will need to.",
        },
        {
          type: "materials",
          items: [
            { title: "Handover checklist", kind: "sheet", size: "96 KB" },
            { title: "O&M schedule template", kind: "sheet", size: "115 KB" },
          ],
        },
      ],
    },
  ],

  "green-finance": [
    {
      id: "where-climate-money-comes-from",
      number: "01",
      title: "Where climate money comes from",
      kind: "video",
      minutes: 40,
      summary:
        "The sources of climate and green finance available to Sri Lanka, and what each one wants in exchange.",
      objectives: [
        "Map the main sources of finance",
        "Distinguish grant, concessional and commercial",
        "Match a source to a project type",
      ],
      content: [
        {
          type: "video",
          title: "Four kinds of money",
          minutes: 9,
          caption:
            "Grants, concessional loans, commercial debt and equity behave differently and are won differently. This lecture sets out who holds each in the climate space, what they are trying to achieve, and which project types each will and will not consider.",
        },
        {
          type: "text",
          heading: "Every source has an objective",
          body: "A climate fund is not a bank and does not want what a bank wants. Reading the objective a source is accountable for - emissions avoided, adaptation benefit, private capital mobilised - tells you which parts of your project to lead with, and which parts will simply be tolerated.",
        },
        {
          type: "materials",
          items: [
            { title: "Sources of climate finance - map", kind: "pdf", size: "1.3 MB" },
          ],
        },
      ],
    },
    {
      id: "concessional-finance",
      number: "02",
      title: "Concessional finance and how it differs",
      kind: "reading",
      minutes: 45,
      summary:
        "What makes a loan concessional, how to compare two offers honestly, and where the hidden costs sit.",
      objectives: [
        "Calculate a grant element",
        "Compare offers on total cost",
        "Identify tied conditions",
      ],
      content: [
        {
          type: "text",
          heading: "The grant element",
          body: "Concessionality is the gap between a loan's terms and market terms, expressed as a single percentage. Two offers with the same headline rate can differ substantially once tenor, grace period and fees are included, and the grant element is what makes them comparable in one number.",
        },
        {
          type: "text",
          heading: "Conditions are part of the price",
          body: "Procurement tied to the lender's suppliers, mandatory technical assistance and currency exposure all cost money that never appears in the interest rate. A cheaper loan with tied procurement is regularly the more expensive of two offers once delivered.",
        },
        {
          type: "materials",
          items: [
            { title: "Grant element calculator", kind: "sheet", size: "125 KB" },
            { title: "Offer comparison - worked example", kind: "pdf", size: "760 KB" },
          ],
        },
      ],
    },
    {
      id: "climate-funds-and-gatekeepers",
      number: "03",
      title: "The climate funds and their gatekeepers",
      kind: "video",
      minutes: 45,
      summary:
        "How the major climate funds are accessed, the role of accredited entities, and where a national proposal usually stalls.",
      objectives: [
        "Explain direct and international access",
        "Identify the right accredited entity",
        "Anticipate the stage where proposals stall",
      ],
      content: [
        {
          type: "video",
          title: "You do not apply directly",
          minutes: 11,
          caption:
            "Most climate funds are reached through an accredited entity rather than by a department applying on its own. This lecture explains what accreditation means, why the choice of entity shapes the proposal, and how the national designated authority fits in.",
        },
        {
          type: "text",
          heading: "Where proposals die",
          body: "Concept notes rarely fail on ambition. They fail on the climate rationale being asserted rather than evidenced, and on the absence of a credible plan for what happens after the funded period ends. Both are addressable at the concept stage and expensive to fix later.",
        },
        {
          type: "materials",
          items: [
            { title: "Access routes diagram", kind: "pdf", size: "690 KB" },
            { title: "Accredited entities - current list", kind: "link" },
          ],
        },
      ],
    },
    {
      id: "green-bonds",
      number: "04",
      title: "Green bonds and use-of-proceeds",
      kind: "reading",
      minutes: 50,
      summary:
        "What makes a bond green, what the issuer commits to, and why the reporting obligation outlives the funding.",
      objectives: [
        "Explain a use-of-proceeds framework",
        "Describe second-party opinion and verification",
        "Weigh the reporting burden honestly",
      ],
      content: [
        {
          type: "text",
          heading: "The framework is the product",
          body: "A green bond is an ordinary bond plus a published framework saying what the proceeds may fund, how projects are selected, how the money is tracked while unspent, and what will be reported. Investors are buying that framework as much as the credit behind it.",
        },
        {
          type: "text",
          heading: "The obligation lasts the term",
          body: "Allocation and impact reporting continues annually for the life of the bond, long after the launch and the press coverage. An issuer without the systems to track proceeds by project should build them before issuing, because a missed report is a reputational event in a small market.",
        },
        {
          type: "materials",
          items: [
            { title: "Framework outline - template", kind: "pdf", size: "1.0 MB" },
            { title: "Reporting obligations timeline", kind: "sheet", size: "88 KB" },
          ],
        },
      ],
    },
    {
      id: "what-makes-a-project-bankable",
      number: "05",
      title: "What makes a project bankable",
      kind: "video",
      minutes: 40,
      summary:
        "The difference between a good idea and a financeable one, seen from the side of the institution deciding.",
      objectives: [
        "Identify a revenue or savings stream",
        "Allocate risk to who can carry it",
        "Show the project can be delivered",
      ],
      content: [
        {
          type: "video",
          title: "Read it as the lender does",
          minutes: 10,
          caption:
            "The same project, read twice - once as its sponsor wrote it and once as an appraisal officer reads it. The second reading looks for one thing the first rarely states plainly: what repays the money, and what happens to that if the project underperforms.",
        },
        {
          type: "text",
          heading: "Risk goes to whoever can manage it",
          body: "Bankability is largely a question of whether risks sit with the party able to control them. Demand risk placed on a contractor who cannot influence demand is priced heavily and often refused; the same risk retained by the authority may cost far less overall.",
        },
        {
          type: "materials",
          items: [
            { title: "Bankability checklist", kind: "sheet", size: "105 KB" },
          ],
        },
      ],
    },
    {
      id: "building-the-financial-case",
      number: "06",
      title: "Building the financial case",
      kind: "reading",
      minutes: 55,
      summary:
        "Assembling a cash-flow model that an appraiser can follow, and stating its assumptions where they can be challenged.",
      objectives: [
        "Build a simple project cash flow",
        "Test it against downside cases",
        "Present assumptions transparently",
      ],
      content: [
        {
          type: "text",
          heading: "A model nobody can follow is not evidence",
          body: "The purpose of a financial model in a public proposal is to let someone else check your reasoning. Assumptions belong on one visible sheet, formulas should be traceable, and every figure taken from elsewhere needs a source. Sophistication that obscures this makes a proposal weaker, not stronger.",
        },
        {
          type: "text",
          heading: "Show the case where it fails",
          body: "Appraisers trust a proposal that names the conditions under which it does not work. Run the downside - lower uptake, higher capital cost, delayed commissioning - and state the point at which the project stops being viable. Withholding it does not prevent them from finding it.",
        },
        {
          type: "materials",
          items: [
            { title: "Cash-flow model skeleton", kind: "sheet", size: "230 KB" },
            { title: "Sensitivity testing note", kind: "pdf", size: "540 KB" },
          ],
        },
      ],
    },
    {
      id: "writing-a-proposal-that-survives",
      number: "07",
      title: "Writing a proposal that survives review",
      kind: "video",
      minutes: 50,
      summary:
        "Structure, evidence and the climate rationale - what reviewers look for first and what they discount immediately.",
      objectives: [
        "Structure a concept note",
        "Write a defensible climate rationale",
        "Handle the sustainability question",
      ],
      content: [
        {
          type: "video",
          title: "The first two pages decide it",
          minutes: 12,
          caption:
            "Reviewers read a great many proposals and form a view early. This lecture rewrites the opening of a real concept note - problem, rationale, intervention, and what changes if it is funded - and shows what each revision was fixing.",
        },
        {
          type: "text",
          heading: "The rationale has to be causal",
          body: "A climate rationale must connect the intervention to a climate outcome by a chain someone can follow and dispute. Projects that would have been worth doing anyway are not disqualified, but the case has to explain what the climate finance specifically buys.",
        },
        {
          type: "materials",
          items: [
            { title: "Concept note - annotated example", kind: "pdf", size: "1.7 MB" },
            { title: "Reviewer's scoring rubric", kind: "sheet", size: "110 KB" },
          ],
        },
      ],
    },
    {
      id: "reporting-verification-cost",
      number: "08",
      title: "Reporting, verification and what it costs",
      kind: "reading",
      minutes: 35,
      summary:
        "The obligations that come with accepted finance, and how to budget for them before rather than after signature.",
      objectives: [
        "List the standard reporting obligations",
        "Budget for verification",
        "Set up data collection at the start",
      ],
      content: [
        {
          type: "text",
          heading: "Compliance is a line item",
          body: "Monitoring, third-party verification and annual reporting typically consume a small but non-trivial share of a facility, and a budget that omits them funds the project and not the obligations attached to it. Include the cost in the proposal; funders expect to see it.",
        },
        {
          type: "text",
          heading: "Collect from day one",
          body: "Impact reporting asks for baselines and time series that cannot be reconstructed later. Set up the collection when the agreement is signed, not when the first report is due, or the first report will be an estimate defended in front of people who audit estimates.",
        },
        {
          type: "materials",
          items: [
            { title: "Reporting obligations checklist", kind: "sheet", size: "92 KB" },
          ],
        },
      ],
    },
  ],

  "mobility-landscapes": [
    {
      id: "transport-land-one-carbon-budget",
      number: "01",
      title: "Transport, land and one carbon budget",
      kind: "video",
      minutes: 40,
      summary:
        "Why transport planning and land restoration belong in the same programme, and how decisions in one constrain the other.",
      objectives: [
        "Connect land use to travel demand",
        "See restoration as infrastructure",
        "Read both against one budget",
      ],
      content: [
        {
          type: "video",
          title: "Two subjects, one system",
          minutes: 9,
          caption:
            "Where people live decides how far they travel, and what is built decides what is cleared. This opening lecture puts a transport plan and a restoration plan for the same district side by side and shows the four points at which each determines the other.",
        },
        {
          type: "text",
          heading: "Travel demand is designed, not observed",
          body: "A settlement pattern that puts housing far from work generates the traffic that later justifies a wider road. Treating travel demand as fixed and responding with capacity is the mechanism by which transport emissions grow. The land-use decision came first and is where the leverage is.",
        },
        {
          type: "materials",
          items: [
            { title: "Module 01 - lecture slides", kind: "slides", size: "2.2 MB" },
          ],
        },
      ],
    },
    {
      id: "planning-public-transport",
      number: "02",
      title: "Planning public transport people use",
      kind: "reading",
      minutes: 45,
      summary:
        "Frequency, reliability and the interchange - the three things that decide whether a service attracts riders who had a choice.",
      objectives: [
        "Prioritise frequency over coverage",
        "Design an interchange that works",
        "Measure reliability, not punctuality",
      ],
      content: [
        {
          type: "text",
          heading: "Frequency is freedom",
          body: "A service every ten minutes needs no timetable and no planning by its user; a service every hour needs both, and loses everyone who has an alternative. Where budget forces a choice, concentrating frequency on fewer corridors nearly always carries more people than spreading coverage thinly.",
        },
        {
          type: "text",
          heading: "The interchange is where trips are lost",
          body: "Most abandoned public transport trips are abandoned at a transfer - an unsheltered wait, a road to cross, a fare paid twice. Fixing an interchange is cheap relative to new vehicles and usually buys more ridership per rupee than either end of the journey.",
        },
        {
          type: "materials",
          items: [
            { title: "Corridor prioritisation worksheet", kind: "sheet", size: "140 KB" },
            { title: "Interchange design notes", kind: "pdf", size: "1.2 MB" },
          ],
        },
      ],
    },
    {
      id: "walking-cycling-first-mile",
      number: "03",
      title: "Walking, cycling and the first mile",
      kind: "video",
      minutes: 40,
      summary:
        "The shortest trips are the easiest to shift and the least funded. What a footpath programme can achieve in a tropical city.",
      objectives: [
        "Audit a walking route honestly",
        "Design for shade and drainage",
        "Cost a footpath programme",
      ],
      content: [
        {
          type: "video",
          title: "Walk it yourself",
          minutes: 10,
          caption:
            "A recorded audit of one kilometre of urban footpath at three in the afternoon - the surface, the parked vehicles, the absent crossings and the total lack of shade. Every deficiency found is inexpensive to fix and none of it appears in a transport model.",
        },
        {
          type: "text",
          heading: "Shade is infrastructure",
          body: "In this climate, an unshaded footpath is unusable for much of the day regardless of its surface. Street trees are the cheapest intervention in the programme and the slowest to mature, which is an argument for planting them at the start of a plan rather than at the end.",
        },
        {
          type: "materials",
          items: [
            { title: "Walking route audit form", kind: "sheet", size: "86 KB" },
          ],
        },
      ],
    },
    {
      id: "restoring-forest-and-mangrove",
      number: "04",
      title: "Restoring forest and mangrove",
      kind: "reading",
      minutes: 50,
      summary:
        "What restoration actually requires beyond planting, and why survival rates rather than seedling counts are the measure.",
      objectives: [
        "Match species and site conditions",
        "Plan for the years after planting",
        "Report survival, not seedlings",
      ],
      content: [
        {
          type: "text",
          heading: "Planting is the cheap part",
          body: "Seedlings are a small fraction of a restoration budget. Site preparation, hydrology, protection from grazing and three years of tending are the rest, and a programme funded only for the planting day reliably produces a photograph and very little forest.",
        },
        {
          type: "text",
          heading: "Mangroves fail on hydrology",
          body: "Mangrove restoration fails most often because the site's tidal flow was altered and never restored - the species was right and the water was wrong. Restoring the hydrology, and sometimes doing nothing else, outperforms planting on a site that cannot support it.",
        },
        {
          type: "materials",
          items: [
            { title: "Species and site matching guide", kind: "pdf", size: "1.8 MB" },
            { title: "Survival monitoring sheet", kind: "sheet", size: "94 KB" },
          ],
        },
      ],
    },
    {
      id: "coastal-buffers",
      number: "05",
      title: "Coastal buffers and what they hold back",
      kind: "video",
      minutes: 45,
      summary:
        "Dunes, reefs, mangroves and sea walls compared on what they protect against, what they cost, and what they take away.",
      objectives: [
        "Compare natural and built defences",
        "Understand the setback line",
        "Weigh protection against access",
      ],
      content: [
        {
          type: "video",
          title: "Four defences, one shoreline",
          minutes: 11,
          caption:
            "The same stretch of coast with four different responses modelled against it. Each holds back a different event at a different cost, and each does something to the fishing landing, the access path and the sand budget of the beach next door.",
        },
        {
          type: "text",
          heading: "A wall moves the problem sideways",
          body: "Hard defences interrupt the movement of sediment along a coast, and the erosion prevented in front of the structure frequently reappears beyond its end. Coastal protection assessed one property at a time produces a shoreline of walls and a district worse off than before.",
        },
        {
          type: "materials",
          items: [
            { title: "Defence options comparison", kind: "pdf", size: "1.4 MB" },
            { title: "Setback rules - summary", kind: "sheet", size: "76 KB" },
          ],
        },
      ],
    },
    {
      id: "land-use-planning-as-climate-policy",
      number: "06",
      title: "Land-use planning as climate policy",
      kind: "reading",
      minutes: 45,
      summary:
        "The zoning and approval decisions taken now determine emissions and exposure for decades, mostly without being described as climate decisions.",
      objectives: [
        "Read a zoning decision for its climate effect",
        "Keep development out of the hazard zone",
        "Protect land that is doing a job",
      ],
      content: [
        {
          type: "text",
          heading: "Approvals are commitments",
          body: "A housing approval on a flood plain commits the state to protecting or eventually relocating those households. The decision is taken by an officer applying planning rules and is almost never recorded as a climate decision, which is why the rules themselves are the intervention.",
        },
        {
          type: "text",
          heading: "Land already at work",
          body: "Wetland absorbing storm water and paddy holding a catchment are performing services that would cost a great deal to replace in concrete. Valuing that service explicitly, before a rezoning is considered, changes what the comparison looks like.",
        },
        {
          type: "materials",
          items: [
            { title: "Climate screening for planning decisions", kind: "pdf", size: "1.1 MB" },
          ],
        },
      ],
    },
    {
      id: "transport-and-landscape-together",
      number: "07",
      title: "Bringing transport and landscape together",
      kind: "video",
      minutes: 35,
      summary:
        "A closing worked example: one district corridor planned for movement, restoration and flood absorption at the same time.",
      objectives: [
        "Combine measures on one corridor",
        "Sequence work across budget years",
        "Present an integrated plan",
      ],
      content: [
        {
          type: "video",
          title: "One corridor, three objectives",
          minutes: 9,
          caption:
            "The programme closes on a single eight-kilometre corridor: a bus priority lane, a shaded walking route, a restored canal edge that takes storm water, and the sequencing that let a district deliver all three across four budget years without a special allocation.",
        },
        {
          type: "text",
          heading: "Sequencing is the whole trick",
          body: "Integrated plans fail when they require everything to be funded at once. Ordering the work so each year's budget delivers something usable, and each piece makes the next cheaper, is what allows an ambitious plan to survive an ordinary funding cycle.",
        },
        {
          type: "materials",
          items: [
            { title: "Integrated corridor plan - example", kind: "pdf", size: "2.3 MB" },
            { title: "Four-year sequencing table", kind: "sheet", size: "118 KB" },
          ],
        },
      ],
    },
  ],
};
