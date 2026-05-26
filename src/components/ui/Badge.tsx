const colorMap = {
  primary: 'bg-primary/10 border-primary/20 text-primary',
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  danger: 'bg-red-500/10 border-red-500/20 text-red-400',
  default: 'bg-surface-alt border text-text-dim',
};

export default function Badge({
  children,
  color = 'default',
  className = '',
  size = 'sm',
  ...props
}) {
  const sizes = {
    sm: 'text-[8px] px-2 py-0.5',
    md: 'text-[10px] px-2.5 py-1',
  };

  return (
    <span
      className={`font-black rounded-full uppercase border ${sizes[size]} ${colorMap[color] || colorMap.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
