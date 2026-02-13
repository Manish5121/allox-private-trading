import { PaginatedResponse, CompanyDetail } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error: ${res.status} - ${error}`);
  }

  return res.json();
}

export const api = {
  getCompanies: async (
    page: number = 1,
    sector?: string,
    valuation?: string
  ): Promise<PaginatedResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      speed: 'fast',
    });

    if (sector && sector !== 'All') {
      params.append('sector', sector);
    }

    if (valuation) {
      params.append('valuation', valuation);
    }

    return fetchApi<PaginatedResponse>(`/data/forge?${params.toString()}`);
  },

  getCompanyDetail: async (slug: string): Promise<CompanyDetail> => {
    return fetchApi<CompanyDetail>(`/data/company/${slug}`);
  },
};

import { Company, Category } from './types';
import { UnifiedCompanyData } from '@/types/api';

export function transformCompany(data: UnifiedCompanyData): Company {
  // Extract ticker from name or raw_data if available, otherwise generate specific mocked one 
  const ticker = (data.raw_data?.ticker || data.name.substring(0, 4).toUpperCase());

  // Parse price and change from forge_price or other sources
  // Expected format: "$580.41 +$17.81 (3.17%)" or similar
  let price = 0;
  let change24h = 0;

  if (data.raw_data?.forge_price) {
    const priceText = data.raw_data.forge_price;

    // Extract price
    const priceMatch = priceText.match(/\$([\d,]+\.?\d*)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/,/g, ''));
    }

    // Extract percentage change: looking for (X.XX%)
    const pctMatch = priceText.match(/\(([\+\-]?\d+\.?\d*)%\)/);
    if (pctMatch) {
      change24h = parseFloat(pctMatch[1]);
    }
  }

  // Clean up sector: Match against known valid categories
  // "Enterprise SoftwareData Intelligence" -> "Enterprise"
  let sectorStr = data.sector || 'Enterprise';

  const knownCategories: Category[] = ['AI', 'Fintech', 'Enterprise', 'Space', 'Consumer', 'Crypto', 'Health'];
  let sector: Category = 'Enterprise'; // Default fallback

  // Try to find a matching category in the sector string
  const foundCategory = knownCategories.find(c => sectorStr.includes(c));
  if (foundCategory) {
    sector = foundCategory;
  }

  return {
    slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: data.name,
    ticker: ticker,
    logoUrl: data.raw_data?.logo_url,
    sector: sector,
    price: price,
    change24h: change24h,
    amountRaised: data.raw_data?.amount_raised || '--',
    marketCap: data.valuation || 'N/A',
    sparkline: Array(8).fill(0).map(() => ({ value: 40 + Math.random() * 20 })),
    description: '',
    founded: '',
    headquarters: '',
    employees: '',
    lastFunding: data.raw_data?.round || '',
    lastValuation: data.valuation || '',
    volume24h: 'N/A',
  };
}
