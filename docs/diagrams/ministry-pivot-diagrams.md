# Ministry Pivot Architecture — Diagrams

Companion to `docs/SRS.md` (revision 0.2, 2026-09-13). Covers §1.2, §4.2, §4.10a, §4.27–4.33, §6 (BR-26–32), §7. Each diagram also exists as a standalone `.mmd` file in this folder for tools that want raw Mermaid source instead of a fenced block.

---

## 01 — Scope & ownership map

The old flat Administrator is gone. Every one of its jobs now sits with exactly one of six roles, and each role's authority stops at a hard boundary: one Module, one global library, one province, or the whole platform.

The one recurring exception: a Lecturer can be assigned across *several* Module Administrators' modules at once, so nobody with only one Module's authority may lock that person's whole account, or decide whether their profile review goes public. Both escalate to the Super Administrator — the dashed line below (**BR-29**).

```mermaid
flowchart TD
    SA["Super Administrator<br/><i>platform-wide · exactly one account</i>"]
    MA["Module Administrator<br/><i>scope: one Module</i>"]
    LA["Laws Administrator<br/><i>scope: global library</i>"]
    TA["Tools Administrator<br/><i>scope: global directory</i>"]
    LM["List Manager<br/><i>scope: dynamic lists</i>"]
    PR["Provincial Registrar<br/><i>scope: one province</i>"]
    LEC["Lecturer"]
    MA2["Module Administrator<br/><i>(a different Module — FR-MODADM-055)</i>"]
    LRN["Learner<br/><i>one province</i>"]

    SA -->|appoints §4.21| MA
    SA -->|appoints| LA
    SA -->|appoints| TA
    SA -->|appoints| LM
    SA -->|appoints| PR

    MA -->|appoints, own Module| LEC
    MA2 -.->|also assigns| LEC
    LEC -.->|full suspend / profile review — escalates BR-29| SA

    PR -->|approves| LRN

    classDef apex fill:#f5ead2,stroke:#a5711f,stroke-width:2px,color:#16201c;
    classDef scoped fill:#e2efe9,stroke:#1f5f4f,stroke-width:1.5px,color:#16201c;
    classDef ghost fill:#eeeeee,stroke:#999999,stroke-width:1px,stroke-dasharray: 4 3,color:#555555;
    classDef plain fill:#ffffff,stroke:#888888,stroke-width:1px,color:#16201c;

    class SA apex;
    class MA,PR scoped;
    class MA2 ghost;
    class LA,TA,LM,LEC,LRN plain;
```

**Reads as:** the Super Administrator appoints all five scoped roles; a Module Administrator's authority over a Module never reaches the Lecturer's whole account, because that Lecturer may answer to more than one Module Administrator at once — full-account actions climb to the one role with undivided ownership instead (SRS §4.17–§4.20, §7).

---

## 02 — Registration, review, and resubmission

No public self-signup. A submitted application sits pending until one human decides it — routed by province, with the fixed "National / Head Office" choice falling to the Super Administrator instead of a province that doesn't apply.

Rejection isn't terminal: the applicant edits and resubmits the *same* record rather than starting a second, duplicate one (**FR-AUTH-025**).

```mermaid
flowchart TD
    FORM["Registration form<br/><i>name, email, password, Province</i>"]
    PEND["Application — Pending<br/><i>no console access exists yet</i>"]
    PRQ["Provincial Registrar queue<br/><i>own province only §4.33</i>"]
    SAQ["Super Administrator queue<br/><i>National / Head Office fallback — FR-REG-040</i>"]
    APR["Approved<br/><i>no reason required</i>"]
    REJ["Rejected<br/><i>written reason kept on record</i>"]
    SIGNIN["Learner signs in —<br/>full portal access"]
    EDIT["Applicant edits & resubmits"]

    FORM -->|submits, FR-AUTH-015| PEND
    PEND -->|province = one of 9| PRQ
    PEND -->|province = National/Head Office| SAQ
    PRQ -->|approve| APR
    PRQ -->|reject| REJ
    SAQ -->|approve| APR
    SAQ -->|reject| REJ
    APR --> SIGNIN
    REJ --> EDIT
    EDIT -.->|resubmit — same record, FR-AUTH-025| PEND

    classDef state fill:#e2efe9,stroke:#1f5f4f,color:#16201c;
    classDef good fill:#e2efe9,stroke:#1f5f4f,stroke-width:2px,color:#16201c;
    classDef bad fill:#f3e3dd,stroke:#93412b,stroke-width:2px,color:#16201c;
    classDef plain fill:#ffffff,stroke:#888888,color:#16201c;

    class PEND state;
    class APR,SIGNIN good;
    class REJ bad;
    class FORM,PRQ,SAQ,EDIT plain;
```

**Reads as:** exactly one human decision gates sign-in; email confirmation was deliberately dropped as a redundant second gate (SRS §4.2).

---

## 03 — Tag-based relatedness, from pool to lecture

There is no hand-maintained "this Law belongs to this Module" table. A Module, a Law, and a Tool are related purely because they share at least one value from a dynamic option list — Hazards, Categories, and whatever gets added later.

A lecturer then narrows that automatic pool down to whatever's actually worth a learner's attention on *one* lecture — a deliberate, hand-picked subset, shown here with a worked example. (Example content is illustrative only, matching the SRS's own convention.)

```mermaid
flowchart TD
    subgraph Hazards["Hazards"]
        H1["Flooding"]
        H2["Landslide"]
        H3["Chemical Spill"]
    end
    subgraph Categories["Categories"]
        C1["Waste Management"]
        C2["Water Quality"]
    end

    MOD["Module<br/>'Coastal Waste Management'<br/><i>tags: Flooding, Waste Mgmt</i>"]
    LAW["Law<br/>'National Environmental Act §23'<br/><i>tags: Waste Mgmt</i>"]
    TOOL["Tool<br/>'Waste Audit Calculator'<br/><i>tags: Waste Mgmt, Water Quality</i>"]

    H1 --> MOD
    C1 --> MOD
    C1 --> LAW
    C1 --> TOOL
    C2 --> TOOL

    POOL["Module's related pool<br/><i>Law + Tool — any shared tag, BR-26</i>"]
    LAW ==>|matches| POOL
    TOOL ==>|matches| POOL

    CURATE["Lecturer curates a subset<br/><i>§4.10a</i>"]
    POOL --> CURATE

    RESULT["Lecture page shows:<br/>✓ Waste Audit Calculator<br/>✗ Act §23 — not picked"]
    CURATE --> RESULT

    classDef chip fill:#eeeeee,stroke:#999999,color:#333333;
    classDef pool fill:#e2efe9,stroke:#1f5f4f,stroke-width:2px,color:#16201c;
    classDef plain fill:#ffffff,stroke:#888888,color:#16201c;

    class H1,H2,H3,C1,C2 chip;
    class MOD,LAW,TOOL plain;
    class POOL,RESULT pool;
```

**Reads as:** the pool is automatic and inclusive (an OR-match — **BR-26**); what a learner actually sees on a lecture is a deliberately smaller, hand-picked set — here the Tool made the cut for this lecture, the Law didn't.

---

## 04 — Learn, Laws, and Tools

The portal keeps its existing Learn experience unchanged and adds two standing, top-level tabs alongside it — full directories, not scoped views, though both link back into whatever Module or Lecture context brought a learner there.

```mermaid
flowchart TD
    PORTAL["Learner Portal"]
    LEARN["Learn"]
    LAWS["Laws"]
    TOOLS["Tools"]

    PORTAL --> LEARN
    PORTAL --> LAWS
    PORTAL --> TOOLS

    LEARN --> LEARNDETAIL["Module → Lecture → Quiz / Fill-in-blank<br/><i>+ related Laws/Tools shown inline</i>"]
    LAWS --> LAWSDETAIL["Your province — first<br/>Other provinces — below<br/><i>§4.27, FR-STU-500</i>"]
    TOOLS --> TOOLSDETAIL["Flat directory, filterable by tags<br/><i>§4.28</i>"]

    classDef apex fill:#f5ead2,stroke:#a5711f,stroke-width:2px,color:#16201c;
    classDef scoped fill:#e2efe9,stroke:#1f5f4f,color:#16201c;
    classDef plain fill:#ffffff,stroke:#888888,color:#16201c;

    class PORTAL apex;
    class LEARN,LAWS,TOOLS scoped;
    class LEARNDETAIL,LAWSDETAIL,TOOLSDETAIL plain;
```

**Reads as:** Learn is unchanged in kind, only gaining inline pointers out to the other two tabs; Laws and Tools are new, standing, platform-wide sections, not sub-pages of a Module.

---

Field-level data model, the full role/permission matrix, and every numbered requirement behind these diagrams live in `docs/SRS.md` (§7, §8). Open items — the List Manager's future, multi-registrar provinces, National/Head Office ordering on the Laws tab — are tracked in Appendix D there.
