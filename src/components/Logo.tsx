export default function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cg-arc-grad" x1="20" y1="20" x2="70" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c6cf0" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="cg-arrow-grad" x1="60" y1="50" x2="90" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* C arc – the purple crescent */}
      <path
        d="M75 22
           A42 42 0 1 0 75 98"
        stroke="url(#cg-arc-grad)"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
      {/* G arrow / checkmark – the green inward stroke */}
      <path
        d="M78 60
           L60 60
           L60 90
           L78 90"
        stroke="url(#cg-arrow-grad)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
