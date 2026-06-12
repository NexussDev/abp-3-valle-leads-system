import { Lead } from '../types';

const DEFAULT_TEMPERATURE = 'morno';

/**
 * Checks if a lead matches a temperature filter.
 *
 * Leads without an explicit temperature default to 'morno' to stay consistent
 * with the card rendering — leaving them unmatchable would hide leads the
 * user can clearly see on screen.
 *
 * An empty filter matches everything (used as "no filter active").
 */
export function matchesTemperature(lead: Lead, filter: string): boolean {
  if (!filter) return true;
  const leadTemp = (lead.temperatura || DEFAULT_TEMPERATURE).toLowerCase();
  return leadTemp === filter.toLowerCase();
}
