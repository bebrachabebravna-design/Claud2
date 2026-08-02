/**
 * Clean line-icon set replacing emoji glyphs. Emoji render inconsistently
 * across the headless Chromium build used for rendering (missing colour
 * glyphs, font fallbacks) and read as generic — a stroked icon in the
 * project's own palette sits inside the composition instead of looking
 * pasted on top of it.
 *
 * Stroke-based, single weight, no fill — matches the outline style used
 * across the rest of the UI.
 */
type IconProps = { size?: number; color?: string; strokeWidth?: number };

export const IconFolder: React.FC<IconProps> = ({
  size = 64,
  color = "#FFFFFF",
  strokeWidth = 5,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path
      d="M8 20c0-2.2 1.8-4 4-4h12l6 6h22c2.2 0 4 1.8 4 4v22c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V20Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

export const IconChat: React.FC<IconProps> = ({
  size = 64,
  color = "#FFFFFF",
  strokeWidth = 5,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path
      d="M10 14h44c2.2 0 4 1.8 4 4v22c0 2.2-1.8 4-4 4H28l-12 10v-10h-6c-2.2 0-4-1.8-4-4V18c0-2.2 1.8-4 4-4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <circle cx={24} cy={29} r={2.6} fill={color} />
    <circle cx={34} cy={29} r={2.6} fill={color} />
    <circle cx={44} cy={29} r={2.6} fill={color} />
  </svg>
);

export const IconMail: React.FC<IconProps> = ({
  size = 64,
  color = "#FFFFFF",
  strokeWidth = 5,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect
      x={8}
      y={14}
      width={48}
      height={36}
      rx={4}
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M10 17l22 18 22-18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconSearch: React.FC<IconProps> = ({
  size = 96,
  color = "#FFFFFF",
  strokeWidth = 6,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx={27} cy={27} r={16} stroke={color} strokeWidth={strokeWidth} />
    <path
      d="M39 39l14 14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

export const IconArrowDown: React.FC<IconProps> = ({
  size = 56,
  color = "#FFFFFF",
  strokeWidth = 6,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path
      d="M32 8v44M16 38l16 16 16-16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
