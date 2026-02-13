# Forge Scraper (Stealth API)

A stealth web scraping API built with FastAPI, Camoufox, and Python to extract private company data from Forge Global.

## Features

*   **Stealth Scraping**: Uses [Camoufox](https://github.com/daijro/camoufox) to mimic a real Firefox browser and evade detection.
*   **FastAPI Interface**: Provides a clean JSON API for data access.
*   **Unified Data Model**: Returns a standardized data structure (`UnifiedCompanyData`) across all services, with raw data preserved.
*   **Configurable Speed**: Supports different scraping profiles (`fast`, `normal`, `slow`) to balance speed and stealth.

## Prerequisites

- [uv](https://github.com/astral-sh/uv) (recommended for dependency management)

## Setup

1.  **Install Dependencies**
    ```bash
    uv sync
    ```

2.  **Fetch Camoufox Browser**
    Ensure the stealth browser binary is downloaded:
    ```bash
    uv run camoufox fetch
    ```

## Usage

### 0. Server
Start the API server:
```bash
uv run uvicorn src.main:app --reload
```
The server will start at `http://localhost:8000`.

### 1. API Documentation
Visit [http://localhost:8000/docs](http://localhost:8000/docs) to view the interactive API documentation (Swagger UI).

### 2. Scrape Data
Make a GET request to `/data/forge` with your desired filters.

**Example Request:**
```http
GET /data/forge?sector=healthcare-biotech-pharma&valuation=500m&page=1&speed=normal
```

**Parameters:**
- `sector`: (Optional) The industry sector path (e.g., `healthcare-biotech-pharma`).
- `valuation`: (Optional) Valuation filter (e.g., `500m`).
- `page`: (Default: `1`) The page number to scrape.
- `speed`: (Default: `normal`) Scraping speed profile. Options:
    - `fast`: 1-3s delays
    - `normal`: 3-7s delays
    - `slow`: 5-10s delays

**Response:**
Returns a list of unified company objects:
```json
[
  {
    "name": "OrsoBio",
    "sector": "HealthcareBiotech & Pharma",
    "valuation": "$316.32MM",
    "date_scraped": "2026-02-11T21:01:38.238370",
    "source": "forge_global",
    "raw_data": {
      "company": "OrsoBio",
      "sector": "HealthcareBiotech & Pharma",
      "subsector": "",
      "forge_price": "--",
      "last_matched_price": "$xx.xx",
      "round": "Series B",
      "post_money_valuation": "$316.32MM",
      "price_per_share": "$0.71",
      "amount_raised": "$67MM"
    }
  }
]
```

## Project Structure
```
forage-scraper/
├── src/
│   ├── api/            # API Routes
│   ├── services/       # Scraping Logic (ForgeGlobalService)
│   ├── models/         # Pydantic Schemas (UnifiedCompanyData)
│   ├── config.py       # Configuration
│   └── main.py         # Application Entry Point
├── verify.py           # Verification Script
├── .cursor/rules/      # Development Guidelines
└── README.md           # Documentation
```
