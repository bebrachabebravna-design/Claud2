/**
 * Line-icon set used across the scenes.
 *
 * Emoji render inconsistently in the headless Chromium used for rendering and
 * read as generic clip-art next to typeset text. These are stroked paths on a
 * 64-unit grid at one weight, so they scale cleanly and take the palette colour
 * of whatever scene they sit in.
 */
type IconProps = { size?: number; color?: string; strokeWidth?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 64 64",
  fill: "none" as const,
});

export const IconFolder: React.FC<IconProps> = ({
  size = 64,
  color = "#FFFFFF",
  strokeWidth = 4,
}) => (
  <svg {...base(size)}>
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
  strokeWidth = 4,
}) => (
  <svg {...base(size)}>
    <path
      d="M10 14h44c2.2 0 4 1.8 4 4v22c0 2.2-1.8 4-4 4H28l-12 10v-10h-6c-2.2 0-4-1.8-4-4V18c0-2.2 1.8-4 4-4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <circle cx={24} cy={29} r={2.4} fill={color} />
    <circle cx={34} cy={29} r={2.4} fill={color} />
    <circle cx={44} cy={29} r={2.4} fill={color} />
  </svg>
);

export const IconMail: React.FC<IconProps> = ({
  size = 64,
  color = "#FFFFFF",
  strokeWidth = 4,
}) => (
  <svg {...base(size)}>
    <rect x={8} y={14} width={48} height={36} rx={4} stroke={color} strokeWidth={strokeWidth} />
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
  strokeWidth = 5,
}) => (
  <svg {...base(size)}>
    <circle cx={27} cy={27} r={16} stroke={color} strokeWidth={strokeWidth} />
    <path d="M39 39l14 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const IconDoc: React.FC<IconProps> = ({
  size = 64,
  color = "#FFFFFF",
  strokeWidth = 4,
}) => (
  <svg {...base(size)}>
    <path
      d="M14 8h24l14 14v34c0 2.2-1.8 4-4 4H14c-2.2 0-4-1.8-4-4V12c0-2.2 1.8-4 4-4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path d="M38 8v14h14" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path
      d="M20 34h24M20 43h24M20 25h12"
      stroke={color}
      strokeWidth={strokeWidth - 0.6}
      strokeLinecap="round"
    />
  </svg>
);

export const IconClock: React.FC<IconProps> = ({
  size = 64,
  color = "#FFFFFF",
  strokeWidth = 4,
}) => (
  <svg {...base(size)}>
    <circle cx={32} cy={32} r={24} stroke={color} strokeWidth={strokeWidth} />
    <path
      d="M32 17v16l11 7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconAlert: React.FC<IconProps> = ({
  size = 64,
  color = "#FFFFFF",
  strokeWidth = 4,
}) => (
  <svg {...base(size)}>
    <path
      d="M32 9 58 53H6L32 9Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path d="M32 26v12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx={32} cy={45} r={2.6} fill={color} />
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({
  size = 64,
  color = "#FFFFFF",
  strokeWidth = 5,
}) => (
  <svg {...base(size)}>
    <circle cx={32} cy={32} r={24} stroke={color} strokeWidth={strokeWidth - 1} />
    <path
      d="M21 33l8 8 15-16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconBolt: React.FC<IconProps> = ({
  size = 64,
  color = "#FFFFFF",
  strokeWidth = 4,
}) => (
  <svg {...base(size)}>
    <path
      d="M35 6 14 36h14l-3 22 21-30H32l3-22Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

export const IconArrowDown: React.FC<IconProps> = ({
  size = 56,
  color = "#FFFFFF",
  strokeWidth = 5,
}) => (
  <svg {...base(size)}>
    <path
      d="M32 8v44M16 38l16 16 16-16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconArrowRight: React.FC<IconProps> = ({
  size = 56,
  color = "#FFFFFF",
  strokeWidth = 5,
}) => (
  <svg {...base(size)}>
    <path
      d="M8 32h44M38 16l16 16-16 16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconSliders: React.FC<IconProps> = ({
  size = 64,
  color = "#FFFFFF",
  strokeWidth = 4,
}) => (
  <svg {...base(size)}>
    <path
      d="M10 20h44M10 32h44M10 44h44"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <circle cx={22} cy={20} r={6} fill={color} />
    <circle cx={40} cy={32} r={6} fill={color} />
    <circle cx={28} cy={44} r={6} fill={color} />
  </svg>
);
