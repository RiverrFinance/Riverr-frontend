import { ChevronsLeft, ChevronsRight } from "lucide-react";

export const Pagination = ({ 
  page, 
  pageCount, 
  onPageChange 
}: { 
  page: number; 
  pageCount: number; 
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 text-base bg-[#16182e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1f2241] transition-colors text-gray-400 hover:text-white"
      >
        <ChevronsLeft />
      </button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-14 h-10 text-base rounded-lg transition-colors font-medium ${
                page === pageNum 
                  ? 'hover:bg-gradient-to-r hover:from-[#140242] hover:to-[#02074c] text-white' 
                  : 'text-gray-400/40 hover:bg-gradient-to-r hover:from-[#1402425b] hover:to-[#02074c59] hover:text-white'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      
      <button
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="px-4 py-2 text-base bg-[#16182e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1f2241] transition-colors text-gray-400 hover:text-white"
      >
        <ChevronsRight />
      </button>
    </div>
  );
};
