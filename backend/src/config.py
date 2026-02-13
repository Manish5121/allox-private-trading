from enum import Enum

class SpeedProfile(str, Enum):
    FAST = "fast"
    NORMAL = "normal"
    SLOW = "slow"

SLEEP_CONFIG = {
    SpeedProfile.FAST: (1, 3),
    SpeedProfile.NORMAL: (3, 7),
    SpeedProfile.SLOW: (5, 10),
}
