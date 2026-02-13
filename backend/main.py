from camoufox.sync_api import Camoufox
import time
import csv
import random

def main():
    print("Starting Camoufox for Forge Global Scraping...")
    all_data = []
    
    with Camoufox(headless=False) as browser:
        page = browser.new_page()
        
        # User defined xpath
        xpath_selector = '//*[@id="searchResults"]/div/div[1]/table/tbody'
        
        # Loop through pages (start with a safe limit for testing, e.g., 1 to 5)
        for page_num in range(1, 4): # Scraping 3 pages for this test run
            url = f"https://forgeglobal.com/search-companies/?page={page_num}"
            print(f"Navigating to Page {page_num}: {url}")
            
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                
                # Randomized wait for stealth
                time.sleep(random.uniform(2, 5))
                
                print(f"Waiting for table on page {page_num}...")
                try:
                    # Wait a bit less for subsequent pages, assuming structure loads if page exists
                    page.wait_for_selector(xpath_selector, timeout=10000)
                    
                    # Extract rows
                    tbody = page.locator(xpath_selector)
                    rows = tbody.locator("tr").all()
                    
                    if not rows:
                        print(f"No rows found on page {page_num}. Stopping.")
                        break
                        
                    print(f"Found {len(rows)} rows on page {page_num}.")
                    
                    for i, row in enumerate(rows):
                        cells = row.locator("td").all_text_contents()
                        # Clean up data if needed, for now just raw
                        all_data.append(cells)
                        
                except Exception as e:
                    print(f"Timeout or error on page {page_num}: {e}")
                    # If we time out waiting for the table, it likely means we reached the end
                    break
                    
            except Exception as e:
                print(f"Error navigating to page {page_num}: {e}")
                break

    # Save all gathered data
    if all_data:
        filename = "forge_data_full.csv"
        with open(filename, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            # Add header if known, otherwise just data
            # Based on inspection, headers might be: Name, Sector/Industry, Price, My Price, Series, Market Cap, Share Price, Raised
            writer.writerow(["Name", "Sector", "Price Change", "My Price", "Series", "Valuation", "Share Price", "Total Raised"]) 
            writer.writerows(all_data)
        print(f"Saved {len(all_data)} rows to {filename}")
    else:
        print("No data collected.")

if __name__ == "__main__":
    main()
