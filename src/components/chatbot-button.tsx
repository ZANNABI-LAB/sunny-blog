"use client";

type ChatbotButtonProps = {
  isOpen: boolean;
  onClick: () => void;
  ref?: React.Ref<HTMLButtonElement>;
};

const R2D2Icon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
    viewBox="0 0 64 64"
    fill="none"
  >
    {/* Head dome */}
    <path
      d="M16 28C16 17.5 23.2 10 32 10C40.8 10 48 17.5 48 28H16Z"
      fill="#C0C8D8"
      stroke="#8090A8"
      strokeWidth="1.5"
    />
    {/* Main eye / lens */}
    <circle cx="32" cy="21" r="5" fill="#1a1a2e" stroke="#6366f1" strokeWidth="1.5" />
    <circle cx="32" cy="21" r="2.5" fill="#6366f1" opacity="0.8" />
    <circle cx="33.5" cy="19.5" r="1" fill="white" opacity="0.6" />
    {/* Side detail - left */}
    <rect x="19" y="18" width="4" height="3" rx="1" fill="#4f6480" />
    {/* Side detail - right */}
    <rect x="41" y="18" width="4" height="3" rx="1" fill="#4f6480" />
    {/* Body */}
    <rect x="16" y="28" width="32" height="22" rx="3" fill="#E8ECF2" stroke="#8090A8" strokeWidth="1.5" />
    {/* Body center panel */}
    <rect x="24" y="31" width="16" height="16" rx="2" fill="#6366f1" opacity="0.15" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.4" />
    {/* Body details */}
    <rect x="27" y="34" width="10" height="2" rx="1" fill="#6366f1" opacity="0.5" />
    <rect x="27" y="38" width="6" height="2" rx="1" fill="#818cf8" opacity="0.4" />
    <circle cx="37" cy="43" r="2" fill="#6366f1" opacity="0.3" />
    <circle cx="27" cy="43" r="1.5" fill="#f87171" opacity="0.5" />
    {/* Legs */}
    <rect x="12" y="42" width="6" height="14" rx="2" fill="#C0C8D8" stroke="#8090A8" strokeWidth="1.5" />
    <rect x="46" y="42" width="6" height="14" rx="2" fill="#C0C8D8" stroke="#8090A8" strokeWidth="1.5" />
    {/* Center leg */}
    <rect x="28" y="50" width="8" height="8" rx="2" fill="#D0D8E8" stroke="#8090A8" strokeWidth="1.5" />
    {/* Feet */}
    <rect x="10" y="54" width="10" height="4" rx="1.5" fill="#A0AEC0" />
    <rect x="44" y="54" width="10" height="4" rx="1.5" fill="#A0AEC0" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChatbotButton = ({ isOpen, onClick, ref }: ChatbotButtonProps) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-label={isOpen ? "채팅 닫기" : "채팅 열기"}
      className="fixed bottom-20 right-6 z-[60] flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-white shadow-lg shadow-indigo-500/20 backdrop-blur-sm transition-all duration-200 hover:border-indigo-400/30 hover:shadow-indigo-500/40"
      style={{ filter: "drop-shadow(0 0 12px rgba(99,102,241,0.3))" }}
    >
      {isOpen ? <CloseIcon /> : <R2D2Icon />}
    </button>
  );
};

export default ChatbotButton;
