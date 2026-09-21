export interface ApiSuccess<T> {
  data: T;
  message?: string;
  meta?: { total: number };
}

export interface ApiFailure {
  message: string;
  issues?: Record<string, string[]>;
}
