const variants = {
  primary: 'bg-primary hover:bg-primary-hover text-white',
  secondary: 'bg-surface-alt hover:bg-surface-hover text-text border border-wolf',
  danger: 'bg-cardinal hover:bg-cardinal-dark text-white',
  ghost: 'bg-transparent hover:bg-surface-alt text-text-muted',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
};

const sizes = {
  sm: 'py-1.5 px-3 text-[10px]',
  md: 'py-2.5 px-5 text-xs',
  lg: 'py-3 px-6 text-sm',
  xl: 'py-3.5 px-8 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} shadow-sm ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
