import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColumnLimit } from './useColumnLimit';

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
  window.dispatchEvent(new Event('resize'));
}

describe('useColumnLimit', () => {
  const originalW = window.innerWidth;
  const originalH = window.innerHeight;

  beforeEach(() => {
    setViewport(originalW, originalH);
  });

  afterEach(() => {
    setViewport(originalW, originalH);
  });

  it('em mobile (≤ 640px) retorna o mínimo hard (2)', () => {
    setViewport(375, 800);
    const { result } = renderHook(() => useColumnLimit());
    expect(result.current).toBe(2);
  });

  it('em 1080p desktop cabem ~4 cards de 170px após chrome de 280px', () => {
    setViewport(1920, 1080);
    const { result } = renderHook(() => useColumnLimit());
    // (1080 - 280) / 170 = 4.7 → 4
    expect(result.current).toBe(4);
  });

  it('em laptop 13" (720p) cabem ~2 cards', () => {
    setViewport(1366, 720);
    const { result } = renderHook(() => useColumnLimit());
    // (720 - 280) / 170 = 2.58 → 2
    expect(result.current).toBe(2);
  });

  it('em XL desktop (1440p+) cabem ~6 cards', () => {
    setViewport(2560, 1440);
    const { result } = renderHook(() => useColumnLimit());
    // (1440 - 280) / 170 = 6.8 → 6
    expect(result.current).toBe(6);
  });

  it('nunca cai abaixo do mínimo (2), mesmo em viewport muito curto', () => {
    setViewport(1200, 400);
    const { result } = renderHook(() => useColumnLimit());
    expect(result.current).toBe(2);
  });

  it('reage a resize do viewport', () => {
    setViewport(1920, 1080);
    const { result } = renderHook(() => useColumnLimit());
    expect(result.current).toBe(4);

    act(() => setViewport(1920, 720));
    expect(result.current).toBe(2);

    act(() => setViewport(375, 800));
    expect(result.current).toBe(2);
  });
});
