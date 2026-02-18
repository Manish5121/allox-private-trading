from enum import Enum

class SpeedProfile(str, Enum):
    FAST = "fast"
    NORMAL = "normal"
    SLOW = "slow"

SLEEP_CONFIG = {
    SpeedProfile.FAST: (0.1, 0.5),
    SpeedProfile.NORMAL: (0.5, 1.5),
    SpeedProfile.SLOW: (1.5, 3.0),
}

# Concurrency & Caching Config
MAX_CONCURRENCY = 1  # Strict limit for t3.micro (1GB RAM)
CACHE_TTL = 3600  # 1 hour cache validation
