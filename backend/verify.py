from fastapi.testclient import TestClient
from src.main import app
import sys
import os

# Add current directory to path so src imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

client = TestClient(app)

def test_scrape():
    print("Testing scraping endpoint with speed='fast'...")
    try:
        response = client.get("/data/forge?speed=fast&page=1&sector=healthcare-biotech-pharma&valuation=500m")
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Successfully scraped {len(data)} companies.")
            if data:
                print("First company data:")
                first = data[0]
                print(first)
                
                # Verify unified fields
                required_fields = ["name", "source", "raw_data"]
                missing = [f for f in required_fields if f not in first]
                
                if missing:
                    print(f"WARNING: Missing unified fields: {missing}")
                else:
                    print("Unified Data structure verification passed.")
                    
                # Verify raw data contains original fields
                raw = first.get("raw_data", {})
                if "forge_price" in raw and "round" in raw:
                    print("Raw data verification passed.")
                else:
                    print(f"WARNING: Missing Expected keys in raw_data: {raw.keys()}")

            else:
                print("No data found (this might be valid if no results).")
        else:
            print(f"Request failed: {response.text}")
            
    except Exception as e:
        print(f"Test exception: {e}")

if __name__ == "__main__":
    test_scrape()
