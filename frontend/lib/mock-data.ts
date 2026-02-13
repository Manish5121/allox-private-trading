import { Company, Order, FundingRound, Investor, Leader, NewsItem, MarketStats, Position } from './types';

const sparkUp = [{ value: 40 }, { value: 42 }, { value: 38 }, { value: 45 }, { value: 50 }, { value: 48 }, { value: 55 }, { value: 60 }];
const sparkDown = [{ value: 60 }, { value: 55 }, { value: 58 }, { value: 50 }, { value: 45 }, { value: 48 }, { value: 42 }, { value: 38 }];
const sparkFlat = [{ value: 50 }, { value: 52 }, { value: 48 }, { value: 51 }, { value: 49 }, { value: 53 }, { value: 50 }, { value: 52 }];

export const marketStats: MarketStats = {
  totalVolume: '$58.2M',
  totalVolumeChange: '+12.4%',
  activeMarkets: 15,
  activeMarketsChange: '+3',
  totalTraders: '24.8K',
  totalTradersChange: '+890',
  tvl: '$312M',
  tvlChange: '+8.7%',
};

export const companies: Company[] = [
  {
    slug: 'spacex',
    name: 'SpaceX',
    ticker: 'SPACEX',
    sector: 'Space',
    price: 185.50,
    change24h: 3.24,
    amountRaised: '$12.4M',
    marketCap: '$180B',
    sparkline: sparkUp,
    description: 'Space Exploration Technologies Corp. designs, manufactures, and launches advanced rockets and spacecraft.',
    founded: '2002',
    headquarters: 'Hawthorne, CA',
    employees: '13,000+',
    lastFunding: '$750M (Series N)',
    lastValuation: '$180B',
    volume24h: '$12.4M',
  },
  {
    slug: 'openai',
    name: 'OpenAI',
    ticker: 'OPENAI',
    sector: 'AI',
    price: 142.30,
    change24h: 5.67,
    amountRaised: '$8.9M',
    marketCap: '$157B',
    sparkline: sparkUp,
    description: 'OpenAI is an AI research and deployment company dedicated to ensuring artificial general intelligence benefits all of humanity.',
    founded: '2015',
    headquarters: 'San Francisco, CA',
    employees: '3,500+',
    lastFunding: '$6.6B (Series E)',
    lastValuation: '$157B',
    volume24h: '$8.9M',
  },
  {
    slug: 'stripe',
    name: 'Stripe',
    ticker: 'STRIPE',
    sector: 'Fintech',
    price: 78.90,
    change24h: -1.23,
    amountRaised: '$5.6M',
    marketCap: '$65B',
    sparkline: sparkDown,
    description: 'Stripe is a financial infrastructure platform for the internet, building economic infrastructure for businesses of all sizes.',
    founded: '2010',
    headquarters: 'San Francisco, CA',
    employees: '8,000+',
    lastFunding: '$600M (Series I)',
    lastValuation: '$65B',
    volume24h: '$5.6M',
  },
  {
    slug: 'anthropic',
    name: 'Anthropic',
    ticker: 'ANTHR',
    sector: 'AI',
    price: 96.40,
    change24h: 8.12,
    amountRaised: '$7.2M',
    marketCap: '$61.5B',
    sparkline: sparkUp,
    description: 'Anthropic is an AI safety company focused on building reliable, interpretable, and steerable AI systems.',
    founded: '2021',
    headquarters: 'San Francisco, CA',
    employees: '1,500+',
    lastFunding: '$2B (Series D)',
    lastValuation: '$61.5B',
    volume24h: '$7.2M',
  },
  {
    slug: 'databricks',
    name: 'Databricks',
    ticker: 'DBRKX',
    sector: 'Enterprise',
    price: 65.20,
    change24h: 2.45,
    amountRaised: '$4.1M',
    marketCap: '$62B',
    sparkline: sparkUp,
    description: 'Databricks is a unified analytics platform for massive-scale data engineering, data science, and machine learning.',
    founded: '2013',
    headquarters: 'San Francisco, CA',
    employees: '7,000+',
    lastFunding: '$500M (Series I)',
    lastValuation: '$62B',
    volume24h: '$4.1M',
  },
  {
    slug: 'shein',
    name: 'Shein',
    ticker: 'SHEIN',
    sector: 'Consumer',
    price: 45.80,
    change24h: -2.34,
    amountRaised: '$3.8M',
    marketCap: '$45B',
    sparkline: sparkDown,
    description: 'Shein is a global online fashion and lifestyle retailer committed to making trendy fashion accessible.',
    founded: '2008',
    headquarters: 'Singapore',
    employees: '16,000+',
    lastFunding: '$2B (Series F)',
    lastValuation: '$45B',
    volume24h: '$3.8M',
  },
  {
    slug: 'ripple',
    name: 'Ripple',
    ticker: 'XRP',
    sector: 'Crypto',
    price: 32.10,
    change24h: 1.89,
    amountRaised: '$6.7M',
    marketCap: '$11B',
    sparkline: sparkFlat,
    description: 'Ripple provides global financial settlement solutions through blockchain technology.',
    founded: '2012',
    headquarters: 'San Francisco, CA',
    employees: '900+',
    lastFunding: '$200M (Series C)',
    lastValuation: '$11B',
    volume24h: '$6.7M',
  },
  {
    slug: 'tempus',
    name: 'Tempus AI',
    ticker: 'TMPUS',
    sector: 'Health',
    price: 54.30,
    change24h: 4.56,
    amountRaised: '$2.3M',
    marketCap: '$8.1B',
    sparkline: sparkUp,
    description: 'Tempus is a technology company advancing precision medicine through AI and data analytics.',
    founded: '2015',
    headquarters: 'Chicago, IL',
    employees: '2,500+',
    lastFunding: '$275M (Series G)',
    lastValuation: '$8.1B',
    volume24h: '$2.3M',
  },
];

export function getCompanyBySlug(slug: string): Company | undefined {
  return companies.find(c => c.slug === slug);
}

export function getOrdersForCompany(_slug: string): Order[] {
  return [
    { id: '1', date: '2026-02-10', price: 184.00, volume: '$250K', structure: 'Direct', type: 'bid' },
    { id: '2', date: '2026-02-09', price: 182.50, volume: '$500K', structure: 'SPV', type: 'bid' },
    { id: '3', date: '2026-02-08', price: 180.00, volume: '$1M', structure: 'Forward', type: 'bid' },
    { id: '4', date: '2026-02-07', price: 179.00, volume: '$750K', structure: 'Direct', type: 'bid' },
    { id: '5', date: '2026-02-10', price: 188.00, volume: '$300K', structure: 'Direct', type: 'offer' },
    { id: '6', date: '2026-02-09', price: 190.00, volume: '$600K', structure: 'SPV', type: 'offer' },
    { id: '7', date: '2026-02-08', price: 192.50, volume: '$450K', structure: 'Forward', type: 'offer' },
    { id: '8', date: '2026-02-07', price: 195.00, volume: '$800K', structure: 'Direct', type: 'offer' },
  ];
}

export function getFundingForCompany(_slug: string): FundingRound[] {
  return [
    { date: '2024-06-15', round: 'Series N', amount: '$750M', valuation: '$180B', leadInvestor: 'Andreessen Horowitz' },
    { date: '2023-01-20', round: 'Series M', amount: '$500M', valuation: '$137B', leadInvestor: 'Sequoia Capital' },
    { date: '2022-05-10', round: 'Series L', amount: '$250M', valuation: '$127B', leadInvestor: 'Founders Fund' },
    { date: '2021-02-18', round: 'Series K', amount: '$850M', valuation: '$74B', leadInvestor: 'Google' },
  ];
}

export function getInvestorsForCompany(_slug: string): Investor[] {
  return [
    { name: 'Sequoia Capital', type: 'Venture' },
    { name: 'Andreessen Horowitz', type: 'Venture' },
    { name: 'Founders Fund', type: 'Venture' },
    { name: 'Google', type: 'Strategic' },
    { name: 'Fidelity', type: 'Crossover' },
    { name: 'T. Rowe Price', type: 'Crossover' },
  ];
}

export function getLeadershipForCompany(_slug: string): Leader[] {
  return [
    { name: 'Elon Musk', title: 'CEO & CTO' },
    { name: 'Gwynne Shotwell', title: 'President & COO' },
    { name: 'Tom Mueller', title: 'VP of Propulsion' },
    { name: 'Mark Juncosa', title: 'VP of Vehicle Engineering' },
  ];
}

export function getNewsForCompany(_slug: string): NewsItem[] {
  return [
    { headline: 'Starship achieves successful orbital flight milestone', source: 'Reuters', date: '2026-02-10', url: '#' },
    { headline: 'SpaceX raises $750M at $180B valuation', source: 'TechCrunch', date: '2026-02-08', url: '#' },
    { headline: 'Starlink surpasses 5 million subscribers globally', source: 'Bloomberg', date: '2026-02-05', url: '#' },
  ];
}

export function getSimilarCompanies(slug: string): Company[] {
  return companies.filter(c => c.slug !== slug).slice(0, 4);
}

export const positions: Position[] = [
  { company: 'SpaceX', ticker: 'SPACEX', shares: 150, value: '$27,825', change: 3.24 },
  { company: 'OpenAI', ticker: 'OPENAI', shares: 200, value: '$28,460', change: 5.67 },
  { company: 'Stripe', ticker: 'STRIPE', shares: 300, value: '$23,670', change: -1.23 },
];
