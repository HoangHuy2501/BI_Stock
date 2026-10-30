import type { ReactNode } from 'react';

import type { IconName } from '../lib/store';

const ICONS: Record<IconName, ReactNode> = {
  wip: (
    <g>
      <path d="M3 21h18" />
      <path d="M5 21V10l4.5 2.5V10L14 12.5V7h3.5v14" />
      <path d="M15.5 11h1.5" />
    </g>
  ),
  raw: (
    <g>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </g>
  ),
  sfg: (
    <g>
      <path d="M12 3l8 4-8 4-8-4 8-4z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 17l8 4 8-4" />
    </g>
  ),
  finished: (
    <g>
      <path d="M12 3l2.3 1.6 2.8-.2.9 2.6L20.4 8.6 19.6 11l.8 2.4-2.4 1.6-.9 2.6-2.8-.2L12 19l-2.3-1.6-2.8.2-.9-2.6L3.6 13l.8-2.4L3.6 8.6 6 7l.9-2.6 2.8.2L12 3z" />
      <path d="M9 11.5l2.2 2.2L15.5 9.5" />
    </g>
  ),
  scrap: (
    <g>
      <path d="M4 7h16" />
      <path d="M9.5 7V5.2h5V7" />
      <path d="M6.5 7l1 13h9l1-13" />
      <path d="M10 11v5.5M14 11v5.5" />
    </g>
  ),
  leftover: (
    <g>
      <path d="M3.5 7.5h17v3.8h-17z" />
      <path d="M5.5 11.3V20h13v-8.7" />
      <path d="M10 15h4" />
    </g>
  ),
  reserve: (
    <g>
      <path d="M12 3l7 2.6v6.1c0 4.3-2.9 7.3-7 9.3-4.1-2-7-5-7-9.3V5.6L12 3z" />
      <path d="M9 11.8l2.2 2.2 3.8-3.8" />
    </g>
  ),
  other: (
    <g>
      <path d="M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z" />
    </g>
  ),
  alert: (
    <g>
      <path d="M12 4.5l8.5 15h-17l8.5-15z" />
      <path d="M12 10v3.6M12 16.8h.01" />
    </g>
  ),
  clock: (
    <g>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.5V12l3.2 2" />
    </g>
  ),
  shield: (
    <g>
      <path d="M12 3l7 2.6v6.1c0 4.3-2.9 7.3-7 9.3-4.1-2-7-5-7-9.3V5.6L12 3z" />
      <path d="M9 11.8l2.2 2.2 3.8-3.8" />
    </g>
  ),
  search: (
    <g>
      <circle cx="10.5" cy="10.5" r="6.2" />
      <path d="M15.2 15.2L20 20" />
    </g>
  ),
  chevron: <path d="M9 5l7 7-7 7" />,
  chevronUp: <path d="M6 14.5l6-6 6 6" />,
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  external: (
    <g>
      <path d="M14 4h6v6" />
      <path d="M20 4l-7.5 7.5" />
      <path d="M18.5 14.5V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V8A1.5 1.5 0 0 1 6 6.5h4.5" />
    </g>
  ),
};

interface IconProps {
  name: IconName;
  size?: number;
}

const Icon = ({ name, size = 18 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICONS[name] ?? ICONS.other}
  </svg>
);

export default Icon;
