import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ClueCard from '../components/ClueCard';

describe('ClueCard Component', () => {
  const undiscoveredClue = {
    id: 'clue_1',
    title: 'Library Fireplace - Unexamined Area',
    location: 'Library Fireplace',
    isDiscovered: false
  };

  const discoveredClue = {
    id: 'clue_1',
    title: 'Shattered Pocket Watch',
    location: 'Library Fireplace',
    description: 'Stopped precisely at 11:42 PM with trace almond odor on crystal.',
    isDiscovered: true,
    discoveredAt: new Date().toISOString()
  };

  it('renders unexamined state with examine button', () => {
    const onDiscover = vi.fn();
    render(<ClueCard clue={undiscoveredClue} onDiscover={onDiscover} />);

    expect(screen.getByText('UNEXAMINED')).toBeInTheDocument();
    expect(screen.getByText('Examine Evidence (+5 Pts)')).toBeInTheDocument();
  });

  it('calls onDiscover when examine button is clicked', async () => {
    const onDiscover = vi.fn();
    render(<ClueCard clue={undiscoveredClue} onDiscover={onDiscover} />);

    const btn = screen.getByText('Examine Evidence (+5 Pts)');
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(onDiscover).toHaveBeenCalledWith('clue_1');
  });

  it('renders discovered state with description and cataloged badge', () => {
    const onDiscover = vi.fn();
    render(<ClueCard clue={discoveredClue} onDiscover={onDiscover} />);

    expect(screen.getByText('CATALOGED (+5 PTS)')).toBeInTheDocument();
    expect(screen.getByText('Shattered Pocket Watch')).toBeInTheDocument();
    expect(screen.getByText(discoveredClue.description)).toBeInTheDocument();
  });
});
