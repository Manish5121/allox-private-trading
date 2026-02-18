from camoufox.async_api import AsyncCamoufox
from typing import Optional

class BrowserManager:
    _instance: Optional['BrowserManager'] = None
    _browser = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BrowserManager, cls).__new__(cls)
        return cls._instance

    async def start(self):
        """Initializes the global browser instance with memory optimization flags."""
        if self._browser is None:
            # Memory optimization args for Render
            browser_args = [
                "--disable-dev-shm-usage", 
                "--no-sandbox", 
                "--disable-gpu", 
                "--disable-software-rasterizer", 
                "--single-process",
                "--js-flags=--max-old-space-size=128",  # Limit V8 heap to 128MB
                "--disable-extensions",
                "--disable-component-extensions-with-background-pages",
                "--mute-audio",
                "--no-zygote",
                "--no-first-run",
                "--disable-background-networking",
                "--disable-default-apps",
                "--disable-sync"
            ]
            
            self._camoufox = AsyncCamoufox(headless=True, args=browser_args)
            self._browser = await self._camoufox.__aenter__()
            print("Global browser started.")

    async def stop(self):
        """Closes the global browser instance."""
        if self._browser:
            await self._browser.close()
            self._browser = None
            if hasattr(self, '_camoufox'):
                await self._camoufox.__aexit__(None, None, None)
            print("Global browser closed.")

    async def get_browser(self):
        """Returns the global browser instance. Starts it if not running."""
        if self._browser is None:
            await self.start()
        return self._browser

# Global instance
browser_manager = BrowserManager()
