import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('does not render page controls when there are no result pages', () => {
    render(<Pagination disabled={false} page={1} totalPages={0} onPageChange={vi.fn()} />);

    expect(
      screen.queryByRole('navigation', { name: 'Search result pages' }),
    ).not.toBeInTheDocument();
  });
});
