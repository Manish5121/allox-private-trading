import time
from camoufox.sync_api import Camoufox

def debug_details():
    url = "https://forgeglobal.com/glean_stock/#fundingAndValuation"
    print(f"Navigating to {url}...")
    
    with Camoufox(headless=True) as browser:
        page = browser.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        
        print("Waiting for table...")
        try:
            # Wait for the table rows
            page.wait_for_selector("tr.overview", timeout=15000)
            rows = page.locator("tr.overview").all()
            print(f"Found {len(rows)} overview rows.")
            
            for i, row in enumerate(rows):
                text = row.inner_text()
                if "Series F" in text:
                    print(f"Found Series F row at index {i}")
                    
                    data_index = row.get_attribute("data-index")
                    print(f"Row data-index: {data_index}")
                    
                    print("Clicking row to expand...")
                    row.click()
                    time.sleep(3) # Increase wait time
                    
                    # Try to find the detail row
                    detail_selector = f"tr.detail[data-index='{data_index}']"
                    detail_row = page.locator(detail_selector)
                    
                    if detail_row.count() > 0:
                        print("Detail row found!")
                        
                        # Check computed styles
                        try:
                            styles = detail_row.evaluate("el => { const s = window.getComputedStyle(el); return { display: s.display, visibility: s.visibility, opacity: s.opacity, maxHeight: s.maxHeight }; }")
                            print(f"Computed styles: {styles}")
                        except Exception as e:
                            print(f"Could not get styles: {e}")

                        if detail_row.is_visible():
                            print("Detail row is visible.")
                        else:
                            print("Detail row is NOT visible (is_visible() = False).")
                        
                        # DUMP HTML ANYWAY
                        html_content = detail_row.inner_html()
                        print("\n--- Detail Row HTML ---")
                        print(html_content)
                        print("-----------------------\n")
                        
                        # Test specific selectors
                        print("Testing selectors...")
                        
                        def test_selector(label):
                            # Exact same logic as in forge_global.py
                            xpath = f".//div[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{label.lower()}')]"
                            label_el = detail_row.locator(xpath).first
                            if label_el.count() > 0:
                                print(f"Found label element for '{label}': {label_el}")
                                val_el = label_el.locator("xpath=following-sibling::div").first
                                if val_el.count() > 0:
                                    val = val_el.inner_text().strip()
                                    print(f"  Value: '{val}'")
                                else:
                                    print("  Value element not found (no following-sibling div).")
                            else:
                                print(f"Label element for '{label}' NOT found.")

                        test_selector("Shares Outstanding")
                        test_selector("Liquidation Pref Order")
                        test_selector("Dividend Rate")
                    else:
                        print(f"Detail row with selector {detail_selector} NOT found.")
                    
                    break
                    
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    debug_details()
