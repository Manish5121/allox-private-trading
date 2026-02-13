## 📋 Overview

Allox provides a sleek interface to browse and trade private company stocks, powered by real-time data scraping from Forge Global. The platform features company listings, detailed company profiles, funding history, and market metrics.

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router and Turbopack
- **React 18** - UI library with hooks and server components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Server state management with smart caching
- **Radix UI** - Accessible, unstyled component primitives

### Backend
- **FastAPI** - Modern Python web framework
- **Camoufox** - Stealth browser automation (Firefox-based)
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server
- **uv** - Fast Python package manager

## 🏗️ Project Structure

```
allocations/
├── frontend/          # Next.js application
├── backend/           # FastAPI scraping service
└── README.md          # This file
```

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.13+ ([Download](https://www.python.org/))
- **uv** - Python package manager ([Install](https://github.com/astral-sh/uv))

```bash
# Install uv (macOS/Linux)
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
uv sync

# Fetch Camoufox browser binary
uv run camoufox fetch

# Start development server
uv run uvicorn src.main:app --reload
```

Backend will be available at: **http://localhost:8000**

API documentation: **http://localhost:8000/docs**

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## 🎯 Key Features

- **Markets Dashboard** - Browse all available private companies
- **Real-time Data** - Live scraping from Forge Global
- **Company Profiles** - Detailed information, funding history, and metrics
- **Category Filtering** - Filter by AI, Fintech, Healthcare, etc.
- **Responsive Design** - Works on desktop, tablet, and mobile


## 🔧 Development Tools

- **TypeScript** - Static type checking for JavaScript
- **ESLint** - Code linting and formatting
- **Camoufox** - Anti-detection browser for scraping
- **React Query** - Automatic caching and background refetching
- **Playwright API** - Browser automation

## 📚 Documentation

- [Frontend Architecture](./frontend/README.md)
- [Backend Architecture](./backend/README.md)

## 📝 License

Private - All rights reserved

## 👨‍💻 Author

Manish
