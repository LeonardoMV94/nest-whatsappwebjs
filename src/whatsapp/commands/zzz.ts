import { Message } from 'whatsapp-web.js';

export const command = {
  name: '!zzz',
  description: 'Envía un video de yt',
  execute: async (msg: Message) => {
    await msg.reply('https://youtu.be/uRwF1x5EOo0');
  },
};
