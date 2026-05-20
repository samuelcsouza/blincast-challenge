export const DocumentErrorCode = {
  OK: 0,
  INVALID_PAYLOAD: 400,
  KEY_ALREADY_EXISTS: 409,
  KEY_NOT_FOUND: 404,
} as const;

export type DocumentErrorCodeValue =
  (typeof DocumentErrorCode)[keyof typeof DocumentErrorCode];

export type DocumentStatus = 'ok' | 'error';

export interface DocumentActionResponse {
  status: DocumentStatus;
  code: number;
}

export interface DocumentGetResponse extends DocumentActionResponse {
  value?: string;
}

export function okResponse(): DocumentActionResponse {
  return { status: 'ok', code: DocumentErrorCode.OK };
}

export function errorResponse(code: DocumentErrorCodeValue): DocumentActionResponse {
  return { status: 'error', code };
}

export function okGetResponse(value: string): DocumentGetResponse {
  return { status: 'ok', code: DocumentErrorCode.OK, value };
}

export function errorGetResponse(
  code: DocumentErrorCodeValue,
): DocumentGetResponse {
  return { status: 'error', code };
}
