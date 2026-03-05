import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) => {
  const variantStyles = {
    default: 'bg-card/40 hover:bg-card/60 border-border/50 hover:border-primary/20',
    primary: 'bg-primary/[0.03] border-primary/10 hover:border-primary/30',
    success: 'bg-green-500/[0.03] border-green-500/10 hover:border-green-500/30',
    warning: 'bg-amber-500/[0.03] border-amber-500/10 hover:border-amber-500/30',
  };

  const iconStyles = {
    default: 'bg-muted/40 text-muted-foreground border-border/50',
    primary: 'bg-primary/20 text-primary border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]',
    success: 'bg-green-500/20 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
    warning: 'bg-amber-500/20 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
  };

  return (
    <div className={`stat-card relative overflow-hidden group backdrop-blur-md transition-all duration-500 ${variantStyles[variant]} animate-fade-in`}>
      {/* Background Glow Effect */}
      <div className={`absolute -right-4 -top-8 w-32 h-32 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 
        ${variant === 'primary' ? 'bg-primary' : variant === 'success' ? 'bg-green-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-muted-foreground'}`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] md:text-xs font-black text-muted-foreground/50 mb-2 uppercase tracking-[0.2em]">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl md:text-3xl font-display font-black text-foreground tracking-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left truncate">
              {value}
            </p>
          </div>

          {trend && (
            <div className={`flex items-center gap-1.5 mt-4 text-[11px] font-black ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${trend.isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="text-muted-foreground/60 font-medium uppercase tracking-tighter">vs last month</span>
            </div>
          )}

          {subtitle && !trend && (
            <p className="text-[10px] md:text-xs text-muted-foreground/60 mt-1.5 font-bold uppercase tracking-wide truncate">{subtitle}</p>
          )}
        </div>

        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border ${iconStyles[variant]} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-[6deg] shadow-xl group-hover:shadow-2xl shrink-0`}>
          <Icon className="w-6 h-6 md:w-7 md:h-7" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
