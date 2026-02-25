import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional');
    expect(result).toContain('base');
    expect(result).toContain('conditional');
  });

  it('should filter out falsy values', () => {
    const result = cn('base', false && 'hidden', undefined, null);
    expect(result).toBe('base');
  });

  it('should merge Tailwind classes correctly', () => {
    const result = cn('px-4 py-2', 'px-6');
    expect(result).toContain('px-6');
    expect(result).toContain('py-2');
  });
});
