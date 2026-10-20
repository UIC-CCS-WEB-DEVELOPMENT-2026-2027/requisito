// Automated versions of the cases documented in docs/test-cases.md (Issue #11).
// Each case asserts the COMPLETE return value of generatePlan(): steps, unresolved,
// cycles, warnings and ok. Array order is significant. Fixtures are synthetic.
import test from 'node:test'
import assert from 'node:assert/strict'
import { generatePlan } from '../utils/planGenerator.js'

const cases = [
  {
    id: 'PG-001',
    name: 'generates ordinary requirements in catalog order',
    goal: { id: 'g-normal', requirements: ['b', 'a'] },
    answers: {},
    requirements: [
      { id: 'a', title: 'Alpha' },
      { id: 'b', title: 'Beta' },
    ],
    expected: {
      steps: [
        { id: 'a', title: 'Alpha', order: 1, kind: 'requirement', requires: [] },
        { id: 'b', title: 'Beta', order: 2, kind: 'requirement', requires: [] },
      ],
      unresolved: [], cycles: [], warnings: [], ok: true,
    },
  },
  {
    id: 'PG-002',
    name: 'puts a prerequisite before its dependent despite catalog order',
    goal: { id: 'g-order', requirements: ['dependent'] },
    answers: {},
    requirements: [
      { id: 'dependent', title: 'Dependent', requires: ['prerequisite'] },
      { id: 'prerequisite', title: 'Prerequisite' },
    ],
    expected: {
      steps: [
        { id: 'prerequisite', title: 'Prerequisite', order: 1, kind: 'requirement', requires: [] },
        { id: 'dependent', title: 'Dependent', order: 2, kind: 'requirement', requires: ['prerequisite'] },
      ],
      unresolved: [], cycles: [], warnings: [], ok: true,
    },
  },
  {
    id: 'PG-003',
    name: 'includes a conditional requirement when its condition matches',
    goal: { id: 'g-conditional-yes', requirements: ['clearance'] },
    answers: { needsClearance: 'yes' },
    requirements: [{ id: 'clearance', title: 'Clearance', when: { needsClearance: 'yes' } }],
    expected: {
      steps: [{ id: 'clearance', title: 'Clearance', order: 1, kind: 'requirement', requires: [] }],
      unresolved: [], cycles: [], warnings: [], ok: true,
    },
  },
  {
    id: 'PG-004',
    name: 'excludes a conditional requirement when an answered condition conflicts',
    goal: { id: 'g-conditional-no', requirements: ['clearance'] },
    answers: { needsClearance: 'no' },
    requirements: [{ id: 'clearance', title: 'Clearance', when: { needsClearance: 'yes' } }],
    expected: { steps: [], unresolved: [], cycles: [], warnings: [], ok: true },
  },
  {
    id: 'PG-005',
    name: 'retains a conditional requirement when its question is unanswered',
    goal: { id: 'g-conditional-unknown', requirements: ['clearance'] },
    answers: {},
    requirements: [{ id: 'clearance', title: 'Clearance', when: { needsClearance: 'yes' } }],
    expected: {
      steps: [{ id: 'clearance', title: 'Clearance', order: 1, kind: 'requirement', requires: [] }],
      unresolved: [], cycles: [], warnings: [], ok: true,
    },
  },
  {
    id: 'PG-006',
    name: 'requires every answered conditional field to match',
    goal: { id: 'g-multi-condition', requirements: ['special'] },
    answers: { employment: 'employed', region: 'north' },
    requirements: [
      { id: 'special', title: 'Special document', when: { employment: 'employed', region: 'south' } },
    ],
    expected: { steps: [], unresolved: [], cycles: [], warnings: [], ok: true },
  },
  {
    id: 'PG-007',
    name: 'represents a shared "any one of" group as one choice step',
    goal: { id: 'g-anyof-shared', requirements: ['a', 'b'] },
    answers: {},
    requirements: [
      { id: 'a', title: 'Task A', requires: [{ anyOf: ['id-a', 'id-b'], label: 'Choose one ID' }] },
      { id: 'b', title: 'Task B', requires: [{ anyOf: ['id-a', 'id-b'], label: 'Choose one ID' }] },
      { id: 'id-a', title: 'ID A' },
      { id: 'id-b', title: 'ID B' },
    ],
    expected: {
      steps: [
        {
          order: 1, id: 'anyOf:id-a|id-b', kind: 'anyOf', title: 'Choose one ID',
          options: [{ id: 'id-a', title: 'ID A' }, { id: 'id-b', title: 'ID B' }], requires: [],
        },
        { id: 'a', title: 'Task A', order: 2, kind: 'requirement', requires: ['anyOf:id-a|id-b'] },
        { id: 'b', title: 'Task B', order: 3, kind: 'requirement', requires: ['anyOf:id-a|id-b'] },
      ],
      unresolved: [], cycles: [], warnings: [], ok: true,
    },
  },
  {
    id: 'PG-008',
    name: 'lets an already-included option satisfy an "any one of" group',
    goal: { id: 'g-anyof-existing', requirements: ['a', 'id-a'] },
    answers: {},
    requirements: [
      { id: 'a', title: 'Task A', requires: [{ anyOf: ['id-a', 'id-b'] }] },
      { id: 'id-a', title: 'ID A' },
      { id: 'id-b', title: 'ID B' },
    ],
    expected: {
      steps: [
        { id: 'id-a', title: 'ID A', order: 1, kind: 'requirement', requires: [] },
        { id: 'a', title: 'Task A', order: 2, kind: 'requirement', requires: ['id-a'] },
      ],
      unresolved: [], cycles: [], warnings: [], ok: true,
    },
  },
  {
    id: 'PG-009',
    name: 'warns when an "any one of" group has no usable options',
    goal: { id: 'g-anyof-empty', requirements: ['a'] },
    answers: {},
    requirements: [{ id: 'a', title: 'Task A', requires: [{ anyOf: ['missing-option'] }] }],
    expected: {
      steps: [{ id: 'a', title: 'Task A', order: 1, kind: 'requirement', requires: [] }],
      unresolved: [], cycles: [],
      warnings: [
        '"a" refers to unknown requirement "missing-option".',
        '"a" has an "any one of" group with no usable options.',
      ],
      ok: true,
    },
  },
  {
    id: 'PG-010',
    name: 'warns for a missing prerequisite reference but keeps the known step',
    goal: { id: 'g-missing-dependency', requirements: ['a'] },
    answers: {},
    requirements: [{ id: 'a', title: 'Task A', requires: ['missing'] }],
    expected: {
      steps: [{ id: 'a', title: 'Task A', order: 1, kind: 'requirement', requires: [] }],
      unresolved: [], cycles: [],
      warnings: ['"a" refers to unknown requirement "missing".'],
      ok: true,
    },
  },
  {
    id: 'PG-011',
    name: 'warns for an unknown top-level goal requirement',
    goal: { id: 'g-unknown-top', requirements: ['missing'] },
    answers: {},
    requirements: [],
    expected: {
      steps: [], unresolved: [], cycles: [],
      warnings: ['Goal "g-unknown-top" refers to unknown requirement "missing".'],
      ok: true,
    },
  },
  {
    id: 'PG-012A',
    name: 'returns a controlled failure for a null goal',
    goal: null,
    answers: {},
    requirements: [],
    expected: {
      steps: [], unresolved: [], cycles: [],
      warnings: ['Goal is missing or has no "requirements" list.'],
      ok: false,
    },
  },
  {
    id: 'PG-012B',
    name: 'returns a controlled failure for a goal without a requirements array',
    goal: { id: 'g-invalid' },
    answers: {},
    requirements: [],
    expected: {
      steps: [], unresolved: [], cycles: [],
      warnings: ['Goal is missing or has no "requirements" list.'],
      ok: false,
    },
  },
  {
    id: 'PG-013',
    name: 'detects a circular dependency and marks cycle members unresolved',
    goal: { id: 'g-cycle', requirements: ['a'] },
    answers: {},
    requirements: [
      { id: 'a', title: 'A', requires: ['b'] },
      { id: 'b', title: 'B', requires: ['a'] },
    ],
    expected: {
      steps: [],
      unresolved: [
        { id: 'a', title: 'A', inCycle: true },
        { id: 'b', title: 'B', inCycle: true },
      ],
      cycles: [['a', 'b', 'a']],
      warnings: ['Circular dependency: a -> b -> a'],
      ok: false,
    },
  },
  {
    id: 'PG-014',
    name: 'marks a dependent blocked by a cycle as unresolved but not in the cycle',
    goal: { id: 'g-blocked', requirements: ['c'] },
    answers: {},
    requirements: [
      { id: 'a', title: 'A', requires: ['b'] },
      { id: 'b', title: 'B', requires: ['a'] },
      { id: 'c', title: 'C', requires: ['b'] },
    ],
    expected: {
      steps: [],
      unresolved: [
        { id: 'c', title: 'C', inCycle: false },
        { id: 'b', title: 'B', inCycle: true },
        { id: 'a', title: 'A', inCycle: true },
      ],
      cycles: [['b', 'a', 'b']],
      warnings: ['Circular dependency: b -> a -> b'],
      ok: false,
    },
  },
  {
    id: 'PG-015',
    name: "drops a dependency that does not apply to the user's answers",
    goal: { id: 'g-filtered-dependency', requirements: ['dependent'] },
    answers: { includePrerequisite: 'no' },
    requirements: [
      { id: 'dependent', title: 'Dependent', requires: ['conditional'] },
      { id: 'conditional', title: 'Conditional', when: { includePrerequisite: 'yes' } },
    ],
    expected: {
      steps: [{ id: 'dependent', title: 'Dependent', order: 1, kind: 'requirement', requires: [] }],
      unresolved: [], cycles: [], warnings: [], ok: true,
    },
  },
  {
    id: 'PG-016',
    name: 'accepts an array answer when at least one value matches a condition',
    goal: { id: 'g-array-answer', requirements: ['special'] },
    answers: { documentTypes: ['passport', 'national-id'] },
    requirements: [
      { id: 'special', title: 'Special', when: { documentTypes: ['national-id', 'birth-certificate'] } },
    ],
    expected: {
      steps: [{ id: 'special', title: 'Special', order: 1, kind: 'requirement', requires: [] }],
      unresolved: [], cycles: [], warnings: [], ok: true,
    },
  },
]

for (const { id, name, goal, answers, requirements, expected } of cases) {
  test(`${id}: ${name}`, () => {
    assert.deepEqual(generatePlan(goal, answers, requirements), expected)
  })
}
