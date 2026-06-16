import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="ClickAgende"
      className={cn("block h-10 w-10 shrink-0", className)}
    >
      <defs>
        <linearGradient id="brand-mark-gradient" x1="10" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7F5AF0" />
          <stop offset="0.56" stopColor="#A878E8" />
          <stop offset="1" stopColor="#56BFD1" />
        </linearGradient>
        <filter id="brand-mark-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#5B4DB8" floodOpacity="0.18" />
        </filter>
      </defs>

      <circle cx="32" cy="32" r="28" fill="url(#brand-mark-gradient)" filter="url(#brand-mark-shadow)" />
      <circle cx="32" cy="32" r="23" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2" />

      <rect x="18" y="19" width="28" height="28" rx="7" fill="#FFFFFF" fillOpacity="0.94" />
      <path d="M24 17v7M40 17v7" stroke="#6F5CE8" strokeWidth="4" strokeLinecap="round" />
      <path d="M20 29h24" stroke="#6F5CE8" strokeWidth="3" strokeLinecap="round" opacity="0.24" />
      <path
        d="m25 37 5 5 10-12"
        fill="none"
        stroke="#6F5CE8"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
