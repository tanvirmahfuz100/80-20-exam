export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  ...props
}) {
  const paddings = {
    sm: 'p-3',
    md: 'p-4 md:p-5',
    lg: 'p-5 md:p-8',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-surface border rounded-2xl ${paddings[padding] || paddings.md} ${hover ? 'hover:border-primary/40 transition-all cursor-pointer' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
