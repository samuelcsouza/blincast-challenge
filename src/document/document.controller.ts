import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { DocumentService } from './document.service.js';
import type { DocumentActionDto } from './dto/document-action.dto.js';
import type {
  DocumentActionResponse,
  DocumentGetResponse,
} from './document-error-codes.js';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @HttpCode(200)
  async handleAction(
    @Body() body: DocumentActionDto,
  ): Promise<DocumentActionResponse> {
    return this.documentService.handleAction(body);
  }

  @Get(':key')
  @HttpCode(200)
  async getByKey(@Param('key') key: string): Promise<DocumentGetResponse> {
    return this.documentService.findByKey(key);
  }
}
