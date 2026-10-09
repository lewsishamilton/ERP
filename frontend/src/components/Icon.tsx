// Inline stroke icons used across the app. <Icon name="home" /> renders an 18px icon.
const PATHS = {
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  book: <><path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" /><path d="M9 7h7" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
  cardPlain: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  message: <path d="M4 4h16v12H9l-5 4z" />,
  phone: <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" />,
  logout: <path d="M9 4H5v16h4M14 8l4 4-4 4M18 12H9" />,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  check: <path d="M5 12l5 5 9-10" />,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9zM9 12h6M9 16h4" /></>,
  clipboardCheck: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9zM9 13l2 2 4-4" /></>,
  pen: <path d="M4 20h4L20 8l-4-4L4 16z" />,
  megaphone: <><path d="M3 10v4l12 5V5z" /><path d="M15 9h2a3 3 0 0 1 0 6h-2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></>,
}

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 18, stroke = 1.7, color = 'currentColor' }: { name: IconName; size?: number; stroke?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}
