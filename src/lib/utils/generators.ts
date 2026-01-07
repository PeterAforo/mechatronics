/**
 * Generate a unique serial number based on device type code
 * Format: {TYPE_CODE}-{YEAR}-{SEQUENCE}
 * Example: WAT-2026-0001
 */
export function generateSerialNumber(typeCode: string, sequence: number): string {
  const year = new Date().getFullYear();
  const seq = sequence.toString().padStart(4, "0");
  return `${typeCode}-${year}-${seq}`;
}

/**
 * Generate a random IMEI number (15 digits)
 * Note: This generates a valid-looking IMEI but not a real one
 */
export function generateIMEI(): string {
  // TAC (Type Allocation Code) - 8 digits, using a placeholder
  const tac = "35847210";
  // Serial number - 6 random digits
  const serial = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  // Calculate Luhn check digit
  const partial = tac + serial;
  const checkDigit = calculateLuhnCheckDigit(partial);
  return partial + checkDigit;
}

/**
 * Calculate Luhn check digit for IMEI
 */
function calculateLuhnCheckDigit(partial: string): string {
  let sum = 0;
  for (let i = 0; i < partial.length; i++) {
    let digit = parseInt(partial[i], 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return ((10 - (sum % 10)) % 10).toString();
}

/**
 * Generate a random SIM number (ICCID format - 19-20 digits)
 */
export function generateSIMNumber(): string {
  // Major Industry Identifier (89 for telecom)
  const mii = "89";
  // Country code (233 for Ghana)
  const countryCode = "233";
  // Issuer identifier (random 2 digits)
  const issuer = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  // Individual account identification (random 12 digits)
  const account = Math.floor(Math.random() * 1000000000000).toString().padStart(12, "0");
  // Check digit
  const partial = mii + countryCode + issuer + account;
  const checkDigit = calculateLuhnCheckDigit(partial);
  return partial + checkDigit;
}

/**
 * Generate a unique order reference
 * Format: ORD-{TIMESTAMP}-{RANDOM}
 */
export function generateOrderRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Generate a unique tenant code
 * Format: TEN-{RANDOM}
 */
export function generateTenantCode(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TEN-${random}`;
}
