import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WhatsappStateService } from '../whatsapp-state.service';

@Injectable()
export class WhatsappEventService {
  private readonly logger = new Logger(WhatsappEventService.name);

  constructor(private readonly whatsappStateService: WhatsappStateService) {}

  @OnEvent('whatsapp.authenticated')
  handleIsAuthenticatedEvent(payload: boolean) {
    this.logger.log(`Authenticated: ${payload}`);
    this.whatsappStateService.setAuthenticated(payload);
  }

  @OnEvent('whatsapp.ready')
  handleReadyEvent(payload: boolean) {
    this.logger.log(`Ready: ${payload}`);
    this.whatsappStateService.setReady(payload);
  }

  @OnEvent('whatsapp.qr')
  handleQrcodeCreatedEvent(qrCode: string) {
    this.logger.log(`QR Code created handleQrcodeCreatedEvent: ${qrCode}`);
    this.whatsappStateService.setQrCode(qrCode);
  }
}
