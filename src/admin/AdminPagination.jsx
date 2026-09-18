import React from 'react';

export default function AdminPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;
  return (
    <div className="mmc-admin-pagination">
      <span>Page {page} of {totalPages} ({total} total)</span>
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Previous</button>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Next</button>
    </div>
  );
}
