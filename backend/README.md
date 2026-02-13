# Allox Backend

FastAPI-based stealth web scraping API for extracting private company data from Forge Global.

## 🚀 Tech Stack

- **FastAPI 0.128+** - Modern Python web framework with automatic OpenAPI docs
- **Camoufox 0.4+** - Stealth browser automation (Firefox-based with anti-fingerprinting)
- **Pydantic** - Data validation and serialization
- **Uvicorn 0.40+** - ASGI server for production
- **uv** - Ultra-fast Python package manager

## ✨ Features

- **Stealth Scraping** - Uses [Camoufox](https://github.com/daijro/camoufox) to mimic real Firefox browsers and evade detection
- **Speed Profiles** - Configurable scraping speeds (`fast`, `normal`, `slow`) to balance performance and stealth
- **Unified Data Model** - Standardized `UnifiedCompanyData` structure across all sources, with raw data preservation
- **REST API** - Clean JSON API with automatic OpenAPI documentation
- **Type Safety** - Full Pydantic validation for all requests and responses

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.py              # FastAPI app initialization
│   ├── config.py            # Speed profiles and settings
│   ├── api/
│   │   └── routes.py        # API endpoints
│   ├── models/
│   │   └── schemas.py       # Pydantic data models
│   └── services/
│       ├── base.py          # Abstract scraper interface
│       └── forge_global.py  # Forge Global scraper implementation
├── pyproject.toml           # Project dependencies (uv format)
├── uv.lock                  # Locked dependency versions
└── README.md                # This file
```

## 🛠️ Getting Started

### Prerequisites

- **Python 3.13+** ([Download](https://www.python.org/))
- **uv** - Fast Python package manager ([Install guide](https://github.com/astral-sh/uv))

```bash
# Install uv (macOS/Linux)
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Installation

```bash
# Install all dependencies
uv sync

# Fetch Camoufox browser binary (required for scraping)
uv run camoufox fetch
```

### Run Development Server

```bash
uv run uvicorn src.main:app --reload
```

The server will start at **http://localhost:8000**

### API Documentation

Visit **http://localhost:8000/docs** for interactive API documentation (Swagger UI)

## 📡 API Endpoints

### 1. Get Companies List

**GET** `/data/forge`

Scrape paginated company listings from Forge Global.

**Query Parameters:**
- `sector` (optional) - Industry sector (e.g., `ai`, `healthcare-biotech-pharma`)
- `valuation` (optional) - Minimum valuation filter (e.g., `500m`)
- `page` (default: `1`) - Page number
- `speed` (default: `normal`) - Scraping speed profile:
  - `fast` - 1-3s delays (faster, higher detection risk)
  - `normal` - 3-7s delays (balanced)
  - `slow` - 5-10s delays (safest)

**Example Request:**
```bash
curl "http://localhost:8000/data/forge?sector=ai&page=1&speed=fast"
```

**Example Response:**
```json
{
  "items": [
    {
      "name": "SpaceX",
      "sector": "Aerospace",
      "valuation": "$180B",
      "date_scraped": "2026-02-13T10:00:00",
      "source": "forge_global",
      "raw_data": {
        "company": "SpaceX",
        "forge_price": "$112.00",
        "round": "Series J",
        ...
      }
    }
  ],
  "total": 5237,
  "page": 1,
  "size": 24,
  "pages": 219
}
```

### 2. Get Company Details

**GET** `/data/company/{slug}`

Scrape detailed company information by slug.

**Path Parameters:**
- `slug` - Company identifier (e.g., `spacex`, `discord`)

**Example Request:**
```bash
curl "http://localhost:8000/data/company/spacex"
```

**Example Response:**
```json
{
  "name": "SpaceX",
  "slug": "spacex",
  "ticker": "SPAC",
  "logo_url": "https://...",
  "description": "Space Exploration Technologies...",
  "sector": "Aerospace",
  "price": "$112.00",
  "valuation": "$180B",
  "funding_history": [
    {
      "date": "2023-05-01",
      "round_label": "Series J",
      "amount_raised": "$750M",
      "valuation": "$180B",
      "investors": ["Sequoia Capital", "Founders Fund"]
    }
  ],
  ...
}
```

## 🎯 Speed Profiles

Configure scraping speed based on your needs:

| Profile | Delay Range | Use Case |
|---------|-------------|----------|
| `fast` | 1-3 seconds | Development, testing, quick data pulls |
| `normal` | 3-7 seconds | **Production default** - balanced speed and safety |
| `slow` | 5-10 seconds | High-stakes scraping, paranoid mode |

Set via query parameter:
```bash
/data/forge?speed=fast
```

## 🔧 Development

### Project Dependencies

All dependencies are managed via `uv` and defined in `pyproject.toml`:
- `camoufox` - Stealth browser
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `httpx` - HTTP client
- `playwright` - Browser automation core

### Adding New Scrapers

The service layer pattern makes it easy to add new data sources:

1. Create new service in `services/` implementing `ScraperService` interface
2. Add routes in `api/routes.py`
3. All scrapers return `UnifiedCompanyData` for consistency

## 🚢 Deployment

The backend can be deployed to any platform supporting Python applications.

### Render (Recommended)

Create `requirements.txt` for Render:
```bash
camoufox>=0.4.11
fastapi>=0.128.8
httpx>=0.28.1
playwright>=1.58.0
uvicorn>=0.40.0
```

**Build Command:**
```bash
pip install uv && uv sync && uv run camoufox fetch
```

**Start Command:**
```bash
uv run uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

## 🔒 CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (local development)

Update `src/main.py` for production:
```python
allow_origins=[
    "http://localhost:3000",
    "https://your-frontend.vercel.app"
]
```

## 📝 License

Private - All rights reserved
