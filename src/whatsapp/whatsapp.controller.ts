import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import * as QRCode from 'qrcode';
import { Response } from 'express';
import { WhatsappStateService } from './whatsapp-state.service';
import { ResponseCountDto } from './dto/response.dto';
import { ContactWS } from './entities/contact.entity';

@Controller('bot')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);
  private qrCode: string | null;

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly whatsappStateService: WhatsappStateService,
  ) {}

  @Get('qr/:format')
  async getQrCode(@Res() response: Response, @Param('format') format: string) {
    // Obtener QR desde el servicio
    this.qrCode = this.whatsappStateService.getQrCode();

    // Verificar si QR Code está disponible
    if (!this.qrCode) {
      this.logger.log('QR Code no encontrado');
      throw new UnauthorizedException('QR Code not found');
    }

    // Formato base64
    if (format === 'base64') {
      return response.json({ qrCode: this.qrCode });
    }

    // Formato SVG
    if (format === 'svg') {
      await QRCode.toFileStream(response, this.qrCode);
      return; // Retorna una respuesta con el flujo SVG
    }

    // Si el formato no es válido
    throw new UnauthorizedException('Invalid format');
  }

  @Get('contacts')
  async getContacts() {
    const contacts = await this.whatsappService.getContacts();
    return new ResponseCountDto<ContactWS>(contacts);
  }

  @Get('groups')
  async getGroups() {
    const groups = await this.whatsappService.getGroups();
    return new ResponseCountDto<string>(groups);
  }

  @Post('send-message')
  async sendMessage(@Body() body: { numberDes: string; message: string }) {
    // const isReady = this.whatsappStateService.getReady();
    // this.logger.log(`sendMessage: isReady: ${isReady}`);

    // if (!isReady) throw new UnauthorizedException('WS is not ready');

    const isSend = await this.whatsappService.sendMessage(
      body.numberDes,
      body.message,
    );
    return { state: isSend };
  }
}
