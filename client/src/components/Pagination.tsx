interface PaginationProps {
  disabled: boolean;
  page: number;
  totalPages: number | null;
  onPageChange: (page: number) => void;
}

export default function Pagination({ disabled, page, totalPages, onPageChange }: PaginationProps) {
  const hasNextPage = totalPages !== null && page < totalPages;
  const totalLabel = totalPages === null ? '' : ` of ${totalPages}`;

  return (
    <nav className="pagination" aria-label="Search result pages">
      <button
        type="button"
        aria-label={page > 1 ? `Previous page, page ${page - 1}` : 'Previous page'}
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span aria-current="page">
        Page {page}
        {totalLabel}
      </span>
      <button
        type="button"
        aria-label={hasNextPage ? `Next page, page ${page + 1}` : 'Next page'}
        disabled={disabled || !hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
