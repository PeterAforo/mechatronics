import { logger, createLogger, startTimer } from '@/lib/logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logger methods', () => {
    it('should have info method', () => {
      expect(typeof logger.info).toBe('function');
    });

    it('should have debug method', () => {
      expect(typeof logger.debug).toBe('function');
    });

    it('should have warn method', () => {
      expect(typeof logger.warn).toBe('function');
    });

    it('should have error method', () => {
      expect(typeof logger.error).toBe('function');
    });

    it('should log info messages', () => {
      logger.info('Test message');
      expect(console.info).toHaveBeenCalled();
    });

    it('should log with context', () => {
      logger.info('Test message', { userId: '123' });
      expect(console.info).toHaveBeenCalled();
    });
  });

  describe('createLogger', () => {
    it('should create a logger with base context', () => {
      const customLogger = createLogger({ requestId: 'req-123' });
      
      expect(typeof customLogger.info).toBe('function');
      expect(typeof customLogger.debug).toBe('function');
      expect(typeof customLogger.warn).toBe('function');
      expect(typeof customLogger.error).toBe('function');
    });

    it('should merge base context with call context', () => {
      const customLogger = createLogger({ requestId: 'req-123' });
      customLogger.info('Test', { action: 'test' });
      expect(console.info).toHaveBeenCalled();
    });
  });

  describe('startTimer', () => {
    it('should return a function', () => {
      const timer = startTimer();
      expect(typeof timer).toBe('function');
    });

    it('should return elapsed time in milliseconds', async () => {
      const timer = startTimer();
      
      // Wait a small amount
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const elapsed = timer();
      expect(typeof elapsed).toBe('number');
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });
  });
});
