import { describe, expect, it } from 'vitest';
import { parseLastMerge } from '../scripts/last-merge.mjs';

describe('parseLastMerge', () => {
  it('reads a merge commit', () => {
    expect(parseLastMerge('Merge pull request #21 from someone/moon', '\nAdd a rising moon\n')).toEqual({ number: 21, title: 'Add a rising moon' });
  });

  it('reads a squash merge', () => {
    expect(parseLastMerge('Add a rising moon (#21)')).toEqual({ number: 21, title: 'Add a rising moon' });
  });

  it('falls back to the plain subject', () => {
    expect(parseLastMerge('Initial city')).toEqual({ number: null, title: 'Initial city' });
  });
});
