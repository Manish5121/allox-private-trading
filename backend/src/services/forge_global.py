import time
import asyncio
import random
from typing import List, Dict, Optional
from src.services.base import ScraperService
from src.config import SpeedProfile, SLEEP_CONFIG
from src.models.schemas import UnifiedCompanyData, ForgeCompanyData, CompanyDetail
import gc
from src.services.browser_manager import browser_manager

class ForgeGlobalService(ScraperService):
    BASE_URL = "https://forgeglobal.com/search-companies/"
    # Simple in-memory cache: slug -> (data, timestamp)
    _detail_cache: Dict[str, tuple[CompanyDetail, float]] = {}
    CACHE_TTL = 3600  # 1 hour

    async def scrape(
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
        
        # Singleton Browser Usage
        browser = await browser_manager.get_browser()
        context = await browser.new_context()
        
        # Block heavy resources to save memory
        async def route_handler(route):
            if route.request.resource_type in ["image", "media", "font", "stylesheet"]:
                await route.abort()
            else:
                await route.continue_()

        try:
            # Create page and apply routing
            page = await context.new_page()
            await page.route("**/*", route_handler)
            
            try:
                print(f"Navigating to {url}...")
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                
                # Sleep based on speed profile
                sleep_time = random.uniform(min_sleep, max_sleep)
                print(f"Sleeping for {sleep_time:.2f}s...")
                await asyncio.sleep(sleep_time) # Use async sleep
                
                # Use simpler CSS selector for robustness
                # Was: //*[@id="searchResults"]/div/div[1]/table/tbody
                css_selector = "table tbody"
                
                # NEW BATCH STRATEGY: Scrape all data in one go using safe DOM execution
                # This avoids making 24 separate network requests which was causing the hang
                print("Extracting table data entries...")
                
                try:
                    table_data = await page.evaluate("""() => {
                        const rows = Array.from(document.querySelectorAll('table tbody tr'));
                        return rows.map(row => {
                            const cells = Array.from(row.querySelectorAll('td'));
                            if (cells.length < 8) return null;
                            
                            // Extract logo safely
                            const img = row.querySelector('td:first-child img');
                            const logo = img ? img.src : null;
                            
                            // Extract text content cleanly
                            const texts = cells.map(c => c.innerText);
                            
                            return {
                                logo_url: logo,
                                cells: texts
                            };
                        }).filter(item => item !== null);
                    }""")
                    
                    print(f"Extracted {len(table_data)} rows successfully.")
                    
                    if not table_data:
                        print("No valid rows found in table.")
                        try:
                            content = await page.content()
                            print(f"DEBUG_HTML_SNIPPET: {content[:3000]}")
                        except:
                            pass
                        return []

                    for item in table_data:
                        try:
                            cells = item['cells']
                            logo_url = item['logo_url']
                            
                            if not cells or len(cells) < 8:
                                continue

                            if logo_url and not logo_url.startswith("http"):
                                logo_url = f"https://forgeglobal.com{logo_url}"

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
                            if '\\n' in sector_text:  # JS innerText likely preserves newlines
                                sector_main, subsector = sector_text.split('\\n', 1)
                                sector_main = sector_main.strip()
                                subsector = subsector.strip()
                            elif '\n' in sector_text:
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
                            print(f"Error parsing row item: {e}")
                            continue
                        
                except Exception as e:
                    print(f"Error executing batch extraction: {e}")
                    # Debugging for Render deployment
                    try:
                        print(f"DEBUG_URL: {page.url}")
                        content = await page.content()
                        print(f"DEBUG_HTML_SNIPPET: {content[:3000]}")
                    except:
                        pass
                    
            except Exception as e:
                print(f"Navigation error: {e}")
        finally:
            print("Closing browser context...")
            await context.close()
            gc.collect()
            print("Memory cleanup completed.")
                
        return results

    async def scrape_company_detail(self, slug: str) -> Optional[CompanyDetail]:
        """
        Scrapes detailed company information from a specific company page.
        """
        from src.models.schemas import CompanyDetail, FundingRound, KeyPerson
        from datetime import datetime
        
        # Check Cache
        current_time = time.time()
        if slug in self._detail_cache:
            data, timestamp = self._detail_cache[slug]
            if current_time - timestamp < self.CACHE_TTL:
                print(f"Adding cached result for {slug}")
                return data
            else:
                del self._detail_cache[slug]
        
        url = f"https://forgeglobal.com/{slug}_stock/"
        print(f"Scraping Company Detail URL: {url}")
        
        # Singleton Browser Usage
        browser = await browser_manager.get_browser()
        context = await browser.new_context()
        
        # Block heavy resources to save memory
        async def route_handler(route):
            if route.request.resource_type in ["image", "media", "font", "stylesheet"]:
                await route.abort()
            else:
                await route.continue_()

        try:
            # Create page and apply routing
            page = await context.new_page()
            await page.route("**/*", route_handler)

            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                # Wait for main content
                await page.wait_for_selector("h1", timeout=15000)
                
                # 1. Header Info (Name, Logo)
                name = "Unknown"
                ticker = slug.upper()[:4]
                logo_url = None
                
                try:
                    h1 = page.locator("h1").first
                    if await h1.count() > 0:
                        raw_name = await h1.inner_text()
                        name = raw_name.strip().replace(" stock", "").replace(" Stock", "")
                        
                        # Logo is often in a picture element next to H1
                        # Structure: .d-flex.align-items-center > picture > img
                        header_container = h1.locator("..")
                        logo_img = header_container.locator("img").first
                        if await logo_img.count() > 0:
                            logo_url = await logo_img.get_attribute("src")
                            if logo_url and not logo_url.startswith("http"):
                                # Make absolute URL if relative
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
                    dg_containers = await page.locator(".dg").all()
                    
                    for container in dg_containers:
                        try:
                            # Check if this container has "Forge Price" label
                            label_el = container.locator(".dl").first
                            if await label_el.count() > 0:
                                label_text = await label_el.inner_text()
                                if "Forge Price" in label_text:
                                    # Found the right container, now get the value
                                    value_container = container.locator(".dv1").first
                                    if await value_container.count() > 0:
                                        full_text = (await value_container.inner_text()).strip()
                                        # Extract price: first $XXX.XX pattern
                                        import re
                                        price_match = re.search(r'\$[\d,]+\.?\d*', full_text)
                                        if price_match:
                                            price = price_match.group(0)
                                        
                                        # Extract change from .positive or .negative span
                                        change_span = value_container.locator(".positive, .negative").first
                                        if await change_span.count() > 0:
                                            change_text = (await change_span.inner_text()).strip()
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
                    if await val_item.count() > 0:
                        val_text = (await val_item.locator(".value").inner_text()).strip()
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
                    rows = await page.locator("tr.overview").all()
                    
                    for row in rows:
                        cells = await row.locator("td").all_text_contents()
                        # Cells: [toggle, Date, Rounds, Amount, Price, Valuation, Investors]
                        if len(cells) >= 7:
                            # Basic info
                            date_str = cells[1].strip()
                            round_label = cells[2].strip()
                            amount_raised = cells[3].strip()
                            price_per_share = cells[4].strip()
                            valuation = cells[5].strip()
                            investors_list = [inv.strip() for inv in cells[6].split(",")] if cells[6].strip() else []

                            # Detailed info (initially None)
                            shares_outstanding = None
                            liq_pref_order = None
                            liq_pref_mult = None
                            conv_ratio = None
                            div_rate = None
                            div_type = None
                            part_type = None
                            part_cap = None

                            try:
                                # Get data-index to find the corresponding detail row
                                data_index = await row.get_attribute("data-index")
                                
                                # Click to expand - click the first cell which usually contains the chevron/toggle
                                await row.locator("td").first.click()
                                # await asyncio.sleep(1.0) # Removed explicit sleep, rely on wait_for below
                                
                                if data_index:
                                    # Scope to the specific detail row
                                    detail_row = page.locator(f"tr.detail[data-index='{data_index}']")
                                    
                                    # Wait for it to be visible
                                    try:
                                        await detail_row.wait_for(state="visible", timeout=2000)
                                    except:
                                        # If wait fails, try clicking again? Or just proceed if it's already open?
                                        pass

                                    if await detail_row.is_visible():
                                        # Helper to get value by label within the detail row
                                        async def get_scoped_value(label_text):
                                            try:
                                                # Use strict XPath for label text matching (case-insensitive)
                                                # Must prefix with 'xpath=' for Playwright
                                                label_xpath = f"xpath=.//div[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{label_text.lower()}')]"
                                                
                                                # Locate the label
                                                label_el = detail_row.locator(label_xpath).first
                                                
                                                # If label found, get the immediate following sibling div
                                                if await label_el.count() > 0:
                                                    value_el = label_el.locator("xpath=following-sibling::div").first
                                                    if await value_el.count() > 0:
                                                        text = (await value_el.inner_text()).strip()
                                                        return text if text and text != "--" else None
                                                return None
                                            except Exception as e:
                                                print(f"Error getting value for {label_text}: {e}")
                                                return None

                                        shares_outstanding = await get_scoped_value("Shares Outstanding")
                                        liq_pref_order = await get_scoped_value("Liquidation Pref Order")
                                        liq_pref_mult = await get_scoped_value("Liquidation Pref As Multiplier")
                                        conv_ratio = await get_scoped_value("Conversion Ratio")
                                        div_rate = await get_scoped_value("Dividend Rate")
                                        part_cap = await get_scoped_value("Participation Cap")
                                        
                                        # For Dividend/Participation Types, we can check for text "Non-cumulative" etc.
                                        # But let's stick to the requested fields first.
                                        
                            except Exception as e:
                                print(f"Error extracting details for {round_label}: {e}")
                            
                            funding_history.append(FundingRound(
                                date=date_str,
                                round_label=round_label,
                                amount_raised=amount_raised,
                                price_per_share=price_per_share,
                                valuation=valuation,
                                investors=investors_list,
                                shares_outstanding=shares_outstanding,
                                liquidation_preference_order=liq_pref_order,
                                liquidation_preference_multiple=liq_pref_mult,
                                conversion_ratio=conv_ratio,
                                dividend_rate=div_rate,
                                dividend_type=div_type,
                                participation_type=part_type,
                                participation_cap=part_cap
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
                    cols = await page.locator(".col").all()
                    
                    for col in cols:
                        try:
                            label_el = col.locator(".label").first
                            value_el = col.locator(".value").first
                            
                            if await label_el.count() > 0 and await value_el.count() > 0:
                                label = (await label_el.inner_text()).strip().lower()
                                value = (await value_el.inner_text()).strip()
                                
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
                    if await desc_el.count() > 0:
                        description = (await desc_el.inner_text()).strip()
                        
                    # Website - .website-url a
                    web_el = page.locator(".website-url a").first
                    if await web_el.count() > 0:
                        website = await web_el.get_attribute("href")
                        
                except Exception as e:
                    print(f"Error extracting details: {e}")

                result = CompanyDetail(
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
                    investors=list(set([inv for round in funding_history for inv in round.investors]))
                )
                
                # Store in cache
                self._detail_cache[slug] = (result, time.time())
                return result

            except Exception as e:
                print(f"Detailed scraping error: {e}")
                return None
        finally:
            print("Closing browser context...")
            await context.close()
            gc.collect()
            print("Detail scrape memory cleanup completed.")
