// Illustrative planning rules only, NOT verified agency prerequisites.
// Separate metadata preserves the exact Week 2 Goal/Requirement record fields.
export const planningQuestions = [
  {
    id: 'needsClearance',
    label: 'Has your employer asked for NBI clearance?',
    options: [
      { value: '', label: 'Not sure yet (include it for now)' },
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
]

export const planningRules = {
  2: { requires: ['1'] },
  3: { requires: ['1', '2'] },
  4: { requires: ['1'] },
  5: { requires: ['1'] },
  6: { when: { needsClearance: 'yes' } },
}
