from abc import ABC, abstractmethod
from typing import List, Dict, Any
from src.models.schemas import UnifiedCompanyData

class ScraperService(ABC):
    @abstractmethod
    async def scrape(self, **kwargs) -> List[UnifiedCompanyData]:
        """
        Abstract method to be implemented by concrete scrapers.
        Should return a list of UnifiedCompanyData objects.
        """
        pass
