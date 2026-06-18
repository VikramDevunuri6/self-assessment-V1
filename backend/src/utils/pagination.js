const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePagination(query = {}) {
  const page = Math.max(1, Math.trunc(Number(query.page)) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(Number(query.pageSize)) || DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { page, pageSize, from, to };
}

function buildPaginationMeta({ page, pageSize }, total) {
  return { page, pageSize, total: total ?? 0, totalPages: Math.ceil((total ?? 0) / pageSize) };
}

module.exports = { parsePagination, buildPaginationMeta };
