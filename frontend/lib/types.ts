export type Category = 'AI' | 'Fintech' | 'Enterprise' | 'Space' | 'Consumer' | 'Crypto' | 'Health';

export interface SparklinePoint {
  value: number;
}

export interface Company {
  slug: string;
  name: string;
  ticker: string;
  logoUrl?: string;
  sector: Category;
  price: number;
  change24h: number;
  amountRaised: string;
  marketCap: string;
  sparkline: SparklinePoint[];
  description: string;
  founded: string;
  headquarters: string;
  employees: string;
  lastFunding: string;
  lastValuation: string;
  volume24h: string;
}

export interface Order {
  id: string;
  date: string;
  price: number;
  volume: string;
  structure: string;
  type: 'bid' | 'offer';
}

export interface FundingRound {
  date: string;
  round: string;
  amount: string;
  valuation: string;
  leadInvestor: string;
}

export interface Investor {
  name: string;
  type: 'Venture' | 'Crossover' | 'Strategic';
}

export interface Leader {
  name: string;
  title: string;
}

export interface NewsItem {
  headline: string;
  source: string;
  date: string;
  url: string;
}

export interface MarketStats {
  totalVolume: string;
  totalVolumeChange: string;
  activeMarkets: number;
  activeMarketsChange: string;
  totalTraders: string;
  totalTradersChange: string;
  tvl: string;
  tvlChange: string;
}

export interface Position {
  company: string;
  ticker: string;
  shares: number;
  value: string;
  change: number;
}
