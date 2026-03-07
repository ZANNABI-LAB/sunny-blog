"use client";

type ChatbotButtonProps = {
  isOpen: boolean;
  onClick: () => void;
  ref?: React.Ref<HTMLButtonElement>;
};

const ChatbotButton = ({ isOpen, onClick, ref }: ChatbotButtonProps) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-label={isOpen ? "채팅 닫기" : "Deep Thought에게 질문하기"}
      className="fixed bottom-24 right-6 z-[60] flex items-center gap-2 rounded-full border border-accent/20 bg-bg-elevated/90 px-4 py-3 text-text-primary shadow-lg shadow-amber-500/10 backdrop-blur-sm transition-all duration-200 hover:border-accent/40 hover:shadow-amber-500/20"
      style={{ marginBottom: "var(--safe-bottom)", filter: "drop-shadow(0 0 12px var(--glow-accent))" }}
    >
      <span className="font-display text-sm font-bold text-accent">&gt;</span>
      <span className="font-display text-sm font-semibold tracking-wider text-accent">
        Deep Thought
      </span>
    </button>
  );
};

export default ChatbotButton;
