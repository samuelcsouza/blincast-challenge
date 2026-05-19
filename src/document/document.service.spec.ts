import { Test, TestingModule } from '@nestjs/testing';
import { DocumentErrorCode } from './document-error-codes.js';
import { DocumentService } from './document.service.js';

jest.mock('../prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../prisma/prisma.service.js';

describe('DocumentService', () => {
  let service: DocumentService;
  let prisma: {
    document: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      document: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(DocumentService);
  });

  describe('handleAction', () => {
    it('returns error for invalid action', async () => {
      const result = await service.handleAction({
        action: 'invalid' as 'create',
        key: 'foo',
        value: 'bar',
      });

      expect(result).toEqual({
        status: 'error',
        code: DocumentErrorCode.INVALID_PAYLOAD,
      });
    });

    it('returns error when key is empty', async () => {
      const result = await service.handleAction({
        action: 'create',
        key: '   ',
        value: 'bar',
      });

      expect(result).toEqual({
        status: 'error',
        code: DocumentErrorCode.INVALID_PAYLOAD,
      });
    });

    it('returns error when value is missing on create', async () => {
      const result = await service.handleAction({
        action: 'create',
        key: 'foo',
      });

      expect(result).toEqual({
        status: 'error',
        code: DocumentErrorCode.INVALID_PAYLOAD,
      });
    });

    it('creates document successfully', async () => {
      prisma.document.findUnique.mockResolvedValue(null);
      prisma.document.create.mockResolvedValue({
        id: '1',
        key: 'foo',
        value: 'bar',
      });

      const result = await service.handleAction({
        action: 'create',
        key: 'foo',
        value: 'bar',
      });

      expect(result).toEqual({ status: 'ok', code: DocumentErrorCode.OK });
      expect(prisma.document.create).toHaveBeenCalledWith({
        data: { key: 'foo', value: 'bar' },
      });
    });

    it('returns error when key already exists on create', async () => {
      prisma.document.findUnique.mockResolvedValue({
        id: '1',
        key: 'foo',
        value: 'bar',
      });

      const result = await service.handleAction({
        action: 'create',
        key: 'foo',
        value: 'baz',
      });

      expect(result).toEqual({
        status: 'error',
        code: DocumentErrorCode.KEY_ALREADY_EXISTS,
      });
    });

    it('updates document successfully', async () => {
      prisma.document.findUnique.mockResolvedValue({
        id: '1',
        key: 'foo',
        value: 'bar',
      });
      prisma.document.update.mockResolvedValue({
        id: '1',
        key: 'foo',
        value: 'baz',
      });

      const result = await service.handleAction({
        action: 'update',
        key: 'foo',
        value: 'baz',
      });

      expect(result).toEqual({ status: 'ok', code: DocumentErrorCode.OK });
      expect(prisma.document.update).toHaveBeenCalledWith({
        where: { key: 'foo' },
        data: { value: 'baz' },
      });
    });

    it('returns error when key not found on update', async () => {
      prisma.document.findUnique.mockResolvedValue(null);

      const result = await service.handleAction({
        action: 'update',
        key: 'missing',
        value: 'baz',
      });

      expect(result).toEqual({
        status: 'error',
        code: DocumentErrorCode.KEY_NOT_FOUND,
      });
    });

    it('deletes document successfully', async () => {
      prisma.document.findUnique.mockResolvedValue({
        id: '1',
        key: 'foo',
        value: 'bar',
      });
      prisma.document.delete.mockResolvedValue({
        id: '1',
        key: 'foo',
        value: 'bar',
      });

      const result = await service.handleAction({
        action: 'delete',
        key: 'foo',
      });

      expect(result).toEqual({ status: 'ok', code: DocumentErrorCode.OK });
      expect(prisma.document.delete).toHaveBeenCalledWith({
        where: { key: 'foo' },
      });
    });

    it('returns error when key not found on delete', async () => {
      prisma.document.findUnique.mockResolvedValue(null);

      const result = await service.handleAction({
        action: 'delete',
        key: 'missing',
      });

      expect(result).toEqual({
        status: 'error',
        code: DocumentErrorCode.KEY_NOT_FOUND,
      });
    });
  });

  describe('findByKey', () => {
    it('returns document value when key exists', async () => {
      prisma.document.findUnique.mockResolvedValue({
        id: '1',
        key: 'foo',
        value: 'bar',
      });

      const result = await service.findByKey('foo');

      expect(result).toEqual({ status: 'ok', code: DocumentErrorCode.OK, value: 'bar' });
    });

    it('returns error when key does not exist', async () => {
      prisma.document.findUnique.mockResolvedValue(null);

      const result = await service.findByKey('missing');

      expect(result).toEqual({
        status: 'error',
        code: DocumentErrorCode.KEY_NOT_FOUND,
      });
    });

    it('returns error when key is empty', async () => {
      const result = await service.findByKey('   ');

      expect(result).toEqual({
        status: 'error',
        code: DocumentErrorCode.INVALID_PAYLOAD,
      });
    });
  });
});
