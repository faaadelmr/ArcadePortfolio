import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge basic class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should merge Tailwind CSS classes properly', () => {
    // tailwind-merge resolves conflicts
    expect(cn('p-4 text-red-500', 'p-8')).toBe('text-red-500 p-8');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    expect(cn('flex flex-col', 'flex-row')).toBe('flex flex-row');
  });

  it('should handle conditional classes (clsx)', () => {
    expect(cn('base-class', { 'active-class': true, 'inactive-class': false })).toBe('base-class active-class');
    const isTrue = true;
    expect(cn('base', isTrue && 'truthy-class')).toBe('base truthy-class');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should handle null, undefined, and false values gracefully', () => {
    expect(cn('class1', null, undefined, false, 'class2')).toBe('class1 class2');
  });

  it('should handle complex combinations', () => {
    expect(cn(
      'base-class',
      ['array-class1', 'array-class2'],
      { 'obj-true': true, 'obj-false': false },
      'p-4 bg-red-500',
      'p-8' // overrides p-4
    )).toBe('base-class array-class1 array-class2 obj-true bg-red-500 p-8');
  });
});
