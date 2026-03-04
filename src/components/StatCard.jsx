export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue
}) {
  return <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          {trend && trendValue && <p className={`text-sm mt-2 font-medium ${trend === 'up' ? 'text-easy' : trend === 'down' ? 'text-error' : 'text-muted-foreground'}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>}
        </div>
        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </div>;
}