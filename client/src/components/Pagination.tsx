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
      <button type="button" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span aria-current="page">
        Page {page}
        {totalLabel}
      </span>
      <button
        type="button"
        disabled={disabled || !hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
