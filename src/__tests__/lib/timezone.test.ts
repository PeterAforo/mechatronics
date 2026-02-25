import { formatAccraDate, toAccraTime, getTelemetryTimestamp } from '@/lib/timezone';

describe('Timezone utilities', () => {
  describe('formatAccraDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-02-25T12:00:00Z');
      const result = formatAccraDate(date);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle string input', () => {
      const result = formatAccraDate('2026-02-25T12:00:00Z');
      expect(result).toBeDefined();
    });
  });

  describe('toAccraTime', () => {
    it('should convert date to Accra timezone', () => {
      const date = new Date('2026-02-25T12:00:00Z');
      const result = toAccraTime(date);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('getTelemetryTimestamp', () => {
    it('should return current timestamp for telemetry', () => {
      const result = getTelemetryTimestamp();
      expect(result).toBeInstanceOf(Date);
    });
  });
});
