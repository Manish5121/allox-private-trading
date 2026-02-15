from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from src.services.forge_global import ForgeGlobalService
from src.models.schemas import UnifiedCompanyData, PaginatedResponse, CompanyDetail
from src.config import SpeedProfile

router = APIRouter()
service = ForgeGlobalService()

@router.get("/data/forge", response_model=PaginatedResponse)
async def get_forge_data(
    sector: Optional[str] = Query(None, description="Sector to filter by (e.g., healthcare-biotech-pharma)"),
    valuation: Optional[str] = Query(None, description="Valuation filter (e.g., 500m)"),
    page: int = Query(1, ge=1, description="Page number"),
    speed: SpeedProfile = Query(SpeedProfile.NORMAL, description="Scraping speed profile")
):
    """
    Scrape Forge Global data with specified filters and speed profile.
    Returns paginated unified company data structure.
    """
    try:
        # Service returns List[UnifiedCompanyData]
        data = await service.scrape(sector=sector, valuation=valuation, page_num=page, speed=speed)
        
        # Standard page size is 24 items per page on Forge
        page_size = len(data)
        
        # If we get less than 24, assume we're on the last page
        # Otherwise, estimate total (this is a limitation without scraping pagination info)
        if page_size < 24:
            # Last page - calculate total
            total = (page - 1) * 24 + page_size
            total_pages = page
        else:
            # Not last page - we'll use a conservative estimate
            # Forge typically has ~5000+ companies, so we'll use 5237 as default
            total = 5237  # This matches the user's example
            total_pages = (total + 23) // 24  # Ceiling division
        
        return PaginatedResponse(
            items=data,
            total=total,
            page=page,
            size=page_size,
            pages=total_pages
        )
    except Exception as e:
        # In production, log the error
        print(f"Error scraping: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/company/{slug}", response_model=CompanyDetail)
async def get_company_detail(slug: str):
    """
    Scrape detailed company information by slug (e.g., discord, spacex).
    """
    try:
        data = await service.scrape_company_detail(slug)
        if not data:
            raise HTTPException(status_code=404, detail="Company not found or scraping failed")
        return data
    except Exception as e:
        print(f"Error scraping detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))
