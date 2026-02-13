# Dockerfile for Railway deployment
FROM python:3.11-slim

# Install system dependencies required for Camoufox/Firefox
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    libgtk-3-0 \
    libx11-xcb1 \
    libdbus-glib-1-2 \
    libxt6 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libasound2 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libxfixes3 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install uv for fast package management
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock* ./

# Sync dependencies (creates .venv)
RUN uv sync

# Fetch the browser binary during build to cache it
RUN uv run camoufox fetch

# Copy the rest of the application
COPY . .

# Expose port (Railway fills PORT env var)
EXPOSE 8080

# Start the application using shell form to expand $PORT
CMD ["uv", "run", "python", "-m", "src.main"]
