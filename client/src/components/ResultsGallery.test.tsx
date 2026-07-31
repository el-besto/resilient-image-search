import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Photo } from '../lib/types';
import ResultsGallery from './ResultsGallery';

const photo: Photo = {
  id: 'cat-1',
  contentDescription: 'a cat on a wall',
  width: 1200,
  height: 800,
  thumbUrl: 'https://images.example/cat-small.jpg',
  fullUrl: 'https://images.example/cat-regular.jpg',
  attribution: {
    creatorName: 'Ada L.',
    creatorUrl: 'https://unsplash.com/@ada',
    sourceName: 'Unsplash',
    sourceUrl: 'https://unsplash.com/',
  },
};

describe('ResultsGallery', () => {
  it('opens a larger image in a separate tab without replacing the search page', () => {
    render(<ResultsGallery photos={[photo]} />);

    const largerImageLink = screen.getByRole('link', {
      name: 'View larger image: a cat on a wall (opens in a new tab)',
    });

    expect(largerImageLink).toHaveAttribute('href', photo.fullUrl);
    expect(largerImageLink).toHaveAttribute('target', '_blank');
    expect(largerImageLink).toHaveAttribute('rel', 'noopener');
  });
});
