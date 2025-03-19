import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { ConfigModule } from '@nestjs/config';
import { WhatsappEventService } from './listeners/whatsapp-event.service';
import { WhatsappStateService } from './whatsapp-state.service';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true, // Permite eventos con puntos
      delimiter: '.', // Define el delimitador de eventos
    }),
  ],
  controllers: [WhatsappController],
  providers: [
    {
      provide: WhatsappService,
      useFactory: async (eventEmitter: EventEmitter2) => {
        const service = new WhatsappService(eventEmitter);
        await service.initialize(); // Esperar inicialización
        return service;
      },
      inject: [EventEmitter2], // Inyectar EventEmitter2
    },
    WhatsappEventService,
    WhatsappStateService,
  ],
})
export class WhatsappModule {}
