const variants = {
  primary: 'bg-primary hover:bg-primary-hover text-white',
  secondary: 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10',
  danger: 'bg-yellow-500 hover:bg-yellow-400 text-black',
  ghost: 'bg-transparent hover:bg-white/5 text-white/50',
  success: 'bg-emerald-500 hover:bg-emerald-400 text-black',
};

const sizes = {
  sm: 'py-2 px-3 text-[9px]',
  md: 'py-3 px-4 text-[10px]',
  lg: 'py-3.5 px-5 text-[11px]',
  xl: 'py-4 px-6 text-xs',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  raised = false,
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
      className={`rounded-xl font-black uppercase tracking-widest transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 min-h-touch ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${raised ? 'border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px]' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
