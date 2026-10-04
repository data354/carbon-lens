export type ActionResponse<T = any> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export interface WithTimestamp {
  createdAt: Date;
  updatedAt: Date;
}
