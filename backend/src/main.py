from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router

from contextlib import asynccontextmanager
from src.services.browser_manager import browser_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize browser
    await browser_manager.start()
    yield
    # Shutdown: Close browser
    await browser_manager.stop()

app = FastAPI(
    title="Forage Scraper API",
    description="API for scraping private company data from Forge Global",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    # Use reload=True for development to auto-restart on code changes
    uvicorn.run("src.main:app", host="0.0.0.0", port=8080, reload=True)
