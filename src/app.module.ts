import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Paciente } from './entities/paciente.entity.js';
import { Atendimento } from './entities/atendimento.entity.js';
import { Profissional } from './entities/profissional.entity.js';
import { Triagem } from './entities/triagem.entity.js';
import { FilaModule } from './fila/fila.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'ubs'),
        entities: [Paciente, Atendimento, Profissional, Triagem],
        synchronize: false,
      }),
    }),
    FilaModule,
  ],
})
export class AppModule {}
