import { describe, it, expect } from 'vitest';
import { matchesTemperature } from './temperatureFilter';
import { Lead } from '../types';

function makeLead(temperatura?: Lead['temperatura']): Lead {
  return {
    id: '1',
    name: 'Test',
    avatar: '',
    car: '',
    carImage: '',
    price: 0,
    stage: 'novo_lead',
    status: 'Novo Lead',
    timeAgo: '',
    statusUpdatedAt: '',
    temperatura,
  };
}

describe('matchesTemperature', () => {
  it('returns true when filter is empty (no filter active)', () => {
    expect(matchesTemperature(makeLead('quente'), '')).toBe(true);
    expect(matchesTemperature(makeLead(), '')).toBe(true);
  });

  it('matches when lead temperature equals filter', () => {
    expect(matchesTemperature(makeLead('quente'), 'quente')).toBe(true);
    expect(matchesTemperature(makeLead('frio'), 'frio')).toBe(true);
  });

  it('does not match when lead temperature differs from filter', () => {
    expect(matchesTemperature(makeLead('quente'), 'frio')).toBe(false);
    expect(matchesTemperature(makeLead('frio'), 'quente')).toBe(false);
  });

  it('treats undefined temperatura as "morno" (matches card render default)', () => {
    expect(matchesTemperature(makeLead(), 'morno')).toBe(true);
    expect(matchesTemperature(makeLead(), 'quente')).toBe(false);
    expect(matchesTemperature(makeLead(), 'frio')).toBe(false);
  });

  it('is case-insensitive on both sides', () => {
    expect(matchesTemperature(makeLead('quente'), 'QUENTE')).toBe(true);
    expect(matchesTemperature(makeLead('Quente' as any), 'quente')).toBe(true);
  });

  // Regression guard: the previous implementation read `lead.negotiation?.importance`,
  // but the adapter flattens that into `lead.temperatura`. This test ensures the
  // filter operates on the field that's actually present after the adapter runs.
  it('reads from lead.temperatura (not from a nested negotiation object)', () => {
    const lead = makeLead('quente');
    // Simulate a Lead that has no `negotiation` field but has `temperatura` set
    // (which is exactly what the adapter produces).
    expect(matchesTemperature(lead, 'quente')).toBe(true);
  });
});
