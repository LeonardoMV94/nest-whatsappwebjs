import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { join } from 'node:path';
import { loadCommands } from './commands';
import { CommandHandler } from './types/CommandHandler';
import { ContactWS } from './entities/contact.entity';

@Injectable()
export class WhatsappService implements OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private client: Client;
  private isReady = false;
  private commands = new Map<string, CommandHandler>();

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.client = new Client({
      puppeteer: {
        headless: true,
        args: ['--no-sandbox'],
      },
      authStrategy: new LocalAuth({
        clientId: 'personal',
        dataPath: join(process.cwd(), '.ws-data'),
      }),
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.client.on('qr', (qr) => {
      this.logger.log('QR RECEIVED', qr);
      this.eventEmitter.emit('whatsapp.qr', qr);
    });

    this.client.on('authenticated', () => {
      this.logger.log('Client authenticated!');
      this.eventEmitter.emit('whatsapp.authenticated', true);
    });

    this.client.once('ready', () => {
      this.logger.log('Client is ready!');
      this.isReady = true;
      this.eventEmitter.emit('whatsapp.ready', true);
    });

    this.client.on('disconnected', (reason) => {
      this.logger.error('Client disconnected', reason);
      this.eventEmitter.emit('whatsapp.disconnected', reason);
      this.reconnect().then().catch();
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.client.on('message', async (msg) => {
      await this.onMessage(msg);
    });
  }

  async initialize(): Promise<void> {
    this.logger.log('Initializing WhatsApp Client...');
    await this.client.initialize();
    this.commands = await loadCommands();
  }

  async getContacts(): Promise<ContactWS[]> {
    if (!this.isReady) {
      this.logger.warn('Client is not ready. Waiting...');
      await this.waitForReady();
    }

    const contacts = await this.client.getContacts();
    const contactsJson: ContactWS[] = contacts.map((c) => {
      return {
        id: c.id.user,
        name: c.name,
        number: c.number,
        isBusiness: c.isBusiness,
        shortName: c.shortName,
      } satisfies ContactWS;
    });

    return contactsJson;
  }

  async getGroups(): Promise<string[]> {
    if (!this.isReady) {
      this.logger.warn('Client is not ready. Waiting...');
      await this.waitForReady();
    }

    const chats = await this.client.getChats();
    const groups = chats.filter((chat) => chat.isGroup);
    return groups.map((group) => group.name);
  }

  private async onMessage(msg: Message) {
    const [command, ...args] = msg.body.trim().split(/\s+/);
    const handler = this.commands.get(command.toLowerCase());
    this.logger.log(
      `Command received: ${msg.author} | ${msg.from} | ${command}`,
    );
    if (handler) {
      await handler(msg, args);
    }
  }

  async sendMessage(number: string, message: string): Promise<boolean | null> {
    if (!this.isReady) {
      this.logger.warn('Client is not ready. Waiting...');
      await this.waitForReady();
    }

    const formattedNumber = this.formatPhoneNumber(number);
    if (!formattedNumber) {
      this.logger.warn(`Invalid number: ${number}`);
      return null;
    }

    try {
      await this.client.sendMessage(formattedNumber, message);
      this.logger.log(`Message sent to ${formattedNumber}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending message to ${formattedNumber}`, error);
      return false;
    }
  }

  private async waitForReady(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.isReady) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  private formatPhoneNumber(number: string): string | null {
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.length >= 10) {
      return `${cleanNumber}@c.us`;
    }
    return null;
  }

  async onModuleDestroy() {
    await this.client.destroy();
  }

  private async reconnect() {
    this.isReady = false;
    this.logger.log('Reconnecting WhatsApp client...');
    await this.initialize();
  }
}
