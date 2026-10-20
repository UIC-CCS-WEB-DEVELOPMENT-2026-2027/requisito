# `generatePlan()` Test Cases

## Purpose and contract

These cases specify the behavior of `generatePlan(goal, answers = {}, requirements = [])` as currently implemented in `src/utils/planGenerator.js`. They are documentation targets for automated assertions; they are **not a claim that these cases have been executed**.

The expected objects below show the complete return shape: `steps`, `unresolved`, `cycles`, `warnings`, and `ok`. Array order is significant. Step objects include their complete output fields. A requirement step copies catalog fields except `when` and `requires`, then sets `order`, `id`, `kind: "requirement"`, and calculated `requires`. A choice step has `order`, `id`, `kind`, `title`, `options`, and calculated `requires`.

`ok: true` means only that no cycle was detected. It does not establish that the input data is complete or that any illustrative government-document dependency is accurate or officially verified. The examples use synthetic IDs and labels only. In these examples, `requirements` is the function's requirement catalog, not a claim about real-world government requirements.

## Cases

### PG-001 — Generate ordinary requirements in catalog order

**Category:** Normal requirement generation; stable ordering

**Input**

```json
{
  "goal": { "id": "g-normal", "requirements": ["b", "a"] },
  "answers": {},
  "requirements": [
    { "id": "a", "title": "Alpha" },
    { "id": "b", "title": "Beta" }
  ]
}
```

**Expected output**

```json
{
  "steps": [
    { "id": "a", "title": "Alpha", "order": 1, "kind": "requirement", "requires": [] },
    { "id": "b", "title": "Beta", "order": 2, "kind": "requirement", "requires": [] }
  ],
  "unresolved": [], "cycles": [], "warnings": [], "ok": true
}
```

### PG-002 — Put a prerequisite before its dependent despite catalog order

**Category:** Dependency ordering; automatic prerequisite collection

**Input**

```json
{
  "goal": { "id": "g-order", "requirements": ["dependent"] },
  "answers": {},
  "requirements": [
    { "id": "dependent", "title": "Dependent", "requires": ["prerequisite"] },
    { "id": "prerequisite", "title": "Prerequisite" }
  ]
}
```

**Expected output**

```json
{
  "steps": [
    { "id": "prerequisite", "title": "Prerequisite", "order": 1, "kind": "requirement", "requires": [] },
    { "id": "dependent", "title": "Dependent", "order": 2, "kind": "requirement", "requires": ["prerequisite"] }
  ],
  "unresolved": [], "cycles": [], "warnings": [], "ok": true
}
```

### PG-003 — Include a conditional requirement when its condition matches

**Category:** Conditional inclusion

**Input**

```json
{
  "goal": { "id": "g-conditional-yes", "requirements": ["clearance"] },
  "answers": { "needsClearance": "yes" },
  "requirements": [
    { "id": "clearance", "title": "Clearance", "when": { "needsClearance": "yes" } }
  ]
}
```

**Expected output**

```json
{
  "steps": [
    { "id": "clearance", "title": "Clearance", "order": 1, "kind": "requirement", "requires": [] }
  ],
  "unresolved": [], "cycles": [], "warnings": [], "ok": true
}
```

### PG-004 — Exclude a conditional requirement when an answered condition conflicts

**Category:** Conditional exclusion

**Input**

```json
{
  "goal": { "id": "g-conditional-no", "requirements": ["clearance"] },
  "answers": { "needsClearance": "no" },
  "requirements": [
    { "id": "clearance", "title": "Clearance", "when": { "needsClearance": "yes" } }
  ]
}
```

**Expected output**

```json
{ "steps": [], "unresolved": [], "cycles": [], "warnings": [], "ok": true }
```

### PG-005 — Retain a conditional requirement when its question is unanswered

**Category:** Unanswered conditional question

**Input**

```json
{
  "goal": { "id": "g-conditional-unknown", "requirements": ["clearance"] },
  "answers": {},
  "requirements": [
    { "id": "clearance", "title": "Clearance", "when": { "needsClearance": "yes" } }
  ]
}
```

**Expected output**

```json
{
  "steps": [
    { "id": "clearance", "title": "Clearance", "order": 1, "kind": "requirement", "requires": [] }
  ],
  "unresolved": [], "cycles": [], "warnings": [], "ok": true
}
```

### PG-006 — Require every answered conditional field to match

**Category:** Multiple-field condition matching

**Input**

```json
{
  "goal": { "id": "g-multi-condition", "requirements": ["special"] },
  "answers": { "employment": "employed", "region": "north" },
  "requirements": [
    { "id": "special", "title": "Special document", "when": { "employment": "employed", "region": "south" } }
  ]
}
```

**Expected output**

```json
{ "steps": [], "unresolved": [], "cycles": [], "warnings": [], "ok": true }
```

### PG-007 — Represent a shared “any one of” group as one choice step

**Category:** Alternative-choice group; shared choice step; dependency ordering

**Input**

```json
{
  "goal": { "id": "g-anyof-shared", "requirements": ["a", "b"] },
  "answers": {},
  "requirements": [
    { "id": "a", "title": "Task A", "requires": [{ "anyOf": ["id-a", "id-b"], "label": "Choose one ID" }] },
    { "id": "b", "title": "Task B", "requires": [{ "anyOf": ["id-a", "id-b"], "label": "Choose one ID" }] },
    { "id": "id-a", "title": "ID A" },
    { "id": "id-b", "title": "ID B" }
  ]
}
```

**Expected output**

```json
{
  "steps": [
    { "order": 1, "id": "anyOf:id-a|id-b", "kind": "anyOf", "title": "Choose one ID", "options": [{ "id": "id-a", "title": "ID A" }, { "id": "id-b", "title": "ID B" }], "requires": [] },
    { "id": "a", "title": "Task A", "order": 2, "kind": "requirement", "requires": ["anyOf:id-a|id-b"] },
    { "id": "b", "title": "Task B", "order": 3, "kind": "requirement", "requires": ["anyOf:id-a|id-b"] }
  ],
  "unresolved": [], "cycles": [], "warnings": [], "ok": true
}
```

### PG-008 — Let an already-included option satisfy an “any one of” group

**Category:** Alternative-choice resolution; duplicate prevention

**Input**

```json
{
  "goal": { "id": "g-anyof-existing", "requirements": ["a", "id-a"] },
  "answers": {},
  "requirements": [
    { "id": "a", "title": "Task A", "requires": [{ "anyOf": ["id-a", "id-b"] }] },
    { "id": "id-a", "title": "ID A" },
    { "id": "id-b", "title": "ID B" }
  ]
}
```

**Expected output**

```json
{
  "steps": [
    { "id": "id-a", "title": "ID A", "order": 1, "kind": "requirement", "requires": [] },
    { "id": "a", "title": "Task A", "order": 2, "kind": "requirement", "requires": ["id-a"] }
  ],
  "unresolved": [], "cycles": [], "warnings": [], "ok": true
}
```

### PG-009 — Warn when an “any one of” group has no usable options

**Category:** Empty alternative group; warning reporting

**Input**

```json
{
  "goal": { "id": "g-anyof-empty", "requirements": ["a"] },
  "answers": {},
  "requirements": [
    { "id": "a", "title": "Task A", "requires": [{ "anyOf": ["missing-option"] }] }
  ]
}
```

**Expected output**

```json
{
  "steps": [
    { "id": "a", "title": "Task A", "order": 1, "kind": "requirement", "requires": [] }
  ],
  "unresolved": [], "cycles": [],
  "warnings": [
    "\"a\" refers to unknown requirement \"missing-option\".",
    "\"a\" has an \"any one of\" group with no usable options."
  ],
  "ok": true
}
```

### PG-010 — Warn for a missing prerequisite reference but keep the known step

**Category:** Missing prerequisite reference

**Input**

```json
{
  "goal": { "id": "g-missing-dependency", "requirements": ["a"] },
  "answers": {},
  "requirements": [
    { "id": "a", "title": "Task A", "requires": ["missing"] }
  ]
}
```

**Expected output**

```json
{
  "steps": [
    { "id": "a", "title": "Task A", "order": 1, "kind": "requirement", "requires": [] }
  ],
  "unresolved": [], "cycles": [],
  "warnings": ["\"a\" refers to unknown requirement \"missing\"."],
  "ok": true
}
```

### PG-011 — Warn for an unknown top-level goal requirement

**Category:** Unknown top-level requirement; warning reporting

**Input**

```json
{
  "goal": { "id": "g-unknown-top", "requirements": ["missing"] },
  "answers": {},
  "requirements": []
}
```

**Expected output**

```json
{
  "steps": [], "unresolved": [], "cycles": [],
  "warnings": ["Goal \"g-unknown-top\" refers to unknown requirement \"missing\"."],
  "ok": true
}
```

### PG-012 — Return a controlled failure for a missing or invalid goal

**Category:** Input validation; controlled failure

**Input A — null goal**

```json
{ "goal": null, "answers": {}, "requirements": [] }
```

**Expected output A**

```json
{
  "steps": [], "unresolved": [], "cycles": [],
  "warnings": ["Goal is missing or has no \"requirements\" list."],
  "ok": false
}
```

**Input B — goal without a requirements array**

```json
{ "goal": { "id": "g-invalid" }, "answers": {}, "requirements": [] }
```

**Expected output B**

```json
{
  "steps": [], "unresolved": [], "cycles": [],
  "warnings": ["Goal is missing or has no \"requirements\" list."],
  "ok": false
}
```

### PG-013 — Detect a circular dependency and mark cycle members unresolved

**Category:** Circular dependency detection

**Input**

```json
{
  "goal": { "id": "g-cycle", "requirements": ["a"] },
  "answers": {},
  "requirements": [
    { "id": "a", "title": "A", "requires": ["b"] },
    { "id": "b", "title": "B", "requires": ["a"] }
  ]
}
```

**Expected output**

```json
{
  "steps": [],
  "unresolved": [
    { "id": "a", "title": "A", "inCycle": true },
    { "id": "b", "title": "B", "inCycle": true }
  ],
  "cycles": [["a", "b", "a"]],
  "warnings": ["Circular dependency: a -> b -> a"],
  "ok": false
}
```

### PG-014 — Mark a dependent blocked by a cycle as unresolved but not in the cycle

**Category:** Cycle-blocked dependent; unresolved-step classification

**Input**

```json
{
  "goal": { "id": "g-blocked", "requirements": ["c"] },
  "answers": {},
  "requirements": [
    { "id": "a", "title": "A", "requires": ["b"] },
    { "id": "b", "title": "B", "requires": ["a"] },
    { "id": "c", "title": "C", "requires": ["b"] }
  ]
}
```

**Expected output**

```json
{
  "steps": [],
  "unresolved": [
    { "id": "c", "title": "C", "inCycle": false },
    { "id": "b", "title": "B", "inCycle": true },
    { "id": "a", "title": "A", "inCycle": true }
  ],
  "cycles": [["b", "a", "b"]],
  "warnings": ["Circular dependency: b -> a -> b"],
  "ok": false
}
```

### PG-015 — Drop a dependency that does not apply to the user's answers

**Category:** Conditional dependency filtering

**Input**

```json
{
  "goal": { "id": "g-filtered-dependency", "requirements": ["dependent"] },
  "answers": { "includePrerequisite": "no" },
  "requirements": [
    { "id": "dependent", "title": "Dependent", "requires": ["conditional"] },
    { "id": "conditional", "title": "Conditional", "when": { "includePrerequisite": "yes" } }
  ]
}
```

**Expected output**

```json
{
  "steps": [
    { "id": "dependent", "title": "Dependent", "order": 1, "kind": "requirement", "requires": [] }
  ],
  "unresolved": [], "cycles": [], "warnings": [], "ok": true
}
```

### PG-016 — Accept an array answer when at least one value matches a condition

**Category:** Multi-select answer matching

**Input**

```json
{
  "goal": { "id": "g-array-answer", "requirements": ["special"] },
  "answers": { "documentTypes": ["passport", "national-id"] },
  "requirements": [
    { "id": "special", "title": "Special", "when": { "documentTypes": ["national-id", "birth-certificate"] } }
  ]
}
```

**Expected output**

```json
{
  "steps": [
    { "id": "special", "title": "Special", "order": 1, "kind": "requirement", "requires": [] }
  ],
  "unresolved": [], "cycles": [], "warnings": [], "ok": true
}
```

## Implementation notes and known limitations

- The implementation deduplicates identical warning strings and preserves first-occurrence order.
- Unknown top-level requirements and missing prerequisite references can produce warnings while leaving `ok: true`; `ok` is specifically a cycle flag, not a general validity flag.
- A missing string prerequisite is warned about during collection, then omitted from the known step's `requires` array.
- An “any one of” option is represented by a single synthetic step whose ID is `anyOf:` followed by the lexically sorted option IDs joined with `|`. The displayed `options` list preserves the group's input option order. The options' own dependencies are not expanded.
- If no usable alternative exists, the dependent remains in the plan without that dependency and a warning is emitted. This is current behavior, not an assertion that the plan is complete.
- Cycle and unresolved array order follows the current graph traversal and insertion order. In particular, a blocked dependent can appear in `unresolved` with `inCycle: false`.
- `src/data/planningRules.js` explicitly labels the current planning rules as illustrative, not verified agency prerequisites. These test fixtures do not certify any real government-document dependency.
- The cases above are based on the current implementation and documented assumptions. They have not been run as an automated test suite as part of writing this document.
