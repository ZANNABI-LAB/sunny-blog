"use client";

type ChatbotButtonProps = {
  isOpen: boolean;
  onClick: () => void;
  ref?: React.Ref<HTMLButtonElement>;
};

const DeepThoughtIcon = () => (
  <span
    className="font-display text-2xl font-bold text-amber-400 select-none"
    style={{ textShadow: "0 0 12px rgba(245,158,11,0.5)" }}
  >
    42
  </span>
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
      aria-label={isOpen ? "채팅 닫기" : "Deep Thought에게 질문하기"}
      className="fixed bottom-20 right-6 z-[60] flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/20 bg-zinc-900/90 text-white shadow-lg shadow-amber-500/10 backdrop-blur-sm transition-all duration-200 hover:border-amber-400/40 hover:shadow-amber-500/20"
      style={{ filter: "drop-shadow(0 0 12px rgba(245,158,11,0.2))" }}
    >
      {isOpen ? <CloseIcon /> : <DeepThoughtIcon />}
    </button>
  );
};

export default ChatbotButton;
