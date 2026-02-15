'use client';

import { useState, Fragment } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { companies, getOrdersForCompany, getFundingForCompany, getInvestorsForCompany, getLeadershipForCompany, getNewsForCompany } from '@/lib/mock-data';
import { Navbar } from '@/components/Navbar';
import { SectorTag } from '@/components/CategoryPill';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Star, Phone, ChevronRight, ChevronDown, TrendingUp, TrendingDown, Building2, MapPin, Users, Briefcase, DollarSign, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function Deal() {
    const params = useParams();
    const slug = params.slug as string;

    // State for expanded rows
    const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set());

    const toggleRound = (round: string) => {
        const newExpanded = new Set(expandedRounds);
        if (newExpanded.has(round)) {
            newExpanded.delete(round);
        } else {
            newExpanded.add(round);
        }
        setExpandedRounds(newExpanded);
    };

    const { data: company, isLoading, error } = useQuery({
        queryKey: ['company', slug],
        queryFn: () => api.getCompanyDetail(slug),
        retry: 1
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading company details...</p>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="max-w-md p-8 text-center">
                    <h1 className="text-2xl font-bold">Company Not Found</h1>
                    <p className="mt-2 text-muted-foreground">The company you're looking for doesn't exist.</p>
                    <Link href="/markets">
                        <Button className="mt-4">Back to Markets</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    // Parse numeric values from string with fallback
    const price = parseFloat(company.price.replace(/[^0-9.]/g, '')) || 0;
    const change24h = parseFloat(company.price_change_pct.replace(/[^0-9.-]/g, '')) || 0;
    const isPositive = change24h >= 0;

    // Use mock data for orders as they are not yet in API
    const allOrders = getOrdersForCompany(slug);
    const bidOrders = allOrders.filter(o => o.type === 'bid');
    const offerOrders = allOrders.filter(o => o.type === 'offer');

    // Use API data
    const rounds = company.funding_history.map(f => ({
        date: f.date,
        round: f.round_label,
        amount: f.amount_raised,
        valuation: f.valuation,
        investors: f.investors.length > 0 ? f.investors.join(', ') : 'Undisclosed',
        // Detailed metrics
        pricePerShare: f.price_per_share,
        sharesOutstanding: f.shares_outstanding,
        liquidationPreferenceOrder: f.liquidation_preference_order,
        liquidationPreferenceMultiple: f.liquidation_preference_multiple,
        conversionRatio: f.conversion_ratio,
        dividendRate: f.dividend_rate,
        participationCap: f.participation_cap
    }));

    // Map API investors to UI format
    const investors = company.investors.map(name => ({
        name,
        type: 'Venture' as const // Default type as API doesn't provide it yet
    }));

    // Map API leadership
    const leadership = company.key_people.map(p => ({
        name: p.name,
        title: p.role
    }));

    // Map API news (if available, else mock)
    const news = getNewsForCompany(slug);

    // Filter similar companies from mock data as fallback for now
    const knownCategories = ['AI', 'Fintech', 'Enterprise', 'Space', 'Consumer', 'Crypto', 'Health'];
    const sectorMatch = knownCategories.find(c => company.sector.includes(c)) || 'Enterprise';

    const similar = companies.filter(c => c.sector === sectorMatch && c.slug !== company.slug).slice(0, 4);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/markets" className="hover:text-foreground">Markets</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">{company.name}</span>
                </div>

                {/* Hero */}
                <Card className="mb-6 rounded-xl border border-border p-6 shadow-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                            {company.logo_url ? (
                                <img
                                    src={company.logo_url}
                                    alt={company.name}
                                    className="h-16 w-16 rounded-xl object-contain bg-white p-1 shadow-sm border border-border/50"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={cn("flex h-16 w-16 items-center justify-center rounded-xl bg-accent text-2xl font-bold text-foreground", company.logo_url ? "hidden" : "")}>
                                {company.ticker.slice(0, 2)}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold text-card-foreground">{company.name}</h1>
                                    <Badge variant="outline" className="uppercase">{company.ticker}</Badge>
                                    <SectorTag sector={sectorMatch as any} />
                                </div>
                                <div className="mt-2 flex items-baseline gap-3">
                                    <span className="text-3xl font-bold text-card-foreground">${price.toFixed(2)}</span>
                                    <span className={cn('flex items-center gap-1 text-sm font-semibold', isPositive ? 'text-success' : 'text-danger')}>
                                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {isPositive ? '+' : ''}{change24h.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline">
                                <Star className="h-4 w-4" />
                                Watchlist
                            </Button>
                            <Button variant="outline">
                                <Phone className="h-4 w-4" />
                                Specialist
                            </Button>
                            <Button className="bg-success hover:bg-success/90">Buy</Button>
                            <Button variant="destructive">Sell</Button>
                        </div>
                    </div>
                </Card>

                {/* Orders section removed as requested */}

                <Separator className="my-6" />

                {/* Tabs */}
                <Tabs defaultValue="funding">
                    <TabsList className="mb-4">
                        <TabsTrigger value="funding">Funding History</TabsTrigger>
                        <TabsTrigger value="details">Company Details</TabsTrigger>
                        <TabsTrigger value="investors">Investors</TabsTrigger>
                        <TabsTrigger value="leadership">Leadership</TabsTrigger>
                        <TabsTrigger value="news">News</TabsTrigger>
                        <TabsTrigger value="similar">Similar Companies</TabsTrigger>
                    </TabsList>





                    {/* Funding */}
                    <TabsContent value="funding" className="mt-4">
                        <Card className="overflow-hidden rounded-xl border border-border shadow-sm">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="w-10 px-4 py-3"></th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                                        <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Stage</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Amount</th>
                                        <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground sm:table-cell">Valuation</th>
                                        <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Investors</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rounds.map(f => (
                                        <Fragment key={f.round}>
                                            <tr
                                                className="border-t border-border hover:bg-accent/50 cursor-pointer transition-colors"
                                                onClick={() => toggleRound(f.round)}
                                            >
                                                <td className="px-4 py-4">
                                                    {expandedRounds.has(f.round) ?
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" /> :
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">{f.date}</td>
                                                <td className="px-4 py-4 text-sm"><Badge variant="secondary">{f.round}</Badge></td>
                                                <td className="px-4 py-4 text-right text-sm font-medium text-success">{f.amount}</td>
                                                <td className="hidden px-4 py-4 text-right text-sm text-muted-foreground sm:table-cell">{f.valuation}</td>
                                                <td className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
                                                    <div className="line-clamp-1 text-muted-foreground">
                                                        {f.investors}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRounds.has(f.round) && (
                                                <tr className="bg-white border-t border-border border-b">
                                                    <td colSpan={6} className="p-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">

                                                            {/* Column 1: Share Info */}
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Price Per Share</div>
                                                                    <div className="text-sm font-medium">{f.pricePerShare || '--'}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Shares Outstanding</div>
                                                                    <div className="text-sm font-medium">{f.sharesOutstanding || '--'}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Conversion Ratio</div>
                                                                    <div className="text-sm font-medium">{f.conversionRatio || '--'}</div>
                                                                </div>
                                                            </div>

                                                            {/* Column 2: Liquidation */}
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Liq. Pref. Order</div>
                                                                    <div className="text-sm font-medium">{f.liquidationPreferenceOrder || '--'}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Liq. Pref. Multiple</div>
                                                                    <div className="text-sm font-medium">{f.liquidationPreferenceMultiple || '--'}</div>
                                                                </div>
                                                            </div>

                                                            {/* Column 3: Dividends & Participation */}
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Dividend Rate</div>
                                                                    <div className="text-sm font-medium">{f.dividendRate || '--'}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Participation Cap</div>
                                                                    <div className="text-sm font-medium">{f.participationCap || '--'}</div>
                                                                </div>
                                                            </div>

                                                            {/* Column 4: Key Investors (Active) */}
                                                            <div className="md:col-span-1">
                                                                <div className="text-xs font-medium text-muted-foreground uppercase mb-2">Key Investors</div>
                                                                <div className="text-sm leading-relaxed text-foreground">
                                                                    {f.investors}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </TabsContent>

                    {/* Company Details */}
                    <TabsContent value="details" className="mt-4 space-y-6">
                        <Card className="rounded-xl border border-border p-6 shadow-sm">
                            <p className="text-sm leading-relaxed text-muted-foreground">{company.description}</p>
                        </Card>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailCard icon={<Building2 className="h-4 w-4" />} label="Founded" value={company.founded} />
                            <DetailCard icon={<MapPin className="h-4 w-4" />} label="Headquarters" value={company.headquarters} />
                            <DetailCard icon={<Users className="h-4 w-4" />} label="Employees" value={company.employees} />
                            <DetailCard icon={<Briefcase className="h-4 w-4" />} label="Sector" value={sectorMatch} />
                            <DetailCard icon={<DollarSign className="h-4 w-4" />} label="Last Funding" value={company.funding_history?.[0]?.round_label || 'N/A'} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <MetricCard label="Market Cap" value={company.valuation} />
                            <MetricCard label="Last Valuation" value={company.valuation} />
                            <MetricCard label="24h Volume" value="--" />
                        </div>
                    </TabsContent>

                    {/* Investors */}
                    <TabsContent value="investors" className="mt-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {investors.map(inv => (
                                <Card key={inv.name} className="flex items-center gap-3 rounded-xl border border-border p-4 shadow-sm">
                                    <Avatar>
                                        <AvatarFallback className="bg-accent text-sm font-semibold text-foreground">
                                            {inv.name.split(' ').map(w => w[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-card-foreground">{inv.name}</p>
                                        <Badge variant="secondary" className="mt-1 text-xs">{inv.type}</Badge>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Leadership */}
                    <TabsContent value="leadership" className="mt-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {leadership.map(l => (
                                <Card key={l.name} className="flex items-center gap-3 rounded-xl border border-border p-4 shadow-sm">
                                    <Avatar>
                                        <AvatarFallback className="bg-accent text-sm font-semibold text-foreground">
                                            {l.name.split(' ').map(w => w[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-card-foreground">{l.name}</p>
                                        <p className="text-xs text-muted-foreground">{l.title}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* News */}
                    <TabsContent value="news" className="mt-4">
                        <div className="space-y-3">
                            {news.map((n, i) => (
                                <Card key={i} className="flex items-center justify-between rounded-xl border border-border p-4 shadow-sm">
                                    <div>
                                        <p className="text-sm font-medium text-card-foreground">{n.headline}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{n.source} · {n.date}</p>
                                    </div>
                                    <a href={n.url} className="text-muted-foreground hover:text-foreground">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Similar */}
                    <TabsContent value="similar" className="mt-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {similar.map(c => (
                                <Link key={c.slug} href={`/deal/${c.slug}`}>
                                    <Card className="rounded-xl border border-border p-4 shadow-sm transition-shadow hover:shadow-md">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-xs font-bold text-foreground">
                                                {c.ticker.slice(0, 2)}
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium text-card-foreground">{c.name}</p>
                                                <SectorTag sector={c.sector} />
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-sm font-medium text-card-foreground">${c.price.toFixed(2)}</span>
                                            <span className={cn('text-xs font-medium', c.change24h >= 0 ? 'text-success' : 'text-danger')}>
                                                {c.change24h >= 0 ? '+' : ''}{c.change24h.toFixed(2)}%
                                            </span>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

function OrderTable({ title, orders, variant }: { title: string; orders: any[]; variant: 'bid' | 'offer' }) {
    return (
        <Card className="overflow-hidden rounded-xl border border-border shadow-sm">
            <div className="border-b border-border px-6 py-3">
                <h3 className={cn('text-sm font-semibold', variant === 'bid' ? 'text-success' : 'text-danger')}>{title}</h3>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">Volume</th>
                        <th className="hidden px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground sm:table-cell">Structure</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                            <td className="px-4 py-3 text-sm text-card-foreground">{o.date}</td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">${o.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-sm text-muted-foreground">{o.volume}</td>
                            <td className="hidden px-4 py-3 sm:table-cell"><Badge variant="secondary" className="text-xs">{o.structure}</Badge></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <Card className="flex items-center gap-3 rounded-xl border border-border p-4 shadow-sm">
            <div className="rounded-lg bg-accent p-2 text-muted-foreground">{icon}</div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-card-foreground">{value}</p>
            </div>
        </Card>
    );
}

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <Card className="rounded-xl border border-border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold text-card-foreground">{value}</p>
        </Card>
    );
}
