import sys
import os
import asyncio

# Add project root to path
sys.path.append(os.getcwd())

from src.services.forge_global import ForgeGlobalService

def test_scraper():
    service = ForgeGlobalService()
    slug = "glean"
    print(f"Scraping {slug}...")
    try:
        data = service.scrape_company_detail(slug)
        if data:
            print(f"Scraping successful for {data.name}")
            print(f"Top-level Investors ({len(data.investors)}): {data.investors}")
            print(f"Funding History ({len(data.funding_history)} rounds):")
            for round in data.funding_history:
                print(f"  Gap: {round.round_label}, Date: {round.date}")
                print(f"  Investors: {round.investors}")
        else:
            print("No data returned")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_scraper()
