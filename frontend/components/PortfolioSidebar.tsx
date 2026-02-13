import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { positions } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function PortfolioSidebar() {
  return (
    <div className="space-y-6">
      <Card className="rounded-xl border border-border p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
        <p className="mt-1 text-2xl font-semibold text-card-foreground">$79,955</p>
        <p className="mt-1 text-sm font-medium text-success">+$4,230 (+5.59%)</p>
      </Card>

      <Card className="rounded-xl border border-border shadow-sm">
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="w-full rounded-t-xl rounded-b-none border-b border-border bg-card">
            <TabsTrigger value="positions" className="flex-1 text-xs">Positions</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 text-xs">Orders</TabsTrigger>
            <TabsTrigger value="history" className="flex-1 text-xs">History</TabsTrigger>
          </TabsList>
          <TabsContent value="positions" className="p-4">
            <div className="space-y-3">
              {positions.map(pos => (
                <div key={pos.ticker} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{pos.company}</p>
                    <p className="text-xs text-muted-foreground">{pos.shares} shares</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-card-foreground">{pos.value}</p>
                    <p className={cn('text-xs font-medium', pos.change >= 0 ? 'text-success' : 'text-danger')}>
                      {pos.change >= 0 ? '+' : ''}{pos.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="orders" className="p-4">
            <p className="text-sm text-muted-foreground">No open orders</p>
          </TabsContent>
          <TabsContent value="history" className="p-4">
            <p className="text-sm text-muted-foreground">No recent history</p>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
