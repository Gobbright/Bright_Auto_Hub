const paths = {
  dashboard: ['M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'],
  brand: ['M12 3 3 8l9 5 9-5-9-5Z', 'm3 12 9 5 9-5', 'm3 16 9 5 9-5'],
  category: ['M20 13.5 13.5 20a2 2 0 0 1-2.8 0L3 12.3V4h8.3l8.7 8.7a1.2 1.2 0 0 1 0 .8Z', 'M7.5 7.5h.01'],
  vehicle: ['M5 16h14l-1.5-5.5a2 2 0 0 0-1.9-1.5H8.4a2 2 0 0 0-1.9 1.5L5 16Z', 'M3 16h18v3H3z', 'M7 19v2M17 19v2'],
  page: ['M6 3h9l4 4v14H6z', 'M15 3v5h4', 'M9 12h7M9 16h7'],
  blog: ['M5 4h14v16H5z', 'M8 8h8M8 12h8M8 16h5'],
  plus: ['M12 5v14M5 12h14'],
  search: ['m20 20-4.5-4.5', 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z'],
  edit: ['m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z', 'm13.5 7.5 3 3'],
  eye: ['M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  parts: ['M12 4a3 3 0 0 0-3 3v2H7a3 3 0 0 0 0 6h2v2a3 3 0 0 0 6 0v-2h2a3 3 0 0 0 0-6h-2V7a3 3 0 0 0-3-3Z'],
  service: ['M14 6a4 4 0 0 0-5 5L4 16l4 4 5-5a4 4 0 0 0 5-5l-3 3-4-4 3-3Z'],
  inbox: ['M4 5h16v14H4z', 'M4 14h4l2 3h4l2-3h4'],
  activity: ['M4 12h3l2-5 4 10 2-5h5', 'M4 4h16v16H4z'],
  image: ['M4 5h16v14H4z', 'm4 15 4-4 4 4 2-2 6 6', 'M15 9h.01'],
  storage: ['M4 6c0-2 3.6-3 8-3s8 1 8 3-3.6 3-8 3-8-1-8-3Z', 'M4 6v6c0 2 3.6 3 8 3s8-1 8-3V6', 'M4 12v6c0 2 3.6 3 8 3s8-1 8-3v-6'],
  trash: ['M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6'],
  menu: ['M4 7h16M4 12h16M4 17h16'],
  close: ['m6 6 12 12M18 6 6 18'],
  chevronDown: ['m6 9 6 6 6-6'],
  back: ['M19 12H5', 'm12 5-7 7 7 7'],
  logout: ['M10 5H5v14h5M14 8l4 4-4 4M18 12H9'],
  refresh: ['M20 6v5h-5M4 18v-5h5', 'M6.1 9a7 7 0 0 1 11.5-2.5L20 11M4 13l2.4 4.5A7 7 0 0 0 18 15'],
  copy: ['M8 8h10v12H8z', 'M6 16H4V4h12v2'],
}

export default function AdminIcon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {(paths[name] || paths.dashboard).map((path) => <path key={path} d={path} />)}
    </svg>
  )
}
