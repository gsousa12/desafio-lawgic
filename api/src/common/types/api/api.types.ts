export type Meta = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T | T[];
  meta?: Meta;
}

export type SingleItem<T> = T;
export type MultipleItems<T> = T[];

export type JwtPayload = {
  userId: string;
  name: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};
