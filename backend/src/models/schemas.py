from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class UnifiedCompanyData(BaseModel):
    name: str
    sector: Optional[str] = None
    valuation: Optional[str] = None
    date_scraped: datetime = Field(default_factory=datetime.utcnow)
    source: str
    raw_data: Dict[str, Any] = {}

class ForgeCompanyData(BaseModel):
    company: str
    sector: str
    subsector: str
    forge_price: str
    last_matched_price: Optional[str] = None
    round: str
    post_money_valuation: str
    price_per_share: str
    amount_raised: str
    logo_url: Optional[str] = None  # Company logo URL

class FundingRound(BaseModel):
    date: str
    round_label: str  # e.g. "Series H"
    amount_raised: str
    price_per_share: str
    valuation: str
    investors: List[str]

class KeyPerson(BaseModel):
    name: str
    role: str # e.g. "CEO", "Founder", "Board Member"
    image_url: Optional[str] = None

class CompanyDetail(BaseModel):
    name: str
    slug: str # e.g. "discord"
    ticker: str
    logo_url: Optional[str] = None
    
    # Overview
    description: str
    sector: str
    subsector: str
    founded: str
    headquarters: str
    website: str
    employees: str
    
    # Market Data
    price: str
    price_change: str
    price_change_pct: str
    valuation: str
    
    # Deep Data
    funding_history: List[FundingRound]
    key_people: List[KeyPerson]
    investors: List[str]
    
    # Meta
    scraped_at: datetime = Field(default_factory=datetime.utcnow)

class PaginatedResponse(BaseModel):
    items: List[UnifiedCompanyData]
    total: int
    page: int
    size: int
    pages: int
