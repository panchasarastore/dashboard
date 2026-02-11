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
    default: 'hover:border-muted-foreground/20',
    primary: 'bg-primary/5 border-primary/20 hover:border-primary/40',
    success: 'bg-green-500/5 border-green-500/20 hover:border-green-500/40',
    warning: 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40',
  };

  const iconStyles = {
    default: 'bg-muted text-muted-foreground border-muted-foreground/10',
    primary: 'bg-primary/20 text-primary border-primary/20',
    success: 'bg-green-500/20 text-green-600 border-green-500/20',
    warning: 'bg-amber-500/20 text-amber-600 border-amber-500/20',
  };

  return (
    <div className={`stat-card relative overflow-hidden group ${variantStyles[variant]} animate-fade-in`}>
      {/* Background Glow Effect */}
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 
        ${variant === 'primary' ? 'bg-primary' : variant === 'success' ? 'bg-green-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-muted-foreground'}`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">{value}</p>
          </div>

          {subtitle && (
            <p className="text-[10px] md:text-xs text-muted-foreground/70 mt-1 font-medium">{subtitle}</p>
          )}

          {trend && (
            <div className={`flex items-center gap-1.5 mt-3 text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className={`px-1.5 py-0.5 rounded-md ${trend.isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="text-muted-foreground font-normal">vs last month</span>
            </div>
          )}
        </div>

        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border ${iconStyles[variant]} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
