import { renderHook, act } from '@testing-library/react';
import { useLocalization, LocalizationProvider } from './useLocalization';
import React from 'react';

// Mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
    removeItem(key: string) {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalization', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('throws an error when used outside of LocalizationProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useLocalization())).toThrow('useLocalization must be used within a LocalizationProvider');

    consoleSpy.mockRestore();
  });

  it('returns context when used within LocalizationProvider', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocalizationProvider>{children}</LocalizationProvider>
    );

    let result: any;
    await act(async () => {
      const renderResult = renderHook(() => useLocalization(), { wrapper });
      result = renderResult.result;
    });

    expect(result.current).toBeDefined();
    expect(result.current.language).toBe('en');
    expect(typeof result.current.setLanguage).toBe('function');
    expect(typeof result.current.t).toBe('function');
  });
});
