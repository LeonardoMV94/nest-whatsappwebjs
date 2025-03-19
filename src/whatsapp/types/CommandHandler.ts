import { Message } from 'whatsapp-web.js';

export type CommandHandler = (msg: Message, args: string[]) => Promise<void>;