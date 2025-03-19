import { readdir } from 'fs/promises';
import { join, resolve } from 'node:path';
import { CommandHandler } from '../types/CommandHandler';
import { Message } from 'whatsapp-web.js';
import { PathLike } from 'node:fs';
import { Logger } from '@nestjs/common';
// Definir la estructura esperada para los módulos de comandos
interface CommandModule {
  command: {
    name: string;
    description: string;
    execute: (msg: Message) => Promise<void>;
  };
}
const logger = new Logger('loadCommands');

export async function loadCommands() {
  const commands = new Map<string, CommandHandler>();
  const commandDir: PathLike = resolve(__dirname); // Resolución explícita de la ruta
  const commandFiles = (await readdir(commandDir)).filter((file) => {
    return (
      (file.endsWith('.js') ||
        (process.env.NODE_ENV === 'development' && file.endsWith('.ts'))) &&
      file !== 'index.js' &&
      file !== 'index.ts'
    );
  });
  for (const file of commandFiles) {
    const filePath = join(__dirname, file);
    logger.log(`Loading command: ${file}`);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const filesCommand = (await import(filePath)) as CommandModule;
    logger.log(`Loaded command: ${JSON.stringify(filesCommand)}`);
    const { command } = filesCommand;
    if (command && command.name) {
      commands.set(command.name, command.execute);
    }
  }
  logger.log(`Loaded ${commands.size} commands`);
  return commands;
}
