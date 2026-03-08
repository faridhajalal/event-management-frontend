function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  gradient = false 
}) {
  return (
    <div 
      className={`
        backdrop-blur-lg bg-white/30 
        border border-white/20 
        rounded-2xl shadow-xl 
        p-6
        ${hover ? 'hover:shadow-2xl hover:scale-105 transition-all duration-300' : ''}
        ${gradient ? 'bg-gradient-to-br from-white/40 to-white/20' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default GlassCard;