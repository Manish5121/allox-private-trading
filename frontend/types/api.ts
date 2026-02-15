export interface UnifiedCompanyData {
    name: string;
    sector?: string;
    valuation?: string;
    date_scraped: string;
    source: string;
    raw_data: Record<string, any>;
}

export interface FundingRound {
    date: string;
    round_label: string;
    amount_raised: string;
    price_per_share: string;
    valuation: string;
    investors: string[];

    // Detailed metrics
    shares_outstanding?: string;
    liquidation_preference_order?: string;
    liquidation_preference_multiple?: string;
    conversion_ratio?: string;
    dividend_rate?: string;
    dividend_type?: string;
    participation_type?: string;
    participation_cap?: string;
}

export interface KeyPerson {
    name: string;
    role: string;
    image_url?: string;
}

export interface CompanyDetail {
    name: string;
    slug: string;
    ticker: string;
    logo_url?: string;

    // Overview
    description: string;
    sector: string;
    subsector: string;
    founded: string;
    headquarters: string;
    website: string;
    employees: string;

    // Market Data
    price: string;
    price_change: string;
    price_change_pct: string;
    valuation: string;

    // Deep Data
    funding_history: FundingRound[];
    key_people: KeyPerson[];
    investors: string[];

    // Meta
    scraped_at: string;
}

export interface PaginatedResponse {
    items: UnifiedCompanyData[];
    total: number;
    page: number;
    size: number;
    pages: number;
}
