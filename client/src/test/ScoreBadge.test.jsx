import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import ScoreBadge from '../components/ScoreBadge';

describe('ScoreBadge Component', () => {
  it('renders score, evidence count, and difficulty correctly', () => {
    const score = { totalScore: 145 };
    render(
      <ScoreBadge
        score={score}
        cluesCount={7}
        discoveredCount={3}
        hintsUsed={1}
        difficulty="medium"
      />
    );

    // Score ticker
    expect(screen.getByText('145')).toBeInTheDocument();
    // Evidence found count
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('/ 7')).toBeInTheDocument();
    // Hints count
    expect(screen.getByText('1')).toBeInTheDocument();
    // Progress calculation 3/7 = 43%
    expect(screen.getByText('43%')).toBeInTheDocument();
  });
});
