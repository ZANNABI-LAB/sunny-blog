"use client";

type ChatbotButtonProps = {
  isOpen: boolean;
  onClick: () => void;
  ref?: React.Ref<HTMLButtonElement>;
};

const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-amber-400"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ChatbotButton = ({ isOpen, onClick, ref }: ChatbotButtonProps) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-label={isOpen ? "채팅 닫기" : "Deep Thought에게 질문하기"}
      className="fixed bottom-20 right-6 z-[60] flex items-center gap-2 rounded-full border border-amber-400/20 bg-zinc-900/90 px-4 py-3 text-white shadow-lg shadow-amber-500/10 backdrop-blur-sm transition-all duration-200 hover:border-amber-400/40 hover:shadow-amber-500/20"
      style={{ filter: "drop-shadow(0 0 12px rgba(245,158,11,0.2))" }}
    >
      <ChatIcon />
      <span className="font-display text-sm font-semibold tracking-wider text-amber-400">
        Deep Thought
      </span>
    </button>
  );
};

export default ChatbotButton;
