export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-control bg-line/70 motion-reduce:animate-none ${className}`}
    />
  );
}
