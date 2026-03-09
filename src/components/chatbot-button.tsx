"use client";

type ChatbotButtonProps = {
  isOpen: boolean;
  onClick: () => void;
  isMainPage?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

const ChatbotButton = ({ isOpen, onClick, isMainPage, ref }: ChatbotButtonProps) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-label={isOpen ? "채팅 닫기" : "Deep Thought에게 질문하기"}
      className={`fixed right-6 z-[60] flex items-center justify-center gap-2 w-14 h-14 md:w-auto md:h-auto rounded-full border border-accent/20 bg-bg-elevated/90 md:px-4 md:py-3 text-text-primary backdrop-blur-sm transition-all duration-200 hover:border-accent/40 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none ${isMainPage ? "bottom-6" : "bottom-24"}`}
      style={{
        marginBottom: "var(--safe-bottom)",
        boxShadow: "0 0 20px rgba(245,158,11,0.25), 0 0 40px rgba(245,158,11,0.1)",
      }}
    >
      <span className="font-display text-sm font-bold text-accent animate-cursor-blink">&gt;</span>
      <span className="hidden md:inline font-display text-sm font-semibold tracking-wider text-accent">
        Deep Thought
      </span>
    </button>
  );
};

export default ChatbotButton;
