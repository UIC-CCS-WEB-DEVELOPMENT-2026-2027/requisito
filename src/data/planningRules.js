// Illustrative planning rules only, NOT verified agency prerequisites.
// Separate metadata preserves the exact Week 2 Goal/Requirement record fields.
export const planningQuestions = [
  {
    id: 'hasEmploymentRelationship',
    goalIds: [1, 5],
    labelKey: 'checklist.question.employmentRelationship',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'yes', labelKey: 'checklist.answer.employmentYes' },
      { value: 'no', labelKey: 'checklist.answer.employmentNotYet' },
    ],
  },
  {
    id: 'employerRequestedBirthCertificate',
    goalIds: [1],
    labelKey: 'checklist.question.employerBirthCertificate',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'yes', labelKey: 'checklist.answer.yes' },
      { value: 'no', labelKey: 'checklist.answer.no' },
    ],
  },
  {
    id: 'employerRequestedTin',
    goalIds: [1],
    labelKey: 'checklist.question.employerTin',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'yes', labelKey: 'checklist.answer.yes' },
      { value: 'no', labelKey: 'checklist.answer.no' },
    ],
  },
  {
    id: 'needsClearance',
    goalIds: [1],
    labelKey: 'checklist.question.employerClearance',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'yes', labelKey: 'checklist.answer.yes' },
      { value: 'no', labelKey: 'checklist.answer.no' },
    ],
  },
  {
    id: 'workLocationDavao',
    goalIds: [7],
    labelKey: 'checklist.question.workLocationDavao',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'yes', labelKey: 'checklist.answer.yes' },
      { value: 'no', labelKey: 'checklist.answer.no' },
    ],
  },
  {
    id: 'healthCardFoodIndustry',
    goalIds: [7],
    labelKey: 'checklist.question.foodIndustry',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'yes', labelKey: 'checklist.answer.yes' },
      { value: 'no', labelKey: 'checklist.answer.no' },
    ],
  },
  {
    id: 'healthCardBodyFluids',
    goalIds: [7],
    labelKey: 'checklist.question.bodyFluids',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'yes', labelKey: 'checklist.answer.yes' },
      { value: 'no', labelKey: 'checklist.answer.no' },
    ],
  },
  {
    id: 'passportApplicationType',
    goalIds: [2],
    labelKey: 'demo.question.passportApplicationType',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'first-time', labelKey: 'demo.answer.firstApplication' },
      { value: 'renewal', labelKey: 'demo.answer.renewal' },
    ],
  },
  {
    id: 'hasExistingNbiClearance',
    goalIds: [3],
    labelKey: 'demo.question.existingNbiClearance',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'yes', labelKey: 'demo.answer.yes' },
      { value: 'no', labelKey: 'demo.answer.no' },
    ],
  },
  {
    id: 'driversLicenseRoute',
    goalIds: [4],
    labelKey: 'demo.question.driversLicenseRoute',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'first-application', labelKey: 'demo.answer.firstLicense' },
      { value: 'renewal', labelKey: 'demo.answer.licenseRenewal' },
      { value: 'conversion', labelKey: 'demo.answer.licenseConversion' },
    ],
  },
  {
    id: 'hasExistingSssNumber',
    goalIds: [5],
    labelKey: 'demo.question.existingSssNumber',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'yes', labelKey: 'demo.answer.yes' },
      { value: 'no', labelKey: 'demo.answer.no' },
    ],
  },
  {
    id: 'hasExistingPhilhealthNumber',
    goalIds: [5],
    labelKey: 'demo.question.existingPhilhealthNumber',
    options: [
      { value: '', labelKey: 'checklist.answer.unsure' },
      { value: 'yes', labelKey: 'demo.answer.yes' },
      { value: 'no', labelKey: 'demo.answer.no' },
    ],
  },
]

export const planningRules = {}
