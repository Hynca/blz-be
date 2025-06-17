export interface PaginatedResult<T> {
  count: number;
  rows: T[];
}

export interface TableResponse<T> {
  items: T[];
  pagination: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
  };
  sort: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface JwtPayload {
  userId: number;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
