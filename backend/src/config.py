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
