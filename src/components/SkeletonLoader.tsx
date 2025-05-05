export const SkeletonLoader = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#1C1C28] to-[#18191de9] rounded ${className}`} />
);
