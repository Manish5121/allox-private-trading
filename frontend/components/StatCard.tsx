import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

export function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change.startsWith('+');

  return (
    <Card className="rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="rounded-lg bg-accent p-2 text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold text-card-foreground">{value}</p>
        <p className={cn('mt-1 text-sm font-medium', isPositive ? 'text-success' : 'text-danger')}>
          {change}
        </p>
      </div>
    </Card>
  );
}
