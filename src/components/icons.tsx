// Inline SVG icons for public pages — stroke="currentColor", strokeWidth adaptable via prop

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  className?: string;
}

const ico = (paths: React.ReactNode, vb = "0 0 20 20") =>
  ({ size = 20, color, strokeWidth = 1.4, style, className }: IconProps) => (
    <svg
      width={size} height={size} viewBox={vb} fill="none"
      style={{ color, flexShrink: 0, ...style }}
      className={className}
      aria-hidden="true"
    >
      {typeof paths === "function" ? (paths as (sw: number) => React.ReactNode)(strokeWidth) : paths}
    </svg>
  );

export const IcoFileText = ({ size = 20, color, strokeWidth = 1.4, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <path d="M5 2.5h7l3.5 3.5V17a.5.5 0 01-.5.5H5a.5.5 0 01-.5-.5V3a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"/>
    <path d="M12 2.5v4h3.5M7 10h6M7 13h6M7 7h3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

export const IcoHome = ({ size = 20, color, strokeWidth = 1.4, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <path d="M2.5 9L10 3l7.5 6V17a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5V9z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"/>
    <path d="M8 17.5v-5h4v5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"/>
  </svg>
);

export const IcoCalendarDays = ({ size = 20, color, strokeWidth = 1.4, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <rect x="2" y="3.5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth={strokeWidth}/>
    <path d="M2 8h16" stroke="currentColor" strokeWidth={strokeWidth}/>
    <path d="M7 1.5v4M13 1.5v4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"/>
    <circle cx="7" cy="12" r="1" fill="currentColor"/>
    <circle cx="10" cy="12" r="1" fill="currentColor"/>
    <circle cx="13" cy="12" r="1" fill="currentColor"/>
    <circle cx="7" cy="15" r="1" fill="currentColor"/>
    <circle cx="10" cy="15" r="1" fill="currentColor"/>
  </svg>
);

export const IcoClock = ({ size = 20, color, strokeWidth = 1.4, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth={strokeWidth}/>
    <path d="M10 6.5v4l2.5 1.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IcoCheckSquare = ({ size = 20, color, strokeWidth = 1.4, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <rect x="2.5" y="2.5" width="15" height="15" rx="3" stroke="currentColor" strokeWidth={strokeWidth}/>
    <path d="M6.5 10.5l3 3 4.5-5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IcoStar = ({ size = 20, color, strokeWidth = 1.4, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <path d="M10 2l2.1 5.8H18l-4.8 3.5 1.8 5.7L10 13.5l-5 3.5 1.8-5.7L2 7.8h5.9L10 2z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"/>
  </svg>
);

export const IcoMail = ({ size = 20, color, strokeWidth = 1.4, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth={strokeWidth}/>
    <path d="M2 7.5l8 5 8-5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"/>
  </svg>
);

export const IcoArrowRight = ({ size = 16, color, strokeWidth = 1.5, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <path d="M3 8h10M9.5 4.5L13 8l-3.5 3.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IcoCheck = ({ size = 16, color, strokeWidth = 1.8, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <path d="M2.5 8.5l4 3.5 7-8" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IcoChevronLeft = ({ size = 14, color, strokeWidth = 1.5, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IcoPlus = ({ size = 14, color, strokeWidth = 1.4, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

export const IcoFileCheck = ({ size = 14, color, strokeWidth = 1.4, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <path d="M3.5 1.5h5l3 3V12a.5.5 0 01-.5.5H3.5A.5.5 0 013 12V2a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"/>
    <path d="M8.5 1.5v3.5H12M5 8l1.5 1.5 3-3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IcoInfo = ({ size = 16, color, strokeWidth = 1.3, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ color, flexShrink: 0, ...style }} aria-hidden>
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth={strokeWidth}/>
    <path d="M8 7v5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"/>
    <circle cx="8" cy="5" r=".8" fill="currentColor"/>
  </svg>
);
