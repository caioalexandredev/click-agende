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
          <stop stopColor="#7C3AED" />
          <stop offset="0.55" stopColor="#C026D3" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
        <filter id="brand-mark-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#4C1D95" floodOpacity="0.28" />
        </filter>
      </defs>

      <circle cx="32" cy="32" r="28" fill="url(#brand-mark-gradient)" filter="url(#brand-mark-shadow)" />
      <circle cx="32" cy="32" r="23" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2" />

      <rect x="18" y="19" width="28" height="28" rx="7" fill="#FFFFFF" fillOpacity="0.96" />
      <path d="M24 17v7M40 17v7" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
      <path d="M20 29h24" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" opacity="0.28" />
      <path
        d="m25 37 5 5 10-12"
        fill="none"
        stroke="#7C3AED"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
