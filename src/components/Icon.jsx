// Small, decorative line icons shared by navigation and resource cards.
const paths = {
  search: 'm21 21-5-5 M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  arrow: 'M4 12h16 m-6-6 6 6-6 6',
  chevron: 'm6 9 6 6 6-6',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'm6 6 12 12 M6 18 18 6',
  services: 'M4 8h16v13H4z M8 8V4h8v4 M4 13h16 M10 13v3h4v-3',
  barangays: 'm3 10 9-7 9 7 M5 9v12h14V9 M9 21v-7h6v7',
  districts: 'm3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2z M9 3v16 M15 5v16',
  officials: 'm3 8 9-5 9 5z M5 10v8 M10 10v8 M14 10v8 M19 10v8 M3 21h18',
  budget: 'M3 5h18v14H3z M7 9h1 M16 15h1 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  updates: 'M5 3h14v18H5z M9 7h6 M9 11h6 M9 15h6',
  live: 'M12 3v2 M12 19v2 M3 12h2 M19 12h2 m-13-6-1-1 m12 12 1 1 M6 18l-1 1 M18 6l1-1 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  checklist: 'M9 5h11 M9 12h11 M9 19h11 m-17-14 1 1 2-3 m-3 9 1 1 2-3 m-3 9 1 1 2-3',
  assistant: 'M4 4h16v13H9l-5 4z M8 9h8 M8 13h5',
}

export default function Icon({ name, className = '' }) {
  return <svg className={`ui-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name] ?? paths.services} /></svg>
}
