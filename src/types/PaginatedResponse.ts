export type PaginatedResponse<T> = {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  totalCount: number;
};
