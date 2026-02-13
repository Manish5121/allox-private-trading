from src.services.forge_global import ForgeGlobalService
from src.config import SpeedProfile
import json

def test_detail_scraper():
    service = ForgeGlobalService()
    print("Testing detail scraper for 'discord'...")
    
    result = service.scrape_company_detail("discord")
    
    # Debug: Save HTML to inspect
    with open("discord_debug.html", "w") as f:
        # We need to expose the page content from the service or just trust the service to do it
        # For now, let's modify the service to verify, or just trust I'll modify the service next.
        pass
        
    if result:
        print("\nScraping Successful!")
        print(json.dumps(result.model_dump(), indent=2, default=str))
    else:
        print("\nScraping Failed.")

if __name__ == "__main__":
    test_detail_scraper()
