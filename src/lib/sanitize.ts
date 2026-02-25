/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user input and prevent XSS attacks
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Strip HTML tags from string
 */
export function stripHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize string for safe display (escape HTML + trim)
 */
export function sanitizeString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return escapeHtml(str.trim());
}

/**
 * Sanitize object values recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return null;
  
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) return null;
  
  return trimmed;
}

/**
 * Sanitize phone number (keep only digits and +)
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^\d+\-\s()]/g, '').trim();
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const trimmed = url.trim();
  
  // Only allow http, https, and relative URLs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  
  // Block javascript:, data:, etc.
  return null;
}

/**
 * Sanitize filename (remove path traversal attempts)
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return '';
  
  return filename
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid chars
    .trim();
}

/**
 * Limit string length
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength);
}

/**
 * Sanitize SQL-like input (basic protection, use parameterized queries)
 */
export function sanitizeSqlInput(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  // Remove common SQL injection patterns
  return str
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}
