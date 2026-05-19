export type DocumentActionType = 'create' | 'update' | 'delete';

export interface DocumentActionDto {
  action: DocumentActionType;
  key: string;
  value?: string;
}
