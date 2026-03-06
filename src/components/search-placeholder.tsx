"use client";

const SearchPlaceholder = () => {
  return (
    <div
      className="mt-4"
      style={{ animation: "fade-in 0.5s ease-out 0.3s both" }}
    >
      <input
        type="text"
        placeholder="Search posts..."
        readOnly
        className="w-72 md:w-96 h-10 rounded-full bg-white/5 border border-white/10 px-4 text-zinc-500 text-sm cursor-default outline-none"
      />
    </div>
  );
};

export default SearchPlaceholder;
