import {
  escapeHtml,
  stripHtml,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeFilename,
  truncate,
} from '@/lib/sanitize';

describe('Sanitization utilities', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle normal text', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<p>Hello <b>World</b></p>')).toBe('Hello World');
    });

    it('should handle empty string', () => {
      expect(stripHtml('')).toBe('');
    });
  });

  describe('sanitizeString', () => {
    it('should escape and trim', () => {
      expect(sanitizeString('  <script>  ')).toBe('&lt;script&gt;');
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and lowercase email', () => {
      expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com');
    });

    it('should return null for invalid email', () => {
      expect(sanitizeEmail('invalid-email')).toBeNull();
      expect(sanitizeEmail('@domain.com')).toBeNull();
    });

    it('should handle empty input', () => {
      expect(sanitizeEmail('')).toBeNull();
    });
  });

  describe('sanitizePhone', () => {
    it('should keep only valid phone characters', () => {
      expect(sanitizePhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
    });

    it('should remove invalid characters', () => {
      expect(sanitizePhone('555-ABC-1234')).toBe('555--1234');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should allow http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should allow relative URLs', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    });

    it('should block javascript URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    });

    it('should block data URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path traversal', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd');
    });

    it('should remove invalid characters', () => {
      expect(sanitizeFilename('file<name>.txt')).toBe('filename.txt');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 5)).toBe('Hello');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Hi', 10)).toBe('Hi');
    });
  });
});
