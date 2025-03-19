import { Message, MessageMedia } from 'whatsapp-web.js';

export const command = {
  name: '!enano',
  description: 'Envía una imagen graciosa',
  execute: async (msg: Message) => {
    const media = await MessageMedia.fromUrl(
      'http://fotos.perfil.com//2019/10/16/900/0/maxi-martinez-7-10162019-791630.jpg',
    );
    await msg.reply('[bot] Aquí te va el enano del Boca que te hace un asado.');
    await msg.reply(media, msg.from);
  },
};
