import time
import random
from typing import List, Dict, Optional
from camoufox.sync_api import Camoufox
from src.services.base import ScraperService
from src.config import SpeedProfile, SLEEP_CONFIG
from src.models.schemas import UnifiedCompanyData, ForgeCompanyData, CompanyDetail

class ForgeGlobalService(ScraperService):
    BASE_URL = "https://forgeglobal.com/search-companies/"

    def scrape(
        self, 
        sector: Optional[str] = None, 
        valuation: Optional[str] = None, 
        page_num: int = 1,
        speed: SpeedProfile = SpeedProfile.NORMAL
    ) -> List[UnifiedCompanyData]:
        """
        Scrapes Forge Global data based on sector and valuation filters.
        """
        # Construct URL
        url = self.BASE_URL
        if sector:
            if not url.endswith("/"):
                url += "/"
            url += f"{sector}/"
        
        query_params = []
        if valuation:
            query_params.append(f"valuation={valuation}")
        
        query_params.append(f"page={page_num}")
        
        if query_params:
            url += "?" + "&".join(query_params)

        print(f"Scraping URL: {url} with speed profile: {speed}")
        
        min_sleep, max_sleep = SLEEP_CONFIG[speed]
        
        results = []
        
        with Camoufox(headless=True) as browser:
            page = browser.new_page()
            
            try:
                print(f"Navigating to {url}...")
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                
                # Sleep based on speed profile
                sleep_time = random.uniform(min_sleep, max_sleep)
                print(f"Sleeping for {sleep_time:.2f}s...")
                time.sleep(sleep_time)
                
                xpath_selector = '//*[@id="searchResults"]/div/div[1]/table/tbody'
                
                print("Waiting for table...")
                try:
                    page.wait_for_selector(xpath_selector, timeout=10000)
                    tbody = page.locator(xpath_selector)
                    rows = tbody.locator("tr").all()
                    
                    if not rows:
                        print("No rows found.")
                        return []
                        
                    print(f"Found {len(rows)} rows.")
                    
                    for row in rows:
                        cells = row.locator("td").all_text_contents()
                        if not cells or len(cells) < 8:
                            continue
                            
                        # Extract logo URL from first column
                        logo_url = None
                        try:
                            # Look for img tag in first cell (logo column)
                            logo_img = row.locator("td").first.locator("img").first
                            logo_url = logo_img.get_attribute("src")
                            if logo_url and not logo_url.startswith("http"):
                                # Make absolute URL if relative
                                logo_url = f"https://forgeglobal.com{logo_url}"
                        except Exception as e:
                            print(f"Could not extract logo: {e}")
                            
                        # Parse cells based on verified structure
                        # 0: Logo column
                        # 1: Company
                        # 2: Sector & Subsector
                        # 3: Forge Price
                        # 4: Last Matched Price
                        # 5: Round
                        # 6: Post-Money Valuation
                        # 7: Price Per Share
                        # 8: Amount Raised
                        
                        company_name = cells[1].strip()
                        
                        sector_text = cells[2]
                        if '\n' in sector_text:
                            sector_main, subsector = sector_text.split('\n', 1)
                            sector_main = sector_main.strip()
                            subsector = subsector.strip()
                        else:
                            sector_main = sector_text.strip()
                            subsector = ""
                            
                        # Create Forge specific model first
                        forge_data = ForgeCompanyData(
                            company=company_name,
                            sector=sector_main,
                            subsector=subsector,
                            forge_price=cells[3].strip(),
                            last_matched_price=cells[4].strip() if cells[4].strip() else None,
                            round=cells[5].strip(),
                            post_money_valuation=cells[6].strip(),
                            price_per_share=cells[7].strip(),
                            amount_raised=cells[8].strip() if len(cells) > 8 else "",
                            logo_url=logo_url
                        )
                        
                        # Convert to Unified Model
                        unified_data = UnifiedCompanyData(
                            name=company_name,
                            sector=sector_main,
                            valuation=forge_data.post_money_valuation,
                            source="forge_global",
                            raw_data=forge_data.model_dump()
                        )
                        
                        results.append(unified_data)
                        
                except Exception as e:
                    print(f"Error finding/parsing table: {e}")
                    
            except Exception as e:
                print(f"Navigation error: {e}")
                
        return results

    def scrape_company_detail(self, slug: str) -> Optional[CompanyDetail]:
        """
        Scrapes detailed company information from a specific company page.
        """
        from src.models.schemas import CompanyDetail, FundingRound, KeyPerson
        from datetime import datetime
        
        url = f"https://forgeglobal.com/{slug}_stock/"
        print(f"Scraping Company Detail URL: {url}")
        
        with Camoufox(headless=True) as browser:
            page = browser.new_page()
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                # Wait for main content
                page.wait_for_selector("h1", timeout=15000)
                
                # 1. Header Info (Name, Logo)
                name = "Unknown"
                ticker = slug.upper()[:4]
                logo_url = None
                
                try:
                    h1 = page.locator("h1").first
                    if h1.count() > 0:
                        raw_name = h1.inner_text().strip()
                        name = raw_name.replace(" stock", "").replace(" Stock", "")
                        
                        # Logo is often in a picture element next to H1
                        # Structure: .d-flex.align-items-center > picture > img
                        header_container = h1.locator("..")
                        logo_img = header_container.locator("img").first
                        if logo_img.count() > 0:
                            logo_url = logo_img.get_attribute("src")
                            if logo_url and not logo_url.startswith("http"):
                                logo_url = f"https://forgeglobal.com{logo_url}"
                except Exception as e:
                    print(f"Error extracting header: {e}")

                # 2. Market Data (Price, Valuation)
                price = "N/A"
                change = "N/A" 
                change_pct = "N/A"
                valuation = "N/A"
                
                try:
                    # Price and Change: Look for the header section with class="dg" containing "Forge Price"
                    # Structure: <div class="dg"><div class="dl">Forge Price</div><div class="dv1">$580.41 <span class="positive">+$17.81 (3.17%)</span></div>
                    
                    # Find all .dg containers
                    dg_containers = page.locator(".dg").all()
                    
                    for container in dg_containers:
                        try:
                            # Check if this container has "Forge Price" label
                            label_el = container.locator(".dl").first
                            if label_el.count() > 0 and "Forge Price" in label_el.inner_text():
                                # Found the right container, now get the value
                                value_container = container.locator(".dv1").first
                                if value_container.count() > 0:
                                    full_text = value_container.inner_text().strip()
                                    # Extract price: first $XXX.XX pattern
                                    import re
                                    price_match = re.search(r'\$[\d,]+\.?\d*', full_text)
                                    if price_match:
                                        price = price_match.group(0)
                                    
                                    # Extract change from .positive or .negative span
                                    change_span = value_container.locator(".positive, .negative").first
                                    if change_span.count() > 0:
                                        change_text = change_span.inner_text().strip()
                                        # "+$17.81 (3.17%)" or "-$10.00 (-2.5%)"
                                        parts = change_text.split(" ")
                                        if len(parts) >= 2:
                                            change = parts[0]  # e.g., "+$17.81"
                                            change_pct = parts[1].replace("(", "").replace(")", "")  # e.g., "3.17%"
                                    break  # Found it, exit loop
                        except Exception as e:
                            continue
                            
                    # Valuation: look for .fp-info-item with label "Forge Price valuation"
                    val_item = page.locator(".fp-info-item").filter(has_text="Forge Price valuation").first
                    if val_item.count() > 0:
                        val_text = val_item.locator(".value").inner_text().strip()
                        # Clean up "none" if present (seen in dump as class="value none")
                        if val_text.lower() != "none" and "$" in val_text:
                            valuation = val_text
                        elif "$" in val_text:
                             valuation = val_text
                        
                except Exception as e:
                    print(f"Error extracting market data: {e}")

                # 3. Funding History
                funding_history = []
                try:
                    # Use tr.overview selector we found inside #funding table if possible, or just global tr.overview
                    # The dump showed tr.overview at root level of find, so global is fine
                    rows = page.locator("tr.overview").all()
                    
                    for row in rows:
                        cells = row.locator("td").all_text_contents()
                        # Cells: [toggle, Date, Rounds, Amount, Price, Valuation, Investors]
                        if len(cells) >= 7:
                            funding_history.append(FundingRound(
                                date=cells[1].strip(),
                                round_label=cells[2].strip(),
                                amount_raised=cells[3].strip(),
                                price_per_share=cells[4].strip(),
                                valuation=cells[5].strip(),
                                investors=[inv.strip() for inv in cells[6].split(",")] if cells[6].strip() else []
                            ))
                except Exception as e:
                    print(f"Error extracting funding: {e}")

                # 4. Company Details (Sector, Founded, Headquarters, etc.)
                sector = ""
                subsector = ""
                founded = ""
                hq = ""
                employees = ""
                description = ""
                website = ""
                
                try:
                    # Extract all .col elements that contain label/value pairs
                    cols = page.locator(".col").all()
                    
                    for col in cols:
                        try:
                            label_el = col.locator(".label").first
                            value_el = col.locator(".value").first
                            
                            if label_el.count() > 0 and value_el.count() > 0:
                                label = label_el.inner_text().strip().lower()
                                value = value_el.inner_text().strip()
                                
                                if "sector" in label and "subsector" not in label:
                                    sector = value
                                elif "subsector" in label:
                                    subsector = value
                                elif "founded" in label:
                                    founded = value
                                elif "headquarters" in label or "headquarter" in label:
                                    hq = value
                                elif "employees" in label or "employee" in label:
                                    employees = value
                        except Exception as e:
                            continue
                    
                    # Description - .desc class
                    desc_el = page.locator(".desc").first
                    if desc_el.count() > 0:
                        description = desc_el.inner_text().strip()
                        
                    # Website - .website-url a
                    web_el = page.locator(".website-url a").first
                    if web_el.count() > 0:
                        website = web_el.get_attribute("href")
                        
                except Exception as e:
                    print(f"Error extracting details: {e}")

                return CompanyDetail(
                    name=name,
                    slug=slug,
                    ticker=ticker,
                    logo_url=logo_url,
                    description=description,
                    sector=sector,
                    subsector=subsector,
                    founded=founded,
                    headquarters=hq,
                    website=website,
                    employees=employees,
                    price=price,
                    price_change=change,
                    price_change_pct=change_pct,
                    valuation=valuation,
                    funding_history=funding_history,
                    key_people=[],
                    investors=[]
                )

            except Exception as e:
                print(f"Detailed scraping error: {e}")
                return None
