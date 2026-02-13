import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { SparklinePoint } from '@/lib/types';

interface SparklineChartProps {
  data: SparklinePoint[];
  positive: boolean;
}

export function SparklineChart({ data, positive }: SparklineChartProps) {
  const color = positive ? 'hsl(142.1, 76.2%, 36.3%)' : 'hsl(0, 72.2%, 50.6%)';

  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${positive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#gradient-${positive ? 'up' : 'down'})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
