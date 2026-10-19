// ---- sample data (illustrative only) ----
const ID_GROUP = { anyOf: ['school-id', 'postal-id', 'passport'], label: 'Any one accepted ID' }
const baseRequirements = [
  { id: 'psa-birth-certificate', title: 'PSA birth certificate' },
  { id: 'marriage-certificate', title: 'PSA marriage certificate', when: { civilStatus: 'married' } },
  { id: 'school-id', title: 'School ID' },
  { id: 'postal-id', title: 'Postal ID' },
  { id: 'passport', title: 'Passport' },
  { id: 'barangay-clearance', title: 'Barangay clearance', requires: [ID_GROUP] },
  { id: 'nbi-clearance', title: 'NBI clearance', requires: [ID_GROUP, 'barangay-clearance'] },
  { id: 'tin', title: 'TIN', requires: ['psa-birth-certificate', 'marriage-certificate'] },
  { id: 'sss', title: 'SSS number', requires: ['psa-birth-certificate', 'tin'] },
  { id: 'philhealth', title: 'PhilHealth number', requires: ['psa-birth-certificate'] },
]