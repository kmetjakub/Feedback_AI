export default function Bracket({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#e8392a]" />
      <span className="pointer-events-none absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-[#e8392a]" />
      <span className="pointer-events-none absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-[#e8392a]" />
      <span className="pointer-events-none absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-[#e8392a]" />
      {children}
    </div>
  );
}
