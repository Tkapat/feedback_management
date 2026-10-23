export const getPagination = (q: { page?: unknown; limit?: unknown }) => {
  const page = Math.max(parseInt(String(q.page)) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(q.limit)) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};