import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArcadeStage } from '../src/components/ArcadeStage';

describe('ArcadeStage Component', () => {
  it('renders start screen with title and start rush button', () => {
    render(<ArcadeStage />);

    expect(screen.getByTestId('start-screen')).toBeInTheDocument();
    expect(screen.getByText(/finger fever/i)).toBeInTheDocument();

    const startBtn = screen.getByTestId('start-game-button');
    expect(startBtn).toBeInTheDocument();

    // Start game
    fireEvent.click(startBtn);

    // Start overlay hides and stage is active
    expect(screen.queryByTestId('start-screen')).not.toBeInTheDocument();
    expect(screen.getByTestId('arcade-stage')).toBeInTheDocument();
  });
});
