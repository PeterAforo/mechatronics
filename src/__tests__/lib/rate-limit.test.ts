import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const identifier = `test-${Date.now()}-1`;
      const result = checkRateLimit(identifier, { limit: 5, windowSeconds: 60 });
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
    });

    it('should track request count correctly', () => {
      const identifier = `test-${Date.now()}-2`;
      
      // First request
      let result = checkRateLimit(identifier, { limit: 3, windowSeconds: 60 });
      expect(result.remaining).toBe(2);
      
      // Second request
      result = checkRateLimit(identifier, { limit: 3, windowSeconds: 60 });
      expect(result.remaining).toBe(1);
      
      // Third request
      result = checkRateLimit(identifier, { limit: 3, windowSeconds: 60 });
      expect(result.remaining).toBe(0);
      expect(result.success).toBe(true);
    });

    it('should block requests over limit', () => {
      const identifier = `test-${Date.now()}-3`;
      
      // Exhaust the limit
      for (let i = 0; i < 3; i++) {
        checkRateLimit(identifier, { limit: 3, windowSeconds: 60 });
      }
      
      // This should be blocked
      const result = checkRateLimit(identifier, { limit: 3, windowSeconds: 60 });
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should have correct reset time', () => {
      const identifier = `test-${Date.now()}-4`;
      const result = checkRateLimit(identifier, { limit: 5, windowSeconds: 60 });
      
      expect(result.resetTime).toBeGreaterThan(Date.now());
      expect(result.resetTime).toBeLessThanOrEqual(Date.now() + 60000);
    });
  });

  describe('RATE_LIMITS presets', () => {
    it('should have standard preset', () => {
      expect(RATE_LIMITS.standard.limit).toBe(100);
      expect(RATE_LIMITS.standard.windowSeconds).toBe(60);
    });

    it('should have auth preset with lower limit', () => {
      expect(RATE_LIMITS.auth.limit).toBe(10);
      expect(RATE_LIMITS.auth.windowSeconds).toBe(60);
    });

    it('should have strict preset', () => {
      expect(RATE_LIMITS.strict.limit).toBe(5);
      expect(RATE_LIMITS.strict.windowSeconds).toBe(60);
    });

    it('should have telemetry preset with high limit', () => {
      expect(RATE_LIMITS.telemetry.limit).toBe(1000);
      expect(RATE_LIMITS.telemetry.windowSeconds).toBe(60);
    });

    it('should have newsletter preset with hourly window', () => {
      expect(RATE_LIMITS.newsletter.limit).toBe(3);
      expect(RATE_LIMITS.newsletter.windowSeconds).toBe(3600);
    });
  });
});
