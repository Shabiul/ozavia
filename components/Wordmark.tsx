// OZAVIA wordmark: serif capitals with a leaf inside the O.
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display inline-flex items-baseline tracking-[0.04em] ${className}`} aria-label="Ozavia">
      <span className="relative inline-block" aria-hidden>
        O
        <svg viewBox="0 0 24 24" className="absolute left-1/2 top-[54%] w-[34%] -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <path d="M5 20C5 10 10 4 20 4c0 10-5 15-13 15" />
          <path d="M5 20c3-6 7-10 12-13" />
        </svg>
      </span>
      <span aria-hidden>ZAVIA</span>
    </span>
  );
}
