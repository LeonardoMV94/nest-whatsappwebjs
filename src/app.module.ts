import { Module } from '@nestjs/common';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [WhatsappModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
