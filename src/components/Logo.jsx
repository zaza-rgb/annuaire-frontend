// Logo AfroPonte : une « ponte » (pont) entre deux rives
export default function Logo({ size = 38 }) {
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="14" fill="#54283f" />
      <path
        d="M9 33 C14 12 34 12 39 33"
        fill="none"
        stroke="#d9a441"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M15 33V21.4M24 33V17.5M33 33V21.4" stroke="#f9ebd7" strokeWidth="1.6" opacity="0.65" />
      <path d="M7 33.5H41" stroke="#f9ebd7" strokeWidth="3" strokeLinecap="round" />
      <circle cx="9" cy="33" r="3.6" fill="#c96e4b" />
      <circle cx="39" cy="33" r="3.6" fill="#6fae85" />
    </svg>
  );
}
