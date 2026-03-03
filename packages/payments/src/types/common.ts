// ----- Generic API Response -----
export interface ApiResponse<T> {
  msg: string;
  data: T;
}
