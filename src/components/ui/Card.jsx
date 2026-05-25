export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  ...props
}) {
  const paddings = {
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-5 md:p-10',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-white/5 rounded-2xl md:rounded-3xl shadow-lg ${paddings[padding] || paddings.md} ${hover ? 'hover:border-white/20 transition-all cursor-pointer' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
