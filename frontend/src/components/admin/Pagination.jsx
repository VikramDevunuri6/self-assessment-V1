export default function Pagination({ pagination, onPageChange }) {
  if (!pagination) return null;

  const { page, totalPages, total } = pagination;

  return (
    <div className="admin-pagination">
      <span>
        Page {page} of {Math.max(totalPages, 1)} &middot; {total} total
      </span>
      <div className="admin-pagination-controls">
        <button
          type="button"
          className="admin-btn admin-btn--sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
