import unittest
from server import DailyQuota, SlidingWindowLimiter

class RateLimitTests(unittest.TestCase):
    def test_sliding_window_blocks_and_recovers(self):
        limiter = SlidingWindowLimiter(2, 10)
        self.assertTrue(limiter.allow("user", 100))
        self.assertTrue(limiter.allow("user", 101))
        self.assertFalse(limiter.allow("user", 102))
        self.assertTrue(limiter.allow("user", 111))

    def test_identities_are_isolated(self):
        limiter = SlidingWindowLimiter(1, 60)
        self.assertTrue(limiter.allow("a", 100))
        self.assertFalse(limiter.allow("a", 101))
        self.assertTrue(limiter.allow("b", 101))

    def test_daily_quota_resets(self):
        quota = DailyQuota(1)
        self.assertTrue(quota.consume(0))
        self.assertFalse(quota.consume(1))
        self.assertTrue(quota.consume(86400))

if __name__ == "__main__":
    unittest.main()
