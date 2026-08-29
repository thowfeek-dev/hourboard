export function ColorOrbs() {
  return (
    <div aria-hidden className="pointer-events-none dark:hidden">
      <span className="orb" style={{ width: 280, height: 280, left: "-4%", top: "-6%", background: "#6366f1" }} />
      <span className="orb" style={{ width: 240, height: 240, right: "-3%", top: "18%", background: "#22d3ee", animationDelay: "-4s" }} />
      <span className="orb" style={{ width: 260, height: 260, left: "18%", bottom: "-8%", background: "#34d399", animationDelay: "-8s" }} />
      <span className="orb" style={{ width: 200, height: 200, right: "12%", bottom: "6%", background: "#f59e0b", animationDelay: "-11s" }} />
    </div>
  );
}

export function HeroArt() {
  return (
    <svg viewBox="0 0 360 220" className="h-44 w-auto float" role="img" aria-label="Colorful hour tracking illustration">
      <defs>
        <linearGradient id="sky" x1="0" x2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect x="12" y="18" width="336" height="184" rx="28" fill="url(#sky)" opacity="0.18" />
      <circle cx="72" cy="70" r="34" fill="#6366f1" className="pulse-soft" />
      <circle cx="72" cy="70" r="18" fill="#fff" />
      <path d="M72 58v12h10" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <rect x="128" y="48" width="22" height="92" rx="8" fill="#22d3ee" />
      <rect x="158" y="72" width="22" height="68" rx="8" fill="#34d399" />
      <rect x="188" y="36" width="22" height="104" rx="8" fill="#f59e0b" />
      <rect x="218" y="58" width="22" height="82" rx="8" fill="#ec4899" />
      <circle cx="290" cy="78" r="36" fill="#fbbf24" />
      <circle cx="278" cy="70" r="6" fill="#0f172a" />
      <circle cx="302" cy="70" r="6" fill="#0f172a" />
      <path d="M276 92c8 10 22 10 30 0" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
      <rect x="48" y="156" width="264" height="18" rx="9" fill="#fff" opacity="0.7" />
      <rect x="48" y="156" width="176" height="18" rx="9" fill="#4f46e5" />
      <text x="180" y="34" textAnchor="middle" fontSize="14" fill="#4f46e5" fontWeight="700">8h 🚀</text>
    </svg>
  );
}
