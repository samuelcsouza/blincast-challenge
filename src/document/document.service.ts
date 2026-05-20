import { Injectable } from '@nestjs/common';
import {
  DocumentErrorCode,
  type DocumentActionResponse,
  type DocumentGetResponse,
  errorGetResponse,
  errorResponse,
  okGetResponse,
  okResponse,
} from './document-error-codes.js';
import type { DocumentActionDto } from './dto/document-action.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

const VALID_ACTIONS = new Set(['create', 'update', 'delete']);

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async handleAction(dto: DocumentActionDto): Promise<DocumentActionResponse> {
    const validationError = this.validateActionPayload(dto);
    if (validationError !== null) {
      return validationError;
    }

    switch (dto.action) {
      case 'create':
        return this.create(dto.key, dto.value!);
      case 'update':
        return this.update(dto.key, dto.value!);
      case 'delete':
        return this.delete(dto.key);
    }
  }

  async findByKey(key: string): Promise<DocumentGetResponse> {
    const trimmedKey = key?.trim();
    if (!trimmedKey) {
      return errorGetResponse(DocumentErrorCode.INVALID_PAYLOAD);
    }

    const document = await this.prisma.document.findUnique({
      where: { key: trimmedKey },
    });

    if (!document) {
      return errorGetResponse(DocumentErrorCode.KEY_NOT_FOUND);
    }

    return okGetResponse(document.value);
  }

  private validateActionPayload(
    dto: DocumentActionDto,
  ): DocumentActionResponse | null {
    if (!dto || typeof dto !== 'object') {
      return errorResponse(DocumentErrorCode.INVALID_PAYLOAD);
    }

    if (!VALID_ACTIONS.has(dto.action)) {
      return errorResponse(DocumentErrorCode.INVALID_PAYLOAD);
    }

    const key = dto.key?.trim();
    if (!key) {
      return errorResponse(DocumentErrorCode.INVALID_PAYLOAD);
    }

    if (dto.action === 'create' || dto.action === 'update') {
      if (typeof dto.value !== 'string' || dto.value.trim() === '') {
        return errorResponse(DocumentErrorCode.INVALID_PAYLOAD);
      }
    }

    return null;
  }

  private async create(
    key: string,
    value: string,
  ): Promise<DocumentActionResponse> {
    const trimmedKey = key.trim();
    const trimmedValue = value.trim();

    const existing = await this.prisma.document.findUnique({
      where: { key: trimmedKey },
    });

    if (existing) {
      return errorResponse(DocumentErrorCode.KEY_ALREADY_EXISTS);
    }

    try {
      await this.prisma.document.create({
        data: { key: trimmedKey, value: trimmedValue },
      });
      return okResponse();
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        return errorResponse(DocumentErrorCode.KEY_ALREADY_EXISTS);
      }
      throw error;
    }
  }

  private async update(
    key: string,
    value: string,
  ): Promise<DocumentActionResponse> {
    const trimmedKey = key.trim();
    const trimmedValue = value.trim();

    const existing = await this.prisma.document.findUnique({
      where: { key: trimmedKey },
    });

    if (!existing) {
      return errorResponse(DocumentErrorCode.KEY_NOT_FOUND);
    }

    await this.prisma.document.update({
      where: { key: trimmedKey },
      data: { value: trimmedValue },
    });

    return okResponse();
  }

  private async delete(key: string): Promise<DocumentActionResponse> {
    const trimmedKey = key.trim();

    const existing = await this.prisma.document.findUnique({
      where: { key: trimmedKey },
    });

    if (!existing) {
      return errorResponse(DocumentErrorCode.KEY_NOT_FOUND);
    }

    await this.prisma.document.delete({
      where: { key: trimmedKey },
    });

    return okResponse();
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    );
  }
}
