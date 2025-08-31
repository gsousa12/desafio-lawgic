export type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T | T[];
  meta?: Meta;
};

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
