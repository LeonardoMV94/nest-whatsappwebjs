import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappStateService {
  private readonly logger = new Logger(WhatsappStateService.name);
  private isAuthenticated = false;
  private qrCode: string | null = null;
  private ready = false;

  setReady(state: boolean) {
    this.logger.log(`setReady: ${state}`);
    this.ready = state;
  }

  getReady(): boolean {
    return this.ready;
  }

  setAuthenticated(state: boolean) {
    this.logger.log(`setAuthenticated: ${state}`);
    this.isAuthenticated = state;
  }

  getAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  setQrCode(qr: string) {
    this.qrCode = qr;
  }

  getQrCode(): string | null {
    return this.qrCode;
  }
}
