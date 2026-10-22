import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Read the actual inline catalog without loading the page or its browser dependencies.
const source = readFileSync(new URL('./Index.tsx', import.meta.url), 'utf8');
const match = source.match(/const services = (\[[\s\S]*?\n\]);/);
if (!match) throw new Error('Services catalog not found');
const services = runInNewContext(match[1]);

describe('Services offers', () => {
  test('Launch Package retains its $1,000 reference price and is free for early adopters', () => {
    const core = services.find((service) => service.eyebrow === 'LAUNCH PACKAGE');
    expect(core?.price).toBe('$1,000 PER ENGAGEMENT');
    expect(core?.badge).toBe('FREE FOR EARLY ADOPTERS');
  });

  test('Add-on remains $500 per engagement without an early-adopter offer', () => {
    const value = services.find((service) => service.eyebrow === 'ADD-ON');
    expect(value?.price).toBe('$500 PER ENGAGEMENT');
    expect(value?.badge).toBeUndefined();
    expect(value?.eligibility).toBeUndefined();
  });

  test('Launch Package states early-adopter eligibility with no dates or counts', () => {
    const core = services.find((service) => service.eyebrow === 'LAUNCH PACKAGE');
    expect(core?.eligibility).toBe("For teams who join the myaiCRO Early Adopter Wave, until it's full.");
    expect(core?.eligibility).not.toMatch(/\d/);
  });
});