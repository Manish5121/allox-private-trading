import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SparklineChart } from './SparklineChart';
import { SectorTag } from '@/components/CategoryPill';
import { Company } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Eye, Zap } from 'lucide-react';

interface CompanyTableProps {
  companies: Company[];
}

export function CompanyTable({ companies }: CompanyTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      {/* Desktop table */}
      <table className="hidden w-full sm:table">
        <thead>
          <tr className="border-b border-border">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Asset</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Chart</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">24h %</th>
            <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">Amount Raised</th>
            <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground xl:table-cell">Market Cap</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(company => (
            <tr key={company.slug} className="border-b border-border transition-colors last:border-0 hover:bg-accent/50">
              <td className="px-6 py-4">
                <Link href={`/deal/${company.slug}`} className="flex items-center gap-3 hover:opacity-80">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="h-9 w-9 rounded-lg object-contain bg-white p-0.5"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-xs font-bold text-foreground",
                    company.logoUrl ? "hidden" : ""
                  )}>
                    {company.ticker.slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground hover:underline">{company.name}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{company.ticker}</span>
                      <SectorTag sector={company.sector} />
                    </div>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-4">
                <SparklineChart data={company.sparkline} positive={company.change24h >= 0} />
              </td>
              <td className="px-4 py-4 text-right text-sm font-medium text-card-foreground">
                ${company.price.toFixed(2)}
              </td>
              <td className={cn('px-4 py-4 text-right text-sm font-medium', company.change24h >= 0 ? 'text-success' : 'text-danger')}>
                {company.change24h >= 0 ? '+' : ''}{company.change24h.toFixed(2)}%
              </td>
              <td className="hidden px-4 py-4 text-right text-sm text-muted-foreground lg:table-cell">
                {company.amountRaised}
              </td>
              <td className="hidden px-4 py-4 text-right text-sm text-muted-foreground xl:table-cell">
                {company.marketCap}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/deal/${company.slug}`}>
                      <Eye className="mr-1 h-3 w-3" /> View
                    </Link>
                  </Button>
                  <Button size="sm" className="gap-1">
                    <Zap className="h-3 w-3" /> Trade
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile list */}
      <div className="divide-y divide-border sm:hidden">
        {companies.map(company => (
          <Link
            key={company.slug}
            href={`/deal/${company.slug}`}
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-3">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-8 w-8 rounded-lg object-contain bg-white p-0.5"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-xs font-bold text-foreground",
                company.logoUrl ? "hidden" : ""
              )}>
                {company.ticker.slice(0, 2)}
              </span>
              <div>
                <p className="text-sm font-medium text-card-foreground">{company.name}</p>
                <span className="text-xs text-muted-foreground">{company.ticker}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-card-foreground">${company.price.toFixed(2)}</p>
              <p className={cn('text-xs font-medium', company.change24h >= 0 ? 'text-success' : 'text-danger')}>
                {company.change24h >= 0 ? '+' : ''}{company.change24h.toFixed(2)}%
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
