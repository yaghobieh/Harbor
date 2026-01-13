// User DTOs
export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: 'user' | 'admin' | 'moderator';
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  role?: 'user' | 'admin' | 'moderator';
  isActive?: boolean;
  profile?: {
    avatar?: string;
    bio?: string;
  };
}

// Pagination
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Request with user (for auth)
export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

