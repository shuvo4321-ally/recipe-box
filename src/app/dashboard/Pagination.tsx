// src/app/dashboard/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  // Helper to generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav
      className="mt-12 flex items-center justify-center border-t border-gray-200 pt-8"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Link
          href={currentPage > 1 ? `/dashboard?page=${currentPage - 1}` : "#"}
          className={`inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white h-10 w-10 text-sm font-medium transition-colors ${currentPage > 1
              ? "text-gray-600 hover:bg-gray-50"
              : "text-gray-300 cursor-not-allowed"
            }`}
          aria-disabled={currentPage <= 1}
        >
          <span className="sr-only">Previous</span>
          <ChevronLeft className="h-4 w-4" />
        </Link>

        {/* Page Numbers */}
        {getPageNumbers().map((page) => (
          <Link
            key={page}
            href={`/dashboard?page=${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`inline-flex items-center justify-center rounded-lg h-10 w-10 text-sm font-medium transition-colors ${page === currentPage
                ? "border border-green-600 bg-green-600 text-white font-semibold"
                : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
          >
            {page}
          </Link>
        ))}

        {/* Next Button */}
        <Link
          href={currentPage < totalPages ? `/dashboard?page=${currentPage + 1}` : "#"}
          className={`inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white h-10 w-10 text-sm font-medium transition-colors ${currentPage < totalPages
              ? "text-gray-600 hover:bg-gray-50"
              : "text-gray-300 cursor-not-allowed"
            }`}
          aria-disabled={currentPage >= totalPages}
        >
          <span className="sr-only">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
}