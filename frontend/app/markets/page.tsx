'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { StatCard } from '@/components/StatCard';
import { CategoryPill } from '@/components/CategoryPill';
import { CompanyTable } from '@/components/CompanyTable';
import { PortfolioSidebar } from '@/components/PortfolioSidebar';
import { Input } from '@/components/ui/input';
import { marketStats } from '@/lib/mock-data';
import { api, transformCompany } from '@/lib/api';
import { Category } from '@/lib/types';
import { TrendingUp, BarChart3, Users, Landmark, Search, Loader2 } from 'lucide-react';

const categories: (Category | 'All')[] = ['All', 'AI', 'Fintech', 'Enterprise', 'Space', 'Consumer', 'Crypto', 'Health'];

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function Markets() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
    const [page, setPage] = useState(1);

    // Fetch data from API
    const { data: apiData, isLoading, error } = useQuery({
        queryKey: ['companies', activeCategory, page], // Add page to key
        queryFn: async () => {
            const response = await api.getCompanies(page, activeCategory === 'All' ? undefined : activeCategory);
            return response;
        }
    });

    const filtered = useMemo(() => {
        if (!apiData?.items) return [];

        let items = apiData.items.map(transformCompany);

        if (search) {
            items = items.filter(c =>
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.ticker.toLowerCase().includes(search.toLowerCase())
            );
        }

        return items;
    }, [apiData, search]);

    const totalPages = apiData?.pages || 1;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard title="Total Volume" value={marketStats.totalVolume} change={marketStats.totalVolumeChange} icon={<TrendingUp className="h-4 w-4" />} />
                    <StatCard title="Active Markets" value={String(marketStats.activeMarkets)} change={marketStats.activeMarketsChange} icon={<BarChart3 className="h-4 w-4" />} />
                    <StatCard title="Total Traders" value={marketStats.totalTraders} change={marketStats.totalTradersChange} icon={<Users className="h-4 w-4" />} />
                    <StatCard title="TVL" value={marketStats.tvl} change={marketStats.tvlChange} icon={<Landmark className="h-4 w-4" />} />
                </div>

                <div className="mt-6 flex flex-col gap-6 lg:flex-row">
                    {/* Main content */}
                    <div className="flex-1 space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search markets... ⌘K"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Category pills */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <CategoryPill key={cat} category={cat} active={activeCategory === cat} onClick={() => { setActiveCategory(cat); setPage(1); }} />
                            ))}
                        </div>

                        {/* Table */}
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground mr-2" />
                                <span className="text-muted-foreground">Loading markets data...</span>
                            </div>
                        ) : (
                            <CompanyTable companies={filtered} />
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
                                <div className="text-sm text-muted-foreground">
                                    {(page - 1) * 24 + 1}-{Math.min(page * 24, apiData?.total || 0)} of {apiData?.total?.toLocaleString()}
                                </div>
                                <Pagination className="mx-0 w-auto">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (page > 1) setPage(p => p - 1);
                                                }}
                                                aria-disabled={page <= 1}
                                                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {/* Page numbers logic */}
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Center the current page
                                            let p = i + 1;
                                            if (totalPages > 5) {
                                                if (page > 3) {
                                                    p = page - 2 + i;
                                                }
                                                if (p > totalPages) {
                                                    p = totalPages - 4 + i;
                                                }
                                                // Adjust if we are near the end
                                                if (page > totalPages - 2) {
                                                    p = totalPages - 4 + i;
                                                }
                                            }

                                            if (p <= 0 || p > totalPages) return null;

                                            return (
                                                <PaginationItem key={p}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={page === p}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setPage(p);
                                                        }}
                                                    >
                                                        {p}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        })}

                                        {totalPages > 5 && page < totalPages - 2 && (
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        )}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (page < totalPages) setPage(p => p + 1);
                                                }}
                                                aria-disabled={page >= totalPages}
                                                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-80">
                        <PortfolioSidebar />
                    </div>
                </div>
            </main>
        </div>
    );
}
