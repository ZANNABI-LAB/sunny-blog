import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

const getPageUrl = (basePath: string, page: number): string => {
  const url = new URL(basePath, "http://placeholder");
  url.searchParams.set("page", String(page));
  return `${url.pathname}${url.search}`;
};

const getPageNumbers = (
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
};

const baseClass =
  "min-w-[44px] min-h-[44px] flex items-center justify-center font-display text-sm tracking-wider rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none";

const Pagination = ({ currentPage, totalPages, basePath }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="페이지 네비게이션"
      className="mt-12 flex items-center justify-center gap-1 animate-stagger-in"
    >
      {/* Prev arrow */}
      {hasPrev ? (
        <Link
          href={getPageUrl(basePath, currentPage - 1)}
          aria-label="이전 페이지"
          className={`${baseClass} text-text-secondary hover:text-text-primary hover:bg-card-hover font-display text-xs tracking-widest`}
        >
          &lt;&lt;
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={`${baseClass} text-text-muted/30 cursor-not-allowed pointer-events-none font-display text-xs tracking-widest`}
        >
          &lt;&lt;
        </span>
      )}

      {/* Mobile: compact display */}
      <span className="flex md:hidden font-display text-sm text-text-secondary tracking-wider min-w-[44px] min-h-[44px] items-center justify-center">
        {currentPage} / {totalPages}
      </span>

      {/* Desktop: full page numbers */}
      <div className="hidden md:flex items-center gap-1">
        {pageNumbers.map((item, idx) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${idx}`}
                aria-hidden="true"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted text-sm select-none"
              >
                ...
              </span>
            );
          }

          const isCurrent = item === currentPage;

          return (
            <Link
              key={item}
              href={getPageUrl(basePath, item)}
              aria-current={isCurrent ? "page" : undefined}
              className={`${baseClass} ${
                isCurrent
                  ? "bg-amber-500/15 text-accent font-bold border border-amber-500/30"
                  : "text-text-secondary hover:text-text-primary hover:bg-card-hover"
              }`}
            >
              {item}
            </Link>
          );
        })}
      </div>

      {/* Next arrow */}
      {hasNext ? (
        <Link
          href={getPageUrl(basePath, currentPage + 1)}
          aria-label="다음 페이지"
          className={`${baseClass} text-text-secondary hover:text-text-primary hover:bg-card-hover font-display text-xs tracking-widest`}
        >
          &gt;&gt;
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={`${baseClass} text-text-muted/30 cursor-not-allowed pointer-events-none font-display text-xs tracking-widest`}
        >
          &gt;&gt;
        </span>
      )}
    </nav>
  );
};

export default Pagination;
